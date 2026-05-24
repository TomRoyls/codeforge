import { describe, it, expect } from 'vitest'
import {
  measureFlowering,
  measureShadowing,
  measureIlluminating,
  measureScenting,
  measureEnduring,
  analyzeNightBloom,
  analyzeMoonlightBed,
  classifyBloomCondition,
  classifyBedType,
  classifyBedCondition,
  classifyGardenerGrade,
  generateRecommendations,
  buildMidnightGardenResult,
  gatherFiles,
} from '../src/commands/midnight-garden-helpers.js'
import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatBedTable,
  formatBedsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/midnight-garden-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const moderateContent = `export interface Foo {
  bar: string
}

export function greet(name: string): string {
  return 'hello ' + name
}

const foo: Foo = { bar: 'baz' }
`

const richContent = `/**
 * A type alias for string or number
 */
type StringOrNumber = string | number

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface Widget<T> {
  readonly id: string
  name: string
  value: T
  optional?: boolean
}

export class Processor {
  private status: string = 'idle'

  async process(input: string): Promise<string> {
    try {
      this.status = 'running'
      return input.toUpperCase()
    } catch (err) {
      throw new Error('Processing failed')
    }
  }
}

export function findWidget(widgets: Widget<string>[], id: string): Widget<string> | undefined {
  return widgets.find(w => w.id === id)
}

const DEFAULT_COLOR = Color.Red
`

// ─── measureFlowering ──────────────────────────────────────────────

describe('measureFlowering', () => {
  it('returns low bloom for minimal content', () => {
    const m = measureFlowering(minimalContent)
    expect(m.bloom).toBeLessThanOrEqual(15)
    expect(m.hasHighBloom).toBe(false)
    expect(m.hasProductionReady).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasRobust).toBe(false)
    expect(m.hasReliable).toBe(false)
    expect(m.hasSolid).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('returns high bloom for rich content', () => {
    const m = measureFlowering(richContent)
    expect(m.bloom).toBeGreaterThan(50)
    expect(m.hasProductionReady).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects var as untested', () => {
    const m = measureFlowering('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('detects bare throw as crash', () => {
    const m = measureFlowering('throw "error"')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('detects debugger as crash', () => {
    const m = measureFlowering('function f() { debugger }')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('classifies flower correctly', () => {
    expect(measureFlowering(richContent).flower).not.toBe('no-bloom')
    expect(measureFlowering(minimalContent).flower).toBe('no-bloom')
  })

  it('bloom is within 0-100', () => {
    const m = measureFlowering(richContent)
    expect(m.bloom).toBeLessThanOrEqual(100)
    expect(m.bloom).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureShadowing ──────────────────────────────────────────────

describe('measureShadowing', () => {
  it('returns low depth for minimal content', () => {
    const m = measureShadowing(minimalContent)
    expect(m.depth).toBeLessThanOrEqual(15)
    expect(m.hasHighDepth).toBe(false)
    expect(m.hasEdgeCaseCovered).toBe(false)
    expect(m.hasValidated).toBe(false)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNullSafe).toBe(false)
    expect(m.singlePathCount).toBe(0)
    expect(m.trustingCount).toBe(0)
  })

  it('returns high depth for rich content', () => {
    const m = measureShadowing(richContent)
    expect(m.depth).toBeGreaterThan(30)
    expect(m.hasEdgeCaseCovered).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasNoNaive).toBe(true)
  })

  it('detects var as non-defensive', () => {
    const m = measureShadowing('var x = 1')
    expect(m.hasNoNaive).toBe(false)
  })

  it('detects optional as defensive', () => {
    const m = measureShadowing('function f(x?: string) {}')
    expect(m.hasDefensive).toBe(true)
  })

  it('detects nullish coalescing as null-safe', () => {
    const m = measureShadowing('const x = y ?? "default"')
    expect(m.hasNullSafe).toBe(true)
    expect(m.hasDefensive).toBe(true)
  })

  it('depth is within 0-100', () => {
    const m = measureShadowing(richContent)
    expect(m.depth).toBeLessThanOrEqual(100)
    expect(m.depth).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(15)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasInviting).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('returns high clarity for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeGreaterThan(50)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
  })

  it('detects eval as cryptic', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as obfuscated', () => {
    const m = measureIlluminating('function f() { debugger }')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBe(1)
  })

  it('detects with as cryptic', () => {
    const m = measureIlluminating('with(obj) { x = 1 }')
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects warm from docs', () => {
    const m = measureIlluminating('/** docs */ export function foo() {}')
    expect(m.hasWarm).toBe(true)
  })
})

// ─── measureScenting ───────────────────────────────────────────────

describe('measureScenting', () => {
  it('returns low fragrance for minimal content', () => {
    const m = measureScenting(minimalContent)
    expect(m.fragrance).toBeLessThanOrEqual(15)
    expect(m.hasHighFragrance).toBe(false)
    expect(m.hasCleanCode).toBe(true)
    expect(m.hasNoCodeSmell).toBe(true)
    expect(m.hasNoHacked).toBe(true)
    expect(m.codeSmellCount).toBe(0)
    expect(m.hackedCount).toBe(0)
  })

  it('returns high fragrance for rich content', () => {
    const m = measureScenting(richContent)
    expect(m.fragrance).toBeGreaterThan(50)
    expect(m.hasElegant).toBe(true)
    expect(m.hasWellCrafted).toBe(true)
    expect(m.hasNoClunky).toBe(true)
  })

  it('detects var as code smell', () => {
    const m = measureScenting('var x = 1')
    expect(m.hasNoCodeSmell).toBe(false)
    expect(m.codeSmellCount).toBe(1)
    expect(m.hasNoClunky).toBe(false)
  })

  it('detects as any as hacky', () => {
    const m = measureScenting('const x = y as any')
    expect(m.hasNoHacked).toBe(false)
    expect(m.hackedCount).toBe(1)
  })

  it('detects eval as code smell', () => {
    const m = measureScenting('eval("x")')
    expect(m.hasNoCodeSmell).toBe(false)
    expect(m.hasNoCrude).toBe(false)
  })

  it('detects TODO as rough', () => {
    const m = measureScenting('// TODO: fix this\nconst x = 1')
    expect(m.hasNoRough).toBe(false)
  })

  it('fragrance is within 0-100', () => {
    const m = measureScenting(richContent)
    expect(m.fragrance).toBeLessThanOrEqual(100)
    expect(m.fragrance).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns low resilience for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(15)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasSelfHealing).toBe(false)
    expect(m.hasGraceful).toBe(false)
    expect(m.silentCount).toBe(0)
    expect(m.blindCount).toBe(0)
  })

  it('returns high resilience for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeGreaterThan(50)
    expect(m.hasSelfHealing).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasNoHarshFail).toBe(true)
  })

  it('detects empty catch as blind', () => {
    const m = measureEnduring('try { foo() } catch(e) {}')
    expect(m.hasNoBlind).toBe(false)
    expect(m.blindCount).toBe(1)
  })

  it('detects bare throw as harsh fail', () => {
    const m = measureEnduring('throw "error"')
    expect(m.hasNoHarshFail).toBe(false)
  })

  it('detects var as blind', () => {
    const m = measureEnduring('var x = 1')
    expect(m.blindCount).toBe(1)
  })

  it('detects TODO as abandoned', () => {
    const m = measureEnduring('// TODO: fix\nconst x = 1')
    expect(m.hasNoAbandoned).toBe(false)
  })

  it('resilience is within 0-100', () => {
    const m = measureEnduring(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyBloomCondition', () => {
  it('classifies midnight-masterpiece', () => expect(classifyBloomCondition(92)).toBe('midnight-masterpiece'))
  it('classifies moonlit-garden', () => expect(classifyBloomCondition(78)).toBe('moonlit-garden'))
  it('classifies twilight-bed', () => expect(classifyBloomCondition(65)).toBe('twilight-bed'))
  it('classifies dim-corner', () => expect(classifyBloomCondition(45)).toBe('dim-corner'))
  it('classifies dark-patch', () => expect(classifyBloomCondition(25)).toBe('dark-patch'))
  it('classifies barren-soil', () => expect(classifyBloomCondition(10)).toBe('barren-soil'))
})

describe('classifyBedCondition', () => {
  it('classifies midnight-paradise', () => expect(classifyBedCondition(88)).toBe('midnight-paradise'))
  it('classifies moonlit-estate', () => expect(classifyBedCondition(72)).toBe('moonlit-estate'))
  it('classifies proper-garden', () => expect(classifyBedCondition(58)).toBe('proper-garden'))
  it('classifies dim-yard', () => expect(classifyBedCondition(38)).toBe('dim-yard'))
  it('classifies dark-corner', () => expect(classifyBedCondition(18)).toBe('dark-corner'))
  it('classifies void', () => expect(classifyBedCondition(5)).toBe('void'))
})

describe('classifyGardenerGrade', () => {
  it('classifies master-gardener', () => expect(classifyGardenerGrade(88)).toBe('master-gardener'))
  it('classifies night-curator', () => expect(classifyGardenerGrade(72)).toBe('night-curator'))
  it('classifies skilled-botanist', () => expect(classifyGardenerGrade(58)).toBe('skilled-botanist'))
  it('classifies apprentice', () => expect(classifyGardenerGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyGardenerGrade(22)).toBe('novice'))
  it('classifies weed-puller', () => expect(classifyGardenerGrade(8)).toBe('weed-puller'))
})

describe('classifyBedType', () => {
  it('returns no-bed for empty', () => {
    expect(classifyBedType([])).toBe('no-bed')
  })
})

// ─── analyzeNightBloom ─────────────────────────────────────────────

describe('analyzeNightBloom', () => {
  it('analyzes minimal content', () => {
    const bloom = analyzeNightBloom(minimalContent, 'mini.ts')
    expect(bloom.file).toBe('mini.ts')
    expect(bloom.qualityScore).toBeLessThanOrEqual(20)
    expect(bloom.condition).toBe('barren-soil')
    expect(bloom.nocturnalBloom).toBeLessThanOrEqual(15)
    expect(bloom.shadowDepth).toBeLessThanOrEqual(15)
    expect(bloom.moonlitClarity).toBeLessThanOrEqual(15)
    expect(bloom.nightFragrance).toBeLessThanOrEqual(15)
    expect(bloom.darkResilience).toBeLessThanOrEqual(15)
  })

  it('analyzes rich content', () => {
    const bloom = analyzeNightBloom(richContent, 'rich.ts')
    expect(bloom.file).toBe('rich.ts')
    expect(bloom.qualityScore).toBeGreaterThan(40)
    expect(bloom.condition).not.toBe('barren-soil')
    expect(bloom.nocturnalBloom).toBeGreaterThan(50)
    expect(bloom.darkResilience).toBeGreaterThan(40)
  })

  it('quality score is average of 5 measures', () => {
    const bloom = analyzeNightBloom(richContent, 'rich.ts')
    const expected = Math.round(
      bloom.nocturnalBloom * 0.2 +
      bloom.shadowDepth * 0.2 +
      bloom.moonlitClarity * 0.2 +
      bloom.nightFragrance * 0.2 +
      bloom.darkResilience * 0.2,
    )
    expect(bloom.qualityScore).toBe(expected)
  })
})

// ─── analyzeMoonlightBed ───────────────────────────────────────────

describe('analyzeMoonlightBed', () => {
  it('handles empty blooms', () => {
    const bed = analyzeMoonlightBed([], 'empty')
    expect(bed.directory).toBe('empty')
    expect(bed.blooms).toHaveLength(0)
    expect(bed.avgBloom).toBe(0)
    expect(bed.avgClarity).toBe(0)
    expect(bed.avgResilience).toBe(0)
    expect(bed.bedType).toBe('no-bed')
    expect(bed.condition).toBe('void')
  })

  it('classifies bed with rich blooms', () => {
    const bloom = analyzeNightBloom(richContent, 'rich.ts')
    const bed = analyzeMoonlightBed([bloom], 'src')
    expect(bed.blooms).toHaveLength(1)
    expect(bed.barrenSoilCount).toBe(0)
    expect(bed.avgBloom).toBeGreaterThan(0)
    expect(bed.bedType).not.toBe('no-bed')
  })

  it('classifies bed with mixed blooms', () => {
    const rich = analyzeNightBloom(richContent, 'rich.ts')
    const minimal = analyzeNightBloom(minimalContent, 'mini.ts')
    const bed = analyzeMoonlightBed([rich, minimal], 'src')
    expect(bed.blooms).toHaveLength(2)
    expect(bed.barrenSoilCount).toBe(1)
  })
})

// ─── buildMidnightGardenResult ──────────────────────────────────────

describe('buildMidnightGardenResult', async () => {
  it('handles empty input', async () => {
    const result = await buildMidnightGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.beds).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFragrance).toBe(0)
    expect(result.stats.gardenerGrade).toBe('weed-puller')
    expect(result.estate.isMoonlit).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildMidnightGardenResult(['test.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.blooms[0].condition).not.toBe('barren-soil')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.barrenSoilCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildMidnightGardenResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.blooms).toHaveLength(2)
    expect(result.beds).toHaveLength(2)
    expect(result.stats.totalBeds).toBe(2)
  })

  it('computes estate correctly', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    expect(result.estate.avgBloom).toBeGreaterThan(0)
    expect(result.estate.avgClarity).toBeGreaterThan(0)
    expect(result.estate.avgResilience).toBeGreaterThan(0)
    expect(typeof result.estate.isMoonlit).toBe('boolean')
    expect(result.estate.overallFragrance).toBeGreaterThan(0)
  })

  it('computes overall fragrance as avg of bloom, clarity, fragrance', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgNocturnalBloom + result.stats.avgMoonlitClarity + result.stats.avgNightFragrance) / 3,
    )
    expect(result.stats.overallFragrance).toBe(expected)
  })

  it('tracks condition counts', async () => {
    const result = await buildMidnightGardenResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.barrenSoilCount).toBe(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('identifies best bloom and extremes', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    expect(result.stats.bestBloom).toBe('rich.ts')
    expect(result.stats.bestBlooming).toBe('rich.ts')
    expect(result.stats.deepestShadow).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostFragrant).toBe('rich.ts')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving bloom when low', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('bloom') || r.includes('async'))).toBe(true)
  })

  it('recommends improving shadow when low', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('shadow') || r.includes('edge'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('moonlight') || r.includes('doc'))).toBe(true)
  })

  it('recommends improving fragrance when low', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('fragrance') || r.includes('smell'))).toBe(true)
  })

  it('recommends improving resilience when low', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('resilience') || r.includes('try/catch'))).toBe(true)
  })

  it('notes barren files', async () => {
    const result = await buildMidnightGardenResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('barren') || r.includes('Barren'))).toBe(true)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('midnight-masterpiece')).toBe('string')
    expect(typeof colorGrade('barren-soil')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatBloomTable', () => {
  it('formats a bloom', () => {
    const bloom = analyzeNightBloom(richContent, 'rich.ts')
    const output = formatBloomTable(bloom)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Nocturnal Bloom')
    expect(output).toContain('Shadow Depth')
    expect(output).toContain('Moonlit Clarity')
    expect(output).toContain('Night Fragrance')
    expect(output).toContain('Dark Resilience')
    expect(output).toContain('Quality Score')
  })
})

describe('formatBloomsTable', () => {
  it('returns message for empty blooms', () => {
    expect(formatBloomsTable([])).toContain('No night blooms')
  })
})

describe('formatBedTable', () => {
  it('formats a bed', () => {
    const bloom = analyzeNightBloom(richContent, 'rich.ts')
    const bed = analyzeMoonlightBed([bloom], 'src')
    const output = formatBedTable(bed)
    expect(output).toContain('src')
    expect(output).toContain('Avg Bloom')
  })
})

describe('formatBedsTable', () => {
  it('returns message for empty beds', () => {
    expect(formatBedsTable([])).toContain('No moonlight beds')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Midnight Garden Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Gardener Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['improve X', 'fix Y'])
    expect(output).toContain('improve X')
    expect(output).toContain('fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Night Bloom Analysis')
    expect(output).toContain('Moonlight Beds')
    expect(output).toContain('Midnight Garden Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.stats.gardenerGrade).toBeDefined()
    expect(parsed.estate.overallFragrance).toBeGreaterThan(0)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('all scores within 0-100 for varied content', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measureFlowering(c).bloom).toBeGreaterThanOrEqual(0)
      expect(measureFlowering(c).bloom).toBeLessThanOrEqual(100)
      expect(measureShadowing(c).depth).toBeGreaterThanOrEqual(0)
      expect(measureShadowing(c).depth).toBeLessThanOrEqual(100)
      expect(measureIlluminating(c).clarity).toBeGreaterThanOrEqual(0)
      expect(measureIlluminating(c).clarity).toBeLessThanOrEqual(100)
      expect(measureScenting(c).fragrance).toBeGreaterThanOrEqual(0)
      expect(measureScenting(c).fragrance).toBeLessThanOrEqual(100)
      expect(measureEnduring(c).resilience).toBeGreaterThanOrEqual(0)
      expect(measureEnduring(c).resilience).toBeLessThanOrEqual(100)
    }
  })

  it('multi-dir creates multiple beds', async () => {
    const result = await buildMidnightGardenResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.beds).toHaveLength(2)
    const srcBed = result.beds.find(b => b.directory === 'src')
    expect(srcBed).toBeDefined()
    expect(srcBed!.blooms).toHaveLength(2)
  })

  it('overall fragrance matches estate', async () => {
    const result = await buildMidnightGardenResult(['rich.ts'], [richContent])
    expect(result.stats.overallFragrance).toBe(result.estate.overallFragrance)
  })
})
