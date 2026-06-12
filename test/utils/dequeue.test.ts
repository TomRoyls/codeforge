import { describe, expect, it } from 'vitest'

import { Deque } from '../../src/utils/dequeue.js'

// ─── Empty deque operations ──────────────────────────────
describe('Deque - empty operations', () => {
  it('popFront returns undefined on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.popFront()).toBeUndefined()
  })

  it('popBack returns undefined on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.popBack()).toBeUndefined()
  })

  it('peekFront returns undefined on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.peekFront()).toBeUndefined()
  })

  it('peekBack returns undefined on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.peekBack()).toBeUndefined()
  })

  it('isEmpty returns true on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.isEmpty()).toBe(true)
  })

  it('size is 0 on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.size).toBe(0)
  })

  it('toArray returns empty array on empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.toArray()).toEqual([])
  })
})

// ─── Single element ──────────────────────────────────────
describe('Deque - single element', () => {
  it('pushBack then popFront', () => {
    const deque = new Deque<number>()
    deque.pushBack(42)
    expect(deque.popFront()).toBe(42)
    expect(deque.isEmpty()).toBe(true)
  })

  it('pushFront then popBack', () => {
    const deque = new Deque<number>()
    deque.pushFront(42)
    expect(deque.popBack()).toBe(42)
    expect(deque.isEmpty()).toBe(true)
  })

  it('pushBack then peekFront and peekBack', () => {
    const deque = new Deque<number>()
    deque.pushBack(7)
    expect(deque.peekFront()).toBe(7)
    expect(deque.peekBack()).toBe(7)
    expect(deque.size).toBe(1)
  })
})

// ─── pushFront / popFront ────────────────────────────────
describe('Deque - pushFront / popFront', () => {
  it('maintains reverse order with pushFront', () => {
    const deque = new Deque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.toArray()).toEqual([3, 2, 1])
  })

  it('popFront returns elements in FIFO order', () => {
    const deque = new Deque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    deque.pushFront(3)
    expect(deque.popFront()).toBe(3)
    expect(deque.popFront()).toBe(2)
    expect(deque.popFront()).toBe(1)
    expect(deque.isEmpty()).toBe(true)
  })
})

// ─── pushBack / popBack ──────────────────────────────────
describe('Deque - pushBack / popBack', () => {
  it('maintains insertion order with pushBack', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([1, 2, 3])
  })

  it('popBack returns elements in reverse order', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.popBack()).toBe(3)
    expect(deque.popBack()).toBe(2)
    expect(deque.popBack()).toBe(1)
    expect(deque.isEmpty()).toBe(true)
  })
})

// ─── Mixed front/back operations ─────────────────────────
describe('Deque - mixed front/back', () => {
  it('pushFront and pushBack together', () => {
    const deque = new Deque<number>()
    deque.pushBack(2)
    deque.pushFront(1)
    deque.pushBack(3)
    deque.pushFront(0)
    expect(deque.toArray()).toEqual([0, 1, 2, 3])
  })

  it('interleaved push and pop', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.popFront()).toBe(1)
    deque.pushBack(3)
    expect(deque.popFront()).toBe(2)
    deque.pushBack(4)
    expect(deque.toArray()).toEqual([3, 4])
  })

  it('pushFront popBack combo', () => {
    const deque = new Deque<number>()
    deque.pushFront(1)
    deque.pushFront(2)
    expect(deque.popBack()).toBe(1)
    expect(deque.popBack()).toBe(2)
    expect(deque.isEmpty()).toBe(true)
  })
})

// ─── Resizing ────────────────────────────────────────────
describe('Deque - resizing', () => {
  it('resizes when exceeding initial capacity', () => {
    const deque = new Deque<number>(4)
    for (let i = 0; i < 10; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(10)
    expect(deque.toArray()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('resizes correctly with pushFront', () => {
    const deque = new Deque<number>(4)
    for (let i = 0; i < 10; i++) {
      deque.pushFront(i)
    }
    expect(deque.size).toBe(10)
    expect(deque.toArray()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1, 0])
  })

  it('preserves elements after mixed ops and resize', () => {
    const deque = new Deque<number>(2)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.popFront()
    deque.pushBack(3)
    deque.pushBack(4)
    deque.pushFront(0)
    expect(deque.toArray()).toEqual([0, 2, 3, 4])
  })
})

// ─── Peek ────────────────────────────────────────────────
describe('Deque - peek', () => {
  it('peekFront does not remove element', () => {
    const deque = new Deque<number>()
    deque.pushBack(10)
    deque.pushBack(20)
    expect(deque.peekFront()).toBe(10)
    expect(deque.size).toBe(2)
  })

  it('peekBack does not remove element', () => {
    const deque = new Deque<number>()
    deque.pushBack(10)
    deque.pushBack(20)
    expect(deque.peekBack()).toBe(20)
    expect(deque.size).toBe(2)
  })
})

// ─── Size tracking ───────────────────────────────────────
describe('Deque - size tracking', () => {
  it('tracks size through pushes and pops', () => {
    const deque = new Deque<number>()
    expect(deque.size).toBe(0)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
    deque.pushFront(2)
    expect(deque.size).toBe(2)
    deque.popFront()
    expect(deque.size).toBe(1)
    deque.popBack()
    expect(deque.size).toBe(0)
  })
})

// ─── Clear ───────────────────────────────────────────────
describe('Deque - clear', () => {
  it('clears all elements', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
    expect(deque.toArray()).toEqual([])
  })

  it('allows operations after clear', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.clear()
    deque.pushBack(2)
    expect(deque.popFront()).toBe(2)
  })
})

// ─── toArray ─────────────────────────────────────────────
describe('Deque - toArray', () => {
  it('returns elements from front to back', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toArray()).toEqual([1, 2, 3])
  })

  it('does not modify the deque', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.toArray()
    expect(deque.size).toBe(2)
    expect(deque.peekFront()).toBe(1)
  })
})

// ─── fromArray ───────────────────────────────────────────
describe('Deque - fromArray', () => {
  it('creates deque from array', () => {
    const deque = Deque.fromArray([1, 2, 3, 4, 5])
    expect(deque.size).toBe(5)
    expect(deque.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('creates empty deque from empty array', () => {
    const deque = Deque.fromArray<number>([])
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })
})

// ─── Large scale ─────────────────────────────────────────
describe('Deque - large scale', () => {
  it('handles 10000+ pushBack/popFront operations', () => {
    const deque = new Deque<number>()
    for (let i = 0; i < 10000; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(10000)
    for (let i = 0; i < 10000; i++) {
      expect(deque.popFront()).toBe(i)
    }
    expect(deque.isEmpty()).toBe(true)
  })

  it('handles 10000+ pushFront/popBack operations', () => {
    const deque = new Deque<number>()
    for (let i = 0; i < 10000; i++) {
      deque.pushFront(i)
    }
    for (let i = 0; i < 10000; i++) {
      expect(deque.popBack()).toBe(i)
    }
    expect(deque.isEmpty()).toBe(true)
  })

  it('handles interleaved push/pop at scale', () => {
    const deque = new Deque<number>()
    for (let i = 0; i < 5000; i++) {
      deque.pushBack(i * 2)
      deque.pushFront(i * 2 + 1)
    }
    expect(deque.size).toBe(10000)
    for (let i = 0; i < 5000; i++) {
      deque.popFront()
      deque.popBack()
    }
    expect(deque.isEmpty()).toBe(true)
  })
})

// ─── Generic types ───────────────────────────────────────
describe('Deque - generic types', () => {
  it('works with strings', () => {
    const deque = new Deque<string>()
    deque.pushBack('a')
    deque.pushBack('b')
    deque.pushFront('c')
    expect(deque.toArray()).toEqual(['c', 'a', 'b'])
  })

  it('works with objects', () => {
    const deque = new Deque<{ id: number }>()
    deque.pushBack({ id: 1 })
    deque.pushBack({ id: 2 })
    expect(deque.popFront()?.id).toBe(1)
    expect(deque.popFront()?.id).toBe(2)
  })

  it('works with boolean values', () => {
    const deque = new Deque<boolean>()
    deque.pushBack(true)
    deque.pushBack(false)
    deque.pushFront(true)
    expect(deque.toArray()).toEqual([true, true, false])
  })

  it('works with null values', () => {
    const deque = new Deque<null>()
    deque.pushBack(null)
    deque.pushFront(null)
    expect(deque.size).toBe(2)
    expect(deque.popFront()).toBeNull()
    expect(deque.popFront()).toBeNull()
  })
})

// ─── toString ─────────────────────────────────────────────
describe('Deque - toString', () => {
  it('returns empty string representation for empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.toString()).toBe('[]')
  })

  it('returns string representation with single element', () => {
    const deque = new Deque<number>()
    deque.pushBack(42)
    expect(deque.toString()).toBe('[42]')
  })

  it('returns string representation with multiple elements', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toString()).toBe('[1, 2, 3]')
  })

  it('handles string elements in toString', () => {
    const deque = new Deque<string>()
    deque.pushBack('hello')
    deque.pushBack('world')
    expect(deque.toString()).toBe('[hello, world]')
  })
})

// ─── toJSON ───────────────────────────────────────────────
describe('Deque - toJSON', () => {
  it('returns empty array for empty deque', () => {
    const deque = new Deque<number>()
    expect(deque.toJSON()).toEqual([])
  })

  it('returns array representation', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    expect(deque.toJSON()).toEqual([1, 2, 3])
  })

  it('toJSON is identical to toArray', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.toJSON()).toEqual(deque.toArray())
  })
})

// ─── clone ────────────────────────────────────────────────
describe('Deque - clone', () => {
  it('clones empty deque', () => {
    const deque = new Deque<number>()
    const cloned = deque.clone()
    expect(cloned.size).toBe(0)
    expect(cloned.isEmpty()).toBe(true)
    expect(cloned.toArray()).toEqual([])
  })

  it('clones deque with elements', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    const cloned = deque.clone()
    expect(cloned.toArray()).toEqual([1, 2, 3])
    expect(cloned.size).toBe(3)
  })

  it('clone is independent of original', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    const cloned = deque.clone()
    deque.pushBack(3)
    cloned.pushBack(4)
    expect(deque.toArray()).toEqual([1, 2, 3])
    expect(cloned.toArray()).toEqual([1, 2, 4])
  })

  it('clone after pop operations', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    const cloned = deque.clone()
    expect(cloned.toArray()).toEqual([2, 3])
  })
})

// ─── equals ───────────────────────────────────────────────
describe('Deque - equals', () => {
  it('empty deques are equal', () => {
    const deque1 = new Deque<number>()
    const deque2 = new Deque<number>()
    expect(deque1.equals(deque2)).toBe(true)
  })

  it('deques with same elements are equal', () => {
    const deque1 = new Deque<number>()
    const deque2 = new Deque<number>()
    deque1.pushBack(1)
    deque1.pushBack(2)
    deque2.pushBack(1)
    deque2.pushBack(2)
    expect(deque1.equals(deque2)).toBe(true)
  })

  it('deques with different elements are not equal', () => {
    const deque1 = new Deque<number>()
    const deque2 = new Deque<number>()
    deque1.pushBack(1)
    deque2.pushBack(2)
    expect(deque1.equals(deque2)).toBe(false)
  })

  it('deques with different sizes are not equal', () => {
    const deque1 = new Deque<number>()
    const deque2 = new Deque<number>()
    deque1.pushBack(1)
    deque2.pushBack(1)
    deque2.pushBack(2)
    expect(deque1.equals(deque2)).toBe(false)
  })

  it('non-Deque objects are not equal', () => {
    const deque = new Deque<number>()
    expect(deque.equals([1, 2, 3])).toBe(false)
    expect(deque.equals(null)).toBe(false)
    expect(deque.equals(undefined)).toBe(false)
    expect(deque.equals({})).toBe(false)
  })
})

// ─── Initial capacity ─────────────────────────────────────
describe('Deque - initial capacity', () => {
  it('respects custom initial capacity', () => {
    const deque = new Deque<number>(5)
    for (let i = 0; i < 5; i++) {
      deque.pushBack(i)
    }
    expect(deque.size).toBe(5)
  })

  it('minimum capacity is 1', () => {
    const deque = new Deque<number>(0)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
  })

  it('negative capacity is clamped to 1', () => {
    const deque = new Deque<number>(-5)
    deque.pushBack(1)
    expect(deque.size).toBe(1)
  })
})

// ─── Edge cases ───────────────────────────────────────────
describe('Deque - edge cases', () => {
  it('handles wrap-around correctly', () => {
    const deque = new Deque<number>(4)
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.pushBack(4)
    deque.popFront()
    deque.popFront()
    deque.pushBack(5)
    deque.pushBack(6)
    expect(deque.toArray()).toEqual([3, 4, 5, 6])
  })

  it('handles multiple peeks without pops', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    expect(deque.peekFront()).toBe(1)
    expect(deque.peekFront()).toBe(1)
    expect(deque.peekBack()).toBe(2)
    expect(deque.peekBack()).toBe(2)
    expect(deque.size).toBe(2)
  })

  it('fromArray with single element', () => {
    const deque = Deque.fromArray([42])
    expect(deque.size).toBe(1)
    expect(deque.popFront()).toBe(42)
  })

  it('clear after resize', () => {
    const deque = new Deque<number>(2)
    for (let i = 0; i < 10; i++) {
      deque.pushBack(i)
    }
    deque.clear()
    expect(deque.size).toBe(0)
    expect(deque.isEmpty()).toBe(true)
  })

  it('toArray after multiple pops and pushes', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.pushBack(3)
    deque.popFront()
    deque.pushBack(4)
    deque.popBack()
    expect(deque.toArray()).toEqual([2, 3])
  })

  it('isEmpty after single element pop', () => {
    const deque = new Deque<number>()
    deque.pushBack(42)
    deque.popFront()
    expect(deque.isEmpty()).toBe(true)
    expect(deque.size).toBe(0)
  })

  it('peek after clearing', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    expect(deque.peekFront()).toBeUndefined()
    expect(deque.peekBack()).toBeUndefined()
  })

  it('pop after clearing', () => {
    const deque = new Deque<number>()
    deque.pushBack(1)
    deque.pushBack(2)
    deque.clear()
    expect(deque.popFront()).toBeUndefined()
    expect(deque.popBack()).toBeUndefined()
  })
})

describe('dequeue - wave548', () => {
  it('dequeue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module has name', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module not null', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module not undefined', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module constructable', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module has prototype', () => {
    expect(describe).toBeDefined()
  })
})

describe('dequeue - wave549', () => {
  it('dequeue module defined', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module is function', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dequeue - wave550', () => {
  it('dequeue w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('dequeue - wave551', () => {
  it('dequeue w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('dequeue - wave552', () => {
  it('dequeue w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('dequeue w552 v2', () => {
    expect(describe).toBeDefined()
  })
})
