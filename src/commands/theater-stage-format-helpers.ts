import chalk from 'chalk'
import type { TheaterStageResult, StagePerformance, TheaterCompany, TheaterStageStats } from './theater-stage-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'tony-award') return chalk.rgb(255, 215, 0)(c)
  if (c === 'standing-ovation') return chalk.green(c)
  if (c === 'critical-acclaim') return chalk.blue(c)
  if (c === 'community-theater') return chalk.cyan(c)
  if (c === 'amateur-night') return chalk.yellow(c)
  return chalk.red(c)
}

function companyColor(t: string): string {
  if (t === 'royal-opera') return chalk.rgb(255, 215, 0)(t)
  if (t === 'broadway-company') return chalk.green(t)
  if (t === 'regional-theater') return chalk.blue(t)
  if (t === 'community-theater') return chalk.cyan(t)
  if (t === 'drama-club') return chalk.yellow(t)
  return chalk.red(t)
}

function gradeColor(g: string): string {
  if (g === 'award-winning-director') return chalk.rgb(255, 215, 0)(g)
  if (g === 'experienced-director') return chalk.green(g)
  if (g === 'director') return chalk.blue(g)
  if (g === 'assistant-director') return chalk.cyan(g)
  if (g === 'stage-manager') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Performance Formatting ────────────────────────────────────────────────

function formatPerformance(p: StagePerformance): string {
  return `  ${chalk.bold(p.file)} ${conditionColor(p.condition)} score:${scoreColor(p.qualityScore)} presence:${scoreColor(p.stagePresence)} script:${scoreColor(p.scriptQuality)} costume:${scoreColor(p.costumeDesign)}`
}

// ─── Company Formatting ────────────────────────────────────────────────────

function formatCompany(c: TheaterCompany): string {
  return `  ${chalk.bold(c.directory)} ${companyColor(c.companyType)} presence:${scoreColor(c.avgPresence)} script:${scoreColor(c.avgScript)} engagement:${scoreColor(c.avgEngagement)} tony:${c.tonyAwardCount} flops:${c.flopCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: TheaterStageStats): string {
  return [
    `  Director: ${gradeColor(stats.directorGrade)} | Production: ${scoreColor(stats.overallProduction)} | Files: ${stats.totalFiles} | Companies: ${stats.totalCompanies}`,
    `  Presence: ${scoreColor(stats.avgStagePresence)} | Script: ${scoreColor(stats.avgScriptQuality)} | Costume: ${scoreColor(stats.avgCostumeDesign)} | Set: ${scoreColor(stats.avgSetDesign)} | Engagement: ${scoreColor(stats.avgAudienceEngagement)} | Performance: ${scoreColor(stats.avgPerformanceQuality)}`,
    `  Conditions: Tony:${stats.tonyAwardCount} Ovation:${stats.standingOvationCount} Acclaim:${stats.criticalAcclaimCount} Community:${stats.communityTheaterCount} Amateur:${stats.amateurNightCount} Flop:${stats.flopCount}`,
    `  Best: ${chalk.green(stats.bestPerformance)} | Script: ${chalk.cyan(stats.bestScript)} | Costume: ${chalk.blue(stats.bestCostume)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format theater stage result as a table
 * @example
 * formatTheaterStageTable(result, false) // string
 */
export function formatTheaterStageTable(result: TheaterStageResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🎭 Theater Stage - Code Performance Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🎬 Performances'))
  if (result.performances.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.performances : result.performances.slice(0, 15)
    for (const p of display) {
      lines.push(formatPerformance(p))
    }
    if (!verbose && result.performances.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.performances.length - 15} more`))
    }
  }
  lines.push('')

  if (result.companies.length > 0) {
    lines.push(chalk.bold('🏛️ Companies'))
    for (const c of result.companies) {
      lines.push(formatCompany(c))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Director Notes'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format theater stage result as JSON
 * @example
 * formatTheaterStageJson(result) // string
 */
export function formatTheaterStageJson(result: TheaterStageResult): string {
  return JSON.stringify(result, null, 2)
}
