import chalk from 'chalk'
import type {
  Metal,
  TransmutationTarget,
  Transformation,
  Catalyst,
  Element,
  AlchemyStats,
  AlchemyResult,
} from './alchemy-helpers.js'

// ─── Metal Formatting ─────────────────────────────────────────────────────────

/**
 * Format a metal with colored symbol
 * @example
 * formatMetal('gold') // '🥇 gold'
 */
export function formatMetal(metal: Metal): string {
  const map: Record<Metal, string> = {
    lead: '⚫', iron: '🔩', copper: '🟤', bronze: '🥉', silver: '🥈', gold: '🥇',
  }
  const colors: Record<Metal, (s: string) => string> = {
    lead: chalk.red, iron: chalk.rgb(150, 150, 150), copper: chalk.rgb(184, 115, 51),
    bronze: chalk.rgb(205, 127, 50), silver: chalk.gray, gold: chalk.yellow,
  }
  return `${map[metal]} ${colors[metal](metal)}`
}

/**
 * Format transmutability as a progress bar
 * @example
 * formatTransmutabilityBar(75) // '███████████████░░░░░'
 */
export function formatTransmutabilityBar(score: number): string {
  const filled = Math.round(score / 5)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  if (score >= 70) return chalk.green(bar)
  if (score >= 40) return chalk.yellow(bar)
  return chalk.red(bar)
}

/**
 * Format a single transmutation target
 * @example
 * formatTarget(target) // '🥇 gold  src/a.ts  transmutability: 10'
 */
export function formatTarget(target: TransmutationTarget): string {
  const metal = formatMetal(target.currentMetal)
  const bar = formatTransmutabilityBar(target.transmutability)
  const essence = target.essence >= 70 ? chalk.green(`essence:${target.essence}`) : chalk.yellow(`essence:${target.essence}`)
  return `${metal.padEnd(12)} ${chalk.cyan(target.file.padEnd(30))} ${bar}  ${essence}  →${target.potentialMetal}`
}

/**
 * Format targets table
 * @example
 * formatTargetsTable(targets) // multi-line string
 */
export function formatTargetsTable(targets: TransmutationTarget[]): string {
  if (targets.length === 0) return chalk.gray('No transmutation targets found.')
  const header = chalk.bold('Metal'.padEnd(12) + 'File'.padEnd(30) + 'Transmutability'.padEnd(22) + 'Essence  Potential')
  const sep = '─'.repeat(100)
  const sorted = Array.from(targets).sort((a, b) => b.transmutability - a.transmutability)
  return [header, sep, ...sorted.map(formatTarget)].join('\n')
}

// ─── Transformation Formatting ────────────────────────────────────────────────

/**
 * Format transformation difficulty with color
 * @example
 * formatDifficulty('elementary') // green 'ELEMENTARY'
 */
export function formatDifficulty(difficulty: Transformation['difficulty']): string {
  const colors: Record<Transformation['difficulty'], (s: string) => string> = {
    elementary: chalk.green, intermediate: chalk.yellow,
    advanced: chalk.rgb(255, 165, 0), masterwork: chalk.red,
  }
  return colors[difficulty](difficulty.toUpperCase().padEnd(14))
}

/**
 * Format transformation risk with color
 * @example
 * formatRisk('safe') // green 'SAFE'
 */
export function formatRisk(risk: Transformation['risk']): string {
  const colors: Record<Transformation['risk'], (s: string) => string> = {
    safe: chalk.green, caution: chalk.yellow,
    volatile: chalk.rgb(255, 165, 0), explosive: chalk.red,
  }
  return colors[risk](risk.toUpperCase().padEnd(10))
}

/**
 * Format a single transformation
 * @example
 * formatTransformation(transform) // 'SIMPLIFICATION  ELEMENTARY  SAFE'
 */
export function formatTransformation(t: Transformation): string {
  const diff = formatDifficulty(t.difficulty)
  const risk = formatRisk(t.risk)
  return `${chalk.bold(t.type.padEnd(18))} ${diff} ${risk}  ${t.from} → ${t.to}`
}

// ─── Catalyst Formatting ──────────────────────────────────────────────────────

/**
 * Format a single catalyst
 * @example
 * formatCatalyst(catalyst) // '✓ typescript-strict  effectiveness: 90'
 */
export function formatCatalyst(c: Catalyst): string {
  const status = c.isAvailable ? chalk.green('✓') : chalk.red('✗')
  const bar = formatTransmutabilityBar(c.effectiveness)
  return `${status} ${chalk.bold(c.name.padEnd(22))} ${bar}  ${chalk.gray(c.type)}  ${c.description}`
}

/**
 * Format catalysts section
 * @example
 * formatCatalysts(catalysts) // multi-line
 */
export function formatCatalysts(catalysts: Catalyst[]): string {
  if (catalysts.length === 0) return chalk.gray('No catalysts detected.')
  return catalysts.map(formatCatalyst).join('\n')
}

// ─── Element Formatting ───────────────────────────────────────────────────────

/**
 * Format a single element
 * @example
 * formatElement(element) // '◆ functions  count: 5  purity: 80'
 */
export function formatElement(e: Element): string {
  const noble = e.isNoble ? chalk.green('noble') : chalk.yellow('reactive')
  return `${chalk.magenta('◆')} ${chalk.bold(e.name.padEnd(12))} count:${String(e.count).padEnd(4)} purity:${String(e.purity).padEnd(4)} stability:${String(e.stability).padEnd(4)} ${noble}`
}

/**
 * Format elements section
 * @example
 * formatElements(elements) // multi-line
 */
export function formatElements(elements: Element[]): string {
  if (elements.length === 0) return chalk.gray('No elements analyzed.')
  return elements.map(formatElement).join('\n')
}

// ─── Stats Formatting ─────────────────────────────────────────────────────────

/**
 * Format alchemy grade with color
 * @example
 * formatAlchemyGrade('grand-master') // gold 'GRAND-MASTER'
 */
export function formatAlchemyGrade(grade: AlchemyStats['alchemyGrade']): string {
  const colors: Record<AlchemyStats['alchemyGrade'], (s: string) => string> = {
    'grand-master': chalk.yellow, master: chalk.green,
    adept: chalk.cyan, apprentice: chalk.yellow, novice: chalk.red,
  }
  return colors[grade](grade.toUpperCase())
}

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: AlchemyStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       ALCHEMY ANALYSIS SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Total Targets:')}          ${stats.totalTargets}`,
    `${chalk.bold('Lead Files:')}             ${stats.leadFiles}`,
    `${chalk.bold('Gold Files:')}             ${stats.goldFiles}`,
    `${chalk.bold('Dominant Metal:')}         ${stats.dominantMetal}`,
    '',
    `${chalk.bold('Avg Transmutability:')}    ${stats.avgTransmutability}`,
    `${chalk.bold('Avg Essence:')}            ${stats.avgEssence}`,
    `${chalk.bold('Transformations:')}        ${stats.totalTransformations} (${stats.elementaryTransformations} elementary, ${stats.masterworkTransformations} masterwork)`,
    `${chalk.bold('Safe / Explosive:')}       ${stats.safeTransformations} / ${stats.explosiveTransformations}`,
    '',
    `${chalk.bold('Catalysts:')}              ${stats.availableCatalysts} available, ${stats.missingCatalysts} missing`,
    `${chalk.bold('Elements:')}               ${stats.totalElements} (${stats.nobleElements} noble)`,
    `${chalk.bold('Transmutation Potential:')} ${stats.overallTransmutationPotential}%`,
    `${chalk.bold('Philosopher Stone:')}      ${stats.philosopherStoneScore}/100`,
    `${chalk.bold('Alchemy Grade:')}          ${formatAlchemyGrade(stats.alchemyGrade)}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — the code is golden!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ──────────────────────────────────────────────────────────────

/**
 * Format the complete alchemy result
 * @example
 * formatAlchemyResult(result) // full formatted string
 */
export function formatAlchemyResult(result: AlchemyResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Transmutation Targets ──'),
    formatTargetsTable(result.targets),
    '',
    chalk.bold('── Catalysts ──'),
    formatCatalysts(result.catalysts),
    '',
    chalk.bold('── Elements ──'),
    formatElements(result.elements),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format alchemy result as JSON string
 * @example
 * formatAlchemyJson(result) // '{"targets":[...],...}'
 */
export function formatAlchemyJson(result: AlchemyResult): string {
  return JSON.stringify(result, null, 2)
}
