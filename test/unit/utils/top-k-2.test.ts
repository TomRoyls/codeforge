import { describe, it, expect } from 'vitest'
import { TopK2 } from '../../../src/utils/top-k-2.js'

describe('TopK2', () => {
  describe('add and top', () => {
    it('tracks top K items', () => {
      const tk = new TopK2<string>(3)
      tk.add('a', 10)
      tk.add('b', 20)
      tk.add('c', 30)
      expect(tk.top()[0]).toEqual({ item: 'c', count: 30 })
    })

    it('evicts smallest when full', () => {
      const tk = new TopK2<string>(2)
      tk.add('a', 5)
      tk.add('b', 10)
      tk.add('c', 15)
      const top = tk.top()
      expect(top.length).toBe(2)
      expect(top.find(e => e.item === 'a')).toBeUndefined()
    })

    it('keeps existing small item when new is smaller', () => {
      const tk = new TopK2<string>(2)
      tk.add('a', 10)
      tk.add('b', 20)
      tk.add('c', 5)
      const items = tk.top().map(e => e.item)
      expect(items).toContain('a')
      expect(items).toContain('b')
    })

    it('increments existing items', () => {
      const tk = new TopK2<string>(3)
      tk.add('a', 5)
      tk.add('a', 5)
      expect(tk.top()[0]).toEqual({ item: 'a', count: 10 })
    })
  })

  describe('size and capacity', () => {
    it('tracks size', () => {
      const tk = new TopK2<number>(5)
      tk.add(1)
      tk.add(2)
      expect(tk.size).toBe(2)
    })

    it('reports capacity', () => {
      const tk = new TopK2<number>(7)
      expect(tk.capacity).toBe(7)
    })
  })

  describe('reset', () => {
    it('clears all items', () => {
      const tk = new TopK2<string>(5)
      tk.add('a', 100)
      tk.reset()
      expect(tk.size).toBe(0)
      expect(tk.top()).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('handles empty tracker', () => {
      const tk = new TopK2<string>()
      expect(tk.top()).toEqual([])
    })

    it('handles single item', () => {
      const tk = new TopK2<number>(1)
      tk.add(42, 100)
      expect(tk.top()).toEqual([{ item: 42, count: 100 }])
    })
  })
})
