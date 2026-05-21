import chalk from 'chalk'
import type { SilkThread, WebCluster, SpiderWebResult } from './spider-web-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'masterpiece-web': return chalk.rgb(255, 215, 0)(c)
    case 'strong-web': return chalk.green(c)
    case 'functional-web': return chalk.blue(c)
    case 'patchy-web': return chalk.cyan(c)
    case 'torn-web': return chalk.yellow(c)
    case 'no-web': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function silkTypeColor(t: string): string {
  switch (t) {
    case 'dragline': return chalk.rgb(255, 215, 0)(t)
    case 'framework': return chalk.green(t)
    case 'capture-spiral': return chalk.blue(t)
    case 'guy-line': return chalk.cyan(t)
    case 'egg-sac': return chalk.yellow(t)
    case 'balloon': return chalk.dim(t)
    default: return t
  }
}

function webPatternColor(p: string): string {
  switch (p) {
    case 'orb-web': return chalk.rgb(255, 215, 0)(p)
    case 'sheet-web': return chalk.green(p)
    case 'funnel-web': return chalk.blue(p)
    case 'cobweb': return chalk.yellow(p)
    case 'tarantula-burrow': return chalk.cyan(p)
    case 'no-web': return chalk.red(p)
    default: return p
  }
}

function clusterTypeColor(t: string): string {
  switch (t) {
    case 'garden-spider': return chalk.rgb(255, 215, 0)(t)
    case 'orb-weaver': return chalk.green(t)
    case 'tarantula': return chalk.blue(t)
    case 'jumping-spider': return chalk.cyan(t)
    case 'cobweb': return chalk.yellow(t)
    case 'empty-corner': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-weaver': return chalk.rgb(255, 215, 0)(g)
    case 'expert-weaver': return chalk.green(g)
    case 'weaver': return chalk.blue(g)
    case 'spinner': return chalk.cyan(g)
    case 'hatchling': return chalk.yellow(g)
    case 'fly': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Silk Thread Formatting ───────────────────────────────────────────────────

function formatSilkThread(thread: SilkThread, verbose: boolean): string {
  const line = ` ${conditionColor(thread.condition)} ${chalk.bold(thread.file)} silk:${scoreColor(thread.silkStrength)} geo:${scoreColor(thread.webGeometry)} conn:${thread.threadCount} adh:${scoreColor(thread.adhesiveQuality)} vib:${scoreColor(thread.vibrationSensitivity)} res:${scoreColor(thread.structuralResilience)} score:${scoreColor(thread.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const s = thread.silk
  details.push(`    silk: ${silkTypeColor(s.type)} str:${scoreColor(s.strength)} elast:${scoreColor(s.elasticity)} strong:${s.isStrong ? chalk.green('Y') : chalk.red('N')} fragile:${s.isFragile ? chalk.red('Y') : chalk.dim('N')} sticky:${s.isSticky ? chalk.yellow('Y') : chalk.dim('N')} slippery:${s.isSlippery ? chalk.green('Y') : chalk.dim('N')} diam:${s.diameter}`)
  const w = thread.web
  details.push(`    web: ${webPatternColor(w.pattern)} geo:${scoreColor(w.geometry)} center:${w.hasCenter ? chalk.green('Y') : chalk.red('N')} radii:${w.hasRadii ? chalk.green('Y') : chalk.red('N')} spirals:${w.hasSpirals ? chalk.green('Y') : chalk.red('N')} sym:${w.isSymmetric ? chalk.green('Y') : chalk.red('N')} r:${w.radiusCount} s:${w.spiralCount}`)
  const c = thread.connections
  details.push(`    conn: in:${c.inbound} out:${c.outbound} circ:${c.hasCircular ? chalk.red('Y') : chalk.dim('N')} dang:${c.hasDangling ? chalk.yellow(String(c.danglingCount)) : 0}`)
  const a = thread.adhesive
  details.push(`    adhesive: qual:${scoreColor(a.quality)} strong:${a.hasStrongInterface ? chalk.green('Y') : chalk.red('N')} weak:${a.hasWeakInterface ? chalk.red('Y') : chalk.dim('N')} nonstick:${a.hasNonStick ? chalk.green('Y') : chalk.dim('N')}`)
  const v = thread.vibration
  details.push(`    vibration: sens:${scoreColor(v.sensitivity)} propagate:${v.hasHighPropagation ? chalk.red('Y') : chalk.dim('N')} isolate:${v.hasIsolation ? chalk.green('Y') : chalk.dim('N')} dampen:${v.hasDampening ? chalk.green('Y') : chalk.dim('N')} paths:${v.propagationPaths}`)
  const r = thread.resilience
  details.push(`    resilience: repair:${r.canRepair ? chalk.green('Y') : chalk.red('N')} backup:${r.hasBackup ? chalk.green('Y') : chalk.red('N')} robust:${r.isRobust ? chalk.green('Y') : chalk.red('N')} diff:${r.repairDifficulty} score:${scoreColor(r.resilienceScore)}`)
  const sp = thread.spider
  details.push(`    spider: arch:${sp.isArchitect ? chalk.green('Y') : chalk.dim('N')} weave:${sp.isWeaver ? chalk.green('Y') : chalk.dim('N')} hunt:${sp.isHunter ? chalk.green('Y') : chalk.dim('N')} dwell:${sp.isDweller ? chalk.yellow('Y') : chalk.dim('N')} prod:${scoreColor(sp.silkProduction)} maint:${scoreColor(sp.webMaintenance)}`)
  return details.join('\n')
}

// ─── Web Cluster Formatting ───────────────────────────────────────────────────

function formatWebCluster(cluster: WebCluster): string {
  return `  ${chalk.bold(cluster.directory)} ${clusterTypeColor(cluster.clusterType)} silk:${scoreColor(cluster.avgSilkStrength)} res:${scoreColor(cluster.avgResilience)} vib:${scoreColor(cluster.avgVibration)} master:${cluster.masterpieceCount} torn:${cluster.tornCount} circ:${cluster.circularDepCount} conn:${cluster.totalConnections}`
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format spider-web result as table
 * @example
 * formatSpiderWebTable(result, false) // string
 */
export function formatSpiderWebTable(result: SpiderWebResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🕸️  Spider Web - Code Interconnection/Dependency Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🧵 Silk Threads'))
  if (result.threads.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.threads : result.threads.slice(0, 15)
    for (const thread of display) {
      lines.push(formatSilkThread(thread, verbose))
    }
    if (!verbose && result.threads.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.threads.length - 15} more`))
    }
  }
  lines.push('')

  if (result.clusters.length > 0) {
    lines.push(chalk.bold('🕸️ Web Clusters'))
    for (const cluster of result.clusters) {
      lines.push(formatWebCluster(cluster))
    }
    lines.push('')
  }

  const col = result.colony
  lines.push(chalk.bold('🐜 Colony'))
  lines.push(`  Silk:${scoreColor(col.avgSilkStrength)} Resilience:${scoreColor(col.avgResilience)} Vibration:${scoreColor(col.avgVibration)} Connections:${col.totalConnections} CircDeps:${col.circularDependencies} Robust:${col.isRobust ? chalk.green('YES') : chalk.red('NO')} Strength:${scoreColor(col.overallStrength)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.weaverGrade)} | Strength: ${scoreColor(s.overallStrength)} | Files: ${s.totalFiles} | Clusters: ${s.totalClusters}`)
  lines.push(`  Masterpiece:${s.masterpieceWebCount} Strong:${s.strongWebCount} Functional:${s.functionalWebCount} Patchy:${s.patchyWebCount} Torn:${s.tornWebCount} NoWeb:${s.noWebCount}`)
  lines.push(`  Orb:${s.orbWebCount} Sheet:${s.sheetWebCount} Funnel:${s.funnelWebCount} Cobweb:${s.cobwebCount} CircDeps:${s.circularDepCount} Dangling:${s.danglingDepCount}`)
  lines.push(`  Isolated:${s.hasIsolationCount} Dampened:${s.hasDampeningCount} Repairable:${s.canRepairCount} Robust:${s.isRobustCount} Architects:${s.architectCount} Weavers:${s.weaverCount}`)
  lines.push(`  Strongest:${chalk.green(s.strongestThread)} | Connected:${chalk.blue(s.mostConnected)} | Resilient:${chalk.magenta(s.mostResilient)} | Vulnerable:${chalk.red(s.mostVulnerable)} | Tangled:${chalk.yellow(s.mostTangled)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ───────────────────────────────────────────────────────────

/**
 * Format spider-web result as JSON
 * @example
 * formatSpiderWebJson(result) // string
 */
export function formatSpiderWebJson(result: SpiderWebResult): string {
  return JSON.stringify(result, null, 2)
}
