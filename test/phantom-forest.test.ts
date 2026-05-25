import { describe, it, expect } from 'vitest'
import {
  measureShimmering,
  measureWarding,
  measureRevealing,
  measureGrounding,
  measureShadowing,
  classifyTreeCondition,
  classifyClearingType,
  classifyWardenGrade,
  classifyClearingCondition,
  analyzePhantomTree,
  analyzePhantomClearing,
  buildPhantomGroveResult,
  generateRecommendations,
} from '../src/commands/phantom-forest-helpers.js'
import {
  colorScore,
  colorCondition,
  formatTreeTable,
  formatTreesTable,
  formatClearingTable,
  formatClearingsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-forest-format-helpers.js'

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

// ─── measureShimmering ──────────────────────────────────────────────

describe('measureShimmering', () => {
  it('returns 0 for empty content', () => {
    const m = measureShimmering('')
    expect(m.quality).toBe(0)
    expect(m.aura).toBe('no-quality')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureShimmering(minimalContent)
    expect(m.quality).toBe(0)
    expect(m.aura).toBe('no-quality')
    expect(m.hasElegant).toBe(false)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasNoHeavy).toBe(true)
    expect(m.clunkyCount).toBe(0)
    expect(m.heavyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureShimmering(richContent)
    expect(m.quality).toBe(100)
    expect(m.aura).toBe('spectral-brilliance')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasElegant).toBe(true)
    expect(m.hasLightweight).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasEfficient).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('detects clunky var usage', () => {
    const m = measureShimmering('var x = 1')
    expect(m.clunkyCount).toBe(1)
    expect(m.hasNoClunky).toBe(false)
  })

  it('detects heavy any usage', () => {
    const m = measureShimmering('const x: any = 1')
    expect(m.heavyCount).toBe(1)
    expect(m.hasNoHeavy).toBe(false)
  })
})

// ─── measureWarding ─────────────────────────────────────────────────

describe('measureWarding', () => {
  it('returns 0 for empty content', () => {
    const m = measureWarding('')
    expect(m.handling).toBe(0)
    expect(m.ghost).toBe('no-handling')
    expect(m.hasHighHandling).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureWarding(minimalContent)
    expect(m.handling).toBe(0)
    expect(m.ghost).toBe('no-handling')
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.bareCrashCount).toBe(0)
    expect(m.untestedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureWarding(richContent)
    expect(m.handling).toBe(100)
    expect(m.ghost).toBe('ghost-tamer')
    expect(m.hasHighHandling).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasEdgeCaseHandled).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasNullSafe).toBe(true)
    expect(m.hasRecoverable).toBe(true)
  })

  it('detects bare crash eval usage', () => {
    const m = measureWarding('eval("1")')
    expect(m.bareCrashCount).toBe(1)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('detects untested var usage', () => {
    const m = measureWarding('var x = 1')
    expect(m.untestedCount).toBe(1)
    expect(m.hasNoUntested).toBe(false)
  })
})

// ─── measureRevealing ───────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns 0 for empty content', () => {
    const m = measureRevealing('')
    expect(m.clarity).toBe(0)
    expect(m.mist).toBe('no-clarity')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRevealing(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.mist).toBe('no-clarity')
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoMystery).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.mysteryCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBe(100)
    expect(m.mist).toBe('revealing-mist')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasExplained).toBe(true)
    expect(m.hasOpen).toBe(true)
  })

  it('detects mystery eval usage', () => {
    const m = measureRevealing('eval("1")')
    expect(m.mysteryCount).toBe(1)
    expect(m.hasNoMystery).toBe(false)
  })

  it('detects obfuscated any usage', () => {
    const m = measureRevealing('const x: any = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })
})

// ─── measureGrounding ───────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns 0 for empty content', () => {
    const m = measureGrounding('')
    expect(m.depth).toBe(0)
    expect(m.root).toBe('no-depth')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureGrounding(minimalContent)
    expect(m.depth).toBe(0)
    expect(m.root).toBe('no-depth')
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoHacked).toBe(true)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hackedCount).toBe(0)
    expect(m.adHocCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureGrounding(richContent)
    expect(m.depth).toBe(100)
    expect(m.root).toBe('world-tree-roots')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasInsightful).toBe(true)
    expect(m.hasEstablished).toBe(true)
  })

  it('detects hacked var usage', () => {
    const m = measureGrounding('var x = 1')
    expect(m.hackedCount).toBe(1)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects ad-hoc any usage', () => {
    const m = measureGrounding('const x: any = 1')
    expect(m.adHocCount).toBe(1)
    expect(m.hasNoAdHoc).toBe(false)
  })
})

// ─── measureShadowing ───────────────────────────────────────────────

describe('measureShadowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureShadowing('')
    expect(m.wisdom).toBe(0)
    expect(m.shadow).toBe('no-wisdom')
    expect(m.hasHighWisdom).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureShadowing(minimalContent)
    expect(m.wisdom).toBe(0)
    expect(m.shadow).toBe('no-wisdom')
    expect(m.hasRobust).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoRigid).toBe(true)
    expect(m.fragileCount).toBe(0)
    expect(m.rigidCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureShadowing(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.shadow).toBe('shadow-sage')
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasAntifragile).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasStrategic).toBe(true)
    expect(m.hasVisionary).toBe(true)
    expect(m.hasDeepUnderstanding).toBe(true)
    expect(m.hasComplexityTamed).toBe(true)
    expect(m.hasWisdomFromFailure).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureShadowing('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects rigid eval usage', () => {
    const m = measureShadowing('eval("1")')
    expect(m.rigidCount).toBe(1)
    expect(m.hasNoRigid).toBe(false)
  })
})

// ─── classifyTreeCondition ──────────────────────────────────────────

describe('classifyTreeCondition', () => {
  it('classifies phantom-masterpiece for 90+', () => {
    expect(classifyTreeCondition(90)).toBe('phantom-masterpiece')
    expect(classifyTreeCondition(100)).toBe('phantom-masterpiece')
  })

  it('classifies ethereal-grove for 75-89', () => {
    expect(classifyTreeCondition(75)).toBe('ethereal-grove')
    expect(classifyTreeCondition(89)).toBe('ethereal-grove')
  })

  it('classifies proper-forest for 60-74', () => {
    expect(classifyTreeCondition(60)).toBe('proper-forest')
    expect(classifyTreeCondition(74)).toBe('proper-forest')
  })

  it('classifies faded-wood for 40-59', () => {
    expect(classifyTreeCondition(40)).toBe('faded-wood')
    expect(classifyTreeCondition(59)).toBe('faded-wood')
  })

  it('classifies dead-thicket for 20-39', () => {
    expect(classifyTreeCondition(20)).toBe('dead-thicket')
    expect(classifyTreeCondition(39)).toBe('dead-thicket')
  })

  it('classifies void for 0-19', () => {
    expect(classifyTreeCondition(0)).toBe('void')
    expect(classifyTreeCondition(19)).toBe('void')
  })
})

// ─── classifyClearingType ───────────────────────────────────────────

describe('classifyClearingType', () => {
  it('returns no-clearing for empty trees', () => {
    expect(classifyClearingType([])).toBe('no-clearing')
  })

  it('classifies enchanted-grove for high avg', () => {
    const trees = Array.from({ length: 4 }, (_, i) => ({
      ...analyzePhantomTree(richContent, `f${i}.ts`),
    }))
    expect(classifyClearingType(trees)).toBe('enchanted-grove')
  })

  it('classifies no-clearing for low scores', () => {
    const trees = [analyzePhantomTree('', 'a.ts')]
    expect(classifyClearingType(trees)).toBe('no-clearing')
  })

  it('classifies phantom-glade for mid-high scores', () => {
    const trees = Array.from({ length: 3 }, () => ({
      ...analyzePhantomTree(richContent, 'f.ts'),
      qualityScore: 75,
      condition: 'ethereal-grove' as const,
    }))
    expect(classifyClearingType(trees)).toBe('phantom-glade')
  })

  it('classifies proper-clearing for mid scores', () => {
    const trees = Array.from({ length: 3 }, () => ({
      ...analyzePhantomTree(richContent, 'f.ts'),
      qualityScore: 60,
      condition: 'proper-forest' as const,
    }))
    expect(classifyClearingType(trees)).toBe('proper-clearing')
  })

  it('classifies dark-thicket for low scores', () => {
    const trees = Array.from({ length: 3 }, () => ({
      ...analyzePhantomTree(richContent, 'f.ts'),
      qualityScore: 36,
      condition: 'faded-wood' as const,
    }))
    expect(classifyClearingType(trees)).toBe('dark-thicket')
  })

  it('classifies dead-brush for very low scores', () => {
    const trees = Array.from({ length: 3 }, () => ({
      ...analyzePhantomTree(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'void' as const,
    }))
    expect(classifyClearingType(trees)).toBe('dead-brush')
  })
})

// ─── classifyWardenGrade ────────────────────────────────────────────

describe('classifyWardenGrade', () => {
  it('classifies phantom-lord for 80+', () => {
    expect(classifyWardenGrade(80)).toBe('phantom-lord')
    expect(classifyWardenGrade(100)).toBe('phantom-lord')
  })

  it('classifies grove-keeper for 65-79', () => {
    expect(classifyWardenGrade(65)).toBe('grove-keeper')
    expect(classifyWardenGrade(79)).toBe('grove-keeper')
  })

  it('classifies forest-guardian for 50-64', () => {
    expect(classifyWardenGrade(50)).toBe('forest-guardian')
    expect(classifyWardenGrade(64)).toBe('forest-guardian')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyWardenGrade(35)).toBe('apprentice')
    expect(classifyWardenGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyWardenGrade(20)).toBe('novice')
    expect(classifyWardenGrade(34)).toBe('novice')
  })

  it('classifies lost-soul for 0-19', () => {
    expect(classifyWardenGrade(0)).toBe('lost-soul')
    expect(classifyWardenGrade(19)).toBe('lost-soul')
  })
})

// ─── classifyClearingCondition ──────────────────────────────────────

describe('classifyClearingCondition', () => {
  it('classifies ethereal-paradise for 85+', () => {
    expect(classifyClearingCondition(85)).toBe('ethereal-paradise')
  })

  it('classifies mystical-grove for 70-84', () => {
    expect(classifyClearingCondition(70)).toBe('mystical-grove')
  })

  it('classifies proper-forest for 55-69', () => {
    expect(classifyClearingCondition(55)).toBe('proper-forest')
  })

  it('classifies faded-wood for 35-54', () => {
    expect(classifyClearingCondition(35)).toBe('faded-wood')
  })

  it('classifies dead-thicket for 15-34', () => {
    expect(classifyClearingCondition(15)).toBe('dead-thicket')
  })

  it('classifies void for 0-14', () => {
    expect(classifyClearingCondition(0)).toBe('void')
  })
})

// ─── analyzePhantomTree ─────────────────────────────────────────────

describe('analyzePhantomTree', () => {
  it('analyzes minimal content', () => {
    const tree = analyzePhantomTree(minimalContent, 'minimal.ts')
    expect(tree.file).toBe('minimal.ts')
    expect(tree.etherealQuality).toBe(0)
    expect(tree.ghostHandling).toBe(0)
    expect(tree.mistClarity).toBe(0)
    expect(tree.rootDepth).toBe(0)
    expect(tree.shadowWisdom).toBe(0)
    expect(tree.qualityScore).toBe(0)
    expect(tree.condition).toBe('void')
    expect(tree.shimmering.aura).toBe('no-quality')
    expect(tree.warding.ghost).toBe('no-handling')
    expect(tree.revealing.mist).toBe('no-clarity')
    expect(tree.grounding.root).toBe('no-depth')
    expect(tree.shadowing.shadow).toBe('no-wisdom')
  })

  it('analyzes rich content', () => {
    const tree = analyzePhantomTree(richContent, 'rich.ts')
    expect(tree.file).toBe('rich.ts')
    expect(tree.etherealQuality).toBe(100)
    expect(tree.ghostHandling).toBe(100)
    expect(tree.mistClarity).toBe(100)
    expect(tree.rootDepth).toBe(100)
    expect(tree.shadowWisdom).toBe(100)
    expect(tree.qualityScore).toBe(100)
    expect(tree.condition).toBe('phantom-masterpiece')
    expect(tree.shimmering.aura).toBe('spectral-brilliance')
    expect(tree.warding.ghost).toBe('ghost-tamer')
    expect(tree.revealing.mist).toBe('revealing-mist')
    expect(tree.grounding.root).toBe('world-tree-roots')
    expect(tree.shadowing.shadow).toBe('shadow-sage')
  })

  it('computes qualityScore as weighted average', () => {
    const tree = analyzePhantomTree('export const x = 1', 'mid.ts')
    const expected = Math.round(
      tree.etherealQuality * 0.2 +
      tree.ghostHandling * 0.2 +
      tree.mistClarity * 0.2 +
      tree.rootDepth * 0.2 +
      tree.shadowWisdom * 0.2,
    )
    expect(tree.qualityScore).toBe(expected)
  })
})

// ─── analyzePhantomClearing ─────────────────────────────────────────

describe('analyzePhantomClearing', () => {
  it('returns empty clearing for empty trees', () => {
    const clearing = analyzePhantomClearing([], 'empty-dir')
    expect(clearing.directory).toBe('empty-dir')
    expect(clearing.trees).toHaveLength(0)
    expect(clearing.avgQuality).toBe(0)
    expect(clearing.clearingType).toBe('no-clearing')
    expect(clearing.condition).toBe('void')
  })

  it('analyzes clearing with rich trees', () => {
    const trees = [
      analyzePhantomTree(richContent, 'dir/a.ts'),
      analyzePhantomTree(richContent, 'dir/b.ts'),
    ]
    const clearing = analyzePhantomClearing(trees, 'dir')
    expect(clearing.avgQuality).toBe(100)
    expect(clearing.phantomMasterpieceCount).toBe(2)
    expect(clearing.voidCount).toBe(0)
    expect(clearing.clearingType).toBe('enchanted-grove')
  })

  it('analyzes clearing with mixed trees', () => {
    const trees = [
      analyzePhantomTree(richContent, 'dir/a.ts'),
      analyzePhantomTree(minimalContent, 'dir/b.ts'),
    ]
    const clearing = analyzePhantomClearing(trees, 'dir')
    expect(clearing.phantomMasterpieceCount).toBe(1)
    expect(clearing.voidCount).toBe(1)
  })
})

// ─── buildPhantomGroveResult ────────────────────────────────────────

describe('buildPhantomGroveResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPhantomGroveResult([], [])
    expect(result.trees).toHaveLength(0)
    expect(result.clearings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallEthereality).toBe(0)
    expect(result.stats.wardenGrade).toBe('lost-soul')
    expect(result.forest.isPhantom).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildPhantomGroveResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.trees).toHaveLength(2)
    expect(result.clearings).toHaveLength(1)
    expect(result.stats.avgEtherealQuality).toBe(100)
    expect(result.stats.avgGhostHandling).toBe(100)
    expect(result.stats.avgMistClarity).toBe(100)
    expect(result.stats.avgRootDepth).toBe(100)
    expect(result.stats.avgShadowWisdom).toBe(100)
    expect(result.stats.phantomMasterpieceCount).toBe(2)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighHandlingCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighDepthCount).toBe(2)
    expect(result.stats.hasHighWisdomCount).toBe(2)
    expect(result.stats.overallEthereality).toBe(100)
    expect(result.stats.wardenGrade).toBe('phantom-lord')
    expect(result.forest.isPhantom).toBe(true)
    expect(result.stats.bestTree).toBeTruthy()
    expect(result.stats.mostEthereal).toBeTruthy()
    expect(result.stats.bestWarded).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.deepest).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildPhantomGroveResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.clearings).toHaveLength(2)
    const dirs = result.clearings.map(c => c.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall ethereality correctly', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    expect(result.forest.overallEthereality).toBe(0)
  })

  it('sets isPhantom when overallEthereality >= 60', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [richContent])
    expect(result.forest.isPhantom).toBe(true)
  })

  it('sets isPhantom false when overallEthereality < 60', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    expect(result.forest.isPhantom).toBe(false)
  })

  it('picks best tree by qualityScore', async () => {
    const result = await buildPhantomGroveResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestTree).toBe('high.ts')
    expect(result.stats.mostEthereal).toBe('high.ts')
    expect(result.stats.bestWarded).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.wisest).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildPhantomGroveResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.phantomMasterpieceCount).toBe(1)
    expect(result.stats.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your phantom grove shimmers with ethereal perfection! Every tree glows with spectral brilliance',
    ])
  })

  it('recommends improving ethereal quality when low', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('ethereal'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving ghost handling when low', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('ghost'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving mist clarity when low', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('mist'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving root depth when low', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('root'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving shadow wisdom when low', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('shadow'))
    expect(rec).toBeTruthy()
  })

  it('warns about dead thickets', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Revive') || r.includes('thicket'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall ethereality', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('ethereality'))
    expect(rec).toBeTruthy()
  })

  it('lists specific dead thickets to revive', async () => {
    const result = await buildPhantomGroveResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Revive these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all clearings are dark-thicket/no-clearing', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('dark') || r.includes('empty') || r.includes('dead code'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns a string for phantom-masterpiece', () => {
    expect(typeof colorCondition('phantom-masterpiece')).toBe('string')
  })

  it('returns a string for void', () => {
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('returns a string for unknown condition', () => {
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('formatTreeTable', () => {
  it('formats a tree', () => {
    const tree = analyzePhantomTree(richContent, 'test.ts')
    const output = formatTreeTable(tree)
    expect(output).toContain('test.ts')
    expect(output).toContain('Ethereal Quality')
    expect(output).toContain('Ghost Handling')
    expect(output).toContain('Mist Clarity')
    expect(output).toContain('Root Depth')
    expect(output).toContain('Shadow Wisdom')
  })
})

describe('formatTreesTable', () => {
  it('handles empty trees', () => {
    const output = formatTreesTable([])
    expect(output).toContain('No phantom trees')
  })

  it('formats multiple trees', () => {
    const trees = [
      analyzePhantomTree(richContent, 'a.ts'),
      analyzePhantomTree(minimalContent, 'b.ts'),
    ]
    const output = formatTreesTable(trees)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatClearingTable', () => {
  it('formats a clearing', () => {
    const trees = [analyzePhantomTree(richContent, 'dir/a.ts')]
    const clearing = analyzePhantomClearing(trees, 'dir')
    const output = formatClearingTable(clearing)
    expect(output).toContain('dir')
    expect(output).toContain('Clearing')
  })
})

describe('formatClearingsTable', () => {
  it('handles empty clearings', () => {
    const output = formatClearingsTable([])
    expect(output).toContain('No phantom clearings')
  })

  it('formats multiple clearings', () => {
    const trees = [analyzePhantomTree(richContent, 'src/a.ts')]
    const clearings = [analyzePhantomClearing(trees, 'src')]
    const output = formatClearingsTable(clearings)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Phantom Grove Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Warden Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Phantom Grove Analysis')
    expect(output).toContain('Phantom Trees')
    expect(output).toContain('Phantom Clearings')
    expect(output).toContain('Forest Overview')
    expect(output).toContain('Phantom Grove Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.trees).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.forest.isPhantom).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const tree = analyzePhantomTree('   \n\t  ', 'blank.ts')
    expect(tree.etherealQuality).toBe(0)
    expect(tree.qualityScore).toBe(0)
    expect(tree.condition).toBe('void')
  })

  it('handles content with only comments', () => {
    const tree = analyzePhantomTree('// just a comment\n/* block */', 'comment.ts')
    expect(tree.etherealQuality).toBe(0)
    expect(tree.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildPhantomGroveResult(['big.ts'], [longContent])
    expect(result.trees).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildPhantomGroveResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.phantomMasterpieceCount).toBe(50)
  })

  it('handles single file clearing', async () => {
    const result = await buildPhantomGroveResult(['single.ts'], [richContent])
    expect(result.clearings).toHaveLength(1)
    expect(result.clearings[0]!.trees).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const tree = analyzePhantomTree(richContent, 'cap.ts')
    expect(tree.qualityScore).toBeLessThanOrEqual(100)
    expect(tree.etherealQuality).toBeLessThanOrEqual(100)
    expect(tree.ghostHandling).toBeLessThanOrEqual(100)
    expect(tree.mistClarity).toBeLessThanOrEqual(100)
    expect(tree.rootDepth).toBeLessThanOrEqual(100)
    expect(tree.shadowWisdom).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildPhantomGroveResult([], [])
    const r2 = await buildPhantomGroveResult(['a.ts'], [richContent])
    const r3 = await buildPhantomGroveResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
