import chalk from 'chalk'
import type { BlueprintResult, BlueprintRoom, BlueprintFloor } from './blueprint-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function roomTypeColor(t: string): string {
  switch (t) {
    case 'living-room': return chalk.rgb(255, 215, 0)(t)
    case 'kitchen': return chalk.rgb(255, 165, 0)(t)
    case 'bedroom': return chalk.blue(t)
    case 'bathroom': return chalk.cyan(t)
    case 'hallway': return chalk.gray(t)
    case 'closet': return chalk.dim(t)
    case 'study': return chalk.green(t)
    case 'garage': return chalk.rgb(160, 120, 60)(t)
    case 'utility': return chalk.yellow(t)
    case 'foyer': return chalk.magenta(t)
    case 'basement': return chalk.rgb(100, 100, 100)(t)
    case 'attic': return chalk.rgb(180, 130, 70)(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(255, 215, 0)(c)
    case 'well-designed': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'rough': return chalk.yellow(c)
    case 'sketchy': return chalk.rgb(255, 165, 0)(c)
    case 'napkin-drawing': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function floorCondColor(c: string): string {
  switch (c) {
    case 'masterpiece': return chalk.rgb(255, 215, 0)(c)
    case 'well-designed': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'rough': return chalk.yellow(c)
    case 'sketchy': return chalk.rgb(255, 165, 0)(c)
    case 'unplanned': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'pritzker-prize': return chalk.rgb(255, 215, 0)(g)
    case 'licensed-architect': return chalk.green(g)
    case 'draftsman': return chalk.blue(g)
    case 'student': return chalk.yellow(g)
    case 'amateur': return chalk.rgb(255, 165, 0)(g)
    case 'child': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function inspectionColor(g: string): string {
  switch (g) {
    case 'passed': return chalk.green(g)
    case 'conditional': return chalk.yellow(g)
    case 'failed': return chalk.rgb(255, 165, 0)(g)
    case 'condemned': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Room Formatting ─────────────────────────────────────────────────────────

function formatRoom(r: BlueprintRoom, verbose: boolean): string {
  const lb = r.walls.loadBearing ? chalk.red(' [LB]') : ''
  const line = ` ${conditionColor(r.condition)} ${chalk.bold(r.file)} ${roomTypeColor(r.roomType)}${lb} quality:${scoreColor(r.qualityScore)} scale:${scoreColor(r.scaleAccuracy)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    dim:${scoreColor(r.dimensionConsistency)} org:${scoreColor(r.roomOrganization)} walls:${r.walls.wallCount} doors:${r.walls.doorCount} inspect:${inspectionColor(r.codeCompliance.inspectionGrade)} zone:${r.zoning.zoneType}`)
  return details.join('\n')
}

// ─── Floor Formatting ────────────────────────────────────────────────────────

function formatFloor(f: BlueprintFloor, verbose: boolean): string {
  const line = `  ${chalk.bold(f.directory)} F${f.floorNumber} ${floorCondColor(f.condition)} ${f.floorPlan} quality:${scoreColor(f.floorQuality)} rooms:${f.rooms.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    lb:${f.loadBearingCount} passed:${f.passedInspection} condemned:${f.condemnedCount} violations:${f.violationCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format blueprint result as a table
 * @example
 * formatBlueprintTable(result, false) // string
 */
export function formatBlueprintTable(result: BlueprintResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📐 Blueprint - Architectural Blueprint Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🏠 Rooms'))
  if (result.rooms.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.rooms : result.rooms.slice(0, 15)
    for (const r of display) {
      lines.push(formatRoom(r, verbose))
    }
    if (!verbose && result.rooms.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.rooms.length - 15} more`))
    }
  }
  lines.push('')

  if (result.floors.length > 0) {
    lines.push(chalk.bold('🏢 Floors'))
    for (const f of result.floors) {
      lines.push(formatFloor(f, verbose))
    }
    lines.push('')
  }

  const b = result.building
  lines.push(chalk.bold('🏛️ Building'))
  lines.push(`  Type: ${chalk.bold(b.buildingType)} | Style: ${chalk.bold(b.architecturalStyle)} | Health: ${scoreColor(b.structuralHealth)}`)
  lines.push(`  Sound: ${b.isStructurallySound ? chalk.green('yes') : chalk.red('no')} | Foundation: ${b.hasStrongFoundation ? chalk.green('yes') : chalk.red('no')} | Roof: ${b.hasProperRoof ? chalk.green('yes') : chalk.red('no')} | Flow: ${b.hasGoodFlow ? chalk.green('yes') : chalk.red('no')}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.architectGrade)} | Best: ${chalk.green(s.bestRoom)} | Worst: ${chalk.red(s.worstRoom)}`)
  lines.push(`  LB:${s.loadBearingCount} Open:${s.openPlanCount} Hidden:${s.hiddenRoomCount} Zoned:${s.properZoningCount} Passed:${s.passedInspection} Condemned:${s.condemnedCount}`)

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
 * Format blueprint result as JSON
 * @example
 * formatBlueprintJson(result) // string
 */
export function formatBlueprintJson(result: BlueprintResult): string {
  return JSON.stringify(result, null, 2)
}
