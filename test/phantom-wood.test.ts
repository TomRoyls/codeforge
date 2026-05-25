import { describe, it, expect } from 'vitest'

import {
  measureDrifting,
  measureHaunting,
  measureClearing,
  measureRooting,
  measureLurking,
  analyzePhantomTree,
  analyzePhantomGrove,
  buildPhantomWoodResult,
  classifyCondition,
  classifyGroveType,
  classifyGroveCondition,
  classifyRangerGrade,
  generateRecommendations,
  type PhantomTree,
} from '../src/commands/phantom-wood-helpers.js'

import {
  colorScore,
  colorCondition,
  colorGroveCondition,
  formatTreeTable,
  formatTreesTable,
  formatGroveTable,
  formatGrovesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-wood-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measureDrifting ────────────────────────────────────

describe('measureDrifting', () => {
  it('returns all fields', () => {
    const result = measureDrifting(richContent)
    expect(result).toHaveProperty('quality')
    expect(result).toHaveProperty('ethereal')
    expect(result).toHaveProperty('hasHighQuality')
    expect(result).toHaveProperty('hasLightweight')
    expect(result).toHaveProperty('hasNoHeavy')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasNoClunky')
    expect(result).toHaveProperty('hasEfficient')
    expect(result).toHaveProperty('hasNoWasteful')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasClean')
    expect(result).toHaveProperty('hasFlowing')
    expect(result).toHaveProperty('hasSmooth')
    expect(result).toHaveProperty('hasFluid')
    expect(result).toHaveProperty('hasMinimal')
    expect(result).toHaveProperty('hasPrecise')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasWeightless')
    expect(result).toHaveProperty('heavyCount')
    expect(result).toHaveProperty('wastefulCount')
  })

  it('detects heavy patterns (var)', () => {
    const result = measureDrifting('var x = 1; var y = 2')
    expect(result.heavyCount).toBe(2)
    expect(result.hasNoHeavy).toBe(false)
  })

  it('detects lightweight code (no any)', () => {
    const result = measureDrifting(richContent)
    expect(result.hasLightweight).toBe(true)
  })

  it('detects graceful code', () => {
    const result = measureDrifting(richContent)
    expect(result.hasGraceful).toBe(true)
  })

  it('detects clunky patterns (eval)', () => {
    const result = measureDrifting('eval("code")')
    expect(result.hasNoClunky).toBe(false)
  })

  it('detects wasteful patterns', () => {
    const result = measureDrifting('hack: workaround for bypass')
    expect(result.wastefulCount).toBeGreaterThan(0)
    expect(result.hasNoWasteful).toBe(false)
  })

  it('detects elegant code (class, interface)', () => {
    const result = measureDrifting(richContent)
    expect(result.hasElegant).toBe(true)
  })

  it('detects refined code (documentation)', () => {
    const result = measureDrifting(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('classifies ethereal correctly', () => {
    const result = measureDrifting(richContent)
    expect(result.ethereal).toBeDefined()
  })
})

// ─── measureHaunting ────────────────────────────────────

describe('measureHaunting', () => {
  it('returns all fields', () => {
    const result = measureHaunting(richContent)
    expect(result).toHaveProperty('handling')
    expect(result).toHaveProperty('ghost')
    expect(result).toHaveProperty('hasHighHandling')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasEdgeHandled')
    expect(result).toHaveProperty('hasNoIgnored')
    expect(result).toHaveProperty('hasNullSafe')
    expect(result).toHaveProperty('hasTypeSafe')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasForgiving')
    expect(result).toHaveProperty('hasResilient')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasRecoverable')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasSafe')
    expect(result).toHaveProperty('hasProtected')
    expect(result).toHaveProperty('hasShielded')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('ignoredCount')
  })

  it('detects error handling', () => {
    const result = measureHaunting(richContent)
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measureHaunting('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects ignored patterns (eval)', () => {
    const result = measureHaunting('eval("code")')
    expect(result.ignoredCount).toBe(1)
    expect(result.hasNoIgnored).toBe(false)
  })

  it('detects null-safe code', () => {
    const result = measureHaunting(richContent)
    expect(result.hasNullSafe).toBe(true)
  })

  it('detects defensive code', () => {
    const result = measureHaunting(richContent)
    expect(result.hasDefensive).toBe(true)
  })

  it('detects forgiving code (try, catch)', () => {
    const result = measureHaunting(richContent)
    expect(result.hasForgiving).toBe(true)
  })

  it('detects protected code (no vulnerable)', () => {
    const result = measureHaunting('vulnerable code with exploit')
    expect(result.hasProtected).toBe(false)
  })

  it('classifies ghost correctly', () => {
    const result = measureHaunting(richContent)
    expect(result.ghost).toBeDefined()
  })
})

// ─── measureClearing ────────────────────────────────────

describe('measureClearing', () => {
  it('returns all fields', () => {
    const result = measureClearing(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('mist')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasOpen')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasUnobscured')
    expect(result).toHaveProperty('hasLucid')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    const result = measureClearing(richContent)
    expect(result.hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureClearing('const a = 1; const b = 2')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    const result = measureClearing('const magic = 42')
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects clear type annotations', () => {
    const result = measureClearing(richContent)
    expect(result.hasClear).toBe(true)
  })

  it('detects revealed code (documentation)', () => {
    const result = measureClearing(richContent)
    expect(result.hasRevealed).toBe(true)
  })

  it('detects obscured patterns', () => {
    const result = measureClearing('obfuscated minified code')
    expect(result.hasOpen).toBe(false)
  })

  it('sets obfuscatedCount equal to crypticCount', () => {
    const result = measureClearing('const a = 1')
    expect(result.obfuscatedCount).toBe(result.crypticCount)
  })

  it('classifies mist correctly', () => {
    const result = measureClearing(richContent)
    expect(result.mist).toBeDefined()
  })
})

// ─── measureRooting ─────────────────────────────────────

describe('measureRooting', () => {
  it('returns all fields', () => {
    const result = measureRooting(richContent)
    expect(result).toHaveProperty('depth')
    expect(result).toHaveProperty('root')
    expect(result).toHaveProperty('hasHighDepth')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasConnected')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasTyped')
    expect(result).toHaveProperty('hasInterfaced')
    expect(result).toHaveProperty('hasAbstracted')
    expect(result).toHaveProperty('hasGrounded')
    expect(result).toHaveProperty('hasFoundational')
    expect(result).toHaveProperty('hasNetworked')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasSolid')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects well-structured code', () => {
    const result = measureRooting(richContent)
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureRooting('var x = 1; eval("y")')
    expect(result.chaoticCount).toBe(2)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects documented code', () => {
    const result = measureRooting(richContent)
    expect(result.hasDocumented).toBe(true)
  })

  it('detects interfaced code', () => {
    const result = measureRooting(richContent)
    expect(result.hasInterfaced).toBe(true)
  })

  it('detects networked code (async)', () => {
    const result = measureRooting(richContent)
    expect(result.hasNetworked).toBe(true)
  })

  it('detects untested patterns (eval)', () => {
    const result = measureRooting('eval("code")')
    expect(result.untestedCount).toBe(1)
    expect(result.hasNoUntested).toBe(false)
  })

  it('classifies root correctly', () => {
    const result = measureRooting(richContent)
    expect(result.root).toBeDefined()
  })
})

// ─── measureLurking ─────────────────────────────────────

describe('measureLurking', () => {
  it('returns all fields', () => {
    const result = measureLurking(richContent)
    expect(result).toHaveProperty('wisdom')
    expect(result).toHaveProperty('shadow')
    expect(result).toHaveProperty('hasHighWisdom')
    expect(result).toHaveProperty('hasWellArchitected')
    expect(result).toHaveProperty('hasNoHacked')
    expect(result).toHaveProperty('hasPrincipled')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('hasProven')
    expect(result).toHaveProperty('hasMature')
    expect(result).toHaveProperty('hasStrategic')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasExperienced')
    expect(result).toHaveProperty('hasAdaptive')
    expect(result).toHaveProperty('hasEvolved')
    expect(result).toHaveProperty('hasResilient')
    expect(result).toHaveProperty('hasAware')
    expect(result).toHaveProperty('hasKnowledgable')
    expect(result).toHaveProperty('hasAccumulated')
    expect(result).toHaveProperty('hackedCount')
    expect(result).toHaveProperty('naiveCount')
  })

  it('detects well-architected code', () => {
    const result = measureLurking(richContent)
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects hacked patterns', () => {
    const result = measureLurking('hack: workaround using monkey patch')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects insightful code (documentation)', () => {
    const result = measureLurking(richContent)
    expect(result.hasInsightful).toBe(true)
  })

  it('detects naive patterns', () => {
    const result = measureLurking('naive simple-minded unsophisticated')
    expect(result.naiveCount).toBeGreaterThan(0)
  })

  it('classifies shadow correctly', () => {
    const result = measureLurking(richContent)
    expect(result.shadow).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns phantom-masterpiece for 90+', () => {
    expect(classifyCondition(90)).toBe('phantom-masterpiece')
    expect(classifyCondition(100)).toBe('phantom-masterpiece')
  })
  it('returns spectral-grove for 75-89', () => {
    expect(classifyCondition(75)).toBe('spectral-grove')
  })
  it('returns proper-spirit for 60-74', () => {
    expect(classifyCondition(60)).toBe('proper-spirit')
  })
  it('returns dense-matter for 40-59', () => {
    expect(classifyCondition(40)).toBe('dense-matter')
  })
  it('returns lead-weight for 20-39', () => {
    expect(classifyCondition(20)).toBe('lead-weight')
  })
  it('returns void for 0-19', () => {
    expect(classifyCondition(0)).toBe('void')
  })
})

describe('classifyGroveType', () => {
  it('returns no-grove for empty', () => {
    expect(classifyGroveType([])).toBe('no-grove')
  })
  it('returns ancient-forest for high avg', () => {
    const trees = [{ qualityScore: 90 }, { qualityScore: 90 }].map((t) => ({ ...t } as PhantomTree))
    expect(classifyGroveType(trees)).toBe('ancient-forest')
  })
  it('returns barren-clearing for low avg', () => {
    const trees = [{ qualityScore: 10 }].map((t) => ({ ...t } as PhantomTree))
    expect(classifyGroveType(trees)).toBe('barren-clearing')
  })
})

describe('classifyGroveCondition', () => {
  it('returns primeval-woodland for 85+', () => {
    expect(classifyGroveCondition(85)).toBe('primeval-woodland')
  })
  it('returns void for 0-14', () => {
    expect(classifyGroveCondition(0)).toBe('void')
  })
})

describe('classifyRangerGrade', () => {
  it('returns forest-ancient for 80+', () => {
    expect(classifyRangerGrade(80)).toBe('forest-ancient')
  })
  it('returns lost-wanderer for 0-19', () => {
    expect(classifyRangerGrade(0)).toBe('lost-wanderer')
  })
  it('returns shadow-ranger for 65-79', () => {
    expect(classifyRangerGrade(65)).toBe('shadow-ranger')
  })
  it('returns woodland-guide for 50-64', () => {
    expect(classifyRangerGrade(50)).toBe('woodland-guide')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyRangerGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyRangerGrade(20)).toBe('novice')
  })
})

// ─── analyzePhantomTree ─────────────────────────────────

describe('analyzePhantomTree', () => {
  it('returns a complete tree', () => {
    const tree = analyzePhantomTree(richContent, 'app.ts')
    expect(tree.file).toBe('app.ts')
    expect(tree.etherealQuality).toBeGreaterThanOrEqual(0)
    expect(tree.ghostHandling).toBeGreaterThanOrEqual(0)
    expect(tree.mistClarity).toBeGreaterThanOrEqual(0)
    expect(tree.rootDepth).toBeGreaterThanOrEqual(0)
    expect(tree.shadowWisdom).toBeGreaterThanOrEqual(0)
    expect(tree.qualityScore).toBeGreaterThanOrEqual(0)
    expect(tree.condition).toBeDefined()
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const tree = analyzePhantomTree(richContent, 'test.ts')
    const expected = Math.round(
      tree.etherealQuality * 0.2 +
      tree.ghostHandling * 0.2 +
      tree.mistClarity * 0.2 +
      tree.rootDepth * 0.2 +
      tree.shadowWisdom * 0.2,
    )
    expect(tree.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    const tree = analyzePhantomTree(emptyContent, 'empty.ts')
    expect(tree.qualityScore).toBeLessThan(40)
  })
})

// ─── analyzePhantomGrove ────────────────────────────────

describe('analyzePhantomGrove', () => {
  it('returns empty grove for no trees', () => {
    const grove = analyzePhantomGrove([], 'src')
    expect(grove.directory).toBe('src')
    expect(grove.trees).toHaveLength(0)
    expect(grove.avgEthereal).toBe(0)
    expect(grove.groveType).toBe('no-grove')
    expect(grove.condition).toBe('void')
  })

  it('computes averages from trees', () => {
    const tree = analyzePhantomTree(richContent, 'app.ts')
    const grove = analyzePhantomGrove([tree], 'src')
    expect(grove.avgEthereal).toBe(tree.etherealQuality)
    expect(grove.avgRootDepth).toBe(tree.rootDepth)
    expect(grove.avgWisdom).toBe(tree.shadowWisdom)
  })
})

// ─── buildPhantomWoodResult ─────────────────────────────

describe('buildPhantomWoodResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPhantomWoodResult([], [])
    expect(result.trees).toHaveLength(0)
    expect(result.groves).toHaveLength(0)
    expect(result.woodland.isPhantom).toBe(false)
    expect(result.stats.rangerGrade).toBe('lost-wanderer')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildPhantomWoodResult(['app.ts'], [richContent])
    expect(result.trees).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into groves by directory', async () => {
    const result = await buildPhantomWoodResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.groves).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    expect(result.stats.avgEtherealQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgGhostHandling).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMistClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgRootDepth).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgShadowWisdom).toBeGreaterThanOrEqual(0)
    expect(result.stats.phantomMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.spectralGroveCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properSpiritCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.denseMatterCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.leadWeightCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestTree).toBe('string')
    expect(typeof result.stats.mostEthereal).toBe('string')
    expect(typeof result.stats.bestHandled).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.deepest).toBe('string')
    expect(typeof result.stats.wisest).toBe('string')
  })

  it('sets bestTree to highest qualityScore file', async () => {
    const result = await buildPhantomWoodResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestTree).toBe('rich.ts')
  })

  it('sets mostEthereal to highest etherealQuality file', async () => {
    const result = await buildPhantomWoodResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.mostEthereal).toBe('rich.ts')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const tree = result.trees[0]
    expect(tree.etherealQuality).toBe(100)
    expect(tree.ghostHandling).toBe(100)
    expect(tree.mistClarity).toBe(100)
    expect(tree.rootDepth).toBe(100)
    expect(tree.shadowWisdom).toBe(100)
    expect(tree.qualityScore).toBe(100)
  })

  it('sets woodland.isPhantom when luminosity >= 60', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    expect(result.woodland.isPhantom).toBe(true)
  })

  it('files in root map to . grove', async () => {
    const result = await buildPhantomWoodResult(['app.ts'], [richContent])
    expect(result.groves[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all >= 90', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends lightening when ethereal is low', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Lighten'))
    expect(hasRec).toBe(true)
  })

  it('returns default when scores are good', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('phantom-masterpiece')).toBe('string')
    expect(typeof colorCondition('spectral-grove')).toBe('string')
    expect(typeof colorCondition('proper-spirit')).toBe('string')
    expect(typeof colorCondition('dense-matter')).toBe('string')
    expect(typeof colorCondition('lead-weight')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorGroveCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorGroveCondition('primeval-woodland')).toBe('string')
    expect(typeof colorGroveCondition('enchanted-forest')).toBe('string')
    expect(typeof colorGroveCondition('proper-grove')).toBe('string')
    expect(typeof colorGroveCondition('thin-copse')).toBe('string')
    expect(typeof colorGroveCondition('empty-clearing')).toBe('string')
    expect(typeof colorGroveCondition('void')).toBe('string')
    expect(typeof colorGroveCondition('unknown')).toBe('string')
  })
})

describe('formatTreeTable', () => {
  it('formats a tree', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const output = formatTreeTable(result.trees[0])
    expect(output).toContain('Phantom Tree')
    expect(output).toContain('a.ts')
    expect(output).toContain('Ethereal Quality')
  })
})

describe('formatTreesTable', () => {
  it('returns no trees message for empty', () => {
    expect(formatTreesTable([])).toContain('No phantom trees')
  })
  it('formats trees', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    expect(formatTreesTable(result.trees)).toContain('Phantom Trees')
  })
})

describe('formatGroveTable', () => {
  it('formats a grove', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const output = formatGroveTable(result.groves[0])
    expect(output).toContain('Phantom Grove')
    expect(output).toContain('Trees')
  })
})

describe('formatGrovesTable', () => {
  it('returns no groves message for empty', () => {
    expect(formatGrovesTable([])).toContain('No phantom groves')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Phantom Wood Statistics')
    expect(output).toContain('Ranger Grade')
    expect(output).toContain('Best Tree')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['A', 'B'])).toContain('Recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Phantom Wood Analysis')
    expect(output).toContain('Woodland Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildPhantomWoodResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.trees).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
