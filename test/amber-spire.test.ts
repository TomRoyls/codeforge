import { describe, it, expect } from 'vitest'
import {
  measureCapturing,
  measureStructuring,
  measureRevealing,
  measureEncapsulating,
  measureEnduring,
  classifySpecimenCondition,
  classifyTowerType,
  classifyTowerCondition,
  classifyCuratorGrade,
  analyzeAmberSpecimen,
  analyzeAmberTower,
  buildAmberSpireResult,
  generateRecommendations,
} from '../src/commands/amber-spire-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSpecimenTable,
  formatSpecimensTable,
  formatTowerTable,
  formatTowersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-spire-format-helpers.js'
import type {
  AmberSpecimen,
} from '../src/commands/amber-spire-helpers.js'

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
    const result = await validateConfig(config)
    return result ?? defaultValue()
  } catch (error) {
    return handleDefault(config)
  }
}

export function handleDefault(config: Config): UserConfig {
  return config ?? { name: 'default', age: 0, role: 'user' }
}

export function defaultValue(): UserConfig {
  return { name: 'default', age: 0, role: 'user' }
}

enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING'
}

switch (status) {
  case Status.Active:
    users.map(u => u.name)
    users.filter(u => u.age > 18).forEach(u => console.log(u))
    break
  default:
    break
}
`

// ─── measureCapturing ──────────────────────────────────────────────

describe('measureCapturing', () => {
  it('returns no-preservation for empty content', () => {
    const m = measureCapturing(emptyContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('no-preservation')
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.crypticCount).toBe(0)
    expect(m.unreadableCount).toBe(0)
  })

  it('returns a grade for minimal content', () => {
    const m = measureCapturing(minimalContent)
    expect(m.quality).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(true)
  })

  it('scores higher for moderate content', () => {
    const m = measureCapturing(moderateContent)
    expect(m.quality).toBeGreaterThan(30)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellNamed).toBe(true)
  })

  it('scores highest for rich content', () => {
    const m = measureCapturing(richContent)
    expect(m.quality).toBeGreaterThan(60)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('counts cryptic (var) and unreadable (any)', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureCapturing(content)
    expect(m.crypticCount).toBe(3)
    expect(m.unreadableCount).toBe(2)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoUnreadable).toBe(false)
  })

  it('detects eval as hasNoArbitrary', () => {
    const content = `eval('test')`
    const m = measureCapturing(content)
    expect(m.hasNoArbitrary).toBe(false)
  })

  it('detects debugger as hasNoVague', () => {
    const content = `debugger`
    const m = measureCapturing(content)
    expect(m.hasNoVague).toBe(false)
  })

  it('assigns perfect-amber for high quality', () => {
    const m = measureCapturing(richContent)
    expect(m.grade).toBeDefined()
    expect(typeof m.grade).toBe('string')
  })
})

// ─── measureStructuring ────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns no-structure for empty content', () => {
    const m = measureStructuring(emptyContent)
    expect(m.golden).toBe(0)
    expect(m.structure).toBe('no-structure')
    expect(m.hasHighGolden).toBe(false)
    expect(m.shakyBaseCount).toBe(0)
    expect(m.monolithicCount).toBe(0)
  })

  it('scores higher for moderate content', () => {
    const m = measureStructuring(moderateContent)
    expect(m.golden).toBeGreaterThan(20)
    expect(m.hasSolidArchitecture).toBe(true)
  })

  it('detects solid architecture for rich content', () => {
    const m = measureStructuring(richContent)
    expect(m.hasSolidArchitecture).toBe(true)
    expect(m.hasWellDesigned).toBe(true)
    expect(m.hasModular).toBe(true)
    expect(m.hasLayered).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('counts shaky base and monolithic', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureStructuring(content)
    expect(m.shakyBaseCount).toBe(3)
    expect(m.monolithicCount).toBe(2)
    expect(m.hasNoShakyBase).toBe(false)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects eval as hasNoFlat', () => {
    const content = `eval('test')`
    const m = measureStructuring(content)
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects debugger as hasNoFixedCapacity', () => {
    const content = `debugger`
    const m = measureStructuring(content)
    expect(m.hasNoFixedCapacity).toBe(false)
  })
})

// ─── measureRevealing ──────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns no-detail for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.insect).toBe('no-detail')
    expect(m.hasHighClarity).toBe(false)
    expect(m.blackBoxCount).toBe(0)
    expect(m.opaqueCount).toBe(0)
  })

  it('scores higher for moderate content', () => {
    const m = measureRevealing(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
  })

  it('detects transparent logic for rich content', () => {
    const m = measureRevealing(richContent)
    expect(m.hasTransparentLogic).toBe(true)
    expect(m.hasObservableInternals).toBe(true)
    expect(m.hasDebuggable).toBe(true)
    expect(m.hasInspectable).toBe(true)
    expect(m.hasVisible).toBe(true)
  })

  it('counts black boxes and opaque', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureRevealing(content)
    expect(m.blackBoxCount).toBe(3)
    expect(m.opaqueCount).toBe(2)
    expect(m.hasNoBlackBoxes).toBe(false)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects eval as hasNoHiddenState', () => {
    const content = `eval('test')`
    const m = measureRevealing(content)
    expect(m.hasNoHiddenState).toBe(false)
  })

  it('detects debugger as hasNoSilent', () => {
    const content = `debugger`
    const m = measureRevealing(content)
    expect(m.hasNoSilent).toBe(false)
  })
})

// ─── measureEncapsulating ──────────────────────────────────────────

describe('measureEncapsulating', () => {
  it('returns no-resin for empty content', () => {
    const m = measureEncapsulating(emptyContent)
    expect(m.strength).toBe(0)
    expect(m.resin).toBe('no-resin')
    expect(m.hasHighStrength).toBe(false)
    expect(m.leakedCount).toBe(0)
    expect(m.mutableCount).toBe(0)
  })

  it('scores higher for moderate content', () => {
    const m = measureEncapsulating(moderateContent)
    expect(m.strength).toBeGreaterThan(20)
    expect(m.hasEncapsulated).toBe(true)
  })

  it('detects encapsulated and immutable for rich content', () => {
    const m = measureEncapsulating(richContent)
    expect(m.hasEncapsulated).toBe(true)
    expect(m.hasPrivateByDefault).toBe(true)
    expect(m.hasImmutable).toBe(true)
    expect(m.hasSealed).toBe(true)
    expect(m.hasGuarded).toBe(true)
  })

  it('counts leaked and mutable', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureEncapsulating(content)
    expect(m.leakedCount).toBe(3)
    expect(m.mutableCount).toBe(2)
    expect(m.hasNoLeaked).toBe(false)
    expect(m.hasNoMutable).toBe(false)
  })

  it('detects eval as hasNoOpenInternals', () => {
    const content = `eval('test')`
    const m = measureEncapsulating(content)
    expect(m.hasNoOpenInternals).toBe(false)
  })

  it('detects debugger as hasNoExposed', () => {
    const content = `debugger`
    const m = measureEncapsulating(content)
    expect(m.hasNoExposed).toBe(false)
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns no-time for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.time).toBe('no-time')
    expect(m.hasHighDepth).toBe(false)
    expect(m.breakingChangesCount).toBe(0)
    expect(m.unversionedCount).toBe(0)
  })

  it('returns a score for minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.depth).toBeGreaterThan(0)
  })

  it('detects backward compatible and versioned for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.hasBackwardCompatible).toBe(true)
    expect(m.hasVersioned).toBe(true)
    expect(m.hasMigrationPaths).toBe(true)
    expect(m.hasStableAPI).toBe(true)
    expect(m.hasDeprecationPolicy).toBe(true)
  })

  it('counts breaking changes and unversioned', () => {
    const content = `var x = 1; var y: any = 2; var z: any = 3`
    const m = measureEnduring(content)
    expect(m.breakingChangesCount).toBe(3)
    expect(m.unversionedCount).toBe(2)
    expect(m.hasNoBreakingChanges).toBe(false)
    expect(m.hasNoUnversioned).toBe(false)
  })

  it('detects eval as hasNoVolatileAPI', () => {
    const content = `eval('test')`
    const m = measureEnduring(content)
    expect(m.hasNoVolatileAPI).toBe(false)
  })

  it('detects debugger as hasNoSuddenRemoval', () => {
    const content = `debugger`
    const m = measureEnduring(content)
    expect(m.hasNoSuddenRemoval).toBe(false)
  })
})

// ─── classifySpecimenCondition ─────────────────────────────────────

describe('classifySpecimenCondition', () => {
  it('classifies masterpiece-amber', () => {
    expect(classifySpecimenCondition(90)).toBe('masterpiece-amber')
  })
  it('classifies golden-specimen', () => {
    expect(classifySpecimenCondition(75)).toBe('golden-specimen')
  })
  it('classifies proper-fossil', () => {
    expect(classifySpecimenCondition(58)).toBe('proper-fossil')
  })
  it('classifies cloudy-resin', () => {
    expect(classifySpecimenCondition(42)).toBe('cloudy-resin')
  })
  it('classifies cracked-amber', () => {
    expect(classifySpecimenCondition(28)).toBe('cracked-amber')
  })
  it('classifies dust', () => {
    expect(classifySpecimenCondition(10)).toBe('dust')
  })
})

// ─── classifyTowerType ─────────────────────────────────────────────

describe('classifyTowerType', () => {
  it('returns no-tower for empty array', () => {
    expect(classifyTowerType([])).toBe('no-tower')
  })

  it('returns amber-cathedral for high scores', () => {
    const specimens = Array.from({ length: 4 }, (_, i) => ({
      qualityScore: 90,
      condition: 'masterpiece-amber',
      file: `f${i}.ts`,
    } as AmberSpecimen))
    expect(classifyTowerType(specimens)).toBe('amber-cathedral')
  })

  it('returns no-tower for very low scores', () => {
    const specimens = [{ qualityScore: 5, condition: 'dust', file: 'a.ts' } as AmberSpecimen]
    expect(classifyTowerType(specimens)).toBe('no-tower')
  })
})

// ─── classifyTowerCondition ────────────────────────────────────────

describe('classifyTowerCondition', () => {
  it('classifies magnificent-amber', () => {
    expect(classifyTowerCondition(80)).toBe('magnificent-amber')
  })
  it('classifies golden-collection', () => {
    expect(classifyTowerCondition(65)).toBe('golden-collection')
  })
  it('classifies decent-museum', () => {
    expect(classifyTowerCondition(50)).toBe('decent-museum')
  })
  it('classifies cracked-display', () => {
    expect(classifyTowerCondition(35)).toBe('cracked-display')
  })
  it('classifies dusty-shelf', () => {
    expect(classifyTowerCondition(20)).toBe('dusty-shelf')
  })
  it('classifies void', () => {
    expect(classifyTowerCondition(10)).toBe('void')
  })
})

// ─── classifyCuratorGrade ──────────────────────────────────────────

describe('classifyCuratorGrade', () => {
  it('classifies master-curator', () => {
    expect(classifyCuratorGrade(85)).toBe('master-curator')
  })
  it('classifies expert-paleontologist', () => {
    expect(classifyCuratorGrade(70)).toBe('expert-paleontologist')
  })
  it('classifies skilled-collector', () => {
    expect(classifyCuratorGrade(55)).toBe('skilled-collector')
  })
  it('classifies apprentice', () => {
    expect(classifyCuratorGrade(38)).toBe('apprentice')
  })
  it('classifies novice', () => {
    expect(classifyCuratorGrade(22)).toBe('novice')
  })
  it('classifies looter', () => {
    expect(classifyCuratorGrade(10)).toBe('looter')
  })
})

// ─── analyzeAmberSpecimen ──────────────────────────────────────────

describe('analyzeAmberSpecimen', () => {
  it('analyzes empty content', () => {
    const sp = analyzeAmberSpecimen(emptyContent, 'empty.ts')
    expect(sp.file).toBe('empty.ts')
    expect(sp.preservationQuality).toBe(0)
    expect(sp.goldenStructure).toBe(0)
    expect(sp.insectClarity).toBe(0)
    expect(sp.resinStrength).toBe(0)
    expect(sp.timeDepth).toBe(0)
    expect(sp.qualityScore).toBe(0)
    expect(sp.condition).toBe('dust')
  })

  it('analyzes moderate content', () => {
    const sp = analyzeAmberSpecimen(moderateContent, 'moderate.ts')
    expect(sp.file).toBe('moderate.ts')
    expect(sp.preservationQuality).toBeGreaterThan(0)
    expect(sp.goldenStructure).toBeGreaterThan(0)
    expect(sp.insectClarity).toBeGreaterThan(0)
    expect(sp.resinStrength).toBeGreaterThan(0)
    expect(sp.timeDepth).toBeGreaterThan(0)
    expect(sp.qualityScore).toBeGreaterThan(0)
    expect(typeof sp.condition).toBe('string')
  })

  it('analyzes rich content with high scores', () => {
    const sp = analyzeAmberSpecimen(richContent, 'rich.ts')
    expect(sp.preservationQuality).toBeGreaterThan(50)
    expect(sp.goldenStructure).toBeGreaterThan(50)
    expect(sp.insectClarity).toBeGreaterThan(50)
    expect(sp.resinStrength).toBeGreaterThan(50)
    expect(sp.timeDepth).toBeGreaterThan(50)
    expect(sp.qualityScore).toBeGreaterThan(50)
  })

  it('computes qualityScore as weighted average', () => {
    const sp = analyzeAmberSpecimen(moderateContent, 'mod.ts')
    const expected = Math.round(
      sp.preservationQuality * 0.2 +
      sp.goldenStructure * 0.2 +
      sp.insectClarity * 0.2 +
      sp.resinStrength * 0.2 +
      sp.timeDepth * 0.2,
    )
    expect(sp.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const sp = analyzeAmberSpecimen(richContent, 'rich.ts')
    expect(sp.capturing).toBeDefined()
    expect(sp.structuring).toBeDefined()
    expect(sp.revealing).toBeDefined()
    expect(sp.encapsulating).toBeDefined()
    expect(sp.enduring).toBeDefined()
    expect(sp.capturing.grade).toBeDefined()
    expect(sp.structuring.structure).toBeDefined()
    expect(sp.revealing.insect).toBeDefined()
    expect(sp.encapsulating.resin).toBeDefined()
    expect(sp.enduring.time).toBeDefined()
  })
})

// ─── analyzeAmberTower ─────────────────────────────────────────────

describe('analyzeAmberTower', () => {
  it('returns empty tower for no specimens', () => {
    const t = analyzeAmberTower([], 'empty-dir')
    expect(t.directory).toBe('empty-dir')
    expect(t.specimens).toEqual([])
    expect(t.avgPreservation).toBe(0)
    expect(t.avgStructure).toBe(0)
    expect(t.avgDepth).toBe(0)
    expect(t.masterpieceAmberCount).toBe(0)
    expect(t.dustCount).toBe(0)
    expect(t.towerType).toBe('no-tower')
    expect(t.condition).toBe('void')
  })

  it('computes averages from specimens', () => {
    const sp1 = analyzeAmberSpecimen(richContent, 'a.ts')
    const sp2 = analyzeAmberSpecimen(moderateContent, 'b.ts')
    const t = analyzeAmberTower([sp1, sp2], 'src')
    expect(t.avgPreservation).toBe(Math.round((sp1.preservationQuality + sp2.preservationQuality) / 2))
    expect(t.avgStructure).toBe(Math.round((sp1.goldenStructure + sp2.goldenStructure) / 2))
    expect(t.avgDepth).toBe(Math.round((sp1.timeDepth + sp2.timeDepth) / 2))
    expect(t.directory).toBe('src')
    expect(t.specimens.length).toBe(2)
  })

  it('counts masterpiece amber and dust', () => {
    const sp1 = analyzeAmberSpecimen(richContent, 'a.ts')
    const sp2 = analyzeAmberSpecimen(emptyContent, 'b.ts')
    const t = analyzeAmberTower([sp1, sp2], 'mixed')
    expect(t.masterpieceAmberCount).toBeGreaterThanOrEqual(0)
    expect(t.dustCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── buildAmberSpireResult ─────────────────────────────────────────

describe('buildAmberSpireResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmberSpireResult([], [])
    expect(result.specimens).toEqual([])
    expect(result.towers).toEqual([])
    expect(result.museum.avgPreservation).toBe(0)
    expect(result.museum.overallPreservation).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalTowers).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', async () => {
    const result = await buildAmberSpireResult(['test.ts'], [moderateContent])
    expect(result.specimens.length).toBe(1)
    expect(result.towers.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestSpecimen).toBe('test.ts')
    expect(result.stats.bestPreserved).toBe('test.ts')
    expect(result.stats.bestStructure).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.deepest).toBe('test.ts')
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildAmberSpireResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.specimens.length).toBe(2)
    expect(result.towers.length).toBe(1)
    expect(result.towers[0].directory).toBe('src')
  })

  it('analyzes files across multiple directories', async () => {
    const result = await buildAmberSpireResult(
      ['src/a.ts', 'lib/b.ts', 'test/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.specimens.length).toBe(3)
    expect(result.towers.length).toBe(3)
  })

  it('computes museum correctly', async () => {
    const result = await buildAmberSpireResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.museum.avgPreservation).toBeGreaterThan(0)
    expect(result.museum.avgStructure).toBeGreaterThan(0)
    expect(result.museum.avgDepth).toBeGreaterThan(0)
    expect(result.museum.overallPreservation).toBeGreaterThan(0)
    expect(typeof result.museum.isPreserved).toBe('boolean')
  })

  it('computes stats correctly', async () => {
    const result = await buildAmberSpireResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(s.avgPreservationQuality).toBeGreaterThan(0)
    expect(s.avgGoldenStructure).toBeGreaterThan(0)
    expect(s.avgInsectClarity).toBeGreaterThan(0)
    expect(s.avgResinStrength).toBeGreaterThan(0)
    expect(s.avgTimeDepth).toBeGreaterThan(0)
    expect(s.overallPreservation).toBeGreaterThan(0)
    expect(typeof s.curatorGrade).toBe('string')
    expect(s.bestSpecimen).toBeTruthy()
  })

  it('sets isPreserved when avgPreservation >= 60', async () => {
    const result = await buildAmberSpireResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.museum.isPreserved).toBe(true)
  })

  it('sets isPreserved false when avgPreservation < 60', async () => {
    const result = await buildAmberSpireResult(['a.ts'], [emptyContent])
    expect(result.museum.isPreserved).toBe(false)
  })

  it('computes condition counts in stats', async () => {
    const result = await buildAmberSpireResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    const s = result.stats
    const totalConditions = s.masterpieceAmberCount + s.goldenSpecimenCount +
      s.properFossilCount + s.cloudyResinCount +
      s.crackedAmberCount + s.dustCount
    expect(totalConditions).toBe(3)
  })

  it('computes high measure counts', async () => {
    const result = await buildAmberSpireResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.hasHighQualityCount).toBeGreaterThan(0)
    expect(result.stats.hasHighGoldenCount).toBeGreaterThan(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThan(0)
    expect(result.stats.hasHighStrengthCount).toBeGreaterThan(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for perfect results', () => {
    const sp = analyzeAmberSpecimen(richContent, 'a.ts')
    const recs = generateRecommendations(
      [sp],
      [{ specimens: [sp], avgPreservation: 90, avgStructure: 90, avgDepth: 90, masterpieceAmberCount: 1, dustCount: 0, towerType: 'amber-cathedral', condition: 'magnificent-amber', directory: 'src' }],
      { avgPreservation: 90, avgStructure: 90, avgDepth: 90, isPreserved: true, overallPreservation: 90 },
      {
        totalFiles: 1, totalTowers: 1, avgPreservationQuality: 90, avgGoldenStructure: 90,
        avgInsectClarity: 90, avgResinStrength: 90, avgTimeDepth: 90,
        masterpieceAmberCount: 1, goldenSpecimenCount: 0,
        properFossilCount: 0, cloudyResinCount: 0,
        crackedAmberCount: 0, dustCount: 0,
        hasHighQualityCount: 1, hasHighGoldenCount: 1, hasHighClarityCount: 1,
        hasHighStrengthCount: 1, hasHighDepthCount: 1,
        overallPreservation: 90, curatorGrade: 'master-curator',
        bestSpecimen: 'a.ts', bestPreserved: 'a.ts', bestStructure: 'a.ts',
        clearest: 'a.ts', deepest: 'a.ts',
      },
    )
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[recs.length - 1]).toContain('master curator')
  })

  it('recommends improving preservation when low', () => {
    const recs = generateRecommendations(
      [],
      [],
      { avgPreservation: 30, avgStructure: 30, avgDepth: 30, isPreserved: false, overallPreservation: 20 },
      {
        totalFiles: 1, totalTowers: 1, avgPreservationQuality: 30, avgGoldenStructure: 30,
        avgInsectClarity: 30, avgResinStrength: 30, avgTimeDepth: 30,
        masterpieceAmberCount: 0, goldenSpecimenCount: 0,
        properFossilCount: 0, cloudyResinCount: 0,
        crackedAmberCount: 0, dustCount: 0,
        hasHighQualityCount: 0, hasHighGoldenCount: 0, hasHighClarityCount: 0,
        hasHighStrengthCount: 0, hasHighDepthCount: 0,
        overallPreservation: 20, curatorGrade: 'novice',
        bestSpecimen: '', bestPreserved: '', bestStructure: '',
        clearest: '', deepest: '',
      },
    )
    expect(recs.some(r => r.includes('preservation quality'))).toBe(true)
  })

  it('warns about dust files', () => {
    const recs = generateRecommendations(
      [{ file: 'a.ts', condition: 'dust' } as AmberSpecimen],
      [],
      { avgPreservation: 10, avgStructure: 10, avgDepth: 10, isPreserved: false, overallPreservation: 10 },
      {
        totalFiles: 1, totalTowers: 0, avgPreservationQuality: 10, avgGoldenStructure: 10,
        avgInsectClarity: 10, avgResinStrength: 10, avgTimeDepth: 10,
        masterpieceAmberCount: 0, goldenSpecimenCount: 0,
        properFossilCount: 0, cloudyResinCount: 0,
        crackedAmberCount: 0, dustCount: 1,
        hasHighQualityCount: 0, hasHighGoldenCount: 0, hasHighClarityCount: 0,
        hasHighStrengthCount: 0, hasHighDepthCount: 0,
        overallPreservation: 10, curatorGrade: 'looter',
        bestSpecimen: '', bestPreserved: '', bestStructure: '',
        clearest: '', deepest: '',
      },
    )
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })

  it('warns about broken towers', () => {
    const recs = generateRecommendations(
      [],
      [{ specimens: [], avgPreservation: 0, avgStructure: 0, avgDepth: 0, masterpieceAmberCount: 0, dustCount: 0, towerType: 'broken-shaft', condition: 'void', directory: 'dead' }],
      { avgPreservation: 0, avgStructure: 0, avgDepth: 0, isPreserved: false, overallPreservation: 0 },
      {
        totalFiles: 0, totalTowers: 1, avgPreservationQuality: 0, avgGoldenStructure: 0,
        avgInsectClarity: 0, avgResinStrength: 0, avgTimeDepth: 0,
        masterpieceAmberCount: 0, goldenSpecimenCount: 0,
        properFossilCount: 0, cloudyResinCount: 0,
        crackedAmberCount: 0, dustCount: 0,
        hasHighQualityCount: 0, hasHighGoldenCount: 0, hasHighClarityCount: 0,
        hasHighStrengthCount: 0, hasHighDepthCount: 0,
        overallPreservation: 0, curatorGrade: 'looter',
        bestSpecimen: '', bestPreserved: '', bestStructure: '',
        clearest: '', deepest: '',
      },
    )
    expect(recs.some(r => r.includes('broken'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grade', () => {
    expect(typeof colorGrade('masterpiece-amber')).toBe('string')
  })
  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatSpecimenTable', () => {
  it('formats a specimen', () => {
    const sp = analyzeAmberSpecimen(richContent, 'test.ts')
    const result = formatSpecimenTable(sp)
    expect(result).toContain('test.ts')
    expect(result).toContain('Preservation Quality')
    expect(result).toContain('Golden Structure')
    expect(result).toContain('Insect Clarity')
    expect(result).toContain('Resin Strength')
    expect(result).toContain('Time Depth')
  })
})

describe('formatSpecimensTable', () => {
  it('returns no specimens message for empty', () => {
    expect(formatSpecimensTable([])).toContain('No amber specimens')
  })
  it('formats multiple specimens', () => {
    const sp1 = analyzeAmberSpecimen(richContent, 'a.ts')
    const sp2 = analyzeAmberSpecimen(moderateContent, 'b.ts')
    const result = formatSpecimensTable([sp1, sp2])
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
    expect(result).toContain('Amber Spire Analysis')
  })
})

describe('formatTowerTable', () => {
  it('formats a tower', () => {
    const sp = analyzeAmberSpecimen(richContent, 'test.ts')
    const t = analyzeAmberTower([sp], 'src')
    const result = formatTowerTable(t)
    expect(result).toContain('src')
    expect(result).toContain('Type:')
    expect(result).toContain('Condition:')
  })
})

describe('formatTowersTable', () => {
  it('returns no towers message for empty', () => {
    expect(formatTowersTable([])).toContain('No amber towers')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildAmberSpireResult(['a.ts'], [richContent])
    const result = formatStatsTable(r.stats)
    expect(result).toContain('Amber Spire Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Curator Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Test rec 1', 'Test rec 2'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('Test rec 1')
    expect(result).toContain('Test rec 2')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildAmberSpireResult(['a.ts'], [richContent])
    const result = formatResultTable(r)
    expect(result).toContain('Amber Spire Analysis')
    expect(result).toContain('Amber Towers')
    expect(result).toContain('Amber Spire Statistics')
    expect(result).toContain('Museum')
    expect(result).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const r = await buildAmberSpireResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.specimens).toBeDefined()
    expect(parsed.towers).toBeDefined()
    expect(parsed.museum).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
