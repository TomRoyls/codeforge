import { describe, expect, it } from 'vitest'

import {
  analyzeSilverCorridor,
  analyzeSilverMaze,
  buildSilverLabyrinthResult,
  classifyMazeCondition,
  classifyMazeType,
  classifyNavigatorGrade,
  classifySilverCondition,
  generateRecommendations,
  measureConstructing,
  measureDefending,
  measureGuiding,
  measureMirroring,
  measureUnderstanding,
} from '../src/commands/silver-labyrinth-helpers.js'
import type { SilverLabyrinthResult } from '../src/commands/silver-labyrinth-helpers.js'
import {
  colorMazeCondition,
  colorMazeType,
  colorNavigatorGrade,
  colorScore,
  colorSilverCondition,
  formatCorridorsTable,
  formatCorridorTable,
  formatMazeTable,
  formatMazesTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/silver-labyrinth-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''
const minimalContent = 'const x = 1'

const richPur = measureMirroring(richContent).purity
const richCla = measureGuiding(richContent).clarity
const richPre = measureConstructing(richContent).precision
const richRes = measureDefending(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<SilverLabyrinthResult['stats']> = {}): SilverLabyrinthResult['stats'] {
  return {
    totalFiles: 1,
    totalMazes: 1,
    avgReflectivePurity: 50,
    avgPathClarity: 50,
    avgMazePrecision: 50,
    avgWallResilience: 50,
    avgCenterWisdom: 50,
    silverMasterpieceCount: 0,
    mirrorLabyrinthCount: 0,
    properSilverCount: 0,
    tarnishedMetalCount: 0,
    rustyIronCount: 0,
    voidCount: 0,
    hasHighPurityCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallReflection: 50,
    navigatorGrade: 'proper-navigator',
    bestCorridor: 'a.ts',
    purest: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureMirroring ───────────────────────────────────

describe('measureMirroring', () => {
  it('scores rich content highly', () => {
    const result = measureMirroring(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureMirroring(emptyContent).purity).toBeLessThan(richPur)
  })

  it('detects clean (no hack/workaround/kludge)', () => {
    expect(measureMirroring(richContent).hasClean).toBe(true)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const kludge = 2'
    const result = measureMirroring(content)
    expect(result.hackCount).toBe(2)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const bypass = 2'
    const result = measureMirroring(content)
    expect(result.workaroundCount).toBe(2)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects noTodo', () => {
    expect(measureMirroring(richContent).hasNoTodo).toBe(true)
  })

  it('detects noCommentedOut', () => {
    expect(measureMirroring(richContent).hasNoCommentedOut).toBe(true)
  })

  it('detects noDebugCode', () => {
    expect(measureMirroring(richContent).hasNoDebugCode).toBe(true)
  })

  it('detects pristine (class/interface/type)', () => {
    expect(measureMirroring(richContent).hasPristine).toBe(true)
  })

  it('detects pure (no any)', () => {
    expect(measureMirroring(richContent).hasPure).toBe(true)
  })

  it('classifies reflection correctly for high scores', () => {
    const result = measureMirroring(richContent)
    expect(['perfect-mirror', 'silver-glass', 'proper-reflection']).toContain(result.reflection)
  })

  it('classifies reflection correctly for low scores', () => {
    expect(measureMirroring(emptyContent).reflection).not.toBe('perfect-mirror')
  })
})

// ─── measureGuiding ─────────────────────────────────────

describe('measureGuiding', () => {
  it('scores rich content highly', () => {
    const result = measureGuiding(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGuiding(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('detects readable (type annotations)', () => {
    expect(measureGuiding(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureGuiding(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureGuiding(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects self-documenting (class/interface/type)', () => {
    expect(measureGuiding(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects clear (no hack/workaround/kludge)', () => {
    expect(measureGuiding(richContent).hasClear).toBe(true)
  })

  it('detects obvious (async/await/Promise)', () => {
    expect(measureGuiding(richContent).hasObvious).toBe(true)
  })

  it('classifies path correctly for high scores', () => {
    const result = measureGuiding(richContent)
    expect(['golden-thread', 'clear-corridor', 'proper-hallway']).toContain(result.path)
  })

  it('classifies path correctly for low scores', () => {
    expect(measureGuiding(emptyContent).path).not.toBe('golden-thread')
  })
})

// ─── measureConstructing ────────────────────────────────

describe('measureConstructing', () => {
  it('scores rich content highly', () => {
    const result = measureConstructing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureConstructing(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type-safe (no any)', () => {
    expect(measureConstructing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureConstructing(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureConstructing(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureConstructing(richContent).hasExact).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measureConstructing(richContent).hasCrisp).toBe(true)
  })

  it('classifies craft correctly for high scores', () => {
    const result = measureConstructing(richContent)
    expect(['architectural-perfection', 'master-builder', 'proper-construction']).toContain(result.craft)
  })

  it('classifies craft correctly for low scores', () => {
    expect(measureConstructing(emptyContent).craft).not.toBe('architectural-perfection')
  })
})

// ─── measureDefending ───────────────────────────────────

describe('measureDefending', () => {
  it('scores rich content highly', () => {
    const result = measureDefending(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureDefending(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects error-handled (try/catch)', () => {
    expect(measureDefending(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureDefending(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureDefending(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects secure (no any)', () => {
    expect(measureDefending(richContent).hasSecure).toBe(true)
  })

  it('detects hardened (readonly/private/protected)', () => {
    expect(measureDefending(richContent).hasHardened).toBe(true)
  })

  it('classifies fortification correctly for high scores', () => {
    const result = measureDefending(richContent)
    expect(['impregnable-wall', 'strong-fortress', 'proper-defense']).toContain(result.fortification)
  })

  it('classifies fortification correctly for low scores', () => {
    expect(measureDefending(emptyContent).fortification).not.toBe('impregnable-wall')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects well-architected (class/interface/type)', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureUnderstanding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureUnderstanding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects principled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('classifies center correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['labyrinth-core', 'deep-center', 'proper-middle']).toContain(result.center)
  })

  it('classifies center correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).center).not.toBe('labyrinth-core')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifySilverCondition', () => {
  it('returns silver-masterpiece for 90+', () => {
    expect(classifySilverCondition(90)).toBe('silver-masterpiece')
    expect(classifySilverCondition(95)).toBe('silver-masterpiece')
  })

  it('returns mirror-labyrinth for 75-89', () => {
    expect(classifySilverCondition(75)).toBe('mirror-labyrinth')
  })

  it('returns proper-silver for 60-74', () => {
    expect(classifySilverCondition(60)).toBe('proper-silver')
  })

  it('returns tarnished-metal for 40-59', () => {
    expect(classifySilverCondition(40)).toBe('tarnished-metal')
  })

  it('returns rusty-iron for 20-39', () => {
    expect(classifySilverCondition(20)).toBe('rusty-iron')
  })

  it('returns void below 20', () => {
    expect(classifySilverCondition(0)).toBe('void')
    expect(classifySilverCondition(10)).toBe('void')
  })
})

describe('classifyMazeType', () => {
  it('returns no-maze for empty corridors', () => {
    expect(classifyMazeType([])).toBe('no-maze')
  })

  it('returns grand-labyrinth for avg >= 85', () => {
    const corridors = [{ qualityScore: 90 } as any]
    expect(classifyMazeType(corridors)).toBe('grand-labyrinth')
  })

  it('returns dead-end for low avg', () => {
    const corridors = [{ qualityScore: 10 } as any]
    expect(classifyMazeType(corridors)).toBe('dead-end')
  })
})

describe('classifyMazeCondition', () => {
  it('returns mirror-palace for 85+', () => {
    expect(classifyMazeCondition(85)).toBe('mirror-palace')
  })

  it('returns void below 15', () => {
    expect(classifyMazeCondition(5)).toBe('void')
  })
})

describe('classifyNavigatorGrade', () => {
  it('returns labyrinth-master for 80+', () => {
    expect(classifyNavigatorGrade(80)).toBe('labyrinth-master')
  })

  it('returns wanderer below 20', () => {
    expect(classifyNavigatorGrade(5)).toBe('wanderer')
  })

  it('returns silver-guide for 65-79', () => {
    expect(classifyNavigatorGrade(65)).toBe('silver-guide')
  })

  it('returns proper-navigator for 50-64', () => {
    expect(classifyNavigatorGrade(50)).toBe('proper-navigator')
  })

  it('returns lost-traveler for 35-49', () => {
    expect(classifyNavigatorGrade(35)).toBe('lost-traveler')
  })

  it('returns novice for 20-34', () => {
    expect(classifyNavigatorGrade(20)).toBe('novice')
  })
})

// ─── analyzeSilverCorridor ──────────────────────────────

describe('analyzeSilverCorridor', () => {
  it('creates a corridor with all 5 measures', () => {
    const corridor = analyzeSilverCorridor(richContent, 'app.ts')
    expect(corridor.file).toBe('app.ts')
    expect(typeof corridor.reflectivePurity).toBe('number')
    expect(typeof corridor.pathClarity).toBe('number')
    expect(typeof corridor.mazePrecision).toBe('number')
    expect(typeof corridor.wallResilience).toBe('number')
    expect(typeof corridor.centerWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const corridor = analyzeSilverCorridor(richContent, 'app.ts')
    const expected = Math.round(
      corridor.reflectivePurity * 0.2 +
      corridor.pathClarity * 0.2 +
      corridor.mazePrecision * 0.2 +
      corridor.wallResilience * 0.2 +
      corridor.centerWisdom * 0.2,
    )
    expect(corridor.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const corridor = analyzeSilverCorridor(richContent, 'app.ts')
    expect(corridor.condition).toBe(classifySilverCondition(corridor.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richCorridor = analyzeSilverCorridor(richContent, 'rich.ts')
    const emptyCorridor = analyzeSilverCorridor(emptyContent, 'empty.ts')
    expect(richCorridor.qualityScore).toBeGreaterThan(emptyCorridor.qualityScore)
  })
})

// ─── analyzeSilverMaze ──────────────────────────────────

describe('analyzeSilverMaze', () => {
  it('returns empty maze for no corridors', () => {
    const maze = analyzeSilverMaze([], 'src')
    expect(maze.directory).toBe('src')
    expect(maze.corridors).toEqual([])
    expect(maze.mazeType).toBe('no-maze')
    expect(maze.condition).toBe('void')
  })

  it('computes averages from corridors', () => {
    const corridors = [analyzeSilverCorridor(richContent, 'a.ts'), analyzeSilverCorridor(richContent, 'b.ts')]
    const maze = analyzeSilverMaze(corridors, 'src')
    expect(maze.avgPurity).toBeGreaterThan(0)
    expect(maze.avgPrecision).toBeGreaterThan(0)
    expect(maze.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildSilverLabyrinthResult ─────────────────────────

describe('buildSilverLabyrinthResult', () => {
  it('returns full result structure', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    expect(result.corridors).toHaveLength(1)
    expect(result.mazes).toHaveLength(1)
    expect(result.labyrinth).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into mazes', async () => {
    const result = await buildSilverLabyrinthResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.mazes.length).toBe(2)
  })

  it('computes labyrinth overview', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    expect(result.labyrinth.avgPurity).toBeGreaterThan(0)
    expect(result.labyrinth.isSilver).toBe(true)
    expect(result.labyrinth.overallReflection).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildSilverLabyrinthResult([], [])
    expect(result.corridors).toHaveLength(0)
    expect(result.mazes).toHaveLength(0)
    expect(result.labyrinth.overallReflection).toBe(0)
    expect(result.labyrinth.isSilver).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    const total = result.stats.silverMasterpieceCount +
      result.stats.mirrorLabyrinthCount +
      result.stats.properSilverCount +
      result.stats.tarnishedMetalCount +
      result.stats.rustyIronCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best corridor and top performers', async () => {
    const result = await buildSilverLabyrinthResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCorridor).toBeTruthy()
    expect(result.stats.purest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes navigator grade from overall reflection', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    expect(result.stats.navigatorGrade).toBe(classifyNavigatorGrade(result.stats.overallReflection))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgReflectivePurity: 90,
      avgPathClarity: 90,
      avgMazePrecision: 90,
      avgWallResilience: 90,
      avgCenterWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgPurity: 90, avgPrecision: 90, avgWisdom: 90, isSilver: true, overallReflection: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('perfect mirror palace')
  })

  it('recommends purity when < 60', () => {
    const stats = makeStats({ avgReflectivePurity: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('purity') || r.includes('mirror'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgPathClarity: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('corridor'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgMazePrecision: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('exact'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgWallResilience: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('wall'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgCenterWisdom: 50 })
    const result = generateRecommendations([], [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('center'))).toBe(true)
  })

  it('warns about tarnished labyrinth when reflection < 40', () => {
    const stats = makeStats({ overallReflection: 30 })
    const result = generateRecommendations([], [], { avgPurity: 30, avgPrecision: 30, avgWisdom: 30, isSilver: false, overallReflection: 30 }, stats)
    expect(result.some((r) => r.includes('tarnished'))).toBe(true)
  })

  it('lists void corridors by name when <= 5', () => {
    const corridors = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(corridors, [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void corridors when > 5', () => {
    const corridors = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(corridors, [], { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('6 rusty iron corridors'))).toBe(true)
  })

  it('warns when all mazes are poor', () => {
    const mazes = [{ condition: 'dirt-tunnel' as const, mazeType: 'simple-path' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], mazes as any, { avgPurity: 50, avgPrecision: 50, avgWisdom: 50, isSilver: false, overallReflection: 50 }, stats)
    expect(result.some((r) => r.includes('dirt tunnels'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgReflectivePurity: 70,
      avgPathClarity: 70,
      avgMazePrecision: 70,
      avgWallResilience: 70,
      avgCenterWisdom: 70,
      overallReflection: 70,
    })
    const result = generateRecommendations([], [], { avgPurity: 70, avgPrecision: 70, avgWisdom: 70, isSilver: true, overallReflection: 70 }, stats)
    expect(result.some((r) => r.includes('perfect reflection'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorSilverCondition', () => {
  it('colors silver-masterpiece', () => {
    expect(typeof colorSilverCondition('silver-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorSilverCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorSilverCondition('unknown')).toBe('string')
  })
})

describe('colorMazeType', () => {
  it('colors grand-labyrinth', () => {
    expect(typeof colorMazeType('grand-labyrinth')).toBe('string')
  })

  it('colors no-maze', () => {
    expect(typeof colorMazeType('no-maze')).toBe('string')
  })
})

describe('colorMazeCondition', () => {
  it('colors mirror-palace', () => {
    expect(typeof colorMazeCondition('mirror-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorMazeCondition('void')).toBe('string')
  })
})

describe('colorNavigatorGrade', () => {
  it('colors labyrinth-master', () => {
    expect(typeof colorNavigatorGrade('labyrinth-master')).toBe('string')
  })

  it('colors wanderer', () => {
    expect(typeof colorNavigatorGrade('wanderer')).toBe('string')
  })
})

describe('formatCorridorTable', () => {
  it('formats a corridor with all measures', () => {
    const corridor = analyzeSilverCorridor(richContent, 'app.ts')
    const output = formatCorridorTable(corridor)
    expect(output).toContain('Silver Corridor: app.ts')
    expect(output).toContain('Reflective Purity')
    expect(output).toContain('Path Clarity')
    expect(output).toContain('Maze Precision')
    expect(output).toContain('Wall Resilience')
    expect(output).toContain('Center Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatCorridorsTable', () => {
  it('shows no corridors message for empty array', () => {
    expect(formatCorridorsTable([])).toContain('No silver corridors')
  })

  it('lists corridors in output', () => {
    const corridors = [analyzeSilverCorridor(richContent, 'a.ts')]
    expect(formatCorridorsTable(corridors)).toContain('a.ts')
  })
})

describe('formatMazeTable', () => {
  it('formats a maze with all fields', () => {
    const corridors = [analyzeSilverCorridor(richContent, 'a.ts')]
    const maze = analyzeSilverMaze(corridors, 'src')
    const output = formatMazeTable(maze)
    expect(output).toContain('Silver Maze: src')
    expect(output).toContain('Corridors')
    expect(output).toContain('Avg Purity')
  })
})

describe('formatMazesTable', () => {
  it('shows no mazes message for empty array', () => {
    expect(formatMazesTable([])).toContain('No silver mazes')
  })

  it('lists mazes in output', () => {
    const corridors = [analyzeSilverCorridor(richContent, 'a.ts')]
    const maze = analyzeSilverMaze(corridors, 'src')
    expect(formatMazesTable([maze])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Silver Labyrinth Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Navigator Grade')
    expect(output).toContain('Best Corridor')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Silver Labyrinth Analysis')
    expect(output).toContain('Labyrinth Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildSilverLabyrinthResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.corridors).toHaveLength(1)
    expect(parsed.labyrinth).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
