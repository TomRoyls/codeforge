/**
 * Explain command - explains a specific rule in detail.
 *
 * Provides comprehensive documentation for individual CodeForge rules including
 * descriptions, severity, fixable status, examples, and related rules.
 *
 * Features:
 * - Rule metadata display (severity, category, recommended status)
 * - Code examples (good and bad patterns)
 * - Best practice guidelines
 * - Related rule suggestions
 * - Links to detailed documentation
 *
 * @example
 * ```bash
 * codeforge explain no-eval
 * codeforge explain prefer-const
 * ```
 */
import { Args, Command } from '@oclif/core'

import { getRuleCategory } from '../rules/categories.js'
import { ALL_RULE_IDS, lazyRuleLoader } from '../rules/lazy-loader.js'
import { findClosestMatches } from '../utils/string-similarity.js'
import {
  displayExplainOutput,
  getBestPractices,
  getExamples,
  getRelatedRules,
} from './explain-helpers.js'

export default class Explain extends Command {
  static override args = {
    'rule-id': Args.string({
      description: 'The ID of the rule to explain',
      name: 'rule-id',
      required: true,
    }),
  }

  static override description = 'Explain a specific rule in detail'

  static override examples = [
    {
      command: '<%= config.bin %> <%= command.id %> no-eval',
      description: 'Explain the no-eval rule',
    },
    {
      command: '<%= config.bin %> <%= command.id %> prefer-const',
      description: 'Explain the prefer-const rule',
    },
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Explain)
    const ruleId = args['rule-id']

    const loadedRules = await lazyRuleLoader.loadRules([ruleId])
    const rule = loadedRules[ruleId]

    if (!rule) {
      const suggestions = findClosestMatches(ruleId, ALL_RULE_IDS, { limit: 3, minScore: 0.4 })
      let message = `Rule '${ruleId}' not found. Run '${this.config.bin} rules' to see available rules.`
      if (suggestions.length > 0) {
        const matches = suggestions.map((s) => s.candidate).join(', ')
        message += `\nDid you mean: ${matches}?`
      }
      this.error(message)
    }

    const category = rule.meta.category ?? getRuleCategory(ruleId)
    const examples = getExamples(ruleId)
    const practices = getBestPractices(ruleId)
    const relatedRules = getRelatedRules(ruleId, category)

    displayExplainOutput(ruleId, category, rule.meta, examples, practices, relatedRules, (msg) =>
      this.log(msg),
    )
  }
}
