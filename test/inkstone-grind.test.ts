import { describe, it, expect } from 'vitest'

import {
  measureInk,
  measureGrinding,
  measureStroke,
  measureBrush,
  measurePaper,
  measureMastery,
  classifyCondition,
  analyzeInkGrinding,
  classifyShelfType,
  analyzeStudioShelf,
  classifyArtistGrade,
  generateRecommendations,
  buildInkstoneGrindResult,
} from '../src/commands/inkstone-grind-helpers.js'

import {
  scoreColor,
  conditionColor,
  inkQualityColor,
  techniqueColor,
  calligraphyColor,
  brushConditionColor,
  paperQualityColor,
  masteryRankColor,
  artistGradeColor,
  shelfTypeColor,
  shelfConditionColor,
  formatInkstoneGrindJson,
  formatInkstoneGrindTable,
} from '../src/commands/inkstone-grind-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────

const RICH = `import { Command } from '@oclif/core'
import chalk from 'chalk'
import ora from 'ora'

/**
 * A well-documented interface for analysis results.
 */
export interface AnalysisResult {
  score: number
  label: string
  details: string[]
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

/**
 * AnalyzeCommand performs code quality analysis.
 */
export class AnalyzeCommand extends Command {
  private results: AnalysisResult[] = []

  async run(): Promise<void> {
    try {
      const data = await this.fetchData()
      const score = this.calculateScore(data)
      if (score > 90) {
        this.log('Excellent')
      }
      this.exportResults(score)
    } catch (error) {
      this.error(String(error))
    }
  }

  private calculateScore(data: unknown): number {
    return 42
  }

  private async fetchData(): Promise<unknown> {
    return {}
  }

  private exportResults(score: number): void {
    return
  }
}
`

const EMPTY = ''

const MEDIUM = `import { Command } from '@oclif/core'
import chalk from 'chalk'

export interface MediumResult {
  value: number
}

export class MediumCommand extends Command {
  run(): void {
    console.log('medium')
  }
}
`

// ─── measureInk ──────────────────────────────────────────

describe('measureInk', () => {
  it('returns 100 density for RICH content', () => {
    expect(measureInk(RICH).density).toBe(100)
  })

  it('returns imperial-ink quality for RICH', () => {
    expect(measureInk(RICH).quality).toBe('imperial-ink')
  })

  it('returns true hasRichPigment for RICH (interface+type)', () => {
    expect(measureInk(RICH).hasRichPigment).toBe(true)
  })

  it('returns true hasNoClumping for RICH (no any/eval)', () => {
    expect(measureInk(RICH).hasNoClumping).toBe(true)
  })

  it('returns true hasDeep for RICH (doc comments)', () => {
    expect(measureInk(RICH).hasDeep).toBe(true)
  })

  it('returns 43 density for EMPTY', () => {
    expect(measureInk(EMPTY).density).toBe(43)
  })

  it('returns watery quality for EMPTY', () => {
    expect(measureInk(EMPTY).quality).toBe('watery')
  })

  it('returns 0 clumpingCount for RICH', () => {
    expect(measureInk(RICH).clumpingCount).toBe(0)
  })

  it('returns 68 density for MEDIUM', () => {
    expect(measureInk(MEDIUM).density).toBe(68)
  })

  it('returns false hasRichPigment for MEDIUM (no type)', () => {
    expect(measureInk(MEDIUM).hasRichPigment).toBe(false)
  })
})

// ─── measureGrinding ─────────────────────────────────────

describe('measureGrinding', () => {
  it('returns 100 discipline for RICH', () => {
    expect(measureGrinding(RICH).discipline).toBe(100)
  })

  it('returns master-grinding technique for RICH', () => {
    expect(measureGrinding(RICH).technique).toBe('master-grinding')
  })

  it('returns true hasEvenPressure for RICH', () => {
    expect(measureGrinding(RICH).hasEvenPressure).toBe(true)
  })

  it('returns true hasThorough for RICH (async+await)', () => {
    expect(measureGrinding(RICH).hasThorough).toBe(true)
  })

  it('returns 42 discipline for EMPTY', () => {
    expect(measureGrinding(EMPTY).discipline).toBe(42)
  })

  it('returns rushed technique for EMPTY', () => {
    expect(measureGrinding(EMPTY).technique).toBe('rushed')
  })

  it('returns 57 discipline for MEDIUM', () => {
    expect(measureGrinding(MEDIUM).discipline).toBe(57)
  })

  it('returns 0 skippingCount for RICH', () => {
    expect(measureGrinding(RICH).skippingCount).toBe(0)
  })
})

// ─── measureStroke ───────────────────────────────────────

describe('measureStroke', () => {
  it('returns 90 quality for RICH', () => {
    expect(measureStroke(RICH).quality).toBe(90)
  })

  it('returns masterwork calligraphy for RICH', () => {
    expect(measureStroke(RICH).calligraphy).toBe('masterwork')
  })

  it('returns true hasProperForm for RICH (interface+class+type)', () => {
    expect(measureStroke(RICH).hasProperForm).toBe(true)
  })

  it('returns true hasNoOverworking for RICH (no console)', () => {
    expect(measureStroke(RICH).hasNoOverworking).toBe(true)
  })

  it('returns 42 quality for EMPTY', () => {
    expect(measureStroke(EMPTY).quality).toBe(42)
  })

  it('returns clumsy calligraphy for EMPTY', () => {
    expect(measureStroke(EMPTY).calligraphy).toBe('clumsy')
  })

  it('returns 37 quality for MEDIUM', () => {
    expect(measureStroke(MEDIUM).quality).toBe(37)
  })

  it('returns false hasNoOverworking for MEDIUM (has console)', () => {
    expect(measureStroke(MEDIUM).hasNoOverworking).toBe(false)
  })
})

// ─── measureBrush ────────────────────────────────────────

describe('measureBrush', () => {
  it('returns 100 preparation for RICH', () => {
    expect(measureBrush(RICH).preparation).toBe(100)
  })

  it('returns master-brush condition for RICH', () => {
    expect(measureBrush(RICH).condition).toBe('master-brush')
  })

  it('returns true hasResponsive for RICH (async+await)', () => {
    expect(measureBrush(RICH).hasResponsive).toBe(true)
  })

  it('returns true hasWellMaintained for RICH (doc comments)', () => {
    expect(measureBrush(RICH).hasWellMaintained).toBe(true)
  })

  it('returns 42 preparation for EMPTY', () => {
    expect(measureBrush(EMPTY).preparation).toBe(42)
  })

  it('returns worn condition for EMPTY', () => {
    expect(measureBrush(EMPTY).condition).toBe('worn')
  })

  it('returns 57 preparation for MEDIUM', () => {
    expect(measureBrush(MEDIUM).preparation).toBe(57)
  })
})

// ─── measurePaper ────────────────────────────────────────

describe('measurePaper', () => {
  it('returns 100 compatibility for RICH', () => {
    expect(measurePaper(RICH).compatibility).toBe(100)
  })

  it('returns xuan-paper quality for RICH', () => {
    expect(measurePaper(RICH).quality).toBe('xuan-paper')
  })

  it('returns true hasNoBleeding for RICH', () => {
    expect(measurePaper(RICH).hasNoBleeding).toBe(true)
  })

  it('returns true hasGoodTexture for RICH (doc comments)', () => {
    expect(measurePaper(RICH).hasGoodTexture).toBe(true)
  })

  it('returns 43 compatibility for EMPTY', () => {
    expect(measurePaper(EMPTY).compatibility).toBe(43)
  })

  it('returns rough-paper quality for EMPTY', () => {
    expect(measurePaper(EMPTY).quality).toBe('rough-paper')
  })

  it('returns 70 compatibility for MEDIUM', () => {
    expect(measurePaper(MEDIUM).compatibility).toBe(70)
  })

  it('returns quality-washi for MEDIUM', () => {
    expect(measurePaper(MEDIUM).quality).toBe('quality-washi')
  })
})

// ─── measureMastery ──────────────────────────────────────

describe('measureMastery', () => {
  it('returns 100 level for RICH', () => {
    expect(measureMastery(RICH).level).toBe(100)
  })

  it('returns calligraphy-master rank for RICH', () => {
    expect(measureMastery(RICH).rank).toBe('calligraphy-master')
  })

  it('returns true hasBalancedComposition for RICH', () => {
    expect(measureMastery(RICH).hasBalancedComposition).toBe(true)
  })

  it('returns true hasRefined for RICH (no console)', () => {
    expect(measureMastery(RICH).hasRefined).toBe(true)
  })

  it('returns 53 level for EMPTY', () => {
    expect(measureMastery(EMPTY).level).toBe(53)
  })

  it('returns beginner rank for EMPTY', () => {
    expect(measureMastery(EMPTY).rank).toBe('beginner')
  })

  it('returns 58 level for MEDIUM', () => {
    expect(measureMastery(MEDIUM).level).toBe(58)
  })

  it('returns beginner rank for MEDIUM', () => {
    expect(measureMastery(MEDIUM).rank).toBe('beginner')
  })
})

// ─── classifyCondition ───────────────────────────────────

describe('classifyCondition', () => {
  it('returns masterpiece-scroll for qualityScore >= 80', () => {
    expect(classifyCondition({ qualityScore: 80 } as any)).toBe('masterpiece-scroll')
  })

  it('returns gallery-piece for qualityScore 65', () => {
    expect(classifyCondition({ qualityScore: 65 } as any)).toBe('gallery-piece')
  })

  it('returns practice-sheet for qualityScore 50', () => {
    expect(classifyCondition({ qualityScore: 50 } as any)).toBe('practice-sheet')
  })

  it('returns rough-draft for qualityScore 35', () => {
    expect(classifyCondition({ qualityScore: 35 } as any)).toBe('rough-draft')
  })

  it('returns scratch-paper for qualityScore 20', () => {
    expect(classifyCondition({ qualityScore: 20 } as any)).toBe('scratch-paper')
  })

  it('returns waste for qualityScore 10', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('waste')
  })
})

// ─── analyzeInkGrinding ──────────────────────────────────

describe('analyzeInkGrinding', () => {
  it('returns 98 qualityScore for RICH', () => {
    expect(analyzeInkGrinding(RICH, 'rich.ts').qualityScore).toBe(98)
  })

  it('returns masterpiece-scroll condition for RICH', () => {
    expect(analyzeInkGrinding(RICH, 'rich.ts').condition).toBe('masterpiece-scroll')
  })

  it('returns correct file path', () => {
    expect(analyzeInkGrinding(RICH, 'path/to/file.ts').file).toBe('path/to/file.ts')
  })

  it('returns 45 qualityScore for EMPTY', () => {
    expect(analyzeInkGrinding(EMPTY, 'empty.ts').qualityScore).toBe(45)
  })

  it('returns rough-draft condition for EMPTY', () => {
    expect(analyzeInkGrinding(EMPTY, 'empty.ts').condition).toBe('rough-draft')
  })

  it('returns 57 qualityScore for MEDIUM', () => {
    expect(analyzeInkGrinding(MEDIUM, 'medium.ts').qualityScore).toBe(57)
  })

  it('returns practice-sheet condition for MEDIUM', () => {
    expect(analyzeInkGrinding(MEDIUM, 'medium.ts').condition).toBe('practice-sheet')
  })
})

// ─── classifyShelfType ───────────────────────────────────

describe('classifyShelfType', () => {
  it('returns empty for empty grindings', () => {
    expect(classifyShelfType([])).toBe('empty')
  })

  it('returns master-studio for avg >= 75 and 30%+ masterpiece', () => {
    const grindings = [
      { qualityScore: 80, condition: 'masterpiece-scroll' },
      { qualityScore: 70, condition: 'masterpiece-scroll' },
    ] as any[]
    expect(classifyShelfType(grindings)).toBe('master-studio')
  })

  it('returns artist-desk for avg >= 60', () => {
    expect(classifyShelfType([{ qualityScore: 65, condition: 'gallery-piece' }] as any[])).toBe('artist-desk')
  })

  it('returns student-bench for avg >= 45', () => {
    expect(classifyShelfType([{ qualityScore: 50, condition: 'practice-sheet' }] as any[])).toBe('student-bench')
  })

  it('returns practice-room for avg >= 30', () => {
    expect(classifyShelfType([{ qualityScore: 35, condition: 'rough-draft' }] as any[])).toBe('practice-room')
  })
})

// ─── analyzeStudioShelf ──────────────────────────────────

describe('analyzeStudioShelf', () => {
  it('returns empty shelf for empty grindings', () => {
    const shelf = analyzeStudioShelf([], '.')
    expect(shelf.shelfType).toBe('empty')
    expect(shelf.condition).toBe('empty')
    expect(shelf.avgInk).toBe(0)
  })

  it('computes avgInk correctly for rich+medium', () => {
    const grindings = [analyzeInkGrinding(RICH, 'r.ts'), analyzeInkGrinding(MEDIUM, 'm.ts')]
    expect(analyzeStudioShelf(grindings, 'src').avgInk).toBe(84)
  })

  it('computes avgDiscipline correctly for rich+medium', () => {
    const grindings = [analyzeInkGrinding(RICH, 'r.ts'), analyzeInkGrinding(MEDIUM, 'm.ts')]
    expect(analyzeStudioShelf(grindings, 'src').avgDiscipline).toBe(79)
  })

  it('counts masterpiece correctly', () => {
    const grindings = [analyzeInkGrinding(RICH, 'r.ts'), analyzeInkGrinding(MEDIUM, 'm.ts')]
    expect(analyzeStudioShelf(grindings, 'src').masterpieceCount).toBe(1)
  })

  it('returns correct directory', () => {
    expect(analyzeStudioShelf([analyzeInkGrinding(RICH, 'r.ts')], 'my/dir').directory).toBe('my/dir')
  })
})

// ─── classifyArtistGrade ─────────────────────────────────

describe('classifyArtistGrade', () => {
  it('returns calligraphy-sage for 80+', () => { expect(classifyArtistGrade(80)).toBe('calligraphy-sage') })
  it('returns master-calligrapher for 65+', () => { expect(classifyArtistGrade(65)).toBe('master-calligrapher') })
  it('returns skilled-artist for 50+', () => { expect(classifyArtistGrade(50)).toBe('skilled-artist') })
  it('returns student for 35+', () => { expect(classifyArtistGrade(35)).toBe('student') })
  it('returns novice for 20+', () => { expect(classifyArtistGrade(20)).toBe('novice') })
  it('returns child for < 20', () => { expect(classifyArtistGrade(10)).toBe('child') })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for high-quality code', () => {
    const result = buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.recommendations).toEqual([])
  })

  it('recommends ink density when avgInkDensity < 50', () => {
    const result = buildInkstoneGrindResult(['e.ts'], [EMPTY])
    expect(result.recommendations.some((r) => r.includes('ink density'))).toBe(true)
  })

  it('recommends stroke quality when avgStrokeQuality < 50', () => {
    const result = buildInkstoneGrindResult(['e.ts'], [EMPTY])
    expect(result.recommendations.some((r) => r.includes('stroke quality'))).toBe(true)
  })
})

// ─── buildInkstoneGrindResult ────────────────────────────

describe('buildInkstoneGrindResult', () => {
  it('returns correct totalFiles', () => {
    expect(buildInkstoneGrindResult(['a.ts', 'b.ts'], [RICH, MEDIUM]).stats.totalFiles).toBe(2)
  })

  it('computes overallRefinement correctly for rich+medium', () => {
    expect(buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.overallRefinement).toBe(78)
  })

  it('returns master-calligrapher grade for rich+medium', () => {
    expect(buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.artistGrade).toBe('master-calligrapher')
  })

  it('returns isRefined true for rich+medium', () => {
    expect(buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).studio.isRefined).toBe(true)
  })

  it('counts condition buckets correctly', () => {
    const stats = buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats
    expect(stats.masterpieceScrollCount).toBe(1)
    expect(stats.practiceSheetCount).toBe(1)
  })

  it('sets bestGrinding to highest qualityScore file', () => {
    expect(buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.bestGrinding).toBe('r.ts')
  })

  it('creates one shelf for same-directory files', () => {
    expect(buildInkstoneGrindResult(['src/a.ts', 'src/b.ts'], [RICH, MEDIUM]).shelves.length).toBe(1)
  })

  it('creates two shelves for different-directory files', () => {
    expect(buildInkstoneGrindResult(['dir1/a.ts', 'dir2/b.ts'], [RICH, MEDIUM]).shelves.length).toBe(2)
  })

  it('handles 3-file averages correctly', () => {
    const result = buildInkstoneGrindResult(['src/r.ts', 'src/m.ts', 'src/e.ts'], [RICH, MEDIUM, EMPTY])
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.overallRefinement).toBe(66)
    expect(result.stats.avgInkDensity).toBe(70)
  })

  it('counts high-level flags correctly', () => {
    const stats = buildInkstoneGrindResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats
    expect(stats.hasHighDensityCount).toBe(1)
    expect(stats.hasHighDisciplineCount).toBe(1)
    expect(stats.hasHighPreparationCount).toBe(1)
  })

  it('handles single file', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.masterpieceScrollCount).toBe(1)
    expect(result.studio.overallRefinement).toBe(98)
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('format helpers', () => {
  it('formatInkstoneGrindJson returns valid JSON', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(() => JSON.parse(formatInkstoneGrindJson(result))).not.toThrow()
  })

  it('formatInkstoneGrindTable includes header', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(formatInkstoneGrindTable(result, false)).toContain('Inkstone Grind Analysis')
  })

  it('formatInkstoneGrindTable includes Overall Refinement', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(formatInkstoneGrindTable(result, false)).toContain('Overall Refinement')
  })

  it('formatInkstoneGrindTable includes Artist Grade', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(formatInkstoneGrindTable(result, false)).toContain('Artist Grade')
  })

  it('formatInkstoneGrindTable shows per-file in verbose mode', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(formatInkstoneGrindTable(result, true)).toContain('Per-File Details')
  })

  it('formatInkstoneGrindTable omits per-file in non-verbose mode', () => {
    const result = buildInkstoneGrindResult(['r.ts'], [RICH])
    expect(formatInkstoneGrindTable(result, false)).not.toContain('Per-File Details')
  })

  it('scoreColor returns string', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('conditionColor returns string', () => { expect(typeof conditionColor('masterpiece-scroll')).toBe('string') })
  it('inkQualityColor returns string', () => { expect(typeof inkQualityColor('imperial-ink')).toBe('string') })
  it('techniqueColor returns string', () => { expect(typeof techniqueColor('master-grinding')).toBe('string') })
  it('calligraphyColor returns string', () => { expect(typeof calligraphyColor('masterwork')).toBe('string') })
  it('brushConditionColor returns string', () => { expect(typeof brushConditionColor('master-brush')).toBe('string') })
  it('paperQualityColor returns string', () => { expect(typeof paperQualityColor('xuan-paper')).toBe('string') })
  it('masteryRankColor returns string', () => { expect(typeof masteryRankColor('calligraphy-master')).toBe('string') })
  it('artistGradeColor returns string', () => { expect(typeof artistGradeColor('calligraphy-sage')).toBe('string') })
  it('shelfTypeColor returns string', () => { expect(typeof shelfTypeColor('master-studio')).toBe('string') })
  it('shelfConditionColor returns string', () => { expect(typeof shelfConditionColor('calligraphy-hall')).toBe('string') })
  it('conditionColor handles unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})
