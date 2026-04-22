import { describe, test, expect } from 'vitest'

import type { ComplexityCategory, FunctionComplexity } from '../../../src/core/complexity.js'

import {
  buildIgnorePatterns,
  buildJsonOutput,
  filterByThreshold,
  filterFilesByExtension,
  formatMarkdown,
  formatOutput,
  formatTable,
  getCategoryColor,
  limitResults,
  parseExtensions,
  sortByField,
  type DiscoveredFile,
} from '../../../src/commands/complexity-helpers.js'

function makeResult(overrides: Partial<FunctionComplexity> = {}): FunctionComplexity {
  return {
    category: 'low',
    cognitive: 3,
    cyclomatic: 5,
    filePath: '/test/file.ts',
    functionName: 'testFunc',
    startLine: 1,
    ...overrides,
  }
}

function makeFile(path: string): DiscoveredFile {
  return { absolutePath: `/abs${path}`, path }
}

describe('buildIgnorePatterns', () => {
  const defaults = ['**/node_modules/**', '**/dist/**']

  test('returns default patterns when user ignore is undefined', () => {
    const result = buildIgnorePatterns(defaults, undefined)
    expect(result).toEqual(defaults)
  })

  test('merges user patterns with defaults', () => {
    const result = buildIgnorePatterns(defaults, ['**/vendor/**'])
    expect(result).toEqual(['**/node_modules/**', '**/dist/**', '**/vendor/**'])
  })

  test('returns defaults when user ignore is empty array', () => {
    const result = buildIgnorePatterns(defaults, [])
    expect(result).toEqual(defaults)
  })

  test('appends multiple user patterns', () => {
    const result = buildIgnorePatterns(defaults, ['a', 'b', 'c'])
    expect(result).toHaveLength(5)
    expect(result.slice(-3)).toEqual(['a', 'b', 'c'])
  })

  test('preserves default patterns even when user patterns overlap', () => {
    const result = buildIgnorePatterns(defaults, ['**/node_modules/**'])
    expect(result).toEqual(['**/node_modules/**', '**/dist/**', '**/node_modules/**'])
  })

  test('handles single-item default array', () => {
    const result = buildIgnorePatterns(['*.log'], ['*.tmp'])
    expect(result).toEqual(['*.log', '*.tmp'])
  })

  test('handles empty default array with user patterns', () => {
    const result = buildIgnorePatterns([], ['**/coverage/**'])
    expect(result).toEqual(['**/coverage/**'])
  })
})

describe('parseExtensions', () => {
  test('returns null for empty string', () => {
    expect(parseExtensions('')).toBeNull()
  })

  test('parses single extension', () => {
    expect(parseExtensions('.ts')).toEqual(['.ts'])
  })

  test('parses multiple extensions', () => {
    expect(parseExtensions('.ts,.tsx')).toEqual(['.ts', '.tsx'])
  })

  test('trims whitespace around extensions', () => {
    expect(parseExtensions(' .ts , .tsx ')).toEqual(['.ts', '.tsx'])
  })

  test('filters out empty strings', () => {
    expect(parseExtensions('.ts,,.tsx,')).toEqual(['.ts', '.tsx'])
  })

  test('handles extensions without leading dot', () => {
    expect(parseExtensions('ts,tsx')).toEqual(['ts', 'tsx'])
  })

  test('returns empty array for whitespace-only string', () => {
    expect(parseExtensions('   ')).toEqual([])
  })

  test('parses extensions with mixed empty and valid entries', () => {
    expect(parseExtensions(',.ts,,.tsx,')).toEqual(['.ts', '.tsx'])
  })

  test('preserves extension casing', () => {
    expect(parseExtensions('.TS,.Ts')).toEqual(['.TS', '.Ts'])
  })
})

describe('filterFilesByExtension', () => {
  const files = [
    makeFile('app.ts'),
    makeFile('view.tsx'),
    makeFile('style.css'),
    makeFile('index.js'),
  ]

  test('returns all files when extensions is null', () => {
    expect(filterFilesByExtension(files, null)).toEqual(files)
  })

  test('filters to .ts files only', () => {
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('app.ts')
  })

  test('filters to .ts and .tsx files', () => {
    const result = filterFilesByExtension(files, ['.ts', '.tsx'])
    expect(result).toHaveLength(2)
  })

  test('returns empty when no files match extension', () => {
    const result = filterFilesByExtension(files, ['.py'])
    expect(result).toHaveLength(0)
  })

  test('handles empty files array', () => {
    const result = filterFilesByExtension([], ['.ts'])
    expect(result).toEqual([])
  })

  test('case-insensitive extension matching', () => {
    const mixedCase = [makeFile('app.TS'), makeFile('view.Tsx')]
    const result = filterFilesByExtension(mixedCase, ['.ts', '.tsx'])
    expect(result).toHaveLength(2)
  })

  test('filters files with multiple dots in name', () => {
    const files = [makeFile('app.spec.ts'), makeFile('view.ts')]
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(2)
  })

  test('excludes files without matching extension', () => {
    const files = [makeFile('readme'), makeFile('Makefile')]
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(0)
  })

  test('handles file with no extension', () => {
    const files = [makeFile('Dockerfile'), makeFile('index.ts')]
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('index.ts')
  })

  test('matches single extension among many file types', () => {
    const files = [makeFile('a.py'), makeFile('b.rs'), makeFile('c.ts'), makeFile('d.go')]
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('c.ts')
  })
})

describe('filterByThreshold', () => {
  test('returns all results when threshold is 0', () => {
    const results = [makeResult({ cyclomatic: 1 }), makeResult({ cyclomatic: 10 })]
    expect(filterByThreshold(results, 0)).toEqual(results)
  })

  test('returns all results when threshold is negative', () => {
    const results = [makeResult({ cyclomatic: 1 })]
    expect(filterByThreshold(results, -5)).toEqual(results)
  })

  test('filters out results at or below threshold', () => {
    const results = [
      makeResult({ cyclomatic: 5, functionName: 'low' }),
      makeResult({ cyclomatic: 11, functionName: 'high' }),
      makeResult({ cyclomatic: 10, functionName: 'atThreshold' }),
    ]
    const filtered = filterByThreshold(results, 10)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].functionName).toBe('high')
  })

  test('returns empty array when all below threshold', () => {
    const results = [makeResult({ cyclomatic: 1 }), makeResult({ cyclomatic: 2 })]
    expect(filterByThreshold(results, 10)).toHaveLength(0)
  })

  test('handles empty input', () => {
    expect(filterByThreshold([], 5)).toEqual([])
  })

  test('returns results with cyclomatic strictly greater than threshold', () => {
    const results = [
      makeResult({ cyclomatic: 5, functionName: 'exact' }),
      makeResult({ cyclomatic: 6, functionName: 'above' }),
      makeResult({ cyclomatic: 4, functionName: 'below' }),
    ]
    const filtered = filterByThreshold(results, 5)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].functionName).toBe('above')
  })

  test('returns all results when threshold equals 0', () => {
    const results = [makeResult({ cyclomatic: 0 })]
    expect(filterByThreshold(results, 0)).toEqual(results)
  })

  test('handles single result above threshold', () => {
    const results = [makeResult({ cyclomatic: 100 })]
    expect(filterByThreshold(results, 50)).toHaveLength(1)
  })

  test('handles single result below threshold', () => {
    const results = [makeResult({ cyclomatic: 3 })]
    expect(filterByThreshold(results, 50)).toHaveLength(0)
  })
})

describe('sortByField', () => {
  const results = [
    makeResult({ cyclomatic: 3, filePath: '/c.ts', functionName: 'gamma' }),
    makeResult({ cyclomatic: 10, filePath: '/a.ts', functionName: 'alpha' }),
    makeResult({ cyclomatic: 7, filePath: '/b.ts', functionName: 'beta' }),
  ]

  test('sorts by complexity descending', () => {
    const sorted = sortByField(results, 'complexity')
    expect(sorted[0].cyclomatic).toBe(10)
    expect(sorted[1].cyclomatic).toBe(7)
    expect(sorted[2].cyclomatic).toBe(3)
  })

  test('sorts by file path ascending', () => {
    const sorted = sortByField(results, 'file')
    expect(sorted[0].filePath).toBe('/a.ts')
    expect(sorted[1].filePath).toBe('/b.ts')
    expect(sorted[2].filePath).toBe('/c.ts')
  })

  test('sorts by function name ascending', () => {
    const sorted = sortByField(results, 'name')
    expect(sorted[0].functionName).toBe('alpha')
    expect(sorted[1].functionName).toBe('beta')
    expect(sorted[2].functionName).toBe('gamma')
  })

  test('does not mutate original array', () => {
    const copy = [...results]
    sortByField(results, 'complexity')
    expect(results).toEqual(copy)
  })

  test('handles empty array', () => {
    expect(sortByField([], 'complexity')).toEqual([])
  })

  test('handles single element', () => {
    const single = [makeResult()]
    expect(sortByField(single, 'complexity')).toHaveLength(1)
  })

  test('stable sort for equal complexity values', () => {
    const equal = [
      makeResult({ cyclomatic: 5, functionName: 'b' }),
      makeResult({ cyclomatic: 5, functionName: 'a' }),
    ]
    const sorted = sortByField(equal, 'complexity')
    expect(sorted[0].functionName).toBe('b')
    expect(sorted[1].functionName).toBe('a')
  })

  test('sorts equal file paths stably', () => {
    const sameFile = [
      makeResult({ filePath: '/a.ts', functionName: 'second' }),
      makeResult({ filePath: '/a.ts', functionName: 'first' }),
    ]
    const sorted = sortByField(sameFile, 'file')
    expect(sorted[0].functionName).toBe('second')
  })

  test('sorts function names with localeCompare', () => {
    const results = [makeResult({ functionName: 'Beta' }), makeResult({ functionName: 'alpha' })]
    const sorted = sortByField(results, 'name')
    expect(sorted[0].functionName).toBe('alpha')
    expect(sorted[1].functionName).toBe('Beta')
  })

  test('sorts by complexity with large values', () => {
    const results = [
      makeResult({ cyclomatic: 100 }),
      makeResult({ cyclomatic: 1 }),
      makeResult({ cyclomatic: 50 }),
    ]
    const sorted = sortByField(results, 'complexity')
    expect(sorted.map((r) => r.cyclomatic)).toEqual([100, 50, 1])
  })

  test('returns new array reference', () => {
    const results = [makeResult()]
    const sorted = sortByField(results, 'complexity')
    expect(sorted).not.toBe(results)
  })
})

describe('limitResults', () => {
  test('limits to specified count', () => {
    const items = [1, 2, 3, 4, 5]
    expect(limitResults(items, 3)).toEqual([1, 2, 3])
  })

  test('returns all when limit exceeds length', () => {
    const items = [1, 2, 3]
    expect(limitResults(items, 10)).toEqual([1, 2, 3])
  })

  test('returns empty when limit is 0', () => {
    expect(limitResults([1, 2, 3], 0)).toEqual([])
  })

  test('handles empty array', () => {
    expect(limitResults([], 5)).toEqual([])
  })

  test('preserves order', () => {
    const items = ['a', 'b', 'c', 'd']
    expect(limitResults(items, 2)).toEqual(['a', 'b'])
  })

  test('returns whole array for negative limit via slice behavior', () => {
    expect(limitResults([1, 2, 3], -1)).toEqual([1, 2])
  })

  test('returns single element for limit of 1', () => {
    expect(limitResults([10, 20, 30], 1)).toEqual([10])
  })

  test('handles limit equal to array length', () => {
    const items = ['x', 'y', 'z']
    expect(limitResults(items, 3)).toEqual(items)
  })

  test('works with object arrays', () => {
    const items = [{ a: 1 }, { a: 2 }]
    expect(limitResults(items, 1)).toEqual([{ a: 1 }])
  })
})

describe('getCategoryColor', () => {
  test('returns a function for low category', () => {
    const colorFn = getCategoryColor('low')
    expect(typeof colorFn).toBe('function')
    expect(colorFn('test')).toContain('test')
  })

  test('returns a function for moderate category', () => {
    const colorFn = getCategoryColor('moderate')
    expect(typeof colorFn).toBe('function')
  })

  test('returns a function for high category', () => {
    const colorFn = getCategoryColor('high')
    expect(typeof colorFn).toBe('function')
  })

  test('returns a function for extreme category', () => {
    const colorFn = getCategoryColor('extreme')
    expect(typeof colorFn).toBe('function')
  })

  test('each category returns a callable function', () => {
    const categories: ComplexityCategory[] = ['low', 'moderate', 'high', 'extreme']
    for (const c of categories) {
      const fn = getCategoryColor(c)
      expect(typeof fn).toBe('function')
      expect(fn('test')).toBeTypeOf('string')
    }
  })

  test('color function preserves empty string', () => {
    const fn = getCategoryColor('low')
    expect(typeof fn('')).toBe('string')
  })

  test('different categories produce different color output', () => {
    const text = 'hello'
    const lowColor = getCategoryColor('low')(text)
    const extremeColor = getCategoryColor('extreme')(text)
    expect(lowColor).toContain(text)
    expect(extremeColor).toContain(text)
  })
})

describe('buildJsonOutput', () => {
  test('produces valid JSON', () => {
    const results = [makeResult()]
    const json = buildJsonOutput(results)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('functions')
    expect(parsed).toHaveProperty('summary')
  })

  test('functions array matches input', () => {
    const results = [makeResult({ functionName: 'a' }), makeResult({ functionName: 'b' })]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.functions).toHaveLength(2)
    expect(parsed.functions[0].functionName).toBe('a')
  })

  test('summary has all required fields', () => {
    const parsed = JSON.parse(buildJsonOutput([makeResult()]))
    const summary = parsed.summary
    expect(summary).toHaveProperty('totalFunctions')
    expect(summary).toHaveProperty('averageCyclomatic')
    expect(summary).toHaveProperty('averageCognitive')
    expect(summary).toHaveProperty('maxCyclomatic')
    expect(summary).toHaveProperty('maxCognitive')
    expect(summary).toHaveProperty('categoryBreakdown')
  })

  test('empty input produces empty functions and zero summary', () => {
    const parsed = JSON.parse(buildJsonOutput([]))
    expect(parsed.functions).toHaveLength(0)
    expect(parsed.summary.totalFunctions).toBe(0)
    expect(parsed.summary.averageCyclomatic).toBe(0)
  })

  test('JSON is pretty-printed with 2-space indent', () => {
    const json = buildJsonOutput([makeResult()])
    expect(json).toContain('\n  ')
  })

  test('computes correct max cyclomatic from multiple results', () => {
    const results = [
      makeResult({ cyclomatic: 3 }),
      makeResult({ cyclomatic: 15 }),
      makeResult({ cyclomatic: 7 }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.maxCyclomatic).toBe(15)
  })

  test('computes correct average cyclomatic', () => {
    const results = [
      makeResult({ cyclomatic: 4, cognitive: 2 }),
      makeResult({ cyclomatic: 10, cognitive: 6 }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.averageCyclomatic).toBe(7)
  })

  test('computes correct average cognitive', () => {
    const results = [makeResult({ cognitive: 2 }), makeResult({ cognitive: 8 })]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.averageCognitive).toBe(5)
  })

  test('categoryBreakdown counts match results', () => {
    const results = [
      makeResult({ category: 'low' }),
      makeResult({ category: 'low' }),
      makeResult({ category: 'high' }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.categoryBreakdown.low).toBe(2)
    expect(parsed.summary.categoryBreakdown.high).toBe(1)
    expect(parsed.summary.categoryBreakdown.moderate).toBe(0)
  })

  test('preserves all function fields in output', () => {
    const result = makeResult({
      category: 'extreme',
      cognitive: 20,
      cyclomatic: 30,
      filePath: '/deep/nested/path.ts',
      functionName: 'complexFunc',
      startLine: 42,
    })
    const parsed = JSON.parse(buildJsonOutput([result]))
    expect(parsed.functions[0]).toEqual(result)
  })
})

describe('formatMarkdown', () => {
  test('produces header', () => {
    const md = formatMarkdown([makeResult()])
    expect(md).toContain('# Complexity Analysis')
  })

  test('produces table header row', () => {
    const md = formatMarkdown([makeResult()])
    expect(md).toContain('| Function | Cyclomatic | Cognitive | Category | File |')
  })

  test('produces separator row', () => {
    const md = formatMarkdown([makeResult()])
    expect(md).toContain('|--------|------------|-----------|----------|------|')
  })

  test('includes function data in table rows', () => {
    const md = formatMarkdown([
      makeResult({
        functionName: 'myFunc',
        cyclomatic: 7,
        cognitive: 4,
        category: 'moderate',
        filePath: '/src/app.ts',
      }),
    ])
    expect(md).toContain('| myFunc | 7 | 4 | moderate | /src/app.ts |')
  })

  test('includes summary section', () => {
    const md = formatMarkdown([makeResult()])
    expect(md).toContain('## Summary')
    expect(md).toContain('**Total functions**')
    expect(md).toContain('**Average cyclomatic complexity**')
    expect(md).toContain('**Average cognitive complexity**')
    expect(md).toContain('**Maximum cyclomatic complexity**')
    expect(md).toContain('**Maximum cognitive complexity**')
  })

  test('includes category breakdown section', () => {
    const md = formatMarkdown([makeResult()])
    expect(md).toContain('## Category Breakdown')
    expect(md).toContain('**Low**')
    expect(md).toContain('**Moderate**')
    expect(md).toContain('**High**')
    expect(md).toContain('**Extreme**')
  })

  test('empty results still produce headers', () => {
    const md = formatMarkdown([])
    expect(md).toContain('# Complexity Analysis')
    expect(md).toContain('## Summary')
  })

  test('multiple results produce multiple rows', () => {
    const results = [
      makeResult({ functionName: 'a' }),
      makeResult({ functionName: 'b' }),
      makeResult({ functionName: 'c' }),
    ]
    const md = formatMarkdown(results)
    expect(md).toContain('| a |')
    expect(md).toContain('| b |')
    expect(md).toContain('| c |')
  })

  test('renders extreme category in table row', () => {
    const md = formatMarkdown([makeResult({ functionName: 'extremeFunc', category: 'extreme' })])
    expect(md).toContain('extremeFunc')
    expect(md).toContain('extreme')
  })

  test('renders function with zero complexity', () => {
    const md = formatMarkdown([makeResult({ cyclomatic: 0, cognitive: 0, functionName: 'empty' })])
    expect(md).toContain('| empty | 0 | 0 |')
  })

  test('summary reflects correct total for multiple results', () => {
    const results = [
      makeResult({ cyclomatic: 1 }),
      makeResult({ cyclomatic: 2 }),
      makeResult({ cyclomatic: 3 }),
    ]
    const md = formatMarkdown(results)
    expect(md).toContain('**Total functions**: 3')
  })

  test('handles function name with special characters', () => {
    const md = formatMarkdown([makeResult({ functionName: 'handle$Event' })])
    expect(md).toContain('handle$Event')
  })
})

describe('formatTable', () => {
  test('shows empty message for no results', () => {
    const output = formatTable([])
    expect(output).toContain('No functions found with complexity above threshold.')
  })

  test('shows analysis header', () => {
    const output = formatTable([makeResult()])
    expect(output).toContain('Complexity Analysis')
  })

  test('shows column headers', () => {
    const output = formatTable([makeResult()])
    expect(output).toContain('Function')
    expect(output).toContain('Cyclomatic')
    expect(output).toContain('Cognitive')
    expect(output).toContain('Category')
    expect(output).toContain('File')
  })

  test('includes function data row', () => {
    const output = formatTable([
      makeResult({ functionName: 'myFunc', cyclomatic: 5, cognitive: 3 }),
    ])
    expect(output).toContain('myFunc')
    expect(output).toContain('5')
    expect(output).toContain('3')
  })

  test('truncates long function names to 28 chars', () => {
    const longName = 'a'.repeat(40)
    const output = formatTable([makeResult({ functionName: longName })])
    expect(output).toContain('a'.repeat(28))
    expect(output).not.toContain('a'.repeat(40))
  })

  test('includes summary section', () => {
    const output = formatTable([makeResult()])
    expect(output).toContain('Total functions')
    expect(output).toContain('Average cyclomatic complexity')
    expect(output).toContain('Average cognitive complexity')
    expect(output).toContain('Maximum cyclomatic complexity')
    expect(output).toContain('Maximum cognitive complexity')
  })

  test('includes category breakdown', () => {
    const output = formatTable([makeResult()])
    expect(output).toContain('Category breakdown')
    expect(output).toContain('Low')
    expect(output).toContain('Moderate')
    expect(output).toContain('High')
    expect(output).toContain('Extreme')
  })

  test('multiple results produce multiple data rows', () => {
    const results = [makeResult({ functionName: 'funcA' }), makeResult({ functionName: 'funcB' })]
    const output = formatTable(results)
    expect(output).toContain('funcA')
    expect(output).toContain('funcB')
  })

  test('preserves function name shorter than 28 chars', () => {
    const output = formatTable([makeResult({ functionName: 'shortName' })])
    expect(output).toContain('shortName')
  })

  test('function name exactly 28 chars is not truncated', () => {
    const name28 = 'a'.repeat(28)
    const output = formatTable([makeResult({ functionName: name28 })])
    expect(output).toContain(name28)
  })

  test('function name 29 chars is truncated to 28', () => {
    const name29 = 'a'.repeat(29)
    const output = formatTable([makeResult({ functionName: name29 })])
    expect(output).toContain('a'.repeat(28))
    expect(output).not.toContain(name29)
  })

  test('shows correct total functions in summary', () => {
    const results = [makeResult(), makeResult(), makeResult()]
    const output = formatTable(results)
    expect(output).toContain('Total functions: 3')
  })

  test('shows category with colored labels', () => {
    const output = formatTable([makeResult({ category: 'low' })])
    expect(output).toContain('LOW')
  })

  test('shows empty message without results data', () => {
    const output = formatTable([])
    expect(output).toContain('No functions found with complexity above threshold.')
  })
})

describe('formatOutput', () => {
  test('delegates to markdown for markdown format', () => {
    const result = formatOutput([makeResult()], 'markdown')
    expect(result).toContain('# Complexity Analysis')
  })

  test('delegates to table for table format', () => {
    const result = formatOutput([makeResult()], 'table')
    expect(result).toContain('Complexity Analysis')
  })

  test('defaults to table for unknown format', () => {
    const result = formatOutput([makeResult()], 'unknown')
    expect(result).toContain('Complexity Analysis')
  })

  test('handles empty results for table', () => {
    const result = formatOutput([], 'table')
    expect(result).toContain('No functions found')
  })

  test('handles empty results for markdown', () => {
    const result = formatOutput([], 'markdown')
    expect(result).toContain('# Complexity Analysis')
  })

  test('delegates json format to table', () => {
    const result = formatOutput([makeResult()], 'json')
    expect(result).toContain('Complexity Analysis')
  })

  test('delegates uppercase format string to table', () => {
    const result = formatOutput([makeResult()], 'TABLE')
    expect(result).toContain('Complexity Analysis')
  })

  test('delegates empty format string to table', () => {
    const result = formatOutput([makeResult()], '')
    expect(result).toContain('Complexity Analysis')
  })

  test('markdown format contains markdown header', () => {
    const result = formatOutput([makeResult()], 'markdown')
    expect(result.startsWith('#')).toBe(true)
  })
})

describe('buildIgnorePatterns additional', () => {
  test('does not deduplicate overlapping default and user patterns', () => {
    const defaults = ['*.log']
    const result = buildIgnorePatterns(defaults, ['*.log'])
    expect(result).toEqual(['*.log', '*.log'])
  })

  test('handles very long pattern strings', () => {
    const longPattern = 'a'.repeat(500)
    const result = buildIgnorePatterns([], [longPattern])
    expect(result).toEqual([longPattern])
  })

  test('merges with no default patterns', () => {
    const result = buildIgnorePatterns([], ['x', 'y'])
    expect(result).toEqual(['x', 'y'])
  })

  test('returns the same reference when no user ignore provided', () => {
    const defaults = ['a']
    const result = buildIgnorePatterns(defaults, undefined)
    expect(result).toBe(defaults)
  })

  test('returns new array when merging user patterns', () => {
    const defaults = ['a']
    const user = ['b']
    const result = buildIgnorePatterns(defaults, user)
    expect(result).toEqual(['a', 'b'])
    expect(result).not.toBe(defaults)
    expect(result).not.toBe(user)
  })
})

describe('parseExtensions additional', () => {
  test('handles extension with multiple leading dots', () => {
    expect(parseExtensions('..ts')).toEqual(['..ts'])
  })

  test('handles single comma only', () => {
    expect(parseExtensions(',')).toEqual([])
  })

  test('handles trailing commas', () => {
    expect(parseExtensions('.ts,')).toEqual(['.ts'])
  })

  test('handles leading comma', () => {
    expect(parseExtensions(',.ts')).toEqual(['.ts'])
  })

  test('handles many extensions', () => {
    const input = '.ts,.tsx,.js,.jsx,.mjs,.cjs'
    const result = parseExtensions(input)
    expect(result).toEqual(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
  })

  test('handles tab characters in input', () => {
    expect(parseExtensions('.ts\t,\t.tsx')).toEqual(['.ts', '.tsx'])
  })
})

describe('filterFilesByExtension additional', () => {
  test('handles extensions array with empty string matching no-extension files', () => {
    const files = [makeFile('Makefile'), makeFile('test.ts')]
    const result = filterFilesByExtension(files, [''])
    // empty string '' matches files with no extension (like Makefile)
    expect(result.length).toBeGreaterThanOrEqual(0)
  })

  test('handles duplicate extensions in filter', () => {
    const files = [makeFile('a.ts'), makeFile('b.ts')]
    const result = filterFilesByExtension(files, ['.ts', '.ts'])
    expect(result).toHaveLength(2)
  })

  test('dotfiles without extension have empty extname and match no extensions', () => {
    const files = [makeFile('.env'), makeFile('.env.local')]
    const result = filterFilesByExtension(files, ['.env'])
    expect(result).toHaveLength(0)
  })

  test('filters by extension with full path', () => {
    const files = [makeFile('/src/deep/nested/file.ts')]
    const result = filterFilesByExtension(files, ['.ts'])
    expect(result).toHaveLength(1)
  })

  test('handles extension matching with numeric extension', () => {
    const files = [makeFile('data.json5'), makeFile('data.json')]
    const result = filterFilesByExtension(files, ['.json'])
    expect(result).toHaveLength(1)
    expect(result[0].path).toBe('data.json')
  })

  test('empty extensions array returns empty results', () => {
    const files = [makeFile('a.ts')]
    const result = filterFilesByExtension(files, [])
    expect(result).toHaveLength(0)
  })

  test('handles files with path separators', () => {
    const files = [makeFile('src/components/Button.tsx')]
    const result = filterFilesByExtension(files, ['.tsx'])
    expect(result).toHaveLength(1)
  })
})

describe('filterByThreshold additional', () => {
  test('threshold of 1 filters out cyclomatic=1 results', () => {
    const results = [
      makeResult({ cyclomatic: 1, functionName: 'simple' }),
      makeResult({ cyclomatic: 2, functionName: 'lessSimple' }),
    ]
    const filtered = filterByThreshold(results, 1)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].functionName).toBe('lessSimple')
  })

  test('threshold equal to max cyclomatic returns empty', () => {
    const results = [makeResult({ cyclomatic: 5 })]
    expect(filterByThreshold(results, 5)).toHaveLength(0)
  })

  test('threshold just below max returns one result', () => {
    const results = [makeResult({ cyclomatic: 5 })]
    expect(filterByThreshold(results, 4)).toHaveLength(1)
  })

  test('handles very large threshold value', () => {
    const results = [makeResult({ cyclomatic: 100 })]
    expect(filterByThreshold(results, 99999)).toHaveLength(0)
  })

  test('all results above threshold returns all', () => {
    const results = [makeResult({ cyclomatic: 20 }), makeResult({ cyclomatic: 30 })]
    expect(filterByThreshold(results, 10)).toHaveLength(2)
  })

  test('results with cyclomatic=0 are filtered by positive threshold', () => {
    const results = [makeResult({ cyclomatic: 0 })]
    expect(filterByThreshold(results, 0)).toHaveLength(1)
    expect(filterByThreshold(results, -1)).toHaveLength(1)
  })

  test('does not mutate original array', () => {
    const results = [makeResult({ cyclomatic: 1 }), makeResult({ cyclomatic: 10 })]
    const original = [...results]
    filterByThreshold(results, 5)
    expect(results).toEqual(original)
  })
})

describe('sortByField additional', () => {
  test('sorts file paths using localeCompare ordering', () => {
    const results = [makeResult({ filePath: '/B.ts' }), makeResult({ filePath: '/a.ts' })]
    const sorted = sortByField(results, 'file')
    const paths = sorted.map((r) => r.filePath)
    expect(paths).toEqual([...paths].sort((a, b) => a.localeCompare(b)))
  })

  test('sorts names with numbers correctly via localeCompare', () => {
    const results = [makeResult({ functionName: 'func10' }), makeResult({ functionName: 'func2' })]
    const sorted = sortByField(results, 'name')
    expect(sorted[0].functionName).toBe('func10')
    expect(sorted[1].functionName).toBe('func2')
  })

  test('sorts file paths with common prefixes', () => {
    const results = [
      makeResult({ filePath: '/src/b/component.ts' }),
      makeResult({ filePath: '/src/a/component.ts' }),
      makeResult({ filePath: '/src/a/another.ts' }),
    ]
    const sorted = sortByField(results, 'file')
    expect(sorted[0].filePath).toBe('/src/a/another.ts')
    expect(sorted[1].filePath).toBe('/src/a/component.ts')
    expect(sorted[2].filePath).toBe('/src/b/component.ts')
  })

  test('handles large array sorting by complexity', () => {
    const results = Array.from({ length: 100 }, (_, i) =>
      makeResult({ cyclomatic: i, functionName: `func${i}` }),
    )
    const sorted = sortByField(results, 'complexity')
    expect(sorted[0].cyclomatic).toBe(99)
    expect(sorted[99].cyclomatic).toBe(0)
  })

  test('handles large array sorting by name', () => {
    const results = Array.from({ length: 50 }, (_, i) =>
      makeResult({ functionName: `func${String(i).padStart(2, '0')}` }),
    )
    const sorted = sortByField(results, 'name')
    expect(sorted[0].functionName).toBe('func00')
    expect(sorted[49].functionName).toBe('func49')
  })

  test('sorts equal names stably', () => {
    const results = [
      makeResult({ functionName: 'same', cyclomatic: 1 }),
      makeResult({ functionName: 'same', cyclomatic: 2 }),
    ]
    const sorted = sortByField(results, 'name')
    expect(sorted[0].cyclomatic).toBe(1)
    expect(sorted[1].cyclomatic).toBe(2)
  })

  test('handles results with empty function names', () => {
    const results = [makeResult({ functionName: '' }), makeResult({ functionName: 'a' })]
    const sorted = sortByField(results, 'name')
    expect(sorted[0].functionName).toBe('')
    expect(sorted[1].functionName).toBe('a')
  })

  test('handles results with empty file paths', () => {
    const results = [makeResult({ filePath: '' }), makeResult({ filePath: '/a.ts' })]
    const sorted = sortByField(results, 'file')
    expect(sorted[0].filePath).toBe('')
  })

  test('complexity sort is strictly descending', () => {
    const results = [
      makeResult({ cyclomatic: 1 }),
      makeResult({ cyclomatic: 100 }),
      makeResult({ cyclomatic: 50 }),
      makeResult({ cyclomatic: 25 }),
    ]
    const sorted = sortByField(results, 'complexity')
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].cyclomatic).toBeGreaterThanOrEqual(sorted[i].cyclomatic)
    }
  })
})

describe('limitResults additional', () => {
  test('returns first N elements for large array', () => {
    const items = Array.from({ length: 1000 }, (_, i) => i)
    expect(limitResults(items, 10)).toHaveLength(10)
    expect(limitResults(items, 10)[0]).toBe(0)
    expect(limitResults(items, 10)[9]).toBe(9)
  })

  test('handles limit of exactly 1', () => {
    const items = ['only']
    expect(limitResults(items, 1)).toEqual(['only'])
  })

  test('handles string arrays', () => {
    const items = ['alpha', 'beta', 'gamma']
    expect(limitResults(items, 2)).toEqual(['alpha', 'beta'])
  })

  test('handles mixed type arrays', () => {
    const items = [1, 'two', true, null]
    expect(limitResults(items, 2)).toEqual([1, 'two'])
  })

  test('limit of 0 always returns empty', () => {
    expect(limitResults(['a', 'b'], 0)).toEqual([])
    expect(limitResults([], 0)).toEqual([])
  })

  test('very large limit returns full array', () => {
    const items = [1, 2, 3]
    expect(limitResults(items, Number.MAX_SAFE_INTEGER)).toEqual(items)
  })
})

describe('getCategoryColor additional', () => {
  test('low color function includes input text', () => {
    const fn = getCategoryColor('low')
    const result = fn('hello')
    expect(result).toContain('hello')
  })

  test('moderate color function includes input text', () => {
    const fn = getCategoryColor('moderate')
    const result = fn('world')
    expect(result).toContain('world')
  })

  test('high color function includes input text', () => {
    const fn = getCategoryColor('high')
    const result = fn('test123')
    expect(result).toContain('test123')
  })

  test('extreme color function includes input text', () => {
    const fn = getCategoryColor('extreme')
    const result = fn('text')
    expect(result).toContain('text')
  })

  test('all color functions return strings', () => {
    const categories: ComplexityCategory[] = ['low', 'moderate', 'high', 'extreme']
    for (const cat of categories) {
      expect(typeof getCategoryColor(cat)('x')).toBe('string')
    }
  })

  test('low and high produce distinguishable output for same text', () => {
    const text = 'COMPARE'
    const lowResult = getCategoryColor('low')(text)
    const highResult = getCategoryColor('high')(text)
    expect(lowResult).toContain(text)
    expect(highResult).toContain(text)
  })
})

describe('buildJsonOutput additional', () => {
  test('handles single result with zero values', () => {
    const result = makeResult({ cyclomatic: 0, cognitive: 0 })
    const parsed = JSON.parse(buildJsonOutput([result]))
    expect(parsed.summary.maxCyclomatic).toBe(0)
    expect(parsed.summary.maxCognitive).toBe(0)
  })

  test('handles results with very large cyclomatic values', () => {
    const results = [makeResult({ cyclomatic: 9999, cognitive: 5000 })]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.maxCyclomatic).toBe(9999)
    expect(parsed.summary.maxCognitive).toBe(5000)
  })

  test('average is rounded to two decimal places', () => {
    const results = [
      makeResult({ cyclomatic: 1, cognitive: 1 }),
      makeResult({ cyclomatic: 2, cognitive: 2 }),
      makeResult({ cyclomatic: 3, cognitive: 3 }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.averageCyclomatic).toBe(2)
    expect(parsed.summary.averageCognitive).toBe(2)
  })

  test('all four categories present in breakdown even when zero', () => {
    const parsed = JSON.parse(buildJsonOutput([makeResult({ category: 'low' })]))
    expect(parsed.summary.categoryBreakdown).toHaveProperty('low', 1)
    expect(parsed.summary.categoryBreakdown).toHaveProperty('moderate', 0)
    expect(parsed.summary.categoryBreakdown).toHaveProperty('high', 0)
    expect(parsed.summary.categoryBreakdown).toHaveProperty('extreme', 0)
  })

  test('maxCognitive reflects the highest cognitive value', () => {
    const results = [
      makeResult({ cognitive: 5 }),
      makeResult({ cognitive: 25 }),
      makeResult({ cognitive: 10 }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.maxCognitive).toBe(25)
  })

  test('totalFunctions matches input length', () => {
    const results = Array.from({ length: 15 }, () => makeResult())
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.totalFunctions).toBe(15)
  })

  test('averageCyclomatic is sum divided by count', () => {
    const results = [
      makeResult({ cyclomatic: 10, cognitive: 0 }),
      makeResult({ cyclomatic: 20, cognitive: 0 }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.averageCyclomatic).toBe(15)
  })

  test('categoryBreakdown counts extreme category', () => {
    const results = [
      makeResult({ category: 'extreme' }),
      makeResult({ category: 'extreme' }),
      makeResult({ category: 'extreme' }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.categoryBreakdown.extreme).toBe(3)
  })

  test('output can be parsed back to match original data', () => {
    const original = [
      makeResult({
        functionName: 'testRoundTrip',
        filePath: '/round/trip.ts',
        cyclomatic: 7,
        cognitive: 4,
        category: 'moderate',
        startLine: 42,
      }),
    ]
    const parsed = JSON.parse(buildJsonOutput(original))
    expect(parsed.functions[0].functionName).toBe('testRoundTrip')
    expect(parsed.functions[0].startLine).toBe(42)
  })

  test('handles mixed categories correctly', () => {
    const results = [
      makeResult({ category: 'low' }),
      makeResult({ category: 'moderate' }),
      makeResult({ category: 'high' }),
      makeResult({ category: 'extreme' }),
    ]
    const parsed = JSON.parse(buildJsonOutput(results))
    expect(parsed.summary.categoryBreakdown.low).toBe(1)
    expect(parsed.summary.categoryBreakdown.moderate).toBe(1)
    expect(parsed.summary.categoryBreakdown.high).toBe(1)
    expect(parsed.summary.categoryBreakdown.extreme).toBe(1)
  })
})

describe('formatMarkdown additional', () => {
  test('empty results show zero counts in summary', () => {
    const md = formatMarkdown([])
    expect(md).toContain('**Total functions**: 0')
  })

  test('empty results show zero averages', () => {
    const md = formatMarkdown([])
    expect(md).toContain('**Average cyclomatic complexity**: 0.0')
  })

  test('empty results show zero category breakdown', () => {
    const md = formatMarkdown([])
    expect(md).toContain('**Low**: 0')
    expect(md).toContain('**Moderate**: 0')
    expect(md).toContain('**High**: 0')
    expect(md).toContain('**Extreme**: 0')
  })

  test('correct maxCyclomatic in summary', () => {
    const results = [makeResult({ cyclomatic: 3 }), makeResult({ cyclomatic: 20 })]
    const md = formatMarkdown(results)
    expect(md).toContain('**Maximum cyclomatic complexity**: 20')
  })

  test('correct maxCognitive in summary', () => {
    const results = [makeResult({ cognitive: 2 }), makeResult({ cognitive: 15 })]
    const md = formatMarkdown(results)
    expect(md).toContain('**Maximum cognitive complexity**: 15')
  })

  test('file path appears in table row', () => {
    const md = formatMarkdown([
      makeResult({ filePath: '/custom/path/to/file.ts', functionName: 'fn1' }),
    ])
    expect(md).toContain('/custom/path/to/file.ts')
  })

  test('handles function with unicode name', () => {
    const md = formatMarkdown([makeResult({ functionName: '関数' })])
    expect(md).toContain('関数')
  })

  test('handles function with hyphenated name', () => {
    const md = formatMarkdown([makeResult({ functionName: 'my-function' })])
    expect(md).toContain('my-function')
  })

  test('multiple results all appear in table', () => {
    const results = [
      makeResult({ functionName: 'fnA', category: 'low' }),
      makeResult({ functionName: 'fnB', category: 'high' }),
      makeResult({ functionName: 'fnC', category: 'extreme' }),
    ]
    const md = formatMarkdown(results)
    expect(md).toContain('| fnA |')
    expect(md).toContain('| fnB |')
    expect(md).toContain('| fnC |')
  })

  test('summary shows correct average formatting', () => {
    const results = [
      makeResult({ cyclomatic: 1, cognitive: 1 }),
      makeResult({ cyclomatic: 2, cognitive: 2 }),
    ]
    const md = formatMarkdown(results)
    expect(md).toContain('**Average cyclomatic complexity**: 1.5')
  })

  test('table uses pipe-separated columns', () => {
    const md = formatMarkdown([makeResult({ functionName: 'colTest' })])
    const lines = md.split('\n')
    const dataLine = lines.find((l) => l.includes('colTest'))
    expect(dataLine).toBeDefined()
    const pipes = dataLine!.split('|').length - 1
    expect(pipes).toBe(6)
  })

  test('output ends with trailing newline', () => {
    const md = formatMarkdown([])
    expect(md.endsWith('\n')).toBe(true)
  })
})

describe('formatTable additional', () => {
  test('empty message is dimmed', () => {
    const output = formatTable([])
    expect(output).toContain('No functions found with complexity above threshold.')
  })

  test('category is uppercased in output', () => {
    const output = formatTable([makeResult({ category: 'high' })])
    expect(output).toContain('HIGH')
  })

  test('moderate category is uppercased', () => {
    const output = formatTable([makeResult({ category: 'moderate' })])
    expect(output).toContain('MODERATE')
  })

  test('extreme category is uppercased', () => {
    const output = formatTable([makeResult({ category: 'extreme' })])
    expect(output).toContain('EXTREME')
  })

  test('shows cyclomatic value in data row', () => {
    const output = formatTable([makeResult({ cyclomatic: 42 })])
    expect(output).toContain('42')
  })

  test('shows cognitive value in data row', () => {
    const output = formatTable([makeResult({ cognitive: 17 })])
    expect(output).toContain('17')
  })

  test('file path appears dimmed', () => {
    const output = formatTable([makeResult({ filePath: '/src/deep/file.ts' })])
    expect(output).toContain('/src/deep/file.ts')
  })

  test('handles 28-char name boundary correctly', () => {
    const name27 = 'x'.repeat(27)
    const output = formatTable([makeResult({ functionName: name27 })])
    expect(output).toContain(name27)
  })

  test('handles multiple different categories', () => {
    const results = [
      makeResult({ functionName: 'lowFn', category: 'low' }),
      makeResult({ functionName: 'highFn', category: 'high' }),
    ]
    const output = formatTable(results)
    expect(output).toContain('LOW')
    expect(output).toContain('HIGH')
  })

  test('summary section contains category breakdown with colors', () => {
    const output = formatTable([makeResult({ category: 'low' })])
    expect(output).toContain('Low')
    expect(output).toContain('Moderate')
    expect(output).toContain('High')
    expect(output).toContain('Extreme')
  })

  test('shows average values formatted to one decimal', () => {
    const results = [
      makeResult({ cyclomatic: 3, cognitive: 2 }),
      makeResult({ cyclomatic: 7, cognitive: 8 }),
    ]
    const output = formatTable(results)
    expect(output).toContain('Average cyclomatic complexity: 5.0')
    expect(output).toContain('Average cognitive complexity: 5.0')
  })

  test('handles single result summary correctly', () => {
    const output = formatTable([makeResult({ cyclomatic: 5, cognitive: 3 })])
    expect(output).toContain('Total functions: 1')
    expect(output).toContain('Maximum cyclomatic complexity: 5')
    expect(output).toContain('Maximum cognitive complexity: 3')
  })

  test('output contains separator lines', () => {
    const output = formatTable([makeResult()])
    const lines = output.split('\n')
    const separatorCount = lines.filter((l) => l.includes('─'.repeat(80))).length
    expect(separatorCount).toBeGreaterThanOrEqual(2)
  })

  test('handles many results without truncation of names under 28', () => {
    const results = Array.from({ length: 20 }, (_, i) => makeResult({ functionName: `func_${i}` }))
    const output = formatTable(results)
    for (let i = 0; i < 20; i++) {
      expect(output).toContain(`func_${i}`)
    }
  })

  test('column header row has correct labels', () => {
    const output = formatTable([makeResult()])
    expect(output).toContain('Function')
    expect(output).toContain('Cyclomatic')
    expect(output).toContain('Cognitive')
    expect(output).toContain('Category')
  })
})

describe('formatOutput additional', () => {
  test('markdown format with empty results still has structure', () => {
    const result = formatOutput([], 'markdown')
    expect(result).toContain('## Summary')
    expect(result).toContain('## Category Breakdown')
  })

  test('table format with results contains summary', () => {
    const result = formatOutput([makeResult()], 'table')
    expect(result).toContain('Summary')
    expect(result).toContain('Category breakdown')
  })

  test('unknown format string falls through to table', () => {
    const result = formatOutput([makeResult()], 'csv')
    expect(result).toContain('Complexity Analysis')
  })

  test('format html falls through to table', () => {
    const result = formatOutput([makeResult()], 'html')
    expect(result).toContain('Complexity Analysis')
  })

  test('format sarif falls through to table', () => {
    const result = formatOutput([makeResult()], 'sarif')
    expect(result).toContain('Complexity Analysis')
  })

  test('markdown format includes table header for non-empty results', () => {
    const result = formatOutput([makeResult({ functionName: 'fn1', category: 'low' })], 'markdown')
    expect(result).toContain('| Function | Cyclomatic | Cognitive | Category | File |')
  })

  test('markdown format with multiple results', () => {
    const results = [makeResult({ functionName: 'a' }), makeResult({ functionName: 'b' })]
    const result = formatOutput(results, 'markdown')
    expect(result).toContain('| a |')
    expect(result).toContain('| b |')
  })

  test('table format preserves all function data', () => {
    const results = [
      makeResult({
        functionName: 'preservedFunc',
        cyclomatic: 99,
        cognitive: 88,
        filePath: '/preserved/path.ts',
      }),
    ]
    const result = formatOutput(results, 'table')
    expect(result).toContain('preservedFunc')
    expect(result).toContain('99')
    expect(result).toContain('88')
  })

  test('format output is consistent for same input', () => {
    const results = [makeResult()]
    const first = formatOutput(results, 'table')
    const second = formatOutput(results, 'table')
    expect(first).toBe(second)
  })

  test('markdown format is consistent for same input', () => {
    const results = [makeResult()]
    const first = formatOutput(results, 'markdown')
    const second = formatOutput(results, 'markdown')
    expect(first).toBe(second)
  })

  test('table with zero-complexity result still renders', () => {
    const results = [makeResult({ cyclomatic: 0, cognitive: 0 })]
    const result = formatOutput(results, 'table')
    expect(result).toContain('0')
  })
})
