import { describe, expect, it } from 'vitest'

import {
  analyzeSapphireReading,
  analyzeSapphireDome,
  buildSapphireObservatoryResult,
  classifyReadingCondition,
  classifyAstronomerGrade,
  classifyDomeCondition,
  classifyDomeType,
  generateRecommendations,
  measureObserving,
  measureFocusing,
  measureConnecting,
  measureProbing,
  measureUnderstanding,
  type SapphireReading,
  type SapphireDome,
  type SapphireObservatoryResult,
} from '../src/commands/sapphire-observatory-helpers.js'

import {
  colorScore,
  colorDomeCondition,
  formatReadingTable,
  formatReadingsTable,
  formatDomeTable,
  formatDomesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/sapphire-observatory-format-helpers.js'

// ─── Test fixtures ──────────────────────────────────────

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

const poorContent = 'var x = eval("1+2") any global hack'

// ─── measureObserving ───────────────────────────────────

describe('measureObserving', () => {
  it('scores rich content highly', () => {
    const result = measureObserving(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content poorly', () => {
    const result = measureObserving(emptyContent)
    expect(result.clarity).toBeLessThan(50)
  })

  it('detects cryptic content', () => {
    const result = measureObserving('cryptic mysterious obscure enigmatic code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated content', () => {
    const result = measureObserving('obfuscated encoded encrypted scrambled code')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('classifies sky for rich content', () => {
    const result = measureObserving(richContent)
    expect(['crystal-night', 'clear-horizon', 'proper-twilight']).toContain(result.sky)
  })

  it('has all boolean fields', () => {
    const result = measureObserving(richContent)
    expect(typeof result.hasReadable).toBe('boolean')
    expect(typeof result.hasNoCryptic).toBe('boolean')
    expect(typeof result.hasSelfDocumenting).toBe('boolean')
    expect(typeof result.hasNoMystery).toBe('boolean')
    expect(typeof result.hasClear).toBe('boolean')
  })
})

// ─── measureFocusing ────────────────────────────────────

describe('measureFocusing', () => {
  it('scores rich content highly', () => {
    const result = measureFocusing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('detects unsafe content', () => {
    const result = measureFocusing('unsafe risky hazardous code')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects approximate content', () => {
    const result = measureFocusing('approximate rough vague imprecise code')
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('classifies lens for rich content', () => {
    const result = measureFocusing(richContent)
    expect(['hubble-grade', 'research-telescope', 'proper-optics']).toContain(result.lens)
  })
})

// ─── measureConnecting ──────────────────────────────────

describe('measureConnecting', () => {
  it('scores rich content highly', () => {
    const result = measureConnecting(richContent)
    expect(result.pattern).toBeGreaterThan(60)
    expect(result.hasHighPattern).toBe(true)
  })

  it('detects spaghetti content', () => {
    const result = measureConnecting('spaghetti callback.hell pyramid code')
    expect(result.spaghettiCount).toBeGreaterThan(0)
    expect(result.hasNoSpaghetti).toBe(false)
  })

  it('detects monolithic content', () => {
    const result = measureConnecting('monolithic god.object mega code')
    expect(result.monolithicCount).toBeGreaterThan(0)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('classifies map for rich content', () => {
    const result = measureConnecting(richContent)
    expect(['grand-constellation', 'star-chain', 'proper-pattern']).toContain(result.map)
  })
})

// ─── measureProbing ─────────────────────────────────────

describe('measureProbing', () => {
  it('scores rich content highly', () => {
    const result = measureProbing(richContent)
    expect(result.depth).toBeGreaterThan(60)
    expect(result.hasHighDepth).toBe(true)
  })

  it('detects shallow content', () => {
    const result = measureProbing('shallow superficial skinsideep surface code')
    expect(result.shallowCount).toBeGreaterThan(0)
    expect(result.hasNoShallow).toBe(false)
  })

  it('detects trivial content', () => {
    const result = measureProbing('trivial petty minor negligible code')
    expect(result.trivialCount).toBeGreaterThan(0)
    expect(result.hasNoTrivial).toBe(false)
  })

  it('classifies cloud for rich content', () => {
    const result = measureProbing(richContent)
    expect(['deep-nebula', 'stellar-nursery', 'proper-depth']).toContain(result.cloud)
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('detects hacked content', () => {
    const result = measureUnderstanding('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow content', () => {
    const result = measureUnderstanding('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('classifies cosmos for rich content', () => {
    const result = measureUnderstanding(richContent)
    expect(['cosmic-sage', 'star-scholar', 'proper-astronomer']).toContain(result.cosmos)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyReadingCondition', () => {
  it('returns sapphire-masterpiece for 90+', () => { expect(classifyReadingCondition(90)).toBe('sapphire-masterpiece') })
  it('returns celestial-gem for 75-89', () => { expect(classifyReadingCondition(75)).toBe('celestial-gem') })
  it('returns proper-sapphire for 60-74', () => { expect(classifyReadingCondition(60)).toBe('proper-sapphire') })
  it('returns blue-glass for 40-59', () => { expect(classifyReadingCondition(40)).toBe('blue-glass') })
  it('returns cloudy-quartz for 20-39', () => { expect(classifyReadingCondition(20)).toBe('cloudy-quartz') })
  it('returns void below 20', () => { expect(classifyReadingCondition(0)).toBe('void') })
})

describe('classifyDomeType', () => {
  function makeReading(score: number): SapphireReading {
    return {
      file: 'test.ts', celestialClarity: score, telescopePrecision: score, constellationPattern: score,
      nebulaDepth: score, cosmicWisdom: score, qualityScore: score,
      condition: classifyReadingCondition(score),
      observing: {} as SapphireReading['observing'],
      focusing: {} as SapphireReading['focusing'],
      connecting: {} as SapphireReading['connecting'],
      probing: {} as SapphireReading['probing'],
      understanding: {} as SapphireReading['understanding'],
    }
  }

  it('returns no-dome for empty readings', () => { expect(classifyDomeType([])).toBe('no-dome') })
  it('returns grand-observatory for high scores', () => { expect(classifyDomeType([makeReading(90)])).toBe('grand-observatory') })
  it('returns dark-room for low scores', () => { expect(classifyDomeType([makeReading(10)])).toBe('dark-room') })
})

describe('classifyDomeCondition', () => {
  it('returns sapphire-palace for 85+', () => { expect(classifyDomeCondition(85)).toBe('sapphire-palace') })
  it('returns gem-tower for 70-84', () => { expect(classifyDomeCondition(70)).toBe('gem-tower') })
  it('returns proper-observatory for 55-69', () => { expect(classifyDomeCondition(55)).toBe('proper-observatory') })
  it('returns stone-tower for 35-54', () => { expect(classifyDomeCondition(35)).toBe('stone-tower') })
  it('returns wooden-shack for 15-34', () => { expect(classifyDomeCondition(15)).toBe('wooden-shack') })
  it('returns void below 15', () => { expect(classifyDomeCondition(0)).toBe('void') })
})

describe('classifyAstronomerGrade', () => {
  it('returns master-astronomer for 80+', () => { expect(classifyAstronomerGrade(80)).toBe('master-astronomer') })
  it('returns research-scientist for 65-79', () => { expect(classifyAstronomerGrade(65)).toBe('research-scientist') })
  it('returns proper-observer for 50-64', () => { expect(classifyAstronomerGrade(50)).toBe('proper-observer') })
  it('returns apprentice for 35-49', () => { expect(classifyAstronomerGrade(35)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyAstronomerGrade(20)).toBe('novice') })
  it('returns stargazer below 20', () => { expect(classifyAstronomerGrade(0)).toBe('stargazer') })
})

// ─── analyzeSapphireReading ─────────────────────────────

describe('analyzeSapphireReading', () => {
  it('returns a complete SapphireReading', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    expect(reading.file).toBe('test.ts')
    expect(typeof reading.celestialClarity).toBe('number')
    expect(typeof reading.telescopePrecision).toBe('number')
    expect(typeof reading.constellationPattern).toBe('number')
    expect(typeof reading.nebulaDepth).toBe('number')
    expect(typeof reading.cosmicWisdom).toBe('number')
    expect(typeof reading.qualityScore).toBe('number')
    expect(reading.observing).toBeDefined()
    expect(reading.focusing).toBeDefined()
    expect(reading.connecting).toBeDefined()
    expect(reading.probing).toBeDefined()
    expect(reading.understanding).toBeDefined()
  })

  it('computes qualityScore as weighted average', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    const expected = Math.round(
      reading.celestialClarity * 0.2 +
      reading.telescopePrecision * 0.2 +
      reading.constellationPattern * 0.2 +
      reading.nebulaDepth * 0.2 +
      reading.cosmicWisdom * 0.2,
    )
    expect(reading.qualityScore).toBe(expected)
  })

  it('scores rich content highly', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    expect(reading.qualityScore).toBeGreaterThan(60)
  })

  it('scores empty content low', () => {
    const reading = analyzeSapphireReading(emptyContent, 'empty.ts')
    expect(reading.qualityScore).toBeLessThan(50)
  })
})

// ─── analyzeSapphireDome ────────────────────────────────

describe('analyzeSapphireDome', () => {
  it('returns empty dome for no readings', () => {
    const dome = analyzeSapphireDome([], 'src')
    expect(dome.directory).toBe('src')
    expect(dome.readings).toHaveLength(0)
    expect(dome.domeType).toBe('no-dome')
    expect(dome.condition).toBe('void')
  })

  it('computes averages from readings', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    const dome = analyzeSapphireDome([reading], 'src')
    expect(dome.avgClarity).toBe(reading.celestialClarity)
  })
})

// ─── buildSapphireObservatoryResult ─────────────────────

describe('buildSapphireObservatoryResult', () => {
  it('returns complete result for empty input', async () => {
    const result = await buildSapphireObservatoryResult([], [])
    expect(result.readings).toHaveLength(0)
    expect(result.domes).toHaveLength(0)
    expect(result.cosmos.overallLuminosity).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('returns complete result for single file', async () => {
    const result = await buildSapphireObservatoryResult(['test.ts'], [richContent])
    expect(result.readings).toHaveLength(1)
    expect(result.readings[0].file).toBe('test.ts')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.overallLuminosity).toBeGreaterThan(0)
    expect(result.stats.astronomerGrade).toBeDefined()
  })

  it('returns complete result for multiple dirs', async () => {
    const result = await buildSapphireObservatoryResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.readings).toHaveLength(3)
    expect(result.domes).toHaveLength(2)
  })

  it('computes stats correctly', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(typeof result.stats.bestReading).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.mostPrecise).toBe('string')
    expect(typeof result.stats.mostConnected).toBe('string')
    expect(typeof result.stats.deepest).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('computes cosmos overview', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts'], [richContent])
    expect(typeof result.cosmos.avgClarity).toBe('number')
    expect(typeof result.cosmos.avgPrecision).toBe('number')
    expect(typeof result.cosmos.avgWisdom).toBe('number')
    expect(typeof result.cosmos.isSapphire).toBe('boolean')
  })

  it('generates recommendations', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  function makeStats(overrides: Partial<SapphireObservatoryResult['stats']> = {}): SapphireObservatoryResult['stats'] {
    return {
      totalFiles: 1, totalDomes: 1,
      avgCelestialClarity: 50, avgTelescopePrecision: 50, avgConstellationPattern: 50,
      avgNebulaDepth: 50, avgCosmicWisdom: 50,
      sapphireMasterpieceCount: 0, celestialGemCount: 0, properSapphireCount: 1,
      blueGlassCount: 0, cloudyQuartzCount: 0, voidCount: 0,
      hasHighClarityCount: 0, hasHighPrecisionCount: 0, hasHighPatternCount: 0,
      hasHighDepthCount: 0, hasHighWisdomCount: 0,
      overallLuminosity: 50,
      astronomerGrade: 'proper-observer',
      bestReading: 'a.ts', clearest: 'a.ts', mostPrecise: 'a.ts',
      mostConnected: 'a.ts', deepest: 'a.ts', wisest: 'a.ts',
      ...overrides,
    }
  }

  it('returns masterpiece message when all scores >= 90', () => {
    const stats = makeStats({
      avgCelestialClarity: 92, avgTelescopePrecision: 91, avgConstellationPattern: 90,
      avgNebulaDepth: 93, avgCosmicWisdom: 90,
    })
    const recs = generateRecommendations([], [], { avgClarity: 92, avgPrecision: 91, avgWisdom: 90, isSapphire: true, overallLuminosity: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfect luminosity')
  })

  it('recommends clarity improvement when low', () => {
    const stats = makeStats({ avgCelestialClarity: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 40, avgPrecision: 50, avgWisdom: 50, isSapphire: false, overallLuminosity: 40 }, stats)
    expect(recs.some((r) => r.includes('celestial view'))).toBe(true)
  })

  it('recommends precision improvement when low', () => {
    const stats = makeStats({ avgTelescopePrecision: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 40, avgWisdom: 50, isSapphire: false, overallLuminosity: 40 }, stats)
    expect(recs.some((r) => r.includes('telescope precision'))).toBe(true)
  })

  it('recommends pattern improvement when low', () => {
    const stats = makeStats({ avgConstellationPattern: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isSapphire: false, overallLuminosity: 40 }, stats)
    expect(recs.some((r) => r.includes('constellation pattern'))).toBe(true)
  })

  it('recommends depth improvement when low', () => {
    const stats = makeStats({ avgNebulaDepth: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 50, isSapphire: false, overallLuminosity: 40 }, stats)
    expect(recs.some((r) => r.includes('nebula depth'))).toBe(true)
  })

  it('recommends wisdom improvement when low', () => {
    const stats = makeStats({ avgCosmicWisdom: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 50, avgPrecision: 50, avgWisdom: 40, isSapphire: false, overallLuminosity: 40 }, stats)
    expect(recs.some((r) => r.includes('cosmic wisdom'))).toBe(true)
  })

  it('warns about overall low luminosity', () => {
    const stats = makeStats({ overallLuminosity: 30 })
    const recs = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isSapphire: false, overallLuminosity: 30 }, stats)
    expect(recs.some((r) => r.includes('gone dark'))).toBe(true)
  })

  it('lists void readings', () => {
    const reading: SapphireReading = {
      file: 'bad.ts', celestialClarity: 0, telescopePrecision: 0, constellationPattern: 0,
      nebulaDepth: 0, cosmicWisdom: 0, qualityScore: 0,
      condition: 'void',
      observing: {} as SapphireReading['observing'],
      focusing: {} as SapphireReading['focusing'],
      connecting: {} as SapphireReading['connecting'],
      probing: {} as SapphireReading['probing'],
      understanding: {} as SapphireReading['understanding'],
    }
    const recs = generateRecommendations([reading], [], { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isSapphire: false, overallLuminosity: 0 }, makeStats({ overallLuminosity: 0 }))
    expect(recs.some((r) => r.includes('bad.ts'))).toBe(true)
  })

  it('warns about many void readings', () => {
    const readings: SapphireReading[] = Array.from({ length: 6 }, (_, i) => ({
      file: `bad${i}.ts`, celestialClarity: 0, telescopePrecision: 0, constellationPattern: 0,
      nebulaDepth: 0, cosmicWisdom: 0, qualityScore: 0,
      condition: 'void' as const,
      observing: {} as SapphireReading['observing'],
      focusing: {} as SapphireReading['focusing'],
      connecting: {} as SapphireReading['connecting'],
      probing: {} as SapphireReading['probing'],
      understanding: {} as SapphireReading['understanding'],
    }))
    const recs = generateRecommendations(readings, [], { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isSapphire: false, overallLuminosity: 0 }, makeStats({ overallLuminosity: 0 }))
    expect(recs.some((r) => r.includes('6 cloudy quartz'))).toBe(true)
  })

  it('warns when all domes are poor', () => {
    const dome: SapphireDome = {
      directory: 'src', readings: [], avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      sapphireMasterpieceCount: 0, voidCount: 0, domeType: 'dark-room', condition: 'void',
    }
    const recs = generateRecommendations([], [dome], { avgClarity: 0, avgPrecision: 0, avgWisdom: 0, isSapphire: false, overallLuminosity: 0 }, makeStats({ overallLuminosity: 0 }))
    expect(recs.some((r) => r.includes('wooden shacks'))).toBe(true)
  })

  it('gives positive feedback when no issues', () => {
    const stats = makeStats({
      avgCelestialClarity: 70, avgTelescopePrecision: 70, avgConstellationPattern: 70,
      avgNebulaDepth: 70, avgCosmicWisdom: 70, overallLuminosity: 70,
    })
    const recs = generateRecommendations([], [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isSapphire: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('cosmic luminosity'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns strings for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(75)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorDomeCondition', () => {
  it('handles all conditions', () => {
    expect(typeof colorDomeCondition('sapphire-palace')).toBe('string')
    expect(typeof colorDomeCondition('gem-tower')).toBe('string')
    expect(typeof colorDomeCondition('proper-observatory')).toBe('string')
    expect(typeof colorDomeCondition('stone-tower')).toBe('string')
    expect(typeof colorDomeCondition('wooden-shack')).toBe('string')
    expect(typeof colorDomeCondition('void')).toBe('string')
    expect(typeof colorDomeCondition('unknown')).toBe('string')
  })
})

describe('formatReadingTable', () => {
  it('formats a reading', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    const result = formatReadingTable(reading)
    expect(result).toContain('Sapphire Reading')
    expect(result).toContain('test.ts')
  })
})

describe('formatReadingsTable', () => {
  it('handles empty readings', () => { expect(formatReadingsTable([])).toContain('No sapphire readings') })
  it('formats multiple readings', () => {
    const r1 = analyzeSapphireReading(richContent, 'a.ts')
    const r2 = analyzeSapphireReading(richContent, 'b.ts')
    expect(formatReadingsTable([r1, r2])).toContain('Sapphire Readings')
  })
})

describe('formatDomeTable', () => {
  it('formats a dome', () => {
    const reading = analyzeSapphireReading(richContent, 'test.ts')
    const dome = analyzeSapphireDome([reading], 'src')
    expect(formatDomeTable(dome)).toContain('Sapphire Dome')
  })
})

describe('formatDomesTable', () => {
  it('handles empty domes', () => { expect(formatDomesTable([])).toContain('No sapphire domes') })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts'], [richContent])
    expect(formatStatsTable(result.stats)).toContain('Sapphire Observatory Statistics')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts'], [richContent])
    expect(formatResultTable(result)).toContain('Sapphire Observatory Analysis')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildSapphireObservatoryResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.readings).toHaveLength(1)
  })
})

// ─── Integration ────────────────────────────────────────

describe('rich content integration', () => {
  it('all measures score rich content well', async () => {
    const result = await buildSapphireObservatoryResult(['test.ts'], [richContent])
    expect(result.readings[0].celestialClarity).toBeGreaterThan(60)
    expect(result.readings[0].telescopePrecision).toBeGreaterThan(60)
    expect(result.readings[0].constellationPattern).toBeGreaterThan(60)
    expect(result.stats.overallLuminosity).toBeGreaterThan(60)
  })

  it('observing booleans match richContent', () => {
    const result = measureObserving(richContent)
    expect(result.hasReadable).toBe(true)
    expect(result.hasNoCryptic).toBe(true)
    expect(result.hasSelfDocumenting).toBe(true)
    expect(result.hasClear).toBe(true)
    expect(result.hasIlluminated).toBe(true)
  })

  it('focusing booleans match richContent', () => {
    const result = measureFocusing(richContent)
    expect(result.hasTypeSafe).toBe(true)
    expect(result.hasAccurate).toBe(true)
    expect(result.hasExact).toBe(true)
    expect(result.hasSharp).toBe(true)
    expect(result.hasCalibrated).toBe(true)
  })

  it('connecting booleans match richContent', () => {
    const result = measureConnecting(richContent)
    expect(result.hasWellStructured).toBe(true)
    expect(result.hasModular).toBe(true)
    expect(result.hasConnected).toBe(true)
    expect(result.hasNetworked).toBe(true)
    expect(result.hasAligned).toBe(true)
  })

  it('probing booleans match richContent', () => {
    const result = measureProbing(richContent)
    expect(result.hasDeepLogic).toBe(true)
    expect(result.hasProfound).toBe(true)
    expect(result.hasComplex).toBe(true)
    expect(result.hasInDepth).toBe(true)
    expect(result.hasExhaustive).toBe(true)
  })

  it('understanding booleans match richContent', () => {
    const result = measureUnderstanding(richContent)
    expect(result.hasWellArchitected).toBe(true)
    expect(result.hasNoHacked).toBe(true)
    expect(result.hasPrincipled).toBe(true)
    expect(result.hasDeep).toBe(true)
    expect(result.hasComprehensive).toBe(true)
  })
})
