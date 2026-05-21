import chalk from 'chalk'
import type {
  GridCell,
  BuildingFloor,
  BuildingMeasure,
  BlueprintGridStats,
  BlueprintGridResult,
  CellCondition,
  FloorType,
  FloorCondition,
  ArchitectGrade,
} from './blueprint-grid-helpers.js'

// ─── Condition Colors ────────────────────────────────────

const cellConditionColor: Record<CellCondition, (t: string) => string> = {
  'architectural-marvel': (t: string) => chalk.rgb(46, 204, 113)(t),
  'well-planned': (t: string) => chalk.rgb(52, 152, 219)(t),
  'code-compliant': (t: string) => chalk.rgb(241, 196, 15)(t),
  'needs-permits': (t: string) => chalk.rgb(230, 126, 34)(t),
  'condemned-structure': (t: string) => chalk.rgb(231, 76, 60)(t),
  'ruins': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const floorTypeColor: Record<FloorType, (t: string) => string> = {
  'penthouse': (t: string) => chalk.rgb(46, 204, 113)(t),
  'office-floor': (t: string) => chalk.rgb(52, 152, 219)(t),
  'residential': (t: string) => chalk.rgb(241, 196, 15)(t),
  'warehouse': (t: string) => chalk.rgb(230, 126, 34)(t),
  'garage': (t: string) => chalk.rgb(231, 76, 60)(t),
  'crawl-space': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const floorConditionColor: Record<FloorCondition, (t: string) => string> = {
  'masterpiece': (t: string) => chalk.rgb(46, 204, 113)(t),
  'well-built': (t: string) => chalk.rgb(52, 152, 219)(t),
  'code-compliant': (t: string) => chalk.rgb(241, 196, 15)(t),
  'needs-work': (t: string) => chalk.rgb(230, 126, 34)(t),
  'dilapidated': (t: string) => chalk.rgb(231, 76, 60)(t),
  'condemned': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const architectGradeColor: Record<ArchitectGrade, (t: string) => string> = {
  'pritzker-winner': (t: string) => chalk.rgb(46, 204, 113)(t),
  'licensed-architect': (t: string) => chalk.rgb(52, 152, 219)(t),
  'architect': (t: string) => chalk.rgb(241, 196, 15)(t),
  'draftsman': (t: string) => chalk.rgb(230, 126, 34)(t),
  'builder': (t: string) => chalk.rgb(231, 76, 60)(t),
  'demolition-crew': (t: string) => chalk.rgb(142, 68, 173)(t),
}

// ─── Score Bar ───────────────────────────────────────────

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

// ─── Cell Table ──────────────────────────────────────────

/**
 * Format grid cells as a table
 * @example
 * formatCellTable(cells) // formatted string
 */
export function formatCellTable(cells: GridCell[]): string {
  if (cells.length === 0) return chalk.rgb(150, 150, 150)('  No grid cells to display')

  const rows = cells.map(c => {
    const cond = cellConditionColor[c.condition](c.condition.padEnd(22))
    return [
      chalk.rgb(200, 200, 200)(c.file.padEnd(30)),
      scoreBar(c.qualityScore, 10),
      scoreBar(c.gridAlignment, 10),
      cond,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('File'.padEnd(30)),
    chalk.rgb(100, 200, 255)('Quality'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Alignment'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Floor Table ─────────────────────────────────────────

/**
 * Format building floors as a table
 * @example
 * formatFloorTable(floors) // formatted string
 */
export function formatFloorTable(floors: BuildingFloor[]): string {
  if (floors.length === 0) return chalk.rgb(150, 150, 150)('  No building floors to display')

  const rows = floors.map(f => {
    const ft = floorTypeColor[f.floorType](f.floorType.padEnd(14))
    const fc = floorConditionColor[f.condition](f.condition.padEnd(14))
    return [
      chalk.rgb(200, 200, 200)(f.directory.padEnd(20)),
      chalk.rgb(200, 200, 200)(String(f.cells.length).padEnd(6)),
      scoreBar(f.avgAlignment, 10),
      ft,
      fc,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('Directory'.padEnd(20)),
    chalk.rgb(100, 200, 255)('Files'.padEnd(6)),
    chalk.rgb(100, 200, 255)('Avg Align'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Type'.padEnd(14)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Building Summary ────────────────────────────────────

/**
 * Format building summary
 * @example
 * formatBuilding(building) // formatted string
 */
export function formatBuilding(building: BuildingMeasure): string {
  const sound = building.isStructurallySound ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Building Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Structure: ${scoreBar(building.overallStructure)}`,
    `  Avg Alignment:     ${scoreBar(building.avgAlignment)}`,
    `  Avg Spacing:       ${scoreBar(building.avgSpacing)}`,
    `  Avg Proportions:   ${scoreBar(building.avgProportions)}`,
    `  Avg Routing:       ${scoreBar(building.avgRouting)}`,
    `  Structurally Sound:${sound}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

// ─── Statistics ──────────────────────────────────────────

/**
 * Format blueprint statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: BlueprintGridStats): string {
  const grade = architectGradeColor[stats.architectGrade](stats.architectGrade)
  return [
    '',
    chalk.rgb(100, 200, 255)('  Blueprint Statistics'),
    chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Floors:         ${chalk.rgb(200, 200, 200)(String(stats.totalFloors))}`,
    `  Architect Grade:      ${grade}`,
    '',
    `  Avg Grid Alignment:   ${scoreBar(stats.avgGridAlignment)}`,
    `  Avg Structural Spacing:${scoreBar(stats.avgStructuralSpacing)}`,
    `  Avg Load Bearing:     ${scoreBar(stats.avgLoadBearing)}`,
    `  Avg Room Proportions: ${scoreBar(stats.avgRoomProportions)}`,
    `  Avg Utility Routing:  ${scoreBar(stats.avgUtilityRouting)}`,
    `  Avg Foundation Depth: ${scoreBar(stats.avgFoundationDepth)}`,
    '',
    `  Architectural Marvel: ${chalk.rgb(46, 204, 113)(String(stats.architecturalMarvelCount))}`,
    `  Well Planned:         ${chalk.rgb(52, 152, 219)(String(stats.wellPlannedCount))}`,
    `  Code Compliant:       ${chalk.rgb(241, 196, 15)(String(stats.codeCompliantCount))}`,
    `  Needs Permits:        ${chalk.rgb(230, 126, 34)(String(stats.needsPermitsCount))}`,
    `  Condemned:            ${chalk.rgb(231, 76, 60)(String(stats.condemnedCount))}`,
    `  Ruins:                ${chalk.rgb(142, 68, 173)(String(stats.ruinsCount))}`,
    '',
    `  Orthogonal:           ${chalk.rgb(200, 200, 200)(String(stats.orthogonalCount))}`,
    `  Has Diagonals:        ${chalk.rgb(200, 200, 200)(String(stats.hasDiagonalsCount))}`,
    `  Is Aligned:           ${chalk.rgb(200, 200, 200)(String(stats.isAlignedCount))}`,
    `  Has Crowding:         ${chalk.rgb(200, 200, 200)(String(stats.hasCrowdingCount))}`,
    `  Strong Walls:         ${chalk.rgb(200, 200, 200)(String(stats.strongWallsCount))}`,
    `  Has Cracks:           ${chalk.rgb(200, 200, 200)(String(stats.hasCracksCount))}`,
    `  Clean Routing:        ${chalk.rgb(200, 200, 200)(String(stats.hasCleanRoutingCount))}`,
    `  Has Crossover:        ${chalk.rgb(200, 200, 200)(String(stats.hasCrossoverCount))}`,
    `  Is Settled:           ${chalk.rgb(200, 200, 200)(String(stats.isSettledCount))}`,
    `  Has Footings:         ${chalk.rgb(200, 200, 200)(String(stats.hasFootingsCount))}`,
    `  Grand Rooms:          ${chalk.rgb(200, 200, 200)(String(stats.grandRoomCount))}`,
    `  Open Plan:            ${chalk.rgb(200, 200, 200)(String(stats.openPlanCount))}`,
    '',
    `  Best Aligned:         ${chalk.rgb(46, 204, 113)(stats.bestAligned)}`,
    `  Best Proportioned:    ${chalk.rgb(46, 204, 113)(stats.bestProportioned)}`,
    `  Strongest Walls:      ${chalk.rgb(46, 204, 113)(stats.strongestWalls)}`,
    `  Cleanest Routing:     ${chalk.rgb(46, 204, 113)(stats.cleanestRouting)}`,
    `  Most Settled:         ${chalk.rgb(46, 204, 113)(stats.mostSettled)}`,
    '',
  ].join('\n')
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - blueprint is structurally perfect')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

// ─── Full Report ─────────────────────────────────────────

/**
 * Format the complete blueprint-grid report
 * @example
 * formatBlueprintGridReport(result) // formatted string
 */
export function formatBlueprintGridReport(result: BlueprintGridResult): string {
  const sections: string[] = [
    formatBuilding(result.building),
    formatCellTable(result.cells),
    '',
    formatFloorTable(result.floors),
    formatStats(result.stats),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format result as JSON string
 * @example
 * formatBlueprintGridJSON(result) // JSON string
 */
export function formatBlueprintGridJSON(result: BlueprintGridResult): string {
  return JSON.stringify(result, null, 2)
}
