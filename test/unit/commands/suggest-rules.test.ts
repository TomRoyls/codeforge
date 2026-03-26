import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('../../../src/rules/index.js', () => ({
  getRuleCategory: vi.fn((ruleId: string) => {
    const categories: Record<string, string> = {
      'no-console-log': 'patterns',
      'no-explicit-any': 'patterns',
      'prefer-const': 'patterns',
      'eq-eq-eq': 'patterns',
      'no-eval': 'security',
      'no-magic-numbers': 'patterns',
      'max-depth': 'complexity',
    }
    return categories[ruleId] ?? 'patterns'
  }),
}))

describe('SuggestRules Command', () => {
  let SuggestRules: typeof import('../../../src/commands/suggest-rules.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>
  let mockExistsSync: ReturnType<typeof vi.fn>
  let mockReadFile: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const fileDiscovery = await import('../../../src/core/file-discovery.js')
    mockDiscoverFiles = fileDiscovery.discoverFiles as ReturnType<typeof vi.fn>

    const fs = await import('node:fs')
    mockExistsSync = fs.existsSync as ReturnType<typeof vi.fn>

    const fsPromises = await import('node:fs/promises')
    mockReadFile = fsPromises.readFile as ReturnType<typeof vi.fn>

    SuggestRules = (await import('../../../src/commands/suggest-rules.js')).default
  })

  function createCommandWithMockedParse(
    flags: Record<string, unknown>,
    args: Record<string, unknown> = {},
  ) {
    const command = new SuggestRules([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args,
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(SuggestRules.description).toBe(
        'Analyze codebase and suggest which rules would be most beneficial',
      )
    })

    test('has examples defined', () => {
      expect(SuggestRules.examples).toBeDefined()
      expect(SuggestRules.examples.length).toBeGreaterThan(0)
    })

    test('has all required flags', () => {
      expect(SuggestRules.flags).toBeDefined()
      expect(SuggestRules.flags.format).toBeDefined()
      expect(SuggestRules.flags.top).toBeDefined()
      expect(SuggestRules.flags.verbose).toBeDefined()
      expect(SuggestRules.flags.impact).toBeDefined()
    })

    test('has path argument', () => {
      expect(SuggestRules.args).toBeDefined()
      expect(SuggestRules.args.path).toBeDefined()
      expect(SuggestRules.args.path.default).toBe('.')
    })

    test('format flag has correct options', () => {
      expect(SuggestRules.flags.format.options).toContain('json')
      expect(SuggestRules.flags.format.options).toContain('console')
    })

    test('format flag has default value console', () => {
      expect(SuggestRules.flags.format.default).toBe('console')
    })

    test('top flag has default value 15', () => {
      expect(SuggestRules.flags.top.default).toBe(15)
    })

    test('verbose flag has default false', () => {
      expect(SuggestRules.flags.verbose.default).toBe(false)
    })
  })

  describe('Flag characters', () => {
    test('verbose flag has char v', () => {
      expect(SuggestRules.flags.verbose.char).toBe('v')
    })
  })

  describe('run', () => {
    test('errors when path does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '/nonexistent' },
      )

      await expect(cmd.run()).rejects.toThrow('Path does not exist')
    })

    test('handles empty file list', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      expect(mockDiscoverFiles).toHaveBeenCalled()
    })

    test('outputs JSON format when format is json', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(Array.isArray(parsed)).toBe(true)
    })

    test('detects console.log pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const consoleRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(consoleRule).toBeDefined()
      expect(consoleRule.estimatedViolations).toBeGreaterThan(0)
    })

    test('detects explicit any pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('const x: any = 1;')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const anyRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-explicit-any')
      expect(anyRule).toBeDefined()
    })

    test('detects loose equality pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const eqRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'eq-eq-eq')
      expect(eqRule).toBeDefined()
    })

    test('detects eval pattern', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('eval("code");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const evalRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-eval')
      expect(evalRule).toBeDefined()
      expect(evalRule.impact).toBe('high')
    })

    test('filters by impact level', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test"); if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: 'high',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.every((r: { impact: string }) => r.impact === 'high')).toBe(true)
    })

    test('limits output to top N suggestions', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockResolvedValue(
        'console.log("test"); eval("code"); if (a == b) {} const x: any = 1;',
      )

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 2,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      expect(parsed.length).toBeLessThanOrEqual(2)
    })

    test('outputs console format by default', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Rule Suggestions')
    })

    test('shows verbose output when enabled', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'console',
          top: 15,
          verbose: true,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Enable with:')
    })

    test('handles file read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('file2')) return Promise.reject(new Error('Read error'))
        return Promise.resolve('console.log("test");')
      })

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: true,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Skipping file')
    })

    test('sorts suggestions by impact and confidence', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([{ absolutePath: '/test/file.ts', path: 'file.ts' }])
      mockReadFile.mockResolvedValue('console.log("test"); eval("code"); if (a == b) {}')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const impacts = parsed.map((r: { impact: string }) => r.impact)
      const highIndex = impacts.indexOf('high')
      const mediumIndex = impacts.indexOf('medium')

      if (highIndex !== -1 && mediumIndex !== -1) {
        expect(highIndex).toBeLessThan(mediumIndex)
      }
    })

    test('aggregates violations across files', async () => {
      mockExistsSync.mockReturnValue(true)
      mockDiscoverFiles.mockResolvedValue([
        { absolutePath: '/test/file1.ts', path: 'file1.ts' },
        { absolutePath: '/test/file2.ts', path: 'file2.ts' },
      ])
      mockReadFile.mockResolvedValue('console.log("test");')

      const cmd = createCommandWithMockedParse(
        {
          format: 'json',
          top: 15,
          verbose: false,
          impact: '',
        },
        { path: '.' },
      )

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)

      const consoleRule = parsed.find((r: { ruleId: string }) => r.ruleId === 'no-console-log')
      expect(consoleRule.estimatedViolations).toBe(2)
    })
  })
})
