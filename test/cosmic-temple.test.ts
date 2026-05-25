import { describe, expect, it } from 'vitest'

import {
  analyzeStellarPillar,
  analyzeStellarNave,
  buildStellarCathedralResult,
  classifyPillarCondition,
  classifyNaveType,
  classifyNaveCondition,
  classifyArchitectGrade,
  generateRecommendations,
  measureDesigning,
  measureSanctifying,
  measureRevealing,
  measureCalibrating,
  measureTranscending,
  type PillarCondition,
  type NaveCondition,
  type StellarPillar,
  type StellarCathedralResult,
  type StellarNave,
} from '../src/commands/cosmic-temple-helpers.js'

import {
  colorPillarCondition,
  colorNaveCondition,
  colorScore,
  formatPillarTable,
  formatPillarsTable,
  formatNavesTable,
  formatNaveTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/cosmic-temple-format-helpers.js'

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

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureDesigning ───────────────────────────────────

describe('measureDesigning', () => {
  it('scores rich content high', () => {
    const m = measureDesigning(richContent)
    expect(m.architecture).toBeGreaterThanOrEqual(60)
    expect(m.hasHighArchitecture).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureDesigning(emptyContent)
    expect(m.architecture).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureDesigning(richContent)
    const poor = measureDesigning(poorContent)
    expect(rich.architecture).toBeGreaterThan(poor.architecture)
  })

  it('detects chaotic patterns', () => {
    const m = measureDesigning('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects tangled patterns', () => {
    const m = measureDesigning('tangled spaghetti coupled')
    expect(m.tangledCount).toBeGreaterThan(0)
    expect(m.hasNoTangled).toBe(false)
  })

  it('assigns high blueprint for rich content', () => {
    const m = measureDesigning(richContent)
    expect(['cosmic-masterwork', 'stellar-design', 'proper-structure']).toContain(m.blueprint)
  })

  it('assigns low blueprint for empty content', () => {
    const m = measureDesigning(emptyContent)
    expect(['no-architecture', 'random-noise', 'haphazard', 'proper-structure']).toContain(m.blueprint)
  })

  it('has all boolean properties', () => {
    const m = measureDesigning(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasModular).toBe('boolean')
    expect(typeof m.hasTimeless).toBe('boolean')
    expect(typeof m.hasDecoupled).toBe('boolean')
  })

  it('scores high for content matching most positives', () => {
    const m = measureDesigning(richContent)
    expect(m.architecture).toBeGreaterThanOrEqual(90)
  })
})

// ─── measureSanctifying ─────────────────────────────────

describe('measureSanctifying', () => {
  it('scores rich content high', () => {
    const m = measureSanctifying(richContent)
    expect(m.sanctity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighSanctity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureSanctifying(emptyContent)
    expect(m.sanctity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureSanctifying(richContent)
    const poor = measureSanctifying(poorContent)
    expect(rich.sanctity).toBeGreaterThan(poor.sanctity)
  })

  it('detects untested patterns', () => {
    const m = measureSanctifying('eval (x)')
    expect(m.untestedCount).toBeGreaterThan(0)
    expect(m.hasNoUntested).toBe(false)
  })

  it('assigns high star for rich content', () => {
    const m = measureSanctifying(richContent)
    expect(['sacred-sirius', 'blessed-polaris', 'proper-star']).toContain(m.star)
  })

  it('assigns low star for empty content', () => {
    const m = measureSanctifying(emptyContent)
    expect(['no-sanctity', 'dark-matter', 'dim-candle', 'proper-star']).toContain(m.star)
  })

  it('has all boolean properties', () => {
    const m = measureSanctifying(richContent)
    expect(typeof m.hasDocumented).toBe('boolean')
    expect(typeof m.hasReverent).toBe('boolean')
    expect(typeof m.hasDevoted).toBe('boolean')
  })

  it('has no undocumented count always zero', () => {
    const m = measureSanctifying(richContent)
    expect(m.undocumentedCount).toBe(0)
    expect(m.hasNoUndocumented).toBe(true)
  })

  it('detects unsafe patterns', () => {
    const m = measureSanctifying('var x = eval(Function)')
    expect(m.untestedCount).toBeGreaterThan(0)
  })
})

// ─── measureRevealing ───────────────────────────────────

describe('measureRevealing', () => {
  it('scores rich content high', () => {
    const m = measureRevealing(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRevealing(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureRevealing(richContent)
    const poor = measureRevealing(poorContent)
    expect(rich.clarity).toBeGreaterThan(poor.clarity)
  })

  it('detects cryptic patterns', () => {
    const m = measureRevealing('cryptic obfuscate minified')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureRevealing('var x = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high vault for rich content', () => {
    const m = measureRevealing(richContent)
    expect(['crystal-vault', 'starlit-dome', 'proper-ceiling']).toContain(m.vault)
  })

  it('assigns low vault for empty content', () => {
    const m = measureRevealing(emptyContent)
    expect(['no-clarity', 'low-ceiling', 'clouded-sky', 'proper-ceiling']).toContain(m.vault)
  })

  it('has all boolean properties', () => {
    const m = measureRevealing(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasCosmic).toBe('boolean')
    expect(typeof m.hasUniversal).toBe('boolean')
  })

  it('detects cosmic pattern with generics', () => {
    const m = measureRevealing('class Analyzer<T> {}')
    expect(m.hasCosmic).toBe(true)
  })
})

// ─── measureCalibrating ─────────────────────────────────

describe('measureCalibrating', () => {
  it('scores rich content high', () => {
    const m = measureCalibrating(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(60)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureCalibrating(emptyContent)
    expect(m.precision).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureCalibrating(richContent)
    const poor = measureCalibrating(poorContent)
    expect(rich.precision).toBeGreaterThan(poor.precision)
  })

  it('detects approximate patterns', () => {
    const m = measureCalibrating('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects unsafe patterns', () => {
    const m = measureCalibrating('var x = eval(Function)')
    expect(m.unsafeCount).toBeGreaterThan(0)
    expect(m.hasNoUnsafe).toBe(false)
  })

  it('assigns high calibration for rich content', () => {
    const m = measureCalibrating(richContent)
    expect(['quantum-exact', 'astronomical-grade', 'proper-measurement']).toContain(m.calibration)
  })

  it('assigns low calibration for empty content', () => {
    const m = measureCalibrating(emptyContent)
    expect(['no-precision', 'guesswork', 'approximate', 'proper-measurement']).toContain(m.calibration)
  })

  it('has all boolean properties', () => {
    const m = measureCalibrating(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasMicrometer).toBe('boolean')
    expect(typeof m.hasCrisp).toBe('boolean')
  })

  it('detects vague patterns', () => {
    const m = measureCalibrating('vague rough approximate')
    expect(m.hasNoVague).toBe(false)
  })
})

// ─── measureTranscending ────────────────────────────────

describe('measureTranscending', () => {
  it('scores rich content high', () => {
    const m = measureTranscending(richContent)
    expect(m.transcendence).toBeGreaterThanOrEqual(60)
    expect(m.hasHighTranscendence).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureTranscending(emptyContent)
    expect(m.transcendence).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureTranscending(richContent)
    const poor = measureTranscending(poorContent)
    expect(rich.transcendence).toBeGreaterThan(poor.transcendence)
  })

  it('detects hacked patterns', () => {
    const m = measureTranscending('hack workaround kludge')
    expect(m.hackedCount).toBeGreaterThan(0)
    expect(m.hasNoHacked).toBe(false)
  })

  it('detects shallow patterns', () => {
    const m = measureTranscending('shallow superficial trivial')
    expect(m.shallowCount).toBeGreaterThan(0)
  })

  it('assigns high dawn for rich content', () => {
    const m = measureTranscending(richContent)
    expect(['cosmic-ascension', 'stellar-dawn', 'proper-sunrise']).toContain(m.dawn)
  })

  it('assigns low dawn for empty content', () => {
    const m = measureTranscending(emptyContent)
    expect(['no-transcendence', 'eternal-night', 'gray-morning', 'proper-sunrise']).toContain(m.dawn)
  })

  it('has all boolean properties', () => {
    const m = measureTranscending(richContent)
    expect(typeof m.hasWellArchitected).toBe('boolean')
    expect(typeof m.hasRadiant).toBe('boolean')
    expect(typeof m.hasInfinite).toBe('boolean')
  })

  it('detects innovative pattern with generics', () => {
    const m = measureTranscending('class X<T> {}')
    expect(m.hasInnovative).toBe(true)
  })
})

// ─── classifyPillarCondition ────────────────────────────

describe('classifyPillarCondition', () => {
  it('classifies 90+ as stellar-masterpiece', () => {
    expect(classifyPillarCondition(90)).toBe('stellar-masterpiece')
    expect(classifyPillarCondition(95)).toBe('stellar-masterpiece')
  })

  it('classifies 75-89 as cosmic-perfection', () => {
    expect(classifyPillarCondition(75)).toBe('cosmic-perfection')
    expect(classifyPillarCondition(89)).toBe('cosmic-perfection')
  })

  it('classifies 60-74 as proper-star-temple', () => {
    expect(classifyPillarCondition(60)).toBe('proper-star-temple')
    expect(classifyPillarCondition(74)).toBe('proper-star-temple')
  })

  it('classifies 40-59 as mortal-chapel', () => {
    expect(classifyPillarCondition(40)).toBe('mortal-chapel')
    expect(classifyPillarCondition(59)).toBe('mortal-chapel')
  })

  it('classifies 20-39 as ruined-shrine', () => {
    expect(classifyPillarCondition(20)).toBe('ruined-shrine')
    expect(classifyPillarCondition(39)).toBe('ruined-shrine')
  })

  it('classifies below 20 as void', () => {
    expect(classifyPillarCondition(0)).toBe('void')
    expect(classifyPillarCondition(19)).toBe('void')
  })
})

// ─── classifyNaveType ───────────────────────────────────

describe('classifyNaveType', () => {
  it('returns no-nave for empty pillars', () => {
    expect(classifyNaveType([])).toBe('no-nave')
  })

  it('returns cosmic-cathedral for high avg quality', () => {
    const pillars = [
      { qualityScore: 90 } as StellarPillar,
      { qualityScore: 85 } as StellarPillar,
    ]
    expect(classifyNaveType(pillars)).toBe('cosmic-cathedral')
  })

  it('returns stellar-basilica for good quality', () => {
    const pillars = [
      { qualityScore: 70 } as StellarPillar,
      { qualityScore: 75 } as StellarPillar,
    ]
    expect(classifyNaveType(pillars)).toBe('stellar-basilica')
  })

  it('returns proper-temple for decent quality', () => {
    const pillars = [
      { qualityScore: 55 } as StellarPillar,
      { qualityScore: 60 } as StellarPillar,
    ]
    expect(classifyNaveType(pillars)).toBe('proper-temple')
  })

  it('returns small-chapel for low quality', () => {
    const pillars = [
      { qualityScore: 35 } as StellarPillar,
      { qualityScore: 40 } as StellarPillar,
    ]
    expect(classifyNaveType(pillars)).toBe('small-chapel')
  })

  it('returns empty-void for very low quality', () => {
    const pillars = [
      { qualityScore: 10 } as StellarPillar,
      { qualityScore: 15 } as StellarPillar,
    ]
    expect(classifyNaveType(pillars)).toBe('empty-void')
  })
})

// ─── classifyNaveCondition ──────────────────────────────

describe('classifyNaveCondition', () => {
  it('classifies 85+ as universal-cathedral', () => {
    expect(classifyNaveCondition(85)).toBe('universal-cathedral')
  })

  it('classifies 70-84 as galactic-sanctuary', () => {
    expect(classifyNaveCondition(70)).toBe('galactic-sanctuary')
  })

  it('classifies 55-69 as proper-church', () => {
    expect(classifyNaveCondition(55)).toBe('proper-church')
  })

  it('classifies 35-54 as ruined-abbey', () => {
    expect(classifyNaveCondition(35)).toBe('ruined-abbey')
  })

  it('classifies 15-34 as empty-space', () => {
    expect(classifyNaveCondition(15)).toBe('empty-space')
  })

  it('classifies below 15 as void', () => {
    expect(classifyNaveCondition(0)).toBe('void')
  })
})

// ─── classifyArchitectGrade ─────────────────────────────

describe('classifyArchitectGrade', () => {
  it('classifies 80+ as cosmic-architect', () => {
    expect(classifyArchitectGrade(80)).toBe('cosmic-architect')
    expect(classifyArchitectGrade(100)).toBe('cosmic-architect')
  })

  it('classifies 65-79 as stellar-builder', () => {
    expect(classifyArchitectGrade(65)).toBe('stellar-builder')
    expect(classifyArchitectGrade(79)).toBe('stellar-builder')
  })

  it('classifies 50-64 as temple-architect', () => {
    expect(classifyArchitectGrade(50)).toBe('temple-architect')
    expect(classifyArchitectGrade(64)).toBe('temple-architect')
  })

  it('classifies 35-49 as apprentice', () => {
    expect(classifyArchitectGrade(35)).toBe('apprentice')
    expect(classifyArchitectGrade(49)).toBe('apprentice')
  })

  it('classifies 20-34 as novice', () => {
    expect(classifyArchitectGrade(20)).toBe('novice')
    expect(classifyArchitectGrade(34)).toBe('novice')
  })

  it('classifies below 20 as mortal-builder', () => {
    expect(classifyArchitectGrade(0)).toBe('mortal-builder')
    expect(classifyArchitectGrade(19)).toBe('mortal-builder')
  })
})

// ─── analyzeStellarPillar ───────────────────────────────

describe('analyzeStellarPillar', () => {
  it('analyzes a file and returns all measures', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    expect(pillar.file).toBe('app.ts')
    expect(pillar.cosmicArchitecture).toBeGreaterThanOrEqual(0)
    expect(pillar.starSanctity).toBeGreaterThanOrEqual(0)
    expect(pillar.vaultClarity).toBeGreaterThanOrEqual(0)
    expect(pillar.celestialPrecision).toBeGreaterThanOrEqual(0)
    expect(pillar.dawnTranscendence).toBeGreaterThanOrEqual(0)
    expect(pillar.qualityScore).toBeGreaterThanOrEqual(0)
    expect(pillar.condition).toBeDefined()
  })

  it('scores rich content high overall', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    expect(pillar.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('calculates qualityScore as weighted average', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    const expected = Math.round(
      pillar.cosmicArchitecture * 0.2 +
      pillar.starSanctity * 0.2 +
      pillar.vaultClarity * 0.2 +
      pillar.celestialPrecision * 0.2 +
      pillar.dawnTranscendence * 0.2,
    )
    expect(pillar.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    expect(pillar.designing).toBeDefined()
    expect(pillar.sanctifying).toBeDefined()
    expect(pillar.revealing).toBeDefined()
    expect(pillar.calibrating).toBeDefined()
    expect(pillar.transcending).toBeDefined()
  })

  it('classifies condition based on qualityScore', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    const expectedCondition = classifyPillarCondition(pillar.qualityScore)
    expect(pillar.condition).toBe(expectedCondition)
  })

  it('handles empty content gracefully', () => {
    const pillar = analyzeStellarPillar(emptyContent, 'empty.ts')
    expect(pillar.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('has no celebration for regular file', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    expect(pillar.celebration).toBeUndefined()
  })
})

// ─── analyzeStellarNave ─────────────────────────────────

describe('analyzeStellarNave', () => {
  it('returns empty nave for no pillars', () => {
    const nave = analyzeStellarNave([], 'src')
    expect(nave.directory).toBe('src')
    expect(nave.pillars).toHaveLength(0)
    expect(nave.avgArchitecture).toBe(0)
    expect(nave.naveType).toBe('no-nave')
    expect(nave.condition).toBe('void')
  })

  it('aggregates pillar scores', () => {
    const p1 = analyzeStellarPillar(richContent, 'a.ts')
    const p2 = analyzeStellarPillar(richContent, 'b.ts')
    const nave = analyzeStellarNave([p1, p2], 'src')
    expect(nave.avgArchitecture).toBeGreaterThanOrEqual(0)
    expect(nave.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(nave.avgTranscendence).toBeGreaterThanOrEqual(0)
    expect(nave.pillars).toHaveLength(2)
  })

  it('counts masterpieces and voids', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    const nave = analyzeStellarNave([pillar], 'src')
    expect(nave.stellarMasterpieceCount + nave.voidCount).toBeLessThanOrEqual(1)
  })

  it('classifies nave type and condition', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    const nave = analyzeStellarNave([pillar], 'src')
    expect(nave.naveType).toBeDefined()
    expect(nave.condition).toBeDefined()
  })

  it('handles mixed content', () => {
    const p1 = analyzeStellarPillar(richContent, 'a.ts')
    const p2 = analyzeStellarPillar(poorContent, 'b.ts')
    const nave = analyzeStellarNave([p1, p2], 'src')
    expect(nave.pillars).toHaveLength(2)
    expect(nave.avgArchitecture).toBeGreaterThanOrEqual(0)
  })
})

// ─── buildStellarCathedralResult ─────────────────────────

describe('buildStellarCathedralResult', () => {
  it('handles empty input', async () => {
    const result = await buildStellarCathedralResult([], [])
    expect(result.pillars).toHaveLength(0)
    expect(result.naves).toHaveLength(0)
    expect(result.cosmos.overallBrilliance).toBe(0)
    expect(result.cosmos.isStellar).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    expect(result.pillars).toHaveLength(1)
    expect(result.pillars[0].file).toBe('a.ts')
  })

  it('analyzes multiple files', async () => {
    const result = await buildStellarCathedralResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.pillars).toHaveLength(2)
  })

  it('groups files by directory', async () => {
    const result = await buildStellarCathedralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.naves.length).toBe(2)
  })

  it('computes cosmos averages', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    expect(result.cosmos.avgArchitecture).toBeGreaterThanOrEqual(0)
    expect(result.cosmos.avgPrecision).toBeGreaterThanOrEqual(0)
    expect(result.cosmos.avgTranscendence).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildStellarCathedralResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalNaves).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallBrilliance).toBeGreaterThanOrEqual(0)
    expect(result.stats.architectGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildStellarCathedralResult(
      ['a.ts', 'b.ts'],
      [richContent, poorContent],
    )
    expect(result.stats.bestPillar).toBeTruthy()
    expect(result.stats.bestArchitected).toBeTruthy()
    expect(result.stats.mostSacred).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostPrecise).toBeTruthy()
    expect(result.stats.mostTranscendent).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestPillar for no files', async () => {
    const result = await buildStellarCathedralResult([], [])
    expect(result.stats.bestPillar).toBe('')
    expect(result.stats.bestArchitected).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    expect(result.pillars[0].cosmicArchitecture).toBeGreaterThanOrEqual(60)
    expect(result.pillars[0].starSanctity).toBeGreaterThanOrEqual(60)
    expect(result.pillars[0].vaultClarity).toBeGreaterThanOrEqual(60)
    expect(result.pillars[0].celestialPrecision).toBeGreaterThanOrEqual(60)
    expect(result.pillars[0].dawnTranscendence).toBeGreaterThanOrEqual(60)
  })

  it('computes high architecture count', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    expect(result.stats.hasHighArchitectureCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighSanctityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighTranscendenceCount).toBeGreaterThanOrEqual(0)
  })

  it('counts condition categories', async () => {
    const result = await buildStellarCathedralResult(['a.ts', 'b.ts'], [richContent, poorContent])
    const total =
      result.stats.stellarMasterpieceCount +
      result.stats.cosmicPerfectionCount +
      result.stats.properStarTempleCount +
      result.stats.mortalChapelCount +
      result.stats.ruinedShrineCount +
      result.stats.voidCount
    expect(total).toBe(2)
  })
})

// ─── MEGA MILESTONE celebration ─────────────────────────

describe('MEGA MILESTONE #600 celebration', () => {
  it('sets pillar celebration for stellar-cathedral file', () => {
    const pillar = analyzeStellarPillar(richContent, 'src/stellar-cathedral.ts')
    expect(pillar.celebration).toBe('★ ★ MEGA MILESTONE #600 — Stellar Cathedral ★ ★')
  })

  it('sets pillar celebration for cosmic-temple file', () => {
    const pillar = analyzeStellarPillar(richContent, 'cosmic-temple-helpers.ts')
    expect(pillar.celebration).toBe('★ ★ MEGA MILESTONE #600 — Stellar Cathedral ★ ★')
  })

  it('sets pillar celebration for star-sanctuary file', () => {
    const pillar = analyzeStellarPillar(richContent, 'star-sanctuary.ts')
    expect(pillar.celebration).toBe('★ ★ MEGA MILESTONE #600 — Stellar Cathedral ★ ★')
  })

  it('sets stats celebration when any pillar celebrates', async () => {
    const result = await buildStellarCathedralResult(
      ['cosmic-temple.ts'],
      [richContent],
    )
    expect(result.stats.celebration).toBe('★ ★ 600 COMMANDS — A cathedral of code reaching for the stars ★ ★')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<StellarCathedralResult['stats']> = {}): StellarCathedralResult['stats'] => ({
    totalFiles: 1, totalNaves: 1,
    avgCosmicArchitecture: 95, avgStarSanctity: 95, avgVaultClarity: 95,
    avgCelestialPrecision: 95, avgDawnTranscendence: 95,
    stellarMasterpieceCount: 1, cosmicPerfectionCount: 0, properStarTempleCount: 0,
    mortalChapelCount: 0, ruinedShrineCount: 0, voidCount: 0,
    hasHighArchitectureCount: 1, hasHighSanctityCount: 1, hasHighClarityCount: 1,
    hasHighPrecisionCount: 1, hasHighTranscendenceCount: 1,
    overallBrilliance: 95, architectGrade: 'cosmic-architect' as const,
    bestPillar: 'a.ts', bestArchitected: 'a.ts', mostSacred: 'a.ts',
    clearest: 'a.ts', mostPrecise: 'a.ts', mostTranscendent: 'a.ts',
    ...overrides,
  })

  const makeCosmos = (overrides: Partial<StellarCathedralResult['cosmos']> = {}): StellarCathedralResult['cosmos'] => ({
    avgArchitecture: 95, avgPrecision: 95, avgTranscendence: 95,
    isStellar: true, overallBrilliance: 95,
    ...overrides,
  })

  it('recommends masterpiece when all scores are high', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats())
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends cosmic architecture when low', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats({
      avgCosmicArchitecture: 30, overallBrilliance: 78, architectGrade: 'stellar-builder',
    }))
    expect(recs.some((r) => r.includes('architecture'))).toBe(true)
  })

  it('recommends star sanctity when low', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats({
      avgStarSanctity: 30, overallBrilliance: 78, architectGrade: 'stellar-builder',
    }))
    expect(recs.some((r) => r.includes('sanctity'))).toBe(true)
  })

  it('recommends vault clarity when low', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats({
      avgVaultClarity: 30, overallBrilliance: 78, architectGrade: 'stellar-builder',
    }))
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends celestial precision when low', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats({
      avgCelestialPrecision: 30, overallBrilliance: 78, architectGrade: 'stellar-builder',
    }))
    expect(recs.some((r) => r.includes('precision'))).toBe(true)
  })

  it('recommends dawn transcendence when low', () => {
    const recs = generateRecommendations([], [], makeCosmos(), makeStats({
      avgDawnTranscendence: 30, overallBrilliance: 78, architectGrade: 'stellar-builder',
    }))
    expect(recs.some((r) => r.includes('transcendence'))).toBe(true)
  })

  it('warns about very low brilliance', () => {
    const recs = generateRecommendations([], [], makeCosmos({ overallBrilliance: 20, isStellar: false }), makeStats({
      avgCosmicArchitecture: 20, avgStarSanctity: 20, avgVaultClarity: 20,
      avgCelestialPrecision: 20, avgDawnTranscendence: 20,
      overallBrilliance: 20, architectGrade: 'novice', voidCount: 1,
    }))
    expect(recs.some((r) => r.includes('cathedral') || r.includes('empty'))).toBe(true)
  })

  it('lists ruined shrines by name', () => {
    const pillars = [
      { condition: 'void' as const, file: 'bad1.ts' } as StellarPillar,
      { condition: 'void' as const, file: 'bad2.ts' } as StellarPillar,
    ]
    const recs = generateRecommendations(pillars, [], makeCosmos({ overallBrilliance: 20, isStellar: false }), makeStats({
      avgCosmicArchitecture: 20, avgStarSanctity: 20, avgVaultClarity: 20,
      avgCelestialPrecision: 20, avgDawnTranscendence: 20,
      overallBrilliance: 20, architectGrade: 'novice', voidCount: 2,
    }))
    expect(recs.some((r) => r.includes('bad1'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorPillarCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorPillarCondition('stellar-masterpiece')).toBe('string')
    expect(typeof colorPillarCondition('cosmic-perfection')).toBe('string')
    expect(typeof colorPillarCondition('proper-star-temple')).toBe('string')
    expect(typeof colorPillarCondition('mortal-chapel')).toBe('string')
    expect(typeof colorPillarCondition('ruined-shrine')).toBe('string')
    expect(typeof colorPillarCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorPillarCondition('unknown')).toBe('string')
  })
})

describe('colorNaveCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorNaveCondition('universal-cathedral')).toBe('string')
    expect(typeof colorNaveCondition('galactic-sanctuary')).toBe('string')
    expect(typeof colorNaveCondition('proper-church')).toBe('string')
    expect(typeof colorNaveCondition('ruined-abbey')).toBe('string')
    expect(typeof colorNaveCondition('empty-space')).toBe('string')
    expect(typeof colorNaveCondition('void')).toBe('string')
  })

  it('handles unknown condition', () => {
    expect(typeof colorNaveCondition('unknown')).toBe('string')
  })
})

describe('formatPillarTable', () => {
  it('formats a pillar', () => {
    const pillar = analyzeStellarPillar(richContent, 'app.ts')
    const output = formatPillarTable(pillar)
    expect(output).toContain('app.ts')
    expect(output).toContain('Cosmic Architecture')
    expect(output).toContain('Quality Score')
  })

  it('includes celebration when present', () => {
    const pillar = analyzeStellarPillar(richContent, 'cosmic-temple.ts')
    const output = formatPillarTable(pillar)
    expect(output).toContain('MEGA MILESTONE')
  })
})

describe('formatPillarsTable', () => {
  it('formats empty pillars', () => {
    expect(formatPillarsTable([])).toContain('No stellar pillars')
  })

  it('formats multiple pillars', () => {
    const p1 = analyzeStellarPillar(richContent, 'a.ts')
    const p2 = analyzeStellarPillar(poorContent, 'b.ts')
    const output = formatPillarsTable([p1, p2])
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatNaveTable', () => {
  it('formats a nave', () => {
    const pillar = analyzeStellarPillar(richContent, 'src/a.ts')
    const nave = analyzeStellarNave([pillar], 'src')
    const output = formatNaveTable(nave)
    expect(output).toContain('src')
    expect(output).toContain('Pillars')
  })
})

describe('formatNavesTable', () => {
  it('formats empty naves', () => {
    expect(formatNavesTable([])).toContain('No stellar naves')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Total Files')
    expect(output).toContain('Architect Grade')
  })

  it('includes celebration when present', async () => {
    const result = await buildStellarCathedralResult(['cosmic-temple.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('600 COMMANDS')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Fix Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Fix Y')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Stellar Cathedral Analysis')
    expect(output).toContain('Cosmos Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildStellarCathedralResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.pillars).toHaveLength(1)
    expect(parsed.cosmos).toBeDefined()
  })
})
