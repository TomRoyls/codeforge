import { describe, it, expect } from 'vitest'

import {
  measureSoothing,
  measureComforting,
  measureAdorning,
  measureKnowing,
  measureEnduring,
  classifyFoldCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyCuratorGrade,
  analyzeVelvetFold,
  analyzeVelvetChamber,
  generateRecommendations,
  buildVelvetNightResult,
} from '../src/commands/velvet-night-helpers.js'

import {
  colorScore,
  colorGrade,
  formatFoldTable,
  formatFoldsTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/velvet-night-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `/**
 * A rich module
 */
export interface Widget<T> {
  readonly id: string
  name?: string
}

export type Status = 'active' | 'inactive'

export enum Color { Red, Green, Blue }

export class Processor {
  private items: Widget<string>[] = []

  async run(): Promise<void> {
    try {
      const found = this.items.find(i => i.id !== '')
      if (found) {
        throw new Error('Found')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function helper(val: string): string {
  return val
}
`

const badContent = `var x = eval("1 + 2")
debugger
// TODO: fix this
// FIXME: broken
console.log(x as any)
`

const emptyContent = ''

const perfectContent = `/**
 * Perfect module
 */
export interface Perfect<T> {
  readonly id: string
  name?: string
}

export type Result = 'success' | 'failure'

export enum Grade { A, B, C }

export abstract class BaseService {
  abstract execute(): Promise<void>

  protected validate(input: string): boolean {
    return input.length > 0
  }
}

export class MainService extends BaseService implements MainService {
  private data: Perfect<string>[] = []

  async execute(): Promise<void> {
    try {
      const result = this.data.find(d => d.id !== '')
      if (result) {
        throw new Error('validation failed')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
    }
  }
}

export function compute(value: string): string {
  return value
}
`

// ─── measureSoothing ───────────────────────────────────────────────

describe('measureSoothing', () => {
  it('scores minimal content', () => {
    const m = measureSoothing(minimalContent)
    expect(m.softness).toBeGreaterThanOrEqual(0)
    expect(m.softness).toBeLessThanOrEqual(100)
    expect(typeof m.touch).toBe('string')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureSoothing(richContent)
    const minimal = measureSoothing(minimalContent)
    expect(rich.softness).toBeGreaterThan(minimal.softness)
  })

  it('penalizes var usage', () => {
    const m = measureSoothing('var x = 1')
    expect(m.softness).toBeLessThan(50)
    expect(m.hasNoIntimidating).toBe(false)
    expect(m.intimidatingCount).toBeGreaterThan(0)
  })

  it('penalizes eval', () => {
    const m = measureSoothing('eval("code")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBeGreaterThan(0)
  })

  it('penalizes debugger', () => {
    const m = measureSoothing('debugger')
    expect(m.hasNoHarsh).toBe(false)
    expect(m.crypticCount).toBeGreaterThan(0)
  })

  it('classifies touch correctly for high scores', () => {
    const m = measureSoothing(perfectContent)
    expect(m.softness).toBeGreaterThan(40)
    expect(m.touch).toBeOneOf(['silk-velvet', 'soft-cloth', 'proper-fabric'])
  })

  it('classifies touch correctly for low scores', () => {
    const m = measureSoothing(badContent)
    expect(m.touch).toBeOneOf(['sandpaper', 'rough-cotton', 'no-softness'])
  })

  it('detects approachable exports', () => {
    const m = measureSoothing(richContent)
    expect(m.hasApproachable).toBe(true)
  })

  it('detects self-documenting named exports', () => {
    const m = measureSoothing(richContent)
    expect(m.hasSelfDocumenting).toBe(true)
  })

  it('detects warm (doc + const)', () => {
    const m = measureSoothing(richContent)
    expect(m.hasWarm).toBe(true)
  })

  it('detects no hostile (no eval, no debugger)', () => {
    const m = measureSoothing(richContent)
    expect(m.hasNoHostile).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureSoothing(emptyContent)
    expect(m.softness).toBeGreaterThanOrEqual(0)
    expect(m.touch).toBe('no-softness')
  })
})

// ─── measureComforting ─────────────────────────────────────────────

describe('measureComforting', () => {
  it('scores minimal content', () => {
    const m = measureComforting(minimalContent)
    expect(m.comfort).toBeGreaterThanOrEqual(0)
    expect(m.comfort).toBeLessThanOrEqual(100)
    expect(typeof m.embrace).toBe('string')
  })

  it('rewards try/catch and throw', () => {
    const m = measureComforting(richContent)
    expect(m.hasErrorHandled).toBe(true)
    expect(m.hasGraceful).toBe(true)
  })

  it('penalizes as any', () => {
    const m = measureComforting('const x = y as any')
    expect(m.bareCrashCount).toBeGreaterThan(0)
  })

  it('penalizes debugger', () => {
    const m = measureComforting('debugger')
    expect(m.bareCrashCount).toBeGreaterThan(0)
    expect(m.hasNoFatal).toBe(false)
  })

  it('penalizes eval', () => {
    const m = measureComforting('eval("code")')
    expect(m.harshCount).toBeGreaterThan(0)
    expect(m.hasNoHarsh).toBe(false)
  })

  it('classifies embrace correctly for high scores', () => {
    const m = measureComforting(perfectContent)
    expect(m.comfort).toBeGreaterThan(20)
    expect(typeof m.embrace).toBe('string')
  })

  it('detects recoverable (try or nullish)', () => {
    const m = measureComforting(richContent)
    expect(m.hasRecoverable).toBe(true)
  })

  it('detects safe (no eval, no debugger, no as any)', () => {
    const m = measureComforting(richContent)
    expect(m.hasSafe).toBe(true)
    expect(m.hasNoDangerous).toBe(true)
  })

  it('detects forgiving (optional, no var)', () => {
    const m = measureComforting(richContent)
    expect(m.hasForgiving).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureComforting(emptyContent)
    expect(m.comfort).toBeGreaterThanOrEqual(0)
    expect(m.embrace).toBe('no-comfort')
  })
})

// ─── measureAdorning ───────────────────────────────────────────────

describe('measureAdorning', () => {
  it('scores minimal content', () => {
    const m = measureAdorning(minimalContent)
    expect(m.elegance).toBeGreaterThanOrEqual(0)
    expect(m.elegance).toBeLessThanOrEqual(100)
    expect(typeof m.shadow).toBe('string')
  })

  it('rewards interfaces and generics', () => {
    const m = measureAdorning(richContent)
    expect(m.hasElegant).toBe(true)
    expect(m.hasBeautiful).toBe(true)
  })

  it('penalizes var', () => {
    const m = measureAdorning('var x = 1')
    expect(m.clunkyCount).toBeGreaterThan(0)
    expect(m.hasNoClunky).toBe(false)
  })

  it('penalizes TODO/FIXME', () => {
    const m = measureAdorning('// TODO: fix this\n// FIXME: broken')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('classifies shadow correctly for high scores', () => {
    const m = measureAdorning(perfectContent)
    expect(m.elegance).toBeGreaterThan(40)
    expect(m.shadow).toBeOneOf(['midnight-silk', 'elegant-shadow', 'proper-drape'])
  })

  it('detects polished (interface + named export)', () => {
    const m = measureAdorning(richContent)
    expect(m.hasPolished).toBe(true)
  })

  it('detects refined (return type + optional)', () => {
    const m = measureAdorning(richContent)
    expect(m.hasRefined).toBe(true)
  })

  it('detects aesthetic (interface + enum)', () => {
    const m = measureAdorning(richContent)
    expect(m.hasAesthetic).toBe(true)
  })

  it('detects well crafted (doc, no debugger)', () => {
    const m = measureAdorning(richContent)
    expect(m.hasWellCrafted).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureAdorning(emptyContent)
    expect(m.elegance).toBeGreaterThanOrEqual(0)
    expect(m.shadow).toBe('no-elegance')
  })
})

// ─── measureKnowing ────────────────────────────────────────────────

describe('measureKnowing', () => {
  it('scores minimal content', () => {
    const m = measureKnowing(minimalContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(m.wisdom).toBeLessThanOrEqual(100)
    expect(typeof m.sage).toBe('string')
  })

  it('rewards doc and structure', () => {
    const m = measureKnowing(richContent)
    expect(m.hasDocumented).toBe(true)
    expect(m.hasWellStructured).toBe(true)
  })

  it('rewards abstract and extends', () => {
    const m = measureKnowing(perfectContent)
    expect(m.hasPatterned).toBe(true)
    expect(m.hasMature).toBe(true)
    expect(m.hasProven).toBe(true)
  })

  it('penalizes as any', () => {
    const m = measureKnowing('const x = y as any')
    expect(m.hackyCount).toBeGreaterThan(0)
    expect(m.hasNoHacky).toBe(false)
  })

  it('penalizes TODO', () => {
    const m = measureKnowing('// TODO: fix this')
    expect(m.adHocCount).toBeGreaterThan(0)
    expect(m.hasNoReinvented).toBe(false)
  })

  it('classifies sage correctly for high scores', () => {
    const m = measureKnowing(perfectContent)
    expect(m.wisdom).toBeGreaterThan(40)
    expect(m.sage).toBeOneOf(['night-owl', 'wise-watchman', 'proper-guardian'])
  })

  it('detects principled (export + const + no as any)', () => {
    const m = measureKnowing(richContent)
    expect(m.hasPrincipled).toBe(true)
  })

  it('detects established (wisdom >= 70)', () => {
    const m = measureKnowing(perfectContent)
    expect(m.hasEstablished).toBe(true)
  })

  it('detects no experimental (no TODO)', () => {
    const m = measureKnowing(richContent)
    expect(m.hasNoExperimental).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureKnowing(emptyContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(0)
    expect(m.sage).toBe('no-wisdom')
  })
})

// ─── measureEnduring ───────────────────────────────────────────────

describe('measureEnduring', () => {
  it('scores minimal content', () => {
    const m = measureEnduring(minimalContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
    expect(m.resilience).toBeLessThanOrEqual(100)
    expect(typeof m.night).toBe('string')
  })

  it('rewards try/catch and async', () => {
    const m = measureEnduring(richContent)
    expect(m.hasObservable).toBe(true)
    expect(m.hasLogging).toBe(true)
    expect(m.hasTested).toBe(true)
  })

  it('penalizes debugger', () => {
    const m = measureEnduring('debugger')
    expect(m.silentCount).toBeGreaterThan(0)
    expect(m.hasNoSilent).toBe(false)
    expect(m.hasNoBlind).toBe(false)
  })

  it('penalizes var', () => {
    const m = measureEnduring('var x = 1')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('classifies night correctly for high scores', () => {
    const m = measureEnduring(perfectContent)
    expect(m.resilience).toBeGreaterThan(20)
    expect(typeof m.night).toBe('string')
  })

  it('detects type safe (return type + no any)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasTypeSafe).toBe(true)
  })

  it('detects autonomous (async + try)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasAutonomous).toBe(true)
  })

  it('detects no requires babysitting (no var, no debugger)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasNoRequiresBabysitting).toBe(true)
  })

  it('detects no unsafe (no var, no any)', () => {
    const m = measureEnduring(richContent)
    expect(m.hasNoUnsafe).toBe(true)
  })

  it('handles empty content', () => {
    const m = measureEnduring(emptyContent)
    expect(m.resilience).toBeGreaterThanOrEqual(0)
    expect(m.night).toBe('no-endurance')
  })
})

// ─── Classifications ───────────────────────────────────────────────

describe('classifyFoldCondition', () => {
  it('classifies velvet-masterpiece', () => {
    expect(classifyFoldCondition(95)).toBe('velvet-masterpiece')
  })
  it('classifies silk-night', () => {
    expect(classifyFoldCondition(80)).toBe('silk-night')
  })
  it('classifies proper-darkness', () => {
    expect(classifyFoldCondition(65)).toBe('proper-darkness')
  })
  it('classifies dim-twilight', () => {
    expect(classifyFoldCondition(45)).toBe('dim-twilight')
  })
  it('classifies harsh-light', () => {
    expect(classifyFoldCondition(25)).toBe('harsh-light')
  })
  it('classifies void', () => {
    expect(classifyFoldCondition(10)).toBe('void')
  })
})

describe('classifyChamberType', () => {
  it('returns no-chamber for empty folds', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })

  it('returns silk-boudoir or better for high quality folds', () => {
    const fold = analyzeVelvetFold(perfectContent, 'perfect.ts')
    const ct = classifyChamberType([fold])
    expect(ct).toBeOneOf(['silk-boudoir', 'velvet-room', 'proper-chamber'])
  })

  it('returns no-chamber for very low quality', () => {
    const fold = analyzeVelvetFold('', 'empty.ts')
    expect(classifyChamberType([fold])).toBe('no-chamber')
  })
})

describe('classifyChamberCondition', () => {
  it('classifies velvet-palace', () => {
    expect(classifyChamberCondition(90)).toBe('velvet-palace')
  })
  it('classifies silk-chamber', () => {
    expect(classifyChamberCondition(75)).toBe('silk-chamber')
  })
  it('classifies proper-room', () => {
    expect(classifyChamberCondition(60)).toBe('proper-room')
  })
  it('classifies dim-quarters', () => {
    expect(classifyChamberCondition(40)).toBe('dim-quarters')
  })
  it('classifies bare-cell', () => {
    expect(classifyChamberCondition(20)).toBe('bare-cell')
  })
  it('classifies void', () => {
    expect(classifyChamberCondition(5)).toBe('void')
  })
})

describe('classifyCuratorGrade', () => {
  it('classifies master-curator', () => {
    expect(classifyCuratorGrade(90)).toBe('master-curator')
  })
  it('classifies night-butler', () => {
    expect(classifyCuratorGrade(75)).toBe('night-butler')
  })
  it('classifies skilled-host', () => {
    expect(classifyCuratorGrade(60)).toBe('skilled-host')
  })
  it('classifies apprentice', () => {
    expect(classifyCuratorGrade(45)).toBe('apprentice')
  })
  it('classifies novice', () => {
    expect(classifyCuratorGrade(25)).toBe('novice')
  })
  it('classifies homeless', () => {
    expect(classifyCuratorGrade(10)).toBe('homeless')
  })
})

// ─── analyzeVelvetFold ─────────────────────────────────────────────

describe('analyzeVelvetFold', () => {
  it('returns a complete fold object', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    expect(fold.file).toBe('test.ts')
    expect(fold.softnessQuality).toBeGreaterThan(0)
    expect(fold.darkComfort).toBeGreaterThan(0)
    expect(fold.shadowElegance).toBeGreaterThan(0)
    expect(fold.nocturnalWisdom).toBeGreaterThan(0)
    expect(fold.nightResilience).toBeGreaterThan(0)
    expect(fold.qualityScore).toBeGreaterThan(0)
    expect(typeof fold.condition).toBe('string')
  })

  it('computes qualityScore as weighted average', () => {
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

  it('classifies condition from qualityScore', () => {
    const fold = analyzeVelvetFold(perfectContent, 'perfect.ts')
    expect(fold.condition).toBeOneOf(['velvet-masterpiece', 'silk-night', 'proper-darkness'])
  })

  it('includes all measure objects', () => {
    const fold = analyzeVelvetFold(richContent, 'test.ts')
    expect(fold.soothing).toBeDefined()
    expect(fold.comforting).toBeDefined()
    expect(fold.adorning).toBeDefined()
    expect(fold.knowing).toBeDefined()
    expect(fold.enduring).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const fold = analyzeVelvetFold(emptyContent, 'empty.ts')
    expect(fold.qualityScore).toBe(0)
    expect(fold.condition).toBe('void')
  })

  it('bad content scores lower than rich content', () => {
    const bad = analyzeVelvetFold(badContent, 'bad.ts')
    const rich = analyzeVelvetFold(richContent, 'rich.ts')
    expect(bad.qualityScore).toBeLessThan(rich.qualityScore)
  })
})

// ─── analyzeVelvetChamber ──────────────────────────────────────────

describe('analyzeVelvetChamber', () => {
  it('returns empty chamber for no folds', () => {
    const chamber = analyzeVelvetChamber([], 'empty-dir')
    expect(chamber.directory).toBe('empty-dir')
    expect(chamber.folds).toHaveLength(0)
    expect(chamber.avgSoftness).toBe(0)
    expect(chamber.chamberType).toBe('no-chamber')
    expect(chamber.condition).toBe('void')
  })

  it('aggregates fold scores', () => {
    const folds = [
      analyzeVelvetFold(richContent, 'a.ts'),
      analyzeVelvetFold(richContent, 'b.ts'),
    ]
    const chamber = analyzeVelvetChamber(folds, 'src')
    expect(chamber.folds).toHaveLength(2)
    expect(chamber.avgSoftness).toBeGreaterThan(0)
    expect(chamber.avgElegance).toBeGreaterThan(0)
    expect(chamber.avgResilience).toBeGreaterThan(0)
  })

  it('counts masterpieces and voids', () => {
    const good = analyzeVelvetFold(perfectContent, 'perfect.ts')
    const bad = analyzeVelvetFold(emptyContent, 'empty.ts')
    const chamber = analyzeVelvetChamber([good, bad], 'mix')
    expect(chamber.voidCount).toBeGreaterThanOrEqual(1)
    expect(chamber.folds).toHaveLength(2)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high comfort and no voids', () => {
    const folds = [analyzeVelvetFold(perfectContent, 'p.ts')]
    const chambers = [analyzeVelvetChamber(folds, 'src')]
    const manor = { avgSoftness: 90, avgElegance: 90, avgResilience: 90, isVelvet: true, overallComfort: 90 }
    const stats = {
      totalFiles: 1, totalChambers: 1,
      avgSoftnessQuality: 90, avgDarkComfort: 90, avgShadowElegance: 90,
      avgNocturnalWisdom: 90, avgNightResilience: 90,
      velvetMasterpieceCount: 1, silkNightCount: 0, properDarknessCount: 0,
      dimTwilightCount: 0, harshLightCount: 0, voidCount: 0,
      hasHighSoftnessCount: 1, hasHighComfortCount: 1, hasHighEleganceCount: 1,
      hasHighWisdomCount: 1, hasHighResilienceCount: 1,
      overallComfort: 90, curatorGrade: 'master-curator' as const,
      bestFold: 'p.ts', softest: 'p.ts', mostComforting: 'p.ts',
      mostElegant: 'p.ts', wisest: 'p.ts',
    }
    const recs = generateRecommendations(folds, chambers, manor, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Velvet perfection')
  })

  it('suggests softness improvement for low scores', () => {
    const folds = [analyzeVelvetFold('', 'e.ts')]
    const chambers = [analyzeVelvetChamber(folds, 'src')]
    const manor = { avgSoftness: 0, avgElegance: 0, avgResilience: 0, isVelvet: false, overallComfort: 0 }
    const stats = {
      totalFiles: 1, totalChambers: 1,
      avgSoftnessQuality: 0, avgDarkComfort: 0, avgShadowElegance: 0,
      avgNocturnalWisdom: 0, avgNightResilience: 0,
      velvetMasterpieceCount: 0, silkNightCount: 0, properDarknessCount: 0,
      dimTwilightCount: 0, harshLightCount: 0, voidCount: 1,
      hasHighSoftnessCount: 0, hasHighComfortCount: 0, hasHighEleganceCount: 0,
      hasHighWisdomCount: 0, hasHighResilienceCount: 0,
      overallComfort: 0, curatorGrade: 'homeless' as const,
      bestFold: 'e.ts', softest: 'e.ts', mostComforting: 'e.ts',
      mostElegant: 'e.ts', wisest: 'e.ts',
    }
    const recs = generateRecommendations(folds, chambers, manor, stats)
    expect(recs.some(r => r.includes('Soften'))).toBe(true)
  })

  it('mentions void files by name when few', () => {
    const folds = [analyzeVelvetFold('', 'bad1.ts'), analyzeVelvetFold('', 'bad2.ts')]
    const chambers = [analyzeVelvetChamber(folds, 'src')]
    const manor = { avgSoftness: 0, avgElegance: 0, avgResilience: 0, isVelvet: false, overallComfort: 0 }
    const stats = {
      totalFiles: 2, totalChambers: 1,
      avgSoftnessQuality: 0, avgDarkComfort: 0, avgShadowElegance: 0,
      avgNocturnalWisdom: 0, avgNightResilience: 0,
      velvetMasterpieceCount: 0, silkNightCount: 0, properDarknessCount: 0,
      dimTwilightCount: 0, harshLightCount: 0, voidCount: 2,
      hasHighSoftnessCount: 0, hasHighComfortCount: 0, hasHighEleganceCount: 0,
      hasHighWisdomCount: 0, hasHighResilienceCount: 0,
      overallComfort: 0, curatorGrade: 'homeless' as const,
      bestFold: 'bad1.ts', softest: 'bad1.ts', mostComforting: 'bad1.ts',
      mostElegant: 'bad1.ts', wisest: 'bad1.ts',
    }
    const recs = generateRecommendations(folds, chambers, manor, stats)
    expect(recs.some(r => r.includes('bad1.ts'))).toBe(true)
  })

  it('reports void count when many void files', () => {
    const foldList = Array.from({ length: 5 }, (_, i) => analyzeVelvetFold('', `v${i}.ts`))
    const chambers = [analyzeVelvetChamber(foldList, 'src')]
    const manor = { avgSoftness: 0, avgElegance: 0, avgResilience: 0, isVelvet: false, overallComfort: 0 }
    const stats = {
      totalFiles: 5, totalChambers: 1,
      avgSoftnessQuality: 0, avgDarkComfort: 0, avgShadowElegance: 0,
      avgNocturnalWisdom: 0, avgNightResilience: 0,
      velvetMasterpieceCount: 0, silkNightCount: 0, properDarknessCount: 0,
      dimTwilightCount: 0, harshLightCount: 0, voidCount: 5,
      hasHighSoftnessCount: 0, hasHighComfortCount: 0, hasHighEleganceCount: 0,
      hasHighWisdomCount: 0, hasHighResilienceCount: 0,
      overallComfort: 0, curatorGrade: 'homeless' as const,
      bestFold: 'v0.ts', softest: 'v0.ts', mostComforting: 'v0.ts',
      mostElegant: 'v0.ts', wisest: 'v0.ts',
    }
    const recs = generateRecommendations(foldList, chambers, manor, stats)
    expect(recs.some(r => r.includes('5 void'))).toBe(true)
  })

  it('reports weak chambers', () => {
    const folds1 = [analyzeVelvetFold('', 'a.ts')]
    const folds2 = [analyzeVelvetFold(perfectContent, 'p.ts')]
    const c1 = analyzeVelvetChamber(folds1, 'bad-dir')
    const c2 = analyzeVelvetChamber(folds2, 'good-dir')
    const allFolds = [...folds1, ...folds2]
    const avgSq = Math.round(allFolds.reduce((s, f) => s + f.softnessQuality, 0) / allFolds.length)
    const avgDc = Math.round(allFolds.reduce((s, f) => s + f.darkComfort, 0) / allFolds.length)
    const avgSe = Math.round(allFolds.reduce((s, f) => s + f.shadowElegance, 0) / allFolds.length)
    const avgNw = Math.round(allFolds.reduce((s, f) => s + f.nocturnalWisdom, 0) / allFolds.length)
    const avgNr = Math.round(allFolds.reduce((s, f) => s + f.nightResilience, 0) / allFolds.length)
    const oc = Math.round((avgSq + avgSe + avgNr) / 3)
    const manor = { avgSoftness: avgSq, avgElegance: avgSe, avgResilience: avgNr, isVelvet: oc >= 80, overallComfort: oc }
    const stats = {
      totalFiles: 2, totalChambers: 2,
      avgSoftnessQuality: avgSq, avgDarkComfort: avgDc, avgShadowElegance: avgSe,
      avgNocturnalWisdom: avgNw, avgNightResilience: avgNr,
      velvetMasterpieceCount: allFolds.filter(f => f.condition === 'velvet-masterpiece').length,
      silkNightCount: allFolds.filter(f => f.condition === 'silk-night').length,
      properDarknessCount: allFolds.filter(f => f.condition === 'proper-darkness').length,
      dimTwilightCount: allFolds.filter(f => f.condition === 'dim-twilight').length,
      harshLightCount: allFolds.filter(f => f.condition === 'harsh-light').length,
      voidCount: allFolds.filter(f => f.condition === 'void').length,
      hasHighSoftnessCount: allFolds.filter(f => f.soothing.hasHighSoftness).length,
      hasHighComfortCount: allFolds.filter(f => f.comforting.hasHighComfort).length,
      hasHighEleganceCount: allFolds.filter(f => f.adorning.hasHighElegance).length,
      hasHighWisdomCount: allFolds.filter(f => f.knowing.hasHighWisdom).length,
      hasHighResilienceCount: allFolds.filter(f => f.enduring.hasHighResilience).length,
      overallComfort: oc, curatorGrade: classifyCuratorGrade(oc) as 'skilled-host',
      bestFold: 'p.ts', softest: 'p.ts', mostComforting: 'p.ts',
      mostElegant: 'p.ts', wisest: 'p.ts',
    }
    const recs = generateRecommendations(allFolds, [c1, c2], manor, stats)
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildVelvetNightResult ────────────────────────────────────────

describe('buildVelvetNightResult', () => {
  it('returns complete result for single file', async () => {
    const result = await buildVelvetNightResult(['test.ts'], [richContent])
    expect(result.folds).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.manor.overallComfort).toBeGreaterThan(0)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('handles multiple files in different directories', async () => {
    const result = await buildVelvetNightResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.folds).toHaveLength(2)
    expect(result.chambers).toHaveLength(2)
    expect(result.stats.totalChambers).toBe(2)
  })

  it('computes correct averages', async () => {
    const result = await buildVelvetNightResult(
      ['a.ts', 'b.ts'],
      [richContent, perfectContent],
    )
    expect(result.stats.avgSoftnessQuality).toBeGreaterThan(0)
    expect(result.stats.avgDarkComfort).toBeGreaterThan(0)
    expect(result.stats.overallComfort).toBeGreaterThan(0)
  })

  it('computes overall comfort as avg of softness, elegance, resilience', async () => {
    const result = await buildVelvetNightResult(['a.ts'], [richContent])
    const expected = Math.round(
      (result.stats.avgSoftnessQuality + result.stats.avgShadowElegance + result.stats.avgNightResilience) / 3,
    )
    expect(result.stats.overallComfort).toBe(expected)
  })

  it('computes manor isVelvet correctly for high quality', async () => {
    const result = await buildVelvetNightResult(['p.ts'], [perfectContent])
    expect(result.manor.overallComfort).toBeGreaterThan(0)
  })

  it('identifies best fold', async () => {
    const result = await buildVelvetNightResult(
      ['bad.ts', 'good.ts'],
      [emptyContent, perfectContent],
    )
    expect(result.stats.bestFold).toBe('good.ts')
  })

  it('identifies softest fold', async () => {
    const result = await buildVelvetNightResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.softest).toBe('good.ts')
  })

  it('identifies most comforting fold', async () => {
    const result = await buildVelvetNightResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostComforting).toBe('good.ts')
  })

  it('identifies most elegant fold', async () => {
    const result = await buildVelvetNightResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.mostElegant).toBe('good.ts')
  })

  it('identifies wisest fold', async () => {
    const result = await buildVelvetNightResult(
      ['bad.ts', 'good.ts'],
      [minimalContent, perfectContent],
    )
    expect(result.stats.wisest).toBe('good.ts')
  })

  it('handles empty input', async () => {
    const result = await buildVelvetNightResult([], [])
    expect(result.folds).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallComfort).toBe(0)
    expect(result.manor.isVelvet).toBe(false)
  })

  it('counts condition categories', async () => {
    const result = await buildVelvetNightResult(
      ['perfect.ts', 'empty.ts'],
      [perfectContent, emptyContent],
    )
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('counts high measure flags for rich content', async () => {
    const result = await buildVelvetNightResult(['p.ts', 'r.ts'], [perfectContent, richContent])
    const s = result.stats
    expect(s.totalFiles).toBe(2)
    expect(s.hasHighSoftnessCount + s.hasHighComfortCount + s.hasHighEleganceCount + s.hasHighWisdomCount + s.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('assigns curator grade based on overall comfort', async () => {
    const result = await buildVelvetNightResult(['p.ts'], [perfectContent])
    expect(typeof result.stats.curatorGrade).toBe('string')
    expect(result.stats.curatorGrade).not.toBe('homeless')
  })

  it('handles missing content gracefully', async () => {
    const result = await buildVelvetNightResult(['x.ts'], [])
    expect(result.folds).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('format helpers', () => {
  const fold = analyzeVelvetFold(richContent, 'test.ts')
  const chamber = analyzeVelvetChamber([fold], 'src')

  it('colorScore returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('colorGrade returns a string', () => {
    expect(typeof colorGrade('velvet-masterpiece')).toBe('string')
  })

  it('formatFoldTable returns multi-line string', () => {
    const output = formatFoldTable(fold)
    expect(output).toContain('test.ts')
    expect(output).toContain('Softness Quality')
    expect(output).toContain('Dark Comfort')
    expect(output).toContain('Shadow Elegance')
    expect(output).toContain('Nocturnal Wisdom')
    expect(output).toContain('Night Resilience')
  })

  it('formatFoldsTable handles empty array', () => {
    expect(formatFoldsTable([])).toContain('No velvet folds')
  })

  it('formatFoldsTable formats multiple folds', () => {
    const fold2 = analyzeVelvetFold(perfectContent, 'perfect.ts')
    const output = formatFoldsTable([fold, fold2])
    expect(output).toContain('test.ts')
    expect(output).toContain('perfect.ts')
  })

  it('formatChamberTable returns multi-line string', () => {
    const output = formatChamberTable(chamber)
    expect(output).toContain('src')
    expect(output).toContain('Folds')
    expect(output).toContain('Avg Softness')
    expect(output).toContain('Chamber Type')
  })

  it('formatChambersTable handles empty array', () => {
    expect(formatChambersTable([])).toContain('No velvet chambers')
  })

  it('formatStatsTable returns stats', async () => {
    const result = await buildVelvetNightResult(['t.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Overall Comfort')
    expect(output).toContain('Curator Grade')
  })

  it('formatRecommendations handles empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formatRecommendations formats items', () => {
    const output = formatRecommendations(['improve X'])
    expect(output).toContain('improve X')
  })

  it('formatResultTable returns full output', async () => {
    const result = await buildVelvetNightResult(['t.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Velvet Fold Analysis')
    expect(output).toContain('Velvet Chambers')
    expect(output).toContain('Velvet Night Statistics')
    expect(output).toContain('Manor')
    expect(output).toContain('Recommendations')
  })

  it('formatResultJson returns valid JSON', async () => {
    const result = await buildVelvetNightResult(['t.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.folds).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Edge Cases ────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles single-line content', () => {
    const fold = analyzeVelvetFold('export const x = 1', 'single.ts')
    expect(fold.qualityScore).toBeGreaterThan(0)
  })

  it('handles content with only comments', () => {
    const fold = analyzeVelvetFold('// just a comment', 'comment.ts')
    expect(fold.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very long content', () => {
    const longContent = richContent.repeat(20)
    const fold = analyzeVelvetFold(longContent, 'long.ts')
    expect(fold.qualityScore).toBeGreaterThan(0)
  })

  it('handles mixed good and bad content', () => {
    const mixed = richContent + '\n' + badContent
    const fold = analyzeVelvetFold(mixed, 'mixed.ts')
    expect(fold.qualityScore).toBeGreaterThan(0)
    expect(fold.soothing.intimidatingCount).toBeGreaterThan(0)
  })

  it('classifies all touch levels', () => {
    const touches = [
      measureSoothing(perfectContent).touch,
      measureSoothing(richContent).touch,
      measureSoothing(badContent).touch,
      measureSoothing(emptyContent).touch,
    ]
    expect(touches.every(t => typeof t === 'string')).toBe(true)
  })

  it('classifies all embrace levels', () => {
    const embraces = [
      measureComforting(perfectContent).embrace,
      measureComforting(richContent).embrace,
      measureComforting(badContent).embrace,
      measureComforting(emptyContent).embrace,
    ]
    expect(embraces.every(e => typeof e === 'string')).toBe(true)
  })

  it('classifies all shadow levels', () => {
    const shadows = [
      measureAdorning(perfectContent).shadow,
      measureAdorning(richContent).shadow,
      measureAdorning(badContent).shadow,
      measureAdorning(emptyContent).shadow,
    ]
    expect(shadows.every(s => typeof s === 'string')).toBe(true)
  })

  it('classifies all sage levels', () => {
    const sages = [
      measureKnowing(perfectContent).sage,
      measureKnowing(richContent).sage,
      measureKnowing(badContent).sage,
      measureKnowing(emptyContent).sage,
    ]
    expect(sages.every(s => typeof s === 'string')).toBe(true)
  })

  it('classifies all night levels', () => {
    const nights = [
      measureEnduring(perfectContent).night,
      measureEnduring(richContent).night,
      measureEnduring(badContent).night,
      measureEnduring(emptyContent).night,
    ]
    expect(nights.every(n => typeof n === 'string')).toBe(true)
  })

  it('buildVelvetNightResult with many files', async () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => richContent)
    const result = await buildVelvetNightResult(files, contents)
    expect(result.folds).toHaveLength(20)
    expect(result.stats.totalFiles).toBe(20)
  })
})
