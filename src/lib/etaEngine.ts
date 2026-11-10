/**
 * WorkAbhi Production-Grade Monotonic ETA Estimation Engine
 * 
 * Key Features:
 * 1. Historical throughput tracking via Exponentially Weighted Moving Average (EWMA).
 * 2. Weighted workload estimation (byte sizes, pixel counts, or custom weights).
 * 3. Decoupled Internal ETA (physics/rate based) vs Displayed ETA (monotonically smoothed).
 * 4. Anti-oscillation & Monotonic countdown policy under normal processing:
 *    displayedETA = min(previousDisplayedETA, nextSmoothedETA)
 * 5. Safeguards:
 *    - Never display 0 seconds while substantial work remains (progress < 99%).
 *    - Persistent slowdown detection: smoothly steps upward if throughput genuine drops > 35% for > 2.5s.
 *    - Warmup guard: displays "Calculating..." during initial worker spin-up / buffer read.
 *    - Handles corrupted progress inputs (NaN, negative, backwards, >1.0) gracefully.
 *    - Full batch & multi-item concurrency or sequential tracking.
 *    - Pause/Resume tracking (excludes paused time from active throughput calculations).
 *    - Injected monotonic clock for deterministic unit testing.
 */

export type EtaLifecycleState =
  | "idle"
  | "warmup"
  | "active"
  | "paused"
  | "completed"
  | "error"
  | "cancelled";

export interface WorkItem {
  id: string;
  weight: number;
  size?: number;
  name?: string;
  progress?: number; // 0 to 1
  completed?: boolean;
  failed?: boolean;
  active?: boolean;
}

export interface EtaSnapshot {
  state: EtaLifecycleState;
  progress: number; // 0.0 to 1.0 (aggregate normalized)
  percentage: number; // 0 to 100 (integer)
  elapsedSeconds: number;
  internalEtaSeconds?: number;
  displayedRemainingSeconds?: number;
  formattedRemaining: string;
  speedFormatted?: string;
  isCalculating: boolean;
  completedItems: number;
  totalItems: number;
}

export interface EtaEngineOptions {
  /**
   * EWMA alpha smoothing factor for throughput (0.05 to 0.5, default 0.22)
   */
  throughputAlpha?: number;
  /**
   * Display smoothing beta factor (default 0.25)
   */
  displayBeta?: number;
  /**
   * Minimum seconds of activity before producing the first ETA (default 1.2s)
   */
  warmupSeconds?: number;
  /**
   * Minimum progress fraction before producing the first ETA (default 0.03)
   */
  warmupProgress?: number;
  /**
   * Clock provider function returning monotonic milliseconds (default performance.now)
   */
  now?: () => number;
}

/**
 * Format remaining seconds into a clean, professional string
 */
export function formatEta(
  seconds?: number,
  options?: { verbose?: boolean; doneMessage?: string }
): string {
  const doneMsg = options?.doneMessage || "Done!";
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return "Calculating...";
  }

  if (seconds <= 0) return doneMsg;
  if (seconds < 1) return "< 1s";

  const s = Math.round(seconds);

  if (s < 60) {
    return options?.verbose ? `About ${s}s remaining` : `${s}s`;
  }

  const m = Math.floor(s / 60);
  const remSec = s % 60;

  if (m < 60) {
    if (remSec === 0) {
      return options?.verbose ? `About ${m}m remaining` : `${m}m`;
    }
    return options?.verbose ? `~${m}m ${remSec}s remaining` : `${m}m ${remSec}s`;
  }

  const h = Math.floor(m / 60);
  const remMin = m % 60;
  return options?.verbose ? `About ${h}h ${remMin}m remaining` : `${h}h ${remMin}m`;
}

/**
 * Single-stream Smooth ETA Calculator
 * Suitable for single tasks, video transcoding, audio conversion, data transforms.
 */
export class SmoothEtaCalculator {
  private now: () => number;
  private state: EtaLifecycleState = "idle";
  private startTime: number = 0;
  private lastProgressTime: number = 0;
  private lastTickTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedDurationMs: number = 0;

  private currentProgress: number = 0;
  private smoothedThroughput: number = 0; // progress per second
  private internalEta: number | undefined = undefined;
  private displayedEta: number | undefined = undefined;

  // Persistent slowdown detection
  private slowdownStartTime: number = 0;

  // Options
  private throughputAlpha: number;
  private displayBeta: number;
  private warmupSeconds: number;
  private warmupProgress: number;

  constructor(options: EtaEngineOptions = {}) {
    this.now = options.now || (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));
    this.throughputAlpha = Math.max(0.05, Math.min(0.9, options.throughputAlpha ?? 0.22));
    this.displayBeta = Math.max(0.05, Math.min(0.9, options.displayBeta ?? 0.25));
    this.warmupSeconds = Math.max(0.2, options.warmupSeconds ?? 1.2);
    this.warmupProgress = Math.max(0.01, Math.min(0.2, options.warmupProgress ?? 0.03));
    this.reset();
  }

  public reset(): void {
    this.state = "idle";
    this.startTime = 0;
    this.lastProgressTime = 0;
    this.lastTickTime = 0;
    this.pauseStartTime = 0;
    this.totalPausedDurationMs = 0;
    this.currentProgress = 0;
    this.smoothedThroughput = 0;
    this.internalEta = undefined;
    this.displayedEta = undefined;
    this.slowdownStartTime = 0;
  }

  public start(): void {
    this.reset();
    const t = this.now();
    this.startTime = t;
    this.lastProgressTime = t;
    this.lastTickTime = t;
    this.state = "warmup";
  }

  public pause(): void {
    if (this.state === "paused" || this.state === "completed" || this.state === "cancelled") return;
    this.pauseStartTime = this.now();
    this.state = "paused";
  }

  public resume(): void {
    if (this.state !== "paused") return;
    const now = this.now();
    if (this.pauseStartTime > 0) {
      this.totalPausedDurationMs += Math.max(0, now - this.pauseStartTime);
      this.pauseStartTime = 0;
    }
    this.lastTickTime = now;
    this.state = this.currentProgress >= this.warmupProgress ? "active" : "warmup";
  }

  public cancel(): void {
    this.state = "cancelled";
  }

  public error(): void {
    this.state = "error";
  }

  public complete(): void {
    this.currentProgress = 1.0;
    this.internalEta = 0;
    this.displayedEta = 0;
    this.state = "completed";
  }

  /**
   * Get active elapsed seconds (excluding pauses)
   */
  public getActiveElapsedSeconds(): number {
    if (!this.startTime) return 0;
    const now = this.now();
    let currentPause = 0;
    if (this.state === "paused" && this.pauseStartTime > 0) {
      currentPause = now - this.pauseStartTime;
    }
    const elapsedMs = now - this.startTime - this.totalPausedDurationMs - currentPause;
    return Math.max(0, elapsedMs / 1000);
  }

  /**
   * Update progress with safety normalization and EWMA smoothing
   * @param rawProgress Number between 0.0 and 1.0 (or 0 and 100)
   */
  public update(rawProgress: number): { elapsedSeconds: number; remainingSeconds: number } {
    if (this.state === "paused" || this.state === "cancelled" || this.state === "error") {
      return {
        elapsedSeconds: Math.round(this.getActiveElapsedSeconds()),
        remainingSeconds: this.displayedEta ?? 0,
      };
    }

    // Auto-start if not started
    if (!this.startTime) {
      this.start();
    }

    // Normalize progress safely: handle NaN, infinity, and 0-100 scales
    let p = Number(rawProgress);
    if (isNaN(p) || !isFinite(p) || p < 0) {
      p = this.currentProgress;
    } else if (p > 1.0 && p <= 100.0) {
      p = p / 100.0;
    } else {
      p = Math.min(1.0, Math.max(0, p));
    }

    const now = this.now();
    const elapsed = this.getActiveElapsedSeconds();

    // Check completion
    if (p >= 0.999) {
      this.complete();
      return { elapsedSeconds: Math.round(elapsed), remainingSeconds: 0 };
    }

    // If progress is near zero or in warmup, keep baseline
    if (elapsed < this.warmupSeconds || p < this.warmupProgress) {
      this.currentProgress = p;
      this.lastProgressTime = now;
      this.state = "warmup";
      return { elapsedSeconds: Math.round(elapsed), remainingSeconds: 0 };
    }

    this.state = "active";

    // Calculate instantaneous speed sample over active elapsed time
    const sampleSpeed = p / Math.max(0.1, elapsed);

    if (this.smoothedThroughput <= 0) {
      this.smoothedThroughput = sampleSpeed;
    } else {
      // EWMA update
      this.smoothedThroughput =
        this.throughputAlpha * sampleSpeed + (1 - this.throughputAlpha) * this.smoothedThroughput;
    }

    // Calculate Internal ETA (physics-based)
    const remainingFraction = Math.max(0, 1 - p);
    const calculatedInternal = Math.max(0.1, remainingFraction / Math.max(0.0001, this.smoothedThroughput));
    this.internalEta = calculatedInternal;

    // Apply temporal smoothing to candidate displayed ETA
    if (this.displayedEta === undefined) {
      this.displayedEta = Math.max(1, Math.round(calculatedInternal));
    } else {
      const smoothedCandidate =
        this.displayBeta * calculatedInternal + (1 - this.displayBeta) * this.displayedEta;

      // Monotonic policy: under normal circumstances, displayed ETA should not jump upward
      if (smoothedCandidate <= this.displayedEta) {
        this.displayedEta = Math.max(1, Math.round(smoothedCandidate));
        this.slowdownStartTime = 0;
      } else {
        // Candidate is HIGHER than currently displayed ETA. Check for genuine persistent slowdown!
        if (this.slowdownStartTime === 0) {
          this.slowdownStartTime = now;
        } else if ((now - this.slowdownStartTime) > 2500 && calculatedInternal > this.displayedEta * 1.35) {
          // Slowdown confirmed: allow gradual, smooth upward crawl (max +1 per update) so we don't lie
          this.displayedEta = Math.min(Math.round(calculatedInternal), this.displayedEta + 1);
        }
      }
    }

    // Safeguard: clamp to at least 1 second while work remains
    if (p < 0.99 && this.displayedEta <= 0) {
      this.displayedEta = 1;
    }

    this.currentProgress = p;
    this.lastProgressTime = now;
    this.lastTickTime = now;

    return {
      elapsedSeconds: Math.round(elapsed),
      remainingSeconds: Math.max(0, Math.round(this.displayedEta ?? calculatedInternal)),
    };
  }

  /**
   * Periodic clock tick (call once per second to smoothly decrement displayed ETA)
   */
  public tick(): number {
    if (this.state !== "active") {
      return this.displayedEta ?? 0;
    }

    const now = this.now();
    const elapsedSinceTick = (now - this.lastTickTime) / 1000;

    if (elapsedSinceTick >= 0.95 && this.displayedEta !== undefined && this.displayedEta > 1) {
      const decrement = Math.floor(elapsedSinceTick);
      // Decrement displayed ETA smoothly, never dropping below 1s while active
      this.displayedEta = Math.max(1, this.displayedEta - decrement);
      this.lastTickTime = now;
    }

    return Math.max(0, this.displayedEta ?? 0);
  }

  public getSnapshot(): EtaSnapshot {
    const elapsed = this.getActiveElapsedSeconds();
    const p = this.currentProgress;
    const isCalculating = this.state === "warmup" || this.state === "idle" || this.displayedEta === undefined;

    let speedStr = "";
    if (this.smoothedThroughput > 0 && !isCalculating) {
      speedStr = `${(this.smoothedThroughput * 100).toFixed(0)}% / s`;
    }

    return {
      state: this.state,
      progress: p,
      percentage: Math.round(p * 100),
      elapsedSeconds: Math.round(elapsed),
      internalEtaSeconds: this.internalEta,
      displayedRemainingSeconds: isCalculating ? undefined : this.displayedEta,
      formattedRemaining: isCalculating
        ? "Calculating..."
        : this.state === "completed"
        ? "Done!"
        : formatEta(this.displayedEta),
      speedFormatted: speedStr || undefined,
      isCalculating,
      completedItems: p >= 1.0 ? 1 : 0,
      totalItems: 1,
    };
  }
}

/**
 * Batch ETA Tracker
 * Purpose-built for multi-item tasks (e.g. batch image compression, batch format conversion).
 * Tracks completed items, active item progress, and weights by byte size or pixel count.
 */
export class BatchEtaTracker {
  private now: () => number;
  private state: EtaLifecycleState = "idle";
  private items: Map<string, WorkItem> = new Map();
  private totalWeight: number = 0;
  private completedWeight: number = 0;

  private startTime: number = 0;
  private lastTickTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedDurationMs: number = 0;

  private smoothedThroughput: number = 0; // weight units per second
  private internalEta: number | undefined = undefined;
  private displayedEta: number | undefined = undefined;
  private slowdownStartTime: number = 0;

  private throughputAlpha: number;
  private displayBeta: number;
  private warmupSeconds: number;
  private warmupProgress: number;

  constructor(
    initialItems: Array<{ id: string; weight?: number; size?: number; name?: string }> = [],
    options: EtaEngineOptions = {}
  ) {
    this.now = options.now || (() => (typeof performance !== "undefined" ? performance.now() : Date.now()));
    this.throughputAlpha = Math.max(0.05, Math.min(0.9, options.throughputAlpha ?? 0.22));
    this.displayBeta = Math.max(0.05, Math.min(0.9, options.displayBeta ?? 0.25));
    this.warmupSeconds = Math.max(0.2, options.warmupSeconds ?? 1.0);
    this.warmupProgress = Math.max(0.01, Math.min(0.2, options.warmupProgress ?? 0.02));

    if (initialItems.length > 0) {
      this.initItems(initialItems);
    }
  }

  public initItems(items: Array<{ id: string; weight?: number; size?: number; name?: string }>): void {
    this.items.clear();
    this.totalWeight = 0;
    this.completedWeight = 0;

    for (const item of items) {
      // Ensure positive weight: byte size or 1.0
      const w = Math.max(1, Number(item.weight ?? item.size ?? 1));
      this.items.set(item.id, {
        id: item.id,
        weight: w,
        size: item.size,
        name: item.name,
        progress: 0,
        completed: false,
        failed: false,
        active: false,
      });
      this.totalWeight += w;
    }
  }

  public addItem(item: { id: string; weight?: number; size?: number; name?: string }): void {
    const w = Math.max(1, Number(item.weight ?? item.size ?? 1));
    this.items.set(item.id, {
      id: item.id,
      weight: w,
      size: item.size,
      name: item.name,
      progress: 0,
      completed: false,
      failed: false,
      active: false,
    });
    this.totalWeight += w;
    // Allow displayed ETA to re-anchor since total workload changed
    this.slowdownStartTime = 0;
  }

  public start(): void {
    const t = this.now();
    this.startTime = t;
    this.lastTickTime = t;
    this.state = "warmup";
    this.completedWeight = 0;
    this.smoothedThroughput = 0;
    this.internalEta = undefined;
    this.displayedEta = undefined;
    this.totalPausedDurationMs = 0;
    this.pauseStartTime = 0;
    this.slowdownStartTime = 0;
  }

  public pause(): void {
    if (this.state === "paused" || this.state === "completed" || this.state === "cancelled") return;
    this.pauseStartTime = this.now();
    this.state = "paused";
  }

  public resume(): void {
    if (this.state !== "paused") return;
    const now = this.now();
    if (this.pauseStartTime > 0) {
      this.totalPausedDurationMs += Math.max(0, now - this.pauseStartTime);
      this.pauseStartTime = 0;
    }
    this.lastTickTime = now;
    this.state = "active";
  }

  public cancel(): void {
    this.state = "cancelled";
  }

  public error(): void {
    this.state = "error";
  }

  public startItem(id: string): void {
    const it = this.items.get(id);
    if (it) {
      it.active = true;
    }
    if (this.state === "idle") {
      this.start();
    }
  }

  public updateItemProgress(id: string, itemProgress: number): void {
    const it = this.items.get(id);
    if (!it) return;

    let p = Number(itemProgress);
    if (isNaN(p) || !isFinite(p) || p < 0) p = it.progress ?? 0;
    else if (p > 1.0 && p <= 100.0) p = p / 100.0;
    else p = Math.min(1.0, Math.max(0, p));

    it.progress = p;
    it.active = true;
    this.recalculate();
  }

  public completeItem(id: string): void {
    const it = this.items.get(id);
    if (!it) return;

    if (!it.completed) {
      it.completed = true;
      it.active = false;
      it.progress = 1.0;
      this.completedWeight += it.weight;
    }
    this.recalculate();
  }

  public failItem(id: string, retryable: boolean = false): void {
    const it = this.items.get(id);
    if (!it) return;

    it.active = false;
    if (!retryable) {
      it.failed = true;
      // Remove its weight from remaining so ETA doesn't stall
      this.totalWeight = Math.max(1, this.totalWeight - (it.weight - (it.progress || 0) * it.weight));
    } else {
      it.progress = 0;
    }
    this.recalculate();
  }

  public getActiveElapsedSeconds(): number {
    if (!this.startTime) return 0;
    const now = this.now();
    let currentPause = 0;
    if (this.state === "paused" && this.pauseStartTime > 0) {
      currentPause = now - this.pauseStartTime;
    }
    const elapsedMs = now - this.startTime - this.totalPausedDurationMs - currentPause;
    return Math.max(0, elapsedMs / 1000);
  }

  /**
   * Recalculate aggregate progress and smooth ETA
   */
  private recalculate(): void {
    if (this.state === "paused" || this.state === "cancelled" || this.state === "error") return;

    const now = this.now();
    const elapsed = this.getActiveElapsedSeconds();

    // Sum currently processed weight across all items
    let processedWeight = 0;
    let completedCount = 0;

    for (const it of this.items.values()) {
      if (it.completed) {
        processedWeight += it.weight;
        completedCount++;
      } else if (it.progress && it.progress > 0) {
        processedWeight += it.weight * it.progress;
      }
    }

    const aggregateFraction =
      this.totalWeight > 0 ? Math.min(1.0, processedWeight / this.totalWeight) : 0;

    if (aggregateFraction >= 0.999 || (this.items.size > 0 && completedCount === this.items.size)) {
      this.state = "completed";
      this.internalEta = 0;
      this.displayedEta = 0;
      return;
    }

    // Warmup guard: wait for enough time or progress before giving initial estimate
    if (elapsed < this.warmupSeconds || aggregateFraction < this.warmupProgress) {
      this.state = "warmup";
      return;
    }

    this.state = "active";

    // Rate in weight-units per second
    const measuredThroughput = processedWeight / Math.max(0.1, elapsed);

    if (this.smoothedThroughput <= 0) {
      this.smoothedThroughput = measuredThroughput;
    } else {
      this.smoothedThroughput =
        this.throughputAlpha * measuredThroughput + (1 - this.throughputAlpha) * this.smoothedThroughput;
    }

    const remainingWeight = Math.max(0, this.totalWeight - processedWeight);
    const calculatedInternal = Math.max(0.1, remainingWeight / Math.max(0.001, this.smoothedThroughput));
    this.internalEta = calculatedInternal;

    if (this.displayedEta === undefined) {
      this.displayedEta = Math.max(1, Math.round(calculatedInternal));
    } else {
      const smoothedCandidate =
        this.displayBeta * calculatedInternal + (1 - this.displayBeta) * this.displayedEta;

      if (smoothedCandidate <= this.displayedEta) {
        this.displayedEta = Math.max(1, Math.round(smoothedCandidate));
        this.slowdownStartTime = 0;
      } else {
        // Slowdown candidate check
        if (this.slowdownStartTime === 0) {
          this.slowdownStartTime = now;
        } else if ((now - this.slowdownStartTime) > 2500 && calculatedInternal > this.displayedEta * 1.35) {
          this.displayedEta = Math.min(Math.round(calculatedInternal), this.displayedEta + 1);
        }
      }
    }

    if (aggregateFraction < 0.99 && this.displayedEta <= 0) {
      this.displayedEta = 1;
    }

    this.lastTickTime = now;
  }

  public tick(): number {
    if (this.state !== "active") {
      return this.displayedEta ?? 0;
    }

    const now = this.now();
    const elapsedSinceTick = (now - this.lastTickTime) / 1000;

    if (elapsedSinceTick >= 0.95 && this.displayedEta !== undefined && this.displayedEta > 1) {
      const decrement = Math.floor(elapsedSinceTick);
      this.displayedEta = Math.max(1, this.displayedEta - decrement);
      this.lastTickTime = now;
    }

    return Math.max(0, this.displayedEta ?? 0);
  }

  public getSnapshot(): EtaSnapshot {
    const elapsed = this.getActiveElapsedSeconds();

    let processedWeight = 0;
    let completedCount = 0;

    for (const it of this.items.values()) {
      if (it.completed) {
        processedWeight += it.weight;
        completedCount++;
      } else if (it.progress && it.progress > 0) {
        processedWeight += it.weight * it.progress;
      }
    }

    const p = this.totalWeight > 0 ? Math.min(1.0, processedWeight / this.totalWeight) : 0;
    const isCalculating = this.state === "warmup" || this.state === "idle" || this.displayedEta === undefined;

    let speedStr = "";
    if (this.smoothedThroughput > 0 && !isCalculating) {
      // Format as MB/s if weights represent bytes (> 10000), else % / s
      if (this.totalWeight > 20000) {
        const mbPerSec = this.smoothedThroughput / (1024 * 1024);
        if (mbPerSec >= 0.1) {
          speedStr = `${mbPerSec.toFixed(1)} MB/s`;
        } else {
          const kbPerSec = this.smoothedThroughput / 1024;
          speedStr = `${kbPerSec.toFixed(0)} KB/s`;
        }
      } else {
        const pctPerSec = (this.smoothedThroughput / this.totalWeight) * 100;
        speedStr = `${pctPerSec.toFixed(0)}% / s`;
      }
    }

    return {
      state: this.state,
      progress: p,
      percentage: Math.round(p * 100),
      elapsedSeconds: Math.round(elapsed),
      internalEtaSeconds: this.internalEta,
      displayedRemainingSeconds: isCalculating ? undefined : this.displayedEta,
      formattedRemaining: isCalculating
        ? "Calculating..."
        : this.state === "completed"
        ? "Done!"
        : formatEta(this.displayedEta),
      speedFormatted: speedStr || undefined,
      isCalculating,
      completedItems: completedCount,
      totalItems: this.items.size,
    };
  }
}
