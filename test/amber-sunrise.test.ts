import { describe, it, expect } from 'vitest'

import {
  measureDawn,
  measureAwakening,
  measureGrowth,
  measureRadiant,
  measureTransformation,
  measureGolden,
  classifyCondition,
  analyzeSunbeam,
  classifyHorizonType,
  analyzeHorizon,
  classifyObserverGrade,
  generateRecommendations,
  buildAmberSunriseResult,
} from '../src/commands/amber-sunrise-helpers.js'

import {
  scoreColor,
  conditionColor,
  dawnColor,
  awakeningColor,
  growthColor,
  radiantColor,
  transformColor,
  goldenColor,
  observerColor,
  horizonTypeColor,
  horizonConditionColor,
  formatAmberSunriseJson,
  formatAmberSunriseTable,
} from '../src/commands/amber-sunrise-format-helpers.js'

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

// ─── measureDawn ──────────────────────────────────────────

describe('measureDawn', () => {
  it('returns 100 warmth for RICH content', () => {
    const result = measureDawn(RICH)
    expect(result.warmth).toBe(100)
  })

  it('returns amber-gold color for RICH content', () => {
    const result = measureDawn(RICH)
    expect(result.color).toBe('amber-gold')
  })

  it('returns hasHighWarmth true for RICH content', () => {
    const result = measureDawn(RICH)
    expect(result.hasHighWarmth).toBe(true)
  })

  it('returns true for hasInviting with interfaces and types', () => {
    expect(measureDawn(RICH).hasInviting).toBe(true)
  })

  it('returns true for hasWelcoming with exports and functions', () => {
    expect(measureDawn(RICH).hasWelcoming).toBe(true)
  })

  it('returns true for hasNoHostility when no any/eval', () => {
    expect(measureDawn(RICH).hasNoHostility).toBe(true)
  })

  it('returns true for hasGentle with import and export', () => {
    expect(measureDawn(RICH).hasGentle).toBe(true)
  })

  it('returns true for hasComfortable with doc comments', () => {
    expect(measureDawn(RICH).hasComfortable).toBe(true)
  })

  it('returns 43 warmth for EMPTY content', () => {
    expect(measureDawn(EMPTY).warmth).toBe(43)
  })

  it('returns cold-blue color for EMPTY content', () => {
    expect(measureDawn(EMPTY).color).toBe('cold-blue')
  })

  it('returns 0 hostilityCount for RICH', () => {
    expect(measureDawn(RICH).hostilityCount).toBe(0)
  })

  it('returns 0 barrierCount for RICH', () => {
    expect(measureDawn(RICH).barrierCount).toBe(0)
  })

  it('returns 68 warmth for MEDIUM content', () => {
    expect(measureDawn(MEDIUM).warmth).toBe(68)
  })

  it('returns false hasInviting for MEDIUM (no type keyword)', () => {
    expect(measureDawn(MEDIUM).hasInviting).toBe(false)
  })

  it('returns true hasWelcoming for MEDIUM (export + class)', () => {
    expect(measureDawn(MEDIUM).hasWelcoming).toBe(true)
  })
})

// ─── measureAwakening ─────────────────────────────────────

describe('measureAwakening', () => {
  it('returns 100 quality for RICH content', () => {
    expect(measureAwakening(RICH).quality).toBe(100)
  })

  it('returns graceful-awakening state for RICH', () => {
    expect(measureAwakening(RICH).state).toBe('graceful-awakening')
  })

  it('returns true hasCleanInit for RICH (interface+type+class)', () => {
    expect(measureAwakening(RICH).hasCleanInit).toBe(true)
  })

  it('returns true hasLazyInit for RICH (async+await)', () => {
    expect(measureAwakening(RICH).hasLazyInit).toBe(true)
  })

  it('returns true hasNoOverhead for RICH (no console)', () => {
    expect(measureAwakening(RICH).hasNoOverhead).toBe(true)
  })

  it('returns 42 quality for EMPTY', () => {
    expect(measureAwakening(EMPTY).quality).toBe(42)
  })

  it('returns rough-start state for EMPTY', () => {
    expect(measureAwakening(EMPTY).state).toBe('rough-start')
  })

  it('returns 47 quality for MEDIUM', () => {
    expect(measureAwakening(MEDIUM).quality).toBe(47)
  })

  it('returns false hasCleanInit for MEDIUM (no type keyword)', () => {
    expect(measureAwakening(MEDIUM).hasCleanInit).toBe(false)
  })

  it('returns false hasNoOverhead for MEDIUM (has console.log)', () => {
    expect(measureAwakening(MEDIUM).hasNoOverhead).toBe(false)
  })

  it('returns 0 crashCount for RICH', () => {
    expect(measureAwakening(RICH).crashCount).toBe(0)
  })

  it('returns 0 timeoutCount for RICH', () => {
    expect(measureAwakening(RICH).timeoutCount).toBe(0)
  })
})

// ─── measureGrowth ────────────────────────────────────────

describe('measureGrowth', () => {
  it('returns 79 potential for RICH', () => {
    expect(measureGrowth(RICH).potential).toBe(79)
  })

  it('returns exponential trajectory for RICH', () => {
    expect(measureGrowth(RICH).trajectory).toBe('exponential')
  })

  it('returns true hasHighPotential for RICH', () => {
    expect(measureGrowth(RICH).hasHighPotential).toBe(true)
  })

  it('returns true hasExtensible for RICH', () => {
    expect(measureGrowth(RICH).hasExtensible).toBe(true)
  })

  it('returns true hasOpenArchitecture for RICH (async+await)', () => {
    expect(measureGrowth(RICH).hasOpenArchitecture).toBe(true)
  })

  it('returns 32 potential for EMPTY', () => {
    expect(measureGrowth(EMPTY).potential).toBe(32)
  })

  it('returns decline trajectory for very low content', () => {
    expect(measureGrowth(EMPTY).trajectory).toBe('plateau')
  })

  it('returns 47 potential for MEDIUM', () => {
    expect(measureGrowth(MEDIUM).potential).toBe(47)
  })

  it('returns false hasPluginReady for MEDIUM (no generics or optional)', () => {
    expect(measureGrowth(MEDIUM).hasPluginReady).toBe(false)
  })

  it('returns true hasNoCoupling for RICH (no TODO/FIXME)', () => {
    expect(measureGrowth(RICH).hasNoCoupling).toBe(true)
  })
})

// ─── measureRadiant ───────────────────────────────────────

describe('measureRadiant', () => {
  it('returns 100 level for RICH', () => {
    expect(measureRadiant(RICH).level).toBe(100)
  })

  it('returns blinding-brilliance quality for RICH', () => {
    expect(measureRadiant(RICH).quality).toBe('blinding-brilliance')
  })

  it('returns true hasTransparent for RICH (doc comments)', () => {
    expect(measureRadiant(RICH).hasTransparent).toBe(true)
  })

  it('returns true hasIlluminated for RICH (interface+type)', () => {
    expect(measureRadiant(RICH).hasIlluminated).toBe(true)
  })

  it('returns true hasNoDarkCorners for RICH (no console)', () => {
    expect(measureRadiant(RICH).hasNoDarkCorners).toBe(true)
  })

  it('returns 42 level for EMPTY', () => {
    expect(measureRadiant(EMPTY).level).toBe(42)
  })

  it('returns shadow quality for EMPTY', () => {
    expect(measureRadiant(EMPTY).quality).toBe('shadow')
  })

  it('returns 60 level for MEDIUM', () => {
    expect(measureRadiant(MEDIUM).level).toBe(60)
  })

  it('returns false hasTransparent for MEDIUM (no doc comments)', () => {
    expect(measureRadiant(MEDIUM).hasTransparent).toBe(false)
  })

  it('returns 0 ambiguityCount for RICH', () => {
    expect(measureRadiant(RICH).ambiguityCount).toBe(0)
  })

  it('returns 0 hiddenCount for RICH', () => {
    expect(measureRadiant(RICH).hiddenCount).toBe(0)
  })
})

// ─── measureTransformation ────────────────────────────────

describe('measureTransformation', () => {
  it('returns 90 power for RICH', () => {
    expect(measureTransformation(RICH).power).toBe(90)
  })

  it('returns metamorphic capability for RICH', () => {
    expect(measureTransformation(RICH).capability).toBe('metamorphic')
  })

  it('returns true hasPolymorphic for RICH (interface+class+type)', () => {
    expect(measureTransformation(RICH).hasPolymorphic).toBe(true)
  })

  it('returns true hasAdaptive for RICH (async+await)', () => {
    expect(measureTransformation(RICH).hasAdaptive).toBe(true)
  })

  it('returns true hasResilient for RICH (try+catch)', () => {
    expect(measureTransformation(RICH).hasResilient).toBe(true)
  })

  it('returns 42 power for EMPTY', () => {
    expect(measureTransformation(EMPTY).power).toBe(42)
  })

  it('returns rigid capability for EMPTY', () => {
    expect(measureTransformation(EMPTY).capability).toBe('rigid')
  })

  it('returns 47 power for MEDIUM', () => {
    expect(measureTransformation(MEDIUM).power).toBe(47)
  })

  it('returns false hasPolymorphic for MEDIUM (no type)', () => {
    expect(measureTransformation(MEDIUM).hasPolymorphic).toBe(false)
  })

  it('returns 0 fragilityCount for RICH', () => {
    expect(measureTransformation(RICH).fragilityCount).toBe(0)
  })
})

// ─── measureGolden ────────────────────────────────────────

describe('measureGolden', () => {
  it('returns 100 quality for RICH', () => {
    expect(measureGolden(RICH).quality).toBe(100)
  })

  it('returns golden-hour for RICH', () => {
    expect(measureGolden(RICH).hour).toBe('golden-hour')
  })

  it('returns true hasMasterful for RICH (interface+class+type)', () => {
    expect(measureGolden(RICH).hasMasterful).toBe(true)
  })

  it('returns true hasNoFlaws for RICH', () => {
    expect(measureGolden(RICH).hasNoFlaws).toBe(true)
  })

  it('returns true hasElegant for RICH (doc comments)', () => {
    expect(measureGolden(RICH).hasElegant).toBe(true)
  })

  it('returns true hasNoWaste for RICH', () => {
    expect(measureGolden(RICH).hasNoWaste).toBe(true)
  })

  it('returns true hasComplete for RICH (return keyword)', () => {
    expect(measureGolden(RICH).hasComplete).toBe(true)
  })

  it('returns 54 quality for EMPTY', () => {
    expect(measureGolden(EMPTY).quality).toBe(54)
  })

  it('returns gloomy hour for EMPTY', () => {
    expect(measureGolden(EMPTY).hour).toBe('gloomy')
  })

  it('returns 57 quality for MEDIUM', () => {
    expect(measureGolden(MEDIUM).quality).toBe(57)
  })

  it('returns false hasElegant for MEDIUM (no doc comments)', () => {
    expect(measureGolden(MEDIUM).hasElegant).toBe(false)
  })

  it('returns false hasNoWaste for MEDIUM (has console.log)', () => {
    expect(measureGolden(MEDIUM).hasNoWaste).toBe(false)
  })
})

// ─── classifyCondition ────────────────────────────────────

describe('classifyCondition', () => {
  it('returns golden-masterpiece for qualityScore >= 80', () => {
    const beam = { qualityScore: 80 } as any
    expect(classifyCondition(beam)).toBe('golden-masterpiece')
  })

  it('returns sunlit-excellence for qualityScore 65', () => {
    const beam = { qualityScore: 65 } as any
    expect(classifyCondition(beam)).toBe('sunlit-excellence')
  })

  it('returns warm-professional for qualityScore 50', () => {
    const beam = { qualityScore: 50 } as any
    expect(classifyCondition(beam)).toBe('warm-professional')
  })

  it('returns cloudy-adequate for qualityScore 35', () => {
    const beam = { qualityScore: 35 } as any
    expect(classifyCondition(beam)).toBe('cloudy-adequate')
  })

  it('returns dim-struggling for qualityScore 20', () => {
    const beam = { qualityScore: 20 } as any
    expect(classifyCondition(beam)).toBe('dim-struggling')
  })

  it('returns darkness for qualityScore 10', () => {
    const beam = { qualityScore: 10 } as any
    expect(classifyCondition(beam)).toBe('darkness')
  })
})

// ─── analyzeSunbeam ───────────────────────────────────────

describe('analyzeSunbeam', () => {
  it('returns golden-masterpiece condition for RICH', () => {
    const beam = analyzeSunbeam(RICH, 'rich.ts')
    expect(beam.condition).toBe('golden-masterpiece')
  })

  it('returns 95 qualityScore for RICH', () => {
    const beam = analyzeSunbeam(RICH, 'rich.ts')
    expect(beam.qualityScore).toBe(95)
  })

  it('returns correct file path', () => {
    const beam = analyzeSunbeam(RICH, 'path/to/file.ts')
    expect(beam.file).toBe('path/to/file.ts')
  })

  it('returns cloudy-adequate condition for EMPTY', () => {
    const beam = analyzeSunbeam(EMPTY, 'empty.ts')
    expect(beam.condition).toBe('cloudy-adequate')
  })

  it('returns 43 qualityScore for EMPTY', () => {
    const beam = analyzeSunbeam(EMPTY, 'empty.ts')
    expect(beam.qualityScore).toBe(43)
  })

  it('returns warm-professional for MEDIUM', () => {
    const beam = analyzeSunbeam(MEDIUM, 'medium.ts')
    expect(beam.condition).toBe('warm-professional')
  })

  it('returns 55 qualityScore for MEDIUM', () => {
    const beam = analyzeSunbeam(MEDIUM, 'medium.ts')
    expect(beam.qualityScore).toBe(55)
  })

  it('computes qualityScore from weighted measures', () => {
    const beam = analyzeSunbeam(RICH, 'rich.ts')
    const expected = Math.round(100 * 0.15 + 100 * 0.15 + 79 * 0.15 + 100 * 0.2 + 90 * 0.15 + 100 * 0.2)
    expect(beam.qualityScore).toBe(expected)
  })
})

// ─── classifyHorizonType ──────────────────────────────────

describe('classifyHorizonType', () => {
  it('returns void for empty beams', () => {
    expect(classifyHorizonType([])).toBe('void')
  })

  it('returns golden-horizon for avg >= 75 and 30%+ golden-masterpiece', () => {
    const beams = [
      { qualityScore: 80, condition: 'golden-masterpiece' },
      { qualityScore: 70, condition: 'golden-masterpiece' },
    ] as any[]
    expect(classifyHorizonType(beams)).toBe('golden-horizon')
  })

  it('returns sunlit-landscape for avg >= 60', () => {
    const beams = [{ qualityScore: 65, condition: 'sunlit-excellence' }] as any[]
    expect(classifyHorizonType(beams)).toBe('sunlit-landscape')
  })

  it('returns morning-meadow for avg >= 45', () => {
    const beams = [{ qualityScore: 50, condition: 'warm-professional' }] as any[]
    expect(classifyHorizonType(beams)).toBe('morning-meadow')
  })

  it('returns foggy-valley for avg >= 30', () => {
    const beams = [{ qualityScore: 35, condition: 'cloudy-adequate' }] as any[]
    expect(classifyHorizonType(beams)).toBe('foggy-valley')
  })

  it('returns shadow-valley for avg >= 15', () => {
    const beams = [{ qualityScore: 20, condition: 'dim-struggling' }] as any[]
    expect(classifyHorizonType(beams)).toBe('shadow-valley')
  })

  it('returns void for avg < 15', () => {
    const beams = [{ qualityScore: 5, condition: 'darkness' }] as any[]
    expect(classifyHorizonType(beams)).toBe('void')
  })
})

// ─── analyzeHorizon ───────────────────────────────────────

describe('analyzeHorizon', () => {
  it('returns void horizon for empty beams', () => {
    const horizon = analyzeHorizon([], '.')
    expect(horizon.horizonType).toBe('void')
    expect(horizon.condition).toBe('midnight')
    expect(horizon.beams).toEqual([])
    expect(horizon.avgWarmth).toBe(0)
  })

  it('computes avgWarmth correctly', () => {
    const beams = [analyzeSunbeam(RICH, 'r.ts'), analyzeSunbeam(MEDIUM, 'm.ts')]
    const horizon = analyzeHorizon(beams, 'src')
    expect(horizon.avgWarmth).toBe(84)
  })

  it('computes avgGrowth correctly', () => {
    const beams = [analyzeSunbeam(RICH, 'r.ts'), analyzeSunbeam(MEDIUM, 'm.ts')]
    const horizon = analyzeHorizon(beams, 'src')
    expect(horizon.avgGrowth).toBe(63)
  })

  it('computes avgGolden correctly', () => {
    const beams = [analyzeSunbeam(RICH, 'r.ts'), analyzeSunbeam(MEDIUM, 'm.ts')]
    const horizon = analyzeHorizon(beams, 'src')
    expect(horizon.avgGolden).toBe(79)
  })

  it('counts golden beams correctly', () => {
    const beams = [analyzeSunbeam(RICH, 'r.ts'), analyzeSunbeam(MEDIUM, 'm.ts')]
    const horizon = analyzeHorizon(beams, 'src')
    expect(horizon.goldenCount).toBe(1)
  })

  it('returns correct directory', () => {
    const horizon = analyzeHorizon([analyzeSunbeam(RICH, 'r.ts')], 'my/dir')
    expect(horizon.directory).toBe('my/dir')
  })
})

// ─── classifyObserverGrade ────────────────────────────────

describe('classifyObserverGrade', () => {
  it('returns dawn-watcher for 80+', () => {
    expect(classifyObserverGrade(80)).toBe('dawn-watcher')
  })

  it('returns sunrise-photographer for 65+', () => {
    expect(classifyObserverGrade(65)).toBe('sunrise-photographer')
  })

  it('returns light-seeker for 50+', () => {
    expect(classifyObserverGrade(50)).toBe('light-seeker')
  })

  it('returns observer for 35+', () => {
    expect(classifyObserverGrade(35)).toBe('observer')
  })

  it('returns sleepyhead for 20+', () => {
    expect(classifyObserverGrade(20)).toBe('sleepyhead')
  })

  it('returns vampire for < 20', () => {
    expect(classifyObserverGrade(10)).toBe('vampire')
  })
})

// ─── generateRecommendations ──────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for high-quality code', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.recommendations).toEqual([])
  })

  it('recommends dawn warmth when avgDawnWarmth < 50', () => {
    const result = buildAmberSunriseResult(['e.ts'], [EMPTY])
    const hasRec = result.recommendations.some((r) => r.includes('dawn warmth'))
    expect(hasRec).toBe(true)
  })

  it('recommends radiance when avgRadiance < 50', () => {
    const result = buildAmberSunriseResult(['e.ts'], [EMPTY])
    const hasRec = result.recommendations.some((r) => r.includes('radiance'))
    expect(hasRec).toBe(true)
  })

  it('recommends transformation when avgTransformationPower < 50', () => {
    const result = buildAmberSunriseResult(['e.ts'], [EMPTY])
    const hasRec = result.recommendations.some((r) => r.includes('transformation'))
    expect(hasRec).toBe(true)
  })

  it('recommends growth potential when avgGrowthPotential < 50', () => {
    const result = buildAmberSunriseResult(['e.ts'], [EMPTY])
    const hasRec = result.recommendations.some((r) => r.includes('growth potential'))
    expect(hasRec).toBe(true)
  })
})

// ─── buildAmberSunriseResult ──────────────────────────────

describe('buildAmberSunriseResult', () => {
  it('returns correct totalFiles', () => {
    const result = buildAmberSunriseResult(['a.ts', 'b.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
  })

  it('computes overallRadiance correctly for rich+medium', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.overallRadiance).toBe(75)
  })

  it('returns sunrise-photographer grade for rich+medium', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.observerGrade).toBe('sunrise-photographer')
  })

  it('returns isGolden true for rich+medium (overallRadiance 75 >= 60)', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.sky.isGolden).toBe(true)
  })

  it('computes sky.avgWarmth correctly', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.sky.avgWarmth).toBe(84)
  })

  it('computes sky.avgGrowth correctly', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.sky.avgGrowth).toBe(63)
  })

  it('computes sky.avgGolden correctly', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.sky.avgGolden).toBe(79)
  })

  it('counts condition buckets correctly', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.goldenMasterpieceCount).toBe(1)
    expect(result.stats.warmProfessionalCount).toBe(1)
  })

  it('sets bestBeam to highest qualityScore file', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.bestBeam).toBe('r.ts')
  })

  it('sets warmest to highest dawnWarmth file', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.warmest).toBe('r.ts')
  })

  it('creates one horizon for same-directory files', () => {
    const result = buildAmberSunriseResult(['src/a.ts', 'src/b.ts'], [RICH, MEDIUM])
    expect(result.horizons.length).toBe(1)
  })

  it('creates two horizons for different-directory files', () => {
    const result = buildAmberSunriseResult(['dir1/a.ts', 'dir2/b.ts'], [RICH, MEDIUM])
    expect(result.horizons.length).toBe(2)
  })

  it('computes 3-file averages correctly', () => {
    const result = buildAmberSunriseResult(['src/r.ts', 'src/m.ts', 'src/e.ts'], [RICH, MEDIUM, EMPTY])
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.overallRadiance).toBe(64)
    expect(result.stats.observerGrade).toBe('light-seeker')
  })

  it('counts high-level flags correctly', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighWarmthCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
    expect(result.stats.hasHighPowerCount).toBe(1)
  })

  it('handles single file', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.goldenMasterpieceCount).toBe(1)
    expect(result.sky.overallRadiance).toBe(95)
  })
})

// ─── formatAmberSunriseJson ───────────────────────────────

describe('formatAmberSunriseJson', () => {
  it('returns valid JSON string', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const json = formatAmberSunriseJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes stats in JSON output', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const parsed = JSON.parse(formatAmberSunriseJson(result))
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── formatAmberSunriseTable ──────────────────────────────

describe('formatAmberSunriseTable', () => {
  it('includes Amber Sunrise Analysis header', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const table = formatAmberSunriseTable(result, false)
    expect(table).toContain('Amber Sunrise Analysis')
  })

  it('includes Overall Radiance in output', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const table = formatAmberSunriseTable(result, false)
    expect(table).toContain('Overall Radiance')
  })

  it('includes Observer Grade in output', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const table = formatAmberSunriseTable(result, false)
    expect(table).toContain('Observer Grade')
  })

  it('includes per-file details in verbose mode', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const table = formatAmberSunriseTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('r.ts')
  })

  it('omits per-file details in non-verbose mode', () => {
    const result = buildAmberSunriseResult(['r.ts'], [RICH])
    const table = formatAmberSunriseTable(result, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('shows recommendations when present', () => {
    const result = buildAmberSunriseResult(['e.ts'], [EMPTY])
    const table = formatAmberSunriseTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('hides recommendations when none present', () => {
    const result = buildAmberSunriseResult(['r.ts', 'm.ts'], [RICH, MEDIUM])
    const table = formatAmberSunriseTable(result, false)
    expect(table).not.toContain('Recommendations')
  })
})

// ─── Color Formatters ────────────────────────────────────

describe('color formatters', () => {
  it('scoreColor returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('conditionColor returns string for golden-masterpiece', () => {
    expect(typeof conditionColor('golden-masterpiece')).toBe('string')
  })

  it('dawnColor returns string for amber-gold', () => {
    expect(typeof dawnColor('amber-gold')).toBe('string')
  })

  it('awakeningColor returns string for graceful-awakening', () => {
    expect(typeof awakeningColor('graceful-awakening')).toBe('string')
  })

  it('growthColor returns string for exponential', () => {
    expect(typeof growthColor('exponential')).toBe('string')
  })

  it('radiantColor returns string for blinding-brilliance', () => {
    expect(typeof radiantColor('blinding-brilliance')).toBe('string')
  })

  it('transformColor returns string for metamorphic', () => {
    expect(typeof transformColor('metamorphic')).toBe('string')
  })

  it('goldenColor returns string for golden-hour', () => {
    expect(typeof goldenColor('golden-hour')).toBe('string')
  })

  it('observerColor returns string for dawn-watcher', () => {
    expect(typeof observerColor('dawn-watcher')).toBe('string')
  })

  it('horizonTypeColor returns string for golden-horizon', () => {
    expect(typeof horizonTypeColor('golden-horizon')).toBe('string')
  })

  it('horizonConditionColor returns string for dawn-of-excellence', () => {
    expect(typeof horizonConditionColor('dawn-of-excellence')).toBe('string')
  })

  it('scoreColor handles all ranges', () => {
    expect(typeof scoreColor(85)).toBe('string')
    expect(typeof scoreColor(65)).toBe('string')
    expect(typeof scoreColor(45)).toBe('string')
    expect(typeof scoreColor(25)).toBe('string')
  })

  it('conditionColor handles unknown condition', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('dawnColor handles unknown color', () => {
    expect(dawnColor('unknown')).toBe('unknown')
  })
})
