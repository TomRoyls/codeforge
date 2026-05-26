import { describe, expect, it } from 'vitest'

import {
  analyzeRubyParish,
  analyzeRubyPrayer,
  buildRubyCathedralResult,
  classifyBishopGrade,
  classifyParishCondition,
  classifyParishType,
  classifyRubyCondition,
  generateRecommendations,
  measureConsecrating,
  measureDedicating,
  measureGuiding,
  measureIlluminating,
  measureSurviving,
} from '../src/commands/ruby-cathedral-helpers.js'
import type { RubyCathedralResult } from '../src/commands/ruby-cathedral-helpers.js'
import {
  colorBishopGrade,
  colorParishCondition,
  colorParishType,
  colorRubyCondition,
  colorScore,
  formatParishesTable,
  formatParishTable,
  formatPrayerTable,
  formatPrayersTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/ruby-cathedral-format-helpers.js'

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

const richDev = measureDedicating(richContent).devotion
const richPrec = measureConsecrating(richContent).precision
const richClr = measureIlluminating(richContent).clarity
const richRes = measureSurviving(richContent).resilience
const richWis = measureGuiding(richContent).wisdom

function makeStats(overrides: Partial<RubyCathedralResult['stats']> = {}): RubyCathedralResult['stats'] {
  return {
    totalFiles: 1,
    totalParishes: 1,
    avgCrimsonDevotion: 50,
    avgAltarPrecision: 50,
    avgStainedClarity: 50,
    avgBloodResilience: 50,
    avgCardinalWisdom: 50,
    rubyMasterpieceCount: 0,
    crimsonAltarCount: 0,
    properRubyCount: 0,
    pinkQuartzCount: 0,
    redGlassCount: 0,
    voidCount: 0,
    hasHighDevotionCount: 1,
    hasHighPrecisionCount: 1,
    hasHighClarityCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallSanctity: 50,
    bishopGrade: 'proper-bishop',
    bestPrayer: 'a.ts',
    mostDevoted: 'a.ts',
    mostPrecise: 'a.ts',
    clearest: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureDedicating ──────────────────────────────────

describe('measureDedicating', () => {
  it('scores rich content highly', () => {
    const result = measureDedicating(richContent)
    expect(result.devotion).toBeGreaterThan(60)
    expect(result.hasHighDevotion).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDedicating(emptyContent).devotion).toBeLessThan(richDev)
  })

  it('detects hasAlive (class/interface/type)', () => {
    expect(measureDedicating(richContent).hasAlive).toBe(true)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const lifeless = 2; const dormant = 3; const inert = 4; const stagnant = 5'
    const result = measureDedicating(content)
    expect(result.deadCount).toBe(5)
    expect(result.hasNoDead).toBe(false)
  })

  it('counts apathetic keywords', () => {
    const content = 'const apathetic = 1; const indifferent = 2; const uncaring = 3; const listless = 4; const lukewarm = 5'
    const result = measureDedicating(content)
    expect(result.apatheticCount).toBe(5)
    expect(result.hasNoApathetic).toBe(false)
  })

  it('detects hasDynamic (async/await/Promise)', () => {
    expect(measureDedicating(richContent).hasDynamic).toBe(true)
  })

  it('detects hasZealous (JSDoc)', () => {
    expect(measureDedicating(richContent).hasZealous).toBe(true)
  })

  it('classifies faith correctly for high scores', () => {
    const result = measureDedicating(richContent)
    expect(['unwavering-faith', 'deep-devotion', 'proper-commitment']).toContain(result.faith)
  })

  it('classifies faith correctly for low scores', () => {
    expect(measureDedicating(emptyContent).faith).not.toBe('unwavering-faith')
  })
})

// ─── measureConsecrating ────────────────────────────────

describe('measureConsecrating', () => {
  it('scores rich content highly', () => {
    const result = measureConsecrating(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureConsecrating(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureConsecrating(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureConsecrating(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureConsecrating(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureConsecrating(richContent).hasCrisp).toBe(true)
  })

  it('classifies altar correctly for high scores', () => {
    const result = measureConsecrating(richContent)
    expect(['golden-altar', 'silver-shrine', 'proper-altar']).toContain(result.altar)
  })

  it('classifies altar correctly for low scores', () => {
    expect(measureConsecrating(emptyContent).altar).not.toBe('golden-altar')
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureIlluminating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('classifies window correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['rose-window', 'stained-glass', 'proper-light']).toContain(result.window)
  })

  it('classifies window correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).window).not.toBe('rose-window')
  })
})

// ─── measureSurviving ───────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSurviving(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureSurviving(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureSurviving(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureSurviving(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureSurviving(richContent).hasRobust).toBe(true)
  })

  it('classifies shield correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['martyr-strength', 'warrior-resilience', 'proper-fortitude']).toContain(result.shield)
  })

  it('classifies shield correctly for low scores', () => {
    expect(measureSurviving(emptyContent).shield).not.toBe('martyr-strength')
  })
})

// ─── measureGuiding ─────────────────────────────────────

describe('measureGuiding', () => {
  it('scores rich content highly', () => {
    const result = measureGuiding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGuiding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureGuiding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureGuiding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureGuiding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureGuiding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureGuiding(richContent).hasInsightful).toBe(true)
  })

  it('classifies rank correctly for high scores', () => {
    const result = measureGuiding(richContent)
    expect(['cardinal-wisdom', 'bishop-insight', 'proper-counsel']).toContain(result.rank)
  })

  it('classifies rank correctly for low scores', () => {
    expect(measureGuiding(emptyContent).rank).not.toBe('cardinal-wisdom')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyRubyCondition', () => {
  it('returns ruby-masterpiece for 90+', () => {
    expect(classifyRubyCondition(90)).toBe('ruby-masterpiece')
    expect(classifyRubyCondition(95)).toBe('ruby-masterpiece')
  })

  it('returns crimson-altar for 75-89', () => {
    expect(classifyRubyCondition(75)).toBe('crimson-altar')
  })

  it('returns proper-ruby for 60-74', () => {
    expect(classifyRubyCondition(60)).toBe('proper-ruby')
  })

  it('returns pink-quartz for 40-59', () => {
    expect(classifyRubyCondition(40)).toBe('pink-quartz')
  })

  it('returns red-glass for 20-39', () => {
    expect(classifyRubyCondition(20)).toBe('red-glass')
  })

  it('returns void below 20', () => {
    expect(classifyRubyCondition(0)).toBe('void')
    expect(classifyRubyCondition(10)).toBe('void')
  })
})

describe('classifyParishType', () => {
  it('returns no-parish for empty prayers', () => {
    expect(classifyParishType([])).toBe('no-parish')
  })

  it('returns cardinal-parish for avg >= 85', () => {
    const prayers = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyParishType(prayers)).toBe('cardinal-parish')
  })

  it('returns empty-aisle for low avg', () => {
    const prayers = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyParishType(prayers)).toBe('empty-aisle')
  })
})

describe('classifyParishCondition', () => {
  it('returns ruby-cathedral for 85+', () => {
    expect(classifyParishCondition(85)).toBe('ruby-cathedral')
  })

  it('returns void below 15', () => {
    expect(classifyParishCondition(5)).toBe('void')
  })
})

describe('classifyBishopGrade', () => {
  it('returns archbishop for 80+', () => {
    expect(classifyBishopGrade(80)).toBe('archbishop')
  })

  it('returns acolyte below 20', () => {
    expect(classifyBishopGrade(5)).toBe('acolyte')
  })

  it('returns cardinal for 65-79', () => {
    expect(classifyBishopGrade(65)).toBe('cardinal')
  })

  it('returns proper-bishop for 50-64', () => {
    expect(classifyBishopGrade(50)).toBe('proper-bishop')
  })

  it('returns priest for 35-49', () => {
    expect(classifyBishopGrade(35)).toBe('priest')
  })

  it('returns deacon for 20-34', () => {
    expect(classifyBishopGrade(20)).toBe('deacon')
  })
})

// ─── analyzeRubyPrayer ──────────────────────────────────

describe('analyzeRubyPrayer', () => {
  it('creates a prayer with all 5 measures', () => {
    const prayer = analyzeRubyPrayer(richContent, 'app.ts')
    expect(prayer.file).toBe('app.ts')
    expect(typeof prayer.crimsonDevotion).toBe('number')
    expect(typeof prayer.altarPrecision).toBe('number')
    expect(typeof prayer.stainedClarity).toBe('number')
    expect(typeof prayer.bloodResilience).toBe('number')
    expect(typeof prayer.cardinalWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const prayer = analyzeRubyPrayer(richContent, 'app.ts')
    const expected = Math.round(
      prayer.crimsonDevotion * 0.2 +
      prayer.altarPrecision * 0.2 +
      prayer.stainedClarity * 0.2 +
      prayer.bloodResilience * 0.2 +
      prayer.cardinalWisdom * 0.2,
    )
    expect(prayer.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const prayer = analyzeRubyPrayer(richContent, 'app.ts')
    expect(prayer.condition).toBe(classifyRubyCondition(prayer.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richPrayer = analyzeRubyPrayer(richContent, 'rich.ts')
    const emptyPrayer = analyzeRubyPrayer(emptyContent, 'empty.ts')
    expect(richPrayer.qualityScore).toBeGreaterThan(emptyPrayer.qualityScore)
  })
})

// ─── analyzeRubyParish ──────────────────────────────────

describe('analyzeRubyParish', () => {
  it('returns empty parish for no prayers', () => {
    const parish = analyzeRubyParish([], 'src')
    expect(parish.directory).toBe('src')
    expect(parish.prayers).toEqual([])
    expect(parish.parishType).toBe('no-parish')
    expect(parish.condition).toBe('void')
  })

  it('computes averages from prayers', () => {
    const prayers = [analyzeRubyPrayer(richContent, 'a.ts'), analyzeRubyPrayer(richContent, 'b.ts')]
    const parish = analyzeRubyParish(prayers, 'src')
    expect(parish.avgDevotion).toBeGreaterThan(0)
    expect(parish.avgPrecision).toBeGreaterThan(0)
    expect(parish.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildRubyCathedralResult ───────────────────────────

describe('buildRubyCathedralResult', () => {
  it('returns full result structure', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    expect(result.prayers).toHaveLength(1)
    expect(result.parishes).toHaveLength(1)
    expect(result.diocese).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into parishes', async () => {
    const result = await buildRubyCathedralResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.parishes.length).toBe(2)
  })

  it('computes diocese overview', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    expect(result.diocese.avgDevotion).toBeGreaterThan(0)
    expect(result.diocese.isRuby).toBe(true)
    expect(result.diocese.overallSanctity).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildRubyCathedralResult([], [])
    expect(result.prayers).toHaveLength(0)
    expect(result.parishes).toHaveLength(0)
    expect(result.diocese.overallSanctity).toBe(0)
    expect(result.diocese.isRuby).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    const total = result.stats.rubyMasterpieceCount +
      result.stats.crimsonAltarCount +
      result.stats.properRubyCount +
      result.stats.pinkQuartzCount +
      result.stats.redGlassCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    expect(result.stats.hasHighDevotionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best prayer and top performers', async () => {
    const result = await buildRubyCathedralResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPrayer).toBeTruthy()
    expect(result.stats.mostDevoted).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes bishop grade from overall sanctity', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    expect(result.stats.bishopGrade).toBe(classifyBishopGrade(result.stats.overallSanctity))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgCrimsonDevotion: 90,
      avgAltarPrecision: 90,
      avgStainedClarity: 90,
      avgBloodResilience: 90,
      avgCardinalWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgDevotion: 90, avgPrecision: 90, avgWisdom: 90, isRuby: true, overallSanctity: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('crimson devotion')
  })

  it('recommends devotion when < 60', () => {
    const stats = makeStats({ avgCrimsonDevotion: 50 })
    const result = generateRecommendations([], [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('crimson devotion') || r.includes('unwavering-faith'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgAltarPrecision: 50 })
    const result = generateRecommendations([], [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('altar precision') || r.includes('golden-altar'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgStainedClarity: 50 })
    const result = generateRecommendations([], [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('stained clarity') || r.includes('rose-window'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgBloodResilience: 50 })
    const result = generateRecommendations([], [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('blood resilience') || r.includes('martyr-strength'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgCardinalWisdom: 50 })
    const result = generateRecommendations([], [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('cardinal wisdom') || r.includes('cardinal-wisdom'))).toBe(true)
  })

  it('warns about ruins when sanctity < 40', () => {
    const stats = makeStats({ overallSanctity: 30 })
    const result = generateRecommendations([], [], { avgDevotion: 30, avgPrecision: 30, avgWisdom: 30, isRuby: false, overallSanctity: 30 }, stats)
    expect(result.some((r) => r.includes('ruins'))).toBe(true)
  })

  it('lists void prayers by name when <= 5', () => {
    const prayers = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(prayers, [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void prayers when > 5', () => {
    const prayers = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(prayers, [], { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('6 red glass fragments'))).toBe(true)
  })

  it('warns when all parishes are poor', () => {
    const parishes = [{ condition: 'wooden-hut' as const, parishType: 'small-chapel' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], parishes as Array<{ condition: string; parishType: string }>, { avgDevotion: 50, avgPrecision: 50, avgWisdom: 50, isRuby: false, overallSanctity: 50 }, stats)
    expect(result.some((r) => r.includes('wooden huts'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgCrimsonDevotion: 70,
      avgAltarPrecision: 70,
      avgStainedClarity: 70,
      avgBloodResilience: 70,
      avgCardinalWisdom: 70,
      overallSanctity: 70,
    })
    const result = generateRecommendations([], [], { avgDevotion: 70, avgPrecision: 70, avgWisdom: 70, isRuby: true, overallSanctity: 70 }, stats)
    expect(result.some((r) => r.includes('crimson sanctity'))).toBe(true)
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

describe('colorRubyCondition', () => {
  it('colors ruby-masterpiece', () => {
    expect(typeof colorRubyCondition('ruby-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorRubyCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorRubyCondition('unknown')).toBe('string')
  })
})

describe('colorParishType', () => {
  it('colors cardinal-parish', () => {
    expect(typeof colorParishType('cardinal-parish')).toBe('string')
  })

  it('colors no-parish', () => {
    expect(typeof colorParishType('no-parish')).toBe('string')
  })
})

describe('colorParishCondition', () => {
  it('colors ruby-cathedral', () => {
    expect(typeof colorParishCondition('ruby-cathedral')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorParishCondition('void')).toBe('string')
  })
})

describe('colorBishopGrade', () => {
  it('colors archbishop', () => {
    expect(typeof colorBishopGrade('archbishop')).toBe('string')
  })

  it('colors acolyte', () => {
    expect(typeof colorBishopGrade('acolyte')).toBe('string')
  })
})

describe('formatPrayerTable', () => {
  it('formats a prayer with all measures', () => {
    const prayer = analyzeRubyPrayer(richContent, 'app.ts')
    const output = formatPrayerTable(prayer)
    expect(output).toContain('Ruby Prayer: app.ts')
    expect(output).toContain('Crimson Devotion')
    expect(output).toContain('Altar Precision')
    expect(output).toContain('Stained Clarity')
    expect(output).toContain('Blood Resilience')
    expect(output).toContain('Cardinal Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPrayersTable', () => {
  it('shows no prayers message for empty array', () => {
    expect(formatPrayersTable([])).toContain('No ruby prayers')
  })

  it('lists prayers in output', () => {
    const prayers = [analyzeRubyPrayer(richContent, 'a.ts')]
    expect(formatPrayersTable(prayers)).toContain('a.ts')
  })
})

describe('formatParishTable', () => {
  it('formats a parish with all fields', () => {
    const prayers = [analyzeRubyPrayer(richContent, 'a.ts')]
    const parish = analyzeRubyParish(prayers, 'src')
    const output = formatParishTable(parish)
    expect(output).toContain('Ruby Parish: src')
    expect(output).toContain('Prayers')
    expect(output).toContain('Avg Devotion')
  })
})

describe('formatParishesTable', () => {
  it('shows no parishes message for empty array', () => {
    expect(formatParishesTable([])).toContain('No ruby parishes')
  })

  it('lists parishes in output', () => {
    const prayers = [analyzeRubyPrayer(richContent, 'a.ts')]
    const parish = analyzeRubyParish(prayers, 'src')
    expect(formatParishesTable([parish])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Ruby Cathedral Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Bishop Grade')
    expect(output).toContain('Best Prayer')
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
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Ruby Cathedral Analysis')
    expect(output).toContain('Diocese Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildRubyCathedralResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.prayers).toHaveLength(1)
    expect(parsed.diocese).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
