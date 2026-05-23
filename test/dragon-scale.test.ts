import { describe, it, expect } from 'vitest'

import {
  measureArmor,
  measureFire,
  measureWing,
  measureWisdom,
  measureTreasure,
  measureVitality,
  analyzeScalePlating,
  classifyCondition,
  classifyLairType,
  analyzeDragonLair,
  classifyDragonlordGrade,
  generateRecommendations,
  buildDragonScaleResult,
} from '../src/commands/dragon-scale-helpers.js'

import {
  scoreColor,
  armorGradeColor,
  fireIntensityColor,
  wingCapabilityColor,
  wisdomAgeColor,
  treasureQualityColor,
  vitalityHealthColor,
  conditionColor,
  dragonlordGradeColor,
  lairTypeColor,
  lairConditionColor,
  formatDragonScaleJson,
  formatDragonScaleTable,
} from '../src/commands/dragon-scale-format-helpers.js'

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

// ─── measureArmor ──────────────────────────────────────────────────────────

describe('measureArmor', () => {
  it('returns correct values for RICH content', () => {
    const result = measureArmor(RICH)
    expect(result.level).toBe(90)
    expect(result.grade).toBe('adamantine-scale')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasImpenetrable).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.hasLayered).toBe(true)
    expect(result.hasNoWeakPoints).toBe(true)
    expect(result.hasProperShielding).toBe(true)
    expect(result.hasNoChinks).toBe(true)
    expect(result.hasSelfHealing).toBe(true)
    expect(result.hasNoCorrosion).toBe(true)
    expect(result.gapCount).toBe(0)
    expect(result.chinkCount).toBe(0)
  })

  it('returns correct values for MEDIUM content', () => {
    const result = measureArmor(MEDIUM)
    expect(result.level).toBe(48)
    expect(result.grade).toBe('leather-hide')
    expect(result.hasHighLevel).toBe(false)
    expect(result.hasImpenetrable).toBe(false)
    expect(result.hasNoGaps).toBe(true)
  })

  it('returns correct values for EMPTY content', () => {
    const result = measureArmor(EMPTY)
    expect(result.level).toBe(43)
    expect(result.grade).toBe('leather-hide')
    expect(result.hasHighLevel).toBe(false)
    expect(result.hasImpenetrable).toBe(false)
  })

  it('detects gaps from any/eval usage', () => {
    const code = 'const x: any = 1; eval("2");'
    const result = measureArmor(code)
    expect(result.gapCount).toBeGreaterThan(0)
    expect(result.hasNoGaps).toBe(false)
  })

  it('detects chinks from empty catch blocks', () => {
    const code = 'try { } catch(e) { }'
    const result = measureArmor(code)
    expect(result.chinkCount).toBeGreaterThan(0)
    expect(result.hasNoChinks).toBe(false)
  })

  it('detects corrosion from HACK comments', () => {
    const code = 'interface Foo {} class Bar {} // HACK fix later'
    const result = measureArmor(code)
    expect(result.hasNoCorrosion).toBe(false)
  })
})

// ─── measureFire ───────────────────────────────────────────────────────────

describe('measureFire', () => {
  it('returns inferno for RICH content', () => {
    const result = measureFire(RICH)
    expect(result.breath).toBe(100)
    expect(result.intensity).toBe('inferno')
    expect(result.hasHighBreath).toBe(true)
    expect(result.hasDevastating).toBe(true)
    expect(result.hasFocused).toBe(true)
    expect(result.hasNoFriendlyFire).toBe(true)
    expect(result.hasControlled).toBe(true)
    expect(result.hasNoBackfire).toBe(true)
    expect(result.hasSustained).toBe(true)
    expect(result.hasNoBurnout).toBe(true)
    expect(result.hasPrecision).toBe(true)
    expect(result.hasNoWaste).toBe(true)
  })

  it('returns spark for MEDIUM content', () => {
    const result = measureFire(MEDIUM)
    expect(result.breath).toBe(37)
    expect(result.intensity).toBe('spark')
    expect(result.hasHighBreath).toBe(false)
    expect(result.hasNoWaste).toBe(false)
  })

  it('returns spark for EMPTY content', () => {
    const result = measureFire(EMPTY)
    expect(result.breath).toBe(42)
    expect(result.intensity).toBe('spark')
  })

  it('detects friendlyFire from any/eval', () => {
    const code = 'const x: any = 1; eval("2");'
    const result = measureFire(code)
    expect(result.friendlyFireCount).toBeGreaterThan(0)
    expect(result.hasNoFriendlyFire).toBe(false)
  })

  it('detects waste from console calls', () => {
    const code = 'console.log("test")'
    const result = measureFire(code)
    expect(result.hasNoWaste).toBe(false)
  })
})

// ─── measureWing ───────────────────────────────────────────────────────────

describe('measureWing', () => {
  it('returns cosmic-flight for RICH content', () => {
    const result = measureWing(RICH)
    expect(result.span).toBe(90)
    expect(result.capability).toBe('cosmic-flight')
    expect(result.hasHighSpan).toBe(true)
    expect(result.hasWideReach).toBe(true)
    expect(result.hasNoStalling).toBe(true)
    expect(result.hasManeuverable).toBe(true)
    expect(result.hasEfficient).toBe(true)
    expect(result.hasNoDrag).toBe(true)
  })

  it('returns gliding for MEDIUM content', () => {
    const result = measureWing(MEDIUM)
    expect(result.span).toBe(60)
    expect(result.capability).toBe('gliding')
    expect(result.hasHighSpan).toBe(false)
    expect(result.hasWideReach).toBe(true)
  })

  it('returns gliding for EMPTY content', () => {
    const result = measureWing(EMPTY)
    expect(result.span).toBe(43)
    expect(result.capability).toBe('gliding')
    expect(result.hasWideReach).toBe(false)
  })

  it('detects stalling from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureWing(code)
    expect(result.stallingCount).toBeGreaterThan(0)
    expect(result.hasNoStalling).toBe(false)
  })

  it('detects drag from empty catch', () => {
    const code = 'try {} catch(e) {}'
    const result = measureWing(code)
    expect(result.dragCount).toBeGreaterThan(0)
    expect(result.hasNoDrag).toBe(false)
  })
})

// ─── measureWisdom ─────────────────────────────────────────────────────────

describe('measureWisdom', () => {
  it('returns ancient-wyrm for RICH content', () => {
    const result = measureWisdom(RICH)
    expect(result.level).toBe(90)
    expect(result.age).toBe('ancient-wyrm')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasDeepKnowledge).toBe(true)
    expect(result.hasNoImpulsiveness).toBe(true)
    expect(result.hasTestedPatterns).toBe(true)
    expect(result.hasStrategic).toBe(true)
    expect(result.hasNoShortsightedness).toBe(true)
  })

  it('returns hatchling for MEDIUM content', () => {
    const result = measureWisdom(MEDIUM)
    expect(result.level).toBe(47)
    expect(result.age).toBe('hatchling')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns hatchling for EMPTY content', () => {
    const result = measureWisdom(EMPTY)
    expect(result.level).toBe(42)
    expect(result.age).toBe('hatchling')
  })

  it('detects impulsiveness from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureWisdom(code)
    expect(result.impulsivenessCount).toBeGreaterThan(0)
    expect(result.hasNoImpulsiveness).toBe(false)
  })

  it('detects shortsightedness from HACK and FIXME', () => {
    const code = 'interface Foo {} // HACK // FIXME'
    const result = measureWisdom(code)
    expect(result.hasNoShortsightedness).toBe(false)
  })
})

// ─── measureTreasure ───────────────────────────────────────────────────────

describe('measureTreasure', () => {
  it('returns legendary-hoard for RICH content', () => {
    const result = measureTreasure(RICH)
    expect(result.hoard).toBe(90)
    expect(result.quality).toBe('legendary-hoard')
    expect(result.hasHighHoard).toBe(true)
    expect(result.hasValuable).toBe(true)
    expect(result.hasNoCounterfeit).toBe(true)
    expect(result.hasRareGems).toBe(true)
    expect(result.hasWellOrganized).toBe(true)
    expect(result.hasNoClutter).toBe(true)
  })

  it('returns pebbles for MEDIUM content', () => {
    const result = measureTreasure(MEDIUM)
    expect(result.hoard).toBe(37)
    expect(result.quality).toBe('pebbles')
    expect(result.hasHighHoard).toBe(false)
    expect(result.hasNoClutter).toBe(false)
    expect(result.clutterCount).toBe(1)
  })

  it('returns pebbles for EMPTY content', () => {
    const result = measureTreasure(EMPTY)
    expect(result.hoard).toBe(43)
    expect(result.quality).toBe('pebbles')
    expect(result.hasNoClutter).toBe(true)
  })

  it('detects counterfeit from any/eval', () => {
    const code = 'const x: any = 1; eval("2")'
    const result = measureTreasure(code)
    expect(result.counterfeitCount).toBeGreaterThan(0)
    expect(result.hasNoCounterfeit).toBe(false)
  })

  it('detects depreciation from @deprecated', () => {
    const code = '/** @deprecated */ function old() {}'
    const result = measureTreasure(code)
    expect(result.hasNoDepreciation).toBe(false)
  })
})

// ─── measureVitality ───────────────────────────────────────────────────────

describe('measureVitality', () => {
  it('returns undying for RICH content', () => {
    const result = measureVitality(RICH)
    expect(result.level).toBe(90)
    expect(result.health).toBe('undying')
    expect(result.hasHighLevel).toBe(true)
    expect(result.hasRobust).toBe(true)
    expect(result.hasNoWeakness).toBe(true)
    expect(result.hasRegenerative).toBe(true)
    expect(result.hasNoDegeneration).toBe(true)
    expect(result.hasResilient).toBe(true)
    expect(result.hasNoVulnerability).toBe(true)
    expect(result.hasThriving).toBe(true)
  })

  it('returns weakened for MEDIUM content', () => {
    const result = measureVitality(MEDIUM)
    expect(result.level).toBe(47)
    expect(result.health).toBe('weakened')
    expect(result.hasHighLevel).toBe(false)
  })

  it('returns weakened for EMPTY content', () => {
    const result = measureVitality(EMPTY)
    expect(result.level).toBe(42)
    expect(result.health).toBe('weakened')
  })

  it('detects weakness from any/eval', () => {
    const code = 'const x: any = 1'
    const result = measureVitality(code)
    expect(result.weaknessCount).toBeGreaterThan(0)
    expect(result.hasNoWeakness).toBe(false)
  })

  it('detects vulnerability from HACK and @deprecated', () => {
    const code = '// HACK @deprecated'
    const result = measureVitality(code)
    expect(result.vulnerabilityCount).toBeGreaterThan(0)
    expect(result.hasNoVulnerability).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies ancient-wyrm for score >= 80', () => {
    const plate = analyzeScalePlating(RICH, 'test.ts')
    expect(plate.condition).toBe('ancient-wyrm')
    expect(plate.qualityScore).toBe(92)
  })

  it('classifies elder-dragon for score 65-79', () => {
    expect(classifyCondition({ qualityScore: 70 } as any)).toBe('elder-dragon')
  })

  it('classifies adult-dragon for score 50-64', () => {
    expect(classifyCondition({ qualityScore: 55 } as any)).toBe('adult-dragon')
  })

  it('classifies young-drake for score 35-49', () => {
    const plate = analyzeScalePlating(MEDIUM, 'test.ts')
    expect(plate.condition).toBe('young-drake')
  })

  it('classifies hatchling for score 20-34', () => {
    expect(classifyCondition({ qualityScore: 25 } as any)).toBe('hatchling')
  })

  it('classifies egg for score < 20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('egg')
  })
})

// ─── classifyLairType ──────────────────────────────────────────────────────

describe('classifyLairType', () => {
  it('returns exposed for empty plates', () => {
    expect(classifyLairType([])).toBe('exposed')
  })

  it('returns mountain-fortress for high avg and enough ancients', () => {
    const lair = analyzeDragonLair([analyzeScalePlating(RICH, 'test.ts')], 'test')
    expect(lair.lairType).toBe('mountain-fortress')
  })

  it('returns cave-system for medium scores', () => {
    const plate = analyzeScalePlating(MEDIUM, 'test.ts')
    const lair = analyzeDragonLair([plate], 'test')
    expect(lair.lairType).toBe('cave-system')
  })

  it('returns cliff-nest for low-medium scores', () => {
    const plate = analyzeScalePlating(EMPTY, 'test.ts')
    const lair = analyzeDragonLair([plate], 'test')
    expect(lair.lairType).toBe('cliff-nest')
  })
})

// ─── analyzeDragonLair ─────────────────────────────────────────────────────

describe('analyzeDragonLair', () => {
  it('returns empty lair for no plates', () => {
    const lair = analyzeDragonLair([], 'empty-dir')
    expect(lair.directory).toBe('empty-dir')
    expect(lair.plates).toEqual([])
    expect(lair.avgArmor).toBe(0)
    expect(lair.avgWisdom).toBe(0)
    expect(lair.avgVitality).toBe(0)
    expect(lair.ancientCount).toBe(0)
    expect(lair.eggCount).toBe(0)
    expect(lair.armoredCount).toBe(0)
    expect(lair.wiseCount).toBe(0)
    expect(lair.lairType).toBe('exposed')
    expect(lair.condition).toBe('ruins')
  })

  it('computes correct lair aggregates', () => {
    const lair = analyzeDragonLair([analyzeScalePlating(RICH, 'a.ts')], 'dir')
    expect(lair.avgArmor).toBe(90)
    expect(lair.avgWisdom).toBe(90)
    expect(lair.avgVitality).toBe(90)
    expect(lair.ancientCount).toBe(1)
    expect(lair.armoredCount).toBe(1)
    expect(lair.wiseCount).toBe(1)
    expect(lair.condition).toBe('ancient-stronghold')
  })
})

// ─── classifyDragonlordGrade ───────────────────────────────────────────────

describe('classifyDragonlordGrade', () => {
  it('returns dragon-emperor for 80+', () => {
    expect(classifyDragonlordGrade(85)).toBe('dragon-emperor')
    expect(classifyDragonlordGrade(100)).toBe('dragon-emperor')
  })

  it('returns dragonlord for 65-79', () => {
    expect(classifyDragonlordGrade(70)).toBe('dragonlord')
  })

  it('returns dragonslayer for 50-64', () => {
    expect(classifyDragonlordGrade(55)).toBe('dragonslayer')
  })

  it('returns dragon-rider for 35-49', () => {
    expect(classifyDragonlordGrade(40)).toBe('dragon-rider')
  })

  it('returns squire for 20-34', () => {
    expect(classifyDragonlordGrade(25)).toBe('squire')
  })

  it('returns dragon-fodder for < 20', () => {
    expect(classifyDragonlordGrade(10)).toBe('dragon-fodder')
    expect(classifyDragonlordGrade(0)).toBe('dragon-fodder')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring code', () => {
    const result = buildDragonScaleResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations).toContain('Strengthen scale armor — add interfaces, types, and error handling for code protection')
    expect(result.recommendations).toContain('Increase fire breath — reduce any/eval and add documentation for code power')
    expect(result.recommendations).toContain('Extend wing span — improve exports and imports for wider code reach')
    expect(result.recommendations).toContain('Grow ancient wisdom — add abstractions and reduce impulsiveness in code')
    expect(result.recommendations).toContain('Enlarge treasure hoard — add valuable patterns and reduce console/debug code')
    expect(result.recommendations).toContain('Boost dragon vitality — add proper error handling and reduce code weakness')
  })

  it('returns empty recommendations for high-scoring code', () => {
    const result = buildDragonScaleResult(['rich.ts'], [RICH])
    expect(result.recommendations).toEqual([])
  })
})

// ─── buildDragonScaleResult ────────────────────────────────────────────────

describe('buildDragonScaleResult', () => {
  it('returns correct structure for mixed fixtures', () => {
    const result = buildDragonScaleResult(
      ['a/rich.ts', 'b/medium.ts', 'empty.ts'],
      [RICH, MEDIUM, EMPTY],
    )

    expect(result.plates).toHaveLength(3)
    expect(result.lairs).toHaveLength(3)

    expect(result.realm.overallDominance).toBe(60)
    expect(result.realm.isDominant).toBe(true)
    expect(result.realm.avgArmor).toBe(60)
    expect(result.realm.avgWisdom).toBe(60)
    expect(result.realm.avgVitality).toBe(60)

    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalLairs).toBe(3)
    expect(result.stats.avgScaleArmor).toBe(60)
    expect(result.stats.avgFireBreath).toBe(60)
    expect(result.stats.avgWingSpan).toBe(64)
    expect(result.stats.avgAncientWisdom).toBe(60)
    expect(result.stats.avgTreasureHoard).toBe(57)
    expect(result.stats.avgDragonVitality).toBe(60)
    expect(result.stats.ancientWyrmCount).toBe(1)
    expect(result.stats.youngDrakeCount).toBe(2)
    expect(result.stats.dragonlordGrade).toBe('dragonslayer')
    expect(result.stats.bestPlate).toBe('a/rich.ts')
    expect(result.stats.bestArmored).toBe('a/rich.ts')
    expect(result.stats.mostPowerful).toBe('a/rich.ts')
    expect(result.stats.widestReach).toBe('a/rich.ts')
    expect(result.stats.wisest).toBe('a/rich.ts')
    expect(result.stats.richest).toBe('a/rich.ts')
    expect(result.stats.hasHighArmorCount).toBe(1)
    expect(result.stats.hasHighBreathCount).toBe(1)
    expect(result.stats.hasHighSpanCount).toBe(1)
    expect(result.stats.hasHighLevelCount).toBe(1)
    expect(result.stats.hasHighHoardCount).toBe(1)
    expect(result.stats.hasHighVitalityCount).toBe(1)
  })

  it('returns dragon-emperor grade for high-scoring code', () => {
    const result = buildDragonScaleResult(['rich.ts'], [RICH])
    expect(result.stats.dragonlordGrade).toBe('dragon-emperor')
    expect(result.realm.overallDominance).toBe(92)
    expect(result.stats.overallDominance).toBe(92)
  })

  it('handles empty files array', () => {
    const result = buildDragonScaleResult([], [])
    expect(result.plates).toHaveLength(0)
    expect(result.lairs).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.avgScaleArmor).toBe(0)
    expect(result.stats.dragonlordGrade).toBe('dragon-fodder')
    expect(result.realm.isDominant).toBe(false)
  })

  it('groups files into lairs by directory', () => {
    const result = buildDragonScaleResult(
      ['a/f1.ts', 'a/f2.ts', 'b/f3.ts'],
      [RICH, RICH, MEDIUM],
    )
    expect(result.lairs).toHaveLength(2)
    const dirA = result.lairs.find((l) => l.directory === 'a')
    expect(dirA).toBeDefined()
    expect(dirA!.plates).toHaveLength(2)
    const dirB = result.lairs.find((l) => l.directory === 'b')
    expect(dirB).toBeDefined()
    expect(dirB!.plates).toHaveLength(1)
  })
})

// ─── formatDragonScaleJson ─────────────────────────────────────────────────

describe('formatDragonScaleJson', () => {
  it('returns valid JSON string', () => {
    const result = buildDragonScaleResult(['test.ts'], [RICH])
    const json = formatDragonScaleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.dragonlordGrade).toBe('dragon-emperor')
  })
})

// ─── formatDragonScaleTable ────────────────────────────────────────────────

describe('formatDragonScaleTable', () => {
  it('returns non-empty string for basic result', () => {
    const result = buildDragonScaleResult(['test.ts'], [MEDIUM])
    const table = formatDragonScaleTable(result, false)
    expect(table).toContain('Dragon Scale Analysis')
    expect(table).toContain('Total Files')
    expect(table).toContain('Dragonlord Grade')
  })

  it('includes per-file details when verbose', () => {
    const result = buildDragonScaleResult(['test.ts'], [RICH])
    const table = formatDragonScaleTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations when present', () => {
    const result = buildDragonScaleResult(['e1.ts', 'e2.ts', 'e3.ts', 'e4.ts'], ['', '', '', ''])
    const table = formatDragonScaleTable(result, false)
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

  it('armorGradeColor returns string for all grades', () => {
    const grades = ['adamantine-scale', 'dragon-steel', 'iron-scale', 'bronze-scale', 'leather-hide', 'naked']
    for (const g of grades) {
      expect(typeof armorGradeColor(g)).toBe('string')
    }
  })

  it('fireIntensityColor returns string for all intensities', () => {
    const intensities = ['inferno', 'dragonfire', 'blaze', 'flame', 'spark', 'smoke']
    for (const i of intensities) {
      expect(typeof fireIntensityColor(i)).toBe('string')
    }
  })

  it('wingCapabilityColor returns string for all capabilities', () => {
    const caps = ['cosmic-flight', 'stratospheric', 'high-altitude', 'cruising', 'gliding', 'grounded']
    for (const c of caps) {
      expect(typeof wingCapabilityColor(c)).toBe('string')
    }
  })

  it('wisdomAgeColor returns string for all ages', () => {
    const ages = ['ancient-wyrm', 'elder-dragon', 'adult-dragon', 'young-dragon', 'hatchling', 'egg']
    for (const a of ages) {
      expect(typeof wisdomAgeColor(a)).toBe('string')
    }
  })

  it('treasureQualityColor returns string for all qualities', () => {
    const quals = ['legendary-hoard', 'golden-treasure', 'silver-vault', 'copper-cache', 'pebbles', 'empty-cave']
    for (const q of quals) {
      expect(typeof treasureQualityColor(q)).toBe('string')
    }
  })

  it('vitalityHealthColor returns string for all healths', () => {
    const healths = ['undying', 'vigorous', 'healthy', 'ailing', 'weakened', 'dying']
    for (const h of healths) {
      expect(typeof vitalityHealthColor(h)).toBe('string')
    }
  })

  it('conditionColor returns string for all conditions', () => {
    const conditions = ['ancient-wyrm', 'elder-dragon', 'adult-dragon', 'young-drake', 'hatchling', 'egg']
    for (const c of conditions) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('dragonlordGradeColor returns string for all grades', () => {
    const grades = ['dragon-emperor', 'dragonlord', 'dragonslayer', 'dragon-rider', 'squire', 'dragon-fodder']
    for (const g of grades) {
      expect(typeof dragonlordGradeColor(g)).toBe('string')
    }
  })

  it('lairTypeColor returns string for all types', () => {
    const types = ['mountain-fortress', 'volcanic-lair', 'cave-system', 'cliff-nest', 'burrow', 'exposed']
    for (const t of types) {
      expect(typeof lairTypeColor(t)).toBe('string')
    }
  })

  it('lairConditionColor returns string for all conditions', () => {
    const conditions = ['ancient-stronghold', 'dragon-sanctum', 'secure-lair', 'modest-cave', 'exposed-den', 'ruins']
    for (const c of conditions) {
      expect(typeof lairConditionColor(c)).toBe('string')
    }
  })

  it('returns input string for unknown values', () => {
    expect(scoreColor(90)).toContain('90')
    expect(armorGradeColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
  })
})
