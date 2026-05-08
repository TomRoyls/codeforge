import { describe, it, expect, beforeEach } from 'vitest'
import { DistributedCoordinator } from '../../src/core/distributed/distributed-coordinator.js'
import type {
  DistributedConfig,
  AnalysisChunk,
  ChunkResult,
  DistributedResult,
} from '../../src/core/distributed/types.js'
import { DEFAULT_DISTRIBUTED_CONFIG } from '../../src/core/distributed/types.js'

function makeChunkResult(chunkId: string, overrides?: Partial<ChunkResult>): ChunkResult {
  return {
    chunkId,
    violations: [{ rule: 'test', message: 'violation' }],
    fileCount: 1,
    duration: 100,
    errors: [],
    ...overrides,
  }
}

function makeFilePaths(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `src/file${i}.ts`)
}

describe('DistributedCoordinator', () => {
  let coordinator: DistributedCoordinator

  beforeEach(() => {
    coordinator = new DistributedCoordinator()
  })

  describe('constructor', () => {
    it('should create coordinator with default config', () => {
      const c = new DistributedCoordinator()
      expect(c).toBeInstanceOf(DistributedCoordinator)
    })

    it('should merge partial config with defaults', () => {
      const c = new DistributedCoordinator({ maxWorkers: 8 })
      expect(c).toBeInstanceOf(DistributedCoordinator)
    })

    it('should accept empty config', () => {
      const c = new DistributedCoordinator({})
      expect(c).toBeInstanceOf(DistributedCoordinator)
    })
  })

  describe('createChunks', () => {
    it('should create chunks from file paths', () => {
      const paths = makeFilePaths(10)
      const chunks = coordinator.createChunks(paths)
      expect(chunks.length).toBeGreaterThan(0)
    })

    it('should split files into chunks of chunkSize', () => {
      const c = new DistributedCoordinator({ chunkSize: 3 })
      const paths = makeFilePaths(10)
      const chunks = c.createChunks(paths)
      expect(chunks).toHaveLength(4)
      expect(chunks[0].filePaths).toHaveLength(3)
      expect(chunks[3].filePaths).toHaveLength(1)
    })

    it('should create single chunk for fewer files than chunkSize', () => {
      const paths = makeFilePaths(3)
      const chunks = coordinator.createChunks(paths)
      expect(chunks).toHaveLength(1)
      expect(chunks[0].filePaths).toHaveLength(3)
    })

    it('should assign unique IDs to chunks', () => {
      const paths = makeFilePaths(150)
      const chunks = coordinator.createChunks(paths)
      const ids = chunks.map((c) => c.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should initialize chunks as pending', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      for (const chunk of chunks) {
        expect(chunk.status).toBe('pending')
      }
    })

    it('should set empty workerId initially', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      for (const chunk of chunks) {
        expect(chunk.workerId).toBe('')
      }
    })

    it('should handle empty file paths', () => {
      const chunks = coordinator.createChunks([])
      expect(chunks).toHaveLength(0)
    })

    it('should handle exact chunkSize files', () => {
      const c = new DistributedCoordinator({ chunkSize: 5 })
      const paths = makeFilePaths(5)
      const chunks = c.createChunks(paths)
      expect(chunks).toHaveLength(1)
    })
  })

  describe('assignChunk', () => {
    it('should assign a chunk to a worker', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      const result = coordinator.assignChunk(chunks[0].id, 'worker-1')
      expect(result).toBe(true)
    })

    it('should update chunk status to running', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.status).toBe('running')
    })

    it('should set workerId on assigned chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.workerId).toBe('worker-1')
    })

    it('should set assignedAt timestamp', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.assignedAt).toBeGreaterThan(0)
    })

    it('should return false for non-existent chunk', () => {
      const result = coordinator.assignChunk('nonexistent', 'worker-1')
      expect(result).toBe(false)
    })

    it('should return false for already assigned chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const result = coordinator.assignChunk(chunks[0].id, 'worker-2')
      expect(result).toBe(false)
    })
  })

  describe('completeChunk', () => {
    it('should complete an assigned chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const result = coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      expect(result).toBe(true)
    })

    it('should update chunk status to completed', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.status).toBe('completed')
    })

    it('should set result on chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const chunkResult = makeChunkResult(chunks[0].id)
      coordinator.completeChunk(chunks[0].id, chunkResult)
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.result).toEqual(chunkResult)
    })

    it('should set completedAt timestamp', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.completedAt).toBeGreaterThan(0)
    })

    it('should return false for unassigned chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      const result = coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      expect(result).toBe(false)
    })

    it('should return false for already completed chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      const result = coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      expect(result).toBe(false)
    })
  })

  describe('failChunk', () => {
    it('should fail a running chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      const result = coordinator.failChunk(chunks[0].id, 'timeout')
      expect(result).toBe(true)
    })

    it('should update chunk status to failed', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.failChunk(chunks[0].id, 'timeout')
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.status).toBe('failed')
    })

    it('should set error in result', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.failChunk(chunks[0].id, 'timeout')
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.result?.errors).toContain('timeout')
    })

    it('should fail a pending chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      const result = coordinator.failChunk(chunks[0].id, 'error')
      expect(result).toBe(true)
    })

    it('should return false for already failed chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.failChunk(chunks[0].id, 'error1')
      const result = coordinator.failChunk(chunks[0].id, 'error2')
      expect(result).toBe(false)
    })
  })

  describe('getChunk', () => {
    it('should return chunk by ID', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk).not.toBeNull()
      expect(chunk?.id).toBe(chunks[0].id)
    })

    it('should return null for non-existent ID', () => {
      const chunk = coordinator.getChunk('nonexistent')
      expect(chunk).toBeNull()
    })
  })

  describe('getChunks', () => {
    it('should return all chunks', () => {
      const paths = makeFilePaths(120)
      const chunks = coordinator.createChunks(paths)
      const all = coordinator.getChunks()
      expect(all).toHaveLength(chunks.length)
    })

    it('should return empty array when no chunks', () => {
      const all = coordinator.getChunks()
      expect(all).toEqual([])
    })
  })

  describe('getAggregatedResult', () => {
    it('should aggregate results from completed chunks', () => {
      const paths = makeFilePaths(10)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id, { violations: [1, 2, 3], duration: 50 }))

      const result = coordinator.getAggregatedResult()
      expect(result.totalFiles).toBe(10)
      expect(result.totalViolations).toBe(3)
      expect(result.totalDuration).toBe(50)
      expect(result.chunksCompleted).toBe(1)
    })

    it('should count failed chunks', () => {
      const paths = makeFilePaths(10)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      coordinator.failChunk(chunks[0].id, 'error')

      const result = coordinator.getAggregatedResult()
      expect(result.chunksFailed).toBe(1)
    })

    it('should count unique workers', () => {
      const c = new DistributedCoordinator({ chunkSize: 5 })
      const paths = makeFilePaths(15)
      const chunks = c.createChunks(paths)
      c.assignChunk(chunks[0].id, 'w1')
      c.assignChunk(chunks[1].id, 'w2')
      c.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id))
      c.completeChunk(chunks[1].id, makeChunkResult(chunks[1].id))

      const result = c.getAggregatedResult()
      expect(result.workerCount).toBe(2)
    })

    it('should return zero totals for no chunks', () => {
      const result = coordinator.getAggregatedResult()
      expect(result.totalFiles).toBe(0)
      expect(result.totalViolations).toBe(0)
      expect(result.totalDuration).toBe(0)
      expect(result.workerCount).toBe(0)
    })

    it('should include all chunks in result', () => {
      const paths = makeFilePaths(120)
      coordinator.createChunks(paths)
      const result = coordinator.getAggregatedResult()
      expect(result.chunks.length).toBeGreaterThan(0)
    })
  })

  describe('retryFailed', () => {
    it('should reset failed chunks to pending', () => {
      const paths = makeFilePaths(10)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      coordinator.failChunk(chunks[0].id, 'error')

      const retried = coordinator.retryFailed()
      expect(retried).toBe(1)

      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.status).toBe('pending')
      expect(chunk?.workerId).toBe('')
    })

    it('should return 0 when no failed chunks', () => {
      const paths = makeFilePaths(5)
      coordinator.createChunks(paths)
      const retried = coordinator.retryFailed()
      expect(retried).toBe(0)
    })

    it('should clear result on retried chunk', () => {
      const paths = makeFilePaths(5)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      coordinator.failChunk(chunks[0].id, 'error')
      coordinator.retryFailed()

      const chunk = coordinator.getChunk(chunks[0].id)
      expect(chunk?.result).toBeUndefined()
    })
  })

  describe('getPendingChunks', () => {
    it('should return only pending chunks', () => {
      const paths = makeFilePaths(120)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      const pending = coordinator.getPendingChunks()
      expect(pending.length).toBe(chunks.length - 1)
      for (const c of pending) {
        expect(c.status).toBe('pending')
      }
    })

    it('should return all chunks when none assigned', () => {
      const paths = makeFilePaths(10)
      const chunks = coordinator.createChunks(paths)
      const pending = coordinator.getPendingChunks()
      expect(pending).toHaveLength(chunks.length)
    })
  })

  describe('getChunksByWorker', () => {
    it('should return chunks assigned to a worker', () => {
      const paths = makeFilePaths(120)
      const chunks = coordinator.createChunks(paths)
      coordinator.assignChunk(chunks[0].id, 'w1')
      coordinator.assignChunk(chunks[1].id, 'w1')
      coordinator.assignChunk(chunks[2].id, 'w2')

      const w1Chunks = coordinator.getChunksByWorker('w1')
      expect(w1Chunks).toHaveLength(2)
    })

    it('should return empty array for unknown worker', () => {
      const result = coordinator.getChunksByWorker('unknown')
      expect(result).toEqual([])
    })
  })

  describe('reset', () => {
    it('should clear all chunks and results', () => {
      const paths = makeFilePaths(10)
      coordinator.createChunks(paths)
      coordinator.reset()
      const chunks = coordinator.getChunks()
      expect(chunks).toHaveLength(0)
    })

    it('should allow creating new chunks after reset', () => {
      const paths = makeFilePaths(5)
      coordinator.createChunks(paths)
      coordinator.reset()
      const newChunks = coordinator.createChunks(paths)
      expect(newChunks).toHaveLength(1)
    })
  })

  describe('full workflow', () => {
    it('should handle complete analysis workflow', () => {
      const paths = makeFilePaths(15)
      const chunks = coordinator.createChunks(paths)
      expect(chunks).toHaveLength(1)

      coordinator.assignChunk(chunks[0].id, 'worker-1')
      coordinator.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id, {
        violations: [{ rule: 'no-console' }],
        duration: 250,
      }))

      const result = coordinator.getAggregatedResult()
      expect(result.chunksCompleted).toBe(1)
      expect(result.chunksFailed).toBe(0)
      expect(result.totalViolations).toBe(1)
      expect(result.totalDuration).toBe(250)
      expect(result.workerCount).toBe(1)
    })

    it('should handle partial failure workflow', () => {
      const c = new DistributedCoordinator({ chunkSize: 5 })
      const paths = makeFilePaths(15)
      const chunks = c.createChunks(paths)
      expect(chunks).toHaveLength(3)

      c.assignChunk(chunks[0].id, 'w1')
      c.completeChunk(chunks[0].id, makeChunkResult(chunks[0].id, { violations: [1], duration: 100 }))
      c.assignChunk(chunks[1].id, 'w2')
      c.failChunk(chunks[1].id, 'crash')

      const result = c.getAggregatedResult()
      expect(result.chunksCompleted).toBe(1)
      expect(result.chunksFailed).toBe(1)
      expect(result.totalViolations).toBe(1)
      expect(result.workerCount).toBe(2)

      const retried = c.retryFailed()
      expect(retried).toBe(1)
      const pending = c.getPendingChunks()
      expect(pending.length).toBe(2)
    })
  })
})
