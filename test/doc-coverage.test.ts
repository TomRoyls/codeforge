import { describe, expect, it } from 'vitest'

import DocCoverage from '../src/commands/doc-coverage.js'
import {
  analyzeFileDocCoverage,
  buildDocCoverageResult,
  checkJSDoc,
  extractExportedItems,
  filterResults,
  type ExportItem,
  type FileDocCoverage,
  type FilterOptions,
} from '../src/commands/doc-coverage-helpers.js'
import type { DocCoverageResult } from '../src/commands/doc-coverage-helpers.js'
import {
  formatCoverageBar,
  formatDocCoverageCsv,
  formatDocCoverageJson,
  formatDocCoverageTable,
  getCoverageColor,
} from '../src/commands/doc-coverage-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeExportItem(overrides: Partial<ExportItem> = {}): ExportItem {
  return {
    filePath: 'test.ts',
    hasJSDoc: false,
    jsDocQuality: {
      hasDescription: false,
      hasExample: false,
      hasParams: false,
      hasReturns: false,
    },
    line: 1,
    name: 'testExport',
    type: 'function',
    ...overrides,
  }
}

function makeFileDocCoverage(overrides: Partial<FileDocCoverage> = {}): FileDocCoverage {
  return {
    coveragePercentage: 50,
    documentedExports: 1,
    exports: [makeExportItem({ hasJSDoc: true }), makeExportItem({ hasJSDoc: false, name: 'undocumented' })],
    filePath: 'test.ts',
    relativePath: 'test.ts',
    totalExports: 2,
    ...overrides,
  }
}

function makeDocCoverageResult(overrides: Partial<DocCoverageResult> = {}): DocCoverageResult {
  const file = makeFileDocCoverage()
  return {
    byFile: [{ documented: 1, file: 'test.ts', percentage: 50, total: 2 }],
    byType: [{ documented: 1, percentage: 50, total: 2, type: 'function' }],
    coveragePercentage: 50,
    documentedExports: 1,
    files: [file],
    totalExports: 2,
    undocumentedItems: [makeExportItem({ hasJSDoc: false, name: 'undocumented' })],
    ...overrides,
  }
}

// ─── Command metadata ────────────────────────────────────

describe('DocCoverage command - static metadata', () => {
  it('has a description', () => {
    expect(DocCoverage.description).toBe('Measure documentation coverage for exported items')
  })

  it('has examples array', () => {
    expect(Array.isArray(DocCoverage.examples)).toBe(true)
    expect(DocCoverage.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(DocCoverage.args.path).toBeDefined()
    expect(DocCoverage.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(DocCoverage.args.path.default).toBe('.')
  })
})

// ─── Flags ───────────────────────────────────────────────

describe('DocCoverage command - flags', () => {
  it('has format flag with options', () => {
    expect(DocCoverage.flags.format.options).toContain('json')
    expect(DocCoverage.flags.format.options).toContain('table')
    expect(DocCoverage.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(DocCoverage.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(DocCoverage.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(DocCoverage.flags.ignore).toBeDefined()
    expect(DocCoverage.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(DocCoverage.flags.ext).toBeDefined()
  })

  it('defaults ext to .ts,.tsx,.js,.jsx', () => {
    expect(DocCoverage.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has show-undocumented flag defaulting to false', () => {
    expect(DocCoverage.flags['show-undocumented'].default).toBe(false)
  })

  it('has show-documented flag defaulting to false', () => {
    expect(DocCoverage.flags['show-documented'].default).toBe(false)
  })

  it('has by-type flag defaulting to false', () => {
    expect(DocCoverage.flags['by-type'].default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(DocCoverage.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ─────────────────────────────────────

describe('DocCoverage command - class structure', () => {
  it('exports a default class', () => {
    expect(DocCoverage).toBeDefined()
    expect(typeof DocCoverage).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof DocCoverage.prototype.run).toBe('function')
  })
})

// ─── extractExportedItems ────────────────────────────────

describe('extractExportedItems', () => {
  it('detects function export', () => {
    const content = 'export function hello() {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('hello')
    expect(items[0]!.type).toBe('function')
  })

  it('detects async function export', () => {
    const content = 'export async function fetchData() {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('fetchData')
    expect(items[0]!.type).toBe('function')
  })

  it('detects class export', () => {
    const content = 'export class MyClass {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('MyClass')
    expect(items[0]!.type).toBe('class')
  })

  it('detects interface export', () => {
    const content = 'export interface MyInterface { name: string }'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('MyInterface')
    expect(items[0]!.type).toBe('interface')
  })

  it('detects type export', () => {
    const content = "export type MyType = 'a' | 'b'"
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('MyType')
    expect(items[0]!.type).toBe('type')
  })

  it('detects const export', () => {
    const content = 'export const MY_CONST = 42'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('MY_CONST')
    expect(items[0]!.type).toBe('const')
  })

  it('detects named re-exports', () => {
    const content = 'export { foo, bar }'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(2)
    expect(items[0]!.name).toBe('foo')
    expect(items[0]!.type).toBe('other')
    expect(items[1]!.name).toBe('bar')
    expect(items[1]!.type).toBe('other')
  })

  it('detects multiple exports in a file', () => {
    const content = [
      'export function hello() {}',
      'export class MyClass {}',
      'export const value = 42',
    ].join('\n')
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(3)
    expect(items.map((i) => i.type)).toEqual(['function', 'class', 'const'])
  })

  it('returns empty array for no exports', () => {
    const content = 'const x = 1\nfunction foo() {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(0)
  })

  it('sets correct line numbers', () => {
    const content = '\n\nexport function hello() {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items[0]!.line).toBe(3)
  })

  it('sets filePath on each item', () => {
    const content = 'export function hello() {}'
    const items = extractExportedItems(content, 'src/foo.ts')
    expect(items[0]!.filePath).toBe('src/foo.ts')
  })

  it('detects default class export', () => {
    const content = 'export default class MyClass {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('MyClass')
    expect(items[0]!.type).toBe('class')
  })

  it('detects default function export', () => {
    const content = 'export default function main() {}'
    const items = extractExportedItems(content, 'test.ts')
    expect(items).toHaveLength(1)
    expect(items[0]!.name).toBe('main')
    expect(items[0]!.type).toBe('function')
  })
})

// ─── checkJSDoc ──────────────────────────────────────────

describe('checkJSDoc', () => {
  it('detects full JSDoc with description, params, returns, example', () => {
    const lines = [
      '/**',
      ' * Adds two numbers.',
      ' * @param a First number',
      ' * @param b Second number',
      ' * @returns The sum',
      ' * @example',
      ' * add(1, 2) // 3',
      ' */',
      'export function add(a: number, b: number): number {}',
    ]
    const result = checkJSDoc(lines, 9)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(true)
    expect(result.jsDocQuality.hasParams).toBe(true)
    expect(result.jsDocQuality.hasReturns).toBe(true)
    expect(result.jsDocQuality.hasExample).toBe(true)
  })

  it('detects JSDoc with only description', () => {
    const lines = [
      '/**',
      ' * A simple description.',
      ' */',
      'export function foo() {}',
    ]
    const result = checkJSDoc(lines, 4)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(true)
    expect(result.jsDocQuality.hasParams).toBe(false)
    expect(result.jsDocQuality.hasReturns).toBe(false)
    expect(result.jsDocQuality.hasExample).toBe(false)
  })

  it('detects JSDoc with only tags', () => {
    const lines = [
      '/**',
      ' * @param x value',
      ' */',
      'export function foo(x: number) {}',
    ]
    const result = checkJSDoc(lines, 4)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(false)
    expect(result.jsDocQuality.hasParams).toBe(true)
  })

  it('returns false for no JSDoc', () => {
    const lines = ['export function foo() {}']
    const result = checkJSDoc(lines, 1)
    expect(result.hasJSDoc).toBe(false)
    expect(result.jsDocQuality.hasDescription).toBe(false)
  })

  it('handles single-line JSDoc', () => {
    const lines = ['/** A simple description. */', 'export function foo() {}']
    const result = checkJSDoc(lines, 2)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(true)
  })

  it('handles multi-line JSDoc', () => {
    const lines = [
      '/**',
      ' * Line 1.',
      ' * Line 2.',
      ' * @param x value',
      ' */',
      'export function foo(x: number) {}',
    ]
    const result = checkJSDoc(lines, 6)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(true)
    expect(result.jsDocQuality.hasParams).toBe(true)
  })

  it('handles blank lines between JSDoc and export', () => {
    const lines = [
      '/**',
      ' * Description.',
      ' */',
      '',
      'export function foo() {}',
    ]
    const result = checkJSDoc(lines, 5)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasDescription).toBe(true)
  })

  it('handles out-of-range line numbers', () => {
    const lines = ['export function foo() {}']
    expect(checkJSDoc(lines, 0).hasJSDoc).toBe(false)
    expect(checkJSDoc(lines, 5).hasJSDoc).toBe(false)
  })

  it('detects @return tag as hasReturns', () => {
    const lines = [
      '/**',
      ' * @return the value',
      ' */',
      'export function foo() {}',
    ]
    const result = checkJSDoc(lines, 4)
    expect(result.hasJSDoc).toBe(true)
    expect(result.jsDocQuality.hasReturns).toBe(true)
  })
})

// ─── analyzeFileDocCoverage ──────────────────────────────

describe('analyzeFileDocCoverage', () => {
  it('returns 100% when all exports are documented', () => {
    const content = [
      '/**',
      ' * Description.',
      ' */',
      'export function foo() {}',
    ].join('\n')
    const result = analyzeFileDocCoverage(content, 'test.ts')
    expect(result.totalExports).toBe(1)
    expect(result.documentedExports).toBe(1)
    expect(result.coveragePercentage).toBe(100)
  })

  it('returns 0% when no exports are documented', () => {
    const content = 'export function foo() {}\nexport function bar() {}'
    const result = analyzeFileDocCoverage(content, 'test.ts')
    expect(result.totalExports).toBe(2)
    expect(result.documentedExports).toBe(0)
    expect(result.coveragePercentage).toBe(0)
  })

  it('returns mixed coverage correctly', () => {
    const content = [
      '/**',
      ' * Documented.',
      ' */',
      'export function foo() {}',
      'export function bar() {}',
    ].join('\n')
    const result = analyzeFileDocCoverage(content, 'test.ts')
    expect(result.totalExports).toBe(2)
    expect(result.documentedExports).toBe(1)
    expect(result.coveragePercentage).toBe(50)
  })

  it('handles empty file', () => {
    const result = analyzeFileDocCoverage('', 'test.ts')
    expect(result.totalExports).toBe(0)
    expect(result.documentedExports).toBe(0)
    expect(result.coveragePercentage).toBe(100)
  })

  it('sets correct relativePath', () => {
    const result = analyzeFileDocCoverage('export function foo() {}', 'src/foo.ts')
    expect(result.relativePath).toBe('src/foo.ts')
  })

  it('populates exports with JSDoc info', () => {
    const content = [
      '/**',
      ' * Desc.',
      ' * @param x val',
      ' */',
      'export function foo(x: number) {}',
    ].join('\n')
    const result = analyzeFileDocCoverage(content, 'test.ts')
    expect(result.exports[0]!.hasJSDoc).toBe(true)
    expect(result.exports[0]!.jsDocQuality.hasDescription).toBe(true)
    expect(result.exports[0]!.jsDocQuality.hasParams).toBe(true)
  })
})

// ─── buildDocCoverageResult ──────────────────────────────

describe('buildDocCoverageResult', () => {
  it('computes correct totals', () => {
    const fileResults: FileDocCoverage[] = [
      makeFileDocCoverage({
        totalExports: 3,
        documentedExports: 2,
        coveragePercentage: 66.67,
        exports: [
          makeExportItem({ name: 'a', hasJSDoc: true }),
          makeExportItem({ name: 'b', hasJSDoc: true }),
          makeExportItem({ name: 'c', hasJSDoc: false }),
        ],
      }),
    ]
    const result = buildDocCoverageResult(fileResults)
    expect(result.totalExports).toBe(3)
    expect(result.documentedExports).toBe(2)
  })

  it('computes byType breakdown', () => {
    const fileResults: FileDocCoverage[] = [
      makeFileDocCoverage({
        exports: [
          makeExportItem({ name: 'fn1', type: 'function', hasJSDoc: true }),
          makeExportItem({ name: 'C1', type: 'class', hasJSDoc: false }),
        ],
        totalExports: 2,
        documentedExports: 1,
      }),
    ]
    const result = buildDocCoverageResult(fileResults)
    expect(result.byType).toHaveLength(2)
    const funcType = result.byType.find((t) => t.type === 'function')
    expect(funcType).toBeDefined()
    expect(funcType!.total).toBe(1)
    expect(funcType!.documented).toBe(1)
  })

  it('collects undocumentedItems', () => {
    const fileResults: FileDocCoverage[] = [
      makeFileDocCoverage({
        exports: [
          makeExportItem({ name: 'a', hasJSDoc: true }),
          makeExportItem({ name: 'b', hasJSDoc: false }),
        ],
        totalExports: 2,
        documentedExports: 1,
      }),
    ]
    const result = buildDocCoverageResult(fileResults)
    expect(result.undocumentedItems).toHaveLength(1)
    expect(result.undocumentedItems[0]!.name).toBe('b')
  })

  it('handles multiple files', () => {
    const fileResults: FileDocCoverage[] = [
      makeFileDocCoverage({
        relativePath: 'a.ts',
        filePath: 'a.ts',
        totalExports: 2,
        documentedExports: 1,
        exports: [
          makeExportItem({ name: 'a1', hasJSDoc: true, filePath: 'a.ts' }),
          makeExportItem({ name: 'a2', hasJSDoc: false, filePath: 'a.ts' }),
        ],
      }),
      makeFileDocCoverage({
        relativePath: 'b.ts',
        filePath: 'b.ts',
        totalExports: 1,
        documentedExports: 1,
        exports: [makeExportItem({ name: 'b1', hasJSDoc: true, filePath: 'b.ts' })],
      }),
    ]
    const result = buildDocCoverageResult(fileResults)
    expect(result.totalExports).toBe(3)
    expect(result.documentedExports).toBe(2)
    expect(result.byFile).toHaveLength(2)
  })

  it('handles empty files array', () => {
    const result = buildDocCoverageResult([])
    expect(result.totalExports).toBe(0)
    expect(result.documentedExports).toBe(0)
    expect(result.coveragePercentage).toBe(100)
    expect(result.byType).toHaveLength(0)
    expect(result.byFile).toHaveLength(0)
    expect(result.undocumentedItems).toHaveLength(0)
  })
})

// ─── filterResults ───────────────────────────────────────

describe('filterResults', () => {
  it('filters to undocumented only', () => {
    const result = makeDocCoverageResult({
      totalExports: 3,
      documentedExports: 1,
      files: [
        makeFileDocCoverage({
          totalExports: 3,
          documentedExports: 1,
          exports: [
            makeExportItem({ name: 'a', hasJSDoc: true }),
            makeExportItem({ name: 'b', hasJSDoc: false }),
            makeExportItem({ name: 'c', hasJSDoc: false }),
          ],
        }),
      ],
    })
    const filtered = filterResults(result, { showUndocumented: true })
    expect(filtered.totalExports).toBe(2)
    expect(filtered.documentedExports).toBe(0)
  })

  it('filters to documented only', () => {
    const result = makeDocCoverageResult({
      totalExports: 3,
      documentedExports: 1,
      files: [
        makeFileDocCoverage({
          totalExports: 3,
          documentedExports: 1,
          exports: [
            makeExportItem({ name: 'a', hasJSDoc: true }),
            makeExportItem({ name: 'b', hasJSDoc: false }),
            makeExportItem({ name: 'c', hasJSDoc: false }),
          ],
        }),
      ],
    })
    const filtered = filterResults(result, { showDocumented: true })
    expect(filtered.totalExports).toBe(1)
    expect(filtered.documentedExports).toBe(1)
  })

  it('returns all when no filter is applied', () => {
    const result = makeDocCoverageResult({ totalExports: 2, documentedExports: 1 })
    const filtered = filterResults(result, {})
    expect(filtered.totalExports).toBe(2)
    expect(filtered.documentedExports).toBe(1)
  })
})

// ─── formatCoverageBar ───────────────────────────────────

describe('formatCoverageBar', () => {
  it('renders a full bar for 100%', () => {
    const bar = formatCoverageBar(100, 10)
    expect(bar).toContain('█')
    expect(bar).not.toContain('░')
  })

  it('renders an empty bar for 0%', () => {
    const bar = formatCoverageBar(0, 10)
    expect(bar).toContain('░')
    expect(bar).not.toContain('█')
  })

  it('renders a partial bar for 50%', () => {
    const bar = formatCoverageBar(50, 10)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })

  it('defaults width to 30', () => {
    const bar = formatCoverageBar(50)
    const stripped = stripAnsi(bar)
    expect(stripped.length).toBe(30)
  })
})

// ─── getCoverageColor ────────────────────────────────────

describe('getCoverageColor', () => {
  it('returns red for < 50%', () => {
    const colorFn = getCoverageColor(30)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns yellow for 50-80%', () => {
    const colorFn = getCoverageColor(65)
    const result = colorFn('test')
    expect(result).toContain('test')
  })

  it('returns green for > 80%', () => {
    const colorFn = getCoverageColor(90)
    const result = colorFn('test')
    expect(result).toContain('test')
  })
})

// ─── formatDocCoverageTable ──────────────────────────────

describe('formatDocCoverageTable', () => {
  it('contains header with column names', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageTable(result, false)
    expect(output).toContain('File')
    expect(output).toContain('Total')
    expect(output).toContain('Documented')
    expect(output).toContain('Coverage')
  })

  it('contains data rows', () => {
    const result = makeDocCoverageResult({
      byFile: [{ documented: 1, file: 'src/foo.ts', percentage: 50, total: 2 }],
    })
    const output = formatDocCoverageTable(result, false)
    expect(output).toContain('src/foo.ts')
  })

  it('shows type breakdown when byType is true', () => {
    const result = makeDocCoverageResult({
      byType: [{ documented: 1, percentage: 50, total: 2, type: 'function' }],
    })
    const output = formatDocCoverageTable(result, true)
    expect(output).toContain('Coverage by Type')
    expect(output).toContain('function')
  })

  it('hides type breakdown when byType is false', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageTable(result, false)
    expect(output).not.toContain('Coverage by Type')
  })

  it('shows undocumented items', () => {
    const result = makeDocCoverageResult({
      undocumentedItems: [makeExportItem({ hasJSDoc: false, name: 'missingDoc' })],
    })
    const output = formatDocCoverageTable(result, false)
    expect(output).toContain('missingDoc')
    expect(output).toContain('Undocumented')
  })

  it('shows summary with 100% and 0% file counts', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageTable(result, false)
    expect(output).toContain('Files with 100% coverage')
    expect(output).toContain('Files with 0% coverage')
  })

  it('handles empty results', () => {
    const result = makeDocCoverageResult({
      byFile: [],
      files: [],
      totalExports: 0,
      documentedExports: 0,
      coveragePercentage: 100,
      undocumentedItems: [],
    })
    const output = formatDocCoverageTable(result, false)
    expect(output).toContain('File')
  })
})

// ─── formatDocCoverageCsv ────────────────────────────────

describe('formatDocCoverageCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeDocCoverageResult({ byFile: [] })
    const output = formatDocCoverageCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('File,Total,Documented,Coverage')
  })

  it('includes data rows', () => {
    const result = makeDocCoverageResult({
      byFile: [{ documented: 1, file: 'src/foo.ts', percentage: 50, total: 2 }],
    })
    const output = formatDocCoverageCsv(result)
    expect(output).toContain('src/foo.ts')
  })

  it('includes totals row', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageCsv(result)
    expect(output).toContain('Total')
  })

  it('escapes commas in file names', () => {
    const result = makeDocCoverageResult({
      byFile: [{ documented: 1, file: 'path,with,commas.ts', percentage: 50, total: 2 }],
    })
    const output = formatDocCoverageCsv(result)
    expect(output).toContain('"path,with,commas.ts"')
  })
})

// ─── formatDocCoverageJson ───────────────────────────────

describe('formatDocCoverageJson', () => {
  it('produces valid JSON', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalExports', () => {
    const result = makeDocCoverageResult({ totalExports: 5 })
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalExports).toBe(5)
  })

  it('contains files array', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains byType array', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.byType).toBeDefined()
    expect(Array.isArray(parsed.byType)).toBe(true)
  })

  it('contains undocumentedItems', () => {
    const result = makeDocCoverageResult()
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.undocumentedItems).toBeDefined()
    expect(Array.isArray(parsed.undocumentedItems)).toBe(true)
  })

  it('handles empty results', () => {
    const result = makeDocCoverageResult({
      files: [],
      totalExports: 0,
      documentedExports: 0,
      coveragePercentage: 100,
      byType: [],
      byFile: [],
      undocumentedItems: [],
    })
    const output = formatDocCoverageJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalExports).toBe(0)
    expect(parsed.files).toHaveLength(0)
  })
})

// ─── Integration scenarios ───────────────────────────────

describe('integration scenarios', () => {
  it('analyzes a realistic file with mixed exports', () => {
    const content = [
      '/**',
      ' * A utility function.',
      ' * @param name The name',
      ' * @returns A greeting',
      ' */',
      'export function greet(name: string): string {',
      '  return `Hello, ${name}`',
      '}',
      '',
      'export class Calculator {',
      '  add(a: number, b: number): number {',
      '    return a + b',
      '  }',
      '}',
      '',
      'export interface Config {',
      '  debug: boolean',
      '}',
      '',
      "export type Result = 'success' | 'error'",
      '',
      'export const VERSION = "1.0.0"',
    ].join('\n')

    const result = analyzeFileDocCoverage(content, 'mixed.ts')
    expect(result.totalExports).toBe(6)
    expect(result.documentedExports).toBe(1)
    expect(result.coveragePercentage.toFixed(1)).toBe('16.7')
  })

  it('full pipeline from extraction to result', () => {
    const content = [
      '/** Doc */',
      'export function documented() {}',
      'export function undocumented() {}',
    ].join('\n')

    const fileResult = analyzeFileDocCoverage(content, 'test.ts')
    const result = buildDocCoverageResult([fileResult])

    expect(result.totalExports).toBe(2)
    expect(result.documentedExports).toBe(1)
    expect(result.coveragePercentage).toBe(50)
    expect(result.byType).toHaveLength(1)
    expect(result.undocumentedItems).toHaveLength(1)
  })

  it('filtering pipeline produces correct results', () => {
    const content = [
      '/** Doc */',
      'export function documented() {}',
      'export function undocumented() {}',
    ].join('\n')

    const fileResult = analyzeFileDocCoverage(content, 'test.ts')
    const result = buildDocCoverageResult([fileResult])
    const filtered = filterResults(result, { showUndocumented: true })

    expect(filtered.totalExports).toBe(1)
    expect(filtered.undocumentedItems).toHaveLength(1)
  })
})

// ─── Helper ──────────────────────────────────────────────

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*m/g, '')
}
