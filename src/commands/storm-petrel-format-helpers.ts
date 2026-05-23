import chalk from 'chalk'
import type { StormPetrelResult } from './storm-petrel-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(135, 206, 235)(String(score))
  if (score >= 60) return chalk.rgb(70, 130, 180)(String(score))
  if (score >= 40) return chalk.rgb(100, 149, 237)(String(score))
  return chalk.rgb(70, 70, 70)(String(score))
}

/** @example stormRidingColor('hurricane-rider') returns colored string */
export function stormRidingColor(s: string): string {
  switch (s) {
    case 'hurricane-rider': return chalk.rgb(135, 206, 235).bold(s)
    case 'storm-navigator': return chalk.rgb(70, 130, 180)(s)
    case 'weather-tested': return chalk.rgb(100, 149, 237)(s)
    case 'fair-weather': return chalk.rgb(176, 196, 222)(s)
    case 'storm-shy': return chalk.rgb(119, 136, 153)(s)
    case 'grounded': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example navigatingSkillColor('wind-master') returns colored string */
export function navigatingSkillColor(s: string): string {
  switch (s) {
    case 'wind-master': return chalk.rgb(135, 206, 235).bold(s)
    case 'adaptive-flyer': return chalk.rgb(70, 130, 180)(s)
    case 'proper-navigator': return chalk.rgb(100, 149, 237)(s)
    case 'rigid-flyer': return chalk.rgb(176, 196, 222)(s)
    case 'wind-blown': return chalk.rgb(119, 136, 153)(s)
    case 'lost': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example oceanicResilienceColor('deep-diver') returns colored string */
export function oceanicResilienceColor(s: string): string {
  switch (s) {
    case 'deep-diver': return chalk.rgb(135, 206, 235).bold(s)
    case 'ocean-hardy': return chalk.rgb(70, 130, 180)(s)
    case 'surface-swimmer': return chalk.rgb(100, 149, 237)(s)
    case 'shallow-water': return chalk.rgb(176, 196, 222)(s)
    case 'puddle-jumper': return chalk.rgb(119, 136, 153)(s)
    case 'landlubber': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example enduringStaminaColor('trans-oceanic') returns colored string */
export function enduringStaminaColor(s: string): string {
  switch (s) {
    case 'trans-oceanic': return chalk.rgb(135, 206, 235).bold(s)
    case 'long-haul': return chalk.rgb(70, 130, 180)(s)
    case 'proper-stamina': return chalk.rgb(100, 149, 237)(s)
    case 'medium-range': return chalk.rgb(176, 196, 222)(s)
    case 'short-hop': return chalk.rgb(119, 136, 153)(s)
    case 'exhausted': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example instinctualSenseColor('homing-pigeon') returns colored string */
export function instinctualSenseColor(s: string): string {
  switch (s) {
    case 'homing-pigeon': return chalk.rgb(135, 206, 235).bold(s)
    case 'strong-instinct': return chalk.rgb(70, 130, 180)(s)
    case 'proper-direction': return chalk.rgb(100, 149, 237)(s)
    case 'uncertain': return chalk.rgb(176, 196, 222)(s)
    case 'wandering': return chalk.rgb(119, 136, 153)(s)
    case 'lost': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example flockingHarmonyColor('perfect-flock') returns colored string */
export function flockingHarmonyColor(s: string): string {
  switch (s) {
    case 'perfect-flock': return chalk.rgb(135, 206, 235).bold(s)
    case 'coordinated-flight': return chalk.rgb(70, 130, 180)(s)
    case 'proper-formation': return chalk.rgb(100, 149, 237)(s)
    case 'loose-group': return chalk.rgb(176, 196, 222)(s)
    case 'scattered': return chalk.rgb(119, 136, 153)(s)
    case 'isolated': return chalk.rgb(70, 70, 70)(s)
    default: return s
  }
}

/** @example flightConditionColor('master-aviator') returns colored string */
export function flightConditionColor(c: string): string {
  switch (c) {
    case 'master-aviator': return chalk.rgb(135, 206, 235).bold(c)
    case 'storm-rider': return chalk.rgb(70, 130, 180)(c)
    case 'steady-flyer': return chalk.rgb(100, 149, 237)(c)
    case 'struggling-bird': return chalk.rgb(176, 196, 222)(c)
    case 'grounded-bird': return chalk.rgb(119, 136, 153)(c)
    case 'fallen': return chalk.rgb(70, 70, 70)(c)
    default: return c
  }
}

/** @example aviatorGradeColor('master-aviator') returns colored string */
export function aviatorGradeColor(g: string): string {
  switch (g) {
    case 'master-aviator': return chalk.rgb(135, 206, 235).bold(g)
    case 'expert-navigator': return chalk.rgb(70, 130, 180)(g)
    case 'skilled-pilot': return chalk.rgb(100, 149, 237)(g)
    case 'apprentice-flyer': return chalk.rgb(176, 196, 222)(g)
    case 'novice': return chalk.rgb(119, 136, 153)(g)
    case 'flightless': return chalk.rgb(70, 70, 70)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatStormPetrelJson(result) returns JSON string */
export function formatStormPetrelJson(result: StormPetrelResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatStormPetrelTable(result, verbose) returns formatted string */
export function formatStormPetrelTable(result: StormPetrelResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(135, 206, 235).bold('  Storm Petrel Analysis'))
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Migration:'))
  lines.push(`    Avg Storm Riding:       ${scoreColor(result.migration.avgStormRiding)}`)
  lines.push(`    Avg Endurance:          ${scoreColor(result.migration.avgEndurance)}`)
  lines.push(`    Avg Coordination:       ${scoreColor(result.migration.avgCoordination)}`)
  lines.push(`    Is Resilient:           ${result.migration.isResilient ? chalk.rgb(135, 206, 235)('Yes') : chalk.rgb(70, 70, 70)('No')}`)
  lines.push(`    Overall Resilience:     ${scoreColor(result.migration.overallResilience)}`)
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Statistics:'))
  lines.push(`    Total Files:                  ${result.stats.totalFiles}`)
  lines.push(`    Total Formations:             ${result.stats.totalFormations}`)
  lines.push(`    Avg Storm Riding:             ${scoreColor(result.stats.avgStormRiding)}`)
  lines.push(`    Avg Wind Navigation:          ${scoreColor(result.stats.avgWindNavigation)}`)
  lines.push(`    Avg Ocean Resilience:         ${scoreColor(result.stats.avgOceanResilience)}`)
  lines.push(`    Avg Flight Endurance:         ${scoreColor(result.stats.avgFlightEndurance)}`)
  lines.push(`    Avg Navigational Instinct:    ${scoreColor(result.stats.avgNavigationalInstinct)}`)
  lines.push(`    Avg Flock Coordination:       ${scoreColor(result.stats.avgFlockCoordination)}`)
  lines.push(`    Aviator Grade:                ${aviatorGradeColor(result.stats.aviatorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(135, 206, 235)('  Condition Counts:'))
  lines.push(`    Master Aviator:    ${result.stats.masterAviatorCount}`)
  lines.push(`    Storm Rider:       ${result.stats.stormRiderCount}`)
  lines.push(`    Steady Flyer:      ${result.stats.steadyFlyerCount}`)
  lines.push(`    Struggling Bird:   ${result.stats.strugglingBirdCount}`)
  lines.push(`    Grounded Bird:     ${result.stats.groundedBirdCount}`)
  lines.push(`    Fallen:            ${result.stats.fallenCount}`)
  lines.push('')

  if (result.stats.bestFlight) {
    lines.push(chalk.rgb(135, 206, 235)('  Highlights:'))
    lines.push(`    Best Flight:          ${result.stats.bestFlight}`)
    lines.push(`    Best Storm Rider:     ${result.stats.bestStormRider}`)
    lines.push(`    Best Navigator:       ${result.stats.bestNavigator}`)
    lines.push(`    Deepest:              ${result.stats.deepest}`)
    lines.push(`    Most Enduring:        ${result.stats.mostEnduring}`)
    lines.push(`    Most Coordinated:     ${result.stats.mostCoordinated}`)
    lines.push('')
  }

  if (verbose && result.flights.length > 0) {
    lines.push(chalk.rgb(135, 206, 235)('  Per-File Flights:'))
    for (const f of result.flights) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${flightConditionColor(f.condition)}`)
      lines.push(`      Storm: ${stormRidingColor(f.stormy.riding)}(${f.stormRiding})  Nav: ${navigatingSkillColor(f.navigating.skill)}(${f.windNavigation})  Ocean: ${oceanicResilienceColor(f.oceanic.resilience)}(${f.oceanResilience})`)
      lines.push(`      Endure: ${enduringStaminaColor(f.enduring.endurance)}(${f.flightEndurance})  Instinct: ${instinctualSenseColor(f.instinctual.sense)}(${f.navigationalInstinct})  Flock: ${flockingHarmonyColor(f.flocking.harmony)}(${f.flockCoordination})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(135, 206, 235)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(135, 206, 235)('\u{1F40A}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
