import { KthLargest } from '../src/core/k-th-largest/index.js'

// ─── Constructor ────────────────────────────────────────────────────────

describe('KthLargest', () => {
  describe('constructor', () => {
    it('creates instance with k and initial nums', () => {
      const kth = new KthLargest(3, [4, 5, 8, 2])
      expect(kth.getKthLargest()).toBe(4)
    })

    it('handles empty initial nums', () => {
      const kth = new KthLargest(2, [])
      expect(kth.size).toBe(0)
      expect(kth.isEmpty).toBe(true)
    })

    it('handles k larger than initial nums', () => {
      const kth = new KthLargest(5, [1, 2])
      expect(kth.size).toBe(2)
    })
  })

  // ─── Add ────────────────────────────────────────────────────────────────

  describe('add', () => {
    it('returns kth largest after each add', () => {
      const kth = new KthLargest(3, [4, 5, 8, 2])
      expect(kth.add(3)).toBe(4)
      expect(kth.add(5)).toBe(5)
      expect(kth.add(10)).toBe(5)
      expect(kth.add(9)).toBe(8)
      expect(kth.add(4)).toBe(8)
    })

    it('fills heap when under capacity', () => {
      const kth = new KthLargest(3, [])
      expect(kth.add(1)).toBe(-Infinity)
      expect(kth.add(2)).toBe(-Infinity)
      expect(kth.add(3)).toBe(1)
      expect(kth.add(4)).toBe(2)
    })

    it('ignores values smaller than kth largest', () => {
      const kth = new KthLargest(2, [10, 20])
      expect(kth.add(5)).toBe(10)
    })

    it('updates when larger value added', () => {
      const kth = new KthLargest(2, [10, 20])
      expect(kth.add(30)).toBe(20)
    })

    it('handles k=1', () => {
      const kth = new KthLargest(1, [])
      kth.add(5)
      expect(kth.add(10)).toBe(10)
      expect(kth.add(3)).toBe(10)
    })
  })

  // ─── Properties ─────────────────────────────────────────────────────────

  describe('properties', () => {
    it('size returns heap size', () => {
      const kth = new KthLargest(3, [1, 2, 3, 4])
      expect(kth.size).toBe(3)
    })

    it('isEmpty checks if heap is empty', () => {
      const kth = new KthLargest(2, [])
      expect(kth.isEmpty).toBe(true)
      kth.add(1)
      expect(kth.isEmpty).toBe(false)
    })

    it('getKthLargest returns current kth', () => {
      const kth = new KthLargest(3, [1, 2, 3])
      expect(kth.getKthLargest()).toBe(1)
      kth.add(4)
      expect(kth.getKthLargest()).toBe(2)
    })
  })

  // ─── Edge Cases ─────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('handles duplicate values', () => {
      const kth = new KthLargest(3, [5, 5, 5])
      expect(kth.getKthLargest()).toBe(5)
      expect(kth.add(5)).toBe(5)
    })

    it('handles negative numbers', () => {
      const kth = new KthLargest(2, [-1, -5, -3])
      expect(kth.getKthLargest()).toBe(-3)
      expect(kth.add(0)).toBe(-1)
    })

    it('handles single element', () => {
      const kth = new KthLargest(1, [42])
      expect(kth.getKthLargest()).toBe(42)
      expect(kth.add(100)).toBe(100)
    })
  })
})
