import { describe, it, expect } from 'vitest'
import { Rope3 } from '../src/core/rope-3/index.js'

// ─── Constructor and Basics ───
describe('Rope3 constructor and basics', () => {
  it('creates empty rope', () => {
    const r = new Rope3()
    expect(r.length).toBe(0)
    expect(r.isEmpty()).toBe(true)
    expect(r.toString()).toBe('')
  })

  it('creates rope from string', () => {
    const r = new Rope3('hello')
    expect(r.length).toBe(5)
    expect(r.toString()).toBe('hello')
  })

  it('fromString static works', () => {
    const r = Rope3.fromString('world')
    expect(r.toString()).toBe('world')
  })
})

// ─── Insert / Delete ───
describe('Rope3 insert and delete', () => {
  it('inserts at beginning', () => {
    const r = new Rope3('world')
    r.insert(0, 'hello ')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts at end', () => {
    const r = new Rope3('hello')
    r.insert(5, ' world')
    expect(r.toString()).toBe('hello world')
  })

  it('inserts in middle', () => {
    const r = new Rope3('helo')
    r.insert(2, 'l')
    expect(r.toString()).toBe('hello')
  })

  it('deletes characters', () => {
    const r = new Rope3('hello world')
    r.delete(5, 1)
    expect(r.toString()).toBe('helloworld')
  })

  it('delete with invalid length is no-op', () => {
    const r = new Rope3('abc')
    r.delete(0, 0)
    expect(r.toString()).toBe('abc')
  })
})

// ─── charAt / substring ───
describe('Rope3 charAt and substring', () => {
  it('charAt returns character', () => {
    const r = new Rope3('hello')
    expect(r.charAt(0)).toBe('h')
    expect(r.charAt(4)).toBe('o')
  })

  it('charAt out of bounds returns empty', () => {
    const r = new Rope3('hi')
    expect(r.charAt(-1)).toBe('')
    expect(r.charAt(5)).toBe('')
  })

  it('substring returns slice', () => {
    const r = new Rope3('hello world')
    expect(r.substring(0, 5)).toBe('hello')
    expect(r.substring(6)).toBe('world')
  })
})

// ─── concat / split ───
describe('Rope3 concat and split', () => {
  it('concats with string', () => {
    const a = new Rope3('hello')
    const c = a.concat(' world')
    expect(c.toString()).toBe('hello world')
  })

  it('concats with rope', () => {
    const a = new Rope3('hello')
    const b = new Rope3(' world')
    const c = a.concat(b)
    expect(c.toString()).toBe('hello world')
  })

  it('splits at index', () => {
    const r = new Rope3('hello world')
    const [left, right] = r.split(5)
    expect(left.toString()).toBe('hello')
    expect(right.toString()).toBe(' world')
  })

  it('static concat works', () => {
    const c = Rope3.concat('hello', ' world')
    expect(c.toString()).toBe('hello world')
  })
})

// ─── Search Methods ───
describe('Rope3 search methods', () => {
  it('indexOf finds substring', () => {
    const r = new Rope3('hello world')
    expect(r.indexOf('world')).toBe(6)
    expect(r.indexOf('xyz')).toBe(-1)
  })

  it('includes checks substring', () => {
    const r = new Rope3('hello')
    expect(r.includes('ell')).toBe(true)
    expect(r.includes('xyz')).toBe(false)
  })

  it('startsWith checks prefix', () => {
    const r = new Rope3('hello')
    expect(r.startsWith('hel')).toBe(true)
    expect(r.startsWith('xyz')).toBe(false)
  })

  it('endsWith checks suffix', () => {
    const r = new Rope3('hello')
    expect(r.endsWith('llo')).toBe(true)
    expect(r.endsWith('xyz')).toBe(false)
  })
})

// ─── Clone / Reverse / Replace ───
describe('Rope3 clone, reverse, replace', () => {
  it('clone works', () => {
    const r = new Rope3('abc')
    const c = r.clone()
    expect(c.toString()).toBe('abc')
    c.insert(0, 'x')
    expect(r.toString()).toBe('abc')
  })

  it('reverse works', () => {
    const r = new Rope3('abc')
    r.reverse()
    expect(r.toString()).toBe('cba')
  })

  it('replace modifies content', () => {
    const r = new Rope3('hello world')
    r.replace(5, 6, '!')
    expect(r.toString()).toBe('hello!world')
  })
})

// ─── Case / Trim / Pad / Repeat ───
describe('Rope3 case, trim, pad, repeat', () => {
  it('toUpperCase', () => {
    const r = new Rope3('hello')
    expect(r.toUpperCase().toString()).toBe('HELLO')
  })

  it('toLowerCase', () => {
    const r = new Rope3('HELLO')
    expect(r.toLowerCase().toString()).toBe('hello')
  })

  it('trim', () => {
    const r = new Rope3('  hello  ')
    expect(r.trim().toString()).toBe('hello')
  })

  it('padStart', () => {
    const r = new Rope3('hi')
    expect(r.padStart(5).toString()).toBe('   hi')
  })

  it('padEnd', () => {
    const r = new Rope3('hi')
    expect(r.padEnd(5).toString()).toBe('hi   ')
  })

  it('repeat', () => {
    const r = new Rope3('ab')
    expect(r.repeat(3).toString()).toBe('ababab')
  })

  it('repeat zero returns empty', () => {
    const r = new Rope3('ab')
    expect(r.repeat(0).toString()).toBe('')
  })
})

// ─── Iteration ───
describe('Rope3 iteration', () => {
  it('forEach iterates characters', () => {
    const r = new Rope3('abc')
    const chars: string[] = []
    r.forEach((ch) => chars.push(ch))
    expect(chars).toEqual(['a', 'b', 'c'])
  })

  it('toArray returns characters', () => {
    const r = new Rope3('hi')
    expect(r.toArray()).toEqual(['h', 'i'])
  })

  it('Symbol.iterator works', () => {
    const r = new Rope3('ab')
    expect([...r]).toEqual(['a', 'b'])
  })

  it('rebalance maintains content', () => {
    const r = new Rope3('hello')
    r.insert(0, 'world ')
    r.rebalance()
    expect(r.toString()).toBe('world hello')
  })
})
