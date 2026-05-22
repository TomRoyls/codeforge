import chalk from 'chalk'

import type { RookeryNestResult } from './rookery-nest-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('master-weaver') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'master-weaver': return chalk.rgb(46, 204, 113).bold(condition)
    case 'eagle-nest': return chalk.rgb(52, 152, 219)(condition)
    case 'swallow-colony': return chalk.rgb(155, 89, 182)(condition)
    case 'pigeon-roost': return chalk.rgb(241, 196, 15)(condition)
    case 'ground-nest': return chalk.rgb(230, 126, 34)(condition)
    case 'cuckoo-laying': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('master-ornithologist') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'master-ornithologist': return chalk.rgb(46, 204, 113).bold(grade)
    case 'bird-bander': return chalk.rgb(52, 152, 219)(grade)
    case 'birdwatcher': return chalk.rgb(155, 89, 182)(grade)
    case 'amateur': return chalk.rgb(241, 196, 15)(grade)
    case 'nest-inspector': return chalk.rgb(230, 126, 34)(grade)
    case 'egg-collector': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example treeTypeColor('ancient-oak') returns colored string */
export function treeTypeColor(treeType: string): string {
  switch (treeType) {
    case 'ancient-oak': return chalk.rgb(46, 204, 113)(treeType)
    case 'mature-tree': return chalk.rgb(52, 152, 219)(treeType)
    case 'young-tree': return chalk.rgb(155, 89, 182)(treeType)
    case 'hedgerow': return chalk.rgb(241, 196, 15)(treeType)
    case 'cliff-face': return chalk.rgb(230, 126, 34)(treeType)
    case 'ground': return chalk.rgb(231, 76, 60)(treeType)
    default: return treeType
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatRookeryNestJson(result) returns JSON string */
export function formatRookeryNestJson(result: RookeryNestResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatRookeryNestTable(result, verbose) returns formatted string */
export function formatRookeryNestTable(result: RookeryNestResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(44, 62, 80).bold('  Rookery Nest Analysis'))
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Colony Overview:'))
  lines.push(`    Overall Colony:    ${scoreColor(result.rookery.overallColony)}`)
  lines.push(`    Avg Construction:  ${scoreColor(result.rookery.avgConstruction)}`)
  lines.push(`    Avg Depth:         ${scoreColor(result.rookery.avgDepth)}`)
  lines.push(`    Avg Fledging:      ${scoreColor(result.rookery.avgFledging)}`)
  lines.push(`    Healthy Colony:    ${result.rookery.isHealthyColony ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Statistics:'))
  lines.push(`    Total Files:       ${result.stats.totalFiles}`)
  lines.push(`    Total Trees:       ${result.stats.totalTrees}`)
  lines.push(`    Master Weavers:    ${result.stats.masterWeaverCount}`)
  lines.push(`    Eagle Nests:       ${result.stats.eagleNestCount}`)
  lines.push(`    Swallow Colonies:  ${result.stats.swallowColonyCount}`)
  lines.push(`    Pigeon Roosts:     ${result.stats.pigeonRoostCount}`)
  lines.push(`    Ground Nests:      ${result.stats.groundNestCount}`)
  lines.push(`    Cuckoo Laying:     ${result.stats.cuckooCount}`)
  lines.push(`    Well Built:        ${result.stats.isWellBuiltCount}`)
  lines.push(`    Proper Abstraction:${result.stats.hasProperAbstractionCount}`)
  lines.push(`    High Quality:      ${result.stats.isHighQualityCount}`)
  lines.push(`    Mature:            ${result.stats.isMatureCount}`)
  lines.push(`    Ready:             ${result.stats.isReadyCount}`)
  lines.push('')

  lines.push(chalk.rgb(44, 62, 80)('  Grades & Highlights:'))
  lines.push(`    Ornithologist:     ${gradeColor(result.stats.ornithologistGrade)}`)
  lines.push(`    Best Nest:         ${result.stats.bestNest || 'N/A'}`)
  lines.push(`    Best Constructed:  ${result.stats.bestConstructed || 'N/A'}`)
  lines.push(`    Shallowest Depth:  ${result.stats.shallowestDepth || 'N/A'}`)
  lines.push(`    Best Material:     ${result.stats.bestMaterial || 'N/A'}`)
  lines.push(`    Most Organized:    ${result.stats.mostOrganized || 'N/A'}`)
  lines.push('')

  if (verbose && result.nests.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Per-Nest Breakdown:'))
    for (const nest of result.nests) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(nest.file)}`)
      lines.push(`      Condition:       ${conditionColor(nest.condition)}`)
      lines.push(`      Quality Score:   ${scoreColor(nest.qualityScore)}`)
      lines.push(`      Construction:    ${scoreColor(nest.nestConstruction)} (${nest.construction.type})`)
      lines.push(`      Depth:           ${scoreColor(nest.nestingDepth)} (${nest.depth.category})`)
      lines.push(`      Material:        ${scoreColor(nest.nestingMaterial)} (${nest.material.type})`)
      lines.push(`      Colony Org:      ${scoreColor(nest.colonyOrganization)} (${nest.colony.pattern})`)
      lines.push(`      Incubation:      ${scoreColor(nest.incubationQuality)} (${nest.incubation.stage})`)
      lines.push(`      Fledging:        ${scoreColor(nest.fledgingSuccess)} (${nest.fledging.readiness})`)
    }
    lines.push('')
  }

  if (result.trees.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Trees:'))
    for (const tree of result.trees) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(tree.directory)} — ${treeTypeColor(tree.treeType)} (${tree.condition})`)
      lines.push(`      Nests: ${tree.nests.length}, Master Weavers: ${tree.masterWeaverCount}, Ready: ${tree.readyCount}`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(44, 62, 80)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    • ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
