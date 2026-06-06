import { Args, Command, Flags } from '@oclif/core'
import {
  getConfigValue,
  loadConfig,
  resetConfig,
  saveConfig,
  setConfigValue,
} from '../config-helpers.js'
import { formatConfigTable } from '../config-format-helpers.js'

export default class Config extends Command {
  static override args = {
    action: Args.string({
      default: 'list',
      description: 'Config action to perform',
      options: ['clear', 'delete', 'get', 'init', 'list', 'set'],
    }),
    key: Args.string({
      description: 'Config key (dot-notation supported)',
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
      description: 'List all configuration values',
    },
    {
      command: '<%= config.bin %> <%= command.id %> get rules',
      description: 'Get a specific config value',
    },
    {
      command: '<%= config.bin %> <%= command.id %> set severity error',
      description: 'Set a config value',
    },
    {
      command: '<%= config.bin %> <%= command.id %> delete rules',
      description: 'Delete a config key',
    },
    {
      command: '<%= config.bin %> <%= command.id %> clear',
      description: 'Reset configuration to defaults',
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
      char: 'g',
      default: false,
      description: 'Operate on global config (~/.codeforgerc.json)',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Config)

    switch (args.action) {
      case 'list':
        this.listConfig(flags.global, flags.format)
        break
      case 'get':
        this.getConfig(flags.global, args.key!)
        break
      case 'set':
        this.setConfig(flags.global, args.key!, args.value!)
        break
      case 'delete':
        this.deleteConfig(flags.global, args.key!)
        break
      case 'clear':
        this.clearConfig(flags.global)
        break
    }
  }

  private listConfig(global: boolean, format: string): void {
    const configFile = loadConfig(global)
    if (!configFile.exists) {
      this.log('No configuration file found. Run `codeforge init` to create one.')
      return
    }
    if (format === 'json') {
      this.log(JSON.stringify(configFile.config, null, 2))
    } else {
      this.log(formatConfigTable(configFile))
    }
  }

  private getConfig(global: boolean, key: string): void {
    const configFile = loadConfig(global)
    if (!configFile.exists) {
      this.error('No configuration file found.')
    }
    const result = getConfigValue(configFile.config, key)
    if (!result.found) {
      this.log('(not set)')
    } else {
      this.log(typeof result.value === 'object' ? JSON.stringify(result.value, null, 2) : String(result.value))
    }
  }

  private setConfig(global: boolean, key: string, value: string): void {
    const configFile = loadConfig(global)
    const updated = setConfigValue(configFile.config, key, value)
    saveConfig(updated, global)
    this.log(`Set ${key} = ${value}`)
  }

  private deleteConfig(global: boolean, key: string): void {
    const configFile = loadConfig(global)
    if (!configFile.exists) {
      this.error('No configuration file found.')
    }
    const parts = key.split('.')
    let current: Record<string, unknown> = configFile.config as unknown as Record<string, unknown>
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]!] as Record<string, unknown>
      if (!current) {
        this.error(`Key not found: ${key}`)
      }
    }
    delete current[parts[parts.length - 1]!]
    saveConfig(configFile.config, global)
    this.log(`Deleted ${key}`)
  }

  private clearConfig(global: boolean): void {
    resetConfig(global)
    this.log('Configuration reset to defaults.')
  }
}

export {
  DEFAULT_CONFIG,
  getConfigValue as _getConfigValue,
  initConfig,
  loadConfig as _loadConfig,
  resetConfig as _resetConfig,
  saveConfig as _saveConfig,
  setConfigValue as _setConfigValue,
  validateConfig,
} from '../config-helpers.js'
export type { CodeForgeConfig, ConfigFile } from '../config-helpers.js'
export {
  formatConfigDiff,
  formatConfigJson,
  formatConfigTable as _formatConfigTable,
} from '../config-format-helpers.js'
