import { describe, it, expect } from 'vitest'
import { ConcTree } from '../../src/core/conc-tree/index.js'

describe('ConcTree', () => {
  describe('construction', () => {
    it('creates empty tree', () => {
      const t = ConcTree.empty<number>()
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('creates tree from empty array', () => {
      const t = ConcTree.fromArray([])
      expect(t.size).toBe(0)
      expect(t.isEmpty).toBe(true)
    })

    it('creates tree from single-element array', () => {
      const t = ConcTree.fromArray([42])
      expect(t.size).toBe(1)
      expect(t.isEmpty).toBe(false)
      expect(t.get(0)).toBe(42)
    })

    it('creates tree from small array', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.size).toBe(5)
      expect(t.toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('creates tree from large array (> BLOCK_SIZE)', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const t = ConcTree.fromArray(arr)
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(arr)
    })

    it('creates tree from very large array', () => {
      const arr = Array.from({ length: 10000 }, (_, i) => i)
      const t = ConcTree.fromArray(arr)
      expect(t.size).toBe(10000)
      expect(t.toArray()).toEqual(arr)
    })

    it('creates tree preserving element order', () => {
      const t = ConcTree.fromArray(['a', 'b', 'c', 'd'])
      expect(t.toArray()).toEqual(['a', 'b', 'c', 'd'])
    })
  })

  describe('get', () => {
    it('returns undefined for empty tree', () => {
      expect(ConcTree.empty().get(0)).toBeUndefined()
    })

    it('returns element at valid index', () => {
      const t = ConcTree.fromArray([10, 20, 30])
      expect(t.get(0)).toBe(10)
      expect(t.get(1)).toBe(20)
      expect(t.get(2)).toBe(30)
    })

    it('returns undefined for negative index', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      expect(t.get(-1)).toBeUndefined()
    })

    it('returns undefined for out-of-bounds index', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      expect(t.get(3)).toBeUndefined()
      expect(t.get(100)).toBeUndefined()
    })

    it('works with large trees', () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i * 2)
      const t = ConcTree.fromArray(arr)
      expect(t.get(0)).toBe(0)
      expect(t.get(500)).toBe(1000)
      expect(t.get(999)).toBe(1998)
    })
  })

  describe('set', () => {
    it('sets value at valid index', () => {
      const t = ConcTree.fromArray([1, 2, 3]).set(1, 99)
      expect(t.toArray()).toEqual([1, 99, 3])
    })

    it('returns new tree without mutating original', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const modified = orig.set(1, 99)
      expect(orig.toArray()).toEqual([1, 2, 3])
      expect(modified.toArray()).toEqual([1, 99, 3])
    })

    it('handles out-of-bounds gracefully', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const result = t.set(5, 99)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('handles negative index gracefully', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const result = t.set(-1, 99)
      expect(result.toArray()).toEqual([1, 2, 3])
    })

    it('sets first element', () => {
      const t = ConcTree.fromArray([1, 2, 3]).set(0, 10)
      expect(t.toArray()).toEqual([10, 2, 3])
    })

    it('sets last element', () => {
      const t = ConcTree.fromArray([1, 2, 3]).set(2, 30)
      expect(t.toArray()).toEqual([1, 2, 30])
    })
  })

  describe('concat', () => {
    it('concatenates two empty trees', () => {
      const t = ConcTree.empty<number>().concat(ConcTree.empty())
      expect(t.isEmpty).toBe(true)
    })

    it('concatenates empty with non-empty', () => {
      const t = ConcTree.empty<number>().concat(ConcTree.fromArray([1, 2]))
      expect(t.toArray()).toEqual([1, 2])
    })

    it('concatenates non-empty with empty', () => {
      const t = ConcTree.fromArray([1, 2]).concat(ConcTree.empty())
      expect(t.toArray()).toEqual([1, 2])
    })

    it('concatenates two small trees', () => {
      const a = ConcTree.fromArray([1, 2, 3])
      const b = ConcTree.fromArray([4, 5, 6])
      expect(a.concat(b).toArray()).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('concatenates large trees', () => {
      const a = ConcTree.fromArray(Array.from({ length: 500 }, (_, i) => i))
      const b = ConcTree.fromArray(Array.from({ length: 500 }, (_, i) => i + 500))
      const result = a.concat(b)
      expect(result.size).toBe(1000)
      expect(result.toArray()).toEqual(Array.from({ length: 1000 }, (_, i) => i))
    })

    it('does not mutate original trees', () => {
      const a = ConcTree.fromArray([1, 2])
      const b = ConcTree.fromArray([3, 4])
      const c = a.concat(b)
      expect(a.toArray()).toEqual([1, 2])
      expect(b.toArray()).toEqual([3, 4])
      expect(c.toArray()).toEqual([1, 2, 3, 4])
    })

    it('maintains balance after many concatenations', () => {
      let t = ConcTree.fromArray([0])
      for (let i = 1; i < 100; i++) {
        t = t.concat(ConcTree.fromArray([i]))
      }
      expect(t.size).toBe(100)
      expect(t.toArray()).toEqual(Array.from({ length: 100 }, (_, i) => i))
      const s = t.stats()
      expect(s.height).toBeLessThan(50)
    })
  })

  describe('split', () => {
    it('splits empty tree', () => {
      const [left, right] = ConcTree.empty<number>().split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.isEmpty).toBe(true)
    })

    it('splits at beginning', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const [left, right] = t.split(0)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('splits at end', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const [left, right] = t.split(3)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('splits in middle', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      expect(left.toArray()).toEqual([1, 2])
      expect(right.toArray()).toEqual([3, 4, 5])
    })

    it('splits at index 1', () => {
      const t = ConcTree.fromArray([10, 20, 30])
      const [left, right] = t.split(1)
      expect(left.toArray()).toEqual([10])
      expect(right.toArray()).toEqual([20, 30])
    })

    it('handles negative index', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const [left, right] = t.split(-5)
      expect(left.isEmpty).toBe(true)
      expect(right.toArray()).toEqual([1, 2, 3])
    })

    it('handles out-of-bounds index', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      const [left, right] = t.split(100)
      expect(left.toArray()).toEqual([1, 2, 3])
      expect(right.isEmpty).toBe(true)
    })

    it('splits large tree', () => {
      const arr = Array.from({ length: 200 }, (_, i) => i)
      const t = ConcTree.fromArray(arr)
      const [left, right] = t.split(100)
      expect(left.size).toBe(100)
      expect(right.size).toBe(100)
      expect(left.toArray()).toEqual(arr.slice(0, 100))
      expect(right.toArray()).toEqual(arr.slice(100))
    })

    it('split then concat equals original', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const t = ConcTree.fromArray(arr)
      const [left, right] = t.split(50)
      const rejoined = left.concat(right)
      expect(rejoined.toArray()).toEqual(arr)
    })
  })

  describe('insert', () => {
    it('inserts at beginning', () => {
      const t = ConcTree.fromArray([2, 3]).insert(0, 1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('inserts at end', () => {
      const t = ConcTree.fromArray([1, 2]).insert(2, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('inserts in middle', () => {
      const t = ConcTree.fromArray([1, 3]).insert(1, 2)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('inserts into empty tree', () => {
      const t = ConcTree.empty<number>().insert(0, 42)
      expect(t.toArray()).toEqual([42])
    })

    it('handles negative index', () => {
      const t = ConcTree.fromArray([1, 2]).insert(-1, 0)
      expect(t.toArray()).toEqual([0, 1, 2])
    })

    it('handles out-of-bounds index', () => {
      const t = ConcTree.fromArray([1, 2]).insert(100, 3)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1, 3])
      const modified = orig.insert(1, 2)
      expect(orig.toArray()).toEqual([1, 3])
      expect(modified.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('remove', () => {
    it('removes from beginning', () => {
      const t = ConcTree.fromArray([1, 2, 3]).remove(0)
      expect(t.toArray()).toEqual([2, 3])
    })

    it('removes from end', () => {
      const t = ConcTree.fromArray([1, 2, 3]).remove(2)
      expect(t.toArray()).toEqual([1, 2])
    })

    it('removes from middle', () => {
      const t = ConcTree.fromArray([1, 2, 3]).remove(1)
      expect(t.toArray()).toEqual([1, 3])
    })

    it('handles negative index', () => {
      const t = ConcTree.fromArray([1, 2, 3]).remove(-1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('handles out-of-bounds index', () => {
      const t = ConcTree.fromArray([1, 2, 3]).remove(5)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('removing from single-element tree yields empty', () => {
      const t = ConcTree.fromArray([42]).remove(0)
      expect(t.isEmpty).toBe(true)
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const modified = orig.remove(1)
      expect(orig.toArray()).toEqual([1, 2, 3])
      expect(modified.toArray()).toEqual([1, 3])
    })
  })

  describe('push', () => {
    it('pushes to empty tree', () => {
      const t = ConcTree.empty<number>().push(1)
      expect(t.toArray()).toEqual([1])
    })

    it('pushes multiple items', () => {
      let t = ConcTree.empty<number>()
      for (let i = 0; i < 5; i++) t = t.push(i)
      expect(t.toArray()).toEqual([0, 1, 2, 3, 4])
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1])
      const pushed = orig.push(2)
      expect(orig.toArray()).toEqual([1])
      expect(pushed.toArray()).toEqual([1, 2])
    })
  })

  describe('pop', () => {
    it('pops from empty tree', () => {
      const [t, val] = ConcTree.empty<number>().pop()
      expect(t.isEmpty).toBe(true)
      expect(val).toBeUndefined()
    })

    it('pops from single-element tree', () => {
      const [t, val] = ConcTree.fromArray([42]).pop()
      expect(t.isEmpty).toBe(true)
      expect(val).toBe(42)
    })

    it('pops from multi-element tree', () => {
      const [t, val] = ConcTree.fromArray([1, 2, 3]).pop()
      expect(t.toArray()).toEqual([1, 2])
      expect(val).toBe(3)
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const [popped] = orig.pop()
      expect(orig.toArray()).toEqual([1, 2, 3])
      expect(popped.toArray()).toEqual([1, 2])
    })
  })

  describe('unshift', () => {
    it('unshifts to empty tree', () => {
      const t = ConcTree.empty<number>().unshift(1)
      expect(t.toArray()).toEqual([1])
    })

    it('unshifts to non-empty tree', () => {
      const t = ConcTree.fromArray([2, 3]).unshift(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([2, 3])
      const shifted = orig.unshift(1)
      expect(orig.toArray()).toEqual([2, 3])
      expect(shifted.toArray()).toEqual([1, 2, 3])
    })
  })

  describe('shift', () => {
    it('shifts from empty tree', () => {
      const [t, val] = ConcTree.empty<number>().shift()
      expect(t.isEmpty).toBe(true)
      expect(val).toBeUndefined()
    })

    it('shifts from single-element tree', () => {
      const [t, val] = ConcTree.fromArray([42]).shift()
      expect(t.isEmpty).toBe(true)
      expect(val).toBe(42)
    })

    it('shifts from multi-element tree', () => {
      const [t, val] = ConcTree.fromArray([1, 2, 3]).shift()
      expect(t.toArray()).toEqual([2, 3])
      expect(val).toBe(1)
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const [shifted] = orig.shift()
      expect(orig.toArray()).toEqual([1, 2, 3])
      expect(shifted.toArray()).toEqual([2, 3])
    })
  })

  describe('size and isEmpty', () => {
    it('reports correct size', () => {
      expect(ConcTree.empty().size).toBe(0)
      expect(ConcTree.fromArray([1]).size).toBe(1)
      expect(ConcTree.fromArray([1, 2, 3]).size).toBe(3)
    })

    it('reports isEmpty correctly', () => {
      expect(ConcTree.empty().isEmpty).toBe(true)
      expect(ConcTree.fromArray([1]).isEmpty).toBe(false)
    })
  })

  describe('clear', () => {
    it('clears a non-empty tree', () => {
      const t = ConcTree.fromArray([1, 2, 3]).clear()
      expect(t.isEmpty).toBe(true)
    })

    it('clearing empty tree returns empty', () => {
      const t = ConcTree.empty<number>().clear()
      expect(t.isEmpty).toBe(true)
    })
  })

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      expect(ConcTree.empty().toArray()).toEqual([])
    })

    it('returns elements in order', () => {
      expect(ConcTree.fromArray([3, 1, 4, 1, 5]).toArray()).toEqual([3, 1, 4, 1, 5])
    })
  })

  describe('slice', () => {
    it('slices entire tree', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.slice().toArray()).toEqual([1, 2, 3, 4, 5])
    })

    it('slices from start index', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(2).toArray()).toEqual([3, 4, 5])
    })

    it('slices with start and end', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(1, 4).toArray()).toEqual([2, 3, 4])
    })

    it('handles negative indices', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(-2).toArray()).toEqual([4, 5])
    })

    it('handles negative end index', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      expect(t.slice(1, -1).toArray()).toEqual([2, 3, 4])
    })

    it('returns empty for invalid range', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      expect(t.slice(5, 10).isEmpty).toBe(true)
    })

    it('returns empty for start >= end', () => {
      const t = ConcTree.fromArray([1, 2, 3])
      expect(t.slice(2, 2).isEmpty).toBe(true)
    })
  })

  describe('map', () => {
    it('maps over empty tree', () => {
      const t = ConcTree.empty<number>().map((x) => x * 2)
      expect(t.isEmpty).toBe(true)
    })

    it('maps over non-empty tree', () => {
      const t = ConcTree.fromArray([1, 2, 3]).map((x) => x * 2)
      expect(t.toArray()).toEqual([2, 4, 6])
    })

    it('provides correct indices', () => {
      const indices: number[] = []
      ConcTree.fromArray([10, 20, 30]).map((_, i) => { indices.push(i); return _ })
      expect(indices).toEqual([0, 1, 2])
    })

    it('transforms types', () => {
      const t = ConcTree.fromArray([1, 2, 3]).map((x) => String(x))
      expect(t.toArray()).toEqual(['1', '2', '3'])
    })
  })

  describe('filter', () => {
    it('filters empty tree', () => {
      const t = ConcTree.empty<number>().filter(() => true)
      expect(t.isEmpty).toBe(true)
    })

    it('filters out all elements', () => {
      const t = ConcTree.fromArray([1, 2, 3]).filter(() => false)
      expect(t.isEmpty).toBe(true)
    })

    it('keeps matching elements', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5]).filter((x) => x % 2 === 0)
      expect(t.toArray()).toEqual([2, 4])
    })

    it('provides correct indices', () => {
      const indices: number[] = []
      ConcTree.fromArray([10, 20, 30]).filter((_, i) => { indices.push(i); return true })
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('reduce', () => {
    it('reduces empty tree to initial', () => {
      const result = ConcTree.empty<number>().reduce((acc, x) => acc + x, 0)
      expect(result).toBe(0)
    })

    it('reduces to sum', () => {
      const result = ConcTree.fromArray([1, 2, 3, 4]).reduce((acc, x) => acc + x, 0)
      expect(result).toBe(10)
    })

    it('reduces to string', () => {
      const result = ConcTree.fromArray([1, 2, 3]).reduce((acc, x) => acc + String(x), '')
      expect(result).toBe('123')
    })

    it('provides correct indices', () => {
      const indices: number[] = []
      ConcTree.fromArray([10, 20, 30]).reduce((acc, _, i) => { indices.push(i); return acc }, 0)
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty tree', () => {
      const items: number[] = []
      ConcTree.empty<number>().forEach((x) => items.push(x))
      expect(items).toEqual([])
    })

    it('iterates all elements in order', () => {
      const items: number[] = []
      ConcTree.fromArray([1, 2, 3]).forEach((x) => items.push(x))
      expect(items).toEqual([1, 2, 3])
    })

    it('provides correct indices', () => {
      const indices: number[] = []
      ConcTree.fromArray([10, 20, 30]).forEach((_, i) => indices.push(i))
      expect(indices).toEqual([0, 1, 2])
    })
  })

  describe('Symbol.iterator', () => {
    it('yields nothing for empty tree', () => {
      expect([...ConcTree.empty()]).toEqual([])
    })

    it('yields all elements in order', () => {
      expect([...ConcTree.fromArray([1, 2, 3])]).toEqual([1, 2, 3])
    })

    it('works with for-of', () => {
      const result: number[] = []
      for (const x of ConcTree.fromArray([10, 20, 30])) {
        result.push(x)
      }
      expect(result).toEqual([10, 20, 30])
    })
  })

  describe('clone', () => {
    it('clones empty tree', () => {
      const t = ConcTree.empty<number>().clone()
      expect(t.isEmpty).toBe(true)
    })

    it('clones non-empty tree', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const cloned = orig.clone()
      expect(cloned.toArray()).toEqual([1, 2, 3])
    })

    it('clone produces equal but independent tree', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      const cloned = orig.clone()
      const modified = cloned.set(0, 99)
      expect(orig.toArray()).toEqual([1, 2, 3])
      expect(modified.toArray()).toEqual([99, 2, 3])
    })
  })

  describe('head', () => {
    it('returns undefined for empty tree', () => {
      expect(ConcTree.empty().head()).toBeUndefined()
    })

    it('returns first element', () => {
      expect(ConcTree.fromArray([42, 1, 2]).head()).toBe(42)
    })
  })

  describe('last', () => {
    it('returns undefined for empty tree', () => {
      expect(ConcTree.empty().last()).toBeUndefined()
    })

    it('returns last element', () => {
      expect(ConcTree.fromArray([1, 2, 99]).last()).toBe(99)
    })
  })

  describe('take', () => {
    it('takes 0 from empty tree', () => {
      expect(ConcTree.empty<number>().take(0).isEmpty).toBe(true)
    })

    it('takes first n elements', () => {
      expect(ConcTree.fromArray([1, 2, 3, 4, 5]).take(3).toArray()).toEqual([1, 2, 3])
    })

    it('takes more than size returns all', () => {
      expect(ConcTree.fromArray([1, 2, 3]).take(100).toArray()).toEqual([1, 2, 3])
    })

    it('takes 0 returns empty', () => {
      expect(ConcTree.fromArray([1, 2, 3]).take(0).isEmpty).toBe(true)
    })

    it('handles negative n', () => {
      expect(ConcTree.fromArray([1, 2, 3]).take(-5).isEmpty).toBe(true)
    })
  })

  describe('drop', () => {
    it('drops from empty tree', () => {
      expect(ConcTree.empty<number>().drop(0).isEmpty).toBe(true)
    })

    it('drops first n elements', () => {
      expect(ConcTree.fromArray([1, 2, 3, 4, 5]).drop(2).toArray()).toEqual([3, 4, 5])
    })

    it('drops more than size returns empty', () => {
      expect(ConcTree.fromArray([1, 2, 3]).drop(100).isEmpty).toBe(true)
    })

    it('drops 0 returns all', () => {
      expect(ConcTree.fromArray([1, 2, 3]).drop(0).toArray()).toEqual([1, 2, 3])
    })

    it('handles negative n', () => {
      expect(ConcTree.fromArray([1, 2, 3]).drop(-5).toArray()).toEqual([1, 2, 3])
    })
  })

  describe('reverse', () => {
    it('reverses empty tree', () => {
      expect(ConcTree.empty<number>().reverse().isEmpty).toBe(true)
    })

    it('reverses single element', () => {
      expect(ConcTree.fromArray([1]).reverse().toArray()).toEqual([1])
    })

    it('reverses multiple elements', () => {
      expect(ConcTree.fromArray([1, 2, 3]).reverse().toArray()).toEqual([3, 2, 1])
    })

    it('does not mutate original', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      orig.reverse()
      expect(orig.toArray()).toEqual([1, 2, 3])
    })

    it('reverses large tree', () => {
      const arr = Array.from({ length: 100 }, (_, i) => i)
      const reversed = ConcTree.fromArray(arr).reverse()
      expect(reversed.toArray()).toEqual([...arr].reverse())
    })
  })

  describe('immutability', () => {
    it('all operations return new instances', () => {
      const orig = ConcTree.fromArray([1, 2, 3])
      expect(orig.push(4)).not.toBe(orig)
      expect(orig.pop()[0]).not.toBe(orig)
      expect(orig.unshift(0)).not.toBe(orig)
      expect(orig.shift()[0]).not.toBe(orig)
      expect(orig.insert(1, 99)).not.toBe(orig)
      expect(orig.remove(1)).not.toBe(orig)
      expect(orig.set(0, 99)).not.toBe(orig)
      expect(orig.reverse()).not.toBe(orig)
      expect(orig.concat(ConcTree.fromArray([4]))).not.toBe(orig)
      expect(orig.clear()).not.toBe(orig)
      expect(orig.slice(0, 2)).not.toBe(orig)
      expect(orig.map((x) => x)).not.toBe(orig)
      expect(orig.filter(() => true)).not.toBe(orig)
    })
  })

  describe('fromArray static', () => {
    it('works with strings', () => {
      const t = ConcTree.fromArray(['a', 'b', 'c'])
      expect(t.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('works with objects', () => {
      const objs = [{ x: 1 }, { x: 2 }]
      const t = ConcTree.fromArray(objs)
      expect(t.toArray()).toEqual(objs)
    })
  })

  describe('stats', () => {
    it('returns stats for empty tree', () => {
      const s = ConcTree.empty().stats()
      expect(s.size).toBe(0)
      expect(s.height).toBe(0)
    })

    it('returns stats for small tree', () => {
      const s = ConcTree.fromArray([1, 2, 3]).stats()
      expect(s.size).toBe(3)
      expect(s.height).toBe(0)
      expect(s.leafCount).toBe(1)
      expect(s.nodeCount).toBe(0)
    })

    it('returns stats for large tree', () => {
      const s = ConcTree.fromArray(Array.from({ length: 200 }, (_, i) => i)).stats()
      expect(s.size).toBe(200)
      expect(s.height).toBeGreaterThan(0)
      expect(s.leafCount).toBeGreaterThan(1)
      expect(s.nodeCount).toBeGreaterThan(0)
    })
  })

  describe('complex operations', () => {
    it('supports chained operations', () => {
      const result = ConcTree.fromArray([1, 2, 3, 4, 5])
        .filter((x) => x % 2 !== 0)
        .map((x) => x * 10)
        .reverse()
      expect(result.toArray()).toEqual([50, 30, 10])
    })

    it('supports split-modify-concat', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      const [left, right] = t.split(2)
      const newLeft = left.push(99)
      const result = newLeft.concat(right)
      expect(result.toArray()).toEqual([1, 2, 99, 3, 4, 5])
    })

    it('supports building via repeated push', () => {
      let t = ConcTree.empty<number>()
      for (let i = 0; i < 100; i++) t = t.push(i)
      expect(t.size).toBe(100)
      expect(t.get(0)).toBe(0)
      expect(t.get(99)).toBe(99)
    })

    it('supports building via repeated unshift', () => {
      let t = ConcTree.empty<number>()
      for (let i = 0; i < 100; i++) t = t.unshift(i)
      expect(t.size).toBe(100)
      expect(t.get(0)).toBe(99)
      expect(t.get(99)).toBe(0)
    })

    it('supports sequential insert-remove', () => {
      let t = ConcTree.fromArray([1, 2, 3])
      t = t.insert(1, 10)
      expect(t.toArray()).toEqual([1, 10, 2, 3])
      t = t.remove(1)
      expect(t.toArray()).toEqual([1, 2, 3])
    })

    it('correctly handles large split and rejoin', () => {
      const arr = Array.from({ length: 500 }, (_, i) => i)
      let t = ConcTree.fromArray(arr)
      const parts: ConcTree<number>[] = []
      for (let i = 0; i < 5; i++) {
        const [part, rest] = t.split(100)
        parts.push(part)
        t = rest
      }
      let rebuilt = ConcTree.empty<number>()
      for (const part of parts) {
        rebuilt = rebuilt.concat(part)
      }
      expect(rebuilt.toArray()).toEqual(arr)
    })

    it('maps and reduces correctly', () => {
      const sum = ConcTree.fromArray([1, 2, 3, 4, 5])
        .map((x) => x * x)
        .reduce((acc, x) => acc + x, 0)
      expect(sum).toBe(55)
    })

    it('take and drop compose correctly', () => {
      const t = ConcTree.fromArray([1, 2, 3, 4, 5])
      const middle = t.drop(1).take(3)
      expect(middle.toArray()).toEqual([2, 3, 4])
    })

    it('pop and shift drain a tree', () => {
      let t = ConcTree.fromArray([1, 2, 3])
      const [t1, v1] = t.shift()
      expect(v1).toBe(1)
      const [t2, v2] = t1.pop()
      expect(v2).toBe(3)
      expect(t2.toArray()).toEqual([2])
    })

    it('handles mixed string operations', () => {
      const t = ConcTree.fromArray(['hello', 'world'])
        .push('!')
        .unshift('Oh ')
      expect(t.toArray()).toEqual(['Oh ', 'hello', 'world', '!'])
    })

    it('reverse then reverse equals original', () => {
      const arr = Array.from({ length: 50 }, (_, i) => i)
      const t = ConcTree.fromArray(arr)
      expect(t.reverse().reverse().toArray()).toEqual(arr)
    })
  })
})
