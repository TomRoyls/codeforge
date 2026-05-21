import chalk from 'chalk'
import type {
  CrystalAtom,
  CrystalVein,
  MineMeasure,
  CrystalLatticeStats,
  CrystalLatticeResult,
  CrystalCondition,
  VeinType,
  VeinCondition,
  GemologistGrade,
} from './crystal-lattice-helpers.js'

const conditionColor: Record<CrystalCondition, (t: string) => string> = {
  'flawless-diamond': (t: string) => chalk.rgb(46, 204, 113)(t),
  'precious-gem': (t: string) => chalk.rgb(52, 152, 219)(t),
  'quality-crystal': (t: string) => chalk.rgb(241, 196, 15)(t),
  'industrial-crystal': (t: string) => chalk.rgb(230, 126, 34)(t),
  'flawed-crystal': (t: string) => chalk.rgb(231, 76, 60)(t),
  'gravel': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const veinTypeColor: Record<VeinType, (t: string) => string> = {
  'diamond-mine': (t: string) => chalk.rgb(46, 204, 113)(t),
  'quartz-vein': (t: string) => chalk.rgb(52, 152, 219)(t),
  'gem-deposit': (t: string) => chalk.rgb(241, 196, 15)(t),
  'ore-body': (t: string) => chalk.rgb(230, 126, 34)(t),
  'gravel-pit': (t: string) => chalk.rgb(231, 76, 60)(t),
  'sand': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const veinConditionColor: Record<VeinCondition, (t: string) => string> = {
  'pristine-lode': (t: string) => chalk.rgb(46, 204, 113)(t),
  'quality-vein': (t: string) => chalk.rgb(52, 152, 219)(t),
  'workable-deposit': (t: string) => chalk.rgb(241, 196, 15)(t),
  'low-grade': (t: string) => chalk.rgb(230, 126, 34)(t),
  'tailings': (t: string) => chalk.rgb(231, 76, 60)(t),
  'barren': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const gradeColor: Record<GemologistGrade, (t: string) => string> = {
  'master-gemologist': (t: string) => chalk.rgb(46, 204, 113)(t),
  'gemologist': (t: string) => chalk.rgb(52, 152, 219)(t),
  'mineralogist': (t: string) => chalk.rgb(241, 196, 15)(t),
  'geologist': (t: string) => chalk.rgb(230, 126, 34)(t),
  'rock-collector': (t: string) => chalk.rgb(231, 76, 60)(t),
  'child': (t: string) => chalk.rgb(142, 68, 173)(t),
}

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

/**
 * Format atoms as a table
 * @example
 * formatAtomTable(atoms) // formatted string
 */
export function formatAtomTable(atoms: CrystalAtom[]): string {
  if (atoms.length === 0) return chalk.rgb(150, 150, 150)('  No crystal atoms to display')
  const rows = atoms.map(a => {
    const cond = conditionColor[a.condition](a.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(a.file.padEnd(30)), scoreBar(a.qualityScore, 10), cond].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('File'.padEnd(30)), chalk.rgb(100, 200, 255)('Purity'.padEnd(24)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format veins as a table
 * @example
 * formatVeinTable(veins) // formatted string
 */
export function formatVeinTable(veins: CrystalVein[]): string {
  if (veins.length === 0) return chalk.rgb(150, 150, 150)('  No crystal veins to display')
  const rows = veins.map(v => {
    const vt = veinTypeColor[v.veinType](v.veinType.padEnd(20))
    const vc = veinConditionColor[v.condition](v.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(v.directory.padEnd(20)), chalk.rgb(200, 200, 200)(String(v.atoms.length).padEnd(6)), scoreBar(v.avgStructure, 10), vt, vc].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('Directory'.padEnd(20)), chalk.rgb(100, 200, 255)('Files'.padEnd(6)), chalk.rgb(100, 200, 255)('Avg Purity'.padEnd(24)), chalk.rgb(100, 200, 255)('Type'.padEnd(20)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format mine summary
 * @example
 * formatMine(mine) // formatted string
 */
export function formatMine(mine: MineMeasure): string {
  const stable = mine.isStable ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Mine Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Purity:     ${scoreBar(mine.overallPurity)}`,
    `  Avg Structure:      ${scoreBar(mine.avgStructure)}`,
    `  Avg Bond Strength:  ${scoreBar(mine.avgBondStrength)}`,
    `  Avg Clarity:        ${scoreBar(mine.avgClarity)}`,
    `  Total Defects:      ${chalk.rgb(200, 200, 200)(String(mine.totalDefects))}`,
    `  Is Stable:          ${stable}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

/**
 * Format statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: CrystalLatticeStats): string {
  const grade = gradeColor[stats.gemologistGrade](stats.gemologistGrade)
  return [
    '', chalk.rgb(100, 200, 255)('  Crystal Lattice Statistics'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Veins:          ${chalk.rgb(200, 200, 200)(String(stats.totalVeins))}`,
    `  Gemologist Grade:     ${grade}`,
    '', `  Avg Crystal Structure:${scoreBar(stats.avgCrystalStructure)}`,
    `  Avg Bond Strength:    ${scoreBar(stats.avgBondStrength)}`,
    `  Avg Lattice Energy:   ${scoreBar(stats.avgLatticeEnergy)}`,
    `  Avg Defect Density:   ${scoreBar(stats.avgDefectDensity)}`,
    `  Avg Cleavage Quality: ${scoreBar(stats.avgCleavageQuality)}`,
    `  Avg Crystal Clarity:  ${scoreBar(stats.avgCrystalClarity)}`,
    '', `  Flawless Diamond:     ${chalk.rgb(46, 204, 113)(String(stats.flawlessDiamondCount))}`,
    `  Precious Gem:         ${chalk.rgb(52, 152, 219)(String(stats.preciousGemCount))}`,
    `  Quality Crystal:      ${chalk.rgb(241, 196, 15)(String(stats.qualityCrystalCount))}`,
    `  Industrial Crystal:   ${chalk.rgb(230, 126, 34)(String(stats.industrialCrystalCount))}`,
    `  Flawed Crystal:       ${chalk.rgb(231, 76, 60)(String(stats.flawedCrystalCount))}`,
    `  Gravel:               ${chalk.rgb(142, 68, 173)(String(stats.gravelCount))}`,
    '', `  Diamond Cubic:        ${chalk.rgb(200, 200, 200)(String(stats.diamondCubicCount))}`,
    `  Face Centered:        ${chalk.rgb(200, 200, 200)(String(stats.faceCenteredCount))}`,
    `  Amorphous:            ${chalk.rgb(200, 200, 200)(String(stats.amorphousCount))}`,
    `  Glass:                ${chalk.rgb(200, 200, 200)(String(stats.glassCount))}`,
    '', `  Has Vacancies:        ${chalk.rgb(200, 200, 200)(String(stats.hasVacanciesCount))}`,
    `  Has Dislocations:     ${chalk.rgb(200, 200, 200)(String(stats.hasDislocationsCount))}`,
    `  Has Precipitates:     ${chalk.rgb(200, 200, 200)(String(stats.hasPrecipitatesCount))}`,
    `  Perfect Cleavage:     ${chalk.rgb(200, 200, 200)(String(stats.hasPerfectCleavageCount))}`,
    `  Flawless Clarity:     ${chalk.rgb(200, 200, 200)(String(stats.isFlawlessCount))}`,
    `  Opaque:               ${chalk.rgb(200, 200, 200)(String(stats.isOpaqueCount))}`,
    `  Brittle:              ${chalk.rgb(200, 200, 200)(String(stats.isBrittleCount))}`,
    `  Ductile:              ${chalk.rgb(200, 200, 200)(String(stats.isDuctileCount))}`,
    '', `  Covalent Bonds:       ${chalk.rgb(200, 200, 200)(String(stats.covalentBondCount))}`,
    `  Ionic Bonds:          ${chalk.rgb(200, 200, 200)(String(stats.ionicBondCount))}`,
    `  Broken Bonds:         ${chalk.rgb(200, 200, 200)(String(stats.brokenBondCount))}`,
    '', `  Purest Crystal:       ${chalk.rgb(46, 204, 113)(stats.purestCrystal)}`,
    `  Strongest Bonds:      ${chalk.rgb(46, 204, 113)(stats.strongestBonds)}`,
    `  Clearest Crystal:     ${chalk.rgb(46, 204, 113)(stats.clearestCrystal)}`,
    `  Most Defective:       ${chalk.rgb(231, 76, 60)(stats.mostDefective)}`,
    `  Easiest to Cleave:    ${chalk.rgb(46, 204, 113)(stats.easiestToCleaved)}`,
    '',
  ].join('\n')
}

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - crystal lattice is pure')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

/**
 * Format complete report
 * @example
 * formatCrystalLatticeReport(result) // formatted string
 */
export function formatCrystalLatticeReport(result: CrystalLatticeResult): string {
  return [formatMine(result.mine), formatAtomTable(result.atoms), '', formatVeinTable(result.veins), formatStats(result.stats), formatRecommendations(result.recommendations)].join('\n')
}

/**
 * Format result as JSON
 * @example
 * formatCrystalLatticeJSON(result) // JSON string
 */
export function formatCrystalLatticeJSON(result: CrystalLatticeResult): string {
  return JSON.stringify(result, null, 2)
}
