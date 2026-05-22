import chalk from 'chalk'

import type { GranitePeakResult } from './granite-peak-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('matterhorn') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'matterhorn': return chalk.rgb(255, 215, 0).bold(condition)
    case 'half-dome': return chalk.rgb(46, 204, 113)(condition)
    case 'granite-tor': return chalk.rgb(52, 152, 219)(condition)
    case 'weathered-crag': return chalk.rgb(241, 196, 15)(condition)
    case 'gravel-pile': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-alpinist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-alpinist': return chalk.rgb(255, 215, 0).bold(grade)
    case 'mountaineer': return chalk.rgb(46, 204, 113)(grade)
    case 'climber': return chalk.rgb(155, 89, 182)(grade)
    case 'hiker': return chalk.rgb(52, 152, 219)(grade)
    case 'walker': return chalk.rgb(241, 196, 15)(grade)
    case 'armchair': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example hardnessGradeColor('diamond-class') returns colored string */
export function hardnessGradeColor(grade: string): string {
  switch (grade) {
    case 'diamond-class': return chalk.rgb(255, 215, 0).bold(grade)
    case 'granite-hard': return chalk.rgb(46, 204, 113)(grade)
    case 'basalt-firm': return chalk.rgb(155, 89, 182)(grade)
    case 'sandstone-soft': return chalk.rgb(52, 152, 219)(grade)
    case 'shale-weak': return chalk.rgb(241, 196, 15)(grade)
    case 'clay-crumble': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example crystalSystemColor('perfect-hexagonal') returns colored string */
export function crystalSystemColor(system: string): string {
  switch (system) {
    case 'perfect-hexagonal': return chalk.rgb(255, 215, 0).bold(system)
    case 'well-crystallized': return chalk.rgb(46, 204, 113)(system)
    case 'granular': return chalk.rgb(155, 89, 182)(system)
    case 'porphyritic': return chalk.rgb(52, 152, 219)(system)
    case 'massive': return chalk.rgb(241, 196, 15)(system)
    case 'amorphous': return chalk.rgb(231, 76, 60)(system)
    default: return system
  }
}

/** @example weatherGradeColor('weatherproof') returns colored string */
export function weatherGradeColor(grade: string): string {
  switch (grade) {
    case 'weatherproof': return chalk.rgb(255, 215, 0).bold(grade)
    case 'weather-resistant': return chalk.rgb(46, 204, 113)(grade)
    case 'moderate-weathering': return chalk.rgb(155, 89, 182)(grade)
    case 'susceptible': return chalk.rgb(52, 152, 219)(grade)
    case 'crumbling': return chalk.rgb(241, 196, 15)(grade)
    case 'dissolving': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example foundationTypeColor('bedrock') returns colored string */
export function foundationTypeColor(type: string): string {
  switch (type) {
    case 'bedrock': return chalk.rgb(255, 215, 0).bold(type)
    case 'deep-regolith': return chalk.rgb(46, 204, 113)(type)
    case 'stable-substrate': return chalk.rgb(155, 89, 182)(type)
    case 'shallow-soil': return chalk.rgb(52, 152, 219)(type)
    case 'loose-gravel': return chalk.rgb(241, 196, 15)(type)
    case 'quicksand': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example summitElevationColor('everest-class') returns colored string */
export function summitElevationColor(elevation: string): string {
  switch (elevation) {
    case 'everest-class': return chalk.rgb(255, 215, 0).bold(elevation)
    case 'high-summit': return chalk.rgb(46, 204, 113)(elevation)
    case 'alpine-peak': return chalk.rgb(155, 89, 182)(elevation)
    case 'foothill': return chalk.rgb(52, 152, 219)(elevation)
    case 'hummock': return chalk.rgb(241, 196, 15)(elevation)
    case 'depression': return chalk.rgb(231, 76, 60)(elevation)
    default: return elevation
  }
}

/** @example exposureQualityColor('master-climber') returns colored string */
export function exposureQualityColor(quality: string): string {
  switch (quality) {
    case 'master-climber': return chalk.rgb(255, 215, 0).bold(quality)
    case 'experienced': return chalk.rgb(46, 204, 113)(quality)
    case 'properly-equipped': return chalk.rgb(155, 89, 182)(quality)
    case 'underprepared': return chalk.rgb(52, 152, 219)(quality)
    case 'exposed': return chalk.rgb(241, 196, 15)(quality)
    case 'fatal-fall': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example rangeTypeColor('himalayan-range') returns colored string */
export function rangeTypeColor(type: string): string {
  switch (type) {
    case 'himalayan-range': return chalk.rgb(255, 215, 0).bold(type)
    case 'alpine-chain': return chalk.rgb(46, 204, 113)(type)
    case 'rocky-ridge': return chalk.rgb(155, 89, 182)(type)
    case 'hill-country': return chalk.rgb(52, 152, 219)(type)
    case 'moraine': return chalk.rgb(241, 196, 15)(type)
    case 'flatland': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example rangeConditionColor('majestic-range') returns colored string */
export function rangeConditionColor(condition: string): string {
  switch (condition) {
    case 'majestic-range': return chalk.rgb(255, 215, 0).bold(condition)
    case 'solid-mountains': return chalk.rgb(46, 204, 113)(condition)
    case 'rolling-hills': return chalk.rgb(155, 89, 182)(condition)
    case 'eroding-peaks': return chalk.rgb(52, 152, 219)(condition)
    case 'rubble': return chalk.rgb(241, 196, 15)(condition)
    case 'plains': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatGranitePeakJson(result) returns JSON string */
export function formatGranitePeakJson(result: GranitePeakResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatGranitePeakTable(result, verbose) returns formatted string */
export function formatGranitePeakTable(result: GranitePeakResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(169, 169, 169).bold('  Granite Peak Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Mountain Overview:'))
  lines.push(`    Overall Solidity:  ${scoreColor(result.mountain.overallSolidity)}`)
  lines.push(`    Avg Hardness:      ${scoreColor(result.mountain.avgHardness)}`)
  lines.push(`    Avg Crystal:       ${scoreColor(result.mountain.avgCrystal)}`)
  lines.push(`    Avg Summit:        ${scoreColor(result.mountain.avgSummit)}`)
  lines.push(`    Is Solid:          ${result.mountain.isSolid ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Ranges:         ${result.stats.totalRanges}`)
  lines.push(`    Avg Rock Hardness:    ${scoreColor(result.stats.avgRockHardness)}`)
  lines.push(`    Avg Crystal:          ${scoreColor(result.stats.avgCrystallineStructure)}`)
  lines.push(`    Avg Weather:          ${scoreColor(result.stats.avgWeatherResistance)}`)
  lines.push(`    Avg Foundation:       ${scoreColor(result.stats.avgFoundationDepth)}`)
  lines.push(`    Avg Summit:           ${scoreColor(result.stats.avgSummitQuality)}`)
  lines.push(`    Avg Exposure:         ${scoreColor(result.stats.avgExposureHandling)}`)
  lines.push(`    Climber Grade:        ${gradeColor(result.stats.climberGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Matterhorn:      ${result.stats.matterhornCount}`)
  lines.push(`    Half Dome:       ${result.stats.halfDomeCount}`)
  lines.push(`    Granite Tor:     ${result.stats.graniteTorCount}`)
  lines.push(`    Weathered Crag:  ${result.stats.weatheredCragCount}`)
  lines.push(`    Gravel Pile:     ${result.stats.gravelPileCount}`)
  lines.push(`    Dust:            ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestFormation) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Formation:      ${result.stats.bestFormation}`)
    lines.push(`    Hardest:             ${result.stats.hardest}`)
    lines.push(`    Best Structured:     ${result.stats.bestStructured}`)
    lines.push(`    Most Resilient:      ${result.stats.mostResilient}`)
    lines.push(`    Deepest Foundation:  ${result.stats.deepestFoundation}`)
    lines.push(`    Highest Quality:     ${result.stats.highestQuality}`)
    lines.push('')
  }

  if (verbose && result.formations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const f of result.formations) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Hard: ${hardnessGradeColor(f.hardness.grade)}(${f.rockHardness})  Crystal: ${crystalSystemColor(f.crystal.system)}(${f.crystallineStructure})  Weather: ${weatherGradeColor(f.weather.grade)}(${f.weatherResistance})`)
      lines.push(`      Found: ${foundationTypeColor(f.foundation.type)}(${f.foundationDepth})  Summit: ${summitElevationColor(f.summit.elevation)}(${f.summitQuality})  Exp: ${exposureQualityColor(f.exposure.quality)}(${f.exposureHandling})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(169, 169, 169)('\u{26F0}\u{FE0F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
