import { describe, expect, it } from 'vitest'

import Unused from '../src/commands/unused.js'
import {
  buildUsageMap,
  calculateStats,
  extractAllImports,
  extractExports,
  findUnused,
  type ExportInfo,
  type UnusedExport,
  type UnusedResult,
} from '../src/commands/unused-helpers.js'
import { formatUnusedCsv, formatUnusedJson, formatUnusedTable } from '../src/commands/unused-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeExportInfo(overrides: Partial<ExportInfo> = {}): ExportInfo {
  return {
    filePath: 'src/index.ts',
    isDefault: false,
    line: 1,
    name: 'myFunc',
    type: 'function',
    ...overrides,
  }
}

function makeUnusedExport(overrides: Partial<UnusedExport> = {}): UnusedExport {
  return {
    export: makeExportInfo(),
    usages: 0,
    ...overrides,
  }
}

function makeUnusedResult(overrides: Partial<UnusedResult> = {}): UnusedResult {
  return {
    byType: [],
    totalExports: 10,
    totalUnused: 2,
    unused: [makeUnusedExport()],
    unusedPercentage: 20,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Unused command - static metadata', () => {
  it('has a description', () => {
    expect(Unused.description).toBe('Detect unused exports in TypeScript/JavaScript files')
  })

  it('has examples array', () => {
    expect(Array.isArray(Unused.examples)).toBe(true)
    expect(Unused.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Unused.args.path).toBeDefined()
    expect(Unused.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Unused.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Unused command - flags', () => {
  it('has format flag with options', () => {
    expect(Unused.flags.format.options).toContain('json')
    expect(Unused.flags.format.options).toContain('table')
    expect(Unused.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Unused.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Unused.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Unused.flags.ignore).toBeDefined()
    expect(Unused.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag', () => {
    expect(Unused.flags.ext).toBeDefined()
  })

  it('has type flag with multiple and options', () => {
    expect(Unused.flags.type).toBeDefined()
    expect(Unused.flags.type.multiple).toBe(true)
    expect(Unused.flags.type.options).toContain('function')
    expect(Unused.flags.type.options).toContain('class')
    expect(Unused.flags.type.options).toContain('interface')
    expect(Unused.flags.type.options).toContain('type')
    expect(Unused.flags.type.options).toContain('const')
  })

  it('has threshold flag defaulting to 0', () => {
    expect(Unused.flags.threshold).toBeDefined()
    expect(Unused.flags.threshold.default).toBe(0)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Unused command - class structure', () => {
  it('exports a default class', () => {
    expect(Unused).toBeDefined()
    expect(typeof Unused).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Unused.prototype.run).toBe('function')
  })
})

// ─── extractExports ─────────────────────────────────────

describe('extractExports', () => {
  it('extracts named function export', () => {
    const exports = extractExports('export function hello() {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('hello')
    expect(exports[0]!.type).toBe('function')
    expect(exports[0]!.isDefault).toBe(false)
    expect(exports[0]!.line).toBe(1)
  })

  it('extracts async function export', () => {
    const exports = extractExports('export async function fetchData() {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('fetchData')
    expect(exports[0]!.type).toBe('function')
  })

  it('extracts class export', () => {
    const exports = extractExports('export class MyClass {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('MyClass')
    expect(exports[0]!.type).toBe('class')
  })

  it('extracts interface export', () => {
    const exports = extractExports('export interface User {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('User')
    expect(exports[0]!.type).toBe('interface')
  })

  it('extracts type export', () => {
    const exports = extractExports("export type Result = 'success' | 'error'\n", 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('Result')
    expect(exports[0]!.type).toBe('type')
  })

  it('extracts const export', () => {
    const exports = extractExports('export const MAX_SIZE = 100\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('MAX_SIZE')
    expect(exports[0]!.type).toBe('const')
  })

  it('extracts default export', () => {
    const exports = extractExports('export default function() {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('default')
    expect(exports[0]!.isDefault).toBe(true)
    expect(exports[0]!.type).toBe('other')
  })

  it('extracts default export with name', () => {
    const exports = extractExports('export default function main() {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('main')
    expect(exports[0]!.isDefault).toBe(true)
    expect(exports[0]!.type).toBe('function')
  })

  it('extracts default class export with name', () => {
    const exports = extractExports('export default class App {}\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('App')
    expect(exports[0]!.isDefault).toBe(true)
    expect(exports[0]!.type).toBe('class')
  })

  it('extracts named re-exports', () => {
    const exports = extractExports('export { foo, bar };\n', 'test.ts')
    expect(exports).toHaveLength(2)
    expect(exports[0]!.name).toBe('foo')
    expect(exports[1]!.name).toBe('bar')
  })

  it('extracts re-exports from module', () => {
    const exports = extractExports("export { utils } from './utils'\n", 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('utils')
  })

  it('returns empty for no exports', () => {
    const exports = extractExports('const x = 1;\nfunction hello() {}\n', 'test.ts')
    expect(exports).toHaveLength(0)
  })

  it('handles multiple exports in one file', () => {
    const content = [
      'export function foo() {}',
      'export class Bar {}',
      'export const baz = 1',
      'export interface Qux {}',
    ].join('\n')
    const exports = extractExports(content, 'test.ts')
    expect(exports).toHaveLength(4)
  })

  it('skips comment lines', () => {
    const content = '// export function commented() {}\nexport function real() {}\n'
    const exports = extractExports(content, 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('real')
  })

  it('extracts export with alias', () => {
    const exports = extractExports('export { foo as bar };\n', 'test.ts')
    expect(exports).toHaveLength(1)
    expect(exports[0]!.name).toBe('bar')
  })

  it('extracts let/var exports as const type', () => {
    const letExports = extractExports('export let counter = 0\n', 'test.ts')
    expect(letExports).toHaveLength(1)
    expect(letExports[0]!.name).toBe('counter')

    const varExports = extractExports('export var legacy = true\n', 'test.ts')
    expect(varExports).toHaveLength(1)
    expect(varExports[0]!.name).toBe('legacy')
  })
})

// ─── extractAllImports ──────────────────────────────────

describe('extractAllImports', () => {
  it('extracts named import', () => {
    const imports = extractAllImports("import { foo } from './mod'\n")
    expect(imports.has('foo')).toBe(true)
  })

  it('extracts default import', () => {
    const imports = extractAllImports("import React from 'react'\n")
    expect(imports.has('React')).toBe(true)
  })

  it('extracts aliased import (tracks original name)', () => {
    const imports = extractAllImports("import { foo as bar } from './mod'\n")
    expect(imports.has('foo')).toBe(true)
    expect(imports.has('bar')).toBe(false)
  })

  it('extracts multiple named imports', () => {
    const imports = extractAllImports("import { a, b, c } from './mod'\n")
    expect(imports.has('a')).toBe(true)
    expect(imports.has('b')).toBe(true)
    expect(imports.has('c')).toBe(true)
  })

  it('returns empty set for no imports', () => {
    const imports = extractAllImports('const x = 1;\n')
    expect(imports.size).toBe(0)
  })

  it('extracts namespace import', () => {
    const imports = extractAllImports("import * as utils from './utils'\n")
    expect(imports.has('utils')).toBe(true)
  })

  it('handles combined default and named import', () => {
    const imports = extractAllImports("import React, { useState } from 'react'\n")
    expect(imports.has('React')).toBe(true)
    expect(imports.has('useState')).toBe(true)
  })

  it('ignores side-effect imports', () => {
    const imports = extractAllImports("import './side-effects'\n")
    expect(imports.size).toBe(0)
  })
})

// ─── buildUsageMap ──────────────────────────────────────

describe('buildUsageMap', () => {
  it('counts correct usage across files', () => {
    const exports = [
      makeExportInfo({ name: 'used' }),
      makeExportInfo({ name: 'unused' }),
    ]
    const contents = new Map<string, string>([
      ['a.ts', "import { used } from './mod'"],
      ['b.ts', "import { used } from './mod'"],
    ])
    const map = buildUsageMap(contents, exports)
    expect(map.get('used')).toBe(2)
    expect(map.get('unused')).toBe(0)
  })

  it('initializes all exports with 0', () => {
    const exports = [makeExportInfo({ name: 'a' }), makeExportInfo({ name: 'b' })]
    const contents = new Map<string, string>()
    const map = buildUsageMap(contents, exports)
    expect(map.get('a')).toBe(0)
    expect(map.get('b')).toBe(0)
  })

  it('handles empty exports', () => {
    const contents = new Map<string, string>([['a.ts', 'import { x } from ']])
    const map = buildUsageMap(contents, [])
    expect(map.size).toBe(0)
  })
})

// ─── findUnused ─────────────────────────────────────────

describe('findUnused', () => {
  it('identifies unused exports', () => {
    const exports = [
      makeExportInfo({ name: 'used' }),
      makeExportInfo({ name: 'notUsed' }),
    ]
    const usageMap = new Map<string, number>([
      ['used', 3],
      ['notUsed', 0],
    ])
    const result = findUnused(exports, usageMap)
    expect(result).toHaveLength(1)
    expect(result[0]!.export.name).toBe('notUsed')
    expect(result[0]!.usages).toBe(0)
  })

  it('returns empty when all used', () => {
    const exports = [makeExportInfo({ name: 'a' }), makeExportInfo({ name: 'b' })]
    const usageMap = new Map<string, number>([['a', 1], ['b', 2]])
    const result = findUnused(exports, usageMap)
    expect(result).toHaveLength(0)
  })

  it('filters by type', () => {
    const exports = [
      makeExportInfo({ name: 'fn', type: 'function' }),
      makeExportInfo({ name: 'cls', type: 'class' }),
      makeExportInfo({ name: 'iface', type: 'interface' }),
    ]
    const usageMap = new Map<string, number>([['fn', 0], ['cls', 0], ['iface', 0]])
    const result = findUnused(exports, usageMap, ['function'])
    expect(result).toHaveLength(1)
    expect(result[0]!.export.name).toBe('fn')
  })

  it('sorts by filePath then line number', () => {
    const exports = [
      makeExportInfo({ filePath: 'b.ts', line: 5, name: 'b1' }),
      makeExportInfo({ filePath: 'a.ts', line: 10, name: 'a2' }),
      makeExportInfo({ filePath: 'a.ts', line: 3, name: 'a1' }),
    ]
    const usageMap = new Map<string, number>([['b1', 0], ['a2', 0], ['a1', 0]])
    const result = findUnused(exports, usageMap)
    expect(result[0]!.export.name).toBe('a1')
    expect(result[1]!.export.name).toBe('a2')
    expect(result[2]!.export.name).toBe('b1')
  })

  it('applies multiple type filters', () => {
    const exports = [
      makeExportInfo({ name: 'fn', type: 'function' }),
      makeExportInfo({ name: 'cls', type: 'class' }),
      makeExportInfo({ name: 'cst', type: 'const' }),
    ]
    const usageMap = new Map<string, number>([['fn', 0], ['cls', 0], ['cst', 0]])
    const result = findUnused(exports, usageMap, ['function', 'const'])
    expect(result).toHaveLength(2)
  })
})

// ─── calculateStats ─────────────────────────────────────

describe('calculateStats', () => {
  it('computes correct totals', () => {
    const unused: UnusedExport[] = [
      makeUnusedExport(),
      makeUnusedExport({ export: makeExportInfo({ name: 'b', type: 'class' }) }),
    ]
    const result = calculateStats(unused, 10)
    expect(result.totalExports).toBe(10)
    expect(result.totalUnused).toBe(2)
    expect(result.unusedPercentage).toBe(20)
  })

  it('handles zero total exports', () => {
    const result = calculateStats([], 0)
    expect(result.unusedPercentage).toBe(0)
    expect(result.totalUnused).toBe(0)
  })

  it('computes byType breakdown', () => {
    const unused: UnusedExport[] = [
      makeUnusedExport({ export: makeExportInfo({ type: 'function' }) }),
      makeUnusedExport({ export: makeExportInfo({ type: 'function' }) }),
      makeUnusedExport({ export: makeExportInfo({ type: 'class' }) }),
    ]
    const result = calculateStats(unused, 10)
    expect(result.byType).toHaveLength(2)
    expect(result.byType[0]!.type).toBe('function')
    expect(result.byType[0]!.count).toBe(2)
    expect(result.byType[1]!.type).toBe('class')
    expect(result.byType[1]!.count).toBe(1)
  })

  it('sorts byType by count descending', () => {
    const unused: UnusedExport[] = [
      makeUnusedExport({ export: makeExportInfo({ type: 'interface' }) }),
      makeUnusedExport({ export: makeExportInfo({ type: 'function' }) }),
      makeUnusedExport({ export: makeExportInfo({ type: 'function' }) }),
    ]
    const result = calculateStats(unused, 5)
    expect(result.byType[0]!.type).toBe('function')
    expect(result.byType[0]!.count).toBe(2)
  })
})

// ─── formatUnusedTable ──────────────────────────────────

describe('formatUnusedTable', () => {
  it('shows header with column names', () => {
    const result = makeUnusedResult()
    const output = formatUnusedTable(result)
    expect(output).toContain('Type')
    expect(output).toContain('Name')
    expect(output).toContain('File')
    expect(output).toContain('Line')
  })

  it('shows data rows for unused exports', () => {
    const result = makeUnusedResult({
      unused: [makeUnusedExport({ export: makeExportInfo({ name: 'oldFunc', type: 'function' }) })],
    })
    const output = formatUnusedTable(result)
    expect(output).toContain('oldFunc')
  })

  it('shows summary with percentage', () => {
    const result = makeUnusedResult({ totalExports: 100, totalUnused: 25, unusedPercentage: 25 })
    const output = formatUnusedTable(result)
    expect(output).toContain('25 unused exports out of 100 total')
    expect(output).toContain('25%')
  })

  it('shows all-good message when no unused', () => {
    const result = makeUnusedResult({ unused: [], totalUnused: 0 })
    const output = formatUnusedTable(result)
    expect(output).toContain('No unused exports found')
  })

  it('shows breakdown by type', () => {
    const result = makeUnusedResult({
      byType: [{ count: 3, type: 'function' }, { count: 1, type: 'class' }],
      unused: [makeUnusedExport()],
    })
    const output = formatUnusedTable(result)
    expect(output).toContain('Breakdown by type')
    expect(output).toContain('function')
    expect(output).toContain('class')
  })
})

// ─── formatUnusedCsv ─────────────────────────────────────

describe('formatUnusedCsv', () => {
  it('produces CSV with headers', () => {
    const result = makeUnusedResult({ unused: [] })
    const output = formatUnusedCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Type,Name,File,Line,Usages')
  })

  it('includes data rows', () => {
    const result = makeUnusedResult({
      unused: [makeUnusedExport({ export: makeExportInfo({ name: 'foo', type: 'function', filePath: 'a.ts', line: 5 }), usages: 0 })],
    })
    const output = formatUnusedCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
    expect(lines[1]).toContain('function')
    expect(lines[1]).toContain('foo')
  })

  it('escapes commas in values', () => {
    const result = makeUnusedResult({
      unused: [makeUnusedExport({ export: makeExportInfo({ filePath: 'path/with,comma.ts' }) })],
    })
    const output = formatUnusedCsv(result)
    expect(output).toContain('"path/with,comma.ts"')
  })

  it('handles empty unused', () => {
    const result = makeUnusedResult({ unused: [] })
    const output = formatUnusedCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBe(1)
  })
})

// ─── formatUnusedJson ────────────────────────────────────

describe('formatUnusedJson', () => {
  it('produces valid JSON', () => {
    const result = makeUnusedResult()
    const output = formatUnusedJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains unused array', () => {
    const result = makeUnusedResult()
    const output = formatUnusedJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.unused).toBeDefined()
    expect(Array.isArray(parsed.unused)).toBe(true)
  })

  it('contains totals', () => {
    const result = makeUnusedResult({ totalExports: 50, totalUnused: 5 })
    const output = formatUnusedJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalExports).toBe(50)
    expect(parsed.totalUnused).toBe(5)
    expect(parsed.unusedPercentage).toBe(20)
  })

  it('handles empty results', () => {
    const result = makeUnusedResult({ unused: [], totalExports: 0, totalUnused: 0, unusedPercentage: 0 })
    const output = formatUnusedJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.unused).toHaveLength(0)
    expect(parsed.totalExports).toBe(0)
  })

  it('preserves export data accurately', () => {
    const result = makeUnusedResult({
      unused: [makeUnusedExport({ export: makeExportInfo({ name: 'testFn', type: 'function', filePath: 'src/util.ts', line: 42 }), usages: 0 })],
    })
    const output = formatUnusedJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.unused[0].export.name).toBe('testFn')
    expect(parsed.unused[0].export.type).toBe('function')
    expect(parsed.unused[0].export.filePath).toBe('src/util.ts')
    expect(parsed.unused[0].export.line).toBe(42)
  })
})
