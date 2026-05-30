// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type {
  ElectricalRod,
  PowerGrid,
  LightningRodResult,
} from './lightning-rod-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(255, 255, 0)
const midHigh = chalk.rgb(255, 215, 0)
const mid = chalk.rgb(255, 165, 0)
const lowMid = chalk.rgb(184, 134, 11)
const low = chalk.rgb(100, 100, 100)

const best = chalk.rgb(255, 255, 0).bold
const good = chalk.rgb(255, 215, 0)
const okay = chalk.rgb(255, 165, 0)
const poor = chalk.rgb(184, 134, 11)
const worst = chalk.rgb(60, 60, 60)

const heading = chalk.rgb(255, 255, 0).bold
const label = chalk.rgb(255, 215, 0)
const dim = chalk.rgb(140, 140, 100)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // yellow
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
 * colorGrade('superconductor') // best (yellow bold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (text: string) => string> = {
    'superconductor': best, 'deep-ground': best, 'lightning-strike': best,
    'faraday-cage': best, 'rock-steady': best, 'power-plant': best,
    'national-grid': best, 'ultra-reliable': best, 'chief-engineer': best,

    'high-conductor': good, 'solid-ground': good, 'strong-spark': good,
    'surge-protector': good, 'regulated': good, 'power-station': good,
    'city-grid': good, 'reliable': good, 'senior-electrician': good,

    'proper-conductor': okay, 'proper-ground': okay, 'proper-spark': okay,
    'circuit-breaker': okay, 'proper-voltage': okay, 'transformer': okay,
    'neighborhood': okay, 'adequate': okay, 'journeyman': okay,

    'semiconductor': poor, 'shallow-ground': poor, 'weak-spark': poor,
    'fuse': poor, 'fluctuating': poor, 'junction-box': poor,
    'home-wiring': poor, 'unreliable': poor, 'apprentice': poor,

    'resistor': worst, 'floating-ground': worst, 'flicker': worst,
    'bare-wire': worst, 'spiking': worst, 'extension-cord': worst,
    'extension-cord-grid': worst, 'dangerous': worst, 'hobbyist': worst,

    'insulator': worst, 'no-ground': worst, 'dead-circuit': worst,
    'no-protection': worst, 'brownout': worst, 'dead-wire': worst,
    'no-grid': worst, 'offline': worst, 'short-circuit': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Rod Formatting ────────────────────────────────────────────────

/**
 * Format a single electrical rod for table display
 * @example
 * formatRodTable(rod) // colored table row
 */
export function formatRodTable(rod: ElectricalRod): string {
  const parts = [
    `${label('File:')} ${dim(rod.file)}`,
    `${label('Conduction:')} ${colorScore(rod.conductionQuality)} ${colorGrade(rod.conducting.grade)}`,
    `${label('Grounding:')} ${colorScore(rod.groundedness)} ${colorGrade(rod.grounding.system)}`,
    `${label('Spark:')} ${colorScore(rod.sparkQuality)} ${colorGrade(rod.sparking.spark)}`,
    `${label('Protection:')} ${colorScore(rod.surgeProtection)} ${colorGrade(rod.protecting.shield)}`,
    `${label('Stability:')} ${colorScore(rod.voltageStability)} ${colorGrade(rod.stabilizing.voltage)}`,
    `${label('Score:')} ${colorScore(rod.qualityScore)} ${colorGrade(rod.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format rods as a summary table
 * @example
 * formatRodsTable(rods) // multi-line table
 */
export function formatRodsTable(rods: ElectricalRod[]): string {
  if (rods.length === 0) return dim('No electrical rods found')
  const header = heading('Electrical Rod Analysis')
  const rows = rods.map(r => formatRodTable(r))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Grid Formatting ───────────────────────────────────────────────

/**
 * Format a power grid for display
 * @example
 * formatGridTable(grid) // colored grid summary
 */
export function formatGridTable(grid: PowerGrid): string {
  const parts = [
    `${label('Grid:')} ${dim(grid.directory)}`,
    `${label('Type:')} ${colorGrade(grid.gridType)}`,
    `${label('Condition:')} ${colorGrade(grid.condition)}`,
    `${label('Rods:')} ${String(grid.rods.length)}`,
    `${label('Avg Conduction:')} ${colorScore(grid.avgConduction)}`,
    `${label('Avg Grounding:')} ${colorScore(grid.avgGrounding)}`,
    `${label('Avg Stability:')} ${colorScore(grid.avgStability)}`,
    `${label('Power Plants:')} ${String(grid.powerPlantCount)}`,
    `${label('Dead Wires:')} ${String(grid.deadWireCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all grids as a summary table
 * @example
 * formatGridsTable(grids) // multi-line grid summary
 */
export function formatGridsTable(grids: PowerGrid[]): string {
  if (grids.length === 0) return dim('No power grids found')
  const header = heading('Power Grid Analysis')
  const rows = grids.map(g => formatGridTable(g))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats summary
 */
export function formatStatsTable(stats: LightningRodResult['stats']): string {
  const parts = [
    heading('Network Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Grids:')} ${String(stats.totalGrids)}`,
    `${label('Avg Conduction:')} ${colorScore(stats.avgConductionQuality)}`,
    `${label('Avg Grounding:')} ${colorScore(stats.avgGroundedness)}`,
    `${label('Avg Spark:')} ${colorScore(stats.avgSparkQuality)}`,
    `${label('Avg Protection:')} ${colorScore(stats.avgSurgeProtection)}`,
    `${label('Avg Stability:')} ${colorScore(stats.avgVoltageStability)}`,
    `${label('Power Plants:')} ${String(stats.powerPlantCount)}`,
    `${label('Power Stations:')} ${String(stats.powerStationCount)}`,
    `${label('Transformers:')} ${String(stats.transformerCount)}`,
    `${label('Junction Boxes:')} ${String(stats.junctionBoxCount)}`,
    `${label('Extension Cords:')} ${String(stats.extensionCordCount)}`,
    `${label('Dead Wires:')} ${String(stats.deadWireCount)}`,
    `${label('High Quality:')} ${String(stats.hasHighQualityCount)}`,
    `${label('High Groundedness:')} ${String(stats.hasHighGroundednessCount)}`,
    `${label('High Spark:')} ${String(stats.hasHighSparkCount)}`,
    `${label('High Protection:')} ${String(stats.hasHighProtectionCount)}`,
    `${label('High Stability:')} ${String(stats.hasHighStabilityCount)}`,
    `${label('Overall Power:')} ${colorScore(stats.overallPower)}`,
    `${label('Engineer Grade:')} ${colorGrade(stats.engineerGrade)}`,
    `${label('Best Rod:')} ${stats.bestRod}`,
    `${label('Best Conductor:')} ${stats.bestConductor}`,
    `${label('Most Grounded:')} ${stats.mostGrounded}`,
    `${label('Brightest Spark:')} ${stats.brightestSpark}`,
    `${label('Safest Circuit:')} ${stats.safestCircuit}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as a list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('•')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as a table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: LightningRodResult): string {
  const sections = [
    formatRodsTable(result.rods),
    '',
    formatGridsTable(result.grids),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Network')} ${label('Powered:')} ${result.network.isPowered ? high('Yes') : low('No')} ${label('Overall Power:')} ${colorScore(result.network.overallPower)}`,
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
export function formatResultJson(result: LightningRodResult): string {
  return JSON.stringify(result, null, 2)
}
