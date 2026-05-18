import { describe, it, expect, beforeEach } from 'vitest'
import { DistributedCoordinator, DEFAULT_DISTRIBUTED_CONFIG } from '../src/core/distributed/index.js'

// ─── DistributedCoordinator ───

describe('DistributedCoordinator', () => {
  let coordinator: DistributedCoordinator

  beforeEach(() => {
    coordinator = new DistributedCoordinator()
    coordinator.reset()
  })

  describe('construction', () => {
    it('should use default config', () => {
      expect(DEFAULT_DISTRIBUTED_CONFIG.maxWorkers).toBe(4)
      expect(DEFAULT_DISTRIBUTED_CONFIG.chunkSize).toBe(50)
    })

    it('should accept custom config', () => {
      const c = new DistributedCoordinator({ chunkSize: 10 })
      const chunks = c.createChunks(Array.from({ length: 25 }, (_, i) => `file${i}.ts`))
      expect(chunks.length).toBe(3)
      c.reset()
    })
  })

  describe('createChunks', () => {
    it('should split files into chunks by chunkSize', () => {
      const chunks = coordinator.createChunks(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'])
      expect(chunks.length).toBe(1)
      expect(chunks[0]!.filePaths.length).toBe(5)
    })

    it('should create multiple chunks when files exceed chunkSize', () => {
      const small = new DistributedCoordinator({ chunkSize: 2 })
      const chunks = small.createChunks(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'])
      expect(chunks.length).toBe(3)
      expect(chunks[0]!.filePaths.length).toBe(2)
      expect(chunks[2]!.filePaths.length).toBe(1)
      small.reset()
    })

    it('should set initial status to pending', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      expect(chunks[0]!.status).toBe('pending')
      expect(chunks[0]!.workerId).toBe('')
    })

    it('should return empty array for no files', () => {
      expect(coordinator.createChunks([])).toEqual([])
    })
  })

  describe('assignChunk', () => {
    it('should assign a pending chunk to a worker', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      const chunkId = chunks[0]!.id
      expect(coordinator.assignChunk(chunkId, 'worker-1')).toBe(true)
      expect(coordinator.getChunk(chunkId)!.status).toBe('running')
      expect(coordinator.getChunk(chunkId)!.workerId).toBe('worker-1')
    })

    it('should fail to assign non-pending chunk', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      coordinator.assignChunk(chunks[0]!.id, 'w1')
      expect(coordinator.assignChunk(chunks[0]!.id, 'w2')).toBe(false)
    })

    it('should fail for non-existent chunk', () => {
      expect(coordinator.assignChunk('nonexistent', 'w1')).toBe(false)
    })
  })

  describe('completeChunk', () => {
    it('should complete a running chunk', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      const chunkId = chunks[0]!.id
      coordinator.assignChunk(chunkId, 'w1')
      const result = { chunkId, violations: [{ rule: 'test' }], fileCount: 1, duration: 100, errors: [] }
      expect(coordinator.completeChunk(chunkId, result)).toBe(true)
      expect(coordinator.getChunk(chunkId)!.status).toBe('completed')
    })

    it('should fail to complete non-running chunk', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      const result = { chunkId: chunks[0]!.id, violations: [], fileCount: 1, duration: 0, errors: [] }
      expect(coordinator.completeChunk(chunks[0]!.id, result)).toBe(false)
    })
  })

  describe('failChunk', () => {
    it('should fail a running chunk', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      coordinator.assignChunk(chunks[0]!.id, 'w1')
      expect(coordinator.failChunk(chunks[0]!.id, 'timeout')).toBe(true)
      expect(coordinator.getChunk(chunks[0]!.id)!.status).toBe('failed')
    })

    it('should fail a pending chunk', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      expect(coordinator.failChunk(chunks[0]!.id, 'error')).toBe(true)
    })
  })

  describe('getChunk', () => {
    it('should return null for non-existent chunk', () => {
      expect(coordinator.getChunk('nonexistent')).toBeNull()
    })
  })

  describe('getChunks', () => {
    it('should return all chunks', () => {
      coordinator.createChunks(['a.ts', 'b.ts'])
      expect(coordinator.getChunks().length).toBe(1)
    })
  })

  describe('getAggregatedResult', () => {
    it('should aggregate results across chunks', () => {
      const chunks = coordinator.createChunks(['a.ts', 'b.ts'])
      coordinator.assignChunk(chunks[0]!.id, 'w1')
      coordinator.completeChunk(chunks[0]!.id, { chunkId: chunks[0]!.id, violations: [1, 2], fileCount: 2, duration: 100, errors: [] })
      const result = coordinator.getAggregatedResult()
      expect(result.totalFiles).toBe(2)
      expect(result.totalViolations).toBe(2)
      expect(result.chunksCompleted).toBe(1)
      expect(result.workerCount).toBe(1)
    })
  })

  describe('retryFailed', () => {
    it('should reset failed chunks to pending', () => {
      const chunks = coordinator.createChunks(['a.ts'])
      coordinator.assignChunk(chunks[0]!.id, 'w1')
      coordinator.failChunk(chunks[0]!.id, 'error')
      const retried = coordinator.retryFailed()
      expect(retried).toBe(1)
      expect(coordinator.getChunk(chunks[0]!.id)!.status).toBe('pending')
    })

    it('should return 0 when no failed chunks', () => {
      expect(coordinator.retryFailed()).toBe(0)
    })
  })

  describe('getPendingChunks', () => {
    it('should return only pending chunks', () => {
      coordinator.createChunks(['a.ts', 'b.ts'])
      coordinator.createChunks(['c.ts'])
      const pending = coordinator.getPendingChunks()
      expect(pending.length).toBe(2)
      expect(pending.every((c) => c.status === 'pending')).toBe(true)
    })
  })

  describe('getChunksByWorker', () => {
    it('should return chunks assigned to a specific worker', () => {
      const chunks = coordinator.createChunks(['a.ts', 'b.ts'])
      coordinator.assignChunk(chunks[0]!.id, 'w1')
      expect(coordinator.getChunksByWorker('w1').length).toBe(1)
      expect(coordinator.getChunksByWorker('w2').length).toBe(0)
    })
  })

  describe('reset', () => {
    it('should clear all chunks and results', () => {
      coordinator.createChunks(['a.ts'])
      coordinator.reset()
      expect(coordinator.getChunks()).toEqual([])
    })
  })
})
