import type {
  DistributedConfig,
  AnalysisChunk,
  ChunkResult,
  DistributedResult,
} from './types.js'
import { DEFAULT_DISTRIBUTED_CONFIG } from './types.js'

let chunkCounter = 0

function generateChunkId(): string {
  chunkCounter++
  return `chunk-${chunkCounter.toString().padStart(4, '0')}-${Date.now().toString(36)}`
}

export class DistributedCoordinator {
  private config: DistributedConfig
  private chunks: Map<string, AnalysisChunk>
  private results: Map<string, ChunkResult>

  constructor(config?: Partial<DistributedConfig>) {
    this.config = { ...DEFAULT_DISTRIBUTED_CONFIG, ...config }
    this.chunks = new Map()
    this.results = new Map()
  }

  createChunks(filePaths: string[]): AnalysisChunk[] {
    const created: AnalysisChunk[] = []
    for (let i = 0; i < filePaths.length; i += this.config.chunkSize) {
      const slice = filePaths.slice(i, i + this.config.chunkSize)
      const chunk: AnalysisChunk = {
        id: generateChunkId(),
        filePaths: slice,
        workerId: '',
        status: 'pending',
      }
      this.chunks.set(chunk.id, chunk)
      created.push(chunk)
    }
    return created
  }

  assignChunk(chunkId: string, workerId: string): boolean {
    const chunk = this.chunks.get(chunkId)
    if (!chunk || chunk.status !== 'pending') {
      return false
    }
    chunk.workerId = workerId
    chunk.status = 'running'
    chunk.assignedAt = Date.now()
    return true
  }

  completeChunk(chunkId: string, result: ChunkResult): boolean {
    const chunk = this.chunks.get(chunkId)
    if (!chunk || chunk.status !== 'running') {
      return false
    }
    chunk.status = 'completed'
    chunk.result = result
    chunk.completedAt = Date.now()
    this.results.set(chunkId, result)
    return true
  }

  failChunk(chunkId: string, error: string): boolean {
    const chunk = this.chunks.get(chunkId)
    if (!chunk || (chunk.status !== 'running' && chunk.status !== 'pending')) {
      return false
    }
    chunk.status = 'failed'
    chunk.result = {
      chunkId,
      violations: [],
      fileCount: chunk.filePaths.length,
      duration: 0,
      errors: [error],
    }
    chunk.completedAt = Date.now()
    return true
  }

  getChunk(chunkId: string): AnalysisChunk | null {
    return this.chunks.get(chunkId) ?? null
  }

  getChunks(): AnalysisChunk[] {
    return [...this.chunks.values()]
  }

  getAggregatedResult(): DistributedResult {
    const allChunks = [...this.chunks.values()]
    const completedChunks = allChunks.filter((c) => c.status === 'completed')
    const failedChunks = allChunks.filter((c) => c.status === 'failed')

    let totalViolations = 0
    let totalDuration = 0
    const workerIds = new Set<string>()

    for (const chunk of completedChunks) {
      if (chunk.result) {
        totalViolations += chunk.result.violations.length
        totalDuration += chunk.result.duration
      }
      if (chunk.workerId) {
        workerIds.add(chunk.workerId)
      }
    }

    for (const chunk of failedChunks) {
      if (chunk.workerId) {
        workerIds.add(chunk.workerId)
      }
    }

    const totalFiles = allChunks.reduce((sum, c) => sum + c.filePaths.length, 0)

    return {
      chunks: allChunks,
      totalFiles,
      totalViolations,
      totalDuration,
      workerCount: workerIds.size,
      chunksCompleted: completedChunks.length,
      chunksFailed: failedChunks.length,
    }
  }

  retryFailed(): number {
    let retried = 0
    for (const chunk of this.chunks.values()) {
      if (chunk.status === 'failed') {
        chunk.status = 'pending'
        chunk.workerId = ''
        chunk.result = undefined
        chunk.assignedAt = undefined
        chunk.completedAt = undefined
        this.results.delete(chunk.id)
        retried++
      }
    }
    return retried
  }

  getPendingChunks(): AnalysisChunk[] {
    return [...this.chunks.values()].filter((c) => c.status === 'pending')
  }

  getChunksByWorker(workerId: string): AnalysisChunk[] {
    return [...this.chunks.values()].filter((c) => c.workerId === workerId)
  }

  reset(): void {
    this.chunks.clear()
    this.results.clear()
    chunkCounter = 0
  }
}
