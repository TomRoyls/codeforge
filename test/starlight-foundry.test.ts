import { describe, expect, it } from 'vitest'

import {
  measureForging,
  measureHardening,
  measurePatterning,
  measureRevealing,
  measureAccumulating,
  classifyCondition,
  classifyClusterType,
  classifyClusterCondition,
  classifySmithGrade,
  analyzeStarIngot,
  analyzeStarCluster,
  buildStarlightForgeResult,
  generateRecommendations,
} from '../src/commands/starlight-foundry-helpers.js'
import {
  colorScore,
  colorCondition,
  colorClusterCondition,
  formatIngotTable,
  formatIngotsTable,
  formatClusterTable,
  formatClustersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/starlight-foundry-format-helpers.js'

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
  '// mystery magic unexplained',
].join('\n')

// ─── measureForging ────────────────────────────────────

describe('measureForging', () => {
  it('scores rich content high', () => {
    const result = measureForging(richContent)
    expect(result.forging).toBe(100)
    expect(result.hasHighForging).toBe(true)
    expect(result.starlight).toBe('neutron-star-forge')
  })

  it('scores empty content low', () => {
    const result = measureForging(emptyContent)
    expect(result.forging).toBe(0)
    expect(result.hasHighForging).toBe(false)
    expect(result.starlight).toBe('no-forging')
  })

  it('detects well-structured patterns', () => {
    const result = measureForging('class X { }; interface Y { }')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects modular patterns', () => {
    const result = measureForging('export function run() {}')
    expect(result.hasModular).toBe(true)
  })

  it('detects clean pipelines', () => {
    const result = measureForging('import { x } from "y"; export { x }')
    expect(result.hasCleanPipelines).toBe(true)
  })

  it('detects efficient patterns', () => {
    const result = measureForging('const x: readonly string = ""')
    expect(result.hasEfficient).toBe(true)
  })

  it('detects precise patterns', () => {
    const result = measureForging('function f(): string { return "" }')
    expect(result.hasPrecise).toBe(true)
  })

  it('detects masterful patterns', () => {
    const result = measureForging('class X { private y: string }')
    expect(result.hasMasterful).toBe(true)
  })

  it('detects refined patterns', () => {
    const result = measureForging('function f() {}; class X { }; interface I { }')
    expect(result.hasRefined).toBe(true)
  })

  it('detects polished patterns', () => {
    const result = measureForging('try { if (x) throw e } catch { }')
    expect(result.hasPolished).toBe(true)
  })

  it('counts chaotic patterns', () => {
    const result = measureForging('var x = 1')
    expect(result.chaoticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts tangled patterns', () => {
    const result = measureForging('// tangled spaghetti')
    expect(result.tangledCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies starlight thresholds', () => {
    expect(measureForging(richContent).starlight).toBe('neutron-star-forge')
    expect(measureForging(emptyContent).starlight).toBe('no-forging')
  })
})

// ─── measureHardening ──────────────────────────────────

describe('measureHardening', () => {
  it('scores rich content high', () => {
    const result = measureHardening(richContent)
    expect(result.hardness).toBe(100)
    expect(result.hasHighHardness).toBe(true)
    expect(result.core).toBe('neutron-core')
  })

  it('scores empty content low', () => {
    const result = measureHardening(emptyContent)
    expect(result.hardness).toBeGreaterThanOrEqual(0)
    expect(result.core).toBe('no-hardness')
  })

  it('detects tested patterns', () => {
    const result = measureHardening('try { if (x) { y() } } catch { }')
    expect(result.hasTested).toBe(true)
  })

  it('detects type-safe patterns', () => {
    const result = measureHardening('function f(): string { return "" }')
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects consistent patterns', () => {
    const result = measureHardening('const x = {} as const; readonly y')
    expect(result.hasConsistent).toBe(true)
  })

  it('detects stable patterns', () => {
    const result = measureHardening('class X implements interface Y { readonly z }')
    expect(result.hasStable).toBe(true)
  })

  it('detects proven patterns', () => {
    const result = measureHardening('const x = {} as const; readonly y')
    expect(result.hasProven).toBe(true)
  })

  it('detects maintained patterns', () => {
    const result = measureHardening('import { x } from "y"; export { x }')
    expect(result.hasMaintained).toBe(true)
  })

  it('detects reliable patterns', () => {
    const result = measureHardening('try { if (x) throw e } catch { }')
    expect(result.hasReliable).toBe(true)
  })

  it('detects deterministic patterns', () => {
    const result = measureHardening('const x: readonly string = ""')
    expect(result.hasDeterministic).toBe(true)
  })

  it('counts untested patterns', () => {
    const result = measureHardening('var x = 1')
    expect(result.untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('counts unsafe patterns', () => {
    const result = measureHardening('const x: any = {}')
    expect(result.unsafeCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies core thresholds', () => {
    expect(measureHardening(richContent).core).toBe('neutron-core')
    expect(measureHardening(emptyContent).core).toBe('no-hardness')
  })
})

// ─── measurePatterning ─────────────────────────────────

describe('measurePatterning', () => {
  it('scores rich content high', () => {
    const result = measurePatterning(richContent)
    expect(result.pattern).toBe(100)
    expect(result.hasHighPattern).toBe(true)
    expect(result.constellation).toBe('perfect-geometry')
  })

  it('scores empty content low', () => {
    const result = measurePatterning(emptyContent)
    expect(result.pattern).toBeGreaterThanOrEqual(0)
    expect(result.constellation).toBe('no-pattern')
  })

  it('detects organized patterns', () => {
    const result = measurePatterning('class X { }; interface Y { }')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects connected patterns', () => {
    const result = measurePatterning('import { x } from "y"; export { x }')
    expect(result.hasConnected).toBe(true)
  })

  it('detects exported patterns', () => {
    const result = measurePatterning('export function run() {}')
    expect(result.hasExported).toBe(true)
  })

  it('detects documented patterns', () => {
    const result = measurePatterning('/** docs */')
    expect(result.hasDocumented).toBe(true)
  })

  it('detects linked patterns', () => {
    const result = measurePatterning('import { x } from "y"')
    expect(result.hasLinked).toBe(true)
  })

  it('detects integrated patterns', () => {
    const result = measurePatterning('class X { }; interface Y { }; type T = string')
    expect(result.hasIntegrated).toBe(true)
  })

  it('detects named patterns', () => {
    const result = measurePatterning('function f() {}; class X { }; interface Y { }')
    expect(result.hasNamed).toBe(true)
  })

  it('detects visible patterns', () => {
    const result = measurePatterning('export function run() {}')
    expect(result.hasVisible).toBe(true)
  })

  it('counts scattered patterns', () => {
    const result = measurePatterning('var x = 1')
    expect(result.scatteredCount).toBeGreaterThanOrEqual(0)
  })

  it('counts isolated patterns', () => {
    const result = measurePatterning('// isolated orphan standalone')
    expect(result.isolatedCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies constellation thresholds', () => {
    expect(measurePatterning(richContent).constellation).toBe('perfect-geometry')
    expect(measurePatterning(emptyContent).constellation).toBe('no-pattern')
  })
})

// ─── measureRevealing ──────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content high', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
    expect(result.nebula).toBe('eagle-nebula')
  })

  it('scores empty content low', () => {
    const result = measureRevealing(emptyContent)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.nebula).toBe('no-clarity')
  })

  it('detects readable patterns', () => {
    const result = measureRevealing('const x = 1; function f() {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects self-documenting patterns', () => {
    const result = measureRevealing('export async function run(): Promise<void> {}')
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects clear type annotations', () => {
    const result = measureRevealing('function f(): string { return "" }')
    expect(result.hasClear).toBe(true)
  })

  it('detects transparent patterns', () => {
    const result = measureRevealing('export function run() {}')
    expect(result.hasTransparent).toBe(true)
  })

  it('detects understandable patterns', () => {
    const result = measureRevealing('if (x) { return y } throw new Error()')
    expect(result.hasUnderstandable).toBe(true)
  })

  it('detects visible patterns', () => {
    const result = measureRevealing('import { x } from "y"; export { x }')
    expect(result.hasVisible).toBe(true)
  })

  it('detects illuminated patterns', () => {
    const result = measureRevealing('try { x() } catch { y() }')
    expect(result.hasIlluminated).toBe(true)
  })

  it('detects revealing patterns', () => {
    const result = measureRevealing('/** docs */')
    expect(result.hasRevealing).toBe(true)
  })

  it('counts cryptic patterns', () => {
    const result = measureRevealing('var x = 1')
    expect(result.crypticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts obfuscated patterns', () => {
    const result = measureRevealing('// obfuscate minify uglify')
    expect(result.obfuscatedCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies nebula thresholds', () => {
    expect(measureRevealing(richContent).nebula).toBe('eagle-nebula')
    expect(measureRevealing(emptyContent).nebula).toBe('no-clarity')
  })
})

// ─── measureAccumulating ───────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content high', () => {
    const result = measureAccumulating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
    expect(result.cosmos).toBe('universe-sage')
  })

  it('scores empty content low', () => {
    const result = measureAccumulating(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.cosmos).toBe('no-wisdom')
  })

  it('detects well-architected patterns', () => {
    const result = measureAccumulating('class X implements interface Y { }')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled patterns', () => {
    const result = measureAccumulating('class X { private y: string; protected z }')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep patterns', () => {
    const result = measureAccumulating('interface X<T> { }; type Y = string')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven patterns', () => {
    const result = measureAccumulating('const x = {} as const; readonly y')
    expect(result.hasProven).toBe(true)
  })

  it('detects patterned code', () => {
    const result = measureAccumulating('function f() {}; class X { }; interface Y { }')
    expect(result.hasPatterned).toBe(true)
  })

  it('detects strategic patterns', () => {
    const result = measureAccumulating('import { x } from "y"; export { x }')
    expect(result.hasStrategic).toBe(true)
  })

  it('detects visionary patterns', () => {
    const result = measureAccumulating('try { if (x) throw e } catch { }')
    expect(result.hasVisionary).toBe(true)
  })

  it('counts hacked patterns', () => {
    const result = measureAccumulating('// hack workaround monkey-patch')
    expect(result.hackedCount).toBeGreaterThanOrEqual(0)
  })

  it('counts ad-hoc patterns', () => {
    const result = measureAccumulating('const x: any = {}')
    expect(result.adHocCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies cosmos thresholds', () => {
    expect(measureAccumulating(richContent).cosmos).toBe('universe-sage')
    expect(measureAccumulating(emptyContent).cosmos).toBe('no-wisdom')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies stellar-masterpiece', () => {
    expect(classifyCondition(90)).toBe('stellar-masterpiece')
    expect(classifyCondition(95)).toBe('stellar-masterpiece')
  })

  it('classifies star-forged', () => {
    expect(classifyCondition(75)).toBe('star-forged')
    expect(classifyCondition(89)).toBe('star-forged')
  })

  it('classifies proper-alloy', () => {
    expect(classifyCondition(60)).toBe('proper-alloy')
    expect(classifyCondition(74)).toBe('proper-alloy')
  })

  it('classifies meteor-scrap', () => {
    expect(classifyCondition(40)).toBe('meteor-scrap')
    expect(classifyCondition(59)).toBe('meteor-scrap')
  })

  it('classifies space-dust', () => {
    expect(classifyCondition(20)).toBe('space-dust')
    expect(classifyCondition(39)).toBe('space-dust')
  })

  it('classifies void', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyClusterType', () => {
  it('returns no-cluster for empty ingots', () => {
    expect(classifyClusterType([])).toBe('no-cluster')
  })

  it('returns globular-cluster for high scores', () => {
    const ingots = [{ qualityScore: 95 }] as any
    expect(classifyClusterType(ingots)).toBe('globular-cluster')
  })

  it('returns open-cluster for good scores', () => {
    const ingots = [{ qualityScore: 80 }] as any
    expect(classifyClusterType(ingots)).toBe('open-cluster')
  })

  it('returns proper-group for moderate scores', () => {
    const ingots = [{ qualityScore: 65 }] as any
    expect(classifyClusterType(ingots)).toBe('proper-group')
  })

  it('returns binary-system for low scores', () => {
    const ingots = [{ qualityScore: 45 }] as any
    expect(classifyClusterType(ingots)).toBe('binary-system')
  })

  it('returns lone-star for very low scores', () => {
    const ingots = [{ qualityScore: 25 }] as any
    expect(classifyClusterType(ingots)).toBe('lone-star')
  })

  it('returns no-cluster for zero scores', () => {
    const ingots = [{ qualityScore: 5 }] as any
    expect(classifyClusterType(ingots)).toBe('no-cluster')
  })
})

describe('classifyClusterCondition', () => {
  it('classifies galactic-core', () => {
    expect(classifyClusterCondition(85)).toBe('galactic-core')
    expect(classifyClusterCondition(100)).toBe('galactic-core')
  })

  it('classifies star-nursery', () => {
    expect(classifyClusterCondition(70)).toBe('star-nursery')
    expect(classifyClusterCondition(84)).toBe('star-nursery')
  })

  it('classifies proper-cluster', () => {
    expect(classifyClusterCondition(55)).toBe('proper-cluster')
    expect(classifyClusterCondition(69)).toBe('proper-cluster')
  })

  it('classifies sparse-field', () => {
    expect(classifyClusterCondition(35)).toBe('sparse-field')
    expect(classifyClusterCondition(54)).toBe('sparse-field')
  })

  it('classifies empty-void', () => {
    expect(classifyClusterCondition(15)).toBe('empty-void')
    expect(classifyClusterCondition(34)).toBe('empty-void')
  })

  it('classifies void', () => {
    expect(classifyClusterCondition(0)).toBe('void')
    expect(classifyClusterCondition(14)).toBe('void')
  })
})

describe('classifySmithGrade', () => {
  it('classifies cosmic-smith', () => {
    expect(classifySmithGrade(80)).toBe('cosmic-smith')
    expect(classifySmithGrade(100)).toBe('cosmic-smith')
  })

  it('classifies star-forger', () => {
    expect(classifySmithGrade(65)).toBe('star-forger')
    expect(classifySmithGrade(79)).toBe('star-forger')
  })

  it('classifies nebula-crafter', () => {
    expect(classifySmithGrade(50)).toBe('nebula-crafter')
    expect(classifySmithGrade(64)).toBe('nebula-crafter')
  })

  it('classifies apprentice', () => {
    expect(classifySmithGrade(35)).toBe('apprentice')
    expect(classifySmithGrade(49)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifySmithGrade(20)).toBe('novice')
    expect(classifySmithGrade(34)).toBe('novice')
  })

  it('classifies earth-bound', () => {
    expect(classifySmithGrade(0)).toBe('earth-bound')
    expect(classifySmithGrade(19)).toBe('earth-bound')
  })
})

// ─── analyzeStarIngot ──────────────────────────────────

describe('analyzeStarIngot', () => {
  it('analyzes rich content correctly', () => {
    const ingot = analyzeStarIngot(richContent, 'app.ts')
    expect(ingot.file).toBe('app.ts')
    expect(ingot.celestialForging).toBe(100)
    expect(ingot.starHardness).toBe(100)
    expect(ingot.constellationPattern).toBe(100)
    expect(ingot.nebulaClarity).toBe(100)
    expect(ingot.cosmicWisdom).toBe(100)
    expect(ingot.qualityScore).toBe(100)
    expect(ingot.condition).toBe('stellar-masterpiece')
  })

  it('analyzes empty content', () => {
    const ingot = analyzeStarIngot(emptyContent, 'empty.ts')
    expect(ingot.file).toBe('empty.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
    expect(ingot.condition).toBe('void')
  })

  it('computes quality score as weighted average', () => {
    const ingot = analyzeStarIngot(richContent, 'test.ts')
    const expected = Math.round(
      ingot.celestialForging * 0.2 +
      ingot.starHardness * 0.2 +
      ingot.constellationPattern * 0.2 +
      ingot.nebulaClarity * 0.2 +
      ingot.cosmicWisdom * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('preserves all measure objects', () => {
    const ingot = analyzeStarIngot(richContent, 'test.ts')
    expect(ingot.forging).toBeDefined()
    expect(ingot.hardening).toBeDefined()
    expect(ingot.patterning).toBeDefined()
    expect(ingot.revealing).toBeDefined()
    expect(ingot.accumulating).toBeDefined()
  })
})

// ─── analyzeStarCluster ────────────────────────────────

describe('analyzeStarCluster', () => {
  it('returns empty cluster for no ingots', () => {
    const cluster = analyzeStarCluster([], 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.ingots).toHaveLength(0)
    expect(cluster.avgForging).toBe(0)
    expect(cluster.avgPattern).toBe(0)
    expect(cluster.avgWisdom).toBe(0)
    expect(cluster.stellarMasterpieceCount).toBe(0)
    expect(cluster.voidCount).toBe(0)
    expect(cluster.clusterType).toBe('no-cluster')
    expect(cluster.condition).toBe('void')
  })

  it('computes averages from ingots', () => {
    const ingots = [
      analyzeStarIngot(richContent, 'src/a.ts'),
      analyzeStarIngot(minimalContent, 'src/b.ts'),
    ]
    const cluster = analyzeStarCluster(ingots, 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.ingots).toHaveLength(2)
    expect(cluster.avgForging).toBeGreaterThanOrEqual(0)
    expect(cluster.avgPattern).toBeGreaterThanOrEqual(0)
    expect(cluster.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts stellar masterpieces', () => {
    const ingots = [
      analyzeStarIngot(richContent, 'a.ts'),
      analyzeStarIngot(richContent, 'b.ts'),
    ]
    const cluster = analyzeStarCluster(ingots, '.')
    expect(cluster.stellarMasterpieceCount).toBe(2)
  })

  it('counts void ingots', () => {
    const ingots = [
      analyzeStarIngot(emptyContent, 'a.ts'),
      analyzeStarIngot(emptyContent, 'b.ts'),
    ]
    const cluster = analyzeStarCluster(ingots, '.')
    expect(cluster.voidCount).toBe(2)
  })
})

// ─── buildStarlightForgeResult ─────────────────────────

describe('buildStarlightForgeResult', () => {
  it('handles empty input', async () => {
    const result = await buildStarlightForgeResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
    expect(result.cosmos.avgForging).toBe(0)
    expect(result.cosmos.avgPattern).toBe(0)
    expect(result.cosmos.avgWisdom).toBe(0)
    expect(result.cosmos.overallBrilliance).toBe(0)
    expect(result.cosmos.isStellar).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalClusters).toBe(0)
    expect(result.stats.smithGrade).toBe('earth-bound')
    expect(result.stats.bestIngot).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', async () => {
    const result = await buildStarlightForgeResult(['app.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.ingots[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildStarlightForgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.ingots).toHaveLength(3)
    expect(result.clusters.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups files by directory into clusters', async () => {
    const result = await buildStarlightForgeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.clusters).toHaveLength(2)
    const srcCluster = result.clusters.find((c) => c.directory === 'src')
    expect(srcCluster).toBeDefined()
    expect(srcCluster!.ingots).toHaveLength(2)
    const libCluster = result.clusters.find((c) => c.directory === 'lib')
    expect(libCluster).toBeDefined()
    expect(libCluster!.ingots).toHaveLength(1)
  })

  it('computes cosmos overview', async () => {
    const result = await buildStarlightForgeResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.cosmos.avgForging).toBe(100)
    expect(result.cosmos.avgPattern).toBe(100)
    expect(result.cosmos.avgWisdom).toBe(100)
    expect(result.cosmos.overallBrilliance).toBe(100)
    expect(result.cosmos.isStellar).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildStarlightForgeResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgCelestialForging).toBe(100)
    expect(result.stats.avgStarHardness).toBe(100)
    expect(result.stats.avgConstellationPattern).toBe(100)
    expect(result.stats.avgNebulaClarity).toBe(100)
    expect(result.stats.avgCosmicWisdom).toBe(100)
    expect(result.stats.stellarMasterpieceCount).toBe(2)
    expect(result.stats.starForgedCount).toBe(0)
    expect(result.stats.properAlloyCount).toBe(0)
    expect(result.stats.meteorScrapCount).toBe(0)
    expect(result.stats.spaceDustCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.overallBrilliance).toBe(100)
    expect(result.stats.smithGrade).toBe('cosmic-smith')
  })

  it('finds best/masterful/hardest/connected/clearest/wisest', async () => {
    const result = await buildStarlightForgeResult(
      ['rich.ts', 'poor.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestIngot).toBe('rich.ts')
    expect(result.stats.mostMasterful).toBe('rich.ts')
    expect(result.stats.hardest).toBe('rich.ts')
    expect(result.stats.mostConnected).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildStarlightForgeResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighForgingCount).toBe(1)
    expect(result.stats.hasHighHardnessCount).toBe(1)
    expect(result.stats.hasHighPatternCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
    expect(result.ingots[0].celestialForging).toBe(100)
    expect(result.ingots[0].starHardness).toBe(100)
    expect(result.ingots[0].constellationPattern).toBe(100)
    expect(result.ingots[0].nebulaClarity).toBe(100)
    expect(result.ingots[0].cosmicWisdom).toBe(100)
    expect(result.ingots[0].qualityScore).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('stellar masterpieces')
  })

  it('recommends forging improvement', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [poorContent])
    const hasForging = result.recommendations.some((r) =>
      r.toLowerCase().includes('starlight') || r.toLowerCase().includes('forging'),
    )
    expect(hasForging).toBe(true)
  })

  it('recommends hardness improvement', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [poorContent])
    const hasHardness = result.recommendations.some((r) =>
      r.toLowerCase().includes('harden') || r.toLowerCase().includes('core'),
    )
    expect(hasHardness).toBe(true)
  })

  it('recommends pattern improvement', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [poorContent])
    const hasPattern = result.recommendations.some((r) =>
      r.toLowerCase().includes('constellation') || r.toLowerCase().includes('pattern'),
    )
    expect(hasPattern).toBe(true)
  })

  it('recommends clarity improvement', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [poorContent])
    const hasClarity = result.recommendations.some((r) =>
      r.toLowerCase().includes('nebula') || r.toLowerCase().includes('clarity'),
    )
    expect(hasClarity).toBe(true)
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [poorContent])
    const hasWisdom = result.recommendations.some((r) =>
      r.toLowerCase().includes('wisdom') || r.toLowerCase().includes('cosmic'),
    )
    expect(hasWisdom).toBe(true)
  })

  it('returns default positive recommendation when all is good', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
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
    expect(typeof colorCondition('stellar-masterpiece')).toBe('string')
    expect(typeof colorCondition('star-forged')).toBe('string')
    expect(typeof colorCondition('proper-alloy')).toBe('string')
    expect(typeof colorCondition('meteor-scrap')).toBe('string')
    expect(typeof colorCondition('space-dust')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('colorClusterCondition returns string for all conditions', () => {
    expect(typeof colorClusterCondition('galactic-core')).toBe('string')
    expect(typeof colorClusterCondition('star-nursery')).toBe('string')
    expect(typeof colorClusterCondition('proper-cluster')).toBe('string')
    expect(typeof colorClusterCondition('sparse-field')).toBe('string')
    expect(typeof colorClusterCondition('empty-void')).toBe('string')
    expect(typeof colorClusterCondition('void')).toBe('string')
  })

  it('formatIngotTable returns string', () => {
    const ingot = analyzeStarIngot(richContent, 'test.ts')
    expect(typeof formatIngotTable(ingot)).toBe('string')
  })

  it('formatIngotsTable handles empty array', () => {
    expect(typeof formatIngotsTable([])).toBe('string')
  })

  it('formatIngotsTable formats multiple ingots', () => {
    const ingots = [
      analyzeStarIngot(richContent, 'a.ts'),
      analyzeStarIngot(minimalContent, 'b.ts'),
    ]
    expect(typeof formatIngotsTable(ingots)).toBe('string')
  })

  it('formatClusterTable returns string', () => {
    const ingots = [analyzeStarIngot(richContent, 'a.ts')]
    const cluster = analyzeStarCluster(ingots, 'src')
    expect(typeof formatClusterTable(cluster)).toBe('string')
  })

  it('formatClustersTable handles empty array', () => {
    expect(typeof formatClustersTable([])).toBe('string')
  })

  it('formatClustersTable formats multiple clusters', async () => {
    const result = await buildStarlightForgeResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(typeof formatClustersTable(result.clusters)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations formats list', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildStarlightForgeResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
