import chalk from 'chalk'

import { getHeatLevel, type HeatmapResult } from './heatmap-helpers.js'

// ─── Text formatting ────────────────────────────────────

const HEAT_CHARS = ['░', '▒', '▓', '█', '█'] as const

const HEAT_COLORS: Array<(text: string) => string> = [
  (text: string) => chalk.dim(text),
  chalk.green.dim,
  chalk.green,
  chalk.green.bold,
  chalk.green.bold,
]

export interface FormatOptions {
  byHour: boolean
  byAuthor: boolean
}

/**
 * Format heatmap result as colored text output.
 *
 * @example
 * const text = formatHeatmapText(result, { byHour: false, byAuthor: false })
 */
export function formatHeatmapText(result: HeatmapResult, options: FormatOptions): string {
  if (options.byHour) {
    return formatHourlyView(result)
  }

  if (options.byAuthor) {
    return formatAuthorView(result)
  }

  return formatDailyView(result)
}

function formatDailyView(result: HeatmapResult): string {
  const lines: string[] = []

  lines.push(chalk.bold('Commit Activity Heatmap'))
  lines.push(
    chalk.dim(
      `${result.startDate} → ${result.endDate}  (${result.period})`,
    ),
  )
  lines.push('')

  if (result.days.length === 0) {
    lines.push(chalk.dim('No commits found in this period.'))
    return lines.join('\n')
  }

  const maxCommits = Math.max(
    ...Array.from(result.days).map((d) => d.commits),
    1,
  )

  // Build weeks: columns are weeks, rows are days of week (Mon–Sun)
  const firstDate = new Date(result.days[0]!.date + 'T00:00:00Z')
  let startOffset = firstDate.getUTCDay()
  // Shift so Monday = 0
  startOffset = startOffset === 0 ? 6 : startOffset - 1

  const grid: Array<Array<{ commits: number; date: string } | null>> = []
  let currentWeek: Array<{ commits: number; date: string } | null> = []

  // Fill leading empty cells
  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(null)
  }

  const dayLookup = new Map<string, number>()
  for (const day of result.days) {
    dayLookup.set(day.date, day.commits)
  }

  let iterDate = new Date(firstDate)
  const endDate = new Date(result.endDate + 'T00:00:00Z')

  while (iterDate <= endDate) {
    const dateStr = iterDate.toISOString().split('T')[0] ?? ''
    const commits = dayLookup.get(dateStr)
    currentWeek.push({
      commits: commits ?? 0,
      date: dateStr,
    })

    const dayOfWeek = iterDate.getUTCDay()
    if (dayOfWeek === 0) {
      grid.push(currentWeek)
      currentWeek = []
    }

    iterDate.setUTCDate(iterDate.getUTCDate() + 1)
  }

  // Fill trailing empty cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    grid.push(currentWeek)
  }

  // Day labels (Mon=0 ... Sun=6)
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Print grid rows
  for (let row = 0; row < 7; row++) {
    const label = dayLabels[row]
    let rowStr = `${label} `

    for (const week of grid) {
      const cell = week[row]
      if (cell === null) {
        rowStr += '  '
      } else {
        const level = getHeatLevel(cell?.commits ?? 0, maxCommits)
        const char = HEAT_CHARS[level]!
        const coloredChar = HEAT_COLORS[level]!(char)
        rowStr += coloredChar
      }
      rowStr += ' '
    }

    lines.push(rowStr.trimEnd())
  }

  lines.push('')

  // Month labels
  const monthLabels = buildMonthLabels(grid)
  lines.push(`    ${monthLabels}`)

  lines.push('')

  // Legend
  const legendParts = [
    'Less',
    HEAT_COLORS[0]!(HEAT_CHARS[0]!),
    (HEAT_COLORS[1] ?? ((_t: string) => ''))(HEAT_CHARS[1] ?? ''),
    HEAT_COLORS[2]!(HEAT_CHARS[2]!),
    HEAT_COLORS[4]!(HEAT_CHARS[4]!),
    'More',
  ]
  lines.push(`    ${legendParts.join(' ')}`)

  lines.push('')

  // Summary
  const totalDays = result.days.length
  const avgPerDay = totalDays > 0 ? (result.totalCommits / totalDays).toFixed(1) : '0'
  const mostActive = findMostActiveDay(result)

  lines.push(chalk.bold('Summary'))
  lines.push(chalk.dim(`  Total commits: ${result.totalCommits}`))
  lines.push(chalk.dim(`  Active days: ${totalDays}`))
  lines.push(chalk.dim(`  Average per day: ${avgPerDay}`))
  if (mostActive) {
    lines.push(
      chalk.dim(
        `  Most active day: ${mostActive.date} (${mostActive.commits} commits)`,
      ),
    )
  }

  return lines.join('\n')
}

function buildMonthLabels(
  grid: Array<Array<{ commits: number; date: string } | null>>,
): string {
  const MONTH_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  const parts: string[] = []
  let lastMonth = -1

  for (let col = 0; col < grid.length; col++) {
    const week = grid[col]!
    // Find first non-null cell in this week
    let month = -1
    for (const cell of week) {
      if (cell !== null) {
        const d = new Date(cell.date + 'T00:00:00Z')
        month = d.getUTCMonth()
        break
      }
    }

    if (month !== -1 && month !== lastMonth) {
      parts.push(MONTH_SHORT[month]!)
      lastMonth = month
    } else {
      parts.push('   ')
    }
  }

  return parts.join(' ')
}

function findMostActiveDay(
  result: HeatmapResult,
): { commits: number; date: string } | null {
  let best: { commits: number; date: string } | null = null

  for (const day of result.days) {
    if (best === null || day.commits > best.commits) {
      best = { commits: day.commits, date: day.date }
    }
  }

  return best
}

function formatHourlyView(result: HeatmapResult): string {
  const lines: string[] = []

  lines.push(chalk.bold('Hourly Commit Distribution'))
  lines.push(
    chalk.dim(
      `${result.startDate} → ${result.endDate}  (${result.period})`,
    ),
  )
  lines.push('')

  const maxCommits = Math.max(
    ...Array.from(result.hours).map((h) => h.commits),
    1,
  )
  const maxBarWidth = 30

  for (const hourData of result.hours) {
    const label = String(hourData.hour).padStart(2, '0') + ':00'
    const barWidth =
      hourData.commits > 0
        ? Math.max(1, Math.round((hourData.commits / maxCommits) * maxBarWidth))
        : 0
    const bar = '█'.repeat(barWidth)
    const level = getHeatLevel(hourData.commits, maxCommits)
    const coloredBar =
      hourData.commits > 0 ? HEAT_COLORS[level]!(bar) : chalk.dim('')
    const count = chalk.dim(String(hourData.commits).padStart(4))

    lines.push(`  ${label} ${coloredBar} ${count}`)
  }

  lines.push('')

  const totalHours = result.hours.reduce((sum, h) => sum + (h.commits > 0 ? 1 : 0), 0)
  const peakHour = result.hours.reduce(
    (best, h) => (h.commits > best.commits ? h : best),
    { commits: 0, hour: 0 },
  )

  lines.push(chalk.bold('Summary'))
  lines.push(chalk.dim(`  Total commits: ${result.totalCommits}`))
  lines.push(chalk.dim(`  Active hours: ${totalHours}/24`))
  if (peakHour.commits > 0) {
    lines.push(
      chalk.dim(
        `  Peak hour: ${String(peakHour.hour).padStart(2, '0')}:00 (${peakHour.commits} commits)`,
      ),
    )
  }

  return lines.join('\n')
}

function formatAuthorView(result: HeatmapResult): string {
  const lines: string[] = []

  lines.push(chalk.bold('Commit Activity by Author'))
  lines.push(
    chalk.dim(
      `${result.startDate} → ${result.endDate}  (${result.period})`,
    ),
  )
  lines.push('')

  if (result.authors.length === 0) {
    lines.push(chalk.dim('No commits found in this period.'))
    return lines.join('\n')
  }


  for (const authorData of result.authors) {
    const percentage =
      result.totalCommits > 0
        ? ((authorData.commits / result.totalCommits) * 100).toFixed(1)
        : '0.0'
    const name = chalk.bold(authorData.author)
    const count = chalk.green(`${authorData.commits} commits`)
    const pct = chalk.dim(`(${percentage}%)`)
    const range = chalk.dim(
      `${authorData.firstCommit} → ${authorData.lastCommit}`,
    )

    lines.push(`  ${name}`)
    lines.push(`    ${count} ${pct}`)
    lines.push(`    ${range}`)
    lines.push('')
  }

  lines.push(chalk.bold('Summary'))
  lines.push(chalk.dim(`  Total commits: ${result.totalCommits}`))
  lines.push(chalk.dim(`  Contributors: ${result.authors.length}`))

  return lines.join('\n')
}

// ─── JSON formatting ────────────────────────────────────

/**
 * Format heatmap result as pretty-printed JSON.
 *
 * @example
 * const json = formatHeatmapJson(result)
 */
export function formatHeatmapJson(result: HeatmapResult): string {
  const serializable = {
    ...result,
    days: Array.from(result.days).map((d) => ({
      ...d,
      authors: Object.fromEntries(d.authors),
    })),
  }
  return JSON.stringify(serializable, null, 2)
}
