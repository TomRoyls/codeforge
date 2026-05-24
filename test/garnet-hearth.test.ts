import { describe, it, expect } from 'vitest'
import {
  measureFiring,
  measureStrengthening,
  measureWarming,
  measureCommitting,
  measureGrounding,
  classifyEmberCondition,
  classifyHearthType,
  classifyHearthCondition,
  classifyKeeperGrade,
  analyzeGarnetEmber,
  analyzeGarnetHearth,
  buildGarnetHearthResult,
  generateRecommendations,
} from '../src/commands/garnet-hearth-helpers.js'
import {
  colorScore,
  colorGrade,
  formatEmberTable,
  formatEmbersTable,
  formatHearthTable,
  formatHearthsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/garnet-hearth-format-helpers.js'

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

// ─── measureFiring ──────────────────────────────────────────────────

describe('measureFiring', () => {
  it('returns low fire for minimal content', () => {
    const m = measureFiring(minimalContent)
    expect(m.fire).toBe(8)
  })

  it('detects energetic (export + async)', () => {
    expect(measureFiring(richContent).hasEnergetic).toBe(true)
  })

  it('detects passionate (namedExport + returnType)', () => {
    expect(measureFiring(richContent).hasPassionate).toBe(true)
  })

  it('detects dynamic (import + generics)', () => {
    expect(measureFiring(richContent).hasDynamic).toBe(true)
  })

  it('detects vibrant (docComments + const)', () => {
    expect(measureFiring(richContent).hasVibrant).toBe(true)
  })

  it('detects alive (interface + class)', () => {
    expect(measureFiring(richContent).hasAlive).toBe(true)
  })

  it('detects fiery (export + docComments)', () => {
    expect(measureFiring(richContent).hasFiery).toBe(true)
  })

  it('has no lifeless for clean code', () => {
    const m = measureFiring(richContent)
    expect(m.hasNoLifeless).toBe(true)
    expect(m.lifelessCount).toBe(0)
  })

  it('has no static for clean code', () => {
    const m = measureFiring(richContent)
    expect(m.hasNoStatic).toBe(true)
    expect(m.staticCount).toBe(0)
  })

  it('has no dull when no eval', () => {
    expect(measureFiring(richContent).hasNoDull).toBe(true)
  })

  it('has no dead when no debugger', () => {
    expect(measureFiring(minimalContent).hasNoDead).toBe(true)
  })

  it('gives high fire for rich content', () => {
    const m = measureFiring(richContent)
    expect(m.fire).toBeGreaterThanOrEqual(70)
    expect(m.hasHighFire).toBe(true)
  })

  it('detects lifeless in var code', () => {
    const m = measureFiring('var x = 1')
    expect(m.lifelessCount).toBe(1)
    expect(m.hasNoLifeless).toBe(false)
  })

  it('detects static in any code', () => {
    const m = measureFiring('const x: any = 1')
    expect(m.staticCount).toBe(1)
    expect(m.hasNoStatic).toBe(false)
  })

  it('assigns cold-ash for very low scores', () => {
    expect(measureFiring('').grade).toBe('cold-ash')
  })

  it('assigns blazing-ember for very high scores', () => {
    expect(measureFiring(richContent).grade).toBe('blazing-ember')
  })

  it('caps fire at 100', () => {
    expect(measureFiring(richContent).fire).toBeLessThanOrEqual(100)
  })
})

// ─── measureStrengthening ───────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns low strength for minimal content', () => {
    expect(measureStrengthening(minimalContent).strength).toBe(8)
  })

  it('detects robust (returnType + strictEq)', () => {
    expect(measureStrengthening(richContent).hasRobust).toBe(true)
  })

  it('detects durable (readonly + private)', () => {
    expect(measureStrengthening(richContent).hasDurable).toBe(true)
  })

  it('detects tough (interface + generics)', () => {
    expect(measureStrengthening(richContent).hasTough).toBe(true)
  })

  it('detects solid (typeAlias + docComments)', () => {
    expect(measureStrengthening(richContent).hasSolid).toBe(true)
  })

  it('detects resilient (class + returnType)', () => {
    expect(measureStrengthening(richContent).hasResilient).toBe(true)
  })

  it('detects hardy (const + strictEq)', () => {
    expect(measureStrengthening(richContent).hasHardy).toBe(true)
  })

  it('has no fragile for clean code', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasNoFragile).toBe(true)
    expect(m.fragileCount).toBe(0)
  })

  it('has no weak for clean code', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasNoWeak).toBe(true)
    expect(m.weakCount).toBe(0)
  })

  it('has no brittle when no eval', () => {
    expect(measureStrengthening(richContent).hasNoBrittle).toBe(true)
  })

  it('has no breakable when no debugger', () => {
    expect(measureStrengthening(minimalContent).hasNoBreakable).toBe(true)
  })

  it('gives high strength for rich content', () => {
    const m = measureStrengthening(richContent)
    expect(m.strength).toBeGreaterThanOrEqual(70)
    expect(m.hasHighStrength).toBe(true)
  })

  it('detects fragile in var code', () => {
    const m = measureStrengthening('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects weak in any code', () => {
    const m = measureStrengthening('const x: any = 1')
    expect(m.weakCount).toBe(1)
    expect(m.hasNoWeak).toBe(false)
  })

  it('assigns crumbled for very low scores', () => {
    expect(measureStrengthening('').crystal).toBe('crumbled')
  })

  it('assigns dodecahedron-perfect for very high scores', () => {
    expect(measureStrengthening(richContent).crystal).toBe('dodecahedron-perfect')
  })

  it('caps strength at 100', () => {
    expect(measureStrengthening(richContent).strength).toBeLessThanOrEqual(100)
  })
})

// ─── measureWarming ─────────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns low warmth for minimal content', () => {
    expect(measureWarming(minimalContent).warmth).toBe(8)
  })

  it('detects friendly (docComments + interface)', () => {
    expect(measureWarming(richContent).hasFriendly).toBe(true)
  })

  it('detects approachable (export + import)', () => {
    expect(measureWarming(richContent).hasApproachable).toBe(true)
  })

  it('detects welcoming (typeAlias + generics)', () => {
    expect(measureWarming(richContent).hasWelcoming).toBe(true)
  })

  it('detects inviting (returnType + readonly)', () => {
    expect(measureWarming(richContent).hasInviting).toBe(true)
  })

  it('detects warm (const + docComments)', () => {
    expect(measureWarming(richContent).hasWarm).toBe(true)
  })

  it('detects comfortable (async + export)', () => {
    expect(measureWarming(richContent).hasComfortable).toBe(true)
  })

  it('has no hostile for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoHostile).toBe(true)
    expect(m.hostileCount).toBe(0)
  })

  it('has no distant for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoDistant).toBe(true)
    expect(m.distantCount).toBe(0)
  })

  it('has no cold when no eval', () => {
    expect(measureWarming(richContent).hasNoCold).toBe(true)
  })

  it('has no frosty when no debugger', () => {
    expect(measureWarming(minimalContent).hasNoFrosty).toBe(true)
  })

  it('gives high warmth for rich content', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighWarmth).toBe(true)
  })

  it('detects hostile in var code', () => {
    const m = measureWarming('var x = 1')
    expect(m.hostileCount).toBe(1)
    expect(m.hasNoHostile).toBe(false)
  })

  it('detects distant in any code', () => {
    const m = measureWarming('const x: any = 1')
    expect(m.distantCount).toBe(1)
    expect(m.hasNoDistant).toBe(false)
  })

  it('assigns colorless for very low scores', () => {
    expect(measureWarming('').color).toBe('colorless')
  })

  it('assigns deep-crimson for very high scores', () => {
    expect(measureWarming(richContent).color).toBe('deep-crimson')
  })

  it('caps warmth at 100', () => {
    expect(measureWarming(richContent).warmth).toBeLessThanOrEqual(100)
  })
})

// ─── measureCommitting ──────────────────────────────────────────────

describe('measureCommitting', () => {
  it('returns 0 depth for minimal content', () => {
    const m = measureCommitting(minimalContent)
    expect(m.depth).toBe(0)
  })

  it('detects thorough (namedExport + export)', () => {
    expect(measureCommitting(richContent).hasThorough).toBe(true)
  })

  it('detects dedicated (returnType + strictEq)', () => {
    expect(measureCommitting(richContent).hasDedicated).toBe(true)
  })

  it('detects complete (readonly + private)', () => {
    expect(measureCommitting(richContent).hasComplete).toBe(true)
  })

  it('detects exhaustive (interface + generics)', () => {
    expect(measureCommitting(richContent).hasExhaustive).toBe(true)
  })

  it('detects comprehensive (docComments + namedExport)', () => {
    expect(measureCommitting(richContent).hasComprehensive).toBe(true)
  })

  it('detects meticulous (class + returnType)', () => {
    expect(measureCommitting(richContent).hasMeticulous).toBe(true)
  })

  it('has no superficial for clean code', () => {
    const m = measureCommitting(richContent)
    expect(m.hasNoSuperficial).toBe(true)
    expect(m.superficialCount).toBe(0)
  })

  it('has no partial for clean code', () => {
    const m = measureCommitting(richContent)
    expect(m.hasNoPartial).toBe(true)
    expect(m.partialCount).toBe(0)
  })

  it('has no sketchy when no eval', () => {
    expect(measureCommitting(richContent).hasNoSketchy).toBe(true)
  })

  it('has no incomplete when no debugger', () => {
    expect(measureCommitting(minimalContent).hasNoIncomplete).toBe(true)
  })

  it('gives high depth for rich content', () => {
    const m = measureCommitting(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighDepth).toBe(true)
  })

  it('detects superficial in var code', () => {
    const m = measureCommitting('var x = 1')
    expect(m.superficialCount).toBe(1)
    expect(m.hasNoSuperficial).toBe(false)
  })

  it('detects partial in any code', () => {
    const m = measureCommitting('const x: any = 1')
    expect(m.partialCount).toBe(1)
    expect(m.hasNoPartial).toBe(false)
  })

  it('assigns abandoned for very low scores', () => {
    expect(measureCommitting('').commitment).toBe('abandoned')
  })

  it('assigns deep-devotion for very high scores', () => {
    expect(measureCommitting(richContent).commitment).toBe('deep-devotion')
  })

  it('caps depth at 100', () => {
    expect(measureCommitting(richContent).depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureGrounding ───────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns 10 root for minimal content', () => {
    expect(measureGrounding(minimalContent).root).toBe(10)
  })

  it('detects grounded (const + strictEq)', () => {
    expect(measureGrounding(richContent).hasGrounded).toBe(true)
  })

  it('detects stable (interface + typeAlias)', () => {
    expect(measureGrounding(richContent).hasStable).toBe(true)
  })

  it('detects anchored (export + import)', () => {
    expect(measureGrounding(richContent).hasAnchored).toBe(true)
  })

  it('detects secure (returnType + readonly)', () => {
    expect(measureGrounding(richContent).hasSecure).toBe(true)
  })

  it('detects rooted (private + strictEq)', () => {
    expect(measureGrounding(richContent).hasRooted).toBe(true)
  })

  it('detects firm (class + const)', () => {
    expect(measureGrounding(richContent).hasFirm).toBe(true)
  })

  it('has no floating for clean code', () => {
    const m = measureGrounding(richContent)
    expect(m.hasNoFloating).toBe(true)
    expect(m.floatingCount).toBe(0)
  })

  it('has no drifting for clean code', () => {
    const m = measureGrounding(richContent)
    expect(m.hasNoDrifting).toBe(true)
    expect(m.driftingCount).toBe(0)
  })

  it('has no unstable when no eval', () => {
    expect(measureGrounding(richContent).hasNoUnstable).toBe(true)
  })

  it('has no wobbly when no debugger', () => {
    expect(measureGrounding(minimalContent).hasNoWobbly).toBe(true)
  })

  it('gives high root for rich content', () => {
    const m = measureGrounding(richContent)
    expect(m.root).toBeGreaterThanOrEqual(70)
    expect(m.hasHighRoot).toBe(true)
  })

  it('detects floating in var code', () => {
    const m = measureGrounding('var x = 1')
    expect(m.floatingCount).toBe(1)
    expect(m.hasNoFloating).toBe(false)
  })

  it('detects drifting in any code', () => {
    const m = measureGrounding('const x: any = 1')
    expect(m.driftingCount).toBe(1)
    expect(m.hasNoDrifting).toBe(false)
  })

  it('assigns no-ground for very low scores', () => {
    expect(measureGrounding('').foundation).toBe('no-ground')
  })

  it('assigns bedrock-root for very high scores', () => {
    expect(measureGrounding(richContent).foundation).toBe('bedrock-root')
  })

  it('caps root at 100', () => {
    expect(measureGrounding(richContent).root).toBeLessThanOrEqual(100)
  })
})

// ─── classifyEmberCondition ─────────────────────────────────────────

describe('classifyEmberCondition', () => {
  it('returns pyrope-treasure for 85+', () => { expect(classifyEmberCondition(90)).toBe('pyrope-treasure') })
  it('returns almandine-gem for 70-84', () => { expect(classifyEmberCondition(75)).toBe('almandine-gem') })
  it('returns proper-garnet for 55-69', () => { expect(classifyEmberCondition(60)).toBe('proper-garnet') })
  it('returns andradite for 40-54', () => { expect(classifyEmberCondition(45)).toBe('andradite') })
  it('returns grossular-pebble for 25-39', () => { expect(classifyEmberCondition(30)).toBe('grossular-pebble') })
  it('returns sand for below 25', () => { expect(classifyEmberCondition(10)).toBe('sand') })
})

// ─── classifyHearthType ─────────────────────────────────────────────

describe('classifyHearthType', () => {
  it('returns no-fire for empty array', () => {
    expect(classifyHearthType([])).toBe('no-fire')
  })
})

// ─── classifyHearthCondition ────────────────────────────────────────

describe('classifyHearthCondition', () => {
  it('returns blazing-hearth for 75+', () => { expect(classifyHearthCondition(80)).toBe('blazing-hearth') })
  it('returns warm-fire for 60-74', () => { expect(classifyHearthCondition(65)).toBe('warm-fire') })
  it('returns steady-glow for 45-59', () => { expect(classifyHearthCondition(50)).toBe('steady-glow') })
  it('returns dying-embers for 30-44', () => { expect(classifyHearthCondition(35)).toBe('dying-embers') })
  it('returns cold-ashes for 15-29', () => { expect(classifyHearthCondition(20)).toBe('cold-ashes') })
  it('returns extinguished for below 15', () => { expect(classifyHearthCondition(5)).toBe('extinguished') })
})

// ─── classifyKeeperGrade ────────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns hearth-master for 80+', () => { expect(classifyKeeperGrade(85)).toBe('hearth-master') })
  it('returns fire-keeper for 65-79', () => { expect(classifyKeeperGrade(70)).toBe('fire-keeper') })
  it('returns skilled-tender for 50-64', () => { expect(classifyKeeperGrade(55)).toBe('skilled-tender') })
  it('returns apprentice for 35-49', () => { expect(classifyKeeperGrade(40)).toBe('apprentice') })
  it('returns novice for 20-34', () => { expect(classifyKeeperGrade(25)).toBe('novice') })
  it('returns ice-cold for below 20', () => { expect(classifyKeeperGrade(10)).toBe('ice-cold') })
})

// ─── analyzeGarnetEmber ─────────────────────────────────────────────

describe('analyzeGarnetEmber', () => {
  it('returns correct file path', () => {
    expect(analyzeGarnetEmber(minimalContent, 'index.ts').file).toBe('index.ts')
  })

  it('calculates qualityScore of 7 for minimal content', () => {
    expect(analyzeGarnetEmber(minimalContent, 'index.ts').qualityScore).toBe(7)
  })

  it('classifies minimal as sand', () => {
    expect(analyzeGarnetEmber(minimalContent, 'index.ts').condition).toBe('sand')
  })

  it('has all measure fields', () => {
    const ember = analyzeGarnetEmber(minimalContent, 'index.ts')
    expect(ember).toHaveProperty('firing')
    expect(ember).toHaveProperty('strengthening')
    expect(ember).toHaveProperty('warming')
    expect(ember).toHaveProperty('committing')
    expect(ember).toHaveProperty('grounding')
  })

  it('returns high qualityScore for rich content', () => {
    expect(analyzeGarnetEmber(richContent, 'rich.ts').qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('classifies rich as pyrope-treasure', () => {
    expect(analyzeGarnetEmber(richContent, 'rich.ts').condition).toBe('pyrope-treasure')
  })

  it('has all score fields as numbers', () => {
    const ember = analyzeGarnetEmber(minimalContent, 'index.ts')
    expect(typeof ember.innerFire).toBe('number')
    expect(typeof ember.crystalStrength).toBe('number')
    expect(typeof ember.colorWarmth).toBe('number')
    expect(typeof ember.commitmentDepth).toBe('number')
    expect(typeof ember.rootGrounding).toBe('number')
  })
})

// ─── analyzeGarnetHearth ────────────────────────────────────────────

describe('analyzeGarnetHearth', () => {
  it('returns empty hearth for no embers', () => {
    const hearth = analyzeGarnetHearth([], 'src')
    expect(hearth.directory).toBe('src')
    expect(hearth.embers.length).toBe(0)
    expect(hearth.avgFire).toBe(0)
    expect(hearth.avgStrength).toBe(0)
    expect(hearth.avgWarmth).toBe(0)
    expect(hearth.hearthType).toBe('no-fire')
    expect(hearth.condition).toBe('extinguished')
  })

  it('computes averages from embers', () => {
    const e1 = analyzeGarnetEmber(richContent, 'a.ts')
    const e2 = analyzeGarnetEmber(richContent, 'b.ts')
    const hearth = analyzeGarnetHearth([e1, e2], 'src')
    expect(hearth.avgFire).toBe(e1.innerFire)
    expect(hearth.avgStrength).toBe(e1.crystalStrength)
  })
})

// ─── buildGarnetHearthResult ────────────────────────────────────────

describe('buildGarnetHearthResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildGarnetHearthResult([], [])
    expect(result.embers.length).toBe(0)
    expect(result.hearths.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.home.isWarm).toBe(false)
    expect(result.home.overallWarmth).toBe(0)
  })

  it('returns correct structure for single file', async () => {
    const result = await buildGarnetHearthResult(['index.ts'], [richContent])
    expect(result.embers.length).toBe(1)
    expect(result.hearths.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestEmber).toBe('index.ts')
    expect(result.stats.mostFiery).toBe('index.ts')
    expect(result.stats.strongest).toBe('index.ts')
    expect(result.stats.warmest).toBe('index.ts')
    expect(result.stats.mostCommitted).toBe('index.ts')
  })

  it('computes home.isWarm when avgWarmth >= 60', async () => {
    const result = await buildGarnetHearthResult(['rich.ts'], [richContent])
    expect(result.home.isWarm).toBe(true)
  })

  it('computes overallWarmth correctly', async () => {
    const result = await buildGarnetHearthResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.home.avgFire + result.home.avgStrength + result.home.avgWarmth) / 3,
    )
    expect(result.home.overallWarmth).toBe(expected)
  })

  it('counts condition categories correctly', async () => {
    const result = await buildGarnetHearthResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.pyropeTreasureCount + result.stats.almandineGemCount +
      result.stats.properGarnetCount + result.stats.andraditeCount +
      result.stats.grossularPebbleCount + result.stats.sandCount).toBe(2)
  })

  it('counts high measure flags correctly', async () => {
    const result = await buildGarnetHearthResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighFireCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighStrengthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighRootCount).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory into hearths', async () => {
    const result = await buildGarnetHearthResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.hearths.length).toBe(2)
  })

  it('sets keeperGrade based on overallWarmth', async () => {
    const result = await buildGarnetHearthResult(['rich.ts'], [richContent])
    expect(result.stats.keeperGrade).toBe(classifyKeeperGrade(result.home.overallWarmth))
  })

  it('returns minimal content qualityScore of 7', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    expect(result.embers[0]!.qualityScore).toBe(7)
  })

  it('returns recommendations array', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message when all metrics are good', async () => {
    const result = await buildGarnetHearthResult(['rich.ts'], [richContent])
    expect(result.recommendations).toContain(
      'Your garnet hearth is hearth-master quality! Every ember radiates warm inner fire',
    )
  })

  it('recommends fire improvement when low', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('inner fire'))
    expect(hasRec).toBe(true)
  })

  it('recommends strength improvement when low', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('crystal structure'))
    expect(hasRec).toBe(true)
  })

  it('recommends warmth improvement when low', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('color palette'))
    expect(hasRec).toBe(true)
  })

  it('recommends commitment improvement when low', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('commitment'))
    expect(hasRec).toBe(true)
  })

  it('mentions sand files when present', async () => {
    const result = await buildGarnetHearthResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('sand'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('pyrope-treasure')).toBe('string')
    expect(typeof colorGrade('sand')).toBe('string')
    expect(typeof colorGrade('hearth-master')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatEmberTable', () => {
  it('formats an ember with labels', () => {
    const ember = analyzeGarnetEmber(richContent, 'test.ts')
    const output = formatEmberTable(ember)
    expect(output).toContain('File:')
    expect(output).toContain('test.ts')
    expect(output).toContain('Fire:')
    expect(output).toContain('Score:')
  })
})

describe('formatEmbersTable', () => {
  it('returns no embers message for empty array', () => {
    expect(formatEmbersTable([])).toContain('No garnet embers found')
  })

  it('formats multiple embers', () => {
    const e1 = analyzeGarnetEmber(richContent, 'a.ts')
    const e2 = analyzeGarnetEmber(minimalContent, 'b.ts')
    const output = formatEmbersTable([e1, e2])
    expect(output).toContain('Garnet Hearth Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatHearthTable', () => {
  it('formats a hearth with labels', async () => {
    const result = await buildGarnetHearthResult(['src/a.ts'], [richContent])
    const output = formatHearthTable(result.hearths[0]!)
    expect(output).toContain('Hearth:')
    expect(output).toContain('Type:')
    expect(output).toContain('Condition:')
  })
})

describe('formatHearthsTable', () => {
  it('returns no hearths message for empty array', () => {
    expect(formatHearthsTable([])).toContain('No garnet hearths found')
  })

  it('formats multiple hearths', async () => {
    const result = await buildGarnetHearthResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    const output = formatHearthsTable(result.hearths)
    expect(output).toContain('Garnet Hearth Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const result = await buildGarnetHearthResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Garnet Hearth Statistics')
    expect(output).toContain('Total Files:')
    expect(output).toContain('Overall Warmth:')
    expect(output).toContain('Keeper Grade:')
    expect(output).toContain('Best Ember:')
    expect(output).toContain('Most Fiery:')
    expect(output).toContain('Strongest:')
    expect(output).toContain('Warmest:')
    expect(output).toContain('Most Committed:')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const recs = ['First recommendation', 'Second recommendation']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('First recommendation')
    expect(output).toContain('Second recommendation')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildGarnetHearthResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Garnet Hearth Analysis')
    expect(output).toContain('Garnet Hearth Statistics')
    expect(output).toContain('Home')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildGarnetHearthResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.embers).toBeDefined()
    expect(parsed.hearths).toBeDefined()
    expect(parsed.home).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Grade Boundary Tests ───────────────────────────────────────────

describe('grade boundaries', () => {
  it('FireGrade boundaries are correct', () => {
    expect(measureFiring('').grade).toBe('cold-ash')
  })

  it('CrystalGrade boundaries are correct', () => {
    expect(measureStrengthening('').crystal).toBe('crumbled')
  })

  it('ColorGrade boundaries are correct', () => {
    expect(measureWarming('').color).toBe('colorless')
  })

  it('CommitmentGrade boundaries are correct', () => {
    expect(measureCommitting('').commitment).toBe('abandoned')
  })

  it('FoundationGrade boundaries are correct', () => {
    expect(measureGrounding('').foundation).toBe('no-ground')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles eval detection correctly', () => {
    expect(measureFiring('eval("code")').hasNoDull).toBe(false)
    expect(measureWarming('eval("code")').hasNoCold).toBe(false)
  })

  it('handles debugger detection correctly', () => {
    expect(measureFiring('debugger').hasNoDead).toBe(false)
    expect(measureWarming('debugger').hasNoFrosty).toBe(false)
  })

  it('handles mixed good and bad patterns', () => {
    const mixed = `${richContent}\nvar y: any = eval("test")\ndebugger`
    const m = measureFiring(mixed)
    expect(m.lifelessCount).toBe(1)
    expect(m.staticCount).toBe(1)
    expect(m.hasNoDull).toBe(false)
    expect(m.hasNoDead).toBe(false)
  })

  it('handles deeply nested content', async () => {
    const result = await buildGarnetHearthResult(
      ['a/b/c/d.ts', 'a/b/c/e.ts'],
      [richContent, richContent],
    )
    expect(result.hearths.length).toBe(1)
    expect(result.embers.length).toBe(2)
  })

  it('handles empty content', async () => {
    const result = await buildGarnetHearthResult(['empty.ts'], [''])
    expect(result.embers[0]!.qualityScore).toBe(0)
    expect(result.embers[0]!.condition).toBe('sand')
  })

  it('handles multiple files with mixed quality', async () => {
    const result = await buildGarnetHearthResult(
      ['good.ts', 'bad.ts', 'ugly.ts'],
      [richContent, minimalContent, 'var x: any = eval("")'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.sandCount).toBeGreaterThanOrEqual(1)
  })

  it('produces unique best/worst file names', async () => {
    const result = await buildGarnetHearthResult(
      ['alpha.ts', 'beta.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestEmber).toBeTruthy()
    expect(result.stats.mostFiery).toBeTruthy()
  })
})
