import { describe, it, expect } from 'vitest'
import {
  measureGrowing,
  measureIlluminating,
  measureKnowing,
  measureRefreshing,
  measureRising,
  classifyCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyGardenerGrade,
  analyzeEmeraldRay,
  analyzeEmeraldGarden,
  buildEmeraldDawnResult,
  generateRecommendations,
} from '../src/commands/emerald-dawn-helpers.js'
import {
  colorScore,
  colorCondition,
  colorGardenCondition,
  formatRayTable,
  formatRaysTable,
  formatGardenTable,
  formatGardensTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-dawn-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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

// ─── measureGrowing ──────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureGrowing('')
    expect(m.vitality).toBe(0)
    expect(m.garden).toBe('no-vitality')
    expect(m.hasHighVitality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureGrowing(minimalContent)
    expect(m.vitality).toBe(0)
    expect(m.hasEvolving).toBe(false)
    expect(m.hasActive).toBe(false)
    expect(m.hasAlive).toBe(false)
    expect(m.hasConnected).toBe(false)
    expect(m.stagnantCount).toBe(0)
    expect(m.deadCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureGrowing(richContent)
    expect(m.vitality).toBe(100)
    expect(m.garden).toBe('lush-rainforest')
    expect(m.hasHighVitality).toBe(true)
    expect(m.hasEvolving).toBe(true)
    expect(m.hasActive).toBe(true)
    expect(m.hasThriving).toBe(true)
    expect(m.hasAlive).toBe(true)
    expect(m.hasGrowing).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasContributing).toBe(true)
    expect(m.hasVibrant).toBe(true)
  })

  it('detects dead code patterns', () => {
    const m = measureGrowing('// dead code')
    expect(m.deadCount).toBe(1)
    expect(m.hasNoDead).toBe(false)
  })

  it('detects stagnant patterns', () => {
    const m = measureGrowing('// stagnant code')
    expect(m.stagnantCount).toBe(1)
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects zombie patterns negatively', () => {
    const m = measureGrowing('// zombie code')
    expect(m.hasNoZombie).toBe(false)
  })
})

// ─── measureIlluminating ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns minimal for empty content', () => {
    const m = measureIlluminating('')
    expect(m.clarity).toBe(0)
    expect(m.light).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.light).toBe('golden-dawn')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasIlluminated).toBe(true)
  })

  it('detects cryptic eval usage', () => {
    const m = measureIlluminating('eval("code")')
    expect(m.crypticCount).toBe(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureIlluminating('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects ts-ignore as hidden', () => {
    const m = measureIlluminating('// @ts-ignore\nexport const x = 1')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects mystery patterns negatively', () => {
    const m = measureIlluminating('// mystery code')
    expect(m.hasNoMystery).toBe(false)
  })
})

// ─── measureKnowing ──────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureKnowing('')
    expect(m.wisdom).toBe(0)
    expect(m.emerald).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.emerald).toBe('ancient-gem')
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasStrategic).toBe(true)
  })

  it('detects hack patterns', () => {
    const m = measureKnowing('// hack: something')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects any usage as ad-hoc', () => {
    const m = measureKnowing('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('detects experimental patterns negatively', () => {
    const m = measureKnowing('// experimental')
    expect(m.hasNoExperimental).toBe(false)
  })

  it('detects ts-ignore as shallow', () => {
    const m = measureKnowing('// @ts-ignore\nexport class Foo {}')
    expect(m.hasNoShallow).toBe(false)
  })
})

// ─── measureRefreshing ──────────────────────────────────────────

describe('measureRefreshing', () => {
  it('returns minimal for empty content (hasClean and hasNoUnsafe are true by default)', () => {
    const m = measureRefreshing('')
    expect(m.hasClean).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.dew).toBe('no-freshness')
    expect(m.hasHighFreshness).toBe(false)
    expect(m.freshness).toBeGreaterThan(0)
  })

  it('scores rich content at max', () => {
    const m = measureRefreshing(richContent)
    expect(m.freshness).toBe(100)
    expect(m.dew).toBe('morning-dew')
    expect(m.hasHighFreshness).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasModern).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasRenewed).toBe(true)
  })

  it('detects dirty patterns', () => {
    const m = measureRefreshing('// dirty code')
    expect(m.dirtyCount).toBe(1)
    expect(m.hasNoDirty).toBe(false)
  })

  it('detects legacy patterns negatively', () => {
    const m = measureRefreshing('// legacy code')
    expect(m.hasNoLegacy).toBe(false)
  })

  it('detects var as untested', () => {
    const m = measureRefreshing('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('detects unsafe any usage', () => {
    const m = measureRefreshing('const x: any = 1')
    expect(m.hasNoUnsafe).toBe(false)
  })
})

// ─── measureRising ──────────────────────────────────────────

describe('measureRising', () => {
  it('returns 0 for empty content', () => {
    const m = measureRising('')
    expect(m.resilience).toBe(0)
    expect(m.dawn).toBe('no-resilience')
    expect(m.hasHighResilience).toBe(false)
  })

  it('scores rich content at max', () => {
    const m = measureRising(richContent)
    expect(m.resilience).toBe(100)
    expect(m.dawn).toBe('eternal-sunrise')
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasRenewable).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasAntifragile).toBe(true)
  })

  it('detects bare crash via eval', () => {
    const m = measureRising('eval("code")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects fragile var usage', () => {
    const m = measureRising('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('antifragile detects test keywords', () => {
    const m = measureRising('describe("test", () => {})')
    expect(m.hasAntifragile).toBe(true)
  })

  it('detects naive trust patterns', () => {
    const m = measureRising('// trust the input')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects fatal patterns', () => {
    const m = measureRising('// fatal error')
    expect(m.hasNoFatal).toBe(false)
  })
})

// ─── Classifiers ──────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies emerald-masterpiece at 90+', () => {
    expect(classifyCondition(90)).toBe('emerald-masterpiece')
    expect(classifyCondition(100)).toBe('emerald-masterpiece')
  })

  it('classifies green-paradise at 75-89', () => {
    expect(classifyCondition(75)).toBe('green-paradise')
  })

  it('classifies proper-garden at 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-garden')
  })

  it('classifies wilting-bed at 40-59', () => {
    expect(classifyCondition(40)).toBe('wilting-bed')
  })

  it('classifies barren-soil at 20-39', () => {
    expect(classifyCondition(20)).toBe('barren-soil')
  })

  it('classifies void below 20', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyGardenType', () => {
  it('returns no-garden for empty rays', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns emerald-oasis for high scores', () => {
    const ray = analyzeEmeraldRay(richContent, 'test.ts')
    expect(classifyGardenType([ray])).toBe('emerald-oasis')
  })
})

describe('classifyGardenCondition', () => {
  it('classifies paradise-garden at 85+', () => {
    expect(classifyGardenCondition(85)).toBe('paradise-garden')
  })

  it('classifies void below 15', () => {
    expect(classifyGardenCondition(0)).toBe('void')
  })
})

describe('classifyGardenerGrade', () => {
  it('classifies emerald-sage at 80+', () => {
    expect(classifyGardenerGrade(80)).toBe('emerald-sage')
  })

  it('classifies black-thumb below 20', () => {
    expect(classifyGardenerGrade(0)).toBe('black-thumb')
  })
})

// ─── analyzeEmeraldRay ──────────────────────────────────────────

describe('analyzeEmeraldRay', () => {
  it('analyzes empty content', () => {
    const ray = analyzeEmeraldRay('', 'empty.ts')
    expect(ray.file).toBe('empty.ts')
    expect(ray.greenVitality).toBe(0)
    expect(ray.dawnClarity).toBe(0)
    expect(ray.gemWisdom).toBe(0)
    expect(ray.morningFreshness).toBeGreaterThan(0)
    expect(ray.sunriseResilience).toBe(0)
    expect(ray.condition).toBe('void')
  })

  it('analyzes rich content', () => {
    const ray = analyzeEmeraldRay(richContent, 'rich.ts')
    expect(ray.file).toBe('rich.ts')
    expect(ray.greenVitality).toBe(100)
    expect(ray.dawnClarity).toBe(100)
    expect(ray.gemWisdom).toBe(100)
    expect(ray.morningFreshness).toBe(100)
    expect(ray.sunriseResilience).toBe(100)
    expect(ray.qualityScore).toBe(100)
    expect(ray.condition).toBe('emerald-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const ray = analyzeEmeraldRay('export class Foo { }', 'foo.ts')
    expect(ray.qualityScore).toBe(
      Math.round(
        ray.greenVitality * 0.2 +
        ray.dawnClarity * 0.2 +
        ray.gemWisdom * 0.2 +
        ray.morningFreshness * 0.2 +
        ray.sunriseResilience * 0.2,
      ),
    )
  })

  it('includes all measure objects', () => {
    const ray = analyzeEmeraldRay(richContent, 'test.ts')
    expect(ray.growing).toBeDefined()
    expect(ray.illuminating).toBeDefined()
    expect(ray.knowing).toBeDefined()
    expect(ray.refreshing).toBeDefined()
    expect(ray.rising).toBeDefined()
  })
})

// ─── analyzeEmeraldGarden ──────────────────────────────────────────

describe('analyzeEmeraldGarden', () => {
  it('handles empty rays', () => {
    const garden = analyzeEmeraldGarden([], 'empty-dir')
    expect(garden.directory).toBe('empty-dir')
    expect(garden.rays).toEqual([])
    expect(garden.avgVitality).toBe(0)
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('void')
  })

  it('aggregates ray data correctly', () => {
    const r1 = analyzeEmeraldRay(richContent, 'a.ts')
    const r2 = analyzeEmeraldRay(richContent, 'b.ts')
    const garden = analyzeEmeraldGarden([r1, r2], 'src')
    expect(garden.rays).toHaveLength(2)
    expect(garden.avgVitality).toBe(100)
    expect(garden.emeraldMasterpieceCount).toBe(2)
    expect(garden.gardenType).toBe('emerald-oasis')
  })

  it('counts void rays', () => {
    const r1 = analyzeEmeraldRay('', 'a.ts')
    const garden = analyzeEmeraldGarden([r1], 'src')
    expect(garden.voidCount).toBe(1)
    expect(garden.emeraldMasterpieceCount).toBe(0)
  })
})

// ─── buildEmeraldDawnResult ──────────────────────────────────────────

describe('buildEmeraldDawnResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldDawnResult([], [])
    expect(result.rays).toEqual([])
    expect(result.gardens).toEqual([])
    expect(result.sunrise.overallBrilliance).toBe(0)
    expect(result.sunrise.isEmerald).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('analyzes single rich file', async () => {
    const result = await buildEmeraldDawnResult(['src/a.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.rays[0]?.file).toBe('src/a.ts')
    expect(result.rays[0]?.qualityScore).toBe(100)
    expect(result.gardens).toHaveLength(1)
    expect(result.sunrise.isEmerald).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmeraldDawnResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.gardenerGrade).toBeDefined()
    expect(result.stats.bestRay).toBeDefined()
    expect(result.stats.mostVital).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.freshest).toBeDefined()
    expect(result.stats.mostResilient).toBeDefined()
  })

  it('groups rays by directory', async () => {
    const result = await buildEmeraldDawnResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.gardens).toHaveLength(2)
  })

  it('handles single file with no directory', async () => {
    const result = await buildEmeraldDawnResult(['app.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.gardens).toHaveLength(1)
    expect(result.gardens[0]?.directory).toBe('.')
  })
})

// ─── generateRecommendations ──────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfect message when all scores are 90+', () => {
    const ray = analyzeEmeraldRay(richContent, 'perfect.ts')
    const stats: import('../src/commands/emerald-dawn-helpers.js').EmeraldDawnStats = {
      avgGreenVitality: 95,
      avgDawnClarity: 95,
      avgGemWisdom: 95,
      avgMorningFreshness: 95,
      avgSunriseResilience: 95,
      totalFiles: 1,
      totalGardens: 1,
      emeraldMasterpieceCount: 1,
      greenParadiseCount: 0,
      properGardenCount: 0,
      wiltingBedCount: 0,
      barrenSoilCount: 0,
      voidCount: 0,
      hasHighVitalityCount: 1,
      hasHighClarityCount: 1,
      hasHighWisdomCount: 1,
      hasHighFreshnessCount: 1,
      hasHighResilienceCount: 1,
      overallBrilliance: 95,
      gardenerGrade: 'emerald-sage',
      bestRay: 'perfect.ts',
      mostVital: 'perfect.ts',
      clearest: 'perfect.ts',
      wisest: 'perfect.ts',
      freshest: 'perfect.ts',
      mostResilient: 'perfect.ts',
    }
    const recs = generateRecommendations([ray], [], { avgVitality: 95, avgClarity: 95, avgWisdom: 95, isEmerald: true, overallBrilliance: 95 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('emerald dawn')
  })

  it('recommends improving vitality when low', () => {
    const ray = analyzeEmeraldRay('', 'empty.ts')
    const garden = analyzeEmeraldGarden([ray], '.')
    const stats: import('../src/commands/emerald-dawn-helpers.js').EmeraldDawnStats = {
      avgGreenVitality: 0,
      avgDawnClarity: 0,
      avgGemWisdom: 0,
      avgMorningFreshness: 0,
      avgSunriseResilience: 0,
      totalFiles: 1,
      totalGardens: 1,
      emeraldMasterpieceCount: 0,
      greenParadiseCount: 0,
      properGardenCount: 0,
      wiltingBedCount: 0,
      barrenSoilCount: 0,
      voidCount: 1,
      hasHighVitalityCount: 0,
      hasHighClarityCount: 0,
      hasHighWisdomCount: 0,
      hasHighFreshnessCount: 0,
      hasHighResilienceCount: 0,
      overallBrilliance: 0,
      gardenerGrade: 'black-thumb',
      bestRay: '',
      mostVital: '',
      clearest: '',
      wisest: '',
      freshest: '',
      mostResilient: '',
    }
    const recs = generateRecommendations([ray], [garden], { avgVitality: 0, avgClarity: 0, avgWisdom: 0, isEmerald: false, overallBrilliance: 0 }, stats)
    expect(recs.some((r: string) => r.includes('vitality'))).toBe(true)
  })
})

// ─── Format Helpers ──────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores green', () => {
    expect(colorScore(90)).toContain('90')
  })

  it('colors low scores gray', () => {
    expect(colorScore(5)).toContain('5')
  })
})

describe('colorCondition', () => {
  it('colors emerald-masterpiece', () => {
    expect(colorCondition('emerald-masterpiece')).toContain('emerald-masterpiece')
  })

  it('colors void', () => {
    expect(colorCondition('void')).toContain('void')
  })

  it('colors unknown condition gray', () => {
    expect(colorCondition('unknown')).toContain('unknown')
  })
})

describe('colorGardenCondition', () => {
  it('colors paradise-garden', () => {
    expect(colorGardenCondition('paradise-garden')).toContain('paradise-garden')
  })

  it('colors void', () => {
    expect(colorGardenCondition('void')).toContain('void')
  })
})

describe('formatRayTable', () => {
  it('formats a single ray', () => {
    const ray = analyzeEmeraldRay(richContent, 'test.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('test.ts')
    expect(output).toContain('Green Vitality')
    expect(output).toContain('Quality Score')
  })
})

describe('formatRaysTable', () => {
  it('handles empty rays', () => {
    expect(formatRaysTable([])).toContain('No emerald rays')
  })

  it('formats multiple rays', () => {
    const r1 = analyzeEmeraldRay(richContent, 'a.ts')
    const r2 = analyzeEmeraldRay(minimalContent, 'b.ts')
    const output = formatRaysTable([r1, r2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a single garden', () => {
    const ray = analyzeEmeraldRay(richContent, 'src/a.ts')
    const garden = analyzeEmeraldGarden([ray], 'src')
    const output = formatGardenTable(garden)
    expect(output).toContain('src')
    expect(output).toContain('Avg Vitality')
  })
})

describe('formatGardensTable', () => {
  it('handles empty gardens', () => {
    expect(formatGardensTable([])).toContain('No emerald gardens')
  })

  it('formats gardens', () => {
    const ray = analyzeEmeraldRay(richContent, 'src/a.ts')
    const garden = analyzeEmeraldGarden([ray], 'src')
    const output = formatGardensTable([garden])
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildEmeraldDawnResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Emerald Dawn Statistics')
    expect(output).toContain('Gardener Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildEmeraldDawnResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Dawn Analysis')
    expect(output).toContain('Sunrise Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildEmeraldDawnResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.rays).toHaveLength(1)
  })
})

// ─── Integration ──────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('processes multiple files with mixed quality', async () => {
    const files = ['src/good.ts', 'src/bad.ts', 'lib/ok.ts']
    const contents = [richContent, minimalContent, 'export class Foo { readonly x: string }']
    const result = await buildEmeraldDawnResult(files, contents)

    expect(result.rays).toHaveLength(3)
    expect(result.gardens).toHaveLength(2)
    expect(result.sunrise.avgVitality).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('quality score is weighted sum of measures', async () => {
    const result = await buildEmeraldDawnResult(['test.ts'], [richContent])
    const ray = result.rays[0]!
    expect(ray.qualityScore).toBe(
      Math.round(
        ray.greenVitality * 0.2 +
        ray.dawnClarity * 0.2 +
        ray.gemWisdom * 0.2 +
        ray.morningFreshness * 0.2 +
        ray.sunriseResilience * 0.2,
      ),
    )
  })
})
