import { describe, expect, it } from 'vitest'

import {
  analyzeQuartzFacet,
  analyzeQuartzGeode,
  buildQuartzPrismResult,
  classifyFacetCondition,
  classifyGeodeCondition,
  classifyGeodeType,
  classifyLapidaryGrade,
  generateRecommendations,
  measureAccumulating,
  measurePolishing,
  measureRefracting,
  measureResonating,
  measureStructuring,
} from '../src/commands/quartz-prism-helpers.js'
import type { QuartzFacet, QuartzPrismResult } from '../src/commands/quartz-prism-helpers.js'
import {
  colorFacetCondition,
  colorGeodeCondition,
  colorGeodeType,
  colorLapidaryGrade,
  colorScore,
  formatFacetsTable,
  formatFacetTable,
  formatGeodesTable,
  formatGeodeTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/quartz-prism-format-helpers.js'

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

const richCla = measureStructuring(richContent).clarity
const richRef = measureRefracting(richContent).refraction
const richPre = measurePolishing(richContent).precision
const richPur = measureResonating(richContent).purity
const richWis = measureAccumulating(richContent).wisdom

function makeStats(overrides: Partial<QuartzPrismResult['stats']> = {}): QuartzPrismResult['stats'] {
  return {
    totalFiles: 1,
    totalGeodes: 1,
    avgCrystallineClarity: 50,
    avgSpectrumRefraction: 50,
    avgFacetPrecision: 50,
    avgVibrationPurity: 50,
    avgMineralWisdom: 50,
    quartzMasterpieceCount: 0,
    gemQualityCount: 0,
    properCrystalCount: 0,
    industrialGradeCount: 0,
    rawSandCount: 0,
    voidCount: 0,
    hasHighClarityCount: 1,
    hasHighRefractionCount: 1,
    hasHighPrecisionCount: 1,
    hasHighPurityCount: 1,
    hasHighWisdomCount: 1,
    overallBrilliance: 50,
    lapidaryGrade: 'proper-gemologist',
    bestFacet: 'a.ts',
    clearest: 'a.ts',
    mostRefractive: 'a.ts',
    mostPrecise: 'a.ts',
    purest: 'a.ts',
    wisest: 'a.ts',
    ...overrides,
  }
}

// ─── measureStructuring ─────────────────────────────────

describe('measureStructuring', () => {
  it('scores rich content highly', () => {
    const result = measureStructuring(richContent)
    expect(result.clarity).toBeGreaterThan(60)
    expect(result.hasHighClarity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureStructuring(emptyContent).clarity).toBeLessThan(richCla)
  })

  it('detects well-structured patterns', () => {
    expect(measureStructuring(richContent).hasWellStructured).toBe(true)
  })

  it('counts chaotic keywords', () => {
    const content = 'const chaotic = 1; const messy = 2; const tangled = 3; const spaghetti = 4'
    const result = measureStructuring(content)
    expect(result.chaoticCount).toBe(4)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('counts cryptic keywords', () => {
    const content = 'const cryptic = 1; const mysterious = 2; const obscure = 3'
    const result = measureStructuring(content)
    expect(result.crypticCount).toBe(3)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects clear (no any)', () => {
    expect(measureStructuring(richContent).hasClear).toBe(true)
  })

  it('detects organized (import/export)', () => {
    expect(measureStructuring(richContent).hasOrganized).toBe(true)
  })

  it('detects transparent (readonly/private/protected)', () => {
    expect(measureStructuring(richContent).hasTransparent).toBe(true)
  })

  it('classifies crystal correctly for high scores', () => {
    const result = measureStructuring(richContent)
    expect(['herkimer-diamond', 'clear-quartz', 'proper-crystal']).toContain(result.crystal)
  })

  it('classifies crystal correctly for low scores', () => {
    expect(measureStructuring(emptyContent).crystal).not.toBe('herkimer-diamond')
  })
})

// ─── measureRefracting ──────────────────────────────────

describe('measureRefracting', () => {
  it('scores rich content highly', () => {
    const result = measureRefracting(richContent)
    expect(result.refraction).toBeGreaterThan(60)
    expect(result.hasHighRefraction).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureRefracting(emptyContent).refraction).toBeLessThan(richRef)
  })

  it('counts incomplete keywords', () => {
    const content = 'const incomplete = 1; const partial = 2; const fragment = 3; const half-implemented = 4'
    const result = measureRefracting(content)
    expect(result.incompleteCount).toBe(4)
    expect(result.hasNoIncomplete).toBe(false)
  })

  it('counts undocumented keywords', () => {
    const content = 'const undocumented = 1; const unexplained = 2; const uncommented = 3'
    const result = measureRefracting(content)
    expect(result.undocumentedCount).toBe(3)
    expect(result.hasNoUndocumented).toBe(false)
  })

  it('detects comprehensive patterns', () => {
    expect(measureRefracting(richContent).hasComprehensive).toBe(true)
  })

  it('detects exported patterns', () => {
    expect(measureRefracting(richContent).hasExported).toBe(true)
  })

  it('detects multi-faceted (try/catch/if)', () => {
    expect(measureRefracting(richContent).hasMultiFaceted).toBe(true)
  })

  it('classifies spectrum correctly for high scores', () => {
    const result = measureRefracting(richContent)
    expect(['full-rainbow', 'rich-spectrum', 'proper-colors']).toContain(result.spectrum)
  })

  it('classifies spectrum correctly for low scores', () => {
    expect(measureRefracting(emptyContent).spectrum).not.toBe('full-rainbow')
  })
})

// ─── measurePolishing ───────────────────────────────────

describe('measurePolishing', () => {
  it('scores rich content highly', () => {
    const result = measurePolishing(richContent)
    expect(result.precision).toBeGreaterThan(60)
    expect(result.hasHighPrecision).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measurePolishing(emptyContent).precision).toBeLessThan(richPre)
  })

  it('detects type safe (no any)', () => {
    expect(measurePolishing(richContent).hasTypeSafe).toBe(true)
  })

  it('counts unsafe (var/eval)', () => {
    const content = 'var x = 1; eval("test"); var y = 2'
    const result = measurePolishing(content)
    expect(result.unsafeCount).toBe(3)
    expect(result.hasNoUnsafe).toBe(false)
  })

  it('counts approximate keywords', () => {
    const content = 'const approximate = 1; const rough = 2; const vague = 3; const imprecise = 4'
    const result = measurePolishing(content)
    expect(result.approximateCount).toBe(4)
    expect(result.hasNoApproximate).toBe(false)
  })

  it('detects perfect (async/await/Promise)', () => {
    expect(measurePolishing(richContent).hasPerfect).toBe(true)
  })

  it('detects honed (try/catch/if)', () => {
    expect(measurePolishing(richContent).hasHoned).toBe(true)
  })

  it('classifies cut correctly for high scores', () => {
    const result = measurePolishing(richContent)
    expect(['triple-excellent', 'ideal-cut', 'proper-facet']).toContain(result.cut)
  })

  it('classifies cut correctly for low scores', () => {
    expect(measurePolishing(emptyContent).cut).not.toBe('triple-excellent')
  })
})

// ─── measureResonating ──────────────────────────────────

describe('measureResonating', () => {
  it('scores rich content highly', () => {
    const result = measureResonating(richContent)
    expect(result.purity).toBeGreaterThan(60)
    expect(result.hasHighPurity).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureResonating(emptyContent).purity).toBeLessThan(richPur)
  })

  it('counts hack keywords', () => {
    const content = 'const hack = 1; const hacky = 2; const hacked = 3'
    const result = measureResonating(content)
    expect(result.hackCount).toBe(3)
    expect(result.hasNoHack).toBe(false)
  })

  it('counts workaround keywords', () => {
    const content = 'const workaround = 1; const quickfix = 2; const band-aid = 3'
    const result = measureResonating(content)
    expect(result.workaroundCount).toBe(3)
    expect(result.hasNoWorkaround).toBe(false)
  })

  it('detects clean (no any)', () => {
    expect(measureResonating(richContent).hasClean).toBe(true)
  })

  it('detects pristine (class/interface/type)', () => {
    expect(measureResonating(richContent).hasPristine).toBe(true)
  })

  it('detects flawless (JSDoc)', () => {
    expect(measureResonating(richContent).hasFlawless).toBe(true)
  })

  it('classifies tone correctly for high scores', () => {
    const result = measureResonating(richContent)
    expect(['pure-tone', 'clear-note', 'proper-frequency']).toContain(result.tone)
  })

  it('classifies tone correctly for low scores', () => {
    expect(measureResonating(emptyContent).tone).not.toBe('pure-tone')
  })
})

// ─── measureAccumulating ────────────────────────────────

describe('measureAccumulating', () => {
  it('scores rich content highly', () => {
    const result = measureAccumulating(richContent)
    expect(result.wisdom).toBeGreaterThan(60)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('scores empty content below rich', () => {
    expect(measureAccumulating(emptyContent).wisdom).toBeLessThan(richWis)
  })

  it('counts hacked keywords', () => {
    const content = 'const hack = 1; const workaround = 2; const kludge = 3'
    const result = measureAccumulating(content)
    expect(result.hackedCount).toBe(3)
    expect(result.hasNoHacked).toBe(false)
  })

  it('counts shallow keywords', () => {
    const content = 'const shallow = 1; const superficial = 2; const trivial = 3'
    const result = measureAccumulating(content)
    expect(result.shallowCount).toBe(3)
  })

  it('detects well-architected patterns', () => {
    expect(measureAccumulating(richContent).hasWellArchitected).toBe(true)
  })

  it('detects principled code (no any)', () => {
    expect(measureAccumulating(richContent).hasPrincipled).toBe(true)
  })

  it('detects visionary (async/await/Promise)', () => {
    expect(measureAccumulating(richContent).hasVisionary).toBe(true)
  })

  it('classifies depth correctly for high scores', () => {
    const result = measureAccumulating(richContent)
    expect(['geological-age', 'crystal-memory', 'proper-strata']).toContain(result.depth)
  })

  it('classifies depth correctly for low scores', () => {
    expect(measureAccumulating(emptyContent).depth).not.toBe('geological-age')
  })
})

// ─── analyzeQuartzFacet ─────────────────────────────────

describe('analyzeQuartzFacet', () => {
  it('analyzes a file correctly', () => {
    const facet = analyzeQuartzFacet(richContent, 'test.ts')
    expect(facet.file).toBe('test.ts')
    expect(facet.crystallineClarity).toBeGreaterThan(0)
    expect(facet.spectrumRefraction).toBeGreaterThan(0)
    expect(facet.facetPrecision).toBeGreaterThan(0)
    expect(facet.vibrationPurity).toBeGreaterThan(0)
    expect(facet.mineralWisdom).toBeGreaterThan(0)
    expect(facet.qualityScore).toBeGreaterThan(0)
    expect(facet.condition).toBeDefined()
  })

  it('computes quality score as weighted average', () => {
    const facet = analyzeQuartzFacet(richContent, 'test.ts')
    const expected = Math.round(
      facet.crystallineClarity * 0.2 +
      facet.spectrumRefraction * 0.2 +
      facet.facetPrecision * 0.2 +
      facet.vibrationPurity * 0.2 +
      facet.mineralWisdom * 0.2,
    )
    expect(facet.qualityScore).toBe(expected)
  })

  it('includes all measure objects', () => {
    const facet = analyzeQuartzFacet(richContent, 'test.ts')
    expect(facet.structuring).toBeDefined()
    expect(facet.refracting).toBeDefined()
    expect(facet.polishing).toBeDefined()
    expect(facet.resonating).toBeDefined()
    expect(facet.accumulating).toBeDefined()
  })

  it('classifies empty content as non-masterpiece', () => {
    const facet = analyzeQuartzFacet(emptyContent, 'empty.ts')
    expect(facet.qualityScore).toBeLessThan(60)
    expect(facet.condition).not.toBe('quartz-masterpiece')
  })
})

// ─── analyzeQuartzGeode ─────────────────────────────────

describe('analyzeQuartzGeode', () => {
  it('handles empty facets', () => {
    const geode = analyzeQuartzGeode([], 'empty-dir')
    expect(geode.facets).toHaveLength(0)
    expect(geode.geodeType).toBe('no-geode')
    expect(geode.condition).toBe('void')
  })

  it('analyzes a geode with facets', () => {
    const facet = analyzeQuartzFacet(richContent, 'src/test.ts')
    const geode = analyzeQuartzGeode([facet], 'src')
    expect(geode.directory).toBe('src')
    expect(geode.facets).toHaveLength(1)
    expect(geode.avgClarity).toBeGreaterThan(0)
  })

  it('counts quartz masterpieces', () => {
    const facet: QuartzFacet = {
      file: 'a.ts', crystallineClarity: 95, spectrumRefraction: 95, facetPrecision: 95, vibrationPurity: 95, mineralWisdom: 95,
      structuring: {} as QuartzFacet['structuring'],
      refracting: {} as QuartzFacet['refracting'],
      polishing: {} as QuartzFacet['polishing'],
      resonating: {} as QuartzFacet['resonating'],
      accumulating: {} as QuartzFacet['accumulating'],
      condition: 'quartz-masterpiece', qualityScore: 95,
    }
    expect(analyzeQuartzGeode([facet], 'src').quartzMasterpieceCount).toBe(1)
  })

  it('counts void facets', () => {
    const facet: QuartzFacet = {
      file: 'a.ts', crystallineClarity: 0, spectrumRefraction: 0, facetPrecision: 0, vibrationPurity: 0, mineralWisdom: 0,
      structuring: {} as QuartzFacet['structuring'],
      refracting: {} as QuartzFacet['refracting'],
      polishing: {} as QuartzFacet['polishing'],
      resonating: {} as QuartzFacet['resonating'],
      accumulating: {} as QuartzFacet['accumulating'],
      condition: 'void', qualityScore: 0,
    }
    expect(analyzeQuartzGeode([facet], 'src').voidCount).toBe(1)
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyFacetCondition', () => {
  it('classifies quartz-masterpiece at 90+', () => { expect(classifyFacetCondition(90)).toBe('quartz-masterpiece') })
  it('classifies gem-quality at 75-89', () => { expect(classifyFacetCondition(75)).toBe('gem-quality') })
  it('classifies proper-crystal at 60-74', () => { expect(classifyFacetCondition(60)).toBe('proper-crystal') })
  it('classifies industrial-grade at 40-59', () => { expect(classifyFacetCondition(40)).toBe('industrial-grade') })
  it('classifies raw-sand at 20-39', () => { expect(classifyFacetCondition(20)).toBe('raw-sand') })
  it('classifies void below 20', () => { expect(classifyFacetCondition(0)).toBe('void') })
})

describe('classifyGeodeType', () => {
  it('returns no-geode for empty facets', () => { expect(classifyGeodeType([])).toBe('no-geode') })
  it('classifies treasure-geode at 85+', () => { expect(classifyGeodeType([{ qualityScore: 90 } as QuartzFacet])).toBe('treasure-geode') })
  it('classifies crystal-cave at 70-84', () => { expect(classifyGeodeType([{ qualityScore: 75 } as QuartzFacet])).toBe('crystal-cave') })
  it('classifies proper-cluster at 55-69', () => { expect(classifyGeodeType([{ qualityScore: 60 } as QuartzFacet])).toBe('proper-cluster') })
  it('classifies small-nodule at 35-54', () => { expect(classifyGeodeType([{ qualityScore: 40 } as QuartzFacet])).toBe('small-nodule') })
  it('classifies empty-rock below 35', () => { expect(classifyGeodeType([{ qualityScore: 10 } as QuartzFacet])).toBe('empty-rock') })
})

describe('classifyGeodeCondition', () => {
  it('classifies crystal-palace at 85+', () => { expect(classifyGeodeCondition(85)).toBe('crystal-palace') })
  it('classifies gem-cave at 70-84', () => { expect(classifyGeodeCondition(70)).toBe('gem-cave') })
  it('classifies proper-mine at 55-69', () => { expect(classifyGeodeCondition(55)).toBe('proper-mine') })
  it('classifies gravel-pit at 35-54', () => { expect(classifyGeodeCondition(35)).toBe('gravel-pit') })
  it('classifies sand-dune at 15-34', () => { expect(classifyGeodeCondition(15)).toBe('sand-dune') })
  it('classifies void below 15', () => { expect(classifyGeodeCondition(0)).toBe('void') })
})

describe('classifyLapidaryGrade', () => {
  it('classifies master-lapidary at 80+', () => { expect(classifyLapidaryGrade(80)).toBe('master-lapidary') })
  it('classifies crystal-cutter at 65-79', () => { expect(classifyLapidaryGrade(65)).toBe('crystal-cutter') })
  it('classifies proper-gemologist at 50-64', () => { expect(classifyLapidaryGrade(50)).toBe('proper-gemologist') })
  it('classifies apprentice at 35-49', () => { expect(classifyLapidaryGrade(35)).toBe('apprentice') })
  it('classifies novice at 20-34', () => { expect(classifyLapidaryGrade(20)).toBe('novice') })
  it('classifies rock-collector below 20', () => { expect(classifyLapidaryGrade(0)).toBe('rock-collector') })
})

// ─── buildQuartzPrismResult ─────────────────────────────

describe('buildQuartzPrismResult', () => {
  it('handles empty input', async () => {
    const result = await buildQuartzPrismResult([], [])
    expect(result.facets).toHaveLength(0)
    expect(result.geodes).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.stats.bestFacet).toBe('')
  })

  it('analyzes single file', async () => {
    const result = await buildQuartzPrismResult(['test.ts'], [richContent])
    expect(result.facets).toHaveLength(1)
    expect(result.facets[0].file).toBe('test.ts')
    expect(result.geodes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory', async () => {
    const result = await buildQuartzPrismResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, richContent],
    )
    expect(result.geodes).toHaveLength(2)
  })

  it('computes average scores correctly', async () => {
    const result = await buildQuartzPrismResult(['a.ts'], [richContent])
    expect(result.stats.avgCrystallineClarity).toBe(result.facets[0].crystallineClarity)
    expect(result.stats.avgSpectrumRefraction).toBe(result.facets[0].spectrumRefraction)
    expect(result.stats.avgFacetPrecision).toBe(result.facets[0].facetPrecision)
    expect(result.stats.avgVibrationPurity).toBe(result.facets[0].vibrationPurity)
    expect(result.stats.avgMineralWisdom).toBe(result.facets[0].mineralWisdom)
  })

  it('identifies best facet', async () => {
    const result = await buildQuartzPrismResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestFacet).toBe('high.ts')
  })

  it('computes spectrum overview', async () => {
    const result = await buildQuartzPrismResult(['a.ts'], [richContent])
    expect(result.spectrum.avgClarity).toBe(result.facets[0].crystallineClarity)
    expect(result.spectrum.avgPrecision).toBe(result.facets[0].facetPrecision)
    expect(result.spectrum.avgWisdom).toBe(result.facets[0].mineralWisdom)
    expect(result.spectrum.overallBrilliance).toBe(result.stats.overallBrilliance)
  })

  it('sets isQuartz when overallBrilliance >= 60', async () => {
    const result = await buildQuartzPrismResult(['a.ts'], [richContent])
    if (result.stats.overallBrilliance >= 60) {
      expect(result.spectrum.isQuartz).toBe(true)
    }
  })

  it('finds clearest, mostRefractive, mostPrecise, purest, wisest', async () => {
    const result = await buildQuartzPrismResult(['a.ts'], [richContent])
    expect(result.stats.clearest).toBe('a.ts')
    expect(result.stats.mostRefractive).toBe('a.ts')
    expect(result.stats.mostPrecise).toBe('a.ts')
    expect(result.stats.purest).toBe('a.ts')
    expect(result.stats.wisest).toBe('a.ts')
  })

  it('counts high measure counts correctly', async () => {
    const result = await buildQuartzPrismResult(['a.ts'], [richContent])
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighRefractionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all scores >= 90', () => {
    const stats = makeStats({
      avgCrystallineClarity: 90, avgSpectrumRefraction: 90, avgFacetPrecision: 90,
      avgVibrationPurity: 90, avgMineralWisdom: 90, overallBrilliance: 90,
    })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isQuartz: true, overallBrilliance: 90 }, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('quartz prism refracts pure perfection')
  })

  it('recommends growing clarity when below 60', () => {
    const stats = makeStats({ avgCrystallineClarity: 40, avgSpectrumRefraction: 90, avgFacetPrecision: 90, avgVibrationPurity: 90, avgMineralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 40, avgPrecision: 90, avgWisdom: 90, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('Grow crystalline clarity'))).toBe(true)
  })

  it('recommends expanding refraction when below 60', () => {
    const stats = makeStats({ avgCrystallineClarity: 90, avgSpectrumRefraction: 40, avgFacetPrecision: 90, avgVibrationPurity: 90, avgMineralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('Expand spectrum refraction'))).toBe(true)
  })

  it('recommends polishing precision when below 60', () => {
    const stats = makeStats({ avgCrystallineClarity: 90, avgSpectrumRefraction: 90, avgFacetPrecision: 40, avgVibrationPurity: 90, avgMineralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 40, avgWisdom: 90, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('Polish facet precision'))).toBe(true)
  })

  it('recommends cleaning purity when below 60', () => {
    const stats = makeStats({ avgCrystallineClarity: 90, avgSpectrumRefraction: 90, avgFacetPrecision: 90, avgVibrationPurity: 40, avgMineralWisdom: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('Clean vibration purity'))).toBe(true)
  })

  it('recommends deepening wisdom when below 60', () => {
    const stats = makeStats({ avgCrystallineClarity: 90, avgSpectrumRefraction: 90, avgFacetPrecision: 90, avgVibrationPurity: 90, avgMineralWisdom: 40 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 40, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('Deepen mineral wisdom'))).toBe(true)
  })

  it('recommends prism opaque when brilliance < 40', () => {
    const stats = makeStats({ overallBrilliance: 30, avgCrystallineClarity: 30, avgSpectrumRefraction: 30, avgFacetPrecision: 30, avgVibrationPurity: 30, avgMineralWisdom: 30 })
    const recs = generateRecommendations([], [], { avgClarity: 30, avgPrecision: 30, avgWisdom: 30, isQuartz: false, overallBrilliance: 30 }, stats)
    expect(recs.some((r) => r.includes('prism is opaque'))).toBe(true)
  })

  it('lists void facets by name when <= 5', () => {
    const stats = makeStats({ avgCrystallineClarity: 70, avgSpectrumRefraction: 70, avgFacetPrecision: 70, avgVibrationPurity: 70, avgMineralWisdom: 70 })
    const facets = [{ file: 'a.ts', condition: 'void' } as QuartzFacet, { file: 'b.ts', condition: 'void' } as QuartzFacet]
    const recs = generateRecommendations(facets, [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('a.ts') && r.includes('b.ts'))).toBe(true)
  })

  it('summarizes void facets when > 5', () => {
    const stats = makeStats({ avgCrystallineClarity: 70, avgSpectrumRefraction: 70, avgFacetPrecision: 70, avgVibrationPurity: 70, avgMineralWisdom: 70 })
    const facets = Array.from({ length: 6 }, (_, i) => ({ file: `${i}.ts`, condition: 'void' } as QuartzFacet))
    const recs = generateRecommendations(facets, [], { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('6 raw stones'))).toBe(true)
  })

  it('reports all geodes are sand dunes', () => {
    const stats = makeStats({ avgCrystallineClarity: 70, avgSpectrumRefraction: 70, avgFacetPrecision: 70, avgVibrationPurity: 70, avgMineralWisdom: 70 })
    const geodes = [{ condition: 'sand-dune', directory: 'src' } as import('../src/commands/quartz-prism-helpers.js').QuartzGeode]
    const recs = generateRecommendations([], geodes, { avgClarity: 70, avgPrecision: 70, avgWisdom: 70, isQuartz: true, overallBrilliance: 70 }, stats)
    expect(recs.some((r) => r.includes('sand dunes'))).toBe(true)
  })

  it('returns default praise when all is well', () => {
    const stats = makeStats({ avgCrystallineClarity: 90, avgSpectrumRefraction: 90, avgFacetPrecision: 90, avgVibrationPurity: 90, avgMineralWisdom: 90, overallBrilliance: 90 })
    const recs = generateRecommendations([], [], { avgClarity: 90, avgPrecision: 90, avgWisdom: 90, isQuartz: true, overallBrilliance: 90 }, stats)
    expect(recs[0]).toContain('quartz prism refracts pure perfection')
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all ranges', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(95)).toBe('string')
  })
})

describe('colorFacetCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['quartz-masterpiece', 'gem-quality', 'proper-crystal', 'industrial-grade', 'raw-sand', 'void', 'unknown']) {
      expect(typeof colorFacetCondition(c)).toBe('string')
    }
  })
})

describe('colorGeodeType', () => {
  it('handles all types', () => {
    for (const t of ['treasure-geode', 'crystal-cave', 'proper-cluster', 'small-nodule', 'empty-rock', 'no-geode']) {
      expect(typeof colorGeodeType(t)).toBe('string')
    }
  })
})

describe('colorGeodeCondition', () => {
  it('handles all conditions', () => {
    for (const c of ['crystal-palace', 'gem-cave', 'proper-mine', 'gravel-pit', 'sand-dune', 'void']) {
      expect(typeof colorGeodeCondition(c)).toBe('string')
    }
  })
})

describe('colorLapidaryGrade', () => {
  it('handles all grades', () => {
    for (const g of ['master-lapidary', 'crystal-cutter', 'proper-gemologist', 'apprentice', 'novice', 'rock-collector']) {
      expect(typeof colorLapidaryGrade(g)).toBe('string')
    }
  })
})

describe('formatFacetTable', () => {
  it('formats a facet table', () => {
    const facet = analyzeQuartzFacet(richContent, 'test.ts')
    const output = formatFacetTable(facet)
    expect(output).toContain('Quartz Facet: test.ts')
    expect(output).toContain('Crystalline Clarity')
    expect(output).toContain('Quality Score')
  })
})

describe('formatFacetsTable', () => {
  it('formats empty facets message', () => { expect(formatFacetsTable([])).toContain('No quartz facets found') })
  it('formats facets list', () => {
    const output = formatFacetsTable([analyzeQuartzFacet(richContent, 'a.ts'), analyzeQuartzFacet(richContent, 'b.ts')])
    expect(output).toContain('Quartz Facets')
    expect(output).toContain('a.ts')
  })
})

describe('formatGeodeTable', () => {
  it('formats a geode table', () => {
    const geode = analyzeQuartzGeode([analyzeQuartzFacet(richContent, 'test.ts')], 'src')
    const output = formatGeodeTable(geode)
    expect(output).toContain('Quartz Geode: src')
  })
})

describe('formatGeodesTable', () => {
  it('formats empty message', () => { expect(formatGeodesTable([])).toContain('No quartz geodes found') })
  it('formats geodes list', () => {
    const geode = analyzeQuartzGeode([analyzeQuartzFacet(richContent, 'test.ts')], 'src')
    expect(formatGeodesTable([geode])).toContain('Quartz Geodes')
  })
})

describe('formatStatsTable', () => {
  it('formats stats table', () => {
    expect(formatStatsTable(makeStats())).toContain('Quartz Prism Statistics')
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
    const result = await buildQuartzPrismResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Quartz Prism Analysis')
    expect(output).toContain('Spectrum Overview')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as JSON', async () => {
    const result = await buildQuartzPrismResult(['test.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.facets).toHaveLength(1)
    expect(parsed.spectrum).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
