import { describe, expect, it } from 'vitest'
import {
  measureAbstract,
  measureIsolated,
  measurePure,
  measureScholarly,
  measureElevated,
  measureRisky,
  classifyCondition,
  classifyFloorType,
  classifyScholarGrade,
  classifyFloorCondition,
  analyzeTowerLevel,
  analyzeTowerFloor,
  generateRecommendations,
  buildIvoryTowerResult,
} from '../src/commands/ivory-tower-helpers.js'
import {
  scoreColor,
  abstractionLevelColor,
  autonomyColor,
  rigorColor,
  scholarshipColor,
  heightColor,
  dangerColor,
  conditionColor,
  gradeColor,
  floorTypeColor,
  floorConditionColor,
  formatIvoryTowerJson,
  formatIvoryTowerTable,
} from '../src/commands/ivory-tower-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY = ''

// ─── measureAbstract ───────────────────────────────────────────────────────

describe('measureAbstract', () => {
  it('returns correct score for RICH content', () => {
    const result = measureAbstract(RICH)
    expect(result.separation).toBe(59)
  })

  it('returns correct level for RICH content', () => {
    const result = measureAbstract(RICH)
    expect(result.level).toBe('proper-abstraction')
  })

  it('detects interfaces and types for proper abstraction', () => {
    const result = measureAbstract(RICH)
    expect(result.hasProperAbstraction).toBe(true)
  })

  it('detects clean exports with interfaces', () => {
    const result = measureAbstract(RICH)
    expect(result.hasClean).toBe(true)
  })

  it('detects intentional abstraction', () => {
    const result = measureAbstract(RICH)
    expect(result.hasIntentional).toBe(true)
  })

  it('detects valuable abstractions', () => {
    const result = measureAbstract(RICH)
    expect(result.hasValuable).toBe(true)
  })

  it('detects purposeful exports', () => {
    const result = measureAbstract(RICH)
    expect(result.hasPurposeful).toBe(true)
  })

  it('returns zero score for empty content', () => {
    const result = measureAbstract(EMPTY)
    expect(result.separation).toBe(0)
    expect(result.level).toBe('bedrock')
  })

  it('detects no over-abstraction in clean code', () => {
    const result = measureAbstract(RICH)
    expect(result.hasNoOverAbstraction).toBe(true)
    expect(result.overAbstractionCount).toBe(0)
  })

  it('detects speculative patterns with any', () => {
    const code = 'const x: any = getValue()'
    const result = measureAbstract(code)
    expect(result.hasNoSpeculative).toBe(false)
    expect(result.speculativeCount).toBe(1)
  })

  it('calculates MEDIUM abstraction score', () => {
    const result = measureAbstract(MEDIUM)
    expect(result.separation).toBe(7)
    expect(result.level).toBe('bedrock')
    expect(result.hasProperAbstraction).toBe(false)
  })
})

// ─── measureIsolated ───────────────────────────────────────────────────────

describe('measureIsolated', () => {
  it('returns correct independence score for RICH content', () => {
    const result = measureIsolated(RICH)
    expect(result.independence).toBe(87)
  })

  it('returns correct autonomy for RICH content', () => {
    const result = measureIsolated(RICH)
    expect(result.autonomy).toBe('self-sufficient')
  })

  it('detects high independence', () => {
    const result = measureIsolated(RICH)
    expect(result.hasHighIndependence).toBe(true)
  })

  it('detects self-contained code', () => {
    const result = measureIsolated(RICH)
    expect(result.hasSelfContained).toBe(true)
  })

  it('detects proper boundaries with exports and private', () => {
    const result = measureIsolated(RICH)
    expect(result.hasProperBoundaries).toBe(true)
  })

  it('detects no side effects in RICH content', () => {
    const result = measureIsolated(RICH)
    expect(result.hasNoSideEffects).toBe(true)
    expect(result.sideEffectCount).toBe(0)
  })

  it('detects encapsulation with private', () => {
    const result = measureIsolated(RICH)
    expect(result.hasEncapsulated).toBe(true)
  })

  it('detects no external leaks', () => {
    const result = measureIsolated(RICH)
    expect(result.hasNoExternalLeaks).toBe(true)
    expect(result.leakCount).toBe(0)
  })

  it('detects side effects in MEDIUM content', () => {
    const result = measureIsolated(MEDIUM)
    expect(result.hasNoSideEffects).toBe(false)
    expect(result.sideEffectCount).toBe(1)
  })

  it('returns low scores for empty content', () => {
    const result = measureIsolated(EMPTY)
    expect(result.independence).toBe(0)
    expect(result.autonomy).toBe('entangled')
  })
})

// ─── measurePure ───────────────────────────────────────────────────────────

describe('measurePure', () => {
  it('returns correct correctness score for RICH content', () => {
    const result = measurePure(RICH)
    expect(result.correctness).toBe(69)
  })

  it('returns correct rigor for RICH content', () => {
    const result = measurePure(RICH)
    expect(result.rigor).toBe('formal-verification')
  })

  it('detects type safety', () => {
    const result = measurePure(RICH)
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects proper types', () => {
    const result = measurePure(RICH)
    expect(result.hasProperTypes).toBe(true)
  })

  it('detects no any usage', () => {
    const result = measurePure(RICH)
    expect(result.hasNoAny).toBe(true)
  })

  it('detects immutable patterns', () => {
    const result = measurePure(RICH)
    expect(result.hasImmutable).toBe(true)
  })

  it('detects no mutations', () => {
    const result = measurePure(RICH)
    expect(result.hasNoMutations).toBe(true)
    expect(result.mutationCount).toBe(0)
  })

  it('detects pure code without side effects', () => {
    const result = measurePure(RICH)
    expect(result.hasPure).toBe(true)
  })

  it('detects no type casts', () => {
    const result = measurePure(RICH)
    expect(result.hasNoTypeCasts).toBe(true)
    expect(result.typeCastCount).toBe(0)
  })

  it('detects no impurities', () => {
    const result = measurePure(RICH)
    expect(result.hasNoImpurities).toBe(true)
  })

  it('returns zero for empty content', () => {
    const result = measurePure(EMPTY)
    expect(result.correctness).toBe(0)
    expect(result.rigor).toBe('guessed')
  })

  it('detects mutations with let/var', () => {
    const code = 'let x = 1; var y = 2;'
    const result = measurePure(code)
    expect(result.mutationCount).toBe(2)
    expect(result.hasNoMutations).toBe(false)
  })
})

// ─── measureScholarly ──────────────────────────────────────────────────────

describe('measureScholarly', () => {
  it('returns correct depth for RICH content', () => {
    const result = measureScholarly(RICH)
    expect(result.depth).toBe(36)
  })

  it('returns correct scholarship level for RICH content', () => {
    const result = measureScholarly(RICH)
    expect(result.scholarship).toBe('lecture-notes')
  })

  it('detects JSDoc comments', () => {
    const result = measureScholarly(RICH)
    expect(result.hasJSDoc).toBe(true)
  })

  it('detects no undocumented markers', () => {
    const result = measureScholarly(RICH)
    expect(result.hasNoUndocumented).toBe(true)
    expect(result.undocumentedCount).toBe(0)
  })

  it('detects explained code', () => {
    const result = measureScholarly(RICH)
    expect(result.hasExplained).toBe(true)
  })

  it('detects no mystery patterns', () => {
    const result = measureScholarly(RICH)
    expect(result.hasNoMystery).toBe(true)
    expect(result.mysteryCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureScholarly(EMPTY)
    expect(result.depth).toBe(0)
    expect(result.scholarship).toBe('no-documentation')
  })

  it('detects TODO as undocumented', () => {
    const code = '// TODO: fix this'
    const result = measureScholarly(code)
    expect(result.hasNoUndocumented).toBe(false)
    expect(result.undocumentedCount).toBe(1)
  })

  it('detects thorough docs with param and return', () => {
    const code = `/**
 * @param x - value
 * @returns result
 */`
    const result = measureScholarly(code)
    expect(result.hasThoroughDocs).toBe(true)
  })
})

// ─── measureElevated ───────────────────────────────────────────────────────

describe('measureElevated', () => {
  it('returns correct level for RICH content', () => {
    const result = measureElevated(RICH)
    expect(result.level).toBe(39)
  })

  it('returns correct height for RICH content', () => {
    const result = measureElevated(RICH)
    expect(result.height).toBe('ground-level')
  })

  it('detects layered structure with interfaces and classes', () => {
    const result = measureElevated(RICH)
    expect(result.hasLayered).toBe(true)
  })

  it('detects structured code', () => {
    const result = measureElevated(RICH)
    expect(result.hasStructured).toBe(true)
  })

  it('detects abstracted code with generics', () => {
    const result = measureElevated(RICH)
    expect(result.hasAbstracted).toBe(true)
  })

  it('detects no flatness', () => {
    const result = measureElevated(RICH)
    expect(result.hasNoFlatness).toBe(true)
    expect(result.flatnessCount).toBe(0)
  })

  it('detects no tanglement', () => {
    const result = measureElevated(RICH)
    expect(result.hasNoTanglement).toBe(true)
    expect(result.tanglementCount).toBe(0)
  })

  it('returns zero for empty content', () => {
    const result = measureElevated(EMPTY)
    expect(result.level).toBe(0)
    expect(result.height).toBe('subterranean')
  })

  it('detects proper hierarchy with extends', () => {
    const code = 'class Dog extends Animal {}'
    const result = measureElevated(code)
    expect(result.hasProperHierarchy).toBe(true)
  })
})

// ─── measureRisky ──────────────────────────────────────────────────────────

describe('measureRisky', () => {
  it('returns correct disconnect for RICH content', () => {
    const result = measureRisky(RICH)
    expect(result.disconnect).toBe(25)
  })

  it('returns correct danger for RICH content', () => {
    const result = measureRisky(RICH)
    expect(result.danger).toBe('minor-ivory')
  })

  it('detects practical code with error handling', () => {
    const result = measureRisky(RICH)
    expect(result.hasPractical).toBe(true)
  })

  it('detects real-world code with exports and functions', () => {
    const result = measureRisky(RICH)
    expect(result.hasRealWorld).toBe(true)
  })

  it('detects useful code', () => {
    const result = measureRisky(RICH)
    expect(result.hasUseful).toBe(true)
  })

  it('detects no over-engineering', () => {
    const result = measureRisky(RICH)
    expect(result.hasNoOverEngineering).toBe(true)
    expect(result.overEngineeringCount).toBe(0)
  })

  it('detects missing tests in RICH content', () => {
    const result = measureRisky(RICH)
    expect(result.hasTested).toBe(false)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects high disconnect for MEDIUM content', () => {
    const result = measureRisky(MEDIUM)
    expect(result.disconnect).toBe(95)
    expect(result.danger).toBe('cloud-cuckoo')
    expect(result.hasHighDisconnect).toBe(true)
  })

  it('returns high risk for empty content', () => {
    const result = measureRisky(EMPTY)
    expect(result.disconnect).toBe(92)
    expect(result.hasHighDisconnect).toBe(true)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies enlightened-tower at 90+', () => {
    expect(classifyCondition(90)).toBe('enlightened-tower')
    expect(classifyCondition(95)).toBe('enlightened-tower')
  })

  it('classifies scholarly-retreat at 75-89', () => {
    expect(classifyCondition(75)).toBe('scholarly-retreat')
    expect(classifyCondition(89)).toBe('scholarly-retreat')
  })

  it('classifies balanced-observatory at 60-74', () => {
    expect(classifyCondition(60)).toBe('balanced-observatory')
    expect(classifyCondition(74)).toBe('balanced-observatory')
  })

  it('classifies ivory-isolation at 45-59', () => {
    expect(classifyCondition(45)).toBe('ivory-isolation')
    expect(classifyCondition(59)).toBe('ivory-isolation')
  })

  it('classifies disconnected-spire at 30-44', () => {
    expect(classifyCondition(30)).toBe('disconnected-spire')
    expect(classifyCondition(44)).toBe('disconnected-spire')
  })

  it('classifies ruined-tower below 30', () => {
    expect(classifyCondition(0)).toBe('ruined-tower')
    expect(classifyCondition(29)).toBe('ruined-tower')
  })
})

// ─── classifyFloorType ─────────────────────────────────────────────────────

describe('classifyFloorType', () => {
  it('returns empty-room for empty levels', () => {
    expect(classifyFloorType([])).toBe('empty-room')
  })

  it('returns correct floor type for mixed quality levels', () => {
    const rich = analyzeTowerLevel(RICH, 'rich.ts')
    const medium = analyzeTowerLevel(MEDIUM, 'medium.ts')
    const result = classifyFloorType([rich, medium])
    expect(result).toBe('closet-office')
  })
})

// ─── classifyScholarGrade ──────────────────────────────────────────────────

describe('classifyScholarGrade', () => {
  it('classifies nobel-laureate at 80+', () => {
    expect(classifyScholarGrade(80)).toBe('nobel-laureate')
  })

  it('classifies full-professor at 65-79', () => {
    expect(classifyScholarGrade(65)).toBe('full-professor')
  })

  it('classifies associate-professor at 50-64', () => {
    expect(classifyScholarGrade(50)).toBe('associate-professor')
  })

  it('classifies adjunct at 35-49', () => {
    expect(classifyScholarGrade(35)).toBe('adjunct')
  })

  it('classifies teaching-assistant at 20-34', () => {
    expect(classifyScholarGrade(20)).toBe('teaching-assistant')
  })

  it('classifies undergraduate below 20', () => {
    expect(classifyScholarGrade(0)).toBe('undergraduate')
    expect(classifyScholarGrade(19)).toBe('undergraduate')
  })
})

// ─── classifyFloorCondition ────────────────────────────────────────────────

describe('classifyFloorCondition', () => {
  it('classifies tower-of-wisdom at 80+', () => {
    expect(classifyFloorCondition(80)).toBe('tower-of-wisdom')
  })

  it('classifies center-of-learning at 65-79', () => {
    expect(classifyFloorCondition(65)).toBe('center-of-learning')
  })

  it('classifies proper-institution at 50-64', () => {
    expect(classifyFloorCondition(50)).toBe('proper-institution')
  })

  it('classifies struggling-academy at 35-49', () => {
    expect(classifyFloorCondition(35)).toBe('struggling-academy')
  })

  it('classifies crumbling-tower at 20-34', () => {
    expect(classifyFloorCondition(20)).toBe('crumbling-tower')
  })

  it('classifies ruins below 20', () => {
    expect(classifyFloorCondition(0)).toBe('ruins')
  })
})

// ─── analyzeTowerLevel ─────────────────────────────────────────────────────

describe('analyzeTowerLevel', () => {
  it('returns correct values for RICH content', () => {
    const result = analyzeTowerLevel(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.abstraction).toBe(59)
    expect(result.isolation).toBe(87)
    expect(result.theoreticalPurity).toBe(69)
    expect(result.scholarlyDepth).toBe(36)
    expect(result.elevation).toBe(39)
    expect(result.isolationRisk).toBe(25)
    expect(result.qualityScore).toBe(60)
    expect(result.condition).toBe('balanced-observatory')
  })

  it('returns correct values for MEDIUM content', () => {
    const result = analyzeTowerLevel(MEDIUM, 'medium.ts')
    expect(result.abstraction).toBe(7)
    expect(result.isolation).toBe(8)
    expect(result.theoreticalPurity).toBe(0)
    expect(result.scholarlyDepth).toBe(0)
    expect(result.elevation).toBe(0)
    expect(result.isolationRisk).toBe(95)
    expect(result.qualityScore).toBe(3)
    expect(result.condition).toBe('ruined-tower')
  })

  it('returns correct values for EMPTY content', () => {
    const result = analyzeTowerLevel(EMPTY, 'empty.ts')
    expect(result.abstraction).toBe(0)
    expect(result.isolation).toBe(0)
    expect(result.theoreticalPurity).toBe(0)
    expect(result.scholarlyDepth).toBe(0)
    expect(result.elevation).toBe(0)
    expect(result.isolationRisk).toBe(92)
    expect(result.qualityScore).toBe(1)
    expect(result.condition).toBe('ruined-tower')
  })

  it('includes all measure objects', () => {
    const result = analyzeTowerLevel(RICH, 'rich.ts')
    expect(result.abstract).toBeDefined()
    expect(result.isolated).toBeDefined()
    expect(result.pure).toBeDefined()
    expect(result.scholarly).toBeDefined()
    expect(result.elevated).toBeDefined()
    expect(result.risky).toBeDefined()
  })
})

// ─── analyzeTowerFloor ─────────────────────────────────────────────────────

describe('analyzeTowerFloor', () => {
  it('returns empty floor for no levels', () => {
    const result = analyzeTowerFloor([], '.')
    expect(result.directory).toBe('.')
    expect(result.levels).toEqual([])
    expect(result.floorType).toBe('empty-room')
    expect(result.condition).toBe('ruins')
  })

  it('returns correct floor for RICH+MEDIUM levels', () => {
    const rich = analyzeTowerLevel(RICH, 'rich.ts')
    const medium = analyzeTowerLevel(MEDIUM, 'medium.ts')
    const result = analyzeTowerFloor([rich, medium], '.')
    expect(result.avgAbstraction).toBe(33)
    expect(result.avgPurity).toBe(35)
    expect(result.avgScholarly).toBe(18)
    expect(result.enlightenedCount).toBe(0)
    expect(result.balancedCount).toBe(1)
    expect(result.ruinedCount).toBe(1)
    expect(result.floorType).toBe('closet-office')
    expect(result.condition).toBe('crumbling-tower')
  })
})

// ─── buildIvoryTowerResult ─────────────────────────────────────────────────

describe('buildIvoryTowerResult', () => {
  it('returns correct stats for RICH+MEDIUM', () => {
    const result = buildIvoryTowerResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalFloors).toBe(1)
    expect(result.stats.avgAbstraction).toBe(33)
    expect(result.stats.avgIsolation).toBe(48)
    expect(result.stats.avgTheoreticalPurity).toBe(35)
    expect(result.stats.avgScholarlyDepth).toBe(18)
    expect(result.stats.avgElevation).toBe(20)
    expect(result.stats.avgIsolationRisk).toBe(60)
    expect(result.stats.balancedObservatoryCount).toBe(1)
    expect(result.stats.ruinedTowerCount).toBe(1)
    expect(result.stats.overallElevation).toBe(32)
    expect(result.stats.scholarGrade).toBe('teaching-assistant')
  })

  it('returns correct best/worst files', () => {
    const result = buildIvoryTowerResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestLevel).toBe('rich.ts')
    expect(result.stats.mostAbstract).toBe('rich.ts')
    expect(result.stats.mostIndependent).toBe('rich.ts')
    expect(result.stats.mostPure).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.mostElevated).toBe('rich.ts')
  })

  it('returns correct high-counts', () => {
    const result = buildIvoryTowerResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighSeparationCount).toBe(0)
    expect(result.stats.hasHighIndependenceCount).toBe(1)
    expect(result.stats.hasHighCorrectnessCount).toBe(0)
    expect(result.stats.hasHighDepthCount).toBe(0)
    expect(result.stats.hasHighLevelCount).toBe(0)
    expect(result.stats.hasHighDisconnectCount).toBe(1)
  })

  it('returns correct campus data', () => {
    const result = buildIvoryTowerResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.campus.avgAbstraction).toBe(33)
    expect(result.campus.avgPurity).toBe(35)
    expect(result.campus.avgScholarly).toBe(18)
    expect(result.campus.isEnlightened).toBe(false)
    expect(result.campus.overallElevation).toBe(32)
  })

  it('returns recommendations', () => {
    const result = buildIvoryTowerResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildIvoryTowerResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.levels).toEqual([])
    expect(result.campus.overallElevation).toBe(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low-scoring code', () => {
    const levels = [analyzeTowerLevel(MEDIUM, 'medium.ts')]
    const floor = analyzeTowerFloor(levels, '.')
    const campus = { avgAbstraction: 7, avgPurity: 0, avgScholarly: 0, isEnlightened: false, overallElevation: 3 }
    const stats = buildIvoryTowerResult(['medium.ts'], [MEDIUM]).stats
    const recs = generateRecommendations(levels, [floor], campus, stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns positive message for excellent code', () => {
    const levels = [analyzeTowerLevel(RICH, 'rich.ts')]
    const floor = analyzeTowerFloor(levels, '.')
    const campus = { avgAbstraction: 80, avgPurity: 80, avgScholarly: 80, isEnlightened: true, overallElevation: 90 }
    const stats = {
      ...buildIvoryTowerResult(['rich.ts'], [RICH]).stats,
      avgAbstraction: 80,
      avgIsolation: 80,
      avgTheoreticalPurity: 80,
      avgScholarlyDepth: 80,
      avgElevation: 80,
      avgIsolationRisk: 10,
      ruinedTowerCount: 0,
    }
    const recs = generateRecommendations(levels, [floor], campus, stats)
    expect(recs).toContain('Code tower quality is excellent — maintain current scholarly standards')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('format helpers', () => {
  it('scoreColor returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(60)).toBe('string')
    expect(typeof scoreColor(40)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('abstractionLevelColor handles all levels', () => {
    expect(typeof abstractionLevelColor('transcendent')).toBe('string')
    expect(typeof abstractionLevelColor('elevated')).toBe('string')
    expect(typeof abstractionLevelColor('proper-abstraction')).toBe('string')
    expect(typeof abstractionLevelColor('grounded')).toBe('string')
    expect(typeof abstractionLevelColor('earthy')).toBe('string')
    expect(typeof abstractionLevelColor('bedrock')).toBe('string')
  })

  it('autonomyColor handles all autonomies', () => {
    expect(typeof autonomyColor('self-sufficient')).toBe('string')
    expect(typeof autonomyColor('largely-independent')).toBe('string')
    expect(typeof autonomyColor('properly-coupled')).toBe('string')
    expect(typeof autonomyColor('somewhat-dependent')).toBe('string')
    expect(typeof autonomyColor('tightly-coupled')).toBe('string')
    expect(typeof autonomyColor('entangled')).toBe('string')
  })

  it('rigorColor handles all rigors', () => {
    expect(typeof rigorColor('mathematical-proof')).toBe('string')
    expect(typeof rigorColor('formal-verification')).toBe('string')
    expect(typeof rigorColor('well-reasoned')).toBe('string')
    expect(typeof rigorColor('plausible')).toBe('string')
    expect(typeof rigorColor('approximate')).toBe('string')
    expect(typeof rigorColor('guessed')).toBe('string')
  })

  it('scholarshipColor handles all scholarships', () => {
    expect(typeof scholarshipColor('doctoral-thesis')).toBe('string')
    expect(typeof scholarshipColor('research-paper')).toBe('string')
    expect(typeof scholarshipColor('textbook')).toBe('string')
    expect(typeof scholarshipColor('lecture-notes')).toBe('string')
    expect(typeof scholarshipColor('readme')).toBe('string')
    expect(typeof scholarshipColor('no-documentation')).toBe('string')
  })

  it('heightColor handles all heights', () => {
    expect(typeof heightColor('stratospheric')).toBe('string')
    expect(typeof heightColor('high-altitude')).toBe('string')
    expect(typeof heightColor('proper-elevation')).toBe('string')
    expect(typeof heightColor('ground-level')).toBe('string')
    expect(typeof heightColor('basement')).toBe('string')
    expect(typeof heightColor('subterranean')).toBe('string')
  })

  it('dangerColor handles all dangers', () => {
    expect(typeof dangerColor('pragmatic-balance')).toBe('string')
    expect(typeof dangerColor('minor-ivory')).toBe('string')
    expect(typeof dangerColor('moderate-tower')).toBe('string')
    expect(typeof dangerColor('significant-tower')).toBe('string')
    expect(typeof dangerColor('ivory-fortress')).toBe('string')
    expect(typeof dangerColor('cloud-cuckoo')).toBe('string')
  })

  it('conditionColor handles all conditions', () => {
    expect(typeof conditionColor('enlightened-tower')).toBe('string')
    expect(typeof conditionColor('scholarly-retreat')).toBe('string')
    expect(typeof conditionColor('balanced-observatory')).toBe('string')
    expect(typeof conditionColor('ivory-isolation')).toBe('string')
    expect(typeof conditionColor('disconnected-spire')).toBe('string')
    expect(typeof conditionColor('ruined-tower')).toBe('string')
  })

  it('gradeColor handles all grades', () => {
    expect(typeof gradeColor('nobel-laureate')).toBe('string')
    expect(typeof gradeColor('full-professor')).toBe('string')
    expect(typeof gradeColor('associate-professor')).toBe('string')
    expect(typeof gradeColor('adjunct')).toBe('string')
    expect(typeof gradeColor('teaching-assistant')).toBe('string')
    expect(typeof gradeColor('undergraduate')).toBe('string')
  })

  it('floorTypeColor handles all floor types', () => {
    expect(typeof floorTypeColor('grand-university')).toBe('string')
    expect(typeof floorTypeColor('research-institute')).toBe('string')
    expect(typeof floorTypeColor('think-tank')).toBe('string')
    expect(typeof floorTypeColor('study-room')).toBe('string')
    expect(typeof floorTypeColor('closet-office')).toBe('string')
    expect(typeof floorTypeColor('empty-room')).toBe('string')
  })

  it('floorConditionColor handles all floor conditions', () => {
    expect(typeof floorConditionColor('tower-of-wisdom')).toBe('string')
    expect(typeof floorConditionColor('center-of-learning')).toBe('string')
    expect(typeof floorConditionColor('proper-institution')).toBe('string')
    expect(typeof floorConditionColor('struggling-academy')).toBe('string')
    expect(typeof floorConditionColor('crumbling-tower')).toBe('string')
    expect(typeof floorConditionColor('ruins')).toBe('string')
  })

  it('formatIvoryTowerJson returns valid JSON', () => {
    const result = buildIvoryTowerResult(['rich.ts'], [RICH])
    const json = formatIvoryTowerJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('formatIvoryTowerTable returns string with header', () => {
    const result = buildIvoryTowerResult(['rich.ts'], [RICH])
    const table = formatIvoryTowerTable(result, false)
    expect(table).toContain('Ivory Tower Analysis')
    expect(table).toContain('Campus Overview')
    expect(table).toContain('Statistics')
  })

  it('formatIvoryTowerTable includes per-file details when verbose', () => {
    const result = buildIvoryTowerResult(['rich.ts'], [RICH])
    const table = formatIvoryTowerTable(result, true)
    expect(table).toContain('Per-File Levels')
    expect(table).toContain('rich.ts')
  })

  it('formatIvoryTowerTable includes recommendations', () => {
    const result = buildIvoryTowerResult(['medium.ts'], [MEDIUM])
    const table = formatIvoryTowerTable(result, false)
    expect(table).toContain('Recommendations')
  })

  it('color helpers return input for unknown values', () => {
    expect(abstractionLevelColor('unknown')).toBe('unknown')
    expect(autonomyColor('unknown')).toBe('unknown')
    expect(rigorColor('unknown')).toBe('unknown')
    expect(scholarshipColor('unknown')).toBe('unknown')
    expect(heightColor('unknown')).toBe('unknown')
    expect(dangerColor('unknown')).toBe('unknown')
    expect(conditionColor('unknown')).toBe('unknown')
    expect(gradeColor('unknown')).toBe('unknown')
    expect(floorTypeColor('unknown')).toBe('unknown')
    expect(floorConditionColor('unknown')).toBe('unknown')
  })
})
