import chalk from 'chalk'

import type { LearningGuide, ReadingItem } from './learning-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Helpers ────────────────────────────────────────────

function complexityStars(level: number): string {
  const filled = '★'.repeat(level)
  const empty = '☆'.repeat(5 - level)
  return chalk.yellow(filled) + chalk.dim(empty)
}

function categoryLabel(category: ReadingItem['category']): string {
  switch (category) {
    case 'entry': return chalk.green('ENTRY')
    case 'core': return chalk.cyan('CORE ')
    case 'utility': return chalk.blue('UTIL ')
    case 'type': return chalk.magenta('TYPE ')
    case 'test': return chalk.dim('TEST ')
  }
}

/**
 * Format the full learning guide as a structured text report.
 *
 * @example
 * ```ts
 * const output = formatLearningTable(guide, false)
 * output // contains Architecture, Reading Order, etc.
 * ```
 */
export function formatLearningTable(guide: LearningGuide, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n📚 Codebase Learning Guide'), '']

  lines.push(chalk.bold('Overview'))
  lines.push(guide.overview)
  lines.push('')

  lines.push(chalk.bold('Architecture'))
  lines.push(`  Data flow: ${guide.architecture.dataFlow}`)
  lines.push(`  Dependencies: ${guide.architecture.dependencies}`)
  lines.push('')

  if (guide.architecture.layers.length > 0) {
    lines.push(chalk.bold('  Layers:'))
    for (const layer of guide.architecture.layers) {
      lines.push(`    ${chalk.cyan(layer.name)} (${layer.files} files) — ${layer.path}`)
      if (verbose && layer.keyFiles.length > 0) {
        for (const kf of layer.keyFiles) {
          lines.push(chalk.dim(`      key: ${kf}`))
        }
      }
    }
    lines.push('')
  }

  lines.push(chalk.bold('Entry Points'))
  if (guide.entryPoints.length === 0) {
    lines.push(chalk.dim('  No entry points detected'))
  }
  for (const ep of guide.entryPoints) {
    lines.push(`  ${chalk.green(ep.command)} — ${ep.file}`)
    lines.push(chalk.dim(`    ${ep.description}`))
  }
  lines.push('')

  lines.push(chalk.bold('Suggested Reading Order'))
  const items = verbose ? guide.readingOrder : guide.readingOrder.slice(0, 20)
  const fileColWidth = Math.max(30, ...items.map((i) => i.file.length))
  for (const item of items) {
    const stars = complexityStars(item.complexity)
    const cat = categoryLabel(item.category)
    lines.push(`  ${cat} ${padRight(item.file, fileColWidth)} ${stars}`)
    if (verbose) {
      lines.push(chalk.dim(`    deps: ${item.dependencies}, dependents: ${item.dependents}`))
      lines.push(chalk.dim(`    ${item.reason}`))
    }
  }
  lines.push('')

  if (guide.keyPatterns.length > 0) {
    lines.push(chalk.bold('Key Patterns'))
    for (const pattern of guide.keyPatterns) {
      lines.push(`  ${chalk.yellow(pattern.name)} (${pattern.frequency} file(s))`)
      lines.push(chalk.dim(`    ${pattern.description}`))
      if (verbose) {
        lines.push(chalk.dim(`    example: ${pattern.exampleFile}`))
      }
    }
    lines.push('')
  }

  if (verbose && guide.glossary.length > 0) {
    lines.push(chalk.bold('Glossary'))
    for (const entry of guide.glossary) {
      lines.push(`  ${chalk.cyan(entry.term)} — ${entry.definition}`)
      lines.push(chalk.dim(`    defined in: ${entry.file}`))
    }
    lines.push('')
  }

  lines.push(chalk.dim(`Estimated read time: ~${guide.estimatedReadTime} minute(s)`))

  return lines.join('\n')
}

/**
 * Format the learning guide as JSON.
 *
 * @example
 * ```ts
 * const json = formatLearningJson(guide)
 * JSON.parse(json) // valid
 * ```
 */
export function formatLearningJson(guide: LearningGuide): string {
  return JSON.stringify(guide, null, 2)
}
