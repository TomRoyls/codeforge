import { describe, it, expect } from 'vitest'

import {
  measureMaze,
  measureThread,
  measureMinotaur,
  measureExit,
  measureDepth,
  measureTheseus,
  classifyCondition,
  analyzeLabyrinthChamber,
  analyzeLabyrinthLevel,
  classifyLevelType,
  classifyNavigatorGrade,
  generateRecommendations,
  buildLabyrinthDepthsResult,
} from '../src/commands/labyrinth-depths-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  patternColor,
  stateColor,
  threatColor,
  clarityColor,
  stratumColor,
  rankColor,
  levelTypeColor,
  formatLabyrinthDepthsJson,
  formatLabyrinthDepthsTable,
} from '../src/commands/labyrinth-depths-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────

const RICH = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureMaze ───────────────────────────────────────────────

describe('measureMaze', () => {
  it('measures rich content', () => {
    const result = measureMaze(RICH)
    expect(result.complexity).toBe(67)
    expect(result.pattern).toBe('dead-end-network')
    expect(result.hasLowComplexity).toBe(false)
    expect(result.hasClearPaths).toBe(false)
    expect(result.hasProperBranching).toBe(false)
    expect(result.hasNoDeadEnds).toBe(true)
    expect(result.hasProperLoops).toBe(true)
    expect(result.hasNoInfiniteRecursion).toBe(true)
    expect(result.hasLinearSegments).toBe(true)
    expect(result.hasNoSpaghetti).toBe(true)
    expect(result.hasProperGuards).toBe(false)
    expect(result.hasNoCircularPaths).toBe(true)
    expect(result.deadEndCount).toBe(0)
    expect(result.spaghettiCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureMaze(EMPTY)
    expect(result.complexity).toBe(62)
    expect(result.hasClearPaths).toBe(true)
    expect(result.hasNoDeadEnds).toBe(true)
  })

  it('measures medium content', () => {
    const result = measureMaze(MEDIUM)
    expect(result.complexity).toBe(57)
    expect(result.hasLinearSegments).toBe(false)
  })
})

// ─── measureThread ─────────────────────────────────────────────

describe('measureThread', () => {
  it('measures rich content', () => {
    const result = measureThread(RICH)
    expect(result.quality).toBe(88)
    expect(result.state).toBe('marked-trail')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperMarkings).toBe(true)
    expect(result.hasNoFalseLeads).toBe(true)
    expect(result.hasBreadcrumbTrail).toBe(true)
    expect(result.hasNoTangling).toBe(true)
    expect(result.hasStraightPassage).toBe(true)
    expect(result.hasNoBacktracking).toBe(true)
    expect(result.hasProgressiveDepth).toBe(true)
    expect(result.hasNoLooping).toBe(true)
    expect(result.falseLeadCount).toBe(0)
    expect(result.tanglingCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureThread(EMPTY)
    expect(result.quality).toBe(50)
    expect(result.state).toBe('overgrown')
    expect(result.hasHighQuality).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureThread(MEDIUM)
    expect(result.quality).toBe(55)
    expect(result.state).toBe('overgrown')
  })
})

// ─── measureMinotaur ───────────────────────────────────────────

describe('measureMinotaur', () => {
  it('measures rich content', () => {
    const result = measureMinotaur(RICH)
    expect(result.danger).toBe(90)
    expect(result.threat).toBe('minor-threat')
    expect(result.hasLowDanger).toBe(true)
    expect(result.hasNoHiddenTraps).toBe(true)
    expect(result.hasProperDefenses).toBe(true)
    expect(result.hasNoSwallowedPaths).toBe(true)
    expect(result.hasSafePassage).toBe(true)
    expect(result.hasNoSurpriseAttacks).toBe(true)
    expect(result.hasProperArmor).toBe(true)
    expect(result.hasNoAmbushPoints).toBe(false)
    expect(result.hasEscapeRoutes).toBe(true)
    expect(result.hasNoDeadlyEncounters).toBe(true)
    expect(result.trapCount).toBe(0)
    expect(result.ambushCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureMinotaur(EMPTY)
    expect(result.danger).toBe(62)
    expect(result.threat).toBe('multi-minotaur')
    expect(result.hasLowDanger).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureMinotaur(MEDIUM)
    expect(result.danger).toBe(67)
    expect(result.threat).toBe('multi-minotaur')
  })
})

// ─── measureExit ───────────────────────────────────────────────

describe('measureExit', () => {
  it('measures rich content', () => {
    const result = measureExit(RICH)
    expect(result.availability).toBe(80)
    expect(result.clarity).toBe('marked-door')
    expect(result.hasHighAvailability).toBe(true)
    expect(result.hasProperExits).toBe(true)
    expect(result.hasEmergencyExits).toBe(false)
    expect(result.hasNoTrappedExits).toBe(true)
    expect(result.hasProperSignage).toBe(true)
    expect(result.hasNoDeadEnds).toBe(true)
    expect(result.hasMultiplePaths).toBe(false)
    expect(result.hasNoCollapsing).toBe(true)
    expect(result.hasEscapePlan).toBe(true)
    expect(result.hasNoSealed).toBe(true)
    expect(result.trappedCount).toBe(0)
    expect(result.sealedCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureExit(EMPTY)
    expect(result.availability).toBe(42)
    expect(result.clarity).toBe('false-wall')
    expect(result.hasHighAvailability).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureExit(MEDIUM)
    expect(result.availability).toBe(47)
    expect(result.clarity).toBe('false-wall')
  })
})

// ─── measureDepth ──────────────────────────────────────────────

describe('measureDepth', () => {
  it('measures rich content', () => {
    const result = measureDepth(RICH)
    expect(result.level).toBe(89)
    expect(result.stratum).toBe('surface-level')
    expect(result.hasModerateDepth).toBe(true)
    expect(result.hasProperLayering).toBe(true)
    expect(result.hasNoExcessiveNesting).toBe(true)
    expect(result.hasManageable).toBe(true)
    expect(result.hasNoCliff).toBe(true)
    expect(result.hasGradualDescent).toBe(true)
    expect(result.hasNoAbyss).toBe(true)
    expect(result.hasProperVentilation).toBe(false)
    expect(result.hasNoCollapse).toBe(true)
    expect(result.hasLightSource).toBe(true)
    expect(result.cliffCount).toBe(0)
    expect(result.abyssCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureDepth(EMPTY)
    expect(result.level).toBe(83)
    expect(result.stratum).toBe('shallow-caves')
    expect(result.hasModerateDepth).toBe(true)
  })

  it('measures medium content', () => {
    const result = measureDepth(MEDIUM)
    expect(result.level).toBe(77)
    expect(result.stratum).toBe('shallow-caves')
  })
})

// ─── measureTheseus ────────────────────────────────────────────

describe('measureTheseus', () => {
  it('measures rich content', () => {
    const result = measureTheseus(RICH)
    expect(result.score).toBe(100)
    expect(result.rank).toBe('master-navigator')
    expect(result.hasHighScore).toBe(true)
    expect(result.hasClearMap).toBe(true)
    expect(result.hasNoConfusion).toBe(true)
    expect(result.hasProperGuidance).toBe(true)
    expect(result.hasNoDisorientation).toBe(true)
    expect(result.hasProgressiveDiscovery).toBe(true)
    expect(result.hasNoOverwhelming).toBe(true)
    expect(result.hasStructuredApproach).toBe(true)
    expect(result.hasNoChaos).toBe(true)
    expect(result.hasSatisfyingResolution).toBe(true)
    expect(result.confusionCount).toBe(0)
    expect(result.chaosCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureTheseus(EMPTY)
    expect(result.score).toBe(43)
    expect(result.rank).toBe('lost')
    expect(result.hasHighScore).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureTheseus(MEDIUM)
    expect(result.score).toBe(48)
    expect(result.rank).toBe('lost')
  })
})

// ─── analyzeLabyrinthChamber ───────────────────────────────────

describe('analyzeLabyrinthChamber', () => {
  it('analyzes rich content', () => {
    const result = analyzeLabyrinthChamber(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.mazeComplexity).toBe(67)
    expect(result.threadQuality).toBe(88)
    expect(result.minotaurDanger).toBe(90)
    expect(result.exitAvailability).toBe(80)
    expect(result.architecturalDepth).toBe(89)
    expect(result.theseusScore).toBe(100)
    expect(result.qualityScore).toBe(86)
    expect(result.condition).toBe('grand-hall')
  })

  it('analyzes empty content', () => {
    const result = analyzeLabyrinthChamber(EMPTY, 'empty.ts')
    expect(result.mazeComplexity).toBe(62)
    expect(result.threadQuality).toBe(50)
    expect(result.minotaurDanger).toBe(62)
    expect(result.exitAvailability).toBe(42)
    expect(result.architecturalDepth).toBe(83)
    expect(result.theseusScore).toBe(43)
    expect(result.qualityScore).toBe(56)
    expect(result.condition).toBe('dim-passage')
  })

  it('analyzes medium content', () => {
    const result = analyzeLabyrinthChamber(MEDIUM, 'medium.ts')
    expect(result.mazeComplexity).toBe(57)
    expect(result.threadQuality).toBe(55)
    expect(result.minotaurDanger).toBe(67)
    expect(result.exitAvailability).toBe(47)
    expect(result.architecturalDepth).toBe(77)
    expect(result.theseusScore).toBe(48)
    expect(result.qualityScore).toBe(57)
    expect(result.condition).toBe('dim-passage')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeLabyrinthChamber(RICH, 'a.ts')
    const b = analyzeLabyrinthChamber(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.mazeComplexity).toBe(b.mazeComplexity)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ─────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies grand-hall', () => {
    const p = analyzeLabyrinthChamber(RICH, 'rich.ts')
    expect(classifyCondition(p)).toBe('grand-hall')
  })

  it('classifies dim-passage', () => {
    const e = analyzeLabyrinthChamber(EMPTY, 'empty.ts')
    expect(classifyCondition(e)).toBe('dim-passage')
  })

  it('classifies medium as dim-passage', () => {
    const m = analyzeLabyrinthChamber(MEDIUM, 'medium.ts')
    expect(classifyCondition(m)).toBe('dim-passage')
  })
})

// ─── classifyLevelType ─────────────────────────────────────────

describe('classifyLevelType', () => {
  it('classifies rich chambers as palace-level', () => {
    const p = analyzeLabyrinthChamber(RICH, 'rich.ts')
    expect(classifyLevelType([p])).toBe('palace-level')
  })

  it('classifies empty chambers as branching-level', () => {
    const e = analyzeLabyrinthChamber(EMPTY, 'empty.ts')
    expect(classifyLevelType([e])).toBe('branching-level')
  })

  it('classifies mixed chambers as structured-level', () => {
    const p = analyzeLabyrinthChamber(RICH, 'rich.ts')
    const e = analyzeLabyrinthChamber(EMPTY, 'empty.ts')
    const m = analyzeLabyrinthChamber(MEDIUM, 'medium.ts')
    expect(classifyLevelType([p, e, m])).toBe('structured-level')
  })
})

// ─── classifyNavigatorGrade ────────────────────────────────────

describe('classifyNavigatorGrade', () => {
  it('returns architect-king for 80+', () => {
    expect(classifyNavigatorGrade(90)).toBe('architect-king')
  })
  it('returns master-builder for 65+', () => {
    expect(classifyNavigatorGrade(75)).toBe('master-builder')
  })
  it('returns navigator for 50+', () => {
    expect(classifyNavigatorGrade(55)).toBe('navigator')
  })
  it('returns explorer for 35+', () => {
    expect(classifyNavigatorGrade(35)).toBe('explorer')
  })
  it('returns sacrifice for below 20', () => {
    expect(classifyNavigatorGrade(15)).toBe('sacrifice')
  })
})

// ─── analyzeLabyrinthLevel ─────────────────────────────────────

describe('analyzeLabyrinthLevel', () => {
  it('analyzes a level with multiple chambers', () => {
    const p = analyzeLabyrinthChamber(RICH, 'rich.ts')
    const m = analyzeLabyrinthChamber(MEDIUM, 'medium.ts')
    const level = analyzeLabyrinthLevel([p, m], 'src')
    expect(level.directory).toBe('src')
    expect(level.chambers).toHaveLength(2)
    expect(level.avgComplexity).toBe(62)
    expect(level.avgThread).toBe(72)
    expect(level.avgTheseus).toBe(74)
    expect(level.grandHallCount).toBe(1)
    expect(level.pitCount).toBe(0)
    expect(level.navigableCount).toBe(1)
    expect(level.clearCount).toBe(0)
    expect(level.levelType).toBe('structured-level')
    expect(level.condition).toBe('navigable')
  })
})

// ─── generateRecommendations ───────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const p = analyzeLabyrinthChamber(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [p],
      [{ directory: 'src', chambers: [p], avgComplexity: p.mazeComplexity, avgThread: p.threadQuality, avgTheseus: p.theseusScore, grandHallCount: 1, pitCount: 0, navigableCount: 1, clearCount: 0, levelType: 'structured-level', condition: 'navigable' }],
      { avgComplexity: p.mazeComplexity, avgThread: p.threadQuality, avgTheseus: p.theseusScore, isNavigable: true, overallNavigability: p.qualityScore },
      { totalFiles: 1, hasLowComplexityCount: 0, hasHighQualityCount: 1, hasLowDangerCount: 1, hasHighAvailabilityCount: 1, hasModerateDepthCount: 1, hasHighScoreCount: 1 },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildLabyrinthDepthsResult ────────────────────────────────

describe('buildLabyrinthDepthsResult', () => {
  it('builds result for rich content', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalLevels).toBe(1)
    expect(result.stats.avgMazeComplexity).toBe(67)
    expect(result.stats.avgThreadQuality).toBe(88)
    expect(result.stats.avgMinotaurDanger).toBe(90)
    expect(result.stats.avgExitAvailability).toBe(80)
    expect(result.stats.avgArchitecturalDepth).toBe(89)
    expect(result.stats.avgTheseusScore).toBe(100)
    expect(result.stats.overallNavigability).toBe(86)
    expect(result.stats.navigatorGrade).toBe('architect-king')
    expect(result.stats.grandHallCount).toBe(1)
    expect(result.stats.dimPassageCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasLowDangerCount).toBe(1)
    expect(result.stats.bestChamber).toBe('rich.ts')
    expect(result.labyrinth.isNavigable).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildLabyrinthDepthsResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgMazeComplexity).toBe(62)
    expect(result.stats.avgThreadQuality).toBe(50)
    expect(result.stats.avgMinotaurDanger).toBe(62)
    expect(result.stats.avgExitAvailability).toBe(42)
    expect(result.stats.avgArchitecturalDepth).toBe(83)
    expect(result.stats.avgTheseusScore).toBe(43)
    expect(result.stats.overallNavigability).toBe(56)
    expect(result.stats.navigatorGrade).toBe('navigator')
    expect(result.stats.dimPassageCount).toBe(1)
    expect(result.stats.hasLowDangerCount).toBe(0)
    expect(result.labyrinth.isNavigable).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalLevels).toBe(1)
    expect(result.stats.avgMazeComplexity).toBe(62)
    expect(result.stats.avgThreadQuality).toBe(72)
    expect(result.stats.avgMinotaurDanger).toBe(79)
    expect(result.stats.avgExitAvailability).toBe(64)
    expect(result.stats.avgArchitecturalDepth).toBe(83)
    expect(result.stats.avgTheseusScore).toBe(74)
    expect(result.stats.overallNavigability).toBe(72)
    expect(result.stats.navigatorGrade).toBe('master-builder')
    expect(result.stats.grandHallCount).toBe(1)
    expect(result.stats.dimPassageCount).toBe(1)
    expect(result.stats.bestChamber).toBe('rich.ts')
    expect(result.labyrinth.overallNavigability).toBe(72)
  })

  it('returns chambers and levels arrays', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.chambers).toHaveLength(2)
    expect(result.levels).toHaveLength(1)
    expect(result.chambers[0].file).toBe('rich.ts')
    expect(result.chambers[1].file).toBe('medium.ts')
  })
})

// ─── scoreColor ────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string for high scores', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })
  it('returns a string for medium scores', () => {
    expect(typeof scoreColor(70)).toBe('string')
  })
  it('returns a string for low scores', () => {
    expect(typeof scoreColor(30)).toBe('string')
  })
})

// ─── conditionColor ────────────────────────────────────────────

describe('conditionColor', () => {
  it('returns colored string for grand-hall', () => {
    expect(typeof conditionColor('grand-hall')).toBe('string')
  })
  it('returns colored string for well-lit-corridor', () => {
    expect(typeof conditionColor('well-lit-corridor')).toBe('string')
  })
  it('returns colored string for dim-passage', () => {
    expect(typeof conditionColor('dim-passage')).toBe('string')
  })
  it('returns colored string for dark-tunnel', () => {
    expect(typeof conditionColor('dark-tunnel')).toBe('string')
  })
  it('returns colored string for minotaur-lair', () => {
    expect(typeof conditionColor('minotaur-lair')).toBe('string')
  })
  it('returns colored string for bottomless-pit', () => {
    expect(typeof conditionColor('bottomless-pit')).toBe('string')
  })
  it('returns string for unknown condition', () => {
    expect(typeof conditionColor('unknown')).toBe('string')
  })
})

// ─── gradeColor ────────────────────────────────────────────────

describe('gradeColor', () => {
  it('returns colored string for architect-king', () => {
    expect(typeof gradeColor('architect-king')).toBe('string')
  })
  it('returns colored string for navigator', () => {
    expect(typeof gradeColor('navigator')).toBe('string')
  })
  it('returns colored string for sacrifice', () => {
    expect(typeof gradeColor('sacrifice')).toBe('string')
  })
  it('returns string for unknown grade', () => {
    expect(typeof gradeColor('unknown')).toBe('string')
  })
})

// ─── patternColor ──────────────────────────────────────────────

describe('patternColor', () => {
  it('returns colored string for elegant-passage', () => {
    expect(typeof patternColor('elegant-passage')).toBe('string')
  })
  it('returns colored string for impenetrable', () => {
    expect(typeof patternColor('impenetrable')).toBe('string')
  })
})

// ─── stateColor ────────────────────────────────────────────────

describe('stateColor', () => {
  it('returns colored string for golden-thread', () => {
    expect(typeof stateColor('golden-thread')).toBe('string')
  })
  it('returns colored string for invisible', () => {
    expect(typeof stateColor('invisible')).toBe('string')
  })
})

// ─── threatColor ───────────────────────────────────────────────

describe('threatColor', () => {
  it('returns colored string for no-monster', () => {
    expect(typeof threatColor('no-monster')).toBe('string')
  })
  it('returns colored string for labyrinth-king', () => {
    expect(typeof threatColor('labyrinth-king')).toBe('string')
  })
})

// ─── clarityColor ──────────────────────────────────────────────

describe('clarityColor', () => {
  it('returns colored string for crystal-exit', () => {
    expect(typeof clarityColor('crystal-exit')).toBe('string')
  })
  it('returns colored string for sealed-tomb', () => {
    expect(typeof clarityColor('sealed-tomb')).toBe('string')
  })
})

// ─── stratumColor ──────────────────────────────────────────────

describe('stratumColor', () => {
  it('returns colored string for surface-level', () => {
    expect(typeof stratumColor('surface-level')).toBe('string')
  })
  it('returns colored string for tartarus', () => {
    expect(typeof stratumColor('tartarus')).toBe('string')
  })
})

// ─── rankColor ─────────────────────────────────────────────────

describe('rankColor', () => {
  it('returns colored string for master-navigator', () => {
    expect(typeof rankColor('master-navigator')).toBe('string')
  })
  it('returns colored string for doomed', () => {
    expect(typeof rankColor('doomed')).toBe('string')
  })
})

// ─── levelTypeColor ────────────────────────────────────────────

describe('levelTypeColor', () => {
  it('returns colored string for palace-level', () => {
    expect(typeof levelTypeColor('palace-level')).toBe('string')
  })
  it('returns colored string for void', () => {
    expect(typeof levelTypeColor('void')).toBe('string')
  })
})

// ─── formatLabyrinthDepthsJson ─────────────────────────────────

describe('formatLabyrinthDepthsJson', () => {
  it('returns valid JSON string', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts'], [RICH])
    const json = formatLabyrinthDepthsJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallNavigability).toBe(86)
    expect(parsed.chambers).toHaveLength(1)
  })
})

// ─── formatLabyrinthDepthsTable ────────────────────────────────

describe('formatLabyrinthDepthsTable', () => {
  it('returns a non-empty string', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts'], [RICH])
    const table = formatLabyrinthDepthsTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildLabyrinthDepthsResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatLabyrinthDepthsTable(result, false)
    const verbose = formatLabyrinthDepthsTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})
