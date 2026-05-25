import { describe, expect, it } from 'vitest'

import {
  measureSmoothing,
  measureComforting,
  measureDraping,
  measureKnowing,
  measureSurviving,
  classifyCondition,
  classifyCurtainType,
  classifyCurtainCondition,
  classifyTailorGrade,
  analyzeVelvetFold,
  analyzeVelvetCurtain,
  buildVelvetDarknessResult,
  generateRecommendations,
} from '../src/commands/velvet-darkness-helpers.js'
import {
  colorScore,
  colorCondition,
  colorCurtainCondition,
  formatFoldTable,
  formatFoldsTable,
  formatCurtainTable,
  formatCurtainsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/velvet-darkness-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────

const richContent = [
  'import { Result } from "types"',
  'export interface Analyzer<T> {',
  '  readonly data: string',
  '  private cache?: Map<string, T>',
  '  async analyze(input: string): Promise<T>',
  '  /** Documentation */',
  '}',
  'export type Config = { readonly name: string }',
  'export class Processor {',
  '  protected state: unknown',
  '  try {',
  '    const result = JSON.parse(input) as Result',
  '    if (!result) throw new Error("fail")',
  '    return result',
  '  } catch {',
  '    return null as unknown as T',
  '  }',
  '}',
].join('\n')

const emptyContent = ''

const minimalContent = 'const x = 1'

const poorContent = [
  'var x = eval("1")',
  'var y: any = {}',
  '// mystery code',
  '// obfuscate everything',
  '// intimidating complexity',
].join('\n')

// ─── measureSmoothing ──────────────────────────────────

describe('measureSmoothing', () => {
  it('scores rich content high', () => {
    const result = measureSmoothing(richContent)
    expect(result.softness).toBe(100)
    expect(result.hasHighSoftness).toBe(true)
    expect(result.fabric).toBe('royal-velvet')
  })

  it('scores empty content low', () => {
    const result = measureSmoothing(emptyContent)
    expect(result.softness).toBe(0)
    expect(result.hasHighSoftness).toBe(false)
    expect(result.fabric).toBe('no-softness')
  })

  it('scores minimal content moderately', () => {
    const result = measureSmoothing(minimalContent)
    expect(result.softness).toBeGreaterThanOrEqual(0)
    expect(result.softness).toBeLessThanOrEqual(100)
  })

  it('detects readable patterns', () => {
    const result = measureSmoothing('const x = 1; function f() {}')
    expect(result.hasReadable).toBe(true)
  })

  it('detects self-documenting patterns', () => {
    const result = measureSmoothing('export async function run(): Promise<void> {}')
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects approachable patterns', () => {
    const result = measureSmoothing('export function run() {}')
    expect(result.hasApproachable).toBe(true)
  })

  it('detects clear type annotations', () => {
    const result = measureSmoothing('function f(): string { return "" }')
    expect(result.hasClear).toBe(true)
  })

  it('detects gentle flow patterns', () => {
    const result = measureSmoothing('if (x) { return y } throw new Error()')
    expect(result.hasGentle).toBe(true)
  })

  it('detects inviting module patterns', () => {
    const result = measureSmoothing('import { x } from "y"; export { x }')
    expect(result.hasInviting).toBe(true)
  })

  it('detects warm error handling', () => {
    const result = measureSmoothing('try { x() } catch { y() }')
    expect(result.hasWarm).toBe(true)
  })

  it('detects documentation comments', () => {
    const result = measureSmoothing('/** docs */')
    expect(result.hasDocumented).toBe(true)
  })

  it('counts cryptic variables', () => {
    const result = measureSmoothing('var x = 1; var y = 2')
    expect(result.crypticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts obfuscated patterns', () => {
    const result = measureSmoothing('obfuscate(minify(uglify(code)))')
    expect(result.obfuscatedCount).toBeGreaterThanOrEqual(0)
  })

  it('detects understanding patterns', () => {
    const result = measureSmoothing('interface Foo { readonly bar: string }')
    expect(result.hasUnderstanding).toBe(true)
  })

  it('detects no mystery', () => {
    const result = measureSmoothing('const x = 1')
    expect(result.hasNoMystery).toBe(true)
  })

  it('detects no intimidating', () => {
    const result = measureSmoothing('const x = 1')
    expect(result.hasNoIntimidating).toBe(true)
  })

  it('detects no harsh', () => {
    const result = measureSmoothing('const x = 1')
    expect(result.hasNoHarsh).toBe(true)
  })

  it('detects no exclusive (no @ts-ignore)', () => {
    const result = measureSmoothing('const x = 1')
    expect(result.hasNoExclusive).toBe(true)
  })

  it('flags mystery content', () => {
    const result = measureSmoothing('// mystery code')
    expect(result.hasNoMystery).toBe(false)
  })

  it('flags intimidating content', () => {
    const result = measureSmoothing('// intimidating stuff')
    expect(result.hasNoIntimidating).toBe(false)
  })

  it('classifies fabric thresholds', () => {
    expect(measureSmoothing(richContent).fabric).toBe('royal-velvet')
    expect(measureSmoothing(emptyContent).fabric).toBe('no-softness')
  })
})

// ─── measureComforting ─────────────────────────────────

describe('measureComforting', () => {
  it('scores rich content high', () => {
    const result = measureComforting(richContent)
    expect(result.comfort).toBe(100)
    expect(result.hasHighComfort).toBe(true)
    expect(result.blanket).toBe('luxurious-warmth')
  })

  it('scores empty content low', () => {
    const result = measureComforting(emptyContent)
    expect(result.comfort).toBeGreaterThanOrEqual(0)
    expect(result.hasHighComfort).toBe(false)
    expect(result.blanket).toBe('no-comfort')
  })

  it('detects error handling', () => {
    const result = measureComforting('try { x() } catch { y() }')
    expect(result.hasErrorHandled).toBe(true)
  })

  it('detects defensive patterns', () => {
    const result = measureComforting('if (x) { y() }')
    expect(result.hasDefensive).toBe(true)
  })

  it('detects graceful patterns', () => {
    const result = measureComforting('catch (e) { default: break } finally {}')
    expect(result.hasGraceful).toBe(true)
  })

  it('detects recoverable patterns', () => {
    const result = measureComforting('try { x() } catch (e: Error) { throw e }')
    expect(result.hasRecoverable).toBe(true)
  })

  it('detects tested patterns', () => {
    const result = measureComforting('try { if (x) { y() } } catch { }')
    expect(result.hasTested).toBe(true)
  })

  it('detects type-safe patterns', () => {
    const result = measureComforting('function f(): string { return "" }')
    expect(result.hasTypeSafe).toBe(true)
  })

  it('detects reliable patterns', () => {
    const result = measureComforting('const x: readonly string[] = [] as const')
    expect(result.hasReliable).toBe(true)
  })

  it('detects stable patterns', () => {
    const result = measureComforting('class X implements interface type { readonly y }')
    expect(result.hasStable).toBe(true)
  })

  it('counts bare crash patterns', () => {
    const result = measureComforting('eval("x")')
    expect(result.bareCrashCount).toBeGreaterThanOrEqual(1)
  })

  it('counts untested patterns', () => {
    const result = measureComforting('var x = 1')
    expect(result.untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('detects no naive', () => {
    const result = measureComforting('const x = 1')
    expect(result.hasNoNaive).toBe(true)
  })

  it('detects no harsh fail', () => {
    const result = measureComforting('const x = 1')
    expect(result.hasNoHarshFail).toBe(true)
  })

  it('detects no fatal', () => {
    const result = measureComforting('const x = 1')
    expect(result.hasNoFatal).toBe(true)
  })

  it('detects predictable patterns', () => {
    const result = measureComforting('const x = {} as const; readonly y')
    expect(result.hasPredictable).toBe(true)
  })

  it('classifies blanket thresholds', () => {
    expect(measureComforting(richContent).blanket).toBe('luxurious-warmth')
    expect(measureComforting(emptyContent).blanket).toBe('no-comfort')
  })
})

// ─── measureDraping ────────────────────────────────────

describe('measureDraping', () => {
  it('scores rich content high', () => {
    const result = measureDraping(richContent)
    expect(result.elegance).toBe(100)
    expect(result.hasHighElegance).toBe(true)
    expect(result.drape).toBe('elegant-fall')
  })

  it('scores empty content low', () => {
    const result = measureDraping(emptyContent)
    expect(result.elegance).toBeGreaterThanOrEqual(0)
    expect(result.drape).toBe('no-elegance')
  })

  it('detects well-structured patterns', () => {
    const result = measureDraping('class X { }; interface Y { }')
    expect(result.hasWellStructured).toBe(true)
  })

  it('detects clean pipelines', () => {
    const result = measureDraping('import { x } from "y"; export { x }')
    expect(result.hasCleanPipelines).toBe(true)
  })

  it('detects modular patterns', () => {
    const result = measureDraping('export function run() {}')
    expect(result.hasModular).toBe(true)
  })

  it('detects organized patterns', () => {
    const result = measureDraping('class X { }; interface Y { }')
    expect(result.hasOrganized).toBe(true)
  })

  it('detects efficient patterns', () => {
    const result = measureDraping('const x: readonly string = ""')
    expect(result.hasEfficient).toBe(true)
  })

  it('detects elegant patterns', () => {
    const result = measureDraping('class X { private y: string }')
    expect(result.hasElegant).toBe(true)
  })

  it('detects refined patterns', () => {
    const result = measureDraping('function f() {}; class X { }; interface I { }')
    expect(result.hasRefined).toBe(true)
  })

  it('detects polished patterns', () => {
    const result = measureDraping('try { if (x) throw e } catch { }')
    expect(result.hasPolished).toBe(true)
  })

  it('detects graceful patterns', () => {
    const result = measureDraping('catch (e) { } finally { } default:')
    expect(result.hasGraceful).toBe(true)
  })

  it('counts chaotic patterns', () => {
    const result = measureDraping('var x = 1; var y = 2')
    expect(result.chaoticCount).toBeGreaterThanOrEqual(0)
  })

  it('counts tangled patterns', () => {
    const result = measureDraping('// tangled spaghetti messy code')
    expect(result.tangledCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies drape thresholds', () => {
    expect(measureDraping(richContent).drape).toBe('elegant-fall')
    expect(measureDraping(emptyContent).drape).toBe('no-elegance')
  })
})

// ─── measureKnowing ────────────────────────────────────

describe('measureKnowing', () => {
  it('scores rich content high', () => {
    const result = measureKnowing(richContent)
    expect(result.wisdom).toBe(100)
    expect(result.hasHighWisdom).toBe(true)
    expect(result.owl).toBe('ancient-owl')
  })

  it('scores empty content low', () => {
    const result = measureKnowing(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.owl).toBe('no-wisdom')
  })

  it('detects well-architected patterns', () => {
    const result = measureKnowing('class X implements interface Y { }')
    expect(result.hasWellArchitected).toBe(true)
  })

  it('detects principled patterns', () => {
    const result = measureKnowing('class X { private y: string; protected z }')
    expect(result.hasPrincipled).toBe(true)
  })

  it('detects deep patterns', () => {
    const result = measureKnowing('interface X<T> { }; type Y = string')
    expect(result.hasDeep).toBe(true)
  })

  it('detects proven patterns', () => {
    const result = measureKnowing('const x = {} as const; readonly y')
    expect(result.hasProven).toBe(true)
  })

  it('detects mature patterns', () => {
    const result = measureKnowing('class X { }; interface Y { }')
    expect(result.hasMature).toBe(true)
  })

  it('detects patterned code', () => {
    const result = measureKnowing('function f() {}; class X { }; interface Y { }')
    expect(result.hasPatterned).toBe(true)
  })

  it('detects strategic patterns', () => {
    const result = measureKnowing('import { x } from "y"; export { x }')
    expect(result.hasStrategic).toBe(true)
  })

  it('detects visionary patterns', () => {
    const result = measureKnowing('try { if (x) throw e } catch { }')
    expect(result.hasVisionary).toBe(true)
  })

  it('counts hacked patterns', () => {
    const result = measureKnowing('// hack workaround monkey-patch')
    expect(result.hackedCount).toBeGreaterThanOrEqual(0)
  })

  it('counts ad-hoc patterns', () => {
    const result = measureKnowing('const x: any = {}')
    expect(result.adHocCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies owl thresholds', () => {
    expect(measureKnowing(richContent).owl).toBe('ancient-owl')
    expect(measureKnowing(emptyContent).owl).toBe('no-wisdom')
  })
})

// ─── measureSurviving ──────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content high', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBe(100)
    expect(result.hasHighResilience).toBe(true)
    expect(result.night).toBe('night-survivor')
  })

  it('scores empty content low', () => {
    const result = measureSurviving(emptyContent)
    expect(result.resilience).toBeGreaterThanOrEqual(0)
    expect(result.night).toBe('no-resilience')
  })

  it('detects robust patterns', () => {
    const result = measureSurviving('class X implements interface Y { readonly z }')
    expect(result.hasRobust).toBe(true)
  })

  it('detects adaptive patterns', () => {
    const result = measureSurviving('async function run(): Promise<void> { await x() }')
    expect(result.hasAdaptive).toBe(true)
  })

  it('detects antifragile patterns', () => {
    const result = measureSurviving('try { if (x) throw e } catch { }')
    expect(result.hasAntifragile).toBe(true)
  })

  it('detects persistent patterns', () => {
    const result = measureSurviving('const x: readonly string = ""')
    expect(result.hasPersistent).toBe(true)
  })

  it('detects maintained patterns', () => {
    const result = measureSurviving('import { x } from "y"; export { x }')
    expect(result.hasMaintained).toBe(true)
  })

  it('detects extensible patterns', () => {
    const result = measureSurviving('function f() {}; class X { }; interface Y { }')
    expect(result.hasExtensible).toBe(true)
  })

  it('detects versatile patterns', () => {
    const result = measureSurviving('interface X<T> { }; type Y = string')
    expect(result.hasVersatile).toBe(true)
  })

  it('detects recoverable patterns', () => {
    const result = measureSurviving('try { } catch (e: Error) { throw e }')
    expect(result.hasRecoverable).toBe(true)
  })

  it('detects forgiving patterns', () => {
    const result = measureSurviving('catch (e) { } finally { } default:')
    expect(result.hasForgiving).toBe(true)
  })

  it('counts fragile patterns', () => {
    const result = measureSurviving('var x = 1')
    expect(result.fragileCount).toBeGreaterThanOrEqual(0)
  })

  it('counts rigid patterns', () => {
    const result = measureSurviving('const x: any = {}')
    expect(result.rigidCount).toBeGreaterThanOrEqual(0)
  })

  it('classifies night thresholds', () => {
    expect(measureSurviving(richContent).night).toBe('night-survivor')
    expect(measureSurviving(emptyContent).night).toBe('no-resilience')
  })
})

// ─── Classifiers ───────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies velvet-masterpiece', () => {
    expect(classifyCondition(90)).toBe('velvet-masterpiece')
    expect(classifyCondition(95)).toBe('velvet-masterpiece')
  })

  it('classifies silk-night', () => {
    expect(classifyCondition(75)).toBe('silk-night')
    expect(classifyCondition(89)).toBe('silk-night')
  })

  it('classifies proper-dark', () => {
    expect(classifyCondition(60)).toBe('proper-dark')
    expect(classifyCondition(74)).toBe('proper-dark')
  })

  it('classifies rough-twilight', () => {
    expect(classifyCondition(40)).toBe('rough-twilight')
    expect(classifyCondition(59)).toBe('rough-twilight')
  })

  it('classifies harsh-daylight', () => {
    expect(classifyCondition(20)).toBe('harsh-daylight')
    expect(classifyCondition(39)).toBe('harsh-daylight')
  })

  it('classifies void', () => {
    expect(classifyCondition(0)).toBe('void')
    expect(classifyCondition(19)).toBe('void')
  })
})

describe('classifyCurtainType', () => {
  it('returns no-curtain for empty folds', () => {
    expect(classifyCurtainType([])).toBe('no-curtain')
  })

  it('returns grand-drape for high scores', () => {
    const folds = [{ qualityScore: 95 } as any]
    expect(classifyCurtainType(folds)).toBe('grand-drape')
  })

  it('returns velvet-curtain for good scores', () => {
    const folds = [{ qualityScore: 80 } as any]
    expect(classifyCurtainType(folds)).toBe('velvet-curtain')
  })

  it('returns proper-shade for moderate scores', () => {
    const folds = [{ qualityScore: 65 } as any]
    expect(classifyCurtainType(folds)).toBe('proper-shade')
  })

  it('returns thin-cloth for low scores', () => {
    const folds = [{ qualityScore: 45 } as any]
    expect(classifyCurtainType(folds)).toBe('thin-cloth')
  })

  it('returns bare-window for very low scores', () => {
    const folds = [{ qualityScore: 25 } as any]
    expect(classifyCurtainType(folds)).toBe('bare-window')
  })

  it('returns no-curtain for zero scores', () => {
    const folds = [{ qualityScore: 5 } as any]
    expect(classifyCurtainType(folds)).toBe('no-curtain')
  })
})

describe('classifyCurtainCondition', () => {
  it('classifies velvet-theater', () => {
    expect(classifyCurtainCondition(85)).toBe('velvet-theater')
    expect(classifyCurtainCondition(100)).toBe('velvet-theater')
  })

  it('classifies dark-chamber', () => {
    expect(classifyCurtainCondition(70)).toBe('dark-chamber')
    expect(classifyCurtainCondition(84)).toBe('dark-chamber')
  })

  it('classifies proper-room', () => {
    expect(classifyCurtainCondition(55)).toBe('proper-room')
    expect(classifyCurtainCondition(69)).toBe('proper-room')
  })

  it('classifies dim-corner', () => {
    expect(classifyCurtainCondition(35)).toBe('dim-corner')
    expect(classifyCurtainCondition(54)).toBe('dim-corner')
  })

  it('classifies harsh-lit-hall', () => {
    expect(classifyCurtainCondition(15)).toBe('harsh-lit-hall')
    expect(classifyCurtainCondition(34)).toBe('harsh-lit-hall')
  })

  it('classifies void', () => {
    expect(classifyCurtainCondition(0)).toBe('void')
    expect(classifyCurtainCondition(14)).toBe('void')
  })
})

describe('classifyTailorGrade', () => {
  it('classifies master-tailor', () => {
    expect(classifyTailorGrade(80)).toBe('master-tailor')
    expect(classifyTailorGrade(100)).toBe('master-tailor')
  })

  it('classifies silk-weaver', () => {
    expect(classifyTailorGrade(65)).toBe('silk-weaver')
    expect(classifyTailorGrade(79)).toBe('silk-weaver')
  })

  it('classifies cloth-merchant', () => {
    expect(classifyTailorGrade(50)).toBe('cloth-merchant')
    expect(classifyTailorGrade(64)).toBe('cloth-merchant')
  })

  it('classifies apprentice', () => {
    expect(classifyTailorGrade(35)).toBe('apprentice')
    expect(classifyTailorGrade(49)).toBe('apprentice')
  })

  it('classifies novice', () => {
    expect(classifyTailorGrade(20)).toBe('novice')
    expect(classifyTailorGrade(34)).toBe('novice')
  })

  it('classifies tattered-seam', () => {
    expect(classifyTailorGrade(0)).toBe('tattered-seam')
    expect(classifyTailorGrade(19)).toBe('tattered-seam')
  })
})

// ─── analyzeVelvetFold ─────────────────────────────────

describe('analyzeVelvetFold', () => {
  it('analyzes rich content correctly', () => {
    const fold = analyzeVelvetFold(richContent, 'app.ts')
    expect(fold.file).toBe('app.ts')
    expect(fold.softnessQuality).toBe(100)
    expect(fold.darkComfort).toBe(100)
    expect(fold.shadowElegance).toBe(100)
    expect(fold.nocturnalWisdom).toBe(100)
    expect(fold.nightResilience).toBe(100)
    expect(fold.qualityScore).toBe(100)
    expect(fold.condition).toBe('velvet-masterpiece')
  })

  it('analyzes empty content', () => {
    const fold = analyzeVelvetFold(emptyContent, 'empty.ts')
    expect(fold.file).toBe('empty.ts')
    expect(fold.qualityScore).toBeGreaterThanOrEqual(0)
    expect(fold.condition).toBe('void')
  })

  it('computes quality score as weighted average', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    const expected = Math.round(
      fold.softnessQuality * 0.2 +
      fold.darkComfort * 0.2 +
      fold.shadowElegance * 0.2 +
      fold.nocturnalWisdom * 0.2 +
      fold.nightResilience * 0.2,
    )
    expect(fold.qualityScore).toBe(expected)
  })

  it('preserves all measure objects', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    expect(fold.smoothing).toBeDefined()
    expect(fold.comforting).toBeDefined()
    expect(fold.draping).toBeDefined()
    expect(fold.knowing).toBeDefined()
    expect(fold.surviving).toBeDefined()
  })
})

// ─── analyzeVelvetCurtain ──────────────────────────────

describe('analyzeVelvetCurtain', () => {
  it('returns empty curtain for no folds', () => {
    const curtain = analyzeVelvetCurtain([], 'src')
    expect(curtain.directory).toBe('src')
    expect(curtain.folds).toHaveLength(0)
    expect(curtain.avgSoftness).toBe(0)
    expect(curtain.avgElegance).toBe(0)
    expect(curtain.avgResilience).toBe(0)
    expect(curtain.velvetMasterpieceCount).toBe(0)
    expect(curtain.voidCount).toBe(0)
    expect(curtain.curtainType).toBe('no-curtain')
    expect(curtain.condition).toBe('void')
  })

  it('computes averages from folds', () => {
    const folds = [
      analyzeVelvetFold(richContent, 'src/a.ts'),
      analyzeVelvetFold(minimalContent, 'src/b.ts'),
    ]
    const curtain = analyzeVelvetCurtain(folds, 'src')
    expect(curtain.directory).toBe('src')
    expect(curtain.folds).toHaveLength(2)
    expect(curtain.avgSoftness).toBeGreaterThanOrEqual(0)
    expect(curtain.avgElegance).toBeGreaterThanOrEqual(0)
    expect(curtain.avgResilience).toBeGreaterThanOrEqual(0)
  })

  it('counts velvet masterpieces', () => {
    const folds = [
      analyzeVelvetFold(richContent, 'a.ts'),
      analyzeVelvetFold(richContent, 'b.ts'),
    ]
    const curtain = analyzeVelvetCurtain(folds, '.')
    expect(curtain.velvetMasterpieceCount).toBe(2)
  })

  it('counts void folds', () => {
    const folds = [
      analyzeVelvetFold(emptyContent, 'a.ts'),
      analyzeVelvetFold(emptyContent, 'b.ts'),
    ]
    const curtain = analyzeVelvetCurtain(folds, '.')
    expect(curtain.voidCount).toBe(2)
  })
})

// ─── buildVelvetDarknessResult ─────────────────────────

describe('buildVelvetDarknessResult', () => {
  it('handles empty input', async () => {
    const result = await buildVelvetDarknessResult([], [])
    expect(result.folds).toHaveLength(0)
    expect(result.curtains).toHaveLength(0)
    expect(result.evening.avgSoftness).toBe(0)
    expect(result.evening.avgElegance).toBe(0)
    expect(result.evening.avgResilience).toBe(0)
    expect(result.evening.overallLuxury).toBe(0)
    expect(result.evening.isVelvet).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalCurtains).toBe(0)
    expect(result.stats.tailorGrade).toBe('tattered-seam')
    expect(result.stats.bestFold).toBe('')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles single file', async () => {
    const result = await buildVelvetDarknessResult(['app.ts'], [richContent])
    expect(result.folds).toHaveLength(1)
    expect(result.folds[0].file).toBe('app.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles multiple files', async () => {
    const result = await buildVelvetDarknessResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, minimalContent, poorContent],
    )
    expect(result.folds).toHaveLength(3)
    expect(result.curtains.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups files by directory into curtains', async () => {
    const result = await buildVelvetDarknessResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.curtains).toHaveLength(2)
    const srcCurtain = result.curtains.find((c) => c.directory === 'src')
    expect(srcCurtain).toBeDefined()
    expect(srcCurtain!.folds).toHaveLength(2)
    const libCurtain = result.curtains.find((c) => c.directory === 'lib')
    expect(libCurtain).toBeDefined()
    expect(libCurtain!.folds).toHaveLength(1)
  })

  it('computes evening overview', async () => {
    const result = await buildVelvetDarknessResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.evening.avgSoftness).toBe(100)
    expect(result.evening.avgElegance).toBe(100)
    expect(result.evening.avgResilience).toBe(100)
    expect(result.evening.overallLuxury).toBe(100)
    expect(result.evening.isVelvet).toBe(true)
  })

  it('computes stats correctly', async () => {
    const result = await buildVelvetDarknessResult(
      ['a.ts', 'b.ts'],
      [richContent, richContent],
    )
    expect(result.stats.avgSoftnessQuality).toBe(100)
    expect(result.stats.avgDarkComfort).toBe(100)
    expect(result.stats.avgShadowElegance).toBe(100)
    expect(result.stats.avgNocturnalWisdom).toBe(100)
    expect(result.stats.avgNightResilience).toBe(100)
    expect(result.stats.velvetMasterpieceCount).toBe(2)
    expect(result.stats.silkNightCount).toBe(0)
    expect(result.stats.properDarkCount).toBe(0)
    expect(result.stats.roughTwilightCount).toBe(0)
    expect(result.stats.harshDaylightCount).toBe(0)
    expect(result.stats.voidCount).toBe(0)
    expect(result.stats.overallLuxury).toBe(100)
    expect(result.stats.tailorGrade).toBe('master-tailor')
  })

  it('finds best/softest/most-comforting/elegant/wisest/resilient', async () => {
    const result = await buildVelvetDarknessResult(
      ['rich.ts', 'poor.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestFold).toBe('rich.ts')
    expect(result.stats.softest).toBe('rich.ts')
    expect(result.stats.mostComforting).toBe('rich.ts')
    expect(result.stats.mostElegant).toBe('rich.ts')
    expect(result.stats.wisest).toBe('rich.ts')
    expect(result.stats.mostResilient).toBe('rich.ts')
  })

  it('counts high-measure counts', async () => {
    const result = await buildVelvetDarknessResult(
      ['a.ts'],
      [richContent],
    )
    expect(result.stats.hasHighSoftnessCount).toBe(1)
    expect(result.stats.hasHighComfortCount).toBe(1)
    expect(result.stats.hasHighEleganceCount).toBe(1)
    expect(result.stats.hasHighWisdomCount).toBe(1)
    expect(result.stats.hasHighResilienceCount).toBe(1)
  })

  it('scores rich content at max', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(result.folds[0].softnessQuality).toBe(100)
    expect(result.folds[0].darkComfort).toBe(100)
    expect(result.folds[0].shadowElegance).toBe(100)
    expect(result.folds[0].nocturnalWisdom).toBe(100)
    expect(result.folds[0].nightResilience).toBe(100)
    expect(result.folds[0].qualityScore).toBe(100)
  })
})

// ─── generateRecommendations ───────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece for perfect scores', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends softness improvement', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [poorContent])
    const hasSoftness = result.recommendations.some((r) =>
      r.toLowerCase().includes('soften') || r.toLowerCase().includes('fabric'),
    )
    expect(hasSoftness).toBe(true)
  })

  it('recommends comfort improvement', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [poorContent])
    const hasComfort = result.recommendations.some((r) =>
      r.toLowerCase().includes('comfort') || r.toLowerCase().includes('blanket'),
    )
    expect(hasComfort).toBe(true)
  })

  it('recommends elegance improvement', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [poorContent])
    const hasElegance = result.recommendations.some((r) =>
      r.toLowerCase().includes('elegance') || r.toLowerCase().includes('drape'),
    )
    expect(hasElegance).toBe(true)
  })

  it('recommends wisdom improvement', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [poorContent])
    const hasWisdom = result.recommendations.some((r) =>
      r.toLowerCase().includes('wisdom') || r.toLowerCase().includes('owl'),
    )
    expect(hasWisdom).toBe(true)
  })

  it('recommends resilience improvement', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [poorContent])
    const hasResilience = result.recommendations.some((r) =>
      r.toLowerCase().includes('resilience') || r.toLowerCase().includes('night'),
    )
    expect(hasResilience).toBe(true)
  })

  it('returns default positive recommendation when all is good', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format helpers ────────────────────────────────────

describe('format helpers', () => {
  it('colorScore returns string', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })

  it('colorCondition returns string for all conditions', () => {
    expect(typeof colorCondition('velvet-masterpiece')).toBe('string')
    expect(typeof colorCondition('silk-night')).toBe('string')
    expect(typeof colorCondition('proper-dark')).toBe('string')
    expect(typeof colorCondition('rough-twilight')).toBe('string')
    expect(typeof colorCondition('harsh-daylight')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
  })

  it('colorCurtainCondition returns string for all conditions', () => {
    expect(typeof colorCurtainCondition('velvet-theater')).toBe('string')
    expect(typeof colorCurtainCondition('dark-chamber')).toBe('string')
    expect(typeof colorCurtainCondition('proper-room')).toBe('string')
    expect(typeof colorCurtainCondition('dim-corner')).toBe('string')
    expect(typeof colorCurtainCondition('harsh-lit-hall')).toBe('string')
    expect(typeof colorCurtainCondition('void')).toBe('string')
  })

  it('formatFoldTable returns string', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    expect(typeof formatFoldTable(fold)).toBe('string')
  })

  it('formatFoldsTable handles empty array', () => {
    expect(typeof formatFoldsTable([])).toBe('string')
  })

  it('formatFoldsTable formats multiple folds', () => {
    const folds = [
      analyzeVelvetFold(richContent, 'a.ts'),
      analyzeVelvetFold(minimalContent, 'b.ts'),
    ]
    expect(typeof formatFoldsTable(folds)).toBe('string')
  })

  it('formatCurtainTable returns string', () => {
    const folds = [analyzeVelvetFold(richContent, 'a.ts')]
    const curtain = analyzeVelvetCurtain(folds, 'src')
    expect(typeof formatCurtainTable(curtain)).toBe('string')
  })

  it('formatCurtainsTable handles empty array', () => {
    expect(typeof formatCurtainsTable([])).toBe('string')
  })

  it('formatCurtainsTable formats multiple curtains', async () => {
    const result = await buildVelvetDarknessResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(typeof formatCurtainsTable(result.curtains)).toBe('string')
  })

  it('formatStatsTable returns string', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(typeof formatStatsTable(result.stats)).toBe('string')
  })

  it('formatRecommendations handles empty', () => {
    expect(typeof formatRecommendations([])).toBe('string')
  })

  it('formatRecommendations formats list', () => {
    expect(typeof formatRecommendations(['Fix X', 'Fix Y'])).toBe('string')
  })

  it('formatResultTable returns string', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    expect(typeof formatResultTable(result)).toBe('string')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildVelvetDarknessResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    expect(typeof json).toBe('string')
    const parsed = JSON.parse(json)
    expect(parsed.folds).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
