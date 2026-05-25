import chalk from 'chalk'

import type { FeatherCondition, NestCondition, RubyFeather, RubyFirebirdResult, RubyNest } from './ruby-firebird-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(220, 60, 60)(String(score))
  if (score >= 75) return chalk.rgb(200, 50, 50)(String(score))
  if (score >= 60) return chalk.rgb(180, 40, 40)(String(score))
  if (score >= 40) return chalk.rgb(160, 50, 50)(String(score))
  if (score >= 20) return chalk.rgb(140, 60, 60)(String(score))
  return chalk.gray(String(score))
}

/** @example colorFeatherCondition('ruby-masterpiece') */
export function colorFeatherCondition(condition: FeatherCondition | string): string {
  switch (condition) {
    case 'ruby-masterpiece':
      return chalk.rgb(220, 60, 60)('ruby-masterpiece')
    case 'phoenix-crown':
      return chalk.rgb(200, 50, 50)('phoenix-crown')
    case 'proper-flame':
      return chalk.rgb(180, 40, 40)('proper-flame')
    case 'dying-spark':
      return chalk.rgb(160, 50, 50)('dying-spark')
    case 'cold-ash':
      return chalk.rgb(140, 60, 60)('cold-ash')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorNestCondition('fire-palace') */
export function colorNestCondition(condition: NestCondition | string): string {
  switch (condition) {
    case 'fire-palace':
      return chalk.rgb(220, 60, 60)('fire-palace')
    case 'ember-throne':
      return chalk.rgb(200, 50, 50)('ember-throne')
    case 'proper-roost':
      return chalk.rgb(180, 40, 40)('proper-roost')
    case 'charred-branch':
      return chalk.rgb(160, 50, 50)('charred-branch')
    case 'empty-cage':
      return chalk.rgb(140, 60, 60)('empty-cage')
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

/** @example formatFeatherTable(feather) */
export function formatFeatherTable(feather: RubyFeather): string {
  const lines: string[] = [
    chalk.bold(`Ruby Feather: ${feather.file}`),
    '',
    `  Crimson Vitality:   ${colorScore(feather.crimsonVitality)}  ${chalk.dim(`(${feather.pulsing.flame})`)}`,
    `  Rebirth Quality:    ${colorScore(feather.rebirthQuality)}  ${chalk.dim(`(${feather.regenerating.rebirth})`)}`,
    `  Ash Wisdom:         ${colorScore(feather.ashWisdom)}  ${chalk.dim(`(${feather.learning.ash})`)}`,
    `  Flame Precision:    ${colorScore(feather.flamePrecision)}  ${chalk.dim(`(${feather.burning.blade})`)}`,
    `  Ember Resilience:   ${colorScore(feather.emberResilience)}  ${chalk.dim(`(${feather.enduring.ember})`)}`,
    '',
    `  Quality Score: ${colorScore(feather.qualityScore)}  ${chalk.dim(`(${colorFeatherCondition(feather.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFeathersTable(feathers) */
export function formatFeathersTable(feathers: RubyFeather[]): string {
  if (feathers.length === 0) return chalk.dim('No ruby feathers found')

  const colWidths = {
    file: Math.max(4, ...feathers.map((f) => f.file.length)),
    vit: Math.max(4, ...feathers.map((f) => String(f.crimsonVitality).length)),
    reb: Math.max(4, ...feathers.map((f) => String(f.rebirthQuality).length)),
    ash: Math.max(4, ...feathers.map((f) => String(f.ashWisdom).length)),
    flm: Math.max(4, ...feathers.map((f) => String(f.flamePrecision).length)),
    emb: Math.max(4, ...feathers.map((f) => String(f.emberResilience).length)),
    score: Math.max(5, ...feathers.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Ruby Feathers'), '']

  const header =
    chalk.rgb(220, 60, 60)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Vit', colWidths.vit)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Reb', colWidths.reb)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Ash', colWidths.ash)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Flm', colWidths.flm)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Emb', colWidths.emb)) +
    '  ' +
    chalk.rgb(220, 60, 60)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of feathers) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.crimsonVitality), colWidths.vit) +
        '  ' +
        padLeft(String(f.rebirthQuality), colWidths.reb) +
        '  ' +
        padLeft(String(f.ashWisdom), colWidths.ash) +
        '  ' +
        padLeft(String(f.flamePrecision), colWidths.flm) +
        '  ' +
        padLeft(String(f.emberResilience), colWidths.emb) +
        '  ' +
        padLeft(String(f.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatNestTable(nest) */
export function formatNestTable(nest: RubyNest): string {
  const lines: string[] = [
    chalk.bold(`Ruby Nest: ${nest.directory}`),
    '',
    `  Feathers:       ${nest.feathers.length}`,
    `  Avg Vitality:   ${colorScore(nest.avgVitality)}`,
    `  Avg Precision:  ${colorScore(nest.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(nest.avgWisdom)}`,
    `  Masterpieces:   ${nest.rubyMasterpieceCount}`,
    `  Nest Type:      ${nest.nestType}`,
    `  Condition:      ${colorNestCondition(nest.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatNestsTable(nests) */
export function formatNestsTable(nests: RubyNest[]): string {
  if (nests.length === 0) return chalk.dim('No ruby nests found')

  const lines: string[] = [chalk.bold('Ruby Nests'), '']

  for (const n of nests) {
    lines.push(
      `  ${chalk.rgb(220, 60, 60)(n.directory)}  ${colorScore(n.avgVitality)}  ${colorNestCondition(n.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: RubyFirebirdResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Ruby Firebird Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Nests:           ${stats.totalNests}`,
    `  Avg Crimson Vitality:  ${colorScore(stats.avgCrimsonVitality)}`,
    `  Avg Rebirth Quality:   ${colorScore(stats.avgRebirthQuality)}`,
    `  Avg Ash Wisdom:        ${colorScore(stats.avgAshWisdom)}`,
    `  Avg Flame Precision:   ${colorScore(stats.avgFlamePrecision)}`,
    `  Avg Ember Resilience:  ${colorScore(stats.avgEmberResilience)}`,
    `  Ruby Masterpieces:     ${stats.rubyMasterpieceCount}`,
    `  Phoenix Crown:         ${stats.phoenixCrownCount}`,
    `  Proper Flame:          ${stats.properFlameCount}`,
    `  Dying Spark:           ${stats.dyingSparkCount}`,
    `  Cold Ash:              ${stats.coldAshCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Brilliance:    ${colorScore(stats.overallBrilliance)}`,
    `  Firebird Grade:        ${stats.firebirdGrade}`,
    `  Best Feather:          ${stats.bestFeather || 'N/A'}`,
    `  Most Vital:            ${stats.mostVital || 'N/A'}`,
    `  Most Renewable:        ${stats.mostRenewable || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
    `  Most Precise:          ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:        ${stats.mostResilient || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(220, 60, 60)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: RubyFirebirdResult): string {
  const lines: string[] = [
    chalk.bold('Ruby Firebird Analysis'),
    '',
    formatFeathersTable(result.feathers),
    '',
    formatNestsTable(result.nests),
    '',
    chalk.bold('Flame Overview'),
    '',
    `  Avg Vitality:   ${colorScore(result.flame.avgVitality)}`,
    `  Avg Precision:  ${colorScore(result.flame.avgPrecision)}`,
    `  Avg Wisdom:     ${colorScore(result.flame.avgWisdom)}`,
    `  Brilliance:     ${colorScore(result.flame.overallBrilliance)}`,
    `  Is Ruby:        ${result.flame.isRuby ? chalk.rgb(220, 60, 60)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: RubyFirebirdResult): string {
  return JSON.stringify(result, null, 2)
}
