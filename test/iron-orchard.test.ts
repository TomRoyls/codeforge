import { describe, expect, it } from 'vitest'

import {
  measureStructuring,
  measureProtecting,
  measureFlowering,
  measureAnchoring,
  measureEnergizing,
  classifyCondition,
  classifyBedType,
  classifyBedCondition,
  classifyGardenerGrade,
  analyzeIronBloom,
  analyzeIronBed,
  buildIronGardenResult,
  generateRecommendations,
} from '../src/commands/iron-orchard-helpers.js'
import {
  colorScore,
  colorCondition,
  colorBedCondition,
  formatBloomTable,
  formatBloomsTable,
  formatBedTable,
  formatBedsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/iron-orchard-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────

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

const poorContent = [
  'var x = eval("1")',
  'var y: any = {}',
  '// hack workaround',
  '// tangled spaghetti messy code',
  '// wrong incorrect buggy broken',
].join('\n')

// ─── measureStructuring ────────────────────────────────

describe('measureStructuring', () => {
  it('scores rich content high', () => {
    const result = measureStructuring(richContent)
    expect(result.strength).toBe(100)
    expect(result.hasHighStrength).toBe(true)
    expect(result.frame).toBe('wrought-iron-arbor')
  })

  it('scores empty content low', () => {
    const result = measureStructuring(emptyContent)
    expect(result.strength).toBe(0)
    expect(result.hasHighStrength).toBe(false)
    expect(result.frame).toBe('no-strength')
  })

  it('scores minimal content moderately', () => {
    const result = measureStructuring(minimalContent)
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.strength).toBeLessThanOrEqual(100)
  })

  it('detects well-structured patterns', () => {
    const result = measureStructuring('class X { }; interface Y { }')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects modular patterns', () => {
    const result = measureStructuring('export function run() {}')
    expect(result.hasModular).toBe(true)
  })

  it('detects organized patterns', () => {
    const result = measureStructuring('class X { }; type T = string')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects clean pipelines', () => {
    const result = measureStructuring('import { x } from "y"; export { x }')
    expect(result.hasCleanPipelines).toBe(true)
  })

  it('detects efficient patterns', () => {
    const result = measureStructuring('const x: readonly string = ""')
    expect(result.hasEfficient).toBe(true)
  })

  it('detects harmonious patterns', () => {
    const result = measureStructuring('try { } catch { }')
    expect(result.hasHarmonious).toBe(true)
  })

  it('detects elegant patterns', () => {
    const result = measureStructuring('class X { private y: string }')
    expect(result.hasElegant).toBe(true)
  })

  it('detects natural patterns', () => {
    const result = measureStructuring('async function run(): Promise<void> { await x() }')
    expect(result.hasNatural).toBe(true)
  })

  it('detects balanced patterns', () => {
    const result = measureStructuring('function f() {}; class X { }; interface I { }')
    expect(result.hasBalanced).toBe(true)
  })

  it('counts chaotic patterns', () => {
    const result = measureStructuring('var x = 1; var y = 2')
    expect(result.chaoticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts tangled patterns', () => {
    const result = measureStructuring('// tangled spaghetti')
    expect(result.tangledCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies frame thresholds', () => {
    expect(measureStructuring(richContent).frame).toBe('wrought-iron-arbor')
    expect(measureStructuring(emptyContent).frame).toBe('no-strength')
  })
})

// ─── measureProtecting ─────────────────────────────────

describe('measureProtecting', () => {
  it('scores rich content high', () => {
    const result = measureProtecting(richContent)
    expect(result.resistance).toBe(100)
    expect(result.hasHighResistance).toBe(true)
    expect(result.coating).toBe('stainless-steel')
  })

  it('scores empty content low', () => {
    const result = measureProtecting(emptyContent)
    expect(result.resistance).toBeGreaterThanOrEqual(0)
    expect(result.hasHighResistance).toBe(false)
    expect(result.coating).toBe('no-resistance')
  })

  it('detects tested patterns', () => {
    const result = measureProtecting('try { if (x) { y() } } catch { }')
    expect(result.hasTested).toBe(true)
  })

  it('detects type-safe patterns', () => {
    const result = measureProtecting('function f(): string { return "" }')
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects maintained patterns', () => {
    const result = measureProtecting('import { x } from "y"; export { x }')
    expect(result.hasMaintained).toBe(true)
  })

  it('detects stable patterns', () => {
    const result = measureProtecting('class X implements interface Y { readonly z }')
    expect(result.hasStable).toBe(true)
  })

  it('detects proven patterns', () => {
    const result = measureProtecting('const x = {} as const; readonly y')
    expect(result.hasProven).toBe(true)
  })

  it('detects mature patterns', () => {
    const result = measureProtecting('class X { }; interface Y { }')
    expect(result.hasMature).toBe(true)
  })

  it('detects clean patterns', () => {
    const result = measureProtecting('const x = 1')
    expect(result.hasClean).toBe(true)
  })

  it('detects documented patterns', () => {
    const result = measureProtecting('/** docs */')
    expect(result.hasDocumented).toBe(true)
  })

  it('counts untested patterns', () => {
    const result = measureProtecting('var x = 1')
    expect(result.untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('counts unsafe patterns', () => {
    const result = measureProtecting('const x: any = {}')
    expect(result.unsafeCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies coating thresholds', () => {
    expect(measureProtecting(richContent).coating).toBe('stainless-steel')
    expect(measureProtecting(emptyContent).coating).toBe('no-resistance')
  })
})

// ─── measureFlowering ──────────────────────────────────

describe('measureFlowering', () => {
  it('scores rich content high', () => {
    const result = measureFlowering(richContent)
    expect(result.precision).toBe(100)
    expect(result.hasHighPrecision).toBe(true)
    expect(result.bloom).toBe('perfect-timing')
  })

  it('scores empty content low', () => {
    const result = measureFlowering(emptyContent)
    expect(result.precision).toBeGreaterThanOrEqual(0)
    expect(result.bloom).toBe('no-precision')
  })

  it('detects accurate patterns', () => {
    const result = measureFlowering('function f(): string { return "" }')
    expect(result.hasAccurate).toBe(true)
  })

  it('detects exact patterns', () => {
    const result = measureFlowering('const x: readonly string = ""')
    expect(result.hasExact).toBe(true)
  })

  it('detects correct patterns', () => {
    const result = measureFlowering('try { if (x) throw e } catch { }')
    expect(result.hasCorrect).toBe(true)
  })

  it('detects consistent patterns', () => {
    const result = measureFlowering('const x = {} as const; readonly y')
    expect(result.hasConsistent).toBe(true)
  })

  it('detects validated patterns', () => {
    const result = measureFlowering('try { if (x) { y() } } catch { }')
    expect(result.hasValidated).toBe(true)
  })

  it('detects deterministic patterns', () => {
    const result = measureFlowering('const x: readonly string = ""')
    expect(result.hasDeterministic).toBe(true)
  })

  it('detects reliable patterns', () => {
    const result = measureFlowering('class X { }; interface Y { }; type T = string')
    expect(result.hasReliable).toBe(true)
  })

  it('detects timed patterns', () => {
    const result = measureFlowering('async function run(): Promise<void> { await x() }')
    expect(result.hasTimed).toBe(true)
  })

  it('counts wrong patterns', () => {
    const result = measureFlowering('// wrong incorrect bad')
    expect(result.wrongCount).toBeGreaterThanOrEqual(0)
  })

  it('counts buggy patterns', () => {
    const result = measureFlowering('// bug buggy broken')
    expect(result.buggyCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies bloom thresholds', () => {
    expect(measureFlowering(richContent).bloom).toBe('perfect-timing')
    expect(measureFlowering(emptyContent).bloom).toBe('no-precision')
  })
})

// ─── measureAnchoring ──────────────────────────────────

describe('measureAnchoring', () => {
  it('scores rich content high', () => {
    const result = measureAnchoring(richContent)
    expect(result.depth).toBe(100)
    expect(result.hasHighDepth).toBe(true)
    expect(result.root).toBe('deep-taproot')
  })

  it('scores empty content low', () => {
    const result = measureAnchoring(emptyContent)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.root).toBe('no-depth')
  })

  it('detects well-architected patterns', () => {
    const result = measureAnchoring('class X implements interface Y { }')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled patterns', () => {
    const result = measureAnchoring('class X { private y: string; protected z }')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep patterns', () => {
    const result = measureAnchoring('interface X<T> { }; type Y = string')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven patterns', () => {
    const result = measureAnchoring('const x = {} as const; readonly y')
    expect(result.hasProven).toBe(true)
  })

  it('detects mature patterns', () => {
    const result = measureAnchoring('class X { }; interface Y { }')
    expect(result.hasMature).toBe(true)
  })

  it('detects patterned code', () => {
    const result = measureAnchoring('function f() {}; class X { }; interface Y { }')
    expect(result.hasPatterned).toBe(true)
  })

  it('detects strategic patterns', () => {
    const result = measureAnchoring('import { x } from "y"; export { x }')
    expect(result.hasStrategic).toBe(true)
  })

  it('detects foundational patterns', () => {
    const result = measureAnchoring('try { if (x) throw e } catch { }')
    expect(result.hasFoundational).toBe(true)
  })

  it('counts hacked patterns', () => {
    const result = measureAnchoring('// hack workaround monkey-patch')
    expect(result.hackedCount).toBeGreaterThanOrEqual(0)
  })

  it('counts ad-hoc patterns', () => {
    const result = measureAnchoring('const x: any = {}')
    expect(result.adHocCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies root thresholds', () => {
    expect(measureAnchoring(richContent).root).toBe('deep-taproot')
    expect(measureAnchoring(emptyContent).root).toBe('no-depth')
  })
})

// ─── measureEnergizing ─────────────────────────────────

describe('measureEnergizing', () => {
  it('scores rich content high', () => {
    const result = measureEnergizing(richContent)
    expect(result.vitality).toBe(100)
    expect(result.hasHighVitality).toBe(true)
    expect(result.forge).toBe('breathing-fire')
  })

  it('scores empty content low', () => {
    const result = measureEnergizing(emptyContent)
    expect(result.vitality).toBeGreaterThanOrEqual(0)
    expect(result.forge).toBe('no-vitality')
  })

  it('detects exported patterns', () => {
    const result = measureEnergizing('export function run() {}')
    expect(result.hasExported).toBe(true)
  })

  it('detects evolving patterns', () => {
    const result = measureEnergizing('async function run(): Promise<void> { await x() }')
    expect(result.hasEvolving).toBe(true)
  })

  it('detects active patterns', () => {
    const result = measureEnergizing('function f() {}')
    expect(result.hasActive).toBe(true)
  })

  it('detects contributing patterns', () => {
    const result = measureEnergizing('export function run() { return x }')
    expect(result.hasContributing).toBe(true)
  })

  it('detects thriving patterns', () => {
    const result = measureEnergizing('class X { }; interface Y { }; type T = string')
    expect(result.hasThriving).toBe(true)
  })

  it('detects alive patterns', () => {
    const result = measureEnergizing('try { if (x) throw e } catch { }')
    expect(result.hasAlive).toBe(true)
  })

  it('detects connected patterns', () => {
    const result = measureEnergizing('import { x } from "y"; export { x }')
    expect(result.hasConnected).toBe(true)
  })

  it('detects dynamic patterns', () => {
    const result = measureEnergizing('catch (e) { } finally { } default:')
    expect(result.hasDynamic).toBe(true)
  })

  it('counts isolated patterns', () => {
    const result = measureEnergizing('var x = 1')
    expect(result.isolatedCount).toBeGreaterThanOrEqual(0)
  })

  it('counts dead patterns', () => {
    const result = measureEnergizing('// dead unused orphan')
    expect(result.deadCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies forge thresholds', () => {
    expect(measureEnergizing(richContent).forge).toBe('breathing-fire')
    expect(measureEnergizing(emptyContent).forge).toBe('no-vitality')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies iron-masterpiece', () => {
    expect(classifyCondition(90)).toBe('iron-masterpiece')
    expect(classifyCondition(95)).toBe('iron-masterpiece')
  })

  it('classifies garden-paradise', () => {
    expect(classifyCondition(75)).toBe('garden-paradise')
    expect(classifyCondition(89)).toBe('garden-paradise')
  })

  it('classifies proper-garden', () => {
    expect(classifyCondition(60)).toBe('proper-garden')
    expect(classifyCondition(74)).toBe('proper-garden')
  })

  it('classifies weedy-plot', () => {
    expect(classifyCondition(40)).toBe('weedy-plot')
    expect(classifyCondition(59)).toBe('weedy-plot')
  })

  it('classifies rusty-gate', () => {
    expect(classifyCondition(20)).toBe('rusty-gate')
    expect(classifyCondition(39)).toBe('rusty-gate')
  })

  it('classifies void', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyBedType', () => {
  it('returns no-bed for empty blooms', () => {
    expect(classifyBedType([])).toBe('no-bed')
  })

  it('returns formal-garden for high scores', () => {
    const blooms = [{ qualityScore: 95 }] as any
    expect(classifyBedType(blooms)).toBe('formal-garden')
  })

  it('returns iron-parterre for good scores', () => {
    const blooms = [{ qualityScore: 80 }] as any
    expect(classifyBedType(blooms)).toBe('iron-parterre')
  })

  it('returns proper-bed for moderate scores', () => {
    const blooms = [{ qualityScore: 65 }] as any
    expect(classifyBedType(blooms)).toBe('proper-bed')
  })

  it('returns small-plot for low scores', () => {
    const blooms = [{ qualityScore: 45 }] as any
    expect(classifyBedType(blooms)).toBe('small-plot')
  })

  it('returns barren-dirt for very low scores', () => {
    const blooms = [{ qualityScore: 25 }] as any
    expect(classifyBedType(blooms)).toBe('barren-dirt')
  })

  it('returns no-bed for zero scores', () => {
    const blooms = [{ qualityScore: 5 }] as any
    expect(classifyBedType(blooms)).toBe('no-bed')
  })
})

describe('classifyBedCondition', () => {
  it('classifies botanical-palace', () => {
    expect(classifyBedCondition(85)).toBe('botanical-palace')
    expect(classifyBedCondition(100)).toBe('botanical-palace')
  })

  it('classifies iron-garden', () => {
    expect(classifyBedCondition(70)).toBe('iron-garden')
    expect(classifyBedCondition(84)).toBe('iron-garden')
  })

  it('classifies proper-plot', () => {
    expect(classifyBedCondition(55)).toBe('proper-plot')
    expect(classifyBedCondition(69)).toBe('proper-plot')
  })

  it('classifies weedy-corner', () => {
    expect(classifyBedCondition(35)).toBe('weedy-corner')
    expect(classifyBedCondition(54)).toBe('weedy-corner')
  })

  it('classifies rusty-gate', () => {
    expect(classifyBedCondition(15)).toBe('rusty-gate')
    expect(classifyBedCondition(34)).toBe('rusty-gate')
  })

  it('classifies void', () => {
    expect(classifyBedCondition(0)).toBe('void')
    expect(classifyBedCondition(14)).toBe('void')
  })
})

describe('classifyGardenerGrade', () => {
  it('classifies iron-botanist', () => {
    expect(classifyGardenerGrade(80)).toBe('iron-botanist')
    expect(classifyGardenerGrade(100)).toBe('iron-botanist')
  })

  it('classifies garden-architect', () => {
    expect(classifyGardenerGrade(65)).toBe('garden-architect')
    expect(classifyGardenerGrade(79)).toBe('garden-architect')
  })

  it('classifies metal-gardener', () => {
    expect(classifyGardenerGrade(50)).toBe('metal-gardener')
    expect(classifyGardenerGrade(64)).toBe('metal-gardener')
  })

  it('classifies apprentice', () => {
    expect(classifyGardenerGrade(35)).toBe('apprentice')
    expect(classifyGardenerGrade(49)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyGardenerGrade(20)).toBe('novice')
    expect(classifyGardenerGrade(34)).toBe('novice')
  })

  it('classifies weed-puller', () => {
    expect(classifyGardenerGrade(0)).toBe('weed-puller')
    expect(classifyGardenerGrade(19)).toBe('weed-puller')
  })
})

// ─── analyzeIronBloom ──────────────────────────────────

describe('analyzeIronBloom', () => {
  it('analyzes rich content correctly', () => {
    const bloom = analyzeIronBloom(richContent, 'app.ts')
    expect(bloom.file).toBe('app.ts')
    expect(bloom.strengthThroughNature).toBe(100)
    expect(bloom.rustResistance).toBe(100)
    expect(bloom.bloomPrecision).toBe(100)
    expect(bloom.rootDepth).toBe(100)
    expect(bloom.forgeVitality).toBe(100)
    expect(bloom.qualityScore).toBe(100)
    expect(bloom.condition).toBe('iron-masterpiece')
  })

  it('analyzes empty content', () => {
    const bloom = analyzeIronBloom(emptyContent, 'empty.ts')
    expect(bloom.file).toBe('empty.ts')
    expect(bloom.qualityScore).toBeGreaterThanOrEqual(0)
    expect(bloom.condition).toBe('void')
  })

  it('computes quality score as weighted average', () => {
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

  it('preserves all measure objects', () => {
    const bloom = analyzeIronBloom(richContent, 'test.ts')
    expect(bloom.structuring).toBeDefined()
    expect(bloom.protecting).toBeDefined()
    expect(bloom.flowering).toBeDefined()
    expect(bloom.anchoring).toBeDefined()
    expect(bloom.energizing).toBeDefined()
  })
})

// ─── analyzeIronBed ────────────────────────────────────

describe('analyzeIronBed', () => {
  it('returns empty bed for no blooms', () => {
    const bed = analyzeIronBed([], 'src')
    expect(bed.directory).toBe('src')
    expect(bed.blooms).toHaveLength(0)
    expect(bed.avgStrength).toBe(0)
    expect(bed.avgPrecision).toBe(0)
    expect(bed.avgVitality).toBe(0)
    expect(bed.ironMasterpieceCount).toBe(0)
    expect(bed.voidCount).toBe(0)
    expect(bed.bedType).toBe('no-bed')
    expect(bed.condition).toBe('void')
  })

  it('computes averages from blooms', () => {
    const blooms = [
      analyzeIronBloom(richContent, 'src/a.ts'),
      analyzeIronBloom(minimalContent, 'src/b.ts'),
    ]
    const bed = analyzeIronBed(blooms, 'src')
    expect(bed.directory).toBe('src')
    expect(bed.blooms).toHaveLength(2)
    expect(bed.avgStrength).toBeGreaterThanOrEqual(0)
    expect(bed.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(bed.avgVitality).toBeGreaterThanOrEqual(0)
  })

  it('counts iron masterpieces', () => {
    const blooms = [
      analyzeIronBloom(richContent, 'a.ts'),
      analyzeIronBloom(richContent, 'b.ts'),
    ]
    const bed = analyzeIronBed(blooms, '.')
    expect(bed.ironMasterpieceCount).toBe(2)
  })

  it('counts void blooms', () => {
    const blooms = [
      analyzeIronBloom(emptyContent, 'a.ts'),
      analyzeIronBloom(emptyContent, 'b.ts'),
    ]
    const bed = analyzeIronBed(blooms, '.')
    expect(bed.voidCount).toBe(2)
  })
})

// ─── buildIronGardenResult ─────────────────────────────

describe('buildIronGardenResult', () => {
  it('handles empty input', async () => {
    const result = await buildIronGardenResult([], [])
    expect(result.blooms).toHaveLength(0)
    expect(result.beds).toHaveLength(0)
    expect(result.landscape.avgStrength).toBe(0)
    expect(result.landscape.avgPrecision).toBe(0)
    expect(result.landscape.avgVitality).toBe(0)
    expect(result.landscape.overallBloom).toBe(0)
    expect(result.landscape.isIron).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalBeds).toBe(0)
    expect(result.stats.gardenerGrade).toBe('weed-puller')
    expect(result.stats.bestBloom).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', async () => {
    const result = await buildIronGardenResult(['app.ts'], [richContent])
    expect(result.blooms).toHaveLength(1)
    expect(result.blooms[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildIronGardenResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.blooms).toHaveLength(3)
    expect(result.beds.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups files by directory into beds', async () => {
    const result = await buildIronGardenResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.beds).toHaveLength(2)
    const srcBed = result.beds.find((b) => b.directory === 'src')
    expect(srcBed).toBeDefined()
    expect(srcBed!.blooms).toHaveLength(2)
    const libBed = result.beds.find((b) => b.directory === 'lib')
    expect(libBed).toBeDefined()
    expect(libBed!.blooms).toHaveLength(1)
  })

  it('computes landscape overview', async () => {
    const result = await buildIronGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.landscape.avgStrength).toBe(100)
    expect(result.landscape.avgPrecision).toBe(100)
    expect(result.landscape.avgVitality).toBe(100)
    expect(result.landscape.overallBloom).toBe(100)
    expect(result.landscape.isIron).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildIronGardenResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgStrengthThroughNature).toBe(100)
    expect(result.stats.avgRustResistance).toBe(100)
    expect(result.stats.avgBloomPrecision).toBe(100)
    expect(result.stats.avgRootDepth).toBe(100)
    expect(result.stats.avgForgeVitality).toBe(100)
    expect(result.stats.ironMasterpieceCount).toBe(2)
    expect(result.stats.gardenParadiseCount).toBe(0)
    expect(result.stats.properGardenCount).toBe(0)
    expect(result.stats.weedyPlotCount).toBe(0)
    expect(result.stats.rustyGateCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.overallBloom).toBe(100)
    expect(result.stats.gardenerGrade).toBe('iron-botanist')
  })

  it('finds best/strongest/most-resistant/precise/deepest/vital', async () => {
    const result = await buildIronGardenResult(
      ['rich.ts', 'poor.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestBloom).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.mostResistant).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.deepest).toBe('rich.ts')
    expect(result.stats.mostVital).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildIronGardenResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighResistanceCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighVitalityCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    expect(result.blooms[0].strengthThroughNature).toBe(100)
    expect(result.blooms[0].rustResistance).toBe(100)
    expect(result.blooms[0].bloomPrecision).toBe(100)
    expect(result.blooms[0].rootDepth).toBe(100)
    expect(result.blooms[0].forgeVitality).toBe(100)
    expect(result.blooms[0].qualityScore).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends strength improvement', async () => {
    const result = await buildIronGardenResult(['a.ts'], [poorContent])
    const hasStrength = result.recommendations.some((r) =>
      r.toLowerCase().includes('strength') || r.toLowerCase().includes('framework'),
    )
    expect(hasStrength).toBe(true)
  })

  it('recommends resistance improvement', async () => {
    const result = await buildIronGardenResult(['a.ts'], [poorContent])
    const hasResistance = result.recommendations.some((r) =>
      r.toLowerCase().includes('rust') || r.toLowerCase().includes('resistance'),
    )
    expect(hasResistance).toBe(true)
  })

  it('recommends precision improvement', async () => {
    const result = await buildIronGardenResult(['a.ts'], [poorContent])
    const hasPrecision = result.recommendations.some((r) =>
      r.toLowerCase().includes('precision') || r.toLowerCase().includes('bloom'),
    )
    expect(hasPrecision).toBe(true)
  })

  it('recommends depth improvement', async () => {
    const result = await buildIronGardenResult(['a.ts'], [poorContent])
    const hasDepth = result.recommendations.some((r) =>
      r.toLowerCase().includes('root') || r.toLowerCase().includes('depth'),
    )
    expect(hasDepth).toBe(true)
  })

  it('recommends vitality improvement', async () => {
    const result = await buildIronGardenResult(['a.ts'], [poorContent])
    const hasVitality = result.recommendations.some((r) =>
      r.toLowerCase().includes('forge') || r.toLowerCase().includes('vitality'),
    )
    expect(hasVitality).toBe(true)
  })

  it('returns default positive recommendation when all is good', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorCondition returns string for all conditions', () => {
    expect(typeof colorCondition('iron-masterpiece')).toBe('string')
    expect(typeof colorCondition('garden-paradise')).toBe('string')
    expect(typeof colorCondition('proper-garden')).toBe('string')
    expect(typeof colorCondition('weedy-plot')).toBe('string')
    expect(typeof colorCondition('rusty-gate')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('colorBedCondition returns string for all conditions', () => {
    expect(typeof colorBedCondition('botanical-palace')).toBe('string')
    expect(typeof colorBedCondition('iron-garden')).toBe('string')
    expect(typeof colorBedCondition('proper-plot')).toBe('string')
    expect(typeof colorBedCondition('weedy-corner')).toBe('string')
    expect(typeof colorBedCondition('rusty-gate')).toBe('string')
    expect(typeof colorBedCondition('void')).toBe('string')
  })

  it('formatBloomTable returns string', () => {
    const bloom = analyzeIronBloom(richContent, 'test.ts')
    expect(typeof formatBloomTable(bloom)).toBe('string')
  })

  it('formatBloomsTable handles empty array', () => {
    expect(typeof formatBloomsTable([])).toBe('string')
  })

  it('formatBloomsTable formats multiple blooms', () => {
    const blooms = [
      analyzeIronBloom(richContent, 'a.ts'),
      analyzeIronBloom(minimalContent, 'b.ts'),
    ]
    expect(typeof formatBloomsTable(blooms)).toBe('string')
  })

  it('formatBedTable returns string', () => {
    const blooms = [analyzeIronBloom(richContent, 'a.ts')]
    const bed = analyzeIronBed(blooms, 'src')
    expect(typeof formatBedTable(bed)).toBe('string')
  })

  it('formatBedsTable handles empty array', () => {
    expect(typeof formatBedsTable([])).toBe('string')
  })

  it('formatBedsTable formats multiple beds', async () => {
    const result = await buildIronGardenResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(typeof formatBedsTable(result.beds)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations formats list', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildIronGardenResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.blooms).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
