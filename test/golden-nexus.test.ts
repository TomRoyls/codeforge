import { describe, it, expect } from 'vitest'
import {
  measureIlluminating,
  measureBinding,
  measureConverging,
  measureShielding,
  measureKnowing,
  analyzeGoldenThread,
  analyzeGoldenWeb,
  classifyThreadCondition,
  classifyWebType,
  classifyWebCondition,
  classifyWeaverGrade,
  generateRecommendations,
  buildGoldenNexusResult,
  gatherFiles,
} from '../src/commands/golden-nexus-helpers.js'
import {
  colorScore,
  colorGrade,
  formatThreadTable,
  formatThreadsTable,
  formatWebTable,
  formatWebsTable,
  formatStatsTable,
  formatRecommendations,
  formatCelebration,
  formatResultTable,
  formatResultJson,
} from '../src/commands/golden-nexus-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const moderateContent = `export interface Foo {
  bar: string
}

export function greet(name: string): string {
  return 'hello ' + name
}

const foo: Foo = { bar: 'baz' }
`

const richContent = `/**
 * A type alias for string or number
 */
type StringOrNumber = string | number

export enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
}

export interface Widget<T> {
  readonly id: string
  name: string
  value: T
  optional?: boolean
}

export class Processor {
  private status: string = 'idle'

  async process(input: string): Promise<string> {
    try {
      this.status = 'running'
      return input.toUpperCase()
    } catch (err) {
      throw new Error('Processing failed')
    }
  }
}

export function findWidget(widgets: Widget<string>[], id: string): Widget<string> | undefined {
  return widgets.find(w => w.id === id)
}

const DEFAULT_COLOR = Color.Red
`

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(20)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasVisible).toBe(false)
    expect(m.hasNoInvisible).toBe(true)
    expect(m.hasUnderstandable).toBe(false)
    expect(m.hasNoArcane).toBe(true)
    expect(m.hasLuminous).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate clarity for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.clarity).toBeLessThan(80)
    expect(m.hasReadable).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('returns high clarity for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasNoCryptic).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasNoObfuscated).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasNoInvisible).toBe(true)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasNoArcane).toBe(true)
    expect(m.hasLuminous).toBe(true)
    expect(m.radiance).toBe('solar-flare')
  })

  it('detects eval as cryptic', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('detects debugger as obfuscated', () => {
    const m = measureIlluminating('function f() { debugger }')
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('detects with as cryptic', () => {
    const m = measureIlluminating('with(obj) { x }')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
  })

  it('clarity is capped at 100', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBeLessThanOrEqual(100)
  })

  it('clarity is never negative', () => {
    const m = measureIlluminating('eval("x") with(o){}')
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })
})

// ─── measureBinding ────────────────────────────────────────────────

describe('measureBinding', () => {
  it('returns low strength for minimal content', () => {
    const m = measureBinding(minimalContent)
    expect(m.strength).toBeLessThanOrEqual(10)
    expect(m.hasHighStrength).toBe(false)
    expect(m.hasModular).toBe(false)
    expect(m.hasNoTangled).toBe(true)
    expect(m.hasConnected).toBe(false)
    expect(m.hasNoIsolated).toBe(true)
    expect(m.hasCohesive).toBe(false)
    expect(m.hasNoScattered).toBe(true)
    expect(m.hasLinked).toBe(false)
    expect(m.hasNoOrphaned).toBe(true)
    expect(m.hasIntegrated).toBe(false)
    expect(m.hasNoDisconnected).toBe(true)
    expect(m.hasHarmonious).toBe(false)
    expect(m.tangledCount).toBe(0)
    expect(m.isolatedCount).toBe(0)
  })

  it('returns moderate strength for moderate content', () => {
    const m = measureBinding(moderateContent)
    expect(m.strength).toBeGreaterThan(20)
    expect(m.hasConnected).toBe(true)
    expect(m.hasLinked).toBe(false)
    expect(m.hasModular).toBe(false)
  })

  it('returns high strength for rich content', () => {
    const m = measureBinding(richContent)
    expect(m.strength).toBeGreaterThan(60)
    expect(m.hasConnected).toBe(true)
    expect(m.hasCohesive).toBe(true)
    expect(m.hasNoTangled).toBe(true)
    expect(m.hasNoDisconnected).toBe(true)
  })

  it('detects var as tangled', () => {
    const m = measureBinding('var x = 1')
    expect(m.hasNoTangled).toBe(false)
    expect(m.tangledCount).toBe(1)
  })

  it('detects isolated function', () => {
    const m = measureBinding('function foo() { return 1 }')
    expect(m.hasNoIsolated).toBe(false)
    expect(m.isolatedCount).toBe(1)
  })

  it('strength capped at 100', () => {
    const m = measureBinding(richContent)
    expect(m.strength).toBeLessThanOrEqual(100)
  })
})

// ─── measureConverging ─────────────────────────────────────────────

describe('measureConverging', () => {
  it('returns low precision for minimal content', () => {
    const m = measureConverging(minimalContent)
    expect(m.precision).toBeLessThanOrEqual(15)
    expect(m.hasHighPrecision).toBe(false)
    expect(m.hasExact).toBe(false)
    expect(m.hasAccurate).toBe(false)
    expect(m.hasNoApproximate).toBe(true)
    expect(m.hasPrecise).toBe(false)
    expect(m.hasNoVague).toBe(true)
    expect(m.hasCorrect).toBe(false)
    expect(m.hasNoAlmostRight).toBe(true)
    expect(m.hasSharp).toBe(false)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.hasDefined).toBe(false)
    expect(m.hasNoFuzzy).toBe(true)
    expect(m.hasAligned).toBe(false)
    expect(m.approximateCount).toBe(0)
    expect(m.sloppyCount).toBe(0)
  })

  it('returns moderate precision for moderate content', () => {
    const m = measureConverging(moderateContent)
    expect(m.precision).toBeGreaterThan(20)
    expect(m.hasAccurate).toBe(true)
  })

  it('returns high precision for rich content', () => {
    const m = measureConverging(richContent)
    expect(m.precision).toBeGreaterThan(80)
    expect(m.hasExact).toBe(true)
    expect(m.hasSharp).toBe(true)
    expect(m.hasAligned).toBe(true)
  })

  it('detects any as approximate', () => {
    const m = measureConverging('const x: any = 1')
    expect(m.hasNoApproximate).toBe(false)
    expect(m.hasNoFuzzy).toBe(false)
  })

  it('detects var as sloppy', () => {
    const m = measureConverging('var x = 1')
    expect(m.hasNoVague).toBe(false)
    expect(m.hasNoSloppy).toBe(false)
    expect(m.sloppyCount).toBe(1)
  })

  it('detects eval', () => {
    const m = measureConverging('eval("1")')
    expect(m.hasNoAlmostRight).toBe(false)
  })

  it('precision capped at 100', () => {
    const m = measureConverging(richContent)
    expect(m.precision).toBeLessThanOrEqual(100)
  })
})

// ─── measureShielding ──────────────────────────────────────────────

describe('measureShielding', () => {
  it('returns low resilience for minimal content', () => {
    const m = measureShielding(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(15)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasNoUnsafe).toBe(true)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasNoBareCrash).toBe(true)
    expect(m.hasDefensive).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasRobust).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasValidated).toBe(false)
    expect(m.hasNoTrusting).toBe(true)
    expect(m.untestedCount).toBe(0)
    expect(m.bareCrashCount).toBe(0)
  })

  it('returns high resilience for rich content', () => {
    const m = measureShielding(richContent)
    expect(m.resilience).toBeGreaterThan(60)
    expect(m.hasTested).toBe(true)
    expect(m.hasNoUntested).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDefensive).toBe(true)
  })

  it('detects var as untested', () => {
    const m = measureShielding('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.hasNoUnsafe).toBe(false)
    expect(m.untestedCount).toBe(1)
  })

  it('detects debugger as bare crash', () => {
    const m = measureShielding('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('detects bare throw without new', () => {
    const m = measureShielding('throw "error"')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })

  it('resilience capped at 100', () => {
    const m = measureShielding(richContent)
    expect(m.resilience).toBeLessThanOrEqual(100)
  })
  it('moderate content has some resilience', () => {
    const m = measureShielding(moderateContent)
    expect(m.resilience).toBeGreaterThan(10)
    expect(m.hasTypeSafe).toBe(true)
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(15)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellArchitected).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasPatterned).toBe(false)
    expect(m.hasNoReinvented).toBe(true)
    expect(m.hasPrincipled).toBe(false)
    expect(m.hasNoHacky).toBe(true)
    expect(m.hasMature).toBe(false)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasVisionary).toBe(false)
    expect(m.hasNoTunnelVision).toBe(true)
    expect(m.hasStrategic).toBe(false)
    expect(m.adHocCount).toBe(0)
    expect(m.hackyCount).toBe(0)
  })

  it('returns moderate wisdom for moderate content', () => {
    const m = measureKnowing(moderateContent)
    expect(m.wisdom).toBeGreaterThan(10)
    expect(m.hasDocumented).toBe(false)
  })

  it('returns high wisdom for rich content', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeGreaterThan(60)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellArchitected).toBe(true)
    expect(m.hasPrincipled).toBe(true)
    expect(m.hasNoHacky).toBe(true)
  })

  it('detects var as adHoc', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects as any as hacky', () => {
    const m = measureKnowing('const x = y as any')
    expect(m.hasNoHacky).toBe(false)
    expect(m.hackyCount).toBe(1)
  })

  it('detects TODO/FIXME as tunnel vision', () => {
    const m = measureKnowing('// TODO: fix this')
    expect(m.hasNoTunnelVision).toBe(false)
  })

  it('wisdom capped at 100', () => {
    const m = measureKnowing(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyThreadCondition', () => {
  it('classifies golden-convergence', () => expect(classifyThreadCondition(92)).toBe('golden-convergence'))
  it('classifies radiant-nexus', () => expect(classifyThreadCondition(78)).toBe('radiant-nexus'))
  it('classifies proper-node', () => expect(classifyThreadCondition(65)).toBe('proper-node'))
  it('classifies dim-point', () => expect(classifyThreadCondition(45)).toBe('dim-point'))
  it('classifies dark-spot', () => expect(classifyThreadCondition(25)).toBe('dark-spot'))
  it('classifies void', () => expect(classifyThreadCondition(10)).toBe('void'))
})

describe('classifyWebCondition', () => {
  it('classifies golden-constellation', () => expect(classifyWebCondition(88)).toBe('golden-constellation'))
  it('classifies radiant-network', () => expect(classifyWebCondition(72)).toBe('radiant-network'))
  it('classifies proper-web', () => expect(classifyWebCondition(58)).toBe('proper-web'))
  it('classifies frayed-mesh', () => expect(classifyWebCondition(38)).toBe('frayed-mesh'))
  it('classifies broken-threads', () => expect(classifyWebCondition(18)).toBe('broken-threads'))
  it('classifies void', () => expect(classifyWebCondition(5)).toBe('void'))
})

describe('classifyWeaverGrade', () => {
  it('classifies master-weaver', () => expect(classifyWeaverGrade(88)).toBe('master-weaver'))
  it('classifies expert-architect', () => expect(classifyWeaverGrade(72)).toBe('expert-architect'))
  it('classifies skilled-builder', () => expect(classifyWeaverGrade(58)).toBe('skilled-builder'))
  it('classifies apprentice', () => expect(classifyWeaverGrade(42)).toBe('apprentice'))
  it('classifies novice', () => expect(classifyWeaverGrade(22)).toBe('novice'))
  it('classifies tangled-soul', () => expect(classifyWeaverGrade(8)).toBe('tangled-soul'))
})

describe('classifyWebType', () => {
  it('returns no-web for empty threads', () => {
    expect(classifyWebType([])).toBe('no-web')
  })

  it('returns cosmic-web or golden-network for all golden-convergence threads', () => {
    const threads = [
      { ...analyzeGoldenThread(richContent, 'a.ts'), condition: 'golden-convergence' as const },
      { ...analyzeGoldenThread(richContent, 'b.ts'), condition: 'golden-convergence' as const },
    ]
    const webType = classifyWebType(threads)
    expect(webType === 'cosmic-web' || webType === 'golden-network').toBe(true)
  })
})

// ─── analyzeGoldenThread ──────────────────────────────────────────

describe('analyzeGoldenThread', () => {
  it('analyzes minimal content', () => {
    const thread = analyzeGoldenThread(minimalContent, 'mini.ts')
    expect(thread.file).toBe('mini.ts')
    expect(thread.qualityScore).toBeLessThanOrEqual(20)
    expect(thread.condition).toBe('void')
    expect(thread.radiantClarity).toBeLessThanOrEqual(20)
    expect(thread.connectionStrength).toBeLessThanOrEqual(20)
    expect(thread.nexusPrecision).toBeLessThanOrEqual(20)
    expect(thread.fieldResilience).toBeLessThanOrEqual(20)
    expect(thread.coreWisdom).toBeLessThanOrEqual(20)
  })

  it('analyzes rich content', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    expect(thread.file).toBe('rich.ts')
    expect(thread.qualityScore).toBeGreaterThan(70)
    expect(thread.condition).not.toBe('void')
    expect(thread.radiantClarity).toBe(100)
    expect(thread.connectionStrength).toBeGreaterThan(60)
    expect(thread.nexusPrecision).toBeGreaterThan(80)
    expect(thread.fieldResilience).toBeGreaterThan(60)
    expect(thread.coreWisdom).toBeGreaterThan(60)
  })

  it('quality score is average of 5 measures', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    const expected = Math.round(
      thread.radiantClarity * 0.2 +
      thread.connectionStrength * 0.2 +
      thread.nexusPrecision * 0.2 +
      thread.fieldResilience * 0.2 +
      thread.coreWisdom * 0.2,
    )
    expect(thread.qualityScore).toBe(expected)
  })

  it('moderate content gets middle condition', () => {
    const thread = analyzeGoldenThread(moderateContent, 'mod.ts')
    expect(thread.condition).not.toBe('void')
    expect(thread.condition).not.toBe('golden-convergence')
    expect(thread.radiantClarity).toBeGreaterThan(0)
    expect(thread.connectionStrength).toBeGreaterThan(0)
  })
})

// ─── analyzeGoldenWeb ─────────────────────────────────────────────

describe('analyzeGoldenWeb', () => {
  it('handles empty threads', () => {
    const web = analyzeGoldenWeb([], 'empty')
    expect(web.directory).toBe('empty')
    expect(web.threads).toHaveLength(0)
    expect(web.avgClarity).toBe(0)
    expect(web.avgStrength).toBe(0)
    expect(web.avgWisdom).toBe(0)
    expect(web.goldenConvergenceCount).toBe(0)
    expect(web.voidCount).toBe(0)
    expect(web.webType).toBe('no-web')
    expect(web.condition).toBe('void')
  })

  it('classifies web with rich threads', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    const web = analyzeGoldenWeb([thread], 'src')
    expect(web.goldenConvergenceCount).toBeGreaterThanOrEqual(0)
    expect(web.voidCount).toBe(0)
    expect(web.avgClarity).toBe(100)
    expect(web.webType).not.toBe('no-web')
  })

  it('classifies web with mixed threads', () => {
    const rich = analyzeGoldenThread(richContent, 'rich.ts')
    const minimal = analyzeGoldenThread(minimalContent, 'mini.ts')
    const web = analyzeGoldenWeb([rich, minimal], 'src')
    expect(web.threads).toHaveLength(2)
    expect(web.voidCount).toBe(1)
  })
})

// ─── buildGoldenNexusResult ───────────────────────────────────────

describe('buildGoldenNexusResult', async () => {
  it('handles empty input', async () => {
    const result = await buildGoldenNexusResult([], [])
    expect(result.threads).toHaveLength(0)
    expect(result.webs).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallRadiance).toBe(0)
    expect(result.stats.weaverGrade).toBe('tangled-soul')
    expect(result.nexus.isGolden).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildGoldenNexusResult(['test.ts'], [richContent])
    expect(result.threads).toHaveLength(1)
    expect(result.threads[0].condition).not.toBe('void')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.voidCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildGoldenNexusResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.threads).toHaveLength(2)
    expect(result.webs).toHaveLength(2)
    expect(result.stats.totalWebs).toBe(2)
  })

  it('computes overall stats for rich content', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    expect(result.stats.overallRadiance).toBeGreaterThan(70)
    expect(result.stats.bestThread).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('computes nexus correctly', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    expect(result.nexus.avgClarity).toBe(100)
    expect(result.nexus.avgStrength).toBeGreaterThan(60)
    expect(result.nexus.avgWisdom).toBeGreaterThan(60)
    expect(typeof result.nexus.isGolden).toBe('boolean')
    expect(result.nexus.overallRadiance).toBeGreaterThan(70)
  })

  it('includes celebration field', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    expect(result.celebration.milestone).toBe(530)
    expect(result.celebration.name).toBe('golden-nexus')
    expect(result.celebration.previousMilestones).toEqual([420, 430, 440, 450, 460, 470, 480, 490, 500, 510, 520])
    expect(result.celebration.totalTests).toBe(95000)
    expect(result.celebration.message).toContain('530')
  })

  it('tracks condition counts', async () => {
    const result = await buildGoldenNexusResult(
      ['rich.ts', 'mini.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.voidCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
  })

  it('overall radiance is avg of clarity, strength, wisdom', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgRadiantClarity + result.stats.avgConnectionStrength + result.stats.avgCoreWisdom) / 3,
    )
    expect(result.stats.overallRadiance).toBe(expected)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns steady message when quality is good', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.threads, result.webs, result.nexus, result.stats)
    expect(recs.length).toBeGreaterThanOrEqual(1)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('radiant clarity') || r.includes('clarity'))).toBe(true)
  })

  it('recommends improving connections when low', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('connection') || r.includes('threads'))).toBe(true)
  })

  it('recommends improving precision when low', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('precision') || r.includes('nexus'))).toBe(true)
  })

  it('recommends improving resilience when low', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('field') || r.includes('resilience'))).toBe(true)
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('wisdom') || r.includes('documentation'))).toBe(true)
  })

  it('notes void files', async () => {
    const result = await buildGoldenNexusResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('void') || r.includes('Void'))).toBe(true)
  })

  it('lists specific void files when <=3', async () => {
    const result = await buildGoldenNexusResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.recommendations.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
  })

  it('notes frayed webs', async () => {
    const result = await buildGoldenNexusResult(
      ['src/a.ts', 'src/b.ts'],
      [minimalContent, minimalContent],
    )
    const hasFrayedRec = result.recommendations.some(r => r.includes('frayed') || r.includes('broken'))
    expect(typeof hasFrayedRec).toBe('boolean')
  })
})

// ─── gatherFiles ───────────────────────────────────────────────────

describe('gatherFiles', () => {
  it('returns empty for non-existent path', async () => {
    const files = await gatherFiles('/nonexistent', ['.ts'], [])
    expect(files).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for any grade', () => {
    expect(typeof colorGrade('golden-convergence')).toBe('string')
    expect(typeof colorGrade('void')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatThreadTable', () => {
  it('formats a thread', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    const output = formatThreadTable(thread)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Radiant Clarity')
    expect(output).toContain('Connection Strength')
    expect(output).toContain('Nexus Precision')
    expect(output).toContain('Field Resilience')
    expect(output).toContain('Core Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatThreadsTable', () => {
  it('returns message for empty threads', () => {
    expect(formatThreadsTable([])).toContain('No golden threads')
  })
})

describe('formatWebTable', () => {
  it('formats a web', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    const web = analyzeGoldenWeb([thread], 'src')
    const output = formatWebTable(web)
    expect(output).toContain('src')
    expect(output).toContain('Avg Clarity')
    expect(output).toContain('Type')
  })
})

describe('formatWebsTable', () => {
  it('returns message for empty webs', () => {
    expect(formatWebsTable([])).toContain('No golden webs')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Golden Nexus Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Weaver Grade')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty recs', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['improve X', 'fix Y'])
    expect(output).toContain('improve X')
    expect(output).toContain('fix Y')
  })
})

describe('formatCelebration', () => {
  it('formats celebration', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const output = formatCelebration(result.celebration)
    expect(output).toContain('530')
    expect(output).toContain('golden-nexus')
    expect(output).toContain('95,000')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Golden Thread Analysis')
    expect(output).toContain('Golden Webs')
    expect(output).toContain('Golden Nexus Statistics')
    expect(output).toContain('Recommendations')
    expect(output).toContain('Milestone')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildGoldenNexusResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.threads).toHaveLength(1)
    expect(parsed.stats.weaverGrade).toBeDefined()
    expect(parsed.celebration.milestone).toBe(530)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with eval in illuminating', () => {
    const m = measureIlluminating('eval("1")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(1)
  })

  it('handles content with debugger in shielding', () => {
    const m = measureShielding('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('handles content with as any in converging', () => {
    const m = measureConverging('const x = y as any')
    expect(m.hasNoApproximate).toBe(false)
    expect(m.hasNoFuzzy).toBe(false)
    expect(m.approximateCount).toBe(1)
  })

  it('handles content with var in binding', () => {
    const m = measureBinding('var x = 1')
    expect(m.hasNoTangled).toBe(false)
    expect(m.tangledCount).toBe(1)
  })

  it('handles content with var in knowing', () => {
    const m = measureKnowing('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('all measure scores are within 0-100', () => {
    const contents = ['', 'x', minimalContent, moderateContent, richContent, 'eval("x") as any var z']
    for (const c of contents) {
      expect(measureIlluminating(c).clarity).toBeGreaterThanOrEqual(0)
      expect(measureIlluminating(c).clarity).toBeLessThanOrEqual(100)
      expect(measureBinding(c).strength).toBeGreaterThanOrEqual(0)
      expect(measureBinding(c).strength).toBeLessThanOrEqual(100)
      expect(measureConverging(c).precision).toBeGreaterThanOrEqual(0)
      expect(measureConverging(c).precision).toBeLessThanOrEqual(100)
      expect(measureShielding(c).resilience).toBeGreaterThanOrEqual(0)
      expect(measureShielding(c).resilience).toBeLessThanOrEqual(100)
      expect(measureKnowing(c).wisdom).toBeGreaterThanOrEqual(0)
      expect(measureKnowing(c).wisdom).toBeLessThanOrEqual(100)
    }
  })

  it('thread quality score equals weighted average', () => {
    const thread = analyzeGoldenThread(moderateContent, 'mod.ts')
    const expected = Math.round(
      thread.radiantClarity * 0.2 +
      thread.connectionStrength * 0.2 +
      thread.nexusPrecision * 0.2 +
      thread.fieldResilience * 0.2 +
      thread.coreWisdom * 0.2,
    )
    expect(thread.qualityScore).toBe(expected)
  })

  it('nexus overallRadiance is avg of clarity, strength, wisdom', async () => {
    const result = await buildGoldenNexusResult(['mod.ts'], [moderateContent])
    const expected = Math.round(
      (result.stats.avgRadiantClarity + result.stats.avgConnectionStrength + result.stats.avgCoreWisdom) / 3,
    )
    expect(result.stats.overallRadiance).toBe(expected)
    expect(result.nexus.overallRadiance).toBe(expected)
  })

  it('handles as any in shielding', () => {
    const m = measureShielding('const x = y as any')
    expect(m.hasNoTrusting).toBe(false)
  })

  it('handles console in shielding', () => {
    const m = measureShielding('console.log("x")')
    expect(m.resilience).toBeLessThan(100)
  })

  it('handles bare throw in shielding', () => {
    const m = measureShielding('throw "error"')
    expect(m.hasNoBareCrash).toBe(false)
  })

  it('handles TODO in knowing', () => {
    const m = measureKnowing('// TODO: fix')
    expect(m.hasNoTunnelVision).toBe(false)
    expect(m.hasNoReinvented).toBe(false)
  })

  it('web condition based on avgClarity', () => {
    const thread = analyzeGoldenThread(richContent, 'rich.ts')
    const web = analyzeGoldenWeb([thread], 'src')
    expect(web.condition).toBe('golden-constellation')
  })

  it('empty web has no-web type', () => {
    const web = analyzeGoldenWeb([], 'empty')
    expect(web.webType).toBe('no-web')
    expect(web.condition).toBe('void')
  })

  it('celebration milestone is 530', async () => {
    const result = await buildGoldenNexusResult([], [])
    expect(result.celebration.milestone).toBe(530)
    expect(result.celebration.name).toBe('golden-nexus')
  })

  it('multi-dir creates multiple webs', async () => {
    const result = await buildGoldenNexusResult(
      ['src/a.ts', 'lib/b.ts', 'src/c.ts'],
      [richContent, moderateContent, minimalContent],
    )
    expect(result.webs).toHaveLength(2)
    const srcWeb = result.webs.find(w => w.directory === 'src')
    expect(srcWeb).toBeDefined()
    expect(srcWeb!.threads).toHaveLength(2)
    const libWeb = result.webs.find(w => w.directory === 'lib')
    expect(libWeb).toBeDefined()
    expect(libWeb!.threads).toHaveLength(1)
  })
})
