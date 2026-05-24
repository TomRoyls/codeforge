import { describe, it, expect } from 'vitest'
import {
  measureDefining, measureProjecting, measureArticulating, measurePresenting, measureNarrating,
  analyzePuppetShadow, classifyPuppetCondition, classifyTheaterType, classifyPuppeteerGrade,
  classifyTheaterCondition, analyzePuppetTheater, buildShadowPuppetResult,
} from '../src/commands/shadow-puppet-helpers.js'
import {
  colorScore, colorGrade, formatShadowTable, formatShadowsTable, formatTheaterTable,
  formatTheatersTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/shadow-puppet-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const RICH = `import { promisify } from 'util'
import type { Config } from './config.js'

/** Documentation */
export interface DataProcessor<T> {
  process(item: T): Promise<string>
}

export class MainProcessor implements DataProcessor<Config> {
  private readonly items: readonly string[] = []

  async process(item: Config): Promise<string> {
    try {
      const result = item?.value ?? 'default'
      if (result === item.name) {
        return result
      }
      return await promisify((cb: (err: Error | null, val?: string) => void) => {
        cb(null, item.name)
      })()
    } catch (error: unknown) {
      return ''
    }
  }
}

export const helper = (input?: string): string => {
  return input ?? ''
}

export type Result = { readonly value: string; readonly label: string }
`
const MINIMAL = 'const x = 1'
const MODERATE = `export interface Item {
  name: string
}

export function process(item: Item): string {
  return item.name
}

const result = process({ name: 'test' })`
const POOR = `var x: any = 1
var y: any = 2
function bad(a: any): any {
  return a
}`

// ─── Measure Tests ─────────────────────────────────────────────────

describe('measureDefining', () => {
  it('returns sharp-silhouette for rich', () => {
    const m = measureDefining(RICH)
    expect(m.clarity).toBe(100)
    expect(m.grade).toBe('sharp-silhouette')
    expect(m.hasHighClarity).toBe(true)
  })
  it('returns invisible for minimal', () => {
    const m = measureDefining(MINIMAL)
    expect(m.clarity).toBe(10)
    expect(m.grade).toBe('invisible')
  })
  it('returns proper-shape for moderate', () => {
    const m = measureDefining(MODERATE)
    expect(m.clarity).toBe(59)
    expect(m.grade).toBe('proper-shape')
  })
  it('returns invisible for poor', () => {
    const m = measureDefining(POOR)
    expect(m.clarity).toBe(0)
    expect(m.grade).toBe('invisible')
  })
  it('detects defined (export+import)', () => expect(measureDefining(RICH).hasDefined).toBe(true))
  it('detects distinct (returnType+const)', () => expect(measureDefining(RICH).hasDistinct).toBe(true))
  it('detects crisp (namedExport+returnType)', () => expect(measureDefining(RICH).hasCrisp).toBe(true))
  it('counts blurry (var) and fuzzy (any)', () => {
    const m = measureDefining(POOR)
    expect(m.blurryCount).toBe(2)
    expect(m.fuzzyCount).toBe(4)
    expect(m.hasNoBlurry).toBe(false)
    expect(m.hasNoFuzzy).toBe(false)
  })
  it('clean code has no blurry or fuzzy', () => {
    const m = measureDefining(RICH)
    expect(m.hasNoBlurry).toBe(true)
    expect(m.hasNoFuzzy).toBe(true)
    expect(m.hasNoVague).toBe(true)
    expect(m.hasNoIndistinct).toBe(true)
  })
  it('minimal has no sharp or clear', () => {
    const m = measureDefining(MINIMAL)
    expect(m.hasSharp).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasPrecise).toBe(false)
  })
})

describe('measureProjecting', () => {
  it('returns vivid-projection for rich', () => {
    const m = measureProjecting(RICH)
    expect(m.quality).toBe(100)
    expect(m.projection).toBe('vivid-projection')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns no-shadow for minimal', () => {
    const m = measureProjecting(MINIMAL)
    expect(m.quality).toBe(8)
    expect(m.projection).toBe('no-shadow')
  })
  it('returns faint-shadow for moderate', () => {
    const m = measureProjecting(MODERATE)
    expect(m.quality).toBe(52)
    expect(m.projection).toBe('faint-shadow')
  })
  it('returns no-shadow for poor', () => {
    const m = measureProjecting(POOR)
    expect(m.quality).toBe(0)
    expect(m.projection).toBe('no-shadow')
  })
  it('detects visible (export+import)', () => expect(measureProjecting(RICH).hasVisible).toBe(true))
  it('detects impactful (interface+class)', () => expect(measureProjecting(RICH).hasImpactful).toBe(true))
  it('detects vivid (export+interface)', () => expect(measureProjecting(RICH).hasVivid).toBe(true))
  it('counts weak (var) and timid (any)', () => {
    const m = measureProjecting(POOR)
    expect(m.weakCount).toBe(2)
    expect(m.timidCount).toBe(4)
  })
  it('clean code has no weak or timid', () => {
    const m = measureProjecting(RICH)
    expect(m.hasNoWeak).toBe(true)
    expect(m.hasNoTimid).toBe(true)
    expect(m.hasNoSubtle).toBe(true)
    expect(m.hasNoFading).toBe(true)
  })
  it('moderate has commanding and vivid', () => {
    const m = measureProjecting(MODERATE)
    expect(m.hasCommanding).toBe(true)
    expect(m.hasVivid).toBe(true)
  })
})

describe('measureArticulating', () => {
  it('returns fully-articulated for rich', () => {
    const m = measureArticulating(RICH)
    expect(m.flexibility).toBe(100)
    expect(m.articulation).toBe('fully-articulated')
    expect(m.hasHighFlexibility).toBe(true)
  })
  it('returns frozen for minimal', () => {
    const m = measureArticulating(MINIMAL)
    expect(m.flexibility).toBe(8)
    expect(m.articulation).toBe('frozen')
  })
  it('returns rigid-body for moderate', () => {
    const m = measureArticulating(MODERATE)
    expect(m.flexibility).toBe(37)
    expect(m.articulation).toBe('rigid-body')
  })
  it('returns frozen for poor', () => {
    const m = measureArticulating(POOR)
    expect(m.flexibility).toBe(0)
    expect(m.articulation).toBe('frozen')
  })
  it('detects modular (tryCatch+async)', () => expect(measureArticulating(RICH).hasModular).toBe(true))
  it('detects flexible (optionalChaining+nullishCoalescing)', () => expect(measureArticulating(RICH).hasFlexible).toBe(true))
  it('detects decoupled (interface+readonly)', () => expect(measureArticulating(RICH).hasDecoupled).toBe(true))
  it('counts rigid (var) and monolithic (any)', () => {
    const m = measureArticulating(POOR)
    expect(m.rigidCount).toBe(2)
    expect(m.monolithicCount).toBe(4)
  })
  it('clean code has no rigid or monolithic', () => {
    const m = measureArticulating(RICH)
    expect(m.hasNoRigid).toBe(true)
    expect(m.hasNoMonolithic).toBe(true)
    expect(m.hasNoTight).toBe(true)
    expect(m.hasNoFixed).toBe(true)
  })
  it('moderate has adaptable', () => {
    expect(measureArticulating(MODERATE).hasAdaptable).toBe(true)
  })
})

describe('measurePresenting', () => {
  it('returns center-stage for rich', () => {
    const m = measurePresenting(RICH)
    expect(m.presence).toBe(100)
    expect(m.stage).toBe('center-stage')
    expect(m.hasHighPresence).toBe(true)
  })
  it('returns backstage for minimal', () => {
    const m = measurePresenting(MINIMAL)
    expect(m.presence).toBe(8)
    expect(m.stage).toBe('backstage')
  })
  it('returns background for moderate', () => {
    const m = measurePresenting(MODERATE)
    expect(m.presence).toBe(47)
    expect(m.stage).toBe('background')
  })
  it('returns backstage for poor', () => {
    const m = measurePresenting(POOR)
    expect(m.presence).toBe(0)
    expect(m.stage).toBe('backstage')
  })
  it('detects commanding (docComments+export)', () => expect(measurePresenting(RICH).hasCommanding).toBe(true))
  it('detects engaging (interface+class)', () => expect(measurePresenting(RICH).hasEngaging).toBe(true))
  it('detects impressive (export+generics)', () => expect(measurePresenting(RICH).hasImpressive).toBe(true))
  it('counts forgettable (var) and anonymous (any)', () => {
    const m = measurePresenting(POOR)
    expect(m.forgettableCount).toBe(2)
    expect(m.anonymousCount).toBe(4)
  })
  it('clean code has no forgettable or anonymous', () => {
    const m = measurePresenting(RICH)
    expect(m.hasNoForgettable).toBe(true)
    expect(m.hasNoAnonymous).toBe(true)
    expect(m.hasNoBoring).toBe(true)
    expect(m.hasNoDull).toBe(true)
  })
  it('moderate has captivating', () => {
    expect(measurePresenting(MODERATE).hasCaptivating).toBe(true)
  })
})

describe('measureNarrating', () => {
  it('returns epic-tale for rich', () => {
    const m = measureNarrating(RICH)
    expect(m.flow).toBe(100)
    expect(m.story).toBe('epic-tale')
    expect(m.hasHighFlow).toBe(true)
  })
  it('returns silent for minimal', () => {
    const m = measureNarrating(MINIMAL)
    expect(m.flow).toBe(10)
    expect(m.story).toBe('silent')
  })
  it('returns incoherent for moderate', () => {
    const m = measureNarrating(MODERATE)
    expect(m.flow).toBe(39)
    expect(m.story).toBe('incoherent')
  })
  it('returns silent for poor', () => {
    const m = measureNarrating(POOR)
    expect(m.flow).toBe(0)
    expect(m.story).toBe('silent')
  })
  it('detects coherent (const+strictEq)', () => expect(measureNarrating(RICH).hasCoherent).toBe(true))
  it('detects flowing (export+docComments)', () => expect(measureNarrating(RICH).hasFlowing).toBe(true))
  it('detects logical (readonly+private)', () => expect(measureNarrating(RICH).hasLogical).toBe(true))
  it('counts chaotic (var) and confusing (any)', () => {
    const m = measureNarrating(POOR)
    expect(m.chaoticCount).toBe(2)
    expect(m.confusingCount).toBe(4)
  })
  it('clean code has no chaotic or confusing', () => {
    const m = measureNarrating(RICH)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoConfusing).toBe(true)
    expect(m.hasNoScattered).toBe(true)
    expect(m.hasNoDisjointed).toBe(true)
  })
  it('moderate has engaging2', () => {
    expect(measureNarrating(MODERATE).hasEngaging2).toBe(true)
  })
  it('rich has engaging2', () => {
    expect(measureNarrating(RICH).hasEngaging2).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyPuppetCondition', () => {
  it('master-puppet >= 85', () => expect(classifyPuppetCondition(85)).toBe('master-puppet'))
  it('skilled-puppet >= 70', () => expect(classifyPuppetCondition(70)).toBe('skilled-puppet'))
  it('proper-puppet >= 55', () => expect(classifyPuppetCondition(55)).toBe('proper-puppet'))
  it('rag-doll >= 40', () => expect(classifyPuppetCondition(40)).toBe('rag-doll'))
  it('paper-cutout >= 25', () => expect(classifyPuppetCondition(25)).toBe('paper-cutout'))
  it('no-puppet < 25', () => expect(classifyPuppetCondition(0)).toBe('no-puppet'))
})

describe('classifyPuppeteerGrade', () => {
  it('master-puppeteer >= 80', () => expect(classifyPuppeteerGrade(80)).toBe('master-puppeteer'))
  it('skilled-performer >= 65', () => expect(classifyPuppeteerGrade(65)).toBe('skilled-performer'))
  it('proper-showman >= 50', () => expect(classifyPuppeteerGrade(50)).toBe('proper-showman'))
  it('amateur >= 35', () => expect(classifyPuppeteerGrade(35)).toBe('amateur'))
  it('novice >= 20', () => expect(classifyPuppeteerGrade(20)).toBe('novice'))
  it('audience-member < 20', () => expect(classifyPuppeteerGrade(19)).toBe('audience-member'))
})

describe('classifyTheaterCondition', () => {
  it('sold-out-show >= 75', () => expect(classifyTheaterCondition(75)).toBe('sold-out-show'))
  it('standing-ovation >= 60', () => expect(classifyTheaterCondition(60)).toBe('standing-ovation'))
  it('applause >= 45', () => expect(classifyTheaterCondition(45)).toBe('applause'))
  it('polite-clapping >= 30', () => expect(classifyTheaterCondition(30)).toBe('polite-clapping'))
  it('empty-seats >= 15', () => expect(classifyTheaterCondition(15)).toBe('empty-seats'))
  it('theater-closed < 15', () => expect(classifyTheaterCondition(14)).toBe('theater-closed'))
})

describe('classifyTheaterType', () => {
  it('returns no-theater for empty', () => expect(classifyTheaterType([])).toBe('no-theater'))
})

// ─── analyzePuppetShadow Tests ─────────────────────────────────────

describe('analyzePuppetShadow', () => {
  it('returns master-puppet for rich', () => {
    const s = analyzePuppetShadow(RICH, 'rich.ts')
    expect(s.qualityScore).toBe(100)
    expect(s.condition).toBe('master-puppet')
  })
  it('returns no-puppet for minimal', () => {
    const s = analyzePuppetShadow(MINIMAL, 'minimal.ts')
    expect(s.qualityScore).toBe(9)
    expect(s.condition).toBe('no-puppet')
  })
  it('returns rag-doll for moderate', () => {
    const s = analyzePuppetShadow(MODERATE, 'moderate.ts')
    expect(s.qualityScore).toBe(47)
    expect(s.condition).toBe('rag-doll')
  })
  it('returns no-puppet for poor', () => {
    const s = analyzePuppetShadow(POOR, 'poor.ts')
    expect(s.qualityScore).toBe(0)
    expect(s.condition).toBe('no-puppet')
  })
  it('contains all measures', () => {
    const s = analyzePuppetShadow(RICH, 'test.ts')
    expect(s.defining).toBeDefined()
    expect(s.projecting).toBeDefined()
    expect(s.articulating).toBeDefined()
    expect(s.presenting).toBeDefined()
    expect(s.narrating).toBeDefined()
  })
  it('stores file path', () => {
    const s = analyzePuppetShadow(RICH, 'my-file.ts')
    expect(s.file).toBe('my-file.ts')
  })
})

// ─── buildShadowPuppetResult Tests ─────────────────────────────────

describe('buildShadowPuppetResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalTheaters).toBe(1)
    expect(r.stats.avgSilhouetteClarity).toBe(42)
    expect(r.stats.avgProjectionQuality).toBe(40)
    expect(r.stats.avgLimbArticulation).toBe(36)
    expect(r.stats.avgScreenPresence).toBe(39)
    expect(r.stats.avgNarrativeFlow).toBe(37)
    expect(r.stats.overallArtistry).toBe(39)
    expect(r.stats.puppeteerGrade).toBe('amateur')
    expect(r.performance.isPerforming).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.masterPuppetCount).toBe(1)
    expect(r.stats.skilledPuppetCount).toBe(0)
    expect(r.stats.properPuppetCount).toBe(0)
    expect(r.stats.ragDollCount).toBe(1)
    expect(r.stats.paperCutoutCount).toBe(0)
    expect(r.stats.noPuppetCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighClarityCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighFlexibilityCount).toBe(1)
    expect(r.stats.hasHighPresenceCount).toBe(1)
    expect(r.stats.hasHighFlowCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestShadow).toBe('rich.ts')
    expect(r.stats.clearest).toBe('rich.ts')
    expect(r.stats.bestProjected).toBe('rich.ts')
    expect(r.stats.mostArticulate).toBe('rich.ts')
    expect(r.stats.bestPresence).toBe('rich.ts')
  })
  it('classifies theater', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.theaters[0]!.theaterType).toBe('bedroom-show')
    expect(r.theaters[0]!.condition).toBe('polite-clapping')
  })
  it('generates recommendations', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildShadowPuppetResult([], [])
    expect(r.shadows).toHaveLength(0)
    expect(r.stats.overallArtistry).toBe(0)
  })
  it('returns masterpiece message for all-master', async () => {
    const r = await buildShadowPuppetResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('Your shadow puppet show is a masterpiece! Every silhouette tells a compelling story')
  })
  it('isPerforming when avgClarity >= 60', async () => {
    const r = await buildShadowPuppetResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.performance.isPerforming).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildShadowPuppetResult(['src/a.ts', 'lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalTheaters).toBe(2)
  })
  it('computes performance averages', async () => {
    const r = await buildShadowPuppetResult(
      ['rich.ts', 'minimal.ts', 'moderate.ts', 'poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.performance.avgClarity).toBe(42)
    expect(r.performance.avgPresence).toBe(39)
    expect(r.performance.avgFlow).toBe(37)
  })
  it('2-rich gets master-puppeteer', async () => {
    const r = await buildShadowPuppetResult(['a.ts', 'b.ts'], [RICH, RICH])
    expect(r.stats.overallArtistry).toBe(100)
    expect(r.stats.puppeteerGrade).toBe('master-puppeteer')
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('sharp-silhouette')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatShadowTable formats shadow', () => {
    const s = analyzePuppetShadow(RICH, 'rich.ts')
    expect(formatShadowTable(s)).toContain('rich.ts')
  })
  it('formatShadowsTable handles empty', () => {
    expect(formatShadowsTable([])).toContain('No shadow puppets')
  })
  it('formatTheaterTable formats theater', () => {
    const s = analyzePuppetShadow(RICH, 'a.ts')
    const theater = analyzePuppetTheater([s], 'src')
    expect(formatTheaterTable(theater)).toContain('src')
  })
  it('formatTheatersTable handles empty', () => {
    expect(formatTheatersTable([])).toContain('No puppet theaters')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildShadowPuppetResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Performance Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildShadowPuppetResult(['a.ts', 'b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Shadow Puppet Analysis')
    expect(out).toContain('Puppet Theater Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildShadowPuppetResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.shadows).toHaveLength(1)
  })
})
