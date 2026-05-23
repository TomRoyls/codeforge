import { describe, it, expect } from 'vitest'

import {
  measurePetal,
  measureRoot,
  measureMud,
  measureGeometry,
  measureFragrance,
  measureVitality,
  analyzeLotusPetal,
  classifyCondition,
  classifyPondType,
  analyzeLotusPond,
  classifyGardenerGrade,
  generateRecommendations,
  buildLotusBloomResult,
} from '../src/commands/lotus-bloom-helpers.js'

import {
  scoreColor,
  petalRadianceColor,
  rootStrengthColor,
  mudPurityColor,
  geometryPatternColor,
  fragranceAromaColor,
  vitalityHealthColor,
  conditionColor,
  gardenerGradeColor,
  pondTypeColor,
  pondConditionColor,
  formatLotusBloomJson,
  formatLotusBloomTable,
} from '../src/commands/lotus-bloom-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface UserService {
  userId: string
  name: string
  email: string
}

export type UserRole = 'admin' | 'user' | 'guest'

/**
 * User service implementation
 */
export class UserServiceImpl implements UserService {
  private users: Map<string, UserRole>

  constructor() {
    this.users = new Map()
  }

  async getUser(id: string): Promise<UserRole | undefined> {
    try {
      const result = await this.users.get(id)
      return result
    } catch (error) {
      throw new Error('User not found')
    }
  }
}

export function validateUser(user: UserService): boolean {
  return user.userId.length > 0
}
`

const MEDIUM = `export interface Config {
  host: string
  port: number
}

export class Server {
  constructor(private config: Config) {}

  start(): void {
    console.log('Starting server')
  }
}
`

const EMPTY = ''

// ─── measurePetal ──────────────────────────────────────────────────────────

describe('measurePetal', () => {
  it('returns thousand-petal for RICH content', () => {
    const result = measurePetal(RICH)
    expect(result.beauty).toBe(90)
    expect(result.radiance).toBe('thousand-petal')
    expect(result.hasHighBeauty).toBe(true)
    expect(result.hasElegantForm).toBe(true)
    expect(result.hasNoBlemish).toBe(true)
    expect(result.hasGraceful).toBe(true)
    expect(result.hasNoAwkwardness).toBe(true)
    expect(result.hasRefined).toBe(true)
    expect(result.hasNoRoughness).toBe(true)
    expect(result.hasHarmonious).toBe(true)
    expect(result.hasNoDissonance).toBe(true)
    expect(result.blemishCount).toBe(0)
    expect(result.roughnessCount).toBe(0)
  })

  it('returns wilted for MEDIUM content', () => {
    const result = measurePetal(MEDIUM)
    expect(result.beauty).toBe(47)
    expect(result.radiance).toBe('wilted')
    expect(result.hasHighBeauty).toBe(false)
  })

  it('returns wilted for EMPTY content', () => {
    const result = measurePetal(EMPTY)
    expect(result.beauty).toBe(42)
    expect(result.radiance).toBe('wilted')
  })

  it('detects blemishes from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measurePetal(code)
    expect(result.blemishCount).toBeGreaterThan(0)
    expect(result.hasNoBlemish).toBe(false)
  })

  it('detects roughness from HACK/FIXME', () => {
    const code = '// HACK fix later // FIXME broken'
    const result = measurePetal(code)
    expect(result.roughnessCount).toBeGreaterThan(0)
    expect(result.hasNoRoughness).toBe(false)
  })
})

// ─── measureRoot ───────────────────────────────────────────────────────────

describe('measureRoot', () => {
  it('returns deep-taproot for RICH content', () => {
    const result = measureRoot(RICH)
    expect(result.depth).toBe(80)
    expect(result.strength).toBe('deep-taproot')
    expect(result.hasHighDepth).toBe(true)
    expect(result.hasSolidAnchoring).toBe(true)
    expect(result.hasNoRot).toBe(true)
    expect(result.hasResilient).toBe(true)
    expect(result.hasNoErosion).toBe(true)
  })

  it('returns floating for MEDIUM content', () => {
    const result = measureRoot(MEDIUM)
    expect(result.depth).toBe(47)
    expect(result.strength).toBe('floating')
    expect(result.hasHighDepth).toBe(false)
  })

  it('returns floating for EMPTY content', () => {
    const result = measureRoot(EMPTY)
    expect(result.depth).toBe(42)
    expect(result.strength).toBe('floating')
  })

  it('detects rot from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureRoot(code)
    expect(result.rotCount).toBeGreaterThan(0)
    expect(result.hasNoRot).toBe(false)
  })

  it('detects erosion from HACK/@deprecated', () => {
    const code = '// HACK @deprecated'
    const result = measureRoot(code)
    expect(result.erosionCount).toBeGreaterThan(0)
    expect(result.hasNoErosion).toBe(false)
  })
})

// ─── measureMud ────────────────────────────────────────────────────────────

describe('measureMud', () => {
  it('returns spotless for RICH content', () => {
    const result = measureMud(RICH)
    expect(result.transcendence).toBe(100)
    expect(result.purity).toBe('spotless')
    expect(result.hasHighTranscendence).toBe(true)
    expect(result.hasNoContaminants).toBe(true)
    expect(result.hasCleanPatterns).toBe(true)
    expect(result.hasNoTechnicalDebt).toBe(true)
    expect(result.hasPureLogic).toBe(true)
    expect(result.hasNoHackery).toBe(true)
    expect(result.hasNoSideEffects).toBe(true)
    expect(result.hasPristine).toBe(true)
    expect(result.hasNoBandAids).toBe(true)
    expect(result.contaminantCount).toBe(0)
    expect(result.hackeryCount).toBe(0)
  })

  it('returns muddy for MEDIUM content', () => {
    const result = measureMud(MEDIUM)
    expect(result.transcendence).toBe(60)
    expect(result.purity).toBe('muddy')
    expect(result.hasHighTranscendence).toBe(false)
    expect(result.hasNoSideEffects).toBe(false)
  })

  it('returns muddy for EMPTY content', () => {
    const result = measureMud(EMPTY)
    expect(result.transcendence).toBe(65)
    expect(result.purity).toBe('muddy')
  })

  it('detects contaminants from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureMud(code)
    expect(result.contaminantCount).toBeGreaterThan(0)
    expect(result.hasNoContaminants).toBe(false)
  })

  it('detects hackery from HACK and empty catch', () => {
    const code = '// HACK try {} catch(e) {}'
    const result = measureMud(code)
    expect(result.hackeryCount).toBeGreaterThan(0)
    expect(result.hasNoHackery).toBe(false)
  })
})

// ─── measureGeometry ───────────────────────────────────────────────────────

describe('measureGeometry', () => {
  it('returns golden-ratio for RICH content', () => {
    const result = measureGeometry(RICH)
    expect(result.quality).toBe(90)
    expect(result.pattern).toBe('golden-ratio')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperProportions).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasMathematical).toBe(true)
    expect(result.hasElegant).toBe(true)
    expect(result.hasNoBloat).toBe(true)
  })

  it('returns irregular for MEDIUM content', () => {
    const result = measureGeometry(MEDIUM)
    expect(result.quality).toBe(39)
    expect(result.pattern).toBe('irregular')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasNoBloat).toBe(false)
    expect(result.bloatCount).toBe(1)
  })

  it('returns irregular for EMPTY content', () => {
    const result = measureGeometry(EMPTY)
    expect(result.quality).toBe(32)
    expect(result.pattern).toBe('irregular')
  })

  it('detects distortion from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureGeometry(code)
    expect(result.distortionCount).toBeGreaterThan(0)
    expect(result.hasNoDistortion).toBe(false)
  })

  it('detects bloat from console and empty catch', () => {
    const code = 'console.log("x") try {} catch(e) {}'
    const result = measureGeometry(code)
    expect(result.bloatCount).toBeGreaterThan(0)
    expect(result.hasNoBloat).toBe(false)
  })
})

// ─── measureFragrance ──────────────────────────────────────────────────────

describe('measureFragrance', () => {
  it('returns intoxicating for RICH content', () => {
    const result = measureFragrance(RICH)
    expect(result.quality).toBe(100)
    expect(result.aroma).toBe('intoxicating')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasSweetDocumentation).toBe(true)
    expect(result.hasNoMisleading).toBe(true)
    expect(result.hasCaptivating).toBe(true)
    expect(result.hasProperExamples).toBe(true)
  })

  it('returns odorless for MEDIUM content', () => {
    const result = measureFragrance(MEDIUM)
    expect(result.quality).toBe(47)
    expect(result.aroma).toBe('odorless')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns odorless for EMPTY content', () => {
    const result = measureFragrance(EMPTY)
    expect(result.quality).toBe(42)
    expect(result.aroma).toBe('odorless')
  })

  it('detects stale docs from TODO/FIXME', () => {
    const code = '// TODO fix // FIXME broken'
    const result = measureFragrance(code)
    expect(result.staleCount).toBeGreaterThan(0)
    expect(result.hasNoStaleDocs).toBe(false)
  })

  it('detects misleading from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureFragrance(code)
    expect(result.misleadingCount).toBeGreaterThan(0)
    expect(result.hasNoMisleading).toBe(false)
  })
})

// ─── measureVitality ───────────────────────────────────────────────────────

describe('measureVitality', () => {
  it('returns eternal-bloom for RICH content', () => {
    const result = measureVitality(RICH)
    expect(result.level).toBe(90)
    expect(result.health).toBe('eternal-bloom')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasVitality).toBe(true)
    expect(result.hasNoDegeneration).toBe(true)
    expect(result.hasRenewable).toBe(true)
    expect(result.hasNoStagnation).toBe(true)
    expect(result.hasNoDisease).toBe(true)
    expect(result.hasAdaptive).toBe(true)
    expect(result.hasThriving).toBe(true)
  })

  it('returns wilting for MEDIUM content', () => {
    const result = measureVitality(MEDIUM)
    expect(result.level).toBe(47)
    expect(result.health).toBe('wilting')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns wilting for EMPTY content', () => {
    const result = measureVitality(EMPTY)
    expect(result.level).toBe(42)
    expect(result.health).toBe('wilting')
  })

  it('detects degeneration from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureVitality(code)
    expect(result.degenerationCount).toBeGreaterThan(0)
    expect(result.hasNoDegeneration).toBe(false)
  })

  it('detects disease from HACK/@deprecated', () => {
    const code = '// HACK @deprecated'
    const result = measureVitality(code)
    expect(result.diseaseCount).toBeGreaterThan(0)
    expect(result.hasNoDisease).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies divine-lotus for score >= 80', () => {
    const petal = analyzeLotusPetal(RICH, 'test.ts')
    expect(petal.condition).toBe('divine-lotus')
    expect(petal.qualityScore).toBe(92)
  })

  it('classifies sacred-bloom for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('sacred-bloom')
  })

  it('classifies garden-lotus for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('garden-lotus')
  })

  it('classifies pond-flower for score 35-49', () => {
    const petal = analyzeLotusPetal(MEDIUM, 'test.ts')
    expect(petal.condition).toBe('pond-flower')
  })

  it('classifies mud-sprout for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('mud-sprout')
  })

  it('classifies seed for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('seed')
  })
})

// ─── classifyPondType ──────────────────────────────────────────────────────

describe('classifyPondType', () => {
  it('returns dry-bed for empty petals', () => {
    expect(classifyPondType([])).toBe('dry-bed')
  })

  it('returns sacred-pond for high avg and enough divine', () => {
    const pond = analyzeLotusPond([analyzeLotusPetal(RICH, 'test.ts')], 'test')
    expect(pond.pondType).toBe('sacred-pond')
  })

  it('returns meditation-pool for medium scores', () => {
    const petal = analyzeLotusPetal(MEDIUM, 'test.ts')
    const pond = analyzeLotusPond([petal], 'test')
    expect(pond.pondType).toBe('meditation-pool')
  })

  it('returns garden-pond for low scores', () => {
    const petal = analyzeLotusPetal(EMPTY, 'test.ts')
    const pond = analyzeLotusPond([petal], 'test')
    expect(pond.pondType).toBe('garden-pond')
  })
})

// ─── analyzeLotusPond ──────────────────────────────────────────────────────

describe('analyzeLotusPond', () => {
  it('returns empty pond for no petals', () => {
    const pond = analyzeLotusPond([], 'empty-dir')
    expect(pond.directory).toBe('empty-dir')
    expect(pond.petals).toEqual([])
    expect(pond.avgBeauty).toBe(0)
    expect(pond.avgPurity).toBe(0)
    expect(pond.avgVitality).toBe(0)
    expect(pond.divineCount).toBe(0)
    expect(pond.seedCount).toBe(0)
    expect(pond.pureCount).toBe(0)
    expect(pond.vitalCount).toBe(0)
    expect(pond.pondType).toBe('dry-bed')
    expect(pond.condition).toBe('barren')
  })

  it('computes correct pond aggregates', () => {
    const pond = analyzeLotusPond([analyzeLotusPetal(RICH, 'a.ts')], 'dir')
    expect(pond.avgBeauty).toBe(90)
    expect(pond.avgPurity).toBe(100)
    expect(pond.avgVitality).toBe(90)
    expect(pond.divineCount).toBe(1)
    expect(pond.pureCount).toBe(1)
    expect(pond.vitalCount).toBe(1)
    expect(pond.condition).toBe('divine-garden')
  })
})

// ─── classifyGardenerGrade ─────────────────────────────────────────────────

describe('classifyGardenerGrade', () => {
  it('returns enlightened-master for 80+', () => {
    expect(classifyGardenerGrade(85)).toBe('enlightened-master')
    expect(classifyGardenerGrade(100)).toBe('enlightened-master')
  })

  it('returns zen-gardener for 65-79', () => {
    expect(classifyGardenerGrade(70)).toBe('zen-gardener')
  })

  it('returns lotus-tender for 50-64', () => {
    expect(classifyGardenerGrade(55)).toBe('lotus-tender')
  })

  it('returns gardener for 35-49', () => {
    expect(classifyGardenerGrade(40)).toBe('gardener')
  })

  it('returns apprentice for 20-34', () => {
    expect(classifyGardenerGrade(25)).toBe('apprentice')
  })

  it('returns trampler for < 20', () => {
    expect(classifyGardenerGrade(10)).toBe('trampler')
    expect(classifyGardenerGrade(0)).toBe('trampler')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring code', () => {
    const result = buildLotusBloomResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Enhance petal beauty — add interfaces, types, and elegant patterns for code aesthetics')
    expect(result.recommendations).toContain('Deepen root foundations — add abstractions and reduce any/eval for code stability')
  })

  it('returns empty recommendations for high-scoring code', () => {
    const result = buildLotusBloomResult(['rich.ts'], [RICH])
    expect(result.recommendations).toEqual([])
  })
})

// ─── buildLotusBloomResult ─────────────────────────────────────────────────

describe('buildLotusBloomResult', () => {
  it('returns correct structure for mixed fixtures', () => {
    const result = buildLotusBloomResult(
      ['a/rich.ts', 'b/medium.ts', 'empty.ts'],
      [RICH, MEDIUM, EMPTY],
    )

    expect(result.petals).toHaveLength(3)
    expect(result.ponds).toHaveLength(3)

    expect(result.garden.overallPurity).toBe(61)
    expect(result.garden.isPristine).toBe(true)
    expect(result.garden.avgBeauty).toBe(60)
    expect(result.garden.avgPurity).toBe(75)
    expect(result.garden.avgVitality).toBe(60)

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalPonds).toBe(3)
    expect(result.stats.avgPetalBeauty).toBe(60)
    expect(result.stats.avgRootDepth).toBe(56)
    expect(result.stats.avgMudTranscendence).toBe(75)
    expect(result.stats.avgSacredGeometry).toBe(54)
    expect(result.stats.avgFragranceQuality).toBe(63)
    expect(result.stats.avgBloomVitality).toBe(60)
    expect(result.stats.divineLotusCount).toBe(1)
    expect(result.stats.pondFlowerCount).toBe(2)
    expect(result.stats.gardenerGrade).toBe('lotus-tender')
    expect(result.stats.bestPetal).toBe('a/rich.ts')
    expect(result.stats.mostBeautiful).toBe('a/rich.ts')
    expect(result.stats.deepestRoots).toBe('a/rich.ts')
    expect(result.stats.purest).toBe('a/rich.ts')
    expect(result.stats.bestStructured).toBe('a/rich.ts')
    expect(result.stats.bestDocumented).toBe('a/rich.ts')
    expect(result.stats.hasHighBeautyCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighTranscendenceCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighFragranceCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
  })

  it('returns enlightened-master grade for perfect code', () => {
    const result = buildLotusBloomResult(['rich.ts'], [RICH])
    expect(result.stats.gardenerGrade).toBe('enlightened-master')
    expect(result.garden.overallPurity).toBe(92)
    expect(result.stats.overallPurity).toBe(92)
  })

  it('handles empty files array', () => {
    const result = buildLotusBloomResult([], [])
    expect(result.petals).toHaveLength(0)
    expect(result.ponds).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgPetalBeauty).toBe(0)
    expect(result.stats.gardenerGrade).toBe('trampler')
    expect(result.garden.isPristine).toBe(false)
  })

  it('groups files into ponds by directory', () => {
    const result = buildLotusBloomResult(
      ['a/f1.ts', 'a/f2.ts', 'b/f3.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.ponds).toHaveLength(2)
    const dirA = result.ponds.find((p) => p.directory === 'a')
    expect(dirA).toBeDefined()
    expect(dirA!.petals).toHaveLength(2)
    const dirB = result.ponds.find((p) => p.directory === 'b')
    expect(dirB).toBeDefined()
    expect(dirB!.petals).toHaveLength(1)
  })
})

// ─── formatLotusBloomJson ──────────────────────────────────────────────────

describe('formatLotusBloomJson', () => {
  it('returns valid JSON string', () => {
    const result = buildLotusBloomResult(['test.ts'], [RICH])
    const json = formatLotusBloomJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.gardenerGrade).toBe('enlightened-master')
  })
})

// ─── formatLotusBloomTable ─────────────────────────────────────────────────

describe('formatLotusBloomTable', () => {
  it('returns non-empty string for basic result', () => {
    const result = buildLotusBloomResult(['test.ts'], [MEDIUM])
    const table = formatLotusBloomTable(result, false)
    expect(table).toContain('Lotus Bloom Analysis')
    expect(table).toContain('Total Files')
    expect(table).toContain('Gardener Grade')
  })

  it('includes per-file details when verbose', () => {
    const result = buildLotusBloomResult(['test.ts'], [RICH])
    const table = formatLotusBloomTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations when present', () => {
    const result = buildLotusBloomResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    const table = formatLotusBloomTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('color helpers', () => {
  it('scoreColor returns string for various scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('petalRadianceColor returns string for all radiances', () => {
    const values = ['thousand-petal', 'full-bloom', 'opening', 'bud', 'wilted', 'fallen']
    for (const v of values) {
      expect(typeof petalRadianceColor(v)).toBe('string')
    }
  })

  it('rootStrengthColor returns string for all strengths', () => {
    const values = ['deep-taproot', 'strong-root', 'established', 'shallow-root', 'floating', 'uprooted']
    for (const v of values) {
      expect(typeof rootStrengthColor(v)).toBe('string')
    }
  })

  it('mudPurityColor returns string for all purities', () => {
    const values = ['spotless', 'clean', 'mostly-pure', 'some-residue', 'muddy', 'polluted']
    for (const v of values) {
      expect(typeof mudPurityColor(v)).toBe('string')
    }
  })

  it('geometryPatternColor returns string for all patterns', () => {
    const values = ['golden-ratio', 'fibonacci-spiral', 'sacred-pattern', 'organized', 'irregular', 'chaotic']
    for (const v of values) {
      expect(typeof geometryPatternColor(v)).toBe('string')
    }
  })

  it('fragranceAromaColor returns string for all aromas', () => {
    const values = ['intoxicating', 'fragrant', 'pleasant', 'faint', 'odorless', 'stale']
    for (const v of values) {
      expect(typeof fragranceAromaColor(v)).toBe('string')
    }
  })

  it('vitalityHealthColor returns string for all healths', () => {
    const values = ['eternal-bloom', 'vibrant', 'healthy', 'fading', 'wilting', 'dead']
    for (const v of values) {
      expect(typeof vitalityHealthColor(v)).toBe('string')
    }
  })

  it('conditionColor returns string for all conditions', () => {
    const values = ['divine-lotus', 'sacred-bloom', 'garden-lotus', 'pond-flower', 'mud-sprout', 'seed']
    for (const v of values) {
      expect(typeof conditionColor(v)).toBe('string')
    }
  })

  it('gardenerGradeColor returns string for all grades', () => {
    const values = ['enlightened-master', 'zen-gardener', 'lotus-tender', 'gardener', 'apprentice', 'trampler']
    for (const v of values) {
      expect(typeof gardenerGradeColor(v)).toBe('string')
    }
  })

  it('pondTypeColor returns string for all types', () => {
    const values = ['sacred-pond', 'temple-garden', 'meditation-pool', 'garden-pond', 'muddy-puddle', 'dry-bed']
    for (const v of values) {
      expect(typeof pondTypeColor(v)).toBe('string')
    }
  })

  it('pondConditionColor returns string for all conditions', () => {
    const values = ['divine-garden', 'sacred-pond', 'blooming-garden', 'greenhouse', 'dying-pond', 'barren']
    for (const v of values) {
      expect(typeof pondConditionColor(v)).toBe('string')
    }
  })

  it('returns input string for unknown values', () => {
    expect(scoreColor(90)).toContain('90')
    expect(petalRadianceColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
  })
})
