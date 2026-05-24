// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { GoldenArtifact, AnniversaryHall, GoldenAnniversaryResult } from './golden-anniversary-helpers.js'

// ─── Color Palette (golden anniversary — gold/amber/champagne) ─────
const high = chalk.rgb(255, 215, 0)
const midHigh = chalk.rgb(230, 190, 20)
const mid = chalk.rgb(200, 165, 30)
const lowMid = chalk.rgb(170, 140, 40)
const low = chalk.rgb(140, 115, 50)

const best = chalk.rgb(255, 223, 50).bold
const good = chalk.rgb(255, 200, 30)
const okay = chalk.rgb(220, 175, 20)
const poor = chalk.rgb(180, 140, 10)
const worst = chalk.rgb(140, 100, 0)

const heading = chalk.rgb(255, 215, 0).bold
const label = chalk.rgb(240, 195, 15)
const dim = chalk.rgb(200, 170, 30)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // gold
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
 * colorGrade('golden-guardian') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'timeless-classic': best, 'golden-standard': best, 'eternal-bloom': best,
    'grand-ceremony': best, 'golden-torch': best, 'golden-masterpiece': best,
    'hall-of-fame': best, 'golden-palace': best, 'golden-guardian': best,

    'battle-tested': good, 'exemplary-model': good, 'perennial-garden': good,
    'elegant-ritual': good, 'proper-relay': good, 'platinum-standard': good,
    'gallery-of-excellence': good,

    'proper-veteran': okay, 'proper-pattern': okay, 'proper-seasonal': okay,
    'proper-procedure': okay, 'decent-handoff': okay, 'proper-artifact': okay,
    'proper-museum': okay, 'decent-gallery': okay, 'master-curator': okay,
    'skilled-keeper': okay,

    'young-talent': poor, 'mediocre-example': poor, 'annual-only': poor,
    'clumsy-ritual': poor, 'dropped-baton': poor, 'bronze-relic': poor,
    'storage-room': poor, 'dusty-storage': poor, 'apprentice': poor,

    'unproven': worst, 'poor-model': worst, 'ephemeral': worst,
    'botched-ceremony': worst, 'lost-knowledge': worst, 'iron-relic': worst,
    'attic': worst, 'forgotten-attic': worst, 'novice': worst,

    'no-legacy': worst, 'no-archetype': worst, 'no-bloom': worst,
    'no-ceremony': worst, 'no-torch': worst, 'rust': worst,
    'no-hall': worst, 'void': worst, 'vandal': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Artifact Formatting ───────────────────────────────────────────

/**
 * Format a single artifact for display
 * @example
 * formatArtifactTable(artifact) // colored artifact info
 */
export function formatArtifactTable(artifact: GoldenArtifact): string {
  const parts = [
    `${label('File:')} ${dim(artifact.file)}`,
    `${label('Legacy Endurance:')} ${colorScore(artifact.legacyEndurance)} ${colorGrade(artifact.enduring.grade)}`,
    `${label('Golden Archetype:')} ${colorScore(artifact.goldenArchetype)} ${colorGrade(artifact.modeling.golden)}`,
    `${label('Perennial Quality:')} ${colorScore(artifact.perennialQuality)} ${colorGrade(artifact.blooming.quality)}`,
    `${label('Ceremony Elegance:')} ${colorScore(artifact.ceremonyElegance)} ${colorGrade(artifact.celebrating.ceremony)}`,
    `${label('Torch Passing:')} ${colorScore(artifact.torchPassing)} ${colorGrade(artifact.passing.handoff)}`,
    `${label('Score:')} ${colorScore(artifact.qualityScore)} ${colorGrade(artifact.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format artifacts as summary table
 * @example
 * formatArtifactsTable(artifacts) // multi-line table
 */
export function formatArtifactsTable(artifacts: GoldenArtifact[]): string {
  if (artifacts.length === 0) return dim('No golden artifacts found')
  const header = heading('Golden Anniversary Analysis')
  const rows = artifacts.map(a => formatArtifactTable(a))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hall Formatting ───────────────────────────────────────────────

/**
 * Format a hall for display
 * @example
 * formatHallTable(hall) // colored hall info
 */
export function formatHallTable(hall: AnniversaryHall): string {
  const parts = [
    `${label('Hall:')} ${dim(hall.directory)}`,
    `${label('Type:')} ${colorGrade(hall.hallType)}`,
    `${label('Condition:')} ${colorGrade(hall.condition)}`,
    `${label('Artifacts:')} ${String(hall.artifacts.length)}`,
    `${label('Avg Endurance:')} ${colorScore(hall.avgEndurance)}`,
    `${label('Avg Archetype:')} ${colorScore(hall.avgArchetype)}`,
    `${label('Avg Torch:')} ${colorScore(hall.avgTorch)}`,
    `${label('Golden Masterpieces:')} ${String(hall.goldenMasterpieceCount)}`,
    `${label('Rust Count:')} ${String(hall.rustCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all halls as summary
 * @example
 * formatHallsTable(halls) // multi-line summary
 */
export function formatHallsTable(halls: AnniversaryHall[]): string {
  if (halls.length === 0) return dim('No anniversary halls found')
  const header = heading('Anniversary Halls')
  const rows = halls.map(h => formatHallTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: GoldenAnniversaryResult['stats']): string {
  const parts = [
    heading('Golden Anniversary Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Halls:')} ${String(stats.totalHalls)}`,
    `${label('Avg Legacy Endurance:')} ${colorScore(stats.avgLegacyEndurance)}`,
    `${label('Avg Golden Archetype:')} ${colorScore(stats.avgGoldenArchetype)}`,
    `${label('Avg Perennial Quality:')} ${colorScore(stats.avgPerennialQuality)}`,
    `${label('Avg Ceremony Elegance:')} ${colorScore(stats.avgCeremonyElegance)}`,
    `${label('Avg Torch Passing:')} ${colorScore(stats.avgTorchPassing)}`,
    `${label('Golden Masterpiece:')} ${String(stats.goldenMasterpieceCount)}`,
    `${label('Platinum Standard:')} ${String(stats.platinumStandardCount)}`,
    `${label('Proper Artifact:')} ${String(stats.properArtifactCount)}`,
    `${label('Bronze Relic:')} ${String(stats.bronzeRelicCount)}`,
    `${label('Iron Relic:')} ${String(stats.ironRelicCount)}`,
    `${label('Rust:')} ${String(stats.rustCount)}`,
    `${label('High Endurance:')} ${String(stats.hasHighEnduranceCount)}`,
    `${label('High Archetype:')} ${String(stats.hasHighArchetypeCount)}`,
    `${label('High Perennial:')} ${String(stats.hasHighPerennialCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Torch:')} ${String(stats.hasHighTorchCount)}`,
    `${label('Overall Excellence:')} ${colorScore(stats.overallExcellence)}`,
    `${label('Guardian Grade:')} ${colorGrade(stats.guardianGrade)}`,
    `${label('Best Artifact:')} ${stats.bestArtifact}`,
    `${label('Most Enduring:')} ${stats.mostEnduring}`,
    `${label('Best Archetype:')} ${stats.bestArchetype}`,
    `${label('Most Perennial:')} ${stats.mostPerennial}`,
    `${label('Most Elegant:')} ${stats.mostElegant}`,
  ]
  return parts.join('\n')
}

// ─── Celebration Formatting ────────────────────────────────────────

/**
 * Format celebration info
 * @example
 * formatCelebration(celebration) // milestone display
 */
export function formatCelebration(celebration: GoldenAnniversaryResult['celebration']): string {
  const parts = [
    heading(`\u{1F3C6} MEGA-MILESTONE #${celebration.milestone}: ${celebration.name.toUpperCase()} \u{1F3C6}`),
    `${label('Message:')} ${celebration.message}`,
    `${label('Previous Milestones:')} ${celebration.previousMilestones.join(', ')}`,
    `${label('Total Tests:')} ${String(celebration.totalTests)}+`,
    `${label('Total Commands:')} ${String(celebration.totalCommands)}`,
    `${label('First Command:')} ${celebration.firstCommand}`,
    `${label('Latest Command:')} ${celebration.latestCommand}`,
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
export function formatResultTable(result: GoldenAnniversaryResult): string {
  const sections = [
    formatArtifactsTable(result.artifacts),
    '',
    formatHallsTable(result.halls),
    '',
    formatCelebration(result.celebration),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Ceremony')} ${label('Golden:')} ${result.ceremony.isGolden ? high('Yes') : low('No')} ${label('Overall Excellence:')} ${colorScore(result.ceremony.overallExcellence)}`,
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
export function formatResultJson(result: GoldenAnniversaryResult): string {
  return JSON.stringify(result, null, 2)
}
