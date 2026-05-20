import chalk from 'chalk'

import type {
  ForgedPiece,
  ForgeResult,
  ForgeStats,
  ForgeWeld,
  HammerMark,
  HeatGrade,
  HeatTreatment,
  MetalType,
  OverallForge,
  PieceGrade,
  WeldQuality,
} from './forge-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<PieceGrade, (s: string) => string> = {
  masterwork: chalk.rgb(255, 215, 0),
  fine: chalk.rgb(72, 199, 142),
  standard: chalk.rgb(100, 149, 237),
  rough: chalk.rgb(220, 150, 80),
  'pig-iron': chalk.rgb(180, 80, 80),
}

const METAL_COLOR: Record<MetalType, (s: string) => string> = {
  steel: chalk.rgb(192, 192, 210),
  iron: chalk.rgb(160, 160, 170),
  bronze: chalk.rgb(205, 150, 80),
  copper: chalk.rgb(220, 120, 60),
  tin: chalk.rgb(180, 180, 190),
}

const WELD_COLOR: Record<WeldQuality, (s: string) => string> = {
  seamless: chalk.rgb(72, 199, 142),
  clean: chalk.rgb(100, 200, 180),
  acceptable: chalk.rgb(200, 200, 80),
  rough: chalk.rgb(220, 150, 80),
  broken: chalk.rgb(220, 80, 80),
}

const HEAT_COLOR: Record<HeatGrade, (s: string) => string> = {
  'properly-hardened': chalk.rgb(72, 199, 142),
  'case-hardened': chalk.rgb(100, 200, 180),
  annealed: chalk.rgb(200, 200, 80),
  raw: chalk.rgb(220, 150, 80),
  brittle: chalk.rgb(220, 80, 80),
}

const FORGE_COLOR: Record<OverallForge, (s: string) => string> = {
  legendary: chalk.rgb(255, 215, 0),
  master: chalk.rgb(72, 199, 142),
  journeyman: chalk.rgb(100, 149, 237),
  apprentice: chalk.rgb(220, 150, 80),
  novice: chalk.rgb(220, 80, 80),
}

// ─── Label Formatters ──────────────────────────────────────────────────────────

/**
 * Format grade label with color.
 *
 * @example
 * formatGradeLabel('masterwork') // => colored string
 */
export function formatGradeLabel(grade: PieceGrade): string {
  return (GRADE_COLOR[grade] ?? ((s: string) => s))(grade)
}

/**
 * Format metal label with color.
 *
 * @example
 * formatMetalLabel('steel') // => colored string
 */
export function formatMetalLabel(metal: MetalType): string {
  return (METAL_COLOR[metal] ?? ((s: string) => s))(metal)
}

/**
 * Format weld quality label.
 *
 * @example
 * formatWeldQualityLabel('seamless') // => colored string
 */
export function formatWeldQualityLabel(quality: WeldQuality): string {
  return (WELD_COLOR[quality] ?? ((s: string) => s))(quality)
}

/**
 * Format heat treatment grade label.
 *
 * @example
 * formatHeatGradeLabel('properly-hardened') // => colored string
 */
export function formatHeatGradeLabel(grade: HeatGrade): string {
  return (HEAT_COLOR[grade] ?? ((s: string) => s))(grade)
}

/**
 * Format overall forge label.
 *
 * @example
 * formatOverallForgeLabel('legendary') // => colored string
 */
export function formatOverallForgeLabel(forge: OverallForge): string {
  return (FORGE_COLOR[forge] ?? ((s: string) => s))(forge)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a craftsmanship gauge.
 *
 * @example
 * formatCraftsmanshipGauge(75) // => '███████████████░░░░░ 75'
 */
export function formatCraftsmanshipGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 75 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Piece Table ───────────────────────────────────────────────────────────────

/**
 * Format forged pieces table.
 *
 * @example
 * formatPieces(pieces) // => piece grading table
 */
export function formatPieces(pieces: ForgedPiece[]): string {
  const header = chalk.bold('Forged Pieces')
  const separator = '\u2500'.repeat(90)

  if (pieces.length === 0) {
    return `${header}\n${separator}\nNo files to analyze.`
  }

  const lines = [header, separator]
  for (const p of pieces) {
    const grade = formatGradeLabel(p.grade)
    const metal = formatMetalLabel(p.metal)
    lines.push(`${chalk.cyan(p.file.padEnd(35))} ${grade.padEnd(12)} ${metal.padEnd(8)} craft:${p.craftsmanship}  temp:${p.temper}  polish:${p.polish}`)
  }

  return lines.join('\n')
}

// ─── Weld Inspection ───────────────────────────────────────────────────────────

/**
 * Format weld inspection report.
 *
 * @example
 * formatWelds(welds) // => weld report
 */
export function formatWelds(welds: ForgeWeld[]): string {
  const header = chalk.bold('Weld Inspection')
  const separator = '\u2500'.repeat(70)

  if (welds.length === 0) {
    return `${header}\n${separator}\nNo welds detected.`
  }

  const lines = [header, separator]
  for (const w of welds) {
    const quality = formatWeldQualityLabel(w.quality)
    lines.push(`${quality.padEnd(12)} ${w.type.padEnd(18)} str:${w.strength}  ${w.location}`)
    if (w.issue) {
      lines.push(`  ${chalk.rgb(220, 150, 80)(`\u26A0 ${w.issue}`)}`)
    }
  }

  return lines.join('\n')
}

// ─── Hammer Marks ──────────────────────────────────────────────────────────────

/**
 * Format hammer marks analysis.
 *
 * @example
 * formatHammerMarks(marks) // => mark analysis
 */
export function formatHammerMarks(marks: HammerMark[]): string {
  const header = chalk.bold('Hammer Mark Analysis')
  const separator = '\u2500'.repeat(60)

  if (marks.length === 0) {
    return `${header}\n${separator}\nNo hammer marks detected.`
  }

  const lines = [header, separator]
  for (const m of marks) {
    const impactIcon = m.impact === 'positive' ? '\u2713' : m.impact === 'negative' ? '\u2717' : '-'
    const impactColor = m.impact === 'positive' ? chalk.rgb(72, 199, 142) : m.impact === 'negative' ? chalk.rgb(220, 80, 80) : chalk.rgb(200, 200, 80)
    lines.push(`${impactColor(impactIcon)} L${m.location}`.padEnd(10) + ` ${m.type.padEnd(12)} ${m.evidence}`)
  }

  return lines.join('\n')
}

// ─── Heat Treatment ────────────────────────────────────────────────────────────

/**
 * Format heat treatment assessment.
 *
 * @example
 * formatHeatTreatment(heat) // => assessment string
 */
export function formatHeatTreatment(ht: HeatTreatment): string {
  const grade = formatHeatGradeLabel(ht.grade)
  return [
    `Error Handling:   ${ht.errorHandling}`,
    `Edge Coverage:    ${ht.edgeCaseCoverage}`,
    `Input Validation: ${ht.inputValidation}`,
    `Failure Recovery: ${ht.failureRecovery}`,
    `Grade:            ${grade}`,
  ].join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format forge stats summary.
 *
 * @example
 * formatForgeStats(stats) // => stats summary
 */
export function formatForgeStats(stats: ForgeStats): string {
  const header = chalk.bold('Forge Analysis')
  const separator = '\u2500'.repeat(55)
  const forgeLabel = formatOverallForgeLabel(stats.overallForge)

  return [
    header,
    separator,
    `Pieces:          ${stats.totalPieces} (masterwork:${stats.masterworkCount} pig-iron:${stats.pigIronCount})`,
    `Avg Temper:      ${stats.avgTemper}`,
    `Avg Craft:       ${stats.avgCraftsmanship}`,
    `Avg Polish:      ${stats.avgPolish}`,
    `Welds:           ${stats.totalWelds} (seamless:${stats.seamlessWelds} broken:${stats.brokenWelds})`,
    `Hammer Marks:    ${stats.totalHammerMarks} (skilled:${stats.skilledMarks} rushed:${stats.rushedMarks})`,
    `Avg Heat Treat:  ${stats.avgHeatTreatment}`,
    `Heat Grades:     hardened:${stats.properlyHardened} brittle:${stats.brittle}`,
    separator,
    `Craftsmanship:   ${formatCraftsmanshipGauge(stats.avgCraftsmanship, 15)}`,
    `Anvil Index:     ${formatCraftsmanshipGauge(stats.anvilIndex, 15)}`,
    `Forge Quality:   ${formatCraftsmanshipGauge(stats.forgeQuality, 15)}`,
    separator,
    `Overall Forge:   ${forgeLabel}`,
  ].join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format forge recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Masterful craftsmanship!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full forge table output.
 *
 * @example
 * formatForgeTable(result) // => full table string
 */
export function formatForgeTable(result: ForgeResult): string {
  const allWelds = result.pieces.flatMap(p => p.welds)
  const allMarks = result.pieces.flatMap(p => p.hammerMarks)

  const sections = [
    formatForgeStats(result.stats),
    '',
    formatPieces(result.pieces),
    '',
    formatWelds(allWelds),
    '',
    formatHammerMarks(allMarks),
    '',
  ]

  for (const p of result.pieces) {
    sections.push(chalk.bold(`Heat Treatment: ${p.file}`))
    sections.push(formatHeatTreatment(p.heatTreatment))
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format forge result as JSON.
 *
 * @example
 * formatForgeJson(result) // => JSON string
 */
export function formatForgeJson(result: ForgeResult): string {
  return JSON.stringify(result, null, 2)
}
