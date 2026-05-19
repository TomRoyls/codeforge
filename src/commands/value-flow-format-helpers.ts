import chalk from 'chalk'
import type { ValueFlow, ValueFlowStats, ValueFlowResult, ValueSource, ValueSink, ValueTransform } from './value-flow-helpers.js'

// ─── coverageMeter ────────────────────────────────────────────────────────────

/**
 * Render a coverage meter bar.
 *
 * @example
 * coverageMeter(75) // '█████████████████    75%'
 */
export function coverageMeter(percentage: number): string {
  const width = 20
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = percentage >= 80 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
  return `${color(bar)} ${percentage}%`
}

// ─── formatFlowChain ──────────────────────────────────────────────────────────

/**
 * Format a single flow chain as arrow-separated string.
 *
 * @example
 * formatFlowChain(flow) // 'param:x → y → return:y'
 */
export function formatFlowChain(flow: ValueFlow): string {
  const names = flow.chain.map((step) => step.name)
  const arrow = chalk.gray(' → ')
  const chain = names.join(arrow)
  const badge = flow.isDeadEnd ? chalk.red(' [DEAD-END]') : ''
  return `  ${chain}${badge}`
}

// ─── formatSourcesTable ───────────────────────────────────────────────────────

/**
 * Format sources as a table.
 *
 * @example
 * formatSourcesTable(sources) // tabular string
 */
export function formatSourcesTable(sources: ValueSource[]): string {
  if (sources.length === 0) return '  (no sources)'
  const header = chalk.bold('  Name                 Type        File          Line')
  const sep = chalk.gray('  ' + '─'.repeat(70))
  const rows = sources.slice(0, 20).map((s) =>
    `  ${s.name.padEnd(20)} ${s.type.padEnd(11)} ${s.file.padEnd(13)} ${s.line}`,
  )
  return [header, sep, ...rows].join('\n')
}

// ─── formatSinksTable ─────────────────────────────────────────────────────────

/**
 * Format sinks as a table.
 *
 * @example
 * formatSinksTable(sinks) // tabular string
 */
export function formatSinksTable(sinks: ValueSink[]): string {
  if (sinks.length === 0) return '  (no sinks)'
  const header = chalk.bold('  Name                 Type          File          Line')
  const sep = chalk.gray('  ' + '─'.repeat(70))
  const rows = sinks.slice(0, 20).map((s) =>
    `  ${s.name.padEnd(20)} ${s.type.padEnd(13)} ${s.file.padEnd(13)} ${s.line}`,
  )
  return [header, sep, ...rows].join('\n')
}

// ─── formatTransformsTable ────────────────────────────────────────────────────

/**
 * Format transforms as a table.
 *
 * @example
 * formatTransformsTable(transforms) // tabular string
 */
export function formatTransformsTable(transforms: ValueTransform[]): string {
  if (transforms.length === 0) return '  (no transforms)'
  const header = chalk.bold('  Input        Output       Type            Description')
  const sep = chalk.gray('  ' + '─'.repeat(70))
  const rows = transforms.slice(0, 20).map((t) =>
    `  ${t.input.padEnd(12)} ${t.output.padEnd(12)} ${t.type.padEnd(15)} ${t.description}`,
  )
  return [header, sep, ...rows].join('\n')
}

// ─── formatStats ──────────────────────────────────────────────────────────────

/**
 * Format flow statistics.
 *
 * @example
 * formatStats(stats) // stat lines with coverage meters
 */
export function formatStats(stats: ValueFlowStats): string {
  return [
    `${chalk.bold('Sources:')}              ${stats.totalSources}`,
    `${chalk.bold('Transforms:')}           ${stats.totalTransforms}`,
    `${chalk.bold('Sinks:')}                ${stats.totalSinks}`,
    `${chalk.bold('Dead Ends:')}            ${stats.deadEndCount}`,
    `${chalk.bold('Untraced:')}             ${stats.untracedCount}`,
    `${chalk.bold('Avg Flow Length:')}      ${stats.averageFlowLength}`,
    `${chalk.bold('Longest Flow:')}         ${stats.longestFlow}`,
    `${chalk.bold('Validation:')}           ${coverageMeter(stats.validationCoverage)}`,
    `${chalk.bold('Error Handling:')}       ${coverageMeter(stats.errorHandlingCoverage)}`,
  ].join('\n')
}

// ─── formatRecommendations ────────────────────────────────────────────────────

/**
 * Format recommendations.
 *
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recs: string[]): string {
  return recs.map((r) => `  ${chalk.yellow('•')} ${r}`).join('\n')
}

// ─── formatValueFlowOutput ────────────────────────────────────────────────────

/**
 * Format full value flow result for terminal.
 *
 * @example
 * formatValueFlowOutput(result) // full output string
 */
export function formatValueFlowOutput(result: ValueFlowResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.cyan('\n📊 Flow Statistics'))
  sections.push(formatStats(result.stats))

  if (result.flows.length > 0) {
    sections.push(chalk.bold.cyan('\n🔗 Flow Chains'))
    const chains = result.flows.slice(0, 15).map((f) => formatFlowChain(f))
    sections.push(chains.join('\n'))
  }

  if (result.deadEnds.length > 0) {
    sections.push(chalk.bold.cyan('\n⚠️ Dead-End Values'))
    const deadChains = result.deadEnds.slice(0, 10).map((f) => formatFlowChain(f))
    sections.push(deadChains.join('\n'))
  }

  if (result.untraced.length > 0) {
    sections.push(chalk.bold.cyan('\n🔍 Untraced Values (no validation)'))
    const untracedChains = result.untraced.slice(0, 10).map((f) => formatFlowChain(f))
    sections.push(untracedChains.join('\n'))
  }

  if (result.sources.length > 0) {
    sections.push(chalk.bold.cyan('\n📍 Sources'))
    sections.push(formatSourcesTable(result.sources))
  }

  if (result.sinks.length > 0) {
    sections.push(chalk.bold.cyan('\n🏁 Sinks'))
    sections.push(formatSinksTable(result.sinks))
  }

  sections.push(chalk.bold.cyan('\n💡 Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── formatValueFlowJson ──────────────────────────────────────────────────────

/**
 * Format value flow result as JSON.
 *
 * @example
 * formatValueFlowJson(result) // JSON string
 */
export function formatValueFlowJson(result: ValueFlowResult): string {
  const serializable = {
    stats: result.stats,
    sources: result.sources.length,
    transforms: result.transforms.length,
    sinks: result.sinks.length,
    deadEnds: result.deadEnds.map((d) => ({
      source: d.source.name, length: d.length,
    })),
    untraced: result.untraced.map((u) => ({
      source: u.source.name, sink: u.sink?.name,
    })),
    flows: result.flows.map((f) => ({
      chain: f.chain.map((s) => s.name),
      deadEnd: f.isDeadEnd, validation: f.hasValidation,
    })),
    recommendations: result.recommendations,
  }
  return JSON.stringify(serializable, null, 2)
}
