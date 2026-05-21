import chalk from 'chalk'
import type { CatapultResult, Projectile, SiegeEngine } from './catapult-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function readinessColor(r: string): string {
  switch (r) {
    case 'go': return chalk.green(r)
    case 'go-with-caution': return chalk.yellow(r)
    case 'hold': return chalk.rgb(255, 165, 0)(r)
    case 'abort': return chalk.red(r)
    case 'scrub': return chalk.rgb(139, 0, 0)(r)
    default: return chalk.dim(r)
  }
}

function payloadColor(t: string): string {
  switch (t) {
    case 'boulder': return chalk.rgb(160, 120, 60)(t)
    case 'fireball': return chalk.rgb(255, 100, 0)(t)
    case 'grapeshot': return chalk.magenta(t)
    case 'bolt': return chalk.cyan(t)
    case 'dart': return chalk.blue(t)
    case 'dust': return chalk.gray(t)
    default: return chalk.dim(t)
  }
}

function weightColor(w: string): string {
  switch (w) {
    case 'featherweight': return chalk.green(w)
    case 'lightweight': return chalk.blue(w)
    case 'middleweight': return chalk.yellow(w)
    case 'heavyweight': return chalk.rgb(255, 165, 0)(w)
    case 'super-heavy': return chalk.red(w)
    case 'overloaded': return chalk.rgb(139, 0, 0)(w)
    default: return chalk.dim(w)
  }
}

function engineCondColor(c: string): string {
  switch (c) {
    case 'battle-ready': return chalk.rgb(255, 215, 0)(c)
    case 'ready': return chalk.green(c)
    case 'standing-by': return chalk.blue(c)
    case 'needs-repair': return chalk.rgb(255, 165, 0)(c)
    case 'broken': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'field-marshal': return chalk.rgb(255, 215, 0)(g)
    case 'general': return chalk.green(g)
    case 'colonel': return chalk.blue(g)
    case 'captain': return chalk.yellow(g)
    case 'sergeant': return chalk.rgb(255, 165, 0)(g)
    case 'private': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

function windowColor(w: string): string {
  switch (w) {
    case 'now': return chalk.green(w)
    case 'soon': return chalk.blue(w)
    case 'delayed': return chalk.yellow(w)
    case 'indefinitely': return chalk.rgb(255, 165, 0)(w)
    case 'never': return chalk.red(w)
    default: return chalk.dim(w)
  }
}

// ─── Projectile Formatting ───────────────────────────────────────────────────

function formatProjectile(p: Projectile, verbose: boolean): string {
  const line = ` ${readinessColor(p.launchReadiness)} ${payloadColor(p.payloadType)} ${chalk.bold(p.file)} quality:${scoreColor(p.qualityScore)} weight:${weightColor(p.weightClass)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    struct:${scoreColor(p.structuralIntegrity)} aero:${scoreColor(p.aerodynamics)} impact:${scoreColor(p.impactForce)} stable:${scoreColor(p.stability)} arm:${scoreColor(p.armTension.buildHealth)} angle:${scoreColor(p.launchAngle.architectureAlignment)}`)
  return details.join('\n')
}

// ─── Siege Engine Formatting ─────────────────────────────────────────────────

function formatSiegeEngine(e: SiegeEngine, verbose: boolean): string {
  const line = `  ${chalk.bold(e.directory)} ${engineCondColor(e.condition)} ${chalk.cyan(e.engineType)} health:${scoreColor(e.engineHealth)} proj:${e.projectiles.length}`

  if (!verbose) return line
  const details = [line]
  details.push(`    ready:${e.readyCount} hold:${e.holdCount} abort:${e.abortCount} cracks:${e.totalCracks} weak:${e.totalWeakSpots} struct:${scoreColor(e.avgStructuralIntegrity)}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format catapult result as a table
 * @example
 * formatCatapultTable(result, false) // string
 */
export function formatCatapultTable(result: CatapultResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🏹 Catapult - Deployment Readiness Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🎯 Projectiles'))
  if (result.projectiles.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.projectiles : result.projectiles.slice(0, 15)
    for (const p of display) {
      lines.push(formatProjectile(p, verbose))
    }
    if (!verbose && result.projectiles.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.projectiles.length - 15} more`))
    }
  }
  lines.push('')

  if (result.engines.length > 0) {
    lines.push(chalk.bold('⚙️ Siege Engines'))
    for (const e of result.engines) {
      lines.push(formatSiegeEngine(e, verbose))
    }
    lines.push('')
  }

  const lp = result.launchPad
  lines.push(chalk.bold('🚀 Launch Pad'))
  lines.push(`  Readiness: ${scoreColor(lp.overallReadiness)} | Window: ${windowColor(lp.launchWindow)} | Clear: ${lp.isClearForLaunch ? chalk.green('YES') : chalk.red('NO')}`)
  lines.push(`  Go:${lp.goCount} Hold:${lp.holdCount} Abort:${lp.abortCount} Arm:${scoreColor(lp.avgArmTension)} Angle:${scoreColor(lp.avgLaunchAngle)} Struct:${scoreColor(lp.avgStructuralIntegrity)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.commanderGrade)} | Files: ${s.totalFiles} | Engines: ${s.totalEngines}`)
  lines.push(`  Weight:${scoreColor(s.avgPayloadWeight)} Struct:${scoreColor(s.avgStructuralIntegrity)} Aero:${scoreColor(s.avgAerodynamics)} Stable:${scoreColor(s.avgStability)} Readiness:${scoreColor(s.avgReadinessScore)}`)
  lines.push(`  Go:${s.goCount} Caution:${s.goWithCautionCount} Hold:${s.holdCount} Abort:${s.abortCount} Scrub:${s.scrubCount}`)
  lines.push(`  Tests:${s.hasTests} Docs:${s.hasDocs} Types:${s.hasTypes} Cracks:${s.totalCracks} WeakSpots:${s.totalWeakSpots} Overloaded:${s.overloadedCount}`)
  lines.push(`  Best: ${chalk.green(s.bestProjectile)} | Worst: ${chalk.red(s.worstProjectile)} | Heaviest: ${chalk.rgb(255, 165, 0)(s.heaviestPayload)}`)

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

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format catapult result as JSON
 * @example
 * formatCatapultJson(result) // string
 */
export function formatCatapultJson(result: CatapultResult): string {
  return JSON.stringify(result, null, 2)
}
