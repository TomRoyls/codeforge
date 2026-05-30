import { describe, it, expect } from 'vitest'
import { HashMap } from '../src/utils/hash-map.js'

describe('HashMap SameValueZero equality', () => {
  it('distinguishes number 1 from string "1"', () => {
    const map = new HashMap<string | number, string>()
    map.set(1, 'number')
    map.set('1', 'string')
    expect(map.get(1)).toBe('number')
    expect(map.get('1')).toBe('string')
    expect(map.size).toBe(2)
  })

  it('handles NaN keys correctly', () => {
    const map = new HashMap<number, string>()
    map.set(NaN, 'not-a-number')
    expect(map.get(NaN)).toBe('not-a-number')
    expect(map.has(NaN)).toBe(true)
    expect(map.size).toBe(1)
  })

  it('handles numeric keys fast-path', () => {
    const map = new HashMap<number, number>()
    for (let i = 0; i < 1000; i++) map.set(i, i * 10)
    for (let i = 0; i < 1000; i++) {
      expect(map.get(i)).toBe(i * 10)
    }
  })

  it('works with options object form', () => {
    const map = new HashMap<number, string>({ initialCapacity: 32, loadFactor: 0.5 })
    map.set(1, 'one')
    expect(map.get(1)).toBe('one')
    expect(map.capacity).toBe(32)
  })

  it('works with custom hash function', () => {
    const map = new HashMap<string, number>({
      hashFn: (key: string) => {
        let h = 0
        for (let i = 0; i < key.length; i++) {
          h = ((h << 5) - h + key.charCodeAt(i)) | 0
        }
        return h >>> 0
      },
    })
    map.set('hello', 42)
    expect(map.get('hello')).toBe(42)
  })

  it('works with custom equality function', () => {
    const map = new HashMap<{ id: number }, string>({
      keyEqual: (a, b) => a.id === b.id,
      hashFn: (key) => key.id >>> 0,
    })
    map.set({ id: 1 }, 'first')
    expect(map.get({ id: 1 })).toBe('first')
    expect(map.get({ id: 2 })).toBeUndefined()
  })

  it('backward compatible with positional args', () => {
    const map = new HashMap<string, number>(8, 0.5)
    map.set('key', 42)
    expect(map.get('key')).toBe(42)
    expect(map.capacity).toBe(8)
  })
})
