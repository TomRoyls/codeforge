import chalk from 'chalk'

import type {
  PipelineSegment,
  PipelineZone,
  PipelineValveStats,
  PipelineValveResult,
} from './pipeline-valve-helpers.js'

// ─── Color Helpers ───────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example materialColor('steel') returns metallic string */
export function materialColor(material: string): string {
  switch (material) {
    case 'steel': return chalk.rgb(149, 165, 166)(material)
    case 'copper': return chalk.rgb(211, 84, 0)(material)
    case 'pvc': return chalk.rgb(52, 152, 219)(material)
    case 'cast-iron': return chalk.rgb(127, 140, 141)(material)
    case 'lead': return chalk.rgb(44, 62, 80)(material)
    case 'bamboo': return chalk.rgb(39, 174, 96)(material)
    default: return material
  }
}

/** @example conditionColor('high-pressure-system') returns bold string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'high-pressure-system': return chalk.rgb(46, 204, 113).bold(condition)
    case 'modern-pipeline': return chalk.rgb(52, 152, 219)(condition)
    case 'standard-piping': return chalk.rgb(241, 196, 15)(condition)
    case 'aging-infrastructure': return chalk.rgb(230, 126, 34)(condition)
    case 'leaky-pipes': return chalk.rgb(231, 76, 60)(condition)
    case 'burst-main': return chalk.rgb(192, 57, 43).bold(condition)
    default: return condition
  }
}

/** @example valveTypeColor('gate') returns colored string */
export function valveTypeColor(type: string): string {
  switch (type) {
    case 'gate': return chalk.rgb(46, 204, 113)(type)
    case 'ball': return chalk.rgb(52, 152, 219)(type)
    case 'butterfly': return chalk.rgb(155, 89, 182)(type)
    case 'check': return chalk.rgb(241, 196, 15)(type)
    case 'pressure-reducing': return chalk.rgb(230, 126, 34)(type)
    case 'broken': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example pressureLevelColor('optimal') returns colored string */
export function pressureLevelColor(level: string): string {
  switch (level) {
    case 'optimal': return chalk.rgb(46, 204, 113)(level)
    case 'low': return chalk.rgb(52, 152, 219)(level)
    case 'high': return chalk.rgb(241, 196, 15)(level)
    case 'critical': return chalk.rgb(230, 126, 34)(level)
    case 'vacuum': return chalk.rgb(155, 89, 182)(level)
    case 'explosive': return chalk.rgb(231, 76, 60)(level)
    default: return level
  }
}

/** @example flowPatternColor('laminar') returns colored string */
export function flowPatternColor(pattern: string): string {
  switch (pattern) {
    case 'laminar': return chalk.rgb(46, 204, 113)(pattern)
    case 'steady': return chalk.rgb(52, 152, 219)(pattern)
    case 'pulsating': return chalk.rgb(241, 196, 15)(pattern)
    case 'turbulent': return chalk.rgb(230, 126, 34)(pattern)
    case 'stagnant': return chalk.rgb(149, 165, 166)(pattern)
    case 'geyser': return chalk.rgb(231, 76, 60)(pattern)
    default: return pattern
  }
}

/** @example leakStatusColor('sealed') returns colored string */
export function leakStatusColor(status: string): string {
  switch (status) {
    case 'sealed': return chalk.rgb(46, 204, 113)(status)
    case 'minor-seep': return chalk.rgb(52, 152, 219)(status)
    case 'dripping': return chalk.rgb(241, 196, 15)(status)
    case 'leaking': return chalk.rgb(230, 126, 34)(status)
    case 'gushing': return chalk.rgb(231, 76, 60)(status)
    case 'ruptured': return chalk.rgb(192, 57, 43).bold(status)
    default: return status
  }
}

/** @example filtrationTypeColor('reverse-osmosis') returns colored string */
export function filtrationTypeColor(type: string): string {
  switch (type) {
    case 'reverse-osmosis': return chalk.rgb(46, 204, 113)(type)
    case 'carbon': return chalk.rgb(52, 152, 219)(type)
    case 'sand': return chalk.rgb(241, 196, 15)(type)
    case 'mesh': return chalk.rgb(230, 126, 34)(type)
    case 'sieve': return chalk.rgb(155, 89, 182)(type)
    case 'none': return chalk.rgb(149, 165, 166)(type)
    default: return type
  }
}

/** @example engineerGradeColor('chief-engineer') returns bold string */
export function engineerGradeColor(grade: string): string {
  switch (grade) {
    case 'chief-engineer': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-engineer': return chalk.rgb(52, 152, 219)(grade)
    case 'engineer': return chalk.rgb(241, 196, 15)(grade)
    case 'plumber': return chalk.rgb(230, 126, 34)(grade)
    case 'apprentice': return chalk.rgb(231, 76, 60)(grade)
    case 'wrench-monkey': return chalk.rgb(192, 57, 43)(grade)
    default: return grade
  }
}

/** @example zoneCondColor('municipal-standard') returns colored string */
export function zoneCondColor(condition: string): string {
  switch (condition) {
    case 'municipal-standard': return chalk.rgb(46, 204, 113)(condition)
    case 'industrial-grade': return chalk.rgb(52, 152, 219)(condition)
    case 'residential': return chalk.rgb(241, 196, 15)(condition)
    case 'temporary': return chalk.rgb(230, 126, 34)(condition)
    case 'makeshift': return chalk.rgb(231, 76, 60)(condition)
    case 'broken': return chalk.rgb(192, 57, 43)(condition)
    default: return condition
  }
}

// ─── Format Reading ──────────────────────────────────────────────────────────

/** @example formatSegment(segment, false) returns formatted string */
export function formatSegment(segment: PipelineSegment, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(segment.file)} ${conditionColor(segment.condition)} ${scoreColor(segment.qualityScore)}`)
  lines.push(`    Pipe: ${scoreColor(segment.pipeIntegrity)} ${materialColor(segment.pipe.material)} | Valve: ${scoreColor(segment.valveControl)} ${valveTypeColor(segment.valve.type)}`)
  lines.push(`    Pressure: ${scoreColor(segment.pressureRegulation)} ${pressureLevelColor(segment.pressure.level)} | Flow: ${scoreColor(segment.flowRate)} ${flowPatternColor(segment.flow.pattern)}`)
  lines.push(`    Leak: ${scoreColor(segment.leakDetection)} ${leakStatusColor(segment.leak.status)} | Filtration: ${scoreColor(segment.filtrationQuality)} ${filtrationTypeColor(segment.filtration.type)}`)

  if (verbose) {
    if (segment.pipe.hasCorrosion) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Corrosion:')} ${segment.pipe.corrosionCount} points`)
    if (segment.pipe.hasBlockage) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Blockage:')} ${segment.pipe.blockageCount} points`)
    if (segment.valve.hasStuckValve) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Stuck valve:')} ${segment.valve.stuckCount} points`)
    if (segment.pressure.hasBurst) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Burst risk:')} ${segment.pressure.burstCount} points`)
    if (segment.flow.hasStagnation) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Stagnation:')} ${segment.flow.stagnationCount} points`)
    if (segment.leak.leakPointCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Leak points:')} ${segment.leak.leakPointCount}`)
  }

  return lines.join('\n')
}

/** @example formatZone(zone, false) returns formatted string */
export function formatZone(zone: PipelineZone, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(zone.directory)} ${zoneCondColor(zone.condition)} (${zone.zoneType})`)
  lines.push(`  Avg Pipe: ${scoreColor(zone.avgPipeIntegrity)} | Avg Valve: ${scoreColor(zone.avgValveControl)} | Avg Flow: ${scoreColor(zone.avgFlowRate)}`)

  if (verbose) {
    lines.push(`  High-pressure: ${zone.highPressureCount} | Burst-main: ${zone.burstMainCount} | Sealed: ${zone.sealedCount} | Laminar: ${zone.laminarCount}`)
    for (const seg of zone.segments) {
      lines.push(formatSegment(seg, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: PipelineValveStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Pipeline Network Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Zones: ${stats.totalZones}`)
  lines.push(`Avg Pipe: ${scoreColor(stats.avgPipeIntegrity)} | Avg Valve: ${scoreColor(stats.avgValveControl)} | Avg Pressure: ${scoreColor(stats.avgPressureRegulation)}`)
  lines.push(`Avg Flow: ${scoreColor(stats.avgFlowRate)} | Avg Leak Detection: ${scoreColor(stats.avgLeakDetection)} | Avg Filtration: ${scoreColor(stats.avgFiltrationQuality)}`)
  lines.push(`Overall Flow: ${scoreColor(stats.overallFlow)} | Engineer Grade: ${engineerGradeColor(stats.engineerGrade)}`)
  lines.push(`Conditions: HP=${stats.highPressureSystemCount} Modern=${stats.modernPipelineCount} Standard=${stats.standardPipingCount} Aging=${stats.agingInfrastructureCount} Leaky=${stats.leakyPipesCount} Burst=${stats.burstMainCount}`)
  lines.push(`Best: ${stats.bestSegment} | Strongest Pipe: ${stats.strongestPipe} | Best Valve: ${stats.bestValve}`)
  return lines.join('\n')
}

// ─── Table Format ────────────────────────────────────────────────────────────

/** @example formatPipelineValveTable(result, false) returns full table */
export function formatPipelineValveTable(result: PipelineValveResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Pipeline Valve Analysis ===\n'))

  if (result.segments.length > 0) {
    lines.push(chalk.bold('Segments:'))
    for (const seg of result.segments) {
      lines.push(formatSegment(seg, verbose))
    }
  }

  if (result.zones.length > 0) {
    lines.push(chalk.bold('\nZones:'))
    for (const zone of result.zones) {
      lines.push(formatZone(zone, verbose))
    }
  }

  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('\nRecommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON Format ─────────────────────────────────────────────────────────────

/** @example formatPipelineValveJson(result) returns JSON string */
export function formatPipelineValveJson(result: PipelineValveResult): string {
  return JSON.stringify(result, null, 2)
}
