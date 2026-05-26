import chalk from 'chalk'

import type { ArchitectGrade, CopperCathedralResult, CopperPanel, CopperSpire, PanelCondition, SpireCondition, SpireType } from './copper-cathedral-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 75) return chalk.rgb(200, 140, 80)(String(score))
  if (score >= 60) return chalk.rgb(165, 113, 70)(String(score))
  if (score >= 40) return chalk.rgb(130, 90, 55)(String(score))
  if (score >= 20) return chalk.rgb(100, 70, 40)(String(score))
  return chalk.gray(String(score))
}

/** @example colorPanelCondition('copper-masterpiece') */
export function colorPanelCondition(condition: PanelCondition | string): string {
  switch (condition) {
    case 'copper-masterpiece': return chalk.rgb(184, 115, 51)('copper-masterpiece')
    case 'verdigris-gem': return chalk.rgb(200, 140, 80)('verdigris-gem')
    case 'proper-copper': return chalk.rgb(165, 113, 70)('proper-copper')
    case 'tarnished-metal': return chalk.rgb(130, 90, 55)('tarnished-metal')
    case 'raw-ore': return chalk.rgb(100, 70, 40)('raw-ore')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorSpireType('grand-cathedral') */
export function colorSpireType(type: SpireType | string): string {
  switch (type) {
    case 'grand-cathedral': return chalk.rgb(184, 115, 51)('grand-cathedral')
    case 'proper-church': return chalk.rgb(200, 140, 80)('proper-church')
    case 'chapel': return chalk.rgb(165, 113, 70)('chapel')
    case 'shrine': return chalk.rgb(130, 90, 55)('shrine')
    case 'ruin': return chalk.rgb(100, 70, 40)('ruin')
    case 'no-spire': return chalk.gray('no-spire')
    default: return chalk.gray(String(type))
  }
}

/** @example colorSpireCondition('copper-palace') */
export function colorSpireCondition(condition: SpireCondition | string): string {
  switch (condition) {
    case 'copper-palace': return chalk.rgb(184, 115, 51)('copper-palace')
    case 'green-dome': return chalk.rgb(200, 140, 80)('green-dome')
    case 'proper-temple': return chalk.rgb(165, 113, 70)('proper-temple')
    case 'tin-roof': return chalk.rgb(130, 90, 55)('tin-roof')
    case 'empty-lot': return chalk.rgb(100, 70, 40)('empty-lot')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorArchitectGrade('master-architect') */
export function colorArchitectGrade(grade: ArchitectGrade | string): string {
  switch (grade) {
    case 'master-architect': return chalk.rgb(184, 115, 51)('master-architect')
    case 'cathedral-builder': return chalk.rgb(200, 140, 80)('cathedral-builder')
    case 'proper-mason': return chalk.rgb(165, 113, 70)('proper-mason')
    case 'apprentice': return chalk.rgb(130, 90, 55)('apprentice')
    case 'novice': return chalk.rgb(100, 70, 40)('novice')
    case 'stone-carrier': return chalk.gray('stone-carrier')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatPanelTable(panel) */
export function formatPanelTable(panel: CopperPanel): string {
  const lines: string[] = [
    chalk.bold(`Copper Panel: ${panel.file}`),
    '',
    `  Patina Wisdom:      ${colorScore(panel.patinaWisdom)}  ${chalk.dim(`(${panel.aging.verdigris})`)}`,
    `  Conductive Grace:   ${colorScore(panel.conductiveGrace)}  ${chalk.dim(`(${panel.flowing.current})`)}`,
    `  Forge Precision:    ${colorScore(panel.forgePrecision)}  ${chalk.dim(`(${panel.shaping.craft})`)}`,
    `  Warmth Endurance:   ${colorScore(panel.warmthEndurance)}  ${chalk.dim(`(${panel.warming.heat})`)}`,
    `  Aged Mastery:       ${colorScore(panel.agedMastery)}  ${chalk.dim(`(${panel.mastering.skill})`)}`,
    '',
    `  Quality Score: ${colorScore(panel.qualityScore)}  ${chalk.dim(`(${panel.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPanelsTable(panels) */
export function formatPanelsTable(panels: CopperPanel[]): string {
  if (panels.length === 0) return chalk.dim('No copper panels found')
  const lines: string[] = [chalk.bold('Copper Panels'), '']
  for (const p of panels) {
    lines.push(`  ${chalk.rgb(184, 115, 51)(p.file)}  Patina:${colorScore(p.patinaWisdom)}  Grace:${colorScore(p.conductiveGrace)}  Score:${colorScore(p.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatSpireTable(spire) */
export function formatSpireTable(spire: CopperSpire): string {
  const lines: string[] = [
    chalk.bold(`Copper Spire: ${spire.directory}`),
    '',
    `  Panels:             ${spire.panels.length}`,
    `  Avg Patina:         ${colorScore(spire.avgPatina)}`,
    `  Avg Precision:      ${colorScore(spire.avgPrecision)}`,
    `  Avg Mastery:        ${colorScore(spire.avgMastery)}`,
    `  Masterpieces:       ${spire.copperMasterpieceCount}`,
    `  Spire Type:         ${colorSpireType(spire.spireType)}`,
    `  Condition:          ${colorSpireCondition(spire.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatSpiresTable(spires) */
export function formatSpiresTable(spires: CopperSpire[]): string {
  if (spires.length === 0) return chalk.dim('No copper spires found')
  const lines: string[] = [chalk.bold('Copper Spires'), '']
  for (const s of spires) {
    lines.push(`  ${chalk.rgb(184, 115, 51)(s.directory)}  ${colorScore(s.avgPatina)}  ${colorSpireCondition(s.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperCathedralResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Copper Cathedral Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Spires:             ${stats.totalSpires}`,
    `  Avg Patina Wisdom:        ${colorScore(stats.avgPatinaWisdom)}`,
    `  Avg Conductive Grace:     ${colorScore(stats.avgConductiveGrace)}`,
    `  Avg Forge Precision:      ${colorScore(stats.avgForgePrecision)}`,
    `  Avg Warmth Endurance:     ${colorScore(stats.avgWarmthEndurance)}`,
    `  Avg Aged Mastery:         ${colorScore(stats.avgAgedMastery)}`,
    `  Copper Masterpieces:      ${stats.copperMasterpieceCount}`,
    `  Verdigris Gems:           ${stats.verdigrisGemCount}`,
    `  Proper Copper:            ${stats.properCopperCount}`,
    `  Tarnished Metal:          ${stats.tarnishedMetalCount}`,
    `  Raw Ore:                  ${stats.rawOreCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Warmth:           ${colorScore(stats.overallWarmth)}`,
    `  Architect Grade:          ${colorArchitectGrade(stats.architectGrade)}`,
    `  Best Panel:               ${stats.bestPanel || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
    `  Most Graceful:            ${stats.mostGraceful || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Enduring:            ${stats.mostEnduring || 'N/A'}`,
    `  Most Masterful:           ${stats.mostMasterful || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(184, 115, 51)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CopperCathedralResult): string {
  const lines: string[] = [
    chalk.bold('Copper Cathedral Analysis'),
    '',
    formatPanelsTable(result.panels),
    '',
    formatSpiresTable(result.spires),
    '',
    chalk.bold('Nave Overview'),
    '',
    `  Avg Patina:          ${colorScore(result.nave.avgPatina)}`,
    `  Avg Precision:       ${colorScore(result.nave.avgPrecision)}`,
    `  Avg Mastery:         ${colorScore(result.nave.avgMastery)}`,
    `  Overall Warmth:      ${colorScore(result.nave.overallWarmth)}`,
    `  Is Copper:           ${result.nave.isCopper ? chalk.rgb(184, 115, 51)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CopperCathedralResult): string {
  return JSON.stringify(result, null, 2)
}
