import chalk from 'chalk'

import type { ThunderbirdNestResult } from './thunderbird-nest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('mythical-artifact') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'mythical-artifact': return chalk.rgb(255, 215, 0).bold(condition)
    case 'sacred-relic': return chalk.rgb(46, 204, 113)(condition)
    case 'powerful-totem': return chalk.rgb(52, 152, 219)(condition)
    case 'mundane-object': return chalk.rgb(241, 196, 15)(condition)
    case 'broken-shard': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('mythical-shaman') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'mythical-shaman': return chalk.rgb(255, 215, 0).bold(grade)
    case 'storm-caller': return chalk.rgb(46, 204, 113)(grade)
    case 'sky-watcher': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'grounded': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example intensityColor('category-5') returns colored string */
export function intensityColor(intensity: string): string {
  switch (intensity) {
    case 'category-5': return chalk.rgb(255, 215, 0).bold(intensity)
    case 'major-storm': return chalk.rgb(46, 204, 113)(intensity)
    case 'thunderstorm': return chalk.rgb(155, 89, 182)(intensity)
    case 'squall': return chalk.rgb(52, 152, 219)(intensity)
    case 'breeze': return chalk.rgb(241, 196, 15)(intensity)
    case 'calm': return chalk.rgb(231, 76, 60)(intensity)
    default: return intensity
  }
}

/** @example velocityColor('lightning-bolt') returns colored string */
export function velocityColor(velocity: string): string {
  switch (velocity) {
    case 'lightning-bolt': return chalk.rgb(255, 215, 0).bold(velocity)
    case 'rapid-flash': return chalk.rgb(46, 204, 113)(velocity)
    case 'quick-strike': return chalk.rgb(155, 89, 182)(velocity)
    case 'rolling-thunder': return chalk.rgb(52, 152, 219)(velocity)
    case 'distant-rumble': return chalk.rgb(241, 196, 15)(velocity)
    case 'no-flash': return chalk.rgb(231, 76, 60)(velocity)
    default: return velocity
  }
}

/** @example volumeColor('deafening') returns colored string */
export function volumeColor(volume: string): string {
  switch (volume) {
    case 'deafening': return chalk.rgb(255, 215, 0).bold(volume)
    case 'loud': return chalk.rgb(46, 204, 113)(volume)
    case 'moderate': return chalk.rgb(155, 89, 182)(volume)
    case 'distant': return chalk.rgb(52, 152, 219)(volume)
    case 'whisper': return chalk.rgb(241, 196, 15)(volume)
    case 'silent': return chalk.rgb(231, 76, 60)(volume)
    default: return volume
  }
}

/** @example wardColor('impervious') returns colored string */
export function wardColor(ward: string): string {
  switch (ward) {
    case 'impervious': return chalk.rgb(255, 215, 0).bold(ward)
    case 'strong-ward': return chalk.rgb(46, 204, 113)(ward)
    case 'protected': return chalk.rgb(155, 89, 182)(ward)
    case 'light-shield': return chalk.rgb(52, 152, 219)(ward)
    case 'vulnerable': return chalk.rgb(241, 196, 15)(ward)
    case 'exposed': return chalk.rgb(231, 76, 60)(ward)
    default: return ward
  }
}

/** @example nestQualityColor('eagle-nest') returns colored string */
export function nestQualityColor(quality: string): string {
  switch (quality) {
    case 'eagle-nest': return chalk.rgb(255, 215, 0).bold(quality)
    case 'well-woven': return chalk.rgb(46, 204, 113)(quality)
    case 'sturdy': return chalk.rgb(155, 89, 182)(quality)
    case 'basic': return chalk.rgb(52, 152, 219)(quality)
    case 'flimsy': return chalk.rgb(241, 196, 15)(quality)
    case 'scattered': return chalk.rgb(231, 76, 60)(quality)
    default: return quality
  }
}

/** @example rankColor('legendary') returns colored string */
export function rankColor(rank: string): string {
  switch (rank) {
    case 'legendary': return chalk.rgb(255, 215, 0).bold(rank)
    case 'epic': return chalk.rgb(46, 204, 113)(rank)
    case 'rare': return chalk.rgb(155, 89, 182)(rank)
    case 'uncommon': return chalk.rgb(52, 152, 219)(rank)
    case 'common': return chalk.rgb(241, 196, 15)(rank)
    case 'mundane': return chalk.rgb(231, 76, 60)(rank)
    default: return rank
  }
}

/** @example levelTypeColor('mythical-aerie') returns colored string */
export function levelTypeColor(type: string): string {
  switch (type) {
    case 'mythical-aerie': return chalk.rgb(255, 215, 0).bold(type)
    case 'storm-perch': return chalk.rgb(46, 204, 113)(type)
    case 'mountain-nest': return chalk.rgb(155, 89, 182)(type)
    case 'tree-branch': return chalk.rgb(52, 152, 219)(type)
    case 'ground-level': return chalk.rgb(241, 196, 15)(type)
    case 'underground': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example levelConditionColor('divine-sanctuary') returns colored string */
export function levelConditionColor(condition: string): string {
  switch (condition) {
    case 'divine-sanctuary': return chalk.rgb(255, 215, 0).bold(condition)
    case 'storm-fortress': return chalk.rgb(46, 204, 113)(condition)
    case 'mountain-retreat': return chalk.rgb(155, 89, 182)(condition)
    case 'shelter': return chalk.rgb(52, 152, 219)(condition)
    case 'exposed': return chalk.rgb(241, 196, 15)(condition)
    case 'ruined': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatThunderbirdNestJson(result) returns JSON string */
export function formatThunderbirdNestJson(result: ThunderbirdNestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatThunderbirdNestTable(result, verbose) returns formatted string */
export function formatThunderbirdNestTable(result: ThunderbirdNestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Thunderbird Nest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Sky Overview:'))
  lines.push(`    Overall Power:      ${scoreColor(result.sky.overallPower)}`)
  lines.push(`    Avg Storm Power:    ${scoreColor(result.sky.avgPower)}`)
  lines.push(`    Avg Lightning Speed:${scoreColor(result.sky.avgSpeed)}`)
  lines.push(`    Avg Mythical:       ${scoreColor(result.sky.avgMythical)}`)
  lines.push(`    Is Mythical:        ${result.sky.isMythical ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:             ${result.stats.totalFiles}`)
  lines.push(`    Total Levels:            ${result.stats.totalLevels}`)
  lines.push(`    Avg Storm Power:         ${scoreColor(result.stats.avgStormPower)}`)
  lines.push(`    Avg Lightning Speed:     ${scoreColor(result.stats.avgLightningSpeed)}`)
  lines.push(`    Avg Thunder Impact:      ${scoreColor(result.stats.avgThunderImpact)}`)
  lines.push(`    Avg Sacred Protection:   ${scoreColor(result.stats.avgSacredProtection)}`)
  lines.push(`    Avg Nest Construction:   ${scoreColor(result.stats.avgNestConstruction)}`)
  lines.push(`    Avg Mythical Quality:    ${scoreColor(result.stats.avgMythicalQuality)}`)
  lines.push(`    Shaman Grade:            ${gradeColor(result.stats.shamanGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Mythical Artifact: ${result.stats.mythicalArtifactCount}`)
  lines.push(`    Sacred Relic:      ${result.stats.sacredRelicCount}`)
  lines.push(`    Powerful Totem:    ${result.stats.powerfulTotemCount}`)
  lines.push(`    Mundane Object:    ${result.stats.mundaneObjectCount}`)
  lines.push(`    Broken Shard:      ${result.stats.brokenShardCount}`)
  lines.push(`    Dust:              ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestFeather) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Feather:     ${result.stats.bestFeather}`)
    lines.push(`    Most Powerful:    ${result.stats.mostPowerful}`)
    lines.push(`    Fastest:          ${result.stats.fastest}`)
    lines.push(`    Most Impactful:   ${result.stats.mostImpactful}`)
    lines.push(`    Most Protected:   ${result.stats.mostProtected}`)
    lines.push(`    Best Architected: ${result.stats.bestArchitected}`)
    lines.push('')
  }

  if (verbose && result.feathers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const f of result.feathers) {
      lines.push(`    ${chalk.rgb(155, 89, 182)(f.file)}`)
      lines.push(`      Score: ${scoreColor(f.qualityScore)}  Condition: ${conditionColor(f.condition)}`)
      lines.push(`      Storm: ${intensityColor(f.storm.intensity)}(${f.stormPower})  Lightning: ${velocityColor(f.lightning.velocity)}(${f.lightningSpeed})  Thunder: ${volumeColor(f.thunder.volume)}(${f.thunderImpact})`)
      lines.push(`      Sacred: ${wardColor(f.sacred.ward)}(${f.sacredProtection})  Nest: ${nestQualityColor(f.nest.quality)}(${f.nestConstruction})  Mythical: ${rankColor(f.mythical.rank)}(${f.mythicalQuality})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u26A1')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
