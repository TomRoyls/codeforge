import { describe, expect, it } from 'vitest'
import { PipelineStage } from '../../../src/core/pipeline-engine/pipeline-stage.js'
import type { StageConfig, PipelineContext } from '../../../src/core/pipeline-engine/types.js'

// ─── Helpers ───

function makeContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return {
    data: overrides.data ?? {},
    metadata: overrides.metadata ?? new Map(),
    errors: overrides.errors ?? [],
    aborted: overrides.aborted ?? false,
  }
}

function syncHandler(ctx: PipelineContext): PipelineContext {
  return ctx
}

function asyncHandler(ctx: PipelineContext): Promise<PipelineContext> {
  return Promise.resolve(ctx)
}

function modifyingHandler(extra: Record<string, unknown>): (ctx: PipelineContext) => PipelineContext {
  return (ctx: PipelineContext) => ({ ...ctx, data: { ...ctx.data, ...extra } })
}

// ─── Construction ───

describe('PipelineStage construction', () => {
  it('stores config name', () => {
    const stage = new PipelineStage({ name: 'test-stage', handler: syncHandler })
    expect(stage.getName()).toBe('test-stage')
  })

  it('returns undefined timeout when not set', () => {
    const stage = new PipelineStage({ name: 's', handler: syncHandler })
    expect(stage.getTimeout()).toBeUndefined()
  })

  it('returns configured timeout', () => {
    const stage = new PipelineStage({ name: 's', handler: syncHandler, timeout: 5000 })
    expect(stage.getTimeout()).toBe(5000)
  })

  it('returns 0 retries by default', () => {
    const stage = new PipelineStage({ name: 's', handler: syncHandler })
    expect(stage.getRetries()).toBe(0)
  })

  it('returns configured retries', () => {
    const stage = new PipelineStage({ name: 's', handler: syncHandler, retries: 3 })
    expect(stage.getRetries()).toBe(3)
  })
})

// ─── execute() — sync handler ───

describe('PipelineStage execute — sync handler', () => {
  it('executes sync handler and returns context', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({ name: 's', handler: syncHandler })
    const result = await stage.execute(ctx)
    expect(result).toBe(ctx)
  })

  it('executes handler that modifies context', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({ name: 's', handler: modifyingHandler({ key: 'value' }) })
    const result = await stage.execute(ctx)
    expect(result.data).toEqual({ key: 'value' })
  })

  it('returns new context object from handler', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({ name: 's', handler: modifyingHandler({ x: 1 }) })
    const result = await stage.execute(ctx)
    expect(result).not.toBe(ctx)
  })
})

// ─── execute() — async handler ───

describe('PipelineStage execute — async handler', () => {
  it('executes async handler and returns context', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({ name: 's', handler: asyncHandler })
    const result = await stage.execute(ctx)
    expect(result).toBe(ctx)
  })

  it('executes async handler that modifies context', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({
      name: 's',
      handler: async (ctx: PipelineContext) => ({
        ...ctx,
        data: { ...ctx.data, async: true },
      }),
    })
    const result = await stage.execute(ctx)
    expect(result.data).toEqual({ async: true })
  })
})

// ─── execute() — retries ───

describe('PipelineStage execute — retries', () => {
  it('retries on failure and succeeds eventually', async () => {
    let attempts = 0
    const stage = new PipelineStage({
      name: 's',
      retries: 2,
      handler: () => {
        attempts++
        if (attempts < 3) throw new Error('transient')
        return makeContext({ data: { ok: true } })
      },
    })
    const result = await stage.execute(makeContext())
    expect(result.data).toEqual({ ok: true })
    expect(attempts).toBe(3)
  })

  it('throws after all retries exhausted', async () => {
    const stage = new PipelineStage({
      name: 's',
      retries: 2,
      handler: () => {
        throw new Error('always fails')
      },
    })
    await expect(stage.execute(makeContext())).rejects.toThrow('always fails')
  })

  it('with 0 retries fails immediately', async () => {
    const stage = new PipelineStage({
      name: 's',
      retries: 0,
      handler: () => {
        throw new Error('nope')
      },
    })
    await expect(stage.execute(makeContext())).rejects.toThrow('nope')
  })

  it('wraps non-Error throws', async () => {
    const stage = new PipelineStage({
      name: 's',
      handler: () => {
        throw 'string error'
      },
    })
    await expect(stage.execute(makeContext())).rejects.toThrow('string error')
  })

  it('default retries is 0 when not set', async () => {
    let calls = 0
    const stage = new PipelineStage({
      name: 's',
      handler: () => {
        calls++
        throw new Error('fail')
      },
    })
    await expect(stage.execute(makeContext())).rejects.toThrow('fail')
    expect(calls).toBe(1)
  })
})

// ─── execute() — timeout ───

describe('PipelineStage execute — timeout', () => {
  it('resolves when handler completes within timeout', async () => {
    const stage = new PipelineStage({
      name: 's',
      timeout: 5000,
      handler: syncHandler,
    })
    const ctx = makeContext()
    const result = await stage.execute(ctx)
    expect(result).toBe(ctx)
  })

  it('rejects with timeout error when handler takes too long', async () => {
    const stage = new PipelineStage({
      name: 'slow-stage',
      timeout: 10,
      handler: () =>
        new Promise<PipelineContext>((resolve) => setTimeout(() => resolve(makeContext()), 500)),
    })
    await expect(stage.execute(makeContext())).rejects.toThrow(
      'Stage "slow-stage" timed out after 10ms',
    )
  })

  it('clears timeout when handler resolves in time', async () => {
    let resolved = false
    const stage = new PipelineStage({
      name: 's',
      timeout: 200,
      handler: () => {
        resolved = true
        return makeContext()
      },
    })
    const result = await stage.execute(makeContext())
    expect(resolved).toBe(true)
    expect(result).toBeDefined()
  })

  it('does not timeout when timeout is undefined', async () => {
    const stage = new PipelineStage({
      name: 's',
      handler: syncHandler,
    })
    const result = await stage.execute(makeContext())
    expect(result).toBeDefined()
  })

  it('does not timeout when timeout is 0', async () => {
    const stage = new PipelineStage({
      name: 's',
      timeout: 0,
      handler: syncHandler,
    })
    const result = await stage.execute(makeContext())
    expect(result).toBeDefined()
  })
})

// ─── rollback() ───

describe('PipelineStage rollback', () => {
  it('calls rollback handler when defined', async () => {
    let called = false
    const ctx = makeContext()
    const stage = new PipelineStage({
      name: 's',
      handler: syncHandler,
      rollback: () => {
        called = true
      },
    })
    await stage.rollback(ctx)
    expect(called).toBe(true)
  })

  it('passes context to rollback handler', async () => {
    let received: PipelineContext | undefined
    const ctx = makeContext({ data: { x: 1 } })
    const stage = new PipelineStage({
      name: 's',
      handler: syncHandler,
      rollback: (c) => {
        received = c
      },
    })
    await stage.rollback(ctx)
    expect(received).toBe(ctx)
  })

  it('handles async rollback handler', async () => {
    let called = false
    const stage = new PipelineStage({
      name: 's',
      handler: syncHandler,
      rollback: async () => {
        called = true
      },
    })
    await stage.rollback(makeContext())
    expect(called).toBe(true)
  })

  it('does nothing when rollback is undefined', async () => {
    const stage = new PipelineStage({
      name: 's',
      handler: syncHandler,
    })
    await expect(stage.rollback(makeContext())).resolves.toBeUndefined()
  })
})

// ─── getName() ───

describe('PipelineStage getName', () => {
  it('returns the configured name', () => {
    const stage = new PipelineStage({ name: 'my-stage', handler: syncHandler })
    expect(stage.getName()).toBe('my-stage')
  })
})

// ─── Edge Cases ───

describe('PipelineStage edge cases', () => {
  it('handles handler returning a promise of a new context', async () => {
    const ctx = makeContext()
    const stage = new PipelineStage({
      name: 's',
      handler: async (c: PipelineContext) => ({ ...c, data: { ...c.data, transformed: true } }),
    })
    const result = await stage.execute(ctx)
    expect(result.data).toEqual({ transformed: true })
    expect(result).not.toBe(ctx)
  })

  it('preserves errors from context through handler', async () => {
    const error = { stage: 'prev', message: 'earlier error', recoverable: true }
    const ctx = makeContext({ errors: [error] })
    const stage = new PipelineStage({ name: 's', handler: syncHandler })
    const result = await stage.execute(ctx)
    expect(result.errors).toEqual([error])
  })
})
