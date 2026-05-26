import { describe, expect, it } from 'vitest'

import {
  analyzeTopazRay,
  analyzeTopazSkyline,
  buildTopazHorizonResult,
  classifyObserverGrade,
  classifySkylineCondition,
  classifySkylineType,
  classifyTopazCondition,
  generateRecommendations,
  measureFocusing,
  measureIlluminating,
  measureSpanning,
  measureTransitioning,
  measureWarming,
} from '../src/commands/topaz-horizon-helpers.js'
import type { TopazHorizonResult } from '../src/commands/topaz-horizon-helpers.js'
import {
  colorObserverGrade,
  colorScore,
  colorSkylineCondition,
  colorSkylineType,
  colorTopazCondition,
  formatRaysTable,
  formatRayTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSkylinesTable,
  formatSkylineTable,
  formatStatsTable,
} from '../src/commands/topaz-horizon-format-helpers.js'

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

const richWar = measureWarming(richContent).warmth
const richCla = measureIlluminating(richContent).clarity
const richPre = measureFocusing(richContent).precision
const richEnd = measureSpanning(richContent).endurance
const richWis = measureTransitioning(richContent).wisdom

function makeStats(overrides: Partial<TopazHorizonResult['stats']> = {}): TopazHorizonResult['stats'] {
  return {
    totalFiles: 1,
    totalSkylines: 1,
    avgGoldenWarmth: 50,
    avgSunsetClarity: 50,
    avgFirePrecision: 50,
    avgHorizonEndurance: 50,
    avgDawnWisdom: 50,
    topazMasterpieceCount: 0,
    imperialGemCount: 0,
    properTopazCount: 0,
    paleStoneCount: 0,
    roughCrystalCount: 0,
    voidCount: 0,
    hasHighWarmthCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighWisdomCount: 1,
    overallRadiance: 50,
    observerGrade: 'proper-watcher',
    bestRay: 'a.ts',
    warmest: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureWarming ─────────────────────────────────────

describe('measureWarming', () => {
  it('scores rich content highly', () => {
    const result = measureWarming(richContent)
    expect(result.warmth).toBeGreaterThan(60)
    expect(result.hasHighWarmth).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureWarming(emptyContent).warmth).toBeLessThan(richWar)
  })

  it('detects approachable (import/export)', () => {
    expect(measureWarming(richContent).hasApproachable).toBe(true)
  })

  it('counts hostile keywords', () => {
    const content = 'const hostile = 1; const aggressive = 2; const violent = 3; const harsh = 4'
    const result = measureWarming(content)
    expect(result.hostileCount).toBe(4)
    expect(result.hasNoHostile).toBe(false)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureWarming(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects welcoming (class/interface/type)', () => {
    expect(measureWarming(richContent).hasWelcoming).toBe(true)
  })

  it('detects friendly (type annotations)', () => {
    expect(measureWarming(richContent).hasFriendly).toBe(true)
  })

  it('detects error-handled (try/catch)', () => {
    expect(measureWarming(richContent).hasErrorHandled).toBe(true)
  })

  it('classifies glow correctly for high scores', () => {
    const result = measureWarming(richContent)
    expect(['imperial-topaz', 'golden-fire', 'proper-warmth']).toContain(result.glow)
  })

  it('classifies glow correctly for low scores', () => {
    expect(measureWarming(emptyContent).glow).not.toBe('imperial-topaz')
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
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
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

  it('detects readable (type annotations)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('detects self-documenting (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects transparent (no any)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['golden-hour', 'clear-twilight', 'proper-light']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).light).not.toBe('golden-hour')
  })
})

// ─── measureFocusing ────────────────────────────────────

describe('measureFocusing', () => {
  it('scores rich content highly', () => {
    const result = measureFocusing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFocusing(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type-safe (no any)', () => {
    expect(measureFocusing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureFocusing(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureFocusing(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureFocusing(richContent).hasExact).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measureFocusing(richContent).hasCrisp).toBe(true)
  })

  it('classifies beam correctly for high scores', () => {
    const result = measureFocusing(richContent)
    expect(['laser-focus', 'sharp-ray', 'proper-beam']).toContain(result.beam)
  })

  it('classifies beam correctly for low scores', () => {
    expect(measureFocusing(emptyContent).beam).not.toBe('laser-focus')
  })
})

// ─── measureSpanning ────────────────────────────────────

describe('measureSpanning', () => {
  it('scores rich content highly', () => {
    const result = measureSpanning(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSpanning(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects maintainable (class/interface/type)', () => {
    expect(measureSpanning(richContent).hasMaintainable).toBe(true)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const flimsy = 3; const delicate = 4'
    const result = measureSpanning(content)
    expect(result.fragileCount).toBe(4)
    expect(result.hasNoFragile).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureSpanning(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects tested (try/catch)', () => {
    expect(measureSpanning(richContent).hasTested).toBe(true)
  })

  it('detects durable (import/export)', () => {
    expect(measureSpanning(richContent).hasDurable).toBe(true)
  })

  it('classifies reach correctly for high scores', () => {
    const result = measureSpanning(richContent)
    expect(['infinite-horizon', 'far-reach', 'proper-span']).toContain(result.reach)
  })

  it('classifies reach correctly for low scores', () => {
    expect(measureSpanning(emptyContent).reach).not.toBe('infinite-horizon')
  })
})

// ─── measureTransitioning ───────────────────────────────

describe('measureTransitioning', () => {
  it('scores rich content highly', () => {
    const result = measureTransitioning(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTransitioning(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
    expect(measureTransitioning(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureTransitioning(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureTransitioning(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects principled (no any)', () => {
    expect(measureTransitioning(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureTransitioning(richContent).hasVisionary).toBe(true)
  })

  it('classifies twilight correctly for high scores', () => {
    const result = measureTransitioning(richContent)
    expect(['golden-sage', 'twilight-scholar', 'proper-observer']).toContain(result.twilight)
  })

  it('classifies twilight correctly for low scores', () => {
    expect(measureTransitioning(emptyContent).twilight).not.toBe('golden-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyTopazCondition', () => {
  it('returns topaz-masterpiece for 90+', () => {
    expect(classifyTopazCondition(90)).toBe('topaz-masterpiece')
    expect(classifyTopazCondition(95)).toBe('topaz-masterpiece')
  })

  it('returns imperial-gem for 75-89', () => {
    expect(classifyTopazCondition(75)).toBe('imperial-gem')
  })

  it('returns proper-topaz for 60-74', () => {
    expect(classifyTopazCondition(60)).toBe('proper-topaz')
  })

  it('returns pale-stone for 40-59', () => {
    expect(classifyTopazCondition(40)).toBe('pale-stone')
  })

  it('returns rough-crystal for 20-39', () => {
    expect(classifyTopazCondition(20)).toBe('rough-crystal')
  })

  it('returns void below 20', () => {
    expect(classifyTopazCondition(0)).toBe('void')
    expect(classifyTopazCondition(10)).toBe('void')
  })
})

describe('classifySkylineType', () => {
  it('returns no-skyline for empty rays', () => {
    expect(classifySkylineType([])).toBe('no-skyline')
  })

  it('returns golden-skyline for avg >= 85', () => {
    const rays = [{ qualityScore: 90 } as any]
    expect(classifySkylineType(rays)).toBe('golden-skyline')
  })

  it('returns empty-sky for low avg', () => {
    const rays = [{ qualityScore: 10 } as any]
    expect(classifySkylineType(rays)).toBe('empty-sky')
  })
})

describe('classifySkylineCondition', () => {
  it('returns topaz-palace for 85+', () => {
    expect(classifySkylineCondition(85)).toBe('topaz-palace')
  })

  it('returns void below 15', () => {
    expect(classifySkylineCondition(5)).toBe('void')
  })
})

describe('classifyObserverGrade', () => {
  it('returns golden-master for 80+', () => {
    expect(classifyObserverGrade(80)).toBe('golden-master')
  })

  it('returns blind-folded below 20', () => {
    expect(classifyObserverGrade(5)).toBe('blind-folded')
  })

  it('returns sunset-scholar for 65-79', () => {
    expect(classifyObserverGrade(65)).toBe('sunset-scholar')
  })

  it('returns proper-watcher for 50-64', () => {
    expect(classifyObserverGrade(50)).toBe('proper-watcher')
  })

  it('returns amateur for 35-49', () => {
    expect(classifyObserverGrade(35)).toBe('amateur')
  })

  it('returns novice for 20-34', () => {
    expect(classifyObserverGrade(20)).toBe('novice')
  })
})

// ─── analyzeTopazRay ────────────────────────────────────

describe('analyzeTopazRay', () => {
  it('creates a ray with all 5 measures', () => {
    const ray = analyzeTopazRay(richContent, 'app.ts')
    expect(ray.file).toBe('app.ts')
    expect(typeof ray.goldenWarmth).toBe('number')
    expect(typeof ray.sunsetClarity).toBe('number')
    expect(typeof ray.firePrecision).toBe('number')
    expect(typeof ray.horizonEndurance).toBe('number')
    expect(typeof ray.dawnWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const ray = analyzeTopazRay(richContent, 'app.ts')
    const expected = Math.round(
      ray.goldenWarmth * 0.2 +
      ray.sunsetClarity * 0.2 +
      ray.firePrecision * 0.2 +
      ray.horizonEndurance * 0.2 +
      ray.dawnWisdom * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const ray = analyzeTopazRay(richContent, 'app.ts')
    expect(ray.condition).toBe(classifyTopazCondition(ray.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richRay = analyzeTopazRay(richContent, 'rich.ts')
    const emptyRay = analyzeTopazRay(emptyContent, 'empty.ts')
    expect(richRay.qualityScore).toBeGreaterThan(emptyRay.qualityScore)
  })
})

// ─── analyzeTopazSkyline ────────────────────────────────

describe('analyzeTopazSkyline', () => {
  it('returns empty skyline for no rays', () => {
    const skyline = analyzeTopazSkyline([], 'src')
    expect(skyline.directory).toBe('src')
    expect(skyline.rays).toEqual([])
    expect(skyline.skylineType).toBe('no-skyline')
    expect(skyline.condition).toBe('void')
  })

  it('computes averages from rays', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts'), analyzeTopazRay(richContent, 'b.ts')]
    const skyline = analyzeTopazSkyline(rays, 'src')
    expect(skyline.avgWarmth).toBeGreaterThan(0)
    expect(skyline.avgPrecision).toBeGreaterThan(0)
    expect(skyline.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildTopazHorizonResult ────────────────────────────

describe('buildTopazHorizonResult', () => {
  it('returns full result structure', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.skylines).toHaveLength(1)
    expect(result.sunset).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into skylines', async () => {
    const result = await buildTopazHorizonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.skylines.length).toBe(2)
  })

  it('computes sunset overview', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    expect(result.sunset.avgWarmth).toBeGreaterThan(0)
    expect(result.sunset.isTopaz).toBe(true)
    expect(result.sunset.overallRadiance).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildTopazHorizonResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.skylines).toHaveLength(0)
    expect(result.sunset.overallRadiance).toBe(0)
    expect(result.sunset.isTopaz).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    const total = result.stats.topazMasterpieceCount +
      result.stats.imperialGemCount +
      result.stats.properTopazCount +
      result.stats.paleStoneCount +
      result.stats.roughCrystalCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    expect(result.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best ray and top performers', async () => {
    const result = await buildTopazHorizonResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestRay).toBeTruthy()
    expect(result.stats.warmest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes observer grade from overall radiance', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    expect(result.stats.observerGrade).toBe(classifyObserverGrade(result.stats.overallRadiance))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgGoldenWarmth: 90,
      avgSunsetClarity: 90,
      avgFirePrecision: 90,
      avgHorizonEndurance: 90,
      avgDawnWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgWarmth: 90, avgPrecision: 90, avgWisdom: 90, isTopaz: true, overallRadiance: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('imperial radiance')
  })

  it('recommends warmth when < 60', () => {
    const stats = makeStats({ avgGoldenWarmth: 50 })
    const result = generateRecommendations([], [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('warmth') || r.includes('golden'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgSunsetClarity: 50 })
    const result = generateRecommendations([], [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('sunset'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgFirePrecision: 50 })
    const result = generateRecommendations([], [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('focus'))).toBe(true)
  })

  it('recommends endurance when < 60', () => {
    const stats = makeStats({ avgHorizonEndurance: 50 })
    const result = generateRecommendations([], [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('endurance') || r.includes('horizon'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgDawnWisdom: 50 })
    const result = generateRecommendations([], [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('dawn'))).toBe(true)
  })

  it('warns about fading horizon when radiance < 40', () => {
    const stats = makeStats({ overallRadiance: 30 })
    const result = generateRecommendations([], [], { avgWarmth: 30, avgPrecision: 30, avgWisdom: 30, isTopaz: false, overallRadiance: 30 }, stats)
    expect(result.some((r) => r.includes('fading'))).toBe(true)
  })

  it('lists void rays by name when <= 5', () => {
    const rays = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(rays, [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void rays when > 5', () => {
    const rays = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(rays, [], { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('6 rough crystals'))).toBe(true)
  })

  it('warns when all skylines are poor', () => {
    const skylines = [{ condition: 'wooden-hut' as const, skylineType: 'flat-plain' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], skylines as any, { avgWarmth: 50, avgPrecision: 50, avgWisdom: 50, isTopaz: false, overallRadiance: 50 }, stats)
    expect(result.some((r) => r.includes('wooden huts'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgGoldenWarmth: 70,
      avgSunsetClarity: 70,
      avgFirePrecision: 70,
      avgHorizonEndurance: 70,
      avgDawnWisdom: 70,
      overallRadiance: 70,
    })
    const result = generateRecommendations([], [], { avgWarmth: 70, avgPrecision: 70, avgWisdom: 70, isTopaz: true, overallRadiance: 70 }, stats)
    expect(result.some((r) => r.includes('radiates warmth'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorTopazCondition', () => {
  it('colors topaz-masterpiece', () => {
    expect(typeof colorTopazCondition('topaz-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorTopazCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorTopazCondition('unknown')).toBe('string')
  })
})

describe('colorSkylineType', () => {
  it('colors golden-skyline', () => {
    expect(typeof colorSkylineType('golden-skyline')).toBe('string')
  })

  it('colors no-skyline', () => {
    expect(typeof colorSkylineType('no-skyline')).toBe('string')
  })
})

describe('colorSkylineCondition', () => {
  it('colors topaz-palace', () => {
    expect(typeof colorSkylineCondition('topaz-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorSkylineCondition('void')).toBe('string')
  })
})

describe('colorObserverGrade', () => {
  it('colors golden-master', () => {
    expect(typeof colorObserverGrade('golden-master')).toBe('string')
  })

  it('colors blind-folded', () => {
    expect(typeof colorObserverGrade('blind-folded')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray with all measures', () => {
    const ray = analyzeTopazRay(richContent, 'app.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('Topaz Ray: app.ts')
    expect(output).toContain('Golden Warmth')
    expect(output).toContain('Sunset Clarity')
    expect(output).toContain('Fire Precision')
    expect(output).toContain('Horizon Endurance')
    expect(output).toContain('Dawn Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatRaysTable', () => {
  it('shows no rays message for empty array', () => {
    expect(formatRaysTable([])).toContain('No topaz rays')
  })

  it('lists rays in output', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts')]
    expect(formatRaysTable(rays)).toContain('a.ts')
  })
})

describe('formatSkylineTable', () => {
  it('formats a skyline with all fields', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts')]
    const skyline = analyzeTopazSkyline(rays, 'src')
    const output = formatSkylineTable(skyline)
    expect(output).toContain('Topaz Skyline: src')
    expect(output).toContain('Rays')
    expect(output).toContain('Avg Warmth')
  })
})

describe('formatSkylinesTable', () => {
  it('shows no skylines message for empty array', () => {
    expect(formatSkylinesTable([])).toContain('No topaz skylines')
  })

  it('lists skylines in output', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts')]
    const skyline = analyzeTopazSkyline(rays, 'src')
    expect(formatSkylinesTable([skyline])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Topaz Horizon Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Observer Grade')
    expect(output).toContain('Best Ray')
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
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Topaz Horizon Analysis')
    expect(output).toContain('Sunset Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildTopazHorizonResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.sunset).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
