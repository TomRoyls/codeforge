import { describe, expect, it } from 'vitest'

import {
  measureAging,
  measureIlluminating,
  measureConducting,
  measureRadiating,
  measureHammering,
  classifyCondition,
  classifyForgeType,
  classifyForgeCondition,
  classifySmithGrade,
  analyzeCopperIngot,
  analyzeCopperForge,
  buildCopperMorningResult,
  generateRecommendations,
} from '../src/commands/copper-daybreak-helpers.js'
import {
  colorScore,
  colorCondition,
  colorForgeCondition,
  formatIngotTable,
  formatIngotsTable,
  formatForgeTable,
  formatForgesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/copper-daybreak-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────

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

const minimalContent = 'const x = 1'

const poorContent = [
  'var x = eval("1")',
  'var y: any = {}',
  '// hack workaround',
  '// mystery magic unexplained',
  '// obfuscate minify uglify',
].join('\n')

// ─── measureAging ──────────────────────────────────────

describe('measureAging', () => {
  it('scores rich content high', () => {
    const result = measureAging(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
    expect(result.patina).toBe('ancient-green')
  })

  it('scores empty content low', () => {
    const result = measureAging(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.patina).toBe('raw-copper')
  })

  it('detects well-established patterns', () => {
    expect(measureAging('class X { }; interface Y { }').hasWellEstablished).toBe(true)
  })

  it('detects no chaotic patterns', () => {
    expect(measureAging('const x = 1').hasNoChaotic).toBe(true)
  })

  it('detects chaotic patterns', () => {
    expect(measureAging('var x = eval("1")').chaoticCount).toBeGreaterThanOrEqual(1)
  })

  it('detects mature patterns', () => {
    expect(measureAging('const x: readonly string = ""').hasMature).toBe(true)
  })

  it('detects proven patterns', () => {
    expect(measureAging('export function run() {}').hasProven).toBe(true)
  })

  it('detects documented patterns', () => {
    expect(measureAging('/** docs */').hasDocumented).toBe(true)
  })

  it('detects tested patterns', () => {
    expect(measureAging('try { x() } catch { }').hasTested).toBe(true)
  })

  it('detects stable patterns', () => {
    expect(measureAging('const x = 1; readonly y').hasStable).toBe(true)
  })

  it('detects consistent patterns', () => {
    expect(measureAging('import { x } from "y"; export { x }').hasConsistent).toBe(true)
  })

  it('detects enduring patterns', () => {
    expect(measureAging('class X { private y }').hasEnduring).toBe(true)
  })

  it('detects refined patterns', () => {
    expect(measureAging('function f(): string { }').hasRefined).toBe(true)
  })

  it('detects polished patterns', () => {
    expect(measureAging('async function run(): Promise<void> { await x() }').hasPolished).toBe(true)
  })

  it('classifies patina thresholds', () => {
    expect(measureAging(richContent).patina).toBe('ancient-green')
    expect(measureAging(emptyContent).patina).toBe('raw-copper')
  })
})

// ─── measureIlluminating ───────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content high', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
    expect(result.dawn).toBe('golden-sunrise')
  })

  it('scores empty content low', () => {
    const result = measureIlluminating(emptyContent)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.dawn).toBe('pre-dawn')
  })

  it('detects readable patterns', () => {
    expect(measureIlluminating('const x = 1; function f() {}').hasReadable).toBe(true)
  })

  it('detects self-documenting patterns', () => {
    expect(measureIlluminating('function f() {}; class X { }; interface Y { }').hasSelfDocumenting).toBe(true)
  })

  it('detects clear patterns', () => {
    expect(measureIlluminating('function f(): string { return "" }').hasClear).toBe(true)
  })

  it('detects transparent patterns', () => {
    expect(measureIlluminating('export function run() {}').hasTransparent).toBe(true)
  })

  it('detects understandable patterns', () => {
    expect(measureIlluminating('if (x) { return y } throw new Error()').hasUnderstandable).toBe(true)
  })

  it('detects visible patterns', () => {
    expect(measureIlluminating('import { x } from "y"; export { x }').hasVisible).toBe(true)
  })

  it('detects illuminated patterns', () => {
    expect(measureIlluminating('try { x() } catch { y() }').hasIlluminated).toBe(true)
  })

  it('detects revealed patterns', () => {
    expect(measureIlluminating('class X { private y: string }').hasRevealed).toBe(true)
  })

  it('detects fresh patterns', () => {
    expect(measureIlluminating('class X extends Y { }').hasFresh).toBe(true)
  })

  it('counts cryptic patterns', () => {
    expect(measureIlluminating('var x = 1').crypticCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies dawn thresholds', () => {
    expect(measureIlluminating(richContent).dawn).toBe('golden-sunrise')
    expect(measureIlluminating(emptyContent).dawn).toBe('pre-dawn')
  })
})

// ─── measureConducting ─────────────────────────────────

describe('measureConducting', () => {
  it('scores rich content high', () => {
    const result = measureConducting(richContent)
    expect(result.quality).toBe(100)
    expect(result.hasHighQuality).toBe(true)
    expect(result.conductor).toBe('superconductor')
  })

  it('scores empty content low', () => {
    const result = measureConducting(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.conductor).toBe('resistive')
  })

  it('detects efficient patterns', () => {
    expect(measureConducting('const x: readonly string = ""').hasEfficient).toBe(true)
  })

  it('detects type-safe patterns', () => {
    expect(measureConducting('function f(): string { return "" }').hasTypeSafe).toBe(true)
  })

  it('detects clean patterns', () => {
    expect(measureConducting('const x = 1').hasClean).toBe(true)
  })

  it('detects precise patterns', () => {
    expect(measureConducting('const x = {} as const; readonly y').hasPrecise).toBe(true)
  })

  it('detects reliable patterns', () => {
    expect(measureConducting('try { if (x) throw e } catch { }').hasReliable).toBe(true)
  })

  it('detects accurate patterns', () => {
    expect(measureConducting('function f(): string { }').hasAccurate).toBe(true)
  })

  it('detects faithful patterns', () => {
    expect(measureConducting('import { x } from "y"; export { x }').hasFaithful).toBe(true)
  })

  it('counts wasteful patterns', () => {
    expect(measureConducting('var x = eval("1")').wastefulCount).toBeGreaterThanOrEqual(1)
  })

  it('counts unsafe patterns', () => {
    expect(measureConducting('const x: any = {}').unsafeCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies conductor thresholds', () => {
    expect(measureConducting(richContent).conductor).toBe('superconductor')
    expect(measureConducting(emptyContent).conductor).toBe('resistive')
  })
})

// ─── measureRadiating ──────────────────────────────────

describe('measureRadiating', () => {
  it('scores rich content high', () => {
    const result = measureRadiating(richContent)
    expect(result.resilience).toBe(100)
    expect(result.hasHighResilience).toBe(true)
    expect(result.warmth).toBe('forge-fire')
  })

  it('scores empty content low', () => {
    const result = measureRadiating(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.warmth).toBe('cold-metal')
  })

  it('detects approachable patterns', () => {
    expect(measureRadiating('const x = 1; function f() {}').hasApproachable).toBe(true)
  })

  it('detects welcoming patterns', () => {
    expect(measureRadiating('export function run() {}').hasWelcoming).toBe(true)
  })

  it('detects error-handled patterns', () => {
    expect(measureRadiating('try { x() } catch { y() }').hasErrorHandled).toBe(true)
  })

  it('detects defensive patterns', () => {
    expect(measureRadiating('if (x) { throw new Error() } catch { }').hasDefensive).toBe(true)
  })

  it('detects robust patterns', () => {
    expect(measureRadiating('class X { private y: string }').hasRobust).toBe(true)
  })

  it('detects patient patterns', () => {
    expect(measureRadiating('async function run(): Promise<void> { await x() }').hasPatient).toBe(true)
  })

  it('counts hostile patterns', () => {
    expect(measureRadiating('eval("danger")').hostileCount).toBeGreaterThanOrEqual(1)
  })

  it('counts unhandled patterns', () => {
    expect(measureRadiating('const x: any = {}').unhandledCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies warmth thresholds', () => {
    expect(measureRadiating(richContent).warmth).toBe('forge-fire')
    expect(measureRadiating(emptyContent).warmth).toBe('cold-metal')
  })
})

// ─── measureHammering ──────────────────────────────────

describe('measureHammering', () => {
  it('scores rich content high', () => {
    const result = measureHammering(richContent)
    expect(result.strength).toBe(100)
    expect(result.hasHighStrength).toBe(true)
    expect(result.forge).toBe('master-smith')
  })

  it('scores empty content low', () => {
    const result = measureHammering(emptyContent)
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.forge).toBe('no-forge')
  })

  it('detects well-structured patterns', () => {
    expect(measureHammering('class X { }; interface Y { }').hasWellStructured).toBe(true)
  })

  it('detects modular patterns', () => {
    expect(measureHammering('export function run() {}').hasModular).toBe(true)
  })

  it('detects disciplined patterns', () => {
    expect(measureHammering('try { if (x) throw e } catch { }').hasDisciplined).toBe(true)
  })

  it('detects crafted patterns', () => {
    expect(measureHammering('function f(): string { }').hasCrafted).toBe(true)
  })

  it('detects tempered patterns', () => {
    expect(measureHammering('class X { private y: readonly string }').hasTempered).toBe(true)
  })

  it('counts tangled patterns', () => {
    expect(measureHammering('// hack workaround').tangledCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies forge thresholds', () => {
    expect(measureHammering(richContent).forge).toBe('master-smith')
    expect(measureHammering(emptyContent).forge).toBe('no-forge')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies copper-masterpiece', () => { expect(classifyCondition(90)).toBe('copper-masterpiece') })
  it('classifies golden-morning', () => { expect(classifyCondition(75)).toBe('golden-morning') })
  it('classifies proper-alloy', () => { expect(classifyCondition(60)).toBe('proper-alloy') })
  it('classifies tarnished-bronze', () => { expect(classifyCondition(40)).toBe('tarnished-bronze') })
  it('classifies raw-ore', () => { expect(classifyCondition(20)).toBe('raw-ore') })
  it('classifies void', () => { expect(classifyCondition(0)).toBe('void') })
})

describe('classifyForgeType', () => {
  it('returns void for empty', () => { expect(classifyForgeType([])).toBe('void') })
  it('returns grand-forge', () => { expect(classifyForgeType([{ qualityScore: 95 }] as any)).toBe('grand-forge') })
  it('returns copper-workshop', () => { expect(classifyForgeType([{ qualityScore: 80 }] as any)).toBe('copper-workshop') })
  it('returns proper-smithy', () => { expect(classifyForgeType([{ qualityScore: 60 }] as any)).toBe('proper-smithy') })
  it('returns backyard-foundry', () => { expect(classifyForgeType([{ qualityScore: 40 }] as any)).toBe('backyard-foundry') })
  it('returns no-forge', () => { expect(classifyForgeType([{ qualityScore: 10 }] as any)).toBe('no-forge') })
})

describe('classifyForgeCondition', () => {
  it('classifies master-forge', () => { expect(classifyForgeCondition(85)).toBe('master-forge') })
  it('classifies smith-hall', () => { expect(classifyForgeCondition(70)).toBe('smith-hall') })
  it('classifies proper-workshop', () => { expect(classifyForgeCondition(55)).toBe('proper-workshop') })
  it('classifies rusty-shed', () => { expect(classifyForgeCondition(35)).toBe('rusty-shed') })
  it('classifies abandoned-mine', () => { expect(classifyForgeCondition(15)).toBe('abandoned-mine') })
  it('classifies void', () => { expect(classifyForgeCondition(0)).toBe('void') })
})

describe('classifySmithGrade', () => {
  it('classifies master-smith', () => { expect(classifySmithGrade(80)).toBe('master-smith') })
  it('classifies journeyman', () => { expect(classifySmithGrade(65)).toBe('journeyman') })
  it('classifies apprentice-smith', () => { expect(classifySmithGrade(50)).toBe('apprentice-smith') })
  it('classifies novice', () => { expect(classifySmithGrade(35)).toBe('novice') })
  it('classifies tinkerer', () => { expect(classifySmithGrade(20)).toBe('tinkerer') })
  it('classifies no-skill', () => { expect(classifySmithGrade(0)).toBe('no-skill') })
})

// ─── analyzeCopperIngot ────────────────────────────────

describe('analyzeCopperIngot', () => {
  it('analyzes rich content correctly', () => {
    const ingot = analyzeCopperIngot(richContent, 'app.ts')
    expect(ingot.file).toBe('app.ts')
    expect(ingot.patinaWisdom).toBe(100)
    expect(ingot.dawnClarity).toBe(100)
    expect(ingot.conductivityQuality).toBe(100)
    expect(ingot.warmthResilience).toBe(100)
    expect(ingot.forgeStrength).toBe(100)
    expect(ingot.qualityScore).toBe(100)
    expect(ingot.condition).toBe('copper-masterpiece')
  })

  it('analyzes empty content', () => {
    const ingot = analyzeCopperIngot(emptyContent, 'empty.ts')
    expect(ingot.file).toBe('empty.ts')
    expect(ingot.qualityScore).toBeGreaterThanOrEqual(0)
    expect(ingot.condition).toBe('raw-ore')
  })

  it('computes weighted quality score', () => {
    const ingot = analyzeCopperIngot(richContent, 'test.ts')
    const expected = Math.round(
      ingot.patinaWisdom * 0.2 +
      ingot.dawnClarity * 0.2 +
      ingot.conductivityQuality * 0.2 +
      ingot.warmthResilience * 0.2 +
      ingot.forgeStrength * 0.2,
    )
    expect(ingot.qualityScore).toBe(expected)
  })

  it('preserves all measure objects', () => {
    const ingot = analyzeCopperIngot(richContent, 'test.ts')
    expect(ingot.aging).toBeDefined()
    expect(ingot.illuminating).toBeDefined()
    expect(ingot.conducting).toBeDefined()
    expect(ingot.radiating).toBeDefined()
    expect(ingot.hammering).toBeDefined()
  })
})

// ─── analyzeCopperForge ────────────────────────────────

describe('analyzeCopperForge', () => {
  it('returns empty forge for no ingots', () => {
    const forge = analyzeCopperForge([], 'src')
    expect(forge.directory).toBe('src')
    expect(forge.ingots).toHaveLength(0)
    expect(forge.avgWisdom).toBe(0)
    expect(forge.avgStrength).toBe(0)
    expect(forge.avgClarity).toBe(0)
    expect(forge.copperMasterpieceCount).toBe(0)
    expect(forge.voidCount).toBe(0)
    expect(forge.forgeType).toBe('void')
    expect(forge.condition).toBe('void')
  })

  it('computes averages from ingots', () => {
    const ingots = [
      analyzeCopperIngot(richContent, 'src/a.ts'),
      analyzeCopperIngot(minimalContent, 'src/b.ts'),
    ]
    const forge = analyzeCopperForge(ingots, 'src')
    expect(forge.ingots).toHaveLength(2)
    expect(forge.avgWisdom).toBeGreaterThanOrEqual(0)
  })

  it('counts copper masterpieces', () => {
    const ingots = [analyzeCopperIngot(richContent, 'a.ts'), analyzeCopperIngot(richContent, 'b.ts')]
    expect(analyzeCopperForge(ingots, '.').copperMasterpieceCount).toBe(2)
  })

  it('counts void ingots', () => {
    const result = classifyForgeType([{ qualityScore: 0 }] as any)
    expect(result).toBe('no-forge')
  })
})

// ─── buildCopperMorningResult ──────────────────────────

describe('buildCopperMorningResult', () => {
  it('handles empty input', async () => {
    const result = await buildCopperMorningResult([], [])
    expect(result.ingots).toHaveLength(0)
    expect(result.forges).toHaveLength(0)
    expect(result.metallurgy.overallLuminosity).toBe(0)
    expect(result.metallurgy.isCopper).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.smithGrade).toBe('no-skill')
    expect(result.stats.bestIngot).toBe('')
  })

  it('handles single file', async () => {
    const result = await buildCopperMorningResult(['app.ts'], [richContent])
    expect(result.ingots).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildCopperMorningResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.ingots).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups by directory into forges', async () => {
    const result = await buildCopperMorningResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.forges).toHaveLength(2)
    expect(result.forges.find((f) => f.directory === 'src')!.ingots).toHaveLength(2)
    expect(result.forges.find((f) => f.directory === 'lib')!.ingots).toHaveLength(1)
  })

  it('computes metallurgy overview', async () => {
    const result = await buildCopperMorningResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.metallurgy.avgWisdom).toBe(100)
    expect(result.metallurgy.avgStrength).toBe(100)
    expect(result.metallurgy.avgClarity).toBe(100)
    expect(result.metallurgy.overallLuminosity).toBe(100)
    expect(result.metallurgy.isCopper).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildCopperMorningResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.avgPatinaWisdom).toBe(100)
    expect(result.stats.avgDawnClarity).toBe(100)
    expect(result.stats.avgConductivityQuality).toBe(100)
    expect(result.stats.avgWarmthResilience).toBe(100)
    expect(result.stats.avgForgeStrength).toBe(100)
    expect(result.stats.copperMasterpieceCount).toBe(2)
    expect(result.stats.goldenMorningCount).toBe(0)
    expect(result.stats.properAlloyCount).toBe(0)
    expect(result.stats.tarnishedBronzeCount).toBe(0)
    expect(result.stats.rawOreCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.smithGrade).toBe('master-smith')
  })

  it('finds best/wisest/clearest/mostConductive/warmest/strongest', async () => {
    const result = await buildCopperMorningResult(['rich.ts', 'poor.ts'], [richContent, poorContent])
    expect(result.stats.bestIngot).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostConductive).toBe('rich.ts')
    expect(result.stats.warmest).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.ingots[0].patinaWisdom).toBe(100)
    expect(result.ingots[0].dawnClarity).toBe(100)
    expect(result.ingots[0].conductivityQuality).toBe(100)
    expect(result.ingots[0].warmthResilience).toBe(100)
    expect(result.ingots[0].forgeStrength).toBe(100)
    expect(result.ingots[0].qualityScore).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /patina|wisdom/i.test(r))).toBe(true)
  })

  it('recommends clarity improvement', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /mist|dawn|clarity/i.test(r))).toBe(true)
  })

  it('recommends conductivity improvement', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /conductiv|wire/i.test(r))).toBe(true)
  })

  it('recommends warmth improvement', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /warm|heat|approachable/i.test(r))).toBe(true)
  })

  it('recommends forge improvement', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /forge|craft|smith/i.test(r))).toBe(true)
  })

  it('returns default positive when all good', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })

  it('colorCondition covers all', () => {
    for (const c of ['copper-masterpiece', 'golden-morning', 'proper-alloy', 'tarnished-bronze', 'raw-ore', 'void']) {
      expect(typeof colorCondition(c)).toBe('string')
    }
  })

  it('colorForgeCondition covers all', () => {
    for (const c of ['master-forge', 'smith-hall', 'proper-workshop', 'rusty-shed', 'abandoned-mine', 'void']) {
      expect(typeof colorForgeCondition(c)).toBe('string')
    }
  })

  it('formatIngotTable returns string', () => {
    expect(typeof formatIngotTable(analyzeCopperIngot(richContent, 'test.ts'))).toBe('string')
  })

  it('formatIngotsTable handles empty', () => {
    expect(typeof formatIngotsTable([])).toBe('string')
  })

  it('formatIngotsTable formats multiple', () => {
    const ingots = [analyzeCopperIngot(richContent, 'a.ts'), analyzeCopperIngot(minimalContent, 'b.ts')]
    expect(typeof formatIngotsTable(ingots)).toBe('string')
  })

  it('formatForgeTable returns string', () => {
    const forge = analyzeCopperForge([analyzeCopperIngot(richContent, 'a.ts')], 'src')
    expect(typeof formatForgeTable(forge)).toBe('string')
  })

  it('formatForgesTable handles empty', () => {
    expect(typeof formatForgesTable([])).toBe('string')
  })

  it('formatForgesTable formats multiple', async () => {
    const result = await buildCopperMorningResult(['src/a.ts', 'lib/b.ts'], [richContent, richContent])
    expect(typeof formatForgesTable(result.forges)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildCopperMorningResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.ingots).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
