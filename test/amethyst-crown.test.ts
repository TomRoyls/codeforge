import { describe, it, expect } from 'vitest'
import {
  measureDeepening,
  measureClarifying,
  measureStructuring,
  measureColoring,
  measureTransforming,
  classifyGemCondition,
  classifyCrownType,
  classifyCrownCondition,
  classifyMonarchGrade,
  analyzeAmethystGem,
  analyzeAmethystCrown,
  buildAmethystCrownResult,
  generateRecommendations,
} from '../src/commands/amethyst-crown-helpers.js'
import {
  colorScore,
  colorGrade,
  formatGemTable,
  formatGemsTable,
  formatCrownTable,
  formatCrownsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/amethyst-crown-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

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
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureDeepening ───────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns low depth for minimal content', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBe(8)
  })

  it('detects wise (docComments + interface)', () => {
    expect(measureDeepening(richContent).hasWise).toBe(true)
  })

  it('detects authoritative (generics + typeAlias)', () => {
    expect(measureDeepening(richContent).hasAuthoritative).toBe(true)
  })

  it('detects profound (readonly + returnType)', () => {
    expect(measureDeepening(richContent).hasProfound).toBe(true)
  })

  it('detects deep (strictEq + private)', () => {
    expect(measureDeepening(richContent).hasDeep).toBe(true)
  })

  it('detects substantive (const + interface)', () => {
    expect(measureDeepening(richContent).hasSubstantive).toBe(true)
  })

  it('detects commanding (class + docComments)', () => {
    expect(measureDeepening(richContent).hasCommanding).toBe(true)
  })

  it('has no shallow for clean code', () => {
    const m = measureDeepening(richContent)
    expect(m.hasNoShallow).toBe(true)
    expect(m.shallowCount).toBe(0)
  })

  it('has no trivial for clean code', () => {
    const m = measureDeepening(richContent)
    expect(m.hasNoTrivial).toBe(true)
    expect(m.trivialCount).toBe(0)
  })

  it('has no surface when no eval', () => {
    expect(measureDeepening(richContent).hasNoSurface).toBe(true)
  })

  it('has no hollow when no debugger', () => {
    expect(measureDeepening(minimalContent).hasNoHollow).toBe(true)
  })

  it('gives high depth for rich content', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBeGreaterThanOrEqual(70)
    expect(m.hasHighDepth).toBe(true)
  })

  it('detects shallow in var code', () => {
    const m = measureDeepening('var x = 1')
    expect(m.shallowCount).toBe(1)
    expect(m.hasNoShallow).toBe(false)
  })

  it('detects trivial in any code', () => {
    const m = measureDeepening('const x: any = 1')
    expect(m.trivialCount).toBe(1)
    expect(m.hasNoTrivial).toBe(false)
  })

  it('assigns colorless for very low scores', () => {
    expect(measureDeepening('').grade).toBe('colorless')
  })

  it('assigns deep-purple for very high scores', () => {
    expect(measureDeepening(richContent).grade).toBe('deep-purple')
  })

  it('caps depth at 100', () => {
    expect(measureDeepening(richContent).depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureClarifying ──────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 clarity for minimal content', () => {
    const m = measureClarifying(minimalContent)
    expect(m.clarity).toBe(0)
  })

  it('detects clear (export + import)', () => {
    expect(measureClarifying(richContent).hasClear).toBe(true)
  })

  it('detects logical (private + readonly)', () => {
    expect(measureClarifying(richContent).hasLogical).toBe(true)
  })

  it('detects rational (interface + class)', () => {
    expect(measureClarifying(richContent).hasRational).toBe(true)
  })

  it('detects lucid (strictEq + returnType)', () => {
    expect(measureClarifying(richContent).hasLucid).toBe(true)
  })

  it('detects coherent (generics + async)', () => {
    expect(measureClarifying(richContent).hasCoherent).toBe(true)
  })

  it('detects sensible (export + generics)', () => {
    expect(measureClarifying(richContent).hasSensible).toBe(true)
  })

  it('has no confused for clean code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoConfused).toBe(true)
    expect(m.confusedCount).toBe(0)
  })

  it('has no irrational for clean code', () => {
    const m = measureClarifying(richContent)
    expect(m.hasNoIrrational).toBe(true)
    expect(m.irrationalCount).toBe(0)
  })

  it('has no muddled when no eval', () => {
    expect(measureClarifying(richContent).hasNoMuddled).toBe(true)
  })

  it('has no incoherent when no debugger', () => {
    expect(measureClarifying(minimalContent).hasNoIncoherent).toBe(true)
  })

  it('gives high clarity for rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(70)
    expect(m.hasHighClarity).toBe(true)
  })

  it('detects confused in var code', () => {
    const m = measureClarifying('var x = 1')
    expect(m.confusedCount).toBe(1)
    expect(m.hasNoConfused).toBe(false)
  })

  it('detects irrational in any code', () => {
    const m = measureClarifying('const x: any = 1')
    expect(m.irrationalCount).toBe(1)
    expect(m.hasNoIrrational).toBe(false)
  })

  it('assigns intoxicated for very low scores', () => {
    expect(measureClarifying('').sobriety).toBe('intoxicated')
  })

  it('assigns crystal-clear-mind for very high scores', () => {
    expect(measureClarifying(richContent).sobriety).toBe('crystal-clear-mind')
  })

  it('caps clarity at 100', () => {
    expect(measureClarifying(richContent).clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureStructuring ─────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns low quality for minimal content', () => {
    expect(measureStructuring(minimalContent).quality).toBe(8)
  })

  it('detects organized (namedExport + export)', () => {
    expect(measureStructuring(richContent).hasOrganized).toBe(true)
  })

  it('detects structured (returnType + strictEq)', () => {
    expect(measureStructuring(richContent).hasStructured).toBe(true)
  })

  it('detects ordered (interface + generics)', () => {
    expect(measureStructuring(richContent).hasOrdered).toBe(true)
  })

  it('detects systematic (readonly + private)', () => {
    expect(measureStructuring(richContent).hasSystematic).toBe(true)
  })

  it('detects regular (class + const)', () => {
    expect(measureStructuring(richContent).hasRegular).toBe(true)
  })

  it('detects patterned (namedExport + returnType)', () => {
    expect(measureStructuring(richContent).hasPatterned).toBe(true)
  })

  it('has no chaotic for clean code', () => {
    const m = measureStructuring(richContent)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.chaoticCount).toBe(0)
  })

  it('has no random for clean code', () => {
    const m = measureStructuring(richContent)
    expect(m.hasNoRandom).toBe(true)
    expect(m.randomCount).toBe(0)
  })

  it('has no haphazard when no eval', () => {
    expect(measureStructuring(richContent).hasNoHaphazard).toBe(true)
  })

  it('has no irregular when no debugger', () => {
    expect(measureStructuring(minimalContent).hasNoIrregular).toBe(true)
  })

  it('gives high quality for rich content', () => {
    const m = measureStructuring(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(70)
    expect(m.hasHighQuality).toBe(true)
  })

  it('detects chaotic in var code', () => {
    const m = measureStructuring('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects random in any code', () => {
    const m = measureStructuring('const x: any = 1')
    expect(m.randomCount).toBe(1)
    expect(m.hasNoRandom).toBe(false)
  })

  it('assigns no-structure for very low scores', () => {
    expect(measureStructuring('').crystal).toBe('no-structure')
  })

  it('assigns hexagonal-perfection for very high scores', () => {
    expect(measureStructuring(richContent).crystal).toBe('hexagonal-perfection')
  })

  it('caps quality at 100', () => {
    expect(measureStructuring(richContent).quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureColoring ────────────────────────────────────────────────

describe('measureColoring', () => {
  it('returns low majesty for minimal content', () => {
    expect(measureColoring(minimalContent).majesty).toBe(8)
  })

  it('detects elegant (docComments + interface)', () => {
    expect(measureColoring(richContent).hasElegant).toBe(true)
  })

  it('detects dignified (typeAlias + generics)', () => {
    expect(measureColoring(richContent).hasDignified).toBe(true)
  })

  it('detects sophisticated (returnType + readonly)', () => {
    expect(measureColoring(richContent).hasSophisticated).toBe(true)
  })

  it('detects graceful (private + strictEq)', () => {
    expect(measureColoring(richContent).hasGraceful).toBe(true)
  })

  it('detects refined (const + docComments)', () => {
    expect(measureColoring(richContent).hasRefined).toBe(true)
  })

  it('detects noble (class + interface)', () => {
    expect(measureColoring(richContent).hasNoble).toBe(true)
  })

  it('has no crude for clean code', () => {
    const m = measureColoring(richContent)
    expect(m.hasNoCrude).toBe(true)
    expect(m.crudeCount).toBe(0)
  })

  it('has no clunky for clean code', () => {
    const m = measureColoring(richContent)
    expect(m.hasNoClunky).toBe(true)
    expect(m.clunkyCount).toBe(0)
  })

  it('has no harsh when no eval', () => {
    expect(measureColoring(richContent).hasNoHarsh).toBe(true)
  })

  it('has no vulgar when no debugger', () => {
    expect(measureColoring(minimalContent).hasNoVulgar).toBe(true)
  })

  it('gives high majesty for rich content', () => {
    const m = measureColoring(richContent)
    expect(m.majesty).toBeGreaterThanOrEqual(70)
    expect(m.hasHighMajesty).toBe(true)
  })

  it('detects crude in var code', () => {
    const m = measureColoring('var x = 1')
    expect(m.crudeCount).toBe(1)
    expect(m.hasNoCrude).toBe(false)
  })

  it('detects clunky in any code', () => {
    const m = measureColoring('const x: any = 1')
    expect(m.clunkyCount).toBe(1)
    expect(m.hasNoClunky).toBe(false)
  })

  it('assigns no-color for very low scores', () => {
    expect(measureColoring('').color).toBe('no-color')
  })

  it('assigns royal-purple for very high scores', () => {
    expect(measureColoring(richContent).color).toBe('royal-purple')
  })

  it('caps majesty at 100', () => {
    expect(measureColoring(richContent).majesty).toBeLessThanOrEqual(100)
  })
})

// ─── measureTransforming ─────────────────────────────────────────────

describe('measureTransforming', () => {
  it('returns low purity for minimal content', () => {
    expect(measureTransforming(minimalContent).purity).toBe(8)
  })

  it('detects clean (returnType + strictEq)', () => {
    expect(measureTransforming(richContent).hasClean).toBe(true)
  })

  it('detects pure (readonly + private)', () => {
    expect(measureTransforming(richContent).hasPure).toBe(true)
  })

  it('detects preserved (interface + generics)', () => {
    expect(measureTransforming(richContent).hasPreserved).toBe(true)
  })

  it('detects improved (typeAlias + docComments)', () => {
    expect(measureTransforming(richContent).hasImproved).toBe(true)
  })

  it('detects enhanced (class + returnType)', () => {
    expect(measureTransforming(richContent).hasEnhanced).toBe(true)
  })

  it('detects uplifted (const + strictEq)', () => {
    expect(measureTransforming(richContent).hasUplifted).toBe(true)
  })

  it('has no polluted for clean code', () => {
    const m = measureTransforming(richContent)
    expect(m.hasNoPolluted).toBe(true)
    expect(m.pollutedCount).toBe(0)
  })

  it('has no degraded for clean code', () => {
    const m = measureTransforming(richContent)
    expect(m.hasNoDegraded).toBe(true)
    expect(m.degradedCount).toBe(0)
  })

  it('has no regressed when no eval', () => {
    expect(measureTransforming(richContent).hasNoRegressed).toBe(true)
  })

  it('has no diminished when no debugger', () => {
    expect(measureTransforming(minimalContent).hasNoDiminished).toBe(true)
  })

  it('gives high purity for rich content', () => {
    const m = measureTransforming(richContent)
    expect(m.purity).toBeGreaterThanOrEqual(70)
    expect(m.hasHighPurity).toBe(true)
  })

  it('detects polluted in var code', () => {
    const m = measureTransforming('var x = 1')
    expect(m.pollutedCount).toBe(1)
    expect(m.hasNoPolluted).toBe(false)
  })

  it('detects degraded in any code', () => {
    const m = measureTransforming('const x: any = 1')
    expect(m.degradedCount).toBe(1)
    expect(m.hasNoDegraded).toBe(false)
  })

  it('assigns degraded for very low scores', () => {
    expect(measureTransforming('').transformation).toBe('degraded')
  })

  it('assigns pure-transmutation for very high scores', () => {
    expect(measureTransforming(richContent).transformation).toBe('pure-transmutation')
  })

  it('caps purity at 100', () => {
    expect(measureTransforming(richContent).purity).toBeLessThanOrEqual(100)
  })
})

// ─── classifyGemCondition ────────────────────────────────────────────

describe('classifyGemCondition', () => {
  it('returns crown-jewel for 85+', () => { expect(classifyGemCondition(90)).toBe('crown-jewel') })
  it('returns bishop-ring for 70-84', () => { expect(classifyGemCondition(75)).toBe('bishop-ring') })
  it('returns proper-amethyst for 55-69', () => { expect(classifyGemCondition(60)).toBe('proper-amethyst') })
  it('returns rose-quartz for 40-54', () => { expect(classifyGemCondition(45)).toBe('rose-quartz') })
  it('returns common-quartz for 25-39', () => { expect(classifyGemCondition(30)).toBe('common-quartz') })
  it('returns sand for below 25', () => { expect(classifyGemCondition(10)).toBe('sand') })
})

// ─── classifyCrownType ──────────────────────────────────────────────

describe('classifyCrownType', () => {
  it('returns no-crown for empty array', () => {
    expect(classifyCrownType([])).toBe('no-crown')
  })
})

// ─── classifyCrownCondition ─────────────────────────────────────────

describe('classifyCrownCondition', () => {
  it('returns imperial-regalia for 75+', () => { expect(classifyCrownCondition(80)).toBe('imperial-regalia') })
  it('returns crown-jewels for 60-74', () => { expect(classifyCrownCondition(65)).toBe('crown-jewels') })
  it('returns decent-collection for 45-59', () => { expect(classifyCrownCondition(50)).toBe('decent-collection') })
  it('returns common-gems for 30-44', () => { expect(classifyCrownCondition(35)).toBe('common-gems') })
  it('returns fakes for 15-29', () => { expect(classifyCrownCondition(20)).toBe('fakes') })
  it('returns empty for below 15', () => { expect(classifyCrownCondition(5)).toBe('empty') })
})

// ─── classifyMonarchGrade ───────────────────────────────────────────

describe('classifyMonarchGrade', () => {
  it('returns emperor for 80+', () => { expect(classifyMonarchGrade(85)).toBe('emperor') })
  it('returns king for 65-79', () => { expect(classifyMonarchGrade(70)).toBe('king') })
  it('returns prince for 50-64', () => { expect(classifyMonarchGrade(55)).toBe('prince') })
  it('returns duke for 35-49', () => { expect(classifyMonarchGrade(40)).toBe('duke') })
  it('returns knight for 20-34', () => { expect(classifyMonarchGrade(25)).toBe('knight') })
  it('returns peasant for below 20', () => { expect(classifyMonarchGrade(10)).toBe('peasant') })
})

// ─── analyzeAmethystGem ─────────────────────────────────────────────

describe('analyzeAmethystGem', () => {
  it('returns correct file path', () => {
    expect(analyzeAmethystGem(minimalContent, 'index.ts').file).toBe('index.ts')
  })

  it('calculates qualityScore of 6 for minimal content', () => {
    expect(analyzeAmethystGem(minimalContent, 'index.ts').qualityScore).toBe(6)
  })

  it('classifies minimal as sand', () => {
    expect(analyzeAmethystGem(minimalContent, 'index.ts').condition).toBe('sand')
  })

  it('has all measure fields', () => {
    const gem = analyzeAmethystGem(minimalContent, 'index.ts')
    expect(gem).toHaveProperty('deepening')
    expect(gem).toHaveProperty('clarifying')
    expect(gem).toHaveProperty('structuring')
    expect(gem).toHaveProperty('coloring')
    expect(gem).toHaveProperty('transforming')
  })

  it('returns high qualityScore for rich content', () => {
    expect(analyzeAmethystGem(richContent, 'rich.ts').qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('classifies rich as crown-jewel', () => {
    expect(analyzeAmethystGem(richContent, 'rich.ts').condition).toBe('crown-jewel')
  })

  it('has all score fields as numbers', () => {
    const gem = analyzeAmethystGem(minimalContent, 'index.ts')
    expect(typeof gem.royalDepth).toBe('number')
    expect(typeof gem.soberClarity).toBe('number')
    expect(typeof gem.crystalStructure).toBe('number')
    expect(typeof gem.colorMajesty).toBe('number')
    expect(typeof gem.transformationPurity).toBe('number')
  })
})

// ─── analyzeAmethystCrown ───────────────────────────────────────────

describe('analyzeAmethystCrown', () => {
  it('returns empty crown for no gems', () => {
    const crown = analyzeAmethystCrown([], 'src')
    expect(crown.directory).toBe('src')
    expect(crown.gems.length).toBe(0)
    expect(crown.avgDepth).toBe(0)
    expect(crown.avgClarity).toBe(0)
    expect(crown.avgStructure).toBe(0)
    expect(crown.crownType).toBe('no-crown')
    expect(crown.condition).toBe('empty')
  })

  it('computes averages from gems', () => {
    const g1 = analyzeAmethystGem(richContent, 'a.ts')
    const g2 = analyzeAmethystGem(richContent, 'b.ts')
    const crown = analyzeAmethystCrown([g1, g2], 'src')
    expect(crown.avgDepth).toBe(g1.royalDepth)
    expect(crown.avgClarity).toBe(g1.soberClarity)
  })
})

// ─── buildAmethystCrownResult ───────────────────────────────────────

describe('buildAmethystCrownResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildAmethystCrownResult([], [])
    expect(result.gems.length).toBe(0)
    expect(result.crowns.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.throne.isRoyal).toBe(false)
    expect(result.throne.overallMajesty).toBe(0)
  })

  it('returns correct structure for single file', async () => {
    const result = await buildAmethystCrownResult(['index.ts'], [richContent])
    expect(result.gems.length).toBe(1)
    expect(result.crowns.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestGem).toBe('index.ts')
    expect(result.stats.wisest).toBe('index.ts')
    expect(result.stats.clearest).toBe('index.ts')
    expect(result.stats.bestStructured).toBe('index.ts')
    expect(result.stats.mostElegant).toBe('index.ts')
  })

  it('computes throne.isRoyal when avgDepth >= 60', async () => {
    const result = await buildAmethystCrownResult(['rich.ts'], [richContent])
    expect(result.throne.isRoyal).toBe(true)
  })

  it('computes overallMajesty correctly', async () => {
    const result = await buildAmethystCrownResult(['rich.ts'], [richContent])
    const expected = Math.round(
      (result.throne.avgDepth + result.throne.avgClarity + result.throne.avgStructure) / 3,
    )
    expect(result.throne.overallMajesty).toBe(expected)
  })

  it('counts condition categories correctly', async () => {
    const result = await buildAmethystCrownResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.crownJewelCount + result.stats.bishopRingCount +
      result.stats.properAmethystCount + result.stats.roseQuartzCount +
      result.stats.commonQuartzCount + result.stats.sandCount).toBe(2)
  })

  it('counts high measure flags correctly', async () => {
    const result = await buildAmethystCrownResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighClarityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighMajestyCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighPurityCount).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory into crowns', async () => {
    const result = await buildAmethystCrownResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.crowns.length).toBe(2)
  })

  it('sets monarchGrade based on overallMajesty', async () => {
    const result = await buildAmethystCrownResult(['rich.ts'], [richContent])
    expect(result.stats.monarchGrade).toBe(classifyMonarchGrade(result.throne.overallMajesty))
  })

  it('returns minimal content qualityScore of 6', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    expect(result.gems[0]!.qualityScore).toBe(6)
  })

  it('returns recommendations array', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message when all metrics are good', async () => {
    const result = await buildAmethystCrownResult(['rich.ts'], [richContent])
    expect(result.recommendations).toContain(
      'Your amethyst collection is emperor quality! Every gem radiates royal majesty',
    )
  })

  it('recommends depth improvement when low', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('royal wisdom'))
    expect(hasRec).toBe(true)
  })

  it('recommends clarity improvement when low', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('sober thinking'))
    expect(hasRec).toBe(true)
  })

  it('recommends structure improvement when low', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('crystal organization'))
    expect(hasRec).toBe(true)
  })

  it('recommends majesty improvement when low', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('color majesty'))
    expect(hasRec).toBe(true)
  })

  it('mentions sand files when present', async () => {
    const result = await buildAmethystCrownResult(['min.ts'], [minimalContent])
    const hasRec = result.recommendations.some(r => r.includes('sand'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for all tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for known grades', () => {
    expect(typeof colorGrade('crown-jewel')).toBe('string')
    expect(typeof colorGrade('sand')).toBe('string')
    expect(typeof colorGrade('emperor')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatGemTable', () => {
  it('formats a gem with labels', () => {
    const gem = analyzeAmethystGem(richContent, 'test.ts')
    const output = formatGemTable(gem)
    expect(output).toContain('File:')
    expect(output).toContain('test.ts')
    expect(output).toContain('Depth:')
    expect(output).toContain('Score:')
  })
})

describe('formatGemsTable', () => {
  it('returns no gems message for empty array', () => {
    expect(formatGemsTable([])).toContain('No amethyst gems found')
  })

  it('formats multiple gems', () => {
    const g1 = analyzeAmethystGem(richContent, 'a.ts')
    const g2 = analyzeAmethystGem(minimalContent, 'b.ts')
    const output = formatGemsTable([g1, g2])
    expect(output).toContain('Amethyst Crown Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatCrownTable', () => {
  it('formats a crown with labels', async () => {
    const result = await buildAmethystCrownResult(['src/a.ts'], [richContent])
    const output = formatCrownTable(result.crowns[0]!)
    expect(output).toContain('Crown:')
    expect(output).toContain('Type:')
    expect(output).toContain('Condition:')
  })
})

describe('formatCrownsTable', () => {
  it('returns no crowns message for empty array', () => {
    expect(formatCrownsTable([])).toContain('No amethyst crowns found')
  })

  it('formats multiple crowns', async () => {
    const result = await buildAmethystCrownResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    const output = formatCrownsTable(result.crowns)
    expect(output).toContain('Amethyst Crown Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const result = await buildAmethystCrownResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Amethyst Crown Statistics')
    expect(output).toContain('Total Files:')
    expect(output).toContain('Overall Majesty:')
    expect(output).toContain('Monarch Grade:')
    expect(output).toContain('Best Gem:')
    expect(output).toContain('Wisest:')
    expect(output).toContain('Clearest:')
    expect(output).toContain('Best Structured:')
    expect(output).toContain('Most Elegant:')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations with bullets', () => {
    const recs = ['First recommendation', 'Second recommendation']
    const output = formatRecommendations(recs)
    expect(output).toContain('Recommendations')
    expect(output).toContain('First recommendation')
    expect(output).toContain('Second recommendation')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildAmethystCrownResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Amethyst Crown Analysis')
    expect(output).toContain('Amethyst Crown Statistics')
    expect(output).toContain('Throne')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildAmethystCrownResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.gems).toBeDefined()
    expect(parsed.crowns).toBeDefined()
    expect(parsed.throne).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Grade Boundary Tests ───────────────────────────────────────────

describe('grade boundaries', () => {
  it('DepthGrade boundaries are correct', () => {
    expect(measureDeepening('').grade).toBe('colorless')
  })

  it('SobrietyGrade boundaries are correct', () => {
    expect(measureClarifying('').sobriety).toBe('intoxicated')
  })

  it('CrystalGrade boundaries are correct', () => {
    expect(measureStructuring('').crystal).toBe('no-structure')
  })

  it('ColorGrade boundaries are correct', () => {
    expect(measureColoring('').color).toBe('no-color')
  })

  it('TransformationGrade boundaries are correct', () => {
    expect(measureTransforming('').transformation).toBe('degraded')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles eval detection correctly', () => {
    expect(measureDeepening('eval("code")').hasNoSurface).toBe(false)
    expect(measureClarifying('eval("code")').hasNoMuddled).toBe(false)
  })

  it('handles debugger detection correctly', () => {
    expect(measureDeepening('debugger').hasNoHollow).toBe(false)
    expect(measureClarifying('debugger').hasNoIncoherent).toBe(false)
  })

  it('handles mixed good and bad patterns', () => {
    const mixed = `${richContent}\nvar y: any = eval("test")\ndebugger`
    const m = measureDeepening(mixed)
    expect(m.shallowCount).toBe(1)
    expect(m.trivialCount).toBe(1)
    expect(m.hasNoSurface).toBe(false)
    expect(m.hasNoHollow).toBe(false)
  })

  it('handles deeply nested content', async () => {
    const result = await buildAmethystCrownResult(
      ['a/b/c/d.ts', 'a/b/c/e.ts'],
      [richContent, richContent],
    )
    expect(result.crowns.length).toBe(1)
    expect(result.gems.length).toBe(2)
  })

  it('handles empty content', async () => {
    const result = await buildAmethystCrownResult(['empty.ts'], [''])
    expect(result.gems[0]!.qualityScore).toBe(0)
    expect(result.gems[0]!.condition).toBe('sand')
  })

  it('handles multiple files with mixed quality', async () => {
    const result = await buildAmethystCrownResult(
      ['good.ts', 'bad.ts', 'ugly.ts'],
      [richContent, minimalContent, 'var x: any = eval("")'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.sandCount).toBeGreaterThanOrEqual(1)
  })

  it('produces unique best/worst file names', async () => {
    const result = await buildAmethystCrownResult(
      ['alpha.ts', 'beta.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestGem).toBeTruthy()
    expect(result.stats.wisest).toBeTruthy()
  })
})
