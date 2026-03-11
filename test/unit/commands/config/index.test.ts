import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Config Command', () => {
  let Config: typeof import('../../../../src/commands/config/index.js').default
  let mockConsoleLog: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    Config = (await import('../../../../src/commands/config/index.js')).default
  })

  afterEach(() => {
    mockConsoleLog.mockRestore()
  })

  describe('Command metadata', () => {
    test('has correct description', () => {
      expect(Config.description).toBe('Manage CodeForge configuration')
    })

    test('has examples defined', () => {
      expect(Config.examples).toBeDefined()
      expect(Config.examples.length).toBeGreaterThan(0)
    })

    test('has examples with proper structure', () => {
      expect(Config.examples[0]).toHaveProperty('command')
      expect(Config.examples[0]).toHaveProperty('description')
    })

    test('has validate command example', () => {
      const example = Config.examples[0]
      expect(example.description).toBe('Validate the configuration file')
    })
  })

  describe('run', () => {
    test('logs config management message', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Manage CodeForge configuration')
    })

    test('logs available commands section', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Available commands:')
    })

    test('logs validate command', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('validate')
      expect(output).toContain('Validate the configuration file')
    })

    test('logs all expected lines in order', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const logCalls = mockConsoleLog.mock.calls.map((c) => c[0])
      expect(logCalls[0]).toBe('Manage CodeForge configuration')
      expect(logCalls[1]).toBe('')
      expect(logCalls[2]).toBe('Available commands:')
      expect(logCalls[3]).toBe('  validate  Validate the configuration file')
    })

    test('has exactly 4 log calls', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalledTimes(4)
    })
  })
})
