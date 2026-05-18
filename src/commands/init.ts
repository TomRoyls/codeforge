import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import { existsSync } from 'node:fs'
import * as fs from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import readline from 'node:readline'

import type { CodeForgeConfig } from '../config/types.js'

import { CONFIG_FILE_NAMES } from '../config/types.js'
import { getProfileConfig, type SeverityProfile } from '../profiles/index.js'
import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import { findClosestMatches } from '../utils/string-similarity.js'
import {
  detectExistingConfig as detectExistingConfigHelper,
  displayConfigSummary,
  filterValidRules,
  generateConfig as generateConfigHelper,
  generateJsContent as generateJsContentHelper,
  generateJsonContent as generateJsonContentHelper,
  getRuleInfos as getRuleInfosHelper,
  resolveConfigFileName,
  type RuleInfo,
} from './init-helpers.js'
import {
  formatProfileOptions,
  getProfileOptionsFromConfigs,
  type WizardRuleInfo,
} from './init-wizard-helpers.js'

interface InitOptions {
  dir: string
  force: boolean
  format: 'js' | 'json'
  interactive: boolean
  minimal: boolean
  profile: SeverityProfile | undefined
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
      command: '<%= config.bin %> <%= command.id %> --profile strict',
      description: 'Create config with strict severity profile',
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
    profile: Flags.string({
      char: 'p',
      default: undefined,
      description: 'Severity profile for rule configuration',
      options: ['lenient', 'moderate', 'strict'],
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
      profile: flags.profile as SeverityProfile | undefined,
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
      if (!options.profile) {
        const profileChoice = await this.promptForProfile()
        if (profileChoice) {
          options.profile = profileChoice
        } else {
          selectedRules = await this.promptForRules()
        }
      }
    }

    const config = await this.generateConfig(options, selectedRules)
    const configFileName = resolveConfigFileName(options.format)
    const configPath = join(configDir, configFileName)

    const content =
      options.format === 'js' ? this.generateJsContent(config) : this.generateJsonContent(config)

    try {
      await fs.mkdir(dirname(configPath), { recursive: true })
      await fs.writeFile(configPath, content, 'utf8')
    } catch (error) {
      this.error(
        `Failed to create config file at ${configPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    displayConfigSummary(config, configFileName, configDir, (msg) => this.log(msg))
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
    return detectExistingConfigHelper(configDir, CONFIG_FILE_NAMES, existsSync)
  }

  private async generateConfig(
    options: InitOptions,
    selectedRules?: string[],
  ): Promise<CodeForgeConfig> {
    const allRules = await lazyRuleLoader.loadAllRules()
    return generateConfigHelper(
      options,
      allRules,
      selectedRules,
      getRuleCategory,
      (msg) => this.log(msg),
    )
  }

  private generateJsContent(config: CodeForgeConfig): string {
    return generateJsContentHelper(config)
  }

  private generateJsonContent(config: CodeForgeConfig): string {
    return generateJsonContentHelper(config)
  }

  private async getRuleInfos(): Promise<RuleInfo[]> {
    const allRules = await lazyRuleLoader.loadAllRules()
    return getRuleInfosHelper(allRules, getRuleCategory)
  }

  private async promptForRules(): Promise<string[]> {
    const rules = await this.getRuleInfos()
    const categories = [...new Set(rules.map((r) => r.category))]

    this.log('')
    this.log(chalk.bold('Select rules to enable:'))
    this.log(
      chalk.gray('Enter rule numbers separated by commas, or "all" for recommended rules'),
    )
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

        const { invalid, valid } = filterValidRules(
          input,
          rules.map((r) => r.id),
        )

        if (invalid.length > 0) {
          const allRuleIds = rules.map((r) => r.id)
          const suggestions = invalid.flatMap((inv) =>
            findClosestMatches(inv, allRuleIds, { limit: 1, minScore: 0.5 })
              .map((s) => `${inv} → ${s.candidate}`),
          )
          this.log(chalk.yellow(`Unknown rules ignored: ${invalid.join(', ')}`))
          if (suggestions.length > 0) {
            this.log(chalk.gray(`Did you mean: ${suggestions.join(', ')}?`))
          }
        }

        resolve(valid)
      })
    })
  }

  private async promptForProfile(): Promise<SeverityProfile | undefined> {
    const allRules = await lazyRuleLoader.loadAllRules()
    const ruleInfos = getRuleInfosHelper(allRules, getRuleCategory)

    const wizardRules: WizardRuleInfo[] = ruleInfos.map((r) => ({
      category: r.category,
      description: r.description,
      fixable: false,
      id: r.id,
      recommended: r.recommended,
    }))

    const recommendedIds = new Set(wizardRules.filter((r) => r.recommended).map((r) => r.id))
    const isRecommended = (id: string) => recommendedIds.has(id)

    const profileConfigs = {
      lenient: getProfileConfig('lenient', allRules, getRuleCategory, isRecommended),
      moderate: getProfileConfig('moderate', allRules, getRuleCategory, isRecommended),
      strict: getProfileConfig('strict', allRules, getRuleCategory, isRecommended),
    }

    const profileOptions = getProfileOptionsFromConfigs(profileConfigs)
    const formattedLines = formatProfileOptions(profileOptions)

    this.log('')
    this.log(chalk.bold('Choose a severity profile:'))
    for (const line of formattedLines) {
      this.log(chalk.gray(line))
    }
    this.log('')

    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question(
        chalk.bold('Enter profile name (lenient/moderate/strict/custom): '),
        (answer) => {
          rl.close()
          const input = answer.trim().toLowerCase()
          if (input === 'lenient' || input === 'moderate' || input === 'strict') {
            resolve(input as SeverityProfile)
          } else {
            resolve(undefined)
          }
        },
      )
    })
  }
}
