import chalk from 'chalk'

import type { DebtCategory, DebtItem, DebtScore, RepaymentAction } from './techdebt-helpers.js'

// ─── Utility ──────────────────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

// ─── Debt meter ───────────────────────────────────────────

/**
 * Render an ASCII debt meter bar.
 *
 * @example
 * ```ts
 * formatDebtMeter(25) // mostly green bar
 * formatDebtMeter(80) // mostly red bar
 * ```
 */
export function formatDebtMeter(score: number): string {
  const barWidth = 30
  const filled = Math.round((score / 100) * barWidth)
  const empty = barWidth - filled

  let color: (s: string) => string
  if (score <= 20) color = chalk.green
  else if (score <= 35) color = chalk.green
  else if (score <= 55) color = chalk.yellow
    else if (score <= 75) color = chalk.rgb(255, 165, 0)
  else color = chalk.red

  const filledBar = '█'.repeat(filled)
  const emptyBar = '░'.repeat(empty)

  return `${chalk.red(filledBar)}${chalk.dim(emptyBar)} ${score}/100`
}

// ─── Grade formatting ─────────────────────────────────────

/**
 * Format the grade letter with color.
 *
 * @example
 * ```ts
 * formatGrade('A') // green
 * formatGrade('F') // red
 * ```
 */
export function formatGrade(grade: string): string {
  switch (grade) {
    case 'A':
      return chalk.bold.green('A')
    case 'B':
      return chalk.green('B')
    case 'C':
      return chalk.yellow('C')
    case 'D':
      return chalk.rgb(255, 165, 0)('D')
    case 'F':
      return chalk.bold.red('F')
    default:
      return grade
  }
}

// ─── Category formatting ──────────────────────────────────

/**
 * Format a single category score as a labeled bar.
 *
 * @example
 * ```ts
 * formatCategoryScore('complexity', 45) // colored mini bar
 * ```
 */
export function formatCategoryScore(name: string, score: number): string {
  const barWidth = 15
  const filled = Math.round((score / 100) * barWidth)

  let color: (s: string) => string
  if (score <= 20) color = chalk.green
  else if (score <= 35) color = chalk.green
  else if (score <= 55) color = chalk.yellow
  else color = chalk.red

  const bar = color('█'.repeat(filled) + '░'.repeat(barWidth - filled))
  return `${padRight(name, 15)} ${bar} ${color(String(score))}`
}

// ─── Priority formatting ──────────────────────────────────

function formatPriority(priority: string): string {
  switch (priority) {
    case 'high':
      return chalk.red('high')
    case 'medium':
      return chalk.yellow('medium')
    case 'low':
      return chalk.dim('low')
    default:
      return priority
  }
}

// ─── Table formatting ─────────────────────────────────────

/**
 * Format a complete DebtScore as a rich table report.
 *
 * @example
 * ```ts
 * const output = formatDebtTable(score, false)
 * console.log(output)
 * ```
 */
export function formatDebtTable(score: DebtScore, verbose: boolean): string {
  const lines: string[] = [chalk.bold('\n🔥 Technical Debt Report'), '']

  // ─── Overall score
  lines.push(chalk.bold('Overall Debt Score: ') + formatDebtMeter(score.total))
  lines.push(chalk.bold('Grade: ') + formatGrade(score.grade))
  lines.push(
    `Total items: ${score.totalItems} | Estimated effort: ${score.estimatedEffort}h`,
  )
  lines.push('')

  // ─── Category breakdown
  lines.push(chalk.bold('Category Breakdown:'))
  lines.push('')
  for (const cat of score.categories) {
    lines.push(`  ${formatCategoryScore(cat.name, cat.score)} (${chalk.dim(`w:${cat.weight}`)}) [${cat.items.length} items]`)
  }
  lines.push('')

  // ─── Repayment plan
  if (score.repaymentPlan.length > 0) {
    lines.push(chalk.bold('Repayment Plan:'))
    lines.push('')

    const colPriority = 8
    const colCategory = 15
    const colAction = 45
    const colEffort = 8
    const colImpact = 8

    lines.push(
      chalk.cyan(padLeft('Priority', colPriority)) +
        '  ' +
        chalk.cyan(padRight('Category', colCategory)) +
        '  ' +
        chalk.cyan(padRight('Action', colAction)) +
        '  ' +
        chalk.cyan(padLeft('Effort', colEffort)) +
        '  ' +
        chalk.cyan(padLeft('Impact', colImpact)),
    )
    lines.push(chalk.dim('─'.repeat(colPriority + colCategory + colAction + colEffort + colImpact + 8)))

    for (const action of score.repaymentPlan) {
      lines.push(
        padLeft(formatPriority(action.priority), colPriority) +
          '  ' +
          padRight(action.category, colCategory) +
          '  ' +
          padRight(action.action, colAction) +
          '  ' +
          padLeft(`${action.effort}h`, colEffort) +
          '  ' +
          padLeft(action.impact, colImpact),
      )
    }
    lines.push('')
  }

  // ─── Verbose: show all items per category
  if (verbose) {
    for (const cat of score.categories) {
      if (cat.items.length === 0) continue
      lines.push(chalk.bold(`[${cat.name}] ${cat.description}`))
      lines.push('')

      for (const item of cat.items) {
        const loc = item.line > 0 ? `:${item.line}` : ''
        lines.push(
          `  ${formatPriority(item.priority)} ${chalk.cyan(`${item.file}${loc}`)} — ${item.description} ${chalk.dim(`(${item.effort}h)`)}`,
        )
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

// ─── JSON formatting ──────────────────────────────────────

/**
 * Format a DebtScore as JSON.
 *
 * @example
 * ```ts
 * const json = formatDebtJson(score)
 * console.log(json)
 * ```
 */
export function formatDebtJson(score: DebtScore): string {
  return JSON.stringify(score, null, 2)
}
