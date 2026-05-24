import { describe, it, expect } from 'vitest'
import {
  measureAging,
  measureIlluminating,
  measureConducting,
  measureComforting,
  measureStrengthening,
  analyzeCopperRay,
  analyzeCopperForge,
  classifyRayCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifySmithGrade,
  generateRecommendations,
  buildCopperDawnResult,
  gatherFiles,
} from '../src/commands/copper-dawn-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-dawn-format-helpers.js'

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

// ─── Aging Measure ─────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns low score for minimal content', () => {
    const m = measureAging(minimalContent)
    expect(m.wisdom).toBeLessThanOrEqual(10)
    expect(m.hasHighWisdom).toBe(false)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(false)
    expect(m.hasNoAdHoc).toBe(true)
    expect(m.hasNoExperimental).toBe(true)
    expect(m.hasNoNaive).toBe(true)
    expect(m.hasNoNovel).toBe(true)
    expect(m.adHocCount).toBe(0)
    expect(m.experimentalCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureAging(moderateContent)
    expect(m.wisdom).toBeGreaterThan(20)
    expect(m.wisdom).toBeLessThan(70)
    expect(m.hasDocumented).toBe(false)
    expect(m.hasWellStructured).toBe(true)
    expect(m.patina).toBe('corroded-wire')
  })

  it('returns high score for rich content', () => {
    const m = measureAging(richContent)
    expect(m.wisdom).toBe(100)
    expect(m.hasHighWisdom).toBe(true)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
    expect(m.hasProven).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasEstablished).toBe(true)
    expect(m.hasBattleTested).toBe(true)
    expect(m.patina).toBe('noble-verdigris')
  })

  it('detects var as ad-hoc', () => {
    const m = measureAging('var x = 1')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.adHocCount).toBe(1)
  })

  it('detects eval as experimental', () => {
    const m = measureAging('eval("1+2")')
    expect(m.hasNoExperimental).toBe(false)
    expect(m.experimentalCount).toBe(1)
  })
})

// ─── Illuminating Measure ──────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns low score for minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.clarity).toBeLessThanOrEqual(10)
    expect(m.hasHighClarity).toBe(false)
    expect(m.hasReadable).toBe(false)
    expect(m.hasSelfDocumenting).toBe(false)
    expect(m.hasClear).toBe(false)
    expect(m.hasTransparent).toBe(false)
    expect(m.hasApproachable).toBe(false)
    expect(m.hasInviting).toBe(false)
    expect(m.crypticCount).toBe(0)
    expect(m.obfuscatedCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureIlluminating(moderateContent)
    expect(m.clarity).toBeGreaterThan(20)
    expect(m.clarity).toBeLessThan(70)
    expect(m.hasReadable).toBe(true)
    expect(m.hasClear).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureIlluminating(richContent)
    expect(m.clarity).toBe(100)
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasSelfDocumenting).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasInviting).toBe(true)
    expect(m.dawn).toBe('rose-gold-dawn')
  })

  it('detects any as cryptic', () => {
    const m = measureIlluminating('const x: any = 1 as any')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBe(2)
  })
})

// ─── Conducting Measure ────────────────────────────────────────────

describe('measureConducting', () => {
  it('returns low score for minimal content', () => {
    const m = measureConducting(minimalContent)
    expect(m.quality).toBeLessThanOrEqual(10)
    expect(m.hasHighQuality).toBe(false)
    expect(m.hasEfficientFlow).toBe(false)
    expect(m.hasStreamlined).toBe(false)
    expect(m.hasDirectPaths).toBe(false)
    expect(m.hasCleanPipelines).toBe(false)
    expect(m.hasOptimized).toBe(false)
    expect(m.bottleneckCount).toBe(0)
    expect(m.tangledCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureConducting(moderateContent)
    expect(m.quality).toBeGreaterThan(20)
    expect(m.quality).toBeLessThan(70)
    expect(m.hasEfficientFlow).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureConducting(richContent)
    expect(m.quality).toBe(100)
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasEfficientFlow).toBe(true)
    expect(m.hasStreamlined).toBe(true)
    expect(m.hasDirectPaths).toBe(true)
    expect(m.hasCleanPipelines).toBe(true)
    expect(m.hasOptimized).toBe(true)
    expect(m.flow).toBe('superconductor')
  })

  it('detects var as bottleneck', () => {
    const m = measureConducting('var x = 1')
    expect(m.hasNoBottlenecks).toBe(false)
    expect(m.bottleneckCount).toBe(1)
  })
})

// ─── Comforting Measure ────────────────────────────────────────────

describe('measureComforting', () => {
  it('returns low score for minimal content', () => {
    const m = measureComforting(minimalContent)
    expect(m.resilience).toBeLessThanOrEqual(10)
    expect(m.hasHighResilience).toBe(false)
    expect(m.hasErrorHandled).toBe(false)
    expect(m.hasGraceful).toBe(false)
    expect(m.hasHelpful).toBe(false)
    expect(m.hasRecoverable).toBe(false)
    expect(m.hasForgiving).toBe(false)
    expect(m.hasCompassionate).toBe(false)
    expect(m.bareCrashCount).toBe(0)
    expect(m.harshCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureComforting(moderateContent)
    expect(m.resilience).toBeGreaterThan(20)
    expect(m.resilience).toBeLessThan(70)
    expect(m.hasGraceful).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureComforting(richContent)
    expect(m.resilience).toBe(100)
    expect(m.hasHighResilience).toBe(true)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasGraceful).toBe(true)
    expect(m.hasHelpful).toBe(true)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasForgiving).toBe(true)
    expect(m.hasCompassionate).toBe(true)
    expect(m.warmth).toBe('warm-hearth')
  })

  it('detects var as bare crash', () => {
    const m = measureComforting('var x = 1')
    expect(m.hasNoBareCrash).toBe(false)
    expect(m.bareCrashCount).toBe(1)
  })
})

// ─── Strengthening Measure ─────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns low score for minimal content', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.strength).toBeLessThanOrEqual(10)
    expect(m.hasHighStrength).toBe(false)
    expect(m.hasTested).toBe(false)
    expect(m.hasTypeSafe).toBe(false)
    expect(m.hasRobust).toBe(false)
    expect(m.hasSolid).toBe(false)
    expect(m.hasDurable).toBe(false)
    expect(m.untestedCount).toBe(0)
    expect(m.fragileCount).toBe(0)
  })

  it('returns moderate score for moderate content', () => {
    const m = measureStrengthening(moderateContent)
    expect(m.strength).toBeGreaterThan(10)
    expect(m.strength).toBeLessThan(70)
    expect(m.hasDurable).toBe(true)
  })

  it('returns high score for rich content', () => {
    const m = measureStrengthening(richContent)
    expect(m.strength).toBe(100)
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasTested).toBe(true)
    expect(m.hasTypeSafe).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.forge).toBe('masterwork-forge')
  })

  it('detects var as untested', () => {
    const m = measureStrengthening('var x = 1')
    expect(m.hasNoUntested).toBe(false)
    expect(m.untestedCount).toBe(1)
  })
})

// ─── Classification Functions ──────────────────────────────────────

describe('classifyRayCondition', () => {
  it('classifies masterwork-copper', () => expect(classifyRayCondition(90)).toBe('masterwork-copper'))
  it('classifies aged-bronze', () => expect(classifyRayCondition(75)).toBe('aged-bronze'))
  it('classifies proper-copper', () => expect(classifyRayCondition(60)).toBe('proper-copper'))
  it('classifies tarnished-metal', () => expect(classifyRayCondition(45)).toBe('tarnished-metal'))
  it('classifies rusty-wire', () => expect(classifyRayCondition(30)).toBe('rusty-wire'))
  it('classifies scrap', () => expect(classifyRayCondition(10)).toBe('scrap'))
})

describe('classifyForgeCondition', () => {
  it('classifies golden-age', () => expect(classifyForgeCondition(80)).toBe('golden-age'))
  it('classifies prosperous-era', () => expect(classifyForgeCondition(65)).toBe('prosperous-era'))
  it('classifies proper-workshop', () => expect(classifyForgeCondition(50)).toBe('proper-workshop'))
  it('classifies rusty-shed', () => expect(classifyForgeCondition(35)).toBe('rusty-shed'))
  it('classifies abandoned-mine', () => expect(classifyForgeCondition(20)).toBe('abandoned-mine'))
  it('classifies void', () => expect(classifyForgeCondition(5)).toBe('void'))
})

describe('classifySmithGrade', () => {
  it('classifies master-smith', () => expect(classifySmithGrade(85)).toBe('master-smith'))
  it('classifies expert-forger', () => expect(classifySmithGrade(70)).toBe('expert-forger'))
  it('classifies skilled-metallurgist', () => expect(classifySmithGrade(55)).toBe('skilled-metallurgist'))
  it('classifies apprentice', () => expect(classifySmithGrade(40)).toBe('apprentice'))
  it('classifies novice', () => expect(classifySmithGrade(25)).toBe('novice'))
  it('classifies scrap-collector', () => expect(classifySmithGrade(10)).toBe('scrap-collector'))
})

describe('classifyForgeType', () => {
  it('returns no-forge for empty', () => {
    expect(classifyForgeType([])).toBe('no-forge')
  })

  it('returns grand-foundry for all masterwork', () => {
    const rays = [
      { ...analyzeCopperRay(richContent, 'a.ts'), condition: 'masterwork-copper' as const },
      { ...analyzeCopperRay(richContent, 'b.ts'), condition: 'masterwork-copper' as const },
    ]
    expect(classifyForgeType(rays)).toBe('grand-foundry')
  })
})

// ─── analyzeCopperRay ──────────────────────────────────────────────

describe('analyzeCopperRay', () => {
  it('analyzes minimal content', () => {
    const ray = analyzeCopperRay(minimalContent, 'mini.ts')
    expect(ray.file).toBe('mini.ts')
    expect(ray.qualityScore).toBeLessThanOrEqual(10)
    expect(ray.condition).toBe('scrap')
    expect(ray.patinaWisdom).toBeLessThanOrEqual(10)
    expect(ray.dawnClarity).toBeLessThanOrEqual(10)
    expect(ray.conductivityQuality).toBeLessThanOrEqual(10)
    expect(ray.warmthResilience).toBeLessThanOrEqual(10)
    expect(ray.forgeStrength).toBeLessThanOrEqual(10)
  })

  it('analyzes moderate content', () => {
    const ray = analyzeCopperRay(moderateContent, 'mod.ts')
    expect(ray.file).toBe('mod.ts')
    expect(ray.qualityScore).toBeGreaterThan(20)
    expect(ray.qualityScore).toBeLessThan(70)
  })

  it('analyzes rich content', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    expect(ray.file).toBe('rich.ts')
    expect(ray.qualityScore).toBe(100)
    expect(ray.condition).toBe('masterwork-copper')
    expect(ray.patinaWisdom).toBe(100)
    expect(ray.dawnClarity).toBe(100)
    expect(ray.conductivityQuality).toBe(100)
    expect(ray.warmthResilience).toBe(100)
    expect(ray.forgeStrength).toBe(100)
  })
})

// ─── analyzeCopperForge ────────────────────────────────────────────

describe('analyzeCopperForge', () => {
  it('handles empty rays', () => {
    const forge = analyzeCopperForge([], 'empty')
    expect(forge.directory).toBe('empty')
    expect(forge.rays).toHaveLength(0)
    expect(forge.avgWisdom).toBe(0)
    expect(forge.avgClarity).toBe(0)
    expect(forge.avgStrength).toBe(0)
    expect(forge.masterworkCopperCount).toBe(0)
    expect(forge.scrapCount).toBe(0)
    expect(forge.forgeType).toBe('no-forge')
    expect(forge.condition).toBe('void')
  })

  it('classifies forge with rich rays', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    const forge = analyzeCopperForge([ray], 'src')
    expect(forge.forgeType).toBe('grand-foundry')
    expect(forge.masterworkCopperCount).toBe(1)
    expect(forge.scrapCount).toBe(0)
    expect(forge.avgWisdom).toBe(100)
    expect(forge.condition).toBe('golden-age')
  })

  it('classifies forge with mixed rays', () => {
    const rich = analyzeCopperRay(richContent, 'rich.ts')
    const minimal = analyzeCopperRay(minimalContent, 'mini.ts')
    const forge = analyzeCopperForge([rich, minimal], 'src')
    expect(forge.rays).toHaveLength(2)
    expect(forge.masterworkCopperCount).toBe(1)
    expect(forge.scrapCount).toBe(1)
  })
})

// ─── buildCopperDawnResult ─────────────────────────────────────────

describe('buildCopperDawnResult', async () => {
  it('handles empty input', async () => {
    const result = await buildCopperDawnResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.forges).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuster).toBe(0)
    expect(result.stats.smithGrade).toBe('scrap-collector')
    expect(result.foundry.isMasterwork).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildCopperDawnResult(['test.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.rays[0].condition).toBe('masterwork-copper')
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.masterworkCopperCount).toBe(1)
    expect(result.stats.scrapCount).toBe(0)
  })

  it('analyzes multiple files in different dirs', async () => {
    const result = await buildCopperDawnResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, moderateContent],
    )
    expect(result.rays).toHaveLength(2)
    expect(result.forges).toHaveLength(2)
    expect(result.stats.totalForges).toBe(2)
  })

  it('computes overall stats correctly for rich content', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    expect(result.stats.overallLuster).toBe(100)
    expect(result.stats.smithGrade).toBe('master-smith')
    expect(result.stats.bestRay).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostConductive).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
  })

  it('computes foundry correctly', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    expect(result.foundry.avgWisdom).toBe(100)
    expect(result.foundry.avgClarity).toBe(100)
    expect(result.foundry.avgStrength).toBe(100)
    expect(result.foundry.isMasterwork).toBe(true)
    expect(result.foundry.overallLuster).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', async () => {
  it('returns perfect message when all good', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    const recs = generateRecommendations(result.rays, result.forges, result.foundry, result.stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterwork foundry')
  })

  it('recommends improving wisdom when low', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('patina') || r.includes('wisdom'))).toBe(true)
  })

  it('recommends improving clarity when low', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('clarity') || r.includes('dawn'))).toBe(true)
  })

  it('recommends improving conductivity when low', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('conductivity') || r.includes('efficient'))).toBe(true)
  })

  it('recommends improving warmth when low', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('warmth') || r.includes('error'))).toBe(true)
  })

  it('recommends improving strength when low', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('strength') || r.includes('forge'))).toBe(true)
  })

  it('notes scrap files', async () => {
    const result = await buildCopperDawnResult(['mini.ts'], [minimalContent])
    expect(result.recommendations.some(r => r.includes('scrap'))).toBe(true)
  })

  it('lists specific scrap files when <=3', async () => {
    const result = await buildCopperDawnResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    expect(result.recommendations.some(r => r.includes('a.ts') || r.includes('b.ts'))).toBe(true)
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
    expect(typeof colorGrade('masterwork-copper')).toBe('string')
    expect(typeof colorGrade('scrap')).toBe('string')
    expect(typeof colorGrade('unknown')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('rich.ts')
    expect(output).toContain('Patina Wisdom')
    expect(output).toContain('Dawn Clarity')
    expect(output).toContain('Conductivity')
    expect(output).toContain('Warmth Resilience')
    expect(output).toContain('Forge Strength')
  })
})

describe('formatRaysTable', () => {
  it('returns message for empty rays', () => {
    expect(formatRaysTable([])).toContain('No copper rays')
  })

  it('formats multiple rays', () => {
    const rays = [
      analyzeCopperRay(richContent, 'rich.ts'),
      analyzeCopperRay(minimalContent, 'mini.ts'),
    ]
    const output = formatRaysTable(rays)
    expect(output).toContain('rich.ts')
    expect(output).toContain('mini.ts')
  })
})

describe('formatForgeTable', () => {
  it('formats a forge', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    const forge = analyzeCopperForge([ray], 'src')
    const output = formatForgeTable(forge)
    expect(output).toContain('src')
    expect(output).toContain('Type')
  })
})

describe('formatForgesTable', () => {
  it('returns message for empty forges', () => {
    expect(formatForgesTable([])).toContain('No copper forges')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Copper Dawn Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Smith Grade')
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

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Copper Ray Analysis')
    expect(output).toContain('Copper Forges')
    expect(output).toContain('Copper Dawn Statistics')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats.smithGrade).toBe('master-smith')
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with var and any in aging', () => {
    const m = measureAging('var x: any = 1 as any')
    expect(m.hasNoAdHoc).toBe(false)
    expect(m.hasNoNovel).toBe(false)
  })

  it('handles content with debugger', () => {
    const m = measureAging('function f() { debugger }')
    expect(m.hasNoNaive).toBe(false)
  })

  it('handles content with console.log in conducting', () => {
    const m = measureConducting('console.log("hi")')
    expect(m.hasNoIndirection).toBe(false)
  })

  it('handles content with eval in strengthening', () => {
    const m = measureStrengthening('eval("1")')
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('ray quality score is average of 5 measures', () => {
    const ray = analyzeCopperRay(richContent, 'rich.ts')
    const expected = Math.round(
      ray.patinaWisdom * 0.2 +
      ray.dawnClarity * 0.2 +
      ray.conductivityQuality * 0.2 +
      ray.warmthResilience * 0.2 +
      ray.forgeStrength * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('overall luster is average of wisdom, clarity, strength', async () => {
    const result = await buildCopperDawnResult(['rich.ts'], [richContent])
    const expectedLuster = Math.round((100 + 100 + 100) / 3)
    expect(result.stats.overallLuster).toBe(expectedLuster)
  })
})
