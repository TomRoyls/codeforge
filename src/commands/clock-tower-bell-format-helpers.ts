import chalk from 'chalk'

import type {
  BellReading,
  ClockDistrict,
  ClockTowerBellStats,
  ClockTowerBellResult,
} from './clock-tower-bell-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('big-ben') returns bold green string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'big-ben': return chalk.rgb(46, 204, 113).bold(condition)
    case 'precision-clock': return chalk.rgb(52, 152, 219)(condition)
    case 'village-clock': return chalk.rgb(155, 89, 182)(condition)
    case 'cuckoo-clock': return chalk.rgb(241, 196, 15)(condition)
    case 'broken-clock': return chalk.rgb(230, 126, 34)(condition)
    case 'ruin': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example mechanismColor('atomic') returns colored string */
export function mechanismColor(mechanism: string): string {
  switch (mechanism) {
    case 'atomic': return chalk.rgb(46, 204, 113)(mechanism)
    case 'quartz': return chalk.rgb(52, 152, 219)(mechanism)
    case 'mechanical': return chalk.rgb(155, 89, 182)(mechanism)
    case 'pendulum': return chalk.rgb(241, 196, 15)(mechanism)
    case 'water-clock': return chalk.rgb(230, 126, 34)(mechanism)
    case 'sundial': return chalk.rgb(149, 165, 166)(mechanism)
    default: return mechanism
  }
}

/** @example toneColor('deep-bass') returns colored string */
export function toneColor(tone: string): string {
  switch (tone) {
    case 'deep-bass': return chalk.rgb(46, 204, 113)(tone)
    case 'tenor': return chalk.rgb(52, 152, 219)(tone)
    case 'alto': return chalk.rgb(155, 89, 182)(tone)
    case 'soprano': return chalk.rgb(241, 196, 15)(tone)
    case 'tinny': return chalk.rgb(230, 126, 34)(tone)
    case 'silent': return chalk.rgb(231, 76, 60)(tone)
    default: return tone
  }
}

/** @example gearTypeColor('escapement') returns colored string */
export function gearTypeColor(type: string): string {
  switch (type) {
    case 'escapement': return chalk.rgb(46, 204, 113)(type)
    case 'crown': return chalk.rgb(52, 152, 219)(type)
    case 'spur': return chalk.rgb(155, 89, 182)(type)
    case 'worm': return chalk.rgb(241, 196, 15)(type)
    case 'planetary': return chalk.rgb(230, 126, 34)(type)
    case 'broken': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example melodyColor('westminster') returns colored string */
export function melodyColor(melody: string): string {
  switch (melody) {
    case 'westminster': return chalk.rgb(46, 204, 113)(melody)
    case 'whittington': return chalk.rgb(52, 152, 219)(melody)
    case 'st-michaels': return chalk.rgb(155, 89, 182)(melody)
    case 'custom': return chalk.rgb(241, 196, 15)(melody)
    case 'random': return chalk.rgb(230, 126, 34)(melody)
    case 'cacophony': return chalk.rgb(231, 76, 60)(melody)
    default: return melody
  }
}

/** @example windingMethodColor('automatic') returns colored string */
export function windingMethodColor(method: string): string {
  switch (method) {
    case 'automatic': return chalk.rgb(46, 204, 113)(method)
    case 'manual': return chalk.rgb(52, 152, 219)(method)
    case 'electric': return chalk.rgb(155, 89, 182)(method)
    case 'gravity': return chalk.rgb(241, 196, 15)(method)
    case 'spring': return chalk.rgb(230, 126, 34)(method)
    case 'unwound': return chalk.rgb(231, 76, 60)(method)
    default: return method
  }
}

/** @example constructionColor('stone') returns colored string */
export function constructionColor(construction: string): string {
  switch (construction) {
    case 'stone': return chalk.rgb(46, 204, 113)(construction)
    case 'brick': return chalk.rgb(52, 152, 219)(construction)
    case 'steel': return chalk.rgb(155, 89, 182)(construction)
    case 'concrete': return chalk.rgb(241, 196, 15)(construction)
    case 'wood': return chalk.rgb(230, 126, 34)(construction)
    case 'lean-to': return chalk.rgb(231, 76, 60)(construction)
    default: return construction
  }
}

/** @example horologistGradeColor('master-horologist') returns bold string */
export function horologistGradeColor(grade: string): string {
  switch (grade) {
    case 'master-horologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'clockmaker': return chalk.rgb(52, 152, 219)(grade)
    case 'watchmaker': return chalk.rgb(155, 89, 182)(grade)
    case 'repairman': return chalk.rgb(241, 196, 15)(grade)
    case 'novice': return chalk.rgb(230, 126, 34)(grade)
    case 'time-lost': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example districtCondColor('master-clockmaker') returns colored string */
export function districtCondColor(condition: string): string {
  switch (condition) {
    case 'master-clockmaker': return chalk.rgb(46, 204, 113)(condition)
    case 'clockmaker': return chalk.rgb(52, 152, 219)(condition)
    case 'watchmaker': return chalk.rgb(155, 89, 182)(condition)
    case 'repair-shop': return chalk.rgb(241, 196, 15)(condition)
    case 'junk-shop': return chalk.rgb(230, 126, 34)(condition)
    case 'ruins': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── Format Reading ────────────────────────────────────────────────────────

/** @example formatReading(reading, false) returns formatted string */
export function formatReading(reading: BellReading, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(reading.file)} ${conditionColor(reading.condition)} ${scoreColor(reading.qualityScore)}`)
  lines.push(`    Time: ${scoreColor(reading.timeAccuracy)} ${mechanismColor(reading.timekeeping.mechanism)} | Bell: ${scoreColor(reading.bellResonance)} ${toneColor(reading.bell.tone)}`)
  lines.push(`    Gear: ${scoreColor(reading.gearPrecision)} ${gearTypeColor(reading.gear.type)} | Chime: ${scoreColor(reading.chimePattern)} ${melodyColor(reading.chime.melody)}`)
  lines.push(`    Wind: ${scoreColor(reading.windingReliability)} ${windingMethodColor(reading.winding.method)} | Tower: ${scoreColor(reading.towerStability)} ${constructionColor(reading.tower.construction)}`)

  if (verbose) {
    if (reading.timekeeping.driftAmount > 50) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ High drift:')} ${reading.timekeeping.driftAmount}`)
    if (reading.bell.crackCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Bell cracks:')} ${reading.bell.crackCount}`)
    if (reading.gear.slippingCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Gear slipping:')} ${reading.gear.slippingCount}`)
    if (reading.tower.hasCracks) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Tower cracks detected')}`)
  }

  return lines.join('\n')
}

/** @example formatDistrict(district, false) returns formatted string */
export function formatDistrict(district: ClockDistrict, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(district.directory)} ${districtCondColor(district.condition)} (${district.districtType})`)
  lines.push(`  Avg Time: ${scoreColor(district.avgTimeAccuracy)} | Avg Bell: ${scoreColor(district.avgBellResonance)} | Avg Tower: ${scoreColor(district.avgTowerStability)}`)

  if (verbose) {
    lines.push(`  Big Ben: ${district.bigBenCount} | Ruin: ${district.ruinCount} | Precise: ${district.preciseCount} | Wound: ${district.woundCount}`)
    for (const reading of district.readings) {
      lines.push(formatReading(reading, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: ClockTowerBellStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Clock Tower Bell Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Districts: ${stats.totalDistricts}`)
  lines.push(`Avg Time: ${scoreColor(stats.avgTimeAccuracy)} | Avg Bell: ${scoreColor(stats.avgBellResonance)} | Avg Gear: ${scoreColor(stats.avgGearPrecision)}`)
  lines.push(`Avg Chime: ${scoreColor(stats.avgChimePattern)} | Avg Wind: ${scoreColor(stats.avgWindingReliability)} | Avg Tower: ${scoreColor(stats.avgTowerStability)}`)
  lines.push(`Overall Timing: ${scoreColor(stats.overallTiming)} | Horologist: ${horologistGradeColor(stats.horologistGrade)}`)
  lines.push(`Conditions: BigBen=${stats.bigBenCount} Precision=${stats.precisionClockCount} Village=${stats.villageClockCount} Cuckoo=${stats.cuckooClockCount} Broken=${stats.brokenClockCount} Ruin=${stats.ruinCount}`)
  lines.push(`Best: ${stats.bestReading} | Accurate: ${stats.mostAccurate} | Bell: ${stats.clearestBell}`)
  lines.push(`Gear: ${stats.mostPreciseGear} | Tower: ${stats.mostStableTower}`)
  return lines.join('\n')
}

// ─── Table Format ──────────────────────────────────────────────────────────

/** @example formatClockTowerBellTable(result, false) returns full table */
export function formatClockTowerBellTable(result: ClockTowerBellResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Clock Tower Bell Analysis ===\n'))

  if (result.readings.length > 0) {
    lines.push(chalk.bold('Bell Readings:'))
    for (const reading of result.readings) {
      lines.push(formatReading(reading, verbose))
    }
  }

  if (result.districts.length > 0) {
    lines.push(chalk.bold('\nDistricts:'))
    for (const district of result.districts) {
      lines.push(formatDistrict(district, verbose))
    }
  }

  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('\nRecommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────

/** @example formatClockTowerBellJson(result) returns JSON string */
export function formatClockTowerBellJson(result: ClockTowerBellResult): string {
  return JSON.stringify(result, null, 2)
}
