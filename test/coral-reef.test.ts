import { describe, it, expect } from 'vitest'
import {
  measureDiversifying,
  measureColonizing,
  measureStrengthening,
  measureStructuring,
  measureAdapting,
  analyzeCoralPolyp,
  classifyPolypCondition,
  classifyReefType,
  classifyMarineGrade,
  classifyReefCondition,
  generateRecommendations,
  analyzeReefSystem,
  buildCoralReefResult,
} from '../src/commands/coral-reef-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPolypTable,
  formatPolypsTable,
  formatReefTable,
  formatReefsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/coral-reef-format-helpers.js'

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

describe('measureDiversifying', () => {
  it('returns great-barrier for rich content', () => {
    const m = measureDiversifying(RICH)
    expect(m.diversity).toBe(100)
    expect(m.grade).toBe('great-barrier')
    expect(m.hasHighDiversity).toBe(true)
  })

  it('returns dead-zone for minimal content', () => {
    const m = measureDiversifying(MINIMAL)
    expect(m.diversity).toBe(8)
    expect(m.grade).toBe('dead-zone')
    expect(m.hasHighDiversity).toBe(false)
  })

  it('returns bleached-coral for moderate content', () => {
    const m = measureDiversifying(MODERATE)
    expect(m.diversity).toBe(39)
    expect(m.grade).toBe('bleached-coral')
  })

  it('returns dead-zone for poor content', () => {
    const m = measureDiversifying(POOR)
    expect(m.diversity).toBe(0)
    expect(m.grade).toBe('dead-zone')
  })

  it('detects varied (export + import)', () => {
    expect(measureDiversifying(RICH).hasVaried).toBe(true)
    expect(measureDiversifying(MINIMAL).hasVaried).toBe(false)
  })

  it('detects diverse (interface + class)', () => {
    expect(measureDiversifying(RICH).hasDiverse).toBe(true)
  })

  it('detects rich (generics + typeAlias)', () => {
    expect(measureDiversifying(RICH).hasRich).toBe(true)
  })

  it('detects colorful (async + docComments)', () => {
    expect(measureDiversifying(RICH).hasColorful).toBe(true)
  })

  it('detects abundant (namedExport + const)', () => {
    expect(measureDiversifying(RICH).hasAbundant).toBe(true)
    expect(measureDiversifying(MODERATE).hasAbundant).toBe(true)
  })

  it('detects teeming (export + generics)', () => {
    expect(measureDiversifying(RICH).hasTeeming).toBe(true)
  })

  it('counts monoculture (var) and barren (any)', () => {
    const m = measureDiversifying(POOR)
    expect(m.monocultureCount).toBe(2)
    expect(m.barrenCount).toBe(4)
    expect(m.hasNoMonoculture).toBe(false)
    expect(m.hasNoBarren).toBe(false)
  })

  it('clean code has no monoculture or barren', () => {
    const m = measureDiversifying(RICH)
    expect(m.hasNoMonoculture).toBe(true)
    expect(m.hasNoBarren).toBe(true)
    expect(m.hasNoUniform).toBe(true)
    expect(m.hasNoSparse).toBe(true)
  })
})

describe('measureColonizing', () => {
  it('returns vibrant-colony for rich content', () => {
    const m = measureColonizing(RICH)
    expect(m.health).toBe(100)
    expect(m.colony).toBe('vibrant-colony')
    expect(m.hasHighHealth).toBe(true)
  })

  it('returns collapsed-colony for minimal', () => {
    const m = measureColonizing(MINIMAL)
    expect(m.health).toBe(8)
    expect(m.colony).toBe('collapsed-colony')
  })

  it('returns stable-colony for moderate', () => {
    const m = measureColonizing(MODERATE)
    expect(m.health).toBe(57)
    expect(m.colony).toBe('stable-colony')
  })

  it('detects connected (export + import)', () => {
    expect(measureColonizing(RICH).hasConnected).toBe(true)
  })

  it('detects symbiotic (interface + returnType)', () => {
    expect(measureColonizing(RICH).hasSymbiotic).toBe(true)
    expect(measureColonizing(MODERATE).hasSymbiotic).toBe(true)
  })

  it('detects cohesive (export + interface)', () => {
    expect(measureColonizing(RICH).hasCohesive).toBe(true)
    expect(measureColonizing(MODERATE).hasCohesive).toBe(true)
  })

  it('counts isolated (var) and conflicting (any)', () => {
    const m = measureColonizing(POOR)
    expect(m.isolatedCount).toBe(2)
    expect(m.conflictingCount).toBe(4)
    expect(m.hasNoIsolated).toBe(false)
    expect(m.hasNoConflicting).toBe(false)
  })

  it('clean code has no isolated or conflicting', () => {
    const m = measureColonizing(RICH)
    expect(m.hasNoIsolated).toBe(true)
    expect(m.hasNoConflicting).toBe(true)
    expect(m.hasNoParasitic).toBe(true)
    expect(m.hasNoFragmented).toBe(true)
  })
})

describe('measureStrengthening', () => {
  it('returns giant-polyp for rich content', () => {
    const m = measureStrengthening(RICH)
    expect(m.strength).toBe(100)
    expect(m.polyp).toBe('giant-polyp')
    expect(m.hasHighStrength).toBe(true)
  })

  it('returns dissolved for minimal', () => {
    const m = measureStrengthening(MINIMAL)
    expect(m.strength).toBe(10)
    expect(m.polyp).toBe('dissolved')
  })

  it('returns weak-polyp for moderate', () => {
    const m = measureStrengthening(MODERATE)
    expect(m.strength).toBe(41)
    expect(m.polyp).toBe('weak-polyp')
  })

  it('detects solid (const + strictEq)', () => {
    expect(measureStrengthening(RICH).hasSolid).toBe(true)
  })

  it('detects robust (interface + readonly)', () => {
    expect(measureStrengthening(RICH).hasRobust).toBe(true)
  })

  it('detects hardy (const + returnType)', () => {
    expect(measureStrengthening(RICH).hasHardy).toBe(true)
    expect(measureStrengthening(MODERATE).hasHardy).toBe(true)
  })

  it('counts fragile (var) and brittle (any)', () => {
    const m = measureStrengthening(POOR)
    expect(m.fragileCount).toBe(2)
    expect(m.brittleCount).toBe(4)
  })

  it('clean code has no fragile or brittle', () => {
    const m = measureStrengthening(RICH)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoBrittle).toBe(true)
    expect(m.hasNoBreakable).toBe(true)
    expect(m.hasNoCrumbly).toBe(true)
  })
})

describe('measureStructuring', () => {
  it('returns massive-reef for rich content', () => {
    const m = measureStructuring(RICH)
    expect(m.structure).toBe(100)
    expect(m.architecture).toBe('massive-reef')
    expect(m.hasHighStructure).toBe(true)
  })

  it('returns rubble for minimal', () => {
    const m = measureStructuring(MINIMAL)
    expect(m.structure).toBe(8)
    expect(m.architecture).toBe('rubble')
  })

  it('returns encrusting for moderate', () => {
    const m = measureStructuring(MODERATE)
    expect(m.structure).toBe(52)
    expect(m.architecture).toBe('encrusting')
  })

  it('detects organized (interface + export)', () => {
    expect(measureStructuring(RICH).hasOrganized).toBe(true)
    expect(measureStructuring(MODERATE).hasOrganized).toBe(true)
  })

  it('detects patterned (namedExport + returnType)', () => {
    expect(measureStructuring(RICH).hasPatterned).toBe(true)
    expect(measureStructuring(MODERATE).hasPatterned).toBe(true)
  })

  it('counts chaotic (var) and random (any)', () => {
    const m = measureStructuring(POOR)
    expect(m.chaoticCount).toBe(2)
    expect(m.randomCount).toBe(4)
  })

  it('clean code has no chaotic or random', () => {
    const m = measureStructuring(RICH)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasNoHaphazard).toBe(true)
    expect(m.hasNoMessy).toBe(true)
  })
})

describe('measureAdapting', () => {
  it('returns deep-current for rich content', () => {
    const m = measureAdapting(RICH)
    expect(m.resilience).toBe(100)
    expect(m.adaptation).toBe('deep-current')
    expect(m.hasHighResilience).toBe(true)
  })

  it('returns beached for minimal', () => {
    const m = measureAdapting(MINIMAL)
    expect(m.resilience).toBe(8)
    expect(m.adaptation).toBe('beached')
  })

  it('returns weak-current for moderate', () => {
    const m = measureAdapting(MODERATE)
    expect(m.resilience).toBe(42)
    expect(m.adaptation).toBe('weak-current')
  })

  it('detects adaptable (async + tryCatch)', () => {
    expect(measureAdapting(RICH).hasAdaptable).toBe(true)
  })

  it('detects flexible (optionalChaining + nullishCoalescing)', () => {
    expect(measureAdapting(RICH).hasFlexible).toBe(true)
  })

  it('detects flowing (const + export)', () => {
    expect(measureAdapting(RICH).hasFlowing).toBe(true)
    expect(measureAdapting(MODERATE).hasFlowing).toBe(true)
  })

  it('detects dynamic (interface + returnType)', () => {
    expect(measureAdapting(RICH).hasDynamic).toBe(true)
    expect(measureAdapting(MODERATE).hasDynamic).toBe(true)
  })

  it('counts rigid (var) and stuck (any)', () => {
    const m = measureAdapting(POOR)
    expect(m.rigidCount).toBe(2)
    expect(m.stuckCount).toBe(4)
  })

  it('clean code has no rigid or stuck', () => {
    const m = measureAdapting(RICH)
    expect(m.hasNoRigid).toBe(true)
    expect(m.hasNoStuck).toBe(true)
    expect(m.hasNoStiff).toBe(true)
    expect(m.hasNoStatic).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyPolypCondition', () => {
  it('returns barrier-reef for 85+', () => expect(classifyPolypCondition(85)).toBe('barrier-reef'))
  it('returns atoll-reef for 70-84', () => expect(classifyPolypCondition(70)).toBe('atoll-reef'))
  it('returns fringing-reef for 55-69', () => expect(classifyPolypCondition(55)).toBe('fringing-reef'))
  it('returns patch-reef for 40-54', () => expect(classifyPolypCondition(40)).toBe('patch-reef'))
  it('returns dead-coral for 25-39', () => expect(classifyPolypCondition(25)).toBe('dead-coral'))
  it('returns sandbar for < 25', () => expect(classifyPolypCondition(24)).toBe('sandbar'))
  it('returns sandbar for 0', () => expect(classifyPolypCondition(0)).toBe('sandbar'))
})

describe('classifyMarineGrade', () => {
  it('returns marine-biologist for 80+', () => expect(classifyMarineGrade(80)).toBe('marine-biologist'))
  it('returns reef-guardian for 65-79', () => expect(classifyMarineGrade(65)).toBe('reef-guardian'))
  it('returns ocean-steward for 50-64', () => expect(classifyMarineGrade(50)).toBe('ocean-steward'))
  it('returns beachcomber for 35-49', () => expect(classifyMarineGrade(35)).toBe('beachcomber'))
  it('returns tourist for 20-34', () => expect(classifyMarineGrade(20)).toBe('tourist'))
  it('returns polluter for < 20', () => expect(classifyMarineGrade(19)).toBe('polluter'))
})

describe('classifyReefCondition', () => {
  it('returns pristine-reef for 75+', () => expect(classifyReefCondition(75)).toBe('pristine-reef'))
  it('returns healthy-reef for 60-74', () => expect(classifyReefCondition(60)).toBe('healthy-reef'))
  it('returns fair-reef for 45-59', () => expect(classifyReefCondition(45)).toBe('fair-reef'))
  it('returns stressed-reef for 30-44', () => expect(classifyReefCondition(30)).toBe('stressed-reef'))
  it('returns degraded-reef for 15-29', () => expect(classifyReefCondition(15)).toBe('degraded-reef'))
  it('returns dead-reef for < 15', () => expect(classifyReefCondition(14)).toBe('dead-reef'))
})

describe('classifyReefType', () => {
  it('returns barren-coast for empty polyps', () => {
    expect(classifyReefType([])).toBe('barren-coast')
  })
})

// ─── analyzeCoralPolyp Tests ───────────────────────────────────────

describe('analyzeCoralPolyp', () => {
  it('returns barrier-reef for rich content', () => {
    const p = analyzeCoralPolyp(RICH, 'rich.ts')
    expect(p.qualityScore).toBe(100)
    expect(p.condition).toBe('barrier-reef')
    expect(p.biodiversity).toBe(100)
    expect(p.colonyHealth).toBe(100)
    expect(p.polypStrength).toBe(100)
    expect(p.reefStructure).toBe(100)
    expect(p.currentResilience).toBe(100)
  })

  it('returns sandbar for minimal content', () => {
    const p = analyzeCoralPolyp(MINIMAL, 'minimal.ts')
    expect(p.qualityScore).toBe(8)
    expect(p.condition).toBe('sandbar')
    expect(p.biodiversity).toBe(8)
    expect(p.colonyHealth).toBe(8)
    expect(p.polypStrength).toBe(10)
    expect(p.reefStructure).toBe(8)
    expect(p.currentResilience).toBe(8)
  })

  it('returns patch-reef for moderate content', () => {
    const p = analyzeCoralPolyp(MODERATE, 'moderate.ts')
    expect(p.qualityScore).toBe(46)
    expect(p.condition).toBe('patch-reef')
    expect(p.biodiversity).toBe(39)
    expect(p.colonyHealth).toBe(57)
    expect(p.polypStrength).toBe(41)
    expect(p.reefStructure).toBe(52)
    expect(p.currentResilience).toBe(42)
  })

  it('returns sandbar for poor content', () => {
    const p = analyzeCoralPolyp(POOR, 'poor.ts')
    expect(p.qualityScore).toBe(0)
    expect(p.condition).toBe('sandbar')
  })

  it('contains all measure objects', () => {
    const p = analyzeCoralPolyp(RICH, 'test.ts')
    expect(p.diversifying).toBeDefined()
    expect(p.colonizing).toBeDefined()
    expect(p.strengthening).toBeDefined()
    expect(p.structuring).toBeDefined()
    expect(p.adapting).toBeDefined()
  })
})

// ─── analyzeReefSystem Tests ───────────────────────────────────────

describe('analyzeReefSystem', () => {
  it('returns empty reef for no polyps', () => {
    const reef = analyzeReefSystem([], 'empty')
    expect(reef.reefType).toBe('barren-coast')
    expect(reef.condition).toBe('dead-reef')
  })

  it('computes reef averages correctly', () => {
    const p1 = analyzeCoralPolyp(RICH, 'a.ts')
    const p2 = analyzeCoralPolyp(MINIMAL, 'b.ts')
    const reef = analyzeReefSystem([p1, p2], 'test')
    expect(reef.avgBiodiversity).toBe(54)
    expect(reef.barrierReefCount).toBe(1)
    expect(reef.sandbarCount).toBe(1)
  })
})

// ─── buildCoralReefResult Tests ────────────────────────────────────

describe('buildCoralReefResult', () => {
  it('computes full result for 4-file mix', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.totalReefs).toBe(1)
    expect(result.stats.avgBiodiversity).toBe(37)
    expect(result.stats.avgColonyHealth).toBe(41)
    expect(result.stats.avgPolypStrength).toBe(38)
    expect(result.stats.avgReefStructure).toBe(40)
    expect(result.stats.avgCurrentResilience).toBe(38)
    expect(result.stats.overallHealth).toBe(38)
    expect(result.stats.marineGrade).toBe('beachcomber')
    expect(result.ocean.isThriving).toBe(false)
  })

  it('computes condition counts correctly', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.barrierReefCount).toBe(1)
    expect(result.stats.atollReefCount).toBe(0)
    expect(result.stats.fringingReefCount).toBe(0)
    expect(result.stats.patchReefCount).toBe(1)
    expect(result.stats.deadCoralCount).toBe(0)
    expect(result.stats.sandbarCount).toBe(2)
  })

  it('computes high boolean counts correctly', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.hasHighDiversityCount).toBe(1)
    expect(result.stats.hasHighHealthCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighStructureCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
  })

  it('identifies best files correctly', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.stats.bestPolyp).toBe('rich.ts')
    expect(result.stats.mostDiverse).toBe('rich.ts')
    expect(result.stats.healthiest).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.bestStructured).toBe('rich.ts')
  })

  it('classifies reef correctly', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.reefs[0]!.reefType).toBe('patch-reef')
    expect(result.reefs[0]!.condition).toBe('stressed-reef')
  })

  it('generates recommendations', async () => {
    const result = await buildCoralReefResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('2 file(s) are sandbars — consider significant refactoring')
  })

  it('handles empty input', async () => {
    const result = await buildCoralReefResult([], [])
    expect(result.polyps).toHaveLength(0)
    expect(result.stats.overallHealth).toBe(0)
    expect(result.ocean.isThriving).toBe(false)
  })

  it('returns thriving message for all-barrier-reef polyps', async () => {
    const result = await buildCoralReefResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(result.recommendations).toContain('Your coral reef is thriving! The ecosystem is healthy and resilient')
  })

  it('isThriving is true when avgBiodiversity >= 60', async () => {
    const result = await buildCoralReefResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(result.ocean.isThriving).toBe(true)
  })

  it('groups files by directory', async () => {
    const result = await buildCoralReefResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MODERATE, MINIMAL],
    )
    expect(result.stats.totalReefs).toBe(2)
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('great-barrier')).toBe('string')
    expect(typeof colorGrade('dead-zone')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatPolypTable', () => {
  it('formats a polyp', () => {
    const p = analyzeCoralPolyp(RICH, 'rich.ts')
    const out = formatPolypTable(p)
    expect(out).toContain('rich.ts')
    expect(out).toContain('Biodiversity:')
    expect(out).toContain('Score:')
  })
})

describe('formatPolypsTable', () => {
  it('formats empty array', () => {
    expect(formatPolypsTable([])).toContain('No coral polyps')
  })

  it('formats multiple polyps', () => {
    const polyps = [analyzeCoralPolyp(RICH, 'a.ts'), analyzeCoralPolyp(MINIMAL, 'b.ts')]
    const out = formatPolypsTable(polyps)
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
  })
})

describe('formatReefTable', () => {
  it('formats a reef', () => {
    const p = analyzeCoralPolyp(RICH, 'a.ts')
    const reef = analyzeReefSystem([p], 'src')
    const out = formatReefTable(reef)
    expect(out).toContain('src')
    expect(out).toContain('Type:')
  })
})

describe('formatReefsTable', () => {
  it('formats empty reefs', () => {
    expect(formatReefsTable([])).toContain('No reef systems')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCoralReefResult(['rich.ts', 'minimal.ts'], [RICH, MINIMAL])
    const out = formatStatsTable(result.stats)
    expect(out).toContain('Ocean Statistics')
    expect(out).toContain('Total Files:')
    expect(out).toContain('Marine Grade:')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const out = formatRecommendations(['Fix A', 'Fix B'])
    expect(out).toContain('Fix A')
    expect(out).toContain('•')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCoralReefResult(['rich.ts', 'minimal.ts'], [RICH, MINIMAL])
    const out = formatResultTable(result)
    expect(out).toContain('Coral Polyp Analysis')
    expect(out).toContain('Reef System Analysis')
    expect(out).toContain('Ocean Statistics')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildCoralReefResult(['rich.ts'], [RICH])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.polyps).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
