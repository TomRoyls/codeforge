import { describe, it, expect } from 'vitest'

import {
  measureReflection,
  measureTruth,
  measureShadow,
  measureSurface,
  measureProphetic,
  measureVolcanic,
  classifyCondition,
  analyzeReflectionShard,
  analyzeMirrorChamber,
  classifyChamberType,
  classifyPriestGrade,
  generateRecommendations,
  buildObsidianMirrorResult,
} from '../src/commands/obsidian-mirror-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  clarityColor,
  truthColor,
  shadowColor,
  polishColor,
  visionColor,
  strengthColor,
  chamberTypeColor,
  chamberConditionColor,
  formatObsidianMirrorJson,
  formatObsidianMirrorTable,
} from '../src/commands/obsidian-mirror-format-helpers.js'

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

// ─── measureReflection ────────────────────────────────────────

describe('measureReflection', () => {
  it('measures rich content', () => {
    const result = measureReflection(RICH)
    expect(result.quality).toBe(79)
    expect(result.clarity).toBe('clear')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasSelfAware).toBe(true)
    expect(result.hasClearIdentity).toBe(true)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasProperNaming).toBe(true)
    expect(result.hasNoAlias).toBe(true)
    expect(result.hasHonestAPI).toBe(true)
    expect(result.hasNoDisguise).toBe(true)
    expect(result.hasTransparent).toBe(false)
    expect(result.hasNoIllusion).toBe(false)
    expect(result.distortionCount).toBe(0)
    expect(result.illusionCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureReflection(EMPTY)
    expect(result.quality).toBe(40)
    expect(result.clarity).toBe('cracked')
    expect(result.hasHighQuality).toBe(false)
    expect(result.hasSelfAware).toBe(false)
    expect(result.hasClearIdentity).toBe(false)
    expect(result.hasNoDistortion).toBe(true)
    expect(result.hasTransparent).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureReflection(MEDIUM)
    expect(result.quality).toBe(45)
    expect(result.clarity).toBe('cracked')
    expect(result.hasHighQuality).toBe(false)
  })
})

// ─── measureTruth ─────────────────────────────────────────────

describe('measureTruth', () => {
  it('measures rich content', () => {
    const result = measureTruth(RICH)
    expect(result.revelation).toBe(80)
    expect(result.level).toBe('honest')
    expect(result.hasHighTruth).toBe(true)
    expect(result.hasNoHiddenAgenda).toBe(true)
    expect(result.hasExplicitBehavior).toBe(true)
    expect(result.hasNoSideEffects).toBe(true)
    expect(result.hasPromisesKept).toBe(false)
    expect(result.hasNoLies).toBe(false)
    expect(result.hasConsistentState).toBe(true)
    expect(result.hasNoDeception).toBe(true)
    expect(result.hasFactual).toBe(true)
    expect(result.hasNoMisdirection).toBe(true)
    expect(result.hiddenAgendaCount).toBe(0)
    expect(result.lieCount).toBe(1)
  })

  it('measures empty content', () => {
    const result = measureTruth(EMPTY)
    expect(result.revelation).toBe(52)
    expect(result.level).toBe('deceptive')
    expect(result.hasHighTruth).toBe(false)
    expect(result.hasExplicitBehavior).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureTruth(MEDIUM)
    expect(result.revelation).toBe(57)
    expect(result.level).toBe('deceptive')
    expect(result.hasHighTruth).toBe(false)
  })
})

// ─── measureShadow ────────────────────────────────────────────

describe('measureShadow', () => {
  it('measures rich content', () => {
    const result = measureShadow(RICH)
    expect(result.integration).toBe(90)
    expect(result.depth).toBe('shadow-master')
    expect(result.hasHighIntegration).toBe(true)
    expect(result.hasAcknowledged).toBe(true)
    expect(result.hasProperBoundaries).toBe(true)
    expect(result.hasNoDenial).toBe(true)
    expect(result.hasGracefulHandling).toBe(true)
    expect(result.hasNoRepression).toBe(true)
    expect(result.hasIntegration).toBe(false)
    expect(result.hasNoProjection).toBe(true)
    expect(result.hasManaged).toBe(true)
    expect(result.hasNoCollapse).toBe(true)
    expect(result.denialCount).toBe(0)
    expect(result.repressionCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureShadow(EMPTY)
    expect(result.integration).toBe(40)
    expect(result.depth).toBe('fearful')
    expect(result.hasHighIntegration).toBe(false)
    expect(result.hasAcknowledged).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureShadow(MEDIUM)
    expect(result.integration).toBe(45)
    expect(result.depth).toBe('fearful')
    expect(result.hasHighIntegration).toBe(false)
  })
})

// ─── measureSurface ───────────────────────────────────────────

describe('measureSurface', () => {
  it('measures rich content', () => {
    const result = measureSurface(RICH)
    expect(result.smoothness).toBe(90)
    expect(result.polish).toBe('smooth')
    expect(result.hasHighSmoothness).toBe(true)
    expect(result.hasCleanFormatting).toBe(true)
    expect(result.hasConsistentStyle).toBe(true)
    expect(result.hasNoBlemishes).toBe(false)
    expect(result.hasProperFlow).toBe(true)
    expect(result.hasNoScratches).toBe(true)
    expect(result.hasEvenTone).toBe(true)
    expect(result.hasNoInterruption).toBe(true)
    expect(result.hasReadable).toBe(true)
    expect(result.hasNoObfuscation).toBe(true)
    expect(result.blemishCount).toBe(1)
    expect(result.scratchCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureSurface(EMPTY)
    expect(result.smoothness).toBe(74)
    expect(result.polish).toBe('museum-quality')
    expect(result.hasHighSmoothness).toBe(true)
    expect(result.hasNoBlemishes).toBe(true)
    expect(result.hasProperFlow).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureSurface(MEDIUM)
    expect(result.smoothness).toBe(79)
    expect(result.polish).toBe('museum-quality')
    expect(result.hasHighSmoothness).toBe(true)
  })
})

// ─── measureProphetic ─────────────────────────────────────────

describe('measureProphetic', () => {
  it('measures rich content', () => {
    const result = measureProphetic(RICH)
    expect(result.insight).toBe(68)
    expect(result.vision).toBe('short-sighted')
    expect(result.hasHighInsight).toBe(false)
    expect(result.hasForesight).toBe(true)
    expect(result.hasFutureProof).toBe(false)
    expect(result.hasNoTechnicalDebt).toBe(false)
    expect(result.hasAdaptiveDesign).toBe(false)
    expect(result.hasNoRigidity).toBe(true)
    expect(result.hasExtensible).toBe(true)
    expect(result.hasNoDeadEnd).toBe(true)
    expect(result.hasSustainable).toBe(true)
    expect(result.hasNoFragility).toBe(true)
    expect(result.techDebtCount).toBe(1)
    expect(result.deadEndCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureProphetic(EMPTY)
    expect(result.insight).toBe(42)
    expect(result.vision).toBe('blind')
    expect(result.hasHighInsight).toBe(false)
    expect(result.hasForesight).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureProphetic(MEDIUM)
    expect(result.insight).toBe(47)
    expect(result.vision).toBe('blind')
    expect(result.hasHighInsight).toBe(false)
  })
})

// ─── measureVolcanic ──────────────────────────────────────────

describe('measureVolcanic', () => {
  it('measures rich content', () => {
    const result = measureVolcanic(RICH)
    expect(result.origin).toBe(78)
    expect(result.strength).toBe('basalt-firm')
    expect(result.hasHighOrigin).toBe(true)
    expect(result.hasSolidFoundation).toBe(true)
    expect(result.hasProperCooling).toBe(false)
    expect(result.hasNoCracks).toBe(false)
    expect(result.hasTempered).toBe(true)
    expect(result.hasNoBrittleness).toBe(true)
    expect(result.hasPressure).toBe(true)
    expect(result.hasNoEruption).toBe(true)
    expect(result.hasDense).toBe(true)
    expect(result.hasNoPorosity).toBe(true)
    expect(result.crackCount).toBe(1)
    expect(result.porosityCount).toBe(0)
  })

  it('measures empty content', () => {
    const result = measureVolcanic(EMPTY)
    expect(result.origin).toBe(42)
    expect(result.strength).toBe('ash-weak')
    expect(result.hasHighOrigin).toBe(false)
    expect(result.hasSolidFoundation).toBe(false)
  })

  it('measures medium content', () => {
    const result = measureVolcanic(MEDIUM)
    expect(result.origin).toBe(47)
    expect(result.strength).toBe('ash-weak')
    expect(result.hasHighOrigin).toBe(false)
  })
})

// ─── analyzeReflectionShard ───────────────────────────────────

describe('analyzeReflectionShard', () => {
  it('analyzes rich content', () => {
    const result = analyzeReflectionShard(RICH, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.reflectionQuality).toBe(79)
    expect(result.truthRevelation).toBe(80)
    expect(result.shadowIntegration).toBe(90)
    expect(result.surfaceSmoothness).toBe(90)
    expect(result.propheticInsight).toBe(68)
    expect(result.volcanicOrigin).toBe(78)
    expect(result.qualityScore).toBe(80)
    expect(result.condition).toBe('divine-mirror')
  })

  it('analyzes empty content', () => {
    const result = analyzeReflectionShard(EMPTY, 'empty.ts')
    expect(result.reflectionQuality).toBe(40)
    expect(result.truthRevelation).toBe(52)
    expect(result.shadowIntegration).toBe(40)
    expect(result.surfaceSmoothness).toBe(74)
    expect(result.propheticInsight).toBe(42)
    expect(result.volcanicOrigin).toBe(42)
    expect(result.qualityScore).toBe(48)
    expect(result.condition).toBe('cracked-mirror')
  })

  it('analyzes medium content', () => {
    const result = analyzeReflectionShard(MEDIUM, 'medium.ts')
    expect(result.reflectionQuality).toBe(45)
    expect(result.truthRevelation).toBe(57)
    expect(result.shadowIntegration).toBe(45)
    expect(result.surfaceSmoothness).toBe(79)
    expect(result.propheticInsight).toBe(47)
    expect(result.volcanicOrigin).toBe(47)
    expect(result.qualityScore).toBe(53)
    expect(result.condition).toBe('working-tool')
  })

  it('returns consistent results on repeated calls', () => {
    const a = analyzeReflectionShard(RICH, 'a.ts')
    const b = analyzeReflectionShard(RICH, 'a.ts')
    expect(a.qualityScore).toBe(b.qualityScore)
    expect(a.reflectionQuality).toBe(b.reflectionQuality)
    expect(a.condition).toBe(b.condition)
  })
})

// ─── classifyCondition ────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies divine-mirror', () => {
    const s = analyzeReflectionShard(RICH, 'rich.ts')
    expect(classifyCondition(s)).toBe('divine-mirror')
  })
  it('classifies cracked-mirror for empty', () => {
    const s = analyzeReflectionShard(EMPTY, 'empty.ts')
    expect(classifyCondition(s)).toBe('cracked-mirror')
  })
  it('classifies working-tool for medium', () => {
    const s = analyzeReflectionShard(MEDIUM, 'medium.ts')
    expect(classifyCondition(s)).toBe('working-tool')
  })
})

// ─── classifyChamberType ──────────────────────────────────────

describe('classifyChamberType', () => {
  it('classifies rich as temple-vault', () => {
    const s = analyzeReflectionShard(RICH, 'rich.ts')
    expect(classifyChamberType([s])).toBe('temple-vault')
  })
  it('classifies empty as meditation-hall', () => {
    const s = analyzeReflectionShard(EMPTY, 'empty.ts')
    expect(classifyChamberType([s])).toBe('meditation-hall')
  })
  it('classifies mixed as scrying-room', () => {
    const r = analyzeReflectionShard(RICH, 'rich.ts')
    const e = analyzeReflectionShard(EMPTY, 'empty.ts')
    const m = analyzeReflectionShard(MEDIUM, 'medium.ts')
    expect(classifyChamberType([r, e, m])).toBe('scrying-room')
  })
})

// ─── classifyPriestGrade ──────────────────────────────────────

describe('classifyPriestGrade', () => {
  it('returns high-priest for 80+', () => {
    expect(classifyPriestGrade(90)).toBe('high-priest')
  })
  it('returns oracle for 65+', () => {
    expect(classifyPriestGrade(75)).toBe('oracle')
  })
  it('returns seer for 50+', () => {
    expect(classifyPriestGrade(55)).toBe('seer')
  })
  it('returns apprentice for 35+', () => {
    expect(classifyPriestGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20+', () => {
    expect(classifyPriestGrade(20)).toBe('novice')
  })
  it('returns blind for below 20', () => {
    expect(classifyPriestGrade(10)).toBe('blind')
  })
})

// ─── analyzeMirrorChamber ─────────────────────────────────────

describe('analyzeMirrorChamber', () => {
  it('analyzes a chamber with multiple shards', () => {
    const r = analyzeReflectionShard(RICH, 'rich.ts')
    const m = analyzeReflectionShard(MEDIUM, 'medium.ts')
    const chamber = analyzeMirrorChamber([r, m], 'src')
    expect(chamber.directory).toBe('src')
    expect(chamber.shards).toHaveLength(2)
    expect(chamber.avgReflection).toBe(62)
    expect(chamber.avgTruth).toBe(69)
    expect(chamber.avgProphetic).toBe(58)
    expect(chamber.divineCount).toBe(1)
    expect(chamber.dustCount).toBe(0)
    expect(chamber.clearCount).toBe(1)
    expect(chamber.honestCount).toBe(1)
    expect(chamber.chamberType).toBe('scrying-room')
    expect(chamber.condition).toBe('hall-of-truth')
  })
})

// ─── generateRecommendations ──────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for rich content', () => {
    const s = analyzeReflectionShard(RICH, 'rich.ts')
    const recs = generateRecommendations(
      [s],
      [{ directory: 'src', shards: [s], avgReflection: s.reflectionQuality, avgTruth: s.truthRevelation, avgProphetic: s.propheticInsight, divineCount: 1, dustCount: 0, clearCount: 1, honestCount: 1, chamberType: 'scrying-room', condition: 'oracle-chamber' }],
      { avgReflection: s.reflectionQuality, avgTruth: s.truthRevelation, avgProphetic: s.propheticInsight, isClear: true, overallClarity: s.qualityScore },
      { totalFiles: 1, totalChambers: 1, avgReflectionQuality: s.reflectionQuality, avgTruthRevelation: s.truthRevelation, avgShadowIntegration: s.shadowIntegration, avgSurfaceSmoothness: s.surfaceSmoothness, avgPropheticInsight: s.propheticInsight, avgVolcanicOrigin: s.volcanicOrigin, divineMirrorCount: 1, nobleArtifactCount: 0, workingToolCount: 0, crackedMirrorCount: 0, shardCount: 0, dustCount: 0, hasHighQualityCount: 1, hasHighTruthCount: 1, hasHighIntegrationCount: 1, hasHighSmoothnessCount: 1, hasHighInsightCount: 0, hasHighOriginCount: 1, overallClarity: s.qualityScore, priestGrade: 'high-priest', bestShard: 'rich.ts', clearest: 'rich.ts', mostHonest: 'rich.ts', bestShadow: 'rich.ts', smoothest: 'rich.ts', mostInsightful: 'rich.ts' },
    )
    expect(recs).toEqual([])
  })
})

// ─── buildObsidianMirrorResult ────────────────────────────────

describe('buildObsidianMirrorResult', () => {
  it('builds result for rich content', () => {
    const result = buildObsidianMirrorResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalChambers).toBe(1)
    expect(result.stats.avgReflectionQuality).toBe(79)
    expect(result.stats.avgTruthRevelation).toBe(80)
    expect(result.stats.avgShadowIntegration).toBe(90)
    expect(result.stats.avgSurfaceSmoothness).toBe(90)
    expect(result.stats.avgPropheticInsight).toBe(68)
    expect(result.stats.avgVolcanicOrigin).toBe(78)
    expect(result.stats.overallClarity).toBe(80)
    expect(result.stats.priestGrade).toBe('high-priest')
    expect(result.stats.divineMirrorCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.bestShard).toBe('rich.ts')
    expect(result.temple.isClear).toBe(true)
  })

  it('builds result for empty content', () => {
    const result = buildObsidianMirrorResult(['empty.ts'], [EMPTY])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgReflectionQuality).toBe(40)
    expect(result.stats.avgTruthRevelation).toBe(52)
    expect(result.stats.avgShadowIntegration).toBe(40)
    expect(result.stats.avgSurfaceSmoothness).toBe(74)
    expect(result.stats.avgPropheticInsight).toBe(42)
    expect(result.stats.avgVolcanicOrigin).toBe(42)
    expect(result.stats.overallClarity).toBe(48)
    expect(result.stats.priestGrade).toBe('apprentice')
    expect(result.stats.crackedMirrorCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(0)
    expect(result.temple.isClear).toBe(false)
  })

  it('builds result for mixed content', () => {
    const result = buildObsidianMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalChambers).toBe(1)
    expect(result.stats.avgReflectionQuality).toBe(62)
    expect(result.stats.avgTruthRevelation).toBe(69)
    expect(result.stats.avgShadowIntegration).toBe(68)
    expect(result.stats.avgSurfaceSmoothness).toBe(85)
    expect(result.stats.avgPropheticInsight).toBe(58)
    expect(result.stats.avgVolcanicOrigin).toBe(63)
    expect(result.stats.overallClarity).toBe(67)
    expect(result.stats.priestGrade).toBe('oracle')
    expect(result.stats.divineMirrorCount).toBe(1)
    expect(result.stats.workingToolCount).toBe(1)
    expect(result.stats.bestShard).toBe('rich.ts')
    expect(result.temple.overallClarity).toBe(67)
  })

  it('returns shards and chambers arrays', () => {
    const result = buildObsidianMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.shards).toHaveLength(2)
    expect(result.chambers).toHaveLength(1)
    expect(result.shards[0].file).toBe('rich.ts')
    expect(result.shards[1].file).toBe('medium.ts')
  })
})

// ─── Format Helpers ───────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high scores', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium scores', () => { expect(typeof scoreColor(70)).toBe('string') })
  it('returns string for low scores', () => { expect(typeof scoreColor(30)).toBe('string') })
})

describe('conditionColor', () => {
  it('colors divine-mirror', () => { expect(typeof conditionColor('divine-mirror')).toBe('string') })
  it('colors noble-artifact', () => { expect(typeof conditionColor('noble-artifact')).toBe('string') })
  it('colors working-tool', () => { expect(typeof conditionColor('working-tool')).toBe('string') })
  it('colors cracked-mirror', () => { expect(typeof conditionColor('cracked-mirror')).toBe('string') })
  it('colors shard', () => { expect(typeof conditionColor('shard')).toBe('string') })
  it('colors dust', () => { expect(typeof conditionColor('dust')).toBe('string') })
  it('colors unknown', () => { expect(typeof conditionColor('unknown')).toBe('string') })
})

describe('gradeColor', () => {
  it('colors high-priest', () => { expect(typeof gradeColor('high-priest')).toBe('string') })
  it('colors oracle', () => { expect(typeof gradeColor('oracle')).toBe('string') })
  it('colors blind', () => { expect(typeof gradeColor('blind')).toBe('string') })
})

describe('clarityColor', () => {
  it('colors perfect-mirror', () => { expect(typeof clarityColor('perfect-mirror')).toBe('string') })
  it('colors shattered', () => { expect(typeof clarityColor('shattered')).toBe('string') })
})

describe('truthColor', () => {
  it('colors absolute-truth', () => { expect(typeof truthColor('absolute-truth')).toBe('string') })
  it('colors illusion', () => { expect(typeof truthColor('illusion')).toBe('string') })
})

describe('shadowColor', () => {
  it('colors shadow-master', () => { expect(typeof shadowColor('shadow-master')).toBe('string') })
  it('colors overwhelmed', () => { expect(typeof shadowColor('overwhelmed')).toBe('string') })
})

describe('polishColor', () => {
  it('colors museum-quality', () => { expect(typeof polishColor('museum-quality')).toBe('string') })
  it('colors raw-stone', () => { expect(typeof polishColor('raw-stone')).toBe('string') })
})

describe('visionColor', () => {
  it('colors oracle', () => { expect(typeof visionColor('oracle')).toBe('string') })
  it('colors catastrophic', () => { expect(typeof visionColor('catastrophic')).toBe('string') })
})

describe('strengthColor', () => {
  it('colors diamond-hard', () => { expect(typeof strengthColor('diamond-hard')).toBe('string') })
  it('colors dust', () => { expect(typeof strengthColor('dust')).toBe('string') })
})

describe('chamberTypeColor', () => {
  it('colors temple-vault', () => { expect(typeof chamberTypeColor('temple-vault')).toBe('string') })
  it('colors rubble', () => { expect(typeof chamberTypeColor('rubble')).toBe('string') })
})

describe('chamberConditionColor', () => {
  it('colors oracle-chamber', () => { expect(typeof chamberConditionColor('oracle-chamber')).toBe('string') })
  it('colors void', () => { expect(typeof chamberConditionColor('void')).toBe('string') })
})

// ─── JSON Formatter ───────────────────────────────────────────

describe('formatObsidianMirrorJson', () => {
  it('returns valid JSON string', () => {
    const result = buildObsidianMirrorResult(['rich.ts'], [RICH])
    const json = formatObsidianMirrorJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.stats.overallClarity).toBe(80)
    expect(parsed.shards).toHaveLength(1)
  })
})

// ─── Table Formatter ─────────────────────────────────────────

describe('formatObsidianMirrorTable', () => {
  it('returns a non-empty string', () => {
    const result = buildObsidianMirrorResult(['rich.ts'], [RICH])
    const table = formatObsidianMirrorTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('returns verbose table with more content', () => {
    const result = buildObsidianMirrorResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    const brief = formatObsidianMirrorTable(result, false)
    const verbose = formatObsidianMirrorTable(result, true)
    expect(verbose.length).toBeGreaterThan(brief.length)
  })
})

// ─── Additional Coverage ──────────────────────────────────────

describe('edge cases', () => {
  it('handles empty mirror chamber', () => {
    const chamber = analyzeMirrorChamber([], 'empty-dir')
    expect(chamber.directory).toBe('empty-dir')
    expect(chamber.shards).toHaveLength(0)
    expect(chamber.avgReflection).toBe(0)
    expect(chamber.chamberType).toBe('rubble')
    expect(chamber.condition).toBe('void')
  })

  it('empty build has zero stats', () => {
    const result = buildObsidianMirrorResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallClarity).toBe(0)
    expect(result.stats.priestGrade).toBe('blind')
    expect(result.shards).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.temple.isClear).toBe(false)
  })

  it('tracks best-per-file stats correctly', () => {
    const result = buildObsidianMirrorResult(['rich.ts', 'empty.ts'], [RICH, EMPTY])
    expect(result.stats.bestShard).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostHonest).toBe('rich.ts')
    expect(result.stats.bestShadow).toBe('rich.ts')
    expect(result.stats.smoothest).toBe('rich.ts')
    expect(result.stats.mostInsightful).toBe('rich.ts')
  })
})
