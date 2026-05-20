import chalk from 'chalk'
import type { FoundryResult, CastPiece, FoundryBatch, FoundryStats } from './foundry-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function metalColor(m: string): string {
  switch (m) {
    case 'titanium': return chalk.rgb(200, 200, 220)(m)
    case 'steel': return chalk.gray(m)
    case 'iron': return chalk.rgb(100, 100, 100)(m)
    case 'bronze': return chalk.rgb(205, 127, 50)(m)
    case 'copper': return chalk.rgb(184, 115, 51)(m)
    case 'brass': return chalk.rgb(255, 215, 0)(m)
    case 'tin': return chalk.rgb(192, 192, 192)(m)
    default: return chalk.dim(m)
  }
}

function methodColor(m: string): string {
  switch (m) {
    case 'die-cast': return chalk.rgb(255, 215, 0)(m)
    case 'investment': return chalk.green(m)
    case 'centrifugal': return chalk.blue(m)
    case 'continuous': return chalk.cyan(m)
    case 'sand-cast': return chalk.yellow(m)
    default: return chalk.dim(m)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'aerospace': return chalk.rgb(255, 215, 0)(g)
    case 'industrial': return chalk.green(g)
    case 'commercial': return chalk.blue(g)
    case 'scrap': return chalk.yellow(g)
    default: return chalk.red(g)
  }
}

function treatmentColor(t: string): string {
  switch (t) {
    case 'annealed': return chalk.rgb(255, 215, 0)(t)
    case 'normalized': return chalk.green(t)
    case 'tempered': return chalk.blue(t)
    case 'quenched': return chalk.yellow(t)
    default: return chalk.red(t)
  }
}

function batchConditionColor(c: string): string {
  switch (c) {
    case 'premium': return chalk.rgb(255, 215, 0)(c)
    case 'standard': return chalk.green(c)
    case 'economy': return chalk.blue(c)
    case 'reject': return chalk.yellow(c)
    default: return chalk.red(c)
  }
}

function foundryGradeColor(g: string): string {
  switch (g) {
    case 'world-class': return chalk.rgb(255, 215, 0)(g)
    case 'certified': return chalk.green(g)
    case 'standard': return chalk.blue(g)
    case 'substandard': return chalk.yellow(g)
    default: return chalk.red(g)
  }
}

// ─── Piece Formatting ────────────────────────────────────────────────────────

function formatPiece(p: CastPiece, verbose: boolean): string {
  const line = `  ${chalk.bold(p.file)} melt:${scoreColor(p.meltingPoint)} mold:${scoreColor(p.moldQuality)} precision:${scoreColor(p.castingPrecision)} finish:${scoreColor(p.finishingQuality)} integrity:${scoreColor(p.structuralIntegrity)} ${metalColor(p.metalType)} ${methodColor(p.castingMethod)} ${gradeColor(p.grade)} ${treatmentColor(p.heatTreatment)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    alloy:${scoreColor(p.alloyComposition)} weight:${p.weight} quality:${scoreColor(p.qualityScore)}`)
  details.push(`    porosity:${p.defects.porosity} slag:${p.defects.slag} shrink:${p.defects.shrinkage} coldShut:${p.defects.coldShuts} hotTear:${p.defects.hotTears} misrun:${p.defects.misruns} inclusion:${p.defects.inclusions} surface:${p.defects.surfaceDefects}`)
  details.push(`    hard:${p.properties.hardness} ductile:${p.properties.ductility} malleable:${p.properties.malleability} tough:${p.properties.toughness} conduct:${p.properties.conductivity} magnet:${p.properties.magnetism}`)
  if (p.issues.length > 0) details.push(`    issues: ${p.issues.join(', ')}`)
  if (p.strengths.length > 0) details.push(`    strengths: ${p.strengths.join(', ')}`)
  return details.join('\n')
}

// ─── Batch Formatting ────────────────────────────────────────────────────────

function formatBatch(b: FoundryBatch, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} quality:${scoreColor(b.batchQuality)} ${metalColor(b.dominantMetal)} ${methodColor(b.dominantMethod)} ${batchConditionColor(b.batchCondition)} pieces:${b.pieces.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    defects: avg ${b.avgDefects} total ${b.totalDefects} aerospace:${b.aerospaceGrade} scrap:${b.scrapGrade} treatment-needed:${b.heatTreatmentNeeded}`)
  details.push(`    health: ${scoreColor(b.foundryHealth)}`)
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: FoundryStats): string {
  return [
    `  Grade: ${foundryGradeColor(stats.foundryGrade)} | Quality: ${scoreColor(stats.overallQuality)} | Melting: ${scoreColor(stats.avgMeltingPoint)} | Mold: ${scoreColor(stats.avgMoldQuality)} | Precision: ${scoreColor(stats.avgCastingPrecision)}`,
    `  Files: ${stats.totalFiles} | Batches: ${stats.totalBatches}`,
    `  Finish: ${scoreColor(stats.avgFinishingQuality)} | Integrity: ${scoreColor(stats.avgStructuralIntegrity)}`,
    `  Titanium: ${chalk.rgb(200, 200, 220)(String(stats.titaniumFiles))} | Steel: ${chalk.gray(String(stats.steelFiles))} | Lead: ${chalk.dim(String(stats.leadFiles))}`,
    `  Aerospace: ${chalk.rgb(255, 215, 0)(String(stats.aerospaceGrade))} | Industrial: ${chalk.green(String(stats.industrialGrade))} | Commercial: ${chalk.blue(String(stats.commercialGrade))} | Scrap: ${chalk.red(String(stats.scrapGrade))}`,
    `  Defects - porosity:${stats.totalPorosity} slag:${stats.totalSlag} shrink:${stats.totalShrinkage} coldShut:${stats.totalColdShuts} hotTear:${stats.totalHotTears} misrun:${stats.totalMisruns} inclusion:${stats.totalInclusions} surface:${stats.totalSurfaceDefects}`,
    `  Properties - hard:${scoreColor(stats.avgHardness)} ductile:${scoreColor(stats.avgDuctility)} malleable:${scoreColor(stats.avgMalleability)} tough:${scoreColor(stats.avgToughness)}`,
    `  Best: ${chalk.green(stats.bestPiece)} | Worst: ${chalk.red(stats.worstPiece)}`,
    `  Heaviest: ${chalk.blue(stats.heaviestPiece)} | Lightest: ${chalk.yellow(stats.lightestPiece)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format foundry result as a table
 * @example
 * formatFoundryTable(result, false) // string
 */
export function formatFoundryTable(result: FoundryResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏭 Foundry - Code Metalworking Quality Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔩 Cast Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No cast pieces detected.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const p of display) {
      lines.push(formatPiece(p, verbose))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.batches.length > 0) {
    lines.push(chalk.bold('📦 Batches'))
    for (const b of result.batches) {
      lines.push(formatBatch(b, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Statistics'))
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

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format foundry result as JSON
 * @example
 * formatFoundryJson(result) // string
 */
export function formatFoundryJson(result: FoundryResult): string {
  return JSON.stringify(result, null, 2)
}
