/**
 * Rules command - lists all available CodeForge rules.
 *
 * Displays information about all available CodeForge rules, including categories,
 * descriptions, fixable status, and recommendations.
 *
 * Features:
 * - Table or JSON output formats
 * - Category filtering
 * - Fixable-only filtering
 * - Keyword search in descriptions
 * - Recommended rule highlighting
 *
 * @example
 * ```bash
 * codeforge rules
 * codeforge rules --category complexity
 * codeforge rules --fixable
 * codeforge rules --search async
 * ```
 */
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'

function colorizeSeverity(sev: string): string {
  if (sev === 'error') return chalk.red(sev)
  if (sev === 'warning') return chalk.yellow(sev)
  if (sev === 'info') return chalk.blue(sev)
  return sev
}

type OutputFormat = 'json' | 'table'

interface RuleInfo {
  category: string
  description: string
  fixable: boolean
  name: string
  recommended: boolean
  severity: string
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
      description: 'Filter rules by category',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --search async',
      description: 'Search rules by keyword in description',
    },
    {
      command: '<%= config.bin %> <%= command.id %> --severity error',
      description: 'Show only error-level rules',
    },
  ]

  static override flags = {
    category: Flags.string({
      char: 'c',
      description: 'Filter rules by category',
      options: [
        'complexity',
        'correctness',
        'dependencies',
        'patterns',
        'performance',
        'security',
        'style',
        'testing',
      ],
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
    search: Flags.string({
      char: 's',
      description: 'Search rules by keyword in description',
    }),
    severity: Flags.string({
      description: 'Filter rules by severity level',
      options: ['error', 'warning', 'info'],
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Rules)

    let rules = await this.getRules()

    if (flags.category) {
      rules = rules.filter((r) => r.category === flags.category)
    }

    if (flags.fixable) {
      rules = rules.filter((r) => r.fixable)
    }

    if (flags.search) {
      const searchLower = flags.search.toLowerCase()
      rules = rules.filter((r) => r.description.toLowerCase().includes(searchLower))
    }

    if (flags.severity) {
      rules = rules.filter((r) => r.severity === flags.severity)
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
    const severityWidth = 9
    const fixableWidth = 8

    const separator = '─'.repeat(
      nameWidth + categoryWidth + severityWidth + descWidth + fixableWidth + 16,
    )
    this.log(chalk.gray(`\u250C${separator}\u2510`))
    this.log(
      chalk.gray('\u2502') +
        chalk.bold(' Rule'.padEnd(nameWidth + 1)) +
        chalk.gray('\u2502') +
        chalk.bold(' Category'.padEnd(categoryWidth + 1)) +
        chalk.gray('\u2502') +
        chalk.bold(' Severity'.padEnd(severityWidth + 1)) +
        chalk.gray('\u2502') +
        chalk.bold(' Description'.padEnd(descWidth + 1)) +
        chalk.gray('\u2502') +
        chalk.bold(' Fixable') +
        chalk.gray(' \u2502'),
    )
    this.log(chalk.gray(`\u251C${separator}\u2510`))

    for (const rule of rules) {
      const fixable = rule.fixable ? chalk.green('\u2713') : chalk.gray('\u2717')
      const recommended = rule.recommended ? chalk.cyan('\u2605') : ' '
      const sev = colorizeSeverity(rule.severity)
      const desc =
        rule.description.length > descWidth - 2
          ? rule.description.slice(0, descWidth - 5) + '...'
          : rule.description

      this.log(
        chalk.gray('\u2502') +
          ` ${recommended}${rule.name}`.slice(0, nameWidth).padEnd(nameWidth + 1) +
          chalk.gray('\u2502') +
          ` ${rule.category}`.padEnd(categoryWidth + 1) +
          chalk.gray('\u2502') +
          ` ${sev}`.padEnd(severityWidth + 1) +
          chalk.gray('\u2502') +
          ` ${desc}`.padEnd(descWidth + 1) +
          chalk.gray('\u2502') +
          ` ${fixable}    ` +
          chalk.gray(' \u2502'),
      )
    }

    this.log(chalk.gray(`\u2514${separator}\u2518`))
    this.log('')
    this.log(chalk.gray(`Total: ${rules.length} rules`))
    this.log(chalk.gray(`★ = recommended, ✓ = fixable`))
  }

  private async getRules(): Promise<RuleInfo[]> {
    const rules: RuleInfo[] = []
    const allRules = await lazyRuleLoader.loadAllRules()

    for (const [ruleId, ruleDef] of Object.entries(allRules)) {
      const isFixable = Boolean(ruleDef.fix || ruleDef.meta.fixable)
      rules.push({
        category: ruleDef.meta.category ?? getRuleCategory(ruleId),
        description: ruleDef.meta.description,
        fixable: isFixable,
        name: ruleId,
        recommended: ruleDef.meta.recommended ?? false,
        severity: ruleDef.meta.severity ?? 'info',
      })
    }

    return rules.sort((a, b) => a.name.localeCompare(b.name))
  }
}
