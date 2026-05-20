import chalk from 'chalk'

import type {
  AtmosphericCondition,
  OverallWeather,
  StormTrackerResult,
  StormTrackerStats,
  WeatherForecast,
  WeatherSystem,
} from './storm-tracker-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const WEATHER_COLOR: Record<string, (s: string) => string> = {
  calm: chalk.rgb(72, 199, 142),
  unsettled: chalk.rgb(200, 200, 80),
  stormy: chalk.rgb(220, 150, 80),
  severe: chalk.rgb(220, 80, 80),
  catastrophic: chalk.rgb(180, 40, 40),
}

const CONDITION_COLOR: Record<string, (s: string) => string> = {
  sunny: chalk.rgb(255, 223, 100),
  'partly-cloudy': chalk.rgb(180, 200, 220),
  cloudy: chalk.rgb(150, 150, 170),
  rainy: chalk.rgb(100, 149, 237),
  stormy: chalk.rgb(220, 80, 80),
  foggy: chalk.rgb(180, 180, 200),
  hazy: chalk.rgb(200, 190, 170),
}

const SYSTEM_TYPE_COLOR: Record<string, (s: string) => string> = {
  cyclone: chalk.rgb(148, 103, 189),
  thunderstorm: chalk.rgb(255, 165, 0),
  tornado: chalk.rgb(220, 80, 80),
  hurricane: chalk.rgb(180, 40, 40),
  front: chalk.rgb(100, 149, 237),
  'high-pressure': chalk.rgb(255, 99, 71),
  'low-pressure': chalk.rgb(72, 199, 142),
  drought: chalk.rgb(210, 180, 100),
  fog: chalk.rgb(180, 180, 200),
  clear: chalk.rgb(72, 199, 142),
}

/**
 * Format overall weather label with color.
 *
 * @example
 * formatWeatherLabel('calm') // => colored string
 */
export function formatWeatherLabel(weather: OverallWeather): string {
  const color = WEATHER_COLOR[weather] ?? ((s: string) => s)
  return color(weather)
}

/**
 * Format file condition label with color.
 *
 * @example
 * formatConditionLabel('sunny') // => colored string
 */
export function formatConditionLabel(condition: string): string {
  const color = CONDITION_COLOR[condition] ?? ((s: string) => s)
  return color(condition)
}

/**
 * Format system type label with color.
 *
 * @example
 * formatSystemTypeLabel('cyclone') // => colored string
 */
export function formatSystemTypeLabel(type: string): string {
  const color = SYSTEM_TYPE_COLOR[type] ?? ((s: string) => s)
  return color(type)
}

// ─── Gauge ─────────────────────────────────────────────────────────────────────

/**
 * Format a value gauge bar.
 *
 * @example
 * formatGauge(75) // => '███████████████░░░░░ 75%'
 */
export function formatGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}`)
}

// ─── Systems ───────────────────────────────────────────────────────────────────

/**
 * Format weather systems list.
 *
 * @example
 * formatWeatherSystems(systems) // => systems list
 */
export function formatWeatherSystems(systems: WeatherSystem[]): string {
  const header = chalk.bold('Weather Systems')
  const separator = '\u2500'.repeat(70)

  if (systems.length === 0) {
    return `${header}\n${separator}\nNo weather systems detected. Clear skies!`
  }

  const lines = [header, separator]

  for (const s of systems) {
    const typeLabel = formatSystemTypeLabel(s.type)
    lines.push(`${typeLabel.padEnd(15)} ${s.name} [Cat ${s.category}] intensity:${s.intensity}`)
    lines.push(`  epicenter: ${chalk.gray(s.epicenter)}  movement: ${s.movement}`)
    if (s.affectedFiles.length > 0) {
      lines.push(`  affected: ${s.affectedFiles.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Conditions ────────────────────────────────────────────────────────────────

/**
 * Format atmospheric conditions.
 *
 * @example
 * formatConditions(conditions) // => conditions table
 */
export function formatConditions(conditions: AtmosphericCondition[]): string {
  const header = chalk.bold('Atmospheric Conditions')
  const separator = '\u2500'.repeat(80)

  if (conditions.length === 0) {
    return `${header}\n${separator}\nNo files analyzed.`
  }

  const lines = [header, separator]

  for (const c of conditions) {
    const condLabel = formatConditionLabel(c.condition)
    lines.push(`${chalk.cyan(c.file.padEnd(35))} ${condLabel.padEnd(15)} temp:${c.temperature} humidity:${c.humidity} pressure:${c.pressure} wind:${c.windSpeed} vis:${c.visibility}`)
  }

  return lines.join('\n')
}

// ─── Forecasts ─────────────────────────────────────────────────────────────────

/**
 * Format weather forecasts.
 *
 * @example
 * formatForecasts(forecasts) // => forecast list
 */
export function formatForecasts(forecasts: WeatherForecast[]): string {
  const header = chalk.bold('Forecasts')
  const separator = '\u2500'.repeat(60)

  if (forecasts.length === 0) {
    return `${header}\n${separator}\nNo forecasts generated.`
  }

  const lines = [header, separator]

  for (const f of forecasts) {
    lines.push(`${chalk.cyan(f.area)}  short:${f.shortTerm}  long:${f.longTerm}  risk:${f.riskLevel}  confidence:${f.confidence}%`)
    if (f.predictedIssues.length > 0) {
      lines.push(`  issues: ${f.predictedIssues.join(', ')}`)
    }
  }

  return lines.join('\n')
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Format storm tracker stats.
 *
 * @example
 * formatStormTrackerStats(stats) // => stats summary
 */
export function formatStormTrackerStats(stats: StormTrackerStats): string {
  const header = chalk.bold('Storm Tracker Summary')
  const separator = '\u2500'.repeat(50)

  const lines = [
    header,
    separator,
    `Systems:        ${stats.totalSystems} (cyclones:${stats.cyclones} thunder:${stats.thunderstorms} tornado:${stats.tornadoes} hurricane:${stats.hurricanes} drought:${stats.droughts})`,
    `Clear Areas:    ${stats.clearAreas}`,
    separator,
    `Avg Temp:       ${formatGauge(stats.avgTemperature, 15)}`,
    `Avg Humidity:   ${formatGauge(stats.avgHumidity, 15)}`,
    `Avg Pressure:   ${formatGauge(stats.avgPressure, 15)}`,
    `Avg Visibility: ${formatGauge(stats.avgVisibility, 15)}`,
    separator,
    `Hottest:        ${stats.hottestFile || 'N/A'}`,
    `Most Coupled:   ${stats.mostCoupledFile || 'N/A'}`,
    `High Pressure:  ${stats.highestPressureFile || 'N/A'}`,
    `Clearest:       ${stats.clearestFile || 'N/A'}`,
    separator,
    `Storm Index:    ${formatGauge(stats.stormIndex, 15)}`,
    `Stability:      ${formatGauge(stats.stabilityIndex, 15)}`,
    `Weather:        ${formatWeatherLabel(stats.overallWeather)}`,
    `Confidence:     ${stats.forecastConfidence}%`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => list string
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. Fair weather ahead!`
  }

  const lines = [header, separator]
  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full storm tracker table output.
 *
 * @example
 * formatStormTrackerTable(result) // => full table string
 */
export function formatStormTrackerTable(result: StormTrackerResult): string {
  return [
    formatStormTrackerStats(result.stats),
    '',
    formatWeatherSystems(result.systems),
    '',
    formatConditions(result.conditions),
    '',
    formatForecasts(result.forecasts),
    '',
    formatRecommendations(result.recommendations),
  ].join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format storm tracker result as JSON.
 *
 * @example
 * formatStormTrackerJson(result) // => JSON string
 */
export function formatStormTrackerJson(result: StormTrackerResult): string {
  return JSON.stringify(result, null, 2)
}
