import { describe, it, expect } from 'vitest'
import {
  measureTiming, measureMeshing, measureTolerating, measureTensioning, measureChiming,
  analyzeClockworkGear, classifyGearCondition, classifyTowerType, classifyHorologistGrade,
  classifyTowerCondition, analyzeClockworkTower, buildPhantomClockworkResult,
} from '../src/commands/phantom-clockwork-helpers.js'
import {
  colorScore, colorGrade, formatGearTable, formatGearsTable, formatTowerTable,
  formatTowersTable, formatStatsTable, formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/phantom-clockwork-format-helpers.js'

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

describe('measureTiming', () => {
  it('returns atomic-clock for rich', () => {
    const m = measureTiming(RICH)
    expect(m.precision).toBe(100)
    expect(m.grade).toBe('atomic-clock')
    expect(m.hasHighPrecision).toBe(true)
  })
  it('returns broken-clock for minimal', () => {
    const m = measureTiming(MINIMAL)
    expect(m.precision).toBe(10)
    expect(m.grade).toBe('broken-clock')
  })
  it('returns precision-watch for moderate', () => {
    const m = measureTiming(MODERATE)
    expect(m.precision).toBe(59)
    expect(m.grade).toBe('precision-watch')
  })
  it('returns broken-clock for poor', () => {
    const m = measureTiming(POOR)
    expect(m.precision).toBe(0)
    expect(m.grade).toBe('broken-clock')
  })
  it('detects accurate (export+import)', () => expect(measureTiming(RICH).hasAccurate).toBe(true))
  it('detects timely (returnType+const)', () => expect(measureTiming(RICH).hasTimely).toBe(true))
  it('detects crisp (export+const)', () => expect(measureTiming(RICH).hasCrisp).toBe(true))
  it('counts delay (var) and drift (any)', () => {
    const m = measureTiming(POOR)
    expect(m.delayCount).toBe(2)
    expect(m.driftCount).toBe(4)
    expect(m.hasNoDelay).toBe(false)
    expect(m.hasNoDrift).toBe(false)
  })
  it('clean code has no delay or drift', () => {
    const m = measureTiming(RICH)
    expect(m.hasNoDelay).toBe(true)
    expect(m.hasNoDrift).toBe(true)
    expect(m.hasNoSluggish).toBe(true)
    expect(m.hasNoBlurred).toBe(true)
  })
})

describe('measureMeshing', () => {
  it('returns perfect-mesh for rich', () => {
    const m = measureMeshing(RICH)
    expect(m.quality).toBe(100)
    expect(m.mesh).toBe('perfect-mesh')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns stripped-gears for minimal', () => {
    const m = measureMeshing(MINIMAL)
    expect(m.quality).toBe(8)
    expect(m.mesh).toBe('stripped-gears')
  })
  it('returns loose-gears for moderate', () => {
    const m = measureMeshing(MODERATE)
    expect(m.quality).toBe(52)
    expect(m.mesh).toBe('loose-gears')
  })
  it('detects aligned (export+import)', () => expect(measureMeshing(RICH).hasAligned).toBe(true))
  it('detects harmonious (export+interface)', () => {
    expect(measureMeshing(RICH).hasHarmonious).toBe(true)
    expect(measureMeshing(MODERATE).hasHarmonious).toBe(true)
  })
  it('detects interlocked (returnType+const)', () => {
    expect(measureMeshing(RICH).hasInterlocked).toBe(true)
    expect(measureMeshing(MODERATE).hasInterlocked).toBe(true)
  })
  it('counts slipping (var) and disengaged (any)', () => {
    const m = measureMeshing(POOR)
    expect(m.slippingCount).toBe(2)
    expect(m.disengagedCount).toBe(4)
  })
  it('clean code has no slipping or disengaged', () => {
    const m = measureMeshing(RICH)
    expect(m.hasNoSlipping).toBe(true)
    expect(m.hasNoDisengaged).toBe(true)
    expect(m.hasNoMisaligned).toBe(true)
    expect(m.hasNoJamming).toBe(true)
  })
})

describe('measureTolerating', () => {
  it('returns ghost-proof for rich', () => {
    const m = measureTolerating(RICH)
    expect(m.tolerance).toBe(100)
    expect(m.phantom).toBe('ghost-proof')
    expect(m.hasHighTolerance).toBe(true)
  })
  it('returns shattered for minimal', () => {
    const m = measureTolerating(MINIMAL)
    expect(m.tolerance).toBe(8)
    expect(m.phantom).toBe('shattered')
  })
  it('returns zero-tolerance for moderate', () => {
    const m = measureTolerating(MODERATE)
    expect(m.tolerance).toBe(37)
    expect(m.phantom).toBe('zero-tolerance')
  })
  it('detects forgiving (tryCatch+async)', () => expect(measureTolerating(RICH).hasForgiving).toBe(true))
  it('detects flexible (optionalChaining+nullishCoalescing)', () => expect(measureTolerating(RICH).hasFlexible).toBe(true))
  it('detects bendable (export+const)', () => {
    expect(measureTolerating(RICH).hasBendable).toBe(true)
    expect(measureTolerating(MODERATE).hasBendable).toBe(true)
  })
  it('counts brittle (var) and rigid (any)', () => {
    const m = measureTolerating(POOR)
    expect(m.brittleCount).toBe(2)
    expect(m.rigidCount).toBe(4)
  })
  it('clean code has no brittle or rigid', () => {
    const m = measureTolerating(RICH)
    expect(m.hasNoBrittle).toBe(true)
    expect(m.hasNoRigid).toBe(true)
    expect(m.hasNoStiff).toBe(true)
    expect(m.hasNoCracking).toBe(true)
  })
})

describe('measureTensioning', () => {
  it('returns perfect-tension for rich', () => {
    const m = measureTensioning(RICH)
    expect(m.tension).toBe(100)
    expect(m.spring).toBe('perfect-tension')
    expect(m.hasHighTension).toBe(true)
  })
  it('returns broken-spring for minimal', () => {
    const m = measureTensioning(MINIMAL)
    expect(m.tension).toBe(10)
    expect(m.spring).toBe('broken-spring')
  })
  it('returns slack-spring for moderate', () => {
    const m = measureTensioning(MODERATE)
    expect(m.tension).toBe(39)
    expect(m.spring).toBe('slack-spring')
  })
  it('detects balanced (const+strictEq)', () => expect(measureTensioning(RICH).hasBalanced).toBe(true))
  it('detects energetic (const+export)', () => {
    expect(measureTensioning(RICH).hasEnergetic).toBe(true)
    expect(measureTensioning(MODERATE).hasEnergetic).toBe(true)
  })
  it('counts slack (var) and overwound (any)', () => {
    const m = measureTensioning(POOR)
    expect(m.slackCount).toBe(2)
    expect(m.overwoundCount).toBe(4)
  })
  it('clean code has no slack or overwound', () => {
    const m = measureTensioning(RICH)
    expect(m.hasNoSlack).toBe(true)
    expect(m.hasNoOverwound).toBe(true)
    expect(m.hasNoExcessive).toBe(true)
    expect(m.hasNoFrantic).toBe(true)
  })
})

describe('measureChiming', () => {
  it('returns westminster for rich', () => {
    const m = measureChiming(RICH)
    expect(m.quality).toBe(100)
    expect(m.chime).toBe('westminster')
    expect(m.hasHighQuality).toBe(true)
  })
  it('returns silent for minimal', () => {
    const m = measureChiming(MINIMAL)
    expect(m.quality).toBe(8)
    expect(m.chime).toBe('silent')
  })
  it('returns muffled-chime for moderate', () => {
    const m = measureChiming(MODERATE)
    expect(m.quality).toBe(47)
    expect(m.chime).toBe('muffled-chime')
  })
  it('detects clear (docComments+export)', () => expect(measureChiming(RICH).hasClear).toBe(true))
  it('detects harmonious (namedExport+returnType)', () => {
    expect(measureChiming(RICH).hasHarmonious).toBe(true)
    expect(measureChiming(MODERATE).hasHarmonious).toBe(true)
  })
  it('counts muffled (var) and dissonant (any)', () => {
    const m = measureChiming(POOR)
    expect(m.muffledCount).toBe(2)
    expect(m.dissonantCount).toBe(4)
  })
  it('clean code has no muffled or dissonant', () => {
    const m = measureChiming(RICH)
    expect(m.hasNoMuffled).toBe(true)
    expect(m.hasNoDissonant).toBe(true)
    expect(m.hasNoClashing).toBe(true)
    expect(m.hasNoHarsh).toBe(true)
  })
})

// ─── Classification Tests ──────────────────────────────────────────

describe('classifyGearCondition', () => {
  it('swiss-masterpiece >= 85', () => expect(classifyGearCondition(85)).toBe('swiss-masterpiece'))
  it('precision-movement >= 70', () => expect(classifyGearCondition(70)).toBe('precision-movement'))
  it('proper-clockwork >= 55', () => expect(classifyGearCondition(55)).toBe('proper-clockwork'))
  it('rusty-mechanism >= 40', () => expect(classifyGearCondition(40)).toBe('rusty-mechanism'))
  it('jammed-gears >= 25', () => expect(classifyGearCondition(25)).toBe('jammed-gears'))
  it('stopped-clock < 25', () => expect(classifyGearCondition(0)).toBe('stopped-clock'))
})

describe('classifyHorologistGrade', () => {
  it('master-horologist >= 80', () => expect(classifyHorologistGrade(80)).toBe('master-horologist'))
  it('expert-watchmaker >= 65', () => expect(classifyHorologistGrade(65)).toBe('expert-watchmaker'))
  it('skilled-clockmaker >= 50', () => expect(classifyHorologistGrade(50)).toBe('skilled-clockmaker'))
  it('apprentice >= 35', () => expect(classifyHorologistGrade(35)).toBe('apprentice'))
  it('tinkerer >= 20', () => expect(classifyHorologistGrade(20)).toBe('tinkerer'))
  it('time-breaker < 20', () => expect(classifyHorologistGrade(19)).toBe('time-breaker'))
})

describe('classifyTowerCondition', () => {
  it('master-crafted >= 75', () => expect(classifyTowerCondition(75)).toBe('master-crafted'))
  it('well-maintained >= 60', () => expect(classifyTowerCondition(60)).toBe('well-maintained'))
  it('ticking-fine >= 45', () => expect(classifyTowerCondition(45)).toBe('ticking-fine'))
  it('needs-oiling >= 30', () => expect(classifyTowerCondition(30)).toBe('needs-oiling'))
  it('rusted >= 15', () => expect(classifyTowerCondition(15)).toBe('rusted'))
  it('stopped < 15', () => expect(classifyTowerCondition(14)).toBe('stopped'))
})

describe('classifyTowerType', () => {
  it('returns broken-timepiece for empty', () => expect(classifyTowerType([])).toBe('broken-timepiece'))
})

// ─── analyzeClockworkGear Tests ────────────────────────────────────

describe('analyzeClockworkGear', () => {
  it('returns swiss-masterpiece for rich', () => {
    const g = analyzeClockworkGear(RICH, 'rich.ts')
    expect(g.qualityScore).toBe(100)
    expect(g.condition).toBe('swiss-masterpiece')
  })
  it('returns stopped-clock for minimal', () => {
    const g = analyzeClockworkGear(MINIMAL, 'minimal.ts')
    expect(g.qualityScore).toBe(9)
    expect(g.condition).toBe('stopped-clock')
  })
  it('returns rusty-mechanism for moderate', () => {
    const g = analyzeClockworkGear(MODERATE, 'moderate.ts')
    expect(g.qualityScore).toBe(47)
    expect(g.condition).toBe('rusty-mechanism')
  })
  it('returns stopped-clock for poor', () => {
    const g = analyzeClockworkGear(POOR, 'poor.ts')
    expect(g.qualityScore).toBe(0)
    expect(g.condition).toBe('stopped-clock')
  })
  it('contains all measures', () => {
    const g = analyzeClockworkGear(RICH, 'test.ts')
    expect(g.timing).toBeDefined()
    expect(g.meshing).toBeDefined()
    expect(g.tolerating).toBeDefined()
    expect(g.tensioning).toBeDefined()
    expect(g.chiming).toBeDefined()
  })
})

// ─── buildPhantomClockworkResult Tests ─────────────────────────────

describe('buildPhantomClockworkResult', () => {
  it('computes full 4-file result', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.totalFiles).toBe(4)
    expect(r.stats.totalTowers).toBe(1)
    expect(r.stats.avgTemporalPrecision).toBe(42)
    expect(r.stats.avgGearMeshing).toBe(40)
    expect(r.stats.avgGhostTolerance).toBe(36)
    expect(r.stats.avgSpringTension).toBe(37)
    expect(r.stats.avgChimeQuality).toBe(39)
    expect(r.stats.overallPrecision).toBe(40)
    expect(r.stats.horologistGrade).toBe('apprentice')
    expect(r.mechanism.isRunning).toBe(false)
  })
  it('computes condition counts', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.swissMasterpieceCount).toBe(1)
    expect(r.stats.rustyMechanismCount).toBe(1)
    expect(r.stats.stoppedClockCount).toBe(2)
  })
  it('computes high boolean counts', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.hasHighPrecisionCount).toBe(1)
    expect(r.stats.hasHighQualityCount).toBe(1)
    expect(r.stats.hasHighToleranceCount).toBe(1)
    expect(r.stats.hasHighTensionCount).toBe(1)
    expect(r.stats.hasHighChimeCount).toBe(1)
  })
  it('identifies best files', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.stats.bestGear).toBe('rich.ts')
    expect(r.stats.mostPrecise).toBe('rich.ts')
    expect(r.stats.bestMeshed).toBe('rich.ts')
    expect(r.stats.mostTolerant).toBe('rich.ts')
    expect(r.stats.bestTensioned).toBe('rich.ts')
  })
  it('classifies tower', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.towers[0]!.towerType).toBe('mantel-clock')
    expect(r.towers[0]!.condition).toBe('needs-oiling')
  })
  it('generates recommendations', async () => {
    const r = await buildPhantomClockworkResult(
      ['rich.ts','minimal.ts','moderate.ts','poor.ts'],
      [RICH, MINIMAL, MODERATE, POOR],
    )
    expect(r.recommendations.length).toBeGreaterThan(0)
  })
  it('handles empty input', async () => {
    const r = await buildPhantomClockworkResult([], [])
    expect(r.gears).toHaveLength(0)
    expect(r.stats.overallPrecision).toBe(0)
  })
  it('returns perfect message for all-masterpiece', async () => {
    const r = await buildPhantomClockworkResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.recommendations).toContain('Your phantom clockwork is running perfectly! Every gear meshes with precision')
  })
  it('isRunning when avgPrecision >= 60', async () => {
    const r = await buildPhantomClockworkResult(['a.ts','b.ts'], [RICH, RICH])
    expect(r.mechanism.isRunning).toBe(true)
  })
  it('groups by directory', async () => {
    const r = await buildPhantomClockworkResult(['src/a.ts','lib/b.ts'], [RICH, MINIMAL])
    expect(r.stats.totalTowers).toBe(2)
  })
})

// ─── Format Helpers Tests ──────────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
  it('colorGrade returns string', () => {
    expect(typeof colorGrade('atomic-clock')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
  it('formatGearTable formats gear', () => {
    const g = analyzeClockworkGear(RICH, 'rich.ts')
    expect(formatGearTable(g)).toContain('rich.ts')
  })
  it('formatGearsTable handles empty', () => {
    expect(formatGearsTable([])).toContain('No clockwork gears')
  })
  it('formatTowerTable formats tower', () => {
    const g = analyzeClockworkGear(RICH, 'a.ts')
    const t = analyzeClockworkTower([g], 'src')
    expect(formatTowerTable(t)).toContain('src')
  })
  it('formatTowersTable handles empty', () => {
    expect(formatTowersTable([])).toContain('No clockwork towers')
  })
  it('formatStatsTable formats stats', async () => {
    const r = await buildPhantomClockworkResult(['a.ts'], [RICH])
    expect(formatStatsTable(r.stats)).toContain('Mechanism Statistics')
  })
  it('formatRecommendations handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formatResultTable formats full result', async () => {
    const r = await buildPhantomClockworkResult(['a.ts','b.ts'], [RICH, MINIMAL])
    const out = formatResultTable(r)
    expect(out).toContain('Clockwork Gear Analysis')
    expect(out).toContain('Clockwork Tower Analysis')
    expect(out).toContain('Recommendations')
  })
  it('formatResultJson returns valid JSON', async () => {
    const r = await buildPhantomClockworkResult(['a.ts'], [RICH])
    const parsed = JSON.parse(formatResultJson(r))
    expect(parsed.gears).toHaveLength(1)
  })
})
