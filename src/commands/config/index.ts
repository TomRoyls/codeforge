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
    this.log('Manage CodeForge configuration')
    this.log('')
    this.log('Available commands:')
    this.log('  validate  Validate the configuration file')
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
