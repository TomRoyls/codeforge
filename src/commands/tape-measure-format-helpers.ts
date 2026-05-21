import chalk from 'chalk'
import type { Measurement, FloorPlan, TapeMeasureStats, TapeMeasureResult } from './tape-measure-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'perfectly-measured': return chalk.rgb(255, 215, 0)(c)
    case 'well-proportioned': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'misshapen': return chalk.cyan(c)
    case 'distorted': return chalk.yellow(c)
    case 'monstrosity': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function floorTypeColor(t: string): string {
  switch (t) {
    case 'penthouse': return chalk.rgb(255, 215, 0)(t)
    case 'office-floor': return chalk.green(t)
    case 'warehouse': return chalk.blue(t)
    case 'studio': return chalk.cyan(t)
    case 'closet': return chalk.yellow(t)
    case 'void': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function floorConditionColor(c: string): string {
  switch (c) {
    case 'architectural-marvel': return chalk.rgb(255, 215, 0)(c)
    case 'well-designed': return chalk.green(c)
    case 'functional': return chalk.blue(c)
    case 'cramped': return chalk.cyan(c)
    case 'sprawling': return chalk.yellow(c)
    case 'condemned': return chalk.red(c)
    default: return c
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-architect': return chalk.rgb(255, 215, 0)(g)
    case 'architect': return chalk.green(g)
    case 'drafter': return chalk.blue(g)
    case 'builder': return chalk.cyan(g)
    case 'handyman': return chalk.yellow(g)
    case 'demolition': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function sizeColor(s: string): string {
  switch (s) {
    case 'nano': return chalk.dim(s)
    case 'micro': return chalk.dim(s)
    case 'small': return chalk.cyan(s)
    case 'medium': return chalk.green(s)
    case 'large': return chalk.yellow(s)
    case 'mega': return chalk.rgb(255, 140, 0)(s)
    case 'giga': return chalk.red(s)
    default: return s
  }
}

// ─── Measurement Formatting ───────────────────────────────────────────────────

function formatMeasurement(m: Measurement, verbose: boolean): string {
  const line = ` ${conditionColor(m.condition)} ${chalk.bold(m.file)} ${sizeColor(m.scaleMeasure.fileSizeCategory)} len:${scoreColor(m.length)} wid:${scoreColor(m.width)} dep:${scoreColor(m.depth)} vol:${scoreColor(m.volume)} den:${scoreColor(m.density)} pro:${scoreColor(m.proportion)} scale:${scoreColor(m.scaleFitness)} score:${scoreColor(m.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const d = m.dimensions
  details.push(`    dimensions: lines:${d.totalLines} code:${d.codeLines} blank:${d.blankLines} comment:${d.commentLines} maxW:${d.maxLineWidth} avgW:${d.avgLineWidth} violation:${d.maxWidthViolation ? chalk.red('Y') : chalk.green('N')}`)
  const dp = m.depthMeasure
  details.push(`    depth: max:${dp.maxNesting} avg:${dp.avgNesting} deep:${dp.hasDeepNesting ? chalk.red('Y') : chalk.green('N')} shallow:${dp.hasShallowNesting ? chalk.green('Y') : chalk.dim('N')} deepest:${dp.deepestLevel}`)
  const v = m.volumeMeasure
  details.push(`    volume: cyclo:${v.cyclomaticComplexity} cog:${v.cognitiveComplexity} halstead:${v.halsteadVolume} high:${v.hasHighVolume ? chalk.red('Y') : chalk.green('N')} cat:${v.volumeCategory}`)
  const dn = m.densityMeasure
  details.push(`    density: br/l:${dn.branchesPerLine} fn/l:${dn.functionsPerLine} cm/l:${dn.commentsPerLine} codeDen:${scoreColor(dn.codeDensity)} dense:${dn.isDense ? chalk.red('Y') : chalk.green('N')} sparse:${dn.isSparse ? chalk.yellow('Y') : chalk.green('N')} balanced:${dn.isWellBalanced ? chalk.green('Y') : chalk.red('N')}`)
  const p = m.proportionMeasure
  details.push(`    proportion: fns:${p.functionCount} avgLen:${p.avgFunctionLength} max:${p.maxFunctionLength} min:${p.minFunctionLength} ratio:${p.functionToTotalRatio} giant:${p.hasGiantFunctions ? chalk.red(String(p.giantCount)) : 0} tiny:${p.hasTinyFunctions ? chalk.yellow(String(p.tinyCount)) : 0}`)
  const sc = m.scaleMeasure
  details.push(`    scale: ${sizeColor(sc.fileSizeCategory)} right:${sc.isRightSized ? chalk.green('Y') : chalk.red('N')} under:${sc.isUndersized ? chalk.yellow('Y') : chalk.green('N')} over:${sc.isOversized ? chalk.red('Y') : chalk.green('N')} split:${sc.shouldSplit ? chalk.red('Y') : chalk.green('N')} merge:${sc.shouldMerge ? chalk.yellow('Y') : chalk.green('N')}`)
  const bp = m.blueprint
  details.push(`    blueprint: rect:${bp.isRectangular ? chalk.green('Y') : chalk.red('N')} towers:${bp.hasTowers ? chalk.red(String(bp.towerCount)) : 0} basements:${bp.hasBasements ? chalk.red(String(bp.basementCount)) : 0} wings:${bp.hasWings ? chalk.yellow('Y') : chalk.dim('N')} sym:${bp.isSymmetric ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Floor Plan Formatting ────────────────────────────────────────────────────

function formatFloorPlan(floor: FloorPlan): string {
  return `  ${chalk.bold(floor.directory)} ${floorTypeColor(floor.floorType)} ${floorConditionColor(floor.condition)} files:${floor.measurements.length} lines:${floor.totalLines} len:${scoreColor(floor.avgLength)} dep:${scoreColor(floor.avgDepth)} vol:${scoreColor(floor.avgVolume)} pro:${scoreColor(floor.avgProportion)} perfect:${floor.perfectlyMeasuredCount} monster:${floor.monstrosityCount}`
}

// ─── Statistics Formatting ────────────────────────────────────────────────────

function formatStats(s: TapeMeasureStats): string[] {
  const lines: string[] = []
  lines.push(`  Grade: ${gradeColor(s.architectGrade)} | Balance: ${scoreColor(s.overallBalance)} | Files: ${s.totalFiles} | Lines: ${s.totalLines} | Avg: ${s.avgLines}`)
  lines.push(`  Perfect:${s.perfectlyMeasuredCount} WellProp:${s.wellProportionedCount} Adequate:${s.adequateCount} Misshapen:${s.misshapenCount} Distorted:${s.distortedCount} Monster:${s.monstrosityCount}`)
  lines.push(`  Nano:${s.nanoFiles} Small:${s.smallFiles} Medium:${s.mediumFiles} Large:${s.largeFiles} Mega:${s.megaFiles} Giga:${s.gigaFiles}`)
  lines.push(`  GiantFn:${s.giantFunctions} TinyFn:${s.tinyFunctions} DeepNest:${s.deepNesting} HighVol:${s.highVolume} Split:${s.shouldSplit} Merge:${s.shouldMerge}`)
  lines.push(`  Best:${chalk.green(s.bestProportioned)} | Worst:${chalk.red(s.worstProportioned)} | Deepest:${chalk.blue(s.deepestFile)} | Widest:${chalk.yellow(s.widestFile)} | Densest:${chalk.magenta(s.densestFile)}`)
  return lines
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format tape measure result as a table
 * @example
 * formatTapeMeasureTable(result, false) // string
 */
export function formatTapeMeasureTable(result: TapeMeasureResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n📏  Tape Measure - Code Size/Dimension Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📐 Measurements'))
  if (result.measurements.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.measurements : result.measurements.slice(0, 15)
    for (const m of display) {
      lines.push(formatMeasurement(m, verbose))
    }
    if (!verbose && result.measurements.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.measurements.length - 15} more`))
    }
  }
  lines.push('')

  if (result.floors.length > 0) {
    lines.push(chalk.bold('🏢 Floor Plans'))
    for (const floor of result.floors) {
      lines.push(formatFloorPlan(floor))
    }
    lines.push('')
  }

  const b = result.building
  lines.push(chalk.bold('🏗️ Building'))
  lines.push(`  Len:${scoreColor(b.avgLength)} Dep:${scoreColor(b.avgDepth)} Vol:${scoreColor(b.avgVolume)} Pro:${scoreColor(b.avgProportion)} Scale:${scoreColor(b.avgScaleFitness)} Lines:${b.totalLines} Prop:${b.isWellProportioned ? chalk.green('YES') : chalk.red('NO')} Balance:${scoreColor(b.overallBalance)}`)
  lines.push('')

  lines.push(chalk.bold('📊 Statistics'))
  for (const line of formatStats(result.stats)) {
    lines.push(line)
  }

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

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format tape measure result as JSON
 * @example
 * formatTapeMeasureJson(result) // string
 */
export function formatTapeMeasureJson(result: TapeMeasureResult): string {
  return JSON.stringify(result, null, 2)
}
