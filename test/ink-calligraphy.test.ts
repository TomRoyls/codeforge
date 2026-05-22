import { describe, expect, it } from 'vitest'

import {
  analyzeCalligraphyStroke,
  analyzeInkGallery,
  buildInkCalligraphyResult,
  classifyCalligrapherGrade,
  classifyCondition,
  classifyGalleryCondition,
  classifyGalleryType,
  generateRecommendations,
  measureBrush,
  measureComposition,
  measureExpression,
  measureFlow,
  measureInk,
  measureStroke,
} from '../src/commands/ink-calligraphy-helpers.js'
import {
  conditionColor,
  formatInkCalligraphyJson,
  formatInkCalligraphyTable,
  gradeColor,
  scoreColor,
  strokeTypeColor,
} from '../src/commands/ink-calligraphy-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────────────────────────

const RICH = `/**
 * Elegant calligraphy module
 */
export interface Stroke {
  quality: number
  inkDensity: number
}

export class CalligraphyMaster<T extends Stroke> {
  private strokes: T[] = []
  private static readonly MAX_STROKES = 100

  constructor(private readonly brush: string) {}

  async paint(stroke: T): Promise<void> {
    try {
      if (stroke.quality > 0) {
        this.strokes.push(stroke)
      }
    } catch {
      this.handleError()
    }
  }

  private handleError(): void {
    console.error('Paint failed')
  }
}

export type InkType = 'sumi' | 'bokushu'
export enum BrushGrade { Master, Adept, Novice }
export function createStroke(quality: number): Stroke {
  return { quality, inkDensity: quality * 0.8 }
}
export { CalligraphyMaster }
export type { Stroke as BrushStroke }
`

const EMPTY = ''
const MEDIUM = `function hello(name) {
  var x = 1
  if (name) {
    console.log(x)
  }
}
`

// ─── measureStroke ──────────────────────────────────────────────────────────

describe('measureStroke', () => {
  it('RICH: quality=91, type=gyosho, hasHighQuality=true', () => {
    const result = measureStroke(RICH)
    expect(result.quality).toBe(91)
    expect(result.type).toBe('gyosho')
    expect(result.hasHighQuality).toBe(true)
  })

  it('RICH: bleeding=0, smudging=1', () => {
    const result = measureStroke(RICH)
    expect(result.bleedingCount).toBe(0)
    expect(result.smudgingCount).toBe(1)
  })

  it('RICH: hasProperPressure, hasConfidentLines, hasProperThickness', () => {
    const result = measureStroke(RICH)
    expect(result.hasProperPressure).toBe(true)
    expect(result.hasConfidentLines).toBe(true)
    expect(result.hasProperThickness).toBe(true)
  })

  it('RICH: hasNoBleeding=true, hasNoSmudging=false', () => {
    const result = measureStroke(RICH)
    expect(result.hasNoBleeding).toBe(true)
    expect(result.hasNoSmudging).toBe(false)
  })

  it('EMPTY: quality=38, type=tensho, hasHighQuality=false', () => {
    const result = measureStroke(EMPTY)
    expect(result.quality).toBe(38)
    expect(result.type).toBe('tensho')
    expect(result.hasHighQuality).toBe(false)
  })

  it('MEDIUM: quality=44, type=tensho', () => {
    const result = measureStroke(MEDIUM)
    expect(result.quality).toBe(44)
    expect(result.type).toBe('tensho')
  })
})

// ─── measureInk ─────────────────────────────────────────────────────────────

describe('measureInk', () => {
  it('RICH: density=92, quality=india-ink', () => {
    const result = measureInk(RICH)
    expect(result.density).toBe(92)
    expect(result.quality).toBe('india-ink')
    expect(result.hasRichDensity).toBe(true)
  })

  it('RICH: hasEvenDistribution=true, hasNoPooling=false', () => {
    const result = measureInk(RICH)
    expect(result.hasEvenDistribution).toBe(true)
    expect(result.hasNoPooling).toBe(false)
  })

  it('EMPTY: density=32, quality=diluted', () => {
    const result = measureInk(EMPTY)
    expect(result.density).toBe(32)
    expect(result.quality).toBe('diluted')
  })

  it('MEDIUM: density=39, quality=diluted', () => {
    const result = measureInk(MEDIUM)
    expect(result.density).toBe(39)
    expect(result.quality).toBe('diluted')
  })
})

// ─── measureBrush ───────────────────────────────────────────────────────────

describe('measureBrush', () => {
  it('RICH: control=88, grip=master-grip', () => {
    const result = measureBrush(RICH)
    expect(result.control).toBe(88)
    expect(result.grip).toBe('master-grip')
    expect(result.hasHighControl).toBe(true)
  })

  it('RICH: hasFineDetail=true, hasControlledRelease=true', () => {
    const result = measureBrush(RICH)
    expect(result.hasFineDetail).toBe(true)
    expect(result.hasControlledRelease).toBe(true)
  })

  it('EMPTY: control=35, grip=weak-grip', () => {
    const result = measureBrush(EMPTY)
    expect(result.control).toBe(35)
    expect(result.grip).toBe('weak-grip')
  })

  it('MEDIUM: control=41, grip=weak-grip', () => {
    const result = measureBrush(MEDIUM)
    expect(result.control).toBe(41)
    expect(result.grip).toBe('weak-grip')
  })
})

// ─── measureComposition ─────────────────────────────────────────────────────

describe('measureComposition', () => {
  it('RICH: balance=88, layout=fan', () => {
    const result = measureComposition(RICH)
    expect(result.balance).toBe(88)
    expect(result.layout).toBe('fan')
    expect(result.hasProperBalance).toBe(true)
  })

  it('RICH: hasNoCrowding=false (private=4)', () => {
    const result = measureComposition(RICH)
    expect(result.crowdingCount).toBe(4)
    expect(result.hasNoCrowding).toBe(false)
  })

  it('EMPTY: balance=37, layout=scrap', () => {
    const result = measureComposition(EMPTY)
    expect(result.balance).toBe(37)
    expect(result.layout).toBe('scrap')
  })

  it('MEDIUM: balance=43, layout=scrap', () => {
    const result = measureComposition(MEDIUM)
    expect(result.balance).toBe(43)
    expect(result.layout).toBe('scrap')
  })
})

// ─── measureFlow ────────────────────────────────────────────────────────────

describe('measureFlow', () => {
  it('RICH: level=87, style=flowing', () => {
    const result = measureFlow(RICH)
    expect(result.level).toBe(87)
    expect(result.style).toBe('flowing')
    expect(result.hasGoodFlow).toBe(true)
  })

  it('RICH: hasRhythmicFlow=true, hasNoInterruption=true', () => {
    const result = measureFlow(RICH)
    expect(result.hasRhythmicFlow).toBe(true)
    expect(result.hasNoInterruption).toBe(true)
  })

  it('EMPTY: level=46, style=jerky', () => {
    const result = measureFlow(EMPTY)
    expect(result.level).toBe(46)
    expect(result.style).toBe('jerky')
  })

  it('MEDIUM: level=51, style=jerky', () => {
    const result = measureFlow(MEDIUM)
    expect(result.level).toBe(51)
    expect(result.style).toBe('jerky')
  })
})

// ─── measureExpression ──────────────────────────────────────────────────────

describe('measureExpression', () => {
  it('RICH: level=88, style=artist', () => {
    const result = measureExpression(RICH)
    expect(result.level).toBe(88)
    expect(result.style).toBe('artist')
    expect(result.hasHighExpression).toBe(true)
  })

  it('RICH: hasNoPretension=false (deepNestedCount=1)', () => {
    const result = measureExpression(RICH)
    expect(result.pretensionCount).toBe(1)
    expect(result.hasNoPretension).toBe(false)
  })

  it('EMPTY: level=30, style=child', () => {
    const result = measureExpression(EMPTY)
    expect(result.level).toBe(30)
    expect(result.style).toBe('child')
  })

  it('MEDIUM: level=38, style=student', () => {
    const result = measureExpression(MEDIUM)
    expect(result.level).toBe(38)
    expect(result.style).toBe('student')
  })
})

// ─── analyzeCalligraphyStroke ───────────────────────────────────────────────

describe('analyzeCalligraphyStroke', () => {
  it('RICH: qualityScore=89, condition=national-treasure', () => {
    const result = analyzeCalligraphyStroke(RICH, 'test.ts')
    expect(result.qualityScore).toBe(89)
    expect(result.condition).toBe('national-treasure')
  })

  it('RICH: all six measures present', () => {
    const result = analyzeCalligraphyStroke(RICH, 'test.ts')
    expect(result.strokeQuality).toBe(91)
    expect(result.inkDensity).toBe(92)
    expect(result.brushControl).toBe(88)
    expect(result.compositionBalance).toBe(88)
    expect(result.inkFlow).toBe(87)
    expect(result.artisticExpression).toBe(88)
  })

  it('EMPTY: qualityScore=36, condition=practice-sheet', () => {
    const result = analyzeCalligraphyStroke(EMPTY, 'empty.ts')
    expect(result.qualityScore).toBe(36)
    expect(result.condition).toBe('practice-sheet')
  })

  it('MEDIUM: qualityScore=42, condition=practice-sheet', () => {
    const result = analyzeCalligraphyStroke(MEDIUM, 'med.ts')
    expect(result.qualityScore).toBe(42)
    expect(result.condition).toBe('practice-sheet')
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('>=80: national-treasure', () => {
    const stroke = analyzeCalligraphyStroke(RICH, 'test.ts')
    expect(classifyCondition(stroke)).toBe('national-treasure')
  })

  it('>=65: masterwork', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('masterwork')
  })

  it('>=50: gallery-piece', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('gallery-piece')
  })

  it('>=35: practice-sheet', () => {
    expect(classifyCondition({ qualityScore: 40 } as any)).toBe('practice-sheet')
  })

  it('>=20: ink-blot', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('ink-blot')
  })

  it('<20: scribble', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('scribble')
  })
})

// ─── classifyCalligrapherGrade ──────────────────────────────────────────────

describe('classifyCalligrapherGrade', () => {
  it('>=80: national-living-treasure', () => expect(classifyCalligrapherGrade(85)).toBe('national-living-treasure'))
  it('>=65: master-calligrapher', () => expect(classifyCalligrapherGrade(70)).toBe('master-calligrapher'))
  it('>=50: calligrapher', () => expect(classifyCalligrapherGrade(55)).toBe('calligrapher'))
  it('>=35: artist', () => expect(classifyCalligrapherGrade(40)).toBe('artist'))
  it('>=20: student', () => expect(classifyCalligrapherGrade(25)).toBe('student'))
  it('<20: finger-painter', () => expect(classifyCalligrapherGrade(10)).toBe('finger-painter'))
})

// ─── classifyGalleryType ────────────────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('empty: recycling', () => expect(classifyGalleryType([])).toBe('recycling'))

  it('high quality: imperial-collection', () => {
    const strokes = [
      analyzeCalligraphyStroke(RICH, 'a.ts'),
      analyzeCalligraphyStroke(RICH, 'b.ts'),
      analyzeCalligraphyStroke(RICH, 'c.ts'),
    ]
    expect(classifyGalleryType(strokes)).toBe('imperial-collection')
  })

  it('medium quality: studio', () => {
    const strokes = [analyzeCalligraphyStroke(MEDIUM, 'm.ts')]
    expect(classifyGalleryType(strokes)).toBe('studio')
  })
})

// ─── classifyGalleryCondition ───────────────────────────────────────────────

describe('classifyGalleryCondition', () => {
  it('>=80: world-heritage', () => expect(classifyGalleryCondition(85)).toBe('world-heritage'))
  it('>=65: national-treasure', () => expect(classifyGalleryCondition(70)).toBe('national-treasure'))
  it('>=50: exhibition', () => expect(classifyGalleryCondition(55)).toBe('exhibition'))
  it('>=35: practice', () => expect(classifyGalleryCondition(40)).toBe('practice'))
  it('>=20: storage', () => expect(classifyGalleryCondition(25)).toBe('storage'))
  it('<20: trash', () => expect(classifyGalleryCondition(10)).toBe('trash'))
})

// ─── analyzeInkGallery ──────────────────────────────────────────────────────

describe('analyzeInkGallery', () => {
  it('empty: returns zeroed gallery', () => {
    const gallery = analyzeInkGallery([], 'src')
    expect(gallery.strokes).toHaveLength(0)
    expect(gallery.avgQuality).toBe(0)
    expect(gallery.galleryType).toBe('recycling')
    expect(gallery.condition).toBe('trash')
  })

  it('RICH: returns gallery with high values', () => {
    const strokes = [analyzeCalligraphyStroke(RICH, 'src/a.ts')]
    const gallery = analyzeInkGallery(strokes, 'src')
    expect(gallery.avgQuality).toBe(91)
    expect(gallery.avgControl).toBe(88)
    expect(gallery.avgExpression).toBe(88)
    expect(gallery.treasureCount).toBe(1)
    expect(gallery.scribbleCount).toBe(0)
    expect(gallery.highQualityCount).toBe(1)
    expect(gallery.goodFlowCount).toBe(1)
  })
})

// ─── buildInkCalligraphyResult ──────────────────────────────────────────────

describe('buildInkCalligraphyResult', () => {
  it('RICH: returns full result with correct values', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [RICH])
    expect(result.strokes).toHaveLength(1)
    expect(result.galleries).toHaveLength(1)
    expect(result.exhibition.overallMastery).toBe(89)
    expect(result.exhibition.isMasterwork).toBe(true)
    expect(result.exhibition.avgQuality).toBe(91)
    expect(result.exhibition.avgControl).toBe(88)
    expect(result.exhibition.avgExpression).toBe(88)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.calligrapherGrade).toBe('national-living-treasure')
  })

  it('EMPTY: returns low-score result', () => {
    const result = buildInkCalligraphyResult(['empty.ts'], [EMPTY])
    expect(result.strokes).toHaveLength(1)
    expect(result.exhibition.overallMastery).toBe(36)
    expect(result.exhibition.isMasterwork).toBe(false)
    expect(result.stats.calligrapherGrade).toBe('artist')
  })

  it('MEDIUM: returns mid-range result', () => {
    const result = buildInkCalligraphyResult(['med.ts'], [MEDIUM])
    expect(result.strokes).toHaveLength(1)
    expect(result.exhibition.overallMastery).toBe(42)
    expect(result.stats.calligrapherGrade).toBe('artist')
  })

  it('empty input: returns zeroed result', () => {
    const result = buildInkCalligraphyResult([], [])
    expect(result.strokes).toHaveLength(0)
    expect(result.galleries).toHaveLength(0)
    expect(result.exhibition.overallMastery).toBe(0)
    expect(result.exhibition.isMasterwork).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.calligrapherGrade).toBe('finger-painter')
    expect(result.stats.bestStroke).toBe('')
  })

  it('multi-file: groups by directory correctly', () => {
    const result = buildInkCalligraphyResult(
      ['src/app.ts', 'src/utils.ts', 'src/med.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.strokes).toHaveLength(3)
    expect(result.galleries).toHaveLength(1)
    expect(result.galleries[0].galleryType).toBe('museum')
    expect(result.galleries[0].condition).toBe('national-treasure')
    expect(result.exhibition.overallMastery).toBe(73)
    expect(result.exhibition.isMasterwork).toBe(true)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.nationalTreasureCount).toBe(2)
    expect(result.stats.practiceSheetCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasRichDensityCount).toBe(2)
    expect(result.stats.hasHighControlCount).toBe(2)
    expect(result.stats.hasProperBalanceCount).toBe(2)
    expect(result.stats.hasGoodFlowCount).toBe(2)
    expect(result.stats.hasHighExpressionCount).toBe(2)
    expect(result.stats.calligrapherGrade).toBe('master-calligrapher')
    expect(result.stats.avgStrokeQuality).toBe(Math.round((91 + 91 + 44) / 3))
    expect(result.stats.avgInkDensity).toBe(Math.round((92 + 92 + 39) / 3))
    expect(result.stats.avgBrushControl).toBe(Math.round((88 + 88 + 41) / 3))
    expect(result.stats.avgCompositionBalance).toBe(Math.round((88 + 88 + 43) / 3))
    expect(result.stats.avgInkFlow).toBe(Math.round((87 + 87 + 51) / 3))
    expect(result.stats.avgArtisticExpression).toBe(Math.round((88 + 88 + 38) / 3))
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns improvement recs for empty code', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(5)
    const hasStroke = result.recommendations.some((r) => r.includes('stroke'))
    expect(hasStroke).toBe(true)
  })

  it('returns multiple recs for medium code', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [MEDIUM])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
    const hasInk = result.recommendations.some((r) => r.includes('ink'))
    expect(hasInk).toBe(true)
  })

  it('returns masterpiece for RICH code', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [RICH])
    const hasMaster = result.recommendations.some((r) => r.includes('masterpiece'))
    expect(hasMaster).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(scoreColor(90)).toBeTruthy()
    expect(scoreColor(70)).toBeTruthy()
    expect(scoreColor(50)).toBeTruthy()
    expect(scoreColor(30)).toBeTruthy()
  })

  it('conditionColor handles all conditions', () => {
    expect(conditionColor('national-treasure')).toBeTruthy()
    expect(conditionColor('masterwork')).toBeTruthy()
    expect(conditionColor('gallery-piece')).toBeTruthy()
    expect(conditionColor('practice-sheet')).toBeTruthy()
    expect(conditionColor('ink-blot')).toBeTruthy()
    expect(conditionColor('scribble')).toBeTruthy()
  })

  it('gradeColor handles all grades', () => {
    expect(gradeColor('national-living-treasure')).toBeTruthy()
    expect(gradeColor('master-calligrapher')).toBeTruthy()
    expect(gradeColor('calligrapher')).toBeTruthy()
    expect(gradeColor('artist')).toBeTruthy()
    expect(gradeColor('student')).toBeTruthy()
    expect(gradeColor('finger-painter')).toBeTruthy()
  })

  it('strokeTypeColor handles all types', () => {
    expect(strokeTypeColor('kaisho')).toBeTruthy()
    expect(strokeTypeColor('gyosho')).toBeTruthy()
    expect(strokeTypeColor('sosho')).toBeTruthy()
    expect(strokeTypeColor('reisho')).toBeTruthy()
    expect(strokeTypeColor('tensho')).toBeTruthy()
    expect(strokeTypeColor('scribble')).toBeTruthy()
  })

  it('formatInkCalligraphyJson returns valid JSON', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [RICH])
    const json = formatInkCalligraphyJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.strokes).toHaveLength(1)
  })

  it('formatInkCalligraphyTable returns formatted string', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [RICH])
    const table = formatInkCalligraphyTable(result, false)
    expect(table).toContain('Ink Calligraphy Analysis')
    expect(table).toContain('Exhibition Overview')
    expect(table).toContain('Overall Mastery')
    expect(table).toContain('Is Masterwork')
  })

  it('shows verbose stroke details', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [MEDIUM])
    const table = formatInkCalligraphyTable(result, true)
    expect(table).toContain('tensho')
    expect(table).toContain('diluted')
    expect(table).toContain('weak-grip')
    expect(table).toContain('scrap')
    expect(table).toContain('jerky')
    expect(table).toContain('student')
  })

  it('handles empty result table', () => {
    const result = buildInkCalligraphyResult([], [])
    const table = formatInkCalligraphyTable(result, false)
    expect(table).toContain('Ink Calligraphy Analysis')
    expect(table).toContain('Statistics')
  })

  it('shows calligrapher grade in table', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [RICH])
    const table = formatInkCalligraphyTable(result, false)
    expect(table).toContain('national-living-treasure')
  })

  it('shows N/A for empty highlights', () => {
    const result = buildInkCalligraphyResult([], [])
    const table = formatInkCalligraphyTable(result, false)
    expect(table).not.toContain('Best Stroke')
  })

  it('includes condition counts in table', () => {
    const result = buildInkCalligraphyResult(['test.ts'], [EMPTY])
    const table = formatInkCalligraphyTable(result, false)
    expect(table).toContain('Practice Sheet')
    expect(table).toContain('1')
  })
})
