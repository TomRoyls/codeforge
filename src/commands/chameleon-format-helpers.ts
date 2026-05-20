import chalk from 'chalk'
import type { ChameleonResult, AdaptabilityScore, ColorShift, ChameleonStats, RigidPoint } from './chameleon-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function classificationColor(c: string): string {
  if (c === 'shapeshifter') return chalk.green(c)
  if (c === 'adaptive') return chalk.blue(c)
  if (c === 'flexible') return chalk.cyan(c)
  if (c === 'rigid') return chalk.yellow(c)
  return chalk.red(c)
}

function overallColor(o: string): string {
  if (o === 'protean') return chalk.green(o)
  if (o === 'adaptive') return chalk.blue(o)
  if (o === 'moderate') return chalk.cyan(o)
  if (o === 'rigid') return chalk.yellow(o)
  return chalk.red(o)
}

function rigidTypeColor(t: string): string {
  if (t === 'hardcoded') return chalk.red(t)
  if (t === 'tightly-coupled') return chalk.magenta(t)
  if (t === 'concrete-only') return chalk.yellow(t)
  if (t === 'magic-value') return chalk.dim(t)
  return chalk.dim(t)
}

function severityColor(s: string): string {
  if (s === 'major') return chalk.red(s)
  if (s === 'moderate') return chalk.yellow(s)
  return chalk.dim(s)
}

function contextColor(c: string): string {
  if (c === 'environment') return chalk.green(c)
  if (c === 'platform') return chalk.blue(c)
  if (c === 'feature-flags') return chalk.cyan(c)
  if (c === 'configuration') return chalk.yellow(c)
  return chalk.dim(c)
}

// ─── Score Formatting ──────────────────────────────────────────────────────────

function formatScore(s: AdaptabilityScore): string {
  return `  ${chalk.bold(s.file)} ${classificationColor(s.classification)} flex:${scoreColor(s.flexibility)} poly:${scoreColor(s.polymorphism)} config:${scoreColor(s.configurability)} ext:${scoreColor(s.extensibility)} rigid:${scoreColor(s.rigidity)}`
}

// ─── Color Shift Formatting ────────────────────────────────────────────────────

function formatColorShift(shift: ColorShift): string {
  const handled = shift.isWellHandled ? chalk.green('✓') : chalk.red('✗')
  return `  ${contextColor(shift.context)} adapt:${scoreColor(shift.adaptability)} ${handled} (${shift.files.length} files)`
}

// ─── Rigid Point Formatting ────────────────────────────────────────────────────

function formatRigidPoint(r: RigidPoint): string {
  return `    L${r.location} ${rigidTypeColor(r.type)} ${severityColor(r.severity)}: ${r.description} → ${chalk.dim(r.flexibility)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: ChameleonStats): string {
  return [
    `  Overall: ${overallColor(stats.overallAdaptability)} | Index: ${scoreColor(stats.adaptabilityIndex)} | Flexibility: ${scoreColor(stats.flexibilityScore)} | Rigidity: ${scoreColor(stats.rigidityIndex)}`,
    `  Files: ${stats.totalFiles} (${chalk.green(String(stats.shapeshifterFiles))} shapeshifter, ${chalk.red(String(stats.fossilizedFiles))} fossilized)`,
    `  Adaptations: ${stats.totalAdaptations} | Rigid Points: ${stats.totalRigidPoints} (${chalk.red(String(stats.majorRigidPoints))} major)`,
    `  Avg Flexibility: ${scoreColor(stats.avgFlexibility)} | Avg Polymorphism: ${scoreColor(stats.avgPolymorphism)} | Avg Config: ${scoreColor(stats.avgConfigurability)} | Avg Ext: ${scoreColor(stats.avgExtensibility)}`,
    `  Hardcoded: ${stats.hardcodedValues} | Magic Numbers: ${stats.magicNumbers} | Concrete Only: ${stats.concreteOnlyFiles} | Contexts: ${stats.contextCount}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format chameleon result as a table
 * @example
 * formatChameleonTable(result, false) // string
 */
export function formatChameleonTable(result: ChameleonResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🦎 Chameleon — Code Adaptability Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📊 File Scores'))
  if (result.scores.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.scores : result.scores.slice(0, 10)
    lines.push(display.map(s => formatScore(s)).join('\n'))
  }
  lines.push('')

  if (result.colorShifts.length > 0) {
    lines.push(chalk.bold('🌈 Color Shifts (Contexts)'))
    lines.push(result.colorShifts.map(s => formatColorShift(s)).join('\n'))
    lines.push('')
  }

  const allRigid = result.scores.flatMap(s => s.rigidPoints)
  if (allRigid.length > 0) {
    lines.push(chalk.bold('🔒 Rigid Points'))
    const display = verbose ? allRigid : allRigid.slice(0, 8)
    lines.push(display.map(r => formatRigidPoint(r)).join('\n'))
    lines.push('')
  }

  lines.push(chalk.bold('📈 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format chameleon result as JSON
 * @example
 * formatChameleonJson(result) // string
 */
export function formatChameleonJson(result: ChameleonResult): string {
  return JSON.stringify(result, null, 2)
}
