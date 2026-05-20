import chalk from 'chalk'

import type { XrayBone, XrayResult, XrayStats } from './xray-helpers.js'

// ─── Bone Diagram ─────────────────────────────────────────────────────────────

/**
 * Get symbol for bone type.
 *
 * @example
 * getBoneSymbol('skeleton')
 */
export function getBoneSymbol(type: string): string {
  switch (type) {
    case 'skeleton': return '█'
    case 'joint': return '○'
    case 'muscle': return '▓'
    case 'nerve': return '⚡'
    case 'vein': return '≈'
    default: return '?'
  }
}

/**
 * Get color for bone type.
 *
 * @example
 * getBoneColor('skeleton')('text')
 */
export function getBoneColor(type: string): (text: string) => string {
  switch (type) {
    case 'skeleton': return chalk.rgb(255, 255, 255)
    case 'joint': return chalk.rgb(0, 191, 255)
    case 'muscle': return chalk.rgb(220, 50, 50)
    case 'nerve': return chalk.rgb(255, 215, 0)
    case 'vein': return chalk.rgb(50, 205, 50)
    default: return chalk.gray
  }
}

/**
 * Format skeletal structure diagram.
 *
 * @example
 * formatBoneDiagram(bones)
 */
export function formatBoneDiagram(bones: XrayBone[]): string {
  if (bones.length === 0) return chalk.gray('  No bones detected')

  const lines: string[] = []
  lines.push(chalk.bold('  Skeletal Structure'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const bone of bones) {
    const sym = getBoneSymbol(bone.type)
    const color = getBoneColor(bone.type)
    const barLen = Math.max(1, Math.round(bone.strength / 10))
    const bar = sym.repeat(barLen)
    lines.push(`  ${color(bone.type.padEnd(10))} ${color(bar)} ${bone.strength} (${bone.files.length} files)`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Contract Risk Table ──────────────────────────────────────────────────────

/**
 * Format contract risk table.
 *
 * @example
 * formatContractTable(contracts)
 */
export function formatContractTable(contracts: XrayResult['contracts']): string {
  if (contracts.length === 0) return chalk.gray('  No implicit contracts detected')

  const lines: string[] = []
  lines.push(chalk.bold('  Implicit Contracts'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const c of contracts.slice(0, 10)) {
    const riskColor = c.risk === 'high' ? chalk.rgb(220, 50, 50) : c.risk === 'medium' ? chalk.rgb(255, 165, 0) : chalk.rgb(50, 205, 50)
    lines.push(`  ${riskColor(c.risk.toUpperCase().padEnd(6))} ${c.type.padEnd(15)} ${c.between[0]} ↔ ${c.between[1]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Duplication Heatmap ──────────────────────────────────────────────────────

/**
 * Format duplication heatmap.
 *
 * @example
 * formatDuplicationHeatmap(duplications)
 */
export function formatDuplicationHeatmap(duplications: XrayResult['duplications']): string {
  if (duplications.length === 0) return chalk.gray('  No hidden duplications detected')

  const lines: string[] = []
  lines.push(chalk.bold('  Duplication Heatmap'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const d of duplications) {
    const heat = d.similarity > 70 ? chalk.rgb(220, 50, 50) : d.similarity > 40 ? chalk.rgb(255, 165, 0) : chalk.rgb(50, 205, 50)
    const bar = '█'.repeat(Math.max(1, Math.round(d.similarity / 10)))
    lines.push(`  ${d.pattern.padEnd(20)} ${heat(bar)} ${d.similarity}% (${d.files.length} files, ${d.lines} instances)`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Hidden Dependency Graph ──────────────────────────────────────────────────

/**
 * Format hidden dependency graph.
 *
 * @example
 * formatHiddenDepGraph(deps)
 */
export function formatHiddenDepGraph(deps: XrayResult['hiddenDeps']): string {
  if (deps.length === 0) return chalk.gray('  No hidden dependencies detected')

  const lines: string[] = []
  lines.push(chalk.bold('  Hidden Dependencies'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (const d of deps.slice(0, 10)) {
    const riskColor = d.risk === 'high' ? chalk.rgb(220, 50, 50) : d.risk === 'medium' ? chalk.rgb(255, 165, 0) : chalk.rgb(50, 205, 50)
    lines.push(`  ${d.type.padEnd(16)} ${d.from} → ${d.dependency} ${riskColor(`[${d.risk}]`)}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Health Meter ─────────────────────────────────────────────────────────────

/**
 * Format structural health meter.
 *
 * @example
 * formatHealthMeter(85)
 */
export function formatHealthMeter(health: number): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Structural Health'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  const filled = Math.round(health / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = health > 70 ? chalk.rgb(50, 205, 50) : health > 40 ? chalk.rgb(255, 165, 0) : chalk.rgb(220, 50, 50)
  lines.push(`  ${color(bar)} ${health}%`)

  lines.push('')
  return lines.join('\n')
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Format X-ray stats.
 *
 * @example
 * formatXrayStats(stats)
 */
export function formatXrayStats(stats: XrayStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  X-Ray Statistics'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))
  lines.push(`  Bone Count          ${stats.boneCount}`)
  lines.push(`  Skeleton Strength   ${stats.skeletonStrength}`)
  lines.push(`  Joint Flexibility   ${stats.jointFlexibility}`)
  lines.push(`  Implicit Contracts  ${stats.implicitContracts}`)
  lines.push(`  High-Risk Contracts ${stats.highRiskContracts}`)
  lines.push(`  Hidden Duplications ${stats.hiddenDuplications}`)
  lines.push(`  Duplication Lines   ${stats.totalDuplicationLines}`)
  lines.push(`  Hidden Dependencies ${stats.hiddenDependencyCount}`)
  lines.push(`  High-Risk Deps      ${stats.highRiskDeps}`)
  lines.push(`  Structural Health   ${stats.structuralHealth}%`)

  lines.push('')
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format X-ray recommendations.
 *
 * @example
 * formatXrayRecommendations(recs)
 */
export function formatXrayRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')

  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations'))
  lines.push(chalk.gray('  ─' + '─'.repeat(50)))

  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }

  lines.push('')
  return lines.join('\n')
}

// ─── Table Output ─────────────────────────────────────────────────────────────

/**
 * Format full X-ray table output.
 *
 * @example
 * formatXrayTable(result)
 */
export function formatXrayTable(result: XrayResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 255, 200)('\n  Code X-Ray — Structural Analysis\n'))
  parts.push(formatBoneDiagram(result.bones))
  parts.push(formatContractTable(result.contracts))
  parts.push(formatDuplicationHeatmap(result.duplications))
  parts.push(formatHiddenDepGraph(result.hiddenDeps))
  parts.push(formatHealthMeter(result.stats.structuralHealth))
  parts.push(formatXrayStats(result.stats))
  parts.push(formatXrayRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ──────────────────────────────────────────────────────────────

/**
 * Format X-ray result as JSON.
 *
 * @example
 * formatXrayJSON(result)
 */
export function formatXrayJSON(result: XrayResult): string {
  return JSON.stringify(result, null, 2)
}
