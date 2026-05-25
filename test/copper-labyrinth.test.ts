import { describe, it, expect } from 'vitest'
import {
  measureNavigating,
  measureAging,
  measureTwisting,
  measureShielding,
  measureKnowing,
  classifyCopperCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyArchitectGrade,
  analyzeCopperPath,
  analyzeCopperChamber,
  generateRecommendations,
  buildCopperLabyrinthResult,
} from '../src/commands/copper-labyrinth-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPathTable,
  formatPathsTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-labyrinth-format-helpers.js'
import type { CopperPath, CopperChamber, CopperLabyrinthResult } from '../src/commands/copper-labyrinth-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────

const RichContent = `/**
 * Rich module
 */
export interface Store<T> {
  get(key: string): T
  set(key: string, val: T): Void
}

export class DataStore<T> extends BaseStore implements IStore {
  private items: T[] = []
  abstract process(): Void

  async fetch(): Promise<T> {
    const result = await api.get<T>('/data')
    const mapped = result.items.map(i => i.value).filter(Boolean)
    return result
  }

  try {
    const data = this.parse(raw)
    if (data) {
      return data
    }
  } catch {
    return null
  }
}
`

const MinimalContent = `const x = 1`

const ToxicContent = `var x = eval("1 + 2")
var y = debugger
console.log("debug")
const z: any = null`

const EmptyContent = ``

function makePath(overrides: Partial<CopperPath> = {}): CopperPath {
  const base: CopperPath = {
    file: 'test.ts',
    pathClarity: 80,
    copperPatience: 80,
    twistCoherence: 80,
    wallResilience: 80,
    centerWisdom: 80,
    navigating: {
      clarity: 80, path: 'marked-trail', hasHighClarity: true,
      hasReadable: true, hasSelfDocumenting: true, hasNoCryptic: true,
      hasClear: true, hasNoObfuscated: true, hasTransparent: true,
      hasNoHidden: true, hasUnderstandable: true, hasNoArcane: true,
      hasVisible: true, hasNoInvisible: true, hasDirectFlow: true,
      hasNoCircuits: true, hasNavigable: true, crypticCount: 0, obfuscatedCount: 0,
    },
    aging: {
      patience: 80, patina: 'aged-copper', hasHighPatience: true,
      hasDocumented: true, hasWellStructured: true, hasNoAdHoc: true,
      hasProven: true, hasNoExperimental: true, hasMature: true,
      hasNoNaive: true, hasEstablished: true, hasNoNovel: true,
      hasBattleTested: true, hasNoUnproven: true, hasMaintained: true,
      hasNoAbandoned: true, hasTimeless: true, adHocCount: 0, experimentalCount: 0,
    },
    twisting: {
      coherence: 80, logic: 'logical-maze', hasHighCoherence: true,
      hasConsistent: true, hasNoContradictory: true, hasLogical: true,
      hasNoIllogical: true, hasPredictable: true, hasNoSurprising: true,
      hasStructured: true, hasNoChaotic: true, hasOrdered: true,
      hasNoRandom: true, hasSystematic: true, hasNoHaphazard: true,
      hasCoherent: true, hasNoConfusing: true, contradictoryCount: 0, chaoticCount: 0,
    },
    shielding: {
      resilience: 80, wall: 'strong-barrier', hasHighResilience: true,
      hasTested: true, hasNoUntested: true, hasTypeSafe: true,
      hasNoUnsafe: true, hasErrorHandled: true, hasNoBareCrash: true,
      hasEncapsulated: true, hasNoLeaked: true, hasPrivate: true,
      hasNoExposed: true, hasDefensive: true, hasNoNaive: true,
      hasRobust: true, hasNoFragile: true, untestedCount: 0, bareCrashCount: 0,
    },
    knowing: {
      wisdom: 80, center: 'labyrinth-keeper', hasHighWisdom: true,
      hasWellArchitected: true, hasNoHacked: true, hasPrincipled: true,
      hasNoAdHoc: true, hasPatterned: true, hasNoReinvented: true,
      hasDeep: true, hasNoShallow: true, hasInsightful: true,
      hasNoObvious: true, hasStrategic: true, hasNoTactical: true,
      hasVisionary: true, hasNoTunnelVision: true, hackedCount: 0, adHocCount: 0,
    },
    condition: 'copper-maze',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<CopperLabyrinthResult['stats']> = {}): CopperLabyrinthResult['stats'] {
  return {
    totalFiles: 1, totalChambers: 1,
    avgPathClarity: 80, avgCopperPatience: 80, avgTwistCoherence: 80,
    avgWallResilience: 80, avgCenterWisdom: 80,
    goldenLabyrinthCount: 0, copperMazeCount: 1, properPassageCount: 0,
    tangledWiresCount: 0, darkCorridorCount: 0, collapseCount: 0,
    hasHighClarityCount: 1, hasHighPatienceCount: 1, hasHighCoherenceCount: 1,
    hasHighResilienceCount: 1, hasHighWisdomCount: 1,
    overallNavigability: 80, architectGrade: 'labyrinth-designer',
    bestPath: 'test.ts', clearest: 'test.ts', mostPatient: 'test.ts',
    mostCoherent: 'test.ts', wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureNavigating ─────────────────────────────────────────────

describe('measureNavigating', () => {
  it('returns a valid NavigatingMeasure', () => {
    const m = measureNavigating(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('path')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('scores rich content higher than minimal', () => {
    expect(measureNavigating(RichContent).clarity).toBeGreaterThan(measureNavigating(MinimalContent).clarity)
  })

  it('penalizes toxic content', () => {
    expect(measureNavigating(ToxicContent).clarity).toBeLessThan(20)
  })

  it('scores empty as 0', () => {
    expect(measureNavigating(EmptyContent).clarity).toBe(0)
  })

  it('detects eval and any as cryptic', () => {
    const m = measureNavigating('var x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects var and debugger as obfuscated', () => {
    const m = measureNavigating('var x = 1\ndebugger')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects pipeline + arrow as direct flow', () => {
    expect(measureNavigating('const x = items.map(i => i.val)').hasDirectFlow).toBe(true)
  })
})

// ─── measureAging ──────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns a valid AgingMeasure', () => {
    const m = measureAging(RichContent)
    expect(m).toHaveProperty('patience')
    expect(m).toHaveProperty('patina')
    expect(m).toHaveProperty('adHocCount')
    expect(m).toHaveProperty('experimentalCount')
  })

  it('penalizes var and eval as ad-hoc', () => {
    expect(measureAging('var x = eval("1")').adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes any as experimental', () => {
    expect(measureAging('const x: any = 1').experimentalCount).toBeGreaterThanOrEqual(1)
  })

  it('detects docs as documented', () => {
    expect(measureAging('/** docs */').hasDocumented).toBe(true)
  })

  it('detects extends + implements as established', () => {
    expect(measureAging('class Foo extends Bar implements Baz {}').hasEstablished).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureAging(EmptyContent).patience).toBe(0)
  })
})

// ─── measureTwisting ───────────────────────────────────────────────

describe('measureTwisting', () => {
  it('returns a valid TwistingMeasure', () => {
    const m = measureTwisting(RichContent)
    expect(m).toHaveProperty('coherence')
    expect(m).toHaveProperty('logic')
    expect(m).toHaveProperty('contradictoryCount')
    expect(m).toHaveProperty('chaoticCount')
  })

  it('penalizes var and eval as contradictory', () => {
    const m = measureTwisting('var x = eval("1")')
    expect(m.contradictoryCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes any and debugger as chaotic', () => {
    const m = measureTwisting('const x: any = 1\ndebugger')
    expect(m.chaoticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects generics + optional as systematic', () => {
    expect(measureTwisting('function foo<T>(x?: T): T { return x }').hasSystematic).toBe(true)
  })

  it('detects interface + export as structured', () => {
    expect(measureTwisting('export interface Foo { x: Number }').hasStructured).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureTwisting(EmptyContent).coherence).toBe(0)
  })
})

// ─── measureShielding ──────────────────────────────────────────────

describe('measureShielding', () => {
  it('returns a valid ShieldingMeasure', () => {
    const m = measureShielding(RichContent)
    expect(m).toHaveProperty('resilience')
    expect(m).toHaveProperty('wall')
    expect(m).toHaveProperty('untestedCount')
    expect(m).toHaveProperty('bareCrashCount')
  })

  it('penalizes var as untested', () => {
    expect(measureShielding('var x = 1').untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and debugger as bare crash', () => {
    expect(measureShielding('eval("x")\ndebugger').bareCrashCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as tested', () => {
    expect(measureShielding('try { const x = 1 } catch { }').hasTested).toBe(true)
  })

  it('detects private as encapsulated', () => {
    expect(measureShielding('class Foo { private x: Number }').hasEncapsulated).toBe(true)
  })

  it('detects returnType + no any as type safe', () => {
    expect(measureShielding('function foo(): Void {}').hasTypeSafe).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureShielding(EmptyContent).resilience).toBe(0)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('center')
    expect(m).toHaveProperty('hackedCount')
    expect(m).toHaveProperty('adHocCount')
  })

  it('penalizes as any as hacked', () => {
    expect(measureKnowing('const x = value as any').hackedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and any as ad-hoc', () => {
    expect(measureKnowing('const x: any = eval("1")').adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('detects abstract + extends as principled', () => {
    expect(measureKnowing('abstract class Foo extends Bar {}').hasPrincipled).toBe(true)
  })

  it('detects extends + implements as patterned', () => {
    expect(measureKnowing('class Foo extends Bar implements Baz {}').hasPatterned).toBe(true)
  })

  it('detects generics + returnType as deep', () => {
    expect(measureKnowing('function foo<T>(): Type { return x }').hasDeep).toBe(true)
  })

  it('scores empty as 0', () => {
    expect(measureKnowing(EmptyContent).wisdom).toBe(0)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyCopperCondition', () => {
  it('classifies 90+ as golden-labyrinth', () => {
    expect(classifyCopperCondition(90)).toBe('golden-labyrinth')
    expect(classifyCopperCondition(100)).toBe('golden-labyrinth')
  })
  it('classifies 75-89 as copper-maze', () => {
    expect(classifyCopperCondition(75)).toBe('copper-maze')
  })
  it('classifies 60-74 as proper-passage', () => {
    expect(classifyCopperCondition(60)).toBe('proper-passage')
  })
  it('classifies 40-59 as tangled-wires', () => {
    expect(classifyCopperCondition(40)).toBe('tangled-wires')
  })
  it('classifies 20-39 as dark-corridor', () => {
    expect(classifyCopperCondition(20)).toBe('dark-corridor')
  })
  it('classifies 0-19 as collapse', () => {
    expect(classifyCopperCondition(0)).toBe('collapse')
  })
})

describe('classifyChamberType', () => {
  it('returns no-chamber for empty', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })
  it('returns grand-labyrinth for high avg', () => {
    const paths = [makePath({ condition: 'golden-labyrinth', qualityScore: 90 }), makePath({ condition: 'golden-labyrinth', qualityScore: 90 })]
    expect(classifyChamberType(paths)).toBe('grand-labyrinth')
  })
  it('returns no-chamber for very low', () => {
    const paths = [makePath({ condition: 'collapse', qualityScore: 5 }), makePath({ condition: 'collapse', qualityScore: 5 })]
    expect(classifyChamberType(paths)).toBe('no-chamber')
  })
})

describe('classifyChamberCondition', () => {
  it('classifies 85+ as magnificent-maze', () => { expect(classifyChamberCondition(85)).toBe('magnificent-maze') })
  it('classifies 70-84 as copper-palace', () => { expect(classifyChamberCondition(70)).toBe('copper-palace') })
  it('classifies 55-69 as proper-hall', () => { expect(classifyChamberCondition(55)).toBe('proper-hall') })
  it('classifies 35-54 as tangled-tunnel', () => { expect(classifyChamberCondition(35)).toBe('tangled-tunnel') })
  it('classifies 15-34 as collapsed-shaft', () => { expect(classifyChamberCondition(15)).toBe('collapsed-shaft') })
  it('classifies 0-14 as void', () => { expect(classifyChamberCondition(0)).toBe('void') })
})

describe('classifyArchitectGrade', () => {
  it('classifies 85+ as master-architect', () => { expect(classifyArchitectGrade(85)).toBe('master-architect') })
  it('classifies 70-84 as labyrinth-designer', () => { expect(classifyArchitectGrade(70)).toBe('labyrinth-designer') })
  it('classifies 55-69 as skilled-builder', () => { expect(classifyArchitectGrade(55)).toBe('skilled-builder') })
  it('classifies 40-54 as apprentice', () => { expect(classifyArchitectGrade(40)).toBe('apprentice') })
  it('classifies 20-39 as novice', () => { expect(classifyArchitectGrade(20)).toBe('novice') })
  it('classifies 0-19 as wall-banger', () => { expect(classifyArchitectGrade(0)).toBe('wall-banger') })
})

// ─── analyzeCopperPath ─────────────────────────────────────────────

describe('analyzeCopperPath', () => {
  it('returns a full CopperPath', () => {
    const p = analyzeCopperPath(RichContent, 'rich.ts')
    expect(p.file).toBe('rich.ts')
    expect(p.pathClarity).toBeGreaterThan(0)
    expect(p.qualityScore).toBeGreaterThan(0)
    expect(p.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average', () => {
    const p = analyzeCopperPath(RichContent, 'test.ts')
    const expected = Math.round(
      p.pathClarity * 0.2 + p.copperPatience * 0.2 +
      p.twistCoherence * 0.2 + p.wallResilience * 0.2 + p.centerWisdom * 0.2,
    )
    expect(p.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    expect(analyzeCopperPath(EmptyContent, 'empty.ts').condition).toBe('collapse')
  })

  it('handles toxic content gracefully', () => {
    expect(analyzeCopperPath(ToxicContent, 'bad.ts').qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeCopperChamber ──────────────────────────────────────────

describe('analyzeCopperChamber', () => {
  it('returns empty chamber for no paths', () => {
    const c = analyzeCopperChamber([], 'empty-dir')
    expect(c.paths).toHaveLength(0)
    expect(c.chamberType).toBe('no-chamber')
    expect(c.condition).toBe('void')
  })

  it('aggregates path data correctly', () => {
    const paths = [
      makePath({ pathClarity: 80, twistCoherence: 70, centerWisdom: 60 }),
      makePath({ pathClarity: 60, twistCoherence: 50, centerWisdom: 40 }),
    ]
    const c = analyzeCopperChamber(paths, 'src')
    expect(c.avgClarity).toBe(70)
    expect(c.avgCoherence).toBe(60)
    expect(c.avgWisdom).toBe(50)
  })

  it('counts golden and collapsed', () => {
    const paths = [
      makePath({ condition: 'golden-labyrinth' }),
      makePath({ condition: 'collapse' }),
      makePath({ condition: 'copper-maze' }),
    ]
    const c = analyzeCopperChamber(paths, 'src')
    expect(c.goldenLabyrinthCount).toBe(1)
    expect(c.collapseCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high navigability with no collapse', () => {
    const stats = makeStats({ overallNavigability: 90, collapseCount: 0 })
    const maze = { avgClarity: 90, avgCoherence: 90, avgWisdom: 90, isGolden: true, overallNavigability: 90 }
    const recs = generateRecommendations([makePath()], [], maze, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends illuminating when clarity low', () => {
    const stats = makeStats({ avgPathClarity: 40, overallNavigability: 40 })
    const maze = { avgClarity: 40, avgCoherence: 80, avgWisdom: 80, isGolden: false, overallNavigability: 40 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('Illuminate'))).toBe(true)
  })

  it('recommends aging when patience low', () => {
    const stats = makeStats({ avgCopperPatience: 30, overallNavigability: 30 })
    const maze = { avgClarity: 80, avgCoherence: 80, avgWisdom: 80, isGolden: false, overallNavigability: 30 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('Age') || r.includes('copper'))).toBe(true)
  })

  it('recommends straightening when coherence low', () => {
    const stats = makeStats({ avgTwistCoherence: 30, overallNavigability: 30 })
    const maze = { avgClarity: 80, avgCoherence: 30, avgWisdom: 80, isGolden: false, overallNavigability: 30 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('Straighten') || r.includes('twist'))).toBe(true)
  })

  it('recommends fortifying when resilience low', () => {
    const stats = makeStats({ avgWallResilience: 30, overallNavigability: 30 })
    const maze = { avgClarity: 80, avgCoherence: 80, avgWisdom: 80, isGolden: false, overallNavigability: 30 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('Fortif') || r.includes('wall'))).toBe(true)
  })

  it('recommends deepening when wisdom low', () => {
    const stats = makeStats({ avgCenterWisdom: 30, overallNavigability: 30 })
    const maze = { avgClarity: 80, avgCoherence: 80, avgWisdom: 30, isGolden: false, overallNavigability: 30 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('Deepen') || r.includes('wisdom'))).toBe(true)
  })

  it('mentions collapsed files when present', () => {
    const paths = [makePath({ condition: 'collapse', file: 'bad.ts' })]
    const stats = makeStats({ collapseCount: 1, overallNavigability: 30 })
    const maze = { avgClarity: 40, avgCoherence: 40, avgWisdom: 40, isGolden: false, overallNavigability: 30 }
    const recs = generateRecommendations(paths, [], maze, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many collapsed files as count', () => {
    const paths = Array.from({ length: 5 }, (_, i) => makePath({ condition: 'collapse', file: `bad${i}.ts` }))
    const stats = makeStats({ collapseCount: 5, overallNavigability: 10 })
    const maze = { avgClarity: 10, avgCoherence: 10, avgWisdom: 10, isGolden: false, overallNavigability: 10 }
    const recs = generateRecommendations(paths, [], maze, stats)
    expect(recs.some(r => r.includes('5 collapsed'))).toBe(true)
  })

  it('mentions dim/collapsed chambers', () => {
    const ch: CopperChamber = {
      directory: 'src', paths: [], avgClarity: 30, avgCoherence: 30, avgWisdom: 30,
      goldenLabyrinthCount: 0, collapseCount: 0, chamberType: 'small-hallway', condition: 'tangled-tunnel',
    }
    const stats = makeStats({ overallNavigability: 50 })
    const maze = { avgClarity: 50, avgCoherence: 50, avgWisdom: 50, isGolden: false, overallNavigability: 50 }
    const recs = generateRecommendations([], [ch, ch], maze, stats)
    expect(recs.some(r => r.includes('chamber'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallNavigability: 80, collapseCount: 0, avgPathClarity: 80, avgCopperPatience: 80, avgTwistCoherence: 80, avgWallResilience: 80, avgCenterWisdom: 80 })
    const maze = { avgClarity: 80, avgCoherence: 80, avgWisdom: 80, isGolden: true, overallNavigability: 80 }
    const recs = generateRecommendations([], [], maze, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildCopperLabyrinthResult ────────────────────────────────────

describe('buildCopperLabyrinthResult', () => {
  it('returns a complete result', async () => {
    const result = await buildCopperLabyrinthResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.paths).toHaveLength(2)
    expect(result.chambers.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.maze.overallNavigability).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildCopperLabyrinthResult([], [])
    expect(result.paths).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallNavigability).toBe(0)
  })

  it('computes overallNavigability as avg of clarity, coherence, wisdom', async () => {
    const result = await buildCopperLabyrinthResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgPathClarity + result.stats.avgTwistCoherence + result.stats.avgCenterWisdom) / 3,
    )
    expect(result.stats.overallNavigability).toBe(expected)
  })

  it('finds best path correctly', async () => {
    const result = await buildCopperLabyrinthResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestPath).toBe('good.ts')
  })

  it('groups files into chambers by directory', async () => {
    const result = await buildCopperLabyrinthResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.chambers.length).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for golden-labyrinth', () => { expect(typeof colorGrade('golden-labyrinth')).toBe('string') })
  it('returns string for collapse', () => { expect(typeof colorGrade('collapse')).toBe('string') })
})

describe('formatPathTable', () => {
  it('formats a path', () => {
    const out = formatPathTable(makePath())
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
  })
})

describe('formatPathsTable', () => {
  it('returns message for empty', () => { expect(formatPathsTable([])).toContain('No copper paths') })
  it('formats multiple paths', () => {
    const out = formatPathsTable([makePath(), makePath({ file: 'other.ts' })])
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatChamberTable', () => {
  it('formats a chamber', () => {
    const ch: CopperChamber = {
      directory: 'src', paths: [makePath()], avgClarity: 80, avgCoherence: 70, avgWisdom: 60,
      goldenLabyrinthCount: 1, collapseCount: 0, chamberType: 'copper-maze', condition: 'copper-palace',
    }
    const out = formatChamberTable(ch)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatChambersTable', () => {
  it('returns message for empty', () => { expect(formatChambersTable([])).toContain('No copper chambers') })
})

describe('formatStatsTable', () => {
  it('formats stats', () => {
    const out = formatStatsTable(makeStats())
    expect(out).toContain('Copper Labyrinth Statistics')
    expect(out).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('returns no recs for empty', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recs as bullets', () => {
    const out = formatRecommendations(['Improve code', 'Add docs'])
    expect(out).toContain('Improve code')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCopperLabyrinthResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Copper Path Analysis')
    expect(out).toContain('Copper Chambers')
    expect(out).toContain('Copper Labyrinth Statistics')
    expect(out).toContain('Maze')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCopperLabyrinthResult(['a.ts'], [RichContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.paths).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.maze).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
