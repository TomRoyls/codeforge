import { describe, expect, it } from 'vitest'

import {
  buildLocatorResult,
  computeRelevance,
  filterByType,
  findDefinitions,
  findExports,
  findImports,
  findUsages,
  getSurroundingLines,
  groupElementsByFile,
  parseQuery,
  type LocatedElement,
  type LocatorStats,
} from '../src/commands/locator-helpers.js'
import {
  formatDefinitionHighlight,
  formatGroupedResults,
  formatImportExportChain,
  formatJson,
  formatRelevanceIndicator,
  formatResult,
  formatStats,
  formatUsageTable,
} from '../src/commands/locator-format-helpers.js'

// ─── parseQuery ───────────────────────────────────────────────────────────

describe('parseQuery', () => {
  it('infers class for uppercase start', () => {
    const info = parseQuery('MyClass')
    expect(info.inferredType).toBe('class')
    expect(info.isRegex).toBe(false)
    expect(info.isGlob).toBe(false)
  })

  it('infers function for lowercase start', () => {
    expect(parseQuery('myFunc').inferredType).toBe('function')
  })

  it('detects regex pattern with slashes', () => {
    const info = parseQuery('/MyClass/')
    expect(info.isRegex).toBe(true)
  })

  it('detects glob pattern with asterisk', () => {
    const info = parseQuery('handle*')
    expect(info.isGlob).toBe(true)
    expect(info.pattern.test('handleClick')).toBe(true)
    expect(info.pattern.test('handle')).toBe(true)
  })

  it('creates case-insensitive glob pattern', () => {
    const info = parseQuery('foo*')
    expect(info.pattern.test('FooBar')).toBe(true)
  })

  it('escapes special regex chars in plain query', () => {
    const info = parseQuery('my.func')
    expect(info.pattern.test('my.func')).toBe(true)
    expect(info.pattern.test('myXfunc')).toBe(false)
  })

  it('stores raw query', () => {
    expect(parseQuery('testQuery').raw).toBe('testQuery')
  })
})

// ─── getSurroundingLines ─────────────────────────────────────────────────

describe('getSurroundingLines', () => {
  it('gets 2 lines before and after', () => {
    const lines = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const result = getSurroundingLines(lines, 3)
    expect(result).toEqual(['b', 'c', 'd', 'e', 'f'])
  })

  it('clamps to start of array', () => {
    const lines = ['a', 'b', 'c']
    const result = getSurroundingLines(lines, 0)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('clamps to end of array', () => {
    const lines = ['a', 'b', 'c']
    const result = getSurroundingLines(lines, 2)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('handles single-line array', () => {
    const result = getSurroundingLines(['only'], 0)
    expect(result).toEqual(['only'])
  })
})

// ─── computeRelevance ─────────────────────────────────────────────────────

describe('computeRelevance', () => {
  it('returns 1.0 for exact match', () => {
    expect(computeRelevance('foo', 'foo')).toBe(1.0)
  })

  it('returns 0.8 for case-insensitive match', () => {
    expect(computeRelevance('Foo', 'foo')).toBe(0.8)
    expect(computeRelevance('FOO', 'foo')).toBe(0.8)
  })

  it('returns 0.5 for partial match', () => {
    expect(computeRelevance('myFunction', 'func')).toBe(0.5)
  })

  it('returns 0.4 for query containing name', () => {
    expect(computeRelevance('x', 'xyz')).toBe(0.4)
  })

  it('returns 0.1 for no match', () => {
    expect(computeRelevance('abc', 'xyz')).toBe(0.1)
  })
})

// ─── findDefinitions ──────────────────────────────────────────────────────

describe('findDefinitions', () => {
  it('finds function definitions', () => {
    const result = findDefinitions('function foo() {}', 'foo', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('function-definition')
    expect(result[0]!.name).toBe('foo')
    expect(result[0]!.isDefinition).toBe(true)
    expect(result[0]!.isUsage).toBe(false)
  })

  it('finds exported function definitions', () => {
    const result = findDefinitions('export function bar(x: number) {}', 'bar', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('bar')
  })

  it('finds const variable definitions', () => {
    const result = findDefinitions('const myVar = 42', 'myVar', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('variable-definition')
  })

  it('finds const arrow function definitions', () => {
    const result = findDefinitions('const handler = () => {}', 'handler', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('handler')
  })

  it('finds let variable definitions', () => {
    const result = findDefinitions('let count = 0', 'count', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('finds class definitions', () => {
    const result = findDefinitions('class MyClass {}', 'MyClass', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('class-definition')
  })

  it('finds generic class definitions', () => {
    const result = findDefinitions('class Container<T> {}', 'Container', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('finds interface definitions', () => {
    const result = findDefinitions('interface IUser { name: string }', 'IUser', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('interface-definition')
  })

  it('finds type definitions', () => {
    const result = findDefinitions('type Result<T> = { data: T }', 'Result', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('type-definition')
  })

  it('records correct file and line', () => {
    const code = 'const a = 1\nconst b = 2\nfunction target() {}'
    const result = findDefinitions(code, 'target', 'test.ts')
    expect(result[0]!.location.file).toBe('test.ts')
    expect(result[0]!.location.line).toBe(3)
  })

  it('records surrounding code', () => {
    const code = 'line1\nline2\nfunction foo() {}\nline4\nline5'
    const result = findDefinitions(code, 'foo', 'a.ts')
    expect(result[0]!.location.surroundingCode).toHaveLength(5)
  })

  it('returns empty for no matches', () => {
    expect(findDefinitions('const x = 5', 'nonexistent', 'a.ts')).toHaveLength(0)
  })

  it('does not match partial names without word boundary', () => {
    const result = findDefinitions('function fooBar() {}', 'foo', 'a.ts')
    expect(result).toHaveLength(0)
  })
})

// ─── findUsages ───────────────────────────────────────────────────────────

describe('findUsages', () => {
  it('finds function calls', () => {
    const result = findUsages('foo(1, 2)', 'foo', 'a.ts')
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result.some((r) => r.name === 'foo' && r.type === 'function-call')).toBe(true)
  })

  it('finds property access usages', () => {
    const result = findUsages('obj.myProp', 'myProp', 'a.ts')
    expect(result.some((r) => r.type === 'variable-usage')).toBe(true)
  })

  it('finds type usage after colon', () => {
    const result = findUsages('const x: MyType = {}', 'MyType', 'a.ts')
    expect(result.some((r) => r.type === 'type-usage')).toBe(true)
  })

  it('skips definition lines for function calls', () => {
    const code = 'function foo() {}\nfoo()'
    const result = findUsages(code, 'foo', 'a.ts')
    const calls = result.filter((r) => r.type === 'function-call')
    expect(calls.length).toBe(1)
  })

  it('skips comment lines', () => {
    const code = '// foo()\n/* foo() */\nfoo()'
    const result = findUsages(code, 'foo', 'a.ts')
    const calls = result.filter((r) => r.type === 'function-call')
    expect(calls).toHaveLength(1)
  })

  it('sets isUsage to true', () => {
    const result = findUsages('bar()', 'bar', 'a.ts')
    expect(result.every((r) => r.isUsage)).toBe(true)
    expect(result.every((r) => !r.isDefinition)).toBe(true)
  })

  it('computes relevance score', () => {
    const result = findUsages('target()', 'target', 'a.ts')
    expect(result[0]!.relevanceScore).toBe(1.0)
  })

  it('returns empty for no matches', () => {
    expect(findUsages('const x = 5', 'nonexistent', 'a.ts')).toHaveLength(0)
  })

  it('finds class usage with new', () => {
    const result = findUsages('new MyClass()', 'MyClass', 'a.ts')
    expect(result.some((r) => r.name === 'MyClass')).toBe(true)
  })
})

// ─── findImports ──────────────────────────────────────────────────────────

describe('findImports', () => {
  it('finds named imports', () => {
    const result = findImports("import { foo } from 'bar'", 'foo', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('import')
    expect(result[0]!.name).toBe('foo')
  })

  it('finds multiple named imports', () => {
    const result = findImports("import { foo, bar, baz } from 'mod'", 'foo', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('foo')
  })

  it('finds default imports', () => {
    const result = findImports("import chalk from 'chalk'", 'chalk', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('chalk')
  })

  it('finds star imports', () => {
    const result = findImports("import * as utils from 'utils'", 'utils', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('utils')
  })

  it('finds type imports', () => {
    const result = findImports("import type { Config } from 'types'", 'Config', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('handles aliased imports', () => {
    const result = findImports("import { foo as bar } from 'mod'", 'bar', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('bar')
  })

  it('returns empty for no match', () => {
    expect(findImports("import { x } from 'y'", 'z', 'a.ts')).toHaveLength(0)
  })

  it('returns empty for non-import lines', () => {
    expect(findImports('const x = 5', 'x', 'a.ts')).toHaveLength(0)
  })
})

// ─── findExports ──────────────────────────────────────────────────────────

describe('findExports', () => {
  it('finds named export { }', () => {
    const result = findExports('export { foo }', 'foo', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.type).toBe('export')
  })

  it('finds export function', () => {
    const result = findExports('export function foo() {}', 'foo', 'a.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('foo')
  })

  it('finds export default function', () => {
    const result = findExports('export default function main() {}', 'main', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('finds export class', () => {
    const result = findExports('export class MyClass {}', 'MyClass', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('finds export const', () => {
    const result = findExports('export const VERSION = "1.0"', 'VERSION', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('finds export default class', () => {
    const result = findExports('export default class App {}', 'App', 'a.ts')
    expect(result).toHaveLength(1)
  })

  it('returns empty for no match', () => {
    expect(findExports('export { bar }', 'foo', 'a.ts')).toHaveLength(0)
  })
})

// ─── groupElementsByFile ─────────────────────────────────────────────────

describe('groupElementsByFile', () => {
  it('groups elements by file', () => {
    const elements: LocatedElement[] = [
      { name: 'a', type: 'function-call', location: { file: 'x.ts', line: 1, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
      { name: 'b', type: 'function-call', location: { file: 'y.ts', line: 2, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
      { name: 'c', type: 'function-call', location: { file: 'x.ts', line: 3, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
    ]
    const grouped = groupElementsByFile(elements)
    expect(Object.keys(grouped)).toHaveLength(2)
    expect(grouped['x.ts']).toHaveLength(2)
    expect(grouped['y.ts']).toHaveLength(1)
  })

  it('returns empty object for no elements', () => {
    expect(Object.keys(groupElementsByFile([]))).toHaveLength(0)
  })
})

// ─── filterByType ─────────────────────────────────────────────────────────

describe('filterByType', () => {
  const elements: LocatedElement[] = [
    { name: 'fn', type: 'function-definition', location: { file: 'a.ts', line: 1, column: 1, context: '', surroundingCode: [] }, isDefinition: true, isUsage: false, relevanceScore: 1 },
    { name: 'fn', type: 'function-call', location: { file: 'a.ts', line: 2, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
    { name: 'Cls', type: 'class-definition', location: { file: 'a.ts', line: 3, column: 1, context: '', surroundingCode: [] }, isDefinition: true, isUsage: false, relevanceScore: 1 },
    { name: 'x', type: 'import', location: { file: 'a.ts', line: 4, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
  ]

  it('returns all for undefined type', () => {
    expect(filterByType(elements)).toHaveLength(4)
  })

  it('returns all for "all" type', () => {
    expect(filterByType(elements, 'all')).toHaveLength(4)
  })

  it('filters to function types', () => {
    const filtered = filterByType(elements, 'function')
    expect(filtered).toHaveLength(2)
    expect(filtered.every((e) => e.type.includes('function'))).toBe(true)
  })

  it('filters to class types', () => {
    const filtered = filterByType(elements, 'class')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]!.type).toBe('class-definition')
  })

  it('filters to import types', () => {
    expect(filterByType(elements, 'import')).toHaveLength(1)
  })

  it('returns empty for unknown type', () => {
    expect(filterByType(elements, 'unknown' as 'function')).toHaveLength(0)
  })
})

// ─── buildLocatorResult ──────────────────────────────────────────────────

describe('buildLocatorResult', () => {
  it('returns full result structure', () => {
    const result = buildLocatorResult(['a.ts'], ['function foo() {}'], 'foo')
    expect(result).toHaveProperty('query', 'foo')
    expect(result).toHaveProperty('definitions')
    expect(result).toHaveProperty('usages')
    expect(result).toHaveProperty('imports')
    expect(result).toHaveProperty('exports')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('grouped')
  })

  it('finds definition and no usages for definition-only code', () => {
    const result = buildLocatorResult(['a.ts'], ['function target() {}'], 'target')
    expect(result.definitions.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty files', () => {
    const result = buildLocatorResult([], [], 'anything')
    expect(result.stats.totalMatches).toBe(0)
    expect(result.stats.filesMatched).toBe(0)
  })

  it('handles empty content', () => {
    const result = buildLocatorResult(['a.ts'], [''], 'foo')
    expect(result.stats.totalMatches).toBe(0)
  })

  it('merges across multiple files', () => {
    const result = buildLocatorResult(
      ['a.ts', 'b.ts'],
      ['function foo() {}', 'foo()'],
      'foo',
    )
    expect(result.stats.filesMatched).toBe(2)
  })

  it('applies type filter', () => {
    const code = 'function foo() {}\nclass Foo {}'
    const result = buildLocatorResult(['a.ts'], [code], 'Foo', { type: 'class' })
    expect(result.definitions.every((d) => d.type.includes('class'))).toBe(true)
  })

  it('computes stats correctly', () => {
    const code = [
      "import { foo } from 'bar'",
      'function foo() {}',
      'export { foo }',
      'foo()',
    ].join('\n')
    const result = buildLocatorResult(['a.ts'], [code], 'foo')
    expect(result.stats.totalMatches).toBeGreaterThan(0)
    expect(result.stats.definitionsCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.filesMatched).toBe(1)
  })
})

// ─── formatDefinitionHighlight ────────────────────────────────────────────

describe('formatDefinitionHighlight', () => {
  it('formats a boxed definition', () => {
    const el: LocatedElement = {
      name: 'foo', type: 'function-definition',
      location: { file: 'a.ts', line: 1, column: 1, context: 'function foo() {}', surroundingCode: [] },
      isDefinition: true, isUsage: false, relevanceScore: 1.0,
    }
    const output = formatDefinitionHighlight(el)
    expect(output).toContain('foo')
    expect(output).toContain('a.ts')
    expect(output).toContain('function-definition')
    expect(output).toContain('1.0')
  })

  it('includes box drawing characters', () => {
    const el: LocatedElement = {
      name: 'x', type: 'class-definition',
      location: { file: 'b.ts', line: 5, column: 1, context: 'class X {}', surroundingCode: [] },
      isDefinition: true, isUsage: false, relevanceScore: 0.8,
    }
    const output = formatDefinitionHighlight(el)
    expect(output).toContain('┌')
    expect(output).toContain('└')
  })
})

// ─── formatUsageTable ─────────────────────────────────────────────────────

describe('formatUsageTable', () => {
  it('formats a table with header', () => {
    const usages: LocatedElement[] = [
      { name: 'foo', type: 'function-call', location: { file: 'a.ts', line: 5, column: 1, context: 'foo()', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
    ]
    const output = formatUsageTable(usages)
    expect(output).toContain('File')
    expect(output).toContain('foo')
    expect(output).toContain('a.ts')
  })

  it('returns message for empty usages', () => {
    expect(formatUsageTable([])).toBe('No usages found.')
  })
})

// ─── formatImportExportChain ──────────────────────────────────────────────

describe('formatImportExportChain', () => {
  it('formats import chain with arrows', () => {
    const els: LocatedElement[] = [
      { name: 'foo', type: 'import', location: { file: 'a.ts', line: 1, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: true, relevanceScore: 1 },
    ]
    const output = formatImportExportChain(els, 'Imports')
    expect(output).toContain('Imports')
    expect(output).toContain('←')
    expect(output).toContain('foo')
  })

  it('formats export chain with arrows', () => {
    const els: LocatedElement[] = [
      { name: 'bar', type: 'export', location: { file: 'b.ts', line: 10, column: 1, context: '', surroundingCode: [] }, isDefinition: false, isUsage: false, relevanceScore: 1 },
    ]
    const output = formatImportExportChain(els, 'Exports')
    expect(output).toContain('→')
  })

  it('returns empty string for no elements', () => {
    expect(formatImportExportChain([], 'Imports')).toBe('')
  })
})

// ─── formatGroupedResults ─────────────────────────────────────────────────

describe('formatGroupedResults', () => {
  it('groups and formats by file', () => {
    const grouped = {
      'a.ts': [
        { name: 'foo', type: 'function-definition' as const, location: { file: 'a.ts', line: 1, column: 1, context: '', surroundingCode: [] }, isDefinition: true, isUsage: false, relevanceScore: 1 },
      ],
    }
    const output = formatGroupedResults(grouped)
    expect(output).toContain('a.ts')
    expect(output).toContain('foo')
    expect(output).toContain('def')
  })

  it('returns message for empty grouped', () => {
    expect(formatGroupedResults({})).toBe('No matches found.')
  })
})

// ─── formatStats ──────────────────────────────────────────────────────────

describe('formatStats', () => {
  it('formats all stat fields', () => {
    const stats: LocatorStats = {
      totalMatches: 10,
      definitionsCount: 3,
      usagesCount: 7,
      filesMatched: 4,
      queryType: 'function',
    }
    const output = formatStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('3')
    expect(output).toContain('7')
    expect(output).toContain('4')
    expect(output).toContain('function')
  })
})

// ─── formatRelevanceIndicator ─────────────────────────────────────────────

describe('formatRelevanceIndicator', () => {
  it('shows 5 filled dots for score 1.0', () => {
    const output = formatRelevanceIndicator(1.0)
    expect(output).toContain('●●●●●')
  })

  it('shows 0 filled dots for score 0.0', () => {
    const output = formatRelevanceIndicator(0.0)
    expect(output).toContain('○○○○○')
  })

  it('shows mixed dots for partial score', () => {
    const output = formatRelevanceIndicator(0.6)
    expect(output).toContain('●')
    expect(output).toContain('○')
  })
})

// ─── formatResult ─────────────────────────────────────────────────────────

describe('formatResult', () => {
  it('combines all sections in result', () => {
    const result = buildLocatorResult(
      ['a.ts'],
      ["import { foo } from 'bar'\nfunction foo() {}\nfoo()\nexport { foo }"],
      'foo',
    )
    const output = formatResult(result)
    expect(output).toContain('Search Results')
  })
})

// ─── formatJson ───────────────────────────────────────────────────────────

describe('formatJson', () => {
  it('produces valid JSON', () => {
    const result = buildLocatorResult(['a.ts'], ['function foo() {}'], 'foo')
    const json = formatJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('query', 'foo')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('definitions')
  })
})
