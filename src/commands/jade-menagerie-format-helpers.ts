import chalk from 'chalk'

import type { CuratorGrade, GalleryCondition, GalleryType, JadeCondition, JadeCreature, JadeMenagerieResult } from './jade-menagerie-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(0, 168, 107)(String(score))
  if (score >= 75) return chalk.rgb(0, 145, 92)(String(score))
  if (score >= 60) return chalk.rgb(0, 122, 77)(String(score))
  if (score >= 40) return chalk.rgb(0, 100, 62)(String(score))
  if (score >= 20) return chalk.rgb(0, 78, 48)(String(score))
  return chalk.gray(String(score))
}

/** @example colorJadeCondition('jade-masterpiece') */
export function colorJadeCondition(condition: JadeCondition | string): string {
  switch (condition) {
    case 'jade-masterpiece': return chalk.rgb(0, 168, 107)('jade-masterpiece')
    case 'imperial-carving': return chalk.rgb(0, 145, 92)('imperial-carving')
    case 'proper-nephrite': return chalk.rgb(0, 122, 77)('proper-nephrite')
    case 'common-stone': return chalk.rgb(0, 100, 62)('common-stone')
    case 'raw-boulder': return chalk.rgb(0, 78, 48)('raw-boulder')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorGalleryType('imperial-collection') */
export function colorGalleryType(type: GalleryType | string): string {
  switch (type) {
    case 'imperial-collection': return chalk.rgb(0, 168, 107)('imperial-collection')
    case 'museum-grade': return chalk.rgb(0, 145, 92)('museum-grade')
    case 'proper-exhibit': return chalk.rgb(0, 122, 77)('proper-exhibit')
    case 'small-display': return chalk.rgb(0, 100, 62)('small-display')
    case 'empty-case': return chalk.rgb(0, 78, 48)('empty-case')
    case 'no-gallery': return chalk.gray('no-gallery')
    default: return chalk.gray(String(type))
  }
}

/** @example colorGalleryCondition('jade-palace') */
export function colorGalleryCondition(condition: GalleryCondition | string): string {
  switch (condition) {
    case 'jade-palace': return chalk.rgb(0, 168, 107)('jade-palace')
    case 'court-gallery': return chalk.rgb(0, 145, 92)('court-gallery')
    case 'proper-museum': return chalk.rgb(0, 122, 77)('proper-museum')
    case 'stone-workshop': return chalk.rgb(0, 100, 62)('stone-workshop')
    case 'empty-room': return chalk.rgb(0, 78, 48)('empty-room')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCuratorGrade('imperial-curator') */
export function colorCuratorGrade(grade: CuratorGrade | string): string {
  switch (grade) {
    case 'imperial-curator': return chalk.rgb(0, 168, 107)('imperial-curator')
    case 'museum-director': return chalk.rgb(0, 145, 92)('museum-director')
    case 'proper-keeper': return chalk.rgb(0, 122, 77)('proper-keeper')
    case 'apprentice': return chalk.rgb(0, 100, 62)('apprentice')
    case 'novice': return chalk.rgb(0, 78, 48)('novice')
    case 'street-vendor': return chalk.gray('street-vendor')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatCreatureTable(creature) */
export function formatCreatureTable(creature: JadeCreature): string {
  const lines: string[] = [
    chalk.bold(`Jade Creature: ${creature.file}`),
    '',
    `  Imperial Serenity:    ${colorScore(creature.imperialSerenity)}  ${chalk.dim(`(${creature.calming.composure})`)}`,
    `  Carving Mastery:      ${colorScore(creature.carvingMastery)}  ${chalk.dim(`(${creature.sculpting.craft})`)}`,
    `  Jade Purity:          ${colorScore(creature.jadePurity)}  ${chalk.dim(`(${creature.purifying.grade})`)}`,
    `  Dynasty Continuity:   ${colorScore(creature.dynastyContinuity)}  ${chalk.dim(`(${creature.continuing.era})`)}`,
    `  Nephrite Wisdom:      ${colorScore(creature.nephriteWisdom)}  ${chalk.dim(`(${creature.knowing.sage})`)}`,
    '',
    `  Quality Score: ${colorScore(creature.qualityScore)}  ${chalk.dim(`(${creature.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatCreaturesTable(creatures) */
export function formatCreaturesTable(creatures: JadeCreature[]): string {
  if (creatures.length === 0) return chalk.dim('No jade creatures found')
  const lines: string[] = [chalk.bold('Jade Creatures'), '']
  for (const c of creatures) {
    lines.push(`  ${chalk.rgb(0, 168, 107)(c.file)}  Ser:${colorScore(c.imperialSerenity)}  Mst:${colorScore(c.carvingMastery)}  Score:${colorScore(c.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatGalleryTable(gallery) */
export function formatGalleryTable(gallery: JadeMenagerieResult['galleries'][number]): string {
  const lines: string[] = [
    chalk.bold(`Jade Gallery: ${gallery.directory}`),
    '',
    `  Creatures:       ${gallery.creatures.length}`,
    `  Avg Serenity:    ${colorScore(gallery.avgSerenity)}`,
    `  Avg Mastery:     ${colorScore(gallery.avgMastery)}`,
    `  Avg Wisdom:      ${colorScore(gallery.avgWisdom)}`,
    `  Masterpieces:    ${gallery.jadeMasterpieceCount}`,
    `  Type:            ${colorGalleryType(gallery.galleryType)}`,
    `  Condition:       ${colorGalleryCondition(gallery.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGalleriesTable(galleries) */
export function formatGalleriesTable(galleries: JadeMenagerieResult['galleries']): string {
  if (galleries.length === 0) return chalk.dim('No jade galleries found')
  const lines: string[] = [chalk.bold('Jade Galleries'), '']
  for (const g of galleries) {
    lines.push(`  ${chalk.rgb(0, 168, 107)(g.directory)}  ${colorScore(g.avgSerenity)}  ${colorGalleryCondition(g.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: JadeMenagerieResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Jade Menagerie Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Galleries:          ${stats.totalGalleries}`,
    `  Avg Imperial Serenity:    ${colorScore(stats.avgImperialSerenity)}`,
    `  Avg Carving Mastery:      ${colorScore(stats.avgCarvingMastery)}`,
    `  Avg Jade Purity:          ${colorScore(stats.avgJadePurity)}`,
    `  Avg Dynasty Continuity:   ${colorScore(stats.avgDynastyContinuity)}`,
    `  Avg Nephrite Wisdom:      ${colorScore(stats.avgNephriteWisdom)}`,
    `  Jade Masterpieces:        ${stats.jadeMasterpieceCount}`,
    `  Imperial Carvings:        ${stats.imperialCarvingCount}`,
    `  Proper Nephrite:          ${stats.properNephriteCount}`,
    `  Common Stone:             ${stats.commonStoneCount}`,
    `  Raw Boulder:              ${stats.rawBoulderCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Harmony:          ${colorScore(stats.overallHarmony)}`,
    `  Curator Grade:            ${colorCuratorGrade(stats.curatorGrade)}`,
    `  Best Creature:            ${stats.bestCreature || 'N/A'}`,
    `  Most Serene:              ${stats.mostSerene || 'N/A'}`,
    `  Most Masterful:           ${stats.mostMasterful || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Most Enduring:            ${stats.mostEnduring || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(0, 168, 107)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: JadeMenagerieResult): string {
  const lines: string[] = [
    chalk.bold('Jade Menagerie Analysis'),
    '',
    formatCreaturesTable(result.creatures),
    '',
    formatGalleriesTable(result.galleries),
    '',
    chalk.bold('Palace Overview'),
    '',
    `  Avg Serenity:       ${colorScore(result.palace.avgSerenity)}`,
    `  Avg Mastery:        ${colorScore(result.palace.avgMastery)}`,
    `  Avg Wisdom:         ${colorScore(result.palace.avgWisdom)}`,
    `  Overall Harmony:    ${colorScore(result.palace.overallHarmony)}`,
    `  Is Jade:            ${result.palace.isJade ? chalk.rgb(0, 168, 107)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: JadeMenagerieResult): string {
  return JSON.stringify(result, null, 2)
}
