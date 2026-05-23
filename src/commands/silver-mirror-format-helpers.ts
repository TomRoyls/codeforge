// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { MirrorReflection, MirrorGallery, SilverMirrorResult } from './silver-mirror-helpers.js'

// ─── Color Palette (silver mirror) ─────────────────────────────────
const high = chalk.rgb(200, 210, 230)
const midHigh = chalk.rgb(175, 185, 210)
const mid = chalk.rgb(150, 160, 190)
const lowMid = chalk.rgb(125, 135, 165)
const low = chalk.rgb(100, 110, 145)

const best = chalk.rgb(220, 230, 250).bold
const good = chalk.rgb(200, 210, 240)
const okay = chalk.rgb(175, 185, 215)
const poor = chalk.rgb(145, 155, 185)
const worst = chalk.rgb(110, 120, 155)

const heading = chalk.rgb(210, 220, 245).bold
const label = chalk.rgb(190, 200, 230)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // silver-blue
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('perfect-mirror') // best (bold silver)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'perfect-reflection': best, 'perfect-silver': best, 'anti-tarnish': best,
    'true-reflection': best, 'ornate-gold': best, 'perfect-mirror': best,
    'hall-of-mirrors': best, 'crystal-gallery': best, 'master-curator': best,

    'clear-mirror': good, 'polished-surface': good, 'tarnish-resistant': good,
    'accurate-image': good, 'solid-frame': good, 'clear-glass': good,
    'proper-gallery': good, 'bright-hall': good, 'mirror-expert': good,

    'proper-reflection': okay, 'proper-finish': okay, 'proper-coating': okay,
    'proper-likeness': okay, 'proper-mounting': okay, 'proper-reflector': okay,
    'vanity-room': okay, 'decent-room': okay, 'gallery-owner': okay,

    'dull-surface': poor, 'rough-surface': poor, 'tarnishing': poor,
    'distorted': poor, 'weak-frame': poor, 'foggy-mirror': poor,
    'compact-mirror': poor, 'dim-corridor': poor, 'antique-dealer': poor,

    'tarnished-mirror': worst, 'pitted': worst, 'corroding': worst,
    'funhouse-mirror': worst, 'loose-mounting': worst, 'cracked-mirror': worst,
    'shard': worst, 'dark-room': worst, 'flea-market': worst,

    'broken-glass': worst, 'raw-metal': worst, 'blackened': worst,
    'no-image': worst, 'no-frame': worst, 'shattered': worst,
    'no-mirror': worst, 'boarded-up': worst, 'scrap-collector': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Reflection Formatting ────────────────────────────────────────

/**
 * Format a single reflection for display
 * @example
 * formatReflectionTable(reflection) // colored reflection info
 */
export function formatReflectionTable(reflection: MirrorReflection): string {
  const parts = [
    `${label('File:')} ${dim(reflection.file)}`,
    `${label('Reflectivity:')} ${colorScore(reflection.reflectivity)} ${colorGrade(reflection.reflecting.grade)}`,
    `${label('Surface Quality:')} ${colorScore(reflection.surfaceQuality)} ${colorGrade(reflection.polishing.surface)}`,
    `${label('Tarnish Resistance:')} ${colorScore(reflection.tarnishResistance)} ${colorGrade(reflection.resisting.tarnish)}`,
    `${label('Image Accuracy:')} ${colorScore(reflection.imageAccuracy)} ${colorGrade(reflection.imaging.image)}`,
    `${label('Frame Strength:')} ${colorScore(reflection.frameStrength)} ${colorGrade(reflection.framing.frame)}`,
    `${label('Score:')} ${colorScore(reflection.qualityScore)} ${colorGrade(reflection.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format reflections as summary table
 * @example
 * formatReflectionsTable(reflections) // multi-line table
 */
export function formatReflectionsTable(reflections: MirrorReflection[]): string {
  if (reflections.length === 0) return dim('No mirror reflections found')
  const header = heading('Silver Mirror Reflection Analysis')
  const rows = reflections.map(r => formatReflectionTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Gallery Formatting ───────────────────────────────────────────

/**
 * Format a gallery for display
 * @example
 * formatGalleryTable(gallery) // colored gallery info
 */
export function formatGalleryTable(gallery: MirrorGallery): string {
  const parts = [
    `${label('Gallery:')} ${dim(gallery.directory)}`,
    `${label('Type:')} ${colorGrade(gallery.galleryType)}`,
    `${label('Condition:')} ${colorGrade(gallery.condition)}`,
    `${label('Reflections:')} ${String(gallery.reflections.length)}`,
    `${label('Avg Reflectivity:')} ${colorScore(gallery.avgReflectivity)}`,
    `${label('Avg Quality:')} ${colorScore(gallery.avgQuality)}`,
    `${label('Avg Strength:')} ${colorScore(gallery.avgStrength)}`,
    `${label('Perfect Mirrors:')} ${String(gallery.perfectMirrorCount)}`,
    `${label('Shattered:')} ${String(gallery.shatteredCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all galleries as summary
 * @example
 * formatGalleriesTable(galleries) // multi-line gallery summary
 */
export function formatGalleriesTable(galleries: MirrorGallery[]): string {
  if (galleries.length === 0) return dim('No mirror galleries found')
  const header = heading('Mirror Gallery Analysis')
  const rows = galleries.map(g => formatGalleryTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SilverMirrorResult['stats']): string {
  const parts = [
    heading('Silver Mirror Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Galleries:')} ${String(stats.totalGalleries)}`,
    `${label('Avg Reflectivity:')} ${colorScore(stats.avgReflectivity)}`,
    `${label('Avg Surface Quality:')} ${colorScore(stats.avgSurfaceQuality)}`,
    `${label('Avg Tarnish Resistance:')} ${colorScore(stats.avgTarnishResistance)}`,
    `${label('Avg Image Accuracy:')} ${colorScore(stats.avgImageAccuracy)}`,
    `${label('Avg Frame Strength:')} ${colorScore(stats.avgFrameStrength)}`,
    `${label('Perfect Mirror:')} ${String(stats.perfectMirrorCount)}`,
    `${label('Clear Glass:')} ${String(stats.clearGlassCount)}`,
    `${label('Proper Reflector:')} ${String(stats.properReflectorCount)}`,
    `${label('Foggy Mirror:')} ${String(stats.foggyMirrorCount)}`,
    `${label('Cracked Mirror:')} ${String(stats.crackedMirrorCount)}`,
    `${label('Shattered:')} ${String(stats.shatteredCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Polish:')} ${String(stats.hasHighPolishCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Accuracy:')} ${String(stats.hasHighAccuracyCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('Overall Clarity:')} ${colorScore(stats.overallClarity)}`,
    `${label('Curator Grade:')} ${colorGrade(stats.curatorGrade)}`,
    `${label('Best Reflection:')} ${stats.bestReflection}`,
    `${label('Most Reflective:')} ${stats.mostReflective}`,
    `${label('Best Polished:')} ${stats.bestPolished}`,
    `${label('Most Tarnish Resistant:')} ${stats.mostTarnishResistant}`,
    `${label('Most Accurate:')} ${stats.mostAccurate}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: SilverMirrorResult): string {
  const sections = [
    formatReflectionsTable(result.reflections),
    '',
    formatGalleriesTable(result.galleries),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Mansion')} ${label('Clear:')} ${result.mansion.isClear ? high('Yes') : low('No')} ${label('Overall Clarity:')} ${colorScore(result.mansion.overallClarity)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: SilverMirrorResult): string {
  return JSON.stringify(result, null, 2)
}
