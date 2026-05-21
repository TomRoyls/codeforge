import chalk from 'chalk'
import type { SnowLayer, MountainFace, AvalanchePathResult } from './avalanche-path-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'bomb-proof': return chalk.rgb(255, 215, 0)(c)
    case 'stable': return chalk.green(c)
    case 'moderate': return chalk.blue(c)
    case 'sensitive': return chalk.yellow(c)
    case 'touchy': return chalk.rgb(255, 165, 0)(c)
    case 'hair-trigger': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function riskColor(r: string): string {
  switch (r) {
    case 'safe': return chalk.green(r)
    case 'low': return chalk.rgb(144, 238, 144)(r)
    case 'moderate': return chalk.yellow(r)
    case 'considerable': return chalk.rgb(255, 165, 0)(r)
    case 'high': return chalk.rgb(255, 69, 0)(r)
    case 'extreme': return chalk.red(r)
    default: return chalk.dim(r)
  }
}

function overallColor(o: string): string {
  switch (o) {
    case 'green': return chalk.green(o)
    case 'yellow': return chalk.yellow(o)
    case 'orange': return chalk.rgb(255, 165, 0)(o)
    case 'red': return chalk.red(o)
    case 'black': return chalk.rgb(139, 0, 0)(o)
    default: return chalk.dim(o)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'head-patroller': return chalk.rgb(255, 215, 0)(g)
    case 'patroller': return chalk.green(g)
    case 'ski-guide': return chalk.blue(g)
    case 'skier': return chalk.cyan(g)
    case 'novice': return chalk.yellow(g)
    case 'buried': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Layer Formatting ────────────────────────────────────────────────────────

function formatLayer(l: SnowLayer, verbose: boolean): string {
  const line = ` ${conditionColor(l.condition)} ${chalk.bold(l.file)} stab:${scoreColor(l.snowpackStability)} trig:${scoreColor(l.triggerSensitivity)} prop:${scoreColor(l.propagationSpeed)} rescue:${scoreColor(l.rescuePotential)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    slab:${scoreColor(l.slabThickness)} runout:${scoreColor(l.runoutDistance)} quality:${scoreColor(l.qualityScore)} risk:${riskColor(l.avalanche.riskLevel)}`)
  details.push(`    terrain: slope:${l.terrain.slope} aspect:${l.terrain.aspect} elev:${l.terrain.elevation} convex:${l.terrain.isConvex ? chalk.green('Y') : chalk.red('N')} cliff:${l.terrain.hasCliff ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    snow: depth:${l.snow.depth} density:${l.snow.density} temp:${l.snow.temperature} wet:${l.snow.isWet ? chalk.red('Y') : chalk.green('N')} packed:${l.snow.isPacked ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    rescue: transceiver:${l.rescue.hasTransceiver ? chalk.green('Y') : chalk.red('N')} probe:${l.rescue.hasProbe ? chalk.green('Y') : chalk.red('N')} shovel:${l.rescue.hasShovel ? chalk.green('Y') : chalk.red('N')} readiness:${scoreColor(l.rescue.rescueReadiness)}`)
  return details.join('\n')
}

// ─── Face Formatting ─────────────────────────────────────────────────────────

function formatFace(f: MountainFace): string {
  return `  ${chalk.bold(f.directory)} ${overallColor(f.overallRisk)} ${f.faceType} stab:${scoreColor(f.avgStability)} trig:${scoreColor(f.avgTriggerSensitivity)} prop:${scoreColor(f.avgPropagationSpeed)} safe:${f.safeCount} extreme:${f.extremeCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format avalanche path result as a table
 * @example
 * formatAvalanchePathTable(result, false) // string
 */
export function formatAvalanchePathTable(result: AvalanchePathResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏔️  Avalanche Path - Cascade/Failure Propagation Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('❄️  Snow Layers'))
  if (result.layers.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.layers : result.layers.slice(0, 15)
    for (const l of display) {
      lines.push(formatLayer(l, verbose))
    }
    if (!verbose && result.layers.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.layers.length - 15} more`))
    }
  }
  lines.push('')

  if (result.faces.length > 0) {
    lines.push(chalk.bold('⛰️  Mountain Faces'))
    for (const f of result.faces) {
      lines.push(formatFace(f))
    }
    lines.push('')
  }

  const m = result.mountain
  lines.push(chalk.bold('🗻 Mountain Overview'))
  lines.push(`  Stability:${scoreColor(m.avgStability)} Trigger:${scoreColor(m.avgTriggerSensitivity)} Propagation:${scoreColor(m.avgPropagationSpeed)} Rescue:${scoreColor(m.avgRescuePotential)} Safe:${m.isSafe ? chalk.green('YES') : chalk.red('NO')} Risk:${scoreColor(m.overallRisk)}`)
  lines.push(`  TriggerPts:${m.totalTriggerPoints} PropPaths:${m.totalPropagationPaths}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.patrollerGrade)} | Risk: ${scoreColor(s.overallRisk)} | Files: ${s.totalFiles} | Faces: ${s.totalFaces}`)
  lines.push(`  BombProof:${s.bombProofCount} Stable:${s.stableCount} Moderate:${s.moderateCount} Sensitive:${s.sensitiveCount} Touchy:${s.touchyCount} HairTrigger:${s.hairTriggerCount}`)
  lines.push(`  SafeRisk:${s.safeRiskCount} HighRisk:${s.highRiskCount} ExtremeRisk:${s.extremeRiskCount} Contained:${s.containedCount} Uncontained:${s.uncontainedCount}`)
  lines.push(`  AvgStab:${scoreColor(s.avgSnowpackStability)} AvgSlab:${scoreColor(s.avgSlabThickness)} AvgTrig:${scoreColor(s.avgTriggerSensitivity)} AvgProp:${scoreColor(s.avgPropagationSpeed)}`)
  lines.push(`  Transceivers:${s.hasTransceiverCount} Probes:${s.hasProbeCount} Shovels:${s.hasShovelCount} Airbags:${s.hasAirbagCount}`)
  lines.push(`  TriggerPts:${s.totalTriggerPoints} PropPaths:${s.totalPropagationPaths} RunoutZones:${s.totalRunoutZones} Barriers:${s.totalBarriers}`)
  lines.push(`  MostStable:${chalk.green(s.mostStable)} | MostUnstable:${chalk.red(s.mostUnstable)} | MostSensitive:${chalk.yellow(s.mostSensitive)}`)
  lines.push(`  BestRescue:${chalk.cyan(s.bestRescueReady)} | WorstCascader:${chalk.rgb(255, 69, 0)(s.worstCascader)}`)

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
 * Format avalanche path result as JSON
 * @example
 * formatAvalanchePathJson(result) // string
 */
export function formatAvalanchePathJson(result: AvalanchePathResult): string {
  return JSON.stringify(result, null, 2)
}
