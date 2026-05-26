import chalk from 'chalk'

import type { ChamberCondition, ChamberType, CosmicArtifact, CosmicCondition, CosmicTreasuryResult, CuratorGrade } from './cosmic-treasury-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(138, 43, 226)(String(score))
  if (score >= 75) return chalk.rgb(120, 60, 200)(String(score))
  if (score >= 60) return chalk.rgb(100, 75, 175)(String(score))
  if (score >= 40) return chalk.rgb(80, 60, 145)(String(score))
  if (score >= 20) return chalk.rgb(60, 45, 115)(String(score))
  return chalk.gray(String(score))
}

/** @example colorCosmicCondition('cosmic-masterpiece') */
export function colorCosmicCondition(condition: CosmicCondition | string): string {
  switch (condition) {
    case 'cosmic-masterpiece': return chalk.rgb(138, 43, 226)('cosmic-masterpiece')
    case 'stellar-gem': return chalk.rgb(120, 60, 200)('stellar-gem')
    case 'proper-star': return chalk.rgb(100, 75, 175)('proper-star')
    case 'dim-ember': return chalk.rgb(80, 60, 145)('dim-ember')
    case 'dark-void': return chalk.rgb(60, 45, 115)('dark-void')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorChamberType('grand-treasury') */
export function colorChamberType(type: ChamberType | string): string {
  switch (type) {
    case 'grand-treasury': return chalk.rgb(138, 43, 226)('grand-treasury')
    case 'stellar-vault': return chalk.rgb(120, 60, 200)('stellar-vault')
    case 'proper-chamber': return chalk.rgb(100, 75, 175)('proper-chamber')
    case 'storage-room': return chalk.rgb(80, 60, 145)('storage-room')
    case 'empty-closet': return chalk.rgb(60, 45, 115)('empty-closet')
    case 'no-chamber': return chalk.gray('no-chamber')
    default: return chalk.gray(String(type))
  }
}

/** @example colorChamberCondition('cosmic-palace') */
export function colorChamberCondition(condition: ChamberCondition | string): string {
  switch (condition) {
    case 'cosmic-palace': return chalk.rgb(138, 43, 226)('cosmic-palace')
    case 'star-fortress': return chalk.rgb(120, 60, 200)('star-fortress')
    case 'proper-vault': return chalk.rgb(100, 75, 175)('proper-vault')
    case 'stone-cellar': return chalk.rgb(80, 60, 145)('stone-cellar')
    case 'dusty-attic': return chalk.rgb(60, 45, 115)('dusty-attic')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorCuratorGrade('cosmic-curator') */
export function colorCuratorGrade(grade: CuratorGrade | string): string {
  switch (grade) {
    case 'cosmic-curator': return chalk.rgb(138, 43, 226)('cosmic-curator')
    case 'stellar-archivist': return chalk.rgb(120, 60, 200)('stellar-archivist')
    case 'proper-keeper': return chalk.rgb(100, 75, 175)('proper-keeper')
    case 'apprentice': return chalk.rgb(80, 60, 145)('apprentice')
    case 'novice': return chalk.rgb(60, 45, 115)('novice')
    case 'dusty-librarian': return chalk.gray('dusty-librarian')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatArtifactTable(artifact) */
export function formatArtifactTable(artifact: CosmicArtifact): string {
  const lines: string[] = [
    chalk.bold(`Cosmic Artifact: ${artifact.file}`),
    '',
    `  Stellar Vault:           ${colorScore(artifact.stellarVault)}  ${chalk.dim(`(${artifact.securing.treasury})`)}`,
    `  Nebula Clarity:          ${colorScore(artifact.nebulaClarity)}  ${chalk.dim(`(${artifact.illuminating.nebula})`)}`,
    `  Constellation Precision: ${colorScore(artifact.constellationPrecision)}  ${chalk.dim(`(${artifact.connecting.pattern})`)}`,
    `  Supernova Resilience:    ${colorScore(artifact.supernovaResilience)}  ${chalk.dim(`(${artifact.surviving.remnant})`)}`,
    `  Cosmic Wisdom:           ${colorScore(artifact.cosmicWisdom)}  ${chalk.dim(`(${artifact.understanding.cosmos})`)}`,
    '',
    `  Quality Score: ${colorScore(artifact.qualityScore)}  ${chalk.dim(`(${artifact.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatArtifactsTable(artifacts) */
export function formatArtifactsTable(artifacts: CosmicArtifact[]): string {
  if (artifacts.length === 0) return chalk.dim('No cosmic artifacts found')
  const lines: string[] = [chalk.bold('Cosmic Artifacts'), '']
  for (const a of artifacts) {
    lines.push(`  ${chalk.rgb(138, 43, 226)(a.file)}  Vlt:${colorScore(a.stellarVault)}  Clr:${colorScore(a.nebulaClarity)}  Score:${colorScore(a.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatChamberTable(chamber) */
export function formatChamberTable(chamber: CosmicTreasuryResult['chambers'][number]): string {
  const lines: string[] = [
    chalk.bold(`Cosmic Chamber: ${chamber.directory}`),
    '',
    `  Artifacts:       ${chamber.artifacts.length}`,
    `  Avg Vault:       ${colorScore(chamber.avgVault)}`,
    `  Avg Precision:   ${colorScore(chamber.avgPrecision)}`,
    `  Avg Wisdom:      ${colorScore(chamber.avgWisdom)}`,
    `  Masterpieces:    ${chamber.cosmicMasterpieceCount}`,
    `  Type:            ${colorChamberType(chamber.chamberType)}`,
    `  Condition:       ${colorChamberCondition(chamber.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatChambersTable(chambers) */
export function formatChambersTable(chambers: CosmicTreasuryResult['chambers']): string {
  if (chambers.length === 0) return chalk.dim('No cosmic chambers found')
  const lines: string[] = [chalk.bold('Cosmic Chambers'), '']
  for (const c of chambers) {
    lines.push(`  ${chalk.rgb(138, 43, 226)(c.directory)}  ${colorScore(c.avgVault)}  ${colorChamberCondition(c.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CosmicTreasuryResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Cosmic Treasury Statistics'),
    '',
    `  Total Files:                  ${stats.totalFiles}`,
    `  Total Chambers:               ${stats.totalChambers}`,
    `  Avg Stellar Vault:            ${colorScore(stats.avgStellarVault)}`,
    `  Avg Nebula Clarity:           ${colorScore(stats.avgNebulaClarity)}`,
    `  Avg Constellation Precision:  ${colorScore(stats.avgConstellationPrecision)}`,
    `  Avg Supernova Resilience:     ${colorScore(stats.avgSupernovaResilience)}`,
    `  Avg Cosmic Wisdom:            ${colorScore(stats.avgCosmicWisdom)}`,
    `  Cosmic Masterpieces:          ${stats.cosmicMasterpieceCount}`,
    `  Stellar Gems:                 ${stats.stellarGemCount}`,
    `  Proper Stars:                 ${stats.properStarCount}`,
    `  Dim Embers:                   ${stats.dimEmberCount}`,
    `  Dark Voids:                   ${stats.darkVoidCount}`,
    `  Void:                         ${stats.voidCount}`,
    `  Overall Brilliance:           ${colorScore(stats.overallBrilliance)}`,
    `  Curator Grade:                ${colorCuratorGrade(stats.curatorGrade)}`,
    `  Best Artifact:                ${stats.bestArtifact || 'N/A'}`,
    `  Most Secure:                  ${stats.mostSecure || 'N/A'}`,
    `  Clearest:                     ${stats.clearest || 'N/A'}`,
    `  Most Precise:                 ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:               ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                       ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(138, 43, 226)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CosmicTreasuryResult): string {
  const lines: string[] = [
    chalk.bold('Cosmic Treasury Analysis'),
    '',
    formatArtifactsTable(result.artifacts),
    '',
    formatChambersTable(result.chambers),
    '',
    chalk.bold('Universe Overview'),
    '',
    `  Avg Vault:           ${colorScore(result.universe.avgVault)}`,
    `  Avg Precision:       ${colorScore(result.universe.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(result.universe.avgWisdom)}`,
    `  Overall Brilliance:  ${colorScore(result.universe.overallBrilliance)}`,
    `  Is Cosmic:           ${result.universe.isCosmic ? chalk.rgb(138, 43, 226)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  if (result.celebration) {
    lines.push('', chalk.rgb(138, 43, 226).bold(result.celebration))
  }
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CosmicTreasuryResult): string {
  return JSON.stringify(result, null, 2)
}
