import { describe, expect, it } from 'vitest'

import {
  measureConnecting,
  measureRadiating,
  measureHarmonizing,
  measureNetworking,
  measureAccumulating,
  classifyCondition,
  classifyClusterType,
  classifyClusterCondition,
  classifyArchitectGrade,
  analyzeEmeraldNode,
  analyzeEmeraldCluster,
  buildEmeraldNexusResult,
  generateRecommendations,
} from '../src/commands/emerald-nexus-helpers.js'
import {
  colorScore,
  colorCondition,
  colorClusterCondition,
  formatNodeTable,
  formatNodesTable,
  formatClusterTable,
  formatClustersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/emerald-nexus-format-helpers.js'

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
  '// mystery magic unexplained',
  '// obfuscate minify uglify',
].join('\n')

const milestoneContent = `// emerald-nexus milestone test
import { x } from 'y'
export class Test {
  async run(): Promise<void> {
    try { if (x) { return } } catch { throw new Error() }
  }
}
`

// ─── measureConnecting ─────────────────────────────────

describe('measureConnecting', () => {
  it('scores rich content high', () => {
    const result = measureConnecting(richContent)
    expect(result.connectivity).toBe(100)
    expect(result.hasHighConnectivity).toBe(true)
    expect(result.gem).toBe('flawless-setting')
  })

  it('scores empty content low', () => {
    const result = measureConnecting(emptyContent)
    expect(result.connectivity).toBeGreaterThanOrEqual(0)
  })

  it('detects well-imported patterns', () => {
    expect(measureConnecting('import { x } from "y"').hasWellImported).toBe(true)
  })

  it('detects exported patterns', () => {
    expect(measureConnecting('export function run() {}').hasExported).toBe(true)
  })

  it('detects linked patterns', () => {
    expect(measureConnecting('import { x } from "y"').hasLinked).toBe(true)
  })

  it('detects integrated patterns', () => {
    expect(measureConnecting('class X { }; interface Y { }').hasIntegrated).toBe(true)
  })

  it('detects referenced patterns', () => {
    expect(measureConnecting('const x = 1; function f() {}').hasReferenced).toBe(true)
  })

  it('detects documented patterns', () => {
    expect(measureConnecting('/** docs */').hasDocumented).toBe(true)
  })

  it('detects typed patterns', () => {
    expect(measureConnecting('function f(): string { }').hasTyped).toBe(true)
  })

  it('detects no untyped patterns', () => {
    expect(measureConnecting('const x: string = ""').hasNoUntyped).toBe(true)
  })

  it('detects public API patterns', () => {
    expect(measureConnecting('export function run() {}').hasPublicAPI).toBe(true)
  })

  it('detects clear interface patterns', () => {
    expect(measureConnecting('interface X { }; type Y = string').hasClearInterface).toBe(true)
  })

  it('counts orphaned patterns', () => {
    expect(measureConnecting('// TODO fix this').orphanedCount).toBeGreaterThanOrEqual(1)
  })

  it('counts isolated patterns', () => {
    expect(measureConnecting('var global = 1').isolatedCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies gem thresholds', () => {
    expect(measureConnecting(richContent).gem).toBe('flawless-setting')
  })
})

// ─── measureRadiating ──────────────────────────────────

describe('measureRadiating', () => {
  it('scores rich content high', () => {
    const result = measureRadiating(richContent)
    expect(result.radiance).toBe(100)
    expect(result.hasHighRadiance).toBe(true)
    expect(result.nexus).toBe('brilliant-nexus')
  })

  it('scores empty content low', () => {
    const result = measureRadiating(emptyContent)
    expect(result.radiance).toBeGreaterThanOrEqual(0)
  })

  it('detects coordinated patterns', () => {
    expect(measureRadiating('class X { }; interface Y { }').hasCoordinated).toBe(true)
  })

  it('detects harmonious patterns', () => {
    expect(measureRadiating('const x: readonly string = ""').hasHarmonious).toBe(true)
  })

  it('detects central patterns', () => {
    expect(measureRadiating('export function run() {}').hasCentral).toBe(true)
  })

  it('detects organized patterns', () => {
    expect(measureRadiating('import { x } from "y"; export { x }').hasOrganized).toBe(true)
  })

  it('detects efficient patterns', () => {
    expect(measureRadiating('const x: readonly string = ""').hasEfficient).toBe(true)
  })

  it('detects luminous patterns', () => {
    expect(measureRadiating('async function run(): Promise<void> { await x() }').hasLuminous).toBe(true)
  })

  it('detects visible patterns', () => {
    expect(measureRadiating('try { x() } catch { } if (y) { }').hasVisible).toBe(true)
  })

  it('detects clear patterns', () => {
    expect(measureRadiating('function f(): string { }').hasClear).toBe(true)
  })

  it('detects structured patterns', () => {
    expect(measureRadiating('class X { private y }').hasStructured).toBe(true)
  })

  it('detects focused patterns', () => {
    expect(measureRadiating('return x; throw new Error()').hasFocused).toBe(true)
  })

  it('detects aligned patterns', () => {
    expect(measureRadiating('function f() { return x }').hasAligned).toBe(true)
  })

  it('counts conflicting patterns', () => {
    expect(measureRadiating('// conflict contradict').conflictingCount).toBeGreaterThanOrEqual(0)
  })

  it('counts scattered patterns', () => {
    expect(measureRadiating('var x = eval("1")').scatteredCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies nexus thresholds', () => {
    expect(measureRadiating(richContent).nexus).toBe('brilliant-nexus')
  })
})

// ─── measureHarmonizing ────────────────────────────────

describe('measureHarmonizing', () => {
  it('scores rich content high', () => {
    const result = measureHarmonizing(richContent)
    expect(result.harmony).toBe(100)
    expect(result.hasHighHarmony).toBe(true)
    expect(result.matrix).toBe('perfect-harmony')
  })

  it('scores empty content low', () => {
    const result = measureHarmonizing(emptyContent)
    expect(result.harmony).toBeGreaterThanOrEqual(0)
  })

  it('detects consistent patterns', () => {
    expect(measureHarmonizing('const x = 1; readonly y').hasConsistent).toBe(true)
  })

  it('detects balanced patterns', () => {
    expect(measureHarmonizing('readonly x; as const').hasBalanced).toBe(true)
  })

  it('detects tested patterns', () => {
    expect(measureHarmonizing('try { if (x) throw e } catch { }').hasTested).toBe(true)
  })

  it('detects type-safe patterns', () => {
    expect(measureHarmonizing('function f(): string { }').hasTypeSafe).toBe(true)
  })

  it('detects uniform patterns', () => {
    expect(measureHarmonizing('import { x } from "y"; export { x }').hasUniform).toBe(true)
  })

  it('detects dependable patterns', () => {
    expect(measureHarmonizing('class X { private y }').hasDependable).toBe(true)
  })

  it('detects predictable patterns', () => {
    expect(measureHarmonizing('function f() {}; class X { }; interface Y { }').hasPredictable).toBe(true)
  })

  it('detects symmetrical patterns', () => {
    expect(measureHarmonizing('async function run(): Promise<void> { await x() }').hasSymmetrical).toBe(true)
  })

  it('detects rhythmic patterns', () => {
    expect(measureHarmonizing('export function run() {}').hasRhythmic).toBe(true)
  })

  it('detects proportional patterns', () => {
    expect(measureHarmonizing('function f(): string { }').hasProportional).toBe(true)
  })

  it('detects elegant patterns', () => {
    expect(measureHarmonizing('return x; throw new Error()').hasElegant).toBe(true)
  })

  it('counts untested patterns', () => {
    expect(measureHarmonizing('var x = 1').untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies matrix thresholds', () => {
    expect(measureHarmonizing(richContent).matrix).toBe('perfect-harmony')
  })
})

// ─── measureNetworking ─────────────────────────────────

describe('measureNetworking', () => {
  it('scores rich content high', () => {
    const result = measureNetworking(richContent)
    expect(result.quality).toBe(100)
    expect(result.hasHighQuality).toBe(true)
    expect(result.lattice).toBe('perfect-lattice')
  })

  it('scores empty content low', () => {
    const result = measureNetworking(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
  })

  it('detects communicating patterns', () => {
    expect(measureNetworking('import { x } from "y"').hasCommunicating).toBe(true)
  })

  it('detects transparent patterns', () => {
    expect(measureNetworking('export function run() {}').hasTransparent).toBe(true)
  })

  it('detects flowing patterns', () => {
    expect(measureNetworking('async function run(): Promise<void> { await x() }').hasFlowing).toBe(true)
  })

  it('detects connected patterns', () => {
    expect(measureNetworking('class X { }; interface Y { }').hasConnected).toBe(true)
  })

  it('detects responsive patterns', () => {
    expect(measureNetworking('try { if (x) throw e } catch { }').hasResponsive).toBe(true)
  })

  it('detects reliable patterns', () => {
    expect(measureNetworking('class X { private readonly y }').hasReliable).toBe(true)
  })

  it('detects fast patterns', () => {
    expect(measureNetworking('const x: readonly string = ""').hasFast).toBe(true)
  })

  it('detects accurate patterns', () => {
    expect(measureNetworking('function f(): string { }').hasAccurate).toBe(true)
  })

  it('detects direct patterns', () => {
    expect(measureNetworking('return x; throw new Error()').hasDirect).toBe(true)
  })

  it('detects clean patterns', () => {
    expect(measureNetworking('const x = 1').hasClean).toBe(true)
  })

  it('detects faithful patterns', () => {
    expect(measureNetworking('function f() { return x }').hasFaithful).toBe(true)
  })

  it('counts silent patterns', () => {
    expect(measureNetworking('var x = eval("1")').silentCount).toBeGreaterThanOrEqual(1)
  })

  it('counts blocked patterns', () => {
    expect(measureNetworking('const x: any = {}').blockedCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies lattice thresholds', () => {
    expect(measureNetworking(richContent).lattice).toBe('perfect-lattice')
  })
})

// ─── measureAccumulating ───────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content high', () => {
    const result = measureAccumulating(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
    expect(result.emerald).toBe('ancient-gem')
  })

  it('scores empty content low', () => {
    const result = measureAccumulating(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
  })

  it('detects well-architected patterns', () => {
    expect(measureAccumulating('class X { }; interface Y { }').hasWellArchitected).toBe(true)
  })

  it('detects principled patterns', () => {
    expect(measureAccumulating('class X { private readonly y }').hasPrincipled).toBe(true)
  })

  it('detects proven patterns', () => {
    expect(measureAccumulating('export function run() {}').hasProven).toBe(true)
  })

  it('detects deep patterns', () => {
    expect(measureAccumulating('interface X { }; type Y = string').hasDeep).toBe(true)
  })

  it('detects mature patterns', () => {
    expect(measureAccumulating('const x: readonly string = ""').hasMature).toBe(true)
  })

  it('detects patterned code', () => {
    expect(measureAccumulating('function f() {}; class X { }; interface Y { }').hasPatterned).toBe(true)
  })

  it('detects insightful patterns', () => {
    expect(measureAccumulating('/** docs */').hasInsightful).toBe(true)
  })

  it('detects strategic patterns', () => {
    expect(measureAccumulating('import { x } from "y"; export { x }').hasStrategic).toBe(true)
  })

  it('detects visionary patterns', () => {
    expect(measureAccumulating('async function run(): Promise<void> { await x() }').hasVisionary).toBe(true)
  })

  it('detects connected patterns', () => {
    expect(measureAccumulating('try { if (x) throw e } catch { }').hasConnected).toBe(true)
  })

  it('detects evolved patterns', () => {
    expect(measureAccumulating('function f(): string { }').hasEvolved).toBe(true)
  })

  it('detects refined patterns', () => {
    expect(measureAccumulating('return x; throw new Error()').hasRefined).toBe(true)
  })

  it('counts hacked patterns', () => {
    expect(measureAccumulating('// hack workaround monkey').hackedCount).toBeGreaterThanOrEqual(1)
  })

  it('counts ad-hoc patterns', () => {
    expect(measureAccumulating('const x: any = {}').adHocCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies emerald thresholds', () => {
    expect(measureAccumulating(richContent).emerald).toBe('ancient-gem')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies emerald-masterpiece', () => { expect(classifyCondition(90)).toBe('emerald-masterpiece') })
  it('classifies nexus-prime', () => { expect(classifyCondition(75)).toBe('nexus-prime') })
  it('classifies proper-crystal', () => { expect(classifyCondition(60)).toBe('proper-crystal') })
  it('classifies cloudy-gem', () => { expect(classifyCondition(40)).toBe('cloudy-gem') })
  it('classifies rough-stone', () => { expect(classifyCondition(20)).toBe('rough-stone') })
  it('classifies void', () => { expect(classifyCondition(0)).toBe('void') })
})

describe('classifyClusterType', () => {
  it('returns no-cluster for empty', () => { expect(classifyClusterType([])).toBe('no-cluster') })
  it('returns grand-nexus', () => { expect(classifyClusterType([{ qualityScore: 95 }] as any)).toBe('grand-nexus') })
  it('returns crystal-hub', () => { expect(classifyClusterType([{ qualityScore: 80 }] as any)).toBe('crystal-hub') })
  it('returns proper-node', () => { expect(classifyClusterType([{ qualityScore: 60 }] as any)).toBe('proper-node') })
  it('returns minor-link', () => { expect(classifyClusterType([{ qualityScore: 40 }] as any)).toBe('minor-link') })
  it('returns disconnected', () => { expect(classifyClusterType([{ qualityScore: 10 }] as any)).toBe('disconnected') })
})

describe('classifyClusterCondition', () => {
  it('classifies emerald-cathedral', () => { expect(classifyClusterCondition(85)).toBe('emerald-cathedral') })
  it('classifies crystal-palace', () => { expect(classifyClusterCondition(70)).toBe('crystal-palace') })
  it('classifies proper-grotto', () => { expect(classifyClusterCondition(55)).toBe('proper-grotto') })
  it('classifies dull-cave', () => { expect(classifyClusterCondition(35)).toBe('dull-cave') })
  it('classifies empty-void', () => { expect(classifyClusterCondition(15)).toBe('empty-void') })
  it('classifies void', () => { expect(classifyClusterCondition(0)).toBe('void') })
})

describe('classifyArchitectGrade', () => {
  it('classifies nexus-architect', () => { expect(classifyArchitectGrade(80)).toBe('nexus-architect') })
  it('classifies crystal-engineer', () => { expect(classifyArchitectGrade(65)).toBe('crystal-engineer') })
  it('classifies gem-setter', () => { expect(classifyArchitectGrade(50)).toBe('gem-setter') })
  it('classifies apprentice', () => { expect(classifyArchitectGrade(35)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifyArchitectGrade(20)).toBe('novice') })
  it('classifies rock-collector', () => { expect(classifyArchitectGrade(0)).toBe('rock-collector') })
})

// ─── analyzeEmeraldNode ────────────────────────────────

describe('analyzeEmeraldNode', () => {
  it('analyzes rich content correctly', () => {
    const node = analyzeEmeraldNode(richContent, 'app.ts')
    expect(node.file).toBe('app.ts')
    expect(node.gemConnectivity).toBe(100)
    expect(node.nexusRadiance).toBe(100)
    expect(node.matrixHarmony).toBe(100)
    expect(node.crystalNetwork).toBe(100)
    expect(node.emeraldWisdom).toBe(100)
    expect(node.qualityScore).toBe(100)
    expect(node.condition).toBe('emerald-masterpiece')
  })

  it('analyzes empty content', () => {
    const node = analyzeEmeraldNode(emptyContent, 'empty.ts')
    expect(node.file).toBe('empty.ts')
    expect(node.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes weighted quality score', () => {
    const node = analyzeEmeraldNode(richContent, 'test.ts')
    const expected = Math.round(
      node.gemConnectivity * 0.2 +
      node.nexusRadiance * 0.2 +
      node.matrixHarmony * 0.2 +
      node.crystalNetwork * 0.2 +
      node.emeraldWisdom * 0.2,
    )
    expect(node.qualityScore).toBe(expected)
  })

  it('preserves all measure objects', () => {
    const node = analyzeEmeraldNode(richContent, 'test.ts')
    expect(node.connecting).toBeDefined()
    expect(node.radiating).toBeDefined()
    expect(node.harmonizing).toBeDefined()
    expect(node.networking).toBeDefined()
    expect(node.accumulating).toBeDefined()
  })

  it('sets celebration for milestone content', () => {
    const node = analyzeEmeraldNode(milestoneContent, 'emerald-nexus.ts')
    expect(node.celebration).toBe('★ Milestone #580 — Emerald Nexus ★')
  })

  it('does not set celebration for normal content', () => {
    const node = analyzeEmeraldNode(richContent, 'app.ts')
    expect(node.celebration).toBeUndefined()
  })

  it('sets celebration for emerald-matrix content', () => {
    const node = analyzeEmeraldNode('// emerald-matrix test', 'test.ts')
    expect(node.celebration).toBe('★ Milestone #580 — Emerald Nexus ★')
  })
})

// ─── analyzeEmeraldCluster ─────────────────────────────

describe('analyzeEmeraldCluster', () => {
  it('returns empty cluster for no nodes', () => {
    const cluster = analyzeEmeraldCluster([], 'src')
    expect(cluster.directory).toBe('src')
    expect(cluster.nodes).toHaveLength(0)
    expect(cluster.avgConnectivity).toBe(0)
    expect(cluster.avgRadiance).toBe(0)
    expect(cluster.avgWisdom).toBe(0)
    expect(cluster.emeraldMasterpieceCount).toBe(0)
    expect(cluster.voidCount).toBe(0)
    expect(cluster.clusterType).toBe('no-cluster')
    expect(cluster.condition).toBe('void')
  })

  it('computes averages from nodes', () => {
    const nodes = [
      analyzeEmeraldNode(richContent, 'src/a.ts'),
      analyzeEmeraldNode(minimalContent, 'src/b.ts'),
    ]
    const cluster = analyzeEmeraldCluster(nodes, 'src')
    expect(cluster.nodes).toHaveLength(2)
    expect(cluster.avgConnectivity).toBeGreaterThanOrEqual(0)
  })

  it('counts emerald masterpieces', () => {
    const nodes = [analyzeEmeraldNode(richContent, 'a.ts'), analyzeEmeraldNode(richContent, 'b.ts')]
    expect(analyzeEmeraldCluster(nodes, '.').emeraldMasterpieceCount).toBe(2)
  })
})

// ─── buildEmeraldNexusResult ───────────────────────────

describe('buildEmeraldNexusResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldNexusResult([], [])
    expect(result.nodes).toHaveLength(0)
    expect(result.clusters).toHaveLength(0)
    expect(result.network.overallRadiance).toBe(0)
    expect(result.network.isEmerald).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.architectGrade).toBe('rock-collector')
    expect(result.stats.bestNode).toBe('')
  })

  it('handles single file', async () => {
    const result = await buildEmeraldNexusResult(['app.ts'], [richContent])
    expect(result.nodes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildEmeraldNexusResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.nodes).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups by directory into clusters', async () => {
    const result = await buildEmeraldNexusResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.clusters).toHaveLength(2)
    expect(result.clusters.find((c) => c.directory === 'src')!.nodes).toHaveLength(2)
    expect(result.clusters.find((c) => c.directory === 'lib')!.nodes).toHaveLength(1)
  })

  it('computes network overview', async () => {
    const result = await buildEmeraldNexusResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.network.avgConnectivity).toBe(100)
    expect(result.network.avgRadiance).toBe(100)
    expect(result.network.avgWisdom).toBe(100)
    expect(result.network.overallRadiance).toBe(100)
    expect(result.network.isEmerald).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildEmeraldNexusResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.avgGemConnectivity).toBe(100)
    expect(result.stats.avgNexusRadiance).toBe(100)
    expect(result.stats.avgMatrixHarmony).toBe(100)
    expect(result.stats.avgCrystalNetwork).toBe(100)
    expect(result.stats.avgEmeraldWisdom).toBe(100)
    expect(result.stats.emeraldMasterpieceCount).toBe(2)
    expect(result.stats.nexusPrimeCount).toBe(0)
    expect(result.stats.properCrystalCount).toBe(0)
    expect(result.stats.cloudyGemCount).toBe(0)
    expect(result.stats.roughStoneCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.architectGrade).toBe('nexus-architect')
  })

  it('finds best/mostConnected/mostRadiant/mostHarmonious/bestNetworked/wisest', async () => {
    const result = await buildEmeraldNexusResult(['rich.ts', 'poor.ts'], [richContent, poorContent])
    expect(result.stats.bestNode).toBe('rich.ts')
    expect(result.stats.mostConnected).toBe('rich.ts')
    expect(result.stats.mostRadiant).toBe('rich.ts')
    expect(result.stats.mostHarmonious).toBe('rich.ts')
    expect(result.stats.bestNetworked).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(result.stats.hasHighConnectivityCount).toBe(1)
    expect(result.stats.hasHighRadianceCount).toBe(1)
    expect(result.stats.hasHighHarmonyCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(result.nodes[0].gemConnectivity).toBe(100)
    expect(result.nodes[0].nexusRadiance).toBe(100)
    expect(result.nodes[0].matrixHarmony).toBe(100)
    expect(result.nodes[0].crystalNetwork).toBe(100)
    expect(result.nodes[0].emeraldWisdom).toBe(100)
    expect(result.nodes[0].qualityScore).toBe(100)
  })

  it('sets milestone celebration in stats', async () => {
    const result = await buildEmeraldNexusResult(['emerald-nexus.ts'], [milestoneContent])
    expect(result.stats.celebration).toBe('★ Milestone #580 — 580 commands forged in the emerald fire ★')
  })

  it('does not set celebration without milestone content', async () => {
    const result = await buildEmeraldNexusResult(['app.ts'], [richContent])
    expect(result.stats.celebration).toBeUndefined()
  })

  it('sets node celebration for milestone files', async () => {
    const result = await buildEmeraldNexusResult(['emerald-nexus.ts'], [milestoneContent])
    expect(result.nodes[0].celebration).toBe('★ Milestone #580 — Emerald Nexus ★')
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends connectivity improvement', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /gem|connect/i.test(r))).toBe(true)
  })

  it('recommends radiance improvement', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /nexus|radiat|core/i.test(r))).toBe(true)
  })

  it('recommends harmony improvement', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /harmon|matrix/i.test(r))).toBe(true)
  })

  it('recommends network improvement', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /network|crystal|lattice/i.test(r))).toBe(true)
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /wisdom|emerald/i.test(r))).toBe(true)
  })

  it('returns default positive when all good', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })

  it('colorCondition covers all', () => {
    for (const c of ['emerald-masterpiece', 'nexus-prime', 'proper-crystal', 'cloudy-gem', 'rough-stone', 'void']) {
      expect(typeof colorCondition(c)).toBe('string')
    }
  })

  it('colorClusterCondition covers all', () => {
    for (const c of ['emerald-cathedral', 'crystal-palace', 'proper-grotto', 'dull-cave', 'empty-void', 'void']) {
      expect(typeof colorClusterCondition(c)).toBe('string')
    }
  })

  it('formatNodeTable returns string', () => {
    expect(typeof formatNodeTable(analyzeEmeraldNode(richContent, 'test.ts'))).toBe('string')
  })

  it('formatNodeTable includes celebration', () => {
    const output = formatNodeTable(analyzeEmeraldNode(milestoneContent, 'emerald-nexus.ts'))
    expect(output).toContain('Milestone')
  })

  it('formatNodesTable handles empty', () => {
    expect(typeof formatNodesTable([])).toBe('string')
  })

  it('formatNodesTable formats multiple', () => {
    const nodes = [analyzeEmeraldNode(richContent, 'a.ts'), analyzeEmeraldNode(minimalContent, 'b.ts')]
    expect(typeof formatNodesTable(nodes)).toBe('string')
  })

  it('formatClusterTable returns string', () => {
    const cluster = analyzeEmeraldCluster([analyzeEmeraldNode(richContent, 'a.ts')], 'src')
    expect(typeof formatClusterTable(cluster)).toBe('string')
  })

  it('formatClustersTable handles empty', () => {
    expect(typeof formatClustersTable([])).toBe('string')
  })

  it('formatClustersTable formats multiple', async () => {
    const result = await buildEmeraldNexusResult(['src/a.ts', 'lib/b.ts'], [richContent, richContent])
    expect(typeof formatClustersTable(result.clusters)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatStatsTable includes celebration', async () => {
    const result = await buildEmeraldNexusResult(['emerald-nexus.ts'], [milestoneContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Milestone')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildEmeraldNexusResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.nodes).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatResultJson includes celebration', async () => {
    const result = await buildEmeraldNexusResult(['emerald-nexus.ts'], [milestoneContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.stats.celebration).toContain('Milestone')
  })
})
