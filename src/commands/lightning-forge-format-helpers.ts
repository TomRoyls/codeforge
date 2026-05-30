import chalk from 'chalk'

import type { AnvilCondition, BoltCondition, ThunderAnvil, ThunderBolt, ThunderStats, ThunderForgeResult } from './lightning-forge-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.cyan(String(score))
  if (score >= 75) return chalk.blue(String(score))
  if (score >= 60) return chalk.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  if (score >= 20) return chalk.rgb(255, 165, 0)(String(score))
  return chalk.red(String(score))
}

/** @example colorCondition('thunder-masterpiece') */
export function colorCondition(condition: BoltCondition | string): string {
  switch (condition) {
    case 'thunder-masterpiece':
      return chalk.cyan('thunder-masterpiece')
    case 'lightning-crafted':
      return chalk.blue('lightning-crafted')
    case 'proper-forge':
      return chalk.green('proper-forge')
    case 'dying-ember':
      return chalk.yellow('dying-ember')
    case 'cold-anvil':
      return chalk.rgb(255, 165, 0)('cold-anvil')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorAnvilCondition('thunder-hall') */
export function colorAnvilCondition(condition: AnvilCondition | string): string {
  switch (condition) {
    case 'thunder-hall':
      return chalk.cyan('thunder-hall')
    case 'storm-forge':
      return chalk.blue('storm-forge')
    case 'proper-workshop':
      return chalk.green('proper-workshop')
    case 'dying-fire':
      return chalk.yellow('dying-fire')
    case 'cold-anvil':
      return chalk.rgb(255, 165, 0)('cold-anvil')
    case 'void':
      return chalk.red('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatBoltTable(bolt) */
export function formatBoltTable(bolt: ThunderBolt): string {
  const lines: string[] = [
    chalk.bold(`Thunder Bolt: ${bolt.file}`),
    '',
    `  Lightning Speed:    ${colorScore(bolt.lightningSpeed)}  ${chalk.dim(`(${bolt.striking.bolt})`)}`,
    `  Thunder Authority:  ${colorScore(bolt.thunderAuthority)}  ${chalk.dim(`(${bolt.commanding.thunder})`)}`,
    `  Storm Resilience:   ${colorScore(bolt.stormResilience)}  ${chalk.dim(`(${bolt.weathering.storm})`)}`,
    `  Spark Precision:    ${colorScore(bolt.sparkPrecision)}  ${chalk.dim(`(${bolt.focusing.spark})`)}`,
    `  Bolt Wisdom:        ${colorScore(bolt.boltWisdom)}  ${chalk.dim(`(${bolt.learning.lightning})`)}`,
    '',
    `  Quality Score: ${colorScore(bolt.qualityScore)}  ${chalk.dim(`(${colorCondition(bolt.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBoltsTable(bolts) */
export function formatBoltsTable(bolts: ThunderBolt[]): string {
  if (bolts.length === 0) return chalk.dim('No thunder bolts found')

  const colWidths = {
    authority: Math.max(9, ...bolts.map((b) => String(b.thunderAuthority).length)),
    file: Math.max(4, ...bolts.map((b) => b.file.length)),
    precision: Math.max(9, ...bolts.map((b) => String(b.sparkPrecision).length)),
    resilience: Math.max(10, ...bolts.map((b) => String(b.stormResilience).length)),
    score: Math.max(5, ...bolts.map((b) => String(b.qualityScore).length)),
    speed: Math.max(5, ...bolts.map((b) => String(b.lightningSpeed).length)),
    wisdom: Math.max(6, ...bolts.map((b) => String(b.boltWisdom).length)),
  }

  const lines: string[] = [chalk.bold('Thunder Bolts'), '']

  const header =
    chalk.cyan(padRight('File', colWidths.file)) +
    '  ' +
    chalk.cyan(padLeft('Speed', colWidths.speed)) +
    '  ' +
    chalk.cyan(padLeft('Authority', colWidths.authority)) +
    '  ' +
    chalk.cyan(padLeft('Resilience', colWidths.resilience)) +
    '  ' +
    chalk.cyan(padLeft('Precision', colWidths.precision)) +
    '  ' +
    chalk.cyan(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.cyan(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const b of bolts) {
    lines.push(
      padRight(b.file, colWidths.file) +
        '  ' +
        padLeft(String(b.lightningSpeed), colWidths.speed) +
        '  ' +
        padLeft(String(b.thunderAuthority), colWidths.authority) +
        '  ' +
        padLeft(String(b.stormResilience), colWidths.resilience) +
        '  ' +
        padLeft(String(b.sparkPrecision), colWidths.precision) +
        '  ' +
        padLeft(String(b.boltWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(b.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatAnvilTable(anvil) */
export function formatAnvilTable(anvil: ThunderAnvil): string {
  const lines: string[] = [
    chalk.bold(`Thunder Anvil: ${anvil.directory}`),
    '',
    `  Bolts:          ${anvil.bolts.length}`,
    `  Avg Speed:      ${colorScore(anvil.avgSpeed)}`,
    `  Avg Precision:  ${colorScore(anvil.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(anvil.avgWisdom)}`,
    `  Masterpieces:   ${anvil.thunderMasterpieceCount}`,
    `  Anvil Type:     ${anvil.anvilType}`,
    `  Condition:      ${colorAnvilCondition(anvil.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatAnvilsTable(anvils) */
export function formatAnvilsTable(anvils: ThunderAnvil[]): string {
  if (anvils.length === 0) return chalk.dim('No thunder anvils found')

  const lines: string[] = [chalk.bold('Thunder Anvils'), '']

  for (const a of anvils) {
    lines.push(
      `  ${chalk.cyan(a.directory)}  ${colorScore(a.avgSpeed)}  ${colorAnvilCondition(a.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: ThunderStats): string {
  const lines: string[] = [
    chalk.bold('Thunder Forge Statistics'),
    '',
    `  Total Files:            ${stats.totalFiles}`,
    `  Total Anvils:           ${stats.totalAnvils}`,
    `  Avg Lightning Speed:    ${colorScore(stats.avgLightningSpeed)}`,
    `  Avg Thunder Authority:  ${colorScore(stats.avgThunderAuthority)}`,
    `  Avg Storm Resilience:   ${colorScore(stats.avgStormResilience)}`,
    `  Avg Spark Precision:    ${colorScore(stats.avgSparkPrecision)}`,
    `  Avg Bolt Wisdom:        ${colorScore(stats.avgBoltWisdom)}`,
    `  Thunder Masterpieces:   ${stats.thunderMasterpieceCount}`,
    `  Lightning Crafted:      ${stats.lightningCraftedCount}`,
    `  Proper Forge:           ${stats.properForgeCount}`,
    `  Dying Ember:            ${stats.dyingEmberCount}`,
    `  Cold Anvil:             ${stats.coldAnvilCount}`,
    `  Void:                   ${stats.voidCount}`,
    `  Overall Power:          ${colorScore(stats.overallPower)}`,
    `  Smith Grade:            ${stats.smithGrade}`,
    `  Best Bolt:              ${stats.bestBolt || 'N/A'}`,
    `  Fastest:                ${stats.fastest || 'N/A'}`,
    `  Most Authoritative:     ${stats.mostAuthoritative || 'N/A'}`,
    `  Most Resilient:         ${stats.mostResilient || 'N/A'}`,
    `  Most Precise:           ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:                 ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.cyan('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: ThunderForgeResult): string {
  const lines: string[] = [
    chalk.bold('Thunder Forge Analysis'),
    '',
    formatBoltsTable(result.bolts),
    '',
    formatAnvilsTable(result.anvils),
    '',
    chalk.bold('Storm Overview'),
    '',
    `  Avg Speed:     ${colorScore(result.storm.avgSpeed)}`,
    `  Avg Precision: ${colorScore(result.storm.avgPrecision)}`,
    `  Avg Wisdom:    ${colorScore(result.storm.avgWisdom)}`,
    `  Overall Power: ${colorScore(result.storm.overallPower)}`,
    `  Is Thunderous: ${result.storm.isThunderous ? chalk.green('yes') : chalk.red('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: ThunderForgeResult): string {
  return JSON.stringify(result, null, 2)
}
