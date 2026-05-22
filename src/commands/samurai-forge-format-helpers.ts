import chalk from 'chalk'

import type { SamuraiForgeResult } from './samurai-forge-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('masterpiece') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'masterpiece': return chalk.rgb(46, 204, 113).bold(condition)
    case 'masterwork': return chalk.rgb(52, 152, 219)(condition)
    case 'fine-blade': return chalk.rgb(155, 89, 182)(condition)
    case 'serviceable': return chalk.rgb(241, 196, 15)(condition)
    case 'practice-blade': return chalk.rgb(230, 126, 34)(condition)
    case 'scrap-iron': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('divine-smith') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'divine-smith': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-smith': return chalk.rgb(52, 152, 219)(grade)
    case 'journeyman-smith': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice-smith': return chalk.rgb(241, 196, 15)(grade)
    case 'village-smith': return chalk.rgb(230, 126, 34)(grade)
    case 'scrap-collector': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example forgeTypeColor('imperial-armory') returns colored string */
export function forgeTypeColor(forgeType: string): string {
  switch (forgeType) {
    case 'imperial-armory': return chalk.rgb(46, 204, 113)(forgeType)
    case 'master-forge': return chalk.rgb(52, 152, 219)(forgeType)
    case 'village-forge': return chalk.rgb(155, 89, 182)(forgeType)
    case 'field-forge': return chalk.rgb(241, 196, 15)(forgeType)
    case 'backyard-anvil': return chalk.rgb(230, 126, 34)(forgeType)
    case 'scrap-heap': return chalk.rgb(231, 76, 60)(forgeType)
    default: return forgeType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatSamuraiForgeJson(result) returns JSON string */
export function formatSamuraiForgeJson(result: SamuraiForgeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatSamuraiForgeTable(result, verbose) returns formatted string */
export function formatSamuraiForgeTable(result: SamuraiForgeResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Samurai Forge Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Armory Overview:'))
  lines.push(`    Overall Quality: ${scoreColor(result.armory.overallQuality)}`)
  lines.push(`    Avg Sharpness:   ${scoreColor(result.armory.avgSharpness)}`)
  lines.push(`    Avg Temper:      ${scoreColor(result.armory.avgTemper)}`)
  lines.push(`    Avg Spirit:      ${scoreColor(result.armory.avgSpirit)}`)
  lines.push(`    Masterwork:      ${result.armory.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:       ${result.stats.totalFiles}`)
  lines.push(`    Total Clusters:    ${result.stats.totalClusters}`)
  lines.push(`    Masterpiece:       ${result.stats.masterpieceCount}`)
  lines.push(`    Masterwork:        ${result.stats.masterworkCount}`)
  lines.push(`    Fine Blade:        ${result.stats.fineBladeCount}`)
  lines.push(`    Serviceable:       ${result.stats.serviceableCount}`)
  lines.push(`    Practice Blade:    ${result.stats.practiceBladeCount}`)
  lines.push(`    Scrap Iron:        ${result.stats.scrapIronCount}`)
  lines.push(`    Razor Sharp:       ${result.stats.isRazorSharpCount}`)
  lines.push(`    Properly Tempered: ${result.stats.isProperlyTemperedCount}`)
  lines.push(`    Well Refined:      ${result.stats.isWellRefinedCount}`)
  lines.push(`    Clear Boundaries:  ${result.stats.hasClearBoundariesCount}`)
  lines.push(`    Well Encapsulated: ${result.stats.isWellEncapsulatedCount}`)
  lines.push(`    Disciplined:       ${result.stats.hasDisciplineCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Smith Grade:       ${gradeColor(result.stats.smithGrade)}`)
  lines.push(`    Best Blade:        ${result.stats.bestBlade || 'N/A'}`)
  lines.push(`    Sharpest:          ${result.stats.sharpest || 'N/A'}`)
  lines.push(`    Best Tempered:     ${result.stats.bestTempered || 'N/A'}`)
  lines.push(`    Best Folded:       ${result.stats.bestFolded || 'N/A'}`)
  lines.push(`    Best Hamon:        ${result.stats.bestHamon || 'N/A'}`)
  lines.push(`    Most Disciplined:  ${result.stats.mostDisciplined || 'N/A'}`)
  lines.push('')

  if (verbose && result.blades.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Blade Breakdown:'))
    for (const blade of result.blades) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(blade.file)}`)
      lines.push(`      Condition:     ${conditionColor(blade.condition)}`)
      lines.push(`      Quality Score: ${scoreColor(blade.qualityScore)}`)
      lines.push(`      Sharpness:     ${scoreColor(blade.bladeSharpness)} (${blade.sharpness.grade})`)
      lines.push(`      Temper:        ${scoreColor(blade.steelTemper)} (${blade.temper.method})`)
      lines.push(`      Folding:       ${scoreColor(blade.foldingTechnique)} (${blade.folding.technique})`)
      lines.push(`      Hamon:         ${scoreColor(blade.hamonLine)} (${blade.hamon.style})`)
      lines.push(`      Saya:          ${scoreColor(blade.sayaFit)} (${blade.saya.material})`)
      lines.push(`      Bushido:       ${scoreColor(blade.bushidoSpirit)} (${blade.bushido.virtue})`)
    }
    lines.push('')
  }

  if (result.clusters.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Clusters:'))
    for (const cluster of result.clusters) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cluster.directory)} — ${forgeTypeColor(cluster.forgeType)} (${cluster.condition})`)
      lines.push(`      Blades: ${cluster.blades.length}, Masterpiece: ${cluster.masterpieceCount}, Razor: ${cluster.razorSharpCount}, Disciplined: ${cluster.disciplinedCount}`)
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
