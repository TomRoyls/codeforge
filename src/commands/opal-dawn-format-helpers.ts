import chalk from 'chalk'

import type { OpalHorizonResult, OpalFragment, OpalVein, VeinCondition } from './opal-dawn-helpers.js'

import { padRight, padLeft } from '../utils/format-utils.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 120, 220)(String(score))
  if (score >= 75) return chalk.rgb(180, 100, 200)(String(score))
  if (score >= 60) return chalk.rgb(160, 80, 180)(String(score))
  if (score >= 40) return chalk.rgb(80, 120, 140)(String(score))
  if (score >= 20) return chalk.rgb(60, 90, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorVeinCondition('opal-field') */
export function colorVeinCondition(condition: VeinCondition | string): string {
  switch (condition) {
    case 'opal-field': return chalk.rgb(200, 120, 220)('opal-field')
    case 'rainbow-canyon': return chalk.rgb(180, 100, 200)('rainbow-canyon')
    case 'proper-mine': return chalk.rgb(160, 80, 180)('proper-mine')
    case 'gravel-pit': return chalk.rgb(80, 120, 140)('gravel-pit')
    case 'empty-hole': return chalk.rgb(60, 90, 110)('empty-hole')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatFragmentTable(fragment) */
export function formatFragmentTable(fragment: OpalFragment): string {
  const lines: string[] = [
    chalk.bold(`Opal Fragment: ${fragment.file}`),
    '',
    `  Play of Color:        ${colorScore(fragment.playOfColor)}  ${chalk.dim(`(${fragment.diffracting.play})`)}`,
    `  Dawn Clarity:         ${colorScore(fragment.dawnClarity)}  ${chalk.dim(`(${fragment.revealing.dawn})`)}`,
    `  Fire Warmth:          ${colorScore(fragment.fireWarmth)}  ${chalk.dim(`(${fragment.warming.fire})`)}`,
    `  Spectrum Richness:    ${colorScore(fragment.spectrumRichness)}  ${chalk.dim(`(${fragment.spanning.spectrum})`)}`,
    `  Opalescence Quality:  ${colorScore(fragment.opalescenceQuality)}  ${chalk.dim(`(${fragment.glowing.glow})`)}`,
    '',
    `  Quality Score: ${colorScore(fragment.qualityScore)}  ${chalk.dim(`(${fragment.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFragmentsTable(fragments) */
export function formatFragmentsTable(fragments: OpalFragment[]): string {
  if (fragments.length === 0) return chalk.dim('No opal fragments found')
  const colWidths = {
    file: Math.max(4, ...fragments.map((f) => f.file.length)),
    color: Math.max(5, ...fragments.map((f) => String(f.playOfColor).length)),
    clarity: Math.max(7, ...fragments.map((f) => String(f.dawnClarity).length)),
    warmth: Math.max(7, ...fragments.map((f) => String(f.fireWarmth).length)),
    richness: Math.max(8, ...fragments.map((f) => String(f.spectrumRichness).length)),
    opal: Math.max(5, ...fragments.map((f) => String(f.opalescenceQuality).length)),
    score: Math.max(5, ...fragments.map((f) => String(f.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Opal Fragments'), '']
  const header =
    chalk.rgb(200, 120, 220)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Color', colWidths.color)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Warmth', colWidths.warmth)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Richness', colWidths.richness)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Opal', colWidths.opal)) + '  ' +
    chalk.rgb(200, 120, 220)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const f of fragments) {
    lines.push(
      padRight(f.file, colWidths.file) + '  ' +
      padLeft(String(f.playOfColor), colWidths.color) + '  ' +
      padLeft(String(f.dawnClarity), colWidths.clarity) + '  ' +
      padLeft(String(f.fireWarmth), colWidths.warmth) + '  ' +
      padLeft(String(f.spectrumRichness), colWidths.richness) + '  ' +
      padLeft(String(f.opalescenceQuality), colWidths.opal) + '  ' +
      padLeft(String(f.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatVeinTable(vein) */
export function formatVeinTable(vein: OpalVein): string {
  const lines: string[] = [
    chalk.bold(`Opal Vein: ${vein.directory}`),
    '',
    `  Fragments:          ${vein.fragments.length}`,
    `  Avg Color:          ${colorScore(vein.avgColor)}`,
    `  Avg Richness:       ${colorScore(vein.avgRichness)}`,
    `  Avg Opalescence:    ${colorScore(vein.avgOpalescence)}`,
    `  Masterpieces:       ${vein.opalMasterpieceCount}`,
    `  Vein Type:          ${vein.veinType}`,
    `  Condition:          ${colorVeinCondition(vein.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatVeinsTable(veins) */
export function formatVeinsTable(veins: OpalVein[]): string {
  if (veins.length === 0) return chalk.dim('No opal veins found')
  const lines: string[] = [chalk.bold('Opal Veins'), '']
  for (const v of veins) {
    lines.push(`  ${chalk.rgb(200, 120, 220)(v.directory)}  ${colorScore(v.avgColor)}  ${colorVeinCondition(v.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OpalHorizonResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Opal Horizon Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Veins:              ${stats.totalVeins}`,
    `  Avg Play of Color:        ${colorScore(stats.avgPlayOfColor)}`,
    `  Avg Dawn Clarity:         ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Fire Warmth:          ${colorScore(stats.avgFireWarmth)}`,
    `  Avg Spectrum Richness:    ${colorScore(stats.avgSpectrumRichness)}`,
    `  Avg Opalescence Quality:  ${colorScore(stats.avgOpalescenceQuality)}`,
    `  Opal Masterpieces:        ${stats.opalMasterpieceCount}`,
    `  Precious Fire:            ${stats.preciousFireCount}`,
    `  Proper Gems:              ${stats.properGemCount}`,
    `  Common Opal:              ${stats.commonOpalCount}`,
    `  Potch Stones:             ${stats.potchStoneCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Brilliance:       ${colorScore(stats.overallBrilliance)}`,
    `  Lapidary Grade:           ${stats.lapidaryGrade}`,
    `  Best Fragment:            ${stats.bestFragment || 'N/A'}`,
    `  Most Colorful:            ${stats.mostColorful || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Warmest:                  ${stats.warmest || 'N/A'}`,
    `  Richest:                  ${stats.richest || 'N/A'}`,
    `  Most Luminous:            ${stats.mostLuminous || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(200, 120, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: OpalHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Opal Horizon Analysis'),
    '',
    formatFragmentsTable(result.fragments),
    '',
    formatVeinsTable(result.veins),
    '',
    chalk.bold('Spectrum Overview'),
    '',
    `  Avg Color:          ${colorScore(result.spectrum.avgColor)}`,
    `  Avg Richness:       ${colorScore(result.spectrum.avgRichness)}`,
    `  Avg Opalescence:    ${colorScore(result.spectrum.avgOpalescence)}`,
    `  Overall Brilliance: ${colorScore(result.spectrum.overallBrilliance)}`,
    `  Is Opal:            ${result.spectrum.isOpal ? chalk.rgb(200, 120, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: OpalHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
