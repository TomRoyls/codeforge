import { describe, it, expect } from 'vitest'
import { WeightBalancedTree } from '../../src/core/weight-balanced-tree-2/index.js'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

describe('WeightBalancedTree', () => {
  describe('constructor', () => {
    it('creates empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('accepts custom comparator', () => {
      const t = new WeightBalancedTree<number>({ compare: (a, b) => b - a })
      t.insert(1)
      t.insert(2)
      t.insert(3)
      expect(t.toArray()).toEqual([3, 2, 1])
    })

    it('accepts string comparator', () => {
      const t = new WeightBalancedTree<string>({ compare: (a, b) => a.localeCompare(b) })
      t.insert('cherry')
      t.insert('apple')
      t.insert('banana')
      expect(t.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('works with default comparator for strings', () => {
      const t = new WeightBalancedTree<string>()
      t.insert('c')
      t.insert('a')
      t.insert('b')
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('supports generic value type', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'one')
      t.insert(2, 'two')
      expect(t.get(1)).toBe('one')
      expect(t.get(2)).toBe('two')
    })
  })

  describe('insert', () => {
    it('inserts single element', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.size).toBe(1)
      expect(t.has(5)).toBe(true)
    })

    it('inserts multiple elements in order', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(2)
      t.insert(3)
      t.insert(4)
      t.insert(5)
      expect(t.size).toBe(5)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts multiple elements in reverse order', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(4)
      t.insert(3)
      t.insert(2)
      t.insert(1)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('inserts duplicate key updates value', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'a')
      t.insert(1, 'b')
      expect(t.size).toBe(1)
      expect(t.get(1)).toBe('b')
    })

    it('inserts random order maintains sorted', () => {
      const t = new WeightBalancedTree<number>()
      const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
      for (const n of nums) {
        t.insert(n)
      }
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })

    it('inserts with undefined value', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1)
      expect(t.get(1)).toBe(undefined)
    })

    it('inserts many elements maintains size', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 1000; i++) {
        t.insert(i)
      }
      expect(t.size).toBe(1000)
    })

    it('handles ascending sequential insertions', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 1; i <= 50; i++) t.insert(i)
      expect(t.size).toBe(50)
      expect(t.min()).toBe(1)
      expect(t.max()).toBe(50)
    })

    it('handles descending sequential insertions', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 50; i >= 1; i--) t.insert(i)
      expect(t.size).toBe(50)
      expect(t.min()).toBe(1)
      expect(t.max()).toBe(50)
    })
  })

  describe('delete', () => {
    it('deletes from empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.delete(1)).toBe(false)
    })

    it('deletes non-existent key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      expect(t.delete(2)).toBe(false)
    })

    it('deletes the only element', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      expect(t.delete(1)).toBe(true)
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('deletes leaf node', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(2)
      t.insert(1)
      t.insert(3)
      expect(t.delete(1)).toBe(true)
      expect(t.size).toBe(2)
      expect(t.has(1)).toBe(false)
    })

    it('deletes root with two children', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(2)
      t.insert(1)
      t.insert(3)
      expect(t.delete(2)).toBe(true)
      expect(t.size).toBe(2)
      expect(t.has(2)).toBe(false)
      expect(t.toArray()).toEqual([1, 3])
    })

    it('deletes and maintains sorted order', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) {
        t.insert(i)
      }
      t.delete(3)
      t.delete(7)
      expect(t.toArray()).toEqual([0, 1, 2, 4, 5, 6, 8, 9])
    })

    it('deletes all elements', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) {
        t.insert(i)
      }
      for (let i = 0; i < 10; i++) {
        expect(t.delete(i)).toBe(true)
      }
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('delete random elements maintains sorted', () => {
      const t = new WeightBalancedTree<number>()
      const nums = Array.from({ length: 50 }, (_, i) => i)
      for (const n of nums) {
        t.insert(n)
      }
      const toDelete = shuffle(nums).slice(0, 25)
      for (const n of toDelete) {
        t.delete(n)
      }
      const remaining = nums.filter((n) => !toDelete.includes(n))
      expect(t.toArray()).toEqual(remaining)
    })

    it('delete returns false for already deleted key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      expect(t.delete(1)).toBe(true)
      expect(t.delete(1)).toBe(false)
    })

    it('handles stress delete', () => {
      const t = new WeightBalancedTree<number>()
      const n = 200
      const nums = shuffle(Array.from({ length: n }, (_, i) => i))
      for (const v of nums) t.insert(v)
      const delOrder = shuffle([...nums])
      for (const v of delOrder) {
        expect(t.delete(v)).toBe(true)
      }
      expect(t.size).toBe(0)
    })
  })

  describe('has', () => {
    it('returns false for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.has(1)).toBe(false)
    })

    it('returns true for existing key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.has(5)).toBe(true)
    })

    it('returns false for non-existing key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.has(3)).toBe(false)
    })

    it('returns false after deletion', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.delete(5)
      expect(t.has(5)).toBe(false)
    })
  })

  describe('get', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number, string>()
      expect(t.get(1)).toBe(undefined)
    })

    it('returns stored value', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'hello')
      expect(t.get(1)).toBe('hello')
    })

    it('returns undefined for missing key', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'hello')
      expect(t.get(2)).toBe(undefined)
    })

    it('returns updated value after re-insert', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'a')
      t.insert(1, 'b')
      expect(t.get(1)).toBe('b')
    })
  })

  describe('size and isEmpty', () => {
    it('size is 0 for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.size).toBe(0)
    })

    it('isEmpty is true for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.isEmpty()).toBe(true)
    })

    it('isEmpty is false after insert', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      expect(t.isEmpty()).toBe(false)
    })

    it('size tracks inserts', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) {
        t.insert(i)
      }
      expect(t.size).toBe(10)
    })

    it('size decreases after delete', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(2)
      t.delete(1)
      expect(t.size).toBe(1)
    })
  })

  describe('clear', () => {
    it('clears the tree', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) {
        t.insert(i)
      }
      t.clear()
      expect(t.size).toBe(0)
      expect(t.isEmpty()).toBe(true)
    })

    it('allows insert after clear', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.clear()
      t.insert(2)
      expect(t.size).toBe(1)
      expect(t.has(2)).toBe(true)
    })
  })

  describe('min and max', () => {
    it('min returns undefined for empty', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.min()).toBe(undefined)
    })

    it('max returns undefined for empty', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.max()).toBe(undefined)
    })

    it('min returns smallest key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.min()).toBe(3)
    })

    it('max returns largest key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.max()).toBe(7)
    })

    it('min and max work after deletion', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      t.insert(10)
      t.delete(1)
      expect(t.min()).toBe(5)
      t.delete(10)
      expect(t.max()).toBe(5)
    })
  })

  describe('floor', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.floor(5)).toBe(undefined)
    })

    it('returns exact key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.floor(5)).toBe(5)
    })

    it('returns largest key <= given key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(3)
      t.insert(5)
      expect(t.floor(4)).toBe(3)
    })

    it('returns undefined when all keys are greater', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(10)
      expect(t.floor(3)).toBe(undefined)
    })

    it('returns max when key > max', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      expect(t.floor(10)).toBe(5)
    })
  })

  describe('ceiling', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.ceiling(5)).toBe(undefined)
    })

    it('returns exact key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.ceiling(5)).toBe(5)
    })

    it('returns smallest key >= given key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(3)
      t.insert(5)
      expect(t.ceiling(4)).toBe(5)
    })

    it('returns undefined when all keys are less', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      expect(t.ceiling(10)).toBe(undefined)
    })

    it('returns min when key < min', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(10)
      expect(t.ceiling(3)).toBe(5)
    })
  })

  describe('lower', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.lower(5)).toBe(undefined)
    })

    it('returns greatest key strictly less than given', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(3)
      t.insert(5)
      expect(t.lower(5)).toBe(3)
    })

    it('returns undefined when no key is less', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.lower(3)).toBe(undefined)
    })

    it('works with key not in tree', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      expect(t.lower(4)).toBe(1)
    })
  })

  describe('higher', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.higher(5)).toBe(undefined)
    })

    it('returns smallest key strictly greater than given', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(3)
      t.insert(5)
      expect(t.higher(3)).toBe(5)
    })

    it('returns undefined when no key is greater', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.higher(10)).toBe(undefined)
    })

    it('works with key not in tree', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      expect(t.higher(2)).toBe(5)
    })
  })

  describe('range', () => {
    it('returns empty for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.range(1, 5)).toEqual([])
    })

    it('returns keys in range', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.range(3, 7)).toEqual([3, 4, 5, 6, 7])
    })

    it('returns single key when lo equals hi', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.range(5, 5)).toEqual([5])
    })

    it('returns empty when lo > max', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(2)
      expect(t.range(5, 10)).toEqual([])
    })

    it('returns empty when hi < min', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(10)
      t.insert(20)
      expect(t.range(1, 5)).toEqual([])
    })

    it('includes boundary keys', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      t.insert(10)
      expect(t.range(1, 10)).toEqual([1, 5, 10])
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.toArray()).toEqual([])
    })

    it('returns sorted array', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('handles large tree', () => {
      const t = new WeightBalancedTree<number>()
      const nums = shuffle(Array.from({ length: 100 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
    })
  })

  describe('forEach', () => {
    it('does not call callback for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      let called = false
      t.forEach(() => { called = true })
      expect(called).toBe(false)
    })

    it('iterates in sorted order', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const keys: number[] = []
      t.forEach((k) => keys.push(k))
      expect(keys).toEqual([1, 2, 3])
    })

    it('provides correct index', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(10)
      t.insert(20)
      t.insert(30)
      const indices: number[] = []
      t.forEach((_k, _v, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })

    it('provides correct values', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'a')
      t.insert(2, 'b')
      const values: (string | undefined)[] = []
      t.forEach((_k, v) => values.push(v))
      expect(values).toEqual(['a', 'b'])
    })
  })

  describe('iterator', () => {
    it('yields nothing for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect([...t]).toEqual([])
    })

    it('yields key-value pairs in order', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(1, 'a')
      t.insert(2, 'b')
      t.insert(3, 'c')
      expect([...t]).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('works with for-of', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(3)
      t.insert(1)
      t.insert(2)
      const keys: number[] = []
      for (const [k] of t) {
        keys.push(k)
      }
      expect(keys).toEqual([1, 2, 3])
    })
  })

  describe('rank', () => {
    it('returns -1 for key not in tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.rank(1)).toBe(-1)
    })

    it('returns 0 for smallest key', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      t.insert(3)
      t.insert(7)
      expect(t.rank(3)).toBe(0)
    })

    it('returns correct rank', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.rank(0)).toBe(0)
      expect(t.rank(5)).toBe(5)
      expect(t.rank(9)).toBe(9)
    })

    it('returns -1 for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.rank(1)).toBe(-1)
    })
  })

  describe('select', () => {
    it('returns undefined for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.select(0)).toBe(undefined)
    })

    it('returns undefined for out of bounds index', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      expect(t.select(-1)).toBe(undefined)
      expect(t.select(1)).toBe(undefined)
    })

    it('returns ith smallest key', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.select(0)).toBe(0)
      expect(t.select(5)).toBe(5)
      expect(t.select(9)).toBe(9)
    })

    it('select and rank are inverses', () => {
      const t = new WeightBalancedTree<number>()
      const nums = shuffle(Array.from({ length: 20 }, (_, i) => i))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 20; i++) {
        expect(t.rank(t.select(i)!)).toBe(i)
      }
    })
  })

  describe('count', () => {
    it('returns 0 for empty tree', () => {
      const t = new WeightBalancedTree<number>()
      expect(t.count(1, 5)).toBe(0)
    })

    it('returns count of keys in range', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.count(3, 7)).toBe(5)
    })

    it('counts single element', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(5)
      expect(t.count(5, 5)).toBe(1)
    })

    it('counts full range', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.count(0, 9)).toBe(10)
    })

    it('returns 0 when range has no keys', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(10)
      expect(t.count(3, 7)).toBe(0)
    })
  })

  describe('balance stress tests', () => {
    it('handles ascending insertion pattern', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 500; i++) t.insert(i)
      expect(t.size).toBe(500)
      expect(t.toArray()).toEqual(Array.from({ length: 500 }, (_, i) => i))
    })

    it('handles descending insertion pattern', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 499; i >= 0; i--) t.insert(i)
      expect(t.size).toBe(500)
      expect(t.toArray()).toEqual(Array.from({ length: 500 }, (_, i) => i))
    })

    it('handles alternating insertion pattern', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 100; i++) {
        t.insert(i)
        t.insert(200 - i)
      }
      expect(t.size).toBe(200)
    })

    it('survives heavy mixed insert/delete', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 200; i++) t.insert(i)
      for (let i = 0; i < 100; i++) t.delete(i * 2)
      const arr = t.toArray()
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i]! < arr[i + 1]!).toBe(true)
      }
    })

    it('handles string keys', () => {
      const t = new WeightBalancedTree<string>()
      const words = ['delta', 'alpha', 'charlie', 'bravo', 'echo']
      for (const w of words) t.insert(w)
      expect(t.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta', 'echo'])
    })

    it('handles object values', () => {
      const t = new WeightBalancedTree<number, { name: string }>()
      t.insert(1, { name: 'one' })
      t.insert(2, { name: 'two' })
      expect(t.get(1)).toEqual({ name: 'one' })
      expect(t.get(2)).toEqual({ name: 'two' })
    })

    it('handles negative numbers', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(-5)
      t.insert(-1)
      t.insert(0)
      t.insert(3)
      expect(t.toArray()).toEqual([-5, -1, 0, 3])
    })

    it('handles floating point keys', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1.5)
      t.insert(0.3)
      t.insert(2.7)
      expect(t.toArray()).toEqual([0.3, 1.5, 2.7])
    })

    it('floor/ceiling with negative numbers', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(-10)
      t.insert(-5)
      t.insert(0)
      t.insert(5)
      t.insert(10)
      expect(t.floor(-3)).toBe(-5)
      expect(t.ceiling(-3)).toBe(0)
      expect(t.lower(0)).toBe(-5)
      expect(t.higher(0)).toBe(5)
    })

    it('rank/select with shuffled data', () => {
      const t = new WeightBalancedTree<number>()
      const nums = shuffle(Array.from({ length: 50 }, (_, i) => i * 2))
      for (const n of nums) t.insert(n)
      for (let i = 0; i < 50; i++) {
        expect(t.select(i)).toBe(i * 2)
        expect(t.rank(i * 2)).toBe(i)
      }
    })

    it('range after deletions', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 20; i++) t.insert(i)
      t.delete(5)
      t.delete(10)
      t.delete(15)
      expect(t.range(0, 19)).toEqual([0, 1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19])
    })

    it('repeated insert and clear', () => {
      const t = new WeightBalancedTree<number>()
      for (let round = 0; round < 5; round++) {
        for (let i = 0; i < 50; i++) t.insert(i)
        expect(t.size).toBe(50)
        t.clear()
        expect(t.size).toBe(0)
      }
    })

    it('lower/higher boundary cases', () => {
      const t = new WeightBalancedTree<number>()
      t.insert(1)
      t.insert(5)
      expect(t.lower(1)).toBe(undefined)
      expect(t.higher(5)).toBe(undefined)
      expect(t.lower(2)).toBe(1)
      expect(t.higher(4)).toBe(5)
    })

    it('forEach with values', () => {
      const t = new WeightBalancedTree<number, number>()
      for (let i = 0; i < 10; i++) t.insert(i, i * 10)
      const pairs: [number, number | undefined][] = []
      t.forEach((k, v) => pairs.push([k, v]))
      expect(pairs.length).toBe(10)
      for (let i = 0; i < 10; i++) {
        expect(pairs[i]![0]).toBe(i)
        expect(pairs[i]![1]).toBe(i * 10)
      }
    })

    it('iterator yields correct values', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(3, 'c')
      t.insert(1, 'a')
      t.insert(2, 'b')
      const entries = [...t]
      expect(entries).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('count with edge ranges', () => {
      const t = new WeightBalancedTree<number>()
      for (let i = 0; i < 10; i++) t.insert(i)
      expect(t.count(0, 0)).toBe(1)
      expect(t.count(9, 9)).toBe(1)
      expect(t.count(0, 9)).toBe(10)
    })

    it('handles single element tree operations', () => {
      const t = new WeightBalancedTree<number, string>()
      t.insert(42, 'answer')
      expect(t.size).toBe(1)
      expect(t.isEmpty()).toBe(false)
      expect(t.has(42)).toBe(true)
      expect(t.has(1)).toBe(false)
      expect(t.get(42)).toBe('answer')
      expect(t.min()).toBe(42)
      expect(t.max()).toBe(42)
      expect(t.floor(42)).toBe(42)
      expect(t.ceiling(42)).toBe(42)
      expect(t.floor(50)).toBe(42)
      expect(t.ceiling(30)).toBe(42)
      expect(t.lower(42)).toBe(undefined)
      expect(t.higher(42)).toBe(undefined)
      expect(t.rank(42)).toBe(0)
      expect(t.select(0)).toBe(42)
      expect(t.range(0, 100)).toEqual([42])
      expect(t.count(42, 42)).toBe(1)
      expect(t.delete(42)).toBe(true)
      expect(t.isEmpty()).toBe(true)
    })

    it('handles duplicate key overwrites in sequence', () => {
      const t = new WeightBalancedTree<number, number>()
      for (let i = 0; i < 5; i++) t.insert(1, i)
      expect(t.size).toBe(1)
      expect(t.get(1)).toBe(4)
    })

    it('custom comparator with reverse order', () => {
      const t = new WeightBalancedTree<string>({
        compare: (a, b) => b.localeCompare(a),
      })
      t.insert('a')
      t.insert('b')
      t.insert('c')
      expect(t.toArray()).toEqual(['c', 'b', 'a'])
      expect(t.min()).toBe('c')
      expect(t.max()).toBe('a')
    })

    it('stress: 1000 random operations', () => {
      const t = new WeightBalancedTree<number>()
      const set = new Set<number>()
      for (let i = 0; i < 1000; i++) {
        const op = Math.random()
        if (op < 0.6) {
          const v = Math.floor(Math.random() * 200)
          set.add(v)
          t.insert(v)
        } else {
          const v = Math.floor(Math.random() * 200)
          set.delete(v)
          t.delete(v)
        }
      }
      expect(t.size).toBe(set.size)
      const sorted = [...set].sort((a, b) => a - b)
      expect(t.toArray()).toEqual(sorted)
    })
  })
})
