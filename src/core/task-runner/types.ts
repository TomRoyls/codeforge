export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout'

export interface Task<T = unknown> {
  id: string
  name: string
  handler: () => T | Promise<T>
  dependencies: string[]
  priority: number
  timeout: number
  retries: number
  retryDelay: number
  status: TaskStatus
  result?: T
  error?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
}

export interface TaskResult<T = unknown> {
  taskId: string
  status: TaskStatus
  result?: T
  error?: string
  duration: number
  retries: number
}

export interface RunnerStats {
  totalTasks: number
  completed: number
  failed: number
  skipped: number
  totalDuration: number
  avgTaskDuration: number
  maxConcurrent: number
}

export interface SchedulerConfig {
  maxConcurrent: number
  defaultTimeout: number
  defaultRetries: number
  defaultRetryDelay: number
  failFast: boolean
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  maxConcurrent: 4,
  defaultTimeout: 30000,
  defaultRetries: 0,
  defaultRetryDelay: 100,
  failFast: false,
}
