import chalk from 'chalk'

import type { SpringBloomResult } from './spring-bloom-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('cherry-blossom-avenue') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'cherry-blossom-avenue': return chalk.rgb(255, 183, 197).bold(condition)
    case 'tulip-field': return chalk.rgb(255, 87, 51)(condition)
    case 'wildflower-meadow': return chalk.rgb(46, 204, 113)(condition)
    case 'garden-bed': return chalk.rgb(241, 196, 15)(condition)
    case 'window-box': return chalk.rgb(230, 126, 34)(condition)
    case 'compost': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-horticulturist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-horticulturist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'head-gardener': return chalk.rgb(52, 152, 219)(grade)
    case 'gardener': return chalk.rgb(155, 89, 182)(grade)
    case 'green-thumb': return chalk.rgb(241, 196, 15)(grade)
    case 'plant-owner': return chalk.rgb(230, 126, 34)(grade)
    case 'concrete-lover': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example budTypeColor('cherry-blossom') returns colored string */
export function budTypeColor(budType: string): string {
  switch (budType) {
    case 'cherry-blossom': return chalk.rgb(255, 183, 197)(budType)
    case 'tulip': return chalk.rgb(255, 87, 51)(budType)
    case 'daffodil': return chalk.rgb(255, 223, 0)(budType)
    case 'lily': return chalk.rgb(255, 255, 255)(budType)
    case 'dandelion': return chalk.rgb(241, 196, 15)(budType)
    case 'dead-seed': return chalk.rgb(231, 76, 60)(budType)
    default: return budType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSpringBloomJson(result) returns JSON string */
export function formatSpringBloomJson(result: SpringBloomResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSpringBloomTable(result, verbose) returns formatted string */
export function formatSpringBloomTable(result: SpringBloomResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(46, 139, 87).bold('  Spring Bloom Analysis'))
  lines.push('')

  lines.push(chalk.rgb(46, 139, 87)('  Meadow Overview:'))
  lines.push(`    Overall Bloom:         ${scoreColor(result.meadow.overallBloom)}`)
  lines.push(`    Avg Vitality:          ${scoreColor(result.meadow.avgVitality)}`)
  lines.push(`    Avg Quality:           ${scoreColor(result.meadow.avgQuality)}`)
  lines.push(`    Avg Health:            ${scoreColor(result.meadow.avgHealth)}`)
  lines.push(`    Is Flourishing:        ${result.meadow.isFlourishing ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(46, 139, 87)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Gardens:                 ${result.stats.totalGardens}`)
  lines.push(`    Avg Bud Vitality:              ${scoreColor(result.stats.avgBudVitality)}`)
  lines.push(`    Avg Blossom Quality:           ${scoreColor(result.stats.avgBlossomQuality)}`)
  lines.push(`    Avg Root Depth:                ${scoreColor(result.stats.avgRootDepth)}`)
  lines.push(`    Avg Pollination Rate:          ${scoreColor(result.stats.avgPollinationRate)}`)
  lines.push(`    Avg Seasonal Adaptation:       ${scoreColor(result.stats.avgSeasonalAdaptation)}`)
  lines.push(`    Avg Garden Health:             ${scoreColor(result.stats.avgGardenHealth)}`)
  lines.push(`    Gardener Grade:                ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(46, 139, 87)('  Condition Counts:'))
  lines.push(`    Cherry Blossom Avenue:         ${result.stats.cherryBlossomAvenueCount}`)
  lines.push(`    Tulip Field:                   ${result.stats.tulipFieldCount}`)
  lines.push(`    Wildflower Meadow:             ${result.stats.wildflowerMeadowCount}`)
  lines.push(`    Garden Bed:                    ${result.stats.gardenBedCount}`)
  lines.push(`    Window Box:                    ${result.stats.windowBoxCount}`)
  lines.push(`    Compost:                       ${result.stats.compostCount}`)
  lines.push('')

  if (result.stats.bestBlossom) {
    lines.push(chalk.rgb(46, 139, 87)('  Highlights:'))
    lines.push(`    Best Blossom:       ${result.stats.bestBlossom}`)
    lines.push(`    Most Vital:         ${result.stats.mostVital}`)
    lines.push(`    Most Beautiful:     ${result.stats.mostBeautiful}`)
    lines.push(`    Deepest Rooted:     ${result.stats.deepestRooted}`)
    lines.push(`    Most Reusable:      ${result.stats.mostReusable}`)
    lines.push(`    Healthiest:         ${result.stats.healthiest}`)
    lines.push('')
  }

  if (verbose && result.blossoms.length > 0) {
    lines.push(chalk.rgb(46, 139, 87)('  Per-File Details:'))
    for (const blossom of result.blossoms) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(blossom.file)}`)
      lines.push(`      Score: ${scoreColor(blossom.qualityScore)}  Condition: ${conditionColor(blossom.condition)}`)
      lines.push(`      Bud: ${budTypeColor(blossom.bud.type)}(${blossom.budVitality})  Blossom: ${blossom.blossom.form}(${blossom.blossomQuality})  Root: ${blossom.root.system}(${blossom.rootDepth})`)
      lines.push(`      Pollination: ${blossom.pollination.vector}(${blossom.pollinationRate})  Adaptation: ${blossom.adaptation.season}(${blossom.seasonalAdaptation})  Health: ${blossom.health.status}(${blossom.gardenHealth})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(46, 139, 87)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 183, 197)('✿')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
