// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { SilverArch, SilverHall, SilverThresholdResult } from './silver-threshold-helpers.js'

// ─── Color Palette (silver threshold — silver/moonlight) ───────────
const high = chalk.rgb(200, 200, 220)
const midHigh = chalk.rgb(180, 180, 200)
const mid = chalk.rgb(160, 160, 180)
const lowMid = chalk.rgb(135, 135, 155)
const low = chalk.rgb(110, 110, 130)

const best = chalk.rgb(220, 220, 240).bold
const good = chalk.rgb(200, 200, 225)
const okay = chalk.rgb(175, 175, 200)
const poor = chalk.rgb(145, 145, 170)
const worst = chalk.rgb(120, 120, 145)

const heading = chalk.rgb(210, 210, 235).bold
const label = chalk.rgb(190, 190, 215)
const dim = chalk.rgb(165, 165, 190)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // bright silver
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
 * colorGrade('silver-masterpiece') // best (bold silver)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'silver-arch': best, 'silver-shield': best, 'silver-path': best,
    'perfect-mirror': best, 'golden-sunrise': best, 'silver-masterpiece': best,
    'silver-palace': best, 'palace-of-silver': best, 'silver-guardian': best,

    'elegant-portal': good, 'proper-guard': good, 'smooth-crossing': good,
    'clear-reflection': good, 'smooth-transition': good, 'moonlit-portal': good,
    'moonlit-hall': good, 'moonlit-gallery': good, 'palace-keeper': good,

    'proper-entrance': okay, 'decent-check': okay, 'proper-passage': okay,
    'proper-silver': okay, 'proper-change': okay, 'proper-arch': okay,
    'proper-corridor': okay, 'decent-hallway': okay, 'skilled-doorkeeper': okay,

    'rough-doorway': poor, 'weak-barrier': poor, 'rough-crossing': poor,
    'tarnished-mirror': poor, 'abrupt-switch': poor, 'iron-gate': poor,
    'dim-passageway': poor, 'dim-corridor': poor, 'apprentice': poor,

    'hole-in-wall': worst, 'no-barrier': worst, 'blocked-path': worst,
    'dull-metal': worst, 'jarring-change': worst, 'wooden-door': worst,
    'dark-tunnel': worst, 'dark-passage': worst, 'novice': worst,

    'no-arch': worst, 'no-guard': worst, 'no-passage': worst,
    'no-reflection': worst, 'no-transition': worst, 'gap': worst,
    'no-hall': worst, 'void': worst, 'gate-crasher': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Arch Formatting ───────────────────────────────────────────────

/**
 * Format a single arch for display
 * @example
 * formatArchTable(arch) // colored arch info
 */
export function formatArchTable(arch: SilverArch): string {
  const parts = [
    `${label('File:')} ${dim(arch.file)}`,
    `${label('Boundary Elegance:')} ${colorScore(arch.boundaryElegance)} ${colorGrade(arch.arching.grade)}`,
    `${label('Threshold Security:')} ${colorScore(arch.thresholdSecurity)} ${colorGrade(arch.guarding.threshold)}`,
    `${label('Moonlit Passage:')} ${colorScore(arch.moonlitPassage)} ${colorGrade(arch.flowing.moonlit)}`,
    `${label('Silver Reflection:')} ${colorScore(arch.silverReflection)} ${colorGrade(arch.reflecting.silver)}`,
    `${label('Dawn Transition:')} ${colorScore(arch.dawnTransition)} ${colorGrade(arch.transitioning.dawn)}`,
    `${label('Score:')} ${colorScore(arch.qualityScore)} ${colorGrade(arch.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format arches as summary table
 * @example
 * formatArchesTable(arches) // multi-line table
 */
export function formatArchesTable(arches: SilverArch[]): string {
  if (arches.length === 0) return dim('No silver arches found')
  const header = heading('Silver Threshold Analysis')
  const rows = arches.map(a => formatArchTable(a))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Hall Formatting ───────────────────────────────────────────────

/**
 * Format a single hall for display
 * @example
 * formatHallTable(hall) // colored hall info
 */
export function formatHallTable(hall: SilverHall): string {
  const parts = [
    `${label('Hall:')} ${dim(hall.directory)}`,
    `${label('Type:')} ${colorGrade(hall.hallType)}`,
    `${label('Condition:')} ${colorGrade(hall.condition)}`,
    `${label('Arches:')} ${String(hall.arches.length)}`,
    `${label('Avg Elegance:')} ${colorScore(hall.avgElegance)}`,
    `${label('Avg Security:')} ${colorScore(hall.avgSecurity)}`,
    `${label('Avg Reflection:')} ${colorScore(hall.avgReflection)}`,
    `${label('Silver Masterpieces:')} ${String(hall.silverMasterpieceCount)}`,
    `${label('Gap Count:')} ${String(hall.gapCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all halls as summary
 * @example
 * formatHallsTable(halls) // multi-line summary
 */
export function formatHallsTable(halls: SilverHall[]): string {
  if (halls.length === 0) return dim('No silver halls found')
  const header = heading('Silver Halls')
  const rows = halls.map(h => formatHallTable(h))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: SilverThresholdResult['stats']): string {
  const parts = [
    heading('Silver Threshold Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Halls:')} ${String(stats.totalHalls)}`,
    `${label('Avg Boundary Elegance:')} ${colorScore(stats.avgBoundaryElegance)}`,
    `${label('Avg Threshold Security:')} ${colorScore(stats.avgThresholdSecurity)}`,
    `${label('Avg Moonlit Passage:')} ${colorScore(stats.avgMoonlitPassage)}`,
    `${label('Avg Silver Reflection:')} ${colorScore(stats.avgSilverReflection)}`,
    `${label('Avg Dawn Transition:')} ${colorScore(stats.avgDawnTransition)}`,
    `${label('Silver Masterpiece:')} ${String(stats.silverMasterpieceCount)}`,
    `${label('Moonlit Portal:')} ${String(stats.moonlitPortalCount)}`,
    `${label('Proper Arch:')} ${String(stats.properArchCount)}`,
    `${label('Iron Gate:')} ${String(stats.ironGateCount)}`,
    `${label('Wooden Door:')} ${String(stats.woodenDoorCount)}`,
    `${label('Gap:')} ${String(stats.gapCount)}`,
    `${label('High Elegance:')} ${String(stats.hasHighEleganceCount)}`,
    `${label('High Security:')} ${String(stats.hasHighSecurityCount)}`,
    `${label('High Passage:')} ${String(stats.hasHighPassageCount)}`,
    `${label('High Reflection:')} ${String(stats.hasHighReflectionCount)}`,
    `${label('High Transition:')} ${String(stats.hasHighTransitionCount)}`,
    `${label('Overall Radiance:')} ${colorScore(stats.overallRadiance)}`,
    `${label('Guardian Grade:')} ${colorGrade(stats.guardianGrade)}`,
    `${label('Best Arch:')} ${stats.bestArch}`,
    `${label('Most Elegant:')} ${stats.mostElegant}`,
    `${label('Most Secure:')} ${stats.mostSecure}`,
    `${label('Smoothest Passage:')} ${stats.smoothestPassage}`,
    `${label('Clearest:')} ${stats.clearest}`,
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
export function formatResultTable(result: SilverThresholdResult): string {
  const sections = [
    formatArchesTable(result.arches),
    '',
    formatHallsTable(result.halls),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Palace')} ${label('Luminous:')} ${result.palace.isLuminous ? high('Yes') : low('No')} ${label('Radiance:')} ${colorScore(result.palace.overallRadiance)}`,
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
export function formatResultJson(result: SilverThresholdResult): string {
  return JSON.stringify(result, null, 2)
}
