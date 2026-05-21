import chalk from 'chalk'
import type { ChiselResult, ChiselMark, ChiselBlock, ChiselStats } from './chisel-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function materialColor(m: string): string {
  switch (m) {
    case 'marble': return chalk.rgb(255, 255, 255)(m)
    case 'granite': return chalk.rgb(120, 120, 120)(m)
    case 'sandstone': return chalk.rgb(210, 180, 140)(m)
    case 'limestone': return chalk.rgb(200, 200, 180)(m)
    case 'alabaster': return chalk.rgb(245, 240, 230)(m)
    case 'soapstone': return chalk.rgb(160, 160, 160)(m)
    case 'wood': return chalk.rgb(139, 90, 43)(m)
    case 'clay': return chalk.rgb(180, 120, 60)(m)
    default: return chalk.dim(m)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master': return chalk.rgb(255, 215, 0)(g)
    case 'artisan': return chalk.green(g)
    case 'journeyman': return chalk.blue(g)
    case 'apprentice': return chalk.yellow(g)
    case 'novice': return chalk.rgb(255, 165, 0)(g)
    case 'hacker': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function condColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(255, 215, 0)(c)
    case 'refined': return chalk.green(c)
    case 'shaped': return chalk.blue(c)
    case 'rough': return chalk.yellow(c)
    case 'unworked': return chalk.rgb(255, 165, 0)(c)
    case 'butchered': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function studioColor(s: string): string {
  switch (s) {
    case 'master-studio': return chalk.rgb(255, 215, 0)(s)
    case 'workshop': return chalk.green(s)
    case 'garage': return chalk.blue(s)
    case 'shed': return chalk.yellow(s)
    case 'salvage-yard': return chalk.red(s)
    default: return chalk.dim(s)
  }
}

// ─── Mark Formatting ────────────────────────────────────────────────────────

function formatMark(m: ChiselMark, verbose: boolean): string {
  const markers: string[] = []
  if (m.condition === 'masterpiece') markers.push(chalk.rgb(255, 215, 0)('MP'))
  if (m.markQuality.overcuts > 0) markers.push(chalk.yellow('OC'))
  if (m.markQuality.undercuts > 0) markers.push(chalk.blue('UC'))
  const marker = markers.length > 0 ? markers.join(',') : ' '

  const line = ` ${marker} ${chalk.bold(m.file)} ${materialColor(m.material)} ${gradeColor(m.sculptorGrade)} ${condColor(m.condition)} prec:${scoreColor(m.precision)} tool:${scoreColor(m.toolSelection)} qual:${scoreColor(m.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    force:${scoreColor(m.forceControl)} grain:${scoreColor(m.grainRespect)} finish:${scoreColor(m.finishingQuality)} alignment:${scoreColor(m.grainAlignment)}`)
  details.push(`    marks: clean:${m.markQuality.cleanCuts} rough:${m.markQuality.roughCuts} over:${m.markQuality.overcuts} under:${m.markQuality.undercuts} chatter:${m.markQuality.chatterMarks} rasp:${m.markQuality.raspMarks}`)
  details.push(`    sculpt: rough:${m.sculpting.roughingOut} shape:${m.sculpting.shaping} detail:${m.sculpting.detailing} finish:${m.sculpting.finishing} stages:${m.sculpting.totalStages}`)
  details.push(`    dim: depth:${m.dimensions.depth} detail:${m.dimensions.detail} def:${m.dimensions.definition} del:${m.dimensions.delicacy}`)
  if (m.issues.length > 0) details.push(`    issues: ${m.issues.join(', ')}`)
  if (m.highlights.length > 0) details.push(`    highlights: ${m.highlights.join(', ')}`)
  return details.join('\n')
}

// ─── Block Formatting ───────────────────────────────────────────────────────

function formatBlock(b: ChiselBlock, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} ${studioColor(b.studioGrade)} marks:${b.marks.length} qual:${scoreColor(b.blockQuality)} material:${b.dominantMaterial} chisel:${b.dominantChiselType}`

  if (!verbose) return line
  const details = [line]
  details.push(`    prec:${scoreColor(b.avgPrecision)} tool:${scoreColor(b.avgToolSelection)} force:${scoreColor(b.avgForceControl)} grain:${scoreColor(b.avgGrainRespect)} finish:${scoreColor(b.avgFinishing)}`)
  details.push(`    master:${b.masterCount} novice:${b.noviceCount} clean:${b.totalCleanCuts} rough:${b.totalRoughCuts} over:${b.totalOvercuts} under:${b.totalUndercuts}`)
  return details.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────────────────────────

function formatStats(stats: ChiselStats): string {
  return [
    `  Files: ${stats.totalFiles} | Blocks: ${stats.totalBlocks} | Precision: ${scoreColor(stats.avgPrecision)} | Tool: ${scoreColor(stats.avgToolSelection)} | Force: ${scoreColor(stats.avgForceControl)}`,
    `  Grain: ${scoreColor(stats.avgGrainRespect)} | Finish: ${scoreColor(stats.avgFinishing)} | Alignment: ${scoreColor(stats.avgGrainAlignment)} | Overall: ${scoreColor(stats.overallPrecision)}`,
    `  Marble: ${chalk.rgb(255, 255, 255)(String(stats.marbleFiles))} | Granite: ${chalk.gray(String(stats.graniteFiles))} | Wood: ${chalk.rgb(139, 90, 43)(String(stats.woodFiles))} | Clay: ${chalk.rgb(180, 120, 60)(String(stats.clayFiles))}`,
    `  Master: ${chalk.rgb(255, 215, 0)(String(stats.masterSculptor))} | Novice: ${chalk.rgb(255, 165, 0)(String(stats.noviceSculptor))} | Hacker: ${chalk.red(String(stats.hackerSculptor))} | Masterpiece: ${chalk.green(String(stats.masterpieceCount))} | Butchered: ${chalk.red(String(stats.butcheredCount))}`,
    `  Clean: ${chalk.green(String(stats.totalCleanCuts))} | Rough: ${chalk.yellow(String(stats.totalRoughCuts))} | Over: ${chalk.rgb(255, 165, 0)(String(stats.totalOvercuts))} | Under: ${chalk.blue(String(stats.totalUndercuts))} | Chatter: ${chalk.yellow(String(stats.totalChatterMarks))} | Rasp: ${chalk.red(String(stats.totalRaspMarks))}`,
    `  Grade: ${gradeColor(stats.sculptorGrade)} | Best: ${chalk.green(stats.bestMark)} | Worst: ${chalk.red(stats.worstMark)} | Detail: ${chalk.cyan(stats.mostDetailed)} | Clean: ${chalk.blue(stats.cleanestWork)}`,
  ].join('\n')
}

// ─── Table Formatter ────────────────────────────────────────────────────────

/**
 * Format chisel result as a table
 * @example
 * formatChiselTable(result, false) // string
 */
export function formatChiselTable(result: ChiselResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔨 Chisel - Code Precision Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('💠 Chisel Marks'))
  if (result.marks.length === 0) {
    lines.push(chalk.dim('  No marks detected.'))
  } else {
    const display = verbose ? result.marks : result.marks.slice(0, 15)
    for (const m of display) {
      lines.push(formatMark(m, verbose))
    }
    if (!verbose && result.marks.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.marks.length - 15} more`))
    }
  }
  lines.push('')

  if (result.blocks.length > 0) {
    lines.push(chalk.bold('🧊 Chisel Blocks'))
    for (const b of result.blocks) {
      lines.push(formatBlock(b, verbose))
    }
    lines.push('')
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

// ─── JSON Formatter ─────────────────────────────────────────────────────────

/**
 * Format chisel result as JSON
 * @example
 * formatChiselJson(result) // string
 */
export function formatChiselJson(result: ChiselResult): string {
  return JSON.stringify(result, null, 2)
}
