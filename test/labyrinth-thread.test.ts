import { describe, it, expect } from 'vitest'
import {
  measureNavigating, measureClarifying, measureResisting, measureThreading, measureExiting,
  classifyPathCondition, classifyLevelType, classifyNavigatorGrade, classifyLevelCondition,
  generateRecommendations, analyzeLabyrinthPath, analyzeLabyrinthLevel,
  buildLabyrinthThreadResult,
} from '../src/commands/labyrinth-thread-helpers.js'
import {
  colorScore, colorGrade, formatPathTable, formatPathsTable,
  formatLevelTable, formatLevelsTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/labyrinth-thread-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''

const RICH = [
  '/**',
  ' * Doc comment',
  ' */',
  'export interface Foo<T> { readonly bar: string }',
  'export type Result = string | number',
  'export class MyClass {',
  '  private x: number = 0',
  '}',
  'export const fn = async (): Promise<string> => {',
  '  const a: string = \'hello\'',
  '  if (a === \'test\') { return a }',
  '  return \'world\'',
  '}',
  'import path from \'node:path\'',
].join('\n')

const MINIMAL = 'const x = 1'

const BAD = 'export var x: any = 1; var y: any = 2; debugger;'

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns solvability=0 and no-exit for empty content', () => {
    const m = measureNavigating(EMPTY)
    expect(m.solvability).toBe(0)
    expect(m.grade).toBe('no-exit')
  })

  it('returns solvability=100 and open-garden for rich content', () => {
    const m = measureNavigating(RICH)
    expect(m.solvability).toBe(100)
    expect(m.grade).toBe('open-garden')
  })

  it('returns solvability=8 for minimal content', () => {
    expect(measureNavigating(MINIMAL).solvability).toBe(8)
  })

  it('detects impassable and dead-end in bad content', () => {
    const m = measureNavigating(BAD)
    expect(m.impassableCount).toBe(2)
    expect(m.deadEndCount).toBe(2)
    expect(m.hasNoImpassable).toBe(false)
    expect(m.hasNoDeadEnd).toBe(false)
  })

  it('sets hasHighSolvability=true for rich content', () => {
    expect(measureNavigating(RICH).hasHighSolvability).toBe(true)
  })

  it('sets hasHighSolvability=false for empty content', () => {
    expect(measureNavigating(EMPTY).hasHighSolvability).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureNavigating(RICH)
    expect(m.hasNavigable).toBe(true)
    expect(m.hasTraversable).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasReachable).toBe(true)
    expect(m.hasAccessible).toBe(true)
    expect(m.hasOpen).toBe(true)
  })

  it('detects debugger via hasNoWalled=false for bad content', () => {
    expect(measureNavigating(BAD).hasNoWalled).toBe(false)
  })

  it('has no blocked for clean content', () => {
    expect(measureNavigating(RICH).hasNoBlocked).toBe(true)
    expect(measureNavigating(MINIMAL).hasNoBlocked).toBe(true)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns clarity=0 and invisible for empty content', () => {
    const m = measureClarifying(EMPTY)
    expect(m.clarity).toBe(0)
    expect(m.path).toBe('invisible')
  })

  it('returns clarity=100 and golden-thread for rich content', () => {
    const m = measureClarifying(RICH)
    expect(m.clarity).toBe(100)
    expect(m.path).toBe('golden-thread')
  })

  it('returns clarity=8 for minimal content', () => {
    expect(measureClarifying(MINIMAL).clarity).toBe(8)
  })

  it('detects cryptic and hidden in bad content', () => {
    const m = measureClarifying(BAD)
    expect(m.crypticCount).toBe(2)
    expect(m.hiddenCount).toBe(2)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoHidden).toBe(false)
  })

  it('sets hasHighClarity=true for rich content', () => {
    expect(measureClarifying(RICH).hasHighClarity).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureClarifying(RICH)
    expect(m.hasReadable).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasObvious).toBe(true)
    expect(m.hasExplicit).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasLuminous).toBe(true)
  })

  it('detects debugger via hasNoOpaque=false for bad content', () => {
    expect(measureClarifying(BAD).hasNoOpaque).toBe(false)
  })

  it('has no implicit for clean content', () => {
    expect(measureClarifying(RICH).hasNoImplicit).toBe(true)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns resistance=0 and devoured for empty content', () => {
    const m = measureResisting(EMPTY)
    expect(m.resistance).toBe(0)
    expect(m.defense).toBe('devoured')
  })

  it('returns resistance=100 and invincible for rich content', () => {
    const m = measureResisting(RICH)
    expect(m.resistance).toBe(100)
    expect(m.defense).toBe('invincible')
  })

  it('returns resistance=10 for minimal content', () => {
    expect(measureResisting(MINIMAL).resistance).toBe(10)
  })

  it('detects buggy and exposed in bad content', () => {
    const m = measureResisting(BAD)
    expect(m.buggyCount).toBe(2)
    expect(m.exposedCount).toBe(2)
    expect(m.hasNoBuggy).toBe(false)
    expect(m.hasNoExposed).toBe(false)
  })

  it('sets hasHighResistance=true for rich content', () => {
    expect(measureResisting(RICH).hasHighResistance).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureResisting(RICH)
    expect(m.hasBugFree).toBe(true)
    expect(m.hasHardened).toBe(true)
    expect(m.hasDefensive).toBe(true)
    expect(m.hasProtected).toBe(true)
    expect(m.hasGuarded).toBe(true)
    expect(m.hasSafe).toBe(true)
  })

  it('detects debugger via hasNoUnguarded=false for bad content', () => {
    expect(measureResisting(BAD).hasNoUnguarded).toBe(false)
  })

  it('has no vulnerable for clean content', () => {
    expect(measureResisting(RICH).hasNoVulnerable).toBe(true)
  })
})

// ─── measureThreading ──────────────────────────────────────────────

describe('measureThreading', () => {
  it('returns strength=0 and snapped for empty content', () => {
    const m = measureThreading(EMPTY)
    expect(m.strength).toBe(0)
    expect(m.thread).toBe('snapped')
  })

  it('returns strength=100 and unbreakable for rich content', () => {
    const m = measureThreading(RICH)
    expect(m.strength).toBe(100)
    expect(m.thread).toBe('unbreakable')
  })

  it('returns strength=8 for minimal content', () => {
    expect(measureThreading(MINIMAL).strength).toBe(8)
  })

  it('detects untraceable and lost in bad content', () => {
    const m = measureThreading(BAD)
    expect(m.untraceableCount).toBe(2)
    expect(m.lostCount).toBe(2)
    expect(m.hasNoUntraceable).toBe(false)
    expect(m.hasNoLost).toBe(false)
  })

  it('sets hasHighStrength=true for rich content', () => {
    expect(measureThreading(RICH).hasHighStrength).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureThreading(RICH)
    expect(m.hasTraceable).toBe(true)
    expect(m.hasTrackable).toBe(true)
    expect(m.hasDebuggable).toBe(true)
    expect(m.hasObservable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasFollowable).toBe(true)
  })

  it('detects debugger via hasNoOpaque=false for bad content', () => {
    expect(measureThreading(BAD).hasNoOpaque).toBe(false)
  })

  it('has no invisible for clean content', () => {
    expect(measureThreading(RICH).hasNoInvisible).toBe(true)
  })
})

// ─── measureExiting ────────────────────────────────────────────────

describe('measureExiting', () => {
  it('returns accessibility=0 and no-exit for empty content', () => {
    const m = measureExiting(EMPTY)
    expect(m.accessibility).toBe(0)
    expect(m.exit).toBe('no-exit')
  })

  it('returns accessibility=100 and grand-gate for rich content', () => {
    const m = measureExiting(RICH)
    expect(m.accessibility).toBe(100)
    expect(m.exit).toBe('grand-gate')
  })

  it('returns accessibility=8 for minimal content', () => {
    expect(measureExiting(MINIMAL).accessibility).toBe(8)
  })

  it('detects trapped and abrupt in bad content', () => {
    const m = measureExiting(BAD)
    expect(m.trappedCount).toBe(2)
    expect(m.abruptCount).toBe(2)
    expect(m.hasNoTrapped).toBe(false)
    expect(m.hasNoAbrupt).toBe(false)
  })

  it('sets hasHighAccessibility=true for rich content', () => {
    expect(measureExiting(RICH).hasHighAccessibility).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureExiting(RICH)
    expect(m.hasEscapable).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasSafe).toBe(true)
    expect(m.hasHandled).toBe(true)
  })

  it('detects debugger via hasNoCrash=false for bad content', () => {
    expect(measureExiting(BAD).hasNoCrash).toBe(false)
  })

  it('has no messy for clean content', () => {
    expect(measureExiting(RICH).hasNoMessy).toBe(true)
  })
})

// ─── classifyPathCondition ─────────────────────────────────────────

describe('classifyPathCondition', () => {
  it('returns theseus-victory for 90', () => {
    expect(classifyPathCondition(90)).toBe('theseus-victory')
  })
  it('returns clever-navigator for 75', () => {
    expect(classifyPathCondition(75)).toBe('clever-navigator')
  })
  it('returns proper-explorer for 60', () => {
    expect(classifyPathCondition(60)).toBe('proper-explorer')
  })
  it('returns lost-wanderer for 45', () => {
    expect(classifyPathCondition(45)).toBe('lost-wanderer')
  })
  it('returns trapped-soul for 30', () => {
    expect(classifyPathCondition(30)).toBe('trapped-soul')
  })
  it('returns minotaur-victim for 10', () => {
    expect(classifyPathCondition(10)).toBe('minotaur-victim')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns ariadne for 85', () => {
    expect(classifyNavigatorGrade(85)).toBe('ariadne')
  })
  it('returns master-navigator for 70', () => {
    expect(classifyNavigatorGrade(70)).toBe('master-navigator')
  })
  it('returns skilled-explorer for 55', () => {
    expect(classifyNavigatorGrade(55)).toBe('skilled-explorer')
  })
  it('returns apprentice for 40', () => {
    expect(classifyNavigatorGrade(40)).toBe('apprentice')
  })
  it('returns lost-soul for 25', () => {
    expect(classifyNavigatorGrade(25)).toBe('lost-soul')
  })
  it('returns minotaur-food for 10', () => {
    expect(classifyNavigatorGrade(10)).toBe('minotaur-food')
  })
})

// ─── classifyLevelCondition ────────────────────────────────────────

describe('classifyLevelCondition', () => {
  it('returns well-charted for 80', () => {
    expect(classifyLevelCondition(80)).toBe('well-charted')
  })
  it('returns navigable for 65', () => {
    expect(classifyLevelCondition(65)).toBe('navigable')
  })
  it('returns explorable for 50', () => {
    expect(classifyLevelCondition(50)).toBe('explorable')
  })
  it('returns confusing for 35', () => {
    expect(classifyLevelCondition(35)).toBe('confusing')
  })
  it('returns treacherous for 20', () => {
    expect(classifyLevelCondition(20)).toBe('treacherous')
  })
  it('returns death-trap for 5', () => {
    expect(classifyLevelCondition(5)).toBe('death-trap')
  })
})

// ─── classifyLevelType ─────────────────────────────────────────────

describe('classifyLevelType', () => {
  it('returns no-maze for empty paths', () => {
    expect(classifyLevelType([])).toBe('no-maze')
  })

  it('returns grand-labyrinth for all theseus-victory high scores', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    expect(classifyLevelType([p])).toBe('grand-labyrinth')
  })

  it('returns straw-maze for medium-low quality scores', () => {
    const p = analyzeLabyrinthPath('export function foo(): void {}', 'mid.ts')
    expect(classifyLevelType([p])).toBe('straw-maze')
  })

  it('returns no-maze for minotaur-victim zero scores', () => {
    const p = analyzeLabyrinthPath(EMPTY, 'empty.ts')
    expect(classifyLevelType([p])).toBe('no-maze')
  })
})

// ─── analyzeLabyrinthPath ──────────────────────────────────────────

describe('analyzeLabyrinthPath', () => {
  it('returns qualityScore=0 and minotaur-victim for empty content', () => {
    const p = analyzeLabyrinthPath(EMPTY, 'empty.ts')
    expect(p.qualityScore).toBe(0)
    expect(p.condition).toBe('minotaur-victim')
    expect(p.file).toBe('empty.ts')
  })

  it('returns qualityScore=100 and theseus-victory for rich content', () => {
    const p = analyzeLabyrinthPath(RICH, 'rich.ts')
    expect(p.qualityScore).toBe(100)
    expect(p.condition).toBe('theseus-victory')
  })

  it('returns qualityScore=8 and minotaur-victim for minimal content', () => {
    const p = analyzeLabyrinthPath(MINIMAL, 'min.ts')
    expect(p.qualityScore).toBe(8)
    expect(p.condition).toBe('minotaur-victim')
  })

  it('returns qualityScore=9 and minotaur-victim for bad content', () => {
    const p = analyzeLabyrinthPath(BAD, 'bad.ts')
    expect(p.qualityScore).toBe(9)
    expect(p.condition).toBe('minotaur-victim')
  })

  it('sets all five quality score fields', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    expect(p.mazeSolvability).toBe(100)
    expect(p.pathClarity).toBe(100)
    expect(p.minotaurResistance).toBe(100)
    expect(p.threadStrength).toBe(100)
    expect(p.exitAccessibility).toBe(100)
  })

  it('contains all five measure sub-objects', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    expect(p.navigating.grade).toBe('open-garden')
    expect(p.clarifying.path).toBe('golden-thread')
    expect(p.resisting.defense).toBe('invincible')
    expect(p.threading.thread).toBe('unbreakable')
    expect(p.exiting.exit).toBe('grand-gate')
  })

  it('rich content scores higher than empty content', () => {
    const rich = analyzeLabyrinthPath(RICH, 'r.ts')
    const empty = analyzeLabyrinthPath(EMPTY, 'e.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })
})

// ─── analyzeLabyrinthLevel ─────────────────────────────────────────

describe('analyzeLabyrinthLevel', () => {
  it('returns no-maze and death-trap for empty paths', () => {
    const l = analyzeLabyrinthLevel([], 'src')
    expect(l.directory).toBe('src')
    expect(l.paths).toHaveLength(0)
    expect(l.levelType).toBe('no-maze')
    expect(l.condition).toBe('death-trap')
    expect(l.avgSolvability).toBe(0)
    expect(l.avgClarity).toBe(0)
    expect(l.avgResistance).toBe(0)
  })

  it('returns grand-labyrinth and well-charted for rich paths', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    const l = analyzeLabyrinthLevel([p], 'src')
    expect(l.levelType).toBe('grand-labyrinth')
    expect(l.condition).toBe('well-charted')
    expect(l.theseusVictoryCount).toBe(1)
    expect(l.minotaurVictimCount).toBe(0)
  })

  it('computes correct averages from mixed paths', () => {
    const rich = analyzeLabyrinthPath(RICH, 'a.ts')
    const empty = analyzeLabyrinthPath(EMPTY, 'b.ts')
    const l = analyzeLabyrinthLevel([rich, empty], 'src')
    expect(l.avgSolvability).toBe(50)
    expect(l.avgClarity).toBe(50)
    expect(l.avgResistance).toBe(50)
    expect(l.theseusVictoryCount).toBe(1)
    expect(l.minotaurVictimCount).toBe(1)
  })

  it('preserves paths array', () => {
    const p1 = analyzeLabyrinthPath(RICH, 'a.ts')
    const p2 = analyzeLabyrinthPath(MINIMAL, 'b.ts')
    const l = analyzeLabyrinthLevel([p1, p2], 'lib')
    expect(l.paths).toHaveLength(2)
    expect(l.directory).toBe('lib')
  })
})

// ─── buildLabyrinthThreadResult ────────────────────────────────────

describe('buildLabyrinthThreadResult', () => {
  it('returns correct structure for single rich file', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [RICH])
    expect(result.paths).toHaveLength(1)
    expect(result.levels).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.navigatorGrade).toBe('ariadne')
    expect(result.maze.isNavigable).toBe(true)
    expect(result.maze.overallNavigability).toBe(100)
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('handles empty files array', async () => {
    const result = await buildLabyrinthThreadResult([], [])
    expect(result.paths).toHaveLength(0)
    expect(result.levels).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalLevels).toBe(0)
    expect(result.stats.bestPath).toBe('')
    expect(result.stats.mostSolvable).toBe('')
    expect(result.stats.clearest).toBe('')
    expect(result.maze.isNavigable).toBe(false)
    expect(result.maze.overallNavigability).toBe(0)
  })

  it('groups paths into levels by directory', async () => {
    const result = await buildLabyrinthThreadResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, BAD],
    )
    expect(result.levels).toHaveLength(2)
  })

  it('identifies best path and most solvable', async () => {
    const result = await buildLabyrinthThreadResult(
      ['good.ts', 'bad.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.bestPath).toBe('good.ts')
    expect(result.stats.mostSolvable).toBe('good.ts')
    expect(result.stats.clearest).toBe('good.ts')
    expect(result.stats.mostResistant).toBe('good.ts')
    expect(result.stats.strongestThread).toBe('good.ts')
  })

  it('handles missing contents gracefully', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [])
    expect(result.paths).toHaveLength(1)
    expect(result.paths[0].qualityScore).toBe(0)
  })

  it('computes all stat fields for mixed content', async () => {
    const result = await buildLabyrinthThreadResult(
      ['a.ts', 'b.ts'],
      [RICH, BAD],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.avgMazeSolvability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPathClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMinotaurResistance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgThreadStrength).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgExitAccessibility).toBeGreaterThanOrEqual(0)
    expect(result.stats.theseusVictoryCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.cleverNavigatorCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properExplorerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.lostWandererCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.trappedSoulCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.minotaurVictimCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSolvabilityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResistanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighAccessibilityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallNavigability).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.navigatorGrade).toBe('string')
  })

  it('computes maze summary correctly', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [RICH])
    expect(result.maze.avgSolvability).toBe(100)
    expect(result.maze.avgClarity).toBe(100)
    expect(result.maze.avgResistance).toBe(100)
    expect(result.maze.isNavigable).toBe(true)
    expect(result.maze.overallNavigability).toBe(100)
  })

  it('handles single file with no directory path', async () => {
    const result = await buildLabyrinthThreadResult(['single.ts'], [MINIMAL])
    expect(result.levels).toHaveLength(1)
    expect(result.levels[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('gives positive recommendation for all high scores', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [RICH])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('victory')]),
    )
  })

  it('warns about minotaur victims', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('minotaur')]),
    )
  })

  it('provides improvement suggestions for low scores', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [BAD])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('warns about poor maze navigability', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [EMPTY])
    expect(result.recommendations).toEqual(
      expect.arrayContaining([expect.stringContaining('poor')]),
    )
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('labyrinth-thread formatters', () => {
  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorGrade returns a string for known grades', () => {
    expect(typeof colorGrade('theseus-victory')).toBe('string')
    expect(typeof colorGrade('minotaur-victim')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })

  it('formatPathTable returns string with file info', () => {
    const p = analyzeLabyrinthPath(RICH, 'test.ts')
    const table = formatPathTable(p)
    expect(table).toContain('test.ts')
    expect(typeof table).toBe('string')
  })

  it('formatPathsTable handles empty array', () => {
    expect(formatPathsTable([])).toContain('No labyrinth paths')
  })

  it('formatPathsTable shows header for non-empty', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    const table = formatPathsTable([p])
    expect(table).toContain('Labyrinth Thread')
  })

  it('formatLevelTable returns string', () => {
    const p = analyzeLabyrinthPath(RICH, 'a.ts')
    const l = analyzeLabyrinthLevel([p], 'src')
    const table = formatLevelTable(l)
    expect(table).toContain('src')
    expect(typeof table).toBe('string')
  })

  it('formatLevelsTable handles empty array', () => {
    expect(formatLevelsTable([])).toContain('No labyrinth levels')
  })

  it('formatStatsTable returns string with statistics', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [RICH])
    const table = formatStatsTable(result.stats)
    expect(table).toContain('Maze Statistics')
    expect(table).toContain('Total Files')
    expect(typeof table).toBe('string')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations shows items', () => {
    const table = formatRecommendations(['item one', 'item two'])
    expect(table).toContain('item one')
    expect(table).toContain('item two')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts'], [RICH])
    const table = formatResultTable(result)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildLabyrinthThreadResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.paths).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.maze).toBeDefined()
    expect(parsed.levels).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
