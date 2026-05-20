import chalk from 'chalk'
import type { TerrariumResult, Organism, Biome, TerrariumStats, FoodWeb } from './terrarium-helpers.js'

// ─── Color Utilities ────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function speciesColor(s: string): string {
  switch (s) {
    case 'producer': return chalk.green(s)
    case 'primary-consumer': return chalk.blue(s)
    case 'secondary-consumer': return chalk.cyan(s)
    case 'apex-predator': return chalk.rgb(255, 215, 0)(s)
    case 'decomposer': return chalk.rgb(139, 90, 43)(s)
    case 'parasite': return chalk.red(s)
    case 'symbiont': return chalk.magenta(s)
    default: return chalk.dim(s)
  }
}

function healthColor(h: string): string {
  switch (h) {
    case 'thriving': return chalk.rgb(255, 215, 0)(h)
    case 'healthy': return chalk.green(h)
    case 'stressed': return chalk.yellow(h)
    case 'declining': return chalk.rgb(255, 165, 0)(h)
    case 'endangered': return chalk.red(h)
    default: return chalk.dim(h)
  }
}

function biomeColor(b: string): string {
  switch (b) {
    case 'rainforest': return chalk.green(b)
    case 'temperate-forest': return chalk.rgb(34, 139, 34)(b)
    case 'grassland': return chalk.yellow(b)
    case 'coral-reef': return chalk.cyan(b)
    case 'wetland': return chalk.blue(b)
    case 'volcanic': return chalk.red(b)
    case 'tundra': return chalk.rgb(200, 200, 220)(b)
    case 'deep-sea': return chalk.blue(b)
    default: return chalk.dim(b)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'thriving': return chalk.rgb(255, 215, 0)(g)
    case 'balanced': return chalk.green(g)
    case 'stressed': return chalk.yellow(g)
    case 'fragile': return chalk.rgb(255, 165, 0)(g)
    case 'collapsing': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function stabilityColor(s: string): string {
  switch (s) {
    case 'climax': return chalk.rgb(255, 215, 0)(s)
    case 'mature': return chalk.green(s)
    case 'succession': return chalk.blue(s)
    case 'pioneer': return chalk.yellow(s)
    case 'disturbed': return chalk.rgb(255, 165, 0)(s)
    default: return chalk.red(s)
  }
}

// ─── Organism Formatting ─────────────────────────────────────────────────────

function formatOrganism(o: Organism, verbose: boolean): string {
  const keystoneMarker = o.keystone ? chalk.rgb(255, 215, 0)('★') : ' '
  const line = ` ${keystoneMarker} ${chalk.bold(o.file)} fitness:${scoreColor(o.fitness)} adapt:${scoreColor(o.adaptability)} repro:${scoreColor(o.reproduction)} ${speciesColor(o.species)} trophic:${o.trophicLevel} ${healthColor(o.health)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    kingdom:${o.kingdom} niche:${o.niche} biomass:${o.biomass} population:${o.population} risk:${o.extinctionRisk} invasive:${o.invasivePotential}`)
  details.push(`    prey:${o.prey.length} predators:${o.predators.length} symbionts:${o.symbionts.length} mutations:${o.mutations} lifespan:${o.lifespan}`)
  return details.join('\n')
}

// ─── Biome Formatting ────────────────────────────────────────────────────────

function formatBiome(b: Biome, verbose: boolean): string {
  const line = `  ${chalk.bold(b.directory)} ${biomeColor(b.biomeType)} biodiv:${scoreColor(b.biodiversity)} balance:${scoreColor(b.ecologicalBalance)} ${stabilityColor(b.stability)} species:${b.speciesCount} ${healthColor(b.health)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    fitness:${scoreColor(b.avgFitness)} trophic:${scoreColor(b.trophicEfficiency)} cycling:${scoreColor(b.nutrientCycling)} keystone:${b.keystoneCount} producers:${b.producerCount} consumers:${b.consumerCount} parasites:${b.parasiteCount}`)
  return details.join('\n')
}

// ─── Food Web Formatting ─────────────────────────────────────────────────────

function formatFoodWeb(fw: FoodWeb): string {
  return [
    `  Links: ${fw.links} | Avg Chain: ${fw.avgChainLength} | Max Depth: ${fw.maxChainLength}`,
    `  Cycles: ${chalk.red(String(fw.cycles))} | Keystone: ${chalk.rgb(255, 215, 0)(String(fw.keystoneNodes))} | Apex: ${chalk.yellow(String(fw.apexNodes))} | Basal: ${chalk.green(String(fw.basalNodes))}`,
  ].join('\n')
}

// ─── Stats Formatting ────────────────────────────────────────────────────────

function formatStats(stats: TerrariumStats): string {
  return [
    `  Grade: ${gradeColor(stats.ecosystemGrade)} | Health: ${scoreColor(stats.ecologicalHealth)} | Fitness: ${scoreColor(stats.avgFitness)} | Biodiversity: ${scoreColor(stats.biodiversity)}`,
    `  Files: ${stats.totalFiles} | Biomes: ${stats.totalBiomes} | Organisms: ${stats.totalOrganisms}`,
    `  Adaptability: ${scoreColor(stats.avgAdaptability)} | Reproduction: ${scoreColor(stats.avgReproduction)} | Trophic Eff: ${scoreColor(stats.avgTrophicEfficiency)} | Cycling: ${scoreColor(stats.avgNutrientCycling)} | Balance: ${scoreColor(stats.avgEcologicalBalance)}`,
    `  Thriving: ${chalk.green(String(stats.thrivingCount))} | Endangered: ${chalk.red(String(stats.endangeredCount))} | Keystone: ${chalk.rgb(255, 215, 0)(String(stats.keystoneCount))} | Parasite: ${chalk.red(String(stats.parasiteCount))}`,
    `  Dominant Biome: ${biomeColor(stats.dominantBiome)} | Most Diverse: ${chalk.green(stats.mostDiverse)} | Least: ${chalk.red(stats.leastDiverse)}`,
    `  Keystone File: ${chalk.rgb(255, 215, 0)(stats.keystoneFile)} | Parasite File: ${chalk.red(stats.parasiteFile)}`,
  ].join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format terrarium result as a table
 * @example
 * formatTerrariumTable(result, false) // string
 */
export function formatTerrariumTable(result: TerrariumResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌱 Terrarium - Code Ecosystem Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🦠 Organisms'))
  if (result.organisms.length === 0) {
    lines.push(chalk.dim('  No organisms detected.'))
  } else {
    const display = verbose ? result.organisms : result.organisms.slice(0, 15)
    for (const o of display) {
      lines.push(formatOrganism(o, verbose))
    }
    if (!verbose && result.organisms.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.organisms.length - 15} more`))
    }
  }
  lines.push('')

  if (result.biomes.length > 0) {
    lines.push(chalk.bold('🌿 Biomes'))
    for (const b of result.biomes) {
      lines.push(formatBiome(b, verbose))
    }
    lines.push('')
  }

  lines.push(chalk.bold('🕸️ Food Web'))
  lines.push(formatFoodWeb(result.foodWeb))

  lines.push('')
  lines.push(chalk.bold('📈 Statistics'))
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
 * Format terrarium result as JSON
 * @example
 * formatTerrariumJson(result) // string
 */
export function formatTerrariumJson(result: TerrariumResult): string {
  return JSON.stringify(result, null, 2)
}
