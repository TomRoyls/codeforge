import chalk from 'chalk'
import type { KaleidoscopeShard, KaleidoscopeTurnResult } from './kaleidoscope-turn-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function chamberTypeColor(t: string): string {
  switch (t) {
    case 'mandala': return chalk.rgb(255, 215, 0)(t)
    case 'star': return chalk.rgb(135, 206, 235)(t)
    case 'flower': return chalk.rgb(255, 182, 193)(t)
    case 'crystal': return chalk.cyan(t)
    case 'geometric': return chalk.blue(t)
    case 'chaotic': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'breathtaking': return chalk.rgb(255, 215, 0)(c)
    case 'beautiful': return chalk.green(c)
    case 'pleasant': return chalk.blue(c)
    case 'mediocre': return chalk.yellow(c)
    case 'ugly': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-optician': return chalk.rgb(255, 215, 0)(g)
    case 'optician': return chalk.green(g)
    case 'glassblower': return chalk.blue(g)
    case 'apprentice': return chalk.cyan(g)
    case 'child': return chalk.yellow(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Shard Formatting ────────────────────────────────────────────────────────

function formatShard(sh: KaleidoscopeShard, verbose: boolean): string {
  const line = ` ${chalk.bold(sh.file)} sym:${scoreColor(sh.symmetry)} align:${scoreColor(sh.alignment)} beauty:${scoreColor(sh.beauty)} var:${scoreColor(sh.perspectiveVariance)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    dominant:${sh.dominantPerspective} weakest:${sh.weakestPerspective} rotation:${sh.rotation} quality:${scoreColor(sh.qualityScore)}`)
  details.push(`    perspectives: struct=${sh.perspectives.structural.score} behav=${sh.perspectives.behavioral.score} logic=${sh.perspectives.logical.score} style=${sh.perspectives.stylistic.score} sem=${sh.perspectives.semantic.score} relat=${sh.perspectives.relational.score}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format kaleidoscope turn result as a table
 * @example
 * formatKaleidoscopeTurnTable(result, false) // string
 */
export function formatKaleidoscopeTurnTable(result: KaleidoscopeTurnResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔮 Kaleidoscope Turn - Code Perspective/Pattern Rotation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('💎 Shards'))
  if (result.shards.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.shards : result.shards.slice(0, 15)
    for (const sh of display) {
      lines.push(formatShard(sh, verbose))
    }
    if (!verbose && result.shards.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.shards.length - 15} more`))
    }
  }
  lines.push('')

  if (result.chambers.length > 0) {
    lines.push(chalk.bold('🏛️ Chambers'))
    for (const ch of result.chambers) {
      lines.push(`  ${chalk.bold(ch.directory)} ${chamberTypeColor(ch.chamberType)} sym:${scoreColor(ch.avgSymmetry)} beauty:${scoreColor(ch.chamberBeauty)} ${conditionColor(ch.condition)} harmonious:${ch.harmoniousCount}`)
    }
    lines.push('')
  }

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.opticianGrade)} | Symmetry: ${scoreColor(s.overallSymmetry)} | Files: ${s.totalFiles} | Chambers: ${s.totalChambers}`)
  lines.push(`  Harmonious:${s.harmoniousFiles} Clashing:${s.clashingFiles} Monochrome:${s.monochromeFiles} Polychrome:${s.polychromeFiles} Symmetry:${s.symmetryFiles} Distortion:${s.distortionFiles}`)
  lines.push(`  Mandala:${s.mandalaChambers} Chaotic:${s.chaoticChambers} Breathtaking:${s.breathtakingChambers} Broken:${s.brokenChambers}`)
  lines.push(`  MostSymmetrical:${chalk.green(s.mostSymmetrical)} | Least:${chalk.red(s.leastSymmetrical)} | MostBeautiful:${chalk.rgb(255, 215, 0)(s.mostBeautiful)}`)
  lines.push(`  BestFromAllAngles:${chalk.cyan(s.bestFromAllAngles)}`)

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
 * Format kaleidoscope turn result as JSON
 * @example
 * formatKaleidoscopeTurnJson(result) // string
 */
export function formatKaleidoscopeTurnJson(result: KaleidoscopeTurnResult): string {
  return JSON.stringify(result, null, 2)
}
