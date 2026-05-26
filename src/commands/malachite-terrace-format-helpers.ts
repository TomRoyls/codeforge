import chalk from 'chalk'

import type { ArtisanGrade, MalachiteBand, MalachiteCondition, MalachitePillar, MalachiteTerraceResult, PillarCondition, PillarType } from './malachite-terrace-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(30, 140, 80)(String(score))
  if (score >= 75) return chalk.rgb(25, 120, 65)(String(score))
  if (score >= 60) return chalk.rgb(20, 100, 55)(String(score))
  if (score >= 40) return chalk.rgb(15, 75, 40)(String(score))
  if (score >= 20) return chalk.rgb(10, 50, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorMalachiteCondition('malachite-masterpiece') */
export function colorMalachiteCondition(condition: MalachiteCondition | string): string {
  switch (condition) {
    case 'malachite-masterpiece': return chalk.rgb(30, 140, 80)('malachite-masterpiece')
    case 'emerald-band': return chalk.rgb(25, 120, 65)('emerald-band')
    case 'proper-malachite': return chalk.rgb(20, 100, 55)('proper-malachite')
    case 'green-stone': return chalk.rgb(15, 75, 40)('green-stone')
    case 'raw-mineral': return chalk.rgb(10, 50, 30)('raw-mineral')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorPillarType('hermitage-column') */
export function colorPillarType(type: PillarType | string): string {
  switch (type) {
    case 'hermitage-column': return chalk.rgb(30, 140, 80)('hermitage-column')
    case 'grand-pillar': return chalk.rgb(25, 120, 65)('grand-pillar')
    case 'proper-column': return chalk.rgb(20, 100, 55)('proper-column')
    case 'stone-post': return chalk.rgb(15, 75, 40)('stone-post')
    case 'wooden-stick': return chalk.rgb(10, 50, 30)('wooden-stick')
    case 'no-pillar': return chalk.gray('no-pillar')
    default: return chalk.gray(String(type))
  }
}

/** @example colorPillarCondition('malachite-palace') */
export function colorPillarCondition(condition: PillarCondition | string): string {
  switch (condition) {
    case 'malachite-palace': return chalk.rgb(30, 140, 80)('malachite-palace')
    case 'green-hall': return chalk.rgb(25, 120, 65)('green-hall')
    case 'proper-terrace': return chalk.rgb(20, 100, 55)('proper-terrace')
    case 'stone-patio': return chalk.rgb(15, 75, 40)('stone-patio')
    case 'dirt-yard': return chalk.rgb(10, 50, 30)('dirt-yard')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorArtisanGrade('master-lapidary') */
export function colorArtisanGrade(grade: ArtisanGrade | string): string {
  switch (grade) {
    case 'master-lapidary': return chalk.rgb(30, 140, 80)('master-lapidary')
    case 'expert-gem-cutter': return chalk.rgb(25, 120, 65)('expert-gem-cutter')
    case 'proper-mason': return chalk.rgb(20, 100, 55)('proper-mason')
    case 'apprentice': return chalk.rgb(15, 75, 40)('apprentice')
    case 'novice': return chalk.rgb(10, 50, 30)('novice')
    case 'stone-breaker': return chalk.gray('stone-breaker')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBandTable(band) */
export function formatBandTable(band: MalachiteBand): string {
  const lines: string[] = [
    chalk.bold(`Malachite Band: ${band.file}`),
    '',
    `  Verdant Pattern:    ${colorScore(band.verdantPattern)}  ${chalk.dim(`(${band.patterning.band})`)}`,
    `  Gem Clarity:        ${colorScore(band.gemClarity)}  ${chalk.dim(`(${band.revealing.gem})`)}`,
    `  Banded Precision:   ${colorScore(band.bandedPrecision)}  ${chalk.dim(`(${band.layering.cut})`)}`,
    `  Copper Resilience:  ${colorScore(band.copperResilience)}  ${chalk.dim(`(${band.hardening.copper})`)}`,
    `  Mineral Wisdom:     ${colorScore(band.mineralWisdom)}  ${chalk.dim(`(${band.knowing.depth})`)}`,
    '',
    `  Quality Score: ${colorScore(band.qualityScore)}  ${chalk.dim(`(${band.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBandsTable(bands) */
export function formatBandsTable(bands: MalachiteBand[]): string {
  if (bands.length === 0) return chalk.dim('No malachite bands found')
  const lines: string[] = [chalk.bold('Malachite Bands'), '']
  for (const b of bands) {
    lines.push(`  ${chalk.rgb(30, 140, 80)(b.file)}  Pat:${colorScore(b.verdantPattern)}  Prec:${colorScore(b.bandedPrecision)}  Score:${colorScore(b.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatPillarTable(pillar) */
export function formatPillarTable(pillar: MalachitePillar): string {
  const lines: string[] = [
    chalk.bold(`Malachite Pillar: ${pillar.directory}`),
    '',
    `  Bands:              ${pillar.bands.length}`,
    `  Avg Pattern:        ${colorScore(pillar.avgPattern)}`,
    `  Avg Precision:      ${colorScore(pillar.avgPrecision)}`,
    `  Avg Wisdom:         ${colorScore(pillar.avgWisdom)}`,
    `  Masterpieces:       ${pillar.malachiteMasterpieceCount}`,
    `  Pillar Type:        ${colorPillarType(pillar.pillarType)}`,
    `  Condition:          ${colorPillarCondition(pillar.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatPillarsTable(pillars) */
export function formatPillarsTable(pillars: MalachitePillar[]): string {
  if (pillars.length === 0) return chalk.dim('No malachite pillars found')
  const lines: string[] = [chalk.bold('Malachite Pillars'), '']
  for (const p of pillars) {
    lines.push(`  ${chalk.rgb(30, 140, 80)(p.directory)}  ${colorScore(p.avgPattern)}  ${colorPillarCondition(p.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: MalachiteTerraceResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Malachite Terrace Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Pillars:          ${stats.totalPillars}`,
    `  Avg Verdant Pattern:    ${colorScore(stats.avgVerdantPattern)}`,
    `  Avg Gem Clarity:        ${colorScore(stats.avgGemClarity)}`,
    `  Avg Banded Precision:   ${colorScore(stats.avgBandedPrecision)}`,
    `  Avg Copper Resilience:  ${colorScore(stats.avgCopperResilience)}`,
    `  Avg Mineral Wisdom:     ${colorScore(stats.avgMineralWisdom)}`,
    `  Malachite Masterpieces: ${stats.malachiteMasterpieceCount}`,
    `  Emerald Bands:          ${stats.emeraldBandCount}`,
    `  Proper Malachite:       ${stats.properMalachiteCount}`,
    `  Green Stones:           ${stats.greenStoneCount}`,
    `  Raw Minerals:           ${stats.rawMineralCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  High Pattern Count:     ${stats.hasHighPatternCount}`,
    `  High Clarity Count:     ${stats.hasHighClarityCount}`,
    `  High Precision Count:   ${stats.hasHighPrecisionCount}`,
    `  High Resilience Count:  ${stats.hasHighResilienceCount}`,
    `  High Wisdom Count:      ${stats.hasHighWisdomCount}`,
    `  Overall Beauty:         ${colorScore(stats.overallBeauty)}`,
    `  Artisan Grade:          ${colorArtisanGrade(stats.artisanGrade)}`,
    `  Best Band:              ${stats.bestBand || 'N/A'}`,
    `  Most Patterned:         ${stats.mostPatterned || 'N/A'}`,
    `  Clearest:               ${stats.clearest || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(30, 140, 80)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: MalachiteTerraceResult): string {
  const lines: string[] = [
    chalk.bold('Malachite Terrace Analysis'),
    '',
    formatBandsTable(result.bands),
    '',
    formatPillarsTable(result.pillars),
    '',
    chalk.bold('Gallery Overview'),
    '',
    `  Avg Pattern:     ${colorScore(result.gallery.avgPattern)}`,
    `  Avg Precision:   ${colorScore(result.gallery.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(result.gallery.avgWisdom)}`,
    `  Overall Beauty:  ${colorScore(result.gallery.overallBeauty)}`,
    `  Is Malachite:    ${result.gallery.isMalachite ? chalk.rgb(30, 140, 80)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: MalachiteTerraceResult): string {
  return JSON.stringify(result, null, 2)
}
