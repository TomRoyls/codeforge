import chalk from 'chalk'
import type { ArboretumPathResult, ArborealSpecimen, ArboretumSection, ArboretumPathStats } from './arboretum-path-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'ancient-oak') return chalk.rgb(255, 215, 0)(c)
  if (c === 'champion-tree') return chalk.green(c)
  if (c === 'healthy-specimen') return chalk.blue(c)
  if (c === 'young-sapling') return chalk.cyan(c)
  if (c === 'diseased-tree') return chalk.yellow(c)
  return chalk.red(c)
}

function sectionColor(t: string): string {
  if (t === 'old-growth') return chalk.rgb(255, 215, 0)(t)
  if (t === 'mature-forest') return chalk.green(t)
  if (t === 'managed-grove') return chalk.blue(t)
  if (t === 'nursery') return chalk.cyan(t)
  if (t === 'plantation') return chalk.yellow(t)
  return chalk.red(t)
}

function gradeColor(g: string): string {
  if (g === 'master-arborist') return chalk.rgb(255, 215, 0)(g)
  if (g === 'senior-arborist') return chalk.green(g)
  if (g === 'arborist') return chalk.blue(g)
  if (g === 'tree-surgeon') return chalk.cyan(g)
  if (g === 'gardener') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Specimen Formatting ───────────────────────────────────────────────────

function formatSpecimen(sp: ArborealSpecimen): string {
  return `  ${chalk.bold(sp.file)} ${conditionColor(sp.condition)} vitality:${scoreColor(sp.qualityScore)} trunk:${scoreColor(sp.trunkStrength)} root:${scoreColor(sp.rootDepth)} canopy:${scoreColor(sp.canopySpread)}`
}

// ─── Section Formatting ────────────────────────────────────────────────────

function formatSection(s: ArboretumSection): string {
  return `  ${chalk.bold(s.directory)} ${sectionColor(s.sectionType)} trunk:${scoreColor(s.avgTrunkStrength)} root:${scoreColor(s.avgRootDepth)} canopy:${scoreColor(s.avgCanopySpread)} ancient:${s.ancientOakCount} stumps:${s.deadStumpCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: ArboretumPathStats): string {
  return [
    `  Arborist: ${gradeColor(stats.arboristGrade)} | Vitality: ${scoreColor(stats.overallVitality)} | Files: ${stats.totalFiles} | Sections: ${stats.totalSections}`,
    `  Trunk: ${scoreColor(stats.avgTrunkStrength)} | Root: ${scoreColor(stats.avgRootDepth)} | Canopy: ${scoreColor(stats.avgCanopySpread)} | Growth: ${scoreColor(stats.avgGrowthRings)} | Health: ${scoreColor(stats.avgSeasonalHealth)} | Fitness: ${scoreColor(stats.avgSpeciesFitness)}`,
    `  Conditions: Ancient:${stats.ancientOakCount} Champion:${stats.championTreeCount} Healthy:${stats.healthySpecimenCount} Sapling:${stats.youngSaplingCount} Diseased:${stats.diseasedTreeCount} Stump:${stats.deadStumpCount}`,
    `  Best: ${chalk.green(stats.bestSpecimen)} | Trunk: ${chalk.cyan(stats.strongestTrunk)} | Roots: ${chalk.blue(stats.deepestRoots)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format arboretum path result as a table
 * @example
 * formatArboretumPathTable(result, false) // string
 */
export function formatArboretumPathTable(result: ArboretumPathResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌳 Arboretum Path - Code Growth/Tree Structure Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('🌲 Specimens'))
  if (result.specimens.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.specimens : result.specimens.slice(0, 15)
    for (const sp of display) {
      lines.push(formatSpecimen(sp))
    }
    if (!verbose && result.specimens.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.specimens.length - 15} more`))
    }
  }
  lines.push('')

  if (result.sections.length > 0) {
    lines.push(chalk.bold('🌿 Sections'))
    for (const s of result.sections) {
      lines.push(formatSection(s))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Arborist Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format arboretum path result as JSON
 * @example
 * formatArboretumPathJson(result) // string
 */
export function formatArboretumPathJson(result: ArboretumPathResult): string {
  return JSON.stringify(result, null, 2)
}
