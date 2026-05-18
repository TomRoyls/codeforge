import { ChunkedList, DEFAULT_CHUNK_SIZE } from '../src/core/chunked-list/chunked-list.js'
import type { ChunkedListOptions, ChunkedListStats } from '../src/core/chunked-list/chunked-list.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('ChunkedList', () => {
  describe('constructor', () => {
    it('creates an empty list with default chunk size', () => {
      const list = new ChunkedList<number>()
      expect(list.length).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })

    it('creates an empty list with custom chunk size via number', () => {
      const list = new ChunkedList<number>(8)
      expect(list.length).toBe(0)
      expect(list.chunkCount).toBe(0)
    })

    it('creates an empty list with chunk size 1', () => {
      const list = new ChunkedList<number>(1)
      expect(list.length).toBe(0)
    })

    it('clamps negative chunk size to 1', () => {
      const list = new ChunkedList<number>(-5)
      list.append(1)
      list.append(2)
      expect(list.length).toBe(2)
      expect(list.chunkCount).toBe(2)
    })

    it('clamps chunk size 0 to 1', () => {
      const list = new ChunkedList<number>(0)
      list.append(1)
      list.append(2)
      expect(list.chunkCount).toBe(2)
    })

    it('accepts options object with chunkSize', () => {
      const list = new ChunkedList<number>({ chunkSize: 16 })
      expect(list.length).toBe(0)
    })

    it('uses default chunk size when options is empty object', () => {
      const list = new ChunkedList<number>({})
      expect(list.length).toBe(0)
    })

    it('uses default chunk size when called with no arguments', () => {
      const list = new ChunkedList<number>()
      list.append(1)
      list.append(2)

      expect(list.chunkCount).toBe(1)
    })

    it('exports DEFAULT_CHUNK_SIZE as 64', () => {
      expect(DEFAULT_CHUNK_SIZE).toBe(64)
    })
  })

  // ─── append ────────────────────────────────────────────────────────────

  describe('append', () => {
    it('adds a single element', () => {
      const list = new ChunkedList<number>(4)
      list.append(10)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(10)
    })

    it('adds multiple elements in order', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.append(3)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
      expect(list.get(2)).toBe(3)
    })

    it('creates new chunks when current chunk is full', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      expect(list.chunkCount).toBe(1)
      list.append(2)
      expect(list.chunkCount).toBe(1)
      list.append(3)
      expect(list.chunkCount).toBe(2)
    })

    it('handles appending to empty list', () => {
      const list = new ChunkedList<number>(4)
      list.append(42)
      expect(list.length).toBe(1)
      expect(list.isEmpty()).toBe(false)
    })

    it('handles string elements', () => {
      const list = new ChunkedList<string>(2)
      list.append('hello')
      list.append('world')
      expect(list.toArray()).toEqual(['hello', 'world'])
    })

    it('handles object elements', () => {
      const list = new ChunkedList<{ id: number }>(2)
      list.append({ id: 1 })
      list.append({ id: 2 })
      expect(list.get(0)?.id).toBe(1)
      expect(list.get(1)?.id).toBe(2)
    })
  })

  // ─── prepend ───────────────────────────────────────────────────────────

  describe('prepend', () => {
    it('adds element to front of empty list', () => {
      const list = new ChunkedList<number>(4)
      list.prepend(42)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(42)
    })

    it('adds element to front of non-empty list', () => {
      const list = new ChunkedList<number>(4)
      list.append(2)
      list.prepend(1)
      expect(list.get(0)).toBe(1)
      expect(list.get(1)).toBe(2)
    })

    it('prepends multiple elements maintaining reverse insertion order', () => {
      const list = new ChunkedList<number>(4)
      list.prepend(3)
      list.prepend(2)
      list.prepend(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('creates new chunk when first chunk is full', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      expect(list.chunkCount).toBe(1)
      list.prepend(0)
      expect(list.chunkCount).toBe(2)
      expect(list.get(0)).toBe(0)
    })

    it('decrements length after removal', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.remove(0)
      expect(list.length).toBe(1)
    })
  })

  // ─── indexOf ───────────────────────────────────────────────────────────

  describe('indexOf', () => {
    it('returns index of found element', () => {
      const list = new ChunkedList<number>(4)
      list.append(10)
      list.append(20)
      list.append(30)
      expect(list.indexOf(20)).toBe(1)
    })

    it('returns first occurrence', () => {
      const list = new ChunkedList<number>(4)
      list.append(10)
      list.append(20)
      list.append(20)
      expect(list.indexOf(20)).toBe(1)
    })

    it('returns -1 when element not found', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      expect(list.indexOf(99)).toBe(-1)
    })

    it('returns -1 on empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.indexOf(1)).toBe(-1)
    })

    it('finds elements across chunk boundaries', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      expect(list.indexOf(3)).toBe(2)
      expect(list.indexOf(4)).toBe(3)
    })

    it('finds string elements', () => {
      const list = new ChunkedList<string>(4)
      list.append('a')
      list.append('b')
      list.append('c')
      expect(list.indexOf('b')).toBe(1)
    })
  })

  // ─── contains ──────────────────────────────────────────────────────────

  describe('contains', () => {
    it('returns true when element exists', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      expect(list.contains(2)).toBe(true)
    })

    it('returns false when element does not exist', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.contains(99)).toBe(false)
    })

    it('returns false on empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.contains(1)).toBe(false)
    })
  })

  // ─── toArray ───────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('converts to plain array', () => {
      const list = new ChunkedList<number>(2)
      list.append(10)
      list.append(20)
      list.append(30)
      expect(list.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty array for empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.toArray()).toEqual([])
    })

    it('returns a new array each time', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const a1 = list.toArray()
      const a2 = list.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })

    it('preserves element order across chunks', () => {
      const list = new ChunkedList<number>(2)
      for (let i = 0; i < 7; i++) list.append(i)
      expect(list.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6])
    })
  })

  // ─── length / isEmpty ──────────────────────────────────────────────────

  describe('length and isEmpty', () => {
    it('length returns 0 for empty list', () => {
      expect(new ChunkedList<number>().length).toBe(0)
    })

    it('isEmpty returns true for empty list', () => {
      expect(new ChunkedList<number>().isEmpty()).toBe(true)
    })

    it('length tracks elements after append', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.length).toBe(1)
      expect(list.isEmpty()).toBe(false)
      list.append(2)
      expect(list.length).toBe(2)
    })

    it('length tracks elements after remove', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.remove(0)
      expect(list.length).toBe(1)
      list.remove(0)
      expect(list.length).toBe(0)
      expect(list.isEmpty()).toBe(true)
    })
  })

  // ─── clear ─────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears a non-empty list', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.clear()
      expect(list.length).toBe(0)
      expect(list.isEmpty()).toBe(true)
      expect(list.chunkCount).toBe(0)
    })

    it('clears an already empty list', () => {
      const list = new ChunkedList<number>()
      list.clear()
      expect(list.length).toBe(0)
    })

    it('allows operations after clear', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.clear()
      list.append(2)
      expect(list.length).toBe(1)
      expect(list.get(0)).toBe(2)
    })
  })

  // ─── forEach ───────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('iterates over all elements with correct indices', () => {
      const list = new ChunkedList<number>(2)
      list.append(10)
      list.append(20)
      list.append(30)
      const results: Array<{ value: number; index: number }> = []
      list.forEach((value, index) => {
        results.push({ value, index })
      })
      expect(results).toEqual([
        { value: 10, index: 0 },
        { value: 20, index: 1 },
        { value: 30, index: 2 },
      ])
    })

    it('does not call callback on empty list', () => {
      const list = new ChunkedList<number>()
      let callCount = 0
      list.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('iterates across chunk boundaries', () => {
      const list = new ChunkedList<number>(2)
      for (let i = 0; i < 5; i++) list.append(i)
      const values: number[] = []
      list.forEach((v) => values.push(v))
      expect(values).toEqual([0, 1, 2, 3, 4])
    })
  })

  // ─── map ───────────────────────────────────────────────────────────────

  describe('map', () => {
    it('transforms all elements', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      const mapped = list.map((v) => v * 10)
      expect(mapped.toArray()).toEqual([10, 20, 30])
    })

    it('returns empty list from empty input', () => {
      const list = new ChunkedList<number>()
      const mapped = list.map((v) => v)
      expect(mapped.length).toBe(0)
    })

    it('preserves chunk size in result', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      const mapped = list.map((v) => v.toString())
      mapped.append('x')
      expect(mapped.chunkCount).toBe(1)
    })

    it('provides correct indices', () => {
      const list = new ChunkedList<string>(2)
      list.append('a')
      list.append('b')
      list.append('c')
      const mapped = list.map((v, i) => `${v}-${i}`)
      expect(mapped.toArray()).toEqual(['a-0', 'b-1', 'c-2'])
    })

    it('returns a ChunkedList instance', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      const mapped = list.map((v) => v.toString())
      expect(mapped).toBeInstanceOf(ChunkedList)
    })

    it('can change type via map', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      const mapped = list.map((v) => `n${v}`)
      expect(mapped.toArray()).toEqual(['n1', 'n2'])
    })
  })

  // ─── filter ────────────────────────────────────────────────────────────

  describe('filter', () => {
    it('filters elements based on predicate', () => {
      const list = new ChunkedList<number>(2)
      for (let i = 1; i <= 5; i++) list.append(i)
      const filtered = list.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4])
    })

    it('returns empty list when nothing matches', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(3)
      list.append(5)
      const filtered = list.filter((v) => v % 2 === 0)
      expect(filtered.length).toBe(0)
    })

    it('returns all elements when all match', () => {
      const list = new ChunkedList<number>(4)
      list.append(2)
      list.append(4)
      list.append(6)
      const filtered = list.filter((v) => v % 2 === 0)
      expect(filtered.toArray()).toEqual([2, 4, 6])
    })

    it('provides correct indices to predicate', () => {
      const list = new ChunkedList<number>(2)
      list.append(10)
      list.append(20)
      list.append(30)
      const filtered = list.filter((_v, i) => i !== 1)
      expect(filtered.toArray()).toEqual([10, 30])
    })

    it('returns empty from empty list', () => {
      const list = new ChunkedList<number>()
      const filtered = list.filter(() => true)
      expect(filtered.length).toBe(0)
    })

    it('preserves chunk size in result', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.append(3)
      const filtered = list.filter(() => true)
      expect(filtered.chunkCount).toBe(1)
    })
  })

  // ─── reduce ────────────────────────────────────────────────────────────

  describe('reduce', () => {
    it('reduces to a sum', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      const sum = list.reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(10)
    })

    it('returns initial value for empty list', () => {
      const list = new ChunkedList<number>()
      const result = list.reduce((acc, v) => acc + v, 42)
      expect(result).toBe(42)
    })

    it('reduces to a different type', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      const joined = list.reduce((acc, v) => acc + v.toString() + ',', '')
      expect(joined).toBe('1,2,3,')
    })

    it('provides correct indices', () => {
      const list = new ChunkedList<number>(2)
      list.append(10)
      list.append(20)
      const indices = list.reduce((acc, _v, i) => {
        acc.push(i)
        return acc
      }, [] as number[])
      expect(indices).toEqual([0, 1])
    })
  })

  // ─── Symbol.iterator ───────────────────────────────────────────────────

  describe('Symbol.iterator', () => {
    it('iterates over all elements', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      list.append(2)
      list.append(3)
      const result: number[] = []
      for (const item of list) {
        result.push(item)
      }
      expect(result).toEqual([1, 2, 3])
    })

    it('works with spread operator', () => {
      const list = new ChunkedList<number>(2)
      list.append(10)
      list.append(20)
      expect([...list]).toEqual([10, 20])
    })

    it('returns nothing for empty list', () => {
      const list = new ChunkedList<number>()
      const result = [...list]
      expect(result).toEqual([])
    })
  })

  // ─── chunkCount ────────────────────────────────────────────────────────

  describe('chunkCount', () => {
    it('is 0 for empty list', () => {
      expect(new ChunkedList<number>().chunkCount).toBe(0)
    })

    it('is 1 after first append', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.chunkCount).toBe(1)
    })

    it('increases as chunks fill up', () => {
      const list = new ChunkedList<number>(2)
      list.append(1)
      expect(list.chunkCount).toBe(1)
      list.append(2)
      expect(list.chunkCount).toBe(1)
      list.append(3)
      expect(list.chunkCount).toBe(2)
      list.append(4)
      expect(list.chunkCount).toBe(2)
      list.append(5)
      expect(list.chunkCount).toBe(3)
    })

    it('decreases when chunks are emptied', () => {
      const list = new ChunkedList<number>(1)
      list.append(1)
      list.append(2)
      expect(list.chunkCount).toBe(2)
      list.remove(0)
      expect(list.chunkCount).toBe(1)
    })
  })

  // ─── getChunk ──────────────────────────────────────────────────────────

  describe('getChunk', () => {
    it('returns copy of chunk elements', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      const chunk0 = list.getChunk(0)
      expect(chunk0).toEqual([1, 2, 3])
    })

    it('returns partial last chunk', () => {
      const list = new ChunkedList<number>(3)
      list.append(1)
      list.append(2)
      list.append(3)
      list.append(4)
      const chunk1 = list.getChunk(1)
      expect(chunk1).toEqual([4])
    })

    it('returns undefined for negative index', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.getChunk(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      expect(list.getChunk(1)).toBeUndefined()
    })

    it('returns undefined on empty list', () => {
      const list = new ChunkedList<number>()
      expect(list.getChunk(0)).toBeUndefined()
    })

    it('returns a copy (not internal reference)', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      const chunk = list.getChunk(0)
      expect(chunk).not.toBeUndefined()
      chunk!.push(999)
      expect(list.getChunk(0)).toEqual([1, 2])
    })

    it('insert and remove at same index', () => {
      const list = new ChunkedList<number>(4)
      list.append(1)
      list.append(2)
      list.append(3)
      list.insert(1, 99)
      expect(list.toArray()).toEqual([1, 99, 2, 3])
      list.remove(1)
      expect(list.toArray()).toEqual([1, 2, 3])
    })

    it('type export works correctly', () => {
      const options: ChunkedListOptions = { chunkSize: 32 }
      const list = new ChunkedList<number>(options)
      list.append(1)
      expect(list.length).toBe(1)
    })
  })
})
