import chalk from 'chalk'

import type { RuleMeta } from '../rules/types.js'

import { RULE_CATEGORIES } from '../rules/rule-category-registry.js'
import { bestPracticesMap } from './explain-data-best-practices.js'
import { examplesMap, type RuleExample } from './explain-data-examples.js'
import { relatedRulesMap } from './explain-data-related.js'

const defaultBestPractices: string[] = [
  'Follow the rule consistently throughout your codebase',
  'Enable auto-fix when available to automatically correct violations',
  'Review violations to understand the underlying issues',
  'Consider the rule in the context of your specific use case',
]

export function getBestPractices(ruleId: string): string[] {
  return bestPracticesMap[ruleId] ?? [...defaultBestPractices]
}

export function getExamples(ruleId: string): null | RuleExample[] {
  return examplesMap[ruleId] ?? null
}

export function getRelatedRules(ruleId: string, category: string): string[] {
  if (relatedRulesMap[ruleId]) {
    return relatedRulesMap[ruleId]
  }

  return Object.entries(RULE_CATEGORIES)
    .filter(([id, cat]) => cat === category && id !== ruleId)
    .map(([id]) => id)
    .slice(0, 5)
}

export function formatHeader(ruleId: string, category: string): string {
  const title = chalk.bold.white(ruleId)
  const categoryBadge = chalk.cyan(`[${category}]`)

  return [
    '',
    `${title} ${categoryBadge}`,
    chalk.gray('─'.repeat(ruleId.length + category.length + 3)),
    '',
  ].join('\n')
}

export function formatDescription(meta: RuleMeta): string {
  const description = meta.docs?.description ?? meta.description ?? 'No description available'
  return [chalk.bold('Description'), description, ''].join('\n')
}

export function formatSeverity(meta: RuleMeta): string {
  const severity = meta.severity ?? meta.docs?.severity ?? 'error'
  let severityText: string

  switch (severity) {
    case 'error': {
      severityText = chalk.red('Error')
      break
    }

    case 'info': {
      severityText = chalk.blue('Info')
      break
    }

    case 'warning': {
      severityText = chalk.yellow('Warning')
      break
    }

    default: {
      severityText = chalk.gray(severity)
    }
  }

  return [chalk.bold('Severity'), severityText, ''].join('\n')
}

export function formatFixable(meta: RuleMeta): string {
  const fixable = meta.fixable ?? meta.docs?.fixable ?? false
  const fixableText = fixable ? chalk.green('Yes') : chalk.gray('No')
  return [chalk.bold('Auto-fixable'), fixableText, ''].join('\n')
}

export function formatMetadata(meta: RuleMeta): string {
  const recommended = meta.docs?.recommended ?? meta.recommended ?? false
  const recommendedText = recommended ? chalk.cyan('Yes') : chalk.gray('No')
  return [chalk.bold('Recommended'), recommendedText, ''].join('\n')
}

export function formatExamples(examples: RuleExample[]): string {
  const lines: string[] = [chalk.bold('Examples')]

  for (const example of examples) {
    lines.push(
      '',
      chalk.yellow(example.description),
      '',
      chalk.red('❌ Bad'),
      chalk.gray(example.bad),
      '',
      chalk.green('✅ Good'),
      chalk.gray(example.good),
      '',
    )
  }

  return lines.join('\n')
}

export function formatBestPractices(practices: string[]): string {
  const lines: string[] = [chalk.bold('Best Practices')]
  for (const practice of practices) {
    lines.push(`• ${practice}`)
  }

  lines.push('')
  return lines.join('\n')
}

export function formatRelatedRules(rules: string[]): string {
  if (rules.length === 0) return ''

  const lines: string[] = [chalk.bold('Related Rules')]
  for (const relatedRule of rules) {
    lines.push(`• ${chalk.cyan(relatedRule)}`)
  }

  lines.push('')
  return lines.join('\n')
}

export function formatUrl(meta: RuleMeta): string {
  const url = meta.docs?.url
  if (!url) return ''

  return [chalk.bold('Documentation'), chalk.underline(url), ''].join('\n')
}

// eslint-disable-next-line max-params
export function displayExplainOutput(
  ruleId: string,
  category: string,
  meta: RuleMeta,
  examples: null | RuleExample[],
  practices: string[],
  relatedRules: string[],
  logFn: (msg: string) => void,
): void {
  logFn(formatHeader(ruleId, category))
  logFn(formatDescription(meta))
  logFn(formatSeverity(meta))
  logFn(formatFixable(meta))
  logFn(formatMetadata(meta))

  if (examples) {
    logFn(formatExamples(examples))
  }

  logFn(formatBestPractices(practices))

  const relatedOutput = formatRelatedRules(relatedRules)
  if (relatedOutput) {
    logFn(relatedOutput)
  }

  const urlOutput = formatUrl(meta)
  if (urlOutput) {
    logFn(urlOutput)
  }
}

export { bestPracticesMap } from './explain-data-best-practices.js'
export { examplesMap, type RuleExample } from './explain-data-examples.js'
export { relatedRulesMap } from './explain-data-related.js'
