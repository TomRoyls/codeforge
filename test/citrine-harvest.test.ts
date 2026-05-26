import { describe, expect, it } from 'vitest'

import {
  analyzeCitrineField,
  analyzeCitrineSheaf,
  buildCitrineHarvestResult,
  classifyCitrineCondition,
  classifyFarmerGrade,
  classifyFieldCondition,
  classifyFieldType,
  generateRecommendations,
  measureCrystallizing,
  measureIlluminating,
  measureUnderstanding,
  measureWeathering,
  measureYielding,
} from '../src/commands/citrine-harvest-helpers.js'
import type { CitrineHarvestResult } from '../src/commands/citrine-harvest-helpers.js'
import {
  colorCitrineCondition,
  colorFarmerGrade,
  colorFieldCondition,
  colorFieldType,
  colorScore,
  formatFieldsTable,
  formatFieldTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatSheavesTable,
  formatSheafTable,
  formatStatsTable,
} from '../src/commands/citrine-harvest-format-helpers.js'

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

const richAbn = measureYielding(richContent).abundance
const richClr = measureIlluminating(richContent).clarity
const richPrec = measureCrystallizing(richContent).precision
const richRes = measureWeathering(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<CitrineHarvestResult['stats']> = {}): CitrineHarvestResult['stats'] {
  return {
    totalFiles: 1,
    totalFields: 1,
    avgGoldenAbundance: 50,
    avgSunlightClarity: 50,
    avgCrystalPrecision: 50,
    avgAutumnResilience: 50,
    avgSolarWisdom: 50,
    citrineMasterpieceCount: 0,
    goldenGemCount: 0,
    properCitrineCount: 0,
    paleYellowCount: 0,
    roughQuartzCount: 0,
    voidCount: 0,
    hasHighAbundanceCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallYield: 50,
    farmerGrade: 'proper-cultivator',
    bestSheaf: 'a.ts',
    mostAbundant: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureYielding ────────────────────────────────────

describe('measureYielding', () => {
  it('scores rich content highly', () => {
    const result = measureYielding(richContent)
    expect(result.abundance).toBeGreaterThan(60)
    expect(result.hasHighAbundance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureYielding(emptyContent).abundance).toBeLessThan(richAbn)
  })

  it('detects hasProductive (class/interface/type)', () => {
    expect(measureYielding(richContent).hasProductive).toBe(true)
  })

  it('counts wasteful keywords', () => {
    const content = 'const wasteful = 1; const inefficient = 2; const bloated = 3; const heavy = 4; const slow = 5'
    const result = measureYielding(content)
    expect(result.wastefulCount).toBe(5)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('counts redundant keywords', () => {
    const content = 'const redundant = 1; const duplicate = 2; const repeated = 3; const copied = 4; const duplicated = 5'
    const result = measureYielding(content)
    expect(result.redundantCount).toBe(5)
    expect(result.hasNoRedundant).toBe(false)
  })

  it('detects hasEfficient (async/await/Promise)', () => {
    expect(measureYielding(richContent).hasEfficient).toBe(true)
  })

  it('detects hasRich (import/export)', () => {
    expect(measureYielding(richContent).hasRich).toBe(true)
  })

  it('detects hasAbundant (JSDoc)', () => {
    expect(measureYielding(richContent).hasAbundant).toBe(true)
  })

  it('detects hasNoIncomplete', () => {
    expect(measureYielding(richContent).hasNoIncomplete).toBe(true)
  })

  it('classifies harvest correctly for high scores', () => {
    const result = measureYielding(richContent)
    expect(['golden-bounty', 'rich-yield', 'proper-crop']).toContain(result.harvest)
  })

  it('classifies harvest correctly for low scores', () => {
    expect(measureYielding(emptyContent).harvest).not.toBe('golden-bounty')
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

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
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

  it('detects hasTransparent (no any)', () => {
    expect(measureIlluminating(richContent).hasTransparent).toBe(true)
  })

  it('detects hasOpen (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasOpen).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['golden-hour', 'sunlit-clarity', 'proper-glow']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).light).not.toBe('golden-hour')
  })
})

// ─── measureCrystallizing ───────────────────────────────

describe('measureCrystallizing', () => {
  it('scores rich content highly', () => {
    const result = measureCrystallizing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCrystallizing(emptyContent).precision).toBeLessThan(richPrec)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureCrystallizing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureCrystallizing(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const imprecise = 3; const loose = 4; const sloppy = 5'
    const result = measureCrystallizing(content)
    expect(result.approximateCount).toBe(5)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureCrystallizing(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureCrystallizing(richContent).hasCrisp).toBe(true)
  })

  it('detects hasOrdered (try/catch/if)', () => {
    expect(measureCrystallizing(richContent).hasOrdered).toBe(true)
  })

  it('detects hasMethodical (function/arrow/return)', () => {
    expect(measureCrystallizing(richContent).hasMethodical).toBe(true)
  })

  it('classifies cut correctly for high scores', () => {
    const result = measureCrystallizing(richContent)
    expect(['faceted-gold', 'proper-citrine', 'good-crystal']).toContain(result.cut)
  })

  it('classifies cut correctly for low scores', () => {
    expect(measureCrystallizing(emptyContent).cut).not.toBe('faceted-gold')
  })
})

// ─── measureWeathering ──────────────────────────────────

describe('measureWeathering', () => {
  it('scores rich content highly', () => {
    const result = measureWeathering(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureWeathering(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureWeathering(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const unprocessed = 3; const unresolved = 4'
    const result = measureWeathering(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureWeathering(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasRobust (class/interface/type)', () => {
    expect(measureWeathering(richContent).hasRobust).toBe(true)
  })

  it('detects hasDurable (no any)', () => {
    expect(measureWeathering(richContent).hasDurable).toBe(true)
  })

  it('detects hasTough (async/await/Promise)', () => {
    expect(measureWeathering(richContent).hasTough).toBe(true)
  })

  it('classifies season correctly for high scores', () => {
    const result = measureWeathering(richContent)
    expect(['golden-autumn', 'late-harvest', 'proper-fall']).toContain(result.season)
  })

  it('classifies season correctly for low scores', () => {
    expect(measureWeathering(emptyContent).season).not.toBe('golden-autumn')
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

  it('detects hasExperienced (function/arrow/return)', () => {
    expect(measureUnderstanding(richContent).hasExperienced).toBe(true)
  })

  it('classifies sun correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['solar-sage', 'harvest-master', 'proper-farmer']).toContain(result.sun)
  })

  it('classifies sun correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).sun).not.toBe('solar-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCitrineCondition', () => {
  it('returns citrine-masterpiece for 90+', () => {
    expect(classifyCitrineCondition(90)).toBe('citrine-masterpiece')
    expect(classifyCitrineCondition(95)).toBe('citrine-masterpiece')
  })

  it('returns golden-gem for 75-89', () => {
    expect(classifyCitrineCondition(75)).toBe('golden-gem')
  })

  it('returns proper-citrine for 60-74', () => {
    expect(classifyCitrineCondition(60)).toBe('proper-citrine')
  })

  it('returns pale-yellow for 40-59', () => {
    expect(classifyCitrineCondition(40)).toBe('pale-yellow')
  })

  it('returns rough-quartz for 20-39', () => {
    expect(classifyCitrineCondition(20)).toBe('rough-quartz')
  })

  it('returns void below 20', () => {
    expect(classifyCitrineCondition(0)).toBe('void')
    expect(classifyCitrineCondition(10)).toBe('void')
  })
})

describe('classifyFieldType', () => {
  it('returns no-field for empty sheaves', () => {
    expect(classifyFieldType([])).toBe('no-field')
  })

  it('returns golden-wheat-field for avg >= 85', () => {
    const sheaves = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyFieldType(sheaves)).toBe('golden-wheat-field')
  })

  it('returns empty-ground for low avg', () => {
    const sheaves = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyFieldType(sheaves)).toBe('empty-ground')
  })
})

describe('classifyFieldCondition', () => {
  it('returns citrine-palace for 85+', () => {
    expect(classifyFieldCondition(85)).toBe('citrine-palace')
  })

  it('returns void below 15', () => {
    expect(classifyFieldCondition(5)).toBe('void')
  })
})

describe('classifyFarmerGrade', () => {
  it('returns harvest-master for 80+', () => {
    expect(classifyFarmerGrade(80)).toBe('harvest-master')
  })

  it('returns city-dweller below 20', () => {
    expect(classifyFarmerGrade(5)).toBe('city-dweller')
  })

  it('returns golden-farmer for 65-79', () => {
    expect(classifyFarmerGrade(65)).toBe('golden-farmer')
  })

  it('returns proper-cultivator for 50-64', () => {
    expect(classifyFarmerGrade(50)).toBe('proper-cultivator')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyFarmerGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyFarmerGrade(20)).toBe('novice')
  })
})

// ─── analyzeCitrineSheaf ────────────────────────────────

describe('analyzeCitrineSheaf', () => {
  it('creates a sheaf with all 5 measures', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'app.ts')
    expect(sheaf.file).toBe('app.ts')
    expect(typeof sheaf.goldenAbundance).toBe('number')
    expect(typeof sheaf.sunlightClarity).toBe('number')
    expect(typeof sheaf.crystalPrecision).toBe('number')
    expect(typeof sheaf.autumnResilience).toBe('number')
    expect(typeof sheaf.solarWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'app.ts')
    const expected = Math.round(
      sheaf.goldenAbundance * 0.2 +
      sheaf.sunlightClarity * 0.2 +
      sheaf.crystalPrecision * 0.2 +
      sheaf.autumnResilience * 0.2 +
      sheaf.solarWisdom * 0.2,
    )
    expect(sheaf.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'app.ts')
    expect(sheaf.condition).toBe(classifyCitrineCondition(sheaf.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richSheaf = analyzeCitrineSheaf(richContent, 'rich.ts')
    const emptySheaf = analyzeCitrineSheaf(emptyContent, 'empty.ts')
    expect(richSheaf.qualityScore).toBeGreaterThan(emptySheaf.qualityScore)
  })

  it('scores rich content higher than minimal', () => {
    const richSheaf = analyzeCitrineSheaf(richContent, 'rich.ts')
    const minSheaf = analyzeCitrineSheaf(minimalContent, 'min.ts')
    expect(richSheaf.qualityScore).toBeGreaterThan(minSheaf.qualityScore)
  })

  it('scores rich content at max', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'app.ts')
    expect(sheaf.yielding.abundance).toBe(100)
    expect(sheaf.illuminating.clarity).toBe(100)
    expect(sheaf.crystallizing.precision).toBe(100)
    expect(sheaf.weathering.resilience).toBe(100)
    expect(sheaf.understanding.wisdom).toBe(100)
    expect(sheaf.qualityScore).toBe(100)
  })
})

// ─── analyzeCitrineField ────────────────────────────────

describe('analyzeCitrineField', () => {
  it('returns empty field for no sheaves', () => {
    const field = analyzeCitrineField([], 'src')
    expect(field.directory).toBe('src')
    expect(field.sheaves).toEqual([])
    expect(field.fieldType).toBe('no-field')
    expect(field.condition).toBe('void')
  })

  it('computes averages from sheaves', () => {
    const sheaves = [analyzeCitrineSheaf(richContent, 'a.ts'), analyzeCitrineSheaf(richContent, 'b.ts')]
    const field = analyzeCitrineField(sheaves, 'src')
    expect(field.avgAbundance).toBeGreaterThan(0)
    expect(field.avgPrecision).toBeGreaterThan(0)
    expect(field.avgWisdom).toBeGreaterThan(0)
  })

  it('counts citrine masterpieces', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'a.ts')
    const field = analyzeCitrineField([sheaf], 'src')
    expect(typeof field.citrineMasterpieceCount).toBe('number')
  })
})

// ─── buildCitrineHarvestResult ──────────────────────────

describe('buildCitrineHarvestResult', () => {
  it('returns full result structure', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    expect(result.sheaves).toHaveLength(1)
    expect(result.fields).toHaveLength(1)
    expect(result.sun).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into fields', async () => {
    const result = await buildCitrineHarvestResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.fields.length).toBe(2)
  })

  it('computes sun overview', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    expect(result.sun.avgAbundance).toBeGreaterThan(0)
    expect(result.sun.isCitrine).toBe(true)
    expect(result.sun.overallYield).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildCitrineHarvestResult([], [])
    expect(result.sheaves).toHaveLength(0)
    expect(result.fields).toHaveLength(0)
    expect(result.sun.overallYield).toBe(0)
    expect(result.sun.isCitrine).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    const total = result.stats.citrineMasterpieceCount +
      result.stats.goldenGemCount +
      result.stats.properCitrineCount +
      result.stats.paleYellowCount +
      result.stats.roughQuartzCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    expect(result.stats.hasHighAbundanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best sheaf and top performers', async () => {
    const result = await buildCitrineHarvestResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestSheaf).toBeTruthy()
    expect(result.stats.mostAbundant).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes farmer grade from overall yield', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    expect(result.stats.farmerGrade).toBe(classifyFarmerGrade(result.stats.overallYield))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgGoldenAbundance: 90,
      avgSunlightClarity: 90,
      avgCrystalPrecision: 90,
      avgAutumnResilience: 90,
      avgSolarWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgAbundance: 90, avgPrecision: 90, avgWisdom: 90, isCitrine: true, overallYield: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('citrine masterpiece')
  })

  it('recommends golden abundance when < 60', () => {
    const stats = makeStats({ avgGoldenAbundance: 50 })
    const result = generateRecommendations([], [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('golden abundance') || r.includes('golden-bounty'))).toBe(true)
  })

  it('recommends sunlight clarity when < 60', () => {
    const stats = makeStats({ avgSunlightClarity: 50 })
    const result = generateRecommendations([], [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('sunlight clarity') || r.includes('golden-hour'))).toBe(true)
  })

  it('recommends crystal precision when < 60', () => {
    const stats = makeStats({ avgCrystalPrecision: 50 })
    const result = generateRecommendations([], [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('crystal precision') || r.includes('faceted-gold'))).toBe(true)
  })

  it('recommends autumn resilience when < 60', () => {
    const stats = makeStats({ avgAutumnResilience: 50 })
    const result = generateRecommendations([], [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('autumn resilience') || r.includes('golden-autumn'))).toBe(true)
  })

  it('recommends solar wisdom when < 60', () => {
    const stats = makeStats({ avgSolarWisdom: 50 })
    const result = generateRecommendations([], [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('solar wisdom') || r.includes('solar-sage'))).toBe(true)
  })

  it('warns about failed harvest when overallYield < 40', () => {
    const stats = makeStats({ overallYield: 30 })
    const result = generateRecommendations([], [], { avgAbundance: 30, avgPrecision: 30, avgWisdom: 30, isCitrine: false, overallYield: 30 }, stats)
    expect(result.some((r) => r.includes('failed'))).toBe(true)
  })

  it('lists void sheaves by name when <= 5', () => {
    const sheaves = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(sheaves, [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void sheaves when > 5', () => {
    const sheaves = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(sheaves, [], { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('6 rough quartz'))).toBe(true)
  })

  it('warns when all fields are poor', () => {
    const fields = [{ condition: 'empty-lot' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], fields as Array<{ condition: string }>, { avgAbundance: 50, avgPrecision: 50, avgWisdom: 50, isCitrine: false, overallYield: 50 }, stats)
    expect(result.some((r) => r.includes('empty lots'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgGoldenAbundance: 70,
      avgSunlightClarity: 70,
      avgCrystalPrecision: 70,
      avgAutumnResilience: 70,
      avgSolarWisdom: 70,
      overallYield: 70,
    })
    const result = generateRecommendations([], [], { avgAbundance: 70, avgPrecision: 70, avgWisdom: 70, isCitrine: true, overallYield: 70 }, stats)
    expect(result.some((r) => r.includes('golden abundance'))).toBe(true)
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

describe('colorCitrineCondition', () => {
  it('colors citrine-masterpiece', () => {
    expect(typeof colorCitrineCondition('citrine-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCitrineCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorCitrineCondition('unknown')).toBe('string')
  })
})

describe('colorFieldType', () => {
  it('colors golden-wheat-field', () => {
    expect(typeof colorFieldType('golden-wheat-field')).toBe('string')
  })

  it('colors no-field', () => {
    expect(typeof colorFieldType('no-field')).toBe('string')
  })
})

describe('colorFieldCondition', () => {
  it('colors citrine-palace', () => {
    expect(typeof colorFieldCondition('citrine-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorFieldCondition('void')).toBe('string')
  })
})

describe('colorFarmerGrade', () => {
  it('colors harvest-master', () => {
    expect(typeof colorFarmerGrade('harvest-master')).toBe('string')
  })

  it('colors city-dweller', () => {
    expect(typeof colorFarmerGrade('city-dweller')).toBe('string')
  })
})

describe('formatSheafTable', () => {
  it('formats a sheaf with all measures', () => {
    const sheaf = analyzeCitrineSheaf(richContent, 'app.ts')
    const output = formatSheafTable(sheaf)
    expect(output).toContain('Citrine Sheaf: app.ts')
    expect(output).toContain('Golden Abundance')
    expect(output).toContain('Sunlight Clarity')
    expect(output).toContain('Crystal Precision')
    expect(output).toContain('Autumn Resilience')
    expect(output).toContain('Solar Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatSheavesTable', () => {
  it('shows no sheaves message for empty array', () => {
    expect(formatSheavesTable([])).toContain('No citrine sheaves')
  })

  it('lists sheaves in output', () => {
    const sheaves = [analyzeCitrineSheaf(richContent, 'a.ts')]
    expect(formatSheavesTable(sheaves)).toContain('a.ts')
  })
})

describe('formatFieldTable', () => {
  it('formats a field with all fields', () => {
    const sheaves = [analyzeCitrineSheaf(richContent, 'a.ts')]
    const field = analyzeCitrineField(sheaves, 'src')
    const output = formatFieldTable(field)
    expect(output).toContain('Citrine Field: src')
    expect(output).toContain('Sheaves')
    expect(output).toContain('Avg Abundance')
  })
})

describe('formatFieldsTable', () => {
  it('shows no fields message for empty array', () => {
    expect(formatFieldsTable([])).toContain('No citrine fields')
  })

  it('lists fields in output', () => {
    const sheaves = [analyzeCitrineSheaf(richContent, 'a.ts')]
    const field = analyzeCitrineField(sheaves, 'src')
    expect(formatFieldsTable([field])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Citrine Harvest Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Farmer Grade')
    expect(output).toContain('Best Sheaf')
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
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Citrine Harvest Analysis')
    expect(output).toContain('Sun Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCitrineHarvestResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.sheaves).toHaveLength(1)
    expect(parsed.sun).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
