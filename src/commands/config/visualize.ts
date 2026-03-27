import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { ConfigCache } from '../../config/cache.js'
import { findConfigPath } from '../../config/discovery.js'
import { parseEnvVars } from '../../config/env-parser.js'
import { mergeConfigs } from '../../config/merger.js'
import { validateConfig } from '../../config/validator.js'

export default class ConfigVisualize extends Command {
  static override description = 'Visualize the current CodeForge configuration'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Visualize configuration as a tree',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --json',
      description: 'Output configuration as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --sources',
      description: 'Show configuration sources',
    },
  ]

  static override flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    sources: Flags.boolean({
      default: false,
      description: 'Show configuration sources',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(ConfigVisualize)

    const configPath = await findConfigPath(process.cwd())
    const configCache = new ConfigCache()

    let fileConfig: Record<string, unknown> = {}
    if (configPath) {
      try {
        const cached = await configCache.getConfig(configPath)
        if (cached) {
          fileConfig = cached as Record<string, unknown>
        }
      } catch {
        fileConfig = {}
      }
    }

    const envConfig = parseEnvVars()
    const mergedConfig = mergeConfigs(fileConfig, envConfig)

    let validatedConfig: Record<string, unknown>
    try {
      validatedConfig = validateConfig(mergedConfig) as Record<string, unknown>
    } catch {
      validatedConfig = mergedConfig as Record<string, unknown>
    }

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            config: validatedConfig,
            sources: {
              env: envConfig,
              file: fileConfig,
              path: configPath,
            },
          },
          null,
          2,
        ),
      )
      return
    }

    this.log('')
    this.log(chalk.bold('  CodeForge Configuration'))
    this.log('')

    if (flags.sources) {
      this.displaySources(configPath, fileConfig, envConfig)
    }

    this.displayConfigTree(validatedConfig)
    this.log('')
  }

  private displayConfigTree(config: Record<string, unknown>): void {
    this.log(chalk.gray('  Configuration:'))
    this.log('')

    const displayObject = (obj: Record<string, unknown>, indent: number): void => {
      const prefix = '    '.repeat(indent)

      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          this.log(`${prefix}${chalk.cyan(key)}:`)
          displayObject(value as Record<string, unknown>, indent + 1)
        } else {
          const displayValue = String(value)
          this.log(`${prefix}${chalk.green(key)}: ${displayValue}`)
        }
      }
    }

    displayObject(config, 1)
  }

  private displaySources(
    configPath: null | string,
    fileConfig: Record<string, unknown>,
    envConfig: Record<string, unknown>,
  ): void {
    this.log(chalk.gray('  Sources:'))
    this.log('')

    if (configPath) {
      this.log(`    File: ${chalk.cyan(configPath)}`)
      const fileKeys = Object.keys(fileConfig)
      if (fileKeys.length > 0) {
        this.log(`    File settings: ${fileKeys.length} keys`)
      }
    } else {
      this.log(chalk.gray('    No configuration file found'))
    }

    const envKeys = Object.keys(envConfig)
    if (envKeys.length > 0) {
      this.log(`    Environment variables: ${envKeys.length} keys`)
    }
  }
}
