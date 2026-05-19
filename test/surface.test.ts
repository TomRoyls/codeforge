import { describe, expect, it } from 'vitest'
import {
  buildSurfaceResult,
  checkDeprecated,
  classifyUsage,
  computeUsageCount,
  extractExports,
  extractJSDoc,
  extractParameters,
  extractReturnType,
  generateRecommendations,
  type ApiExport,
  type SurfaceStats,
} from '../src/commands/surface-helpers.js'
import {
  docCoverageMeter,
  exportTypeBadge,
  formatDeprecatedExports,
  formatModuleBreakdown,
  formatSurfaceJson,
  formatSurfaceOutput,
  formatSurfaceRecommendations,
  formatSurfaceStats,
  formatSurfaceTable,
  formatUndocumentedExports,
  formatUnusedExports,
} from '../src/commands/surface-format-helpers.js'

// ─── extractJSDoc ─────────────────────────────────────────────────────────────

describe('extractJSDoc', () => {
  it('extracts single-line JSDoc', () => {
    const lines = ['/** docs */', 'function foo() {}']
    const result = extractJSDoc(lines, 2)
    expect(result.hasJSDoc).toBe(true)
    expect(result.description).toBe('docs')
  })

  it('returns no JSDoc for line 1', () => {
    const result = extractJSDoc(['function foo() {}'], 1)
    expect(result.hasJSDoc).toBe(false)
  })

  it('returns no JSDoc when no comment above', () => {
    const lines = ['const x = 1', 'function foo() {}']
    const result = extractJSDoc(lines, 2)
    expect(result.hasJSDoc).toBe(false)
  })

  it('extracts multi-line JSDoc', () => {
    const lines = ['/**', ' * multi line docs', ' */', 'function foo() {}']
    const result = extractJSDoc(lines, 4)
    expect(result.hasJSDoc).toBe(true)
    expect(result.description).toContain('multi')
  })

  it('returns null description for empty JSDoc', () => {
    const lines = ['/** */', 'function foo() {}']
    const result = extractJSDoc(lines, 2)
    expect(result.hasJSDoc).toBe(true)
  })
})

// ─── checkDeprecated ──────────────────────────────────────────────────────────

describe('checkDeprecated', () => {
  it('detects @deprecated tag', () => {
    expect(checkDeprecated('@deprecated use bar')).toBe(true)
  })

  it('returns false for null', () => {
    expect(checkDeprecated(null)).toBe(false)
  })

  it('returns false for non-deprecated JSDoc', () => {
    expect(checkDeprecated('This is a helper')).toBe(false)
  })
})

// ─── extractParameters ────────────────────────────────────────────────────────

describe('extractParameters', () => {
  it('extracts typed parameters', () => {
    const params = extractParameters('function foo(a: number, b: string) {}')
    expect(params.length).toBe(2)
    expect(params[0].name).toBe('a')
    expect(params[0].type).toBe('number')
    expect(params[1].name).toBe('b')
    expect(params[1].type).toBe('string')
  })

  it('detects optional parameters', () => {
    const params = extractParameters('function foo(a?: string) {}')
    expect(params[0].isOptional).toBe(true)
  })

  it('detects default values', () => {
    const params = extractParameters('function foo(a: number = 5) {}')
    expect(params[0].hasDefault).toBe(true)
    expect(params[0].defaultValue).toBe('5')
  })

  it('returns empty for no params', () => {
    expect(extractParameters('function foo() {}').length).toBe(0)
  })

  it('returns empty for non-function', () => {
    expect(extractParameters('const x = 5').length).toBe(0)
  })

  it('handles complex types', () => {
    const params = extractParameters('function foo(cb: (x: number) => void) {}')
    expect(params.length).toBe(1)
    expect(params[0].name).toBe('cb')
  })
})

// ─── extractReturnType ────────────────────────────────────────────────────────

describe('extractReturnType', () => {
  it('extracts return type', () => {
    expect(extractReturnType('function foo(): string {}')).toBe('string')
  })

  it('extracts complex return type', () => {
    expect(extractReturnType('function foo(): Promise<number> {}')).toBe('Promise<number>')
  })

  it('returns null for no return type', () => {
    expect(extractReturnType('function foo() {}')).toBe(null)
  })

  it('returns null for non-function', () => {
    expect(extractReturnType('const x = 5')).toBe(null)
  })
})

// ─── extractExports ───────────────────────────────────────────────────────────

describe('extractExports', () => {
  it('extracts export function', () => {
    const exports = extractExports('export function foo() {}', 'a.ts')
    expect(exports.length).toBe(1)
    expect(exports[0].name).toBe('foo')
    expect(exports[0].type).toBe('function')
  })

  it('extracts export class', () => {
    const exports = extractExports('export class Foo {}', 'a.ts')
    expect(exports[0].type).toBe('class')
    expect(exports[0].name).toBe('Foo')
  })

  it('extracts export interface', () => {
    const exports = extractExports('export interface Config {}', 'a.ts')
    expect(exports[0].type).toBe('interface')
  })

  it('extracts export type', () => {
    const exports = extractExports('export type Result<T> = { value: T }', 'a.ts')
    expect(exports[0].type).toBe('type')
    expect(exports[0].name).toBe('Result')
  })

  it('extracts export const', () => {
    const exports = extractExports('export const VERSION = "1.0"', 'a.ts')
    expect(exports[0].type).toBe('constant')
    expect(exports[0].name).toBe('VERSION')
  })

  it('extracts export enum', () => {
    const exports = extractExports('export enum Color { Red, Blue }', 'a.ts')
    expect(exports[0].type).toBe('enum')
  })

  it('extracts export default function', () => {
    const exports = extractExports('export default function main() {}', 'a.ts')
    expect(exports[0].isDefaultExport).toBe(true)
  })

  it('extracts export default class', () => {
    const exports = extractExports('export default class App {}', 'a.ts')
    expect(exports[0].isDefaultExport).toBe(true)
    expect(exports[0].type).toBe('class')
  })

  it('extracts named re-exports', () => {
    const exports = extractExports("export { foo, bar } from './utils'", 'a.ts')
    expect(exports.length).toBe(2)
    expect(exports[0].isReExport).toBe(true)
  })

  it('extracts named exports', () => {
    const exports = extractExports('export { foo, bar }', 'a.ts')
    expect(exports.length).toBe(2)
    expect(exports[0].isNamedExport).toBe(true)
  })

  it('extracts type-only exports', () => {
    const exports = extractExports('export type { Result, Config }', 'a.ts')
    expect(exports.length).toBe(2)
    expect(exports[0].isTypeOnly).toBe(true)
  })

  it('skips comment lines starting with export', () => {
    const exports = extractExports('// export function foo() {}', 'a.ts')
    expect(exports.length).toBe(0)
  })

  it('sets file path correctly', () => {
    const exports = extractExports('export function foo() {}', 'my.ts')
    expect(exports[0].file).toBe('my.ts')
  })

  it('sets line number', () => {
    const exports = extractExports('export function foo() {}', 'a.ts')
    expect(exports[0].line).toBe(1)
  })

  it('detects JSDoc for export', () => {
    const code = '/** docs */\nexport function foo() {}'
    const exports = extractExports(code, 'a.ts')
    expect(exports[0].hasJSDoc).toBe(true)
    expect(exports[0].jsDocDescription).toBe('docs')
  })

  it('detects deprecated export', () => {
    const code = '/** @deprecated use bar */\nexport function foo() {}'
    const exports = extractExports(code, 'a.ts')
    expect(exports[0].isDeprecated).toBe(true)
  })

  it('extracts export default identifier', () => {
    const exports = extractExports('export default myObj', 'a.ts')
    expect(exports[0].isDefaultExport).toBe(true)
    expect(exports[0].name).toBe('myObj')
  })

  it('extracts export namespace', () => {
    const exports = extractExports('export namespace Utils {}', 'a.ts')
    expect(exports[0].type).toBe('namespace')
  })
})

// ─── computeUsageCount ────────────────────────────────────────────────────────

describe('computeUsageCount', () => {
  it('counts named imports', () => {
    const count = computeUsageCount('foo', ['a.ts', 'b.ts'], ['', "import { foo } from 'a'"], 'a.ts')
    expect(count).toBe(1)
  })

  it('counts default imports', () => {
    const count = computeUsageCount('foo', ['a.ts', 'b.ts'], ["import foo from 'a'", ''], 'b.ts')
    expect(count).toBe(1)
  })

  it('returns 0 when not imported', () => {
    const count = computeUsageCount('foo', ['a.ts', 'b.ts'], ['', "import bar from 'a'"], 'a.ts')
    expect(count).toBe(0)
  })

  it('does not count the source file itself', () => {
    const count = computeUsageCount('foo', ['a.ts'], ["import { foo } from 'a'"], 'a.ts')
    expect(count).toBe(0)
  })

  it('counts star imports', () => {
    const count = computeUsageCount('foo', ['a.ts', 'b.ts'], ['', "import * as mod from 'a'"], 'a.ts')
    expect(count).toBe(1)
  })
})

// ─── classifyUsage ────────────────────────────────────────────────────────────

describe('classifyUsage', () => {
  it('marks unused', () => {
    const result = classifyUsage(0, 'a.ts')
    expect(result.isUsedInternally).toBe(false)
    expect(result.isUsedExternally).toBe(false)
  })

  it('marks internal use', () => {
    const result = classifyUsage(1, 'a.ts')
    expect(result.isUsedInternally).toBe(true)
    expect(result.isUsedExternally).toBe(false)
  })

  it('marks external use', () => {
    const result = classifyUsage(3, 'a.ts')
    expect(result.isUsedInternally).toBe(true)
    expect(result.isUsedExternally).toBe(true)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const baseStats: SurfaceStats = {
    totalExports: 10, totalModules: 2, documentedExports: 8, undocumentedExports: 2,
    deprecatedExports: 0, unusedExports: 0, defaultExports: 1, namedExports: 9,
    typeOnlyExports: 0, averageUsageCount: 2, documentationCoverage: 80, surfaceArea: 10,
  }

  it('warns about unused exports', () => {
    const unused: ApiExport[] = [{ name: 'dead', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: false, hasJSDoc: false, jsDocDescription: null, parameters: [],
      returnType: null, usageCount: 0, isUsedInternally: false, isUsedExternally: false }]
    const recs = generateRecommendations(unused, [], baseStats)
    expect(recs.some((r) => r.includes('dead'))).toBe(true)
  })

  it('warns about undocumented exports', () => {
    const undoc: ApiExport[] = [{ name: 'foo', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: false, hasJSDoc: false, jsDocDescription: null, parameters: [],
      returnType: null, usageCount: 1, isUsedInternally: true, isUsedExternally: false }]
    const recs = generateRecommendations([], undoc, baseStats)
    expect(recs.some((r) => r.includes('undocumented'))).toBe(true)
  })

  it('warns about deprecated exports', () => {
    const stats = { ...baseStats, deprecatedExports: 2 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('deprecated'))).toBe(true)
  })

  it('warns about large surface area', () => {
    const stats = { ...baseStats, surfaceArea: 150 }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some((r) => r.includes('150'))).toBe(true)
  })

  it('returns healthy message when all good', () => {
    const recs = generateRecommendations([], [], baseStats)
    expect(recs.some((r) => r.includes('well-maintained'))).toBe(true)
  })
})

// ─── buildSurfaceResult ───────────────────────────────────────────────────────

describe('buildSurfaceResult', () => {
  it('returns complete result', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['export function foo() {}\nexport const bar = 1'],
    )
    expect(result.stats.totalExports).toBe(2)
    expect(result.exports.length).toBe(2)
    expect(result.modules.length).toBe(1)
  })

  it('handles empty input', () => {
    const result = buildSurfaceResult([], [])
    expect(result.stats.totalExports).toBe(0)
    expect(result.stats.totalModules).toBe(0)
  })

  it('computes documentation coverage', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['/** docs */\nexport function foo() {}\nexport function bar() {}'],
    )
    expect(result.stats.documentedExports).toBe(1)
    expect(result.stats.documentationCoverage).toBe(50)
  })

  it('identifies unused exports', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['export function unused() {}'],
    )
    expect(result.unused.length).toBe(1)
  })

  it('identifies undocumented exports', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['export function foo() {}'],
    )
    expect(result.undocumented.length).toBe(1)
  })

  it('identifies deprecated exports', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['/** @deprecated */\nexport function old() {}'],
    )
    expect(result.deprecated.length).toBe(1)
  })

  it('generates recommendations', () => {
    const result = buildSurfaceResult(['a.ts'], ['export function foo() {}'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildSurfaceResult(
      ['a.ts'],
      ['export function foo() {}\nexport default function bar() {}'],
    )
    expect(result.stats.defaultExports).toBe(1)
    expect(result.stats.namedExports).toBe(1)
  })

  it('tracks usage across files', () => {
    const result = buildSurfaceResult(
      ['a.ts', 'b.ts'],
      ['export function foo() {}', "import { foo } from 'a'"],
    )
    const foo = result.exports.find((e) => e.name === 'foo')
    expect(foo?.usageCount).toBe(1)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('exportTypeBadge', () => {
  it('returns badge for each type', () => {
    expect(exportTypeBadge('function')).toContain('ƒ')
    expect(exportTypeBadge('class')).toContain('⬡')
    expect(exportTypeBadge('interface')).toContain('◇')
    expect(exportTypeBadge('type')).toContain('△')
    expect(exportTypeBadge('constant')).toContain('●')
    expect(exportTypeBadge('enum')).toContain('◈')
    expect(exportTypeBadge('namespace')).toContain('▣')
  })
})

describe('docCoverageMeter', () => {
  it('renders meter', () => {
    const meter = docCoverageMeter(75)
    expect(meter).toContain('75%')
    expect(meter).toContain('█')
  })

  it('renders 0%', () => {
    expect(docCoverageMeter(0)).toContain('0%')
  })

  it('renders 100%', () => {
    expect(docCoverageMeter(100)).toContain('100%')
  })
})

describe('formatSurfaceTable', () => {
  it('returns no-exports message for empty', () => {
    expect(formatSurfaceTable([])).toContain('no exports')
  })

  it('includes export data', () => {
    const exports: ApiExport[] = [{ name: 'foo', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: false, hasJSDoc: true, jsDocDescription: 'docs', parameters: [],
      returnType: null, usageCount: 2, isUsedInternally: true, isUsedExternally: true }]
    const table = formatSurfaceTable(exports)
    expect(table).toContain('foo')
  })
})

describe('formatModuleBreakdown', () => {
  it('returns no-modules message for empty', () => {
    expect(formatModuleBreakdown([])).toContain('no modules')
  })

  it('includes module data', () => {
    const modules = [{ file: 'a.ts', exports: [], exportCount: 5, documentedCount: 3,
      deprecatedCount: 0, internalCount: 4, externalCount: 2, unusedCount: 1 }]
    const breakdown = formatModuleBreakdown(modules)
    expect(breakdown).toContain('a.ts')
    expect(breakdown).toContain('5 exports')
  })
})

describe('formatSurfaceStats', () => {
  it('formats all stat fields', () => {
    const stats: SurfaceStats = {
      totalExports: 20, totalModules: 3, documentedExports: 15, undocumentedExports: 5,
      deprecatedExports: 2, unusedExports: 3, defaultExports: 1, namedExports: 19,
      typeOnlyExports: 4, averageUsageCount: 2.5, documentationCoverage: 75, surfaceArea: 20,
    }
    const formatted = formatSurfaceStats(stats)
    expect(formatted).toContain('20')
    expect(formatted).toContain('15')
    expect(formatted).toContain('75%')
  })
})

describe('formatUnusedExports', () => {
  it('returns all-used message for empty', () => {
    expect(formatUnusedExports([])).toContain('all exports are used')
  })

  it('includes unused export data', () => {
    const unused: ApiExport[] = [{ name: 'dead', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: false, hasJSDoc: false, jsDocDescription: null, parameters: [],
      returnType: null, usageCount: 0, isUsedInternally: false, isUsedExternally: false }]
    const formatted = formatUnusedExports(unused)
    expect(formatted).toContain('dead')
  })
})

describe('formatUndocumentedExports', () => {
  it('returns all-documented message for empty', () => {
    expect(formatUndocumentedExports([])).toContain('all exports documented')
  })

  it('includes undocumented export data', () => {
    const undoc: ApiExport[] = [{ name: 'foo', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: false, hasJSDoc: false, jsDocDescription: null, parameters: [],
      returnType: null, usageCount: 1, isUsedInternally: true, isUsedExternally: false }]
    const formatted = formatUndocumentedExports(undoc)
    expect(formatted).toContain('foo')
  })
})

describe('formatDeprecatedExports', () => {
  it('returns no-deprecated message for empty', () => {
    expect(formatDeprecatedExports([])).toContain('no deprecated')
  })

  it('includes deprecated export data', () => {
    const dep: ApiExport[] = [{ name: 'old', type: 'function', file: 'a.ts', line: 1,
      isDefaultExport: false, isNamedExport: true, isReExport: false, isTypeOnly: false,
      isDeprecated: true, hasJSDoc: true, jsDocDescription: '@deprecated use new', parameters: [],
      returnType: null, usageCount: 0, isUsedInternally: false, isUsedExternally: false }]
    const formatted = formatDeprecatedExports(dep)
    expect(formatted).toContain('old')
  })
})

describe('formatSurfaceRecommendations', () => {
  it('formats recommendations', () => {
    expect(formatSurfaceRecommendations(['test rec'])).toContain('test rec')
  })

  it('returns no-recs message for empty', () => {
    expect(formatSurfaceRecommendations([])).toContain('no recommendations')
  })
})

describe('formatSurfaceOutput', () => {
  it('includes all sections', () => {
    const result = buildSurfaceResult(['a.ts'], ['export function foo() {}'])
    const output = formatSurfaceOutput(result)
    expect(output).toContain('API Surface Statistics')
    expect(output).toContain('API Surface Table')
    expect(output).toContain('Module Breakdown')
    expect(output).toContain('Recommendations')
  })
})

describe('formatSurfaceJson', () => {
  it('returns valid JSON', () => {
    const result = buildSurfaceResult(['a.ts'], ['export function foo() {}'])
    const json = formatSurfaceJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalExports).toBeGreaterThan(0)
  })
})
