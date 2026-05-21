import chalk from 'chalk'
import type {
  MandalaRing,
  MandalaGarden,
  MonasteryMeasure,
  MandalaPatternStats,
  MandalaPatternResult,
  MandalaCondition,
  GardenType,
  GardenCondition,
  ArtistGrade,
} from './mandala-pattern-helpers.js'

const conditionColor: Record<MandalaCondition, (t: string) => string> = {
  'divine-mandala': (t: string) => chalk.rgb(46, 204, 113)(t),
  'temple-art': (t: string) => chalk.rgb(52, 152, 219)(t),
  'beautiful-pattern': (t: string) => chalk.rgb(241, 196, 15)(t),
  'decorative-art': (t: string) => chalk.rgb(230, 126, 34)(t),
  'rough-sketch': (t: string) => chalk.rgb(231, 76, 60)(t),
  'scribble': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const gardenTypeColor: Record<GardenType, (t: string) => string> = {
  'temple-garden': (t: string) => chalk.rgb(46, 204, 113)(t),
  'zen-garden': (t: string) => chalk.rgb(52, 152, 219)(t),
  'flower-garden': (t: string) => chalk.rgb(241, 196, 15)(t),
  'wildflower': (t: string) => chalk.rgb(230, 126, 34)(t),
  'overgrown': (t: string) => chalk.rgb(231, 76, 60)(t),
  'wasteland': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const gardenCondColor: Record<GardenCondition, (t: string) => string> = {
  'masterpiece': (t: string) => chalk.rgb(46, 204, 113)(t),
  'beautiful': (t: string) => chalk.rgb(52, 152, 219)(t),
  'pleasant': (t: string) => chalk.rgb(241, 196, 15)(t),
  'mediocre': (t: string) => chalk.rgb(230, 126, 34)(t),
  'messy': (t: string) => chalk.rgb(231, 76, 60)(t),
  'chaotic': (t: string) => chalk.rgb(142, 68, 173)(t),
}
const gradeColor: Record<ArtistGrade, (t: string) => string> = {
  'master-artist': (t: string) => chalk.rgb(46, 204, 113)(t),
  'temple-artist': (t: string) => chalk.rgb(52, 152, 219)(t),
  'artisan': (t: string) => chalk.rgb(241, 196, 15)(t),
  'craftsman': (t: string) => chalk.rgb(230, 126, 34)(t),
  'student': (t: string) => chalk.rgb(231, 76, 60)(t),
  'child': (t: string) => chalk.rgb(142, 68, 173)(t),
}

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

/**
 * Format rings as a table
 * @example
 * formatRingTable(rings) // formatted string
 */
export function formatRingTable(rings: MandalaRing[]): string {
  if (rings.length === 0) return chalk.rgb(150, 150, 150)('  No mandala rings to display')
  const rows = rings.map(r => {
    const cond = conditionColor[r.condition](r.condition.padEnd(20))
    return [chalk.rgb(200, 200, 200)(r.file.padEnd(30)), scoreBar(r.qualityScore, 10), cond].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('File'.padEnd(30)), chalk.rgb(100, 200, 255)('Beauty'.padEnd(24)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format gardens as a table
 * @example
 * formatGardenTable(gardens) // formatted string
 */
export function formatGardenTable(gardens: MandalaGarden[]): string {
  if (gardens.length === 0) return chalk.rgb(150, 150, 150)('  No mandala gardens to display')
  const rows = gardens.map(g => {
    const gt = gardenTypeColor[g.gardenType](g.gardenType.padEnd(20))
    const gc = gardenCondColor[g.condition](g.condition.padEnd(16))
    return [chalk.rgb(200, 200, 200)(g.directory.padEnd(20)), chalk.rgb(200, 200, 200)(String(g.rings.length).padEnd(6)), scoreBar(g.avgSymmetry, 10), gt, gc].join('  ')
  })
  const header = [chalk.rgb(100, 200, 255)('Directory'.padEnd(20)), chalk.rgb(100, 200, 255)('Files'.padEnd(6)), chalk.rgb(100, 200, 255)('Avg Beauty'.padEnd(24)), chalk.rgb(100, 200, 255)('Type'.padEnd(20)), chalk.rgb(100, 200, 255)('Condition')].join('  ')
  return [header, ...rows].join('\n')
}

/**
 * Format monastery summary
 * @example
 * formatMonastery(monastery) // formatted string
 */
export function formatMonastery(monastery: MonasteryMeasure): string {
  const beautiful = monastery.isBeautiful ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Monastery Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Beauty:     ${scoreBar(monastery.overallBeauty)}`,
    `  Avg Symmetry:       ${scoreBar(monastery.avgSymmetry)}`,
    `  Avg Harmony:        ${scoreBar(monastery.avgHarmony)}`,
    `  Avg Completeness:   ${scoreBar(monastery.avgCompleteness)}`,
    `  Avg Meditative:     ${scoreBar(monastery.avgMeditative)}`,
    `  Is Beautiful:       ${beautiful}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

/**
 * Format statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: MandalaPatternStats): string {
  const grade = gradeColor[stats.artistGrade](stats.artistGrade)
  return [
    '', chalk.rgb(100, 200, 255)('  Mandala Pattern Statistics'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:          ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Gardens:        ${chalk.rgb(200, 200, 200)(String(stats.totalGardens))}`,
    `  Artist Grade:         ${grade}`,
    '', `  Avg Radial Symmetry:  ${scoreBar(stats.avgRadialSymmetry)}`,
    `  Avg Concentric:       ${scoreBar(stats.avgConcentricBalance)}`,
    `  Avg Color Harmony:    ${scoreBar(stats.avgColorHarmony)}`,
    `  Avg Sacred Geometry:  ${scoreBar(stats.avgSacredGeometry)}`,
    `  Avg Completeness:     ${scoreBar(stats.avgCompleteness)}`,
    `  Avg Meditative:       ${scoreBar(stats.avgMeditativeQuality)}`,
    '', `  Divine Mandala:       ${chalk.rgb(46, 204, 113)(String(stats.divineMandalaCount))}`,
    `  Temple Art:           ${chalk.rgb(52, 152, 219)(String(stats.templeArtCount))}`,
    `  Beautiful Pattern:    ${chalk.rgb(241, 196, 15)(String(stats.beautifulPatternCount))}`,
    `  Decorative Art:       ${chalk.rgb(230, 126, 34)(String(stats.decorativeArtCount))}`,
    `  Rough Sketch:         ${chalk.rgb(231, 76, 60)(String(stats.roughSketchCount))}`,
    `  Scribble:             ${chalk.rgb(142, 68, 173)(String(stats.scribbleCount))}`,
    '', `  Radial Symmetry:      ${chalk.rgb(200, 200, 200)(String(stats.radialSymmetryCount))}`,
    `  Bilateral:            ${chalk.rgb(200, 200, 200)(String(stats.bilateralSymmetryCount))}`,
    `  Spiral:               ${chalk.rgb(200, 200, 200)(String(stats.spiralSymmetryCount))}`,
    `  Chaotic:              ${chalk.rgb(200, 200, 200)(String(stats.chaoticSymmetryCount))}`,
    '', `  Has Repetition:       ${chalk.rgb(200, 200, 200)(String(stats.hasRepetitionCount))}`,
    `  Has Rhythm:           ${chalk.rgb(200, 200, 200)(String(stats.hasRhythmCount))}`,
    `  Has Focal Point:      ${chalk.rgb(200, 200, 200)(String(stats.hasFocalPointCount))}`,
    `  Complementary:        ${chalk.rgb(200, 200, 200)(String(stats.isComplementaryCount))}`,
    `  Monochromatic:        ${chalk.rgb(200, 200, 200)(String(stats.isMonochromaticCount))}`,
    `  Clashing:             ${chalk.rgb(200, 200, 200)(String(stats.hasClashingCount))}`,
    '', `  Has Circles:          ${chalk.rgb(200, 200, 200)(String(stats.hasCirclesCount))}`,
    `  Has Spirals:          ${chalk.rgb(200, 200, 200)(String(stats.hasSpiralsCount))}`,
    `  Has Fractals:         ${chalk.rgb(200, 200, 200)(String(stats.hasFractalsCount))}`,
    '', `  Is Calm:              ${chalk.rgb(200, 200, 200)(String(stats.isCalmCount))}`,
    `  Has Flow State:       ${chalk.rgb(200, 200, 200)(String(stats.hasFlowStateCount))}`,
    `  Has Chaos:            ${chalk.rgb(200, 200, 200)(String(stats.hasChaosCount))}`,
    '', `  Most Beautiful:       ${chalk.rgb(46, 204, 113)(stats.mostBeautiful)}`,
    `  Most Symmetrical:     ${chalk.rgb(46, 204, 113)(stats.mostSymmetrical)}`,
    `  Most Harmonious:      ${chalk.rgb(46, 204, 113)(stats.mostHarmonious)}`,
    `  Most Complete:        ${chalk.rgb(46, 204, 113)(stats.mostComplete)}`,
    `  Most Calm:            ${chalk.rgb(46, 204, 113)(stats.mostCalm)}`,
    '',
  ].join('\n')
}

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - the mandala is divine')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

/**
 * Format complete report
 * @example
 * formatMandalaPatternReport(result) // formatted string
 */
export function formatMandalaPatternReport(result: MandalaPatternResult): string {
  return [formatMonastery(result.monastery), formatRingTable(result.rings), '', formatGardenTable(result.gardens), formatStats(result.stats), formatRecommendations(result.recommendations)].join('\n')
}

/**
 * Format result as JSON
 * @example
 * formatMandalaPatternJSON(result) // JSON string
 */
export function formatMandalaPatternJSON(result: MandalaPatternResult): string {
  return JSON.stringify(result, null, 2)
}
