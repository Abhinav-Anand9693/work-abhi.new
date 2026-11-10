/**
 * WorkAbhi Global Web Worker Orchestrator
 * Coordinates a background worker pool to offload heavy image, video, PDF,
 * and data computations away from the UI thread, ensuring a permanent 60 FPS UI.
 */

import type {
  WorkerTaskType,
  WorkerTaskRequest,
  WorkerTaskResponse,
  WorkerProgressPayload,
  WorkerStats,
  OrchestratorTaskOptions,
} from "./workerTypes";

interface WorkerSlot {
  id: number;
  worker: Worker | null;
  busy: boolean;
  currentTaskId: string | null;
  activeSince: number | null;
}

interface QueuedTask {
  request: WorkerTaskRequest;
  options?: OrchestratorTaskOptions;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  transferList?: Transferable[];
}

export class WorkerOrchestrator {
  private static instance: WorkerOrchestrator | null = null;
  private workers: WorkerSlot[] = [];
  private taskQueue: QueuedTask[] = [];
  private activeTasks = new Map<string, QueuedTask>();
  private completedCount = 0;
  private totalOffloadTimeMs = 0;
  private listeners = new Set<(stats: WorkerStats) => void>();
  private isSupported = typeof window !== "undefined" && typeof Worker !== "undefined";
  private maxWorkers = 2;

  private constructor() {
    if (typeof window !== "undefined") {
      const cores = navigator.hardwareConcurrency || 4;
      // Clamp pool size between 2 and 4 to remain safe on lower-RAM devices
      this.maxWorkers = Math.max(1, Math.min(4, Math.floor(cores / 2) || 2));
      this.initializePool();
    }
  }

  public static getInstance(): WorkerOrchestrator {
    if (!WorkerOrchestrator.instance) {
      WorkerOrchestrator.instance = new WorkerOrchestrator();
    }
    return WorkerOrchestrator.instance;
  }

  /**
   * Initialize worker slots
   */
  private initializePool(): void {
    if (!this.isSupported) return;

    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorkerSlot(i);
    }
  }

  /**
   * Spawn a new worker instance safely
   */
  private createWorkerSlot(index: number): WorkerSlot {
    let worker: Worker | null = null;

    try {
      // Use standard Vite worker instantiation
      worker = new Worker(new URL("./taskWorker.ts", import.meta.url), {
        type: "module",
      });

      worker.onmessage = (e: MessageEvent) => {
        this.handleWorkerMessage(index, e.data);
      };

      worker.onerror = (err) => {
        console.warn(`[WorkerOrchestrator] Worker #${index} error:`, err);
        this.handleWorkerError(index, err);
      };
    } catch (e) {
      console.warn(`[WorkerOrchestrator] Could not spawn background worker #${index}. Using main thread fallback.`, e);
      worker = null;
    }

    const slot: WorkerSlot = {
      id: index,
      worker,
      busy: false,
      currentTaskId: null,
      activeSince: null,
    };

    this.workers[index] = slot;
    return slot;
  }

  /**
   * Process incoming messages from workers
   */
  private handleWorkerMessage(slotIndex: number, data: any): void {
    const slot = this.workers[slotIndex];
    if (!slot || !data) return;

    if (data.type === "WORKER_PROGRESS") {
      const progress: WorkerProgressPayload = data.payload;
      const activeTask = this.activeTasks.get(progress.taskId);
      if (activeTask && activeTask.options?.onProgress) {
        activeTask.options.onProgress(progress);
      }
      return;
    }

    if (data.type === "WORKER_RESULT") {
      const res: WorkerTaskResponse = data;
      const activeTask = this.activeTasks.get(res.id);

      if (slot.activeSince) {
        this.totalOffloadTimeMs += performance.now() - slot.activeSince;
      }

      slot.busy = false;
      slot.currentTaskId = null;
      slot.activeSince = null;
      this.completedCount++;

      if (activeTask) {
        this.activeTasks.delete(res.id);
        activeTask.resolve(res.result);
      }

      this.notifyListeners();
      this.processNextInQueue();
      return;
    }

    if (data.type === "WORKER_ERROR") {
      const res: WorkerTaskResponse = data;
      const activeTask = this.activeTasks.get(res.id);

      slot.busy = false;
      slot.currentTaskId = null;
      slot.activeSince = null;

      if (activeTask) {
        this.activeTasks.delete(res.id);
        activeTask.reject(new Error(res.error || "Background worker error"));
      }

      this.notifyListeners();
      this.processNextInQueue();
      return;
    }
  }

  /**
   * Handle unexpected worker crash and respawn
   */
  private handleWorkerError(slotIndex: number, err: any): void {
    const slot = this.workers[slotIndex];
    if (slot && slot.currentTaskId) {
      const activeTask = this.activeTasks.get(slot.currentTaskId);
      if (activeTask) {
        this.activeTasks.delete(slot.currentTaskId);
        activeTask.reject(new Error("Worker terminated unexpectedly"));
      }
    }

    try {
      slot?.worker?.terminate();
    } catch {
      // ignore
    }

    // Respawn fresh worker
    this.createWorkerSlot(slotIndex);
    this.notifyListeners();
    this.processNextInQueue();
  }

  /**
   * Pull and execute the next task in queue
   */
  private processNextInQueue(): void {
    if (!this.taskQueue.length) return;

    const availableSlot = this.workers.find((w) => w.worker && !w.busy);
    if (!availableSlot || !availableSlot.worker) return;

    const task = this.taskQueue.shift();
    if (!task) return;

    // Check if task was aborted while waiting in queue
    if (task.options?.signal?.aborted) {
      task.reject(new DOMException("Task aborted", "AbortError"));
      this.processNextInQueue();
      return;
    }

    availableSlot.busy = true;
    availableSlot.currentTaskId = task.request.id;
    availableSlot.activeSince = performance.now();
    this.activeTasks.set(task.request.id, task);

    // Bind abort handler to cancel running task
    if (task.options?.signal) {
      task.options.signal.addEventListener(
        "abort",
        () => {
          this.cancelTask(task.request.id);
        },
        { once: true }
      );
    }

    try {
      if (task.transferList && task.transferList.length > 0) {
        availableSlot.worker.postMessage(task.request, task.transferList);
      } else {
        availableSlot.worker.postMessage(task.request);
      }
    } catch (postErr) {
      // If transfer fails, fallback without transfer list
      availableSlot.worker.postMessage(task.request);
    }

    this.notifyListeners();
  }

  /**
   * Cancel task and recycle worker slot if running
   */
  public cancelTask(taskId: string): void {
    // 1. Remove from queue if pending
    const queueIdx = this.taskQueue.findIndex((t) => t.request.id === taskId);
    if (queueIdx !== -1) {
      const [removed] = this.taskQueue.splice(queueIdx, 1);
      removed.reject(new DOMException("Task cancelled", "AbortError"));
      this.notifyListeners();
      return;
    }

    // 2. If actively executing on a worker, terminate and respawn to abort immediately
    const slot = this.workers.find((w) => w.currentTaskId === taskId);
    if (slot) {
      try {
        slot.worker?.terminate();
      } catch {
        // ignore
      }
      const activeTask = this.activeTasks.get(taskId);
      if (activeTask) {
        this.activeTasks.delete(taskId);
        activeTask.reject(new DOMException("Task cancelled", "AbortError"));
      }
      this.createWorkerSlot(slot.id);
      this.notifyListeners();
      this.processNextInQueue();
    }
  }

  /**
   * Dispatch a generic task to the worker pool
   */
  public executeTask<T = any>(
    type: WorkerTaskType,
    payload: any,
    options?: OrchestratorTaskOptions
  ): Promise<T> {
    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (options?.signal?.aborted) {
      return Promise.reject(new DOMException("Task cancelled", "AbortError"));
    }

    // If workers are unsupported, execute synchronously on main thread fallback
    const hasActiveWorkers = this.workers.some((w) => w.worker !== null);
    if (!this.isSupported || !hasActiveWorkers) {
      return this.executeFallbackOnMainThread<T>(type, payload, options);
    }

    return new Promise<T>((resolve, reject) => {
      const request: WorkerTaskRequest = {
        id,
        type,
        payload,
        timestamp: Date.now(),
      };

      const queued: QueuedTask = {
        request,
        options,
        resolve,
        reject,
        transferList: options?.transferList,
      };

      if (options?.priority === "high") {
        this.taskQueue.unshift(queued);
      } else {
        this.taskQueue.push(queued);
      }

      this.notifyListeners();
      this.processNextInQueue();
    });
  }

  /**
   * Graceful fallback when Web Workers are blocked or unavailable
   */
  private async executeFallbackOnMainThread<T>(
    type: WorkerTaskType,
    payload: any,
    options?: OrchestratorTaskOptions
  ): Promise<T> {
    options?.onProgress?.({
      taskId: "fallback",
      progress: 0.5,
      stage: "processing",
      message: "Executing on main thread (Worker fallback)...",
    });

    if (type === "HASH_COMPUTE") {
      const results: Record<string, string> = {};
      const { buffer, algorithms = ["SHA-256"] } = payload;
      for (const algo of algorithms) {
        const hashBuf = await crypto.subtle.digest(algo, buffer);
        results[algo] = Array.from(new Uint8Array(hashBuf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      }
      return results as any;
    }

    if (type === "DATA_CONVERT") {
      const { text, from, to } = payload;
      let rows: any[] = [];
      if (from === "json") {
        rows = JSON.parse(text);
      } else {
        const delim = from === "tsv" ? "\t" : ",";
        const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
        const headers = lines[0].split(delim);
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(delim);
          const row: any = {};
          headers.forEach((h: string, j: number) => {
            row[h] = vals[j] ?? "";
          });
          rows.push(row);
        }
      }
      const delim = to === "tsv" ? "\t" : ",";
      let result = to === "json" ? JSON.stringify(rows, null, 2) : "";
      if (to !== "json" && rows.length > 0) {
        const headers = Object.keys(rows[0]);
        result = [headers.join(delim), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(delim))].join("\n");
      }
      return { result, rowCount: rows.length } as any;
    }

    return payload as T;
  }

  /**
   * Helper: Run Image Filter on background thread
   */
  public runImageFilter(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    filter: string,
    params?: any,
    options?: OrchestratorTaskOptions
  ): Promise<{ pixels: Uint8ClampedArray; width: number; height: number }> {
    return this.executeTask(
      "IMAGE_FILTER",
      { pixels, width, height, filter, params },
      {
        ...options,
        transferList: [pixels.buffer],
      }
    );
  }

  /**
   * Helper: Run Image Palette extraction on background thread
   */
  public runImagePalette(
    pixels: Uint8ClampedArray,
    count = 6,
    options?: OrchestratorTaskOptions
  ): Promise<{ dominant: string; palette: string[] }> {
    return this.executeTask(
      "IMAGE_PALETTE",
      { pixels, count },
      {
        ...options,
        transferList: [pixels.buffer],
      }
    );
  }

  /**
   * Helper: Run cryptographic file hashing on background thread
   */
  public runHashCompute(
    buffer: ArrayBuffer,
    algorithms = ["SHA-256", "SHA-1"],
    options?: OrchestratorTaskOptions
  ): Promise<Record<string, string>> {
    return this.executeTask(
      "HASH_COMPUTE",
      { buffer, algorithms },
      {
        ...options,
        transferList: [buffer],
      }
    );
  }

  /**
   * Helper: Run Data Conversion on background thread
   */
  public runDataConvert(
    text: string,
    from: "csv" | "tsv" | "json",
    to: "csv" | "tsv" | "json",
    options?: OrchestratorTaskOptions
  ): Promise<{ result: string; rowCount: number }> {
    return this.executeTask("DATA_CONVERT", { text, from, to }, options);
  }

  /**
   * Get current real-time stats
   */
  public getStats(): WorkerStats {
    const active = this.workers.filter((w) => w.busy).length;
    return {
      hardwareConcurrency: typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4,
      maxWorkers: this.maxWorkers,
      activeWorkers: active,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedCount,
      totalOffloadTimeMs: Math.round(this.totalOffloadTimeMs),
      isSupported: this.isSupported && this.workers.some((w) => w.worker !== null),
    };
  }

  /**
   * Subscribe to worker stats updates
   */
  public subscribe(callback: (stats: WorkerStats) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStats());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach((cb) => {
      try {
        cb(stats);
      } catch {
        // ignore
      }
    });
  }
}

export const orchestrator = WorkerOrchestrator.getInstance();
