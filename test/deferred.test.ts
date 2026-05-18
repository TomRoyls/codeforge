import { describe, expect, it } from 'vitest'

import { createDeferred, DeferredBarrier } from '../src/utils/deferred.js'

// ─── createDeferred ───────────────────────────────────
describe('createDeferred', () => {
  it('resolves with value', async () => {
    const d = createDeferred<string>()
    d.resolve('hello')
    expect(await d.promise).toBe('hello')
  })

  it('rejects with error', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('fail'))
    await expect(d.promise).rejects.toThrow('fail')
  })

  it('awaits until resolved', async () => {
    const d = createDeferred<number>()
    let resolved = false
    d.promise.then(() => { resolved = true })
    expect(resolved).toBe(false)
    d.resolve(42)
    await d.promise
    expect(resolved).toBe(true)
  })
})

// ─── DeferredBarrier ──────────────────────────────────
describe('DeferredBarrier', () => {
  it('creates and resolves deferred by key', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('task-1')
    barrier.resolve('task-1', 'done')
    expect(await d.promise).toBe('done')
  })

  it('rejects deferred by key', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<number>('task-2')
    const rejectionPromise = d.promise.catch((e: unknown) => e)
    barrier.reject('task-2', new Error('aborted'))
    const err = await rejectionPromise
    expect(err).toBeInstanceOf(Error)
    expect((err as Error).message).toBe('aborted')
  })

  it('returns false for unknown key resolve', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.resolve('unknown', 42)).toBe(false)
  })

  it('returns false for unknown key reject', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.reject('unknown', new Error('x'))).toBe(false)
  })

  it('throws on duplicate key', () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    expect(() => barrier.create('key')).toThrow('Deferred already exists')
  })

  it('tracks pending size', () => {
    const barrier = new DeferredBarrier()
    barrier.create('a')
    barrier.create('b')
    expect(barrier.size).toBe(2)
  })

  it('removes from pending after resolution', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<number>('temp')
    barrier.resolve('temp', 1)
    await d.promise
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(0)
  })
})
