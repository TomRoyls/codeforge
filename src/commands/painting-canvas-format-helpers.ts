import chalk from 'chalk'
import type {
  BrushStroke,
  GalleryWing,
  MuseumMeasure,
  PaintingCanvasStats,
  PaintingCanvasResult,
  StrokeCondition,
  WingType,
  WingCondition,
  CuratorGrade,
  PaintingStyle,
} from './painting-canvas-helpers.js'

// ─── Condition Colors ────────────────────────────────────

const strokeConditionColor: Record<StrokeCondition, (t: string) => string> = {
  'masterpiece': (t: string) => chalk.rgb(46, 204, 113)(t),
  'gallery-quality': (t: string) => chalk.rgb(52, 152, 219)(t),
  'studio-quality': (t: string) => chalk.rgb(241, 196, 15)(t),
  'student-work': (t: string) => chalk.rgb(230, 126, 34)(t),
  'amateur': (t: string) => chalk.rgb(231, 76, 60)(t),
  'kindergarten': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const wingTypeColor: Record<WingType, (t: string) => string> = {
  'renaissance-wing': (t: string) => chalk.rgb(46, 204, 113)(t),
  'modern-wing': (t: string) => chalk.rgb(52, 152, 219)(t),
  'contemporary-wing': (t: string) => chalk.rgb(241, 196, 15)(t),
  'student-gallery': (t: string) => chalk.rgb(230, 126, 34)(t),
  'flea-market': (t: string) => chalk.rgb(231, 76, 60)(t),
  'dumpster': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const wingConditionColor: Record<WingCondition, (t: string) => string> = {
  'world-class': (t: string) => chalk.rgb(46, 204, 113)(t),
  'fine-gallery': (t: string) => chalk.rgb(52, 152, 219)(t),
  'community-gallery': (t: string) => chalk.rgb(241, 196, 15)(t),
  'craft-show': (t: string) => chalk.rgb(230, 126, 34)(t),
  'refrigerator-door': (t: string) => chalk.rgb(231, 76, 60)(t),
  'trash-can': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const curatorGradeColor: Record<CuratorGrade, (t: string) => string> = {
  'museum-curator': (t: string) => chalk.rgb(46, 204, 113)(t),
  'gallery-director': (t: string) => chalk.rgb(52, 152, 219)(t),
  'art-critic': (t: string) => chalk.rgb(241, 196, 15)(t),
  'artist': (t: string) => chalk.rgb(230, 126, 34)(t),
  'student': (t: string) => chalk.rgb(231, 76, 60)(t),
  'toddler': (t: string) => chalk.rgb(142, 68, 173)(t),
}

const styleColor: Record<PaintingStyle, (t: string) => string> = {
  'realism': (t: string) => chalk.rgb(46, 204, 113)(t),
  'impressionism': (t: string) => chalk.rgb(52, 152, 219)(t),
  'abstract': (t: string) => chalk.rgb(241, 196, 15)(t),
  'minimalism': (t: string) => chalk.rgb(149, 165, 166)(t),
  'baroque': (t: string) => chalk.rgb(230, 126, 34)(t),
  'dada': (t: string) => chalk.rgb(142, 68, 173)(t),
}

// ─── Score Bar ───────────────────────────────────────────

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const bar = chalk.rgb(46, 204, 113)('\u2588'.repeat(Math.max(0, filled))) + chalk.rgb(100, 100, 100)('\u2591'.repeat(Math.max(0, empty)))
  return `${bar} ${chalk.rgb(200, 200, 200)(String(score))}`
}

// ─── Brush Stroke Table ──────────────────────────────────

/**
 * Format brush strokes as a table
 * @example
 * formatStrokeTable(strokes) // formatted string
 */
export function formatStrokeTable(strokes: BrushStroke[]): string {
  if (strokes.length === 0) return chalk.rgb(150, 150, 150)('  No brush strokes to display')

  const rows = strokes.map(s => {
    const cond = strokeConditionColor[s.condition](s.condition.padEnd(16))
    const sty = styleColor[s.painting.style](s.painting.style.padEnd(14))
    return [
      chalk.rgb(200, 200, 200)(s.file.padEnd(30)),
      scoreBar(s.qualityScore, 10),
      sty,
      cond,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('File'.padEnd(30)),
    chalk.rgb(100, 200, 255)('Quality'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Style'.padEnd(14)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Gallery Wing Table ──────────────────────────────────

/**
 * Format gallery wings as a table
 * @example
 * formatWingTable(wings) // formatted string
 */
export function formatWingTable(wings: GalleryWing[]): string {
  if (wings.length === 0) return chalk.rgb(150, 150, 150)('  No gallery wings to display')

  const rows = wings.map(w => {
    const wt = wingTypeColor[w.wingType](w.wingType.padEnd(20))
    const wc = wingConditionColor[w.condition](w.condition.padEnd(20))
    return [
      chalk.rgb(200, 200, 200)(w.directory.padEnd(20)),
      chalk.rgb(200, 200, 200)(String(w.strokes.length).padEnd(6)),
      scoreBar(w.avgComposition, 10),
      wt,
      wc,
    ].join('  ')
  })

  const header = [
    chalk.rgb(100, 200, 255)('Directory'.padEnd(20)),
    chalk.rgb(100, 200, 255)('Files'.padEnd(6)),
    chalk.rgb(100, 200, 255)('Avg Compose'.padEnd(24)),
    chalk.rgb(100, 200, 255)('Wing Type'.padEnd(20)),
    chalk.rgb(100, 200, 255)('Condition'),
  ].join('  ')

  return [header, ...rows].join('\n')
}

// ─── Museum Summary ──────────────────────────────────────

/**
 * Format museum summary
 * @example
 * formatMuseum(museum) // formatted string
 */
export function formatMuseum(museum: MuseumMeasure): string {
  const worthy = museum.isGalleryWorthy ? chalk.rgb(46, 204, 113)('\u2714') : chalk.rgb(231, 76, 60)('\u2717')
  return [
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    chalk.rgb(100, 200, 255)('  Museum Summary'),
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
    `  Overall Artistry:  ${scoreBar(museum.overallArtistry)}`,
    `  Avg Composition:   ${scoreBar(museum.avgComposition)}`,
    `  Avg Palette:       ${scoreBar(museum.avgPalette)}`,
    `  Avg Brushwork:     ${scoreBar(museum.avgBrushwork)}`,
    `  Avg Gallery Ready: ${scoreBar(museum.avgGalleryReadiness)}`,
    `  Gallery Worthy:    ${worthy}`,
    chalk.rgb(100, 200, 255)('\u2550'.repeat(50)),
  ].join('\n')
}

// ─── Statistics ──────────────────────────────────────────

/**
 * Format canvas statistics
 * @example
 * formatStats(stats) // formatted string
 */
export function formatStats(stats: PaintingCanvasStats): string {
  const grade = curatorGradeColor[stats.curatorGrade](stats.curatorGrade)
  return [
    '',
    chalk.rgb(100, 200, 255)('  Canvas Statistics'),
    chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)),
    `  Total Files:         ${chalk.rgb(200, 200, 200)(String(stats.totalFiles))}`,
    `  Total Wings:         ${chalk.rgb(200, 200, 200)(String(stats.totalWings))}`,
    `  Curator Grade:       ${grade}`,
    '',
    `  Avg Composition:     ${scoreBar(stats.avgComposition)}`,
    `  Avg Color Palette:   ${scoreBar(stats.avgColorPalette)}`,
    `  Avg Brushwork:       ${scoreBar(stats.avgBrushwork)}`,
    `  Avg Canvas Coverage: ${scoreBar(stats.avgCanvasCoverage)}`,
    `  Avg Frame Quality:   ${scoreBar(stats.avgFrameQuality)}`,
    `  Avg Gallery Ready:   ${scoreBar(stats.avgGalleryReadiness)}`,
    '',
    `  Masterpieces:        ${chalk.rgb(46, 204, 113)(String(stats.masterpieceCount))}`,
    `  Gallery Quality:     ${chalk.rgb(52, 152, 219)(String(stats.galleryQualityCount))}`,
    `  Studio Quality:      ${chalk.rgb(241, 196, 15)(String(stats.studioQualityCount))}`,
    `  Student Work:        ${chalk.rgb(230, 126, 34)(String(stats.studentWorkCount))}`,
    `  Amateur:             ${chalk.rgb(231, 76, 60)(String(stats.amateurCount))}`,
    `  Kindergarten:        ${chalk.rgb(142, 68, 173)(String(stats.kindergartenCount))}`,
    '',
    `  Realism:             ${chalk.rgb(200, 200, 200)(String(stats.realismCount))}`,
    `  Impressionism:       ${chalk.rgb(200, 200, 200)(String(stats.impressionismCount))}`,
    `  Abstract:            ${chalk.rgb(200, 200, 200)(String(stats.abstractCount))}`,
    `  Minimalism:          ${chalk.rgb(200, 200, 200)(String(stats.minimalismCount))}`,
    `  Baroque:             ${chalk.rgb(200, 200, 200)(String(stats.baroqueCount))}`,
    `  Dada:                ${chalk.rgb(200, 200, 200)(String(stats.dadaCount))}`,
    '',
    `  Monochrome:          ${chalk.rgb(200, 200, 200)(String(stats.monochromeCount))}`,
    `  Harmonious:          ${chalk.rgb(200, 200, 200)(String(stats.harmoniousCount))}`,
    `  Has Focal Point:     ${chalk.rgb(200, 200, 200)(String(stats.hasFocalPointCount))}`,
    `  Fully Painted:       ${chalk.rgb(200, 200, 200)(String(stats.isFullyPaintedCount))}`,
    `  Has Certificate:     ${chalk.rgb(200, 200, 200)(String(stats.hasCertificateCount))}`,
    `  Is Lit:              ${chalk.rgb(200, 200, 200)(String(stats.isLitCount))}`,
    `  Is Signed:           ${chalk.rgb(200, 200, 200)(String(stats.isSignedCount))}`,
    '',
    `  Best Composition:    ${chalk.rgb(46, 204, 113)(stats.bestComposition)}`,
    `  Richest Palette:     ${chalk.rgb(46, 204, 113)(stats.richestPalette)}`,
    `  Finest Technique:    ${chalk.rgb(46, 204, 113)(stats.finestTechnique)}`,
    `  Most Ready:          ${chalk.rgb(46, 204, 113)(stats.mostReady)}`,
    `  Best Framed:         ${chalk.rgb(46, 204, 113)(stats.bestFramed)}`,
    '',
  ].join('\n')
}

// ─── Recommendations ─────────────────────────────────────

/**
 * Format recommendations
 * @example
 * formatRecommendations(recs) // formatted string
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.rgb(150, 150, 150)('  No recommendations - canvas is a masterpiece')
  const items = recs.map(r => `  ${chalk.rgb(241, 196, 15)('\u2192')} ${chalk.rgb(200, 200, 200)(r)}`)
  return [chalk.rgb(100, 200, 255)('  Recommendations'), chalk.rgb(100, 200, 255)('  \u2500'.repeat(20)), ...items].join('\n')
}

// ─── Full Report ─────────────────────────────────────────

/**
 * Format the complete painting-canvas report
 * @example
 * formatPaintingCanvasReport(result) // formatted string
 */
export function formatPaintingCanvasReport(result: PaintingCanvasResult): string {
  const sections: string[] = [
    formatMuseum(result.museum),
    formatStrokeTable(result.strokes),
    '',
    formatWingTable(result.wings),
    formatStats(result.stats),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

// ─── JSON Output ─────────────────────────────────────────

/**
 * Format result as JSON string
 * @example
 * formatPaintingCanvasJSON(result) // JSON string
 */
export function formatPaintingCanvasJSON(result: PaintingCanvasResult): string {
  return JSON.stringify(result, null, 2)
}
