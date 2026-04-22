import { describe, test, expect, beforeEach, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getConfig: vi.fn().mockResolvedValue({ rules: {} }),
  findConfigPath: vi.fn().mockResolvedValue('/test/.codeforgerc.json'),
  parseEnvVars: vi.fn().mockReturnValue({}),
  mergeConfigs: vi.fn((a: Record<string, unknown>, b: Record<string, unknown>) => ({ ...a, ...b })),
  validateConfig: vi.fn((config: unknown) => config),
}))

vi.mock('../../../../src/config/cache.js', () => ({
  ConfigCache: vi.fn().mockImplementation(function () {
    return { getConfig: mocks.getConfig }
  }),
}))

vi.mock('../../../../src/config/discovery.js', () => ({
  findConfigPath: mocks.findConfigPath,
}))

vi.mock('../../../../src/config/env-parser.js', () => ({
  parseEnvVars: mocks.parseEnvVars,
}))

vi.mock('../../../../src/config/merger.js', () => ({
  mergeConfigs: mocks.mergeConfigs,
}))

vi.mock('../../../../src/config/validator.js', () => ({
  validateConfig: mocks.validateConfig,
}))

describe('ConfigVisualize Command', () => {
  let ConfigVisualize: typeof import('../../../../src/commands/config/visualize.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mocks.getConfig.mockResolvedValue({ rules: {} })
    mocks.findConfigPath.mockResolvedValue('/test/.codeforgerc.json')
    mocks.parseEnvVars.mockReturnValue({})
    mocks.mergeConfigs.mockImplementation(
      (a: Record<string, unknown>, b: Record<string, unknown>) => ({ ...a, ...b }),
    )
    mocks.validateConfig.mockImplementation((config: unknown) => config)

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

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

  function getOutput(): string {
    return mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
  }

  function getLogCalls(): string[] {
    return mockConsoleLog.mock.calls.map((c) => String(c[0] ?? ''))
  }

  // ═══════════════════════════════════════════
  // COMMAND METADATA
  // ═══════════════════════════════════════════
  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(ConfigVisualize.description).toBe('Visualize the current CodeForge configuration')
    })

    test('has examples defined', () => {
      expect(ConfigVisualize.examples).toBeDefined()
      expect(ConfigVisualize.examples.length).toBeGreaterThan(0)
    })

    test('has exactly three examples', () => {
      expect(ConfigVisualize.examples).toHaveLength(3)
    })

    test('first example describes tree visualization', () => {
      const ex = ConfigVisualize.examples[0] as { command: string; description: string }
      expect(ex.description).toContain('tree')
    })

    test('second example describes JSON output', () => {
      const ex = ConfigVisualize.examples[1] as { command: string; description: string }
      expect(ex.description).toContain('JSON')
    })

    test('third example describes sources display', () => {
      const ex = ConfigVisualize.examples[2] as { command: string; description: string }
      expect(ex.description).toContain('sources')
    })

    test('has json flag', () => {
      expect(ConfigVisualize.flags.json).toBeDefined()
      expect(ConfigVisualize.flags.json.default).toBe(false)
    })

    test('json flag has correct description', () => {
      expect(ConfigVisualize.flags.json.description).toBe('Output as JSON')
    })

    test('has sources flag', () => {
      expect(ConfigVisualize.flags.sources).toBeDefined()
      expect(ConfigVisualize.flags.sources.default).toBe(false)
    })

    test('sources flag has correct description', () => {
      expect(ConfigVisualize.flags.sources.description).toBe('Show configuration sources')
    })

    test('has exactly two flags', () => {
      const flagKeys = Object.keys(ConfigVisualize.flags)
      expect(flagKeys).toHaveLength(2)
      expect(flagKeys).toContain('json')
      expect(flagKeys).toContain('sources')
    })

    test('both flags are boolean type', () => {
      expect(ConfigVisualize.flags.json.type).toBe('boolean')
      expect(ConfigVisualize.flags.sources.type).toBe('boolean')
    })
  })

  // ═══════════════════════════════════════════
  // DEFAULT BEHAVIOR (NO FLAGS)
  // ═══════════════════════════════════════════
  describe('Default behavior (no flags)', () => {
    test('shows CodeForge Configuration header', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
    })

    test('shows Configuration label', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('Configuration:')
    })

    test('does not output JSON format', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(() => JSON.parse(getOutput())).toThrow()
    })

    test('does not show Sources section', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).not.toContain('Sources:')
    })

    test('calls findConfigPath with process.cwd()', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.findConfigPath).toHaveBeenCalledWith(process.cwd())
    })

    test('calls parseEnvVars', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.parseEnvVars).toHaveBeenCalledOnce()
    })

    test('calls mergeConfigs with file config and env config', async () => {
      mocks.getConfig.mockResolvedValue({ rules: { a: 'error' } })
      mocks.parseEnvVars.mockReturnValue({ files: ['*.ts'] })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.mergeConfigs).toHaveBeenCalledWith(
        { rules: { a: 'error' } },
        { files: ['*.ts'] },
      )
    })

    test('calls validateConfig with merged config', async () => {
      mocks.mergeConfigs.mockReturnValue({ rules: { test: 'error' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.validateConfig).toHaveBeenCalledWith({ rules: { test: 'error' } })
    })

    test('calls getConfig when config path is found', async () => {
      mocks.findConfigPath.mockResolvedValue('/test/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.getConfig).toHaveBeenCalledWith('/test/.codeforgerc.json')
    })

    test('does not call getConfig when no config path', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.getConfig).not.toHaveBeenCalled()
    })

    test('outputs empty lines for spacing', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const emptyCalls = calls.filter((c) => c === '')
      expect(emptyCalls.length).toBeGreaterThanOrEqual(2)
    })

    test('displays config tree from validated config', async () => {
      mocks.validateConfig.mockReturnValue({ rules: { 'max-complexity': 'error' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('max-complexity')
      expect(getOutput()).toContain('error')
    })

    test('creates ConfigCache instance', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const { ConfigCache } = await import('../../../../src/config/cache.js')
      expect(ConfigCache).toHaveBeenCalled()
    })

    test('displays trailing empty line', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      expect(calls[calls.length - 1]).toBe('')
    })

    test('header appears before Configuration label', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const output = getOutput()
      const headerIdx = output.indexOf('CodeForge Configuration')
      const configIdx = output.indexOf('Configuration:')
      expect(headerIdx).toBeGreaterThan(-1)
      expect(configIdx).toBeGreaterThan(-1)
      expect(headerIdx).toBeLessThan(configIdx)
    })
  })

  // ═══════════════════════════════════════════
  // --json FLAG - OUTPUT STRUCTURE
  // ═══════════════════════════════════════════
  describe('--json flag', () => {
    describe('JSON output structure', () => {
      test('outputs valid JSON', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        expect(() => JSON.parse(getOutput())).not.toThrow()
      })

      test('JSON has config property', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed).toHaveProperty('config')
      })

      test('JSON has sources property', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed).toHaveProperty('sources')
      })

      test('sources has env property', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources).toHaveProperty('env')
      })

      test('sources has file property', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources).toHaveProperty('file')
      })

      test('sources has path property', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources).toHaveProperty('path')
      })

      test('JSON has exactly two top-level keys', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(Object.keys(parsed)).toEqual(['config', 'sources'])
      })

      test('sources has exactly three keys', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(Object.keys(parsed.sources)).toEqual(['env', 'file', 'path'])
      })

      test('does not show CodeForge Configuration header', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        expect(getOutput()).not.toContain('CodeForge Configuration')
      })

      test('does not show Configuration tree label', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        expect(getOutput()).not.toContain('Configuration:')
      })

      test('does not show Sources section header', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        expect(getOutput()).not.toContain('Sources:')
      })

      test('returns early - single JSON log call', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const calls = getLogCalls()
        const jsonCalls = calls.filter((c) => {
          try {
            JSON.parse(c)
            return true
          } catch {
            return false
          }
        })
        expect(jsonCalls).toHaveLength(1)
      })

      test('JSON output is pretty-printed with 2-space indent', async () => {
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('\n  ')
      })
    })

    describe('JSON output with various configs', () => {
      test('config reflects validateConfig result', async () => {
        mocks.validateConfig.mockReturnValue({ rules: { 'no-eval': 'error' } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config).toEqual({ rules: { 'no-eval': 'error' } })
      })

      test('config with empty validated config', async () => {
        mocks.validateConfig.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config).toEqual({})
      })

      test('config with rules', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { 'no-eval': 'error', 'max-params': 'warning' },
        })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.rules).toEqual({ 'no-eval': 'error', 'max-params': 'warning' })
      })

      test('config with files array', async () => {
        mocks.validateConfig.mockReturnValue({ files: ['src/**/*.ts', 'lib/**/*.js'] })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.files).toEqual(['src/**/*.ts', 'lib/**/*.js'])
      })

      test('config with ignore array', async () => {
        mocks.validateConfig.mockReturnValue({ ignore: ['node_modules/**', 'dist/**'] })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.ignore).toEqual(['node_modules/**', 'dist/**'])
      })

      test('config with all fields', async () => {
        mocks.validateConfig.mockReturnValue({
          files: ['src/**/*.ts'],
          ignore: ['dist/**'],
          rules: { 'no-console': 'warning' },
        })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config).toEqual({
          files: ['src/**/*.ts'],
          ignore: ['dist/**'],
          rules: { 'no-console': 'warning' },
        })
      })

      test('config with complex nested rules', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: {
            'max-complexity': ['error', { max: 10 }],
            'max-params': ['warning', { max: 4 }],
          },
        })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.rules['max-complexity']).toEqual(['error', { max: 10 }])
        expect(parsed.config.rules['max-params']).toEqual(['warning', { max: 4 }])
      })

      test('config with single rule', async () => {
        mocks.validateConfig.mockReturnValue({ rules: { 'no-eval': 'error' } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(Object.keys(parsed.config.rules)).toHaveLength(1)
      })

      test('config with many rules', async () => {
        const rules: Record<string, string> = {}
        for (let i = 0; i < 20; i++) {
          rules[`rule-${i}`] = i % 2 === 0 ? 'error' : 'warning'
        }
        mocks.validateConfig.mockReturnValue({ rules })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(Object.keys(parsed.config.rules)).toHaveLength(20)
      })

      test('config with plugins', async () => {
        mocks.validateConfig.mockReturnValue({ plugins: ['codeforge-plugin-custom'] })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.plugins).toEqual(['codeforge-plugin-custom'])
      })

      test('config preserves null values', async () => {
        mocks.validateConfig.mockReturnValue({ rules: { disabled: null } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.rules.disabled).toBeNull()
      })

      test('config preserves boolean values', async () => {
        mocks.validateConfig.mockReturnValue({ strictMode: true, verbose: false })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.strictMode).toBe(true)
        expect(parsed.config.verbose).toBe(false)
      })

      test('config preserves numeric values', async () => {
        mocks.validateConfig.mockReturnValue({ maxWarnings: 10, timeout: 5000 })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.maxWarnings).toBe(10)
        expect(parsed.config.timeout).toBe(5000)
      })

      test('config with custom unknown fields', async () => {
        mocks.validateConfig.mockReturnValue({ customField: 'customValue', anotherField: 42 })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.config.customField).toBe('customValue')
        expect(parsed.config.anotherField).toBe(42)
      })
    })

    describe('JSON output with various source scenarios', () => {
      test('sources.env reflects parseEnvVars result', async () => {
        mocks.parseEnvVars.mockReturnValue({ files: ['src/**/*.ts'] })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.env).toEqual({ files: ['src/**/*.ts'] })
      })

      test('sources.file reflects getConfig result', async () => {
        mocks.getConfig.mockResolvedValue({ rules: { 'max-params': 'warning' } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({ rules: { 'max-params': 'warning' } })
      })

      test('sources.path reflects findConfigPath result', async () => {
        mocks.findConfigPath.mockResolvedValue('/custom/path/.codeforgerc.json')
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.path).toBe('/custom/path/.codeforgerc.json')
      })

      test('sources.path is null when no config found', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.path).toBeNull()
      })

      test('with empty file config and empty env config', async () => {
        mocks.getConfig.mockResolvedValue({})
        mocks.parseEnvVars.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({})
        expect(parsed.sources.env).toEqual({})
      })

      test('with populated file config and empty env config', async () => {
        mocks.getConfig.mockResolvedValue({ rules: { 'no-any': 'error' } })
        mocks.parseEnvVars.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({ rules: { 'no-any': 'error' } })
        expect(parsed.sources.env).toEqual({})
      })

      test('with empty file config and populated env config', async () => {
        mocks.getConfig.mockResolvedValue({})
        mocks.parseEnvVars.mockReturnValue({ rules: { 'no-debugger': 'warning' } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({})
        expect(parsed.sources.env).toEqual({ rules: { 'no-debugger': 'warning' } })
      })

      test('with both populated configs', async () => {
        mocks.getConfig.mockResolvedValue({ rules: { 'no-eval': 'error' } })
        mocks.parseEnvVars.mockReturnValue({ files: ['src/**/*.ts'] })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({ rules: { 'no-eval': 'error' } })
        expect(parsed.sources.env).toEqual({ files: ['src/**/*.ts'] })
      })

      test('with null config path and populated env', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        mocks.parseEnvVars.mockReturnValue({ rules: { 'no-console': 'error' } })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.path).toBeNull()
        expect(parsed.sources.file).toEqual({})
        expect(parsed.sources.env).toEqual({ rules: { 'no-console': 'error' } })
      })

      test('getConfig error results in empty file config', async () => {
        mocks.getConfig.mockRejectedValue(new Error('Cache error'))
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({})
      })

      test('env config with multiple keys', async () => {
        mocks.parseEnvVars.mockReturnValue({
          rules: { a: 'error' },
          files: ['*.ts'],
          ignore: ['dist/**'],
        })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(Object.keys(parsed.sources.env)).toHaveLength(3)
      })

      test('file config with deeply nested structure', async () => {
        mocks.getConfig.mockResolvedValue({
          rules: { category: { subcategory: { rule: 'error' } } },
        })
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file.rules.category.subcategory.rule).toBe('error')
      })

      test('getConfig returns null results in empty file config', async () => {
        mocks.getConfig.mockResolvedValue(null)
        const cmd = createCommandWithMockedParse({ json: true, sources: false })
        await cmd.run()
        const parsed = JSON.parse(getOutput())
        expect(parsed.sources.file).toEqual({})
      })
    })
  })

  // ═══════════════════════════════════════════
  // --sources FLAG - WITH CONFIG FILE
  // ═══════════════════════════════════════════
  describe('--sources flag', () => {
    describe('Source display with config file present', () => {
      test('shows Sources header', async () => {
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('Sources:')
      })

      test('shows file path when config found', async () => {
        mocks.findConfigPath.mockResolvedValue('/test/.codeforgerc.json')
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File:')
        expect(getOutput()).toContain('/test/.codeforgerc.json')
      })

      test('shows file settings count with populated config', async () => {
        mocks.getConfig.mockResolvedValue({ rules: { a: 'error' }, files: ['*.ts'] })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 2 keys')
      })

      test('does not show file settings count with empty config', async () => {
        mocks.getConfig.mockResolvedValue({})
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toContain('File settings:')
      })

      test('shows file settings for single key config', async () => {
        mocks.getConfig.mockResolvedValue({ rules: { a: 'error' } })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 1 keys')
      })

      test('shows correct count for many file config keys', async () => {
        mocks.getConfig.mockResolvedValue({
          rules: {},
          files: [],
          ignore: [],
          plugins: [],
          extra: true,
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 5 keys')
      })

      test('shows file settings count for 10 keys', async () => {
        const config: Record<string, string> = {}
        for (let i = 0; i < 10; i++) config[`key${i}`] = `val${i}`
        mocks.getConfig.mockResolvedValue(config)
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 10 keys')
      })

      test('File: label appears with config path', async () => {
        mocks.findConfigPath.mockResolvedValue('/project/codeforge.json')
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        const calls = getLogCalls()
        const fileLine = calls.find((c) => c.includes('File:') && c.includes('codeforge.json'))
        expect(fileLine).toBeDefined()
      })
    })

    describe('Source display without config file', () => {
      test('shows No configuration file found', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('No configuration file found')
      })

      test('does not show File: label when path is null', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toMatch(/File:.*\.json/)
      })

      test('does not show File settings count when path is null', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toContain('File settings:')
      })

      test('still shows env vars when no config file', async () => {
        mocks.findConfigPath.mockResolvedValue(null)
        mocks.parseEnvVars.mockReturnValue({ rules: { a: 'error' } })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('No configuration file found')
        expect(getOutput()).toContain('Environment variables: 1 keys')
      })

      test('empty string config path shows no file found', async () => {
        mocks.findConfigPath.mockResolvedValue('')
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('No configuration file found')
      })

      test('empty string config path does not call getConfig', async () => {
        mocks.findConfigPath.mockResolvedValue('')
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(mocks.getConfig).not.toHaveBeenCalled()
      })
    })

    describe('Source display with env vars', () => {
      test('shows env vars count when env config has keys', async () => {
        mocks.parseEnvVars.mockReturnValue({ rules: { 'no-eval': 'error' } })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('Environment variables: 1 keys')
      })

      test('does not show env vars count when empty', async () => {
        mocks.parseEnvVars.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toContain('Environment variables:')
      })

      test('shows correct count for multiple env keys', async () => {
        mocks.parseEnvVars.mockReturnValue({ rules: {}, files: [], ignore: [] })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('Environment variables: 3 keys')
      })

      test('shows both file and env when both populated', async () => {
        mocks.getConfig.mockResolvedValue({ rules: {} })
        mocks.parseEnvVars.mockReturnValue({ files: ['*.ts'] })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 1 keys')
        expect(getOutput()).toContain('Environment variables: 1 keys')
      })

      test('shows only file info when no env vars', async () => {
        mocks.getConfig.mockResolvedValue({ rules: {} })
        mocks.parseEnvVars.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('File settings: 1 keys')
        expect(getOutput()).not.toContain('Environment variables:')
      })

      test('shows only env info when no file config keys', async () => {
        mocks.getConfig.mockResolvedValue({})
        mocks.parseEnvVars.mockReturnValue({ rules: { a: 'error' } })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toContain('File settings:')
        expect(getOutput()).toContain('Environment variables: 1 keys')
      })

      test('shows neither when both empty', async () => {
        mocks.getConfig.mockResolvedValue({})
        mocks.parseEnvVars.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).not.toContain('File settings:')
        expect(getOutput()).not.toContain('Environment variables:')
      })

      test('Sources appears before Configuration tree', async () => {
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        const output = getOutput()
        expect(output.indexOf('Sources:')).toBeLessThan(output.indexOf('Configuration:'))
      })

      test('has empty line after Sources header', async () => {
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        const calls = getLogCalls()
        const sourcesIdx = calls.findIndex((c) => c.includes('Sources:'))
        expect(sourcesIdx).toBeGreaterThan(-1)
        if (sourcesIdx + 1 < calls.length) {
          expect(calls[sourcesIdx + 1]).toBe('')
        }
      })

      test('shows correct env count for 5 keys', async () => {
        mocks.parseEnvVars.mockReturnValue({ a: 1, b: 2, c: 3, d: 4, e: 5 })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('Environment variables: 5 keys')
      })

      test('env with rules having severity', async () => {
        mocks.parseEnvVars.mockReturnValue({
          rules: { 'max-complexity': 'error', 'no-console': 'warning' },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: true })
        await cmd.run()
        expect(getOutput()).toContain('Environment variables: 1 keys')
      })
    })
  })

  // ═══════════════════════════════════════════
  // CONFIG TREE DISPLAY - FLAT VALUES
  // ═══════════════════════════════════════════
  describe('Config tree display', () => {
    describe('Flat config values', () => {
      test('displays single string key-value', async () => {
        mocks.validateConfig.mockReturnValue({ name: 'test-project' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('name')
        expect(getOutput()).toContain('test-project')
      })

      test('displays multiple string key-values', async () => {
        mocks.validateConfig.mockReturnValue({ name: 'project', version: '1.0.0' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('name')
        expect(getOutput()).toContain('project')
        expect(getOutput()).toContain('version')
        expect(getOutput()).toContain('1.0.0')
      })

      test('displays numeric values', async () => {
        mocks.validateConfig.mockReturnValue({ maxWarnings: 10 })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('maxWarnings')
        expect(getOutput()).toContain('10')
      })

      test('displays boolean true', async () => {
        mocks.validateConfig.mockReturnValue({ strict: true })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('strict')
        expect(getOutput()).toContain('true')
      })

      test('displays boolean false', async () => {
        mocks.validateConfig.mockReturnValue({ verbose: false })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('verbose')
        expect(getOutput()).toContain('false')
      })

      test('displays null values', async () => {
        mocks.validateConfig.mockReturnValue({ optional: null })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('optional')
        expect(getOutput()).toContain('null')
      })

      test('displays undefined values', async () => {
        mocks.validateConfig.mockReturnValue({ missing: undefined })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('missing')
        expect(getOutput()).toContain('undefined')
      })

      test('handles empty config object', async () => {
        mocks.validateConfig.mockReturnValue({})
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('Configuration:')
        expect(getOutput()).toContain('CodeForge Configuration')
      })

      test('displays zero value', async () => {
        mocks.validateConfig.mockReturnValue({ count: 0 })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('count')
        expect(getOutput()).toContain('0')
      })

      test('displays negative numbers', async () => {
        mocks.validateConfig.mockReturnValue({ offset: -1 })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('-1')
      })

      test('displays float values', async () => {
        mocks.validateConfig.mockReturnValue({ threshold: 0.5 })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('0.5')
      })

      test('displays empty string value', async () => {
        mocks.validateConfig.mockReturnValue({ name: '' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('name')
      })
    })

    describe('Nested config structures', () => {
      test('displays nested object key', async () => {
        mocks.validateConfig.mockReturnValue({ rules: { 'max-params': 'error' } })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('rules')
        expect(getOutput()).toContain('max-params')
        expect(getOutput()).toContain('error')
      })

      test('displays 2-level nested config', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { complexity: { 'max-nesting': 'error' } },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('rules')
        expect(getOutput()).toContain('complexity')
        expect(getOutput()).toContain('max-nesting')
        expect(getOutput()).toContain('error')
      })

      test('displays 3-level nested config', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { category: { subcategory: { rule: 'warning' } } },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('rules')
        expect(getOutput()).toContain('category')
        expect(getOutput()).toContain('subcategory')
        expect(getOutput()).toContain('rule')
        expect(getOutput()).toContain('warning')
      })

      test('displays 4-level nested config', async () => {
        mocks.validateConfig.mockReturnValue({ a: { b: { c: { d: 'deep-value' } } } })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('deep-value')
      })

      test('displays 5-level nested config', async () => {
        mocks.validateConfig.mockReturnValue({ l1: { l2: { l3: { l4: { l5: 'very-deep' } } } } })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('very-deep')
      })

      test('displays multiple nested objects at same level', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { rule1: 'error' },
          overrides: { rule2: 'warning' },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('rules')
        expect(getOutput()).toContain('overrides')
        expect(getOutput()).toContain('rule1')
        expect(getOutput()).toContain('rule2')
      })

      test('displays mix of primitives and nested objects', async () => {
        mocks.validateConfig.mockReturnValue({
          name: 'test',
          rules: { 'no-eval': 'error' },
          version: '1.0',
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('name')
        expect(getOutput()).toContain('rules')
        expect(getOutput()).toContain('version')
      })

      test('displays nested object with mixed value types', async () => {
        mocks.validateConfig.mockReturnValue({
          settings: { enabled: true, count: 5, name: 'test' },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('enabled')
        expect(getOutput()).toContain('true')
        expect(getOutput()).toContain('count')
        expect(getOutput()).toContain('5')
      })

      test('handles empty nested object', async () => {
        mocks.validateConfig.mockReturnValue({ rules: {} })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('rules')
      })

      test('handles object with null nested value', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { disabled: null, enabled: 'error' },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('disabled')
        expect(getOutput()).toContain('null')
        expect(getOutput()).toContain('enabled')
        expect(getOutput()).toContain('error')
      })
    })

    describe('Arrays as nested objects', () => {
      test('displays array values with numeric keys', async () => {
        mocks.validateConfig.mockReturnValue({ files: ['*.ts', '*.js'] })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('files')
        expect(getOutput()).toContain('*.ts')
        expect(getOutput()).toContain('*.js')
      })

      test('displays single-element array', async () => {
        mocks.validateConfig.mockReturnValue({ files: ['*.ts'] })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('*.ts')
      })

      test('displays empty array as nested object', async () => {
        mocks.validateConfig.mockReturnValue({ files: [] })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('files')
      })

      test('displays rules with severity-options array', async () => {
        mocks.validateConfig.mockReturnValue({
          rules: { 'max-complexity': ['error', { max: 10 }] },
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('max-complexity')
      })

      test('displays array with many elements', async () => {
        mocks.validateConfig.mockReturnValue({
          files: ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
        })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('a.ts')
        expect(getOutput()).toContain('e.ts')
      })
    })

    describe('Edge case values in tree', () => {
      test('displays glob patterns in values', async () => {
        mocks.validateConfig.mockReturnValue({ pattern: '**/*.test.ts' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('**/*.test.ts')
      })

      test('displays URLs in values', async () => {
        mocks.validateConfig.mockReturnValue({ url: 'http://localhost:3000' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('http://localhost:3000')
      })

      test('displays long string values', async () => {
        const longStr = 'a'.repeat(200)
        mocks.validateConfig.mockReturnValue({ longValue: longStr })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain(longStr)
      })

      test('displays special characters in values', async () => {
        mocks.validateConfig.mockReturnValue({ special: '<script>alert("xss")</script>' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('<script>')
      })

      test('displays unicode values', async () => {
        mocks.validateConfig.mockReturnValue({ emoji: 'Hello World' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('Hello World')
      })

      test('displays path with spaces', async () => {
        mocks.validateConfig.mockReturnValue({ path: '/path/with spaces/config.json' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('/path/with spaces/config.json')
      })

      test('displays whitespace-heavy values', async () => {
        mocks.validateConfig.mockReturnValue({ indent: '  tabs  and  spaces  ' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('indent')
      })

      test('displays newline in string as literal', async () => {
        mocks.validateConfig.mockReturnValue({ multiline: 'line1\nline2' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('line1')
      })

      test('displays date-like strings', async () => {
        mocks.validateConfig.mockReturnValue({ date: '2024-01-15T10:30:00Z' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('2024-01-15T10:30:00Z')
      })

      test('displays semver strings', async () => {
        mocks.validateConfig.mockReturnValue({ version: '1.2.3-beta.4+build.5' })
        const cmd = createCommandWithMockedParse({ json: false, sources: false })
        await cmd.run()
        expect(getOutput()).toContain('1.2.3-beta.4+build.5')
      })
    })
  })

  // ═══════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════
  describe('Error handling', () => {
    test('getConfig rejection results in empty fileConfig', async () => {
      mocks.getConfig.mockRejectedValue(new Error('read error'))
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.file).toEqual({})
    })

    test('getConfig rejection still completes run', async () => {
      mocks.getConfig.mockRejectedValue(new Error('cache fail'))
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
    })

    test('validateConfig rejection falls back to mergedConfig', async () => {
      mocks.validateConfig.mockImplementation(() => {
        throw new Error('validation error')
      })
      mocks.mergeConfigs.mockReturnValue({ rules: { fallback: 'error' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('fallback')
    })

    test('validateConfig rejection still shows config tree', async () => {
      mocks.validateConfig.mockImplementation(() => {
        throw new Error('invalid')
      })
      mocks.mergeConfigs.mockReturnValue({ key: 'value' })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('Configuration:')
    })

    test('validateConfig rejection with JSON flag still outputs', async () => {
      mocks.validateConfig.mockImplementation(() => {
        throw new Error('invalid')
      })
      mocks.mergeConfigs.mockReturnValue({ key: 'value' })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config).toEqual({ key: 'value' })
    })

    test('null config from getConfig treated as empty', async () => {
      mocks.getConfig.mockResolvedValue(null)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
    })

    test('undefined config from getConfig', async () => {
      mocks.getConfig.mockResolvedValue(undefined)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
    })

    test('findConfigPath rejection propagates', async () => {
      mocks.findConfigPath.mockRejectedValue(new Error('disk error'))
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await expect(cmd.run()).rejects.toThrow('disk error')
    })

    test('parseEnvVars throwing propagates', async () => {
      mocks.parseEnvVars.mockImplementation(() => {
        throw new Error('env error')
      })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await expect(cmd.run()).rejects.toThrow('env error')
    })

    test('mergeConfigs throwing propagates', async () => {
      mocks.mergeConfigs.mockImplementation(() => {
        throw new Error('merge error')
      })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await expect(cmd.run()).rejects.toThrow('merge error')
    })
  })

  // ═══════════════════════════════════════════
  // COMBINED FLAGS
  // ═══════════════════════════════════════════
  describe('Combined flags', () => {
    test('--json with --sources outputs JSON (json takes priority)', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed).toHaveProperty('config')
      expect(parsed).toHaveProperty('sources')
    })

    test('--json with --sources does not show tree output', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await cmd.run()
      expect(getOutput()).not.toContain('CodeForge Configuration')
    })

    test('--json with --sources includes source info in JSON', async () => {
      mocks.findConfigPath.mockResolvedValue('/path/config.json')
      mocks.getConfig.mockResolvedValue({ rules: {} })
      mocks.parseEnvVars.mockReturnValue({ files: ['*.ts'] })
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('/path/config.json')
      expect(parsed.sources.file).toEqual({ rules: {} })
      expect(parsed.sources.env).toEqual({ files: ['*.ts'] })
    })

    test('--sources without --json shows tree and sources', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('Sources:')
      expect(getOutput()).toContain('Configuration:')
    })

    test('neither flag shows only tree', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
      expect(getOutput()).not.toContain('Sources:')
    })

    test('--json with --sources shows single JSON output', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await cmd.run()
      const calls = getLogCalls()
      const jsonCalls = calls.filter((c) => {
        try {
          JSON.parse(c)
          return true
        } catch {
          return false
        }
      })
      expect(jsonCalls).toHaveLength(1)
    })

    test('--json ignores --sources for display purposes', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await cmd.run()
      expect(getOutput()).not.toContain('Sources:')
      expect(getOutput()).not.toContain('File:')
    })

    test('both flags false produces default tree output', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('CodeForge Configuration')
      expect(output).toContain('Configuration:')
      expect(output).not.toContain('Sources:')
    })
  })

  // ═══════════════════════════════════════════
  // CONFIG PATH VARIATIONS
  // ═══════════════════════════════════════════
  describe('Config path variations', () => {
    test('handles .codeforgerc path', async () => {
      mocks.findConfigPath.mockResolvedValue('/project/.codeforgerc')
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('/project/.codeforgerc')
    })

    test('handles codeforge.config.js path', async () => {
      mocks.findConfigPath.mockResolvedValue('/project/codeforge.config.js')
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('/project/codeforge.config.js')
    })

    test('handles .codeforge.json path', async () => {
      mocks.findConfigPath.mockResolvedValue('/project/.codeforge.json')
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('/project/.codeforge.json')
    })

    test('handles absolute path', async () => {
      mocks.findConfigPath.mockResolvedValue('/absolute/path/to/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('/absolute/path/to/.codeforgerc.json')
    })

    test('handles path with spaces', async () => {
      mocks.findConfigPath.mockResolvedValue('/my project/config/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('/my project/config/.codeforgerc.json')
    })

    test('handles path with special characters', async () => {
      mocks.findConfigPath.mockResolvedValue('/project@v2/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('/project@v2/.codeforgerc.json')
    })

    test('handles very long path', async () => {
      const longPath = '/very/long/' + 'nested/'.repeat(50) + '.codeforgerc.json'
      mocks.findConfigPath.mockResolvedValue(longPath)
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe(longPath)
    })

    test('handles relative-looking path string', async () => {
      mocks.findConfigPath.mockResolvedValue('./config/.codeforgerc.json')
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.sources.path).toBe('./config/.codeforgerc.json')
    })
  })

  // ═══════════════════════════════════════════
  // MERGE BEHAVIOR
  // ═══════════════════════════════════════════
  describe('Merge behavior', () => {
    test('passes fileConfig and envConfig to mergeConfigs', async () => {
      mocks.getConfig.mockResolvedValue({ rules: { a: 'error' }, files: ['*.ts'] })
      mocks.parseEnvVars.mockReturnValue({ rules: { b: 'warning' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.mergeConfigs).toHaveBeenCalledWith(
        { rules: { a: 'error' }, files: ['*.ts'] },
        { rules: { b: 'warning' } },
      )
    })

    test('passes empty object when no config path', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.mergeConfigs).toHaveBeenCalledWith({}, {})
    })

    test('passes empty fileConfig when getConfig throws', async () => {
      mocks.getConfig.mockRejectedValue(new Error('fail'))
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.mergeConfigs).toHaveBeenCalledWith({}, {})
    })

    test('mergeConfigs result is passed to validateConfig', async () => {
      const mergedResult = { rules: { merged: true } }
      mocks.mergeConfigs.mockReturnValue(mergedResult)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.validateConfig).toHaveBeenCalledWith(mergedResult)
    })

    test('merge is called exactly once per run', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.mergeConfigs).toHaveBeenCalledOnce()
    })

    test('validate is called exactly once per run', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.validateConfig).toHaveBeenCalledOnce()
    })

    test('getConfig is called exactly once when path found', async () => {
      mocks.findConfigPath.mockResolvedValue('/test/config.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(mocks.getConfig).toHaveBeenCalledOnce()
    })

    test('env overrides file config via merge', async () => {
      mocks.getConfig.mockResolvedValue({ files: ['*.ts'] })
      mocks.parseEnvVars.mockReturnValue({ files: ['*.js'] })
      mocks.mergeConfigs.mockReturnValue({ files: ['*.js'] })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config.files).toEqual(['*.js'])
    })

    test('full config flow from file to tree display', async () => {
      mocks.findConfigPath.mockResolvedValue('/test/config.json')
      mocks.getConfig.mockResolvedValue({ rules: { 'no-eval': 'error' }, files: ['src/**/*.ts'] })
      mocks.parseEnvVars.mockReturnValue({ ignore: ['dist/**'] })
      mocks.mergeConfigs.mockReturnValue({
        rules: { 'no-eval': 'error' },
        files: ['src/**/*.ts'],
        ignore: ['dist/**'],
      })
      mocks.validateConfig.mockReturnValue({
        rules: { 'no-eval': 'error' },
        files: ['src/**/*.ts'],
        ignore: ['dist/**'],
      })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('no-eval')
      expect(output).toContain('error')
      expect(output).toContain('src/**/*.ts')
      expect(output).toContain('dist/**')
    })

    test('full config flow with JSON output', async () => {
      mocks.findConfigPath.mockResolvedValue('/test/config.json')
      mocks.getConfig.mockResolvedValue({ rules: { a: 'error' } })
      mocks.parseEnvVars.mockReturnValue({ files: ['*.ts'] })
      mocks.mergeConfigs.mockReturnValue({ rules: { a: 'error' }, files: ['*.ts'] })
      mocks.validateConfig.mockReturnValue({ rules: { a: 'error' }, files: ['*.ts'] })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config).toEqual({ rules: { a: 'error' }, files: ['*.ts'] })
      expect(parsed.sources.file).toEqual({ rules: { a: 'error' } })
      expect(parsed.sources.env).toEqual({ files: ['*.ts'] })
      expect(parsed.sources.path).toBe('/test/config.json')
    })
  })

  // ═══════════════════════════════════════════
  // OUTPUT FORMAT DETAILS
  // ═══════════════════════════════════════════
  describe('Output format details', () => {
    test('tree output uses indentation for nested values', async () => {
      mocks.validateConfig.mockReturnValue({ rules: { nested: 'value' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const indentedCalls = calls.filter((c) => c.startsWith('    '))
      expect(indentedCalls.length).toBeGreaterThan(0)
    })

    test('tree output has double indentation for level 2', async () => {
      mocks.validateConfig.mockReturnValue({ a: { b: 'val' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const doubleIndented = calls.filter((c) => c.startsWith('        '))
      expect(doubleIndented.length).toBeGreaterThan(0)
    })

    test('tree output has triple indentation for level 3', async () => {
      mocks.validateConfig.mockReturnValue({ a: { b: { c: 'val' } } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const tripleIndented = calls.filter((c) => c.startsWith('            '))
      expect(tripleIndented.length).toBeGreaterThan(0)
    })

    test('header has leading empty line', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      expect(calls[0]).toBe('')
    })

    test('header is on second log call', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      expect(calls[1]).toContain('CodeForge Configuration')
    })

    test('empty line after header', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      expect(calls[2]).toBe('')
    })

    test('Configuration label comes after empty line', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      expect(calls[3]).toContain('Configuration:')
    })

    test('sources section has 4-space indent', async () => {
      mocks.findConfigPath.mockResolvedValue('/test/config.json')
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      const calls = getLogCalls()
      const sourceLines = calls.filter((c) => c.includes('File:'))
      expect(sourceLines.length).toBeGreaterThan(0)
      expect(sourceLines[0]).toContain('    ')
    })

    test('JSON output is properly formatted', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const output = getOutput()
      const jsonStr = output.split('\n').find((line) => line.trim().startsWith('{'))
      expect(jsonStr).toBeDefined()
    })

    test('tree keys for objects have colon suffix', async () => {
      mocks.validateConfig.mockReturnValue({ rules: { key: 'val' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const rulesLine = calls.find((c) => c.includes('rules') && c.trimEnd().endsWith(':'))
      expect(rulesLine).toBeDefined()
    })

    test('tree primitive keys have key: value format', async () => {
      mocks.validateConfig.mockReturnValue({ name: 'test' })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const calls = getLogCalls()
      const nameLine = calls.find((c) => c.includes('name') && c.includes('test'))
      expect(nameLine).toBeDefined()
    })
  })

  // ═══════════════════════════════════════════
  // LARGE CONFIG
  // ═══════════════════════════════════════════
  describe('Large config', () => {
    test('handles config with 50 rules', async () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 50; i++) rules[`rule-${i}`] = 'error'
      mocks.validateConfig.mockReturnValue({ rules })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(Object.keys(parsed.config.rules)).toHaveLength(50)
    })

    test('handles config with many files patterns', async () => {
      const files: string[] = []
      for (let i = 0; i < 30; i++) files.push(`**/*.ext${i}`)
      mocks.validateConfig.mockReturnValue({ files })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config.files).toHaveLength(30)
    })

    test('handles deeply nested config in tree', async () => {
      let config: Record<string, unknown> = { value: 'bottom' }
      for (let i = 0; i < 10; i++) {
        config = { [`level${i}`]: config }
      }
      mocks.validateConfig.mockReturnValue(config)
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('bottom')
    })

    test('handles config with 100 keys', async () => {
      const config: Record<string, string> = {}
      for (let i = 0; i < 100; i++) config[`key${i}`] = `val${i}`
      mocks.validateConfig.mockReturnValue(config)
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(Object.keys(parsed.config)).toHaveLength(100)
    })

    test('handles large JSON output without crashing', async () => {
      const rules: Record<string, unknown> = {}
      for (let i = 0; i < 200; i++) rules[`rule-${i}`] = { severity: 'error', options: { max: i } }
      mocks.validateConfig.mockReturnValue({ rules })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(Object.keys(parsed.config.rules)).toHaveLength(200)
    })

    test('handles large tree output without crashing', async () => {
      const rules: Record<string, string> = {}
      for (let i = 0; i < 50; i++) rules[`rule-${i}`] = `severity-${i}`
      mocks.validateConfig.mockReturnValue({ rules })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('rule-0')
      expect(getOutput()).toContain('rule-49')
    })

    test('handles large file config in sources', async () => {
      const fileConfig: Record<string, unknown> = {}
      for (let i = 0; i < 20; i++) fileConfig[`setting${i}`] = `value${i}`
      mocks.getConfig.mockResolvedValue(fileConfig)
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('File settings: 20 keys')
    })

    test('handles large env config in sources', async () => {
      const envConfig: Record<string, unknown> = {}
      for (let i = 0; i < 15; i++) envConfig[`env${i}`] = i
      mocks.parseEnvVars.mockReturnValue(envConfig)
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('Environment variables: 15 keys')
    })
  })

  // ═══════════════════════════════════════════
  // INTEGRATION SCENARIOS
  // ═══════════════════════════════════════════
  describe('Integration scenarios', () => {
    test('typical usage - file config only, tree output', async () => {
      mocks.findConfigPath.mockResolvedValue('/project/.codeforgerc.json')
      mocks.getConfig.mockResolvedValue({
        rules: { 'max-complexity': 'error', 'no-eval': 'warning' },
        files: ['src/**/*.ts'],
      })
      mocks.parseEnvVars.mockReturnValue({})
      mocks.mergeConfigs.mockReturnValue({
        rules: { 'max-complexity': 'error', 'no-eval': 'warning' },
        files: ['src/**/*.ts'],
      })
      mocks.validateConfig.mockReturnValue({
        rules: { 'max-complexity': 'error', 'no-eval': 'warning' },
        files: ['src/**/*.ts'],
      })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('CodeForge Configuration')
      expect(output).toContain('max-complexity')
      expect(output).toContain('no-eval')
      expect(output).toContain('src/**/*.ts')
    })

    test('typical usage - env config only, JSON output', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      mocks.parseEnvVars.mockReturnValue({ rules: { 'no-console': 'error' } })
      mocks.mergeConfigs.mockReturnValue({ rules: { 'no-console': 'error' } })
      mocks.validateConfig.mockReturnValue({ rules: { 'no-console': 'error' } })
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config.rules['no-console']).toBe('error')
      expect(parsed.sources.path).toBeNull()
      expect(parsed.sources.file).toEqual({})
      expect(parsed.sources.env).toEqual({ rules: { 'no-console': 'error' } })
    })

    test('typical usage - file + env, sources display', async () => {
      mocks.findConfigPath.mockResolvedValue('/project/.codeforgerc.json')
      mocks.getConfig.mockResolvedValue({ rules: { a: 'error' } })
      mocks.parseEnvVars.mockReturnValue({ files: ['*.ts'] })
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('Sources:')
      expect(output).toContain('File:')
      expect(output).toContain('File settings: 1 keys')
      expect(output).toContain('Environment variables: 1 keys')
      expect(output).toContain('Configuration:')
    })

    test('no config at all - tree output', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      mocks.parseEnvVars.mockReturnValue({})
      mocks.mergeConfigs.mockReturnValue({})
      mocks.validateConfig.mockReturnValue({})
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      expect(getOutput()).toContain('CodeForge Configuration')
      expect(getOutput()).toContain('Configuration:')
    })

    test('no config at all - JSON output', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      mocks.parseEnvVars.mockReturnValue({})
      mocks.mergeConfigs.mockReturnValue({})
      mocks.validateConfig.mockReturnValue({})
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await cmd.run()
      const parsed = JSON.parse(getOutput())
      expect(parsed.config).toEqual({})
      expect(parsed.sources.path).toBeNull()
      expect(parsed.sources.file).toEqual({})
      expect(parsed.sources.env).toEqual({})
    })

    test('no config at all - sources display', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      mocks.parseEnvVars.mockReturnValue({})
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('No configuration file found')
      expect(output).not.toContain('Environment variables:')
    })

    test('multiple runs are independent', async () => {
      mocks.validateConfig.mockReturnValue({ a: 'first' })
      const cmd1 = createCommandWithMockedParse({ json: true, sources: false })
      await cmd1.run()
      const firstOutput = getOutput()
      const first = JSON.parse(firstOutput)

      mockConsoleLog.mockClear()
      mocks.validateConfig.mockReturnValue({ b: 'second' })
      const cmd2 = createCommandWithMockedParse({ json: true, sources: false })
      await cmd2.run()
      const secondOutput = getOutput()
      const second = JSON.parse(secondOutput)

      expect(first.config).toEqual({ a: 'first' })
      expect(second.config).toEqual({ b: 'second' })
    })

    test('run method returns void', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      const result = await cmd.run()
      expect(result).toBeUndefined()
    })

    test('command can be instantiated with empty argv', () => {
      const cmd = new ConfigVisualize([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('command can be instantiated with different argv', () => {
      const cmd = new ConfigVisualize(['--json'], {} as never)
      expect(cmd).toBeDefined()
    })

    test('run completes without throwing in happy path', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('JSON run completes without throwing', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: false })
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('sources run completes without throwing', async () => {
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('combined flags run completes without throwing', async () => {
      const cmd = createCommandWithMockedParse({ json: true, sources: true })
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('default config from validator produces tree', async () => {
      mocks.validateConfig.mockReturnValue({
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
        rules: {},
      })
      const cmd = createCommandWithMockedParse({ json: false, sources: false })
      await cmd.run()
      const output = getOutput()
      expect(output).toContain('files')
      expect(output).toContain('ignore')
      expect(output).toContain('rules')
    })

    test('env-only config with sources shows env count', async () => {
      mocks.findConfigPath.mockResolvedValue(null)
      mocks.parseEnvVars.mockReturnValue({ rules: { a: 'error', b: 'warning' } })
      const cmd = createCommandWithMockedParse({ json: false, sources: true })
      await cmd.run()
      expect(getOutput()).toContain('Environment variables: 1 keys')
      expect(getOutput()).toContain('No configuration file found')
    })
  })
})
