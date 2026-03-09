import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { allRules, getRuleCategory } from '../rules/index.js'

type OutputFormat = 'json' | 'table'

interface RuleInfo {
  category: string
  description: string
  fixable: boolean
  name: string
  recommended: boolean
}

export default class Rules extends Command {
  static override description = 'List all available rules'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %>',
      description: 'List all available rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --format json',
      description: 'Output rules as JSON',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --category complexity',
      description: 'Show only complexity rules',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --fixable',
      description: 'Show only fixable rules',
    },
  ]

  static override flags = {
    category: Flags.string({
      char: 'c',
      description: 'Filter rules by category',
      options: ['complexity', 'dependencies', 'performance', 'security', 'patterns'],
    }),
    fixable: Flags.boolean({
      default: false,
      description: 'Show only rules that can automatically fix issues',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['json', 'table'],
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Rules)

    let rules = this.getRules()

    if (flags.category) {
      rules = rules.filter((r) => r.category === flags.category)
    }

    if (flags.fixable) {
      rules = rules.filter((r) => r.fixable)
    }

    const format = flags.format as OutputFormat

    if (format === 'json') {
      this.log(JSON.stringify(rules, null, 2))
    } else {
      this.formatTable(rules)
    }
  }

  private formatTable(rules: RuleInfo[]): void {
    const nameWidth = Math.max(25, ...rules.map((r) => r.name.length))
    const categoryWidth = Math.max(12, ...rules.map((r) => r.category.length))
    const descWidth = Math.min(60, Math.max(20, ...rules.map((r) => r.description.length)))
    const fixableWidth = 8

    const separator = '─'.repeat(nameWidth + categoryWidth + descWidth + fixableWidth + 13)
    this.log(chalk.gray(`┌${separator}┐`))
    this.log(
      chalk.gray('│') +
        chalk.bold(' Rule'.padEnd(nameWidth + 1)) +
        chalk.gray('│') +
        chalk.bold(' Category'.padEnd(categoryWidth + 1)) +
        chalk.gray('│') +
        chalk.bold(' Description'.padEnd(descWidth + 1)) +
        chalk.gray('│') +
        chalk.bold(' Fixable') +
        chalk.gray(' │'),
    )
    this.log(chalk.gray(`├${separator}┤`))

    for (const rule of rules) {
      const fixable = rule.fixable ? chalk.green('✓') : chalk.gray('✗')
      const recommended = rule.recommended ? chalk.cyan('★') : ' '
      const desc =
        rule.description.length > descWidth - 2
          ? rule.description.slice(0, descWidth - 5) + '...'
          : rule.description

      this.log(
        chalk.gray('│') +
          ` ${recommended}${rule.name}`.slice(0, nameWidth).padEnd(nameWidth + 1) +
          chalk.gray('│') +
          ` ${rule.category}`.padEnd(categoryWidth + 1) +
          chalk.gray('│') +
          ` ${desc}`.padEnd(descWidth + 1) +
          chalk.gray('│') +
          ` ${fixable}    ` +
          chalk.gray(' │'),
      )
    }

    this.log(chalk.gray(`└${separator}┘`))
    this.log('')
    this.log(chalk.gray(`Total: ${rules.length} rules`))
    this.log(chalk.gray(`★ = recommended, ✓ = fixable`))
  }

  private getRules(): RuleInfo[] {
    const rules: RuleInfo[] = []

    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      const isFixable = Boolean(ruleDef.fix || ruleDef.meta.fixable)
      rules.push({
        category: ruleDef.meta.category ?? getRuleCategory(ruleId),
        description: ruleDef.meta.description,
        fixable: isFixable,
        name: ruleId,
        recommended: ruleDef.meta.recommended ?? false,
      })
    }

    return rules.sort((a, b) => a.name.localeCompare(b.name))
  }
}
