import { describe, it, expect } from 'vitest'

import {
  measureFortifying,
  measureProtecting,
  measureFlowering,
  measureRooting,
  measureEnergizing,
  classifyBloomCondition,
  classifyPlotType,
  classifyPlotCondition,
  classifyGardenerGrade,
  analyzeIronBloom,
  analyzeIronPlot,
  generateRecommendations,
  buildIronGardenResult,
} from '../src/commands/iron-garden-helpers.js'

import {
  colorScore,
  colorGrade,
  formatBloomTable,
  formatBloomsTable,
  formatPlotTable,
  formatPlotsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/iron-garden-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `/**
 * A rich module
 */
export interface Widget<T> {
  readonly id: string
  name?: string
}

export type Status = 'active' | 'inactive'

export enum Color { Red, Green, Blue }

export class Processor {
  private items: Widget<string>[] = []

  async run(): Promise<void> {
    try {
      const found = this.items.find(i => i.id !== '')
      if (found) {
        throw new Error('Found')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function helper(val: string): string {
  return val
}
`

const badContent = `var x = eval("1 + 2")
debugger
// TODO: fix this
// FIXME: broken
console.log(x as any)
`

const emptyContent = ''

const perfectContent = `/**
 * Perfect module
 */
import { Base } from './base.js'

export interface Perfect<T> {
  readonly id: string
  name?: string
}

export type Result = 'success' | 'failure'

export enum Grade { A, B, C }

export abstract class BaseService {
  abstract execute(): Promise<void>

  protected validate(input: string): boolean {
    return input.length > 0
  }
}

export class MainService extends BaseService implements MainService {
  private data: Perfect<string>[] = []

  async execute(): Promise<void> {
    try {
      const result = this.data.find(d => d.id !== '')
      if (result) {
        throw new Error('validation failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function compute(value: string): string {
  return value
}
`

// ─── measureFortifying ─────────────────────────────────────────────

describe('measureFortifying', () => {
  it('scores minimal content', () => {
    const m = measureFortifying(minimalContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
    expect(m.strength).toBeLessThanOrEqual(100)
    expect(typeof m.iron).toBe('string')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureFortifying(richContent)
    const minimal = measureFortifying(minimalContent)
    expect(rich.strength).toBeGreaterThan(minimal.strength)
  })

  it('penalizes var usage', () => {
    const m = measureFortifying('var x = 1')
    expect(m.strength).toBeLessThan(50)
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBeGreaterThan(0)
  })

  it('penalizes eval', () => {
    const m = measureFortifying('eval("code")')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.hasNoNaive).toBe(false)
    expect(m.bareCrashCount).toBeGreaterThan(0)
  })

  it('penalizes debugger', () => {
    const m = measureFortifying('debugger')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBeGreaterThan(0)
  })

  it('rewards try/catch and throw', () => {
    const m = measureFortifying(richContent)
    expect(m.hasTested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
  })

  it('detects robust exports', () => {
    const m = measureFortifying(richContent)
    expect(m.hasRobust).toBe(true)
  })

  it('detects type safe code', () => {
    const m = measureFortifying(richContent)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasNoUnsafe).toBe(true)
  })

  it('detects organized code', () => {
    const m = measureFortifying(richContent)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
  })

  it('detects growing (doc + export)', () => {
    const m = measureFortifying(richContent)
    expect(m.hasGrowing).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureFortifying(emptyContent)
    expect(m.strength).toBeGreaterThanOrEqual(0)
    expect(m.iron).toBe('no-strength')
  })
})

// ─── measureProtecting ─────────────────────────────────────────────

describe('measureProtecting', () => {
  it('scores minimal content', () => {
    const m = measureProtecting(minimalContent)
    expect(m.resistance).toBeGreaterThanOrEqual(0)
    expect(m.resistance).toBeLessThanOrEqual(100)
    expect(typeof m.coat).toBe('string')
  })

  it('rewards interfaces and generics', () => {
    const m = measureProtecting(richContent)
    expect(m.hasPolished).toBe(true)
    expect(m.hasFresh).toBe(true)
  })

  it('penalizes var as dead code', () => {
    const m = measureProtecting('var x = 1')
    expect(m.deadCodeCount).toBeGreaterThan(0)
    expect(m.hasNoDeadCode).toBe(false)
    expect(m.hasNoDuplicates).toBe(false)
  })

  it('penalizes as any as hacky', () => {
    const m = measureProtecting('const x = y as any')
    expect(m.hackyCount).toBeGreaterThan(0)
    expect(m.hasNoHacky).toBe(false)
  })

  it('penalizes TODO/FIXME', () => {
    const m = measureProtecting('// TODO: fix this')
    expect(m.hasNoAbandoned).toBe(false)
    expect(m.hasMaintained).toBe(false)
  })

  it('detects clean code', () => {
    const m = measureProtecting(richContent)
    expect(m.hasClean).toBe(true)
    expect(m.hasNoDeprecated).toBe(true)
  })

  it('detects modern code', () => {
    const m = measureProtecting(richContent)
    expect(m.hasModern).toBe(true)
  })

  it('detects maintained code', () => {
    const m = measureProtecting(richContent)
    expect(m.hasMaintained).toBe(true)
  })

  it('detects no tarnished', () => {
    const m = measureProtecting(richContent)
    expect(m.hasNoTarnished).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureProtecting(emptyContent)
    expect(m.resistance).toBeGreaterThanOrEqual(0)
    expect(m.coat).toBe('no-resistance')
  })
})

// ─── measureFlowering ──────────────────────────────────────────────

describe('measureFlowering', () => {
  it('scores minimal content', () => {
    const m = measureFlowering(minimalContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(m.precision).toBeLessThanOrEqual(100)
    expect(typeof m.bloom).toBe('string')
  })

  it('rewards return types and type annotations', () => {
    const m = measureFlowering(richContent)
    expect(m.hasExact).toBe(true)
  })

  it('rewards interfaces and generics', () => {
    const m = measureFlowering(richContent)
    expect(m.hasAccurate).toBe(true)
  })

  it('penalizes var as approximate', () => {
    const m = measureFlowering('var x = 1')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('penalizes eval as sloppy', () => {
    const m = measureFlowering('eval("code")')
    expect(m.sloppyCount).toBeGreaterThan(0)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects precise code', () => {
    const m = measureFlowering(richContent)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects sharp code (return type + no any)', () => {
    const m = measureFlowering(richContent)
    expect(m.hasSharp).toBe(true)
  })

  it('detects defined (interface or type)', () => {
    const m = measureFlowering(richContent)
    expect(m.hasDefined).toBe(true)
  })

  it('detects well formed (named + doc)', () => {
    const m = measureFlowering(richContent)
    expect(m.hasWellFormed).toBe(true)
  })

  it('detects no fuzzy (no any)', () => {
    const m = measureFlowering(richContent)
    expect(m.hasNoFuzzy).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureFlowering(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
    expect(m.bloom).toBe('no-bloom')
  })
})

// ─── measureRooting ────────────────────────────────────────────────

describe('measureRooting', () => {
  it('scores minimal content', () => {
    const m = measureRooting(minimalContent)
    expect(m.depth).toBeGreaterThanOrEqual(0)
    expect(m.depth).toBeLessThanOrEqual(100)
    expect(typeof m.root).toBe('string')
  })

  it('rewards documentation and structure', () => {
    const m = measureRooting(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
  })

  it('rewards abstract and extends', () => {
    const m = measureRooting(perfectContent)
    expect(m.hasDeep).toBe(true)
    expect(m.hasStable).toBe(true)
  })

  it('penalizes var as ad hoc', () => {
    const m = measureRooting('var x = 1')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoAdHoc).toBe(false)
  })

  it('penalizes TODO as undocumented', () => {
    const m = measureRooting('// TODO: fix')
    expect(m.undocumentedCount).toBeGreaterThan(0)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('detects modular (has import)', () => {
    const m = measureRooting(perfectContent)
    expect(m.hasModular).toBe(true)
  })

  it('detects layered (interface + generics)', () => {
    const m = measureRooting(richContent)
    expect(m.hasLayered).toBe(true)
  })

  it('detects structured (export + const)', () => {
    const m = measureRooting(richContent)
    expect(m.hasStructured).toBe(true)
  })

  it('detects no chaotic', () => {
    const m = measureRooting(richContent)
    expect(m.hasNoChaotic).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureRooting(emptyContent)
    expect(m.depth).toBeGreaterThanOrEqual(0)
    expect(m.root).toBe('no-root')
  })
})

// ─── measureEnergizing ─────────────────────────────────────────────

describe('measureEnergizing', () => {
  it('scores minimal content', () => {
    const m = measureEnergizing(minimalContent)
    expect(m.vitality).toBeGreaterThanOrEqual(0)
    expect(m.vitality).toBeLessThanOrEqual(100)
    expect(typeof m.forge).toBe('string')
  })

  it('rewards async and await', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasActive).toBe(true)
  })

  it('rewards pipelines', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasDynamic).toBe(true)
  })

  it('penalizes var as stagnant', () => {
    const m = measureEnergizing('var x = 1')
    expect(m.stagnantCount).toBeGreaterThan(0)
    expect(m.hasNoDormant).toBe(false)
  })

  it('penalizes eval as formulaic', () => {
    const m = measureEnergizing('eval("code")')
    expect(m.formulaicCount).toBeGreaterThan(0)
    expect(m.hasNoFormulaic).toBe(false)
  })

  it('detects fresh (const + arrow)', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasFresh).toBe(true)
  })

  it('detects innovative (generics + readonly)', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasInnovative).toBe(true)
  })

  it('detects vibrant (named + doc)', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasVibrant).toBe(true)
  })

  it('detects alive (export + async/arrow)', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasAlive).toBe(true)
  })

  it('detects no dead (no eval, no debugger)', () => {
    const m = measureEnergizing(richContent)
    expect(m.hasNoDead).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureEnergizing(emptyContent)
    expect(m.vitality).toBeGreaterThanOrEqual(0)
    expect(m.forge).toBe('no-forge')
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyBloomCondition', () => {
  it('classifies iron-masterpiece', () => { expect(classifyBloomCondition(95)).toBe('iron-masterpiece') })
  it('classifies steel-garden', () => { expect(classifyBloomCondition(80)).toBe('steel-garden') })
  it('classifies proper-landscape', () => { expect(classifyBloomCondition(65)).toBe('proper-landscape') })
  it('classifies rusty-bed', () => { expect(classifyBloomCondition(45)).toBe('rusty-bed') })
  it('classifies withered-plot', () => { expect(classifyBloomCondition(25)).toBe('withered-plot') })
  it('classifies barren-earth', () => { expect(classifyBloomCondition(10)).toBe('barren-earth') })
})

describe('classifyPlotType', () => {
  it('returns no-plot for empty blooms', () => {
    expect(classifyPlotType([])).toBe('no-plot')
  })

  it('returns grand-estate or better for high quality', () => {
    const bloom = analyzeIronBloom(perfectContent, 'perfect.ts')
    const pt = classifyPlotType([bloom])
    expect(pt).toBeOneOf(['grand-estate', 'formal-garden', 'proper-plot'])
  })

  it('returns no-plot for very low quality', () => {
    const bloom = analyzeIronBloom('', 'empty.ts')
    expect(classifyPlotType([bloom])).toBe('no-plot')
  })
})

describe('classifyPlotCondition', () => {
  it('classifies iron-eden', () => { expect(classifyPlotCondition(90)).toBe('iron-eden') })
  it('classifies steel-oasis', () => { expect(classifyPlotCondition(75)).toBe('steel-oasis') })
  it('classifies proper-garden', () => { expect(classifyPlotCondition(60)).toBe('proper-garden') })
  it('classifies rusty-patch', () => { expect(classifyPlotCondition(40)).toBe('rusty-patch') })
  it('classifies withered-ground', () => { expect(classifyPlotCondition(20)).toBe('withered-ground') })
  it('classifies void', () => { expect(classifyPlotCondition(5)).toBe('void') })
})

describe('classifyGardenerGrade', () => {
  it('classifies master-ironworker', () => { expect(classifyGardenerGrade(90)).toBe('master-ironworker') })
  it('classifies skilled-forge-gardener', () => { expect(classifyGardenerGrade(75)).toBe('skilled-forge-gardener') })
  it('classifies proper-cultivator', () => { expect(classifyGardenerGrade(60)).toBe('proper-cultivator') })
  it('classifies apprentice', () => { expect(classifyGardenerGrade(45)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifyGardenerGrade(25)).toBe('novice') })
  it('classifies weed-puller', () => { expect(classifyGardenerGrade(10)).toBe('weed-puller') })
})

// ─── analyzeIronBloom ──────────────────────────────────────────────

describe('analyzeIronBloom', () => {
  it('returns a complete bloom object', () => {
    const bloom = analyzeIronBloom(richContent, 'test.ts')
    expect(bloom.file).toBe('test.ts')
    expect(bloom.strengthThroughNature).toBeGreaterThan(0)
    expect(bloom.rustResistance).toBeGreaterThan(0)
    expect(bloom.bloomPrecision).toBeGreaterThan(0)
    expect(bloom.rootDepth).toBeGreaterThan(0)
    expect(bloom.forgeVitality).toBeGreaterThan(0)
    expect(bloom.qualityScore).toBeGreaterThan(0)
    expect(typeof bloom.condition).toBe('string')
  })

  it('computes qualityScore as weighted average', () => {
    const bloom = analyzeIronBloom(richContent, 'test.ts')
    const expected = Math.round(
      bloom.strengthThroughNature * 0.2 +
      bloom.rustResistance * 0.2 +
      bloom.bloomPrecision * 0.2 +
      bloom.rootDepth * 0.2 +
      bloom.forgeVitality * 0.2,
    )
    expect(bloom.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const bloom = analyzeIronBloom(richContent, 'test.ts')
    expect(bloom.fortifying).toBeDefined()
    expect(bloom.protecting).toBeDefined()
    expect(bloom.flowering).toBeDefined()
    expect(bloom.rooting).toBeDefined()
    expect(bloom.energizing).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const bloom = analyzeIronBloom(emptyContent, 'empty.ts')
    expect(bloom.qualityScore).toBe(0)
    expect(bloom.condition).toBe('barren-earth')
  })

  it('bad content scores lower than rich content', () => {
    const bad = analyzeIronBloom(badContent, 'bad.ts')
    const rich = analyzeIronBloom(richContent, 'rich.ts')
    expect(bad.qualityScore).toBeLessThan(rich.qualityScore)
  })
})

// ─── analyzeIronPlot ───────────────────────────────────────────────

describe('analyzeIronPlot', () => {
  it('returns empty plot for no blooms', () => {
    const plot = analyzeIronPlot([], 'empty-dir')
    expect(plot.directory).toBe('empty-dir')
    expect(plot.blooms).toHaveLength(0)
    expect(plot.avgStrength).toBe(0)
    expect(plot.plotType).toBe('no-plot')
    expect(plot.condition).toBe('void')
  })

  it('aggregates bloom scores', () => {
    const blooms = [
      analyzeIronBloom(richContent, 'a.ts'),
      analyzeIronBloom(richContent, 'b.ts'),
    ]
    const plot = analyzeIronPlot(blooms, 'src')
    expect(plot.blooms).toHaveLength(2)
    expect(plot.avgStrength).toBeGreaterThan(0)
    expect(plot.avgPrecision).toBeGreaterThan(0)
    expect(plot.avgVitality).toBeGreaterThan(0)
  })

  it('counts masterpieces and barren', () => {
    const good = analyzeIronBloom(perfectContent, 'perfect.ts')
    const bad = analyzeIronBloom(emptyContent, 'empty.ts')
    const plot = analyzeIronPlot([good, bad], 'mix')
    expect(plot.barrenEarthCount).toBeGreaterThanOrEqual(1)
    expect(plot.blooms).toHaveLength(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high fertility and no barren', () => {
    const blooms = [analyzeIronBloom(perfectContent, 'p.ts')]
    const plots = [analyzeIronPlot(blooms, 'src')]
    const estate = { avgStrength: 90, avgPrecision: 90, avgVitality: 90, isIron: true, overallFertility: 90 }
    const stats = {
      totalFiles: 1, totalPlots: 1,
      avgStrengthThroughNature: 90, avgRustResistance: 90, avgBloomPrecision: 90,
      avgRootDepth: 90, avgForgeVitality: 90,
      ironMasterpieceCount: 1, steelGardenCount: 0, properLandscapeCount: 0,
      rustyBedCount: 0, witheredPlotCount: 0, barrenEarthCount: 0,
      hasHighStrengthCount: 1, hasHighResistanceCount: 1, hasHighPrecisionCount: 1,
      hasHighDepthCount: 1, hasHighVitalityCount: 1,
      overallFertility: 90, gardenerGrade: 'master-ironworker' as const,
      bestBloom: 'p.ts', strongest: 'p.ts', mostResistant: 'p.ts',
      mostPrecise: 'p.ts', mostVital: 'p.ts',
    }
    const recs = generateRecommendations(blooms, plots, estate, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Iron garden perfection')
  })

  it('suggests strength improvement for low scores', () => {
    const blooms = [analyzeIronBloom('', 'e.ts')]
    const plots = [analyzeIronPlot(blooms, 'src')]
    const estate = { avgStrength: 0, avgPrecision: 0, avgVitality: 0, isIron: false, overallFertility: 0 }
    const stats = {
      totalFiles: 1, totalPlots: 1,
      avgStrengthThroughNature: 0, avgRustResistance: 0, avgBloomPrecision: 0,
      avgRootDepth: 0, avgForgeVitality: 0,
      ironMasterpieceCount: 0, steelGardenCount: 0, properLandscapeCount: 0,
      rustyBedCount: 0, witheredPlotCount: 0, barrenEarthCount: 1,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallFertility: 0, gardenerGrade: 'weed-puller' as const,
      bestBloom: 'e.ts', strongest: 'e.ts', mostResistant: 'e.ts',
      mostPrecise: 'e.ts', mostVital: 'e.ts',
    }
    const recs = generateRecommendations(blooms, plots, estate, stats)
    expect(recs.some(r => r.includes('Strengthen'))).toBe(true)
  })

  it('mentions barren files by name when few', () => {
    const blooms = [analyzeIronBloom('', 'bad1.ts'), analyzeIronBloom('', 'bad2.ts')]
    const plots = [analyzeIronPlot(blooms, 'src')]
    const estate = { avgStrength: 0, avgPrecision: 0, avgVitality: 0, isIron: false, overallFertility: 0 }
    const stats = {
      totalFiles: 2, totalPlots: 1,
      avgStrengthThroughNature: 0, avgRustResistance: 0, avgBloomPrecision: 0,
      avgRootDepth: 0, avgForgeVitality: 0,
      ironMasterpieceCount: 0, steelGardenCount: 0, properLandscapeCount: 0,
      rustyBedCount: 0, witheredPlotCount: 0, barrenEarthCount: 2,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallFertility: 0, gardenerGrade: 'weed-puller' as const,
      bestBloom: 'bad1.ts', strongest: 'bad1.ts', mostResistant: 'bad1.ts',
      mostPrecise: 'bad1.ts', mostVital: 'bad1.ts',
    }
    const recs = generateRecommendations(blooms, plots, estate, stats)
    expect(recs.some(r => r.includes('bad1.ts'))).toBe(true)
  })

  it('reports barren count when many files', () => {
    const bloomList = Array.from({ length: 5 }, (_, i) => analyzeIronBloom('', `v${i}.ts`))
    const plots = [analyzeIronPlot(bloomList, 'src')]
    const estate = { avgStrength: 0, avgPrecision: 0, avgVitality: 0, isIron: false, overallFertility: 0 }
    const stats = {
      totalFiles: 5, totalPlots: 1,
      avgStrengthThroughNature: 0, avgRustResistance: 0, avgBloomPrecision: 0,
      avgRootDepth: 0, avgForgeVitality: 0,
      ironMasterpieceCount: 0, steelGardenCount: 0, properLandscapeCount: 0,
      rustyBedCount: 0, witheredPlotCount: 0, barrenEarthCount: 5,
      hasHighStrengthCount: 0, hasHighResistanceCount: 0, hasHighPrecisionCount: 0,
      hasHighDepthCount: 0, hasHighVitalityCount: 0,
      overallFertility: 0, gardenerGrade: 'weed-puller' as const,
      bestBloom: 'v0.ts', strongest: 'v0.ts', mostResistant: 'v0.ts',
      mostPrecise: 'v0.ts', mostVital: 'v0.ts',
    }
    const recs = generateRecommendations(bloomList, plots, estate, stats)
    expect(recs.some(r => r.includes('5 barren'))).toBe(true)
  })

  it('returns hold steady when no issues', () => {
    const blooms = [analyzeIronBloom(richContent, 'ok.ts')]
    const plots = [analyzeIronPlot(blooms, 'src')]
    const avgSn = Math.round(blooms.reduce((s, b) => s + b.strengthThroughNature, 0) / blooms.length)
    const avgBp = Math.round(blooms.reduce((s, b) => s + b.bloomPrecision, 0) / blooms.length)
    const avgFv = Math.round(blooms.reduce((s, b) => s + b.forgeVitality, 0) / blooms.length)
    const of_ = Math.round((avgSn + avgBp + avgFv) / 3)
    const estate = { avgStrength: avgSn, avgPrecision: avgBp, avgVitality: avgFv, isIron: of_ >= 80, overallFertility: of_ }
    const stats = {
      totalFiles: 1, totalPlots: 1,
      avgStrengthThroughNature: avgSn, avgRustResistance: blooms[0].rustResistance, avgBloomPrecision: avgBp,
      avgRootDepth: blooms[0].rootDepth, avgForgeVitality: avgFv,
      ironMasterpieceCount: blooms.filter(b => b.condition === 'iron-masterpiece').length,
      steelGardenCount: blooms.filter(b => b.condition === 'steel-garden').length,
      properLandscapeCount: blooms.filter(b => b.condition === 'proper-landscape').length,
      rustyBedCount: blooms.filter(b => b.condition === 'rusty-bed').length,
      witheredPlotCount: blooms.filter(b => b.condition === 'withered-plot').length,
      barrenEarthCount: blooms.filter(b => b.condition === 'barren-earth').length,
      hasHighStrengthCount: blooms.filter(b => b.fortifying.hasHighStrength).length,
      hasHighResistanceCount: blooms.filter(b => b.protecting.hasHighResistance).length,
      hasHighPrecisionCount: blooms.filter(b => b.flowering.hasHighPrecision).length,
      hasHighDepthCount: blooms.filter(b => b.rooting.hasHighDepth).length,
      hasHighVitalityCount: blooms.filter(b => b.energizing.hasHighVitality).length,
      overallFertility: of_, gardenerGrade: classifyGardenerGrade(of_) as 'proper-cultivator',
      bestBloom: 'ok.ts', strongest: 'ok.ts', mostResistant: 'ok.ts',
      mostPrecise: 'ok.ts', mostVital: 'ok.ts',
    }
    const recs = generateRecommendations(blooms, plots, estate, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildIronGardenResult ─────────────────────────────────────────

describe('buildIronGardenResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildIronGardenResult(['test.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.plots).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.estate.overallFertility).toBeGreaterThan(0)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('handles multiple files in different directories', async () => {
    const result = await buildIronGardenResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.blooms).toHaveLength(2)
    expect(result.plots).toHaveLength(2)
    expect(result.stats.totalPlots).toBe(2)
  })

  it('computes correct averages', async () => {
    const result = await buildIronGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, perfectContent],
    )
    expect(result.stats.avgStrengthThroughNature).toBeGreaterThan(0)
    expect(result.stats.avgRustResistance).toBeGreaterThan(0)
    expect(result.stats.overallFertility).toBeGreaterThan(0)
  })

  it('computes overall fertility as avg of strength, precision, vitality', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgStrengthThroughNature + result.stats.avgBloomPrecision + result.stats.avgForgeVitality) / 3,
    )
    expect(result.stats.overallFertility).toBe(expected)
  })

  it('identifies best bloom', async () => {
    const result = await buildIronGardenResult(
      ['bad.ts', 'good.ts'],
      [emptyContent, perfectContent],
    )
    expect(result.stats.bestBloom).toBe('good.ts')
  })

  it('identifies strongest', async () => {
    const result = await buildIronGardenResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.strongest).toBe('good.ts')
  })

  it('identifies most resistant', async () => {
    const result = await buildIronGardenResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostResistant).toBe('good.ts')
  })

  it('identifies most precise', async () => {
    const result = await buildIronGardenResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostPrecise).toBe('good.ts')
  })

  it('identifies most vital', async () => {
    const result = await buildIronGardenResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostVital).toBe('good.ts')
  })

  it('handles empty input', async () => {
    const result = await buildIronGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallFertility).toBe(0)
    expect(result.estate.isIron).toBe(false)
  })

  it('counts condition categories', async () => {
    const result = await buildIronGardenResult(
      ['perfect.ts', 'empty.ts'],
      [perfectContent, emptyContent],
    )
    expect(result.stats.barrenEarthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('assigns gardener grade based on overall fertility', async () => {
    const result = await buildIronGardenResult(['p.ts'], [perfectContent])
    expect(typeof result.stats.gardenerGrade).toBe('string')
    expect(result.stats.gardenerGrade).not.toBe('weed-puller')
  })

  it('handles missing content gracefully', async () => {
    const result = await buildIronGardenResult(['x.ts'], [])
    expect(result.blooms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  const bloom = analyzeIronBloom(richContent, 'test.ts')
  const plot = analyzeIronPlot([bloom], 'src')

  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorGrade returns a string', () => {
    expect(typeof colorGrade('iron-masterpiece')).toBe('string')
  })

  it('formatBloomTable returns multi-line string', () => {
    const output = formatBloomTable(bloom)
    expect(output).toContain('test.ts')
    expect(output).toContain('Strength Through Nature')
    expect(output).toContain('Rust Resistance')
    expect(output).toContain('Bloom Precision')
    expect(output).toContain('Root Depth')
    expect(output).toContain('Forge Vitality')
  })

  it('formatBloomsTable handles empty array', () => {
    expect(formatBloomsTable([])).toContain('No iron blooms')
  })

  it('formatBloomsTable formats multiple blooms', () => {
    const bloom2 = analyzeIronBloom(perfectContent, 'perfect.ts')
    const output = formatBloomsTable([bloom, bloom2])
    expect(output).toContain('test.ts')
    expect(output).toContain('perfect.ts')
  })

  it('formatPlotTable returns multi-line string', () => {
    const output = formatPlotTable(plot)
    expect(output).toContain('src')
    expect(output).toContain('Blooms')
    expect(output).toContain('Avg Strength')
    expect(output).toContain('Plot Type')
  })

  it('formatPlotsTable handles empty array', () => {
    expect(formatPlotsTable([])).toContain('No iron plots')
  })

  it('formatStatsTable returns stats', async () => {
    const result = await buildIronGardenResult(['t.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Fertility')
    expect(output).toContain('Gardener Grade')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const output = formatRecommendations(['improve X'])
    expect(output).toContain('improve X')
  })

  it('formatResultTable returns full output', async () => {
    const result = await buildIronGardenResult(['t.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Iron Bloom Analysis')
    expect(output).toContain('Iron Plots')
    expect(output).toContain('Iron Garden Statistics')
    expect(output).toContain('Estate')
    expect(output).toContain('Recommendations')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildIronGardenResult(['t.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles single-line content', () => {
    const bloom = analyzeIronBloom('export const x = 1', 'single.ts')
    expect(bloom.qualityScore).toBeGreaterThan(0)
  })

  it('handles content with only comments', () => {
    const bloom = analyzeIronBloom('// just a comment', 'comment.ts')
    expect(bloom.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very long content', () => {
    const longContent = richContent.repeat(20)
    const bloom = analyzeIronBloom(longContent, 'long.ts')
    expect(bloom.qualityScore).toBeGreaterThan(0)
  })

  it('handles mixed good and bad content', () => {
    const mixed = richContent + '\n' + badContent
    const bloom = analyzeIronBloom(mixed, 'mixed.ts')
    expect(bloom.qualityScore).toBeGreaterThan(0)
    expect(bloom.fortifying.untestedCount).toBeGreaterThan(0)
  })

  it('classifies all iron levels', () => {
    const irons = [
      measureFortifying(perfectContent).iron,
      measureFortifying(richContent).iron,
      measureFortifying(badContent).iron,
      measureFortifying(emptyContent).iron,
    ]
    expect(irons.every(i => typeof i === 'string')).toBe(true)
  })

  it('classifies all coat levels', () => {
    const coats = [
      measureProtecting(perfectContent).coat,
      measureProtecting(richContent).coat,
      measureProtecting(badContent).coat,
      measureProtecting(emptyContent).coat,
    ]
    expect(coats.every(c => typeof c === 'string')).toBe(true)
  })

  it('classifies all bloom levels', () => {
    const blooms = [
      measureFlowering(perfectContent).bloom,
      measureFlowering(richContent).bloom,
      measureFlowering(badContent).bloom,
      measureFlowering(emptyContent).bloom,
    ]
    expect(blooms.every(b => typeof b === 'string')).toBe(true)
  })

  it('classifies all root levels', () => {
    const roots = [
      measureRooting(perfectContent).root,
      measureRooting(richContent).root,
      measureRooting(badContent).root,
      measureRooting(emptyContent).root,
    ]
    expect(roots.every(r => typeof r === 'string')).toBe(true)
  })

  it('classifies all forge levels', () => {
    const forges = [
      measureEnergizing(perfectContent).forge,
      measureEnergizing(richContent).forge,
      measureEnergizing(badContent).forge,
      measureEnergizing(emptyContent).forge,
    ]
    expect(forges.every(f => typeof f === 'string')).toBe(true)
  })

  it('buildIronGardenResult with many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildIronGardenResult(files, contents)
    expect(result.blooms).toHaveLength(20)
    expect(result.stats.totalFiles).toBe(20)
  })
})
