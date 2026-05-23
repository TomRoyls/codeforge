import { describe, it, expect } from 'vitest'
import {
  measureReflecting, measureCalming, measureClarifying, measureRippling, measureBalancing,
  classifyLakeCondition, classifyLakeType, classifyKeeperGrade, classifyWatershedCondition,
  generateRecommendations, analyzeLakeReflection, analyzeLakeSystem,
  buildMirrorLakeResult,
} from '../src/commands/mirror-lake-helpers.js'
import {
  colorScore, colorGrade, formatReflectionTable, formatReflectionsTable,
  formatLakeTable, formatLakesTable, formatStatsTable,
  formatRecommendations, formatResultTable, formatResultJson,
} from '../src/commands/mirror-lake-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const EMPTY = ''

const RICH = [
  '/**',
  ' * Doc comment',
  ' */',
  'export interface Foo<T> { readonly bar: string }',
  'export type Result = string | number',
  'export class MyClass {',
  '  private x: number = 0',
  '}',
  'export const fn = async (): Promise<string> => {',
  '  const a: string = \'hello\'',
  '  if (a === \'test\') { return a }',
  '  return \'world\'',
  '}',
  'import path from \'node:path\'',
].join('\n')

const MINIMAL = 'const x = 1'

const BAD = 'export var x: any = 1; var y: any = 2; debugger;'

// ─── measureReflecting ─────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns quality=0 and opaque for empty content', () => {
    const m = measureReflecting(EMPTY)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('opaque')
  })

  it('returns quality=100 and perfect-mirror for rich content', () => {
    const m = measureReflecting(RICH)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('perfect-mirror')
  })

  it('returns quality=8 for minimal content (only const)', () => {
    expect(measureReflecting(MINIMAL).quality).toBe(8)
  })

  it('detects blind and unaware in bad content', () => {
    const m = measureReflecting(BAD)
    expect(m.blindCount).toBe(2)
    expect(m.unawareCount).toBe(2)
    expect(m.hasNoBlind).toBe(false)
    expect(m.hasNoUnaware).toBe(false)
  })

  it('sets hasHighQuality=true for rich content', () => {
    expect(measureReflecting(RICH).hasHighQuality).toBe(true)
  })

  it('sets hasHighQuality=false for empty content', () => {
    expect(measureReflecting(EMPTY).hasHighQuality).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureReflecting(RICH)
    expect(m.hasSelfAware).toBe(true)
    expect(m.hasIntrospective).toBe(true)
    expect(m.hasReflective).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasIlluminating).toBe(true)
  })

  it('detects noHidden and noConcealing for clean content', () => {
    const m = measureReflecting(RICH)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoConcealing).toBe(true)
  })

  it('detects eval as hidden', () => {
    expect(measureReflecting('eval("x")').hasNoHidden).toBe(false)
  })

  it('detects debugger as concealing', () => {
    expect(measureReflecting('debugger').hasNoConcealing).toBe(false)
  })

  it('returns opaque for score < 25', () => {
    expect(measureReflecting('').grade).toBe('opaque')
  })

  it('returns rippled for score 25-39', () => {
    const content = 'export const x = 1\nconst y = 2\nexport const z = 3'
    const m = measureReflecting(content)
    expect(m.quality).toBeGreaterThanOrEqual(25)
    expect(m.quality).toBeLessThan(40)
    expect(m.grade).toBe('rippled')
  })
})

// ─── measureCalming ─────────────────────────────────────────────────

describe('measureCalming', () => {
  it('returns calm=0 and stormy for empty content', () => {
    const m = measureCalming(EMPTY)
    expect(m.calm).toBe(0)
    expect(m.surface).toBe('stormy')
  })

  it('returns calm=100 and glass-surface for rich content', () => {
    const m = measureCalming(RICH)
    expect(m.calm).toBe(100)
    expect(m.surface).toBe('glass-surface')
  })

  it('returns calm=10 for minimal content (only const)', () => {
    expect(measureCalming(MINIMAL).calm).toBe(10)
  })

  it('detects turbulent and chaotic in bad content', () => {
    const m = measureCalming(BAD)
    expect(m.turbulentCount).toBe(2)
    expect(m.chaoticCount).toBe(2)
    expect(m.hasNoTurbulent).toBe(false)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('sets hasHighCalm=true for rich content', () => {
    expect(measureCalming(RICH).hasHighCalm).toBe(true)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureCalming(RICH)
    expect(m.hasStable).toBe(true)
    expect(m.hasSteady).toBe(true)
    expect(m.hasPeaceful).toBe(true)
    expect(m.hasSerene).toBe(true)
    expect(m.hasTranquil).toBe(true)
    expect(m.hasSmooth).toBe(true)
  })

  it('detects eval as violent', () => {
    expect(measureCalming('eval("x")').hasNoViolent).toBe(false)
  })

  it('detects debugger as agitated', () => {
    expect(measureCalming('debugger').hasNoAgitated).toBe(false)
  })
})

// ─── measureClarifying ──────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns clarity=0 and opaque-depth for empty content', () => {
    const m = measureClarifying(EMPTY)
    expect(m.clarity).toBe(0)
    expect(m.depth).toBe('opaque-depth')
  })

  it('returns clarity=100 and crystal-clear for rich content', () => {
    const m = measureClarifying(RICH)
    expect(m.clarity).toBe(100)
    expect(m.depth).toBe('crystal-clear')
  })

  it('returns clarity=8 for minimal content', () => {
    expect(measureClarifying(MINIMAL).clarity).toBe(8)
  })

  it('detects cryptic and opaque counts in bad content', () => {
    const m = measureClarifying(BAD)
    expect(m.crypticCount).toBe(2)
    expect(m.opaqueCount).toBe(2)
    expect(m.hasNoCryptic).toBe(false)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureClarifying(RICH)
    expect(m.hasUnderstandable).toBe(true)
    expect(m.hasReadable).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects eval as hidden in clarifying', () => {
    expect(measureClarifying('eval("x")').hasNoHidden).toBe(false)
  })

  it('detects debugger as murky', () => {
    expect(measureClarifying('debugger').hasNoMurky).toBe(false)
  })

  it('sets hasHighClarity=true for rich content', () => {
    expect(measureClarifying(RICH).hasHighClarity).toBe(true)
  })
})

// ─── measureRippling ────────────────────────────────────────────────

describe('measureRippling', () => {
  it('returns resilience=0 and permanent-wave for empty content', () => {
    const m = measureRippling(EMPTY)
    expect(m.resilience).toBe(0)
    expect(m.recovery).toBe('permanent-wave')
  })

  it('returns resilience=100 and instant-calm for rich content', () => {
    const m = measureRippling(RICH)
    expect(m.resilience).toBe(100)
    expect(m.recovery).toBe('instant-calm')
  })

  it('returns resilience=10 for minimal content (const + strictEq from ===)', () => {
    const m = measureRippling(MINIMAL)
    expect(m.resilience).toBe(10)
  })

  it('detects brittle and fragile in bad content', () => {
    const m = measureRippling(BAD)
    expect(m.brittleCount).toBe(2)
    expect(m.fragileCount).toBe(2)
    expect(m.hasNoBrittle).toBe(false)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureRippling(RICH)
    expect(m.hasRecoverable).toBe(true)
    expect(m.hasAdaptive).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasElastic).toBe(true)
    expect(m.hasBouncing).toBe(true)
    expect(m.hasFlexible).toBe(true)
  })

  it('detects eval as rigid', () => {
    expect(measureRippling('eval("x")').hasNoRigid).toBe(false)
  })

  it('detects debugger as breaking', () => {
    expect(measureRippling('debugger').hasNoBreaking).toBe(false)
  })

  it('sets hasHighResilience=true for rich content', () => {
    expect(measureRippling(RICH).hasHighResilience).toBe(true)
  })
})

// ─── measureBalancing ───────────────────────────────────────────────

describe('measureBalancing', () => {
  it('returns balance=0 and dead-water for empty content', () => {
    const m = measureBalancing(EMPTY)
    expect(m.balance).toBe(0)
    expect(m.ecosystem).toBe('dead-water')
  })

  it('returns balance=100 and pristine-ecosystem for rich content', () => {
    const m = measureBalancing(RICH)
    expect(m.balance).toBe(100)
    expect(m.ecosystem).toBe('pristine-ecosystem')
  })

  it('returns balance=8 for minimal content (only const)', () => {
    expect(measureBalancing(MINIMAL).balance).toBe(8)
  })

  it('detects conflicting and parasitic in bad content', () => {
    const m = measureBalancing(BAD)
    expect(m.conflictingCount).toBe(2)
    expect(m.parasiticCount).toBe(2)
    expect(m.hasNoConflicting).toBe(false)
    expect(m.hasNoParasitic).toBe(false)
  })

  it('detects all combo booleans true for rich content', () => {
    const m = measureBalancing(RICH)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasBalanced).toBe(true)
    expect(m.hasSymbiotic).toBe(true)
    expect(m.hasIntegrated).toBe(true)
    expect(m.hasCooperative).toBe(true)
    expect(m.hasCohesive).toBe(true)
  })

  it('detects eval as fragmented', () => {
    expect(measureBalancing('eval("x")').hasNoFragmented).toBe(false)
  })

  it('detects debugger as competing', () => {
    expect(measureBalancing('debugger').hasNoCompeting).toBe(false)
  })

  it('sets hasHighBalance=true for rich content', () => {
    expect(measureBalancing(RICH).hasHighBalance).toBe(true)
  })
})

// ─── classifyLakeCondition ──────────────────────────────────────────

describe('classifyLakeCondition', () => {
  it('returns mountain-lake for score >= 85', () => {
    expect(classifyLakeCondition(90)).toBe('mountain-lake')
    expect(classifyLakeCondition(85)).toBe('mountain-lake')
  })

  it('returns clear-pond for score 70-84', () => {
    expect(classifyLakeCondition(70)).toBe('clear-pond')
    expect(classifyLakeCondition(84)).toBe('clear-pond')
  })

  it('returns proper-lake for score 55-69', () => {
    expect(classifyLakeCondition(55)).toBe('proper-lake')
    expect(classifyLakeCondition(69)).toBe('proper-lake')
  })

  it('returns murky-pool for score 40-54', () => {
    expect(classifyLakeCondition(40)).toBe('murky-pool')
    expect(classifyLakeCondition(54)).toBe('murky-pool')
  })

  it('returns stagnant-water for score 25-39', () => {
    expect(classifyLakeCondition(25)).toBe('stagnant-water')
    expect(classifyLakeCondition(39)).toBe('stagnant-water')
  })

  it('returns dry-bed for score < 25', () => {
    expect(classifyLakeCondition(0)).toBe('dry-bed')
    expect(classifyLakeCondition(24)).toBe('dry-bed')
  })
})

// ─── classifyLakeType ───────────────────────────────────────────────

describe('classifyLakeType', () => {
  it('returns no-water for empty reflections', () => {
    expect(classifyLakeType([])).toBe('no-water')
  })

  it('returns great-lake for high avg and 50%+ mountain-lake', () => {
    const reflections = [
      { qualityScore: 90, condition: 'mountain-lake' } as LakeReflection,
      { qualityScore: 80, condition: 'mountain-lake' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('great-lake')
  })

  it('returns mountain-lake for avg >= 60 but not great-lake', () => {
    const reflections = [
      { qualityScore: 65, condition: 'clear-pond' } as LakeReflection,
      { qualityScore: 60, condition: 'clear-pond' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('mountain-lake')
  })

  it('returns forest-pond for avg >= 45', () => {
    const reflections = [
      { qualityScore: 50, condition: 'proper-lake' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('forest-pond')
  })

  it('returns garden-pool for avg >= 30', () => {
    const reflections = [
      { qualityScore: 35, condition: 'murky-pool' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('garden-pool')
  })

  it('returns puddle for avg >= 15', () => {
    const reflections = [
      { qualityScore: 20, condition: 'stagnant-water' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('puddle')
  })

  it('returns no-water for avg < 15', () => {
    const reflections = [
      { qualityScore: 10, condition: 'dry-bed' } as LakeReflection,
    ]
    expect(classifyLakeType(reflections)).toBe('no-water')
  })
})

// ─── classifyKeeperGrade ────────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns lake-guardian for >= 80', () => {
    expect(classifyKeeperGrade(80)).toBe('lake-guardian')
    expect(classifyKeeperGrade(100)).toBe('lake-guardian')
  })

  it('returns master-angler for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('master-angler')
    expect(classifyKeeperGrade(79)).toBe('master-angler')
  })

  it('returns skilled-ranger for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('skilled-ranger')
    expect(classifyKeeperGrade(64)).toBe('skilled-ranger')
  })

  it('returns fisherman for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('fisherman')
    expect(classifyKeeperGrade(49)).toBe('fisherman')
  })

  it('returns tourist for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('tourist')
    expect(classifyKeeperGrade(34)).toBe('tourist')
  })

  it('returns polluter for < 20', () => {
    expect(classifyKeeperGrade(0)).toBe('polluter')
    expect(classifyKeeperGrade(19)).toBe('polluter')
  })
})

// ─── classifyWatershedCondition ─────────────────────────────────────

describe('classifyWatershedCondition', () => {
  it('returns pristine-waters for >= 75', () => {
    expect(classifyWatershedCondition(75)).toBe('pristine-waters')
    expect(classifyWatershedCondition(100)).toBe('pristine-waters')
  })

  it('returns healthy-lake for 60-74', () => {
    expect(classifyWatershedCondition(60)).toBe('healthy-lake')
    expect(classifyWatershedCondition(74)).toBe('healthy-lake')
  })

  it('returns decent-pond for 45-59', () => {
    expect(classifyWatershedCondition(45)).toBe('decent-pond')
  })

  it('returns murky-pool for 30-44', () => {
    expect(classifyWatershedCondition(30)).toBe('murky-pool')
  })

  it('returns stagnant for 15-29', () => {
    expect(classifyWatershedCondition(15)).toBe('stagnant')
  })

  it('returns dried-up for < 15', () => {
    expect(classifyWatershedCondition(0)).toBe('dried-up')
  })
})

// ─── analyzeLakeReflection ──────────────────────────────────────────

describe('analyzeLakeReflection', () => {
  it('returns dry-bed for empty content', () => {
    const r = analyzeLakeReflection(EMPTY, 'empty.ts')
    expect(r.condition).toBe('dry-bed')
    expect(r.qualityScore).toBe(0)
    expect(r.file).toBe('empty.ts')
  })

  it('returns mountain-lake for rich content', () => {
    const r = analyzeLakeReflection(RICH, 'rich.ts')
    expect(r.condition).toBe('mountain-lake')
    expect(r.qualityScore).toBe(100)
    expect(r.reflectionQuality).toBe(100)
    expect(r.surfaceCalm).toBe(100)
    expect(r.depthClarity).toBe(100)
    expect(r.rippleResilience).toBe(100)
    expect(r.ecosystemBalance).toBe(100)
  })

  it('computes qualityScore as average of 5 measures', () => {
    const r = analyzeLakeReflection(MINIMAL, 'min.ts')
    const expected = Math.round(
      r.reflecting.quality * 0.2 +
      r.calming.calm * 0.2 +
      r.clarifying.clarity * 0.2 +
      r.rippling.resilience * 0.2 +
      r.balancing.balance * 0.2,
    )
    expect(r.qualityScore).toBe(expected)
  })

  it('includes all sub-measurements', () => {
    const r = analyzeLakeReflection(RICH, 'full.ts')
    expect(r.reflecting).toBeDefined()
    expect(r.calming).toBeDefined()
    expect(r.clarifying).toBeDefined()
    expect(r.rippling).toBeDefined()
    expect(r.balancing).toBeDefined()
  })
})

// ─── analyzeLakeSystem ──────────────────────────────────────────────

describe('analyzeLakeSystem', () => {
  it('returns empty lake for no reflections', () => {
    const lake = analyzeLakeSystem([], 'empty-dir')
    expect(lake.lakeType).toBe('no-water')
    expect(lake.condition).toBe('dried-up')
    expect(lake.avgCalm).toBe(0)
    expect(lake.avgClarity).toBe(0)
    expect(lake.avgBalance).toBe(0)
    expect(lake.mountainLakeCount).toBe(0)
    expect(lake.dryBedCount).toBe(0)
  })

  it('computes averages from reflections', () => {
    const reflections = [
      analyzeLakeReflection(RICH, 'a.ts'),
      analyzeLakeReflection(RICH, 'b.ts'),
    ]
    const lake = analyzeLakeSystem(reflections, 'src')
    expect(lake.avgCalm).toBe(100)
    expect(lake.avgClarity).toBe(100)
    expect(lake.avgBalance).toBe(100)
    expect(lake.mountainLakeCount).toBe(2)
    expect(lake.dryBedCount).toBe(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns success message for perfect results', () => {
    const r = analyzeLakeReflection(RICH, 'perfect.ts')
    const reflections = [r]
    const lake = analyzeLakeSystem(reflections, 'src')
    const watershed = { avgCalm: 100, avgClarity: 100, avgBalance: 100, isClear: true, overallSerenity: 100 }
    const stats = {
      avgReflectionQuality: 100, avgSurfaceCalm: 100, avgDepthClarity: 100,
      avgRippleResilience: 100, avgEcosystemBalance: 100, dryBedCount: 0,
    } as any
    const recs = generateRecommendations(reflections, [lake], watershed, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improving reflection quality when low', () => {
    const r = analyzeLakeReflection(EMPTY, 'bad.ts')
    const reflections = [r]
    const lake = analyzeLakeSystem(reflections, 'src')
    const watershed = { avgCalm: 0, avgClarity: 0, avgBalance: 0, isClear: false, overallSerenity: 0 }
    const stats = {
      avgReflectionQuality: 0, avgSurfaceCalm: 0, avgDepthClarity: 0,
      avgRippleResilience: 0, avgEcosystemBalance: 0, dryBedCount: 1,
    } as any
    const recs = generateRecommendations(reflections, [lake], watershed, stats)
    expect(recs.length).toBeGreaterThan(1)
    expect(recs.some(r => r.includes('reflection quality'))).toBe(true)
  })

  it('warns about dry beds', () => {
    const r = analyzeLakeReflection(EMPTY, 'bad.ts')
    const reflections = [r]
    const lake = analyzeLakeSystem(reflections, 'src')
    const watershed = { avgCalm: 0, avgClarity: 0, avgBalance: 0, isClear: false, overallSerenity: 0 }
    const stats = {
      avgReflectionQuality: 0, avgSurfaceCalm: 0, avgDepthClarity: 0,
      avgRippleResilience: 0, avgEcosystemBalance: 0, dryBedCount: 1,
    } as any
    const recs = generateRecommendations(reflections, [lake], watershed, stats)
    expect(recs.some(r => r.includes('dry bed'))).toBe(true)
  })

  it('lists specific dry-bed files when 3 or fewer', () => {
    const r1 = analyzeLakeReflection(EMPTY, 'a.ts')
    const r2 = analyzeLakeReflection(EMPTY, 'b.ts')
    const reflections = [r1, r2]
    const lake = analyzeLakeSystem(reflections, 'src')
    const watershed = { avgCalm: 0, avgClarity: 0, avgBalance: 0, isClear: false, overallSerenity: 0 }
    const stats = {
      avgReflectionQuality: 0, avgSurfaceCalm: 0, avgDepthClarity: 0,
      avgRippleResilience: 0, avgEcosystemBalance: 0, dryBedCount: 2,
    } as any
    const recs = generateRecommendations(reflections, [lake], watershed, stats)
    expect(recs.some(r => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildMirrorLakeResult ──────────────────────────────────────────

describe('buildMirrorLakeResult', () => {
  it('handles empty input', async () => {
    const result = await buildMirrorLakeResult([], [])
    expect(result.reflections).toHaveLength(0)
    expect(result.lakes).toHaveLength(0)
    expect(result.watershed.overallSerenity).toBe(0)
    expect(result.watershed.isClear).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.keeperGrade).toBe('polluter')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', async () => {
    const result = await buildMirrorLakeResult(['test.ts'], [RICH])
    expect(result.reflections).toHaveLength(1)
    expect(result.lakes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgReflectionQuality).toBe(100)
    expect(result.stats.bestReflection).toBe('test.ts')
    expect(result.stats.mostReflective).toBe('test.ts')
    expect(result.stats.calmest).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.mostResilient).toBe('test.ts')
  })

  it('handles multiple files in same directory', async () => {
    const result = await buildMirrorLakeResult(
      ['src/a.ts', 'src/b.ts'],
      [RICH, RICH],
    )
    expect(result.reflections).toHaveLength(2)
    expect(result.lakes).toHaveLength(1)
    expect(result.lakes[0].directory).toBe('src')
    expect(result.lakes[0].reflections).toHaveLength(2)
  })

  it('handles multiple directories', async () => {
    const result = await buildMirrorLakeResult(
      ['src/a.ts', 'lib/b.ts'],
      [RICH, EMPTY],
    )
    expect(result.lakes).toHaveLength(2)
  })

  it('computes watershed correctly', async () => {
    const result = await buildMirrorLakeResult(['test.ts'], [RICH])
    expect(result.watershed.avgCalm).toBe(100)
    expect(result.watershed.avgClarity).toBe(100)
    expect(result.watershed.avgBalance).toBe(100)
    expect(result.watershed.isClear).toBe(true)
    expect(result.watershed.overallSerenity).toBe(100)
  })

  it('computes stats correctly', async () => {
    const result = await buildMirrorLakeResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.mountainLakeCount).toBe(1)
    expect(result.stats.dryBedCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighCalmCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
    expect(result.stats.hasHighBalanceCount).toBe(1)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all score tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(65)).toBe('string')
    expect(typeof colorScore(45)).toBe('string')
    expect(typeof colorScore(25)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('mountain-lake')).toBe('string')
    expect(typeof colorGrade('dry-bed')).toBe('string')
    expect(typeof colorGrade('great-lake')).toBe('string')
    expect(typeof colorGrade('lake-guardian')).toBe('string')
    expect(typeof colorGrade('polluter')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatReflectionTable', () => {
  it('formats a reflection with all fields', () => {
    const r = analyzeLakeReflection(RICH, 'test.ts')
    const output = formatReflectionTable(r)
    expect(output).toContain('test.ts')
    expect(output).toContain('Reflection Quality')
    expect(output).toContain('Surface Calm')
    expect(output).toContain('Depth Clarity')
    expect(output).toContain('Ripple Resilience')
    expect(output).toContain('Ecosystem Balance')
    expect(output).toContain('Score')
  })
})

describe('formatReflectionsTable', () => {
  it('returns no-reflections message for empty array', () => {
    const output = formatReflectionsTable([])
    expect(output).toContain('No lake reflections found')
  })

  it('formats multiple reflections', () => {
    const reflections = [
      analyzeLakeReflection(RICH, 'a.ts'),
      analyzeLakeReflection(EMPTY, 'b.ts'),
    ]
    const output = formatReflectionsTable(reflections)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
    expect(output).toContain('Mirror Lake Reflection Analysis')
  })
})

describe('formatLakeTable', () => {
  it('formats a lake system', () => {
    const reflections = [analyzeLakeReflection(RICH, 'a.ts')]
    const lake = analyzeLakeSystem(reflections, 'src')
    const output = formatLakeTable(lake)
    expect(output).toContain('src')
    expect(output).toContain('Type')
    expect(output).toContain('Condition')
  })
})

describe('formatLakesTable', () => {
  it('returns no-lakes message for empty array', () => {
    expect(formatLakesTable([])).toContain('No lake systems found')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildMirrorLakeResult(['test.ts'], [RICH])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Mirror Lake Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Keeper Grade')
    expect(output).toContain('Best Reflection')
  })
})

describe('formatRecommendations', () => {
  it('returns no-recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const output = formatRecommendations(['Improve reflection', 'Fix calm'])
    expect(output).toContain('Recommendations')
    expect(output).toContain('Improve reflection')
    expect(output).toContain('Fix calm')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMirrorLakeResult(['test.ts'], [RICH])
    const output = formatResultTable(result)
    expect(output).toContain('Mirror Lake Reflection Analysis')
    expect(output).toContain('Lake System Analysis')
    expect(output).toContain('Mirror Lake Statistics')
    expect(output).toContain('Watershed')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMirrorLakeResult(['test.ts'], [RICH])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.reflections).toHaveLength(1)
    expect(parsed.watershed.overallSerenity).toBe(100)
  })
})
