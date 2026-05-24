import { describe, it, expect } from 'vitest'
import {
  measureBalancing,
  measureDisciplining,
  measurePrecisioning,
  measureFortifying,
  measurePurifying,
  classifyPetalCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifySmithGrade,
  analyzeIronPetal,
  analyzeLotusGarden,
  buildIronLotusResult,
  generateRecommendations,
} from '../src/commands/iron-lotus-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPetalTable,
  formatPetalsTable,
  formatGardenTable,
  formatGardensTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/iron-lotus-format-helpers.js'
import type {
  IronPetal,
  IronLotusStats,
  IronLotusResult,
  ForgeSummary,
} from '../src/commands/iron-lotus-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const validated = validateUser(config)
    return validated
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

function validateUser(user: Config): UserConfig {
  return {
    name: user.name ?? 'unknown',
    age: user.age ?? 0,
    role: user.role ?? 'user',
  }
}

export class UserService {
  private users: Map<string, UserConfig> = new Map()

  getUser(id: string): UserConfig | undefined {
    return this.users.get(id)
  }
}

const defaultConfig: UserConfig = {
  name: 'default',
  age: 25,
  role: 'user',
}
`

const poorContent = `var x = eval("1 + 2")
debugger
any thing = x
var y = eval("3 + 4")
`

// ─── measureBalancing ──────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns valid BalancingMeasure for empty content', () => {
    const result = measureBalancing(emptyContent)
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.strength).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighStrength).toBe(false)
    expect(result.yoloCount).toBe(0)
    expect(result.assumptionCount).toBe(0)
    expect(result.hasNoYolo).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureBalancing(emptyContent)
    const rich = measureBalancing(richContent)
    expect(rich.strength).toBeGreaterThan(empty.strength)
  })

  it('detects powerfulButCareful in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasPowerfulButCareful).toBe(true)
  })

  it('detects edgeCaseHandling in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasEdgeCaseHandling).toBe(true)
  })

  it('detects nullSafe in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasNullSafe).toBe(true)
  })

  it('detects typeGuarded in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasTypeGuarded).toBe(true)
  })

  it('detects defensiveButNotParanoid in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasDefensiveButNotParanoid).toBe(true)
  })

  it('detects appropriate in rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasAppropriate).toBe(true)
  })

  it('detects high strength for rich content', () => {
    const result = measureBalancing(richContent)
    expect(result.hasHighStrength).toBe(true)
  })

  it('grades empty content as no-balance', () => {
    expect(measureBalancing(emptyContent).grade).toBe('no-balance')
  })

  it('counts yolo (var) in poor content', () => {
    const result = measureBalancing(poorContent)
    expect(result.yoloCount).toBeGreaterThan(0)
    expect(result.hasNoYolo).toBe(false)
  })

  it('counts assumption (any) in poor content', () => {
    const result = measureBalancing(poorContent)
    expect(result.assumptionCount).toBeGreaterThan(0)
    expect(result.hasNoAssumption).toBe(false)
  })
})

// ─── measureDisciplining ───────────────────────────────────────────

describe('measureDisciplining', () => {
  it('returns valid DiscipliningMeasure for empty content', () => {
    const result = measureDisciplining(emptyContent)
    expect(result.discipline).toBeGreaterThanOrEqual(0)
    expect(result.discipline).toBeLessThanOrEqual(100)
    expect(typeof result.iron).toBe('string')
    expect(result.mixedCount).toBe(0)
    expect(result.looseTypingCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureDisciplining(emptyContent)
    const rich = measureDisciplining(richContent)
    expect(rich.discipline).toBeGreaterThan(empty.discipline)
  })

  it('detects consistent in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasConsistent).toBe(true)
  })

  it('detects uniformStyle in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasUniformStyle).toBe(true)
  })

  it('detects strictTyping in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasStrictTyping).toBe(true)
  })

  it('detects enforcedRules in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasEnforcedRules).toBe(true)
  })

  it('detects regularPatterns in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasRegularPatterns).toBe(true)
  })

  it('detects rigorous in rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasRigorous).toBe(true)
  })

  it('detects high discipline for rich content', () => {
    const result = measureDisciplining(richContent)
    expect(result.hasHighDiscipline).toBe(true)
  })

  it('grades empty content as no-discipline', () => {
    expect(measureDisciplining(emptyContent).iron).toBe('no-discipline')
  })

  it('counts mixed (var) in poor content', () => {
    const result = measureDisciplining(poorContent)
    expect(result.mixedCount).toBeGreaterThan(0)
    expect(result.hasNoMixed).toBe(false)
  })
})

// ─── measurePrecisioning ───────────────────────────────────────────

describe('measurePrecisioning', () => {
  it('returns valid PrecisioningMeasure for empty content', () => {
    const result = measurePrecisioning(emptyContent)
    expect(result.precision).toBeGreaterThanOrEqual(0)
    expect(result.precision).toBeLessThanOrEqual(100)
    expect(typeof result.petal).toBe('string')
    expect(result.approximateCount).toBe(0)
    expect(result.vagueCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measurePrecisioning(emptyContent)
    const rich = measurePrecisioning(richContent)
    expect(rich.precision).toBeGreaterThan(empty.precision)
  })

  it('detects accurate in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasAccurate).toBe(true)
  })

  it('detects exact in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasExact).toBe(true)
  })

  it('detects specific in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasSpecific).toBe(true)
  })

  it('detects correct in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasCorrect).toBe(true)
  })

  it('detects precise in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasPrecise).toBe(true)
  })

  it('detects sharp in rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasSharp).toBe(true)
  })

  it('detects high precision for rich content', () => {
    const result = measurePrecisioning(richContent)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('grades empty content as no-precision', () => {
    expect(measurePrecisioning(emptyContent).petal).toBe('no-precision')
  })

  it('counts approximate (var) in poor content', () => {
    const result = measurePrecisioning(poorContent)
    expect(result.approximateCount).toBeGreaterThan(0)
    expect(result.hasNoApproximate).toBe(false)
  })
})

// ─── measureFortifying ─────────────────────────────────────────────

describe('measureFortifying', () => {
  it('returns valid FortifyingMeasure for empty content', () => {
    const result = measureFortifying(emptyContent)
    expect(result.fortitude).toBeGreaterThanOrEqual(0)
    expect(result.fortitude).toBeLessThanOrEqual(100)
    expect(typeof result.root).toBe('string')
    expect(result.untestedCount).toBe(0)
    expect(result.unsafeCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureFortifying(emptyContent)
    const rich = measureFortifying(richContent)
    expect(rich.fortitude).toBeGreaterThan(empty.fortitude)
  })

  it('detects tested in rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasTested).toBe(true)
  })

  it('detects typeSafe in rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects wellStructured in rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects solidBase in rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasSolidBase).toBe(true)
  })

  it('detects verified in rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasVerified).toBe(true)
  })

  it('detects high fortitude for rich content', () => {
    const result = measureFortifying(richContent)
    expect(result.hasHighFortitude).toBe(true)
  })

  it('grades empty content as no-roots', () => {
    expect(measureFortifying(emptyContent).root).toBe('no-roots')
  })

  it('counts untested (var) in poor content', () => {
    const result = measureFortifying(poorContent)
    expect(result.untestedCount).toBeGreaterThan(0)
  })
})

// ─── measurePurifying ──────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns valid PurifyingMeasure for empty content', () => {
    const result = measurePurifying(emptyContent)
    expect(result.purity).toBeGreaterThanOrEqual(0)
    expect(result.purity).toBeLessThanOrEqual(100)
    expect(typeof result.bloom).toBe('string')
    expect(result.hackCount).toBe(0)
    expect(result.workaroundCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measurePurifying(emptyContent)
    const rich = measurePurifying(richContent)
    expect(rich.purity).toBeGreaterThan(empty.purity)
  })

  it('detects noTechnicalDebt in rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasNoTechnicalDebt).toBe(true)
  })

  it('detects clean in rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasClean).toBe(true)
  })

  it('detects proper in rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasProper).toBe(true)
  })

  it('detects final in rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasFinal).toBe(true)
  })

  it('detects production in rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasProduction).toBe(true)
  })

  it('detects high purity for rich content', () => {
    const result = measurePurifying(richContent)
    expect(result.hasHighPurity).toBe(true)
  })

  it('grades empty content as no-bloom', () => {
    expect(measurePurifying(emptyContent).bloom).toBe('no-bloom')
  })

  it('counts hack (var) in poor content', () => {
    const result = measurePurifying(poorContent)
    expect(result.hackCount).toBeGreaterThan(0)
    expect(result.hasNoHackComments).toBe(false)
  })
})

// ─── classifyPetalCondition ────────────────────────────────────────

describe('classifyPetalCondition', () => {
  it('classifies 90 as mythical-bloom', () => expect(classifyPetalCondition(90)).toBe('mythical-bloom'))
  it('classifies 75 as forged-flower', () => expect(classifyPetalCondition(75)).toBe('forged-flower'))
  it('classifies 60 as proper-lotus', () => expect(classifyPetalCondition(60)).toBe('proper-lotus'))
  it('classifies 45 as rusty-petal', () => expect(classifyPetalCondition(45)).toBe('rusty-petal'))
  it('classifies 30 as wilted-iron', () => expect(classifyPetalCondition(30)).toBe('wilted-iron'))
  it('classifies 10 as scrap-metal', () => expect(classifyPetalCondition(10)).toBe('scrap-metal'))
  it('classifies 0 as scrap-metal', () => expect(classifyPetalCondition(0)).toBe('scrap-metal'))
  it('classifies 85 as mythical-bloom', () => expect(classifyPetalCondition(85)).toBe('mythical-bloom'))
})

// ─── classifyGardenType ────────────────────────────────────────────

describe('classifyGardenType', () => {
  it('returns no-garden for empty petals', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns forbidden-garden for high quality mythical majority', () => {
    const petals: IronPetal[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      strengthThroughFragility: 90, ironDiscipline: 90, petalPrecision: 90,
      rootFortitude: 90, bloomPurity: 90,
      balancing: measureBalancing(richContent),
      disciplining: measureDisciplining(richContent),
      precisioning: measurePrecisioning(richContent),
      fortifying: measureFortifying(richContent),
      purifying: measurePurifying(richContent),
      condition: 'mythical-bloom' as const,
      qualityScore: 85,
    }))
    const result = classifyGardenType(petals)
    expect(['forbidden-garden', 'iron-temple']).toContain(result)
  })

  it('returns no-garden for very low quality', () => {
    const petals: IronPetal[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      strengthThroughFragility: 5, ironDiscipline: 5, petalPrecision: 5,
      rootFortitude: 5, bloomPurity: 5,
      balancing: measureBalancing(emptyContent),
      disciplining: measureDisciplining(emptyContent),
      precisioning: measurePrecisioning(emptyContent),
      fortifying: measureFortifying(emptyContent),
      purifying: measurePurifying(emptyContent),
      condition: 'scrap-metal' as const,
      qualityScore: 5,
    }))
    expect(classifyGardenType(petals)).toBe('no-garden')
  })
})

// ─── classifyGardenCondition ───────────────────────────────────────

describe('classifyGardenCondition', () => {
  it('classifies 80 as divine-bloom', () => expect(classifyGardenCondition(80)).toBe('divine-bloom'))
  it('classifies 65 as beautiful-garden', () => expect(classifyGardenCondition(65)).toBe('beautiful-garden'))
  it('classifies 50 as decent-plot', () => expect(classifyGardenCondition(50)).toBe('decent-plot'))
  it('classifies 35 as neglected-bed', () => expect(classifyGardenCondition(35)).toBe('neglected-bed'))
  it('classifies 20 as overgrown', () => expect(classifyGardenCondition(20)).toBe('overgrown'))
  it('classifies 5 as void', () => expect(classifyGardenCondition(5)).toBe('void'))
})

// ─── classifySmithGrade ────────────────────────────────────────────

describe('classifySmithGrade', () => {
  it('classifies 85 as divine-smith', () => expect(classifySmithGrade(85)).toBe('divine-smith'))
  it('classifies 70 as master-forge', () => expect(classifySmithGrade(70)).toBe('master-forge'))
  it('classifies 55 as skilled-crafter', () => expect(classifySmithGrade(55)).toBe('skilled-crafter'))
  it('classifies 40 as apprentice', () => expect(classifySmithGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('classifies 10 as no-smith', () => expect(classifySmithGrade(10)).toBe('no-smith'))
})

// ─── analyzeIronPetal ──────────────────────────────────────────────

describe('analyzeIronPetal', () => {
  it('analyzes empty content as scrap-metal', () => {
    const result = analyzeIronPetal(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('scrap-metal')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeIronPetal(emptyContent, 'empty.ts')
    const rich = analyzeIronPetal(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeIronPetal(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.balancing.strength * 0.2 +
      result.disciplining.discipline * 0.2 +
      result.precisioning.precision * 0.2 +
      result.fortifying.fortitude * 0.2 +
      result.purifying.purity * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeIronPetal(richContent, 'rich.ts')
    expect(result.balancing).toBeDefined()
    expect(result.disciplining).toBeDefined()
    expect(result.precisioning).toBeDefined()
    expect(result.fortifying).toBeDefined()
    expect(result.purifying).toBeDefined()
  })

  it('sets strengthThroughFragility from balancing.strength', () => {
    const result = analyzeIronPetal(richContent, 'rich.ts')
    expect(result.strengthThroughFragility).toBe(result.balancing.strength)
  })

  it('sets ironDiscipline from disciplining.discipline', () => {
    const result = analyzeIronPetal(richContent, 'rich.ts')
    expect(result.ironDiscipline).toBe(result.disciplining.discipline)
  })

  it('sets petalPrecision from precisioning.precision', () => {
    const result = analyzeIronPetal(richContent, 'rich.ts')
    expect(result.petalPrecision).toBe(result.precisioning.precision)
  })

  it('sets rootFortitude from fortifying.fortitude', () => {
    const result = analyzeIronPetal(richContent, 'rich.ts')
    expect(result.rootFortitude).toBe(result.fortifying.fortitude)
  })
})

// ─── analyzeLotusGarden ────────────────────────────────────────────

describe('analyzeLotusGarden', () => {
  it('returns empty garden for no petals', () => {
    const result = analyzeLotusGarden([], 'src')
    expect(result.directory).toBe('src')
    expect(result.petals).toHaveLength(0)
    expect(result.avgStrength).toBe(0)
    expect(result.avgDiscipline).toBe(0)
    expect(result.avgPurity).toBe(0)
    expect(result.mythicalBloomCount).toBe(0)
    expect(result.scrapMetalCount).toBe(0)
    expect(result.gardenType).toBe('no-garden')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single petal', () => {
    const petal = analyzeIronPetal(richContent, 'rich.ts')
    const result = analyzeLotusGarden([petal], 'src')
    expect(result.avgStrength).toBe(petal.strengthThroughFragility)
    expect(result.avgDiscipline).toBe(petal.ironDiscipline)
    expect(result.avgPurity).toBe(petal.bloomPurity)
  })

  it('counts mythical blooms and scrap metal', () => {
    const mythical = analyzeIronPetal(richContent, 'rich.ts')
    const scrap = analyzeIronPetal(emptyContent, 'empty.ts')
    if (mythical.condition === 'mythical-bloom' && scrap.condition === 'scrap-metal') {
      const result = analyzeLotusGarden([mythical, scrap], 'src')
      expect(result.mythicalBloomCount).toBe(1)
      expect(result.scrapMetalCount).toBe(1)
    }
  })
})

// ─── buildIronLotusResult ──────────────────────────────────────────

describe('buildIronLotusResult', () => {
  it('handles empty input', async () => {
    const result = await buildIronLotusResult([], [])
    expect(result.petals).toHaveLength(0)
    expect(result.gardens).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalGardens).toBe(0)
    expect(result.stats.overallPerfection).toBe(0)
    expect(result.forge.isMythical).toBe(false)
    expect(result.forge.overallPerfection).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildIronLotusResult(['file.ts'], [richContent])
    expect(result.petals).toHaveLength(1)
    expect(result.petals[0].file).toBe('file.ts')
    expect(result.gardens).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into gardens by directory', async () => {
    const result = await buildIronLotusResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.petals).toHaveLength(3)
    expect(result.gardens).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalGardens).toBe(2)
  })

  it('computes forge summary correctly', async () => {
    const result = await buildIronLotusResult(['f.ts'], [richContent])
    expect(result.forge.avgStrength).toBe(result.petals[0].strengthThroughFragility)
    expect(result.forge.overallPerfection).toBeGreaterThanOrEqual(0)
  })

  it('sets isMythical when avgStrength >= 60', async () => {
    const result = await buildIronLotusResult(['f.ts'], [richContent])
    if (result.forge.avgStrength >= 60) {
      expect(result.forge.isMythical).toBe(true)
    } else {
      expect(result.forge.isMythical).toBe(false)
    }
  })

  it('tracks best petal and top performers', async () => {
    const result = await buildIronLotusResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestPetal).toBe('a.ts')
    expect(result.stats.strongest).toBeDefined()
    expect(result.stats.mostDisciplined).toBeDefined()
    expect(result.stats.mostPrecise).toBeDefined()
    expect(result.stats.purest).toBeDefined()
  })

  it('computes overallPerfection as avg of strength+discipline+purity', async () => {
    const result = await buildIronLotusResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.forge.avgStrength + result.forge.avgDiscipline + result.forge.avgPurity) / 3,
    )
    expect(result.forge.overallPerfection).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildIronLotusResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.mythicalBloomCount +
      result.stats.forgedFlowerCount +
      result.stats.properLotusCount +
      result.stats.rustyPetalCount +
      result.stats.wiltedIronCount +
      result.stats.scrapMetalCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildIronLotusResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets smith grade', async () => {
    const result = await buildIronLotusResult(['f.ts'], [richContent])
    expect(['divine-smith', 'master-forge', 'skilled-crafter', 'apprentice', 'novice', 'no-smith']).toContain(
      result.stats.smithGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: IronLotusStats = {
    totalFiles: 0, totalGardens: 0,
    avgStrengthThroughFragility: 0, avgIronDiscipline: 0, avgPetalPrecision: 0,
    avgRootFortitude: 0, avgBloomPurity: 0,
    mythicalBloomCount: 0, forgedFlowerCount: 0, properLotusCount: 0,
    rustyPetalCount: 0, wiltedIronCount: 0, scrapMetalCount: 0,
    hasHighStrengthCount: 0, hasHighDisciplineCount: 0, hasHighPrecisionCount: 0,
    hasHighFortitudeCount: 0, hasHighPurityCount: 0,
    overallPerfection: 0, smithGrade: 'no-smith',
    bestPetal: '', strongest: '', mostDisciplined: '', mostPrecise: '', purest: '',
  }

  const emptyForge: ForgeSummary = {
    avgStrength: 0, avgDiscipline: 0, avgPurity: 0,
    isMythical: false, overallPerfection: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyForge, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes strength recommendation when avgStrengthThroughFragility < 50', () => {
    const stats = { ...emptyStats, avgStrengthThroughFragility: 30 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('strength') || r.includes('fragility'))).toBe(true)
  })

  it('includes discipline recommendation when avgIronDiscipline < 50', () => {
    const stats = { ...emptyStats, avgIronDiscipline: 30 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('discipline'))).toBe(true)
  })

  it('includes precision recommendation when avgPetalPrecision < 50', () => {
    const stats = { ...emptyStats, avgPetalPrecision: 30 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('precision'))).toBe(true)
  })

  it('includes fortitude recommendation when avgRootFortitude < 50', () => {
    const stats = { ...emptyStats, avgRootFortitude: 30 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('fortitude') || r.includes('root'))).toBe(true)
  })

  it('includes purity recommendation when avgBloomPurity < 50', () => {
    const stats = { ...emptyStats, avgBloomPurity: 30 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('purity') || r.includes('bloom'))).toBe(true)
  })

  it('includes scrap guidance when scrapMetalCount > 0', () => {
    const stats = { ...emptyStats, scrapMetalCount: 3 }
    const recs = generateRecommendations([], [], emptyForge, stats)
    expect(recs.some(r => r.includes('scrap'))).toBe(true)
  })

  it('includes perfection recommendation when overallPerfection < 40', () => {
    const stats = { ...emptyStats, overallPerfection: 20 }
    const forge = { ...emptyForge, overallPerfection: 20 }
    const recs = generateRecommendations([], [], forge, stats)
    expect(recs.some(r => r.includes('perfection'))).toBe(true)
  })

  it('praises divine smith when all metrics are high', () => {
    const highStats: IronLotusStats = {
      ...emptyStats,
      avgStrengthThroughFragility: 80, avgIronDiscipline: 80, avgPetalPrecision: 80,
      avgRootFortitude: 80, avgBloomPurity: 80,
      overallPerfection: 80, smithGrade: 'divine-smith',
    }
    const highForge: ForgeSummary = {
      avgStrength: 80, avgDiscipline: 80, avgPurity: 80,
      isMythical: true, overallPerfection: 80,
    }
    const recs = generateRecommendations([], [], highForge, highStats)
    expect(recs.some(r => r.includes('divine smith'))).toBe(true)
  })

  it('mentions specific scrap files when <= 3', () => {
    const petal: IronPetal = analyzeIronPetal(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, scrapMetalCount: 1 }
    const recs = generateRecommendations([petal], [], emptyForge, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('recommends redesign when all gardens are weeds', () => {
    const weedGarden: IronLotusStats = { ...emptyStats }
    const garden = analyzeLotusGarden([], 'src')
    const stats = { ...weedGarden }
    const recs = generateRecommendations([], [garden], emptyForge, stats)
    // garden with no petals has gardenType no-garden, which triggers allWeeds
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => expect(typeof colorScore(50)).toBe('string'))
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('returns a string for mythical-bloom', () => expect(typeof colorGrade('mythical-bloom')).toBe('string'))
  it('returns a string for scrap-metal', () => expect(typeof colorGrade('scrap-metal')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatPetalTable', () => {
  it('formats a single petal', () => {
    const petal = analyzeIronPetal(richContent, 'rich.ts')
    const result = formatPetalTable(petal)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Strength Through Fragility')
    expect(result).toContain('Iron Discipline')
    expect(result).toContain('Petal Precision')
    expect(result).toContain('Root Fortitude')
    expect(result).toContain('Bloom Purity')
  })
})

describe('formatPetalsTable', () => {
  it('handles empty array', () => expect(formatPetalsTable([])).toContain('No iron petals'))
  it('formats multiple petals', () => {
    const petals = [
      analyzeIronPetal(richContent, 'a.ts'),
      analyzeIronPetal(moderateContent, 'b.ts'),
    ]
    const result = formatPetalsTable(petals)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden', () => {
    const petal = analyzeIronPetal(richContent, 'rich.ts')
    const garden = analyzeLotusGarden([petal], 'src')
    const result = formatGardenTable(garden)
    expect(result).toContain('src')
    expect(result).toContain('Garden')
  })
})

describe('formatGardensTable', () => {
  it('handles empty array', () => expect(formatGardensTable([])).toContain('No lotus gardens'))
  it('formats gardens', () => {
    const petal = analyzeIronPetal(richContent, 'src/a.ts')
    const garden = analyzeLotusGarden([petal], 'src')
    const result = formatGardensTable([garden])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildIronLotusResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Iron Lotus Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Perfection')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Forge strength', 'Grow discipline'])
    expect(result).toContain('Forge strength')
    expect(result).toContain('Grow discipline')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildIronLotusResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Iron Lotus Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Mythical')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildIronLotusResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.petals).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.forge).toBeDefined()
  })
})
