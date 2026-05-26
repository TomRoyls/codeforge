import { describe, expect, it } from 'vitest'

import {
  analyzeCosmicArtifact,
  analyzeCosmicChamber,
  buildCosmicTreasuryResult,
  classifyChamberCondition,
  classifyChamberType,
  classifyCosmicCondition,
  classifyCuratorGrade,
  generateRecommendations,
  measureConnecting,
  measureIlluminating,
  measureSecuring,
  measureSurviving,
  measureUnderstanding,
} from '../src/commands/cosmic-treasury-helpers.js'
import type { CosmicTreasuryResult } from '../src/commands/cosmic-treasury-helpers.js'
import {
  colorChamberCondition,
  colorChamberType,
  colorCosmicCondition,
  colorCuratorGrade,
  colorScore,
  formatArtifactTable,
  formatArtifactsTable,
  formatChamberTable,
  formatChambersTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/cosmic-treasury-format-helpers.js'

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

const richVault = measureSecuring(richContent).vault
const richClarity = measureIlluminating(richContent).clarity
const richPrecision = measureConnecting(richContent).precision
const richResilience = measureSurviving(richContent).resilience
const richWisdom = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<CosmicTreasuryResult['stats']> = {}): CosmicTreasuryResult['stats'] {
  return {
    totalFiles: 1,
    totalChambers: 1,
    avgStellarVault: 50,
    avgNebulaClarity: 50,
    avgConstellationPrecision: 50,
    avgSupernovaResilience: 50,
    avgCosmicWisdom: 50,
    cosmicMasterpieceCount: 0,
    stellarGemCount: 0,
    properStarCount: 0,
    dimEmberCount: 0,
    darkVoidCount: 0,
    voidCount: 0,
    hasHighVaultCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighResilienceCount: 1,
    hasHighWisdomCount: 1,
    overallBrilliance: 50,
    curatorGrade: 'proper-keeper',
    bestArtifact: 'a.ts',
    mostSecure: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    mostResilient: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureSecuring ────────────────────────────────────

describe('measureSecuring', () => {
  it('scores rich content highly', () => {
    const result = measureSecuring(richContent)
    expect(result.vault).toBeGreaterThan(60)
    expect(result.hasHighVault).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSecuring(emptyContent).vault).toBeLessThan(richVault)
  })

  it('detects hasErrorHandled (try/catch)', () => {
    expect(measureSecuring(richContent).hasErrorHandled).toBe(true)
  })

  it('counts unhandled keywords', () => {
    const content = 'const unhandled = 1; const uncaught = 2; const bare-throw = 3; const raw-error = 4'
    const result = measureSecuring(content)
    expect(result.unhandledCount).toBe(4)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('counts untested keywords', () => {
    const content = 'const untested = 1; const unverified = 2; const unchecked = 3; const unvalidated = 4'
    const result = measureSecuring(content)
    expect(result.untestedCount).toBe(4)
    expect(result.hasNoUntested).toBe(false)
  })

  it('detects hasStable (class/interface/type)', () => {
    expect(measureSecuring(richContent).hasStable).toBe(true)
  })

  it('detects hasSecure (readonly/private/protected)', () => {
    expect(measureSecuring(richContent).hasSecure).toBe(true)
  })

  it('detects hasGuarded (JSDoc)', () => {
    expect(measureSecuring(richContent).hasGuarded).toBe(true)
  })

  it('classifies treasury correctly for high scores', () => {
    const result = measureSecuring(richContent)
    expect(['impregnable-vault', 'secure-chamber', 'proper-safe']).toContain(result.treasury)
  })

  it('classifies treasury correctly for low scores', () => {
    expect(measureSecuring(emptyContent).treasury).not.toBe('impregnable-vault')
  })
})

// ─── measureIlluminating ────────────────────────────────

describe('measureIlluminating', () => {
  it('scores rich content highly', () => {
    const result = measureIlluminating(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureIlluminating(emptyContent).clarity).toBeLessThan(richClarity)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const obscure = 2; const arcane = 3; const esoteric = 4'
    const result = measureIlluminating(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const mystery = 1; const enigma = 2; const riddle = 3; const puzzle = 4'
    const result = measureIlluminating(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects hasReadable (class/interface/type)', () => {
    expect(measureIlluminating(richContent).hasReadable).toBe(true)
  })

  it('detects hasVisible (JSDoc)', () => {
    expect(measureIlluminating(richContent).hasVisible).toBe(true)
  })

  it('detects hasManifest (try/catch/if)', () => {
    expect(measureIlluminating(richContent).hasManifest).toBe(true)
  })

  it('classifies nebula correctly for high scores', () => {
    const result = measureIlluminating(richContent)
    expect(['eagle-nebula', 'orion-clarity', 'proper-cloud']).toContain(result.nebula)
  })

  it('classifies nebula correctly for low scores', () => {
    expect(measureIlluminating(emptyContent).nebula).not.toBe('eagle-nebula')
  })
})

// ─── measureConnecting ──────────────────────────────────

describe('measureConnecting', () => {
  it('scores rich content highly', () => {
    const result = measureConnecting(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureConnecting(emptyContent).precision).toBeLessThan(richPrecision)
  })

  it('detects hasTypeSafe (no any)', () => {
    expect(measureConnecting(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords', () => {
    const content = 'var x = 1; eval("test")'
    const result = measureConnecting(content)
    expect(result.unsafeCount).toBe(2)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureConnecting(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects hasExact (class/interface/type)', () => {
    expect(measureConnecting(richContent).hasExact).toBe(true)
  })

  it('detects hasAligned (async/await/Promise)', () => {
    expect(measureConnecting(richContent).hasAligned).toBe(true)
  })

  it('classifies pattern correctly for high scores', () => {
    const result = measureConnecting(richContent)
    expect(['grand-constellation', 'star-chain', 'proper-pattern']).toContain(result.pattern)
  })

  it('classifies pattern correctly for low scores', () => {
    expect(measureConnecting(emptyContent).pattern).not.toBe('grand-constellation')
  })
})

// ─── measureSurviving ───────────────────────────────────

describe('measureSurviving', () => {
  it('scores rich content highly', () => {
    const result = measureSurviving(richContent)
    expect(result.resilience).toBeGreaterThan(60)
    expect(result.hasHighResilience).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureSurviving(emptyContent).resilience).toBeLessThan(richResilience)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const disordered = 3; const jumbled = 4'
    const result = measureSurviving(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('counts fragile keywords', () => {
    const content = 'const fragile = 1; const brittle = 2; const delicate = 3; const flimsy = 4'
    const result = measureSurviving(content)
    expect(result.fragileCount).toBe(4)
  })

  it('detects hasWellStructured (class/interface/type)', () => {
    expect(measureSurviving(richContent).hasWellStructured).toBe(true)
  })

  it('detects hasIndomitable (async/await/Promise)', () => {
    expect(measureSurviving(richContent).hasIndomitable).toBe(true)
  })

  it('detects hasRelentless (try/catch/if)', () => {
    expect(measureSurviving(richContent).hasRelentless).toBe(true)
  })

  it('classifies remnant correctly for high scores', () => {
    const result = measureSurviving(richContent)
    expect(['neutron-star', 'black-dwarf', 'proper-remnant']).toContain(result.remnant)
  })

  it('classifies remnant correctly for low scores', () => {
    expect(measureSurviving(emptyContent).remnant).not.toBe('neutron-star')
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
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWisdom)
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

  it('detects hasInsightful (JSDoc)', () => {
    expect(measureUnderstanding(richContent).hasInsightful).toBe(true)
  })

  it('classifies cosmos correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['cosmic-sage', 'star-oracle', 'proper-astronomer']).toContain(result.cosmos)
  })

  it('classifies cosmos correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).cosmos).not.toBe('cosmic-sage')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCosmicCondition', () => {
  it('returns cosmic-masterpiece for 90+', () => {
    expect(classifyCosmicCondition(90)).toBe('cosmic-masterpiece')
    expect(classifyCosmicCondition(95)).toBe('cosmic-masterpiece')
  })

  it('returns stellar-gem for 75-89', () => {
    expect(classifyCosmicCondition(75)).toBe('stellar-gem')
  })

  it('returns proper-star for 60-74', () => {
    expect(classifyCosmicCondition(60)).toBe('proper-star')
  })

  it('returns dim-ember for 40-59', () => {
    expect(classifyCosmicCondition(40)).toBe('dim-ember')
  })

  it('returns dark-void for 20-39', () => {
    expect(classifyCosmicCondition(20)).toBe('dark-void')
  })

  it('returns void below 20', () => {
    expect(classifyCosmicCondition(0)).toBe('void')
    expect(classifyCosmicCondition(10)).toBe('void')
  })
})

describe('classifyChamberType', () => {
  it('returns no-chamber for empty artifacts', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })

  it('returns grand-treasury for avg >= 85', () => {
    const artifacts = [{ qualityScore: 90 }] as Array<{ qualityScore: number }>
    expect(classifyChamberType(artifacts)).toBe('grand-treasury')
  })

  it('returns empty-closet for low avg', () => {
    const artifacts = [{ qualityScore: 10 }] as Array<{ qualityScore: number }>
    expect(classifyChamberType(artifacts)).toBe('empty-closet')
  })
})

describe('classifyChamberCondition', () => {
  it('returns cosmic-palace for 85+', () => {
    expect(classifyChamberCondition(85)).toBe('cosmic-palace')
  })

  it('returns void below 15', () => {
    expect(classifyChamberCondition(5)).toBe('void')
  })
})

describe('classifyCuratorGrade', () => {
  it('returns cosmic-curator for 80+', () => {
    expect(classifyCuratorGrade(80)).toBe('cosmic-curator')
  })

  it('returns dusty-librarian below 20', () => {
    expect(classifyCuratorGrade(5)).toBe('dusty-librarian')
  })

  it('returns stellar-archivist for 65-79', () => {
    expect(classifyCuratorGrade(65)).toBe('stellar-archivist')
  })

  it('returns proper-keeper for 50-64', () => {
    expect(classifyCuratorGrade(50)).toBe('proper-keeper')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyCuratorGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyCuratorGrade(20)).toBe('novice')
  })
})

// ─── analyzeCosmicArtifact ──────────────────────────────

describe('analyzeCosmicArtifact', () => {
  it('creates an artifact with all 5 measures', () => {
    const artifact = analyzeCosmicArtifact(richContent, 'app.ts')
    expect(artifact.file).toBe('app.ts')
    expect(typeof artifact.stellarVault).toBe('number')
    expect(typeof artifact.nebulaClarity).toBe('number')
    expect(typeof artifact.constellationPrecision).toBe('number')
    expect(typeof artifact.supernovaResilience).toBe('number')
    expect(typeof artifact.cosmicWisdom).toBe('number')
  })

  it('computes quality score as weighted average', () => {
    const artifact = analyzeCosmicArtifact(richContent, 'app.ts')
    const expected = Math.round(
      artifact.stellarVault * 0.2 +
      artifact.nebulaClarity * 0.2 +
      artifact.constellationPrecision * 0.2 +
      artifact.supernovaResilience * 0.2 +
      artifact.cosmicWisdom * 0.2,
    )
    expect(artifact.qualityScore).toBe(expected)
  })

  it('classifies condition based on quality score', () => {
    const artifact = analyzeCosmicArtifact(richContent, 'app.ts')
    expect(artifact.condition).toBe(classifyCosmicCondition(artifact.qualityScore))
  })

  it('scores rich content higher than empty', () => {
    const richArtifact = analyzeCosmicArtifact(richContent, 'rich.ts')
    const emptyArtifact = analyzeCosmicArtifact(emptyContent, 'empty.ts')
    expect(richArtifact.qualityScore).toBeGreaterThan(emptyArtifact.qualityScore)
  })
})

// ─── analyzeCosmicChamber ───────────────────────────────

describe('analyzeCosmicChamber', () => {
  it('returns empty chamber for no artifacts', () => {
    const chamber = analyzeCosmicChamber([], 'src')
    expect(chamber.directory).toBe('src')
    expect(chamber.artifacts).toEqual([])
    expect(chamber.chamberType).toBe('no-chamber')
    expect(chamber.condition).toBe('void')
  })

  it('computes averages from artifacts', () => {
    const artifacts = [analyzeCosmicArtifact(richContent, 'a.ts'), analyzeCosmicArtifact(richContent, 'b.ts')]
    const chamber = analyzeCosmicChamber(artifacts, 'src')
    expect(chamber.avgVault).toBeGreaterThan(0)
    expect(chamber.avgPrecision).toBeGreaterThan(0)
    expect(chamber.avgWisdom).toBeGreaterThan(0)
  })
})

// ─── buildCosmicTreasuryResult ──────────────────────────

describe('buildCosmicTreasuryResult', () => {
  it('returns full result structure', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    expect(result.artifacts).toHaveLength(1)
    expect(result.chambers).toHaveLength(1)
    expect(result.universe).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files by directory into chambers', async () => {
    const result = await buildCosmicTreasuryResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.chambers.length).toBe(2)
  })

  it('computes universe overview', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    expect(result.universe.avgVault).toBeGreaterThan(0)
    expect(result.universe.isCosmic).toBe(true)
    expect(result.universe.overallBrilliance).toBeGreaterThan(0)
  })

  it('handles empty input', async () => {
    const result = await buildCosmicTreasuryResult([], [])
    expect(result.artifacts).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.universe.overallBrilliance).toBe(0)
    expect(result.universe.isCosmic).toBe(false)
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    const total = result.stats.cosmicMasterpieceCount +
      result.stats.stellarGemCount +
      result.stats.properStarCount +
      result.stats.dimEmberCount +
      result.stats.darkVoidCount +
      result.stats.voidCount
    expect(total).toBe(1)
  })

  it('tracks high measure counts in stats', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVaultCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })

  it('identifies best artifact and top performers', async () => {
    const result = await buildCosmicTreasuryResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestArtifact).toBeTruthy()
    expect(result.stats.mostSecure).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostResilient).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })

  it('computes curator grade from overall brilliance', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    expect(result.stats.curatorGrade).toBe(classifyCuratorGrade(result.stats.overallBrilliance))
  })

  it('sets celebration when self-referencing file path is present', async () => {
    const result = await buildCosmicTreasuryResult(['cosmic-treasury-helpers.ts'], [richContent])
    expect(result.celebration).toContain('Command #640')
    expect(result.universe.celebration).toContain('Command #640')
    expect(result.stats.celebration).toContain('Command #640')
  })

  it('does not set celebration when no self-referencing file', async () => {
    const result = await buildCosmicTreasuryResult(['app.ts'], [richContent])
    expect(result.celebration).toBeUndefined()
    expect(result.universe.celebration).toBeUndefined()
    expect(result.stats.celebration).toBeUndefined()
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message when all avgs >= 90', () => {
    const stats = makeStats({
      avgStellarVault: 90,
      avgNebulaClarity: 90,
      avgConstellationPrecision: 90,
      avgSupernovaResilience: 90,
      avgCosmicWisdom: 90,
    })
    const result = generateRecommendations([], [], { avgVault: 90, avgPrecision: 90, avgWisdom: 90, isCosmic: true, overallBrilliance: 90 }, stats)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('impregnable')
  })

  it('recommends vault when < 60', () => {
    const stats = makeStats({ avgStellarVault: 50 })
    const result = generateRecommendations([], [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('vault') || r.includes('stellar'))).toBe(true)
  })

  it('recommends clarity when < 60', () => {
    const stats = makeStats({ avgNebulaClarity: 50 })
    const result = generateRecommendations([], [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('clarity') || r.includes('nebula'))).toBe(true)
  })

  it('recommends precision when < 60', () => {
    const stats = makeStats({ avgConstellationPrecision: 50 })
    const result = generateRecommendations([], [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('precision') || r.includes('constellation'))).toBe(true)
  })

  it('recommends resilience when < 60', () => {
    const stats = makeStats({ avgSupernovaResilience: 50 })
    const result = generateRecommendations([], [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('resilience') || r.includes('supernova'))).toBe(true)
  })

  it('recommends wisdom when < 60', () => {
    const stats = makeStats({ avgCosmicWisdom: 50 })
    const result = generateRecommendations([], [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('wisdom') || r.includes('cosmic'))).toBe(true)
  })

  it('warns about darkness when brilliance < 40', () => {
    const stats = makeStats({ overallBrilliance: 30 })
    const result = generateRecommendations([], [], { avgVault: 30, avgPrecision: 30, avgWisdom: 30, isCosmic: false, overallBrilliance: 30 }, stats)
    expect(result.some((r) => r.includes('darkness'))).toBe(true)
  })

  it('lists void artifacts by name when <= 5', () => {
    const artifacts = Array.from({ length: 3 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 3 })
    const result = generateRecommendations(artifacts, [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('void0.ts'))).toBe(true)
  })

  it('summarizes void artifacts when > 5', () => {
    const artifacts = Array.from({ length: 6 }, (_, i) => ({
      condition: 'void' as const,
      file: `void${i}.ts`,
    } as { condition: 'void'; file: string }))
    const stats = makeStats({ voidCount: 6 })
    const result = generateRecommendations(artifacts, [], { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('6 dark voids'))).toBe(true)
  })

  it('warns when all chambers are poor', () => {
    const chambers = [{ condition: 'dusty-attic' as const, chamberType: 'empty-closet' as const }]
    const stats = makeStats()
    const result = generateRecommendations([], chambers as Array<{ condition: string; chamberType: string }>, { avgVault: 50, avgPrecision: 50, avgWisdom: 50, isCosmic: false, overallBrilliance: 50 }, stats)
    expect(result.some((r) => r.includes('dusty attics'))).toBe(true)
  })

  it('returns positive message when no issues found', () => {
    const stats = makeStats({
      avgStellarVault: 70,
      avgNebulaClarity: 70,
      avgConstellationPrecision: 70,
      avgSupernovaResilience: 70,
      avgCosmicWisdom: 70,
      overallBrilliance: 70,
    })
    const result = generateRecommendations([], [], { avgVault: 70, avgPrecision: 70, avgWisdom: 70, isCosmic: true, overallBrilliance: 70 }, stats)
    expect(result.some((r) => r.includes('universal perfection'))).toBe(true)
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

describe('colorCosmicCondition', () => {
  it('colors cosmic-masterpiece', () => {
    expect(typeof colorCosmicCondition('cosmic-masterpiece')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorCosmicCondition('void')).toBe('string')
  })

  it('colors unknown condition', () => {
    expect(typeof colorCosmicCondition('unknown')).toBe('string')
  })
})

describe('colorChamberType', () => {
  it('colors grand-treasury', () => {
    expect(typeof colorChamberType('grand-treasury')).toBe('string')
  })

  it('colors no-chamber', () => {
    expect(typeof colorChamberType('no-chamber')).toBe('string')
  })
})

describe('colorChamberCondition', () => {
  it('colors cosmic-palace', () => {
    expect(typeof colorChamberCondition('cosmic-palace')).toBe('string')
  })

  it('colors void', () => {
    expect(typeof colorChamberCondition('void')).toBe('string')
  })
})

describe('colorCuratorGrade', () => {
  it('colors cosmic-curator', () => {
    expect(typeof colorCuratorGrade('cosmic-curator')).toBe('string')
  })

  it('colors dusty-librarian', () => {
    expect(typeof colorCuratorGrade('dusty-librarian')).toBe('string')
  })
})

describe('formatArtifactTable', () => {
  it('formats an artifact with all measures', () => {
    const artifact = analyzeCosmicArtifact(richContent, 'app.ts')
    const output = formatArtifactTable(artifact)
    expect(output).toContain('Cosmic Artifact: app.ts')
    expect(output).toContain('Stellar Vault')
    expect(output).toContain('Nebula Clarity')
    expect(output).toContain('Constellation Precision')
    expect(output).toContain('Supernova Resilience')
    expect(output).toContain('Cosmic Wisdom')
    expect(output).toContain('Quality Score')
  })
})

describe('formatArtifactsTable', () => {
  it('shows no artifacts message for empty array', () => {
    expect(formatArtifactsTable([])).toContain('No cosmic artifacts')
  })

  it('lists artifacts in output', () => {
    const artifacts = [analyzeCosmicArtifact(richContent, 'a.ts')]
    expect(formatArtifactsTable(artifacts)).toContain('a.ts')
  })
})

describe('formatChamberTable', () => {
  it('formats a chamber with all fields', () => {
    const artifacts = [analyzeCosmicArtifact(richContent, 'a.ts')]
    const chamber = analyzeCosmicChamber(artifacts, 'src')
    const output = formatChamberTable(chamber)
    expect(output).toContain('Cosmic Chamber: src')
    expect(output).toContain('Artifacts')
    expect(output).toContain('Avg Vault')
  })
})

describe('formatChambersTable', () => {
  it('shows no chambers message for empty array', () => {
    expect(formatChambersTable([])).toContain('No cosmic chambers')
  })

  it('lists chambers in output', () => {
    const artifacts = [analyzeCosmicArtifact(richContent, 'a.ts')]
    const chamber = analyzeCosmicChamber(artifacts, 'src')
    expect(formatChambersTable([chamber])).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats all stat fields', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Cosmic Treasury Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Curator Grade')
    expect(output).toContain('Best Artifact')
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
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Cosmic Treasury Analysis')
    expect(output).toContain('Universe Overview')
    expect(output).toContain('Recommendations')
  })

  it('includes celebration when present', async () => {
    const result = await buildCosmicTreasuryResult(['cosmic-treasury.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Command #640')
  })
})

describe('formatResultJson', () => {
  it('produces valid JSON', async () => {
    const result = await buildCosmicTreasuryResult(['a.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.artifacts).toHaveLength(1)
    expect(parsed.universe).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes celebration in JSON when self-referencing', async () => {
    const result = await buildCosmicTreasuryResult(['cosmic-treasury-helpers.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.celebration).toContain('Command #640')
    expect(parsed.universe.celebration).toContain('Command #640')
    expect(parsed.stats.celebration).toContain('Command #640')
  })
})
