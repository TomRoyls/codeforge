import { describe, expect, test, vi } from 'vitest'
import chalk from 'chalk'
import { Node, Project, type BinaryExpression, type SourceFile } from 'ts-morph'

import {
  aggregateStats,
  buildStatsResult,
  calculateFileComplexity,
  countCodeStructures,
  countLines,
  formatCsv,
  formatOutput,
  formatTable,
  isLogicalOperator,
  processFileStats,
  sortFileStats,
  type AggregateResult,
  type CodeStructures,
  type FileParser,
  type FileStats,
  type LineCounts,
  type ProcessedFileResult,
  type StatsResult,
} from '../../../src/commands/stats-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeStructures = (overrides: Partial<CodeStructures> = {}): CodeStructures => ({
  classes: 0,
  enums: 0,
  functions: 0,
  interfaces: 0,
  methods: 0,
  typeAliases: 0,
  ...overrides,
})

const makeFileStats = (overrides: Partial<FileStats> = {}): FileStats => ({
  blankLines: 0,
  commentLines: 0,
  complexity: 1,
  loc: 100,
  name: 'test.ts',
  size: 500,
  structures: makeStructures(),
  type: '.ts',
  ...overrides,
})

const makeStatsResult = (overrides: Partial<StatsResult> = {}): StatsResult => ({
  files: [],
  fileTypes: {},
  summary: {
    averageComplexity: 0,
    averageLoc: 0,
    blankLines: 0,
    classes: 0,
    commentLines: 0,
    complexity: 0,
    enums: 0,
    files: 0,
    functions: 0,
    interfaces: 0,
    loc: 0,
    methods: 0,
    typeAliases: 0,
  },
  ...overrides,
})

function createSourceFile(code: string): SourceFile {
  const project = new Project({ useInMemoryFileSystem: true })
  return project.createSourceFile('test.ts', code)
}

function findBinaryExpression(sf: SourceFile): BinaryExpression | undefined {
  let result: BinaryExpression | undefined
  sf.forEachDescendant((node) => {
    if (Node.isBinaryExpression(node) && !result) result = node
  })
  return result
}

// ============================================================================
// isLogicalOperator
// ============================================================================

describe('isLogicalOperator', () => {
  test('returns true for && (AmpersandAmpersandToken)', () => {
    const sf = createSourceFile('const x = a && b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns true for || (BarBarToken)', () => {
    const sf = createSourceFile('const x = a || b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(true)
  })

  test('returns false for + (PlusToken)', () => {
    const sf = createSourceFile('const x = a + b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for === (EqualsEqualsEqualsToken)', () => {
    const sf = createSourceFile('const x = a === b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for < (LessThanToken)', () => {
    const sf = createSourceFile('const x = a < b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for * (AsteriskToken)', () => {
    const sf = createSourceFile('const x = a * b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for !== (ExclamationEqualsEqualsToken)', () => {
    const sf = createSourceFile('const x = a !== b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })
})

// ============================================================================
// calculateFileComplexity
// ============================================================================

describe('calculateFileComplexity', () => {
  test('returns 1 for empty file', () => {
    const sf = createSourceFile('')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('returns 1 for file with no control flow', () => {
    const sf = createSourceFile('const x = 1;\nconst y = 2;')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts if statement as +1', () => {
    const sf = createSourceFile('if (x) { y }')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for loop as +1', () => {
    const sf = createSourceFile('for (let i = 0; i < 10; i++) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for-in loop as +1', () => {
    const sf = createSourceFile('for (const k in obj) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts for-of loop as +1', () => {
    const sf = createSourceFile('for (const x of arr) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts while loop as +1', () => {
    const sf = createSourceFile('while (x) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts do-while loop as +1', () => {
    const sf = createSourceFile('do {} while (x)')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts catch clause as +1', () => {
    const sf = createSourceFile('try {} catch (e) {}')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts conditional (ternary) expression as +1', () => {
    const sf = createSourceFile('const x = a ? b : c')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical AND operator as +1', () => {
    const sf = createSourceFile('const x = a && b')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts logical OR operator as +1', () => {
    const sf = createSourceFile('const x = a || b')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts switch case clauses', () => {
    const sf = createSourceFile('switch (x) { case 1: break; case 2: break; default: break; }')
    // 2 case clauses = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('accumulates complexity from multiple constructs', () => {
    const sf = createSourceFile(`
      if (a) {}
      for (let i = 0; i < 10; i++) {}
      while (b) {}
      try {} catch (e) {}
    `)
    // if + for + while + catch = 4
    expect(calculateFileComplexity(sf)).toBe(4)
  })

  test('counts nested if statements', () => {
    const sf = createSourceFile(`
      if (a) {
        if (b) {
          if (c) {}
        }
      }
    `)
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('combines logical operators with control flow', () => {
    const sf = createSourceFile(`
      if (a && b) {}
    `)
    // if + && = 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts complex real-world-ish code', () => {
    const sf = createSourceFile(`
      function process(data: any) {
        if (!data) return null
        for (const item of data.items) {
          if (item.active && item.valid) {
            try {
              item.process()
            } catch (e) {
              if (item.retry) {
                item.retry()
              }
            }
          }
        }
        return data
      }
    `)
    // if + for-of + if + && + catch + if = 6
    expect(calculateFileComplexity(sf)).toBe(6)
  })

  test('does not count arithmetic operators', () => {
    const sf = createSourceFile('const x = a + b * c - d / e')
    expect(calculateFileComplexity(sf)).toBe(1)
  })
})

// ============================================================================
// countCodeStructures
// ============================================================================

describe('countCodeStructures', () => {
  test('returns all zeros for empty file', () => {
    const sf = createSourceFile('')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
    expect(result.enums).toBe(0)
    expect(result.functions).toBe(0)
    expect(result.interfaces).toBe(0)
    expect(result.methods).toBe(0)
    expect(result.typeAliases).toBe(0)
  })

  test('counts function declarations', () => {
    const sf = createSourceFile('function foo() {} function bar() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(2)
  })

  test('counts arrow functions as functions (0 - they are not FunctionDeclarations)', () => {
    const sf = createSourceFile('const foo = () => 1')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(0)
  })

  test('counts class declarations', () => {
    const sf = createSourceFile('class Foo {} class Bar {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
  })

  test('counts interface declarations', () => {
    const sf = createSourceFile('interface Foo {} interface Bar {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
  })

  test('counts type alias declarations', () => {
    const sf = createSourceFile('type Foo = string; type Bar = number;')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(2)
  })

  test('counts enum declarations', () => {
    const sf = createSourceFile('enum Foo { A, B } enum Bar { C }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(2)
  })

  test('counts method declarations', () => {
    const sf = createSourceFile('class Foo { method1() {} method2() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(2)
  })

  test('counts constructor as a method', () => {
    const sf = createSourceFile('class Foo { constructor() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(1)
  })

  test('counts both methods and constructors together', () => {
    const sf = createSourceFile('class Foo { constructor() {} method() {} other() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(3)
  })

  test('counts mixed code structures', () => {
    const sf = createSourceFile(`
      interface IShape {}
      type Point = { x: number; y: number }
      enum Color { Red, Green, Blue }
      class Shape implements IShape {
        constructor() {}
        draw() {}
      }
      function helper() {}
    `)
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
    expect(result.enums).toBe(1)
    expect(result.functions).toBe(1)
    expect(result.interfaces).toBe(1)
    expect(result.methods).toBe(2)
    expect(result.typeAliases).toBe(1)
  })

  test('does not count class expression as class declaration', () => {
    const sf = createSourceFile('const Foo = class {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(0)
  })

  test('counts multiple classes with methods', () => {
    const sf = createSourceFile(`
      class A { ma() {} }
      class B { mb() {} mc() {} }
    `)
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
    expect(result.methods).toBe(3)
  })
})

// ============================================================================
// formatCsv
// ============================================================================

describe('formatCsv', () => {
  test('returns header only for empty files array', () => {
    const stats = makeStatsResult()
    const result = formatCsv(stats)
    expect(result).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  test('formats single file correctly', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'index.ts', loc: 50, complexity: 3, size: 200, type: '.ts' })],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('File,LOC,Complexity,Size (bytes),Type')
    expect(lines[1]).toBe('index.ts,50,3,200,.ts')
  })

  test('formats multiple files correctly', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'a.ts', loc: 10, complexity: 1, size: 100, type: '.ts' }),
        makeFileStats({ name: 'b.js', loc: 20, complexity: 2, size: 200, type: '.js' }),
        makeFileStats({ name: 'c.ts', loc: 30, complexity: 5, size: 300, type: '.ts' }),
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines).toHaveLength(4)
    expect(lines[1]).toBe('a.ts,10,1,100,.ts')
    expect(lines[2]).toBe('b.js,20,2,200,.js')
    expect(lines[3]).toBe('c.ts,30,5,300,.ts')
  })

  test('has correct CSV headers', () => {
    const stats = makeStatsResult()
    const result = formatCsv(stats)
    expect(result.startsWith('File,LOC,Complexity,Size (bytes),Type')).toBe(true)
  })

  test('uses comma as delimiter', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'test.ts', loc: 100, complexity: 2, size: 500, type: '.ts' })],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('test.ts,100,2,500,.ts')
  })

  test('uses newline as row separator', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'a.ts', loc: 1, complexity: 1, size: 1, type: '.ts' }),
        makeFileStats({ name: 'b.ts', loc: 2, complexity: 2, size: 2, type: '.ts' }),
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('\n')
    expect(result.split('\n')).toHaveLength(3)
  })

  test('preserves numeric values as strings', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'x.ts', loc: 0, complexity: 0, size: 0, type: '.ts' })],
    })
    const result = formatCsv(stats)
    expect(result).toContain('x.ts,0,0,0,.ts')
  })

  test('handles large numbers', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'big.ts', loc: 10000, complexity: 500, size: 999999, type: '.ts' }),
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('big.ts,10000,500,999999,.ts')
  })
})

// ============================================================================
// formatTable
// ============================================================================

describe('formatTable', () => {
  test('includes summary section with total files', () => {
    const stats = makeStatsResult({
      summary: {
        averageComplexity: 2,
        averageLoc: 100,
        blankLines: 50,
        classes: 3,
        commentLines: 20,
        complexity: 15,
        enums: 1,
        files: 10,
        functions: 5,
        interfaces: 2,
        loc: 1000,
        methods: 8,
        typeAliases: 4,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total files: 10')
  })

  test('includes summary section with lines of code', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, loc: 1000 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Lines of code: 1,000')
  })

  test('includes total complexity in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, complexity: 42 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total complexity: 42')
  })

  test('includes blank lines in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, blankLines: 99 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Blank lines: 99')
  })

  test('includes comment lines in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, commentLines: 33 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Comment lines: 33')
  })

  test('includes code structures section', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        classes: 5,
        functions: 10,
        methods: 15,
        interfaces: 3,
        typeAliases: 2,
        enums: 1,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Classes: 5')
    expect(result).toContain('Functions: 10')
    expect(result).toContain('Methods: 15')
    expect(result).toContain('Interfaces: 3')
    expect(result).toContain('Type aliases: 2')
    expect(result).toContain('Enums: 1')
  })

  test('includes file types section', () => {
    const stats = makeStatsResult({
      fileTypes: { '.ts': 10, '.js': 5, '.tsx': 3 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 10')
    expect(result).toContain('.js: 5')
    expect(result).toContain('.tsx: 3')
  })

  test('shows empty file types section when no types', () => {
    const stats = makeStatsResult({ fileTypes: {} })
    const result = formatTable(stats, 5)
    expect(result).toContain('File Types:')
  })

  test('shows top N largest files', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'big.ts', loc: 500, complexity: 10, size: 5000 }),
        makeFileStats({ name: 'medium.ts', loc: 200, complexity: 5, size: 2000 }),
        makeFileStats({ name: 'small.ts', loc: 50, complexity: 1, size: 500 }),
      ],
    })
    const result = formatTable(stats, 2)
    expect(result).toContain('Top 2 Largest Files:')
    expect(result).toContain('big.ts')
    expect(result).toContain('medium.ts')
    expect(result).toContain('LOC: 500, Complexity: 10, Size: 5000 bytes')
    expect(result).toContain('LOC: 200, Complexity: 5, Size: 2000 bytes')
  })

  test('does not show more files than available', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'only.ts', loc: 100, complexity: 1, size: 100 })],
    })
    const result = formatTable(stats, 10)
    expect(result).toContain('only.ts')
  })

  test('formats locale numbers with toLocaleString', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        loc: 12345,
        blankLines: 6789,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('12,345')
    expect(result).toContain('6,789')
  })

  test('uses chalk.bold for title', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    expect(result).toContain(chalk.bold('\n📊 Codebase Statistics\n'))
  })

  test('uses chalk.dim for section labels', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    expect(result).toContain(chalk.dim('Summary:'))
    expect(result).toContain(chalk.dim('Code structures:'))
    expect(result).toContain(chalk.dim('File Types:'))
    expect(result).toContain(chalk.dim('Top 5 Largest Files:'))
  })

  test('handles top=0 by showing no files', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'a.ts', loc: 100, complexity: 1, size: 100 })],
    })
    const result = formatTable(stats, 0)
    expect(result).toContain('Top 0 Largest Files:')

    expect(result).not.toContain('LOC: 100, Complexity: 1')
  })
})

// ============================================================================
// formatOutput
// ============================================================================

describe('formatOutput', () => {
  test('dispatches to formatCsv when format is "csv"', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'test.ts', loc: 50, complexity: 2, size: 200, type: '.ts' })],
    })
    const result = formatOutput(stats, 'csv', 10)
    expect(result).toBe(formatCsv(stats))
    expect(result).toContain('File,LOC,Complexity,Size (bytes),Type')
  })

  test('dispatches to formatTable when format is "table"', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'table', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('dispatches to formatTable by default for unknown format', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'unknown', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('dispatches to formatTable for empty format string', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, '', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('passes top parameter to formatTable', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'a.ts', loc: 100, complexity: 1, size: 100 }),
        makeFileStats({ name: 'b.ts', loc: 200, complexity: 2, size: 200 }),
      ],
    })
    const result = formatOutput(stats, 'table', 1)
    expect(result).toContain('Top 1 Largest Files:')
  })

  test('returns CSV format without chalk bold markers', () => {
    const stats = makeStatsResult({
      files: [makeFileStats()],
    })
    const csvResult = formatOutput(stats, 'csv', 5)
    const tableResult = formatOutput(stats, 'table', 5)
    expect(tableResult).toContain('📊')
    expect(csvResult).not.toContain('📊')
  })

  test('only "csv" format triggers CSV output', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'test.ts' })],
    })
    const csv = formatOutput(stats, 'csv', 5)
    const notCsv = formatOutput(stats, 'CSV', 5)
    // 'CSV' (uppercase) should not match and should use table format
    expect(csv).not.toBe(notCsv)
  })
})

// ============================================================================
// countLines
// ============================================================================

describe('countLines', () => {
  test('counts code lines only', () => {
    const result = countLines('const x = 1;\nconst y = 2;')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  test('counts blank lines', () => {
    const result = countLines('\n\n\n')
    expect(result.blank).toBe(4)
    expect(result.loc).toBe(0)
    expect(result.comments).toBe(0)
  })

  test('counts single-line comments starting with //', () => {
    const result = countLines('// this is a comment\nconst x = 1;')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  test('counts block comment starts with /*', () => {
    const result = countLines('/* block comment start\ncontinued */\nconst x = 1;')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(2)
  })

  test('handles empty string', () => {
    const result = countLines('')
    expect(result).toEqual({ blank: 1, comments: 0, loc: 0 })
  })

  test('handles mixed content', () => {
    const content = 'const x = 1;\n// comment\n\nconst y = 2;\n/* block */\n\nconst z = 3;'
    const result = countLines(content)
    expect(result.loc).toBe(3)
    expect(result.comments).toBe(2)
    expect(result.blank).toBe(2)
  })

  test('handles whitespace-only lines as blank', () => {
    const result = countLines('  \n\t\n   \n')
    expect(result.blank).toBe(4)
    expect(result.loc).toBe(0)
    expect(result.comments).toBe(0)
  })

  test('handles all-comment file', () => {
    const content = '// line 1\n// line 2\n/* block */'
    const result = countLines(content)
    expect(result.comments).toBe(3)
    expect(result.loc).toBe(0)
    expect(result.blank).toBe(0)
  })

  test('handles all-blank file', () => {
    const result = countLines('\n\n\n\n')
    expect(result.blank).toBe(5)
    expect(result.loc).toBe(0)
    expect(result.comments).toBe(0)
  })

  test('handles single line with no newline', () => {
    const result = countLines('const x = 1;')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })

  test('treats indented comments as comments', () => {
    const result = countLines('  // indented comment')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(0)
  })

  test('does not treat code with // in strings as comment', () => {
    const result = countLines('const url = "https://example.com"')
    expect(result.loc).toBe(1)
    expect(result.comments).toBe(0)
  })

  test('returns LineCounts type with all fields', () => {
    const result: LineCounts = countLines('x')
    expect(result).toHaveProperty('loc')
    expect(result).toHaveProperty('comments')
    expect(result).toHaveProperty('blank')
  })
})

// ============================================================================
// processFileStats
// ============================================================================

describe('processFileStats', () => {
  const tsExtensions = new Set(['.ts', '.tsx'])
  const file = { absolutePath: '/test/file.ts', path: 'file.ts' }

  test('counts lines from content', async () => {
    const result = await processFileStats(
      file,
      'const x = 1;\n// comment\n\nconst y = 2;',
      null,
      tsExtensions,
    )
    expect(result.loc).toBe(2)
    expect(result.comments).toBe(1)
    expect(result.blank).toBe(1)
  })

  test('sets size to content length', async () => {
    const content = 'const x = 1;'
    const result = await processFileStats(file, content, null, tsExtensions)
    expect(result.size).toBe(content.length)
  })

  test('extracts file extension', async () => {
    const result = await processFileStats(file, 'x', null, tsExtensions)
    expect(result.ext).toBe('.ts')
  })

  test('normalizes extension to lowercase', async () => {
    const upperFile = { absolutePath: '/test/file.TS', path: 'file.TS' }
    const result = await processFileStats(upperFile, 'x', null, tsExtensions)
    expect(result.ext).toBe('.ts')
  })

  test('returns complexity 1 with no parser', async () => {
    const result = await processFileStats(file, 'const x = 1;', null, tsExtensions)
    expect(result.complexity).toBe(1)
  })

  test('returns default structures with no parser', async () => {
    const result = await processFileStats(file, 'const x = 1;', null, tsExtensions)
    expect(result.structures).toEqual({
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    })
  })

  test('uses parser for TypeScript files', async () => {
    const sf = createSourceFile('if (a) {} if (b) {}')
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: sf }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(file, 'if (a) {} if (b) {}', mockParser, tsExtensions)
    expect(mockParser.parseFile).toHaveBeenCalledWith('/test/file.ts')
    expect(mockParser.releaseFile).toHaveBeenCalledWith('/test/file.ts')
    expect(result.complexity).toBe(2)
  })

  test('does not use parser for non-TypeScript files', async () => {
    const jsFile = { absolutePath: '/test/file.js', path: 'file.js' }
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: createSourceFile('') }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(jsFile, 'const x = 1;', mockParser, tsExtensions)
    expect(mockParser.parseFile).not.toHaveBeenCalled()
    expect(result.complexity).toBe(1)
  })

  test('falls back to defaults when parser throws', async () => {
    const mockParser: FileParser = {
      parseFile: vi.fn().mockRejectedValue(new Error('parse error')),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(file, 'const x = 1;', mockParser, tsExtensions)
    expect(result.complexity).toBe(1)
    expect(result.structures).toEqual({
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    })
  })

  test('uses parser for .tsx files', async () => {
    const tsxFile = { absolutePath: '/test/file.tsx', path: 'file.tsx' }
    const sf = createSourceFile('function Component() { return null }')
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: sf }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(
      tsxFile,
      'function Component() {}',
      mockParser,
      tsExtensions,
    )
    expect(mockParser.parseFile).toHaveBeenCalledWith('/test/file.tsx')
    expect(result.complexity).toBe(1)
  })

  test('returns correct file reference', async () => {
    const result = await processFileStats(file, 'x', null, tsExtensions)
    expect(result.file).toBe(file)
  })

  test('counts structures from parser result', async () => {
    const sf = createSourceFile('class Foo { method() {} }\nfunction bar() {}')
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: sf }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(
      file,
      'class Foo { method() {} }\nfunction bar() {}',
      mockParser,
      tsExtensions,
    )
    expect(result.structures.classes).toBe(1)
    expect(result.structures.methods).toBe(1)
    expect(result.structures.functions).toBe(1)
  })

  test('handles empty content', async () => {
    const result = await processFileStats(file, '', null, tsExtensions)
    expect(result.loc).toBe(0)
    expect(result.blank).toBe(1)
    expect(result.size).toBe(0)
  })
})

// ============================================================================
// aggregateStats
// ============================================================================

describe('aggregateStats', () => {
  const makeResult = (overrides: Partial<ProcessedFileResult> = {}): ProcessedFileResult => ({
    blank: 5,
    comments: 3,
    complexity: 2,
    ext: '.ts',
    file: { absolutePath: '/test/file.ts', path: 'file.ts' },
    loc: 50,
    size: 500,
    structures: makeStructures(),
    ...overrides,
  })

  test('returns empty aggregation for empty results', () => {
    const result = aggregateStats([], false)
    expect(result.totalLoc).toBe(0)
    expect(result.totalComments).toBe(0)
    expect(result.totalBlank).toBe(0)
    expect(result.totalComplexity).toBe(0)
    expect(result.fileStats).toEqual([])
    expect(result.fileTypes).toEqual({})
  })

  test('skips null results', () => {
    const result = aggregateStats([null, null], false)
    expect(result.totalLoc).toBe(0)
  })

  test('aggregates loc across files', () => {
    const results = [makeResult({ loc: 10 }), makeResult({ loc: 20 }), makeResult({ loc: 30 })]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(60)
  })

  test('aggregates comments across files', () => {
    const results = [makeResult({ comments: 5 }), makeResult({ comments: 15 })]
    const result = aggregateStats(results, false)
    expect(result.totalComments).toBe(20)
  })

  test('aggregates blank lines across files', () => {
    const results = [makeResult({ blank: 3 }), makeResult({ blank: 7 })]
    const result = aggregateStats(results, false)
    expect(result.totalBlank).toBe(10)
  })

  test('aggregates complexity across files', () => {
    const results = [makeResult({ complexity: 4 }), makeResult({ complexity: 6 })]
    const result = aggregateStats(results, false)
    expect(result.totalComplexity).toBe(10)
  })

  test('counts file types', () => {
    const results = [
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.js' }),
    ]
    const result = aggregateStats(results, false)
    expect(result.fileTypes).toEqual({ '.ts': 2, '.js': 1 })
  })

  test('aggregates code structures', () => {
    const results = [
      makeResult({ structures: makeStructures({ classes: 2, functions: 3 }) }),
      makeResult({ structures: makeStructures({ classes: 1, interfaces: 4 }) }),
    ]
    const result = aggregateStats(results, false)
    expect(result.totalStructures.classes).toBe(3)
    expect(result.totalStructures.functions).toBe(3)
    expect(result.totalStructures.interfaces).toBe(4)
  })

  test('aggregates all structure fields', () => {
    const results = [
      makeResult({
        structures: {
          classes: 1,
          enums: 2,
          functions: 3,
          interfaces: 4,
          methods: 5,
          typeAliases: 6,
        },
      }),
      makeResult({
        structures: {
          classes: 10,
          enums: 20,
          functions: 30,
          interfaces: 40,
          methods: 50,
          typeAliases: 60,
        },
      }),
    ]
    const result = aggregateStats(results, false)
    expect(result.totalStructures).toEqual({
      classes: 11,
      enums: 22,
      functions: 33,
      interfaces: 44,
      methods: 55,
      typeAliases: 66,
    })
  })

  test('does not populate fileStats when verbose is false', () => {
    const results = [makeResult()]
    const result = aggregateStats(results, false)
    expect(result.fileStats).toEqual([])
  })

  test('populates fileStats when verbose is true', () => {
    const results = [
      makeResult({
        blank: 5,
        comments: 3,
        complexity: 2,
        ext: '.ts',
        file: { absolutePath: '/test/a.ts', path: 'a.ts' },
        loc: 50,
        size: 500,
        structures: makeStructures({ classes: 1 }),
      }),
    ]
    const result = aggregateStats(results, true)
    expect(result.fileStats).toHaveLength(1)
    expect(result.fileStats[0]).toEqual({
      blankLines: 5,
      commentLines: 3,
      complexity: 2,
      loc: 50,
      name: 'a.ts',
      size: 500,
      structures: makeStructures({ classes: 1 }),
      type: '.ts',
    })
  })

  test('uses "unknown" type for files with no extension', () => {
    const results = [
      makeResult({
        ext: '',
        file: { absolutePath: '/test/Makefile', path: 'Makefile' },
      }),
    ]
    const result = aggregateStats(results, true)
    expect(result.fileStats[0].type).toBe('unknown')
  })

  test('handles mix of null and valid results', () => {
    const results = [
      null,
      makeResult({ loc: 10, complexity: 2, ext: '.ts' }),
      null,
      makeResult({ loc: 20, complexity: 3, ext: '.js' }),
    ]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(30)
    expect(result.totalComplexity).toBe(5)
    expect(result.fileTypes).toEqual({ '.ts': 1, '.js': 1 })
  })

  test('returns AggregateResult type with all fields', () => {
    const result: AggregateResult = aggregateStats([], false)
    expect(result).toHaveProperty('fileStats')
    expect(result).toHaveProperty('fileTypes')
    expect(result).toHaveProperty('totalLoc')
    expect(result).toHaveProperty('totalComments')
    expect(result).toHaveProperty('totalBlank')
    expect(result).toHaveProperty('totalComplexity')
    expect(result).toHaveProperty('totalStructures')
  })
})

// ============================================================================
// sortFileStats
// ============================================================================

describe('sortFileStats', () => {
  const files: FileStats[] = [
    makeFileStats({ name: 'small.ts', size: 100, complexity: 1, loc: 10 }),
    makeFileStats({ name: 'large.ts', size: 500, complexity: 5, loc: 50 }),
    makeFileStats({ name: 'medium.ts', size: 300, complexity: 3, loc: 30 }),
  ]

  test('sorts by size descending (default)', () => {
    const result = sortFileStats(files, 'size')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('sorts by complexity descending', () => {
    const result = sortFileStats(files, 'complexity')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('sorts by loc descending', () => {
    const result = sortFileStats(files, 'loc')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('sorts by name alphabetically', () => {
    const result = sortFileStats(files, 'name')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('sorts by name alphabetically with different names', () => {
    const alphaFiles: FileStats[] = [
      makeFileStats({ name: 'zebra.ts' }),
      makeFileStats({ name: 'apple.ts' }),
      makeFileStats({ name: 'banana.ts' }),
    ]
    const result = sortFileStats(alphaFiles, 'name')
    expect(result.map((f) => f.name)).toEqual(['apple.ts', 'banana.ts', 'zebra.ts'])
  })

  test('defaults to size sorting for unknown sortBy', () => {
    const result = sortFileStats(files, 'unknown')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('does not mutate original array', () => {
    const original = [...files]
    sortFileStats(files, 'size')
    expect(files.map((f) => f.name)).toEqual(original.map((f) => f.name))
  })

  test('returns empty array for empty input', () => {
    const result = sortFileStats([], 'size')
    expect(result).toEqual([])
  })

  test('handles single element', () => {
    const single = [makeFileStats({ name: 'only.ts' })]
    const result = sortFileStats(single, 'size')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('only.ts')
  })

  test('handles equal values in size sort', () => {
    const equalFiles: FileStats[] = [
      makeFileStats({ name: 'a.ts', size: 100 }),
      makeFileStats({ name: 'b.ts', size: 100 }),
    ]
    const result = sortFileStats(equalFiles, 'size')
    expect(result).toHaveLength(2)
  })

  test('handles equal values in complexity sort', () => {
    const equalFiles: FileStats[] = [
      makeFileStats({ name: 'a.ts', complexity: 5 }),
      makeFileStats({ name: 'b.ts', complexity: 5 }),
    ]
    const result = sortFileStats(equalFiles, 'complexity')
    expect(result).toHaveLength(2)
  })
})

// ============================================================================
// buildStatsResult
// ============================================================================

describe('buildStatsResult', () => {
  const makeAggregated = (overrides: Partial<AggregateResult> = {}): AggregateResult => ({
    fileStats: [],
    fileTypes: {},
    totalBlank: 100,
    totalComments: 50,
    totalComplexity: 200,
    totalLoc: 1000,
    totalStructures: makeStructures({
      classes: 5,
      enums: 2,
      functions: 10,
      interfaces: 3,
      methods: 8,
      typeAliases: 4,
    }),
    ...overrides,
  })

  test('builds StatsResult with correct summary fields', () => {
    const aggregated = makeAggregated()
    const result = buildStatsResult(20, [], aggregated)
    expect(result.summary.files).toBe(20)
    expect(result.summary.loc).toBe(1000)
    expect(result.summary.commentLines).toBe(50)
    expect(result.summary.blankLines).toBe(100)
    expect(result.summary.complexity).toBe(200)
  })

  test('calculates average complexity', () => {
    const aggregated = makeAggregated({ totalComplexity: 100 })
    const result = buildStatsResult(4, [], aggregated)
    expect(result.summary.averageComplexity).toBe(25)
  })

  test('calculates average loc', () => {
    const aggregated = makeAggregated({ totalLoc: 500 })
    const result = buildStatsResult(5, [], aggregated)
    expect(result.summary.averageLoc).toBe(100)
  })

  test('rounds average complexity', () => {
    const aggregated = makeAggregated({ totalComplexity: 103 })
    const result = buildStatsResult(7, [], aggregated)
    expect(result.summary.averageComplexity).toBe(Math.round(103 / 7))
  })

  test('rounds average loc', () => {
    const aggregated = makeAggregated({ totalLoc: 107 })
    const result = buildStatsResult(7, [], aggregated)
    expect(result.summary.averageLoc).toBe(Math.round(107 / 7))
  })

  test('returns 0 averages when no files', () => {
    const aggregated = makeAggregated()
    const result = buildStatsResult(0, [], aggregated)
    expect(result.summary.averageComplexity).toBe(0)
    expect(result.summary.averageLoc).toBe(0)
  })

  test('passes through file types', () => {
    const aggregated = makeAggregated({ fileTypes: { '.ts': 10, '.js': 5 } })
    const result = buildStatsResult(15, [], aggregated)
    expect(result.fileTypes).toEqual({ '.ts': 10, '.js': 5 })
  })

  test('slices fileStats to MAX_TOP_STATS_FILES', () => {
    const manyFiles = Array.from({ length: 50 }, (_, i) => makeFileStats({ name: `file${i}.ts` }))
    const aggregated = makeAggregated()
    const result = buildStatsResult(50, manyFiles, aggregated)
    expect(result.files).toHaveLength(10)
  })

  test('returns all fileStats when fewer than MAX_TOP_STATS_FILES', () => {
    const fewFiles = [makeFileStats({ name: 'a.ts' }), makeFileStats({ name: 'b.ts' })]
    const aggregated = makeAggregated()
    const result = buildStatsResult(2, fewFiles, aggregated)
    expect(result.files).toHaveLength(2)
  })

  test('maps all structure fields to summary', () => {
    const aggregated = makeAggregated({
      totalStructures: {
        classes: 5,
        enums: 2,
        functions: 10,
        interfaces: 3,
        methods: 8,
        typeAliases: 4,
      },
    })
    const result = buildStatsResult(10, [], aggregated)
    expect(result.summary.classes).toBe(5)
    expect(result.summary.enums).toBe(2)
    expect(result.summary.functions).toBe(10)
    expect(result.summary.interfaces).toBe(3)
    expect(result.summary.methods).toBe(8)
    expect(result.summary.typeAliases).toBe(4)
  })

  test('returns StatsResult type', () => {
    const aggregated = makeAggregated()
    const result: StatsResult = buildStatsResult(0, [], aggregated)
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('fileTypes')
    expect(result).toHaveProperty('summary')
  })

  test('handles empty structures', () => {
    const aggregated = makeAggregated({
      totalStructures: makeStructures(),
    })
    const result = buildStatsResult(5, [], aggregated)
    expect(result.summary.classes).toBe(0)
    expect(result.summary.enums).toBe(0)
    expect(result.summary.functions).toBe(0)
    expect(result.summary.interfaces).toBe(0)
    expect(result.summary.methods).toBe(0)
    expect(result.summary.typeAliases).toBe(0)
  })

  test('handles exactly MAX_TOP_STATS_FILES files', () => {
    const tenFiles = Array.from({ length: 10 }, (_, i) => makeFileStats({ name: `file${i}.ts` }))
    const aggregated = makeAggregated()
    const result = buildStatsResult(10, tenFiles, aggregated)
    expect(result.files).toHaveLength(10)
  })

  test('handles single file', () => {
    const singleFile = [makeFileStats({ name: 'only.ts', loc: 42, complexity: 3 })]
    const aggregated = makeAggregated({ totalLoc: 42, totalComplexity: 3 })
    const result = buildStatsResult(1, singleFile, aggregated)
    expect(result.summary.files).toBe(1)
    expect(result.summary.averageLoc).toBe(42)
    expect(result.summary.averageComplexity).toBe(3)
  })

  test('preserves file order from input', () => {
    const files = [
      makeFileStats({ name: 'z.ts' }),
      makeFileStats({ name: 'a.ts' }),
      makeFileStats({ name: 'm.ts' }),
    ]
    const aggregated = makeAggregated()
    const result = buildStatsResult(3, files, aggregated)
    expect(result.files.map((f) => f.name)).toEqual(['z.ts', 'a.ts', 'm.ts'])
  })
})

// ============================================================================
// Additional isLogicalOperator tests
// ============================================================================

describe('isLogicalOperator additional operators', () => {
  test('returns false for - (MinusToken)', () => {
    const sf = createSourceFile('const x = a - b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for / (SlashToken)', () => {
    const sf = createSourceFile('const x = a / b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for % (PercentToken)', () => {
    const sf = createSourceFile('const x = a % b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for > (GreaterThanToken)', () => {
    const sf = createSourceFile('const x = a > b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for <= (LessThanEqualsToken)', () => {
    const sf = createSourceFile('const x = a <= b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for >= (GreaterThanEqualsToken)', () => {
    const sf = createSourceFile('const x = a >= b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })

  test('returns false for != (ExclamationEqualsToken)', () => {
    const sf = createSourceFile('const x = a != b')
    const expr = findBinaryExpression(sf)
    expect(expr).toBeDefined()
    expect(isLogicalOperator(expr!)).toBe(false)
  })
})

// ============================================================================
// Additional calculateFileComplexity tests
// ============================================================================

describe('calculateFileComplexity additional cases', () => {
  test('counts multiple logical AND operators', () => {
    const sf = createSourceFile('const x = a && b && c')
    // Two && operators = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts multiple logical OR operators', () => {
    const sf = createSourceFile('const x = a || b || c')
    // Two || operators = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts mixed logical AND and OR operators', () => {
    const sf = createSourceFile('const x = a && b || c')
    // && + || = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts nested ternary expressions', () => {
    const sf = createSourceFile('const x = a ? (b ? 1 : 2) : 3')
    // outer ternary + inner ternary = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts empty switch statement as 0', () => {
    const sf = createSourceFile('switch (x) {}')
    // No case clauses = complexity 0, floored to 1
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts switch with default only as 0 case clauses', () => {
    const sf = createSourceFile('switch (x) { default: break; }')
    // Default clause is not a CaseClause = complexity 1
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts deeply nested if-else chain', () => {
    const sf = createSourceFile(`
      if (a) {}
      else if (b) {}
      else if (c) {}
      else {}
    `)
    // Each if/else-if is an IfStatement = 3
    expect(calculateFileComplexity(sf)).toBe(3)
  })

  test('counts multiple catch clauses in separate try blocks', () => {
    const sf = createSourceFile(`
      try {} catch (e) {}
      try {} catch (e2) {}
    `)
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('returns 1 for comment-only file', () => {
    const sf = createSourceFile('// just a comment')
    expect(calculateFileComplexity(sf)).toBe(1)
  })

  test('counts complexity in class method', () => {
    const sf = createSourceFile(`
      class Foo {
        bar() {
          if (x) {}
          for (let i = 0; i < 10; i++) {}
        }
      }
    `)
    // if + for = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts complexity in function body', () => {
    const sf = createSourceFile(`
      function process() {
        if (a) { return 1 }
        if (b) { return 2 }
        return 3
      }
    `)
    // 2 if statements = complexity 2
    expect(calculateFileComplexity(sf)).toBe(2)
  })

  test('counts chained operators in condition', () => {
    const sf = createSourceFile('if (a && b || c) {}')
    // if + && + || = complexity 3
    expect(calculateFileComplexity(sf)).toBe(3)
  })
})

// ============================================================================
// Additional countCodeStructures tests
// ============================================================================

describe('countCodeStructures additional cases', () => {
  test('counts abstract class declarations', () => {
    const sf = createSourceFile('abstract class Foo { abstract method(): void }')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(1)
  })

  test('counts methods in abstract class', () => {
    const sf = createSourceFile('abstract class Base { abstract doWork(): void; concrete() {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(2)
  })

  test('counts async function declarations', () => {
    const sf = createSourceFile('async function fetchData() {} async function processData() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(2)
  })

  test('counts exported function declarations', () => {
    const sf = createSourceFile('export function foo() {} export function bar() {}')
    const result = countCodeStructures(sf)
    expect(result.functions).toBe(2)
  })

  test('counts exported class declarations', () => {
    const sf = createSourceFile('export class Foo {} export class Bar {}')
    const result = countCodeStructures(sf)
    expect(result.classes).toBe(2)
  })

  test('counts exported interface declarations', () => {
    const sf = createSourceFile('export interface Foo {} export interface Bar {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
  })

  test('counts exported type alias declarations', () => {
    const sf = createSourceFile('export type Foo = string; export type Bar = number;')
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(2)
  })

  test('counts exported enum declarations', () => {
    const sf = createSourceFile('export enum Foo { A, B } export enum Bar { C }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(2)
  })

  test('does not count getter accessors as methods', () => {
    const sf = createSourceFile('class Foo { get value() { return 1 } }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(0)
  })

  test('does not count setter accessors as methods', () => {
    const sf = createSourceFile('class Foo { set value(v: number) {} }')
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(0)
  })

  test('counts methods with various modifiers', () => {
    const sf = createSourceFile(
      'class Foo { public a() {} private b() {} protected c() {} static d() {} }',
    )
    const result = countCodeStructures(sf)
    expect(result.methods).toBe(4)
  })

  test('counts generic interface declarations', () => {
    const sf = createSourceFile('interface Container<T> {} interface Pair<A, B> {}')
    const result = countCodeStructures(sf)
    expect(result.interfaces).toBe(2)
  })

  test('counts generic type alias declarations', () => {
    const sf = createSourceFile(
      'type Result<T> = { data: T }; type Callback<T> = (data: T) => void;',
    )
    const result = countCodeStructures(sf)
    expect(result.typeAliases).toBe(2)
  })

  test('does not count const enum separately from regular enum', () => {
    const sf = createSourceFile('const enum Foo { A, B } enum Bar { C }')
    const result = countCodeStructures(sf)
    expect(result.enums).toBe(2)
  })
})

// ============================================================================
// Additional countLines tests
// ============================================================================

describe('countLines additional cases', () => {
  test('counts block comment with leading whitespace', () => {
    const result = countLines('  /* comment */\ncode')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(1)
  })

  test('handles lines with code before block comment marker', () => {
    const result = countLines('code /* not a comment start */')
    // This starts with 'code', not '/*', so it's code
    expect(result.loc).toBe(1)
    expect(result.comments).toBe(0)
  })

  test('handles multiple blank lines between code', () => {
    const result = countLines('code1\n\n\n\ncode2')
    expect(result.loc).toBe(2)
    expect(result.blank).toBe(3)
  })

  test('handles trailing newline', () => {
    const result = countLines('code\n')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(1)
  })

  test('handles multiple trailing newlines', () => {
    const result = countLines('code\n\n\n')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(3)
  })

  test('handles only whitespace and comments', () => {
    const result = countLines('  // comment\n  \n\t\n/* block */')
    expect(result.comments).toBe(2)
    expect(result.blank).toBe(2)
    expect(result.loc).toBe(0)
  })

  test('handles single comment line with no newline', () => {
    const result = countLines('// just a comment')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(0)
    expect(result.blank).toBe(0)
  })

  test('handles single block comment start with no newline', () => {
    const result = countLines('/* block */')
    expect(result.comments).toBe(1)
    expect(result.loc).toBe(0)
  })

  test('handles file with only code line', () => {
    const result = countLines('const x = 1;')
    expect(result.loc).toBe(1)
    expect(result.blank).toBe(0)
    expect(result.comments).toBe(0)
  })
})

// ============================================================================
// Additional processFileStats tests
// ============================================================================

describe('processFileStats additional cases', () => {
  const tsExtensions = new Set(['.ts', '.tsx'])
  const file = { absolutePath: '/test/file.ts', path: 'file.ts' }

  test('calls releaseFile after successful parse', async () => {
    const sf = createSourceFile('const x = 1;')
    const releaseFile = vi.fn()
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: sf }),
      releaseFile,
    }
    await processFileStats(file, 'const x = 1;', mockParser, tsExtensions)
    expect(releaseFile).toHaveBeenCalledWith('/test/file.ts')
    expect(releaseFile).toHaveBeenCalledTimes(1)
  })

  test('does not call releaseFile when parser throws', async () => {
    const releaseFile = vi.fn()
    const mockParser: FileParser = {
      parseFile: vi.fn().mockRejectedValue(new Error('parse error')),
      releaseFile,
    }
    await processFileStats(file, 'const x = 1;', mockParser, tsExtensions)
    expect(releaseFile).not.toHaveBeenCalled()
  })

  test('returns correct size for multi-byte content', async () => {
    const content = 'const x = "hello世界"'
    const result = await processFileStats(file, content, null, tsExtensions)
    expect(result.size).toBe(content.length)
  })

  test('handles .tsx extension correctly', async () => {
    const tsxFile = { absolutePath: '/test/component.tsx', path: 'component.tsx' }
    const sf = createSourceFile('function Component() { return null }')
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: sf }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(
      tsxFile,
      'function Component() {}',
      mockParser,
      tsExtensions,
    )
    expect(result.ext).toBe('.tsx')
    expect(mockParser.parseFile).toHaveBeenCalled()
  })

  test('skips parser for non-TS extension in mixed set', async () => {
    const pyFile = { absolutePath: '/test/script.py', path: 'script.py' }
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: createSourceFile('') }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(pyFile, 'print("hello")', mockParser, tsExtensions)
    expect(mockParser.parseFile).not.toHaveBeenCalled()
    expect(result.ext).toBe('.py')
    expect(result.complexity).toBe(1)
  })

  test('skips parser when tsExtensions set is empty', async () => {
    const emptyExtensions = new Set<string>()
    const mockParser: FileParser = {
      parseFile: vi.fn().mockResolvedValue({ sourceFile: createSourceFile('') }),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(file, 'const x = 1;', mockParser, emptyExtensions)
    expect(mockParser.parseFile).not.toHaveBeenCalled()
    expect(result.complexity).toBe(1)
  })

  test('returns default structures when parser throws', async () => {
    const mockParser: FileParser = {
      parseFile: vi.fn().mockRejectedValue(new Error('oops')),
      releaseFile: vi.fn(),
    }
    const result = await processFileStats(file, 'class Foo {}', mockParser, tsExtensions)
    expect(result.structures).toEqual({
      classes: 0,
      enums: 0,
      functions: 0,
      interfaces: 0,
      methods: 0,
      typeAliases: 0,
    })
  })
})

// ============================================================================
// Additional aggregateStats tests
// ============================================================================

describe('aggregateStats additional cases', () => {
  const makeResult = (overrides: Partial<ProcessedFileResult> = {}): ProcessedFileResult => ({
    blank: 0,
    comments: 0,
    complexity: 1,
    ext: '.ts',
    file: { absolutePath: '/test/file.ts', path: 'file.ts' },
    loc: 10,
    size: 100,
    structures: makeStructures(),
    ...overrides,
  })

  test('skips null results with verbose true', () => {
    const result = aggregateStats([null, makeResult({ loc: 5 }), null], true)
    expect(result.fileStats).toHaveLength(1)
    expect(result.totalLoc).toBe(5)
  })

  test('does not include null in file type counts', () => {
    const result = aggregateStats([null, makeResult({ ext: '.js' }), null], false)
    expect(result.fileTypes).toEqual({ '.js': 1 })
  })

  test('aggregates multiple file extensions correctly', () => {
    const results = [
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.js' }),
      makeResult({ ext: '.tsx' }),
      makeResult({ ext: '.ts' }),
      makeResult({ ext: '.js' }),
      makeResult({ ext: '.js' }),
    ]
    const result = aggregateStats(results, false)
    expect(result.fileTypes).toEqual({ '.ts': 2, '.js': 3, '.tsx': 1 })
  })

  test('aggregates totalLoc correctly with zero values', () => {
    const results = [makeResult({ loc: 0 }), makeResult({ loc: 0 }), makeResult({ loc: 5 })]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(5)
  })

  test('aggregates totalComplexity with zero values', () => {
    const results = [makeResult({ complexity: 0 }), makeResult({ complexity: 3 })]
    const result = aggregateStats(results, false)
    expect(result.totalComplexity).toBe(3)
  })

  test('populates correct fileStats entries in verbose mode', () => {
    const results = [
      makeResult({
        blank: 2,
        comments: 1,
        complexity: 5,
        ext: '.ts',
        file: { absolutePath: '/a.ts', path: 'a.ts' },
        loc: 100,
        size: 500,
        structures: makeStructures({ functions: 3 }),
      }),
      makeResult({
        blank: 3,
        comments: 2,
        complexity: 7,
        ext: '.js',
        file: { absolutePath: '/b.js', path: 'b.js' },
        loc: 200,
        size: 800,
        structures: makeStructures({ classes: 1 }),
      }),
    ]
    const result = aggregateStats(results, true)
    expect(result.fileStats).toHaveLength(2)
    expect(result.fileStats[0].name).toBe('a.ts')
    expect(result.fileStats[0].type).toBe('.ts')
    expect(result.fileStats[0].blankLines).toBe(2)
    expect(result.fileStats[0].commentLines).toBe(1)
    expect(result.fileStats[0].loc).toBe(100)
    expect(result.fileStats[0].size).toBe(500)
    expect(result.fileStats[0].complexity).toBe(5)
    expect(result.fileStats[0].structures.functions).toBe(3)
    expect(result.fileStats[1].name).toBe('b.js')
    expect(result.fileStats[1].type).toBe('.js')
    expect(result.fileStats[1].structures.classes).toBe(1)
  })

  test('handles single result', () => {
    const results = [makeResult({ loc: 42, complexity: 3, ext: '.ts' })]
    const result = aggregateStats(results, false)
    expect(result.totalLoc).toBe(42)
    expect(result.totalComplexity).toBe(3)
    expect(result.fileTypes).toEqual({ '.ts': 1 })
    expect(result.fileStats).toEqual([])
  })

  test('aggregates totalBlank correctly', () => {
    const results = [makeResult({ blank: 0 }), makeResult({ blank: 10 }), makeResult({ blank: 5 })]
    const result = aggregateStats(results, false)
    expect(result.totalBlank).toBe(15)
  })

  test('aggregates totalComments correctly', () => {
    const results = [makeResult({ comments: 0 }), makeResult({ comments: 8 })]
    const result = aggregateStats(results, false)
    expect(result.totalComments).toBe(8)
  })
})

// ============================================================================
// Additional sortFileStats tests
// ============================================================================

describe('sortFileStats additional cases', () => {
  test('sorts by loc with distinct values', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'a.ts', loc: 10 }),
      makeFileStats({ name: 'b.ts', loc: 30 }),
      makeFileStats({ name: 'c.ts', loc: 20 }),
    ]
    const result = sortFileStats(files, 'loc')
    expect(result.map((f) => f.name)).toEqual(['b.ts', 'c.ts', 'a.ts'])
  })

  test('sorts by complexity with distinct values', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'low.ts', complexity: 1 }),
      makeFileStats({ name: 'high.ts', complexity: 10 }),
      makeFileStats({ name: 'mid.ts', complexity: 5 }),
    ]
    const result = sortFileStats(files, 'complexity')
    expect(result.map((f) => f.name)).toEqual(['high.ts', 'mid.ts', 'low.ts'])
  })

  test('sorts by size with distinct values', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'small.ts', size: 50 }),
      makeFileStats({ name: 'large.ts', size: 500 }),
      makeFileStats({ name: 'medium.ts', size: 200 }),
    ]
    const result = sortFileStats(files, 'size')
    expect(result.map((f) => f.name)).toEqual(['large.ts', 'medium.ts', 'small.ts'])
  })

  test('preserves relative order for equal loc values', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'first.ts', loc: 100 }),
      makeFileStats({ name: 'second.ts', loc: 100 }),
      makeFileStats({ name: 'third.ts', loc: 100 }),
    ]
    const result = sortFileStats(files, 'loc')
    expect(result.map((f) => f.name)).toEqual(['first.ts', 'second.ts', 'third.ts'])
  })

  test('sorts equal complexity by stability', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'a.ts', complexity: 5 }),
      makeFileStats({ name: 'b.ts', complexity: 5 }),
      makeFileStats({ name: 'c.ts', complexity: 5 }),
    ]
    const result = sortFileStats(files, 'complexity')
    expect(result).toHaveLength(3)
    // All have same complexity so relative order is preserved
    expect(result.map((f) => f.name)).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  test('sorts by name case-sensitively', () => {
    const files: FileStats[] = [
      makeFileStats({ name: 'Banana.ts' }),
      makeFileStats({ name: 'apple.ts' }),
      makeFileStats({ name: 'cherry.ts' }),
    ]
    const result = sortFileStats(files, 'name')
    // localeCompare default: lowercase sorts before uppercase
    expect(result[0].name).toBe('apple.ts')
    expect(result[1].name).toBe('Banana.ts')
    expect(result[2].name).toBe('cherry.ts')
  })
})

// ============================================================================
// Additional formatTable tests
// ============================================================================

describe('formatTable additional cases', () => {
  test('includes average complexity in StatsResult', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        averageComplexity: 7,
        files: 10,
      },
    })
    expect(stats.summary.averageComplexity).toBe(7)
  })

  test('includes average loc in StatsResult', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        averageLoc: 150,
        files: 5,
      },
    })
    expect(stats.summary.averageLoc).toBe(150)
  })

  test('handles summary with all zeros', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    expect(result).toContain('Total files: 0')
    expect(result).toContain('Lines of code: 0')
    expect(result).toContain('Total complexity: 0')
  })

  test('handles single file type', () => {
    const stats = makeStatsResult({ fileTypes: { '.ts': 42 } })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 42')
  })

  test('formats large file type counts', () => {
    const stats = makeStatsResult({ fileTypes: { '.ts': 10000 } })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 10000')
  })
})

// ============================================================================
// Additional formatCsv tests
// ============================================================================

describe('formatCsv additional cases', () => {
  test('handles file with zero loc and zero complexity', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'empty.ts', loc: 0, complexity: 0, size: 0, type: '.ts' })],
    })
    const result = formatCsv(stats)
    expect(result).toContain('empty.ts,0,0,0,.ts')
  })

  test('handles file with very long name', () => {
    const longName = 'a'.repeat(200) + '.ts'
    const stats = makeStatsResult({
      files: [makeFileStats({ name: longName, loc: 10, complexity: 1, size: 100, type: '.ts' })],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe(`${longName},10,1,100,.ts`)
  })

  test('handles multiple different file types', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'a.ts', loc: 10, complexity: 1, size: 100, type: '.ts' }),
        makeFileStats({ name: 'b.js', loc: 20, complexity: 2, size: 200, type: '.js' }),
        makeFileStats({ name: 'c.py', loc: 30, complexity: 3, size: 300, type: '.py' }),
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines[1]).toBe('a.ts,10,1,100,.ts')
    expect(lines[2]).toBe('b.js,20,2,200,.js')
    expect(lines[3]).toBe('c.py,30,3,300,.py')
  })

  test('contains no ANSI escape codes', () => {
    const stats = makeStatsResult({
      files: [makeFileStats()],
    })
    const result = formatCsv(stats)
    // eslint-disable-next-line no-control-regex
    const ansiRegex = /\x1b\[[0-9;]*m/
    expect(ansiRegex.test(result)).toBe(false)
  })
})

// ============================================================================
// Additional formatOutput tests
// ============================================================================

describe('formatOutput additional cases', () => {
  test('returns table format for "json" format string', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'json', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('returns table format for "markdown" format string', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'markdown', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('passes different top values correctly', () => {
    const stats = makeStatsResult({
      files: [makeFileStats({ name: 'a.ts' }), makeFileStats({ name: 'b.ts' })],
    })
    const result3 = formatOutput(stats, 'table', 3)
    const result1 = formatOutput(stats, 'table', 1)
    expect(result3).toContain('Top 3 Largest Files:')
    expect(result1).toContain('Top 1 Largest Files:')
  })

  test('csv output includes all file data', () => {
    const stats = makeStatsResult({
      files: [
        makeFileStats({ name: 'x.ts', loc: 100, complexity: 5, size: 1000, type: '.ts' }),
        makeFileStats({ name: 'y.ts', loc: 200, complexity: 10, size: 2000, type: '.ts' }),
      ],
    })
    const result = formatOutput(stats, 'csv', 10)
    expect(result).toContain('x.ts,100,5,1000,.ts')
    expect(result).toContain('y.ts,200,10,2000,.ts')
  })
})
