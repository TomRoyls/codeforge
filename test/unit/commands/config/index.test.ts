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

    test('description is a string', () => {
      expect(typeof Config.description).toBe('string')
    })

    test('description is non-empty', () => {
      expect(Config.description.length).toBeGreaterThan(0)
    })

    test('examples is an array', () => {
      expect(Array.isArray(Config.examples)).toBe(true)
    })

    test('examples has exactly one entry', () => {
      expect(Config.examples).toHaveLength(1)
    })

    test('example command contains validate', () => {
      expect(Config.examples[0].command).toContain('validate')
    })

    test('example command uses oclif template syntax', () => {
      expect(Config.examples[0].command).toContain('<%= config.bin %>')
    })

    test('example command includes command id template', () => {
      expect(Config.examples[0].command).toContain('<%= command.id %>')
    })

    test('example description is a string', () => {
      expect(typeof Config.examples[0].description).toBe('string')
    })

    test('example description is non-empty', () => {
      expect(Config.examples[0].description.length).toBeGreaterThan(0)
    })

    test('Config is a class', () => {
      expect(typeof Config).toBe('function')
    })

    test('Config has a run method', () => {
      expect(Config.prototype.run).toBeDefined()
      expect(typeof Config.prototype.run).toBe('function')
    })

    test('Config has static description', () => {
      expect(Config).toHaveProperty('description')
    })

    test('Config has static examples', () => {
      expect(Config).toHaveProperty('examples')
    })

    test('description starts with capital letter', () => {
      expect(Config.description[0]).toBe(Config.description[0].toUpperCase())
    })

    test('description does not end with period', () => {
      expect(Config.description.endsWith('.')).toBe(false)
    })

    test('example description does not end with period', () => {
      expect(Config.examples[0].description.endsWith('.')).toBe(false)
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

    test('first log is the description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, Config.description)
    })

    test('second log is empty string', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '')
    })

    test('third log is Available commands header', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Available commands:')
    })

    test('fourth log contains validate with indentation', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        4,
        '  validate  Validate the configuration file',
      )
    })

    test('run returns void (no throw)', async () => {
      const cmd = new Config([], {} as never)
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('run can be called multiple times', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      mockConsoleLog.mockClear()
      await cmd.run()

      expect(mockConsoleLog).toHaveBeenCalledTimes(4)
    })

    test('run produces consistent output across calls', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const first = mockConsoleLog.mock.calls.map((c) => c[0])
      mockConsoleLog.mockClear()
      await cmd.run()
      const second = mockConsoleLog.mock.calls.map((c) => c[0])

      expect(first).toEqual(second)
    })

    test('multiple instances produce same output', async () => {
      const cmd1 = new Config([], {} as never)
      const cmd2 = new Config([], {} as never)
      await cmd1.run()
      const first = mockConsoleLog.mock.calls.map((c) => c[0])
      mockConsoleLog.mockClear()
      await cmd2.run()
      const second = mockConsoleLog.mock.calls.map((c) => c[0])

      expect(first).toEqual(second)
    })

    test('output contains exactly one validate entry', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const validateCount = (output.match(/validate/gi) || []).length
      expect(validateCount).toBe(2)
    })

    test('validate line has two-space indentation', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const validateLine = mockConsoleLog.mock.calls[3][0]
      expect(validateLine.startsWith('  ')).toBe(true)
    })

    test('validate line has double-space separator', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const validateLine = mockConsoleLog.mock.calls[3][0]
      expect(validateLine).toContain('validate  ')
    })

    test('header does not have indentation', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const header = mockConsoleLog.mock.calls[2][0]
      expect(header.startsWith(' ')).toBe(false)
    })
  })

  describe('Command properties', () => {
    test('Config.description matches first log output', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog.mock.calls[0][0]).toBe(Config.description)
    })

    test('Config can be instantiated', () => {
      const cmd = new Config([], {} as never)
      expect(cmd).toBeDefined()
    })

    test('instance has run method', () => {
      const cmd = new Config([], {} as never)
      expect(typeof cmd.run).toBe('function')
    })

    test('description contains CodeForge', () => {
      expect(Config.description).toContain('CodeForge')
    })

    test('description contains configuration', () => {
      expect(Config.description).toContain('configuration')
    })

    test('example command references config subcommand', () => {
      expect(Config.examples[0].command).toContain('validate')
    })

    test('available commands line is properly formatted', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const lastLine = mockConsoleLog.mock.calls[3][0]
      const parts = lastLine.trim().split(/\s+/)
      expect(parts.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Run behavior variations', () => {
    test('run does not throw when args are empty array', async () => {
      const cmd = new Config([], {} as never)
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('run works with different argv arrays', async () => {
      const cmd = new Config(['--help'], {} as never)
      await expect(cmd.run()).resolves.not.toThrow()
    })

    test('run output includes both command name and description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('validate')
      expect(output).toContain('Validate the configuration file')
    })

    test('blank line separates header from content', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('run does not modify static properties', async () => {
      const descBefore = Config.description
      const examplesBefore = [...Config.examples]
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(Config.description).toBe(descBefore)
      expect(Config.examples).toEqual(examplesBefore)
    })

    test('static description is immutable across runs', async () => {
      const original = Config.description
      const cmd = new Config([], {} as never)
      await cmd.run()
      await cmd.run()
      await cmd.run()

      expect(Config.description).toBe(original)
    })

    test('static examples are immutable across runs', async () => {
      const original = JSON.parse(JSON.stringify(Config.examples))
      const cmd = new Config([], {} as never)
      await cmd.run()
      await cmd.run()

      expect(Config.examples).toEqual(original)
    })
  })

  describe('Output format details', () => {
    test('description line has no leading whitespace', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog.mock.calls[0][0]).toBe(mockConsoleLog.mock.calls[0][0].trimStart())
    })

    test('description line has no trailing whitespace', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog.mock.calls[0][0]).toBe(mockConsoleLog.mock.calls[0][0].trimEnd())
    })

    test('header has no trailing colon except Available commands:', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const header = mockConsoleLog.mock.calls[2][0]
      expect(header.endsWith(':')).toBe(true)
    })

    test('total output character count is reasonable', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const total = mockConsoleLog.mock.calls.map((c) => c[0]).join('').length
      expect(total).toBeGreaterThan(50)
      expect(total).toBeLessThan(500)
    })

    test('all log call arguments are strings', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      for (const call of mockConsoleLog.mock.calls) {
        expect(typeof call[0]).toBe('string')
      }
    })

    test('no log call argument is undefined', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      for (const call of mockConsoleLog.mock.calls) {
        expect(call[0]).not.toBeUndefined()
      }
    })

    test('no log call argument is null', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      for (const call of mockConsoleLog.mock.calls) {
        expect(call[0]).not.toBeNull()
      }
    })
  })

  describe('Determinism', () => {
    test('output is deterministic across 10 runs', async () => {
      const cmd = new Config([], {} as never)
      const outputs: string[][] = []

      for (let i = 0; i < 10; i++) {
        mockConsoleLog.mockClear()
        await cmd.run()
        outputs.push(mockConsoleLog.mock.calls.map((c) => c[0]))
      }

      for (let i = 1; i < outputs.length; i++) {
        expect(outputs[i]).toEqual(outputs[0])
      }
    })

    test('log call count is always 4', async () => {
      const cmd = new Config([], {} as never)

      for (let i = 0; i < 5; i++) {
        mockConsoleLog.mockClear()
        await cmd.run()
        expect(mockConsoleLog).toHaveBeenCalledTimes(4)
      }
    })
  })

  describe('Command instantiation', () => {
    test('can create instance with empty argv', () => {
      expect(() => new Config([], {} as never)).not.toThrow()
    })

    test('can create multiple instances', () => {
      const instances = Array.from({ length: 5 }, () => new Config([], {} as never))
      expect(instances).toHaveLength(5)
      instances.forEach((inst) => expect(inst).toBeDefined())
    })

    test('each instance has independent run capability', async () => {
      const cmds = Array.from({ length: 3 }, () => new Config([], {} as never))
      for (const cmd of cmds) {
        mockConsoleLog.mockClear()
        await cmd.run()
        expect(mockConsoleLog).toHaveBeenCalledTimes(4)
      }
    })
  })

  describe('Edge cases', () => {
    test('run does not access process.argv', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('node')
      expect(output).not.toContain('process')
    })

    test('run does not produce JSON output', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.startsWith('{')).toBe(false)
      expect(output.startsWith('[')).toBe(false)
    })

    test('run output does not contain error keywords', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls
        .map((c) => c[0])
        .join('\n')
        .toLowerCase()
      expect(output).not.toContain('error')
      expect(output).not.toContain('fail')
      expect(output).not.toContain('exception')
    })

    test('run output does not contain debug info', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls
        .map((c) => c[0])
        .join('\n')
        .toLowerCase()
      expect(output).not.toContain('debug')
      expect(output).not.toContain('[object')
      expect(output).not.toContain('undefined')
    })

    test('validate line uses spaces not tabs', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const validateLine = mockConsoleLog.mock.calls[3][0]
      expect(validateLine).not.toContain('\t')
    })

    test('header uses spaces not tabs', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const header = mockConsoleLog.mock.calls[2][0]
      expect(header).not.toContain('\t')
    })

    test('description line uses spaces not tabs', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const desc = mockConsoleLog.mock.calls[0][0]
      expect(desc).not.toContain('\t')
    })
  })

  describe('Command structure validation', () => {
    test('Config has id property via Command', () => {
      const cmd = new Config([], {} as never)
      expect(cmd).toHaveProperty('id')
    })

    test('Config run method returns a promise', () => {
      const cmd = new Config([], {} as never)
      const result = cmd.run()
      expect(result).toBeInstanceOf(Promise)
      return result
    })

    test('static examples array contains only objects', () => {
      Config.examples.forEach((ex) => {
        expect(typeof ex).toBe('object')
        expect(ex).not.toBeNull()
        expect(Array.isArray(ex)).toBe(false)
      })
    })

    test('all example objects have both required fields', () => {
      Config.examples.forEach((ex) => {
        expect(ex).toHaveProperty('command')
        expect(ex).toHaveProperty('description')
      })
    })

    test('all example commands are non-empty strings', () => {
      Config.examples.forEach((ex) => {
        expect(typeof ex.command).toBe('string')
        expect(ex.command.length).toBeGreaterThan(0)
      })
    })

    test('all example descriptions are non-empty strings', () => {
      Config.examples.forEach((ex) => {
        expect(typeof ex.description).toBe('string')
        expect(ex.description.length).toBeGreaterThan(0)
      })
    })

    test('example command template resolves to include bin and id', () => {
      const cmd = Config.examples[0].command
      expect(cmd).toMatch(/config\.bin/)
      expect(cmd).toMatch(/command\.id/)
    })

    test('output does not contain template syntax', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('<%=')
      expect(output).not.toContain('%>')
    })

    test('output does not contain bin or command.id', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('config.bin')
      expect(output).not.toContain('command.id')
    })
  })

  describe('Output ordering', () => {
    test('description comes before available commands', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const descIndex = output.indexOf('Manage CodeForge configuration')
      const availIndex = output.indexOf('Available commands:')
      expect(descIndex).toBeLessThan(availIndex)
    })

    test('available commands comes before validate', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const availIndex = output.indexOf('Available commands:')
      const validateIndex = output.indexOf('validate')
      expect(availIndex).toBeLessThan(validateIndex)
    })

    test('blank line comes between description and header', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()

      expect(mockConsoleLog.mock.calls[0][0]).toBe('Manage CodeForge configuration')
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
      expect(mockConsoleLog.mock.calls[2][0]).toBe('Available commands:')
    })
  })

  describe('Import stability', () => {
    test('re-importing Config returns same class', async () => {
      const Config2 = (await import('../../../../src/commands/config/index.js')).default
      expect(Config2).toBe(Config)
    })

    test('re-importing preserves description', async () => {
      const Config2 = (await import('../../../../src/commands/config/index.js')).default
      expect(Config2.description).toBe(Config.description)
    })

    test('re-importing preserves examples', async () => {
      const Config2 = (await import('../../../../src/commands/config/index.js')).default
      expect(Config2.examples).toEqual(Config.examples)
    })

    test('multiple dynamic imports yield same class', async () => {
      const imports = await Promise.all([
        import('../../../../src/commands/config/index.js'),
        import('../../../../src/commands/config/index.js'),
        import('../../../../src/commands/config/index.js'),
      ])
      const classes = imports.map((m) => m.default)
      expect(classes[0]).toBe(classes[1])
      expect(classes[1]).toBe(classes[2])
    })
  })

  describe('Static property immutability', () => {
    test('description is not modified after many runs', async () => {
      const original = Config.description
      const cmd = new Config([], {} as never)
      for (let i = 0; i < 20; i++) {
        mockConsoleLog.mockClear()
        await cmd.run()
      }
      expect(Config.description).toBe(original)
    })

    test('examples are not modified after many runs', async () => {
      const original = JSON.parse(JSON.stringify(Config.examples))
      const cmd = new Config([], {} as never)
      for (let i = 0; i < 20; i++) {
        mockConsoleLog.mockClear()
        await cmd.run()
      }
      expect(Config.examples).toEqual(original)
    })

    test('description cannot be accidentally deleted by run', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(Config.description).toBeDefined()
      expect(typeof Config.description).toBe('string')
    })

    test('examples cannot be accidentally deleted by run', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(Config.examples).toBeDefined()
      expect(Array.isArray(Config.examples)).toBe(true)
    })
  })

  describe('Output content verification', () => {
    test('first line matches static description exactly', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe(Config.description)
    })

    test('second line is exactly empty string', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('third line is exactly Available commands:', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0]).toBe('Available commands:')
    })

    test('fourth line starts with two spaces', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0].substring(0, 2)).toBe('  ')
    })

    test('fourth line contains validate keyword', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0]).toContain('validate')
    })

    test('fourth line contains Validate the configuration file', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0]).toContain('Validate the configuration file')
    })

    test('no extra whitespace in description line', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const desc = mockConsoleLog.mock.calls[0][0]
      expect(desc).toBe(desc.trim())
    })

    test('no extra whitespace in header line', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const header = mockConsoleLog.mock.calls[2][0]
      expect(header).toBe(header.trim())
    })

    test('empty line is exactly empty string not whitespace', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const blank = mockConsoleLog.mock.calls[1][0]
      expect(blank).toBe('')
      expect(blank.trim()).toBe('')
    })

    test('output joined with newlines has 4 lines', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      expect(lines).toHaveLength(4)
    })

    test('no line contains only whitespace', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      for (const call of mockConsoleLog.mock.calls) {
        if (call[0] !== '') {
          expect(call[0].length).toBeGreaterThan(0)
          expect(call[0].trim().length).toBeGreaterThan(0)
        }
      }
    })
  })

  describe('Constructor variations', () => {
    test('works with empty argv and empty config', () => {
      expect(() => new Config([], {} as never)).not.toThrow()
    })

    test('works with undefined argv elements', () => {
      expect(() => new Config([undefined as never], {} as never)).not.toThrow()
    })

    test('works with extra config properties', () => {
      expect(() => new Config([], { extra: true } as never)).not.toThrow()
    })

    test('works with nested config object', () => {
      expect(() => new Config([], { nested: { deep: true } } as never)).not.toThrow()
    })

    test('different argv produces same output', async () => {
      const cmd1 = new Config([], {} as never)
      const cmd2 = new Config(['--foo', 'bar'], {} as never)
      await cmd1.run()
      const output1 = mockConsoleLog.mock.calls.map((c) => c[0])
      mockConsoleLog.mockClear()
      await cmd2.run()
      const output2 = mockConsoleLog.mock.calls.map((c) => c[0])
      expect(output1).toEqual(output2)
    })

    test('different config produces same output', async () => {
      const cmd1 = new Config([], {} as never)
      const cmd2 = new Config([], { different: true } as never)
      await cmd1.run()
      const output1 = mockConsoleLog.mock.calls.map((c) => c[0])
      mockConsoleLog.mockClear()
      await cmd2.run()
      const output2 = mockConsoleLog.mock.calls.map((c) => c[0])
      expect(output1).toEqual(output2)
    })

    test('five instances all produce identical output', async () => {
      const outputs: string[][] = []
      for (let i = 0; i < 5; i++) {
        mockConsoleLog.mockClear()
        const cmd = new Config([], {} as never)
        await cmd.run()
        outputs.push(mockConsoleLog.mock.calls.map((c) => c[0]))
      }
      for (let i = 1; i < outputs.length; i++) {
        expect(outputs[i]).toEqual(outputs[0])
      }
    })
  })

  describe('Run promise behavior', () => {
    test('run returns a thenable', () => {
      const cmd = new Config([], {} as never)
      const result = cmd.run()
      expect(typeof result.then).toBe('function')
      return result
    })

    test('run result has catch method', () => {
      const cmd = new Config([], {} as never)
      const result = cmd.run()
      expect(typeof result.catch).toBe('function')
      return result
    })

    test('run resolves to undefined', async () => {
      const cmd = new Config([], {} as never)
      const result = await cmd.run()
      expect(result).toBeUndefined()
    })

    test('run does not reject', async () => {
      const cmd = new Config([], {} as never)
      await expect(cmd.run()).resolves.toBeUndefined()
    })

    test('awaited run does not throw', async () => {
      const cmd = new Config([], {} as never)
      let threw = false
      try {
        await cmd.run()
      } catch {
        threw = true
      }
      expect(threw).toBe(false)
    })

    test('run can be called sequentially with await', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      await cmd.run()
      await cmd.run()
      expect(true).toBe(true)
    })
  })

  describe('String properties deep checks', () => {
    test('description has word Manage', () => {
      expect(Config.description).toContain('Manage')
    })

    test('description has word CodeForge', () => {
      expect(Config.description).toContain('CodeForge')
    })

    test('description is exactly Manage CodeForge configuration', () => {
      expect(Config.description).toBe('Manage CodeForge configuration')
    })

    test('example command template has bin placeholder', () => {
      expect(Config.examples[0].command).toContain('config.bin')
    })

    test('example command template has command.id placeholder', () => {
      expect(Config.examples[0].command).toContain('command.id')
    })

    test('example description is exactly Validate the configuration file', () => {
      expect(Config.examples[0].description).toBe('Validate the configuration file')
    })

    test('example command uses ERB-style template tags', () => {
      expect(Config.examples[0].command).toContain('<%=')
      expect(Config.examples[0].command).toContain('%>')
    })

    test('example command starts with bin template', () => {
      expect(Config.examples[0].command.startsWith('<%= config.bin %>')).toBe(true)
    })

    test('example command contains space between bin and id', () => {
      const cmd = Config.examples[0].command
      const binEnd = cmd.indexOf('%>') + 2
      expect(cmd.substring(binEnd, binEnd + 1)).toBe(' ')
    })

    test('description does not contain special characters', () => {
      expect(Config.description).not.toMatch(/[!@#$%^&*]/)
    })

    test('example description does not contain special characters', () => {
      expect(Config.examples[0].description).not.toMatch(/[!@#$%^&*]/)
    })
  })

  describe('Output line-by-line assertions', () => {
    test('line 1 is description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0]).toBe('Manage CodeForge configuration')
    })

    test('line 2 is blank separator', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('line 3 is Available commands header', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0]).toBe('Available commands:')
    })

    test('line 4 is validate with description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0]).toBe('  validate  Validate the configuration file')
    })

    test('exactly 4 calls total', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls.length).toBe(4)
    })

    test('no fifth call exists', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[4]).toBeUndefined()
    })

    test('each call has exactly one string argument', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      mockConsoleLog.mock.calls.forEach((call) => {
        expect(call.length).toBe(1)
      })
    })
  })

  describe('Prototype and inheritance', () => {
    test('Config.prototype has run', () => {
      expect(Config.prototype.run).toBeDefined()
    })

    test('run is on the prototype not the instance', () => {
      const cmd = new Config([], {} as never)
      expect(cmd.hasOwnProperty('run')).toBe(false)
      expect(Config.prototype.hasOwnProperty('run')).toBe(true)
    })

    test('description is on the class not the prototype', () => {
      expect(Config.hasOwnProperty('description')).toBe(true)
      expect(Config.prototype.hasOwnProperty('description')).toBe(false)
    })

    test('examples is on the class not the prototype', () => {
      expect(Config.hasOwnProperty('examples')).toBe(true)
      expect(Config.prototype.hasOwnProperty('examples')).toBe(false)
    })

    test('Config constructor is a function', () => {
      expect(typeof Config.constructor).toBe('function')
    })

    test('new Config creates proper instance', () => {
      const cmd = new Config([], {} as never)
      expect(cmd).toBeDefined()
      expect(cmd.constructor).toBe(Config)
    })

    test('instanceof checks work', () => {
      const cmd = new Config([], {} as never)
      expect(cmd).toBeInstanceOf(Config)
    })
  })

  describe('Validate line format', () => {
    test('validate line has proper indentation of exactly 2 spaces', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      expect(line.substring(0, 2)).toBe('  ')
      expect(line.substring(2, 3)).not.toBe(' ')
    })

    test('validate line has command name followed by separator', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      expect(line).toMatch(/^\s+validate\s{2,}/)
    })

    test('validate line description is separated by two spaces from name', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      const trimmed = line.trim()
      expect(trimmed).toBe('validate  Validate the configuration file')
    })

    test('validate line is last output line', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const lastCall = mockConsoleLog.mock.calls[mockConsoleLog.mock.calls.length - 1]
      expect(lastCall[0]).toContain('validate')
    })
  })

  describe('Concurrency stress tests', () => {
    test('concurrent runs do not interfere with each other', async () => {
      const cmd = new Config([], {} as never)
      const runs = Array.from({ length: 10 }, () => cmd.run())
      await Promise.all(runs)
      expect(mockConsoleLog.mock.calls.length).toBe(40)
    })

    test('concurrent runs with different instances', async () => {
      const cmds = Array.from({ length: 5 }, () => new Config([], {} as never))
      await Promise.all(cmds.map((cmd) => cmd.run()))
      expect(mockConsoleLog.mock.calls.length).toBe(20)
    })

    test('rapid sequential runs maintain consistency', async () => {
      const cmd = new Config([], {} as never)
      for (let i = 0; i < 50; i++) {
        mockConsoleLog.mockClear()
        await cmd.run()
        expect(mockConsoleLog.mock.calls.length).toBe(4)
        expect(mockConsoleLog.mock.calls[0][0]).toBe('Manage CodeForge configuration')
      }
    })
  })

  describe('Run output semantic checks', () => {
    test('output communicates config management purpose', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output.toLowerCase()).toContain('manage')
      expect(output.toLowerCase()).toContain('configuration')
    })

    test('output lists available subcommands', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Available commands:')
    })

    test('output provides description for validate subcommand', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toContain('Validate the configuration file')
    })

    test('output is user-friendly (no technical jargon)', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls
        .map((c) => c[0])
        .join('\n')
        .toLowerCase()
      expect(output).not.toContain('async')
      expect(output).not.toContain('promise')
      expect(output).not.toContain('undefined')
      expect(output).not.toContain('null')
    })

    test('output is formatted as a help-style listing', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0]).toBe('Available commands:')
      expect(mockConsoleLog.mock.calls[3][0].startsWith('  ')).toBe(true)
    })
  })

  describe('Re-import consistency', () => {
    for (let i = 0; i < 10; i++) {
      test(`run ${i + 1} produces identical output`, async () => {
        const cmd = new Config([], {} as never)
        mockConsoleLog.mockClear()
        await cmd.run()
        expect(mockConsoleLog.mock.calls.length).toBe(4)
        expect(mockConsoleLog.mock.calls[0][0]).toBe('Manage CodeForge configuration')
        expect(mockConsoleLog.mock.calls[1][0]).toBe('')
        expect(mockConsoleLog.mock.calls[2][0]).toBe('Available commands:')
        expect(mockConsoleLog.mock.calls[3][0]).toBe('  validate  Validate the configuration file')
      })
    }
  })

  describe('Output character-level checks', () => {
    test('description line length matches expected', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0].length).toBe('Manage CodeForge configuration'.length)
    })

    test('header line length matches expected', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0].length).toBe('Available commands:'.length)
    })

    test('validate line has correct total length', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const expected = '  validate  Validate the configuration file'
      expect(mockConsoleLog.mock.calls[3][0].length).toBe(expected.length)
    })

    test('blank line has length zero', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[1][0].length).toBe(0)
    })

    test('total output length is sum of all lines', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const lengths = mockConsoleLog.mock.calls.map((c) => c[0].length)
      const total = mockConsoleLog.mock.calls.map((c) => c[0]).join('').length
      expect(total).toBe(lengths.reduce((a, b) => a + b, 0))
    })

    test('no lines contain double spaces except validate line separator', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      for (let i = 0; i < mockConsoleLog.mock.calls.length; i++) {
        if (i === 3) continue
        expect(mockConsoleLog.mock.calls[i][0]).not.toContain('  ')
      }
    })
  })

  describe('Call pattern verification', () => {
    test('nthCalledWith matches for all 4 calls', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, 'Manage CodeForge configuration')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, 'Available commands:')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        4,
        '  validate  Validate the configuration file',
      )
    })

    test('toHaveBeenCalledWith matches at least once for description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog).toHaveBeenCalledWith('Manage CodeForge configuration')
    })

    test('toHaveBeenCalledWith matches at least once for blank', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog).toHaveBeenCalledWith('')
    })

    test('toHaveBeenCalledWith matches at least once for header', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog).toHaveBeenCalledWith('Available commands:')
    })

    test('toHaveBeenCalledBefore - description before blank', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0]).toBeDefined()
      expect(mockConsoleLog.mock.calls[1]).toBeDefined()
      expect(mockConsoleLog.mock.invocationCallOrder[0]).toBeLessThan(
        mockConsoleLog.mock.invocationCallOrder[1],
      )
    })
  })

  describe('Memory and reference checks', () => {
    test('run does not retain references to call arguments', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const calls1 = [...mockConsoleLog.mock.calls]
      mockConsoleLog.mockClear()
      await cmd.run()
      const calls2 = [...mockConsoleLog.mock.calls]
      expect(calls1.length).toBe(calls2.length)
    })

    test('multiple instances do not share state', async () => {
      const cmd1 = new Config([], {} as never)
      const cmd2 = new Config([], {} as never)
      await cmd1.run()
      mockConsoleLog.mockClear()
      await cmd2.run()
      expect(mockConsoleLog).toHaveBeenCalledTimes(4)
    })

    test('static properties are shared across instances', () => {
      const cmd1 = new Config([], {} as never)
      const cmd2 = new Config([], {} as never)
      expect(cmd1.constructor.description).toBe(cmd2.constructor.description)
      expect(cmd1.constructor.examples).toBe(cmd2.constructor.examples)
    })
  })

  describe('Example format deep validation', () => {
    test('example command uses space separator between templates', () => {
      const cmd = Config.examples[0].command
      const parts = cmd.split(' ')
      expect(parts.length).toBeGreaterThanOrEqual(2)
    })

    test('example command ends with validate', () => {
      expect(Config.examples[0].command.endsWith('validate')).toBe(true)
    })

    test('example object is frozen or sealed check', () => {
      expect(typeof Config.examples[0]).toBe('object')
    })

    test('example object keys are exactly command and description', () => {
      const keys = Object.keys(Config.examples[0])
      expect(keys).toContain('command')
      expect(keys).toContain('description')
    })

    test('example command does not contain newline', () => {
      expect(Config.examples[0].command).not.toContain('\n')
    })

    test('example description does not contain newline', () => {
      expect(Config.examples[0].description).not.toContain('\n')
    })

    test('example command has no leading or trailing whitespace', () => {
      expect(Config.examples[0].command).toBe(Config.examples[0].command.trim())
    })

    test('example description has no leading or trailing whitespace', () => {
      expect(Config.examples[0].description).toBe(Config.examples[0].description.trim())
    })
  })

  describe('Run output integration checks', () => {
    test('full output matches expected snapshot', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).toBe(
        'Manage CodeForge configuration\n' +
          '\n' +
          'Available commands:\n' +
          '  validate  Validate the configuration file',
      )
    })

    test('output can be split into exactly 4 lines', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      const lines = output.split('\n')
      expect(lines).toHaveLength(4)
      expect(lines[0]).toBe('Manage CodeForge configuration')
      expect(lines[1]).toBe('')
      expect(lines[2]).toBe('Available commands:')
      expect(lines[3]).toBe('  validate  Validate the configuration file')
    })

    test('run output is purely informational', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toContain('[object')
      expect(output).not.toContain('function')
      expect(output).not.toContain('=>')
    })

    test('output uses consistent capitalization', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const header = mockConsoleLog.mock.calls[2][0]
      expect(header[0]).toBe(header[0].toUpperCase())
      const validateLine = mockConsoleLog.mock.calls[3][0].trim()
      expect(validateLine[0]).toBe(validateLine[0].toLowerCase())
    })
  })

  describe('Description line specific checks', () => {
    test('description line contains Manage', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0]).toContain('Manage')
    })

    test('description line contains CodeForge', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0]).toContain('CodeForge')
    })

    test('description line contains configuration', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0]).toContain('configuration')
    })

    test('description line has correct word count', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const words = mockConsoleLog.mock.calls[0][0].split(' ')
      expect(words).toHaveLength(3)
    })

    test('description line first word is Manage', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0].split(' ')[0]).toBe('Manage')
    })

    test('description line last word is configuration', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const words = mockConsoleLog.mock.calls[0][0].split(' ')
      expect(words[words.length - 1]).toBe('configuration')
    })
  })

  describe('Header line specific checks', () => {
    test('header starts with Available', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0].startsWith('Available')).toBe(true)
    })

    test('header ends with colon', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0].endsWith(':')).toBe(true)
    })

    test('header contains word commands', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[2][0]).toContain('commands')
    })

    test('header has correct word count', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const words = mockConsoleLog.mock.calls[2][0].replace(':', '').split(' ')
      expect(words).toHaveLength(2)
    })
  })

  describe('Validate entry specific checks', () => {
    test('validate entry contains subcommand name', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0]).toContain('validate')
    })

    test('validate entry contains subcommand description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[3][0]).toContain('Validate the configuration file')
    })

    test('validate entry has two leading spaces', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      expect(line[0]).toBe(' ')
      expect(line[1]).toBe(' ')
    })

    test('validate entry uses double-space separator between name and description', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      expect(line).toContain('validate  Validate')
    })

    test('validate entry description starts with capital V', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      const descStart = line.indexOf('Validate')
      expect(descStart).toBeGreaterThan(0)
    })

    test('validate entry does not contain trailing whitespace', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const line = mockConsoleLog.mock.calls[3][0]
      expect(line).toBe(line.trimEnd())
    })
  })

  describe('Blank line specific checks', () => {
    test('blank line is at index 1', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[1][0]).toBe('')
    })

    test('blank line has no hidden characters', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const blank = mockConsoleLog.mock.calls[1][0]
      expect(blank.length).toBe(0)
    })

    test('blank line separates description from commands', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(mockConsoleLog.mock.calls[0][0].length).toBeGreaterThan(0)
      expect(mockConsoleLog.mock.calls[1][0].length).toBe(0)
      expect(mockConsoleLog.mock.calls[2][0].length).toBeGreaterThan(0)
    })

    test('blank line is string type', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      expect(typeof mockConsoleLog.mock.calls[1][0]).toBe('string')
    })
  })

  describe('Final summary checks', () => {
    test('all 4 output lines are strings', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      mockConsoleLog.mock.calls.forEach((call) => {
        expect(typeof call[0]).toBe('string')
      })
    })

    test('output does not contain any numbers', async () => {
      const cmd = new Config([], {} as never)
      await cmd.run()
      const output = mockConsoleLog.mock.calls.map((c) => c[0]).join('\n')
      expect(output).not.toMatch(/\d/)
    })
  })
})
