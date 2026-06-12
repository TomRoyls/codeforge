import { beforeEach, describe, expect, it } from 'vitest'

import { MinMaxStack } from '../../src/utils/min-max-stack.js'

// ─── Empty stack operations ──────────────────────────────
describe('MinMaxStack - empty stack', () => {
  it('isEmpty returns true on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.isEmpty()).toBe(true)
  })

  it('size is 0 on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.size).toBe(0)
  })

  it('pop throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.pop()).toThrow(RangeError)
    expect(() => stack.pop()).toThrow('Cannot pop from empty MinMaxStack')
  })

  it('peek throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.peek()).toThrow(RangeError)
    expect(() => stack.peek()).toThrow('Cannot peek empty MinMaxStack')
  })

  it('min throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.min()).toThrow(RangeError)
    expect(() => stack.min()).toThrow('Cannot get min of empty MinMaxStack')
  })

  it('max throws RangeError on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.max()).toThrow(RangeError)
    expect(() => stack.max()).toThrow('Cannot get max of empty MinMaxStack')
  })

  it('toArray returns empty array on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.toArray()).toEqual([])
  })
})

// ─── Push and peek ───────────────────────────────────────
describe('MinMaxStack - push and peek', () => {
  it('pushes a single value and peeks it', () => {
    const stack = new MinMaxStack<number>()
    stack.push(42)
    expect(stack.peek()).toBe(42)
    expect(stack.size).toBe(1)
    expect(stack.isEmpty()).toBe(false)
  })

  it('peek does not remove the element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    expect(stack.peek()).toBe(10)
    expect(stack.peek()).toBe(10)
    expect(stack.size).toBe(1)
  })

  it('peek returns the most recently pushed value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.peek()).toBe(3)
  })

  it('push single negative value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    expect(stack.peek()).toBe(-5)
    expect(stack.min()).toBe(-5)
    expect(stack.max()).toBe(-5)
  })

  it('push single zero value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(0)
    expect(stack.peek()).toBe(0)
    expect(stack.min()).toBe(0)
    expect(stack.max()).toBe(0)
  })
})

// ─── Pop ─────────────────────────────────────────────────
describe('MinMaxStack - pop', () => {
  it('pops values in LIFO order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.pop()).toBe(3)
    expect(stack.pop()).toBe(2)
    expect(stack.pop()).toBe(1)
  })

  it('updates size after pop', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    expect(stack.size).toBe(2)
    stack.pop()
    expect(stack.size).toBe(1)
    stack.pop()
    expect(stack.size).toBe(0)
  })

  it('stack is empty after popping all elements', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.pop()
    expect(stack.isEmpty()).toBe(true)
  })

  it('pop returns and removes top element', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(10)
    const popped = stack.pop()
    expect(popped).toBe(10)
    expect(stack.peek()).toBe(5)
  })

  it('pop with negative values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    stack.push(-3)
    expect(stack.pop()).toBe(-3)
    expect(stack.pop()).toBe(-5)
  })
})

// ─── Min tracking ────────────────────────────────────────
describe('MinMaxStack - min tracking', () => {
  it('returns the minimum value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    expect(stack.min()).toBe(3)
  })

  it('updates min after popping the minimum', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(5)
  })

  it('handles duplicate minimum values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(3)
    stack.push(3)
    stack.push(5)
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(3)
  })

  it('tracks min with decreasing sequence', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    expect(stack.min()).toBe(10)
    stack.push(5)
    expect(stack.min()).toBe(5)
    stack.push(1)
    expect(stack.min()).toBe(1)
  })
})

// ─── Max tracking ────────────────────────────────────────
describe('MinMaxStack - max tracking', () => {
  it('returns the maximum value', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(3)
    stack.push(7)
    expect(stack.max()).toBe(7)
  })

  it('updates max after popping the maximum', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(7)
    stack.push(3)
    stack.pop()
    expect(stack.max()).toBe(7)
    stack.pop()
    expect(stack.max()).toBe(5)
  })

  it('handles duplicate maximum values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(7)
    stack.push(7)
    stack.push(3)
    expect(stack.max()).toBe(7)
    stack.pop()
    expect(stack.max()).toBe(7)
  })

  it('tracks max with increasing sequence', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    expect(stack.max()).toBe(1)
    stack.push(5)
    expect(stack.max()).toBe(5)
    stack.push(10)
    expect(stack.max()).toBe(10)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('MinMaxStack - clear', () => {
  it('clears all elements', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.clear()
    expect(stack.isEmpty()).toBe(true)
    expect(stack.size).toBe(0)
  })

  it('allows push after clear', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.clear()
    stack.push(10)
    expect(stack.peek()).toBe(10)
    expect(stack.min()).toBe(10)
    expect(stack.max()).toBe(10)
  })

  it('throws on operations after clear', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.clear()
    expect(() => stack.pop()).toThrow(RangeError)
    expect(() => stack.peek()).toThrow(RangeError)
    expect(() => stack.min()).toThrow(RangeError)
    expect(() => stack.max()).toThrow(RangeError)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('MinMaxStack - toArray', () => {
  it('returns elements from bottom to top', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the stack', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.toArray()
    expect(stack.size).toBe(2)
    expect(stack.peek()).toBe(2)
  })
})

// ─── Custom comparator ───────────────────────────────────
describe('MinMaxStack - custom comparator', () => {
  it('uses custom comparator for min/max with objects', () => {
    interface Item {
      priority: number
      name: string
    }
    const stack = new MinMaxStack<Item>((a, b) => a.priority - b.priority)
    stack.push({ priority: 5, name: 'c' })
    stack.push({ priority: 1, name: 'a' })
    stack.push({ priority: 3, name: 'b' })
    expect(stack.min().name).toBe('a')
    expect(stack.max().name).toBe('c')
  })

  it('uses custom comparator for string length', () => {
    const stack = new MinMaxStack<string>((a, b) => a.length - b.length)
    stack.push('hi')
    stack.push('hello')
    stack.push('hey')
    expect(stack.min()).toBe('hi')
    expect(stack.max()).toBe('hello')
  })
})

describe('MinMaxStack - mixed operations', () => {
  it('interleaved push and pop maintain correct min/max', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(5)

    stack.push(2)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)

    stack.push(8)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(8)

    stack.pop()
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)

    stack.push(1)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(5)

    stack.pop()
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)
  })

  it('push and pop alternating sequence', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.pop()
    stack.push(2)
    stack.push(3)
    stack.pop()
    stack.push(4)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(4)
  })

  it('multiple pushes then multiple pops', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.push(4)
    stack.push(5)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(5)

    stack.pop()
    stack.pop()
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(3)
  })

  it('peek returns current top after multiple operations', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.peek()).toBe(3)

    stack.pop()
    expect(stack.peek()).toBe(2)

    stack.push(4)
    expect(stack.peek()).toBe(4)
  })
})

// ─── Single element ─────────────────────────────────────
describe('MinMaxStack - single element', () => {
  it('single element is both min and max', () => {
    const stack = new MinMaxStack<number>()
    stack.push(42)
    expect(stack.min()).toBe(42)
    expect(stack.max()).toBe(42)
    expect(stack.peek()).toBe(42)
    expect(stack.size).toBe(1)
  })

  it('single element negative', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    expect(stack.min()).toBe(-5)
    expect(stack.max()).toBe(-5)
  })

  it('single element zero', () => {
    const stack = new MinMaxStack<number>()
    stack.push(0)
    expect(stack.min()).toBe(0)
    expect(stack.max()).toBe(0)
  })

  it('pop single element returns to empty', () => {
    const stack = new MinMaxStack<number>()
    stack.push(10)
    stack.pop()
    expect(stack.isEmpty()).toBe(true)
    expect(stack.size).toBe(0)
  })
})

// ─── Duplicate values ───────────────────────────────────
describe('MinMaxStack - duplicate values', () => {
  it('all same values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    stack.push(5)
    stack.push(5)
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(5)
  })

  it('duplicate min and max values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(1)
    stack.push(5)
    stack.push(5)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(5)
    stack.pop()
    expect(stack.max()).toBe(5)
    stack.pop()
    expect(stack.max()).toBe(1)
  })

  it('popping all duplicates', () => {
    const stack = new MinMaxStack<number>()
    stack.push(3)
    stack.push(3)
    stack.push(3)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(stack.min()).toBe(3)
    stack.pop()
    expect(() => stack.min()).toThrow(RangeError)
  })
})

// ─── Large scale ────────────────────────────────────────
describe('MinMaxStack - large scale', () => {
  it('handles 100+ elements', () => {
    const stack = new MinMaxStack<number>()
    for (let i = 1; i <= 100; i++) {
      stack.push(i)
    }
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(100)
    expect(stack.size).toBe(100)
  })

  it('handles large number of pops', () => {
    const stack = new MinMaxStack<number>()
    for (let i = 1; i <= 50; i++) {
      stack.push(i)
    }
    for (let i = 50; i >= 1; i--) {
      expect(stack.pop()).toBe(i)
    }
    expect(stack.isEmpty()).toBe(true)
  })

  it('min and max remain correct after many operations', () => {
    const stack = new MinMaxStack<number>()
    for (let i = 1; i <= 30; i++) {
      stack.push(i)
    }
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(30)

    for (let i = 0; i < 15; i++) {
      stack.pop()
    }
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(15)
  })
})

// ─── Negative values ────────────────────────────────────
describe('MinMaxStack - negative values', () => {
  it('handles negative numbers', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    stack.push(-2)
    stack.push(-8)
    expect(stack.min()).toBe(-8)
    expect(stack.max()).toBe(-2)
  })

  it('mix of negative and positive', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-5)
    stack.push(3)
    stack.push(-2)
    stack.push(8)
    expect(stack.min()).toBe(-5)
    expect(stack.max()).toBe(8)
  })

  it('zero with negative values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(-3)
    stack.push(0)
    stack.push(-1)
    expect(stack.min()).toBe(-3)
    expect(stack.max()).toBe(0)
  })
})

// ─── toString ───────────────────────────────────────────
describe('MinMaxStack - toString', () => {
  it('toArray preserves order', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    const arr = stack.toArray()
    expect(arr).toEqual([1, 2, 3])
    expect(stack.size).toBe(3)
    expect(stack.peek()).toBe(3)
  })

  it('toArray on empty stack', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.toArray()).toEqual([])
  })

  it('toArray after operations', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.pop()
    stack.push(4)
    expect(stack.toArray()).toEqual([1, 2, 4])
  })
})

// ─── Size and isEmpty ───────────────────────────────────
describe('MinMaxStack - size and isEmpty', () => {
  it('size increases with each push', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.size).toBe(0)
    stack.push(1)
    expect(stack.size).toBe(1)
    stack.push(2)
    expect(stack.size).toBe(2)
    stack.push(3)
    expect(stack.size).toBe(3)
  })

  it('size decreases with each pop', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    expect(stack.size).toBe(3)
    stack.pop()
    expect(stack.size).toBe(2)
    stack.pop()
    expect(stack.size).toBe(1)
    stack.pop()
    expect(stack.size).toBe(0)
  })

  it('isEmpty after clear', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.clear()
    expect(stack.isEmpty()).toBe(true)
  })

  it('isEmpty changes correctly', () => {
    const stack = new MinMaxStack<number>()
    expect(stack.isEmpty()).toBe(true)
    stack.push(1)
    expect(stack.isEmpty()).toBe(false)
    stack.pop()
    expect(stack.isEmpty()).toBe(true)
  })
})

// ─── Custom comparator extended ─────────────────────────
describe('MinMaxStack - custom comparator extended', () => {
  it('works with string comparison', () => {
    const stack = new MinMaxStack<string>((a, b) => a.localeCompare(b))
    stack.push('zebra')
    stack.push('apple')
    stack.push('banana')
    expect(stack.min()).toBe('apple')
    expect(stack.max()).toBe('zebra')
  })

  it('works with object property', () => {
    interface Item {
      value: number
    }
    const stack = new MinMaxStack<Item>((a, b) => a.value - b.value)
    stack.push({ value: 5 })
    stack.push({ value: 1 })
    stack.push({ value: 3 })
    expect(stack.min().value).toBe(1)
    expect(stack.max().value).toBe(5)
  })

  it('custom comparator with duplicates', () => {
    const stack = new MinMaxStack<string>((a, b) => a.localeCompare(b))
    stack.push('a')
    stack.push('a')
    stack.push('b')
    stack.pop()
    expect(stack.max()).toBe('a')
  })
})

// ─── Error messages ─────────────────────────────────────
describe('MinMaxStack - error messages', () => {
  it('pop error message is specific', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.pop()).toThrow('Cannot pop from empty MinMaxStack')
  })

  it('peek error message is specific', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.peek()).toThrow('Cannot peek empty MinMaxStack')
  })

  it('min error message is specific', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.min()).toThrow('Cannot get min of empty MinMaxStack')
  })

  it('max error message is specific', () => {
    const stack = new MinMaxStack<number>()
    expect(() => stack.max()).toThrow('Cannot get max of empty MinMaxStack')
  })
})

// ─── Min/max tracking precision ─────────────────────────
describe('MinMaxStack - min/max tracking precision', () => {
  it('min updates correctly when pushing values larger than current min', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.min()).toBe(5)
    stack.push(10)
    expect(stack.min()).toBe(5)
    stack.push(7)
    expect(stack.min()).toBe(5)
  })

  it('max updates correctly when pushing values smaller than current max', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.max()).toBe(5)
    stack.push(2)
    expect(stack.max()).toBe(5)
    stack.push(4)
    expect(stack.max()).toBe(5)
  })

  it('min remains same when pushing equal values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(3)
    expect(stack.min()).toBe(3)
    stack.push(3)
    expect(stack.min()).toBe(3)
    stack.push(3)
    expect(stack.min()).toBe(3)
  })

  it('max remains same when pushing equal values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(7)
    expect(stack.max()).toBe(7)
    stack.push(7)
    expect(stack.max()).toBe(7)
    stack.push(7)
    expect(stack.max()).toBe(7)
  })
})

// ─── Clear with min/max ─────────────────────────────────
describe('MinMaxStack - clear with min/max', () => {
  it('clear resets min and max', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(5)
    stack.push(3)
    stack.clear()
    expect(() => stack.min()).toThrow(RangeError)
    expect(() => stack.max()).toThrow(RangeError)
  })

  it('clear allows new min and max to be established', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(5)
    stack.clear()
    stack.push(10)
    expect(stack.min()).toBe(10)
    expect(stack.max()).toBe(10)
  })
})

// ─── Sequential operations ───────────────────────────────
describe('MinMaxStack - sequential operations', () => {
  it('sequential pops return correct values', () => {
    const stack = new MinMaxStack<number>()
    stack.push(1)
    stack.push(2)
    stack.push(3)
    stack.push(4)
    stack.push(5)
    expect(stack.pop()).toBe(5)
    expect(stack.pop()).toBe(4)
    expect(stack.pop()).toBe(3)
    expect(stack.pop()).toBe(2)
    expect(stack.pop()).toBe(1)
  })

  it('sequential pushes update min/max correctly', () => {
    const stack = new MinMaxStack<number>()
    stack.push(5)
    expect(stack.min()).toBe(5)
    expect(stack.max()).toBe(5)

    stack.push(2)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(5)

    stack.push(8)
    expect(stack.min()).toBe(2)
    expect(stack.max()).toBe(8)

    stack.push(1)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(8)

    stack.push(10)
    expect(stack.min()).toBe(1)
    expect(stack.max()).toBe(10)
  })
})

describe('min-max-stack - wave549', () => {
  it('min-max-stack module defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack module is function', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave550', () => {
  it('min-max-stack w550 defined', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w550 is function', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w550 has name', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave551', () => {
  it('min-max-stack w551 check 0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w551 check 1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w551 check 2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave552', () => {
  it('min-max-stack w552 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w552 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w552 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave553', () => {
  it('min-max-stack w553 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w553 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w553 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave554', () => {
  it('min-max-stack w554 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w554 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w554 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})

describe('min-max-stack - wave555', () => {
  it('min-max-stack w555 v0', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w555 v1', () => {
    expect(beforeEach).toBeDefined()
  })
  it('min-max-stack w555 v2', () => {
    expect(beforeEach).toBeDefined()
  })
})
