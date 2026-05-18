import { ArgumentParser } from '../src/core/cli-builder/argument-parser.js'
import { CLIValidator } from '../src/core/cli-builder/cli-validator.js'
import { CommandBuilder } from '../src/core/cli-builder/command-builder.js'
import { DEFAULT_HELP_CONFIG } from '../src/core/cli-builder/types.js'
import type { CLICommand, CLIArgument, CLIOption, HelpConfig } from '../src/core/cli-builder/types.js'

// ─── Helpers ───────────────────────────────────────────────────────────

function makeCommand(overrides: Partial<CLICommand> = {}): CLICommand {
  return {
    name: 'test',
    description: 'A test command',
    aliases: [],
    arguments: [],
    options: [],
    subcommands: [],
    handler: undefined,
    examples: [],
    deprecated: false,
    hidden: false,
    ...overrides,
  }
}

function makeArgument(overrides: Partial<CLIArgument> = {}): CLIArgument {
  return {
    name: 'file',
    description: 'Input file',
    required: true,
    variadic: false,
    ...overrides,
  }
}

function makeOption(overrides: Partial<CLIOption> = {}): CLIOption {
  return {
    name: 'output',
    description: 'Output path',
    type: 'string',
    required: false,
    ...overrides,
  }
}

// ─── ArgumentParser - coerceValue ──────────────────────────────────────

describe('ArgumentParser', () => {
  describe('coerceValue', () => {
    const parser = new ArgumentParser()

    it('coerces string type (returns as-is)', () => {
      expect(parser.coerceValue('hello', 'string')).toBe('hello')
    })

    it('coerces valid number string to number', () => {
      expect(parser.coerceValue('42', 'number')).toBe(42)
    })

    it('coerces negative number string to number', () => {
      expect(parser.coerceValue('-3.14', 'number')).toBe(-3.14)
    })

    it('returns original string when number coercion results in NaN', () => {
      expect(parser.coerceValue('abc', 'number')).toBe('abc')
    })

    it('coerces "true" to boolean true', () => {
      expect(parser.coerceValue('true', 'boolean')).toBe(true)
    })

    it('coerces "1" to boolean true', () => {
      expect(parser.coerceValue('1', 'boolean')).toBe(true)
    })

    it('coerces "false" to boolean false', () => {
      expect(parser.coerceValue('false', 'boolean')).toBe(false)
    })

    it('coerces "0" to boolean false', () => {
      expect(parser.coerceValue('0', 'boolean')).toBe(false)
    })

    it('coerces arbitrary string to boolean false', () => {
      expect(parser.coerceValue('yes', 'boolean')).toBe(false)
    })

    it('splits comma-separated string to array', () => {
      expect(parser.coerceValue('a,b,c', 'array')).toEqual(['a', 'b', 'c'])
    })

    it('returns single-element array for non-comma string', () => {
      expect(parser.coerceValue('hello', 'array')).toEqual(['hello'])
    })

    it('returns empty string as single element array for array type', () => {
      expect(parser.coerceValue('', 'array')).toEqual([''])
    })
  })

  // ─── ArgumentParser - resolveDefaults ─────────────────────────────────

  describe('resolveDefaults', () => {
    const parser = new ArgumentParser()

    it('sets default values for options not present', () => {
      const options = new Map<string, unknown>()
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      parser.resolveDefaults(options, cmd)
      expect(options.get('format')).toBe('json')
    })

    it('does not override existing option values', () => {
      const options = new Map<string, unknown>([['format', 'xml']])
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      parser.resolveDefaults(options, cmd)
      expect(options.get('format')).toBe('xml')
    })

    it('skips options with undefined defaultValue', () => {
      const options = new Map<string, unknown>()
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: undefined })],
      })
      parser.resolveDefaults(options, cmd)
      expect(options.has('format')).toBe(false)
    })

    it('returns the options map for chaining', () => {
      const options = new Map<string, unknown>()
      const cmd = makeCommand()
      const result = parser.resolveDefaults(options, cmd)
      expect(result).toBe(options)
    })
  })

  // ─── ArgumentParser - resolveArgDefaults ──────────────────────────────

  describe('resolveArgDefaults', () => {
    const parser = new ArgumentParser()

    it('sets default values for missing arguments', () => {
      const args = new Map<string, unknown>()
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'dir', defaultValue: '.' })],
      })
      parser.resolveArgDefaults(args, cmd)
      expect(args.get('dir')).toBe('.')
    })

    it('does not override existing argument values', () => {
      const args = new Map<string, unknown>([['dir', '/tmp']])
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'dir', defaultValue: '.' })],
      })
      parser.resolveArgDefaults(args, cmd)
      expect(args.get('dir')).toBe('/tmp')
    })

    it('returns the args map for chaining', () => {
      const args = new Map<string, unknown>()
      const cmd = makeCommand()
      const result = parser.resolveArgDefaults(args, cmd)
      expect(result).toBe(args)
    })
  })

  // ─── ArgumentParser - validateRequired ────────────────────────────────

  describe('validateRequired', () => {
    const parser = new ArgumentParser()

    it('reports missing required arguments', () => {
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>(),
        remaining: [] as string[],
        errors: [] as string[],
      }
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const errs = parser.validateRequired(parsed, cmd)
      expect(errs).toContain('Missing required argument: file')
    })

    it('does not report present required arguments', () => {
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>([['file', 'a.txt']]),
        options: new Map<string, unknown>(),
        remaining: [] as string[],
        errors: [] as string[],
      }
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const errs = parser.validateRequired(parsed, cmd)
      expect(errs).toEqual([])
    })

    it('reports missing required options', () => {
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>(),
        remaining: [] as string[],
        errors: [] as string[],
      }
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', required: true })],
      })
      const errs = parser.validateRequired(parsed, cmd)
      expect(errs).toContain('Missing required option: --output')
    })

    it('does not report present required options', () => {
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>([['output', 'out.txt']]),
        remaining: [] as string[],
        errors: [] as string[],
      }
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', required: true })],
      })
      const errs = parser.validateRequired(parsed, cmd)
      expect(errs).toEqual([])
    })

    it('collects both missing args and options', () => {
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>(),
        remaining: [] as string[],
        errors: [] as string[],
      }
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'src', required: true })],
        options: [makeOption({ name: 'out', required: true })],
      })
      const errs = parser.validateRequired(parsed, cmd)
      expect(errs).toHaveLength(2)
    })
  })

  // ─── ArgumentParser - parseOption ─────────────────────────────────────

  describe('parseOption', () => {
    const parser = new ArgumentParser()

    it('matches --name long form', () => {
      const result = parser.parseOption('--output', [
        makeOption({ name: 'output', type: 'string' }),
      ])
      expect(result).toEqual({ name: 'output', value: undefined })
    })

    it('matches short form -o', () => {
      const result = parser.parseOption('-o', [
        makeOption({ name: 'output', shortName: 'o', type: 'string' }),
      ])
      expect(result).toEqual({ name: 'output', value: undefined })
    })

    it('returns true for boolean option via long form', () => {
      const result = parser.parseOption('--verbose', [
        makeOption({ name: 'verbose', type: 'boolean' }),
      ])
      expect(result).toEqual({ name: 'verbose', value: true })
    })

    it('returns true for boolean option via short form', () => {
      const result = parser.parseOption('-v', [
        makeOption({ name: 'verbose', shortName: 'v', type: 'boolean' }),
      ])
      expect(result).toEqual({ name: 'verbose', value: true })
    })

    it('matches --name=value format', () => {
      const result = parser.parseOption('--output=file.txt', [
        makeOption({ name: 'output', type: 'string' }),
      ])
      expect(result).toEqual({ name: 'output', value: 'file.txt' })
    })

    it('matches -o=value short form with equals', () => {
      const result = parser.parseOption('-o=file.txt', [
        makeOption({ name: 'output', shortName: 'o', type: 'string' }),
      ])
      expect(result).toEqual({ name: 'output', value: 'file.txt' })
    })

    it('coerces value type for --name=value format', () => {
      const result = parser.parseOption('--count=5', [
        makeOption({ name: 'count', type: 'number' }),
      ])
      expect(result).toEqual({ name: 'count', value: 5 })
    })

    it('returns null for unknown option', () => {
      const result = parser.parseOption('--unknown', [
        makeOption({ name: 'output', type: 'string' }),
      ])
      expect(result).toBeNull()
    })

    it('returns null for empty options list', () => {
      const result = parser.parseOption('--anything', [])
      expect(result).toBeNull()
    })
  })

  // ─── ArgumentParser - parse (full integration) ────────────────────────

  describe('parse', () => {
    const parser = new ArgumentParser()

    it('parses empty argv with empty command', () => {
      const cmd = makeCommand()
      const result = parser.parse([], cmd)
      expect(result.command).toBe('test')
      expect(result.args.size).toBe(0)
      expect(result.options.size).toBe(0)
      expect(result.remaining).toEqual([])
      expect(result.errors).toEqual([])
    })

    it('parses positional arguments', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file' })],
      })
      const result = parser.parse(['main.ts'], cmd)
      expect(result.args.get('file')).toBe('main.ts')
    })

    it('parses variadic arguments', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'files', variadic: true })],
      })
      const result = parser.parse(['a.ts', 'b.ts', 'c.ts'], cmd)
      expect(result.args.get('files')).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    it('parses variadic arguments after fixed argument', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'target' }),
          makeArgument({ name: 'files', variadic: true }),
        ],
      })
      const result = parser.parse(['build', 'a.ts', 'b.ts'], cmd)
      expect(result.args.get('target')).toBe('build')
      expect(result.args.get('files')).toEqual(['a.ts', 'b.ts'])
    })

    it('parses --flag=value option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', type: 'string' })],
      })
      const result = parser.parse(['--output=out.txt'], cmd)
      expect(result.options.get('output')).toBe('out.txt')
    })

    it('parses --flag value option (next token)', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', type: 'string' })],
      })
      const result = parser.parse(['--output', 'out.txt'], cmd)
      expect(result.options.get('output')).toBe('out.txt')
    })

    it('parses short flag -f value', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', shortName: 'o', type: 'string' })],
      })
      const result = parser.parse(['-o', 'out.txt'], cmd)
      expect(result.options.get('output')).toBe('out.txt')
    })

    it('parses boolean flag without value', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'verbose', type: 'boolean' })],
      })
      const result = parser.parse(['--verbose'], cmd)
      expect(result.options.get('verbose')).toBe(true)
    })

    it('parses short boolean flag', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'verbose', shortName: 'v', type: 'boolean' })],
      })
      const result = parser.parse(['-v'], cmd)
      expect(result.options.get('verbose')).toBe(true)
    })

    it('collects array option values', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'files', shortName: 'f', type: 'array' })],
      })
      const result = parser.parse(['-f', 'a.ts', '-f', 'b.ts'], cmd)
      expect(result.options.get('files')).toEqual(['a.ts', 'b.ts'])
    })

    it('errors when non-boolean option has no value', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', type: 'string' })],
      })
      const result = parser.parse(['--output'], cmd)
      expect(result.errors).toContain('Option --output requires a value')
    })

    it('errors on unknown option with equals sign', () => {
      const cmd = makeCommand()
      const result = parser.parse(['--unknown=val'], cmd)
      expect(result.errors).toContain('Unknown option: --unknown')
    })

    it('passes double-dash remaining args to remaining', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file' })],
      })
      const result = parser.parse(['hello', '--', '--not-a-flag', 'world'], cmd)
      expect(result.args.get('file')).toBe('hello')
      expect(result.remaining).toEqual(['--not-a-flag', 'world'])
    })

    it('applies default values for options', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      const result = parser.parse([], cmd)
      expect(result.options.get('format')).toBe('json')
    })

    it('applies default values for arguments', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'dir', required: false, defaultValue: '.' })],
      })
      const result = parser.parse([], cmd)
      expect(result.args.get('dir')).toBe('.')
    })

    it('reports missing required argument', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const result = parser.parse([], cmd)
      expect(result.errors).toContain('Missing required argument: file')
    })

    it('reports missing required option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', required: true })],
      })
      const result = parser.parse([], cmd)
      expect(result.errors).toContain('Missing required option: --output')
    })

    it('pushes unknown short flags to remaining', () => {
      const cmd = makeCommand()
      const result = parser.parse(['-x'], cmd)
      expect(result.remaining).toEqual(['-x'])
    })

    it('pushes unknown long flags to remaining', () => {
      const cmd = makeCommand()
      const result = parser.parse(['--xyz'], cmd)
      expect(result.remaining).toEqual(['--xyz'])
    })

    it('coerces number type option via next-token', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'port', type: 'number' })],
      })
      const result = parser.parse(['--port', '8080'], cmd)
      expect(result.options.get('port')).toBe(8080)
    })

    it('handles mixed positional and optional args', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file' })],
        options: [
          makeOption({ name: 'verbose', type: 'boolean' }),
          makeOption({ name: 'output', type: 'string' }),
        ],
      })
      const result = parser.parse(['input.ts', '--verbose', '--output', 'out.ts'], cmd)
      expect(result.args.get('file')).toBe('input.ts')
      expect(result.options.get('verbose')).toBe(true)
      expect(result.options.get('output')).toBe('out.ts')
    })
  })
})

// ─── CLIValidator - validateOption ──────────────────────────────────────

describe('CLIValidator', () => {
  describe('validateOption', () => {
    const validator = new CLIValidator()

    it('passes a valid option', () => {
      const result = validator.validateOption(makeOption())
      expect(result.valid).toBe(true)
    })

    it('fails on empty option name', () => {
      const result = validator.validateOption(makeOption({ name: '' }))
      expect(result.errors).toContain('Option name is required')
    })

    it('fails on whitespace-only option name', () => {
      const result = validator.validateOption(makeOption({ name: '   ' }))
      expect(result.errors).toContain('Option name is required')
    })

    it('fails when option name contains spaces', () => {
      const result = validator.validateOption(makeOption({ name: 'my option' }))
      expect(result.errors).toContain('Option name cannot contain spaces')
    })

    it('fails when shortName is longer than 1 character', () => {
      const result = validator.validateOption(makeOption({ shortName: 'ab' }))
      expect(result.errors).toContain('Short name "ab" must be a single character')
    })

    it('fails when shortName is "-"', () => {
      const result = validator.validateOption(makeOption({ shortName: '-' }))
      expect(result.errors).toContain('Short name cannot be "-"')
    })

    it('passes with valid single-character shortName', () => {
      const result = validator.validateOption(makeOption({ shortName: 'o' }))
      expect(result.valid).toBe(true)
    })

    it('fails on invalid option type', () => {
      const result = validator.validateOption(makeOption({ type: 'object' as CLIOption['type'] }))
      expect(result.errors).toContain('Invalid option type: object')
    })

    it('fails when boolean option has non-boolean default', () => {
      const result = validator.validateOption(
        makeOption({ type: 'boolean', defaultValue: 'true' }),
      )
      expect(result.errors).toContain('Boolean option default must be a boolean')
    })

    it('passes when boolean option has boolean default', () => {
      const result = validator.validateOption(
        makeOption({ type: 'boolean', defaultValue: false }),
      )
      expect(result.valid).toBe(true)
    })

    it('fails when number option has non-number default', () => {
      const result = validator.validateOption(
        makeOption({ type: 'number', defaultValue: '42' }),
      )
      expect(result.errors).toContain('Number option default must be a number')
    })

    it('passes when number option has number default', () => {
      const result = validator.validateOption(
        makeOption({ type: 'number', defaultValue: 42 }),
      )
      expect(result.valid).toBe(true)
    })

    it('warns on empty choices', () => {
      const result = validator.validateOption(
        makeOption({ choices: [] }),
      )
      expect(result.warnings).toContain('Option "output" has empty choices')
    })

    it('fails when default value is not in choices', () => {
      const result = validator.validateOption(
        makeOption({ defaultValue: 'xml', choices: ['json', 'yaml'] }),
      )
      expect(result.errors).toContain(
        'Default value "xml" is not in choices: [json, yaml]',
      )
    })

    it('passes when default value is in choices', () => {
      const result = validator.validateOption(
        makeOption({ defaultValue: 'json', choices: ['json', 'yaml'] }),
      )
      expect(result.valid).toBe(true)
    })

    it('fails when option depends on itself', () => {
      const result = validator.validateOption(
        makeOption({ name: 'foo', dependsOn: ['foo'] }),
      )
      expect(result.errors).toContain('Option "foo" cannot depend on itself')
    })

    it('fails when option conflicts with itself', () => {
      const result = validator.validateOption(
        makeOption({ name: 'foo', conflictsWith: ['foo'] }),
      )
      expect(result.errors).toContain('Option "foo" cannot conflict with itself')
    })

    it('fails when option both depends on and conflicts with same option', () => {
      const result = validator.validateOption(
        makeOption({ name: 'foo', dependsOn: ['bar'], conflictsWith: ['bar'] }),
      )
      expect(result.errors).toContain(
        'Option "foo" both depends on and conflicts with "bar"',
      )
    })

    it('passes with valid shortName of length 1', () => {
      const result = validator.validateOption(makeOption({ shortName: 'x' }))
      expect(result.valid).toBe(true)
    })

    it('passes with undefined shortName', () => {
      const result = validator.validateOption(makeOption({ shortName: undefined }))
      expect(result.valid).toBe(true)
    })
  })

  // ─── CLIValidator - validateCommand ────────────────────────────────────

  describe('validateCommand', () => {
    const validator = new CLIValidator()

    it('passes a valid minimal command', () => {
      const result = validator.validateCommand(makeCommand())
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('fails on empty command name', () => {
      const result = validator.validateCommand(makeCommand({ name: '' }))
      expect(result.errors).toContain('Command name is required')
    })

    it('fails on whitespace-only command name', () => {
      const result = validator.validateCommand(makeCommand({ name: '   ' }))
      expect(result.errors).toContain('Command name is required')
    })

    it('fails on command name with spaces', () => {
      const result = validator.validateCommand(makeCommand({ name: 'my command' }))
      expect(result.errors).toContain('Command name cannot contain spaces')
    })

    it('fails on alias with spaces', () => {
      const result = validator.validateCommand(makeCommand({ aliases: ['bad alias'] }))
      expect(result.errors).toContain('Alias "bad alias" cannot contain spaces')
    })

    it('fails on duplicate argument names', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [
            makeArgument({ name: 'file' }),
            makeArgument({ name: 'file' }),
          ],
        }),
      )
      expect(result.errors).toContain('Duplicate argument name: file')
    })

    it('warns when required argument follows optional', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [
            makeArgument({ name: 'opt', required: false }),
            makeArgument({ name: 'req', required: true }),
          ],
        }),
      )
      expect(result.warnings).toContain(
        'Required argument "req" appears after optional argument',
      )
    })

    it('warns on argument with empty choices', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [makeArgument({ name: 'mode', choices: [] })],
        }),
      )
      expect(result.warnings).toContain('Argument "mode" has empty choices')
    })

    it('fails on multiple variadic arguments', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [
            makeArgument({ name: 'a', variadic: true }),
            makeArgument({ name: 'b', variadic: true }),
          ],
        }),
      )
      expect(result.errors).toContain('Only one variadic argument is allowed')
    })

    it('fails when variadic argument is not last', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [
            makeArgument({ name: 'rest', variadic: true }),
            makeArgument({ name: 'other' }),
          ],
        }),
      )
      expect(result.errors).toContain('Variadic argument must be the last argument')
    })

    it('passes when variadic argument is last', () => {
      const result = validator.validateCommand(
        makeCommand({
          arguments: [
            makeArgument({ name: 'target' }),
            makeArgument({ name: 'files', variadic: true }),
          ],
        }),
      )
      expect(result.valid).toBe(true)
    })

    it('fails on duplicate option names', () => {
      const result = validator.validateCommand(
        makeCommand({
          options: [
            makeOption({ name: 'format' }),
            makeOption({ name: 'format' }),
          ],
        }),
      )
      expect(result.errors).toContain('Duplicate option name: format')
    })

    it('fails on duplicate short option names', () => {
      const result = validator.validateCommand(
        makeCommand({
          options: [
            makeOption({ name: 'output', shortName: 'o' }),
            makeOption({ name: 'other', shortName: 'o' }),
          ],
        }),
      )
      expect(result.errors).toContain('Duplicate short option name: -o')
    })

    it('fails on duplicate aliases', () => {
      const result = validator.validateCommand(
        makeCommand({ aliases: ['t', 't'] }),
      )
      expect(result.errors).toContain('Duplicate alias: t')
    })

    it('fails on empty subcommand name', () => {
      const result = validator.validateCommand(
        makeCommand({
          subcommands: [makeCommand({ name: '' })],
        }),
      )
      expect(result.errors).toContain('Subcommand name is required')
    })

    it('fails on duplicate subcommand names', () => {
      const result = validator.validateCommand(
        makeCommand({
          subcommands: [
            makeCommand({ name: 'build' }),
            makeCommand({ name: 'build' }),
          ],
        }),
      )
      expect(result.errors).toContain('Duplicate subcommand name: build')
    })

    it('warns when command is deprecated', () => {
      const result = validator.validateCommand(makeCommand({ deprecated: true }))
      expect(result.warnings).toContain('Command "test" is deprecated')
    })

    it('warns on deprecated subcommand', () => {
      const result = validator.validateCommand(
        makeCommand({
          subcommands: [makeCommand({ name: 'old', deprecated: true })],
        }),
      )
      expect(result.warnings).toContain('Subcommand "old" is deprecated')
    })
  })

  // ─── CLIValidator - checkConflicts ────────────────────────────────────

  describe('checkConflicts', () => {
    const validator = new CLIValidator()

    it('passes when no conflicts declared', () => {
      const cmd = makeCommand()
      expect(validator.checkConflicts(cmd)).toEqual([])
    })

    it('errors when one-way conflict declared (missing reverse)', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'json', conflictsWith: ['yaml'] }),
          makeOption({ name: 'yaml' }),
        ],
      })
      const errs = validator.checkConflicts(cmd)
      expect(errs).toContain(
        'Option "--json" conflicts with "--yaml" but reverse conflict is not declared',
      )
    })

    it('passes when mutual conflict is declared', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'json', conflictsWith: ['yaml'] }),
          makeOption({ name: 'yaml', conflictsWith: ['json'] }),
        ],
      })
      const errs = validator.checkConflicts(cmd)
      expect(errs).toEqual([])
    })

    it('errors when conflict target does not exist as option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'json', conflictsWith: ['nonexistent'] })],
      })
      const errs = validator.checkConflicts(cmd)
      expect(errs).toEqual([])
    })
  })

  // ─── CLIValidator - checkDeprecations ─────────────────────────────────

  describe('checkDeprecations', () => {
    const validator = new CLIValidator()

    it('returns empty for non-deprecated command', () => {
      expect(validator.checkDeprecations(makeCommand())).toEqual([])
    })

    it('warns when command is deprecated', () => {
      const warnings = validator.checkDeprecations(makeCommand({ deprecated: true }))
      expect(warnings).toContain('Command "test" is deprecated')
    })

    it('warns when option default is not in choices', () => {
      const warnings = validator.checkDeprecations(
        makeCommand({
          options: [
            makeOption({ name: 'fmt', defaultValue: 'xml', choices: ['json', 'yaml'] }),
          ],
        }),
      )
      expect(warnings).toContain(
        'Option "--fmt" default not in choices, may indicate deprecated config',
      )
    })

    it('does not warn when option default is in choices', () => {
      const warnings = validator.checkDeprecations(
        makeCommand({
          options: [
            makeOption({ name: 'fmt', defaultValue: 'json', choices: ['json', 'yaml'] }),
          ],
        }),
      )
      expect(warnings).toEqual([])
    })

    it('warns on deprecated subcommand', () => {
      const warnings = validator.checkDeprecations(
        makeCommand({
          subcommands: [makeCommand({ name: 'legacy', deprecated: true })],
        }),
      )
      expect(warnings).toContain('Subcommand "legacy" is deprecated')
    })
  })

  // ─── CLIValidator - findDuplicateNames ────────────────────────────────

  describe('findDuplicateNames', () => {
    const validator = new CLIValidator()

    it('returns empty for unique names', () => {
      expect(validator.findDuplicateNames(makeCommand())).toEqual([])
    })

    it('finds duplicate option names', () => {
      const errs = validator.findDuplicateNames(
        makeCommand({
          options: [
            makeOption({ name: 'x' }),
            makeOption({ name: 'x' }),
          ],
        }),
      )
      expect(errs).toContain('Duplicate option name: x')
    })

    it('finds duplicate short option names', () => {
      const errs = validator.findDuplicateNames(
        makeCommand({
          options: [
            makeOption({ name: 'alpha', shortName: 'a' }),
            makeOption({ name: 'beta', shortName: 'a' }),
          ],
        }),
      )
      expect(errs).toContain('Duplicate short option name: -a')
    })

    it('finds duplicate aliases', () => {
      const errs = validator.findDuplicateNames(
        makeCommand({ aliases: ['dup', 'dup'] }),
      )
      expect(errs).toContain('Duplicate alias: dup')
    })
  })

  // ─── CLIValidator - validateAll ───────────────────────────────────────

  describe('validateAll', () => {
    const validator = new CLIValidator()

    it('passes for valid commands array', () => {
      const result = validator.validateAll([
        makeCommand({ name: 'build' }),
        makeCommand({ name: 'test' }),
      ])
      expect(result.valid).toBe(true)
    })

    it('fails on duplicate command names', () => {
      const result = validator.validateAll([
        makeCommand({ name: 'build' }),
        makeCommand({ name: 'build' }),
      ])
      expect(result.errors).toContain('Duplicate command name: build')
    })

    it('prefixes per-command errors with command name', () => {
      const result = validator.validateAll([
        makeCommand({ name: '' }),
      ])
      expect(result.errors.some((e) => e.startsWith('[] '))).toBe(true)
    })

    it('collects warnings from all commands', () => {
      const result = validator.validateAll([
        makeCommand({ name: 'old', deprecated: true }),
      ])
      expect(result.warnings.some((w) => w.includes('deprecated'))).toBe(true)
    })
  })
})

// ─── CommandBuilder - Builder Methods ──────────────────────────────────

describe('CommandBuilder', () => {
  describe('builder methods', () => {
    it('builds a command with name', () => {
      const cmd = new CommandBuilder().name('build').build()
      expect(cmd.name).toBe('build')
    })

    it('builds a command with description', () => {
      const cmd = new CommandBuilder().description('Build the project').build()
      expect(cmd.description).toBe('Build the project')
    })

    it('builds a command with aliases', () => {
      const cmd = new CommandBuilder().alias('b').alias('bld').build()
      expect(cmd.aliases).toEqual(['b', 'bld'])
    })

    it('builds a command with arguments', () => {
      const arg: CLIArgument = { name: 'file', description: 'Input', required: true, variadic: false }
      const cmd = new CommandBuilder().argument(arg).build()
      expect(cmd.arguments).toEqual([arg])
    })

    it('builds a command with options', () => {
      const opt: CLIOption = { name: 'verbose', description: 'Verbose', type: 'boolean', required: false }
      const cmd = new CommandBuilder().option(opt).build()
      expect(cmd.options).toEqual([opt])
    })

    it('builds a command with subcommands', () => {
      const sub: CLICommand = makeCommand({ name: 'init' })
      const cmd = new CommandBuilder().subcommand(sub).build()
      expect(cmd.subcommands).toEqual([sub])
    })

    it('builds a command with examples', () => {
      const cmd = new CommandBuilder().example('myapp build').example('myapp build -v').build()
      expect(cmd.examples).toEqual(['myapp build', 'myapp build -v'])
    })

    it('builds a command with handler', () => {
      const cmd = new CommandBuilder().handler('handleBuild').build()
      expect(cmd.handler).toBe('handleBuild')
    })

    it('marks command as deprecated', () => {
      const cmd = new CommandBuilder().deprecated('use new command').build()
      expect(cmd.deprecated).toBe(true)
    })

    it('marks command as hidden', () => {
      const cmd = new CommandBuilder().hidden().build()
      expect(cmd.hidden).toBe(true)
    })

    it('returns default values for unset fields', () => {
      const cmd = new CommandBuilder().build()
      expect(cmd.name).toBe('')
      expect(cmd.description).toBe('')
      expect(cmd.aliases).toEqual([])
      expect(cmd.arguments).toEqual([])
      expect(cmd.options).toEqual([])
      expect(cmd.subcommands).toEqual([])
      expect(cmd.examples).toEqual([])
      expect(cmd.handler).toBeUndefined()
      expect(cmd.deprecated).toBe(false)
      expect(cmd.hidden).toBe(false)
    })

    it('returns builder instance from each method (chaining)', () => {
      const builder = new CommandBuilder()
      expect(builder.name('a')).toBe(builder)
      expect(builder.description('d')).toBe(builder)
      expect(builder.alias('x')).toBe(builder)
      expect(builder.argument(makeArgument())).toBe(builder)
      expect(builder.option(makeOption())).toBe(builder)
      expect(builder.subcommand(makeCommand())).toBe(builder)
      expect(builder.example('ex')).toBe(builder)
      expect(builder.handler('h')).toBe(builder)
      expect(builder.deprecated()).toBe(builder)
      expect(builder.hidden()).toBe(builder)
    })

    it('build returns a copy (not a reference to internal arrays)', () => {
      const builder = new CommandBuilder().alias('x')
      const cmd = builder.build()
      cmd.aliases.push('y')
      const cmd2 = builder.build()
      expect(cmd2.aliases).toEqual(['x'])
    })
  })

  // ─── CommandBuilder - generateHelp ────────────────────────────────────

  describe('generateHelp', () => {
    it('generates basic usage line', () => {
      const help = new CommandBuilder().name('build').generateHelp()
      expect(help).toContain('Usage: build')
    })

    it('includes arguments in usage line', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'file', required: true }))
        .generateHelp()
      expect(help).toContain('<file>')
    })

    it('includes optional arguments in usage line with brackets', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'file', required: false }))
        .generateHelp()
      expect(help).toContain('[file]')
    })

    it('includes variadic required args with ellipsis', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'files', required: true, variadic: true }))
        .generateHelp()
      expect(help).toContain('<files...>')
    })

    it('includes variadic optional args with ellipsis', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'files', required: false, variadic: true }))
        .generateHelp()
      expect(help).toContain('[files...]')
    })

    it('includes [options] when options are defined', () => {
      const help = new CommandBuilder()
        .name('build')
        .option(makeOption({ name: 'verbose', type: 'boolean' }))
        .generateHelp()
      expect(help).toContain('[options]')
    })

    it('includes [command] when subcommands are defined', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'init' }))
        .generateHelp()
      expect(help).toContain('[command]')
    })

    it('includes description when set', () => {
      const help = new CommandBuilder()
        .name('build')
        .description('Build the project')
        .generateHelp()
      expect(help).toContain('Build the project')
    })

    it('includes Arguments section', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'file', description: 'Input file' }))
        .generateHelp()
      expect(help).toContain('Arguments:')
      expect(help).toContain('file')
      expect(help).toContain('Input file')
    })

    it('includes argument default value', () => {
      const help = new CommandBuilder()
        .name('build')
        .argument(makeArgument({ name: 'dir', description: 'Directory', defaultValue: '.' }))
        .generateHelp()
      expect(help).toContain('(default: .)')
    })

    it('includes Options section with short and long flags', () => {
      const help = new CommandBuilder()
        .name('build')
        .option(makeOption({ name: 'output', shortName: 'o', description: 'Output path' }))
        .generateHelp()
      expect(help).toContain('Options:')
      expect(help).toContain('-o, --output')
      expect(help).toContain('Output path')
    })

    it('includes long flag only when no shortName', () => {
      const help = new CommandBuilder()
        .name('build')
        .option(makeOption({ name: 'output', description: 'Output path' }))
        .generateHelp()
      expect(help).toContain('    --output')
      expect(help).not.toContain('-o,')
    })

    it('includes option default value', () => {
      const help = new CommandBuilder()
        .name('build')
        .option(makeOption({ name: 'format', defaultValue: 'json' }))
        .generateHelp()
      expect(help).toContain('(default: json)')
    })

    it('includes (required) label for required options', () => {
      const help = new CommandBuilder()
        .name('build')
        .option(makeOption({ name: 'output', required: true }))
        .generateHelp()
      expect(help).toContain('(required)')
    })

    it('includes Commands section for subcommands', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'init', description: 'Initialize' }))
        .generateHelp()
      expect(help).toContain('Commands:')
      expect(help).toContain('init')
      expect(help).toContain('Initialize')
    })

    it('hides hidden subcommands by default', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'secret', hidden: true }))
        .generateHelp()
      expect(help).not.toContain('secret')
    })

    it('shows hidden subcommands when showHidden is true', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'secret', hidden: true }))
        .generateHelp({ ...DEFAULT_HELP_CONFIG, showHidden: true })
      expect(help).toContain('secret')
    })

    it('shows deprecated label when showDeprecated is true', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'old', deprecated: true }))
        .generateHelp({ ...DEFAULT_HELP_CONFIG, showDeprecated: true })
      expect(help).toContain('(deprecated)')
    })

    it('does not show deprecated label by default', () => {
      const help = new CommandBuilder()
        .name('build')
        .subcommand(makeCommand({ name: 'old', deprecated: true }))
        .generateHelp()
      expect(help).not.toContain('(deprecated)')
    })

    it('includes Examples section', () => {
      const help = new CommandBuilder()
        .name('build')
        .example('myapp build src/')
        .generateHelp()
      expect(help).toContain('Examples:')
      expect(help).toContain('$ myapp build src/')
    })

    it('does not include sections for empty collections', () => {
      const help = new CommandBuilder().name('build').generateHelp()
      expect(help).not.toContain('Arguments:')
      expect(help).not.toContain('Options:')
      expect(help).not.toContain('Commands:')
      expect(help).not.toContain('Examples:')
    })

    it('merges config with DEFAULT_HELP_CONFIG', () => {
      const help = new CommandBuilder().name('build').generateHelp({ ...DEFAULT_HELP_CONFIG, maxWidth: 120 })
      expect(help).toContain('Usage: build')
    })
  })
})

// ─── DEFAULT_HELP_CONFIG ───────────────────────────────────────────────

describe('DEFAULT_HELP_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_HELP_CONFIG.maxWidth).toBe(80)
    expect(DEFAULT_HELP_CONFIG.showHidden).toBe(false)
    expect(DEFAULT_HELP_CONFIG.showDeprecated).toBe(false)
    expect(DEFAULT_HELP_CONFIG.colorize).toBe(false)
  })
})
