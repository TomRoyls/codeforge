import { describe, expect, it } from 'vitest'

import {
  analyzeCrystalTower,
  analyzeCrystalWatch,
  buildCrystalSentinelResult,
  classifyCommanderGrade,
  classifyTowerCondition,
  classifyTowerType,
  classifyWatchCondition,
  generateRecommendations,
  measureCutting,
  measureGuarding,
  measureRevealing,
  measureStanding,
  measureWatching,
} from '../src/commands/crystal-sentinel-helpers.js'
import type { CrystalSentinelResult } from '../src/commands/crystal-sentinel-helpers.js'
import {
  colorCommanderGrade,
  colorScore,
  colorTowerCondition,
  colorTowerType,
  colorWatchCondition,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
  formatTowersTable,
  formatTowerTable,
  formatWatchesTable,
  formatWatchTable,
} from '../src/commands/crystal-sentinel-format-helpers.js'

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

const richVig = measureWatching(richContent).vigilance
const richSha = measureCutting(richContent).sharpness
const richCla = measureRevealing(richContent).clarity
const richEnd = measureStanding(richContent).endurance
const richGua = measureGuarding(richContent).guardianship

function makeStats(overrides: Partial<CrystalSentinelResult['stats']> = {}): CrystalSentinelResult['stats'] {
  return {
    totalFiles: 1,
    totalTowers: 1,
    avgCrystallineVigilance: 50,
    avgFacetSharpness: 50,
    avgPrismClarity: 50,
    avgStructureEndurance: 50,
    avgMineralGuardianship: 50,
    crystalMasterpieceCount: 0,
    gemSentinelCount: 0,
    properCrystalCount: 0,
    flawedQuartzCount: 0,
    gravelStoneCount: 0,
    voidCount: 0,
    hasHighVigilanceCount: 1,
    hasHighSharpnessCount: 1,
    hasHighClarityCount: 1,
    hasHighEnduranceCount: 1,
    hasHighGuardianshipCount: 1,
    overallVigilance: 50,
    commanderGrade: 'proper-guard',
    bestWatch: 'a.ts',
    mostVigilant: 'a.ts',
    sharpest: 'a.ts',
    clearest: 'a.ts',
    mostEnduring: 'a.ts',
    mostProtective: 'a.ts',
    ...overrides,
  }
}

// ─── measureWatching ────────────────────────────────────

describe('measureWatching', () => {
  it('scores rich content highly', () => {
    const result = measureWatching(richContent)
    expect(result.vigilance).toBeGreaterThan(60)
    expect(result.hasHighVigilance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureWatching(emptyContent).vigilance).toBeLessThan(richVig)
  })

  it('detects comprehensive (class/interface/type)', () => {
    expect(measureWatching(richContent).hasComprehensive).toBe(true)
  })

  it('counts incomplete keywords', () => {
    const content = 'const incomplete = 1; const partial = 2; const fragment = 3; const half-done = 4; const wip = 5'
    const result = measureWatching(content)
    expect(result.incompleteCount).toBe(5)
    expect(result.hasNoIncomplete).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureWatching(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects documented (JSDoc)', () => {
    expect(measureWatching(richContent).hasDocumented).toBe(true)
  })

  it('detects tested (if/return)', () => {
    expect(measureWatching(richContent).hasTested).toBe(true)
  })

  it('detects covered (try/catch)', () => {
    expect(measureWatching(richContent).hasCovered).toBe(true)
  })

  it('detects complete (import/export)', () => {
    expect(measureWatching(richContent).hasComplete).toBe(true)
  })

  it('classifies guard correctly for high scores', () => {
    const result = measureWatching(richContent)
    expect(['omniscient-watch', 'keen-sentinel', 'proper-guard']).toContain(result.guard)
  })

  it('classifies guard correctly for low scores', () => {
    expect(measureWatching(emptyContent).guard).not.toBe('omniscient-watch')
  })
})

// ─── measureCutting ─────────────────────────────────────

describe('measureCutting', () => {
  it('scores rich content highly', () => {
    const result = measureCutting(richContent)
    expect(result.sharpness).toBeGreaterThan(60)
    expect(result.hasHighSharpness).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureCutting(emptyContent).sharpness).toBeLessThan(richSha)
  })

  it('detects type-safe (no any)', () => {
    expect(measureCutting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureCutting(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureCutting(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects exact (class/interface/type)', () => {
    expect(measureCutting(richContent).hasExact).toBe(true)
  })

  it('detects crisp (JSDoc)', () => {
    expect(measureCutting(richContent).hasCrisp).toBe(true)
  })

  it('classifies blade correctly for high scores', () => {
    const result = measureCutting(richContent)
    expect(['surgical-laser', 'diamond-blade', 'proper-edge']).toContain(result.blade)
  })

  it('classifies blade correctly for low scores', () => {
    expect(measureCutting(emptyContent).blade).not.toBe('surgical-laser')
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
    expect(measureRevealing(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('detects readable (type annotations)', () => {
    expect(measureRevealing(richContent).hasReadable).toBe(true)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureRevealing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureRevealing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects self-documenting (class/interface/type)', () => {
    expect(measureRevealing(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects transparent (no any)', () => {
    expect(measureRevealing(richContent).hasTransparent).toBe(true)
  })

  it('classifies transparency correctly for high scores', () => {
    const result = measureRevealing(richContent)
    expect(['flawless-prism', 'clear-crystal', 'proper-glass']).toContain(result.transparency)
  })

  it('classifies transparency correctly for low scores', () => {
    expect(measureRevealing(emptyContent).transparency).not.toBe('flawless-prism')
  })
})

// ─── measureStanding ────────────────────────────────────

describe('measureStanding', () => {
  it('scores rich content highly', () => {
    const result = measureStanding(richContent)
    expect(result.endurance).toBeGreaterThan(60)
    expect(result.hasHighEndurance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureStanding(emptyContent).endurance).toBeLessThan(richEnd)
  })

  it('detects error-handled (try/catch)', () => {
    expect(measureStanding(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureStanding(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const flimsy = 3; const delicate = 4'
    const result = measureStanding(content)
    expect(result.fragileCount).toBe(4)
  })

  it('detects defensive (if/return)', () => {
    expect(measureStanding(richContent).hasDefensive).toBe(true)
  })

  it('detects robust (import/export)', () => {
    expect(measureStanding(richContent).hasRobust).toBe(true)
  })

  it('classifies crystal correctly for high scores', () => {
    const result = measureStanding(richContent)
    expect(['diamond-hard', 'sapphire-grade', 'proper-crystal']).toContain(result.crystal)
  })

  it('classifies crystal correctly for low scores', () => {
    expect(measureStanding(emptyContent).crystal).not.toBe('diamond-hard')
  })
})

// ─── measureGuarding ────────────────────────────────────

describe('measureGuarding', () => {
  it('scores rich content highly', () => {
    const result = measureGuarding(richContent)
    expect(result.guardianship).toBeGreaterThan(60)
    expect(result.hasHighGuardianship).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGuarding(emptyContent).guardianship).toBeLessThan(richGua)
  })

  it('detects well-architected (class/interface/type)', () => {
    expect(measureGuarding(richContent).hasWellArchitected).toBe(true)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureGuarding(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureGuarding(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects principled (no any)', () => {
    expect(measureGuarding(richContent).hasPrincipled).toBe(true)
  })

  it('detects vigilant (try/catch/if)', () => {
    expect(measureGuarding(richContent).hasVigilant).toBe(true)
  })

  it('classifies shield correctly for high scores', () => {
    const result = measureGuarding(richContent)
    expect(['impervious-guardian', 'strong-protector', 'proper-warden']).toContain(result.shield)
  })

  it('classifies shield correctly for low scores', () => {
    expect(measureGuarding(emptyContent).shield).not.toBe('impervious-guardian')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyWatchCondition', () => {
  it('returns crystal-masterpiece for 90+', () => {
    expect(classifyWatchCondition(90)).toBe('crystal-masterpiece')
    expect(classifyWatchCondition(95)).toBe('crystal-masterpiece')
  })

  it('returns gem-sentinel for 75-89', () => {
    expect(classifyWatchCondition(75)).toBe('gem-sentinel')
  })

  it('returns proper-crystal for 60-74', () => {
    expect(classifyWatchCondition(60)).toBe('proper-crystal')
  })

  it('returns flawed-quartz for 40-59', () => {
    expect(classifyWatchCondition(40)).toBe('flawed-quartz')
  })

  it('returns gravel-stone for 20-39', () => {
    expect(classifyWatchCondition(20)).toBe('gravel-stone')
  })

  it('returns void below 20', () => {
    expect(classifyWatchCondition(0)).toBe('void')
    expect(classifyWatchCondition(10)).toBe('void')
  })
})

describe('classifyTowerType', () => {
  it('returns no-tower for empty watches', () => {
    expect(classifyTowerType([])).toBe('no-tower')
  })

  it('returns grand-watchtower for avg >= 85', () => {
    const watches = [{ qualityScore: 90 } as any]
    expect(classifyTowerType(watches)).toBe('grand-watchtower')
  })

  it('returns empty-platform for low avg', () => {
    const watches = [{ qualityScore: 10 } as any]
    expect(classifyTowerType(watches)).toBe('empty-platform')
  })
})

describe('classifyTowerCondition', () => {
  it('returns crystal-palace for 85+', () => {
    expect(classifyTowerCondition(85)).toBe('crystal-palace')
  })

  it('returns void below 15', () => {
    expect(classifyTowerCondition(5)).toBe('void')
  })
})

describe('classifyCommanderGrade', () => {
  it('returns crystal-commander for 80+', () => {
    expect(classifyCommanderGrade(80)).toBe('crystal-commander')
  })

  it('returns sleeper below 20', () => {
    expect(classifyCommanderGrade(5)).toBe('sleeper')
  })

  it('returns senior-sentinel for 65-79', () => {
    expect(classifyCommanderGrade(65)).toBe('senior-sentinel')
  })

  it('returns proper-guard for 50-64', () => {
    expect(classifyCommanderGrade(50)).toBe('proper-guard')
  })

  it('returns watchman for 35-49', () => {
    expect(classifyCommanderGrade(35)).toBe('watchman')
  })

  it('returns recruit for 20-34', () => {
    expect(classifyCommanderGrade(20)).toBe('recruit')
  })
})

// ─── analyzeCrystalWatch ────────────────────────────────

describe('analyzeCrystalWatch', () => {
  it('creates a watch with all 5 measures', () => {
    const watch = analyzeCrystalWatch(richContent, 'app.ts')
    expect(watch.file).toBe('app.ts')
    expect(typeof watch.crystallineVigilance).toBe('number')
    expect(typeof watch.facetSharpness).toBe('number')
    expect(typeof watch.prismClarity).toBe('number')
    expect(typeof watch.structureEndurance).toBe('number')
    expect(typeof watch.mineralGuardianship).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const watch = analyzeCrystalWatch(richContent, 'app.ts')
    const expected = Math.round(
      watch.crystallineVigilance * 0.2 +
      watch.facetSharpness * 0.2 +
      watch.prismClarity * 0.2 +
      watch.structureEndurance * 0.2 +
      watch.mineralGuardianship * 0.2,
    )
    expect(watch.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const watch = analyzeCrystalWatch(richContent, 'app.ts')
    expect(watch.condition).toBe(classifyWatchCondition(watch.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richWatch = analyzeCrystalWatch(richContent, 'rich.ts')
    const emptyWatch = analyzeCrystalWatch(emptyContent, 'empty.ts')
    expect(richWatch.qualityScore).toBeGreaterThan(emptyWatch.qualityScore)
  })
})

// ─── analyzeCrystalTower ────────────────────────────────

describe('analyzeCrystalTower', () => {
  it('returns empty tower for no watches', () => {
    const tower = analyzeCrystalTower([], 'src')
    expect(tower.directory).toBe('src')
    expect(tower.watches).toEqual([])
    expect(tower.towerType).toBe('no-tower')
    expect(tower.condition).toBe('void')
  })

  it('computes averages from watches', () => {
    const watches = [analyzeCrystalWatch(richContent, 'a.ts'), analyzeCrystalWatch(richContent, 'b.ts')]
    const tower = analyzeCrystalTower(watches, 'src')
    expect(tower.avgVigilance).toBeGreaterThan(0)
    expect(tower.avgSharpness).toBeGreaterThan(0)
    expect(tower.avgGuardianship).toBeGreaterThan(0)
  })
})

// ─── buildCrystalSentinelResult ─────────────────────────

describe('buildCrystalSentinelResult', () => {
  it('returns full result structure', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    expect(result.watches).toHaveLength(1)
    expect(result.towers).toHaveLength(1)
    expect(result.garrison).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into towers', async () => {
    const result = await buildCrystalSentinelResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.towers.length).toBe(2)
  })

  it('computes garrison overview', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    expect(result.garrison.avgVigilance).toBeGreaterThan(0)
    expect(result.garrison.isCrystal).toBe(true)
    expect(result.garrison.overallVigilance).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildCrystalSentinelResult([], [])
    expect(result.watches).toHaveLength(0)
    expect(result.towers).toHaveLength(0)
    expect(result.garrison.overallVigilance).toBe(0)
    expect(result.garrison.isCrystal).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    const total = result.stats.crystalMasterpieceCount +
      result.stats.gemSentinelCount +
      result.stats.properCrystalCount +
      result.stats.flawedQuartzCount +
      result.stats.gravelStoneCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVigilanceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSharpnessCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighEnduranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighGuardianshipCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best watch and top performers', async () => {
    const result = await buildCrystalSentinelResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestWatch).toBeTruthy()
    expect(result.stats.mostVigilant).toBeTruthy()
    expect(result.stats.sharpest).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostEnduring).toBeTruthy()
    expect(result.stats.mostProtective).toBeTruthy()
  })

  it('computes commander grade from overall vigilance', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    expect(result.stats.commanderGrade).toBe(classifyCommanderGrade(result.stats.overallVigilance))
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgCrystallineVigilance: 90,
      avgFacetSharpness: 90,
      avgPrismClarity: 90,
      avgStructureEndurance: 90,
      avgMineralGuardianship: 90,
    })
    const result = generateRecommendations([], [], { avgVigilance: 90, avgSharpness: 90, avgGuardianship: 90, isCrystal: true, overallVigilance: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('omniscient vigilance')
  })

  it('recommends vigilance when < 60', () => {
    const stats = makeStats({ avgCrystallineVigilance: 50 })
    const result = generateRecommendations([], [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('vigilance'))).toBe(true)
  })

  it('recommends sharpness when < 60', () => {
    const stats = makeStats({ avgFacetSharpness: 50 })
    const result = generateRecommendations([], [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('sharpness') || r.includes('sharp'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgPrismClarity: 50 })
    const result = generateRecommendations([], [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('transparent'))).toBe(true)
  })

  it('recommends endurance when < 60', () => {
    const stats = makeStats({ avgStructureEndurance: 50 })
    const result = generateRecommendations([], [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('endurance') || r.includes('diamond'))).toBe(true)
  })

  it('recommends guardianship when < 60', () => {
    const stats = makeStats({ avgMineralGuardianship: 50 })
    const result = generateRecommendations([], [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('guardianship') || r.includes('wisdom'))).toBe(true)
  })

  it('warns about crumbling sentinel when vigilance < 40', () => {
    const stats = makeStats({ overallVigilance: 30 })
    const result = generateRecommendations([], [], { avgVigilance: 30, avgSharpness: 30, avgGuardianship: 30, isCrystal: false, overallVigilance: 30 }, stats)
    expect(result.some((r) => r.includes('crumbling'))).toBe(true)
  })

  it('lists void watches by name when <= 5', () => {
    const watches = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(watches, [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void watches when > 5', () => {
    const watches = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as any))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(watches, [], { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('6 gravel stones'))).toBe(true)
  })

  it('warns when all towers are poor', () => {
    const towers = [{ condition: 'wooden-fence' as const, towerType: 'wooden-post' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], towers as any, { avgVigilance: 50, avgSharpness: 50, avgGuardianship: 50, isCrystal: false, overallVigilance: 50 }, stats)
    expect(result.some((r) => r.includes('wooden fences'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgCrystallineVigilance: 70,
      avgFacetSharpness: 70,
      avgPrismClarity: 70,
      avgStructureEndurance: 70,
      avgMineralGuardianship: 70,
      overallVigilance: 70,
    })
    const result = generateRecommendations([], [], { avgVigilance: 70, avgSharpness: 70, avgGuardianship: 70, isCrystal: true, overallVigilance: 70 }, stats)
    expect(result.some((r) => r.includes('stands vigilant'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns different colors for different ranges', () => {
    expect(colorScore(95)).not.toBe(colorScore(10))
  })
})

describe('colorWatchCondition', () => {
  it('colors crystal-masterpiece', () => {
    expect(typeof colorWatchCondition('crystal-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorWatchCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorWatchCondition('unknown')).toBe('string')
  })
})

describe('colorTowerType', () => {
  it('colors grand-watchtower', () => {
    expect(typeof colorTowerType('grand-watchtower')).toBe('string')
  })

  it('colors no-tower', () => {
    expect(typeof colorTowerType('no-tower')).toBe('string')
  })
})

describe('colorTowerCondition', () => {
  it('colors crystal-palace', () => {
    expect(typeof colorTowerCondition('crystal-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorTowerCondition('void')).toBe('string')
  })
})

describe('colorCommanderGrade', () => {
  it('colors crystal-commander', () => {
    expect(typeof colorCommanderGrade('crystal-commander')).toBe('string')
  })

  it('colors sleeper', () => {
    expect(typeof colorCommanderGrade('sleeper')).toBe('string')
  })
})

describe('formatWatchTable', () => {
  it('formats a watch with all measures', () => {
    const watch = analyzeCrystalWatch(richContent, 'app.ts')
    const output = formatWatchTable(watch)
    expect(output).toContain('Crystal Watch: app.ts')
    expect(output).toContain('Crystalline Vigilance')
    expect(output).toContain('Facet Sharpness')
    expect(output).toContain('Prism Clarity')
    expect(output).toContain('Structure Endurance')
    expect(output).toContain('Mineral Guardianship')
    expect(output).toContain('Quality Score')
  })
})

describe('formatWatchesTable', () => {
  it('shows no watches message for empty array', () => {
    expect(formatWatchesTable([])).toContain('No crystal watches')
  })

  it('lists watches in output', () => {
    const watches = [analyzeCrystalWatch(richContent, 'a.ts')]
    expect(formatWatchesTable(watches)).toContain('a.ts')
  })
})

describe('formatTowerTable', () => {
  it('formats a tower with all fields', () => {
    const watches = [analyzeCrystalWatch(richContent, 'a.ts')]
    const tower = analyzeCrystalTower(watches, 'src')
    const output = formatTowerTable(tower)
    expect(output).toContain('Crystal Tower: src')
    expect(output).toContain('Watches')
    expect(output).toContain('Avg Vigilance')
  })
})

describe('formatTowersTable', () => {
  it('shows no towers message for empty array', () => {
    expect(formatTowersTable([])).toContain('No crystal towers')
  })

  it('lists towers in output', () => {
    const watches = [analyzeCrystalWatch(richContent, 'a.ts')]
    const tower = analyzeCrystalTower(watches, 'src')
    expect(formatTowersTable([tower])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Crystal Sentinel Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Commander Grade')
    expect(output).toContain('Best Watch')
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
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Crystal Sentinel Analysis')
    expect(output).toContain('Garrison Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCrystalSentinelResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.watches).toHaveLength(1)
    expect(parsed.garrison).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
