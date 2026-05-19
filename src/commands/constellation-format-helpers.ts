import chalk from 'chalk'

import {
  type Constellation,
  type ConstellationLink,
  type ConstellationResult,
  type ConstellationStats,
  type Star,
  type StarType,
} from './constellation-helpers.js'

// ─── Color Map ────────────────────────────────────────────────────────────────

const STAR_SYMBOLS: Record<StarType, string> = {
  giant: '★',
  'main-sequence': '✦',
  dwarf: '·',
  dark: '○',
  binary: '⋈',
}

const STAR_COLORS: Record<StarType, (t: string) => string> = {
  giant: (t) => chalk.rgb(255, 215, 0)(t),
  'main-sequence': (t) => chalk.rgb(135, 206, 250)(t),
  dwarf: (t) => chalk.rgb(169, 169, 169)(t),
  dark: (t) => chalk.rgb(64, 64, 64)(t),
  binary: (t) => chalk.rgb(186, 85, 211)(t),
}

/**
 * Get star symbol.
 *
 * @example
 * getStarSymbol('giant')
 */
export function getStarSymbol(type: StarType): string {
  return STAR_SYMBOLS[type] ?? '·'
}

/**
 * Get star color function.
 *
 * @example
 * getStarColor('giant')
 */
export function getStarColor(type: StarType): (t: string) => string {
  return STAR_COLORS[type] ?? chalk.white
}

/**
 * Get brightness bar.
 *
 * @example
 * getBrightnessBar(80)
 */
export function getBrightnessBar(brightness: number): string {
  const filled = Math.round(brightness / 10)
  return '★'.repeat(Math.max(filled, 0)) + '☆'.repeat(Math.max(10 - filled, 0))
}

// ─── Star Formatting ──────────────────────────────────────────────────────────

/**
 * Format a single star row.
 *
 * @example
 * formatStarRow(star)
 */
export function formatStarRow(star: Star): string {
  const colorFn = getStarColor(star.type)
  const symbol = getStarSymbol(star.type)
  const bar = getBrightnessBar(star.brightness)
  return colorFn(`  ${symbol} ${star.name.padEnd(20)} B:${String(star.brightness).padStart(3)} C:${String(star.connections).padStart(2)} S:${String(star.size).padStart(5)} ${bar}`)
}

/**
 * Format star map header and all stars.
 *
 * @example
 * formatStarMap(stars)
 */
export function formatStarMap(stars: Star[]): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Star Map:'))
  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))

  const sorted = [...stars].sort((a, b) => b.brightness - a.brightness)
  for (const star of sorted.slice(0, 30)) {
    lines.push(formatStarRow(star))
  }
  if (sorted.length > 30) {
    lines.push(chalk.dim(`  ... and ${sorted.length - 30} more stars`))
  }

  lines.push(chalk.gray('  ────────────────────────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Link Formatting ──────────────────────────────────────────────────────────

/**
 * Format a constellation link.
 *
 * @example
 * formatLink(link)
 */
export function formatLink(link: ConstellationLink): string {
  const arrow = link.type === 're-export' ? '⟸' : link.type === 'dynamic-import' ? '⇝' : '→'
  return `  ${link.from} ${arrow} ${link.to} (strength: ${link.strength})`
}

/**
 * Format all links.
 *
 * @example
 * formatLinks(links)
 */
export function formatLinks(links: ConstellationLink[]): string {
  if (links.length === 0) return chalk.dim('  No links found.')
  const lines: string[] = []
  lines.push(chalk.bold('  Links:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const link of links.slice(0, 20)) {
    lines.push(formatLink(link))
  }
  if (links.length > 20) {
    lines.push(chalk.dim(`  ... and ${links.length - 20} more links`))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Constellation Formatting ─────────────────────────────────────────────────

/**
 * Format a constellation.
 *
 * @example
 * formatConstellation(constellation)
 */
export function formatConstellation(constellation: Constellation): string {
  return `  ✨ ${chalk.bold(constellation.name)} — ${constellation.stars.length} stars, brightness: ${constellation.totalBrightness}\n    ${chalk.dim(constellation.description)}`
}

/**
 * Format all constellations.
 *
 * @example
 * formatConstellations(constellations)
 */
export function formatConstellations(constellations: Constellation[]): string {
  if (constellations.length === 0) return chalk.dim('  No constellations detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Constellations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const c of constellations) {
    lines.push(formatConstellation(c))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Dark Matter Formatting ───────────────────────────────────────────────────

/**
 * Format dark matter stars.
 *
 * @example
 * formatDarkMatter(darkMatter)
 */
export function formatDarkMatter(darkMatter: Star[]): string {
  if (darkMatter.length === 0) return chalk.dim('  No dark matter detected.')
  const lines: string[] = []
  lines.push(chalk.bold('  Dark Matter:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (const star of darkMatter) {
    lines.push(chalk.rgb(64, 64, 64)(`  ○ ${star.name} (${star.file}) — no incoming connections`))
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format constellation stats.
 *
 * @example
 * formatConstellationStats(stats)
 */
export function formatConstellationStats(stats: ConstellationStats): string {
  const lines: string[] = []
  lines.push(chalk.bold('  Stats:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  lines.push(`  Stars: ${stats.totalStars} | Links: ${stats.totalLinks}`)
  lines.push(`  Giants: ${stats.giantStars} | Dark: ${stats.darkStars} | Constellations: ${stats.constellationsFound}`)
  lines.push(`  Avg brightness: ${stats.averageBrightness} | Brightest: ${stats.brightestStar}`)
  if (stats.densestRegion) {
    lines.push(`  Densest region: ${stats.densestRegion}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs)
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.dim('  No recommendations.')
  const lines: string[] = []
  lines.push(chalk.bold('  Recommendations:'))
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  for (let i = 0; i < recs.length; i++) {
    lines.push(`  ${i + 1}. ${recs[i]}`)
  }
  lines.push(chalk.gray('  ─────────────────────────────────────────────────'))
  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format the full constellation result as table.
 *
 * @example
 * formatConstellationTable(result)
 */
export function formatConstellationTable(result: ConstellationResult): string {
  const sections: string[] = []
  sections.push('')
  sections.push(chalk.bold('  Module Constellation Map\n'))
  sections.push(formatStarMap(result.stars))
  sections.push('')
  sections.push(formatConstellations(result.constellations))
  sections.push('')
  sections.push(formatDarkMatter(result.darkMatter))
  sections.push('')
  sections.push(formatConstellationStats(result.stats))
  sections.push('')
  sections.push(formatRecommendations(result.recommendations))
  sections.push('')
  return sections.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format constellation result as JSON.
 *
 * @example
 * formatConstellationJSON(result)
 */
export function formatConstellationJSON(result: ConstellationResult): string {
  return JSON.stringify(result, null, 2)
}
