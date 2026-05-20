import chalk from 'chalk'
import type {
  CelestialBody,
  Constellation,
  CelestialEvent,
  CosmicWeb,
  ObservatoryStats,
  ObservatoryResult,
} from './observatory-helpers.js'

// ─── Body Formatting ──────────────────────────────────────────────────────────

/**
 * Format a celestial body type with colored emoji
 * @example
 * formatBodyType('star') // '⭐ star'
 */
export function formatBodyType(type: CelestialBody['type']): string {
  const map: Record<CelestialBody['type'], string> = {
    'star': '⭐',
    'planet': '🪐',
    'moon': '🌙',
    'asteroid': '☄️',
    'comet': '🌠',
    'black-hole': '🕳️',
    'supernova': '💥',
    'pulsar': '📡',
    'dark-matter': '🌑',
  }
  return `${map[type]} ${type}`
}

/**
 * Format body magnitude as brightness bar
 * @example
 * formatMagnitude(75) // '██████████░░░░░░░░░░'
 */
export function formatMagnitude(magnitude: number): string {
  const filled = Math.round(magnitude / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  if (magnitude >= 70) return chalk.green(bar)
  if (magnitude >= 40) return chalk.yellow(bar)
  return chalk.red(bar)
}

/**
 * Format a single celestial body for display
 * @example
 * formatBody(body) // '⭐ star  src/main.ts  mag:80 grav:5'
 */
export function formatBody(body: CelestialBody): string {
  const typeStr = formatBodyType(body.type)
  const mag = formatMagnitude(body.magnitude)
  const obs = body.isObservable ? chalk.green('✓') : chalk.red('✗')
  return `${typeStr.padEnd(20)} ${chalk.cyan(body.file.padEnd(30))} ${mag}  obs:${obs}  mass:${body.mass}  grav:${body.gravity}  temp:${body.temperature}`
}

/**
 * Format bodies table
 * @example
 * formatBodiesTable(bodies) // multi-line string
 */
export function formatBodiesTable(bodies: CelestialBody[]): string {
  if (bodies.length === 0) return chalk.gray('No celestial bodies detected.')
  const sorted = Array.from(bodies).sort((a, b) => b.magnitude - a.magnitude)
  const header = chalk.bold('Type'.padEnd(20) + 'File'.padEnd(30) + 'Magnitude'.padEnd(22) + 'Obs Mass Grav Temp')
  const separator = '─'.repeat(100)
  const rows = sorted.map(formatBody)
  return [header, separator, ...rows].join('\n')
}

// ─── Constellation Formatting ─────────────────────────────────────────────────

/**
 * Format a single constellation
 * @example
 * formatConstellation(con) // '◆ Auth [5 stars, brightness: 80]'
 */
export function formatConstellation(con: Constellation): string {
  const vis = con.isVisible ? chalk.green('visible') : chalk.gray('invisible')
  const brightness = formatMagnitude(con.brightness)
  const stars = con.stars.length === 1 ? '1 star' : `${con.stars.length} stars`
  return `${chalk.magenta('◆')} ${chalk.bold(con.name.padEnd(20))} [${stars}, shape:${con.shape}, ${vis}] ${brightness}`
}

/**
 * Format constellations section
 * @example
 * formatConstellations(constellations) // multi-line
 */
export function formatConstellations(constellations: Constellation[]): string {
  if (constellations.length === 0) return chalk.gray('No constellations mapped.')
  const sorted = Array.from(constellations).sort((a, b) => b.brightness - a.brightness)
  return sorted.map(formatConstellation).join('\n')
}

// ─── Event Formatting ─────────────────────────────────────────────────────────

/**
 * Format event impact level with color
 * @example
 * formatImpact('high') // red 'HIGH'
 */
export function formatImpact(impact: CelestialEvent['impact']): string {
  const colors: Record<CelestialEvent['impact'], (s: string) => string> = {
    informational: chalk.gray,
    low: chalk.blue,
    medium: chalk.yellow,
    high: chalk.rgb(255, 165, 0),
    critical: chalk.red,
  }
  return colors[impact](impact.toUpperCase().padEnd(14))
}

/**
 * Format a single celestial event
 * @example
 * formatEvent(event) // '🚨 ECLIPSE  HIGH  description'
 */
export function formatEvent(event: CelestialEvent): string {
  const typeIcons: Record<CelestialEvent['type'], string> = {
    eclipse: '🌑',
    alignment: '🔄',
    collision: '💥',
    formation: '✨',
    convergence: '🔀',
  }
  const icon = typeIcons[event.type]
  const impact = formatImpact(event.impact)
  return `${icon} ${chalk.bold(event.type.padEnd(12))} ${impact} ${event.description}`
}

/**
 * Format events section
 * @example
 * formatEvents(events) // multi-line
 */
export function formatEvents(events: CelestialEvent[]): string {
  if (events.length === 0) return chalk.gray('No celestial events detected.')
  return events.map(formatEvent).join('\n')
}

// ─── Cosmic Web Formatting ────────────────────────────────────────────────────

/**
 * Format a single cosmic web cluster
 * @example
 * formatWebCluster(web) // '◆ Core  density: 75  filaments: 3  voids: 1'
 */
export function formatWebCluster(web: CosmicWeb): string {
  const density = formatMagnitude(web.density)
  const filCount = `${web.filaments.length} filament${web.filaments.length === 1 ? '' : 's'}`
  const voidCount = web.voidFiles.length > 0
    ? chalk.red(` ${web.voidFiles.length} void(s)`)
    : chalk.green(' no voids')
  return `${chalk.blue('◎')} ${chalk.bold(web.cluster.padEnd(20))} ${density}  ${filCount}${voidCount}`
}

/**
 * Format cosmic web section
 * @example
 * formatCosmicWeb(web) // multi-line
 */
export function formatCosmicWeb(web: CosmicWeb[]): string {
  if (web.length === 0) return chalk.gray('No cosmic web structure detected.')
  return web.map(formatWebCluster).join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format overall clarity with color
 * @example
 * formatClarity('crystal-clear') // green 'CRYSTAL-CLEAR'
 */
export function formatClarity(clarity: ObservatoryStats['overallClarity']): string {
  const colors: Record<ObservatoryStats['overallClarity'], (s: string) => string> = {
    'crystal-clear': chalk.green,
    'clear': chalk.rgb(100, 200, 100),
    'partly-cloudy': chalk.yellow,
    'overcast': chalk.rgb(255, 165, 0),
    'opaque': chalk.red,
  }
  return colors[clarity](clarity.toUpperCase())
}

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: ObservatoryStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       OBSERVATORY SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Total Bodies:')}        ${stats.totalBodies}`,
    `${chalk.bold('Stars:')}                ${stats.stars}`,
    `${chalk.bold('Black Holes:')}          ${stats.blackHoles}`,
    `${chalk.bold('Dark Matter:')}          ${stats.darkMatter}`,
    `${chalk.bold('Pulsars:')}              ${stats.pulsars}`,
    `${chalk.bold('Supernovae:')}           ${stats.supernovae}`,
    '',
    `${chalk.bold('Constellations:')}       ${stats.totalConstellations} (${stats.visibleConstellations} visible)`,
    `${chalk.bold('Avg Magnitude:')}        ${stats.avgMagnitude}`,
    `${chalk.bold('Avg Gravity:')}          ${stats.avgGravity}`,
    `${chalk.bold('Max Gravity:')}          ${stats.maxGravity}`,
    '',
    `${chalk.bold('Observable Ratio:')}     ${stats.observableRatio}%`,
    `${chalk.bold('Dark Matter Ratio:')}    ${stats.darkMatterRatio}%`,
    `${chalk.bold('Cosmic Expansion:')}     ${stats.cosmicExpansion}`,
    `${chalk.bold('Universe Size:')}        ${stats.universeSize} LOC`,
    `${chalk.bold('Overall Clarity:')}      ${formatClarity(stats.overallClarity)}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations Formatting ───────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — the sky is clear!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format the complete observatory result for console output
 * @example
 * formatObservatoryResult(result) // full formatted string
 */
export function formatObservatoryResult(result: ObservatoryResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Celestial Bodies ──'),
    formatBodiesTable(result.bodies),
    '',
    chalk.bold('── Constellations ──'),
    formatConstellations(result.constellations),
    '',
    chalk.bold('── Celestial Events ──'),
    formatEvents(result.events),
    '',
    chalk.bold('── Cosmic Web ──'),
    formatCosmicWeb(result.web),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format observatory result as JSON string
 * @example
 * formatObservatoryJson(result) // '{"bodies":[...],...}'
 */
export function formatObservatoryJson(result: ObservatoryResult): string {
  return JSON.stringify(result, null, 2)
}
