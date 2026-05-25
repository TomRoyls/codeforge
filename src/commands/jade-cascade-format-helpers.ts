// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  JadeDrop,
  JadePool,
  JadeWaterfallResult,
} from './jade-cascade-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(120, 200, 160)(String(score))
  if (score >= 75) return chalk.rgb(100, 180, 140)(String(score))
  if (score >= 60) return chalk.rgb(80, 160, 130)(String(score))
  if (score >= 40) return chalk.rgb(180, 200, 140)(String(score))
  if (score >= 20) return chalk.rgb(200, 180, 120)(String(score))
  return chalk.rgb(180, 120, 100)(String(score))
}

export function colorCondition(condition: string): string {
  switch (condition) {
    case 'jade-masterpiece': return chalk.rgb(120, 200, 160)(condition)
    case 'emerald-falls': return chalk.rgb(100, 180, 140)(condition)
    case 'proper-waterfall': return chalk.rgb(80, 160, 130)(condition)
    case 'murky-stream': return chalk.rgb(180, 200, 140)(condition)
    case 'dry-creek': return chalk.rgb(200, 180, 120)(condition)
    case 'void': return chalk.rgb(180, 120, 100)(condition)
    default: return condition
  }
}

// ─── Drop Formatting ─────────────────────────────────────

export function formatDropTable(d: JadeDrop): string {
  const lines = [
    `  ${chalk.bold(d.file)}`,
    `    Flow Grace:      ${colorScore(d.flowGrace)}  Cascade Clarity:  ${colorScore(d.cascadeClarity)}`,
    `    Pool Depth:      ${colorScore(d.poolDepth)}  Mist Purity:     ${colorScore(d.mistPurity)}`,
    `    River Wisdom:    ${colorScore(d.riverWisdom)}  Condition: ${colorCondition(d.condition)}`,
    `    Quality Score:   ${colorScore(d.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatDropsTable(drops: JadeDrop[]): string {
  if (drops.length === 0) return chalk.dim('No jade drops found')
  return drops.map(formatDropTable).join('\n\n')
}

// ─── Pool Formatting ─────────────────────────────────────

export function formatPoolTable(pool: JadePool): string {
  const lines = [
    `  ${chalk.bold(pool.directory)}/`,
    `    Pool Type: ${pool.poolType}  Condition: ${pool.condition}`,
    `    Avg Grace: ${pool.avgGrace}  Avg Clarity: ${pool.avgClarity}  Avg Wisdom: ${pool.avgWisdom}`,
    `    Jade Masterpieces: ${pool.jadeMasterpieceCount}  Void: ${pool.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatPoolsTable(pools: JadePool[]): string {
  if (pools.length === 0) return chalk.dim('No jade pools found')
  return pools.map(formatPoolTable).join('\n\n')
}

// ─── Stats Formatting ────────────────────────────────────

export function formatStatsTable(stats: JadeWaterfallResult['stats']): string {
  const lines = [
    chalk.bold('  Jade Waterfall Statistics'),
    `    Total Files:          ${stats.totalFiles}`,
    `    Total Pools:          ${stats.totalPools}`,
    `    Avg Flow Grace:       ${stats.avgFlowGrace}`,
    `    Avg Cascade Clarity:  ${stats.avgCascadeClarity}`,
    `    Avg Pool Depth:       ${stats.avgPoolDepth}`,
    `    Avg Mist Purity:      ${stats.avgMistPurity}`,
    `    Avg River Wisdom:     ${stats.avgRiverWisdom}`,
    `    Jade Masterpieces:    ${stats.jadeMasterpieceCount}`,
    `    Emerald Falls:        ${stats.emeraldFallsCount}`,
    `    Proper Waterfalls:    ${stats.properWaterfallCount}`,
    `    Murky Streams:        ${stats.murkyStreamCount}`,
    `    Dry Creeks:           ${stats.dryCreekCount}`,
    `    Void:                 ${stats.voidCount}`,
    `    Overall Flow:         ${stats.overallFlow}`,
    `    Gardener Grade:       ${stats.gardenerGrade}`,
    `    Best Drop:            ${stats.bestDrop}`,
    `    Most Graceful:        ${stats.mostGraceful}`,
    `    Clearest:             ${stats.clearest}`,
    `    Deepest:              ${stats.deepest}`,
    `    Purest:               ${stats.purest}`,
    `    Wisest:               ${stats.wisest}`,
  ]
  return lines.join('\n')
}

// ─── River Formatting ────────────────────────────────────

export function formatRiverTable(river: JadeWaterfallResult['river']): string {
  const lines = [
    chalk.bold('  River Overview'),
    `    Avg Grace:       ${river.avgGrace}`,
    `    Avg Clarity:     ${river.avgClarity}`,
    `    Avg Wisdom:      ${river.avgWisdom}`,
    `    Is Jade:         ${river.isJade}`,
    `    Overall Flow:    ${river.overallFlow}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ───────────────────────────────────

export function formatResultTable(result: JadeWaterfallResult): string {
  const sections = [
    chalk.bold('\n◎ Jade Waterfall Analysis ◎\n'),
    chalk.bold('  Jade Drops'),
    formatDropsTable(result.drops),
    '\n',
    chalk.bold('  Jade Pools'),
    formatPoolsTable(result.pools),
    '\n',
    formatRiverTable(result.river),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: JadeWaterfallResult): string {
  return JSON.stringify(result, null, 2)
}
