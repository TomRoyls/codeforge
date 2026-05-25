import chalk from 'chalk'

import type { FragmentCondition, VeinCondition, OpalFragment, OpalHorizonResult, OpalVein } from './opal-skyline-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(255, 140, 200)(String(score))
  if (score >= 75) return chalk.rgb(220, 120, 180)(String(score))
  if (score >= 60) return chalk.rgb(190, 100, 160)(String(score))
  if (score >= 40) return chalk.rgb(160, 80, 140)(String(score))
  if (score >= 20) return chalk.rgb(130, 60, 120)(String(score))
  return chalk.gray(String(score))
}

/** @example colorFragmentCondition('opal-masterpiece') */
export function colorFragmentCondition(condition: FragmentCondition | string): string {
  switch (condition) {
    case 'opal-masterpiece':
      return chalk.rgb(255, 140, 200)('opal-masterpiece')
    case 'precious-fire':
      return chalk.rgb(220, 120, 180)('precious-fire')
    case 'proper-gem':
      return chalk.rgb(190, 100, 160)('proper-gem')
    case 'common-opal':
      return chalk.rgb(160, 80, 140)('common-opal')
    case 'potch-stone':
      return chalk.rgb(130, 60, 120)('potch-stone')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorVeinCondition('opal-field') */
export function colorVeinCondition(condition: VeinCondition | string): string {
  switch (condition) {
    case 'opal-field':
      return chalk.rgb(255, 140, 200)('opal-field')
    case 'rainbow-canyon':
      return chalk.rgb(220, 120, 180)('rainbow-canyon')
    case 'proper-mine':
      return chalk.rgb(190, 100, 160)('proper-mine')
    case 'gravel-pit':
      return chalk.rgb(160, 80, 140)('gravel-pit')
    case 'empty-hole':
      return chalk.rgb(130, 60, 120)('empty-hole')
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

/** @example formatFragmentTable(fragment) */
export function formatFragmentTable(fragment: OpalFragment): string {
  const lines: string[] = [
    chalk.bold(`Opal Fragment: ${fragment.file}`),
    '',
    `  Play of Color:       ${colorScore(fragment.playOfColor)}  ${chalk.dim(`(${fragment.diffracting.play})`)}`,
    `  Dawn Clarity:        ${colorScore(fragment.dawnClarity)}  ${chalk.dim(`(${fragment.revealing.dawn})`)}`,
    `  Fire Warmth:         ${colorScore(fragment.fireWarmth)}  ${chalk.dim(`(${fragment.warming.fire})`)}`,
    `  Spectrum Richness:   ${colorScore(fragment.spectrumRichness)}  ${chalk.dim(`(${fragment.spanning.spectrum})`)}`,
    `  Opalescence Quality: ${colorScore(fragment.opalescenceQuality)}  ${chalk.dim(`(${fragment.glowing.glow})`)}`,
    '',
    `  Quality Score: ${colorScore(fragment.qualityScore)}  ${chalk.dim(`(${colorFragmentCondition(fragment.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatFragmentsTable(fragments) */
export function formatFragmentsTable(fragments: OpalFragment[]): string {
  if (fragments.length === 0) return chalk.dim('No opal fragments found')

  const colWidths = {
    file: Math.max(4, ...fragments.map((f) => f.file.length)),
    clr: Math.max(4, ...fragments.map((f) => String(f.playOfColor).length)),
    dawn: Math.max(4, ...fragments.map((f) => String(f.dawnClarity).length)),
    warm: Math.max(4, ...fragments.map((f) => String(f.fireWarmth).length)),
    rich: Math.max(4, ...fragments.map((f) => String(f.spectrumRichness).length)),
    opal: Math.max(4, ...fragments.map((f) => String(f.opalescenceQuality).length)),
    score: Math.max(5, ...fragments.map((f) => String(f.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Opal Fragments'), '']

  const header =
    chalk.rgb(255, 140, 200)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Dawn', colWidths.dawn)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Warm', colWidths.warm)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Rich', colWidths.rich)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Opal', colWidths.opal)) +
    '  ' +
    chalk.rgb(255, 140, 200)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const f of fragments) {
    lines.push(
      padRight(f.file, colWidths.file) +
        '  ' +
        padLeft(String(f.playOfColor), colWidths.clr) +
        '  ' +
        padLeft(String(f.dawnClarity), colWidths.dawn) +
        '  ' +
        padLeft(String(f.fireWarmth), colWidths.warm) +
        '  ' +
        padLeft(String(f.spectrumRichness), colWidths.rich) +
        '  ' +
        padLeft(String(f.opalescenceQuality), colWidths.opal) +
        '  ' +
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
    `  Fragments:        ${vein.fragments.length}`,
    `  Avg Color:        ${colorScore(vein.avgColor)}`,
    `  Avg Richness:     ${colorScore(vein.avgRichness)}`,
    `  Avg Opalescence:  ${colorScore(vein.avgOpalescence)}`,
    `  Masterpieces:     ${vein.opalMasterpieceCount}`,
    `  Vein Type:        ${vein.veinType}`,
    `  Condition:        ${colorVeinCondition(vein.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatVeinsTable(veins) */
export function formatVeinsTable(veins: OpalVein[]): string {
  if (veins.length === 0) return chalk.dim('No opal veins found')

  const lines: string[] = [chalk.bold('Opal Veins'), '']

  for (const v of veins) {
    lines.push(
      `  ${chalk.rgb(255, 140, 200)(v.directory)}  ${colorScore(v.avgColor)}  ${colorVeinCondition(v.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: OpalHorizonResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Opal Horizon Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Veins:             ${stats.totalVeins}`,
    `  Avg Play of Color:       ${colorScore(stats.avgPlayOfColor)}`,
    `  Avg Dawn Clarity:        ${colorScore(stats.avgDawnClarity)}`,
    `  Avg Fire Warmth:         ${colorScore(stats.avgFireWarmth)}`,
    `  Avg Spectrum Richness:   ${colorScore(stats.avgSpectrumRichness)}`,
    `  Avg Opalescence Quality: ${colorScore(stats.avgOpalescenceQuality)}`,
    `  Opal Masterpieces:       ${stats.opalMasterpieceCount}`,
    `  Precious Fire:           ${stats.preciousFireCount}`,
    `  Proper Gem:              ${stats.properGemCount}`,
    `  Common Opal:             ${stats.commonOpalCount}`,
    `  Potch Stone:             ${stats.potchStoneCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Brilliance:      ${colorScore(stats.overallBrilliance)}`,
    `  Lapidary Grade:          ${stats.lapidaryGrade}`,
    `  Best Fragment:           ${stats.bestFragment || 'N/A'}`,
    `  Most Colorful:           ${stats.mostColorful || 'N/A'}`,
    `  Clearest:                ${stats.clearest || 'N/A'}`,
    `  Warmest:                 ${stats.warmest || 'N/A'}`,
    `  Richest:                 ${stats.richest || 'N/A'}`,
    `  Most Luminous:           ${stats.mostLuminous || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(255, 140, 200)('\u2022')} ${rec}`)
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
    `  Avg Color:       ${colorScore(result.spectrum.avgColor)}`,
    `  Avg Richness:    ${colorScore(result.spectrum.avgRichness)}`,
    `  Avg Opalescence: ${colorScore(result.spectrum.avgOpalescence)}`,
    `  Brilliance:      ${colorScore(result.spectrum.overallBrilliance)}`,
    `  Is Opal:         ${result.spectrum.isOpal ? chalk.rgb(255, 140, 200)('yes') : chalk.gray('no')}`,
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
