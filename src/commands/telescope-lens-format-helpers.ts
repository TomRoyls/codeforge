import chalk from 'chalk'
import type { TelescopeLensResult, FocusReport, ZoomLevel, TelescopeLensStats } from './telescope-lens-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classificationColor(c: string): string {
  if (c === 'crystal') return chalk.green(c)
  if (c === 'focused') return chalk.blue(c)
  if (c === 'multi-focal') return chalk.cyan(c)
  if (c === 'blurry') return chalk.yellow(c)
  return chalk.red(c)
}

function gradeColor(g: string): string {
  if (g === 'hubble') return chalk.green(g)
  if (g === 'observatory') return chalk.blue(g)
  if (g === 'binoculars') return chalk.cyan(g)
  if (g === 'magnifying-glass') return chalk.yellow(g)
  return chalk.red(g)
}

function severityColor(s: string): string {
  if (s === 'critical') return chalk.red(s)
  if (s === 'important') return chalk.yellow(s)
  if (s === 'notable') return chalk.cyan(s)
  return chalk.dim(s)
}

function levelColor(l: string): string {
  if (l === 'macro') return chalk.magenta(l)
  if (l === 'meso') return chalk.blue(l)
  if (l === 'micro') return chalk.cyan(l)
  return chalk.dim(l)
}

// ─── Zoom Level Formatting ─────────────────────────────────────────────────────

function formatZoomLevel(z: ZoomLevel): string {
  const lines: string[] = []
  lines.push(`  ${levelColor(z.level)} ${chalk.dim('(' + z.description + ')')}`)
  lines.push(`    Clarity: ${scoreColor(z.clarity)}`)
  if (z.visiblePatterns.length > 0) {
    lines.push(`    Visible: ${chalk.green(z.visiblePatterns.join(', '))}`)
  }
  if (z.blurryAreas.length > 0) {
    lines.push(`    Blurry: ${chalk.red(z.blurryAreas.join('; '))}`)
  }
  return lines.join('\n')
}

// ─── Report Formatting ─────────────────────────────────────────────────────────

function formatReport(r: FocusReport): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(r.file)} ${classificationColor(r.focalDepth.classification)} Depth:${r.focalDepth.depthRequired} Focus:${scoreColor(r.focalDepth.focusScore)}`)
  lines.push(`    Best: ${levelColor(r.bestZoomLevel)} Worst: ${levelColor(r.worstZoomLevel)}`)
  const allFindings = r.zoomLevels.flatMap(z => z.findings)
  if (allFindings.length > 0) {
    const display = allFindings.slice(0, 5)
    for (const f of display) {
      lines.push(`    ${severityColor(f.severity)} [${f.category}] ${f.description}`)
    }
  }
  return lines.join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: TelescopeLensStats): string {
  return [
    `  Grade: ${gradeColor(stats.telescopeGrade)} | Focus: ${scoreColor(stats.overallFocus)} | Clarity: ${scoreColor(stats.avgClarity)}`,
    `  Reports: ${chalk.white(String(stats.totalReports))} (${chalk.green(String(stats.crystalFiles))} crystal, ${chalk.red(String(stats.opaqueFiles))} opaque)`,
    `  Avg Depth: ${scoreColor(stats.avgDepthRequired)} | Avg Focus: ${scoreColor(stats.avgFocusScore)}`,
    `  Zoom Clarity — Macro:${scoreColor(stats.macroClarity)} Meso:${scoreColor(stats.mesoClarity)} Micro:${scoreColor(stats.microClarity)} Nano:${scoreColor(stats.nanoClarity)}`,
    `  Best Level: ${levelColor(stats.bestOverallLevel)} | Worst: ${levelColor(stats.worstOverallLevel)}`,
    `  Critical Findings: ${stats.criticalFindings > 0 ? chalk.red(String(stats.criticalFindings)) : chalk.green('0')}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format telescope-lens result as a table
 * @example
 * formatTelescopeLensTable(result, false) // string
 */
export function formatTelescopeLensTable(result: TelescopeLensResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔭 Telescope Lens — Code Focus Depth Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🌌 Global Zoom'))
  for (const gz of result.globalZoom) {
    lines.push(formatZoomLevel(gz))
  }
  lines.push('')

  lines.push(chalk.bold('📄 Reports'))
  const display = verbose ? result.reports : result.reports.slice(0, 10)
  if (display.length === 0) {
    lines.push(chalk.dim('  No reports to display.'))
  } else {
    for (const r of display) {
      lines.push(formatReport(r))
      lines.push('')
    }
  }

  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format telescope-lens result as JSON
 * @example
 * formatTelescopeLensJson(result) // string
 */
export function formatTelescopeLensJson(result: TelescopeLensResult): string {
  return JSON.stringify(result, null, 2)
}
