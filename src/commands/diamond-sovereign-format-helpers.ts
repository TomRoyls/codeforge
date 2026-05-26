import chalk from 'chalk'

import type { DiamondSovereignResult, DiamondEdict, DiamondEmpire, EmpireCondition } from './diamond-sovereign-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(185, 242, 255)(String(score))
  if (score >= 75) return chalk.rgb(160, 220, 240)(String(score))
  if (score >= 60) return chalk.rgb(130, 200, 220)(String(score))
  if (score >= 40) return chalk.rgb(100, 150, 170)(String(score))
  if (score >= 20) return chalk.rgb(80, 120, 140)(String(score))
  return chalk.gray(String(score))
}

/** @example colorEmpireCondition('diamond-palace') */
export function colorEmpireCondition(condition: EmpireCondition | string): string {
  switch (condition) {
    case 'diamond-palace': return chalk.rgb(185, 242, 255)('diamond-palace')
    case 'gem-fortress': return chalk.rgb(160, 220, 240)('gem-fortress')
    case 'proper-castle': return chalk.rgb(130, 200, 220)('proper-castle')
    case 'stone-tower': return chalk.rgb(100, 150, 170)('stone-tower')
    case 'clay-hut': return chalk.rgb(80, 120, 140)('clay-hut')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
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

/** @example formatEdictTable(edict) */
export function formatEdictTable(edict: DiamondEdict): string {
  const lines: string[] = [
    chalk.bold(`Diamond Edict: ${edict.file}`),
    '',
    `  Sovereign Hardness:    ${colorScore(edict.sovereignHardness)}  ${chalk.dim(`(${edict.hardening.stone})`)}`,
    `  Crown Brilliance:      ${colorScore(edict.crownBrilliance)}  ${chalk.dim(`(${edict.shining.light})`)}`,
    `  Throne Precision:      ${colorScore(edict.thronePrecision)}  ${chalk.dim(`(${edict.cutting.cut})`)}`,
    `  Scepter Endurance:     ${colorScore(edict.scepterEndurance)}  ${chalk.dim(`(${edict.lasting.legacy})`)}`,
    `  Dynasty Wisdom:        ${colorScore(edict.dynastyWisdom)}  ${chalk.dim(`(${edict.knowing.reign})`)}`,
    '',
    `  Quality Score: ${colorScore(edict.qualityScore)}  ${chalk.dim(`(${edict.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatEdictsTable(edicts) */
export function formatEdictsTable(edicts: DiamondEdict[]): string {
  if (edicts.length === 0) return chalk.dim('No diamond edicts found')
  const colWidths = {
    file: Math.max(4, ...edicts.map((e) => e.file.length)),
    hardness: Math.max(8, ...edicts.map((e) => String(e.sovereignHardness).length)),
    brilliance: Math.max(9, ...edicts.map((e) => String(e.crownBrilliance).length)),
    precision: Math.max(9, ...edicts.map((e) => String(e.thronePrecision).length)),
    endurance: Math.max(8, ...edicts.map((e) => String(e.scepterEndurance).length)),
    wisdom: Math.max(6, ...edicts.map((e) => String(e.dynastyWisdom).length)),
    score: Math.max(5, ...edicts.map((e) => String(e.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Diamond Edicts'), '']
  const header =
    chalk.rgb(185, 242, 255)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Hardness', colWidths.hardness)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Brilliance', colWidths.brilliance)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Precision', colWidths.precision)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Endurance', colWidths.endurance)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(185, 242, 255)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const e of edicts) {
    lines.push(
      padRight(e.file, colWidths.file) + '  ' +
      padLeft(String(e.sovereignHardness), colWidths.hardness) + '  ' +
      padLeft(String(e.crownBrilliance), colWidths.brilliance) + '  ' +
      padLeft(String(e.thronePrecision), colWidths.precision) + '  ' +
      padLeft(String(e.scepterEndurance), colWidths.endurance) + '  ' +
      padLeft(String(e.dynastyWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(e.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatEmpireTable(empire) */
export function formatEmpireTable(empire: DiamondEmpire): string {
  const lines: string[] = [
    chalk.bold(`Diamond Empire: ${empire.directory}`),
    '',
    `  Edicts:              ${empire.edicts.length}`,
    `  Avg Hardness:        ${colorScore(empire.avgHardness)}`,
    `  Avg Brilliance:      ${colorScore(empire.avgBrilliance)}`,
    `  Avg Wisdom:          ${colorScore(empire.avgWisdom)}`,
    `  Masterpieces:        ${empire.sovereignMasterpieceCount}`,
    `  Empire Type:         ${empire.empireType}`,
    `  Condition:           ${colorEmpireCondition(empire.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatEmpiresTable(empires) */
export function formatEmpiresTable(empires: DiamondEmpire[]): string {
  if (empires.length === 0) return chalk.dim('No diamond empires found')
  const lines: string[] = [chalk.bold('Diamond Empires'), '']
  for (const e of empires) {
    lines.push(`  ${chalk.rgb(185, 242, 255)(e.directory)}  ${colorScore(e.avgHardness)}  ${colorEmpireCondition(e.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: DiamondSovereignResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Diamond Sovereign Statistics'),
    '',
    `  Total Files:                 ${stats.totalFiles}`,
    `  Total Empires:               ${stats.totalEmpires}`,
    `  Avg Sovereign Hardness:      ${colorScore(stats.avgSovereignHardness)}`,
    `  Avg Crown Brilliance:        ${colorScore(stats.avgCrownBrilliance)}`,
    `  Avg Throne Precision:        ${colorScore(stats.avgThronePrecision)}`,
    `  Avg Scepter Endurance:       ${colorScore(stats.avgScepterEndurance)}`,
    `  Avg Dynasty Wisdom:          ${colorScore(stats.avgDynastyWisdom)}`,
    `  Sovereign Masterpieces:      ${stats.sovereignMasterpieceCount}`,
    `  Royal Diamonds:              ${stats.royalDiamondCount}`,
    `  Proper Gems:                 ${stats.properGemCount}`,
    `  Industrial Stones:           ${stats.industrialStoneCount}`,
    `  Rough Carbon:                ${stats.roughCarbonCount}`,
    `  Void:                        ${stats.voidCount}`,
    `  Overall Sovereignty:         ${colorScore(stats.overallSovereignty)}`,
    `  Sovereign Grade:             ${stats.sovereignGrade}`,
    `  Best Edict:                  ${stats.bestEdict || 'N/A'}`,
    `  Hardest:                     ${stats.hardest || 'N/A'}`,
    `  Most Brilliant:              ${stats.mostBrilliant || 'N/A'}`,
    `  Most Precise:                ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:               ${stats.mostEnduring || 'N/A'}`,
    `  Wisest:                      ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(185, 242, 255)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: DiamondSovereignResult): string {
  const lines: string[] = [
    chalk.bold('Diamond Sovereign Analysis'),
    '',
    formatEdictsTable(result.edicts),
    '',
    formatEmpiresTable(result.empires),
    '',
    chalk.bold('Throne Overview'),
    '',
    `  Avg Hardness:          ${colorScore(result.throne.avgHardness)}`,
    `  Avg Brilliance:        ${colorScore(result.throne.avgBrilliance)}`,
    `  Avg Wisdom:            ${colorScore(result.throne.avgWisdom)}`,
    `  Overall Sovereignty:   ${colorScore(result.throne.overallSovereignty)}`,
    `  Is Diamond:            ${result.throne.isDiamond ? chalk.rgb(185, 242, 255)('yes') : chalk.gray('no')}`,
  ]
  if (result.celebration) {
    lines.push('', chalk.rgb(185, 242, 255)(result.celebration))
  }
  lines.push(
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  )
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: DiamondSovereignResult): string {
  return JSON.stringify(result, null, 2)
}
