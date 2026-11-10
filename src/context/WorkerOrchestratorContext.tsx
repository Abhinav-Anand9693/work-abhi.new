import React, { createContext, useContext, useEffect, useState } from "react";
import { orchestrator, WorkerOrchestrator } from "@/workers/workerOrchestrator";
import type { WorkerStats, WorkerTaskType, OrchestratorTaskOptions } from "@/workers/workerTypes";

interface WorkerOrchestratorContextValue {
  orchestrator: WorkerOrchestrator;
  stats: WorkerStats;
  isWorkerBusy: boolean;
  executeTask: <T = any>(type: WorkerTaskType, payload: any, options?: OrchestratorTaskOptions) => Promise<T>;
  cancelTask: (taskId: string) => void;
}

const WorkerOrchestratorContext = createContext<WorkerOrchestratorContextValue | null>(null);

export function WorkerOrchestratorProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<WorkerStats>(() => orchestrator.getStats());

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe((nextStats) => {
      setStats(nextStats);
    });
    return unsubscribe;
  }, []);

  const isWorkerBusy = stats.activeWorkers > 0 || stats.queuedTasks > 0;

  const value: WorkerOrchestratorContextValue = {
    orchestrator,
    stats,
    isWorkerBusy,
    executeTask: (type, payload, options) => orchestrator.executeTask(type, payload, options),
    cancelTask: (taskId) => orchestrator.cancelTask(taskId),
  };

  return (
    <WorkerOrchestratorContext.Provider value={value}>
      {children}
    </WorkerOrchestratorContext.Provider>
  );
}

export function useWorkerOrchestrator(): WorkerOrchestratorContextValue {
  const ctx = useContext(WorkerOrchestratorContext);
  if (!ctx) {
    // If used outside provider, return default singleton directly
    const currentStats = orchestrator.getStats();
    return {
      orchestrator,
      stats: currentStats,
      isWorkerBusy: currentStats.activeWorkers > 0,
      executeTask: (type, payload, options) => orchestrator.executeTask(type, payload, options),
      cancelTask: (taskId) => orchestrator.cancelTask(taskId),
    };
  }
  return ctx;
}
