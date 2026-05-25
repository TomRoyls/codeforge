// ─── Imports ─────────────────────────────────────────────

import chalk from 'chalk'

import type {
  PhantomTree,
  PhantomClearing,
  PhantomGroveResult,
} from './phantom-forest-helpers.js'

// ─── Color Helpers ───────────────────────────────────────

export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(160, 140, 220)(String(score))
  if (score >= 75) return chalk.rgb(140, 120, 200)(String(score))
  if (score >= 60) return chalk.rgb(120, 110, 180)(String(score))
  if (score >= 40) return chalk.rgb(160, 150, 180)(String(score))
  if (score >= 20) return chalk.rgb(150, 130, 160)(String(score))
  return chalk.rgb(120, 100, 140)(String(score))
}

export function colorCondition(condition: string): string {
  switch (condition) {
    case 'phantom-masterpiece': return chalk.rgb(160, 140, 220)(condition)
    case 'ethereal-grove': return chalk.rgb(140, 120, 200)(condition)
    case 'proper-forest': return chalk.rgb(120, 110, 180)(condition)
    case 'faded-wood': return chalk.rgb(160, 150, 180)(condition)
    case 'dead-thicket': return chalk.rgb(150, 130, 160)(condition)
    case 'void': return chalk.rgb(120, 100, 140)(condition)
    default: return condition
  }
}

// ─── Tree Formatting ────────────────────────────────────

export function formatTreeTable(t: PhantomTree): string {
  const lines = [
    `  ${chalk.bold(t.file)}`,
    `    Ethereal Quality:  ${colorScore(t.etherealQuality)}  Ghost Handling:   ${colorScore(t.ghostHandling)}`,
    `    Mist Clarity:      ${colorScore(t.mistClarity)}  Root Depth:       ${colorScore(t.rootDepth)}`,
    `    Shadow Wisdom:     ${colorScore(t.shadowWisdom)}  Condition: ${colorCondition(t.condition)}`,
    `    Quality Score:     ${colorScore(t.qualityScore)}`,
  ]
  return lines.join('\n')
}

export function formatTreesTable(trees: PhantomTree[]): string {
  if (trees.length === 0) return chalk.dim('No phantom trees found')
  return trees.map(formatTreeTable).join('\n\n')
}

// ─── Clearing Formatting ────────────────────────────────

export function formatClearingTable(clearing: PhantomClearing): string {
  const lines = [
    `  ${chalk.bold(clearing.directory)}/`,
    `    Clearing Type: ${clearing.clearingType}  Condition: ${clearing.condition}`,
    `    Avg Quality: ${clearing.avgQuality}  Avg Handling: ${clearing.avgHandling}  Avg Wisdom: ${clearing.avgWisdom}`,
    `    Phantom Masterpieces: ${clearing.phantomMasterpieceCount}  Void: ${clearing.voidCount}`,
  ]
  return lines.join('\n')
}

export function formatClearingsTable(clearings: PhantomClearing[]): string {
  if (clearings.length === 0) return chalk.dim('No phantom clearings found')
  return clearings.map(formatClearingTable).join('\n\n')
}

// ─── Stats Formatting ───────────────────────────────────

export function formatStatsTable(stats: PhantomGroveResult['stats']): string {
  const lines = [
    chalk.bold('  Phantom Grove Statistics'),
    `    Total Files:            ${stats.totalFiles}`,
    `    Total Clearings:        ${stats.totalClearings}`,
    `    Avg Ethereal Quality:   ${stats.avgEtherealQuality}`,
    `    Avg Ghost Handling:     ${stats.avgGhostHandling}`,
    `    Avg Mist Clarity:       ${stats.avgMistClarity}`,
    `    Avg Root Depth:         ${stats.avgRootDepth}`,
    `    Avg Shadow Wisdom:      ${stats.avgShadowWisdom}`,
    `    Phantom Masterpieces:   ${stats.phantomMasterpieceCount}`,
    `    Ethereal Groves:        ${stats.etherealGroveCount}`,
    `    Proper Forests:         ${stats.properForestCount}`,
    `    Faded Woods:            ${stats.fadedWoodCount}`,
    `    Dead Thickets:          ${stats.deadThicketCount}`,
    `    Void:                   ${stats.voidCount}`,
    `    Overall Ethereality:    ${stats.overallEthereality}`,
    `    Warden Grade:           ${stats.wardenGrade}`,
    `    Best Tree:              ${stats.bestTree}`,
    `    Most Ethereal:          ${stats.mostEthereal}`,
    `    Best Warded:            ${stats.bestWarded}`,
    `    Clearest:               ${stats.clearest}`,
    `    Deepest:                ${stats.deepest}`,
    `    Wisest:                 ${stats.wisest}`,
  ]
  return lines.join('\n')
}

// ─── Forest Formatting ──────────────────────────────────

export function formatForestTable(forest: PhantomGroveResult['forest']): string {
  const lines = [
    chalk.bold('  Forest Overview'),
    `    Avg Quality:       ${forest.avgQuality}`,
    `    Avg Handling:      ${forest.avgHandling}`,
    `    Avg Wisdom:        ${forest.avgWisdom}`,
    `    Is Phantom:        ${forest.isPhantom}`,
    `    Overall Ethereality:${forest.overallEthereality}`,
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ──────────────────────────

export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('No recommendations')
  return recs.map(r => `  • ${r}`).join('\n')
}

// ─── Result Formatting ──────────────────────────────────

export function formatResultTable(result: PhantomGroveResult): string {
  const sections = [
    chalk.bold('\n◎ Phantom Grove Analysis ◎\n'),
    chalk.bold('  Phantom Trees'),
    formatTreesTable(result.trees),
    '\n',
    chalk.bold('  Phantom Clearings'),
    formatClearingsTable(result.clearings),
    '\n',
    formatForestTable(result.forest),
    '\n',
    formatStatsTable(result.stats),
    '\n',
    chalk.bold('  Recommendations'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

export function formatResultJson(result: PhantomGroveResult): string {
  return JSON.stringify(result, null, 2)
}
