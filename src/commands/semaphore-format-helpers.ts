import chalk from 'chalk'
import type { SemaphoreResult, Signal, Channel, SignalTower, DeadChannel, SemaphoreStats } from './semaphore-helpers.js'

// ─── Color Utilities ───────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function signalTypeColor(t: string): string {
  if (t === 'export') return chalk.green(t)
  if (t === 'import') return chalk.blue(t)
  if (t === 'call') return chalk.cyan(t)
  if (t === 'event') return chalk.magenta(t)
  if (t === 'callback') return chalk.yellow(t)
  if (t === 'shared-state') return chalk.red(t)
  return chalk.rgb(180, 180, 255)(t)
}

function channelQualityColor(q: string): string {
  if (q === 'clear') return chalk.green(q)
  if (q === 'acceptable') return chalk.blue(q)
  if (q === 'noisy') return chalk.yellow(q)
  if (q === 'degraded') return chalk.rgb(255, 165, 0)(q)
  return chalk.red(q)
}

function clarityColor(c: string): string {
  if (c === 'crystal-clear') return chalk.cyan(c)
  if (c === 'clear') return chalk.green(c)
  if (c === 'static') return chalk.yellow(c)
  if (c === 'noisy') return chalk.rgb(255, 165, 0)(c)
  return chalk.red(c)
}

function deadReasonColor(r: string): string {
  if (r === 'unused-export') return chalk.yellow(r)
  if (r === 'deprecated-api') return chalk.red(r)
  if (r === 'dead-code-path') return chalk.magenta(r)
  return chalk.dim(r)
}

// ─── Signal Formatting ─────────────────────────────────────────────────────

function formatSignal(s: Signal): string {
  const noisy = s.isNoisy ? chalk.red(' [noisy]') : ''
  const lossy = s.isLossy ? chalk.yellow(' [lossy]') : ''
  const broken = s.isBroken ? chalk.red(' [broken]') : ''
  return `  ${chalk.dim(s.from)} -> ${chalk.dim(s.to)} ${signalTypeColor(s.type)} cl:${scoreColor(s.clarity)} str:${scoreColor(s.strength)}${noisy}${lossy}${broken}`
}

// ─── Channel Formatting ────────────────────────────────────────────────────

function formatChannel(c: Channel): string {
  return `  ${chalk.dim(c.path)} ${channelQualityColor(c.quality)} bw:${c.bandwidth} lat:${c.latency} rel:${scoreColor(c.reliability)}`
}

// ─── Tower Formatting ──────────────────────────────────────────────────────

function formatTower(t: SignalTower): string {
  const relay = t.isRelay ? chalk.blue(' [relay]') : ''
  const bcast = t.isBroadcaster ? chalk.green(' [broadcaster]') : ''
  const recv = t.isReceiver ? chalk.yellow(' [receiver]') : ''
  return `  ${chalk.bold(t.file)} out:${t.outgoingSignals} in:${t.incomingSignals} cl:${scoreColor(t.clarity)} noise:${scoreColor(t.noiseLevel)}${relay}${bcast}${recv}`
}

// ─── Dead Channel Formatting ───────────────────────────────────────────────

function formatDeadChannel(d: DeadChannel): string {
  return `  ${chalk.dim(d.from)} -> ${chalk.dim(d.to)} ${deadReasonColor(d.reason)} ${chalk.dim(d.description)}`
}

// ─── Stats Formatting ──────────────────────────────────────────────────────

function formatStats(stats: SemaphoreStats): string {
  return [
    `  Overall: ${clarityColor(stats.overallClarity)} | SNR: ${scoreColor(stats.signalToNoiseRatio)} | Reliability: ${scoreColor(stats.channelReliability)} | Efficiency: ${scoreColor(stats.communicationEfficiency)}`,
    `  Signals: ${stats.totalSignals} (Clear: ${chalk.green(String(stats.clearSignals))} Noisy: ${chalk.yellow(String(stats.noisySignals))} Lossy: ${chalk.rgb(255, 165, 0)(String(stats.lossySignals))} Broken: ${chalk.red(String(stats.brokenSignals))})`,
    `  Channels: ${stats.totalChannels} (Clear: ${chalk.green(String(stats.clearChannels))} Degraded: ${chalk.yellow(String(stats.degradedChannels))} Broken: ${chalk.red(String(stats.brokenChannels))})`,
    `  Towers: ${stats.totalTowers} (Broadcasters: ${stats.broadcasters} Receivers: ${stats.receivers} Relays: ${stats.relays})`,
    `  Dead Channels: ${stats.totalDeadChannels} | Avg Clarity: ${scoreColor(stats.avgClarity)} | Avg Strength: ${scoreColor(stats.avgStrength)} | Avg Noise: ${scoreColor(100 - stats.avgNoiseLevel)}`,
  ].join('\n')
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/**
 * Format semaphore result as a table
 * @example
 * formatSemaphoreTable(result, false) // string
 */
export function formatSemaphoreTable(result: SemaphoreResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🚦 Semaphore - Code Communication Analysis\n'))
  lines.push(chalk.bold('═'.repeat(50)))
  lines.push('')

  lines.push(chalk.bold('📡 Signals'))
  if (result.signals.length === 0) {
    lines.push(chalk.dim('  No signals detected.'))
  } else {
    const display = verbose ? result.signals : result.signals.slice(0, 20)
    for (const s of display) {
      lines.push(formatSignal(s))
    }
    if (!verbose && result.signals.length > 20) {
      lines.push(chalk.dim(`  ... and ${result.signals.length - 20} more`))
    }
  }
  lines.push('')

  if (result.channels.length > 0) {
    lines.push(chalk.bold(' Canal Channels'))
    const display = verbose ? result.channels : result.channels.slice(0, 10)
    for (const c of display) {
      lines.push(formatChannel(c))
    }
    if (!verbose && result.channels.length > 10) {
      lines.push(chalk.dim(`  ... and ${result.channels.length - 10} more`))
    }
    lines.push('')
  }

  if (result.towers.length > 0) {
    lines.push(chalk.bold('🗼 Signal Towers'))
    const display = verbose ? result.towers : result.towers.slice(0, 10)
    for (const t of display) {
      lines.push(formatTower(t))
    }
    if (!verbose && result.towers.length > 10) {
      lines.push(chalk.dim(`  ... and ${result.towers.length - 10} more`))
    }
    lines.push('')
  }

  if (result.deadChannels.length > 0) {
    lines.push(chalk.bold('💀 Dead Channels'))
    for (const d of result.deadChannels) {
      lines.push(formatDeadChannel(d))
    }
    lines.push('')
  }

  lines.push(chalk.bold('📊 Statistics'))
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

// ─── JSON Formatter ────────────────────────────────────────────────────────

/**
 * Format semaphore result as JSON
 * @example
 * formatSemaphoreJson(result) // string
 */
export function formatSemaphoreJson(result: SemaphoreResult): string {
  return JSON.stringify(result, null, 2)
}
