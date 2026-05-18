import { describe, it, expect } from 'vitest'
import { SimilaritySearch, tokenize, computeSignature, estimateSimilarity } from '../src/core/similarity-search/index.js'

// ─── Tokenize ───
describe('tokenize', () => {
  it('tokenizes text into ngrams and words', () => {
    const tokens = tokenize('hello world')
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
  })

  it('handles empty string', () => {
    expect(tokenize('')).toEqual([])
  })

  it('lowercases text', () => {
    const tokens = tokenize('HELLO')
    expect(tokens).toContain('hello')
  })
})

// ─── Estimate Similarity ───
describe('estimateSimilarity', () => {
  it('returns 1 for identical strings', () => {
    const tokens = tokenize('hello world')
    const sig = computeSignature(new Set(tokens), 128)
    expect(estimateSimilarity(sig, sig)).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    const sig1 = computeSignature(new Set(tokenize('abc')), 128)
    const sig2 = computeSignature(new Set(tokenize('xyz')), 128)
    expect(estimateSimilarity(sig1, sig2)).toBe(0)
  })

  it('returns 1 for two empty signatures', () => {
    const sig = computeSignature(new Set(), 128)
    expect(estimateSimilarity(sig, sig)).toBe(1)
  })

  it('returns partial similarity', () => {
    const sig1 = computeSignature(new Set(tokenize('hello world')), 128)
    const sig2 = computeSignature(new Set(tokenize('hello there')), 128)
    const sim = estimateSimilarity(sig1, sig2)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })
})

// ─── SimilaritySearch ───
describe('SimilaritySearch', () => {
  it('creates with default numHashes', () => {
    const ss = new SimilaritySearch()
    expect(ss.size).toBe(0)
    expect(ss.isEmpty()).toBe(true)
  })

  it('throws on numHashes < 1', () => {
    expect(() => new SimilaritySearch(0)).toThrow('numHashes must be at least 1')
  })

  it('adds documents', () => {
    const ss = new SimilaritySearch(50)
    ss.add('doc1', 'hello world')
    expect(ss.size).toBe(1)
  })

  it('throws on empty text', () => {
    const ss = new SimilaritySearch(50)
    expect(() => ss.add('doc1', '')).toThrow('at least one token')
  })

  it('query finds similar documents', () => {
    const ss = new SimilaritySearch(50)
    ss.add('doc1', 'the quick brown fox')
    ss.add('doc2', 'python programming language')
    const results = ss.query('quick brown fox')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]!.id).toBe('doc1')
  })

  it('query with threshold', () => {
    const ss = new SimilaritySearch(50)
    ss.add('doc1', 'hello world')
    ss.add('doc2', 'python programming')
    const results = ss.query('hello world', 0.5)
    expect(results.every((r) => r.similarity >= 0.5)).toBe(true)
  })

  it('query results sorted by similarity', () => {
    const ss = new SimilaritySearch(50)
    ss.add('doc1', 'hello world foo bar')
    ss.add('doc2', 'hello world')
    const results = ss.query('hello world')
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1]!.similarity).toBeGreaterThanOrEqual(results[i]!.similarity)
    }
  })

  it('clear resets', () => {
    const ss = new SimilaritySearch(50)
    ss.add('doc1', 'hello')
    ss.clear()
    expect(ss.isEmpty()).toBe(true)
  })
})
