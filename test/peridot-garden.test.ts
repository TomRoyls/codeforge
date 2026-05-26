import { describe, expect, it } from 'vitest'

import {
  analyzePeridotBloom,
  analyzePeridotOrchard,
  buildPeridotGardenResult,
  classifyGardenerGrade,
  classifyOrchardCondition,
  classifyOrchardType,
  classifyPeridotCondition,
  generateRecommendations,
  measureGrowing,
  measurePruning,
  measureReaping,
  measureRooting,
  measureTending,
} from '../src/commands/peridot-garden-helpers.js'
import type { PeridotGardenResult } from '../src/commands/peridot-garden-helpers.js'
import {
  colorGardenerGrade,
  colorOrchardCondition,
  colorOrchardType,
  colorPeridotCondition,
  colorScore,
  formatBloomTable,
  formatBloomsTable,
  formatOrchardTable,
  formatOrchardsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/peridot-garden-format-helpers.js'

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

const richVit = measureGrowing(richContent).vitality
const richSer = measureTending(richContent).serenity
const richPre = measurePruning(richContent).precision
const richRes = measureRooting(richContent).resilience
const richWis = measureReaping(richContent).wisdom

function makeStats(overrides: Partial<PeridotGardenResult['stats']> = {}): PeridotGardenResult['stats'] {
  return {
    totalFiles: 1,
    totalOrchards: 1,
    avgOliveVitality: 50,
    avgGardenSerenity: 50,
    avgGrowthPrecision: 50,
    avgRootResilience: 50,
    avgHarvestWisdom: 50,
    peridotMasterpieceCount: 0,
    goldenBloomCount: 0,
    properPeridotCount: 0,
    paleStoneCount: 0,
    rawMineralCount: 0,
    voidCount: 0,
    hasHighVitalityCount: 1,
    hasHighSerenityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallFertility: 50,
    gardenerGrade: 'proper-gardener',
    bestBloom: 'a.ts',
    mostVital: 'a.ts',
    mostSerene: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureGrowing ─────────────────────────────────────

describe('measureGrowing', () => {
  it('scores rich content highly', () => {
    const result = measureGrowing(richContent)
    expect(result.vitality).toBeGreaterThan(60)
    expect(result.hasHighVitality).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGrowing(emptyContent).vitality).toBeLessThan(richVit)
  })

  it('detects alive (class/interface/type)', () => {
    expect(measureGrowing(richContent).hasAlive).toBe(true)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const lifeless = 2; const inert = 3; const dormant = 4'
    const result = measureGrowing(content)
    expect(result.deadCount).toBe(4)
    expect(result.hasNoDead).toBe(false)
  })

  it('counts stagnant keywords', () => {
    const content = 'const stagnant = 1; const stale = 2; const decayed = 3; const rotted = 4'
    const result = measureGrowing(content)
    expect(result.stagnantCount).toBe(4)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects dynamic (import/export)', () => {
    expect(measureGrowing(richContent).hasDynamic).toBe(true)
  })

  it('detects evolving (async/await/Promise)', () => {
    expect(measureGrowing(richContent).hasEvolving).toBe(true)
  })

  it('detects thriving (type annotations)', () => {
    expect(measureGrowing(richContent).hasThriving).toBe(true)
  })

  it('detects vibrant (JSDoc)', () => {
    expect(measureGrowing(richContent).hasVibrant).toBe(true)
  })

  it('classifies bloom correctly for high scores', () => {
    const result = measureGrowing(richContent)
    expect(['full-bloom', 'healthy-growth', 'proper-sprout']).toContain(result.bloom)
  })

  it('classifies bloom correctly for low scores', () => {
    expect(measureGrowing(emptyContent).bloom).not.toBe('full-bloom')
  })
})

// ─── measureTending ─────────────────────────────────────

describe('measureTending', () => {
  it('scores rich content highly', () => {
    const result = measureTending(richContent)
    expect(result.serenity).toBeGreaterThan(60)
    expect(result.hasHighSerenity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTending(emptyContent).serenity).toBeLessThan(richSer)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureTending(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disordered = 3; const jumbled = 4'
    const result = measureTending(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects organized (import/export)', () => {
    expect(measureTending(richContent).hasOrganized).toBe(true)
  })

  it('detects tidy (readonly/private/protected)', () => {
    expect(measureTending(richContent).hasTidy).toBe(true)
  })

  it('detects neat (JSDoc)', () => {
    expect(measureTending(richContent).hasNeat).toBe(true)
  })

  it('detects tranquil (async/await/Promise)', () => {
    expect(measureTending(richContent).hasTranquil).toBe(true)
  })

  it('classifies garden correctly for high scores', () => {
    const result = measureTending(richContent)
    expect(['zen-garden', 'well-tended', 'proper-plot']).toContain(result.garden)
  })

  it('classifies garden correctly for low scores', () => {
    expect(measureTending(emptyContent).garden).not.toBe('zen-garden')
  })
})

// ─── measurePruning ─────────────────────────────────────

describe('measurePruning', () => {
  it('scores rich content highly', () => {
    const result = measurePruning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePruning(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type-safe (no any)', () => {
    expect(measurePruning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measurePruning(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measurePruning(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measurePruning(richContent).hasExact).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measurePruning(richContent).hasCrisp).toBe(true)
  })

  it('detects measured (async/await/Promise)', () => {
    expect(measurePruning(richContent).hasMeasured).toBe(true)
  })

  it('classifies trim correctly for high scores', () => {
    const result = measurePruning(richContent)
    expect(['bonsai-master', 'expert-pruner', 'proper-shears']).toContain(result.trim)
  })

  it('classifies trim correctly for low scores', () => {
    expect(measurePruning(emptyContent).trim).not.toBe('bonsai-master')
  })
})

// ─── measureRooting ─────────────────────────────────────

describe('measureRooting', () => {
  it('scores rich content highly', () => {
    const result = measureRooting(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRooting(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects error-handled (try/catch)', () => {
    expect(measureRooting(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureRooting(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureRooting(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects tested (try/catch)', () => {
    expect(measureRooting(richContent).hasTested).toBe(true)
  })

  it('detects stable (class/interface/type)', () => {
    expect(measureRooting(richContent).hasStable).toBe(true)
  })

  it('detects firm (async/await/Promise)', () => {
    expect(measureRooting(richContent).hasFirm).toBe(true)
  })

  it('classifies root correctly for high scores', () => {
    const result = measureRooting(richContent)
    expect(['ancient-oak', 'deep-rooted', 'proper-taproot']).toContain(result.root)
  })

  it('classifies root correctly for low scores', () => {
    expect(measureRooting(emptyContent).root).not.toBe('ancient-oak')
  })
})

// ─── measureReaping ─────────────────────────────────────

describe('measureReaping', () => {
  it('scores rich content highly', () => {
    const result = measureReaping(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureReaping(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
    expect(measureReaping(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureReaping(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureReaping(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects principled (no any)', () => {
    expect(measureReaping(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureReaping(richContent).hasVisionary).toBe(true)
  })

  it('detects mature (import/export)', () => {
    expect(measureReaping(richContent).hasMature).toBe(true)
  })

  it('detects insightful (JSDoc)', () => {
    expect(measureReaping(richContent).hasInsightful).toBe(true)
  })

  it('classifies yield correctly for high scores', () => {
    const result = measureReaping(richContent)
    expect(['abundant-harvest', 'fruitful-tree', 'proper-crop']).toContain(result.yield)
  })

  it('classifies yield correctly for low scores', () => {
    expect(measureReaping(emptyContent).yield).not.toBe('abundant-harvest')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPeridotCondition', () => {
  it('returns peridot-masterpiece for 90+', () => {
    expect(classifyPeridotCondition(90)).toBe('peridot-masterpiece')
    expect(classifyPeridotCondition(95)).toBe('peridot-masterpiece')
  })

  it('returns golden-bloom for 75-89', () => {
    expect(classifyPeridotCondition(75)).toBe('golden-bloom')
  })

  it('returns proper-peridot for 60-74', () => {
    expect(classifyPeridotCondition(60)).toBe('proper-peridot')
  })

  it('returns pale-stone for 40-59', () => {
    expect(classifyPeridotCondition(40)).toBe('pale-stone')
  })

  it('returns raw-mineral for 20-39', () => {
    expect(classifyPeridotCondition(20)).toBe('raw-mineral')
  })

  it('returns void below 20', () => {
    expect(classifyPeridotCondition(0)).toBe('void')
    expect(classifyPeridotCondition(10)).toBe('void')
  })
})

describe('classifyOrchardType', () => {
  it('returns no-orchard for empty blooms', () => {
    expect(classifyOrchardType([])).toBe('no-orchard')
  })

  it('returns lush-garden for avg >= 85', () => {
    const blooms = [{ qualityScore: 90 }] as any
    expect(classifyOrchardType(blooms)).toBe('lush-garden')
  })

  it('returns empty-pot for low avg', () => {
    const blooms = [{ qualityScore: 10 }] as any
    expect(classifyOrchardType(blooms)).toBe('empty-pot')
  })
})

describe('classifyOrchardCondition', () => {
  it('returns peridot-palace for 85+', () => {
    expect(classifyOrchardCondition(85)).toBe('peridot-palace')
  })

  it('returns void below 15', () => {
    expect(classifyOrchardCondition(5)).toBe('void')
  })
})

describe('classifyGardenerGrade', () => {
  it('returns master-gardener for 80+', () => {
    expect(classifyGardenerGrade(80)).toBe('master-gardener')
  })

  it('returns weed-puller below 20', () => {
    expect(classifyGardenerGrade(5)).toBe('weed-puller')
  })

  it('returns expert-horticulturist for 65-79', () => {
    expect(classifyGardenerGrade(65)).toBe('expert-horticulturist')
  })

  it('returns proper-gardener for 50-64', () => {
    expect(classifyGardenerGrade(50)).toBe('proper-gardener')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyGardenerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyGardenerGrade(20)).toBe('novice')
  })
})

// ─── analyzePeridotBloom ────────────────────────────────

describe('analyzePeridotBloom', () => {
  it('creates a bloom with all 5 measures', () => {
    const bloom = analyzePeridotBloom(richContent, 'app.ts')
    expect(bloom.file).toBe('app.ts')
    expect(typeof bloom.oliveVitality).toBe('number')
    expect(typeof bloom.gardenSerenity).toBe('number')
    expect(typeof bloom.growthPrecision).toBe('number')
    expect(typeof bloom.rootResilience).toBe('number')
    expect(typeof bloom.harvestWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const bloom = analyzePeridotBloom(richContent, 'app.ts')
    const expected = Math.round(
      bloom.oliveVitality * 0.2 +
      bloom.gardenSerenity * 0.2 +
      bloom.growthPrecision * 0.2 +
      bloom.rootResilience * 0.2 +
      bloom.harvestWisdom * 0.2,
    )
    expect(bloom.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const bloom = analyzePeridotBloom(richContent, 'app.ts')
    expect(bloom.condition).toBe(classifyPeridotCondition(bloom.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richBloom = analyzePeridotBloom(richContent, 'rich.ts')
    const emptyBloom = analyzePeridotBloom(emptyContent, 'empty.ts')
    expect(richBloom.qualityScore).toBeGreaterThan(emptyBloom.qualityScore)
  })
})

// ─── analyzePeridotOrchard ──────────────────────────────

describe('analyzePeridotOrchard', () => {
  it('returns empty orchard for no blooms', () => {
    const orchard = analyzePeridotOrchard([], 'src')
    expect(orchard.directory).toBe('src')
    expect(orchard.blooms).toEqual([])
    expect(orchard.orchardType).toBe('no-orchard')
    expect(orchard.condition).toBe('void')
  })

  it('computes averages from blooms', () => {
    const blooms = [analyzePeridotBloom(richContent, 'a.ts'), analyzePeridotBloom(richContent, 'b.ts')]
    const orchard = analyzePeridotOrchard(blooms, 'src')
    expect(orchard.avgVitality).toBeGreaterThan(0)
    expect(orchard.avgPrecision).toBeGreaterThan(0)
    expect(orchard.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildPeridotGardenResult ───────────────────────────

describe('buildPeridotGardenResult', () => {
  it('returns full result structure', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.orchards).toHaveLength(1)
    expect(result.harvest).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into orchards', async () => {
    const result = await buildPeridotGardenResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.orchards.length).toBe(2)
  })

  it('computes harvest overview', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    expect(result.harvest.avgVitality).toBeGreaterThan(0)
    expect(result.harvest.isPeridot).toBe(true)
    expect(result.harvest.overallFertility).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildPeridotGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.orchards).toHaveLength(0)
    expect(result.harvest.overallFertility).toBe(0)
    expect(result.harvest.isPeridot).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    const total = result.stats.peridotMasterpieceCount +
      result.stats.goldenBloomCount +
      result.stats.properPeridotCount +
      result.stats.paleStoneCount +
      result.stats.rawMineralCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSerenityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best bloom and top performers', async () => {
    const result = await buildPeridotGardenResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestBloom).toBeTruthy()
    expect(result.stats.mostVital).toBeTruthy()
    expect(result.stats.mostSerene).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes gardener grade from overall fertility', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    expect(result.stats.gardenerGrade).toBe(classifyGardenerGrade(result.stats.overallFertility))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgOliveVitality: 90,
      avgGardenSerenity: 90,
      avgGrowthPrecision: 90,
      avgRootResilience: 90,
      avgHarvestWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgVitality: 90, avgPrecision: 90, avgWisdom: 90, isPeridot: true, overallFertility: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('master vitality')
  })

  it('recommends vitality when < 60', () => {
    const stats = makeStats({ avgOliveVitality: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('vitality') || r.includes('olive'))).toBe(true)
  })

  it('recommends serenity when < 60', () => {
    const stats = makeStats({ avgGardenSerenity: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('serenity') || r.includes('garden'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgGrowthPrecision: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('growth'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgRootResilience: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('root'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgHarvestWisdom: 50 })
    const result = generateRecommendations([], [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('harvest'))).toBe(true)
  })

  it('warns about barren garden when fertility < 40', () => {
    const stats = makeStats({ overallFertility: 30 })
    const result = generateRecommendations([], [], { avgVitality: 30, avgPrecision: 30, avgWisdom: 30, isPeridot: false, overallFertility: 30 }, stats)
    expect(result.some((r) => r.includes('barren'))).toBe(true)
  })

  it('lists void blooms by name when <= 5', () => {
    const blooms = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(blooms, [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void blooms when > 5', () => {
    const blooms = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(blooms, [], { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('6 raw minerals'))).toBe(true)
  })

  it('warns when all orchards are poor', () => {
    const orchards = [{ condition: 'empty-field' as const, orchardType: 'empty-pot' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], orchards as any, { avgVitality: 50, avgPrecision: 50, avgWisdom: 50, isPeridot: false, overallFertility: 50 }, stats)
    expect(result.some((r) => r.includes('empty fields'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgOliveVitality: 70,
      avgGardenSerenity: 70,
      avgGrowthPrecision: 70,
      avgRootResilience: 70,
      avgHarvestWisdom: 70,
      overallFertility: 70,
    })
    const result = generateRecommendations([], [], { avgVitality: 70, avgPrecision: 70, avgWisdom: 70, isPeridot: true, overallFertility: 70 }, stats)
    expect(result.some((r) => r.includes('flourishes beautifully'))).toBe(true)
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

describe('colorPeridotCondition', () => {
  it('colors peridot-masterpiece', () => {
    expect(typeof colorPeridotCondition('peridot-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPeridotCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorPeridotCondition('unknown')).toBe('string')
  })
})

describe('colorOrchardType', () => {
  it('colors lush-garden', () => {
    expect(typeof colorOrchardType('lush-garden')).toBe('string')
  })

  it('colors no-orchard', () => {
    expect(typeof colorOrchardType('no-orchard')).toBe('string')
  })
})

describe('colorOrchardCondition', () => {
  it('colors peridot-palace', () => {
    expect(typeof colorOrchardCondition('peridot-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorOrchardCondition('void')).toBe('string')
  })
})

describe('colorGardenerGrade', () => {
  it('colors master-gardener', () => {
    expect(typeof colorGardenerGrade('master-gardener')).toBe('string')
  })

  it('colors weed-puller', () => {
    expect(typeof colorGardenerGrade('weed-puller')).toBe('string')
  })
})

describe('formatBloomTable', () => {
  it('formats a bloom with all measures', () => {
    const bloom = analyzePeridotBloom(richContent, 'app.ts')
    const output = formatBloomTable(bloom)
    expect(output).toContain('Peridot Bloom: app.ts')
    expect(output).toContain('Olive Vitality')
    expect(output).toContain('Garden Serenity')
    expect(output).toContain('Growth Precision')
    expect(output).toContain('Root Resilience')
    expect(output).toContain('Harvest Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatBloomsTable', () => {
  it('shows no blooms message for empty array', () => {
    expect(formatBloomsTable([])).toContain('No peridot blooms')
  })

  it('lists blooms in output', () => {
    const blooms = [analyzePeridotBloom(richContent, 'a.ts')]
    expect(formatBloomsTable(blooms)).toContain('a.ts')
  })
})

describe('formatOrchardTable', () => {
  it('formats an orchard with all fields', () => {
    const blooms = [analyzePeridotBloom(richContent, 'a.ts')]
    const orchard = analyzePeridotOrchard(blooms, 'src')
    const output = formatOrchardTable(orchard)
    expect(output).toContain('Peridot Orchard: src')
    expect(output).toContain('Blooms')
    expect(output).toContain('Avg Vitality')
  })
})

describe('formatOrchardsTable', () => {
  it('shows no orchards message for empty array', () => {
    expect(formatOrchardsTable([])).toContain('No peridot orchards')
  })

  it('lists orchards in output', () => {
    const blooms = [analyzePeridotBloom(richContent, 'a.ts')]
    const orchard = analyzePeridotOrchard(blooms, 'src')
    expect(formatOrchardsTable([orchard])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Peridot Garden Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gardener Grade')
    expect(output).toContain('Best Bloom')
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
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Peridot Garden Analysis')
    expect(output).toContain('Harvest Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildPeridotGardenResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.harvest).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
