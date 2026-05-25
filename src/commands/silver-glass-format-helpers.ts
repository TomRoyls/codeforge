import chalk from 'chalk'

import type { ReflectionCondition, GalleryCondition, SilverReflection, SilverMirrorResult, SilverGallery } from './silver-glass-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(192, 192, 192)(String(score))
  if (score >= 75) return chalk.rgb(170, 170, 180)(String(score))
  if (score >= 60) return chalk.rgb(140, 140, 160)(String(score))
  if (score >= 40) return chalk.rgb(110, 110, 130)(String(score))
  if (score >= 20) return chalk.rgb(80, 80, 100)(String(score))
  return chalk.gray(String(score))
}

/** @example colorReflectionCondition('silver-masterpiece') */
export function colorReflectionCondition(condition: ReflectionCondition | string): string {
  switch (condition) {
    case 'silver-masterpiece':
      return chalk.rgb(192, 192, 192)('silver-masterpiece')
    case 'perfect-reflection':
      return chalk.rgb(170, 170, 180)('perfect-reflection')
    case 'proper-mirror':
      return chalk.rgb(140, 140, 160)('proper-mirror')
    case 'tarnished-silver':
      return chalk.rgb(110, 110, 130)('tarnished-silver')
    case 'cracked-glass':
      return chalk.rgb(80, 80, 100)('cracked-glass')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

/** @example colorGalleryCondition('grand-gallery') */
export function colorGalleryCondition(condition: GalleryCondition | string): string {
  switch (condition) {
    case 'grand-gallery':
      return chalk.rgb(192, 192, 192)('grand-gallery')
    case 'silver-hall':
      return chalk.rgb(170, 170, 180)('silver-hall')
    case 'proper-room':
      return chalk.rgb(140, 140, 160)('proper-room')
    case 'dark-corner':
      return chalk.rgb(110, 110, 130)('dark-corner')
    case 'empty-space':
      return chalk.rgb(80, 80, 100)('empty-space')
    case 'void':
      return chalk.gray('void')
    default:
      return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatReflectionTable(reflection) */
export function formatReflectionTable(reflection: SilverReflection): string {
  const lines: string[] = [
    chalk.bold(`Silver Reflection: ${reflection.file}`),
    '',
    `  Reflection Quality:    ${colorScore(reflection.reflectionQuality)}  ${chalk.dim(`(${reflection.introspecting.reflection})`)}`,
    `  Surface Clarity:       ${colorScore(reflection.surfaceClarity)}  ${chalk.dim(`(${reflection.clarifying.surface})`)}`,
    `  Tarnish Resistance:    ${colorScore(reflection.tarnishResistance)}  ${chalk.dim(`(${reflection.resisting.tarnish})`)}`,
    `  Frame Elegance:        ${colorScore(reflection.frameElegance)}  ${chalk.dim(`(${reflection.framing.frame})`)}`,
    `  Image Fidelity:        ${colorScore(reflection.imageFidelity)}  ${chalk.dim(`(${reflection.representing.image})`)}`,
    '',
    `  Quality Score: ${colorScore(reflection.qualityScore)}  ${chalk.dim(`(${colorReflectionCondition(reflection.condition)})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatReflectionsTable(reflections) */
export function formatReflectionsTable(reflections: SilverReflection[]): string {
  if (reflections.length === 0) return chalk.dim('No silver reflections found')

  const colWidths = {
    file: Math.max(4, ...reflections.map((r) => r.file.length)),
    refl: Math.max(4, ...reflections.map((r) => String(r.reflectionQuality).length)),
    clar: Math.max(4, ...reflections.map((r) => String(r.surfaceClarity).length)),
    tarn: Math.max(4, ...reflections.map((r) => String(r.tarnishResistance).length)),
    eleg: Math.max(4, ...reflections.map((r) => String(r.frameElegance).length)),
    fidel: Math.max(4, ...reflections.map((r) => String(r.imageFidelity).length)),
    score: Math.max(5, ...reflections.map((r) => String(r.qualityScore).length)),
  }

  const lines: string[] = [chalk.bold('Silver Reflections'), '']

  const header =
    chalk.rgb(192, 192, 192)(padRight('File', colWidths.file)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Refl', colWidths.refl)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Clar', colWidths.clar)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Tarn', colWidths.tarn)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Eleg', colWidths.eleg)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Fidel', colWidths.fidel)) +
    '  ' +
    chalk.rgb(192, 192, 192)(padLeft('Score', colWidths.score))

  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))

  for (const r of reflections) {
    lines.push(
      padRight(r.file, colWidths.file) +
        '  ' +
        padLeft(String(r.reflectionQuality), colWidths.refl) +
        '  ' +
        padLeft(String(r.surfaceClarity), colWidths.clar) +
        '  ' +
        padLeft(String(r.tarnishResistance), colWidths.tarn) +
        '  ' +
        padLeft(String(r.frameElegance), colWidths.eleg) +
        '  ' +
        padLeft(String(r.imageFidelity), colWidths.fidel) +
        '  ' +
        padLeft(String(r.qualityScore), colWidths.score),
    )
  }

  return lines.join('\n')
}

/** @example formatGalleryTable(gallery) */
export function formatGalleryTable(gallery: SilverGallery): string {
  const lines: string[] = [
    chalk.bold(`Silver Gallery: ${gallery.directory}`),
    '',
    `  Reflections:         ${gallery.reflections.length}`,
    `  Avg Clarity:         ${colorScore(gallery.avgClarity)}`,
    `  Avg Elegance:        ${colorScore(gallery.avgElegance)}`,
    `  Avg Fidelity:        ${colorScore(gallery.avgFidelity)}`,
    `  Masterpieces:        ${gallery.silverMasterpieceCount}`,
    `  Gallery Type:        ${gallery.galleryType}`,
    `  Condition:           ${colorGalleryCondition(gallery.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatGalleriesTable(galleries) */
export function formatGalleriesTable(galleries: SilverGallery[]): string {
  if (galleries.length === 0) return chalk.dim('No silver galleries found')

  const lines: string[] = [chalk.bold('Silver Galleries'), '']

  for (const g of galleries) {
    lines.push(
      `  ${chalk.rgb(192, 192, 192)(g.directory)}  ${colorScore(g.avgClarity)}  ${colorGalleryCondition(g.condition)}`,
    )
  }

  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SilverMirrorResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Silver Mirror Statistics'),
    '',
    `  Total Files:             ${stats.totalFiles}`,
    `  Total Galleries:         ${stats.totalGalleries}`,
    `  Avg Reflection Quality:  ${colorScore(stats.avgReflectionQuality)}`,
    `  Avg Surface Clarity:     ${colorScore(stats.avgSurfaceClarity)}`,
    `  Avg Tarnish Resistance:  ${colorScore(stats.avgTarnishResistance)}`,
    `  Avg Frame Elegance:      ${colorScore(stats.avgFrameElegance)}`,
    `  Avg Image Fidelity:      ${colorScore(stats.avgImageFidelity)}`,
    `  Silver Masterpieces:     ${stats.silverMasterpieceCount}`,
    `  Perfect Reflections:     ${stats.perfectReflectionCount}`,
    `  Proper Mirrors:          ${stats.properMirrorCount}`,
    `  Tarnished Silver:        ${stats.tarnishedSilverCount}`,
    `  Cracked Glass:           ${stats.crackedGlassCount}`,
    `  Void:                    ${stats.voidCount}`,
    `  Overall Reflection:      ${colorScore(stats.overallReflection)}`,
    `  Mirror Maker Grade:      ${stats.mirrorMakerGrade}`,
    `  Best Reflection:         ${stats.bestReflection || 'N/A'}`,
    `  Most Reflective:         ${stats.mostReflective || 'N/A'}`,
    `  Clearest:                ${stats.clearest || 'N/A'}`,
    `  Most Resistant:          ${stats.mostResistant || 'N/A'}`,
    `  Most Elegant:            ${stats.mostElegant || 'N/A'}`,
    `  Most Faithful:           ${stats.mostFaithful || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(192, 192, 192)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SilverMirrorResult): string {
  const lines: string[] = [
    chalk.bold('Silver Mirror Analysis'),
    '',
    formatReflectionsTable(result.reflections),
    '',
    formatGalleriesTable(result.galleries),
    '',
    chalk.bold('Mirror Overview'),
    '',
    `  Avg Clarity:       ${colorScore(result.mirror.avgClarity)}`,
    `  Avg Elegance:      ${colorScore(result.mirror.avgElegance)}`,
    `  Avg Fidelity:      ${colorScore(result.mirror.avgFidelity)}`,
    `  Reflection:        ${colorScore(result.mirror.overallReflection)}`,
    `  Is Silver:         ${result.mirror.isSilver ? chalk.rgb(192, 192, 192)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SilverMirrorResult): string {
  return JSON.stringify(result, null, 2)
}
