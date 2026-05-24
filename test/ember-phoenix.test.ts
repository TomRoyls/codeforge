import { describe, it, expect } from 'vitest'
import {
  measureRebirthing, measureLearning, measurePurifying, measureSpreading, measureResurrecting,
  analyzePhoenixEmber, classifyEmberCondition, classifyNestType, classifyKeeperGrade,
  classifyNestCondition, analyzePhoenixNest, buildEmberPhoenixResult,
} from '../src/commands/ember-phoenix-helpers.js'
import {
  colorScore, colorGrade, formatEmberTable, formatEmbersTable, formatNestTable,
  formatNestsTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/ember-phoenix-format-helpers.js'

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

describe('measureRebirthing', () => {
  it('returns legendary-phoenix for rich', () => {
    const m = measureRebirthing(RICH)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('legendary-phoenix')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns extinguished for minimal', () => {
    const m = measureRebirthing(MINIMAL)
    expect(m.quality).toBe(10)
    expect(m.grade).toBe('extinguished')
  })
  it('returns reborn-bird for moderate', () => {
    const m = measureRebirthing(MODERATE)
    expect(m.quality).toBe(59)
    expect(m.grade).toBe('reborn-bird')
  })
  it('returns extinguished for poor', () => {
    const m = measureRebirthing(POOR)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('extinguished')
  })
  it('detects renewed (export+import)', () => expect(measureRebirthing(RICH).hasRenewed).toBe(true))
  it('detects refreshed (returnType+const)', () => expect(measureRebirthing(RICH).hasRefreshed).toBe(true))
  it('detects transformed (optionalChaining+nullishCoalescing)', () => expect(measureRebirthing(RICH).hasTransformed).toBe(true))
  it('counts stagnation (var) and decay (any)', () => {
    const m = measureRebirthing(POOR)
    expect(m.stagnationCount).toBe(2)
    expect(m.decayCount).toBe(4)
    expect(m.hasNoStagnation).toBe(false)
    expect(m.hasNoDecay).toBe(false)
  })
  it('clean code has no stagnation or decay', () => {
    const m = measureRebirthing(RICH)
    expect(m.hasNoStagnation).toBe(true)
    expect(m.hasNoDecay).toBe(true)
    expect(m.hasNoRust).toBe(true)
    expect(m.hasNoDormancy).toBe(true)
  })
})

describe('measureLearning', () => {
  it('returns ancient-wisdom for rich', () => {
    const m = measureLearning(RICH)
    expect(m.wisdom).toBe(100)
    expect(m.insight).toBe('ancient-wisdom')
    expect(m.hasHighWisdom).toBe(true)
  })
  it('returns ignorant for minimal', () => {
    const m = measureLearning(MINIMAL)
    expect(m.wisdom).toBe(8)
    expect(m.insight).toBe('ignorant')
  })
  it('returns shallow-wisdom for moderate', () => {
    const m = measureLearning(MODERATE)
    expect(m.wisdom).toBe(52)
    expect(m.insight).toBe('shallow-wisdom')
  })
  it('detects experienced (export+import)', () => expect(measureLearning(RICH).hasExperienced).toBe(true))
  it('detects mature (interface+class)', () => expect(measureLearning(RICH).hasMature).toBe(true))
  it('detects battleHardened (async+namedExport)', () => expect(measureLearning(RICH).hasBattleHardened).toBe(true))
  it('counts naivety (var) and innocence (any)', () => {
    const m = measureLearning(POOR)
    expect(m.naivetyCount).toBe(2)
    expect(m.innocenceCount).toBe(4)
  })
  it('clean code has no naivety or innocence', () => {
    const m = measureLearning(RICH)
    expect(m.hasNoNaivety).toBe(true)
    expect(m.hasNoInnocence).toBe(true)
    expect(m.hasNoFragility).toBe(true)
    expect(m.hasNoUntried).toBe(true)
  })
})

describe('measurePurifying', () => {
  it('returns white-flame for rich', () => {
    const m = measurePurifying(RICH)
    expect(m.purity).toBe(100)
    expect(m.flame).toBe('white-flame')
    expect(m.hasHighPurity).toBe(true)
  })
  it('returns cold-ash for minimal', () => {
    const m = measurePurifying(MINIMAL)
    expect(m.purity).toBe(8)
    expect(m.flame).toBe('cold-ash')
  })
  it('returns dying-ember for moderate', () => {
    const m = measurePurifying(MODERATE)
    expect(m.purity).toBe(37)
    expect(m.flame).toBe('dying-ember')
  })
  it('detects clean (tryCatch+async)', () => expect(measurePurifying(RICH).hasClean).toBe(true))
  it('detects refined (optionalChaining+nullishCoalescing)', () => expect(measurePurifying(RICH).hasRefined).toBe(true))
  it('detects transformed2 (export+const)', () => {
    expect(measurePurifying(RICH).hasTransformed2).toBe(true)
    expect(measurePurifying(MODERATE).hasTransformed2).toBe(true)
  })
  it('counts pollution (var) and contamination (any)', () => {
    const m = measurePurifying(POOR)
    expect(m.pollutionCount).toBe(2)
    expect(m.contaminationCount).toBe(4)
  })
  it('clean code has no pollution or contamination', () => {
    const m = measurePurifying(RICH)
    expect(m.hasNoPollution).toBe(true)
    expect(m.hasNoContamination).toBe(true)
    expect(m.hasNoImpurity).toBe(true)
    expect(m.hasNoCorruption).toBe(true)
  })
})

describe('measureSpreading', () => {
  it('returns majestic-wings for rich', () => {
    const m = measureSpreading(RICH)
    expect(m.span).toBe(100)
    expect(m.wings).toBe('majestic-wings')
    expect(m.hasHighSpan).toBe(true)
  })
  it('returns broken-wings for minimal', () => {
    const m = measureSpreading(MINIMAL)
    expect(m.span).toBe(8)
    expect(m.wings).toBe('broken-wings')
  })
  it('returns narrow-wings for moderate', () => {
    const m = measureSpreading(MODERATE)
    expect(m.span).toBe(47)
    expect(m.wings).toBe('narrow-wings')
  })
  it('detects expansive (docComments+export)', () => expect(measureSpreading(RICH).hasExpansive).toBe(true))
  it('detects broad (interface+class)', () => expect(measureSpreading(RICH).hasBroad).toBe(true))
  it('detects spacious (export+generics)', () => expect(measureSpreading(RICH).hasSpacious).toBe(true))
  it('counts narrow (var) and limited (any)', () => {
    const m = measureSpreading(POOR)
    expect(m.narrowCount).toBe(2)
    expect(m.limitedCount).toBe(4)
  })
  it('clean code has no narrow or limited', () => {
    const m = measureSpreading(RICH)
    expect(m.hasNoNarrow).toBe(true)
    expect(m.hasNoLimited).toBe(true)
    expect(m.hasNoRestricted).toBe(true)
    expect(m.hasNoConstrained).toBe(true)
  })
})

describe('measureResurrecting', () => {
  it('returns immortal for rich', () => {
    const m = measureResurrecting(RICH)
    expect(m.potential).toBe(100)
    expect(m.capacity).toBe('immortal')
    expect(m.hasHighPotential).toBe(true)
  })
  it('returns terminal for minimal', () => {
    const m = measureResurrecting(MINIMAL)
    expect(m.potential).toBe(10)
    expect(m.capacity).toBe('terminal')
  })
  it('returns near-death for moderate', () => {
    const m = measureResurrecting(MODERATE)
    expect(m.potential).toBe(39)
    expect(m.capacity).toBe('near-death')
  })
  it('detects recoverable (const+strictEq)', () => expect(measureResurrecting(RICH).hasRecoverable).toBe(true))
  it('detects resilient (export+docComments)', () => expect(measureResurrecting(RICH).hasResilient).toBe(true))
  it('detects survivable (const+export)', () => {
    expect(measureResurrecting(RICH).hasSurvivable).toBe(true)
    expect(measureResurrecting(MODERATE).hasSurvivable).toBe(true)
  })
  it('counts fatal (var) and irreparable (any)', () => {
    const m = measureResurrecting(POOR)
    expect(m.fatalCount).toBe(2)
    expect(m.irreparableCount).toBe(4)
  })
  it('clean code has no fatal or irreparable', () => {
    const m = measureResurrecting(RICH)
    expect(m.hasNoFatal).toBe(true)
    expect(m.hasNoIrreparable).toBe(true)
    expect(m.hasNoBeyondRepair).toBe(true)
    expect(m.hasNoPermanentLoss).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyEmberCondition', () => {
  it('immortal-phoenix >= 85', () => expect(classifyEmberCondition(85)).toBe('immortal-phoenix'))
  it('rising-flame >= 70', () => expect(classifyEmberCondition(70)).toBe('rising-flame'))
  it('steady-glow >= 55', () => expect(classifyEmberCondition(55)).toBe('steady-glow'))
  it('flickering >= 40', () => expect(classifyEmberCondition(40)).toBe('flickering'))
  it('dying-ember >= 25', () => expect(classifyEmberCondition(25)).toBe('dying-ember'))
  it('cold-ash < 25', () => expect(classifyEmberCondition(0)).toBe('cold-ash'))
})

describe('classifyKeeperGrade', () => {
  it('phoenix-lord >= 80', () => expect(classifyKeeperGrade(80)).toBe('phoenix-lord'))
  it('fire-keeper >= 65', () => expect(classifyKeeperGrade(65)).toBe('fire-keeper'))
  it('flame-guardian >= 50', () => expect(classifyKeeperGrade(50)).toBe('flame-guardian'))
  it('ember-tender >= 35', () => expect(classifyKeeperGrade(35)).toBe('ember-tender'))
  it('ash-collector >= 20', () => expect(classifyKeeperGrade(20)).toBe('ash-collector'))
  it('fire-extinguisher < 20', () => expect(classifyKeeperGrade(19)).toBe('fire-extinguisher'))
})

describe('classifyNestCondition', () => {
  it('eternal-flame >= 75', () => expect(classifyNestCondition(75)).toBe('eternal-flame'))
  it('burning-bright >= 60', () => expect(classifyNestCondition(60)).toBe('burning-bright'))
  it('steady-glow >= 45', () => expect(classifyNestCondition(45)).toBe('steady-glow'))
  it('fading-light >= 30', () => expect(classifyNestCondition(30)).toBe('fading-light'))
  it('dying-embers >= 15', () => expect(classifyNestCondition(15)).toBe('dying-embers'))
  it('extinguished < 15', () => expect(classifyNestCondition(14)).toBe('extinguished'))
})

describe('classifyNestType', () => {
  it('returns empty-hearth for empty', () => expect(classifyNestType([])).toBe('empty-hearth'))
})

// ─── analyzePhoenixEmber Tests ─────────────────────────────────────

describe('analyzePhoenixEmber', () => {
  it('returns immortal-phoenix for rich', () => {
    const e = analyzePhoenixEmber(RICH, 'rich.ts')
    expect(e.qualityScore).toBe(100)
    expect(e.condition).toBe('immortal-phoenix')
  })
  it('returns cold-ash for minimal', () => {
    const e = analyzePhoenixEmber(MINIMAL, 'minimal.ts')
    expect(e.qualityScore).toBe(9)
    expect(e.condition).toBe('cold-ash')
  })
  it('returns flickering for moderate', () => {
    const e = analyzePhoenixEmber(MODERATE, 'moderate.ts')
    expect(e.qualityScore).toBe(47)
    expect(e.condition).toBe('flickering')
  })
  it('returns cold-ash for poor', () => {
    const e = analyzePhoenixEmber(POOR, 'poor.ts')
    expect(e.qualityScore).toBe(0)
    expect(e.condition).toBe('cold-ash')
  })
  it('contains all measures', () => {
    const e = analyzePhoenixEmber(RICH, 'test.ts')
    expect(e.rebirthing).toBeDefined()
    expect(e.learning).toBeDefined()
    expect(e.purifying).toBeDefined()
    expect(e.spreading).toBeDefined()
    expect(e.resurrecting).toBeDefined()
  })
})

// ─── buildEmberPhoenixResult Tests ─────────────────────────────────

describe('buildEmberPhoenixResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalNests).toBe(1)
    expect(r.stats.avgRebirthQuality).toBe(42)
    expect(r.stats.avgAshWisdom).toBe(40)
    expect(r.stats.avgFlamePurity).toBe(36)
    expect(r.stats.avgWingSpan).toBe(39)
    expect(r.stats.avgResurrectionPotential).toBe(37)
    expect(r.stats.overallResilience).toBe(39)
    expect(r.stats.keeperGrade).toBe('ember-tender')
    expect(r.flame.isBurning).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.immortalPhoenixCount).toBe(1)
    expect(r.stats.flickeringCount).toBe(1)
    expect(r.stats.coldAshCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighWisdomCount).toBe(1)
    expect(r.stats.hasHighPurityCount).toBe(1)
    expect(r.stats.hasHighSpanCount).toBe(1)
    expect(r.stats.hasHighPotentialCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestEmber).toBe('rich.ts')
    expect(r.stats.mostReborn).toBe('rich.ts')
    expect(r.stats.wisest).toBe('rich.ts')
    expect(r.stats.purest).toBe('rich.ts')
    expect(r.stats.broadest).toBe('rich.ts')
  })
  it('classifies nest', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.nests[0]!.nestType).toBe('ground-nest')
    expect(r.nests[0]!.condition).toBe('fading-light')
  })
  it('generates recommendations', async () => {
    const r = await buildEmberPhoenixResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildEmberPhoenixResult([], [])
    expect(r.embers).toHaveLength(0)
    expect(r.stats.overallResilience).toBe(0)
  })
  it('returns perfect message for all-immortal', async () => {
    const r = await buildEmberPhoenixResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('Your phoenix rises with legendary grace! Every ember burns with purpose')
  })
  it('isBurning when avgRebirth >= 60', async () => {
    const r = await buildEmberPhoenixResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.flame.isBurning).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildEmberPhoenixResult(['src/a.ts','lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalNests).toBe(2)
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('legendary-phoenix')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatEmberTable formats ember', () => {
    const e = analyzePhoenixEmber(RICH, 'rich.ts')
    expect(formatEmberTable(e)).toContain('rich.ts')
  })
  it('formatEmbersTable handles empty', () => {
    expect(formatEmbersTable([])).toContain('No phoenix embers')
  })
  it('formatNestTable formats nest', () => {
    const e = analyzePhoenixEmber(RICH, 'a.ts')
    const n = analyzePhoenixNest([e], 'src')
    expect(formatNestTable(n)).toContain('src')
  })
  it('formatNestsTable handles empty', () => {
    expect(formatNestsTable([])).toContain('No phoenix nests')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildEmberPhoenixResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Flame Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildEmberPhoenixResult(['a.ts','b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Phoenix Ember Analysis')
    expect(out).toContain('Phoenix Nest Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildEmberPhoenixResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.embers).toHaveLength(1)
  })
})
