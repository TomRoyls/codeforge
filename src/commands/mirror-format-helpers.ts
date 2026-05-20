import chalk from 'chalk'

import type {
  Distortion,
  Intention,
  MirrorResult,
  MirrorStats,
  Reflection,
} from './mirror-helpers.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function alignmentBar(alignment: number): string {
  const filled = Math.round(alignment / 5)
  const empty = 20 - filled
  const bar = alignment >= 70
    ? chalk.rgb(76, 175, 80)('█'.repeat(filled))
    : alignment >= 40
      ? chalk.rgb(255, 193, 7)('█'.repeat(filled))
      : chalk.rgb(244, 67, 54)('█'.repeat(filled))
  return `${bar}${chalk.gray('░'.repeat(empty))} ${alignment}%`
}

function distortionIcon(type: string): string {
  switch (type) {
    case 'overengineered': return chalk.rgb(156, 39, 176)('⚙')
    case 'underdocumented': return chalk.rgb(255, 193, 7)('📝')
    case 'misnamed': return chalk.rgb(244, 67, 54)('🏷')
    case 'overpromised': return chalk.rgb(255, 87, 34)('📋')
    case 'hidden-complexity': return chalk.rgb(63, 81, 181)('🔍')
    default: return '●'
  }
}

function severityColor(severity: string, text: string): string {
  switch (severity) {
    case 'high': return chalk.rgb(244, 67, 54)(text)
    case 'medium': return chalk.rgb(255, 193, 7)(text)
    default: return chalk.gray(text)
  }
}

// ─── Reflections ───────────────────────────────────────────────────────────────

/**
 * Format reflections table.
 *
 * @example
 * formatReflections(reflections)
 */
export function formatReflections(reflections: Reflection[]): string {
  if (reflections.length === 0) return chalk.gray('  No reflections')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Reflections'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const r of reflections.slice(0, 20)) {
    const level = r.distortionLevel === 'none'
      ? chalk.rgb(76, 175, 80)('✓')
      : r.distortionLevel === 'extreme'
        ? chalk.rgb(244, 67, 54)('✗')
        : chalk.rgb(255, 193, 7)('~')
    lines.push(`  ${level} ${r.file.padEnd(30)} ${r.distortionLevel.padEnd(10)}`)
    lines.push(`    Self: ${r.selfImage}`)
    lines.push(`    Real: ${r.reality}`)
    if (r.gap !== 'No gap — self-image matches reality') {
      lines.push(`    Gap:  ${chalk.rgb(255, 152, 0)(r.gap)}`)
    }
  }

  if (reflections.length > 20) {
    lines.push(chalk.gray(`  ... and ${reflections.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Intentions ────────────────────────────────────────────────────────────────

/**
 * Format intentions with alignment.
 *
 * @example
 * formatIntentions(intentions)
 */
export function formatIntentions(intentions: Intention[]): string {
  if (intentions.length === 0) return chalk.gray('  No intentions')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Alignment'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const intent of intentions.slice(0, 20)) {
    lines.push(`  ${intent.file.padEnd(30)} ${alignmentBar(intent.alignment)}`)
    if (intent.stated.length > 0) {
      lines.push(`    Stated: ${intent.stated.slice(0, 2).join('; ')}`)
    }
    if (intent.actual.length > 0) {
      lines.push(`    Actual: ${intent.actual.slice(0, 3).join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Distortions ───────────────────────────────────────────────────────────────

/**
 * Format distortions catalog.
 *
 * @example
 * formatDistortions(distortions)
 */
export function formatDistortions(distortions: Distortion[]): string {
  if (distortions.length === 0) return chalk.gray('  No distortions detected')

  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Distortions'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  for (const d of distortions.slice(0, 15)) {
    const icon = distortionIcon(d.type)
    const sev = severityColor(d.severity, `[${d.severity.toUpperCase().padEnd(6)}]`)
    lines.push(`  ${icon} ${sev} ${d.type.padEnd(20)} ${d.file}`)
    lines.push(`       ${d.description}`)
    lines.push(`       → ${chalk.rgb(76, 175, 80)(d.correction)}`)
  }

  if (distortions.length > 15) {
    lines.push(chalk.gray(`  ... and ${distortions.length - 15} more`))
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format mirror stats.
 *
 * @example
 * formatMirrorStats(stats)
 */
export function formatMirrorStats(stats: MirrorStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Mirror Statistics'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  lines.push(`  Total Reflections:   ${stats.totalReflections}`)
  lines.push(`  Aligned:             ${stats.alignedCount}`)
  lines.push(`  Distorted:           ${stats.distortedCount}`)
  lines.push(`  Avg Alignment:       ${stats.avgAlignment}%`)
  lines.push(`  Most Aligned:        ${stats.mostAlignedFile}`)
  lines.push(`  Most Distorted:      ${stats.mostDistortedFile}`)
  lines.push(`  Overengineered:      ${stats.overengineeredCount}`)
  lines.push(`  Underdocumented:     ${stats.underdocumentedCount}`)
  lines.push(`  Misnamed:            ${stats.misnamedCount}`)
  lines.push(`  Overpromised:        ${stats.overpromisedCount}`)
  lines.push(`  Hidden Complexity:   ${stats.hiddenComplexityCount}`)
  lines.push(`  Overall Clarity:     ${alignmentBar(stats.overallClarity)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Add docs'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('  No recommendations')
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(40)))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full mirror result as table.
 *
 * @example
 * formatMirrorTable(result)
 */
export function formatMirrorTable(result: MirrorResult): string {
  const parts: string[] = []
  parts.push(chalk.bold.rgb(0, 188, 212)('\n  Mirror — Self-Reflection Analysis'))
  parts.push(chalk.gray(' ═'.repeat(50)))
  parts.push(formatReflections(result.reflections))
  parts.push(formatIntentions(result.intentions))
  parts.push(formatDistortions(result.distortions))
  parts.push(formatMirrorStats(result.stats))
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format full mirror result as JSON.
 *
 * @example
 * formatMirrorJSON(result)
 */
export function formatMirrorJSON(result: MirrorResult): string {
  return JSON.stringify(result, null, 2)
}
