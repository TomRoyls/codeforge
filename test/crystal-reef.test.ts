import { describe, it, expect } from 'vitest'

import {
  measureStructuring,
  measureDiversifying,
  measureEnduring,
  measureClarifying,
  measureKnowing,
  analyzeCoralCrystal,
  analyzeCrystalAtoll,
  classifyCoralCondition,
  classifyAtollType,
  classifyAtollCondition,
  classifyMarineGrade,
  generateRecommendations,
  buildCrystalReefResult,
} from '../src/commands/crystal-reef-helpers.js'

import {
  colorScore,
  colorGrade,
  formatCoralTable,
  formatCoralsTable,
  formatAtollTable,
  formatAtollsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/crystal-reef-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const perfectContent = `export interface Widget<T> {
  readonly id: string
  readonly name: T
}

export abstract class BaseWidget<T> implements Widget<T> {
  abstract doWork(): void

  protected validate(input: T): boolean {
    return true
  }
}

/**
 * Creates a new widget
 * @param id - widget id
 */
export function createWidget<T>(id: string, config: T): Widget<T> {
  return { id, name: config }
}
`

const poorContent = `var x = 1
var y = 2
eval('alert("bad")')
debugger
// TODO: fix this
// HACK: temporary
`

const moderateContent = `export function processItems(items: string[]): string[] {
  return items.map(item => item.trim()).filter(Boolean)
}
`

const richContent = `import { EventEmitter } from 'node:events'
import type { Callback } from './types.js'

export interface Processor<T> {
  process(input: T): Promise<T>
}

export class DataProcessor<T> implements Processor<T> {
  private readonly cache = new Map<string, T>()

  async process(input: T): Promise<T> {
    try {
      const key = JSON.stringify(input)
      const cached = this.cache.get(key)
      if (cached) return cached
      const result = await this.transform(input)
      this.cache.set(key, result)
      return result
    } catch (error) {
      throw new Error('Processing failed')
    }
  }

  protected async transform(input: T): Promise<T> {
    return input
  }
}

export type ProcessorConfig<T> = {
  readonly concurrency: number
  readonly retryCount: number
  readonly transformer?: (input: T) => T
}

export function createProcessor<T>(config: ProcessorConfig<T>): Processor<T> {
  return new DataProcessor<T>()
}
`

// ─── measureStructuring ────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns a valid StructuringMeasure', () => {
    const m = measureStructuring('const x = 1')
    expect(m.structure).toBeGreaterThanOrEqual(0)
    expect(m.structure).toBeLessThanOrEqual(100)
    expect(m.lattice).toBeDefined()
    expect(typeof m.hasHighStructure).toBe('boolean')
    expect(typeof m.hasOrganized).toBe('boolean')
    expect(typeof m.chaoticCount).toBe('number')
    expect(typeof m.monolithicCount).toBe('number')
  })

  it('rewards exports and interfaces', () => {
    const m = measureStructuring('export interface Foo { bar: string }')
    expect(m.structure).toBeGreaterThan(10)
    expect(m.hasOrganized).toBe(false)
    expect(m.hasWellStructured).toBe(false)
  })

  it('penalizes var as chaotic', () => {
    const m = measureStructuring('var x = 1')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('penalizes god files as monolithic', () => {
    const bigContent = Array.from({ length: 350 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const m = measureStructuring(bigContent)
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('classifies lattice correctly', () => {
    const m = measureStructuring(perfectContent)
    expect(m.lattice).toBeOneOf(['perfect-crystal', 'well-formed', 'proper-lattice', 'flawed-crystal', 'amorphous', 'no-structure'])
  })

  it('detects modular imports', () => {
    const m = measureStructuring('import { foo } from "./bar.js"')
    expect(m.hasModular).toBe(true)
    expect(m.hasNoFlat).toBe(true)
  })

  it('detects systematic patterns', () => {
    const m = measureStructuring('export function work(val: string): string { return val }')
    expect(m.hasSystematic).toBe(false)
  })

  it('detects ordered code', () => {
    const m = measureStructuring('export function foo() {} import { bar } from "mod"')
    expect(m.hasOrdered).toBe(true)
  })

  it('detects methodical code', () => {
    const m = measureStructuring('export interface Foo {} export function bar(): void {}')
    expect(m.hasMethodical).toBe(true)
  })
})

// ─── measureDiversifying ───────────────────────────────────────────

describe('measureDiversifying', () => {
  it('returns a valid DiversifyingMeasure', () => {
    const m = measureDiversifying('const x = 1')
    expect(m.diversity).toBeGreaterThanOrEqual(0)
    expect(m.diversity).toBeLessThanOrEqual(100)
    expect(m.reef).toBeDefined()
    expect(typeof m.hasHighDiversity).toBe('boolean')
    expect(typeof m.monotoneCount).toBe('number')
    expect(typeof m.hardcodedCount).toBe('number')
  })

  it('rewards generics and interfaces', () => {
    const m = measureDiversifying('export interface Processor<T> { process(input: T): T }')
    expect(m.diversity).toBeGreaterThan(10)
    expect(m.hasGeneric).toBe(true)
    expect(m.hasExpressive).toBe(true)
  })

  it('penalizes var as monotone', () => {
    const m = measureDiversifying('var x = 1')
    expect(m.monotoneCount).toBeGreaterThan(0)
    expect(m.hasNoMonotone).toBe(false)
  })

  it('detects pipelines as colorful', () => {
    const m = measureDiversifying('const r = [1].map(x => x * 2).filter(Boolean)')
    expect(m.hasColorful).toBe(true)
  })

  it('detects flexible code', () => {
    const m = measureDiversifying('export function foo(x?: string): string | null { return x ?? null }')
    expect(m.hasFlexible).toBe(true)
    expect(m.hasNoSinglePath).toBe(true)
  })

  it('classifies reef correctly', () => {
    const m = measureDiversifying(perfectContent)
    expect(m.reef).toBeOneOf(['great-barrier', 'rich-ecosystem', 'proper-reef', 'small-colony', 'bleached-coral', 'no-diversity'])
  })

  it('detects type handling', () => {
    const m = measureDiversifying('function foo<T>(x: T): T { return x }')
    expect(m.hasTypeHandling).toBe(true)
  })

  it('detects adaptive code', () => {
    const m = measureDiversifying('function foo<T>(x?: T): T | undefined { return x }')
    expect(m.hasAdaptive).toBe(true)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns a valid EnduringMeasure', () => {
    const m = measureEnduring('const x = 1')
    expect(m.resilience).toBeGreaterThanOrEqual(0)
    expect(m.resilience).toBeLessThanOrEqual(100)
    expect(m.tide).toBeDefined()
    expect(typeof m.hasHighResilience).toBe('boolean')
    expect(typeof m.untestedCount).toBe('number')
    expect(typeof m.bareCrashCount).toBe('number')
  })

  it('rewards try/catch and error handling', () => {
    const m = measureEnduring('try { work() } catch (e) { handleError(e) }')
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('penalizes eval as bare crash', () => {
    const m = measureEnduring('eval("alert()")')
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('penalizes debugger', () => {
    const m = measureEnduring('debugger')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects type safety', () => {
    const m = measureEnduring('function foo(): string { return "hello" }')
    expect(m.hasTypeSafe).toBe(false)
  })

  it('detects defensive code', () => {
    const m = measureEnduring('function foo(x?: string): string { return x ?? "default" }')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects future-proof code', () => {
    const m = measureEnduring('export function foo<T>(x: T): T { return x }')
    expect(m.hasFutureProof).toBe(false)
  })

  it('classifies tide correctly', () => {
    const m = measureEnduring(richContent)
    expect(m.tide).toBeOneOf(['tsunami-proof', 'storm-resistant', 'proper-anchor', 'wave-worn', 'washed-away', 'no-resilience'])
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns a valid ClarifyingMeasure', () => {
    const m = measureClarifying('const x = 1')
    expect(m.clarity).toBeGreaterThanOrEqual(0)
    expect(m.clarity).toBeLessThanOrEqual(100)
    expect(m.depth).toBeDefined()
    expect(typeof m.hasHighClarity).toBe('boolean')
    expect(typeof m.crypticCount).toBe('number')
    expect(typeof m.obfuscatedCount).toBe('number')
  })

  it('rewards exports and documentation', () => {
    const m = measureClarifying('/** doc */ export function helper(val: string): string { return val }')
    expect(m.clarity).toBeGreaterThan(10)
    expect(m.hasReadable).toBe(false)
    expect(m.hasClear).toBe(true)
  })

  it('penalizes var as cryptic', () => {
    const m = measureClarifying('var x = 1')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('penalizes eval as cryptic', () => {
    const m = measureClarifying('eval("x")')
    expect(m.crypticCount).toBeGreaterThan(0)
  })

  it('penalizes debugger as obfuscated', () => {
    const m = measureClarifying('debugger')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects self-documenting code', () => {
    const m = measureClarifying('export function process(): void {}')
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects luminous code', () => {
    const m = measureClarifying('/** doc */ export function foo(): void {}')
    expect(m.hasLuminous).toBe(true)
  })

  it('classifies depth correctly', () => {
    const m = measureClarifying(perfectContent)
    expect(m.depth).toBeOneOf(['crystal-water', 'clear-depth', 'proper-visibility', 'murky-water', 'dark-abyss', 'no-clarity'])
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing('const x = 1')
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(m.wisdom).toBeLessThanOrEqual(100)
    expect(m.ocean).toBeDefined()
    expect(typeof m.hasHighWisdom).toBe('boolean')
    expect(typeof m.adHocCount).toBe('number')
    expect(typeof m.hackyCount).toBe('number')
  })

  it('rewards documentation and abstractions', () => {
    const m = measureKnowing('export abstract class Base { abstract doWork(): void }')
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasMature).toBe(true)
  })

  it('penalizes TODO as ad-hoc', () => {
    const m = measureKnowing('// TODO: fix this')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoExperimental).toBe(false)
  })

  it('penalizes hacky casts', () => {
    const m = measureKnowing('const x = data as any')
    expect(m.hackyCount).toBeGreaterThan(0)
    expect(m.hasNoHacky).toBe(false)
  })

  it('detects patterned code', () => {
    const m = measureKnowing('class Foo extends Bar {}')
    expect(m.hasPatterned).toBe(true)
    expect(m.hasProven).toBe(true)
  })

  it('detects principled code', () => {
    const m = measureKnowing('abstract class Base { abstract run(): void }')
    expect(m.hasPrincipled).toBe(true)
  })

  it('classifies ocean correctly', () => {
    const m = measureKnowing(richContent)
    expect(m.ocean).toBeOneOf(['ancient-depths', 'deep-wisdom', 'proper-current', 'surface-knowledge', 'shallow-pool', 'no-wisdom'])
  })
})

// ─── analyzeCoralCrystal ──────────────────────────────────────────

describe('analyzeCoralCrystal', () => {
  it('returns a complete CoralCrystal', () => {
    const c = analyzeCoralCrystal('const x = 1', 'test.ts')
    expect(c.file).toBe('test.ts')
    expect(c.crystallineStructure).toBeGreaterThanOrEqual(0)
    expect(c.coralDiversity).toBeGreaterThanOrEqual(0)
    expect(c.tideResilience).toBeGreaterThanOrEqual(0)
    expect(c.depthClarity).toBeGreaterThanOrEqual(0)
    expect(c.oceanWisdom).toBeGreaterThanOrEqual(0)
    expect(c.qualityScore).toBeGreaterThanOrEqual(0)
    expect(c.condition).toBeDefined()
    expect(c.structuring).toBeDefined()
    expect(c.diversifying).toBeDefined()
    expect(c.enduring).toBeDefined()
    expect(c.clarifying).toBeDefined()
    expect(c.knowing).toBeDefined()
  })

  it('gives high scores to rich content', () => {
    const c = analyzeCoralCrystal(richContent, 'rich.ts')
    expect(c.qualityScore).toBeGreaterThan(40)
    expect(c.condition).not.toBe('dead-zone')
  })

  it('gives low scores to poor content', () => {
    const c = analyzeCoralCrystal(poorContent, 'poor.ts')
    expect(c.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as average of five measures', () => {
    const c = analyzeCoralCrystal(moderateContent, 'mod.ts')
    const expected = Math.round(
      c.crystallineStructure * 0.2 +
      c.coralDiversity * 0.2 +
      c.tideResilience * 0.2 +
      c.depthClarity * 0.2 +
      c.oceanWisdom * 0.2,
    )
    expect(c.qualityScore).toBe(expected)
  })
})

// ─── analyzeCrystalAtoll ──────────────────────────────────────────

describe('analyzeCrystalAtoll', () => {
  it('returns empty atoll for empty array', () => {
    const a = analyzeCrystalAtoll([], 'src')
    expect(a.directory).toBe('src')
    expect(a.corals).toHaveLength(0)
    expect(a.avgStructure).toBe(0)
    expect(a.atollType).toBe('no-atoll')
    expect(a.condition).toBe('void')
  })

  it('aggregates corals correctly', () => {
    const c1 = analyzeCoralCrystal(richContent, 'src/a.ts')
    const c2 = analyzeCoralCrystal(moderateContent, 'src/b.ts')
    const a = analyzeCrystalAtoll([c1, c2], 'src')
    expect(a.corals).toHaveLength(2)
    expect(a.avgStructure).toBe(Math.round((c1.crystallineStructure + c2.crystallineStructure) / 2))
    expect(a.avgDiversity).toBe(Math.round((c1.coralDiversity + c2.coralDiversity) / 2))
    expect(a.avgWisdom).toBe(Math.round((c1.oceanWisdom + c2.oceanWisdom) / 2))
  })

  it('counts pristine reefs and dead zones', () => {
    const c1 = analyzeCoralCrystal(richContent, 'a.ts')
    const c2 = analyzeCoralCrystal(poorContent, 'b.ts')
    const a = analyzeCrystalAtoll([c1, c2], '.')
    expect(a.pristineReefCount + a.deadZoneCount).toBeLessThanOrEqual(2)
  })
})

// ─── classifyCoralCondition ────────────────────────────────────────

describe('classifyCoralCondition', () => {
  it('classifies pristine-reef for 90+', () => {
    expect(classifyCoralCondition(90)).toBe('pristine-reef')
    expect(classifyCoralCondition(100)).toBe('pristine-reef')
  })

  it('classifies healthy-ecosystem for 75-89', () => {
    expect(classifyCoralCondition(75)).toBe('healthy-ecosystem')
    expect(classifyCoralCondition(89)).toBe('healthy-ecosystem')
  })

  it('classifies proper-formation for 60-74', () => {
    expect(classifyCoralCondition(60)).toBe('proper-formation')
    expect(classifyCoralCondition(74)).toBe('proper-formation')
  })

  it('classifies stressed-coral for 40-59', () => {
    expect(classifyCoralCondition(40)).toBe('stressed-coral')
    expect(classifyCoralCondition(59)).toBe('stressed-coral')
  })

  it('classifies bleached-reef for 20-39', () => {
    expect(classifyCoralCondition(20)).toBe('bleached-reef')
    expect(classifyCoralCondition(39)).toBe('bleached-reef')
  })

  it('classifies dead-zone for below 20', () => {
    expect(classifyCoralCondition(0)).toBe('dead-zone')
    expect(classifyCoralCondition(19)).toBe('dead-zone')
  })
})

// ─── classifyAtollType ─────────────────────────────────────────────

describe('classifyAtollType', () => {
  it('returns no-atoll for empty array', () => {
    expect(classifyAtollType([])).toBe('no-atoll')
  })

  it('returns great-barrier for high quality with pristine ratio', () => {
    const corals = Array.from({ length: 10 }, () => analyzeCoralCrystal(richContent, 'a.ts'))
    const result = classifyAtollType(corals)
    expect(result).toBeOneOf(['great-barrier', 'coral-kingdom', 'proper-reef', 'small-atoll', 'sandbar', 'no-atoll'])
  })
})

// ─── classifyAtollCondition ────────────────────────────────────────

describe('classifyAtollCondition', () => {
  it('returns marine-paradise for 85+', () => {
    expect(classifyAtollCondition(85)).toBe('marine-paradise')
    expect(classifyAtollCondition(100)).toBe('marine-paradise')
  })

  it('returns void for below 15', () => {
    expect(classifyAtollCondition(0)).toBe('void')
    expect(classifyAtollCondition(14)).toBe('void')
  })

  it('returns healthy-ocean for 70-84', () => {
    expect(classifyAtollCondition(70)).toBe('healthy-ocean')
  })

  it('returns proper-sea for 55-69', () => {
    expect(classifyAtollCondition(55)).toBe('proper-sea')
  })

  it('returns stressed-waters for 35-54', () => {
    expect(classifyAtollCondition(35)).toBe('stressed-waters')
  })

  it('returns dead-sea for 15-34', () => {
    expect(classifyAtollCondition(15)).toBe('dead-sea')
  })
})

// ─── classifyMarineGrade ───────────────────────────────────────────

describe('classifyMarineGrade', () => {
  it('returns master-oceanographer for 85+', () => {
    expect(classifyMarineGrade(85)).toBe('master-oceanographer')
    expect(classifyMarineGrade(100)).toBe('master-oceanographer')
  })

  it('returns coral-scientist for 70-84', () => {
    expect(classifyMarineGrade(70)).toBe('coral-scientist')
  })

  it('returns marine-biologist for 55-69', () => {
    expect(classifyMarineGrade(55)).toBe('marine-biologist')
  })

  it('returns apprentice for 40-54', () => {
    expect(classifyMarineGrade(40)).toBe('apprentice')
  })

  it('returns novice for 20-39', () => {
    expect(classifyMarineGrade(20)).toBe('novice')
  })

  it('returns landlubber for below 20', () => {
    expect(classifyMarineGrade(0)).toBe('landlubber')
    expect(classifyMarineGrade(19)).toBe('landlubber')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high vitality and no dead zones', () => {
    const corals = [analyzeCoralCrystal(richContent, 'a.ts')]
    const atolls = [analyzeCrystalAtoll(corals, '.')]
    const ocean = { avgStructure: 90, avgDiversity: 90, avgWisdom: 90, isPristine: true, overallVitality: 90 }
    const stats = {
      overallVitality: 90,
      deadZoneCount: 0,
      avgCrystallineStructure: 90,
      avgCoralDiversity: 90,
      avgTideResilience: 90,
      avgDepthClarity: 90,
      avgOceanWisdom: 90,
    } as unknown as import('../src/commands/crystal-reef-helpers.js').CrystalReefResult['stats']
    const recs = generateRecommendations(corals, atolls, ocean, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends structure improvement for low scores', () => {
    const corals = [analyzeCoralCrystal(poorContent, 'bad.ts')]
    const atolls = [analyzeCrystalAtoll(corals, '.')]
    const ocean = { avgStructure: 10, avgDiversity: 10, avgWisdom: 10, isPristine: false, overallVitality: 10 }
    const stats = {
      overallVitality: 10,
      deadZoneCount: 1,
      avgCrystallineStructure: 10,
      avgCoralDiversity: 10,
      avgTideResilience: 10,
      avgDepthClarity: 10,
      avgOceanWisdom: 10,
    } as unknown as import('../src/commands/crystal-reef-helpers.js').CrystalReefResult['stats']
    const recs = generateRecommendations(corals, atolls, ocean, stats)
    expect(recs.length).toBeGreaterThan(1)
  })

  it('returns steady message when all scores are fine', () => {
    const corals = [analyzeCoralCrystal(moderateContent, 'mod.ts')]
    const atolls = [analyzeCrystalAtoll(corals, '.')]
    const ocean = { avgStructure: 70, avgDiversity: 70, avgWisdom: 70, isPristine: false, overallVitality: 70 }
    const stats = {
      overallVitality: 70,
      deadZoneCount: 0,
      avgCrystallineStructure: 70,
      avgCoralDiversity: 70,
      avgTideResilience: 70,
      avgDepthClarity: 70,
      avgOceanWisdom: 70,
    } as unknown as import('../src/commands/crystal-reef-helpers.js').CrystalReefResult['stats']
    const recs = generateRecommendations(corals, atolls, ocean, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildCrystalReefResult ───────────────────────────────────────

describe('buildCrystalReefResult', () => {
  it('returns empty result for no files', async () => {
    const r = await buildCrystalReefResult([], [])
    expect(r.corals).toHaveLength(0)
    expect(r.atolls).toHaveLength(0)
    expect(r.stats.totalFiles).toBe(0)
    expect(r.ocean.overallVitality).toBe(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('returns complete result for single file', async () => {
    const r = await buildCrystalReefResult(['src/a.ts'], [moderateContent])
    expect(r.corals).toHaveLength(1)
    expect(r.atolls).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.bestCoral).toBe('src/a.ts')
    expect(r.stats.mostStructured).toBe('src/a.ts')
    expect(r.stats.mostDiverse).toBe('src/a.ts')
    expect(r.stats.mostResilient).toBe('src/a.ts')
    expect(r.stats.wisest).toBe('src/a.ts')
  })

  it('computes overallVitality as avg of structure, diversity, wisdom', async () => {
    const r = await buildCrystalReefResult(['a.ts', 'b.ts'], [richContent, moderateContent])
    const expectedVitality = Math.round((r.stats.avgCrystallineStructure + r.stats.avgCoralDiversity + r.stats.avgOceanWisdom) / 3)
    expect(r.stats.overallVitality).toBe(expectedVitality)
  })

  it('groups files by directory into atolls', async () => {
    const r = await buildCrystalReefResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [moderateContent, richContent, poorContent],
    )
    expect(r.atolls.length).toBe(2)
  })

  it('counts condition categories', async () => {
    const r = await buildCrystalReefResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    const sum = r.stats.pristineReefCount +
      r.stats.healthyEcosystemCount +
      r.stats.properFormationCount +
      r.stats.stressedCoralCount +
      r.stats.bleachedReefCount +
      r.stats.deadZoneCount
    expect(sum).toBe(2)
  })

  it('computes high-score counts', async () => {
    const r = await buildCrystalReefResult(['a.ts'], [richContent])
    expect(r.stats.hasHighStructureCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighDiversityCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns a string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })

  it('colorGrade returns a string', () => {
    expect(typeof colorGrade('pristine-reef')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })

  it('formatCoralTable produces output', () => {
    const c = analyzeCoralCrystal(moderateContent, 'test.ts')
    const out = formatCoralTable(c)
    expect(out).toContain('test.ts')
    expect(out).toContain('Crystalline Structure')
    expect(out).toContain('Coral Diversity')
    expect(out).toContain('Tide Resilience')
    expect(out).toContain('Depth Clarity')
    expect(out).toContain('Ocean Wisdom')
    expect(out).toContain('Quality Score')
  })

  it('formatCoralsTable handles empty', () => {
    expect(formatCoralsTable([])).toContain('No coral')
  })

  it('formatAtollTable produces output', () => {
    const c = analyzeCoralCrystal(moderateContent, 'test.ts')
    const a = analyzeCrystalAtoll([c], 'src')
    const out = formatAtollTable(a)
    expect(out).toContain('src')
    expect(out).toContain('Avg Structure')
    expect(out).toContain('Atoll Type')
  })

  it('formatAtollsTable handles empty', () => {
    expect(formatAtollsTable([])).toContain('No crystal')
  })

  it('formatStatsTable produces output', async () => {
    const r = await buildCrystalReefResult(['a.ts'], [moderateContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Crystal Reef Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('Overall Vitality')
    expect(out).toContain('Marine Grade')
  })

  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const out = formatRecommendations(['Improve structure'])
    expect(out).toContain('Improve structure')
  })

  it('formatResultTable produces full output', async () => {
    const r = await buildCrystalReefResult(['a.ts'], [moderateContent])
    const out = formatResultTable(r)
    expect(out).toContain('Coral Crystal Analysis')
    expect(out).toContain('Crystal Atolls')
    expect(out).toContain('Crystal Reef Statistics')
    expect(out).toContain('Ocean')
    expect(out).toContain('Recommendations')
  })

  it('formatResultJson produces valid JSON', async () => {
    const r = await buildCrystalReefResult(['a.ts'], [moderateContent])
    const out = formatResultJson(r)
    const parsed = JSON.parse(out)
    expect(parsed.corals).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ocean).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
