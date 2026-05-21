import chalk from 'chalk'
import type { LensElement, ObservatoryBay, TelescopeLensResult } from './telescope-lens-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function conditionColor(c: string): string {
  switch (c) {
    case 'hubble-quality': return chalk.rgb(255, 215, 0)(c)
    case 'research-grade': return chalk.green(c)
    case 'observatory': return chalk.blue(c)
    case 'backyard-scope': return chalk.cyan(c)
    case 'toy-telescope': return chalk.yellow(c)
    case 'broken-lens': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function lensColor(t: string): string {
  switch (t) {
    case 'apochromatic': return chalk.rgb(255, 215, 0)(t)
    case 'achromatic': return chalk.green(t)
    case 'plan-achromatic': return chalk.blue(t)
    case 'compound': return chalk.cyan(t)
    case 'simple': return chalk.yellow(t)
    case 'defective': return chalk.red(t)
    default: return t
  }
}

function bayColor(b: string): string {
  switch (b) {
    case 'professional-dome': return chalk.rgb(255, 215, 0)(b)
    case 'campus-observatory': return chalk.green(b)
    case 'backyard-observatory': return chalk.blue(b)
    case 'rooftop': return chalk.cyan(b)
    case 'window': return chalk.yellow(b)
    case 'dark-closet': return chalk.red(b)
    default: return chalk.dim(b)
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'optical-engineer': return chalk.rgb(255, 215, 0)(g)
    case 'telescope-maker': return chalk.green(g)
    case 'astronomer': return chalk.blue(g)
    case 'stargazer': return chalk.cyan(g)
    case 'tourist': return chalk.yellow(g)
    case 'blind': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Element Formatting ──────────────────────────────────────────────────────

function formatLensElement(element: LensElement, verbose: boolean): string {
  const line = ` ${conditionColor(element.condition)} ${chalk.bold(element.file)} focal:${scoreColor(element.focalLength)} ap:${scoreColor(element.aperture)} mag:${scoreColor(element.magnification)} res:${scoreColor(element.resolution)} aber:${scoreColor(element.aberration)} gather:${scoreColor(element.lightGathering)} score:${scoreColor(element.qualityScore)}`

  if (!verbose) return line

  const details = [line]
  const l = element.lens
  details.push(`    lens: ${lensColor(l.type)} f/${l.fNumber} focus:${scoreColor(l.focusScore)} focused:${l.isFocused ? chalk.green('Y') : chalk.red('N')} blurred:${l.isBlurred ? chalk.red('Y') : chalk.dim('N')} distorted:${l.isDistorted ? chalk.yellow('Y') : chalk.dim('N')} multiFoci:${l.hasMultipleFoci ? chalk.yellow('Y') : chalk.dim('N')}`)
  const a = element.apertureDetail
  details.push(`    aperture: diam:${scoreColor(a.diameter)} f/${a.fStop} open:${a.isOpen ? chalk.green('Y') : chalk.dim('N')} stopped:${a.isStopped ? chalk.yellow('Y') : chalk.dim('N')} optimal:${a.isOptimal ? chalk.green('Y') : chalk.dim('N')} vignette:${a.hasVignetting ? chalk.red('Y') : chalk.dim('N')} falloff:${a.hasFalloff ? chalk.yellow('Y') : chalk.dim('N')}`)
  const m = element.magnificationDetail
  details.push(`    magnification: level:${scoreColor(m.level)} macro:${m.isMacro ? chalk.green('Y') : chalk.dim('N')} normal:${m.isNormal ? chalk.green('Y') : chalk.dim('N')} wide:${m.isWide ? chalk.blue('Y') : chalk.dim('N')} emptyMag:${m.hasEmptyMagnification ? chalk.red('Y') : chalk.dim('N')} useful:${m.hasUsefulDetail ? chalk.green('Y') : chalk.dim('N')} density:${scoreColor(m.detailDensity)}`)
  const r = element.resolutionDetail
  details.push(`    resolution: sharp:${scoreColor(r.sharpness)} power:${scoreColor(r.resolvingPower)} contrast:${scoreColor(r.contrast)} diffraction:${r.hasDiffraction ? chalk.yellow('Y') : chalk.dim('N')} spherical:${r.hasSphericalAberration ? chalk.yellow('Y') : chalk.dim('N')} coma:${r.hasComa ? chalk.red('Y') : chalk.dim('N')} astigmatism:${r.hasAstigmatism ? chalk.yellow('Y') : chalk.dim('N')}`)
  const ab = element.aberrationDetail
  details.push(`    aberration: chrom:${scoreColor(ab.chromatic)} corrected:${ab.isCorrected ? chalk.green('Y') : chalk.red('N')} fringing:${ab.hasColorFringing ? chalk.red('Y') : chalk.dim('N')} barrel:${ab.hasBarrelDistortion ? chalk.yellow('Y') : chalk.dim('N')} pincushion:${ab.hasPincushion ? chalk.yellow('Y') : chalk.dim('N')} fringes:${ab.fringeCount} minimal:${ab.isMinimal ? chalk.green('Y') : chalk.dim('N')}`)
  const g = element.gathering
  details.push(`    gathering: power:${scoreColor(g.power)} transmission:${scoreColor(g.lightTransmission)} fieldStop:${g.hasFieldStop ? chalk.green('Y') : chalk.red('N')} eyepiece:${g.hasEyepiece ? chalk.green('Y') : chalk.red('N')} filter:${g.hasFilter ? chalk.green('Y') : chalk.red('N')} finder:${g.hasFinder ? chalk.green('Y') : chalk.dim('N')} collimation:${g.hasCollimation ? chalk.green('Y') : chalk.red('N')}`)
  const mt = element.mount
  details.push(`    mount: stable:${mt.isStable ? chalk.green('Y') : chalk.red('N')} aligned:${mt.isAligned ? chalk.green('Y') : chalk.red('N')} tracking:${mt.hasTracking ? chalk.green('Y') : chalk.dim('N')} goTo:${mt.hasGoTo ? chalk.green('Y') : chalk.dim('N')} alignment:${scoreColor(mt.alignmentScore)}`)
  return details.join('\n')
}

// ─── Bay Formatting ──────────────────────────────────────────────────────────

function formatObservatoryBay(bay: ObservatoryBay): string {
  return `  ${chalk.bold(bay.directory)} ${bayColor(bay.bayType)} focal:${scoreColor(bay.avgFocalLength)} res:${scoreColor(bay.avgResolution)} aber:${scoreColor(bay.avgAberration)} hubble:${bay.hubbleCount} broken:${bay.brokenCount} focused:${bay.focusedCount} distorted:${bay.distortedCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format telescope-lens result as table
 * @example
 * formatTelescopeLensTable(result, false) // string
 */
export function formatTelescopeLensTable(result: TelescopeLensResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n🔭  Telescope Lens - Code Focus/Clarity Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('🔎 Lens Elements'))
  if (result.elements.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.elements : result.elements.slice(0, 15)
    for (const element of display) {
      lines.push(formatLensElement(element, verbose))
    }
    if (!verbose && result.elements.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.elements.length - 15} more`))
    }
  }
  lines.push('')

  if (result.bays.length > 0) {
    lines.push(chalk.bold('🏛️ Observatory Bays'))
    for (const bay of result.bays) {
      lines.push(formatObservatoryBay(bay))
    }
    lines.push('')
  }

  const obs = result.observatory
  lines.push(chalk.bold('🌟 Observatory'))
  lines.push(`  Focal:${scoreColor(obs.avgFocalLength)} Resolution:${scoreColor(obs.avgResolution)} Aberration:${scoreColor(obs.avgAberration)} Gathering:${scoreColor(obs.avgLightGathering)} Focused:${obs.isFocused ? chalk.green('YES') : chalk.red('NO')} Clarity:${scoreColor(obs.overallClarity)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.astronomerGrade)} | Clarity: ${scoreColor(s.overallClarity)} | Files: ${s.totalFiles} | Bays: ${s.totalBays}`)
  lines.push(`  Hubble:${s.hubbleQualityCount} Research:${s.researchGradeCount} Observatory:${s.observatoryCount} Backyard:${s.backyardScopeCount} Toy:${s.toyTelescopeCount} Broken:${s.brokenLensCount}`)
  lines.push(`  Apochromatic:${s.apochromaticCount} Achromatic:${s.achromaticCount} Simple:${s.simpleCount} Defective:${s.defectiveCount}`)
  lines.push(`  Focused:${s.focusedCount} Blurred:${s.blurredCount} Distorted:${s.distortedCount} MultiFoci:${s.multipleFociCount} Corrected:${s.correctedCount}`)
  lines.push(`  Filter:${s.hasFilterCount} Collimation:${s.hasCollimationCount} Stable:${s.isStableCount}`)
  lines.push(`  Clearest:${chalk.green(s.clearest)} | Sharpest:${chalk.blue(s.sharpest)} | Aberrated:${chalk.red(s.mostAberrated)} | BestFocused:${chalk.magenta(s.bestFocused)} | Powerful:${chalk.cyan(s.mostPowerful)}`)

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
 * Format telescope-lens result as JSON
 * @example
 * formatTelescopeLensJson(result) // string
 */
export function formatTelescopeLensJson(result: TelescopeLensResult): string {
  return JSON.stringify(result, null, 2)
}
