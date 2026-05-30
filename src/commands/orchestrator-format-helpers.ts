import chalk from 'chalk'

import type {
  OrchestratorFunction,
  OrchestrationLayer,
  OrchestrationPattern,
  OrchestratorResult,
  OrchestratorStats,
  FunctionType,
  PatternType,
} from './orchestrator-helpers.js'

// ─── Badges ───────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<FunctionType, (s: string) => string> = {
  orchestrator: (s) => chalk.rgb(255, 165, 0)(s),
  worker: (s) => chalk.rgb(100, 200, 100)(s),
  pipeline: (s) => chalk.rgb(100, 180, 255)(s),
  adapter: (s) => chalk.rgb(200, 150, 255)(s),
  hybrid: (s) => chalk.rgb(200, 200, 200)(s),
}

/**
 * Format a function type badge with color.
 *
 * @example
 * functionTypeBadge('orchestrator')
 * // => '\x1b[38;2;255;165;0mORCH\x1b[39m'
 */
export function functionTypeBadge(type: FunctionType): string {
  const labels: Record<FunctionType, string> = {
    orchestrator: 'ORCH',
    worker: 'WORK',
    pipeline: 'PIPE',
    adapter: 'ADPT',
    hybrid: 'HYBR',
  }
  return TYPE_COLORS[type](labels[type])
}

const PATTERN_LABELS: Record<PatternType, string> = {
  sequential: 'SEQ ',
  parallel: 'PARA',
  conditional: 'COND',
  recursive: 'RECR',
  'event-driven': 'EVNT',
  'middleware-chain': 'MDLW',
  pipeline: 'PIPE',
}

/**
 * Format a pattern type badge.
 *
 * @example
 * patternTypeBadge('parallel')
 * // => 'PARA'
 */
export function patternTypeBadge(type: PatternType): string {
  return chalk.rgb(150, 220, 255)(PATTERN_LABELS[type])
}

// ─── Coverage meter ───────────────────────────────────────────────────────────

/**
 * Render an ASCII purity meter.
 *
 * @example
 * purityMeter(0.8)
 * // => '████████░░ 80%'
 */
export function purityMeter(ratio: number): string {
  const pct = Math.round(ratio * 100)
  const filled = Math.round(pct / 10)
  const empty = 10 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return `${bar} ${pct}%`
}

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Format the function classification table.
 *
 * @example
 * formatFunctionTable(fns)
 */
export function formatFunctionTable(functions: OrchestratorFunction[]): string {
  if (functions.length === 0) return chalk.dim('  (no functions detected)')

  const rows = functions.map((fn) => {
    const badge = functionTypeBadge(fn.type)
    const purity = fn.isPure ? chalk.green('pure') : chalk.yellow('side')
    return `  ${chalk.dim(fn.file + ':' + fn.line)} ${chalk.bold(fn.name.padEnd(20))} ${badge.padEnd(6)} calls:${String(fn.callsCount).padStart(3)} calledBy:${String(fn.calledByCount).padStart(3)} ${purity} complexity:${String(fn.complexity).padStart(2)}`
  })

  return rows.join('\n')
}

/**
 * Format the patterns summary table.
 *
 * @example
 * formatPatternsTable(patterns)
 */
export function formatPatternsTable(patterns: OrchestrationPattern[]): string {
  if (patterns.length === 0) return chalk.dim('  (no patterns detected)')

  const rows = patterns.map((p) => {
    const badge = patternTypeBadge(p.type)
    return `  ${badge} ${chalk.dim(p.file + ':' + p.line)} ${p.description}`
  })

  return rows.join('\n')
}

/**
 * Format the orchestration layers visualization.
 *
 * @example
 * formatLayersTable(layers)
 */
export function formatLayersTable(layers: OrchestrationLayer[]): string {
  if (layers.length === 0) return chalk.dim('  (no layers)')

  const rows = layers.map((layer, i) => {
    const indent = '  ' + '  '.repeat(i)
    const arrow = i === 0 ? '►' : '▼'
    const count = layer.functions.length
    const avgCalls = layer.averageCalls.toFixed(1)
    return `${indent}${arrow} ${chalk.bold(layer.name)} (${count} fn, avg ${avgCalls} calls)`
  })

  return rows.join('\n')
}

// ─── Stats formatting ─────────────────────────────────────────────────────────

/**
 * Format the statistics summary.
 *
 * @example
 * formatOrchestratorStats(stats)
 */
export function formatOrchestratorStats(stats: OrchestratorStats): string {
  const lines = [
    chalk.bold('  Total Functions:        ') + String(stats.totalFunctions),
    chalk.bold('  Orchestrators:          ') + chalk.rgb(255, 165, 0)(String(stats.orchestrators)),
    chalk.bold('  Workers:                ') + chalk.rgb(100, 200, 100)(String(stats.workers)),
    chalk.bold('  Pipelines:              ') + chalk.rgb(100, 180, 255)(String(stats.pipelines)),
    chalk.bold('  Pure Functions:         ') + chalk.green(String(stats.pureFunctions)),
    chalk.bold('  Side-effect Functions:  ') + chalk.yellow(String(stats.sideEffectFunctions)),
    chalk.bold('  Max Orchestration Depth:') + String(stats.maxOrchestrationDepth),
    chalk.bold('  Avg Calls/Function:     ') + String(stats.averageCallsPerFunction),
  ]
  return lines.join('\n')
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Format recommendations as a bullet list.
 *
 * @example
 * formatOrchestratorRecommendations(['Split foo'])
 */
export function formatOrchestratorRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('  (no recommendations)')
  return recommendations.map((r) => `  ${chalk.cyan('→')} ${r}`).join('\n')
}

// ─── Hot orchestrator warnings ────────────────────────────────────────────────

/**
 * Format hot orchestrator warnings.
 *
 * @example
 * formatHotOrchestrators(hotOrchestrators)
 */
export function formatHotOrchestrators(hot: OrchestratorFunction[]): string {
  if (hot.length === 0) return chalk.dim('  (no hot orchestrators)')
  return hot.map((h) => {
    const calls = chalk.red(String(h.callsCount) + ' calls')
    return `  ${chalk.rgb(255, 165, 0)('⚠')} ${chalk.bold(h.name)} — ${calls}, complexity ${h.complexity} in ${h.file}:${h.line}`
  }).join('\n')
}

// ─── Isolated worker alerts ───────────────────────────────────────────────────

/**
 * Format isolated worker alerts.
 *
 * @example
 * formatIsolatedWorkers(workers)
 */
export function formatIsolatedWorkers(workers: OrchestratorFunction[]): string {
  if (workers.length === 0) return chalk.dim('  (no isolated workers)')
  return workers.map((w) => {
    return `  ${chalk.yellow('◆')} ${w.name} — never called, in ${w.file}:${w.line}`
  }).join('\n')
}

// ─── Full output ──────────────────────────────────────────────────────────────

/**
 * Format the full console output.
 *
 * @example
 * formatOrchestratorOutput(result)
 */
export function formatOrchestratorOutput(result: OrchestratorResult): string {
  const sections: string[] = []

  sections.push(chalk.bold.rgb(150, 220, 255)('\n╔═ Orchestration Statistics ═════════════════════════════╗'))
  sections.push(formatOrchestratorStats(result.stats))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Function Classification ══════════════════════════════╗'))
  sections.push(formatFunctionTable(result.functions))
  sections.push('')

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Orchestration Layers ═════════════════════════════════╗'))
  sections.push(formatLayersTable(result.layers))
  sections.push('')

  if (result.patterns.length > 0) {
    sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Detected Patterns ════════════════════════════════════╗'))
    sections.push(formatPatternsTable(result.patterns))
    sections.push('')
  }

  if (result.hotOrchestrators.length > 0) {
    sections.push(chalk.bold.rgb(255, 100, 100)('╔═ Hot Orchestrators ════════════════════════════════════╗'))
    sections.push(formatHotOrchestrators(result.hotOrchestrators))
    sections.push('')
  }

  if (result.isolatedWorkers.length > 0) {
    sections.push(chalk.bold.rgb(255, 200, 100)('╔═ Isolated Workers ═════════════════════════════════════╗'))
    sections.push(formatIsolatedWorkers(result.isolatedWorkers))
    sections.push('')
  }

  sections.push(chalk.bold.rgb(150, 220, 255)('╔═ Recommendations ══════════════════════════════════════╗'))
  sections.push(formatOrchestratorRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * Format the result as JSON.
 *
 * @example
 * formatOrchestratorJson(result)
 */
export function formatOrchestratorJson(result: OrchestratorResult): string {
  return JSON.stringify(result, null, 2)
}
