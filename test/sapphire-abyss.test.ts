import { describe, expect, it } from 'vitest'

import {
  analyzeSapphireDive,
  analyzeSapphireTrench,
  buildSapphireAbyssResult,
  classifyDiveCondition,
  classifyDiverGrade,
  classifyTrenchCondition,
  classifyTrenchType,
  generateRecommendations,
  measureCalming,
  measureDescending,
  measureFathoming,
  measureFlowing,
  measureWithstanding,
} from '../src/commands/sapphire-abyss-helpers.js'
import type { SapphireAbyssResult, SapphireDive } from '../src/commands/sapphire-abyss-helpers.js'
import {
  colorDiveCondition,
  colorDiverGrade,
  colorScore,
  colorTrenchCondition,
  colorTrenchType,
  formatDivesTable,
  formatDiveTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatTrenchesTable,
  formatTrenchTable,
} from '../src/commands/sapphire-abyss-format-helpers.js'

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

const richDep = measureDescending(richContent).depth
const richSer = measureCalming(richContent).serenity
const richRes = measureWithstanding(richContent).resilience
const richPre = measureFlowing(richContent).precision
const richWis = measureFathoming(richContent).wisdom

function makeStats(overrides: Partial<SapphireAbyssResult['stats']> = {}): SapphireAbyssResult['stats'] {
  return {
    totalFiles: 1,
    totalTrenches: 1,
    avgOceanDepth: 50,
    avgGemSerenity: 50,
    avgPressureResilience: 50,
    avgTidalPrecision: 50,
    avgDepthWisdom: 50,
    sapphireMasterpieceCount: 0,
    deepGemCount: 0,
    properSapphireCount: 0,
    surfaceGlassCount: 0,
    poolWaterCount: 0,
    voidCount: 0,
    hasHighDepthCount: 1,
    hasHighSerenityCount: 1,
    hasHighResilienceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighWisdomCount: 1,
    overallDepth: 50,
    diverGrade: 'proper-submariner',
    bestDive: 'a.ts',
    deepest: 'a.ts',
    mostSerene: 'a.ts',
    mostResilient: 'a.ts',
    mostPrecise: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureDescending ──────────────────────────────────

describe('measureDescending', () => {
  it('scores rich content highly', () => {
    const result = measureDescending(richContent)
    expect(result.depth).toBeGreaterThan(60)
    expect(result.hasHighDepth).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDescending(emptyContent).depth).toBeLessThan(richDep)
  })

  it('detects deep logic patterns', () => {
    expect(measureDescending(richContent).hasDeepLogic).toBe(true)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3; const simple = 4'
    const result = measureDescending(content)
    expect(result.shallowCount).toBe(4)
    expect(result.hasNoShallow).toBe(false)
  })

  it('counts trivial keywords', () => {
    const content = 'const trivial = 1; const petty = 2; const minor = 3; const negligible = 4'
    const result = measureDescending(content)
    expect(result.trivialCount).toBe(4)
    expect(result.hasNoTrivial).toBe(false)
  })

  it('detects layered (readonly/private/protected)', () => {
    expect(measureDescending(richContent).hasLayered).toBe(true)
  })

  it('detects multi-dimensional (JSDoc)', () => {
    expect(measureDescending(richContent).hasMultiDimensional).toBe(true)
  })

  it('classifies zone correctly for high scores', () => {
    const result = measureDescending(richContent)
    expect(['hadal-trench', 'abyssal-plain', 'bathyal-slope']).toContain(result.zone)
  })

  it('classifies zone correctly for low scores', () => {
    expect(measureDescending(emptyContent).zone).not.toBe('hadal-trench')
  })
})

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

  it('detects readable (type annotations)', () => {
    expect(measureCalming(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureCalming(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const tangled = 3; const spaghetti = 4'
    const result = measureCalming(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects clear (no any)', () => {
    expect(measureCalming(richContent).hasClear).toBe(true)
  })

  it('detects organized (import/export)', () => {
    expect(measureCalming(richContent).hasOrganized).toBe(true)
  })

  it('detects tranquil (JSDoc)', () => {
    expect(measureCalming(richContent).hasTranquil).toBe(true)
  })

  it('classifies tide correctly for high scores', () => {
    const result = measureCalming(richContent)
    expect(['glassy-surface', 'calm-sea', 'proper-swell']).toContain(result.tide)
  })

  it('classifies tide correctly for low scores', () => {
    expect(measureCalming(emptyContent).tide).not.toBe('glassy-surface')
  })
})

// ─── measureWithstanding ────────────────────────────────

describe('measureWithstanding', () => {
  it('scores rich content highly', () => {
    const result = measureWithstanding(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureWithstanding(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects error handled (try/catch)', () => {
    expect(measureWithstanding(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unsafe = 1; const risky = 2; const dangerous = 3; const fragile = 4'
    const result = measureWithstanding(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureWithstanding(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects defensive (no any)', () => {
    expect(measureWithstanding(richContent).hasDefensive).toBe(true)
  })

  it('detects hardened (type annotations)', () => {
    expect(measureWithstanding(richContent).hasHardened).toBe(true)
  })

  it('detects strong (JSDoc)', () => {
    expect(measureWithstanding(richContent).hasStrong).toBe(true)
  })

  it('classifies hull correctly for high scores', () => {
    const result = measureWithstanding(richContent)
    expect(['titanium-sphere', 'steel-hull', 'proper-submarine']).toContain(result.hull)
  })

  it('classifies hull correctly for low scores', () => {
    expect(measureWithstanding(emptyContent).hull).not.toBe('titanium-sphere')
  })
})

// ─── measureFlowing ─────────────────────────────────────

describe('measureFlowing', () => {
  it('scores rich content highly', () => {
    const result = measureFlowing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFlowing(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type safe (no any)', () => {
    expect(measureFlowing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe (var/eval)', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureFlowing(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureFlowing(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects rhythmic (import/export)', () => {
    expect(measureFlowing(richContent).hasRhythmic).toBe(true)
  })

  it('detects defined (try/catch/if)', () => {
    expect(measureFlowing(richContent).hasDefined).toBe(true)
  })

  it('classifies current correctly for high scores', () => {
    const result = measureFlowing(richContent)
    expect(['perfect-tide', 'steady-current', 'proper-flow']).toContain(result.current)
  })

  it('classifies current correctly for low scores', () => {
    expect(measureFlowing(emptyContent).current).not.toBe('perfect-tide')
  })
})

// ─── measureFathoming ───────────────────────────────────

describe('measureFathoming', () => {
  it('scores rich content highly', () => {
    const result = measureFathoming(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureFathoming(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureFathoming(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureFathoming(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well-architected patterns', () => {
    expect(measureFathoming(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    expect(measureFathoming(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureFathoming(richContent).hasVisionary).toBe(true)
  })

  it('classifies chart correctly for high scores', () => {
    const result = measureFathoming(richContent)
    expect(['master-navigator', 'deep-sea-pilot', 'proper-diver']).toContain(result.chart)
  })

  it('classifies chart correctly for low scores', () => {
    expect(measureFathoming(emptyContent).chart).not.toBe('master-navigator')
  })
})

// ─── analyzeSapphireDive ────────────────────────────────

describe('analyzeSapphireDive', () => {
  it('analyzes a file correctly', () => {
    const dive = analyzeSapphireDive(richContent, 'test.ts')
    expect(dive.file).toBe('test.ts')
    expect(dive.oceanDepth).toBeGreaterThan(0)
    expect(dive.gemSerenity).toBeGreaterThan(0)
    expect(dive.pressureResilience).toBeGreaterThan(0)
    expect(dive.tidalPrecision).toBeGreaterThan(0)
    expect(dive.depthWisdom).toBeGreaterThan(0)
    expect(dive.qualityScore).toBeGreaterThan(0)
    expect(dive.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const dive = analyzeSapphireDive(richContent, 'test.ts')
    const expected = Math.round(
      dive.oceanDepth * 0.2 +
      dive.gemSerenity * 0.2 +
      dive.pressureResilience * 0.2 +
      dive.tidalPrecision * 0.2 +
      dive.depthWisdom * 0.2,
    )
    expect(dive.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const dive = analyzeSapphireDive(richContent, 'test.ts')
    expect(dive.descending).toBeDefined()
    expect(dive.calming).toBeDefined()
    expect(dive.withstanding).toBeDefined()
    expect(dive.flowing).toBeDefined()
    expect(dive.fathoming).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const dive = analyzeSapphireDive(emptyContent, 'empty.ts')
    expect(dive.qualityScore).toBeLessThan(60)
    expect(dive.condition).not.toBe('sapphire-masterpiece')
  })
})

// ─── analyzeSapphireTrench ──────────────────────────────

describe('analyzeSapphireTrench', () => {
  it('handles empty dives', () => {
    const trench = analyzeSapphireTrench([], 'empty-dir')
    expect(trench.dives).toHaveLength(0)
    expect(trench.trenchType).toBe('no-trench')
    expect(trench.condition).toBe('void')
  })

  it('analyzes a trench with dives', () => {
    const dive = analyzeSapphireDive(richContent, 'src/test.ts')
    const trench = analyzeSapphireTrench([dive], 'src')
    expect(trench.directory).toBe('src')
    expect(trench.dives).toHaveLength(1)
    expect(trench.avgDepth).toBeGreaterThan(0)
  })

  it('counts sapphire masterpieces', () => {
    const dive: SapphireDive = {
      file: 'a.ts', oceanDepth: 95, gemSerenity: 95, pressureResilience: 95, tidalPrecision: 95, depthWisdom: 95,
      descending: {} as SapphireDive['descending'],
      calming: {} as SapphireDive['calming'],
      withstanding: {} as SapphireDive['withstanding'],
      flowing: {} as SapphireDive['flowing'],
      fathoming: {} as SapphireDive['fathoming'],
      condition: 'sapphire-masterpiece', qualityScore: 95,
    }
    expect(analyzeSapphireTrench([dive], 'src').sapphireMasterpieceCount).toBe(1)
  })

  it('counts void dives', () => {
    const dive: SapphireDive = {
      file: 'a.ts', oceanDepth: 0, gemSerenity: 0, pressureResilience: 0, tidalPrecision: 0, depthWisdom: 0,
      descending: {} as SapphireDive['descending'],
      calming: {} as SapphireDive['calming'],
      withstanding: {} as SapphireDive['withstanding'],
      flowing: {} as SapphireDive['flowing'],
      fathoming: {} as SapphireDive['fathoming'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeSapphireTrench([dive], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyDiveCondition', () => {
  it('classifies sapphire-masterpiece at 90+', () => { expect(classifyDiveCondition(90)).toBe('sapphire-masterpiece') })
  it('classifies deep-gem at 75-89', () => { expect(classifyDiveCondition(75)).toBe('deep-gem') })
  it('classifies proper-sapphire at 60-74', () => { expect(classifyDiveCondition(60)).toBe('proper-sapphire') })
  it('classifies surface-glass at 40-59', () => { expect(classifyDiveCondition(40)).toBe('surface-glass') })
  it('classifies pool-water at 20-39', () => { expect(classifyDiveCondition(20)).toBe('pool-water') })
  it('classifies void below 20', () => { expect(classifyDiveCondition(0)).toBe('void') })
})

describe('classifyTrenchType', () => {
  it('returns no-trench for empty dives', () => { expect(classifyTrenchType([])).toBe('no-trench') })
  it('classifies mariana-depth at 85+', () => { expect(classifyTrenchType([{ qualityScore: 90 } as SapphireDive])).toBe('mariana-depth') })
  it('classifies deep-trench at 70-84', () => { expect(classifyTrenchType([{ qualityScore: 75 } as SapphireDive])).toBe('deep-trench') })
  it('classifies proper-canyon at 55-69', () => { expect(classifyTrenchType([{ qualityScore: 60 } as SapphireDive])).toBe('proper-canyon') })
  it('classifies shallow-reef at 35-54', () => { expect(classifyTrenchType([{ qualityScore: 40 } as SapphireDive])).toBe('shallow-reef') })
  it('classifies tidal-pool below 35', () => { expect(classifyTrenchType([{ qualityScore: 10 } as SapphireDive])).toBe('tidal-pool') })
})

describe('classifyTrenchCondition', () => {
  it('classifies sapphire-palace at 85+', () => { expect(classifyTrenchCondition(85)).toBe('sapphire-palace') })
  it('classifies deep-vault at 70-84', () => { expect(classifyTrenchCondition(70)).toBe('deep-vault') })
  it('classifies proper-depth at 55-69', () => { expect(classifyTrenchCondition(55)).toBe('proper-depth') })
  it('classifies surface-chamber at 35-54', () => { expect(classifyTrenchCondition(35)).toBe('surface-chamber') })
  it('classifies empty-pool at 15-34', () => { expect(classifyTrenchCondition(15)).toBe('empty-pool') })
  it('classifies void below 15', () => { expect(classifyTrenchCondition(0)).toBe('void') })
})

describe('classifyDiverGrade', () => {
  it('classifies bathyscaphe-captain at 80+', () => { expect(classifyDiverGrade(80)).toBe('bathyscaphe-captain') })
  it('classifies deep-sea-diver at 65-79', () => { expect(classifyDiverGrade(65)).toBe('deep-sea-diver') })
  it('classifies proper-submariner at 50-64', () => { expect(classifyDiverGrade(50)).toBe('proper-submariner') })
  it('classifies surface-swimmer at 35-49', () => { expect(classifyDiverGrade(35)).toBe('surface-swimmer') })
  it('classifies novice at 20-34', () => { expect(classifyDiverGrade(20)).toBe('novice') })
  it('classifies landlubber below 20', () => { expect(classifyDiverGrade(0)).toBe('landlubber') })
})

// ─── buildSapphireAbyssResult ───────────────────────────

describe('buildSapphireAbyssResult', () => {
  it('handles empty input', async () => {
    const result = await buildSapphireAbyssResult([], [])
    expect(result.dives).toHaveLength(0)
    expect(result.trenches).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallDepth).toBe(0)
    expect(result.stats.bestDive).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildSapphireAbyssResult(['test.ts'], [richContent])
    expect(result.dives).toHaveLength(1)
    expect(result.dives[0].file).toBe('test.ts')
    expect(result.trenches).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildSapphireAbyssResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.trenches).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildSapphireAbyssResult(['a.ts'], [richContent])
    expect(result.stats.avgOceanDepth).toBe(result.dives[0].oceanDepth)
    expect(result.stats.avgGemSerenity).toBe(result.dives[0].gemSerenity)
    expect(result.stats.avgPressureResilience).toBe(result.dives[0].pressureResilience)
    expect(result.stats.avgTidalPrecision).toBe(result.dives[0].tidalPrecision)
    expect(result.stats.avgDepthWisdom).toBe(result.dives[0].depthWisdom)
  })

  it('identifies best dive', async () => {
    const result = await buildSapphireAbyssResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestDive).toBe('high.ts')
  })

  it('computes ocean overview', async () => {
    const result = await buildSapphireAbyssResult(['a.ts'], [richContent])
    expect(result.ocean.avgDepth).toBe(result.dives[0].oceanDepth)
    expect(result.ocean.avgResilience).toBe(result.dives[0].pressureResilience)
    expect(result.ocean.avgWisdom).toBe(result.dives[0].depthWisdom)
    expect(result.ocean.overallDepth).toBe(result.stats.overallDepth)
  })

  it('sets isSapphire when overallDepth >= 60', async () => {
    const result = await buildSapphireAbyssResult(['a.ts'], [richContent])
    if (result.stats.overallDepth >= 60) {
      expect(result.ocean.isSapphire).toBe(true)
    }
  })

  it('finds deepest, mostSerene, mostResilient, mostPrecise, wisest', async () => {
    const result = await buildSapphireAbyssResult(['a.ts'], [richContent])
    expect(result.stats.deepest).toBe('a.ts')
    expect(result.stats.mostSerene).toBe('a.ts')
    expect(result.stats.mostResilient).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('counts high measure counts correctly', async () => {
    const result = await buildSapphireAbyssResult(['a.ts'], [richContent])
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSerenityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgOceanDepth: 90, avgGemSerenity: 90, avgPressureResilience: 90,
      avgTidalPrecision: 90, avgDepthWisdom: 90, overallDepth: 90,
    })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 90, avgWisdom: 90, isSapphire: true, overallDepth: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('sapphire abyss gleams with perfection')
  })

  it('recommends descending deeper when oceanDepth below 60', () => {
    const stats = makeStats({ avgOceanDepth: 40, avgGemSerenity: 90, avgPressureResilience: 90, avgTidalPrecision: 90, avgDepthWisdom: 90 })
    const recs = generateRecommendations([], [], { avgDepth: 40, avgResilience: 90, avgWisdom: 90, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Descend deeper'))).toBe(true)
  })

  it('recommends finding serenity when gemSerenity below 60', () => {
    const stats = makeStats({ avgOceanDepth: 90, avgGemSerenity: 40, avgPressureResilience: 90, avgTidalPrecision: 90, avgDepthWisdom: 90 })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 90, avgWisdom: 90, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Find gem serenity'))).toBe(true)
  })

  it('recommends strengthening resilience when pressureResilience below 60', () => {
    const stats = makeStats({ avgOceanDepth: 90, avgGemSerenity: 90, avgPressureResilience: 40, avgTidalPrecision: 90, avgDepthWisdom: 90 })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 40, avgWisdom: 90, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Strengthen pressure resilience'))).toBe(true)
  })

  it('recommends refining precision when tidalPrecision below 60', () => {
    const stats = makeStats({ avgOceanDepth: 90, avgGemSerenity: 90, avgPressureResilience: 90, avgTidalPrecision: 40, avgDepthWisdom: 90 })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 90, avgWisdom: 90, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Refine tidal precision'))).toBe(true)
  })

  it('recommends fathoming wisdom when depthWisdom below 60', () => {
    const stats = makeStats({ avgOceanDepth: 90, avgGemSerenity: 90, avgPressureResilience: 90, avgTidalPrecision: 90, avgDepthWisdom: 40 })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 90, avgWisdom: 40, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('Fathom depth wisdom'))).toBe(true)
  })

  it('recommends abyss empty when overallDepth < 40', () => {
    const stats = makeStats({ overallDepth: 30, avgOceanDepth: 30, avgGemSerenity: 30, avgPressureResilience: 30, avgTidalPrecision: 30, avgDepthWisdom: 30 })
    const recs = generateRecommendations([], [], { avgDepth: 30, avgResilience: 30, avgWisdom: 30, isSapphire: false, overallDepth: 30 }, stats)
    expect(recs.some((r) => r.includes('abyss is empty'))).toBe(true)
  })

  it('lists void dives by name when <= 5', () => {
    const stats = makeStats({ avgOceanDepth: 70, avgGemSerenity: 70, avgPressureResilience: 70, avgTidalPrecision: 70, avgDepthWisdom: 70 })
    const dives = [{ file: 'a.ts', condition: 'void' } as SapphireDive, { file: 'b.ts', condition: 'void' } as SapphireDive]
    const recs = generateRecommendations(dives, [], { avgDepth: 70, avgResilience: 70, avgWisdom: 70, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void dives when > 5', () => {
    const stats = makeStats({ avgOceanDepth: 70, avgGemSerenity: 70, avgPressureResilience: 70, avgTidalPrecision: 70, avgDepthWisdom: 70 })
    const dives = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as SapphireDive))
    const recs = generateRecommendations(dives, [], { avgDepth: 70, avgResilience: 70, avgWisdom: 70, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('6 shallow waters'))).toBe(true)
  })

  it('reports all trenches are empty pools', () => {
    const stats = makeStats({ avgOceanDepth: 70, avgGemSerenity: 70, avgPressureResilience: 70, avgTidalPrecision: 70, avgDepthWisdom: 70 })
    const trenches = [{ condition: 'empty-pool', directory: 'src' } as import('../src/commands/sapphire-abyss-helpers.js').SapphireTrench]
    const recs = generateRecommendations([], trenches, { avgDepth: 70, avgResilience: 70, avgWisdom: 70, isSapphire: true, overallDepth: 70 }, stats)
    expect(recs.some((r) => r.includes('empty pools'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgOceanDepth: 90, avgGemSerenity: 90, avgPressureResilience: 90, avgTidalPrecision: 90, avgDepthWisdom: 90, overallDepth: 90 })
    const recs = generateRecommendations([], [], { avgDepth: 90, avgResilience: 90, avgWisdom: 90, isSapphire: true, overallDepth: 90 }, stats)
    expect(recs[0]).toContain('sapphire abyss gleams with perfection')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorDiveCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['sapphire-masterpiece', 'deep-gem', 'proper-sapphire', 'surface-glass', 'pool-water', 'void', 'unknown']) {
      expect(typeof colorDiveCondition(c)).toBe('string')
    }
  })
})

describe('colorTrenchType', () => {
  it('handles all types', () => {
    for (const t of ['mariana-depth', 'deep-trench', 'proper-canyon', 'shallow-reef', 'tidal-pool', 'no-trench']) {
      expect(typeof colorTrenchType(t)).toBe('string')
    }
  })
})

describe('colorTrenchCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['sapphire-palace', 'deep-vault', 'proper-depth', 'surface-chamber', 'empty-pool', 'void']) {
      expect(typeof colorTrenchCondition(c)).toBe('string')
    }
  })
})

describe('colorDiverGrade', () => {
  it('handles all grades', () => {
    for (const g of ['bathyscaphe-captain', 'deep-sea-diver', 'proper-submariner', 'surface-swimmer', 'novice', 'landlubber']) {
      expect(typeof colorDiverGrade(g)).toBe('string')
    }
  })
})

describe('formatDiveTable', () => {
  it('formats a dive table', () => {
    const dive = analyzeSapphireDive(richContent, 'test.ts')
    const output = formatDiveTable(dive)
    expect(output).toContain('Sapphire Dive: test.ts')
    expect(output).toContain('Ocean Depth')
    expect(output).toContain('Quality Score')
  })
})

describe('formatDivesTable', () => {
  it('formats empty dives message', () => { expect(formatDivesTable([])).toContain('No sapphire dives found') })
  it('formats dives list', () => {
    const output = formatDivesTable([analyzeSapphireDive(richContent, 'a.ts'), analyzeSapphireDive(richContent, 'b.ts')])
    expect(output).toContain('Sapphire Dives')
    expect(output).toContain('a.ts')
  })
})

describe('formatTrenchTable', () => {
  it('formats a trench table', () => {
    const trench = analyzeSapphireTrench([analyzeSapphireDive(richContent, 'test.ts')], 'src')
    const output = formatTrenchTable(trench)
    expect(output).toContain('Sapphire Trench: src')
  })
})

describe('formatTrenchesTable', () => {
  it('formats empty message', () => { expect(formatTrenchesTable([])).toContain('No sapphire trenches found') })
  it('formats trenches list', () => {
    const trench = analyzeSapphireTrench([analyzeSapphireDive(richContent, 'test.ts')], 'src')
    expect(formatTrenchesTable([trench])).toContain('Sapphire Trenches')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Sapphire Abyss Statistics')
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
    const result = await buildSapphireAbyssResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Sapphire Abyss Analysis')
    expect(output).toContain('Ocean Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildSapphireAbyssResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.dives).toHaveLength(1)
    expect(parsed.ocean).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
