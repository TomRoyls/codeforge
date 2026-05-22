import { describe, expect, it } from 'vitest'

import {
  analyzeTapestryPanel,
  analyzeTapestryThread,
  buildTapestryLoomResult,
  classifyCondition,
  classifyPanelCondition,
  classifyPanelType,
  classifyWeaverGrade,
  generateRecommendations,
  measureArtistry,
  measureColor,
  measureNarrative,
  measurePattern,
  measureThread,
  measureWeave,
} from '../src/commands/tapestry-loom-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const MINIMAL_CONTENT =
  'export function add(a: number, b: number): number { return a + b; }'

const RICH_CONTENT = `import { EventEmitter } from 'events';
import type { User } from './types.js';

interface UserServiceConfig {
  maxRetries: number;
  timeout: number;
}

/**
 * UserService handles all user-related operations
 * @deprecated Use AdminUserService instead
 */
export class UserService extends EventEmitter {
  private users: Map<string, User> = new Map();
  private config: UserServiceConfig;

  constructor(config: UserServiceConfig) {
    super();
    this.config = config;
  }

  async getUser(id: string): Promise<User | null> {
    try {
      if (!id) {
        throw new Error('ID is required');
      }
      const user = this.users.get(id);
      return user ?? null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    try {
      const id = Math.random().toString(36).substring(2);
      const user: User = { ...data, id };
      this.users.set(id, user);
      this.emit('user:created', user);
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }
}

// TODO: Add caching layer
// FIXME: Race condition in concurrent access
// HACK: Using any here temporarily
export async function processUsers(users: any[]): Promise<void> {
  for (const user of users) {
    if (user.active) {
      // @ts-ignore
      await processUser(user);
    }
  }
}

export type { UserServiceConfig };
export default UserService;`

// ─── measureThread ───────────────────────────────────────────────────────────

describe('measureThread', () => {
  it('returns straw for empty content', () => {
    const result = measureThread(EMPTY_CONTENT)
    expect(result.quality).toBe(5)
    expect(result.material).toBe('straw')
    expect(result.isStrong).toBe(false)
    expect(result.isConsistent).toBe(false)
    expect(result.hasNoKnots).toBe(true)
    expect(result.hasNoFraying).toBe(false)
    expect(result.hasProperTwist).toBe(false)
    expect(result.hasSmoothTexture).toBe(false)
    expect(result.hasNoSnags).toBe(true)
    expect(result.hasProperTension).toBe(false)
    expect(result.hasEvenDye).toBe(false)
    expect(result.hasColorfast).toBe(false)
    expect(result.knotCount).toBe(0)
    expect(result.snagCount).toBe(0)
  })

  it('returns linen for rich content', () => {
    const result = measureThread(RICH_CONTENT)
    expect(result.quality).toBe(15)
    expect(result.material).toBe('linen')
    expect(result.isConsistent).toBe(true)
    expect(result.hasNoKnots).toBe(false)
    expect(result.hasNoFraying).toBe(true)
    expect(result.hasProperTwist).toBe(true)
    expect(result.hasSmoothTexture).toBe(true)
    expect(result.knotCount).toBe(8)
  })
})

// ─── measureWeave ────────────────────────────────────────────────────────────

describe('measureWeave', () => {
  it('returns rag for empty content', () => {
    const result = measureWeave(EMPTY_CONTENT)
    expect(result.density).toBe(5)
    expect(result.technique).toBe('rag')
    expect(result.isTightWeave).toBe(false)
    expect(result.hasNoGaps).toBe(false)
    expect(result.hasNoLooseEnds).toBe(false)
    expect(result.gapCount).toBe(1)
    expect(result.looseEndCount).toBe(1)
  })

  it('returns tapestry for rich content', () => {
    const result = measureWeave(RICH_CONTENT)
    expect(result.density).toBe(74)
    expect(result.technique).toBe('tapestry')
    expect(result.isTightWeave).toBe(true)
    expect(result.hasProperTension).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.hasNoLooseEnds).toBe(true)
    expect(result.hasEvenBeat).toBe(true)
    expect(result.hasSelvedge).toBe(true)
    expect(result.hasProperShed).toBe(true)
    expect(result.hasHeddleControl).toBe(true)
    expect(result.hasPickCount).toBe(true)
    expect(result.gapCount).toBe(0)
    expect(result.looseEndCount).toBe(0)
  })
})

// ─── measurePattern ──────────────────────────────────────────────────────────

describe('measurePattern', () => {
  it('returns random for empty content', () => {
    const result = measurePattern(EMPTY_CONTENT)
    expect(result.richness).toBe(5)
    expect(result.type).toBe('random')
    expect(result.hasRepeatingMotifs).toBe(false)
    expect(result.motifCount).toBe(0)
    expect(result.designCount).toBe(0)
  })

  it('returns floral for rich content', () => {
    const result = measurePattern(RICH_CONTENT)
    expect(result.richness).toBe(53)
    expect(result.type).toBe('floral')
    expect(result.hasComplexDesigns).toBe(true)
    expect(result.hasBorderPatterns).toBe(true)
    expect(result.hasCentralMedallion).toBe(true)
    expect(result.hasConnectingThreads).toBe(true)
    expect(result.hasHierarchy).toBe(true)
    expect(result.motifCount).toBe(2)
    expect(result.designCount).toBe(2)
  })
})

// ─── measureColor ────────────────────────────────────────────────────────────

describe('measureColor', () => {
  it('returns bleached for empty content', () => {
    const result = measureColor(EMPTY_CONTENT)
    expect(result.palette).toBe(5)
    expect(result.richness).toBe('bleached')
    expect(result.hasVibrantColors).toBe(false)
    expect(result.hasNoColorBleeding).toBe(true)
    expect(result.colorBleedCount).toBe(0)
  })

  it('returns varied for rich content', () => {
    const result = measureColor(RICH_CONTENT)
    expect(result.palette).toBe(51)
    expect(result.richness).toBe('varied')
    expect(result.hasVibrantColors).toBe(true)
    expect(result.hasSubtleShading).toBe(true)
    expect(result.hasContrast).toBe(true)
    expect(result.hasGradient).toBe(true)
    expect(result.hasPrimaryColors).toBe(true)
    expect(result.hasAccentColors).toBe(true)
    expect(result.hasWarmTones).toBe(true)
    expect(result.hasCoolTones).toBe(true)
    expect(result.hasMetallic).toBe(true)
    expect(result.hasNoColorBleeding).toBe(false)
    expect(result.colorBleedCount).toBe(8)
  })
})

// ─── measureNarrative ────────────────────────────────────────────────────────

describe('measureNarrative', () => {
  it('returns incoherent for empty content', () => {
    const result = measureNarrative(EMPTY_CONTENT)
    expect(result.coherence).toBe(5)
    expect(result.structure).toBe('incoherent')
    expect(result.hasClearBeginning).toBe(false)
    expect(result.hasMiddle).toBe(false)
    expect(result.hasSatisfyingEnd).toBe(false)
    expect(result.hasNarrativeArc).toBe(false)
    expect(result.hasNoPlotHoles).toBe(false)
    expect(result.hasDeusExMachina).toBe(false)
    expect(result.plotHoleCount).toBe(0)
  })

  it('returns episodic for rich content', () => {
    const result = measureNarrative(RICH_CONTENT)
    expect(result.coherence).toBe(44)
    expect(result.structure).toBe('episodic')
    expect(result.hasClearBeginning).toBe(true)
    expect(result.hasMiddle).toBe(true)
    expect(result.hasSatisfyingEnd).toBe(true)
    expect(result.hasRisingAction).toBe(true)
    expect(result.hasClimax).toBe(true)
    expect(result.hasFallingAction).toBe(true)
    expect(result.hasForeshadowing).toBe(true)
    expect(result.hasNarrativeArc).toBe(true)
    expect(result.hasNoPlotHoles).toBe(true)
    expect(result.hasDeusExMachina).toBe(true)
  })
})

// ─── measureArtistry ─────────────────────────────────────────────────────────

describe('measureArtistry', () => {
  it('returns naive for empty content', () => {
    const result = measureArtistry(EMPTY_CONTENT)
    expect(result.value).toBe(5)
    expect(result.style).toBe('naive')
    expect(result.isMasterwork).toBe(false)
    expect(result.hasAestheticValue).toBe(false)
    expect(result.hasTechnicalPrecision).toBe(false)
    expect(result.hasRestoration).toBe(false)
    expect(result.hasConservation).toBe(false)
    expect(result.restorationCount).toBe(0)
  })

  it('returns baroque for rich content', () => {
    const result = measureArtistry(RICH_CONTENT)
    expect(result.value).toBe(25)
    expect(result.style).toBe('baroque')
    expect(result.isMasterwork).toBe(false)
    expect(result.hasAestheticValue).toBe(true)
    expect(result.hasTechnicalPrecision).toBe(true)
    expect(result.hasCreativeExpression).toBe(true)
    expect(result.hasHistoricalSignificance).toBe(true)
    expect(result.hasCulturalContext).toBe(true)
    expect(result.hasProvenance).toBe(true)
    expect(result.hasSignature).toBe(true)
    expect(result.hasRestoration).toBe(true)
    expect(result.hasConservation).toBe(false)
    expect(result.restorationCount).toBe(4)
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies gobelins-masterpiece for >= 80', () => {
    expect(classifyCondition(90)).toBe('gobelins-masterpiece')
  })
  it('classifies fine-tapestry for >= 65', () => {
    expect(classifyCondition(75)).toBe('fine-tapestry')
  })
  it('classifies quality-weave for >= 50', () => {
    expect(classifyCondition(55)).toBe('quality-weave')
  })
  it('classifies standard-cloth for >= 35', () => {
    expect(classifyCondition(40)).toBe('standard-cloth')
  })
  it('classifies rag-rug for >= 20', () => {
    expect(classifyCondition(25)).toBe('rag-rug')
  })
  it('classifies tangled-yarn for < 20', () => {
    expect(classifyCondition(10)).toBe('tangled-yarn')
  })
})

// ─── classifyPanelType ───────────────────────────────────────────────────────

describe('classifyPanelType', () => {
  it('returns floor-rag for empty array', () => {
    expect(classifyPanelType([])).toBe('floor-rag')
  })
  it('returns floor-rag for low-quality single thread', () => {
    const thread = analyzeTapestryThread(EMPTY_CONTENT, 'empty.ts')
    expect(classifyPanelType([thread])).toBe('floor-rag')
  })
  it('returns table-runner for single rich thread', () => {
    const thread = analyzeTapestryThread(RICH_CONTENT, 'src/service.ts')
    expect(classifyPanelType([thread])).toBe('table-runner')
  })
})

// ─── classifyPanelCondition ──────────────────────────────────────────────────

describe('classifyPanelCondition', () => {
  it('classifies museum-exhibit for >= 80', () => {
    expect(classifyPanelCondition(85)).toBe('museum-exhibit')
  })
  it('classifies gallery-piece for >= 65', () => {
    expect(classifyPanelCondition(70)).toBe('gallery-piece')
  })
  it('classifies home-decor for >= 50', () => {
    expect(classifyPanelCondition(55)).toBe('home-decor')
  })
  it('classifies craft-fair for >= 35', () => {
    expect(classifyPanelCondition(40)).toBe('craft-fair')
  })
  it('classifies thrift-store for >= 20', () => {
    expect(classifyPanelCondition(25)).toBe('thrift-store')
  })
  it('classifies rag-bag for < 20', () => {
    expect(classifyPanelCondition(10)).toBe('rag-bag')
  })
})

// ─── classifyWeaverGrade ─────────────────────────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('classifies master-weaver for >= 80', () => {
    expect(classifyWeaverGrade(85)).toBe('master-weaver')
  })
  it('classifies journeyman-weaver for >= 65', () => {
    expect(classifyWeaverGrade(70)).toBe('journeyman-weaver')
  })
  it('classifies apprentice for >= 50', () => {
    expect(classifyWeaverGrade(55)).toBe('apprentice')
  })
  it('classifies novice for >= 35', () => {
    expect(classifyWeaverGrade(40)).toBe('novice')
  })
  it('classifies hobbyist for >= 20', () => {
    expect(classifyWeaverGrade(25)).toBe('hobbyist')
  })
  it('classifies cat for < 20', () => {
    expect(classifyWeaverGrade(10)).toBe('cat')
  })
})

// ─── analyzeTapestryThread ───────────────────────────────────────────────────

describe('analyzeTapestryThread', () => {
  it('produces tangled-yarn for empty content', () => {
    const result = analyzeTapestryThread(EMPTY_CONTENT, 'empty.ts')
    expect(result.threadQuality).toBe(5)
    expect(result.weaveDensity).toBe(5)
    expect(result.patternRichness).toBe(5)
    expect(result.colorPalette).toBe(5)
    expect(result.narrativeCoherence).toBe(5)
    expect(result.artisticValue).toBe(5)
    expect(result.qualityScore).toBe(5)
    expect(result.condition).toBe('tangled-yarn')
    expect(result.file).toBe('empty.ts')
  })

  it('produces standard-cloth for rich content', () => {
    const result = analyzeTapestryThread(RICH_CONTENT, 'src/service.ts')
    expect(result.threadQuality).toBe(15)
    expect(result.weaveDensity).toBe(74)
    expect(result.patternRichness).toBe(53)
    expect(result.colorPalette).toBe(51)
    expect(result.narrativeCoherence).toBe(44)
    expect(result.artisticValue).toBe(25)
    expect(result.qualityScore).toBe(44)
    expect(result.condition).toBe('standard-cloth')
  })
})

// ─── analyzeTapestryPanel ────────────────────────────────────────────────────

describe('analyzeTapestryPanel', () => {
  it('returns floor-rag rag-bag for empty threads', () => {
    const panel = analyzeTapestryPanel([], '.')
    expect(panel.directory).toBe('.')
    expect(panel.threads).toHaveLength(0)
    expect(panel.avgQuality).toBe(0)
    expect(panel.avgDensity).toBe(0)
    expect(panel.avgNarrative).toBe(0)
    expect(panel.panelType).toBe('floor-rag')
    expect(panel.condition).toBe('rag-bag')
  })
})

// ─── buildTapestryLoomResult ─────────────────────────────────────────────────

describe('buildTapestryLoomResult', () => {
  it('handles single empty file', () => {
    const result = buildTapestryLoomResult(['empty.ts'], [EMPTY_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalPanels).toBe(1)
    expect(result.stats.tangledYarnCount).toBe(1)
    expect(result.stats.hasNoKnotsCount).toBe(1)
    expect(result.stats.hasNoColorBleedingCount).toBe(1)
    expect(result.stats.overallCraftsmanship).toBe(5)
    expect(result.stats.weaverGrade).toBe('cat')
    expect(result.stats.bestThread).toBe('empty.ts')
    expect(result.gallery.isMasterwork).toBe(false)
    expect(result.gallery.overallCraftsmanship).toBe(5)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles mixed files', () => {
    const result = buildTapestryLoomResult(
      ['empty.ts', 'minimal.ts', 'src/service.ts'],
      [EMPTY_CONTENT, MINIMAL_CONTENT, RICH_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalPanels).toBe(2)
    expect(result.stats.avgThreadQuality).toBe(11)
    expect(result.stats.avgWeaveDensity).toBe(31)
    expect(result.stats.avgPatternRichness).toBe(21)
    expect(result.stats.avgColorPalette).toBe(20)
    expect(result.stats.avgNarrativeCoherence).toBe(21)
    expect(result.stats.avgArtisticValue).toBe(12)
    expect(result.stats.standardClothCount).toBe(1)
    expect(result.stats.tangledYarnCount).toBe(2)
    expect(result.stats.isTightWeaveCount).toBe(1)
    expect(result.stats.hasNoGapsCount).toBe(2)
    expect(result.stats.hasVibrantColorsCount).toBe(1)
    expect(result.stats.hasNarrativeArcCount).toBe(1)
    expect(result.stats.hasNoPlotHolesCount).toBe(2)
    expect(result.stats.overallCraftsmanship).toBe(19)
    expect(result.stats.weaverGrade).toBe('cat')
    expect(result.stats.bestThread).toBe('src/service.ts')
    expect(result.stats.finestWeave).toBe('src/service.ts')
    expect(result.stats.richestPattern).toBe('src/service.ts')
    expect(result.stats.bestNarrative).toBe('src/service.ts')
    expect(result.stats.mostArtistic).toBe('src/service.ts')
    expect(result.panels).toHaveLength(2)
  })

  it('handles empty file list', () => {
    const result = buildTapestryLoomResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalPanels).toBe(0)
    expect(result.stats.overallCraftsmanship).toBe(0)
    expect(result.gallery.isMasterwork).toBe(false)
  })
})

// ─── boundary tests ──────────────────────────────────────────────────────────

describe('classifyCondition boundary', () => {
  it('80 is gobelins-masterpiece', () => { expect(classifyCondition(80)).toBe('gobelins-masterpiece') })
  it('79 is fine-tapestry', () => { expect(classifyCondition(79)).toBe('fine-tapestry') })
  it('65 is fine-tapestry', () => { expect(classifyCondition(65)).toBe('fine-tapestry') })
  it('64 is quality-weave', () => { expect(classifyCondition(64)).toBe('quality-weave') })
  it('50 is quality-weave', () => { expect(classifyCondition(50)).toBe('quality-weave') })
  it('49 is standard-cloth', () => { expect(classifyCondition(49)).toBe('standard-cloth') })
  it('35 is standard-cloth', () => { expect(classifyCondition(35)).toBe('standard-cloth') })
  it('34 is rag-rug', () => { expect(classifyCondition(34)).toBe('rag-rug') })
  it('20 is rag-rug', () => { expect(classifyCondition(20)).toBe('rag-rug') })
  it('19 is tangled-yarn', () => { expect(classifyCondition(19)).toBe('tangled-yarn') })
  it('0 is tangled-yarn', () => { expect(classifyCondition(0)).toBe('tangled-yarn') })
})

// ─── classifyWeaverGrade boundary ────────────────────────────────────────────

describe('classifyWeaverGrade boundary', () => {
  it('80 is master-weaver', () => { expect(classifyWeaverGrade(80)).toBe('master-weaver') })
  it('79 is journeyman-weaver', () => { expect(classifyWeaverGrade(79)).toBe('journeyman-weaver') })
  it('65 is journeyman-weaver', () => { expect(classifyWeaverGrade(65)).toBe('journeyman-weaver') })
  it('64 is apprentice', () => { expect(classifyWeaverGrade(64)).toBe('apprentice') })
  it('50 is apprentice', () => { expect(classifyWeaverGrade(50)).toBe('apprentice') })
  it('49 is novice', () => { expect(classifyWeaverGrade(49)).toBe('novice') })
  it('35 is novice', () => { expect(classifyWeaverGrade(35)).toBe('novice') })
  it('34 is hobbyist', () => { expect(classifyWeaverGrade(34)).toBe('hobbyist') })
  it('20 is hobbyist', () => { expect(classifyWeaverGrade(20)).toBe('hobbyist') })
  it('19 is cat', () => { expect(classifyWeaverGrade(19)).toBe('cat') })
  it('0 is cat', () => { expect(classifyWeaverGrade(0)).toBe('cat') })
})

// ─── analyzeTapestryThread consistency ────────────────────────────────────────

describe('analyzeTapestryThread consistency', () => {
  it('qualityScore equals average of six measures', () => {
    const result = analyzeTapestryThread(RICH_CONTENT, 'test.ts')
    const avg = Math.round((result.threadQuality + result.weaveDensity + result.patternRichness + result.colorPalette + result.narrativeCoherence + result.artisticValue) / 6)
    expect(result.qualityScore).toBe(avg)
  })

  it('produces consistent results for same input', () => {
    const a = analyzeTapestryThread(MINIMAL_CONTENT, 'test.ts')
    const b = analyzeTapestryThread(MINIMAL_CONTENT, 'test.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── format helpers export check ─────────────────────────────────────────────

describe('format helpers', () => {
  it('formatTapestryLoomJson produces valid JSON', async () => {
    const { formatTapestryLoomJson } = await import(
      '../src/commands/tapestry-loom-format-helpers.js'
    )
    const result = buildTapestryLoomResult(['test.ts'], [MINIMAL_CONTENT])
    const json = formatTapestryLoomJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('gallery')
    expect(parsed).toHaveProperty('threads')
  })

  it('formatTapestryLoomTable produces string output', async () => {
    const { formatTapestryLoomTable } = await import(
      '../src/commands/tapestry-loom-format-helpers.js'
    )
    const result = buildTapestryLoomResult(['test.ts'], [MINIMAL_CONTENT])
    const table = formatTapestryLoomTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })
})
