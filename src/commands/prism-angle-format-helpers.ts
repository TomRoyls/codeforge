import chalk from 'chalk'
import type { LightRay, OpticalBench, PrismAngleResult } from './prism-angle-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'flawless-diamond': return chalk.rgb(255, 215, 0)(c)
    case 'clear-crystal': return chalk.green(c)
    case 'good-glass': return chalk.blue(c)
    case 'cloudy': return chalk.cyan(c)
    case 'frosted': return chalk.yellow(c)
    case 'opaque': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function materialColor(m: string): string {
  switch (m) {
    case 'diamond': return chalk.rgb(255, 215, 0)(m)
    case 'crystal': return chalk.green(m)
    case 'glass': return chalk.blue(m)
    case 'quartz': return chalk.cyan(m)
    case 'plastic': return chalk.yellow(m)
    case 'ice': return chalk.dim(m)
    default: return m
  }
}

function benchTypeColor(t: string): string {
  switch (t) {
    case 'laboratory': return chalk.rgb(255, 215, 0)(t)
    case 'workshop': return chalk.green(t)
    case 'classroom': return chalk.blue(t)
    case 'toy-store': return chalk.cyan(t)
    case 'junk-shop': return chalk.yellow(t)
    case 'darkroom': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'master-optician': return chalk.rgb(255, 215, 0)(g)
    case 'optician': return chalk.green(g)
    case 'glassblower': return chalk.blue(g)
    case 'lens-grinder': return chalk.cyan(g)
    case 'apprentice': return chalk.yellow(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Light Ray Formatting ─────────────────────────────────────────────────────

function formatLightRay(ray: LightRay, verbose: boolean): string {
  const line = ` ${conditionColor(ray.condition)} ${chalk.bold(ray.file)} refr:${scoreColor(ray.refractionQuality)} disp:${scoreColor(ray.dispersion)} ang:${scoreColor(ray.angularAccuracy)} spec:${scoreColor(ray.spectralCompleteness)} clar:${scoreColor(ray.opticalClarity)} aber:${scoreColor(ray.chromaticAberration)} score:${scoreColor(ray.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const p = ray.prism
  details.push(`    prism: ${materialColor(p.material)} clar:${scoreColor(p.clarity)} flawless:${p.isFlawless ? chalk.green('Y') : chalk.red('N')} inclusions:${p.hasInclusions ? chalk.yellow('Y') : chalk.dim('N')} bubbles:${p.hasBubbles ? chalk.yellow('Y') : chalk.dim('N')} scratches:${p.hasScratches ? chalk.yellow('Y') : chalk.dim('N')}`)
  const s = ray.spectrum
  details.push(`    spectrum: colors:${s.colors.length} complete:${s.isComplete ? chalk.green('Y') : chalk.red('N')} uv:${s.hasUltraviolet ? chalk.yellow('Y') : chalk.dim('N')} ir:${s.hasInfrared ? chalk.yellow('Y') : chalk.dim('N')} missing:${s.missingColors.length}`)
  const r = ray.refraction
  details.push(`    refraction: idx:${scoreColor(r.index)} consistent:${r.isConsistent ? chalk.green('Y') : chalk.red('N')} scatter:${r.hasScattering ? chalk.red('Y') : chalk.dim('N')} absorb:${r.hasAbsorption ? chalk.yellow('Y') : chalk.dim('N')} total-ref:${r.hasTotalReflection ? chalk.red('Y') : chalk.dim('N')}`)
  const a = ray.angle
  details.push(`    angle: inc:${a.incidence} dev:${a.deviation} normal:${a.isNormalIncidence ? chalk.green('Y') : chalk.dim('N')} oblique:${a.isOblique ? chalk.yellow('Y') : chalk.dim('N')} critical:${a.hasCriticalAngle ? chalk.red(String(a.criticalAnglePoints.length)) : 0}`)
  const ab = ray.aberration
  details.push(`    aberration: lat:${scoreColor(ab.lateral)} ax:${scoreColor(ab.axial)} distort:${ab.hasDistortion ? chalk.red('Y') : chalk.dim('N')} curve:${ab.hasCurvature ? chalk.yellow('Y') : chalk.dim('N')} minimal:${ab.isMinimal ? chalk.green('Y') : chalk.dim('N')}`)
  const perspectives = ray.perspectives
  const ps = `    perspectives: u:${scoreColor(perspectives.user.score)} m:${scoreColor(perspectives.maintainer.score)} t:${scoreColor(perspectives.tester.score)} r:${scoreColor(perspectives.reviewer.score)} o:${scoreColor(perspectives.optimizer.score)} n:${scoreColor(perspectives.newcomer.score)}`
  details.push(ps)
  return details.join('\n')
}

// ─── Optical Bench Formatting ─────────────────────────────────────────────────

function formatOpticalBench(bench: OpticalBench): string {
  return `  ${chalk.bold(bench.directory)} ${benchTypeColor(bench.benchType)} refr:${scoreColor(bench.avgRefraction)} clar:${scoreColor(bench.avgClarity)} aber:${scoreColor(bench.avgAberration)} flawless:${bench.flawlessCount} opaque:${bench.opaqueCount} consistent:${bench.consistentCount}`
}

// ─── Table Formatter ──────────────────────────────────────────────────────────

/**
 * Format prism angle result as table
 * @example
 * formatPrismAngleTable(result, false) // string
 */
export function formatPrismAngleTable(result: PrismAngleResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔷  Prism Angle - Code Perspective/Refraction Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔦 Light Rays'))
  if (result.rays.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.rays : result.rays.slice(0, 15)
    for (const ray of display) {
      lines.push(formatLightRay(ray, verbose))
    }
    if (!verbose && result.rays.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.rays.length - 15} more`))
    }
  }
  lines.push('')

  if (result.benches.length > 0) {
    lines.push(chalk.bold('🔬 Optical Benches'))
    for (const bench of result.benches) {
      lines.push(formatOpticalBench(bench))
    }
    lines.push('')
  }

  const lab = result.laboratory
  lines.push(chalk.bold('🏛️ Laboratory'))
  lines.push(`  Refraction:${scoreColor(lab.avgRefraction)} Clarity:${scoreColor(lab.avgClarity)} Aberration:${scoreColor(lab.avgAberration)} Consistent:${lab.isConsistent ? chalk.green('YES') : chalk.red('NO')} Overall:${scoreColor(lab.overallClarity)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.opticianGrade)} | Clarity: ${scoreColor(s.overallClarity)} | Files: ${s.totalFiles} | Benches: ${s.totalBenches}`)
  lines.push(`  Flawless:${s.flawlessDiamondCount} Crystal:${s.clearCrystalCount} Glass:${s.goodGlassCount} Cloudy:${s.cloudyCount} Frosted:${s.frostedCount} Opaque:${s.opaqueCount}`)
  lines.push(`  Diamond:${s.diamondCount} Crystal:${s.crystalCount} Glass:${s.glassCount} Plastic:${s.plasticCount} Ice:${s.iceCount}`)
  lines.push(`  Consistent:${s.consistentCount} Scattering:${s.scatteringCount} Absorption:${s.absorptionCount} UV:${s.hasUltravioletCount} IR:${s.hasInfraredCount}`)
  lines.push(`  Clearest:${chalk.green(s.clearest)} | MostDistorted:${chalk.red(s.mostDistorted)} | MostConsistent:${chalk.blue(s.mostConsistent)} | BestSpectrum:${chalk.magenta(s.bestSpectrum)}`)

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
 * Format prism angle result as JSON
 * @example
 * formatPrismAngleJson(result) // string
 */
export function formatPrismAngleJson(result: PrismAngleResult): string {
  return JSON.stringify(result, null, 2)
}
