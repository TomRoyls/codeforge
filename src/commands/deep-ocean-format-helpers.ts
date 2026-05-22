import chalk from 'chalk'

import type { DeepOceanResult } from './deep-ocean-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('hydrothermal-vent') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'hydrothermal-vent': return chalk.rgb(255, 215, 0).bold(condition)
    case 'coral-garden': return chalk.rgb(46, 204, 113)(condition)
    case 'open-water': return chalk.rgb(52, 152, 219)(condition)
    case 'murky-depths': return chalk.rgb(241, 196, 15)(condition)
    case 'dead-zone': return chalk.rgb(230, 126, 34)(condition)
    case 'void': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('deep-sea-commander') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'deep-sea-commander': return chalk.rgb(255, 215, 0).bold(grade)
    case 'oceanographer': return chalk.rgb(46, 204, 113)(grade)
    case 'navigator': return chalk.rgb(155, 89, 182)(grade)
    case 'diver': return chalk.rgb(52, 152, 219)(grade)
    case 'swimmer': return chalk.rgb(241, 196, 15)(grade)
    case 'landlubber': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example zoneColor('hadal-zone') returns colored string */
export function zoneColor(zone: string): string {
  switch (zone) {
    case 'hadal-zone': return chalk.rgb(255, 215, 0).bold(zone)
    case 'abyssal-zone': return chalk.rgb(46, 204, 113)(zone)
    case 'bathyal-zone': return chalk.rgb(155, 89, 182)(zone)
    case 'mesopelagic': return chalk.rgb(52, 152, 219)(zone)
    case 'epipelagic': return chalk.rgb(241, 196, 15)(zone)
    case 'surface': return chalk.rgb(231, 76, 60)(zone)
    default: return zone
  }
}

/** @example flowColor('thermohaline') returns colored string */
export function flowColor(flow: string): string {
  switch (flow) {
    case 'thermohaline': return chalk.rgb(255, 215, 0).bold(flow)
    case 'gulf-stream': return chalk.rgb(46, 204, 113)(flow)
    case 'steady-current': return chalk.rgb(155, 89, 182)(flow)
    case 'tidal': return chalk.rgb(52, 152, 219)(flow)
    case 'stagnant': return chalk.rgb(241, 196, 15)(flow)
    case 'whirlpool': return chalk.rgb(231, 76, 60)(flow)
    default: return flow
  }
}

/** @example glowColor('dazzling') returns colored string */
export function glowColor(glow: string): string {
  switch (glow) {
    case 'dazzling': return chalk.rgb(255, 215, 0).bold(glow)
    case 'bright-glow': return chalk.rgb(46, 204, 113)(glow)
    case 'steady-glow': return chalk.rgb(155, 89, 182)(glow)
    case 'dim-light': return chalk.rgb(52, 152, 219)(glow)
    case 'flickering': return chalk.rgb(241, 196, 15)(glow)
    case 'dark': return chalk.rgb(231, 76, 60)(glow)
    default: return glow
  }
}

/** @example resistanceColor('titanium-hull') returns colored string */
export function resistanceColor(resistance: string): string {
  switch (resistance) {
    case 'titanium-hull': return chalk.rgb(255, 215, 0).bold(resistance)
    case 'deep-adapted': return chalk.rgb(46, 204, 113)(resistance)
    case 'pressure-resistant': return chalk.rgb(155, 89, 182)(resistance)
    case 'moderate': return chalk.rgb(52, 152, 219)(resistance)
    case 'fragile': return chalk.rgb(241, 196, 15)(resistance)
    case 'crushed': return chalk.rgb(231, 76, 60)(resistance)
    default: return resistance
  }
}

/** @example formationColor('mariana-grade') returns colored string */
export function formationColor(formation: string): string {
  switch (formation) {
    case 'mariana-grade': return chalk.rgb(255, 215, 0).bold(formation)
    case 'deep-trench': return chalk.rgb(46, 204, 113)(formation)
    case 'mid-ocean-ridge': return chalk.rgb(155, 89, 182)(formation)
    case 'continental-shelf': return chalk.rgb(52, 152, 219)(formation)
    case 'shallow-basin': return chalk.rgb(241, 196, 15)(formation)
    case 'puddle': return chalk.rgb(231, 76, 60)(formation)
    default: return formation
  }
}

/** @example equipmentColor('sonar-perfect') returns colored string */
export function equipmentColor(equipment: string): string {
  switch (equipment) {
    case 'sonar-perfect': return chalk.rgb(255, 215, 0).bold(equipment)
    case 'well-equipped': return chalk.rgb(46, 204, 113)(equipment)
    case 'basic-instruments': return chalk.rgb(155, 89, 182)(equipment)
    case 'compass-only': return chalk.rgb(52, 152, 219)(equipment)
    case 'lost': return chalk.rgb(241, 196, 15)(equipment)
    case 'hopeless': return chalk.rgb(231, 76, 60)(equipment)
    default: return equipment
  }
}

/** @example zoneTypeColor('deep-trench-system') returns colored string */
export function zoneTypeColor(type: string): string {
  switch (type) {
    case 'deep-trench-system': return chalk.rgb(255, 215, 0).bold(type)
    case 'abyssal-plain': return chalk.rgb(46, 204, 113)(type)
    case 'mid-ocean-ridge': return chalk.rgb(155, 89, 182)(type)
    case 'continental-shelf': return chalk.rgb(52, 152, 219)(type)
    case 'tidal-pool': return chalk.rgb(241, 196, 15)(type)
    case 'dry-land': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example zoneConditionColor('thriving-ecosystem') returns colored string */
export function zoneConditionColor(condition: string): string {
  switch (condition) {
    case 'thriving-ecosystem': return chalk.rgb(255, 215, 0).bold(condition)
    case 'living-ocean': return chalk.rgb(46, 204, 113)(condition)
    case 'stable-waters': return chalk.rgb(155, 89, 182)(condition)
    case 'stressed': return chalk.rgb(52, 152, 219)(condition)
    case 'dead-waters': return chalk.rgb(241, 196, 15)(condition)
    case 'evaporated': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatDeepOceanJson(result) returns JSON string */
export function formatDeepOceanJson(result: DeepOceanResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatDeepOceanTable(result, verbose) returns formatted string */
export function formatDeepOceanTable(result: DeepOceanResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(0, 119, 190).bold('  Deep Ocean Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Ocean Overview:'))
  lines.push(`    Overall Health:    ${scoreColor(result.ocean.overallHealth)}`)
  lines.push(`    Avg Depth:         ${scoreColor(result.ocean.avgDepth)}`)
  lines.push(`    Avg Current:       ${scoreColor(result.ocean.avgCurrent)}`)
  lines.push(`    Avg Navigation:    ${scoreColor(result.ocean.avgNavigation)}`)
  lines.push(`    Is Healthy:        ${result.ocean.isHealthy ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Zones:          ${result.stats.totalZones}`)
  lines.push(`    Avg Depth:            ${scoreColor(result.stats.avgDepthComplexity)}`)
  lines.push(`    Avg Current:          ${scoreColor(result.stats.avgCurrentQuality)}`)
  lines.push(`    Avg Bioluminescence:  ${scoreColor(result.stats.avgBioluminescence)}`)
  lines.push(`    Avg Pressure:         ${scoreColor(result.stats.avgPressureHandling)}`)
  lines.push(`    Avg Trench:           ${scoreColor(result.stats.avgTrenchQuality)}`)
  lines.push(`    Avg Navigation:       ${scoreColor(result.stats.avgAbyssalNavigation)}`)
  lines.push(`    Captain Grade:        ${gradeColor(result.stats.captainGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Hydrothermal Vent: ${result.stats.hydrothermalVentCount}`)
  lines.push(`    Coral Garden:      ${result.stats.coralGardenCount}`)
  lines.push(`    Open Water:        ${result.stats.openWaterCount}`)
  lines.push(`    Murky Depths:      ${result.stats.murkyDepthsCount}`)
  lines.push(`    Dead Zone:         ${result.stats.deadZoneCount}`)
  lines.push(`    Void:              ${result.stats.voidCount}`)
  lines.push('')

  if (result.stats.bestSpecimen) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Specimen:     ${result.stats.bestSpecimen}`)
    lines.push(`    Best Depth:        ${result.stats.bestDepth}`)
    lines.push(`    Best Flow:         ${result.stats.bestFlow}`)
    lines.push(`    Most Illuminated:  ${result.stats.mostIlluminated}`)
    lines.push(`    Most Resilient:    ${result.stats.mostResilient}`)
    lines.push(`    Best Architected:  ${result.stats.bestArchitected}`)
    lines.push('')
  }

  if (verbose && result.specimens.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const s of result.specimens) {
      lines.push(`    ${chalk.rgb(0, 119, 190)(s.file)}`)
      lines.push(`      Score: ${scoreColor(s.qualityScore)}  Condition: ${conditionColor(s.condition)}`)
      lines.push(`      Depth: ${zoneColor(s.depth.zone)}(${s.depthComplexity})  Current: ${flowColor(s.current.flow)}(${s.currentQuality})  Bio: ${glowColor(s.bio.glow)}(${s.bioluminescence})`)
      lines.push(`      Pressure: ${resistanceColor(s.pressure.resistance)}(${s.pressureHandling})  Trench: ${formationColor(s.trench.formation)}(${s.trenchQuality})  Nav: ${equipmentColor(s.navigation.equipment)}(${s.abyssalNavigation})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(0, 119, 190)('\u{1F30A}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
