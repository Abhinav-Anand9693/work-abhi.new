/**
 * WorkAbhi Web Worker Orchestrator - Type Definitions
 * Defines protocols, tasks, and interfaces for background thread processing.
 */

export type WorkerTaskType =
  | "IMAGE_FILTER"
  | "IMAGE_TRANSFORM"
  | "IMAGE_PALETTE"
  | "IMAGE_RESIZE"
  | "DATA_CONVERT"
  | "DATA_PARSE"
  | "HASH_COMPUTE"
  | "AUDIO_FILTER"
  | "AUDIO_ENCODE_WAV"
  | "PDF_TEXT_EXTRACT"
  | "PDF_PAGES_PROCESS"
  | "GENERIC_TASK";

export interface WorkerProgressPayload {
  taskId: string;
  progress: number; // 0 to 1
  stage: string;
  message: string;
  elapsedSeconds?: number;
  estimatedRemainingSeconds?: number;
  speedFormatted?: string;
}

export interface WorkerTaskRequest {
  id: string;
  type: WorkerTaskType;
  payload: any;
  timestamp: number;
}

export interface WorkerTaskResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  transferList?: Transferable[];
}

export interface WorkerStats {
  hardwareConcurrency: number;
  maxWorkers: number;
  activeWorkers: number;
  queuedTasks: number;
  completedTasks: number;
  totalOffloadTimeMs: number;
  isSupported: boolean;
}

export interface OrchestratorTaskOptions {
  signal?: AbortSignal;
  onProgress?: (progress: WorkerProgressPayload) => void;
  transferList?: Transferable[];
  priority?: "high" | "normal" | "low";
}
