import chalk from 'chalk'

import type { ObsidianBladeResult } from './obsidian-blade-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('macuahuitl') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'macuahuitl': return chalk.rgb(46, 204, 113).bold(condition)
    case 'scalpel': return chalk.rgb(52, 152, 219)(condition)
    case 'knife': return chalk.rgb(155, 89, 182)(condition)
    case 'spear-point': return chalk.rgb(241, 196, 15)(condition)
    case 'scraper': return chalk.rgb(230, 126, 34)(condition)
    case 'gravel': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-artisan') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-artisan': return chalk.rgb(46, 204, 113).bold(grade)
    case 'expert-flintknapper': return chalk.rgb(52, 152, 219)(grade)
    case 'skilled-crafter': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(241, 196, 15)(grade)
    case 'novice': return chalk.rgb(230, 126, 34)(grade)
    case 'clumsy': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example cacheTypeColor('temple-vault') returns colored string */
export function cacheTypeColor(cacheType: string): string {
  switch (cacheType) {
    case 'temple-vault': return chalk.rgb(46, 204, 113)(cacheType)
    case 'workshop': return chalk.rgb(52, 152, 219)(cacheType)
    case 'quarry': return chalk.rgb(155, 89, 182)(cacheType)
    case 'worksite': return chalk.rgb(241, 196, 15)(cacheType)
    case 'midden': return chalk.rgb(230, 126, 34)(cacheType)
    case 'talus': return chalk.rgb(231, 76, 60)(cacheType)
    default: return cacheType
  }
}

/** @example edgeGradeColor('monomolecular') returns bold string */
export function edgeGradeColor(grade: string): string {
  switch (grade) {
    case 'monomolecular': return chalk.rgb(46, 204, 113).bold(grade)
    case 'surgical': return chalk.rgb(52, 152, 219)(grade)
    case 'razor': return chalk.rgb(155, 89, 182)(grade)
    case 'sharp': return chalk.rgb(241, 196, 15)(grade)
    case 'dull': return chalk.rgb(230, 126, 34)(grade)
    case 'broken': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatObsidianBladeJson(result) returns JSON string */
export function formatObsidianBladeJson(result: ObsidianBladeResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatObsidianBladeTable(result, verbose) returns formatted string */
export function formatObsidianBladeTable(result: ObsidianBladeResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Obsidian Blade Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Quarry Overview:'))
  lines.push(`    Overall Quality:      ${scoreColor(result.quarry.overallQuality)}`)
  lines.push(`    Avg Sharpness:        ${scoreColor(result.quarry.avgSharpness)}`)
  lines.push(`    Avg Purity:           ${scoreColor(result.quarry.avgPurity)}`)
  lines.push(`    Avg Mastery:          ${scoreColor(result.quarry.avgMastery)}`)
  lines.push(`    Masterwork:           ${result.quarry.isMasterwork ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Caches:             ${result.stats.totalCaches}`)
  lines.push(`    Avg Edge Sharpness:       ${scoreColor(result.stats.avgEdgeSharpness)}`)
  lines.push(`    Avg Fracture Quality:     ${scoreColor(result.stats.avgFractureQuality)}`)
  lines.push(`    Avg Volcanic Purity:      ${scoreColor(result.stats.avgVolcanicPurity)}`)
  lines.push(`    Avg Conchoidal Beauty:    ${scoreColor(result.stats.avgConchoidalBeauty)}`)
  lines.push(`    Avg Surgical Precision:   ${scoreColor(result.stats.avgSurgicalPrecision)}`)
  lines.push(`    Avg Blade Mastery:        ${scoreColor(result.stats.avgBladeMastery)}`)
  lines.push(`    Macuahuitl:               ${result.stats.macuahuitlCount}`)
  lines.push(`    Scalpel:                  ${result.stats.scalpelCount}`)
  lines.push(`    Knife:                    ${result.stats.knifeCount}`)
  lines.push(`    Spear Point:              ${result.stats.spearPointCount}`)
  lines.push(`    Scraper:                  ${result.stats.scraperCount}`)
  lines.push(`    Gravel:                   ${result.stats.gravelCount}`)
  lines.push(`    Mono-Sharp:               ${result.stats.isMonoSharpCount}`)
  lines.push(`    Clean Break:              ${result.stats.hasCleanBreakCount}`)
  lines.push(`    Pure:                     ${result.stats.isPureCount}`)
  lines.push(`    Beautiful:                ${result.stats.isBeautifulCount}`)
  lines.push(`    Surgical Precision:       ${result.stats.hasSurgicalPrecisionCount}`)
  lines.push(`    Masterwork:               ${result.stats.isMasterworkCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Artisan Grade:            ${gradeColor(result.stats.artisanGrade)}`)
  lines.push(`    Best Shard:               ${result.stats.bestShard || 'N/A'}`)
  lines.push(`    Sharpest:                 ${result.stats.sharpest || 'N/A'}`)
  lines.push(`    Cleanest:                 ${result.stats.cleanest || 'N/A'}`)
  lines.push(`    Purest:                   ${result.stats.purest || 'N/A'}`)
  lines.push(`    Most Beautiful:           ${result.stats.mostBeautiful || 'N/A'}`)
  lines.push(`    Most Precise:             ${result.stats.mostPrecise || 'N/A'}`)
  lines.push('')

  if (verbose && result.shards.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Shard Breakdown:'))
    for (const sh of result.shards) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(sh.file)}`)
      lines.push(`      Condition:             ${conditionColor(sh.condition)}`)
      lines.push(`      Quality Score:         ${scoreColor(sh.qualityScore)}`)
      lines.push(`      Edge:                  ${scoreColor(sh.edgeSharpness)} (${edgeGradeColor(sh.edge.grade)})`)
      lines.push(`      Fracture:              ${scoreColor(sh.fractureQuality)} (${sh.fracture.type})`)
      lines.push(`      Purity:                ${scoreColor(sh.volcanicPurity)} (${sh.purity.source})`)
      lines.push(`      Beauty:                ${scoreColor(sh.conchoidalBeauty)} (${sh.beauty.color})`)
      lines.push(`      Precision:             ${scoreColor(sh.surgicalPrecision)} (${sh.precision.craft})`)
      lines.push(`      Mastery:               ${scoreColor(sh.bladeMastery)} (${sh.mastery.rank})`)
    }
    lines.push('')
  }

  if (result.caches.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Caches:'))
    for (const cache of result.caches) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(cache.directory)} — ${cacheTypeColor(cache.cacheType)} (${cache.condition})`)
      lines.push(`      Shards: ${cache.shards.length}, Macuahuitl: ${cache.macuahuitlCount}, Mono-Sharp: ${cache.monoSharpCount}, Masterwork: ${cache.masterworkCount}`)
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
