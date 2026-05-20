import chalk from 'chalk'
import type { MetamorphosisStageResult, LifecycleStage, StageTransition, CodebaseMaturity, MetamorphosisStageStats } from './metamorphosis-stage-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────────

function stageColor(s: string): string {
  if (s === 'butterfly') return chalk.green(s)
  if (s === 'chrysalis') return chalk.cyan(s)
  if (s === 'pupa') return chalk.yellow(s)
  if (s === 'larva') return chalk.blue(s)
  if (s === 'egg') return chalk.white(s)
  return chalk.dim(s)
}

function healthColor(h: string): string {
  if (h === 'thriving') return chalk.green(h)
  if (h === 'healthy') return chalk.blue(h)
  if (h === 'stable') return chalk.cyan(h)
  if (h === 'stagnant') return chalk.yellow(h)
  return chalk.red(h)
}

function overallColor(o: string): string {
  if (o === 'mature') return chalk.green(o)
  if (o === 'maturing') return chalk.blue(o)
  if (o === 'growing') return chalk.cyan(o)
  if (o === 'embryonic') return chalk.yellow(o)
  if (o === 'aging') return chalk.rgb(255, 165, 0)(o)
  return chalk.red(o)
}

function effortColor(e: string): string {
  if (e === 'trivial') return chalk.green(e)
  if (e === 'easy') return chalk.blue(e)
  if (e === 'moderate') return chalk.yellow(e)
  return chalk.red(e)
}

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

// ─── Stage Formatting ──────────────────────────────────────────────────────────

function formatStage(ls: LifecycleStage): string {
  const stuck = ls.isStuck ? chalk.red(' ⚠stuck') : ''
  const next = ls.nextStage ? ` → ${stageColor(ls.nextStage)}` : ''
  return `  ${chalk.bold(ls.file)} ${stageColor(ls.stage)} maturity:${scoreColor(ls.maturity)} progress:${scoreColor(ls.stageProgress)} readiness:${scoreColor(ls.readiness)}${next}${stuck}`
}

// ─── Transition Formatting ─────────────────────────────────────────────────────

function formatTransition(t: StageTransition): string {
  const blockers = t.blockers.length > 0 ? ` blockers:${t.blockers.length}` : ''
  return `  ${chalk.bold(t.file)} ${stageColor(t.from)} → ${stageColor(t.to)} readiness:${scoreColor(t.readiness)} effort:${effortColor(t.estimatedEffort)}${blockers}`
}

// ─── Maturity Formatting ───────────────────────────────────────────────────────

function formatMaturity(m: CodebaseMaturity): string {
  const dist = Object.entries(m.stageDistribution)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${stageColor(k)}:${v}`)
    .join(' ')
  return [
    `  Overall: ${overallColor(m.overallStage)} | Health: ${healthColor(m.health)} | Avg Maturity: ${scoreColor(m.avgMaturity)}`,
    `  Distribution: ${dist}`,
    `  Stuck: ${chalk.red(String(m.stuckFiles))} | Ready: ${chalk.green(String(m.readyToTransition))} | Dominant: ${stageColor(m.dominantStage)}`,
  ].join('\n')
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

function formatStats(stats: MetamorphosisStageStats): string {
  return [
    `  Files: ${stats.totalFiles} | Stage: ${stageColor(stats.dominantStage)} dominant | Overall: ${overallColor(stats.overallStage)}`,
    `  ${chalk.white(String(stats.eggCount))} egg | ${chalk.blue(String(stats.larvaCount))} larva | ${chalk.yellow(String(stats.pupaCount))} pupa | ${chalk.cyan(String(stats.chrysalisCount))} chrysalis | ${chalk.green(String(stats.butterflyCount))} butterfly | ${chalk.dim(String(stats.fossilCount))} fossil`,
    `  Stuck: ${chalk.red(String(stats.stuckFiles))} | Ready: ${chalk.green(String(stats.readyForTransition))} | Health: ${healthColor(stats.overallHealth)}`,
    `  Avg Maturity: ${scoreColor(stats.avgMaturity)} | Avg Readiness: ${scoreColor(stats.avgReadiness)} | Completeness: ${scoreColor(stats.lifecycleCompleteness)}% | Velocity: ${scoreColor(stats.transitionVelocity)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────────

/**
 * Format metamorphosis-stage result as a table
 * @example
 * formatMetamorphosisStageTable(result, false) // string
 */
export function formatMetamorphosisStageTable(result: MetamorphosisStageResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🦋 Metamorphosis Stage — Code Lifecycle Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📋 Lifecycle Stages'))
  if (result.stages.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.stages : result.stages.slice(0, 12)
    lines.push(display.map(s => formatStage(s)).join('\n'))
  }
  lines.push('')

  if (result.transitions.length > 0) {
    lines.push(chalk.bold('🔄 Transitions'))
    const display = verbose ? result.transitions : result.transitions.slice(0, 8)
    lines.push(display.map(t => formatTransition(t)).join('\n'))
    lines.push('')
  }

  lines.push(chalk.bold('📊 Codebase Maturity'))
  lines.push(formatMaturity(result.maturity))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────────

/**
 * Format metamorphosis-stage result as JSON
 * @example
 * formatMetamorphosisStageJson(result) // string
 */
export function formatMetamorphosisStageJson(result: MetamorphosisStageResult): string {
  return JSON.stringify(result, null, 2)
}
