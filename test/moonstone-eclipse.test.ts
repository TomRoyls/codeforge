import { describe, expect, it } from 'vitest'

import {
  analyzeMoonstonePhase,
  analyzeMoonstoneRay,
  buildMoonstoneEclipseResult,
  classifyAstronomerGrade,
  classifyMoonstoneCondition,
  classifyPhaseCondition,
  classifyPhaseType,
  generateRecommendations,
  measureAligning,
  measureEnduring,
  measureGlowing,
  measureRevealing,
  measureUnderstanding,
} from '../src/commands/moonstone-eclipse-helpers.js'
import type { MoonstoneEclipseResult } from '../src/commands/moonstone-eclipse-helpers.js'
import {
  colorAstronomerGrade,
  colorMoonstoneCondition,
  colorPhaseCondition,
  colorPhaseType,
  colorScore,
  formatPhaseTable,
  formatPhasesTable,
  formatRaysTable,
  formatRayTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/moonstone-eclipse-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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

const richLum = measureGlowing(richContent).luminescence
const richClr = measureRevealing(richContent).clarity
const richPre = measureAligning(richContent).precision
const richRes = measureEnduring(richContent).resilience
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<MoonstoneEclipseResult['stats']> = {}): MoonstoneEclipseResult['stats'] {
  return {
    totalFiles: 1,
    totalPhases: 1,
    avgLunarLuminescence: 50,
    avgShadowClarity: 50,
    avgTidePrecision: 50,
    avgEclipseResilience: 50,
    avgLunarWisdom: 50,
    moonstoneMasterpieceCount: 0,
    lunarGemCount: 0,
    properMoonstoneCount: 0,
    cloudyStoneCount: 0,
    darkRockCount: 0,
    voidCount: 0,
    hasHighLuminescenceCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallLuminescence: 50,
    astronomerGrade: 'proper-observer',
    bestRay: 'a.ts',
    brightest: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureGlowing ─────────────────────────────────────

describe('measureGlowing', () => {
  it('scores rich content highly', () => {
    const result = measureGlowing(richContent)
    expect(result.luminescence).toBeGreaterThan(60)
    expect(result.hasHighLuminescence).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGlowing(emptyContent).luminescence).toBeLessThan(richLum)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureGlowing(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureGlowing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureGlowing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasClear (type annotations)', () => {
    expect(measureGlowing(richContent).hasClear).toBe(true)
  })

  it('detects hasLuminous (import/export)', () => {
    expect(measureGlowing(richContent).hasLuminous).toBe(true)
  })

  it('detects hasGlowing (readonly/private/protected)', () => {
    expect(measureGlowing(richContent).hasGlowing).toBe(true)
  })

  it('detects hasEthereal (JSDoc)', () => {
    expect(measureGlowing(richContent).hasEthereal).toBe(true)
  })

  it('detects hasShimmering (async/await/Promise)', () => {
    expect(measureGlowing(richContent).hasShimmering).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureGlowing(richContent)
    expect(['full-moon-glow', 'moonstone-shimmer', 'proper-adularescence']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureGlowing(emptyContent).light).not.toBe('full-moon-glow')
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content highly', () => {
    const result = measureRevealing(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richClr)
  })

  it('counts undocumented keywords', () => {
    const content = 'const undocumented = 1; const unexplained = 2; const unclear = 3; const obscured = 4'
    const result = measureRevealing(content)
    expect(result.undocumentedCount).toBe(4)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('counts obfuscated keywords', () => {
    const content = 'const obfuscated = 1; const encoded = 2; const encrypted = 3; const mangled = 4'
    const result = measureRevealing(content)
    expect(result.obfuscatedCount).toBe(4)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects hasSelfDocumenting (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects hasVisible (import/export)', () => {
    expect(measureRevealing(richContent).hasVisible).toBe(true)
  })

  it('detects hasRevealed (JSDoc)', () => {
    expect(measureRevealing(richContent).hasRevealed).toBe(true)
  })

  it('detects hasManifest (try/catch/if)', () => {
    expect(measureRevealing(richContent).hasManifest).toBe(true)
  })

  it('classifies shadow correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['umbra-clear', 'penumbra-visible', 'proper-eclipse']).toContain(result.shadow)
  })

  it('classifies shadow correctly for low scores', () => {
    expect(measureRevealing(emptyContent).shadow).not.toBe('umbra-clear')
  })
})

// ─── measureAligning ────────────────────────────────────

describe('measureAligning', () => {
  it('scores rich content highly', () => {
    const result = measureAligning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAligning(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureAligning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureAligning(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureAligning(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureAligning(richContent).hasExact).toBe(true)
  })

  it('detects hasCrisp (JSDoc)', () => {
    expect(measureAligning(richContent).hasCrisp).toBe(true)
  })

  it('detects hasAligned (async/await/Promise)', () => {
    expect(measureAligning(richContent).hasAligned).toBe(true)
  })

  it('classifies alignment correctly for high scores', () => {
    const result = measureAligning(richContent)
    expect(['perfect-syzygy', 'precise-alignment', 'proper-orbit']).toContain(result.alignment)
  })

  it('classifies alignment correctly for low scores', () => {
    expect(measureAligning(emptyContent).alignment).not.toBe('perfect-syzygy')
  })
})

// ─── measureEnduring ────────────────────────────────────

describe('measureEnduring', () => {
  it('scores rich content highly', () => {
    const result = measureEnduring(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureEnduring(emptyContent).resilience).toBeLessThan(richRes)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureEnduring(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureEnduring(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureEnduring(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasTested (try/catch)', () => {
    expect(measureEnduring(richContent).hasTested).toBe(true)
  })

  it('detects hasStable (class/interface/type)', () => {
    expect(measureEnduring(richContent).hasStable).toBe(true)
  })

  it('detects hasResilient (async/await/Promise)', () => {
    expect(measureEnduring(richContent).hasResilient).toBe(true)
  })

  it('classifies phase correctly for high scores', () => {
    const result = measureEnduring(richContent)
    expect(['blood-moon', 'total-eclipse', 'proper-shadow']).toContain(result.phase)
  })

  it('classifies phase correctly for low scores', () => {
    expect(measureEnduring(emptyContent).phase).not.toBe('blood-moon')
  })
})

// ─── measureUnderstanding ───────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('detects hasWellArchitected (class/interface/type)', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureUnderstanding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureUnderstanding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects hasPrincipled (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects hasVisionary (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('detects hasMature (import/export)', () => {
    expect(measureUnderstanding(richContent).hasMature).toBe(true)
  })

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('classifies cycle correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['lunar-master', 'tide-sage', 'proper-astronomer']).toContain(result.cycle)
  })

  it('classifies cycle correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cycle).not.toBe('lunar-master')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyMoonstoneCondition', () => {
  it('returns moonstone-masterpiece for 90+', () => {
    expect(classifyMoonstoneCondition(90)).toBe('moonstone-masterpiece')
    expect(classifyMoonstoneCondition(95)).toBe('moonstone-masterpiece')
  })

  it('returns lunar-gem for 75-89', () => {
    expect(classifyMoonstoneCondition(75)).toBe('lunar-gem')
  })

  it('returns proper-moonstone for 60-74', () => {
    expect(classifyMoonstoneCondition(60)).toBe('proper-moonstone')
  })

  it('returns cloudy-stone for 40-59', () => {
    expect(classifyMoonstoneCondition(40)).toBe('cloudy-stone')
  })

  it('returns dark-rock for 20-39', () => {
    expect(classifyMoonstoneCondition(20)).toBe('dark-rock')
  })

  it('returns void below 20', () => {
    expect(classifyMoonstoneCondition(0)).toBe('void')
    expect(classifyMoonstoneCondition(10)).toBe('void')
  })
})

describe('classifyPhaseType', () => {
  it('returns no-phase for empty rays', () => {
    expect(classifyPhaseType([])).toBe('no-phase')
  })

  it('returns full-moon for avg >= 85', () => {
    const rays = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyPhaseType(rays)).toBe('full-moon')
  })

  it('returns new-moon for low avg', () => {
    const rays = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyPhaseType(rays)).toBe('new-moon')
  })
})

describe('classifyPhaseCondition', () => {
  it('returns moonstone-palace for 85+', () => {
    expect(classifyPhaseCondition(85)).toBe('moonstone-palace')
  })

  it('returns void below 15', () => {
    expect(classifyPhaseCondition(5)).toBe('void')
  })
})

describe('classifyAstronomerGrade', () => {
  it('returns eclipse-master for 80+', () => {
    expect(classifyAstronomerGrade(80)).toBe('eclipse-master')
  })

  it('returns blind-folded below 20', () => {
    expect(classifyAstronomerGrade(5)).toBe('blind-folded')
  })

  it('returns lunar-scholar for 65-79', () => {
    expect(classifyAstronomerGrade(65)).toBe('lunar-scholar')
  })

  it('returns proper-observer for 50-64', () => {
    expect(classifyAstronomerGrade(50)).toBe('proper-observer')
  })

  it('returns amateur for 35-49', () => {
    expect(classifyAstronomerGrade(35)).toBe('amateur')
  })

  it('returns novice for 20-34', () => {
    expect(classifyAstronomerGrade(20)).toBe('novice')
  })
})

// ─── analyzeMoonstoneRay ────────────────────────────────

describe('analyzeMoonstoneRay', () => {
  it('creates a ray with all 5 measures', () => {
    const ray = analyzeMoonstoneRay(richContent, 'app.ts')
    expect(ray.file).toBe('app.ts')
    expect(typeof ray.lunarLuminescence).toBe('number')
    expect(typeof ray.shadowClarity).toBe('number')
    expect(typeof ray.tidePrecision).toBe('number')
    expect(typeof ray.eclipseResilience).toBe('number')
    expect(typeof ray.lunarWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const ray = analyzeMoonstoneRay(richContent, 'app.ts')
    const expected = Math.round(
      ray.lunarLuminescence * 0.2 +
      ray.shadowClarity * 0.2 +
      ray.tidePrecision * 0.2 +
      ray.eclipseResilience * 0.2 +
      ray.lunarWisdom * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const ray = analyzeMoonstoneRay(richContent, 'app.ts')
    expect(ray.condition).toBe(classifyMoonstoneCondition(ray.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richRay = analyzeMoonstoneRay(richContent, 'rich.ts')
    const emptyRay = analyzeMoonstoneRay(emptyContent, 'empty.ts')
    expect(richRay.qualityScore).toBeGreaterThan(emptyRay.qualityScore)
  })
})

// ─── analyzeMoonstonePhase ──────────────────────────────

describe('analyzeMoonstonePhase', () => {
  it('returns empty phase for no rays', () => {
    const phase = analyzeMoonstonePhase([], 'src')
    expect(phase.directory).toBe('src')
    expect(phase.rays).toEqual([])
    expect(phase.phaseType).toBe('no-phase')
    expect(phase.condition).toBe('void')
  })

  it('computes averages from rays', () => {
    const rays = [analyzeMoonstoneRay(richContent, 'a.ts'), analyzeMoonstoneRay(richContent, 'b.ts')]
    const phase = analyzeMoonstonePhase(rays, 'src')
    expect(phase.avgLuminescence).toBeGreaterThan(0)
    expect(phase.avgPrecision).toBeGreaterThan(0)
    expect(phase.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildMoonstoneEclipseResult ────────────────────────

describe('buildMoonstoneEclipseResult', () => {
  it('returns full result structure', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    expect(result.rays).toHaveLength(1)
    expect(result.phases).toHaveLength(1)
    expect(result.eclipse).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into phases', async () => {
    const result = await buildMoonstoneEclipseResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.phases.length).toBe(2)
  })

  it('computes eclipse overview', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    expect(result.eclipse.avgLuminescence).toBeGreaterThan(0)
    expect(result.eclipse.isMoonstone).toBe(true)
    expect(result.eclipse.overallLuminescence).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildMoonstoneEclipseResult([], [])
    expect(result.rays).toHaveLength(0)
    expect(result.phases).toHaveLength(0)
    expect(result.eclipse.overallLuminescence).toBe(0)
    expect(result.eclipse.isMoonstone).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    const total = result.stats.moonstoneMasterpieceCount +
      result.stats.lunarGemCount +
      result.stats.properMoonstoneCount +
      result.stats.cloudyStoneCount +
      result.stats.darkRockCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    expect(result.stats.hasHighLuminescenceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best ray and top performers', async () => {
    const result = await buildMoonstoneEclipseResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestRay).toBeTruthy()
    expect(result.stats.brightest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes astronomer grade from overall luminescence', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    expect(result.stats.astronomerGrade).toBe(classifyAstronomerGrade(result.stats.overallLuminescence))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgLunarLuminescence: 90,
      avgShadowClarity: 90,
      avgTidePrecision: 90,
      avgEclipseResilience: 90,
      avgLunarWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgLuminescence: 90, avgPrecision: 90, avgWisdom: 90, isMoonstone: true, overallLuminescence: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('eclipse-master')
  })

  it('recommends luminescence when < 60', () => {
    const stats = makeStats({ avgLunarLuminescence: 50 })
    const result = generateRecommendations([], [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('luminescence') || r.includes('moonstone'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgShadowClarity: 50 })
    const result = generateRecommendations([], [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('shadow'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgTidePrecision: 50 })
    const result = generateRecommendations([], [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('tide'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgEclipseResilience: 50 })
    const result = generateRecommendations([], [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('eclipse'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgLunarWisdom: 50 })
    const result = generateRecommendations([], [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('lunar'))).toBe(true)
  })

  it('warns about total darkness when overall < 40', () => {
    const stats = makeStats({ overallLuminescence: 30 })
    const result = generateRecommendations([], [], { avgLuminescence: 30, avgPrecision: 30, avgWisdom: 30, isMoonstone: false, overallLuminescence: 30 }, stats)
    expect(result.some((r) => r.includes('darkness'))).toBe(true)
  })

  it('lists void rays by name when <= 5', () => {
    const rays = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(rays, [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void rays when > 5', () => {
    const rays = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(rays, [], { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('6 dark rocks'))).toBe(true)
  })

  it('warns when all phases are poor', () => {
    const phases = [{ condition: 'empty-field' as const, phaseType: 'new-moon' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], phases as Array<{ condition: string; phaseType: string }>, { avgLuminescence: 50, avgPrecision: 50, avgWisdom: 50, isMoonstone: false, overallLuminescence: 50 }, stats)
    expect(result.some((r) => r.includes('empty fields'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgLunarLuminescence: 70,
      avgShadowClarity: 70,
      avgTidePrecision: 70,
      avgEclipseResilience: 70,
      avgLunarWisdom: 70,
      overallLuminescence: 70,
    })
    const result = generateRecommendations([], [], { avgLuminescence: 70, avgPrecision: 70, avgWisdom: 70, isMoonstone: true, overallLuminescence: 70 }, stats)
    expect(result.some((r) => r.includes('lunar perfection'))).toBe(true)
  })
})

// ─── Format helpers ──────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorMoonstoneCondition', () => {
  it('colors moonstone-masterpiece', () => {
    expect(typeof colorMoonstoneCondition('moonstone-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorMoonstoneCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorMoonstoneCondition('unknown')).toBe('string')
  })
})

describe('colorPhaseType', () => {
  it('colors full-moon', () => {
    expect(typeof colorPhaseType('full-moon')).toBe('string')
  })

  it('colors no-phase', () => {
    expect(typeof colorPhaseType('no-phase')).toBe('string')
  })
})

describe('colorPhaseCondition', () => {
  it('colors moonstone-palace', () => {
    expect(typeof colorPhaseCondition('moonstone-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorPhaseCondition('void')).toBe('string')
  })
})

describe('colorAstronomerGrade', () => {
  it('colors eclipse-master', () => {
    expect(typeof colorAstronomerGrade('eclipse-master')).toBe('string')
  })

  it('colors blind-folded', () => {
    expect(typeof colorAstronomerGrade('blind-folded')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray with all measures', () => {
    const ray = analyzeMoonstoneRay(richContent, 'app.ts')
    const output = formatRayTable(ray)
    expect(output).toContain('Moonstone Ray: app.ts')
    expect(output).toContain('Lunar Luminescence')
    expect(output).toContain('Shadow Clarity')
    expect(output).toContain('Tide Precision')
    expect(output).toContain('Eclipse Resilience')
    expect(output).toContain('Lunar Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatRaysTable', () => {
  it('shows no rays message for empty array', () => {
    expect(formatRaysTable([])).toContain('No moonstone rays')
  })

  it('lists rays in output', () => {
    const rays = [analyzeMoonstoneRay(richContent, 'a.ts')]
    expect(formatRaysTable(rays)).toContain('a.ts')
  })
})

describe('formatPhaseTable', () => {
  it('formats a phase with all fields', () => {
    const rays = [analyzeMoonstoneRay(richContent, 'a.ts')]
    const phase = analyzeMoonstonePhase(rays, 'src')
    const output = formatPhaseTable(phase)
    expect(output).toContain('Moonstone Phase: src')
    expect(output).toContain('Rays')
    expect(output).toContain('Avg Luminescence')
  })
})

describe('formatPhasesTable', () => {
  it('shows no phases message for empty array', () => {
    expect(formatPhasesTable([])).toContain('No moonstone phases')
  })

  it('lists phases in output', () => {
    const rays = [analyzeMoonstoneRay(richContent, 'a.ts')]
    const phase = analyzeMoonstonePhase(rays, 'src')
    expect(formatPhasesTable([phase])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Moonstone Eclipse Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Astronomer Grade')
    expect(output).toContain('Best Ray')
  })
})

describe('formatRecommendations', () => {
  it('shows no recommendations message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('lists recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Moonstone Eclipse Analysis')
    expect(output).toContain('Eclipse Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildMoonstoneEclipseResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.eclipse).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
