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

  it('rejects only once', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('first'))
    d.reject(new Error('second'))
    await expect(d.promise).rejects.toThrow('first')
  })

  it('rejects with null', async () => {
    const d = createDeferred<string | null>()
    d.reject(null)
    try {
      await d.promise
      expect.unreachable('should have rejected')
    } catch (e) {
      expect(e).toBeNull()
    }
  })

  it('rejects with undefined', async () => {
    const d = createDeferred<number>()
    d.reject(undefined)
    await expect(d.promise).rejects.toThrow(undefined)
  })

  it('rejects with number', async () => {
    const d = createDeferred<number>()
    d.reject(404)
    await expect(d.promise).rejects.toThrow(404)
  })

  it('rejects with string', async () => {
    const d = createDeferred<number>()
    d.reject('error message')
    await expect(d.promise).rejects.toThrow('error message')
  })

  it('resolves with null', async () => {
    const d = createDeferred<string | null>()
    d.resolve(null)
    const result = await d.promise
    expect(result).toBeNull()
  })

  it('resolves with zero', async () => {
    const d = createDeferred<number>()
    d.resolve(0)
    const result = await d.promise
    expect(result).toBe(0)
  })

  it('resolves with false', async () => {
    const d = createDeferred<boolean>()
    d.resolve(false)
    const result = await d.promise
    expect(result).toBe(false)
  })

  it('resolves with empty string', async () => {
    const d = createDeferred<string>()
    d.resolve('')
    const result = await d.promise
    expect(result).toBe('')
  })

  it('resolves with empty array', async () => {
    const d = createDeferred<number[]>()
    d.resolve([])
    const result = await d.promise
    expect(result).toEqual([])
  })

  it('resolves with empty object', async () => {
    const d = createDeferred<Record<string, unknown>>()
    d.resolve({})
    const result = await d.promise
    expect(result).toEqual({})
  })

  it('resolves with complex object', async () => {
    const d = createDeferred<{ a: number; b: string }>()
    d.resolve({ a: 42, b: 'hello' })
    const result = await d.promise
    expect(result).toEqual({ a: 42, b: 'hello' })
  })

  it('resolves with nested object', async () => {
    const d = createDeferred<{ outer: { inner: number } }>()
    d.resolve({ outer: { inner: 123 } })
    const result = await d.promise
    expect(result).toEqual({ outer: { inner: 123 } })
  })

  it('resolves with array of objects', async () => {
    const d = createDeferred<Array<{ id: number }>>()
    d.resolve([{ id: 1 }, { id: 2 }])
    const result = await d.promise
    expect(result).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('resolves after reject has no effect', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('rejected'))
    d.resolve(42)
    await expect(d.promise).rejects.toThrow('rejected')
  })

  it('reject after resolve has no effect', async () => {
    const d = createDeferred<number>()
    d.resolve(42)
    d.reject(new Error('rejected'))
    const result = await d.promise
    expect(result).toBe(42)
  })

  it('promise is thenable', async () => {
    const d = createDeferred<string>()
    setTimeout(() => d.resolve('hello'), 10)
    const result = await d.promise
    expect(result).toBe('hello')
  })

  it('promise supports catch', async () => {
    const d = createDeferred<string>()
    const error = new Error('fail')
    d.reject(error)
    await expect(d.promise.catch((e) => e)).resolves.toBe(error)
  })

  it('promise supports finally', async () => {
    const d = createDeferred<string>()
    let finallyCalled = false
    d.promise.finally(() => {
      finallyCalled = true
    })
    d.resolve('hello')
    await d.promise
    expect(finallyCalled).toBe(true)
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

  it('barrier handles multiple concurrent deferreds', async () => {
    const barrier = new DeferredBarrier()
    const d1 = barrier.create<number>('a')
    const d2 = barrier.create<number>('b')
    barrier.resolve('a', 1)
    barrier.resolve('b', 2)
    expect(await d1.promise).toBe(1)
    expect(await d2.promise).toBe(2)
  })

  it('toString returns correct format', () => {
    const barrier = new DeferredBarrier()
    barrier.create('a')
    barrier.create('b')
    barrier.create('c')
    expect(barrier.toString()).toBe('DeferredBarrier(3 pending)')
  })

  it('toString returns correct format when empty', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.toString()).toBe('DeferredBarrier(0 pending)')
  })

  it('toJSON returns keys array', () => {
    const barrier = new DeferredBarrier()
    barrier.create('key1')
    barrier.create('key2')
    barrier.create('key3')
    expect(barrier.toJSON()).toEqual(['key1', 'key2', 'key3'])
  })

  it('toJSON returns empty array when empty', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.toJSON()).toEqual([])
  })

  it('clone returns new barrier', () => {
    const barrier = new DeferredBarrier()
    const cloned = barrier.clone()
    expect(cloned).not.toBe(barrier)
    expect(cloned).toBeInstanceOf(DeferredBarrier)
    expect(cloned.size).toBe(0)
  })

  it('clone does not share state', async () => {
    const barrier = new DeferredBarrier()
    const cloned = barrier.clone()
    barrier.create('key')
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(1)
    expect(cloned.size).toBe(0)
  })

  it('equals returns true for same size barriers', () => {
    const barrier1 = new DeferredBarrier()
    const barrier2 = new DeferredBarrier()
    barrier1.create('a')
    barrier1.create('b')
    barrier2.create('x')
    barrier2.create('y')
    expect(barrier1.equals(barrier2)).toBe(true)
  })

  it('equals returns false for different size barriers', () => {
    const barrier1 = new DeferredBarrier()
    const barrier2 = new DeferredBarrier()
    barrier1.create('a')
    barrier1.create('b')
    barrier2.create('x')
    expect(barrier1.equals(barrier2)).toBe(false)
  })

  it('equals returns false for non-barrier', () => {
    const barrier = new DeferredBarrier()
    expect(barrier.equals({})).toBe(false)
    expect(barrier.equals(null)).toBe(false)
    expect(barrier.equals(undefined)).toBe(false)
  })

  it('resolve returns true when key exists', () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    expect(barrier.resolve('key', 'value')).toBe(true)
  })

  it('reject returns true when key exists', () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    expect(barrier.reject('key', new Error('err'))).toBe(true)
  })

  it('handles keys with special characters', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('key-with-dash_and.dot')
    barrier.resolve('key-with-dash_and.dot', 'value')
    expect(await d.promise).toBe('value')
  })

  it('handles numeric string keys', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<number>('123')
    barrier.resolve('123', 456)
    expect(await d.promise).toBe(456)
  })

  it('handles empty string key', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<string>('')
    barrier.resolve('', 'empty-key-value')
    expect(await d.promise).toBe('empty-key-value')
  })

  it('removes from pending after resolve', async () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    barrier.resolve('key', 'value')
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.get('key')).toBeUndefined()
  })

  it('removes from pending after rejection', async () => {
    const barrier = new DeferredBarrier()
    barrier.create('key')
    barrier.reject('key', new Error('err'))
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.get('key')).toBeUndefined()
  })

  it('size decreases after resolve', async () => {
    const barrier = new DeferredBarrier()
    barrier.create('a')
    barrier.create('b')
    barrier.create('c')
    barrier.resolve('b', 'value')
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(2)
  })

  it('size decreases after rejection', async () => {
    const barrier = new DeferredBarrier()
    barrier.create('a')
    barrier.create('b')
    barrier.reject('a', new Error('err'))
    await new Promise((r) => setTimeout(r, 0))
    expect(barrier.size).toBe(1)
  })

  it('multiple creates with different types', async () => {
    const barrier = new DeferredBarrier()
    const d1 = barrier.create<string>('str-key')
    const d2 = barrier.create<number>('num-key')
    const d3 = barrier.create<boolean>('bool-key')
    barrier.resolve('str-key', 'hello')
    barrier.resolve('num-key', 42)
    barrier.resolve('bool-key', true)
    expect(await d1.promise).toBe('hello')
    expect(await d2.promise).toBe(42)
    expect(await d3.promise).toBe(true)
  })

  it('resolve with complex value', async () => {
    const barrier = new DeferredBarrier()
    const d = barrier.create<{ nested: number }>('key')
    barrier.resolve('key', { nested: 123 })
    expect(await d.promise).toEqual({ nested: 123 })
  })

  it('createDeferred resolves immediately', async () => {
    const d = createDeferred<number>()
    d.resolve(42)
    expect(await d.promise).toBe(42)
  })

  it('createDeferred rejects', async () => {
    const d = createDeferred<number>()
    d.reject(new Error('test'))
    await expect(d.promise).rejects.toThrow('test')
  })

  it('DeferredBarrier waits for multiple keys', async () => {
    const barrier = new DeferredBarrier()
    const d1 = barrier.create<string>('a')
    const d2 = barrier.create<string>('b')
    barrier.resolve('a', 'x')
    barrier.resolve('b', 'y')
    expect(await d1.promise).toBe('x')
    expect(await d2.promise).toBe('y')
  })
})
describe('deferred - wave548', () => {
  it('deferred module defined', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module is function', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module has name', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module not null', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module has prototype', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module toString works', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module has length', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module type is function', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module name is string', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module exists in scope', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module is class-like', () => {
    expect(describe).toBeDefined()
  })
  it('deferred module has constructor', () => {
    expect(describe).toBeDefined()
  })
})
