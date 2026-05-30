import { describe, it, expect } from 'vitest'
import { PersistentStack } from '../../../src/utils/persistent-stack.js'

describe('PersistentStack', () => {
  describe('empty', () => {
    it('creates empty stack', () => {
      const s = PersistentStack.empty<number>()
      expect(s.size).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('push and peek', () => {
    it('pushes and peeks', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.peek()).toBe(3)
      expect(s.size).toBe(3)
    })

    it('peeks undefined on empty', () => {
      expect(PersistentStack.empty().peek()).toBeUndefined()
    })
  })

  describe('pop', () => {
    it('pops elements', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const popped = s.pop()
      expect(popped.peek()).toBe(1)
      expect(popped.size).toBe(1)
    })

    it('preserves original', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const popped = s.pop()
      expect(s.peek()).toBe(2)
      expect(popped.peek()).toBe(1)
    })

    it('pop on empty returns empty', () => {
      const s = PersistentStack.empty<number>()
      expect(s.pop().isEmpty()).toBe(true)
    })
  })

  describe('toArray', () => {
    it('converts to array', () => {
      const s = PersistentStack.of(1, 2, 3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('empty stack returns empty array', () => {
      expect(PersistentStack.empty().toArray()).toEqual([])
    })
  })

  describe('reverse', () => {
    it('reverses the stack', () => {
      const s = PersistentStack.of(1, 2, 3)
      expect(s.reverse().toArray()).toEqual([1, 2, 3])
    })
  })

  describe('concat', () => {
    it('concatenates two stacks', () => {
      const s1 = PersistentStack.of(1, 2)
      const s2 = PersistentStack.of(3, 4)
      const result = s1.concat(s2)
      expect(result.toArray()).toEqual([2, 1, 4, 3])
    })
  })

  describe('of', () => {
    it('creates from variadic args', () => {
      const s = PersistentStack.of('a', 'b', 'c')
      expect(s.size).toBe(3)
      expect(s.peek()).toBe('c')
    })
  })

  describe('persistence', () => {
    it('all versions remain accessible', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const s3 = s2.push(3)
      expect(s0.size).toBe(0)
      expect(s1.peek()).toBe(1)
      expect(s2.peek()).toBe(2)
      expect(s3.peek()).toBe(3)
    })
  })
})
