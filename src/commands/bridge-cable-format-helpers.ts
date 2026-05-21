import chalk from 'chalk'
import type { BridgeCableResult, CableSegment, BridgeSpan } from './bridge-cable-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'new': return chalk.rgb(100, 255, 100)(c)
    case 'good': return chalk.green(c)
    case 'fair': return chalk.blue(c)
    case 'worn': return chalk.yellow(c)
    case 'deteriorated': return chalk.rgb(255, 165, 0)(c)
    case 'critical': return chalk.red(c)
    case 'failed': return chalk.rgb(200, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function materialColor(m: string): string {
  switch (m) {
    case 'steel': return chalk.rgb(180, 180, 200)(m)
    case 'carbon-fiber': return chalk.rgb(50, 50, 50)(m)
    case 'concrete': return chalk.gray(m)
    case 'wood': return chalk.rgb(180, 130, 70)(m)
    case 'rope': return chalk.rgb(200, 150, 100)(m)
    case 'chain': return chalk.rgb(150, 150, 170)(m)
    default: return chalk.dim(m)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'structural-engineer': return chalk.rgb(255, 215, 0)(g)
    case 'civil-engineer': return chalk.green(g)
    case 'architect': return chalk.blue(g)
    case 'draftsman': return chalk.cyan(g)
    case 'handyman': return chalk.yellow(g)
    case 'toddler': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function spanCondColor(c: string): string {
  switch (c) {
    case 'sound': return chalk.green(c)
    case 'serviceable': return chalk.blue(c)
    case 'needs-repair': return chalk.yellow(c)
    case 'weight-restricted': return chalk.rgb(255, 165, 0)(c)
    case 'condemned': return chalk.red(c)
    case 'collapsed': return chalk.rgb(200, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

// ─── Segment Formatting ──────────────────────────────────────────────────────

function formatSegment(seg: CableSegment, verbose: boolean): string {
  const line = ` ${conditionColor(seg.condition)} ${materialColor(seg.material)} ${chalk.bold(seg.file)} t:${scoreColor(seg.tension)} s:${scoreColor(seg.strength)} q:${scoreColor(seg.qualityScore)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    load:${scoreColor(seg.load.totalLoad)}/${scoreColor(seg.load.loadCapacity)} ratio:${seg.load.loadRatio.toFixed(2)} safety:${seg.load.safetyFactor.toFixed(2)} ${seg.load.isOverloaded ? chalk.red('OVERLOADED') : chalk.green('OK')}`)
  details.push(`    stress: ten:${scoreColor(seg.stress.tensile)} cmp:${scoreColor(seg.stress.compressive)} shr:${scoreColor(seg.stress.shear)} tor:${scoreColor(seg.stress.torsion)} ${seg.stress.isWithinLimits ? chalk.green('SAFE') : chalk.red('EXCEEDED')}`)
  details.push(`    fatigue:${scoreColor(seg.fatigue)} elastic:${scoreColor(seg.elasticity)} type:${seg.cableType} conns:${seg.connections.connectionCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format bridge cable result as a table
 * @example
 * formatBridgeCableTable(result, false) // string
 */
export function formatBridgeCableTable(result: BridgeCableResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌉 Bridge Cable - Code Structural Tension Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔗 Cable Segments'))
  if (result.segments.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.segments : result.segments.slice(0, 15)
    for (const seg of display) {
      lines.push(formatSegment(seg, verbose))
    }
    if (!verbose && result.segments.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.segments.length - 15} more`))
    }
  }
  lines.push('')

  if (result.spans.length > 0) {
    lines.push(chalk.bold('🏗️ Bridge Spans'))
    for (const sp of result.spans) {
      lines.push(`  ${chalk.bold(sp.directory)} ${spanCondColor(sp.condition)} health:${scoreColor(sp.structuralHealth)} tension:${scoreColor(sp.avgTension)} strength:${scoreColor(sp.avgStrength)} type:${sp.bridgeType}`)
    }
    lines.push('')
  }

  const net = result.network
  lines.push(chalk.bold('🌐 Network'))
  lines.push(`  Tension: ${scoreColor(net.avgTension)} | Strength: ${scoreColor(net.avgStrength)} | Load Ratio: ${net.avgLoadRatio.toFixed(2)} | Safety: ${net.overallSafetyFactor.toFixed(2)}`)
  lines.push(`  Sound: ${net.isStructurallySound ? chalk.green('YES') : chalk.red('NO')} | Overloaded: ${net.totalOverloaded} | Critical: ${net.totalCritical} | Failures: ${net.hasFailures ? chalk.red('YES') : chalk.green('NONE')}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.engineerGrade)} | Files: ${s.totalFiles} | Spans: ${s.totalSpans} | Health: ${scoreColor(s.overallStructuralHealth)}`)
  lines.push(`  Main:${s.mainCables} Stays:${s.stays} Towers:${s.towers} Anch:${s.anchorages} Steel:${s.steelSegments} Rope:${s.ropeSegments}`)
  lines.push(`  Overloaded:${s.overloadedCount} Critical:${s.criticalCount} Failed:${s.failedCount} Cracks:${s.stressCracksCount} Fatigue:${s.fatigueSignsCount} Corrosion:${s.corrosionCount} SPOF:${s.singlePointsOfFailure}`)
  lines.push(`  Strongest: ${chalk.green(s.strongestSegment)} | Weakest: ${chalk.red(s.weakestSegment)} | Heaviest: ${chalk.yellow(s.heaviestLoad)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format bridge cable result as JSON
 * @example
 * formatBridgeCableJson(result) // string
 */
export function formatBridgeCableJson(result: BridgeCableResult): string {
  return JSON.stringify(result, null, 2)
}
