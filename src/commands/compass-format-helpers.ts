import chalk from 'chalk'
import {
  type CompassResult,
  type CompassDirection,
  type NavigationRoute,
  type CompassStats,
} from './compass-helpers.js'

// ─── Direction Formatting ─────────────────────────────────────────────────────

const DIRECTION_ICONS: Record<string, string> = {
  north: '↑',
  south: '↓',
  east: '→',
  west: '←',
  center: '◉',
}

const DIRECTION_COLORS: Record<string, (t: string) => string> = {
  north: (t) => chalk.rgb(76, 175, 80)(t),
  south: (t) => chalk.rgb(33, 150, 243)(t),
  east: (t) => chalk.rgb(255, 193, 7)(t),
  west: (t) => chalk.rgb(156, 39, 176)(t),
  center: (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Format a single direction as a card.
 *
 * @example
 * formatDirectionCard(direction)
 */
export function formatDirectionCard(dir: CompassDirection): string {
  const icon = DIRECTION_ICONS[dir.direction] ?? '•'
  const colorFn = DIRECTION_COLORS[dir.direction] ?? chalk.white
  const lines: string[] = []
  lines.push(colorFn(`  ${icon} ${dir.name} (${dir.direction})`))
  lines.push(chalk.gray(`    ${dir.description}`))
  lines.push(chalk.gray(`    Files: ${dir.fileCount} | Lines: ${dir.totalLines}`))
  if (dir.keyExports.length > 0) {
    lines.push(chalk.gray(`    Key exports: ${dir.keyExports.join(', ')}`))
  }
  for (const hint of dir.navigationHints.slice(0, 2)) {
    lines.push(chalk.dim(`    💡 ${hint}`))
  }
  return lines.join('\n')
}

// ─── Compass Rose ─────────────────────────────────────────────────────────────

/**
 * Render ASCII compass rose with direction summaries.
 *
 * @example
 * formatCompassRose(directions)
 */
export function formatCompassRose(directions: CompassDirection[]): string {
  const dirMap = new Map(directions.map((d) => [d.direction, d]))
  const n = dirMap.get('north')
  const s = dirMap.get('south')
  const e = dirMap.get('east')
  const w = dirMap.get('west')
  const c = dirMap.get('center')

  const northLabel = n ? `${n.fileCount} files` : '—'
  const southLabel = s ? `${s.fileCount} files` : '—'
  const eastLabel = e ? `${e.fileCount} files` : '—'
  const westLabel = w ? `${w.fileCount} files` : '—'
  const centerLabel = c ? c.files[0] ?? 'core' : '—'

  const lines: string[] = []
  lines.push('')
  lines.push(chalk.bold('         ╔══════════════════╗'))
  lines.push(chalk.rgb(76, 175, 80)(`         ║  ↑ North          ║`))
  lines.push(chalk.rgb(76, 175, 80)(`         ║    ${northLabel.padEnd(16)}║`))
  lines.push(chalk.bold('    ╔════╬══════════════════╬════╗'))
  lines.push(chalk.rgb(156, 39, 176)(`    ║ ← W              E → ║`) + chalk.rgb(255, 193, 7)(''))
  lines.push(chalk.rgb(156, 39, 176)(`    ║   ${westLabel.padEnd(8)}`) + chalk.rgb(255, 193, 7)(`${eastLabel.padEnd(8)}  ║`))
  lines.push(chalk.bold('    ╠════╬══════════════════╬════╣'))
  lines.push(chalk.rgb(244, 67, 54)(`    ║    ◉ Center         ║`))
  lines.push(chalk.rgb(244, 67, 54)(`    ║    ${centerLabel.padEnd(16)}║`))
  lines.push(chalk.bold('    ╚════╬══════════════════╬════╝'))
  lines.push(chalk.rgb(33, 150, 243)(`         ║  ↓ South          ║`))
  lines.push(chalk.rgb(33, 150, 243)(`         ║    ${southLabel.padEnd(16)}║`))
  lines.push(chalk.bold('         ╚══════════════════╝'))
  lines.push('')
  return lines.join('\n')
}

// ─── Route Table ──────────────────────────────────────────────────────────────

const DIFFICULTY_LABEL: Record<string, (t: string) => string> = {
  easy: (t) => chalk.rgb(76, 175, 80)(t),
  moderate: (t) => chalk.rgb(255, 193, 7)(t),
  complex: (t) => chalk.rgb(244, 67, 54)(t),
}

/**
 * Format routes as a table.
 *
 * @example
 * formatRoutesTable(routes)
 */
export function formatRoutesTable(routes: NavigationRoute[]): string {
  if (routes.length === 0) return chalk.dim('  No navigation routes found.')

  const lines: string[] = []
  lines.push(chalk.bold('  Navigation Routes:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(chalk.gray('  From                  → To                   Difficulty'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const route of routes) {
    const colorFn = DIFFICULTY_LABEL[route.difficulty] ?? chalk.white
    const from = route.from.padEnd(20)
    const to = route.to.padEnd(20)
    lines.push(`  ${from}→ ${to} ${colorFn(route.difficulty)}`)
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Onboarding Guide ─────────────────────────────────────────────────────────

/**
 * Format onboarding guide as a checklist.
 *
 * @example
 * formatOnboardingGuide(guide)
 */
export function formatOnboardingGuide(guide: string[]): string {
  if (guide.length === 0) return chalk.dim('  No onboarding steps available.')

  const lines: string[] = []
  lines.push(chalk.bold('  Onboarding Guide:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))

  for (const step of guide) {
    if (step.startsWith('    →')) {
      lines.push(chalk.dim(`  ☐ ${step.trim().substring(2)}`))
    } else {
      lines.push(`  ${step}`)
    }
  }

  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Navigation Complexity Meter ──────────────────────────────────────────────

/**
 * Render navigation complexity meter (0-100).
 *
 * @example
 * formatComplexityMeter(42)
 */
export function formatComplexityMeter(complexity: number): string {
  const filled = Math.round(complexity / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)

  let colorFn: (t: string) => string
  if (complexity <= 25) colorFn = chalk.rgb(76, 175, 80)
  else if (complexity <= 50) colorFn = chalk.rgb(255, 193, 7)
  else if (complexity <= 75) colorFn = chalk.rgb(255, 152, 0)
  else colorFn = chalk.rgb(244, 67, 54)

  return `  Navigation Complexity: ${colorFn(bar)} ${complexity}/100`
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

/**
 * Format compass stats summary.
 *
 * @example
 * formatStatsSummary(stats)
 */
export function formatStatsSummary(stats: CompassStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Compass Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Directions: ${stats.totalDirections}`)
  lines.push(`  Routes: ${stats.totalRoutes}`)
  lines.push(`  Avg route length: ${stats.averageRouteLength}`)
  lines.push(`  Most connected: ${stats.mostConnectedDirection}`)
  lines.push(`  Least connected: ${stats.leastConnectedDirection}`)
  lines.push(formatComplexityMeter(stats.navigationComplexity))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Center Module ────────────────────────────────────────────────────────────

/**
 * Format center module highlight.
 *
 * @example
 * formatCenterModule('src/core.ts')
 */
export function formatCenterModule(center: string): string {
  return chalk.rgb(244, 67, 54)(`  ◉ Center Module: ${center}`)
}

// ─── Full Table Format ────────────────────────────────────────────────────────

/**
 * Format the full compass result as a table.
 *
 * @example
 * formatCompassTable(result)
 */
export function formatCompassTable(result: CompassResult): string {
  const sections: string[] = []
  sections.push(chalk.bold('\n  Codebase Compass\n'))
  sections.push(formatCompassRose(result.directions))
  sections.push(formatCenterModule(result.center))
  sections.push('')
  for (const dir of result.directions) {
    sections.push(formatDirectionCard(dir))
  }
  sections.push('')
  sections.push(formatRoutesTable(result.routes))
  sections.push('')
  sections.push(formatStatsSummary(result.stats))
  sections.push('')
  sections.push(formatOnboardingGuide(result.onboardingGuide))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  return sections.join('\n')
}

// ─── JSON Format ──────────────────────────────────────────────────────────────

/**
 * Format compass result as JSON string.
 *
 * @example
 * formatCompassJSON(result)
 */
export function formatCompassJSON(result: CompassResult): string {
  return JSON.stringify(result, null, 2)
}
