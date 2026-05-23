import chalk from 'chalk'
import type { QuicksilverFlowResult } from './quicksilver-flow-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns colored string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(118, 255, 3)(String(score))
  if (score >= 60) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 40) return chalk.rgb(241, 196, 15)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example fluidStateColor('liquid-perfection') returns colored string */
export function fluidStateColor(s: string): string {
  switch (s) {
    case 'liquid-perfection': return chalk.rgb(118, 255, 3).bold(s)
    case 'smooth-flow': return chalk.rgb(46, 204, 113)(s)
    case 'proper-viscosity': return chalk.rgb(52, 152, 219)(s)
    case 'sluggish': return chalk.rgb(241, 196, 15)(s)
    case 'viscous': return chalk.rgb(230, 126, 34)(s)
    case 'frozen': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example adaptShapeColor('perfectly-adaptable') returns colored string */
export function adaptShapeColor(s: string): string {
  switch (s) {
    case 'perfectly-adaptable': return chalk.rgb(118, 255, 3).bold(s)
    case 'highly-flexible': return chalk.rgb(46, 204, 113)(s)
    case 'properly-elastic': return chalk.rgb(52, 152, 219)(s)
    case 'somewhat-rigid': return chalk.rgb(241, 196, 15)(s)
    case 'stiff': return chalk.rgb(230, 126, 34)(s)
    case 'crystalline': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example velocityColor('mercury-speed') returns colored string */
export function velocityColor(v: string): string {
  switch (v) {
    case 'mercury-speed': return chalk.rgb(118, 255, 3).bold(v)
    case 'fast-flow': return chalk.rgb(46, 204, 113)(v)
    case 'proper-pace': return chalk.rgb(52, 152, 219)(v)
    case 'moderate-speed': return chalk.rgb(241, 196, 15)(v)
    case 'slow-flow': return chalk.rgb(230, 126, 34)(v)
    case 'glacial': return chalk.rgb(231, 76, 60)(v)
    default: return v
  }
}

/** @example transitionColor('seamless-transitions') returns colored string */
export function transitionColor(t: string): string {
  switch (t) {
    case 'seamless-transitions': return chalk.rgb(118, 255, 3).bold(t)
    case 'smooth-changes': return chalk.rgb(46, 204, 113)(t)
    case 'proper-handling': return chalk.rgb(52, 152, 219)(t)
    case 'jarring-shifts': return chalk.rgb(241, 196, 15)(t)
    case 'abrupt': return chalk.rgb(230, 126, 34)(t)
    case 'broken-transitions': return chalk.rgb(231, 76, 60)(t)
    default: return t
  }
}

/** @example strengthColor('high-tension') returns colored string */
export function strengthColor(s: string): string {
  switch (s) {
    case 'high-tension': return chalk.rgb(118, 255, 3).bold(s)
    case 'strong-bonding': return chalk.rgb(46, 204, 113)(s)
    case 'proper-cohesion': return chalk.rgb(52, 152, 219)(s)
    case 'weak-bonding': return chalk.rgb(241, 196, 15)(s)
    case 'separating': return chalk.rgb(230, 126, 34)(s)
    case 'disintegrating': return chalk.rgb(231, 76, 60)(s)
    default: return s
  }
}

/** @example fusionColor('perfect-fusion') returns colored string */
export function fusionColor(f: string): string {
  switch (f) {
    case 'perfect-fusion': return chalk.rgb(118, 255, 3).bold(f)
    case 'seamless-merge': return chalk.rgb(46, 204, 113)(f)
    case 'proper-integration': return chalk.rgb(52, 152, 219)(f)
    case 'partial-bonding': return chalk.rgb(241, 196, 15)(f)
    case 'rejection': return chalk.rgb(230, 126, 34)(f)
    case 'immiscible': return chalk.rgb(231, 76, 60)(f)
    default: return f
  }
}

/** @example conditionColor('perfect-quicksilver') returns colored string */
export function conditionColor(c: string): string {
  switch (c) {
    case 'perfect-quicksilver': return chalk.rgb(118, 255, 3).bold(c)
    case 'flowing-mercury': return chalk.rgb(46, 204, 113)(c)
    case 'liquid-metal': return chalk.rgb(52, 152, 219)(c)
    case 'sluggish-alloy': return chalk.rgb(241, 196, 15)(c)
    case 'cooling-metal': return chalk.rgb(230, 126, 34)(c)
    case 'frozen-solid': return chalk.rgb(231, 76, 60)(c)
    default: return c
  }
}

/** @example alchemistColor('grand-alchemist') returns colored string */
export function alchemistColor(g: string): string {
  switch (g) {
    case 'grand-alchemist': return chalk.rgb(118, 255, 3).bold(g)
    case 'master-mercurial': return chalk.rgb(46, 204, 113)(g)
    case 'skilled-transmuter': return chalk.rgb(52, 152, 219)(g)
    case 'apprentice': return chalk.rgb(241, 196, 15)(g)
    case 'novice': return chalk.rgb(230, 126, 34)(g)
    case 'lead-footed': return chalk.rgb(231, 76, 60)(g)
    default: return g
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatQuicksilverFlowJson(result) returns JSON string */
export function formatQuicksilverFlowJson(result: QuicksilverFlowResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatQuicksilverFlowTable(result, verbose) returns formatted string */
export function formatQuicksilverFlowTable(result: QuicksilverFlowResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(118, 255, 3).bold('  Quicksilver Flow Analysis'))
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  System:'))
  lines.push(`    Avg Fluidity:       ${scoreColor(result.system.avgFluidity)}`)
  lines.push(`    Avg Speed:          ${scoreColor(result.system.avgSpeed)}`)
  lines.push(`    Avg Cohesion:       ${scoreColor(result.system.avgCohesion)}`)
  lines.push(`    Is Fluid:           ${result.system.isFluid ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push(`    Overall Fluidity:   ${scoreColor(result.system.overallFluidity)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Statistics:'))
  lines.push(`    Total Files:              ${result.stats.totalFiles}`)
  lines.push(`    Total Pools:              ${result.stats.totalPools}`)
  lines.push(`    Avg Fluidity:             ${scoreColor(result.stats.avgFluidity)}`)
  lines.push(`    Avg Adaptability:         ${scoreColor(result.stats.avgAdaptability)}`)
  lines.push(`    Avg Mercury Speed:        ${scoreColor(result.stats.avgMercurySpeed)}`)
  lines.push(`    Avg State Transitions:    ${scoreColor(result.stats.avgStateTransitions)}`)
  lines.push(`    Avg Surface Tension:      ${scoreColor(result.stats.avgSurfaceTension)}`)
  lines.push(`    Avg Merging Quality:      ${scoreColor(result.stats.avgMergingQuality)}`)
  lines.push(`    Alchemist Grade:          ${alchemistColor(result.stats.alchemistGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(118, 255, 3)('  Condition Counts:'))
  lines.push(`    Perfect Quicksilver:  ${result.stats.perfectQuicksilverCount}`)
  lines.push(`    Flowing Mercury:      ${result.stats.flowingMercuryCount}`)
  lines.push(`    Liquid Metal:         ${result.stats.liquidMetalCount}`)
  lines.push(`    Sluggish Alloy:       ${result.stats.sluggishAlloyCount}`)
  lines.push(`    Cooling Metal:        ${result.stats.coolingMetalCount}`)
  lines.push(`    Frozen Solid:         ${result.stats.frozenSolidCount}`)
  lines.push('')

  if (result.stats.bestDrop) {
    lines.push(chalk.rgb(118, 255, 3)('  Highlights:'))
    lines.push(`    Best Drop:         ${result.stats.bestDrop}`)
    lines.push(`    Most Fluid:        ${result.stats.mostFluid}`)
    lines.push(`    Most Adaptable:    ${result.stats.mostAdaptable}`)
    lines.push(`    Fastest:           ${result.stats.fastest}`)
    lines.push(`    Best Transitions:  ${result.stats.bestTransitions}`)
    lines.push(`    Most Cohesive:     ${result.stats.mostCohesive}`)
    lines.push('')
  }

  if (verbose && result.drops.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Per-File Drops:'))
    for (const d of result.drops) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(d.file)}`)
      lines.push(`      Score: ${scoreColor(d.qualityScore)}  Condition: ${conditionColor(d.condition)}`)
      lines.push(`      Fluid: ${fluidStateColor(d.fluid.state)}(${d.fluidity})  Adaptable: ${adaptShapeColor(d.adaptable.shape)}(${d.adaptability})  Speed: ${velocityColor(d.speed.velocity)}(${d.mercurySpeed})`)
      lines.push(`      State: ${transitionColor(d.stateful.quality)}(${d.stateTransitions})  Cohesion: ${strengthColor(d.cohesive.strength)}(${d.surfaceTension})  Merging: ${fusionColor(d.merging.fusion)}(${d.mergingQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(118, 255, 3)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(118, 255, 3)('\u{1F4A7}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
