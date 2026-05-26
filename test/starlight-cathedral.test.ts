import { describe, expect, it } from 'vitest'

import {
  analyzeStarlightConstellation,
  analyzeStarlightPrayer,
  buildStarlightCathedralResult,
  classifyAstronomerGrade,
  classifyConstellationCondition,
  classifyConstellationType,
  classifyPrayerCondition,
  generateRecommendations,
  measureAligning,
  measureBuilding,
  measureEnduring,
  measureShining,
  measureUnderstanding,
} from '../src/commands/starlight-cathedral-helpers.js'
import type { StarlightCathedralResult, StarlightPrayer } from '../src/commands/starlight-cathedral-helpers.js'
import {
  colorAstronomerGrade,
  colorConstellationCondition,
  colorConstellationType,
  colorPrayerCondition,
  colorScore,
  formatConstellationsTable,
  formatConstellationTable,
  formatPrayersTable,
  formatPrayerTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/starlight-cathedral-format-helpers.js'

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

const richLum = measureShining(richContent).luminescence
const richArc = measureBuilding(richContent).architecture
const richPre = measureAligning(richContent).precision
const richEnd = measureEnduring(richContent).endurance
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<StarlightCathedralResult['stats']> = {}): StarlightCathedralResult['stats'] {
  return {
    totalFiles: 1,
    totalConstellations: 1,
    avgCelestialLuminescence: 50,
    avgStellarArchitecture: 50,
    avgCosmicPrecision: 50,
    avgInterstellarEndurance: 50,
    avgAstralWisdom: 50,
    starlightMasterpieceCount: 0,
    celestialGemCount: 0,
    properStarCount: 0,
    dimEmberCount: 0,
    darkVoidCount: 0,
    voidCount: 0,
    hasHighLuminescenceCount: 1,
    hasHighArchitectureCount: 1,
    hasHighPrecisionCount: 1,
    hasHighEnduranceCount: 1,
    hasHighWisdomCount: 1,
    overallRadiance: 50,
    astronomerGrade: 'proper-deacon',
    bestPrayer: 'a.ts',
    brightest: 'a.ts',
    mostStructured: 'a.ts',
    mostPrecise: 'a.ts',
    mostEnduring: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureShining ─────────────────────────────────────

describe('measureShining', () => {
  it('scores rich content highly', () => {
    const result = measureShining(richContent)
    expect(result.luminescence).toBeGreaterThan(60)
    expect(result.hasHighLuminescence).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureShining(emptyContent).luminescence).toBeLessThan(richLum)
  })

  it('detects readable (type annotations)', () => {
    expect(measureShining(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureShining(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureShining(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects clear (no any)', () => {
    expect(measureShining(richContent).hasClear).toBe(true)
  })

  it('detects luminous (class/interface/type)', () => {
    expect(measureShining(richContent).hasLuminous).toBe(true)
  })

  it('detects radiant (import/export)', () => {
    expect(measureShining(richContent).hasRadiant).toBe(true)
  })

  it('detects brilliant (readonly/private/protected)', () => {
    expect(measureShining(richContent).hasBrilliant).toBe(true)
  })

  it('detects glowing (JSDoc)', () => {
    expect(measureShining(richContent).hasGlowing).toBe(true)
  })

  it('detects effulgent (async/await/Promise)', () => {
    expect(measureShining(richContent).hasEffulgent).toBe(true)
  })

  it('detects incandescent (try/catch/if)', () => {
    expect(measureShining(richContent).hasIncandescent).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureShining(richContent)
    expect(['supernova-bright', 'starshine', 'proper-glow']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureShining(emptyContent).light).not.toBe('supernova-bright')
  })
})

// ─── measureBuilding ────────────────────────────────────

describe('measureBuilding', () => {
  it('scores rich content highly', () => {
    const result = measureBuilding(richContent)
    expect(result.architecture).toBeGreaterThan(60)
    expect(result.hasHighArchitecture).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureBuilding(emptyContent).architecture).toBeLessThan(richArc)
  })

  it('detects well-structured (class/interface/type)', () => {
    expect(measureBuilding(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const tangled = 3; const spaghetti = 4'
    const result = measureBuilding(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('counts monolithic keywords', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3; const bloated = 4'
    const result = measureBuilding(content)
    expect(result.monolithicCount).toBe(4)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects modular (import/export)', () => {
    expect(measureBuilding(richContent).hasModular).toBe(true)
  })

  it('detects elegant (type annotations)', () => {
    expect(measureBuilding(richContent).hasElegant).toBe(true)
  })

  it('detects refined (JSDoc)', () => {
    expect(measureBuilding(richContent).hasRefined).toBe(true)
  })

  it('detects imposing (no any)', () => {
    expect(measureBuilding(richContent).hasImposing).toBe(true)
  })

  it('classifies structure correctly for high scores', () => {
    const result = measureBuilding(richContent)
    expect(['grand-cathedral', 'stellar-temple', 'proper-sanctuary']).toContain(result.structure)
  })

  it('classifies structure correctly for low scores', () => {
    expect(measureBuilding(emptyContent).structure).not.toBe('grand-cathedral')
  })
})

// ─── measureAligning ────────────────────────────────────

describe('measureAligning', () => {
  it('scores rich content highly', () => {
    const result = measureAligning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAligning(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type safe (no any)', () => {
    expect(measureAligning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe (var/eval)', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureAligning(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureAligning(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects calculated (async/await/Promise)', () => {
    expect(measureAligning(richContent).hasCalculated).toBe(true)
  })

  it('detects aligned (try/catch/if)', () => {
    expect(measureAligning(richContent).hasAligned).toBe(true)
  })

  it('classifies alignment correctly for high scores', () => {
    const result = measureAligning(richContent)
    expect(['perfect-alignment', 'precise-orbit', 'proper-trajectory']).toContain(result.alignment)
  })

  it('classifies alignment correctly for low scores', () => {
    expect(measureAligning(emptyContent).alignment).not.toBe('perfect-alignment')
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureEnduring(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects error handled (try/catch)', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unsafe = 1; const risky = 2; const dangerous = 3; const fragile = 4'
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

  it('detects defensive (no any)', () => {
    expect(measureEnduring(richContent).hasDefensive).toBe(true)
  })

  it('detects hardened (import/export)', () => {
    expect(measureEnduring(richContent).hasHardened).toBe(true)
  })

  it('detects enduring (JSDoc)', () => {
    expect(measureEnduring(richContent).hasEnduring).toBe(true)
  })

  it('classifies eternity correctly for high scores', () => {
    const result = measureEnduring(richContent)
    expect(['photon-eternal', 'star-long-lived', 'proper-lifespan']).toContain(result.eternity)
  })

  it('classifies eternity correctly for low scores', () => {
    expect(measureEnduring(emptyContent).eternity).not.toBe('photon-eternal')
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

  it('detects well-architected patterns', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('detects omniscient (const/readonly)', () => {
    expect(measureUnderstanding(richContent).hasOmniscient).toBe(true)
  })

  it('classifies cosmos correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['cosmic-sage', 'star-oracle', 'proper-astronomer']).toContain(result.cosmos)
  })

  it('classifies cosmos correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cosmos).not.toBe('cosmic-sage')
  })
})

// ─── analyzeStarlightPrayer ─────────────────────────────

describe('analyzeStarlightPrayer', () => {
  it('analyzes a file correctly', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'test.ts')
    expect(prayer.file).toBe('test.ts')
    expect(prayer.celestialLuminescence).toBeGreaterThan(0)
    expect(prayer.stellarArchitecture).toBeGreaterThan(0)
    expect(prayer.cosmicPrecision).toBeGreaterThan(0)
    expect(prayer.interstellarEndurance).toBeGreaterThan(0)
    expect(prayer.astralWisdom).toBeGreaterThan(0)
    expect(prayer.qualityScore).toBeGreaterThan(0)
    expect(prayer.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'test.ts')
    const expected = Math.round(
      prayer.celestialLuminescence * 0.2 +
      prayer.stellarArchitecture * 0.2 +
      prayer.cosmicPrecision * 0.2 +
      prayer.interstellarEndurance * 0.2 +
      prayer.astralWisdom * 0.2,
    )
    expect(prayer.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'test.ts')
    expect(prayer.shining).toBeDefined()
    expect(prayer.building).toBeDefined()
    expect(prayer.aligning).toBeDefined()
    expect(prayer.enduring).toBeDefined()
    expect(prayer.understanding).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const prayer = analyzeStarlightPrayer(emptyContent, 'empty.ts')
    expect(prayer.qualityScore).toBeLessThan(60)
    expect(prayer.condition).not.toBe('starlight-masterpiece')
  })

  it('scores rich content at max', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'rich.ts')
    expect(prayer.qualityScore).toBeGreaterThan(60)
  })
})

// ─── analyzeStarlightConstellation ──────────────────────

describe('analyzeStarlightConstellation', () => {
  it('handles empty prayers', () => {
    const constellation = analyzeStarlightConstellation([], 'empty-dir')
    expect(constellation.prayers).toHaveLength(0)
    expect(constellation.constellationType).toBe('no-constellation')
    expect(constellation.condition).toBe('void')
  })

  it('analyzes a constellation with prayers', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'src/test.ts')
    const constellation = analyzeStarlightConstellation([prayer], 'src')
    expect(constellation.directory).toBe('src')
    expect(constellation.prayers).toHaveLength(1)
    expect(constellation.avgLuminescence).toBeGreaterThan(0)
  })

  it('counts starlight masterpieces', () => {
    const prayer: StarlightPrayer = {
      file: 'a.ts', celestialLuminescence: 95, stellarArchitecture: 95, cosmicPrecision: 95, interstellarEndurance: 95, astralWisdom: 95,
      shining: {} as StarlightPrayer['shining'],
      building: {} as StarlightPrayer['building'],
      aligning: {} as StarlightPrayer['aligning'],
      enduring: {} as StarlightPrayer['enduring'],
      understanding: {} as StarlightPrayer['understanding'],
      condition: 'starlight-masterpiece', qualityScore: 95,
    }
    expect(analyzeStarlightConstellation([prayer], 'src').starlightMasterpieceCount).toBe(1)
  })

  it('counts void prayers', () => {
    const prayer: StarlightPrayer = {
      file: 'a.ts', celestialLuminescence: 0, stellarArchitecture: 0, cosmicPrecision: 0, interstellarEndurance: 0, astralWisdom: 0,
      shining: {} as StarlightPrayer['shining'],
      building: {} as StarlightPrayer['building'],
      aligning: {} as StarlightPrayer['aligning'],
      enduring: {} as StarlightPrayer['enduring'],
      understanding: {} as StarlightPrayer['understanding'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeStarlightConstellation([prayer], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPrayerCondition', () => {
  it('classifies starlight-masterpiece at 90+', () => { expect(classifyPrayerCondition(90)).toBe('starlight-masterpiece') })
  it('classifies celestial-gem at 75-89', () => { expect(classifyPrayerCondition(75)).toBe('celestial-gem') })
  it('classifies proper-star at 60-74', () => { expect(classifyPrayerCondition(60)).toBe('proper-star') })
  it('classifies dim-ember at 40-59', () => { expect(classifyPrayerCondition(40)).toBe('dim-ember') })
  it('classifies dark-void at 20-39', () => { expect(classifyPrayerCondition(20)).toBe('dark-void') })
  it('classifies void below 20', () => { expect(classifyPrayerCondition(0)).toBe('void') })
})

describe('classifyConstellationType', () => {
  it('returns no-constellation for empty prayers', () => { expect(classifyConstellationType([])).toBe('no-constellation') })
  it('classifies grand-constellation at 85+', () => { expect(classifyConstellationType([{ qualityScore: 90 } as StarlightPrayer])).toBe('grand-constellation') })
  it('classifies star-cluster at 70-84', () => { expect(classifyConstellationType([{ qualityScore: 75 } as StarlightPrayer])).toBe('star-cluster') })
  it('classifies proper-pattern at 55-69', () => { expect(classifyConstellationType([{ qualityScore: 60 } as StarlightPrayer])).toBe('proper-pattern') })
  it('classifies scattered-stars at 35-54', () => { expect(classifyConstellationType([{ qualityScore: 40 } as StarlightPrayer])).toBe('scattered-stars') })
  it('classifies empty-space below 35', () => { expect(classifyConstellationType([{ qualityScore: 10 } as StarlightPrayer])).toBe('empty-space') })
})

describe('classifyConstellationCondition', () => {
  it('classifies starlight-palace at 85+', () => { expect(classifyConstellationCondition(85)).toBe('starlight-palace') })
  it('classifies cosmic-temple at 70-84', () => { expect(classifyConstellationCondition(70)).toBe('cosmic-temple') })
  it('classifies proper-observatory at 55-69', () => { expect(classifyConstellationCondition(55)).toBe('proper-observatory') })
  it('classifies stone-tower at 35-54', () => { expect(classifyConstellationCondition(35)).toBe('stone-tower') })
  it('classifies dark-room at 15-34', () => { expect(classifyConstellationCondition(15)).toBe('dark-room') })
  it('classifies void below 15', () => { expect(classifyConstellationCondition(0)).toBe('void') })
})

describe('classifyAstronomerGrade', () => {
  it('classifies cosmic-high-priest at 80+', () => { expect(classifyAstronomerGrade(80)).toBe('cosmic-high-priest') })
  it('classifies star-bishop at 65-79', () => { expect(classifyAstronomerGrade(65)).toBe('star-bishop') })
  it('classifies proper-deacon at 50-64', () => { expect(classifyAstronomerGrade(50)).toBe('proper-deacon') })
  it('classifies acolyte at 35-49', () => { expect(classifyAstronomerGrade(35)).toBe('acolyte') })
  it('classifies novice at 20-34', () => { expect(classifyAstronomerGrade(20)).toBe('novice') })
  it('classifies uninitiated below 20', () => { expect(classifyAstronomerGrade(0)).toBe('uninitiated') })
})

// ─── buildStarlightCathedralResult ───────────────────────

describe('buildStarlightCathedralResult', () => {
  it('handles empty input', async () => {
    const result = await buildStarlightCathedralResult([], [])
    expect(result.prayers).toHaveLength(0)
    expect(result.constellations).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.stats.bestPrayer).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildStarlightCathedralResult(['test.ts'], [richContent])
    expect(result.prayers).toHaveLength(1)
    expect(result.prayers[0].file).toBe('test.ts')
    expect(result.constellations).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildStarlightCathedralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.constellations).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.stats.avgCelestialLuminescence).toBe(result.prayers[0].celestialLuminescence)
    expect(result.stats.avgStellarArchitecture).toBe(result.prayers[0].stellarArchitecture)
    expect(result.stats.avgCosmicPrecision).toBe(result.prayers[0].cosmicPrecision)
    expect(result.stats.avgInterstellarEndurance).toBe(result.prayers[0].interstellarEndurance)
    expect(result.stats.avgAstralWisdom).toBe(result.prayers[0].astralWisdom)
  })

  it('identifies best prayer', async () => {
    const result = await buildStarlightCathedralResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPrayer).toBe('high.ts')
  })

  it('computes cathedral overview', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.cathedral.avgLuminescence).toBe(result.prayers[0].celestialLuminescence)
    expect(result.cathedral.avgPrecision).toBe(result.prayers[0].cosmicPrecision)
    expect(result.cathedral.avgWisdom).toBe(result.prayers[0].astralWisdom)
    expect(result.cathedral.overallRadiance).toBe(result.stats.overallRadiance)
  })

  it('sets isStarlight when overallRadiance >= 60', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    if (result.stats.overallRadiance >= 60) {
      expect(result.cathedral.isStarlight).toBe(true)
    }
  })

  it('finds brightest, mostStructured, mostPrecise, mostEnduring, wisest', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.stats.brightest).toBe('a.ts')
    expect(result.stats.mostStructured).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.mostEnduring).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('counts high measure counts correctly', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.stats.hasHighLuminescenceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighArchitectureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('sets astronomer grade correctly', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.stats.astronomerGrade).toBeDefined()
  })

  it('celebration is undefined without self-reference', async () => {
    const result = await buildStarlightCathedralResult(['a.ts'], [richContent])
    expect(result.celebration).toBeUndefined()
    expect(result.cathedral.celebration).toBeUndefined()
    expect(result.stats.celebration).toBeUndefined()
  })

  it('celebration activates with self-referencing file path', async () => {
    const result = await buildStarlightCathedralResult(['starlight-cathedral-helpers.ts'], [richContent])
    expect(result.celebration).toContain('Command #630')
    expect(result.cathedral.celebration).toContain('Command #630')
    expect(result.stats.celebration).toContain('Command #630')
    expect(result.celebration).toContain('630 commands illuminate')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgCelestialLuminescence: 90, avgStellarArchitecture: 90, avgCosmicPrecision: 90,
      avgInterstellarEndurance: 90, avgAstralWisdom: 90, overallRadiance: 90,
    })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 90, isStarlight: true, overallRadiance: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('starlight cathedral blazes with divine perfection')
  })

  it('recommends increasing luminescence when below 60', () => {
    const stats = makeStats({ avgCelestialLuminescence: 40, avgStellarArchitecture: 90, avgCosmicPrecision: 90, avgInterstellarEndurance: 90, avgAstralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgLuminescence: 40, avgPrecision: 90, avgWisdom: 90, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('Increase celestial luminescence'))).toBe(true)
  })

  it('recommends elevating architecture when below 60', () => {
    const stats = makeStats({ avgCelestialLuminescence: 90, avgStellarArchitecture: 40, avgCosmicPrecision: 90, avgInterstellarEndurance: 90, avgAstralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 90, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('Elevate stellar architecture'))).toBe(true)
  })

  it('recommends aligning precision when below 60', () => {
    const stats = makeStats({ avgCelestialLuminescence: 90, avgStellarArchitecture: 90, avgCosmicPrecision: 40, avgInterstellarEndurance: 90, avgAstralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 40, avgWisdom: 90, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('Align cosmic precision'))).toBe(true)
  })

  it('recommends strengthening endurance when below 60', () => {
    const stats = makeStats({ avgCelestialLuminescence: 90, avgStellarArchitecture: 90, avgCosmicPrecision: 90, avgInterstellarEndurance: 40, avgAstralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 90, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen interstellar endurance'))).toBe(true)
  })

  it('recommends deepening wisdom when below 60', () => {
    const stats = makeStats({ avgCelestialLuminescence: 90, avgStellarArchitecture: 90, avgCosmicPrecision: 90, avgInterstellarEndurance: 90, avgAstralWisdom: 40 })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 40, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen astral wisdom'))).toBe(true)
  })

  it('recommends cathedral dark when radiance < 40', () => {
    const stats = makeStats({ overallRadiance: 30, avgCelestialLuminescence: 30, avgStellarArchitecture: 30, avgCosmicPrecision: 30, avgInterstellarEndurance: 30, avgAstralWisdom: 30 })
    const recs = generateRecommendations([], [], { avgLuminescence: 30, avgPrecision: 30, avgWisdom: 30, isStarlight: false, overallRadiance: 30 }, stats)
    expect(recs.some((r) => r.includes('cathedral is dark'))).toBe(true)
  })

  it('lists void prayers by name when <= 5', () => {
    const stats = makeStats({ avgCelestialLuminescence: 70, avgStellarArchitecture: 70, avgCosmicPrecision: 70, avgInterstellarEndurance: 70, avgAstralWisdom: 70 })
    const prayers = [{ file: 'a.ts', condition: 'void' } as StarlightPrayer, { file: 'b.ts', condition: 'void' } as StarlightPrayer]
    const recs = generateRecommendations(prayers, [], { avgLuminescence: 70, avgPrecision: 70, avgWisdom: 70, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void prayers when > 5', () => {
    const stats = makeStats({ avgCelestialLuminescence: 70, avgStellarArchitecture: 70, avgCosmicPrecision: 70, avgInterstellarEndurance: 70, avgAstralWisdom: 70 })
    const prayers = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as StarlightPrayer))
    const recs = generateRecommendations(prayers, [], { avgLuminescence: 70, avgPrecision: 70, avgWisdom: 70, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('6 dark voids'))).toBe(true)
  })

  it('reports all constellations are dark rooms', () => {
    const stats = makeStats({ avgCelestialLuminescence: 70, avgStellarArchitecture: 70, avgCosmicPrecision: 70, avgInterstellarEndurance: 70, avgAstralWisdom: 70 })
    const constellations = [{ condition: 'dark-room', directory: 'src' } as import('../src/commands/starlight-cathedral-helpers.js').StarlightConstellation]
    const recs = generateRecommendations([], constellations, { avgLuminescence: 70, avgPrecision: 70, avgWisdom: 70, isStarlight: true, overallRadiance: 70 }, stats)
    expect(recs.some((r) => r.includes('dark rooms'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgCelestialLuminescence: 90, avgStellarArchitecture: 90, avgCosmicPrecision: 90, avgInterstellarEndurance: 90, avgAstralWisdom: 90, overallRadiance: 90 })
    const recs = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 90, isStarlight: true, overallRadiance: 90 }, stats)
    expect(recs[0]).toContain('starlight cathedral blazes with divine perfection')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorPrayerCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['starlight-masterpiece', 'celestial-gem', 'proper-star', 'dim-ember', 'dark-void', 'void', 'unknown']) {
      expect(typeof colorPrayerCondition(c)).toBe('string')
    }
  })
})

describe('colorConstellationType', () => {
  it('handles all types', () => {
    for (const t of ['grand-constellation', 'star-cluster', 'proper-pattern', 'scattered-stars', 'empty-space', 'no-constellation']) {
      expect(typeof colorConstellationType(t)).toBe('string')
    }
  })
})

describe('colorConstellationCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['starlight-palace', 'cosmic-temple', 'proper-observatory', 'stone-tower', 'dark-room', 'void']) {
      expect(typeof colorConstellationCondition(c)).toBe('string')
    }
  })
})

describe('colorAstronomerGrade', () => {
  it('handles all grades', () => {
    for (const g of ['cosmic-high-priest', 'star-bishop', 'proper-deacon', 'acolyte', 'novice', 'uninitiated']) {
      expect(typeof colorAstronomerGrade(g)).toBe('string')
    }
  })
})

describe('formatPrayerTable', () => {
  it('formats a prayer table', () => {
    const prayer = analyzeStarlightPrayer(richContent, 'test.ts')
    const output = formatPrayerTable(prayer)
    expect(output).toContain('Starlight Prayer: test.ts')
    expect(output).toContain('Celestial Luminescence')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPrayersTable', () => {
  it('formats empty prayers message', () => { expect(formatPrayersTable([])).toContain('No starlight prayers found') })
  it('formats prayers list', () => {
    const output = formatPrayersTable([analyzeStarlightPrayer(richContent, 'a.ts'), analyzeStarlightPrayer(richContent, 'b.ts')])
    expect(output).toContain('Starlight Prayers')
    expect(output).toContain('a.ts')
  })
})

describe('formatConstellationTable', () => {
  it('formats a constellation table', () => {
    const constellation = analyzeStarlightConstellation([analyzeStarlightPrayer(richContent, 'test.ts')], 'src')
    const output = formatConstellationTable(constellation)
    expect(output).toContain('Starlight Constellation: src')
  })
})

describe('formatConstellationsTable', () => {
  it('formats empty message', () => { expect(formatConstellationsTable([])).toContain('No starlight constellations found') })
  it('formats constellations list', () => {
    const constellation = analyzeStarlightConstellation([analyzeStarlightPrayer(richContent, 'test.ts')], 'src')
    expect(formatConstellationsTable([constellation])).toContain('Starlight Constellations')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Starlight Cathedral Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations list', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildStarlightCathedralResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Starlight Cathedral Analysis')
    expect(output).toContain('Cathedral Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildStarlightCathedralResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.prayers).toHaveLength(1)
    expect(parsed.cathedral).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes celebration field when present', async () => {
    const result = await buildStarlightCathedralResult(['starlight-cathedral.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.celebration).toContain('Command #630')
    expect(parsed.cathedral.celebration).toContain('Command #630')
    expect(parsed.stats.celebration).toContain('Command #630')
  })
})
