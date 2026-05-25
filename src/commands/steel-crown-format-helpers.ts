import chalk from 'chalk'

import type { CrownCondition, RealmCondition, CrownJewel, IronCrownResult, CrownRealm } from './steel-crown-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(120, 120, 130)(String(score))
  if (score >= 75) return chalk.rgb(100, 100, 115)(String(score))
  if (score >= 60) return chalk.rgb(80, 80, 100)(String(score))
  if (score >= 40) return chalk.rgb(60, 60, 85)(String(score))
  if (score >= 20) return chalk.rgb(45, 45, 70)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCrownCondition('crown-masterpiece') */
export function colorCrownCondition(condition: CrownCondition | string): string {
  switch (condition) {
    case 'crown-masterpiece':
      return chalk.rgb(120, 120, 130)('crown-masterpiece')
    case 'imperial-standard':
      return chalk.rgb(100, 100, 115)('imperial-standard')
    case 'proper-crown':
      return chalk.rgb(80, 80, 100)('proper-crown')
    case 'bent-circlet':
      return chalk.rgb(60, 60, 85)('bent-circlet')
    case 'rusty-ring':
      return chalk.rgb(45, 45, 70)('rusty-ring')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorRealmCondition('imperial-palace') */
export function colorRealmCondition(condition: RealmCondition | string): string {
  switch (condition) {
    case 'imperial-palace':
      return chalk.rgb(120, 120, 130)('imperial-palace')
    case 'iron-throne-room':
      return chalk.rgb(100, 100, 115)('iron-throne-room')
    case 'proper-castle':
      return chalk.rgb(80, 80, 100)('proper-castle')
    case 'wooden-fort':
      return chalk.rgb(60, 60, 85)('wooden-fort')
    case 'tent':
      return chalk.rgb(45, 45, 70)('tent')
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

/** @example formatJewelTable(jewel) */
export function formatJewelTable(jewel: CrownJewel): string {
  const lines: string[] = [
    chalk.bold(`Iron Crown Jewel: ${jewel.file}`),
    '',
    `  Sovereign Strength:   ${colorScore(jewel.sovereignStrength)}  ${chalk.dim(`(${jewel.founding.sovereign})`)}`,
    `  Crown Authority:      ${colorScore(jewel.crownAuthority)}  ${chalk.dim(`(${jewel.commanding.crown})`)}`,
    `  Jewel Precision:      ${colorScore(jewel.jewelPrecision)}  ${chalk.dim(`(${jewel.setting.jewel})`)}`,
    `  Circlet Resilience:   ${colorScore(jewel.circletResilience)}  ${chalk.dim(`(${jewel.defending.circlet})`)}`,
    `  Reign Endurance:      ${colorScore(jewel.reignEndurance)}  ${chalk.dim(`(${jewel.persisting.reign})`)}`,
    '',
    `  Quality Score: ${colorScore(jewel.qualityScore)}  ${chalk.dim(`(${colorCrownCondition(jewel.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatJewelsTable(jewels) */
export function formatJewelsTable(jewels: CrownJewel[]): string {
  if (jewels.length === 0) return chalk.dim('No iron crown jewels found')

  const colWidths = {
    file: Math.max(4, ...jewels.map((j) => j.file.length)),
    str: Math.max(3, ...jewels.map((j) => String(j.sovereignStrength).length)),
    auth: Math.max(3, ...jewels.map((j) => String(j.crownAuthority).length)),
    prec: Math.max(3, ...jewels.map((j) => String(j.jewelPrecision).length)),
    res: Math.max(3, ...jewels.map((j) => String(j.circletResilience).length)),
    end: Math.max(3, ...jewels.map((j) => String(j.reignEndurance).length)),
    score: Math.max(5, ...jewels.map((j) => String(j.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Iron Crown Jewels'), '']

  const header =
    chalk.rgb(120, 120, 130)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('Auth', colWidths.auth)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('Prec', colWidths.prec)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('End', colWidths.end)) +
    '  ' +
    chalk.rgb(120, 120, 130)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const j of jewels) {
    lines.push(
      padRight(j.file, colWidths.file) +
        '  ' +
        padLeft(String(j.sovereignStrength), colWidths.str) +
        '  ' +
        padLeft(String(j.crownAuthority), colWidths.auth) +
        '  ' +
        padLeft(String(j.jewelPrecision), colWidths.prec) +
        '  ' +
        padLeft(String(j.circletResilience), colWidths.res) +
        '  ' +
        padLeft(String(j.reignEndurance), colWidths.end) +
        '  ' +
        padLeft(String(j.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatRealmTable(realm) */
export function formatRealmTable(realm: CrownRealm): string {
  const lines: string[] = [
    chalk.bold(`Iron Crown Realm: ${realm.directory}`),
    '',
    `  Jewels:              ${realm.jewels.length}`,
    `  Avg Strength:        ${colorScore(realm.avgStrength)}`,
    `  Avg Authority:       ${colorScore(realm.avgAuthority)}`,
    `  Avg Endurance:       ${colorScore(realm.avgEndurance)}`,
    `  Masterpieces:        ${realm.crownMasterpieceCount}`,
    `  Realm Type:          ${realm.realmType}`,
    `  Condition:           ${colorRealmCondition(realm.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatRealmsTable(realms) */
export function formatRealmsTable(realms: CrownRealm[]): string {
  if (realms.length === 0) return chalk.dim('No iron crown realms found')

  const lines: string[] = [chalk.bold('Iron Crown Realms'), '']

  for (const r of realms) {
    lines.push(
      `  ${chalk.rgb(120, 120, 130)(r.directory)}  ${colorScore(r.avgStrength)}  ${colorRealmCondition(r.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: IronCrownResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Iron Crown Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Realms:            ${stats.totalRealms}`,
    `  Avg Sovereign Strength:  ${colorScore(stats.avgSovereignStrength)}`,
    `  Avg Crown Authority:     ${colorScore(stats.avgCrownAuthority)}`,
    `  Avg Jewel Precision:     ${colorScore(stats.avgJewelPrecision)}`,
    `  Avg Circlet Resilience:  ${colorScore(stats.avgCircletResilience)}`,
    `  Avg Reign Endurance:     ${colorScore(stats.avgReignEndurance)}`,
    `  Crown Masterpieces:      ${stats.crownMasterpieceCount}`,
    `  Imperial Standards:      ${stats.imperialStandardCount}`,
    `  Proper Crowns:           ${stats.properCrownCount}`,
    `  Bent Circlets:           ${stats.bentCircletCount}`,
    `  Rusty Rings:             ${stats.rustyRingCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Sovereignty:     ${colorScore(stats.overallSovereignty)}`,
    `  Monarch Grade:           ${stats.monarchGrade}`,
    `  Best Jewel:              ${stats.bestJewel || 'N/A'}`,
    `  Strongest:               ${stats.strongest || 'N/A'}`,
    `  Most Authoritative:      ${stats.mostAuthoritative || 'N/A'}`,
    `  Most Precise:            ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:          ${stats.mostResilient || 'N/A'}`,
    `  Most Enduring:           ${stats.mostEnduring || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(120, 120, 130)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: IronCrownResult): string {
  const lines: string[] = [
    chalk.bold('Iron Crown Analysis'),
    '',
    formatJewelsTable(result.jewels),
    '',
    formatRealmsTable(result.realms),
    '',
    chalk.bold('Kingdom Overview'),
    '',
    `  Avg Strength:      ${colorScore(result.kingdom.avgStrength)}`,
    `  Avg Authority:     ${colorScore(result.kingdom.avgAuthority)}`,
    `  Avg Endurance:     ${colorScore(result.kingdom.avgEndurance)}`,
    `  Sovereignty:       ${colorScore(result.kingdom.overallSovereignty)}`,
    `  Is Iron:           ${result.kingdom.isIron ? chalk.rgb(120, 120, 130)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: IronCrownResult): string {
  return JSON.stringify(result, null, 2)
}
