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

import { getRuleCategory } from '../rules/categories.js'
import { lazyRuleLoader } from '../rules/lazy-loader.js'
import {
  type OutputFormat,
  filterRules,
  formatTable,
  mapRulesToInfo,
} from './rules-helpers.js'

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

    const allRules = await lazyRuleLoader.loadAllRules()
    let rules = mapRulesToInfo(allRules, getRuleCategory)

    rules = filterRules(rules, {
      category: flags.category,
      fixable: flags.fixable || undefined,
      search: flags.search,
      severity: flags.severity,
    })

    const format = flags.format as OutputFormat

    if (format === 'json') {
      this.log(JSON.stringify(rules, null, 2))
    } else {
      formatTable(rules, (msg) => this.log(msg))
    }
  }

  async getRules(): Promise<Array<{
    category: string
    description: string
    fixable: boolean
    name: string
    recommended: boolean
    severity: string
  }>> {
    const allRules = await lazyRuleLoader.loadAllRules()
    return mapRulesToInfo(allRules, getRuleCategory)
  }
}
