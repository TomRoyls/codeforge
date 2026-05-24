import { describe, it, expect } from 'vitest'
import {
  measureStructuring, measureFaceting, measureStrengthening, measureRefracting, measureResponding,
  analyzeQuartzCrystal, classifyCrystalCondition, classifyCaveType, classifyGemologistGrade,
  classifyCaveCondition, analyzeCrystalCave, buildQuartzLatticeResult,
} from '../src/commands/quartz-lattice-helpers.js'
import {
  colorScore, colorGrade, formatCrystalTable, formatCrystalsTable, formatCaveTable,
  formatCavesTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/quartz-lattice-format-helpers.js'

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

describe('measureStructuring', () => {
  it('returns perfect-crystal for rich', () => {
    const m = measureStructuring(RICH)
    expect(m.regularity).toBe(100)
    expect(m.grade).toBe('perfect-crystal')
    expect(m.hasHighRegularity).toBe(true)
  })
  it('returns shattered for minimal', () => {
    const m = measureStructuring(MINIMAL)
    expect(m.regularity).toBe(10)
    expect(m.grade).toBe('shattered')
  })
  it('returns proper-crystal for moderate', () => {
    const m = measureStructuring(MODERATE)
    expect(m.regularity).toBe(59)
    expect(m.grade).toBe('proper-crystal')
  })
  it('returns shattered for poor', () => {
    const m = measureStructuring(POOR)
    expect(m.regularity).toBe(0)
    expect(m.grade).toBe('shattered')
  })
  it('detects regular (export+import)', () => expect(measureStructuring(RICH).hasRegular).toBe(true))
  it('detects ordered (returnType+const)', () => expect(measureStructuring(RICH).hasOrdered).toBe(true))
  it('detects periodic (optionalChaining+nullishCoalescing)', () => expect(measureStructuring(RICH).hasPeriodic).toBe(true))
  it('counts disorder (var) and asymmetric (any)', () => {
    const m = measureStructuring(POOR)
    expect(m.disorderCount).toBe(2)
    expect(m.asymmetricCount).toBe(4)
    expect(m.hasNoDisorder).toBe(false)
    expect(m.hasNoAsymmetric).toBe(false)
  })
  it('clean code has no disorder or asymmetric', () => {
    const m = measureStructuring(RICH)
    expect(m.hasNoDisorder).toBe(true)
    expect(m.hasNoAsymmetric).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.hasNoIrregular).toBe(true)
  })
})

describe('measureFaceting', () => {
  it('returns brilliant-cut for rich', () => {
    const m = measureFaceting(RICH)
    expect(m.quality).toBe(100)
    expect(m.cut).toBe('brilliant-cut')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns chipped for minimal', () => {
    const m = measureFaceting(MINIMAL)
    expect(m.quality).toBe(8)
    expect(m.cut).toBe('chipped')
  })
  it('returns rough-cut for moderate', () => {
    const m = measureFaceting(MODERATE)
    expect(m.quality).toBe(52)
    expect(m.cut).toBe('rough-cut')
  })
  it('detects polished (export+import)', () => expect(measureFaceting(RICH).hasPolished).toBe(true))
  it('detects smooth (interface+class)', () => expect(measureFaceting(RICH).hasSmooth).toBe(true))
  it('detects pristine (export+interface)', () => expect(measureFaceting(RICH).hasPristine).toBe(true))
  it('counts rough (var) and blurred (any)', () => {
    const m = measureFaceting(POOR)
    expect(m.roughCount).toBe(2)
    expect(m.blurredCount).toBe(4)
  })
  it('clean code has no rough or blurred', () => {
    const m = measureFaceting(RICH)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasNoBlurred).toBe(true)
    expect(m.hasNoDull).toBe(true)
    expect(m.hasNoScratched).toBe(true)
  })
})

describe('measureStrengthening', () => {
  it('returns diamond-lattice for rich', () => {
    const m = measureStrengthening(RICH)
    expect(m.strength).toBe(100)
    expect(m.lattice).toBe('diamond-lattice')
    expect(m.hasHighStrength).toBe(true)
  })
  it('returns broken-lattice for minimal', () => {
    const m = measureStrengthening(MINIMAL)
    expect(m.strength).toBe(8)
    expect(m.lattice).toBe('broken-lattice')
  })
  it('returns micro-fractures for moderate', () => {
    const m = measureStrengthening(MODERATE)
    expect(m.strength).toBe(37)
    expect(m.lattice).toBe('micro-fractures')
  })
  it('detects solid (tryCatch+async)', () => expect(measureStrengthening(RICH).hasSolid).toBe(true))
  it('detects robust (optionalChaining+nullishCoalescing)', () => expect(measureStrengthening(RICH).hasRobust).toBe(true))
  it('detects stable (export+const)', () => {
    expect(measureStrengthening(RICH).hasStable).toBe(true)
    expect(measureStrengthening(MODERATE).hasStable).toBe(true)
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
    expect(m.hasNoCracked).toBe(true)
    expect(m.hasNoUnstable).toBe(true)
  })
})

describe('measureRefracting', () => {
  it('returns total-internal-reflection for rich', () => {
    const m = measureRefracting(RICH)
    expect(m.clarity).toBe(100)
    expect(m.index).toBe('total-internal-reflection')
    expect(m.hasHighClarity).toBe(true)
  })
  it('returns black-body for minimal', () => {
    const m = measureRefracting(MINIMAL)
    expect(m.clarity).toBe(8)
    expect(m.index).toBe('black-body')
  })
  it('returns low-refraction for moderate', () => {
    const m = measureRefracting(MODERATE)
    expect(m.clarity).toBe(47)
    expect(m.index).toBe('low-refraction')
  })
  it('detects transparent (docComments+export)', () => expect(measureRefracting(RICH).hasTransparent).toBe(true))
  it('detects clear (interface+class)', () => expect(measureRefracting(RICH).hasClear).toBe(true))
  it('detects brilliant (export+generics)', () => expect(measureRefracting(RICH).hasBrilliant).toBe(true))
  it('counts opaque (var) and hidden (any)', () => {
    const m = measureRefracting(POOR)
    expect(m.opaqueCount).toBe(2)
    expect(m.hiddenCount).toBe(4)
  })
  it('clean code has no opaque or hidden', () => {
    const m = measureRefracting(RICH)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoDark).toBe(true)
    expect(m.hasNoConcealing).toBe(true)
  })
})

describe('measureResponding', () => {
  it('returns hyper-responsive for rich', () => {
    const m = measureResponding(RICH)
    expect(m.reactivity).toBe(100)
    expect(m.response).toBe('hyper-responsive')
    expect(m.hasHighReactivity).toBe(true)
  })
  it('returns inert for minimal', () => {
    const m = measureResponding(MINIMAL)
    expect(m.reactivity).toBe(10)
    expect(m.response).toBe('inert')
  })
  it('returns delayed for moderate', () => {
    const m = measureResponding(MODERATE)
    expect(m.reactivity).toBe(39)
    expect(m.response).toBe('delayed')
  })
  it('detects reactive (const+strictEq)', () => expect(measureResponding(RICH).hasReactive).toBe(true))
  it('detects responsive (export+docComments)', () => expect(measureResponding(RICH).hasResponsive).toBe(true))
  it('detects energetic (const+export)', () => {
    expect(measureResponding(RICH).hasEnergetic).toBe(true)
    expect(measureResponding(MODERATE).hasEnergetic).toBe(true)
  })
  it('counts sluggish (var) and slow (any)', () => {
    const m = measureResponding(POOR)
    expect(m.sluggishCount).toBe(2)
    expect(m.slowCount).toBe(4)
  })
  it('clean code has no sluggish or slow', () => {
    const m = measureResponding(RICH)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.hasNoSlow).toBe(true)
    expect(m.hasNoStatic).toBe(true)
    expect(m.hasNoDead).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyCrystalCondition', () => {
  it('flawless-gem >= 85', () => expect(classifyCrystalCondition(85)).toBe('flawless-gem'))
  it('high-grade-crystal >= 70', () => expect(classifyCrystalCondition(70)).toBe('high-grade-crystal'))
  it('proper-quartz >= 55', () => expect(classifyCrystalCondition(55)).toBe('proper-quartz'))
  it('cloudy-mineral >= 40', () => expect(classifyCrystalCondition(40)).toBe('cloudy-mineral'))
  it('cracked-stone >= 25', () => expect(classifyCrystalCondition(25)).toBe('cracked-stone'))
  it('gravel < 25', () => expect(classifyCrystalCondition(0)).toBe('gravel'))
})

describe('classifyGemologistGrade', () => {
  it('master-gemologist >= 80', () => expect(classifyGemologistGrade(80)).toBe('master-gemologist'))
  it('expert-crystallographer >= 65', () => expect(classifyGemologistGrade(65)).toBe('expert-crystallographer'))
  it('skilled-mineralogist >= 50', () => expect(classifyGemologistGrade(50)).toBe('skilled-mineralogist'))
  it('apprentice >= 35', () => expect(classifyGemologistGrade(35)).toBe('apprentice'))
  it('rock-hound >= 20', () => expect(classifyGemologistGrade(20)).toBe('rock-hound'))
  it('coal-miner < 20', () => expect(classifyGemologistGrade(19)).toBe('coal-miner'))
})

describe('classifyCaveCondition', () => {
  it('treasure-trove >= 75', () => expect(classifyCaveCondition(75)).toBe('treasure-trove'))
  it('gem-mine >= 60', () => expect(classifyCaveCondition(60)).toBe('gem-mine'))
  it('quartz-quarry >= 45', () => expect(classifyCaveCondition(45)).toBe('quartz-quarry'))
  it('rocky-mine >= 30', () => expect(classifyCaveCondition(30)).toBe('rocky-mine'))
  it('spent-mine >= 15', () => expect(classifyCaveCondition(15)).toBe('spent-mine'))
  it('caved-in < 15', () => expect(classifyCaveCondition(14)).toBe('caved-in'))
})

describe('classifyCaveType', () => {
  it('returns empty-shaft for empty', () => expect(classifyCaveType([])).toBe('empty-shaft'))
})

// ─── analyzeQuartzCrystal Tests ────────────────────────────────────

describe('analyzeQuartzCrystal', () => {
  it('returns flawless-gem for rich', () => {
    const c = analyzeQuartzCrystal(RICH, 'rich.ts')
    expect(c.qualityScore).toBe(100)
    expect(c.condition).toBe('flawless-gem')
  })
  it('returns gravel for minimal', () => {
    const c = analyzeQuartzCrystal(MINIMAL, 'minimal.ts')
    expect(c.qualityScore).toBe(9)
    expect(c.condition).toBe('gravel')
  })
  it('returns cloudy-mineral for moderate', () => {
    const c = analyzeQuartzCrystal(MODERATE, 'moderate.ts')
    expect(c.qualityScore).toBe(47)
    expect(c.condition).toBe('cloudy-mineral')
  })
  it('returns gravel for poor', () => {
    const c = analyzeQuartzCrystal(POOR, 'poor.ts')
    expect(c.qualityScore).toBe(0)
    expect(c.condition).toBe('gravel')
  })
  it('contains all measures', () => {
    const c = analyzeQuartzCrystal(RICH, 'test.ts')
    expect(c.structuring).toBeDefined()
    expect(c.faceting).toBeDefined()
    expect(c.strengthening).toBeDefined()
    expect(c.refracting).toBeDefined()
    expect(c.responding).toBeDefined()
  })
})

// ─── buildQuartzLatticeResult Tests ────────────────────────────────

describe('buildQuartzLatticeResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalCaves).toBe(1)
    expect(r.stats.avgCrystallineStructure).toBe(42)
    expect(r.stats.avgFacetQuality).toBe(40)
    expect(r.stats.avgLatticeStrength).toBe(36)
    expect(r.stats.avgRefractionIndex).toBe(39)
    expect(r.stats.avgPiezoelectricResponse).toBe(37)
    expect(r.stats.overallPurity).toBe(39)
    expect(r.stats.gemologistGrade).toBe('apprentice')
    expect(r.formation.isCrystalline).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.flawlessGemCount).toBe(1)
    expect(r.stats.cloudyMineralCount).toBe(1)
    expect(r.stats.gravelCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighRegularityCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighStrengthCount).toBe(1)
    expect(r.stats.hasHighClarityCount).toBe(1)
    expect(r.stats.hasHighReactivityCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestCrystal).toBe('rich.ts')
    expect(r.stats.mostRegular).toBe('rich.ts')
    expect(r.stats.bestFaceted).toBe('rich.ts')
    expect(r.stats.strongest).toBe('rich.ts')
    expect(r.stats.clearest).toBe('rich.ts')
  })
  it('classifies cave', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.caves[0]!.caveType).toBe('rocky-cave')
    expect(r.caves[0]!.condition).toBe('rocky-mine')
  })
  it('generates recommendations', async () => {
    const r = await buildQuartzLatticeResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildQuartzLatticeResult([], [])
    expect(r.crystals).toHaveLength(0)
    expect(r.stats.overallPurity).toBe(0)
  })
  it('returns perfect message for all-flawless', async () => {
    const r = await buildQuartzLatticeResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('Your quartz lattice is flawless! Every crystal refracts with perfection')
  })
  it('isCrystalline when avgRegularity >= 60', async () => {
    const r = await buildQuartzLatticeResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.formation.isCrystalline).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildQuartzLatticeResult(['src/a.ts','lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalCaves).toBe(2)
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('perfect-crystal')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatCrystalTable formats crystal', () => {
    const c = analyzeQuartzCrystal(RICH, 'rich.ts')
    expect(formatCrystalTable(c)).toContain('rich.ts')
  })
  it('formatCrystalsTable handles empty', () => {
    expect(formatCrystalsTable([])).toContain('No quartz crystals')
  })
  it('formatCaveTable formats cave', () => {
    const c = analyzeQuartzCrystal(RICH, 'a.ts')
    const cave = analyzeCrystalCave([c], 'src')
    expect(formatCaveTable(cave)).toContain('src')
  })
  it('formatCavesTable handles empty', () => {
    expect(formatCavesTable([])).toContain('No crystal caves')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildQuartzLatticeResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Formation Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildQuartzLatticeResult(['a.ts','b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Quartz Crystal Analysis')
    expect(out).toContain('Crystal Cave Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildQuartzLatticeResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.crystals).toHaveLength(1)
  })
})
