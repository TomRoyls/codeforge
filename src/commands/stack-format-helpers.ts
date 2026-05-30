import chalk from 'chalk'

import type { StackResult } from './stack-helpers.js'

import { padRight } from '../utils/format-utils.js'

// ─── Category colors ────────────────────────────────────

const CATEGORY_COLORS: Record<string, (text: string) => string> = {
  Build: chalk.yellow,
  'CI/CD': chalk.magenta,
  Framework: chalk.green,
  Formatting: chalk.gray,
  Infrastructure: chalk.blue,
  Language: chalk.cyan,
  Linting: chalk.gray,
  State: chalk.magenta,
  Style: chalk.hex('#e91e63'),
  Testing: chalk.hex('#ff9800'),
}

function colorizeCategory(category: string, text: string): string {
  const colorFn = CATEGORY_COLORS[category]
  if (colorFn) return colorFn(text)
  return text
}

// ─── Table formatting ───────────────────────────────────

function makePercentageBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  return chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty))
}

export function formatStackTable(result: StackResult, verbose: boolean): string {
  const { technologies, languages, projectType, packageManager } = result
  const lines: string[] = [chalk.bold('\n🔍 Technology Stack Report'), '']

  lines.push(chalk.bold('Project Type:    ') + chalk.cyan(projectType))
  if (packageManager) {
    lines.push(chalk.bold('Package Manager: ') + chalk.cyan(packageManager))
  }
  lines.push('')

  // ─── Languages section ────────────────────────────────

  if (languages.length > 0) {
    lines.push(chalk.bold('Languages:'))
    lines.push(chalk.dim('─'.repeat(50)))

    for (const lang of languages) {
      const bar = makePercentageBar(lang.percentage)
      lines.push(`  ${chalk.cyan(padRight(lang.name, 14))} ${bar} ${chalk.dim(String(lang.percentage) + '%')}`)
    }
    lines.push('')
  }

  // ─── Technologies section ─────────────────────────────

  const grouped = groupByCategory(technologies)
  const categoryOrder = ['Framework', 'Language', 'Build', 'Testing', 'Style', 'State', 'Linting', 'Formatting', 'Infrastructure', 'CI/CD']

  if (technologies.length > 0) {
    lines.push(chalk.bold('Technologies:'))
    lines.push(chalk.dim('─'.repeat(50)))

    for (const category of categoryOrder) {
      const techs = grouped.get(category)
      if (!techs || techs.length === 0) continue

      lines.push(`  ${colorizeCategory(category, category)}:`)

      for (const tech of techs) {
        const versionStr = tech.version ? chalk.dim(` (${tech.version})`) : ''
        lines.push(`    • ${colorizeCategory(category, tech.name)}${versionStr}`)

        if (verbose && tech.evidence.length > 0) {
          for (const ev of tech.evidence) {
            lines.push(chalk.dim(`      ↳ ${ev}`))
          }
        }
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

export function formatStackJson(result: StackResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Helpers ────────────────────────────────────────────

function groupByCategory(technologies: StackResult['technologies']): Map<string, StackResult['technologies']> {
  const map = new Map<string, StackResult['technologies']>()
  for (const tech of technologies) {
    const existing = map.get(tech.category)
    if (existing) {
      existing.push(tech)
    } else {
      map.set(tech.category, [tech])
    }
  }
  return map
}
