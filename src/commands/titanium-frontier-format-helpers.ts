import chalk from 'chalk'

import type { ModuleCondition, PanelCondition, TitaniumPanel, TitaniumModule, TitaniumFrontierStats, TitaniumFrontierResult } from './titanium-frontier-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(135, 206, 235)(String(score))
  if (score >= 75) return chalk.rgb(100, 149, 237)(String(score))
  if (score >= 60) return chalk.cyan(String(score))
  if (score >= 40) return chalk.rgb(70, 130, 180)(String(score))
  if (score >= 20) return chalk.blue(String(score))
  return chalk.gray(String(score))
}

/** @example colorCondition('titanium-masterpiece') */
export function colorCondition(condition: PanelCondition | string): string {
  switch (condition) {
    case 'titanium-masterpiece':
      return chalk.rgb(135, 206, 235)('titanium-masterpiece')
    case 'space-grade':
      return chalk.rgb(100, 149, 237)('space-grade')
    case 'proper-alloy':
      return chalk.cyan('proper-alloy')
    case 'earth-bound':
      return chalk.rgb(70, 130, 180)('earth-bound')
    case 'rusted-hull':
      return chalk.blue('rusted-hull')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorModuleCondition('deep-space-station') */
export function colorModuleCondition(condition: ModuleCondition | string): string {
  switch (condition) {
    case 'deep-space-station':
      return chalk.rgb(135, 206, 235)('deep-space-station')
    case 'orbital-platform':
      return chalk.rgb(100, 149, 237)('orbital-platform')
    case 'proper-module':
      return chalk.cyan('proper-module')
    case 'ground-facility':
      return chalk.rgb(70, 130, 180)('ground-facility')
    case 'crashed-pod':
      return chalk.blue('crashed-pod')
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

/** @example formatPanelTable(panel) */
export function formatPanelTable(panel: TitaniumPanel): string {
  const lines: string[] = [
    chalk.bold(`Titanium Panel: ${panel.file}`),
    '',
    `  Alloy Strength:        ${colorScore(panel.alloyStrength)}  ${chalk.dim(`(${panel.forging.alloy})`)}`,
    `  Frontier Vision:       ${colorScore(panel.frontierVision)}  ${chalk.dim(`(${panel.exploring.frontier})`)}`,
    `  Corrosion Resistance:  ${colorScore(panel.corrosionResistance)}  ${chalk.dim(`(${panel.shielding.shield})`)}`,
    `  Weight Efficiency:     ${colorScore(panel.weightEfficiency)}  ${chalk.dim(`(${panel.optimizing.ratio})`)}`,
    `  Space Wisdom:          ${colorScore(panel.spaceWisdom)}  ${chalk.dim(`(${panel.navigating.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(panel.qualityScore)}  ${chalk.dim(`(${colorCondition(panel.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPanelsTable(panels) */
export function formatPanelsTable(panels: TitaniumPanel[]): string {
  if (panels.length === 0) return chalk.dim('No titanium panels found')

  const colWidths = {
    file: Math.max(4, ...panels.map((p) => p.file.length)),
    strength: Math.max(8, ...panels.map((p) => String(p.alloyStrength).length)),
    vision: Math.max(6, ...panels.map((p) => String(p.frontierVision).length)),
    resist: Math.max(8, ...panels.map((p) => String(p.corrosionResistance).length)),
    weight: Math.max(8, ...panels.map((p) => String(p.weightEfficiency).length)),
    wisdom: Math.max(6, ...panels.map((p) => String(p.spaceWisdom).length)),
    score: Math.max(5, ...panels.map((p) => String(p.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Titanium Panels'), '']

  const header =
    chalk.rgb(135, 206, 235)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Strength', colWidths.strength)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Vision', colWidths.vision)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Resist', colWidths.resist)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Weight', colWidths.weight)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Wisdom', colWidths.wisdom)) +
    '  ' +
    chalk.rgb(135, 206, 235)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const p of panels) {
    lines.push(
      padRight(p.file, colWidths.file) +
        '  ' +
        padLeft(String(p.alloyStrength), colWidths.strength) +
        '  ' +
        padLeft(String(p.frontierVision), colWidths.vision) +
        '  ' +
        padLeft(String(p.corrosionResistance), colWidths.resist) +
        '  ' +
        padLeft(String(p.weightEfficiency), colWidths.weight) +
        '  ' +
        padLeft(String(p.spaceWisdom), colWidths.wisdom) +
        '  ' +
        padLeft(String(p.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatModuleTable(module) */
export function formatModuleTable(mod: TitaniumModule): string {
  const lines: string[] = [
    chalk.bold(`Titanium Module: ${mod.directory}`),
    '',
    `  Panels:       ${mod.panels.length}`,
    `  Avg Strength: ${colorScore(mod.avgStrength)}`,
    `  Avg Vision:   ${colorScore(mod.avgVision)}`,
    `  Avg Wisdom:   ${colorScore(mod.avgWisdom)}`,
    `  Masterpieces: ${mod.titaniumMasterpieceCount}`,
    `  Module Type:  ${mod.moduleType}`,
    `  Condition:    ${colorModuleCondition(mod.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatModulesTable(modules) */
export function formatModulesTable(modules: TitaniumModule[]): string {
  if (modules.length === 0) return chalk.dim('No titanium modules found')

  const lines: string[] = [chalk.bold('Titanium Modules'), '']

  for (const m of modules) {
    lines.push(
      `  ${chalk.rgb(135, 206, 235)(m.directory)}  ${colorScore(m.avgStrength)}  ${colorModuleCondition(m.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: TitaniumFrontierStats): string {
  const lines: string[] = [
    chalk.bold('Titanium Frontier Statistics'),
    '',
    `  Total Files:           ${stats.totalFiles}`,
    `  Total Modules:         ${stats.totalModules}`,
    `  Avg Alloy Strength:    ${colorScore(stats.avgAlloyStrength)}`,
    `  Avg Frontier Vision:   ${colorScore(stats.avgFrontierVision)}`,
    `  Avg Corrosion Resist:  ${colorScore(stats.avgCorrosionResistance)}`,
    `  Avg Weight Efficiency: ${colorScore(stats.avgWeightEfficiency)}`,
    `  Avg Space Wisdom:      ${colorScore(stats.avgSpaceWisdom)}`,
    `  Titanium Masterpieces: ${stats.titaniumMasterpieceCount}`,
    `  Space Grade:           ${stats.spaceGradeCount}`,
    `  Proper Alloy:          ${stats.properAlloyCount}`,
    `  Earth Bound:           ${stats.earthBoundCount}`,
    `  Rusted Hull:           ${stats.rustedHullCount}`,
    `  Void:                  ${stats.voidCount}`,
    `  Overall Grade:         ${colorScore(stats.overallGrade)}`,
    `  Commander Grade:       ${stats.commanderGrade}`,
    `  Best Panel:            ${stats.bestPanel || 'N/A'}`,
    `  Strongest:             ${stats.strongest || 'N/A'}`,
    `  Most Visionary:        ${stats.mostVisionary || 'N/A'}`,
    `  Most Resistant:        ${stats.mostResistant || 'N/A'}`,
    `  Most Efficient:        ${stats.mostEfficient || 'N/A'}`,
    `  Wisest:                ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(135, 206, 235)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: TitaniumFrontierResult): string {
  const lines: string[] = [
    chalk.bold('Titanium Frontier Analysis'),
    '',
    formatPanelsTable(result.panels),
    '',
    formatModulesTable(result.modules),
    '',
    chalk.bold('Space Overview'),
    '',
    `  Avg Strength:     ${colorScore(result.space.avgStrength)}`,
    `  Avg Vision:       ${colorScore(result.space.avgVision)}`,
    `  Avg Wisdom:       ${colorScore(result.space.avgWisdom)}`,
    `  Overall Grade:    ${colorScore(result.space.overallGrade)}`,
    `  Is Titanium:      ${result.space.isTitanium ? chalk.rgb(135, 206, 235)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: TitaniumFrontierResult): string {
  return JSON.stringify(result, null, 2)
}
