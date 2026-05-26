import { describe, expect, it } from 'vitest'

import {
  analyzeIronFortress,
  analyzeIronPlate,
  buildIronBastionResult,
  classifyFortressCondition,
  classifyFortressType,
  classifyPlateCondition,
  classifySmithGrade,
  generateRecommendations,
  measureHammering,
  measureKnowing,
  measureProtecting,
  measureReinforcing,
  measureTempering,
} from '../src/commands/iron-bastion-helpers.js'
import type { IronBastionResult } from '../src/commands/iron-bastion-helpers.js'
import {
  colorFortressCondition,
  colorFortressType,
  colorPlateCondition,
  colorScore,
  colorSmithGrade,
  formatFortressesTable,
  formatFortressTable,
  formatPlatesTable,
  formatPlateTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/iron-bastion-format-helpers.js'

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

const richFort = measureReinforcing(richContent).fortitude
const richRes = measureProtecting(richContent).resistance
const richPre = measureHammering(richContent).precision
const richVit = measureTempering(richContent).vitality
const richWis = measureKnowing(richContent).wisdom

function makeStats(overrides: Partial<IronBastionResult['stats']> = {}): IronBastionResult['stats'] {
  return {
    totalFiles: 1,
    totalFortresses: 1,
    avgStructuralFortitude: 50,
    avgRustResistance: 50,
    avgAnvilPrecision: 50,
    avgForgeVitality: 50,
    avgSteelWisdom: 50,
    ironMasterpieceCount: 0,
    temperedSteelCount: 0,
    properIronCount: 0,
    rustedMetalCount: 0,
    scrapIronCount: 0,
    voidCount: 0,
    hasHighFortitudeCount: 1,
    hasHighResistanceCount: 1,
    hasHighPrecisionCount: 1,
    hasHighVitalityCount: 1,
    hasHighWisdomCount: 1,
    overallStrength: 50,
    smithGrade: 'proper-blacksmith',
    bestPlate: 'a.ts',
    strongest: 'a.ts',
    mostResistant: 'a.ts',
    mostPrecise: 'a.ts',
    mostVital: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureReinforcing ─────────────────────────────────

describe('measureReinforcing', () => {
  it('scores rich content highly', () => {
    const result = measureReinforcing(richContent)
    expect(result.fortitude).toBeGreaterThan(60)
    expect(result.hasHighFortitude).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureReinforcing(emptyContent).fortitude).toBeLessThan(richFort)
  })

  it('detects well-structured (class/interface/type)', () => {
    expect(measureReinforcing(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const tangled = 3; const spaghetti = 4'
    const result = measureReinforcing(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureReinforcing(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects type-safe (no any)', () => {
    expect(measureReinforcing(richContent).hasTypeSafe).toBe(true)
  })

  it('detects solid (type annotations)', () => {
    expect(measureReinforcing(richContent).hasSolid).toBe(true)
  })

  it('detects robust (import/export)', () => {
    expect(measureReinforcing(richContent).hasRobust).toBe(true)
  })

  it('detects strong (readonly/private/protected)', () => {
    expect(measureReinforcing(richContent).hasStrong).toBe(true)
  })

  it('detects durable (JSDoc)', () => {
    expect(measureReinforcing(richContent).hasDurable).toBe(true)
  })

  it('classifies beam correctly for high scores', () => {
    const result = measureReinforcing(richContent)
    expect(['i-beam-grade', 'structural-steel', 'proper-support']).toContain(result.beam)
  })

  it('classifies beam correctly for low scores', () => {
    expect(measureReinforcing(emptyContent).beam).not.toBe('i-beam-grade')
  })
})

// ─── measureProtecting ──────────────────────────────────

describe('measureProtecting', () => {
  it('scores rich content highly', () => {
    const result = measureProtecting(richContent)
    expect(result.resistance).toBeGreaterThan(60)
    expect(result.hasHighResistance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureProtecting(emptyContent).resistance).toBeLessThan(richRes)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const hacky = 2; const hacked = 3'
    const result = measureProtecting(content)
    expect(result.hackCount).toBe(3)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const quickfix = 2; const band-aid = 3; const bandaid = 4'
    const result = measureProtecting(content)
    expect(result.workaroundCount).toBe(4)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects no-todo (no TODO/FIXME)', () => {
    expect(measureProtecting(richContent).hasNoTodo).toBe(true)
  })

  it('detects no-commented-out (no commented console.log)', () => {
    expect(measureProtecting(richContent).hasNoCommentedOut).toBe(true)
  })

  it('detects no-debug-code (no debugger)', () => {
    expect(measureProtecting(richContent).hasNoDebugCode).toBe(true)
  })

  it('detects no-dead-code (no unused/deprecated)', () => {
    expect(measureProtecting(richContent).hasNoDeadCode).toBe(true)
  })

  it('detects clean (no any)', () => {
    expect(measureProtecting(richContent).hasClean).toBe(true)
  })

  it('detects pristine (class/interface/type)', () => {
    expect(measureProtecting(richContent).hasPristine).toBe(true)
  })

  it('classifies coating correctly for high scores', () => {
    const result = measureProtecting(richContent)
    expect(['stainless-steel', 'galvanized-iron', 'proper-coating']).toContain(result.coating)
  })

  it('classifies coating correctly for low scores', () => {
    expect(measureProtecting(emptyContent).coating).not.toBe('stainless-steel')
  })
})

// ─── measureHammering ───────────────────────────────────

describe('measureHammering', () => {
  it('scores rich content highly', () => {
    const result = measureHammering(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureHammering(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects accurate (type annotations)', () => {
    expect(measureHammering(richContent).hasAccurate).toBe(true)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureHammering(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('counts rough keywords', () => {
    const content = 'const rough = 1; const coarse = 2; const crude = 3; const unrefined = 4'
    const result = measureHammering(content)
    expect(result.roughCount).toBe(4)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureHammering(richContent).hasExact).toBe(true)
  })

  it('detects precise (readonly/private/protected)', () => {
    expect(measureHammering(richContent).hasPrecise).toBe(true)
  })

  it('detects polished (no any)', () => {
    expect(measureHammering(richContent).hasPolished).toBe(true)
  })

  it('classifies craft correctly for high scores', () => {
    const result = measureHammering(richContent)
    expect(['master-smith', 'skilled-forge', 'proper-hammer']).toContain(result.craft)
  })

  it('classifies craft correctly for low scores', () => {
    expect(measureHammering(emptyContent).craft).not.toBe('master-smith')
  })
})

// ─── measureTempering ───────────────────────────────────

describe('measureTempering', () => {
  it('scores rich content highly', () => {
    const result = measureTempering(richContent)
    expect(result.vitality).toBeGreaterThan(60)
    expect(result.hasHighVitality).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureTempering(emptyContent).vitality).toBeLessThan(richVit)
  })

  it('detects tested (if/return)', () => {
    expect(measureTempering(richContent).hasTested).toBe(true)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureTempering(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const unused = 2; const obsolete = 3; const deprecated = 4'
    const result = measureTempering(content)
    expect(result.deadCount).toBe(4)
    expect(result.hasNoDead).toBe(false)
  })

  it('detects dynamic (async/await/Promise)', () => {
    expect(measureTempering(richContent).hasDynamic).toBe(true)
  })

  it('detects evolving (class/interface/type)', () => {
    expect(measureTempering(richContent).hasEvolving).toBe(true)
  })

  it('classifies heat correctly for high scores', () => {
    const result = measureTempering(richContent)
    expect(['white-hot', 'red-hot', 'proper-glow']).toContain(result.heat)
  })

  it('classifies heat correctly for low scores', () => {
    expect(measureTempering(emptyContent).heat).not.toBe('white-hot')
  })
})

// ─── measureKnowing ─────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content highly', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureKnowing(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
    expect(measureKnowing(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureKnowing(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureKnowing(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects principled (no any)', () => {
    expect(measureKnowing(richContent).hasPrincipled).toBe(true)
  })

  it('detects deep (type annotations)', () => {
    expect(measureKnowing(richContent).hasDeep).toBe(true)
  })

  it('detects seasoned (const/readonly)', () => {
    expect(measureKnowing(richContent).hasSeasoned).toBe(true)
  })

  it('classifies forge correctly for high scores', () => {
    const result = measureKnowing(richContent)
    expect(['master-forge', 'veteran-smith', 'proper-artisan']).toContain(result.forge)
  })

  it('classifies forge correctly for low scores', () => {
    expect(measureKnowing(emptyContent).forge).not.toBe('master-forge')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPlateCondition', () => {
  it('returns iron-masterpiece for 90+', () => {
    expect(classifyPlateCondition(90)).toBe('iron-masterpiece')
    expect(classifyPlateCondition(95)).toBe('iron-masterpiece')
  })

  it('returns tempered-steel for 75-89', () => {
    expect(classifyPlateCondition(75)).toBe('tempered-steel')
    expect(classifyPlateCondition(85)).toBe('tempered-steel')
  })

  it('returns proper-iron for 60-74', () => {
    expect(classifyPlateCondition(60)).toBe('proper-iron')
    expect(classifyPlateCondition(70)).toBe('proper-iron')
  })

  it('returns rusted-metal for 40-59', () => {
    expect(classifyPlateCondition(40)).toBe('rusted-metal')
    expect(classifyPlateCondition(55)).toBe('rusted-metal')
  })

  it('returns scrap-iron for 20-39', () => {
    expect(classifyPlateCondition(20)).toBe('scrap-iron')
    expect(classifyPlateCondition(35)).toBe('scrap-iron')
  })

  it('returns void below 20', () => {
    expect(classifyPlateCondition(0)).toBe('void')
    expect(classifyPlateCondition(10)).toBe('void')
  })
})

describe('classifyFortressType', () => {
  it('returns no-fortress for empty plates', () => {
    expect(classifyFortressType([])).toBe('no-fortress')
  })

  it('returns impregnable-fortress for avg >= 85', () => {
    const plates = [{ qualityScore: 90 } as any]
    expect(classifyFortressType(plates)).toBe('impregnable-fortress')
  })

  it('returns ruin for low avg', () => {
    const plates = [{ qualityScore: 10 } as any]
    expect(classifyFortressType(plates)).toBe('ruin')
  })
})

describe('classifyFortressCondition', () => {
  it('returns iron-palace for 85+', () => {
    expect(classifyFortressCondition(85)).toBe('iron-palace')
  })

  it('returns void below 15', () => {
    expect(classifyFortressCondition(5)).toBe('void')
  })
})

describe('classifySmithGrade', () => {
  it('returns master-smith for 80+', () => {
    expect(classifySmithGrade(80)).toBe('master-smith')
  })

  it('returns bellows-puller below 20', () => {
    expect(classifySmithGrade(5)).toBe('bellows-puller')
  })

  it('returns veteran-forge-worker for 65-79', () => {
    expect(classifySmithGrade(65)).toBe('veteran-forge-worker')
  })

  it('returns proper-blacksmith for 50-64', () => {
    expect(classifySmithGrade(50)).toBe('proper-blacksmith')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifySmithGrade(20)).toBe('novice')
  })
})

// ─── analyzeIronPlate ───────────────────────────────────

describe('analyzeIronPlate', () => {
  it('creates a plate with all 5 measures', () => {
    const plate = analyzeIronPlate(richContent, 'app.ts')
    expect(plate.file).toBe('app.ts')
    expect(typeof plate.structuralFortitude).toBe('number')
    expect(typeof plate.rustResistance).toBe('number')
    expect(typeof plate.anvilPrecision).toBe('number')
    expect(typeof plate.forgeVitality).toBe('number')
    expect(typeof plate.steelWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const plate = analyzeIronPlate(richContent, 'app.ts')
    const expected = Math.round(
      plate.structuralFortitude * 0.2 +
      plate.rustResistance * 0.2 +
      plate.anvilPrecision * 0.2 +
      plate.forgeVitality * 0.2 +
      plate.steelWisdom * 0.2,
    )
    expect(plate.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const plate = analyzeIronPlate(richContent, 'app.ts')
    expect(plate.condition).toBe(classifyPlateCondition(plate.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richPlate = analyzeIronPlate(richContent, 'rich.ts')
    const emptyPlate = analyzeIronPlate(emptyContent, 'empty.ts')
    expect(richPlate.qualityScore).toBeGreaterThan(emptyPlate.qualityScore)
  })
})

// ─── analyzeIronFortress ────────────────────────────────

describe('analyzeIronFortress', () => {
  it('returns empty fortress for no plates', () => {
    const fortress = analyzeIronFortress([], 'src')
    expect(fortress.directory).toBe('src')
    expect(fortress.plates).toEqual([])
    expect(fortress.fortressType).toBe('no-fortress')
    expect(fortress.condition).toBe('void')
  })

  it('computes averages from plates', () => {
    const plates = [analyzeIronPlate(richContent, 'a.ts'), analyzeIronPlate(richContent, 'b.ts')]
    const fortress = analyzeIronFortress(plates, 'src')
    expect(fortress.avgFortitude).toBeGreaterThan(0)
    expect(fortress.avgPrecision).toBeGreaterThan(0)
    expect(fortress.avgWisdom).toBeGreaterThan(0)
  })

  it('counts iron masterpieces', () => {
    const plates = [analyzeIronPlate(richContent, 'a.ts')]
    const fortress = analyzeIronFortress(plates, 'src')
    expect(typeof fortress.ironMasterpieceCount).toBe('number')
    expect(typeof fortress.voidCount).toBe('number')
  })
})

// ─── buildIronBastionResult ─────────────────────────────

describe('buildIronBastionResult', () => {
  it('returns full result structure', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    expect(result.plates).toHaveLength(1)
    expect(result.fortresses).toHaveLength(1)
    expect(result.foundry).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into fortresses', async () => {
    const result = await buildIronBastionResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.fortresses.length).toBe(2)
  })

  it('computes foundry overview', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    expect(result.foundry.avgFortitude).toBeGreaterThan(0)
    expect(result.foundry.isIron).toBe(true)
    expect(result.foundry.overallStrength).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildIronBastionResult([], [])
    expect(result.plates).toHaveLength(0)
    expect(result.fortresses).toHaveLength(0)
    expect(result.foundry.overallStrength).toBe(0)
    expect(result.foundry.isIron).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    const total = result.stats.ironMasterpieceCount +
      result.stats.temperedSteelCount +
      result.stats.properIronCount +
      result.stats.rustedMetalCount +
      result.stats.scrapIronCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    expect(result.stats.hasHighFortitudeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResistanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best plate and top performers', async () => {
    const result = await buildIronBastionResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPlate).toBeTruthy()
    expect(result.stats.strongest).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostVital).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes smith grade from overall strength', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    expect(result.stats.smithGrade).toBe(classifySmithGrade(result.stats.overallStrength))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgStructuralFortitude: 90,
      avgRustResistance: 90,
      avgAnvilPrecision: 90,
      avgForgeVitality: 90,
      avgSteelWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgFortitude: 90, avgPrecision: 90, avgWisdom: 90, isIron: true, overallStrength: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('impregnable')
  })

  it('recommends reinforcing when fortitude < 60', () => {
    const stats = makeStats({ avgStructuralFortitude: 50 })
    const result = generateRecommendations([], [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('fortitude'))).toBe(true)
  })

  it('recommends rust resistance when < 60', () => {
    const stats = makeStats({ avgRustResistance: 50 })
    const result = generateRecommendations([], [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('rust') || r.includes('corrosion'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgAnvilPrecision: 50 })
    const result = generateRecommendations([], [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends vitality when < 60', () => {
    const stats = makeStats({ avgForgeVitality: 50 })
    const result = generateRecommendations([], [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('vitality') || r.includes('forge'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgSteelWisdom: 50 })
    const result = generateRecommendations([], [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom'))).toBe(true)
  })

  it('warns about crumbling bastion when strength < 40', () => {
    const stats = makeStats({ overallStrength: 30 })
    const result = generateRecommendations([], [], { avgFortitude: 30, avgPrecision: 30, avgWisdom: 30, isIron: false, overallStrength: 30 }, stats)
    expect(result.some((r) => r.includes('crumbling'))).toBe(true)
  })

  it('lists void plates by name when <= 5', () => {
    const plates = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
      structuralFortitude: 0,
      rustResistance: 0,
      anvilPrecision: 0,
      forgeVitality: 0,
      steelWisdom: 0,
      qualityScore: 0,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(plates, [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void plates when > 5', () => {
    const plates = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(plates, [], { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('6 scrap plates'))).toBe(true)
  })

  it('warns when all fortresses are poor', () => {
    const fortresses = [{ condition: 'wooden-fence' as const, fortressType: 'wooden-fort' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], fortresses as any, { avgFortitude: 50, avgPrecision: 50, avgWisdom: 50, isIron: false, overallStrength: 50 }, stats)
    expect(result.some((r) => r.includes('wooden fences'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgStructuralFortitude: 70,
      avgRustResistance: 70,
      avgAnvilPrecision: 70,
      avgForgeVitality: 70,
      avgSteelWisdom: 70,
      overallStrength: 70,
    })
    const result = generateRecommendations([], [], { avgFortitude: 70, avgPrecision: 70, avgWisdom: 70, isIron: true, overallStrength: 70 }, stats)
    expect(result.some((r) => r.includes('stands strong'))).toBe(true)
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

describe('colorPlateCondition', () => {
  it('colors iron-masterpiece', () => {
    expect(typeof colorPlateCondition('iron-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPlateCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorPlateCondition('unknown')).toBe('string')
  })
})

describe('colorFortressType', () => {
  it('colors impregnable-fortress', () => {
    expect(typeof colorFortressType('impregnable-fortress')).toBe('string')
  })

  it('colors no-fortress', () => {
    expect(typeof colorFortressType('no-fortress')).toBe('string')
  })
})

describe('colorFortressCondition', () => {
  it('colors iron-palace', () => {
    expect(typeof colorFortressCondition('iron-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorFortressCondition('void')).toBe('string')
  })
})

describe('colorSmithGrade', () => {
  it('colors master-smith', () => {
    expect(typeof colorSmithGrade('master-smith')).toBe('string')
  })

  it('colors bellows-puller', () => {
    expect(typeof colorSmithGrade('bellows-puller')).toBe('string')
  })
})

describe('formatPlateTable', () => {
  it('formats a plate with all measures', () => {
    const plate = analyzeIronPlate(richContent, 'app.ts')
    const output = formatPlateTable(plate)
    expect(output).toContain('Iron Plate: app.ts')
    expect(output).toContain('Structural Fortitude')
    expect(output).toContain('Rust Resistance')
    expect(output).toContain('Anvil Precision')
    expect(output).toContain('Forge Vitality')
    expect(output).toContain('Steel Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatPlatesTable', () => {
  it('shows no plates message for empty array', () => {
    expect(formatPlatesTable([])).toContain('No iron plates')
  })

  it('lists plates in output', () => {
    const plates = [analyzeIronPlate(richContent, 'a.ts')]
    expect(formatPlatesTable(plates)).toContain('a.ts')
  })
})

describe('formatFortressTable', () => {
  it('formats a fortress with all fields', () => {
    const plates = [analyzeIronPlate(richContent, 'a.ts')]
    const fortress = analyzeIronFortress(plates, 'src')
    const output = formatFortressTable(fortress)
    expect(output).toContain('Iron Fortress: src')
    expect(output).toContain('Plates')
    expect(output).toContain('Avg Fortitude')
  })
})

describe('formatFortressesTable', () => {
  it('shows no fortresses message for empty array', () => {
    expect(formatFortressesTable([])).toContain('No iron fortresses')
  })

  it('lists fortresses in output', () => {
    const plates = [analyzeIronPlate(richContent, 'a.ts')]
    const fortress = analyzeIronFortress(plates, 'src')
    expect(formatFortressesTable([fortress])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Iron Bastion Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
    expect(output).toContain('Best Plate')
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
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Iron Bastion Analysis')
    expect(output).toContain('Foundry Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildIronBastionResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.plates).toHaveLength(1)
    expect(parsed.foundry).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
