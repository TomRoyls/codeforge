import { describe, it, expect } from 'vitest'
import { createDeferred, DeferredBarrier, type Deferred } from '../../src/utils/deferred.js'

// ─── createDeferred ───────────────────────────────────────
describe('createDeferred', () => {
  it('creates a deferred that resolves', async () => {
    const d = createDeferred<string>()
    d.resolve('hello')
    const result = await d.promise
    expect(result).toBe('hello')
  })

  it('creates a deferred that rejects', async () => {
    const d = createDeferred<string>()
    d.reject(new Error('fail'))
    await expect(d.promise).rejects.toThrow('fail')
  })

  it('resolves with undefined', async () => {
    const d = createDeferred<void>()
    d.resolve()
    await expect(d.promise).resolves.toBeUndefined()
  })

  it('resolves only once', async () => {
    const d = createDeferred<number>()
    d.resolve(1)
    d.resolve(2)
    const result = await d.promise
    expect(result).toBe(1)
  })
})

// ─── DeferredBarrier ──────────────────────────────────────
describe('DeferredBarrier', () => {
  it('creates and resolves a deferred by key', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('task-1')
    barrier.resolve('task-1', 'done')
    expect(await d.promise).toBe('done')
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(0)
  })

  it('creates and rejects a deferred by key', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('task-2')
    barrier.reject('task-2', new Error('failed'))
    await expect(d.promise).rejects.toThrow('failed')
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(0)
  })

  it('throws on duplicate key', () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    expect(() => barrier.create('key')).toThrow('Deferred already exists')
  })

  it('get returns deferred by key', () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('my-key')
    expect(barrier.get('my-key')).toBe(d)
  })

  it('get returns undefined for unknown key', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.get('missing')).toBeUndefined()
  })

  it('resolve returns false for unknown key', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.resolve('missing', 1)).toBe(false)
  })

  it('reject returns false for unknown key', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.reject('missing', new Error())).toBe(false)
  })

  it('tracks size correctly', async () => {
    const barrier = new DeferredBarrier()
    expect(barrier.size).toBe(0)
    barrier.create('a')
    barrier.create('b')
    expect(barrier.size).toBe(2)
    barrier.resolve('a', 1)
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(1)
  })

  it('removes deferred after rejection', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('err-key')
    barrier.reject('err-key', new Error('x'))
    await expect(d.promise).rejects.toThrow()
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(0)
  })

  it('resolves with complex object', async () => {
    const d = createDeferred<{ a: number; b: string }>()
    d.resolve({ a: 42, b: 'hello' })
    const result = await d.promise
    expect(result).toEqual({ a: 42, b: 'hello' })
  })

  it('barrier handles multiple concurrent deferreds', async () => {
    const barrier = new DeferredBarrier()
    const d1 = barrier.create<number>('a')
    const d2 = barrier.create<number>('b')
    barrier.resolve('a', 1)
    barrier.resolve('b', 2)
    expect(await d1.promise).toBe(1)
    expect(await d2.promise).toBe(2)
  })

  it('createDeferred reject propagates error', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('test error'))
    await expect(d.promise).rejects.toThrow('test error')
  })

  it('createDeferred resolves undefined', async () => {
    const d = createDeferred<void>()
    d.resolve()
    await expect(d.promise).resolves.toBeUndefined()
  })

  it('reject propagates', async () => {
    const d = createDeferred<string>()
    d.reject(new Error('test error'))
    await expect(d.promise).rejects.toThrow('test error')
  })

  it('resolves with number value', async () => {
    const d = createDeferred<number>()
    d.resolve(42)
    const result = await d.promise
    expect(result).toBe(42)
  })

  it('reject propagates error', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('fail'))
    await expect(d.promise).rejects.toThrow('fail')
  })
})
