import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
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

  describe('run', () => {
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
})
