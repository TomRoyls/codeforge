import chalk from 'chalk'

import type { PrismCondition, LayerCondition, QuartzPrism, QuartzLayer, QuartzHorizonStats, QuartzHorizonResult } from './quartz-skyline-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(135, 206, 250)(String(score))
  if (score >= 75) return chalk.rgb(100, 180, 255)(String(score))
  if (score >= 60) return chalk.rgb(70, 130, 180)(String(score))
  if (score >= 40) return chalk.rgb(95, 158, 160)(String(score))
  if (score >= 20) return chalk.rgb(119, 136, 153)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('quartz-masterpiece') */
export function colorCondition(condition: PrismCondition | string): string {
  switch (condition) {
    case 'quartz-masterpiece':
      return chalk.rgb(135, 206, 250)('quartz-masterpiece')
    case 'crystal-horizon':
      return chalk.rgb(100, 180, 255)('crystal-horizon')
    case 'proper-mineral':
      return chalk.rgb(70, 130, 180)('proper-mineral')
    case 'dull-stone':
      return chalk.rgb(95, 158, 160)('dull-stone')
    case 'cracked-rock':
      return chalk.rgb(119, 136, 153)('cracked-rock')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorLayerCondition('crystal-canyon') */
export function colorLayerCondition(condition: LayerCondition | string): string {
  switch (condition) {
    case 'crystal-canyon':
      return chalk.rgb(135, 206, 250)('crystal-canyon')
    case 'quartz-ridge':
      return chalk.rgb(100, 180, 255)('quartz-ridge')
    case 'proper-formation':
      return chalk.rgb(70, 130, 180)('proper-formation')
    case 'dull-outcrop':
      return chalk.rgb(95, 158, 160)('dull-outcrop')
    case 'crumbled-stone':
      return chalk.rgb(119, 136, 153)('crumbled-stone')
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

/** @example formatPrismTable(prism) */
export function formatPrismTable(prism: QuartzPrism): string {
  const lines: string[] = [
    chalk.bold(`Quartz Prism: ${prism.file}`),
    '',
    `  Crystalline Clarity:   ${colorScore(prism.crystallineClarity)}  ${chalk.dim(`(${prism.transmitting.crystal})`)}`,
    `  Vibration Quality:     ${colorScore(prism.vibrationQuality)}  ${chalk.dim(`(${prism.oscillating.frequency})`)}`,
    `  Resonance Purity:      ${colorScore(prism.resonancePurity)}  ${chalk.dim(`(${prism.resonating.signal})`)}`,
    `  Structure Strength:    ${colorScore(prism.structureStrength)}  ${chalk.dim(`(${prism.supporting.lattice})`)}`,
    `  Vein Wisdom:           ${colorScore(prism.veinWisdom)}  ${chalk.dim(`(${prism.channeling.vein})`)}`,
    '',
    `  Quality Score: ${colorScore(prism.qualityScore)}  ${chalk.dim(`(${colorCondition(prism.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPrismsTable(prisms) */
export function formatPrismsTable(prisms: QuartzPrism[]): string {
  if (prisms.length === 0) return chalk.dim('No quartz prisms found')

  const colWidths = {
    file: Math.max(4, ...prisms.map((p) => p.file.length)),
    clr: Math.max(3, ...prisms.map((p) => String(p.crystallineClarity).length)),
    vib: Math.max(3, ...prisms.map((p) => String(p.vibrationQuality).length)),
    res: Math.max(3, ...prisms.map((p) => String(p.resonancePurity).length)),
    str: Math.max(3, ...prisms.map((p) => String(p.structureStrength).length)),
    wis: Math.max(3, ...prisms.map((p) => String(p.veinWisdom).length)),
    score: Math.max(5, ...prisms.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Quartz Prisms'), '']

  const header =
    chalk.rgb(135, 206, 250)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Clr', colWidths.clr)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Vib', colWidths.vib)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Res', colWidths.res)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Str', colWidths.str)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Wis', colWidths.wis)) +
    '  ' +
    chalk.rgb(135, 206, 250)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of prisms) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.crystallineClarity), colWidths.clr) +
        '  ' +
        padLeft(String(p.vibrationQuality), colWidths.vib) +
        '  ' +
        padLeft(String(p.resonancePurity), colWidths.res) +
        '  ' +
        padLeft(String(p.structureStrength), colWidths.str) +
        '  ' +
        padLeft(String(p.veinWisdom), colWidths.wis) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatLayerTable(layer) */
export function formatLayerTable(layer: QuartzLayer): string {
  const lines: string[] = [
    chalk.bold(`Quartz Layer: ${layer.directory}`),
    '',
    `  Prisms:                ${layer.prisms.length}`,
    `  Avg Clarity:           ${colorScore(layer.avgClarity)}`,
    `  Avg Strength:          ${colorScore(layer.avgStrength)}`,
    `  Avg Wisdom:            ${colorScore(layer.avgWisdom)}`,
    `  Quartz Masterpieces:   ${layer.quartzMasterpieceCount}`,
    `  Layer Type:            ${layer.layerType}`,
    `  Condition:             ${colorLayerCondition(layer.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatLayersTable(layers) */
export function formatLayersTable(layers: QuartzLayer[]): string {
  if (layers.length === 0) return chalk.dim('No quartz layers found')

  const lines: string[] = [chalk.bold('Quartz Layers'), '']

  for (const l of layers) {
    lines.push(
      `  ${chalk.rgb(135, 206, 250)(l.directory)}  ${colorScore(l.avgClarity)}  ${colorLayerCondition(l.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: QuartzHorizonStats): string {
  const lines: string[] = [
    chalk.bold('Quartz Skyline Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Layers:              ${stats.totalLayers}`,
    `  Avg Crystalline Clarity:   ${colorScore(stats.avgCrystallineClarity)}`,
    `  Avg Vibration Quality:     ${colorScore(stats.avgVibrationQuality)}`,
    `  Avg Resonance Purity:      ${colorScore(stats.avgResonancePurity)}`,
    `  Avg Structure Strength:    ${colorScore(stats.avgStructureStrength)}`,
    `  Avg Vein Wisdom:           ${colorScore(stats.avgVeinWisdom)}`,
    `  Quartz Masterpieces:       ${stats.quartzMasterpieceCount}`,
    `  Crystal Horizons:          ${stats.crystalHorizonCount}`,
    `  Proper Minerals:           ${stats.properMineralCount}`,
    `  Dull Stones:               ${stats.dullStoneCount}`,
    `  Cracked Rocks:             ${stats.crackedRockCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Luminosity:        ${colorScore(stats.overallLuminosity)}`,
    `  Geologist Grade:           ${stats.geologistGrade}`,
    `  Best Prism:                ${stats.bestPrism || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Most Rhythmic:             ${stats.mostRhythmic || 'N/A'}`,
    `  Purest:                    ${stats.purest || 'N/A'}`,
    `  Strongest:                 ${stats.strongest || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(135, 206, 250)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: QuartzHorizonResult): string {
  const lines: string[] = [
    chalk.bold('Quartz Skyline Analysis'),
    '',
    formatPrismsTable(result.prisms),
    '',
    formatLayersTable(result.layers),
    '',
    chalk.bold('Geology Overview'),
    '',
    `  Avg Clarity:       ${colorScore(result.geology.avgClarity)}`,
    `  Avg Strength:      ${colorScore(result.geology.avgStrength)}`,
    `  Avg Wisdom:        ${colorScore(result.geology.avgWisdom)}`,
    `  Overall Luminosity: ${colorScore(result.geology.overallLuminosity)}`,
    `  Is Quartz:         ${result.geology.isQuartz ? chalk.rgb(135, 206, 250)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: QuartzHorizonResult): string {
  return JSON.stringify(result, null, 2)
}
