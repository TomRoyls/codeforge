import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import path from 'node:path'

import { ConfigCache } from '../../config/cache.js'
import { findConfigPath } from '../../config/discovery.js'
import { validateConfig } from '../../config/validator.js'
import { CLIError } from '../../utils/errors.js'

export default class Validate extends Command {
  static override description = 'Validate the CodeForge configuration file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Validate config in current directory',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --config .codeforgerc.json',
      description: 'Validate specific config file',
    },
  ]

  static override flags = {
    config: Flags.string({
      char: 'c',
      description: 'Path to config file',
    }),
  }

  private configCache = new ConfigCache()

  async run(): Promise<void> {
    const { flags } = await this.parse(Validate)

    const configPath = await findConfigPath(flags.config, process.cwd())

    if (!configPath) {
      this.log(chalk.yellow('No configuration file found'))
      this.log('')
      this.log(chalk.gray('Create a config file using: codeforge init'))
      this.exit(1)
    }

    const rawConfig = await this.configCache.getConfig(configPath)

    if (!rawConfig) {
      this.log(chalk.red('✗ Failed to load configuration file'))
      this.log('')
      this.log(chalk.gray(`Config file: ${configPath}`))
      this.exit(1)
    }

    try {
      const validatedConfig = validateConfig(rawConfig)

      this.log(chalk.green('✓ Configuration is valid'))
      this.log('')
      this.log(chalk.bold('Configuration:'))
      this.log(chalk.gray(`  Config file: ${path.basename(configPath)}`))

      if (validatedConfig.rules && Object.keys(validatedConfig.rules).length > 0) {
        const rulesCount = Object.keys(validatedConfig.rules).length
        this.log(chalk.gray(`  Rules enabled: ${rulesCount}`))
      }

      if (validatedConfig.files && validatedConfig.files.length > 0) {
        this.log(chalk.gray(`  Files patterns: ${JSON.stringify(validatedConfig.files)}`))
      }

      if (validatedConfig.ignore && validatedConfig.ignore.length > 0) {
        this.log(chalk.gray(`  Ignore patterns: ${JSON.stringify(validatedConfig.ignore)}`))
      }

      this.exit(0)
    } catch (error) {
      if (error instanceof CLIError) {
        this.log(chalk.red('✗ Configuration has errors:'))
        this.log('')
        this.log(chalk.red(`  ${error.message}`))

        if (error.suggestions.length > 0) {
          this.log('')
          for (const suggestion of error.suggestions) {
            this.log(chalk.yellow(`  - ${suggestion}`))
          }
        }

        this.log('')
        this.log(chalk.gray(`Config file: ${path.basename(configPath)}`))
        this.exit(1)
      }

      throw error
    }
  }
}
