import { describe, it, expect } from 'vitest'
import {
  measureNavigating,
  measurePreserving,
  measureTwisting,
  measureTaming,
  measureTracing,
  classifyPathCondition,
  classifyWingType,
  classifyWingCondition,
  classifyArchitectGrade,
  analyzeAmberPath,
  analyzeLabyrinthWing,
  buildAmberLabyrinthResult,
  generateRecommendations,
} from '../src/commands/amber-labyrinth-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPathTable,
  formatPathsTable,
  formatWingTable,
  formatWingsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amber-labyrinth-format-helpers.js'
import type {
  AmberPath,
  AmberLabyrinthResult,
  AmberLabyrinthStats,
} from '../src/commands/amber-labyrinth-helpers.js'

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
    break
  case Status.Inactive:
    break
  default:
    break
}

const filtered = users.filter(u => u.age > 18).map(u => u.name)
const total = users.reduce((sum, u) => sum + u.age, 0)
`

const poorContent = `var x = 1; var y = 2; any; eval("test"); debugger;`

// ─── measureNavigating ────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns 0 clarity for empty content', () => {
    const m = measureNavigating(emptyContent)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('dead-end')
    expect(m.hasHighClarity).toBe(false)
  })

  it('detects readable flow in rich content', () => {
    const m = measureNavigating(richContent)
    expect(m.hasReadableFlow).toBe(true)
    expect(m.hasLogicalSequence).toBe(true)
    expect(m.hasWellStructured).toBe(true)
  })

  it('detects spaghetti code in poor content', () => {
    const m = measureNavigating(poorContent)
    expect(m.spaghettiCount).toBeGreaterThan(0)
    expect(m.hasNoSpaghetti).toBe(false)
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects organized patterns in rich content', () => {
    const m = measureNavigating(richContent)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasClearPath).toBe(true)
    expect(m.hasNavigable).toBe(true)
  })

  it('classifies grade correctly', () => {
    expect(measureNavigating(richContent).grade).not.toBe('dead-end')
    expect(measureNavigating(emptyContent).grade).toBe('dead-end')
  })

  it('has clarity capped at 100', () => {
    const m = measureNavigating(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measurePreserving ────────────────────────────────────────────

describe('measurePreserving', () => {
  it('returns 0 preservation for empty content', () => {
    const m = measurePreserving(emptyContent)
    expect(m.preservation).toBe(0)
    expect(m.amber).toBe('no-amber')
    expect(m.hasHighPreservation).toBe(false)
  })

  it('detects documented patterns in rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellNamed).toBe(true)
    expect(m.hasCommented).toBe(true)
  })

  it('detects cryptic code in poor content', () => {
    const m = measurePreserving(poorContent)
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.silentCount).toBeGreaterThan(0)
    expect(m.hasNoSilent).toBe(false)
  })

  it('detects descriptive patterns in rich content', () => {
    const m = measurePreserving(richContent)
    expect(m.hasDescriptive).toBe(true)
    expect(m.hasMeaningful).toBe(true)
    expect(m.hasPreserved).toBe(true)
  })

  it('classifies amber correctly', () => {
    expect(measurePreserving(emptyContent).amber).toBe('no-amber')
    expect(measurePreserving(richContent).amber).not.toBe('no-amber')
  })

  it('has preservation capped at 100', () => {
    const m = measurePreserving(richContent)
    expect(m.preservation).toBeLessThanOrEqual(100)
  })
})

// ─── measureTwisting ──────────────────────────────────────────────

describe('measureTwisting', () => {
  it('returns 0 coherence for empty content', () => {
    const m = measureTwisting(emptyContent)
    expect(m.coherence).toBe(0)
    expect(m.twist).toBe('no-coherence')
    expect(m.hasHighCoherence).toBe(false)
  })

  it('detects logical branching in rich content', () => {
    const m = measureTwisting(richContent)
    expect(m.hasLogicalBranching).toBe(true)
    expect(m.hasStructuredIfElse).toBe(true)
    expect(m.hasClearConditions).toBe(true)
  })

  it('detects contradictory code in poor content', () => {
    const m = measureTwisting(poorContent)
    expect(m.contradictoryCount).toBeGreaterThan(0)
    expect(m.hasNoContradictory).toBe(false)
    expect(m.nestedMessCount).toBeGreaterThan(0)
    expect(m.hasNoNestedMess).toBe(false)
  })

  it('detects ordered patterns in rich content', () => {
    const m = measureTwisting(richContent)
    expect(m.hasOrdered).toBe(true)
    expect(m.hasCoherent).toBe(true)
  })

  it('classifies twist correctly', () => {
    expect(measureTwisting(emptyContent).twist).toBe('no-coherence')
    expect(measureTwisting(richContent).twist).not.toBe('no-coherence')
  })

  it('has coherence capped at 100', () => {
    const m = measureTwisting(richContent)
    expect(m.coherence).toBeLessThanOrEqual(100)
  })
})

// ─── measureTaming ────────────────────────────────────────────────

describe('measureTaming', () => {
  it('returns 0 handling for empty content', () => {
    const m = measureTaming(emptyContent)
    expect(m.handling).toBe(0)
    expect(m.minotaur).toBe('no-handling')
    expect(m.hasHighHandling).toBe(false)
  })

  it('detects complexity managed in rich content', () => {
    const m = measureTaming(richContent)
    expect(m.hasComplexityManaged).toBe(true)
    expect(m.hasAbstractionUsed).toBe(true)
    expect(m.hasDecomposed).toBe(true)
  })

  it('detects god functions in poor content', () => {
    const m = measureTaming(poorContent)
    expect(m.godFunctionCount).toBeGreaterThan(0)
    expect(m.hasNoGodFunctions).toBe(false)
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('detects pattern applied in rich content', () => {
    const m = measureTaming(richContent)
    expect(m.hasPatternApplied).toBe(true)
    expect(m.hasSimplified).toBe(true)
  })

  it('classifies minotaur correctly', () => {
    expect(measureTaming(emptyContent).minotaur).toBe('no-handling')
    expect(measureTaming(richContent).minotaur).not.toBe('no-handling')
  })

  it('has handling capped at 100', () => {
    const m = measureTaming(richContent)
    expect(m.handling).toBeLessThanOrEqual(100)
  })
})

// ─── measureTracing ───────────────────────────────────────────────

describe('measureTracing', () => {
  it('returns 0 followability for empty content', () => {
    const m = measureTracing(emptyContent)
    expect(m.followability).toBe(0)
    expect(m.thread).toBe('no-thread')
    expect(m.hasHighFollowability).toBe(false)
  })

  it('detects traceable patterns in rich content', () => {
    const m = measureTracing(richContent)
    expect(m.hasTraceable).toBe(true)
    expect(m.hasObservable).toBe(true)
    expect(m.hasDebuggable).toBe(true)
  })

  it('detects hidden calls in poor content', () => {
    const m = measureTracing(poorContent)
    expect(m.hiddenCallCount).toBeGreaterThan(0)
    expect(m.hasNoHiddenCalls).toBe(false)
    expect(m.blackBoxCount).toBeGreaterThan(0)
    expect(m.hasNoBlackBoxes).toBe(false)
  })

  it('detects logged and transparent patterns in rich content', () => {
    const m = measureTracing(richContent)
    expect(m.hasLogged).toBe(true)
    expect(m.hasTransparent).toBe(true)
  })

  it('classifies thread correctly', () => {
    expect(measureTracing(emptyContent).thread).toBe('no-thread')
    expect(measureTracing(richContent).thread).not.toBe('no-thread')
  })

  it('has followability capped at 100', () => {
    const m = measureTracing(richContent)
    expect(m.followability).toBeLessThanOrEqual(100)
  })
})

// ─── classifyPathCondition ────────────────────────────────────────

describe('classifyPathCondition', () => {
  it('classifies golden-maze for high scores', () => {
    expect(classifyPathCondition(90)).toBe('golden-maze')
    expect(classifyPathCondition(85)).toBe('golden-maze')
  })

  it('classifies amber-sanctuary for good scores', () => {
    expect(classifyPathCondition(70)).toBe('amber-sanctuary')
    expect(classifyPathCondition(75)).toBe('amber-sanctuary')
  })

  it('classifies proper-labyrinth for moderate scores', () => {
    expect(classifyPathCondition(55)).toBe('proper-labyrinth')
    expect(classifyPathCondition(60)).toBe('proper-labyrinth')
  })

  it('classifies crumbling-maze for low scores', () => {
    expect(classifyPathCondition(40)).toBe('crumbling-maze')
    expect(classifyPathCondition(45)).toBe('crumbling-maze')
  })

  it('classifies dark-tunnel for poor scores', () => {
    expect(classifyPathCondition(25)).toBe('dark-tunnel')
    expect(classifyPathCondition(30)).toBe('dark-tunnel')
  })

  it('classifies collapsed for very low scores', () => {
    expect(classifyPathCondition(0)).toBe('collapsed')
    expect(classifyPathCondition(10)).toBe('collapsed')
    expect(classifyPathCondition(24)).toBe('collapsed')
  })
})

// ─── classifyWingType ─────────────────────────────────────────────

describe('classifyWingType', () => {
  it('returns no-wing for empty paths', () => {
    expect(classifyWingType([])).toBe('no-wing')
  })

  it('classifies grand-labyrinth for high quality with golden ratio', () => {
    const ap: AmberPath = {
      file: 'a.ts', pathClarity: 90, amberPreservation: 90, twistCoherence: 90,
      minotaurHandling: 90, threadFollowability: 90,
      navigating: { clarity: 90, grade: 'golden-corridor', hasHighClarity: true, hasReadableFlow: true, hasLogicalSequence: true, hasNoSpaghetti: true, hasWellStructured: true, hasNoChaotic: true, hasOrganized: true, hasNoScattered: true, hasClearPath: true, hasNoConfusing: true, hasNavigable: true, spaghettiCount: 0, chaoticCount: 0 },
      preserving: { preservation: 90, amber: 'perfect-amber', hasHighPreservation: true, hasDocumented: true, hasWellNamed: true, hasNoCryptic: true, hasCommented: true, hasNoSilent: true, hasDescriptive: true, hasNoVague: true, hasMeaningful: true, hasNoArbitrary: true, hasPreserved: true, crypticCount: 0, silentCount: 0 },
      twisting: { coherence: 90, twist: 'logical-labyrinth', hasHighCoherence: true, hasLogicalBranching: true, hasConsistentConditions: true, hasNoContradictory: true, hasStructuredIfElse: true, hasNoNestedMess: true, hasClearConditions: true, hasNoVague: true, hasOrdered: true, hasNoRandom: true, hasCoherent: true, contradictoryCount: 0, nestedMessCount: 0 },
      taming: { handling: 90, minotaur: 'beast-tamer', hasHighHandling: true, hasComplexityManaged: true, hasAbstractionUsed: true, hasNoGodFunctions: true, hasDecomposed: true, hasNoMonolithic: true, hasPatternApplied: true, hasNoSpaghetti: true, hasSimplified: true, hasNoOverComplicated: true, hasControlled: true, godFunctionCount: 0, monolithicCount: 0 },
      tracing: { followability: 90, thread: 'golden-thread', hasHighFollowability: true, hasTraceable: true, hasNoHiddenCalls: true, hasObservable: true, hasNoBlackBoxes: true, hasDebuggable: true, hasNoOpaque: true, hasLogged: true, hasNoSilent: true, hasTransparent: true, hasNoMysterious: true, hiddenCallCount: 0, blackBoxCount: 0 },
      condition: 'golden-maze', qualityScore: 90,
    }
    const result = classifyWingType([ap])
    expect(result).toBe('grand-labyrinth')
  })
})

// ─── classifyWingCondition ────────────────────────────────────────

describe('classifyWingCondition', () => {
  it('classifies magnificent-maze for high avg', () => {
    expect(classifyWingCondition(80)).toBe('magnificent-maze')
    expect(classifyWingCondition(75)).toBe('magnificent-maze')
  })

  it('classifies golden-labyrinth for good avg', () => {
    expect(classifyWingCondition(60)).toBe('golden-labyrinth')
    expect(classifyWingCondition(70)).toBe('golden-labyrinth')
  })

  it('classifies decent-maze for moderate avg', () => {
    expect(classifyWingCondition(45)).toBe('decent-maze')
    expect(classifyWingCondition(55)).toBe('decent-maze')
  })

  it('classifies void for zero avg', () => {
    expect(classifyWingCondition(0)).toBe('void')
    expect(classifyWingCondition(10)).toBe('void')
  })
})

// ─── classifyArchitectGrade ───────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('classifies daedalus for high design', () => {
    expect(classifyArchitectGrade(85)).toBe('daedalus')
    expect(classifyArchitectGrade(80)).toBe('daedalus')
  })

  it('classifies master-architect for good design', () => {
    expect(classifyArchitectGrade(65)).toBe('master-architect')
    expect(classifyArchitectGrade(70)).toBe('master-architect')
  })

  it('classifies skilled-builder for moderate design', () => {
    expect(classifyArchitectGrade(50)).toBe('skilled-builder')
    expect(classifyArchitectGrade(55)).toBe('skilled-builder')
  })

  it('classifies apprentice for low design', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(40)).toBe('apprentice')
  })

  it('classifies novice for poor design', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(25)).toBe('novice')
  })

  it('classifies lost-soul for zero design', () => {
    expect(classifyArchitectGrade(0)).toBe('lost-soul')
    expect(classifyArchitectGrade(10)).toBe('lost-soul')
  })
})

// ─── analyzeAmberPath ─────────────────────────────────────────────

describe('analyzeAmberPath', () => {
  it('analyzes empty content', () => {
    const path = analyzeAmberPath(emptyContent, 'empty.ts')
    expect(path.file).toBe('empty.ts')
    expect(path.qualityScore).toBe(0)
    expect(path.condition).toBe('collapsed')
  })

  it('analyzes rich content with high scores', () => {
    const path = analyzeAmberPath(richContent, 'rich.ts')
    expect(path.qualityScore).toBeGreaterThan(50)
    expect(path.condition).not.toBe('collapsed')
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const path = analyzeAmberPath(moderateContent, 'mod.ts')
    const expected = Math.round(
      path.navigating.clarity * 0.2 +
      path.preserving.preservation * 0.2 +
      path.twisting.coherence * 0.2 +
      path.taming.handling * 0.2 +
      path.tracing.followability * 0.2,
    )
    expect(path.qualityScore).toBe(expected)
  })

  it('propagates measure scores to path fields', () => {
    const path = analyzeAmberPath(richContent, 'rich.ts')
    expect(path.pathClarity).toBe(path.navigating.clarity)
    expect(path.amberPreservation).toBe(path.preserving.preservation)
    expect(path.twistCoherence).toBe(path.twisting.coherence)
    expect(path.minotaurHandling).toBe(path.taming.handling)
    expect(path.threadFollowability).toBe(path.tracing.followability)
  })
})

// ─── analyzeLabyrinthWing ─────────────────────────────────────────

describe('analyzeLabyrinthWing', () => {
  it('returns empty wing for no paths', () => {
    const wing = analyzeLabyrinthWing([], 'empty-dir')
    expect(wing.directory).toBe('empty-dir')
    expect(wing.paths).toHaveLength(0)
    expect(wing.wingType).toBe('no-wing')
    expect(wing.condition).toBe('void')
  })

  it('computes averages from paths', () => {
    const path = analyzeAmberPath(richContent, 'dir/rich.ts')
    const wing = analyzeLabyrinthWing([path], 'dir')
    expect(wing.avgClarity).toBe(path.pathClarity)
    expect(wing.avgCoherence).toBe(path.twistCoherence)
    expect(wing.avgFollowability).toBe(path.threadFollowability)
  })
})

// ─── buildAmberLabyrinthResult ────────────────────────────────────

describe('buildAmberLabyrinthResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmberLabyrinthResult([], [])
    expect(result.paths).toHaveLength(0)
    expect(result.wings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.maze.isNavigable).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildAmberLabyrinthResult(['index.ts'], [richContent])
    expect(result.paths).toHaveLength(1)
    expect(result.wings).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('analyzes multiple files in same directory', async () => {
    const result = await buildAmberLabyrinthResult(
      ['src/a.ts', 'src/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.paths).toHaveLength(2)
    expect(result.wings).toHaveLength(1)
  })

  it('computes maze summary correctly', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    expect(result.maze.avgClarity).toBeGreaterThan(0)
    expect(result.maze.avgCoherence).toBeGreaterThan(0)
    expect(result.maze.avgFollowability).toBeGreaterThan(0)
    expect(result.maze.overallDesign).toBeGreaterThan(0)
  })

  it('computes condition counts', async () => {
    const result = await buildAmberLabyrinthResult(
      ['g.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    const total = result.stats.goldenMazeCount +
      result.stats.amberSanctuaryCount +
      result.stats.properLabyrinthCount +
      result.stats.crumblingMazeCount +
      result.stats.darkTunnelCount +
      result.stats.collapsedCount
    expect(total).toBe(2)
  })

  it('computes hasHigh counts', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPreservationCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighCoherenceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighHandlingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFollowabilityCount).toBeGreaterThanOrEqual(0)
  })

  it('computes best fields', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestPath).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
    expect(result.stats.bestPreserved).toBeDefined()
    expect(result.stats.mostCoherent).toBeDefined()
    expect(result.stats.bestThread).toBeDefined()
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for good code', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('suggests path clarity improvement for low clarity', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('path clarity') || r.includes('clarity'))
    expect(rec).toBe(true)
  })

  it('suggests amber preservation improvement for low preservation', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('amber preservation') || r.includes('preservation'))
    expect(rec).toBe(true)
  })

  it('suggests twist coherence improvement for low coherence', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('twist coherence') || r.includes('coherence'))
    expect(rec).toBe(true)
  })

  it('mentions collapsed files', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [emptyContent])
    const rec = result.recommendations.some(r => r.includes('collapsed'))
    expect(rec).toBe(true)
  })
})

// ─── colorScore ───────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

// ─── colorGrade ───────────────────────────────────────────────────

describe('colorGrade', () => {
  it('returns a string for any grade', () => {
    expect(typeof colorGrade('golden-corridor')).toBe('string')
    expect(typeof colorGrade('collapsed')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

// ─── formatPathTable ──────────────────────────────────────────────

describe('formatPathTable', () => {
  it('formats a path', () => {
    const ap = analyzeAmberPath(richContent, 'rich.ts')
    const formatted = formatPathTable(ap)
    expect(formatted).toContain('rich.ts')
    expect(formatted).toContain('Path Clarity')
    expect(formatted).toContain('Amber Preservation')
    expect(formatted).toContain('Twist Coherence')
    expect(formatted).toContain('Score')
  })
})

// ─── formatPathsTable ─────────────────────────────────────────────

describe('formatPathsTable', () => {
  it('returns message for empty paths', () => {
    expect(formatPathsTable([])).toContain('No amber paths')
  })
})

// ─── formatWingTable ──────────────────────────────────────────────

describe('formatWingTable', () => {
  it('formats a wing', () => {
    const ap = analyzeAmberPath(richContent, 'src/a.ts')
    const wing = analyzeLabyrinthWing([ap], 'src')
    const formatted = formatWingTable(wing)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Wing:')
    expect(formatted).toContain('Type:')
  })
})

// ─── formatWingsTable ─────────────────────────────────────────────

describe('formatWingsTable', () => {
  it('returns message for empty wings', () => {
    expect(formatWingsTable([])).toContain('No labyrinth wings')
  })
})

// ─── formatStatsTable ─────────────────────────────────────────────

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Overall Design')
    expect(formatted).toContain('Architect Grade')
    expect(formatted).toContain('Best Path')
  })
})

// ─── formatRecommendations ────────────────────────────────────────

describe('formatRecommendations', () => {
  it('returns message for empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

// ─── formatResultTable ────────────────────────────────────────────

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Amber Labyrinth Analysis')
    expect(formatted).toContain('Labyrinth Wings')
    expect(formatted).toContain('Amber Labyrinth Statistics')
    expect(formatted).toContain('Maze')
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatResultJson ─────────────────────────────────────────────

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.paths).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.maze).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── integration ──────────────────────────────────────────────────

describe('integration', () => {
  it('full pipeline with mixed content', async () => {
    const result = await buildAmberLabyrinthResult(
      ['src/good.ts', 'src/bad.ts', 'lib/mod.ts'],
      [richContent, poorContent, moderateContent],
    )
    expect(result.paths).toHaveLength(3)
    expect(result.wings).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.maze.overallDesign).toBeGreaterThan(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('maze isNavigable for high clarity', async () => {
    const result = await buildAmberLabyrinthResult(
      Array.from({ length: 5 }, (_, i) => `file${i}.ts`),
      Array.from({ length: 5 }, () => richContent),
    )
    expect(result.maze.isNavigable).toBe(true)
  })

  it('maze is not navigable for low clarity', async () => {
    const result = await buildAmberLabyrinthResult(['empty.ts'], [emptyContent])
    expect(result.maze.isNavigable).toBe(false)
  })

  it('overallDesign equals avg of clarity, coherence, followability', async () => {
    const result = await buildAmberLabyrinthResult(['a.ts'], [moderateContent])
    const expected = Math.round((result.maze.avgClarity + result.maze.avgCoherence + result.maze.avgFollowability) / 3)
    expect(result.maze.overallDesign).toBe(expected)
  })
})
