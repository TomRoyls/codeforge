import chalk from 'chalk'

import type { Attention, GardenBed, GardenerResult, GardenerStats, Plant, PlantSpecies } from './gardener-helpers.js'

// ─── Species Icons ────────────────────────────────────────────────────────────

const speciesIcon: Record<PlantSpecies, string> = {
  tree: '🌳',
  shrub: '🌿',
  flower: '🌸',
  vine: '🌿',
  weed: '🥀',
  cactus: '🌵',
}

const speciesColor: Record<PlantSpecies, (s: string) => string> = {
  tree: (s: string) => chalk.rgb(34, 139, 34)(s),
  shrub: (s: string) => chalk.rgb(60, 179, 113)(s),
  flower: (s: string) => chalk.rgb(255, 105, 180)(s),
  vine: (s: string) => chalk.rgb(46, 139, 87)(s),
  weed: (s: string) => chalk.rgb(139, 119, 101)(s),
  cactus: (s: string) => chalk.rgb(107, 142, 35)(s),
}

const urgencyColor: Record<string, (s: string) => string> = {
  high: (s: string) => chalk.rgb(255, 50, 50)(s),
  medium: (s: string) => chalk.rgb(255, 180, 0)(s),
  low: (s: string) => chalk.rgb(100, 200, 100)(s),
}

// ─── Plant Table ──────────────────────────────────────────────────────────────

/**
 * Format plant table.
 *
 * @example
 * formatPlantTable(plants)
 */
export function formatPlantTable(plants: Plant[]): string {
  if (plants.length === 0) return '  No plants found\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Plant Catalog')
  lines.push('  ────────────────────────────────────────────────────')

  for (const p of plants) {
    const color = speciesColor[p.species] ?? chalk.white
    const bar = buildHealthBar(p.health)
    lines.push(`  ${color(`${p.species.padEnd(8)} ${p.file}`)} ${bar} ${p.health}%`)
    lines.push(`    Height: ${p.height} lines | Roots: ${p.rootDepth} imports | Fruit: ${p.fruitCount} exports`)
    if (p.needsAttention.length > 0) {
      for (const a of p.needsAttention.slice(0, 3)) {
        lines.push(`    ${formatAttention(a)}`)
      }
    }
  }

  return lines.join('\n')
}

function buildHealthBar(health: number): string {
  const filled = Math.round(health / 10)
  const empty = 10 - filled
  return '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
}

function formatAttention(a: Attention): string {
  const color = urgencyColor[a.urgency] ?? chalk.white
  return `${color(`[${a.urgency}]`)} ${a.type}: ${a.description}`
}

// ─── Garden Layout ────────────────────────────────────────────────────────────

/**
 * Format garden layout.
 *
 * @example
 * formatGardenLayout(beds)
 */
export function formatGardenLayout(beds: GardenBed[]): string {
  if (beds.length === 0) return '  No garden beds\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Garden Layout')
  lines.push('  ────────────────────────────────────────────────────')

  for (const bed of beds) {
    const condColor = bed.condition === 'thriving' ? chalk.rgb(50, 205, 50) : bed.condition === 'healthy' ? chalk.rgb(100, 200, 100) : bed.condition === 'needs-work' ? chalk.rgb(255, 180, 0) : bed.condition === 'overgrown' ? chalk.rgb(255, 50, 50) : chalk.rgb(139, 119, 101)
    lines.push(`  ${chalk.bold(bed.name)}: ${condColor(bed.condition)} (${bed.plants.length} plants, soil ${bed.soil}%)`)

    const speciesGroups = new Map<PlantSpecies, number>()
    for (const p of bed.plants) {
      speciesGroups.set(p.species, (speciesGroups.get(p.species) ?? 0) + 1)
    }
    const summary = [...speciesGroups.entries()].map(([s, c]) => `${speciesIcon[s]}×${c}`).join(' ')
    lines.push(`    ${summary}`)
  }

  return lines.join('\n')
}

// ─── Attention List ────────────────────────────────────────────────────────────

/**
 * Format attention needs list.
 *
 * @example
 * formatAttentionList(plants)
 */
export function formatAttentionList(plants: Plant[]): string {
  const allNeeds: { plant: string; attention: Attention }[] = []
  for (const p of plants) {
    for (const a of p.needsAttention) {
      allNeeds.push({ plant: p.file, attention: a })
    }
  }

  if (allNeeds.length === 0) return '  No attention needed\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Attention Needed')
  lines.push('  ────────────────────────────────────────────────────')

  const sorted = allNeeds.sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    return (urgencyOrder[a.attention.urgency] ?? 2) - (urgencyOrder[b.attention.urgency] ?? 2)
  })

  for (const { plant, attention: a } of sorted.slice(0, 15)) {
    const color = urgencyColor[a.urgency] ?? chalk.white
    lines.push(`  ${color(`[${a.urgency.toUpperCase()}]`)} ${a.type} → ${plant}`)
    lines.push(`    ${a.description}`)
    lines.push(`    Action: ${a.action}`)
  }

  return lines.join('\n')
}

// ─── Garden Health Meter ──────────────────────────────────────────────────────

/**
 * Format garden health meter.
 *
 * @example
 * formatGardenHealthMeter(85)
 */
export function formatGardenHealthMeter(health: number): string {
  const filled = Math.round(health / 5)
  const empty = 20 - filled
  const bar = '█'.repeat(Math.max(filled, 0)) + '░'.repeat(Math.max(empty, 0))
  const color = health >= 70 ? chalk.rgb(50, 205, 50) : health >= 40 ? chalk.rgb(255, 180, 0) : chalk.rgb(255, 50, 50)

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Garden Health: ${color(`${bar} ${health}%`)}`)
  lines.push('  ────────────────────────────────────────────────────')
  return lines.join('\n')
}

// ─── Stats Display ────────────────────────────────────────────────────────────

/**
 * Format gardener stats.
 *
 * @example
 * formatGardenerStats(stats)
 */
export function formatGardenerStats(stats: GardenerStats): string {
  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Garden Summary')
  lines.push('  ────────────────────────────────────────────────────')
  lines.push(`  Total Plants:         ${stats.totalPlants}`)
  lines.push(`  Thriving:             ${stats.thrivingCount}`)
  lines.push(`  Need Attention:       ${stats.needsAttentionCount}`)
  lines.push(`  Weeds:                ${stats.weedCount}`)
  lines.push(`  Average Health:       ${stats.avgHealth}%`)
  lines.push(`  Garden Diversity:     ${stats.gardenDiversity}%`)
  lines.push(`  Tallest Plant:        ${stats.tallestPlant}`)
  lines.push(`  Deepest Roots:        ${stats.deepestRoots}`)
  lines.push(`  Most Fruitful:        ${stats.mostFruitful}`)
  lines.push(`  Beds Needing Work:    ${stats.bedsNeedingWork}`)
  lines.push(`  Overall Health:       ${stats.overallGardenHealth}%`)
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(['Water the plants'])
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return '  No recommendations\n'

  const lines: string[] = []
  lines.push('  ────────────────────────────────────────────────────')
  lines.push('  Seasonal Tips')
  lines.push('  ────────────────────────────────────────────────────')

  for (let i = 0; i < recommendations.length; i++) {
    lines.push(`  ${i + 1}. ${recommendations[i]}`)
  }

  return lines.join('\n')
}

// ─── Full Table ───────────────────────────────────────────────────────────────

/**
 * Format complete gardener result as table.
 *
 * @example
 * formatGardenerTable(result)
 */
export function formatGardenerTable(result: GardenerResult): string {
  const parts: string[] = []
  parts.push(formatGardenLayout(result.beds))
  parts.push('')
  parts.push(formatPlantTable(result.plants))
  parts.push('')
  parts.push(formatAttentionList(result.plants))
  parts.push('')
  parts.push(formatGardenHealthMeter(result.stats.overallGardenHealth))
  parts.push('')
  parts.push(formatGardenerStats(result.stats))
  parts.push('')
  parts.push(formatRecommendations(result.recommendations))
  return parts.join('\n')
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

/**
 * Format gardener result as JSON.
 *
 * @example
 * formatGardenerJSON(result)
 */
export function formatGardenerJSON(result: GardenerResult): string {
  return JSON.stringify(result, null, 2)
}
