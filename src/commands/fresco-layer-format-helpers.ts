import chalk from 'chalk'
import type { FrescoLayerResult, StrataLayer, LayerBoundary, StrataColumn, FrescoLayerStats } from './fresco-layer-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function stabilityColor(s: string): string {
  if (s === 'bedrock') return chalk.green(s)
  if (s === 'stable') return chalk.blue(s)
  if (s === 'settling') return chalk.cyan(s)
  if (s === 'shifting') return chalk.yellow(s)
  if (s === 'unstable') return chalk.rgb(255, 165, 0)(s)
  return chalk.red(s)
}

function ageColor(a: string): string {
  if (a === 'new') return chalk.green(a)
  if (a === 'recent') return chalk.blue(a)
  if (a === 'mature') return chalk.cyan(a)
  if (a === 'ancient') return chalk.yellow(a)
  return chalk.red(a)
}

function rockColor(r: string): string {
  if (r === 'granite') return chalk.green(r)
  if (r === 'marble') return chalk.cyan(r)
  if (r === 'limestone') return chalk.blue(r)
  if (r === 'sandstone') return chalk.yellow(r)
  if (r === 'shale') return chalk.rgb(255, 165, 0)(r)
  if (r === 'clay') return chalk.red(r)
  return chalk.magenta(r)
}

function boundaryColor(b: string): string {
  if (b === 'clean') return chalk.green(b)
  if (b === 'porous') return chalk.blue(b)
  if (b === 'blurred') return chalk.yellow(b)
  if (b === 'mixed') return chalk.rgb(255, 165, 0)(b)
  return chalk.red(b)
}

function gradeColor(g: string): string {
  if (g === 'A') return chalk.green(g)
  if (g === 'B') return chalk.blue(g)
  if (g === 'C') return chalk.yellow(g)
  if (g === 'D') return chalk.rgb(255, 165, 0)(g)
  return chalk.red(g)
}

function stabilityGradeColor(s: string): string {
  if (s === 'rock-solid') return chalk.green(s)
  if (s === 'stable') return chalk.blue(s)
  if (s === 'settling') return chalk.cyan(s)
  if (s === 'shifting') return chalk.yellow(s)
  if (s === 'unstable') return chalk.rgb(255, 165, 0)(s)
  return chalk.red(s)
}

// ─── Layer Formatting ────────────────────────────────────────────────────────

function formatLayer(l: StrataLayer, verbose: boolean): string {
  const markers: string[] = []
  if (l.contaminated) markers.push(chalk.red('[contaminated]'))
  if (l.fossils.length > 0) markers.push(chalk.yellow(`[${l.fossils.length} fossils]`))
  if (l.minerals.length > 0) markers.push(chalk.cyan(`[${l.minerals.length} minerals]`))

  const line = `  ${chalk.bold(l.layerName)} depth:${l.depth} qual:${scoreColor(l.avgQuality)} dens:${l.density} poro:${scoreColor(100 - l.porosity)} perm:${scoreColor(100 - l.permeability)} ${stabilityColor(l.stability)} ${rockColor(l.classification)} ${ageColor(l.age)}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`

  if (!verbose) return line

  const details: string[] = [line]
  if (l.files.length > 0) {
    const display = l.files.slice(0, 5)
    for (const f of display) {
      details.push(`    ${chalk.dim(f)}`)
    }
    if (l.files.length > 5) {
      details.push(`    ${chalk.dim(`... and ${l.files.length - 5} more`)}`)
    }
  }
  if (l.contaminants.length > 0) {
    details.push(`    contaminants: ${l.contaminants.map(c => chalk.red(c)).join(', ')}`)
  }
  if (l.bondedTo.length > 0) {
    details.push(`    bonded to: ${l.bondedTo.join(', ')}`)
  }
  return details.join('\n')
}

// ─── Boundary Formatting ─────────────────────────────────────────────────────

function formatBoundary(b: LayerBoundary): string {
  const guard = b.hasGuard ? chalk.green('[guard]') : chalk.red('[no guard]')
  return `  ${chalk.dim(b.upperLayer)} <-> ${chalk.dim(b.lowerLayer)} ${boundaryColor(b.boundaryType)} coupling:${scoreColor(100 - b.couplingScore)} deps:${b.dependencies} x-contam:${b.crossContaminations} ${guard}`
}

// ─── Column Formatting ───────────────────────────────────────────────────────

function formatColumn(c: StrataColumn, verbose: boolean): string {
  const markers: string[] = []
  if (c.hasInversions) markers.push(chalk.red('[inversions]'))
  if (c.isHealthy) markers.push(chalk.green('[healthy]'))

  const line = `  ${chalk.bold(c.directory)} grade:${gradeColor(c.healthGrade)} integrity:${scoreColor(c.structuralIntegrity)} erosion:${scoreColor(100 - c.erosionRisk)} depth:${c.totalDepth} layers:${c.layers.length} rock:${c.dominantRock} age:${c.geologicalAge}${markers.length > 0 ? ' ' + markers.join(' ') : ''}`

  if (!verbose) return line

  const details = [line]
  if (c.recommendations.length > 0) {
    for (const r of c.recommendations.slice(0, 3)) {
      details.push(`    ${chalk.dim('-')} ${r}`)
    }
  }
  return details.join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: FrescoLayerStats): string {
  return [
    `  Geological Score: ${scoreColor(stats.overallGeologicalScore)} | Stability: ${stabilityGradeColor(stats.stabilityGrade)}`,
    `  Layers: ${stats.totalLayers} (Bedrock: ${chalk.green(String(stats.bedrockLayers))} Unstable: ${chalk.yellow(String(stats.unstableLayers))} Quicksand: ${chalk.red(String(stats.quicksandLayers))})`,
    `  Boundaries: ${stats.totalBoundaries} (Clean: ${chalk.green(String(stats.cleanBoundaries))} Fault: ${chalk.red(String(stats.faultBoundaries))})`,
    `  Columns: ${stats.totalColumns} | Files: ${stats.totalFiles}`,
    `  Avg Quality: ${scoreColor(stats.avgLayerQuality)} | Avg Integrity: ${scoreColor(stats.avgStructuralIntegrity)} | Avg Erosion Risk: ${scoreColor(100 - stats.avgErosionRisk)}`,
    `  Contaminated: ${stats.contaminatedLayers} | Fossils: ${stats.totalFossils} | Minerals: ${stats.totalMinerals}`,
    `  Deepest: ${stats.deepestLayer} | Shallowest: ${stats.shallowestLayer}`,
    `  Most Stable: ${stats.mostStableColumn} | Least Stable: ${stats.leastStableColumn}`,
    `  Has Inversions: ${stats.hasInversions ? chalk.red('yes') : chalk.green('no')}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format fresco-layer result as a table
 * @example
 * formatFrescoLayerTable(result, false) // string
 */
export function formatFrescoLayerTable(result: FrescoLayerResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏔️ Fresco Layer - Geological Strata Analysis\n'))
  lines.push(chalk.bold('═'.repeat(55)))
  lines.push('')

  lines.push(chalk.bold('🪨 Strata Layers'))
  if (result.layers.length === 0) {
    lines.push(chalk.dim('  No layers detected.'))
  } else {
    for (const l of result.layers) {
      lines.push(formatLayer(l, verbose))
    }
  }
  lines.push('')

  if (result.boundaries.length > 0) {
    lines.push(chalk.bold('↔ Layer Boundaries'))
    for (const b of result.boundaries) {
      lines.push(formatBoundary(b))
    }
    lines.push('')
  }

  if (result.columns.length > 0) {
    lines.push(chalk.bold('📊 Strata Columns'))
    const display = verbose ? result.columns : result.columns.slice(0, 10)
    for (const c of display) {
      lines.push(formatColumn(c, verbose))
    }
    if (!verbose && result.columns.length > 10) {
      lines.push(chalk.dim(`  ... and ${result.columns.length - 10} more`))
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
 * Format fresco-layer result as JSON
 * @example
 * formatFrescoLayerJson(result) // string
 */
export function formatFrescoLayerJson(result: FrescoLayerResult): string {
  return JSON.stringify(result, null, 2)
}
