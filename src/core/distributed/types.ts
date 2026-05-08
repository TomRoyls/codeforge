export type WorkerRole = 'coordinator' | 'analyzer' | 'aggregator'

export interface DistributedConfig {
  maxWorkers: number
  chunkSize: number
  timeout: number
  retryCount: number
  coordinatorUrl: string
}

export const DEFAULT_DISTRIBUTED_CONFIG: DistributedConfig = {
  maxWorkers: 4,
  chunkSize: 50,
  timeout: 60000,
  retryCount: 2,
  coordinatorUrl: 'https://coordinator.codeforge.dev',
}

export interface AnalysisChunk {
  id: string
  filePaths: string[]
  workerId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: ChunkResult
  assignedAt?: number
  completedAt?: number
}

export interface ChunkResult {
  chunkId: string
  violations: unknown[]
  fileCount: number
  duration: number
  errors: string[]
}

export interface DistributedResult {
  chunks: AnalysisChunk[]
  totalFiles: number
  totalViolations: number
  totalDuration: number
  workerCount: number
  chunksCompleted: number
  chunksFailed: number
}
