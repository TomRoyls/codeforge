import chalk from 'chalk'

import type { ArchivistGrade, CollectionCondition, CollectionType, LapisCollection, LapisCondition, LapisTablet, LapisArchiveResult } from './lapis-archive-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(38, 70, 150)(String(score))
  if (score >= 75) return chalk.rgb(32, 60, 130)(String(score))
  if (score >= 60) return chalk.rgb(26, 50, 110)(String(score))
  if (score >= 40) return chalk.rgb(20, 40, 90)(String(score))
  if (score >= 20) return chalk.rgb(14, 30, 70)(String(score))
  return chalk.gray(String(score))
}

/** @example colorLapisCondition('lapis-masterpiece') */
export function colorLapisCondition(condition: LapisCondition | string): string {
  switch (condition) {
    case 'lapis-masterpiece': return chalk.rgb(38, 70, 150)('lapis-masterpiece')
    case 'ultramarine-gem': return chalk.rgb(32, 60, 130)('ultramarine-gem')
    case 'proper-lapis': return chalk.rgb(26, 50, 110)('proper-lapis')
    case 'dyed-stone': return chalk.rgb(20, 40, 90)('dyed-stone')
    case 'blue-glass': return chalk.rgb(14, 30, 70)('blue-glass')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCollectionType('royal-archive') */
export function colorCollectionType(type: CollectionType | string): string {
  switch (type) {
    case 'royal-archive': return chalk.rgb(38, 70, 150)('royal-archive')
    case 'temple-library': return chalk.rgb(32, 60, 130)('temple-library')
    case 'proper-collection': return chalk.rgb(26, 50, 110)('proper-collection')
    case 'private-scrolls': return chalk.rgb(20, 40, 90)('private-scrolls')
    case 'empty-shelf': return chalk.rgb(14, 30, 70)('empty-shelf')
    case 'no-collection': return chalk.gray('no-collection')
    default: return chalk.gray(String(type))
  }
}

/** @example colorCollectionCondition('lapis-palace') */
export function colorCollectionCondition(condition: CollectionCondition | string): string {
  switch (condition) {
    case 'lapis-palace': return chalk.rgb(38, 70, 150)('lapis-palace')
    case 'blue-vault': return chalk.rgb(32, 60, 130)('blue-vault')
    case 'proper-archive': return chalk.rgb(26, 50, 110)('proper-archive')
    case 'stone-room': return chalk.rgb(20, 40, 90)('stone-room')
    case 'dusty-corner': return chalk.rgb(14, 30, 70)('dusty-corner')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorArchivistGrade('master-archivist') */
export function colorArchivistGrade(grade: ArchivistGrade | string): string {
  switch (grade) {
    case 'master-archivist': return chalk.rgb(38, 70, 150)('master-archivist')
    case 'royal-scribe': return chalk.rgb(32, 60, 130)('royal-scribe')
    case 'proper-librarian': return chalk.rgb(26, 50, 110)('proper-librarian')
    case 'apprentice': return chalk.rgb(20, 40, 90)('apprentice')
    case 'novice': return chalk.rgb(14, 30, 70)('novice')
    case 'scroll-thief': return chalk.gray('scroll-thief')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatTabletTable(tablet) */
export function formatTabletTable(tablet: LapisTablet): string {
  const lines: string[] = [
    chalk.bold(`Lapis Tablet: ${tablet.file}`),
    '',
    `  Celestial Blue Clarity:  ${colorScore(tablet.celestialBlueClarity)}  ${chalk.dim(`(${tablet.illuminating.blue})`)}`,
    `  Historical Precision:   ${colorScore(tablet.historicalPrecision)}  ${chalk.dim(`(${tablet.recording.record})`)}`,
    `  Pigment Endurance:      ${colorScore(tablet.pigmentEndurance)}  ${chalk.dim(`(${tablet.preserving.color})`)}`,
    `  Tablet Resilience:      ${colorScore(tablet.tabletResilience)}  ${chalk.dim(`(${tablet.surviving.stone})`)}`,
    `  Ancient Wisdom:         ${colorScore(tablet.ancientWisdom)}  ${chalk.dim(`(${tablet.knowing.archive})`)}`,
    '',
    `  Quality Score: ${colorScore(tablet.qualityScore)}  ${chalk.dim(`(${tablet.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatTabletsTable(tablets) */
export function formatTabletsTable(tablets: LapisTablet[]): string {
  if (tablets.length === 0) return chalk.dim('No lapis tablets found')
  const lines: string[] = [chalk.bold('Lapis Tablets'), '']
  for (const t of tablets) {
    lines.push(`  ${chalk.rgb(38, 70, 150)(t.file)}  Clr:${colorScore(t.celestialBlueClarity)}  Prec:${colorScore(t.historicalPrecision)}  Score:${colorScore(t.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatCollectionTable(collection) */
export function formatCollectionTable(collection: LapisCollection): string {
  const lines: string[] = [
    chalk.bold(`Lapis Collection: ${collection.directory}`),
    '',
    `  Tablets:                ${collection.tablets.length}`,
    `  Avg Clarity:            ${colorScore(collection.avgClarity)}`,
    `  Avg Precision:          ${colorScore(collection.avgPrecision)}`,
    `  Avg Wisdom:             ${colorScore(collection.avgWisdom)}`,
    `  Masterpieces:           ${collection.lapisMasterpieceCount}`,
    `  Collection Type:        ${colorCollectionType(collection.collectionType)}`,
    `  Condition:              ${colorCollectionCondition(collection.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCollectionsTable(collections) */
export function formatCollectionsTable(collections: LapisCollection[]): string {
  if (collections.length === 0) return chalk.dim('No lapis collections found')
  const lines: string[] = [chalk.bold('Lapis Collections'), '']
  for (const c of collections) {
    lines.push(`  ${chalk.rgb(38, 70, 150)(c.directory)}  ${colorScore(c.avgClarity)}  ${colorCollectionCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: LapisArchiveResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Lapis Archive Statistics'),
    '',
    `  Total Files:                  ${stats.totalFiles}`,
    `  Total Collections:            ${stats.totalCollections}`,
    `  Avg Celestial Blue Clarity:   ${colorScore(stats.avgCelestialBlueClarity)}`,
    `  Avg Historical Precision:     ${colorScore(stats.avgHistoricalPrecision)}`,
    `  Avg Pigment Endurance:        ${colorScore(stats.avgPigmentEndurance)}`,
    `  Avg Tablet Resilience:        ${colorScore(stats.avgTabletResilience)}`,
    `  Avg Ancient Wisdom:           ${colorScore(stats.avgAncientWisdom)}`,
    `  Lapis Masterpieces:           ${stats.lapisMasterpieceCount}`,
    `  Ultramarine Gems:             ${stats.ultramarineGemCount}`,
    `  Proper Lapis:                 ${stats.properLapisCount}`,
    `  Dyed Stones:                  ${stats.dyedStoneCount}`,
    `  Blue Glass:                   ${stats.blueGlassCount}`,
    `  Void:                         ${stats.voidCount}`,
    `  Overall Preservation:         ${colorScore(stats.overallPreservation)}`,
    `  Archivist Grade:              ${colorArchivistGrade(stats.archivistGrade)}`,
    `  Best Tablet:                  ${stats.bestTablet || 'N/A'}`,
    `  Clearest:                     ${stats.clearest || 'N/A'}`,
    `  Most Precise:                 ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:                ${stats.mostEnduring || 'N/A'}`,
    `  Most Resilient:               ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                       ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(38, 70, 150)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: LapisArchiveResult): string {
  const lines: string[] = [
    chalk.bold('Lapis Archive Analysis'),
    '',
    formatTabletsTable(result.tablets),
    '',
    formatCollectionsTable(result.collections),
    '',
    chalk.bold('Library Overview'),
    '',
    `  Avg Clarity:             ${colorScore(result.library.avgClarity)}`,
    `  Avg Precision:           ${colorScore(result.library.avgPrecision)}`,
    `  Avg Wisdom:              ${colorScore(result.library.avgWisdom)}`,
    `  Overall Preservation:    ${colorScore(result.library.overallPreservation)}`,
    `  Is Lapis:                ${result.library.isLapis ? chalk.rgb(38, 70, 150)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: LapisArchiveResult): string {
  return JSON.stringify(result, null, 2)
}
