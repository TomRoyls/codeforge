import { describe, expect, it } from 'vitest'

import {
  type AgingMeasure,
  type BoundingMeasure,
  type CopperCondition,
  type CopperLabyrinthResult,
  type CopperMaze as CopperMazeType,
  type CopperPath,
  type DeepeningMeasure,
  type GuidingMeasure,
  type MazeCondition,
  type MazeType,
  type NavigatorGrade,
  type WeavingMeasure,
  analyzeCopperMaze,
  analyzeCopperPath,
  buildCopperLabyrinthResult,
  classifyCopperCondition,
  classifyMazeCondition,
  classifyMazeType,
  classifyNavigatorGrade,
  generateRecommendations,
  measureAging,
  measureBounding,
  measureDeepening,
  measureGuiding,
  measureWeaving,
} from '../src/commands/copper-maze-helpers.js'

import {
  colorMazeCondition,
  colorScore,
  formatMazeTable,
  formatMazesTable,
  formatPathTable,
  formatPathsTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/copper-maze-format-helpers.js'

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

const poorContent = 'var x = eval("1")'

const moderateContent = [
  'import { X } from "y"',
  'export class App {',
  '  name: string',
  '  run() { return 1 }',
  '}',
].join('\n')

function makePath(
  file: string,
  clarity: number,
  patience: number,
  coherence: number,
  resilience: number,
  wisdom: number,
): CopperPath {
  const qualityScore = Math.round(clarity * 0.2 + patience * 0.2 + coherence * 0.2 + resilience * 0.2 + wisdom * 0.2)
  return {
    file,
    pathClarity: clarity,
    copperPatience: patience,
    twistCoherence: coherence,
    wallResilience: resilience,
    centerWisdom: wisdom,
    guiding: { clarity, path: 'illuminated-path', hasHighClarity: clarity >= 60, hasReadable: true, hasNoCryptic: true, hasSelfDocumenting: true, hasNoMystery: true, hasClear: true, hasNoObfuscated: true, hasDirect: true, hasVisible: true, hasOrganized: true, hasStructured: true, hasFollowable: true, hasUnderstandable: true, hasNavigable: true, hasOpen: true, hasTransparent: true, crypticCount: 0, obfuscatedCount: 0 } as GuidingMeasure,
    aging: { patience, patina: 'ancient-verdigris', hasHighPatience: patience >= 60, hasWellStructured: true, hasNoChaotic: true, hasDocumented: true, hasNoUndocumented: true, hasTested: true, hasNoUntested: true, hasProven: true, hasMature: true, hasRefined: true, hasDeliberate: true, hasCareful: true, hasThorough: true, hasPatient: true, hasConsidered: true, hasThoughtful: true, undocumentedCount: 0, untestedCount: 0 } as AgingMeasure,
    weaving: { coherence, twist: 'elegant-spiral', hasHighCoherence: coherence >= 60, hasConsistent: true, hasNoContradictory: true, hasLogical: true, hasNoIllogical: true, hasTypeSafe: true, hasNoUnsafe: true, hasCoherent: true, hasUniform: true, hasHarmonious: true, hasAligned: true, hasConnected: true, hasFlowing: true, hasReasonable: true, hasSound: true, hasRational: true, contradictoryCount: 0, unsafeCount: 0 } as WeavingMeasure,
    bounding: { resilience, wall: 'impregnable-fortress', hasHighResilience: resilience >= 60, hasErrorHandled: true, hasNoUnhandled: true, hasDefensive: true, hasRobust: true, hasTypeSafe: true, hasBoundaried: true, hasEncapsulated: true, hasProtected: true, hasShielded: true, hasGuarded: true, hasContained: true, hasIsolated: true, hasValidated: true, hasSafe: true, hasSecure: true, unhandledCount: 0, exposedCount: 0 } as BoundingMeasure,
    deepening: { wisdom, center: 'oracle-core', hasHighWisdom: wisdom >= 60, hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true, hasDeep: true, hasProven: true, hasInsightful: true, hasStrategic: true, hasMature: true, hasProfound: true, hasEvolved: true, hasReflective: true, hasComprehensive: true, hasLayered: true, hasWise: true, hasAccumulated: true, hackedCount: 0, shallowCount: 0 } as DeepeningMeasure,
    condition: classifyCopperCondition(qualityScore),
    qualityScore,
  }
}

function makeStats(overrides: Partial<CopperLabyrinthResult['stats']> = {}): CopperLabyrinthResult['stats'] {
  return {
    totalFiles: 1,
    totalMazes: 1,
    avgPathClarity: 80,
    avgCopperPatience: 80,
    avgTwistCoherence: 80,
    avgWallResilience: 80,
    avgCenterWisdom: 80,
    labyrinthMasterpieceCount: 0,
    ancientMazeCount: 1,
    properPathCount: 0,
    crumblingWallCount: 0,
    collapsedTunnelCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighPatienceCount: 1,
    hasHighCoherenceCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallNavigation: 80,
    navigatorGrade: 'maze-walker' as NavigatorGrade,
    bestPath: 'app.ts',
    clearest: 'app.ts',
    mostPatient: 'app.ts',
    mostCoherent: 'app.ts',
    mostResilient: 'app.ts',
    wisest: 'app.ts',
    ...overrides,
  }
}

// ─── measureGuiding ────────────────────────────────────

describe('measureGuiding', () => {
  it('scores rich content highly', () => {
    const result = measureGuiding(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureGuiding(emptyContent)
    expect(result.clarity).toBeLessThan(50)
  })

  it('detects cryptic patterns', () => {
    const result = measureGuiding('cryptic obfuscated minified code')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns (var/eval)', () => {
    const result = measureGuiding('var x = eval("1")')
    expect(result.obfuscatedCount).toBeGreaterThan(0)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects readable class/interface/type', () => {
    const result = measureGuiding('class Foo {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects self-documenting types', () => {
    const result = measureGuiding('const x: string = "ok"')
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects clear code (no any)', () => {
    const result = measureGuiding('const x: string = "ok"')
    expect(result.hasClear).toBe(true)
  })

  it('detects organized imports/exports', () => {
    const result = measureGuiding('import { X } from "y"')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects followable documentation', () => {
    const result = measureGuiding('/** doc */')
    expect(result.hasFollowable).toBe(true)
  })

  it('detects navigable try/catch/if', () => {
    const result = measureGuiding('try { x } catch { y }')
    expect(result.hasNavigable).toBe(true)
  })

  it('detects visible access modifiers', () => {
    const result = measureGuiding('readonly x: string')
    expect(result.hasVisible).toBe(true)
  })

  it('penalizes any keyword', () => {
    const result = measureGuiding('const x: any = 1')
    expect(result.hasClear).toBe(false)
  })

  it('penalizes global/window/document', () => {
    const result = measureGuiding('window.document')
    expect(result.hasNoMystery).toBe(false)
  })

  it('penalizes monolithic patterns', () => {
    const result = measureGuiding('monolithic god.object mega class')
    expect(result.hasTransparent).toBe(false)
  })
})

// ─── measureAging ───────────────────────────────────────

describe('measureAging', () => {
  it('scores rich content highly', () => {
    const result = measureAging(richContent)
    expect(result.patience).toBeGreaterThan(60)
    expect(result.hasHighPatience).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureAging(emptyContent)
    expect(result.patience).toBeLessThan(50)
  })

  it('detects chaotic patterns (var/eval)', () => {
    const result = measureAging('var x = eval("1")')
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects documented code', () => {
    const result = measureAging('/** doc */')
    expect(result.hasDocumented).toBe(true)
  })

  it('detects tested patterns (try/catch/if)', () => {
    const result = measureAging('try { x } catch { y }')
    expect(result.hasTested).toBe(true)
  })

  it('detects untested patterns (eval/Function)', () => {
    const result = measureAging('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects well-structured class/interface/type', () => {
    const result = measureAging('interface Foo { x: string }')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects refined access modifiers', () => {
    const result = measureAging('readonly x: string')
    expect(result.hasRefined).toBe(true)
  })

  it('detects deliberate import/export', () => {
    const result = measureAging('export const x = 1')
    expect(result.hasDeliberate).toBe(true)
  })

  it('detects careful async/await/Promise', () => {
    const result = measureAging('async function f() { await g() }')
    expect(result.hasCareful).toBe(true)
  })

  it('penalizes any keyword', () => {
    const result = measureAging('const x: any = 1')
    expect(result.hasMature).toBe(false)
  })

  it('penalizes global/window/document', () => {
    const result = measureAging('global var')
    expect(result.hasThoughtful).toBe(false)
  })
})

// ─── measureWeaving ─────────────────────────────────────

describe('measureWeaving', () => {
  it('scores rich content highly', () => {
    const result = measureWeaving(richContent)
    expect(result.coherence).toBeGreaterThan(60)
    expect(result.hasHighCoherence).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureWeaving(emptyContent)
    expect(result.coherence).toBeLessThan(50)
  })

  it('detects contradictory patterns', () => {
    const result = measureWeaving('contradictory inconsistent paradox code')
    expect(result.contradictoryCount).toBeGreaterThan(0)
    expect(result.hasNoContradictory).toBe(false)
  })

  it('detects unsafe patterns', () => {
    const result = measureWeaving('const x: any = 1')
    expect(result.unsafeCount).toBeGreaterThan(0)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('detects consistent types', () => {
    const result = measureWeaving('const x: string = "ok"')
    expect(result.hasConsistent).toBe(true)
  })

  it('detects logical class/interface/type', () => {
    const result = measureWeaving('class Foo {}')
    expect(result.hasLogical).toBe(true)
  })

  it('detects coherent imports/exports', () => {
    const result = measureWeaving('export { X }')
    expect(result.hasCoherent).toBe(true)
  })

  it('detects aligned try/catch/if', () => {
    const result = measureWeaving('try { x } catch { y }')
    expect(result.hasAligned).toBe(true)
  })

  it('detects flowing function/arrow/return', () => {
    const result = measureWeaving('function f() { return 1 }')
    expect(result.hasFlowing).toBe(true)
  })

  it('penalizes any keyword', () => {
    const result = measureWeaving('const x: any = 1')
    expect(result.hasNoIllogical).toBe(false)
  })

  it('penalizes var/eval', () => {
    const result = measureWeaving('var x = eval("1")')
    expect(result.hasRational).toBe(false)
  })
})

// ─── measureBounding ────────────────────────────────────

describe('measureBounding', () => {
  it('scores rich content highly', () => {
    const result = measureBounding(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureBounding(emptyContent)
    expect(result.resilience).toBeLessThan(50)
  })

  it('detects error handling try/catch/if', () => {
    const result = measureBounding('try { x } catch { y }')
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects unhandled patterns (eval/Function)', () => {
    const result = measureBounding('eval("code")')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects defensive types', () => {
    const result = measureBounding('const x: string = "ok"')
    expect(result.hasDefensive).toBe(true)
  })

  it('detects boundaried access modifiers', () => {
    const result = measureBounding('readonly x: string')
    expect(result.hasBoundaried).toBe(true)
  })

  it('detects encapsulated class/interface/type', () => {
    const result = measureBounding('interface Foo {}')
    expect(result.hasEncapsulated).toBe(true)
  })

  it('detects contained import/export', () => {
    const result = measureBounding('export { X }')
    expect(result.hasContained).toBe(true)
  })

  it('detects exposed patterns', () => {
    const result = measureBounding('exposed leaky unprotected code')
    expect(result.exposedCount).toBeGreaterThan(0)
  })

  it('penalizes any keyword', () => {
    const result = measureBounding('const x: any = 1')
    expect(result.hasRobust).toBe(false)
  })

  it('penalizes global/window/document', () => {
    const result = measureBounding('window.alert("x")')
    expect(result.hasShielded).toBe(false)
  })
})

// ─── measureDeepening ───────────────────────────────────

describe('measureDeepening', () => {
  it('scores rich content highly', () => {
    const result = measureDeepening(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content low', () => {
    const result = measureDeepening(emptyContent)
    expect(result.wisdom).toBeLessThan(50)
  })

  it('detects hacked patterns', () => {
    const result = measureDeepening('hack workaround kludge code')
    expect(result.hackedCount).toBeGreaterThan(0)
    expect(result.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const result = measureDeepening('shallow superficial trivial code')
    expect(result.shallowCount).toBeGreaterThan(0)
  })

  it('detects well-architected class/interface/type', () => {
    const result = measureDeepening('class Foo {}')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects deep types', () => {
    const result = measureDeepening('const x: string = "ok"')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven try/catch/if', () => {
    const result = measureDeepening('try { x } catch { y }')
    expect(result.hasProven).toBe(true)
  })

  it('detects insightful documentation', () => {
    const result = measureDeepening('/** doc */')
    expect(result.hasInsightful).toBe(true)
  })

  it('detects strategic import/export', () => {
    const result = measureDeepening('export { X }')
    expect(result.hasStrategic).toBe(true)
  })

  it('penalizes any keyword', () => {
    const result = measureDeepening('const x: any = 1')
    expect(result.hasPrincipled).toBe(false)
  })

  it('penalizes var/eval', () => {
    const result = measureDeepening('var x = eval("1")')
    expect(result.hasWise).toBe(false)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCopperCondition', () => {
  it('returns labyrinth-masterpiece for 90+', () => {
    expect(classifyCopperCondition(95)).toBe('labyrinth-masterpiece')
  })
  it('returns ancient-maze for 75-89', () => {
    expect(classifyCopperCondition(80)).toBe('ancient-maze')
  })
  it('returns proper-path for 60-74', () => {
    expect(classifyCopperCondition(65)).toBe('proper-path')
  })
  it('returns crumbling-wall for 40-59', () => {
    expect(classifyCopperCondition(50)).toBe('crumbling-wall')
  })
  it('returns collapsed-tunnel for 20-39', () => {
    expect(classifyCopperCondition(30)).toBe('collapsed-tunnel')
  })
  it('returns void below 20', () => {
    expect(classifyCopperCondition(10)).toBe('void')
  })
})

describe('classifyMazeType', () => {
  it('returns no-maze for empty paths', () => {
    expect(classifyMazeType([])).toBe('no-maze')
  })
  it('returns sacred-labyrinth for high avg', () => {
    const paths = [makePath('a.ts', 90, 90, 90, 90, 90)]
    expect(classifyMazeType(paths)).toBe('sacred-labyrinth')
  })
  it('returns copper-maze for medium-high avg', () => {
    const paths = [makePath('a.ts', 75, 75, 75, 75, 75)]
    expect(classifyMazeType(paths)).toBe('copper-maze')
  })
  it('returns proper-path for medium avg', () => {
    const paths = [makePath('a.ts', 60, 60, 60, 60, 60)]
    expect(classifyMazeType(paths)).toBe('proper-path')
  })
  it('returns garden-hedge for low avg', () => {
    const paths = [makePath('a.ts', 40, 40, 40, 40, 40)]
    expect(classifyMazeType(paths)).toBe('garden-hedge')
  })
  it('returns open-field for very low avg', () => {
    const paths = [makePath('a.ts', 20, 20, 20, 20, 20)]
    expect(classifyMazeType(paths)).toBe('open-field')
  })
})

describe('classifyMazeCondition', () => {
  it('returns copper-palace for 85+', () => {
    expect(classifyMazeCondition(90)).toBe('copper-palace')
  })
  it('returns aged-sanctuary for 70-84', () => {
    expect(classifyMazeCondition(75)).toBe('aged-sanctuary')
  })
  it('returns proper-hall for 55-69', () => {
    expect(classifyMazeCondition(60)).toBe('proper-hall')
  })
  it('returns crumbling-corridor for 35-54', () => {
    expect(classifyMazeCondition(40)).toBe('crumbling-corridor')
  })
  it('returns rubble for 15-34', () => {
    expect(classifyMazeCondition(20)).toBe('rubble')
  })
  it('returns void below 15', () => {
    expect(classifyMazeCondition(5)).toBe('void')
  })
})

describe('classifyNavigatorGrade', () => {
  it('returns labyrinth-master for 80+', () => {
    expect(classifyNavigatorGrade(85)).toBe('labyrinth-master')
  })
  it('returns maze-walker for 65-79', () => {
    expect(classifyNavigatorGrade(70)).toBe('maze-walker')
  })
  it('returns path-finder for 50-64', () => {
    expect(classifyNavigatorGrade(55)).toBe('path-finder')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyNavigatorGrade(40)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyNavigatorGrade(25)).toBe('novice')
  })
  it('returns lost-soul below 20', () => {
    expect(classifyNavigatorGrade(10)).toBe('lost-soul')
  })
})

// ─── analyzeCopperPath ─────────────────────────────────

describe('analyzeCopperPath', () => {
  it('returns a full CopperPath for rich content', () => {
    const result = analyzeCopperPath(richContent, 'app.ts')
    expect(result.file).toBe('app.ts')
    expect(result.pathClarity).toBeGreaterThan(0)
    expect(result.copperPatience).toBeGreaterThan(0)
    expect(result.twistCoherence).toBeGreaterThan(0)
    expect(result.wallResilience).toBeGreaterThan(0)
    expect(result.centerWisdom).toBeGreaterThan(0)
    expect(result.qualityScore).toBeGreaterThan(0)
    expect(result.condition).toBeDefined()
    expect(result.guiding).toBeDefined()
    expect(result.aging).toBeDefined()
    expect(result.weaving).toBeDefined()
    expect(result.bounding).toBeDefined()
    expect(result.deepening).toBeDefined()
  })

  it('scores poor content low', () => {
    const result = analyzeCopperPath(poorContent, 'bad.ts')
    expect(result.qualityScore).toBeLessThan(50)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const result = analyzeCopperPath(richContent, 'test.ts')
    const expected = Math.round(
      result.pathClarity * 0.2 +
      result.copperPatience * 0.2 +
      result.twistCoherence * 0.2 +
      result.wallResilience * 0.2 +
      result.centerWisdom * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── analyzeCopperMaze ─────────────────────────────────

describe('analyzeCopperMaze', () => {
  it('returns empty maze for no paths', () => {
    const result = analyzeCopperMaze([], 'src')
    expect(result.directory).toBe('src')
    expect(result.paths).toHaveLength(0)
    expect(result.avgClarity).toBe(0)
    expect(result.mazeType).toBe('no-maze')
    expect(result.condition).toBe('void')
  })

  it('aggregates path scores', () => {
    const paths = [makePath('a.ts', 80, 80, 80, 80, 80), makePath('b.ts', 60, 60, 60, 60, 60)]
    const result = analyzeCopperMaze(paths, 'src')
    expect(result.avgClarity).toBe(70)
    expect(result.avgCoherence).toBe(70)
    expect(result.avgWisdom).toBe(70)
  })

  it('counts masterpiece and void paths', () => {
    const masterpiece = makePath('a.ts', 95, 95, 95, 95, 95)
    const voidPath = makePath('b.ts', 5, 5, 5, 5, 5)
    const result = analyzeCopperMaze([masterpiece, voidPath], 'src')
    expect(result.labyrinthMasterpieceCount).toBe(1)
    expect(result.voidCount).toBe(1)
  })
})

// ─── buildCopperLabyrinthResult ─────────────────────────

describe('buildCopperLabyrinthResult', () => {
  it('returns valid result for single file', async () => {
    const result = await buildCopperLabyrinthResult(['app.ts'], [richContent])
    expect(result.paths).toHaveLength(1)
    expect(result.mazes).toHaveLength(1)
    expect(result.labyrinth.overallNavigation).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns zero averages for empty input', async () => {
    const result = await buildCopperLabyrinthResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallNavigation).toBe(0)
    expect(result.labyrinth.isCopper).toBe(false)
  })

  it('groups files by directory', async () => {
    const result = await buildCopperLabyrinthResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, moderateContent],
    )
    expect(result.mazes.length).toBe(2)
    expect(result.stats.totalMazes).toBe(2)
  })

  it('computes navigator grade correctly', async () => {
    const result = await buildCopperLabyrinthResult(['a.ts'], [richContent])
    expect(result.stats.navigatorGrade).toBeDefined()
    expect(result.labyrinth.isCopper).toBe(result.labyrinth.overallNavigation >= 60)
  })

  it('finds best path and extremes', async () => {
    const result = await buildCopperLabyrinthResult(
      ['a.ts', 'b.ts'],
      [richContent, moderateContent],
    )
    expect(result.stats.bestPath).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPatient).toBeTruthy()
    expect(result.stats.mostCoherent).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('scores rich content at max', async () => {
    const result = await buildCopperLabyrinthResult(['perfect.ts'], [richContent])
    expect(result.paths[0].pathClarity).toBe(100)
    expect(result.paths[0].copperPatience).toBe(100)
    expect(result.paths[0].twistCoherence).toBe(100)
    expect(result.paths[0].wallResilience).toBe(100)
    expect(result.paths[0].centerWisdom).toBe(100)
    expect(result.paths[0].qualityScore).toBe(100)
  })

  it('handles multiple files with mixed content', async () => {
    const result = await buildCopperLabyrinthResult(
      ['good.ts', 'bad.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.paths).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const paths = [makePath('a.ts', 95, 95, 95, 95, 95)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 95, avgCoherence: 95, avgWisdom: 95, isCopper: true, overallNavigation: 95 }
    const stats = makeStats({
      avgPathClarity: 95, avgCopperPatience: 95, avgTwistCoherence: 95,
      avgWallResilience: 95, avgCenterWisdom: 95, overallNavigation: 95,
    })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends improving clarity when low', () => {
    const paths = [makePath('a.ts', 50, 90, 90, 90, 90)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 50, avgCoherence: 90, avgWisdom: 90, isCopper: true, overallNavigation: 82 }
    const stats = makeStats({ avgPathClarity: 50, avgCopperPatience: 90, avgTwistCoherence: 90, avgWallResilience: 90, avgCenterWisdom: 90, overallNavigation: 82 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('Illuminate'))).toBe(true)
  })

  it('recommends improving patience when low', () => {
    const paths = [makePath('a.ts', 90, 50, 90, 90, 90)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 90, avgCoherence: 90, avgWisdom: 90, isCopper: true, overallNavigation: 82 }
    const stats = makeStats({ avgPathClarity: 90, avgCopperPatience: 50, avgTwistCoherence: 90, avgWallResilience: 90, avgCenterWisdom: 90, overallNavigation: 82 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('copper patience'))).toBe(true)
  })

  it('recommends improving coherence when low', () => {
    const paths = [makePath('a.ts', 90, 90, 50, 90, 90)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 90, avgCoherence: 50, avgWisdom: 90, isCopper: true, overallNavigation: 82 }
    const stats = makeStats({ avgPathClarity: 90, avgCopperPatience: 90, avgTwistCoherence: 50, avgWallResilience: 90, avgCenterWisdom: 90, overallNavigation: 82 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('twist coherence'))).toBe(true)
  })

  it('recommends improving resilience when low', () => {
    const paths = [makePath('a.ts', 90, 90, 90, 50, 90)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 90, avgCoherence: 90, avgWisdom: 90, isCopper: true, overallNavigation: 82 }
    const stats = makeStats({ avgPathClarity: 90, avgCopperPatience: 90, avgTwistCoherence: 90, avgWallResilience: 50, avgCenterWisdom: 90, overallNavigation: 82 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('walls'))).toBe(true)
  })

  it('recommends improving wisdom when low', () => {
    const paths = [makePath('a.ts', 90, 90, 90, 90, 50)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 90, avgCoherence: 90, avgWisdom: 50, isCopper: true, overallNavigation: 82 }
    const stats = makeStats({ avgPathClarity: 90, avgCopperPatience: 90, avgTwistCoherence: 90, avgWallResilience: 90, avgCenterWisdom: 50, overallNavigation: 82 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('center wisdom'))).toBe(true)
  })

  it('warns about collapsed labyrinth when overall < 40', () => {
    const paths = [makePath('a.ts', 30, 30, 30, 30, 30)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 30, avgCoherence: 30, avgWisdom: 30, isCopper: false, overallNavigation: 30 }
    const stats = makeStats({ avgPathClarity: 30, avgCopperPatience: 30, avgTwistCoherence: 30, avgWallResilience: 30, avgCenterWisdom: 30, overallNavigation: 30 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('collapsed'))).toBe(true)
  })

  it('lists void paths when <= 5', () => {
    const paths = [
      makePath('a.ts', 5, 5, 5, 5, 5),
      makePath('b.ts', 90, 90, 90, 90, 90),
    ]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 47, avgCoherence: 47, avgWisdom: 47, isCopper: false, overallNavigation: 47 }
    const stats = makeStats({ overallNavigation: 47 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('a.ts'))).toBe(true)
  })

  it('warns about many void paths when > 5', () => {
    const paths = Array.from({ length: 6 }, (_, i) => makePath(`${i}.ts`, 5, 5, 5, 5, 5))
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 5, avgCoherence: 5, avgWisdom: 5, isCopper: false, overallNavigation: 5 }
    const stats = makeStats({ overallNavigation: 5, voidCount: 6 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('6 blocked paths'))).toBe(true)
  })

  it('warns about all collapsed mazes', () => {
    const paths = [makePath('a.ts', 5, 5, 5, 5, 5)]
    const mazes = [{ directory: 'src', paths, avgClarity: 5, avgCoherence: 5, avgWisdom: 5, labyrinthMasterpieceCount: 0, voidCount: 1, mazeType: 'open-field' as MazeType, condition: 'void' as MazeCondition }]
    const labyrinth = { avgClarity: 5, avgCoherence: 5, avgWisdom: 5, isCopper: false, overallNavigation: 5 }
    const stats = makeStats({ overallNavigation: 5 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('All maze sections have collapsed'))).toBe(true)
  })

  it('returns positive recommendation when scores are good', () => {
    const paths = [makePath('a.ts', 80, 80, 80, 80, 80)]
    const mazes: CopperMazeType[] = []
    const labyrinth = { avgClarity: 80, avgCoherence: 80, avgWisdom: 80, isCopper: true, overallNavigation: 80 }
    const stats = makeStats({ overallNavigation: 80 })
    const recs = generateRecommendations(paths, mazes, labyrinth, stats)
    expect(recs.some((r) => r.includes('navigates well'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for high score', () => {
    expect(typeof colorScore(95)).toBe('string')
  })
  it('returns a string for low score', () => {
    expect(typeof colorScore(5)).toBe('string')
  })
  it('returns a string for mid score', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
})

describe('colorMazeCondition', () => {
  it('colors copper-palace', () => {
    expect(typeof colorMazeCondition('copper-palace')).toBe('string')
  })
  it('colors void', () => {
    expect(typeof colorMazeCondition('void')).toBe('string')
  })
  it('colors unknown', () => {
    expect(typeof colorMazeCondition('unknown')).toBe('string')
  })
})

describe('formatPathTable', () => {
  it('formats a single path', () => {
    const path = makePath('app.ts', 80, 80, 80, 80, 80)
    const result = formatPathTable(path)
    expect(result).toContain('Copper Path: app.ts')
    expect(result).toContain('Path Clarity')
    expect(result).toContain('Quality Score')
  })
})

describe('formatPathsTable', () => {
  it('returns no-paths message for empty', () => {
    expect(formatPathsTable([])).toContain('No copper paths')
  })
  it('formats multiple paths', () => {
    const paths = [makePath('a.ts', 80, 80, 80, 80, 80), makePath('b.ts', 60, 60, 60, 60, 60)]
    const result = formatPathsTable(paths)
    expect(result).toContain('Copper Paths')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatMazeTable', () => {
  it('formats a single maze', () => {
    const maze: CopperMazeType = {
      directory: 'src', paths: [], avgClarity: 80, avgCoherence: 80, avgWisdom: 80,
      labyrinthMasterpieceCount: 1, voidCount: 0, mazeType: 'sacred-labyrinth', condition: 'copper-palace',
    }
    const result = formatMazeTable(maze)
    expect(result).toContain('Copper Maze: src')
    expect(result).toContain('Masterpieces')
  })
})

describe('formatMazesTable', () => {
  it('returns no-mazes message for empty', () => {
    expect(formatMazesTable([])).toContain('No copper mazes')
  })
  it('formats multiple mazes', () => {
    const mazes = [
      { directory: 'src', paths: [], avgClarity: 80, avgCoherence: 80, avgWisdom: 80, labyrinthMasterpieceCount: 0, voidCount: 0, mazeType: 'copper-maze' as MazeType, condition: 'aged-sanctuary' as MazeCondition },
      { directory: 'lib', paths: [], avgClarity: 50, avgCoherence: 50, avgWisdom: 50, labyrinthMasterpieceCount: 0, voidCount: 0, mazeType: 'proper-path' as MazeType, condition: 'proper-hall' as MazeCondition },
    ]
    const result = formatMazesTable(mazes)
    expect(result).toContain('src')
    expect(result).toContain('lib')
  })
})

describe('formatStatsTable', () => {
  it('formats all stats fields', () => {
    const stats = makeStats()
    const result = formatStatsTable(stats)
    expect(result).toContain('Copper Labyrinth Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Navigator Grade')
    expect(result).toContain('Best Path')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recs message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Improve Y'])
    expect(result).toContain('Fix X')
    expect(result).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats the full result', async () => {
    const result = await buildCopperLabyrinthResult(['app.ts'], [richContent])
    const table = formatResultTable(result)
    expect(table).toContain('Copper Labyrinth Analysis')
    expect(table).toContain('Labyrinth Overview')
    expect(table).toContain('Copper Labyrinth Statistics')
    expect(table).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCopperLabyrinthResult(['app.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.paths).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
  })
})
