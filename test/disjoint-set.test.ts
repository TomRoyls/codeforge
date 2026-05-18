import { DisjointSet } from '../src/core/disjoint-set/disjoint-set.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('DisjointSet', () => {
  describe('constructor', () => {
    it('creates a DisjointSet with default options (trackSizes: true)', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.getSetSize('a')).toBe(1)
    })

    it('creates a DisjointSet with trackSizes: false', () => {
      const ds = new DisjointSet({ trackSizes: false })
      ds.makeSet('a')
      expect(ds.getSetSize('a')).toBe(0)
    })

    it('creates a DisjointSet with trackSizes: true explicitly', () => {
      const ds = new DisjointSet({ trackSizes: true })
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getSetSize('a')).toBe(2)
    })

    it('starts with zero elements and zero components', () => {
      const ds = new DisjointSet()
      expect(ds.getCount()).toBe(0)
      expect(ds.getComponentCount()).toBe(0)
    })
  })

  // ─── makeSet ──────────────────────────────────────────────────────────

  describe('makeSet', () => {
    it('adds a single element', () => {
      const ds = new DisjointSet()
      ds.makeSet('x')
      expect(ds.has('x')).toBe(true)
      expect(ds.getCount()).toBe(1)
    })

    it('increments component count for each new element', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getComponentCount()).toBe(3)
    })

    it('is idempotent — adding the same element twice does nothing', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('a')
      expect(ds.getCount()).toBe(1)
      expect(ds.getComponentCount()).toBe(1)
    })

    it('element is its own root after makeSet', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.find('a')).toBe('a')
    })

    it('handles empty string as a valid element', () => {
      const ds = new DisjointSet()
      ds.makeSet('')
      expect(ds.has('')).toBe(true)
      expect(ds.find('')).toBe('')
    })

    it('handles element names with special characters', () => {
      const ds = new DisjointSet()
      ds.makeSet('node-1')
      ds.makeSet('node.2')
      ds.makeSet('node_3')
      expect(ds.getCount()).toBe(3)
      expect(ds.find('node-1')).toBe('node-1')
    })
  })

  // ─── find ─────────────────────────────────────────────────────────────

  describe('find', () => {
    it('returns the element itself when it is a root', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.find('a')).toBe('a')
    })

    it('returns the root after a union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      const rootA = ds.find('a')
      const rootB = ds.find('b')
      expect(rootA).toBe(rootB)
    })

    it('throws Error for element not in the set', () => {
      const ds = new DisjointSet()
      expect(() => ds.find('missing')).toThrow('Element "missing" not found')
    })

    it('throws Error for find on empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(() => ds.find('a')).toThrow('Element "a" not found')
    })

    it('implements path compression — deep chains resolve to root', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('b', 'c')
      ds.union('c', 'd')
      const root = ds.find('d')
      expect(ds.find('a')).toBe(root)
      expect(ds.find('b')).toBe(root)
      expect(ds.find('c')).toBe(root)
      expect(ds.find('d')).toBe(root)
    })
  })

  // ─── union ────────────────────────────────────────────────────────────

  describe('union', () => {
    it('merges two separate sets and returns true', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.union('a', 'b')).toBe(true)
      expect(ds.connected('a', 'b')).toBe(true)
    })

    it('returns false when merging elements already in the same set', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.union('a', 'b')).toBe(false)
    })

    it('returns false when first element does not exist', () => {
      const ds = new DisjointSet()
      ds.makeSet('b')
      expect(ds.union('a', 'b')).toBe(false)
    })

    it('returns false when second element does not exist', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.union('a', 'b')).toBe(false)
    })

    it('returns false when neither element exists', () => {
      const ds = new DisjointSet()
      expect(ds.union('x', 'y')).toBe(false)
    })

    it('decrements component count on successful union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getComponentCount()).toBe(3)
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(2)
      ds.union('b', 'c')
      expect(ds.getComponentCount()).toBe(1)
    })

    it('does not decrement component count on failed union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(1)
    })

    it('union of a set with itself returns false', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.union('a', 'a')).toBe(false)
    })

    it('uses union by rank — smaller rank attaches to larger rank', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      ds.union('a', 'c')
      expect(ds.connected('a', 'd')).toBe(true)
      expect(ds.getComponentCount()).toBe(1)
    })

    it('handles large number of unions maintaining single component', () => {
      const ds = new DisjointSet()
      for (let i = 0; i < 50; i++) {
        ds.makeSet(`n${i}`)
      }
      for (let i = 1; i < 50; i++) {
        ds.union('n0', `n${i}`)
      }
      expect(ds.getComponentCount()).toBe(1)
      expect(ds.getCount()).toBe(50)
    })
  })

  // ─── connected ────────────────────────────────────────────────────────

  describe('connected', () => {
    it('returns false for unconnected elements', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('returns true after union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.connected('a', 'b')).toBe(true)
    })

    it('returns false when first element does not exist', () => {
      const ds = new DisjointSet()
      ds.makeSet('b')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('returns false when second element does not exist', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.connected('a', 'b')).toBe(false)
    })

    it('returns false when neither element exists', () => {
      const ds = new DisjointSet()
      expect(ds.connected('x', 'y')).toBe(false)
    })

    it('element is connected to itself', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.connected('a', 'a')).toBe(true)
    })

    it('transitive connectivity works — a→b→c means a connected to c', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      expect(ds.connected('a', 'c')).toBe(true)
    })
  })

  // ─── getSets ──────────────────────────────────────────────────────────

  describe('getSets', () => {
    it('returns empty map for empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(ds.getSets().size).toBe(0)
    })

    it('returns one set per singleton element', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      const sets = ds.getSets()
      expect(sets.size).toBe(2)
    })

    it('returns merged sets after union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const sets = ds.getSets()
      expect(sets.size).toBe(2)
    })

    it('each set contains the correct members', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const sets = ds.getSets()
      const members = Array.from(sets.values())
      const abSet = members.find((s) => s.includes('a') && s.includes('b'))
      expect(abSet).toBeDefined()
      expect(abSet!.sort()).toEqual(['a', 'b'])
      const cSet = members.find((s) => s.includes('c'))
      expect(cSet).toBeDefined()
      expect(cSet).toEqual(['c'])
    })

    it('returns a single set when all elements are unioned', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const sets = ds.getSets()
      expect(sets.size).toBe(1)
      const members = Array.from(sets.values())[0]
      expect(members.sort()).toEqual(['a', 'b', 'c'])
    })
  })

  // ─── getSetSize ───────────────────────────────────────────────────────

  describe('getSetSize', () => {
    it('returns 1 for a singleton set with trackSizes enabled', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.getSetSize('a')).toBe(1)
    })

    it('returns combined size after union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getSetSize('a')).toBe(2)
      expect(ds.getSetSize('b')).toBe(2)
    })

    it('returns 0 for non-existent element', () => {
      const ds = new DisjointSet()
      expect(ds.getSetSize('missing')).toBe(0)
    })

    it('returns 0 when trackSizes is disabled', () => {
      const ds = new DisjointSet({ trackSizes: false })
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getSetSize('a')).toBe(0)
      expect(ds.getSetSize('b')).toBe(0)
    })

    it('returns correct size after multiple unions', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('c', 'd')
      expect(ds.getSetSize('a')).toBe(2)
      ds.union('a', 'c')
      expect(ds.getSetSize('a')).toBe(4)
      expect(ds.getSetSize('d')).toBe(4)
    })

    it('returns correct size regardless of which member is queried', () => {
      const ds = new DisjointSet()
      ds.makeSet('x')
      ds.makeSet('y')
      ds.makeSet('z')
      ds.union('x', 'y')
      ds.union('y', 'z')
      expect(ds.getSetSize('x')).toBe(3)
      expect(ds.getSetSize('y')).toBe(3)
      expect(ds.getSetSize('z')).toBe(3)
    })
  })

  // ─── getCount ─────────────────────────────────────────────────────────

  describe('getCount', () => {
    it('returns 0 for empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(ds.getCount()).toBe(0)
    })

    it('returns the number of elements added', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getCount()).toBe(3)
    })

    it('does not change after unions', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.getCount()).toBe(2)
    })
  })

  // ─── has ──────────────────────────────────────────────────────────────

  describe('has', () => {
    it('returns true for existing element', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      expect(ds.has('a')).toBe(true)
    })

    it('returns false for non-existent element', () => {
      const ds = new DisjointSet()
      expect(ds.has('a')).toBe(false)
    })

    it('returns false on empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(ds.has('anything')).toBe(false)
    })

    it('still returns true after union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      expect(ds.has('a')).toBe(true)
      expect(ds.has('b')).toBe(true)
    })
  })

  // ─── getComponentCount ────────────────────────────────────────────────

  describe('getComponentCount', () => {
    it('returns 0 for empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(ds.getComponentCount()).toBe(0)
    })

    it('equals element count with no unions', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      expect(ds.getComponentCount()).toBe(3)
      expect(ds.getComponentCount()).toBe(ds.getCount())
    })

    it('decreases after each successful union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      expect(ds.getComponentCount()).toBe(2)
      ds.union('a', 'c')
      expect(ds.getComponentCount()).toBe(1)
    })
  })

  // ─── clear ────────────────────────────────────────────────────────────

  describe('clear', () => {
    it('removes all elements', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.clear()
      expect(ds.getCount()).toBe(0)
      expect(ds.has('a')).toBe(false)
      expect(ds.has('b')).toBe(false)
    })

    it('resets component count to 0', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.clear()
      expect(ds.getComponentCount()).toBe(0)
    })

    it('allows adding elements after clear', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.clear()
      ds.makeSet('b')
      expect(ds.getCount()).toBe(1)
      expect(ds.has('b')).toBe(true)
      expect(ds.has('a')).toBe(false)
    })

    it('clear on empty DisjointSet is a no-op', () => {
      const ds = new DisjointSet()
      ds.clear()
      expect(ds.getCount()).toBe(0)
      expect(ds.getComponentCount()).toBe(0)
    })
  })

  // ─── toArray ──────────────────────────────────────────────────────────

  describe('toArray', () => {
    it('returns empty array for empty DisjointSet', () => {
      const ds = new DisjointSet()
      expect(ds.toArray()).toEqual([])
    })

    it('returns array of singleton arrays for unconnected elements', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      const arr = ds.toArray()
      expect(arr.length).toBe(2)
    })

    it('returns merged groups after union', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      const arr = ds.toArray()
      expect(arr.length).toBe(2)
      const sorted = arr.map((group) => group.sort())
      const abGroup = sorted.find((g) => g.includes('a'))
      expect(abGroup).toEqual(['a', 'b'])
    })
  })

  // ─── getStats ─────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('returns zeroed stats for empty DisjointSet', () => {
      const ds = new DisjointSet()
      const stats = ds.getStats()
      expect(stats).toEqual({
        elementCount: 0,
        componentCount: 0,
        maxComponentSize: 0,
        minComponentSize: 0,
      })
    })

    it('returns stats for singleton sets', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(2)
      expect(stats.componentCount).toBe(2)
      expect(stats.maxComponentSize).toBe(1)
      expect(stats.minComponentSize).toBe(1)
    })

    it('returns correct stats after unions', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(4)
      expect(stats.componentCount).toBe(3)
      expect(stats.maxComponentSize).toBe(2)
      expect(stats.minComponentSize).toBe(1)
    })

    it('returns correct stats when all elements in one component', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('b', 'c')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(3)
      expect(stats.componentCount).toBe(1)
      expect(stats.maxComponentSize).toBe(3)
      expect(stats.minComponentSize).toBe(3)
    })
  })

  // ─── Edge Cases & Integration ─────────────────────────────────────────

  describe('edge cases and integration', () => {
    it('handles a single element correctly', () => {
      const ds = new DisjointSet()
      ds.makeSet('only')
      expect(ds.getCount()).toBe(1)
      expect(ds.getComponentCount()).toBe(1)
      expect(ds.find('only')).toBe('only')
      expect(ds.connected('only', 'only')).toBe(true)
      expect(ds.getSetSize('only')).toBe(1)
      const sets = ds.getSets()
      expect(sets.size).toBe(1)
    })

    it('handles two elements unioned in both orders', () => {
      const ds1 = new DisjointSet()
      ds1.makeSet('a')
      ds1.makeSet('b')
      ds1.union('a', 'b')
      const ds2 = new DisjointSet()
      ds2.makeSet('a')
      ds2.makeSet('b')
      ds2.union('b', 'a')
      expect(ds1.connected('a', 'b')).toBe(true)
      expect(ds2.connected('a', 'b')).toBe(true)
      expect(ds1.getComponentCount()).toBe(ds2.getComponentCount())
    })

    it('handles chain of unions forming a single component', () => {
      const ds = new DisjointSet()
      for (let i = 0; i < 10; i++) ds.makeSet(`n${i}`)
      for (let i = 0; i < 9; i++) ds.union(`n${i}`, `n${i + 1}`)
      expect(ds.getComponentCount()).toBe(1)
      expect(ds.connected('n0', 'n9')).toBe(true)
      expect(ds.getSetSize('n0')).toBe(10)
    })

    it('handles star topology — all unioned to one center', () => {
      const ds = new DisjointSet()
      ds.makeSet('center')
      for (let i = 0; i < 5; i++) {
        ds.makeSet(`leaf${i}`)
        ds.union('center', `leaf${i}`)
      }
      expect(ds.getComponentCount()).toBe(1)
      expect(ds.getCount()).toBe(6)
      expect(ds.connected('center', 'leaf4')).toBe(true)
      expect(ds.connected('leaf0', 'leaf4')).toBe(true)
    })

    it('maintains consistency after clear and rebuild', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.clear()
      ds.makeSet('x')
      ds.makeSet('y')
      expect(ds.getCount()).toBe(2)
      expect(ds.getComponentCount()).toBe(2)
      expect(ds.connected('x', 'y')).toBe(false)
      ds.union('x', 'y')
      expect(ds.connected('x', 'y')).toBe(true)
      expect(ds.getComponentCount()).toBe(1)
    })

    it('getStats tracks max and min component sizes correctly', () => {
      const ds = new DisjointSet()
      // Group 1: a, b, c, d (size 4)
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.makeSet('d')
      ds.union('a', 'b')
      ds.union('b', 'c')
      ds.union('c', 'd')
      // Group 2: e (size 1)
      ds.makeSet('e')
      // Group 3: f, g (size 2)
      ds.makeSet('f')
      ds.makeSet('g')
      ds.union('f', 'g')
      const stats = ds.getStats()
      expect(stats.elementCount).toBe(7)
      expect(stats.componentCount).toBe(3)
      expect(stats.maxComponentSize).toBe(4)
      expect(stats.minComponentSize).toBe(1)
    })

    it('toArray and getSets agree on structure', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'c')
      const mapSets = ds.getSets()
      const arrSets = ds.toArray()
      expect(mapSets.size).toBe(arrSets.length)
      const allMapMembers = Array.from(mapSets.values()).flat().sort()
      const allArrMembers = arrSets.flat().sort()
      expect(allMapMembers).toEqual(allArrMembers)
    })

    it('does not leak size tracking when trackSizes is false', () => {
      const ds = new DisjointSet({ trackSizes: false })
      ds.makeSet('a')
      ds.makeSet('b')
      ds.makeSet('c')
      ds.union('a', 'b')
      ds.union('a', 'c')
      expect(ds.getSetSize('a')).toBe(0)
      expect(ds.getSetSize('b')).toBe(0)
      expect(ds.getSetSize('c')).toBe(0)
      expect(ds.connected('a', 'c')).toBe(true)
    })

    it('handles duplicate makeSet calls interleaved with unions', () => {
      const ds = new DisjointSet()
      ds.makeSet('a')
      ds.makeSet('b')
      ds.union('a', 'b')
      ds.makeSet('a')
      ds.makeSet('b')
      expect(ds.getCount()).toBe(2)
      expect(ds.getComponentCount()).toBe(1)
    })

    it('handles many singleton sets with no unions', () => {
      const ds = new DisjointSet()
      for (let i = 0; i < 100; i++) ds.makeSet(`item${i}`)
      expect(ds.getCount()).toBe(100)
      expect(ds.getComponentCount()).toBe(100)
      const stats = ds.getStats()
      expect(stats.maxComponentSize).toBe(1)
      expect(stats.minComponentSize).toBe(1)
    })
  })
})
