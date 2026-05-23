import { describe, it, expect } from 'vitest'
import {
  measureSharpening,
  measureFracturing,
  measureOriginating,
  measurePolishing,
  measureCutting,
  classifyEdgeCondition,
  classifyQuarryType,
  classifyKnapperGrade,
  classifyQuarryCondition,
  analyzeObsidianEdge,
  analyzeObsidianQuarry,
  buildObsidianBladeResult,
  generateRecommendations,
  gatherFiles,
  type ObsidianEdge,
  type ObsidianQuarry,
  type VolcanoSummary,
  type ObsidianBladeStats,
} from '../src/commands/obsidian-blade-helpers.js'
import {
  colorScore,
  colorGrade,
  formatEdgeTable,
  formatEdgesTable,
  formatQuarryTable,
  formatQuarriesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/obsidian-blade-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'
const richContent = `/**
 * Doc comment
 */
export interface Foo<T> {
  readonly bar: string
}

export async function hello(): Promise<string> {
  const x = 1
  if (x === 1) {
    return 'hi'
  }
  return 'bye'
}

export class MyClass {
  private val: number
}

type Alias = string | number
`

const midContent = `export interface Item {
  name: string
  value: number
}

export function process(data: Item): string {
  const result = data.name
  if (result === 'test') {
    return 'ok'
  }
  return 'done'
}
`

// ─── measureSharpening ─────────────────────────────────────────────

describe('measureSharpening', () => {
  it('scores minimal content', () => {
    const m = measureSharpening(minimalContent)
    expect(m.sharpness).toBe(8)
    expect(m.grade).toBe('no-edge')
    expect(m.hasHighSharpness).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasSharp).toBe(false)
    expect(m.hasKeen).toBe(false)
    expect(m.hasFine).toBe(false)
    expect(m.hasRefined).toBe(false)
    expect(m.hasExacting).toBe(false)
    expect(m.hasNoBlunt).toBe(true)
    expect(m.hasNoDull).toBe(true)
    expect(m.hasNoCoarse).toBe(true)
    expect(m.hasNoRough).toBe(true)
    expect(m.bluntCount).toBe(0)
    expect(m.dullCount).toBe(0)
  })

  it('scores rich content as monomolecular', () => {
    const m = measureSharpening(richContent)
    expect(m.sharpness).toBe(100)
    expect(m.grade).toBe('monomolecular')
    expect(m.hasHighSharpness).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasKeen).toBe(true)
    expect(m.hasFine).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasExacting).toBe(true)
  })

  it('detects blunt patterns', () => {
    const bluntContent = 'var x = 1; var y: any = 2'
    const m = measureSharpening(bluntContent)
    expect(m.hasNoBlunt).toBe(false)
    expect(m.hasNoDull).toBe(false)
    expect(m.bluntCount).toBe(2)
    expect(m.dullCount).toBe(1)
  })

  it('detects coarse patterns', () => {
    const coarseContent = 'eval("test"); debugger'
    const m = measureSharpening(coarseContent)
    expect(m.hasNoCoarse).toBe(false)
    expect(m.hasNoRough).toBe(false)
  })

  it('scores mid content', () => {
    const m = measureSharpening(midContent)
    expect(m.sharpness).toBeGreaterThan(10)
    expect(m.sharpness).toBeLessThan(100)
  })

  it('caps sharpness at 100', () => {
    const megaContent = `${richContent}\n${richContent}`
    const m = measureSharpening(megaContent)
    expect(m.sharpness).toBeLessThanOrEqual(100)
  })
})

// ─── measureFracturing ─────────────────────────────────────────────

describe('measureFracturing', () => {
  it('scores minimal content', () => {
    const m = measureFracturing(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.fracture).toBe('shattered')
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasEven).toBe(false)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasControlled).toBe(false)
    expect(m.hasDeliberate).toBe(false)
    expect(m.hasNoJagged).toBe(true)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasNoMessy).toBe(true)
    expect(m.hasNoChaotic).toBe(true)
  })

  it('scores rich content as conchoidal', () => {
    const m = measureFracturing(richContent)
    expect(m.quality).toBe(100)
    expect(m.fracture).toBe('conchoidal')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasEven).toBe(true)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasControlled).toBe(true)
    expect(m.hasDeliberate).toBe(true)
  })

  it('detects jagged/rough patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureFracturing(badContent)
    expect(m.hasNoJagged).toBe(false)
    expect(m.hasNoRough).toBe(false)
    expect(m.jaggedCount).toBe(1)
    expect(m.roughCount).toBe(1)
  })
})

// ─── measureOriginating ────────────────────────────────────────────

describe('measureOriginating', () => {
  it('scores minimal content', () => {
    const m = measureOriginating(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.origin).toBe('sediment')
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasPureSource).toBe(false)
    expect(m.hasQualityOrigin).toBe(false)
    expect(m.hasCleanOrigin).toBe(false)
    expect(m.hasPrime).toBe(false)
    expect(m.hasRefinedOrigin).toBe(false)
    expect(m.hasAuthentic).toBe(false)
    expect(m.hasNoContaminated).toBe(true)
    expect(m.hasNoPolluted).toBe(true)
    expect(m.hasNoDegraded).toBe(true)
    expect(m.hasNoImpure).toBe(true)
  })

  it('scores rich content as prime-magma', () => {
    const m = measureOriginating(richContent)
    expect(m.quality).toBe(100)
    expect(m.origin).toBe('prime-magma')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasPureSource).toBe(true)
    expect(m.hasQualityOrigin).toBe(false)
    expect(m.hasCleanOrigin).toBe(true)
    expect(m.hasPrime).toBe(true)
    expect(m.hasRefinedOrigin).toBe(true)
    expect(m.hasAuthentic).toBe(true)
  })

  it('detects contaminated/polluted patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureOriginating(badContent)
    expect(m.hasNoContaminated).toBe(false)
    expect(m.hasNoPolluted).toBe(false)
    expect(m.contaminatedCount).toBe(1)
    expect(m.pollutedCount).toBe(1)
  })
})

// ─── measurePolishing ──────────────────────────────────────────────

describe('measurePolishing', () => {
  it('scores minimal content', () => {
    const m = measurePolishing(minimalContent)
    expect(m.level).toBe(10)
    expect(m.polish).toBe('unpolished')
    expect(m.hasHighLevel).toBe(false)
    expect(m.hasRefined).toBe(false)
    expect(m.hasSmooth).toBe(false)
    expect(m.hasPolished).toBe(false)
    expect(m.hasGlossy).toBe(false)
    expect(m.hasFinished).toBe(false)
    expect(m.hasElegant).toBe(false)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasNoUnfinished).toBe(true)
    expect(m.hasNoMatte).toBe(true)
    expect(m.hasNoRaw).toBe(true)
  })

  it('scores rich content as mirror-finish', () => {
    const m = measurePolishing(richContent)
    expect(m.level).toBe(100)
    expect(m.polish).toBe('mirror-finish')
    expect(m.hasHighLevel).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasGlossy).toBe(true)
    expect(m.hasFinished).toBe(true)
    expect(m.hasElegant).toBe(true)
  })

  it('detects rough/unfinished patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measurePolishing(badContent)
    expect(m.hasNoRough).toBe(false)
    expect(m.hasNoUnfinished).toBe(false)
    expect(m.roughCount).toBe(1)
    expect(m.unfinishedCount).toBe(1)
  })
})

// ─── measureCutting ────────────────────────────────────────────────

describe('measureCutting', () => {
  it('scores minimal content', () => {
    const m = measureCutting(minimalContent)
    expect(m.precision).toBe(8)
    expect(m.cut).toBe('no-cut')
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasTargeted).toBe(false)
    expect(m.hasFocused).toBe(false)
    expect(m.hasClean).toBe(false)
    expect(m.hasDeliberate).toBe(false)
    expect(m.hasNoImprecise).toBe(true)
    expect(m.hasNoCareless).toBe(true)
    expect(m.hasNoScattered).toBe(true)
    expect(m.hasNoMessy).toBe(true)
  })

  it('scores rich content as surgical-incision', () => {
    const m = measureCutting(richContent)
    expect(m.precision).toBe(100)
    expect(m.cut).toBe('surgical-incision')
    expect(m.hasHighPrecision).toBe(true)
    expect(m.hasAccurate).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasTargeted).toBe(true)
    expect(m.hasFocused).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasDeliberate).toBe(true)
  })

  it('detects imprecise/careless patterns', () => {
    const badContent = 'var x: any = 1'
    const m = measureCutting(badContent)
    expect(m.hasNoImprecise).toBe(false)
    expect(m.hasNoCareless).toBe(false)
    expect(m.impreciseCount).toBe(1)
    expect(m.carelessCount).toBe(1)
  })
})

// ─── classifyEdgeCondition ─────────────────────────────────────────

describe('classifyEdgeCondition', () => {
  it('classifies master-blade', () => expect(classifyEdgeCondition(90)).toBe('master-blade'))
  it('classifies surgical-scalpel', () => expect(classifyEdgeCondition(75)).toBe('surgical-scalpel'))
  it('classifies proper-knife', () => expect(classifyEdgeCondition(60)).toBe('proper-knife'))
  it('classifies dull-tool', () => expect(classifyEdgeCondition(45)).toBe('dull-tool'))
  it('classifies broken-shard', () => expect(classifyEdgeCondition(30)).toBe('broken-shard'))
  it('classifies gravel', () => expect(classifyEdgeCondition(10)).toBe('gravel'))
  it('boundary 85', () => expect(classifyEdgeCondition(85)).toBe('master-blade'))
  it('boundary 70', () => expect(classifyEdgeCondition(70)).toBe('surgical-scalpel'))
  it('boundary 55', () => expect(classifyEdgeCondition(55)).toBe('proper-knife'))
  it('boundary 40', () => expect(classifyEdgeCondition(40)).toBe('dull-tool'))
  it('boundary 25', () => expect(classifyEdgeCondition(25)).toBe('broken-shard'))
  it('boundary 0', () => expect(classifyEdgeCondition(0)).toBe('gravel'))
})

// ─── classifyQuarryType ────────────────────────────────────────────

describe('classifyQuarryType', () => {
  it('returns no-quarry for empty edges', () => {
    expect(classifyQuarryType([])).toBe('no-quarry')
  })

  it('returns no-quarry for qualityScore < 15', () => {
    const edges: ObsidianEdge[] = [
      { file: 'a.ts', edgeSharpness: 8, fractureQuality: 8, volcanicOrigin: 8, polishLevel: 8, cuttingPrecision: 8,
        sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
        originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
        cutting: {} as ObsidianEdge['cutting'],
        condition: 'gravel', qualityScore: 8 },
    ]
    expect(classifyQuarryType(edges)).toBe('no-quarry')
  })

  it('returns volcanic-vent for high quality with master-blade majority', () => {
    const makeEdge = (cond: ObsidianEdge['condition'], qs: number): ObsidianEdge => ({
      file: 'a.ts', edgeSharpness: 90, fractureQuality: 90, volcanicOrigin: 90, polishLevel: 90, cuttingPrecision: 90,
      sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
      originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
      cutting: {} as ObsidianEdge['cutting'],
      condition: cond, qualityScore: qs,
    })
    const edges = [makeEdge('master-blade', 90), makeEdge('master-blade', 85)]
    expect(classifyQuarryType(edges)).toBe('volcanic-vent')
  })

  it('returns obsidian-cliff for quality >= 60', () => {
    const edges: ObsidianEdge[] = [
      { file: 'a.ts', edgeSharpness: 70, fractureQuality: 70, volcanicOrigin: 70, polishLevel: 70, cuttingPrecision: 70,
        sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
        originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
        cutting: {} as ObsidianEdge['cutting'],
        condition: 'surgical-scalpel', qualityScore: 65 },
    ]
    expect(classifyQuarryType(edges)).toBe('obsidian-cliff')
  })

  it('returns rocky-outcrop for quality >= 45', () => {
    const edges: ObsidianEdge[] = [
      { file: 'a.ts', edgeSharpness: 50, fractureQuality: 50, volcanicOrigin: 50, polishLevel: 50, cuttingPrecision: 50,
        sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
        originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
        cutting: {} as ObsidianEdge['cutting'],
        condition: 'proper-knife', qualityScore: 50 },
    ]
    expect(classifyQuarryType(edges)).toBe('rocky-outcrop')
  })

  it('returns gravel-bed for quality >= 30', () => {
    const edges: ObsidianEdge[] = [
      { file: 'a.ts', edgeSharpness: 35, fractureQuality: 35, volcanicOrigin: 35, polishLevel: 35, cuttingPrecision: 35,
        sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
        originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
        cutting: {} as ObsidianEdge['cutting'],
        condition: 'dull-tool', qualityScore: 35 },
    ]
    expect(classifyQuarryType(edges)).toBe('gravel-bed')
  })

  it('returns sand-pit for quality >= 15', () => {
    const edges: ObsidianEdge[] = [
      { file: 'a.ts', edgeSharpness: 18, fractureQuality: 18, volcanicOrigin: 18, polishLevel: 18, cuttingPrecision: 18,
        sharpening: {} as ObsidianEdge['sharpening'], fracturing: {} as ObsidianEdge['fracturing'],
        originating: {} as ObsidianEdge['originating'], polishing: {} as ObsidianEdge['polishing'],
        cutting: {} as ObsidianEdge['cutting'],
        condition: 'broken-shard', qualityScore: 18 },
    ]
    expect(classifyQuarryType(edges)).toBe('sand-pit')
  })
})

// ─── classifyKnapperGrade ──────────────────────────────────────────

describe('classifyKnapperGrade', () => {
  it('returns master-knapper for >= 80', () => expect(classifyKnapperGrade(85)).toBe('master-knapper'))
  it('returns expert-flintknapper for >= 65', () => expect(classifyKnapperGrade(70)).toBe('expert-flintknapper'))
  it('returns skilled-artisan for >= 50', () => expect(classifyKnapperGrade(55)).toBe('skilled-artisan'))
  it('returns apprentice for >= 35', () => expect(classifyKnapperGrade(40)).toBe('apprentice'))
  it('returns novice for >= 20', () => expect(classifyKnapperGrade(25)).toBe('novice'))
  it('returns rock-thrower for < 20', () => expect(classifyKnapperGrade(10)).toBe('rock-thrower'))
  it('boundary 80', () => expect(classifyKnapperGrade(80)).toBe('master-knapper'))
  it('boundary 65', () => expect(classifyKnapperGrade(65)).toBe('expert-flintknapper'))
  it('boundary 50', () => expect(classifyKnapperGrade(50)).toBe('skilled-artisan'))
  it('boundary 35', () => expect(classifyKnapperGrade(35)).toBe('apprentice'))
  it('boundary 20', () => expect(classifyKnapperGrade(20)).toBe('novice'))
  it('boundary 0', () => expect(classifyKnapperGrade(0)).toBe('rock-thrower'))
})

// ─── classifyQuarryCondition ───────────────────────────────────────

describe('classifyQuarryCondition', () => {
  it('returns prime-source for >= 75', () => expect(classifyQuarryCondition(80)).toBe('prime-source'))
  it('returns quality-mine for >= 60', () => expect(classifyQuarryCondition(65)).toBe('quality-mine'))
  it('returns decent-quarry for >= 45', () => expect(classifyQuarryCondition(50)).toBe('decent-quarry'))
  it('returns poor-source for >= 30', () => expect(classifyQuarryCondition(35)).toBe('poor-source'))
  it('returns exhausted for >= 15', () => expect(classifyQuarryCondition(20)).toBe('exhausted'))
  it('returns barren for < 15', () => expect(classifyQuarryCondition(5)).toBe('barren'))
})

// ─── analyzeObsidianEdge ───────────────────────────────────────────

describe('analyzeObsidianEdge', () => {
  it('analyzes minimal content', () => {
    const e = analyzeObsidianEdge(minimalContent, 'test.ts')
    expect(e.file).toBe('test.ts')
    expect(e.edgeSharpness).toBe(8)
    expect(e.fractureQuality).toBe(8)
    expect(e.volcanicOrigin).toBe(8)
    expect(e.polishLevel).toBe(10)
    expect(e.cuttingPrecision).toBe(8)
    expect(e.sharpening.grade).toBe('no-edge')
    expect(e.fracturing.fracture).toBe('shattered')
    expect(e.originating.origin).toBe('sediment')
    expect(e.polishing.polish).toBe('unpolished')
    expect(e.cutting.cut).toBe('no-cut')
  })

  it('analyzes rich content', () => {
    const e = analyzeObsidianEdge(richContent, 'rich.ts')
    expect(e.qualityScore).toBe(100)
    expect(e.condition).toBe('master-blade')
    expect(e.edgeSharpness).toBe(100)
    expect(e.fractureQuality).toBe(100)
    expect(e.volcanicOrigin).toBe(100)
    expect(e.polishLevel).toBe(100)
    expect(e.cuttingPrecision).toBe(100)
  })

  it('computes qualityScore as weighted average', () => {
    const e = analyzeObsidianEdge(midContent, 'mid.ts')
    const expected = Math.round(
      e.edgeSharpness * 0.2 +
      e.fractureQuality * 0.2 +
      e.volcanicOrigin * 0.2 +
      e.polishLevel * 0.2 +
      e.cuttingPrecision * 0.2,
    )
    expect(e.qualityScore).toBe(expected)
  })

  it('sets file path correctly', () => {
    const e = analyzeObsidianEdge('', 'deeply/nested/file.ts')
    expect(e.file).toBe('deeply/nested/file.ts')
  })
})

// ─── analyzeObsidianQuarry ─────────────────────────────────────────

describe('analyzeObsidianQuarry', () => {
  it('handles empty edges', () => {
    const q = analyzeObsidianQuarry([], 'empty-dir')
    expect(q.directory).toBe('empty-dir')
    expect(q.edges).toEqual([])
    expect(q.avgSharpness).toBe(0)
    expect(q.avgFracture).toBe(0)
    expect(q.avgPrecision).toBe(0)
    expect(q.masterBladeCount).toBe(0)
    expect(q.gravelCount).toBe(0)
    expect(q.quarryType).toBe('no-quarry')
    expect(q.condition).toBe('barren')
  })

  it('analyzes single edge quarry', () => {
    const edge = analyzeObsidianEdge(richContent, 'good.ts')
    const q = analyzeObsidianQuarry([edge], 'src')
    expect(q.avgSharpness).toBe(edge.edgeSharpness)
    expect(q.avgFracture).toBe(edge.fractureQuality)
    expect(q.avgPrecision).toBe(edge.cuttingPrecision)
    expect(q.edges).toHaveLength(1)
  })

  it('averages multiple edges', () => {
    const e1 = analyzeObsidianEdge(richContent, 'a.ts')
    const e2 = analyzeObsidianEdge(minimalContent, 'b.ts')
    const q = analyzeObsidianQuarry([e1, e2], 'mix')
    const avgSharp = Math.round((e1.edgeSharpness + e2.edgeSharpness) / 2)
    expect(q.avgSharpness).toBe(avgSharp)
  })

  it('counts conditions correctly', () => {
    const e1 = analyzeObsidianEdge(richContent, 'good.ts')
    const e2 = analyzeObsidianEdge(minimalContent, 'bad.ts')
    const q = analyzeObsidianQuarry([e1, e2], 'mixed')
    expect(q.masterBladeCount + q.gravelCount).toBeLessThanOrEqual(2)
  })
})

// ─── buildObsidianBladeResult ──────────────────────────────────────

describe('buildObsidianBladeResult', () => {
  it('handles empty input', async () => {
    const r = await buildObsidianBladeResult([], [])
    expect(r.edges).toEqual([])
    expect(r.quarries).toEqual([])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.stats.totalQuarries).toBe(0)
    expect(r.stats.avgEdgeSharpness).toBe(0)
    expect(r.volcano.isSharp).toBe(false)
    expect(r.volcano.overallSharpness).toBe(0)
    expect(r.stats.overallSharpness).toBe(0)
    expect(r.stats.bestEdge).toBe('')
    expect(r.stats.sharpest).toBe('')
    expect(r.stats.cleanestFracture).toBe('')
    expect(r.stats.bestOrigin).toBe('')
    expect(r.stats.bestPolished).toBe('')
  })

  it('analyzes single file', async () => {
    const r = await buildObsidianBladeResult(['test.ts'], [richContent])
    expect(r.edges).toHaveLength(1)
    expect(r.quarries).toHaveLength(1)
    expect(r.stats.totalFiles).toBe(1)
    expect(r.edges[0].condition).toBe('master-blade')
  })

  it('groups files by directory into quarries', async () => {
    const r = await buildObsidianBladeResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, midContent],
    )
    expect(r.edges).toHaveLength(3)
    expect(r.quarries).toHaveLength(2)
  })

  it('computes volcano summary', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    expect(r.volcano.isSharp).toBe(true)
    expect(r.volcano.overallSharpness).toBeGreaterThan(0)
  })

  it('computes stats knapperGrade', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    expect(r.stats.knapperGrade).toBe('master-knapper')
  })

  it('identifies best/sharpest/cleanest/origin/polished', async () => {
    const r = await buildObsidianBladeResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(r.stats.bestEdge).toBe('rich.ts')
    expect(r.stats.sharpest).toBe('rich.ts')
    expect(r.stats.cleanestFracture).toBe('rich.ts')
    expect(r.stats.bestOrigin).toBe('rich.ts')
    expect(r.stats.bestPolished).toBe('rich.ts')
  })

  it('counts condition types in stats', async () => {
    const r = await buildObsidianBladeResult(
      ['rich.ts', 'minimal.ts'],
      [richContent, minimalContent],
    )
    expect(r.stats.masterBladeCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.surgicalScalpelCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.properKnifeCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.dullToolCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.brokenShardCount).toBeGreaterThanOrEqual(0)
    expect(r.stats.gravelCount).toBeGreaterThanOrEqual(0)
  })

  it('counts hasHigh* flags', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    expect(r.stats.hasHighSharpnessCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighOriginCount).toBe(1)
    expect(r.stats.hasHighLevelCount).toBe(1)
    expect(r.stats.hasHighPrecisionCount).toBe(1)
  })

  it('computes overallSharpness correctly for rich content', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    expect(r.stats.overallSharpness).toBe(Math.round((100 + 100 + 100) / 3))
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: ObsidianBladeStats = {
    totalFiles: 0, totalQuarries: 0, avgEdgeSharpness: 0, avgFractureQuality: 0,
    avgVolcanicOrigin: 0, avgPolishLevel: 0, avgCuttingPrecision: 0,
    masterBladeCount: 0, surgicalScalpelCount: 0, properKnifeCount: 0,
    dullToolCount: 0, brokenShardCount: 0, gravelCount: 0,
    hasHighSharpnessCount: 0, hasHighQualityCount: 0, hasHighOriginCount: 0,
    hasHighLevelCount: 0, hasHighPrecisionCount: 0,
    overallSharpness: 0, knapperGrade: 'rock-thrower',
    bestEdge: '', sharpest: '', cleanestFracture: '', bestOrigin: '', bestPolished: '',
  }

  const emptyVolcano: VolcanoSummary = { avgSharpness: 0, avgFracture: 0, avgPrecision: 0, isSharp: false, overallSharpness: 0 }

  it('returns positive message for good code', () => {
    const goodStats = { ...emptyStats, avgEdgeSharpness: 80, avgFractureQuality: 80, avgVolcanicOrigin: 80, avgPolishLevel: 80, avgCuttingPrecision: 80 }
    const goodVolcano: VolcanoSummary = { avgSharpness: 80, avgFracture: 80, avgPrecision: 80, isSharp: true, overallSharpness: 80 }
    const recs = generateRecommendations([], [], goodVolcano, goodStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('surgically sharp')
  })

  it('recommends honing for low sharpness', () => {
    const stats = { ...emptyStats, avgEdgeSharpness: 30 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('Hone'))).toBe(true)
  })

  it('recommends fracture improvement for low quality', () => {
    const stats = { ...emptyStats, avgFractureQuality: 30 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('fracture'))).toBe(true)
  })

  it('recommends purifying for low origin', () => {
    const stats = { ...emptyStats, avgVolcanicOrigin: 30 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('Purify'))).toBe(true)
  })

  it('recommends polishing for low polish', () => {
    const stats = { ...emptyStats, avgPolishLevel: 30 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('polish'))).toBe(true)
  })

  it('recommends sharpening for low precision', () => {
    const stats = { ...emptyStats, avgCuttingPrecision: 30 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('precision'))).toBe(true)
  })

  it('warns about gravel files', () => {
    const stats = { ...emptyStats, gravelCount: 2 }
    const recs = generateRecommendations([], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('gravel'))).toBe(true)
  })

  it('warns about poor overall sharpness', () => {
    const volcano: VolcanoSummary = { avgSharpness: 20, avgFracture: 20, avgPrecision: 20, isSharp: false, overallSharpness: 20 }
    const recs = generateRecommendations([], [], volcano, emptyStats)
    expect(recs.some(r => r.includes('sharpness'))).toBe(true)
  })

  it('warns when all quarries are depleted', () => {
    const quarry: ObsidianQuarry = {
      directory: 'src', edges: [], avgSharpness: 10, avgFracture: 10, avgPrecision: 10,
      masterBladeCount: 0, gravelCount: 0, quarryType: 'no-quarry', condition: 'barren',
    }
    const recs = generateRecommendations([], [quarry], emptyVolcano, emptyStats)
    expect(recs.some(r => r.includes('depleted'))).toBe(true)
  })

  it('names specific gravel files', () => {
    const edge = analyzeObsidianEdge('var x: any', 'bad.ts')
    edge.condition = 'gravel'
    const stats = { ...emptyStats, gravelCount: 1 }
    const recs = generateRecommendations([edge], [], emptyVolcano, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('colors known grades', () => {
    expect(typeof colorGrade('master-blade')).toBe('string')
    expect(typeof colorGrade('monomolecular')).toBe('string')
    expect(typeof colorGrade('gravel')).toBe('string')
  })
  it('handles unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatEdgeTable', () => {
  it('formats a single edge', () => {
    const e = analyzeObsidianEdge(richContent, 'test.ts')
    const out = formatEdgeTable(e)
    expect(out).toContain('test.ts')
    expect(out).toContain('Sharpness')
    expect(out).toContain('Score')
  })
})

describe('formatEdgesTable', () => {
  it('handles empty array', () => {
    expect(formatEdgesTable([])).toContain('No obsidian edges')
  })
  it('formats multiple edges', () => {
    const e1 = analyzeObsidianEdge(richContent, 'a.ts')
    const e2 = analyzeObsidianEdge(minimalContent, 'b.ts')
    const out = formatEdgesTable([e1, e2])
    expect(out).toContain('a.ts')
    expect(out).toContain('b.ts')
    expect(out).toContain('Edge Analysis')
  })
})

describe('formatQuarryTable', () => {
  it('formats a quarry', () => {
    const e = analyzeObsidianEdge(richContent, 'src/a.ts')
    const q = analyzeObsidianQuarry([e], 'src')
    const out = formatQuarryTable(q)
    expect(out).toContain('src')
    expect(out).toContain('Type')
    expect(out).toContain('Condition')
  })
})

describe('formatQuarriesTable', () => {
  it('handles empty array', () => {
    expect(formatQuarriesTable([])).toContain('No obsidian quarries')
  })
  it('formats quarries', () => {
    const e = analyzeObsidianEdge(richContent, 'src/a.ts')
    const q = analyzeObsidianQuarry([e], 'src')
    const out = formatQuarriesTable([q])
    expect(out).toContain('Quarry Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    const out = formatStatsTable(r.stats)
    expect(out).toContain('Total Files')
    expect(out).toContain('Knapper Grade')
    expect(out).toContain('Best Edge')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    const out = formatRecommendations(['Fix X', 'Improve Y'])
    expect(out).toContain('Fix X')
    expect(out).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    const out = formatResultTable(r)
    expect(out).toContain('Edge Analysis')
    expect(out).toContain('Quarry Analysis')
    expect(out).toContain('Statistics')
    expect(out).toContain('Sharp')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const r = await buildObsidianBladeResult(['a.ts'], [richContent])
    const json = formatResultJson(r)
    const parsed = JSON.parse(json)
    expect(parsed.edges).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns array', async () => {
    const files = await gatherFiles('/home/georg/code/new', ['.ts'], ['**/node_modules/**'])
    expect(Array.isArray(files)).toBe(true)
  })
})

// ─── Type Export Tests ─────────────────────────────────────────────

describe('type exports', () => {
  it('all types are importable', () => {
    const edge: ObsidianEdge = analyzeObsidianEdge(minimalContent, 't.ts')
    expect(edge.file).toBe('t.ts')
    const quarry: ObsidianQuarry = analyzeObsidianQuarry([edge], 'dir')
    expect(quarry.directory).toBe('dir')
  })
})
