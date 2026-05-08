export interface BatchItem {
  id: string | number
  data: unknown
}

export interface BatchResult {
  id: string | number
  success: boolean
  result: unknown
  error: string
  duration: number
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  inFlight: number
  startTime: number
  estimatedTimeRemaining: number
}

export interface BatchConfig {
  batchSize: number
  concurrency: number
  retries: number
  retryDelay: number
  timeout: number
  continueOnError: boolean
  onProgress?: (progress: BatchProgress) => void
}

export type BatchProcessorState = 'idle' | 'running' | 'paused' | 'completed' | 'error'

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  batchSize: 10,
  concurrency: 1,
  retries: 0,
  retryDelay: 100,
  timeout: 30000,
  continueOnError: true,
}
