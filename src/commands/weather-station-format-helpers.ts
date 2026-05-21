import chalk from 'chalk'
import type { WeatherStationResult, WeatherReading, ClimateZone, WeatherStationStats } from './weather-station-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  if (c === 'perfect-day') return chalk.rgb(255, 215, 0)(c)
  if (c === 'fair-weather') return chalk.green(c)
  if (c === 'partly-cloudy') return chalk.blue(c)
  if (c === 'overcast') return chalk.dim(c)
  if (c === 'stormy') return chalk.yellow(c)
  return chalk.red(c)
}

function zoneTypeColor(z: string): string {
  if (z === 'tropical-paradise') return chalk.rgb(255, 215, 0)(z)
  if (z === 'mediterranean') return chalk.green(z)
  if (z === 'temperate') return chalk.blue(z)
  if (z === 'continental') return chalk.cyan(z)
  if (z === 'arctic') return chalk.dim(z)
  return chalk.red(z)
}

function gradeColor(g: string): string {
  if (g === 'chief-meteorologist') return chalk.rgb(255, 215, 0)(g)
  if (g === 'senior-forecaster') return chalk.green(g)
  if (g === 'meteorologist') return chalk.blue(g)
  if (g === 'weather-observer') return chalk.cyan(g)
  if (g === 'amateur') return chalk.yellow(g)
  return chalk.red(g)
}

// ─── Reading Formatting ────────────────────────────────────────────────────

function formatReading(r: WeatherReading): string {
  return `  ${chalk.bold(r.file)} ${conditionColor(r.condition)} climate:${scoreColor(r.qualityScore)} temp:${scoreColor(r.temperature)} pressure:${scoreColor(r.pressure)} vis:${scoreColor(r.visibility)}`
}

// ─── Zone Formatting ───────────────────────────────────────────────────────

function formatZone(z: ClimateZone): string {
  return `  ${chalk.bold(z.directory)} ${zoneTypeColor(z.zoneType)} temp:${scoreColor(z.avgTemperature)} pressure:${scoreColor(z.avgPressure)} vis:${scoreColor(z.avgVisibility)} perfect:${z.perfectDayCount} stormy:${z.stormyCount}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: WeatherStationStats): string {
  return [
    `  Grade: ${gradeColor(stats.meteorologistGrade)} | Climate: ${scoreColor(stats.overallClimate)} | Files: ${stats.totalFiles} | Zones: ${stats.totalZones}`,
    `  Temp: ${scoreColor(stats.avgTemperature)} | Pressure: ${scoreColor(stats.avgPressure)} | Humidity: ${scoreColor(stats.avgHumidity)} | Wind: ${scoreColor(stats.avgWindSpeed)} | Rain: ${scoreColor(stats.avgPrecipitation)} | Vis: ${scoreColor(stats.avgVisibility)}`,
    `  Conditions: Perfect:${stats.perfectDayCount} Fair:${stats.fairWeatherCount} Cloudy:${stats.partlyCloudyCount} Overcast:${stats.overcastCount} Stormy:${stats.stormyCount} Disaster:${stats.naturalDisasterCount}`,
    `  Best: ${chalk.green(stats.bestConditions)} | Clearest: ${chalk.cyan(stats.clearestSkies)} | Calmest: ${chalk.blue(stats.calmestWinds)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format weather station result as a table
 * @example
 * formatWeatherStationTable(result, false) // string
 */
export function formatWeatherStationTable(result: WeatherStationResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌤️ Weather Station - Code Climate Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📊 Readings'))
  if (result.readings.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.readings : result.readings.slice(0, 15)
    for (const r of display) {
      lines.push(formatReading(r))
    }
    if (!verbose && result.readings.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.readings.length - 15} more`))
    }
  }
  lines.push('')

  if (result.zones.length > 0) {
    lines.push(chalk.bold('🌍 Climate Zones'))
    for (const z of result.zones) {
      lines.push(formatZone(z))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📈 Summary'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Forecast'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format weather station result as JSON
 * @example
 * formatWeatherStationJson(result) // string
 */
export function formatWeatherStationJson(result: WeatherStationResult): string {
  return JSON.stringify(result, null, 2)
}
