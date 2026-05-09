import { describe, expect, it } from 'vitest'
import { PersistentStack } from '../../src/core/persistent-stack/persistent-stack'

describe('PersistentStack', () => {
  describe('empty', () => {
    it('creates an empty stack', () => {
      const s = PersistentStack.empty<number>()
      expect(s.size()).toBe(0)
      expect(s.isEmpty()).toBe(true)
    })

    it('has version 0', () => {
      const s = PersistentStack.empty<string>()
      expect(s.version).toBe(0)
    })

    it('has no previous', () => {
      const s = PersistentStack.empty<boolean>()
      expect(s.previous()).toBeNull()
    })

    it('peek returns undefined', () => {
      const s = PersistentStack.empty<number>()
      expect(s.peek()).toBeUndefined()
    })

    it('bottom returns undefined', () => {
      const s = PersistentStack.empty<number>()
      expect(s.bottom()).toBeUndefined()
    })

    it('toArray returns empty array', () => {
      const s = PersistentStack.empty<number>()
      expect(s.toArray()).toEqual([])
    })

    it('toString shows empty stack', () => {
      const s = PersistentStack.empty<number>()
      expect(s.toString()).toBe('PersistentStack([])')
    })
  })

  describe('push', () => {
    it('pushes a value onto empty stack', () => {
      const s = PersistentStack.empty<number>().push(1)
      expect(s.peek()).toBe(1)
      expect(s.size()).toBe(1)
    })

    it('returns a new stack (immutability)', () => {
      const empty = PersistentStack.empty<number>()
      const s1 = empty.push(1)
      expect(empty.size()).toBe(0)
      expect(s1.size()).toBe(1)
    })

    it('pushes multiple values', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('increments version on each push', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.version).toBe(3)
    })

    it('sets previous correctly', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      expect(s2.previous()).toBe(s1)
      expect(s1.previous()).toBe(s0)
    })

    it('peek returns the last pushed value', () => {
      const s = PersistentStack.empty<string>().push('a').push('b')
      expect(s.peek()).toBe('b')
    })

    it('bottom returns the first pushed value', () => {
      const s = PersistentStack.empty<string>().push('a').push('b').push('c')
      expect(s.bottom()).toBe('a')
    })

    it('isEmpty is false after push', () => {
      const s = PersistentStack.empty<number>().push(42)
      expect(s.isEmpty()).toBe(false)
    })

    it('pushes objects by reference', () => {
      const obj = { x: 1 }
      const s = PersistentStack.empty<object>().push(obj)
      expect(s.peek()).toBe(obj)
    })

    it('preserves original stack when pushing to new one', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2)
      const s2 = s1.push(3)
      expect(s1.toArray()).toEqual([2, 1])
      expect(s2.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('pop', () => {
    it('pops from empty stack returns undefined', () => {
      const { stack, value } = PersistentStack.empty<number>().pop()
      expect(value).toBeUndefined()
      expect(stack.size()).toBe(0)
    })

    it('pops the top element', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const { stack, value } = s.pop()
      expect(value).toBe(3)
      expect(stack.peek()).toBe(2)
    })

    it('returns a new stack (immutability)', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const { stack: popped } = s.pop()
      expect(s.size()).toBe(2)
      expect(popped.size()).toBe(1)
    })

    it('decrements size', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const { stack } = s.pop()
      expect(stack.size()).toBe(1)
    })

    it('increments version on pop', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const { stack } = s.pop()
      expect(stack.version).toBe(s.version + 1)
    })

    it('can pop to empty', () => {
      const s = PersistentStack.empty<number>().push(1)
      const { stack, value } = s.pop()
      expect(value).toBe(1)
      expect(stack.isEmpty()).toBe(true)
    })

    it('sets previous on pop', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const { stack } = s.pop()
      expect(stack.previous()).toBe(s)
    })

    it('popping multiple times unwinds correctly', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const r1 = s.pop()
      const r2 = r1.stack.pop()
      const r3 = r2.stack.pop()
      expect(r1.value).toBe(3)
      expect(r2.value).toBe(2)
      expect(r3.value).toBe(1)
      expect(r3.stack.isEmpty()).toBe(true)
    })

    it('pop on already empty returns same stack', () => {
      const empty = PersistentStack.empty<number>()
      const { stack } = empty.pop()
      expect(stack).toBe(empty)
    })
  })

  describe('peek and bottom', () => {
    it('peek on empty is undefined', () => {
      expect(PersistentStack.empty<number>().peek()).toBeUndefined()
    })

    it('bottom on empty is undefined', () => {
      expect(PersistentStack.empty<number>().bottom()).toBeUndefined()
    })

    it('peek returns top of stack', () => {
      const s = PersistentStack.empty<number>().push(10).push(20).push(30)
      expect(s.peek()).toBe(30)
    })

    it('bottom returns bottom of stack', () => {
      const s = PersistentStack.empty<number>().push(10).push(20).push(30)
      expect(s.bottom()).toBe(10)
    })

    it('peek and bottom are same for single element', () => {
      const s = PersistentStack.empty<number>().push(42)
      expect(s.peek()).toBe(42)
      expect(s.bottom()).toBe(42)
    })
  })

  describe('size and isEmpty', () => {
    it('empty stack has size 0', () => {
      expect(PersistentStack.empty<string>().size()).toBe(0)
    })

    it('empty stack isEmpty returns true', () => {
      expect(PersistentStack.empty<string>().isEmpty()).toBe(true)
    })

    it('size increments with pushes', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
      expect(s.size()).toBe(5)
    })

    it('isEmpty returns false after push', () => {
      expect(PersistentStack.empty<number>().push(1).isEmpty()).toBe(false)
    })
  })

  describe('toArray', () => {
    it('empty stack returns []', () => {
      expect(PersistentStack.empty<number>().toArray()).toEqual([])
    })

    it('returns elements in LIFO order (top first)', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('does not modify the stack', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const arr = s.toArray()
      arr.push(99)
      expect(s.toArray()).toEqual([2, 1])
    })

    it('handles strings', () => {
      const s = PersistentStack.empty<string>().push('a').push('b')
      expect(s.toArray()).toEqual(['b', 'a'])
    })

    it('handles mixed types via generics', () => {
      const s = PersistentStack.empty<number | string>().push(1).push('two').push(3)
      expect(s.toArray()).toEqual([3, 'two', 1])
    })
  })

  describe('toString', () => {
    it('empty stack', () => {
      expect(PersistentStack.empty<number>().toString()).toBe('PersistentStack([])')
    })

    it('with elements', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.toString()).toBe('PersistentStack([3, 2, 1])')
    })

    it('with strings', () => {
      const s = PersistentStack.empty<string>().push('hello').push('world')
      expect(s.toString()).toBe('PersistentStack([world, hello])')
    })
  })

  describe('map', () => {
    it('maps over empty stack', () => {
      const s = PersistentStack.empty<number>().map((x) => x * 2)
      expect(s.toArray()).toEqual([])
    })

    it('maps over non-empty stack', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .map((x) => x * 2)
      expect(s.toArray()).toEqual([6, 4, 2])
    })

    it('preserves order', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .map((x) => String(x))
      expect(s.toArray()).toEqual(['3', '2', '1'])
    })

    it('changes type', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).map((x) => `num:${x}`)
      expect(s.toArray()).toEqual(['num:2', 'num:1'])
    })

    it('returns a PersistentStack<U>', () => {
      const mapped = PersistentStack.empty<number>().push(1).map((x) => x > 0)
      expect(mapped.peek()).toBe(true)
      expect(mapped.isEmpty()).toBe(false)
    })

    it('does not modify original', () => {
      const orig = PersistentStack.empty<number>().push(1).push(2)
      orig.map((x) => x * 10)
      expect(orig.toArray()).toEqual([2, 1])
    })
  })

  describe('filter', () => {
    it('filters empty stack', () => {
      const s = PersistentStack.empty<number>().filter((x) => x > 0)
      expect(s.toArray()).toEqual([])
    })

    it('filters elements', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
        .filter((x) => x % 2 === 0)
      expect(s.toArray()).toEqual([4, 2])
    })

    it('returns empty when nothing matches', () => {
      const s = PersistentStack.empty<number>().push(1).push(3).push(5).filter((x) => x % 2 === 0)
      expect(s.toArray()).toEqual([])
    })

    it('returns all when everything matches', () => {
      const s = PersistentStack.empty<number>().push(2).push(4).push(6).filter((x) => x % 2 === 0)
      expect(s.toArray()).toEqual([6, 4, 2])
    })

    it('preserves relative order of remaining elements', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .filter((x) => x > 2)
      expect(s.toArray()).toEqual([4, 3])
    })

    it('does not modify original', () => {
      const orig = PersistentStack.empty<number>().push(1).push(2).push(3)
      orig.filter((x) => x > 1)
      expect(orig.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('forEach', () => {
    it('does nothing on empty stack', () => {
      const items: number[] = []
      PersistentStack.empty<number>().forEach((v) => items.push(v))
      expect(items).toEqual([])
    })

    it('iterates top to bottom', () => {
      const items: number[] = []
      PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .forEach((v) => items.push(v))
      expect(items).toEqual([3, 2, 1])
    })

    it('visits all elements', () => {
      let count = 0
      PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .forEach(() => count++)
      expect(count).toBe(3)
    })
  })

  describe('reduce', () => {
    it('returns init on empty stack', () => {
      const result = PersistentStack.empty<number>().reduce((acc, v) => acc + v, 0)
      expect(result).toBe(0)
    })

    it('sums elements', () => {
      const result = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .reduce((acc, v) => acc + v, 0)
      expect(result).toBe(6)
    })

    it('can build a string', () => {
      const result = PersistentStack.empty<string>()
        .push('a')
        .push('b')
        .push('c')
        .reduce((acc, v) => acc + v, '')
      expect(result).toBe('cba')
    })

    it('works with object accumulator', () => {
      const result = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .reduce(
          (acc, v) => ({ sum: acc.sum + v, count: acc.count + 1 }),
          { sum: 0, count: 0 },
        )
      expect(result).toEqual({ sum: 6, count: 3 })
    })

    it('can produce different type', () => {
      const result = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .reduce((acc: string[], v) => [...acc, String(v)], [] as string[])
      expect(result).toEqual(['3', '2', '1'])
    })
  })

  describe('find', () => {
    it('returns undefined on empty stack', () => {
      expect(PersistentStack.empty<number>().find((x) => x > 0)).toBeUndefined()
    })

    it('finds the first matching element (top-first)', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.find((x) => x > 1)).toBe(3)
    })

    it('returns undefined when nothing matches', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.find((x) => x > 10)).toBeUndefined()
    })

    it('returns first element that matches from top', () => {
      const s = PersistentStack.empty<number>().push(10).push(20).push(30)
      expect(s.find((x) => x === 20)).toBe(20)
    })
  })

  describe('some', () => {
    it('returns false on empty stack', () => {
      expect(PersistentStack.empty<number>().some((x) => x > 0)).toBe(false)
    })

    it('returns true when at least one matches', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.some((x) => x === 2)).toBe(true)
    })

    it('returns false when none match', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.some((x) => x > 10)).toBe(false)
    })

    it('returns true if only one element matches', () => {
      const s = PersistentStack.empty<number>().push(5)
      expect(s.some((x) => x === 5)).toBe(true)
    })
  })

  describe('every', () => {
    it('returns true on empty stack', () => {
      expect(PersistentStack.empty<number>().every((x) => x > 0)).toBe(true)
    })

    it('returns true when all match', () => {
      const s = PersistentStack.empty<number>().push(2).push(4).push(6)
      expect(s.every((x) => x % 2 === 0)).toBe(true)
    })

    it('returns false when one does not match', () => {
      const s = PersistentStack.empty<number>().push(2).push(3).push(6)
      expect(s.every((x) => x % 2 === 0)).toBe(false)
    })

    it('returns true for single matching element', () => {
      const s = PersistentStack.empty<number>().push(5)
      expect(s.every((x) => x === 5)).toBe(true)
    })

    it('returns false for single non-matching element', () => {
      const s = PersistentStack.empty<number>().push(5)
      expect(s.every((x) => x > 10)).toBe(false)
    })
  })

  describe('includes', () => {
    it('returns false on empty stack', () => {
      expect(PersistentStack.empty<number>().includes(1)).toBe(false)
    })

    it('returns true when value exists', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.includes(2)).toBe(true)
    })

    it('returns false when value does not exist', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.includes(99)).toBe(false)
    })

    it('uses default strict equality', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      expect(s.includes(1)).toBe(true)
      expect(s.includes(3)).toBe(false)
    })

    it('uses custom comparator', () => {
      const s = PersistentStack.empty<{ id: number }>()
        .push({ id: 1 })
        .push({ id: 2 })
        .push({ id: 3 })
      expect(s.includes({ id: 2 }, (a, b) => a.id === b.id)).toBe(true)
    })

    it('custom comparator returns false for no match', () => {
      const s = PersistentStack.empty<{ id: number }>()
        .push({ id: 1 })
        .push({ id: 2 })
      expect(s.includes({ id: 99 }, (a, b) => a.id === b.id)).toBe(false)
    })

    it('finds first element', () => {
      const s = PersistentStack.empty<string>().push('a').push('b').push('c')
      expect(s.includes('a')).toBe(true)
    })

    it('finds last element', () => {
      const s = PersistentStack.empty<string>().push('a').push('b').push('c')
      expect(s.includes('c')).toBe(true)
    })
  })

  describe('equals', () => {
    it('empty stacks are equal', () => {
      const a = PersistentStack.empty<number>()
      const b = PersistentStack.empty<number>()
      expect(a.equals(b)).toBe(true)
    })

    it('same stack is equal to itself', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      expect(s.equals(s)).toBe(true)
    })

    it('stacks with same elements are equal', () => {
      const a = PersistentStack.empty<number>().push(1).push(2).push(3)
      const b = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(a.equals(b)).toBe(true)
    })

    it('stacks with different sizes are not equal', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(1)
      expect(a.equals(b)).toBe(false)
    })

    it('stacks with different elements are not equal', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(2).push(1)
      expect(a.equals(b)).toBe(false)
    })

    it('uses custom comparator', () => {
      const a = PersistentStack.empty<{ x: number }>().push({ x: 1 }).push({ x: 2 })
      const b = PersistentStack.empty<{ x: number }>().push({ x: 1 }).push({ x: 2 })
      expect(a.equals(b, (av, bv) => av.x === bv.x)).toBe(true)
    })

    it('custom comparator can return false', () => {
      const a = PersistentStack.empty<{ x: number }>().push({ x: 1 })
      const b = PersistentStack.empty<{ x: number }>().push({ x: 2 })
      expect(a.equals(b, (av, bv) => av.x === bv.x)).toBe(false)
    })

    it('empty and non-empty are not equal', () => {
      const a = PersistentStack.empty<number>()
      const b = PersistentStack.empty<number>().push(1)
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('reverse', () => {
    it('reverses empty stack', () => {
      const s = PersistentStack.empty<number>().reverse()
      expect(s.toArray()).toEqual([])
    })

    it('reverses single element', () => {
      const s = PersistentStack.empty<number>().push(1).reverse()
      expect(s.toArray()).toEqual([1])
    })

    it('reverses multiple elements', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3).reverse()
      expect(s.toArray()).toEqual([1, 2, 3])
    })

    it('does not modify original', () => {
      const orig = PersistentStack.empty<number>().push(1).push(2).push(3)
      orig.reverse()
      expect(orig.toArray()).toEqual([3, 2, 1])
    })

    it('double reverse equals original', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.reverse().reverse().toArray()).toEqual([3, 2, 1])
    })
  })

  describe('concat', () => {
    it('concatenates two empty stacks', () => {
      const a = PersistentStack.empty<number>()
      const b = PersistentStack.empty<number>()
      expect(a.concat(b).toArray()).toEqual([])
    })

    it('concatenates empty with non-empty', () => {
      const a = PersistentStack.empty<number>()
      const b = PersistentStack.empty<number>().push(1).push(2)
      expect(a.concat(b).toArray()).toEqual([2, 1])
    })

    it('concatenates non-empty with empty', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>()
      expect(a.concat(b).toArray()).toEqual([2, 1])
    })

    it('concatenates two non-empty stacks', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(3).push(4)
      const result = a.concat(b)
      expect(result.toArray()).toEqual([2, 1, 4, 3])
    })

    it('does not modify original stacks', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(3).push(4)
      a.concat(b)
      expect(a.toArray()).toEqual([2, 1])
      expect(b.toArray()).toEqual([4, 3])
    })

    it('returns same reference for empty+empty', () => {
      const a = PersistentStack.empty<number>()
      const b = PersistentStack.empty<number>()
      const result = a.concat(b)
      expect(result.toArray()).toEqual([])
    })
  })

  describe('slice', () => {
    it('slices empty stack', () => {
      const s = PersistentStack.empty<number>().slice()
      expect(s.toArray()).toEqual([])
    })

    it('slices with no args returns copy', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const sliced = s.slice()
      expect(sliced.toArray()).toEqual([3, 2, 1])
    })

    it('slices with start only', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3).push(4).push(5)
      const sliced = s.slice(2)
      expect(sliced.toArray()).toEqual([3, 2, 1])
    })

    it('slices with start and end', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3).push(4).push(5)
      const sliced = s.slice(1, 4)
      expect(sliced.toArray()).toEqual([4, 3, 2])
    })

    it('slices with negative start', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const sliced = s.slice(-2)
      expect(sliced.toArray()).toEqual([2, 1])
    })

    it('slices to empty when start >= length', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const sliced = s.slice(5)
      expect(sliced.toArray()).toEqual([])
    })

    it('does not modify original', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      s.slice(0, 1)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('slice(0, 0) returns empty', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.slice(0, 0).toArray()).toEqual([])
    })

    it('slice(0, 1) returns first element', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.slice(0, 1).toArray()).toEqual([3])
    })
  })

  describe('version and history', () => {
    it('empty stack has version 0', () => {
      expect(PersistentStack.empty<number>().version).toBe(0)
    })

    it('version increments with push', () => {
      const s = PersistentStack.empty<number>().push(1)
      expect(s.version).toBe(1)
    })

    it('version increments with pop', () => {
      const s = PersistentStack.empty<number>().push(1)
      const { stack } = s.pop()
      expect(stack.version).toBe(2)
    })

    it('version is readonly at compile time', () => {
      const s = PersistentStack.empty<number>()
      expect(s.version).toBe(0)
      const afterPush = s.push(1)
      expect(afterPush.version).toBe(1)
      expect(s.version).toBe(0)
    })

    it('previous returns null for empty', () => {
      expect(PersistentStack.empty<number>().previous()).toBeNull()
    })

    it('previous returns parent stack', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      expect(s1.previous()).toBe(s0)
    })

    it('can navigate back through history', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const s3 = s2.push(3)
      expect(s3.previous()).toBe(s2)
      expect(s3.previous()!.previous()).toBe(s1)
      expect(s3.previous()!.previous()!.previous()).toBe(s0)
    })

    it('atVersion returns current version', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      expect(s.atVersion(s.version)).toBe(s)
    })

    it('atVersion returns earlier version', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const s3 = s2.push(3)
      expect(s3.atVersion(1)).toBe(s1)
      expect(s3.atVersion(2)).toBe(s2)
    })

    it('atVersion returns empty for version 0', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const v0 = s.atVersion(0)
      expect(v0.isEmpty()).toBe(true)
      expect(v0.version).toBe(0)
    })

    it('atVersion returns empty for out of range', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const result = s.atVersion(100)
      expect(result.isEmpty()).toBe(true)
    })

    it('atVersion returns empty for negative version', () => {
      const s = PersistentStack.empty<number>().push(1)
      const result = s.atVersion(-1)
      expect(result.isEmpty()).toBe(true)
    })

    it('history returns all versions', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const s3 = s2.push(3)
      const hist = s3.history()
      expect(hist).toEqual([s0, s1, s2, s3])
    })

    it('history length equals version + 1', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3).push(4).push(5)
      expect(s.history()).toHaveLength(s.version + 1)
    })

    it('history of empty stack contains just itself', () => {
      const s = PersistentStack.empty<number>()
      const hist = s.history()
      expect(hist).toHaveLength(1)
      expect(hist[0]).toBe(s)
    })

    it('history is ordered from oldest to newest', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const hist = s2.history()
      expect(hist[0]!.version).toBe(0)
      expect(hist[1]!.version).toBe(1)
      expect(hist[2]!.version).toBe(2)
    })

    it('pop creates new version in history', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const { stack: s3 } = s2.pop()
      const hist = s3.history()
      expect(hist).toHaveLength(4)
      expect(hist[hist.length - 1]).toBe(s3)
    })
  })

  describe('persistence (immutability)', () => {
    it('push does not affect original', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2)
      const s2 = s1.push(3)
      expect(s1.toArray()).toEqual([2, 1])
      expect(s2.toArray()).toEqual([3, 2, 1])
    })

    it('pop does not affect original', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2).push(3)
      s1.pop()
      expect(s1.toArray()).toEqual([3, 2, 1])
    })

    it('map does not affect original', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2)
      s1.map((x) => x * 10)
      expect(s1.toArray()).toEqual([2, 1])
    })

    it('filter does not affect original', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2).push(3)
      s1.filter((x) => x > 1)
      expect(s1.toArray()).toEqual([3, 2, 1])
    })

    it('reverse does not affect original', () => {
      const s1 = PersistentStack.empty<number>().push(1).push(2).push(3)
      s1.reverse()
      expect(s1.toArray()).toEqual([3, 2, 1])
    })

    it('concat does not affect originals', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(3)
      a.concat(b)
      expect(a.toArray()).toEqual([2, 1])
      expect(b.toArray()).toEqual([3])
    })

    it('slice does not affect original', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      s.slice(0, 1)
      expect(s.toArray()).toEqual([3, 2, 1])
    })

    it('can create branching histories', () => {
      const base = PersistentStack.empty<number>().push(1).push(2)
      const branch1 = base.push(3)
      const branch2 = base.push(99)
      expect(branch1.toArray()).toEqual([3, 2, 1])
      expect(branch2.toArray()).toEqual([99, 2, 1])
      expect(base.toArray()).toEqual([2, 1])
    })

    it('can restore to any previous version', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1)
      const s2 = s1.push(2)
      const s3 = s2.push(3)
      const restored = s3.atVersion(1)
      expect(restored.toArray()).toEqual([1])
    })

    it('old versions remain unchanged after further operations', () => {
      const v1 = PersistentStack.empty<number>().push(1)
      const v2 = v1.push(2)
      const v3 = v2.push(3)
      expect(v1.toArray()).toEqual([1])
      expect(v2.toArray()).toEqual([2, 1])
      expect(v3.toArray()).toEqual([3, 2, 1])
    })
  })

  describe('edge cases', () => {
    it('handles null values', () => {
      const s = PersistentStack.empty<number | null>().push(null).push(1)
      expect(s.peek()).toBe(1)
      const { value } = s.pop()
      expect(value).toBe(1)
      expect(s.pop().stack.peek()).toBeNull()
    })

    it('handles undefined values', () => {
      const s = PersistentStack.empty<number | undefined>().push(undefined).push(1)
      expect(s.peek()).toBe(1)
    })

    it('handles zero', () => {
      const s = PersistentStack.empty<number>().push(0)
      expect(s.peek()).toBe(0)
      expect(s.isEmpty()).toBe(false)
    })

    it('handles empty strings', () => {
      const s = PersistentStack.empty<string>().push('')
      expect(s.peek()).toBe('')
      expect(s.size()).toBe(1)
    })

    it('handles false', () => {
      const s = PersistentStack.empty<boolean>().push(false)
      expect(s.peek()).toBe(false)
      expect(s.isEmpty()).toBe(false)
    })

    it('large number of pushes', () => {
      let s = PersistentStack.empty<number>()
      for (let i = 0; i < 1000; i++) {
        s = s.push(i)
      }
      expect(s.size()).toBe(1000)
      expect(s.peek()).toBe(999)
      expect(s.bottom()).toBe(0)
    })

    it('large number of interleaved push/pop', () => {
      let s = PersistentStack.empty<number>()
      for (let i = 0; i < 500; i++) {
        s = s.push(i)
      }
      for (let i = 0; i < 250; i++) {
        s = s.pop().stack
      }
      expect(s.size()).toBe(250)
      expect(s.peek()).toBe(249)
    })

    it('push and pop maintain version chain', () => {
      let s = PersistentStack.empty<number>()
      s = s.push(1)
      s = s.push(2)
      s = s.pop().stack
      s = s.push(3)
      expect(s.toArray()).toEqual([3, 1])
      expect(s.version).toBe(4)
      const hist = s.history()
      expect(hist).toHaveLength(5)
    })

    it('stress test: 1000 elements', () => {
      let s = PersistentStack.empty<number>()
      for (let i = 0; i < 1000; i++) {
        s = s.push(i)
      }
      expect(s.size()).toBe(1000)
      const arr = s.toArray()
      expect(arr[0]).toBe(999)
      expect(arr[999]).toBe(0)

      const { stack: popped } = s.pop()
      expect(popped.size()).toBe(999)
      expect(popped.peek()).toBe(998)

      const filtered = s.filter((x) => x < 5)
      expect(filtered.toArray()).toEqual([4, 3, 2, 1, 0])

      const mapped = s.filter((x) => x < 3).map((x) => x * 10)
      expect(mapped.toArray()).toEqual([20, 10, 0])
    })

    it('stress test: history with many versions', () => {
      let s = PersistentStack.empty<number>()
      for (let i = 0; i < 100; i++) {
        s = s.push(i)
      }
      expect(s.version).toBe(100)
      const hist = s.history()
      expect(hist).toHaveLength(101)
      expect(hist[0]!.version).toBe(0)
      expect(hist[100]!.version).toBe(100)
    })

    it('stress test: atVersion across many versions', () => {
      let s = PersistentStack.empty<number>()
      for (let i = 0; i < 100; i++) {
        s = s.push(i)
      }
      const v50 = s.atVersion(50)
      expect(v50.size()).toBe(50)
      expect(v50.peek()).toBe(49)
    })
  })

  describe('type safety', () => {
    it('works with number type', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      const v: number | undefined = s.peek()
      expect(v).toBe(2)
    })

    it('works with string type', () => {
      const s = PersistentStack.empty<string>().push('a').push('b')
      const v: string | undefined = s.peek()
      expect(v).toBe('b')
    })

    it('works with object type', () => {
      const s = PersistentStack.empty<{ name: string }>().push({ name: 'test' })
      const v = s.peek()
      expect(v!.name).toBe('test')
    })

    it('map changes type correctly', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const mapped: PersistentStack<string> = s.map((x) => String(x))
      expect(mapped.peek()).toBe('3')
    })
  })

  describe('method chaining and composition', () => {
    it('filter then map', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
        .filter((x) => x % 2 !== 0)
        .map((x) => x * 10)
      expect(s.toArray()).toEqual([50, 30, 10])
    })

    it('map then filter', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
        .map((x) => x * 2)
        .filter((x) => x > 4)
      expect(s.toArray()).toEqual([10, 8, 6])
    })

    it('concat then reverse', () => {
      const a = PersistentStack.empty<number>().push(1).push(2)
      const b = PersistentStack.empty<number>().push(3).push(4)
      const result = a.concat(b).reverse()
      expect(result.toArray()).toEqual([3, 4, 1, 2])
    })

    it('slice then map', () => {
      const s = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
        .slice(1, 4)
        .map((x) => x * 100)
      expect(s.toArray()).toEqual([400, 300, 200])
    })

    it('reduce on filtered result', () => {
      const sum = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .push(4)
        .push(5)
        .filter((x) => x % 2 === 0)
        .reduce((acc, v) => acc + v, 0)
      expect(sum).toBe(6)
    })

    it('complex chain with history', () => {
      const s0 = PersistentStack.empty<number>()
      const s1 = s0.push(1).push(2).push(3)
      const s2 = s1.filter((x) => x > 1)
      const hist = s2.history()
      expect(hist.length).toBeGreaterThan(1)
    })
  })

  describe('forEach iteration order', () => {
    it('iterates from top to bottom', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const order: number[] = []
      s.forEach((v) => order.push(v))
      expect(order).toEqual([3, 2, 1])
    })
  })

  describe('reduce edge cases', () => {
    it('reduce on single element', () => {
      const result = PersistentStack.empty<number>().push(5).reduce((acc, v) => acc + v, 0)
      expect(result).toBe(5)
    })

    it('reduce with non-zero initial', () => {
      const result = PersistentStack.empty<number>()
        .push(1)
        .push(2)
        .push(3)
        .reduce((acc, v) => acc + v, 100)
      expect(result).toBe(106)
    })
  })

  describe('includes with objects', () => {
    it('default comparator does not find deep equal objects', () => {
      const obj = { id: 1 }
      const s = PersistentStack.empty<{ id: number }>().push({ id: 1 })
      expect(s.includes(obj)).toBe(false)
    })

    it('default comparator finds same reference', () => {
      const obj = { id: 1 }
      const s = PersistentStack.empty<{ id: number }>().push(obj)
      expect(s.includes(obj)).toBe(true)
    })
  })

  describe('pop chain from multiple pushes', () => {
    it('can fully drain a stack', () => {
      let s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const values: number[] = []
      while (!s.isEmpty()) {
        const result = s.pop()
        values.push(result.value!)
        s = result.stack
      }
      expect(values).toEqual([3, 2, 1])
      expect(s.isEmpty()).toBe(true)
    })
  })

  describe('concat with different types', () => {
    it('concatenates string stacks', () => {
      const a = PersistentStack.empty<string>().push('a')
      const b = PersistentStack.empty<string>().push('b')
      expect(a.concat(b).toArray()).toEqual(['a', 'b'])
    })
  })

  describe('atVersion boundary conditions', () => {
    it('atVersion(0) always returns empty', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3).push(4).push(5)
      const v0 = s.atVersion(0)
      expect(v0.version).toBe(0)
      expect(v0.isEmpty()).toBe(true)
    })
  })

  describe('slice boundary conditions', () => {
    it('slice with end beyond length', () => {
      const s = PersistentStack.empty<number>().push(1).push(2).push(3)
      const sliced = s.slice(0, 100)
      expect(sliced.toArray()).toEqual([3, 2, 1])
    })

    it('slice with start beyond length returns empty', () => {
      const s = PersistentStack.empty<number>().push(1).push(2)
      expect(s.slice(100).toArray()).toEqual([])
    })
  })
})
