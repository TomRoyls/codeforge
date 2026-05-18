import { describe, it, expect } from 'vitest'
import { PersistentStack2 } from '../../src/core/persistent-stack-2/index.js'

// ─── from ───

describe('PersistentStack2.from', () => {
  it('creates an empty stack from empty array', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.size).toBe(0)
    expect(stack.isEmpty).toBe(true)
  })

  it('creates a stack from array of items', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.size).toBe(3)
    expect(stack.peek()).toBe(3)
  })

  it('creates a stack preserving order via toArray', () => {
    const stack = PersistentStack2.from([10, 20, 30])
    expect(stack.toArray()).toEqual([30, 20, 10])
  })
})

// ─── push ───

describe('PersistentStack2.push', () => {
  it('pushes onto empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    const pushed = stack.push(5)
    expect(pushed.size).toBe(1)
    expect(pushed.peek()).toBe(5)
  })

  it('pushes multiple items', () => {
    const s0 = PersistentStack2.from<number>([])
    const s1 = s0.push(1)
    const s2 = s1.push(2)
    const s3 = s2.push(3)
    expect(s3.size).toBe(3)
    expect(s3.peek()).toBe(3)
  })

  it('preserves previous version (persistence)', () => {
    const s1 = PersistentStack2.from([1])
    const s2 = s1.push(2)
    expect(s1.peek()).toBe(1)
    expect(s1.size).toBe(1)
    expect(s2.peek()).toBe(2)
    expect(s2.size).toBe(2)
  })
})

// ─── pop ───

describe('PersistentStack2.pop', () => {
  it('pops from empty stack returns empty', () => {
    const stack = PersistentStack2.from<number>([])
    const popped = stack.pop()
    expect(popped.size).toBe(0)
    expect(popped.isEmpty).toBe(true)
  })

  it('pops the top element', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    const popped = stack.pop()
    expect(popped.size).toBe(2)
    expect(popped.peek()).toBe(2)
  })

  it('pops from single element stack', () => {
    const stack = PersistentStack2.from([42])
    const popped = stack.pop()
    expect(popped.size).toBe(0)
    expect(popped.isEmpty).toBe(true)
    expect(popped.peek()).toBeUndefined()
  })

  it('preserves previous version (persistence)', () => {
    const s1 = PersistentStack2.from([1, 2])
    const s2 = s1.pop()
    expect(s1.size).toBe(2)
    expect(s1.peek()).toBe(2)
    expect(s2.size).toBe(1)
    expect(s2.peek()).toBe(1)
  })
})

// ─── peek ───

describe('PersistentStack2.peek', () => {
  it('returns undefined for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.peek()).toBeUndefined()
  })

  it('returns the top element', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.peek()).toBe(3)
  })
})

// ─── size / isEmpty ───

describe('PersistentStack2 size and isEmpty', () => {
  it('empty stack has size 0 and isEmpty true', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.size).toBe(0)
    expect(stack.isEmpty).toBe(true)
  })

  it('non-empty stack has correct size and isEmpty false', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.size).toBe(3)
    expect(stack.isEmpty).toBe(false)
  })
})

// ─── toArray ───

describe('PersistentStack2.toArray', () => {
  it('returns empty array for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.toArray()).toEqual([])
  })

  it('returns elements top-to-bottom', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.toArray()).toEqual([3, 2, 1])
  })
})

// ─── forEach ───

describe('PersistentStack2.forEach', () => {
  it('does nothing on empty stack', () => {
    const items: number[] = []
    PersistentStack2.from<number>([]).forEach((v) => items.push(v))
    expect(items).toEqual([])
  })

  it('iterates top-to-bottom with correct indices', () => {
    const items: Array<{ value: number; index: number }> = []
    PersistentStack2.from([10, 20, 30]).forEach((value, index) => {
      items.push({ value, index })
    })
    expect(items).toEqual([
      { value: 30, index: 0 },
      { value: 20, index: 1 },
      { value: 10, index: 2 },
    ])
  })
})

// ─── map ───

describe('PersistentStack2.map', () => {
  it('maps empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    const mapped = stack.map((v) => v * 2)
    expect(mapped.size).toBe(0)
  })

  it('maps values preserving structure', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    const mapped = stack.map((v) => v * 10)
    expect(mapped.toArray()).toEqual([30, 20, 10])
  })
})

// ─── filter ───

describe('PersistentStack2.filter', () => {
  it('filters empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    const filtered = stack.filter((v) => v > 0)
    expect(filtered.size).toBe(0)
  })

  it('filters elements', () => {
    const stack = PersistentStack2.from([1, 2, 3, 4, 5])
    const filtered = stack.filter((v) => v % 2 === 0)
    expect(filtered.toArray()).toEqual([4, 2])
  })

  it('returns empty if all filtered out', () => {
    const stack = PersistentStack2.from([1, 3, 5])
    const filtered = stack.filter((v) => v % 2 === 0)
    expect(filtered.size).toBe(0)
  })
})

// ─── reverse ───

describe('PersistentStack2.reverse', () => {
  it('reverses empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    const reversed = stack.reverse()
    expect(reversed.size).toBe(0)
  })

  it('reverses the stack', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    const reversed = stack.reverse()
    expect(reversed.toArray()).toEqual([1, 2, 3])
  })
})

// ─── concat ───

describe('PersistentStack2.concat', () => {
  it('concats two empty stacks', () => {
    const s1 = PersistentStack2.from<number>([])
    const s2 = PersistentStack2.from<number>([])
    const result = s1.concat(s2)
    expect(result.size).toBe(0)
  })

  it('concats non-empty stacks', () => {
    const s1 = PersistentStack2.from([1, 2])
    const s2 = PersistentStack2.from([3, 4])
    const result = s1.concat(s2)
    expect(result.toArray()).toEqual([2, 1, 4, 3])
  })

  it('concats empty with non-empty', () => {
    const s1 = PersistentStack2.from<number>([])
    const s2 = PersistentStack2.from([1, 2])
    const result = s1.concat(s2)
    expect(result.toArray()).toEqual([2, 1])
  })
})

// ─── every ───

describe('PersistentStack2.every', () => {
  it('returns true for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.every((v) => v > 0)).toBe(true)
  })

  it('returns true when all match', () => {
    const stack = PersistentStack2.from([2, 4, 6])
    expect(stack.every((v) => v % 2 === 0)).toBe(true)
  })

  it('returns false when some do not match', () => {
    const stack = PersistentStack2.from([2, 3, 4])
    expect(stack.every((v) => v % 2 === 0)).toBe(false)
  })
})

// ─── some ───

describe('PersistentStack2.some', () => {
  it('returns false for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.some((v) => v > 0)).toBe(false)
  })

  it('returns true when at least one matches', () => {
    const stack = PersistentStack2.from([1, 3, 5])
    expect(stack.some((v) => v === 3)).toBe(true)
  })

  it('returns false when none match', () => {
    const stack = PersistentStack2.from([2, 4, 6])
    expect(stack.some((v) => v % 2 !== 0)).toBe(false)
  })
})

// ─── find ───

describe('PersistentStack2.find', () => {
  it('returns undefined for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.find((v) => v > 0)).toBeUndefined()
  })

  it('returns the first matching element (top-to-bottom)', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.find((v) => v > 1)).toBe(3)
  })

  it('returns undefined when not found', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.find((v) => v > 10)).toBeUndefined()
  })
})

// ─── includes ───

describe('PersistentStack2.includes', () => {
  it('returns false for empty stack', () => {
    const stack = PersistentStack2.from<number>([])
    expect(stack.includes(1)).toBe(false)
  })

  it('returns true when value exists', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.includes(2)).toBe(true)
  })

  it('returns false when value does not exist', () => {
    const stack = PersistentStack2.from([1, 2, 3])
    expect(stack.includes(99)).toBe(false)
  })
})
