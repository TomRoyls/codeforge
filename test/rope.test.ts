import { beforeEach, describe, expect, it } from 'vitest'
import { Rope } from '../src/utils/rope.js'

// ─── constructor ───

describe('Rope - constructor', () => {
  it('should create a rope from a string', () => {
    const rope = new Rope('hello world')
    expect(rope.toString()).toBe('hello world')
    expect(rope.length).toBe(11)
  })

  it('should create an empty rope', () => {
    const rope = new Rope()
    expect(rope.toString()).toBe('')
    expect(rope.length).toBe(0)
  })

  it('should create an empty rope from empty string', () => {
    const rope = new Rope('')
    expect(rope.toString()).toBe('')
    expect(rope.length).toBe(0)
  })
})

// ─── index ───

describe('Rope - index', () => {
  it('should return the character at position', () => {
    const rope = new Rope('abcdef')
    expect(rope.index(0)).toBe('a')
    expect(rope.index(3)).toBe('d')
    expect(rope.index(5)).toBe('f')
  })
})

// ─── index out of bounds ───

describe('Rope - index out of bounds', () => {
  it('should throw RangeError for negative index', () => {
    const rope = new Rope('abc')
    expect(() => rope.index(-1)).toThrow(RangeError)
  })

  it('should throw RangeError for index >= length', () => {
    const rope = new Rope('abc')
    expect(() => rope.index(3)).toThrow(RangeError)
    expect(() => rope.index(100)).toThrow(RangeError)
  })

  it('should throw RangeError on empty rope', () => {
    const rope = new Rope()
    expect(() => rope.index(0)).toThrow(RangeError)
  })
})

// ─── concat ───

describe('Rope - concat', () => {
  it('should combine two ropes', () => {
    const a = new Rope('hello ')
    const b = new Rope('world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
    expect(c.length).toBe(11)
  })

  it('should not modify original ropes', () => {
    const a = new Rope('foo')
    const b = new Rope('bar')
    const c = a.concat(b)
    expect(a.toString()).toBe('foo')
    expect(b.toString()).toBe('bar')
    expect(c.toString()).toBe('foobar')
  })
})

// ─── split ───

describe('Rope - split', () => {
  it('should split into two ropes at position', () => {
    const rope = new Rope('hello world')
    const [left, right] = rope.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('should split at position 0', () => {
    const rope = new Rope('abc')
    const [left, right] = rope.split(0)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('abc')
  })

  it('should split at end', () => {
    const rope = new Rope('abc')
    const [left, right] = rope.split(3)
    expect(left.toString()).toBe('abc')
    expect(right.toString()).toBe('')
  })
})

// ─── insert ───

describe('Rope - insert', () => {
  it('should insert text at position', () => {
    const rope = new Rope('hello world')
    rope.insert(5, ' beautiful')
    expect(rope.toString()).toBe('hello beautiful world')
  })

  it('should insert at the beginning', () => {
    const rope = new Rope('world')
    rope.insert(0, 'hello ')
    expect(rope.toString()).toBe('hello world')
  })

  it('should insert at the end', () => {
    const rope = new Rope('hello')
    rope.insert(5, ' world')
    expect(rope.toString()).toBe('hello world')
  })
})

// ─── delete ───

describe('Rope - delete', () => {
  it('should remove a substring', () => {
    const rope = new Rope('hello beautiful world')
    rope.delete(5, 10)
    expect(rope.toString()).toBe('hello world')
  })

  it('should remove from the beginning', () => {
    const rope = new Rope('hello world')
    rope.delete(0, 6)
    expect(rope.toString()).toBe('world')
  })

  it('should remove from the end', () => {
    const rope = new Rope('hello world')
    rope.delete(5, 6)
    expect(rope.toString()).toBe('hello')
  })
})

// ─── toString ───

describe('Rope - toString', () => {
  it('should return the full string', () => {
    const rope = new Rope('the quick brown fox')
    expect(rope.toString()).toBe('the quick brown fox')
  })

  it('should return empty string for empty rope', () => {
    expect(new Rope().toString()).toBe('')
  })
})

// ─── length ───

describe('Rope - length', () => {
  it('should return correct total length', () => {
    expect(new Rope('abc').length).toBe(3)
    expect(new Rope('').length).toBe(0)
    expect(new Rope().length).toBe(0)
  })

  it('should update length after operations', () => {
    const rope = new Rope('abc')
    rope.insert(3, 'def')
    expect(rope.length).toBe(6)
    rope.delete(0, 3)
    expect(rope.length).toBe(3)
  })
})

// ─── clone ───

describe('Rope - clone', () => {
  it('should produce an independent copy', () => {
    const original = new Rope('hello')
    const copy = original.clone()
    expect(copy.toString()).toBe('hello')
    copy.insert(5, ' world')
    expect(original.toString()).toBe('hello')
    expect(copy.toString()).toBe('hello world')
  })

  it('should clone an empty rope', () => {
    const original = new Rope()
    const copy = original.clone()
    expect(copy.toString()).toBe('')
    expect(copy.length).toBe(0)
  })
})

// ─── chain operations ───

describe('Rope - chain operations', () => {
  it('should handle insert, delete, concat, and verify final string', () => {
    const rope = new Rope('the quick brown fox')
    rope.insert(19, ' jumps')
    rope.delete(4, 6)
    const other = new Rope(' over the lazy dog')
    const combined = rope.concat(other)
    expect(combined.toString()).toBe('the brown fox jumps over the lazy dog')
  })
})

// ─── empty operations ───

describe('Rope - empty operations', () => {
  it('should concat with empty rope', () => {
    const rope = new Rope('abc')
    const empty = new Rope()
    expect(rope.concat(empty).toString()).toBe('abc')
    expect(empty.concat(rope).toString()).toBe('abc')
    expect(empty.concat(empty).toString()).toBe('')
  })

  it('should insert into empty rope', () => {
    const rope = new Rope()
    rope.insert(0, 'hello')
    expect(rope.toString()).toBe('hello')
  })

  it('should delete from empty rope without error', () => {
    const rope = new Rope()
    expect(() => rope.delete(0, 5)).not.toThrow()
    expect(rope.toString()).toBe('')
  })

  it('should handle delete with zero length', () => {
    const rope = new Rope('abc')
    rope.delete(1, 0)
    expect(rope.toString()).toBe('abc')
  })

  it('should handle delete beyond string bounds', () => {
    const rope = new Rope('abc')
    rope.delete(10, 5)
    expect(rope.toString()).toBe('abc')
  })
})
