import chalk from 'chalk'

import type { BoltCondition, ForgeCondition, LightningBolt, ThunderForge, LightningAnvilResult } from './lightning-anvil-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 223, 0)(String(score))
  if (score >= 75) return chalk.rgb(255, 200, 0)(String(score))
  if (score >= 60) return chalk.rgb(220, 180, 0)(String(score))
  if (score >= 40) return chalk.rgb(180, 160, 50)(String(score))
  if (score >= 20) return chalk.rgb(140, 130, 80)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('lightning-masterpiece') */
export function colorCondition(condition: BoltCondition | string): string {
  switch (condition) {
    case 'lightning-masterpiece':
      return chalk.rgb(255, 223, 0)('lightning-masterpiece')
    case 'storm-forged':
      return chalk.rgb(255, 200, 0)('storm-forged')
    case 'proper-bolt':
      return chalk.rgb(220, 180, 0)('proper-bolt')
    case 'weak-spark':
      return chalk.rgb(180, 160, 50)('weak-spark')
    case 'dead-wire':
      return chalk.rgb(140, 130, 80)('dead-wire')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorForgeCondition('lightning-hall') */
export function colorForgeCondition(condition: ForgeCondition | string): string {
  switch (condition) {
    case 'lightning-hall':
      return chalk.rgb(255, 223, 0)('lightning-hall')
    case 'storm-cathedral':
      return chalk.rgb(255, 200, 0)('storm-cathedral')
    case 'proper-workshop':
      return chalk.rgb(220, 180, 0)('proper-workshop')
    case 'dark-shed':
      return chalk.rgb(180, 160, 50)('dark-shed')
    case 'ruins':
      return chalk.rgb(140, 130, 80)('ruins')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatBoltTable(bolt) */
export function formatBoltTable(bolt: LightningBolt): string {
  const lines: string[] = [
    chalk.bold(`Lightning Bolt: ${bolt.file}`),
    '',
    `  Lightning Speed:   ${colorScore(bolt.lightningSpeed)}  ${chalk.dim(`(${bolt.striking.velocity})`)}`,
    `  Thunder Authority:  ${colorScore(bolt.thunderAuthority)}  ${chalk.dim(`(${bolt.commanding.thunder})`)}`,
    `  Storm Resilience:   ${colorScore(bolt.stormResilience)}  ${chalk.dim(`(${bolt.weathering.shelter})`)}`,
    `  Spark Precision:    ${colorScore(bolt.sparkPrecision)}  ${chalk.dim(`(${bolt.igniting.spark})`)}`,
    `  Bolt Wisdom:        ${colorScore(bolt.boltWisdom)}  ${chalk.dim(`(${bolt.illuminating.flash})`)}`,
    '',
    `  Quality Score: ${colorScore(bolt.qualityScore)}  ${chalk.dim(`(${colorCondition(bolt.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatBoltsTable(bolts) */
export function formatBoltsTable(bolts: LightningBolt[]): string {
  if (bolts.length === 0) return chalk.dim('No lightning bolts found')

  const colWidths = {
    file: Math.max(4, ...bolts.map((b) => b.file.length)),
    spd: Math.max(3, ...bolts.map((b) => String(b.lightningSpeed).length)),
    auth: Math.max(4, ...bolts.map((b) => String(b.thunderAuthority).length)),
    res: Math.max(4, ...bolts.map((b) => String(b.stormResilience).length)),
    prec: Math.max(4, ...bolts.map((b) => String(b.sparkPrecision).length)),
    wis: Math.max(4, ...bolts.map((b) => String(b.boltWisdom).length)),
    score: Math.max(5, ...bolts.map((b) => String(b.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Lightning Bolts'), '']

  const header =
    chalk.rgb(255, 223, 0)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Spd', colWidths.spd)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Auth', colWidths.auth)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Resi', colWidths.res)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(255, 223, 0)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const b of bolts) {
    lines.push(
      padRight(b.file, colWidths.file) +
        '  ' +
        padLeft(String(b.lightningSpeed), colWidths.spd) +
        '  ' +
        padLeft(String(b.thunderAuthority), colWidths.auth) +
        '  ' +
        padLeft(String(b.stormResilience), colWidths.res) +
        '  ' +
        padLeft(String(b.sparkPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(b.boltWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(b.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatForgeTable(forge) */
export function formatForgeTable(forge: ThunderForge): string {
  const lines: string[] = [
    chalk.bold(`Thunder Forge: ${forge.directory}`),
    '',
    `  Bolts:          ${forge.bolts.length}`,
    `  Avg Speed:      ${colorScore(forge.avgSpeed)}`,
    `  Avg Resilience: ${colorScore(forge.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(forge.avgWisdom)}`,
    `  Masterpieces:   ${forge.lightningMasterpieceCount}`,
    `  Forge Type:     ${forge.forgeType}`,
    `  Condition:      ${colorForgeCondition(forge.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatForgesTable(forges) */
export function formatForgesTable(forges: ThunderForge[]): string {
  if (forges.length === 0) return chalk.dim('No thunder forges found')

  const lines: string[] = [chalk.bold('Thunder Forges'), '']

  for (const f of forges) {
    lines.push(
      `  ${chalk.rgb(255, 223, 0)(f.directory)}  ${colorScore(f.avgSpeed)}  ${colorForgeCondition(f.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: LightningAnvilResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Lightning Anvil Statistics'),
    '',
    `  Total Files:          ${stats.totalFiles}`,
    `  Total Forges:         ${stats.totalForges}`,
    `  Avg Lightning Speed:  ${colorScore(stats.avgLightningSpeed)}`,
    `  Avg Thunder Auth:     ${colorScore(stats.avgThunderAuthority)}`,
    `  Avg Storm Resilience: ${colorScore(stats.avgStormResilience)}`,
    `  Avg Spark Precision:  ${colorScore(stats.avgSparkPrecision)}`,
    `  Avg Bolt Wisdom:      ${colorScore(stats.avgBoltWisdom)}`,
    `  Lightning Masterpieces:${stats.lightningMasterpieceCount}`,
    `  Storm Forged:         ${stats.stormForgedCount}`,
    `  Proper Bolts:         ${stats.properBoltCount}`,
    `  Weak Sparks:          ${stats.weakSparkCount}`,
    `  Dead Wires:           ${stats.deadWireCount}`,
    `  Void:                 ${stats.voidCount}`,
    `  Overall Voltage:      ${colorScore(stats.overallVoltage)}`,
    `  Storm Caller Grade:   ${stats.stormCallerGrade}`,
    `  Best Bolt:            ${stats.bestBolt || 'N/A'}`,
    `  Fastest:              ${stats.fastest || 'N/A'}`,
    `  Most Authoritative:   ${stats.mostAuthoritative || 'N/A'}`,
    `  Most Resilient:       ${stats.mostResilient || 'N/A'}`,
    `  Most Precise:         ${stats.mostPrecise || 'N/A'}`,
    `  Wisest:               ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 223, 0)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: LightningAnvilResult): string {
  const lines: string[] = [
    chalk.bold('Lightning Anvil Analysis'),
    '',
    formatBoltsTable(result.bolts),
    '',
    formatForgesTable(result.forges),
    '',
    chalk.bold('Storm Overview'),
    '',
    `  Avg Speed:      ${colorScore(result.storm.avgSpeed)}`,
    `  Avg Resilience: ${colorScore(result.storm.avgResilience)}`,
    `  Avg Wisdom:     ${colorScore(result.storm.avgWisdom)}`,
    `  Voltage:        ${colorScore(result.storm.overallVoltage)}`,
    `  Is Lightning:   ${result.storm.isLightning ? chalk.rgb(255, 223, 0)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: LightningAnvilResult): string {
  return JSON.stringify(result, null, 2)
}
