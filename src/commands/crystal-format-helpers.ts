import chalk from 'chalk'

import type {
  CrystalDefect,
  CrystalLattice,
  CrystalQuality,
  CrystalResult,
  CrystalStats,
  CrystalSystemGroup,
  OverallGrade,
} from './crystal-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const GRADE_COLOR: Record<string, (s: string) => string> = {
  diamond: chalk.rgb(185, 242, 255),
  sapphire: chalk.rgb(100, 149, 237),
  ruby: chalk.rgb(224, 17, 95),
  emerald: chalk.rgb(80, 200, 120),
  quartz: chalk.rgb(200, 180, 220),
  glass: chalk.rgb(200, 200, 200),
  gravel: chalk.rgb(160, 140, 120),
}

const QUALITY_COLOR: Record<string, (s: string) => string> = {
  flawless: chalk.rgb(185, 242, 255),
  excellent: chalk.rgb(72, 199, 142),
  good: chalk.rgb(130, 200, 130),
  fair: chalk.rgb(200, 180, 80),
  poor: chalk.rgb(220, 150, 80),
  fractured: chalk.rgb(220, 80, 80),
}

const SYSTEM_COLOR: Record<string, (s: string) => string> = {
  cubic: chalk.rgb(185, 242, 255),
  tetragonal: chalk.rgb(72, 199, 142),
  hexagonal: chalk.rgb(100, 149, 237),
  orthorhombic: chalk.rgb(130, 200, 130),
  monoclinic: chalk.rgb(200, 180, 80),
  triclinic: chalk.rgb(220, 150, 80),
  amorphous: chalk.rgb(220, 80, 80),
}

const DEFECT_SYMBOL: Record<string, string> = {
  vacancy: '\u25CB',
  interstitial: '\u25CF',
  substitution: '\u25D0',
  dislocation: '\u25D1',
  'grain-boundary': '\u2502',
  'stacking-fault': '\u2248',
}

/**
 * Format overall grade with color.
 *
 * @example
 * formatGrade('diamond') // => colored 'diamond'
 */
export function formatGrade(grade: OverallGrade): string {
  const color = GRADE_COLOR[grade] ?? ((s: string) => s)
  return color(grade)
}

/**
 * Format crystal quality with color.
 *
 * @example
 * formatQuality('flawless') // => colored 'flawless'
 */
export function formatQuality(quality: CrystalQuality): string {
  const color = QUALITY_COLOR[quality] ?? ((s: string) => s)
  return color(quality)
}

/**
 * Format crystal system name with color.
 *
 * @example
 * formatSystemName('cubic') // => colored 'cubic'
 */
export function formatSystemName(system: string): string {
  const color = SYSTEM_COLOR[system] ?? ((s: string) => s)
  return color(system)
}

/**
 * Format purity gauge.
 *
 * @example
 * formatPurityGauge(85) // => '█████████████████░░░░░ 85%'
 */
export function formatPurityGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 80 ? chalk.rgb(72, 199, 142) : value >= 50 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}%`)
}

/**
 * Format defect type badge.
 *
 * @example
 * formatDefectBadge('vacancy') // => '○ vacancy'
 */
export function formatDefectBadge(type: string): string {
  return `${DEFECT_SYMBOL[type] ?? '\u25AA'} ${type}`
}

// ─── Lattice Table ─────────────────────────────────────────────────────────────

/**
 * Format lattice overview table.
 *
 * @example
 * formatLatticeTable(lattices) // => table string
 */
export function formatLatticeTable(lattices: CrystalLattice[]): string {
  const header = chalk.bold('Crystal Lattices')
  const separator = '\u2500'.repeat(75)

  if (lattices.length === 0) {
    return `${header}\n${separator}\nNo lattices analyzed.`
  }

  const lines = [header, separator]

  for (const l of lattices) {
    const system = formatSystemName(l.system)
    lines.push(`${chalk.cyan(l.file.padEnd(30))} ${system.padEnd(18)} R:${l.regularity} S:${l.symmetry} P:${l.purity} C:${l.clarity}`)
  }

  return lines.join('\n')
}

// ─── Defect Map ────────────────────────────────────────────────────────────────

/**
 * Format defect map.
 *
 * @example
 * formatDefectMap(defects) // => defect list
 */
export function formatDefectMap(defects: CrystalDefect[]): string {
  const header = chalk.bold('Crystal Defects')
  const separator = '\u2500'.repeat(60)

  if (defects.length === 0) {
    return `${header}\n${separator}\n${chalk.rgb(72, 199, 142)('No defects found. Pure crystal!')}`
  }

  const lines = [header, separator]

  for (const d of defects) {
    const badge = formatDefectBadge(d.type)
    const sevColor = d.severity === 'major' ? chalk.rgb(220, 80, 80) : d.severity === 'moderate' ? chalk.rgb(200, 180, 80) : chalk.rgb(130, 200, 130)
    lines.push(`${badge} ${sevColor(d.severity.padEnd(10))} L${d.location}: ${d.description}`)
  }

  return lines.join('\n')
}

// ─── Facet Table ───────────────────────────────────────────────────────────────

/**
 * Format facet clarity table.
 *
 * @example
 * formatFacetTable(facets) // => table string
 */
export function formatFacetTable(lattices: CrystalLattice[]): string {
  const header = chalk.bold('Crystal Facets')
  const separator = '\u2500'.repeat(60)
  const lines = [header, separator]

  let totalFacets = 0
  for (const l of lattices) {
    for (const f of l.facets) {
      totalFacets++
      const clarityBar = formatPurityGauge(f.clarity, 10)
      lines.push(`${f.type.padEnd(10)} ${chalk.cyan(f.name.padEnd(25))} ${clarityBar}`)
    }
  }

  if (totalFacets === 0) {
    lines.push('No facets found.')
  }

  return lines.join('\n')
}

// ─── System Overview ───────────────────────────────────────────────────────────

/**
 * Format crystal systems overview.
 *
 * @example
 * formatSystemOverview(systems) // => overview string
 */
export function formatSystemOverview(systems: CrystalSystemGroup[]): string {
  const header = chalk.bold('Crystal Systems')
  const separator = '\u2500'.repeat(60)

  if (systems.length === 0) {
    return `${header}\n${separator}\nNo systems classified.`
  }

  const lines = [header, separator]

  for (const s of systems) {
    const quality = formatQuality(s.quality)
    lines.push(`${formatSystemName(s.name).padEnd(20)} ${quality.padEnd(12)} ${s.files.length} file${s.files.length > 1 ? 's' : ''}  growth:${s.growthPattern}`)
    lines.push(`  ${chalk.gray(s.description)}`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format crystal stats summary.
 *
 * @example
 * formatCrystalStats(stats) // => summary string
 */
export function formatCrystalStats(stats: CrystalStats): string {
  const header = chalk.bold('Crystal Analysis')
  const separator = '\u2500'.repeat(50)

  const lines = [
    header,
    separator,
    `Lattices:      ${stats.totalLattices}  (flawless: ${stats.flawlessFiles}, fractured: ${stats.fracturedFiles})`,
    `Defects:       ${stats.totalDefects} (minor: ${stats.minorDefects}, major: ${stats.majorDefects})`,
    `Facets:        ${stats.totalFacets}  (avg clarity: ${stats.avgFacetClarity})`,
    `System:        ${formatSystemName(stats.dominantSystem)} (dominant)`,
    separator,
    `Regularity:    ${formatPurityGauge(stats.avgRegularity, 15)}`,
    `Symmetry:      ${formatPurityGauge(stats.avgSymmetry, 15)}`,
    `Purity:        ${formatPurityGauge(stats.avgPurity, 15)}`,
    `Clarity:       ${formatPurityGauge(stats.avgClarity, 15)}`,
    separator,
    `Quality:       ${stats.crystalQuality}/100`,
    `Grade:         ${formatGrade(stats.overallGrade)}`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Crystal clear!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full crystal table output.
 *
 * @example
 * formatCrystalTable(result) // => full table string
 */
export function formatCrystalTable(result: CrystalResult): string {
  const allDefects = result.lattices.reduce<CrystalDefect[]>((acc, l) => acc.concat(l.defects), [])

  return [
    formatCrystalStats(result.stats),
    '',
    formatSystemOverview(result.systems),
    '',
    formatLatticeTable(result.lattices),
    '',
    formatDefectMap(allDefects),
    '',
    formatFacetTable(result.lattices),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format crystal result as JSON.
 *
 * @example
 * formatCrystalJson(result) // => JSON string
 */
export function formatCrystalJson(result: CrystalResult): string {
  return JSON.stringify(result, null, 2)
}
