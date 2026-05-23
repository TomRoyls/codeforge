import { describe, it, expect } from 'vitest'
import {
  measureIntensifying,
  measureDeepening,
  measurePurifying,
  measureHardening,
  measureSustaining,
  classifyRubyCondition,
  classifyMineType,
  classifyJewelerGrade,
  classifyMineCondition,
  analyzeRubyGem,
  analyzeRubyMine,
  buildRubyHeartResult,
  generateRecommendations,
} from '../src/commands/ruby-heart-helpers.js'
import {
  colorScore,
  colorGrade,
  formatGemTable,
  formatGemsTable,
  formatMineTable,
  formatMinesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/ruby-heart-format-helpers.js'

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

// ─── measureIntensifying ────────────────────────────────────────────

describe('measureIntensifying', () => {
  it('returns 0 for empty content', () => {
    const m = measureIntensifying('')
    expect(m.intensity).toBe(0)
    expect(m.grade).toBe('colorless')
    expect(m.hasHighIntensity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureIntensifying(minimalContent)
    expect(m.intensity).toBe(8)
    expect(m.grade).toBe('colorless')
    expect(m.hasDedicated).toBe(false)
    expect(m.superficialCount).toBe(0)
    expect(m.apatheticCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureIntensifying(richContent)
    expect(m.intensity).toBe(100)
    expect(m.grade).toBe('pigeon-blood')
    expect(m.hasHighIntensity).toBe(true)
    expect(m.hasDedicated).toBe(true)
    expect(m.hasThorough).toBe(true)
    expect(m.hasPassionate).toBe(true)
    expect(m.hasIntense).toBe(true)
    expect(m.hasCommitted).toBe(true)
    expect(m.hasEarnest).toBe(true)
  })

  it('detects superficial var usage', () => {
    const m = measureIntensifying('var x = 1')
    expect(m.superficialCount).toBe(1)
    expect(m.hasNoSuperficial).toBe(false)
  })

  it('detects apathetic any usage', () => {
    const m = measureIntensifying('const x: any = 1')
    expect(m.apatheticCount).toBe(1)
    expect(m.hasNoApathetic).toBe(false)
  })

  it('detects weak eval usage', () => {
    const m = measureIntensifying('eval("1")')
    expect(m.hasNoWeak).toBe(false)
  })

  it('detects indifferent debugger usage', () => {
    const m = measureIntensifying('debugger')
    expect(m.hasNoIndifferent).toBe(false)
  })

  it('grades vivid-red for rich content', () => {
    const m = measureIntensifying(richContent)
    expect(m.grade).toBe('pigeon-blood')
    expect(m.hasHighIntensity).toBe(true)
  })

  it('grades pale-red for low score', () => {
    const m = measureIntensifying('export import x')
    expect(m.grade).toBe('pale-red')
  })

  it('grades colorless for very low score', () => {
    const m = measureIntensifying('const x = 1; const y = 2')
    expect(m.grade).toBe('colorless')
    expect(m.intensity).toBe(8)
  })
})

// ─── measureDeepening ───────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns 0 for empty content', () => {
    const m = measureDeepening('')
    expect(m.depth).toBe(0)
    expect(m.color).toBe('washed-out')
    expect(m.hasHighDepth).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBe(8)
    expect(m.color).toBe('washed-out')
    expect(m.hasDeep).toBe(false)
    expect(m.shallowCount).toBe(0)
    expect(m.thinCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBe(100)
    expect(m.color).toBe('deep-crimson')
    expect(m.hasHighDepth).toBe(true)
    expect(m.hasDeep).toBe(true)
    expect(m.hasProfound).toBe(true)
    expect(m.hasRich).toBe(true)
    expect(m.hasLayered).toBe(true)
    expect(m.hasSubstantive).toBe(true)
    expect(m.hasComplex).toBe(true)
  })

  it('detects shallow var usage', () => {
    const m = measureDeepening('var x = 1')
    expect(m.shallowCount).toBe(1)
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects thin any usage', () => {
    const m = measureDeepening('const x: any = 1')
    expect(m.thinCount).toBe(1)
    expect(m.hasNoThin).toBe(false)
  })

  it('detects flat eval usage', () => {
    const m = measureDeepening('eval("1")')
    expect(m.hasNoFlat).toBe(false)
  })

  it('detects hollow debugger usage', () => {
    const m = measureDeepening('debugger')
    expect(m.hasNoHollow).toBe(false)
  })

  it('grades rich-red for high scores', () => {
    const m = measureDeepening(richContent)
    expect(m.color).toBe('deep-crimson')
  })

  it('grades washed-out for low scores', () => {
    const content = 'const x = 1'
    const m = measureDeepening(content)
    expect(m.color).toBe('washed-out')
  })
})

// ─── measurePurifying ───────────────────────────────────────────────

describe('measurePurifying', () => {
  it('returns 0 for empty content', () => {
    const m = measurePurifying('')
    expect(m.purity).toBe(0)
    expect(m.inclusion).toBe('opaque')
    expect(m.hasHighPurity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePurifying(minimalContent)
    expect(m.purity).toBe(8)
    expect(m.inclusion).toBe('opaque')
    expect(m.hasClean).toBe(false)
    expect(m.contaminatedCount).toBe(0)
    expect(m.murkyCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePurifying(richContent)
    expect(m.purity).toBe(100)
    expect(m.inclusion).toBe('eye-clean')
    expect(m.hasHighPurity).toBe(true)
    expect(m.hasClean).toBe(true)
    expect(m.hasPure).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasPristine).toBe(true)
    expect(m.hasSpotless).toBe(true)
    expect(m.hasImmaculate).toBe(true)
  })

  it('detects contaminated var usage', () => {
    const m = measurePurifying('var x = 1')
    expect(m.contaminatedCount).toBe(1)
    expect(m.hasNoContaminated).toBe(false)
  })

  it('detects murky any usage', () => {
    const m = measurePurifying('const x: any = 1')
    expect(m.murkyCount).toBe(1)
    expect(m.hasNoMurky).toBe(false)
  })

  it('detects blemished eval usage', () => {
    const m = measurePurifying('eval("1")')
    expect(m.hasNoBlemished).toBe(false)
  })

  it('detects flawed debugger usage', () => {
    const m = measurePurifying('debugger')
    expect(m.hasNoFlawed).toBe(false)
  })

  it('grades cloudy for 25+ scores', () => {
    const content = 'function foo(): string { if (x === 1) return "a"; return "b" }'
    const m = measurePurifying(content)
    expect(m.inclusion).toBe('cloudy')
  })

  it('grades opaque for low scores', () => {
    const content = 'function foo(): string { return "a" }'
    const m = measurePurifying(content)
    expect(m.inclusion).toBe('opaque')
  })

  it('hasNoMurky is true when no any keyword', () => {
    const m = measurePurifying('const x = 1')
    expect(m.hasNoMurky).toBe(true)
  })
})

// ─── measureHardening ───────────────────────────────────────────────

describe('measureHardening', () => {
  it('returns 0 for empty content', () => {
    const m = measureHardening('')
    expect(m.grade).toBe(0)
    expect(m.hardness).toBe('crumbly')
    expect(m.hasHighGrade).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureHardening(minimalContent)
    expect(m.grade).toBe(0)
    expect(m.hardness).toBe('crumbly')
    expect(m.hasRobust).toBe(false)
    expect(m.fragileCount).toBe(0)
    expect(m.brittleCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHardening(richContent)
    expect(m.grade).toBe(100)
    expect(m.hardness).toBe('sapphire-hard')
    expect(m.hasHighGrade).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasTough).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasHardy).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureHardening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects brittle any usage', () => {
    const m = measureHardening('const x: any = 1')
    expect(m.brittleCount).toBe(1)
    expect(m.hasNoBrittle).toBe(false)
  })

  it('detects breakable eval usage', () => {
    const m = measureHardening('eval("1")')
    expect(m.hasNoBreakable).toBe(false)
  })

  it('detects weak debugger usage', () => {
    const m = measureHardening('debugger')
    expect(m.hasNoWeak).toBe(false)
  })

  it('grades soft-stone for mid-low scores', () => {
    const content = 'private readonly x = 1 === 1'
    const m = measureHardening(content)
    expect(m.hardness).toBe('soft-stone')
  })

  it('grades crumbly for low scores', () => {
    const content = 'private x = 1'
    const m = measureHardening(content)
    expect(m.hardness).toBe('crumbly')
  })

  it('grades crumbly for very low scores', () => {
    const content = 'private x = 1; var y = 2'
    const m = measureHardening(content)
    expect(m.hardness).toBe('crumbly')
  })
})

// ─── measureSustaining ──────────────────────────────────────────────

describe('measureSustaining', () => {
  it('returns 0 for empty content', () => {
    const m = measureSustaining('')
    expect(m.sustainability).toBe(0)
    expect(m.fire).toBe('cold-stone')
    expect(m.hasHighSustainability).toBe(false)
  })

  it('scores minimal content at 0', () => {
    const m = measureSustaining(minimalContent)
    expect(m.sustainability).toBe(0)
    expect(m.fire).toBe('cold-stone')
    expect(m.hasLasting).toBe(false)
    expect(m.fadingCount).toBe(0)
    expect(m.fleetingCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureSustaining(richContent)
    expect(m.sustainability).toBe(100)
    expect(m.fire).toBe('eternal-fire')
    expect(m.hasHighSustainability).toBe(true)
    expect(m.hasLasting).toBe(true)
    expect(m.hasEnduring).toBe(true)
    expect(m.hasSustainable).toBe(true)
    expect(m.hasPersistent).toBe(true)
    expect(m.hasSteady).toBe(true)
    expect(m.hasPerpetual).toBe(true)
  })

  it('detects fading var usage', () => {
    const m = measureSustaining('var x = 1')
    expect(m.fadingCount).toBe(1)
    expect(m.hasNoFading).toBe(false)
  })

  it('detects fleeting any usage', () => {
    const m = measureSustaining('const x: any = 1')
    expect(m.fleetingCount).toBe(1)
    expect(m.hasNoFleeting).toBe(false)
  })

  it('detects vanishing eval usage', () => {
    const m = measureSustaining('eval("1")')
    expect(m.hasNoVanishing).toBe(false)
  })

  it('detects dying debugger usage', () => {
    const m = measureSustaining('debugger')
    expect(m.hasNoDying).toBe(false)
  })

  it('grades fading-ember for mid scores', () => {
    const content = 'export const x = 1; export interface Foo<T> {}'
    const m = measureSustaining(content)
    expect(m.fire).toBe('fading-ember')
  })

  it('grades fading-ember for low-mid scores', () => {
    const content = 'export interface Foo<T> {}'
    const m = measureSustaining(content)
    expect(m.fire).toBe('fading-ember')
  })
})

// ─── classifyRubyCondition ──────────────────────────────────────────

describe('classifyRubyCondition', () => {
  it('classifies pigeon-blood-ruby for 85+', () => {
    expect(classifyRubyCondition(85)).toBe('pigeon-blood-ruby')
    expect(classifyRubyCondition(100)).toBe('pigeon-blood-ruby')
  })

  it('classifies burma-ruby for 70+', () => {
    expect(classifyRubyCondition(70)).toBe('burma-ruby')
  })

  it('classifies proper-ruby for 55+', () => {
    expect(classifyRubyCondition(55)).toBe('proper-ruby')
  })

  it('classifies pink-sapphire for 40+', () => {
    expect(classifyRubyCondition(40)).toBe('pink-sapphire')
  })

  it('classifies garnet-imitation for 25+', () => {
    expect(classifyRubyCondition(25)).toBe('garnet-imitation')
  })

  it('classifies glass-fake for below 25', () => {
    expect(classifyRubyCondition(0)).toBe('glass-fake')
    expect(classifyRubyCondition(24)).toBe('glass-fake')
  })
})

// ─── classifyMineType ───────────────────────────────────────────────

describe('classifyMineType', () => {
  it('returns no-deposit for empty gems', () => {
    expect(classifyMineType([])).toBe('no-deposit')
  })

  it('returns no-deposit for low quality', () => {
    const gems = [analyzeRubyGem(minimalContent, 'a.ts')]
    expect(classifyMineType(gems)).toBe('no-deposit')
  })

  it('returns burma-mine for high quality with high pigeon ratio', () => {
    const gems = [analyzeRubyGem(richContent, 'a.ts'), analyzeRubyGem(richContent, 'b.ts')]
    expect(classifyMineType(gems)).toBe('burma-mine')
  })

  it('returns secondary-deposit for decent quality', () => {
    const content = 'export interface Foo<T> { readonly bar: T }'
    const gems = [analyzeRubyGem(content, 'a.ts'), analyzeRubyGem(content, 'b.ts')]
    expect(classifyMineType(gems)).toBe('secondary-deposit')
  })

  it('returns surface-find for low quality', () => {
    const gems = [analyzeRubyGem('const a = 1', 'a.ts')]
    expect(classifyMineType(gems)).toBe('no-deposit')
  })
})

// ─── classifyMineCondition ──────────────────────────────────────────

describe('classifyMineCondition', () => {
  it('classifies premium-vein for 75+', () => {
    expect(classifyMineCondition(75)).toBe('premium-vein')
  })

  it('classifies rich-seam for 60+', () => {
    expect(classifyMineCondition(60)).toBe('rich-seam')
  })

  it('classifies decent-yield for 45+', () => {
    expect(classifyMineCondition(45)).toBe('decent-yield')
  })

  it('classifies low-grade for 30+', () => {
    expect(classifyMineCondition(30)).toBe('low-grade')
  })

  it('classifies exhausted for 15+', () => {
    expect(classifyMineCondition(15)).toBe('exhausted')
  })

  it('classifies barren for below 15', () => {
    expect(classifyMineCondition(0)).toBe('barren')
  })
})

// ─── classifyJewelerGrade ───────────────────────────────────────────

describe('classifyJewelerGrade', () => {
  it('classifies master-jeweler for 80+', () => {
    expect(classifyJewelerGrade(80)).toBe('master-jeweler')
    expect(classifyJewelerGrade(100)).toBe('master-jeweler')
  })

  it('classifies ruby-expert for 65+', () => {
    expect(classifyJewelerGrade(65)).toBe('ruby-expert')
  })

  it('classifies skilled-gemologist for 50+', () => {
    expect(classifyJewelerGrade(50)).toBe('skilled-gemologist')
  })

  it('classifies appraiser for 35+', () => {
    expect(classifyJewelerGrade(35)).toBe('appraiser')
  })

  it('classifies novice for 20+', () => {
    expect(classifyJewelerGrade(20)).toBe('novice')
  })

  it('classifies bauble-seller for below 20', () => {
    expect(classifyJewelerGrade(0)).toBe('bauble-seller')
  })
})

// ─── analyzeRubyGem ─────────────────────────────────────────────────

describe('analyzeRubyGem', () => {
  it('analyzes minimal content', () => {
    const gem = analyzeRubyGem(minimalContent, 'test.ts')
    expect(gem.file).toBe('test.ts')
    expect(gem.passionIntensity).toBe(8)
    expect(gem.colorDepth).toBe(8)
    expect(gem.inclusionPurity).toBe(8)
    expect(gem.hardnessGrade).toBe(0)
    expect(gem.fireSustainability).toBe(0)
    expect(gem.qualityScore).toBe(5)
    expect(gem.condition).toBe('glass-fake')
  })

  it('analyzes rich content', () => {
    const gem = analyzeRubyGem(richContent, 'rich.ts')
    expect(gem.passionIntensity).toBe(100)
    expect(gem.colorDepth).toBe(100)
    expect(gem.inclusionPurity).toBe(100)
    expect(gem.hardnessGrade).toBe(100)
    expect(gem.fireSustainability).toBe(100)
    expect(gem.qualityScore).toBe(100)
    expect(gem.condition).toBe('pigeon-blood-ruby')
  })

  it('analyzes empty content', () => {
    const gem = analyzeRubyGem('', 'empty.ts')
    expect(gem.qualityScore).toBe(0)
    expect(gem.condition).toBe('glass-fake')
  })

  it('preserves all measure objects', () => {
    const gem = analyzeRubyGem(richContent, 'test.ts')
    expect(gem.intensifying).toBeDefined()
    expect(gem.deepening).toBeDefined()
    expect(gem.purifying).toBeDefined()
    expect(gem.hardening).toBeDefined()
    expect(gem.sustaining).toBeDefined()
  })
})

// ─── analyzeRubyMine ────────────────────────────────────────────────

describe('analyzeRubyMine', () => {
  it('handles empty gems', () => {
    const mine = analyzeRubyMine([], 'empty')
    expect(mine.directory).toBe('empty')
    expect(mine.gems).toHaveLength(0)
    expect(mine.avgIntensity).toBe(0)
    expect(mine.avgDepth).toBe(0)
    expect(mine.avgHardness).toBe(0)
    expect(mine.pigeonBloodRubyCount).toBe(0)
    expect(mine.glassFakeCount).toBe(0)
    expect(mine.mineType).toBe('no-deposit')
    expect(mine.condition).toBe('barren')
  })

  it('analyzes single gem mine', () => {
    const gems = [analyzeRubyGem(richContent, 'dir/a.ts')]
    const mine = analyzeRubyMine(gems, 'dir')
    expect(mine.gems).toHaveLength(1)
    expect(mine.avgIntensity).toBe(100)
    expect(mine.pigeonBloodRubyCount).toBe(1)
    expect(mine.glassFakeCount).toBe(0)
  })

  it('analyzes mixed quality mine', () => {
    const gems = [
      analyzeRubyGem(richContent, 'dir/a.ts'),
      analyzeRubyGem(minimalContent, 'dir/b.ts'),
    ]
    const mine = analyzeRubyMine(gems, 'dir')
    expect(mine.gems).toHaveLength(2)
    expect(mine.avgIntensity).toBe(54)
    expect(mine.glassFakeCount).toBe(1)
  })
})

// ─── buildRubyHeartResult ───────────────────────────────────────────

describe('buildRubyHeartResult', () => {
  it('handles empty input', async () => {
    const result = await buildRubyHeartResult([], [])
    expect(result.gems).toHaveLength(0)
    expect(result.mines).toHaveLength(0)
    expect(result.treasury.avgIntensity).toBe(0)
    expect(result.treasury.isPrecious).toBe(false)
    expect(result.treasury.overallFire).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalMines).toBe(0)
    expect(result.stats.jewelerGrade).toBe('bauble-seller')
  })

  it('handles single rich file', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    expect(result.gems).toHaveLength(1)
    expect(result.gems[0]!.condition).toBe('pigeon-blood-ruby')
    expect(result.treasury.isPrecious).toBe(true)
    expect(result.treasury.overallFire).toBe(100)
    expect(result.stats.pigeonBloodRubyCount).toBe(1)
    expect(result.stats.jewelerGrade).toBe('master-jeweler')
    expect(result.stats.bestGem).toBe('a.ts')
    expect(result.stats.mostIntense).toBe('a.ts')
    expect(result.stats.deepest).toBe('a.ts')
    expect(result.stats.purest).toBe('a.ts')
    expect(result.stats.hardest).toBe('a.ts')
  })

  it('handles single minimal file', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    expect(result.gems).toHaveLength(1)
    expect(result.gems[0]!.qualityScore).toBe(5)
    expect(result.treasury.isPrecious).toBe(false)
    expect(result.stats.glassFakeCount).toBe(1)
  })

  it('groups files by directory into mines', async () => {
    const result = await buildRubyHeartResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.mines).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalMines).toBe(2)
  })

  it('computes overallFire as avg of intensity, depth, hardness', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    expect(result.treasury.overallFire).toBe(Math.round((100 + 100 + 100) / 3))
  })

  it('computes overallFire for minimal content', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    expect(result.treasury.overallFire).toBe(Math.round((8 + 8 + 0) / 3))
  })

  it('tracks high counts for each measure', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    expect(result.stats.hasHighIntensityCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighPurityCount).toBe(1)
    expect(result.stats.hasHighGradeCount).toBe(1)
    expect(result.stats.hasHighSustainabilityCount).toBe(1)
  })

  it('tracks condition counts', async () => {
    const result = await buildRubyHeartResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, minimalContent, 'export interface Foo<T> {}'],
    )
    expect(typeof result.stats.pigeonBloodRubyCount).toBe('number')
    expect(typeof result.stats.burmaRubyCount).toBe('number')
    expect(typeof result.stats.properRubyCount).toBe('number')
    expect(typeof result.stats.pinkSapphireCount).toBe('number')
    expect(typeof result.stats.garnetImitationCount).toBe('number')
    expect(typeof result.stats.glassFakeCount).toBe('number')
    expect(result.stats.glassFakeCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends intensity improvement', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('passion intensity'))
    expect(rec).toBeTruthy()
  })

  it('recommends depth improvement', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('color depth') || r.includes('Deepen'))
    expect(rec).toBeTruthy()
  })

  it('recommends purity improvement', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('inclusion') || r.includes('Purify'))
    expect(rec).toBeTruthy()
  })

  it('recommends hardening improvement', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Harden') || r.includes('hardness'))
    expect(rec).toBeTruthy()
  })

  it('recommends sustainability improvement', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Sustain') || r.includes('fire'))
    expect(rec).toBeTruthy()
  })

  it('warns about glass fakes', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('glass fake'))
    expect(rec).toBeTruthy()
  })

  it('praises museum-quality collection', async () => {
    const files = Array.from({ length: 10 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 10 }, () => richContent)
    const result = await buildRubyHeartResult(files, contents)
    const rec = result.recommendations.find(r => r.includes('museum-quality'))
    expect(rec).toBeTruthy()
  })

  it('warns when all mines are surface finds or barren', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('surface finds or barren'))
    expect(rec).toBeTruthy()
  })

  it('suggests transforming specific glass fakes', async () => {
    const result = await buildRubyHeartResult(
      ['a.ts', 'b.ts'],
      [minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Transform these glass fakes'))
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
  it('returns a string for pigeon-blood-ruby', () => {
    expect(typeof colorGrade('pigeon-blood-ruby')).toBe('string')
  })

  it('returns a string for glass-fake', () => {
    expect(typeof colorGrade('glass-fake')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatGemTable', () => {
  it('formats a gem', () => {
    const gem = analyzeRubyGem(richContent, 'test.ts')
    const output = formatGemTable(gem)
    expect(output).toContain('test.ts')
    expect(output).toContain('Intensity')
    expect(output).toContain('Depth')
    expect(output).toContain('Purity')
    expect(output).toContain('Hardness')
    expect(output).toContain('Fire')
  })
})

describe('formatGemsTable', () => {
  it('handles empty gems', () => {
    const output = formatGemsTable([])
    expect(output).toContain('No ruby gems')
  })

  it('formats multiple gems', () => {
    const gems = [
      analyzeRubyGem(richContent, 'a.ts'),
      analyzeRubyGem(minimalContent, 'b.ts'),
    ]
    const output = formatGemsTable(gems)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatMineTable', () => {
  it('formats a mine', () => {
    const gems = [analyzeRubyGem(richContent, 'dir/a.ts')]
    const mine = analyzeRubyMine(gems, 'dir')
    const output = formatMineTable(mine)
    expect(output).toContain('dir')
    expect(output).toContain('Mine')
  })
})

describe('formatMinesTable', () => {
  it('handles empty mines', () => {
    const output = formatMinesTable([])
    expect(output).toContain('No ruby mines')
  })

  it('formats multiple mines', () => {
    const gems = [analyzeRubyGem(richContent, 'src/a.ts')]
    const mines = [analyzeRubyMine(gems, 'src')]
    const output = formatMinesTable(mines)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Ruby Heart Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Jeweler Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Ruby Heart Analysis')
    expect(output).toContain('Ruby Mine Analysis')
    expect(output).toContain('Ruby Heart Statistics')
    expect(output).toContain('Treasury')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.gems).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.treasury.isPrecious).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const gem = analyzeRubyGem('   \n\t  ', 'blank.ts')
    expect(gem.passionIntensity).toBe(0)
    expect(gem.qualityScore).toBe(0)
    expect(gem.condition).toBe('glass-fake')
  })

  it('handles content with only comments', () => {
    const gem = analyzeRubyGem('// just a comment\n/* block */', 'comment.ts')
    expect(gem.passionIntensity).toBe(0)
    expect(gem.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildRubyHeartResult(['big.ts'], [longContent])
    expect(result.gems).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildRubyHeartResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.pigeonBloodRubyCount).toBe(50)
  })

  it('handles single file mine', async () => {
    const result = await buildRubyHeartResult(['single.ts'], [richContent])
    expect(result.mines).toHaveLength(1)
    expect(result.mines[0]!.gems).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const gem = analyzeRubyGem(richContent, 'cap.ts')
    expect(gem.qualityScore).toBeLessThanOrEqual(100)
    expect(gem.passionIntensity).toBeLessThanOrEqual(100)
    expect(gem.colorDepth).toBeLessThanOrEqual(100)
    expect(gem.inclusionPurity).toBeLessThanOrEqual(100)
    expect(gem.hardnessGrade).toBeLessThanOrEqual(100)
    expect(gem.fireSustainability).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildRubyHeartResult([], [])
    const r2 = await buildRubyHeartResult(['a.ts'], [richContent])
    const r3 = await buildRubyHeartResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })

  it('hardening uses grade field as number', () => {
    const m = measureHardening(richContent)
    expect(typeof m.grade).toBe('number')
    expect(m.grade).toBe(100)
    expect(m.hardness).toBe('sapphire-hard')
  })

  it('purifying uses hasNoMurky lowercase', () => {
    const m = measurePurifying('const x = 1')
    expect(m.hasNoMurky).toBe(true)
    expect(m.hasNoContaminated).toBe(true)
  })

  it('jeweler grade tracked in stats', async () => {
    const result = await buildRubyHeartResult(['a.ts'], [richContent])
    expect(result.stats.jewelerGrade).toBe('master-jeweler')
  })

  it('best gem tracks highest quality score', async () => {
    const result = await buildRubyHeartResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestGem).toBe('high.ts')
    expect(result.stats.mostIntense).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.purest).toBe('high.ts')
    expect(result.stats.hardest).toBe('high.ts')
  })
})
