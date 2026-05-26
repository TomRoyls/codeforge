import { describe, expect, it } from 'vitest'

import {
  analyzeStellarAltar,
  analyzeStellarTemple,
  buildStellarPantheonResult,
  classifyDeityGrade,
  classifyStellarCondition,
  classifyTempleCondition,
  classifyTempleType,
  generateRecommendations,
  measureAligning,
  measureDesigning,
  measureRevealing,
  measureSurviving,
  measureUnderstanding,
} from '../src/commands/stellar-pantheon-helpers.js'
import type { StellarPantheonResult } from '../src/commands/stellar-pantheon-helpers.js'
import {
  colorDeityGrade,
  colorScore,
  colorStellarCondition,
  colorTempleCondition,
  colorTempleType,
  formatAltarsTable,
  formatAltarTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatTemplesTable,
  formatTempleTable,
} from '../src/commands/stellar-pantheon-format-helpers.js'

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

const richArch = measureDesigning(richContent).architecture
const richPrec = measureAligning(richContent).precision
const richRes = measureSurviving(richContent).resilience
const richClr = measureRevealing(richContent).clarity
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<StellarPantheonResult['stats']> = {}): StellarPantheonResult['stats'] {
  return {
    totalFiles: 1,
    totalTemples: 1,
    avgDivineArchitecture: 50,
    avgConstellationPrecision: 50,
    avgSupernovaResilience: 50,
    avgCosmicClarity: 50,
    avgCelestialWisdom: 50,
    stellarMasterpieceCount: 0,
    divineConstellationCount: 0,
    properStarCount: 0,
    dimEmberCount: 0,
    darkVoidCount: 0,
    voidCount: 0,
    hasHighArchitectureCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighClarityCount: 1,
    hasHighWisdomCount: 1,
    overallDivinity: 50,
    deityGrade: 'proper-demiurge',
    bestAltar: 'a.ts',
    mostArchitectural: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    clearest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureDesigning ───────────────────────────────────

describe('measureDesigning', () => {
  it('scores rich content highly', () => {
    const result = measureDesigning(richContent)
    expect(result.architecture).toBeGreaterThan(60)
    expect(result.hasHighArchitecture).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDesigning(emptyContent).architecture).toBeLessThan(richArch)
  })

  it('detects hasWellStructured (class/interface/type)', () => {
    expect(measureDesigning(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disorganized = 3; const tangled = 4; const spaghetti = 5'
    const result = measureDesigning(content)
    expect(result.chaoticCount).toBe(5)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('counts monolithic keywords', () => {
    const content = 'const monolithic = 1; const god.object = 2; const mega = 3'
    const result = measureDesigning(content)
    expect(result.monolithicCount).toBe(3)
    expect(result.hasNoMonolithic).toBe(false)
  })

  it('detects hasModular (import/export)', () => {
    expect(measureDesigning(richContent).hasModular).toBe(true)
  })

  it('detects hasOrganized (type annotations)', () => {
    expect(measureDesigning(richContent).hasOrganized).toBe(true)
  })

  it('detects hasElegant (no any)', () => {
    expect(measureDesigning(richContent).hasElegant).toBe(true)
  })

  it('detects hasMagnificent (async/await/Promise)', () => {
    expect(measureDesigning(richContent).hasMagnificent).toBe(true)
  })

  it('detects hasGrand (JSDoc)', () => {
    expect(measureDesigning(richContent).hasGrand).toBe(true)
  })

  it('detects hasDivine (function/arrow/return)', () => {
    expect(measureDesigning(richContent).hasDivine).toBe(true)
  })

  it('classifies temple correctly for high scores', () => {
    const result = measureDesigning(richContent)
    expect(['galactic-temple', 'star-cathedral', 'proper-shrine']).toContain(result.temple)
  })

  it('classifies temple correctly for low scores', () => {
    expect(measureDesigning(emptyContent).temple).not.toBe('galactic-temple')
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
    expect(measureAligning(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureAligning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureAligning(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureAligning(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureAligning(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureAligning(richContent).hasCrisp).toBe(true)
  })

  it('detects hasCalibrated (try/catch/if)', () => {
    expect(measureAligning(richContent).hasCalibrated).toBe(true)
  })

  it('detects hasSynchronized (function/arrow/return)', () => {
    expect(measureAligning(richContent).hasSynchronized).toBe(true)
  })

  it('detects hasConnected (no eval/Function)', () => {
    expect(measureAligning(richContent).hasConnected).toBe(true)
  })

  it('classifies stars correctly for high scores', () => {
    const result = measureAligning(richContent)
    expect(['grand-constellation', 'star-chain', 'proper-pattern']).toContain(result.stars)
  })

  it('classifies stars correctly for low scores', () => {
    expect(measureAligning(emptyContent).stars).not.toBe('grand-constellation')
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

  it('detects hasImmortal (async/await/Promise)', () => {
    expect(measureSurviving(richContent).hasImmortal).toBe(true)
  })

  it('detects hasIndestructible (no hack/workaround/kludge)', () => {
    expect(measureSurviving(richContent).hasIndestructible).toBe(true)
  })

  it('classifies remnant correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['neutron-star', 'pulsar-core', 'proper-remnant']).toContain(result.remnant)
  })

  it('classifies remnant correctly for low scores', () => {
    expect(measureSurviving(emptyContent).remnant).not.toBe('neutron-star')
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
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureRevealing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureRevealing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasSelfDocumenting (type annotations)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasTransparent (no any)', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureRevealing(richContent).hasOpen).toBe(true)
  })

  it('classifies void correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['hubble-clarity', 'deep-field', 'proper-vision']).toContain(result.void)
  })

  it('classifies void correctly for low scores', () => {
    expect(measureRevealing(emptyContent).void).not.toBe('hubble-clarity')
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

  it('detects hasComprehensive (try/catch/if)', () => {
    expect(measureUnderstanding(richContent).hasComprehensive).toBe(true)
  })

  it('detects hasTranscendent (no unused/dead/obsolete/deprecated)', () => {
    expect(measureUnderstanding(richContent).hasTranscendent).toBe(true)
  })

  it('detects hasOmniscient (function/arrow/return)', () => {
    expect(measureUnderstanding(richContent).hasOmniscient).toBe(true)
  })

  it('classifies cosmos correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['cosmic-deity', 'star-oracle', 'proper-astronomer']).toContain(result.cosmos)
  })

  it('classifies cosmos correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cosmos).not.toBe('cosmic-deity')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyStellarCondition', () => {
  it('returns stellar-masterpiece for 90+', () => {
    expect(classifyStellarCondition(90)).toBe('stellar-masterpiece')
    expect(classifyStellarCondition(95)).toBe('stellar-masterpiece')
  })

  it('returns divine-constellation for 75-89', () => {
    expect(classifyStellarCondition(75)).toBe('divine-constellation')
  })

  it('returns proper-star for 60-74', () => {
    expect(classifyStellarCondition(60)).toBe('proper-star')
  })

  it('returns dim-ember for 40-59', () => {
    expect(classifyStellarCondition(40)).toBe('dim-ember')
  })

  it('returns dark-void for 20-39', () => {
    expect(classifyStellarCondition(20)).toBe('dark-void')
  })

  it('returns void below 20', () => {
    expect(classifyStellarCondition(0)).toBe('void')
    expect(classifyStellarCondition(10)).toBe('void')
  })
})

describe('classifyTempleType', () => {
  it('returns no-temple for empty altars', () => {
    expect(classifyTempleType([])).toBe('no-temple')
  })

  it('returns grand-pantheon for avg >= 85', () => {
    const altars = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyTempleType(altars)).toBe('grand-pantheon')
  })

  it('returns empty-pedestal for low avg', () => {
    const altars = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyTempleType(altars)).toBe('empty-pedestal')
  })
})

describe('classifyTempleCondition', () => {
  it('returns stellar-palace for 85+', () => {
    expect(classifyTempleCondition(85)).toBe('stellar-palace')
  })

  it('returns void below 15', () => {
    expect(classifyTempleCondition(5)).toBe('void')
  })
})

describe('classifyDeityGrade', () => {
  it('returns cosmic-deity for 80+', () => {
    expect(classifyDeityGrade(80)).toBe('cosmic-deity')
  })

  it('returns stardust below 20', () => {
    expect(classifyDeityGrade(5)).toBe('stardust')
  })

  it('returns star-god for 65-79', () => {
    expect(classifyDeityGrade(65)).toBe('star-god')
  })

  it('returns proper-demiurge for 50-64', () => {
    expect(classifyDeityGrade(50)).toBe('proper-demiurge')
  })

  it('returns mortal-builder for 35-49', () => {
    expect(classifyDeityGrade(35)).toBe('mortal-builder')
  })

  it('returns apprentice for 20-34', () => {
    expect(classifyDeityGrade(20)).toBe('apprentice')
  })
})

// ─── analyzeStellarAltar ────────────────────────────────

describe('analyzeStellarAltar', () => {
  it('creates an altar with all 5 measures', () => {
    const altar = analyzeStellarAltar(richContent, 'app.ts')
    expect(altar.file).toBe('app.ts')
    expect(typeof altar.divineArchitecture).toBe('number')
    expect(typeof altar.constellationPrecision).toBe('number')
    expect(typeof altar.supernovaResilience).toBe('number')
    expect(typeof altar.cosmicClarity).toBe('number')
    expect(typeof altar.celestialWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const altar = analyzeStellarAltar(richContent, 'app.ts')
    const expected = Math.round(
      altar.divineArchitecture * 0.2 +
      altar.constellationPrecision * 0.2 +
      altar.supernovaResilience * 0.2 +
      altar.cosmicClarity * 0.2 +
      altar.celestialWisdom * 0.2,
    )
    expect(altar.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const altar = analyzeStellarAltar(richContent, 'app.ts')
    expect(altar.condition).toBe(classifyStellarCondition(altar.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richAltar = analyzeStellarAltar(richContent, 'rich.ts')
    const emptyAltar = analyzeStellarAltar(emptyContent, 'empty.ts')
    expect(richAltar.qualityScore).toBeGreaterThan(emptyAltar.qualityScore)
  })

  it('scores rich content higher than minimal', () => {
    const richAltar = analyzeStellarAltar(richContent, 'rich.ts')
    const minAltar = analyzeStellarAltar(minimalContent, 'min.ts')
    expect(richAltar.qualityScore).toBeGreaterThan(minAltar.qualityScore)
  })
})

// ─── analyzeStellarTemple ───────────────────────────────

describe('analyzeStellarTemple', () => {
  it('returns empty temple for no altars', () => {
    const temple = analyzeStellarTemple([], 'src')
    expect(temple.directory).toBe('src')
    expect(temple.altars).toEqual([])
    expect(temple.templeType).toBe('no-temple')
    expect(temple.condition).toBe('void')
  })

  it('computes averages from altars', () => {
    const altars = [analyzeStellarAltar(richContent, 'a.ts'), analyzeStellarAltar(richContent, 'b.ts')]
    const temple = analyzeStellarTemple(altars, 'src')
    expect(temple.avgArchitecture).toBeGreaterThan(0)
    expect(temple.avgPrecision).toBeGreaterThan(0)
    expect(temple.avgWisdom).toBeGreaterThan(0)
  })

  it('counts stellar masterpieces', () => {
    const altar = analyzeStellarAltar(richContent, 'a.ts')
    const temple = analyzeStellarTemple([altar], 'src')
    expect(typeof temple.stellarMasterpieceCount).toBe('number')
  })
})

// ─── buildStellarPantheonResult ─────────────────────────

describe('buildStellarPantheonResult', () => {
  it('returns full result structure', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    expect(result.altars).toHaveLength(1)
    expect(result.temples).toHaveLength(1)
    expect(result.cosmos).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into temples', async () => {
    const result = await buildStellarPantheonResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.temples.length).toBe(2)
  })

  it('computes cosmos overview', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    expect(result.cosmos.avgArchitecture).toBeGreaterThan(0)
    expect(result.cosmos.isStellar).toBe(true)
    expect(result.cosmos.overallDivinity).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildStellarPantheonResult([], [])
    expect(result.altars).toHaveLength(0)
    expect(result.temples).toHaveLength(0)
    expect(result.cosmos.overallDivinity).toBe(0)
    expect(result.cosmos.isStellar).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    const total = result.stats.stellarMasterpieceCount +
      result.stats.divineConstellationCount +
      result.stats.properStarCount +
      result.stats.dimEmberCount +
      result.stats.darkVoidCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    expect(result.stats.hasHighArchitectureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best altar and top performers', async () => {
    const result = await buildStellarPantheonResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestAltar).toBeTruthy()
    expect(result.stats.mostArchitectural).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes deity grade from overall divinity', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    expect(result.stats.deityGrade).toBe(classifyDeityGrade(result.stats.overallDivinity))
  })

  it('sets celebration when self-referencing file path is included', async () => {
    const result = await buildStellarPantheonResult(
      ['src/stellar-pantheon-helpers.ts'],
      [richContent],
    )
    expect(result.celebration).toContain('Command #650')
    expect(result.cosmos.celebration).toContain('Command #650')
    expect(result.stats.celebration).toContain('Command #650')
  })

  it('does not set celebration for non-self-referencing files', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    expect(result.celebration).toBeUndefined()
    expect(result.cosmos.celebration).toBeUndefined()
    expect(result.stats.celebration).toBeUndefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgDivineArchitecture: 90,
      avgConstellationPrecision: 90,
      avgSupernovaResilience: 90,
      avgCosmicClarity: 90,
      avgCelestialWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgArchitecture: 90, avgPrecision: 90, avgWisdom: 90, isStellar: true, overallDivinity: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('galactic temple')
  })

  it('recommends architecture when < 60', () => {
    const stats = makeStats({ avgDivineArchitecture: 50 })
    const result = generateRecommendations([], [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('divine architecture') || r.includes('galactic-temple'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgConstellationPrecision: 50 })
    const result = generateRecommendations([], [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('constellation precision') || r.includes('grand-constellation'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgSupernovaResilience: 50 })
    const result = generateRecommendations([], [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('supernova resilience') || r.includes('neutron-star'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgCosmicClarity: 50 })
    const result = generateRecommendations([], [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('cosmic clarity') || r.includes('hubble-clarity'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgCelestialWisdom: 50 })
    const result = generateRecommendations([], [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('celestial wisdom') || r.includes('cosmic-deity'))).toBe(true)
  })

  it('warns about fallen pantheon when overallDivinity < 40', () => {
    const stats = makeStats({ overallDivinity: 30 })
    const result = generateRecommendations([], [], { avgArchitecture: 30, avgPrecision: 30, avgWisdom: 30, isStellar: false, overallDivinity: 30 }, stats)
    expect(result.some((r) => r.includes('fallen'))).toBe(true)
  })

  it('lists void altars by name when <= 5', () => {
    const altars = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(altars, [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void altars when > 5', () => {
    const altars = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(altars, [], { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('6 dark voids'))).toBe(true)
  })

  it('warns when all temples are poor', () => {
    const temples = [{ condition: 'empty-field' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], temples as Array<{ condition: string }>, { avgArchitecture: 50, avgPrecision: 50, avgWisdom: 50, isStellar: false, overallDivinity: 50 }, stats)
    expect(result.some((r) => r.includes('empty fields'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgDivineArchitecture: 70,
      avgConstellationPrecision: 70,
      avgSupernovaResilience: 70,
      avgCosmicClarity: 70,
      avgCelestialWisdom: 70,
      overallDivinity: 70,
    })
    const result = generateRecommendations([], [], { avgArchitecture: 70, avgPrecision: 70, avgWisdom: 70, isStellar: true, overallDivinity: 70 }, stats)
    expect(result.some((r) => r.includes('cosmic brilliance'))).toBe(true)
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

describe('colorStellarCondition', () => {
  it('colors stellar-masterpiece', () => {
    expect(typeof colorStellarCondition('stellar-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorStellarCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorStellarCondition('unknown')).toBe('string')
  })
})

describe('colorTempleType', () => {
  it('colors grand-pantheon', () => {
    expect(typeof colorTempleType('grand-pantheon')).toBe('string')
  })

  it('colors no-temple', () => {
    expect(typeof colorTempleType('no-temple')).toBe('string')
  })
})

describe('colorTempleCondition', () => {
  it('colors stellar-palace', () => {
    expect(typeof colorTempleCondition('stellar-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorTempleCondition('void')).toBe('string')
  })
})

describe('colorDeityGrade', () => {
  it('colors cosmic-deity', () => {
    expect(typeof colorDeityGrade('cosmic-deity')).toBe('string')
  })

  it('colors stardust', () => {
    expect(typeof colorDeityGrade('stardust')).toBe('string')
  })
})

describe('formatAltarTable', () => {
  it('formats an altar with all measures', () => {
    const altar = analyzeStellarAltar(richContent, 'app.ts')
    const output = formatAltarTable(altar)
    expect(output).toContain('Stellar Altar: app.ts')
    expect(output).toContain('Divine Architecture')
    expect(output).toContain('Constellation Precision')
    expect(output).toContain('Supernova Resilience')
    expect(output).toContain('Cosmic Clarity')
    expect(output).toContain('Celestial Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatAltarsTable', () => {
  it('shows no altars message for empty array', () => {
    expect(formatAltarsTable([])).toContain('No stellar altars')
  })

  it('lists altars in output', () => {
    const altars = [analyzeStellarAltar(richContent, 'a.ts')]
    expect(formatAltarsTable(altars)).toContain('a.ts')
  })
})

describe('formatTempleTable', () => {
  it('formats a temple with all fields', () => {
    const altars = [analyzeStellarAltar(richContent, 'a.ts')]
    const temple = analyzeStellarTemple(altars, 'src')
    const output = formatTempleTable(temple)
    expect(output).toContain('Stellar Temple: src')
    expect(output).toContain('Altars')
    expect(output).toContain('Avg Architecture')
  })
})

describe('formatTemplesTable', () => {
  it('shows no temples message for empty array', () => {
    expect(formatTemplesTable([])).toContain('No stellar temples')
  })

  it('lists temples in output', () => {
    const altars = [analyzeStellarAltar(richContent, 'a.ts')]
    const temple = analyzeStellarTemple(altars, 'src')
    expect(formatTemplesTable([temple])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Stellar Pantheon Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Deity Grade')
    expect(output).toContain('Best Altar')
  })

  it('includes celebration when present', async () => {
    const result = await buildStellarPantheonResult(['stellar-pantheon.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Command #650')
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
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Stellar Pantheon Analysis')
    expect(output).toContain('Cosmos Overview')
    expect(output).toContain('Recommendations')
  })

  it('includes celebration for self-referencing', async () => {
    const result = await buildStellarPantheonResult(['stellar-pantheon.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Command #650')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildStellarPantheonResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.altars).toHaveLength(1)
    expect(parsed.cosmos).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes celebration in JSON when self-referencing', async () => {
    const result = await buildStellarPantheonResult(['stellar-pantheon.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.celebration).toContain('Command #650')
    expect(parsed.cosmos.celebration).toContain('Command #650')
    expect(parsed.stats.celebration).toContain('Command #650')
  })
})
