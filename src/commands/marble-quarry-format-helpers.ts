import chalk from 'chalk'

import type {
  QuarryBlock,
  QuarryGallery,
  MarbleQuarryStats,
  MarbleQuarryResult,
} from './marble-quarry-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green-tinted string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('carrara-masterpiece') returns bold green string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'carrara-masterpiece': return chalk.rgb(46, 204, 113).bold(condition)
    case 'premium-block': return chalk.rgb(52, 152, 219)(condition)
    case 'quality-stone': return chalk.rgb(155, 89, 182)(condition)
    case 'building-marble': return chalk.rgb(241, 196, 15)(condition)
    case 'rough-block': return chalk.rgb(230, 126, 34)(condition)
    case 'rubble': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example stoneTypeColor('carrara') returns white string */
export function stoneTypeColor(type: string): string {
  switch (type) {
    case 'carrara': return chalk.rgb(236, 240, 241).bold(type)
    case 'calacatta': return chalk.rgb(189, 195, 199)(type)
    case 'statuario': return chalk.rgb(52, 152, 219)(type)
    case 'thassos': return chalk.rgb(46, 204, 113)(type)
    case 'travertine': return chalk.rgb(241, 196, 15)(type)
    case 'concrete': return chalk.rgb(149, 165, 166)(type)
    default: return type
  }
}

/** @example grainPatternColor('fine') returns colored string */
export function grainPatternColor(pattern: string): string {
  switch (pattern) {
    case 'fine': return chalk.rgb(46, 204, 113)(pattern)
    case 'medium': return chalk.rgb(52, 152, 219)(pattern)
    case 'coarse': return chalk.rgb(241, 196, 15)(pattern)
    case 'mixed': return chalk.rgb(230, 126, 34)(pattern)
    case 'brecciated': return chalk.rgb(231, 76, 60)(pattern)
    case 'chaotic': return chalk.rgb(192, 57, 43).bold(pattern)
    default: return pattern
  }
}

/** @example extractionMethodColor('block-cutting') returns colored string */
export function extractionMethodColor(method: string): string {
  switch (method) {
    case 'block-cutting': return chalk.rgb(46, 204, 113)(method)
    case 'diamond-wire': return chalk.rgb(52, 152, 219)(method)
    case 'chain-saw': return chalk.rgb(155, 89, 182)(method)
    case 'blasting': return chalk.rgb(241, 196, 15)(method)
    case 'pickaxe': return chalk.rgb(230, 126, 34)(method)
    case 'bare-hands': return chalk.rgb(231, 76, 60)(method)
    default: return method
  }
}

/** @example malleabilityColor('soft') returns colored string */
export function malleabilityColor(malleability: string): string {
  switch (malleability) {
    case 'soft': return chalk.rgb(46, 204, 113)(malleability)
    case 'medium': return chalk.rgb(52, 152, 219)(malleability)
    case 'hard': return chalk.rgb(241, 196, 15)(malleability)
    case 'very-hard': return chalk.rgb(230, 126, 34)(malleability)
    case 'brittle': return chalk.rgb(231, 76, 60)(malleability)
    case 'shattered': return chalk.rgb(192, 57, 43).bold(malleability)
    default: return malleability
  }
}

/** @example sculptorGradeColor('master-sculptor') returns bold string */
export function sculptorGradeColor(grade: string): string {
  switch (grade) {
    case 'master-sculptor': return chalk.rgb(46, 204, 113).bold(grade)
    case 'sculptor': return chalk.rgb(52, 152, 219)(grade)
    case 'stone-mason': return chalk.rgb(155, 89, 182)(grade)
    case 'quarryman': return chalk.rgb(241, 196, 15)(grade)
    case 'apprentice': return chalk.rgb(230, 126, 34)(grade)
    case 'tourist-with-hammer': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example galleryCondColor('sculptors-paradise') returns colored string */
export function galleryCondColor(condition: string): string {
  switch (condition) {
    case 'sculptors-paradise': return chalk.rgb(46, 204, 113)(condition)
    case 'quality-quarry': return chalk.rgb(52, 152, 219)(condition)
    case 'working-quarry': return chalk.rgb(241, 196, 15)(condition)
    case 'stripped-mine': return chalk.rgb(230, 126, 34)(condition)
    case 'salvage': return chalk.rgb(231, 76, 60)(condition)
    case 'rubble-heap': return chalk.rgb(192, 57, 43)(condition)
    default: return condition
  }
}

// ─── Format Block ──────────────────────────────────────────────────────────

/** @example formatBlock(block, false) returns formatted string */
export function formatBlock(block: QuarryBlock, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`  ${chalk.bold(block.file)} ${conditionColor(block.condition)} ${scoreColor(block.qualityScore)}`)
  lines.push(`    Stone: ${scoreColor(block.stonePurity)} ${stoneTypeColor(block.stone.type)} | Grain: ${scoreColor(block.grainConsistency)} ${grainPatternColor(block.grain.pattern)}`)
  lines.push(`    Vein: ${scoreColor(block.veinQuality)} | Depth: ${scoreColor(block.quarryDepth)} | Extraction: ${scoreColor(block.extractionQuality)} ${extractionMethodColor(block.extraction.method)}`)
  lines.push(`    Sculpting: ${scoreColor(block.sculptingPotential)} ${malleabilityColor(block.sculpting.malleability)}`)

  if (verbose) {
    if (block.stone.inclusionCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Inclusions:')} ${block.stone.inclusionCount}`)
    if (block.stone.fractureCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Fractures:')} ${block.stone.fractureCount}`)
    if (block.vein.deadEndCount > 0) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Dead-end veins:')} ${block.vein.deadEndCount}`)
    if (block.depth.hasFaultLine) lines.push(`    ${chalk.rgb(231, 76, 60)('⚠ Depth fault line detected')}`)
  }

  return lines.join('\n')
}

/** @example formatGallery(gallery, false) returns formatted string */
export function formatGallery(gallery: QuarryGallery, verbose: boolean): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold(gallery.directory)} ${galleryCondColor(gallery.condition)} (${gallery.galleryType})`)
  lines.push(`  Avg Purity: ${scoreColor(gallery.avgPurity)} | Avg Consistency: ${scoreColor(gallery.avgConsistency)} | Avg Sculpting: ${scoreColor(gallery.avgSculptingPotential)}`)

  if (verbose) {
    lines.push(`  Carrara: ${gallery.carraraCount} | Rubble: ${gallery.rubbleCount} | Workable: ${gallery.workableCount} | Reusable: ${gallery.reusableCount}`)
    for (const block of gallery.blocks) {
      lines.push(formatBlock(block, true))
    }
  }

  return lines.join('\n')
}

/** @example formatStats(stats) returns formatted string */
export function formatStats(stats: MarbleQuarryStats): string {
  const lines: string[] = []
  lines.push(`\n${chalk.bold('=== Marble Quarry Statistics ===')}`)
  lines.push(`Files: ${stats.totalFiles} | Galleries: ${stats.totalGalleries}`)
  lines.push(`Avg Purity: ${scoreColor(stats.avgStonePurity)} | Avg Grain: ${scoreColor(stats.avgGrainConsistency)} | Avg Vein: ${scoreColor(stats.avgVeinQuality)}`)
  lines.push(`Avg Depth: ${scoreColor(stats.avgQuarryDepth)} | Avg Extraction: ${scoreColor(stats.avgExtractionQuality)} | Avg Sculpting: ${scoreColor(stats.avgSculptingPotential)}`)
  lines.push(`Overall Grade: ${scoreColor(stats.overallGrade)} | Sculptor: ${sculptorGradeColor(stats.sculptorGrade)}`)
  lines.push(`Conditions: Carrara=${stats.carraraMasterpieceCount} Premium=${stats.premiumBlockCount} Quality=${stats.qualityStoneCount} Building=${stats.buildingMarbleCount} Rough=${stats.roughBlockCount} Rubble=${stats.rubbleCount}`)
  lines.push(`Best: ${stats.bestBlock} | Purest: ${stats.purestStone} | Most Consistent: ${stats.mostConsistent}`)
  lines.push(`Best Veins: ${stats.bestVeins} | Deepest: ${stats.deepestFoundation}`)
  return lines.join('\n')
}

// ─── Table Format ──────────────────────────────────────────────────────────

/** @example formatMarbleQuarryTable(result, false) returns full table */
export function formatMarbleQuarryTable(result: MarbleQuarryResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n=== Marble Quarry Analysis ===\n'))

  if (result.blocks.length > 0) {
    lines.push(chalk.bold('Quarry Blocks:'))
    for (const block of result.blocks) {
      lines.push(formatBlock(block, verbose))
    }
  }

  if (result.galleries.length > 0) {
    lines.push(chalk.bold('\nGalleries:'))
    for (const gallery of result.galleries) {
      lines.push(formatGallery(gallery, verbose))
    }
  }

  lines.push(formatStats(result.stats))

  if (result.recommendations.length > 0) {
    lines.push(chalk.bold('\nRecommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`)
    }
  }

  return lines.join('\n')
}

// ─── JSON Format ───────────────────────────────────────────────────────────

/** @example formatMarbleQuarryJson(result) returns JSON string */
export function formatMarbleQuarryJson(result: MarbleQuarryResult): string {
  return JSON.stringify(result, null, 2)
}
