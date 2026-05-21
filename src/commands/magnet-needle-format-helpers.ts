import chalk from 'chalk'
import type {
  MagnetPole,
  MagneticField,
  LabMeasure,
  MagnetNeedleStats,
  MagnetNeedleResult,
  PoleCondition,
  FieldType,
  FieldCondition,
  PhysicistGrade,
} from './magnet-needle-helpers.js'

// ─── Condition Colors ────────────────────────────────────

const poleConditionColor: Record<PoleCondition, (t: string) => string> = {
  'superconductor': (t: string) => chalk.rgb(46, 204, 113)(t),
  'strong-magnet': (t: string) => chalk.rgb(52, 152, 219)(t),
  'ferromagnetic': (t: string) => chalk.rgb(241, 196, 15)(t),
  'paramagnetic': (t: string) => chalk.rgb(230, 126, 34)(t),
  'diamagnetic': (t: string) => chalk.rgb(231, 76, 60)(t),
  'insulator': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const fieldTypeColor: Record<FieldType, (t: string) => string> = {
  'fusion-reactor': (t: string) => chalk.rgb(46, 204, 113)(t),
  'mri-machine': (t: string) => chalk.rgb(52, 152, 219)(t),
  'motor': (t: string) => chalk.rgb(241, 196, 15)(t),
  'generator': (t: string) => chalk.rgb(230, 126, 34)(t),
  'compass': (t: string) => chalk.rgb(231, 76, 60)(t),
  'demagnetized': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const fieldConditionColor: Record<FieldCondition, (t: string) => string> = {
  'perfectly-calibrated': (t: string) => chalk.rgb(46, 204, 113)(t),
  'well-tuned': (t: string) => chalk.rgb(52, 152, 219)(t),
  'functional': (t: string) => chalk.rgb(241, 196, 15)(t),
  'misaligned': (t: string) => chalk.rgb(230, 126, 34)(t),
  'chaotic': (t: string) => chalk.rgb(231, 76, 60)(t),
  'degaussed': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const physicistGradeColor: Record<PhysicistGrade, (t: string) => string> = {
  'nobel-laureate': (t: string) => chalk.rgb(46, 204, 113)(t),
  'physicist': (t: string) => chalk.rgb(52, 152, 219)(t),
  'engineer': (t: string) => chalk.rgb(241, 196, 15)(t),
  'technician': (t: string) => chalk.rgb(230, 126, 34)(t),
  'student': (t: string) => chalk.rgb(231, 76, 60)(t),
  'layman': (t: string) => chalk.rgb(142, 68, 173)(t),
}

// ─── Score Bar ───────────────────────────────────────────

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

// ─── Pole Table ──────────────────────────────────────────

/**
 * Format magnet poles as a table
 * @example
 * formatPoleTable(poles) // formatted string
 */
export function formatPoleTable(poles: MagnetPole[]): string {
  if (poles.length === 0) return chalk.rgb(150, 150, 150)('  No magnet poles to display')

  const rows = poles.map(p => {
    const cond = poleConditionColor[p.condition](p.condition.padEnd(18))
    return [
      chalk.rgb(200, 200, 200)(p.file.padEnd(30)),
      scoreBar(p.qualityScore, 10),
      scoreBar(p.magneticStrength, 10),
      cond,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('File'.padEnd(30)),
    chalk.rgb(100, 200, 255)('Quality'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Strength'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Field Table ─────────────────────────────────────────

/**
 * Format magnetic fields as a table
 * @example
 * formatFieldTable(fields) // formatted string
 */
export function formatFieldTable(fields: MagneticField[]): string {
  if (fields.length === 0) return chalk.rgb(150, 150, 150)('  No magnetic fields to display')

  const rows = fields.map(f => {
    const ft = fieldTypeColor[f.fieldType](f.fieldType.padEnd(18))
    const fc = fieldConditionColor[f.condition](f.condition.padEnd(22))
    return [
      chalk.rgb(200, 200, 200)(f.directory.padEnd(20)),
      chalk.rgb(200, 200, 200)(String(f.poles.length).padEnd(6)),
      scoreBar(f.avgStrength, 10),
      ft,
      fc,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('Directory'.padEnd(20)),
    chalk.rgb(100, 200, 255)('Files'.padEnd(6)),
    chalk.rgb(100, 200, 255)('Avg Strength'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Type'.padEnd(18)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Lab Summary ─────────────────────────────────────────

/**
 * Format lab summary
 * @example
 * formatLab(lab) // formatted string
 */
export function formatLab(lab: LabMeasure): string {
  const balanced = lab.isBalanced ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Lab Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Alignment:  ${scoreBar(lab.overallAlignment)}`,
    `  Avg Strength:       ${scoreBar(lab.avgStrength)}`,
    `  Avg Coercivity:     ${scoreBar(lab.avgCoercivity)}`,
    `  Avg Permeability:   ${scoreBar(lab.avgPermeability)}`,
    `  Total Couplings:    ${chalk.rgb(200, 200, 200)(String(lab.totalCouplingPartners))}`,
    `  Balanced:           ${balanced}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

// ─── Statistics ──────────────────────────────────────────

/**
 * Format magnet statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: MagnetNeedleStats): string {
  const grade = physicistGradeColor[stats.physicistGrade](stats.physicistGrade)
  return [
    '',
    chalk.rgb(100, 200, 255)('  Magnet Statistics'),
    chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Fields:         ${chalk.rgb(200, 200, 200)(String(stats.totalFields))}`,
    `  Physicist Grade:      ${grade}`,
    '',
    `  Avg Magnetic Strength:${scoreBar(stats.avgMagneticStrength)}`,
    `  Avg Field Range:      ${scoreBar(stats.avgFieldRange)}`,
    `  Avg Coercivity:       ${scoreBar(stats.avgCoercivity)}`,
    `  Avg Remanence:        ${scoreBar(stats.avgRemanence)}`,
    `  Avg Permeability:     ${scoreBar(stats.avgPermeability)}`,
    '',
    `  Superconductors:      ${chalk.rgb(46, 204, 113)(String(stats.superconductorCount))}`,
    `  Strong Magnets:       ${chalk.rgb(52, 152, 219)(String(stats.strongMagnetCount))}`,
    `  Ferromagnetic:        ${chalk.rgb(241, 196, 15)(String(stats.ferromagneticCount))}`,
    `  Paramagnetic:         ${chalk.rgb(230, 126, 34)(String(stats.paramagneticCount))}`,
    `  Diamagnetic:          ${chalk.rgb(231, 76, 60)(String(stats.diamagneticCount))}`,
    `  Insulators:           ${chalk.rgb(142, 68, 173)(String(stats.insulatorCount))}`,
    '',
    `  Neodymium:            ${chalk.rgb(200, 200, 200)(String(stats.neodymiumCount))}`,
    `  Ceramic:              ${chalk.rgb(200, 200, 200)(String(stats.ceramicCount))}`,
    `  Electromagnet:        ${chalk.rgb(200, 200, 200)(String(stats.electromagnetCount))}`,
    `  Demagnetized:         ${chalk.rgb(200, 200, 200)(String(stats.demagnetizedCount))}`,
    '',
    `  Strong Field:         ${chalk.rgb(200, 200, 200)(String(stats.hasStrongFieldCount))}`,
    `  Has Leakage:          ${chalk.rgb(200, 200, 200)(String(stats.hasLeakageCount))}`,
    `  Has Hysteresis:       ${chalk.rgb(200, 200, 200)(String(stats.hasHysteresisCount))}`,
    `  Has Shielding:        ${chalk.rgb(200, 200, 200)(String(stats.hasShieldingCount))}`,
    `  Hard Magnets:         ${chalk.rgb(200, 200, 200)(String(stats.hardMagnetCount))}`,
    `  Soft Magnets:         ${chalk.rgb(200, 200, 200)(String(stats.softMagnetCount))}`,
    `  Strong Attraction:    ${chalk.rgb(200, 200, 200)(String(stats.strongAttractionCount))}`,
    `  Is Stable:            ${chalk.rgb(200, 200, 200)(String(stats.isStableCount))}`,
    '',
    `  Strongest Magnet:     ${chalk.rgb(46, 204, 113)(stats.strongestMagnet)}`,
    `  Most Permeable:       ${chalk.rgb(46, 204, 113)(stats.mostPermeable)}`,
    `  Most Shielded:        ${chalk.rgb(46, 204, 113)(stats.mostShielded)}`,
    `  Highest Coercivity:   ${chalk.rgb(46, 204, 113)(stats.highestCoercivity)}`,
    `  Most Balanced:        ${chalk.rgb(46, 204, 113)(stats.mostBalanced)}`,
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
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - magnetic field is perfectly aligned')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

// ─── Full Report ─────────────────────────────────────────

/**
 * Format the complete magnet-needle report
 * @example
 * formatMagnetNeedleReport(result) // formatted string
 */
export function formatMagnetNeedleReport(result: MagnetNeedleResult): string {
  const sections: string[] = [
    formatLab(result.lab),
    formatPoleTable(result.poles),
    '',
    formatFieldTable(result.fields),
    formatStats(result.stats),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format result as JSON string
 * @example
 * formatMagnetNeedleJSON(result) // JSON string
 */
export function formatMagnetNeedleJSON(result: MagnetNeedleResult): string {
  return JSON.stringify(result, null, 2)
}
