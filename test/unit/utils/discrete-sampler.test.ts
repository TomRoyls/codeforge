import { describe, it, expect } from 'vitest'
import { DiscreteSampler } from '../../../src/utils/discrete-sampler.js'

describe('DiscreteSampler', () => {
  describe('uniform weights', () => {
    it('samples uniformly from equal weights', () => {
      const ds = new DiscreteSampler([1, 1, 1, 1])
      const counts = new Array(4).fill(0)
      for (let i = 0; i < 10000; i++) {
        counts[ds.sample()]!++
      }
      for (const c of counts) {
        expect(c).toBeGreaterThan(2000)
      }
    })
  })

  describe('skewed weights', () => {
    it('favors heavier weights', () => {
      const ds = new DiscreteSampler([100, 1])
      let heavyCount = 0
      for (let i = 0; i < 1000; i++) {
        if (ds.sample() === 0) heavyCount++
      }
      expect(heavyCount).toBeGreaterThan(950)
    })
  })

  describe('sampleN', () => {
    it('returns correct number of samples', () => {
      const ds = new DiscreteSampler([1, 1, 1])
      expect(ds.sampleN(10).length).toBe(10)
    })

    it('all samples are valid indices', () => {
      const ds = new DiscreteSampler([1, 1, 1, 1, 1])
      const samples = ds.sampleN(100)
      for (const s of samples) {
        expect(s).toBeGreaterThanOrEqual(0)
        expect(s).toBeLessThan(5)
      }
    })
  })

  describe('edge cases', () => {
    it('handles single element', () => {
      const ds = new DiscreteSampler([42])
      expect(ds.sample()).toBe(0)
    })

    it('handles zero sum gracefully', () => {
      const ds = new DiscreteSampler([0, 0, 0])
      const s = ds.sample()
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThan(3)
    })

    it('handles very unbalanced weights', () => {
      const ds = new DiscreteSampler([1000000, 1])
      let heavyCount = 0
      for (let i = 0; i < 100; i++) {
        if (ds.sample() === 0) heavyCount++
      }
      expect(heavyCount).toBe(100)
    })
  })
})
