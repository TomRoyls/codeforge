import chalk from 'chalk'

import type { MoondialGardenResult } from './moondial-garden-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('moonlit-paradise') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'moonlit-paradise': return chalk.rgb(255, 215, 0).bold(condition)
    case 'silver-garden': return chalk.rgb(192, 192, 192)(condition)
    case 'moonlit-path': return chalk.rgb(52, 152, 219)(condition)
    case 'dark-garden': return chalk.rgb(241, 196, 15)(condition)
    case 'shadow-patch': return chalk.rgb(230, 126, 34)(condition)
    case 'barren-ground': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('lunar-master') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'lunar-master': return chalk.rgb(255, 215, 0).bold(grade)
    case 'night-gardener': return chalk.rgb(46, 204, 113)(grade)
    case 'moon-gazer': return chalk.rgb(155, 89, 182)(grade)
    case 'stargazer': return chalk.rgb(52, 152, 219)(grade)
    case 'wanderer': return chalk.rgb(241, 196, 15)(grade)
    case 'sleepwalker': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example phaseColor('full-moon') returns colored string */
export function phaseColor(phase: string): string {
  switch (phase) {
    case 'full-moon': return chalk.rgb(255, 215, 0).bold(phase)
    case 'gibbous': return chalk.rgb(46, 204, 113)(phase)
    case 'half-moon': return chalk.rgb(155, 89, 182)(phase)
    case 'crescent': return chalk.rgb(52, 152, 219)(phase)
    case 'new-moon': return chalk.rgb(241, 196, 15)(phase)
    case 'eclipse': return chalk.rgb(231, 76, 60)(phase)
    default: return phase
  }
}

/** @example cycleColor('circadian-perfect') returns colored string */
export function cycleColor(cycle: string): string {
  switch (cycle) {
    case 'circadian-perfect': return chalk.rgb(255, 215, 0).bold(cycle)
    case 'diurnal': return chalk.rgb(46, 204, 113)(cycle)
    case 'crepuscular': return chalk.rgb(155, 89, 182)(cycle)
    case 'nocturnal': return chalk.rgb(52, 152, 219)(cycle)
    case 'arrhythmic': return chalk.rgb(241, 196, 15)(cycle)
    case 'chaotic': return chalk.rgb(231, 76, 60)(cycle)
    default: return cycle
  }
}

/** @example sightColor('owl-vision') returns colored string */
export function sightColor(sight: string): string {
  switch (sight) {
    case 'owl-vision': return chalk.rgb(255, 215, 0).bold(sight)
    case 'night-eyes': return chalk.rgb(46, 204, 113)(sight)
    case 'low-light': return chalk.rgb(155, 89, 182)(sight)
    case 'dim-sight': return chalk.rgb(52, 152, 219)(sight)
    case 'near-blind': return chalk.rgb(241, 196, 15)(sight)
    case 'blind': return chalk.rgb(231, 76, 60)(sight)
    default: return sight
  }
}

/** @example healthColor('flourishing') returns colored string */
export function healthColor(health: string): string {
  switch (health) {
    case 'flourishing': return chalk.rgb(255, 215, 0).bold(health)
    case 'blooming': return chalk.rgb(46, 204, 113)(health)
    case 'growing': return chalk.rgb(155, 89, 182)(health)
    case 'dormant': return chalk.rgb(52, 152, 219)(health)
    case 'wilting': return chalk.rgb(241, 196, 15)(health)
    case 'dead': return chalk.rgb(231, 76, 60)(health)
    default: return health
  }
}

/** @example lightColor('moonlit-path') returns colored string */
export function lightColor(light: string): string {
  switch (light) {
    case 'moonlit-path': return chalk.rgb(255, 215, 0).bold(light)
    case 'starlight': return chalk.rgb(46, 204, 113)(light)
    case 'twilight': return chalk.rgb(155, 89, 182)(light)
    case 'deep-dusk': return chalk.rgb(52, 152, 219)(light)
    case 'pitch-dark': return chalk.rgb(241, 196, 15)(light)
    case 'void': return chalk.rgb(231, 76, 60)(light)
    default: return light
  }
}

/** @example qualityColor('pole-star') returns colored string */
export function qualityColor(quality: string): string {
  switch (quality) {
    case 'pole-star': return chalk.rgb(255, 215, 0).bold(quality)
    case 'constellation': return chalk.rgb(46, 204, 113)(quality)
    case 'star-chart': return chalk.rgb(155, 89, 182)(quality)
    case 'random-stars': return chalk.rgb(52, 152, 219)(quality)
    case 'cloud-cover': return chalk.rgb(241, 196, 15)(quality)
    case 'void': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example plotTypeColor('formal-garden') returns colored string */
export function plotTypeColor(type: string): string {
  switch (type) {
    case 'formal-garden': return chalk.rgb(255, 215, 0).bold(type)
    case 'moonlight-garden': return chalk.rgb(46, 204, 113)(type)
    case 'wild-garden': return chalk.rgb(155, 89, 182)(type)
    case 'neglected-plot': return chalk.rgb(52, 152, 219)(type)
    case 'wasteland': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example plotConditionColor('ethereal-paradise') returns colored string */
export function plotConditionColor(condition: string): string {
  switch (condition) {
    case 'ethereal-paradise': return chalk.rgb(255, 215, 0).bold(condition)
    case 'silver-oasis': return chalk.rgb(46, 204, 113)(condition)
    case 'moonlit-retreat': return chalk.rgb(155, 89, 182)(condition)
    case 'dim-garden': return chalk.rgb(52, 152, 219)(condition)
    case 'dark-corner': return chalk.rgb(241, 196, 15)(condition)
    case 'barren': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatMoondialGardenJson(result) returns JSON string */
export function formatMoondialGardenJson(result: MoondialGardenResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatMoondialGardenTable(result, verbose) returns formatted string */
export function formatMoondialGardenTable(result: MoondialGardenResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(200, 200, 255).bold('  Moondial Garden Analysis'))
  lines.push('')

  lines.push(chalk.rgb(200, 200, 255)('  Estate Overview:'))
  lines.push(`    Overall Luminance:  ${scoreColor(result.estate.overallLuminance)}`)
  lines.push(`    Avg Lunar:          ${scoreColor(result.estate.avgLunar)}`)
  lines.push(`    Avg Circadian:      ${scoreColor(result.estate.avgCircadian)}`)
  lines.push(`    Avg Starlight:      ${scoreColor(result.estate.avgStarlight)}`)
  lines.push(`    Is Luminous:        ${result.estate.isLuminous ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(200, 200, 255)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Plots:            ${result.stats.totalPlots}`)
  lines.push(`    Avg Lunar Reflection:   ${scoreColor(result.stats.avgLunarReflection)}`)
  lines.push(`    Avg Circadian Rhythm:   ${scoreColor(result.stats.avgCircadianRhythm)}`)
  lines.push(`    Avg Nocturnal Wisdom:   ${scoreColor(result.stats.avgNocturnalWisdom)}`)
  lines.push(`    Avg Garden Cultivation: ${scoreColor(result.stats.avgGardenCultivation)}`)
  lines.push(`    Avg Moonlit Clarity:    ${scoreColor(result.stats.avgMoonlitClarity)}`)
  lines.push(`    Avg Starlight Guidance: ${scoreColor(result.stats.avgStarlightGuidance)}`)
  lines.push(`    Gardener Grade:         ${gradeColor(result.stats.gardenerGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(200, 200, 255)('  Condition Counts:'))
  lines.push(`    Moonlit Paradise: ${result.stats.moonlitParadiseCount}`)
  lines.push(`    Silver Garden:    ${result.stats.silverGardenCount}`)
  lines.push(`    Moonlit Path:     ${result.stats.moonlitPathCount}`)
  lines.push(`    Dark Garden:      ${result.stats.darkGardenCount}`)
  lines.push(`    Shadow Patch:     ${result.stats.shadowPatchCount}`)
  lines.push(`    Barren Ground:    ${result.stats.barrenGroundCount}`)
  lines.push('')

  if (result.stats.bestPlant) {
    lines.push(chalk.rgb(200, 200, 255)('  Highlights:'))
    lines.push(`    Best Plant:        ${result.stats.bestPlant}`)
    lines.push(`    Best Documented:   ${result.stats.bestDocumented}`)
    lines.push(`    Most Rhythmic:     ${result.stats.mostRhythmic}`)
    lines.push(`    Wisest:            ${result.stats.wisest}`)
    lines.push(`    Best Cultivated:   ${result.stats.bestCultivated}`)
    lines.push(`    Clearest:          ${result.stats.clearest}`)
    lines.push('')
  }

  if (verbose && result.plants.length > 0) {
    lines.push(chalk.rgb(200, 200, 255)('  Per-File Details:'))
    for (const p of result.plants) {
      lines.push(`    ${chalk.rgb(169, 169, 169)(p.file)}`)
      lines.push(`      Score: ${scoreColor(p.qualityScore)}  Condition: ${conditionColor(p.condition)}`)
      lines.push(`      Lunar: ${phaseColor(p.lunar.phase)}(${p.lunarReflection})  Circadian: ${cycleColor(p.circadian.cycle)}(${p.circadianRhythm})  Nocturnal: ${sightColor(p.nocturnal.sight)}(${p.nocturnalWisdom})`)
      lines.push(`      Garden: ${healthColor(p.garden.health)}(${p.gardenCultivation})  Clarity: ${lightColor(p.clarity.light)}(${p.moonlitClarity})  Star: ${qualityColor(p.starlight.quality)}(${p.starlightGuidance})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(200, 200, 255)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(200, 200, 255)('\u{1F33F}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
