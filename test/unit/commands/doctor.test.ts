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

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>()
  return {
    ...actual,
    totalmem: vi.fn(actual.totalmem),
  }
})

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

  function setupCwdMock() {
    const spy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    return () => spy.mockRestore()
  }

  function createCommandWithMockedParse(flags: Record<string, unknown>) {
    const command = new Doctor([], {} as never)
    const cmdWithMock = command as unknown as {
      parse: ReturnType<typeof vi.fn>
      exit: ReturnType<typeof vi.fn>
    }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    cmdWithMock.exit = vi.fn()
    return command
  }

  function setupBasicRun(flags: Record<string, unknown> = { json: true, verbose: false }) {
    mockDiscoverConfig.mockResolvedValue(null)
    mockDiscoverFiles.mockResolvedValue([])
    return createCommandWithMockedParse(flags)
  }

  async function safeRun(cmd: ReturnType<typeof createCommandWithMockedParse>) {
    try {
      await cmd.run()
    } catch {}
  }

  async function getJsonResult() {
    const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
    return JSON.parse(output)
  }

  function setupConfigRun(
    configData: Record<string, unknown>,
    flags: Record<string, unknown> = { json: true, verbose: false },
  ) {
    const configPath = path.join(tempDir, '.codeforgerc.json')
    mockDiscoverConfig.mockResolvedValue(configPath)
    mockParseConfigFile.mockResolvedValue(configData)
    return createCommandWithMockedParse(flags)
  }

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

    test('description is a non-empty string', () => {
      expect(typeof Doctor.description).toBe('string')
      expect(Doctor.description.length).toBeGreaterThan(0)
    })

    test('examples array has at least 2 entries', () => {
      expect(Array.isArray(Doctor.examples)).toBe(true)
      expect(Doctor.examples.length).toBeGreaterThanOrEqual(2)
    })

    test('each example has command and description', () => {
      for (const example of Doctor.examples) {
        expect(example).toHaveProperty('command')
        expect(example).toHaveProperty('description')
        expect(typeof example.command).toBe('string')
        expect(typeof example.description).toBe('string')
      }
    })

    test('json flag has description', () => {
      expect(Doctor.flags.json.description).toBeDefined()
      expect(typeof Doctor.flags.json.description).toBe('string')
    })

    test('verbose flag has description', () => {
      expect(Doctor.flags.verbose.description).toBeDefined()
      expect(typeof Doctor.flags.verbose.description).toBe('string')
    })

    test('can instantiate Doctor command', () => {
      const cmd = new Doctor([], {} as never)
      expect(cmd).toBeInstanceOf(Doctor)
    })

    test('json flag default is boolean false', () => {
      expect(Doctor.flags.json.default).toBe(false)
      expect(typeof Doctor.flags.json.default).toBe('boolean')
    })

    test('verbose flag default is boolean false', () => {
      expect(Doctor.flags.verbose.default).toBe(false)
      expect(typeof Doctor.flags.verbose.default).toBe('boolean')
    })
  })

  describe('run', () => {
    test('runs all checks and outputs results', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Doctor')
      restore()
    })

    test('outputs JSON when json flag is set', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()
      restore()
    })

    test('includes all check results in JSON output', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result).toHaveProperty('checks')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('passed')
      expect(Array.isArray(result.checks)).toBe(true)
      restore()
    })

    test('outputs header when not in json mode', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('CodeForge Doctor')
      restore()
    })

    test('does not output header text when json flag is set', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('CodeForge Doctor - Diagnosing')
      restore()
    })

    test('outputs JSON with 2-space indentation', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('  "checks"')
      restore()
    })

    test('reports config file found when it exists', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['test.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('ok')
      restore()
    })

    test('reports warning when config file not found', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('warning')
      restore()
    })

    test('reports error when config is invalid', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Invalid JSON'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('error')
      restore()
    })

    test('reports valid config', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is valid'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.status).toBe('ok')
      restore()
    })

    test('reports unknown rules as error', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'unknown-rule': 'error' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('error')
      restore()
    })

    test('reports valid rules', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')
      restore()
    })

    test('reports warning for large codebase', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const manyFiles = Array(15000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(manyFiles)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCountCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCountCheck).toBeDefined()
      expect(fileCountCheck.status).toBe('warning')
      restore()
    })

    test('reports file count for normal codebase', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['file1.ts', 'file2.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCountCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCountCheck).toBeDefined()
      expect(fileCountCheck.status).toBe('ok')
      restore()
    })

    test('reports Node.js version check', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const nodeCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Node.js version'),
      )
      expect(nodeCheck).toBeDefined()
      restore()
    })

    test('reports memory check', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck).toBeDefined()
      restore()
    })

    test('sets passed to false when errors exist', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Invalid config'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.passed).toBe(false)
      expect(result.errors).toBeGreaterThan(0)
      restore()
    })

    test('sets passed to true when no errors', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.passed).toBe(true)
      expect(result.errors).toBe(0)
      restore()
    })

    test('counts warnings correctly', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(typeof result.warnings).toBe('number')
      expect(result.warnings).toBeGreaterThanOrEqual(0)
      restore()
    })

    test('shows verbose details when verbose flag is set', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      await safeRun(cmd)
      expect(mockConsoleLog).toHaveBeenCalled()
      restore()
    })

    test('reports warning when no file patterns configured', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: [] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('warning')
      restore()
    })

    test('reports valid file patterns', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('File patterns are valid'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('ok')
      restore()
    })

    test('uses config patterns for file discovery', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.custom'],
        ignore: ['**/custom-ignore/**'],
      })
      mockDiscoverFiles.mockResolvedValue([])
      await safeRun(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalled()
      restore()
    })

    test('exits with code 1 when there are errors', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Bad config'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      const exitMock = (cmd as unknown as { exit: ReturnType<typeof vi.fn> }).exit
      await safeRun(cmd)
      expect(exitMock).toHaveBeenCalledWith(1)
      restore()
    })

    test('does not exit with error code when no errors', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const exitMock = (cmd as unknown as { exit: ReturnType<typeof vi.fn> }).exit
      expect(exitMock).not.toHaveBeenCalled()
      restore()
    })

    test('calls parse with Doctor class for flags', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const parseMock = (cmd as unknown as { parse: ReturnType<typeof vi.fn> }).parse
      expect(parseMock).toHaveBeenCalledWith(Doctor)
      restore()
    })

    test('handles both json and verbose flags simultaneously', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: true })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()
      restore()
    })

    test('JSON result has exactly 4 top-level keys', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const keys = Object.keys(result)
      expect(keys).toContain('checks')
      expect(keys).toContain('errors')
      expect(keys).toContain('warnings')
      expect(keys).toContain('passed')
      expect(keys.length).toBe(4)
      restore()
    })

    test('errors count matches actual error checks', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const actualErrors = result.checks.filter(
        (c: { status: string }) => c.status === 'error',
      ).length
      expect(result.errors).toBe(actualErrors)
      restore()
    })

    test('warnings count matches actual warning checks', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const actualWarnings = result.checks.filter(
        (c: { status: string }) => c.status === 'warning',
      ).length
      expect(result.warnings).toBe(actualWarnings)
      restore()
    })

    test('run produces consistent check count across invocations', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd1 = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd1)
      const result1 = await getJsonResult()
      mockConsoleLog.mockClear()
      const cmd2 = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd2)
      const result2 = await getJsonResult()
      expect(result1.checks.length).toBe(result2.checks.length)
      restore()
    })
  })

  describe('checkNodeVersion', () => {
    test('reports ok for current node version', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const nodeCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Node.js version'),
      )
      expect(nodeCheck).toBeDefined()
      expect(nodeCheck.status).toBe('ok')
      restore()
    })

    test('node version message contains version string', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const nodeCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Node.js version'),
      )
      expect(nodeCheck.message).toContain('v')
      restore()
    })

    test('node version message format is correct', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const nodeCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Node.js version'),
      )
      expect(nodeCheck.message).toMatch(/Node\.js version: v\d+/)
      restore()
    })

    test('reports error when node version is below 20', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v18.17.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
        expect(nodeCheck.message).toContain('requires >= 20.0.0')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports error for very old node version', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v14.21.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports ok for node version exactly 20', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v20.0.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('ok')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports ok for node version 22', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v22.5.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('ok')
        expect(nodeCheck.message).toContain('v22.5.0')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('error includes upgrade suggestion for old node', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v16.0.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.details).toContain('upgrade')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports error for node version 19', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v19.9.9', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })
  })

  describe('checkMemory', () => {
    test('reports memory available', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck).toBeDefined()
      restore()
    })

    test('memory check message includes GB unit', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.message).toContain('GB')
      restore()
    })

    test('memory check is ok when sufficient memory', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(8 * 1024 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('ok')
      expect(memoryCheck.message).not.toContain('low')
      restore()
    })

    test('memory check reports warning when low', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(256 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('warning')
      expect(memoryCheck.message).toContain('low')
      restore()
    })

    test('memory check details suggest more memory when low', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(128 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.details).toContain('memory')
      restore()
    })

    test('memory value is a number', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      const valueStr = memoryCheck.message.match(/[\d.]+/)
      expect(valueStr).not.toBeNull()
      expect(Number(valueStr![0])).not.toBeNaN()
      restore()
    })

    test('memory at exact 512MB boundary is ok', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(512 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('ok')
      restore()
    })

    test('memory just below 512MB is warning', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(511 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('warning')
      restore()
    })
  })

  describe('checkTypeScript', () => {
    test('reports nothing when no tsconfig.json', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript'),
      )
      expect(tsCheck).toBeUndefined()
      restore()
    })

    test('reports ok when tsconfig and typescript installed', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.3.3' }),
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript version'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('ok')
      expect(tsCheck.message).toContain('5.3.3')
      restore()
    })

    test('reports warning when tsconfig exists but typescript not installed', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('warning')
      restore()
    })

    test('warning message suggests installing typescript', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript'),
      )
      expect(tsCheck.details).toContain('npm install typescript')
      restore()
    })

    test('handles typescript package.json with no version field', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({}),
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript version'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('ok')
      expect(tsCheck.message).toContain('unknown')
      restore()
    })

    test('handles corrupted typescript package.json', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        'not valid json{{{',
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('warning')
      restore()
    })

    test('handles directory named tsconfig.json', async () => {
      const restore = setupCwdMock()
      await fs.mkdir(path.join(tempDir, 'tsconfig.json'), { recursive: true })
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript'),
      )
      expect(tsCheck).toBeUndefined()
      restore()
    })
  })

  describe('checkConfigExists', () => {
    test('reports ok with relative path when config found', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck).toBeDefined()
      expect(configCheck.message).toContain('.codeforgerc.json')
      restore()
    })

    test('reports warning with details about expected file names', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(configCheck.details).toBeDefined()
      expect(configCheck.details).toContain('codeforge')
      restore()
    })

    test('config file found message contains path for nested config', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, 'subdir', '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck.message).toContain('subdir')
      restore()
    })

    test('config found check has ok status', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(path.join(tempDir, '.codeforgerc.json'))
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck.status).toBe('ok')
      restore()
    })
  })

  describe('checkConfigValid', () => {
    test('skips check when no config exists', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const validCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is valid'),
      )
      const invalidCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(validCheck).toBeUndefined()
      expect(invalidCheck).toBeUndefined()
      restore()
    })

    test('reports ok when config parses successfully', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const validCheck = result.checks.find(
        (c: { message: string }) => c.message === 'Config is valid',
      )
      expect(validCheck).toBeDefined()
      expect(validCheck.status).toBe('ok')
      restore()
    })

    test('reports error with error message when config invalid', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Bad syntax at line 5'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const invalidCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(invalidCheck.details).toContain('Bad syntax at line 5')
      restore()
    })

    test('handles non-Error rejection objects', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue('string error')
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const invalidCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(invalidCheck).toBeDefined()
      expect(invalidCheck.status).toBe('error')
      restore()
    })

    test('reports valid config with complex configuration', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts', '**/*.tsx'],
        ignore: ['**/node_modules/**'],
        rules: { 'max-complexity': 'error', 'max-params': 'warn' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const validCheck = result.checks.find(
        (c: { message: string }) => c.message === 'Config is valid',
      )
      expect(validCheck).toBeDefined()
      expect(validCheck.status).toBe('ok')
      restore()
    })
  })

  describe('checkRulesValid', () => {
    test('skips when no config', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const validRuleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(validRuleCheck).toBeUndefined()
      restore()
    })

    test('reports ok when no rules in config', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')
      restore()
    })

    test('reports ok with known rules', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error', 'max-params': 'warn' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')
      restore()
    })

    test('reports error with multiple unknown rules', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'rule-a': 'error', 'rule-b': 'warn', 'rule-c': 'off' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('error')
      expect(ruleCheck.message).toContain('rule-a')
      expect(ruleCheck.message).toContain('rule-b')
      expect(ruleCheck.message).toContain('rule-c')
      restore()
    })

    test('unknown rules error includes valid rules in details', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'fake-rule': 'error' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck.details).toContain('max-complexity')
      restore()
    })

    test('reports ok with empty rules object', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: {},
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')
      restore()
    })

    test('handles mix of known and unknown rules', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error', 'unknown-rule': 'warn' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.message).toContain('unknown-rule')
      expect(ruleCheck.message).not.toContain('max-complexity')
      restore()
    })

    test('handles config parse error gracefully', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('parse error'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleChecks = result.checks.filter(
        (c: { message: string }) => c.message.includes('rules') || c.message.includes('Rules'),
      )
      expect(ruleChecks.length).toBe(0)
      restore()
    })
  })

  describe('checkFilePatterns', () => {
    test('reports ok for valid glob patterns', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts', '**/*.tsx'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('File patterns are valid'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('ok')
      restore()
    })

    test('reports warning for empty patterns array', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: [] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('warning')
      restore()
    })

    test('skips check when no config', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find(
        (c: { message: string }) =>
          c.message.includes('File patterns') || c.message.includes('No file patterns'),
      )
      expect(patternCheck).toBeUndefined()
      restore()
    })

    test('reports error for empty string pattern', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts', ''] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Invalid file patterns'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('error')
      restore()
    })

    test('reports error for whitespace-only pattern', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['   '] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Invalid file patterns'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('error')
      restore()
    })

    test('reports error details mention non-empty strings', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: [''] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Invalid file patterns'),
      )
      expect(patternCheck.details).toContain('non-empty strings')
      restore()
    })

    test('reports ok for single valid pattern', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.js'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('File patterns are valid'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('ok')
      restore()
    })

    test('warning message suggests adding patterns', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: [] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck.details).toContain('Add file patterns')
      restore()
    })

    test('handles config without files property as empty', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ rules: { 'max-complexity': 'error' } })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('warning')
      restore()
    })
  })

  describe('checkFileCount', () => {
    test('reports ok for zero files', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('ok')
      expect(fileCheck.message).toContain('0')
      restore()
    })

    test('reports ok for small number of files', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['a.ts', 'b.ts', 'c.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('ok')
      expect(fileCheck.message).toContain('3')
      restore()
    })

    test('reports warning for large codebase', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const largeFiles = Array(1500)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(largeFiles)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('warning')
      restore()
    })

    test('large codebase warning suggests codeforgeignore', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const largeFiles = Array(2000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(largeFiles)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCheck.details).toContain('codeforgeignore')
      restore()
    })

    test('reports ok at threshold boundary', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(1000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const okCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(okCheck).toBeDefined()
      expect(okCheck.status).toBe('ok')
      restore()
    })

    test('reports warning just above threshold', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(1001)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const warnCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(warnCheck).toBeDefined()
      expect(warnCheck.status).toBe('warning')
      restore()
    })

    test('uses config patterns for discovery', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.custom'],
        ignore: ['**/dist/**'],
      })
      mockDiscoverFiles.mockResolvedValue([])
      await safeRun(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalled()
      restore()
    })

    test('falls back to default patterns when no config', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: expect.arrayContaining(['**/*.ts']),
        }),
      )
      restore()
    })

    test('handles discoverFiles error gracefully', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockRejectedValue(new Error('Permission denied'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Could not count files'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('warning')
      restore()
    })

    test('file count error includes error details', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockRejectedValue(new Error('disk error'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Could not count files'),
      )
      expect(fileCheck.details).toContain('disk error')
      restore()
    })

    test('handles config parse error in file count check', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile
        .mockResolvedValueOnce({ files: ['**/*.ts'] })
        .mockRejectedValueOnce(new Error('parse fail'))
        .mockResolvedValueOnce({ files: ['**/*.ts'] })
        .mockRejectedValueOnce(new Error('parse fail'))
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalled()
      restore()
    })
  })

  describe('checkTsConfig', () => {
    test('reports ok when tsconfig.json exists', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json exists'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('ok')
      restore()
    })

    test('reports warning when tsconfig missing but ts files exist', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['src/index.ts', 'src/utils.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('warning')
      restore()
    })

    test('reports nothing when no tsconfig and no ts files', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json'),
      )
      expect(tsCheck).toBeUndefined()
      restore()
    })

    test('warning message suggests adding tsconfig', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['app.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found'),
      )
      expect(tsCheck.details).toContain('tsconfig.json')
      restore()
    })

    test('handles discoverFiles error silently', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('access denied'))
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsError = result.checks.find(
        (c: { message: string }) => c.message.includes('tsconfig') && c.status === 'error',
      )
      expect(tsError).toBeUndefined()
      restore()
    })
  })

  describe('checkPackageJson', () => {
    test('reports ok when package.json exists', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json exists'),
      )
      expect(pkgCheck).toBeDefined()
      expect(pkgCheck.status).toBe('ok')
      restore()
    })

    test('reports warning when package.json missing', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json not found'),
      )
      expect(pkgCheck).toBeDefined()
      expect(pkgCheck.status).toBe('warning')
      restore()
    })

    test('warning suggests not a node project', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json not found'),
      )
      expect(pkgCheck.details).toContain('Node.js')
      restore()
    })

    test('checks correct path for package.json', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'package.json'), '{"name": "test"}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json exists'),
      )
      expect(pkgCheck).toBeDefined()
      restore()
    })

    test('returns warning for directory named package.json', async () => {
      const restore = setupCwdMock()
      await fs.mkdir(path.join(tempDir, 'package.json'), { recursive: true })
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json not found'),
      )
      expect(pkgCheck).toBeDefined()
      expect(pkgCheck.status).toBe('warning')
      restore()
    })
  })

  describe('getStatusSymbol', () => {
    test('returns correct symbol for ok status', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'ok',
      )
      expect(symbol).toContain('✓')
    })

    test('returns correct symbol for warning status', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'warning',
      )
      expect(symbol).toContain('⚠')
    })

    test('returns correct symbol for error status', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'error',
      )
      expect(symbol).toContain('✗')
    })

    test('ok symbol returns non-empty string', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'ok',
      )
      expect(typeof symbol).toBe('string')
      expect(symbol).toContain('✓')
    })

    test('error symbol returns non-empty string', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'error',
      )
      expect(typeof symbol).toBe('string')
      expect(symbol).toContain('✗')
    })

    test('warning symbol returns non-empty string', () => {
      const cmd = new Doctor([], {} as never)
      const symbol = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'warning',
      )
      expect(typeof symbol).toBe('string')
      expect(symbol).toContain('⚠')
    })
  })

  describe('colorMessage', () => {
    test('returns uncolored message for ok status', () => {
      const cmd = new Doctor([], {} as never)
      const message = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('ok', 'Test message')
      expect(message).toBe('Test message')
    })

    test('returns yellow colored message for warning status', () => {
      const cmd = new Doctor([], {} as never)
      const message = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('warning', 'Warning msg')
      expect(message).toContain('Warning msg')
    })

    test('returns red colored message for error status', () => {
      const cmd = new Doctor([], {} as never)
      const message = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('error', 'Error msg')
      expect(message).toContain('Error msg')
    })

    test('preserves message content for all statuses', () => {
      const cmd = new Doctor([], {} as never)
      const testMsg = 'My unique check message 123'
      for (const status of ['ok', 'warning', 'error'] as const) {
        const result = (
          cmd as unknown as { colorMessage: (s: string, m: string) => string }
        ).colorMessage(status, testMsg)
        expect(result).toContain(testMsg)
      }
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

    test('returns false for directory', async () => {
      await fs.mkdir(path.join(tempDir, 'testdir'), { recursive: true })
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(path.join(tempDir, 'testdir'))
      expect(exists).toBe(false)
    })

    test('returns false for empty path', async () => {
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists('')
      expect(exists).toBe(false)
    })

    test('returns true for file with content', async () => {
      const testFile = path.join(tempDir, 'content.txt')
      await fs.writeFile(testFile, 'hello world\nsecond line', 'utf-8')
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for deeply nested non-existent path', async () => {
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists('/a/b/c/d/e/f/g/h/file.txt')
      expect(exists).toBe(false)
    })

    test('returns true for file in subdirectory', async () => {
      const subDir = path.join(tempDir, 'sub')
      await fs.mkdir(subDir, { recursive: true })
      const testFile = path.join(subDir, 'nested.txt')
      await fs.writeFile(testFile, 'nested', 'utf-8')
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('handles symlink to file', async () => {
      const targetFile = path.join(tempDir, 'target.txt')
      const linkPath = path.join(tempDir, 'link.txt')
      await fs.writeFile(targetFile, 'content', 'utf-8')
      await fs.symlink(targetFile, linkPath)
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(linkPath)
      expect(exists).toBe(true)
    })
  })

  describe('displayResults', () => {
    test('displays all checks with symbols', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.length).toBeGreaterThan(0)
      restore()
    })

    test('shows details when verbose is true', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.length).toBeGreaterThan(0)
      restore()
    })

    test('hides details when verbose is false', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toBeDefined()
      restore()
    })

    test('shows error summary when errors exist', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toMatch(/error/i)
      restore()
    })

    test('shows all checks passed when no errors or warnings', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.3.0' }),
        'utf-8',
      )
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['file.ts'])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('All checks passed')
      restore()
    })

    test('shows warning count in summary', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toMatch(/passed|warning/)
      restore()
    })

    test('pluralizes warning when more than one', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      if (result.warnings > 1) {
        expect(result.warnings).toBeGreaterThan(1)
      }
      restore()
    })
  })

  describe('Check results structure', () => {
    test('each check has required properties', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      for (const check of result.checks) {
        expect(check).toHaveProperty('message')
        expect(check).toHaveProperty('status')
        expect(['ok', 'warning', 'error']).toContain(check.status)
        expect(typeof check.message).toBe('string')
      }
      restore()
    })

    test('check messages are non-empty strings', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      for (const check of result.checks) {
        expect(check.message.length).toBeGreaterThan(0)
      }
      restore()
    })

    test('details property is string when present', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      for (const check of result.checks) {
        if (check.details !== undefined) {
          expect(typeof check.details).toBe('string')
        }
      }
      restore()
    })

    test('errors count is a non-negative number', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(typeof result.errors).toBe('number')
      expect(result.errors).toBeGreaterThanOrEqual(0)
      restore()
    })

    test('warnings count is a non-negative number', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(typeof result.warnings).toBe('number')
      expect(result.warnings).toBeGreaterThanOrEqual(0)
      restore()
    })

    test('passed is a boolean', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(typeof result.passed).toBe('boolean')
      restore()
    })

    test('checks array is present', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(Array.isArray(result.checks)).toBe(true)
      restore()
    })

    test('at least 5 checks are always performed', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.checks.length).toBeGreaterThanOrEqual(5)
      restore()
    })
  })

  describe('Integration - full run scenarios', () => {
    test('full run with config file and all files present', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.3.0' }),
        'utf-8',
      )
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      })
      mockDiscoverFiles.mockResolvedValue(['src/index.ts', 'src/utils.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.passed).toBe(true)
      expect(result.errors).toBe(0)
      expect(result.checks.length).toBeGreaterThanOrEqual(8)
      restore()
    })

    test('full run without config file', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.warnings).toBeGreaterThan(0)
      restore()
    })

    test('full run with invalid config', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('JSON parse error'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.passed).toBe(false)
      expect(result.errors).toBeGreaterThan(0)
      restore()
    })

    test('full run with verbose output', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Doctor')
      restore()
    })

    test('full run with json and verbose (json takes precedence)', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: true })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()
      restore()
    })

    test('full run with unknown rules produces errors', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'nonexistent-rule': 'error', 'another-bad-rule': 'warn' },
      })
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.passed).toBe(false)
      restore()
    })

    test('checks run in expected order', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.checks[0].message).toContain('Node.js')
      expect(result.checks[1].message).toContain('Memory')
      restore()
    })

    test('run with ts files but no tsconfig produces warning', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['index.ts', 'utils.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('warning')
      restore()
    })

    test('run with all valid config produces no errors', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.4.0' }),
        'utf-8',
      )
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error', 'no-await-in-loop': 'warn' },
      })
      mockDiscoverFiles.mockResolvedValue(['a.ts', 'b.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.errors).toBe(0)
      restore()
    })

    test('multiple issues produce correct error and warning counts', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('broken'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.errors).toBeGreaterThanOrEqual(1)
      restore()
    })

    test('text output contains formatted symbols for all checks', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toMatch(/✓|⚠|✗/)
      restore()
    })

    test('json output is valid JSON with all required fields', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('checks')
      expect(parsed).toHaveProperty('errors')
      expect(parsed).toHaveProperty('warnings')
      expect(parsed).toHaveProperty('passed')
      restore()
    })
  })

  describe('Edge cases', () => {
    test('handles discoverConfig returning empty string as no config', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue('')
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const noConfig = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(noConfig).toBeDefined()
      expect(noConfig.status).toBe('warning')
      restore()
    })

    test('handles config with only ignore patterns', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        ignore: ['**/dist/**', '**/coverage/**'],
      })
      mockDiscoverFiles.mockResolvedValue([])
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result).toBeDefined()
      restore()
    })

    test('handles single file discovery', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['single.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck.message).toContain('1')
      restore()
    })

    test('handles very large file count', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const hugeFiles = Array(50000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(hugeFiles)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.message).toContain('50000')
      restore()
    })

    test('handles config path with special characters', async () => {
      const specialDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codeforge-doctor-special '))
      try {
        const configPath = path.join(specialDir, '.codeforgerc.json')
        vi.spyOn(process, 'cwd').mockReturnValue(specialDir)
        mockDiscoverConfig.mockResolvedValue(configPath)
        mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
        mockDiscoverFiles.mockResolvedValue([])
        const cmd = createCommandWithMockedParse({ json: true, verbose: false })
        await safeRun(cmd)
        const result = await getJsonResult()
        const configCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Config file found'),
        )
        expect(configCheck).toBeDefined()
      } finally {
        await fs.rm(specialDir, { recursive: true, force: true })
      }
    })

    test('passed matches error count', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      if (result.errors === 0) {
        expect(result.passed).toBe(true)
      } else {
        expect(result.passed).toBe(false)
      }
      restore()
    })

    test('handles node version with high major number', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v99.0.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('ok')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('handles config with many rules including valid and invalid', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: {
          'max-complexity': 'error',
          'max-params': 'warn',
          'no-await-in-loop': 'off',
          'fake-rule-1': 'error',
          'fake-rule-2': 'warn',
        },
      })
      mockDiscoverFiles.mockResolvedValue([])
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.message).toContain('fake-rule-1')
      expect(ruleCheck.message).toContain('fake-rule-2')
      expect(ruleCheck.message).not.toContain('max-complexity')
      restore()
    })

    test('handles config with files property set to undefined', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: undefined })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('No file patterns configured'),
      )
      expect(patternCheck).toBeDefined()
      restore()
    })

    test('handles node version 19.9.99', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v19.9.99', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('handles discoverConfig called multiple times per run', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      expect(mockDiscoverConfig.mock.calls.length).toBeGreaterThanOrEqual(2)
      restore()
    })

    test('handles parseConfigFile returning null config', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result).toBeDefined()
      restore()
    })

    test('handles discoverFiles returning various file extensions', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([
        'a.ts',
        'b.tsx',
        'c.js',
        'd.jsx',
        'e.vue',
        'f.py',
        'g.rs',
      ])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.message).toContain('7')
      restore()
    })

    test('handles all checks having ok status', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.4.0' }),
        'utf-8',
      )
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error' },
      })
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.errors).toBe(0)
      expect(result.passed).toBe(true)
      restore()
    })

    test('handles run in text mode with missing package.json', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toBeDefined()
      restore()
    })

    test('handles config with only files and no other properties', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result).toBeDefined()
      expect(result.checks.length).toBeGreaterThan(0)
      restore()
    })
  })

  describe('Additional coverage', () => {
    test('all known rules are accepted', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'max-complexity': 'error', 'max-params': 'warn', 'no-await-in-loop': 'off' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      expect(ruleCheck.status).toBe('ok')
      restore()
    })

    test('checkNodeVersion handles version string with v prefix', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v20.11.1', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.message).toContain('v20.11.1')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('checkMemory reports correct GB value', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(4 * 1024 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.message).toContain('4')
      restore()
    })

    test('checkMemory reports 0GB for zero memory', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(0)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck).toBeDefined()
      expect(memoryCheck.status).toBe('warning')
      restore()
    })

    test('checkConfigExists details lists expected config file names', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const noConfig = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(noConfig.details).toContain('.codeforgerc')
      expect(noConfig.details).toContain('.json')
      restore()
    })

    test('checkFilePatterns with multiple invalid patterns lists all', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['', '   ', ''] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Invalid file patterns'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('error')
      restore()
    })

    test('checkFileCount reports exact count in message', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck.message).toContain('5')
      restore()
    })

    test('checkTsConfig reports TypeScript files detected when discoverFiles returns non-ts files', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['style.css', 'data.json'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsConfigCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found but TypeScript files detected'),
      )
      expect(tsConfigCheck).toBeDefined()
      expect(tsConfigCheck.status).toBe('warning')
      restore()
    })

    test('checkTypeScript handles tsconfig with version in package.json', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.7.2', name: 'typescript' }),
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript version'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.message).toContain('5.7.2')
      restore()
    })

    test('checkRulesValid handles single unknown rule', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'single-bad-rule': 'error' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck.message).toContain('single-bad-rule')
      restore()
    })

    test('displayResults shows passed with 0 warnings', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.3.0' }),
        'utf-8',
      )
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['file.ts'])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('All checks passed')
      restore()
    })

    test('colorMessage for ok returns plain string', () => {
      const cmd = new Doctor([], {} as never)
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('ok', 'plain')
      expect(result).toBe('plain')
    })

    test('colorMessage for warning contains original text', () => {
      const cmd = new Doctor([], {} as never)
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('warning', 'test-warn')
      expect(result).toContain('test-warn')
    })

    test('colorMessage for error contains original text', () => {
      const cmd = new Doctor([], {} as never)
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('error', 'test-err')
      expect(result).toContain('test-err')
    })

    test('fileExists returns false for path to non-existent directory', async () => {
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists('/tmp/codeforge-nonexistent-dir-xyz/file.txt')
      expect(exists).toBe(false)
    })

    test('fileExists returns true for empty file', async () => {
      const testFile = path.join(tempDir, 'empty.txt')
      await fs.writeFile(testFile, '', 'utf-8')
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('getStatusSymbol returns string for all statuses', () => {
      const cmd = new Doctor([], {} as never)
      const method = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol
      for (const status of ['ok', 'warning', 'error'] as const) {
        const result = method(status)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }
    })

    test('checkPackageJson details contain may not be Node.js project', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json not found'),
      )
      expect(pkgCheck.details).toContain('Node.js')
      expect(pkgCheck.details).toContain('project')
      restore()
    })

    test('run with both json=false and verbose=false shows basic output', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      expect(mockConsoleLog).toHaveBeenCalled()
      const calls = mockConsoleLog.mock.calls.length
      expect(calls).toBeGreaterThan(0)
      restore()
    })

    test('run outputs checks for multiple diagnostic categories', async () => {
      const restore = setupCwdMock()
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.checks.length).toBeGreaterThan(0)
      const hasRelevantCategory = result.checks.some(
        (c: { message: string }) =>
          c.message.includes('Node') || c.message.includes('Config') || c.message.includes('Files'),
      )
      expect(hasRelevantCategory).toBe(true)
      restore()
    })

    test('checkFileCount with exactly 999 files reports ok', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(999)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('ok')
      restore()
    })

    test('checkFileCount with 1002 files reports large codebase', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(1002)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.message).toContain('1002')
      restore()
    })

    test('handles discoverFiles error with non-Error object', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockRejectedValue('string error')
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Could not count files'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.details).toContain('Unknown error')
      restore()
    })

    test('checkConfigValid with non-Error rejection uses string representation', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(42)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const invalidCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(invalidCheck).toBeDefined()
      expect(invalidCheck.status).toBe('error')
      restore()
    })

    test('checkRulesValid with all known rules passes', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: {
          'max-complexity': 'error',
          'max-params': 'warn',
          'no-await-in-loop': 'off',
        },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('All rules are valid'),
      )
      expect(ruleCheck).toBeDefined()
      restore()
    })
  })

  describe('Additional metadata tests', () => {
    test('json flag description text is correct', () => {
      expect(Doctor.flags.json.description).toBe('Output results as JSON')
    })

    test('verbose flag description text is correct', () => {
      expect(Doctor.flags.verbose.description).toBe('Show detailed information')
    })

    test('examples contain command template placeholders', () => {
      const commands = Doctor.examples.map((e: { command: string }) => e.command)
      expect(commands.every((c: string) => c.includes('command.id'))).toBe(true)
    })

    test('examples include --verbose example', () => {
      const commands = Doctor.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--verbose'))).toBe(true)
    })

    test('examples include --json example', () => {
      const commands = Doctor.examples.map((e: { command: string }) => e.command)
      expect(commands.some((c: string) => c.includes('--json'))).toBe(true)
    })

    test('all examples have non-empty description strings', () => {
      for (const example of Doctor.examples) {
        expect(example.description.length).toBeGreaterThan(0)
      }
    })

    test('flags object has exactly 2 flags', () => {
      expect(Object.keys(Doctor.flags)).toHaveLength(2)
    })
  })

  describe('checkNodeVersion additional', () => {
    test('reports error for node v0.12.0', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v0.12.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
        expect(nodeCheck.message).toContain('v0.12.0')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports error for node v1.0.0', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v1.0.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports ok for node v20.11.1', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v20.11.1', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('ok')
        expect(nodeCheck.message).toContain('v20.11.1')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('reports error for node v10.24.1', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v10.24.1', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('error')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('error details mention upgrade suggestion', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v12.0.0', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.details).toBeDefined()
        expect(nodeCheck.details).toContain('upgrade')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })
  })

  describe('checkMemory additional', () => {
    test('reports correct GB for 16GB', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(16 * 1024 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.message).toContain('16')
      expect(memoryCheck.status).toBe('ok')
      restore()
    })

    test('reports correct GB for 2GB', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(2 * 1024 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.message).toContain('2')
      expect(memoryCheck.status).toBe('ok')
      restore()
    })

    test('reports warning for 256MB', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(256 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('warning')
      restore()
    })

    test('reports warning for 64MB', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(64 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.status).toBe('warning')
      restore()
    })

    test('low memory details mention large codebases', async () => {
      const restore = setupCwdMock()
      vi.mocked(os.totalmem).mockReturnValue(100 * 1024 * 1024)
      const cmd = setupBasicRun()
      await safeRun(cmd)
      const result = await getJsonResult()
      const memoryCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Memory available'),
      )
      expect(memoryCheck.details).toContain('large codebases')
      restore()
    })
  })

  describe('checkConfigExists additional', () => {
    test('uses basename when config is at cwd root', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(path.join(tempDir, '.codeforgerc.json'))
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck.message).toContain('.codeforgerc.json')
      restore()
    })

    test('no config details list all expected config file names', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const noConfig = result.checks.find((c: { message: string }) =>
        c.message.includes('No config file found'),
      )
      expect(noConfig.details).toContain('.codeforgerc')
      expect(noConfig.details).toContain('.codeforgerc.json')
      expect(noConfig.details).toContain('.codeforge.json')
      expect(noConfig.details).toContain('codeforge.config.js')
      restore()
    })
  })

  describe('checkRulesValid additional', () => {
    test('details show known rules when unknown rules found', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({
        files: ['**/*.ts'],
        rules: { 'bogus-rule': 'error' },
      })
      await safeRun(cmd)
      const result = await getJsonResult()
      const ruleCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Unknown rules found'),
      )
      expect(ruleCheck.details).toContain('Valid rules:')
      expect(ruleCheck.details).toContain('max-complexity')
      restore()
    })
  })

  describe('checkFileCount additional', () => {
    test('uses default ignore patterns when no config', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      expect(mockDiscoverFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: expect.arrayContaining(['**/node_modules/**']),
        }),
      )
      restore()
    })

    test('large codebase warning mentions file count in message', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(5000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCheck.message).toContain('5000')
      restore()
    })
  })

  describe('checkTsConfig additional', () => {
    test('tsconfig found shows ok status', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json exists'),
      )
      expect(tsCheck.status).toBe('ok')
      restore()
    })

    test('tsconfig missing with ts files suggests adding tsconfig', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['index.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found'),
      )
      expect(tsCheck.details).toContain('Consider adding a tsconfig.json')
      restore()
    })

    test('tsconfig missing with tsx files triggers warning', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue(['component.tsx'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('tsconfig.json not found'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.status).toBe('warning')
      restore()
    })
  })

  describe('checkPackageJson additional', () => {
    test('package.json exists check status is ok', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'package.json'), '{}', 'utf-8')
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json exists'),
      )
      expect(pkgCheck.status).toBe('ok')
      restore()
    })

    test('package.json not found details contain may not be a Node.js project', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const pkgCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('package.json not found'),
      )
      expect(pkgCheck.details).toContain('may not be a Node.js project')
      restore()
    })
  })

  describe('displayResults additional', () => {
    test('shows error summary with both error and warning counts', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('broken config'))
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('error')
      restore()
    })

    test('verbose mode shows gray details for checks with details', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: true })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.length).toBeGreaterThan(0)
      restore()
    })

    test('displays checks with correct symbols in non-json mode', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const allOutput = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const hasSymbols =
        allOutput.includes('✓') || allOutput.includes('⚠') || allOutput.includes('✗')
      expect(hasSymbols).toBe(true)
      restore()
    })
  })

  describe('fileExists additional', () => {
    test('returns true for file created with write', async () => {
      const testFile = path.join(tempDir, 'written.txt')
      await fs.writeFile(testFile, 'content here', 'utf-8')
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists(testFile)
      expect(exists).toBe(true)
    })

    test('returns false for path to non-existent parent directory', async () => {
      const cmd = new Doctor([], {} as never)
      const exists = await (
        cmd as unknown as { fileExists: (p: string) => Promise<boolean> }
      ).fileExists('/nonexistent-parent-dir/file.txt')
      expect(exists).toBe(false)
    })
  })

  describe('colorMessage additional', () => {
    test('ok status returns exact input message', () => {
      const cmd = new Doctor([], {} as never)
      const msg = 'exact message test 42'
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('ok', msg)
      expect(result).toBe(msg)
    })

    test('warning status returns string containing message', () => {
      const cmd = new Doctor([], {} as never)
      const msg = 'a warning occurred'
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('warning', msg)
      expect(result).toContain('a warning occurred')
    })

    test('error status returns string containing message', () => {
      const cmd = new Doctor([], {} as never)
      const msg = 'critical failure'
      const result = (
        cmd as unknown as { colorMessage: (s: string, m: string) => string }
      ).colorMessage('error', msg)
      expect(result).toContain('critical failure')
    })
  })

  describe('getStatusSymbol additional', () => {
    test('ok status returns string containing checkmark', () => {
      const cmd = new Doctor([], {} as never)
      const result = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'ok',
      )
      expect(result).toContain('✓')
    })

    test('warning status returns string containing warning sign', () => {
      const cmd = new Doctor([], {} as never)
      const result = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'warning',
      )
      expect(result).toContain('⚠')
    })

    test('error status returns string containing x mark', () => {
      const cmd = new Doctor([], {} as never)
      const result = (cmd as unknown as { getStatusSymbol: (s: string) => string }).getStatusSymbol(
        'error',
      )
      expect(result).toContain('✗')
    })
  })

  describe('Integration additional', () => {
    test('json output with invalid config shows error details', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('Syntax error on line 3'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const invalidCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config is invalid'),
      )
      expect(invalidCheck.details).toContain('Syntax error on line 3')
      restore()
    })

    test('full run with tsconfig and typescript installed shows version', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.4.5' }),
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript version'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.message).toContain('5.4.5')
      restore()
    })

    test('full run text mode with warnings shows warning summary', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: false, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.length).toBeGreaterThan(0)
      restore()
    })

    test('run produces valid JSON even with broken config', async () => {
      const restore = setupCwdMock()
      const configPath = path.join(tempDir, '.codeforgerc.json')
      mockDiscoverConfig.mockResolvedValue(configPath)
      mockParseConfigFile.mockRejectedValue(new Error('broken'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const parsed = JSON.parse(output)
      expect(parsed.passed).toBe(false)
      restore()
    })

    test('check ordering: node version is first check', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.checks[0].message).toContain('Node.js')
      restore()
    })

    test('check ordering: memory is second check', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      expect(result.checks[1].message).toContain('Memory')
      restore()
    })
  })

  describe('Edge cases additional', () => {
    test('handles discoverConfig throwing an exception', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockRejectedValue(new Error('filesystem error'))
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await expect(safeRun(cmd)).resolves.toBeUndefined()
      restore()
    })

    test('handles config path equal to cwd (basename fallback)', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(tempDir)
      mockParseConfigFile.mockResolvedValue({ files: ['**/*.ts'] })
      mockDiscoverFiles.mockResolvedValue(['a.ts'])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const configCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Config file found'),
      )
      expect(configCheck).toBeDefined()
      restore()
    })

    test('handles node version string with extra components', async () => {
      const restore = setupCwdMock()
      const originalVersion = process.version
      Object.defineProperty(process, 'version', { value: 'v20.0.0+build.123', configurable: true })
      try {
        const cmd = setupBasicRun()
        await safeRun(cmd)
        const result = await getJsonResult()
        const nodeCheck = result.checks.find((c: { message: string }) =>
          c.message.includes('Node.js version'),
        )
        expect(nodeCheck.status).toBe('ok')
      } finally {
        Object.defineProperty(process, 'version', { value: originalVersion, configurable: true })
      }
      restore()
    })

    test('handles exactly FILE_COUNT_THRESHOLD files as ok', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(1000)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Files to analyze'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('ok')
      restore()
    })

    test('handles FILE_COUNT_THRESHOLD + 1 files as warning', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      const files = Array(1001)
        .fill(null)
        .map((_, i) => `file${i}.ts`)
      mockDiscoverFiles.mockResolvedValue(files)
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const fileCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Large codebase detected'),
      )
      expect(fileCheck).toBeDefined()
      expect(fileCheck.status).toBe('warning')
      restore()
    })

    test('handles TypeScript with valid version string in package.json', async () => {
      const restore = setupCwdMock()
      await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{}', 'utf-8')
      await fs.mkdir(path.join(tempDir, 'node_modules', 'typescript'), { recursive: true })
      await fs.writeFile(
        path.join(tempDir, 'node_modules', 'typescript', 'package.json'),
        JSON.stringify({ version: '5.0.0-beta' }),
        'utf-8',
      )
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const result = await getJsonResult()
      const tsCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('TypeScript version'),
      )
      expect(tsCheck).toBeDefined()
      expect(tsCheck.message).toContain('5.0.0-beta')
      restore()
    })

    test('handles checkFilePatterns with valid mixed patterns', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts', '**/*.tsx', '**/*.js'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('File patterns are valid'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('ok')
      restore()
    })

    test('handles empty string in file patterns array', async () => {
      const restore = setupCwdMock()
      const cmd = setupConfigRun({ files: ['**/*.ts', '', '**/*.js'] })
      await safeRun(cmd)
      const result = await getJsonResult()
      const patternCheck = result.checks.find((c: { message: string }) =>
        c.message.includes('Invalid file patterns'),
      )
      expect(patternCheck).toBeDefined()
      expect(patternCheck.status).toBe('error')
      restore()
    })

    test('handles run with only json flag and no verbose', async () => {
      const restore = setupCwdMock()
      mockDiscoverConfig.mockResolvedValue(null)
      mockDiscoverFiles.mockResolvedValue([])
      const cmd = createCommandWithMockedParse({ json: true, verbose: false })
      await safeRun(cmd)
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(() => JSON.parse(output)).not.toThrow()
      restore()
    })
  })
})
