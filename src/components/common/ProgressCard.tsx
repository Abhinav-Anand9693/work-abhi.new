import React from "react";
import { Loader2, XCircle, Gauge, Clock, Zap } from "lucide-react";

export interface ProgressCardProps {
  progress: number; // 0 to 1 or 0 to 100
  title?: string;
  stage?: string;
  message?: string;
  elapsedSeconds?: number;
  estimatedRemainingSeconds?: number;
  speedFormatted?: string;
  onCancel?: () => void;
  deviceOptimized?: boolean;
}

export function formatTime(seconds?: number): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) {
    return "Calculating...";
  }
  const s = Math.round(seconds);
  if (s < 1) return "< 1s";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remSec = s % 60;
  return `${m}m ${remSec}s`;
}

export default function ProgressCard({
  progress: rawProgress,
  title = "Processing File",
  stage,
  message,
  elapsedSeconds,
  estimatedRemainingSeconds,
  speedFormatted,
  onCancel,
  deviceOptimized = true,
}: ProgressCardProps) {
  // Normalize progress to 0-100
  const pct = Math.max(0, Math.min(100, Math.round(rawProgress > 1 ? rawProgress : rawProgress * 100)));

  // Smooth monotonic ETA countdown state
  const [displayedEta, setDisplayedEta] = React.useState<number | undefined>(estimatedRemainingSeconds);
  const etaRef = React.useRef<number | undefined>(estimatedRemainingSeconds);

  React.useEffect(() => {
    if (estimatedRemainingSeconds === undefined || estimatedRemainingSeconds <= 0) return;

    if (etaRef.current === undefined || etaRef.current <= 0) {
      etaRef.current = estimatedRemainingSeconds;
      setDisplayedEta(estimatedRemainingSeconds);
    } else {
      // Exponential smoothing: 80% previous + 20% new
      const smoothed = Math.round(etaRef.current * 0.8 + estimatedRemainingSeconds * 0.2);
      // Strictly prevent sudden upward jumping (clamp upward movement to max +1 sec)
      const clamped = Math.min(etaRef.current + 1, smoothed);
      etaRef.current = clamped;
      setDisplayedEta(clamped);
    }
  }, [estimatedRemainingSeconds]);

  // Tick down every second so remaining time counts down predictably (10s -> 9s -> 8s...)
  React.useEffect(() => {
    if (pct >= 100) {
      setDisplayedEta(0);
      return;
    }
    const timer = setInterval(() => {
      setDisplayedEta((prev) => {
        if (prev === undefined || prev <= 1) return prev;
        const next = prev - 1;
        etaRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [pct]);

  return (
    <div className="w-full my-6 p-5 sm:p-6 rounded-2xl border border-primary/20 bg-card/95 backdrop-blur shadow-lg transition-all animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-semibold text-foreground">{title}</h4>
              {stage && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/15 text-primary capitalize">
                  {stage.replace(/-/g, " ")}
                </span>
              )}
            </div>
            {message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{message}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-primary">{pct}%</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Meta Stats: Time Remaining, Elapsed, Speed, Device Mode */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
          <span>
            Remaining:{" "}
            <strong className="text-foreground font-semibold">
              {pct >= 100
                ? "Done!"
                : displayedEta !== undefined && displayedEta > 0
                ? `~${formatTime(displayedEta)}`
                : "Calculating..."}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
          <span>
            Elapsed:{" "}
            <strong className="text-foreground font-semibold">
              {elapsedSeconds !== undefined ? formatTime(elapsedSeconds) : "0s"}
            </strong>
          </span>
        </div>

        {speedFormatted && (
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Speed: <strong className="text-foreground font-semibold">{speedFormatted}</strong>
            </span>
          </div>
        )}

        {deviceOptimized && (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              Mode: <strong className="text-foreground font-semibold">Low-RAM Safe</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
