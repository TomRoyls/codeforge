import chalk from 'chalk'

import type { PhoenixAshResult } from './phoenix-ash-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('phoenix-rising') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'phoenix-rising': return chalk.rgb(255, 215, 0).bold(condition)
    case 'ember-gathering': return chalk.rgb(46, 204, 113)(condition)
    case 'ash-nesting': return chalk.rgb(52, 152, 219)(condition)
    case 'scattered-embers': return chalk.rgb(241, 196, 15)(condition)
    case 'cold-ash': return chalk.rgb(230, 126, 34)(condition)
    case 'void': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('phoenix-lord') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'phoenix-lord': return chalk.rgb(255, 215, 0).bold(grade)
    case 'fire-guardian': return chalk.rgb(46, 204, 113)(grade)
    case 'ash-keeper': return chalk.rgb(155, 89, 182)(grade)
    case 'ember-tender': return chalk.rgb(52, 152, 219)(grade)
    case 'smoke-watcher': return chalk.rgb(241, 196, 15)(grade)
    case 'ice-walker': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example heatColor('white-hot') returns colored string */
export function heatColor(heat: string): string {
  switch (heat) {
    case 'white-hot': return chalk.rgb(255, 215, 0).bold(heat)
    case 'red-hot': return chalk.rgb(46, 204, 113)(heat)
    case 'glowing': return chalk.rgb(155, 89, 182)(heat)
    case 'warm': return chalk.rgb(52, 152, 219)(heat)
    case 'cooling': return chalk.rgb(241, 196, 15)(heat)
    case 'cold': return chalk.rgb(231, 76, 60)(heat)
    default: return heat
  }
}

/** @example compositionColor('phoenix-ash') returns colored string */
export function compositionColor(composition: string): string {
  switch (composition) {
    case 'phoenix-ash': return chalk.rgb(255, 215, 0).bold(composition)
    case 'fertile-ash': return chalk.rgb(46, 204, 113)(composition)
    case 'mineral-ash': return chalk.rgb(155, 89, 182)(composition)
    case 'carbon-ash': return chalk.rgb(52, 152, 219)(composition)
    case 'dust': return chalk.rgb(241, 196, 15)(composition)
    case 'void': return chalk.rgb(231, 76, 60)(composition)
    default: return composition
  }
}

/** @example stageColor('rising-phoenix') returns colored string */
export function stageColor(stage: string): string {
  switch (stage) {
    case 'rising-phoenix': return chalk.rgb(255, 215, 0).bold(stage)
    case 'reforming': return chalk.rgb(46, 204, 113)(stage)
    case 'nests-building': return chalk.rgb(155, 89, 182)(stage)
    case 'gathering': return chalk.rgb(52, 152, 219)(stage)
    case 'scattered': return chalk.rgb(241, 196, 15)(stage)
    case 'impossible': return chalk.rgb(231, 76, 60)(stage)
    default: return stage
  }
}

/** @example clarityColor('brilliant-flame') returns colored string */
export function clarityColor(clarity: string): string {
  switch (clarity) {
    case 'brilliant-flame': return chalk.rgb(255, 215, 0).bold(clarity)
    case 'steady-fire': return chalk.rgb(46, 204, 113)(clarity)
    case 'flickering': return chalk.rgb(155, 89, 182)(clarity)
    case 'ember-glow': return chalk.rgb(52, 152, 219)(clarity)
    case 'smoke-signal': return chalk.rgb(241, 196, 15)(clarity)
    case 'darkness': return chalk.rgb(231, 76, 60)(clarity)
    default: return clarity
  }
}

/** @example immortalQualityColor('eternal-flame') returns colored string */
export function immortalQualityColor(quality: string): string {
  switch (quality) {
    case 'eternal-flame': return chalk.rgb(255, 215, 0).bold(quality)
    case 'immortal': return chalk.rgb(46, 204, 113)(quality)
    case 'ageless': return chalk.rgb(155, 89, 182)(quality)
    case 'enduring': return chalk.rgb(52, 152, 219)(quality)
    case 'mortal': return chalk.rgb(241, 196, 15)(quality)
    case 'ephemeral': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example trajectoryColor('soaring') returns colored string */
export function trajectoryColor(trajectory: string): string {
  switch (trajectory) {
    case 'soaring': return chalk.rgb(255, 215, 0).bold(trajectory)
    case 'ascending': return chalk.rgb(46, 204, 113)(trajectory)
    case 'lifting': return chalk.rgb(155, 89, 182)(trajectory)
    case 'grounded': return chalk.rgb(52, 152, 219)(trajectory)
    case 'falling': return chalk.rgb(241, 196, 15)(trajectory)
    case 'crashed': return chalk.rgb(231, 76, 60)(trajectory)
    default: return trajectory
  }
}

/** @example circleTypeColor('phoenix-nest') returns colored string */
export function circleTypeColor(type: string): string {
  switch (type) {
    case 'phoenix-nest': return chalk.rgb(255, 215, 0).bold(type)
    case 'fire-temple': return chalk.rgb(46, 204, 113)(type)
    case 'hearth-circle': return chalk.rgb(155, 89, 182)(type)
    case 'ash-pile': return chalk.rgb(52, 152, 219)(type)
    case 'scattered-dust': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example circleConditionColor('reborn-glory') returns colored string */
export function circleConditionColor(condition: string): string {
  switch (condition) {
    case 'reborn-glory': return chalk.rgb(255, 215, 0).bold(condition)
    case 'renewing': return chalk.rgb(46, 204, 113)(condition)
    case 'gathering': return chalk.rgb(155, 89, 182)(condition)
    case 'smoldering': return chalk.rgb(52, 152, 219)(condition)
    case 'cold': return chalk.rgb(241, 196, 15)(condition)
    case 'extinguished': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatPhoenixAshJson(result) returns JSON string */
export function formatPhoenixAshJson(result: PhoenixAshResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatPhoenixAshTable(result, verbose) returns formatted string */
export function formatPhoenixAshTable(result: PhoenixAshResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(255, 140, 0).bold('  Phoenix Ash Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Flame Overview:'))
  lines.push(`    Overall Renewal:   ${scoreColor(result.flame.overallRenewal)}`)
  lines.push(`    Avg Ember:         ${scoreColor(result.flame.avgEmber)}`)
  lines.push(`    Avg Rebirth:       ${scoreColor(result.flame.avgRebirth)}`)
  lines.push(`    Avg Rising:        ${scoreColor(result.flame.avgRising)}`)
  lines.push(`    Is Rising:         ${result.flame.isRising ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Circles:        ${result.stats.totalCircles}`)
  lines.push(`    Avg Ember Potential:  ${scoreColor(result.stats.avgEmberPotential)}`)
  lines.push(`    Avg Ash Richness:     ${scoreColor(result.stats.avgAshRichness)}`)
  lines.push(`    Avg Rebirth:          ${scoreColor(result.stats.avgRebirthCapability)}`)
  lines.push(`    Avg Flame Memory:     ${scoreColor(result.stats.avgFlameMemory)}`)
  lines.push(`    Avg Immortal:         ${scoreColor(result.stats.avgImmortalPatterns)}`)
  lines.push(`    Avg Rising Quality:   ${scoreColor(result.stats.avgRisingQuality)}`)
  lines.push(`    Guardian Grade:       ${gradeColor(result.stats.guardianGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Phoenix Rising:  ${result.stats.phoenixRisingCount}`)
  lines.push(`    Ember Gathering: ${result.stats.emberGatheringCount}`)
  lines.push(`    Ash Nesting:     ${result.stats.ashNestingCount}`)
  lines.push(`    Scattered Embers:${result.stats.scatteredEmbersCount}`)
  lines.push(`    Cold Ash:        ${result.stats.coldAshCount}`)
  lines.push(`    Void:            ${result.stats.voidCount}`)
  lines.push('')

  if (result.stats.bestFragment) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Fragment:   ${result.stats.bestFragment}`)
    lines.push(`    Best Potential:  ${result.stats.bestPotential}`)
    lines.push(`    Richest Ash:     ${result.stats.richestAsh}`)
    lines.push(`    Best Rebirth:    ${result.stats.bestRebirth}`)
    lines.push(`    Best Memory:     ${result.stats.bestMemory}`)
    lines.push(`    Most Immortal:   ${result.stats.mostImmortal}`)
    lines.push('')
  }

  if (verbose && result.fragments.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const f of result.fragments) {
      lines.push(`    ${chalk.rgb(255, 140, 0)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Ember: ${heatColor(f.ember.heat)}(${f.emberPotential})  Ash: ${compositionColor(f.ash.composition)}(${f.ashRichness})  Rebirth: ${stageColor(f.rebirth.stage)}(${f.rebirthCapability})`)
      lines.push(`      Flame: ${clarityColor(f.flame.clarity)}(${f.flameMemory})  Immortal: ${immortalQualityColor(f.immortal.quality)}(${f.immortalPatterns})  Rising: ${trajectoryColor(f.rising.trajectory)}(${f.risingQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(255, 140, 0)('\u{1F525}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
