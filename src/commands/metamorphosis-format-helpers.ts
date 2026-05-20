import chalk from 'chalk'

import type { EvolutionaryPressure, MetamorphosisResult, MetamorphosisStats, StageName, Transformation } from './metamorphosis-helpers.js'

// ─── Stage Badge ───────────────────────────────────────────────────────────────

/**
 * Format a life stage badge with color.
 *
 * @example
 * formatStageBadge('butterfly') // => colored '🦋 butterfly'
 */
export function formatStageBadge(stage: StageName): string {
  const badges: Record<StageName, { icon: string; color: (s: string) => string }> = {
    butterfly: { icon: '🦋', color: chalk.rgb(138, 43, 226) },
    chrysalis: { icon: '🫘', color: chalk.rgb(255, 215, 0) },
    egg: { icon: '🥚', color: chalk.rgb(173, 216, 230) },
    fossil: { icon: '🪨', color: chalk.gray },
    larva: { icon: '🐛', color: chalk.rgb(144, 238, 144) },
    pupa: { icon: '🫛', color: chalk.rgb(100, 149, 237) },
  }
  const b = badges[stage] ?? { icon: '?', color: chalk.white }
  return b.color(`${b.icon} ${stage}`)
}

// ─── Life Cycle Diagram ────────────────────────────────────────────────────────

/**
 * Format a life cycle diagram showing stage distribution.
 *
 * @example
 * formatLifeCycleDiagram(stats) // => visual representation
 */
export function formatLifeCycleDiagram(stats: MetamorphosisStats): string {
  const stages: { name: StageName; count: number }[] = [
    { name: 'egg', count: stats.eggCount },
    { name: 'larva', count: stats.larvaCount },
    { name: 'pupa', count: stats.pupaCount },
    { name: 'chrysalis', count: stats.chrysalisCount },
    { name: 'butterfly', count: stats.butterflyCount },
    { name: 'fossil', count: stats.fossilCount },
  ]

  const maxCount = Math.max(...stages.map(s => s.count), 1)
  const barMax = 20

  const lines: string[] = [
    '',
    chalk.bold.rgb(100, 149, 237)('  Life Cycle Distribution:'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]

  for (const s of stages) {
    const barLen = Math.round((s.count / maxCount) * barMax)
    const bar = '█'.repeat(barLen)
    lines.push(`  ${formatStageBadge(s.name).padEnd(22)} ${bar} ${s.count}`)
  }

  return lines.join('\n')
}

// ─── Transformation Table ──────────────────────────────────────────────────────

/**
 * Format transformation table.
 *
 * @example
 * formatTransformationTable(transformations) // => table with stage badges
 */
export function formatTransformationTable(transformations: Transformation[]): string {
  if (transformations.length === 0) return chalk.gray('  No files analyzed')

  const sorted = [...transformations].sort((a, b) => b.maturationScore - a.maturationScore)
  const lines: string[] = [
    '',
    chalk.bold('  Transformations:'),
    chalk.gray('  ' + '─'.repeat(85)),
    `  ${chalk.bold('File').padEnd(35)} ${chalk.bold('Stage').padEnd(20)} ${chalk.bold('Score').padEnd(8)} ${chalk.bold('Next')}`,
    chalk.gray('  ' + '─'.repeat(85)),
  ]

  for (const t of sorted) {
    const name = t.file.length > 33 ? '...' + t.file.slice(-30) : t.file
    const stageStr = formatStageBadge(t.currentStage.stage)
    lines.push(`  ${name.padEnd(35)} ${stageStr.padEnd(20)} ${String(t.maturationScore).padEnd(8)} ${chalk.gray(t.nextStage)}`)
  }

  return lines.join('\n')
}

// ─── Maturation Timeline ───────────────────────────────────────────────────────

/**
 * Format a maturation timeline.
 *
 * @example
 * formatMaturationTimeline(transformations) // => ordered timeline
 */
export function formatMaturationTimeline(transformations: Transformation[]): string {
  const sorted = [...transformations].sort((a, b) => a.maturationScore - b.maturationScore)
  const lines: string[] = [
    '',
    chalk.bold('  Maturation Timeline (least → most mature):'),
    chalk.gray('  ' + '─'.repeat(60)),
  ]

  for (const t of sorted.slice(0, 10)) {
    const filled = Math.round(t.maturationScore / 5)
    const empty = 20 - filled
    const bar = '█'.repeat(filled) + '░'.repeat(empty)
    const name = (t.file.split('/').pop() ?? t.file).slice(0, 25)
    const color = t.maturationScore >= 80 ? chalk.rgb(138, 43, 226) : t.maturationScore >= 50 ? chalk.rgb(100, 149, 237) : chalk.rgb(255, 165, 0)
    lines.push(`  ${name.padEnd(27)} ${color(bar)} ${t.maturationScore}`)
  }

  return lines.join('\n')
}

// ─── Pressure Map ──────────────────────────────────────────────────────────────

/**
 * Format evolutionary pressure map.
 *
 * @example
 * formatPressureMap(pressures) // => pressure display
 */
export function formatPressureMap(pressures: EvolutionaryPressure[]): string {
  if (pressures.length === 0) return chalk.gray('  No evolutionary pressures detected')

  const typeColors: Record<string, (s: string) => string> = {
    'bug-pressure': chalk.rgb(255, 99, 71),
    'feature-demand': chalk.rgb(100, 149, 237),
    'modernization': chalk.rgb(255, 165, 0),
    'refactor-need': chalk.rgb(255, 215, 0),
    'tech-debt': chalk.rgb(138, 43, 226),
  }

  const lines: string[] = [
    '',
    chalk.bold('  Evolutionary Pressures:'),
    chalk.gray('  ' + '─'.repeat(55)),
  ]

  for (const p of pressures) {
    const color = typeColors[p.type] ?? chalk.white
    const barLen = Math.round(p.strength / 5)
    const bar = '█'.repeat(barLen)
    lines.push(`  ${color(p.type.padEnd(18))} ${bar} ${p.strength}`)
    lines.push(`    ${chalk.gray(p.description)}`)
  }

  return lines.join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format metamorphosis stats.
 *
 * @example
 * formatMetamorphosisStats(stats) // => summary
 */
export function formatMetamorphosisStats(stats: MetamorphosisStats): string {
  const lines: string[] = [
    '',
    chalk.bold('  Statistics:'),
    chalk.gray('  ' + '─'.repeat(55)),
    `  Total Files:          ${stats.totalFiles}`,
    `  Eggs: ${stats.eggCount}  |  Larvae: ${stats.larvaCount}  |  Pupae: ${stats.pupaCount}`,
    `  Chrysalises: ${stats.chrysalisCount}  |  Butterflies: ${chalk.rgb(138, 43, 226)(String(stats.butterflyCount))}  |  Fossils: ${chalk.gray(String(stats.fossilCount))}`,
    `  Avg Maturation:       ${stats.avgMaturation}/100`,
    `  Most Mature:          ${chalk.rgb(138, 43, 226)(stats.mostMature)}`,
    `  Least Mature:         ${chalk.rgb(255, 165, 0)(stats.leastMature)}`,
    `  Most Transformed:     ${stats.mostTransformed}`,
    `  Ecosystem Maturity:   ${stats.ecosystemMaturity}/100`,
    `  Evolutionary Pressure: ${stats.evolutionaryPressure}/100`,
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format metamorphosis recommendations.
 *
 * @example
 * formatMetamorphosisRecommendations(recs) // => list
 */
export function formatMetamorphosisRecommendations(recs: string[]): string {
  if (recs.length === 0) return ''
  const lines: string[] = [
    '',
    chalk.bold('  Recommendations:'),
    chalk.gray('  ' + '─'.repeat(50)),
  ]
  for (const r of recs) {
    lines.push(`  ${chalk.rgb(255, 215, 0)('→')} ${r}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full metamorphosis result as table.
 *
 * @example
 * formatMetamorphosisTable(result) // => complete formatted output
 */
export function formatMetamorphosisTable(result: MetamorphosisResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(100, 149, 237)('\n  Metamorphosis Analysis\n'))
  sections.push(formatLifeCycleDiagram(result.stats))
  sections.push(formatTransformationTable(result.transformations))
  sections.push(formatMaturationTimeline(result.transformations))
  sections.push(formatPressureMap(result.pressures))
  sections.push(formatMetamorphosisStats(result.stats))
  sections.push(formatMetamorphosisRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format metamorphosis result as JSON.
 *
 * @example
 * formatMetamorphosisJson(result) // => '{"transformations":[...],...}'
 */
export function formatMetamorphosisJson(result: MetamorphosisResult): string {
  return JSON.stringify(result, null, 2)
}
