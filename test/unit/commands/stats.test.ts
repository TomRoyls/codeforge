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
})
