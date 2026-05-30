import chalk from 'chalk'
import type {
  SandGrain,
  HourglassSet,
  Clockshop,
  HourglassFlowStats,
  HourglassFlowResult,
  GrainCondition,
  SetType,
  SetCondition,
  HorologistGrade,
  } from './hourglass-flow-helpers.js'

// ─── Condition Colors ────────────────────────────────────

const grainConditionColor: Record<GrainCondition, (t: string) => string> = {
  'precision-timer': (t: string) => chalk.rgb(46, 204, 113)(t),
  'well-calibrated': (t: string) => chalk.rgb(52, 152, 219)(t),
  'standard-hourglass': (t: string) => chalk.rgb(241, 196, 15)(t),
  'leaky': (t: string) => chalk.rgb(230, 126, 34)(t),
  'clogged': (t: string) => chalk.rgb(231, 76, 60)(t),
  'broken-glass': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const setTypeColor: Record<SetType, (t: string) => string> = {
  'laboratory-set': (t: string) => chalk.rgb(46, 204, 113)(t),
  'desk-set': (t: string) => chalk.rgb(52, 152, 219)(t),
  'kitchen-timer': (t: string) => chalk.rgb(241, 196, 15)(t),
  'egg-timer': (t: string) => chalk.rgb(230, 126, 34)(t),
  'toy': (t: string) => chalk.rgb(231, 76, 60)(t),
  'broken': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const setConditionColor: Record<SetCondition, (t: string) => string> = {
  'chronometer': (t: string) => chalk.rgb(46, 204, 113)(t),
  'timepiece': (t: string) => chalk.rgb(52, 152, 219)(t),
  'timer': (t: string) => chalk.rgb(241, 196, 15)(t),
  'hourglass': (t: string) => chalk.rgb(230, 126, 34)(t),
  'novelty': (t: string) => chalk.rgb(231, 76, 60)(t),
  'wreckage': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const horologistGradeColor: Record<HorologistGrade, (t: string) => string> = {
  'master-horologist': (t: string) => chalk.rgb(46, 204, 113)(t),
  'horologist': (t: string) => chalk.rgb(52, 152, 219)(t),
  'clockmaker': (t: string) => chalk.rgb(241, 196, 15)(t),
  'watchmaker': (t: string) => chalk.rgb(230, 126, 34)(t),
  'novice': (t: string) => chalk.rgb(231, 76, 60)(t),
  'time-blind': (t: string) => chalk.rgb(142, 68, 173)(t),
}

// ─── Score Bar ───────────────────────────────────────────

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('█'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('░'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

// ─── Sand Grain Table ────────────────────────────────────

/**
 * Format sand grains as a table
 * @example
 * formatGrainTable(grains) // formatted string
 */
export function formatGrainTable(grains: SandGrain[]): string {
  if (grains.length === 0) return chalk.rgb(150, 150, 150)('  No sand grains to display')

  const rows = grains.map(g => {
    const cond = grainConditionColor[g.condition](g.condition.padEnd(20))
    return [
      chalk.rgb(200, 200, 200)(g.file.padEnd(30)),
      scoreBar(g.flowRate, 10),
      scoreBar(g.neckWidth, 10),
      scoreBar(g.qualityScore, 10),
      cond,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('File'.padEnd(30)),
    chalk.rgb(100, 200, 255)('Flow'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Neck'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Quality'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Hourglass Set Table ─────────────────────────────────

/**
 * Format hourglass sets as a table
 * @example
 * formatSetTable(sets) // formatted string
 */
export function formatSetTable(sets: HourglassSet[]): string {
  if (sets.length === 0) return chalk.rgb(150, 150, 150)('  No hourglass sets to display')

  const rows = sets.map(s => {
    const st = setTypeColor[s.setType](s.setType.padEnd(16))
    const sc = setConditionColor[s.condition](s.condition.padEnd(14))
    return [
      chalk.rgb(200, 200, 200)(s.directory.padEnd(20)),
      chalk.rgb(200, 200, 200)(String(s.grains.length).padEnd(6)),
      scoreBar(s.avgFlowRate, 10),
      scoreBar(s.avgSandQuality, 10),
      st,
      sc,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('Directory'.padEnd(20)),
    chalk.rgb(100, 200, 255)('Files'.padEnd(6)),
    chalk.rgb(100, 200, 255)('Avg Flow'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Avg Sand'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Type'.padEnd(16)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Clockshop Summary ───────────────────────────────────

/**
 * Format clockshop summary
 * @example
 * formatClockshop(clockshop) // formatted string
 */
export function formatClockshop(clockshop: Clockshop): string {
  const flowIcon = clockshop.isFlowingSmoothly ? chalk.rgb(46, 204, 113)('✔') : chalk.rgb(231, 76, 60)('✗')
  return [
    chalk.rgb(100, 200, 255)('═'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Clockshop Summary'),
    chalk.rgb(100, 200, 255)('═'.repeat(50)),
    `  Overall Flow:    ${scoreBar(clockshop.overallFlow)}`,
    `  Avg Flow Rate:   ${scoreBar(clockshop.avgFlowRate)}`,
    `  Avg Neck Width:  ${scoreBar(clockshop.avgNeckWidth)}`,
    `  Avg Sand Quality:${scoreBar(clockshop.avgSandQuality)}`,
    `  Avg Glass Clarity:${scoreBar(clockshop.avgGlassClarity)}`,
    `  Smooth Flow:     ${flowIcon}`,
    chalk.rgb(100, 200, 255)('═'.repeat(50)),
  ].join('\n')
}

// ─── Statistics ──────────────────────────────────────────

/**
 * Format flow statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: HourglassFlowStats): string {
  const grade = horologistGradeColor[stats.horologistGrade](stats.horologistGrade)
  return [
    '',
    chalk.rgb(100, 200, 255)('  Flow Statistics'),
    chalk.rgb(100, 200, 255)('  ─'.repeat(20)),
    `  Total Files:         ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Sets:          ${chalk.rgb(200, 200, 200)(String(stats.totalSets))}`,
    `  Horologist Grade:    ${grade}`,
    '',
    `  Avg Flow Rate:       ${scoreBar(stats.avgFlowRate)}`,
    `  Avg Neck Width:      ${scoreBar(stats.avgNeckWidth)}`,
    `  Avg Sand Quality:    ${scoreBar(stats.avgSandQuality)}`,
    `  Avg Grain Consistency:${scoreBar(stats.avgGrainConsistency)}`,
    `  Avg Glass Clarity:   ${scoreBar(stats.avgGlassClarity)}`,
    `  Avg Time Precision:  ${scoreBar(stats.avgTimeMeasurement)}`,
    '',
    `  Precision Timers:    ${chalk.rgb(46, 204, 113)(String(stats.precisionTimerCount))}`,
    `  Well-Calibrated:     ${chalk.rgb(52, 152, 219)(String(stats.wellCalibratedCount))}`,
    `  Standard Hourglass:  ${chalk.rgb(241, 196, 15)(String(stats.standardHourglassCount))}`,
    `  Leaky:               ${chalk.rgb(230, 126, 34)(String(stats.leakyCount))}`,
    `  Clogged:             ${chalk.rgb(231, 76, 60)(String(stats.cloggedCount))}`,
    `  Broken Glass:        ${chalk.rgb(142, 68, 173)(String(stats.brokenGlassCount))}`,
    '',
    `  Steady Flow:         ${chalk.rgb(200, 200, 200)(String(stats.steadyFlowCount))}`,
    `  Pulsing Flow:        ${chalk.rgb(200, 200, 200)(String(stats.pulsingFlowCount))}`,
    `  Clogged Flow:        ${chalk.rgb(200, 200, 200)(String(stats.cloggedFlowCount))}`,
    `  Has Filter:          ${chalk.rgb(200, 200, 200)(String(stats.hasFilterCount))}`,
    `  Transparent Glass:   ${chalk.rgb(200, 200, 200)(String(stats.isTransparentCount))}`,
    `  Has Spillage:        ${chalk.rgb(200, 200, 200)(String(stats.hasSpillageCount))}`,
    `  Uniform Sand:        ${chalk.rgb(200, 200, 200)(String(stats.isUniformCount))}`,
    `  Colored Grains:      ${chalk.rgb(200, 200, 200)(String(stats.hasColoredGrainsCount))}`,
    '',
    `  Smoothest Flow:      ${chalk.rgb(46, 204, 113)(stats.smoothestFlow)}`,
    `  Narrowest Neck:      ${chalk.rgb(230, 126, 34)(stats.narrowestNeck)}`,
    `  Finest Sand:         ${chalk.rgb(46, 204, 113)(stats.finestSand)}`,
    `  Clearest Glass:      ${chalk.rgb(46, 204, 113)(stats.clearestGlass)}`,
    `  Most Clogged:        ${chalk.rgb(231, 76, 60)(stats.mostClogged)}`,
    `  Most Efficient:      ${chalk.rgb(46, 204, 113)(stats.mostEfficient)}`,
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
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - flow is optimal')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('→')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  ─'.repeat(20)), ...items].join('\n')
}

// ─── Full Report ─────────────────────────────────────────

/**
 * Format the complete hourglass-flow report
 * @example
 * formatHourglassFlowReport(result) // formatted string
 */
export function formatHourglassFlowReport(result: HourglassFlowResult): string {
  const sections: string[] = [
    formatClockshop(result.clockshop),
    formatGrainTable(result.grains),
    '',
    formatSetTable(result.sets),
    formatStats(result.stats),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format result as JSON string
 * @example
 * formatHourglassFlowJSON(result) // JSON string
 */
export function formatHourglassFlowJSON(result: HourglassFlowResult): string {
  return JSON.stringify(result, null, 2)
}
