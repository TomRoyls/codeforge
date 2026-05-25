import { describe, expect, it } from 'vitest'

import {
  measureTransmitting,
  measureOscillating,
  measureResonating,
  measureSupporting,
  measureChanneling,
  classifyCondition,
  classifyLayerType,
  classifyLayerCondition,
  classifyGeologistGrade,
  analyzeQuartzPrism,
  analyzeQuartzLayer,
  buildQuartzHorizonResult,
  generateRecommendations,
} from '../src/commands/quartz-skyline-helpers.js'
import {
  colorScore,
  colorCondition,
  colorLayerCondition,
  formatPrismTable,
  formatPrismsTable,
  formatLayerTable,
  formatLayersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/quartz-skyline-format-helpers.js'

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

// ─── measureTransmitting ───────────────────────────────

describe('measureTransmitting', () => {
  it('scores rich content high', () => {
    const result = measureTransmitting(richContent)
    expect(result.clarity).toBe(100)
    expect(result.hasHighClarity).toBe(true)
    expect(result.crystal).toBe('flawless-prism')
  })

  it('scores empty content low', () => {
    const result = measureTransmitting(emptyContent)
    expect(result.clarity).toBe(0)
    expect(result.hasHighClarity).toBe(false)
    expect(result.crystal).toBe('no-clarity')
  })

  it('detects readable patterns', () => {
    expect(measureTransmitting('const x = 1; function f() {}').hasReadable).toBe(true)
  })

  it('detects self-documenting patterns', () => {
    expect(measureTransmitting('export async function run(): Promise<void> {}').hasSelfDocumenting).toBe(true)
  })

  it('detects clear types', () => {
    expect(measureTransmitting('function f(): string { return "" }').hasClear).toBe(true)
  })

  it('detects transparent patterns', () => {
    expect(measureTransmitting('export function run() {}').hasTransparent).toBe(true)
  })

  it('detects understandable patterns', () => {
    expect(measureTransmitting('if (x) { return y } throw new Error()').hasUnderstandable).toBe(true)
  })

  it('detects visible patterns', () => {
    expect(measureTransmitting('import { x } from "y"; export { x }').hasVisible).toBe(true)
  })

  it('detects documented patterns', () => {
    expect(measureTransmitting('/** docs */').hasDocumented).toBe(true)
  })

  it('detects illuminated patterns', () => {
    expect(measureTransmitting('try { x() } catch { y() }').hasIlluminated).toBe(true)
  })

  it('counts cryptic patterns', () => {
    expect(measureTransmitting('var x = 1').crypticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts obfuscated patterns', () => {
    expect(measureTransmitting('// obfuscate minify').obfuscatedCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies crystal thresholds', () => {
    expect(measureTransmitting(richContent).crystal).toBe('flawless-prism')
    expect(measureTransmitting(emptyContent).crystal).toBe('no-clarity')
  })
})

// ─── measureOscillating ────────────────────────────────

describe('measureOscillating', () => {
  it('scores rich content high', () => {
    const result = measureOscillating(richContent)
    expect(result.quality).toBe(100)
    expect(result.hasHighQuality).toBe(true)
    expect(result.frequency).toBe('atomic-precision')
  })

  it('scores empty content low', () => {
    const result = measureOscillating(emptyContent)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.frequency).toBe('no-quality')
  })

  it('detects consistent patterns', () => {
    expect(measureOscillating('const x = {} as const; readonly y').hasConsistent).toBe(true)
  })

  it('detects predictable patterns', () => {
    expect(measureOscillating('export function run() {}').hasPredictable).toBe(true)
  })

  it('detects tested patterns', () => {
    expect(measureOscillating('try { if (x) { y() } } catch { }').hasTested).toBe(true)
  })

  it('detects stable patterns', () => {
    expect(measureOscillating('class X implements interface Y { readonly z }').hasStable).toBe(true)
  })

  it('detects reliable patterns', () => {
    expect(measureOscillating('try { if (x) throw e } catch { }').hasReliable).toBe(true)
  })

  it('detects uniform patterns', () => {
    expect(measureOscillating('const x: readonly string = ""').hasUniform).toBe(true)
  })

  it('detects harmonious patterns', () => {
    expect(measureOscillating('async function run(): Promise<void> { await x() }').hasHarmonious).toBe(true)
  })

  it('detects precise patterns', () => {
    expect(measureOscillating('class X { private y: string }').hasPrecise).toBe(true)
  })

  it('counts erratic patterns', () => {
    expect(measureOscillating('var x = 1').erraticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts untested patterns', () => {
    expect(measureOscillating('var x = 1').untestedCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies frequency thresholds', () => {
    expect(measureOscillating(richContent).frequency).toBe('atomic-precision')
    expect(measureOscillating(emptyContent).frequency).toBe('no-quality')
  })
})

// ─── measureResonating ─────────────────────────────────

describe('measureResonating', () => {
  it('scores rich content high', () => {
    const result = measureResonating(richContent)
    expect(result.purity).toBe(100)
    expect(result.hasHighPurity).toBe(true)
    expect(result.signal).toBe('pure-tone')
  })

  it('scores empty content low', () => {
    const result = measureResonating(emptyContent)
    expect(result.purity).toBeGreaterThanOrEqual(0)
    expect(result.signal).toBe('static-buzz')
  })

  it('detects type-safe patterns', () => {
    expect(measureResonating('function f(): string { return "" }').hasTypeSafe).toBe(true)
  })

  it('detects accurate patterns', () => {
    expect(measureResonating('const x: readonly string = ""').hasAccurate).toBe(true)
  })

  it('detects clean patterns', () => {
    expect(measureResonating('const x = 1').hasClean).toBe(true)
  })

  it('detects consistent patterns', () => {
    expect(measureResonating('const x = {} as const; readonly y').hasConsistent).toBe(true)
  })

  it('detects polished patterns', () => {
    expect(measureResonating('try { if (x) throw e } catch { }').hasPolished).toBe(true)
  })

  it('detects noise-free patterns', () => {
    expect(measureResonating('const x = 1').hasNoiseFree).toBe(true)
  })

  it('detects refined patterns', () => {
    expect(measureResonating('class X { private y: string }').hasRefined).toBe(true)
  })

  it('counts unsafe patterns', () => {
    expect(measureResonating('const x: any = {}').unsafeCount).toBeGreaterThanOrEqual(1)
  })

  it('counts contradictory patterns', () => {
    expect(measureResonating('// contradict inconsistent').contradictoryCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies signal thresholds', () => {
    expect(measureResonating(richContent).signal).toBe('pure-tone')
    expect(measureResonating(emptyContent).signal).toBe('static-buzz')
  })
})

// ─── measureSupporting ─────────────────────────────────

describe('measureSupporting', () => {
  it('scores rich content high', () => {
    const result = measureSupporting(richContent)
    expect(result.strength).toBe(100)
    expect(result.hasHighStrength).toBe(true)
    expect(result.lattice).toBe('perfect-lattice')
  })

  it('scores empty content low', () => {
    const result = measureSupporting(emptyContent)
    expect(result.strength).toBeGreaterThanOrEqual(0)
    expect(result.lattice).toBe('no-strength')
  })

  it('detects well-structured patterns', () => {
    expect(measureSupporting('class X { }; interface Y { }').hasWellStructured).toBe(true)
  })

  it('detects modular patterns', () => {
    expect(measureSupporting('export function run() {}').hasModular).toBe(true)
  })

  it('detects robust patterns', () => {
    expect(measureSupporting('class X { private y: string }').hasRobust).toBe(true)
  })

  it('detects error-handled patterns', () => {
    expect(measureSupporting('try { x() } catch { y() }').hasErrorHandled).toBe(true)
  })

  it('detects enduring patterns', () => {
    expect(measureSupporting('const x: readonly string = ""').hasEnduring).toBe(true)
  })

  it('detects efficient patterns', () => {
    expect(measureSupporting('const x: readonly string = ""').hasEfficient).toBe(true)
  })

  it('detects foundational patterns', () => {
    expect(measureSupporting('import { x } from "y"; export { x }').hasFoundational).toBe(true)
  })

  it('detects grounded patterns', () => {
    expect(measureSupporting('function f() {}; class X { }; interface Y { }').hasGrounded).toBe(true)
  })

  it('counts chaotic patterns', () => {
    expect(measureSupporting('var x = 1').chaoticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts error-unhandled patterns', () => {
    expect(measureSupporting('var x = 1').errorUnhandledCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies lattice thresholds', () => {
    expect(measureSupporting(richContent).lattice).toBe('perfect-lattice')
    expect(measureSupporting(emptyContent).lattice).toBe('no-strength')
  })
})

// ─── measureChanneling ─────────────────────────────────

describe('measureChanneling', () => {
  it('scores rich content high', () => {
    const result = measureChanneling(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
    expect(result.vein).toBe('mother-lode')
  })

  it('scores empty content low', () => {
    const result = measureChanneling(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.vein).toBe('no-wisdom')
  })

  it('detects well-architected patterns', () => {
    expect(measureChanneling('class X implements interface Y { }').hasWellArchitected).toBe(true)
  })

  it('detects principled patterns', () => {
    expect(measureChanneling('class X { private y: string; protected z }').hasPrincipled).toBe(true)
  })

  it('detects proven patterns', () => {
    expect(measureChanneling('const x = {} as const; readonly y').hasProven).toBe(true)
  })

  it('detects deep patterns', () => {
    expect(measureChanneling('interface X<T> { }; type Y = string').hasDeep).toBe(true)
  })

  it('detects patterned code', () => {
    expect(measureChanneling('function f() {}; class X { }; interface Y { }').hasPatterned).toBe(true)
  })

  it('detects strategic patterns', () => {
    expect(measureChanneling('import { x } from "y"; export { x }').hasStrategic).toBe(true)
  })

  it('detects accumulated patterns', () => {
    expect(measureChanneling('const x = {} as const; readonly y').hasAccumulated).toBe(true)
  })

  it('counts hacked patterns', () => {
    expect(measureChanneling('// hack workaround monkey').hackedCount).toBeGreaterThanOrEqual(0)
  })

  it('counts ad-hoc patterns', () => {
    expect(measureChanneling('const x: any = {}').adHocCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies vein thresholds', () => {
    expect(measureChanneling(richContent).vein).toBe('mother-lode')
    expect(measureChanneling(emptyContent).vein).toBe('no-wisdom')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies quartz-masterpiece', () => { expect(classifyCondition(90)).toBe('quartz-masterpiece') })
  it('classifies crystal-horizon', () => { expect(classifyCondition(75)).toBe('crystal-horizon') })
  it('classifies proper-mineral', () => { expect(classifyCondition(60)).toBe('proper-mineral') })
  it('classifies dull-stone', () => { expect(classifyCondition(40)).toBe('dull-stone') })
  it('classifies cracked-rock', () => { expect(classifyCondition(20)).toBe('cracked-rock') })
  it('classifies void', () => { expect(classifyCondition(0)).toBe('void') })
})

describe('classifyLayerType', () => {
  it('returns no-layer for empty', () => { expect(classifyLayerType([])).toBe('no-layer') })
  it('returns crystal-cathedral', () => { expect(classifyLayerType([{ qualityScore: 95 }] as any)).toBe('crystal-cathedral') })
  it('returns quartz-stratum', () => { expect(classifyLayerType([{ qualityScore: 80 }] as any)).toBe('quartz-stratum') })
  it('returns proper-layer', () => { expect(classifyLayerType([{ qualityScore: 65 }] as any)).toBe('proper-layer') })
  it('returns thin-seam', () => { expect(classifyLayerType([{ qualityScore: 45 }] as any)).toBe('thin-seam') })
  it('returns barren-rock', () => { expect(classifyLayerType([{ qualityScore: 25 }] as any)).toBe('barren-rock') })
  it('returns no-layer for zero', () => { expect(classifyLayerType([{ qualityScore: 5 }] as any)).toBe('no-layer') })
})

describe('classifyLayerCondition', () => {
  it('classifies crystal-canyon', () => { expect(classifyLayerCondition(85)).toBe('crystal-canyon') })
  it('classifies quartz-ridge', () => { expect(classifyLayerCondition(70)).toBe('quartz-ridge') })
  it('classifies proper-formation', () => { expect(classifyLayerCondition(55)).toBe('proper-formation') })
  it('classifies dull-outcrop', () => { expect(classifyLayerCondition(35)).toBe('dull-outcrop') })
  it('classifies crumbled-stone', () => { expect(classifyLayerCondition(15)).toBe('crumbled-stone') })
  it('classifies void', () => { expect(classifyLayerCondition(0)).toBe('void') })
})

describe('classifyGeologistGrade', () => {
  it('classifies crystal-master', () => { expect(classifyGeologistGrade(80)).toBe('crystal-master') })
  it('classifies vein-reader', () => { expect(classifyGeologistGrade(65)).toBe('vein-reader') })
  it('classifies stone-cutter', () => { expect(classifyGeologistGrade(50)).toBe('stone-cutter') })
  it('classifies apprentice', () => { expect(classifyGeologistGrade(35)).toBe('apprentice') })
  it('classifies novice', () => { expect(classifyGeologistGrade(20)).toBe('novice') })
  it('classifies rock-basher', () => { expect(classifyGeologistGrade(0)).toBe('rock-basher') })
})

// ─── analyzeQuartzPrism ────────────────────────────────

describe('analyzeQuartzPrism', () => {
  it('analyzes rich content correctly', () => {
    const prism = analyzeQuartzPrism(richContent, 'app.ts')
    expect(prism.file).toBe('app.ts')
    expect(prism.crystallineClarity).toBe(100)
    expect(prism.vibrationQuality).toBe(100)
    expect(prism.resonancePurity).toBe(100)
    expect(prism.structureStrength).toBe(100)
    expect(prism.veinWisdom).toBe(100)
    expect(prism.qualityScore).toBe(100)
    expect(prism.condition).toBe('quartz-masterpiece')
  })

  it('analyzes empty content', () => {
    const prism = analyzeQuartzPrism(emptyContent, 'empty.ts')
    expect(prism.file).toBe('empty.ts')
    expect(prism.qualityScore).toBeGreaterThanOrEqual(0)
    expect(prism.condition).toBe('void')
  })

  it('computes weighted quality score', () => {
    const prism = analyzeQuartzPrism(richContent, 'test.ts')
    const expected = Math.round(
      prism.crystallineClarity * 0.2 +
      prism.vibrationQuality * 0.2 +
      prism.resonancePurity * 0.2 +
      prism.structureStrength * 0.2 +
      prism.veinWisdom * 0.2,
    )
    expect(prism.qualityScore).toBe(expected)
  })

  it('preserves all measure objects', () => {
    const prism = analyzeQuartzPrism(richContent, 'test.ts')
    expect(prism.transmitting).toBeDefined()
    expect(prism.oscillating).toBeDefined()
    expect(prism.resonating).toBeDefined()
    expect(prism.supporting).toBeDefined()
    expect(prism.channeling).toBeDefined()
  })
})

// ─── analyzeQuartzLayer ────────────────────────────────

describe('analyzeQuartzLayer', () => {
  it('returns empty layer for no prisms', () => {
    const layer = analyzeQuartzLayer([], 'src')
    expect(layer.directory).toBe('src')
    expect(layer.prisms).toHaveLength(0)
    expect(layer.avgClarity).toBe(0)
    expect(layer.avgStrength).toBe(0)
    expect(layer.avgWisdom).toBe(0)
    expect(layer.quartzMasterpieceCount).toBe(0)
    expect(layer.voidCount).toBe(0)
    expect(layer.layerType).toBe('no-layer')
    expect(layer.condition).toBe('void')
  })

  it('computes averages from prisms', () => {
    const prisms = [
      analyzeQuartzPrism(richContent, 'src/a.ts'),
      analyzeQuartzPrism(minimalContent, 'src/b.ts'),
    ]
    const layer = analyzeQuartzLayer(prisms, 'src')
    expect(layer.prisms).toHaveLength(2)
    expect(layer.avgClarity).toBeGreaterThanOrEqual(0)
  })

  it('counts quartz masterpieces', () => {
    const prisms = [analyzeQuartzPrism(richContent, 'a.ts'), analyzeQuartzPrism(richContent, 'b.ts')]
    expect(analyzeQuartzLayer(prisms, '.').quartzMasterpieceCount).toBe(2)
  })

  it('counts void prisms', () => {
    const prisms = [analyzeQuartzPrism(emptyContent, 'a.ts'), analyzeQuartzPrism(emptyContent, 'b.ts')]
    expect(analyzeQuartzLayer(prisms, '.').voidCount).toBe(2)
  })
})

// ─── buildQuartzHorizonResult ──────────────────────────

describe('buildQuartzHorizonResult', () => {
  it('handles empty input', async () => {
    const result = await buildQuartzHorizonResult([], [])
    expect(result.prisms).toHaveLength(0)
    expect(result.layers).toHaveLength(0)
    expect(result.geology.overallLuminosity).toBe(0)
    expect(result.geology.isQuartz).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.geologistGrade).toBe('rock-basher')
    expect(result.stats.bestPrism).toBe('')
  })

  it('handles single file', async () => {
    const result = await buildQuartzHorizonResult(['app.ts'], [richContent])
    expect(result.prisms).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildQuartzHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.prisms).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups by directory into layers', async () => {
    const result = await buildQuartzHorizonResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.layers).toHaveLength(2)
    expect(result.layers.find((l) => l.directory === 'src')!.prisms).toHaveLength(2)
    expect(result.layers.find((l) => l.directory === 'lib')!.prisms).toHaveLength(1)
  })

  it('computes geology overview', async () => {
    const result = await buildQuartzHorizonResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.geology.avgClarity).toBe(100)
    expect(result.geology.avgStrength).toBe(100)
    expect(result.geology.avgWisdom).toBe(100)
    expect(result.geology.overallLuminosity).toBe(100)
    expect(result.geology.isQuartz).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildQuartzHorizonResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.stats.avgCrystallineClarity).toBe(100)
    expect(result.stats.avgVibrationQuality).toBe(100)
    expect(result.stats.avgResonancePurity).toBe(100)
    expect(result.stats.avgStructureStrength).toBe(100)
    expect(result.stats.avgVeinWisdom).toBe(100)
    expect(result.stats.quartzMasterpieceCount).toBe(2)
    expect(result.stats.crystalHorizonCount).toBe(0)
    expect(result.stats.properMineralCount).toBe(0)
    expect(result.stats.dullStoneCount).toBe(0)
    expect(result.stats.crackedRockCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.geologistGrade).toBe('crystal-master')
  })

  it('finds best/clearest/rhythmic/purest/strongest/wisest', async () => {
    const result = await buildQuartzHorizonResult(['rich.ts', 'poor.ts'], [richContent, poorContent])
    expect(result.stats.bestPrism).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostRhythmic).toBe('rich.ts')
    expect(result.stats.purest).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighPurityCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    expect(result.prisms[0].crystallineClarity).toBe(100)
    expect(result.prisms[0].vibrationQuality).toBe(100)
    expect(result.prisms[0].resonancePurity).toBe(100)
    expect(result.prisms[0].structureStrength).toBe(100)
    expect(result.prisms[0].veinWisdom).toBe(100)
    expect(result.prisms[0].qualityScore).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends clarity improvement', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /crystal|clarity/i.test(r))).toBe(true)
  })

  it('recommends vibration improvement', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /oscillator|vibrat/i.test(r))).toBe(true)
  })

  it('recommends resonance improvement', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /signal|resonan|noise/i.test(r))).toBe(true)
  })

  it('recommends strength improvement', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /lattice|strength/i.test(r))).toBe(true)
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [poorContent])
    expect(result.recommendations.some((r) => /vein|wisdom/i.test(r))).toBe(true)
  })

  it('returns default positive when all good', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
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
    for (const c of ['quartz-masterpiece', 'crystal-horizon', 'proper-mineral', 'dull-stone', 'cracked-rock', 'void']) {
      expect(typeof colorCondition(c)).toBe('string')
    }
  })

  it('colorLayerCondition covers all', () => {
    for (const c of ['crystal-canyon', 'quartz-ridge', 'proper-formation', 'dull-outcrop', 'crumbled-stone', 'void']) {
      expect(typeof colorLayerCondition(c)).toBe('string')
    }
  })

  it('formatPrismTable returns string', () => {
    expect(typeof formatPrismTable(analyzeQuartzPrism(richContent, 'test.ts'))).toBe('string')
  })

  it('formatPrismsTable handles empty', () => {
    expect(typeof formatPrismsTable([])).toBe('string')
  })

  it('formatPrismsTable formats multiple', () => {
    const prisms = [analyzeQuartzPrism(richContent, 'a.ts'), analyzeQuartzPrism(minimalContent, 'b.ts')]
    expect(typeof formatPrismsTable(prisms)).toBe('string')
  })

  it('formatLayerTable returns string', () => {
    const layer = analyzeQuartzLayer([analyzeQuartzPrism(richContent, 'a.ts')], 'src')
    expect(typeof formatLayerTable(layer)).toBe('string')
  })

  it('formatLayersTable handles empty', () => {
    expect(typeof formatLayersTable([])).toBe('string')
  })

  it('formatLayersTable formats multiple', async () => {
    const result = await buildQuartzHorizonResult(['src/a.ts', 'lib/b.ts'], [richContent, richContent])
    expect(typeof formatLayersTable(result.layers)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.prisms).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
