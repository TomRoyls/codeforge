import { AVLTree3 } from '../src/core/avl-tree-3/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('AVLTree3', () => {
  describe('constructor', () => {
    it('creates empty tree with default comparator', () => {
      const tree = new AVLTree3<number>()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('uses default comparator for ordering', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArray()).toEqual([3, 5, 7])
    })

    it('accepts a custom comparator', () => {
      const tree = new AVLTree3<number>((a, b) => b - a)
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.toArray()).toEqual([7, 5, 3])
    })

    it('accepts a string locale comparator', () => {
      const tree = new AVLTree3<string>((a, b) => a.localeCompare(b))
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })
  })

  // ─── Insert ─────────────────────────────────────────────────────────────

  describe('insert', () => {
    it('inserts a single element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.contains(5)).toBe(true)
    })

    it('inserts multiple elements', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.size).toBe(3)
      expect(tree.contains(5)).toBe(true)
      expect(tree.contains(3)).toBe(true)
      expect(tree.contains(7)).toBe(true)
    })

    it('maintains sorted order', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(2)
      tree.insert(7)
      expect(tree.toArray()).toEqual([2, 5, 7, 10, 15])
    })

    it('ignores duplicate values', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
      expect(tree.toArray()).toEqual([5])
    })

    it('handles sequential inserts', () => {
      const tree = new AVLTree3<number>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(10)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles reverse sequential inserts', () => {
      const tree = new AVLTree3<number>()
      for (let i = 10; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(10)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it('handles random order inserts', () => {
      const tree = new AVLTree3<number>()
      const values = [15, 7, 23, 4, 11, 19, 27, 2, 6, 9]
      for (const v of values) tree.insert(v)
      expect(tree.size).toBe(10)
      expect(tree.toArray()).toEqual([2, 4, 6, 7, 9, 11, 15, 19, 23, 27])
    })

    it('handles negative numbers', () => {
      const tree = new AVLTree3<number>()
      tree.insert(-3)
      tree.insert(-1)
      tree.insert(-5)
      tree.insert(0)
      expect(tree.toArray()).toEqual([-5, -3, -1, 0])
    })

    it('handles inserting zero', () => {
      const tree = new AVLTree3<number>()
      tree.insert(0)
      expect(tree.size).toBe(1)
      expect(tree.contains(0)).toBe(true)
    })

    it('handles string elements', () => {
      const tree = new AVLTree3<string>()
      tree.insert('cherry')
      tree.insert('apple')
      tree.insert('banana')
      expect(tree.toArray()).toEqual(['apple', 'banana', 'cherry'])
    })

    it('handles object elements with custom comparator', () => {
      interface Item {
        id: number
      }
      const tree = new AVLTree3<Item>((a, b) => a.id - b.id)
      tree.insert({ id: 3 })
      tree.insert({ id: 1 })
      tree.insert({ id: 2 })
      expect(tree.size).toBe(3)
      expect(tree.toArray().map((item) => item.id)).toEqual([1, 2, 3])
    })
  })

  // ─── Search / Contains ─────────────────────────────────────────────────

  describe('search', () => {
    it('finds existing element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      expect(tree.search(5)).toBe(true)
      expect(tree.search(3)).toBe(true)
      expect(tree.search(7)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.search(1)).toBe(false)
      expect(tree.search(10)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.search(5)).toBe(false)
    })
  })

  describe('contains', () => {
    it('returns true for existing element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      expect(tree.contains(10)).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      expect(tree.contains(20)).toBe(false)
    })

    it('returns false on empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.contains(1)).toBe(false)
    })

    it('is consistent with search', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.contains(5)).toBe(tree.search(5))
      expect(tree.contains(99)).toBe(tree.search(99))
    })

    it('finds elements after many insertions', () => {
      const tree = new AVLTree3<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 100; i++) {
        expect(tree.contains(i)).toBe(true)
      }
      expect(tree.contains(100)).toBe(false)
      expect(tree.contains(-1)).toBe(false)
    })
  })

  // ─── Delete ─────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('deletes a leaf node', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(5)
      expect(tree.size).toBe(2)
      expect(tree.contains(5)).toBe(false)
      expect(tree.toArray()).toEqual([10, 15])
    })

    it('deletes a node with one child', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(3)
      tree.delete(5)
      expect(tree.size).toBe(3)
      expect(tree.contains(5)).toBe(false)
      expect(tree.toArray()).toEqual([3, 10, 15])
    })

    it('deletes a node with two children', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(10)
      expect(tree.size).toBe(2)
      expect(tree.contains(10)).toBe(false)
      expect(tree.toArray()).toEqual([5, 15])
    })

    it('deletes the root node', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.delete(10)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('does nothing when deleting from empty tree', () => {
      const tree = new AVLTree3<number>()
      tree.delete(99)
      expect(tree.size).toBe(0)
    })

    it('does nothing when deleting non-existent value', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      const sizeBefore = tree.size
      tree.delete(99)
      expect(tree.size).toBe(sizeBefore)
    })

    it('deletes all elements one by one', () => {
      const tree = new AVLTree3<number>()
      for (let i = 1; i <= 10; i++) {
        tree.insert(i)
      }
      for (let i = 1; i <= 10; i++) {
        tree.delete(i)
      }
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('maintains sorted order after deletions', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(2)
      tree.insert(8)
      tree.insert(1)
      tree.insert(3)
      tree.insert(7)
      tree.insert(9)
      tree.delete(5)
      tree.delete(1)
      expect(tree.toArray()).toEqual([2, 3, 7, 8, 9])
    })

    it('search returns false after delete', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.delete(10)
      expect(tree.search(10)).toBe(false)
      expect(tree.search(5)).toBe(true)
      expect(tree.search(15)).toBe(true)
    })
  })

  // ─── Min / Max ──────────────────────────────────────────────────────────

  describe('min', () => {
    it('returns null for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.min()).toBeNull()
    })

    it('returns the single element in a one-node tree', () => {
      const tree = new AVLTree3<number>()
      tree.insert(42)
      expect(tree.min()).toBe(42)
    })

    it('returns the minimum after multiple insertions', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(2)
      expect(tree.min()).toBe(2)
    })

    it('works with negative numbers', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(-10)
      tree.insert(15)
      expect(tree.min()).toBe(-10)
    })

    it('updates min after deleting the current minimum', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(1)
      expect(tree.min()).toBe(2)
    })
  })

  describe('max', () => {
    it('returns null for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.max()).toBeNull()
    })

    it('returns the single element in a one-node tree', () => {
      const tree = new AVLTree3<number>()
      tree.insert(42)
      expect(tree.max()).toBe(42)
    })

    it('returns the maximum after multiple insertions', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      tree.insert(20)
      expect(tree.max()).toBe(20)
    })

    it('works with negative numbers', () => {
      const tree = new AVLTree3<number>()
      tree.insert(-5)
      tree.insert(-10)
      tree.insert(-15)
      expect(tree.max()).toBe(-5)
    })

    it('updates max after deleting the current maximum', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.delete(3)
      expect(tree.max()).toBe(2)
    })
  })

  // ─── Size / IsEmpty ─────────────────────────────────────────────────────

  describe('size and isEmpty', () => {
    it('size is 0 for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.size).toBe(0)
    })

    it('isEmpty returns true for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.isEmpty()).toBe(true)
    })

    it('isEmpty returns false after insertion', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.isEmpty()).toBe(false)
    })

    it('size does not count duplicates', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(5)
      tree.insert(5)
      expect(tree.size).toBe(1)
    })

    it('size tracks insertions and deletions', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      expect(tree.size).toBe(3)
      tree.delete(2)
      expect(tree.size).toBe(2)
      tree.delete(1)
      tree.delete(3)
      expect(tree.size).toBe(0)
    })
  })

  // ─── Clear ──────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('clears an empty tree as no-op', () => {
      const tree = new AVLTree3<number>()
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
    })

    it('clears a non-empty tree', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.clear()
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it('tree is usable after clear', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.clear()
      tree.insert(2)
      expect(tree.size).toBe(1)
      expect(tree.contains(2)).toBe(true)
    })
  })

  // ─── ToArray ────────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.toArray()).toEqual([])
    })

    it('returns single element array', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.toArray()).toEqual([5])
    })

    it('returns sorted array for many elements', () => {
      const tree = new AVLTree3<number>()
      tree.insert(3)
      tree.insert(1)
      tree.insert(4)
      tree.insert(1)
      tree.insert(5)
      tree.insert(9)
      tree.insert(2)
      tree.insert(6)
      expect(tree.toArray()).toEqual([1, 2, 3, 4, 5, 6, 9])
    })

    it('returns a new array each time', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      const a1 = tree.toArray()
      const a2 = tree.toArray()
      expect(a1).toEqual(a2)
      expect(a1).not.toBe(a2)
    })
  })

  // ─── ForEach ────────────────────────────────────────────────────────────

  describe('forEach', () => {
    it('does not call callback on empty tree', () => {
      const tree = new AVLTree3<number>()
      let callCount = 0
      tree.forEach(() => {
        callCount++
      })
      expect(callCount).toBe(0)
    })

    it('visits all elements in order', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(5)
      tree.insert(15)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([5, 10, 15])
    })

    it('visits single element', () => {
      const tree = new AVLTree3<number>()
      tree.insert(42)
      const result: number[] = []
      tree.forEach((v) => result.push(v))
      expect(result).toEqual([42])
    })

    it('accumulates correctly after mixed operations', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(1)
      tree.delete(5)
      let sum = 0
      tree.forEach((v) => {
        sum += v
      })
      expect(sum).toBe(11) // 1 + 3 + 7
    })
  })

  // ─── Height ─────────────────────────────────────────────────────────────

  describe('height', () => {
    it('returns 0 for empty tree', () => {
      const tree = new AVLTree3<number>()
      expect(tree.height()).toBe(0)
    })

    it('returns 1 for single node', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      expect(tree.height()).toBe(1)
    })

    it('returns 2 for balanced three-node tree', () => {
      const tree = new AVLTree3<number>()
      tree.insert(2)
      tree.insert(1)
      tree.insert(3)
      expect(tree.height()).toBe(2)
    })

    it('stays O(log n) for sequential inserts', () => {
      const tree = new AVLTree3<number>()
      for (let i = 1; i <= 1000; i++) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(11)
    })

    it('stays O(log n) for reverse sequential inserts', () => {
      const tree = new AVLTree3<number>()
      for (let i = 1000; i >= 1; i--) {
        tree.insert(i)
      }
      expect(tree.height()).toBeLessThanOrEqual(11)
    })

    it('remains balanced after deletions', () => {
      const tree = new AVLTree3<number>()
      for (let i = 1; i <= 100; i++) {
        tree.insert(i)
      }
      tree.delete(50)
      expect(tree.height()).toBeLessThanOrEqual(8)
    })
  })

  // ─── Rotations ──────────────────────────────────────────────────────────

  describe('AVL rotations', () => {
    it('performs right rotation for left-left case', () => {
      const tree = new AVLTree3<number>()
      tree.insert(30)
      tree.insert(20)
      tree.insert(10)
      expect(tree.toArray()).toEqual([10, 20, 30])
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('performs left rotation for right-right case', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.toArray()).toEqual([10, 20, 30])
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('performs left-right rotation for left-right case', () => {
      const tree = new AVLTree3<number>()
      tree.insert(30)
      tree.insert(10)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('performs right-left rotation for right-left case', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      tree.insert(30)
      tree.insert(20)
      expect(tree.toArray()).toEqual([10, 20, 30])
      expect(tree.height()).toBeLessThanOrEqual(2)
    })

    it('maintains balance through complex operations', () => {
      const tree = new AVLTree3<number>()
      const values = [41, 20, 65, 11, 29, 50, 26]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.toArray()).toEqual([11, 20, 26, 29, 41, 50, 65])
      expect(tree.height()).toBeLessThanOrEqual(4)
    })
  })

  // ─── Balance After Delete ───────────────────────────────────────────────

  describe('balance after delete', () => {
    it('maintains balance after deleting root with two children', () => {
      const tree = new AVLTree3<number>()
      tree.insert(4)
      tree.insert(2)
      tree.insert(6)
      tree.insert(1)
      tree.insert(3)
      tree.insert(5)
      tree.insert(7)
      tree.delete(4)
      expect(tree.toArray()).toEqual([1, 2, 3, 5, 6, 7])
    })

    it('handles successor node replacement correctly', () => {
      const tree = new AVLTree3<number>()
      tree.insert(5)
      tree.insert(3)
      tree.insert(7)
      tree.insert(6)
      tree.insert(8)
      tree.delete(5)
      expect(tree.contains(5)).toBe(false)
      expect(tree.contains(6)).toBe(true)
      expect(tree.size).toBe(4)
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('insert and delete same value repeatedly', () => {
      const tree = new AVLTree3<number>()
      tree.insert(10)
      expect(tree.size).toBe(1)
      tree.delete(10)
      expect(tree.size).toBe(0)
      tree.insert(10)
      expect(tree.size).toBe(1)
      tree.delete(10)
      expect(tree.size).toBe(0)
    })

    it('handles large dataset (1000 elements)', () => {
      const tree = new AVLTree3<number>()
      for (let i = 0; i < 1000; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(1000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(999)
      expect(tree.height()).toBeLessThanOrEqual(11)
      const arr = tree.toArray()
      for (let i = 0; i < 1000; i++) {
        expect(arr[i]).toBe(i)
      }
    })

    it('handles large dataset in reverse order', () => {
      const tree = new AVLTree3<number>()
      for (let i = 999; i >= 0; i--) {
        tree.insert(i)
      }
      expect(tree.size).toBe(1000)
      expect(tree.min()).toBe(0)
      expect(tree.max()).toBe(999)
    })

    it('handles duplicate insertions among many values', () => {
      const tree = new AVLTree3<number>()
      const values = [5, 3, 7, 3, 5, 7, 1, 1, 9]
      for (const v of values) {
        tree.insert(v)
      }
      expect(tree.size).toBe(5)
      expect(tree.toArray()).toEqual([1, 3, 5, 7, 9])
    })

    it('handles string tree with various operations', () => {
      const tree = new AVLTree3<string>()
      tree.insert('delta')
      tree.insert('alpha')
      tree.insert('charlie')
      tree.insert('bravo')
      tree.insert('echo')
      expect(tree.size).toBe(5)
      expect(tree.min()).toBe('alpha')
      expect(tree.max()).toBe('echo')
      expect(tree.toArray()).toEqual(['alpha', 'bravo', 'charlie', 'delta', 'echo'])
      tree.delete('charlie')
      expect(tree.size).toBe(4)
      expect(tree.contains('charlie')).toBe(false)
    })

    it('handles custom object comparator', () => {
      interface Person {
        name: string
        age: number
      }
      const tree = new AVLTree3<Person>((a, b) => a.age - b.age)
      tree.insert({ name: 'Alice', age: 30 })
      tree.insert({ name: 'Bob', age: 25 })
      tree.insert({ name: 'Charlie', age: 35 })
      expect(tree.size).toBe(3)
      expect(tree.min()!.name).toBe('Bob')
      expect(tree.max()!.name).toBe('Charlie')
    })

    it('clear and rebuild', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.clear()
      expect(tree.size).toBe(0)
      tree.insert(10)
      tree.insert(20)
      expect(tree.size).toBe(2)
      expect(tree.toArray()).toEqual([10, 20])
    })

    it('handles deleting all elements to reach empty', () => {
      const tree = new AVLTree3<number>()
      tree.insert(1)
      tree.insert(2)
      tree.insert(3)
      tree.insert(4)
      tree.insert(5)
      tree.delete(3)
      tree.delete(1)
      tree.delete(5)
      tree.delete(2)
      tree.delete(4)
      expect(tree.size).toBe(0)
      expect(tree.isEmpty()).toBe(true)
      expect(tree.toArray()).toEqual([])
    })

    it('inserts and deletes 500 elements maintaining balance', () => {
      const tree = new AVLTree3<number>()
      for (let i = 0; i < 500; i++) {
        tree.insert(i)
      }
      expect(tree.size).toBe(500)
      for (let i = 0; i < 500; i += 2) {
        tree.delete(i)
      }
      expect(tree.size).toBe(250)
      for (let i = 1; i < 500; i += 2) {
        expect(tree.contains(i)).toBe(true)
      }
      for (let i = 0; i < 500; i += 2) {
        expect(tree.contains(i)).toBe(false)
      }
    })

    it('handles alternating insert and delete', () => {
      const tree = new AVLTree3<number>()
      for (let i = 0; i < 100; i++) {
        tree.insert(i)
      }
      for (let i = 0; i < 50; i++) {
        tree.delete(i)
        tree.insert(i + 100)
      }
      expect(tree.size).toBe(100)
    })

    it('min and max after complex operations', () => {
      const tree = new AVLTree3<number>()
      for (let i = 10; i <= 100; i += 10) {
        tree.insert(i)
      }
      expect(tree.min()).toBe(10)
      expect(tree.max()).toBe(100)
      tree.delete(10)
      tree.delete(100)
      expect(tree.min()).toBe(20)
      expect(tree.max()).toBe(90)
    })

    it('works with floating point comparator', () => {
      const tree = new AVLTree3<number>((a, b) => {
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
      tree.insert(3.14)
      tree.insert(1.41)
      tree.insert(2.72)
      expect(tree.toArray()).toEqual([1.41, 2.72, 3.14])
    })

    it('handles object key comparator', () => {
      interface Entry {
        key: string
        value: number
      }
      const tree = new AVLTree3<Entry>((a, b) => a.key.localeCompare(b.key))
      tree.insert({ key: 'c', value: 3 })
      tree.insert({ key: 'a', value: 1 })
      tree.insert({ key: 'b', value: 2 })
      const arr = tree.toArray()
      expect(arr[0].key).toBe('a')
      expect(arr[1].key).toBe('b')
      expect(arr[2].key).toBe('c')
    })
  })
})
