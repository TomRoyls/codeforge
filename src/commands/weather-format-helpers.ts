import chalk from 'chalk'

import type { RegionalForecast, WeatherAlert, WeatherCondition, WeatherResult, WeatherStats } from './weather-helpers.js'

// ─── Weather Icon ──────────────────────────────────────────────────────────────

/**
 * Get weather icon for condition.
 *
 * @example
 * weatherIcon('sunny') // '☀'
 */
export function weatherIcon(condition: string): string {
  switch (condition) {
    case 'sunny': return '☀'
    case 'partly-cloudy': return '⛅'
    case 'cloudy': return '☁'
    case 'rainy': return '🌧'
    case 'stormy': return '⛈'
    case 'foggy': return '🌫'
    case 'windy': return '💨'
    case 'calm': return '🌙'
    default: return '·'
  }
}

// ─── Weather Map ───────────────────────────────────────────────────────────────

/**
 * Format weather map (ASCII).
 *
 * @example
 * formatWeatherMap(conditions)
 */
export function formatWeatherMap(conditions: WeatherCondition[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Weather Map'))
  lines.push(chalk.gray('  ─'.repeat(40)))

  if (conditions.length === 0) {
    lines.push(chalk.gray('  No files to analyze'))
    return lines.join('\n')
  }

  const sorted = [...conditions].sort((a, b) => b.temperature - a.temperature)
  for (const c of sorted.slice(0, 20)) {
    const icon = weatherIcon(c.condition)
    const temp = String(Math.round(c.temperature)).padStart(3)
    const vis = String(Math.round(c.visibility)).padStart(3)
    const pres = String(Math.round(c.pressure)).padStart(3)
    const cond = c.condition.padEnd(14)
    const tempColor = c.temperature > 70 ? chalk.rgb(244, 67, 54) : c.temperature > 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(76, 175, 80)
    lines.push(`  ${icon} ${c.file.padEnd(28).slice(0, 28)} ${tempColor(temp)}°  vis:${vis}  pres:${pres}  ${chalk.gray(cond)}`)
  }

  if (conditions.length > 20) {
    lines.push(chalk.gray(`  ... and ${conditions.length - 20} more`))
  }

  return lines.join('\n')
}

// ─── Regional Forecasts ────────────────────────────────────────────────────────

/**
 * Format regional forecasts.
 *
 * @example
 * formatRegionalForecasts(forecasts)
 */
export function formatRegionalForecasts(forecasts: RegionalForecast[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Regional Forecasts'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (forecasts.length === 0) {
    lines.push(chalk.gray('  No regions'))
    return lines.join('\n')
  }

  for (const fc of forecasts) {
    const fileCount = fc.conditions.length
    lines.push(`  ${chalk.bold(fc.region.padEnd(20))} (${fileCount} files) — ${fc.overall}`)
    lines.push(`    temp:${fc.avgTemperature}°  vis:${fc.avgVisibility}  pres:${fc.avgPressure}`)
    if (fc.alert) {
      lines.push(chalk.rgb(255, 193, 7)(`    ⚠ ${fc.alert}`))
    }
  }

  return lines.join('\n')
}

// ─── Alert Banner ──────────────────────────────────────────────────────────────

/**
 * Format alert banner.
 *
 * @example
 * formatAlertBanner(alerts)
 */
export function formatAlertBanner(alerts: WeatherAlert[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(244, 67, 54)('\n  ⚠ Weather Alerts'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (alerts.length === 0) {
    lines.push(chalk.rgb(76, 175, 80)('  No active alerts'))
    return lines.join('\n')
  }

  for (const alert of alerts) {
    const sevColor = alert.severity === 'warning' ? chalk.rgb(244, 67, 54) : alert.severity === 'watch' ? chalk.rgb(255, 152, 0) : chalk.rgb(255, 193, 7)
    lines.push(`  ${sevColor(`[${alert.severity.toUpperCase()}]`)} ${alert.type} — ${alert.region}`)
    lines.push(`    ${alert.description}`)
    lines.push(chalk.gray(`    → ${alert.recommendation}`))
  }

  return lines.join('\n')
}

// ─── Temperature Map ───────────────────────────────────────────────────────────

/**
 * Format temperature map.
 *
 * @example
 * formatTemperatureMap(conditions)
 */
export function formatTemperatureMap(conditions: WeatherCondition[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Temperature Map'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (conditions.length === 0) return lines.join('\n')

  const sorted = [...conditions].sort((a, b) => b.temperature - a.temperature)
  for (const c of sorted.slice(0, 10)) {
    const barLen = Math.round(c.temperature / 5)
    const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen)
    const color = c.temperature > 70 ? chalk.rgb(244, 67, 54) : c.temperature > 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(76, 175, 80)
    lines.push(`  ${c.file.padEnd(28).slice(0, 28)} ${color(bar)} ${c.temperature}°`)
  }

  return lines.join('\n')
}

// ─── Visibility Chart ──────────────────────────────────────────────────────────

/**
 * Format visibility chart.
 *
 * @example
 * formatVisibilityChart(conditions)
 */
export function formatVisibilityChart(conditions: WeatherCondition[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Visibility'))
  lines.push(chalk.gray('  ─'.repeat(50)))

  if (conditions.length === 0) return lines.join('\n')

  const sorted = [...conditions].sort((a, b) => b.visibility - a.visibility)
  for (const c of sorted.slice(0, 10)) {
    const barLen = Math.round(c.visibility / 5)
    const bar = '█'.repeat(barLen) + '░'.repeat(20 - barLen)
    const color = c.visibility > 70 ? chalk.rgb(76, 175, 80) : c.visibility > 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
    lines.push(`  ${c.file.padEnd(28).slice(0, 28)} ${color(bar)} ${c.visibility}%`)
  }

  return lines.join('\n')
}

// ─── Climate Classification ────────────────────────────────────────────────────

/**
 * Format climate classification.
 *
 * @example
 * formatClimateClassification(stats)
 */
export function formatClimateClassification(stats: WeatherStats): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Climate Classification'))
  lines.push(chalk.gray('  ─'.repeat(30)))
  lines.push(`  Climate: ${chalk.bold(stats.overallClimate)}`)
  lines.push(`  Stability: ${formatMeter(stats.climateStability)}`)
  lines.push(`  Avg Temperature: ${stats.avgTemperature}°`)
  lines.push(`  Avg Visibility: ${stats.avgVisibility}%`)
  lines.push(`  Avg Pressure: ${stats.avgPressure}`)
  lines.push(`  Sunny: ${stats.sunnyCount}  Stormy: ${stats.stormyCount}  Foggy: ${stats.foggyCount}`)
  lines.push(`  Hottest: ${stats.hottestFile}`)
  lines.push(`  Coldest: ${stats.coldestFile}`)

  return lines.join('\n')
}

function formatMeter(value: number): string {
  const filled = Math.round(value / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  const color = value >= 70 ? chalk.rgb(76, 175, 80) : value >= 40 ? chalk.rgb(255, 193, 7) : chalk.rgb(244, 67, 54)
  return `${color(bar)} ${value}%`
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatWeatherRecommendations(['Refactor complex files'])
 */
export function formatWeatherRecommendations(recs: string[]): string {
  const lines: string[] = []
  lines.push(chalk.bold.rgb(0, 188, 212)('\n  Recommendations'))
  lines.push(chalk.gray('  ─'.repeat(50)))
  for (const rec of recs) {
    lines.push(`  → ${rec}`)
  }
  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────────

/**
 * Format weather result as JSON.
 *
 * @example
 * formatWeatherJson(result)
 */
export function formatWeatherJson(result: WeatherResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Format ──────────────────────────────────────────────────────────────

/**
 * Format weather result as table.
 *
 * @example
 * formatWeatherTable(result)
 */
export function formatWeatherTable(result: WeatherResult): string {
  const parts: string[] = []
  parts.push(formatWeatherMap(result.conditions))
  parts.push(formatRegionalForecasts(result.forecasts))
  parts.push(formatAlertBanner(result.alerts))
  parts.push(formatTemperatureMap(result.conditions))
  parts.push(formatVisibilityChart(result.conditions))
  parts.push(formatClimateClassification(result.stats))
  parts.push(formatWeatherRecommendations(result.recommendations))
  return parts.join('\n')
}
