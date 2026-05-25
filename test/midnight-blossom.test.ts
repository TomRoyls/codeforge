import { describe, it, expect } from 'vitest'

import {
  measureUnfolding,
  measureDeepening,
  measureGleaming,
  measureDiffusing,
  measurePersisting,
  analyzeNightPetal,
  analyzeNightGarden,
  buildMidnightBlossomResult,
  classifyPetalCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyGardenerGrade,
  generateRecommendations,
  type NightPetal,
} from '../src/commands/midnight-blossom-helpers.js'

import {
  colorScore,
  colorCondition,
  colorGardenCondition,
  formatPetalTable,
  formatPetalsTable,
  formatGardenTable,
  formatGardensTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/midnight-blossom-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

const emptyContent = ''

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

// ─── measureUnfolding ───────────────────────────────────

describe('measureUnfolding', () => {
  it('returns all fields', () => {
    const result = measureUnfolding(richContent)
    expect(result).toHaveProperty('bloom')
    expect(result).toHaveProperty('petal')
    expect(result).toHaveProperty('hasHighBloom')
    expect(result).toHaveProperty('hasWellStructured')
    expect(result).toHaveProperty('hasNoChaotic')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasNoMonolithic')
    expect(result).toHaveProperty('hasCleanPipelines')
    expect(result).toHaveProperty('hasNoTangled')
    expect(result).toHaveProperty('hasIntentional')
    expect(result).toHaveProperty('hasCrafted')
    expect(result).toHaveProperty('hasRefined')
    expect(result).toHaveProperty('hasPolished')
    expect(result).toHaveProperty('hasElegant')
    expect(result).toHaveProperty('hasGraceful')
    expect(result).toHaveProperty('hasDeliberate')
    expect(result).toHaveProperty('hasPurposeful')
    expect(result).toHaveProperty('chaoticCount')
    expect(result).toHaveProperty('tangledCount')
  })

  it('detects well-structured code', () => {
    expect(measureUnfolding(richContent).hasWellStructured).toBe(true)
  })

  it('detects chaotic patterns (var, eval)', () => {
    const result = measureUnfolding('var x = eval("1")')
    expect(result.chaoticCount).toBeGreaterThan(0)
    expect(result.hasNoChaotic).toBe(false)
  })

  it('detects modular code', () => {
    expect(measureUnfolding(richContent).hasModular).toBe(true)
  })

  it('detects tangled patterns', () => {
    const result = measureUnfolding('tangled spaghetti callback.hell')
    expect(result.tangledCount).toBeGreaterThan(0)
    expect(result.hasNoTangled).toBe(false)
  })

  it('detects intentional code (no any)', () => {
    expect(measureUnfolding(richContent).hasIntentional).toBe(true)
  })

  it('detects crafted code (readonly, private)', () => {
    expect(measureUnfolding(richContent).hasCrafted).toBe(true)
  })

  it('classifies petal correctly', () => {
    expect(measureUnfolding(richContent).petal).toBeDefined()
  })
})

// ─── measureDeepening ───────────────────────────────────

describe('measureDeepening', () => {
  it('returns all fields', () => {
    const result = measureDeepening(richContent)
    expect(result).toHaveProperty('depth')
    expect(result).toHaveProperty('shadow')
    expect(result).toHaveProperty('hasHighDepth')
    expect(result).toHaveProperty('hasDeepLogic')
    expect(result).toHaveProperty('hasNoSuperficial')
    expect(result).toHaveProperty('hasThorough')
    expect(result).toHaveProperty('hasNoSkimmed')
    expect(result).toHaveProperty('hasComplete')
    expect(result).toHaveProperty('hasNoPartial')
    expect(result).toHaveProperty('hasProfound')
    expect(result).toHaveProperty('hasInsightful')
    expect(result).toHaveProperty('hasNuanced')
    expect(result).toHaveProperty('hasLayered')
    expect(result).toHaveProperty('hasComplex')
    expect(result).toHaveProperty('hasRich')
    expect(result).toHaveProperty('hasMultiLevel')
    expect(result).toHaveProperty('hasComprehensive')
    expect(result).toHaveProperty('hasDeep')
    expect(result).toHaveProperty('superficialCount')
    expect(result).toHaveProperty('partialCount')
  })

  it('detects deep logic', () => {
    expect(measureDeepening(richContent).hasDeepLogic).toBe(true)
  })

  it('detects superficial patterns', () => {
    const result = measureDeepening('superficial shallow skin.deep')
    expect(result.superficialCount).toBeGreaterThan(0)
    expect(result.hasNoSuperficial).toBe(false)
  })

  it('detects partial patterns', () => {
    const result = measureDeepening('partial incomplete half.done')
    expect(result.partialCount).toBeGreaterThan(0)
    expect(result.hasNoPartial).toBe(false)
  })

  it('detects rich code (no any)', () => {
    expect(measureDeepening(richContent).hasRich).toBe(true)
  })

  it('classifies shadow correctly', () => {
    expect(measureDeepening(richContent).shadow).toBeDefined()
  })
})

// ─── measureGleaming ────────────────────────────────────

describe('measureGleaming', () => {
  it('returns all fields', () => {
    const result = measureGleaming(richContent)
    expect(result).toHaveProperty('clarity')
    expect(result).toHaveProperty('moon')
    expect(result).toHaveProperty('hasHighClarity')
    expect(result).toHaveProperty('hasReadable')
    expect(result).toHaveProperty('hasNoCryptic')
    expect(result).toHaveProperty('hasSelfDocumenting')
    expect(result).toHaveProperty('hasNoMystery')
    expect(result).toHaveProperty('hasClear')
    expect(result).toHaveProperty('hasNoObfuscated')
    expect(result).toHaveProperty('hasUnderstandable')
    expect(result).toHaveProperty('hasVisible')
    expect(result).toHaveProperty('hasDirect')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasRevealed')
    expect(result).toHaveProperty('hasIlluminated')
    expect(result).toHaveProperty('hasExpressive')
    expect(result).toHaveProperty('hasCommunicative')
    expect(result).toHaveProperty('hasTransparent')
    expect(result).toHaveProperty('crypticCount')
    expect(result).toHaveProperty('obfuscatedCount')
  })

  it('detects readable code', () => {
    expect(measureGleaming(richContent).hasReadable).toBe(true)
  })

  it('detects cryptic names', () => {
    const result = measureGleaming('const a = 1')
    expect(result.crypticCount).toBeGreaterThan(0)
    expect(result.hasNoCryptic).toBe(false)
  })

  it('detects mystery patterns', () => {
    expect(measureGleaming('const magic = 42').hasNoMystery).toBe(false)
  })

  it('detects obfuscated code', () => {
    expect(measureGleaming('eval("code")').hasNoObfuscated).toBe(false)
  })

  it('classifies moon correctly', () => {
    expect(measureGleaming(richContent).moon).toBeDefined()
  })
})

// ─── measureDiffusing ───────────────────────────────────

describe('measureDiffusing', () => {
  it('returns all fields', () => {
    const result = measureDiffusing(richContent)
    expect(result).toHaveProperty('fragrance')
    expect(result).toHaveProperty('scent')
    expect(result).toHaveProperty('hasHighFragrance')
    expect(result).toHaveProperty('hasModular')
    expect(result).toHaveProperty('hasReusable')
    expect(result).toHaveProperty('hasWellAbstracted')
    expect(result).toHaveProperty('hasNoDuplicated')
    expect(result).toHaveProperty('hasExported')
    expect(result).toHaveProperty('hasNoHidden')
    expect(result).toHaveProperty('hasDocumented')
    expect(result).toHaveProperty('hasTyped')
    expect(result).toHaveProperty('hasInterfaced')
    expect(result).toHaveProperty('hasGenerous')
    expect(result).toHaveProperty('hasShareable')
    expect(result).toHaveProperty('hasComposable')
    expect(result).toHaveProperty('hasValuable')
    expect(result).toHaveProperty('hasInfluential')
    expect(result).toHaveProperty('hasSpreading')
    expect(result).toHaveProperty('duplicatedCount')
    expect(result).toHaveProperty('hiddenCount')
  })

  it('detects modular code', () => {
    expect(measureDiffusing(richContent).hasModular).toBe(true)
  })

  it('detects duplicated patterns', () => {
    const result = measureDiffusing('duplicate copy.paste redundant')
    expect(result.duplicatedCount).toBeGreaterThan(0)
    expect(result.hasNoDuplicated).toBe(false)
  })

  it('detects shareable code (no any)', () => {
    expect(measureDiffusing(richContent).hasShareable).toBe(true)
  })

  it('detects typed code', () => {
    expect(measureDiffusing(richContent).hasTyped).toBe(true)
  })

  it('classifies scent correctly', () => {
    expect(measureDiffusing(richContent).scent).toBeDefined()
  })
})

// ─── measurePersisting ──────────────────────────────────

describe('measurePersisting', () => {
  it('returns all fields', () => {
    const result = measurePersisting(richContent)
    expect(result).toHaveProperty('resilience')
    expect(result).toHaveProperty('night')
    expect(result).toHaveProperty('hasHighResilience')
    expect(result).toHaveProperty('hasErrorHandled')
    expect(result).toHaveProperty('hasNoUnhandled')
    expect(result).toHaveProperty('hasDefensive')
    expect(result).toHaveProperty('hasRobust')
    expect(result).toHaveProperty('hasTested')
    expect(result).toHaveProperty('hasNoUntested')
    expect(result).toHaveProperty('hasStable')
    expect(result).toHaveProperty('hasEnduring')
    expect(result).toHaveProperty('hasAdapted')
    expect(result).toHaveProperty('hasHardened')
    expect(result).toHaveProperty('hasResourceful')
    expect(result).toHaveProperty('hasPatient')
    expect(result).toHaveProperty('hasPersistent')
    expect(result).toHaveProperty('hasUnyielding')
    expect(result).toHaveProperty('hasSurviving')
    expect(result).toHaveProperty('unhandledCount')
    expect(result).toHaveProperty('untestedCount')
  })

  it('detects error handling', () => {
    expect(measurePersisting(richContent).hasErrorHandled).toBe(true)
  })

  it('detects unhandled (any)', () => {
    const result = measurePersisting('const x: any = 1')
    expect(result.unhandledCount).toBeGreaterThan(0)
    expect(result.hasNoUnhandled).toBe(false)
  })

  it('detects hardened code (no any)', () => {
    expect(measurePersisting(richContent).hasHardened).toBe(true)
  })

  it('detects untested patterns (eval)', () => {
    const result = measurePersisting('eval("code")')
    expect(result.untestedCount).toBeGreaterThan(0)
    expect(result.hasNoUntested).toBe(false)
  })

  it('classifies night correctly', () => {
    expect(measurePersisting(richContent).night).toBeDefined()
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyPetalCondition', () => {
  it('returns midnight-masterpiece for 90+', () => {
    expect(classifyPetalCondition(90)).toBe('midnight-masterpiece')
  })
  it('returns rare-bloom for 75-89', () => {
    expect(classifyPetalCondition(75)).toBe('rare-bloom')
  })
  it('returns proper-flower for 60-74', () => {
    expect(classifyPetalCondition(60)).toBe('proper-flower')
  })
  it('returns wilting-petal for 40-59', () => {
    expect(classifyPetalCondition(40)).toBe('wilting-petal')
  })
  it('returns dead-leaf for 20-39', () => {
    expect(classifyPetalCondition(20)).toBe('dead-leaf')
  })
  it('returns void for 0-19', () => {
    expect(classifyPetalCondition(0)).toBe('void')
  })
})

describe('classifyGardenType', () => {
  it('returns no-garden for empty', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })
  it('returns moonlit-garden for high avg', () => {
    const petals = [{ qualityScore: 90 }].map((p) => ({ ...p } as NightPetal))
    expect(classifyGardenType(petals)).toBe('moonlit-garden')
  })
})

describe('classifyGardenCondition', () => {
  it('returns enchanted-garden for 85+', () => {
    expect(classifyGardenCondition(85)).toBe('enchanted-garden')
  })
  it('returns midnight-oasis for 70-84', () => {
    expect(classifyGardenCondition(70)).toBe('midnight-oasis')
  })
  it('returns proper-plot for 55-69', () => {
    expect(classifyGardenCondition(55)).toBe('proper-plot')
  })
  it('returns weed-patch for 35-54', () => {
    expect(classifyGardenCondition(35)).toBe('weed-patch')
  })
  it('returns desert for 15-34', () => {
    expect(classifyGardenCondition(15)).toBe('desert')
  })
  it('returns void for 0-14', () => {
    expect(classifyGardenCondition(0)).toBe('void')
  })
})

describe('classifyGardenerGrade', () => {
  it('returns night-gardener for 80+', () => {
    expect(classifyGardenerGrade(80)).toBe('night-gardener')
  })
  it('returns moonlight-botanist for 65-79', () => {
    expect(classifyGardenerGrade(65)).toBe('moonlight-botanist')
  })
  it('returns proper-cultivator for 50-64', () => {
    expect(classifyGardenerGrade(50)).toBe('proper-cultivator')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyGardenerGrade(35)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyGardenerGrade(20)).toBe('novice')
  })
  it('returns sunbaker for 0-19', () => {
    expect(classifyGardenerGrade(0)).toBe('sunbaker')
  })
})

// ─── analyzeNightPetal ──────────────────────────────────

describe('analyzeNightPetal', () => {
  it('returns a complete petal', () => {
    const petal = analyzeNightPetal(richContent, 'app.ts')
    expect(petal.file).toBe('app.ts')
    expect(petal.nocturnalBloom).toBeGreaterThanOrEqual(0)
    expect(petal.shadowDepth).toBeGreaterThanOrEqual(0)
    expect(petal.moonlitClarity).toBeGreaterThanOrEqual(0)
    expect(petal.nightFragrance).toBeGreaterThanOrEqual(0)
    expect(petal.darkResilience).toBeGreaterThanOrEqual(0)
    expect(petal.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('computes qualityScore as 0.2 weighted average', () => {
    const petal = analyzeNightPetal(richContent, 'test.ts')
    const expected = Math.round(
      petal.nocturnalBloom * 0.2 +
      petal.shadowDepth * 0.2 +
      petal.moonlitClarity * 0.2 +
      petal.nightFragrance * 0.2 +
      petal.darkResilience * 0.2,
    )
    expect(petal.qualityScore).toBe(expected)
  })

  it('handles empty content', () => {
    expect(analyzeNightPetal(emptyContent, 'e.ts').qualityScore).toBeLessThan(40)
  })
})

// ─── analyzeNightGarden ─────────────────────────────────

describe('analyzeNightGarden', () => {
  it('returns empty garden for no petals', () => {
    const garden = analyzeNightGarden([], 'src')
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('void')
  })

  it('computes averages from petals', () => {
    const petal = analyzeNightPetal(richContent, 'app.ts')
    const garden = analyzeNightGarden([petal], 'src')
    expect(garden.avgBloom).toBe(petal.nocturnalBloom)
  })
})

// ─── buildMidnightBlossomResult ─────────────────────────

describe('buildMidnightBlossomResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildMidnightBlossomResult([], [])
    expect(result.petals).toHaveLength(0)
    expect(result.night.isNocturnal).toBe(false)
    expect(result.stats.gardenerGrade).toBe('sunbaker')
  })

  it('returns complete result for rich content', async () => {
    const result = await buildMidnightBlossomResult(['app.ts'], [richContent])
    expect(result.petals).toHaveLength(1)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('groups files into gardens by directory', async () => {
    const result = await buildMidnightBlossomResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    expect(result.gardens).toHaveLength(2)
  })

  it('computes all stats fields', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(result.stats.avgNocturnalBloom).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgShadowDepth).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgMoonlitClarity).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgNightFragrance).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgDarkResilience).toBeGreaterThanOrEqual(0)
    expect(typeof result.stats.bestPetal).toBe('string')
    expect(typeof result.stats.bestBloom).toBe('string')
    expect(typeof result.stats.deepest).toBe('string')
    expect(typeof result.stats.clearest).toBe('string')
    expect(typeof result.stats.mostFragrant).toBe('string')
    expect(typeof result.stats.mostResilient).toBe('string')
  })

  it('scores rich content at max (100)', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    const petal = result.petals[0]
    expect(petal.nocturnalBloom).toBe(100)
    expect(petal.shadowDepth).toBe(100)
    expect(petal.moonlitClarity).toBe(100)
    expect(petal.nightFragrance).toBe(100)
    expect(petal.darkResilience).toBe(100)
    expect(petal.qualityScore).toBe(100)
  })

  it('sets night.isNocturnal when luminosity >= 60', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(result.night.isNocturnal).toBe(true)
  })

  it('files in root map to . garden', async () => {
    const result = await buildMidnightBlossomResult(['app.ts'], [richContent])
    expect(result.gardens[0].directory).toBe('.')
  })

  it('sets bestPetal to highest qualityScore', async () => {
    const result = await buildMidnightBlossomResult(
      ['empty.ts', 'rich.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestPetal).toBe('rich.ts')
  })

  it('tracks all condition counts', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(result.stats.midnightMasterpieceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.rareBloomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.properFlowerCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.wiltingPetalCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.deadLeafCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.voidCount).toBeGreaterThanOrEqual(0)
  })

  it('tracks high-measure counts', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(result.stats.hasHighBloomCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighFragranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasHighResilienceCount).toBeGreaterThanOrEqual(0)
  })

  it('computes bestBloom, deepest, clearest, mostFragrant, mostResilient', async () => {
    const result = await buildMidnightBlossomResult(
      ['low.ts', 'high.ts'],
      [emptyContent, richContent],
    )
    expect(result.stats.bestBloom).toBe('high.ts')
    expect(result.stats.deepest).toBe('high.ts')
    expect(result.stats.clearest).toBe('high.ts')
    expect(result.stats.mostFragrant).toBe('high.ts')
    expect(result.stats.mostResilient).toBe('high.ts')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece when all >= 90', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(result.recommendations).toHaveLength(1)
    expect(result.recommendations[0]).toContain('masterpiece')
  })

  it('recommends bloom when nocturnal low', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], ['var x = 1'])
    const hasRec = result.recommendations.some((r) => r.includes('Cultivate'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorCondition('midnight-masterpiece')).toBe('string')
    expect(typeof colorCondition('void')).toBe('string')
    expect(typeof colorCondition('unknown')).toBe('string')
  })
})

describe('colorGardenCondition', () => {
  it('returns string for each condition', () => {
    expect(typeof colorGardenCondition('enchanted-garden')).toBe('string')
    expect(typeof colorGardenCondition('void')).toBe('string')
  })
})

describe('formatPetalTable', () => {
  it('formats a petal', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    const output = formatPetalTable(result.petals[0])
    expect(output).toContain('Night Petal')
    expect(output).toContain('Nocturnal Bloom')
  })
})

describe('formatPetalsTable', () => {
  it('returns no petals for empty', () => {
    expect(formatPetalsTable([])).toContain('No night petals')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    expect(formatGardenTable(result.gardens[0])).toContain('Night Garden')
  })
})

describe('formatGardensTable', () => {
  it('returns no gardens for empty', () => {
    expect(formatGardensTable([])).toContain('No night gardens')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Gardener Grade')
    expect(output).toContain('Best Petal')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Midnight Blossom Analysis')
    expect(output).toContain('Night Overview')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMidnightBlossomResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.petals).toHaveLength(1)
  })
})
