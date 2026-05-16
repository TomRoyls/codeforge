import { describe, it, expect } from 'vitest'
import { AdaptivePQ2 } from '../src/core/adaptive-pq-2/index.js'

describe('AdaptivePQ2', () => {
  describe('constructor', () => {
    it('should create empty queue with default threshold', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })

    it('should create empty queue with custom threshold', () => {
      const pq = new AdaptivePQ2<string>(32)
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('push and pop', () => {
    it('should push and pop items in priority order', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')

      expect(pq.pop()).toEqual({ priority: 1, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 2, value: 'b' })
      expect(pq.pop()).toEqual({ priority: 3, value: 'c' })
    })

    it('should return undefined when popping from empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.pop()).toBeUndefined()
    })
  })

  describe('peek', () => {
    it('should return highest priority item without removing it', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')

      expect(pq.peek()).toEqual({ priority: 1, value: 'a' })
      expect(pq.size).toBe(3)
    })

    it('should return undefined when peeking empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.peek()).toBeUndefined()
    })
  })

  describe('size', () => {
    it('should track size correctly', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.size).toBe(0)

      pq.push(1, 'a')
      expect(pq.size).toBe(1)

      pq.push(2, 'b')
      expect(pq.size).toBe(2)

      pq.pop()
      expect(pq.size).toBe(1)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.isEmpty()).toBe(true)
    })

    it('should return false for non-empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      expect(pq.isEmpty()).toBe(false)
    })

    it('should return true after clearing', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.clear()
      expect(pq.isEmpty()).toBe(true)
    })
  })

  describe('clear', () => {
    it('should remove all items', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')

      pq.clear()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
      expect(pq.pop()).toBeUndefined()
    })
  })

  describe('toArray', () => {
    it('should return array of all items in priority order', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(3, 'c')
      pq.push(1, 'a')
      pq.push(2, 'b')

      const arr = pq.toArray()
      expect(arr).toEqual([
        { priority: 1, value: 'a' },
        { priority: 2, value: 'b' },
        { priority: 3, value: 'c' }
      ])
      expect(pq.size).toBe(3)
    })

    it('should return empty array for empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.toArray()).toEqual([])
    })
  })

  describe('contains', () => {
    it('should return true if value exists', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(2, 'b')

      expect(pq.contains('a')).toBe(true)
      expect(pq.contains('b')).toBe(true)
    })

    it('should return false if value does not exist', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')

      expect(pq.contains('b')).toBe(false)
    })

    it('should return false for empty queue', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.contains('a')).toBe(false)
    })
  })

  describe('remove', () => {
    it('should remove value if it exists', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')

      expect(pq.remove('b')).toBe(true)
      expect(pq.size).toBe(2)
      expect(pq.contains('b')).toBe(false)

      const arr = pq.toArray()
      expect(arr).toEqual([
        { priority: 1, value: 'a' },
        { priority: 3, value: 'c' }
      ])
    })

    it('should return false if value does not exist', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')

      expect(pq.remove('b')).toBe(false)
      expect(pq.size).toBe(1)
    })

    it('should remove from sorted array mode', () => {
      const pq = new AdaptivePQ2<string>(64)
      for (let i = 0; i < 10; i++) {
        pq.push(i, `item${i}`)
      }

      expect(pq.remove('item5')).toBe(true)
      expect(pq.size).toBe(9)
      expect(pq.contains('item5')).toBe(false)
    })

    it('should remove from heap mode', () => {
      const pq = new AdaptivePQ2<string>(10)
      for (let i = 0; i < 20; i++) {
        pq.push(i, `item${i}`)
      }

      expect(pq.remove('item10')).toBe(true)
      expect(pq.size).toBe(19)
      expect(pq.contains('item10')).toBe(false)
    })
  })

  describe('update', () => {
    it('should update priority of existing value', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')

      expect(pq.update('b', 5)).toBe(true)
      expect(pq.peek()).toEqual({ priority: 1, value: 'a' })

      const arr = pq.toArray()
      expect(arr).toEqual([
        { priority: 1, value: 'a' },
        { priority: 3, value: 'c' },
        { priority: 5, value: 'b' }
      ])
    })

    it('should return false if value does not exist', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')

      expect(pq.update('b', 5)).toBe(false)
    })

    it('should update to higher priority (lower number)', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(5, 'a')
      pq.push(3, 'b')
      pq.push(7, 'c')

      expect(pq.update('c', 1)).toBe(true)
      expect(pq.peek()).toEqual({ priority: 1, value: 'c' })
    })

    it('should update in sorted array mode', () => {
      const pq = new AdaptivePQ2<string>(64)
      for (let i = 0; i < 10; i++) {
        pq.push(i, `item${i}`)
      }

      expect(pq.update('item5', 100)).toBe(true)
      const arr = pq.toArray()
      const item5 = arr.find((item) => item.value === 'item5')
      expect(item5?.priority).toBe(100)
    })

    it('should update in heap mode', () => {
      const pq = new AdaptivePQ2<string>(10)
      for (let i = 0; i < 20; i++) {
        pq.push(i, `item${i}`)
      }

      expect(pq.update('item10', 100)).toBe(true)
      const arr = pq.toArray()
      const item10 = arr.find((item) => item.value === 'item10')
      expect(item10?.priority).toBe(100)
    })
  })

  describe('mode switching', () => {
    it('should use sorted array for small sizes', () => {
      const pq = new AdaptivePQ2<string>(64)
      for (let i = 0; i < 32; i++) {
        pq.push(i, `item${i}`)
      }

      const arr = pq.toArray()
      expect(arr.length).toBe(32)
      expect(arr[0].priority).toBe(0)
      expect(arr[31].priority).toBe(31)
    })

    it('should use heap for large sizes', () => {
      const pq = new AdaptivePQ2<string>(10)
      for (let i = 0; i < 20; i++) {
        pq.push(i, `item${i}`)
      }

      const arr = pq.toArray()
      expect(arr.length).toBe(20)
      expect(arr[0].priority).toBe(0)
      expect(arr[19].priority).toBe(19)
    })

    it('should switch modes when crossing threshold', () => {
      const pq = new AdaptivePQ2<string>(10)

      pq.push(1, 'a')
      pq.push(2, 'b')
      pq.push(3, 'c')
      expect(pq.size).toBe(3)

      pq.push(4, 'd')
      expect(pq.size).toBe(4)

      pq.pop()
      expect(pq.size).toBe(3)
    })
  })

  describe('sorted extraction', () => {
    it('should extract items in sorted order regardless of insertion order', () => {
      const pq = new AdaptivePQ2<string>()

      pq.push(10, 'z')
      pq.push(5, 'e')
      pq.push(15, 'o')
      pq.push(1, 'a')
      pq.push(8, 'h')
      pq.push(3, 'c')

      const result: {priority: number, value: string}[] = []
      while (!pq.isEmpty()) {
        const item = pq.pop()
        if (item) {
          result.push(item)
        }
      }

      expect(result).toEqual([
        { priority: 1, value: 'a' },
        { priority: 3, value: 'c' },
        { priority: 5, value: 'e' },
        { priority: 8, value: 'h' },
        { priority: 10, value: 'z' },
        { priority: 15, value: 'o' }
      ])
    })
  })

  describe('duplicate values', () => {
    it('should handle duplicate values with different priorities', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(3, 'a')
      pq.push(2, 'a')

      expect(pq.size).toBe(3)
      expect(pq.contains('a')).toBe(true)
    })

    it('should remove only one occurrence of duplicate value', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(3, 'a')
      pq.push(2, 'a')

      expect(pq.remove('a')).toBe(true)
      expect(pq.size).toBe(2)
      expect(pq.contains('a')).toBe(true)
    })

    it('should update first occurrence of duplicate value', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')
      pq.push(3, 'a')
      pq.push(2, 'a')

      expect(pq.update('a', 10)).toBe(true)
      const arr = pq.toArray()
      const updated = arr.find((item) => item.value === 'a' && item.priority === 10)
      expect(updated).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty queue operations', () => {
      const pq = new AdaptivePQ2<string>()
      expect(pq.pop()).toBeUndefined()
      expect(pq.peek()).toBeUndefined()
      expect(pq.size).toBe(0)
      expect(pq.isEmpty()).toBe(true)
      expect(pq.toArray()).toEqual([])
      expect(pq.contains('a')).toBe(false)
      expect(pq.remove('a')).toBe(false)
      expect(pq.update('a', 1)).toBe(false)
    })

    it('should handle single element', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1, 'a')

      expect(pq.size).toBe(1)
      expect(pq.isEmpty()).toBe(false)
      expect(pq.peek()).toEqual({ priority: 1, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 1, value: 'a' })
      expect(pq.isEmpty()).toBe(true)
    })

    it('should handle operations around threshold', () => {
      const pq = new AdaptivePQ2<string>(10)

      for (let i = 0; i < 9; i++) {
        pq.push(i, `item${i}`)
      }
      expect(pq.size).toBe(9)

      pq.push(9, 'item9')
      expect(pq.size).toBe(10)

      pq.push(10, 'item10')
      expect(pq.size).toBe(11)

      pq.pop()
      expect(pq.size).toBe(10)

      pq.pop()
      expect(pq.size).toBe(9)
    })

    it('should handle negative priorities', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(-5, 'a')
      pq.push(0, 'b')
      pq.push(-10, 'c')

      expect(pq.pop()).toEqual({ priority: -10, value: 'c' })
      expect(pq.pop()).toEqual({ priority: -5, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 0, value: 'b' })
    })

    it('should handle decimal priorities', () => {
      const pq = new AdaptivePQ2<string>()
      pq.push(1.5, 'a')
      pq.push(0.5, 'b')
      pq.push(2.5, 'c')

      expect(pq.pop()).toEqual({ priority: 0.5, value: 'b' })
      expect(pq.pop()).toEqual({ priority: 1.5, value: 'a' })
      expect(pq.pop()).toEqual({ priority: 2.5, value: 'c' })
    })
  })

  it('should handle peek on empty', () => {
    const pq = new AdaptivePQ2<string>()
    expect(pq.peek()).toBeUndefined()
  })

  it('should handle clear', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(1, 'a')
    pq.push(2, 'b')
    pq.clear()
    expect(pq.isEmpty()).toBe(true)
    expect(pq.size).toBe(0)
  })

  it('should handle pop order', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    expect(pq.pop()!.value).toBe('a')
    expect(pq.pop()!.value).toBe('b')
    expect(pq.pop()!.value).toBe('c')
  })

  it('should handle toArray', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    const arr = pq.toArray()
    expect(arr.length).toBe(3)
  })

  it('should handle push and update', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    expect(pq.update('a', 10)).toBe(true)
    expect(pq.pop()!.value).toBe('b')
    expect(pq.pop()!.value).toBe('c')
    expect(pq.pop()!.value).toBe('a')
  })

  it('should handle update non-existent', () => {
    const pq = new AdaptivePQ2<string>()
    expect(pq.update('nonexistent', 5)).toBe(false)
  })
  it('should handle toArray', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    const arr = pq.toArray()
    expect(arr.length).toBe(3)
  })
  it('should handle clear', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(1, 'a')
    pq.push(2, 'b')
    pq.clear()
    expect(pq.size).toBe(0)
    expect(pq.pop()).toBeUndefined()
  })
  it('should handle update priority', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    pq.update('c', 0)
    expect(pq.pop()!.value).toBe('c')
  })
  it('should handle toArray after operations', () => {
    const pq = new AdaptivePQ2<string>()
    pq.push(3, 'c')
    pq.push(1, 'a')
    pq.push(2, 'b')
    const arr = pq.toArray()
    expect(arr.length).toBe(3)
  })
})
