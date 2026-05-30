import { Args, Command, Flags } from '@oclif/core'
import ora from 'ora'

import {
  getConfigValue,
  initConfig,
  loadConfig,
  saveConfig,
  setConfigValue,
  validateConfig,
} from '../config-helpers.js'
import { formatConfigJson, formatConfigTable } from '../config-format-helpers.js'

export default class Config extends Command {
  static override args = {
    action: Args.string({
      default: 'list',
      description: 'Action to perform (get|set|list|init)',
      options: ['get', 'init', 'list', 'set'],
    }),
    key: Args.string({
      description: 'Config key (dot-notation)',
      required: false,
    }),
    value: Args.string({
      description: 'Config value (for set action)',
      required: false,
    }),
  }

  static override description = 'Manage CodeForge configuration'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List current configuration',
    },
    {
      command: '<%= config.bin %> <%= command.id %> list --format json',
      description: 'List configuration as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> get format',
      description: 'Get a specific config value',
    },
    {
      command: '<%= config.bin %> <%= command.id %> set format json',
      description: 'Set a config value',
    },
    {
      command: '<%= config.bin %> <%= command.id %> set extensions .py,.rs',
      description: 'Set extensions (comma-separated)',
    },
    {
      command: '<%= config.bin %> <%= command.id %> init',
      description: 'Initialize config file with defaults',
    },
    {
      command: '<%= config.bin %> <%= command.id %> init --global',
      description: 'Initialize global config',
    },
  ]

  static override flags = {
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
    global: Flags.boolean({
      default: false,
      description: 'Use global config instead of project config',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Config)

    const action = args.action as 'get' | 'init' | 'list' | 'set'
    const useGlobal = flags.global as boolean
    const format = flags.format as 'json' | 'table'

    switch (action) {
      case 'list': {
        const spinner = ora('Loading configuration...').start()
        const configFile = loadConfig(useGlobal)
        spinner.succeed(`Configuration loaded from ${configFile.source}`)

        const output = format === 'json' ? formatConfigJson(configFile) : formatConfigTable(configFile)
        this.log(output)
        break
      }

      case 'get': {
        if (!args.key) {
          this.error('Key is required for get action', { exit: 1 })
        }

        const configFile = loadConfig(useGlobal)
        const result = getConfigValue(configFile.config, args.key as string)

        if (!result.found) {
          this.error(`Config key "${args.key}" not found`, { exit: 1 })
        }

        const displayValue = Array.isArray(result.value) ? result.value.join(', ') : String(result.value)
        this.log(displayValue)
        break
      }

      case 'set': {
        if (!args.key) {
          this.error('Key is required for set action', { exit: 1 })
        }
        if (!args.value) {
          this.error('Value is required for set action', { exit: 1 })
        }

        const spinner = ora('Setting configuration...').start()
        const configFile = loadConfig(useGlobal)
        const updated = setConfigValue(configFile.config, args.key as string, args.value as string)

        const validation = validateConfig(updated)
        if (!validation.valid) {
          spinner.fail('Invalid configuration')
          for (const error of validation.errors) {
            this.log(`  ${error}`)
          }
          this.exit(1)
        }

        saveConfig(updated, useGlobal)
        spinner.succeed(`Set "${args.key}" in ${useGlobal ? 'global' : 'project'} config`)
        break
      }

      case 'init': {
        const spinner = ora('Initializing configuration...').start()
        const configFile = initConfig(useGlobal)
        spinner.succeed(`Configuration initialized at ${configFile.path}`)

        const output = format === 'json' ? formatConfigJson(configFile) : formatConfigTable(configFile)
        this.log(output)
        break
      }
    }
  }
}

export {
  DEFAULT_CONFIG,
  getConfigValue,
  initConfig,
  loadConfig,
  resetConfig,
  saveConfig,
  setConfigValue,
  validateConfig,
} from '../config-helpers.js'
export type { CodeForgeConfig, ConfigFile } from '../config-helpers.js'
export { formatConfigDiff, formatConfigJson, formatConfigTable } from '../config-format-helpers.js'
