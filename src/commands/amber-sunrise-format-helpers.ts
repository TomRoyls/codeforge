import chalk from 'chalk'

import type { AmberSunriseResult } from './amber-sunrise-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('golden-masterpiece') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'golden-masterpiece': return chalk.rgb(255, 215, 0).bold(condition)
    case 'sunlit-excellence': return chalk.rgb(46, 204, 113)(condition)
    case 'warm-professional': return chalk.rgb(52, 152, 219)(condition)
    case 'cloudy-adequate': return chalk.rgb(241, 196, 15)(condition)
    case 'dim-struggling': return chalk.rgb(230, 126, 34)(condition)
    case 'darkness': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example dawnColor('amber-gold') returns colored string */
export function dawnColor(color: string): string {
  switch (color) {
    case 'amber-gold': return chalk.rgb(255, 215, 0).bold(color)
    case 'warm-orange': return chalk.rgb(46, 204, 113)(color)
    case 'soft-peach': return chalk.rgb(155, 89, 182)(color)
    case 'pale-yellow': return chalk.rgb(52, 152, 219)(color)
    case 'cold-blue': return chalk.rgb(241, 196, 15)(color)
    case 'darkness': return chalk.rgb(231, 76, 60)(color)
    default: return color
  }
}

/** @example awakeningColor('graceful-awakening') returns colored string */
export function awakeningColor(state: string): string {
  switch (state) {
    case 'graceful-awakening': return chalk.rgb(255, 215, 0).bold(state)
    case 'smooth-startup': return chalk.rgb(46, 204, 113)(state)
    case 'gradual-warmup': return chalk.rgb(155, 89, 182)(state)
    case 'jarring-alarm': return chalk.rgb(52, 152, 219)(state)
    case 'rough-start': return chalk.rgb(241, 196, 15)(state)
    case 'failed-boot': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example growthColor('exponential') returns colored string */
export function growthColor(trajectory: string): string {
  switch (trajectory) {
    case 'exponential': return chalk.rgb(255, 215, 0).bold(trajectory)
    case 'strong-growth': return chalk.rgb(46, 204, 113)(trajectory)
    case 'steady-climb': return chalk.rgb(155, 89, 182)(trajectory)
    case 'linear': return chalk.rgb(52, 152, 219)(trajectory)
    case 'plateau': return chalk.rgb(241, 196, 15)(trajectory)
    case 'decline': return chalk.rgb(231, 76, 60)(trajectory)
    default: return trajectory
  }
}

/** @example radiantColor('blinding-brilliance') returns colored string */
export function radiantColor(quality: string): string {
  switch (quality) {
    case 'blinding-brilliance': return chalk.rgb(255, 215, 0).bold(quality)
    case 'clear-radiance': return chalk.rgb(46, 204, 113)(quality)
    case 'bright-light': return chalk.rgb(155, 89, 182)(quality)
    case 'dim-glow': return chalk.rgb(52, 152, 219)(quality)
    case 'shadow': return chalk.rgb(241, 196, 15)(quality)
    case 'darkness': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example transformColor('metamorphic') returns colored string */
export function transformColor(capability: string): string {
  switch (capability) {
    case 'metamorphic': return chalk.rgb(255, 215, 0).bold(capability)
    case 'highly-adaptive': return chalk.rgb(46, 204, 113)(capability)
    case 'flexible': return chalk.rgb(155, 89, 182)(capability)
    case 'moderate': return chalk.rgb(52, 152, 219)(capability)
    case 'rigid': return chalk.rgb(241, 196, 15)(capability)
    case 'petrified': return chalk.rgb(231, 76, 60)(capability)
    default: return capability
  }
}

/** @example goldenColor('golden-hour') returns colored string */
export function goldenColor(hour: string): string {
  switch (hour) {
    case 'golden-hour': return chalk.rgb(255, 215, 0).bold(hour)
    case 'warm-light': return chalk.rgb(46, 204, 113)(hour)
    case 'clear-day': return chalk.rgb(155, 89, 182)(hour)
    case 'overcast': return chalk.rgb(52, 152, 219)(hour)
    case 'gloomy': return chalk.rgb(241, 196, 15)(hour)
    case 'night': return chalk.rgb(231, 76, 60)(hour)
    default: return hour
  }
}

/** @example observerColor('dawn-watcher') returns colored string */
export function observerColor(grade: string): string {
  switch (grade) {
    case 'dawn-watcher': return chalk.rgb(255, 215, 0).bold(grade)
    case 'sunrise-photographer': return chalk.rgb(46, 204, 113)(grade)
    case 'light-seeker': return chalk.rgb(155, 89, 182)(grade)
    case 'observer': return chalk.rgb(52, 152, 219)(grade)
    case 'sleepyhead': return chalk.rgb(241, 196, 15)(grade)
    case 'vampire': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example horizonTypeColor('golden-horizon') returns colored string */
export function horizonTypeColor(type: string): string {
  switch (type) {
    case 'golden-horizon': return chalk.rgb(255, 215, 0).bold(type)
    case 'sunlit-landscape': return chalk.rgb(46, 204, 113)(type)
    case 'morning-meadow': return chalk.rgb(155, 89, 182)(type)
    case 'foggy-valley': return chalk.rgb(52, 152, 219)(type)
    case 'shadow-valley': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example horizonConditionColor('dawn-of-excellence') returns colored string */
export function horizonConditionColor(condition: string): string {
  switch (condition) {
    case 'dawn-of-excellence': return chalk.rgb(255, 215, 0).bold(condition)
    case 'bright-morning': return chalk.rgb(46, 204, 113)(condition)
    case 'warming-day': return chalk.rgb(155, 89, 182)(condition)
    case 'overcast': return chalk.rgb(52, 152, 219)(condition)
    case 'dusk': return chalk.rgb(241, 196, 15)(condition)
    case 'midnight': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAmberSunriseJson(result) returns JSON string */
export function formatAmberSunriseJson(result: AmberSunriseResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAmberSunriseTable(result, verbose) returns formatted string */
export function formatAmberSunriseTable(result: AmberSunriseResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 191, 0).bold('  Amber Sunrise Analysis'))
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Sky Overview:'))
  lines.push(`    Overall Radiance:       ${scoreColor(result.sky.overallRadiance)}`)
  lines.push(`    Avg Dawn Warmth:        ${scoreColor(result.sky.avgWarmth)}`)
  lines.push(`    Avg Growth Potential:   ${scoreColor(result.sky.avgGrowth)}`)
  lines.push(`    Avg Golden Quality:     ${scoreColor(result.sky.avgGolden)}`)
  lines.push(`    Is Golden:              ${result.sky.isGolden ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Statistics:'))
  lines.push(`    Total Files:                ${result.stats.totalFiles}`)
  lines.push(`    Total Horizons:             ${result.stats.totalHorizons}`)
  lines.push(`    Avg Dawn Warmth:            ${scoreColor(result.stats.avgDawnWarmth)}`)
  lines.push(`    Avg Awakening Quality:      ${scoreColor(result.stats.avgAwakeningQuality)}`)
  lines.push(`    Avg Growth Potential:       ${scoreColor(result.stats.avgGrowthPotential)}`)
  lines.push(`    Avg Radiance:               ${scoreColor(result.stats.avgRadiance)}`)
  lines.push(`    Avg Transformation Power:   ${scoreColor(result.stats.avgTransformationPower)}`)
  lines.push(`    Avg Golden Hour Quality:    ${scoreColor(result.stats.avgGoldenHourQuality)}`)
  lines.push(`    Observer Grade:             ${observerColor(result.stats.observerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(255, 191, 0)('  Condition Counts:'))
  lines.push(`    Golden Masterpiece:  ${result.stats.goldenMasterpieceCount}`)
  lines.push(`    Sunlit Excellence:   ${result.stats.sunlitExcellenceCount}`)
  lines.push(`    Warm Professional:  ${result.stats.warmProfessionalCount}`)
  lines.push(`    Cloudy Adequate:     ${result.stats.cloudyAdequateCount}`)
  lines.push(`    Dim Struggling:      ${result.stats.dimStrugglingCount}`)
  lines.push(`    Darkness:            ${result.stats.darknessCount}`)
  lines.push('')

  if (result.stats.bestBeam) {
    lines.push(chalk.rgb(255, 191, 0)('  Highlights:'))
    lines.push(`    Best Beam:        ${result.stats.bestBeam}`)
    lines.push(`    Warmest:          ${result.stats.warmest}`)
    lines.push(`    Best Startup:     ${result.stats.bestStartup}`)
    lines.push(`    Most Extensible:  ${result.stats.mostExtensible}`)
    lines.push(`    Clearest:         ${result.stats.clearest}`)
    lines.push(`    Most Adaptive:    ${result.stats.mostAdaptive}`)
    lines.push('')
  }

  if (verbose && result.beams.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Per-File Details:'))
    for (const b of result.beams) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(b.file)}`)
      lines.push(`      Score: ${scoreColor(b.qualityScore)}  Condition: ${conditionColor(b.condition)}`)
      lines.push(`      Dawn: ${dawnColor(b.dawn.color)}(${b.dawnWarmth})  Awake: ${awakeningColor(b.awakening.state)}(${b.awakeningQuality})  Growth: ${growthColor(b.growth.trajectory)}(${b.growthPotential})`)
      lines.push(`      Radiant: ${radiantColor(b.radiant.quality)}(${b.radiance})  Transform: ${transformColor(b.transformation.capability)}(${b.transformationPower})  Golden: ${goldenColor(b.golden.hour)}(${b.goldenHourQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(255, 191, 0)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 191, 0)('\u{2600}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
