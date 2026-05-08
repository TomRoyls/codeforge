import type { CLICommand, CLIArgument, CLIOption, HelpConfig } from './types.js'
import { DEFAULT_HELP_CONFIG } from './types.js'

export class CommandBuilder {
  private _name = ''
  private _description = ''
  private _aliases: string[] = []
  private _arguments: CLIArgument[] = []
  private _options: CLIOption[] = []
  private _subcommands: CLICommand[] = []
  private _examples: string[] = []
  private _handler: string | undefined = undefined
  private _deprecated = false
  private _hidden = false

  name(name: string): CommandBuilder {
    this._name = name
    return this
  }

  description(desc: string): CommandBuilder {
    this._description = desc
    return this
  }

  alias(alias: string): CommandBuilder {
    this._aliases.push(alias)
    return this
  }

  argument(arg: CLIArgument): CommandBuilder {
    this._arguments.push(arg)
    return this
  }

  option(opt: CLIOption): CommandBuilder {
    this._options.push(opt)
    return this
  }

  subcommand(cmd: CLICommand): CommandBuilder {
    this._subcommands.push(cmd)
    return this
  }

  example(example: string): CommandBuilder {
    this._examples.push(example)
    return this
  }

  handler(fn: string): CommandBuilder {
    this._handler = fn
    return this
  }

  deprecated(_msg?: string): CommandBuilder {
    this._deprecated = true
    return this
  }

  hidden(): CommandBuilder {
    this._hidden = true
    return this
  }

  build(): CLICommand {
    return {
      name: this._name,
      description: this._description,
      aliases: [...this._aliases],
      arguments: [...this._arguments],
      options: [...this._options],
      subcommands: [...this._subcommands],
      handler: this._handler,
      examples: [...this._examples],
      deprecated: this._deprecated,
      hidden: this._hidden,
    }
  }

  generateHelp(config?: HelpConfig): string {
    const cfg = { ...DEFAULT_HELP_CONFIG, ...config }
    const lines: string[] = []
    const cmd = this.build()

    lines.push(`Usage: ${cmd.name}`)

    if (cmd.arguments.length > 0) {
      const argStr = cmd.arguments
        .map((a) => {
          if (a.variadic) return a.required ? `<${a.name}...>` : `[${a.name}...]`
          return a.required ? `<${a.name}>` : `[${a.name}]`
        })
        .join(' ')
      lines[0]! += ` ${argStr}`
    }

    if (cmd.options.length > 0) {
      lines[0]! += ' [options]'
    }

    if (cmd.subcommands.length > 0) {
      lines[0]! += ' [command]'
    }

    if (cmd.description) {
      lines.push('')
      lines.push(cmd.description)
    }

    const visibleArgs = cmd.arguments
    if (visibleArgs.length > 0) {
      lines.push('')
      lines.push('Arguments:')
      for (const arg of visibleArgs) {
        const padded = arg.name.padEnd(20)
        let desc = arg.description
        if (arg.defaultValue !== undefined) {
          desc += ` (default: ${String(arg.defaultValue)})`
        }
        lines.push(`  ${padded} ${desc}`)
      }
    }

    const visibleOpts = cmd.options
    if (visibleOpts.length > 0) {
      lines.push('')
      lines.push('Options:')
      for (const opt of visibleOpts) {
        const flag = opt.shortName
          ? `-${opt.shortName}, --${opt.name}`
          : `    --${opt.name}`
        const padded = flag.padEnd(25)
        let desc = opt.description
        if (opt.defaultValue !== undefined) {
          desc += ` (default: ${String(opt.defaultValue)})`
        }
        if (opt.required) {
          desc += ' (required)'
        }
        lines.push(`  ${padded} ${desc}`)
      }
    }

    const visibleSubs = cfg.showHidden
      ? cmd.subcommands
      : cmd.subcommands.filter((s) => !s.hidden)
    if (visibleSubs.length > 0) {
      lines.push('')
      lines.push('Commands:')
      for (const sub of visibleSubs) {
        const padded = sub.name.padEnd(20)
        let desc = sub.description
        if (sub.deprecated && cfg.showDeprecated) {
          desc += ' (deprecated)'
        }
        lines.push(`  ${padded} ${desc}`)
      }
    }

    if (cmd.examples.length > 0) {
      lines.push('')
      lines.push('Examples:')
      for (const ex of cmd.examples) {
        lines.push(`  $ ${ex}`)
      }
    }

    return lines.join('\n')
  }
}
