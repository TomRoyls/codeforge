import { describe, it, expect } from 'vitest'
import {
  measureGlowing,
  measureStrengthening,
  measureClarifying,
  measureVibranting,
  measureRefracting,
  classifyTopazCondition,
  classifyDepositType,
  classifyJewelerGrade,
  classifyDepositCondition,
  analyzeTopazRay,
  analyzeTopazDeposit,
  buildTopazSunResult,
  generateRecommendations,
} from '../src/commands/topaz-sun-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatDepositTable,
  formatDepositsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/topaz-sun-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureGlowing ─────────────────────────────────────────────────

describe('measureGlowing', () => {
  it('returns 0 for empty content', () => {
    const m = measureGlowing('')
    expect(m.warmth).toBe(0)
    expect(m.grade).toBe('dark')
    expect(m.hasHighWarmth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureGlowing(minimalContent)
    expect(m.warmth).toBe(8)
    expect(m.grade).toBe('dark')
    expect(m.hasFriendly).toBe(false)
    expect(m.hostileCount).toBe(0)
    expect(m.distantCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureGlowing(richContent)
    expect(m.warmth).toBe(100)
    expect(m.grade).toBe('golden-sun')
    expect(m.hasHighWarmth).toBe(true)
    expect(m.hasFriendly).toBe(true)
    expect(m.hasApproachable).toBe(true)
    expect(m.hasWelcoming).toBe(true)
    expect(m.hasInviting).toBe(true)
    expect(m.hasWarm).toBe(true)
    expect(m.hasComfortable).toBe(true)
  })

  it('detects hostile var usage', () => {
    const m = measureGlowing('var x = 1')
    expect(m.hostileCount).toBe(1)
    expect(m.hasNoHostile).toBe(false)
  })

  it('detects distant any usage', () => {
    const m = measureGlowing('const x: any = 1')
    expect(m.distantCount).toBe(1)
    expect(m.hasNoDistant).toBe(false)
  })

  it('detects cold eval usage', () => {
    const m = measureGlowing('eval("1")')
    expect(m.hasNoCold).toBe(false)
  })

  it('detects frosty debugger usage', () => {
    const m = measureGlowing('debugger')
    expect(m.hasNoFrosty).toBe(false)
  })
})

// ─── measureStrengthening ───────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns 0 for empty content', () => {
    const m = measureStrengthening('')
    expect(m.strength).toBe(0)
    expect(m.hardness).toBe('crumbly')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.hardness).toBe('crumbly')
    expect(m.hasDurable).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.weakCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStrengthening(richContent)
    expect(m.strength).toBe(100)
    expect(m.hardness).toBe('topaz-grade')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasHardy).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureStrengthening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects weak any usage', () => {
    const m = measureStrengthening('const x: any = 1')
    expect(m.weakCount).toBe(1)
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects breakable eval usage', () => {
    const m = measureStrengthening('eval("1")')
    expect(m.hasNoBreakable).toBe(false)
  })

  it('detects brittle debugger usage', () => {
    const m = measureStrengthening('debugger')
    expect(m.hasNoBrittle).toBe(false)
  })
})

// ─── measureClarifying ──────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureClarifying('')
    expect(m.clarity).toBe(0)
    expect(m.crystal).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
    expect(m.crystal).toBe('opaque')
    expect(m.hasTransparent).toBe(false)
    expect(m.opaqueCount).toBe(0)
    expect(m.hiddenCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBe(100)
    expect(m.crystal).toBe('flawless-crystal')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasOpen).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects opaque var usage', () => {
    const m = measureClarifying('var x = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects hidden any usage', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects concealing eval usage', () => {
    const m = measureClarifying('eval("1")')
    expect(m.hasNoConcealing).toBe(false)
  })

  it('detects secret debugger usage', () => {
    const m = measureClarifying('debugger')
    expect(m.hasNoSecret).toBe(false)
  })
})

// ─── measureVibranting ──────────────────────────────────────────────

describe('measureVibranting', () => {
  it('returns 0 for empty content', () => {
    const m = measureVibranting('')
    expect(m.vibrancy).toBe(0)
    expect(m.color).toBe('colorless')
    expect(m.hasHighVibrancy).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureVibranting(minimalContent)
    expect(m.vibrancy).toBe(8)
    expect(m.color).toBe('colorless')
    expect(m.hasExpressive).toBe(false)
    expect(m.dullCount).toBe(0)
    expect(m.drabCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureVibranting(richContent)
    expect(m.vibrancy).toBe(100)
    expect(m.color).toBe('imperial-topaz')
    expect(m.hasHighVibrancy).toBe(true)
    expect(m.hasExpressive).toBe(true)
    expect(m.hasVivid).toBe(true)
    expect(m.hasColorful).toBe(true)
    expect(m.hasDynamic).toBe(true)
    expect(m.hasLively).toBe(true)
    expect(m.hasRich).toBe(true)
  })

  it('detects dull var usage', () => {
    const m = measureVibranting('var x = 1')
    expect(m.dullCount).toBe(1)
    expect(m.hasNoDull).toBe(false)
  })

  it('detects drab any usage', () => {
    const m = measureVibranting('const x: any = 1')
    expect(m.drabCount).toBe(1)
    expect(m.hasNoDrab).toBe(false)
  })

  it('detects flat eval usage', () => {
    const m = measureVibranting('eval("1")')
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects lifeless debugger usage', () => {
    const m = measureVibranting('debugger')
    expect(m.hasNoLifeless).toBe(false)
  })
})

// ─── measureRefracting ──────────────────────────────────────────────

describe('measureRefracting', () => {
  it('returns 0 for empty content', () => {
    const m = measureRefracting('')
    expect(m.quality).toBe(0)
    expect(m.refraction).toBe('no-depth')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureRefracting(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.refraction).toBe('no-depth')
    expect(m.hasMultifaceted).toBe(false)
    expect(m.oneDimensionalCount).toBe(0)
    expect(m.rigidCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureRefracting(richContent)
    expect(m.quality).toBe(100)
    expect(m.refraction).toBe('double-refraction')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasMultifaceted).toBe(true)
    expect(m.hasVersatile).toBe(true)
    expect(m.hasFlexible).toBe(true)
    expect(m.hasLayered).toBe(true)
    expect(m.hasComplex).toBe(true)
    expect(m.hasAdaptive).toBe(true)
  })

  it('detects one-dimensional var usage', () => {
    const m = measureRefracting('var x = 1')
    expect(m.oneDimensionalCount).toBe(1)
    expect(m.hasNoOneDimensional).toBe(false)
  })

  it('detects rigid any usage', () => {
    const m = measureRefracting('const x: any = 1')
    expect(m.rigidCount).toBe(1)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects flat2 eval usage', () => {
    const m = measureRefracting('eval("1")')
    expect(m.hasNoFlat2).toBe(false)
  })

  it('detects simple debugger usage', () => {
    const m = measureRefracting('debugger')
    expect(m.hasNoSimple).toBe(false)
  })
})

// ─── classifyTopazCondition ─────────────────────────────────────────

describe('classifyTopazCondition', () => {
  it('classifies imperial-topaz for 85+', () => {
    expect(classifyTopazCondition(85)).toBe('imperial-topaz')
    expect(classifyTopazCondition(100)).toBe('imperial-topaz')
  })

  it('classifies golden-gem for 70+', () => {
    expect(classifyTopazCondition(70)).toBe('golden-gem')
  })

  it('classifies proper-topaz for 55+', () => {
    expect(classifyTopazCondition(55)).toBe('proper-topaz')
  })

  it('classifies smoky-quartz for 40+', () => {
    expect(classifyTopazCondition(40)).toBe('smoky-quartz')
  })

  it('classifies pebble for 25+', () => {
    expect(classifyTopazCondition(25)).toBe('pebble')
  })

  it('classifies sand for below 25', () => {
    expect(classifyTopazCondition(0)).toBe('sand')
    expect(classifyTopazCondition(24)).toBe('sand')
  })
})

// ─── classifyDepositType ────────────────────────────────────────────

describe('classifyDepositType', () => {
  it('returns no-deposit for empty rays', () => {
    expect(classifyDepositType([])).toBe('no-deposit')
  })

  it('returns no-deposit for low quality', () => {
    const rays = [analyzeTopazRay(minimalContent, 'a.ts')]
    expect(classifyDepositType(rays)).toBe('no-deposit')
  })

  it('returns brazilian-mine for high quality', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts'), analyzeTopazRay(richContent, 'b.ts')]
    expect(classifyDepositType(rays)).toBe('brazilian-mine')
  })

  it('returns surface-find for low-mid quality', () => {
    const rays = [analyzeTopazRay('export const x: string = "hi"', 'a.ts')]
    expect(classifyDepositType(rays)).toBe('surface-find')
  })
})

// ─── classifyDepositCondition ───────────────────────────────────────

describe('classifyDepositCondition', () => {
  it('classifies golden-vein for 75+', () => {
    expect(classifyDepositCondition(75)).toBe('golden-vein')
  })

  it('classifies rich-seam for 60+', () => {
    expect(classifyDepositCondition(60)).toBe('rich-seam')
  })

  it('classifies decent-yield for 45+', () => {
    expect(classifyDepositCondition(45)).toBe('decent-yield')
  })

  it('classifies low-grade for 30+', () => {
    expect(classifyDepositCondition(30)).toBe('low-grade')
  })

  it('classifies exhausted for 15+', () => {
    expect(classifyDepositCondition(15)).toBe('exhausted')
  })

  it('classifies barren for below 15', () => {
    expect(classifyDepositCondition(0)).toBe('barren')
  })
})

// ─── classifyJewelerGrade ───────────────────────────────────────────

describe('classifyJewelerGrade', () => {
  it('classifies master-lapidary for 80+', () => {
    expect(classifyJewelerGrade(80)).toBe('master-lapidary')
    expect(classifyJewelerGrade(100)).toBe('master-lapidary')
  })

  it('classifies gem-expert for 65+', () => {
    expect(classifyJewelerGrade(65)).toBe('gem-expert')
  })

  it('classifies skilled-cutter for 50+', () => {
    expect(classifyJewelerGrade(50)).toBe('skilled-cutter')
  })

  it('classifies appraiser for 35+', () => {
    expect(classifyJewelerGrade(35)).toBe('appraiser')
  })

  it('classifies novice for 20+', () => {
    expect(classifyJewelerGrade(20)).toBe('novice')
  })

  it('classifies rock-hound for below 20', () => {
    expect(classifyJewelerGrade(0)).toBe('rock-hound')
  })
})

// ─── analyzeTopazRay ────────────────────────────────────────────────

describe('analyzeTopazRay', () => {
  it('analyzes minimal content', () => {
    const ray = analyzeTopazRay(minimalContent, 'test.ts')
    expect(ray.file).toBe('test.ts')
    expect(ray.warmthGlow).toBe(8)
    expect(ray.hardnessStrength).toBe(0)
    expect(ray.crystalClarity).toBe(8)
    expect(ray.colorVibrancy).toBe(8)
    expect(ray.dualRefraction).toBe(8)
    expect(ray.qualityScore).toBe(6)
    expect(ray.condition).toBe('sand')
  })

  it('analyzes rich content', () => {
    const ray = analyzeTopazRay(richContent, 'rich.ts')
    expect(ray.warmthGlow).toBe(100)
    expect(ray.hardnessStrength).toBe(100)
    expect(ray.crystalClarity).toBe(100)
    expect(ray.colorVibrancy).toBe(100)
    expect(ray.dualRefraction).toBe(100)
    expect(ray.qualityScore).toBe(100)
    expect(ray.condition).toBe('imperial-topaz')
  })

  it('analyzes empty content', () => {
    const ray = analyzeTopazRay('', 'empty.ts')
    expect(ray.qualityScore).toBe(0)
    expect(ray.condition).toBe('sand')
  })

  it('preserves all measure objects', () => {
    const ray = analyzeTopazRay(richContent, 'test.ts')
    expect(ray.glowing).toBeDefined()
    expect(ray.strengthening).toBeDefined()
    expect(ray.clarifying).toBeDefined()
    expect(ray.vibranting).toBeDefined()
    expect(ray.refracting).toBeDefined()
  })
})

// ─── analyzeTopazDeposit ────────────────────────────────────────────

describe('analyzeTopazDeposit', () => {
  it('handles empty rays', () => {
    const deposit = analyzeTopazDeposit([], 'empty')
    expect(deposit.directory).toBe('empty')
    expect(deposit.rays).toHaveLength(0)
    expect(deposit.avgWarmth).toBe(0)
    expect(deposit.avgStrength).toBe(0)
    expect(deposit.avgClarity).toBe(0)
    expect(deposit.imperialTopazCount).toBe(0)
    expect(deposit.sandCount).toBe(0)
    expect(deposit.depositType).toBe('no-deposit')
    expect(deposit.condition).toBe('barren')
  })

  it('analyzes single ray deposit', () => {
    const rays = [analyzeTopazRay(richContent, 'dir/a.ts')]
    const deposit = analyzeTopazDeposit(rays, 'dir')
    expect(deposit.rays).toHaveLength(1)
    expect(deposit.avgWarmth).toBe(100)
    expect(deposit.imperialTopazCount).toBe(1)
    expect(deposit.sandCount).toBe(0)
  })

  it('analyzes mixed quality deposit', () => {
    const rays = [
      analyzeTopazRay(richContent, 'dir/a.ts'),
      analyzeTopazRay(minimalContent, 'dir/b.ts'),
    ]
    const deposit = analyzeTopazDeposit(rays, 'dir')
    expect(deposit.rays).toHaveLength(2)
    expect(deposit.avgWarmth).toBe(54)
    expect(deposit.sandCount).toBe(1)
  })
})

// ─── buildTopazSunResult ────────────────────────────────────────────

describe('buildTopazSunResult', () => {
  it('handles empty input', async () => {
    const result = await buildTopazSunResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.deposits).toHaveLength(0)
    expect(result.sunshine.avgWarmth).toBe(0)
    expect(result.sunshine.isGolden).toBe(false)
    expect(result.sunshine.overallBrilliance).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalDeposits).toBe(0)
    expect(result.stats.jewelerGrade).toBe('rock-hound')
  })

  it('handles single rich file', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.rays[0]!.condition).toBe('imperial-topaz')
    expect(result.sunshine.isGolden).toBe(true)
    expect(result.sunshine.overallBrilliance).toBe(100)
    expect(result.stats.imperialTopazCount).toBe(1)
    expect(result.stats.jewelerGrade).toBe('master-lapidary')
    expect(result.stats.bestRay).toBe('a.ts')
    expect(result.stats.warmest).toBe('a.ts')
    expect(result.stats.strongest).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.mostVibrant).toBe('a.ts')
  })

  it('handles single minimal file', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    expect(result.rays).toHaveLength(1)
    expect(result.rays[0]!.qualityScore).toBe(6)
    expect(result.sunshine.isGolden).toBe(false)
    expect(result.stats.sandCount).toBe(1)
  })

  it('groups files by directory into deposits', async () => {
    const result = await buildTopazSunResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.deposits).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalDeposits).toBe(2)
  })

  it('computes overallBrilliance as avg of warmth, strength, clarity', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    expect(result.sunshine.overallBrilliance).toBe(Math.round((100 + 100 + 100) / 3))
  })

  it('computes overallBrilliance for minimal content', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    expect(result.sunshine.overallBrilliance).toBe(Math.round((8 + 0 + 8) / 3))
  })

  it('tracks high counts for each measure', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    expect(result.stats.hasHighWarmthCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighVibrancyCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
  })

  it('tracks condition counts', async () => {
    const result = await buildTopazSunResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, 'export interface Foo<T> {}'],
    )
    expect(typeof result.stats.imperialTopazCount).toBe('number')
    expect(typeof result.stats.goldenGemCount).toBe('number')
    expect(typeof result.stats.properTopazCount).toBe('number')
    expect(typeof result.stats.smokyQuartzCount).toBe('number')
    expect(typeof result.stats.pebbleCount).toBe('number')
    expect(typeof result.stats.sandCount).toBe('number')
    expect(result.stats.sandCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends warmth improvement', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('warmth'))
    expect(rec).toBeTruthy()
  })

  it('recommends strength improvement', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Strengthen'))
    expect(rec).toBeTruthy()
  })

  it('recommends clarity improvement', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('crystal clarity'))
    expect(rec).toBeTruthy()
  })

  it('recommends vibrancy improvement', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('vibrancy'))
    expect(rec).toBeTruthy()
  })

  it('recommends refraction improvement', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('refraction'))
    expect(rec).toBeTruthy()
  })

  it('warns about sand files', async () => {
    const result = await buildTopazSunResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('sand'))
    expect(rec).toBeTruthy()
  })

  it('praises master-lapidary quality', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 10 }, () => richContent)
    const result = await buildTopazSunResult(files, contents)
    const rec = result.recommendations.find(r => r.includes('master-lapidary quality'))
    expect(rec).toBeTruthy()
  })

  it('warns when all deposits are surface finds or empty', async () => {
    const result = await buildTopazSunResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('surface finds or empty'))
    expect(rec).toBeTruthy()
  })

  it('suggests polishing specific sand files', async () => {
    const result = await buildTopazSunResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Polish these sand'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })
  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })
  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for imperial-topaz', () => {
    expect(typeof colorGrade('imperial-topaz')).toBe('string')
  })
  it('returns a string for sand', () => {
    expect(typeof colorGrade('sand')).toBe('string')
  })
  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray', () => {
    const ray = analyzeTopazRay(richContent, 'test.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('test.ts')
    expect(output).toContain('Warmth')
    expect(output).toContain('Strength')
    expect(output).toContain('Clarity')
    expect(output).toContain('Vibrancy')
    expect(output).toContain('Refraction')
  })
})

describe('formatRaysTable', () => {
  it('handles empty rays', () => {
    expect(formatRaysTable([])).toContain('No topaz rays')
  })
  it('formats multiple rays', () => {
    const rays = [analyzeTopazRay(richContent, 'a.ts'), analyzeTopazRay(minimalContent, 'b.ts')]
    const output = formatRaysTable(rays)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatDepositTable', () => {
  it('formats a deposit', () => {
    const rays = [analyzeTopazRay(richContent, 'dir/a.ts')]
    const deposit = analyzeTopazDeposit(rays, 'dir')
    const output = formatDepositTable(deposit)
    expect(output).toContain('dir')
    expect(output).toContain('Deposit')
  })
})

describe('formatDepositsTable', () => {
  it('handles empty deposits', () => {
    expect(formatDepositsTable([])).toContain('No topaz deposits')
  })
  it('formats multiple deposits', () => {
    const rays = [analyzeTopazRay(richContent, 'src/a.ts')]
    const deposits = [analyzeTopazDeposit(rays, 'src')]
    expect(formatDepositsTable(deposits)).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Topaz Sun Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Jeweler Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Topaz Sun Analysis')
    expect(output).toContain('Topaz Deposit Analysis')
    expect(output).toContain('Topaz Sun Statistics')
    expect(output).toContain('Sunshine')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.sunshine.isGolden).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const ray = analyzeTopazRay('   \n\t  ', 'blank.ts')
    expect(ray.warmthGlow).toBe(0)
    expect(ray.qualityScore).toBe(0)
    expect(ray.condition).toBe('sand')
  })

  it('handles content with only comments', () => {
    const ray = analyzeTopazRay('// just a comment\n/* block */', 'comment.ts')
    expect(ray.warmthGlow).toBe(0)
    expect(ray.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const result = await buildTopazSunResult(['big.ts'], [richContent.repeat(100)])
    expect(result.rays).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildTopazSunResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.imperialTopazCount).toBe(50)
  })

  it('handles single file deposit', async () => {
    const result = await buildTopazSunResult(['single.ts'], [richContent])
    expect(result.deposits).toHaveLength(1)
    expect(result.deposits[0]!.rays).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const ray = analyzeTopazRay(richContent, 'cap.ts')
    expect(ray.qualityScore).toBeLessThanOrEqual(100)
    expect(ray.warmthGlow).toBeLessThanOrEqual(100)
    expect(ray.hardnessStrength).toBeLessThanOrEqual(100)
    expect(ray.crystalClarity).toBeLessThanOrEqual(100)
    expect(ray.colorVibrancy).toBeLessThanOrEqual(100)
    expect(ray.dualRefraction).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildTopazSunResult([], [])
    const r2 = await buildTopazSunResult(['a.ts'], [richContent])
    const r3 = await buildTopazSunResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })

  it('jeweler grade tracked in stats', async () => {
    const result = await buildTopazSunResult(['a.ts'], [richContent])
    expect(result.stats.jewelerGrade).toBe('master-lapidary')
  })

  it('best ray tracks highest quality score', async () => {
    const result = await buildTopazSunResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestRay).toBe('high.ts')
    expect(result.stats.warmest).toBe('high.ts')
    expect(result.stats.strongest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostVibrant).toBe('high.ts')
  })
})
