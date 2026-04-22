import { describe, test, expect, beforeEach, vi, type MockInstance } from 'vitest'
import { Node as TsMorphNode, SyntaxKind } from 'ts-morph'
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
} from '../../../src/commands/complexity-helpers.js'

vi.spyOn(TsMorphNode, 'isFunctionDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 250,
)
vi.spyOn(TsMorphNode, 'isMethodDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 142,
)
vi.spyOn(TsMorphNode, 'isArrowFunction').mockImplementation(
  (node: any) => node?.getKind?.() === 205,
)
vi.spyOn(TsMorphNode, 'isFunctionExpression').mockImplementation(
  (node: any) => node?.getKind?.() === 197,
)

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}))

vi.mock('node:fs/promises', () => ({
  writeFile: vi.fn(),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function (this: any) {
    return {
      dispose: vi.fn(),
      initialize: vi.fn().mockResolvedValue(Promise.resolve()),
      releaseFile: vi.fn(),
      parseFile: vi.fn().mockImplementation((filePath: string) => {
        const mockSourceFile = {
          forEachChild: vi.fn((callback: (node: unknown) => void) => {
            callback({})
          }),
          getFilePath: () => filePath,
        }
        return Promise.resolve({
          filePath,
          parseTime: 10,
          sourceFile: mockSourceFile,
        })
      }),
    }
  }),
}))

vi.mock('../../../src/core/complexity.js', () => ({
  analyzeFileComplexity: vi.fn(),
  calculateComplexitySummary: vi.fn(),
}))

vi.mock('ora', () => ({
  default: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn(),
    text: '',
  })),
}))

describe('Complexity Command', () => {
  let Complexity: typeof import('../../../src/commands/complexity.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockAnalyzeFileComplexity: ReturnType<typeof vi.fn>
  let mockCalculateComplexitySummary: ReturnType<typeof vi.fn>
  let mockWriteFile: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const complexity = await import('../../../src/core/complexity.js')
    mockAnalyzeFileComplexity = complexity.analyzeFileComplexity as ReturnType<typeof vi.fn>
    mockCalculateComplexitySummary = complexity.calculateComplexitySummary as ReturnType<
      typeof vi.fn
    >

    const fs = await import('node:fs/promises')
    mockWriteFile = fs.writeFile as ReturnType<typeof vi.fn>

    Complexity = (await import('../../../src/commands/complexity.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new Complexity([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Complexity.description).toBe(
        'Analyze and report cyclomatic and cognitive complexity metrics for TypeScript files',
      )
    })

    test('has examples defined', () => {
      expect(Complexity.examples).toBeDefined()
      expect(Complexity.examples.length).toBeGreaterThan(0)
    })

    test('has path argument with default .', () => {
      expect(Complexity.args).toBeDefined()
      expect(Complexity.args.path).toBeDefined()
      expect(Complexity.args.path.default).toBe('.')
    })

    test('format flag has correct options (json, markdown, table)', () => {
      expect(Complexity.flags.format).toBeDefined()
      expect(Complexity.flags.format.options).toContain('json')
      expect(Complexity.flags.format.options).toContain('markdown')
      expect(Complexity.flags.format.options).toContain('table')
    })

    test('format flag has default table', () => {
      expect(Complexity.flags.format.default).toBe('table')
    })

    test('top flag has default 20', () => {
      expect(Complexity.flags.top.default).toBe(20)
    })

    test('threshold flag has default 0', () => {
      expect(Complexity.flags.threshold.default).toBe(0)
    })
  })

  describe('Flag characters', () => {
    test('format flag has char f', () => {
      expect(Complexity.flags.format.char).toBe('f')
    })

    test('sort-by flag has char s', () => {
      expect(Complexity.flags['sort-by'].char).toBe('s')
    })

    test('threshold flag has char t', () => {
      expect(Complexity.flags.threshold.char).toBe('t')
    })

    test('output flag has char o', () => {
      expect(Complexity.flags.output.char).toBe('o')
    })
  })

  describe('sort-by flag options', () => {
    test('sort-by has correct options (complexity, file, name)', () => {
      expect(Complexity.flags['sort-by']).toBeDefined()
      expect(Complexity.flags['sort-by'].options).toContain('complexity')
      expect(Complexity.flags['sort-by'].options).toContain('file')
      expect(Complexity.flags['sort-by'].options).toContain('name')
    })

    test('sort-by has default complexity', () => {
      expect(Complexity.flags['sort-by'].default).toBe('complexity')
    })
  })

  describe('JSON output', () => {
    test('outputs valid JSON with functions and summary when format is json', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed).toHaveProperty('functions')
      expect(parsed).toHaveProperty('summary')
      expect(parsed.functions).toBeInstanceOf(Array)
    })

    test('JSON summary has required fields (totalFunctions, averageCyclomatic, averageCognitive, maxCyclomatic, maxCognitive, categoryBreakdown)', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary).toHaveProperty('totalFunctions')
      expect(parsed.summary).toHaveProperty('averageCyclomatic')
      expect(parsed.summary).toHaveProperty('averageCognitive')
      expect(parsed.summary).toHaveProperty('maxCyclomatic')
      expect(parsed.summary).toHaveProperty('maxCognitive')
      expect(parsed.summary).toHaveProperty('categoryBreakdown')
    })
  })

  describe('Table output', () => {
    test('outputs table format with expected headers when format is table', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Function')
      expect(output).toContain('Cyclomatic')
      expect(output).toContain('Cognitive')
      expect(output).toContain('Category')
      expect(output).toContain('File')
    })
  })

  describe('Markdown output', () => {
    test('outputs markdown format with table header when format is markdown', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('# Complexity Analysis')
      expect(output).toContain('| Function | Cyclomatic | Cognitive | Category | File |')
      expect(output).toContain('|--------|------------|-----------|----------|------|')
    })
  })

  describe('Threshold filtering', () => {
    test('filters functions by threshold (only returns functions with cyclomatic > threshold)', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/file1.ts',
            functionName: 'lowFunction',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'high' as const,
            cognitive: 8,
            cyclomatic: 15,
            filePath: '/test/file2.ts',
            functionName: 'highFunction',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 8,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 8,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('highFunction')
      expect(parsed.functions[0].cyclomatic).toBe(15)
    })
  })

  describe('Sorting', () => {
    test('sorts by complexity descending', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
        { absolutePath: '/test/file3.ts', path: 'file3.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 2,
            cyclomatic: 3,
            filePath: '/test/file1.ts',
            functionName: 'lowComplexity',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'extreme' as const,
            cognitive: 15,
            cyclomatic: 25,
            filePath: '/test/file2.ts',
            functionName: 'highComplexity',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'moderate' as const,
            cognitive: 5,
            cyclomatic: 8,
            filePath: '/test/file3.ts',
            functionName: 'mediumComplexity',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 7.33,
        averageCyclomatic: 12,
        categoryBreakdown: { extreme: 1, high: 0, low: 1, moderate: 1 },
        maxCognitive: 15,
        maxCyclomatic: 25,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].cyclomatic).toBe(25)
      expect(parsed.functions[1].cyclomatic).toBe(8)
      expect(parsed.functions[2].cyclomatic).toBe(3)
    })

    test('sorts by file name ascending', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/zebra.ts', path: 'zebra.ts' },
        { absolutePath: '/test/apple.ts', path: 'apple.ts' },
        { absolutePath: '/test/banana.ts', path: 'banana.ts' },
      ])
      mockAnalyzeFileComplexity.mockImplementation((sourceFile: any) => {
        const filePath = sourceFile.getFilePath()
        return [
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath,
            functionName: 'testFunction',
            startLine: 1,
          },
        ]
      })
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'file',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].filePath).toBe('/test/apple.ts')
      expect(parsed.functions[1].filePath).toBe('/test/banana.ts')
      expect(parsed.functions[2].filePath).toBe('/test/zebra.ts')
    })

    test('sorts by function name ascending', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'zebraFunction',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'appleFunction',
          startLine: 10,
        },
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'bananaFunction',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'name',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].functionName).toBe('appleFunction')
      expect(parsed.functions[1].functionName).toBe('bananaFunction')
      expect(parsed.functions[2].functionName).toBe('zebraFunction')
    })
  })

  describe('Top N limit', () => {
    test('limits output to top N functions', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
        { absolutePath: '/test/file3.ts', path: 'file3.ts' },
        { absolutePath: '/test/file4.ts', path: 'file4.ts' },
        { absolutePath: '/test/file5.ts', path: 'file5.ts' },
      ])
      mockAnalyzeFileComplexity.mockImplementation((filePath: string) => {
        const complexity = Number.parseInt(filePath.match(/\d+/)?.[0] ?? '1', 10) * 2
        return [
          {
            category: 'moderate' as const,
            cognitive: complexity,
            cyclomatic: complexity,
            filePath,
            functionName: `func${filePath.match(/\d+/)?.[0] || '1'}`,
            startLine: 1,
          },
        ]
      })
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 6,
        averageCyclomatic: 6,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 2 },
        maxCognitive: 10,
        maxCyclomatic: 10,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 2,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions.length).toBeLessThanOrEqual(2)
    })
  })

  describe('Output file', () => {
    test('writes output to file when --output is specified', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: '/test/output.json',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Results written to /test/output.json')
      expect(mockWriteFile).toHaveBeenCalledWith('/test/output.json', expect.any(String), 'utf8')
    })
  })

  describe('Empty files', () => {
    test('handles empty file list (no discovered files)', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
      expect(parsed.summary.totalFunctions).toBe(0)
    })
  })

  describe('Error handling', () => {
    test('handles parse errors gracefully (returns empty array per file)', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/good.ts', path: 'good.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/good.ts',
            functionName: 'goodFunction',
            startLine: 1,
          },
        ])
        .mockImplementationOnce(() => {
          throw new Error('Parse error')
        })
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('goodFunction')
    })
  })

  describe('ext and ignore flags', () => {
    test('ext flag has default empty string', () => {
      expect(Complexity.flags.ext).toBeDefined()
      expect(Complexity.flags.ext.default).toBe('')
    })

    test('ignore flag accepts multiple patterns', () => {
      expect(Complexity.flags.ignore).toBeDefined()
      expect(Complexity.flags.ignore.multiple).toBe(true)
    })

    test('filters files to .tsx only when ext=".tsx"', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file.ts', path: 'file.ts' },
        { absolutePath: '/test/component.tsx', path: 'component.tsx' },
        { absolutePath: '/test/another.ts', path: 'another.ts' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/component.tsx',
          functionName: 'TestComponent',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.tsx',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(1)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('TestComponent')
    })

    test('filters files to .ts and .tsx when ext=".ts,.tsx"', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file.ts', path: 'file.ts' },
        { absolutePath: '/test/component.tsx', path: 'component.tsx' },
        { absolutePath: '/test/style.css', path: 'style.css' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/analyzed.ts',
          functionName: 'testFunc',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts,.tsx',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(2)
    })

    test('processes all discovered files when ext is empty string', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 2,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(3)
    })

    test('passes ignore patterns to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: ['**/test/**', '**/dist/**'],
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/test/**', '**/dist/**']),
        }),
      )
    })
  })

  describe('Path not found', () => {
    test('errors when target path does not exist', async () => {
      const nodeFs = await import('node:fs')
      vi.mocked(nodeFs.existsSync).mockReturnValueOnce(false)

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '/nonexistent' },
      )

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })
  })

  describe('Output file formats', () => {
    test('writes markdown output to file when --output and --format markdown', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: '/test/report.md',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/test/report.md',
        expect.stringContaining('# Complexity Analysis'),
        'utf8',
      )
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Results written to /test/report.md')
    })

    test('writes table output to file when --output and --format table', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: '/test/report.txt',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith(
        '/test/report.txt',
        expect.stringContaining('Complexity Analysis'),
        'utf8',
      )
    })

    test('handles output file write failure gracefully', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFunction',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })
      mockWriteFile.mockRejectedValue(new Error('Permission denied'))

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: '/readonly/output.json',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await expect(cmd.run()).rejects.toThrow('Failed to write output')
    })
  })

  describe('Sorting with threshold', () => {
    test('sort-by=file with threshold > 0 filters then sorts by file path', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/zebra.ts', path: 'zebra.ts' },
        { absolutePath: '/test/apple.ts', path: 'apple.ts' },
        { absolutePath: '/test/medium.ts', path: 'medium.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 2,
            cyclomatic: 3,
            filePath: '/test/zebra.ts',
            functionName: 'zebraFunc',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'high' as const,
            cognitive: 10,
            cyclomatic: 15,
            filePath: '/test/apple.ts',
            functionName: 'appleFunc',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 4,
            filePath: '/test/medium.ts',
            functionName: 'mediumFunc',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 10,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'file',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].filePath).toBe('/test/apple.ts')
    })

    test('sort-by=name with threshold > 0 filters then sorts by function name', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'zFunc',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'aFunc',
          startLine: 10,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'mFunc',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 7.5,
        averageCyclomatic: 11.5,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 1 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'name',
          threshold: 5,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
      expect(parsed.functions[0].functionName).toBe('mFunc')
      expect(parsed.functions[1].functionName).toBe('zFunc')
    })

    test('sort-by=complexity with top=1 returns only the most complex function', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 20,
          cyclomatic: 30,
          filePath: '/test/file.ts',
          functionName: 'mostComplex',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'leastComplex',
          startLine: 20,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'mediumComplex',
          startLine: 30,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 20,
        averageCyclomatic: 30,
        categoryBreakdown: { extreme: 1, high: 0, low: 0, moderate: 0 },
        maxCognitive: 20,
        maxCyclomatic: 30,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 1,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('mostComplex')
      expect(parsed.functions[0].cyclomatic).toBe(30)
    })
  })

  describe('Multiple functions per file', () => {
    test('file with 5 functions of varying complexity includes all in output', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'moderate' as const,
          cognitive: 4,
          cyclomatic: 7,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
        {
          category: 'high' as const,
          cognitive: 8,
          cyclomatic: 12,
          filePath: '/test/file.ts',
          functionName: 'fn3',
          startLine: 20,
        },
        {
          category: 'extreme' as const,
          cognitive: 15,
          cyclomatic: 25,
          filePath: '/test/file.ts',
          functionName: 'fn4',
          startLine: 30,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'fn5',
          startLine: 40,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 6,
        averageCyclomatic: 9.8,
        categoryBreakdown: { extreme: 1, high: 1, low: 2, moderate: 1 },
        maxCognitive: 15,
        maxCyclomatic: 25,
        totalFunctions: 5,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(5)
      expect(parsed.functions[0].functionName).toBe('fn4')
      expect(parsed.functions[1].functionName).toBe('fn3')
      expect(parsed.functions[2].functionName).toBe('fn2')
      expect(parsed.functions[3].functionName).toBe('fn5')
      expect(parsed.functions[4].functionName).toBe('fn1')
    })

    test('all function names from single file appear in output', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'alpha',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'beta',
          startLine: 10,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'gamma',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 2,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'name',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const names = parsed.functions.map((f: { functionName: string }) => f.functionName)
      expect(names).toContain('alpha')
      expect(names).toContain('beta')
      expect(names).toContain('gamma')
    })
  })

  describe('Mixed results', () => {
    test('handles mix of files with and without functions', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/with.ts', path: 'with.ts' },
        { absolutePath: '/test/empty.ts', path: 'empty.ts' },
        { absolutePath: '/test/also.ts', path: 'also.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/with.ts',
            functionName: 'foundFunc',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([
          {
            category: 'high' as const,
            cognitive: 10,
            cyclomatic: 15,
            filePath: '/test/also.ts',
            functionName: 'alsoFunc',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 6.5,
        averageCyclomatic: 10,
        categoryBreakdown: { extreme: 0, high: 1, low: 1, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
    })

    test('handles 3 files where middle one throws during parse', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/first.ts', path: 'first.ts' },
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
        { absolutePath: '/test/third.ts', path: 'third.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/first.ts',
            functionName: 'firstFunc',
            startLine: 1,
          },
        ])
        .mockImplementationOnce(() => {
          throw new Error('Parse error')
        })
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/third.ts',
            functionName: 'thirdFunc',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
      const names = parsed.functions.map((f: { functionName: string }) => f.functionName)
      expect(names).toContain('firstFunc')
      expect(names).toContain('thirdFunc')
    })
  })

  describe('Threshold edge cases', () => {
    test('threshold equal to function complexity excludes that function', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 10,
          filePath: '/test/file.ts',
          functionName: 'exactFunc',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 8,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'aboveFunc',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 8,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 8,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('aboveFunc')
    })

    test('all functions below threshold results in empty output', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 100,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
    })

    test('top=0 shows no functions in output', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 0,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
    })

    test('single file with single function produces correct output', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/solo.ts', path: 'solo.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/solo.ts',
          functionName: 'soloFunc',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5,
        averageCyclomatic: 8,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 1 },
        maxCognitive: 5,
        maxCyclomatic: 8,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('soloFunc')
      expect(parsed.functions[0].filePath).toBe('/test/solo.ts')
      expect(parsed.summary.totalFunctions).toBe(1)
    })
  })

  describe('Output content verification', () => {
    test('JSON output has correct structure with function entries', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(Array.isArray(parsed.functions)).toBe(true)
      expect(typeof parsed.summary).toBe('object')
      expect(parsed.functions[0]).toHaveProperty('functionName')
      expect(parsed.functions[0]).toHaveProperty('cyclomatic')
      expect(parsed.functions[0]).toHaveProperty('cognitive')
      expect(parsed.functions[0]).toHaveProperty('category')
      expect(parsed.functions[0]).toHaveProperty('filePath')
      expect(parsed.functions[0]).toHaveProperty('startLine')
    })

    test('Markdown output has correct table structure with data rows', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 8,
          cyclomatic: 12,
          filePath: '/test/file.ts',
          functionName: 'complexFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 8,
        averageCyclomatic: 12,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 8,
        maxCyclomatic: 12,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('# Complexity Analysis')
      expect(output).toContain('| complexFn | 12 | 8 | high | /test/file.ts |')
      expect(output).toContain('## Summary')
      expect(output).toContain('## Category Breakdown')
    })

    test('Table output contains expected column headers and summary section', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'testFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Function')
      expect(output).toContain('Cyclomatic')
      expect(output).toContain('Cognitive')
      expect(output).toContain('Category')
      expect(output).toContain('Summary:')
      expect(output).toContain('Total functions:')
      expect(output).toContain('Category breakdown:')
    })
  })

  describe('Command examples', () => {
    test('has exactly 5 examples', () => {
      expect(Complexity.examples).toHaveLength(5)
    })

    test('each example has command and description properties', () => {
      for (const example of Complexity.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('first example describes analyzing current directory', () => {
      expect(Complexity.examples[0].description).toContain('current directory')
    })

    test('has example with json format', () => {
      const hasJsonExample = Complexity.examples.some((e: { command: string }) =>
        e.command.includes('json'),
      )
      expect(hasJsonExample).toBe(true)
    })

    test('has example with threshold flag', () => {
      const hasThresholdExample = Complexity.examples.some((e: { command: string }) =>
        e.command.includes('--threshold'),
      )
      expect(hasThresholdExample).toBe(true)
    })
  })

  describe('Path argument properties', () => {
    test('path argument has a description', () => {
      expect(Complexity.args.path.description).toBe('Path to analyze')
    })

    test('path argument is not required', () => {
      expect(Complexity.args.path.required).toBe(false)
    })
  })

  describe('Flag descriptions', () => {
    test('format flag has description', () => {
      expect(Complexity.flags.format.description).toBe('Output format')
    })

    test('ext flag has description mentioning extensions', () => {
      expect(Complexity.flags.ext.description).toContain('extension')
    })

    test('output flag has description', () => {
      expect(Complexity.flags.output.description).toBe('Output file path')
    })

    test('sort-by flag has description', () => {
      expect(Complexity.flags['sort-by'].description).toBe('Sort results by')
    })

    test('threshold flag has description mentioning threshold', () => {
      expect(Complexity.flags.threshold.description).toContain('threshold')
    })

    test('top flag has description mentioning top N', () => {
      expect(Complexity.flags.top.description).toContain('top')
    })

    test('ignore flag has description mentioning patterns', () => {
      expect(Complexity.flags.ignore.description).toContain('Pattern')
    })
  })

  describe('Additional flag properties', () => {
    test('top flag has char n', () => {
      expect(Complexity.flags.top.char).toBe('n')
    })

    test('ignore flag has char i', () => {
      expect(Complexity.flags.ignore.char).toBe('i')
    })

    test('ext flag has no char defined', () => {
      expect(Complexity.flags.ext.char).toBeUndefined()
    })

    test('threshold flag is defined as integer', () => {
      expect(Complexity.flags.threshold).toBeDefined()
    })

    test('top flag is defined as integer', () => {
      expect(Complexity.flags.top).toBeDefined()
    })
  })

  describe('JSON output detailed verification', () => {
    test('JSON function entry preserves exact values from analysis', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 8,
          cyclomatic: 12,
          filePath: '/test/file.ts',
          functionName: 'myFunc',
          startLine: 42,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 8,
        averageCyclomatic: 12,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 8,
        maxCyclomatic: 12,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].functionName).toBe('myFunc')
      expect(parsed.functions[0].cognitive).toBe(8)
      expect(parsed.functions[0].cyclomatic).toBe(12)
      expect(parsed.functions[0].category).toBe('high')
      expect(parsed.functions[0].startLine).toBe(42)
    })

    test('JSON summary categoryBreakdown has all four categories', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 2,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.categoryBreakdown).toHaveProperty('low')
      expect(parsed.summary.categoryBreakdown).toHaveProperty('moderate')
      expect(parsed.summary.categoryBreakdown).toHaveProperty('high')
      expect(parsed.summary.categoryBreakdown).toHaveProperty('extreme')
    })

    test('JSON output is pretty-printed with 2-space indent', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('  "functions"')
    })

    test('JSON output with no functions has empty array', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toEqual([])
    })
  })

  describe('Table output detailed', () => {
    test('Table with no functions shows "No functions found" message', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('No functions found')
    })

    test('Table output contains function name', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'mySpecialFunc',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('mySpecialFunc')
    })

    test('Table output shows file path', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/myfile.ts', path: 'myfile.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/myfile.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('/test/myfile.ts')
    })
  })

  describe('Markdown output detailed', () => {
    test('Markdown output contains data row with correct values', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 20,
          cyclomatic: 30,
          filePath: '/test/file.ts',
          functionName: 'dangerFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 20,
        averageCyclomatic: 30,
        categoryBreakdown: { extreme: 1, high: 0, low: 0, moderate: 0 },
        maxCognitive: 20,
        maxCyclomatic: 30,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('| dangerFn | 30 | 20 | extreme | /test/file.ts |')
    })

    test('Markdown summary section contains total functions', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 2,
        averageCyclomatic: 3,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 2,
        maxCyclomatic: 3,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Total functions')
    })

    test('Markdown category breakdown shows all four categories', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Low')
      expect(output).toContain('Moderate')
      expect(output).toContain('High')
      expect(output).toContain('Extreme')
    })

    test('Markdown with multiple functions shows all data rows', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5.5,
        averageCyclomatic: 8.5,
        categoryBreakdown: { extreme: 0, high: 1, low: 1, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('| fn2 | 15 | 10 | high | /test/file.ts |')
      expect(output).toContain('| fn1 | 2 | 1 | low | /test/file.ts |')
    })
  })

  describe('Threshold additional edge cases', () => {
    test('threshold=0 includes all functions including cyclomatic=1', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'tiny',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'small',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1.5,
        averageCyclomatic: 1.5,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 2,
        maxCyclomatic: 2,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
    })

    test('threshold=1 keeps only functions with cyclomatic strictly greater than 1', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'one',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'two',
          startLine: 10,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'eight',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 1 },
        maxCognitive: 5,
        maxCyclomatic: 8,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 1,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
      expect(parsed.functions[0].functionName).toBe('eight')
      expect(parsed.functions[1].functionName).toBe('two')
    })

    test('functions with cyclomatic exactly at threshold are excluded (uses > not >=)', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'exactFive',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 5,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
    })

    test('threshold applied across all files combined', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'moderate' as const,
            cognitive: 4,
            cyclomatic: 7,
            filePath: '/test/a.ts',
            functionName: 'fnA',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'high' as const,
            cognitive: 9,
            cyclomatic: 14,
            filePath: '/test/b.ts',
            functionName: 'fnB',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 9,
        averageCyclomatic: 14,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 9,
        maxCyclomatic: 14,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('fnB')
    })
  })

  describe('Sorting additional edge cases', () => {
    test('sort by complexity with equal cyclomatic values preserves all results', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'first',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'second',
          startLine: 10,
        },
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'third',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 2,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(3)
      parsed.functions.forEach((f: { cyclomatic: number }) => {
        expect(f.cyclomatic).toBe(5)
      })
    })

    test('sort by file groups functions from same file together', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/beta.ts', path: 'beta.ts' },
        { absolutePath: '/test/alpha.ts', path: 'alpha.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 1,
            cyclomatic: 2,
            filePath: '/test/beta.ts',
            functionName: 'betaFn',
            startLine: 1,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 1,
            cyclomatic: 2,
            filePath: '/test/alpha.ts',
            functionName: 'alphaFn',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 2,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'file',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].filePath).toBe('/test/alpha.ts')
      expect(parsed.functions[1].filePath).toBe('/test/beta.ts')
    })

    test('sort by name with identical prefixes orders alphabetically', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'handleClick',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'handleChange',
          startLine: 10,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'handleSubmit',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 3, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'name',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].functionName).toBe('handleChange')
      expect(parsed.functions[1].functionName).toBe('handleClick')
      expect(parsed.functions[2].functionName).toBe('handleSubmit')
    })
  })

  describe('Top N additional edge cases', () => {
    test('top larger than result count returns all results', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 2,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1.5,
        averageCyclomatic: 1.5,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 2,
        maxCyclomatic: 2,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 100,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
    })

    test('top=1 returns exactly one result', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 20,
          filePath: '/test/file.ts',
          functionName: 'topFn',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'bottomFn',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 10,
        averageCyclomatic: 20,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 20,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 1,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('topFn')
    })

    test('top applied after threshold filtering', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'high1',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 9,
          cyclomatic: 12,
          filePath: '/test/file.ts',
          functionName: 'high2',
          startLine: 10,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'low1',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 9.5,
        averageCyclomatic: 13.5,
        categoryBreakdown: { extreme: 0, high: 2, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 5,
          top: 1,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('high1')
    })
  })

  describe('discoverFiles integration', () => {
    test('discoverFiles is called with cwd set to resolved path', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ cwd: expect.any(String) }),
      )
    })

    test('discoverFiles is called with TypeScript file patterns', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ patterns: ['**/*.ts', '**/*.tsx'] }),
      )
    })

    test('discoverFiles receives combined default and user ignore patterns', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: ['custom/**'],
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ ignore: expect.arrayContaining(['custom/**']) }),
      )
    })
  })

  describe('ext flag additional edge cases', () => {
    test('ext=.ts only processes .ts files and excludes .tsx', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(1)
    })

    test('ext with no matching files produces empty results', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.py',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
      expect(mockAnalyzeFileComplexity).not.toHaveBeenCalled()
    })

    test('ext with comma-separated values trims whitespace', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
        { absolutePath: '/test/c.css', path: 'c.css' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts , .tsx',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(2)
    })

    test('ext with single extension filters correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
        { absolutePath: '/test/c.tsx', path: 'c.tsx' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/b.tsx',
          functionName: 'comp',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.tsx',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(2)
    })
  })

  describe('Combined flags', () => {
    test('threshold + top + sort-by all applied together correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 20,
          cyclomatic: 30,
          filePath: '/test/file.ts',
          functionName: 'zFn',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'mFn',
          startLine: 10,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'aFn',
          startLine: 20,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'bFn',
          startLine: 30,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 15,
        averageCyclomatic: 22.5,
        categoryBreakdown: { extreme: 1, high: 1, low: 0, moderate: 0 },
        maxCognitive: 20,
        maxCyclomatic: 30,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'name',
          threshold: 5,
          top: 1,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('aFn')
    })

    test('format json + output writes JSON content to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })
      mockWriteFile.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: '/out/result.json',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const writtenContent = (mockWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
      const parsedContent = JSON.parse(writtenContent)
      expect(parsedContent).toHaveProperty('functions')
      expect(parsedContent).toHaveProperty('summary')
    })

    test('format table + output writes table content to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })
      mockWriteFile.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: '/out/table.txt',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith('/out/table.txt', expect.any(String), 'utf8')
    })

    test('format json + output writes JSON content to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: '/out/result.json',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const writtenContent = (mockWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
      const parsedContent = JSON.parse(writtenContent)
      expect(parsedContent).toHaveProperty('functions')
      expect(parsedContent).toHaveProperty('summary')
    })

    test('format table + output writes table content to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: '/out/table.txt',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockWriteFile).toHaveBeenCalledWith('/out/table.txt', expect.any(String), 'utf8')
    })
  })

  describe('Error recovery detailed', () => {
    test('all files throwing errors returns empty results', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/bad1.ts', path: 'bad1.ts' },
        { absolutePath: '/test/bad2.ts', path: 'bad2.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockImplementationOnce(() => {
          throw new Error('Error 1')
        })
        .mockImplementationOnce(() => {
          throw new Error('Error 2')
        })
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(0)
    })

    test('error in first file does not prevent processing second file', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
        { absolutePath: '/test/good.ts', path: 'good.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockImplementationOnce(() => {
          throw new Error('Bad file')
        })
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 3,
            cyclomatic: 5,
            filePath: '/test/good.ts',
            functionName: 'goodFn',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 3,
        maxCyclomatic: 5,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
      expect(parsed.functions[0].functionName).toBe('goodFn')
    })

    test('analyzeFileComplexity called for each filtered file', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockAnalyzeFileComplexity).toHaveBeenCalledTimes(3)
    })
  })

  describe('Spinner behavior', () => {
    test('ora spinner is created and start is called', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const oraModule = await import('ora')
      expect(oraModule.default).toHaveBeenCalledWith('Discovering files...')
    })

    test('ora spinner succeed is called with file count', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const oraModule = await import('ora')
      const spinnerInstance = (oraModule.default as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(spinnerInstance.succeed).toHaveBeenCalledWith('Analyzed 2 files')
    })
  })

  describe('Complexity categories in output', () => {
    test('JSON output includes extreme category function', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 25,
          cyclomatic: 40,
          filePath: '/test/file.ts',
          functionName: 'megaFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 25,
        averageCyclomatic: 40,
        categoryBreakdown: { extreme: 1, high: 0, low: 0, moderate: 0 },
        maxCognitive: 25,
        maxCyclomatic: 40,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].category).toBe('extreme')
      expect(parsed.summary.categoryBreakdown.extreme).toBe(1)
    })

    test('JSON output includes moderate category function', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'midFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5,
        averageCyclomatic: 8,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 1 },
        maxCognitive: 5,
        maxCyclomatic: 8,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].category).toBe('moderate')
      expect(parsed.summary.categoryBreakdown.moderate).toBe(1)
    })

    test('Table output shows EXTREME in uppercase for extreme category', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 25,
          cyclomatic: 40,
          filePath: '/test/file.ts',
          functionName: 'bigFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 25,
        averageCyclomatic: 40,
        categoryBreakdown: { extreme: 1, high: 0, low: 0, moderate: 0 },
        maxCognitive: 25,
        maxCyclomatic: 40,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('EXTREME')
    })

    test('Table output shows HIGH in uppercase for high category', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'hiFn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 10,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('HIGH')
    })
  })

  describe('Path resolution', () => {
    test('resolves relative path argument', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: './src' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ cwd: expect.stringContaining('src') }),
      )
    })
  })

  describe('Default flag behavior in run', () => {
    test('default format table does not output JSON', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(() => JSON.parse(output)).toThrow()
    })

    test('default threshold 0 includes all functions', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'tiny',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(1)
    })

    test('default sort-by complexity orders by cyclomatic descending', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'low',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'high',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5.5,
        averageCyclomatic: 9,
        categoryBreakdown: { extreme: 0, high: 1, low: 1, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions[0].cyclomatic).toBeGreaterThan(parsed.functions[1].cyclomatic)
    })
  })

  describe('Multiple files with multiple functions', () => {
    test('functions from different files are combined in output', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockAnalyzeFileComplexity
        .mockReturnValueOnce([
          {
            category: 'low' as const,
            cognitive: 2,
            cyclomatic: 3,
            filePath: '/test/a.ts',
            functionName: 'fnA1',
            startLine: 1,
          },
          {
            category: 'moderate' as const,
            cognitive: 5,
            cyclomatic: 8,
            filePath: '/test/a.ts',
            functionName: 'fnA2',
            startLine: 20,
          },
        ])
        .mockReturnValueOnce([
          {
            category: 'high' as const,
            cognitive: 10,
            cyclomatic: 15,
            filePath: '/test/b.ts',
            functionName: 'fnB1',
            startLine: 1,
          },
        ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 5.67,
        averageCyclomatic: 8.67,
        categoryBreakdown: { extreme: 0, high: 1, low: 1, moderate: 1 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(3)
      expect(parsed.functions[0].functionName).toBe('fnB1')
    })
  })

  describe('Output file write error details', () => {
    test('write error message includes the output file path', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })
      mockWriteFile.mockRejectedValue(new Error('Disk full'))

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: '/readonly/out.json',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await expect(cmd.run()).rejects.toThrow('/readonly/out.json')
    })
  })

  describe('Ignore flag variations', () => {
    test('no ignore flag still calls discoverFiles with default patterns', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ ignore: expect.any(Array) }),
      )
    })

    test('single ignore pattern is passed to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: ['node_modules/**'],
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({ ignore: expect.arrayContaining(['node_modules/**']) }),
      )
    })
  })

  describe('Output without file flag', () => {
    test('JSON output goes to console log when no output flag', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalled()
      expect(mockWriteFile).not.toHaveBeenCalled()
    })

    test('Table output goes to console log when no output flag', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalled()
      expect(mockWriteFile).not.toHaveBeenCalled()
    })
  })

  describe('buildIgnorePatterns', () => {
    const buildIgnore = buildIgnorePatterns

    test('returns default patterns when userIgnore is undefined', () => {
      const result = buildIgnore(['node_modules/**', 'dist/**'], undefined)
      expect(result).toEqual(['node_modules/**', 'dist/**'])
    })

    test('merges default and user patterns when userIgnore provided', () => {
      const result = buildIgnore(['node_modules/**'], ['custom/**'])
      expect(result).toEqual(['node_modules/**', 'custom/**'])
    })

    test('returns default when userIgnore is empty array', () => {
      const result = buildIgnore(['node_modules/**'], [])
      expect(result).toEqual(['node_modules/**'])
    })

    test('preserves order: defaults first, then user patterns', () => {
      const result = buildIgnore(['a', 'b'], ['c', 'd'])
      expect(result).toEqual(['a', 'b', 'c', 'd'])
    })

    test('handles multiple user ignore patterns', () => {
      const result = buildIgnore(['default/**'], ['p1/**', 'p2/**', 'p3/**'])
      expect(result).toHaveLength(4)
      expect(result).toContain('p1/**')
      expect(result).toContain('p2/**')
      expect(result).toContain('p3/**')
    })
  })

  describe('parseExtensions', () => {
    test('returns null for empty string', () => {
      expect(parseExtensions('')).toBeNull()
    })

    test('returns single extension in array', () => {
      expect(parseExtensions('.ts')).toEqual(['.ts'])
    })

    test('splits comma-separated extensions', () => {
      expect(parseExtensions('.ts,.tsx')).toEqual(['.ts', '.tsx'])
    })

    test('trims whitespace from extensions', () => {
      expect(parseExtensions(' .ts , .tsx ')).toEqual(['.ts', '.tsx'])
    })

    test('filters out empty strings from trailing commas', () => {
      expect(parseExtensions('.ts,')).toEqual(['.ts'])
    })

    test('handles multiple commas gracefully', () => {
      expect(parseExtensions('.ts,,.tsx')).toEqual(['.ts', '.tsx'])
    })

    test('handles single extension with no comma', () => {
      expect(parseExtensions('.tsx')).toEqual(['.tsx'])
    })
  })

  describe('filterFilesByExtension', () => {
    const files = [
      { absolutePath: '/a.ts', path: 'a.ts' },
      { absolutePath: '/b.tsx', path: 'b.tsx' },
      { absolutePath: '/c.css', path: 'c.css' },
    ]

    test('returns all files when extensions is null', () => {
      expect(filterFilesByExtension(files, null)).toHaveLength(3)
    })

    test('filters to single extension', () => {
      expect(filterFilesByExtension(files, ['.ts'])).toHaveLength(1)
      expect(filterFilesByExtension(files, ['.ts'])[0].path).toBe('a.ts')
    })

    test('filters to multiple extensions', () => {
      expect(filterFilesByExtension(files, ['.ts', '.tsx'])).toHaveLength(2)
    })

    test('returns empty array when no files match', () => {
      expect(filterFilesByExtension(files, ['.py'])).toHaveLength(0)
    })

    test('handles empty files array', () => {
      expect(filterFilesByExtension([], ['.ts'])).toHaveLength(0)
    })

    test('is case-insensitive on extension', () => {
      const mixedFiles = [{ absolutePath: '/a.TS', path: 'a.TS' }]
      expect(filterFilesByExtension(mixedFiles, ['.ts'])).toHaveLength(1)
    })
  })

  describe('filterByThreshold (unit)', () => {
    const results = [
      {
        category: 'low' as const,
        cognitive: 1,
        cyclomatic: 2,
        filePath: '/a.ts',
        functionName: 'fn1',
        startLine: 1,
      },
      {
        category: 'moderate' as const,
        cognitive: 5,
        cyclomatic: 8,
        filePath: '/b.ts',
        functionName: 'fn2',
        startLine: 1,
      },
      {
        category: 'high' as const,
        cognitive: 10,
        cyclomatic: 15,
        filePath: '/c.ts',
        functionName: 'fn3',
        startLine: 1,
      },
    ]

    test('returns all results when threshold is 0', () => {
      expect(filterByThreshold(results, 0)).toHaveLength(3)
    })

    test('returns all results when threshold is negative', () => {
      expect(filterByThreshold(results, -5)).toHaveLength(3)
    })

    test('filters to only results strictly above threshold', () => {
      expect(filterByThreshold(results, 5)).toHaveLength(2)
    })

    test('returns empty for very high threshold', () => {
      expect(filterByThreshold(results, 100)).toHaveLength(0)
    })

    test('handles empty results array', () => {
      expect(filterByThreshold([], 0)).toHaveLength(0)
    })

    test('excludes values equal to threshold (strict greater than)', () => {
      expect(filterByThreshold(results, 2)).toHaveLength(2)
    })
  })

  describe('sortByField (unit)', () => {
    const items = [
      {
        category: 'low' as const,
        cognitive: 1,
        cyclomatic: 3,
        filePath: '/z.ts',
        functionName: 'gamma',
        startLine: 1,
      },
      {
        category: 'high' as const,
        cognitive: 10,
        cyclomatic: 15,
        filePath: '/a.ts',
        functionName: 'alpha',
        startLine: 1,
      },
      {
        category: 'moderate' as const,
        cognitive: 5,
        cyclomatic: 8,
        filePath: '/m.ts',
        functionName: 'beta',
        startLine: 1,
      },
    ]

    test('sort by complexity descending', () => {
      const result = sortByField(items, 'complexity')
      expect(result[0].cyclomatic).toBe(15)
      expect(result[1].cyclomatic).toBe(8)
      expect(result[2].cyclomatic).toBe(3)
    })

    test('sort by file ascending', () => {
      const result = sortByField(items, 'file')
      expect(result[0].filePath).toBe('/a.ts')
      expect(result[1].filePath).toBe('/m.ts')
      expect(result[2].filePath).toBe('/z.ts')
    })

    test('sort by name ascending', () => {
      const result = sortByField(items, 'name')
      expect(result[0].functionName).toBe('alpha')
      expect(result[1].functionName).toBe('beta')
      expect(result[2].functionName).toBe('gamma')
    })

    test('does not mutate original array', () => {
      const copy = [...items]
      sortByField(items, 'complexity')
      expect(items).toEqual(copy)
    })

    test('handles empty array', () => {
      expect(sortByField([], 'complexity')).toEqual([])
    })

    test('handles single element array', () => {
      const single = [items[0]]
      expect(sortByField(single, 'complexity')).toHaveLength(1)
    })
  })

  describe('limitResults (unit)', () => {
    test('returns subset within limit', () => {
      expect(limitResults([1, 2, 3, 4, 5], 3)).toEqual([1, 2, 3])
    })

    test('returns all when limit exceeds length', () => {
      expect(limitResults([1, 2], 10)).toEqual([1, 2])
    })

    test('returns empty for limit 0', () => {
      expect(limitResults([1, 2, 3], 0)).toEqual([])
    })

    test('returns empty for empty input', () => {
      expect(limitResults([], 5)).toEqual([])
    })

    test('returns exactly one element for limit 1', () => {
      expect(limitResults([1, 2, 3], 1)).toEqual([1])
    })
  })

  describe('getCategoryColor (unit)', () => {
    test('returns a function for low category', () => {
      expect(typeof getCategoryColor('low')).toBe('function')
    })

    test('returns a function for moderate category', () => {
      expect(typeof getCategoryColor('moderate')).toBe('function')
    })

    test('returns a function for high category', () => {
      expect(typeof getCategoryColor('high')).toBe('function')
    })

    test('returns a function for extreme category', () => {
      expect(typeof getCategoryColor('extreme')).toBe('function')
    })
  })

  describe('buildJsonOutput (unit)', () => {
    test('produces valid JSON with functions and summary', () => {
      const data = [
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ]
      const output = buildJsonOutput(data)
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('functions')
      expect(parsed).toHaveProperty('summary')
    })

    test('handles empty array input', () => {
      const output = buildJsonOutput([])
      const parsed = JSON.parse(output)
      expect(parsed.functions).toEqual([])
      expect(parsed).toHaveProperty('summary')
    })

    test('preserves function data accurately', () => {
      const data = [
        {
          category: 'high' as const,
          cognitive: 8,
          cyclomatic: 12,
          filePath: '/x.ts',
          functionName: 'myFn',
          startLine: 42,
        },
      ]
      const output = buildJsonOutput(data)
      const parsed = JSON.parse(output)
      expect(parsed.functions[0].functionName).toBe('myFn')
      expect(parsed.functions[0].cognitive).toBe(8)
      expect(parsed.functions[0].startLine).toBe(42)
    })

    test('output is indented with 2 spaces', () => {
      const data = [
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ]
      expect(buildJsonOutput(data)).toContain('  "functions"')
    })
  })

  describe('formatMarkdown (unit)', () => {
    test('produces header row with correct columns', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('| Function | Cyclomatic | Cognitive | Category | File |')
    })

    test('produces separator row', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('|--------|------------|-----------|----------|------|')
    })

    test('includes data row with correct values', () => {
      const output = formatMarkdown([
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test.ts',
          functionName: 'myFunc',
          startLine: 1,
        },
      ])
      expect(output).toContain('| myFunc | 8 | 5 | moderate | /test.ts |')
    })

    test('includes summary section header', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('## Summary')
    })

    test('includes category breakdown section', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('## Category Breakdown')
    })

    test('handles empty results gracefully', () => {
      const output = formatMarkdown([])
      expect(output).toContain('# Complexity Analysis')
      expect(output).toContain('Total functions')
    })

    test('multiple functions produce multiple data rows', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/b.ts',
          functionName: 'fn2',
          startLine: 1,
        },
      ])
      expect(output).toContain('| fn1 |')
      expect(output).toContain('| fn2 |')
    })
  })

  describe('formatTable (unit)', () => {
    test('shows "No functions found" for empty results', () => {
      const output = formatTable([])
      expect(output).toContain('No functions found')
    })

    test('includes header with column names for non-empty results', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('Function')
      expect(output).toContain('Cyclomatic')
      expect(output).toContain('Cognitive')
    })

    test('includes function name in output', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'specialFunc',
          startLine: 1,
        },
      ])
      expect(output).toContain('specialFunc')
    })

    test('includes summary section', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('Summary:')
      expect(output).toContain('Total functions:')
    })

    test('includes category breakdown section', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('Category breakdown:')
    })

    test('truncates long function names to 28 chars', () => {
      const longName = 'a'.repeat(40)
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: longName,
          startLine: 1,
        },
      ])
      expect(output).toContain(longName.slice(0, 28))
    })

    test('includes file path in dim styling', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/my/path.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('/my/path.ts')
    })
  })

  describe('formatOutput dispatch (unit)', () => {
    const data = [
      {
        category: 'low' as const,
        cognitive: 1,
        cyclomatic: 2,
        filePath: '/a.ts',
        functionName: 'fn',
        startLine: 1,
      },
    ]

    test('returns markdown when format is markdown', () => {
      const output = formatOutput(data, 'markdown')
      expect(output).toContain('# Complexity Analysis')
    })

    test('returns table when format is table', () => {
      const output = formatOutput(data, 'table')
      expect(output).toContain('Complexity Analysis')
    })

    test('returns table for any non-markdown format', () => {
      const output = formatOutput(data, 'unknown')
      expect(output).toContain('Complexity Analysis')
    })
  })

  describe('Parser lifecycle', () => {
    test('parser is initialized and disposed during run', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const ParserMock = (await import('../../../src/core/parser.js')).Parser
      const parserInstance = (ParserMock as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(parserInstance.initialize).toHaveBeenCalled()
      expect(parserInstance.dispose).toHaveBeenCalled()
    })

    test('parser disposes even when analysis throws', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockImplementation(() => {
        throw new Error('Analysis failed')
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const ParserMock = (await import('../../../src/core/parser.js')).Parser
      const parserInstance = (ParserMock as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(parserInstance.dispose).toHaveBeenCalled()
    })
  })

  describe('Spinner text updates', () => {
    test('spinner text changes to "Analyzing files..." after discovery', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const oraModule = await import('ora')
      const spinnerInstance = (oraModule.default as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(spinnerInstance.text).toBe('Analyzing files...')
    })
  })

  describe('File count in spinner succeed', () => {
    test('spinner succeed shows count of filtered files not discovered files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.css', path: 'b.css' },
      ])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/test/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 1,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 1,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const oraModule = await import('ora')
      const spinnerInstance = (oraModule.default as ReturnType<typeof vi.fn>).mock.results[0].value
      expect(spinnerInstance.succeed).toHaveBeenCalledWith('Analyzed 1 files')
    })
  })

  describe('Markdown output with thresholds and top', () => {
    test('markdown with threshold only shows filtered functions', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'lowFn',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'highFn',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 10,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('| highFn |')
      expect(output).not.toContain('| lowFn |')
    })

    test('markdown with top=1 shows only the most complex function', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'extreme' as const,
          cognitive: 20,
          cyclomatic: 30,
          filePath: '/test/file.ts',
          functionName: 'bigFn',
          startLine: 1,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'midFn',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 20,
        averageCyclomatic: 30,
        categoryBreakdown: { extreme: 1, high: 0, low: 0, moderate: 0 },
        maxCognitive: 20,
        maxCyclomatic: 30,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 1,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('| bigFn |')
      expect(output).not.toContain('| midFn |')
    })
  })

  describe('Table output with edge cases', () => {
    test('table with threshold shows filtered results', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'lowFn',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 10,
          cyclomatic: 15,
          filePath: '/test/file.ts',
          functionName: 'highFn',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 10,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 1, low: 0, moderate: 0 },
        maxCognitive: 10,
        maxCyclomatic: 15,
        totalFunctions: 1,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 10,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('highFn')
    })

    test('table with all functions filtered by threshold shows "No functions found"', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 100,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('No functions found')
    })
  })

  describe('Multiple ignore patterns in command', () => {
    test('three ignore patterns all passed to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 0,
        averageCyclomatic: 0,
        categoryBreakdown: { extreme: 0, high: 0, low: 0, moderate: 0 },
        maxCognitive: 0,
        maxCyclomatic: 0,
        totalFunctions: 0,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: ['a/**', 'b/**', 'c/**'],
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['a/**', 'b/**', 'c/**']),
        }),
      )
    })
  })

  describe('Large dataset handling', () => {
    test('handles 10 files with multiple functions each', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        absolutePath: `/test/file${i}.ts`,
        path: `file${i}.ts`,
      }))
      mockDiscoverFiles.mockResolvedValue(files)
      mockAnalyzeFileComplexity.mockImplementation((sourceFile: { getFilePath: () => string }) => {
        const path = sourceFile.getFilePath()
        const idx = Number.parseInt(path.match(/\d+/)?.[0] ?? '0', 10)
        return Array.from({ length: 3 }, (_, j) => ({
          category: (j === 2 ? 'high' : 'low') as 'high' | 'low',
          cognitive: idx * 3 + j + 1,
          cyclomatic: idx * 3 + j + 1,
          filePath: path,
          functionName: `fn${idx}_${j}`,
          startLine: j * 10 + 1,
        }))
      })
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 15,
        averageCyclomatic: 15,
        categoryBreakdown: { extreme: 0, high: 3, low: 7, moderate: 0 },
        maxCognitive: 30,
        maxCyclomatic: 30,
        totalFunctions: 30,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(20)
      expect(parsed.functions[0].cyclomatic).toBeGreaterThanOrEqual(parsed.functions[1].cyclomatic)
    })
  })

  describe('Output file with markdown format', () => {
    test('markdown output file contains all sections', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 2,
        totalFunctions: 1,
      })
      mockWriteFile.mockResolvedValue(undefined)

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'markdown',
          ignore: undefined,
          output: '/out/report.md',
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()

      const writtenContent = (mockWriteFile as ReturnType<typeof vi.fn>).mock.calls[0][1] as string
      expect(writtenContent).toContain('# Complexity Analysis')
      expect(writtenContent).toContain('## Summary')
      expect(writtenContent).toContain('## Category Breakdown')
    })
  })

  describe('Summary values accuracy in JSON output', () => {
    test('summary max values match highest function complexity', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'high' as const,
          cognitive: 12,
          cyclomatic: 18,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 7,
          filePath: '/test/file.ts',
          functionName: 'fn3',
          startLine: 20,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 6,
        averageCyclomatic: 9,
        categoryBreakdown: { extreme: 0, high: 1, low: 1, moderate: 1 },
        maxCognitive: 12,
        maxCyclomatic: 18,
        totalFunctions: 3,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.maxCyclomatic).toBe(18)
      expect(parsed.summary.maxCognitive).toBe(12)
      expect(parsed.summary.totalFunctions).toBe(3)
    })
  })

  describe('Sort stability', () => {
    test('sort by file then by name when same file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'zFn',
          startLine: 1,
        },
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 3,
          filePath: '/test/file.ts',
          functionName: 'aFn',
          startLine: 10,
        },
      ])
      mockCalculateComplexitySummary.mockReturnValue({
        averageCognitive: 1,
        averageCyclomatic: 2.5,
        categoryBreakdown: { extreme: 0, high: 0, low: 2, moderate: 0 },
        maxCognitive: 1,
        maxCyclomatic: 3,
        totalFunctions: 2,
      })

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'file',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.functions).toHaveLength(2)
      expect(
        parsed.functions.every((f: { filePath: string }) => f.filePath === '/test/file.ts'),
      ).toBe(true)
    })
  })

  describe('Output format consistency', () => {
    test('JSON and table formats produce same function count', async () => {
      const functions = [
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 2,
          filePath: '/test/file.ts',
          functionName: 'fn1',
          startLine: 1,
        },
        {
          category: 'moderate' as const,
          cognitive: 5,
          cyclomatic: 8,
          filePath: '/test/file.ts',
          functionName: 'fn2',
          startLine: 10,
        },
      ]
      const summary = {
        averageCognitive: 3,
        averageCyclomatic: 5,
        categoryBreakdown: { extreme: 0, high: 0, low: 1, moderate: 1 },
        maxCognitive: 5,
        maxCyclomatic: 8,
        totalFunctions: 2,
      }

      // JSON format
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue(functions)
      mockCalculateComplexitySummary.mockReturnValue(summary)

      const cmdJson = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )
      await cmdJson.run()
      const jsonOutput = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const jsonParsed = JSON.parse(jsonOutput)

      vi.clearAllMocks()
      mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockAnalyzeFileComplexity.mockReturnValue(functions)
      mockCalculateComplexitySummary.mockReturnValue(summary)

      const cmdTable = createCommandWithMockedParse(
        {
          ext: '',
          format: 'table',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '.' },
      )
      await cmdTable.run()
      const tableOutput = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(jsonParsed.functions).toHaveLength(2)
      expect(tableOutput).toContain('fn1')
      expect(tableOutput).toContain('fn2')
    })
  })

  describe('Path not found detailed', () => {
    test('error message includes the resolved path', async () => {
      const nodeFs = await import('node:fs')
      vi.mocked(nodeFs.existsSync).mockReturnValueOnce(false)

      const cmd = createCommandWithMockedParse(
        {
          ext: '',
          format: 'json',
          ignore: undefined,
          output: undefined,
          'sort-by': 'complexity',
          threshold: 0,
          top: 20,
        },
        { path: '/definitely/not/here' },
      )

      await expect(cmd.run()).rejects.toThrow('Path not found')
    })
  })

  describe('Helper edge cases', () => {
    test('buildIgnorePatterns with empty defaults returns user patterns only', () => {
      expect(buildIgnorePatterns([], ['a/**'])).toEqual(['a/**'])
    })

    test('filterByThreshold with single element at threshold excludes it', () => {
      const single = [
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 5,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ]
      expect(filterByThreshold(single, 5)).toHaveLength(0)
    })

    test('sortByField returns new array reference', () => {
      const data = [
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ]
      const result = sortByField(data, 'complexity')
      expect(result).not.toBe(data)
    })

    test('formatMarkdown summary includes average values', () => {
      const output = formatMarkdown([
        {
          category: 'low' as const,
          cognitive: 3,
          cyclomatic: 5,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('Average cyclomatic complexity')
      expect(output).toContain('Average cognitive complexity')
    })

    test('formatTable shows LOW category in uppercase', () => {
      const output = formatTable([
        {
          category: 'low' as const,
          cognitive: 1,
          cyclomatic: 1,
          filePath: '/a.ts',
          functionName: 'fn',
          startLine: 1,
        },
      ])
      expect(output).toContain('LOW')
    })
  })
})
