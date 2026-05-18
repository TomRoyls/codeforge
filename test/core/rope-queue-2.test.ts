import { describe, it, expect } from 'vitest'
import { RopeQueue2 } from '../../src/core/rope-queue-2/index.js'

// ─── Constructor ───

describe('RopeQueue2 constructor', () => {
  it('creates an empty queue', () => {
    const q = new RopeQueue2<number>()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })
})

// ─── enqueue / dequeue basics ───

describe('RopeQueue2 enqueue and dequeue', () => {
  it('enqueues and dequeues a single item', () => {
    const q = new RopeQueue2<string>()
    q.enqueue('a')
    expect(q.size).toBe(1)
    expect(q.dequeue()).toBe('a')
    expect(q.size).toBe(0)
  })

  it('maintains FIFO order', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    expect(q.dequeue()).toBe(1)
    expect(q.dequeue()).toBe(2)
    expect(q.dequeue()).toBe(3)
  })

  it('handles enqueue after full drain', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.dequeue()
    q.enqueue(2)
    expect(q.dequeue()).toBe(2)
  })

  it('returns undefined when dequeuing empty queue', () => {
    const q = new RopeQueue2<number>()
    expect(q.dequeue()).toBeUndefined()
  })
})

// ─── enqueue many items ───

describe('RopeQueue2 bulk enqueue', () => {
  it('handles more than LEAF_SIZE (32) items', () => {
    const q = new RopeQueue2<number>()
    for (let i = 0; i < 100; i++) {
      q.enqueue(i)
    }
    expect(q.size).toBe(100)
    for (let i = 0; i < 100; i++) {
      expect(q.dequeue()).toBe(i)
    }
    expect(q.isEmpty()).toBe(true)
  })

  it('handles exactly LEAF_SIZE items', () => {
    const q = new RopeQueue2<number>()
    for (let i = 0; i < 32; i++) {
      q.enqueue(i)
    }
    expect(q.size).toBe(32)
    for (let i = 0; i < 32; i++) {
      expect(q.dequeue()).toBe(i)
    }
  })

  it('handles LEAF_SIZE + 1 items', () => {
    const q = new RopeQueue2<number>()
    for (let i = 0; i < 33; i++) {
      q.enqueue(i)
    }
    expect(q.size).toBe(33)
    for (let i = 0; i < 33; i++) {
      expect(q.dequeue()).toBe(i)
    }
  })
})

// ─── size ───

describe('RopeQueue2 size', () => {
  it('tracks size correctly through enqueue', () => {
    const q = new RopeQueue2<number>()
    expect(q.size).toBe(0)
    q.enqueue(1)
    expect(q.size).toBe(1)
    q.enqueue(2)
    expect(q.size).toBe(2)
  })

  it('tracks size correctly through dequeue', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.dequeue()
    expect(q.size).toBe(1)
    q.dequeue()
    expect(q.size).toBe(0)
  })
})

// ─── isEmpty ───

describe('RopeQueue2 isEmpty', () => {
  it('is true for new queue', () => {
    expect(new RopeQueue2<number>().isEmpty()).toBe(true)
  })

  it('is false after enqueue', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    expect(q.isEmpty()).toBe(false)
  })

  it('is true after draining all items', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.dequeue()
    expect(q.isEmpty()).toBe(true)
  })
})

// ─── peek ───

describe('RopeQueue2 peek', () => {
  it('returns the front item without removing it', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    expect(q.peek()).toBe(1)
    expect(q.size).toBe(2)
  })

  it('returns undefined for empty queue', () => {
    const q = new RopeQueue2<number>()
    expect(q.peek()).toBeUndefined()
  })

  it('updates after dequeue', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.dequeue()
    expect(q.peek()).toBe(2)
  })
})

// ─── clear ───

describe('RopeQueue2 clear', () => {
  it('removes all items', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })

  it('allows enqueue after clear', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.clear()
    q.enqueue(2)
    expect(q.size).toBe(1)
    expect(q.peek()).toBe(2)
  })

  it('clear on empty queue is a no-op', () => {
    const q = new RopeQueue2<number>()
    q.clear()
    expect(q.size).toBe(0)
    expect(q.isEmpty()).toBe(true)
  })
})

// ─── enqueueFront ───

describe('RopeQueue2 enqueueFront', () => {
  it('adds items to the front', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(3)
    q.enqueueFront([1, 2])
    expect(q.dequeue()).toBe(1)
    expect(q.dequeue()).toBe(2)
    expect(q.dequeue()).toBe(3)
  })

  it('adds items in correct order to front', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(10)
    q.enqueueFront([1, 2, 3])
    expect(q.size).toBe(4)
    expect(q.dequeue()).toBe(1)
    expect(q.dequeue()).toBe(2)
    expect(q.dequeue()).toBe(3)
    expect(q.dequeue()).toBe(10)
  })

  it('does nothing with empty array', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueueFront([])
    expect(q.size).toBe(1)
    expect(q.peek()).toBe(1)
  })

  it('works on empty queue', () => {
    const q = new RopeQueue2<number>()
    q.enqueueFront([5, 6])
    expect(q.size).toBe(2)
    expect(q.dequeue()).toBe(5)
    expect(q.dequeue()).toBe(6)
  })

  it('handles single item array', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(2)
    q.enqueueFront([1])
    expect(q.size).toBe(2)
    expect(q.dequeue()).toBe(1)
    expect(q.dequeue()).toBe(2)
  })
})

// ─── Generic types ───

describe('RopeQueue2 generic types', () => {
  it('works with strings', () => {
    const q = new RopeQueue2<string>()
    q.enqueue('hello')
    q.enqueue('world')
    expect(q.dequeue()).toBe('hello')
    expect(q.dequeue()).toBe('world')
  })

  it('works with objects', () => {
    const q = new RopeQueue2<{ id: number }>()
    q.enqueue({ id: 1 })
    q.enqueue({ id: 2 })
    const first = q.dequeue()
    expect(first?.id).toBe(1)
    const second = q.dequeue()
    expect(second?.id).toBe(2)
  })

  it('works with null values', () => {
    const q = new RopeQueue2<number | null>()
    q.enqueue(null)
    q.enqueue(1)
    expect(q.dequeue()).toBeNull()
    expect(q.dequeue()).toBe(1)
  })
})

// ─── Edge cases ───

describe('RopeQueue2 edge cases', () => {
  it('handles interleaved enqueue and dequeue', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(1)
    q.enqueue(2)
    expect(q.dequeue()).toBe(1)
    q.enqueue(3)
    expect(q.dequeue()).toBe(2)
    expect(q.dequeue()).toBe(3)
    expect(q.isEmpty()).toBe(true)
  })

  it('handles large number of items', () => {
    const q = new RopeQueue2<number>()
    const count = 200
    for (let i = 0; i < count; i++) {
      q.enqueue(i)
    }
    for (let i = 0; i < count; i++) {
      expect(q.dequeue()).toBe(i)
    }
    expect(q.isEmpty()).toBe(true)
  })

  it('handles enqueue after partial drain beyond leaf', () => {
    const q = new RopeQueue2<number>()
    for (let i = 0; i < 40; i++) {
      q.enqueue(i)
    }
    for (let i = 0; i < 30; i++) {
      q.dequeue()
    }
    q.enqueue(100)
    expect(q.size).toBe(11)
    for (let i = 30; i < 40; i++) {
      expect(q.dequeue()).toBe(i)
    }
    expect(q.dequeue()).toBe(100)
  })

  it('handles duplicate values', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(5)
    q.enqueue(5)
    q.enqueue(5)
    expect(q.dequeue()).toBe(5)
    expect(q.dequeue()).toBe(5)
    expect(q.dequeue()).toBe(5)
  })

  it('handles negative numbers', () => {
    const q = new RopeQueue2<number>()
    q.enqueue(-1)
    q.enqueue(-2)
    expect(q.dequeue()).toBe(-1)
    expect(q.dequeue()).toBe(-2)
  })
})
