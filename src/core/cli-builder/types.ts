export interface CLICommand {
  name: string
  description: string
  aliases: string[]
  arguments: CLIArgument[]
  options: CLIOption[]
  subcommands: CLICommand[]
  handler?: string
  examples: string[]
  deprecated: boolean
  hidden: boolean
}

export interface CLIArgument {
  name: string
  description: string
  required: boolean
  variadic: boolean
  defaultValue?: unknown
  choices?: string[]
}

export interface CLIOption {
  name: string
  shortName?: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'array'
  required: boolean
  defaultValue?: unknown
  choices?: string[]
  dependsOn?: string[]
  conflictsWith?: string[]
}

export interface ParseResult {
  command: string
  args: Map<string, unknown>
  options: Map<string, unknown>
  remaining: string[]
  errors: string[]
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface HelpConfig {
  maxWidth: number
  showHidden: boolean
  showDeprecated: boolean
  colorize: boolean
}

export const DEFAULT_HELP_CONFIG: HelpConfig = {
  maxWidth: 80,
  showHidden: false,
  showDeprecated: false,
  colorize: false,
}
