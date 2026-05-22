import chalk from 'chalk'

import type { AuroraCurtainResult } from './aurora-curtain-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('northern-lights') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'northern-lights': return chalk.rgb(46, 204, 113).bold(condition)
    case 'aurora-australis': return chalk.rgb(52, 152, 219)(condition)
    case 'substorm-peak': return chalk.rgb(155, 89, 182)(condition)
    case 'quiet-arc': return chalk.rgb(241, 196, 15)(condition)
    case 'clouded-over': return chalk.rgb(230, 126, 34)(condition)
    case 'light-pollution': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-aurora-hunter') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-aurora-hunter': return chalk.rgb(46, 204, 113).bold(grade)
    case 'aurora-photographer': return chalk.rgb(52, 152, 219)(grade)
    case 'sky-watcher': return chalk.rgb(155, 89, 182)(grade)
    case 'stargazer': return chalk.rgb(241, 196, 15)(grade)
    case 'cloud-gazer': return chalk.rgb(230, 126, 34)(grade)
    case 'cave-dweller': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example brightnessColor('dazzling') returns colored string */
export function brightnessColor(brightness: string): string {
  switch (brightness) {
    case 'dazzling': return chalk.rgb(46, 204, 113)(brightness)
    case 'brilliant': return chalk.rgb(52, 152, 219)(brightness)
    case 'bright': return chalk.rgb(155, 89, 182)(brightness)
    case 'visible': return chalk.rgb(241, 196, 15)(brightness)
    case 'faint': return chalk.rgb(230, 126, 34)(brightness)
    case 'invisible': return chalk.rgb(231, 76, 60)(brightness)
    default: return brightness
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatAuroraCurtainJson(result) returns JSON string */
export function formatAuroraCurtainJson(result: AuroraCurtainResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatAuroraCurtainTable(result, verbose) returns formatted string */
export function formatAuroraCurtainTable(result: AuroraCurtainResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Aurora Curtain Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Atmosphere Overview:'))
  lines.push(`    Overall Radiance:       ${scoreColor(result.atmosphere.overallRadiance)}`)
  lines.push(`    Avg Emission:           ${scoreColor(result.atmosphere.avgEmission)}`)
  lines.push(`    Avg Pattern:            ${scoreColor(result.atmosphere.avgPattern)}`)
  lines.push(`    Avg Illumination:       ${scoreColor(result.atmosphere.avgIllumination)}`)
  lines.push(`    Is Breathtaking:        ${result.atmosphere.isBreathtaking ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:               ${result.stats.totalFiles}`)
  lines.push(`    Total Displays:            ${result.stats.totalDisplays}`)
  lines.push(`    Avg Light Emission:        ${scoreColor(result.stats.avgLightEmission)}`)
  lines.push(`    Avg Curtain Pattern:       ${scoreColor(result.stats.avgCurtainPattern)}`)
  lines.push(`    Avg Energy Transform:      ${scoreColor(result.stats.avgEnergyTransformation)}`)
  lines.push(`    Avg Color Dynamics:        ${scoreColor(result.stats.avgColorDynamics)}`)
  lines.push(`    Avg Movement Quality:      ${scoreColor(result.stats.avgMovementQuality)}`)
  lines.push(`    Avg Illumination Power:    ${scoreColor(result.stats.avgIlluminationPower)}`)
  lines.push(`    Aurora Grade:              ${gradeColor(result.stats.auroraGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Condition Counts:'))
  lines.push(`    Northern Lights:           ${result.stats.northernLightsCount}`)
  lines.push(`    Aurora Australis:          ${result.stats.auroraAustralisCount}`)
  lines.push(`    Substorm Peak:             ${result.stats.substormPeakCount}`)
  lines.push(`    Quiet Arc:                 ${result.stats.quietArcCount}`)
  lines.push(`    Clouded Over:              ${result.stats.cloudedOverCount}`)
  lines.push(`    Light Pollution:           ${result.stats.lightPollutionCount}`)
  lines.push('')

  if (result.stats.bestRay) {
    lines.push(chalk.rgb(44, 62, 80)('  Highlights:'))
    lines.push(`    Best Ray:           ${result.stats.bestRay}`)
    lines.push(`    Brightest:          ${result.stats.brightest}`)
    lines.push(`    Best Pattern:       ${result.stats.bestPattern}`)
    lines.push(`    Most Efficient:     ${result.stats.mostEfficient}`)
    lines.push(`    Most Colorful:      ${result.stats.mostColorful}`)
    lines.push(`    Most Graceful:      ${result.stats.mostGraceful}`)
    lines.push('')
  }

  if (verbose && result.rays.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-File Details:'))
    for (const ray of result.rays) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(ray.file)}`)
      lines.push(`      Score: ${scoreColor(ray.qualityScore)}  Condition: ${conditionColor(ray.condition)}`)
      lines.push(`      Emission: ${brightnessColor(ray.emission.brightness)}(${ray.lightEmission})  Pattern: ${ray.pattern.type}(${ray.curtainPattern})  Energy: ${ray.energy.source}(${ray.energyTransformation})`)
      lines.push(`      Color: ${ray.color.palette}(${ray.colorDynamics})  Movement: ${ray.movement.style}(${ray.movementQuality})  Illumination: ${ray.illumination.reach}(${ray.illuminationPower})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(241, 196, 15)('•')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
