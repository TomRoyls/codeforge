import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import readline from 'node:readline'

import type { CodeForgeConfig } from '../config/types.js'
import type { RuleSeverity } from '../rules/types.js'

import { CONFIG_FILE_NAMES, DEFAULT_CONFIG } from '../config/types.js'
import { allRules, getRuleCategory } from '../rules/index.js'

interface InitOptions {
  dir: string
  force: boolean
  format: 'js' | 'json'
  interactive: boolean
  minimal: boolean
  typescript: boolean
}

interface RuleInfo {
  category: string
  description: string
  id: string
  recommended: boolean
}

export default class Init extends Command {
  static override description = 'Initialize a new CodeForge configuration file'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'Create config interactively',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --interactive',
      description: 'Create config with interactive rule selection',
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
    {
      command: '<%= config.bin %> <%= command.id %> --force',
      description: 'Overwrite existing config',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --dir ./my-project',
      description: 'Create config in a specific directory',
    },
  ]

  static override flags = {
    dir: Flags.string({
      default: '.',
      description: 'Directory to create the config file in',
    }),
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
    interactive: Flags.boolean({
      char: 'i',
      default: false,
      description: 'Interactive mode with rule selection',
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
      dir: flags.dir,
      force: flags.force,
      format: flags.format as 'js' | 'json',
      interactive: flags.interactive,
      minimal: flags.minimal,
      typescript: flags.typescript,
    }

    const configDir = resolve(options.dir)
    const existingConfig = this.detectExistingConfig(configDir)

    if (existingConfig && !options.force) {
      const shouldOverwrite = await this.confirmOverwrite(existingConfig)
      if (!shouldOverwrite) {
        this.log(chalk.yellow('Configuration not created.'))
        return
      }
    }

    let selectedRules: string[] | undefined
    if (options.interactive && options.minimal === false) {
      selectedRules = await this.promptForRules()
    }

    const config = this.generateConfig(options, selectedRules)
    const configFileName = options.format === 'js' ? 'codeforge.config.js' : '.codeforgerc.json'
    const configPath = join(configDir, configFileName)

    const content =
      options.format === 'js' ? this.generateJsContent(config) : this.generateJsonContent(config)

    await fs.mkdir(dirname(configPath), { recursive: true })
    await fs.writeFile(configPath, content, 'utf8')

    this.log(chalk.green(`✓ Created ${configFileName} in ${configDir}`))
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

  private detectExistingConfig(configDir: string): null | string {
    for (const fileName of CONFIG_FILE_NAMES) {
      const filePath = join(configDir, fileName)
      if (existsSync(filePath)) {
        return filePath
      }
    }

    return null
  }

  private generateConfig(options: InitOptions, selectedRules?: string[]): CodeForgeConfig {
    const config: CodeForgeConfig = {
      files: options.typescript
        ? ['**/*.ts', '**/*.tsx']
        : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      ignore: [...DEFAULT_CONFIG.ignore!],
    }

    if (options.minimal) {
      return config
    }

    const rules: Record<string, RuleSeverity> = {}

    if (selectedRules === undefined) {
      for (const [ruleId, ruleDef] of Object.entries(allRules)) {
        if (ruleDef.meta.recommended) {
          rules[ruleId] = 'error'
        }
      }
    } else {
      for (const ruleId of selectedRules) {
        rules[ruleId] = 'error'
      }
    }

    if (Object.keys(rules).length > 0) {
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

  private getRuleInfos(): RuleInfo[] {
    return Object.entries(allRules).map(([id, def]) => ({
      category: getRuleCategory(id),
      description: def.meta.description,
      id,
      recommended: def.meta.recommended,
    }))
  }

  private async promptForRules(): Promise<string[]> {
    const rules = this.getRuleInfos()
    const categories = [...new Set(rules.map((r) => r.category))]

    this.log('')
    this.log(chalk.bold('Select rules to enable:'))
    this.log(chalk.gray('Enter rule numbers separated by commas, or "all" for recommended rules'))
    this.log(chalk.gray('Press Enter to skip (no rules selected)'))
    this.log('')

    for (const category of categories.sort()) {
      this.log(chalk.cyan(`\n[${category.toUpperCase()}]`))
      const categoryRules = rules.filter((r) => r.category === category)
      for (const rule of categoryRules) {
        const recommended = rule.recommended ? chalk.green(' (recommended)') : ''
        this.log(chalk.gray(`  ${rule.id}${recommended}`))
        this.log(chalk.gray(`    ${rule.description}`))
      }
    }

    this.log('')

    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question(chalk.bold('Enter rule IDs (comma-separated) or "all": '), (answer) => {
        rl.close()

        const input = answer.trim()

        if (input === '' || input.toLowerCase() === 'none') {
          resolve([])
          return
        }

        if (input.toLowerCase() === 'all') {
          const recommended = rules.flatMap((r) => (r.recommended ? [r.id] : []))
          resolve(recommended)
          return
        }

        const selected = input
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => s.length > 0)

        const validRules = new Set(rules.map((r) => r.id.toLowerCase()))
        const valid = selected.filter((s) => validRules.has(s))
        const invalid = selected.filter((s) => !validRules.has(s))

        if (invalid.length > 0) {
          this.log(chalk.yellow(`Unknown rules ignored: ${invalid.join(', ')}`))
        }

        resolve(valid)
      })
    })
  }
}
