import { describe, expect, it } from 'vitest'

import {
  analyzeOpalChorus,
  analyzeOpalMurmur,
  buildOpalWhisperResult,
  classifyChorusCondition,
  classifyChorusType,
  classifyGemologistGrade,
  classifyOpalCondition,
  generateRecommendations,
  measureDiffracting,
  measureEnduring,
  measureRefracting,
  measureResonating,
  measureUnderstanding,
} from '../src/commands/opal-whisper-helpers.js'
import type { OpalWhisperResult } from '../src/commands/opal-whisper-helpers.js'
import {
  colorChorusCondition,
  colorChorusType,
  colorGemologistGrade,
  colorOpalCondition,
  colorScore,
  formatChorusesTable,
  formatChorusTable,
  formatMurmurTable,
  formatMurmursTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/opal-whisper-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''
const minimalContent = 'const x = 1'

const richPlay = measureDiffracting(richContent).play
const richClr = measureResonating(richContent).clarity
const richPrec = measureRefracting(richContent).precision
const richRes = measureEnduring(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<OpalWhisperResult['stats']> = {}): OpalWhisperResult['stats'] {
  return {
    totalFiles: 1,
    totalChoruses: 1,
    avgSpectralPlay: 50,
    avgHarmonicClarity: 50,
    avgPrismPrecision: 50,
    avgAuroraResilience: 50,
    avgOpalescenceWisdom: 50,
    opalMasterpieceCount: 0,
    preciousFireCount: 0,
    properOpalCount: 0,
    commonStoneCount: 0,
    potchRockCount: 0,
    voidCount: 0,
    hasHighPlayCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallBrilliance: 50,
    gemologistGrade: 'proper-gemologist',
    bestMurmur: 'a.ts',
    mostColorful: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureDiffracting ──────────────────────────────────

describe('measureDiffracting', () => {
  it('scores rich content highly', () => {
    const result = measureDiffracting(richContent)
    expect(result.play).toBeGreaterThan(60)
    expect(result.hasHighPlay).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDiffracting(emptyContent).play).toBeLessThan(richPlay)
  })

  it('detects hasVersatile (class/interface/type)', () => {
    expect(measureDiffracting(richContent).hasVersatile).toBe(true)
  })

  it('counts rigid keywords', () => {
    const content = 'const rigid = 1; const inflexible = 2; const static = 3; const fixed = 4; const hardcoded = 5'
    const result = measureDiffracting(content)
    expect(result.rigidCount).toBe(5)
    expect(result.hasNoRigid).toBe(false)
  })

  it('counts monolithic keywords', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3'
    const result = measureDiffracting(content)
    expect(result.monolithicCount).toBe(3)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects hasRich (JSDoc)', () => {
    expect(measureDiffracting(richContent).hasRich).toBe(true)
  })

  it('detects hasVaried (async/await/Promise)', () => {
    expect(measureDiffracting(richContent).hasVaried).toBe(true)
  })

  it('classifies spectrum correctly for high scores', () => {
    const result = measureDiffracting(richContent)
    expect(['kaleidoscope', 'black-opal', 'proper-play']).toContain(result.spectrum)
  })

  it('classifies spectrum correctly for low scores', () => {
    expect(measureDiffracting(emptyContent).spectrum).not.toBe('kaleidoscope')
  })
})

// ─── measureResonating ───────────────────────────────────

describe('measureResonating', () => {
  it('scores rich content highly', () => {
    const result = measureResonating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureResonating(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureResonating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureResonating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureResonating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (JSDoc)', () => {
    expect(measureResonating(richContent).hasTransparent).toBe(true)
  })

  it('classifies harmony correctly for high scores', () => {
    const result = measureResonating(richContent)
    expect(['symphonic-clarity', 'harmonic-balance', 'proper-tone']).toContain(result.harmony)
  })

  it('classifies harmony correctly for low scores', () => {
    expect(measureResonating(emptyContent).harmony).not.toBe('symphonic-clarity')
  })
})

// ─── measureRefracting ───────────────────────────────────

describe('measureRefracting', () => {
  it('scores rich content highly', () => {
    const result = measureRefracting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRefracting(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureRefracting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureRefracting(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureRefracting(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasSharp (readonly/private/protected)', () => {
    expect(measureRefracting(richContent).hasSharp).toBe(true)
  })

  it('classifies angle correctly for high scores', () => {
    const result = measureRefracting(richContent)
    expect(['perfect-diffraction', 'sharp-refraction', 'proper-angle']).toContain(result.angle)
  })

  it('classifies angle correctly for low scores', () => {
    expect(measureRefracting(emptyContent).angle).not.toBe('perfect-diffraction')
  })
})

// ─── measureEnduring ─────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureEnduring(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureEnduring(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureEnduring(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasTested (try/catch)', () => {
    expect(measureEnduring(richContent).hasTested).toBe(true)
  })

  it('classifies aurora correctly for high scores', () => {
    const result = measureEnduring(richContent)
    expect(['eternal-lights', 'dancing-curtain', 'proper-glow']).toContain(result.aurora)
  })

  it('classifies aurora correctly for low scores', () => {
    expect(measureEnduring(emptyContent).aurora).not.toBe('eternal-lights')
  })
})

// ─── measureUnderstanding ────────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureUnderstanding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureUnderstanding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('classifies insight correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['light-master', 'optical-sage', 'proper-physicist']).toContain(result.insight)
  })

  it('classifies insight correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).insight).not.toBe('light-master')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyOpalCondition', () => {
  it('returns opal-masterpiece for 90+', () => {
    expect(classifyOpalCondition(90)).toBe('opal-masterpiece')
    expect(classifyOpalCondition(95)).toBe('opal-masterpiece')
  })

  it('returns precious-fire for 75-89', () => {
    expect(classifyOpalCondition(75)).toBe('precious-fire')
  })

  it('returns proper-opal for 60-74', () => {
    expect(classifyOpalCondition(60)).toBe('proper-opal')
  })

  it('returns common-stone for 40-59', () => {
    expect(classifyOpalCondition(40)).toBe('common-stone')
  })

  it('returns potch-rock for 20-39', () => {
    expect(classifyOpalCondition(20)).toBe('potch-rock')
  })

  it('returns void below 20', () => {
    expect(classifyOpalCondition(0)).toBe('void')
    expect(classifyOpalCondition(10)).toBe('void')
  })
})

describe('classifyChorusType', () => {
  it('returns no-chorus for empty murmurs', () => {
    expect(classifyChorusType([])).toBe('no-chorus')
  })

  it('returns rainbow-choir for avg >= 85', () => {
    const murmurs = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyChorusType(murmurs)).toBe('rainbow-choir')
  })

  it('returns silence for low avg', () => {
    const murmurs = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyChorusType(murmurs)).toBe('silence')
  })
})

describe('classifyChorusCondition', () => {
  it('returns opal-palace for 85+', () => {
    expect(classifyChorusCondition(85)).toBe('opal-palace')
  })

  it('returns void below 15', () => {
    expect(classifyChorusCondition(5)).toBe('void')
  })
})

describe('classifyGemologistGrade', () => {
  it('returns opal-master for 80+', () => {
    expect(classifyGemologistGrade(80)).toBe('opal-master')
  })

  it('returns rock-polisher below 20', () => {
    expect(classifyGemologistGrade(5)).toBe('rock-polisher')
  })

  it('returns precious-appraiser for 65-79', () => {
    expect(classifyGemologistGrade(65)).toBe('precious-appraiser')
  })

  it('returns proper-gemologist for 50-64', () => {
    expect(classifyGemologistGrade(50)).toBe('proper-gemologist')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGemologistGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGemologistGrade(20)).toBe('novice')
  })
})

// ─── analyzeOpalMurmur ──────────────────────────────────

describe('analyzeOpalMurmur', () => {
  it('creates a murmur with all 5 measures', () => {
    const murmur = analyzeOpalMurmur(richContent, 'app.ts')
    expect(murmur.file).toBe('app.ts')
    expect(typeof murmur.spectralPlay).toBe('number')
    expect(typeof murmur.harmonicClarity).toBe('number')
    expect(typeof murmur.prismPrecision).toBe('number')
    expect(typeof murmur.auroraResilience).toBe('number')
    expect(typeof murmur.opalescenceWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const murmur = analyzeOpalMurmur(richContent, 'app.ts')
    const expected = Math.round(
      murmur.spectralPlay * 0.2 +
      murmur.harmonicClarity * 0.2 +
      murmur.prismPrecision * 0.2 +
      murmur.auroraResilience * 0.2 +
      murmur.opalescenceWisdom * 0.2,
    )
    expect(murmur.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const murmur = analyzeOpalMurmur(richContent, 'app.ts')
    expect(murmur.condition).toBe(classifyOpalCondition(murmur.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richMurmur = analyzeOpalMurmur(richContent, 'rich.ts')
    const emptyMurmur = analyzeOpalMurmur(emptyContent, 'empty.ts')
    expect(richMurmur.qualityScore).toBeGreaterThan(emptyMurmur.qualityScore)
  })
})

// ─── analyzeOpalChorus ──────────────────────────────────

describe('analyzeOpalChorus', () => {
  it('returns empty chorus for no murmurs', () => {
    const chorus = analyzeOpalChorus([], 'src')
    expect(chorus.directory).toBe('src')
    expect(chorus.murmurs).toEqual([])
    expect(chorus.chorusType).toBe('no-chorus')
    expect(chorus.condition).toBe('void')
  })

  it('computes averages from murmurs', () => {
    const murmurs = [analyzeOpalMurmur(richContent, 'a.ts'), analyzeOpalMurmur(richContent, 'b.ts')]
    const chorus = analyzeOpalChorus(murmurs, 'src')
    expect(chorus.avgPlay).toBeGreaterThan(0)
    expect(chorus.avgPrecision).toBeGreaterThan(0)
    expect(chorus.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildOpalWhisperResult ─────────────────────────────

describe('buildOpalWhisperResult', () => {
  it('returns full result structure', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    expect(result.murmurs).toHaveLength(1)
    expect(result.choruses).toHaveLength(1)
    expect(result.spectrum).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into choruses', async () => {
    const result = await buildOpalWhisperResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.choruses.length).toBe(2)
  })

  it('computes spectrum overview', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    expect(result.spectrum.avgPlay).toBeGreaterThan(0)
    expect(result.spectrum.isOpal).toBe(true)
    expect(result.spectrum.overallBrilliance).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildOpalWhisperResult([], [])
    expect(result.murmurs).toHaveLength(0)
    expect(result.choruses).toHaveLength(0)
    expect(result.spectrum.overallBrilliance).toBe(0)
    expect(result.spectrum.isOpal).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    const total = result.stats.opalMasterpieceCount +
      result.stats.preciousFireCount +
      result.stats.properOpalCount +
      result.stats.commonStoneCount +
      result.stats.potchRockCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPlayCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best murmur and top performers', async () => {
    const result = await buildOpalWhisperResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestMurmur).toBeTruthy()
    expect(result.stats.mostColorful).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes gemologist grade from overall brilliance', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    expect(result.stats.gemologistGrade).toBe(classifyGemologistGrade(result.stats.overallBrilliance))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgSpectralPlay: 90,
      avgHarmonicClarity: 90,
      avgPrismPrecision: 90,
      avgAuroraResilience: 90,
      avgOpalescenceWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgPlay: 90, avgPrecision: 90, avgWisdom: 90, isOpal: true, overallBrilliance: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('kaleidoscope masterpiece')
  })

  it('recommends play when < 60', () => {
    const stats = makeStats({ avgSpectralPlay: 50 })
    const result = generateRecommendations([], [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('spectral play') || r.includes('kaleidoscope'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgHarmonicClarity: 50 })
    const result = generateRecommendations([], [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('harmonic clarity') || r.includes('symphonic'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgPrismPrecision: 50 })
    const result = generateRecommendations([], [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('prism precision') || r.includes('diffraction'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgAuroraResilience: 50 })
    const result = generateRecommendations([], [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('aurora resilience') || r.includes('eternal-lights'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgOpalescenceWisdom: 50 })
    const result = generateRecommendations([], [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('opalescence wisdom') || r.includes('light-master'))).toBe(true)
  })

  it('warns about barely audible when brilliance < 40', () => {
    const stats = makeStats({ overallBrilliance: 30 })
    const result = generateRecommendations([], [], { avgPlay: 30, avgPrecision: 30, avgWisdom: 30, isOpal: false, overallBrilliance: 30 }, stats)
    expect(result.some((r) => r.includes('barely audible'))).toBe(true)
  })

  it('lists void murmurs by name when <= 5', () => {
    const murmurs = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(murmurs, [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void murmurs when > 5', () => {
    const murmurs = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(murmurs, [], { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('6 potch rocks'))).toBe(true)
  })

  it('warns when all choruses are poor', () => {
    const choruses = [{ condition: 'empty-case' as const, chorusType: 'silence' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], choruses as Array<{ condition: string; chorusType: string }>, { avgPlay: 50, avgPrecision: 50, avgWisdom: 50, isOpal: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('silent'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgSpectralPlay: 70,
      avgHarmonicClarity: 70,
      avgPrismPrecision: 70,
      avgAuroraResilience: 70,
      avgOpalescenceWisdom: 70,
      overallBrilliance: 70,
    })
    const result = generateRecommendations([], [], { avgPlay: 70, avgPrecision: 70, avgWisdom: 70, isOpal: true, overallBrilliance: 70 }, stats)
    expect(result.some((r) => r.includes('spectral brilliance'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorOpalCondition', () => {
  it('colors opal-masterpiece', () => {
    expect(typeof colorOpalCondition('opal-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorOpalCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorOpalCondition('unknown')).toBe('string')
  })
})

describe('colorChorusType', () => {
  it('colors rainbow-choir', () => {
    expect(typeof colorChorusType('rainbow-choir')).toBe('string')
  })

  it('colors no-chorus', () => {
    expect(typeof colorChorusType('no-chorus')).toBe('string')
  })
})

describe('colorChorusCondition', () => {
  it('colors opal-palace', () => {
    expect(typeof colorChorusCondition('opal-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorChorusCondition('void')).toBe('string')
  })
})

describe('colorGemologistGrade', () => {
  it('colors opal-master', () => {
    expect(typeof colorGemologistGrade('opal-master')).toBe('string')
  })

  it('colors rock-polisher', () => {
    expect(typeof colorGemologistGrade('rock-polisher')).toBe('string')
  })
})

describe('formatMurmurTable', () => {
  it('formats a murmur with all measures', () => {
    const murmur = analyzeOpalMurmur(richContent, 'app.ts')
    const output = formatMurmurTable(murmur)
    expect(output).toContain('Opal Murmur: app.ts')
    expect(output).toContain('Spectral Play')
    expect(output).toContain('Harmonic Clarity')
    expect(output).toContain('Prism Precision')
    expect(output).toContain('Aurora Resilience')
    expect(output).toContain('Opalescence Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatMurmursTable', () => {
  it('shows no murmurs message for empty array', () => {
    expect(formatMurmursTable([])).toContain('No opal murmurs')
  })

  it('lists murmurs in output', () => {
    const murmurs = [analyzeOpalMurmur(richContent, 'a.ts')]
    expect(formatMurmursTable(murmurs)).toContain('a.ts')
  })
})

describe('formatChorusTable', () => {
  it('formats a chorus with all fields', () => {
    const murmurs = [analyzeOpalMurmur(richContent, 'a.ts')]
    const chorus = analyzeOpalChorus(murmurs, 'src')
    const output = formatChorusTable(chorus)
    expect(output).toContain('Opal Chorus: src')
    expect(output).toContain('Murmurs')
    expect(output).toContain('Avg Play')
  })
})

describe('formatChorusesTable', () => {
  it('shows no choruses message for empty array', () => {
    expect(formatChorusesTable([])).toContain('No opal choruses')
  })

  it('lists choruses in output', () => {
    const murmurs = [analyzeOpalMurmur(richContent, 'a.ts')]
    const chorus = analyzeOpalChorus(murmurs, 'src')
    expect(formatChorusesTable([chorus])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Opal Whisper Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gemologist Grade')
    expect(output).toContain('Best Murmur')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Opal Whisper Analysis')
    expect(output).toContain('Spectrum Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildOpalWhisperResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.murmurs).toHaveLength(1)
    expect(parsed.spectrum).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
