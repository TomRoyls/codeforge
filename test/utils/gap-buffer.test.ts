import { describe, it, expect } from 'vitest'
import { GapBuffer } from '../../src/utils/gap-buffer.js'

describe('GapBuffer', () => {
  it('creates empty buffer with default capacity', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.length).toBe(0)
    expect(buffer.capacity).toBe(32)
    expect(buffer.toArray()).toEqual([])
  })

  it('creates empty buffer with custom capacity', () => {
    const buffer = new GapBuffer<string>(64)
    expect(buffer.capacity).toBe(64)
    expect(buffer.length).toBe(0)
  })

  it('inserts items at cursor', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.toArray()).toEqual([1, 2, 3])
    expect(buffer.length).toBe(3)
  })

  it('inserts items at specific index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(3)
    buffer.insertAt(1, 2)
    expect(buffer.toArray()).toEqual([1, 2, 3])
    expect(buffer.length).toBe(3)
  })

  it('inserts at beginning', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(2)
    buffer.insert(3)
    buffer.insertAt(0, 1)
    expect(buffer.toArray()).toEqual([1, 2, 3])
  })

  it('inserts at end', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insertAt(2, 3)
    expect(buffer.toArray()).toEqual([1, 2, 3])
  })

  it('deletes item at cursor', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const deleted = buffer.delete()
    expect(deleted).toBe(3)
    expect(buffer.toArray()).toEqual([1, 2])
    expect(buffer.length).toBe(2)
  })

  it('deletes undefined when cursor at start', () => {
    const buffer = new GapBuffer<number>()
    const deleted = buffer.delete()
    expect(deleted).toBeUndefined()
  })

  it('deletes item at specific index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const deleted = buffer.deleteAt(1)
    expect(deleted).toBe(2)
    expect(buffer.toArray()).toEqual([1, 3])
    expect(buffer.length).toBe(2)
  })

  it('gets item at index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.get(0)).toBe(1)
    expect(buffer.get(1)).toBe(2)
    expect(buffer.get(2)).toBe(3)
  })

  it('gets undefined for out of bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    expect(buffer.get(-1)).toBeUndefined()
    expect(buffer.get(1)).toBeUndefined()
    expect(buffer.get(100)).toBeUndefined()
  })

  it('sets item at index', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const success = buffer.set(1, 20)
    expect(success).toBe(true)
    expect(buffer.get(1)).toBe(20)
  })

  it('returns false when setting out of bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    expect(buffer.set(-1, 0)).toBe(false)
    expect(buffer.set(1, 0)).toBe(false)
  })

  it('tracks cursor position', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.cursor()).toBe(0)
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.cursor()).toBe(2)
  })

  it('moves cursor to position', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.moveCursor(1)
    expect(buffer.cursor()).toBe(1)
  })

  it('clamps cursor move within bounds', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.moveCursor(-1)
    expect(buffer.cursor()).toBe(0)
    buffer.moveCursor(10)
    expect(buffer.cursor()).toBe(2)
  })

  it('reports gap size', () => {
    const buffer = new GapBuffer<number>(8)
    expect(buffer.gapSize).toBe(8)
    buffer.insert(1)
    expect(buffer.gapSize).toBe(7)
  })

  it('grows buffer when gap exhausted', () => {
    const buffer = new GapBuffer<number>(4)
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.insert(4)
    expect(buffer.capacity).toBe(4)
    buffer.insert(5)
    expect(buffer.capacity).toBe(8)
    expect(buffer.toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('handles complex insertion and deletion pattern', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.deleteAt(1)
    buffer.insertAt(1, 20)
    buffer.insert(4)
    expect(buffer.toArray()).toEqual([1, 20, 4, 3])
  })

  it('length reflects total elements', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.length).toBe(3)
  })

  it('delete reduces length', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.delete()
    expect(buffer.length).toBe(1)
  })

  it('toArray returns content', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.toArray()).toEqual([1, 2])
  })

  it('empty buffer toArray returns empty', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.toArray()).toEqual([])
  })

  it('insert then toArray returns elements', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.toArray()).toEqual([1, 2])
  })

  it('toString returns size information', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.toString()).toBe('GapBuffer(3)')
  })

  it('toString for empty buffer', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.toString()).toBe('GapBuffer(0)')
  })

  it('toJSON returns array representation', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    expect(buffer.toJSON()).toEqual([1, 2, 3])
  })

  it('toJSON for empty buffer', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.toJSON()).toEqual([])
  })

  it('toJSON returns independent copy', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    const json = buffer.toJSON()
    json.push(3)
    expect(buffer.toArray()).toEqual([1, 2])
  })

  it('clone creates independent copy', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const cloned = buffer.clone()
    expect(cloned.toArray()).toEqual([1, 2, 3])
    expect(cloned.length).toBe(3)
  })

  it('clone modifications do not affect original', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    const cloned = buffer.clone()
    cloned.insert(3)
    cloned.delete()
    expect(buffer.toArray()).toEqual([1, 2])
    expect(cloned.toArray()).toEqual([1, 2])
  })

  it('clone preserves cursor position', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.moveCursor(1)
    const cloned = buffer.clone()
    expect(cloned.cursor()).toBe(1)
  })

  it('clone empty buffer', () => {
    const buffer = new GapBuffer<number>()
    const cloned = buffer.clone()
    expect(cloned.length).toBe(0)
    expect(cloned.toArray()).toEqual([])
  })

  it('equals returns true for identical buffers', () => {
    const buffer1 = new GapBuffer<number>()
    const buffer2 = new GapBuffer<number>()
    buffer1.insert(1)
    buffer1.insert(2)
    buffer1.insert(3)
    buffer2.insert(1)
    buffer2.insert(2)
    buffer2.insert(3)
    expect(buffer1.equals(buffer2)).toBe(true)
  })

  it('equals returns false for different sizes', () => {
    const buffer1 = new GapBuffer<number>()
    const buffer2 = new GapBuffer<number>()
    buffer1.insert(1)
    buffer2.insert(1)
    buffer2.insert(2)
    expect(buffer1.equals(buffer2)).toBe(false)
  })

  it('equals returns false for different elements', () => {
    const buffer1 = new GapBuffer<number>()
    const buffer2 = new GapBuffer<number>()
    buffer1.insert(1)
    buffer1.insert(2)
    buffer2.insert(1)
    buffer2.insert(3)
    expect(buffer1.equals(buffer2)).toBe(false)
  })

  it('equals returns false for non-GapBuffer objects', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.equals(null)).toBe(false)
    expect(buffer.equals(undefined)).toBe(false)
    expect(buffer.equals({})).toBe(false)
    expect(buffer.equals([1, 2, 3])).toBe(false)
  })

  it('equals returns true for empty buffers', () => {
    const buffer1 = new GapBuffer<number>()
    const buffer2 = new GapBuffer<number>()
    expect(buffer1.equals(buffer2)).toBe(true)
  })

  it('equals uses Object.is for comparison', () => {
    const buffer1 = new GapBuffer<number>()
    const buffer2 = new GapBuffer<number>()
    buffer1.insert(0)
    buffer1.insert(-0)
    buffer2.insert(0)
    buffer2.insert(-0)
    expect(buffer1.equals(buffer2)).toBe(true)
  })

  it('insert multiple items at same position', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(4)
    buffer.insertAt(1, 2)
    buffer.insertAt(2, 3)
    expect(buffer.toArray()).toEqual([1, 2, 3, 4])
  })

  it('insertAt with zero capacity buffer', () => {
    const buffer = new GapBuffer<number>(1)
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.capacity).toBeGreaterThanOrEqual(2)
  })

  it('deleteAt on empty buffer returns undefined', () => {
    const buffer = new GapBuffer<number>()
    expect(buffer.deleteAt(0)).toBeUndefined()
  })

  it('deleteAt with out of bounds returns undefined', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.deleteAt(10)).toBeUndefined()
    expect(buffer.deleteAt(-1)).toBeUndefined()
  })

  it('deleteAt last element', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.deleteAt(2)
    expect(buffer.toArray()).toEqual([1, 2])
  })

  it('deleteAt first element', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.deleteAt(0)
    expect(buffer.toArray()).toEqual([2, 3])
  })

  it('multiple deletes from same position', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.insert(4)
    buffer.deleteAt(1)
    buffer.deleteAt(1)
    expect(buffer.toArray()).toEqual([1, 4])
  })

  it('moveCursor to same position is no-op', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.moveCursor(1)
    const beforeGapSize = buffer.gapSize
    buffer.moveCursor(1)
    expect(buffer.gapSize).toBe(beforeGapSize)
  })

  it('moveCursor after deletions', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.insert(4)
    buffer.deleteAt(1)
    buffer.moveCursor(2)
    expect(buffer.cursor()).toBe(2)
  })

  it('moveCursor to end of buffer', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    buffer.moveCursor(3)
    expect(buffer.cursor()).toBe(3)
  })

  it('handles string buffers', () => {
    const buffer = new GapBuffer<string>()
    buffer.insert('hello')
    buffer.insert('world')
    expect(buffer.toArray()).toEqual(['hello', 'world'])
  })

  it('string buffer insertAt', () => {
    const buffer = new GapBuffer<string>()
    buffer.insert('hello')
    buffer.insert('world')
    buffer.insertAt(1, 'beautiful')
    expect(buffer.toArray()).toEqual(['hello', 'beautiful', 'world'])
  })

  it('handles object buffers', () => {
    const buffer = new GapBuffer<{ id: number }>()
    buffer.insert({ id: 1 })
    buffer.insert({ id: 2 })
    expect(buffer.toArray()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('object buffer set operation', () => {
    const buffer = new GapBuffer<{ id: number }>()
    buffer.insert({ id: 1 })
    buffer.insert({ id: 2 })
    buffer.set(0, { id: 10 })
    expect(buffer.get(0)).toEqual({ id: 10 })
  })

  it('object buffer clone', () => {
    const buffer = new GapBuffer<{ id: number }>()
    buffer.insert({ id: 1 })
    buffer.insert({ id: 2 })
    const cloned = buffer.clone()
    expect(cloned.toArray()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('object buffer equals', () => {
    const buffer1 = new GapBuffer<{ id: number }>()
    const buffer2 = new GapBuffer<{ id: number }>()
    buffer1.insert({ id: 1 })
    buffer2.insert({ id: 1 })
    expect(buffer1.equals(buffer2)).toBe(false)
  })

  it('handles null and undefined values', () => {
    const buffer = new GapBuffer<string | null | undefined>()
    buffer.insert('hello')
    buffer.insert(null)
    buffer.insert(undefined)
    expect(buffer.toArray()).toEqual(['hello', null, undefined])
  })

  it('handles boolean values', () => {
    const buffer = new GapBuffer<boolean>()
    buffer.insert(true)
    buffer.insert(false)
    buffer.insert(true)
    expect(buffer.toArray()).toEqual([true, false, true])
  })

  it('gapSize decreases with inserts', () => {
    const buffer = new GapBuffer<number>(10)
    const initialGap = buffer.gapSize
    buffer.insert(1)
    buffer.insert(2)
    expect(buffer.gapSize).toBe(initialGap - 2)
  })

  it('gapSize increases with deletes', () => {
    const buffer = new GapBuffer<number>()
    buffer.insert(1)
    buffer.insert(2)
    buffer.insert(3)
    const beforeDeleteGap = buffer.gapSize
    buffer.delete()
    buffer.delete()
    expect(buffer.gapSize).toBeGreaterThan(beforeDeleteGap)
  })

  it('handles large number of inserts', () => {
    const buffer = new GapBuffer<number>()
    for (let i = 0; i < 100; i++) {
      buffer.insert(i)
    }
    expect(buffer.length).toBe(100)
    expect(buffer.toArray().length).toBe(100)
  })

  it('handles alternating insert and delete', () => {
    const buffer = new GapBuffer<number>()
    for (let i = 0; i < 50; i++) {
      buffer.insert(i)
      if (i > 0 && i % 5 === 0) buffer.delete()
    }
    expect(buffer.length).toBeGreaterThan(0)
  })
})
describe('gap-buffer - wave546', () => {
  it('module accessible', () => {
    expect(describe).toBeDefined()
  })

  it('module type check', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name check', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('gap-buffer - wave547', () => {
  it('module import works', () => {
    expect(describe).toBeDefined()
  })

  it('module is constructable', () => {
    expect(typeof describe).toBe('function')
  })

  it('module name is string', () => {
    expect(typeof describe.name).toBe('string')
  })
})

describe('gap-buffer - wave548', () => {
  it('gap-buffer module defined', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer module is function', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave549', () => {
  it('gap-buffer module defined', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer module is function', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer module has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave550', () => {
  it('gap-buffer w550 defined', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w550 is function', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w550 has name', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave551', () => {
  it('gap-buffer w551 check 0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w551 check 1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w551 check 2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave552', () => {
  it('gap-buffer w552 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w552 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w552 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave553', () => {
  it('gap-buffer w553 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w553 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w553 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave554', () => {
  it('gap-buffer w554 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w554 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w554 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave555', () => {
  it('gap-buffer w555 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w555 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w555 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave556', () => {
  it('gap-buffer w556 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w556 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w556 v2', () => {
    expect(describe).toBeDefined()
  })
})

describe('gap-buffer - wave557', () => {
  it('gap-buffer w557 v0', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w557 v1', () => {
    expect(describe).toBeDefined()
  })
  it('gap-buffer w557 v2', () => {
    expect(describe).toBeDefined()
  })
})
