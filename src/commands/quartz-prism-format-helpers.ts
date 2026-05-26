import chalk from 'chalk'

import type { FacetCondition, GeodeCondition, GeodeType, LapidaryGrade, QuartzFacet, QuartzGeode, QuartzPrismResult } from './quartz-prism-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(180, 220, 240)(String(score))
  if (score >= 75) return chalk.rgb(150, 200, 220)(String(score))
  if (score >= 60) return chalk.rgb(120, 180, 200)(String(score))
  if (score >= 40) return chalk.rgb(100, 150, 170)(String(score))
  if (score >= 20) return chalk.rgb(80, 120, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorFacetCondition('quartz-masterpiece') */
export function colorFacetCondition(condition: FacetCondition | string): string {
  switch (condition) {
    case 'quartz-masterpiece': return chalk.rgb(180, 220, 240)('quartz-masterpiece')
    case 'gem-quality': return chalk.rgb(150, 200, 220)('gem-quality')
    case 'proper-crystal': return chalk.rgb(120, 180, 200)('proper-crystal')
    case 'industrial-grade': return chalk.rgb(100, 150, 170)('industrial-grade')
    case 'raw-sand': return chalk.rgb(80, 120, 140)('raw-sand')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGeodeType('treasure-geode') */
export function colorGeodeType(type: GeodeType | string): string {
  switch (type) {
    case 'treasure-geode': return chalk.rgb(180, 220, 240)('treasure-geode')
    case 'crystal-cave': return chalk.rgb(150, 200, 220)('crystal-cave')
    case 'proper-cluster': return chalk.rgb(120, 180, 200)('proper-cluster')
    case 'small-nodule': return chalk.rgb(100, 150, 170)('small-nodule')
    case 'empty-rock': return chalk.rgb(80, 120, 140)('empty-rock')
    case 'no-geode': return chalk.gray('no-geode')
    default: return chalk.gray(String(type))
  }
}

/** @example colorGeodeCondition('crystal-palace') */
export function colorGeodeCondition(condition: GeodeCondition | string): string {
  switch (condition) {
    case 'crystal-palace': return chalk.rgb(180, 220, 240)('crystal-palace')
    case 'gem-cave': return chalk.rgb(150, 200, 220)('gem-cave')
    case 'proper-mine': return chalk.rgb(120, 180, 200)('proper-mine')
    case 'gravel-pit': return chalk.rgb(100, 150, 170)('gravel-pit')
    case 'sand-dune': return chalk.rgb(80, 120, 140)('sand-dune')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorLapidaryGrade('master-lapidary') */
export function colorLapidaryGrade(grade: LapidaryGrade | string): string {
  switch (grade) {
    case 'master-lapidary': return chalk.rgb(180, 220, 240)('master-lapidary')
    case 'crystal-cutter': return chalk.rgb(150, 200, 220)('crystal-cutter')
    case 'proper-gemologist': return chalk.rgb(120, 180, 200)('proper-gemologist')
    case 'apprentice': return chalk.rgb(100, 150, 170)('apprentice')
    case 'novice': return chalk.rgb(80, 120, 140)('novice')
    case 'rock-collector': return chalk.gray('rock-collector')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFacetTable(facet) */
export function formatFacetTable(facet: QuartzFacet): string {
  const lines: string[] = [
    chalk.bold(`Quartz Facet: ${facet.file}`),
    '',
    `  Crystalline Clarity:   ${colorScore(facet.crystallineClarity)}  ${chalk.dim(`(${facet.structuring.crystal})`)}`,
    `  Spectrum Refraction:   ${colorScore(facet.spectrumRefraction)}  ${chalk.dim(`(${facet.refracting.spectrum})`)}`,
    `  Facet Precision:       ${colorScore(facet.facetPrecision)}  ${chalk.dim(`(${facet.polishing.cut})`)}`,
    `  Vibration Purity:      ${colorScore(facet.vibrationPurity)}  ${chalk.dim(`(${facet.resonating.tone})`)}`,
    `  Mineral Wisdom:        ${colorScore(facet.mineralWisdom)}  ${chalk.dim(`(${facet.accumulating.depth})`)}`,
    '',
    `  Quality Score: ${colorScore(facet.qualityScore)}  ${chalk.dim(`(${facet.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFacetsTable(facets) */
export function formatFacetsTable(facets: QuartzFacet[]): string {
  if (facets.length === 0) return chalk.dim('No quartz facets found')
  const lines: string[] = [chalk.bold('Quartz Facets'), '']
  for (const f of facets) {
    lines.push(`  ${chalk.rgb(180, 220, 240)(f.file)}  Cla:${colorScore(f.crystallineClarity)}  Ref:${colorScore(f.spectrumRefraction)}  Score:${colorScore(f.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatGeodeTable(geode) */
export function formatGeodeTable(geode: QuartzGeode): string {
  const lines: string[] = [
    chalk.bold(`Quartz Geode: ${geode.directory}`),
    '',
    `  Facets:          ${geode.facets.length}`,
    `  Avg Clarity:     ${colorScore(geode.avgClarity)}`,
    `  Avg Precision:   ${colorScore(geode.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(geode.avgWisdom)}`,
    `  Masterpieces:    ${geode.quartzMasterpieceCount}`,
    `  Geode Type:      ${colorGeodeType(geode.geodeType)}`,
    `  Condition:       ${colorGeodeCondition(geode.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGeodesTable(geodes) */
export function formatGeodesTable(geodes: QuartzGeode[]): string {
  if (geodes.length === 0) return chalk.dim('No quartz geodes found')
  const lines: string[] = [chalk.bold('Quartz Geodes'), '']
  for (const g of geodes) {
    lines.push(`  ${chalk.rgb(180, 220, 240)(g.directory)}  ${colorScore(g.avgClarity)}  ${colorGeodeCondition(g.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: QuartzPrismResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Quartz Prism Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Geodes:             ${stats.totalGeodes}`,
    `  Avg Crystalline Clarity:  ${colorScore(stats.avgCrystallineClarity)}`,
    `  Avg Spectrum Refraction:  ${colorScore(stats.avgSpectrumRefraction)}`,
    `  Avg Facet Precision:      ${colorScore(stats.avgFacetPrecision)}`,
    `  Avg Vibration Purity:     ${colorScore(stats.avgVibrationPurity)}`,
    `  Avg Mineral Wisdom:       ${colorScore(stats.avgMineralWisdom)}`,
    `  Quartz Masterpieces:      ${stats.quartzMasterpieceCount}`,
    `  Gem Quality:              ${stats.gemQualityCount}`,
    `  Proper Crystal:           ${stats.properCrystalCount}`,
    `  Industrial Grade:         ${stats.industrialGradeCount}`,
    `  Raw Sand:                 ${stats.rawSandCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Brilliance:       ${colorScore(stats.overallBrilliance)}`,
    `  Lapidary Grade:           ${colorLapidaryGrade(stats.lapidaryGrade)}`,
    `  Best Facet:               ${stats.bestFacet || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Refractive:          ${stats.mostRefractive || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(180, 220, 240)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: QuartzPrismResult): string {
  const lines: string[] = [
    chalk.bold('Quartz Prism Analysis'),
    '',
    formatFacetsTable(result.facets),
    '',
    formatGeodesTable(result.geodes),
    '',
    chalk.bold('Spectrum Overview'),
    '',
    `  Avg Clarity:       ${colorScore(result.spectrum.avgClarity)}`,
    `  Avg Precision:     ${colorScore(result.spectrum.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(result.spectrum.avgWisdom)}`,
    `  Overall Brilliance: ${colorScore(result.spectrum.overallBrilliance)}`,
    `  Is Quartz:         ${result.spectrum.isQuartz ? chalk.rgb(180, 220, 240)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: QuartzPrismResult): string {
  return JSON.stringify(result, null, 2)
}
