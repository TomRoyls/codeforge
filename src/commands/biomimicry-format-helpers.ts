import chalk from 'chalk'
import type { BiomimicryResult, BioPattern, BioLifestyle, BioEcosystem, BiomimicryStats } from './biomimicry-helpers.js'

// ─── Color Utilities ──────────────────────────────────────────────────────────

function adherenceColor(a: number): string {
  if (a >= 70) return chalk.green(String(a))
  if (a >= 40) return chalk.yellow(String(a))
  return chalk.red(String(a))
}

function classificationColor(c: string): string {
  if (c === 'symbiotic') return chalk.green(c)
  if (c === 'climax') return chalk.blue(c)
  if (c === 'generalist') return chalk.cyan(c)
  if (c === 'specialist') return chalk.yellow(c)
  if (c === 'pioneer') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function healthColor(h: string): string {
  if (h === 'thriving') return chalk.green(h)
  if (h === 'balanced') return chalk.blue(h)
  if (h === 'stressed') return chalk.yellow(h)
  if (h === 'degraded') return chalk.rgb(255, 165, 0)(h)
  return chalk.red(h)
}

function ecosystemHealthColor(h: string): string {
  if (h === 'rainforest') return chalk.green(h)
  if (h === 'grassland') return chalk.blue(h)
  if (h === 'tundra') return chalk.yellow(h)
  if (h === 'desert') return chalk.rgb(255, 165, 0)(h)
  return chalk.red(h)
}

function maturityColor(m: string): string {
  if (m === 'old-growth') return chalk.green(m)
  if (m === 'mature') return chalk.blue(m)
  if (m === 'evolving') return chalk.yellow(m)
  return chalk.rgb(255, 165, 0)(m)
}

// ─── Pattern Formatting ──────────────────────────────────────────────────────

function formatPatterns(patterns: BioPattern[]): string {
  if (patterns.length === 0) return chalk.dim('  No patterns detected.')
  return patterns.map(p => {
    const bars = `${chalk.green('█'.repeat(Math.round(p.adherence / 5)))}${chalk.dim('░'.repeat(20 - Math.round(p.adherence / 5)))}`
    const benefits = p.benefits.map(b => chalk.green(`  ✓ ${b}`)).join('\n')
    const missing = p.missingBenefits.map(m => chalk.red(`  ✗ ${m}`)).join('\n')
    return [
      `  ${chalk.bold(p.name)} ${adherenceColor(p.adherence)}/100 ${bars}`,
      `     ${chalk.dim(p.description)}`,
      benefits,
      missing,
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

// ─── Lifestyle Formatting ────────────────────────────────────────────────────

function formatLifestyles(lifestyles: BioLifestyle[], verbose: boolean): string {
  if (lifestyles.length === 0) return chalk.dim('  No lifestyles classified.')
  const display = verbose ? lifestyles : lifestyles.slice(0, 10)
  return display.map((l, i) => {
    return [
      `  ${chalk.bold(`${i + 1}.`)} ${chalk.bold(l.file)} ${classificationColor(l.classification)}`,
      `     Pattern: ${chalk.white(l.dominantPattern)} | R:${l.resilience} A:${l.adaptability} E:${l.efficiency} S:${l.symbiosis} B:${l.biodiversity}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Ecosystem Formatting ────────────────────────────────────────────────────

function formatEcosystems(ecosystems: BioEcosystem[]): string {
  if (ecosystems.length === 0) return chalk.dim('  No ecosystems found.')
  return ecosystems.map(e => {
    const mono = e.isMonoculture ? chalk.red(' [monoculture]') : ''
    return [
      `  ${chalk.bold(e.name)} ${healthColor(e.health)}${mono}`,
      `     Species: ${chalk.white(String(e.species))} | Biodiversity: ${chalk.white(String(e.biodiversity))} | Keystone: ${chalk.bold(e.keystone || 'none')}`,
    ].join('\n')
  }).join('\n\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

function formatStats(stats: BiomimicryStats): string {
  return [
    `  Bio Score: ${chalk.bold(String(stats.overallBioScore))}/100 | Patterns: ${chalk.white(String(stats.totalPatterns))} (${chalk.green(String(stats.highAdherencePatterns))} high, ${chalk.red(String(stats.lowAdherencePatterns))} low)`,
    `  R:${stats.avgResilience} A:${stats.avgAdaptability} E:${stats.avgEfficiency} S:${stats.avgSymbiosis} B:${stats.avgBiodiversity}`,
    `  Ecosystems: ${chalk.white(String(stats.totalEcosystems))} (${chalk.green(String(stats.thrivingEcosystems))} thriving) | Monocultures: ${chalk.yellow(String(stats.monocultures))}`,
    `  Pioneer: ${chalk.rgb(255, 165, 0)(String(stats.pioneerFiles))} | Symbiotic: ${chalk.green(String(stats.symbioticFiles))} | Parasitic: ${chalk.red(String(stats.parasiticFiles))}`,
    `  Health: ${ecosystemHealthColor(stats.ecosystemHealth)} | Maturity: ${maturityColor(stats.natureMaturity)}`,
  ].join('\n')
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format biomimicry result as a table
 * @example
 * formatBiomimicryTable(result, false) // string
 */
export function formatBiomimicryTable(result: BiomimicryResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🌿 Biomimicry — Nature-Inspired Code Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')
  lines.push(chalk.bold('🔬 Patterns'))
  lines.push(formatPatterns(result.patterns))
  lines.push('')
  lines.push(chalk.bold('🧬 Lifestyles'))
  lines.push(formatLifestyles(result.lifestyles, verbose))
  lines.push('')
  lines.push(chalk.bold('🌍 Ecosystems'))
  lines.push(formatEcosystems(result.ecosystems))
  lines.push('')
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(formatStats(result.stats))
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    result.recommendations.forEach(r => lines.push(`  • ${r}`))
  }
  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format biomimicry result as JSON
 * @example
 * formatBiomimicryJson(result) // string
 */
export function formatBiomimicryJson(result: BiomimicryResult): string {
  return JSON.stringify(result, null, 2)
}
