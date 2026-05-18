import { MoveToFront } from '../src/core/move-to-front/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('MoveToFront', () => {
  describe('constructor', () => {
    it('creates empty transform', () => {
      const mtf = new MoveToFront<number>()
      expect(mtf.size()).toBe(0)
      expect(mtf.isEmpty()).toBe(true)
    })

    it('creates with initial items', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      expect(mtf.size()).toBe(3)
      expect(mtf.toArray()).toEqual(['a', 'b', 'c'])
    })

    it('deduplicates initial items', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'a', 'c'])
      expect(mtf.size()).toBe(3)
    })
  })

  // ─── Access ──────────────────────────────────────────────────────────────

  describe('access', () => {
    it('returns position of existing item', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      expect(mtf.access('b')).toBe(1)
    })

    it('moves accessed item to front', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      mtf.access('c')
      expect(mtf.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('returns -1 for new items and adds them', () => {
      const mtf = new MoveToFront<string>(['a', 'b'])
      expect(mtf.access('x')).toBe(-1)
      expect(mtf.contains('x')).toBe(true)
      expect(mtf.toArray()[0]).toBe('x')
    })
  })

  // ─── AccessAt ────────────────────────────────────────────────────────────

  describe('accessAt', () => {
    it('accesses by index and moves to front', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      expect(mtf.accessAt(2)).toBe('c')
      expect(mtf.toArray()).toEqual(['c', 'a', 'b'])
    })

    it('throws for out-of-bounds', () => {
      const mtf = new MoveToFront<string>(['a'])
      expect(() => mtf.accessAt(5)).toThrow(RangeError)
      expect(() => mtf.accessAt(-1)).toThrow(RangeError)
    })
  })

  // ─── Contains / PositionOf ──────────────────────────────────────────────

  describe('contains and positionOf', () => {
    it('contains checks membership', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      expect(mtf.contains(2)).toBe(true)
      expect(mtf.contains(5)).toBe(false)
    })

    it('positionOf returns index', () => {
      const mtf = new MoveToFront<number>([10, 20, 30])
      expect(mtf.positionOf(20)).toBe(1)
      expect(mtf.positionOf(99)).toBe(-1)
    })
  })

  // ─── Remove ──────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('removes item from list', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c'])
      expect(mtf.remove('b')).toBe(true)
      expect(mtf.size()).toBe(2)
      expect(mtf.contains('b')).toBe(false)
    })

    it('returns false for missing item', () => {
      const mtf = new MoveToFront<string>(['a'])
      expect(mtf.remove('z')).toBe(false)
    })
  })

  // ─── Add ─────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('adds new item to front', () => {
      const mtf = new MoveToFront<number>()
      mtf.add(42)
      expect(mtf.toArray()).toEqual([42])
      mtf.add(10)
      expect(mtf.toArray()).toEqual([10, 42])
    })

    it('moves existing item to front on add', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.add(3)
      expect(mtf.toArray()).toEqual([3, 1, 2])
    })
  })

  // ─── Encode / Decode ─────────────────────────────────────────────────────

  describe('encode and decode', () => {
    it('encodes data to positions', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c', 'd'])
      const encoded = mtf.encode(['b', 'a', 'c'])
      expect(encoded.length).toBe(3)
      expect(typeof encoded[0]).toBe('number')
    })

    it('decode reconstructs data from positions', () => {
      const mtf = new MoveToFront<string>(['a', 'b', 'c', 'd'])
      const encoded = mtf.encode(['b', 'a', 'c'])
      const decoded = mtf.decode(encoded)
      expect(decoded).toEqual(['b', 'a', 'c'])
    })
  })

  // ─── Reset / Clone ───────────────────────────────────────────────────────

  describe('reset and clone', () => {
    it('reset restores initial state', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      mtf.access(3)
      mtf.reset()
      expect(mtf.toArray()).toEqual([1, 2, 3])
    })

    it('clone creates independent copy', () => {
      const mtf = new MoveToFront<number>([1, 2, 3])
      const cloned = mtf.clone()
      mtf.access(3)
      expect(cloned.toArray()).not.toEqual(mtf.toArray())
    })

    it('frequency tracks access counts', () => {
      const mtf = new MoveToFront<string>(['a', 'b'])
      mtf.access('a')
      mtf.access('a')
      const freq = mtf.frequency()
      expect(freq.get('a')).toBe(2)
      expect(freq.get('b')).toBe(undefined)
    })
  })
})
