import chalk from 'chalk'

import type {
  CartographyResult,
  CartographyStats,
  ChartQuality,
  ChartedRegion,
  Hazard,
  Landmark,
  PortOfEntry,
  TradeRoute,
} from './cartography-helpers.js'

// ─── Color Maps ────────────────────────────────────────────────────────────────

const CHART_COLOR: Record<string, (s: string) => string> = {
  'well-charted': chalk.rgb(72, 199, 142),
  'partially-charted': chalk.rgb(130, 200, 130),
  'uncharted': chalk.rgb(220, 150, 80),
  misleading: chalk.rgb(220, 80, 80),
}

const QUALITY_COLOR: Record<string, (s: string) => string> = {
  masterwork: chalk.rgb(72, 199, 142),
  detailed: chalk.rgb(130, 200, 130),
  rough: chalk.rgb(200, 180, 80),
  sketchy: chalk.rgb(220, 150, 80),
  blank: chalk.rgb(220, 80, 80),
}

const SEVERITY_COLOR: Record<string, (s: string) => string> = {
  low: chalk.rgb(130, 200, 130),
  medium: chalk.rgb(200, 180, 80),
  high: chalk.rgb(220, 150, 80),
  critical: chalk.rgb(220, 80, 80),
}

const HAZARD_SYMBOL: Record<string, string> = {
  'phantom-island': '\u{1F3DD}',
  'misleading-label': '\u{1F6A7}',
  'treacherous-path': '\u{26A0}',
  'dead-end': '\u{1F6AB}',
  whirlpool: '\u{1F300}',
  siren: '\u{1F3B5}',
}

/**
 * Format chart level with color.
 *
 * @example
 * formatChartLevel('well-charted') // => colored string
 */
export function formatChartLevel(level: string): string {
  const color = CHART_COLOR[level] ?? ((s: string) => s)
  return color(level)
}

/**
 * Format chart quality with color.
 *
 * @example
 * formatChartQuality('masterwork') // => colored string
 */
export function formatChartQuality(quality: ChartQuality): string {
  const color = QUALITY_COLOR[quality] ?? ((s: string) => s)
  return color(quality)
}

/**
 * Format hazard severity with color.
 *
 * @example
 * formatSeverity('critical') // => colored string
 */
export function formatSeverity(severity: string): string {
  const color = SEVERITY_COLOR[severity] ?? ((s: string) => s)
  return color(severity)
}

/**
 * Format hazard type badge.
 *
 * @example
 * formatHazardBadge('whirlpool') // => '🌀 whirlpool'
 */
export function formatHazardBadge(type: string): string {
  return `${HAZARD_SYMBOL[type] ?? '\u{1F4CD}'} ${type}`
}

/**
 * Format completeness gauge bar.
 *
 * @example
 * formatCompletenessGauge(75) // => '████████████████░░░░░ 75%'
 */
export function formatCompletenessGauge(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty)
  const color = value >= 70 ? chalk.rgb(72, 199, 142) : value >= 40 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}%`)
}

// ─── Region Survey Table ───────────────────────────────────────────────────────

/**
 * Format region survey table.
 *
 * @example
 * formatRegionSurvey(regions) // => table string
 */
export function formatRegionSurvey(regions: ChartedRegion[]): string {
  const header = chalk.bold('Region Survey')
  const separator = '\u2500'.repeat(70)

  if (regions.length === 0) {
    return `${header}\n${separator}\nNo regions surveyed.`
  }

  const lines = [header, separator]

  for (const region of regions) {
    const level = formatChartLevel(region.type)
    const gauge = formatCompletenessGauge(region.completeness, 15)
    lines.push(`${chalk.cyan(region.path.padEnd(25))} ${level.padEnd(20)} ${gauge}`)
    lines.push(`  Docs: ${region.documentation}%  Naming: ${region.naming}%  Org: ${region.organization}%  Landmarks: ${region.landmarks.length}  Hazards: ${region.hazards.length}`)
  }

  return lines.join('\n')
}

// ─── Landmark Inventory ────────────────────────────────────────────────────────

/**
 * Format landmark inventory.
 *
 * @example
 * formatLandmarkInventory(landmarks) // => table string
 */
export function formatLandmarkInventory(landmarks: Landmark[]): string {
  const header = chalk.bold('Landmark Inventory')
  const separator = '\u2500'.repeat(60)

  if (landmarks.length === 0) {
    return `${header}\n${separator}\nNo landmarks found.`
  }

  const lines = [header, separator]

  for (const lm of landmarks) {
    const docBadge = lm.documented ? chalk.rgb(72, 199, 142)('\u2713 doc') : chalk.rgb(220, 80, 80)('\u2717 no doc')
    const entryBadge = lm.isEntryPoint ? chalk.rgb(255, 215, 0)(' \u2B50 entry') : ''
    lines.push(`${lm.type.padEnd(12)} ${chalk.cyan(lm.name.padEnd(25))} ${lm.visibility.padEnd(10)} clarity:${lm.clarity} ${docBadge}${entryBadge}`)
  }

  return lines.join('\n')
}

// ─── Hazard Warnings ───────────────────────────────────────────────────────────

/**
 * Format hazard warnings.
 *
 * @example
 * formatHazardWarnings(hazards) // => warning list
 */
export function formatHazardWarnings(hazards: Hazard[]): string {
  const header = chalk.bold('Hazard Warnings')
  const separator = '\u2500'.repeat(60)

  if (hazards.length === 0) {
    return `${header}\n${separator}\n${chalk.rgb(72, 199, 142)('No hazards detected. Safe waters!')}`
  }

  const lines = [header, separator]

  for (const h of hazards) {
    const badge = formatHazardBadge(h.type)
    const sev = formatSeverity(h.severity)
    lines.push(`${badge}  ${sev.padEnd(10)} ${chalk.gray(h.file)}`)
    lines.push(`   ${h.description}`)
  }

  return lines.join('\n')
}

// ─── Trade Route Map ───────────────────────────────────────────────────────────

/**
 * Format trade route map.
 *
 * @example
 * formatTradeRouteMap(routes) // => route list
 */
export function formatTradeRouteMap(routes: TradeRoute[]): string {
  const header = chalk.bold('Trade Routes')
  const separator = '\u2500'.repeat(60)

  if (routes.length === 0) {
    return `${header}\n${separator}\nNo trade routes found.`
  }

  const lines = [header, separator]

  for (const route of routes) {
    const arrow = route.isBiDirectional ? '\u2194' : '\u2192'
    const heavy = route.isHeavilyUsed ? chalk.rgb(255, 215, 0)(' \u2605') : ''
    lines.push(`${chalk.cyan(route.from)} ${arrow} ${chalk.cyan(route.to)}  vol:${route.volume}  clarity:${route.clarity}${heavy}`)
  }

  return lines.join('\n')
}

// ─── Port Registry ─────────────────────────────────────────────────────────────

/**
 * Format port registry.
 *
 * @example
 * formatPortRegistry(ports) // => port list
 */
export function formatPortRegistry(ports: PortOfEntry[]): string {
  const header = chalk.bold('Ports of Entry')
  const separator = '\u2500'.repeat(60)

  if (ports.length === 0) {
    return `${header}\n${separator}\nNo ports found.`
  }

  const lines = [header, separator]

  for (const port of ports) {
    const docBadge = port.isDocumented ? chalk.rgb(72, 199, 142)('\u2713') : chalk.rgb(220, 80, 80)('\u2717')
    const safeBadge = port.isTypeSafe ? chalk.rgb(72, 199, 142)('\u2713') : chalk.rgb(220, 150, 80)('\u2717')
    lines.push(`${docBadge} ${safeBadge}  ${port.type.padEnd(12)} ${chalk.cyan(port.name.padEnd(25))} ${chalk.gray(port.file)}`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format cartography stats summary.
 *
 * @example
 * formatCartographyStats(stats) // => summary string
 */
export function formatCartographyStats(stats: CartographyStats): string {
  const header = chalk.bold('Cartography Summary')
  const separator = '\u2500'.repeat(50)

  const lines = [
    header,
    separator,
    `Regions:       ${stats.totalRegions} (well-charted: ${stats.wellCharted}, partial: ${stats.partiallyCharted}, uncharted: ${stats.uncharted}, misleading: ${stats.misleading})`,
    `Landmarks:     ${stats.totalLandmarks} (documented: ${stats.documentedLandmarks})`,
    `Hazards:       ${stats.totalHazards} (critical: ${stats.criticalHazards})`,
    `Trade Routes:  ${stats.totalRoutes} (heavily used: ${stats.heavilyUsedRoutes})`,
    `Ports:         ${stats.totalPorts} (documented: ${stats.documentedPorts})`,
    separator,
    `Documentation:  ${formatCompletenessGauge(stats.avgDocumentation, 15)}`,
    `Naming Clarity: ${formatCompletenessGauge(stats.avgNamingClarity, 15)}`,
    `Organization:   ${formatCompletenessGauge(stats.avgOrganization, 15)}`,
    `Map Completeness: ${formatCompletenessGauge(stats.mapCompleteness, 15)}`,
    separator,
    `Chart Quality:  ${formatChartQuality(stats.chartQuality)}`,
    `Terra Incognita: ${stats.terraIncognita}%`,
  ]

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Fix X']) // => recommendation list
 */
export function formatRecommendations(recommendations: string[]): string {
  const header = chalk.bold('Recommendations')
  const separator = '\u2500'.repeat(50)

  if (recommendations.length === 0) {
    return `${header}\n${separator}\nNo recommendations. The map is complete!`
  }

  const lines = [header, separator]

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ────────────────────────────────────────────────────────────────

/**
 * Format full cartography table output.
 *
 * @example
 * formatCartographyTable(result) // => full table string
 */
export function formatCartographyTable(result: CartographyResult): string {
  const sections = [
    formatCartographyStats(result.stats),
    '',
    formatRegionSurvey(result.regions),
    '',
    formatLandmarkInventory(result.landmarks),
    '',
    formatHazardWarnings(result.hazards),
    '',
    formatTradeRouteMap(result.routes),
    '',
    formatPortRegistry(result.ports),
    '',
    formatRecommendations(result.recommendations),
  ]

  return sections.join('\n')
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

/**
 * Format cartography result as JSON.
 *
 * @example
 * formatCartographyJson(result) // => JSON string
 */
export function formatCartographyJson(result: CartographyResult): string {
  return JSON.stringify(result, null, 2)
}
