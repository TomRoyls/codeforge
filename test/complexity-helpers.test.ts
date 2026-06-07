import { describe, it, expect } from 'vitest'

import {
  buildIgnorePatterns,
  parseExtensions,
  filterByThreshold,
  sortByField,
  getCategoryColor,
  limitResults,
  buildJsonOutput,
  formatMarkdown,
  formatTable,
  formatOutput,
} from '../src/commands/complexity-helpers.js'

import type { FunctionComplexity } from '../src/core/complexity.js'
import type { ComplexityCategory } from '../src/core/complexity.js'

// ─── Helpers ──────────────────────────────────────────

function makeComplexity(overrides: Partial<FunctionComplexity> = {}): FunctionComplexity {
  return {
    category: 'low',
    cognitive: 1,
    cyclomatic: 2,
    filePath: 'src/foo.ts',
    functionName: 'myFunc',
    startLine: 10,
    ...overrides,
  }
}

// ─── buildIgnorePatterns ──────────────────────────────
describe('buildIgnorePatterns', () => {
  it('returns default ignore when no user ignore provided', () => {
    const defaults = ['node_modules/**', 'dist/**']
    expect(buildIgnorePatterns(defaults, undefined)).toEqual(defaults)
  })

  it('merges default and user ignore patterns', () => {
    const defaults = ['node_modules/**']
    const user = ['coverage/**', '*.test.ts']

    const result = buildIgnorePatterns(defaults, user)

    expect(result).toEqual(['node_modules/**', 'coverage/**', '*.test.ts'])
  })

  it('returns defaults when user provides empty array', () => {
    const defaults = ['node_modules/**']
    expect(buildIgnorePatterns(defaults, [])).toEqual(['node_modules/**'])
  })

  it('handles empty defaults', () => {
    expect(buildIgnorePatterns([], ['custom/**'])).toEqual(['custom/**'])
  })
})

// ─── parseExtensions ──────────────────────────────────
describe('parseExtensions', () => {
  it('returns null for empty string', () => {
    expect(parseExtensions('')).toBeNull()
  })

  it('parses comma-separated extensions', () => {
    expect(parseExtensions('.ts,.tsx')).toEqual(['.ts', '.tsx'])
  })

  it('trims whitespace from extensions', () => {
    expect(parseExtensions(' .ts , .tsx ')).toEqual(['.ts', '.tsx'])
  })

  it('filters out empty segments', () => {
    expect(parseExtensions('.ts,,.tsx,')).toEqual(['.ts', '.tsx'])
  })

  it('handles single extension', () => {
    expect(parseExtensions('.js')).toEqual(['.js'])
  })

  it('handles extensions with spaces around commas', () => {
    expect(parseExtensions('.ts , .tsx , .jsx')).toEqual(['.ts', '.tsx', '.jsx'])
  })
})

// ─── filterByThreshold ────────────────────────────────
describe('filterByThreshold', () => {
  it('returns all results when threshold is 0', () => {
    const results = [makeComplexity({ cyclomatic: 1 }), makeComplexity({ cyclomatic: 100 })]
    expect(filterByThreshold(results, 0)).toHaveLength(2)
  })

  it('returns all results when threshold is negative', () => {
    const results = [makeComplexity({ cyclomatic: 1 })]
    expect(filterByThreshold(results, -5)).toHaveLength(1)
  })

  it('filters out results at or below threshold', () => {
    const results = [
      makeComplexity({ cyclomatic: 5 }),
      makeComplexity({ cyclomatic: 10 }),
      makeComplexity({ cyclomatic: 15 }),
    ]

    const filtered = filterByThreshold(results, 10)

    expect(filtered).toHaveLength(1)
    expect(filtered[0].cyclomatic).toBe(15)
  })

  it('returns empty when all below threshold', () => {
    const results = [makeComplexity({ cyclomatic: 3 })]
    expect(filterByThreshold(results, 10)).toHaveLength(0)
  })

  it('returns all when all above threshold', () => {
    const results = [makeComplexity({ cyclomatic: 20 }), makeComplexity({ cyclomatic: 30 })]
    expect(filterByThreshold(results, 5)).toHaveLength(2)
  })

  it('handles empty input', () => {
    expect(filterByThreshold([], 10)).toHaveLength(0)
  })
})

// ─── sortByField ──────────────────────────────────────
describe('sortByField', () => {
  const results = [
    makeComplexity({ functionName: 'beta', filePath: 'a.ts', cyclomatic: 5 }),
    makeComplexity({ functionName: 'alpha', filePath: 'c.ts', cyclomatic: 10 }),
    makeComplexity({ functionName: 'gamma', filePath: 'b.ts', cyclomatic: 3 }),
  ]

  it('sorts by complexity descending', () => {
    const sorted = sortByField(results, 'complexity')
    expect(sorted.map((r) => r.cyclomatic)).toEqual([10, 5, 3])
  })

  it('sorts by file path alphabetically', () => {
    const sorted = sortByField(results, 'file')
    expect(sorted.map((r) => r.filePath)).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  it('sorts by function name alphabetically', () => {
    const sorted = sortByField(results, 'name')
    expect(sorted.map((r) => r.functionName)).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('does not mutate original array', () => {
    const original = [...results]
    sortByField(results, 'complexity')
    expect(results).toEqual(original)
  })

  it('handles empty input', () => {
    expect(sortByField([], 'complexity')).toEqual([])
  })

  it('defaults to name sort for unknown field', () => {
    const sorted = sortByField(results, 'unknown' as any)
    expect(sorted.map((r) => r.functionName)).toEqual(['alpha', 'beta', 'gamma'])
  })
})

// ─── getCategoryColor ─────────────────────────────────
describe('getCategoryColor', () => {
  it('returns a function for each category', () => {
    const categories: ComplexityCategory[] = ['low', 'moderate', 'high', 'extreme']

    for (const cat of categories) {
      const colorFn = getCategoryColor(cat)
      expect(typeof colorFn).toBe('function')
      expect(typeof colorFn('text')).toBe('string')
    }
  })

  it('applies color to text', () => {
    const result = getCategoryColor('low')('test')
    expect(result).toContain('test')
  })

  it('handles unknown category with fallback', () => {
    const colorFn = getCategoryColor('unknown' as any)
    expect(typeof colorFn('text')).toBe('string')
  })
})

// ─── limitResults ─────────────────────────────────────
describe('limitResults', () => {
  it('limits array to specified count', () => {
    const items = [1, 2, 3, 4, 5]
    expect(limitResults(items, 3)).toEqual([1, 2, 3])
  })

  it('returns full array when limit exceeds length', () => {
    const items = [1, 2]
    expect(limitResults(items, 10)).toEqual([1, 2])
  })

  it('returns empty array for limit 0', () => {
    expect(limitResults([1, 2, 3], 0)).toEqual([])
  })

  it('handles empty input', () => {
    expect(limitResults([], 5)).toEqual([])
  })
})

// ─── buildJsonOutput ──────────────────────────────────
describe('buildJsonOutput', () => {
  it('produces valid JSON with functions and summary', () => {
    const data = [makeComplexity()]
    const json = buildJsonOutput(data)
    const parsed = JSON.parse(json)

    expect(parsed).toHaveProperty('functions')
    expect(parsed).toHaveProperty('summary')
    expect(parsed.functions).toHaveLength(1)
  })

  it('includes summary fields', () => {
    const data = [makeComplexity({ cyclomatic: 5, cognitive: 3 })]
    const parsed = JSON.parse(buildJsonOutput(data))

    expect(parsed.summary).toHaveProperty('totalFunctions')
    expect(parsed.summary).toHaveProperty('averageCyclomatic')
    expect(parsed.summary).toHaveProperty('averageCognitive')
    expect(parsed.summary).toHaveProperty('maxCyclomatic')
    expect(parsed.summary).toHaveProperty('maxCognitive')
    expect(parsed.summary).toHaveProperty('categoryBreakdown')
  })

  it('handles empty input', () => {
    const parsed = JSON.parse(buildJsonOutput([]))
    expect(parsed.functions).toHaveLength(0)
    expect(parsed.summary.totalFunctions).toBe(0)
  })
})

// ─── formatMarkdown ───────────────────────────────────
describe('formatMarkdown', () => {
  it('produces markdown table header', () => {
    const result = formatMarkdown([makeComplexity()])
    expect(result).toContain('# Complexity Analysis')
    expect(result).toContain('| Function |')
    expect(result).toContain('|---')
  })

  it('includes each function in table rows', () => {
    const data = [
      makeComplexity({ functionName: 'funcA', cyclomatic: 5, cognitive: 2, category: 'low', filePath: 'a.ts' }),
      makeComplexity({ functionName: 'funcB', cyclomatic: 15, cognitive: 10, category: 'high', filePath: 'b.ts' }),
    ]
    const result = formatMarkdown(data)

    expect(result).toContain('funcA')
    expect(result).toContain('funcB')
    expect(result).toContain('5')
    expect(result).toContain('15')
  })

  it('includes summary section', () => {
    const result = formatMarkdown([makeComplexity()])
    expect(result).toContain('## Summary')
    expect(result).toContain('Total functions')
  })

  it('includes category breakdown', () => {
    const result = formatMarkdown([makeComplexity()])
    expect(result).toContain('## Category Breakdown')
    expect(result).toContain('Low')
    expect(result).toContain('Moderate')
    expect(result).toContain('High')
    expect(result).toContain('Extreme')
  })

  it('handles empty results', () => {
    const result = formatMarkdown([])
    expect(result).toContain('# Complexity Analysis')
  })
})

// ─── formatTable ──────────────────────────────────────
describe('formatTable', () => {
  it('returns message for empty results', () => {
    const result = formatTable([])
    expect(result).toContain('No functions found')
  })

  it('produces table output with function data', () => {
    const data = [makeComplexity({ functionName: 'testFunc' })]
    const result = formatTable(data)

    expect(result).toContain('testFunc')
    expect(result).toContain('Complexity Analysis')
    expect(result).toContain('Summary:')
  })

  it('includes category breakdown in table', () => {
    const data = [makeComplexity({ category: 'high' })]
    const result = formatTable(data)

    expect(result).toContain('Category breakdown:')
    expect(result).toContain('High')
  })

  it('truncates long function names to 28 characters', () => {
    const data = [makeComplexity({ functionName: 'aVeryLongFunctionNameThatExceedsThirtyCharacters' })]
    const result = formatTable(data)

    expect(result).toContain('aVeryLongFunctionNameThatExc')
    expect(result).not.toContain('aVeryLongFunctionNameThatExceedsThirtyCharacters')
  })
})

// ─── formatOutput ─────────────────────────────────────
describe('formatOutput', () => {
  it('returns markdown when format is markdown', () => {
    const data = [makeComplexity()]
    const result = formatOutput(data, 'markdown')

    expect(result).toContain('# Complexity Analysis')
  })

  it('returns table when format is not markdown', () => {
    const data = [makeComplexity()]
    const result = formatOutput(data, 'table')

    expect(result).toContain('Complexity Analysis')
  })

  it('defaults to table for unknown format', () => {
    const data = [makeComplexity()]
    const result = formatOutput(data, 'json')

    expect(result).toContain('Complexity Analysis')
  })
})
