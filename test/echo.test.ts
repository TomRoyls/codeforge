import { describe, expect, it } from 'vitest'

import {
  buildEchoResult,
  classifyEcho,
  classifyType,
  computeEchoStats,
  computeSimilarity,
  estimateSavings,
  extractBlocks,
  findErrorHandlingPatterns,
  findLoggingPatterns,
  findRepeatedBlocks,
  findRepeatedPatterns,
  findValidationPatterns,
  hashBlock,
  isExtractable,
  normalizeBlock,
  type Echo,
  type EchoOccurrence,
} from '../src/commands/echo-helpers.js'

import {
  formatDensityMeter,
  formatEchoJSON,
  formatEchoRow,
  formatEchoStats,
  formatEchoTable,
  formatEchoTableFull,
  formatOccurrences,
  formatRecommendations,
  getCategoryColor,
  getTypeIcon,
} from '../src/commands/echo-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const FILE_A = 'src/a.ts'
const FILE_B = 'src/b.ts'
const FILE_C = 'src/c.ts'

const TRY_CATCH_BLOCK = [
  'function processA(data) {',
  '  try {',
  '    const result = JSON.parse(data);',
  '    return result;',
  '  } catch (error) {',
  '    throw new Error("Parse failed: " + error.message);',
  '  }',
  '}',
].join('\n')

const VALIDATION_BLOCK = [
  'function validate(input) {',
  '  if (!input.name) { throw new Error("Name required"); }',
  '  if (!input.email) { throw new Error("Email required"); }',
  '  if (!input.age) { throw new Error("Age required"); }',
  '  return true;',
  '}',
].join('\n')

const LOGGING_BLOCK = [
  'function main() {',
  '  console.log("Starting process");',
  '  console.log("Step 1 complete");',
  '  console.log("Step 2 complete");',
  '  console.log("Step 3 complete");',
  '  console.log("Process finished");',
  '}',
].join('\n')

const DUPLICATE_BLOCK_3LINES = [
  'const timeout = setTimeout(() => {',
  '  console.log("tick");',
  '}, 1000);',
].join('\n')

const EMPTY_CONTENT = ''

const SINGLE_LINE = 'const x = 1;'

// ─── normalizeBlock ───────────────────────────────────────────────────────────

describe('normalizeBlock', () => {
  it('trims lines and removes blanks', () => {
    const result = normalizeBlock('  const x = 1;  \n\n  const y = 2;  ')
    expect(result).toBe('const x = 1;\nconst y = 2;')
  })

  it('strips single-line comments', () => {
    const result = normalizeBlock('// comment\nconst x = 1;')
    expect(result).toBe('const x = 1;')
  })

  it('strips block comment lines', () => {
    const result = normalizeBlock('/* block */\nconst x = 1;')
    expect(result).toBe('const x = 1;')
  })

  it('strips asterisk comment lines', () => {
    const result = normalizeBlock('* middle\nconst x = 1;')
    expect(result).toBe('const x = 1;')
  })

  it('returns empty for all-comment input', () => {
    const result = normalizeBlock('// line1\n// line2')
    expect(result).toBe('')
  })

  it('preserves code content', () => {
    const result = normalizeBlock('const x = 1;')
    expect(result).toBe('const x = 1;')
  })
})

// ─── hashBlock ────────────────────────────────────────────────────────────────

describe('hashBlock', () => {
  it('produces consistent hash for same content', () => {
    const h1 = hashBlock('const x = 1;')
    const h2 = hashBlock('const x = 1;')
    expect(h1).toBe(h2)
  })

  it('produces different hash for different content', () => {
    const h1 = hashBlock('const x = 1;')
    const h2 = hashBlock('const y = 2;')
    expect(h1).not.toBe(h2)
  })

  it('produces same hash for identical content', () => {
    const h1 = hashBlock('const x = 1;\nconst y = 2;')
    const h2 = hashBlock('const x = 1;\nconst y = 2;')
    expect(h1).toBe(h2)
  })

  it('returns 0 for empty string', () => {
    expect(hashBlock('')).toBe(0)
  })
})

// ─── extractBlocks ────────────────────────────────────────────────────────────

describe('extractBlocks', () => {
  it('extracts sliding window blocks', () => {
    const content = 'line1\nline2\nline3\nline4'
    const blocks = extractBlocks(content, 2, FILE_A)
    expect(blocks).toHaveLength(3)
    expect(blocks[0]!.lineStart).toBe(1)
    expect(blocks[0]!.lineEnd).toBe(2)
    expect(blocks[2]!.lineStart).toBe(3)
    expect(blocks[2]!.lineEnd).toBe(4)
  })

  it('returns empty for content shorter than window', () => {
    const blocks = extractBlocks('line1', 3, FILE_A)
    expect(blocks).toHaveLength(0)
  })

  it('detects function context', () => {
    const content = 'function myFunc() {\n  const x = 1;\n  return x;\n}'
    const blocks = extractBlocks(content, 2, FILE_A)
    expect(blocks[0]!.context).toBe('myFunc')
  })

  it('detects class context', () => {
    const content = 'class MyClass {\n  method() {\n    return 1;\n  }\n}'
    const blocks = extractBlocks(content, 2, FILE_A)
    expect(blocks.some((b) => b.context === 'MyClass')).toBe(true)
  })

  it('defaults to module context', () => {
    const content = 'const x = 1;\nconst y = 2;'
    const blocks = extractBlocks(content, 2, FILE_A)
    expect(blocks[0]!.context).toBe('<module>')
  })

  it('skips empty blocks', () => {
    const content = '\n\n\n'
    const blocks = extractBlocks(content, 2, FILE_A)
    expect(blocks).toHaveLength(0)
  })

  it('returns single block for exact fit', () => {
    const content = 'line1\nline2\nline3'
    const blocks = extractBlocks(content, 3, FILE_A)
    expect(blocks).toHaveLength(1)
  })
})

// ─── computeSimilarity ────────────────────────────────────────────────────────

describe('computeSimilarity', () => {
  it('returns 100 for identical blocks', () => {
    expect(computeSimilarity('const x = 1;', 'const x = 1;')).toBe(100)
  })

  it('returns 100 for identical normalized blocks', () => {
    expect(computeSimilarity('const x = 1;', 'const x = 1;')).toBe(100)
  })

  it('returns 0 for completely different blocks', () => {
    expect(computeSimilarity('const x = 1;', 'function hello() {}')).toBe(0)
  })

  it('returns high similarity for structurally similar code', () => {
    const block1 = 'const x = fetch(url);\nconst y = parse(x);'
    const block2 = 'const a = fetch(path);\nconst b = parse(a);'
    const sim = computeSimilarity(block1, block2)
    expect(sim).toBeGreaterThan(50)
  })

  it('returns 100 for both empty blocks', () => {
    expect(computeSimilarity('', '')).toBe(100)
  })

  it('returns 0 for one empty and one non-empty', () => {
    expect(computeSimilarity('const x = 1;', '')).toBe(0)
  })

  it('gives partial credit for partially similar code', () => {
    const block1 = 'if (x > 0) {\n  return true;\n}'
    const block2 = 'if (y < 10) {\n  log(y);\n}'
    const sim = computeSimilarity(block1, block2)
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(100)
  })
})

// ─── classifyEcho ─────────────────────────────────────────────────────────────

describe('classifyEcho', () => {
  it('classifies error handling patterns', () => {
    expect(classifyEcho('try {\n  const x = JSON.parse(data);\n} catch (e) {\n  throw new Error("fail");\n}')).toBe('error-handling')
  })

  it('classifies catch patterns', () => {
    expect(classifyEcho('catch (error) {\n  log(error);\n}')).toBe('error-handling')
  })

  it('classifies validation patterns', () => {
    expect(classifyEcho('if (!name) {\n  return null;\n}')).toBe('validation')
  })

  it('classifies null check patterns', () => {
    expect(classifyEcho('if (x === null) {\n  return;\n}')).toBe('validation')
  })

  it('classifies configuration patterns', () => {
    expect(classifyEcho('const config = {\n  host: "localhost",\n  port: 3000\n};')).toBe('configuration')
  })

  it('classifies console.log as boilerplate', () => {
    expect(classifyEcho('console.log("hello");')).toBe('boilerplate')
  })

  it('defaults to pattern', () => {
    expect(classifyEcho('const x = compute(a, b);')).toBe('pattern')
  })
})

// ─── classifyType ─────────────────────────────────────────────────────────────

describe('classifyType', () => {
  it('returns exact for 100', () => {
    expect(classifyType(100)).toBe('exact')
  })

  it('returns exact for 100+', () => {
    expect(classifyType(105)).toBe('exact')
  })

  it('returns structural for 70-99', () => {
    expect(classifyType(70)).toBe('structural')
    expect(classifyType(95)).toBe('structural')
  })

  it('returns semantic for <70', () => {
    expect(classifyType(69)).toBe('semantic')
    expect(classifyType(0)).toBe('semantic')
  })
})

// ─── isExtractable ────────────────────────────────────────────────────────────

describe('isExtractable', () => {
  const makeEcho = (overrides: Partial<Echo> = {}): Echo => ({
    id: 'test',
    pattern: 'test pattern',
    occurrences: [],
    count: 2,
    similarity: 80,
    type: 'exact',
    category: 'pattern',
    extractable: false,
    estimatedSavings: 0,
    ...overrides,
  })

  it('returns false for count < 2', () => {
    expect(isExtractable(makeEcho({ count: 1 }))).toBe(false)
  })

  it('returns true for configuration with count >= 2', () => {
    expect(isExtractable(makeEcho({ category: 'configuration', count: 2 }))).toBe(true)
  })

  it('returns true for error-handling with occurrences >= 2', () => {
    const occs: EchoOccurrence[] = [
      { file: 'a.ts', lineStart: 1, lineEnd: 5, code: 'try {}', context: 'fn1' },
      { file: 'b.ts', lineStart: 1, lineEnd: 5, code: 'try {}', context: 'fn2' },
    ]
    expect(isExtractable(makeEcho({ category: 'error-handling', occurrences: occs, count: 2 }))).toBe(true)
  })

  it('returns true for validation with occurrences >= 2', () => {
    const occs: EchoOccurrence[] = [
      { file: 'a.ts', lineStart: 1, lineEnd: 3, code: 'if (!x)', context: 'fn1' },
      { file: 'b.ts', lineStart: 1, lineEnd: 3, code: 'if (!y)', context: 'fn2' },
    ]
    expect(isExtractable(makeEcho({ category: 'validation', occurrences: occs, count: 2 }))).toBe(true)
  })

  it('returns true for exact type with occurrences >= 2', () => {
    const occs: EchoOccurrence[] = [
      { file: 'a.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn1' },
      { file: 'b.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn2' },
    ]
    expect(isExtractable(makeEcho({ type: 'exact', occurrences: occs, count: 2 }))).toBe(true)
  })

  it('returns true for high similarity with occurrences >= 3', () => {
    const occs: EchoOccurrence[] = [
      { file: 'a.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn1' },
      { file: 'b.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn2' },
      { file: 'c.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn3' },
    ]
    expect(isExtractable(makeEcho({ similarity: 80, occurrences: occs, count: 3 }))).toBe(true)
  })
})

// ─── estimateSavings ──────────────────────────────────────────────────────────

describe('estimateSavings', () => {
  it('computes (count - 1) × lines per occurrence', () => {
    const echo: Echo = {
      id: 'test',
      pattern: 'test',
      occurrences: [
        { file: 'a.ts', lineStart: 1, lineEnd: 4, code: 'line1\nline2\nline3', context: 'fn' },
        { file: 'b.ts', lineStart: 1, lineEnd: 4, code: 'line1\nline2\nline3', context: 'fn' },
        { file: 'c.ts', lineStart: 1, lineEnd: 4, code: 'line1\nline2\nline3', context: 'fn' },
      ],
      count: 3,
      similarity: 100,
      type: 'exact',
      category: 'pattern',
      extractable: true,
      estimatedSavings: 0,
    }
    expect(estimateSavings(echo)).toBe(6)
  })

  it('returns 0 for empty occurrences', () => {
    const echo: Echo = {
      id: 'test', pattern: 'test', occurrences: [], count: 0, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 0,
    }
    expect(estimateSavings(echo)).toBe(0)
  })

  it('returns 0 for single occurrence', () => {
    const echo: Echo = {
      id: 'test', pattern: 'test', occurrences: [{ file: 'a.ts', lineStart: 1, lineEnd: 3, code: 'line1\nline2', context: 'fn' }], count: 1, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 0,
    }
    expect(estimateSavings(echo)).toBe(0)
  })
})

// ─── findErrorHandlingPatterns ────────────────────────────────────────────────

describe('findErrorHandlingPatterns', () => {
  it('detects repeated try-catch blocks', () => {
    const content = [
      'function a() { try { x(); } catch (e) { log(e); } }',
      'function b() { try { y(); } catch (e) { log(e); } }',
    ].join('\n')
    const echoes = findErrorHandlingPatterns(content, FILE_A)
    expect(echoes.length).toBeGreaterThanOrEqual(1)
    expect(echoes[0]!.category).toBe('error-handling')
    expect(echoes[0]!.count).toBe(2)
  })

  it('returns empty for no try-catch', () => {
    const echoes = findErrorHandlingPatterns('const x = 1;', FILE_A)
    expect(echoes).toHaveLength(0)
  })

  it('marks extractable when count >= 3', () => {
    const content = [
      'function a() { try { x(); } catch (e) {} }',
      'function b() { try { y(); } catch (e) {} }',
      'function c() { try { z(); } catch (e) {} }',
    ].join('\n')
    const echoes = findErrorHandlingPatterns(content, FILE_A)
    expect(echoes[0]!.extractable).toBe(true)
  })
})

// ─── findValidationPatterns ───────────────────────────────────────────────────

describe('findValidationPatterns', () => {
  it('detects repeated guard clauses', () => {
    const echoes = findValidationPatterns(VALIDATION_BLOCK, FILE_A)
    expect(echoes.length).toBeGreaterThanOrEqual(1)
    expect(echoes[0]!.category).toBe('validation')
    expect(echoes[0]!.count).toBeGreaterThanOrEqual(3)
  })

  it('returns empty for no guards', () => {
    const echoes = findValidationPatterns('const x = 1;', FILE_A)
    expect(echoes).toHaveLength(0)
  })
})

// ─── findLoggingPatterns ──────────────────────────────────────────────────────

describe('findLoggingPatterns', () => {
  it('detects repeated console.log patterns', () => {
    const echoes = findLoggingPatterns(LOGGING_BLOCK, FILE_A)
    expect(echoes.length).toBeGreaterThanOrEqual(1)
    expect(echoes[0]!.category).toBe('boilerplate')
    expect(echoes[0]!.count).toBeGreaterThanOrEqual(5)
  })

  it('returns empty for no logging', () => {
    const echoes = findLoggingPatterns('const x = 1;', FILE_A)
    expect(echoes).toHaveLength(0)
  })

  it('returns empty for fewer than 3 logs', () => {
    const content = 'console.log("a");\nconsole.log("b");'
    const echoes = findLoggingPatterns(content, FILE_A)
    expect(echoes).toHaveLength(0)
  })

  it('detects console.warn and console.error', () => {
    const content = 'console.warn("a");\nconsole.error("b");\nconsole.log("c");'
    const echoes = findLoggingPatterns(content, FILE_A)
    expect(echoes.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── findRepeatedPatterns ─────────────────────────────────────────────────────

describe('findRepeatedPatterns', () => {
  it('finds all pattern types combined', () => {
    const content = [
      'function a() {',
      '  try { JSON.parse(x); } catch (e) { log(e); }',
      '  try { JSON.parse(y); } catch (e) { log(e); }',
      '  if (!x) { return null; }',
      '  if (!y) { return null; }',
      '  console.log("done");',
      '  console.log("ok");',
      '  console.log("fin");',
      '}',
    ].join('\n')
    const echoes = findRepeatedPatterns(content, FILE_A)
    const categories = new Set(echoes.map((e) => e.category))
    expect(categories.size).toBeGreaterThanOrEqual(2)
  })
})

// ─── findRepeatedBlocks ───────────────────────────────────────────────────────

describe('findRepeatedBlocks', () => {
  it('finds exact duplicate blocks across files', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const echoes = findRepeatedBlocks(
      [FILE_A, FILE_B, FILE_C],
      [block, block, block],
      3,
    )
    const exactEchoes = echoes.filter((e) => e.type === 'exact')
    expect(exactEchoes.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty when no duplicates meet threshold', () => {
    const echoes = findRepeatedBlocks(
      [FILE_A, FILE_B],
      ['const a = 1;', 'const b = 2;'],
      3,
    )
    expect(echoes).toHaveLength(0)
  })

  it('respects threshold parameter', () => {
    const block = 'line1\nline2\nline3'
    const echoes2 = findRepeatedBlocks([FILE_A, FILE_B], [block, block], 3)
    expect(echoes2).toHaveLength(0)

    const echoes1 = findRepeatedBlocks([FILE_A, FILE_B], [block, block], 2)
    expect(echoes1.length).toBeGreaterThanOrEqual(1)
  })

  it('computes estimated savings', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const echoes = findRepeatedBlocks(
      [FILE_A, FILE_B, FILE_C],
      [block, block, block],
      3,
    )
    for (const echo of echoes) {
      expect(echo.estimatedSavings).toBeGreaterThanOrEqual(0)
    }
  })
})

// ─── computeEchoStats ─────────────────────────────────────────────────────────

describe('computeEchoStats', () => {
  it('computes stats for empty echoes', () => {
    const stats = computeEchoStats([], 100)
    expect(stats.totalEchoes).toBe(0)
    expect(stats.exactDuplicates).toBe(0)
    expect(stats.echoDensity).toBe(0)
    expect(stats.mostCommonEcho).toBe('')
    expect(stats.mostExpensiveEcho).toBe('')
  })

  it('counts exact vs structural/semantic', () => {
    const echoes: Echo[] = [
      { id: '1', pattern: 'a', occurrences: [], count: 2, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 5 },
      { id: '2', pattern: 'b', occurrences: [], count: 2, similarity: 80, type: 'structural', category: 'pattern', extractable: false, estimatedSavings: 3 },
      { id: '3', pattern: 'c', occurrences: [], count: 2, similarity: 50, type: 'semantic', category: 'pattern', extractable: false, estimatedSavings: 1 },
    ]
    const stats = computeEchoStats(echoes, 100)
    expect(stats.exactDuplicates).toBe(1)
    expect(stats.structuralSimilarities).toBe(2)
  })

  it('computes echo density', () => {
    const echoes: Echo[] = [
      { id: '1', pattern: 'a', occurrences: [{ file: 'a.ts', lineStart: 1, lineEnd: 5, code: 'line1\nline2\nline3\nline4', context: 'fn' }], count: 1, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 0 },
    ]
    const stats = computeEchoStats(echoes, 10)
    expect(stats.echoDensity).toBe(40)
  })

  it('finds most common and most expensive', () => {
    const echoes: Echo[] = [
      { id: '1', pattern: 'common', occurrences: [], count: 10, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 5 },
      { id: '2', pattern: 'expensive', occurrences: [], count: 2, similarity: 80, type: 'structural', category: 'pattern', extractable: false, estimatedSavings: 50 },
    ]
    const stats = computeEchoStats(echoes, 100)
    expect(stats.mostCommonEcho).toBe('common')
    expect(stats.mostExpensiveEcho).toBe('expensive')
  })

  it('handles zero total lines', () => {
    const stats = computeEchoStats([], 0)
    expect(stats.echoDensity).toBe(0)
  })
})

// ─── generateEchoRecommendations ──────────────────────────────────────────────

describe('generateEchoRecommendations via buildEchoResult', () => {
  it('recommends extracting exact duplicates', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const result = buildEchoResult([FILE_A, FILE_B, FILE_C], [block, block, block], { threshold: 2 })
    const recs = result.recommendations
    expect(recs.some((r) => r.includes('duplicate') || r.includes('shared'))).toBe(true)
  })

  it('says clean when no echoes found', () => {
    const result = buildEchoResult([FILE_A], ['const x = 1;'])
    expect(result.recommendations.some((r) => r.includes('clean') || r.includes('No significant'))).toBe(true)
  })
})

// ─── buildEchoResult ──────────────────────────────────────────────────────────

describe('buildEchoResult', () => {
  it('returns empty result for empty input', () => {
    const result = buildEchoResult([], [])
    expect(result.echoes).toHaveLength(0)
    expect(result.stats.totalEchoes).toBe(0)
    expect(result.topEchoes).toHaveLength(0)
  })

  it('returns echoes for duplicate code', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const result = buildEchoResult(
      [FILE_A, FILE_B, FILE_C],
      [block, block, block],
      { threshold: 3 },
    )
    expect(result.echoes.length).toBeGreaterThanOrEqual(1)
    expect(result.topEchoes).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sorts topEchoes by savings', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const result = buildEchoResult(
      [FILE_A, FILE_B, FILE_C],
      [block, block, block],
      { threshold: 3 },
    )
    if (result.topEchoes.length > 1) {
      for (let i = 1; i < result.topEchoes.length; i++) {
        expect(result.topEchoes[i - 1]!.estimatedSavings).toBeGreaterThanOrEqual(result.topEchoes[i]!.estimatedSavings)
      }
    }
  })

  it('uses default threshold of 3', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const result = buildEchoResult([FILE_A, FILE_B], [block, block])
    expect(result.stats.totalEchoes).toBe(0)
  })

  it('finds pattern echoes (error handling, validation)', () => {
    const content = TRY_CATCH_BLOCK + '\n' + VALIDATION_BLOCK
    const result = buildEchoResult([FILE_A], [content])
    expect(result.echoes.length).toBeGreaterThanOrEqual(1)
  })

  it('computes stats correctly', () => {
    const block = DUPLICATE_BLOCK_3LINES
    const result = buildEchoResult(
      [FILE_A, FILE_B, FILE_C],
      [block, block, block],
      { threshold: 3 },
    )
    expect(result.stats.totalEchoes).toBeGreaterThanOrEqual(1)
    expect(result.stats.estimatedSavings).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getCategoryColor', () => {
  it('returns function for all categories', () => {
    const categories = ['boilerplate', 'error-handling', 'validation', 'configuration', 'pattern'] as const
    for (const cat of categories) {
      const fn = getCategoryColor(cat)
      expect(typeof fn).toBe('function')
      expect(typeof fn('test')).toBe('string')
    }
  })
})

describe('getTypeIcon', () => {
  it('returns icon for each type', () => {
    expect(typeof getTypeIcon('exact')).toBe('string')
    expect(typeof getTypeIcon('structural')).toBe('string')
    expect(typeof getTypeIcon('semantic')).toBe('string')
  })

  it('returns distinct icons per type', () => {
    const icons = new Set([getTypeIcon('exact'), getTypeIcon('structural'), getTypeIcon('semantic')])
    expect(icons.size).toBe(3)
  })
})

describe('formatDensityMeter', () => {
  it('renders density bar', () => {
    const result = formatDensityMeter(50)
    expect(result).toContain('Density')
    expect(result).toContain('50%')
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('renders full bar at 100%', () => {
    const result = formatDensityMeter(100)
    expect(result).toContain('100%')
  })

  it('renders empty bar at 0%', () => {
    const result = formatDensityMeter(0)
    expect(result).toContain('0%')
  })
})

describe('formatEchoRow', () => {
  it('formats a complete echo row', () => {
    const echo: Echo = {
      id: 'test',
      pattern: 'const x = fetch(url);',
      occurrences: [],
      count: 5,
      similarity: 90,
      type: 'structural',
      category: 'pattern',
      extractable: true,
      estimatedSavings: 12,
    }
    const row = formatEchoRow(echo)
    expect(row).toContain('const x = fetch(url);')
    expect(row).toContain('5')
    expect(row).toContain('90%')
  })
})

describe('formatEchoTable', () => {
  it('renders table with echoes', () => {
    const echoes: Echo[] = [
      { id: '1', pattern: 'test', occurrences: [], count: 3, similarity: 100, type: 'exact', category: 'pattern', extractable: true, estimatedSavings: 10 },
    ]
    const table = formatEchoTable(echoes)
    expect(table).toContain('Echo Analysis')
    expect(table).toContain('test')
  })

  it('shows no echoes message for empty', () => {
    const table = formatEchoTable([])
    expect(table).toContain('No echoes detected')
  })
})

describe('formatEchoStats', () => {
  it('renders stats', () => {
    const stats = {
      totalEchoes: 5,
      exactDuplicates: 2,
      structuralSimilarities: 3,
      totalRepetition: 50,
      estimatedSavings: 20,
      mostCommonEcho: 'try-catch',
      mostExpensiveEcho: 'validation',
      echoDensity: 15,
    }
    const result = formatEchoStats(stats)
    expect(result).toContain('Total echoes')
    expect(result).toContain('5')
    expect(result).toContain('try-catch')
    expect(result).toContain('validation')
  })
})

describe('formatOccurrences', () => {
  it('renders occurrence list', () => {
    const echo: Echo = {
      id: 'test',
      pattern: 'test',
      occurrences: [
        { file: 'a.ts', lineStart: 1, lineEnd: 3, code: 'x', context: 'fn1' },
        { file: 'b.ts', lineStart: 5, lineEnd: 7, code: 'x', context: 'fn2' },
      ],
      count: 2,
      similarity: 100,
      type: 'exact',
      category: 'pattern',
      extractable: true,
      estimatedSavings: 4,
    }
    const result = formatOccurrences(echo)
    expect(result).toContain('Occurrences')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })

  it('returns empty for no occurrences', () => {
    const echo: Echo = {
      id: 'test', pattern: 'test', occurrences: [], count: 0, similarity: 100, type: 'exact', category: 'pattern', extractable: false, estimatedSavings: 0,
    }
    expect(formatOccurrences(echo)).toBe('')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const result = formatRecommendations(['Do this', 'Do that'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('1. Do this')
    expect(result).toContain('2. Do that')
  })

  it('shows no recommendations for empty', () => {
    const result = formatRecommendations([])
    expect(result).toContain('No recommendations')
  })
})

describe('formatEchoTableFull', () => {
  it('renders full output with all sections', () => {
    const result = buildEchoResult(
      [FILE_A, FILE_B, FILE_C],
      [DUPLICATE_BLOCK_3LINES, DUPLICATE_BLOCK_3LINES, DUPLICATE_BLOCK_3LINES],
      { threshold: 3 },
    )
    const output = formatEchoTableFull(result)
    expect(output).toContain('Code Echo Analysis')
    expect(output).toContain('Density')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })
})

describe('formatEchoJSON', () => {
  it('renders valid JSON', () => {
    const result = buildEchoResult([FILE_A], [SINGLE_LINE])
    const json = formatEchoJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.echoes).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.topEchoes).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
