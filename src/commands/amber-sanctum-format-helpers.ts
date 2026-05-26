import chalk from 'chalk'

import type { AmberCollection, AmberSanctumResult, AmberSpecimen, CollectionCondition } from './amber-sanctum-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 191, 0)(String(score))
  if (score >= 75) return chalk.rgb(230, 170, 30)(String(score))
  if (score >= 60) return chalk.rgb(200, 150, 50)(String(score))
  if (score >= 40) return chalk.rgb(170, 120, 40)(String(score))
  if (score >= 20) return chalk.rgb(140, 100, 30)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('golden-palace') */
export function colorCondition(condition: CollectionCondition | string): string {
  switch (condition) {
    case 'golden-palace': return chalk.rgb(255, 191, 0)('golden-palace')
    case 'amber-vault': return chalk.rgb(230, 170, 30)('amber-vault')
    case 'proper-museum': return chalk.rgb(200, 150, 50)('proper-museum')
    case 'dusty-attic': return chalk.rgb(170, 120, 40)('dusty-attic')
    case 'empty-room': return chalk.rgb(140, 100, 30)('empty-room')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatSpecimenTable(specimen) */
export function formatSpecimenTable(specimen: AmberSpecimen): string {
  const lines: string[] = [
    chalk.bold(`Amber Specimen: ${specimen.file}`),
    '',
    `  Preservation Power:   ${colorScore(specimen.preservationPower)}  ${chalk.dim(`(${specimen.preserving.fossil})`)}`,
    `  Golden Sanctuary:     ${colorScore(specimen.goldenSanctuary)}  ${chalk.dim(`(${specimen.sheltering.haven})`)}`,
    `  Resin Fortitude:      ${colorScore(specimen.resinFortitude)}  ${chalk.dim(`(${specimen.fortifying.hardness})`)}`,
    `  Amber Clarity:        ${colorScore(specimen.amberClarity)}  ${chalk.dim(`(${specimen.revealing.transparency})`)}`,
    `  Ancient Wisdom:       ${colorScore(specimen.ancientWisdom)}  ${chalk.dim(`(${specimen.knowing.epoch})`)}`,
    '',
    `  Quality Score: ${colorScore(specimen.qualityScore)}  ${chalk.dim(`(${specimen.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatSpecimensTable(specimens) */
export function formatSpecimensTable(specimens: AmberSpecimen[]): string {
  if (specimens.length === 0) return chalk.dim('No amber specimens found')
  const lines: string[] = [chalk.bold('Amber Specimens'), '']
  for (const sp of specimens) {
    lines.push(`  ${chalk.rgb(255, 191, 0)(sp.file)}  Power:${colorScore(sp.preservationPower)}  Sanctuary:${colorScore(sp.goldenSanctuary)}  Score:${colorScore(sp.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatCollectionTable(collection) */
export function formatCollectionTable(collection: AmberCollection): string {
  const lines: string[] = [
    chalk.bold(`Amber Collection: ${collection.directory}`),
    '',
    `  Specimens:            ${collection.specimens.length}`,
    `  Avg Power:            ${colorScore(collection.avgPower)}`,
    `  Avg Fortitude:        ${colorScore(collection.avgFortitude)}`,
    `  Avg Wisdom:           ${colorScore(collection.avgWisdom)}`,
    `  Masterpieces:         ${collection.amberMasterpieceCount}`,
    `  Collection Type:      ${collection.collectionType}`,
    `  Condition:            ${colorCondition(collection.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatCollectionsTable(collections) */
export function formatCollectionsTable(collections: AmberCollection[]): string {
  if (collections.length === 0) return chalk.dim('No amber collections found')
  const lines: string[] = [chalk.bold('Amber Collections'), '']
  for (const c of collections) {
    lines.push(`  ${chalk.rgb(255, 191, 0)(c.directory)}  ${colorScore(c.avgPower)}  ${colorCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: AmberSanctumResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Amber Sanctum Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Collections:        ${stats.totalCollections}`,
    `  Avg Preservation Power:   ${colorScore(stats.avgPreservationPower)}`,
    `  Avg Golden Sanctuary:     ${colorScore(stats.avgGoldenSanctuary)}`,
    `  Avg Resin Fortitude:      ${colorScore(stats.avgResinFortitude)}`,
    `  Avg Amber Clarity:        ${colorScore(stats.avgAmberClarity)}`,
    `  Avg Ancient Wisdom:       ${colorScore(stats.avgAncientWisdom)}`,
    `  Amber Masterpieces:       ${stats.amberMasterpieceCount}`,
    `  Golden Specimens:         ${stats.goldenSpecimenCount}`,
    `  Proper Amber:             ${stats.properAmberCount}`,
    `  Cloudy Resin:             ${stats.cloudyResinCount}`,
    `  Raw Sap:                  ${stats.rawSapCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Preservation:     ${colorScore(stats.overallPreservation)}`,
    `  Curator Grade:            ${stats.curatorGrade}`,
    `  Best Specimen:            ${stats.bestSpecimen || 'N/A'}`,
    `  Most Preserved:           ${stats.mostPreserved || 'N/A'}`,
    `  Safest:                   ${stats.safest || 'N/A'}`,
    `  Toughest:                 ${stats.toughest || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 191, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: AmberSanctumResult): string {
  const lines: string[] = [
    chalk.bold('Amber Sanctum Analysis'),
    '',
    formatSpecimensTable(result.specimens),
    '',
    formatCollectionsTable(result.collections),
    '',
    chalk.bold('Sanctum Overview'),
    '',
    `  Avg Power:             ${colorScore(result.sanctum.avgPower)}`,
    `  Avg Fortitude:         ${colorScore(result.sanctum.avgFortitude)}`,
    `  Avg Wisdom:            ${colorScore(result.sanctum.avgWisdom)}`,
    `  Overall Preservation:  ${colorScore(result.sanctum.overallPreservation)}`,
    `  Is Amber:              ${result.sanctum.isAmber ? chalk.rgb(255, 191, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: AmberSanctumResult): string {
  return JSON.stringify(result, null, 2)
}
