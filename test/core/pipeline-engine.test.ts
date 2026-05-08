import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PipelineStage } from '../../src/core/pipeline-engine/pipeline-stage.js'
import { PipelineEngine } from '../../src/core/pipeline-engine/pipeline-engine.js'
import { DEFAULT_PIPELINE_CONFIG } from '../../src/core/pipeline-engine/types.js'
import type { PipelineContext, StageConfig } from '../../src/core/pipeline-engine/types.js'

function makeContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return {
    data: overrides.data ?? {},
    metadata: overrides.metadata ?? new Map<string, unknown>(),
    errors: overrides.errors ?? [],
    aborted: overrides.aborted ?? false,
  }
}

function makeStageConfig(overrides: Partial<StageConfig> = {}): StageConfig {
  return {
    name: overrides.name ?? 'test-stage',
    handler: overrides.handler ?? ((ctx: PipelineContext) => ctx),
    ...overrides,
  }
}

describe('PipelineStage', () => {
  describe('constructor', () => {
    it('should store config', () => {
      const config = makeStageConfig({ name: 'my-stage' })
      const stage = new PipelineStage(config)
      expect(stage.getName()).toBe('my-stage')
    })
  })

  describe('getName', () => {
    it('should return the stage name', () => {
      const stage = new PipelineStage(makeStageConfig({ name: 'parse' }))
      expect(stage.getName()).toBe('parse')
    })
  })

  describe('getTimeout', () => {
    it('should return undefined when no timeout set', () => {
      const stage = new PipelineStage(makeStageConfig())
      expect(stage.getTimeout()).toBeUndefined()
    })

    it('should return configured timeout', () => {
      const stage = new PipelineStage(makeStageConfig({ timeout: 5000 }))
      expect(stage.getTimeout()).toBe(5000)
    })
  })

  describe('getRetries', () => {
    it('should return 0 when no retries set', () => {
      const stage = new PipelineStage(makeStageConfig())
      expect(stage.getRetries()).toBe(0)
    })

    it('should return configured retries', () => {
      const stage = new PipelineStage(makeStageConfig({ retries: 3 }))
      expect(stage.getRetries()).toBe(3)
    })
  })

  describe('execute', () => {
    it('should execute handler and return context', async () => {
      const handler = vi.fn((ctx: PipelineContext) => {
        ctx.data.result = 'done'
        return ctx
      })
      const stage = new PipelineStage(makeStageConfig({ handler }))
      const ctx = makeContext()
      const result = await stage.execute(ctx)
      expect(handler).calledOnce
      expect(result.data.result).toBe('done')
    })

    it('should execute async handler', async () => {
      const handler = vi.fn(async (ctx: PipelineContext) => {
        await new Promise((r) => setTimeout(r, 10))
        ctx.data.async = true
        return ctx
      })
      const stage = new PipelineStage(makeStageConfig({ handler }))
      const result = await stage.execute(makeContext())
      expect(result.data.async).toBe(true)
    })

    it('should throw on handler error with no retries', async () => {
      const handler = vi.fn(() => {
        throw new Error('handler failed')
      })
      const stage = new PipelineStage(makeStageConfig({ handler }))
      await expect(stage.execute(makeContext())).rejects.toThrow('handler failed')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should apply timeout when configured', async () => {
      const handler = vi.fn(async (ctx: PipelineContext) => {
        await new Promise((r) => setTimeout(r, 500))
        return ctx
      })
      const stage = new PipelineStage(makeStageConfig({ handler, timeout: 50 }))
      await expect(stage.execute(makeContext())).rejects.toThrow('timed out')
    })

    it('should succeed when handler completes before timeout', async () => {
      const handler = vi.fn(async (ctx: PipelineContext) => {
        await new Promise((r) => setTimeout(r, 10))
        ctx.data.fast = true
        return ctx
      })
      const stage = new PipelineStage(makeStageConfig({ handler, timeout: 1000 }))
      const result = await stage.execute(makeContext())
      expect(result.data.fast).toBe(true)
    })

    it('should retry on failure when retries > 0', async () => {
      let attempts = 0
      const handler = vi.fn(() => {
        attempts++
        if (attempts < 3) throw new Error('not yet')
        return makeContext({ data: { success: true } })
      })
      const stage = new PipelineStage(makeStageConfig({ handler, retries: 3 }))
      const result = await stage.execute(makeContext())
      expect(result.data.success).toBe(true)
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('should throw after all retries exhausted', async () => {
      const handler = vi.fn(() => {
        throw new Error('always fails')
      })
      const stage = new PipelineStage(makeStageConfig({ handler, retries: 2 }))
      await expect(stage.execute(makeContext())).rejects.toThrow('always fails')
      expect(handler).toHaveBeenCalledTimes(3)
    })

    it('should retry and succeed on second attempt', async () => {
      let attempts = 0
      const handler = vi.fn(() => {
        attempts++
        if (attempts === 1) throw new Error('first fail')
        return makeContext({ data: { recovered: true } })
      })
      const stage = new PipelineStage(makeStageConfig({ handler, retries: 1 }))
      const result = await stage.execute(makeContext())
      expect(result.data.recovered).toBe(true)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should throw timeout error even with retries', async () => {
      const handler = vi.fn(async () => {
        await new Promise((r) => setTimeout(r, 200))
        return makeContext()
      })
      const stage = new PipelineStage(makeStageConfig({ handler, timeout: 50, retries: 2 }))
      await expect(stage.execute(makeContext())).rejects.toThrow('timed out')
    })
  })

  describe('rollback', () => {
    it('should call rollback handler when provided', async () => {
      const rollback = vi.fn()
      const stage = new PipelineStage(makeStageConfig({ rollback }))
      await stage.rollback(makeContext())
      expect(rollback).calledOnce
    })

    it('should not throw when no rollback handler', async () => {
      const stage = new PipelineStage(makeStageConfig())
      await expect(stage.rollback(makeContext())).resolves.toBeUndefined()
    })

    it('should call async rollback handler', async () => {
      const rollback = vi.fn(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      const stage = new PipelineStage(makeStageConfig({ rollback }))
      await stage.rollback(makeContext())
      expect(rollback).calledOnce
    })

    it('should pass context to rollback handler', async () => {
      let receivedCtx: PipelineContext | undefined
      const rollback = vi.fn((ctx: PipelineContext) => {
        receivedCtx = ctx
      })
      const stage = new PipelineStage(makeStageConfig({ rollback }))
      const ctx = makeContext({ data: { key: 'value' } })
      await stage.rollback(ctx)
      expect(receivedCtx).toBeDefined()
      expect(receivedCtx!.data.key).toBe('value')
    })
  })
})

describe('PipelineEngine', () => {
  let engine: PipelineEngine

  beforeEach(() => {
    engine = new PipelineEngine()
  })

  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const defaultEngine = new PipelineEngine()
      expect(defaultEngine.getStages()).toEqual([])
    })

    it('should accept partial config', () => {
      const customEngine = new PipelineEngine({ name: 'custom', continueOnError: true })
      expect(customEngine.getStages()).toEqual([])
    })

    it('should create stages from config', () => {
      const configuredEngine = new PipelineEngine({
        stages: [
          makeStageConfig({ name: 'stage-1' }),
          makeStageConfig({ name: 'stage-2' }),
        ],
      })
      expect(configuredEngine.getStages()).toEqual(['stage-1', 'stage-2'])
    })
  })

  describe('run', () => {
    it('should run empty pipeline', async () => {
      const result = await engine.run()
      expect(result.success).toBe(true)
      expect(result.completedStages).toEqual([])
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should run single stage', async () => {
      engine.addStage(makeStageConfig({
        name: 'single',
        handler: (ctx) => {
          ctx.data.value = 42
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.success).toBe(true)
      expect(result.completedStages).toEqual(['single'])
      expect(result.context.data.value).toBe(42)
    })

    it('should run multiple stages sequentially', async () => {
      const order: string[] = []
      engine.addStage(makeStageConfig({
        name: 'first',
        handler: (ctx) => { order.push('first'); return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'second',
        handler: (ctx) => { order.push('second'); return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'third',
        handler: (ctx) => { order.push('third'); return ctx },
      }))
      const result = await engine.run()
      expect(result.success).toBe(true)
      expect(order).toEqual(['first', 'second', 'third'])
      expect(result.completedStages).toEqual(['first', 'second', 'third'])
    })

    it('should pass context between stages', async () => {
      engine.addStage(makeStageConfig({
        name: 'set',
        handler: (ctx) => { ctx.data.count = 1; return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'increment',
        handler: (ctx) => {
          const count = (ctx.data.count as number) + 1
          ctx.data.count = count
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.count).toBe(2)
    })

    it('should abort on error by default and run rollbacks', async () => {
      const rollbackFn = vi.fn()
      engine.addStage(makeStageConfig({
        name: 'ok-stage',
        handler: (ctx) => ctx,
        rollback: rollbackFn,
      }))
      engine.addStage(makeStageConfig({
        name: 'fail-stage',
        handler: () => { throw new Error('boom') },
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(result.failedStage).toBe('fail-stage')
      expect(result.completedStages).toEqual(['ok-stage'])
      expect(rollbackFn).calledOnce
    })

    it('should run rollbacks in reverse order on abort', async () => {
      const rollbackOrder: string[] = []
      engine.addStage(makeStageConfig({
        name: 'stage-1',
        handler: (ctx) => ctx,
        rollback: () => { rollbackOrder.push('stage-1') },
      }))
      engine.addStage(makeStageConfig({
        name: 'stage-2',
        handler: (ctx) => ctx,
        rollback: () => { rollbackOrder.push('stage-2') },
      }))
      engine.addStage(makeStageConfig({
        name: 'stage-3',
        handler: () => { throw new Error('fail') },
      }))
      await engine.run()
      expect(rollbackOrder).toEqual(['stage-2', 'stage-1'])
    })

    it('should continue on error when continueOnError is true', async () => {
      const continueEngine = new PipelineEngine({ continueOnError: true })
      continueEngine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('oops') },
      }))
      continueEngine.addStage(makeStageConfig({
        name: 'after-fail',
        handler: (ctx) => { ctx.data.after = true; return ctx },
      }))
      const result = await continueEngine.run()
      expect(result.success).toBe(false)
      expect(result.context.errors).toHaveLength(1)
      expect(result.context.errors[0]!.recoverable).toBe(true)
      expect(result.context.data.after).toBe(true)
      expect(result.completedStages).toEqual(['after-fail'])
    })

    it('should collect multiple errors with continueOnError', async () => {
      const continueEngine = new PipelineEngine({ continueOnError: true })
      continueEngine.addStage(makeStageConfig({
        name: 'fail-1',
        handler: () => { throw new Error('err1') },
      }))
      continueEngine.addStage(makeStageConfig({
        name: 'fail-2',
        handler: () => { throw new Error('err2') },
      }))
      const result = await continueEngine.run()
      expect(result.context.errors).toHaveLength(2)
      expect(result.context.errors[0]!.stage).toBe('fail-1')
      expect(result.context.errors[1]!.stage).toBe('fail-2')
    })

    it('should use initial data', async () => {
      engine.addStage(makeStageConfig({
        name: 'read',
        handler: (ctx) => {
          ctx.data.seen = ctx.data.input
          return ctx
        },
      }))
      const result = await engine.run({ input: 'hello' })
      expect(result.context.data.seen).toBe('hello')
    })

    it('should not mutate initial data', async () => {
      const initial = { key: 'value' }
      engine.addStage(makeStageConfig({
        name: 'modify',
        handler: (ctx) => { ctx.data.key = 'changed'; return ctx },
      }))
      await engine.run(initial)
      expect(initial.key).toBe('value')
    })

    it('should track duration', async () => {
      engine.addStage(makeStageConfig({
        name: 'slow',
        handler: async (ctx) => {
          await new Promise((r) => setTimeout(r, 20))
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.duration).toBeGreaterThanOrEqual(15)
    })

    it('should track completedStages', async () => {
      engine.addStage(makeStageConfig({ name: 'a', handler: (ctx) => ctx }))
      engine.addStage(makeStageConfig({ name: 'b', handler: (ctx) => ctx }))
      const result = await engine.run()
      expect(result.completedStages).toEqual(['a', 'b'])
    })

    it('should set failedStage on error', async () => {
      engine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('nope') },
      }))
      const result = await engine.run()
      expect(result.failedStage).toBe('fail')
    })

    it('should not set failedStage on success', async () => {
      engine.addStage(makeStageConfig({ name: 'ok', handler: (ctx) => ctx }))
      const result = await engine.run()
      expect(result.failedStage).toBeUndefined()
    })

    it('should propagate metadata between stages', async () => {
      engine.addStage(makeStageConfig({
        name: 'set-meta',
        handler: (ctx) => {
          ctx.metadata.set('step', 1)
          return ctx
        },
      }))
      engine.addStage(makeStageConfig({
        name: 'read-meta',
        handler: (ctx) => {
          ctx.data.metaStep = ctx.metadata.get('step')
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.metaStep).toBe(1)
    })

    it('should respect aborted flag from handler', async () => {
      let thirdCalled = false
      engine.addStage(makeStageConfig({
        name: 'aborter',
        handler: (ctx) => { ctx.aborted = true; return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'should-not-run',
        handler: () => { thirdCalled = true; return makeContext() },
      }))
      const result = await engine.run()
      expect(result.completedStages).toEqual(['aborter'])
      expect(thirdCalled).toBe(false)
    })

    it('should record error with correct stage name', async () => {
      engine.addStage(makeStageConfig({
        name: 'bad-stage',
        handler: () => { throw new Error('specific error') },
      }))
      const result = await engine.run()
      expect(result.context.errors[0]!.stage).toBe('bad-stage')
      expect(result.context.errors[0]!.message).toBe('specific error')
      expect(result.context.errors[0]!.recoverable).toBe(false)
    })

    it('should handle async handlers', async () => {
      engine.addStage(makeStageConfig({
        name: 'async',
        handler: async (ctx) => {
          await new Promise((r) => setTimeout(r, 10))
          ctx.data.done = true
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.done).toBe(true)
    })

    it('should handle timeout per stage', async () => {
      engine.addStage(makeStageConfig({
        name: 'slow',
        handler: async (ctx) => {
          await new Promise((r) => setTimeout(r, 500))
          return ctx
        },
        timeout: 50,
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(result.failedStage).toBe('slow')
    })

    it('should not run rollbacks when continueOnError is true and no abort', async () => {
      const rollback = vi.fn()
      const continueEngine = new PipelineEngine({ continueOnError: true })
      continueEngine.addStage(makeStageConfig({
        name: 'ok',
        handler: (ctx) => ctx,
        rollback,
      }))
      continueEngine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('err') },
      }))
      await continueEngine.run()
      expect(rollback).not.toHaveBeenCalled()
    })
  })

  describe('addStage', () => {
    it('should add a stage to the pipeline', () => {
      engine.addStage(makeStageConfig({ name: 'new-stage' }))
      expect(engine.getStages()).toEqual(['new-stage'])
    })

    it('should add multiple stages in order', () => {
      engine.addStage(makeStageConfig({ name: 'first' }))
      engine.addStage(makeStageConfig({ name: 'second' }))
      expect(engine.getStages()).toEqual(['first', 'second'])
    })

    it('should run newly added stage', async () => {
      engine.addStage(makeStageConfig({
        name: 'added',
        handler: (ctx) => { ctx.data.added = true; return ctx },
      }))
      const result = await engine.run()
      expect(result.context.data.added).toBe(true)
    })
  })

  describe('removeStage', () => {
    it('should remove a stage by name', () => {
      engine.addStage(makeStageConfig({ name: 'a' }))
      engine.addStage(makeStageConfig({ name: 'b' }))
      expect(engine.removeStage('a')).toBe(true)
      expect(engine.getStages()).toEqual(['b'])
    })

    it('should return false for non-existent stage', () => {
      expect(engine.removeStage('nope')).toBe(false)
    })

    it('should only remove first occurrence', () => {
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.removeStage('dup')
      expect(engine.getStages()).toEqual(['dup'])
    })
  })

  describe('insertStage', () => {
    it('should insert at beginning when no after specified', () => {
      engine.addStage(makeStageConfig({ name: 'existing' }))
      engine.insertStage(makeStageConfig({ name: 'new-first' }))
      expect(engine.getStages()).toEqual(['new-first', 'existing'])
    })

    it('should insert after specified stage', () => {
      engine.addStage(makeStageConfig({ name: 'a' }))
      engine.addStage(makeStageConfig({ name: 'b' }))
      engine.insertStage(makeStageConfig({ name: 'c' }), 'a')
      expect(engine.getStages()).toEqual(['a', 'c', 'b'])
    })

    it('should insert at beginning when after stage not found', () => {
      engine.addStage(makeStageConfig({ name: 'a' }))
      engine.insertStage(makeStageConfig({ name: 'x' }), 'missing')
      expect(engine.getStages()).toEqual(['x', 'a'])
    })

    it('should insert at end when after last stage', () => {
      engine.addStage(makeStageConfig({ name: 'a' }))
      engine.addStage(makeStageConfig({ name: 'b' }))
      engine.insertStage(makeStageConfig({ name: 'c' }), 'b')
      expect(engine.getStages()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('getStages', () => {
    it('should return empty array for new engine', () => {
      expect(engine.getStages()).toEqual([])
    })

    it('should return all stage names', () => {
      engine.addStage(makeStageConfig({ name: 'x' }))
      engine.addStage(makeStageConfig({ name: 'y' }))
      engine.addStage(makeStageConfig({ name: 'z' }))
      expect(engine.getStages()).toEqual(['x', 'y', 'z'])
    })
  })

  describe('getStage', () => {
    it('should return stage by name', () => {
      engine.addStage(makeStageConfig({ name: 'find-me' }))
      const stage = engine.getStage('find-me')
      expect(stage).toBeDefined()
      expect(stage!.getName()).toBe('find-me')
    })

    it('should return undefined for non-existent stage', () => {
      expect(engine.getStage('nope')).toBeUndefined()
    })

    it('should return first matching stage for duplicates', () => {
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.addStage(makeStageConfig({ name: 'dup' }))
      const stage = engine.getStage('dup')
      expect(stage).toBeDefined()
    })
  })

  describe('validate', () => {
    it('should return empty array for clean pipeline', () => {
      engine.addStage(makeStageConfig({ name: 'a' }))
      engine.addStage(makeStageConfig({ name: 'b' }))
      expect(engine.validate()).toEqual([])
    })

    it('should detect duplicate stage names', () => {
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.addStage(makeStageConfig({ name: 'dup' }))
      const issues = engine.validate()
      expect(issues).toHaveLength(1)
      expect(issues[0]).toContain('Duplicate')
      expect(issues[0]).toContain('dup')
    })

    it('should detect multiple duplicate names', () => {
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.addStage(makeStageConfig({ name: 'dup' }))
      engine.addStage(makeStageConfig({ name: 'dup' }))
      const issues = engine.validate()
      expect(issues).toHaveLength(2)
    })

    it('should return empty array for empty pipeline', () => {
      expect(engine.validate()).toEqual([])
    })
  })

  describe('DEFAULT_PIPELINE_CONFIG', () => {
    it('should have correct defaults', () => {
      expect(DEFAULT_PIPELINE_CONFIG.name).toBe('default-pipeline')
      expect(DEFAULT_PIPELINE_CONFIG.stages).toEqual([])
      expect(DEFAULT_PIPELINE_CONFIG.continueOnError).toBe(false)
      expect(DEFAULT_PIPELINE_CONFIG.maxConcurrency).toBe(1)
    })
  })

  describe('complex scenarios', () => {
    it('should handle pipeline with retries per stage', async () => {
      let attempts = 0
      engine.addStage(makeStageConfig({
        name: 'retry-stage',
        handler: () => {
          attempts++
          if (attempts < 3) throw new Error('retry me')
          return makeContext({ data: { ok: true } })
        },
        retries: 3,
      }))
      const result = await engine.run()
      expect(result.success).toBe(true)
      expect(result.context.data.ok).toBe(true)
    })

    it('should handle mixed success and failure with continueOnError', async () => {
      const mixedEngine = new PipelineEngine({ continueOnError: true })
      mixedEngine.addStage(makeStageConfig({
        name: 'ok-1',
        handler: (ctx) => { ctx.data.one = true; return ctx },
      }))
      mixedEngine.addStage(makeStageConfig({
        name: 'fail-1',
        handler: () => { throw new Error('fail1') },
      }))
      mixedEngine.addStage(makeStageConfig({
        name: 'ok-2',
        handler: (ctx) => { ctx.data.two = true; return ctx },
      }))
      const result = await mixedEngine.run()
      expect(result.success).toBe(false)
      expect(result.context.data.one).toBe(true)
      expect(result.context.data.two).toBe(true)
      expect(result.context.errors).toHaveLength(1)
    })

    it('should handle pipeline with all stages timing out', async () => {
      engine.addStage(makeStageConfig({
        name: 'timeout-1',
        handler: async (ctx) => {
          await new Promise((r) => setTimeout(r, 500))
          return ctx
        },
        timeout: 10,
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(result.failedStage).toBe('timeout-1')
    })

    it('should handle rollback receiving context with errors', async () => {
      let rollbackCtx: PipelineContext | undefined
      engine.addStage(makeStageConfig({
        name: 'ok',
        handler: (ctx) => ctx,
        rollback: (ctx) => { rollbackCtx = ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('fail') },
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(rollbackCtx).toBeDefined()
    })

    it('should handle empty initial data', async () => {
      engine.addStage(makeStageConfig({
        name: 'init',
        handler: (ctx) => {
          ctx.data.initialized = Object.keys(ctx.data).length === 0
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.initialized).toBe(true)
    })

    it('should handle stages that add metadata for later stages', async () => {
      engine.addStage(makeStageConfig({
        name: 'enrich',
        handler: (ctx) => {
          ctx.metadata.set('enriched', true)
          ctx.metadata.set('timestamp', 12345)
          return ctx
        },
      }))
      engine.addStage(makeStageConfig({
        name: 'consume',
        handler: (ctx) => {
          ctx.data.wasEnriched = ctx.metadata.get('enriched')
          ctx.data.ts = ctx.metadata.get('timestamp')
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.wasEnriched).toBe(true)
      expect(result.context.data.ts).toBe(12345)
    })

    it('should handle large number of stages', async () => {
      const count = 20
      for (let i = 0; i < count; i++) {
        engine.addStage(makeStageConfig({
          name: `stage-${i}`,
          handler: (ctx) => {
            const current = (ctx.data.count as number | undefined) ?? 0
            ctx.data.count = current + 1
            return ctx
          },
        }))
      }
      const result = await engine.run()
      expect(result.success).toBe(true)
      expect(result.completedStages).toHaveLength(count)
      expect(result.context.data.count).toBe(count)
    })

    it('should handle initial data with metadata propagation', async () => {
      engine.addStage(makeStageConfig({
        name: 'check',
        handler: (ctx) => {
          ctx.data.hasInput = 'input' in ctx.data
          return ctx
        },
      }))
      const result = await engine.run({ input: 'test' })
      expect(result.context.data.hasInput).toBe(true)
    })

    it('should handle rollback for all completed stages on abort', async () => {
      const rollbacks: string[] = []
      for (let i = 0; i < 5; i++) {
        engine.addStage(makeStageConfig({
          name: `stage-${i}`,
          handler: (ctx) => ctx,
          rollback: () => { rollbacks.push(`stage-${i}`) },
        }))
      }
      engine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('fail') },
      }))
      await engine.run()
      expect(rollbacks).toEqual(['stage-4', 'stage-3', 'stage-2', 'stage-1', 'stage-0'])
    })

    it('should handle stages modifying data object', async () => {
      engine.addStage(makeStageConfig({
        name: 'add-key',
        handler: (ctx) => { ctx.data.newKey = 'value'; return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'check-key',
        handler: (ctx) => {
          ctx.data.hasNewKey = 'newKey' in ctx.data
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.hasNewKey).toBe(true)
      expect(result.context.data.newKey).toBe('value')
    })

    it('should handle error in first stage', async () => {
      engine.addStage(makeStageConfig({
        name: 'immediate-fail',
        handler: () => { throw new Error('first stage fails') },
      }))
      engine.addStage(makeStageConfig({
        name: 'never',
        handler: (ctx) => ctx,
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(result.failedStage).toBe('immediate-fail')
      expect(result.completedStages).toEqual([])
    })

    it('should report success true for error-free pipeline', async () => {
      engine.addStage(makeStageConfig({ name: 'a', handler: (ctx) => ctx }))
      const result = await engine.run()
      expect(result.success).toBe(true)
    })

    it('should handle error with non-Error thrown value', async () => {
      engine.addStage(makeStageConfig({
        name: 'string-error',
        handler: () => { throw 'string error' },
      }))
      const result = await engine.run()
      expect(result.success).toBe(false)
      expect(result.failedStage).toBe('string-error')
      expect(result.context.errors[0]!.message).toBe('string error')
    })

    it('should set success false when continueOnError has errors', async () => {
      const continueEngine = new PipelineEngine({ continueOnError: true })
      continueEngine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('err') },
      }))
      const result = await continueEngine.run()
      expect(result.success).toBe(false)
    })

    it('should not run stages after abort flag set by handler', async () => {
      const order: string[] = []
      engine.addStage(makeStageConfig({
        name: 'a',
        handler: (ctx) => { order.push('a'); ctx.aborted = true; return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'b',
        handler: (ctx) => { order.push('b'); return ctx },
      }))
      engine.addStage(makeStageConfig({
        name: 'c',
        handler: (ctx) => { order.push('c'); return ctx },
      }))
      await engine.run()
      expect(order).toEqual(['a'])
    })

    it('should handle insertStage into empty pipeline', () => {
      engine.insertStage(makeStageConfig({ name: 'only' }))
      expect(engine.getStages()).toEqual(['only'])
    })

    it('should track failedStage as the first failing stage', async () => {
      engine.addStage(makeStageConfig({ name: 'ok', handler: (ctx) => ctx }))
      engine.addStage(makeStageConfig({
        name: 'fail',
        handler: () => { throw new Error('fail') },
      }))
      engine.addStage(makeStageConfig({ name: 'never', handler: (ctx) => ctx }))
      const result = await engine.run()
      expect(result.failedStage).toBe('fail')
      expect(result.completedStages).toEqual(['ok'])
    })

    it('should handle stage returning new context object', async () => {
      engine.addStage(makeStageConfig({
        name: 'replace',
        handler: () => makeContext({ data: { replaced: true } }),
      }))
      engine.addStage(makeStageConfig({
        name: 'verify',
        handler: (ctx) => {
          ctx.data.hasReplaced = ctx.data.replaced === true
          return ctx
        },
      }))
      const result = await engine.run()
      expect(result.context.data.hasReplaced).toBe(true)
    })
  })
})
