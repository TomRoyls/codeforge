import chalk from 'chalk'
import type { AlchemistCrucibleResult, AlchemicalSample, AlchemicalWorkshop, AlchemistCrucibleStats } from './alchemist-crucible-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'philosopher-stone') return chalk.rgb(255, 215, 0)(c)
  if (c === 'pure-gold') return chalk.green(c)
  if (c === 'refined-metal') return chalk.blue(c)
  if (c === 'base-metal') return chalk.yellow(c)
  if (c === 'raw-ore') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function materialColor(m: string): string {
  if (m === 'crystal') return chalk.cyan(m)
  if (m === 'platinum') return chalk.rgb(229, 228, 226)(m)
  if (m === 'steel') return chalk.blue(m)
  if (m === 'iron') return chalk.dim(m)
  if (m === 'bronze') return chalk.yellow(m)
  return chalk.red(m)
}

function stageColor(s: string): string {
  if (s === 'coagulation') return chalk.green(s)
  if (s === 'distillation') return chalk.blue(s)
  if (s === 'fermentation') return chalk.cyan(s)
  if (s === 'conjunction') return chalk.yellow(s)
  return chalk.dim(s)
}

function workshopTypeColor(w: string): string {
  if (w === 'grand-laboratory') return chalk.rgb(255, 215, 0)(w)
  if (w === 'alchemist-tower') return chalk.green(w)
  if (w === 'guild-workshop') return chalk.blue(w)
  if (w === 'kitchen-lab') return chalk.yellow(w)
  return chalk.red(w)
}

function gradeColor(g: string): string {
  if (g === 'grand-master') return chalk.rgb(255, 215, 0)(g)
  if (g === 'master') return chalk.green(g)
  if (g === 'adept') return chalk.blue(g)
  if (g === 'journeyman') return chalk.cyan(g)
  if (g === 'novice') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Sample Formatting ─────────────────────────────────────────────────────

function formatSample(s: AlchemicalSample): string {
  return `  ${chalk.bold(s.file)} ${conditionColor(s.condition)} quality:${scoreColor(s.qualityScore)} purity:${scoreColor(s.cruciblePurity)} gold:${scoreColor(s.goldYield)}`
}

// ─── Workshop Formatting ───────────────────────────────────────────────────

function formatWorkshop(w: AlchemicalWorkshop): string {
  return `  ${chalk.bold(w.directory)} ${workshopTypeColor(w.workshopType)} purity:${scoreColor(w.avgPurity)} gold:${scoreColor(w.avgGoldYield)} stones:${w.philosopherStoneCount} slag:${w.slagHeapCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: AlchemistCrucibleStats): string {
  return [
    `  Grade: ${gradeColor(stats.alchemistGrade)} | Purity: ${scoreColor(stats.overallPurity)} | Files: ${stats.totalFiles} | Workshops: ${stats.totalWorkshops}`,
    `  Transmutation: ${scoreColor(stats.avgTransmutationQuality)} | Purity: ${scoreColor(stats.avgCruciblePurity)} | Stone: ${scoreColor(stats.avgPhilosopherStone)} | Balance: ${scoreColor(stats.avgElementalBalance)} | Process: ${scoreColor(stats.avgAlchemicalProcess)} | Gold: ${scoreColor(stats.avgGoldYield)}`,
    `  Conditions: Stones:${stats.philosopherStoneCount} Pure:${stats.pureGoldCount} Refined:${stats.refinedMetalCount} Base:${stats.baseMetalCount} Ore:${stats.rawOreCount} Slag:${stats.slagHeapCount}`,
    `  Best: ${chalk.green(stats.bestSample)} | Purest: ${chalk.cyan(stats.purestCrucible)} | Algorithm: ${chalk.blue(stats.bestAlgorithm)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format alchemist crucible result as a table
 * @example
 * formatAlchemistCrucibleTable(result, false) // string
 */
export function formatAlchemistCrucibleTable(result: AlchemistCrucibleResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n⚗️ Alchemist Crucible - Code Transformation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🧪 Samples'))
  if (result.samples.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.samples : result.samples.slice(0, 15)
    for (const s of display) {
      lines.push(formatSample(s))
    }
    if (!verbose && result.samples.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.samples.length - 15} more`))
    }
  }
  lines.push('')

  if (result.workshops.length > 0) {
    lines.push(chalk.bold('🏭 Workshops'))
    for (const w of result.workshops) {
      lines.push(formatWorkshop(w))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Summary'))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format alchemist crucible result as JSON
 * @example
 * formatAlchemistCrucibleJson(result) // string
 */
export function formatAlchemistCrucibleJson(result: AlchemistCrucibleResult): string {
  return JSON.stringify(result, null, 2)
}
