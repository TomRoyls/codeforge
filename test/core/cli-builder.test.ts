import { describe, it, expect } from 'vitest'
import { CommandBuilder } from '../../src/core/cli-builder/command-builder.js'
import { ArgumentParser } from '../../src/core/cli-builder/argument-parser.js'
import { CLIValidator } from '../../src/core/cli-builder/cli-validator.js'
import type {
  CLICommand,
  CLIArgument,
  CLIOption,
} from '../../src/core/cli-builder/types.js'

function makeCommand(overrides: Partial<CLICommand> = {}): CLICommand {
  return {
    name: 'test',
    description: 'A test command',
    aliases: [],
    arguments: [],
    options: [],
    subcommands: [],
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
    description: 'Output file',
    type: 'string',
    required: false,
    ...overrides,
  }
}

describe('CommandBuilder', () => {
  describe('name', () => {
    it('should set the command name', () => {
      const builder = new CommandBuilder()
      builder.name('analyze')
      const cmd = builder.build()
      expect(cmd.name).toBe('analyze')
    })

    it('should return the builder for chaining', () => {
      const builder = new CommandBuilder()
      const result = builder.name('test')
      expect(result).toBe(builder)
    })
  })

  describe('description', () => {
    it('should set the description', () => {
      const builder = new CommandBuilder()
      builder.description('Analyze code')
      const cmd = builder.build()
      expect(cmd.description).toBe('Analyze code')
    })

    it('should return the builder for chaining', () => {
      const builder = new CommandBuilder()
      const result = builder.description('test')
      expect(result).toBe(builder)
    })
  })

  describe('alias', () => {
    it('should add an alias', () => {
      const builder = new CommandBuilder()
      builder.name('analyze').alias('a').alias('check')
      const cmd = builder.build()
      expect(cmd.aliases).toEqual(['a', 'check'])
    })

    it('should return the builder for chaining', () => {
      const builder = new CommandBuilder()
      const result = builder.alias('x')
      expect(result).toBe(builder)
    })
  })

  describe('argument', () => {
    it('should add an argument', () => {
      const builder = new CommandBuilder()
      const arg = makeArgument()
      builder.argument(arg)
      const cmd = builder.build()
      expect(cmd.arguments).toHaveLength(1)
      expect(cmd.arguments[0]!.name).toBe('file')
    })

    it('should add multiple arguments preserving order', () => {
      const builder = new CommandBuilder()
      builder.argument(makeArgument({ name: 'first' }))
      builder.argument(makeArgument({ name: 'second' }))
      const cmd = builder.build()
      expect(cmd.arguments).toHaveLength(2)
      expect(cmd.arguments[0]!.name).toBe('first')
      expect(cmd.arguments[1]!.name).toBe('second')
    })
  })

  describe('option', () => {
    it('should add an option', () => {
      const builder = new CommandBuilder()
      const opt = makeOption()
      builder.option(opt)
      const cmd = builder.build()
      expect(cmd.options).toHaveLength(1)
      expect(cmd.options[0]!.name).toBe('output')
    })

    it('should add multiple options', () => {
      const builder = new CommandBuilder()
      builder.option(makeOption({ name: 'output' }))
      builder.option(makeOption({ name: 'verbose', type: 'boolean' }))
      const cmd = builder.build()
      expect(cmd.options).toHaveLength(2)
    })
  })

  describe('subcommand', () => {
    it('should add a subcommand', () => {
      const builder = new CommandBuilder()
      const sub = makeCommand({ name: 'init' })
      builder.subcommand(sub)
      const cmd = builder.build()
      expect(cmd.subcommands).toHaveLength(1)
      expect(cmd.subcommands[0]!.name).toBe('init')
    })
  })

  describe('example', () => {
    it('should add an example', () => {
      const builder = new CommandBuilder()
      builder.example('codeforge analyze src/')
      const cmd = builder.build()
      expect(cmd.examples).toEqual(['codeforge analyze src/'])
    })

    it('should add multiple examples', () => {
      const builder = new CommandBuilder()
      builder.example('ex1').example('ex2')
      const cmd = builder.build()
      expect(cmd.examples).toEqual(['ex1', 'ex2'])
    })
  })

  describe('handler', () => {
    it('should set the handler', () => {
      const builder = new CommandBuilder()
      builder.handler('analyzeHandler')
      const cmd = builder.build()
      expect(cmd.handler).toBe('analyzeHandler')
    })
  })

  describe('deprecated', () => {
    it('should mark the command as deprecated', () => {
      const builder = new CommandBuilder()
      builder.deprecated()
      const cmd = builder.build()
      expect(cmd.deprecated).toBe(true)
    })

    it('should mark deprecated with a message', () => {
      const builder = new CommandBuilder()
      builder.deprecated('Use analyze instead')
      const cmd = builder.build()
      expect(cmd.deprecated).toBe(true)
    })
  })

  describe('hidden', () => {
    it('should mark the command as hidden', () => {
      const builder = new CommandBuilder()
      builder.hidden()
      const cmd = builder.build()
      expect(cmd.hidden).toBe(true)
    })
  })

  describe('build', () => {
    it('should build a command with all fields', () => {
      const cmd = new CommandBuilder()
        .name('analyze')
        .description('Analyze code')
        .alias('a')
        .argument(makeArgument())
        .option(makeOption())
        .subcommand(makeCommand({ name: 'init' }))
        .example('codeforge analyze')
        .handler('handler')
        .build()
      expect(cmd.name).toBe('analyze')
      expect(cmd.description).toBe('Analyze code')
      expect(cmd.aliases).toEqual(['a'])
      expect(cmd.arguments).toHaveLength(1)
      expect(cmd.options).toHaveLength(1)
      expect(cmd.subcommands).toHaveLength(1)
      expect(cmd.examples).toEqual(['codeforge analyze'])
      expect(cmd.handler).toBe('handler')
      expect(cmd.deprecated).toBe(false)
      expect(cmd.hidden).toBe(false)
    })

    it('should produce isolated copies on multiple builds', () => {
      const builder = new CommandBuilder().name('test')
      const cmd1 = builder.build()
      const cmd2 = builder.build()
      expect(cmd1).not.toBe(cmd2)
      expect(cmd1.aliases).not.toBe(cmd2.aliases)
    })
  })

  describe('generateHelp', () => {
    it('should generate basic usage line', () => {
      const help = new CommandBuilder().name('test').generateHelp()
      expect(help).toContain('Usage: test')
    })

    it('should include description', () => {
      const help = new CommandBuilder()
        .name('test')
        .description('A test command')
        .generateHelp()
      expect(help).toContain('A test command')
    })

    it('should include arguments in usage', () => {
      const help = new CommandBuilder()
        .name('test')
        .argument(makeArgument({ name: 'file', required: true }))
        .generateHelp()
      expect(help).toContain('<file>')
    })

    it('should include optional arguments in usage', () => {
      const help = new CommandBuilder()
        .name('test')
        .argument(makeArgument({ name: 'file', required: false }))
        .generateHelp()
      expect(help).toContain('[file]')
    })

    it('should include variadic arguments in usage', () => {
      const help = new CommandBuilder()
        .name('test')
        .argument(
          makeArgument({ name: 'files', required: true, variadic: true }),
        )
        .generateHelp()
      expect(help).toContain('<files...>')
    })

    it('should include options section when options exist', () => {
      const help = new CommandBuilder()
        .name('test')
        .option(makeOption({ name: 'verbose', type: 'boolean' }))
        .generateHelp()
      expect(help).toContain('Options:')
      expect(help).toContain('--verbose')
    })

    it('should include short name in option display', () => {
      const help = new CommandBuilder()
        .name('test')
        .option(makeOption({ name: 'verbose', shortName: 'v', type: 'boolean' }))
        .generateHelp()
      expect(help).toContain('-v')
      expect(help).toContain('--verbose')
    })

    it('should include default value in option display', () => {
      const help = new CommandBuilder()
        .name('test')
        .option(makeOption({ name: 'format', defaultValue: 'json' }))
        .generateHelp()
      expect(help).toContain('(default: json)')
    })

    it('should include required marker in option display', () => {
      const help = new CommandBuilder()
        .name('test')
        .option(makeOption({ name: 'output', required: true }))
        .generateHelp()
      expect(help).toContain('(required)')
    })

    it('should include default value in argument display', () => {
      const help = new CommandBuilder()
        .name('test')
        .argument(makeArgument({ name: 'file', defaultValue: 'src/' }))
        .generateHelp()
      expect(help).toContain('(default: src/)')
    })

    it('should include subcommands section', () => {
      const help = new CommandBuilder()
        .name('test')
        .subcommand(makeCommand({ name: 'init', description: 'Initialize' }))
        .generateHelp()
      expect(help).toContain('Commands:')
      expect(help).toContain('init')
    })

    it('should hide hidden subcommands by default', () => {
      const help = new CommandBuilder()
        .name('test')
        .subcommand(
          makeCommand({ name: 'secret', description: 'Secret', hidden: true }),
        )
        .generateHelp()
      expect(help).not.toContain('secret')
    })

    it('should show hidden subcommands with config', () => {
      const help = new CommandBuilder()
        .name('test')
        .subcommand(
          makeCommand({ name: 'secret', description: 'Secret', hidden: true }),
        )
        .generateHelp({ showHidden: true, maxWidth: 80, showDeprecated: false, colorize: false })
      expect(help).toContain('secret')
    })

    it('should show deprecated subcommands with config', () => {
      const help = new CommandBuilder()
        .name('test')
        .subcommand(
          makeCommand({
            name: 'old',
            description: 'Old command',
            deprecated: true,
          }),
        )
        .generateHelp({ showDeprecated: true, maxWidth: 80, showHidden: false, colorize: false })
      expect(help).toContain('(deprecated)')
    })

    it('should include examples section', () => {
      const help = new CommandBuilder()
        .name('test')
        .example('test --help')
        .generateHelp()
      expect(help).toContain('Examples:')
      expect(help).toContain('$ test --help')
    })

    it('should include [options] in usage when options exist', () => {
      const help = new CommandBuilder()
        .name('test')
        .option(makeOption({ name: 'verbose', type: 'boolean' }))
        .generateHelp()
      expect(help).toContain('[options]')
    })

    it('should include [command] in usage when subcommands exist', () => {
      const help = new CommandBuilder()
        .name('test')
        .subcommand(makeCommand({ name: 'sub' }))
        .generateHelp()
      expect(help).toContain('[command]')
    })
  })
})

describe('ArgumentParser', () => {
  const parser = new ArgumentParser()

  describe('parse', () => {
    it('should parse a simple argument', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const result = parser.parse(['input.ts'], cmd)
      expect(result.args.get('file')).toBe('input.ts')
    })

    it('should parse multiple arguments', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'src', required: true }),
          makeArgument({ name: 'dest', required: true }),
        ],
      })
      const result = parser.parse(['a.ts', 'b.ts'], cmd)
      expect(result.args.get('src')).toBe('a.ts')
      expect(result.args.get('dest')).toBe('b.ts')
    })

    it('should parse a string option with --', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', type: 'string' })],
      })
      const result = parser.parse(['--output', 'out.json'], cmd)
      expect(result.options.get('output')).toBe('out.json')
    })

    it('should parse a short option', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'output', shortName: 'o', type: 'string' }),
        ],
      })
      const result = parser.parse(['-o', 'out.json'], cmd)
      expect(result.options.get('output')).toBe('out.json')
    })

    it('should parse a boolean option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'verbose', type: 'boolean' })],
      })
      const result = parser.parse(['--verbose'], cmd)
      expect(result.options.get('verbose')).toBe(true)
    })

    it('should parse a number option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'count', type: 'number' })],
      })
      const result = parser.parse(['--count', '42'], cmd)
      expect(result.options.get('count')).toBe(42)
    })

    it('should parse an option with equals sign', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', type: 'string' })],
      })
      const result = parser.parse(['--format=json'], cmd)
      expect(result.options.get('format')).toBe('json')
    })

    it('should apply default values for options', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      const result = parser.parse([], cmd)
      expect(result.options.get('format')).toBe('json')
    })

    it('should apply default values for arguments', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'file', required: false, defaultValue: '.' }),
        ],
      })
      const result = parser.parse([], cmd)
      expect(result.args.get('file')).toBe('.')
    })

    it('should report missing required argument', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const result = parser.parse([], cmd)
      expect(result.errors).toContain('Missing required argument: file')
    })

    it('should report missing required option', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', required: true })],
      })
      const result = parser.parse([], cmd)
      expect(result.errors).toContain('Missing required option: --output')
    })

    it('should collect remaining args after --', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'verbose', type: 'boolean' })],
      })
      const result = parser.parse(['--verbose', '--', 'arg1', 'arg2'], cmd)
      expect(result.remaining).toEqual(['arg1', 'arg2'])
    })

    it('should parse variadic arguments', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'files', required: true, variadic: true }),
        ],
      })
      const result = parser.parse(['a.ts', 'b.ts', 'c.ts'], cmd)
      expect(result.args.get('files')).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    it('should handle mixed positional and options', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
        options: [makeOption({ name: 'verbose', type: 'boolean' })],
      })
      const result = parser.parse(['input.ts', '--verbose'], cmd)
      expect(result.args.get('file')).toBe('input.ts')
      expect(result.options.get('verbose')).toBe(true)
    })

    it('should report error when option needs a value', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', type: 'string' })],
      })
      const result = parser.parse(['--output'], cmd)
      expect(result.errors).toContain('Option --output requires a value')
    })

    it('should handle array options', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'files', type: 'array' })],
      })
      const result = parser.parse(['--files', 'a.ts'], cmd)
      const val = result.options.get('files')
      expect(Array.isArray(val)).toBe(true)
      expect(val).toContain('a.ts')
    })

    it('should report error for unknown option with equals', () => {
      const cmd = makeCommand({ options: [] })
      const result = parser.parse(['--unknown=value'], cmd)
      expect(result.errors).toContain('Unknown option: --unknown')
    })

    it('should pass unknown flags to remaining', () => {
      const cmd = makeCommand({ options: [] })
      const result = parser.parse(['--unknown'], cmd)
      expect(result.remaining).toContain('--unknown')
    })
  })

  describe('parseOption', () => {
    const opts = [
      makeOption({ name: 'output', shortName: 'o', type: 'string' }),
      makeOption({ name: 'verbose', shortName: 'v', type: 'boolean' }),
    ]

    it('should parse a long option with value', () => {
      const result = parser.parseOption('--output=file.txt', opts)
      expect(result).toEqual({ name: 'output', value: 'file.txt' })
    })

    it('should parse a short option with value', () => {
      const result = parser.parseOption('-o', opts)
      expect(result).toEqual({ name: 'output', value: undefined })
    })

    it('should parse a boolean flag', () => {
      const result = parser.parseOption('--verbose', opts)
      expect(result).toEqual({ name: 'verbose', value: true })
    })

    it('should parse a short boolean flag', () => {
      const result = parser.parseOption('-v', opts)
      expect(result).toEqual({ name: 'verbose', value: true })
    })

    it('should return null for unknown option', () => {
      const result = parser.parseOption('--unknown', opts)
      expect(result).toBeNull()
    })

    it('should parse short option with equals', () => {
      const result = parser.parseOption('-o=file.txt', opts)
      expect(result).toEqual({ name: 'output', value: 'file.txt' })
    })
  })

  describe('coerceValue', () => {
    it('should coerce to number', () => {
      expect(parser.coerceValue('42', 'number')).toBe(42)
    })

    it('should return original for NaN number', () => {
      expect(parser.coerceValue('abc', 'number')).toBe('abc')
    })

    it('should coerce to boolean true', () => {
      expect(parser.coerceValue('true', 'boolean')).toBe(true)
    })

    it('should coerce "1" to boolean true', () => {
      expect(parser.coerceValue('1', 'boolean')).toBe(true)
    })

    it('should coerce to boolean false for other strings', () => {
      expect(parser.coerceValue('false', 'boolean')).toBe(false)
    })

    it('should coerce to array via comma split', () => {
      expect(parser.coerceValue('a,b,c', 'array')).toEqual(['a', 'b', 'c'])
    })

    it('should return string as-is', () => {
      expect(parser.coerceValue('hello', 'string')).toBe('hello')
    })

    it('should handle single element array', () => {
      expect(parser.coerceValue('a', 'array')).toEqual(['a'])
    })

    it('should handle negative numbers', () => {
      expect(parser.coerceValue('-5', 'number')).toBe(-5)
    })

    it('should handle float numbers', () => {
      expect(parser.coerceValue('3.14', 'number')).toBeCloseTo(3.14)
    })
  })

  describe('resolveDefaults', () => {
    it('should apply default values for missing options', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      const opts = new Map<string, unknown>()
      parser.resolveDefaults(opts, cmd)
      expect(opts.get('format')).toBe('json')
    })

    it('should not override existing values', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'format', defaultValue: 'json' })],
      })
      const opts = new Map<string, unknown>()
      opts.set('format', 'yaml')
      parser.resolveDefaults(opts, cmd)
      expect(opts.get('format')).toBe('yaml')
    })

    it('should skip options without defaults', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output' })],
      })
      const opts = new Map<string, unknown>()
      parser.resolveDefaults(opts, cmd)
      expect(opts.has('output')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('should report missing required arguments', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
      })
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>(),
        remaining: [],
        errors: [],
      }
      const errors = parser.validateRequired(parsed, cmd)
      expect(errors).toContain('Missing required argument: file')
    })

    it('should report missing required options', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'output', required: true })],
      })
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>(),
        options: new Map<string, unknown>(),
        remaining: [],
        errors: [],
      }
      const errors = parser.validateRequired(parsed, cmd)
      expect(errors).toContain('Missing required option: --output')
    })

    it('should return empty for satisfied requirements', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'file', required: true })],
        options: [makeOption({ name: 'output', required: true })],
      })
      const parsed = {
        command: 'test',
        args: new Map<string, unknown>([['file', 'a.ts']]),
        options: new Map<string, unknown>([['output', 'out.txt']]),
        remaining: [],
        errors: [],
      }
      const errors = parser.validateRequired(parsed, cmd)
      expect(errors).toHaveLength(0)
    })
  })
})

describe('CLIValidator', () => {
  const validator = new CLIValidator()

  describe('validateCommand', () => {
    it('should validate a correct command', () => {
      const cmd = makeCommand()
      const result = validator.validateCommand(cmd)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty name', () => {
      const cmd = makeCommand({ name: '' })
      const result = validator.validateCommand(cmd)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Command name is required')
    })

    it('should reject name with spaces', () => {
      const cmd = makeCommand({ name: 'bad name' })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Command name cannot contain spaces')
    })

    it('should reject alias with spaces', () => {
      const cmd = makeCommand({ aliases: ['bad alias'] })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Alias "bad alias" cannot contain spaces')
    })

    it('should warn about required arg after optional', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'opt', required: false }),
          makeArgument({ name: 'req', required: true }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.warnings).toContain(
        'Required argument "req" appears after optional argument',
      )
    })

    it('should reject duplicate argument names', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'file' }),
          makeArgument({ name: 'file' }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Duplicate argument name: file')
    })

    it('should reject multiple variadic arguments', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'first', variadic: true }),
          makeArgument({ name: 'second', variadic: true }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Only one variadic argument is allowed')
    })

    it('should reject variadic arg not in last position', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'files', variadic: true }),
          makeArgument({ name: 'other' }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain(
        'Variadic argument must be the last argument',
      )
    })

    it('should accept variadic arg in last position', () => {
      const cmd = makeCommand({
        arguments: [
          makeArgument({ name: 'file' }),
          makeArgument({ name: 'files', variadic: true }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).not.toContain(
        'Variadic argument must be the last argument',
      )
    })

    it('should warn about deprecated command', () => {
      const cmd = makeCommand({ deprecated: true })
      const result = validator.validateCommand(cmd)
      expect(result.warnings).toContain('Command "test" is deprecated')
    })

    it('should reject duplicate subcommand names', () => {
      const cmd = makeCommand({
        subcommands: [
          makeCommand({ name: 'init' }),
          makeCommand({ name: 'init' }),
        ],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Duplicate subcommand name: init')
    })

    it('should reject empty subcommand name', () => {
      const cmd = makeCommand({
        subcommands: [makeCommand({ name: '' })],
      })
      const result = validator.validateCommand(cmd)
      expect(result.errors).toContain('Subcommand name is required')
    })

    it('should warn about empty argument choices', () => {
      const cmd = makeCommand({
        arguments: [makeArgument({ name: 'type', choices: [] })],
      })
      const result = validator.validateCommand(cmd)
      expect(result.warnings).toContain(
        'Argument "type" has empty choices',
      )
    })
  })

  describe('validateOption', () => {
    it('should validate a correct option', () => {
      const opt = makeOption()
      const result = validator.validateOption(opt)
      expect(result.valid).toBe(true)
    })

    it('should reject empty option name', () => {
      const opt = makeOption({ name: '' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain('Option name is required')
    })

    it('should reject option name with spaces', () => {
      const opt = makeOption({ name: 'bad name' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain('Option name cannot contain spaces')
    })

    it('should reject short name longer than 1 char', () => {
      const opt = makeOption({ shortName: 'ab' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Short name "ab" must be a single character',
      )
    })

    it('should reject short name of "-"', () => {
      const opt = makeOption({ shortName: '-' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain('Short name cannot be "-"')
    })

    it('should reject boolean default that is not boolean', () => {
      const opt = makeOption({ type: 'boolean', defaultValue: 'yes' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Boolean option default must be a boolean',
      )
    })

    it('should reject number default that is not number', () => {
      const opt = makeOption({ type: 'number', defaultValue: 'five' })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Number option default must be a number',
      )
    })

    it('should accept valid boolean default', () => {
      const opt = makeOption({ type: 'boolean', defaultValue: true })
      const result = validator.validateOption(opt)
      expect(result.valid).toBe(true)
    })

    it('should accept valid number default', () => {
      const opt = makeOption({ type: 'number', defaultValue: 42 })
      const result = validator.validateOption(opt)
      expect(result.valid).toBe(true)
    })

    it('should warn about empty choices', () => {
      const opt = makeOption({ choices: [] })
      const result = validator.validateOption(opt)
      expect(result.warnings).toContain(
        'Option "output" has empty choices',
      )
    })

    it('should reject default not in choices', () => {
      const opt = makeOption({
        defaultValue: 'xml',
        choices: ['json', 'yaml'],
      })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Default value "xml" is not in choices: [json, yaml]',
      )
    })

    it('should accept default that is in choices', () => {
      const opt = makeOption({
        defaultValue: 'json',
        choices: ['json', 'yaml'],
      })
      const result = validator.validateOption(opt)
      expect(result.valid).toBe(true)
    })

    it('should reject self-dependent option', () => {
      const opt = makeOption({ dependsOn: ['output'] })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Option "output" cannot depend on itself',
      )
    })

    it('should reject self-conflicting option', () => {
      const opt = makeOption({ conflictsWith: ['output'] })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Option "output" cannot conflict with itself',
      )
    })

    it('should reject option both depending on and conflicting with same option', () => {
      const opt = makeOption({
        dependsOn: ['verbose'],
        conflictsWith: ['verbose'],
      })
      const result = validator.validateOption(opt)
      expect(result.errors).toContain(
        'Option "output" both depends on and conflicts with "verbose"',
      )
    })
  })

  describe('checkConflicts', () => {
    it('should detect asymmetric conflict declarations', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'json', conflictsWith: ['yaml'] }),
          makeOption({ name: 'yaml' }),
        ],
      })
      const errors = validator.checkConflicts(cmd)
      expect(errors).toContain(
        'Option "--json" conflicts with "--yaml" but reverse conflict is not declared',
      )
    })

    it('should accept symmetric conflict declarations', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'json', conflictsWith: ['yaml'] }),
          makeOption({ name: 'yaml', conflictsWith: ['json'] }),
        ],
      })
      const errors = validator.checkConflicts(cmd)
      expect(errors).toHaveLength(0)
    })

    it('should return empty for no conflicts', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'verbose', type: 'boolean' })],
      })
      const errors = validator.checkConflicts(cmd)
      expect(errors).toHaveLength(0)
    })
  })

  describe('checkDeprecations', () => {
    it('should warn about deprecated command', () => {
      const cmd = makeCommand({ deprecated: true })
      const warnings = validator.checkDeprecations(cmd)
      expect(warnings).toContain('Command "test" is deprecated')
    })

    it('should warn about deprecated subcommand', () => {
      const cmd = makeCommand({
        subcommands: [
          makeCommand({ name: 'old', deprecated: true }),
        ],
      })
      const warnings = validator.checkDeprecations(cmd)
      expect(warnings).toContain('Subcommand "old" is deprecated')
    })

    it('should return empty for non-deprecated command', () => {
      const cmd = makeCommand()
      const warnings = validator.checkDeprecations(cmd)
      expect(warnings).toHaveLength(0)
    })
  })

  describe('findDuplicateNames', () => {
    it('should find duplicate option names', () => {
      const cmd = makeCommand({
        options: [makeOption({ name: 'a' }), makeOption({ name: 'a' })],
      })
      const errors = validator.findDuplicateNames(cmd)
      expect(errors).toContain('Duplicate option name: a')
    })

    it('should find duplicate short names', () => {
      const cmd = makeCommand({
        options: [
          makeOption({ name: 'alpha', shortName: 'a' }),
          makeOption({ name: 'all', shortName: 'a' }),
        ],
      })
      const errors = validator.findDuplicateNames(cmd)
      expect(errors).toContain('Duplicate short option name: -a')
    })

    it('should find duplicate aliases', () => {
      const cmd = makeCommand({ aliases: ['x', 'x'] })
      const errors = validator.findDuplicateNames(cmd)
      expect(errors).toContain('Duplicate alias: x')
    })

    it('should return empty for unique names', () => {
      const cmd = makeCommand({
        aliases: ['a', 'b'],
        options: [makeOption({ name: 'x' }), makeOption({ name: 'y' })],
      })
      const errors = validator.findDuplicateNames(cmd)
      expect(errors).toHaveLength(0)
    })
  })

  describe('validateAll', () => {
    it('should validate multiple commands', () => {
      const commands = [makeCommand({ name: 'a' }), makeCommand({ name: 'b' })]
      const result = validator.validateAll(commands)
      expect(result.valid).toBe(true)
    })

    it('should reject duplicate command names', () => {
      const commands = [
        makeCommand({ name: 'analyze' }),
        makeCommand({ name: 'analyze' }),
      ]
      const result = validator.validateAll(commands)
      expect(result.errors).toContain('Duplicate command name: analyze')
    })

    it('should prefix errors with command name', () => {
      const commands = [makeCommand({ name: '' })]
      const result = validator.validateAll(commands)
      expect(result.errors.some((e) => e.startsWith('[]'))).toBe(true)
    })

    it('should validate each command individually', () => {
      const commands = [
        makeCommand({ name: 'good' }),
        makeCommand({ name: 'bad name' }),
      ]
      const result = validator.validateAll(commands)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        '[bad name] Command name cannot contain spaces',
      )
    })
  })
})
