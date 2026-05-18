import { describe, expect, it } from 'vitest'
import { HashGenerator } from '../../../src/core/duplication/hash-generator.js'

// ─── generateTokenHash() ───

describe('HashGenerator generateTokenHash()', () => {
  it('returns a sha256 hex string for empty tokens', () => {
    const gen = new HashGenerator()
    const hash = gen.generateTokenHash([])
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('returns consistent hash for same tokens', () => {
    const gen = new HashGenerator()
    const tokens = ['const', 'x', '=', '42']
    const h1 = gen.generateTokenHash(tokens)
    const h2 = gen.generateTokenHash(tokens)
    expect(h1).toBe(h2)
  })

  it('returns different hashes for different tokens', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateTokenHash(['hello'])
    const h2 = gen.generateTokenHash(['world'])
    expect(h1).not.toBe(h2)
  })

  it('returns different hash from empty tokens when tokens are present', () => {
    const gen = new HashGenerator()
    const empty = gen.generateTokenHash([])
    const filled = gen.generateTokenHash(['a'])
    expect(filled).not.toBe(empty)
  })

  it('is order-sensitive', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateTokenHash(['a', 'b'])
    const h2 = gen.generateTokenHash(['b', 'a'])
    expect(h1).not.toBe(h2)
  })
})

// ─── generateContentHash() ───

describe('HashGenerator generateContentHash()', () => {
  it('returns consistent hash for same content', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateContentHash('hello world')
    const h2 = gen.generateContentHash('hello world')
    expect(h1).toBe(h2)
  })

  it('ignores leading and trailing whitespace per line', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateContentHash('hello\nworld')
    const h2 = gen.generateContentHash('  hello  \n  world  ')
    expect(h1).toBe(h2)
  })

  it('ignores empty lines', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateContentHash('hello\nworld')
    const h2 = gen.generateContentHash('hello\n\n\nworld')
    expect(h1).toBe(h2)
  })

  it('returns different hashes for different content', () => {
    const gen = new HashGenerator()
    expect(gen.generateContentHash('foo')).not.toBe(gen.generateContentHash('bar'))
  })

  it('returns a sha256 hex string', () => {
    const gen = new HashGenerator()
    const hash = gen.generateContentHash('test')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('treats all-whitespace lines as empty', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateContentHash('hello\nworld')
    const h2 = gen.generateContentHash('hello\n   \nworld')
    expect(h1).toBe(h2)
  })

  it('produces same hash for content that differs only in trailing newlines', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateContentHash('hello\nworld')
    const h2 = gen.generateContentHash('hello\nworld\n\n')
    expect(h1).toBe(h2)
  })
})

// ─── generateStructuralHash() ───

describe('HashGenerator generateStructuralHash()', () => {
  it('replaces identifiers with _ID_', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateStructuralHash('const foo = 1')
    const h2 = gen.generateStructuralHash('const bar = 1')
    expect(h1).toBe(h2)
  })

  it('preserves keywords', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateStructuralHash('const x = 1')
    const h2 = gen.generateStructuralHash('let x = 1')
    expect(h1).not.toBe(h2)
  })

  it('returns consistent hash for same AST', () => {
    const gen = new HashGenerator()
    const ast = 'function myFunc(x) { return x + 1 }'
    const h1 = gen.generateStructuralHash(ast)
    const h2 = gen.generateStructuralHash(ast)
    expect(h1).toBe(h2)
  })

  it('returns a sha256 hex string', () => {
    const gen = new HashGenerator()
    const hash = gen.generateStructuralHash('const x = 1')
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('treats structurally equivalent code with different identifiers as same', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateStructuralHash('function add(a, b) { return a + b }')
    const h2 = gen.generateStructuralHash('function multiply(x, y) { return x + y }')
    expect(h1).toBe(h2)
  })

  it('differentiates different structures', () => {
    const gen = new HashGenerator()
    const h1 = gen.generateStructuralHash('function f(x) { return x }')
    const h2 = gen.generateStructuralHash('function f(x) { return x + 1 }')
    expect(h1).not.toBe(h2)
  })
})

// ─── tokenize() ───

describe('HashGenerator tokenize()', () => {
  it('extracts tokens from code', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('const x = 42;')
    expect(tokens).toContain('const')
    expect(tokens).toContain('x')
    expect(tokens).toContain('=')
    expect(tokens).toContain('42')
    expect(tokens).toContain(';')
  })

  it('handles empty string', () => {
    const gen = new HashGenerator()
    expect(gen.tokenize('')).toEqual([])
  })

  it('extracts string literals', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('const s = "hello"')
    expect(tokens).toContain('"hello"')
  })

  it('extracts arrow operators', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('(x) => x + 1')
    expect(tokens).toContain('=>')
  })

  it('extracts comparison operators', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('x === 1')
    expect(tokens).toContain('===')
  })

  it('extracts template literals', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('`hello`')
    expect(tokens).toContain('`hello`')
  })

  it('handles numeric literals with decimals', () => {
    const gen = new HashGenerator()
    const tokens = gen.tokenize('3.14')
    expect(tokens).toContain('3.14')
  })
})

// ─── computeSimilarity() ───

describe('HashGenerator computeSimilarity()', () => {
  it('returns 1 for identical token sets', () => {
    const gen = new HashGenerator()
    expect(gen.computeSimilarity(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1)
  })

  it('returns 0 for disjoint token sets', () => {
    const gen = new HashGenerator()
    expect(gen.computeSimilarity(['a', 'b'], ['x', 'y'])).toBe(0)
  })

  it('returns partial overlap value', () => {
    const gen = new HashGenerator()
    const sim = gen.computeSimilarity(['a', 'b', 'c'], ['b', 'c', 'd'])
    expect(sim).toBeCloseTo(0.5)
  })

  it('returns 1 when both token arrays are empty', () => {
    const gen = new HashGenerator()
    expect(gen.computeSimilarity([], [])).toBe(1)
  })

  it('returns 0 when one array is empty and the other is not', () => {
    const gen = new HashGenerator()
    expect(gen.computeSimilarity(['a'], [])).toBe(0)
    expect(gen.computeSimilarity([], ['a'])).toBe(0)
  })

  it('uses set semantics (deduplication)', () => {
    const gen = new HashGenerator()
    const sim = gen.computeSimilarity(['a', 'a', 'b'], ['a', 'b', 'b'])
    expect(sim).toBe(1)
  })

  it('returns correct Jaccard similarity', () => {
    const gen = new HashGenerator()
    const sim = gen.computeSimilarity(['a', 'b', 'c', 'd'], ['c', 'd', 'e', 'f'])
    expect(sim).toBeCloseTo(1 / 3)
  })
})
