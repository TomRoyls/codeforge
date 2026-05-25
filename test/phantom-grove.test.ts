import { describe, it, expect } from 'vitest'
import {
  measureDrifting,
  measureHaunting,
  measureRevealing,
  measureGrounding,
  measureKnowing,
  classifyPhantomCondition,
  classifyClearingType,
  classifyClearingCondition,
  classifyRangerGrade,
  analyzePhantomTree,
  analyzePhantomClearing,
  generateRecommendations,
  buildPhantomGroveResult,
} from '../src/commands/phantom-grove-helpers.js'
import {
  colorScore,
  colorGrade,
  formatTreeTable,
  formatTreesTable,
  formatClearingTable,
  formatClearingsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/phantom-grove-format-helpers.js'
import type { PhantomTree, PhantomClearing, PhantomGroveResult } from '../src/commands/phantom-grove-helpers.js'

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

function makeTree(overrides: Partial<PhantomTree> = {}): PhantomTree {
  const base: PhantomTree = {
    file: 'test.ts',
    etherealQuality: 80,
    ghostHandling: 80,
    mistClarity: 80,
    rootDepth: 80,
    shadowWisdom: 80,
    drifting: {
      quality: 80,
      spirit: 'light-spirit',
      hasHighQuality: true,
      hasLightweight: true,
      hasNoBloated: true,
      hasEfficient: true,
      hasNoWasteful: true,
      hasElegant: true,
      hasNoClunky: true,
      hasNoDeadCode: true,
      hasNoFiller: true,
      hasEssential: true,
      hasNoBoilerplate: true,
      hasStreamlined: true,
      hasNoCircuits: true,
      hasMinimal: true,
      bloatedCount: 0,
      fillerCount: 0,
    },
    haunting: {
      handling: 80,
      ghost: 'ghost-hunter',
      hasHighHandling: true,
      hasNullSafe: true,
      hasNoNPE: true,
      hasErrorHandled: true,
      hasNoBareCrash: true,
      hasEdgeCaseCovered: true,
      hasNoSinglePath: true,
      hasBoundaryChecked: true,
      hasNoAssumed: true,
      hasValidated: true,
      hasNoTrusting: true,
      hasGraceful: true,
      hasNoHarshFail: true,
      hasRecoverable: true,
      hasNoFatal: true,
      npeCount: 0,
      bareCrashCount: 0,
    },
    revealing: {
      clarity: 80,
      mist: 'clear-fog',
      hasHighClarity: true,
      hasReadable: true,
      hasSelfDocumenting: true,
      hasNoCryptic: true,
      hasClear: true,
      hasNoObfuscated: true,
      hasUnderstandable: true,
      hasNoArcane: true,
      hasTransparent: true,
      hasNoHidden: true,
      hasVisible: true,
      hasNoInvisible: true,
      hasIlluminated: true,
      hasNoDark: true,
      hasObvious: true,
      crypticCount: 0,
      obfuscatedCount: 0,
    },
    grounding: {
      depth: 80,
      root: 'strong-roots',
      hasHighDepth: true,
      hasTested: true,
      hasNoUntested: true,
      hasTypeSafe: true,
      hasNoUnsafe: true,
      hasWellStructured: true,
      hasNoChaotic: true,
      hasModular: true,
      hasNoMonolithic: true,
      hasDocumented: true,
      hasNoUndocumented: true,
      hasLayered: true,
      hasNoFlat: true,
      hasStable: true,
      untestedCount: 0,
      undocumentedCount: 0,
    },
    knowing: {
      wisdom: 80,
      shadow: 'dark-scholar',
      hasHighWisdom: true,
      hasPrincipled: true,
      hasNoAdHoc: true,
      hasPatterned: true,
      hasNoReinvented: true,
      hasMature: true,
      hasNoNaive: true,
      hasDefensive: true,
      hasNoOptimistic: true,
      hasProven: true,
      hasNoExperimental: true,
      hasBattleTested: true,
      hasNoUnproven: true,
      hasEstablished: true,
      hasWellArchitected: true,
      adHocCount: 0,
      optimisticCount: 0,
    },
    condition: 'ethereal-grove',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<PhantomGroveResult['stats']> = {}): PhantomGroveResult['stats'] {
  return {
    totalFiles: 1,
    totalClearings: 1,
    avgEtherealQuality: 80,
    avgGhostHandling: 80,
    avgMistClarity: 80,
    avgRootDepth: 80,
    avgShadowWisdom: 80,
    phantomMasterpieceCount: 0,
    etherealGroveCount: 1,
    properForestCount: 0,
    foggyWoodsCount: 0,
    deadTreesCount: 0,
    voidCount: 0,
    hasHighQualityCount: 1,
    hasHighHandlingCount: 1,
    hasHighClarityCount: 1,
    hasHighDepthCount: 1,
    hasHighWisdomCount: 1,
    overallEtherealness: 80,
    rangerGrade: 'mystic-guide',
    bestTree: 'test.ts',
    mostEthereal: 'test.ts',
    bestGhostHunter: 'test.ts',
    clearest: 'test.ts',
    wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureDrifting ───────────────────────────────────────────────

describe('measureDrifting', () => {
  it('returns a valid DriftingMeasure', () => {
    const m = measureDrifting(RichContent)
    expect(m).toHaveProperty('quality')
    expect(m).toHaveProperty('spirit')
    expect(m).toHaveProperty('bloatedCount')
    expect(m).toHaveProperty('fillerCount')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureDrifting(RichContent)
    const minimal = measureDrifting(MinimalContent)
    expect(rich.quality).toBeGreaterThan(minimal.quality)
  })

  it('penalizes toxic content', () => {
    const m = measureDrifting(ToxicContent)
    expect(m.quality).toBeLessThan(20)
  })

  it('scores empty content as 0', () => {
    const m = measureDrifting(EmptyContent)
    expect(m.quality).toBe(0)
  })

  it('detects console as bloated', () => {
    const m = measureDrifting('console.log("x")')
    expect(m.bloatedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoBloated).toBe(false)
  })

  it('detects eval and debugger as filler', () => {
    const m = measureDrifting('eval("x")\ndebugger')
    expect(m.fillerCount).toBeGreaterThanOrEqual(2)
  })

  it('detects arrow + const as lightweight', () => {
    const m = measureDrifting('const x = [1].map(n => n)')
    expect(m.hasLightweight).toBe(true)
  })

  it('detects returnType + generics as elegant', () => {
    const m = measureDrifting('function pipe<T>(x: T): Array<T> { return [x] }')
    expect(m.hasElegant).toBe(true)
  })
})

// ─── measureHaunting ───────────────────────────────────────────────

describe('measureHaunting', () => {
  it('returns a valid HauntingMeasure', () => {
    const m = measureHaunting(RichContent)
    expect(m).toHaveProperty('handling')
    expect(m).toHaveProperty('ghost')
    expect(m).toHaveProperty('npeCount')
    expect(m).toHaveProperty('bareCrashCount')
  })

  it('penalizes var as npe', () => {
    const m = measureHaunting('var x = 1')
    expect(m.npeCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and debugger as bare crash', () => {
    const m = measureHaunting('eval("x")\ndebugger')
    expect(m.bareCrashCount).toBeGreaterThanOrEqual(2)
  })

  it('detects try-catch as error handled', () => {
    const m = measureHaunting('try { const x = 1 } catch { }')
    expect(m.hasErrorHandled).toBe(true)
  })

  it('detects optional + returnType as null safe', () => {
    const m = measureHaunting('function foo(x?: String): Void {}')
    expect(m.hasNullSafe).toBe(true)
  })

  it('detects optional + tryCatch as edge case covered', () => {
    const m = measureHaunting('function foo(x?: String): Void { try {} catch {} }')
    expect(m.hasEdgeCaseCovered).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureHaunting(EmptyContent)
    expect(m.handling).toBe(0)
  })
})

// ─── measureRevealing ──────────────────────────────────────────────

describe('measureRevealing', () => {
  it('returns a valid RevealingMeasure', () => {
    const m = measureRevealing(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('mist')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('penalizes eval and any as cryptic', () => {
    const m = measureRevealing('const x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var and debugger as obfuscated', () => {
    const m = measureRevealing('var x = 1\ndebugger')
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(2)
  })

  it('detects returnType + named as self documenting', () => {
    const m = measureRevealing('export function Foo(): Void {}')
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects export + no any as transparent', () => {
    const m = measureRevealing('export function Foo(): Void {}')
    expect(m.hasTransparent).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureRevealing(EmptyContent)
    expect(m.clarity).toBe(0)
  })
})

// ─── measureGrounding ──────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns a valid GroundingMeasure', () => {
    const m = measureGrounding(RichContent)
    expect(m).toHaveProperty('depth')
    expect(m).toHaveProperty('root')
    expect(m).toHaveProperty('untestedCount')
    expect(m).toHaveProperty('undocumentedCount')
  })

  it('penalizes var as untested', () => {
    const m = measureGrounding('var x = 1')
    expect(m.untestedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoUntested).toBe(false)
  })

  it('penalizes var as undocumented', () => {
    const m = measureGrounding('var x = 1')
    expect(m.undocumentedCount).toBeGreaterThanOrEqual(1)
  })

  it('detects try-catch as tested', () => {
    const m = measureGrounding('try { const x = 1 } catch { }')
    expect(m.hasTested).toBe(true)
  })

  it('detects interface + export as well structured', () => {
    const m = measureGrounding('export interface Foo { x: Number }')
    expect(m.hasWellStructured).toBe(true)
  })

  it('detects extends or implements as layered', () => {
    const m = measureGrounding('class Foo extends Bar implements Baz {}')
    expect(m.hasLayered).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureGrounding(EmptyContent)
    expect(m.depth).toBe(0)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('shadow')
    expect(m).toHaveProperty('adHocCount')
    expect(m).toHaveProperty('optimisticCount')
  })

  it('penalizes eval and any as ad-hoc', () => {
    const m = measureKnowing('const x: any = eval("1")')
    expect(m.adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var and hackyCast as optimistic', () => {
    const m = measureKnowing('var x = val as any')
    expect(m.optimisticCount).toBeGreaterThanOrEqual(2)
  })

  it('detects abstract or extends as principled', () => {
    const m = measureKnowing('abstract class Foo extends Bar {}')
    expect(m.hasPrincipled).toBe(true)
  })

  it('detects doc + export as mature', () => {
    const m = measureKnowing('/** docs */\nexport function foo(): Void {}')
    expect(m.hasMature).toBe(true)
  })

  it('detects tryCatch + returnType as defensive', () => {
    const m = measureKnowing('try {} catch {}\nfunction f(): Void {}')
    expect(m.hasDefensive).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureKnowing(EmptyContent)
    expect(m.wisdom).toBe(0)
  })

  it('detects extends + implements as established', () => {
    const m = measureKnowing('class Foo extends Bar implements Baz {}')
    expect(m.hasEstablished).toBe(true)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyPhantomCondition', () => {
  it('classifies 90+ as phantom-masterpiece', () => {
    expect(classifyPhantomCondition(90)).toBe('phantom-masterpiece')
    expect(classifyPhantomCondition(100)).toBe('phantom-masterpiece')
  })

  it('classifies 75-89 as ethereal-grove', () => {
    expect(classifyPhantomCondition(75)).toBe('ethereal-grove')
    expect(classifyPhantomCondition(89)).toBe('ethereal-grove')
  })

  it('classifies 60-74 as proper-forest', () => {
    expect(classifyPhantomCondition(60)).toBe('proper-forest')
  })

  it('classifies 40-59 as foggy-woods', () => {
    expect(classifyPhantomCondition(40)).toBe('foggy-woods')
  })

  it('classifies 20-39 as dead-trees', () => {
    expect(classifyPhantomCondition(20)).toBe('dead-trees')
  })

  it('classifies 0-19 as void', () => {
    expect(classifyPhantomCondition(0)).toBe('void')
    expect(classifyPhantomCondition(19)).toBe('void')
  })
})

describe('classifyClearingType', () => {
  it('returns no-clearing for empty array', () => {
    expect(classifyClearingType([])).toBe('no-clearing')
  })

  it('returns enchanted-grove for high avg and ratio', () => {
    const trees = [makeTree({ condition: 'phantom-masterpiece', qualityScore: 90 }), makeTree({ condition: 'phantom-masterpiece', qualityScore: 90 })]
    expect(classifyClearingType(trees)).toBe('enchanted-grove')
  })

  it('returns no-clearing for very low scores', () => {
    const trees = [makeTree({ condition: 'void', qualityScore: 5 }), makeTree({ condition: 'void', qualityScore: 5 })]
    expect(classifyClearingType(trees)).toBe('no-clearing')
  })
})

describe('classifyClearingCondition', () => {
  it('classifies 85+ as phantom-paradise', () => {
    expect(classifyClearingCondition(85)).toBe('phantom-paradise')
    expect(classifyClearingCondition(100)).toBe('phantom-paradise')
  })

  it('classifies 70-84 as mystical-forest', () => {
    expect(classifyClearingCondition(70)).toBe('mystical-forest')
  })

  it('classifies 55-69 as proper-grove', () => {
    expect(classifyClearingCondition(55)).toBe('proper-grove')
  })

  it('classifies 35-54 as foggy-woods', () => {
    expect(classifyClearingCondition(35)).toBe('foggy-woods')
  })

  it('classifies 15-34 as dead-forest', () => {
    expect(classifyClearingCondition(15)).toBe('dead-forest')
  })

  it('classifies 0-14 as void', () => {
    expect(classifyClearingCondition(0)).toBe('void')
  })
})

describe('classifyRangerGrade', () => {
  it('classifies 85+ as phantom-ranger', () => {
    expect(classifyRangerGrade(85)).toBe('phantom-ranger')
    expect(classifyRangerGrade(100)).toBe('phantom-ranger')
  })

  it('classifies 70-84 as mystic-guide', () => {
    expect(classifyRangerGrade(70)).toBe('mystic-guide')
  })

  it('classifies 55-69 as forest-warden', () => {
    expect(classifyRangerGrade(55)).toBe('forest-warden')
  })

  it('classifies 40-54 as apprentice', () => {
    expect(classifyRangerGrade(40)).toBe('apprentice')
  })

  it('classifies 20-39 as novice', () => {
    expect(classifyRangerGrade(20)).toBe('novice')
  })

  it('classifies 0-19 as lost-soul', () => {
    expect(classifyRangerGrade(0)).toBe('lost-soul')
  })
})

// ─── analyzePhantomTree ────────────────────────────────────────────

describe('analyzePhantomTree', () => {
  it('returns a full PhantomTree', () => {
    const t = analyzePhantomTree(RichContent, 'rich.ts')
    expect(t.file).toBe('rich.ts')
    expect(t.etherealQuality).toBeGreaterThan(0)
    expect(t.ghostHandling).toBeGreaterThanOrEqual(0)
    expect(t.mistClarity).toBeGreaterThan(0)
    expect(t.rootDepth).toBeGreaterThan(0)
    expect(t.shadowWisdom).toBeGreaterThan(0)
    expect(t.qualityScore).toBeGreaterThan(0)
    expect(t.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const t = analyzePhantomTree(RichContent, 'test.ts')
    const expected = Math.round(
      t.etherealQuality * 0.2 +
      t.ghostHandling * 0.2 +
      t.mistClarity * 0.2 +
      t.rootDepth * 0.2 +
      t.shadowWisdom * 0.2,
    )
    expect(t.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    const t = analyzePhantomTree(EmptyContent, 'empty.ts')
    expect(t.condition).toBe('void')
  })

  it('handles toxic content gracefully', () => {
    const t = analyzePhantomTree(ToxicContent, 'bad.ts')
    expect(t.qualityScore).toBeLessThan(30)
  })
})

// ─── analyzePhantomClearing ────────────────────────────────────────

describe('analyzePhantomClearing', () => {
  it('returns empty clearing for no trees', () => {
    const c = analyzePhantomClearing([], 'empty-dir')
    expect(c.directory).toBe('empty-dir')
    expect(c.trees).toHaveLength(0)
    expect(c.avgQuality).toBe(0)
    expect(c.clearingType).toBe('no-clearing')
    expect(c.condition).toBe('void')
  })

  it('aggregates tree data correctly', () => {
    const trees = [
      makeTree({ etherealQuality: 80, ghostHandling: 70, shadowWisdom: 60, condition: 'ethereal-grove' }),
      makeTree({ etherealQuality: 60, ghostHandling: 50, shadowWisdom: 40, condition: 'proper-forest' }),
    ]
    const c = analyzePhantomClearing(trees, 'src')
    expect(c.avgQuality).toBe(70)
    expect(c.avgHandling).toBe(60)
    expect(c.avgWisdom).toBe(50)
  })

  it('counts masterpieces and void', () => {
    const trees = [
      makeTree({ condition: 'phantom-masterpiece' }),
      makeTree({ condition: 'void' }),
      makeTree({ condition: 'ethereal-grove' }),
    ]
    const c = analyzePhantomClearing(trees, 'src')
    expect(c.phantomMasterpieceCount).toBe(1)
    expect(c.voidCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high etherealness with no void', () => {
    const trees = [makeTree()]
    const clearings: PhantomClearing[] = []
    const forest = { avgQuality: 90, avgHandling: 90, avgWisdom: 90, isPhantom: true, overallEtherealness: 90 }
    const stats = makeStats({ overallEtherealness: 90, voidCount: 0 })
    const recs = generateRecommendations(trees, clearings, forest, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends lightening when quality low', () => {
    const stats = makeStats({ avgEtherealQuality: 40, overallEtherealness: 40 })
    const forest = { avgQuality: 40, avgHandling: 80, avgWisdom: 80, isPhantom: false, overallEtherealness: 40 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('Lighten'))).toBe(true)
  })

  it('recommends ghost handling when low', () => {
    const stats = makeStats({ avgGhostHandling: 30, overallEtherealness: 30 })
    const forest = { avgQuality: 80, avgHandling: 30, avgWisdom: 80, isPhantom: false, overallEtherealness: 30 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('ghost') || r.includes('Ghost'))).toBe(true)
  })

  it('recommends clearing mist when clarity low', () => {
    const stats = makeStats({ avgMistClarity: 30, overallEtherealness: 30 })
    const forest = { avgQuality: 80, avgHandling: 80, avgWisdom: 80, isPhantom: false, overallEtherealness: 30 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('mist') || r.includes('Mist'))).toBe(true)
  })

  it('recommends deepening roots when depth low', () => {
    const stats = makeStats({ avgRootDepth: 30, overallEtherealness: 30 })
    const forest = { avgQuality: 80, avgHandling: 80, avgWisdom: 80, isPhantom: false, overallEtherealness: 30 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('root') || r.includes('Root'))).toBe(true)
  })

  it('recommends learning shadows when wisdom low', () => {
    const stats = makeStats({ avgShadowWisdom: 30, overallEtherealness: 30 })
    const forest = { avgQuality: 80, avgHandling: 80, avgWisdom: 30, isPhantom: false, overallEtherealness: 30 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('shadow') || r.includes('Shadow'))).toBe(true)
  })

  it('mentions void files when present', () => {
    const trees = [makeTree({ condition: 'void', file: 'bad.ts' })]
    const stats = makeStats({ voidCount: 1, overallEtherealness: 30 })
    const forest = { avgQuality: 40, avgHandling: 40, avgWisdom: 40, isPhantom: false, overallEtherealness: 30 }
    const recs = generateRecommendations(trees, [], forest, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many void files as count', () => {
    const trees = Array.from({ length: 5 }, (_, i) => makeTree({ condition: 'void', file: `bad${i}.ts` }))
    const stats = makeStats({ voidCount: 5, overallEtherealness: 10 })
    const forest = { avgQuality: 10, avgHandling: 10, avgWisdom: 10, isPhantom: false, overallEtherealness: 10 }
    const recs = generateRecommendations(trees, [], forest, stats)
    expect(recs.some(r => r.includes('5 void'))).toBe(true)
  })

  it('mentions foggy/dead clearings', () => {
    const clearing: PhantomClearing = {
      directory: 'src',
      trees: [],
      avgQuality: 30,
      avgHandling: 30,
      avgWisdom: 30,
      phantomMasterpieceCount: 0,
      voidCount: 0,
      clearingType: 'small-thicket',
      condition: 'foggy-woods',
    }
    const stats = makeStats({ overallEtherealness: 50 })
    const forest = { avgQuality: 50, avgHandling: 50, avgWisdom: 50, isPhantom: false, overallEtherealness: 50 }
    const recs = generateRecommendations([], [clearing, clearing], forest, stats)
    expect(recs.some(r => r.includes('clearing'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallEtherealness: 80, voidCount: 0, avgEtherealQuality: 80, avgGhostHandling: 80, avgMistClarity: 80, avgRootDepth: 80, avgShadowWisdom: 80 })
    const forest = { avgQuality: 80, avgHandling: 80, avgWisdom: 80, isPhantom: true, overallEtherealness: 80 }
    const recs = generateRecommendations([], [], forest, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildPhantomGroveResult ───────────────────────────────────────

describe('buildPhantomGroveResult', () => {
  it('returns a complete result', async () => {
    const result = await buildPhantomGroveResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.trees).toHaveLength(2)
    expect(result.clearings.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.forest.overallEtherealness).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildPhantomGroveResult([], [])
    expect(result.trees).toHaveLength(0)
    expect(result.clearings).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallEtherealness).toBe(0)
  })

  it('computes overallEtherealness as avg of quality, handling, clarity', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgEtherealQuality + result.stats.avgGhostHandling + result.stats.avgMistClarity) / 3,
    )
    expect(result.stats.overallEtherealness).toBe(expected)
  })

  it('sets isPhantom when overallEtherealness >= 80', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [RichContent])
    expect(typeof result.forest.isPhantom).toBe('boolean')
    if (result.forest.overallEtherealness >= 80) {
      expect(result.forest.isPhantom).toBe(true)
    }
  })

  it('finds best tree correctly', async () => {
    const result = await buildPhantomGroveResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestTree).toBe('good.ts')
  })

  it('groups files into clearings by directory', async () => {
    const result = await buildPhantomGroveResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.clearings.length).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for masterpiece grades', () => {
    expect(typeof colorGrade('phantom-masterpiece')).toBe('string')
    expect(typeof colorGrade('pure-phantom')).toBe('string')
    expect(typeof colorGrade('exorcist')).toBe('string')
  })

  it('returns a string for lower grades', () => {
    expect(typeof colorGrade('void')).toBe('string')
    expect(typeof colorGrade('no-spirit')).toBe('string')
  })
})

describe('formatTreeTable', () => {
  it('formats a tree with all fields', () => {
    const t = makeTree()
    const out = formatTreeTable(t)
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
    expect(out).toContain('light-spirit')
  })
})

describe('formatTreesTable', () => {
  it('returns message for empty array', () => {
    expect(formatTreesTable([])).toContain('No phantom trees')
  })

  it('formats multiple trees', () => {
    const trees = [makeTree(), makeTree({ file: 'other.ts' })]
    const out = formatTreesTable(trees)
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatClearingTable', () => {
  it('formats a clearing', () => {
    const c: PhantomClearing = {
      directory: 'src',
      trees: [makeTree()],
      avgQuality: 80,
      avgHandling: 70,
      avgWisdom: 60,
      phantomMasterpieceCount: 1,
      voidCount: 0,
      clearingType: 'mystical-clearing',
      condition: 'mystical-forest',
    }
    const out = formatClearingTable(c)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatClearingsTable', () => {
  it('returns message for empty array', () => {
    expect(formatClearingsTable([])).toContain('No phantom clearings')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', () => {
    const stats = makeStats()
    const out = formatStatsTable(stats)
    expect(out).toContain('Phantom Grove Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('test.ts')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const out = formatRecommendations(['Lighten code', 'Add docs'])
    expect(out).toContain('Lighten code')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result with all sections', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Phantom Tree Analysis')
    expect(out).toContain('Phantom Clearings')
    expect(out).toContain('Phantom Grove Statistics')
    expect(out).toContain('Forest')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildPhantomGroveResult(['a.ts'], [RichContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.trees).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.forest).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
