import { describe, test, expect, beforeEach, vi } from 'vitest'

vi.mock('../../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return {
      getConfig: vi.fn().mockResolvedValue({ rules: {} }),
    }
  }),
}))

vi.mock('../../../../src/config/discovery.js', () => ({
  findConfigPath: vi.fn().mockResolvedValue('/test/.codeforgerc.json'),
}))

vi.mock('../../../../src/config/env-parser.js', () => ({
  parseEnvVars: vi.fn().mockReturnValue({}),
}))

vi.mock('../../../../src/config/merger.js', () => ({
  mergeConfigs: vi.fn((a, b) => ({ ...a, ...b })),
}))

vi.mock('../../../../src/config/validator.js', () => ({
  validateConfig: vi.fn((config) => config),
}))

describe('ConfigVisualize Command', () => {
  let ConfigVisualize: typeof import('../../../../src/commands/config/visualize.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>
  let mockFindConfigPath: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    const discovery = await import('../../../../src/config/discovery.js')
    mockFindConfigPath = discovery.findConfigPath as ReturnType<typeof vi.fn>

    ConfigVisualize = (await import('../../../../src/commands/config/visualize.js')).default
  })

  function createCommandWithMockedParse(flags: Record<string, unknown> = {}) {
    const command = new ConfigVisualize([], {} as never)
    const cmdWithMock = command as unknown as { parse: ReturnType<typeof vi.fn> }
    cmdWithMock.parse = vi.fn().mockResolvedValue({
      args: {},
      flags,
    })
    return command
  }

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(ConfigVisualize.description).toBe('Visualize the current CodeForge configuration')
    })

    test('has examples defined', () => {
      expect(ConfigVisualize.examples).toBeDefined()
      expect(ConfigVisualize.examples.length).toBeGreaterThan(0)
    })

    test('has json flag', () => {
      expect(ConfigVisualize.flags.json).toBeDefined()
      expect(ConfigVisualize.flags.json.default).toBe(false)
    })

    test('has sources flag', () => {
      expect(ConfigVisualize.flags.sources).toBeDefined()
      expect(ConfigVisualize.flags.sources.default).toBe(false)
    })
  })

  describe('run', () => {
    test('outputs JSON format when json flag is set', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: false })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      const parsed = JSON.parse(output)
      expect(parsed).toHaveProperty('config')
      expect(parsed).toHaveProperty('sources')
    })

    test('shows config tree by default', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('CodeForge Configuration')
      expect(output).toContain('Configuration:')
    })

    test('shows sources when sources flag is set', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: true })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('Sources:')
    })

    test('displays config file path when found', async () => {
      mockFindConfigPath.mockResolvedValue('/test/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: true })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('File:')
      expect(output).toContain('/test/.codeforgerc.json')
    })

    test('handles missing config file', async () => {
      mockFindConfigPath.mockResolvedValue(null)
      const cmd = createCommandWithMockedParse({ json: false, sources: true })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      expect(output).toContain('No configuration file found')
    })

    test('JSON output includes sources', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: false })

      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')

      const parsed = JSON.parse(output)
      expect(parsed.sources).toHaveProperty('env')
      expect(parsed.sources).toHaveProperty('file')
      expect(parsed.sources).toHaveProperty('path')
    })
  })
})
