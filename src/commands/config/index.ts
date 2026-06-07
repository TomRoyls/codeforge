import { Command } from '@oclif/core'

export default class Config extends Command {
  static override description = 'Manage CodeForge configuration'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> validate',
      description: 'Validate the configuration file',
    },
  ]

  async run(): Promise<void> {
    this.log(Config.description)
    this.log('')
    this.log('Available commands:')
    this.log('  validate  Validate the configuration file')
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
