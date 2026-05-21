import chalk from 'chalk'

import type {
  GlacierReading,
  IceField,
  GlacierFieldStats,
  GlacierFieldResult,
} from './glacier-field-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('crystal-glacier') returns bold green string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'crystal-glacier': return chalk.rgb(46, 204, 113).bold(condition)
    case 'healthy-glacier': return chalk.rgb(52, 152, 219)(condition)
    case 'stable-icefield': return chalk.rgb(155, 89, 182)(condition)
    case 'retreating-glacier': return chalk.rgb(241, 196, 15)(condition)
    case 'dirty-ice': return chalk.rgb(230, 126, 34)(condition)
    case 'rock-glacier': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example iceTypeColor('blue-ice') returns colored string */
export function iceTypeColor(type: string): string {
  switch (type) {
    case 'blue-ice': return chalk.rgb(46, 204, 113)(type)
    case 'clear-ice': return chalk.rgb(52, 152, 219)(type)
    case 'white-ice': return chalk.rgb(236, 240, 241)(type)
    case 'firn': return chalk.rgb(155, 89, 182)(type)
    case 'slush': return chalk.rgb(230, 126, 34)(type)
    case 'dirty-ice': return chalk.rgb(149, 165, 166)(type)
    default: return type
  }
}

/** @example flowStateColor('advancing') returns colored string */
export function flowStateColor(state: string): string {
  switch (state) {
    case 'advancing': return chalk.rgb(46, 204, 113)(state)
    case 'stable': return chalk.rgb(52, 152, 219)(state)
    case 'retreating': return chalk.rgb(241, 196, 15)(state)
    case 'surging': return chalk.rgb(230, 126, 34)(state)
    case 'stagnant': return chalk.rgb(149, 165, 166)(state)
    case 'calving': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example crevasseTypeColor('none') returns colored string */
export function crevasseTypeColor(type: string): string {
  switch (type) {
    case 'none': return chalk.rgb(46, 204, 113)(type)
    case 'snow-bridge': return chalk.rgb(52, 152, 219)(type)
    case 'crevasse': return chalk.rgb(241, 196, 15)(type)
    case 'moulin': return chalk.rgb(155, 89, 182)(type)
    case 'serac': return chalk.rgb(230, 126, 34)(type)
    case 'ice-fall': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example glaciologistGradeColor('chief-glaciologist') returns bold string */
export function glaciologistGradeColor(grade: string): string {
  switch (grade) {
    case 'chief-glaciologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'senior-glaciologist': return chalk.rgb(52, 152, 219)(grade)
    case 'glaciologist': return chalk.rgb(155, 89, 182)(grade)
    case 'geologist': return chalk.rgb(241, 196, 15)(grade)
    case 'hiker': return chalk.rgb(230, 126, 34)(grade)
    case 'snowman': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example fieldCondColor('polar-ice-sheet') returns colored string */
export function fieldCondColor(condition: string): string {
  switch (condition) {
    case 'polar-ice-sheet': return chalk.rgb(46, 204, 113)(condition)
    case 'alpine-glacier': return chalk.rgb(52, 152, 219)(condition)
    case 'valley-glacier': return chalk.rgb(155, 89, 182)(condition)
    case 'rock-glacier': return chalk.rgb(241, 196, 15)(condition)
    case 'permafrost': return chalk.rgb(230, 126, 34)(condition)
    case 'mud-slide': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── Format Reading ────────────────────────────────────────────────────────

/** @example formatReading(reading, false) returns formatted string */
export function formatReading(reading: GlacierReading, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(reading.file)} ${conditionColor(reading.condition)} ${scoreColor(reading.qualityScore)}`)
  lines.push(`    Ice: ${scoreColor(reading.iceDensity)} ${iceTypeColor(reading.ice.type)} | Flow: ${scoreColor(reading.flowRate)} ${flowStateColor(reading.flow.state)}`)
  lines.push(`    Crevasse: ${scoreColor(100 - reading.crevasseDepth)} ${crevasseTypeColor(reading.crevasse.type)} | Moraine: ${scoreColor(reading.moraineQuality)}`)
  lines.push(`    Accum: ${scoreColor(reading.accumulationZone)} | Ablation: ${scoreColor(reading.ablationZone)}`)

  if (verbose) {
    if (reading.ice.debrisCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Ice debris:')} ${reading.ice.debrisCount}`)
    if (reading.crevasse.crevasseCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Crevasses:')} ${reading.crevasse.crevasseCount}`)
    if (reading.ablation.hasDeadIce) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Dead ice detected')}`)
    if (reading.flow.hasRetreat) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Glacier retreat')}`)
  }

  return lines.join('\n')
}

/** @example formatField(field, false) returns formatted string */
export function formatField(field: IceField, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(field.directory)} ${fieldCondColor(field.condition)} (${field.fieldType})`)
  lines.push(`  Avg Ice: ${scoreColor(field.avgIceDensity)} | Avg Flow: ${scoreColor(field.avgFlowRate)} | Avg Moraine: ${scoreColor(field.avgMoraineQuality)}`)

  if (verbose) {
    lines.push(`  Crystal: ${field.crystalGlacierCount} | Rock: ${field.rockGlacierCount} | Healthy: ${field.healthyCount} | Balanced: ${field.balancedCount}`)
    for (const reading of field.readings) {
      lines.push(formatReading(reading, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: GlacierFieldStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Glacier Field Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Fields: ${stats.totalFields}`)
  lines.push(`Avg Ice: ${scoreColor(stats.avgIceDensity)} | Avg Flow: ${scoreColor(stats.avgFlowRate)} | Avg Crevasse: ${scoreColor(100 - stats.avgCrevasseDepth)}`)
  lines.push(`Avg Moraine: ${scoreColor(stats.avgMoraineQuality)} | Avg Accum: ${scoreColor(stats.avgAccumulationZone)} | Avg Ablation: ${scoreColor(stats.avgAblationZone)}`)
  lines.push(`Overall Health: ${scoreColor(stats.overallGlacierHealth)} | Grade: ${glaciologistGradeColor(stats.glaciologistGrade)}`)
  lines.push(`Conditions: Crystal=${stats.crystalGlacierCount} Healthy=${stats.healthyGlacierCount} Stable=${stats.stableIcefieldCount} Retreating=${stats.retreatingGlacierCount} Dirty=${stats.dirtyIceCount} Rock=${stats.rockGlacierCount}`)
  lines.push(`Best: ${stats.bestReading} | Densest: ${stats.densestIce} | Flow: ${stats.healthiestFlow}`)
  lines.push(`Shallowest: ${stats.shallowestCrevasses} | Moraine: ${stats.bestMoraine}`)
  return lines.join('\n')
}

// ─── Table Format ──────────────────────────────────────────────────────────

/** @example formatGlacierFieldTable(result, false) returns full table */
export function formatGlacierFieldTable(result: GlacierFieldResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Glacier Field Analysis ===\n'))

  if (result.readings.length > 0) {
    lines.push(chalk.bold('Glacier Readings:'))
    for (const reading of result.readings) {
      lines.push(formatReading(reading, verbose))
    }
  }

  if (result.fields.length > 0) {
    lines.push(chalk.bold('\nIce Fields:'))
    for (const field of result.fields) {
      lines.push(formatField(field, verbose))
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

// ─── JSON Format ───────────────────────────────────────────────────────────

/** @example formatGlacierFieldJson(result) returns JSON string */
export function formatGlacierFieldJson(result: GlacierFieldResult): string {
  return JSON.stringify(result, null, 2)
}
