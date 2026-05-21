import chalk from 'chalk'
import type { AquiferResult, WaterTable, AquiferLayer } from './aquifer-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function aquiferTypeColor(t: string): string {
  switch (t) {
    case 'artesian': return chalk.rgb(255, 215, 0)(t)
    case 'confined': return chalk.blue(t)
    case 'unconfined': return chalk.cyan(t)
    case 'perched': return chalk.magenta(t)
    case 'leaky': return chalk.rgb(255, 165, 0)(t)
    case 'dry': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function waterLevelColor(l: string): string {
  switch (l) {
    case 'flooded': return chalk.blue(l)
    case 'high': return chalk.green(l)
    case 'normal': return chalk.cyan(l)
    case 'low': return chalk.yellow(l)
    case 'critical': return chalk.rgb(255, 165, 0)(l)
    case 'dry': return chalk.red(l)
    default: return chalk.dim(l)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'artesian-well': return chalk.rgb(255, 215, 0)(c)
    case 'clean-spring': return chalk.green(c)
    case 'deep-aquifer': return chalk.blue(c)
    case 'shallow-well': return chalk.yellow(c)
    case 'dry-hole': return chalk.rgb(255, 165, 0)(c)
    case 'toxic-dump': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function layerCondColor(c: string): string {
  switch (c) {
    case 'mineral-spring': return chalk.rgb(255, 215, 0)(c)
    case 'clean-reservoir': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'depleted': return chalk.yellow(c)
    case 'contaminated': return chalk.rgb(255, 165, 0)(c)
    case 'desert': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-hydrologist': return chalk.rgb(255, 215, 0)(g)
    case 'hydrologist': return chalk.green(g)
    case 'geologist': return chalk.blue(g)
    case 'well-digger': return chalk.yellow(g)
    case 'dowsing': return chalk.rgb(255, 165, 0)(g)
    case 'thirsty': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function contaminationColor(l: string): string {
  switch (l) {
    case 'pristine': return chalk.green(l)
    case 'clean': return chalk.blue(l)
    case 'minor': return chalk.cyan(l)
    case 'moderate': return chalk.yellow(l)
    case 'heavy': return chalk.rgb(255, 165, 0)(l)
    case 'toxic': return chalk.red(l)
    default: return chalk.dim(l)
  }
}

// ─── Water Table Formatting ──────────────────────────────────────────────────

function formatWaterTable(t: WaterTable, verbose: boolean): string {
  const line = ` ${conditionColor(t.condition)} ${aquiferTypeColor(t.aquiferType)} ${chalk.bold(t.file)} quality:${scoreColor(t.qualityScore)} flow:${scoreColor(t.flowRate)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    depth:${scoreColor(t.tableDepth)} perm:${scoreColor(t.permeability)} water:${scoreColor(t.waterQuality)} recharge:${scoreColor(t.rechargeRate)} spring:${scoreColor(t.springQuality)} contam:${contaminationColor(t.contamination.level)}`)
  return details.join('\n')
}

// ─── Layer Formatting ────────────────────────────────────────────────────────

function formatLayer(l: AquiferLayer, verbose: boolean): string {
  const line = `  ${chalk.bold(l.directory)} ${layerCondColor(l.condition)} health:${scoreColor(l.layerHealth)} tables:${l.tables.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    water:${scoreColor(l.avgWaterQuality)} flow:${scoreColor(l.avgFlowRate)} perm:${scoreColor(l.avgPermeability)} clean:${l.cleanCount} contam:${l.contaminatedCount} hidden:${l.totalHiddenRivers} sinks:${l.totalSinks}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format aquifer result as a table
 * @example
 * formatAquiferTable(result, false) // string
 */
export function formatAquiferTable(result: AquiferResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n💧 Aquifer - Underground Data Flow Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌊 Water Tables'))
  if (result.tables.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.tables : result.tables.slice(0, 15)
    for (const t of display) {
      lines.push(formatWaterTable(t, verbose))
    }
    if (!verbose && result.tables.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.tables.length - 15} more`))
    }
  }
  lines.push('')

  if (result.layers.length > 0) {
    lines.push(chalk.bold('🪨 Aquifer Layers'))
    for (const l of result.layers) {
      lines.push(formatLayer(l, verbose))
    }
    lines.push('')
  }

  const b = result.basin
  lines.push(chalk.bold('🏞️ Basin'))
  lines.push(`  Health: ${scoreColor(b.overallHealth)} | Quality: ${scoreColor(b.totalWaterQuality)} | Flow: ${scoreColor(b.avgFlowRate)} | Sustainable: ${b.isSustainable ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  Hidden:${b.totalHiddenRivers} Sinks:${b.totalSinks} Contam:${b.totalContamination} Perm:${scoreColor(b.avgPermeability)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.hydrologistGrade)} | Files: ${s.totalFiles} | Layers: ${s.totalLayers}`)
  lines.push(`  Depth:${scoreColor(s.avgTableDepth)} Perm:${scoreColor(s.avgPermeability)} Water:${scoreColor(s.avgWaterQuality)} Flow:${scoreColor(s.avgFlowRate)} Recharge:${scoreColor(s.avgRechargeRate)} Spring:${scoreColor(s.avgSpringQuality)}`)
  lines.push(`  Confined:${s.confinedCount} Artesian:${s.artesianCount} Dry:${s.dryCount} Pristine:${s.pristineCount} Toxic:${s.toxicCount}`)
  lines.push(`  Steady:${s.steadyFlow} Stagnant:${s.stagnantFlow} Hidden:${s.hiddenRiverCount} Sinks:${s.sinkCount} Swallows:${s.swallowCount} DryWells:${s.dryWellCount}`)
  lines.push(`  Cleanest: ${chalk.green(s.cleanestFile)} | Dirtiest: ${chalk.red(s.dirtiestFile)} | Deepest: ${chalk.blue(s.deepestFlow)} | Best: ${chalk.cyan(s.bestSpring)}`)

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
 * Format aquifer result as JSON
 * @example
 * formatAquiferJson(result) // string
 */
export function formatAquiferJson(result: AquiferResult): string {
  return JSON.stringify(result, null, 2)
}
