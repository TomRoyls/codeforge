import { describe, it, expect } from 'vitest'
import {
  measureDiving, measureResisting, measureGlowing, measureMapping, measureQualifying,
  analyzeAbyssalDive, classifyDiveCondition, classifyTrenchType, classifyExplorerGrade,
  classifyTrenchCondition, analyzeTrenchSystem, buildOceanTrenchResult,
} from '../src/commands/ocean-trench-helpers.js'
import {
  colorScore, colorGrade, formatDiveTable, formatDivesTable, formatTrenchTable,
  formatTrenchesTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/ocean-trench-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const RICH = `import { promisify } from 'util'
import type { Config } from './config.js'

/** Documentation */
export interface DataProcessor<T> {
  process(item: T): Promise<string>
}

export class MainProcessor implements DataProcessor<Config> {
  private readonly items: readonly string[] = []

  async process(item: Config): Promise<string> {
    try {
      const result = item?.value ?? 'default'
      if (result === item.name) {
        return result
      }
      return await promisify((cb: (err: Error | null, val?: string) => void) => {
        cb(null, item.name)
      })()
    } catch (error: unknown) {
      return ''
    }
  }
}

export const helper = (input?: string): string => {
  return input ?? ''
}

export type Result = { readonly value: string; readonly label: string }
`
const MINIMAL = 'const x = 1'
const MODERATE = `export interface Item {
  name: string
}

export function process(item: Item): string {
  return item.name
}

const result = process({ name: 'test' })`
const POOR = `var x: any = 1
var y: any = 2
function bad(a: any): any {
  return a
}`

// ─── Measure Tests ─────────────────────────────────────────────────

describe('measureDiving', () => {
  it('returns hadal-zone for rich', () => {
    const m = measureDiving(RICH)
    expect(m.depth).toBe(100)
    expect(m.grade).toBe('hadal-zone')
    expect(m.hasHighDepth).toBe(true)
  })
  it('returns surface-water for minimal', () => {
    const m = measureDiving(MINIMAL)
    expect(m.depth).toBe(0)
    expect(m.grade).toBe('surface-water')
  })
  it('returns epipelagic for moderate', () => {
    const m = measureDiving(MODERATE)
    expect(m.depth).toBe(26)
    expect(m.grade).toBe('epipelagic')
  })
  it('returns surface-water for poor', () => {
    const m = measureDiving(POOR)
    expect(m.depth).toBe(0)
    expect(m.grade).toBe('surface-water')
  })
  it('detects deep (interface+generics)', () => expect(measureDiving(RICH).hasDeep).toBe(true))
  it('detects profound (class+async)', () => expect(measureDiving(RICH).hasProfound).toBe(true))
  it('detects rich (interface+class)', () => expect(measureDiving(RICH).hasRich).toBe(true))
  it('counts shallow (var) and flat (any)', () => {
    const m = measureDiving(POOR)
    expect(m.shallowCount).toBe(2)
    expect(m.flatCount).toBe(4)
    expect(m.hasNoShallow).toBe(false)
    expect(m.hasNoFlat).toBe(false)
  })
  it('clean code has no shallow or flat', () => {
    const m = measureDiving(RICH)
    expect(m.hasNoShallow).toBe(true)
    expect(m.hasNoFlat).toBe(true)
    expect(m.hasNoSimple).toBe(true)
    expect(m.hasNoTrivial).toBe(true)
  })
})

describe('measureResisting', () => {
  it('returns titan-grade for rich', () => {
    const m = measureResisting(RICH)
    expect(m.resilience).toBe(100)
    expect(m.pressure).toBe('titan-grade')
    expect(m.hasHighResilience).toBe(true)
  })
  it('returns imploded for minimal', () => {
    const m = measureResisting(MINIMAL)
    expect(m.resilience).toBe(8)
    expect(m.pressure).toBe('imploded')
  })
  it('returns cracking for moderate', () => {
    const m = measureResisting(MODERATE)
    expect(m.resilience).toBe(37)
    expect(m.pressure).toBe('cracking')
  })
  it('returns imploded for poor', () => {
    const m = measureResisting(POOR)
    expect(m.resilience).toBe(0)
    expect(m.pressure).toBe('imploded')
  })
  it('detects sturdy (tryCatch+async)', () => expect(measureResisting(RICH).hasSturdy).toBe(true))
  it('detects robust (optionalChaining+nullishCoalescing)', () => expect(measureResisting(RICH).hasRobust).toBe(true))
  it('detects solid (tryCatch+const)', () => expect(measureResisting(RICH).hasSolid).toBe(true))
  it('counts fragile (var) and crumbly (any)', () => {
    const m = measureResisting(POOR)
    expect(m.fragileCount).toBe(2)
    expect(m.crumblyCount).toBe(4)
  })
  it('clean code has no fragile or crumbly', () => {
    const m = measureResisting(RICH)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoCrumbly).toBe(true)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasNoBreaking).toBe(true)
  })
  it('moderate has enduring', () => {
    expect(measureResisting(MODERATE).hasEnduring).toBe(true)
  })
})

describe('measureGlowing', () => {
  it('returns angstrom-luminosity for rich', () => {
    const m = measureGlowing(RICH)
    expect(m.bioluminescence).toBe(100)
    expect(m.luminescence).toBe('angstrom-luminosity')
    expect(m.hasHighBioluminescence).toBe(true)
  })
  it('returns darkness for minimal', () => {
    const m = measureGlowing(MINIMAL)
    expect(m.bioluminescence).toBe(8)
    expect(m.luminescence).toBe('darkness')
  })
  it('returns dim-glow for moderate', () => {
    const m = measureGlowing(MODERATE)
    expect(m.bioluminescence).toBe(47)
    expect(m.luminescence).toBe('dim-glow')
  })
  it('returns darkness for poor', () => {
    const m = measureGlowing(POOR)
    expect(m.bioluminescence).toBe(0)
    expect(m.luminescence).toBe('darkness')
  })
  it('detects illuminating (docComments+export)', () => expect(measureGlowing(RICH).hasIlluminating).toBe(true))
  it('detects bright (interface+class)', () => expect(measureGlowing(RICH).hasBright).toBe(true))
  it('detects luminous (export+generics)', () => expect(measureGlowing(RICH).hasLuminous).toBe(true))
  it('counts dark (var) and obscure (any)', () => {
    const m = measureGlowing(POOR)
    expect(m.darkCount).toBe(2)
    expect(m.obscureCount).toBe(4)
  })
  it('clean code has no dark or obscure', () => {
    const m = measureGlowing(RICH)
    expect(m.hasNoDark).toBe(true)
    expect(m.hasNoObscure).toBe(true)
    expect(m.hasNoDull).toBe(true)
    expect(m.hasNoMurky).toBe(true)
  })
  it('moderate has radiant', () => {
    expect(measureGlowing(MODERATE).hasRadiant).toBe(true)
  })
})

describe('measureMapping', () => {
  it('returns detailed-chart for rich', () => {
    const m = measureMapping(RICH)
    expect(m.quality).toBe(100)
    expect(m.chart).toBe('detailed-chart')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns uncharted for minimal', () => {
    const m = measureMapping(MINIMAL)
    expect(m.quality).toBe(10)
    expect(m.chart).toBe('uncharted')
  })
  it('returns lost-at-sea for moderate', () => {
    const m = measureMapping(MODERATE)
    expect(m.quality).toBe(39)
    expect(m.chart).toBe('lost-at-sea')
  })
  it('returns uncharted for poor', () => {
    const m = measureMapping(POOR)
    expect(m.quality).toBe(0)
    expect(m.chart).toBe('uncharted')
  })
  it('detects navigable (const+strictEq)', () => expect(measureMapping(RICH).hasNavigable).toBe(true))
  it('detects clear (export+docComments)', () => expect(measureMapping(RICH).hasClear).toBe(true))
  it('detects structured (const+export)', () => expect(measureMapping(RICH).hasStructured).toBe(true))
  it('counts confusing (var) and unmapped (any)', () => {
    const m = measureMapping(POOR)
    expect(m.confusingCount).toBe(2)
    expect(m.unmappedCount).toBe(4)
  })
  it('clean code has no confusing or unmapped', () => {
    const m = measureMapping(RICH)
    expect(m.hasNoConfusing).toBe(true)
    expect(m.hasNoUnmapped).toBe(true)
    expect(m.hasNoBlocked).toBe(true)
    expect(m.hasNoWandering).toBe(true)
  })
  it('moderate has structured', () => {
    expect(measureMapping(MODERATE).hasStructured).toBe(true)
  })
})

describe('measureQualifying', () => {
  it('returns pristine-abyss for rich', () => {
    const m = measureQualifying(RICH)
    expect(m.quality).toBe(100)
    expect(m.grade2).toBe('pristine-abyss')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns dead-zone for minimal', () => {
    const m = measureQualifying(MINIMAL)
    expect(m.quality).toBe(8)
    expect(m.grade2).toBe('dead-zone')
  })
  it('returns murky-bottom for moderate', () => {
    const m = measureQualifying(MODERATE)
    expect(m.quality).toBe(52)
    expect(m.grade2).toBe('murky-bottom')
  })
  it('returns dead-zone for poor', () => {
    const m = measureQualifying(POOR)
    expect(m.quality).toBe(0)
    expect(m.grade2).toBe('dead-zone')
  })
  it('detects excellent (export+import)', () => expect(measureQualifying(RICH).hasExcellent).toBe(true))
  it('detects pristine (interface+class)', () => expect(measureQualifying(RICH).hasPristine).toBe(true))
  it('detects outstanding (export+interface)', () => expect(measureQualifying(RICH).hasOutstanding).toBe(true))
  it('counts degraded (var) and poor (any)', () => {
    const m = measureQualifying(POOR)
    expect(m.degradedCount).toBe(2)
    expect(m.poorCount).toBe(4)
  })
  it('clean code has no degraded or poor', () => {
    const m = measureQualifying(RICH)
    expect(m.hasNoDegraded).toBe(true)
    expect(m.hasNoPoor).toBe(true)
    expect(m.hasNoLowGrade).toBe(true)
    expect(m.hasNoMediocre).toBe(true)
  })
  it('moderate has exceptional and outstanding', () => {
    const m = measureQualifying(MODERATE)
    expect(m.hasExceptional).toBe(true)
    expect(m.hasOutstanding).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyDiveCondition', () => {
  it('mariana-trench >= 85', () => expect(classifyDiveCondition(85)).toBe('mariana-trench'))
  it('deep-abyss >= 70', () => expect(classifyDiveCondition(70)).toBe('deep-abyss'))
  it('mid-depth >= 55', () => expect(classifyDiveCondition(55)).toBe('mid-depth'))
  it('shallow-waters >= 40', () => expect(classifyDiveCondition(40)).toBe('shallow-waters'))
  it('tidal-pool >= 25', () => expect(classifyDiveCondition(25)).toBe('tidal-pool'))
  it('dry-land < 25', () => expect(classifyDiveCondition(0)).toBe('dry-land'))
})

describe('classifyExplorerGrade', () => {
  it('deep-sea-explorer >= 80', () => expect(classifyExplorerGrade(80)).toBe('deep-sea-explorer'))
  it('submarine-captain >= 65', () => expect(classifyExplorerGrade(65)).toBe('submarine-captain'))
  it('marine-biologist >= 50', () => expect(classifyExplorerGrade(50)).toBe('marine-biologist'))
  it('diver >= 35', () => expect(classifyExplorerGrade(35)).toBe('diver'))
  it('snorkeler >= 20', () => expect(classifyExplorerGrade(20)).toBe('snorkeler'))
  it('landlubber < 20', () => expect(classifyExplorerGrade(19)).toBe('landlubber'))
})

describe('classifyTrenchCondition', () => {
  it('pristine-depths >= 75', () => expect(classifyTrenchCondition(75)).toBe('pristine-depths'))
  it('healthy-ocean >= 60', () => expect(classifyTrenchCondition(60)).toBe('healthy-ocean'))
  it('fair-waters >= 45', () => expect(classifyTrenchCondition(45)).toBe('fair-waters'))
  it('polluted-depths >= 30', () => expect(classifyTrenchCondition(30)).toBe('polluted-depths'))
  it('dead-sea >= 15', () => expect(classifyTrenchCondition(15)).toBe('dead-sea'))
  it('dried-up < 15', () => expect(classifyTrenchCondition(14)).toBe('dried-up'))
})

describe('classifyTrenchType', () => {
  it('returns dry-land for empty', () => expect(classifyTrenchType([])).toBe('dry-land'))
})

// ─── analyzeAbyssalDive Tests ──────────────────────────────────────

describe('analyzeAbyssalDive', () => {
  it('returns mariana-trench for rich', () => {
    const d = analyzeAbyssalDive(RICH, 'rich.ts')
    expect(d.qualityScore).toBe(100)
    expect(d.condition).toBe('mariana-trench')
  })
  it('returns dry-land for minimal', () => {
    const d = analyzeAbyssalDive(MINIMAL, 'minimal.ts')
    expect(d.qualityScore).toBe(7)
    expect(d.condition).toBe('dry-land')
  })
  it('returns shallow-waters for moderate', () => {
    const d = analyzeAbyssalDive(MODERATE, 'moderate.ts')
    expect(d.qualityScore).toBe(40)
    expect(d.condition).toBe('shallow-waters')
  })
  it('returns dry-land for poor', () => {
    const d = analyzeAbyssalDive(POOR, 'poor.ts')
    expect(d.qualityScore).toBe(0)
    expect(d.condition).toBe('dry-land')
  })
  it('contains all measures', () => {
    const d = analyzeAbyssalDive(RICH, 'test.ts')
    expect(d.diving).toBeDefined()
    expect(d.resisting).toBeDefined()
    expect(d.glowing).toBeDefined()
    expect(d.mapping).toBeDefined()
    expect(d.qualifying).toBeDefined()
  })
  it('stores file path', () => {
    const d = analyzeAbyssalDive(RICH, 'my-file.ts')
    expect(d.file).toBe('my-file.ts')
  })
  it('stores scalar scores', () => {
    const d = analyzeAbyssalDive(RICH, 'test.ts')
    expect(d.depth).toBe(100)
    expect(d.pressureResilience).toBe(100)
    expect(d.bioluminescence).toBe(100)
    expect(d.currentMapping).toBe(100)
    expect(d.abyssalQuality).toBe(100)
  })
})

// ─── buildOceanTrenchResult Tests ──────────────────────────────────

describe('buildOceanTrenchResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalTrenches).toBe(1)
    expect(r.stats.avgDepth).toBe(32)
    expect(r.stats.avgPressureResilience).toBe(36)
    expect(r.stats.avgBioluminescence).toBe(39)
    expect(r.stats.avgCurrentMapping).toBe(37)
    expect(r.stats.avgAbyssalQuality).toBe(40)
    expect(r.stats.overallDepth).toBe(36)
    expect(r.stats.explorerGrade).toBe('diver')
    expect(r.ocean.isDeep).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.marianaTrenchCount).toBe(1)
    expect(r.stats.deepAbyssCount).toBe(0)
    expect(r.stats.midDepthCount).toBe(0)
    expect(r.stats.shallowWatersCount).toBe(1)
    expect(r.stats.tidalPoolCount).toBe(0)
    expect(r.stats.dryLandCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighDepthCount).toBe(1)
    expect(r.stats.hasHighResilienceCount).toBe(1)
    expect(r.stats.hasHighBioluminescenceCount).toBe(1)
    expect(r.stats.hasHighQualityMappingCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestDive).toBe('rich.ts')
    expect(r.stats.deepest).toBe('rich.ts')
    expect(r.stats.mostResilient).toBe('rich.ts')
    expect(r.stats.brightest).toBe('rich.ts')
    expect(r.stats.bestMapped).toBe('rich.ts')
  })
  it('classifies trench', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.trenches[0]!.trenchType).toBe('coastal-waters')
    expect(r.trenches[0]!.condition).toBe('polluted-depths')
  })
  it('generates recommendations', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildOceanTrenchResult([], [])
    expect(r.dives).toHaveLength(0)
    expect(r.stats.overallDepth).toBe(0)
  })
  it('returns milestone message for all-mariana', async () => {
    const r = await buildOceanTrenchResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('440 commands - an ocean trench of code analysis excellence')
  })
  it('isDeep when avgDepth >= 60', async () => {
    const r = await buildOceanTrenchResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.ocean.isDeep).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildOceanTrenchResult(['src/a.ts', 'lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalTrenches).toBe(2)
  })
  it('computes ocean averages', async () => {
    const r = await buildOceanTrenchResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.ocean.avgDepth).toBe(32)
    expect(r.ocean.avgResilience).toBe(36)
    expect(r.ocean.avgBioluminescence).toBe(39)
  })
  it('2-rich gets deep-sea-explorer', async () => {
    const r = await buildOceanTrenchResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.stats.overallDepth).toBe(100)
    expect(r.stats.explorerGrade).toBe('deep-sea-explorer')
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('hadal-zone')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatDiveTable formats dive', () => {
    const d = analyzeAbyssalDive(RICH, 'rich.ts')
    expect(formatDiveTable(d)).toContain('rich.ts')
  })
  it('formatDivesTable handles empty', () => {
    expect(formatDivesTable([])).toContain('No abyssal dives')
  })
  it('formatTrenchTable formats trench', () => {
    const d = analyzeAbyssalDive(RICH, 'a.ts')
    const trench = analyzeTrenchSystem([d], 'src')
    expect(formatTrenchTable(trench)).toContain('src')
  })
  it('formatTrenchesTable handles empty', () => {
    expect(formatTrenchesTable([])).toContain('No trench systems')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildOceanTrenchResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Expedition Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildOceanTrenchResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Ocean Trench Analysis')
    expect(out).toContain('Trench System Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildOceanTrenchResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.dives).toHaveLength(1)
  })
})
