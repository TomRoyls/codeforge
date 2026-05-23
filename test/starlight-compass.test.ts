import { describe, it, expect } from 'vitest'

import {
  measurePole,
  measureConstellation,
  measureNavigational,
  measureStellar,
  measureCosmic,
  measureGuidance,
  classifyCondition,
  analyzeStarPoint,
  classifySkyType,
  analyzeNightSky,
  classifyNavigatorGrade,
  buildStarlightCompassResult,
} from '../src/commands/starlight-compass-helpers.js'

import {
  scoreColor,
  conditionColor,
  brightnessColor,
  patternColor,
  precisionColor,
  visibilityColor,
  scopeColor,
  ratingColor,
  navigatorGradeColor,
  skyTypeColor,
  skyConditionColor,
  formatStarlightCompassJson,
  formatStarlightCompassTable,
} from '../src/commands/starlight-compass-format-helpers.js'

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

// ─── measurePole ─────────────────────────────────────────

describe('measurePole', () => {
  it('returns 100 star for RICH', () => { expect(measurePole(RICH).star).toBe(100) })
  it('returns polaris-brilliant for RICH', () => { expect(measurePole(RICH).brightness).toBe('polaris-brilliant') })
  it('returns true hasClearEntryPoint for RICH', () => { expect(measurePole(RICH).hasClearEntryPoint).toBe(true) })
  it('returns true hasFixed for RICH (doc comments)', () => { expect(measurePole(RICH).hasFixed).toBe(true) })
  it('returns 0 obscurityCount for RICH', () => { expect(measurePole(RICH).obscurityCount).toBe(0) })
  it('returns 41 star for EMPTY', () => { expect(measurePole(EMPTY).star).toBe(41) })
  it('returns flickering for EMPTY', () => { expect(measurePole(EMPTY).brightness).toBe('flickering') })
  it('returns 68 star for MEDIUM', () => { expect(measurePole(MEDIUM).star).toBe(68) })
  it('returns dim-star for MEDIUM', () => { expect(measurePole(MEDIUM).brightness).toBe('dim-star') })
})

// ─── measureConstellation ────────────────────────────────

describe('measureConstellation', () => {
  it('returns 90 mapping for RICH', () => { expect(measureConstellation(RICH).mapping).toBe(90) })
  it('returns ursa-major for RICH', () => { expect(measureConstellation(RICH).pattern).toBe('ursa-major') })
  it('returns true hasRecognizablePatterns for RICH', () => { expect(measureConstellation(RICH).hasRecognizablePatterns).toBe(true) })
  it('returns true hasClearBoundaries for RICH (async+await)', () => { expect(measureConstellation(RICH).hasClearBoundaries).toBe(true) })
  it('returns 43 mapping for EMPTY', () => { expect(measureConstellation(EMPTY).mapping).toBe(43) })
  it('returns random-stars for EMPTY', () => { expect(measureConstellation(EMPTY).pattern).toBe('random-stars') })
  it('returns 58 mapping for MEDIUM', () => { expect(measureConstellation(MEDIUM).mapping).toBe(58) })
  it('returns 0 orphanCount for RICH', () => { expect(measureConstellation(RICH).orphanCount).toBe(0) })
})

// ─── measureNavigational ─────────────────────────────────

describe('measureNavigational', () => {
  it('returns 100 accuracy for RICH', () => { expect(measureNavigational(RICH).accuracy).toBe(100) })
  it('returns gps-grade for RICH', () => { expect(measureNavigational(RICH).precision).toBe('gps-grade') })
  it('returns true hasAccurateLogic for RICH', () => { expect(measureNavigational(RICH).hasAccurateLogic).toBe(true) })
  it('returns true hasReliableDestination for RICH', () => { expect(measureNavigational(RICH).hasReliableDestination).toBe(true) })
  it('returns 43 accuracy for EMPTY', () => { expect(measureNavigational(EMPTY).accuracy).toBe(43) })
  it('returns lost for EMPTY', () => { expect(measureNavigational(EMPTY).precision).toBe('lost') })
  it('returns 58 accuracy for MEDIUM', () => { expect(measureNavigational(MEDIUM).accuracy).toBe(58) })
  it('returns 0 wrongTurnCount for RICH', () => { expect(measureNavigational(RICH).wrongTurnCount).toBe(0) })
})

// ─── measureStellar ──────────────────────────────────────

describe('measureStellar', () => {
  it('returns 100 clarity for RICH', () => { expect(measureStellar(RICH).clarity).toBe(100) })
  it('returns crystal-night for RICH', () => { expect(measureStellar(RICH).visibility).toBe('crystal-night') })
  it('returns true hasNoDarkZones for RICH (no console)', () => { expect(measureStellar(RICH).hasNoDarkZones).toBe(true) })
  it('returns true hasTransparent for RICH', () => { expect(measureStellar(RICH).hasTransparent).toBe(true) })
  it('returns 42 clarity for EMPTY', () => { expect(measureStellar(EMPTY).clarity).toBe(42) })
  it('returns foggy for EMPTY', () => { expect(measureStellar(EMPTY).visibility).toBe('foggy') })
  it('returns 60 clarity for MEDIUM', () => { expect(measureStellar(MEDIUM).clarity).toBe(60) })
  it('returns false hasNoDarkZones for MEDIUM (has console)', () => { expect(measureStellar(MEDIUM).hasNoDarkZones).toBe(false) })
})

// ─── measureCosmic ───────────────────────────────────────

describe('measureCosmic', () => {
  it('returns 100 awareness for RICH', () => { expect(measureCosmic(RICH).awareness).toBe(100) })
  it('returns cosmic-perspective for RICH', () => { expect(measureCosmic(RICH).scope).toBe('cosmic-perspective') })
  it('returns true hasBigPicture for RICH', () => { expect(measureCosmic(RICH).hasBigPicture).toBe(true) })
  it('returns true hasBalanced for RICH (async+await)', () => { expect(measureCosmic(RICH).hasBalanced).toBe(true) })
  it('returns 43 awareness for EMPTY', () => { expect(measureCosmic(EMPTY).awareness).toBe(43) })
  it('returns surface-level for EMPTY', () => { expect(measureCosmic(EMPTY).scope).toBe('surface-level') })
  it('returns 70 awareness for MEDIUM', () => { expect(measureCosmic(MEDIUM).awareness).toBe(70) })
  it('returns galactic-view for MEDIUM', () => { expect(measureCosmic(MEDIUM).scope).toBe('galactic-view') })
})

// ─── measureGuidance ─────────────────────────────────────

describe('measureGuidance', () => {
  it('returns 100 quality for RICH', () => { expect(measureGuidance(RICH).quality).toBe(100) })
  it('returns master-navigator for RICH', () => { expect(measureGuidance(RICH).rating).toBe('master-navigator') })
  it('returns true hasClearDirections for RICH', () => { expect(measureGuidance(RICH).hasClearDirections).toBe(true) })
  it('returns true hasReliableMap for RICH (async+await)', () => { expect(measureGuidance(RICH).hasReliableMap).toBe(true) })
  it('returns 42 quality for EMPTY', () => { expect(measureGuidance(EMPTY).quality).toBe(42) })
  it('returns lost-wanderer for EMPTY', () => { expect(measureGuidance(EMPTY).rating).toBe('lost-wanderer') })
  it('returns 57 quality for MEDIUM', () => { expect(measureGuidance(MEDIUM).quality).toBe(57) })
  it('returns 0 ambiguityCount for RICH', () => { expect(measureGuidance(RICH).ambiguityCount).toBe(0) })
})

// ─── classifyCondition ───────────────────────────────────

describe('classifyCondition', () => {
  it('returns celestial-chart for 80+', () => { expect(classifyCondition({ qualityScore: 80 } as any)).toBe('celestial-chart') })
  it('returns star-map for 65+', () => { expect(classifyCondition({ qualityScore: 65 } as any)).toBe('star-map') })
  it('returns navigational-aid for 50+', () => { expect(classifyCondition({ qualityScore: 50 } as any)).toBe('navigational-aid') })
  it('returns rough-sketch for 35+', () => { expect(classifyCondition({ qualityScore: 35 } as any)).toBe('rough-sketch') })
  it('returns smudged-drawing for 20+', () => { expect(classifyCondition({ qualityScore: 20 } as any)).toBe('smudged-drawing') })
  it('returns blank for < 20', () => { expect(classifyCondition({ qualityScore: 10 } as any)).toBe('blank') })
})

// ─── analyzeStarPoint ────────────────────────────────────

describe('analyzeStarPoint', () => {
  it('returns 99 qualityScore for RICH', () => { expect(analyzeStarPoint(RICH, 'rich.ts').qualityScore).toBe(99) })
  it('returns celestial-chart for RICH', () => { expect(analyzeStarPoint(RICH, 'rich.ts').condition).toBe('celestial-chart') })
  it('returns correct file path', () => { expect(analyzeStarPoint(RICH, 'path/to/file.ts').file).toBe('path/to/file.ts') })
  it('returns 42 qualityScore for EMPTY', () => { expect(analyzeStarPoint(EMPTY, 'empty.ts').qualityScore).toBe(42) })
  it('returns rough-sketch for EMPTY', () => { expect(analyzeStarPoint(EMPTY, 'empty.ts').condition).toBe('rough-sketch') })
  it('returns 61 qualityScore for MEDIUM', () => { expect(analyzeStarPoint(MEDIUM, 'medium.ts').qualityScore).toBe(61) })
  it('returns navigational-aid for MEDIUM', () => { expect(analyzeStarPoint(MEDIUM, 'medium.ts').condition).toBe('navigational-aid') })
})

// ─── classifySkyType ─────────────────────────────────────

describe('classifySkyType', () => {
  it('returns void for empty', () => { expect(classifySkyType([])).toBe('void') })
  it('returns celestial-sphere for high avg + 30% celestial', () => {
    const pts = [{ qualityScore: 80, condition: 'celestial-chart' }, { qualityScore: 70, condition: 'celestial-chart' }] as any[]
    expect(classifySkyType(pts)).toBe('celestial-sphere')
  })
  it('returns night-hemisphere for avg >= 60', () => {
    expect(classifySkyType([{ qualityScore: 65, condition: 'star-map' }] as any[])).toBe('night-hemisphere')
  })
  it('returns visible-sky for avg >= 45', () => {
    expect(classifySkyType([{ qualityScore: 50, condition: 'navigational-aid' }] as any[])).toBe('visible-sky')
  })
  it('returns cloudy-sky for avg >= 30', () => {
    expect(classifySkyType([{ qualityScore: 35, condition: 'rough-sketch' }] as any[])).toBe('cloudy-sky')
  })
})

// ─── analyzeNightSky ─────────────────────────────────────

describe('analyzeNightSky', () => {
  it('returns void sky for empty points', () => {
    const sky = analyzeNightSky([], '.')
    expect(sky.skyType).toBe('void')
    expect(sky.condition).toBe('void')
    expect(sky.avgPoleStar).toBe(0)
  })
  it('computes avgPoleStar correctly for rich+medium', () => {
    const pts = [analyzeStarPoint(RICH, 'r.ts'), analyzeStarPoint(MEDIUM, 'm.ts')]
    expect(analyzeNightSky(pts, 'src').avgPoleStar).toBe(84)
  })
  it('counts celestial correctly', () => {
    const pts = [analyzeStarPoint(RICH, 'r.ts'), analyzeStarPoint(MEDIUM, 'm.ts')]
    expect(analyzeNightSky(pts, 'src').celestialCount).toBe(1)
  })
  it('returns correct directory', () => {
    expect(analyzeNightSky([analyzeStarPoint(RICH, 'r.ts')], 'my/dir').directory).toBe('my/dir')
  })
})

// ─── classifyNavigatorGrade ──────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns celestial-master for 80+', () => { expect(classifyNavigatorGrade(80)).toBe('celestial-master') })
  it('returns master-navigator for 65+', () => { expect(classifyNavigatorGrade(65)).toBe('master-navigator') })
  it('returns navigator for 50+', () => { expect(classifyNavigatorGrade(50)).toBe('navigator') })
  it('returns apprentice for 35+', () => { expect(classifyNavigatorGrade(35)).toBe('apprentice') })
  it('returns landlubber for 20+', () => { expect(classifyNavigatorGrade(20)).toBe('landlubber') })
  it('returns lost-soul for < 20', () => { expect(classifyNavigatorGrade(10)).toBe('lost-soul') })
})

// ─── buildStarlightCompassResult ─────────────────────────

describe('buildStarlightCompassResult', () => {
  it('returns correct totalFiles', () => {
    expect(buildStarlightCompassResult(['a.ts', 'b.ts'], [RICH, MEDIUM]).stats.totalFiles).toBe(2)
  })

  it('computes overallNavigation correctly for rich+medium', () => {
    expect(buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.overallNavigation).toBe(80)
  })

  it('returns celestial-master grade for rich+medium', () => {
    expect(buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.navigatorGrade).toBe('celestial-master')
  })

  it('returns isNavigable true for rich+medium', () => {
    expect(buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).cosmos.isNavigable).toBe(true)
  })

  it('counts condition buckets correctly', () => {
    const stats = buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats
    expect(stats.celestialChartCount).toBe(1)
    expect(stats.navigationalAidCount).toBe(1)
  })

  it('sets bestPoint to highest qualityScore', () => {
    expect(buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).stats.bestPoint).toBe('r.ts')
  })

  it('creates one sky for same-directory files', () => {
    expect(buildStarlightCompassResult(['src/a.ts', 'src/b.ts'], [RICH, MEDIUM]).skies.length).toBe(1)
  })

  it('creates two skies for different-directory files', () => {
    expect(buildStarlightCompassResult(['dir1/a.ts', 'dir2/b.ts'], [RICH, MEDIUM]).skies.length).toBe(2)
  })

  it('handles 3-file averages', () => {
    const result = buildStarlightCompassResult(['src/r.ts', 'src/m.ts', 'src/e.ts'], [RICH, MEDIUM, EMPTY])
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.overallNavigation).toBe(67)
    expect(result.stats.avgPoleStar).toBe(70)
  })

  it('returns empty recommendations for high-quality code', () => {
    expect(buildStarlightCompassResult(['r.ts', 'm.ts'], [RICH, MEDIUM]).recommendations).toEqual([])
  })

  it('generates recommendations for empty code', () => {
    const recs = buildStarlightCompassResult(['e.ts'], [EMPTY]).recommendations
    expect(recs.some((r) => r.includes('pole star'))).toBe(true)
  })

  it('handles single file', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.celestialChartCount).toBe(1)
    expect(result.cosmos.overallNavigation).toBe(99)
  })
})

// ─── Format Helpers ──────────────────────────────────────

describe('format helpers', () => {
  it('formatStarlightCompassJson returns valid JSON', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(() => JSON.parse(formatStarlightCompassJson(result))).not.toThrow()
  })

  it('formatStarlightCompassTable includes header', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(formatStarlightCompassTable(result, false)).toContain('Starlight Compass Analysis')
  })

  it('formatStarlightCompassTable includes Overall Navigation', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(formatStarlightCompassTable(result, false)).toContain('Overall Navigation')
  })

  it('formatStarlightCompassTable shows per-file in verbose', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(formatStarlightCompassTable(result, true)).toContain('Per-File Details')
  })

  it('formatStarlightCompassTable omits per-file in non-verbose', () => {
    const result = buildStarlightCompassResult(['r.ts'], [RICH])
    expect(formatStarlightCompassTable(result, false)).not.toContain('Per-File Details')
  })

  it('scoreColor returns string', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('conditionColor returns string', () => { expect(typeof conditionColor('celestial-chart')).toBe('string') })
  it('brightnessColor returns string', () => { expect(typeof brightnessColor('polaris-brilliant')).toBe('string') })
  it('patternColor returns string', () => { expect(typeof patternColor('ursa-major')).toBe('string') })
  it('precisionColor returns string', () => { expect(typeof precisionColor('gps-grade')).toBe('string') })
  it('visibilityColor returns string', () => { expect(typeof visibilityColor('crystal-night')).toBe('string') })
  it('scopeColor returns string', () => { expect(typeof scopeColor('cosmic-perspective')).toBe('string') })
  it('ratingColor returns string', () => { expect(typeof ratingColor('master-navigator')).toBe('string') })
  it('navigatorGradeColor returns string', () => { expect(typeof navigatorGradeColor('celestial-master')).toBe('string') })
  it('skyTypeColor returns string', () => { expect(typeof skyTypeColor('celestial-sphere')).toBe('string') })
  it('skyConditionColor returns string', () => { expect(typeof skyConditionColor('master-chart')).toBe('string') })
  it('conditionColor handles unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})
