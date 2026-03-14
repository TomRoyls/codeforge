import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

vi.mock('../../../src/config/discovery.js', () => ({
  discoverConfig: vi.fn(),
}))

vi.mock('../../../src/config/parser.js', () => ({
  parseConfigFile: vi.fn(),
}))

vi.mock('../../../src/core/file-discovery.js', () => ({
  discoverFiles: vi.fn(),
}))

vi.mock('../../../src/rules/index.js', () => ({
  getRuleIds: vi.fn(() => ['max-complexity', 'max-params', 'no-await-in-loop']),
}))

describe('Doctor Command', () => {
  let Doctor: typeof import('../../../src/commands/doctor.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let tempDir: string
  let mockDiscoverConfig: ReturnType<typeof vi.fn>
  let mockParseConfigFile: ReturnType<typeof vi.fn>
  let mockDiscoverFiles: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    mockDiscoverConfig = vi.fn()
    mockParseConfigFile = vi.fn()
    mockDiscoverFiles = vi.fn()

    vi.mocked(await import('../../../src/config/discovery.js')).discoverConfig = mockDiscoverConfig
    vi.mocked(await import('../../../src/config/parser.js')).parseConfigFile = mockParseConfigFile
    vi.mocked(await import('../../../src/core/file-discovery.js')).discoverFiles = mockDiscoverFiles

    Doctor = (await import('../../../src/commands/doctor.js')).default

    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-doctor-'))
  })

  afterEach(async () => {
    mockConsoleLog.mockRestore()
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Doctor.description).toBe('Diagnose configuration and environment issues')
    })

    test('has examples defined', () => {
      expect(Doctor.examples).toBeDefined()
      expect(Doctor.examples.length).toBeGreaterThan(0)
    })

    test('has json flag', () => {
      expect(Doctor.flags.json).toBeDefined()
      expect(Doctor.flags.json.char).toBe('j')
      expect(Doctor.flags.json.default).toBe(false)
    })

    test('has verbose flag', () => {
      expect(Doctor.flags.verbose).toBeDefined()
      expect(Doctor.flags.verbose.char).toBe('v')
      expect(Doctor.flags.verbose.default).toBe(false)
    })
  })

  describe('run', () => {
    function createCommandWithMockedParse(flags: Record<string, unknown>) {
      const command = new Doctor([], {} as never)
      const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
      cmdWithMock.parse = vi.fn().mockResolvedValue({
        args: {},
        flags,
      })
      return command
    }

    test('runs all checks and outputs results', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Doctor')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('outputs JSON when json flag is set', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('includes all check results in JSON output', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('passed')
      expect(Array.isArray(result.checks)).toBe(true)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports config file found when it exists', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['test.ts'])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('ok')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports warning when config file not found', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('warning')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports error when config is invalid', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Invalid JSON'))

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })

      try {
        await cmd.run()
      } catch {}

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('error')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports valid config', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is valid'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('ok')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports unknown rules as error', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'unknown-rule': 'error' },
      })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })

      try {
        await cmd.run()
      } catch (_e) {
        void _e
      }

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('error')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports valid rules', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports warning for large codebase', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      const manyFiles = Array(15000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(manyFiles)

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const fileCountCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCountCheck).toBeDefined()
      expect(fileCountCheck.status).toBe('warning')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports file count for normal codebase', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['file1.ts', 'file2.ts'])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const fileCountCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCountCheck).toBeDefined()
      expect(fileCountCheck.status).toBe('ok')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports Node.js version check', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const nodeCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Node.js version'),
      )
      expect(nodeCheck).toBeDefined()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports memory check', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck).toBeDefined()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('sets passed to false when errors exist', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Invalid config'))

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })

      try {
        await cmd.run()
      } catch {}

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      expect(result.passed).toBe(false)
      expect(result.errors).toBeGreaterThan(0)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('sets passed to true when no errors', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      expect(result.passed).toBe(true)
      expect(result.errors).toBe(0)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('counts warnings correctly', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      expect(typeof result.warnings).toBe('number')
      expect(result.warnings).toBeGreaterThanOrEqual(0)

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('shows verbose details when verbose flag is set', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalled()

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports warning when no file patterns configured', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: [] })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('warning')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('reports valid file patterns', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('File patterns are valid'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('ok')

      vi.spyOn(process, 'cwd').mockRestore()
    })

    test('uses config patterns for file discovery', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.custom'],
        ignore: ['**/custom-ignore/**'],
      })
      mockDiscoverFiles.mockResolvedValue([])

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      expect(mockDiscoverFiles).toHaveBeenCalled()

      vi.spyOn(process, 'cwd').mockRestore()
    })
  })

  describe('Private methods', () => {
    describe('getStatusSymbol', () => {
      test('returns correct symbol for ok status', async () => {
        const cmd = new Doctor([], {} as never)
        const symbol = (
          cmd as unknown as { getStatusSymbol: (s: string) => string }
        ).getStatusSymbol('ok')
        expect(symbol).toContain('✓')
      })

      test('returns correct symbol for warning status', async () => {
        const cmd = new Doctor([], {} as never)
        const symbol = (
          cmd as unknown as { getStatusSymbol: (s: string) => string }
        ).getStatusSymbol('warning')
        expect(symbol).toContain('⚠')
      })

      test('returns correct symbol for error status', async () => {
        const cmd = new Doctor([], {} as never)
        const symbol = (
          cmd as unknown as { getStatusSymbol: (s: string) => string }
        ).getStatusSymbol('error')
        expect(symbol).toContain('✗')
      })
    })

    describe('colorMessage', () => {
      test('returns uncolored message for ok status', async () => {
        const cmd = new Doctor([], {} as never)
        const message = (
          cmd as unknown as { colorMessage: (s: string, m: string) => string }
        ).colorMessage('ok', 'Test message')
        expect(message).toBe('Test message')
      })
    })

    describe('fileExists', () => {
      test('returns true for existing file', async () => {
        const testFile = path.join(tempDir, 'test.txt')
        await fs.writeFile(testFile, 'test', 'utf-8')

        const cmd = new Doctor([], {} as never)
        const exists = await (
          cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
        ).fileExists(testFile)
        expect(exists).toBe(true)
      })

      test('returns false for non-existing file', async () => {
        const cmd = new Doctor([], {} as never)
        const exists = await (
          cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
        ).fileExists('/non/existing/file.txt')
        expect(exists).toBe(false)
      })
    })
  })

  describe('Check results structure', () => {
    test('each check has required properties', async () => {
      const originalCwd = process.cwd
      vi.spyOn(process, 'cwd').mockReturnValue(tempDir)

      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])

      function createCommandWithMockedParse(flags: Record<string, unknown>) {
        const command = new Doctor([], {} as never)
        const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
        cmdWithMock.parse = vi.fn().mockResolvedValue({
          args: {},
          flags,
        })
        return command
      }

      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const result = JSON.parse(output)

      for (const check of result.checks) {
        expect(check).toHaveProperty('message')
        expect(check).toHaveProperty('status')
        expect(['ok', 'warning', 'error']).toContain(check.status)
        expect(typeof check.message).toBe('string')
      }

      vi.spyOn(process, 'cwd').mockRestore()
    })
  })
})
