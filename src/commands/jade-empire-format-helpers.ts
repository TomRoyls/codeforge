import chalk from 'chalk'

import type { JadeEmpireResult, JadeArtifact, JadeDynasty, DynastyCondition } from './jade-empire-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(100, 200, 140)(String(score))
  if (score >= 75) return chalk.rgb(80, 180, 120)(String(score))
  if (score >= 60) return chalk.rgb(60, 160, 100)(String(score))
  if (score >= 40) return chalk.rgb(80, 120, 140)(String(score))
  if (score >= 20) return chalk.rgb(60, 90, 110)(String(score))
  return chalk.gray(String(score))
}

/** @example colorDynastyCondition('jade-palace') */
export function colorDynastyCondition(condition: DynastyCondition | string): string {
  switch (condition) {
    case 'jade-palace': return chalk.rgb(100, 200, 140)('jade-palace')
    case 'noble-court': return chalk.rgb(80, 180, 120)('noble-court')
    case 'proper-temple': return chalk.rgb(60, 160, 100)('proper-temple')
    case 'stone-workshop': return chalk.rgb(80, 120, 140)('stone-workshop')
    case 'clay-hut': return chalk.rgb(60, 90, 110)('clay-hut')
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

/** @example formatArtifactTable(artifact) */
export function formatArtifactTable(artifact: JadeArtifact): string {
  const lines: string[] = [
    chalk.bold(`Jade Artifact: ${artifact.file}`),
    '',
    `  Imperial Serenity:    ${colorScore(artifact.imperialSerenity)}  ${chalk.dim(`(${artifact.meditating.calm})`)}`,
    `  Jade Purity:          ${colorScore(artifact.jadePurity)}  ${chalk.dim(`(${artifact.purifying.grade})`)}`,
    `  Carving Mastery:      ${colorScore(artifact.carvingMastery)}  ${chalk.dim(`(${artifact.carving.skill})`)}`,
    `  Dynasty Continuity:   ${colorScore(artifact.dynastyContinuity)}  ${chalk.dim(`(${artifact.continuing.era})`)}`,
    `  Emerald Wisdom:       ${colorScore(artifact.emeraldWisdom)}  ${chalk.dim(`(${artifact.knowing.insight})`)}`,
    '',
    `  Quality Score: ${colorScore(artifact.qualityScore)}  ${chalk.dim(`(${artifact.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatArtifactsTable(artifacts) */
export function formatArtifactsTable(artifacts: JadeArtifact[]): string {
  if (artifacts.length === 0) return chalk.dim('No jade artifacts found')
  const colWidths = {
    file: Math.max(4, ...artifacts.map((a) => a.file.length)),
    serenity: Math.max(8, ...artifacts.map((a) => String(a.imperialSerenity).length)),
    purity: Math.max(6, ...artifacts.map((a) => String(a.jadePurity).length)),
    mastery: Math.max(7, ...artifacts.map((a) => String(a.carvingMastery).length)),
    continuity: Math.max(10, ...artifacts.map((a) => String(a.dynastyContinuity).length)),
    wisdom: Math.max(6, ...artifacts.map((a) => String(a.emeraldWisdom).length)),
    score: Math.max(5, ...artifacts.map((a) => String(a.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Jade Artifacts'), '']
  const header =
    chalk.rgb(100, 200, 140)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Serenity', colWidths.serenity)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Purity', colWidths.purity)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Mastery', colWidths.mastery)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Continuity', colWidths.continuity)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(100, 200, 140)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('\u2500'.repeat(header.length)))
  for (const a of artifacts) {
    lines.push(
      padRight(a.file, colWidths.file) + '  ' +
      padLeft(String(a.imperialSerenity), colWidths.serenity) + '  ' +
      padLeft(String(a.jadePurity), colWidths.purity) + '  ' +
      padLeft(String(a.carvingMastery), colWidths.mastery) + '  ' +
      padLeft(String(a.dynastyContinuity), colWidths.continuity) + '  ' +
      padLeft(String(a.emeraldWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(a.qualityScore), colWidths.score),
    )
  }
  return lines.join('\n')
}

/** @example formatDynastyTable(dynasty) */
export function formatDynastyTable(dynasty: JadeDynasty): string {
  const lines: string[] = [
    chalk.bold(`Jade Dynasty: ${dynasty.directory}`),
    '',
    `  Artifacts:       ${dynasty.artifacts.length}`,
    `  Avg Serenity:    ${colorScore(dynasty.avgSerenity)}`,
    `  Avg Mastery:     ${colorScore(dynasty.avgMastery)}`,
    `  Avg Wisdom:      ${colorScore(dynasty.avgWisdom)}`,
    `  Masterpieces:    ${dynasty.imperialMasterpieceCount}`,
    `  Dynasty Type:    ${dynasty.dynastyType}`,
    `  Condition:       ${colorDynastyCondition(dynasty.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatDynastiesTable(dynasties) */
export function formatDynastiesTable(dynasties: JadeDynasty[]): string {
  if (dynasties.length === 0) return chalk.dim('No jade dynasties found')
  const lines: string[] = [chalk.bold('Jade Dynasties'), '']
  for (const d of dynasties) {
    lines.push(`  ${chalk.rgb(100, 200, 140)(d.directory)}  ${colorScore(d.avgSerenity)}  ${colorDynastyCondition(d.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: JadeEmpireResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Jade Empire Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Dynasties:          ${stats.totalDynasties}`,
    `  Avg Imperial Serenity:    ${colorScore(stats.avgImperialSerenity)}`,
    `  Avg Jade Purity:          ${colorScore(stats.avgJadePurity)}`,
    `  Avg Carving Mastery:      ${colorScore(stats.avgCarvingMastery)}`,
    `  Avg Dynasty Continuity:   ${colorScore(stats.avgDynastyContinuity)}`,
    `  Avg Emerald Wisdom:       ${colorScore(stats.avgEmeraldWisdom)}`,
    `  Imperial Masterpieces:    ${stats.imperialMasterpieceCount}`,
    `  Royal Jade:               ${stats.royalJadeCount}`,
    `  Proper Nephrite:          ${stats.properNephriteCount}`,
    `  Common Stone:             ${stats.commonStoneCount}`,
    `  River Rock:               ${stats.riverRockCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Harmony:          ${colorScore(stats.overallHarmony)}`,
    `  Artisan Grade:            ${stats.artisanGrade}`,
    `  Best Artifact:            ${stats.bestArtifact || 'N/A'}`,
    `  Most Serene:              ${stats.mostSerene || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Most Masterful:           ${stats.mostMasterful || 'N/A'}`,
    `  Most Enduring:            ${stats.mostEnduring || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(100, 200, 140)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: JadeEmpireResult): string {
  const lines: string[] = [
    chalk.bold('Jade Empire Analysis'),
    '',
    formatArtifactsTable(result.artifacts),
    '',
    formatDynastiesTable(result.dynasties),
    '',
    chalk.bold('Empire Overview'),
    '',
    `  Avg Serenity:       ${colorScore(result.empire.avgSerenity)}`,
    `  Avg Mastery:        ${colorScore(result.empire.avgMastery)}`,
    `  Avg Wisdom:         ${colorScore(result.empire.avgWisdom)}`,
    `  Overall Harmony:    ${colorScore(result.empire.overallHarmony)}`,
    `  Is Jade:            ${result.empire.isJade ? chalk.rgb(100, 200, 140)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: JadeEmpireResult): string {
  return JSON.stringify(result, null, 2)
}
