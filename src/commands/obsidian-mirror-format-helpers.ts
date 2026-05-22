import chalk from 'chalk'

import type { ObsidianMirrorResult } from './obsidian-mirror-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('divine-mirror') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'divine-mirror': return chalk.rgb(255, 215, 0).bold(condition)
    case 'noble-artifact': return chalk.rgb(46, 204, 113)(condition)
    case 'working-tool': return chalk.rgb(52, 152, 219)(condition)
    case 'cracked-mirror': return chalk.rgb(241, 196, 15)(condition)
    case 'shard': return chalk.rgb(230, 126, 34)(condition)
    case 'dust': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('high-priest') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'high-priest': return chalk.rgb(255, 215, 0).bold(grade)
    case 'oracle': return chalk.rgb(46, 204, 113)(grade)
    case 'seer': return chalk.rgb(155, 89, 182)(grade)
    case 'apprentice': return chalk.rgb(52, 152, 219)(grade)
    case 'novice': return chalk.rgb(241, 196, 15)(grade)
    case 'blind': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example clarityColor('perfect-mirror') returns colored string */
export function clarityColor(clarity: string): string {
  switch (clarity) {
    case 'perfect-mirror': return chalk.rgb(255, 215, 0).bold(clarity)
    case 'clear': return chalk.rgb(46, 204, 113)(clarity)
    case 'slight-haze': return chalk.rgb(155, 89, 182)(clarity)
    case 'clouded': return chalk.rgb(52, 152, 219)(clarity)
    case 'cracked': return chalk.rgb(241, 196, 15)(clarity)
    case 'shattered': return chalk.rgb(231, 76, 60)(clarity)
    default: return clarity
  }
}

/** @example truthColor('absolute-truth') returns colored string */
export function truthColor(truth: string): string {
  switch (truth) {
    case 'absolute-truth': return chalk.rgb(255, 215, 0).bold(truth)
    case 'honest': return chalk.rgb(46, 204, 113)(truth)
    case 'mostly-true': return chalk.rgb(155, 89, 182)(truth)
    case 'half-truth': return chalk.rgb(52, 152, 219)(truth)
    case 'deceptive': return chalk.rgb(241, 196, 15)(truth)
    case 'illusion': return chalk.rgb(231, 76, 60)(truth)
    default: return truth
  }
}

/** @example shadowColor('shadow-master') returns colored string */
export function shadowColor(depth: string): string {
  switch (depth) {
    case 'shadow-master': return chalk.rgb(255, 215, 0).bold(depth)
    case 'comfortable': return chalk.rgb(46, 204, 113)(depth)
    case 'aware': return chalk.rgb(155, 89, 182)(depth)
    case 'nervous': return chalk.rgb(52, 152, 219)(depth)
    case 'fearful': return chalk.rgb(241, 196, 15)(depth)
    case 'overwhelmed': return chalk.rgb(231, 76, 60)(depth)
    default: return depth
  }
}

/** @example polishColor('museum-quality') returns colored string */
export function polishColor(polish: string): string {
  switch (polish) {
    case 'museum-quality': return chalk.rgb(255, 215, 0).bold(polish)
    case 'well-polished': return chalk.rgb(46, 204, 113)(polish)
    case 'smooth': return chalk.rgb(155, 89, 182)(polish)
    case 'rough': return chalk.rgb(52, 152, 219)(polish)
    case 'jagged': return chalk.rgb(241, 196, 15)(polish)
    case 'raw-stone': return chalk.rgb(231, 76, 60)(polish)
    default: return polish
  }
}

/** @example visionColor('oracle') returns colored string */
export function visionColor(vision: string): string {
  switch (vision) {
    case 'oracle': return chalk.rgb(255, 215, 0).bold(vision)
    case 'seer': return chalk.rgb(46, 204, 113)(vision)
    case 'clairvoyant': return chalk.rgb(155, 89, 182)(vision)
    case 'short-sighted': return chalk.rgb(52, 152, 219)(vision)
    case 'blind': return chalk.rgb(241, 196, 15)(vision)
    case 'catastrophic': return chalk.rgb(231, 76, 60)(vision)
    default: return vision
  }
}

/** @example strengthColor('diamond-hard') returns colored string */
export function strengthColor(strength: string): string {
  switch (strength) {
    case 'diamond-hard': return chalk.rgb(255, 215, 0).bold(strength)
    case 'obsidian-strong': return chalk.rgb(46, 204, 113)(strength)
    case 'basalt-firm': return chalk.rgb(155, 89, 182)(strength)
    case 'pumice-light': return chalk.rgb(52, 152, 219)(strength)
    case 'ash-weak': return chalk.rgb(241, 196, 15)(strength)
    case 'dust': return chalk.rgb(231, 76, 60)(strength)
    default: return strength
  }
}

/** @example chamberTypeColor('temple-vault') returns colored string */
export function chamberTypeColor(type: string): string {
  switch (type) {
    case 'temple-vault': return chalk.rgb(255, 215, 0).bold(type)
    case 'scrying-room': return chalk.rgb(46, 204, 113)(type)
    case 'meditation-hall': return chalk.rgb(155, 89, 182)(type)
    case 'mirror-gallery': return chalk.rgb(52, 152, 219)(type)
    case 'storage': return chalk.rgb(241, 196, 15)(type)
    case 'rubble': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example chamberConditionColor('oracle-chamber') returns colored string */
export function chamberConditionColor(condition: string): string {
  switch (condition) {
    case 'oracle-chamber': return chalk.rgb(255, 215, 0).bold(condition)
    case 'hall-of-truth': return chalk.rgb(46, 204, 113)(condition)
    case 'reflection-room': return chalk.rgb(155, 89, 182)(condition)
    case 'clouded-hall': return chalk.rgb(52, 152, 219)(condition)
    case 'shattered-room': return chalk.rgb(241, 196, 15)(condition)
    case 'void': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatObsidianMirrorJson(result) returns JSON string */
export function formatObsidianMirrorJson(result: ObsidianMirrorResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatObsidianMirrorTable(result, verbose) returns formatted string */
export function formatObsidianMirrorTable(result: ObsidianMirrorResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(50, 50, 60).bold('  Obsidian Mirror Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Temple Overview:'))
  lines.push(`    Overall Clarity:  ${scoreColor(result.temple.overallClarity)}`)
  lines.push(`    Avg Reflection:   ${scoreColor(result.temple.avgReflection)}`)
  lines.push(`    Avg Truth:        ${scoreColor(result.temple.avgTruth)}`)
  lines.push(`    Avg Prophetic:    ${scoreColor(result.temple.avgProphetic)}`)
  lines.push(`    Is Clear:         ${result.temple.isClear ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:          ${result.stats.totalFiles}`)
  lines.push(`    Total Chambers:       ${result.stats.totalChambers}`)
  lines.push(`    Avg Reflection:       ${scoreColor(result.stats.avgReflectionQuality)}`)
  lines.push(`    Avg Truth:            ${scoreColor(result.stats.avgTruthRevelation)}`)
  lines.push(`    Avg Shadow:           ${scoreColor(result.stats.avgShadowIntegration)}`)
  lines.push(`    Avg Surface:          ${scoreColor(result.stats.avgSurfaceSmoothness)}`)
  lines.push(`    Avg Prophetic:        ${scoreColor(result.stats.avgPropheticInsight)}`)
  lines.push(`    Avg Volcanic:         ${scoreColor(result.stats.avgVolcanicOrigin)}`)
  lines.push(`    Priest Grade:         ${gradeColor(result.stats.priestGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Divine Mirror:   ${result.stats.divineMirrorCount}`)
  lines.push(`    Noble Artifact:  ${result.stats.nobleArtifactCount}`)
  lines.push(`    Working Tool:    ${result.stats.workingToolCount}`)
  lines.push(`    Cracked Mirror:  ${result.stats.crackedMirrorCount}`)
  lines.push(`    Shard:           ${result.stats.shardCount}`)
  lines.push(`    Dust:            ${result.stats.dustCount}`)
  lines.push('')

  if (result.stats.bestShard) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Shard:       ${result.stats.bestShard}`)
    lines.push(`    Clearest:         ${result.stats.clearest}`)
    lines.push(`    Most Honest:      ${result.stats.mostHonest}`)
    lines.push(`    Best Shadow:      ${result.stats.bestShadow}`)
    lines.push(`    Smoothest:        ${result.stats.smoothest}`)
    lines.push(`    Most Insightful:  ${result.stats.mostInsightful}`)
    lines.push('')
  }

  if (verbose && result.shards.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const s of result.shards) {
      lines.push(`    ${chalk.rgb(50, 50, 60)(s.file)}`)
      lines.push(`      Score: ${scoreColor(s.qualityScore)}  Condition: ${conditionColor(s.condition)}`)
      lines.push(`      Reflection: ${clarityColor(s.reflection.clarity)}(${s.reflectionQuality})  Truth: ${truthColor(s.truth.level)}(${s.truthRevelation})  Shadow: ${shadowColor(s.shadow.depth)}(${s.shadowIntegration})`)
      lines.push(`      Surface: ${polishColor(s.surface.polish)}(${s.surfaceSmoothness})  Prophetic: ${visionColor(s.prophetic.vision)}(${s.propheticInsight})  Volcanic: ${strengthColor(s.volcanic.strength)}(${s.volcanicOrigin})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(50, 50, 60)('\u{1FA9E}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
