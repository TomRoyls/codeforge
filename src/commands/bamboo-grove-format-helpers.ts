import chalk from 'chalk'

import type { BambooGroveResult } from './bamboo-grove-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('moso-bamboo') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'moso-bamboo': return chalk.rgb(46, 204, 113).bold(condition)
    case 'giant-bamboo': return chalk.rgb(52, 152, 219)(condition)
    case 'black-bamboo': return chalk.rgb(155, 89, 182)(condition)
    case 'lucky-bamboo': return chalk.rgb(241, 196, 15)(condition)
    case 'dried-cane': return chalk.rgb(230, 126, 34)(condition)
    case 'mulch': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-gardener') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-gardener': return chalk.rgb(46, 204, 113).bold(grade)
    case 'horticulturist': return chalk.rgb(52, 152, 219)(grade)
    case 'gardener': return chalk.rgb(155, 89, 182)(grade)
    case 'landscaper': return chalk.rgb(241, 196, 15)(grade)
    case 'weekend-warrior': return chalk.rgb(230, 126, 34)(grade)
    case 'concrete-paver': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example clusterTypeColor('forest') returns colored string */
export function clusterTypeColor(clusterType: string): string {
  switch (clusterType) {
    case 'forest': return chalk.rgb(46, 204, 113)(clusterType)
    case 'grove': return chalk.rgb(52, 152, 219)(clusterType)
    case 'thicket': return chalk.rgb(155, 89, 182)(clusterType)
    case 'hedge': return chalk.rgb(241, 196, 15)(clusterType)
    case 'stand': return chalk.rgb(230, 126, 34)(clusterType)
    case 'wasteland': return chalk.rgb(231, 76, 60)(clusterType)
    default: return clusterType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatBambooGroveJson(result) returns JSON string */
export function formatBambooGroveJson(result: BambooGroveResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatBambooGroveTable(result, verbose) returns formatted string */
export function formatBambooGroveTable(result: BambooGroveResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Bamboo Grove Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grove Overview:'))
  lines.push(`    Overall Health:  ${scoreColor(result.grove.overallHealth)}`)
  lines.push(`    Avg Strength:    ${scoreColor(result.grove.avgStrength)}`)
  lines.push(`    Avg Spacing:     ${scoreColor(result.grove.avgSpacing)}`)
  lines.push(`    Avg Health:      ${scoreColor(result.grove.avgHealth)}`)
  lines.push(`    Flourishing:     ${result.grove.isFlourishing ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:      ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:   ${result.stats.totalClusters}`)
  lines.push(`    Moso Bamboo:      ${result.stats.mosoBambooCount}`)
  lines.push(`    Giant Bamboo:     ${result.stats.giantBambooCount}`)
  lines.push(`    Black Bamboo:     ${result.stats.blackBambooCount}`)
  lines.push(`    Lucky Bamboo:     ${result.stats.luckyBambooCount}`)
  lines.push(`    Dried Cane:       ${result.stats.driedCaneCount}`)
  lines.push(`    Mulch:            ${result.stats.mulchCount}`)
  lines.push(`    Strong:           ${result.stats.isStrongCount}`)
  lines.push(`    Well Spaced:      ${result.stats.isWellSpacedCount}`)
  lines.push(`    Deep Rooted:      ${result.stats.isDeepRootedCount}`)
  lines.push(`    Full Coverage:    ${result.stats.hasFullCoverageCount}`)
  lines.push(`    Flexible:         ${result.stats.isFlexibleCount}`)
  lines.push(`    Healthy:          ${result.stats.isHealthyCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Gardener:         ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push(`    Best Culm:        ${result.stats.bestCulm || 'N/A'}`)
  lines.push(`    Strongest:        ${result.stats.strongest || 'N/A'}`)
  lines.push(`    Best Spaced:      ${result.stats.bestSpaced || 'N/A'}`)
  lines.push(`    Deepest Rooted:   ${result.stats.deepestRooted || 'N/A'}`)
  lines.push(`    Best Coverage:    ${result.stats.bestCoverage || 'N/A'}`)
  lines.push(`    Most Flexible:    ${result.stats.mostFlexible || 'N/A'}`)
  lines.push('')

  if (verbose && result.culms.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Culm Breakdown:'))
    for (const culm of result.culms) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(culm.file)}`)
      lines.push(`      Condition:      ${conditionColor(culm.condition)}`)
      lines.push(`      Quality Score:  ${scoreColor(culm.qualityScore)}`)
      lines.push(`      Strength:       ${scoreColor(culm.culmStrength)} (${culm.strength.grade})`)
      lines.push(`      Nodes:          ${scoreColor(culm.nodeSpacing)} (${culm.nodes.pattern})`)
      lines.push(`      Rhizome:        ${scoreColor(culm.rhizomeDepth)} (${culm.rhizome.type})`)
      lines.push(`      Canopy:         ${scoreColor(culm.canopySpread)} (${culm.canopy.density})`)
      lines.push(`      Flexibility:    ${scoreColor(culm.flexibilityIndex)} (${culm.flexibility.resilience})`)
      lines.push(`      Health:         ${scoreColor(culm.groveHealth)} (${culm.health.vitality})`)
    }
    lines.push('')
  }

  if (result.clusters.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Clusters:'))
    for (const cluster of result.clusters) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cluster.directory)} — ${clusterTypeColor(cluster.clusterType)} (${cluster.condition})`)
      lines.push(`      Culms: ${cluster.culms.length}, Moso: ${cluster.mosoCount}, Strong: ${cluster.strongCount}, Flexible: ${cluster.flexibleCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
