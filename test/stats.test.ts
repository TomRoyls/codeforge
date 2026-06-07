import { describe, it, expect } from 'vitest'

import Stats from '../src/commands/stats.js'
import {
  analyzeFile,
  buildStatsResult,
  computeLanguageStats,
  computeMaintainability,
  countClasses,
  countEnums,
  countExports,
  countFunctions,
  countImports,
  countInterfaces,
  countLineTypes,
  countTypes,
  detectLanguage,
  type FileStats,
  type StatsResult,
} from '../src/commands/stats-helpers.js'
import {
  formatGrade,
  formatLanguageBar,
  formatStatsJson,
  formatStatsTable,
} from '../src/commands/stats-format-helpers.js'

// ─── Command metadata ───────────────────────────────────

describe('Stats command - metadata', () => {
  it('has a description', () => {
    expect(Stats.description).toBe('Display codebase statistics and metrics')
  })

  it('has examples array with at least 5 entries', () => {
    expect(Array.isArray(Stats.examples)).toBe(true)
    expect(Stats.examples.length).toBeGreaterThanOrEqual(5)
  })

  it('has path arg with default "."', () => {
    expect(Stats.args.path).toBeDefined()
    expect(Stats.args.path.default).toBe('.')
  })

  it('has format flag with table and json options', () => {
    expect(Stats.flags.format.options).toContain('json')
    expect(Stats.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Stats.flags.format.default).toBe('table')
  })

  it('has sort-by flag with correct options', () => {
    expect(Stats.flags['sort-by'].options).toContain('complexity')
    expect(Stats.flags['sort-by'].options).toContain('loc')
    expect(Stats.flags['sort-by'].options).toContain('name')
    expect(Stats.flags['sort-by'].options).toContain('size')
  })

  it('defaults sort-by to size', () => {
    expect(Stats.flags['sort-by'].default).toBe('size')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Stats.flags.verbose.default).toBe(false)
  })

  it('has ext flag with empty default', () => {
    expect(Stats.flags.ext.default).toBe('')
  })

  it('has ignore flag with multiple', () => {
    expect(Stats.flags.ignore.multiple).toBe(true)
  })

  it('has output flag', () => {
    expect(Stats.flags.output).toBeDefined()
  })

  it('exports a default class with run method', () => {
    expect(Stats).toBeDefined()
    expect(typeof Stats).toBe('function')
    expect(typeof Stats.prototype.run).toBe('function')
  })
})

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('detects TypeScript from .ts', () => {
    expect(detectLanguage('foo.ts')).toBe('TypeScript')
  })

  it('detects TypeScript from .tsx', () => {
    expect(detectLanguage('foo.tsx')).toBe('TypeScript')
  })

  it('detects JavaScript from .js', () => {
    expect(detectLanguage('foo.js')).toBe('JavaScript')
  })

  it('detects JavaScript from .jsx', () => {
    expect(detectLanguage('foo.jsx')).toBe('JavaScript')
  })

  it('detects JSON', () => {
    expect(detectLanguage('foo.json')).toBe('JSON')
  })

  it('detects Markdown', () => {
    expect(detectLanguage('foo.md')).toBe('Markdown')
  })

  it('detects CSS from .css', () => {
    expect(detectLanguage('foo.css')).toBe('CSS')
  })

  it('detects CSS from .scss', () => {
    expect(detectLanguage('foo.scss')).toBe('CSS')
  })

  it('detects HTML', () => {
    expect(detectLanguage('foo.html')).toBe('HTML')
  })

  it('detects Python', () => {
    expect(detectLanguage('foo.py')).toBe('Python')
  })

  it('detects Rust', () => {
    expect(detectLanguage('foo.rs')).toBe('Rust')
  })

  it('detects Go', () => {
    expect(detectLanguage('foo.go')).toBe('Go')
  })

  it('detects Java', () => {
    expect(detectLanguage('foo.java')).toBe('Java')
  })

  it('detects C from .c', () => {
    expect(detectLanguage('foo.c')).toBe('C')
  })

  it('detects C from .h', () => {
    expect(detectLanguage('foo.h')).toBe('C')
  })

  it('detects C++ from .cpp', () => {
    expect(detectLanguage('foo.cpp')).toBe('C++')
  })

  it('detects C++ from .hpp', () => {
    expect(detectLanguage('foo.hpp')).toBe('C++')
  })

  it('detects Ruby', () => {
    expect(detectLanguage('foo.rb')).toBe('Ruby')
  })

  it('detects Zig', () => {
    expect(detectLanguage('foo.zig')).toBe('Zig')
  })

  it('returns Unknown for unknown extensions', () => {
    expect(detectLanguage('foo.xyz')).toBe('Unknown')
  })

  it('returns Unknown for files with no extension', () => {
    expect(detectLanguage('Makefile')).toBe('Unknown')
  })

  it('handles paths with directories', () => {
    expect(detectLanguage('src/utils/helpers.ts')).toBe('TypeScript')
  })
})

// ─── countFunctions ─────────────────────────────────────

describe('countFunctions', () => {
  it('counts regular function declarations', () => {
    expect(countFunctions('function hello() {}')).toBe(1)
  })

  it('counts named function with body', () => {
    expect(countFunctions('function add(a, b) {\n  return a + b\n}')).toBe(1)
  })

  it('counts arrow function assignments', () => {
    expect(countFunctions('const add = (a, b) => a + b')).toBe(1)
  })

  it('counts const function expressions', () => {
    expect(countFunctions('const greet = function(name) { return name }')).toBe(1)
  })

  it('counts multiple functions', () => {
    const code = 'function foo() {}\nfunction bar() {}'
    expect(countFunctions(code)).toBe(2)
  })

  it('counts methods in class', () => {
    const code = 'class A {\n  foo() {}\n  bar() {}\n}'
    expect(countFunctions(code)).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for no functions', () => {
    expect(countFunctions('const x = 1')).toBe(0)
  })

  it('skips commented-out functions', () => {
    expect(countFunctions('// function foo() {}')).toBe(0)
  })
})

// ─── countClasses ───────────────────────────────────────

describe('countClasses', () => {
  it('counts class declarations', () => {
    expect(countClasses('class Foo {}')).toBe(1)
  })

  it('counts export class', () => {
    expect(countClasses('export class Bar {}')).toBe(1)
  })

  it('counts export default class', () => {
    expect(countClasses('export default class Baz {}')).toBe(1)
  })

  it('returns 0 for no classes', () => {
    expect(countClasses('const x = 1')).toBe(0)
  })

  it('skips commented classes', () => {
    expect(countClasses('// class Foo {}')).toBe(0)
  })
})

// ─── countInterfaces ────────────────────────────────────

describe('countInterfaces', () => {
  it('counts interface declarations', () => {
    expect(countInterfaces('interface Foo {}')).toBe(1)
  })

  it('counts export interface', () => {
    expect(countInterfaces('export interface Bar {}')).toBe(1)
  })

  it('returns 0 for no interfaces', () => {
    expect(countInterfaces('const x = 1')).toBe(0)
  })

  it('skips commented interfaces', () => {
    expect(countInterfaces('// interface Foo {}')).toBe(0)
  })
})

// ─── countTypes ─────────────────────────────────────────

describe('countTypes', () => {
  it('counts type alias', () => {
    expect(countTypes('type Foo = string')).toBe(1)
  })

  it('counts export type', () => {
    expect(countTypes('export type Bar = number')).toBe(1)
  })

  it('returns 0 for no types', () => {
    expect(countTypes('const x = 1')).toBe(0)
  })

  it('does not count type in comments', () => {
    expect(countTypes('// type Foo = string')).toBe(0)
  })
})

// ─── countEnums ─────────────────────────────────────────

describe('countEnums', () => {
  it('counts enum declarations', () => {
    expect(countEnums('enum Direction { Up, Down }')).toBe(1)
  })

  it('counts export enum', () => {
    expect(countEnums('export enum Color { Red, Blue }')).toBe(1)
  })

  it('returns 0 for no enums', () => {
    expect(countEnums('const x = 1')).toBe(0)
  })

  it('skips commented enums', () => {
    expect(countEnums('// enum Foo { A, B }')).toBe(0)
  })
})

// ─── countImports ───────────────────────────────────────

describe('countImports', () => {
  it('counts named imports', () => {
    expect(countImports("import { foo } from 'bar'")).toBe(1)
  })

  it('counts side-effect imports', () => {
    expect(countImports("import 'styles.css'")).toBe(1)
  })

  it('counts default imports', () => {
    expect(countImports("import foo from 'bar'")).toBe(1)
  })

  it('counts namespace imports', () => {
    expect(countImports("import * as foo from 'bar'")).toBe(1)
  })

  it('counts require calls', () => {
    expect(countImports("const fs = require('fs')")).toBe(1)
  })

  it('returns 0 for no imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })

  it('counts multiple imports', () => {
    const code = "import { a } from 'x'\nimport { b } from 'y'"
    expect(countImports(code)).toBe(2)
  })
})

// ─── countExports ───────────────────────────────────────

describe('countExports', () => {
  it('counts export function', () => {
    expect(countExports('export function foo() {}')).toBe(1)
  })

  it('counts export class', () => {
    expect(countExports('export class Foo {}')).toBe(1)
  })

  it('counts export const', () => {
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('counts export default', () => {
    expect(countExports('export default class Foo {}')).toBe(1)
  })

  it('counts export type', () => {
    expect(countExports('export type Foo = string')).toBe(1)
  })

  it('counts export interface', () => {
    expect(countExports('export interface Foo {}')).toBe(1)
  })

  it('counts named export block', () => {
    expect(countExports('export { foo, bar }')).toBe(1)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── countLineTypes ─────────────────────────────────────

describe('countLineTypes', () => {
  it('counts mixed content correctly', () => {
    const code = 'const x = 1\n\n// comment\nconst y = 2'
    const result = countLineTypes(code)
    expect(result.code).toBe(2)
    expect(result.comment).toBe(1)
    expect(result.blank).toBe(1)
  })

  it('counts all blank lines', () => {
    const result = countLineTypes('\n\n\n')
    expect(result.blank).toBe(4)
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('counts all code lines', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3'
    const result = countLineTypes(code)
    expect(result.code).toBe(3)
    expect(result.blank).toBe(0)
    expect(result.comment).toBe(0)
  })

  it('counts all comment lines', () => {
    const code = '// comment 1\n/* comment 2 */\n* comment 3'
    const result = countLineTypes(code)
    expect(result.comment).toBe(3)
    expect(result.code).toBe(0)
    expect(result.blank).toBe(0)
  })

  it('handles empty string', () => {
    const result = countLineTypes('')
    expect(result.code).toBe(0)
    expect(result.comment).toBe(0)
    expect(result.blank).toBe(0)
  })

  it('counts hash comments', () => {
    const result = countLineTypes('# this is a comment\ncode here')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts HTML comments', () => {
    const result = countLineTypes('<!-- html comment -->\ncode here')
    expect(result.comment).toBe(1)
    expect(result.code).toBe(1)
  })

  it('counts whitespace-only as blank', () => {
    const result = countLineTypes('   \n\t\n')
    expect(result.blank).toBe(3)
  })
})

// ─── analyzeFile ────────────────────────────────────────

describe('analyzeFile', () => {
  it('analyzes a TypeScript file', () => {
    const code = `import { foo } from 'bar'

// A class
export class MyClass {
  method() {}
}

function helper() {}
export const x = 1
`
    const stats = analyzeFile('src/index.ts', code)
    expect(stats.language).toBe('TypeScript')
    expect(stats.totalLines).toBeGreaterThan(0)
    expect(stats.codeLines).toBeGreaterThan(0)
    expect(stats.imports).toBe(1)
    expect(stats.exports).toBeGreaterThanOrEqual(2)
  })

  it('handles empty content', () => {
    const stats = analyzeFile('empty.ts', '')
    expect(stats.totalLines).toBe(0)
    expect(stats.codeLines).toBe(0)
    expect(stats.language).toBe('TypeScript')
  })

  it('detects language from extension', () => {
    const stats = analyzeFile('script.py', 'def foo():\n    pass')
    expect(stats.language).toBe('Python')
  })
})

// ─── computeLanguageStats ───────────────────────────────

describe('computeLanguageStats', () => {
  it('aggregates by language', () => {
    const fileStats: FileStats[] = [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 5, classes: 1, imports: 3, exports: 2 },
      { filePath: 'b.ts', language: 'TypeScript', totalLines: 50, codeLines: 40, commentLines: 5, blankLines: 5, functions: 3, classes: 0, imports: 2, exports: 1 },
      { filePath: 'c.js', language: 'JavaScript', totalLines: 30, codeLines: 25, commentLines: 2, blankLines: 3, functions: 2, classes: 0, imports: 1, exports: 1 },
    ]
    const result = computeLanguageStats(fileStats)
    expect(result).toHaveLength(2)
    expect(result[0].language).toBe('TypeScript')
    expect(result[0].files).toBe(2)
    expect(result[0].codeLines).toBe(120)
    expect(result[0].functions).toBe(8)
  })

  it('computes avgFileLength', () => {
    const fileStats: FileStats[] = [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 0, classes: 0, imports: 0, exports: 0 },
      { filePath: 'b.ts', language: 'TypeScript', totalLines: 50, codeLines: 40, commentLines: 5, blankLines: 5, functions: 0, classes: 0, imports: 0, exports: 0 },
    ]
    const result = computeLanguageStats(fileStats)
    expect(result[0].avgFileLength).toBe(75)
  })

  it('computes percentage', () => {
    const fileStats: FileStats[] = [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 0, classes: 0, imports: 0, exports: 0 },
      { filePath: 'b.js', language: 'JavaScript', totalLines: 50, codeLines: 20, commentLines: 5, blankLines: 5, functions: 0, classes: 0, imports: 0, exports: 0 },
    ]
    const result = computeLanguageStats(fileStats)
    expect(result[0].percentage).toBe(80)
    expect(result[1].percentage).toBe(20)
  })

  it('sorts by codeLines descending', () => {
    const fileStats: FileStats[] = [
      { filePath: 'a.js', language: 'JavaScript', totalLines: 50, codeLines: 20, commentLines: 0, blankLines: 0, functions: 0, classes: 0, imports: 0, exports: 0 },
      { filePath: 'b.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 0, blankLines: 0, functions: 0, classes: 0, imports: 0, exports: 0 },
    ]
    const result = computeLanguageStats(fileStats)
    expect(result[0].language).toBe('TypeScript')
  })

  it('handles empty input', () => {
    const result = computeLanguageStats([])
    expect(result).toHaveLength(0)
  })
})

// ─── computeMaintainability ─────────────────────────────

describe('computeMaintainability', () => {
  it('assigns grade A for high index', () => {
    const stats = { totalFiles: 5, totalLines: 100, totalCodeLines: 80, totalCommentLines: 30, totalFunctions: 20, totalClasses: 5, totalImports: 10, totalExports: 10 }
    const result = computeMaintainability(stats, [])
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.grade)
    expect(result.index).toBeGreaterThanOrEqual(0)
    expect(result.index).toBeLessThanOrEqual(100)
  })

  it('assigns grade F for low index', () => {
    const stats = { totalFiles: 1, totalLines: 5000, totalCodeLines: 4000, totalCommentLines: 0, totalFunctions: 1, totalClasses: 1, totalImports: 0, totalExports: 0 }
    const result = computeMaintainability(stats, [])
    expect(result.grade).toBe('F')
  })

  it('clamps index to 0-100', () => {
    const stats = { totalFiles: 1, totalLines: 100, totalCodeLines: 80, totalCommentLines: 50, totalFunctions: 50, totalClasses: 10, totalImports: 5, totalExports: 50 }
    const result = computeMaintainability(stats, [])
    expect(result.index).toBeGreaterThanOrEqual(0)
    expect(result.index).toBeLessThanOrEqual(100)
  })

  it('computes correct ratios', () => {
    const stats = { totalFiles: 2, totalLines: 200, totalCodeLines: 150, totalCommentLines: 50, totalFunctions: 10, totalClasses: 5, totalImports: 5, totalExports: 5 }
    const result = computeMaintainability(stats, [])
    expect(result.commentRatio).toBeGreaterThan(0)
    expect(result.exportRatio).toBeGreaterThan(0)
    expect(result.avgLinesPerFile).toBe(100)
  })

  it('handles zero files without division by zero', () => {
    const stats = { totalFiles: 0, totalLines: 0, totalCodeLines: 0, totalCommentLines: 0, totalFunctions: 0, totalClasses: 0, totalImports: 0, totalExports: 0 }
    const result = computeMaintainability(stats, [])
    expect(result.avgLinesPerFile).toBe(0)
    expect(result.index).toBeGreaterThanOrEqual(0)
  })

  it('assigns correct grade thresholds', () => {
    const makeStats = (lines: number, code: number, comments: number) => ({
      totalFiles: 1, totalLines: lines, totalCodeLines: code,
      totalCommentLines: comments, totalFunctions: 10, totalClasses: 2,
      totalImports: 5, totalExports: 5,
    })
    const result = computeMaintainability(makeStats(10, 8, 100), [])
    expect(result.grade).toBe('A')
  })
})

// ─── buildStatsResult ───────────────────────────────────

describe('buildStatsResult', () => {
  it('builds complete result from files', async () => {
    const files = [
      { absolutePath: '/fake/a.ts', path: 'a.ts' },
      { absolutePath: '/fake/b.js', path: 'b.js' },
    ]
    const reader = async () => 'const x = 1\nfunction foo() {}'
    const result = await buildStatsResult(files, reader)
    expect(result.totalFiles).toBe(2)
    expect(result.totalCodeLines).toBeGreaterThan(0)
    expect(result.languages).toHaveLength(2)
    expect(result.maintainability).toBeDefined()
    expect(result.largestFiles).toBeDefined()
    expect(result.smallestFiles).toBeDefined()
    expect(result.fileStats).toHaveLength(2)
  })

  it('handles file read errors gracefully', async () => {
    const files = [
      { absolutePath: '/nonexistent.ts', path: 'nonexistent.ts' },
    ]
    const reader = async () => { throw new Error('read error') }
    const result = await buildStatsResult(files, reader)
    expect(result.totalFiles).toBe(1)
    expect(result.totalLines).toBe(0)
  })

  it('finds largest and smallest files', async () => {
    const files = [
      { absolutePath: '/big.ts', path: 'big.ts' },
      { absolutePath: '/small.ts', path: 'small.ts' },
    ]
    let callCount = 0
    const reader = async () => {
      callCount++
      return callCount === 1 ? 'line\n'.repeat(100) : 'line\n'
    }
    const result = await buildStatsResult(files, reader)
    expect(result.largestFiles[0].filePath).toBe('big.ts')
    expect(result.smallestFiles[0].filePath).toBe('small.ts')
  })

  it('handles empty file list', async () => {
    const result = await buildStatsResult([], async () => '')
    expect(result.totalFiles).toBe(0)
    expect(result.languages).toHaveLength(0)
  })
})

// ─── formatLanguageBar ──────────────────────────────────

describe('formatLanguageBar', () => {
  it('returns 24-char bar for 100%', () => {
    const bar = formatLanguageBar(100)
    expect(bar).toHaveLength(24)
    expect(bar).toBe('████████████████████████')
  })

  it('returns empty bar for 0%', () => {
    const bar = formatLanguageBar(0)
    expect(bar).toHaveLength(24)
    expect(bar).toBe('░░░░░░░░░░░░░░░░░░░░░░░░')
  })

  it('returns partial bar for 50%', () => {
    const bar = formatLanguageBar(50)
    expect(bar).toHaveLength(24)
  })
})

// ─── formatGrade ────────────────────────────────────────

describe('formatGrade', () => {
  it('formats grade A', () => {
    const result = formatGrade('A')
    expect(result).toContain('A')
  })

  it('formats grade F', () => {
    const result = formatGrade('F')
    expect(result).toContain('F')
  })

  it('formats all grades without error', () => {
    expect(() => formatGrade('A')).not.toThrow()
    expect(() => formatGrade('B')).not.toThrow()
    expect(() => formatGrade('C')).not.toThrow()
    expect(() => formatGrade('D')).not.toThrow()
    expect(() => formatGrade('F')).not.toThrow()
  })
})

// ─── formatStatsTable ───────────────────────────────────

describe('formatStatsTable', () => {
  const makeResult = (): StatsResult => ({
    fileStats: [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 5, classes: 1, imports: 3, exports: 2 },
    ],
    languages: [{
      language: 'TypeScript', files: 1, totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10,
      functions: 5, classes: 1, interfaces: 0, types: 0, enums: 0, imports: 3, exports: 2,
      avgFileLength: 100, percentage: 100,
    }],
    largestFiles: [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 5, classes: 1, imports: 3, exports: 2 },
    ],
    maintainability: { index: 85, avgLinesPerFile: 100, avgFunctionLength: 16, commentRatio: 0.111, exportRatio: 0.222, grade: 'B' },
    smallestFiles: [
      { filePath: 'a.ts', language: 'TypeScript', totalLines: 100, codeLines: 80, commentLines: 10, blankLines: 10, functions: 5, classes: 1, imports: 3, exports: 2 },
    ],
    totalBlankLines: 10,
    totalClasses: 1,
    totalCodeLines: 80,
    totalCommentLines: 10,
    totalExports: 2,
    totalFiles: 1,
    totalFunctions: 5,
    totalImports: 3,
    totalLines: 100,
  })

  it('contains overview section', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Overview')
    expect(output).toContain('Total files')
    expect(output).toContain('Total lines')
  })

  it('contains declarations section', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Declarations')
    expect(output).toContain('Functions')
    expect(output).toContain('Classes')
  })

  it('contains language distribution', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Language Distribution')
    expect(output).toContain('TypeScript')
  })

  it('contains maintainability section', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Maintainability')
    expect(output).toContain('Grade')
  })

  it('contains largest files section', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Largest Files')
  })

  it('contains smallest files section', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).toContain('Smallest Files')
  })

  it('shows per-file breakdown when detailed', () => {
    const output = formatStatsTable(makeResult(), true, 'lines')
    expect(output).toContain('Per-File Breakdown')
  })

  it('omits per-file breakdown when not detailed', () => {
    const output = formatStatsTable(makeResult(), false, 'lines')
    expect(output).not.toContain('Per-File Breakdown')
  })
})

// ─── formatStatsJson ────────────────────────────────────

describe('formatStatsJson', () => {
  it('produces valid JSON', () => {
    const result: StatsResult = {
      fileStats: [],
      languages: [],
      largestFiles: [],
      maintainability: { index: 85, avgLinesPerFile: 100, avgFunctionLength: 16, commentRatio: 0.1, exportRatio: 0.2, grade: 'B' },
      smallestFiles: [],
      totalBlankLines: 0,
      totalClasses: 0,
      totalCodeLines: 0,
      totalCommentLines: 0,
      totalExports: 0,
      totalFiles: 0,
      totalFunctions: 0,
      totalImports: 0,
      totalLines: 0,
    }
    const json = formatStatsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.totalFiles).toBe(0)
    expect(parsed.maintainability.grade).toBe('B')
  })
})

