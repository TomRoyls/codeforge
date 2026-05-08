import type { CLICommand, CLIOption, ParseResult } from './types.js'

export class ArgumentParser {
  parse(argv: string[], command: CLICommand): ParseResult {
    const args = new Map<string, unknown>()
    const options = new Map<string, unknown>()
    const remaining: string[] = []
    const errors: string[] = []

    const optionMap = new Map<string, CLIOption>()
    for (const opt of command.options) {
      optionMap.set(`--${opt.name}`, opt)
      if (opt.shortName) {
        optionMap.set(`-${opt.shortName}`, opt)
      }
    }

    const positionalArgs: string[] = []
    let i = 0
    while (i < argv.length) {
      const token = argv[i]!
      if (token === '--') {
        remaining.push(...argv.slice(i + 1))
        break
      }

      if (token.startsWith('--') || token.startsWith('-')) {
        const eqIndex = token.indexOf('=')
        if (eqIndex !== -1) {
          const flagPart = token.substring(0, eqIndex)
          const valuePart = token.substring(eqIndex + 1)
          const opt = optionMap.get(flagPart)
          if (opt) {
            options.set(opt.name, this.coerceValue(valuePart, opt.type))
          } else {
            errors.push(`Unknown option: ${flagPart}`)
          }
        } else {
          const opt = optionMap.get(token)
          if (opt) {
            if (opt.type === 'boolean') {
              options.set(opt.name, true)
            } else {
              const nextIdx = i + 1
              if (nextIdx < argv.length && !argv[nextIdx]!.startsWith('-')) {
                const rawValue = argv[nextIdx]!
                if (opt.type === 'array') {
                  const existing = options.get(opt.name)
                  const arr = Array.isArray(existing) ? [...existing] : []
                  arr.push(rawValue)
                  options.set(opt.name, arr)
                } else {
                  options.set(opt.name, this.coerceValue(rawValue, opt.type))
                }
                i = nextIdx
              } else {
                errors.push(`Option ${token} requires a value`)
              }
            }
          } else {
            remaining.push(token)
          }
        }
      } else {
        positionalArgs.push(token)
      }
      i++
    }

    let argIdx = 0
    for (const argDef of command.arguments) {
      if (argDef.variadic) {
        const rest = positionalArgs.slice(argIdx)
        args.set(argDef.name, rest)
        argIdx = positionalArgs.length
      } else if (argIdx < positionalArgs.length) {
        args.set(argDef.name, positionalArgs[argIdx])
        argIdx++
      }
    }

    this.resolveDefaults(options, command)
    this.resolveArgDefaults(args, command)

    const requiredErrors = this.validateRequired(
      { command: command.name, args, options, remaining, errors: [] },
      command,
    )
    errors.push(...requiredErrors)

    return { command: command.name, args, options, remaining, errors }
  }

  parseOption(
    arg: string,
    options: CLIOption[],
  ): { name: string; value: unknown } | null {
    for (const opt of options) {
      if (arg === `--${opt.name}` || (opt.shortName && arg === `-${opt.shortName}`)) {
        if (opt.type === 'boolean') {
          return { name: opt.name, value: true }
        }
        return { name: opt.name, value: undefined }
      }
      const prefix = `--${opt.name}=`
      if (arg.startsWith(prefix)) {
        const rawValue = arg.substring(prefix.length)
        return { name: opt.name, value: this.coerceValue(rawValue, opt.type) }
      }
      if (opt.shortName) {
        const shortPrefix = `-${opt.shortName}=`
        if (arg.startsWith(shortPrefix)) {
          const rawValue = arg.substring(shortPrefix.length)
          return { name: opt.name, value: this.coerceValue(rawValue, opt.type) }
        }
      }
    }
    return null
  }

  coerceValue(value: string, type: CLIOption['type']): unknown {
    switch (type) {
      case 'number': {
        const num = Number(value)
        return Number.isNaN(num) ? value : num
      }
      case 'boolean':
        return value === 'true' || value === '1'
      case 'array':
        return value.split(',')
      case 'string':
      default:
        return value
    }
  }

  resolveDefaults(
    options: Map<string, unknown>,
    command: CLICommand,
  ): Map<string, unknown> {
    for (const opt of command.options) {
      if (!options.has(opt.name) && opt.defaultValue !== undefined) {
        options.set(opt.name, opt.defaultValue)
      }
    }
    return options
  }

  resolveArgDefaults(
    args: Map<string, unknown>,
    command: CLICommand,
  ): Map<string, unknown> {
    for (const arg of command.arguments) {
      if (!args.has(arg.name) && arg.defaultValue !== undefined) {
        args.set(arg.name, arg.defaultValue)
      }
    }
    return args
  }

  validateRequired(parsed: ParseResult, command: CLICommand): string[] {
    const errors: string[] = []

    for (const arg of command.arguments) {
      if (arg.required && !parsed.args.has(arg.name)) {
        errors.push(`Missing required argument: ${arg.name}`)
      }
    }

    for (const opt of command.options) {
      if (opt.required && !parsed.options.has(opt.name)) {
        errors.push(`Missing required option: --${opt.name}`)
      }
    }

    return errors
  }
}
