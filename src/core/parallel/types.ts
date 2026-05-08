export interface ParallelConfig {
  maxConcurrency: number
  batchSize: number
  timeout: number
  retryCount: number
  retryDelay: number
}

export const DEFAULT_PARALLEL_CONFIG: ParallelConfig = {
  maxConcurrency: 4,
  batchSize: 10,
  timeout: 30000,
  retryCount: 1,
  retryDelay: 100,
}

export interface TaskResult<T> {
  filePath: string
  success: boolean
  result?: T
  error?: Error
  duration: number
  retries: number
}

export interface BatchResult<T> {
  results: TaskResult<T>[]
  totalDuration: number
  successCount: number
  failureCount: number
  averageDuration: number
  minDuration: number
  maxDuration: number
  throughput: number
}

export interface WorkerPoolStats {
  activeTasks: number
  queuedTasks: number
  completedTasks: number
  failedTasks: number
  totalTasks: number
  averageTaskDuration: number
  poolUtilization: number
}

export interface ParallelExecutionOptions {
  config?: Partial<ParallelConfig>
  onProgress?: (completed: number, total: number) => void
  onFileComplete?: (result: TaskResult<unknown>) => void
  onError?: (error: Error, filePath: string) => void
}
