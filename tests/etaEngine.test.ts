import { describe, it, expect } from "vitest";
import {
  SmoothEtaCalculator,
  BatchEtaTracker,
  formatEta,
} from "../src/lib/eta-engine";

describe("Production-Grade ETA Engine Unit Tests", () => {
  // Mock Monotonic Clock Generator
  function createMockClock(startMs = 1000) {
    let current = startMs;
    return {
      now: () => current,
      advance: (ms: number) => {
        current += ms;
      },
    };
  }

  // 1. Single Image Compression
  it("1. estimates ETA accurately for single image compression", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [{ id: "img-1", weight: 500000, size: 500000, name: "photo.jpg" }],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("img-1");

    // Advance 2 seconds, 40% progress
    clock.advance(2000);
    tracker.updateItemProgress("img-1", 0.4);
    const snap1 = tracker.getSnapshot();
    expect(snap1.state).toBe("active");
    expect(snap1.percentage).toBe(40);
    expect(snap1.displayedRemainingSeconds).toBeGreaterThan(0);
    expect(snap1.displayedRemainingSeconds).toBeLessThan(10);
  });

  // 2. Multiple Identical Images
  it("2. maintains consistent throughput for multiple identical images", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "img-1", weight: 100000, name: "1.jpg" },
        { id: "img-2", weight: 100000, name: "2.jpg" },
        { id: "img-3", weight: 100000, name: "3.jpg" },
      ],
      { now: clock.now }
    );
    tracker.start();

    tracker.startItem("img-1");
    clock.advance(2000);
    tracker.completeItem("img-1");

    const snap1 = tracker.getSnapshot();
    expect(snap1.completedItems).toBe(1);
    expect(snap1.percentage).toBe(33);

    tracker.startItem("img-2");
    clock.advance(2000);
    tracker.completeItem("img-2");

    const snap2 = tracker.getSnapshot();
    expect(snap2.completedItems).toBe(2);
    expect(snap2.percentage).toBe(67);
    expect(snap2.displayedRemainingSeconds).toBeLessThanOrEqual(snap1.displayedRemainingSeconds!);
  });

  // 3. Small Image Followed by Huge Image
  it("3. handles small image followed by huge image without crashing or producing negative ETA", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "small", weight: 10000, size: 10000 },
        { id: "huge", weight: 1000000, size: 1000000 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("small");
    clock.advance(500);
    tracker.completeItem("small");

    // Huge starts
    tracker.startItem("huge");
    clock.advance(1500);
    tracker.updateItemProgress("huge", 0.1);

    const snap = tracker.getSnapshot();
    expect(snap.displayedRemainingSeconds).toBeGreaterThan(0);
  });

  // 4. Huge Image Followed by Small Image
  it("4. handles huge image followed by small image smoothly", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "huge", weight: 1000000, size: 1000000 },
        { id: "small", weight: 20000, size: 20000 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("huge");
    clock.advance(4000);
    tracker.completeItem("huge");

    tracker.startItem("small");
    clock.advance(500);
    tracker.updateItemProgress("small", 0.5);

    const snap = tracker.getSnapshot();
    expect(snap.percentage).toBeGreaterThan(95);
    expect(snap.displayedRemainingSeconds).toBeLessThanOrEqual(5);
  });

  // 5. Worker Warmup Delay
  it("5. guards against wild guesses during worker warmup delay", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [{ id: "1", weight: 100000 }],
      { now: clock.now, warmupSeconds: 1.5, warmupProgress: 0.05 }
    );
    tracker.start();
    clock.advance(300); // Only 300ms elapsed
    tracker.updateItemProgress("1", 0.01);

    const snap = tracker.getSnapshot();
    expect(snap.state).toBe("warmup");
    expect(snap.isCalculating).toBe(true);
    expect(snap.formattedRemaining).toBe("Calculating...");
  });

  // 6. Fluctuating Progress Updates
  it("6. suppresses oscillations during fluctuating progress updates", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now, warmupSeconds: 0.5 });
    calc.start();

    clock.advance(1000);
    calc.update(0.2);
    const eta1 = calc.getSnapshot().displayedRemainingSeconds!;

    clock.advance(200);
    calc.update(0.21); // Slow progress
    const eta2 = calc.getSnapshot().displayedRemainingSeconds!;

    // Monotonic display ensures eta2 is <= eta1
    expect(eta2).toBeLessThanOrEqual(eta1);
  });

  // 7. Stalled Progress
  it("7. prevents countdown from dropping below 1 while work is pending", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now, warmupSeconds: 0.5 });
    calc.start();

    clock.advance(1000);
    calc.update(0.5);

    // Stalled: 10 ticks with no progress
    for (let i = 0; i < 15; i++) {
      clock.advance(1000);
      calc.tick();
    }

    const snap = calc.getSnapshot();
    expect(snap.displayedRemainingSeconds).toBeGreaterThanOrEqual(1);
  });

  // 8. Zero Progress
  it("8. safely handles zero progress without NaN or Infinity", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now });
    calc.start();
    clock.advance(5000);
    const res = calc.update(0);

    expect(Number.isNaN(res.remainingSeconds)).toBe(false);
    expect(Number.isFinite(res.remainingSeconds)).toBe(true);
  });

  // 9. Rapid Burst Progress
  it("9. handles rapid burst progress updates gracefully", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now, warmupSeconds: 0.3 });
    calc.start();

    for (let i = 1; i <= 20; i++) {
      clock.advance(20);
      calc.update(i / 25);
    }

    const snap = calc.getSnapshot();
    expect(snap.percentage).toBe(80);
    expect(snap.displayedRemainingSeconds).toBeDefined();
  });

  // 10. Cancellation
  it("10. updates state to cancelled and stops progression upon cancellation", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker([{ id: "1", weight: 100 }], { now: clock.now });
    tracker.start();
    clock.advance(1000);
    tracker.cancel();

    expect(tracker.getSnapshot().state).toBe("cancelled");
  });

  // 11. Pause and Resume
  it("11. excludes paused duration from active elapsed calculation", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now });
    calc.start();

    clock.advance(2000);
    calc.pause();
    clock.advance(5000); // 5 seconds paused
    calc.resume();
    clock.advance(1000);

    const elapsed = calc.getActiveElapsedSeconds();
    // 2s before pause + 1s after resume = 3s total active time
    expect(Math.round(elapsed)).toBe(3);
  });

  // 12. Retry After Failure
  it("12. recalculates correctly after item failure and retry", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "1", weight: 100 },
        { id: "2", weight: 100 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("1");
    clock.advance(1000);
    tracker.failItem("1", true); // retryable

    expect(tracker.getSnapshot().percentage).toBe(0);
  });

  // 13. Dynamic Addition of Images
  it("13. adjusts total workload when items are added dynamically", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker([{ id: "1", weight: 100 }], { now: clock.now });
    tracker.start();
    tracker.startItem("1");
    clock.advance(1000);
    tracker.completeItem("1");

    expect(tracker.getSnapshot().completedItems).toBe(1);

    // Add item 2 dynamically
    tracker.addItem({ id: "2", weight: 100 });
    expect(tracker.getSnapshot().totalItems).toBe(2);
    expect(tracker.getSnapshot().percentage).toBe(50);
  });

  // 14. Extreme File Sizes
  it("14. handles extreme file sizes (1 byte to 5GB) without numerical overflow", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "tiny", weight: 1 },
        { id: "huge", weight: 5 * 1024 * 1024 * 1024 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("huge");
    clock.advance(2000);
    tracker.updateItemProgress("huge", 0.1);

    const snap = tracker.getSnapshot();
    expect(Number.isFinite(snap.percentage)).toBe(true);
    expect(snap.percentage).toBe(10);
  });

  // 15. High Concurrency
  it("15. tracks multiple concurrent items simultaneously", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "1", weight: 100 },
        { id: "2", weight: 100 },
        { id: "3", weight: 100 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("1");
    tracker.startItem("2");
    tracker.startItem("3");

    clock.advance(1000);
    tracker.updateItemProgress("1", 0.5);
    tracker.updateItemProgress("2", 0.5);
    tracker.updateItemProgress("3", 0.5);

    expect(tracker.getSnapshot().percentage).toBe(50);
  });

  // 16. Sequential Processing
  it("16. advances monotonically through sequential tasks", () => {
    const clock = createMockClock();
    const tracker = new BatchEtaTracker(
      [
        { id: "1", weight: 100 },
        { id: "2", weight: 100 },
      ],
      { now: clock.now }
    );
    tracker.start();
    tracker.startItem("1");
    clock.advance(1000);
    tracker.completeItem("1");

    expect(tracker.getSnapshot().percentage).toBe(50);

    tracker.startItem("2");
    clock.advance(1000);
    tracker.completeItem("2");

    expect(tracker.getSnapshot().percentage).toBe(100);
    expect(tracker.getSnapshot().state).toBe("completed");
  });

  // 17. Near-Completion Progress
  it("17. handles near-completion progress at 99%", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now });
    calc.start();
    clock.advance(10000);
    calc.update(0.99);

    const snap = calc.getSnapshot();
    expect(snap.percentage).toBe(99);
    expect(snap.displayedRemainingSeconds).toBeLessThanOrEqual(1);
  });

  // 18. Completion State
  it("18. immediately marks 0 remaining and Done! at 100% completion", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now });
    calc.start();
    clock.advance(5000);
    calc.update(1.0);

    const snap = calc.getSnapshot();
    expect(snap.state).toBe("completed");
    expect(snap.displayedRemainingSeconds).toBe(0);
    expect(snap.formattedRemaining).toBe("Done!");
  });

  // 19. Corrupted Progress Signals
  it("19. rejects NaN, negative, and out-of-range progress gracefully", () => {
    const clock = createMockClock();
    const calc = new SmoothEtaCalculator({ now: clock.now });
    calc.start();
    clock.advance(1000);

    calc.update(NaN as any);
    calc.update(-0.5 as any);
    calc.update(Infinity as any);

    const snap = calc.getSnapshot();
    expect(Number.isNaN(snap.progress)).toBe(false);
    expect(snap.progress).toBeGreaterThanOrEqual(0);
  });

  // 20. Boundary Values (0%, 1%, 99%, 100%)
  it("20. validates all boundary conditions correctly", () => {
    expect(formatEta(undefined)).toBe("Calculating...");
    expect(formatEta(0)).toBe("Done!");
    expect(formatEta(0.5)).toBe("< 1s");
    expect(formatEta(45)).toBe("45s");
    expect(formatEta(125)).toBe("2m 5s");
  });
});
