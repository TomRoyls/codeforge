import chalk from 'chalk'
import type { QuarterstoneResult, FoundationStone, MasonrySection } from './quarterstone-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function stoneTypeColor(t: string): string {
  switch (t) {
    case 'granite': return chalk.rgb(100, 100, 120)(t)
    case 'marble': return chalk.rgb(240, 240, 250)(t)
    case 'limestone': return chalk.rgb(210, 200, 170)(t)
    case 'sandstone': return chalk.rgb(220, 190, 140)(t)
    case 'slate': return chalk.rgb(100, 110, 130)(t)
    case 'brick': return chalk.rgb(180, 70, 50)(t)
    case 'concrete': return chalk.rgb(180, 180, 180)(t)
    case 'wood': return chalk.rgb(160, 120, 60)(t)
    case 'straw': return chalk.rgb(220, 200, 80)(t)
    default: return chalk.dim(t)
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'pristine': return chalk.rgb(255, 215, 0)(c)
    case 'excellent': return chalk.green(c)
    case 'good': return chalk.blue(c)
    case 'fair': return chalk.yellow(c)
    case 'weathered': return chalk.rgb(255, 165, 0)(c)
    case 'eroded': return chalk.red(c)
    case 'crumbling': return chalk.rgb(139, 0, 0)(c)
    default: return chalk.dim(c)
  }
}

function sectionCondColor(c: string): string {
  switch (c) {
    case 'monumental': return chalk.rgb(255, 215, 0)(c)
    case 'sturdy': return chalk.green(c)
    case 'serviceable': return chalk.blue(c)
    case 'degraded': return chalk.yellow(c)
    case 'failing': return chalk.rgb(255, 165, 0)(c)
    case 'collapsed': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-mason': return chalk.rgb(255, 215, 0)(g)
    case 'mason': return chalk.green(g)
    case 'apprentice': return chalk.blue(g)
    case 'laborer': return chalk.yellow(g)
    case 'amateur': return chalk.rgb(255, 165, 0)(g)
    case 'child': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Stone Formatting ────────────────────────────────────────────────────────

function formatStone(s: FoundationStone, verbose: boolean): string {
  const markers: string[] = []
  if (s.isCornerstone) markers.push(chalk.rgb(255, 215, 0)('CS'))
  if (s.isKeystone) markers.push(chalk.red('KS'))
  if (s.isCapstone) markers.push(chalk.blue('CAP'))
  if (s.isFoundation) markers.push(chalk.green('FND'))
  if (s.isLoadBearing) markers.push(chalk.yellow('LB'))
  const marker = markers.length > 0 ? `[${markers.join(',')}]` : ''

  const line = ` ${conditionColor(s.weathering.condition)} ${chalk.bold(s.file)} ${stoneTypeColor(s.stoneType)} ${s.position} ${marker} quality:${scoreColor(s.qualityScore)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    stone:${scoreColor(s.stoneQuality)} mortar:${scoreColor(s.mortarStrength)} plumb:${scoreColor(s.plumbAlignment)} level:${scoreColor(s.levelness)} square:${scoreColor(s.squareness)}`)
  details.push(`    load:${s.load.totalLoad}/${s.load.loadCapacity} ratio:${s.load.loadRatio} cracks:${s.structural.cracks} pattern:${s.masonry.pattern}`)
  return details.join('\n')
}

// ─── Section Formatting ──────────────────────────────────────────────────────

function formatSection(sec: MasonrySection, verbose: boolean): string {
  const line = `  ${chalk.bold(sec.directory)} ${sectionCondColor(sec.condition)} ${sec.sectionType} health:${scoreColor(sec.structuralHealth)} cornerstone:${sec.cornerstone}`

  if (!verbose) return line
  const details = [line]
  details.push(`    stones:${sec.stones.length} foundation:${sec.foundationCount} loadBearing:${sec.loadBearingCount} overloaded:${sec.overloadedCount}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format quarterstone result as a table
 * @example
 * formatQuarterstoneTable(result, false) // string
 */
export function formatQuarterstoneTable(result: QuarterstoneResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🧱 Quarterstone - Foundation and Cornerstone Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🪨 Foundation Stones'))
  if (result.stones.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.stones : result.stones.slice(0, 15)
    for (const s of display) {
      lines.push(formatStone(s, verbose))
    }
    if (!verbose && result.stones.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.stones.length - 15} more`))
    }
  }
  lines.push('')

  if (result.sections.length > 0) {
    lines.push(chalk.bold('🏗️ Masonry Sections'))
    for (const sec of result.sections) {
      lines.push(formatSection(sec, verbose))
    }
    lines.push('')
  }

  const b = result.building
  lines.push(chalk.bold('🏛️ Building'))
  lines.push(`  Sound: ${b.isStructurallySound ? chalk.green('yes') : chalk.red('no')} | Plumb: ${b.isPlumb ? chalk.green('yes') : chalk.red('no')} | Level: ${b.isLevel ? chalk.green('yes') : chalk.red('no')} | Square: ${b.isSquare ? chalk.green('yes') : chalk.red('no')}`)
  lines.push(`  Health: ${scoreColor(b.structuralHealth)} | Depth: ${scoreColor(b.foundationDepth)} | Height: ${scoreColor(b.buildingHeight)} | Load: ${b.totalLoad}/${b.totalCapacity}`)
  lines.push(`  Cornerstone: ${chalk.bold(b.cornerstone)} | Keystone: ${chalk.bold(b.keystone)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.masterMasonGrade)} | Granite: ${chalk.rgb(100, 100, 120)(String(s.graniteStones))} | Straw: ${chalk.rgb(220, 200, 80)(String(s.strawStones))} | Cracks: ${s.totalCracks} | Settled: ${s.settledStones} | Shifting: ${s.shiftingStones}`)
  lines.push(`  Strongest: ${chalk.green(s.strongestStone)} | Weakest: ${chalk.red(s.weakestStone)} | Heaviest: ${s.heaviestLoad}`)

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
 * Format quarterstone result as JSON
 * @example
 * formatQuarterstoneJson(result) // string
 */
export function formatQuarterstoneJson(result: QuarterstoneResult): string {
  return JSON.stringify(result, null, 2)
}
