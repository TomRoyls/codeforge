import chalk from 'chalk'
import type { StainedGlassPatternResult, GlassPiece, Workshop, PatternStats } from './stained-glass-pattern-helpers.js'

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
 * Colorize a glass type
 * @example
 * glassTypeColor('crystal') // cyan
 */
export function glassTypeColor(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    crystal: chalk.cyan,
    opal: chalk.magenta,
    frosted: chalk.blue,
    amber: chalk.yellow,
    onyx: chalk.gray,
    cobalt: chalk.rgb(50, 50, 200),
  }
  return (colors[type] ?? chalk.white)(type)
}

/**
 * Colorize a condition label
 * @example
 * conditionColor('cathedral-masterpiece') // green bold
 */
export function conditionColor(condition: string): string {
  if (condition === 'cathedral-masterpiece') return chalk.bold.green(condition)
  if (condition === 'rose-window') return chalk.green(condition)
  if (condition === 'mosaic-beauty') return chalk.cyan(condition)
  if (condition === 'opal-dream') return chalk.magenta(condition)
  if (condition === 'tarnished-glass') return chalk.yellow(condition)
  if (condition === 'cracked-panel') return chalk.red(condition)
  return chalk.gray(condition)
}

/**
 * Colorize a workshop condition
 * @example
 * workshopConditionColor('radiant-glow') // green bold
 */
export function workshopConditionColor(condition: string): string {
  if (condition === 'radiant-glow') return chalk.bold.green(condition)
  if (condition === 'well-lit') return chalk.green(condition)
  if (condition === 'soft-light') return chalk.cyan(condition)
  if (condition === 'dim') return chalk.yellow(condition)
  if (condition === 'shadowed') return chalk.rgb(200, 130, 50)(condition)
  return chalk.gray(condition)
}

/**
 * Colorize an artisan grade
 * @example
 * artisanGradeColor('master-glazier') // green bold
 */
export function artisanGradeColor(grade: string): string {
  if (grade === 'master-glazier') return chalk.bold.green(grade)
  if (grade === 'artisan') return chalk.green(grade)
  if (grade === 'journeyman') return chalk.cyan(grade)
  if (grade === 'apprentice') return chalk.yellow(grade)
  if (grade === 'novice') return chalk.rgb(200, 130, 50)(grade)
  return chalk.red(grade)
}

/**
 * Colorize a pattern style
 * @example
 * patternStyleColor('geometric') // cyan
 */
export function patternStyleColor(style: string): string {
  const colors: Record<string, (s: string) => string> = {
    geometric: chalk.cyan,
    organic: chalk.green,
    floral: chalk.magenta,
    abstract: chalk.yellow,
    pictorial: chalk.blue,
    minimalist: chalk.gray,
  }
  return (colors[style] ?? chalk.white)(style)
}

/**
 * Colorize a lead type
 * @example
 * leadTypeColor('h-came') // cyan
 */
export function leadTypeColor(type: string): string {
  const colors: Record<string, (s: string) => string> = {
    'h-came': chalk.green,
    'u-came': chalk.cyan,
    round: chalk.blue,
    flat: chalk.yellow,
    zinc: chalk.magenta,
    copper: chalk.rgb(200, 130, 50),
  }
  return (colors[type] ?? chalk.white)(type)
}

/**
 * Colorize a frame type
 * @example
 * frameColor('stone') // gray bold
 */
export function frameColor(frame: string): string {
  const colors: Record<string, (s: string) => string> = {
    stone: chalk.gray,
    iron: chalk.rgb(150, 150, 160),
    wood: chalk.rgb(180, 130, 50),
    bronze: chalk.rgb(200, 160, 60),
    modern: chalk.cyan,
    none: chalk.red,
  }
  return (colors[frame] ?? chalk.white)(frame)
}

// ─── Piece Formatting ───────────────────────────────────

/**
 * Format a single glass piece
 * @example
 * formatPiece(piece, false) // '  file.ts crystal 75 ...'
 */
export function formatPiece(piece: GlassPiece, verbose: boolean): string {
  const lines: string[] = []
  const score = scoreColor(piece.qualityScore)
  const cond = conditionColor(piece.condition)
  lines.push(`  ${chalk.white(piece.file)} ${glassTypeColor(piece.glass.type)} ${score} ${cond}`)

  if (verbose) {
    lines.push(`    Glass: quality=${scoreColor(piece.glass.quality)} transparent=${piece.glass.isTransparent} clarity=${piece.glass.hasClarity}`)
    lines.push(`    Lead: strength=${scoreColor(piece.lead.strength)} ${leadTypeColor(piece.lead.type)} secure=${piece.lead.isSecure}`)
    lines.push(`    Color: richness=${scoreColor(piece.color.richness)} palette=[${piece.color.palette.join(', ')}] vibrant=${piece.color.hasVibrantColors}`)
    lines.push(`    Pattern: complexity=${scoreColor(piece.pattern.complexity)} ${patternStyleColor(piece.pattern.style)} symmetry=${piece.pattern.hasSymmetry}`)
    lines.push(`    Light: transmission=${scoreColor(piece.light.transmission)} quality=${scoreColor(piece.light.quality)} lit=${piece.light.letsLightThrough}`)
    lines.push(`    Structure: integrity=${scoreColor(piece.structure.integrity)} ${frameColor(piece.structure.frame)} sound=${piece.structure.isStructurallySound}`)
  }

  return lines.join('\n')
}

// ─── Workshop Formatting ────────────────────────────────

/**
 * Format a workshop summary
 * @example
 * formatWorkshop(workshop, false) // '  src/ cathedral-studio ...'
 */
export function formatWorkshop(workshop: Workshop, verbose: boolean): string {
  const lines: string[] = []
  const quality = scoreColor(workshop.avgQuality)
  const cond = workshopConditionColor(workshop.condition)

  lines.push(`  ${chalk.white(workshop.directory)} quality=${quality} transmission=${scoreColor(workshop.avgTransmission)} ${cond}`)
  lines.push(`    type=${workshop.workshopType} pieces=${workshop.pieces.length} masterworks=${workshop.masterworkCount} shattered=${workshop.shatteredCount}`)

  if (verbose) {
    for (const piece of workshop.pieces) {
      lines.push(formatPiece(piece, false))
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
export function formatStats(stats: PatternStats): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold('Files')}: ${stats.totalFiles}  ${chalk.bold('Workshops')}: ${stats.totalWorkshops}`)
  lines.push(`  ${chalk.bold('Avg Quality')}: ${scoreColor(stats.avgQuality)}  ${chalk.bold('Avg Transmission')}: ${scoreColor(stats.avgTransmission)}`)
  lines.push(`  ${chalk.bold('Avg Complexity')}: ${scoreColor(stats.avgComplexity)}  ${chalk.bold('Avg Richness')}: ${scoreColor(stats.avgRichness)}`)
  lines.push(`  ${chalk.bold('Avg Strength')}: ${scoreColor(stats.avgStrength)}  ${chalk.bold('Avg Integrity')}: ${scoreColor(stats.avgIntegrity)}`)
  lines.push(`  ${chalk.bold('Brilliance')}: ${scoreColor(stats.overallBrilliance)}  ${chalk.bold('Grade')}: ${artisanGradeColor(stats.artisanGrade)}`)

  lines.push(`  ${chalk.bold('Conditions')}: cathedral=${stats.cathedralMasterpieceCount} rose=${stats.roseWindowCount} mosaic=${stats.mosaicBeautyCount} opal=${stats.opalDreamCount} tarnished=${stats.tarnishedGlassCount} cracked=${stats.crackedPanelCount} shattered=${stats.shatteredCount}`)

  lines.push(`  ${chalk.bold('Best Piece')}: ${stats.bestPiece}`)
  lines.push(`  ${chalk.bold('Most Colorful')}: ${stats.mostColorful}`)
  lines.push(`  ${chalk.bold('Strongest Lead')}: ${stats.strongestLead}`)
  lines.push(`  ${chalk.bold('Most Complex')}: ${stats.mostComplex}`)

  return lines.join('\n')
}

// ─── Table Formatter ────────────────────────────────────

/**
 * Format result as colored table
 * @example
 * formatStainedGlassPatternTable(result, false) // colored output
 */
export function formatStainedGlassPatternTable(result: StainedGlassPatternResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.bold.cyan('🎨 Stained Glass Pattern Analysis'))
  lines.push('═'.repeat(50))

  lines.push('')
  lines.push(chalk.bold('📐 Glass Pieces'))
  for (const piece of result.pieces) {
    lines.push(formatPiece(piece, verbose))
  }

  lines.push('')
  lines.push(chalk.bold('🏗️  Workshops'))
  for (const workshop of result.workshops) {
    lines.push(formatWorkshop(workshop, verbose))
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
 * formatStainedGlassPatternJson(result) // JSON string
 */
export function formatStainedGlassPatternJson(result: StainedGlassPatternResult): string {
  return JSON.stringify(result, null, 2)
}
