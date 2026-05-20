import chalk from 'chalk'
import type { WeatherSystemResult, AtmosphericCondition, WeatherZone, WeatherSystemStats, GlobalForecast } from './weather-system-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function weatherColor(w: string): string {
  switch (w) {
    case 'clear': return chalk.rgb(135, 206, 235)(w)
    case 'partly-cloudy': return chalk.blue(w)
    case 'cloudy': return chalk.dim(w)
    case 'overcast': return chalk.gray(w)
    case 'foggy': return chalk.rgb(200, 200, 200)(w)
    case 'drizzle': return chalk.cyan(w)
    case 'rain': return chalk.blue(w)
    case 'thunderstorm': return chalk.rgb(255, 165, 0)(w)
    case 'hail': return chalk.rgb(200, 200, 255)(w)
    case 'tornado': return chalk.rgb(255, 69, 0)(w)
    case 'hurricane': return chalk.red(w)
    default: return chalk.dim(w)
  }
}

function stabilityColor(s: string): string {
  switch (s) {
    case 'very-stable': return chalk.green(s)
    case 'stable': return chalk.rgb(144, 238, 144)(s)
    case 'neutral': return chalk.yellow(s)
    case 'unstable': return chalk.rgb(255, 165, 0)(s)
    case 'very-unstable': return chalk.red(s)
    default: return chalk.dim(s)
  }
}

function airQualityColor(a: string): string {
  switch (a) {
    case 'excellent': return chalk.green(a)
    case 'good': return chalk.rgb(144, 238, 144)(a)
    case 'moderate': return chalk.yellow(a)
    case 'poor': return chalk.rgb(255, 165, 0)(a)
    case 'hazardous': return chalk.red(a)
    default: return chalk.dim(a)
  }
}

function zoneTypeColor(z: string): string {
  switch (z) {
    case 'tropical': return chalk.rgb(255, 215, 0)(z)
    case 'temperate': return chalk.green(z)
    case 'arctic': return chalk.cyan(z)
    case 'desert': return chalk.rgb(255, 165, 0)(z)
    case 'monsoon': return chalk.blue(z)
    case 'mediterranean': return chalk.rgb(144, 238, 144)(z)
    default: return chalk.dim(z)
  }
}

function trendColor(t: string): string {
  switch (t) {
    case 'clearing': return chalk.green(t)
    case 'improving': return chalk.green(t)
    case 'stable': return chalk.yellow(t)
    case 'deteriorating': return chalk.rgb(255, 165, 0)(t)
    case 'storm-approaching': return chalk.rgb(255, 69, 0)(t)
    case 'catastrophic': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'ideal': return chalk.rgb(255, 215, 0)(h)
    case 'pleasant': return chalk.green(h)
    case 'acceptable': return chalk.blue(h)
    case 'uncomfortable': return chalk.yellow(h)
    case 'harsh': return chalk.rgb(255, 165, 0)(h)
    case 'extreme': return chalk.red(h)
    default: return chalk.dim(h)
  }
}

function climateGradeColor(g: string): string {
  switch (g) {
    case 'tropical-paradise': return chalk.rgb(255, 215, 0)(g)
    case 'pleasant': return chalk.green(g)
    case 'temperate': return chalk.blue(g)
    case 'continental': return chalk.yellow(g)
    case 'arctic': return chalk.cyan(g)
    case 'hellish': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Condition Formatting ─────────────────────────────────────────────────────

function formatCondition(c: AtmosphericCondition, verbose: boolean): string {
  const alertMarker = c.alerts.length > 0 ? chalk.red('⚠') : ' '
  const line = ` ${alertMarker} ${chalk.bold(c.file)} P:${scoreColor(c.pressure)} T:${scoreColor(c.temperature)} H:${scoreColor(c.humidity)} V:${scoreColor(c.visibility)} ${weatherColor(c.weatherType)} ${stabilityColor(c.atmosphericStability)} ${airQualityColor(c.airQuality)} comfort:${scoreColor(c.comfort)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    wind:${c.windSpeed}@${c.windDirection} precip:${c.precipitation} cloud:${c.cloudCover} dew:${c.dewPoint} uv:${c.uvIndex} front:${c.frontType}`)
  details.push(`    forecast:${c.forecast.shortTerm} trend:${trendColor(c.forecast.trend)} conf:${c.forecast.confidence}%`)
  if (c.alerts.length > 0) {
    details.push(`    alerts:${c.alerts.length}`)
  }
  return details.join('\n')
}

// ─── Zone Formatting ──────────────────────────────────────────────────────────

function formatZone(z: WeatherZone, verbose: boolean): string {
  const eventMarker = z.hasWeatherEvents ? chalk.rgb(255, 215, 0)('⚡') : ' '
  const line = ` ${eventMarker} ${chalk.bold(z.directory)} ${zoneTypeColor(z.zoneType)} P:${scoreColor(z.avgPressure)} T:${scoreColor(z.avgTemperature)} H:${scoreColor(z.avgHumidity)} V:${scoreColor(z.avgVisibility)} ${healthColor(z.health)} stability:${scoreColor(z.climateStability)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    dominant:${weatherColor(z.dominantWeather)} comfort:${scoreColor(z.avgComfort)} alerts:${z.alertCount} extreme:${z.extremeConditions} events:${z.weatherEvents.join(',')}`)
  details.push(`    forecast:${z.forecast}`)
  return details.join('\n')
}

// ─── Global Forecast Formatting ───────────────────────────────────────────────

function formatGlobalForecast(gf: GlobalForecast): string {
  return [
    `  Weather: ${weatherColor(gf.overallWeather)} | Trend: ${trendColor(gf.trend)} | Storm Risk: ${scoreColor(gf.stormRisk)} | Comfort: ${scoreColor(gf.comfortIndex)}`,
    `  Pressure: ${scoreColor(gf.avgPressure)} | Temp: ${scoreColor(gf.avgTemperature)} | Visibility: ${scoreColor(gf.avgVisibility)} | Front: ${gf.dominantFront}`,
    `  Climate: ${climateGradeColor(gf.climateGrade)}`,
  ].join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

function formatStats(stats: WeatherSystemStats): string {
  return [
    `  Files: ${stats.totalFiles} | Zones: ${stats.totalZones} | Alerts: ${stats.totalAlerts}`,
    `  Avg Pressure: ${scoreColor(stats.avgPressure)} | Temp: ${scoreColor(stats.avgTemperature)} | Humidity: ${scoreColor(stats.avgHumidity)} | Visibility: ${scoreColor(stats.avgVisibility)} | Comfort: ${scoreColor(stats.avgComfort)}`,
    `  Clear: ${chalk.green(String(stats.clearFiles))} | Stormy: ${chalk.red(String(stats.stormyFiles))} | Foggy: ${chalk.gray(String(stats.foggyFiles))} | Extreme: ${chalk.red(String(stats.extremeFiles))}`,
    `  Tropical: ${chalk.rgb(255, 215, 0)(String(stats.tropicalZones))} | Arctic: ${chalk.cyan(String(stats.arcticZones))} | Desert: ${chalk.rgb(255, 165, 0)(String(stats.desertZones))} | Monsoon: ${chalk.blue(String(stats.monsoonZones))}`,
    `  Air Quality: ${scoreColor(stats.airQualityIndex)} | Storm Risk: ${scoreColor(stats.stormRisk)} | Climate: ${climateGradeColor(stats.climateGrade)}`,
    `  Best: ${chalk.green(stats.bestWeather)} | Worst: ${chalk.red(stats.worstWeather)} | Safest Zone: ${chalk.green(stats.safestZone)} | Riskiest: ${chalk.red(stats.riskiestZone)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format weather system result as a table
 * @example
 * formatWeatherSystemTable(result, false) // string
 */
export function formatWeatherSystemTable(result: WeatherSystemResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌤️ Weather System - Atmospheric Code Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🌡️ Atmospheric Conditions'))
  if (result.conditions.length === 0) {
    lines.push(chalk.dim('  No conditions detected.'))
  } else {
    const display = verbose ? result.conditions : result.conditions.slice(0, 15)
    for (const c of display) {
      lines.push(formatCondition(c, verbose))
    }
    if (!verbose && result.conditions.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.conditions.length - 15} more`))
    }
  }
  lines.push('')

  if (result.zones.length > 0) {
    lines.push(chalk.bold('🗺️ Weather Zones'))
    for (const z of result.zones) {
      lines.push(formatZone(z, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🌐 Global Forecast'))
  lines.push(formatGlobalForecast(result.globalForecast))

  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format weather system result as JSON
 * @example
 * formatWeatherSystemJson(result) // string
 */
export function formatWeatherSystemJson(result: WeatherSystemResult): string {
  return JSON.stringify(result, null, 2)
}
