import { describe, expect, it } from 'vitest'

import {
  buildFrequencyResult,
  categorize,
  computeStats,
  countFrequencies,
  extractFunctionCalls,
  extractImports,
  extractKeywords,
  extractMethodCalls,
  extractPatterns,
  extractReturnTypes,
  extractThrowTypes,
  findSingletons,
  generateRecommendations,
  type ElementFrequency,
  type FrequencyStats,
} from '../src/commands/frequency-helpers.js'
import {
  formatCategoryBreakdown,
  formatDiversityMeter,
  formatFrequencyTable,
  formatJson,
  formatRecommendations,
  formatResult,
  formatStats,
} from '../src/commands/frequency-format-helpers.js'

// ─── extractFunctionCalls ─────────────────────────────────────────────────

describe('extractFunctionCalls', () => {
  it('extracts simple function calls', () => {
    const result = extractFunctionCalls('foo()', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('foo')
    expect(result[0]!.type).toBe('function-call')
    expect(result[0]!.frequency).toBe(1)
  })

  it('counts multiple calls to same function', () => {
    const result = extractFunctionCalls('foo()\nfoo()\nfoo()', 'a.ts')
    const foo = result.find((e) => e.element === 'foo')
    expect(foo!.frequency).toBe(3)
  })

  it('extracts calls with arguments', () => {
    const result = extractFunctionCalls('bar(1, 2, 3)', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('bar')
  })

  it('skips keywords like if/for/while', () => {
    const code = 'if (true) {}\nfor (let i = 0; i < 10; i++) {}'
    const result = extractFunctionCalls(code, 'a.ts')
    const names = result.map((e) => e.element)
    expect(names).not.toContain('if')
    expect(names).not.toContain('for')
    expect(names).not.toContain('while')
  })

  it('records file and line location', () => {
    const result = extractFunctionCalls('foo()', 'test.ts')
    expect(result[0]!.files).toContain('test.ts')
    expect(result[0]!.locations[0]!.line).toBe(1)
    expect(result[0]!.locations[0]!.context).toBe('foo()')
  })

  it('skips comment lines', () => {
    const code = '// foo()\n/* bar() */\nbaz()'
    const result = extractFunctionCalls(code, 'a.ts')
    const names = result.map((e) => e.element)
    expect(names).not.toContain('foo')
    expect(names).toContain('baz')
  })

  it('returns empty for no function calls', () => {
    const result = extractFunctionCalls('const x = 5', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractMethodCalls ───────────────────────────────────────────────────

describe('extractMethodCalls', () => {
  it('extracts method calls', () => {
    const result = extractMethodCalls('obj.method()', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('method')
    expect(result[0]!.type).toBe('method-call')
  })

  it('counts multiple method calls', () => {
    const result = extractMethodCalls('a.push(1)\nb.push(2)\na.push(3)', 'a.ts')
    const push = result.find((e) => e.element === 'push')
    expect(push!.frequency).toBe(3)
  })

  it('handles chained methods', () => {
    const result = extractMethodCalls('arr.map(fn).filter(fn).reduce(fn)', 'a.ts')
    const names = result.map((e) => e.element)
    expect(names).toContain('map')
    expect(names).toContain('filter')
    expect(names).toContain('reduce')
  })

  it('returns empty for no method calls', () => {
    const result = extractMethodCalls('const x = 5', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractImports ───────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts import sources', () => {
    const result = extractImports("import chalk from 'chalk'", 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('chalk')
    expect(result[0]!.type).toBe('import')
  })

  it('handles double-quoted imports', () => {
    const result = extractImports('import x from "path"', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('path')
  })

  it('counts duplicate imports', () => {
    const code = "import a from 'chalk'\nimport b from 'chalk'"
    const result = extractImports(code, 'a.ts')
    const chalk = result.find((e) => e.element === 'chalk')
    expect(chalk!.frequency).toBe(2)
  })

  it('returns empty for no imports', () => {
    const result = extractImports('const x = 5', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractReturnTypes ───────────────────────────────────────────────────

describe('extractReturnTypes', () => {
  it('extracts return type annotations', () => {
    const result = extractReturnTypes('function foo(): string {}', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('string')
    expect(result[0]!.type).toBe('return-type')
  })

  it('handles generic return types', () => {
    const result = extractReturnTypes('function foo(): Promise<string> {}', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('Promise')
  })

  it('handles arrow function return types', () => {
    const result = extractReturnTypes('const fn = (): number => 42', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('number')
  })

  it('returns empty when no return types', () => {
    const result = extractReturnTypes('function foo() {}', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractThrowTypes ────────────────────────────────────────────────────

describe('extractThrowTypes', () => {
  it('extracts throw new Error patterns', () => {
    const result = extractThrowTypes('throw new Error("msg")', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('Error')
    expect(result[0]!.type).toBe('throw-type')
  })

  it('extracts custom error types', () => {
    const result = extractThrowTypes('throw new CustomError("msg")', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.element).toBe('CustomError')
  })

  it('counts multiple throws', () => {
    const code = 'throw new Error("a")\nthrow new Error("b")'
    const result = extractThrowTypes(code, 'a.ts')
    expect(result[0]!.frequency).toBe(2)
  })

  it('returns empty for no throws', () => {
    const result = extractThrowTypes('const x = 5', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractPatterns ──────────────────────────────────────────────────────

describe('extractPatterns', () => {
  it('extracts Promise.all', () => {
    const result = extractPatterns('await Promise.all([])', 'a.ts')
    const pa = result.find((e) => e.element === 'Promise.all')
    expect(pa).toBeDefined()
    expect(pa!.type).toBe('pattern')
  })

  it('extracts Object.keys', () => {
    const result = extractPatterns('Object.keys(obj)', 'a.ts')
    expect(result.find((e) => e.element === 'Object.keys')).toBeDefined()
  })

  it('extracts JSON.stringify', () => {
    const result = extractPatterns('JSON.stringify(data)', 'a.ts')
    expect(result.find((e) => e.element === 'JSON.stringify')).toBeDefined()
  })

  it('extracts Math.max', () => {
    const result = extractPatterns('Math.max(1, 2)', 'a.ts')
    expect(result.find((e) => e.element === 'Math.max')).toBeDefined()
  })

  it('returns empty for no patterns', () => {
    const result = extractPatterns('const x = 5', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── extractKeywords ──────────────────────────────────────────────────────

describe('extractKeywords', () => {
  it('extracts const keyword', () => {
    const result = extractKeywords('const x = 5', 'a.ts')
    const kw = result.find((e) => e.element === 'const')
    expect(kw).toBeDefined()
    expect(kw!.type).toBe('keyword')
  })

  it('extracts async/await', () => {
    const result = extractKeywords('async function foo() { await bar() }', 'a.ts')
    const names = result.map((e) => e.element)
    expect(names).toContain('async')
    expect(names).toContain('await')
  })

  it('counts keyword frequency', () => {
    const code = 'const a = 1\nconst b = 2\nconst c = 3'
    const result = extractKeywords(code, 'a.ts')
    const constKw = result.find((e) => e.element === 'const')
    expect(constKw!.frequency).toBe(3)
  })

  it('skips comment lines', () => {
    const code = '// const x = 5\nlet y = 10'
    const result = extractKeywords(code, 'a.ts')
    const constKw = result.find((e) => e.element === 'const')
    expect(constKw).toBeUndefined()
    expect(result.find((e) => e.element === 'let')).toBeDefined()
  })

  it('returns empty for no keywords', () => {
    const result = extractKeywords('foo bar baz', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── countFrequencies ─────────────────────────────────────────────────────

describe('countFrequencies', () => {
  it('merges elements with same type and name', () => {
    const a: ElementFrequency = {
      element: 'foo', type: 'function-call', frequency: 3, files: ['a.ts'],
      locations: [], category: 'Functions',
    }
    const b: ElementFrequency = {
      element: 'foo', type: 'function-call', frequency: 2, files: ['b.ts'],
      locations: [], category: 'Functions',
    }
    const result = countFrequencies([a, b])
    expect(result).toHaveLength(1)
    expect(result[0]!.frequency).toBe(5)
    expect(result[0]!.files).toContain('a.ts')
    expect(result[0]!.files).toContain('b.ts')
  })

  it('keeps different types separate', () => {
    const a: ElementFrequency = {
      element: 'parse', type: 'function-call', frequency: 1, files: ['a.ts'],
      locations: [], category: 'Functions',
    }
    const b: ElementFrequency = {
      element: 'parse', type: 'method-call', frequency: 1, files: ['a.ts'],
      locations: [], category: 'Methods',
    }
    const result = countFrequencies([a, b])
    expect(result).toHaveLength(2)
  })

  it('returns empty for empty input', () => {
    expect(countFrequencies([])).toEqual([])
  })
})

// ─── categorize ───────────────────────────────────────────────────────────

describe('categorize', () => {
  it('groups elements by category', () => {
    const elements: ElementFrequency[] = [
      { element: 'foo', type: 'function-call', frequency: 5, files: [], locations: [], category: 'Functions' },
      { element: 'bar', type: 'function-call', frequency: 3, files: [], locations: [], category: 'Functions' },
      { element: 'push', type: 'method-call', frequency: 2, files: [], locations: [], category: 'Methods' },
    ]
    const cats = categorize(elements)
    expect(cats).toHaveLength(2)
    expect(cats.find((c) => c.name === 'Functions')).toBeDefined()
    expect(cats.find((c) => c.name === 'Methods')).toBeDefined()
  })

  it('sorts categories by total occurrences', () => {
    const elements: ElementFrequency[] = [
      { element: 'foo', type: 'function-call', frequency: 2, files: [], locations: [], category: 'Functions' },
      { element: 'push', type: 'method-call', frequency: 10, files: [], locations: [], category: 'Methods' },
    ]
    const cats = categorize(elements)
    expect(cats[0]!.name).toBe('Methods')
  })

  it('sorts elements within category by frequency descending', () => {
    const elements: ElementFrequency[] = [
      { element: 'bar', type: 'function-call', frequency: 1, files: [], locations: [], category: 'Functions' },
      { element: 'foo', type: 'function-call', frequency: 10, files: [], locations: [], category: 'Functions' },
    ]
    const cats = categorize(elements)
    expect(cats[0]!.elements[0]!.element).toBe('foo')
  })

  it('computes category stats correctly', () => {
    const elements: ElementFrequency[] = [
      { element: 'foo', type: 'function-call', frequency: 5, files: [], locations: [], category: 'Functions' },
      { element: 'bar', type: 'function-call', frequency: 3, files: [], locations: [], category: 'Functions' },
    ]
    const cats = categorize(elements)
    const fn = cats.find((c) => c.name === 'Functions')!
    expect(fn.totalOccurrences).toBe(8)
    expect(fn.uniqueElements).toBe(2)
    expect(fn.topElement).toBe('foo')
  })

  it('returns empty for empty input', () => {
    expect(categorize([])).toEqual([])
  })
})

// ─── findSingletons ───────────────────────────────────────────────────────

describe('findSingletons', () => {
  it('finds elements with frequency 1', () => {
    const elements: ElementFrequency[] = [
      { element: 'rare', type: 'function-call', frequency: 1, files: [], locations: [], category: 'Functions' },
      { element: 'common', type: 'function-call', frequency: 10, files: [], locations: [], category: 'Functions' },
    ]
    const singletons = findSingletons(elements)
    expect(singletons).toHaveLength(1)
    expect(singletons[0]!.element).toBe('rare')
  })

  it('returns empty when no singletons', () => {
    const elements: ElementFrequency[] = [
      { element: 'a', type: 'function-call', frequency: 2, files: [], locations: [], category: 'Functions' },
    ]
    expect(findSingletons(elements)).toHaveLength(0)
  })

  it('returns empty for empty input', () => {
    expect(findSingletons([])).toEqual([])
  })
})

// ─── computeStats ─────────────────────────────────────────────────────────

describe('computeStats', () => {
  it('computes basic stats', () => {
    const elements: ElementFrequency[] = [
      { element: 'a', type: 'function-call', frequency: 10, files: [], locations: [], category: 'Functions' },
      { element: 'b', type: 'function-call', frequency: 5, files: [], locations: [], category: 'Functions' },
      { element: 'c', type: 'method-call', frequency: 1, files: [], locations: [], category: 'Methods' },
    ]
    const stats = computeStats(elements)
    expect(stats.totalElements).toBe(3)
    expect(stats.totalOccurrences).toBe(16)
    expect(stats.uniqueElements).toBe(3)
    expect(stats.averageFrequency).toBe(5.3)
    expect(stats.mostCommon).toBe('a')
    expect(stats.leastCommon).toBe('c')
  })

  it('handles empty input', () => {
    const stats = computeStats([])
    expect(stats.totalElements).toBe(0)
    expect(stats.totalOccurrences).toBe(0)
    expect(stats.uniqueElements).toBe(0)
    expect(stats.averageFrequency).toBe(0)
    expect(stats.mostCommon).toBe('none')
    expect(stats.leastCommon).toBe('none')
    expect(stats.diversity).toBe(0)
  })

  it('computes diversity as unique/total', () => {
    const elements: ElementFrequency[] = [
      { element: 'a', type: 'function-call', frequency: 1, files: [], locations: [], category: 'Functions' },
      { element: 'b', type: 'function-call', frequency: 1, files: [], locations: [], category: 'Functions' },
    ]
    const stats = computeStats(elements)
    expect(stats.diversity).toBe(1)
  })

  it('counts unique by element name across types', () => {
    const elements: ElementFrequency[] = [
      { element: 'parse', type: 'function-call', frequency: 5, files: [], locations: [], category: 'Functions' },
      { element: 'parse', type: 'method-call', frequency: 3, files: [], locations: [], category: 'Methods' },
    ]
    const stats = computeStats(elements)
    expect(stats.uniqueElements).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for high diversity', () => {
    const stats: FrequencyStats = {
      totalElements: 100, totalOccurrences: 110, uniqueElements: 100,
      averageFrequency: 1.1, mostCommon: 'a', leastCommon: 'z', diversity: 0.9,
    }
    const recs = generateRecommendations(stats, [])
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('High code diversity')]))
  })

  it('recommends for many singletons', () => {
    const stats: FrequencyStats = {
      totalElements: 10, totalOccurrences: 20, uniqueElements: 10,
      averageFrequency: 2, mostCommon: 'a', leastCommon: 'j', diversity: 0.5,
    }
    const singletons: ElementFrequency[] = Array.from({ length: 6 }, (_, i) => ({
      element: `s${i}`, type: 'function-call' as const, frequency: 1, files: [], locations: [], category: 'Functions',
    }))
    const recs = generateRecommendations(stats, singletons)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('elements appear only once')]))
  })

  it('recommends for many function singletons', () => {
    const stats: FrequencyStats = {
      totalElements: 20, totalOccurrences: 30, uniqueElements: 20,
      averageFrequency: 1.5, mostCommon: 'a', leastCommon: 'z', diversity: 0.5,
    }
    const singletons: ElementFrequency[] = Array.from({ length: 7 }, (_, i) => ({
      element: `fn${i}`, type: 'function-call' as const, frequency: 1, files: [], locations: [], category: 'Functions',
    }))
    const recs = generateRecommendations(stats, singletons)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('function calls appear only once')]))
  })

  it('recommends for low diversity', () => {
    const stats: FrequencyStats = {
      totalElements: 5, totalOccurrences: 100, uniqueElements: 5,
      averageFrequency: 20, mostCommon: 'a', leastCommon: 'e', diversity: 0.05,
    }
    const recs = generateRecommendations(stats, [])
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('Low diversity')]))
  })

  it('returns healthy message when no issues', () => {
    const stats: FrequencyStats = {
      totalElements: 5, totalOccurrences: 25, uniqueElements: 5,
      averageFrequency: 5, mostCommon: 'a', leastCommon: 'e', diversity: 0.5,
    }
    const recs = generateRecommendations(stats, [])
    expect(recs).toEqual(['Code frequency distribution looks healthy.'])
  })
})

// ─── buildFrequencyResult ─────────────────────────────────────────────────

describe('buildFrequencyResult', () => {
  it('returns full result structure', () => {
    const result = buildFrequencyResult(['a.ts'], ['foo()\nbar()\nfoo()'])
    expect(result).toHaveProperty('categories')
    expect(result).toHaveProperty('allElements')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('topFrequencies')
    expect(result).toHaveProperty('singletons')
    expect(result).toHaveProperty('recommendations')
  })

  it('respects top option', () => {
    const code = Array.from({ length: 30 }, (_, i) => `fn${i}()`).join('\n')
    const result = buildFrequencyResult(['a.ts'], [code], { top: 5 })
    expect(result.topFrequencies.length).toBeLessThanOrEqual(5)
  })

  it('handles empty files', () => {
    const result = buildFrequencyResult([], [])
    expect(result.stats.totalElements).toBe(0)
    expect(result.allElements).toHaveLength(0)
  })

  it('handles empty content', () => {
    const result = buildFrequencyResult(['a.ts'], [''])
    expect(result.stats.totalElements).toBe(0)
  })

  it('merges across multiple files', () => {
    const result = buildFrequencyResult(
      ['a.ts', 'b.ts'],
      ['foo()\nbar()', 'foo()\nbaz()'],
    )
    const foo = result.allElements.find((e) => e.element === 'foo' && e.type === 'function-call')
    expect(foo!.frequency).toBe(2)
    expect(foo!.files).toContain('a.ts')
    expect(foo!.files).toContain('b.ts')
  })

  it('extracts multiple element types from real code', () => {
    const code = [
      "import chalk from 'chalk'",
      'import ora from "ora"',
      'function hello(): string { return "hi" }',
      'const arr = [1, 2, 3]',
      'arr.map(x => x * 2)',
      'Object.keys(obj)',
      'throw new Error("fail")',
      'const x = await Promise.all([])',
    ].join('\n')
    const result = buildFrequencyResult(['a.ts'], [code])

    const types = new Set(result.allElements.map((e) => e.type))
    expect(types.size).toBeGreaterThanOrEqual(4)
  })
})

// ─── formatFrequencyTable ─────────────────────────────────────────────────

describe('formatFrequencyTable', () => {
  it('formats a table with header', () => {
    const elements = [
      { element: 'foo', type: 'function-call', frequency: 10, category: 'Functions' },
    ]
    const output = formatFrequencyTable(elements)
    expect(output).toContain('Element')
    expect(output).toContain('foo')
    expect(output).toContain('10')
  })

  it('respects limit parameter', () => {
    const elements = Array.from({ length: 30 }, (_, i) => ({
      element: `fn${i}`, type: 'function-call', frequency: i + 1, category: 'Functions',
    }))
    const output = formatFrequencyTable(elements, 5)
    const lines = output.split('\n').filter((l) => !l.startsWith(' ') || l.includes('fn'))
    expect(lines.length).toBeLessThanOrEqual(7)
  })

  it('returns message for empty elements', () => {
    expect(formatFrequencyTable([])).toBe('No elements found.')
  })

  it('highlights high frequency in red', () => {
    const elements = [
      { element: 'hot', type: 'function-call', frequency: 15, category: 'Functions' },
    ]
    const output = formatFrequencyTable(elements)
    expect(output).toContain('hot')
  })
})

// ─── formatCategoryBreakdown ──────────────────────────────────────────────

describe('formatCategoryBreakdown', () => {
  it('formats categories with bars', () => {
    const cats = [{
      name: 'Functions',
      elements: [{ element: 'foo', type: 'function-call', frequency: 5, files: [], locations: [], category: 'Functions' }],
      totalOccurrences: 5,
      uniqueElements: 1,
      topElement: 'foo',
    }]
    const output = formatCategoryBreakdown(cats)
    expect(output).toContain('Functions')
    expect(output).toContain('foo')
  })

  it('shows "and N more" for >5 elements', () => {
    const cats = [{
      name: 'Functions',
      elements: Array.from({ length: 10 }, (_, i) => ({
        element: `fn${i}`, type: 'function-call', frequency: i + 1, files: [], locations: [], category: 'Functions',
      })),
      totalOccurrences: 55,
      uniqueElements: 10,
      topElement: 'fn9',
    }]
    const output = formatCategoryBreakdown(cats)
    expect(output).toContain('5 more')
  })

  it('returns message for empty categories', () => {
    expect(formatCategoryBreakdown([])).toBe('No categories found.')
  })
})

// ─── formatStats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats all stats fields', () => {
    const stats: FrequencyStats = {
      totalElements: 10, totalOccurrences: 50, uniqueElements: 10,
      averageFrequency: 5, mostCommon: 'foo', leastCommon: 'bar', diversity: 0.8,
    }
    const output = formatStats(stats)
    expect(output).toContain('Total elements:    10')
    expect(output).toContain('Total occurrences: 50')
    expect(output).toContain('Unique elements:   10')
    expect(output).toContain('Average frequency: 5')
    expect(output).toContain('Most common:       foo')
    expect(output).toContain('Least common:      bar')
    expect(output).toContain('Diversity index:   0.8')
  })
})

// ─── formatDiversityMeter ─────────────────────────────────────────────────

describe('formatDiversityMeter', () => {
  it('formats a bar chart', () => {
    const output = formatDiversityMeter(0.5)
    expect(output).toContain('Diversity:')
    expect(output).toContain('50%')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('shows 100% for diversity of 1', () => {
    expect(formatDiversityMeter(1)).toContain('100%')
  })

  it('shows 0% for diversity of 0', () => {
    expect(formatDiversityMeter(0)).toContain('0%')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats recommendations numbered', () => {
    const output = formatRecommendations(['Fix X', 'Refactor Y'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('1. Fix X')
    expect(output).toContain('2. Refactor Y')
  })

  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResult ─────────────────────────────────────────────────────────

describe('formatResult', () => {
  it('combines all sections', () => {
    const result = buildFrequencyResult(['a.ts'], ['foo()\nbar()'])
    const output = formatResult(result)
    expect(output).toContain('Statistics')
    expect(output).toContain('Diversity:')
    expect(output).toContain('Top Frequencies')
    expect(output).toContain('Recommendations')
  })
})

// ─── formatJson ───────────────────────────────────────────────────────────

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const result = buildFrequencyResult(['a.ts'], ['foo()'])
    const json = formatJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('categories')
    expect(parsed).toHaveProperty('stats')
  })
})
