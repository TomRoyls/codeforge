import { describe, it, expect } from 'vitest'
import { PairingArray } from '../../src/core/pairing-array/index.js'

describe('PairingArray', () => {
  describe('constructor', () => {
    it('creates empty PairingArray with no arguments', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.size()).toBe(0)
      expect(pa.isEmpty()).toBe(true)
    })

    it('creates PairingArray from initial entries', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.size()).toBe(3)
      expect(pa.get('a')).toBe(1)
      expect(pa.get('b')).toBe(2)
      expect(pa.get('c')).toBe(3)
    })

    it('creates PairingArray from empty entries array', () => {
      const pa = new PairingArray<string, number>([])
      expect(pa.size()).toBe(0)
      expect(pa.isEmpty()).toBe(true)
    })

    it('creates PairingArray from single entry', () => {
      const pa = new PairingArray<string, number>([['x', 42]])
      expect(pa.size()).toBe(1)
      expect(pa.get('x')).toBe(42)
    })

    it('creates PairingArray with number keys', () => {
      const pa = new PairingArray<number, string>([
        [1, 'one'],
        [2, 'two'],
      ])
      expect(pa.size()).toBe(2)
      expect(pa.get(1)).toBe('one')
      expect(pa.get(2)).toBe('two')
    })

    it('handles duplicate keys in constructor by keeping last', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['a', 2],
      ])
      expect(pa.size()).toBe(1)
      expect(pa.get('a')).toBe(2)
    })

    it('creates PairingArray with object values', () => {
      const pa = new PairingArray<string, { x: number }>([['p', { x: 1 }]])
      expect(pa.get('p')!.x).toBe(1)
    })
  })

  describe('set', () => {
    it('sets a key-value pair', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      expect(pa.get('a')).toBe(1)
    })

    it('sets multiple key-value pairs', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('b', 2)
      pa.set('c', 3)
      expect(pa.size()).toBe(3)
    })

    it('overwrites existing key with new value', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 2)
      expect(pa.get('a')).toBe(2)
      expect(pa.size()).toBe(1)
    })

    it('overwrites preserves insertion order', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('b', 2)
      pa.set('a', 10)
      expect(pa.keys()).toEqual(['a', 'b'])
      expect(pa.values()).toEqual([10, 2])
    })

    it('sets undefined as value', () => {
      const pa = new PairingArray<string, number | undefined>()
      pa.set('a', undefined)
      expect(pa.get('a')).toBeUndefined()
      expect(pa.has('a')).toBe(true)
      expect(pa.size()).toBe(1)
    })

    it('sets null as value', () => {
      const pa = new PairingArray<string, number | null>()
      pa.set('a', null)
      expect(pa.get('a')).toBeNull()
      expect(pa.has('a')).toBe(true)
    })

    it('sets values of different types', () => {
      const pa = new PairingArray<string, unknown>()
      pa.set('a', 1)
      pa.set('b', 'hello')
      pa.set('c', true)
      expect(pa.get('a')).toBe(1)
      expect(pa.get('b')).toBe('hello')
      expect(pa.get('c')).toBe(true)
    })

    it('handles setting after delete', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.delete('a')
      pa.set('a', 2)
      expect(pa.get('a')).toBe(2)
      expect(pa.size()).toBe(1)
    })

    it('returns void', () => {
      const pa = new PairingArray<string, number>()
      const result = pa.set('a', 1)
      expect(result).toBeUndefined()
    })
  })

  describe('get', () => {
    it('gets existing value', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.get('a')).toBe(1)
    })

    it('returns undefined for missing key', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.get('missing')).toBeUndefined()
    })

    it('gets value after overwrite', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 2)
      expect(pa.get('a')).toBe(2)
    })

    it('returns undefined after delete', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.delete('a')
      expect(pa.get('a')).toBeUndefined()
    })

    it('gets value from initial entries', () => {
      const pa = new PairingArray<string, number>([
        ['x', 10],
        ['y', 20],
      ])
      expect(pa.get('x')).toBe(10)
      expect(pa.get('y')).toBe(20)
    })
  })

  describe('getAt', () => {
    it('gets value at index 0', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.getAt(0)).toBe(1)
    })

    it('gets values at various indices', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.getAt(0)).toBe(1)
      expect(pa.getAt(1)).toBe(2)
      expect(pa.getAt(2)).toBe(3)
    })

    it('throws RangeError for out-of-bounds index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(() => pa.getAt(1)).toThrow(RangeError)
    })

    it('throws RangeError for negative index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(() => pa.getAt(-1)).toThrow(RangeError)
    })

    it('throws RangeError on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(() => pa.getAt(0)).toThrow(RangeError)
    })

    it('gets updated value after overwrite', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 99)
      expect(pa.getAt(0)).toBe(99)
    })

    it('gets value after middle deletion', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      expect(pa.getAt(0)).toBe(1)
      expect(pa.getAt(1)).toBe(3)
    })
  })

  describe('getKeyAt', () => {
    it('gets key at index 0', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.getKeyAt(0)).toBe('a')
    })

    it('gets keys at various indices', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.getKeyAt(0)).toBe('a')
      expect(pa.getKeyAt(1)).toBe('b')
      expect(pa.getKeyAt(2)).toBe('c')
    })

    it('throws RangeError for out-of-bounds index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(() => pa.getKeyAt(5)).toThrow(RangeError)
    })

    it('throws RangeError for negative index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(() => pa.getKeyAt(-1)).toThrow(RangeError)
    })

    it('throws RangeError on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(() => pa.getKeyAt(0)).toThrow(RangeError)
    })

    it('gets key after deletion shifts indices', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('a')
      expect(pa.getKeyAt(0)).toBe('b')
      expect(pa.getKeyAt(1)).toBe('c')
    })
  })

  describe('has', () => {
    it('returns true for existing key', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.has('a')).toBe(true)
    })

    it('returns false for missing key', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.has('a')).toBe(false)
    })

    it('returns false after delete', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.delete('a')
      expect(pa.has('a')).toBe(false)
    })

    it('returns true after overwrite', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 2)
      expect(pa.has('a')).toBe(true)
    })

    it('returns false after clear', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.clear()
      expect(pa.has('a')).toBe(false)
    })

    it('returns true for key set after delete', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.delete('a')
      pa.set('a', 2)
      expect(pa.has('a')).toBe(true)
    })
  })

  describe('delete', () => {
    it('deletes existing key and returns true', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.delete('a')).toBe(true)
      expect(pa.size()).toBe(0)
    })

    it('returns false for missing key', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.delete('missing')).toBe(false)
    })

    it('deletes from beginning', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('a')
      expect(pa.keys()).toEqual(['b', 'c'])
      expect(pa.size()).toBe(2)
    })

    it('deletes from middle', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      expect(pa.keys()).toEqual(['a', 'c'])
      expect(pa.values()).toEqual([1, 3])
      expect(pa.size()).toBe(2)
    })

    it('deletes from end', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('c')
      expect(pa.keys()).toEqual(['a', 'b'])
      expect(pa.size()).toBe(2)
    })

    it('deletes only entry', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.delete('a')
      expect(pa.isEmpty()).toBe(true)
    })

    it('can delete and re-add', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.delete('a')
      pa.set('a', 2)
      expect(pa.get('a')).toBe(2)
      expect(pa.size()).toBe(1)
    })

    it('maintains correct indices after multiple deletes', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
      pa.delete('b')
      expect(pa.indexOf('a')).toBe(0)
      expect(pa.indexOf('c')).toBe(1)
      expect(pa.indexOf('d')).toBe(2)
    })
  })

  describe('deleteAt', () => {
    it('deletes at index 0', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.deleteAt(0)).toBe(true)
      expect(pa.keys()).toEqual(['b'])
    })

    it('deletes at last index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.deleteAt(1)).toBe(true)
      expect(pa.keys()).toEqual(['a'])
    })

    it('deletes at middle index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.deleteAt(1)).toBe(true)
      expect(pa.keys()).toEqual(['a', 'c'])
      expect(pa.values()).toEqual([1, 3])
    })

    it('returns false for out-of-bounds index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.deleteAt(5)).toBe(false)
    })

    it('returns false for negative index', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.deleteAt(-1)).toBe(false)
    })

    it('returns false on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.deleteAt(0)).toBe(false)
    })

    it('updates indices correctly after deleteAt', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.deleteAt(0)
      expect(pa.indexOf('b')).toBe(0)
      expect(pa.indexOf('c')).toBe(1)
    })

    it('removes key from lookup after deleteAt', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.deleteAt(0)
      expect(pa.has('a')).toBe(false)
      expect(pa.has('b')).toBe(true)
    })
  })

  describe('indexOf', () => {
    it('returns 0 for first key', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.indexOf('a')).toBe(0)
    })

    it('returns correct index for middle key', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.indexOf('b')).toBe(1)
    })

    it('returns -1 for missing key', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.indexOf('missing')).toBe(-1)
    })

    it('returns -1 on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.indexOf('a')).toBe(-1)
    })

    it('returns updated index after deletion', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('a')
      expect(pa.indexOf('b')).toBe(0)
      expect(pa.indexOf('c')).toBe(1)
    })
  })

  describe('size', () => {
    it('returns 0 for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.size()).toBe(0)
    })

    it('returns correct size after adds', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('b', 2)
      expect(pa.size()).toBe(2)
    })

    it('returns correct size after overwrites', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 2)
      expect(pa.size()).toBe(1)
    })

    it('returns correct size after deletes', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.delete('a')
      expect(pa.size()).toBe(1)
    })

    it('returns correct size after clear', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.clear()
      expect(pa.size()).toBe(0)
    })
  })

  describe('isEmpty', () => {
    it('returns true for new PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.isEmpty()).toBe(true)
    })

    it('returns false after set', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      expect(pa.isEmpty()).toBe(false)
    })

    it('returns true after deleting all entries', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.delete('a')
      expect(pa.isEmpty()).toBe(true)
    })

    it('returns true after clear', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.clear()
      expect(pa.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('clears all entries', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.clear()
      expect(pa.size()).toBe(0)
      expect(pa.isEmpty()).toBe(true)
    })

    it('clears empty PairingArray without error', () => {
      const pa = new PairingArray<string, number>()
      pa.clear()
      expect(pa.size()).toBe(0)
    })

    it('allows operations after clear', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.clear()
      pa.set('b', 2)
      expect(pa.get('b')).toBe(2)
      expect(pa.size()).toBe(1)
    })

    it('removes all keys from lookup', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.clear()
      expect(pa.has('a')).toBe(false)
      expect(pa.has('b')).toBe(false)
    })
  })

  describe('keys', () => {
    it('returns empty array for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.keys()).toEqual([])
    })

    it('returns keys in insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['c', 3],
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.keys()).toEqual(['c', 'a', 'b'])
    })

    it('returns keys after delete', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      expect(pa.keys()).toEqual(['a', 'c'])
    })

    it('returns keys after overwrite', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('b', 2)
      pa.set('a', 10)
      expect(pa.keys()).toEqual(['a', 'b'])
    })
  })

  describe('values', () => {
    it('returns empty array for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.values()).toEqual([])
    })

    it('returns values in insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.values()).toEqual([1, 2, 3])
    })

    it('returns updated values after overwrite', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 99)
      expect(pa.values()).toEqual([99])
    })

    it('returns values after delete', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('a')
      expect(pa.values()).toEqual([2, 3])
    })
  })

  describe('entries', () => {
    it('returns empty array for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.entries()).toEqual([])
    })

    it('returns entries in insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.entries()).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('returns entries after modifications', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      pa.set('a', 10)
      expect(pa.entries()).toEqual([
        ['a', 10],
        ['c', 3],
      ])
    })

    it('returns independent copies', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const e = pa.entries()
      e[0]![1] = 999
      expect(pa.get('a')).toBe(1)
    })
  })

  describe('forEach', () => {
    it('calls callback for each entry', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const result: Array<[V: number, K: string, I: number]> = []
      pa.forEach((v, k, i) => {
        result.push([v, k, i])
      })
      expect(result).toEqual([
        [1, 'a', 0],
        [2, 'b', 1],
        [3, 'c', 2],
      ])
    })

    it('does not call on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      let calls = 0
      pa.forEach(() => {
        calls++
      })
      expect(calls).toBe(0)
    })

    it('provides correct indices', () => {
      const pa = new PairingArray<string, number>([
        ['x', 10],
        ['y', 20],
      ])
      const indices: number[] = []
      pa.forEach((_v, _k, i) => {
        indices.push(i)
      })
      expect(indices).toEqual([0, 1])
    })

    it('provides correct key-value pairs', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.forEach((v, k, _i) => {
        expect(k).toBe('a')
        expect(v).toBe(1)
      })
    })

    it('iterates in insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['c', 3],
        ['a', 1],
        ['b', 2],
      ])
      const keys: string[] = []
      pa.forEach((_v, k) => {
        keys.push(k)
      })
      expect(keys).toEqual(['c', 'a', 'b'])
    })
  })

  describe('Symbol.iterator', () => {
    it('iterates over entries', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const result: Array<[string, number]> = []
      for (const entry of pa) {
        result.push(entry)
      }
      expect(result).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('yields nothing for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      const result: Array<[string, number]> = []
      for (const entry of pa) {
        result.push(entry)
      }
      expect(result).toEqual([])
    })

    it('works with spread operator', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect([...pa]).toEqual([['a', 1]])
    })

    it('works with Array.from', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(Array.from(pa)).toEqual([
        ['a', 1],
        ['b', 2],
      ])
    })

    it('works with destructuring', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const [[key, value]] = pa
      expect(key).toBe('a')
      expect(value).toBe(1)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.toArray()).toEqual([])
    })

    it('returns values in insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.toArray()).toEqual([1, 2, 3])
    })

    it('returns updated values', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 99)
      expect(pa.toArray()).toEqual([99])
    })
  })

  describe('map', () => {
    it('maps values to new PairingArray', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const mapped = pa.map((v) => v * 2)
      expect(mapped.values()).toEqual([2, 4, 6])
      expect(mapped.keys()).toEqual(['a', 'b', 'c'])
    })

    it('preserves keys', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const mapped = pa.map((v, k) => `${k}:${v}`)
      expect(mapped.get('a')).toBe('a:1')
    })

    it('provides correct index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const indices: number[] = []
      pa.map((_v, _k, i) => {
        indices.push(i)
        return i
      })
      expect(indices).toEqual([0, 1])
    })

    it('returns new PairingArray instance', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const mapped = pa.map((v) => v)
      expect(mapped).not.toBe(pa)
    })

    it('does not modify original', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.map((v) => v * 10)
      expect(pa.get('a')).toBe(1)
    })

    it('handles empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      const mapped = pa.map((v) => v * 2)
      expect(mapped.isEmpty()).toBe(true)
    })

    it('maps to different type', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const mapped = pa.map((v) => String(v))
      expect(mapped.get('a')).toBe('1')
    })
  })

  describe('filter', () => {
    it('filters entries by value', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
      const filtered = pa.filter((v) => v > 2)
      expect(filtered.entries()).toEqual([
        ['c', 3],
        ['d', 4],
      ])
    })

    it('filters by key', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const filtered = pa.filter((_v, k) => k !== 'b')
      expect(filtered.keys()).toEqual(['a', 'c'])
    })

    it('filters by index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const filtered = pa.filter((_v, _k, i) => i % 2 === 0)
      expect(filtered.entries()).toEqual([
        ['a', 1],
        ['c', 3],
      ])
    })

    it('returns empty when all filtered out', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const filtered = pa.filter(() => false)
      expect(filtered.isEmpty()).toBe(true)
    })

    it('returns all when none filtered out', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const filtered = pa.filter(() => true)
      expect(filtered.entries()).toEqual([['a', 1]])
    })

    it('returns new PairingArray instance', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const filtered = pa.filter(() => true)
      expect(filtered).not.toBe(pa)
    })

    it('does not modify original', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      pa.filter(() => false)
      expect(pa.size()).toBe(1)
    })

    it('handles empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      const filtered = pa.filter(() => true)
      expect(filtered.isEmpty()).toBe(true)
    })
  })

  describe('find', () => {
    it('finds value by predicate', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.find((v) => v === 2)).toBe(2)
    })

    it('returns undefined when not found', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.find((v) => v === 99)).toBeUndefined()
    })

    it('finds by key', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.find((_v, k) => k === 'b')).toBe(2)
    })

    it('finds by index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.find((_v, _k, i) => i === 1)).toBe(2)
    })

    it('returns first match', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 1],
      ])
      expect(pa.find((v) => v === 1)).toBe(1)
    })

    it('returns undefined on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.find(() => true)).toBeUndefined()
    })
  })

  describe('findKey', () => {
    it('finds key by predicate', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.findKey((v) => v === 2)).toBe('b')
    })

    it('returns undefined when not found', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      expect(pa.findKey((v) => v === 99)).toBeUndefined()
    })

    it('finds by value', () => {
      const pa = new PairingArray<string, number>([
        ['x', 10],
        ['y', 20],
      ])
      expect(pa.findKey((v) => v > 15)).toBe('y')
    })

    it('returns first matching key', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 1],
      ])
      expect(pa.findKey((v) => v === 1)).toBe('a')
    })

    it('returns undefined on empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.findKey(() => true)).toBeUndefined()
    })
  })

  describe('every', () => {
    it('returns true when all pass', () => {
      const pa = new PairingArray<string, number>([
        ['a', 2],
        ['b', 4],
        ['c', 6],
      ])
      expect(pa.every((v) => v % 2 === 0)).toBe(true)
    })

    it('returns false when some fail', () => {
      const pa = new PairingArray<string, number>([
        ['a', 2],
        ['b', 3],
      ])
      expect(pa.every((v) => v % 2 === 0)).toBe(false)
    })

    it('returns true for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.every(() => false)).toBe(true)
    })

    it('checks key and index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.every((_v, k) => k.length === 1)).toBe(true)
      expect(pa.every((_v, _k, i) => i >= 0)).toBe(true)
    })
  })

  describe('some', () => {
    it('returns true when at least one passes', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.some((v) => v === 2)).toBe(true)
    })

    it('returns false when none pass', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.some((v) => v > 10)).toBe(false)
    })

    it('returns false for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.some(() => true)).toBe(false)
    })

    it('checks key and index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.some((_v, k) => k === 'b')).toBe(true)
      expect(pa.some((_v, _k, i) => i === 1)).toBe(true)
    })
  })

  describe('reduce', () => {
    it('sums values', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      expect(pa.reduce((acc, v) => acc + v, 0)).toBe(6)
    })

    it('builds object from entries', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const result = pa.reduce<Record<string, number>>((acc, v, k) => {
        acc[k] = v
        return acc
      }, {})
      expect(result).toEqual({ a: 1, b: 2 })
    })

    it('provides correct index', () => {
      const pa = new PairingArray<string, number>([
        ['a', 10],
        ['b', 20],
      ])
      const result = pa.reduce<number[]>((acc, _v, _k, i) => {
        acc.push(i)
        return acc
      }, [])
      expect(result).toEqual([0, 1])
    })

    it('returns initial for empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      expect(pa.reduce((acc, v) => acc + v, 42)).toBe(42)
    })

    it('concatenates strings', () => {
      const pa = new PairingArray<string, string>([
        ['a', 'hello'],
        ['b', 'world'],
      ])
      expect(pa.reduce((acc, v) => acc + ' ' + v, '')).toBe(' hello world')
    })
  })

  describe('clone', () => {
    it('creates independent copy', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const cloned = pa.clone()
      expect(cloned.entries()).toEqual(pa.entries())
      expect(cloned).not.toBe(pa)
    })

    it('modifications to clone do not affect original', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const cloned = pa.clone()
      cloned.set('a', 99)
      expect(pa.get('a')).toBe(1)
      expect(cloned.get('a')).toBe(99)
    })

    it('deletions from clone do not affect original', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      const cloned = pa.clone()
      cloned.delete('a')
      expect(pa.size()).toBe(2)
      expect(cloned.size()).toBe(1)
    })

    it('clones empty PairingArray', () => {
      const pa = new PairingArray<string, number>()
      const cloned = pa.clone()
      expect(cloned.isEmpty()).toBe(true)
    })

    it('preserves insertion order', () => {
      const pa = new PairingArray<string, number>([
        ['c', 3],
        ['a', 1],
        ['b', 2],
      ])
      const cloned = pa.clone()
      expect(cloned.keys()).toEqual(['c', 'a', 'b'])
    })
  })

  describe('fromArray', () => {
    it('creates PairingArray from entries', () => {
      const pa = PairingArray.fromArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      expect(pa.size()).toBe(2)
      expect(pa.get('a')).toBe(1)
      expect(pa.get('b')).toBe(2)
    })

    it('creates from empty array', () => {
      const pa = PairingArray.fromArray<string, number>([])
      expect(pa.isEmpty()).toBe(true)
    })

    it('creates from single entry', () => {
      const pa = PairingArray.fromArray<string, number>([['x', 42]])
      expect(pa.get('x')).toBe(42)
    })

    it('handles duplicate keys by keeping last', () => {
      const pa = PairingArray.fromArray<string, number>([
        ['a', 1],
        ['a', 2],
      ])
      expect(pa.get('a')).toBe(2)
      expect(pa.size()).toBe(1)
    })

    it('returns PairingArray instance', () => {
      const pa = PairingArray.fromArray<string, number>([])
      expect(pa).toBeInstanceOf(PairingArray)
    })
  })

  describe('edge cases', () => {
    it('handles many entries', () => {
      const entries: Array<[number, string]> = []
      for (let i = 0; i < 1000; i++) {
        entries.push([i, `val-${i}`])
      }
      const pa = new PairingArray(entries)
      expect(pa.size()).toBe(1000)
      expect(pa.get(500)).toBe('val-500')
      expect(pa.indexOf(999)).toBe(999)
    })

    it('handles sequential deletes', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
        ['e', 5],
      ])
      pa.delete('a')
      pa.delete('c')
      pa.delete('e')
      expect(pa.entries()).toEqual([
        ['b', 2],
        ['d', 4],
      ])
    })

    it('handles alternating set and delete', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.delete('a')
      pa.set('b', 2)
      pa.delete('b')
      pa.set('c', 3)
      expect(pa.size()).toBe(1)
      expect(pa.get('c')).toBe(3)
    })

    it('handles overwrite then delete then re-add', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      pa.set('a', 2)
      pa.delete('a')
      pa.set('a', 3)
      expect(pa.get('a')).toBe(3)
      expect(pa.size()).toBe(1)
      expect(pa.indexOf('a')).toBe(0)
    })

    it('handles falsy values correctly', () => {
      const pa = new PairingArray<string, number | boolean | null>()
      pa.set('zero', 0)
      pa.set('false', false)
      pa.set('null', null)
      expect(pa.get('zero')).toBe(0)
      expect(pa.get('false')).toBe(false)
      expect(pa.get('null')).toBeNull()
      expect(pa.has('zero')).toBe(true)
      expect(pa.has('false')).toBe(true)
      expect(pa.has('null')).toBe(true)
    })

    it('handles empty string keys', () => {
      const pa = new PairingArray<string, number>()
      pa.set('', 42)
      expect(pa.get('')).toBe(42)
      expect(pa.has('')).toBe(true)
    })

    it('handles number keys including 0', () => {
      const pa = new PairingArray<number, string>()
      pa.set(0, 'zero')
      pa.set(-1, 'neg')
      expect(pa.get(0)).toBe('zero')
      expect(pa.get(-1)).toBe('neg')
    })

    it('delete middle then check indexOf for remaining', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
        ['e', 5],
      ])
      pa.delete('c')
      expect(pa.indexOf('a')).toBe(0)
      expect(pa.indexOf('b')).toBe(1)
      expect(pa.indexOf('d')).toBe(2)
      expect(pa.indexOf('e')).toBe(3)
      expect(pa.indexOf('c')).toBe(-1)
    })

    it('deleteAt middle then check indexOf', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.deleteAt(1)
      expect(pa.indexOf('a')).toBe(0)
      expect(pa.indexOf('c')).toBe(1)
    })

    it('getAt after multiple operations', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
      pa.delete('b')
      pa.set('a', 10)
      expect(pa.getAt(0)).toBe(10)
      expect(pa.getAt(1)).toBe(3)
      expect(pa.getAt(2)).toBe(4)
    })

    it('getKeyAt after multiple operations', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('a')
      pa.set('d', 4)
      expect(pa.getKeyAt(0)).toBe('b')
      expect(pa.getKeyAt(1)).toBe('c')
      expect(pa.getKeyAt(2)).toBe('d')
    })

    it('map with complex transformation', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const mapped = pa.map((v, k, i) => ({ v, k, i }))
      expect(mapped.get('a')).toEqual({ v: 1, k: 'a', i: 0 })
      expect(mapped.get('b')).toEqual({ v: 2, k: 'b', i: 1 })
    })

    it('reduce to build string', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      const result = pa.reduce((acc, v, k) => acc + k + v, '')
      expect(result).toBe('a1b2c3')
    })

    it('filter then map chain', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
      ])
      const result = pa.filter((v) => v > 1).map((v) => v * 10)
      expect(result.values()).toEqual([20, 30, 40])
    })

    it('clone with many entries', () => {
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 100; i++) {
        entries.push([`k${i}`, i])
      }
      const pa = new PairingArray(entries)
      const cloned = pa.clone()
      expect(cloned.size()).toBe(100)
      expect(cloned.get('k50')).toBe(50)
    })

    it('forEach after delete', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      const result: string[] = []
      pa.forEach((_v, k) => {
        result.push(k)
      })
      expect(result).toEqual(['a', 'c'])
    })

    it('iterator after delete', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.delete('b')
      const result = [...pa]
      expect(result).toEqual([
        ['a', 1],
        ['c', 3],
      ])
    })

    it('type safety with string keys and number values', () => {
      const pa = new PairingArray<string, number>()
      pa.set('a', 1)
      const val: number | undefined = pa.get('a')
      expect(val).toBe(1)
    })

    it('type safety with number keys and string values', () => {
      const pa = new PairingArray<number, string>()
      pa.set(1, 'one')
      const val: string | undefined = pa.get(1)
      expect(val).toBe('one')
    })

    it('map changes value type', () => {
      const pa = new PairingArray<string, number>([['a', 1]])
      const mapped = pa.map((v) => v > 0)
      expect(mapped.get('a')).toBe(true)
    })

    it('clear and reuse', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
      ])
      pa.clear()
      expect(pa.size()).toBe(0)
      pa.set('c', 3)
      pa.set('d', 4)
      expect(pa.size()).toBe(2)
      expect(pa.entries()).toEqual([
        ['c', 3],
        ['d', 4],
      ])
    })

    it('set overwrites value but preserves position', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
      pa.set('b', 99)
      expect(pa.getAt(1)).toBe(99)
      expect(pa.getKeyAt(1)).toBe('b')
      expect(pa.values()).toEqual([1, 99, 3])
    })

    it('constructor with many entries preserves order', () => {
      const entries: Array<[string, number]> = []
      for (let i = 0; i < 50; i++) {
        entries.push([`key${i}`, i])
      }
      const pa = new PairingArray(entries)
      for (let i = 0; i < 50; i++) {
        expect(pa.getAt(i)).toBe(i)
        expect(pa.getKeyAt(i)).toBe(`key${i}`)
      }
    })

    it('fromArray static method works with various types', () => {
      const pa = PairingArray.fromArray<number, boolean>([
        [1, true],
        [0, false],
      ])
      expect(pa.get(1)).toBe(true)
      expect(pa.get(0)).toBe(false)
    })

    it('multiple deletes preserve integrity', () => {
      const pa = new PairingArray<string, number>([
        ['a', 1],
        ['b', 2],
        ['c', 3],
        ['d', 4],
        ['e', 5],
      ])
      pa.delete('c')
      pa.delete('a')
      pa.delete('e')
      expect(pa.size()).toBe(2)
      expect(pa.keys()).toEqual(['b', 'd'])
      expect(pa.values()).toEqual([2, 4])
      expect(pa.indexOf('b')).toBe(0)
      expect(pa.indexOf('d')).toBe(1)
    })

    it('every and some with single entry', () => {
      const pa = new PairingArray<string, number>([['a', 5]])
      expect(pa.every((v) => v > 0)).toBe(true)
      expect(pa.some((v) => v > 10)).toBe(false)
    })

    it('find returns first match among many', () => {
      const pa = new PairingArray<string, number>([
        ['a', 10],
        ['b', 20],
        ['c', 20],
        ['d', 30],
      ])
      expect(pa.find((v) => v === 20)).toBe(20)
      expect(pa.findKey((v) => v === 20)).toBe('b')
    })
  })
})
