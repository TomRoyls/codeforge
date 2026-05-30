// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { VelvetPouch, VaultChamber, VelvetVaultResult } from './velvet-vault-helpers.js'

// ─── Color Palette (velvet vault — deep purple/crimson/gold) ──────
const high = chalk.rgb(180, 130, 200)
const midHigh = chalk.rgb(165, 115, 185)
const mid = chalk.rgb(150, 100, 170)
const lowMid = chalk.rgb(135, 85, 155)
const low = chalk.rgb(120, 70, 140)

const best = chalk.rgb(200, 150, 220).bold
const good = chalk.rgb(180, 130, 200)
const okay = chalk.rgb(160, 110, 180)
const poor = chalk.rgb(140, 90, 160)
const worst = chalk.rgb(120, 70, 140)

const heading = chalk.rgb(175, 125, 195).bold
const label = chalk.rgb(160, 110, 175)
const dim = chalk.rgb(140, 90, 155)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // deep purple
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
 * colorGrade('silk-velvet') // best (bold purple)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'silk-velvet': best, 'fort-knox': best, 'silk-lining': best,
    'flawless-diamond': best, 'unbreakable-lock': best, 'royal-vault': best,
    'treasury': best, 'impenetrable-fortress': best, 'master-keeper': best,

    'soft-cotton': good, 'strong-vault': good, 'proper-padding': good,
    'clear-gem': good, 'reliable-mechanism': good, 'luxury-safe': good,
    'strongroom': good, 'secure-vault': good, 'expert-vault': good,

    'proper-lining': okay, 'proper-safe': okay, 'decent-wrap': okay,
    'proper-stone': okay, 'proper-lock': okay, 'proper-vault': okay,
    'decent-safe': okay, 'skilled-guardian': okay,

    'rough-cloth': poor, 'weak-lock': poor, 'thin-layer': poor,
    'cloudy-crystal': poor, 'sticky-latch': poor, 'basic-locker': poor,
    'closet-safe': poor, 'basic-storage': poor, 'apprentice': poor,

    'bare-metal': worst, 'open-door': worst, 'no-protection': worst,
    'rough-rock': worst, 'broken-lock': worst, 'wooden-box': worst,
    'drawer': worst, 'unsecured': worst, 'novice': worst,

    'no-lining': worst, 'no-security': worst, 'exposed': worst,
    'no-jewel': worst, 'no-lock': worst, 'dusty-shelf': worst,
    'no-chamber': worst, 'void': worst, 'thief': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Pouch Formatting ─────────────────────────────────────────────

/**
 * Format a single pouch for display
 * @example
 * formatPouchTable(pouch) // colored pouch info
 */
export function formatPouchTable(pouch: VelvetPouch): string {
  const parts = [
    `${label('File:')} ${dim(pouch.file)}`,
    `${label('Softness Quality:')} ${colorScore(pouch.softnessQuality)} ${colorGrade(pouch.cushioning.grade)}`,
    `${label('Vault Security:')} ${colorScore(pouch.vaultSecurity)} ${colorGrade(pouch.securing.vault)}`,
    `${label('Lining Protection:')} ${colorScore(pouch.liningProtection)} ${colorGrade(pouch.protecting.lining)}`,
    `${label('Jewel Clarity:')} ${colorScore(pouch.jewelClarity)} ${colorGrade(pouch.clarifying.jewel)}`,
    `${label('Lock Reliability:')} ${colorScore(pouch.lockReliability)} ${colorGrade(pouch.validating.lock)}`,
    `${label('Score:')} ${colorScore(pouch.qualityScore)} ${colorGrade(pouch.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format pouches as summary table
 * @example
 * formatPouchesTable(pouches) // multi-line table
 */
export function formatPouchesTable(pouches: VelvetPouch[]): string {
  if (pouches.length === 0) return dim('No velvet pouches found')
  const header = heading('Velvet Vault Analysis')
  const rows = pouches.map(p => formatPouchTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Chamber Formatting ───────────────────────────────────────────

/**
 * Format a chamber for display
 * @example
 * formatChamberTable(chamber) // colored chamber info
 */
export function formatChamberTable(chamber: VaultChamber): string {
  const parts = [
    `${label('Chamber:')} ${dim(chamber.directory)}`,
    `${label('Type:')} ${colorGrade(chamber.chamberType)}`,
    `${label('Condition:')} ${colorGrade(chamber.condition)}`,
    `${label('Pouches:')} ${String(chamber.pouches.length)}`,
    `${label('Avg Softness:')} ${colorScore(chamber.avgSoftness)}`,
    `${label('Avg Security:')} ${colorScore(chamber.avgSecurity)}`,
    `${label('Avg Clarity:')} ${colorScore(chamber.avgClarity)}`,
    `${label('Royal Vaults:')} ${String(chamber.royalVaultCount)}`,
    `${label('Dusty Shelves:')} ${String(chamber.dustyShelfCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all chambers as summary
 * @example
 * formatChambersTable(chambers) // multi-line summary
 */
export function formatChambersTable(chambers: VaultChamber[]): string {
  if (chambers.length === 0) return dim('No vault chambers found')
  const header = heading('Vault Chambers')
  const rows = chambers.map(c => formatChamberTable(c))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: VelvetVaultResult['stats']): string {
  const parts = [
    heading('Velvet Vault Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Chambers:')} ${String(stats.totalChambers)}`,
    `${label('Avg Softness Quality:')} ${colorScore(stats.avgSoftnessQuality)}`,
    `${label('Avg Vault Security:')} ${colorScore(stats.avgVaultSecurity)}`,
    `${label('Avg Lining Protection:')} ${colorScore(stats.avgLiningProtection)}`,
    `${label('Avg Jewel Clarity:')} ${colorScore(stats.avgJewelClarity)}`,
    `${label('Avg Lock Reliability:')} ${colorScore(stats.avgLockReliability)}`,
    `${label('Royal Vault:')} ${String(stats.royalVaultCount)}`,
    `${label('Luxury Safe:')} ${String(stats.luxurySafeCount)}`,
    `${label('Proper Vault:')} ${String(stats.properVaultCount)}`,
    `${label('Basic Locker:')} ${String(stats.basicLockerCount)}`,
    `${label('Wooden Box:')} ${String(stats.woodenBoxCount)}`,
    `${label('Dusty Shelf:')} ${String(stats.dustyShelfCount)}`,
    `${label('High Softness:')} ${String(stats.hasHighSoftnessCount)}`,
    `${label('High Security:')} ${String(stats.hasHighSecurityCount)}`,
    `${label('High Protection:')} ${String(stats.hasHighProtectionCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Reliability:')} ${String(stats.hasHighReliabilityCount)}`,
    `${label('Overall Treasure:')} ${colorScore(stats.overallTreasure)}`,
    `${label('Keeper Grade:')} ${colorGrade(stats.keeperGrade)}`,
    `${label('Best Pouch:')} ${stats.bestPouch}`,
    `${label('Softest:')} ${stats.softest}`,
    `${label('Most Secure:')} ${stats.mostSecure}`,
    `${label('Most Protected:')} ${stats.mostProtected}`,
    `${label('Clearest:')} ${stats.clearest}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

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

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: VelvetVaultResult): string {
  const sections = [
    formatPouchesTable(result.pouches),
    '',
    formatChambersTable(result.chambers),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Treasury')} ${label('Secure:')} ${result.treasury.isSecure ? high('Yes') : low('No')} ${label('Overall Treasure:')} ${colorScore(result.treasury.overallTreasure)}`,
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
export function formatResultJson(result: VelvetVaultResult): string {
  return JSON.stringify(result, null, 2)
}
