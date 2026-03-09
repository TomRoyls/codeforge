import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join } from 'node:path'
import readline from 'node:readline'

import type { CodeForgeConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'

import { CONFIG_FILE_NAMES, DEFAULT_CONFIG } from '../config/types.js'
import { allRules } from '../rules/index.js'

interface InitOptions {
  force: boolean
  format: 'js' | 'json'
  minimal: boolean
  typescript: boolean
}

export default class Init extends Command {
  static override description = 'Initialize a new CodeForge configuration file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Create config interactively',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --minimal',
      description: 'Create minimal config with defaults',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format js',
      description: 'Create JavaScript config file',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --force',
      description: 'Overwrite existing config',
    },
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Overwrite existing configuration file',
    }),
    format: Flags.string({
      char: 'F',
      default: 'json',
      description: 'Configuration file format',
      options: ['json', 'js'],
    }),
    minimal: Flags.boolean({
      default: false,
      description: 'Create minimal configuration with recommended rules only',
    }),
    typescript: Flags.boolean({
      char: 't',
      default: true,
      description: 'Configure for TypeScript project',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Init)

    const options: InitOptions = {
      force: flags.force,
      format: flags.format as 'js' | 'json',
      minimal: flags.minimal,
      typescript: flags.typescript,
    }

    const existingConfig = this.detectExistingConfig()

    if (existingConfig && !options.force) {
      const shouldOverwrite = await this.confirmOverwrite(existingConfig)
      if (!shouldOverwrite) {
        this.log(chalk.yellow('Configuration not created.'))
        return
      }
    }

    const config = this.generateConfig(options)
    const configFileName = options.format === 'js' ? 'codeforge.config.js' : '.codeforgerc.json'
    const configPath = join(process.cwd(), configFileName)

    const content =
      options.format === 'js' ? this.generateJsContent(config) : this.generateJsonContent(config)

    await fs.mkdir(dirname(configPath), { recursive: true })
    await fs.writeFile(configPath, content, 'utf8')

    this.log(chalk.green(`✓ Created ${configFileName}`))
    this.log('')
    this.log(chalk.bold('Configuration:'))
    this.log(chalk.gray(`  Files: ${(config.files ?? []).join(', ')}`))
    this.log(chalk.gray(`  Ignore: ${(config.ignore ?? []).join(', ')}`))

    if (config.rules && Object.keys(config.rules).length > 0) {
      this.log(chalk.gray(`  Rules: ${Object.keys(config.rules).length} enabled`))
    }

    this.log('')
    this.log(chalk.bold('Next steps:'))
    this.log(chalk.gray('  1. Review and customize the configuration'))
    this.log(chalk.gray('  2. Run `codeforge analyze` to check your code'))
    this.log(chalk.gray('  3. Use `codeforge rules` to see all available rules'))
  }

  private async confirmOverwrite(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question(
        chalk.yellow(`Config file already exists at ${filePath}. Overwrite? (y/N) `),
        (answer) => {
          rl.close()
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
        },
      )
    })
  }

  private detectExistingConfig(): null | string {
    const cwd = process.cwd()

    for (const fileName of CONFIG_FILE_NAMES) {
      const filePath = join(cwd, fileName)
      if (existsSync(filePath)) {
        return filePath
      }
    }

    return null
  }

  private generateConfig(options: InitOptions): CodeForgeConfig {
    const config: CodeForgeConfig = {
      files: options.typescript
        ? ['**/*.ts', '**/*.tsx']
        : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignore: [...DEFAULT_CONFIG.ignore!],
    }

    if (!options.minimal) {
      const rules: Record<string, RuleSeverity> = {}

      for (const [ruleId, ruleDef] of Object.entries(allRules)) {
        if (ruleDef.meta.recommended) {
          rules[ruleId] = 'error'
        }
      }

      config.rules = rules as Record<string, [RuleSeverity, never] | RuleSeverity>
    }

    return config
  }

  private generateJsContent(config: CodeForgeConfig): string {
    return `/** @type {import('codeforge').CodeForgeConfig} */
export default ${JSON.stringify(config, null, 2)};
`
  }

  private generateJsonContent(config: CodeForgeConfig): string {
    return JSON.stringify(config, null, 2)
  }
}
