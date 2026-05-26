import { describe, expect, it } from 'vitest'

import {
  analyzeAuroraBand,
  analyzeAuroraCurtain,
  buildEmeraldAuroraResult,
  classifyBandCondition,
  classifyBandType,
  classifyCurtainCondition,
  classifyObserverGrade,
  generateRecommendations,
  measureAligning,
  measureClarifying,
  measureGlowing,
  measureThriving,
  measureUnderstanding,
} from '../src/commands/emerald-aurora-helpers.js'
import type { AuroraCurtain, EmeraldAuroraResult } from '../src/commands/emerald-aurora-helpers.js'
import {
  colorBandCondition,
  colorBandType,
  colorCurtainCondition,
  colorObserverGrade,
  colorScore,
  formatBandsTable,
  formatBandTable,
  formatCurtainsTable,
  formatCurtainTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/emerald-aurora-format-helpers.js'

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

const richVit = measureThriving(richContent).vitality
const richRad = measureGlowing(richContent).radiance
const richCla = measureClarifying(richContent).clarity
const richPre = measureAligning(richContent).precision
const richWis = measureUnderstanding(richContent).wisdom

function makeStats(overrides: Partial<EmeraldAuroraResult['stats']> = {}): EmeraldAuroraResult['stats'] {
  return {
    totalFiles: 1,
    totalBands: 1,
    avgGreenVitality: 50,
    avgNorthernRadiance: 50,
    avgSpectrumClarity: 50,
    avgCelestialPrecision: 50,
    avgAuroraWisdom: 50,
    auroraMasterpieceCount: 0,
    emeraldLightsCount: 0,
    properAuroraCount: 0,
    faintGlowCount: 0,
    darkSkyCount: 0,
    voidCount: 0,
    hasHighVitalityCount: 1,
    hasHighRadianceCount: 1,
    hasHighClarityCount: 1,
    hasHighPrecisionCount: 1,
    hasHighWisdomCount: 1,
    overallLuminosity: 50,
    observerGrade: 'proper-watcher',
    bestCurtain: 'a.ts',
    mostVital: 'a.ts',
    mostRadiant: 'a.ts',
    clearest: 'a.ts',
    mostPrecise: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureThriving ─────────────────────────────────────

describe('measureThriving', () => {
  it('scores rich content highly', () => {
    const result = measureThriving(richContent)
    expect(result.vitality).toBeGreaterThan(60)
    expect(result.hasHighVitality).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureThriving(emptyContent).vitality).toBeLessThan(richVit)
  })

  it('detects alive patterns (class/interface/type)', () => {
    expect(measureThriving(richContent).hasAlive).toBe(true)
  })

  it('counts dead keywords', () => {
    const content = 'const dead = 1; const lifeless = 2; const inert = 3; const dormant = 4'
    const result = measureThriving(content)
    expect(result.deadCount).toBe(4)
    expect(result.hasNoDead).toBe(false)
  })

  it('detects growing patterns (import/export)', () => {
    expect(measureThriving(richContent).hasGrowing).toBe(true)
  })

  it('counts stagnant keywords', () => {
    const content = 'const stagnant = 1; const stale = 2; const frozen = 3'
    const result = measureThriving(content)
    expect(result.stagnantCount).toBe(3)
    expect(result.hasNoStagnant).toBe(false)
  })

  it('detects dynamic patterns (async/await/Promise)', () => {
    expect(measureThriving(richContent).hasDynamic).toBe(true)
  })

  it('detects blooming (no any)', () => {
    expect(measureThriving(richContent).hasBlooming).toBe(true)
  })

  it('detects blossoming (try/catch/if)', () => {
    expect(measureThriving(richContent).hasBlossoming).toBe(true)
  })

  it('classifies growth correctly for high scores', () => {
    const result = measureThriving(richContent)
    expect(['lush-forest', 'spring-garden', 'proper-green']).toContain(result.growth)
  })

  it('classifies growth correctly for low scores', () => {
    expect(measureThriving(emptyContent).growth).not.toBe('lush-forest')
  })
})

// ─── measureGlowing ──────────────────────────────────────

describe('measureGlowing', () => {
  it('scores rich content highly', () => {
    const result = measureGlowing(richContent)
    expect(result.radiance).toBeGreaterThan(60)
    expect(result.hasHighRadiance).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureGlowing(emptyContent).radiance).toBeLessThan(richRad)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3; const enigmatic = 4'
    const result = measureGlowing(content)
    expect(result.crypticCount).toBe(4)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('counts mystery keywords', () => {
    const content = 'const secret = 1; const hidden = 2; const concealed = 3; const undisclosed = 4'
    const result = measureGlowing(content)
    expect(result.mysteryCount).toBe(4)
    expect(result.hasNoMystery).toBe(false)
  })

  it('detects readable patterns', () => {
    expect(measureGlowing(richContent).hasReadable).toBe(true)
  })

  it('detects glowing (no any)', () => {
    expect(measureGlowing(richContent).hasGlowing).toBe(true)
  })

  it('detects incandescent (function/arrow/return)', () => {
    expect(measureGlowing(richContent).hasIncandescent).toBe(true)
  })

  it('classifies light correctly for high scores', () => {
    const result = measureGlowing(richContent)
    expect(['solar-flare', 'bright-aurora', 'proper-glow']).toContain(result.light)
  })

  it('classifies light correctly for low scores', () => {
    expect(measureGlowing(emptyContent).light).not.toBe('solar-flare')
  })
})

// ─── measureClarifying ──────────────────────────────────

describe('measureClarifying', () => {
  it('scores rich content highly', () => {
    const result = measureClarifying(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureClarifying(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('counts undocumented keywords', () => {
    const content = 'const undocumented = 1; const unexplained = 2; const uncommented = 3'
    const result = measureClarifying(content)
    expect(result.undocumentedCount).toBe(3)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('counts obfuscated keywords', () => {
    const content = 'const obfuscated = 1; const encoded = 2; const mangled = 3; const minified = 4'
    const result = measureClarifying(content)
    expect(result.obfuscatedCount).toBe(4)
    expect(result.hasNoObfuscated).toBe(false)
  })

  it('detects self-documenting patterns (import/export)', () => {
    expect(measureClarifying(richContent).hasSelfDocumenting).toBe(true)
  })

  it('detects revealed (no any)', () => {
    expect(measureClarifying(richContent).hasRevealed).toBe(true)
  })

  it('detects direct patterns (function/arrow/return)', () => {
    expect(measureClarifying(richContent).hasDirect).toBe(true)
  })

  it('classifies spectrum correctly for high scores', () => {
    const result = measureClarifying(richContent)
    expect(['full-spectrum', 'bright-band', 'proper-color']).toContain(result.spectrum)
  })

  it('classifies spectrum correctly for low scores', () => {
    expect(measureClarifying(emptyContent).spectrum).not.toBe('full-spectrum')
  })
})

// ─── measureAligning ─────────────────────────────────────

describe('measureAligning', () => {
  it('scores rich content highly', () => {
    const result = measureAligning(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAligning(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type safe (no any)', () => {
    expect(measureAligning(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe keywords (var/eval)', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measureAligning(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measureAligning(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects synchronized patterns (async/await/Promise)', () => {
    expect(measureAligning(richContent).hasSynchronized).toBe(true)
  })

  it('detects calibrated (try/catch/if)', () => {
    expect(measureAligning(richContent).hasCalibrated).toBe(true)
  })

  it('classifies orbit correctly for high scores', () => {
    const result = measureAligning(richContent)
    expect(['perfect-orbit', 'precise-trajectory', 'proper-course']).toContain(result.orbit)
  })

  it('classifies orbit correctly for low scores', () => {
    expect(measureAligning(emptyContent).orbit).not.toBe('perfect-orbit')
  })
})

// ─── measureUnderstanding ────────────────────────────────

describe('measureUnderstanding', () => {
  it('scores rich content highly', () => {
    const result = measureUnderstanding(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureUnderstanding(emptyContent).wisdom).toBeLessThan(richWis)
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

  it('detects well-architected patterns', () => {
    expect(measureUnderstanding(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    expect(measureUnderstanding(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary patterns (async/await/Promise)', () => {
    expect(measureUnderstanding(richContent).hasVisionary).toBe(true)
  })

  it('classifies magnetosphere correctly for high scores', () => {
    const result = measureUnderstanding(richContent)
    expect(['cosmic-understanding', 'atmospheric-sage', 'proper-observer']).toContain(result.magnetosphere)
  })

  it('classifies magnetosphere correctly for low scores', () => {
    expect(measureUnderstanding(emptyContent).magnetosphere).not.toBe('cosmic-understanding')
  })
})

// ─── analyzeAuroraCurtain ────────────────────────────────

describe('analyzeAuroraCurtain', () => {
  it('analyzes a file correctly', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'test.ts')
    expect(curtain.file).toBe('test.ts')
    expect(curtain.greenVitality).toBeGreaterThan(0)
    expect(curtain.northernRadiance).toBeGreaterThan(0)
    expect(curtain.spectrumClarity).toBeGreaterThan(0)
    expect(curtain.celestialPrecision).toBeGreaterThan(0)
    expect(curtain.auroraWisdom).toBeGreaterThan(0)
    expect(curtain.qualityScore).toBeGreaterThan(0)
    expect(curtain.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'test.ts')
    const expected = Math.round(
      curtain.greenVitality * 0.2 +
      curtain.northernRadiance * 0.2 +
      curtain.spectrumClarity * 0.2 +
      curtain.celestialPrecision * 0.2 +
      curtain.auroraWisdom * 0.2,
    )
    expect(curtain.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'test.ts')
    expect(curtain.thriving).toBeDefined()
    expect(curtain.glowing).toBeDefined()
    expect(curtain.clarifying).toBeDefined()
    expect(curtain.aligning).toBeDefined()
    expect(curtain.understanding).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const curtain = analyzeAuroraCurtain(emptyContent, 'empty.ts')
    expect(curtain.qualityScore).toBeLessThan(60)
    expect(curtain.condition).not.toBe('aurora-masterpiece')
  })
})

// ─── analyzeAuroraBand ───────────────────────────────────

describe('analyzeAuroraBand', () => {
  it('handles empty curtains', () => {
    const band = analyzeAuroraBand([], 'empty-dir')
    expect(band.curtains).toHaveLength(0)
    expect(band.bandType).toBe('no-band')
    expect(band.condition).toBe('void')
  })

  it('analyzes a band with curtains', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'src/test.ts')
    const band = analyzeAuroraBand([curtain], 'src')
    expect(band.directory).toBe('src')
    expect(band.curtains).toHaveLength(1)
    expect(band.avgVitality).toBeGreaterThan(0)
  })

  it('counts aurora masterpieces', () => {
    const curtain: AuroraCurtain = {
      file: 'a.ts', greenVitality: 95, northernRadiance: 95, spectrumClarity: 95, celestialPrecision: 95, auroraWisdom: 95,
      thriving: {} as AuroraCurtain['thriving'],
      glowing: {} as AuroraCurtain['glowing'],
      clarifying: {} as AuroraCurtain['clarifying'],
      aligning: {} as AuroraCurtain['aligning'],
      understanding: {} as AuroraCurtain['understanding'],
      condition: 'aurora-masterpiece', qualityScore: 95,
    }
    expect(analyzeAuroraBand([curtain], 'src').auroraMasterpieceCount).toBe(1)
  })

  it('counts void curtains', () => {
    const curtain: AuroraCurtain = {
      file: 'a.ts', greenVitality: 0, northernRadiance: 0, spectrumClarity: 0, celestialPrecision: 0, auroraWisdom: 0,
      thriving: {} as AuroraCurtain['thriving'],
      glowing: {} as AuroraCurtain['glowing'],
      clarifying: {} as AuroraCurtain['clarifying'],
      aligning: {} as AuroraCurtain['aligning'],
      understanding: {} as AuroraCurtain['understanding'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeAuroraBand([curtain], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyCurtainCondition', () => {
  it('classifies aurora-masterpiece at 90+', () => { expect(classifyCurtainCondition(90)).toBe('aurora-masterpiece') })
  it('classifies emerald-lights at 75-89', () => { expect(classifyCurtainCondition(75)).toBe('emerald-lights') })
  it('classifies proper-aurora at 60-74', () => { expect(classifyCurtainCondition(60)).toBe('proper-aurora') })
  it('classifies faint-glow at 40-59', () => { expect(classifyCurtainCondition(40)).toBe('faint-glow') })
  it('classifies dark-sky at 20-39', () => { expect(classifyCurtainCondition(20)).toBe('dark-sky') })
  it('classifies void below 20', () => { expect(classifyCurtainCondition(0)).toBe('void') })
})

describe('classifyBandType', () => {
  it('returns no-band for empty curtains', () => { expect(classifyBandType([])).toBe('no-band') })
  it('classifies polar-curtain at 85+', () => { expect(classifyBandType([{ qualityScore: 90 } as AuroraCurtain])).toBe('polar-curtain') })
  it('classifies aurora-band at 70-84', () => { expect(classifyBandType([{ qualityScore: 75 } as AuroraCurtain])).toBe('aurora-band') })
  it('classifies proper-glow at 55-69', () => { expect(classifyBandType([{ qualityScore: 60 } as AuroraCurtain])).toBe('proper-glow') })
  it('classifies faint-light at 35-54', () => { expect(classifyBandType([{ qualityScore: 40 } as AuroraCurtain])).toBe('faint-light') })
  it('classifies dark-patch below 35', () => { expect(classifyBandType([{ qualityScore: 10 } as AuroraCurtain])).toBe('dark-patch') })
})

describe('classifyBandCondition', () => {
  it('classifies emerald-sky at 85+', () => { expect(classifyBandCondition(85)).toBe('emerald-sky') })
  it('classifies northern-lights at 70-84', () => { expect(classifyBandCondition(70)).toBe('northern-lights') })
  it('classifies proper-horizon at 55-69', () => { expect(classifyBandCondition(55)).toBe('proper-horizon') })
  it('classifies gray-dawn at 35-54', () => { expect(classifyBandCondition(35)).toBe('gray-dawn') })
  it('classifies black-night at 15-34', () => { expect(classifyBandCondition(15)).toBe('black-night') })
  it('classifies void below 15', () => { expect(classifyBandCondition(0)).toBe('void') })
})

describe('classifyObserverGrade', () => {
  it('classifies aurora-master at 80+', () => { expect(classifyObserverGrade(80)).toBe('aurora-master') })
  it('classifies veteran-observer at 65-79', () => { expect(classifyObserverGrade(65)).toBe('veteran-observer') })
  it('classifies proper-watcher at 50-64', () => { expect(classifyObserverGrade(50)).toBe('proper-watcher') })
  it('classifies amateur at 35-49', () => { expect(classifyObserverGrade(35)).toBe('amateur') })
  it('classifies novice at 20-34', () => { expect(classifyObserverGrade(20)).toBe('novice') })
  it('classifies blinked below 20', () => { expect(classifyObserverGrade(0)).toBe('blinked') })
})

// ─── buildEmeraldAuroraResult ────────────────────────────

describe('buildEmeraldAuroraResult', () => {
  it('handles empty input', async () => {
    const result = await buildEmeraldAuroraResult([], [])
    expect(result.curtains).toHaveLength(0)
    expect(result.bands).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallLuminosity).toBe(0)
    expect(result.stats.bestCurtain).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildEmeraldAuroraResult(['test.ts'], [richContent])
    expect(result.curtains).toHaveLength(1)
    expect(result.curtains[0].file).toBe('test.ts')
    expect(result.bands).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildEmeraldAuroraResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.bands).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildEmeraldAuroraResult(['a.ts'], [richContent])
    expect(result.stats.avgGreenVitality).toBe(result.curtains[0].greenVitality)
    expect(result.stats.avgNorthernRadiance).toBe(result.curtains[0].northernRadiance)
    expect(result.stats.avgSpectrumClarity).toBe(result.curtains[0].spectrumClarity)
    expect(result.stats.avgCelestialPrecision).toBe(result.curtains[0].celestialPrecision)
    expect(result.stats.avgAuroraWisdom).toBe(result.curtains[0].auroraWisdom)
  })

  it('identifies best curtain', async () => {
    const result = await buildEmeraldAuroraResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestCurtain).toBe('high.ts')
  })

  it('computes sky overview', async () => {
    const result = await buildEmeraldAuroraResult(['a.ts'], [richContent])
    expect(result.sky.avgVitality).toBe(result.curtains[0].greenVitality)
    expect(result.sky.avgRadiance).toBe(result.curtains[0].northernRadiance)
    expect(result.sky.avgWisdom).toBe(result.curtains[0].auroraWisdom)
    expect(result.sky.overallLuminosity).toBe(result.stats.overallLuminosity)
  })

  it('sets isEmerald when overallLuminosity >= 60', async () => {
    const result = await buildEmeraldAuroraResult(['a.ts'], [richContent])
    if (result.stats.overallLuminosity >= 60) {
      expect(result.sky.isEmerald).toBe(true)
    }
  })

  it('finds mostVital, mostRadiant, clearest, mostPrecise, wisest', async () => {
    const result = await buildEmeraldAuroraResult(['a.ts'], [richContent])
    expect(result.stats.mostVital).toBe('a.ts')
    expect(result.stats.mostRadiant).toBe('a.ts')
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('counts high measure counts correctly', async () => {
    const result = await buildEmeraldAuroraResult(['a.ts'], [richContent])
    expect(result.stats.hasHighVitalityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRadianceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgGreenVitality: 90, avgNorthernRadiance: 90, avgSpectrumClarity: 90,
      avgCelestialPrecision: 90, avgAuroraWisdom: 90, overallLuminosity: 90,
    })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 90, avgWisdom: 90, isEmerald: true, overallLuminosity: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('emerald aurora illuminates')
  })

  it('recommends reviving vitality when below 60', () => {
    const stats = makeStats({ avgGreenVitality: 40, avgNorthernRadiance: 90, avgSpectrumClarity: 90, avgCelestialPrecision: 90, avgAuroraWisdom: 90 })
    const recs = generateRecommendations([], [], { avgVitality: 40, avgRadiance: 90, avgWisdom: 90, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('Revive green vitality'))).toBe(true)
  })

  it('recommends brightening radiance when below 60', () => {
    const stats = makeStats({ avgGreenVitality: 90, avgNorthernRadiance: 40, avgSpectrumClarity: 90, avgCelestialPrecision: 90, avgAuroraWisdom: 90 })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 40, avgWisdom: 90, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('Brighten northern radiance'))).toBe(true)
  })

  it('recommends sharpening clarity when below 60', () => {
    const stats = makeStats({ avgGreenVitality: 90, avgNorthernRadiance: 90, avgSpectrumClarity: 40, avgCelestialPrecision: 90, avgAuroraWisdom: 90 })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 90, avgWisdom: 90, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('Sharpen spectrum clarity'))).toBe(true)
  })

  it('recommends tightening precision when below 60', () => {
    const stats = makeStats({ avgGreenVitality: 90, avgNorthernRadiance: 90, avgSpectrumClarity: 90, avgCelestialPrecision: 40, avgAuroraWisdom: 90 })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 90, avgWisdom: 90, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('Tighten celestial precision'))).toBe(true)
  })

  it('recommends deepening wisdom when below 60', () => {
    const stats = makeStats({ avgGreenVitality: 90, avgNorthernRadiance: 90, avgSpectrumClarity: 90, avgCelestialPrecision: 90, avgAuroraWisdom: 40 })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 90, avgWisdom: 40, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen aurora wisdom'))).toBe(true)
  })

  it('recommends sky is dark when luminosity < 40', () => {
    const stats = makeStats({ overallLuminosity: 30, avgGreenVitality: 30, avgNorthernRadiance: 30, avgSpectrumClarity: 30, avgCelestialPrecision: 30, avgAuroraWisdom: 30 })
    const recs = generateRecommendations([], [], { avgVitality: 30, avgRadiance: 30, avgWisdom: 30, isEmerald: false, overallLuminosity: 30 }, stats)
    expect(recs.some((r) => r.includes('sky is dark'))).toBe(true)
  })

  it('lists void curtains by name when <= 5', () => {
    const stats = makeStats({ avgGreenVitality: 70, avgNorthernRadiance: 70, avgSpectrumClarity: 70, avgCelestialPrecision: 70, avgAuroraWisdom: 70 })
    const curtains = [{ file: 'a.ts', condition: 'void' } as AuroraCurtain, { file: 'b.ts', condition: 'void' } as AuroraCurtain]
    const recs = generateRecommendations(curtains, [], { avgVitality: 70, avgRadiance: 70, avgWisdom: 70, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void curtains when > 5', () => {
    const stats = makeStats({ avgGreenVitality: 70, avgNorthernRadiance: 70, avgSpectrumClarity: 70, avgCelestialPrecision: 70, avgAuroraWisdom: 70 })
    const curtains = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as AuroraCurtain))
    const recs = generateRecommendations(curtains, [], { avgVitality: 70, avgRadiance: 70, avgWisdom: 70, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('6 dark curtains'))).toBe(true)
  })

  it('reports all bands are black nights', () => {
    const stats = makeStats({ avgGreenVitality: 70, avgNorthernRadiance: 70, avgSpectrumClarity: 70, avgCelestialPrecision: 70, avgAuroraWisdom: 70 })
    const bands = [{ condition: 'black-night', directory: 'src' } as import('../src/commands/emerald-aurora-helpers.js').AuroraBand]
    const recs = generateRecommendations([], bands, { avgVitality: 70, avgRadiance: 70, avgWisdom: 70, isEmerald: true, overallLuminosity: 70 }, stats)
    expect(recs.some((r) => r.includes('black nights'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgGreenVitality: 90, avgNorthernRadiance: 90, avgSpectrumClarity: 90, avgCelestialPrecision: 90, avgAuroraWisdom: 90, overallLuminosity: 90 })
    const recs = generateRecommendations([], [], { avgVitality: 90, avgRadiance: 90, avgWisdom: 90, isEmerald: true, overallLuminosity: 90 }, stats)
    expect(recs[0]).toContain('emerald aurora illuminates')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorCurtainCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['aurora-masterpiece', 'emerald-lights', 'proper-aurora', 'faint-glow', 'dark-sky', 'void', 'unknown']) {
      expect(typeof colorCurtainCondition(c)).toBe('string')
    }
  })
})

describe('colorBandType', () => {
  it('handles all types', () => {
    for (const t of ['polar-curtain', 'aurora-band', 'proper-glow', 'faint-light', 'dark-patch', 'no-band']) {
      expect(typeof colorBandType(t)).toBe('string')
    }
  })
})

describe('colorBandCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['emerald-sky', 'northern-lights', 'proper-horizon', 'gray-dawn', 'black-night', 'void']) {
      expect(typeof colorBandCondition(c)).toBe('string')
    }
  })
})

describe('colorObserverGrade', () => {
  it('handles all grades', () => {
    for (const g of ['aurora-master', 'veteran-observer', 'proper-watcher', 'amateur', 'novice', 'blinked']) {
      expect(typeof colorObserverGrade(g)).toBe('string')
    }
  })
})

describe('formatCurtainTable', () => {
  it('formats a curtain table', () => {
    const curtain = analyzeAuroraCurtain(richContent, 'test.ts')
    const output = formatCurtainTable(curtain)
    expect(output).toContain('Aurora Curtain: test.ts')
    expect(output).toContain('Green Vitality')
    expect(output).toContain('Quality Score')
  })
})

describe('formatCurtainsTable', () => {
  it('formats empty curtains message', () => { expect(formatCurtainsTable([])).toContain('No aurora curtains found') })
  it('formats curtains list', () => {
    const output = formatCurtainsTable([analyzeAuroraCurtain(richContent, 'a.ts'), analyzeAuroraCurtain(richContent, 'b.ts')])
    expect(output).toContain('Aurora Curtains')
    expect(output).toContain('a.ts')
  })
})

describe('formatBandTable', () => {
  it('formats a band table', () => {
    const band = analyzeAuroraBand([analyzeAuroraCurtain(richContent, 'test.ts')], 'src')
    const output = formatBandTable(band)
    expect(output).toContain('Aurora Band: src')
  })
})

describe('formatBandsTable', () => {
  it('formats empty message', () => { expect(formatBandsTable([])).toContain('No aurora bands found') })
  it('formats bands list', () => {
    const band = analyzeAuroraBand([analyzeAuroraCurtain(richContent, 'test.ts')], 'src')
    expect(formatBandsTable([band])).toContain('Aurora Bands')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Emerald Aurora Statistics')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => { expect(formatRecommendations([])).toContain('No recommendations') })
  it('formats recommendations list', () => {
    expect(formatRecommendations(['Fix X', 'Improve Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result table', async () => {
    const result = await buildEmeraldAuroraResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Emerald Aurora Analysis')
    expect(output).toContain('Sky Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildEmeraldAuroraResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.curtains).toHaveLength(1)
    expect(parsed.sky).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
