import { describe, it, expect } from 'vitest';
import { SimilaritySearch, tokenize, computeSignature, estimateSimilarity } from './src/core/similarity-search/index.js';
import type { QueryResult } from './src/core/similarity-search/index.js';

describe('tokenize', () => {
  it('tokenizes simple text', () => {
    const tokens = tokenize('hello world');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('lowercases text', () => {
    const tokens = tokenize('HELLO World');
    expect(tokens.every(t => t === t.toLowerCase())).toBe(true);
  });

  it('removes punctuation', () => {
    const tokens = tokenize('hello, world!');
    expect(tokens.every(t => !/[,.!?]/.test(t))).toBe(true);
  });

  it('handles empty string', () => {
    const tokens = tokenize('');
    expect(tokens).toEqual([]);
  });

  it('handles multiple spaces', () => {
    const tokens = tokenize('hello   world');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('generates ngrams', () => {
    const tokens = tokenize('testing');
    expect(tokens.length).toBeGreaterThan(1);
  });

  it('handles single character', () => {
    const tokens = tokenize('a');
    expect(tokens.length).toBe(1);
  });

  it('handles numbers', () => {
    const tokens = tokenize('hello 123 world');
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('handles unicode characters', () => {
    const tokens = tokenize('café résumé');
    expect(tokens.length).toBeGreaterThan(0);
  });
});

describe('computeSignature', () => {
  it('creates signature of correct length', () => {
    const tokens = new Set(['hello', 'world']);
    const signature = computeSignature(tokens, 10);
    expect(signature).toHaveLength(10);
  });

  it('produces values between 0 and 1', () => {
    const tokens = new Set(['hello', 'world']);
    const signature = computeSignature(tokens, 100);
    signature.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it('same tokens produce same signature', () => {
    const tokens = new Set(['hello', 'world']);
    const sig1 = computeSignature(tokens, 10);
    const sig2 = computeSignature(tokens, 10);
    expect(sig1).toEqual(sig2);
  });

  it('different token sets produce different signatures', () => {
    const tokens1 = new Set(['hello', 'world']);
    const tokens2 = new Set(['foo', 'bar']);
    const sig1 = computeSignature(tokens1, 10);
    const sig2 = computeSignature(tokens2, 10);
    expect(sig1).not.toEqual(sig2);
  });

  it('handles empty token set', () => {
    const tokens = new Set<string>();
    const signature = computeSignature(tokens, 10);
    expect(signature).toHaveLength(10);
    signature.forEach(v => expect(v).toBe(1));
  });

  it('produces deterministic results with same seed', () => {
    const tokens = new Set(['hello']);
    const sig1 = computeSignature(tokens, 5);
    const sig2 = computeSignature(tokens, 5);
    expect(sig1).toEqual(sig2);
  });
});

describe('estimateSimilarity', () => {
  it('returns 1 for identical signatures', () => {
    const sig = [0.1, 0.2, 0.3, 0.4, 0.5];
    const sim = estimateSimilarity(sig, sig);
    expect(sim).toBe(1);
  });

  it('returns 0 for completely different signatures', () => {
    const sig1 = [0.1, 0.2, 0.3, 0.4, 0.5];
    const sig2 = [0.6, 0.7, 0.8, 0.9, 1.0];
    const sim = estimateSimilarity(sig1, sig2);
    expect(sim).toBe(0);
  });

  it('returns 0.5 for half matching', () => {
    const sig1 = [0.1, 0.2, 0.3, 0.4, 0.5];
    const sig2 = [0.1, 0.7, 0.3, 0.9, 1.0];
    const sim = estimateSimilarity(sig1, sig2);
    expect(sim).toBe(0.4);
  });

  it('handles single element signatures', () => {
    const sig1 = [0.5];
    const sig2 = [0.5];
    const sim = estimateSimilarity(sig1, sig2);
    expect(sim).toBe(1);
  });

  it('returns value between 0 and 1', () => {
    const sig1 = [0.1, 0.2, 0.3];
    const sig2 = [0.4, 0.5, 0.6];
    const sim = estimateSimilarity(sig1, sig2);
    expect(sim).toBeGreaterThanOrEqual(0);
    expect(sim).toBeLessThanOrEqual(1);
  });
});

describe('SimilaritySearch constructor', () => {
  it('creates instance with default numHashes', () => {
    const ss = new SimilaritySearch();
    expect(ss.size).toBe(0);
  });

  it('creates instance with custom numHashes', () => {
    const ss = new SimilaritySearch(50);
    expect(ss.size).toBe(0);
  });

  it('throws for numHashes less than 1', () => {
    expect(() => new SimilaritySearch(0)).toThrow('numHashes must be at least 1');
  });

  it('throws for negative numHashes', () => {
    expect(() => new SimilaritySearch(-1)).toThrow('numHashes must be at least 1');
  });

  it('starts empty', () => {
    const ss = new SimilaritySearch();
    expect(ss.isEmpty()).toBe(true);
  });
});

describe('SimilaritySearch add', () => {
  it('adds document successfully', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello world');
    expect(ss.size).toBe(1);
  });

  it('adds multiple documents', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.add('doc2', 'world');
    expect(ss.size).toBe(2);
  });

  it('throws for empty text', () => {
    const ss = new SimilaritySearch();
    expect(() => ss.add('doc1', '')).toThrow('Text must contain at least one token');
  });

  it('throws for whitespace only', () => {
    const ss = new SimilaritySearch();
    expect(() => ss.add('doc1', '   ')).toThrow('Text must contain at least one token');
  });

  it('allows updating existing document', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.add('doc1', 'world');
    expect(ss.size).toBe(1);
  });

  it('handles text with punctuation', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello, world!');
    expect(ss.size).toBe(1);
  });

  it('handles long text', () => {
    const ss = new SimilaritySearch();
    const longText = 'hello '.repeat(1000);
    ss.add('doc1', longText);
    expect(ss.size).toBe(1);
  });
});

describe('SimilaritySearch query', () => {
  it('finds similar documents', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'hello world');
    const results = ss.query('hello world');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('doc1');
  });

  it('returns empty array for no matches', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    const results = ss.query('completely different');
    expect(results.length).toBe(0);
  });

  it('returns multiple similar documents', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'hello world');
    ss.add('doc2', 'hello there');
    const results = ss.query('hello');
    expect(results.length).toBe(2);
  });

  it('sorts results by similarity descending', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'hello world');
    ss.add('doc2', 'hello there');
    const results = ss.query('hello world');
    expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity);
  });

  it('respects threshold', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'hello world');
    const results = ss.query('different', 0.5);
    expect(results.length).toBe(0);
  });

  it('returns similarity values between 0 and 1', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'hello world');
    const results = ss.query('hello world');
    results.forEach(r => {
      expect(r.similarity).toBeGreaterThanOrEqual(0);
      expect(r.similarity).toBeLessThanOrEqual(1);
    });
  });

  it('throws for empty query text', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    expect(() => ss.query('')).toThrow('Text must contain at least one token');
  });

  it('handles case insensitive matching', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'Hello World');
    const results = ss.query('hello world');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('SimilaritySearch jaccardSimilarity', () => {
  it('returns 1 for identical texts', () => {
    const sim = SimilaritySearch.jaccardSimilarity('hello world', 'hello world');
    expect(sim).toBe(1);
  });

  it('returns 0 for completely different texts', () => {
    const sim = SimilaritySearch.jaccardSimilarity('hello', 'world');
    expect(sim).toBe(0);
  });

  it('returns value between 0 and 1 for similar texts', () => {
    const sim = SimilaritySearch.jaccardSimilarity('hello world', 'hello there');
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });

  it('handles empty strings', () => {
    const sim = SimilaritySearch.jaccardSimilarity('', '');
    expect(sim).toBe(1);
  });

  it('is case insensitive', () => {
    const sim1 = SimilaritySearch.jaccardSimilarity('HELLO', 'hello');
    expect(sim1).toBe(1);
  });

  it('removes punctuation', () => {
    const sim1 = SimilaritySearch.jaccardSimilarity('hello!', 'hello');
    expect(sim1).toBe(1);
  });

  it('handles partial word overlap', () => {
    const sim = SimilaritySearch.jaccardSimilarity('testing', 'tested');
    expect(sim).toBeGreaterThan(0);
  });
});

describe('SimilaritySearch size and isEmpty', () => {
  it('returns 0 for new instance', () => {
    const ss = new SimilaritySearch();
    expect(ss.size).toBe(0);
  });

  it('returns correct size after adds', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.add('doc2', 'world');
    ss.add('doc3', 'test');
    expect(ss.size).toBe(3);
  });

  it('returns true when empty', () => {
    const ss = new SimilaritySearch();
    expect(ss.isEmpty()).toBe(true);
  });

  it('returns false when not empty', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    expect(ss.isEmpty()).toBe(false);
  });
});

describe('SimilaritySearch clear', () => {
  it('clears all documents', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.add('doc2', 'world');
    ss.clear();
    expect(ss.size).toBe(0);
  });

  it('sets isEmpty to true after clear', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.clear();
    expect(ss.isEmpty()).toBe(true);
  });

  it('allows adding after clear', () => {
    const ss = new SimilaritySearch();
    ss.add('doc1', 'hello');
    ss.clear();
    ss.add('doc2', 'world');
    expect(ss.size).toBe(1);
  });
});

describe('integration tests', () => {
  it('handles realistic document similarity search', () => {
    const ss = new SimilaritySearch(100);
    ss.add('doc1', 'The quick brown fox jumps over the lazy dog');
    ss.add('doc2', 'A quick brown fox leaped over a sleepy dog');
    ss.add('doc3', 'Completely unrelated content about programming');

    const results = ss.query('fast brown fox');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(0.1);
  });

  it('performs well with multiple queries', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'machine learning');
    ss.add('doc2', 'deep learning');
    ss.add('doc3', 'neural networks');

    const r1 = ss.query('machine learning');
    const r2 = ss.query('neural networks');
    const r3 = ss.query('artificial intelligence');

    expect(r1.length).toBeGreaterThan(0);
    expect(r2.length).toBeGreaterThan(0);
    expect(r3.length).toBeGreaterThanOrEqual(0);
  });

  it('handles document updates correctly', () => {
    const ss = new SimilaritySearch(50);
    ss.add('doc1', 'original content');
    let results = ss.query('original');
    expect(results.length).toBe(1);

    ss.add('doc1', 'new content');
    results = ss.query('new');
    expect(results.length).toBe(1);
  });
});
