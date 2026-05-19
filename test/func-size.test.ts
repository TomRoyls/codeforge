import { describe, expect, it } from 'vitest'

import {
  buildFuncSizeResult,
  classifySize,
  computeDistribution,
  computeFileStats,
  computeNestingDepth,
  countParameters,
  estimateComplexity,
  extractFunctions,
  findOversized,
  generateRecommendations,
  type FunctionInfo,
  type SizeDistribution,
} from '../src/commands/func-size-helpers.js'

import {
  formatDistribution,
  formatFuncSizeCsv,
  formatFuncSizeJson,
  formatFuncSizeTable,
  formatOversizedRow,
  horizontalBar,
  sizeCategoryColor,
} from '../src/commands/func-size-format-helpers.js'

// ─── Size Classification ──────────────────────────────────────────────────────

describe('classifySize', () => {
  it('classifies 1-5 lines as tiny', () => {
    expect(classifySize(1)).toBe('tiny')
    expect(classifySize(3)).toBe('tiny')
    expect(classifySize(5)).toBe('tiny')
  })

  it('classifies 6-15 lines as small', () => {
    expect(classifySize(6)).toBe('small')
    expect(classifySize(10)).toBe('small')
    expect(classifySize(15)).toBe('small')
  })

  it('classifies 16-30 lines as medium', () => {
    expect(classifySize(16)).toBe('medium')
    expect(classifySize(25)).toBe('medium')
    expect(classifySize(30)).toBe('medium')
  })

  it('classifies 31-60 lines as large', () => {
    expect(classifySize(31)).toBe('large')
    expect(classifySize(45)).toBe('large')
    expect(classifySize(60)).toBe('large')
  })

  it('classifies 60+ lines as huge', () => {
    expect(classifySize(61)).toBe('huge')
    expect(classifySize(100)).toBe('huge')
  })
})

// ─── Parameter Counting ───────────────────────────────────────────────────────

describe('countParameters', () => {
  it('counts zero parameters', () => {
    expect(countParameters('()')).toBe(0)
  })

  it('counts one parameter', () => {
    expect(countParameters('(x: number)')).toBe(1)
  })

  it('counts multiple parameters', () => {
    expect(countParameters('(a: string, b: number)')).toBe(2)
    expect(countParameters('(a: string, b: number, c: boolean)')).toBe(3)
  })

  it('handles rest parameters', () => {
    expect(countParameters('(...args: string[])')).toBe(1)
  })

  it('handles nested types', () => {
    expect(countParameters('(fn: (a: string, b: number) => void)')).toBe(1)
  })

  it('handles empty string', () => {
    expect(countParameters('')).toBe(0)
  })
})

// ─── Nesting Depth ────────────────────────────────────────────────────────────

describe('computeNestingDepth', () => {
  it('returns 0 for flat code', () => {
    expect(computeNestingDepth('return 1')).toBe(0)
  })

  it('counts single level', () => {
    expect(computeNestingDepth('{ return 1 }')).toBe(1)
  })

  it('counts multiple levels', () => {
    expect(computeNestingDepth('{ if (x) { return 1 } }')).toBe(2)
  })

  it('counts deep nesting', () => {
    expect(computeNestingDepth('{ { { { } } } }')).toBe(4)
  })
})

// ─── Complexity Estimation ────────────────────────────────────────────────────

describe('estimateComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(estimateComplexity('return 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(estimateComplexity('if (x) { foo() }')).toBe(2)
  })

  it('counts for loops', () => {
    expect(estimateComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(estimateComplexity('if (a && b || c) {}')).toBe(4)
  })

  it('counts mixed constructs', () => {
    expect(estimateComplexity('for (let i = 0; i < 10; i++) { if (x) {} }')).toBe(3)
  })

  it('counts catch blocks', () => {
    expect(estimateComplexity('try {} catch(e) {}')).toBe(2)
  })
})

// ─── Function Extraction ──────────────────────────────────────────────────────

describe('extractFunctions', () => {
  it('extracts named functions', () => {
    const code = 'function foo() {\n  return 1\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((f) => f.name === 'foo')).toBe(true)
  })

  it('extracts exported functions', () => {
    const code = 'export function bar() {\n  return 2\n}'
    const fns = extractFunctions(code, 'test.ts')
    const bar = fns.find((f) => f.name === 'bar')
    expect(bar).toBeDefined()
    expect(bar?.isExported).toBe(true)
  })

  it('extracts async functions', () => {
    const code = 'async function fetchData() {\n  await fetch("/")\n}'
    const fns = extractFunctions(code, 'test.ts')
    const fetchFn = fns.find((f) => f.name === 'fetchData')
    expect(fetchFn).toBeDefined()
    expect(fetchFn?.isAsync).toBe(true)
  })

  it('extracts arrow functions', () => {
    const code = 'const add = (a: number, b: number) => {\n  return a + b\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((f) => f.name === 'add' && f.type === 'arrow')).toBe(true)
  })

  it('extracts arrow with single param', () => {
    const code = 'const double = x => {\n  return x * 2\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((f) => f.name === 'double')).toBe(true)
  })

  it('detects function type', () => {
    const code = 'function foo() {\n  return 1\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns[0]?.type).toBe('function')
  })

  it('detects arrow type', () => {
    const code = 'const fn = () => {\n  return 1\n}'
    const fns = extractFunctions(code, 'test.ts')
    const fn = fns.find((f) => f.name === 'fn')
    expect(fn?.type).toBe('arrow')
  })

  it('computes line count correctly', () => {
    const code = 'function big() {\n  const x = 1\n  const y = 2\n  return x + y\n}'
    const fns = extractFunctions(code, 'test.ts')
    const big = fns.find((f) => f.name === 'big')
    expect(big?.lineCount).toBe(5)
  })

  it('counts parameters', () => {
    const code = 'function foo(a: string, b: number) {\n  return a + b\n}'
    const fns = extractFunctions(code, 'test.ts')
    const foo = fns.find((f) => f.name === 'foo')
    expect(foo?.parameterCount).toBe(2)
  })

  it('handles multi-line function', () => {
    const lines = [
      'function process(',
      '  input: string,',
      '  options: Config',
      ') {',
      '  return input',
      '}',
    ]
    const fns = extractFunctions(lines.join('\n'), 'test.ts')
    expect(fns.some((f) => f.name === 'process')).toBe(true)
  })

  it('handles nested braces', () => {
    const code = 'function outer() {\n  if (true) {\n    return 1\n  }\n  return 0\n}'
    const fns = extractFunctions(code, 'test.ts')
    const outer = fns.find((f) => f.name === 'outer')
    expect(outer?.lineCount).toBe(6)
  })

  it('handles empty file', () => {
    expect(extractFunctions('', 'test.ts')).toEqual([])
  })

  it('handles no functions', () => {
    expect(extractFunctions('const x = 1', 'test.ts')).toEqual([])
  })

  it('extracts class methods', () => {
    const code = 'class Foo {\n  bar() {\n    return 1\n  }\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((f) => f.name === 'bar' && f.type === 'method')).toBe(true)
  })

  it('extracts constructor', () => {
    const code = 'class Foo {\n  constructor(x: number) {\n    this.x = x\n  }\n}'
    const fns = extractFunctions(code, 'test.ts')
    expect(fns.some((f) => f.name === 'constructor')).toBe(true)
  })
})

// ─── Distribution ─────────────────────────────────────────────────────────────

describe('computeDistribution', () => {
  const makeFn = (lineCount: number): FunctionInfo => ({
    name: 'fn',
    file: 'test.ts',
    lineStart: 1,
    lineEnd: lineCount,
    lineCount,
    parameterCount: 0,
    nestingDepth: 0,
    complexity: 1,
    isExported: false,
    isAsync: false,
    type: 'function',
    sizeCategory: classifySize(lineCount),
  })

  it('computes distribution from functions', () => {
    const fns = [makeFn(3), makeFn(10), makeFn(25), makeFn(45), makeFn(80)]
    const dist = computeDistribution(fns)
    expect(dist.tiny).toBe(1)
    expect(dist.small).toBe(1)
    expect(dist.medium).toBe(1)
    expect(dist.large).toBe(1)
    expect(dist.huge).toBe(1)
    expect(dist.total).toBe(5)
  })

  it('computes average', () => {
    const fns = [makeFn(10), makeFn(20)]
    const dist = computeDistribution(fns)
    expect(dist.average).toBe(15)
  })

  it('computes median', () => {
    const fns = [makeFn(5), makeFn(10), makeFn(20)]
    const dist = computeDistribution(fns)
    expect(dist.median).toBe(10)
  })

  it('computes max', () => {
    const fns = [makeFn(5), makeFn(30)]
    const dist = computeDistribution(fns)
    expect(dist.max).toBe(30)
  })

  it('handles empty list', () => {
    const dist = computeDistribution([])
    expect(dist.total).toBe(0)
    expect(dist.average).toBe(0)
  })

  it('computes p95', () => {
    const fns = Array.from({ length: 20 }, (_, i) => makeFn((i + 1) * 5))
    const dist = computeDistribution(fns)
    expect(dist.p95).toBeGreaterThan(0)
  })
})

// ─── File Stats ───────────────────────────────────────────────────────────────

describe('computeFileStats', () => {
  const makeFn = (file: string, lineCount: number): FunctionInfo => ({
    name: 'fn',
    file,
    lineStart: 1,
    lineEnd: lineCount,
    lineCount,
    parameterCount: 0,
    nestingDepth: 0,
    complexity: 1,
    isExported: false,
    isAsync: false,
    type: 'function',
    sizeCategory: classifySize(lineCount),
  })

  it('groups by file', () => {
    const fns = [makeFn('a.ts', 10), makeFn('a.ts', 20), makeFn('b.ts', 5)]
    const stats = computeFileStats(fns, 50)
    expect(stats).toHaveLength(2)
  })

  it('computes average size per file', () => {
    const fns = [makeFn('a.ts', 10), makeFn('a.ts', 20)]
    const stats = computeFileStats(fns, 50)
    expect(stats[0]?.averageSize).toBe(15)
  })

  it('computes max size per file', () => {
    const fns = [makeFn('a.ts', 10), makeFn('a.ts', 30)]
    const stats = computeFileStats(fns, 50)
    expect(stats[0]?.maxSize).toBe(30)
  })

  it('counts oversized functions', () => {
    const fns = [makeFn('a.ts', 30), makeFn('a.ts', 60)]
    const stats = computeFileStats(fns, 50)
    expect(stats[0]?.oversizedCount).toBe(1)
  })

  it('sorts by average size descending', () => {
    const fns = [makeFn('a.ts', 10), makeFn('b.ts', 50)]
    const stats = computeFileStats(fns, 100)
    expect(stats[0]?.file).toBe('b.ts')
  })

  it('handles empty list', () => {
    expect(computeFileStats([], 50)).toEqual([])
  })
})

// ─── Oversized Detection ──────────────────────────────────────────────────────

describe('findOversized', () => {
  const makeFn = (lineCount: number, name: string): FunctionInfo => ({
    name,
    file: 'test.ts',
    lineStart: 1,
    lineEnd: lineCount,
    lineCount,
    parameterCount: 0,
    nestingDepth: 0,
    complexity: 1,
    isExported: false,
    isAsync: false,
    type: 'function',
    sizeCategory: classifySize(lineCount),
  })

  it('finds functions over threshold', () => {
    const fns = [makeFn(30, 'small'), makeFn(60, 'big'), makeFn(100, 'huge')]
    const oversized = findOversized(fns, 50)
    expect(oversized).toHaveLength(2)
  })

  it('sorts by size descending', () => {
    const fns = [makeFn(60, 'big'), makeFn(100, 'huge')]
    const oversized = findOversized(fns, 50)
    expect(oversized[0]?.name).toBe('huge')
  })

  it('returns empty when all under threshold', () => {
    const fns = [makeFn(10, 'ok'), makeFn(20, 'fine')]
    expect(findOversized(fns, 50)).toEqual([])
  })

  it('respects threshold boundary', () => {
    const fns = [makeFn(50, 'exact'), makeFn(51, 'over')]
    expect(findOversized(fns, 50)).toHaveLength(1)
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeFn = (lineCount: number, nesting: number): FunctionInfo => ({
    name: 'bigFn',
    file: 'test.ts',
    lineStart: 1,
    lineEnd: lineCount,
    lineCount,
    parameterCount: 0,
    nestingDepth: nesting,
    complexity: 1,
    isExported: false,
    isAsync: false,
    type: 'function',
    sizeCategory: classifySize(lineCount),
  })

  it('generates healthy message when all good', () => {
    const recs = generateRecommendations([], { tiny: 5, small: 10, medium: 3, large: 0, huge: 0, total: 18, average: 8, median: 6, p95: 15, max: 20 }, [])
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })

  it('warns about oversized functions', () => {
    const oversized = [makeFn(80, 1)]
    const recs = generateRecommendations(oversized, { tiny: 0, small: 0, medium: 0, large: 0, huge: 1, total: 1, average: 80, median: 80, p95: 80, max: 80 }, [])
    expect(recs.some((r) => r.includes('exceed') || r.includes('threshold'))).toBe(true)
  })

  it('warns about very large functions', () => {
    const oversized = [makeFn(120, 1)]
    const recs = generateRecommendations(oversized, { tiny: 0, small: 0, medium: 0, large: 0, huge: 1, total: 1, average: 120, median: 120, p95: 120, max: 120 }, [])
    expect(recs.some((r) => r.includes('Very large') || r.includes('refactor'))).toBe(true)
  })

  it('warns about deep nesting in oversized', () => {
    const oversized = [makeFn(60, 5)]
    const recs = generateRecommendations(oversized, { tiny: 0, small: 0, medium: 0, large: 1, huge: 0, total: 1, average: 60, median: 60, p95: 60, max: 60 }, [])
    expect(recs.some((r) => r.includes('nesting'))).toBe(true)
  })

  it('warns about high proportion of large functions', () => {
    const dist: SizeDistribution = { tiny: 1, small: 1, medium: 1, large: 10, huge: 0, total: 13, average: 35, median: 30, p95: 50, max: 55 }
    const recs = generateRecommendations([], dist, [])
    expect(recs.some((r) => r.includes('extract method') || r.includes('large'))).toBe(true)
  })

  it('warns about huge functions', () => {
    const dist: SizeDistribution = { tiny: 0, small: 0, medium: 0, large: 0, huge: 2, total: 2, average: 80, median: 80, p95: 80, max: 80 }
    const recs = generateRecommendations([], dist, [])
    expect(recs.some((r) => r.includes('60 lines') || r.includes('huge'))).toBe(true)
  })

  it('mentions files with high average', () => {
    const fileStats = [{ file: 'big.ts', functionCount: 5, averageSize: 60, maxSize: 100, oversizedCount: 3, totalLines: 300 }]
    const oversized = [makeFn(60, 1)]
    const recs = generateRecommendations(oversized, { tiny: 0, small: 0, medium: 0, large: 1, huge: 0, total: 1, average: 60, median: 60, p95: 60, max: 60 }, fileStats)
    expect(recs.some((r) => r.includes('big.ts'))).toBe(true)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('buildFuncSizeResult', () => {
  const sampleCode = `import { Command } from '@oclif/core'

export function formatOutput(data: string): string {
  if (!data) return ''
  return data.trim()
}

function helper() {
  return 42
}

export async function fetchData(url: string) {
  const response = await fetch(url)
  return response.json()
}

const compute = (a: number, b: number) => {
  return a + b
}
`

  it('builds complete result', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.functions.length).toBeGreaterThan(0)
    expect(result.distribution.total).toBeGreaterThan(0)
    expect(result.stats.totalFunctions).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('counts exported functions', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.stats.exportedFunctions).toBeGreaterThan(0)
  })

  it('counts async functions', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.stats.asyncFunctions).toBeGreaterThan(0)
  })

  it('computes average parameters', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.stats.averageParameters).toBeGreaterThan(0)
  })

  it('respects threshold', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], { threshold: 2 })
    expect(result.oversizedFunctions.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles multiple files', () => {
    const code1 = 'function a() {\n  return 1\n}'
    const code2 = 'function b() {\n  return 2\n}'
    const result = buildFuncSizeResult(['a.ts', 'b.ts'], [code1, code2], {})
    expect(result.stats.totalFiles).toBe(2)
  })

  it('handles empty content', () => {
    const result = buildFuncSizeResult(['empty.ts'], [''], {})
    expect(result.functions).toEqual([])
    expect(result.stats.totalFunctions).toBe(0)
  })

  it('computes file stats', () => {
    const result = buildFuncSizeResult(['test.ts'], [sampleCode], {})
    expect(result.fileStats.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('sizeCategoryColor', () => {
  it('returns a string for each category', () => {
    expect(typeof sizeCategoryColor('tiny')).toBe('string')
    expect(typeof sizeCategoryColor('small')).toBe('string')
    expect(typeof sizeCategoryColor('medium')).toBe('string')
    expect(typeof sizeCategoryColor('large')).toBe('string')
    expect(typeof sizeCategoryColor('huge')).toBe('string')
  })
})

describe('horizontalBar', () => {
  it('generates bar for full value', () => {
    expect(typeof horizontalBar(10, 10)).toBe('string')
  })

  it('handles zero max', () => {
    expect(typeof horizontalBar(0, 0)).toBe('string')
  })

  it('handles partial value', () => {
    expect(typeof horizontalBar(5, 10, 10)).toBe('string')
  })
})

describe('formatDistribution', () => {
  it('formats distribution', () => {
    const dist: SizeDistribution = { tiny: 5, small: 10, medium: 3, large: 2, huge: 1, total: 21, average: 12.5, median: 8, p95: 35, max: 80 }
    const result = formatDistribution(dist)
    expect(result).toContain('tiny')
    expect(result).toContain('huge')
    expect(result).toContain('21')
    expect(result).toContain('12.5')
  })
})

describe('formatOversizedRow', () => {
  it('formats function row', () => {
    const fn: FunctionInfo = {
      name: 'bigFunction',
      file: 'src/foo.ts',
      lineStart: 1,
      lineEnd: 80,
      lineCount: 80,
      parameterCount: 3,
      nestingDepth: 4,
      complexity: 15,
      isExported: true,
      isAsync: true,
      type: 'function',
      sizeCategory: 'huge',
    }
    const row = formatOversizedRow(fn)
    expect(row).toContain('bigFunction')
    expect(row).toContain('80 lines')
  })
})

describe('formatFuncSizeJson', () => {
  it('produces valid JSON', () => {
    const result = buildFuncSizeResult(['test.ts'], ['function foo() { return 1 }'], {})
    const json = formatFuncSizeJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFunctions).toBeGreaterThan(0)
  })
})

describe('formatFuncSizeCsv', () => {
  it('produces CSV with header', () => {
    const result = buildFuncSizeResult(['test.ts'], ['function foo() {\n  return 1\n}'], {})
    const csv = formatFuncSizeCsv(result)
    expect(csv.split('\n')[0]).toContain('name,file,')
    expect(csv.split('\n').length).toBeGreaterThanOrEqual(2)
  })
})

describe('formatFuncSizeTable', () => {
  it('produces table output', () => {
    const result = buildFuncSizeResult(['test.ts'], ['function foo() {\n  return 1\n}'], {})
    const table = formatFuncSizeTable(result)
    expect(table).toContain('Function Size')
    expect(table).toContain('Distribution')
  })

  it('shows file stats in verbose mode', () => {
    const code = 'function foo() {\n  return 1\n}\nfunction bar() {\n  return 2\n}'
    const result = buildFuncSizeResult(['test.ts'], [code], { verbose: true })
    const table = formatFuncSizeTable(result, true)
    expect(table).toContain('Per-File')
  })

  it('shows oversized warnings', () => {
    const result = buildFuncSizeResult(['test.ts'], ['function foo() {\n  return 1\n}'], { threshold: 0 })
    const table = formatFuncSizeTable(result)
    expect(table).toContain('Oversized')
  })
})
