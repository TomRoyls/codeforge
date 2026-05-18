import { describe, it, expect } from 'vitest'
import { Rope2 } from '../src/core/rope-2/index.js'

// ─── Constructor and Basics ───
describe('Rope2 constructor and basics', () => {
  it('creates empty rope', () => {
    const r = new Rope2()
    expect(r.length).toBe(0)
    expect(r.isEmpty).toBe(true)
    expect(r.toString()).toBe('')
  })

  it('creates rope from string', () => {
    const r = new Rope2('hello')
    expect(r.length).toBe(5)
    expect(r.toString()).toBe('hello')
  })

  it('fromString static works', () => {
    const r = Rope2.fromString('world')
    expect(r.toString()).toBe('world')
  })
})

// ─── Insert / Delete ───
describe('Rope2 insert and delete', () => {
  it('inserts at beginning', () => {
    const r = new Rope2('world')
    r.insert(0, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts at end', () => {
    const r = new Rope2('hello')
    r.insert(5, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts in middle', () => {
    const r = new Rope2('helo')
    r.insert(2, 'l')
    expect(r.toString()).toBe('hello')
  })

  it('delete removes characters', () => {
    const r = new Rope2('hello world')
    r.delete(5, 1)
    expect(r.toString()).toBe('helloworld')
  })

  it('delete at boundaries', () => {
    const r = new Rope2('abc')
    r.delete(0, 1)
    expect(r.toString()).toBe('bc')
  })

  it('insert empty string is no-op', () => {
    const r = new Rope2('abc')
    r.insert(1, '')
    expect(r.toString()).toBe('abc')
  })
})

// ─── charAt / substring ───
describe('Rope2 charAt and substring', () => {
  it('charAt returns character', () => {
    const r = new Rope2('hello')
    expect(r.charAt(0)).toBe('h')
    expect(r.charAt(4)).toBe('o')
  })

  it('charAt out of bounds returns empty', () => {
    const r = new Rope2('hi')
    expect(r.charAt(-1)).toBe('')
    expect(r.charAt(5)).toBe('')
  })

  it('substring returns slice', () => {
    const r = new Rope2('hello world')
    expect(r.substring(0, 5)).toBe('hello')
    expect(r.substring(6)).toBe('world')
  })

  it('substring with invalid range returns empty', () => {
    const r = new Rope2('abc')
    expect(r.substring(5, 10)).toBe('')
  })
})

// ─── concat / split ───
describe('Rope2 concat and split', () => {
  it('concats with another rope', () => {
    const a = new Rope2('hello')
    const b = new Rope2(' world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
  })

  it('concats with string', () => {
    const a = new Rope2('hello')
    const c = a.concat(' world')
    expect(c.toString()).toBe('hello world')
  })

  it('splits at index', () => {
    const r = new Rope2('hello world')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('static concat works', () => {
    const c = Rope2.concat('hello', ' world')
    expect(c.toString()).toBe('hello world')
  })
})

// ─── Search Methods ───
describe('Rope2 search methods', () => {
  it('indexOf finds substring', () => {
    const r = new Rope2('hello world')
    expect(r.indexOf('world')).toBe(6)
    expect(r.indexOf('xyz')).toBe(-1)
  })

  it('includes checks substring', () => {
    const r = new Rope2('hello world')
    expect(r.includes('world')).toBe(true)
    expect(r.includes('xyz')).toBe(false)
  })

  it('startsWith checks prefix', () => {
    const r = new Rope2('hello')
    expect(r.startsWith('hel')).toBe(true)
    expect(r.startsWith('xyz')).toBe(false)
  })

  it('endsWith checks suffix', () => {
    const r = new Rope2('hello')
    expect(r.endsWith('llo')).toBe(true)
    expect(r.endsWith('xyz')).toBe(false)
  })
})

// ─── Clone / Clear / Equals ───
describe('Rope2 clone, clear, equals', () => {
  it('clones rope', () => {
    const r = new Rope2('abc')
    const c = r.clone()
    expect(c.toString()).toBe('abc')
    c.insert(0, 'x')
    expect(r.toString()).toBe('abc')
  })

  it('clears rope', () => {
    const r = new Rope2('abc')
    r.clear()
    expect(r.isEmpty).toBe(true)
    expect(r.length).toBe(0)
  })

  it('equals compares content', () => {
    const a = new Rope2('abc')
    const b = new Rope2('abc')
    const c = new Rope2('xyz')
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})

// ─── Reverse / Repeat / Replace ───
describe('Rope2 reverse, repeat, replace', () => {
  it('reverses rope', () => {
    const r = new Rope2('abc')
    r.reverse()
    expect(r.toString()).toBe('cba')
  })

  it('repeats rope', () => {
    const r = new Rope2('ab')
    const rep = r.repeat(3)
    expect(rep.toString()).toBe('ababab')
  })

  it('repeat zero returns empty', () => {
    const r = new Rope2('ab')
    expect(r.repeat(0).toString()).toBe('')
  })

  it('replaces range', () => {
    const r = new Rope2('hello world')
    r.replace(5, 1, '!')
    expect(r.toString()).toBe('hello!world')
  })
})

// ─── Iteration / toArray ───
describe('Rope2 iteration and toArray', () => {
  it('forEach iterates characters', () => {
    const r = new Rope2('abc')
    const chars: string[] = []
    r.forEach((ch) => chars.push(ch))
    expect(chars).toEqual(['a', 'b', 'c'])
  })

  it('toArray returns characters', () => {
    const r = new Rope2('hi')
    expect(r.toArray()).toEqual(['h', 'i'])
  })

  it('Symbol.iterator works', () => {
    const r = new Rope2('ab')
    expect([...r]).toEqual(['a', 'b'])
  })

  it('rebalance maintains content', () => {
    const r = new Rope2('hello')
    r.insert(0, 'world ')
    r.rebalance()
    expect(r.toString()).toBe('world hello')
  })
})
