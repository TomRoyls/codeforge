import chalk from 'chalk'

import type {
  BatchGrade,
  FabricBatch,
  FabricDefect,
  FabricGrade,
  FabricResult,
  FabricSample,
  FabricStats,
  MaterialType,
  WeavePattern,
} from './fabric-helpers.js'

// ─── Stage Badges ──────────────────────────────────────────────────────────────

const MATERIAL_EMOJI: Record<MaterialType, string> = {
  silk: '🧵',
  cotton: '🧶',
  linen: '🪢',
  wool: '🐑',
  polyester: '🔬',
  burlap: '🪨',
}

const WEAVE_EMOJI: Record<WeavePattern, string> = {
  plain: '⬜',
  twill: '🔷',
  satin: '✨',
  knit: '🧶',
  lace: '🕸️',
  felt: '🧶',
}

const DEFECT_EMOJI: Record<string, string> = {
  snag: '🪝',
  hole: '🕳️',
  'loose-thread': '🧵',
  'color-bleed': '🎨',
  'thin-spot': '📄',
  pilling: '🔴',
}

/**
 * Format a material badge with emoji and color.
 *
 * @example
 * formatMaterialBadge('silk') // => '🧵 silk'
 */
export function formatMaterialBadge(material: MaterialType): string {
  const emoji = MATERIAL_EMOJI[material]
  return `${emoji} ${material}`
}

/**
 * Format a weave pattern badge with emoji.
 *
 * @example
 * formatWeaveBadge('satin') // => '✨ satin'
 */
export function formatWeaveBadge(weave: WeavePattern): string {
  const emoji = WEAVE_EMOJI[weave]
  return `${emoji} ${weave}`
}

/**
 * Format a grade with color coding.
 *
 * @example
 * formatGradeBadge('premium') // => chalk.green('premium')
 */
export function formatGradeBadge(grade: FabricGrade | BatchGrade): string {
  switch (grade) {
    case 'premium': return chalk.rgb(72, 199, 142)(grade)
    case 'high-quality': return chalk.rgb(100, 180, 120)(grade)
    case 'standard': return chalk.rgb(200, 180, 80)(grade)
    case 'economy': return chalk.rgb(220, 150, 80)(grade)
    case 'reject': return chalk.rgb(220, 80, 80)(grade)
    default: return grade
  }
}

// ─── Quality Meter ─────────────────────────────────────────────────────────────

/**
 * Format a quality meter bar (0-100).
 *
 * @example
 * formatQualityMeter(75) // => '████████████████──░░░░░░ 75/100'
 */
export function formatQualityMeter(value: number, width: number = 20): string {
  const filled = Math.round((value / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  const color = value >= 80 ? chalk.rgb(72, 199, 142) : value >= 50 ? chalk.rgb(200, 180, 80) : chalk.rgb(220, 80, 80)
  return color(`${bar} ${value}/100`)
}

// ─── Fabric Sample Card ────────────────────────────────────────────────────────

/**
 * Format a single fabric sample card.
 *
 * @example
 * formatSampleCard(sample) // => '📄 app.ts — 🧵 silk — ⬜ plain — premium'
 */
export function formatSampleCard(sample: FabricSample): string {
  const materialBadge = formatMaterialBadge(sample.material)
  const weaveBadge = formatWeaveBadge(sample.weavePattern)
  const gradeBadge = formatGradeBadge(sample.overallGrade)
  const defectCount = sample.defects.length > 0
    ? chalk.rgb(220, 150, 80)(` (${sample.defects.length} defect${sample.defects.length > 1 ? 's' : ''})`)
    : ''
  return `📄 ${sample.file} — ${materialBadge} — ${weaveBadge} — ${gradeBadge}${defectCount}`
}

// ─── Fabric Sample Table ───────────────────────────────────────────────────────

/**
 * Format all samples as a table.
 *
 * @example
 * formatSampleTable(samples) // => multi-line table string
 */
export function formatSampleTable(samples: FabricSample[]): string {
  if (samples.length === 0) return 'No fabric samples found.'

  const header = chalk.bold('File                         Material     Weave    Thread  Dye    Tensile  Grade')
  const separator = '─'.repeat(88)
  const rows = samples.map(s => {
    const file = s.file.padEnd(28)
    const material = s.material.padEnd(12)
    const weave = s.weavePattern.padEnd(8)
    const thread = String(s.threadCount).padEnd(7)
    const dye = String(s.dyeConsistency).padEnd(6)
    const tensile = String(s.tensileStrength).padEnd(8)
    const grade = formatGradeBadge(s.overallGrade)
    return `${file} ${material} ${weave} ${thread} ${dye} ${tensile} ${grade}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Defect Catalog ────────────────────────────────────────────────────────────

/**
 * Format a single defect.
 *
 * @example
 * formatDefect(defect) // => '🪝 snag (minor) L5: Potential snag...'
 */
export function formatDefect(defect: FabricDefect): string {
  const emoji = DEFECT_EMOJI[defect.type] ?? '⚠️'
  const severity = defect.severity === 'critical'
    ? chalk.rgb(220, 80, 80)(defect.severity)
    : defect.severity === 'major'
      ? chalk.rgb(220, 150, 80)(defect.severity)
      : chalk.rgb(150, 150, 150)(defect.severity)
  return `${emoji} ${defect.type} (${severity}) L${defect.line}: ${defect.description}`
}

/**
 * Format the defect catalog.
 *
 * @example
 * formatDefectCatalog(defects) // => multi-line catalog
 */
export function formatDefectCatalog(defects: FabricDefect[]): string {
  if (defects.length === 0) return chalk.rgb(72, 199, 142)('✓ No defects detected')

  const grouped = new Map<string, FabricDefect[]>()
  for (const d of defects) {
    const existing = grouped.get(d.type) ?? []
    existing.push(d)
    grouped.set(d.type, existing)
  }

  const lines: string[] = [chalk.bold('Defect Catalog:')]
  for (const [type, typeDefects] of grouped) {
    const emoji = DEFECT_EMOJI[type] ?? '⚠️'
    lines.push(`  ${emoji} ${type}: ${typeDefects.length} found`)
    for (const d of typeDefects) {
      const severity = d.severity === 'critical' ? chalk.rgb(220, 80, 80)('[critical]') : d.severity === 'major' ? chalk.rgb(220, 150, 80)('[major]') : '[minor]'
      lines.push(`    L${d.line} ${severity} ${d.description}`)
    }
  }

  return lines.join('\n')
}

// ─── Batch Quality Table ───────────────────────────────────────────────────────

/**
 * Format batch quality table.
 *
 * @example
 * formatBatchTable(batches) // => multi-line table
 */
export function formatBatchTable(batches: FabricBatch[]): string {
  if (batches.length === 0) return 'No batches found.'

  const header = chalk.bold('Batch              Samples  Avg Thread  Material    Quality  Grade')
  const separator = '─'.repeat(70)
  const rows = batches.map(b => {
    const name = b.name.padEnd(18)
    const samples = String(b.samples.length).padEnd(8)
    const thread = String(b.avgThreadCount).padEnd(11)
    const material = b.dominantMaterial.padEnd(11)
    const quality = String(b.batchQuality).padEnd(8)
    const grade = formatGradeBadge(b.grade)
    return `${name} ${samples} ${thread} ${material} ${quality} ${grade}`
  })

  return [header, separator, ...rows].join('\n')
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

/**
 * Format fabric stats summary.
 *
 * @example
 * formatFabricStats(stats) // => multi-line summary
 */
export function formatFabricStats(stats: FabricStats): string {
  const lines = [
    chalk.bold('Fabric Statistics:'),
    `  Total samples: ${stats.totalSamples}`,
    `  Avg thread count: ${stats.avgThreadCount}/100`,
    `  Premium files: ${stats.premiumCount} | Reject files: ${stats.rejectCount}`,
    `  Dominant material: ${formatMaterialBadge(stats.dominantMaterial)}`,
    `  Dominant weave: ${formatWeaveBadge(stats.dominantWeave)}`,
    `  Avg dye consistency: ${stats.avgDyeConsistency}/100`,
    `  Avg tensile strength: ${stats.avgTensileStrength}/100`,
    `  Avg thread quality: ${stats.avgThreadQuality}/100`,
    `  Defects: ${stats.defectCount} total, ${stats.criticalDefects} critical`,
    `  Overall fabric quality: ${formatQualityMeter(stats.overallFabricQuality)}`,
  ]

  if (stats.bestBatch) {
    lines.push(`  Best batch: ${chalk.rgb(72, 199, 142)(stats.bestBatch)}`)
  }
  if (stats.worstBatch) {
    lines.push(`  Worst batch: ${chalk.rgb(220, 150, 80)(stats.worstBatch)}`)
  }

  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations list.
 *
 * @example
 * formatRecommendations(['Fix holes', 'Add types']) // => '💡 Recommendations:\n  • Fix holes\n  • Add types'
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.rgb(72, 199, 142)('✓ Fabric quality is excellent — no recommendations')
  const lines = [chalk.bold('💡 Recommendations:')]
  for (const rec of recommendations) {
    lines.push(`  • ${rec}`)
  }
  return lines.join('\n')
}

// ─── Full Table Output ─────────────────────────────────────────────────────────

/**
 * Format full fabric result as table output.
 *
 * @example
 * formatFabricTable(result, false) // => full console output
 */
export function formatFabricTable(result: FabricResult, verbose: boolean): string {
  const sections: string[] = []

  sections.push(chalk.bold('\nabric Quality Analysis\n'))

  sections.push(formatFabricStats(result.stats))
  sections.push('')

  if (result.samples.length > 0) {
    sections.push(chalk.bold('Sample Analysis:'))
    if (verbose) {
      for (const sample of result.samples) {
        sections.push(formatSampleCard(sample))
        if (sample.defects.length > 0) {
          for (const d of sample.defects) {
            sections.push(`    ${formatDefect(d)}`)
          }
        }
      }
    } else {
      sections.push(formatSampleTable(result.samples))
    }
    sections.push('')
  }

  if (result.batches.length > 0) {
    sections.push(chalk.bold('Batch Quality:'))
    sections.push(formatBatchTable(result.batches))
    sections.push('')
  }

  const allDefects = result.samples.flatMap(s => s.defects)
  if (allDefects.length > 0) {
    sections.push(formatDefectCatalog(allDefects))
    sections.push('')
  }

  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

// ─── JSON Output ───────────────────────────────────────────────────────────────

/**
 * Format fabric result as JSON.
 *
 * @example
 * formatFabricJson(result) // => JSON string
 */
export function formatFabricJson(result: FabricResult): string {
  return JSON.stringify(result, null, 2)
}
