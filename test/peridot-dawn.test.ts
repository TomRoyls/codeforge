import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measureVitalizing,
  measureOpening,
  measureGrowing,
  measureWarming,
  classifyRayCondition,
  classifyQuarryType,
  classifyQuarryCondition,
  classifyDawnGrade,
  analyzePeridotRay,
  analyzePeridotQuarry,
  buildPeridotDawnResult,
  generateRecommendations,
} from '../src/commands/peridot-dawn-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatQuarryTable,
  formatQuarriesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/peridot-dawn-format-helpers.js'

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

// ─── measureClarifying ──────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns low clarity for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(8)
  })

  it('detects fresh (export + import)', () => {
    expect(measureClarifying(richContent).hasFresh).toBe(true)
  })

  it('detects clean (interface + const)', () => {
    expect(measureClarifying(richContent).hasClean).toBe(true)
  })

  it('detects clear (returnType + strictEq)', () => {
    expect(measureClarifying(richContent).hasClear).toBe(true)
  })

  it('detects new (namedExport + docComments)', () => {
    expect(measureClarifying(richContent).hasNew).toBe(true)
  })

  it('detects crisp (generics + class)', () => {
    expect(measureClarifying(richContent).hasCrisp).toBe(true)
  })

  it('detects luminous (export + docComments)', () => {
    expect(measureClarifying(richContent).hasLuminous).toBe(true)
  })

  it('has no stale for clean code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoStale).toBe(true)
    expect(m.staleCount).toBe(0)
  })

  it('has no muddy for clean code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoMuddy).toBe(true)
    expect(m.muddyCount).toBe(0)
  })

  it('has no outdated when no eval', () => {
    expect(measureClarifying(richContent).hasNoOutdated).toBe(true)
  })

  it('has no foggy when no debugger', () => {
    expect(measureClarifying(minimalContent).hasNoFoggy).toBe(true)
  })

  it('gives high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(70)
    expect(m.hasHighClarity).toBe(true)
  })

  it('detects stale in var code', () => {
    const m = measureClarifying('var x = 1')
    expect(m.staleCount).toBe(1)
    expect(m.hasNoStale).toBe(false)
  })

  it('detects muddy in any code', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.muddyCount).toBe(1)
    expect(m.hasNoMuddy).toBe(false)
  })

  it('assigns pitch-dark for very low scores', () => {
    expect(measureClarifying('').grade).toBe('pitch-dark')
  })

  it('assigns crystal-dawn for very high scores', () => {
    expect(measureClarifying(richContent).grade).toBe('crystal-dawn')
  })

  it('caps clarity at 100', () => {
    expect(measureClarifying(richContent).clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureVitalizing ──────────────────────────────────────────────

describe('measureVitalizing', () => {
  it('returns low vitality for minimal content', () => {
    expect(measureVitalizing(minimalContent).vitality).toBe(8)
  })

  it('detects energetic (async + export)', () => {
    expect(measureVitalizing(richContent).hasEnergetic).toBe(true)
  })

  it('detects alive (interface + class)', () => {
    expect(measureVitalizing(richContent).hasAlive).toBe(true)
  })

  it('detects vibrant (docComments + const)', () => {
    expect(measureVitalizing(richContent).hasVibrant).toBe(true)
  })

  it('detects dynamic (import + generics)', () => {
    expect(measureVitalizing(richContent).hasDynamic).toBe(true)
  })

  it('detects lively (namedExport + async)', () => {
    expect(measureVitalizing(richContent).hasLively).toBe(true)
  })

  it('detects animated (class + export)', () => {
    expect(measureVitalizing(richContent).hasAnimated).toBe(true)
  })

  it('has no lifeless for clean code', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasNoLifeless).toBe(true)
    expect(m.lifelessCount).toBe(0)
  })

  it('has no dull for clean code', () => {
    const m = measureVitalizing(richContent)
    expect(m.hasNoDull).toBe(true)
    expect(m.dullCount).toBe(0)
  })

  it('has no static when no eval', () => {
    expect(measureVitalizing(richContent).hasNoStatic).toBe(true)
  })

  it('has no sluggish when no debugger', () => {
    expect(measureVitalizing(minimalContent).hasNoSluggish).toBe(true)
  })

  it('gives high vitality for rich content', () => {
    const m = measureVitalizing(richContent)
    expect(m.vitality).toBeGreaterThanOrEqual(70)
    expect(m.hasHighVitality).toBe(true)
  })

  it('detects lifeless in var code', () => {
    const m = measureVitalizing('var x = 1')
    expect(m.lifelessCount).toBe(1)
    expect(m.hasNoLifeless).toBe(false)
  })

  it('detects dull in any code', () => {
    const m = measureVitalizing('const x: any = 1')
    expect(m.dullCount).toBe(1)
    expect(m.hasNoDull).toBe(false)
  })

  it('assigns dormant for very low scores', () => {
    expect(measureVitalizing('').energy).toBe('dormant')
  })

  it('assigns bursting-energy for very high scores', () => {
    expect(measureVitalizing(richContent).energy).toBe('bursting-energy')
  })

  it('caps vitality at 100', () => {
    expect(measureVitalizing(richContent).vitality).toBeLessThanOrEqual(100)
  })
})

// ─── measureOpening ─────────────────────────────────────────────────

describe('measureOpening', () => {
  it('returns 0 transparency for minimal content', () => {
    expect(measureOpening(minimalContent).transparency).toBe(0)
  })

  it('detects open (export + import)', () => {
    expect(measureOpening(richContent).hasOpen).toBe(true)
  })

  it('detects revealing (namedExport + interface)', () => {
    expect(measureOpening(richContent).hasRevealing).toBe(true)
  })

  it('detects transparent (returnType + docComments)', () => {
    expect(measureOpening(richContent).hasTransparent).toBe(true)
  })

  it('detects visible (typeAlias + generics)', () => {
    expect(measureOpening(richContent).hasVisible).toBe(true)
  })

  it('detects accessible (readonly + async)', () => {
    expect(measureOpening(richContent).hasAccessible).toBe(true)
  })

  it('detects clear (export + docComments)', () => {
    expect(measureOpening(richContent).hasClear).toBe(true)
  })

  it('has no hidden for clean code', () => {
    const m = measureOpening(richContent)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hiddenCount).toBe(0)
  })

  it('has no concealed for clean code', () => {
    const m = measureOpening(richContent)
    expect(m.hasNoConcealed).toBe(true)
    expect(m.concealedCount).toBe(0)
  })

  it('has no secret when no eval', () => {
    expect(measureOpening(richContent).hasNoSecret).toBe(true)
  })

  it('has no guarded when no debugger', () => {
    expect(measureOpening(minimalContent).hasNoGuarded).toBe(true)
  })

  it('gives high transparency for rich content', () => {
    const m = measureOpening(richContent)
    expect(m.transparency).toBeGreaterThanOrEqual(70)
    expect(m.hasHighTransparency).toBe(true)
  })

  it('detects hidden in var code', () => {
    const m = measureOpening('var x = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects concealed in any code', () => {
    const m = measureOpening('const x: any = 1')
    expect(m.concealedCount).toBe(1)
    expect(m.hasNoConcealed).toBe(false)
  })

  it('assigns opaque for very low scores', () => {
    expect(measureOpening('').crystal).toBe('opaque')
  })

  it('assigns fully-transparent for very high scores', () => {
    expect(measureOpening(richContent).crystal).toBe('fully-transparent')
  })

  it('caps transparency at 100', () => {
    expect(measureOpening(richContent).transparency).toBeLessThanOrEqual(100)
  })
})

// ─── measureGrowing ─────────────────────────────────────────────────

describe('measureGrowing', () => {
  it('returns low energy for minimal content', () => {
    expect(measureGrowing(minimalContent).energy).toBe(8)
  })

  it('detects expandable (interface + generics)', () => {
    expect(measureGrowing(richContent).hasExpandable).toBe(true)
  })

  it('detects scalable (typeAlias + const)', () => {
    expect(measureGrowing(richContent).hasScalable).toBe(true)
  })

  it('detects flexible (export + import)', () => {
    expect(measureGrowing(richContent).hasFlexible).toBe(true)
  })

  it('detects adaptable (namedExport + returnType)', () => {
    expect(measureGrowing(richContent).hasAdaptable).toBe(true)
  })

  it('detects evolving (docComments + interface)', () => {
    expect(measureGrowing(richContent).hasEvolving).toBe(true)
  })

  it('detects extensible (class + generics)', () => {
    expect(measureGrowing(richContent).hasExtensible).toBe(true)
  })

  it('has no rigid for clean code', () => {
    const m = measureGrowing(richContent)
    expect(m.hasNoRigid).toBe(true)
    expect(m.rigidCount).toBe(0)
  })

  it('has no fixed for clean code', () => {
    const m = measureGrowing(richContent)
    expect(m.hasNoFixed).toBe(true)
    expect(m.fixedCount).toBe(0)
  })

  it('has no locked when no eval', () => {
    expect(measureGrowing(richContent).hasNoLocked).toBe(true)
  })

  it('has no frozen when no debugger', () => {
    expect(measureGrowing(minimalContent).hasNoFrozen).toBe(true)
  })

  it('gives high energy for rich content', () => {
    const m = measureGrowing(richContent)
    expect(m.energy).toBeGreaterThanOrEqual(70)
    expect(m.hasHighEnergy).toBe(true)
  })

  it('detects rigid in var code', () => {
    const m = measureGrowing('var x = 1')
    expect(m.rigidCount).toBe(1)
    expect(m.hasNoRigid).toBe(false)
  })

  it('detects fixed in any code', () => {
    const m = measureGrowing('const x: any = 1')
    expect(m.fixedCount).toBe(1)
    expect(m.hasNoFixed).toBe(false)
  })

  it('assigns shrinking for very low scores', () => {
    expect(measureGrowing('').growth).toBe('shrinking')
  })

  it('assigns exponential-growth for very high scores', () => {
    expect(measureGrowing(richContent).growth).toBe('exponential-growth')
  })

  it('caps energy at 100', () => {
    expect(measureGrowing(richContent).energy).toBeLessThanOrEqual(100)
  })
})

// ─── measureWarming ─────────────────────────────────────────────────

describe('measureWarming', () => {
  it('returns low warmth for minimal content', () => {
    expect(measureWarming(minimalContent).warmth).toBe(8)
  })

  it('detects positive (docComments + export)', () => {
    expect(measureWarming(richContent).hasPositive).toBe(true)
  })

  it('detects cheerful (async + const)', () => {
    expect(measureWarming(richContent).hasCheerful).toBe(true)
  })

  it('detects optimistic (interface + import)', () => {
    expect(measureWarming(richContent).hasOptimistic).toBe(true)
  })

  it('detects bright (returnType + generics)', () => {
    expect(measureWarming(richContent).hasBright).toBe(true)
  })

  it('detects encouraging (typeAlias + class)', () => {
    expect(measureWarming(richContent).hasEncouraging).toBe(true)
  })

  it('detects warm (export + docComments)', () => {
    expect(measureWarming(richContent).hasWarm).toBe(true)
  })

  it('has no gloomy for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoGloomy).toBe(true)
    expect(m.gloomyCount).toBe(0)
  })

  it('has no pessimistic for clean code', () => {
    const m = measureWarming(richContent)
    expect(m.hasNoPessimistic).toBe(true)
    expect(m.pessimisticCount).toBe(0)
  })

  it('has no dark when no eval', () => {
    expect(measureWarming(richContent).hasNoDark).toBe(true)
  })

  it('has no discouraging when no debugger', () => {
    expect(measureWarming(minimalContent).hasNoDiscouraging).toBe(true)
  })

  it('gives high warmth for rich content', () => {
    const m = measureWarming(richContent)
    expect(m.warmth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighWarmth).toBe(true)
  })

  it('detects gloomy in var code', () => {
    const m = measureWarming('var x = 1')
    expect(m.gloomyCount).toBe(1)
    expect(m.hasNoGloomy).toBe(false)
  })

  it('detects pessimistic in any code', () => {
    const m = measureWarming('const x: any = 1')
    expect(m.pessimisticCount).toBe(1)
    expect(m.hasNoPessimistic).toBe(false)
  })

  it('assigns eclipse for very low scores', () => {
    expect(measureWarming('').sunlight).toBe('eclipse')
  })

  it('assigns golden-sunrise for very high scores', () => {
    expect(measureWarming(richContent).sunlight).toBe('golden-sunrise')
  })

  it('caps warmth at 100', () => {
    expect(measureWarming(richContent).warmth).toBeLessThanOrEqual(100)
  })
})

// ─── classifyRayCondition ───────────────────────────────────────────

describe('classifyRayCondition', () => {
  it('returns olivine-treasure for 85+', () => { expect(classifyRayCondition(90)).toBe('olivine-treasure') })
  it('returns fine-peridot for 70-84', () => { expect(classifyRayCondition(75)).toBe('fine-peridot') })
  it('returns proper-olivine for 55-69', () => { expect(classifyRayCondition(60)).toBe('proper-olivine') })
  it('returns chrysolite for 40-54', () => { expect(classifyRayCondition(45)).toBe('chrysolite') })
  it('returns serpentine for 25-39', () => { expect(classifyRayCondition(30)).toBe('serpentine') })
  it('returns sand for below 25', () => { expect(classifyRayCondition(10)).toBe('sand') })
})

// ─── classifyQuarryType ─────────────────────────────────────────────

describe('classifyQuarryType', () => {
  it('returns no-source for empty array', () => {
    expect(classifyQuarryType([])).toBe('no-source')
  })
})

// ─── classifyQuarryCondition ────────────────────────────────────────

describe('classifyQuarryCondition', () => {
  it('returns gem-quality for 75+', () => { expect(classifyQuarryCondition(80)).toBe('gem-quality') })
  it('returns fine-find for 60-74', () => { expect(classifyQuarryCondition(65)).toBe('fine-find') })
  it('returns decent-yield for 45-59', () => { expect(classifyQuarryCondition(50)).toBe('decent-yield') })
  it('returns low-grade for 30-44', () => { expect(classifyQuarryCondition(35)).toBe('low-grade') })
  it('returns exhausted for 15-29', () => { expect(classifyQuarryCondition(20)).toBe('exhausted') })
  it('returns barren for below 15', () => { expect(classifyQuarryCondition(5)).toBe('barren') })
})

// ─── classifyDawnGrade ──────────────────────────────────────────────

describe('classifyDawnGrade', () => {
  it('returns sun-herald for 80+', () => { expect(classifyDawnGrade(85)).toBe('sun-herald') })
  it('returns dawn-bringer for 65-79', () => { expect(classifyDawnGrade(70)).toBe('dawn-bringer') })
  it('returns morning-star for 50-64', () => { expect(classifyDawnGrade(55)).toBe('morning-star') })
  it('returns early-bird for 35-49', () => { expect(classifyDawnGrade(40)).toBe('early-bird') })
  it('returns late-riser for 20-34', () => { expect(classifyDawnGrade(25)).toBe('late-riser') })
  it('returns night-owl for below 20', () => { expect(classifyDawnGrade(10)).toBe('night-owl') })
})

// ─── analyzePeridotRay ──────────────────────────────────────────────

describe('analyzePeridotRay', () => {
  it('returns correct file path', () => {
    expect(analyzePeridotRay(minimalContent, 'index.ts').file).toBe('index.ts')
  })

  it('calculates qualityScore of 6 for minimal content', () => {
    expect(analyzePeridotRay(minimalContent, 'index.ts').qualityScore).toBe(6)
  })

  it('classifies minimal as sand', () => {
    expect(analyzePeridotRay(minimalContent, 'index.ts').condition).toBe('sand')
  })

  it('has all measure fields', () => {
    const ray = analyzePeridotRay(minimalContent, 'index.ts')
    expect(ray).toHaveProperty('clarifying')
    expect(ray).toHaveProperty('vitalizing')
    expect(ray).toHaveProperty('opening')
    expect(ray).toHaveProperty('growing')
    expect(ray).toHaveProperty('warming')
  })

  it('returns high qualityScore for rich content', () => {
    expect(analyzePeridotRay(richContent, 'rich.ts').qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('classifies rich as olivine-treasure', () => {
    expect(analyzePeridotRay(richContent, 'rich.ts').condition).toBe('olivine-treasure')
  })

  it('has all score fields as numbers', () => {
    const ray = analyzePeridotRay(minimalContent, 'index.ts')
    expect(typeof ray.morningClarity).toBe('number')
    expect(typeof ray.freshVitality).toBe('number')
    expect(typeof ray.crystalTransparency).toBe('number')
    expect(typeof ray.growthEnergy).toBe('number')
    expect(typeof ray.sunlightWarmth).toBe('number')
  })
})

// ─── analyzePeridotQuarry ───────────────────────────────────────────

describe('analyzePeridotQuarry', () => {
  it('returns empty quarry for no rays', () => {
    const quarry = analyzePeridotQuarry([], 'src')
    expect(quarry.directory).toBe('src')
    expect(quarry.rays.length).toBe(0)
    expect(quarry.avgClarity).toBe(0)
    expect(quarry.avgVitality).toBe(0)
    expect(quarry.avgTransparency).toBe(0)
    expect(quarry.quarryType).toBe('no-source')
    expect(quarry.condition).toBe('barren')
  })

  it('computes averages from rays', () => {
    const r1 = analyzePeridotRay(richContent, 'a.ts')
    const r2 = analyzePeridotRay(richContent, 'b.ts')
    const quarry = analyzePeridotQuarry([r1, r2], 'src')
    expect(quarry.avgClarity).toBe(r1.morningClarity)
    expect(quarry.avgVitality).toBe(r1.freshVitality)
  })
})

// ─── buildPeridotDawnResult ─────────────────────────────────────────

describe('buildPeridotDawnResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildPeridotDawnResult([], [])
    expect(result.rays.length).toBe(0)
    expect(result.quarries.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.sunrise.isDawning).toBe(false)
    expect(result.sunrise.overallBrightness).toBe(0)
  })

  it('returns correct structure for single file', async () => {
    const result = await buildPeridotDawnResult(['index.ts'], [richContent])
    expect(result.rays.length).toBe(1)
    expect(result.quarries.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestRay).toBe('index.ts')
    expect(result.stats.clearest).toBe('index.ts')
    expect(result.stats.mostVital).toBe('index.ts')
    expect(result.stats.mostTransparent).toBe('index.ts')
    expect(result.stats.warmest).toBe('index.ts')
  })

  it('computes sunrise.isDawning when avgClarity >= 60', async () => {
    const result = await buildPeridotDawnResult(['rich.ts'], [richContent])
    expect(result.sunrise.isDawning).toBe(true)
  })

  it('computes overallBrightness correctly', async () => {
    const result = await buildPeridotDawnResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.sunrise.avgClarity + result.sunrise.avgVitality + result.sunrise.avgTransparency) / 3,
    )
    expect(result.sunrise.overallBrightness).toBe(expected)
  })

  it('counts condition categories correctly', async () => {
    const result = await buildPeridotDawnResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.olivineTreasureCount + result.stats.finePeridotCount +
      result.stats.properOlivineCount + result.stats.chrysoliteCount +
      result.stats.serpentineCount + result.stats.sandCount).toBe(2)
  })

  it('counts high measure flags correctly', async () => {
    const result = await buildPeridotDawnResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighTransparencyCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighEnergyCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighWarmthCount).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory into quarries', async () => {
    const result = await buildPeridotDawnResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.quarries.length).toBe(2)
  })

  it('sets dawnGrade based on overallBrightness', async () => {
    const result = await buildPeridotDawnResult(['rich.ts'], [richContent])
    expect(result.stats.dawnGrade).toBe(classifyDawnGrade(result.sunrise.overallBrightness))
  })

  it('returns minimal content qualityScore of 6', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    expect(result.rays[0]!.qualityScore).toBe(6)
  })

  it('returns recommendations array', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message when all metrics are good', async () => {
    const result = await buildPeridotDawnResult(['rich.ts'], [richContent])
    expect(result.recommendations).toContain(
      'Your peridot dawn is sun-herald quality! Every ray radiates golden morning light',
    )
  })

  it('recommends clarity improvement when low', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('morning clarity'))
    expect(hasRec).toBe(true)
  })

  it('recommends vitality improvement when low', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('fresh vitality'))
    expect(hasRec).toBe(true)
  })

  it('recommends transparency improvement when low', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('crystal transparency'))
    expect(hasRec).toBe(true)
  })

  it('recommends growth improvement when low', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('growth energy'))
    expect(hasRec).toBe(true)
  })

  it('mentions sand files when present', async () => {
    const result = await buildPeridotDawnResult(['min.ts'], [minimalContent])
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
    expect(typeof colorGrade('olivine-treasure')).toBe('string')
    expect(typeof colorGrade('sand')).toBe('string')
    expect(typeof colorGrade('sun-herald')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray with labels', () => {
    const ray = analyzePeridotRay(richContent, 'test.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('File:')
    expect(output).toContain('test.ts')
    expect(output).toContain('Clarity:')
    expect(output).toContain('Score:')
  })
})

describe('formatRaysTable', () => {
  it('returns no rays message for empty array', () => {
    expect(formatRaysTable([])).toContain('No peridot rays found')
  })

  it('formats multiple rays', () => {
    const r1 = analyzePeridotRay(richContent, 'a.ts')
    const r2 = analyzePeridotRay(minimalContent, 'b.ts')
    const output = formatRaysTable([r1, r2])
    expect(output).toContain('Peridot Dawn Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatQuarryTable', () => {
  it('formats a quarry with labels', async () => {
    const result = await buildPeridotDawnResult(['src/a.ts'], [richContent])
    const output = formatQuarryTable(result.quarries[0]!)
    expect(output).toContain('Quarry:')
    expect(output).toContain('Type:')
    expect(output).toContain('Condition:')
  })
})

describe('formatQuarriesTable', () => {
  it('returns no quarries message for empty array', () => {
    expect(formatQuarriesTable([])).toContain('No peridot quarries found')
  })

  it('formats multiple quarries', async () => {
    const result = await buildPeridotDawnResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    const output = formatQuarriesTable(result.quarries)
    expect(output).toContain('Peridot Dawn Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const result = await buildPeridotDawnResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Peridot Dawn Statistics')
    expect(output).toContain('Total Files:')
    expect(output).toContain('Overall Brightness:')
    expect(output).toContain('Dawn Grade:')
    expect(output).toContain('Best Ray:')
    expect(output).toContain('Clearest:')
    expect(output).toContain('Most Vital:')
    expect(output).toContain('Most Transparent:')
    expect(output).toContain('Warmest:')
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
    const result = await buildPeridotDawnResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Peridot Dawn Analysis')
    expect(output).toContain('Peridot Dawn Statistics')
    expect(output).toContain('Sunrise')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildPeridotDawnResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toBeDefined()
    expect(parsed.quarries).toBeDefined()
    expect(parsed.sunrise).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Grade Boundary Tests ───────────────────────────────────────────

describe('grade boundaries', () => {
  it('ClarityGrade boundaries are correct', () => {
    expect(measureClarifying('').grade).toBe('pitch-dark')
  })

  it('VitalityGrade boundaries are correct', () => {
    expect(measureVitalizing('').energy).toBe('dormant')
  })

  it('CrystalGrade boundaries are correct', () => {
    expect(measureOpening('').crystal).toBe('opaque')
  })

  it('GrowthGrade boundaries are correct', () => {
    expect(measureGrowing('').growth).toBe('shrinking')
  })

  it('SunlightGrade boundaries are correct', () => {
    expect(measureWarming('').sunlight).toBe('eclipse')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles eval detection correctly', () => {
    expect(measureClarifying('eval("code")').hasNoOutdated).toBe(false)
    expect(measureOpening('eval("code")').hasNoSecret).toBe(false)
  })

  it('handles debugger detection correctly', () => {
    expect(measureClarifying('debugger').hasNoFoggy).toBe(false)
    expect(measureOpening('debugger').hasNoGuarded).toBe(false)
  })

  it('handles mixed good and bad patterns', () => {
    const mixed = `${richContent}\nvar y: any = eval("test")\ndebugger`
    const m = measureClarifying(mixed)
    expect(m.staleCount).toBe(1)
    expect(m.muddyCount).toBe(1)
    expect(m.hasNoOutdated).toBe(false)
    expect(m.hasNoFoggy).toBe(false)
  })

  it('handles deeply nested content', async () => {
    const result = await buildPeridotDawnResult(
      ['a/b/c/d.ts', 'a/b/c/e.ts'],
      [richContent, richContent],
    )
    expect(result.quarries.length).toBe(1)
    expect(result.rays.length).toBe(2)
  })

  it('handles empty content', async () => {
    const result = await buildPeridotDawnResult(['empty.ts'], [''])
    expect(result.rays[0]!.qualityScore).toBe(0)
    expect(result.rays[0]!.condition).toBe('sand')
  })

  it('handles multiple files with mixed quality', async () => {
    const result = await buildPeridotDawnResult(
      ['good.ts', 'bad.ts', 'ugly.ts'],
      [richContent, minimalContent, 'var x: any = eval("")'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.sandCount).toBeGreaterThanOrEqual(1)
  })

  it('produces unique best/worst file names', async () => {
    const result = await buildPeridotDawnResult(
      ['alpha.ts', 'beta.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestRay).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
  })
})
