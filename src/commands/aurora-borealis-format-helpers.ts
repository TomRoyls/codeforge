import chalk from 'chalk'

import type {
  AuroraReading,
  AuroraZone,
  AuroraStats,
  AuroraBorealisResult,
} from './aurora-borealis-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('spectacular-display') returns bold green string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'spectacular-display': return chalk.rgb(46, 204, 113).bold(condition)
    case 'vivid-aurora': return chalk.rgb(52, 152, 219)(condition)
    case 'visible-lights': return chalk.rgb(155, 89, 182)(condition)
    case 'faint-glow': return chalk.rgb(241, 196, 15)(condition)
    case 'subvisual': return chalk.rgb(230, 126, 34)(condition)
    case 'dark-sky': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example brightnessColor('dazzling') returns colored string */
export function brightnessColor(brightness: string): string {
  switch (brightness) {
    case 'dazzling': return chalk.rgb(46, 204, 113).bold(brightness)
    case 'bright': return chalk.rgb(52, 152, 219)(brightness)
    case 'moderate': return chalk.rgb(155, 89, 182)(brightness)
    case 'faint': return chalk.rgb(241, 196, 15)(brightness)
    case 'dim': return chalk.rgb(230, 126, 34)(brightness)
    case 'dark': return chalk.rgb(231, 76, 60)(brightness)
    default: return brightness
  }
}

/** @example dominantColor('green') returns colored string */
export function dominantColor(color: string): string {
  switch (color) {
    case 'green': return chalk.rgb(46, 204, 113)(color)
    case 'purple': return chalk.rgb(155, 89, 182)(color)
    case 'red': return chalk.rgb(231, 76, 60)(color)
    case 'blue': return chalk.rgb(52, 152, 219)(color)
    case 'yellow': return chalk.rgb(241, 196, 15)(color)
    case 'white': return chalk.rgb(236, 240, 241)(color)
    default: return color
  }
}

/** @example astronomerGradeColor('chief-astronomer') returns bold string */
export function astronomerGradeColor(grade: string): string {
  switch (grade) {
    case 'chief-astronomer': return chalk.rgb(46, 204, 113).bold(grade)
    case 'aurora-hunter': return chalk.rgb(52, 152, 219)(grade)
    case 'astrophysicist': return chalk.rgb(155, 89, 182)(grade)
    case 'stargazer': return chalk.rgb(241, 196, 15)(grade)
    case 'amateur': return chalk.rgb(230, 126, 34)(grade)
    case 'blind-spotter': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example zoneCondColor('northern-lights-festival') returns colored string */
export function zoneCondColor(condition: string): string {
  switch (condition) {
    case 'northern-lights-festival': return chalk.rgb(46, 204, 113)(condition)
    case 'aurora-season': return chalk.rgb(52, 152, 219)(condition)
    case 'occasional-sightings': return chalk.rgb(155, 89, 182)(condition)
    case 'rare-display': return chalk.rgb(241, 196, 15)(condition)
    case 'never-seen': return chalk.rgb(230, 126, 34)(condition)
    case 'light-polluted': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── Format Reading ────────────────────────────────────────────────────────

/** @example formatReading(reading, false) returns formatted string */
export function formatReading(reading: AuroraReading, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(reading.file)} ${conditionColor(reading.condition)} ${scoreColor(reading.qualityScore)}`)
  lines.push(`    Light: ${scoreColor(reading.lightIntensity)} ${brightnessColor(reading.light.brightness)} | Color: ${scoreColor(reading.colorSpectrum)} ${dominantColor(reading.color.dominant)}`)
  lines.push(`    Magnetic: ${scoreColor(reading.magneticAlignment)} | Solar: ${scoreColor(reading.solarActivity)} | Atmos: ${scoreColor(reading.atmosphericClarity)}`)
  lines.push(`    Display: ${scoreColor(reading.displayQuality)}`)

  if (verbose) {
    if (reading.atmosphere.hasAbsorption) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Atmospheric absorption detected')}`)
    if (reading.magnetic.hasDisturbance) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Magnetic disturbances:')} ${reading.magnetic.disturbanceCount}`)
    if (reading.light.hasNoLight) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ No light emission')}`)
    if (reading.color.hasMonochrome) lines.push(`    ${chalk.rgb(241, 196, 15)('◐ Monochrome spectrum')}`)
  }

  return lines.join('\n')
}

/** @example formatZone(zone, false) returns formatted string */
export function formatZone(zone: AuroraZone, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(zone.directory)} ${zoneCondColor(zone.condition)} (${zone.zoneType})`)
  lines.push(`  Avg Light: ${scoreColor(zone.avgLightIntensity)} | Avg Color: ${scoreColor(zone.avgColorSpectrum)} | Avg Display: ${scoreColor(zone.avgDisplayQuality)}`)

  if (verbose) {
    lines.push(`  Spectacular: ${zone.spectacularCount} | DarkSky: ${zone.darkSkyCount} | Brilliant: ${zone.brilliantCount} | Clear: ${zone.clearAtmosphereCount}`)
    for (const reading of zone.readings) {
      lines.push(formatReading(reading, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: AuroraStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Aurora Borealis Observatory ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Zones: ${stats.totalZones}`)
  lines.push(`Avg Light: ${scoreColor(stats.avgLightIntensity)} | Avg Color: ${scoreColor(stats.avgColorSpectrum)} | Avg Magnetic: ${scoreColor(stats.avgMagneticAlignment)}`)
  lines.push(`Avg Solar: ${scoreColor(stats.avgSolarActivity)} | Avg Atmos: ${scoreColor(stats.avgAtmosphericClarity)} | Avg Display: ${scoreColor(stats.avgDisplayQuality)}`)
  lines.push(`Luminosity: ${scoreColor(stats.overallLuminosity)} | Grade: ${astronomerGradeColor(stats.astronomerGrade)}`)
  lines.push(`Conditions: Spectacular=${stats.spectacularDisplayCount} Vivid=${stats.vividAuroraCount} Visible=${stats.visibleLightsCount} Faint=${stats.faintGlowCount} Sub=${stats.subvisualCount} Dark=${stats.darkSkyCount}`)
  lines.push(`Best: ${stats.bestReading} | Brightest: ${stats.brightestLight} | Color: ${stats.richestColor}`)
  lines.push(`Aligned: ${stats.bestAligned} | Active: ${stats.mostActive}`)
  return lines.join('\n')
}

// ─── Table Format ──────────────────────────────────────────────────────────

/** @example formatAuroraBorealisTable(result, false) returns full table */
export function formatAuroraBorealisTable(result: AuroraBorealisResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Aurora Borealis Analysis ===\n'))

  if (result.readings.length > 0) {
    lines.push(chalk.bold('Aurora Readings:'))
    for (const reading of result.readings) {
      lines.push(formatReading(reading, verbose))
    }
  }

  if (result.zones.length > 0) {
    lines.push(chalk.bold('\nAurora Zones:'))
    for (const zone of result.zones) {
      lines.push(formatZone(zone, verbose))
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

/** @example formatAuroraBorealisJson(result) returns JSON string */
export function formatAuroraBorealisJson(result: AuroraBorealisResult): string {
  return JSON.stringify(result, null, 2)
}
