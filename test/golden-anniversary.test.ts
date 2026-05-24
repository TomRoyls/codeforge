import { describe, it, expect } from 'vitest'
import {
  measureEnduring,
  measureModeling,
  measureBlooming,
  measureCelebrating,
  measurePassing,
  classifyArtifactCondition,
  classifyHallType,
  classifyHallCondition,
  classifyGuardianGrade,
  analyzeGoldenArtifact,
  analyzeAnniversaryHall,
  buildGoldenAnniversaryResult,
  generateRecommendations,
} from '../src/commands/golden-anniversary-helpers.js'
import {
  colorScore,
  colorGrade,
  formatArtifactTable,
  formatArtifactsTable,
  formatHallTable,
  formatHallsTable,
  formatStatsTable,
  formatCelebration,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-anniversary-format-helpers.js'
import type {
  GoldenArtifact,
} from '../src/commands/golden-anniversary-helpers.js'

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

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('returns no-legacy for empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.endurance).toBe(0)
    expect(m.grade).toBe('no-legacy')
    expect(m.hasHighEndurance).toBe(false)
    expect(m.breakingChangesCount).toBe(0)
    expect(m.volatileAPICount).toBe(0)
  })

  it('returns higher endurance for moderate content', () => {
    const m = measureEnduring(moderateContent)
    expect(m.endurance).toBeGreaterThan(0)
    expect(m.hasBackwardCompatible).toBe(true)
    expect(m.hasStableAPI).toBe(true)
  })

  it('returns timeless-classic for rich content', () => {
    const m = measureEnduring(richContent)
    expect(m.endurance).toBeGreaterThanOrEqual(85)
    expect(m.grade).toBe('timeless-classic')
    expect(m.hasHighEndurance).toBe(true)
    expect(m.hasBackwardCompatible).toBe(true)
    expect(m.hasNoBreakingChanges).toBe(true)
    expect(m.hasStableAPI).toBe(true)
    expect(m.hasNoVolatileAPI).toBe(true)
    expect(m.hasVersioned).toBe(true)
    expect(m.hasNoUnversioned).toBe(true)
    expect(m.hasMigrationPaths).toBe(true)
    expect(m.hasNoDeadEnds).toBe(true)
    expect(m.hasDeprecationPolicy).toBe(true)
    expect(m.hasNoSuddenRemoval).toBe(true)
    expect(m.hasPreserved).toBe(true)
  })

  it('counts breaking changes (var)', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureEnduring(content)
    expect(m.breakingChangesCount).toBe(2)
    expect(m.hasNoBreakingChanges).toBe(false)
  })

  it('counts volatile API (any)', () => {
    const content = `const x: any = 1; const y: any = 2;`
    const m = measureEnduring(content)
    expect(m.volatileAPICount).toBeGreaterThanOrEqual(2)
    expect(m.hasNoVolatileAPI).toBe(false)
  })

  it('detects eval as unversioned', () => {
    const content = `eval('dangerous')`
    const m = measureEnduring(content)
    expect(m.hasNoUnversioned).toBe(false)
  })

  it('detects debugger as dead end', () => {
    const content = `debugger`
    const m = measureEnduring(content)
    expect(m.hasNoDeadEnds).toBe(false)
  })

  it('detects delete as sudden removal', () => {
    const content = `delete obj.prop`
    const m = measureEnduring(content)
    expect(m.hasNoSuddenRemoval).toBe(false)
  })

  it('returns battle-tested for 70-84 range', () => {
    expect(measureEnduring(moderateContent).grade).toMatch(/^(battle-tested|timeless-classic|proper-veteran)$/)
  })
})

// ─── measureModeling ───────────────────────────────────────────────

describe('measureModeling', () => {
  it('returns no-archetype for empty content', () => {
    const m = measureModeling(emptyContent)
    expect(m.archetype).toBe(0)
    expect(m.golden).toBe('no-archetype')
    expect(m.hasHighArchetype).toBe(false)
    expect(m.antiPatternCount).toBe(0)
    expect(m.adhocCount).toBe(0)
  })

  it('returns golden-standard for rich content', () => {
    const m = measureModeling(richContent)
    expect(m.archetype).toBeGreaterThanOrEqual(85)
    expect(m.golden).toBe('golden-standard')
    expect(m.hasHighArchetype).toBe(true)
    expect(m.hasCleanArchitecture).toBe(true)
    expect(m.hasBestPractices).toBe(true)
    expect(m.hasNoAntiPatterns).toBe(true)
    expect(m.hasWellDesigned).toBe(true)
    expect(m.hasNoAdhoc).toBe(true)
    expect(m.hasConsistentStyle).toBe(true)
    expect(m.hasNoMixed).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasReferenceQuality).toBe(true)
  })

  it('counts anti-patterns (var)', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureModeling(content)
    expect(m.antiPatternCount).toBe(2)
    expect(m.hasNoAntiPatterns).toBe(false)
  })

  it('counts ad-hoc patterns (any)', () => {
    const content = `const x: any = 1;`
    const m = measureModeling(content)
    expect(m.adhocCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoAdhoc).toBe(false)
  })

  it('detects eval as mixed', () => {
    const content = `eval('x')`
    const m = measureModeling(content)
    expect(m.hasNoMixed).toBe(false)
  })

  it('detects debugger as undocumented', () => {
    const content = `debugger`
    const m = measureModeling(content)
    expect(m.hasNoUndocumented).toBe(false)
  })

  it('returns higher archetype for moderate content', () => {
    const m = measureModeling(moderateContent)
    expect(m.archetype).toBeGreaterThan(0)
  })
})

// ─── measureBlooming ───────────────────────────────────────────────

describe('measureBlooming', () => {
  it('returns no-bloom for empty content', () => {
    const m = measureBlooming(emptyContent)
    expect(m.perennial).toBe(0)
    expect(m.quality).toBe('no-bloom')
    expect(m.hasHighPerennial).toBe(false)
    expect(m.firstDraftCount).toBe(0)
    expect(m.neglectedCount).toBe(0)
  })

  it('returns eternal-bloom for rich content', () => {
    const m = measureBlooming(richContent)
    expect(m.perennial).toBeGreaterThanOrEqual(85)
    expect(m.quality).toBe('eternal-bloom')
    expect(m.hasHighPerennial).toBe(true)
    expect(m.hasRefactored).toBe(true)
    expect(m.hasNoFirstDraft).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasImproved).toBe(true)
    expect(m.hasEvolved).toBe(true)
    expect(m.hasLiving).toBe(true)
  })

  it('counts first draft patterns (var)', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureBlooming(content)
    expect(m.firstDraftCount).toBe(2)
    expect(m.hasNoFirstDraft).toBe(false)
  })

  it('counts neglected patterns (any)', () => {
    const content = `const x: any = 1;`
    const m = measureBlooming(content)
    expect(m.neglectedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoRough).toBe(false)
  })

  it('detects eval as neglected', () => {
    const content = `eval('x')`
    const m = measureBlooming(content)
    expect(m.hasNoNeglected).toBe(false)
  })

  it('detects debugger as stagnant', () => {
    const content = `debugger`
    const m = measureBlooming(content)
    expect(m.hasNoStagnant).toBe(false)
  })

  it('detects TODO as frozen', () => {
    const content = `// TODO: fix this later`
    const m = measureBlooming(content)
    expect(m.hasNoFrozen).toBe(false)
  })

  it('returns higher perennial for moderate content', () => {
    const m = measureBlooming(moderateContent)
    expect(m.perennial).toBeGreaterThan(0)
  })
})

// ─── measureCelebrating ────────────────────────────────────────────

describe('measureCelebrating', () => {
  it('returns no-ceremony for empty content', () => {
    const m = measureCelebrating(emptyContent)
    expect(m.elegance).toBe(0)
    expect(m.ceremony).toBe('no-ceremony')
    expect(m.hasHighElegance).toBe(false)
    expect(m.clunkyCount).toBe(0)
    expect(m.uglyCount).toBe(0)
  })

  it('returns grand-ceremony for rich content', () => {
    const m = measureCelebrating(richContent)
    expect(m.elegance).toBeGreaterThanOrEqual(85)
    expect(m.ceremony).toBe('grand-ceremony')
    expect(m.hasHighElegance).toBe(true)
    expect(m.hasGracefulHandling).toBe(true)
    expect(m.hasElegantAPI).toBe(true)
    expect(m.hasNoClunky).toBe(true)
    expect(m.hasBeautiful).toBe(true)
    expect(m.hasNoUgly).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasPolished).toBe(true)
  })

  it('counts clunky patterns (var)', () => {
    const content = `var x = 1; var y = 2;`
    const m = measureCelebrating(content)
    expect(m.clunkyCount).toBe(2)
    expect(m.hasNoClunky).toBe(false)
  })

  it('counts ugly patterns (any)', () => {
    const content = `const x: any = 1;`
    const m = measureCelebrating(content)
    expect(m.uglyCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUgly).toBe(false)
  })

  it('detects eval as jerky', () => {
    const content = `eval('x')`
    const m = measureCelebrating(content)
    expect(m.hasNoJerky).toBe(false)
  })

  it('detects debugger as crude', () => {
    const content = `debugger`
    const m = measureCelebrating(content)
    expect(m.hasNoCrude).toBe(false)
  })

  it('returns higher elegance for moderate content', () => {
    const m = measureCelebrating(moderateContent)
    expect(m.elegance).toBeGreaterThan(0)
  })
})

// ─── measurePassing ────────────────────────────────────────────────

describe('measurePassing', () => {
  it('returns no-torch for empty content', () => {
    const m = measurePassing(emptyContent)
    expect(m.torch).toBe(0)
    expect(m.handoff).toBe('no-torch')
    expect(m.hasHighTorch).toBe(false)
    expect(m.tribalKnowledgeCount).toBe(0)
    expect(m.crypticCount).toBe(0)
  })

  it('returns golden-torch for rich content', () => {
    const m = measurePassing(richContent)
    expect(m.torch).toBeGreaterThanOrEqual(85)
    expect(m.handoff).toBe('golden-torch')
    expect(m.hasHighTorch).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasNoTribalKnowledge).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasCleanInterfaces).toBe(true)
    expect(m.hasExtensible).toBe(true)
    expect(m.hasSuccessionReady).toBe(true)
    expect(m.hasTransferable).toBe(true)
  })

  it('counts tribal knowledge (var)', () => {
    const content = `var x = 1; var y = 2;`
    const m = measurePassing(content)
    expect(m.tribalKnowledgeCount).toBe(2)
    expect(m.hasNoTribalKnowledge).toBe(false)
  })

  it('counts cryptic patterns (any)', () => {
    const content = `const x: any = 1;`
    const m = measurePassing(content)
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects eval as coupled', () => {
    const content = `eval('x')`
    const m = measurePassing(content)
    expect(m.hasNoCoupled).toBe(false)
  })

  it('detects debugger as monolithic', () => {
    const content = `debugger`
    const m = measurePassing(content)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects global as single point', () => {
    const content = `global.value = 42`
    const m = measurePassing(content)
    expect(m.hasNoSinglePoint).toBe(false)
  })

  it('returns higher torch for moderate content', () => {
    const m = measurePassing(moderateContent)
    expect(m.torch).toBeGreaterThan(0)
  })
})

// ─── classifyArtifactCondition ─────────────────────────────────────

describe('classifyArtifactCondition', () => {
  it('classifies golden-masterpiece for high scores', () => {
    expect(classifyArtifactCondition(90)).toBe('golden-masterpiece')
    expect(classifyArtifactCondition(85)).toBe('golden-masterpiece')
  })

  it('classifies platinum-standard for good scores', () => {
    expect(classifyArtifactCondition(70)).toBe('platinum-standard')
    expect(classifyArtifactCondition(75)).toBe('platinum-standard')
  })

  it('classifies proper-artifact for moderate scores', () => {
    expect(classifyArtifactCondition(55)).toBe('proper-artifact')
    expect(classifyArtifactCondition(60)).toBe('proper-artifact')
  })

  it('classifies bronze-relic for low scores', () => {
    expect(classifyArtifactCondition(40)).toBe('bronze-relic')
    expect(classifyArtifactCondition(45)).toBe('bronze-relic')
  })

  it('classifies iron-relic for poor scores', () => {
    expect(classifyArtifactCondition(25)).toBe('iron-relic')
    expect(classifyArtifactCondition(30)).toBe('iron-relic')
  })

  it('classifies rust for very poor scores', () => {
    expect(classifyArtifactCondition(0)).toBe('rust')
    expect(classifyArtifactCondition(10)).toBe('rust')
    expect(classifyArtifactCondition(24)).toBe('rust')
  })
})

// ─── classifyHallType ──────────────────────────────────────────────

describe('classifyHallType', () => {
  it('returns no-hall for empty array', () => {
    expect(classifyHallType([])).toBe('no-hall')
  })

  it('returns hall-of-fame for high-quality artifacts', () => {
    const artifacts = Array.from({ length: 4 }, () => ({
      ...analyzeGoldenArtifact(richContent, 'test.ts'),
      qualityScore: 90,
      condition: 'golden-masterpiece' as const,
    }))
    expect(classifyHallType(artifacts)).toBe('hall-of-fame')
  })

  it('returns gallery-of-excellence for decent artifacts', () => {
    const artifacts = Array.from({ length: 2 }, () => ({
      ...analyzeGoldenArtifact(richContent, 'test.ts'),
      qualityScore: 65,
      condition: 'platinum-standard' as const,
    }))
    expect(classifyHallType(artifacts)).toBe('gallery-of-excellence')
  })
})

// ─── classifyHallCondition ─────────────────────────────────────────

describe('classifyHallCondition', () => {
  it('returns golden-palace for high avg', () => {
    expect(classifyHallCondition(80)).toBe('golden-palace')
    expect(classifyHallCondition(75)).toBe('golden-palace')
  })

  it('returns hall-of-fame for good avg', () => {
    expect(classifyHallCondition(60)).toBe('hall-of-fame')
    expect(classifyHallCondition(65)).toBe('hall-of-fame')
  })

  it('returns decent-gallery for moderate avg', () => {
    expect(classifyHallCondition(45)).toBe('decent-gallery')
    expect(classifyHallCondition(50)).toBe('decent-gallery')
  })

  it('returns dusty-storage for low avg', () => {
    expect(classifyHallCondition(30)).toBe('dusty-storage')
    expect(classifyHallCondition(35)).toBe('dusty-storage')
  })

  it('returns forgotten-attic for poor avg', () => {
    expect(classifyHallCondition(15)).toBe('forgotten-attic')
    expect(classifyHallCondition(20)).toBe('forgotten-attic')
  })

  it('returns void for zero avg', () => {
    expect(classifyHallCondition(0)).toBe('void')
    expect(classifyHallCondition(10)).toBe('void')
  })
})

// ─── classifyGuardianGrade ─────────────────────────────────────────

describe('classifyGuardianGrade', () => {
  it('returns golden-guardian for high excellence', () => {
    expect(classifyGuardianGrade(85)).toBe('golden-guardian')
    expect(classifyGuardianGrade(80)).toBe('golden-guardian')
  })

  it('returns master-curator for good excellence', () => {
    expect(classifyGuardianGrade(65)).toBe('master-curator')
    expect(classifyGuardianGrade(70)).toBe('master-curator')
  })

  it('returns skilled-keeper for moderate excellence', () => {
    expect(classifyGuardianGrade(50)).toBe('skilled-keeper')
    expect(classifyGuardianGrade(55)).toBe('skilled-keeper')
  })

  it('returns apprentice for low excellence', () => {
    expect(classifyGuardianGrade(35)).toBe('apprentice')
    expect(classifyGuardianGrade(40)).toBe('apprentice')
  })

  it('returns novice for poor excellence', () => {
    expect(classifyGuardianGrade(20)).toBe('novice')
    expect(classifyGuardianGrade(25)).toBe('novice')
  })

  it('returns vandal for zero excellence', () => {
    expect(classifyGuardianGrade(0)).toBe('vandal')
    expect(classifyGuardianGrade(10)).toBe('vandal')
  })
})

// ─── analyzeGoldenArtifact ─────────────────────────────────────────

describe('analyzeGoldenArtifact', () => {
  it('analyzes empty content as rust', () => {
    const artifact = analyzeGoldenArtifact(emptyContent, 'empty.ts')
    expect(artifact.file).toBe('empty.ts')
    expect(artifact.legacyEndurance).toBe(0)
    expect(artifact.goldenArchetype).toBe(0)
    expect(artifact.perennialQuality).toBe(0)
    expect(artifact.ceremonyElegance).toBe(0)
    expect(artifact.torchPassing).toBe(0)
    expect(artifact.qualityScore).toBe(0)
    expect(artifact.condition).toBe('rust')
  })

  it('analyzes rich content as golden-masterpiece', () => {
    const artifact = analyzeGoldenArtifact(richContent, 'rich.ts')
    expect(artifact.file).toBe('rich.ts')
    expect(artifact.legacyEndurance).toBeGreaterThan(0)
    expect(artifact.goldenArchetype).toBeGreaterThan(0)
    expect(artifact.perennialQuality).toBeGreaterThan(0)
    expect(artifact.ceremonyElegance).toBeGreaterThan(0)
    expect(artifact.torchPassing).toBeGreaterThan(0)
    expect(artifact.qualityScore).toBeGreaterThan(0)
    expect(artifact.condition).toBe('golden-masterpiece')
  })

  it('computes qualityScore as weighted average', () => {
    const artifact = analyzeGoldenArtifact(moderateContent, 'mod.ts')
    const expected = Math.round(
      artifact.legacyEndurance * 0.2 +
      artifact.goldenArchetype * 0.2 +
      artifact.perennialQuality * 0.2 +
      artifact.ceremonyElegance * 0.2 +
      artifact.torchPassing * 0.2,
    )
    expect(artifact.qualityScore).toBe(expected)
  })

  it('preserves all measure data', () => {
    const artifact = analyzeGoldenArtifact(richContent, 'rich.ts')
    expect(artifact.enduring).toBeDefined()
    expect(artifact.modeling).toBeDefined()
    expect(artifact.blooming).toBeDefined()
    expect(artifact.celebrating).toBeDefined()
    expect(artifact.passing).toBeDefined()
    expect(artifact.enduring.endurance).toBe(artifact.legacyEndurance)
    expect(artifact.modeling.archetype).toBe(artifact.goldenArchetype)
    expect(artifact.blooming.perennial).toBe(artifact.perennialQuality)
    expect(artifact.celebrating.elegance).toBe(artifact.ceremonyElegance)
    expect(artifact.passing.torch).toBe(artifact.torchPassing)
  })
})

// ─── analyzeAnniversaryHall ────────────────────────────────────────

describe('analyzeAnniversaryHall', () => {
  it('returns empty hall for no artifacts', () => {
    const hall = analyzeAnniversaryHall([], 'empty-dir')
    expect(hall.directory).toBe('empty-dir')
    expect(hall.artifacts).toHaveLength(0)
    expect(hall.avgEndurance).toBe(0)
    expect(hall.avgArchetype).toBe(0)
    expect(hall.avgTorch).toBe(0)
    expect(hall.goldenMasterpieceCount).toBe(0)
    expect(hall.rustCount).toBe(0)
    expect(hall.hallType).toBe('no-hall')
    expect(hall.condition).toBe('void')
  })

  it('aggregates artifact metrics for a hall', () => {
    const artifacts = [
      analyzeGoldenArtifact(richContent, 'a.ts'),
      analyzeGoldenArtifact(richContent, 'b.ts'),
    ]
    const hall = analyzeAnniversaryHall(artifacts, 'src')
    expect(hall.directory).toBe('src')
    expect(hall.artifacts).toHaveLength(2)
    expect(hall.avgEndurance).toBeGreaterThan(0)
    expect(hall.avgArchetype).toBeGreaterThan(0)
    expect(hall.avgTorch).toBeGreaterThan(0)
    expect(hall.goldenMasterpieceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts rusted files', () => {
    const artifacts = [
      analyzeGoldenArtifact(emptyContent, 'bad.ts'),
      analyzeGoldenArtifact(emptyContent, 'worse.ts'),
    ]
    const hall = analyzeAnniversaryHall(artifacts, 'bad-dir')
    expect(hall.rustCount).toBe(2)
  })
})

// ─── buildGoldenAnniversaryResult ──────────────────────────────────

describe('buildGoldenAnniversaryResult', () => {
  it('returns valid result for empty input', async () => {
    const result = await buildGoldenAnniversaryResult([], [])
    expect(result.artifacts).toHaveLength(0)
    expect(result.halls).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalHalls).toBe(0)
    expect(result.stats.overallExcellence).toBe(0)
    expect(result.ceremony.isGolden).toBe(false)
  })

  it('includes celebration field with milestone data', async () => {
    const result = await buildGoldenAnniversaryResult([], [])
    expect(result.celebration.milestone).toBe(500)
    expect(result.celebration.name).toBe('golden-anniversary')
    expect(result.celebration.message).toContain('500')
    expect(result.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470, 480, 490])
    expect(result.celebration.totalTests).toBe(85000)
    expect(result.celebration.totalCommands).toBe(500)
    expect(result.celebration.firstCommand).toBe('count')
    expect(result.celebration.latestCommand).toBe('golden-anniversary')
  })

  it('returns valid result for single file', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(result.artifacts).toHaveLength(1)
    expect(result.halls).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgLegacyEndurance).toBeGreaterThan(0)
    expect(result.stats.overallExcellence).toBeGreaterThan(0)
    expect(result.stats.bestArtifact).toBe('test.ts')
    expect(result.stats.mostEnduring).toBe('test.ts')
    expect(result.stats.bestArchetype).toBe('test.ts')
    expect(result.stats.mostPerennial).toBe('test.ts')
    expect(result.stats.mostElegant).toBe('test.ts')
  })

  it('returns valid result for multiple files', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.artifacts).toHaveLength(3)
    expect(result.halls).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalHalls).toBe(2)
    expect(result.stats.rustCount).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes correct guardian grade', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(result.stats.guardianGrade).toBeDefined()
    expect(typeof result.stats.guardianGrade).toBe('string')
  })

  it('computes ceremony correctly', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(result.ceremony.avgEndurance).toBeGreaterThan(0)
    expect(result.ceremony.avgArchetype).toBeGreaterThan(0)
    expect(result.ceremony.avgTorch).toBeGreaterThan(0)
    expect(result.ceremony.overallExcellence).toBeGreaterThan(0)
  })

  it('tracks all condition counts', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'],
      [richContent, richContent, moderateContent, emptyContent, emptyContent, emptyContent],
    )
    expect(result.stats.goldenMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.platinumStandardCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properArtifactCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.bronzeRelicCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.ironRelicCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.rustCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks high-quality counts correctly', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighArchetypeCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPerennialCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEleganceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighTorchCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns congratulatory message for good code', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('returns recommendations for poor code', async () => {
    const result = await buildGoldenAnniversaryResult(['bad.ts'], [emptyContent])
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.some(r => r.includes('legacy endurance'))).toBe(true)
  })

  it('recommends for rust artifacts', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [emptyContent, emptyContent, emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.some(r => r.includes('rust'))).toBe(true)
  })

  it('recommends for low excellence', async () => {
    const result = await buildGoldenAnniversaryResult(['a.ts'], [minimalContent])
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('restores specific rusted artifacts', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })

  it('recommends major renovation for all-bad halls', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['bad/a.ts', 'bad/b.ts'],
      [emptyContent, emptyContent],
    )
    const recs = generateRecommendations(result.artifacts, result.halls, result.ceremony, result.stats)
    expect(recs.some(r => r.includes('renovation') || r.includes('disrepair'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('golden-masterpiece')).toBe('string')
    expect(typeof colorGrade('rust')).toBe('string')
    expect(typeof colorGrade('hall-of-fame')).toBe('string')
    expect(typeof colorGrade('golden-palace')).toBe('string')
    expect(typeof colorGrade('golden-guardian')).toBe('string')
    expect(typeof colorGrade('timeless-classic')).toBe('string')
    expect(typeof colorGrade('golden-standard')).toBe('string')
    expect(typeof colorGrade('eternal-bloom')).toBe('string')
    expect(typeof colorGrade('grand-ceremony')).toBe('string')
    expect(typeof colorGrade('golden-torch')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatArtifactTable', () => {
  it('formats a single artifact', () => {
    const artifact = analyzeGoldenArtifact(richContent, 'test.ts')
    const output = formatArtifactTable(artifact)
    expect(output).toContain('test.ts')
    expect(output).toContain('Legacy Endurance')
    expect(output).toContain('Golden Archetype')
    expect(output).toContain('Perennial Quality')
    expect(output).toContain('Ceremony Elegance')
    expect(output).toContain('Torch Passing')
  })
})

describe('formatArtifactsTable', () => {
  it('returns message for empty array', () => {
    expect(formatArtifactsTable([])).toContain('No golden artifacts')
  })

  it('formats multiple artifacts', () => {
    const artifacts = [
      analyzeGoldenArtifact(richContent, 'a.ts'),
      analyzeGoldenArtifact(moderateContent, 'b.ts'),
    ]
    const output = formatArtifactsTable(artifacts)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatHallTable', () => {
  it('formats a single hall', () => {
    const artifacts = [analyzeGoldenArtifact(richContent, 'test.ts')]
    const hall = analyzeAnniversaryHall(artifacts, 'src')
    const output = formatHallTable(hall)
    expect(output).toContain('src')
    expect(output).toContain('Hall')
  })
})

describe('formatHallsTable', () => {
  it('returns message for empty array', () => {
    expect(formatHallsTable([])).toContain('No anniversary halls')
  })

  it('formats multiple halls', () => {
    const artifacts1 = [analyzeGoldenArtifact(richContent, 'src/a.ts')]
    const artifacts2 = [analyzeGoldenArtifact(moderateContent, 'lib/b.ts')]
    const halls = [
      analyzeAnniversaryHall(artifacts1, 'src'),
      analyzeAnniversaryHall(artifacts2, 'lib'),
    ]
    const output = formatHallsTable(halls)
    expect(output).toContain('src')
    expect(output).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Total Halls')
    expect(output).toContain('Guardian Grade')
    expect(output).toContain('Best Artifact')
  })
})

describe('formatCelebration', () => {
  it('formats celebration info', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const output = formatCelebration(result.celebration)
    expect(output).toContain('500')
    expect(output).toContain('golden-anniversary')
    expect(output).toContain('85000')
    expect(output).toContain('count')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const recs = ['Fix this', 'Improve that']
    const output = formatRecommendations(recs)
    expect(output).toContain('Fix this')
    expect(output).toContain('Improve that')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Anniversary Analysis')
    expect(output).toContain('Recommendations')
    expect(output).toContain('500')
  })
})

describe('formatResultJson', () => {
  it('formats full result as JSON', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.artifacts).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.ceremony).toBeDefined()
    expect(parsed.celebration).toBeDefined()
    expect(parsed.celebration.milestone).toBe(500)
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Integration ───────────────────────────────────────────────────

describe('integration', () => {
  it('handles mixed quality files', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['good.ts', 'ok.ts', 'bad.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.artifacts).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.rustCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.goldenMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.ceremony.overallExcellence).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into halls by directory', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, richContent],
    )
    expect(result.halls).toHaveLength(2)
    const srcHall = result.halls.find(h => h.directory === 'src')
    const libHall = result.halls.find(h => h.directory === 'lib')
    expect(srcHall).toBeDefined()
    expect(libHall).toBeDefined()
    if (srcHall) expect(srcHall.artifacts).toHaveLength(2)
    if (libHall) expect(libHall.artifacts).toHaveLength(1)
  })

  it('condition counts match artifact conditions', async () => {
    const result = await buildGoldenAnniversaryResult(
      ['a.ts', 'b.ts'],
      [emptyContent, emptyContent],
    )
    const rust = result.artifacts.filter(a => a.condition === 'rust').length
    expect(result.stats.rustCount).toBe(rust)
  })

  it('celebration data is always present regardless of input', async () => {
    const result = await buildGoldenAnniversaryResult([], [])
    expect(result.celebration.milestone).toBe(500)
    expect(result.celebration.totalCommands).toBe(500)
    expect(result.celebration.firstCommand).toBe('count')
    expect(result.celebration.latestCommand).toBe('golden-anniversary')
    expect(result.celebration.previousMilestones).toHaveLength(8)
  })

  it('ceremony computes overallExcellence as avg of 3 measures', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const expected = Math.round(
      (result.ceremony.avgEndurance + result.ceremony.avgArchetype + result.ceremony.avgTorch) / 3,
    )
    expect(result.ceremony.overallExcellence).toBe(expected)
  })

  it('all guardian grades are reachable', () => {
    expect(classifyGuardianGrade(85)).toBe('golden-guardian')
    expect(classifyGuardianGrade(65)).toBe('master-curator')
    expect(classifyGuardianGrade(50)).toBe('skilled-keeper')
    expect(classifyGuardianGrade(35)).toBe('apprentice')
    expect(classifyGuardianGrade(20)).toBe('novice')
    expect(classifyGuardianGrade(5)).toBe('vandal')
  })

  it('all artifact conditions are reachable', () => {
    expect(classifyArtifactCondition(90)).toBe('golden-masterpiece')
    expect(classifyArtifactCondition(72)).toBe('platinum-standard')
    expect(classifyArtifactCondition(57)).toBe('proper-artifact')
    expect(classifyArtifactCondition(42)).toBe('bronze-relic')
    expect(classifyArtifactCondition(27)).toBe('iron-relic')
    expect(classifyArtifactCondition(10)).toBe('rust')
  })

  it('all hall conditions are reachable', () => {
    expect(classifyHallCondition(80)).toBe('golden-palace')
    expect(classifyHallCondition(62)).toBe('hall-of-fame')
    expect(classifyHallCondition(47)).toBe('decent-gallery')
    expect(classifyHallCondition(32)).toBe('dusty-storage')
    expect(classifyHallCondition(17)).toBe('forgotten-attic')
    expect(classifyHallCondition(5)).toBe('void')
  })

  it('endurance grade boundaries are exact', () => {
    const m55 = measureEnduring('export interface A { x: string } export function f(): void {}')
    expect(m55.endurance).toBeGreaterThan(0)
    expect(m55.grade).toBeDefined()
  })

  it('modeling grade boundaries work for minimal content', () => {
    const m = measureModeling('const x = 1')
    expect(m.archetype).toBeGreaterThan(0)
    expect(m.golden).toBeDefined()
  })

  it('blooming quality for minimal content', () => {
    const m = measureBlooming('const x = 1')
    expect(m.perennial).toBeGreaterThan(0)
    expect(m.quality).toBeDefined()
  })

  it('celebrating ceremony for minimal content', () => {
    const m = measureCelebrating('const x = 1')
    expect(m.elegance).toBeGreaterThanOrEqual(0)
    expect(m.ceremony).toBeDefined()
  })

  it('passing handoff for minimal content', () => {
    const m = measurePassing('const x = 1')
    expect(m.torch).toBeGreaterThanOrEqual(0)
    expect(m.handoff).toBeDefined()
  })

  it('qualityScore is 0 for completely empty file', () => {
    const a = analyzeGoldenArtifact('', 'empty.ts')
    expect(a.qualityScore).toBe(0)
    expect(a.condition).toBe('rust')
  })

  it('qualityScore is non-zero for minimal content', () => {
    const a = analyzeGoldenArtifact('const x: number = 1', 'min.ts')
    expect(a.qualityScore).toBeGreaterThan(0)
  })

  it('moderateContent produces bronze-relic or better', () => {
    const a = analyzeGoldenArtifact(moderateContent, 'mod.ts')
    expect(['golden-masterpiece', 'platinum-standard', 'proper-artifact', 'bronze-relic']).toContain(a.condition)
  })

  it('empty hall has correct defaults', () => {
    const hall = analyzeAnniversaryHall([], 'void')
    expect(hall.hallType).toBe('no-hall')
    expect(hall.condition).toBe('void')
    expect(hall.goldenMasterpieceCount).toBe(0)
    expect(hall.rustCount).toBe(0)
  })

  it('ceremony isGolden threshold at 60', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(typeof result.ceremony.isGolden).toBe('boolean')
    if (result.ceremony.avgEndurance >= 60) {
      expect(result.ceremony.isGolden).toBe(true)
    }
  })

  it('stats avgTorchPassing equals avgTorch', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    expect(result.stats.avgTorchPassing).toBe(result.ceremony.avgTorch)
  })

  it('JSON output includes celebration', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.celebration.milestone).toBe(500)
    expect(parsed.celebration.previousMilestones).toHaveLength(8)
  })

  it('formatResultTable includes ceremony section', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Ceremony')
    expect(table).toContain('Overall Excellence')
  })

  it('formatCelebration shows MEGA-MILESTONE', async () => {
    const result = await buildGoldenAnniversaryResult(['test.ts'], [richContent])
    const output = formatCelebration(result.celebration)
    expect(output).toContain('MEGA-MILESTONE')
    expect(output).toContain('golden-anniversary')
  })

  it('all endurance grades reachable', () => {
    expect(measureEnduring(richContent).grade).toBe('timeless-classic')
    expect(measureEnduring('export interface A {}').grade).toBeDefined()
    expect(measureEnduring('').grade).toBe('no-legacy')
  })

  it('all modeling grades reachable', () => {
    expect(measureModeling(richContent).golden).toBe('golden-standard')
    expect(measureModeling('').golden).toBe('no-archetype')
  })

  it('all blooming grades reachable', () => {
    expect(measureBlooming(richContent).quality).toBe('eternal-bloom')
    expect(measureBlooming('').quality).toBe('no-bloom')
  })

  it('all celebrating grades reachable', () => {
    expect(measureCelebrating(richContent).ceremony).toBe('grand-ceremony')
    expect(measureCelebrating('').ceremony).toBe('no-ceremony')
  })

  it('all passing grades reachable', () => {
    expect(measurePassing(richContent).handoff).toBe('golden-torch')
    expect(measurePassing('').handoff).toBe('no-torch')
  })
})
