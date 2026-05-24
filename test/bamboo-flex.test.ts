import { describe, it, expect } from 'vitest'
import {
  measureBending, measureKnotting, measureHollowing, measureGrowing, measureResisting,
  analyzeBambooCane, classifyCaneCondition, classifyGroveType, classifyGardenerGrade,
  classifyGroveCondition, analyzeBambooGrove, buildBambooFlexResult,
} from '../src/commands/bamboo-flex-helpers.js'
import {
  colorScore, colorGrade, formatCaneTable, formatCanesTable, formatGroveTable,
  formatGrovesTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/bamboo-flex-format-helpers.js'

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

describe('measureBending', () => {
  it('returns supple-reed for rich', () => {
    const m = measureBending(RICH)
    expect(m.flexibility).toBe(100)
    expect(m.grade).toBe('supple-reed')
    expect(m.hasHighFlexibility).toBe(true)
  })
  it('returns frozen-pole for minimal', () => {
    const m = measureBending(MINIMAL)
    expect(m.flexibility).toBe(8)
    expect(m.grade).toBe('frozen-pole')
  })
  it('returns brittle-stick for moderate', () => {
    const m = measureBending(MODERATE)
    expect(m.flexibility).toBe(32)
    expect(m.grade).toBe('brittle-stick')
  })
  it('returns frozen-pole for poor', () => {
    const m = measureBending(POOR)
    expect(m.flexibility).toBe(0)
    expect(m.grade).toBe('frozen-pole')
  })
  it('detects adaptable (optionalChaining+nullishCoalescing)', () => expect(measureBending(RICH).hasAdaptable).toBe(true))
  it('detects bendable (tryCatch+async)', () => expect(measureBending(RICH).hasBendable).toBe(true))
  it('detects elastic (export+import)', () => expect(measureBending(RICH).hasElastic).toBe(true))
  it('counts rigid (var) and stiff (any)', () => {
    const m = measureBending(POOR)
    expect(m.rigidCount).toBe(2)
    expect(m.stiffCount).toBe(4)
    expect(m.hasNoRigid).toBe(false)
    expect(m.hasNoStiff).toBe(false)
  })
  it('clean code has no rigid or stiff', () => {
    const m = measureBending(RICH)
    expect(m.hasNoRigid).toBe(true)
    expect(m.hasNoStiff).toBe(true)
    expect(m.hasNoStubborn).toBe(true)
    expect(m.hasNoInflexible).toBe(true)
  })
})

describe('measureKnotting', () => {
  it('returns iron-knot for rich', () => {
    const m = measureKnotting(RICH)
    expect(m.strength).toBe(100)
    expect(m.knot).toBe('iron-knot')
    expect(m.hasHighStrength).toBe(true)
  })
  it('returns broken-cane for minimal', () => {
    const m = measureKnotting(MINIMAL)
    expect(m.strength).toBe(8)
    expect(m.knot).toBe('broken-cane')
  })
  it('returns loose-joint for moderate', () => {
    const m = measureKnotting(MODERATE)
    expect(m.strength).toBe(52)
    expect(m.knot).toBe('loose-joint')
  })
  it('returns broken-cane for poor', () => {
    const m = measureKnotting(POOR)
    expect(m.strength).toBe(0)
    expect(m.knot).toBe('broken-cane')
  })
  it('detects connected (export+import)', () => expect(measureKnotting(RICH).hasConnected).toBe(true))
  it('detects coupled (interface+class)', () => expect(measureKnotting(RICH).hasCoupled).toBe(true))
  it('detects integrated (export+interface)', () => expect(measureKnotting(RICH).hasIntegrated).toBe(true))
  it('counts detached (var) and loose (any)', () => {
    const m = measureKnotting(POOR)
    expect(m.detachedCount).toBe(2)
    expect(m.looseCount).toBe(4)
  })
  it('clean code has no detached or loose', () => {
    const m = measureKnotting(RICH)
    expect(m.hasNoDetached).toBe(true)
    expect(m.hasNoLoose).toBe(true)
    expect(m.hasNoSeparated).toBe(true)
    expect(m.hasNoUnlinked).toBe(true)
  })
  it('moderate has linked and integrated', () => {
    const m = measureKnotting(MODERATE)
    expect(m.hasLinked).toBe(true)
    expect(m.hasIntegrated).toBe(true)
  })
})

describe('measureHollowing', () => {
  it('returns perfectly-hollow for rich', () => {
    const m = measureHollowing(RICH)
    expect(m.efficiency).toBe(100)
    expect(m.core).toBe('perfectly-hollow')
    expect(m.hasHighEfficiency).toBe(true)
  })
  it('returns lead-weight for minimal', () => {
    const m = measureHollowing(MINIMAL)
    expect(m.efficiency).toBe(10)
    expect(m.core).toBe('lead-weight')
  })
  it('returns dense-core for moderate', () => {
    const m = measureHollowing(MODERATE)
    expect(m.efficiency).toBe(39)
    expect(m.core).toBe('dense-core')
  })
  it('returns lead-weight for poor', () => {
    const m = measureHollowing(POOR)
    expect(m.efficiency).toBe(0)
    expect(m.core).toBe('lead-weight')
  })
  it('detects lightweight (const+strictEq)', () => expect(measureHollowing(RICH).hasLightweight).toBe(true))
  it('detects streamlined (returnType+generics)', () => expect(measureHollowing(RICH).hasStreamlined).toBe(true))
  it('detects optimized (const+export)', () => expect(measureHollowing(RICH).hasOptimized).toBe(true))
  it('counts bloated (var) and wasteful (any)', () => {
    const m = measureHollowing(POOR)
    expect(m.bloatedCount).toBe(2)
    expect(m.wastefulCount).toBe(4)
  })
  it('clean code has no bloated or wasteful', () => {
    const m = measureHollowing(RICH)
    expect(m.hasNoBloated).toBe(true)
    expect(m.hasNoWasteful).toBe(true)
    expect(m.hasNoExcessive).toBe(true)
    expect(m.hasNoHeavy).toBe(true)
  })
  it('moderate has optimized', () => {
    expect(measureHollowing(MODERATE).hasOptimized).toBe(true)
  })
})

describe('measureGrowing', () => {
  it('returns rocket-growth for rich', () => {
    const m = measureGrowing(RICH)
    expect(m.speed).toBe(100)
    expect(m.growth).toBe('rocket-growth')
    expect(m.hasHighSpeed).toBe(true)
  })
  it('returns dead-bamboo for minimal', () => {
    const m = measureGrowing(MINIMAL)
    expect(m.speed).toBe(8)
    expect(m.growth).toBe('dead-bamboo')
  })
  it('returns slow-grow for moderate', () => {
    const m = measureGrowing(MODERATE)
    expect(m.speed).toBe(47)
    expect(m.growth).toBe('slow-grow')
  })
  it('returns dead-bamboo for poor', () => {
    const m = measureGrowing(POOR)
    expect(m.speed).toBe(0)
    expect(m.growth).toBe('dead-bamboo')
  })
  it('detects fast (docComments+export)', () => expect(measureGrowing(RICH).hasFast).toBe(true))
  it('detects rapid (interface+class)', () => expect(measureGrowing(RICH).hasRapid).toBe(true))
  it('detects progressing (export+generics)', () => expect(measureGrowing(RICH).hasProgressing).toBe(true))
  it('counts sluggish (var) and stagnant (any)', () => {
    const m = measureGrowing(POOR)
    expect(m.sluggishCount).toBe(2)
    expect(m.stagnantCount).toBe(4)
  })
  it('clean code has no sluggish or stagnant', () => {
    const m = measureGrowing(RICH)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.hasNoStagnant).toBe(true)
    expect(m.hasNoStatic).toBe(true)
    expect(m.hasNoFrozen).toBe(true)
  })
  it('moderate has evolving', () => {
    expect(measureGrowing(MODERATE).hasEvolving).toBe(true)
  })
})

describe('measureResisting', () => {
  it('returns typhoon-proof for rich', () => {
    const m = measureResisting(RICH)
    expect(m.windResistance).toBe(100)
    expect(m.resilience).toBe('typhoon-proof')
    expect(m.hasHighWindResistance).toBe(true)
  })
  it('returns uprooted for minimal', () => {
    const m = measureResisting(MINIMAL)
    expect(m.windResistance).toBe(8)
    expect(m.resilience).toBe('uprooted')
  })
  it('returns blown-over for moderate', () => {
    const m = measureResisting(MODERATE)
    expect(m.windResistance).toBe(29)
    expect(m.resilience).toBe('blown-over')
  })
  it('returns uprooted for poor', () => {
    const m = measureResisting(POOR)
    expect(m.windResistance).toBe(0)
    expect(m.resilience).toBe('uprooted')
  })
  it('detects resilient (tryCatch+async)', () => expect(measureResisting(RICH).hasResilient).toBe(true))
  it('detects sturdy (optionalChaining+nullishCoalescing)', () => expect(measureResisting(RICH).hasSturdy).toBe(true))
  it('detects hardy (tryCatch+const)', () => expect(measureResisting(RICH).hasHardy).toBe(true))
  it('counts fragile (var) and weak (any)', () => {
    const m = measureResisting(POOR)
    expect(m.fragileCount).toBe(2)
    expect(m.weakCount).toBe(4)
  })
  it('clean code has no fragile or weak', () => {
    const m = measureResisting(RICH)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasNoBrittle).toBe(true)
    expect(m.hasNoVulnerable).toBe(true)
  })
  it('moderate has weatherproof', () => {
    expect(measureResisting(MODERATE).hasWeatherproof).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyCaneCondition', () => {
  it('iron-bamboo >= 85', () => expect(classifyCaneCondition(85)).toBe('iron-bamboo'))
  it('strong-cane >= 70', () => expect(classifyCaneCondition(70)).toBe('strong-cane'))
  it('proper-bamboo >= 55', () => expect(classifyCaneCondition(55)).toBe('proper-bamboo'))
  it('green-shoot >= 40', () => expect(classifyCaneCondition(40)).toBe('green-shoot'))
  it('wilted-cane >= 25', () => expect(classifyCaneCondition(25)).toBe('wilted-cane'))
  it('dead-stalk < 25', () => expect(classifyCaneCondition(0)).toBe('dead-stalk'))
})

describe('classifyGardenerGrade', () => {
  it('zen-master >= 80', () => expect(classifyGardenerGrade(80)).toBe('zen-master'))
  it('expert-gardener >= 65', () => expect(classifyGardenerGrade(65)).toBe('expert-gardener'))
  it('skilled-cultivator >= 50', () => expect(classifyGardenerGrade(50)).toBe('skilled-cultivator'))
  it('apprentice >= 35', () => expect(classifyGardenerGrade(35)).toBe('apprentice'))
  it('novice >= 20', () => expect(classifyGardenerGrade(20)).toBe('novice'))
  it('lumberjack < 20', () => expect(classifyGardenerGrade(19)).toBe('lumberjack'))
})

describe('classifyGroveCondition', () => {
  it('lush-grove >= 75', () => expect(classifyGroveCondition(75)).toBe('lush-grove'))
  it('healthy-forest >= 60', () => expect(classifyGroveCondition(60)).toBe('healthy-forest'))
  it('decent-grove >= 45', () => expect(classifyGroveCondition(45)).toBe('decent-grove'))
  it('struggling-patch >= 30', () => expect(classifyGroveCondition(30)).toBe('struggling-patch'))
  it('withered-grove >= 15', () => expect(classifyGroveCondition(15)).toBe('withered-grove'))
  it('dead-land < 15', () => expect(classifyGroveCondition(14)).toBe('dead-land'))
})

describe('classifyGroveType', () => {
  it('returns barren-ground for empty', () => expect(classifyGroveType([])).toBe('barren-ground'))
})

// ─── analyzeBambooCane Tests ───────────────────────────────────────

describe('analyzeBambooCane', () => {
  it('returns iron-bamboo for rich', () => {
    const c = analyzeBambooCane(RICH, 'rich.ts')
    expect(c.qualityScore).toBe(100)
    expect(c.condition).toBe('iron-bamboo')
  })
  it('returns dead-stalk for minimal', () => {
    const c = analyzeBambooCane(MINIMAL, 'minimal.ts')
    expect(c.qualityScore).toBe(8)
    expect(c.condition).toBe('dead-stalk')
  })
  it('returns green-shoot for moderate', () => {
    const c = analyzeBambooCane(MODERATE, 'moderate.ts')
    expect(c.qualityScore).toBe(40)
    expect(c.condition).toBe('green-shoot')
  })
  it('returns dead-stalk for poor', () => {
    const c = analyzeBambooCane(POOR, 'poor.ts')
    expect(c.qualityScore).toBe(0)
    expect(c.condition).toBe('dead-stalk')
  })
  it('contains all measures', () => {
    const c = analyzeBambooCane(RICH, 'test.ts')
    expect(c.bending).toBeDefined()
    expect(c.knotting).toBeDefined()
    expect(c.hollowing).toBeDefined()
    expect(c.growing).toBeDefined()
    expect(c.resisting).toBeDefined()
  })
  it('stores file path', () => {
    const c = analyzeBambooCane(RICH, 'my-file.ts')
    expect(c.file).toBe('my-file.ts')
  })
  it('stores scalar scores', () => {
    const c = analyzeBambooCane(RICH, 'test.ts')
    expect(c.flexibility).toBe(100)
    expect(c.knotStrength).toBe(100)
    expect(c.hollowEfficiency).toBe(100)
    expect(c.growthSpeed).toBe(100)
    expect(c.windResistance).toBe(100)
  })
})

// ─── buildBambooFlexResult Tests ───────────────────────────────────

describe('buildBambooFlexResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalGroves).toBe(1)
    expect(r.stats.avgFlexibility).toBe(35)
    expect(r.stats.avgKnotStrength).toBe(40)
    expect(r.stats.avgHollowEfficiency).toBe(37)
    expect(r.stats.avgGrowthSpeed).toBe(39)
    expect(r.stats.avgWindResistance).toBe(34)
    expect(r.stats.overallVitality).toBe(37)
    expect(r.stats.gardenerGrade).toBe('apprentice')
    expect(r.forest.isResilient).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.ironBambooCount).toBe(1)
    expect(r.stats.strongCaneCount).toBe(0)
    expect(r.stats.properBambooCount).toBe(0)
    expect(r.stats.greenShootCount).toBe(1)
    expect(r.stats.wiltedCaneCount).toBe(0)
    expect(r.stats.deadStalkCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighFlexibilityCount).toBe(1)
    expect(r.stats.hasHighStrengthCount).toBe(1)
    expect(r.stats.hasHighEfficiencyCount).toBe(1)
    expect(r.stats.hasHighSpeedCount).toBe(1)
    expect(r.stats.hasHighWindResistanceCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestCane).toBe('rich.ts')
    expect(r.stats.mostFlexible).toBe('rich.ts')
    expect(r.stats.strongest).toBe('rich.ts')
    expect(r.stats.mostEfficient).toBe('rich.ts')
    expect(r.stats.fastestGrowing).toBe('rich.ts')
  })
  it('classifies grove', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.groves[0]!.groveType).toBe('bamboo-patch')
    expect(r.groves[0]!.condition).toBe('struggling-patch')
  })
  it('generates recommendations', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildBambooFlexResult([], [])
    expect(r.canes).toHaveLength(0)
    expect(r.stats.overallVitality).toBe(0)
  })
  it('returns masterpiece message for all-iron', async () => {
    const r = await buildBambooFlexResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('Your bamboo forest is a masterpiece! Every cane bends with grace and strength')
  })
  it('isResilient when avgFlexibility >= 60', async () => {
    const r = await buildBambooFlexResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.forest.isResilient).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildBambooFlexResult(['src/a.ts', 'lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalGroves).toBe(2)
  })
  it('computes forest averages', async () => {
    const r = await buildBambooFlexResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.forest.avgFlexibility).toBe(35)
    expect(r.forest.avgStrength).toBe(40)
    expect(r.forest.avgEfficiency).toBe(37)
  })
  it('2-rich gets zen-master', async () => {
    const r = await buildBambooFlexResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.stats.overallVitality).toBe(100)
    expect(r.stats.gardenerGrade).toBe('zen-master')
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('supple-reed')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatCaneTable formats cane', () => {
    const c = analyzeBambooCane(RICH, 'rich.ts')
    expect(formatCaneTable(c)).toContain('rich.ts')
  })
  it('formatCanesTable handles empty', () => {
    expect(formatCanesTable([])).toContain('No bamboo canes')
  })
  it('formatGroveTable formats grove', () => {
    const c = analyzeBambooCane(RICH, 'a.ts')
    const grove = analyzeBambooGrove([c], 'src')
    expect(formatGroveTable(grove)).toContain('src')
  })
  it('formatGrovesTable handles empty', () => {
    expect(formatGrovesTable([])).toContain('No bamboo groves')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildBambooFlexResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Forest Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildBambooFlexResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Bamboo Flex Analysis')
    expect(out).toContain('Bamboo Grove Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildBambooFlexResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.canes).toHaveLength(1)
  })
})
