import chalk from 'chalk'
import type { WindReading, WeatherStation, WeatherVaneResult } from './weather-vane-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'fair-weather': return chalk.rgb(255, 215, 0)(c)
    case 'clear': return chalk.green(c)
    case 'partly-cloudy': return chalk.blue(c)
    case 'cloudy': return chalk.yellow(c)
    case 'stormy': return chalk.rgb(255, 165, 0)(c)
    case 'hurricane': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function stationTypeColor(t: string): string {
  switch (t) {
    case 'observatory': return chalk.rgb(255, 215, 0)(t)
    case 'weather-station': return chalk.green(t)
    case 'anemometer': return chalk.blue(t)
    case 'barometer': return chalk.cyan(t)
    case 'weathered-post': return chalk.yellow(t)
    case 'broken-vane': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function stationConditionColor(c: string): string {
  switch (c) {
    case 'perfect-conditions': return chalk.rgb(255, 215, 0)(c)
    case 'good-weather': return chalk.green(c)
    case 'changing': return chalk.blue(c)
    case 'unsettled': return chalk.yellow(c)
    case 'stormy': return chalk.rgb(255, 165, 0)(c)
    case 'catastrophic': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'chief-meteorologist': return chalk.rgb(255, 215, 0)(g)
    case 'meteorologist': return chalk.green(g)
    case 'weatherman': return chalk.blue(g)
    case 'farmer': return chalk.cyan(g)
    case 'shepherd': return chalk.yellow(g)
    case 'groundhog': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function trendColor(t: string): string {
  switch (t) {
    case 'improving': return chalk.green(t)
    case 'deteriorating': return chalk.red(t)
    case 'stable': return chalk.blue(t)
    case 'volatile': return chalk.yellow(t)
    default: return chalk.dim(t)
  }
}

// ─── Reading Formatting ──────────────────────────────────────────────────────

function formatReading(r: WindReading, verbose: boolean): string {
  const line = ` ${conditionColor(r.condition)} ${chalk.bold(r.file)} wind:${scoreColor(r.windSpeed)} pressure:${scoreColor(r.pressure)} humidity:${scoreColor(r.humidity)} temp:${scoreColor(r.temperature)} quality:${scoreColor(r.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    wind: dir:${r.wind.direction}° ${r.cardinalDirection} speed:${scoreColor(r.wind.speed)} steady:${r.wind.isSteady ? chalk.green('Y') : chalk.red('N')} gusting:${r.wind.isGusting ? chalk.red('Y') : chalk.green('N')} calm:${r.wind.isCalm ? chalk.yellow('Y') : chalk.green('N')} variable:${r.wind.isVariable ? chalk.red('Y') : chalk.green('N')} gust:${scoreColor(r.wind.gustFactor)}`)
  details.push(`    atmosphere: pressure:${scoreColor(r.atmosphere.pressure)} high:${r.atmosphere.isHighPressure ? chalk.yellow('Y') : chalk.green('N')} low:${r.atmosphere.isLowPressure ? chalk.red('Y') : chalk.green('N')} rising:${r.atmosphere.isRising ? chalk.red('Y') : chalk.green('N')} falling:${r.atmosphere.isFalling ? chalk.green('Y') : chalk.red('N')} front:${r.atmosphere.frontType}`)
  details.push(`    moisture: humidity:${scoreColor(r.moisture.humidity)} dew:${scoreColor(r.moisture.dewPoint)} dry:${r.moisture.isDry ? chalk.yellow('Y') : chalk.green('N')} damp:${r.moisture.isDamp ? chalk.blue('Y') : chalk.green('N')} saturated:${r.moisture.isSaturated ? chalk.red('Y') : chalk.green('N')} precip:${r.moisture.precipitationType}`)
  details.push(`    temp: current:${scoreColor(r.temperatureObj.current)} trend:${trendColor(r.temperatureObj.trend)} hot:${r.temperatureObj.isHot ? chalk.red('Y') : chalk.green('N')} cold:${r.temperatureObj.isCold ? chalk.blue('Y') : chalk.green('N')} freezing:${r.temperatureObj.isFreezing ? chalk.red('Y') : chalk.green('N')}`)
  details.push(`    cloud: coverage:${scoreColor(r.cloud.coverage)} ceiling:${scoreColor(r.cloud.ceiling)} clear:${r.cloud.isClear ? chalk.green('Y') : chalk.red('N')} overcast:${r.cloud.isOvercast ? chalk.red('Y') : chalk.green('N')} type:${r.cloud.cloudType}`)
  details.push(`    forecast: ${r.forecast.shortRange} trend:${trendColor(r.forecast.trend)} confidence:${scoreColor(r.forecast.confidence)} storm:${r.forecast.hasStormWarning ? chalk.red('Y') : chalk.green('N')} clearing:${r.forecast.hasClearingSkies ? chalk.green('Y') : chalk.red('N')}`)
  return details.join('\n')
}

// ─── Station Formatting ──────────────────────────────────────────────────────

function formatStation(s: WeatherStation): string {
  return `  ${chalk.bold(s.directory)} ${stationTypeColor(s.stationType)} ${stationConditionColor(s.condition)} readings:${s.readings.length} wind:${scoreColor(s.avgWindSpeed)} pressure:${scoreColor(s.avgPressure)} temp:${scoreColor(s.avgTemperature)} humidity:${scoreColor(s.avgHumidity)} fair:${s.fairWeatherCount} stormy:${s.stormyCount} prevailing:${s.prevailingWind}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format weather vane result as a table
 * @example
 * formatWeatherVaneTable(result, false) // string
 */
export function formatWeatherVaneTable(result: WeatherVaneResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌬️  Weather Vane - Code Change Direction/Trend Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📡 Wind Readings'))
  if (result.readings.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.readings : result.readings.slice(0, 15)
    for (const r of display) {
      lines.push(formatReading(r, verbose))
    }
    if (!verbose && result.readings.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.readings.length - 15} more`))
    }
  }
  lines.push('')

  if (result.stations.length > 0) {
    lines.push(chalk.bold('🏗️ Weather Stations'))
    for (const s of result.stations) {
      lines.push(formatStation(s))
    }
    lines.push('')
  }

  const climate = result.climate
  lines.push(chalk.bold('🌍 Climate Overview'))
  lines.push(`  Wind:${scoreColor(climate.avgWindSpeed)} Pressure:${scoreColor(climate.avgPressure)} Temperature:${scoreColor(climate.avgTemperature)} Humidity:${scoreColor(climate.avgHumidity)} Prevailing:${climate.prevailingWind} Stable:${climate.isStable ? chalk.green('YES') : chalk.red('NO')} Conditions:${scoreColor(climate.overallConditions)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.meteorologistGrade)} | Conditions: ${scoreColor(s.overallConditions)} | Files: ${s.totalFiles} | Stations: ${s.totalStations}`)
  lines.push(`  Fair:${s.fairWeatherCount} Clear:${s.clearCount} PartlyCloudy:${s.partlyCloudyCount} Cloudy:${s.cloudyCount} Stormy:${s.stormyCount} Hurricane:${s.hurricaneCount}`)
  lines.push(`  Steady:${s.steadyWindCount} Gusting:${s.gustingWindCount} Calm:${s.calmWindCount} Variable:${s.variableWindCount} HighPressure:${s.highPressureCount} LowPressure:${s.lowPressureCount}`)
  lines.push(`  Hot:${s.hotCount} Cold:${s.coldCount} Freezing:${s.freezingCount} StormWarning:${s.stormWarningCount} Clearing:${s.clearingSkiesCount}`)
  lines.push(`  Improving:${s.improvingCount} Deteriorating:${s.deterioratingCount} Stable:${s.stableCount} CloudCoverage:${scoreColor(s.avgCloudCoverage)} ForecastConf:${scoreColor(s.avgForecastConfidence)}`)
  lines.push(`  Best:${chalk.green(s.bestConditions)} | Worst:${chalk.red(s.worstConditions)} | MostActive:${chalk.rgb(255, 69, 0)(s.mostActive)} | MostStable:${chalk.blue(s.mostStable)} | Stormiest:${chalk.red(s.stormiest)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format weather vane result as JSON
 * @example
 * formatWeatherVaneJson(result) // string
 */
export function formatWeatherVaneJson(result: WeatherVaneResult): string {
  return JSON.stringify(result, null, 2)
}
