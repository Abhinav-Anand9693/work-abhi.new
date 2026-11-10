/**
 * WorkAbhi Production-Grade Monotonic ETA Estimation System
 * Implements Exponentially Weighted Moving Average (EWMA), monotonic clock timing,
 * batch workload smoothing, state resets, and progress updates with actual metrics.
 */

import { SmoothEtaCalculator, BatchEtaTracker, formatEta } from "./etaEngine";

export * from "./etaEngine";
export { SmoothEtaCalculator, BatchEtaTracker, formatEta };
export default SmoothEtaCalculator;
