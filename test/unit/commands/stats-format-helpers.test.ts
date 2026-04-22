import { describe, expect, test } from 'vitest'
import chalk from 'chalk'

import { formatCsv, formatOutput, formatTable } from '../../../src/commands/stats-format-helpers.js'
import type { StatsResult } from '../../../src/commands/stats-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

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

const makeFile = (name = 'test.ts', loc = 10, complexity = 1, size = 100, type = '.ts') => ({
  blankLines: 0,
  commentLines: 0,
  complexity,
  loc,
  name,
  size,
  structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
  type,
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
      files: [
        {
          blankLines: 5,
          commentLines: 2,
          complexity: 3,
          loc: 50,
          name: 'index.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
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
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'b.js',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.js',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 30,
          name: 'c.ts',
          size: 300,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines).toHaveLength(4)
    expect(lines[1]).toBe('a.ts,10,1,100,.ts')
    expect(lines[2]).toBe('b.js,20,2,200,.js')
    expect(lines[3]).toBe('c.ts,30,5,300,.ts')
  })

  test('handles zero values correctly', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 0,
          loc: 0,
          name: 'empty.ts',
          size: 0,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('empty.ts,0,0,0,.ts')
  })

  test('handles large numbers', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 500,
          loc: 10000,
          name: 'big.ts',
          size: 999999,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('big.ts,10000,500,999999,.ts')
  })

  test('uses comma as delimiter in data rows', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 100,
          name: 'test.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('test.ts,100,2,500,.ts')
  })

  test('uses newline as row separator', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 1,
          name: 'a.ts',
          size: 1,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 2,
          name: 'b.ts',
          size: 2,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('\n')
    expect(result.split('\n')).toHaveLength(3)
  })

  test('preserves file order as provided', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 30,
          name: 'zebra.ts',
          size: 300,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'alpha.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines[1]).toBe('zebra.ts,30,3,300,.ts')
    expect(lines[2]).toBe('alpha.ts,10,1,100,.ts')
  })

  test('handles various file extensions', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'app.py',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.py',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'main.rs',
          size: 80,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.rs',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 30,
          name: 'styles.css',
          size: 120,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.css',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('app.py,10,1,50,.py')
    expect(result).toContain('main.rs,20,2,80,.rs')
    expect(result).toContain('styles.css,30,3,120,.css')
  })

  test('handles files with identical names', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'index.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'index.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('index.ts,10,1,100,.ts')
    expect(lines[2]).toBe('index.ts,20,2,200,.ts')
  })

  test('header columns match data columns count', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 100,
          name: 'test.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    const headerCols = lines[0].split(',').length
    const dataCols = lines[1].split(',').length
    expect(headerCols).toBe(dataCols)
    expect(headerCols).toBe(5)
  })

  test('handles single-character filename', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 1,
          name: 'a',
          size: 1,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('a,1,1,1,')
  })

  test('handles many files efficiently', () => {
    const files = Array.from({ length: 100 }, (_, i) => ({
      blankLines: 0,
      commentLines: 0,
      complexity: i,
      loc: i * 10,
      name: `file${i}.ts`,
      size: i * 100,
      structures: {
        classes: 0,
        enums: 0,
        functions: 0,
        interfaces: 0,
        methods: 0,
        typeAliases: 0,
      },
      type: '.ts',
    }))
    const stats = makeStatsResult({ files })
    const result = formatCsv(stats)
    const lines = result.split('\n')
    expect(lines).toHaveLength(101) // 1 header + 100 data rows
    expect(lines[1]).toBe('file0.ts,0,0,0,.ts')
    expect(lines[100]).toBe('file99.ts,990,99,9900,.ts')
  })

  test('does not include trailing newline', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'test.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result.endsWith('\n')).toBe(false)
  })

  test('does not include summary data in CSV output', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'test.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
      summary: {
        averageComplexity: 5,
        averageLoc: 100,
        blankLines: 50,
        classes: 10,
        commentLines: 30,
        complexity: 100,
        enums: 2,
        files: 20,
        functions: 15,
        interfaces: 5,
        loc: 2000,
        methods: 8,
        typeAliases: 3,
      },
    })
    const result = formatCsv(stats)
    expect(result).not.toContain('Summary')
    expect(result).not.toContain('Total')
    expect(result).not.toContain('Classes')
  })

  test('blankLines and commentLines are not in CSV output', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 99,
          commentLines: 88,
          complexity: 1,
          loc: 10,
          name: 'test.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('test.ts,10,1,100,.ts')
    expect(dataLine).not.toContain('99')
    expect(dataLine).not.toContain('88')
  })

  test('structures data is not reflected in CSV columns', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'rich.ts',
          size: 100,
          structures: {
            classes: 5,
            enums: 3,
            functions: 10,
            interfaces: 2,
            methods: 7,
            typeAliases: 1,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('rich.ts,10,1,100,.ts')
  })

  test('handles file with hyphenated name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'my-component.tsx',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.tsx',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('my-component.tsx,10,1,200,.tsx')
  })

  test('handles file with path separators in name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 50,
          name: 'src/utils/helper.ts',
          size: 400,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('src/utils/helper.ts,50,3,400,.ts')
  })

  test('handles file with multiple dots in name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 4,
          loc: 40,
          name: 'file.test.spec.ts',
          size: 350,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('file.test.spec.ts,40,4,350,.ts')
  })

  test('output always starts with File header', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'test.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result.startsWith('File,')).toBe(true)
  })

  test('handles file with very large size value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'huge.ts',
          size: 2147483647,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('huge.ts,10,1,2147483647,.ts')
  })

  test('handles file with parentheses in name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'utils (copy).ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('utils (copy).ts,20,2,200,.ts')
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

  test('includes lines of code with locale formatting', () => {
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
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 10,
          loc: 500,
          name: 'big.ts',
          size: 5000,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 200,
          name: 'medium.ts',
          size: 2000,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 50,
          name: 'small.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
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
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 100,
          name: 'only.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
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
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 100,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 0)
    expect(result).toContain('Top 0 Largest Files:')
    expect(result).not.toContain('LOC: 100, Complexity: 1')
  })

  test('includes average complexity in output', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, averageComplexity: 7 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total complexity:')
  })

  test('includes average loc in output', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, averageLoc: 42 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Lines of code:')
  })

  test('handles all zero summary values', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    expect(result).toContain('Total files: 0')
    expect(result).toContain('Lines of code: 0')
    expect(result).toContain('Total complexity: 0')
    expect(result).toContain('Blank lines: 0')
    expect(result).toContain('Comment lines: 0')
    expect(result).toContain('Classes: 0')
    expect(result).toContain('Functions: 0')
    expect(result).toContain('Methods: 0')
    expect(result).toContain('Interfaces: 0')
    expect(result).toContain('Type aliases: 0')
    expect(result).toContain('Enums: 0')
  })

  test('formats large locale numbers correctly', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        loc: 1000000,
        complexity: 500000,
        blankLines: 250000,
        commentLines: 750000,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('1,000,000')
    expect(result).toContain('500,000')
    expect(result).toContain('250,000')
    expect(result).toContain('750,000')
  })

  test('handles single file type', () => {
    const stats = makeStatsResult({
      fileTypes: { '.tsx': 42 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.tsx: 42')
  })

  test('handles many file types', () => {
    const stats = makeStatsResult({
      fileTypes: { '.ts': 10, '.js': 8, '.tsx': 6, '.jsx': 4, '.css': 2, '.html': 1 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 10')
    expect(result).toContain('.js: 8')
    expect(result).toContain('.tsx: 6')
    expect(result).toContain('.jsx: 4')
    expect(result).toContain('.css: 2')
    expect(result).toContain('.html: 1')
  })

  test('handles top value larger than files array', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 50,
          name: 'only.ts',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 999)
    expect(result).toContain('Top 999 Largest Files:')
    expect(result).toContain('only.ts')
    expect(result).toContain('LOC: 50, Complexity: 1, Size: 50 bytes')
  })

  test('shows exactly top N files when more available', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'f1.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'f2.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 30,
          name: 'f3.ts',
          size: 300,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 1)
    expect(result).toContain('f1.ts')
    expect(result).not.toContain('f2.ts')
    expect(result).not.toContain('f3.ts')
  })

  test('renders each code structure field individually', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        classes: 100,
        functions: 200,
        methods: 300,
        interfaces: 400,
        typeAliases: 500,
        enums: 600,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Classes: 100')
    expect(result).toContain('Functions: 200')
    expect(result).toContain('Methods: 300')
    expect(result).toContain('Interfaces: 400')
    expect(result).toContain('Type aliases: 500')
    expect(result).toContain('Enums: 600')
  })

  test('file detail includes size with bytes suffix', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 100,
          name: 'myfile.ts',
          size: 2048,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Size: 2048 bytes')
  })

  test('contains section separators as blank lines', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    const emptyLines = result.split('\n').filter((l) => l === '')
    expect(emptyLines.length).toBeGreaterThanOrEqual(2)
  })

  test('file detail line format is correct', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 3,
          commentLines: 4,
          complexity: 7,
          loc: 42,
          name: 'detail.ts',
          size: 1234,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('    LOC: 42, Complexity: 7, Size: 1234 bytes')
    expect(result).toContain('  detail.ts')
  })

  test('handles files with no extension', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'Makefile',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Makefile')
    expect(result).toContain('LOC: 10, Complexity: 1, Size: 500 bytes')
  })

  test('summary shows correct files count from summary not from files array', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
      summary: { ...makeStatsResult().summary, files: 50 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total files: 50')
  })

  test('uses bold chalk for title emoji', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 5)
    expect(result).toContain('📊')
  })

  test('top N header reflects the top parameter', () => {
    const stats = makeStatsResult()
    const result3 = formatTable(stats, 3)
    expect(result3).toContain('Top 3 Largest Files:')
    const result25 = formatTable(stats, 25)
    expect(result25).toContain('Top 25 Largest Files:')
  })

  test('handles file types with unusual extensions', () => {
    const stats = makeStatsResult({
      fileTypes: { '.spec.ts': 5, '.test.js': 3, '.d.ts': 8 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.spec.ts: 5')
    expect(result).toContain('.test.js: 3')
    expect(result).toContain('.d.ts: 8')
  })

  test('complexity values are not locale-formatted in table', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, complexity: 1234 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total complexity: 1,234')
  })

  test('file name line is indented with exactly two spaces', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'indented.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    const lines = result.split('\n')
    const nameLine = lines.find((l) => l.includes('indented.ts'))
    expect(nameLine).toBeDefined()
    expect(nameLine!.startsWith('  indented.ts')).toBe(true)
  })

  test('detail line is indented with exactly four spaces', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 42,
          name: 'detail.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    const lines = result.split('\n')
    const detailLine = lines.find((l) => l.includes('LOC: 42'))
    expect(detailLine).toBeDefined()
    expect(detailLine!.startsWith('    LOC:')).toBe(true)
  })

  test('handles file with parentheses in name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 30,
          name: 'module (backup).ts',
          size: 300,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('module (backup).ts')
    expect(result).toContain('LOC: 30, Complexity: 2, Size: 300 bytes')
  })

  test('handles file with very large size in detail line', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 100,
          name: 'massive.ts',
          size: 2147483647,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Size: 2147483647 bytes')
  })
})

// ============================================================================
// formatOutput
// ============================================================================

describe('formatOutput', () => {
  test('dispatches to formatCsv when format is "csv"', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 50,
          name: 'test.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
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
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 100,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 200,
          name: 'b.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatOutput(stats, 'table', 1)
    expect(result).toContain('Top 1 Largest Files:')
  })

  test('returns CSV format without chalk bold markers', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 100,
          name: 'test.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const csvResult = formatOutput(stats, 'csv', 5)
    const tableResult = formatOutput(stats, 'table', 5)
    expect(tableResult).toContain('📊')
    expect(csvResult).not.toContain('📊')
  })

  test('only "csv" format triggers CSV output (case-sensitive)', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 100,
          name: 'test.ts',
          size: 500,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const csv = formatOutput(stats, 'csv', 5)
    const notCsv = formatOutput(stats, 'CSV', 5)
    expect(csv).not.toBe(notCsv)
  })

  test('json format falls through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'json', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('markdown format falls through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'markdown', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('undefined-like formats fall through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'table', 3)
    expect(result).toBe(formatTable(stats, 3))
  })

  test('Csv (mixed case) falls through to table', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'x.ts',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const mixedResult = formatOutput(stats, 'Csv', 5)
    const tableResult = formatTable(stats, 5)
    expect(mixedResult).toBe(tableResult)
  })

  test('whitespace-only format falls through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, '   ', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('numeric-like string format falls through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, '123', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('format csv ignores top parameter', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'b.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const csvTop0 = formatOutput(stats, 'csv', 0)
    const csvTop99 = formatOutput(stats, 'csv', 99)
    expect(csvTop0).toBe(csvTop99)
  })

  test('passes different top values producing different table output', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: 'b.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result1 = formatOutput(stats, 'table', 1)
    const result2 = formatOutput(stats, 'table', 2)
    expect(result1).toContain('Top 1 Largest Files:')
    expect(result2).toContain('Top 2 Largest Files:')
    expect(result1).not.toBe(result2)
  })

  test('format csv with empty stats produces only header', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'csv', 10)
    expect(result).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  test('table format with empty files still shows summary', () => {
    const stats = makeStatsResult({
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
    })
    const result = formatOutput(stats, 'table', 5)
    expect(result).toContain('Summary:')
    expect(result).toContain('Total files: 0')
    expect(result).toContain('Code structures:')
    expect(result).toContain('File Types:')
  })

  test('uppercase TABLE format falls through to table', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, 'TABLE', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('idempotent - same inputs produce same outputs', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 50,
          name: 'stable.ts',
          size: 400,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result1 = formatOutput(stats, 'csv', 5)
    const result2 = formatOutput(stats, 'csv', 5)
    expect(result1).toBe(result2)
    const table1 = formatOutput(stats, 'table', 3)
    const table2 = formatOutput(stats, 'table', 3)
    expect(table1).toBe(table2)
  })
})

// ============================================================================
// Cross-function consistency
// ============================================================================

describe('cross-function consistency', () => {
  test('formatCsv and formatTable both represent same file data', () => {
    const fileEntry = {
      blankLines: 0,
      commentLines: 0,
      complexity: 10,
      loc: 200,
      name: 'shared.ts',
      size: 3000,
      structures: {
        classes: 0,
        enums: 0,
        functions: 0,
        interfaces: 0,
        methods: 0,
        typeAliases: 0,
      },
      type: '.ts',
    }
    const stats = makeStatsResult({
      files: [fileEntry],
      summary: {
        averageComplexity: 10,
        averageLoc: 200,
        blankLines: 0,
        classes: 0,
        commentLines: 0,
        complexity: 10,
        enums: 0,
        files: 1,
        functions: 0,
        interfaces: 0,
        loc: 200,
        methods: 0,
        typeAliases: 0,
      },
    })
    const csv = formatCsv(stats)
    const table = formatTable(stats, 5)
    expect(csv).toContain('shared.ts')
    expect(table).toContain('shared.ts')
    expect(csv).toContain('200')
    expect(table).toContain('200')
  })

  test('formatOutput with csv and table produce different outputs', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 5,
          loc: 100,
          name: 'diff.ts',
          size: 1000,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const csvResult = formatOutput(stats, 'csv', 5)
    const tableResult = formatOutput(stats, 'table', 5)
    expect(csvResult).not.toBe(tableResult)
    expect(csvResult).toContain('File,LOC')
    expect(tableResult).toContain('Summary:')
  })
})

// ============================================================================
// Edge cases: unicode, special chars, boundary values
// ============================================================================

describe('formatCsv edge cases', () => {
  test('handles unicode filename with CJK characters', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'コード.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('コード.ts,10,1,100,.ts')
  })

  test('handles emoji in filename', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 2,
          loc: 20,
          name: '🎉-party.ts',
          size: 200,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('🎉-party.ts,20,2,200,.ts')
  })

  test('handles spaces in filename', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 30,
          name: 'my file name.ts',
          size: 300,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('my file name.ts,30,3,300,.ts')
  })

  test('handles empty string filename', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 5,
          name: '',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain(',5,1,50,.ts')
  })

  test('handles very long filename', () => {
    const longName = 'a'.repeat(200)
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: longName,
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain(longName)
  })

  test('handles file with dot-prefix (hidden file)', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 5,
          name: '.eslintrc.js',
          size: 42,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.js',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('.eslintrc.js,5,1,42,.js')
  })
})

describe('formatTable edge cases', () => {
  test('handles unicode in file type keys', () => {
    const stats = makeStatsResult({
      fileTypes: { '.ts': 5, '.日本語': 2 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 5')
    expect(result).toContain('.日本語: 2')
  })

  test('handles file type with zero count', () => {
    const stats = makeStatsResult({
      fileTypes: { '.ts': 0 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('.ts: 0')
  })

  test('handles file detail with zero values', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 0,
          loc: 0,
          name: 'zero.ts',
          size: 0,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('zero.ts')
    expect(result).toContain('LOC: 0, Complexity: 0, Size: 0 bytes')
  })

  test('handles deeply nested path in file name', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'src/a/b/c/d/e/f/g/deep.ts',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('src/a/b/c/d/e/f/g/deep.ts')
  })

  test('handles top=1 with multiple files showing only first', () => {
    const makeFile = (name: string, loc: number, complexity: number, size: number) => ({
      blankLines: 0,
      commentLines: 0,
      complexity,
      loc,
      name,
      size,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type: '.ts',
    })
    const stats = makeStatsResult({
      files: [
        makeFile('first.ts', 10, 1, 100),
        makeFile('second.ts', 20, 2, 200),
        makeFile('third.ts', 30, 3, 300),
      ],
    })
    const result = formatTable(stats, 1)
    expect(result).toContain('first.ts')
    expect(result).not.toContain('second.ts')
    expect(result).not.toContain('third.ts')
  })

  test('includes all summary fields for large values', () => {
    const stats = makeStatsResult({
      summary: {
        averageComplexity: 999,
        averageLoc: 8888,
        blankLines: 999999,
        classes: 777,
        commentLines: 666666,
        complexity: 555555,
        enums: 444,
        files: 10000,
        functions: 3333,
        interfaces: 222,
        loc: 2000000,
        methods: 1111,
        typeAliases: 100,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toMatch(/Total files: [\d,]+/)
    expect(result).toMatch(/Lines of code: [\d,]+/)
    expect(result).toContain('Classes: 777')
    expect(result).toContain('Functions: 3333')
    expect(result).toContain('Methods: 1111')
    expect(result).toContain('Enums: 444')
  })
})

describe('formatOutput edge cases', () => {
  test('csv format preserves all files regardless of top value', () => {
    const makeFile = (name: string) => ({
      blankLines: 0,
      commentLines: 0,
      complexity: 1,
      loc: 10,
      name,
      size: 100,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type: '.ts',
    })
    const stats = makeStatsResult({ files: [makeFile('a.ts'), makeFile('b.ts'), makeFile('c.ts')] })
    const result = formatOutput(stats, 'csv', 0)
    expect(result.split('\n')).toHaveLength(4) // header + 3 files
  })

  test('handles special characters in format string gracefully', () => {
    const stats = makeStatsResult()
    const result = formatOutput(stats, '!@#$%', 5)
    expect(result).toBe(formatTable(stats, 5))
  })

  test('format with "csv " (trailing space) falls through to table', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'test.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatOutput(stats, 'csv ', 5)
    expect(result).not.toBe(formatCsv(stats))
    expect(result).toBe(formatTable(stats, 5))
  })

  test('table output contains all expected sections in order', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'a.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
      summary: {
        averageComplexity: 1,
        averageLoc: 10,
        blankLines: 0,
        classes: 1,
        commentLines: 0,
        complexity: 1,
        enums: 0,
        files: 1,
        functions: 2,
        interfaces: 0,
        loc: 10,
        methods: 3,
        typeAliases: 0,
      },
      fileTypes: { '.ts': 1 },
    })
    const result = formatOutput(stats, 'table', 5)
    const summaryIdx = result.indexOf('Summary:')
    const codeStructIdx = result.indexOf('Code structures:')
    const fileTypesIdx = result.indexOf('File Types:')
    const topFilesIdx = result.indexOf('Top 5 Largest Files:')
    expect(summaryIdx).toBeLessThan(codeStructIdx)
    expect(codeStructIdx).toBeLessThan(fileTypesIdx)
    expect(fileTypesIdx).toBeLessThan(topFilesIdx)
  })

  test('csv output is parseable with split by newline and comma', () => {
    const makeFile = (
      name: string,
      loc: number,
      complexity: number,
      size: number,
      type: string,
    ) => ({
      blankLines: 0,
      commentLines: 0,
      complexity,
      loc,
      name,
      size,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type,
    })
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts'), makeFile('b.js', 20, 2, 200, '.js')],
    })
    const result = formatOutput(stats, 'csv', 5)
    const rows = result.split('\n').map((row) => row.split(','))
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(['File', 'LOC', 'Complexity', 'Size (bytes)', 'Type'])
    expect(rows[1]).toEqual(['a.ts', '10', '1', '100', '.ts'])
    expect(rows[2]).toEqual(['b.js', '20', '2', '200', '.js'])
  })
})

// ============================================================================
// Additional coverage: untested branches and edge cases
// ============================================================================

describe('formatTable - average fields not rendered', () => {
  test('averageComplexity is not rendered in table output even when set', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, averageComplexity: 42 },
    })
    const result = formatTable(stats, 5)
    expect(result).not.toContain('Average complexity')
    expect(result).not.toContain('averageComplexity')
  })

  test('averageLoc is not rendered in table output even when set', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, averageLoc: 99 },
    })
    const result = formatTable(stats, 5)
    expect(result).not.toContain('Average loc')
    expect(result).not.toContain('averageLoc')
  })
})

describe('formatTable - negative top values', () => {
  test('top=-1 slices off the last file', () => {
    const makeFile = (name: string, size: number) => ({
      blankLines: 0,
      commentLines: 0,
      complexity: 1,
      loc: 10,
      name,
      size,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type: '.ts',
    })
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 100), makeFile('b.ts', 200), makeFile('c.ts', 300)],
    })
    const result = formatTable(stats, -1)
    expect(result).toContain('Top -1 Largest Files:')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
    expect(result).not.toContain('c.ts')
  })

  test('top=-2 slices off last two files', () => {
    const makeFile = (name: string, size: number) => ({
      blankLines: 0,
      commentLines: 0,
      complexity: 1,
      loc: 10,
      name,
      size,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type: '.ts',
    })
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 100), makeFile('b.ts', 200), makeFile('c.ts', 300)],
    })
    const result = formatTable(stats, -2)
    expect(result).toContain('a.ts')
    expect(result).not.toContain('b.ts')
    expect(result).not.toContain('c.ts')
  })
})

describe('formatCsv - negative numeric values', () => {
  test('handles negative loc value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: -5,
          name: 'neg.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('neg.ts,-5,1,100,.ts')
  })

  test('handles negative complexity value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: -3,
          loc: 10,
          name: 'negc.ts',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('negc.ts,10,-3,50,.ts')
  })

  test('handles negative size value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'negs.ts',
          size: -100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('negs.ts,10,1,-100,.ts')
  })
})

describe('formatTable - file order preservation', () => {
  test('files appear in same order as provided in stats.files array', () => {
    const makeFile = (name: string) => ({
      blankLines: 0,
      commentLines: 0,
      complexity: 1,
      loc: 10,
      name,
      size: 100,
      structures: { classes: 0, enums: 0, functions: 0, interfaces: 0, methods: 0, typeAliases: 0 },
      type: '.ts',
    })
    const stats = makeStatsResult({
      files: [makeFile('z.ts'), makeFile('m.ts'), makeFile('a.ts')],
    })
    const result = formatTable(stats, 10)
    const zIdx = result.indexOf('z.ts')
    const mIdx = result.indexOf('m.ts')
    const aIdx = result.indexOf('a.ts')
    expect(zIdx).toBeLessThan(mIdx)
    expect(mIdx).toBeLessThan(aIdx)
  })
})

describe('formatOutput - "table" exact match behaves same as default', () => {
  test('"table" format produces same output as formatTable directly', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3,
          loc: 50,
          name: 'direct.ts',
          size: 400,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const viaFormatOutput = formatOutput(stats, 'table', 3)
    const viaFormatTable = formatTable(stats, 3)
    expect(viaFormatOutput).toBe(viaFormatTable)
  })
})

// ============================================================================
// Additional coverage: CSV formatting details
// ============================================================================

describe('formatCsv - comma in filename', () => {
  test('file name containing comma is not escaped in output', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'hello,world.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('hello,world.ts')
    const dataLine = result.split('\n')[1]

    expect(dataLine.split(',').length).toBeGreaterThan(5)
  })
})

describe('formatCsv - decimal numeric values', () => {
  test('handles fractional loc value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10.5,
          name: 'frac.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('10.5')
  })

  test('handles fractional complexity value', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 3.7,
          loc: 10,
          name: 'fracc.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('3.7')
  })
})

describe('formatCsv - type field edge cases', () => {
  test('handles long multi-part extension', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'component.spec.tsx',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.spec.tsx',
        },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('.spec.tsx')
  })

  test('handles empty type with name containing no extension', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 5,
          name: 'Dockerfile',
          size: 50,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '',
        },
      ],
    })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('Dockerfile,5,1,50,')
  })
})

// ============================================================================
// Additional coverage: formatTable summary indentation
// ============================================================================

describe('formatTable - summary field indentation', () => {
  test('all summary fields are indented with exactly two spaces', () => {
    const stats = makeStatsResult({
      summary: {
        averageComplexity: 1,
        averageLoc: 10,
        blankLines: 5,
        classes: 2,
        commentLines: 3,
        complexity: 10,
        enums: 1,
        files: 3,
        functions: 4,
        interfaces: 1,
        loc: 100,
        methods: 5,
        typeAliases: 2,
      },
    })
    const result = formatTable(stats, 5)
    const lines = result.split('\n')
    const summaryStart = lines.findIndex((l) => l.includes('Summary:'))

    const summaryFields = lines.slice(summaryStart + 1, summaryStart + 6)
    for (const field of summaryFields) {
      expect(field.startsWith('  ')).toBe(true)
    }
  })

  test('code structure fields are indented with exactly two spaces', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        classes: 1,
        functions: 2,
        methods: 3,
        interfaces: 4,
        typeAliases: 5,
        enums: 6,
      },
    })
    const result = formatTable(stats, 5)
    const lines = result.split('\n')
    const codeStart = lines.findIndex((l) => l.includes('Code structures:'))
    const fields = lines.slice(codeStart + 1, codeStart + 7)
    for (const field of fields) {
      expect(field.startsWith('  ')).toBe(true)
    }
  })
})

// ============================================================================
// Additional coverage: formatTable with negative summary values
// ============================================================================

describe('formatTable - negative summary values', () => {
  test('renders negative complexity in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, complexity: -5 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total complexity: -5')
  })

  test('renders negative loc in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, loc: -100 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Lines of code: -100')
  })

  test('renders negative blankLines in summary', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, blankLines: -10 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Blank lines: -10')
  })
})

// ============================================================================
// Additional coverage: formatTable file detail excludes certain fields
// ============================================================================

describe('formatTable - file detail field exclusions', () => {
  test('file detail does not show blankLines count', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 42,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'blanks.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    const detailLine = result.split('\n').find((l) => l.includes('LOC: 10'))
    expect(detailLine).toBeDefined()
    expect(detailLine).not.toContain('Blank')
  })

  test('file detail does not show commentLines count', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 99,
          complexity: 1,
          loc: 10,
          name: 'comments.ts',
          size: 100,
          structures: {
            classes: 0,
            enums: 0,
            functions: 0,
            interfaces: 0,
            methods: 0,
            typeAliases: 0,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    const detailLine = result.split('\n').find((l) => l.includes('LOC: 10'))
    expect(detailLine).toBeDefined()
    expect(detailLine).not.toContain('Comment')
  })

  test('file detail does not show structures data', () => {
    const stats = makeStatsResult({
      files: [
        {
          blankLines: 0,
          commentLines: 0,
          complexity: 1,
          loc: 10,
          name: 'struct.ts',
          size: 100,
          structures: {
            classes: 5,
            enums: 3,
            functions: 10,
            interfaces: 2,
            methods: 7,
            typeAliases: 1,
          },
          type: '.ts',
        },
      ],
    })
    const result = formatTable(stats, 5)
    const detailLine = result.split('\n').find((l) => l.includes('LOC: 10'))
    expect(detailLine).toBeDefined()
    expect(detailLine).not.toContain('classes')
    expect(detailLine).not.toContain('functions')
  })
})

// ============================================================================
// Additional coverage: formatOutput with various format strings
// ============================================================================

describe('formatOutput - additional format strings', () => {
  test('"Csv" (capitalized) falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'Csv', 5)).toBe(formatTable(stats, 5))
  })

  test('"cSv" (mixed case) falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'cSv', 5)).toBe(formatTable(stats, 5))
  })

  test('"xml" format falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'xml', 5)).toBe(formatTable(stats, 5))
  })

  test('"html" format falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'html', 5)).toBe(formatTable(stats, 5))
  })
})

// ============================================================================
// Additional coverage: formatTable empty files with various top values
// ============================================================================

describe('formatTable - empty files array with edge top values', () => {
  test('empty files with top=0 shows Top 0 header but no file details', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 0)
    expect(result).toContain('Top 0 Largest Files:')

    const lines = result.split('\n')
    const topIdx = lines.findIndex((l) => l.includes('Top 0 Largest Files:'))
    const remaining = lines.slice(topIdx + 1)
    expect(remaining.every((l) => l === '' || l.trim() === '')).toBe(true)
  })

  test('empty files with large top value shows header but no file details', () => {
    const stats = makeStatsResult()
    const result = formatTable(stats, 100)
    expect(result).toContain('Top 100 Largest Files:')
    expect(result).not.toContain('LOC:')
    expect(result).not.toContain('bytes')
  })
})

// ============================================================================
// NEW TESTS: formatCsv additional coverage
// ============================================================================

describe('formatCsv - special character filenames', () => {
  test('handles file with @ symbol in name', () => {
    const stats = makeStatsResult({ files: [makeFile('email@scope.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('email@scope.ts,10,1,100,.ts')
  })

  test('handles file with # symbol in name', () => {
    const stats = makeStatsResult({ files: [makeFile('chapter#1.md', 20, 2, 200, '.md')] })
    expect(formatCsv(stats)).toContain('chapter#1.md,20,2,200,.md')
  })

  test('handles file with [] brackets in name', () => {
    const stats = makeStatsResult({ files: [makeFile('array[0].ts', 5, 1, 50, '.ts')] })
    expect(formatCsv(stats)).toContain('array[0].ts,5,1,50,.ts')
  })

  test('handles file with & symbol in name', () => {
    const stats = makeStatsResult({ files: [makeFile('rock&roll.ts', 15, 3, 150, '.ts')] })
    expect(formatCsv(stats)).toContain('rock&roll.ts,15,3,150,.ts')
  })

  test('handles file with % symbol in name', () => {
    const stats = makeStatsResult({ files: [makeFile('100%.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('100%.ts,10,1,100,.ts')
  })

  test('handles file with semicolon in name', () => {
    const stats = makeStatsResult({ files: [makeFile('a;b.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('a;b.ts')
  })

  test('handles file with = sign in name', () => {
    const stats = makeStatsResult({ files: [makeFile('key=val.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('key=val.ts,10,1,100,.ts')
  })

  test('handles file with + sign in name', () => {
    const stats = makeStatsResult({ files: [makeFile('c++.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('c++.ts,10,1,100,.ts')
  })

  test('handles file with exclamation mark in name', () => {
    const stats = makeStatsResult({ files: [makeFile('wow!.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('wow!.ts,10,1,100,.ts')
  })

  test('handles file with curly braces in name', () => {
    const stats = makeStatsResult({ files: [makeFile('{template}.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('{template}.ts,10,1,100,.ts')
  })

  test('handles file with Russian characters in name', () => {
    const stats = makeStatsResult({ files: [makeFile('модуль.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('модуль.ts,10,1,100,.ts')
  })

  test('handles file with Arabic characters in name', () => {
    const stats = makeStatsResult({ files: [makeFile('كود.ts', 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('كود.ts,10,1,100,.ts')
  })

  test('handles file with apostrophe in name', () => {
    const stats = makeStatsResult({ files: [makeFile("don't.ts", 10, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain("don't.ts,10,1,100,.ts")
  })
})

describe('formatCsv - numeric edge cases', () => {
  test('handles loc value of 1', () => {
    const stats = makeStatsResult({ files: [makeFile('one.ts', 1, 1, 1, '.ts')] })
    expect(formatCsv(stats)).toContain('one.ts,1,1,1,.ts')
  })

  test('handles fractional size value', () => {
    const stats = makeStatsResult({
      files: [{ ...makeFile('frac.ts', 10, 1, 99.9, '.ts') }],
    })
    expect(formatCsv(stats)).toContain('99.9')
  })

  test('handles mixed positive and negative values in different files', () => {
    const stats = makeStatsResult({
      files: [
        { ...makeFile('pos.ts', 10, 5, 100, '.ts') },
        { ...makeFile('neg.ts', -5, -2, -50, '.ts') },
      ],
    })
    const result = formatCsv(stats)
    expect(result).toContain('pos.ts,10,5,100,.ts')
    expect(result).toContain('neg.ts,-5,-2,-50,.ts')
  })

  test('handles very large loc value', () => {
    const stats = makeStatsResult({ files: [makeFile('big.ts', 9999999, 1, 100, '.ts')] })
    expect(formatCsv(stats)).toContain('big.ts,9999999,1,100,.ts')
  })

  test('handles complexity of 0 with non-zero other fields', () => {
    const stats = makeStatsResult({ files: [makeFile('zero.ts', 500, 0, 5000, '.ts')] })
    const dataLine = formatCsv(stats).split('\n')[1]
    expect(dataLine).toBe('zero.ts,500,0,5000,.ts')
  })
})

describe('formatCsv - header validation', () => {
  test('header has exactly 5 comma-separated columns', () => {
    const stats = makeStatsResult()
    const header = formatCsv(stats)
    expect(header.split(',')).toHaveLength(5)
  })

  test('header columns are in exact order File LOC Complexity Size Type', () => {
    const stats = makeStatsResult()
    const header = formatCsv(stats)
    expect(header).toBe('File,LOC,Complexity,Size (bytes),Type')
  })

  test('data row columns align with header columns', () => {
    const stats = makeStatsResult({ files: [makeFile('align.ts', 42, 7, 999, '.ts')] })
    const lines = formatCsv(stats).split('\n')
    expect(lines[1]).toBe('align.ts,42,7,999,.ts')
    expect(lines[0].split(',').length).toBe(lines[1].split(',').length)
  })
})

describe('formatCsv - type field variations', () => {
  test('handles .jsx extension', () => {
    const stats = makeStatsResult({ files: [makeFile('app.jsx', 10, 1, 100, '.jsx')] })
    expect(formatCsv(stats)).toContain('app.jsx,10,1,100,.jsx')
  })

  test('handles .mjs extension', () => {
    const stats = makeStatsResult({ files: [makeFile('module.mjs', 10, 1, 100, '.mjs')] })
    expect(formatCsv(stats)).toContain('module.mjs,10,1,100,.mjs')
  })

  test('handles .cjs extension', () => {
    const stats = makeStatsResult({ files: [makeFile('common.cjs', 10, 1, 100, '.cjs')] })
    expect(formatCsv(stats)).toContain('common.cjs,10,1,100,.cjs')
  })

  test('handles type that differs from name extension', () => {
    const stats = makeStatsResult({ files: [makeFile('renamed.ts', 10, 1, 100, '.js')] })
    const dataLine = formatCsv(stats).split('\n')[1]
    expect(dataLine).toBe('renamed.ts,10,1,100,.js')
  })
})

describe('formatCsv - multi-file scenarios', () => {
  test('handles 200 files correctly', () => {
    const files = Array.from({ length: 200 }, (_, i) => makeFile(`f${i}.ts`, i, i, i * 10, '.ts'))
    const stats = makeStatsResult({ files })
    const lines = formatCsv(stats).split('\n')
    expect(lines).toHaveLength(201)
    expect(lines[1]).toBe('f0.ts,0,0,0,.ts')
    expect(lines[200]).toBe('f199.ts,199,199,1990,.ts')
  })

  test('output is deterministic across multiple calls', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts'), makeFile('b.ts', 20, 2, 200, '.ts')],
    })
    const r1 = formatCsv(stats)
    const r2 = formatCsv(stats)
    const r3 = formatCsv(stats)
    expect(r1).toBe(r2)
    expect(r2).toBe(r3)
  })

  test('files with identical metrics are all included', () => {
    const files = [makeFile('dup1.ts', 10, 1, 100, '.ts'), makeFile('dup2.ts', 10, 1, 100, '.ts')]
    const stats = makeStatsResult({ files })
    const lines = formatCsv(stats).split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toBe('dup1.ts,10,1,100,.ts')
    expect(lines[2]).toBe('dup2.ts,10,1,100,.ts')
  })
})

describe('formatCsv - ignores unrelated stats fields', () => {
  test('ignores fileTypes data', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts')],
      fileTypes: { '.ts': 999 },
    })
    const result = formatCsv(stats)
    expect(result).not.toContain('999')
    expect(result).not.toContain('File Types')
  })

  test('ignores summary.averageComplexity', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts')],
      summary: { ...makeStatsResult().summary, averageComplexity: 42 },
    })
    expect(formatCsv(stats)).not.toContain('42')
  })

  test('ignores summary.averageLoc', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts')],
      summary: { ...makeStatsResult().summary, averageLoc: 77 },
    })
    expect(formatCsv(stats)).not.toContain('77')
  })

  test('ignores file structures data in CSV columns', () => {
    const stats = makeStatsResult({
      files: [
        {
          ...makeFile('struct.ts', 10, 1, 100, '.ts'),
          structures: {
            classes: 50,
            enums: 30,
            functions: 99,
            interfaces: 88,
            methods: 77,
            typeAliases: 66,
          },
        },
      ],
    })
    const dataLine = formatCsv(stats).split('\n')[1]
    expect(dataLine).toBe('struct.ts,10,1,100,.ts')
  })
})

// ============================================================================
// NEW TESTS: formatTable additional coverage
// ============================================================================

describe('formatTable - locale formatting details', () => {
  test('formats loc 999 as 999 without comma', () => {
    const stats = makeStatsResult({ summary: { ...makeStatsResult().summary, loc: 999 } })
    expect(formatTable(stats, 5)).toContain('Lines of code: 999')
  })

  test('formats loc 1000 as 1,000 with comma', () => {
    const stats = makeStatsResult({ summary: { ...makeStatsResult().summary, loc: 1000 } })
    expect(formatTable(stats, 5)).toContain('Lines of code: 1,000')
  })

  test('formats complexity 9999 as 9,999', () => {
    const stats = makeStatsResult({ summary: { ...makeStatsResult().summary, complexity: 9999 } })
    expect(formatTable(stats, 5)).toContain('Total complexity: 9,999')
  })

  test('formats blankLines 10000 as 10,000', () => {
    const stats = makeStatsResult({ summary: { ...makeStatsResult().summary, blankLines: 10000 } })
    expect(formatTable(stats, 5)).toContain('Blank lines: 10,000')
  })

  test('formats commentLines 100000 as 100,000', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, commentLines: 100000 },
    })
    expect(formatTable(stats, 5)).toContain('Comment lines: 100,000')
  })

  test('code structure values are not locale-formatted', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, classes: 1234, functions: 5678 },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Classes: 1234')
    expect(result).toContain('Functions: 5678')
  })
})

describe('formatTable - section labels', () => {
  test('Summary label appears exactly once', () => {
    const result = formatTable(makeStatsResult(), 5)
    const matches = result.match(/Summary:/g)
    expect(matches).toHaveLength(1)
  })

  test('Code structures label appears exactly once', () => {
    const result = formatTable(makeStatsResult(), 5)
    const matches = result.match(/Code structures:/g)
    expect(matches).toHaveLength(1)
  })

  test('File Types label appears exactly once', () => {
    const result = formatTable(makeStatsResult(), 5)
    const matches = result.match(/File Types:/g)
    expect(matches).toHaveLength(1)
  })

  test('title contains Codebase Statistics text', () => {
    const result = formatTable(makeStatsResult(), 5)
    expect(result).toContain('Codebase Statistics')
  })
})

describe('formatTable - file detail formatting', () => {
  test('shows LOC, Complexity, and Size in exact format', () => {
    const stats = makeStatsResult({ files: [makeFile('fmt.ts', 42, 7, 2048, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('LOC: 42, Complexity: 7, Size: 2048 bytes')
  })

  test('shows size of 1 byte with singular form', () => {
    const stats = makeStatsResult({ files: [makeFile('tiny.ts', 1, 1, 1, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('Size: 1 bytes')
  })

  test('shows size of 0 bytes', () => {
    const stats = makeStatsResult({ files: [makeFile('empty.ts', 0, 0, 0, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('LOC: 0, Complexity: 0, Size: 0 bytes')
  })

  test('shows triple-digit complexity correctly', () => {
    const stats = makeStatsResult({ files: [makeFile('complex.ts', 100, 999, 5000, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('Complexity: 999')
  })

  test('file name and detail are on separate lines', () => {
    const stats = makeStatsResult({ files: [makeFile('sep.ts', 10, 1, 100, '.ts')] })
    const result = formatTable(stats, 5)
    const lines = result.split('\n')
    const nameIdx = lines.findIndex((l) => l.trim() === 'sep.ts')
    const detailIdx = lines.findIndex((l) => l.includes('LOC: 10'))
    expect(nameIdx).toBeLessThan(detailIdx)
    expect(detailIdx - nameIdx).toBe(1)
  })
})

describe('formatTable - fileTypes display order', () => {
  test('renders file types in Object.entries order', () => {
    const stats = makeStatsResult({ fileTypes: { '.py': 5, '.ts': 10, '.js': 3 } })
    const result = formatTable(stats, 5)
    const pyIdx = result.indexOf('.py: 5')
    const tsIdx = result.indexOf('.ts: 10')
    const jsIdx = result.indexOf('.js: 3')
    expect(pyIdx).toBeLessThan(tsIdx)
    expect(tsIdx).toBeLessThan(jsIdx)
  })

  test('renders single file type correctly', () => {
    const stats = makeStatsResult({ fileTypes: { '.vue': 7 } })
    expect(formatTable(stats, 5)).toContain('.vue: 7')
  })

  test('renders file type count of 1', () => {
    const stats = makeStatsResult({ fileTypes: { '.rs': 1 } })
    expect(formatTable(stats, 5)).toContain('.rs: 1')
  })

  test('renders file type with large count', () => {
    const stats = makeStatsResult({ fileTypes: { '.ts': 50000 } })
    expect(formatTable(stats, 5)).toContain('.ts: 50000')
  })

  test('renders file type with empty string key', () => {
    const stats = makeStatsResult({ fileTypes: { '': 3 } })
    expect(formatTable(stats, 5)).toContain(': 3')
  })
})

describe('formatTable - top parameter edge cases', () => {
  test('top=0.5 shows zero files (truncates)', () => {
    const stats = makeStatsResult({ files: [makeFile('a.ts', 10, 1, 100, '.ts')] })
    const result = formatTable(stats, 0.5)
    expect(result).toContain('Top 0.5 Largest Files:')
    expect(result).not.toContain('LOC: 10')
  })

  test('top=1 shows exactly one file', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts'), makeFile('b.ts', 20, 2, 200, '.ts')],
    })
    const result = formatTable(stats, 1)
    expect(result).toContain('a.ts')
    expect(result).not.toContain('b.ts')
  })

  test('top equals exact number of files shows all', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts'), makeFile('b.ts', 20, 2, 200, '.ts')],
    })
    const result = formatTable(stats, 2)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })

  test('top larger than file count shows all available', () => {
    const stats = makeStatsResult({ files: [makeFile('only.ts', 10, 1, 100, '.ts')] })
    const result = formatTable(stats, 50)
    expect(result).toContain('only.ts')
    expect(result).toContain('LOC: 10')
  })
})

describe('formatTable - summary with extreme values', () => {
  test('handles files count at Number.MAX_SAFE_INTEGER', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, files: Number.MAX_SAFE_INTEGER },
    })
    expect(formatTable(stats, 5)).toContain(`Total files: ${Number.MAX_SAFE_INTEGER}`)
  })

  test('handles negative files count', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, files: -5 },
    })
    expect(formatTable(stats, 5)).toContain('Total files: -5')
  })

  test('handles negative classes count', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, classes: -10 },
    })
    expect(formatTable(stats, 5)).toContain('Classes: -10')
  })

  test('handles negative functions count', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, functions: -20 },
    })
    expect(formatTable(stats, 5)).toContain('Functions: -20')
  })

  test('handles negative enums count', () => {
    const stats = makeStatsResult({
      summary: { ...makeStatsResult().summary, enums: -3 },
    })
    expect(formatTable(stats, 5)).toContain('Enums: -3')
  })
})

describe('formatTable - file detail exclusions', () => {
  test('file detail does not include type field', () => {
    const stats = makeStatsResult({ files: [makeFile('typed.ts', 10, 1, 100, '.ts')] })
    const detailLine = formatTable(stats, 5)
      .split('\n')
      .find((l) => l.includes('LOC:'))
    expect(detailLine).toBeDefined()
    expect(detailLine).not.toContain('.ts')
  })

  test('file name line does not include LOC', () => {
    const stats = makeStatsResult({ files: [makeFile('name.ts', 42, 7, 100, '.ts')] })
    const lines = formatTable(stats, 5).split('\n')
    const nameLine = lines.find((l) => l.includes('name.ts') && !l.includes('LOC'))
    expect(nameLine).toBeDefined()
  })
})

describe('formatTable - output structure', () => {
  test('output starts with bold title', () => {
    const result = formatTable(makeStatsResult(), 5)
    expect(result.startsWith(chalk.bold('\n📊 Codebase Statistics\n'))).toBe(true)
  })

  test('has blank lines between sections', () => {
    const result = formatTable(makeStatsResult(), 5)
    const lines = result.split('\n')
    const emptyLines = lines.filter((l) => l === '')
    expect(emptyLines.length).toBeGreaterThanOrEqual(3)
  })

  test('output is deterministic across multiple calls', () => {
    const stats = makeStatsResult({
      files: [makeFile('a.ts', 10, 1, 100, '.ts')],
      fileTypes: { '.ts': 1 },
    })
    const r1 = formatTable(stats, 5)
    const r2 = formatTable(stats, 5)
    expect(r1).toBe(r2)
  })
})

// ============================================================================
// NEW TESTS: formatOutput additional coverage
// ============================================================================

describe('formatOutput - format string variations', () => {
  test('"TABLE" (uppercase) falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'TABLE', 5)).toBe(formatTable(stats, 5))
  })

  test('"tAbLe" (mixed case) falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'tAbLe', 5)).toBe(formatTable(stats, 5))
  })

  test('"text" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'text', 5)).toBe(formatTable(stats, 5))
  })

  test('"plain" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'plain', 5)).toBe(formatTable(stats, 5))
  })

  test('"yaml" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'yaml', 5)).toBe(formatTable(stats, 5))
  })

  test('"toml" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'toml', 5)).toBe(formatTable(stats, 5))
  })

  test('" csv" (leading space) falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, ' csv', 5)).toBe(formatTable(stats, 5))
  })

  test('format "csv" with trailing tab falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'csv\t', 5)).toBe(formatTable(stats, 5))
  })

  test('format with only "c" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'c', 5)).toBe(formatTable(stats, 5))
  })

  test('format "cs" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'cs', 5)).toBe(formatTable(stats, 5))
  })

  test('format "cv" falls through to table', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'cv', 5)).toBe(formatTable(stats, 5))
  })
})

describe('formatOutput - csv dispatch specifics', () => {
  test('csv output starts with File header', () => {
    const stats = makeStatsResult({ files: [makeFile('a.ts', 10, 1, 100, '.ts')] })
    expect(formatOutput(stats, 'csv', 5).startsWith('File,')).toBe(true)
  })

  test('csv output does not contain emoji', () => {
    const stats = makeStatsResult({ files: [makeFile('a.ts', 10, 1, 100, '.ts')] })
    expect(formatOutput(stats, 'csv', 5)).not.toContain('📊')
  })

  test('csv ignores negative top value', () => {
    const stats = makeStatsResult({ files: [makeFile('a.ts', 10, 1, 100, '.ts')] })
    const r1 = formatOutput(stats, 'csv', -1)
    const r2 = formatOutput(stats, 'csv', 5)
    expect(r1).toBe(r2)
  })

  test('csv output is identical to direct formatCsv call', () => {
    const stats = makeStatsResult({ files: [makeFile('x.ts', 42, 7, 999, '.ts')] })
    expect(formatOutput(stats, 'csv', 5)).toBe(formatCsv(stats))
  })

  test('csv with empty files produces only header', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'csv', 5)).toBe('File,LOC,Complexity,Size (bytes),Type')
  })
})

describe('formatOutput - table dispatch specifics', () => {
  test('table output contains 📊 emoji', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'table', 5)).toContain('📊')
  })

  test('table output contains Summary section', () => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, 'table', 5)).toContain('Summary:')
  })

  test('table with top=1 and single file shows that file', () => {
    const stats = makeStatsResult({ files: [makeFile('solo.ts', 10, 1, 100, '.ts')] })
    const result = formatOutput(stats, 'table', 1)
    expect(result).toContain('solo.ts')
    expect(result).toContain('LOC: 10')
  })

  test('table output is identical to direct formatTable call', () => {
    const stats = makeStatsResult({ files: [makeFile('y.ts', 55, 3, 777, '.ts')] })
    expect(formatOutput(stats, 'table', 3)).toBe(formatTable(stats, 3))
  })

  test('output differs between csv and table formats', () => {
    const stats = makeStatsResult({ files: [makeFile('z.ts', 10, 1, 100, '.ts')] })
    expect(formatOutput(stats, 'csv', 5)).not.toBe(formatOutput(stats, 'table', 5))
  })
})

describe('formatOutput - idempotency', () => {
  test('same inputs always produce same csv output', () => {
    const stats = makeStatsResult({ files: [makeFile('idem.ts', 10, 1, 100, '.ts')] })
    const results = Array.from({ length: 5 }, () => formatOutput(stats, 'csv', 5))
    expect(new Set(results).size).toBe(1)
  })

  test('same inputs always produce same table output', () => {
    const stats = makeStatsResult({ files: [makeFile('idem.ts', 10, 1, 100, '.ts')] })
    const results = Array.from({ length: 5 }, () => formatOutput(stats, 'table', 5))
    expect(new Set(results).size).toBe(1)
  })
})

// ============================================================================
// NEW TESTS: cross-function consistency expanded
// ============================================================================

describe('cross-function consistency expanded', () => {
  test('both formatCsv and formatTable reference same filename', () => {
    const stats = makeStatsResult({
      files: [makeFile('shared-name.ts', 100, 10, 1000, '.ts')],
      summary: {
        averageComplexity: 10,
        averageLoc: 100,
        blankLines: 0,
        classes: 0,
        commentLines: 0,
        complexity: 10,
        enums: 0,
        files: 1,
        functions: 0,
        interfaces: 0,
        loc: 100,
        methods: 0,
        typeAliases: 0,
      },
    })
    const csv = formatCsv(stats)
    const table = formatTable(stats, 5)
    expect(csv).toContain('shared-name.ts')
    expect(table).toContain('shared-name.ts')
  })

  test('both formats handle empty stats without error', () => {
    const stats = makeStatsResult()
    expect(() => formatCsv(stats)).not.toThrow()
    expect(() => formatTable(stats, 5)).not.toThrow()
    expect(() => formatOutput(stats, 'csv', 5)).not.toThrow()
    expect(() => formatOutput(stats, 'table', 5)).not.toThrow()
  })

  test('formatOutput delegates correctly for all three paths', () => {
    const stats = makeStatsResult({ files: [makeFile('delegate.ts', 10, 1, 100, '.ts')] })
    const csvDirect = formatCsv(stats)
    const tableDirect = formatTable(stats, 5)
    const csvVia = formatOutput(stats, 'csv', 5)
    const tableVia = formatOutput(stats, 'table', 5)
    const defaultVia = formatOutput(stats, 'default', 5)
    expect(csvVia).toBe(csvDirect)
    expect(tableVia).toBe(tableDirect)
    expect(defaultVia).toBe(tableDirect)
  })

  test('csv and table produce different string lengths for same data', () => {
    const stats = makeStatsResult({
      files: [makeFile('len.ts', 10, 1, 100, '.ts')],
      summary: {
        ...makeStatsResult().summary,
        files: 1,
        loc: 10,
        complexity: 1,
      },
    })
    const csvLen = formatCsv(stats).length
    const tableLen = formatTable(stats, 5).length
    expect(tableLen).toBeGreaterThan(csvLen)
  })
})

// ============================================================================
// NEW TESTS: formatTable with specific file configurations
// ============================================================================

describe('formatTable - file configurations', () => {
  test('handles files with all same LOC values', () => {
    const stats = makeStatsResult({
      files: [
        makeFile('a.ts', 100, 1, 100, '.ts'),
        makeFile('b.ts', 100, 2, 200, '.ts'),
        makeFile('c.ts', 100, 3, 300, '.ts'),
      ],
    })
    const result = formatTable(stats, 10)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
    expect(result).toContain('c.ts')
  })

  test('handles single file with large metrics', () => {
    const stats = makeStatsResult({
      files: [makeFile('big.ts', 100000, 5000, 9999999, '.ts')],
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('LOC: 100000, Complexity: 5000, Size: 9999999 bytes')
  })

  test('handles file named with only numbers', () => {
    const stats = makeStatsResult({ files: [makeFile('12345.ts', 10, 1, 100, '.ts')] })
    expect(formatTable(stats, 5)).toContain('12345.ts')
  })

  test('handles file with underscore prefix', () => {
    const stats = makeStatsResult({ files: [makeFile('_private.ts', 10, 1, 100, '.ts')] })
    expect(formatTable(stats, 5)).toContain('_private.ts')
  })

  test('handles file with double extension', () => {
    const stats = makeStatsResult({ files: [makeFile('test.spec.ts', 10, 1, 100, '.ts')] })
    expect(formatTable(stats, 5)).toContain('test.spec.ts')
  })
})

// ============================================================================
// NEW TESTS: formatCsv and formatTable with whitespace names
// ============================================================================

describe('formatCsv - whitespace edge cases', () => {
  test('handles file with only spaces as name', () => {
    const stats = makeStatsResult({ files: [makeFile('   ', 10, 1, 100, '.ts')] })
    const result = formatCsv(stats)
    const dataLine = result.split('\n')[1]
    expect(dataLine).toBe('   ,10,1,100,.ts')
  })

  test('handles file with tab in name', () => {
    const stats = makeStatsResult({ files: [makeFile('tab\there.ts', 10, 1, 100, '.ts')] })
    const result = formatCsv(stats)
    expect(result).toContain('tab\there.ts')
  })
})

describe('formatTable - whitespace file names', () => {
  test('handles file with leading spaces in name', () => {
    const stats = makeStatsResult({ files: [makeFile('  leading.ts', 10, 1, 100, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('  leading.ts')
  })

  test('handles file with trailing spaces in name', () => {
    const stats = makeStatsResult({ files: [makeFile('trailing  .ts', 10, 1, 100, '.ts')] })
    const result = formatTable(stats, 5)
    expect(result).toContain('trailing  .ts')
  })
})

// ============================================================================
// NEW TESTS: formatOutput with comprehensive format coverage
// ============================================================================

describe('formatOutput - exhaustive non-csv format strings', () => {
  const nonCsvFormats = [
    'CSV',
    'Csv',
    'cSv',
    'csV',
    'cSv',
    'CsV',
    'CSv',
    'cSV',
    'table',
    'TABLE',
    'json',
    'JSON',
    'markdown',
    'html',
    'xml',
    'yaml',
    'toml',
    'text',
    'plain',
    'raw',
    'txt',
    '',
    ' ',
    '  ',
    '\t',
    '\n',
    '0',
    '1',
    'true',
    'false',
    'null',
    'undefined',
  ]

  test.each(nonCsvFormats)('format "%s" falls through to table', (fmt) => {
    const stats = makeStatsResult()
    expect(formatOutput(stats, fmt, 5)).toBe(formatTable(stats, 5))
  })
})

// ============================================================================
// NEW TESTS: formatTable summary field completeness
// ============================================================================

describe('formatTable - all summary fields rendered', () => {
  test('renders files, loc, complexity, blankLines, commentLines in summary', () => {
    const stats = makeStatsResult({
      summary: {
        averageComplexity: 0,
        averageLoc: 0,
        blankLines: 1,
        classes: 0,
        commentLines: 2,
        complexity: 3,
        enums: 0,
        files: 4,
        functions: 0,
        interfaces: 0,
        loc: 5,
        methods: 0,
        typeAliases: 0,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Total files: 4')
    expect(result).toContain('Lines of code: 5')
    expect(result).toContain('Total complexity: 3')
    expect(result).toContain('Blank lines: 1')
    expect(result).toContain('Comment lines: 2')
  })

  test('renders classes, functions, methods, interfaces, typeAliases, enums in structures', () => {
    const stats = makeStatsResult({
      summary: {
        ...makeStatsResult().summary,
        classes: 11,
        functions: 22,
        methods: 33,
        interfaces: 44,
        typeAliases: 55,
        enums: 66,
      },
    })
    const result = formatTable(stats, 5)
    expect(result).toContain('Classes: 11')
    expect(result).toContain('Functions: 22')
    expect(result).toContain('Methods: 33')
    expect(result).toContain('Interfaces: 44')
    expect(result).toContain('Type aliases: 55')
    expect(result).toContain('Enums: 66')
  })
})
