// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  SilverReflection,
  SilverGallery,
  SilverMirrorResult,
} from './silver-mirror-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(192, 192, 220)(String(score))
  if (score >= 75) return chalk.rgb(170, 170, 200)(String(score))
  if (score >= 60) return chalk.rgb(140, 160, 200)(String(score))
  if (score >= 40) return chalk.rgb(200, 180, 140)(String(score))
  if (score >= 20) return chalk.rgb(200, 140, 120)(String(score))
  return chalk.rgb(160, 100, 100)(String(score))
}

export function colorGrade(condition: string): string {
  switch (condition) {
    case 'perfect-mirror': return chalk.rgb(192, 192, 220)(condition)
    case 'clear-glass': return chalk.rgb(170, 170, 200)(condition)
    case 'proper-reflector': return chalk.rgb(140, 160, 200)(condition)
    case 'foggy-mirror': return chalk.rgb(200, 180, 140)(condition)
    case 'cracked-mirror': return chalk.rgb(200, 140, 120)(condition)
    case 'shattered': return chalk.rgb(160, 100, 100)(condition)
    default: return condition
  }
}

// ─── Reflection Formatting ───────────────────────────────

export function formatReflectionTable(r: SilverReflection): string {
  const lines = [
    `  ${chalk.bold(r.file)}`,
    `    Reflectivity:      ${colorScore(r.reflectivity)}  Surface Quality:   ${colorScore(r.surfaceQuality)}`,
    `    Tarnish Resistance: ${colorScore(r.tarnishResistance)}  Image Accuracy:    ${colorScore(r.imageAccuracy)}`,
    `    Frame Strength:    ${colorScore(r.frameStrength)}  Condition: ${colorGrade(r.condition)}`,
    `    Quality Score:     ${colorScore(r.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatReflectionsTable(reflections: SilverReflection[]): string {
  if (reflections.length === 0) return chalk.dim('No mirror reflections')
  return reflections.map(formatReflectionTable).join('\n\n')
}

// ─── Gallery Formatting ──────────────────────────────────

export function formatGalleryTable(gallery: SilverGallery): string {
  const lines = [
    `  ${chalk.bold(gallery.directory)}/`,
    `    Gallery Type: ${gallery.galleryType}  Condition: ${gallery.condition}`,
    `    Avg Reflectivity: ${gallery.avgReflectivity}  Avg Surface: ${gallery.avgSurfaceQuality}`,
    `    Perfect Mirrors: ${gallery.perfectMirrorCount}  Shattered: ${gallery.shatteredCount}`,
  ]
  return lines.join('\n')
}

export function formatGalleriesTable(galleries: SilverGallery[]): string {
  if (galleries.length === 0) return chalk.dim('No mirror galleries')
  return galleries.map(formatGalleryTable).join('\n\n')
}

// ─── Stats Formatting ────────────────────────────────────

export function formatStatsTable(stats: SilverMirrorResult['stats']): string {
  const lines = [
    chalk.bold('  Silver Mirror Statistics'),
    `    Total Files:           ${stats.totalFiles}`,
    `    Total Galleries:       ${stats.totalGalleries}`,
    `    Avg Reflectivity:      ${stats.avgReflectivity}`,
    `    Avg Surface Quality:   ${stats.avgSurfaceQuality}`,
    `    Avg Tarnish Resistance:${stats.avgTarnishResistance}`,
    `    Avg Image Accuracy:    ${stats.avgImageAccuracy}`,
    `    Avg Frame Strength:    ${stats.avgFrameStrength}`,
    `    Perfect Mirrors:       ${stats.perfectMirrorCount}`,
    `    Clear Glass:           ${stats.clearGlassCount}`,
    `    Proper Reflectors:     ${stats.properReflectorCount}`,
    `    Foggy Mirrors:         ${stats.foggyMirrorCount}`,
    `    Cracked Mirrors:       ${stats.crackedMirrorCount}`,
    `    Shattered:             ${stats.shatteredCount}`,
    `    Curator Grade:         ${stats.curatorGrade}`,
    `    Overall Clarity:       ${stats.overallClarity}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ───────────────────────────────────

export function formatResultTable(result: SilverMirrorResult): string {
  const sections = [
    chalk.bold('\n◎ Silver Mirror Reflection Analysis ◎\n'),
    chalk.bold('  Silver Reflections'),
    formatReflectionsTable(result.reflections),
    '\n',
    chalk.bold('  Mirror Gallery Analysis'),
    formatGalleriesTable(result.galleries),
    '\n',
    chalk.bold('  Mansion'),
    `    Overall Clarity: ${result.mansion.overallClarity}`,
    `    Is Clear: ${result.mansion.isClear}`,
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: SilverMirrorResult): string {
  return JSON.stringify(result, null, 2)
}
