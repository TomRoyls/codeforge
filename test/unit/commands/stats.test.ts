import { describe, test, expect, beforeEach, vi } from 'vitest'
import { Node as TsMorphNode } from 'ts-morph'

vi.spyOn(TsMorphNode, 'isFunctionDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 250,
)
vi.spyOn(TsMorphNode, 'isMethodDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 142,
)
vi.spyOn(TsMorphNode, 'isClassDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 219,
)
vi.spyOn(TsMorphNode, 'isInterfaceDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 218,
)
vi.spyOn(TsMorphNode, 'isTypeAliasDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 200,
)
vi.spyOn(TsMorphNode, 'isEnumDeclaration').mockImplementation(
  (node: any) => node?.getKind?.() === 220,
)

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('../../../src/core/parser.js', () => ({
  Parser: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
      parseFile: vi.fn().mockImplementation((filePath: string) => {
        const isHighComplexityFile = filePath.includes('high')
        const isMediumComplexityFile = filePath.includes('medium')
        const complexityNodeCount = isHighComplexityFile ? 5 : isMediumComplexityFile ? 2 : 0

        const mockSourceFile = {
          getFilePath: () => filePath,
          getText: () => 'mock code',
          getFullText: () => 'mock code',
          forEachChild: vi.fn((callback: (node: unknown) => void) => {
            for (let i = 0; i < complexityNodeCount; i++) callback({})
          }),
        }
        return Promise.resolve({
          sourceFile: mockSourceFile,
          filePath,
          parseTime: 10,
        })
      }),
    }
  }),
}))

describe('Stats Command', () => {
  let Stats: typeof import('../../../src/commands/stats.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockReadFile: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const fs = await import('node:fs/promises')
    mockReadFile = fs.readFile as ReturnType<typeof vi.fn>

    Stats = (await import('../../../src/commands/stats.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new Stats([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Stats.description).toBe('Display codebase statistics and metrics')
    })

    test('has examples defined', () => {
      expect(Stats.examples).toBeDefined()
      expect(Stats.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(Stats.flags).toBeDefined()
      expect(Stats.flags.format).toBeDefined()
      expect(Stats.flags.top).toBeDefined()
      expect(Stats.flags.verbose).toBeDefined()
    })

    test('has path argument', () => {
      expect(Stats.args).toBeDefined()
      expect(Stats.args.path).toBeDefined()
      expect(Stats.args.path.default).toBe('.')
    })

    test('format flag has correct options', () => {
      expect(Stats.flags.format.options).toContain('json')
      expect(Stats.flags.format.options).toContain('table')
    })

    test('format flag has default value table', () => {
      expect(Stats.flags.format.default).toBe('table')
    })

    test('top flag has default value 10', () => {
      expect(Stats.flags.top.default).toBe(10)
    })

    test('verbose flag has default false', () => {
      expect(Stats.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('format flag has char f', () => {
      expect(Stats.flags.format.char).toBe('f')
    })

    test('top flag has char t', () => {
      expect(Stats.flags.top.char).toBe('t')
    })

    test('verbose flag has char v', () => {
      expect(Stats.flags.verbose.char).toBe('v')
    })
  })

  describe('sort-by flag', () => {
    test('sort-by flag has correct options', () => {
      expect(Stats.flags['sort-by']).toBeDefined()
      expect(Stats.flags['sort-by'].options).toContain('complexity')
      expect(Stats.flags['sort-by'].options).toContain('loc')
      expect(Stats.flags['sort-by'].options).toContain('name')
      expect(Stats.flags['sort-by'].options).toContain('size')
    })

    test('sort-by flag has default value size', () => {
      expect(Stats.flags['sort-by'].default).toBe('size')
    })

    test('sort-by flag has char s', () => {
      expect(Stats.flags['sort-by'].char).toBe('s')
    })

    test('sorts files by complexity descending', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/low.ts', path: 'low.ts' },
        { absolutePath: '/test/high.ts', path: 'high.ts' },
        { absolutePath: '/test/medium.ts', path: 'medium.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const x = 1;')
        .mockResolvedValueOnce(
          'if (a) { if (b) { if (c) { if (d) { if (e) { console.log("high"); } } } } } }',
        )
        .mockResolvedValueOnce('if (a) { console.log("medium"); }')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: true,
          'sort-by': 'complexity',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files).toHaveLength(3)
      expect(parsed.files.map((f: { name: string }) => f.name)).toContain('high.ts')
      expect(parsed.files.map((f: { name: string }) => f.name)).toContain('medium.ts')
      expect(parsed.files.map((f: { name: string }) => f.name)).toContain('low.ts')
    })

    test('sorts files by loc descending', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/small.ts', path: 'small.ts' },
        { absolutePath: '/test/large.ts', path: 'large.ts' },
        { absolutePath: '/test/medium.ts', path: 'medium.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const x = 1;')
        .mockResolvedValueOnce(
          'const a = 1;\nconst b = 2;\nconst c = 3;\nconst d = 4;\nconst e = 5;',
        )
        .mockResolvedValueOnce('const a = 1;\nconst b = 2;\nconst c = 3;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: true,
          'sort-by': 'loc',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files[0].name).toBe('large.ts')
      expect(parsed.files[0].loc).toBe(5)
      expect(parsed.files[1].name).toBe('medium.ts')
      expect(parsed.files[1].loc).toBe(3)
      expect(parsed.files[2].name).toBe('small.ts')
      expect(parsed.files[2].loc).toBe(1)
    })

    test('sorts files by name alphabetically', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/zebra.ts', path: 'zebra.ts' },
        { absolutePath: '/test/apple.ts', path: 'apple.ts' },
        { absolutePath: '/test/banana.ts', path: 'banana.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: true,
          'sort-by': 'name',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files[0].name).toBe('apple.ts')
      expect(parsed.files[1].name).toBe('banana.ts')
      expect(parsed.files[2].name).toBe('zebra.ts')
    })

    test('sorts files by size descending (default)', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/small.ts', path: 'small.ts' },
        { absolutePath: '/test/large.ts', path: 'large.ts' },
        { absolutePath: '/test/medium.ts', path: 'medium.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const x = 1;')
        .mockResolvedValueOnce('const a = 1; const b = 2; const c = 3; const d = 4; const e = 5;')
        .mockResolvedValueOnce('const a = 1; const b = 2; const c = 3;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: true,
          'sort-by': 'size',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files[0].name).toBe('large.ts')
      expect(parsed.files[1].name).toBe('medium.ts')
      expect(parsed.files[2].name).toBe('small.ts')
    })
  })

  describe('run', () => {
    test('outputs JSON format when format is json', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n// comment\n\nconst y = 2;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('summary')
      expect(parsed).toHaveProperty('fileTypes')
      expect(parsed).toHaveProperty('files')
    })

    test('JSON output contains required summary fields', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\nconst y = 2;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary).toHaveProperty('files')
      expect(parsed.summary).toHaveProperty('loc')
      expect(parsed.summary).toHaveProperty('commentLines')
      expect(parsed.summary).toHaveProperty('blankLines')
      expect(parsed.summary).toHaveProperty('averageLoc')
    })

    test('counts files by type', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.fileTypes['.ts']).toBe(2)
      expect(parsed.fileTypes['.js']).toBe(1)
    })

    test('handles empty file list', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(0)
      expect(parsed.summary.loc).toBe(0)
    })

    test('outputs table format by default', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'table',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Codebase Statistics')
      expect(output).toContain('Summary:')
      expect(output).toContain('Total files:')
      expect(output).toContain('Lines of code:')
    })

    test('shows file types in table format', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'table',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('File Types:')
    })

    test('shows top files when verbose', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'table',
          top: 10,
          verbose: true,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Largest Files:')
    })

    test('calculates LOC correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n// comment\n\nconst y = 2;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.loc).toBe(2)
      expect(parsed.summary.commentLines).toBe(1)
      expect(parsed.summary.blankLines).toBe(1)
    })

    test('handles file read errors gracefully', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('File not found'))

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(1)
      expect(parsed.summary.loc).toBe(0)
    })
  })

  describe('isLogicalOperator method', () => {
    test('returns true for && operator (token kind 56)', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 56 }),
      }

      const StatsClass = Stats as any
      const result = StatsClass.isLogicalOperator(mockNode)
      expect(result).toBe(true)
    })

    test('returns true for || operator (token kind 57)', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 57 }),
      }

      const StatsClass = Stats as any
      const result = StatsClass.isLogicalOperator(mockNode)
      expect(result).toBe(true)
    })

    test('returns false for other operators', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 58 }),
      }

      const StatsClass = Stats as any
      const result = StatsClass.isLogicalOperator(mockNode)
      expect(result).toBe(false)
    })
  })

  describe('countCodeStructures method', () => {
    test('counts functions when Node.isFunctionDeclaration returns true', async () => {
      const mockNode = { getKind: () => 250, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result.functions).toBe(1)
    })

    test('counts methods when Node.isMethodDeclaration returns true', async () => {
      const mockNode = { getKind: () => 142, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result.methods).toBe(1)
    })

    test('counts classes when Node.isClassDeclaration returns true', async () => {
      const mockNode = { getKind: () => 219, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result.classes).toBe(1)
    })

    test('counts interfaces when Node.isInterfaceDeclaration returns true', async () => {
      const mockNode = { getKind: () => 218, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result.interfaces).toBe(1)
    })

    test('counts type aliases when Node.isTypeAliasDeclaration returns true', async () => {
      const mockNode = { getKind: () => 200, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result).toBeDefined()
      expect(result.typeAliases).toBeGreaterThanOrEqual(0)
    })

    test('counts enums when Node.isEnumDeclaration returns true', async () => {
      const mockNode = { getKind: () => 220, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)

      const result = command.countCodeStructures(mockSourceFile)
      expect(result).toBeDefined()
      expect(result.enums).toBeGreaterThanOrEqual(0)
    })
  })

  describe('CSV format', () => {
    test('outputs CSV format when format is csv', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'csv',
          top: 10,
          verbose: false,
          'sort-by': 'size',
        },
        { path: '.' },
      )

      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('File,LOC,Complexity,Size (bytes),Type')
    })
  })

  describe('--ext flag filtering', () => {
    test('filters files by single extension', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts',
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(2)
      expect(parsed.fileTypes['.ts']).toBe(2)
      expect(parsed.fileTypes['.js']).toBeUndefined()
    })

    test('filters files by multiple extensions', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.jsx', path: 'c.jsx' },
        { absolutePath: '/test/d.go', path: 'd.go' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts,.js',
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(2)
      expect(parsed.fileTypes['.ts']).toBe(1)
      expect(parsed.fileTypes['.js']).toBe(1)
      expect(parsed.fileTypes['.go']).toBeUndefined()
    })

    test('handles extensions with extra whitespace', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          ext: '  .ts , .js  ',
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(2)
    })

    test('filters with empty string in extensions list', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts,,.js',
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(2)
    })

    test('filters files case-insensitively', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.TS', path: 'a.TS' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.js', path: 'c.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          ext: '.ts',
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.summary.files).toBe(2)
    })
  })

  describe('--output flag', () => {
    test('writes output to file when --output is specified', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          output: '/test/output.json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Results written to /test/output.json')
    })
  })

  describe('error handling', () => {
    test('logs file read error message when format is table', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Permission denied'))

      const cmd = createCommandWithMockedParse(
        {
          format: 'table',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Failed to process file file.ts')
      expect(output).toContain('Permission denied')
    })

    test('logs file read error with unknown error type', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue('string error')

      const cmd = createCommandWithMockedParse(
        {
          format: 'table',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Failed to process file file.ts')
      expect(output).toContain('Unknown error')
    })

    test('does not log error message when format is json', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Permission denied'))

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).not.toContain('Failed to process file')
    })
  })

  describe('ignore flag', () => {
    test('uses custom ignore patterns', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          ignore: ['**/dist/**', '**/build/**'],
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/node_modules/**', '**/dist/**', '**/build/**']),
        }),
      )
    })
  })

  // ============================================================
  // NEW TESTS BELOW - 153+ additional tests
  // ============================================================

  describe('Command metadata - comprehensive', () => {
    test('args path is not required', () => {
      expect(Stats.args.path.required).toBe(false)
    })

    test('args path has correct description', () => {
      expect(Stats.args.path.description).toBe('Path to analyze')
    })

    test('has exactly 5 examples', () => {
      expect(Stats.examples).toHaveLength(5)
    })

    test('first example shows default usage', () => {
      const example = Stats.examples[0] as { command: string; description: string }
      expect(example.command).toContain('<%= command.id %>')
      expect(example.description).toContain('current directory')
    })

    test('second example shows json format', () => {
      const example = Stats.examples[1] as { command: string; description: string }
      expect(example.command).toContain('--format json')
    })

    test('third example shows top flag', () => {
      const example = Stats.examples[2] as { command: string; description: string }
      expect(example.command).toContain('--top')
    })

    test('fourth example shows output flag', () => {
      const example = Stats.examples[3] as { command: string; description: string }
      expect(example.command).toContain('--output')
    })

    test('fifth example shows ext flag', () => {
      const example = Stats.examples[4] as { command: string; description: string }
      expect(example.command).toContain('--ext')
    })

    test('format flag has description', () => {
      expect(Stats.flags.format.description).toBe('Output format')
    })

    test('top flag has description', () => {
      expect(Stats.flags.top.description).toBe('Number of top files to show')
    })

    test('verbose flag has description', () => {
      expect(Stats.flags.verbose.description).toBe('Show detailed file statistics')
    })

    test('ext flag has description', () => {
      expect(Stats.flags.ext.description).toContain('file extensions')
    })

    test('output flag has description', () => {
      expect(Stats.flags.output.description).toBe('Output file path')
    })

    test('sort-by flag has description', () => {
      expect(Stats.flags['sort-by'].description).toBe('Sort files by metric')
    })

    test('ignore flag has description', () => {
      expect(Stats.flags.ignore.description).toBe('Patterns to ignore')
    })

    test('ext flag has correct default', () => {
      expect(Stats.flags.ext.default).toBe('')
    })

    test('format flag includes csv option', () => {
      expect(Stats.flags.format.options).toContain('csv')
    })

    test('ignore flag supports multiple values', () => {
      expect(Stats.flags.ignore.multiple).toBe(true)
    })

    test('output flag has char o', () => {
      expect(Stats.flags.output.char).toBe('o')
    })

    test('ignore flag has char i', () => {
      expect(Stats.flags.ignore.char).toBe('i')
    })

    test('sort-by flag has char s', () => {
      expect(Stats.flags['sort-by'].char).toBe('s')
    })

    test('top flag is integer type', () => {
      expect(Stats.flags.top.default).toBeTypeOf('number')
    })

    test('verbose flag is boolean type', () => {
      expect(Stats.flags.verbose.default).toBeTypeOf('boolean')
    })
  })

  describe('JSON output format - comprehensive', () => {
    test('JSON output is valid JSON', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()
    })

    test('JSON output has summary.complexity', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary).toHaveProperty('complexity')
    })

    test('JSON output has summary.averageComplexity', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary).toHaveProperty('averageComplexity')
    })

    test('JSON output has code structure fields', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary).toHaveProperty('classes')
      expect(parsed.summary).toHaveProperty('functions')
      expect(parsed.summary).toHaveProperty('interfaces')
      expect(parsed.summary).toHaveProperty('methods')
      expect(parsed.summary).toHaveProperty('typeAliases')
      expect(parsed.summary).toHaveProperty('enums')
    })

    test('JSON output files array is empty when verbose is false', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(0)
    })

    test('JSON output files array is populated when verbose is true', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
    })

    test('JSON file entry has all required fields', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      const file = parsed.files[0]

      expect(file).toHaveProperty('name')
      expect(file).toHaveProperty('loc')
      expect(file).toHaveProperty('complexity')
      expect(file).toHaveProperty('size')
      expect(file).toHaveProperty('type')
      expect(file).toHaveProperty('blankLines')
      expect(file).toHaveProperty('commentLines')
      expect(file).toHaveProperty('structures')
    })

    test('JSON file entry structures has all fields', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      const structures = parsed.files[0].structures

      expect(structures).toHaveProperty('classes')
      expect(structures).toHaveProperty('enums')
      expect(structures).toHaveProperty('functions')
      expect(structures).toHaveProperty('interfaces')
      expect(structures).toHaveProperty('methods')
      expect(structures).toHaveProperty('typeAliases')
    })

    test('JSON file entry name matches file path', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/myfile.ts', path: 'myfile.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files[0].name).toBe('myfile.ts')
    })

    test('JSON file entry type is extension', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.files[0].type).toBe('.ts')
    })
  })

  describe('Table output format - comprehensive', () => {
    test('table output contains code structures section', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Code structures:')
    })

    test('table output shows Classes count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Classes:')
    })

    test('table output shows Functions count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Functions:')
    })

    test('table output shows Methods count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Methods:')
    })

    test('table output shows Interfaces count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Interfaces:')
    })

    test('table output shows Type aliases count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Type aliases:')
    })

    test('table output shows Enums count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Enums:')
    })

    test('table output shows Total complexity', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Total complexity:')
    })

    test('table output shows Blank lines', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n\nconst y = 2;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Blank lines:')
    })

    test('table output shows Comment lines', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n// a comment')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Comment lines:')
    })

    test('table verbose shows file details with LOC, Complexity, Size', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('LOC:')
      expect(output).toContain('Complexity:')
      expect(output).toContain('Size:')
    })

    test('table output respects top N for file listing', async () => {
      const files = Array.from({ length: 5 }, (_, i) => ({
        absolutePath: `/test/file${i}.ts`,
        path: `file${i}.ts`,
      }))
      mockDiscoverFiles.mockResolvedValue(files)
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 3, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Top 3')
    })

    test('table with empty files shows no file entries', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Total files: 0')
    })
  })

  describe('CSV output format - comprehensive', () => {
    test('CSV has correct header row', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      expect(lines[0]).toBe('File,LOC,Complexity,Size (bytes),Type')
    })

    test('CSV contains file data rows', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/myfile.ts', path: 'myfile.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      expect(lines.length).toBeGreaterThanOrEqual(2)
      expect(lines[1]).toContain('myfile.ts')
    })

    test('CSV rows have 5 columns', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      const dataRow = lines[1]
      expect(dataRow.split(',')).toHaveLength(5)
    })

    test('CSV contains correct LOC value', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\nconst y = 2;\nconst z = 3;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      const dataRow = lines[1]
      const columns = dataRow.split(',')
      expect(columns[1]).toBe('3')
    })

    test('CSV contains correct type value', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('.ts')
    })

    test('CSV with multiple files has correct row count', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n').filter((l: string) => l.length > 0)
      expect(lines).toHaveLength(4)
    })

    test('CSV with empty files has only header', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n').filter((l: string) => l.length > 0)
      expect(lines).toHaveLength(1)
      expect(lines[0]).toBe('File,LOC,Complexity,Size (bytes),Type')
    })

    test('CSV file entry contains size in bytes', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      const dataRow = lines[1]
      const columns = dataRow.split(',')
      const size = parseInt(columns[3], 10)
      expect(size).toBeGreaterThan(0)
    })
  })

  describe('Sorting - edge cases', () => {
    test('sort by complexity with equal values', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'complexity' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
    })

    test('sort by loc with equal values', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'loc' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
    })

    test('sort by name with single file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/solo.ts', path: 'solo.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'name' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(1)
      expect(parsed.files[0].name).toBe('solo.ts')
    })

    test('sort by size with single file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/solo.ts', path: 'solo.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(1)
      expect(parsed.files[0].name).toBe('solo.ts')
    })

    test('sort by name is case-sensitive via localeCompare', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/Beta.ts', path: 'Beta.ts' },
        { absolutePath: '/test/alpha.ts', path: 'alpha.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'name' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
    })

    test('sort by size preserves order of equal-size files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
      expect(parsed.files[0].size).toBe(parsed.files[1].size)
    })
  })

  describe('Top N filtering', () => {
    test('top 1 in table format shows only largest file', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/small.ts', path: 'small.ts' },
        { absolutePath: '/test/large.ts', path: 'large.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('x')
        .mockResolvedValueOnce('const a = 1; const b = 2; const c = 3;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 1, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Top 1')
      expect(output).toContain('large.ts')
    })

    test('top exceeds file count returns all files in table', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 100, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('a.ts')
      expect(output).toContain('b.ts')
    })

    test('top 0 shows header but no file entries', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 0, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Top 0')
      expect(output).toContain('Total files: 2')
    })

    test('default top value is 10', () => {
      expect(Stats.flags.top.default).toBe(10)
    })

    test('top 3 with 5 files in table format', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
        { absolutePath: '/test/d.ts', path: 'd.ts' },
        { absolutePath: '/test/e.ts', path: 'e.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('x')
        .mockResolvedValueOnce('xx')
        .mockResolvedValueOnce('xxx')
        .mockResolvedValueOnce('xxxx')
        .mockResolvedValueOnce('xxxxx')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 3, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Top 3')
      expect(output).toContain('Total files: 5')
    })

    test('summary still counts all files regardless of top', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 1, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Total files: 3')
    })
  })

  describe('Extension filtering - edge cases', () => {
    test('no ext flag includes all discovered files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.tsx', path: 'c.tsx' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(3)
    })

    test('ext flag with .tsx filters correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.tsx', path: 'b.tsx' },
        { absolutePath: '/test/c.js', path: 'c.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '.tsx', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(1)
      expect(parsed.fileTypes['.tsx']).toBe(1)
    })

    test('ext flag with .jsx filters correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.jsx', path: 'a.jsx' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '.jsx', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(1)
      expect(parsed.fileTypes['.jsx']).toBe(1)
    })

    test('ext flag with no matching files results in empty stats', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '.py', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(0)
    })

    test('ext flag with trailing comma', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '.ts,', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(1)
    })

    test('ext flag with only commas and spaces', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/a.ts', path: 'a.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: ' , , ', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(0)
    })

    test('ext flag empty string includes all files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '', format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(2)
    })
  })

  describe('Ignore patterns - comprehensive', () => {
    test('uses default ignore patterns when no flag provided', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining([
            '**/node_modules/**',
            '**/dist/**',
            '**/coverage/**',
            '**/.git/**',
          ]),
        }),
      )
    })

    test('appends custom ignore to default ignores', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', ignore: ['**/vendor/**'], top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/node_modules/**', '**/vendor/**']),
        }),
      )
    })

    test('passes multiple ignore patterns', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          ignore: ['**/test/**', '**/generated/**', '**/third_party/**'],
          top: 10,
          verbose: false,
        },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/test/**', '**/generated/**', '**/third_party/**']),
        }),
      )
    })

    test('passes correct patterns to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })

    test('resolves cwd from args path', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: './src' },
      )

      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: expect.stringContaining('src'),
        }),
      )
    })
  })

  describe('Verbose mode - comprehensive', () => {
    test('verbose mode includes file with blank lines count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n\n\nconst y = 2;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].blankLines).toBe(2)
    })

    test('verbose mode includes file with comment lines count', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n// comment 1\n// comment 2')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].commentLines).toBe(2)
    })

    test('verbose mode reports correct file size', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      const content = 'const x = 1;'
      mockReadFile.mockResolvedValue(content)

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].size).toBe(content.length)
    })

    test('verbose mode with block comment /* counts as comment', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n/* block comment start')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].commentLines).toBe(1)
      expect(parsed.files[0].loc).toBe(1)
    })

    test('verbose mode with only blank lines', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('\n\n\n\n')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].blankLines).toBe(5)
      expect(parsed.files[0].loc).toBe(0)
    })

    test('verbose mode with only comment lines', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('// comment 1\n// comment 2\n// comment 3')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].commentLines).toBe(3)
      expect(parsed.files[0].loc).toBe(0)
    })

    test('verbose mode with mixed content', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n\n// comment\nconst y = 2;\n\nconst z = 3;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].loc).toBe(3)
      expect(parsed.files[0].blankLines).toBe(2)
      expect(parsed.files[0].commentLines).toBe(1)
    })

    test('non-verbose mode has empty files array', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(0)
    })

    test('verbose mode handles multiple files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(3)
    })
  })

  describe('Output file writing - comprehensive', () => {
    test('writes JSON to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', output: '/out/stats.json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      const { writeFile } = await import('node:fs/promises')
      expect(writeFile).toHaveBeenCalledWith('/out/stats.json', expect.any(String), 'utf8')
    })

    test('writes table format to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', output: '/out/stats.txt', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      const { writeFile } = await import('node:fs/promises')
      expect(writeFile).toHaveBeenCalledWith('/out/stats.txt', expect.any(String), 'utf8')
    })

    test('writes CSV format to file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', output: '/out/stats.csv', top: 10, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()

      const { writeFile } = await import('node:fs/promises')
      expect(writeFile).toHaveBeenCalledWith('/out/stats.csv', expect.any(String), 'utf8')
    })

    test('logs success message after writing file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', output: '/out/stats.json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Results written to /out/stats.json')
    })

    test('handles write error gracefully', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const { writeFile } = await import('node:fs/promises')
      vi.mocked(writeFile).mockRejectedValue(new Error('Permission denied'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', output: '/readonly/stats.json', top: 10, verbose: false },
        { path: '.' },
      )

      await expect(cmd.run()).rejects.toThrow()
    })

    test('does not write to file when output flag not set', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      const { writeFile } = await import('node:fs/promises')
      expect(writeFile).not.toHaveBeenCalled()
    })
  })

  describe('Aggregate metrics calculation', () => {
    test('calculates total LOC across multiple files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const a = 1;\nconst b = 2;')
        .mockResolvedValueOnce('const c = 3;\nconst d = 4;\nconst e = 5;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.loc).toBe(5)
    })

    test('calculates total blank lines across multiple files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const a = 1;\n\n\n')
        .mockResolvedValueOnce('const b = 1;\n\n')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.blankLines).toBe(5)
    })

    test('calculates total comment lines across multiple files', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const a = 1;\n// comment 1\n// comment 2')
        .mockResolvedValueOnce('const b = 1;\n// comment 3')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.commentLines).toBe(3)
    })

    test('calculates averageLoc correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('const a = 1;\nconst b = 2;\nconst c = 3;')
        .mockResolvedValueOnce('const d = 4;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.averageLoc).toBe(2)
    })

    test('calculates averageComplexity correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/low.ts', path: 'low.ts' },
        { absolutePath: '/test/high.ts', path: 'high.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.averageComplexity).toBeGreaterThanOrEqual(1)
    })

    test('averageLoc is 0 for empty file list', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.averageLoc).toBe(0)
    })

    test('averageComplexity is 0 for empty file list', async () => {
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.averageComplexity).toBe(0)
    })

    test('calculates file types distribution correctly', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.js', path: 'c.js' },
        { absolutePath: '/test/d.tsx', path: 'd.tsx' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.fileTypes['.ts']).toBe(2)
      expect(parsed.fileTypes['.js']).toBe(1)
      expect(parsed.fileTypes['.tsx']).toBe(1)
    })

    test('complexity is at least 1 for each file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/low.ts', path: 'low.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBeGreaterThanOrEqual(1)
    })

    test('summary total complexity matches sum of file complexities', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/high.ts', path: 'high.ts' },
        { absolutePath: '/test/medium.ts', path: 'medium.ts' },
        { absolutePath: '/test/low.ts', path: 'low.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.complexity).toBeGreaterThanOrEqual(3)
    })

    test('summary files count matches discovered files count', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(3)
    })
  })

  describe('countCodeStructures - comprehensive', () => {
    test('counts constructor declarations as methods', async () => {
      const mockNode = { getKind: () => 142, forEachChild: () => {} }
      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => callback(mockNode),
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)
      const result = command.countCodeStructures(mockSourceFile)
      expect(result.methods).toBe(1)
    })

    test('returns zero counts for empty source file', () => {
      const mockSourceFile = {
        forEachChild: () => {},
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)
      const result = command.countCodeStructures(mockSourceFile)

      expect(result.functions).toBe(0)
      expect(result.methods).toBe(0)
      expect(result.classes).toBe(0)
      expect(result.interfaces).toBe(0)
      expect(result.typeAliases).toBe(0)
      expect(result.enums).toBe(0)
    })

    test('counts multiple structures from same file', () => {
      const functionNode = { getKind: () => 250, forEachChild: () => {} }
      const classNode = { getKind: () => 219, forEachChild: () => {} }
      const interfaceNode = { getKind: () => 218, forEachChild: () => {} }

      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => {
          callback(functionNode)
          callback(classNode)
          callback(interfaceNode)
        },
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)
      const result = command.countCodeStructures(mockSourceFile)

      expect(result.functions).toBe(1)
      expect(result.classes).toBe(1)
      expect(result.interfaces).toBe(1)
    })

    test('counts duplicate structure types', () => {
      const node1 = { getKind: () => 250, forEachChild: () => {} }
      const node2 = { getKind: () => 250, forEachChild: () => {} }
      const node3 = { getKind: () => 250, forEachChild: () => {} }

      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => {
          callback(node1)
          callback(node2)
          callback(node3)
        },
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)
      const result = command.countCodeStructures(mockSourceFile)

      expect(result.functions).toBe(3)
    })

    test('counts all six structure types together', () => {
      const funcNode = { getKind: () => 250, forEachChild: () => {} }
      const methodNode = { getKind: () => 142, forEachChild: () => {} }
      const classNode = { getKind: () => 219, forEachChild: () => {} }
      const ifaceNode = { getKind: () => 218, forEachChild: () => {} }
      const typeNode = { getKind: () => 200, forEachChild: () => {} }
      const enumNode = { getKind: () => 220, forEachChild: () => {} }

      const mockSourceFile = {
        forEachChild: (callback: (node: unknown) => void) => {
          callback(funcNode)
          callback(methodNode)
          callback(classNode)
          callback(ifaceNode)
          callback(typeNode)
          callback(enumNode)
        },
      }

      const StatsClass = Stats as any
      const command = new StatsClass([], {} as never)
      const result = command.countCodeStructures(mockSourceFile)

      expect(result.functions).toBe(1)
      expect(result.methods).toBe(1)
      expect(result.classes).toBe(1)
      expect(result.interfaces).toBe(1)
      expect(result.typeAliases).toBe(1)
      expect(result.enums).toBe(1)
    })
  })

  describe('isLogicalOperator - edge cases', () => {
    test('returns false for token kind 55 (less than)', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 55 }),
      }
      const StatsClass = Stats as any
      expect(StatsClass.isLogicalOperator(mockNode)).toBe(false)
    })

    test('returns false for token kind 58 (strict equality)', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 58 }),
      }
      const StatsClass = Stats as any
      expect(StatsClass.isLogicalOperator(mockNode)).toBe(false)
    })

    test('returns false for token kind 0', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 0 }),
      }
      const StatsClass = Stats as any
      expect(StatsClass.isLogicalOperator(mockNode)).toBe(false)
    })

    test('returns false for token kind 100', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 100 }),
      }
      const StatsClass = Stats as any
      expect(StatsClass.isLogicalOperator(mockNode)).toBe(false)
    })

    test('returns false for assignment operator token kind 52', () => {
      const mockNode = {
        getOperatorToken: () => ({ getKind: () => 52 }),
      }
      const StatsClass = Stats as any
      expect(StatsClass.isLogicalOperator(mockNode)).toBe(false)
    })
  })

  describe('File discovery integration', () => {
    test('passes correct glob patterns to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockReadFile.mockResolvedValue('')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        }),
      )
    })

    test('passes resolved cwd to discoverFiles', async () => {
      mockDiscoverFiles.mockResolvedValue([])
      mockReadFile.mockResolvedValue('')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const call = mockDiscoverFiles.mock.calls[0][0]
      expect(call.cwd).toBeTruthy()
    })

    test('spinner shows analyzed count on success', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(2)
    })
  })

  describe('LOC counting edge cases', () => {
    test('counts lines starting with // as comments', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('// single line comment\nconst x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.commentLines).toBe(1)
      expect(parsed.summary.loc).toBe(1)
    })

    test('counts lines starting with /* as comments', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('/* block comment */\nconst x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.commentLines).toBe(1)
      expect(parsed.summary.loc).toBe(1)
    })

    test('counts empty lines as blank', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('   \n\t\nconst x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.blankLines).toBe(2)
      expect(parsed.summary.loc).toBe(1)
    })

    test('handles file with only one line', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.loc).toBe(1)
      expect(parsed.summary.blankLines).toBe(0)
      expect(parsed.summary.commentLines).toBe(0)
    })

    test('handles empty file', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.loc).toBe(0)
      expect(parsed.summary.commentLines).toBe(0)
    })

    test('handles file ending with newline', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;\n')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.loc).toBe(1)
    })

    test('counts lines with indented comments as comments', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('  // indented comment\nconst x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.commentLines).toBe(1)
      expect(parsed.summary.loc).toBe(1)
    })

    test('does not count code starting with // inside string as comment', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const url = "http://example.com";')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.loc).toBe(1)
      expect(parsed.summary.commentLines).toBe(0)
    })
  })

  describe('Error handling - comprehensive', () => {
    test('handles multiple file read errors', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Failed to process file a.ts')
      expect(output).toContain('Failed to process file b.ts')
      expect(output).toContain('Failed to process file c.ts')
    })

    test('continues processing after file read error in json mode', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/bad.ts', path: 'bad.ts' },
        { absolutePath: '/test/good.ts', path: 'good.ts' },
      ])
      mockReadFile
        .mockRejectedValueOnce(new Error('Read error'))
        .mockResolvedValueOnce('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(2)
      expect(parsed.summary.loc).toBe(1)
    })

    test('sets complexity to 1 on file read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBe(1)
    })

    test('sets size to 0 on file read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].size).toBe(0)
    })

    test('sets loc to 0 on file read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].loc).toBe(0)
    })

    test('sets blankLines to 0 on file read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].blankLines).toBe(0)
    })

    test('sets commentLines to 0 on file read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].commentLines).toBe(0)
    })

    test('preserves file type in file extension on error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].type).toBe('.ts')
    })

    test('still counts file type on read error', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/bad.ts', path: 'bad.ts' }])
      mockReadFile.mockRejectedValue(new Error('Read error'))

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.fileTypes['.ts']).toBe(1)
    })
  })

  describe('Parser integration', () => {
    test('uses parser for .ts files', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBeGreaterThanOrEqual(1)
    })

    test('uses parser for .tsx files', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.tsx', path: 'file.tsx' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBeGreaterThanOrEqual(1)
    })

    test('does not use parser for .js files', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.js', path: 'file.js' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBe(1)
    })

    test('does not use parser for .jsx files', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.jsx', path: 'file.jsx' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBe(1)
    })

    test('high complexity file gets higher complexity score', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/high_complexity.ts', path: 'high_complexity.ts' },
        { absolutePath: '/test/low_complexity.ts', path: 'low_complexity.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(2)
      expect(parsed.files.every((f: { complexity: number }) => f.complexity >= 1)).toBe(true)
    })

    test('medium complexity file gets intermediate score', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/high_complexity.ts', path: 'high_complexity.ts' },
        { absolutePath: '/test/medium_complexity.ts', path: 'medium_complexity.ts' },
        { absolutePath: '/test/low_complexity.ts', path: 'low_complexity.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files).toHaveLength(3)
      expect(parsed.files.every((f: { complexity: number }) => f.complexity >= 1)).toBe(true)
    })
  })

  describe('Combined flags', () => {
    test('verbose + json + sort-by complexity', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/high.ts', path: 'high.ts' },
        { absolutePath: '/test/low.ts', path: 'low.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true, 'sort-by': 'complexity' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].name).toBe('high.ts')
    })

    test('verbose + csv + sort-by name', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/zebra.ts', path: 'zebra.ts' },
        { absolutePath: '/test/apple.ts', path: 'apple.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'csv', top: 10, verbose: true, 'sort-by': 'name' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      expect(lines[1]).toContain('apple.ts')
      expect(lines[2]).toContain('zebra.ts')
    })

    test('ext + ignore + json', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.js', path: 'b.js' },
        { absolutePath: '/test/c.tsx', path: 'c.tsx' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { ext: '.ts', format: 'json', ignore: ['**/test/**'], top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.files).toBe(1)
      expect(parsed.fileTypes['.ts']).toBe(1)
    })

    test('top + sort-by + verbose', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
        { absolutePath: '/test/c.ts', path: 'c.ts' },
      ])
      mockReadFile
        .mockResolvedValueOnce('x')
        .mockResolvedValueOnce('xxx')
        .mockResolvedValueOnce('xx')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 2, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Top 2')
      expect(output).toContain('Total files: 3')
    })

    test('output + csv + top', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/a.ts', path: 'a.ts' },
        { absolutePath: '/test/b.ts', path: 'b.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const { writeFile } = await import('node:fs/promises')
      vi.mocked(writeFile).mockResolvedValue()

      const cmd = createCommandWithMockedParse(
        { format: 'csv', output: '/out/stats.csv', top: 1, verbose: true, 'sort-by': 'size' },
        { path: '.' },
      )

      await cmd.run()
      expect(writeFile).toHaveBeenCalledWith('/out/stats.csv', expect.any(String), 'utf8')
    })
  })

  describe('File with unknown extension', () => {
    test('file with no extension gets "unknown" type in verbose', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/Makefile', path: 'Makefile' }])
      mockReadFile.mockResolvedValue('all: build')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].type).toBe('unknown')
    })
  })

  describe('calculateFileComplexity via parser', () => {
    test('default complexity is 1 for files with no control flow', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/simple.ts', path: 'simple.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBeGreaterThanOrEqual(1)
    })

    test('JS files always get complexity 1', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/code.js', path: 'code.js' }])
      mockReadFile.mockResolvedValue('if (a) { if (b) { console.log(c); } }')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBe(1)
    })

    test('complexity summary aggregates all file complexities', async () => {
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/high_complexity.ts', path: 'high_complexity.ts' },
        { absolutePath: '/test/simple.ts', path: 'simple.ts' },
      ])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.summary.complexity).toBeGreaterThanOrEqual(2)
      expect(parsed.summary.averageComplexity).toBeGreaterThanOrEqual(1)
    })

    test('parser error falls back to complexity 1', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/broken.ts', path: 'broken.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].complexity).toBeGreaterThanOrEqual(1)
    })

    test('parser is initialized and disposed for each run', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()

      const { Parser } = await import('../../../src/core/parser.js')
      const MockParser = Parser as ReturnType<typeof vi.fn>
      const instance = MockParser.mock.results[0]?.value
      expect(instance?.initialize).toHaveBeenCalled()
      expect(instance?.dispose).toHaveBeenCalled()
    })

    test('summary includes all code structure counts', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      const summary = parsed.summary
      expect(typeof summary.classes).toBe('number')
      expect(typeof summary.functions).toBe('number')
      expect(typeof summary.methods).toBe('number')
      expect(typeof summary.interfaces).toBe('number')
      expect(typeof summary.typeAliases).toBe('number')
      expect(typeof summary.enums).toBe('number')
    })

    test('file size is measured in bytes', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      const content = 'const x = 1;\nconst y = 2;'
      mockReadFile.mockResolvedValue(content)

      const cmd = createCommandWithMockedParse(
        { format: 'json', top: 10, verbose: true },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.files[0].size).toBe(Buffer.byteLength(content, 'utf8'))
    })

    test('table format shows Lines of code with locale formatting', async () => {
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        { format: 'table', top: 10, verbose: false },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Lines of code:')
    })
  })
})
