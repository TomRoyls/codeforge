import chalk from 'chalk'

import type { GravityFieldResult } from './gravity-field-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('stable-star') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'stable-star': return chalk.rgb(46, 204, 113).bold(condition)
    case 'planetary-system': return chalk.rgb(52, 152, 219)(condition)
    case 'binary-system': return chalk.rgb(155, 89, 182)(condition)
    case 'chaotic-orbit': return chalk.rgb(241, 196, 15)(condition)
    case 'black-hole': return chalk.rgb(230, 126, 34)(condition)
    case 'supernova-remnant': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('chief-astrophysicist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'chief-astrophysicist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'astrophysicist': return chalk.rgb(52, 152, 219)(grade)
    case 'astronomer': return chalk.rgb(155, 89, 182)(grade)
    case 'stargazer': return chalk.rgb(241, 196, 15)(grade)
    case 'amateur': return chalk.rgb(230, 126, 34)(grade)
    case 'lost-in-space': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example classificationColor('black-hole') returns colored string */
export function classificationColor(cls: string): string {
  switch (cls) {
    case 'black-hole': return chalk.rgb(231, 76, 60)(cls)
    case 'neutron-star': return chalk.rgb(230, 126, 34)(cls)
    case 'main-sequence': return chalk.rgb(46, 204, 113)(cls)
    case 'red-dwarf': return chalk.rgb(241, 196, 15)(cls)
    case 'brown-dwarf': return chalk.rgb(155, 89, 182)(cls)
    case 'asteroid': return chalk.rgb(149, 165, 166)(cls)
    default: return cls
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatGravityFieldJson(result) returns JSON string */
export function formatGravityFieldJson(result: GravityFieldResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatGravityFieldTable(result, false) returns formatted string */
export function formatGravityFieldTable(result: GravityFieldResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.rgb(52, 152, 219).bold('Gravity Field Analysis'))
  lines.push('')
  lines.push(`Overall Stability: ${scoreColor(result.stats.overallStability)}/100`)
  lines.push(`Grade: ${gradeColor(result.stats.astrophysicistGrade)}`)
  lines.push(`Files: ${result.stats.totalFiles} | Regions: ${result.stats.totalRegions}`)
  lines.push('')

  lines.push(chalk.rgb(52, 152, 219).bold('Averages'))
  lines.push(`  Gravitational Pull: ${scoreColor(result.stats.avgGravitationalPull)}`)
  lines.push(`  Orbital Stability:  ${scoreColor(result.stats.avgOrbitalStability)}`)
  lines.push(`  Tidal Force:        ${scoreColor(result.stats.avgTidalForce)}`)
  lines.push(`  Escape Velocity:    ${scoreColor(result.stats.avgEscapeVelocity)}`)
  lines.push(`  Field Strength:     ${scoreColor(result.stats.avgFieldStrength)}`)
  lines.push(`  Orbital Decay:      ${scoreColor(result.stats.avgOrbitalDecay)}`)
  lines.push('')

  lines.push(chalk.rgb(52, 152, 219).bold('Conditions'))
  lines.push(`  Stable Star:        ${result.stats.stableStarCount}`)
  lines.push(`  Planetary System:   ${result.stats.planetarySystemCount}`)
  lines.push(`  Binary System:      ${result.stats.binarySystemCount}`)
  lines.push(`  Chaotic Orbit:      ${result.stats.chaoticOrbitCount}`)
  lines.push(`  Black Hole:         ${result.stats.blackHoleCount}`)
  lines.push(`  Supernova Remnant:  ${result.stats.supernovaRemnantCount}`)
  lines.push('')

  lines.push(chalk.rgb(52, 152, 219).bold('Highlights'))
  lines.push(`  Best Body:          ${result.stats.bestBody}`)
  lines.push(`  Most Stable:        ${result.stats.mostStable}`)
  lines.push(`  Most Decouplable:   ${result.stats.mostDecouplable}`)
  lines.push(`  Strongest Field:    ${result.stats.strongestField}`)
  lines.push(`  Healthiest Decay:   ${result.stats.healthiestDecay}`)
  lines.push('')

  if (verbose) {
    lines.push(chalk.rgb(52, 152, 219).bold('Bodies'))
    for (const body of result.bodies) {
      lines.push(`  ${conditionColor(body.condition).padEnd(30)} ${body.file}`)
      lines.push(`    Pull: ${scoreColor(body.gravitationalPull)} | Stability: ${scoreColor(body.orbitalStability)} | Tidal: ${scoreColor(body.tidalForce)}`)
      lines.push(`    Escape: ${scoreColor(body.escapeVelocity)} | Field: ${scoreColor(body.fieldStrength)} | Decay: ${scoreColor(body.orbitalDecay)}`)
      lines.push(`    Mass: ${classificationColor(body.mass.classification)} | Orbit: ${body.orbit.type} | Score: ${scoreColor(body.qualityScore)}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(52, 152, 219).bold('Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(241, 196, 15)('\u2022')} ${rec}`)
    }
  }

  return lines.join('\n')
}
