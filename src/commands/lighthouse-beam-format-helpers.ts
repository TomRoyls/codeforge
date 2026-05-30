import chalk from 'chalk'
import type { BeaconSignal, LighthouseBeamResult } from './lighthouse-beam-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'brilliant': return chalk.rgb(255, 215, 0)(c)
    case 'bright': return chalk.green(c)
    case 'adequate': return chalk.blue(c)
    case 'dim': return chalk.yellow(c)
    case 'dark': return chalk.rgb(255, 165, 0)(c)
    case 'extinguished': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function coastColor(c: string): string {
  switch (c) {
    case 'well-lit-coast': return chalk.rgb(255, 215, 0)(c)
    case 'navigable': return chalk.green(c)
    case 'partial-coverage': return chalk.blue(c)
    case 'dark-stretch': return chalk.yellow(c)
    case 'blackout': return chalk.rgb(255, 165, 0)(c)
    case 'shipwreck-coast': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'head-keeper': return chalk.rgb(255, 215, 0)(g)
    case 'lighthouse-keeper': return chalk.green(g)
    case 'watchman': return chalk.blue(g)
    case 'sailor': return chalk.cyan(g)
    case 'castaway': return chalk.yellow(g)
    case 'lost-at-sea': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Beacon Formatting ────────────────────────────────────────────────────────

function formatBeacon(b: BeaconSignal, verbose: boolean): string {
  const line = ` ${conditionColor(b.condition)} ${chalk.bold(b.file)} beam:${scoreColor(b.beamIntensity)} fog:${scoreColor(b.fogPenetration)} vis:${scoreColor(b.visibility.avgVisibility)} rel:${scoreColor(b.beaconReliability)}`

  if (!verbose) return line
  const details = [line]
  details.push(`    lens:${b.lens.type} sweep:${scoreColor(b.sweepRange)} reach:${scoreColor(b.reachDistance)} fresnel:${scoreColor(b.fresnelQuality)} deadZones:${b.beam.deadZoneCount}`)
  details.push(`    visibility: shore=${b.visibility.fromShore} sea=${b.visibility.fromSea} dark=${b.visibility.inDarkness} storm=${b.visibility.inStorm}`)
  return details.join('\n')
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format lighthouse beam result as a table
 * @example
 * formatLighthouseBeamTable(result, false) // string
 */
export function formatLighthouseBeamTable(result: LighthouseBeamResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔦 Lighthouse Beam - Code Visibility/Guidance Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('📡 Beacons'))
  if (result.beacons.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.beacons : result.beacons.slice(0, 15)
    for (const b of display) {
      lines.push(formatBeacon(b, verbose))
    }
    if (!verbose && result.beacons.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.beacons.length - 15} more`))
    }
  }
  lines.push('')

  if (result.coastlines.length > 0) {
    lines.push(chalk.bold('🏖️ Coastlines'))
    for (const cl of result.coastlines) {
      lines.push(`  ${chalk.bold(cl.directory)} ${coastColor(cl.condition)} beam:${scoreColor(cl.avgBeamIntensity)} safety:${scoreColor(cl.coastlineSafety)} beacons:${cl.beacons.length} gaps:${cl.coverageGaps}`)
    }
    lines.push('')
  }

  const cg = result.coastguard
  lines.push(chalk.bold('🚢 Coastguard'))
  lines.push(`  Beam:${scoreColor(cg.avgBeamIntensity)} Fog:${scoreColor(cg.avgFogPenetration)} Visibility:${scoreColor(cg.overallVisibility)} Gaps:${cg.coverageGaps} DeadZones:${cg.deadZones} Safe:${cg.isSafeToNavigate ? chalk.green('YES') : chalk.red('NO')}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.keeperGrade)} | Visibility: ${scoreColor(s.overallVisibility)} | Files: ${s.totalFiles} | Coastlines: ${s.totalCoastlines}`)
  lines.push(`  Brilliant:${s.brilliantCount} Adequate:${s.adequateCount} Dim:${s.dimCount} Dark:${s.darkCount} Extinguished:${s.extinguishedCount}`)
  lines.push(`  EntryPoints:${s.hasEntryPoint} NavAids:${s.hasNavigationAids} Warnings:${s.hasWarningSignals} Examples:${s.hasExamples}`)
  lines.push(`  Fresnel:${s.fresnelLenses} NoLens:${s.noLenses} FogNavigable:${s.navigableInFog} Maintained:${s.isMaintained}`)
  lines.push(`  Brightest:${chalk.green(s.brightestBeacon)} | Darkest:${chalk.red(s.darkestBeacon)} | BestPen:${chalk.cyan(s.bestPenetration)} | MostReliable:${chalk.blue(s.mostReliable)}`)

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
 * Format lighthouse beam result as JSON
 * @example
 * formatLighthouseBeamJson(result) // string
 */
export function formatLighthouseBeamJson(result: LighthouseBeamResult): string {
  return JSON.stringify(result, null, 2)
}
