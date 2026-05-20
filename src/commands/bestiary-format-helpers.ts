import chalk from 'chalk'

import type { BestiaryResult, BestiaryStats, Creature, CreatureSighting } from './bestiary-helpers.js'

// ─── Danger Colors ────────────────────────────────────────────────────────────

const dangerColor: Record<string, (s: string) => string> = {
  harmless: (s: string) => chalk.rgb(100, 200, 100)(s),
  caution: (s: string) => chalk.rgb(255, 180, 0)(s),
  dangerous: (s: string) => chalk.rgb(255, 80, 50)(s),
  lethal: (s: string) => chalk.rgb(255, 30, 30)(s),
}

// ─── Creature Catalog ─────────────────────────────────────────────────────────

/**
 * Format the creature catalog.
 *
 * @example
 * formatCreatureCatalog(creatures)
 */
export function formatCreatureCatalog(creatures: Creature[]): string {
  if (creatures.length === 0) return '  No creatures discovered\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Creature Catalog')
  lines.push('  ────────────────────────────────────────────────────')

  for (const c of creatures) {
    const color = dangerColor[c.dangerLevel] ?? chalk.white
    lines.push(`  ${chalk.bold(c.name.padEnd(12))} ${color(`[${c.dangerLevel}]`)} ×${c.frequency}`)
    lines.push(`    ${c.description}`)
    lines.push(`    Habitat: ${c.habitat.length > 0 ? c.habitat.slice(0, 3).join(', ') : 'unknown'}`)
    lines.push(`    Behaviors: ${c.behaviors.join(', ')}`)
    lines.push(`    Weaknesses: ${c.weaknesses.join(', ')}`)
    lines.push(`    Loot: ${c.loot}`)
    lines.push('')
  }

  return lines.join('\n')
}

// ─── Sighting Table ────────────────────────────────────────────────────────────

/**
 * Format creature sightings.
 *
 * @example
 * formatSightingTable(sightings)
 */
export function formatSightingTable(sightings: CreatureSighting[]): string {
  if (sightings.length === 0) return '  No sightings recorded\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Sightings')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < Math.min(sightings.length, 20); i++) {
    const s = sightings[i]!
    const sevBar = '█'.repeat(Math.round(s.severity / 10)) + '░'.repeat(10 - Math.round(s.severity / 10))
    const color = s.severity > 70 ? chalk.rgb(255, 50, 50) : s.severity > 40 ? chalk.rgb(255, 180, 0) : chalk.rgb(100, 200, 100)
    lines.push(`  ${i + 1}. ${chalk.bold(s.creature)} at ${s.file}:${s.line}`)
    lines.push(`     ${color(sevBar)} ${s.severity}/100`)
    lines.push(`     ${s.evidence}`)
  }

  return lines.join('\n')
}

// ─── Ecosystem Health Meter ───────────────────────────────────────────────────

/**
 * Format ecosystem health meter.
 *
 * @example
 * formatEcosystemHealthMeter(85)
 */
export function formatEcosystemHealthMeter(health: number): string {
  const filled = Math.round(health / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
  const color = health >= 70 ? chalk.rgb(100, 200, 100) : health >= 40 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Ecosystem Health: ${color(`${bar} ${health}%`)}`)
  lines.push('  ────────────────────────────────────────────────────')
  return lines.join('\n')
}

// ─── Habitat Map ──────────────────────────────────────────────────────────────

/**
 * Format habitat map showing creatures per file.
 *
 * @example
 * formatHabitatMap(creatures)
 */
export function formatHabitatMap(creatures: Creature[]): string {
  if (creatures.length === 0) return '  No habitats mapped\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Habitat Map')
  lines.push('  ────────────────────────────────────────────────────')

  const fileMap = new Map<string, string[]>()
  for (const c of creatures) {
    for (const h of c.habitat) {
      const arr = fileMap.get(h) ?? []
      if (!arr.includes(c.name)) arr.push(c.name)
      fileMap.set(h, arr)
    }
  }

  for (const [file, creatureNames] of fileMap) {
    lines.push(`  ${file}: ${creatureNames.join(', ')}`)
  }

  return lines.join('\n')
}

// ─── Stats Display ────────────────────────────────────────────────────────────

/**
 * Format bestiary stats.
 *
 * @example
 * formatBestiaryStats(stats)
 */
export function formatBestiaryStats(stats: BestiaryStats): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Bestiary Summary')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Species Found:        ${stats.totalCreatures}`)
  lines.push(`  Total Sightings:      ${stats.totalSightings}`)
  lines.push(`  Dangerous Species:    ${stats.dangerousCreatures}`)
  lines.push(`  Harmless Species:     ${stats.harmlessCreatures}`)
  lines.push(`  Most Common:          ${stats.mostCommonCreature}`)
  lines.push(`  Most Dangerous Area:  ${stats.mostDangerousArea}`)
  lines.push(`  Ecosystem Health:     ${stats.ecosystemHealth}%`)
  lines.push(`  Biodiversity:         ${stats.biodiversity}%`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Slay the dragons'])
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Recommendations')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format complete bestiary result as table.
 *
 * @example
 * formatBestiaryTable(result)
 */
export function formatBestiaryTable(result: BestiaryResult): string {
  const parts: string[] = []
  parts.push(formatCreatureCatalog(result.creatures))
  parts.push('')
  parts.push(formatSightingTable(result.sightings))
  parts.push('')
  parts.push(formatEcosystemHealthMeter(result.stats.ecosystemHealth))
  parts.push('')
  parts.push(formatHabitatMap(result.creatures))
  parts.push('')
  parts.push(formatBestiaryStats(result.stats))
  parts.push('')
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format bestiary result as JSON.
 *
 * @example
 * formatBestiaryJSON(result)
 */
export function formatBestiaryJSON(result: BestiaryResult): string {
  return JSON.stringify(result, null, 2)
}
