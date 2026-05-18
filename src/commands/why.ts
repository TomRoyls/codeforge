/**
 * Why command - explains why a specific rule violation occurs.
 *
 * Provides detailed explanations for specific CodeForge rules, including
 * common violations, how to fix them, and best practices.
 *
 * Features:
 * - Rule descriptions and examples
 * - Common violation patterns
 * - Fix recommendations
 * - Best practice guidelines
 *
 * @example
 * ```bash
 * codeforge why max-params
 * codeforge why no-console
 * ```
 */
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getRuleCategory } from '../rules/categories.js'
import { ALL_RULE_IDS, lazyRuleLoader } from '../rules/lazy-loader.js'
import { findClosestMatches } from '../utils/string-similarity.js'
import {
  analyzeViolation,
  formatBestPractices,
  formatCommonViolations,
  formatFixes,
} from './why-helpers.js'

export default class Why extends Command {
  static override args = {
    ruleId: Args.string({
      description: 'Rule ID to explain',
      required: true,
    }),
  }

  static override description = 'Explain why a specific rule violation occurs and how to fix it'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> max-params',
      description: 'Explain the max-params rule',
    },
    {
      command: '<%= config.bin %> <%= command.id %> no-console',
      description: 'Explain the no-console rule',
    },
  ]

  static override flags = {
    violation: Flags.string({
      char: 'v',
      description: 'Specific violation message to explain',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Why)

    const ruleId = args.ruleId as string
    const loadedRules = await lazyRuleLoader.loadRules([ruleId])
    const rule = loadedRules[ruleId]
    const ruleMeta = rule?.meta

    if (!ruleMeta) {
      const suggestions = findClosestMatches(ruleId, ALL_RULE_IDS, { limit: 3, minScore: 0.4 })
      let message = `Rule '${ruleId}' not found. Run '${this.config.bin} rules' to see available rules.`
      if (suggestions.length > 0) {
        const matches = suggestions.map((s) => s.candidate).join(', ')
        message += `\nDid you mean: ${matches}?`
      }
      this.error(message)
    }

    this.log('')
    this.log(chalk.bold(`Rule: ${chalk.cyan(ruleId)}`))
    this.log(chalk.gray(`Category: ${getRuleCategory(ruleId)}`))
    this.log('')

    if (ruleMeta.description) {
      this.log(chalk.bold('Description:'))
      this.log(`  ${ruleMeta.description}`)
      this.log('')
    }

    this.log(chalk.bold('Common violations:'))
    formatCommonViolations(ruleId, (msg) => this.log(msg))
    this.log('')

    this.log(chalk.bold('How to fix:'))
    formatFixes(ruleId, (msg) => this.log(msg))
    this.log('')

    if (flags.violation) {
      this.log(chalk.bold('Your specific violation:'))
      this.log(`  "${flags.violation}"`)
      this.log('')
      const suggestions = analyzeViolation(ruleId, flags.violation)
      for (const suggestion of suggestions) {
        this.log(`  • ${suggestion}`)
      }
    }

    this.log(chalk.bold('Best practices:'))
    formatBestPractices(ruleId, (msg) => this.log(msg))
    this.log('')

    this.log(
      chalk.gray('Run ') +
        chalk.cyan(`${this.config.bin} explain ${ruleId}`) +
        chalk.gray(' for more details.'),
    )
  }
}
