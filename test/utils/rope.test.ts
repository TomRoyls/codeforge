import { describe, expect, it } from 'vitest'
import { Rope } from '../../src/utils/rope.js'

// ─── Construction ───

describe('Rope construction', () => {
  it('creates empty rope', () => {
    const r = new Rope()
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates from string', () => {
    const r = new Rope('hello')
    expect(r.length).toBe(5)
    expect(r.toString()).toBe('hello')
  })

  it('creates from empty string', () => {
    const r = new Rope('')
    expect(r.length).toBe(0)
    expect(r.toString()).toBe('')
  })

  it('creates from long string', () => {
    const text = 'a'.repeat(200)
    const r = new Rope(text)
    expect(r.length).toBe(200)
    expect(r.toString()).toBe(text)
  })
})

// ─── Index ───

describe('Rope index', () => {
  it('returns character at index', () => {
    const r = new Rope('hello')
    expect(r.index(0)).toBe('h')
    expect(r.index(1)).toBe('e')
    expect(r.index(4)).toBe('o')
  })

  it('throws on out of bounds', () => {
    const r = new Rope('hi')
    expect(() => r.index(-1)).toThrow(RangeError)
    expect(() => r.index(2)).toThrow(RangeError)
  })

  it('throws on empty rope', () => {
    const r = new Rope()
    expect(() => r.index(0)).toThrow(RangeError)
  })
})

// ─── Concat ───

describe('Rope concat', () => {
  it('concats two ropes', () => {
    const a = new Rope('hello ')
    const b = new Rope('world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
    expect(c.length).toBe(11)
  })

  it('concats with empty rope', () => {
    const a = new Rope('hello')
    const b = new Rope()
    expect(a.concat(b).toString()).toBe('hello')
    expect(b.concat(a).toString()).toBe('hello')
  })

  it('concats two empty ropes', () => {
    const a = new Rope()
    const b = new Rope()
    expect(a.concat(b).toString()).toBe('')
  })

  it('does not mutate original', () => {
    const a = new Rope('abc')
    const b = new Rope('def')
    const c = a.concat(b)
    expect(a.toString()).toBe('abc')
    expect(b.toString()).toBe('def')
    expect(c.toString()).toBe('abcdef')
  })
})

// ─── Split ───

describe('Rope split', () => {
  it('splits in middle', () => {
    const r = new Rope('hello world')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('splits at start', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(0)
    expect(left.toString()).toBe('')
    expect(right.toString()).toBe('hello')
  })

  it('splits at end', () => {
    const r = new Rope('hello')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe('')
  })
})

// ─── Insert ───

describe('Rope insert', () => {
  it('inserts in middle', () => {
    const r = new Rope('helo')
    r.insert(2, 'l')
    expect(r.toString()).toBe('hello')
  })

  it('inserts at start', () => {
    const r = new Rope('world')
    r.insert(0, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts at end', () => {
    const r = new Rope('hello')
    r.insert(5, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts into empty rope', () => {
    const r = new Rope()
    r.insert(0, 'hello')
    expect(r.toString()).toBe('hello')
  })

  it('no-op on empty string', () => {
    const r = new Rope('hello')
    r.insert(2, '')
    expect(r.toString()).toBe('hello')
  })
})

// ─── Delete ───

describe('Rope delete', () => {
  it('deletes from middle', () => {
    const r = new Rope('hello world')
    r.delete(5, 1)
    expect(r.toString()).toBe('helloworld')
  })

  it('deletes from start', () => {
    const r = new Rope('hello world')
    r.delete(0, 6)
    expect(r.toString()).toBe('world')
  })

  it('deletes from end', () => {
    const r = new Rope('hello world')
    r.delete(5, 6)
    expect(r.toString()).toBe('hello')
  })

  it('no-op on empty rope', () => {
    const r = new Rope()
    r.delete(0, 5)
    expect(r.toString()).toBe('')
  })

  it('no-op with zero length', () => {
    const r = new Rope('hello')
    r.delete(2, 0)
    expect(r.toString()).toBe('hello')
  })

  it('clamps deletion range', () => {
    const r = new Rope('hello')
    r.delete(3, 100)
    expect(r.toString()).toBe('hel')
  })
})

// ─── Clone ───

describe('Rope clone', () => {
  it('clones a rope', () => {
    const r = new Rope('hello')
    const c = r.clone()
    expect(c.toString()).toBe('hello')
    c.insert(5, ' world')
    expect(r.toString()).toBe('hello')
    expect(c.toString()).toBe('hello world')
  })
})

// ─── Long Strings ───

describe('Rope long strings', () => {
  it('handles split-insert-delete on long text', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz'.repeat(10)
    const r = new Rope(text)
    expect(r.length).toBe(260)
    const [left, right] = r.split(130)
    expect(left.length).toBe(130)
    expect(right.length).toBe(130)
    expect(left.toString() + right.toString()).toBe(text)
  })
})
