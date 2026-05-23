import chalk from 'chalk'
import type { CrimsonThreadResult } from './crimson-thread-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(220, 20, 60)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('artery-of-steel') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'artery-of-steel': return chalk.rgb(220, 20, 60).bold(c)
    case 'strong-artery': return chalk.rgb(46, 204, 113)(c)
    case 'healthy-vessel': return chalk.rgb(155, 89, 182)(c)
    case 'narrowing': return chalk.rgb(52, 152, 219)(c)
    case 'blocked': return chalk.rgb(241, 196, 15)(c)
    case 'ruptured': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example rhythmColor('athletes-pulse') returns colored string */
export function rhythmColor(r: string): string {
  switch (r) {
    case 'athletes-pulse': return chalk.rgb(220, 20, 60).bold(r)
    case 'strong-steady': return chalk.rgb(46, 204, 113)(r)
    case 'healthy-rhythm': return chalk.rgb(155, 89, 182)(r)
    case 'irregular': return chalk.rgb(52, 152, 219)(r)
    case 'weak-pulse': return chalk.rgb(241, 196, 15)(r)
    case 'flatline': return chalk.rgb(231, 76, 60)(r)
    default: return r
  }
}

/** @example flowColor('optimal-circulation') returns colored string */
export function flowColor(f: string): string {
  switch (f) {
    case 'optimal-circulation': return chalk.rgb(220, 20, 60).bold(f)
    case 'efficient-flow': return chalk.rgb(46, 204, 113)(f)
    case 'good-circulation': return chalk.rgb(155, 89, 182)(f)
    case 'sluggish': return chalk.rgb(52, 152, 219)(f)
    case 'stagnant': return chalk.rgb(241, 196, 15)(f)
    case 'clotted': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example saturationColor('fully-saturated') returns colored string */
export function saturationColor(s: string): string {
  switch (s) {
    case 'fully-saturated': return chalk.rgb(220, 20, 60).bold(s)
    case 'high-oxygen': return chalk.rgb(46, 204, 113)(s)
    case 'adequate': return chalk.rgb(155, 89, 182)(s)
    case 'low-saturation': return chalk.rgb(52, 152, 219)(s)
    case 'hypoxic': return chalk.rgb(241, 196, 15)(s)
    case 'asphyxiated': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example immuneStrengthColor('robust-immunity') returns colored string */
export function immuneStrengthColor(s: string): string {
  switch (s) {
    case 'robust-immunity': return chalk.rgb(220, 20, 60).bold(s)
    case 'strong-defense': return chalk.rgb(46, 204, 113)(s)
    case 'proper-response': return chalk.rgb(155, 89, 182)(s)
    case 'weak-immunity': return chalk.rgb(52, 152, 219)(s)
    case 'compromised': return chalk.rgb(241, 196, 15)(s)
    case 'no-defense': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example vitalityColor('radiant-health') returns colored string */
export function vitalityColor(v: string): string {
  switch (v) {
    case 'radiant-health': return chalk.rgb(220, 20, 60).bold(v)
    case 'vibrant': return chalk.rgb(46, 204, 113)(v)
    case 'healthy': return chalk.rgb(155, 89, 182)(v)
    case 'ailing': return chalk.rgb(52, 152, 219)(v)
    case 'critical': return chalk.rgb(241, 196, 15)(v)
    case 'lifeless': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example vesselConditionColor('life-blood') returns colored string */
export function vesselConditionColor(c: string): string {
  switch (c) {
    case 'life-blood': return chalk.rgb(220, 20, 60).bold(c)
    case 'vital-thread': return chalk.rgb(46, 204, 113)(c)
    case 'healthy-flow': return chalk.rgb(155, 89, 182)(c)
    case 'fading-pulse': return chalk.rgb(52, 152, 219)(c)
    case 'critical-condition': return chalk.rgb(241, 196, 15)(c)
    case 'lifeless': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example physicianGradeColor('surgeon-general') returns colored string */
export function physicianGradeColor(g: string): string {
  switch (g) {
    case 'surgeon-general': return chalk.rgb(220, 20, 60).bold(g)
    case 'cardiologist': return chalk.rgb(46, 204, 113)(g)
    case 'physician': return chalk.rgb(155, 89, 182)(g)
    case 'medic': return chalk.rgb(52, 152, 219)(g)
    case 'intern': return chalk.rgb(241, 196, 15)(g)
    case 'quack': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

/** @example systemTypeColor('cardiovascular-masterpiece') returns colored string */
export function systemTypeColor(t: string): string {
  switch (t) {
    case 'cardiovascular-masterpiece': return chalk.rgb(220, 20, 60).bold(t)
    case 'healthy-system': return chalk.rgb(46, 204, 113)(t)
    case 'functioning-system': return chalk.rgb(155, 89, 182)(t)
    case 'struggling-system': return chalk.rgb(52, 152, 219)(t)
    case 'failing-system': return chalk.rgb(241, 196, 15)(t)
    case 'flatline': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example systemConditionColor('peak-vitality') returns colored string */
export function systemConditionColor(c: string): string {
  switch (c) {
    case 'peak-vitality': return chalk.rgb(220, 20, 60).bold(c)
    case 'healthy-organism': return chalk.rgb(46, 204, 113)(c)
    case 'stable-organism': return chalk.rgb(155, 89, 182)(c)
    case 'weakened': return chalk.rgb(52, 152, 219)(c)
    case 'critical': return chalk.rgb(241, 196, 15)(c)
    case 'deceased': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatCrimsonThreadJson(result) returns JSON string */
export function formatCrimsonThreadJson(result: CrimsonThreadResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatCrimsonThreadTable(result, verbose) returns formatted string */
export function formatCrimsonThreadTable(result: CrimsonThreadResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(220, 20, 60).bold('  Crimson Thread Analysis'))
  lines.push('')

  lines.push(chalk.rgb(220, 20, 60)('  Organism Overview:'))
  lines.push(`    Overall Vitality:  ${scoreColor(result.organism.overallVitality)}`)
  lines.push(`    Avg Arterial:      ${scoreColor(result.organism.avgArterial)}`)
  lines.push(`    Avg Circulation:   ${scoreColor(result.organism.avgCirculation)}`)
  lines.push(`    Avg Life Force:    ${scoreColor(result.organism.avgLifeForce)}`)
  lines.push(`    Is Vital:          ${result.organism.isVital ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(220, 20, 60)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Systems:        ${result.stats.totalSystems}`)
  lines.push(`    Avg Arterial:         ${scoreColor(result.stats.avgArterialStrength)}`)
  lines.push(`    Avg Pulse:            ${scoreColor(result.stats.avgPulseQuality)}`)
  lines.push(`    Avg Circulation:      ${scoreColor(result.stats.avgCirculationEfficiency)}`)
  lines.push(`    Avg Oxygen:           ${scoreColor(result.stats.avgOxygenDelivery)}`)
  lines.push(`    Avg Immune:           ${scoreColor(result.stats.avgImmuneResponse)}`)
  lines.push(`    Avg Life Force:       ${scoreColor(result.stats.avgLifeForce)}`)
  lines.push(`    Physician Grade:      ${physicianGradeColor(result.stats.physicianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(220, 20, 60)('  Condition Counts:'))
  lines.push(`    Life Blood:           ${result.stats.lifeBloodCount}`)
  lines.push(`    Vital Thread:         ${result.stats.vitalThreadCount}`)
  lines.push(`    Healthy Flow:         ${result.stats.healthyFlowCount}`)
  lines.push(`    Fading Pulse:         ${result.stats.fadingPulseCount}`)
  lines.push(`    Critical Condition:   ${result.stats.criticalConditionCount}`)
  lines.push(`    Lifeless:             ${result.stats.lifelessCount}`)
  lines.push('')

  if (result.stats.bestVessel) {
    lines.push(chalk.rgb(220, 20, 60)('  Highlights:'))
    lines.push(`    Best Vessel:       ${result.stats.bestVessel}`)
    lines.push(`    Strongest:         ${result.stats.strongest}`)
    lines.push(`    Best Rhythm:       ${result.stats.bestRhythm}`)
    lines.push(`    Most Efficient:    ${result.stats.mostEfficient}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Best Defended:     ${result.stats.bestDefended}`)
    lines.push('')
  }

  if (verbose && result.vessels.length > 0) {
    lines.push(chalk.rgb(220, 20, 60)('  Per-File Vessels:'))
    for (const v of result.vessels) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(v.file)}`)
      lines.push(`      Score: ${scoreColor(v.qualityScore)}  Condition: ${vesselConditionColor(v.condition)}`)
      lines.push(`      Arterial: ${conditionColor(v.arterial.condition)}(${v.arterialStrength})  Pulse: ${rhythmColor(v.pulse.rhythm)}(${v.pulseQuality})  Circ: ${flowColor(v.circulation.flow)}(${v.circulationEfficiency})`)
      lines.push(`      Oxygen: ${saturationColor(v.oxygen.saturation)}(${v.oxygenDelivery})  Immune: ${immuneStrengthColor(v.immune.strength)}(${v.immuneResponse})  Life: ${vitalityColor(v.life.vitality)}(${v.lifeForce})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(220, 20, 60)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(220, 20, 60)('\u2764')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
