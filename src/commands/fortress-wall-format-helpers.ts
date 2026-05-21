import chalk from 'chalk'
import type { FortressWallResult, FortificationReading, DefenseZone, FortressWallStats } from './fortress-wall-helpers.js'

// ─── Color Helpers ──────────────────────────────────────

/**
 * Colorize a numeric score
 * @example
 * scoreColor(85) // green bold
 */
export function scoreColor(score: number): string {
  if (score >= 70) return chalk.bold.green(String(score))
  if (score >= 40) return chalk.yellow(String(score))
  return chalk.red(String(score))
}

/**
 * Colorize wall material
 * @example
 * materialColor('granite') // green bold
 */
export function materialColor(material: string): string {
  if (material === 'granite') return chalk.bold.green(material)
  if (material === 'limestone') return chalk.green(material)
  if (material === 'brick') return chalk.cyan(material)
  if (material === 'wood') return chalk.yellow(material)
  if (material === 'earth') return chalk.rgb(200, 130, 50)(material)
  return chalk.gray(material)
}

/**
 * Colorize condition
 * @example
 * conditionColor('impregnable-fortress') // green bold
 */
export function conditionColor(condition: string): string {
  if (condition === 'impregnable-fortress') return chalk.bold.green(condition)
  if (condition === 'stronghold') return chalk.green(condition)
  if (condition === 'castle') return chalk.cyan(condition)
  if (condition === 'fort') return chalk.yellow(condition)
  if (condition === 'stockade') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize moat type
 * @example
 * moatTypeColor('poison') // magenta bold
 */
export function moatTypeColor(type: string): string {
  if (type === 'poison') return chalk.bold.magenta(type)
  if (type === 'fire') return chalk.red(type)
  if (type === 'water') return chalk.cyan(type)
  if (type === 'dry') return chalk.yellow(type)
  if (type === 'ditch') return chalk.rgb(200, 130, 50)(type)
  return chalk.gray(type)
}

/**
 * Colorize siege state
 * @example
 * siegeStateColor('peace') // green bold
 */
export function siegeStateColor(state: string): string {
  if (state === 'peace') return chalk.bold.green(state)
  if (state === 'alert') return chalk.green(state)
  if (state === 'siege') return chalk.yellow(state)
  if (state === 'breach') return chalk.rgb(200, 130, 50)(state)
  if (state === 'surrender') return chalk.red(state)
  return chalk.gray(state)
}

/**
 * Colorize structure design
 * @example
 * designColor('concentric') // cyan
 */
export function designColor(design: string): string {
  const colors: Record<string, (s: string) => string> = {
    concentric: chalk.bold.cyan, bastion: chalk.cyan, 'star-fort': chalk.green,
    'motte-and-bailey': chalk.yellow, palisade: chalk.rgb(200, 130, 50), sandcastle: chalk.gray,
  }
  return (colors[design] ?? chalk.white)(design)
}

/**
 * Colorize commander grade
 * @example
 * commanderGradeColor('field-marshal') // green bold
 */
export function commanderGradeColor(grade: string): string {
  if (grade === 'field-marshal') return chalk.bold.green(grade)
  if (grade === 'general') return chalk.green(grade)
  if (grade === 'colonel') return chalk.cyan(grade)
  if (grade === 'captain') return chalk.yellow(grade)
  if (grade === 'sergeant') return chalk.rgb(200, 130, 50)(grade)
  return chalk.red(grade)
}

/**
 * Colorize zone condition
 * @example
 * zoneCondColor('fortress-network') // green bold
 */
export function zoneCondColor(condition: string): string {
  if (condition === 'fortress-network') return chalk.bold.green(condition)
  if (condition === 'castle-complex') return chalk.green(condition)
  if (condition === 'walled-city') return chalk.cyan(condition)
  if (condition === 'fortified-camp') return chalk.yellow(condition)
  if (condition === 'outpost') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

// ─── Reading Formatting ─────────────────────────────────

/**
 * Format a single fortification reading
 * @example
 * formatReading(reading, false) // colored output
 */
export function formatReading(reading: FortificationReading, verbose: boolean): string {
  const lines: string[] = []
  const score = scoreColor(reading.qualityScore)
  const cond = conditionColor(reading.condition)
  lines.push(`  ${chalk.white(reading.file)} ${materialColor(reading.wall.material)} ${score} ${cond}`)

  if (verbose) {
    lines.push(`    Wall: strength=${scoreColor(reading.wallStrength)} ${materialColor(reading.wall.material)} thick=${reading.wall.isThick} cracks=${reading.wall.crackCount}`)
    lines.push(`    Moat: depth=${scoreColor(reading.moatDepth)} ${moatTypeColor(reading.moat.type)} deep=${reading.moat.isDeep} bypasses=${reading.moat.bypassCount}`)
    lines.push(`    Tower: coverage=${scoreColor(reading.towerCoverage)} full=${reading.tower.hasFullCoverage} blindspots=${reading.tower.blindSpotCount}`)
    lines.push(`    Gate: security=${scoreColor(reading.gateSecurity)} guarded=${reading.gate.isGuarded} vulns=${reading.gate.vulnerabilityCount}`)
    lines.push(`    Siege: readiness=${scoreColor(reading.siegeReadiness)} ${siegeStateColor(reading.siege.state)} fortified=${reading.siege.hasFortifiedGate}`)
    lines.push(`    Structure: integrity=${scoreColor(reading.structuralIntegrity)} ${designColor(reading.structure.design)} sound=${reading.structure.isStructurallySound}`)
  }

  return lines.join('\n')
}

// ─── Zone Formatting ────────────────────────────────────

/**
 * Format a defense zone
 * @example
 * formatZone(zone, false) // colored output
 */
export function formatZone(zone: DefenseZone, verbose: boolean): string {
  const lines: string[] = []
  const wall = scoreColor(zone.avgWallStrength)
  const cond = zoneCondColor(zone.condition)

  lines.push(`  ${chalk.white(zone.directory)} wall=${wall} moat=${scoreColor(zone.avgMoatDepth)} ${cond}`)
  lines.push(`    type=${zone.zoneType} readings=${zone.readings.length} impregnable=${zone.impregnableCount} ruins=${zone.ruinsCount}`)

  if (verbose) {
    for (const reading of zone.readings) {
      lines.push(formatReading(reading, false))
    }
  }

  return lines.join('\n')
}

// ─── Stats Formatting ───────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line stats
 */
export function formatStats(stats: FortressWallStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold('Files')}: ${stats.totalFiles}  ${chalk.bold('Zones')}: ${stats.totalZones}`)
  lines.push(`  ${chalk.bold('Avg Wall')}: ${scoreColor(stats.avgWallStrength)}  ${chalk.bold('Avg Moat')}: ${scoreColor(stats.avgMoatDepth)}`)
  lines.push(`  ${chalk.bold('Avg Tower')}: ${scoreColor(stats.avgTowerCoverage)}  ${chalk.bold('Avg Gate')}: ${scoreColor(stats.avgGateSecurity)}`)
  lines.push(`  ${chalk.bold('Avg Siege')}: ${scoreColor(stats.avgSiegeReadiness)}  ${chalk.bold('Avg Structure')}: ${scoreColor(stats.avgStructuralIntegrity)}`)
  lines.push(`  ${chalk.bold('Overall')}: ${scoreColor(stats.overallDefense)}  ${chalk.bold('Grade')}: ${commanderGradeColor(stats.commanderGrade)}`)

  lines.push(`  ${chalk.bold('Conditions')}: impregnable=${stats.impregnableFortressCount} stronghold=${stats.strongholdCount} castle=${stats.castleCount} fort=${stats.fortCount} stockade=${stats.stockadeCount} ruins=${stats.ruinsCount}`)

  lines.push(`  ${chalk.bold('Best Reading')}: ${stats.bestReading}`)
  lines.push(`  ${chalk.bold('Strongest Wall')}: ${stats.strongestWall}`)
  lines.push(`  ${chalk.bold('Deepest Moat')}: ${stats.deepestMoat}`)
  lines.push(`  ${chalk.bold('Securest Gate')}: ${stats.securestGate}`)
  lines.push(`  ${chalk.bold('Most Ready')}: ${stats.mostReady}`)

  return lines.join('\n')
}

// ─── Table Formatter ────────────────────────────────────

/**
 * Format result as colored table
 * @example
 * formatFortressWallTable(result, false) // colored output
 */
export function formatFortressWallTable(result: FortressWallResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.blue('🏰 Fortress Wall Analysis'))
  lines.push('═'.repeat(50))

  lines.push('')
  lines.push(chalk.bold('🧱 Fortification Readings'))
  for (const reading of result.readings) {
    lines.push(formatReading(reading, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('🗺️  Defense Zones'))
  for (const zone of result.zones) {
    lines.push(formatZone(zone, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
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

// ─── JSON Formatter ─────────────────────────────────────

/**
 * Format result as JSON
 * @example
 * formatFortressWallJson(result) // JSON string
 */
export function formatFortressWallJson(result: FortressWallResult): string {
  return JSON.stringify(result, null, 2)
}
