import { describe, expect, it } from 'vitest'

import {
  analyzeAmethystGlow,
  analyzeAmethystSky,
  buildAmethystTwilightResult,
  classifyAmethystCondition,
  classifyPhilosopherGrade,
  classifySkyCondition,
  classifySkyType,
  generateRecommendations,
  measureCalming,
  measureHoning,
  measureRevealing,
  measureSurviving,
  measureUnderstanding,
} from '../src/commands/amethyst-twilight-helpers.js'
import type { AmethystTwilightResult } from '../src/commands/amethyst-twilight-helpers.js'
import {
  colorAmethystCondition,
  colorPhilosopherGrade,
  colorScore,
  colorSkyCondition,
  colorSkyType,
  formatGlowsTable,
  formatGlowTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSkiesTable,
  formatSkyTable,
  formatStatsTable,
} from '../src/commands/amethyst-twilight-format-helpers.js'

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

const richSer = measureCalming(richContent).serenity
const richCla = measureRevealing(richContent).clarity
const richPre = measureHoning(richContent).precision
const richRes = measureSurviving(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<AmethystTwilightResult['stats']> = {}): AmethystTwilightResult['stats'] {
  return {
    totalFiles: 1,
    totalSkies: 1,
    avgVioletSerenity: 50,
    avgTwilightClarity: 50,
    avgDuskPrecision: 50,
    avgEveningResilience: 50,
    avgPurpleWisdom: 50,
    amethystMasterpieceCount: 0,
    violetGemCount: 0,
    properAmethystCount: 0,
    paleQuartzCount: 0,
    roughStoneCount: 0,
    voidCount: 0,
    hasHighSerenityCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallSerenity: 50,
    philosopherGrade: 'proper-observer',
    bestGlow: 'a.ts',
    mostSerene: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureCalming ─────────────────────────────────────

describe('measureCalming', () => {
  it('scores rich content highly', () => {
    const result = measureCalming(richContent)
    expect(result.serenity).toBeGreaterThan(60)
    expect(result.hasHighSerenity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCalming(emptyContent).serenity).toBeLessThan(richSer)
  })

  it('detects readable (class/interface/type)', () => {
    expect(measureCalming(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureCalming(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disordered = 3; const jumbled = 4'
    const result = measureCalming(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects organized (import/export)', () => {
    expect(measureCalming(richContent).hasOrganized).toBe(true)
  })

  it('detects peaceful (readonly/private/protected)', () => {
    expect(measureCalming(richContent).hasPeaceful).toBe(true)
  })

  it('detects composed (JSDoc)', () => {
    expect(measureCalming(richContent).hasComposed).toBe(true)
  })

  it('detects quiet (async/await/Promise)', () => {
    expect(measureCalming(richContent).hasQuiet).toBe(true)
  })

  it('classifies peace correctly for high scores', () => {
    const result = measureCalming(richContent)
    expect(['deep-meditation', 'quiet-dusk', 'proper-calm']).toContain(result.peace)
  })

  it('classifies peace correctly for low scores', () => {
    expect(measureCalming(emptyContent).peace).not.toBe('deep-meditation')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('counts obfuscated keywords', () => {
    const content = 'const obfuscated = 1; const encoded = 2; const encrypted = 3; const mangled = 4'
    const result = measureRevealing(content)
    expect(result.obfuscatedCount).toBe(4)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects self-documenting (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects transparent (no any)', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('detects direct (JSDoc)', () => {
    expect(measureRevealing(richContent).hasDirect).toBe(true)
  })

  it('detects open (readonly/private/protected)', () => {
    expect(measureRevealing(richContent).hasOpen).toBe(true)
  })

  it('detects evident (async/await/Promise)', () => {
    expect(measureRevealing(richContent).hasEvident).toBe(true)
  })

  it('classifies vision correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['purple-clarity', 'dusk-vision', 'proper-sight']).toContain(result.vision)
  })

  it('classifies vision correctly for low scores', () => {
    expect(measureRevealing(emptyContent).vision).not.toBe('purple-clarity')
  })
})

// ─── measureHoning ──────────────────────────────────────

describe('measureHoning', () => {
  it('scores rich content highly', () => {
    const result = measureHoning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureHoning(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type-safe (no any)', () => {
    expect(measureHoning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureHoning(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureHoning(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureHoning(richContent).hasExact).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measureHoning(richContent).hasCrisp).toBe(true)
  })

  it('detects tooled (async/await/Promise)', () => {
    expect(measureHoning(richContent).hasTooled).toBe(true)
  })

  it('classifies edge correctly for high scores', () => {
    const result = measureHoning(richContent)
    expect(['twilight-sharp', 'dusk-blade', 'proper-edge']).toContain(result.edge)
  })

  it('classifies edge correctly for low scores', () => {
    expect(measureHoning(emptyContent).edge).not.toBe('twilight-sharp')
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

  it('detects error-handled (try/catch)', () => {
    expect(measureSurviving(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
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

  it('detects tested (try/catch)', () => {
    expect(measureSurviving(richContent).hasTested).toBe(true)
  })

  it('detects robust (import/export)', () => {
    expect(measureSurviving(richContent).hasRobust).toBe(true)
  })

  it('detects stable (class/interface/type)', () => {
    expect(measureSurviving(richContent).hasStable).toBe(true)
  })

  it('detects unyielding (async/await/Promise)', () => {
    expect(measureSurviving(richContent).hasUnyielding).toBe(true)
  })

  it('classifies night correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['eternal-vigil', 'night-watch', 'proper-guard']).toContain(result.night)
  })

  it('classifies night correctly for low scores', () => {
    expect(measureSurviving(emptyContent).night).not.toBe('eternal-vigil')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
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

  it('detects principled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('detects mature (import/export)', () => {
    expect(measureUnderstanding(richContent).hasMature).toBe(true)
  })

  it('detects insightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['mystic-sage', 'twilight-philosopher', 'proper-scholar']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).depth).not.toBe('mystic-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyAmethystCondition', () => {
  it('returns amethyst-masterpiece for 90+', () => {
    expect(classifyAmethystCondition(90)).toBe('amethyst-masterpiece')
    expect(classifyAmethystCondition(95)).toBe('amethyst-masterpiece')
  })

  it('returns violet-gem for 75-89', () => {
    expect(classifyAmethystCondition(75)).toBe('violet-gem')
  })

  it('returns proper-amethyst for 60-74', () => {
    expect(classifyAmethystCondition(60)).toBe('proper-amethyst')
  })

  it('returns pale-quartz for 40-59', () => {
    expect(classifyAmethystCondition(40)).toBe('pale-quartz')
  })

  it('returns rough-stone for 20-39', () => {
    expect(classifyAmethystCondition(20)).toBe('rough-stone')
  })

  it('returns void below 20', () => {
    expect(classifyAmethystCondition(0)).toBe('void')
    expect(classifyAmethystCondition(10)).toBe('void')
  })
})

describe('classifySkyType', () => {
  it('returns no-sky for empty glows', () => {
    expect(classifySkyType([])).toBe('no-sky')
  })

  it('returns purple-twilight for avg >= 85', () => {
    const glows = [{ qualityScore: 90 }] as any
    expect(classifySkyType(glows)).toBe('purple-twilight')
  })

  it('returns dark-night for low avg', () => {
    const glows = [{ qualityScore: 10 }] as any
    expect(classifySkyType(glows)).toBe('dark-night')
  })
})

describe('classifySkyCondition', () => {
  it('returns amethyst-palace for 85+', () => {
    expect(classifySkyCondition(85)).toBe('amethyst-palace')
  })

  it('returns void below 15', () => {
    expect(classifySkyCondition(5)).toBe('void')
  })
})

describe('classifyPhilosopherGrade', () => {
  it('returns mystic-sage for 80+', () => {
    expect(classifyPhilosopherGrade(80)).toBe('mystic-sage')
  })

  it('returns daydreamer below 20', () => {
    expect(classifyPhilosopherGrade(5)).toBe('daydreamer')
  })

  it('returns twilight-scholar for 65-79', () => {
    expect(classifyPhilosopherGrade(65)).toBe('twilight-scholar')
  })

  it('returns proper-observer for 50-64', () => {
    expect(classifyPhilosopherGrade(50)).toBe('proper-observer')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyPhilosopherGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyPhilosopherGrade(20)).toBe('novice')
  })
})

// ─── analyzeAmethystGlow ────────────────────────────────

describe('analyzeAmethystGlow', () => {
  it('creates a glow with all 5 measures', () => {
    const glow = analyzeAmethystGlow(richContent, 'app.ts')
    expect(glow.file).toBe('app.ts')
    expect(typeof glow.violetSerenity).toBe('number')
    expect(typeof glow.twilightClarity).toBe('number')
    expect(typeof glow.duskPrecision).toBe('number')
    expect(typeof glow.eveningResilience).toBe('number')
    expect(typeof glow.purpleWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const glow = analyzeAmethystGlow(richContent, 'app.ts')
    const expected = Math.round(
      glow.violetSerenity * 0.2 +
      glow.twilightClarity * 0.2 +
      glow.duskPrecision * 0.2 +
      glow.eveningResilience * 0.2 +
      glow.purpleWisdom * 0.2,
    )
    expect(glow.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const glow = analyzeAmethystGlow(richContent, 'app.ts')
    expect(glow.condition).toBe(classifyAmethystCondition(glow.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richGlow = analyzeAmethystGlow(richContent, 'rich.ts')
    const emptyGlow = analyzeAmethystGlow(emptyContent, 'empty.ts')
    expect(richGlow.qualityScore).toBeGreaterThan(emptyGlow.qualityScore)
  })
})

// ─── analyzeAmethystSky ─────────────────────────────────

describe('analyzeAmethystSky', () => {
  it('returns empty sky for no glows', () => {
    const sky = analyzeAmethystSky([], 'src')
    expect(sky.directory).toBe('src')
    expect(sky.glows).toEqual([])
    expect(sky.skyType).toBe('no-sky')
    expect(sky.condition).toBe('void')
  })

  it('computes averages from glows', () => {
    const glows = [analyzeAmethystGlow(richContent, 'a.ts'), analyzeAmethystGlow(richContent, 'b.ts')]
    const sky = analyzeAmethystSky(glows, 'src')
    expect(sky.avgSerenity).toBeGreaterThan(0)
    expect(sky.avgPrecision).toBeGreaterThan(0)
    expect(sky.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildAmethystTwilightResult ────────────────────────

describe('buildAmethystTwilightResult', () => {
  it('returns full result structure', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    expect(result.glows).toHaveLength(1)
    expect(result.skies).toHaveLength(1)
    expect(result.dusk).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into skies', async () => {
    const result = await buildAmethystTwilightResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.skies.length).toBe(2)
  })

  it('computes dusk overview', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    expect(result.dusk.avgSerenity).toBeGreaterThan(0)
    expect(result.dusk.isAmethyst).toBe(true)
    expect(result.dusk.overallSerenity).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildAmethystTwilightResult([], [])
    expect(result.glows).toHaveLength(0)
    expect(result.skies).toHaveLength(0)
    expect(result.dusk.overallSerenity).toBe(0)
    expect(result.dusk.isAmethyst).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    const total = result.stats.amethystMasterpieceCount +
      result.stats.violetGemCount +
      result.stats.properAmethystCount +
      result.stats.paleQuartzCount +
      result.stats.roughStoneCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    expect(result.stats.hasHighSerenityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best glow and top performers', async () => {
    const result = await buildAmethystTwilightResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestGlow).toBeTruthy()
    expect(result.stats.mostSerene).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes philosopher grade from overall serenity', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    expect(result.stats.philosopherGrade).toBe(classifyPhilosopherGrade(result.stats.overallSerenity))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgVioletSerenity: 90,
      avgTwilightClarity: 90,
      avgDuskPrecision: 90,
      avgEveningResilience: 90,
      avgPurpleWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgSerenity: 90, avgPrecision: 90, avgWisdom: 90, isAmethyst: true, overallSerenity: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('mystic perfection')
  })

  it('recommends serenity when < 60', () => {
    const stats = makeStats({ avgVioletSerenity: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('serenity') || r.includes('violet'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgTwilightClarity: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('twilight'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgDuskPrecision: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('dusk'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgEveningResilience: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('evening'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgPurpleWisdom: 50 })
    const result = generateRecommendations([], [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('purple'))).toBe(true)
  })

  it('warns about dark twilight when serenity < 40', () => {
    const stats = makeStats({ overallSerenity: 30 })
    const result = generateRecommendations([], [], { avgSerenity: 30, avgPrecision: 30, avgWisdom: 30, isAmethyst: false, overallSerenity: 30 }, stats)
    expect(result.some((r) => r.includes('dark'))).toBe(true)
  })

  it('lists void glows by name when <= 5', () => {
    const glows = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(glows, [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void glows when > 5', () => {
    const glows = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(glows, [], { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('6 rough stones'))).toBe(true)
  })

  it('warns when all skies are poor', () => {
    const skies = [{ condition: 'wooden-shack' as const, skyType: 'dark-night' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], skies as any, { avgSerenity: 50, avgPrecision: 50, avgWisdom: 50, isAmethyst: false, overallSerenity: 50 }, stats)
    expect(result.some((r) => r.includes('wooden shacks'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgVioletSerenity: 70,
      avgTwilightClarity: 70,
      avgDuskPrecision: 70,
      avgEveningResilience: 70,
      avgPurpleWisdom: 70,
      overallSerenity: 70,
    })
    const result = generateRecommendations([], [], { avgSerenity: 70, avgPrecision: 70, avgWisdom: 70, isAmethyst: true, overallSerenity: 70 }, stats)
    expect(result.some((r) => r.includes('glows serenely'))).toBe(true)
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

describe('colorAmethystCondition', () => {
  it('colors amethyst-masterpiece', () => {
    expect(typeof colorAmethystCondition('amethyst-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorAmethystCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorAmethystCondition('unknown')).toBe('string')
  })
})

describe('colorSkyType', () => {
  it('colors purple-twilight', () => {
    expect(typeof colorSkyType('purple-twilight')).toBe('string')
  })

  it('colors no-sky', () => {
    expect(typeof colorSkyType('no-sky')).toBe('string')
  })
})

describe('colorSkyCondition', () => {
  it('colors amethyst-palace', () => {
    expect(typeof colorSkyCondition('amethyst-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorSkyCondition('void')).toBe('string')
  })
})

describe('colorPhilosopherGrade', () => {
  it('colors mystic-sage', () => {
    expect(typeof colorPhilosopherGrade('mystic-sage')).toBe('string')
  })

  it('colors daydreamer', () => {
    expect(typeof colorPhilosopherGrade('daydreamer')).toBe('string')
  })
})

describe('formatGlowTable', () => {
  it('formats a glow with all measures', () => {
    const glow = analyzeAmethystGlow(richContent, 'app.ts')
    const output = formatGlowTable(glow)
    expect(output).toContain('Amethyst Glow: app.ts')
    expect(output).toContain('Violet Serenity')
    expect(output).toContain('Twilight Clarity')
    expect(output).toContain('Dusk Precision')
    expect(output).toContain('Evening Resilience')
    expect(output).toContain('Purple Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatGlowsTable', () => {
  it('shows no glows message for empty array', () => {
    expect(formatGlowsTable([])).toContain('No amethyst glows')
  })

  it('lists glows in output', () => {
    const glows = [analyzeAmethystGlow(richContent, 'a.ts')]
    expect(formatGlowsTable(glows)).toContain('a.ts')
  })
})

describe('formatSkyTable', () => {
  it('formats a sky with all fields', () => {
    const glows = [analyzeAmethystGlow(richContent, 'a.ts')]
    const sky = analyzeAmethystSky(glows, 'src')
    const output = formatSkyTable(sky)
    expect(output).toContain('Amethyst Sky: src')
    expect(output).toContain('Glows')
    expect(output).toContain('Avg Serenity')
  })
})

describe('formatSkiesTable', () => {
  it('shows no skies message for empty array', () => {
    expect(formatSkiesTable([])).toContain('No amethyst skies')
  })

  it('lists skies in output', () => {
    const glows = [analyzeAmethystGlow(richContent, 'a.ts')]
    const sky = analyzeAmethystSky(glows, 'src')
    expect(formatSkiesTable([sky])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amethyst Twilight Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Philosopher Grade')
    expect(output).toContain('Best Glow')
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
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amethyst Twilight Analysis')
    expect(output).toContain('Dusk Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildAmethystTwilightResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.glows).toHaveLength(1)
    expect(parsed.dusk).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
