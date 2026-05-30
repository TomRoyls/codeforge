import { describe, expect, it } from 'vitest'
import { createDeferred, DeferredBarrier } from '../../../src/utils/deferred.js'

describe('createDeferred', () => {
  it('creates deferred with promise', () => {
    const deferred = createDeferred<string>()
    expect(deferred.promise).toBeInstanceOf(Promise)
  })

  it('creates deferred with resolve function', () => {
    const deferred = createDeferred<string>()
    expect(typeof deferred.resolve).toBe('function')
  })

  it('creates deferred with reject function', () => {
    const deferred = createDeferred<string>()
    expect(typeof deferred.reject).toBe('function')
  })

  it('resolves with value', async () => {
    const deferred = createDeferred<string>()
    deferred.resolve('hello')
    await expect(deferred.promise).resolves.toBe('hello')
  })

  it('rejects with error', async () => {
    const deferred = createDeferred<string>()
    const error = new Error('test error')
    deferred.reject(error)
    await expect(deferred.promise).rejects.toThrow('test error')
  })

  it('rejects with string reason', async () => {
    const deferred = createDeferred<string>()
    deferred.reject('rejected')
    await expect(deferred.promise).rejects.toBe('rejected')
  })

  it('resolves with number value', async () => {
    const deferred = createDeferred<number>()
    deferred.resolve(42)
    await expect(deferred.promise).resolves.toBe(42)
  })

  it('resolves with object value', async () => {
    const deferred = createDeferred<{ a: number }>()
    const value = { a: 1 }
    deferred.resolve(value)
    await expect(deferred.promise).resolves.toEqual(value)
  })

  it('resolves before await', async () => {
    const deferred = createDeferred<string>()
    deferred.resolve('immediate')
    const result = await deferred.promise
    expect(result).toBe('immediate')
  })

  it('rejects before await', async () => {
    const deferred = createDeferred<string>()
    deferred.reject('immediate reject')
    await expect(deferred.promise).rejects.toBe('immediate reject')
  })

  it('handles then chain', async () => {
    const deferred = createDeferred<number>()
    deferred.resolve(5)
    const result = await deferred.promise.then((x) => x * 2)
    expect(result).toBe(10)
  })

  it('handles catch chain', async () => {
    const deferred = createDeferred<string>()
    deferred.reject('error')
    const result = await deferred.promise.catch((e) => e.toString())
    expect(result).toBe('error')
  })

  it('handles then and catch chain', async () => {
    const deferred = createDeferred<number>()
    deferred.resolve(10)
    const result = await deferred.promise
      .then((x) => x + 5)
      .then((x) => x * 2)
    expect(result).toBe(30)
  })

  it('multiple resolve calls are idempotent', async () => {
    const deferred = createDeferred<string>()
    deferred.resolve('first')
    deferred.resolve('second')
    deferred.resolve('third')
    await expect(deferred.promise).resolves.toBe('first')
  })

  it('multiple reject calls after resolve', async () => {
    const deferred = createDeferred<string>()
    deferred.resolve('value')
    deferred.reject('error')
    await expect(deferred.promise).resolves.toBe('value')
  })
})

describe('DeferredBarrier', () => {
  it('creates deferred with key', () => {
    const barrier = new DeferredBarrier()
    const deferred = barrier.create<string>('key1')
    expect(deferred.promise).toBeInstanceOf(Promise)
    expect(typeof deferred.resolve).toBe('function')
    expect(typeof deferred.reject).toBe('function')
  })

  it('gets deferred by key', () => {
    const barrier = new DeferredBarrier()
    const deferred = barrier.create<string>('key1')
    const retrieved = barrier.get<string>('key1')
    expect(retrieved).toBe(deferred)
  })

  it('returns undefined for non-existent key', () => {
    const barrier = new DeferredBarrier()
    const retrieved = barrier.get<string>('nonexistent')
    expect(retrieved).toBeUndefined()
  })

  it('resolves deferred by key', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    const resolved = barrier.resolve('key1', 'value')
    expect(resolved).toBe(true)
    const deferred = barrier.get<string>('key1')
    await expect(deferred?.promise).resolves.toBe('value')
  })

  it('returns false when resolving non-existent key', () => {
    const barrier = new DeferredBarrier()
    const resolved = barrier.resolve('nonexistent', 'value')
    expect(resolved).toBe(false)
  })

  it('rejects deferred by key', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    const rejected = barrier.reject('key1', 'error')
    expect(rejected).toBe(true)
    const deferred = barrier.get<string>('key1')
    await expect(deferred?.promise).rejects.toBe('error')
  })

  it('returns false when rejecting non-existent key', () => {
    const barrier = new DeferredBarrier()
    const rejected = barrier.reject('nonexistent', 'error')
    expect(rejected).toBe(false)
  })

  it('tracks size correctly', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.size).toBe(0)
    barrier.create<string>('key1')
    expect(barrier.size).toBe(1)
    barrier.create<string>('key2')
    expect(barrier.size).toBe(2)
  })

  it('throws error for duplicate key', () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    expect(() => barrier.create<string>('key1')).toThrow('Deferred already exists for key: key1')
  })

  it('deletes deferred after resolution', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    barrier.resolve('key1', 'value')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(barrier.get('key1')).toBeUndefined()
  })

  it('deletes deferred after rejection', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    barrier.reject('key1', 'error')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(barrier.get('key1')).toBeUndefined()
  })

  it('handles multiple concurrent deferreds', async () => {
    const barrier = new DeferredBarrier()
    const d1 = barrier.create<string>('key1')
    const d2 = barrier.create<number>('key2')
    const d3 = barrier.create<boolean>('key3')
    expect(barrier.size).toBe(3)
    barrier.resolve('key1', 'value1')
    barrier.resolve('key2', 42)
    barrier.resolve('key3', true)
    await expect(d1.promise).resolves.toBe('value1')
    await expect(d2.promise).resolves.toBe(42)
    await expect(d3.promise).resolves.toBe(true)
  })

  it('resolves deferred with object value', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<{ a: number }>('key1')
    barrier.resolve('key1', { a: 1 })
    const deferred = barrier.get<{ a: number }>('key1')
    await expect(deferred?.promise).resolves.toEqual({ a: 1 })
  })

  it('rejects deferred with error object', async () => {
    const barrier = new DeferredBarrier()
    barrier.create<string>('key1')
    const error = new Error('test error')
    barrier.reject('key1', error)
    const deferred = barrier.get<string>('key1')
    await expect(deferred?.promise).rejects.toThrow('test error')
  })
})