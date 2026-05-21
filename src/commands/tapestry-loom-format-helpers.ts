import chalk from 'chalk'
import type { TapestryLoomResult, LoomMechanics, LoomBench } from './tapestry-loom-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function mechanicsColor(t: string): string {
  switch (t) {
    case 'jacquard': return chalk.rgb(255, 215, 0)(t)
    case 'dobby': return chalk.green(t)
    case 'counterbalance': return chalk.blue(t)
    case 'countermarch': return chalk.cyan(t)
    case 'rigid-heddle': return chalk.magenta(t)
    case 'inkle': return chalk.yellow(t)
    case 'frame': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'perfectly-tuned': return chalk.rgb(255, 215, 0)(c)
    case 'well-tuned': return chalk.green(c)
    case 'in-tune': return chalk.blue(c)
    case 'needs-adjustment': return chalk.yellow(c)
    case 'out-of-tune': return chalk.rgb(255, 165, 0)(c)
    case 'broken-down': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function benchCondColor(c: string): string {
  switch (c) {
    case 'workshop': return chalk.rgb(255, 215, 0)(c)
    case 'studio': return chalk.green(c)
    case 'garage': return chalk.blue(c)
    case 'shed': return chalk.yellow(c)
    case 'salvage': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-weaver': return chalk.rgb(255, 215, 0)(g)
    case 'journeyman': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'novice': return chalk.yellow(g)
    case 'clumsy': return chalk.rgb(255, 165, 0)(g)
    case 'tangled': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Mechanics Formatting ────────────────────────────────────────────────────

function formatMechanics(m: LoomMechanics, verbose: boolean): string {
  const line = ` ${conditionColor(m.condition)} ${mechanicsColor(m.mechanics)} ${chalk.bold(m.file)} quality:${scoreColor(m.qualityScore)} warp:${scoreColor(m.warpTension)} weft:${scoreColor(m.weftTension)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    shed:${scoreColor(m.shedClarity)} heddle:${scoreColor(m.heddleOperation)} beam:${scoreColor(m.beamWinding)} takeup:${scoreColor(m.takeUp)} balanced:${m.isBalancedWeave ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Bench Formatting ────────────────────────────────────────────────────────

function formatBench(b: LoomBench, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} ${benchCondColor(b.condition)} quality:${scoreColor(b.benchQuality)} mechs:${b.mechanics.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    warp:${scoreColor(b.avgWarpTension)} weft:${scoreColor(b.avgWeftTension)} shed:${scoreColor(b.avgShedClarity)} heddle:${scoreColor(b.avgHeddleOperation)} beam:${scoreColor(b.avgBeamWinding)} tuned:${b.tunedCount} broken:${b.brokenCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format tapestry loom result as a table
 * @example
 * formatTapestryLoomTable(result, false) // string
 */
export function formatTapestryLoomTable(result: TapestryLoomResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧵 Tapestry Loom - Interconnection Weaving Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('⚙️ Loom Mechanics'))
  if (result.mechanics.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.mechanics : result.mechanics.slice(0, 15)
    for (const m of display) {
      lines.push(formatMechanics(m, verbose))
    }
    if (!verbose && result.mechanics.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.mechanics.length - 15} more`))
    }
  }
  lines.push('')

  if (result.benches.length > 0) {
    lines.push(chalk.bold('🪑 Loom Benches'))
    for (const b of result.benches) {
      lines.push(formatBench(b, verbose))
    }
    lines.push('')
  }

  const w = result.workshop
  lines.push(chalk.bold('🏭 Workshop'))
  lines.push(`  Tuning: ${scoreColor(w.overallTuning)} | Warp:${scoreColor(w.avgWarpTension)} Weft:${scoreColor(w.avgWeftTension)} Shed:${scoreColor(w.avgShedClarity)} Heddle:${scoreColor(w.avgHeddleOperation)} Beam:${scoreColor(w.avgBeamWinding)}`)
  lines.push(`  Balanced: ${w.isBalanced ? chalk.green('YES') : chalk.yellow('NO')}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.weaverGrade)} | Files: ${s.totalFiles} | Benches: ${s.totalBenches}`)
  lines.push(`  Jacquard:${s.jacquardCount} RigidHeddle:${s.rigidHeddleCount} Frame:${s.frameCount} Tuned:${s.tunedCount} NeedsAdj:${s.needsAdjustmentCount} Broken:${s.brokenDownCount}`)
  lines.push(`  Balanced:${s.balancedWeaveCount} MissingHeddles:${s.totalMissingHeddles} BrokenHeddles:${s.totalBrokenHeddles} Gaps:${s.totalGaps} Crowding:${s.totalCrowding}`)
  lines.push(`  Best: ${chalk.green(s.bestTuned)} | Worst: ${chalk.red(s.worstTuned)} | BestShed: ${chalk.blue(s.bestShed)} | BestHeddles: ${chalk.cyan(s.bestHeddles)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format tapestry loom result as JSON
 * @example
 * formatTapestryLoomJson(result) // string
 */
export function formatTapestryLoomJson(result: TapestryLoomResult): string {
  return JSON.stringify(result, null, 2)
}
