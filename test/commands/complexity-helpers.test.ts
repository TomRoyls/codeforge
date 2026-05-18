import { describe, expect, it } from 'vitest'

import {
  buildIgnorePatterns,
  parseExtensions,
  filterByThreshold,
  sortByField,
  limitResults,
  buildJsonOutput,
  formatOutput,
} from '../../src/commands/complexity-helpers.js'

import { calculateComplexitySummary } from '../../src/core/complexity.js'

// ─── Helpers ───

function makeComplexity(overrides: Record<string, unknown> = {}) {
  return {
    functionName: overrides.functionName ?? 'myFunc',
    filePath: overrides.filePath ?? 'src/app.ts',
    cyclomatic: overrides.cyclomatic ?? 5,
    cognitive: overrides.cognitive ?? 3,
    category: overrides.category ?? 'low',
    line: overrides.line ?? 10,
    column: overrides.column ?? 0,
  }
}

// ─── buildIgnorePatterns ───

describe('buildIgnorePatterns', () => {
  it('returns default when no user ignore', () => {
    expect(buildIgnorePatterns(['node_modules'], undefined)).toEqual(['node_modules'])
  })

  it('merges default with user patterns', () => {
    const result = buildIgnorePatterns(['node_modules'], ['dist'])
    expect(result).toEqual(['node_modules', 'dist'])
  })

  it('returns default when user ignore is empty', () => {
    expect(buildIgnorePatterns(['a'], [])).toEqual(['a'])
  })
})

// ─── parseExtensions ───

describe('parseExtensions', () => {
  it('parses comma-separated extensions', () => {
    expect(parseExtensions('.ts,.tsx')).toEqual(['.ts', '.tsx'])
  })

  it('trims whitespace', () => {
    expect(parseExtensions(' .ts , .tsx ')).toEqual(['.ts', '.tsx'])
  })

  it('filters empty strings', () => {
    expect(parseExtensions('.ts,,.tsx')).toEqual(['.ts', '.tsx'])
  })

  it('returns null for empty string', () => {
    expect(parseExtensions('')).toBeNull()
  })
})

// ─── filterByThreshold ───

describe('filterByThreshold', () => {
  it('returns all when threshold is 0', () => {
    const items = [makeComplexity({ cyclomatic: 1 }), makeComplexity({ cyclomatic: 10 })]
    expect(filterByThreshold(items, 0)).toHaveLength(2)
  })

  it('returns all when threshold is negative', () => {
    const items = [makeComplexity({ cyclomatic: 1 })]
    expect(filterByThreshold(items, -1)).toHaveLength(1)
  })

  it('filters below threshold', () => {
    const items = [
      makeComplexity({ cyclomatic: 3 }),
      makeComplexity({ cyclomatic: 8 }),
      makeComplexity({ cyclomatic: 12 }),
    ]
    expect(filterByThreshold(items, 5)).toHaveLength(2)
  })
})

// ─── sortByField ───

describe('sortByField', () => {
  it('sorts by complexity descending', () => {
    const items = [
      makeComplexity({ cyclomatic: 3 }),
      makeComplexity({ cyclomatic: 10 }),
      makeComplexity({ cyclomatic: 5 }),
    ]
    const sorted = sortByField(items, 'complexity')
    expect(sorted[0]!.cyclomatic).toBe(10)
    expect(sorted[2]!.cyclomatic).toBe(3)
  })

  it('sorts by file path', () => {
    const items = [
      makeComplexity({ filePath: 'z.ts' }),
      makeComplexity({ filePath: 'a.ts' }),
    ]
    const sorted = sortByField(items, 'file')
    expect(sorted[0]!.filePath).toBe('a.ts')
  })

  it('sorts by function name', () => {
    const items = [
      makeComplexity({ functionName: 'zebra' }),
      makeComplexity({ functionName: 'alpha' }),
    ]
    const sorted = sortByField(items, 'name')
    expect(sorted[0]!.functionName).toBe('alpha')
  })

  it('does not mutate original array', () => {
    const items = [makeComplexity({ cyclomatic: 1 }), makeComplexity({ cyclomatic: 5 })]
    const copy = [...items]
    sortByField(items, 'complexity')
    expect(items).toEqual(copy)
  })
})

// ─── limitResults ───

describe('limitResults', () => {
  it('returns all items when within limit', () => {
    expect(limitResults([1, 2, 3], 5)).toEqual([1, 2, 3])
  })

  it('truncates to limit', () => {
    expect(limitResults([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
  })

  it('handles limit of 0', () => {
    expect(limitResults([1, 2, 3], 0)).toEqual([])
  })
})

// ─── buildJsonOutput ───

describe('buildJsonOutput', () => {
  it('produces valid JSON with functions and summary', () => {
    const items = [makeComplexity()]
    const json = buildJsonOutput(items)
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed.functions).toHaveLength(1)
    expect(parsed).toHaveProperty('summary')
  })
})

// ─── formatOutput ───

describe('formatOutput', () => {
  it('returns markdown when format is markdown', () => {
    const result = formatOutput([makeComplexity()], 'markdown')
    expect(result).toContain('# Complexity Analysis')
  })

  it('returns table format by default', () => {
    const result = formatOutput([makeComplexity()], 'table')
    expect(result).toContain('Complexity Analysis')
  })
})
