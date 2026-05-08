export type PoolTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface PoolTask<T = unknown> {
  id: string
  fn: () => T | Promise<T>
  priority: number
  status: PoolTaskStatus
  result?: T
  error?: unknown
}

export interface PoolConfig {
  concurrency: number
  timeout: number
  retryCount: number
  retryDelay: number
}

export interface PoolStats {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
  cancelled: number
}

export const DEFAULT_POOL_CONFIG: PoolConfig = {
  concurrency: 4,
  timeout: 30000,
  retryCount: 0,
  retryDelay: 100,
}
