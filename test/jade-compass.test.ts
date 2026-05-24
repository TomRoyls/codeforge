import { describe, it, expect } from 'vitest'
import {
  measureOrienting,
  measureCalibrating,
  measureNavigating,
  measureBalancing,
  measureSteadying,
  classifyNeedleCondition,
  classifyRoseType,
  classifyRoseCondition,
  classifyNavigatorGrade,
  analyzeJadeNeedle,
  analyzeCompassRose,
  buildJadeCompassResult,
  generateRecommendations,
} from '../src/commands/jade-compass-helpers.js'
import {
  colorScore,
  colorGrade,
  formatNeedleTable,
  formatNeedlesTable,
  formatRoseTable,
  formatRosesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-compass-format-helpers.js'
import type { JadeNeedle, JadeCompassStats, JadeFleet, CompassRose } from '../src/commands/jade-compass-helpers.js'

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
  email?: string
}

export enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

export type Status = 'active' | 'inactive' | 'pending'

export class UserService<T extends UserConfig> {
  private users: T[] = []

  async addUser(user: T): Promise<void> {
    try {
      this.users.push(user)
    } catch (error) {
      throw new Error('Failed to add user')
    }
  }

  getUser(id: string): T | undefined {
    return this.users.find(u => u.name === id)
  }
}

export function processUsers<T>(items: T[], fn: (item: T) => boolean): T[] {
  return items.filter(fn).map(item => item)
}

const config: Config = {
  name: 'test',
  version: 1,
}

export default config
`

// ─── measureOrienting ──────────────────────────────────────────────

describe('measureOrienting', () => {
  it('returns 0 for empty content', () => {
    const m = measureOrienting(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('no-direction')
    expect(m.hasHighClarity).toBe(false)
  })

  it('measures minimal content with const', () => {
    const m = measureOrienting(minimalContent)
    expect(m.clarity).toBe(6)
    expect(m.grade).toBe('no-direction')
  })

  it('detects clear purpose', () => {
    const m = measureOrienting(richContent)
    expect(m.hasClearPurpose).toBe(true)
  })

  it('detects single responsibility', () => {
    const m = measureOrienting(richContent)
    expect(m.hasSingleResponsibility).toBe(true)
  })

  it('detects focused code', () => {
    const m = measureOrienting(richContent)
    expect(m.hasFocused).toBe(true)
  })

  it('detects intentional code', () => {
    const m = measureOrienting(richContent)
    expect(m.hasIntentional).toBe(true)
  })

  it('counts mixed concerns', () => {
    const m = measureOrienting('var x = 1; var y = 2')
    expect(m.mixedConcernsCount).toBe(2)
    expect(m.hasNoMixedConcerns).toBe(false)
  })

  it('counts scattered patterns', () => {
    const m = measureOrienting('const x: any = 1')
    expect(m.scatteredCount).toBe(1)
    expect(m.hasNoScattered).toBe(false)
  })

  it('detects random code', () => {
    const m = measureOrienting('eval("x")')
    expect(m.hasNoRandom).toBe(false)
  })

  it('detects overreach', () => {
    const m = measureOrienting('debugger')
    expect(m.hasNoOverreach).toBe(false)
  })

  it('detects high clarity', () => {
    const m = measureOrienting(richContent)
    expect(m.hasHighClarity).toBe(true)
  })

  it('returns true-north for high scores', () => {
    const m = measureOrienting(richContent)
    expect(['true-north', 'clear-bearing']).toContain(m.grade)
  })
})

// ─── measureCalibrating ────────────────────────────────────────────

describe('measureCalibrating', () => {
  it('returns 0 for empty content', () => {
    const m = measureCalibrating(emptyContent)
    expect(m.accuracy).toBe(0)
    expect(m.bearing).toBe('no-bearing')
    expect(m.hasHighAccuracy).toBe(false)
  })

  it('detects precise code', () => {
    const m = measureCalibrating(richContent)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects exact code', () => {
    const m = measureCalibrating(richContent)
    expect(m.hasExact).toBe(true)
  })

  it('counts approximate patterns', () => {
    const m = measureCalibrating('var x = 1')
    expect(m.approximateCount).toBe(1)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('counts sloppy patterns', () => {
    const m = measureCalibrating('const x: any = 1')
    expect(m.sloppyCount).toBe(1)
    expect(m.hasNoAlmostRight).toBe(false)
  })

  it('detects sloppy code', () => {
    const m = measureCalibrating('eval("x")')
    expect(m.hasNoSloppy).toBe(false)
  })

  it('detects vague code', () => {
    const m = measureCalibrating('debugger')
    expect(m.hasNoVague).toBe(false)
  })

  it('detects correct patterns with conditionals and try-catch', () => {
    const m = measureCalibrating('if (x) {} try {} catch(e) {}')
    expect(m.hasCorrect).toBe(true)
  })

  it('detects sharp patterns', () => {
    const m = measureCalibrating(richContent)
    expect(m.hasSharp).toBe(true)
  })

  it('returns correct bearing grade', () => {
    const m = measureCalibrating(richContent)
    expect(['laser-precision', 'accurate-bearing']).toContain(m.bearing)
  })
})

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns 0 for empty content', () => {
    const m = measureNavigating(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.navigation).toBe('no-map')
    expect(m.hasHighQuality).toBe(false)
  })

  it('detects readable code', () => {
    const m = measureNavigating(richContent)
    expect(m.hasReadable).toBe(true)
  })

  it('detects well-structured code', () => {
    const m = measureNavigating(richContent)
    expect(m.hasWellStructured).toBe(true)
  })

  it('counts obfuscated patterns', () => {
    const m = measureNavigating('var x = 1')
    expect(m.obfuscatedCount).toBe(1)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('counts hidden patterns', () => {
    const m = measureNavigating('const x: any = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects chaotic code', () => {
    const m = measureNavigating('eval("x")')
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects buried code', () => {
    const m = measureNavigating('debugger')
    expect(m.hasNoBuried).toBe(false)
  })

  it('detects searchable code', () => {
    const m = measureNavigating(richContent)
    expect(m.hasSearchable).toBe(true)
  })

  it('detects organized code', () => {
    const m = measureNavigating(richContent)
    expect(m.hasOrganized).toBe(true)
  })

  it('returns correct navigation grade', () => {
    const m = measureNavigating(richContent)
    expect(['charted-waters', 'clear-map']).toContain(m.navigation)
  })
})

// ─── measureBalancing ──────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns 0 for empty content', () => {
    const m = measureBalancing(emptyContent)
    expect(m.balance).toBe(0)
    expect(m.cardinal).toBe('no-balance')
    expect(m.hasHighBalance).toBe(false)
  })

  it('detects even distribution', () => {
    const m = measureBalancing(richContent)
    expect(m.hasEvenDistribution).toBe(true)
  })

  it('detects proportional code', () => {
    const m = measureBalancing(richContent)
    expect(m.hasProportional).toBe(true)
  })

  it('counts god functions', () => {
    const m = measureBalancing('var x = 1')
    expect(m.godFunctionCount).toBe(1)
  })

  it('counts overweight patterns', () => {
    const m = measureBalancing('const x: any = 1')
    expect(m.overweightCount).toBe(1)
  })

  it('detects giant code', () => {
    const m = measureBalancing('eval("x")')
    expect(m.hasNoGiant).toBe(false)
  })

  it('detects resource hoarding', () => {
    const m = measureBalancing('debugger')
    expect(m.hasNoResourceHoarding).toBe(false)
  })

  it('detects fair allocation', () => {
    const m = measureBalancing(richContent)
    expect(m.hasFairAllocation).toBe(true)
  })

  it('detects reasonable code', () => {
    const m = measureBalancing(richContent)
    expect(m.hasReasonable).toBe(true)
  })

  it('detects no extreme patterns', () => {
    const m = measureBalancing(richContent)
    expect(m.hasNoExtreme).toBe(true)
  })

  it('returns correct cardinal grade', () => {
    const m = measureBalancing(richContent)
    expect(['perfect-balance', 'proper-equilibrium']).toContain(m.cardinal)
  })
})

// ─── measureSteadying ──────────────────────────────────────────────

describe('measureSteadying', () => {
  it('returns 0 for empty content', () => {
    const m = measureSteadying(emptyContent)
    expect(m.steadiness).toBe(0)
    expect(m.needle).toBe('no-needle')
    expect(m.hasHighSteadiness).toBe(false)
  })

  it('detects consistent code', () => {
    const m = measureSteadying(richContent)
    expect(m.hasConsistent).toBe(true)
  })

  it('detects uniform style', () => {
    const m = measureSteadying(richContent)
    expect(m.hasUniformStyle).toBe(true)
  })

  it('counts mixed patterns', () => {
    const m = measureSteadying('var x = 1')
    expect(m.mixedCount).toBe(1)
    expect(m.hasNoMixed).toBe(false)
  })

  it('counts surprising patterns', () => {
    const m = measureSteadying('const x: any = 1')
    expect(m.surprisingCount).toBe(1)
    expect(m.hasNoSurprising).toBe(false)
  })

  it('detects volatile code', () => {
    const m = measureSteadying('eval("x")')
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects flaky code', () => {
    const m = measureSteadying('debugger')
    expect(m.hasNoFlaky).toBe(false)
  })

  it('detects predictable code', () => {
    const m = measureSteadying(richContent)
    expect(m.hasPredictable).toBe(true)
  })

  it('detects stable code', () => {
    const m = measureSteadying(richContent)
    expect(m.hasStable).toBe(true)
  })

  it('returns correct needle grade', () => {
    const m = measureSteadying(richContent)
    expect(['rock-steady', 'stable-compass']).toContain(m.needle)
  })
})

// ─── classifyNeedleCondition ───────────────────────────────────────

describe('classifyNeedleCondition', () => {
  it('classifies master-compass', () => { expect(classifyNeedleCondition(90)).toBe('master-compass') })
  it('classifies jade-sextant', () => { expect(classifyNeedleCondition(75)).toBe('jade-sextant') })
  it('classifies proper-compass', () => { expect(classifyNeedleCondition(60)).toBe('proper-compass') })
  it('classifies rusty-needle', () => { expect(classifyNeedleCondition(45)).toBe('rusty-needle') })
  it('classifies broken-compass', () => { expect(classifyNeedleCondition(30)).toBe('broken-compass') })
  it('classifies stone', () => { expect(classifyNeedleCondition(10)).toBe('stone') })
})

// ─── classifyRoseType ──────────────────────────────────────────────

describe('classifyRoseType', () => {
  it('returns no-rose for empty needles', () => {
    expect(classifyRoseType([])).toBe('no-rose')
  })

  it('returns grand-compass-rose for high-quality', () => {
    const needles = [
      { qualityScore: 90, condition: 'master-compass' } as JadeNeedle,
      { qualityScore: 88, condition: 'master-compass' } as JadeNeedle,
    ]
    expect(classifyRoseType(needles)).toBe('grand-compass-rose')
  })

  it('returns proper-rose for moderate quality', () => {
    const needles = [{ qualityScore: 65, condition: 'jade-sextant' } as JadeNeedle]
    expect(classifyRoseType(needles)).toBe('proper-rose')
  })

  it('returns decent-cardinal for mid quality', () => {
    const needles = [{ qualityScore: 50, condition: 'proper-compass' } as JadeNeedle]
    expect(classifyRoseType(needles)).toBe('decent-cardinal')
  })

  it('returns scratched-circle for very low quality', () => {
    const needles = [{ qualityScore: 18, condition: 'broken-compass' } as JadeNeedle]
    expect(classifyRoseType(needles)).toBe('scratched-circle')
  })

  it('returns no-rose for near-zero quality', () => {
    const needles = [{ qualityScore: 5, condition: 'stone' } as JadeNeedle]
    expect(classifyRoseType(needles)).toBe('no-rose')
  })
})

// ─── classifyRoseCondition ─────────────────────────────────────────

describe('classifyRoseCondition', () => {
  it('classifies navigation-masterpiece', () => { expect(classifyRoseCondition(80)).toBe('navigation-masterpiece') })
  it('classifies reliable-compass', () => { expect(classifyRoseCondition(65)).toBe('reliable-compass') })
  it('classifies decent-guide', () => { expect(classifyRoseCondition(50)).toBe('decent-guide') })
  it('classifies unreliable-needle', () => { expect(classifyRoseCondition(35)).toBe('unreliable-needle') })
  it('classifies broken-device', () => { expect(classifyRoseCondition(20)).toBe('broken-device') })
  it('classifies void', () => { expect(classifyRoseCondition(5)).toBe('void') })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('classifies grand-navigator', () => { expect(classifyNavigatorGrade(85)).toBe('grand-navigator') })
  it('classifies sea-captain', () => { expect(classifyNavigatorGrade(70)).toBe('sea-captain') })
  it('classifies skilled-pilot', () => { expect(classifyNavigatorGrade(55)).toBe('skilled-pilot') })
  it('classifies apprentice', () => { expect(classifyNavigatorGrade(40)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifyNavigatorGrade(25)).toBe('novice') })
  it('classifies lost-wanderer', () => { expect(classifyNavigatorGrade(10)).toBe('lost-wanderer') })
})

// ─── analyzeJadeNeedle ─────────────────────────────────────────────

describe('analyzeJadeNeedle', () => {
  it('analyzes empty content', () => {
    const needle = analyzeJadeNeedle(emptyContent, 'empty.ts')
    expect(needle.file).toBe('empty.ts')
    expect(needle.qualityScore).toBe(0)
    expect(needle.condition).toBe('stone')
    expect(needle.directionalClarity).toBe(0)
    expect(needle.bearingAccuracy).toBe(0)
    expect(needle.navigationQuality).toBe(0)
    expect(needle.cardinalBalance).toBe(0)
    expect(needle.needleSteadiness).toBe(0)
  })

  it('analyzes rich content', () => {
    const needle = analyzeJadeNeedle(richContent, 'rich.ts')
    expect(needle.file).toBe('rich.ts')
    expect(needle.qualityScore).toBeGreaterThan(50)
    expect(needle.directionalClarity).toBeGreaterThan(50)
    expect(needle.bearingAccuracy).toBeGreaterThan(50)
    expect(needle.orienting).toBeDefined()
    expect(needle.calibrating).toBeDefined()
    expect(needle.navigating).toBeDefined()
    expect(needle.balancing).toBeDefined()
    expect(needle.steadying).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const needle = analyzeJadeNeedle(richContent, 'rich.ts')
    const expected = Math.round(
      needle.directionalClarity * 0.2 +
      needle.bearingAccuracy * 0.2 +
      needle.navigationQuality * 0.2 +
      needle.cardinalBalance * 0.2 +
      needle.needleSteadiness * 0.2,
    )
    expect(needle.qualityScore).toBe(expected)
  })
})

// ─── analyzeCompassRose ────────────────────────────────────────────

describe('analyzeCompassRose', () => {
  it('handles empty needles', () => {
    const rose = analyzeCompassRose([], 'empty-dir')
    expect(rose.directory).toBe('empty-dir')
    expect(rose.needles).toEqual([])
    expect(rose.avgClarity).toBe(0)
    expect(rose.roseType).toBe('no-rose')
    expect(rose.condition).toBe('void')
  })

  it('analyzes needles in a directory', () => {
    const n1 = analyzeJadeNeedle(richContent, 'dir/a.ts')
    const n2 = analyzeJadeNeedle(moderateContent, 'dir/b.ts')
    const rose = analyzeCompassRose([n1, n2], 'dir')
    expect(rose.directory).toBe('dir')
    expect(rose.needles).toHaveLength(2)
    expect(rose.avgClarity).toBeGreaterThan(0)
    expect(typeof rose.roseType).toBe('string')
    expect(typeof rose.condition).toBe('string')
  })

  it('counts master compasses and stones', () => {
    const needles = [
      { condition: 'master-compass' } as JadeNeedle,
      { condition: 'stone' } as JadeNeedle,
    ]
    const rose = analyzeCompassRose(needles, 'dir')
    expect(rose.masterCompassCount).toBe(1)
    expect(rose.stoneCount).toBe(1)
  })
})

// ─── buildJadeCompassResult ────────────────────────────────────────

describe('buildJadeCompassResult', () => {
  it('handles empty input', async () => {
    const result = await buildJadeCompassResult([], [])
    expect(result.needles).toEqual([])
    expect(result.roses).toEqual([])
    expect(result.fleet.avgClarity).toBe(0)
    expect(result.fleet.isTrueNorth).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.bestNeedle).toBe('')
  })

  it('analyzes multiple files', async () => {
    const result = await buildJadeCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.needles).toHaveLength(2)
    expect(result.arms).toBeUndefined() // uses roses
    expect(result.roses).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgDirectionalClarity).toBeGreaterThan(0)
    expect(result.stats.avgBearingAccuracy).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files by directory', async () => {
    const result = await buildJadeCompassResult(
      ['dir1/a.ts', 'dir2/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.roses).toHaveLength(2)
    expect(result.stats.totalRoses).toBe(2)
  })

  it('computes fleet navigation', async () => {
    const result = await buildJadeCompassResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.fleet.overallNavigation).toBeGreaterThan(0)
    expect(result.fleet.isTrueNorth).toBe(true)
  })

  it('tracks best needle and extremes', async () => {
    const result = await buildJadeCompassResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestNeedle).toBe('rich.ts')
    expect(result.stats.clearestDirection).toBeTruthy()
    expect(result.stats.mostAccurate).toBeTruthy()
    expect(result.stats.mostNavigable).toBeTruthy()
    expect(result.stats.mostBalanced).toBeTruthy()
  })

  it('counts condition types correctly', async () => {
    const result = await buildJadeCompassResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    const total = result.stats.masterCompassCount + result.stats.jadeSextantCount +
      result.stats.properCompassCount + result.stats.rustyNeedleCount +
      result.stats.brokenCompassCount + result.stats.stoneCount
    expect(total).toBe(3)
  })

  it('assigns navigator grade', async () => {
    const result = await buildJadeCompassResult(['a.ts'], [richContent])
    expect(typeof result.stats.navigatorGrade).toBe('string')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for high quality', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 80, isTrueNorth: true } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('true north')
  })

  it('recommends clarity improvement', () => {
    const stats = {
      avgDirectionalClarity: 40, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 60 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('directional clarity'))).toBe(true)
  })

  it('recommends accuracy improvement', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 40, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 60 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('bearing accuracy'))).toBe(true)
  })

  it('recommends navigation improvement', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 40,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 60 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('navigation quality'))).toBe(true)
  })

  it('recommends balance improvement', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 40, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 60 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('cardinal balance'))).toBe(true)
  })

  it('recommends steadiness improvement', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 40, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 60 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('needle'))).toBe(true)
  })

  it('warns about stones', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 3,
    } as JadeCompassStats
    const fleet = { overallNavigation: 80 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('stones'))).toBe(true)
  })

  it('warns about poor fleet navigation', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 30 } as JadeFleet
    const recs = generateRecommendations([], [], fleet, stats)
    expect(recs.some(r => r.includes('poor'))).toBe(true)
  })

  it('warns about all broken roses', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 80 } as JadeFleet
    const roses = [
      { roseType: 'no-rose' } as CompassRose,
      { roseType: 'scratched-circle' } as CompassRose,
    ]
    const recs = generateRecommendations([], roses, fleet, stats)
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })

  it('lists specific stone files', () => {
    const stats = {
      avgDirectionalClarity: 80, avgBearingAccuracy: 80, avgNavigationQuality: 80,
      avgCardinalBalance: 80, avgNeedleSteadiness: 80, stoneCount: 0,
    } as JadeCompassStats
    const fleet = { overallNavigation: 80 } as JadeFleet
    const needles = [
      { condition: 'stone', file: 'bad1.ts' } as JadeNeedle,
      { condition: 'stone', file: 'bad2.ts' } as JadeNeedle,
    ]
    const recs = generateRecommendations(needles, [], fleet, stats)
    expect(recs.some(r => r.includes('bad1.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('colors high scores', () => { expect(typeof colorScore(90)).toBe('string') })
  it('colors mid scores', () => { expect(typeof colorScore(50)).toBe('string') })
  it('colors low scores', () => { expect(typeof colorScore(10)).toBe('string') })
})

describe('colorGrade', () => {
  it('colors master-compass', () => { expect(typeof colorGrade('master-compass')).toBe('string') })
  it('colors stone', () => { expect(typeof colorGrade('stone')).toBe('string') })
  it('colors unknown grade', () => { expect(typeof colorGrade('unknown')).toBe('string') })
})

describe('formatNeedleTable', () => {
  it('formats a needle', () => {
    const needle = analyzeJadeNeedle(richContent, 'test.ts')
    const output = formatNeedleTable(needle)
    expect(output).toContain('test.ts')
    expect(output).toContain('Directional Clarity')
    expect(output).toContain('Score')
  })
})

describe('formatNeedlesTable', () => {
  it('handles empty needles', () => {
    expect(formatNeedlesTable([])).toContain('No jade needles')
  })

  it('formats multiple needles', () => {
    const needles = [
      analyzeJadeNeedle(richContent, 'a.ts'),
      analyzeJadeNeedle(moderateContent, 'b.ts'),
    ]
    const output = formatNeedlesTable(needles)
    expect(output).toContain('Jade Compass Analysis')
    expect(output).toContain('a.ts')
  })
})

describe('formatRoseTable', () => {
  it('formats a rose', () => {
    const needle = analyzeJadeNeedle(richContent, 'dir/a.ts')
    const rose = analyzeCompassRose([needle], 'dir')
    const output = formatRoseTable(rose)
    expect(output).toContain('dir')
    expect(output).toContain('Type')
  })
})

describe('formatRosesTable', () => {
  it('handles empty roses', () => {
    expect(formatRosesTable([])).toContain('No compass roses')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildJadeCompassResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Compass Statistics')
    expect(output).toContain('Overall Navigation')
    expect(output).toContain('Navigator Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const recs = ['Do X', 'Do Y']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('Do X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildJadeCompassResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Compass Analysis')
    expect(output).toContain('Fleet')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildJadeCompassResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.needles).toHaveLength(1)
    expect(parsed.fleet).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
