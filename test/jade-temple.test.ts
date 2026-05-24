import { describe, it, expect } from 'vitest'
import {
  measureStrengthening,
  measureDeepening,
  measureCarving,
  measureTranslucency,
  measureSymbolizing,
  classifyJadeCondition,
  classifyTempleType,
  classifyTempleCondition,
  classifyArtisanGrade,
  analyzeJadeCarving,
  analyzeJadeTemple,
  buildJadeTempleResult,
  generateRecommendations,
} from '../src/commands/jade-temple-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCarvingTable,
  formatCarvingsTable,
  formatTempleTable,
  formatTemplesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/jade-temple-format-helpers.js'

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

// ─── measureStrengthening ───────────────────────────────────────────

describe('measureStrengthening', () => {
  it('returns 0 serenity for minimal content', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.serenity).toBe(0)
  })

  it('detects calm (export + import)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasCalm).toBe(true)
  })

  it('detects steady (private + readonly)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasSteady).toBe(true)
  })

  it('detects peaceful (interface + class)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasPeaceful).toBe(true)
  })

  it('detects composed (strictEq + returnType)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasComposed).toBe(true)
  })

  it('detects serene (generics + async)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasSerene).toBe(true)
  })

  it('detects tranquil (export + generics)', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasTranquil).toBe(true)
  })

  it('has no turbulent for clean code', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasNoTurbulent).toBe(true)
    expect(m.turbulentCount).toBe(0)
  })

  it('has no chaotic for clean code', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.chaoticCount).toBe(0)
  })

  it('has no frantic when no eval', () => {
    const m = measureStrengthening(richContent)
    expect(m.hasNoFrantic).toBe(true)
  })

  it('has no restless when no debugger', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.hasNoRestless).toBe(true)
  })

  it('gives high serenity for rich content', () => {
    const m = measureStrengthening(richContent)
    expect(m.serenity).toBeGreaterThanOrEqual(70)
    expect(m.hasHighSerenity).toBe(true)
  })

  it('detects turbulent in var code', () => {
    const m = measureStrengthening('var x = 1')
    expect(m.turbulentCount).toBe(1)
    expect(m.hasNoTurbulent).toBe(false)
  })

  it('detects chaotic in any code', () => {
    const m = measureStrengthening('const x: any = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('assigns cracked-jade for very low scores', () => {
    const m = measureStrengthening(minimalContent)
    expect(m.grade).toBe('cracked-jade')
  })

  it('assigns nephrite-strong for very high scores', () => {
    const m = measureStrengthening(richContent)
    expect(m.grade).toBe('nephrite-strong')
  })

  it('caps serenity at 100', () => {
    const m = measureStrengthening(richContent)
    expect(m.serenity).toBeLessThanOrEqual(100)
  })
})

// ─── measureDeepening ───────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns low depth for minimal content', () => {
    const m = measureDeepening(minimalContent)
    expect(m.depth).toBe(8)
  })

  it('detects rich (docComments + interface)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasRich).toBe(true)
  })

  it('detects deep (generics + typeAlias)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasDeep).toBe(true)
  })

  it('detects contextual (readonly + returnType)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasContextual).toBe(true)
  })

  it('detects meaningful (strictEq + private)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasMeaningful).toBe(true)
  })

  it('detects layered (const + interface)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasLayered).toBe(true)
  })

  it('detects substantive (class + docComments)', () => {
    const m = measureDeepening(richContent)
    expect(m.hasSubstantive).toBe(true)
  })

  it('has no shallow for clean code', () => {
    const m = measureDeepening(richContent)
    expect(m.hasNoShallow).toBe(true)
    expect(m.shallowCount).toBe(0)
  })

  it('has no contextless for clean code', () => {
    const m = measureDeepening(richContent)
    expect(m.hasNoContextless).toBe(true)
    expect(m.contextlessCount).toBe(0)
  })

  it('has no hollow when no eval', () => {
    const m = measureDeepening(richContent)
    expect(m.hasNoHollow).toBe(true)
  })

  it('has no flat when no debugger', () => {
    const m = measureDeepening(minimalContent)
    expect(m.hasNoFlat).toBe(true)
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

  it('detects contextless in any code', () => {
    const m = measureDeepening('const x: any = 1')
    expect(m.contextlessCount).toBe(1)
    expect(m.hasNoContextless).toBe(false)
  })

  it('assigns no-heritage for very low scores', () => {
    const m = measureDeepening('')
    expect(m.culture).toBe('no-heritage')
  })

  it('assigns imperial-court for very high scores', () => {
    const m = measureDeepening(richContent)
    expect(m.culture).toBe('imperial-court')
  })

  it('caps depth at 100', () => {
    const m = measureDeepening(richContent)
    expect(m.depth).toBeLessThanOrEqual(100)
  })
})

// ─── measureCarving ─────────────────────────────────────────────────

describe('measureCarving', () => {
  it('returns low precision for minimal content', () => {
    const m = measureCarving(minimalContent)
    expect(m.precision).toBe(8)
  })

  it('detects precise (namedExport + export)', () => {
    const m = measureCarving(richContent)
    expect(m.hasPrecise).toBe(true)
  })

  it('detects detailed (returnType + strictEq)', () => {
    const m = measureCarving(richContent)
    expect(m.hasDetailed).toBe(true)
  })

  it('detects refined (interface + generics)', () => {
    const m = measureCarving(richContent)
    expect(m.hasRefined).toBe(true)
  })

  it('detects skilled (readonly + private)', () => {
    const m = measureCarving(richContent)
    expect(m.hasSkilled).toBe(true)
  })

  it('detects elegant (class + const)', () => {
    const m = measureCarving(richContent)
    expect(m.hasElegant).toBe(true)
  })

  it('detects delicate (namedExport + returnType)', () => {
    const m = measureCarving(richContent)
    expect(m.hasDelicate).toBe(true)
  })

  it('has no rough for clean code', () => {
    const m = measureCarving(richContent)
    expect(m.hasNoRough).toBe(true)
    expect(m.roughCount).toBe(0)
  })

  it('has no sloppy for clean code', () => {
    const m = measureCarving(richContent)
    expect(m.hasNoSloppy).toBe(true)
    expect(m.sloppyCount).toBe(0)
  })

  it('has no careless when no eval', () => {
    const m = measureCarving(richContent)
    expect(m.hasNoCareless).toBe(true)
  })

  it('has no clunky when no debugger', () => {
    const m = measureCarving(minimalContent)
    expect(m.hasNoClunky).toBe(true)
  })

  it('gives high precision for rich content', () => {
    const m = measureCarving(richContent)
    expect(m.precision).toBeGreaterThanOrEqual(70)
    expect(m.hasHighPrecision).toBe(true)
  })

  it('detects rough in var code', () => {
    const m = measureCarving('var x = 1')
    expect(m.roughCount).toBe(1)
    expect(m.hasNoRough).toBe(false)
  })

  it('detects sloppy in any code', () => {
    const m = measureCarving('const x: any = 1')
    expect(m.sloppyCount).toBe(1)
    expect(m.hasNoSloppy).toBe(false)
  })

  it('assigns uncut-stone for very low scores', () => {
    const m = measureCarving('')
    expect(m.craftsmanship).toBe('uncut-stone')
  })

  it('assigns master-carver for very high scores', () => {
    const m = measureCarving(richContent)
    expect(m.craftsmanship).toBe('master-carver')
  })

  it('caps precision at 100', () => {
    const m = measureCarving(richContent)
    expect(m.precision).toBeLessThanOrEqual(100)
  })
})

// ─── measureTranslucency ────────────────────────────────────────────

describe('measureTranslucency', () => {
  it('returns low quality for minimal content', () => {
    const m = measureTranslucency(minimalContent)
    expect(m.quality).toBe(8)
  })

  it('detects transparent (docComments + interface)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasTransparent).toBe(true)
  })

  it('detects clear (typeAlias + generics)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasClear).toBe(true)
  })

  it('detects luminous (returnType + readonly)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasLuminous).toBe(true)
  })

  it('detects glowing (private + strictEq)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasGlowing).toBe(true)
  })

  it('detects visible (const + docComments)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasVisible).toBe(true)
  })

  it('detects revealing (class + interface)', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasRevealing).toBe(true)
  })

  it('has no opaque for clean code', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.opaqueCount).toBe(0)
  })

  it('has no dark for clean code', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasNoDark).toBe(true)
    expect(m.darkCount).toBe(0)
  })

  it('has no hidden when no eval', () => {
    const m = measureTranslucency(richContent)
    expect(m.hasNoHidden).toBe(true)
  })

  it('has no concealed when no debugger', () => {
    const m = measureTranslucency(minimalContent)
    expect(m.hasNoConcealed).toBe(true)
  })

  it('gives high quality for rich content', () => {
    const m = measureTranslucency(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(70)
    expect(m.hasHighQuality).toBe(true)
  })

  it('detects opaque in var code', () => {
    const m = measureTranslucency('var x = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects dark in any code', () => {
    const m = measureTranslucency('const x: any = 1')
    expect(m.darkCount).toBe(1)
    expect(m.hasNoDark).toBe(false)
  })

  it('assigns dead-rock for very low scores', () => {
    const m = measureTranslucency('')
    expect(m.glow).toBe('dead-rock')
  })

  it('assigns imperial-glow for very high scores', () => {
    const m = measureTranslucency(richContent)
    expect(m.glow).toBe('imperial-glow')
  })

  it('caps quality at 100', () => {
    const m = measureTranslucency(richContent)
    expect(m.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureSymbolizing ─────────────────────────────────────────────

describe('measureSymbolizing', () => {
  it('returns low wisdom for minimal content', () => {
    const m = measureSymbolizing(minimalContent)
    expect(m.wisdom).toBe(8)
  })

  it('detects meaningful (returnType + strictEq)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasMeaningful).toBe(true)
  })

  it('detects symbolic (readonly + private)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasSymbolic).toBe(true)
  })

  it('detects expressive (interface + generics)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasExpressive).toBe(true)
  })

  it('detects abstract (typeAlias + docComments)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasAbstract).toBe(true)
  })

  it('detects representative (class + returnType)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasRepresentative).toBe(true)
  })

  it('detects wise (const + strictEq)', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasWise).toBe(true)
  })

  it('has no arbitrary for clean code', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasNoArbitrary).toBe(true)
    expect(m.arbitraryCount).toBe(0)
  })

  it('has no random for clean code', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasNoRandom).toBe(true)
    expect(m.randomCount).toBe(0)
  })

  it('has no confusing when no eval', () => {
    const m = measureSymbolizing(richContent)
    expect(m.hasNoConfusing).toBe(true)
  })

  it('has no opaque2 when no debugger', () => {
    const m = measureSymbolizing(minimalContent)
    expect(m.hasNoOpaque2).toBe(true)
  })

  it('gives high wisdom for rich content', () => {
    const m = measureSymbolizing(richContent)
    expect(m.wisdom).toBeGreaterThanOrEqual(70)
    expect(m.hasHighWisdom).toBe(true)
  })

  it('detects arbitrary in var code', () => {
    const m = measureSymbolizing('var x = 1')
    expect(m.arbitraryCount).toBe(1)
    expect(m.hasNoArbitrary).toBe(false)
  })

  it('detects random in any code', () => {
    const m = measureSymbolizing('const x: any = 1')
    expect(m.randomCount).toBe(1)
    expect(m.hasNoRandom).toBe(false)
  })

  it('assigns no-symbol for very low scores', () => {
    const m = measureSymbolizing('')
    expect(m.symbol).toBe('no-symbol')
  })

  it('assigns ancient-sage for very high scores', () => {
    const m = measureSymbolizing(richContent)
    expect(m.symbol).toBe('ancient-sage')
  })

  it('caps wisdom at 100', () => {
    const m = measureSymbolizing(richContent)
    expect(m.wisdom).toBeLessThanOrEqual(100)
  })
})

// ─── classifyJadeCondition ──────────────────────────────────────────

describe('classifyJadeCondition', () => {
  it('returns imperial-jade for 85+', () => {
    expect(classifyJadeCondition(90)).toBe('imperial-jade')
  })
  it('returns fine-jadeite for 70-84', () => {
    expect(classifyJadeCondition(75)).toBe('fine-jadeite')
  })
  it('returns proper-nephrite for 55-69', () => {
    expect(classifyJadeCondition(60)).toBe('proper-nephrite')
  })
  it('returns common-jade for 40-54', () => {
    expect(classifyJadeCondition(45)).toBe('common-jade')
  })
  it('returns serpentine for 25-39', () => {
    expect(classifyJadeCondition(30)).toBe('serpentine')
  })
  it('returns river-stone for below 25', () => {
    expect(classifyJadeCondition(10)).toBe('river-stone')
  })
})

// ─── classifyTempleType ─────────────────────────────────────────────

describe('classifyTempleType', () => {
  it('returns no-temple for empty array', () => {
    expect(classifyTempleType([])).toBe('no-temple')
  })
})

// ─── classifyTempleCondition ────────────────────────────────────────

describe('classifyTempleCondition', () => {
  it('returns imperial-collection for 75+', () => {
    expect(classifyTempleCondition(80)).toBe('imperial-collection')
  })
  it('returns fine-gallery for 60-74', () => {
    expect(classifyTempleCondition(65)).toBe('fine-gallery')
  })
  it('returns decent-display for 45-59', () => {
    expect(classifyTempleCondition(50)).toBe('decent-display')
  })
  it('returns common-shop for 30-44', () => {
    expect(classifyTempleCondition(35)).toBe('common-shop')
  })
  it('returns flea-market for 15-29', () => {
    expect(classifyTempleCondition(20)).toBe('flea-market')
  })
  it('returns empty for below 15', () => {
    expect(classifyTempleCondition(5)).toBe('empty')
  })
})

// ─── classifyArtisanGrade ───────────────────────────────────────────

describe('classifyArtisanGrade', () => {
  it('returns jade-emperor for 80+', () => {
    expect(classifyArtisanGrade(85)).toBe('jade-emperor')
  })
  it('returns master-artisan for 65-79', () => {
    expect(classifyArtisanGrade(70)).toBe('master-artisan')
  })
  it('returns skilled-carver for 50-64', () => {
    expect(classifyArtisanGrade(55)).toBe('skilled-carver')
  })
  it('returns apprentice for 35-49', () => {
    expect(classifyArtisanGrade(40)).toBe('apprentice')
  })
  it('returns novice for 20-34', () => {
    expect(classifyArtisanGrade(25)).toBe('novice')
  })
  it('returns stone-mason for below 20', () => {
    expect(classifyArtisanGrade(10)).toBe('stone-mason')
  })
})

// ─── analyzeJadeCarving ─────────────────────────────────────────────

describe('analyzeJadeCarving', () => {
  it('returns a carving with correct file path', () => {
    const carving = analyzeJadeCarving(minimalContent, 'index.ts')
    expect(carving.file).toBe('index.ts')
  })

  it('calculates qualityScore correctly for minimal content', () => {
    const carving = analyzeJadeCarving(minimalContent, 'index.ts')
    expect(carving.qualityScore).toBe(6)
  })

  it('classifies minimal content as river-stone', () => {
    const carving = analyzeJadeCarving(minimalContent, 'index.ts')
    expect(carving.condition).toBe('river-stone')
  })

  it('has all measure fields', () => {
    const carving = analyzeJadeCarving(minimalContent, 'index.ts')
    expect(carving).toHaveProperty('strengthening')
    expect(carving).toHaveProperty('deepening')
    expect(carving).toHaveProperty('carving')
    expect(carving).toHaveProperty('translucency')
    expect(carving).toHaveProperty('symbolizing')
  })

  it('returns high qualityScore for rich content', () => {
    const carving = analyzeJadeCarving(richContent, 'rich.ts')
    expect(carving.qualityScore).toBeGreaterThanOrEqual(60)
  })

  it('classifies rich content as imperial-jade', () => {
    const carving = analyzeJadeCarving(richContent, 'rich.ts')
    expect(carving.condition).toBe('imperial-jade')
  })

  it('has all score fields', () => {
    const carving = analyzeJadeCarving(minimalContent, 'index.ts')
    expect(typeof carving.serenityStrength).toBe('number')
    expect(typeof carving.culturalDepth).toBe('number')
    expect(typeof carving.carvingPrecision).toBe('number')
    expect(typeof carving.translucencyQuality).toBe('number')
    expect(typeof carving.symbolicWisdom).toBe('number')
  })
})

// ─── analyzeJadeTemple ──────────────────────────────────────────────

describe('analyzeJadeTemple', () => {
  it('returns empty temple for no carvings', () => {
    const temple = analyzeJadeTemple([], 'src')
    expect(temple.directory).toBe('src')
    expect(temple.carvings.length).toBe(0)
    expect(temple.avgSerenity).toBe(0)
    expect(temple.avgDepth).toBe(0)
    expect(temple.avgPrecision).toBe(0)
    expect(temple.templeType).toBe('no-temple')
    expect(temple.condition).toBe('empty')
  })

  it('computes averages from carvings', () => {
    const c1 = analyzeJadeCarving(richContent, 'a.ts')
    const c2 = analyzeJadeCarving(richContent, 'b.ts')
    const temple = analyzeJadeTemple([c1, c2], 'src')
    expect(temple.avgSerenity).toBe(c1.serenityStrength)
    expect(temple.avgDepth).toBe(c1.culturalDepth)
  })
})

// ─── buildJadeTempleResult ──────────────────────────────────────────

describe('buildJadeTempleResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildJadeTempleResult([], [])
    expect(result.carvings.length).toBe(0)
    expect(result.temples.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalTemples).toBe(0)
    expect(result.dynasty.isImperial).toBe(false)
    expect(result.dynasty.overallHarmony).toBe(0)
  })

  it('returns correct structure for single file', async () => {
    const result = await buildJadeTempleResult(['index.ts'], [richContent])
    expect(result.carvings.length).toBe(1)
    expect(result.temples.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.bestCarving).toBe('index.ts')
    expect(result.stats.mostSerene).toBe('index.ts')
    expect(result.stats.deepest).toBe('index.ts')
    expect(result.stats.mostPrecise).toBe('index.ts')
    expect(result.stats.mostLuminous).toBe('index.ts')
  })

  it('computes dynasty.isImperial when avgSerenity >= 60', async () => {
    const result = await buildJadeTempleResult(['rich.ts'], [richContent])
    expect(result.dynasty.isImperial).toBe(true)
  })

  it('computes overallHarmony as avg of serenity+depth+precision/3', async () => {
    const result = await buildJadeTempleResult(['rich.ts'], [richContent])
    const expectedHarmony = Math.round(
      (result.dynasty.avgSerenity + result.dynasty.avgDepth + result.dynasty.avgPrecision) / 3,
    )
    expect(result.dynasty.overallHarmony).toBe(expectedHarmony)
  })

  it('counts condition categories correctly', async () => {
    const result = await buildJadeTempleResult(
      ['rich.ts', 'min.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.imperialJadeCount + result.stats.fineJadeiteCount +
      result.stats.properNephriteCount + result.stats.commonJadeCount +
      result.stats.serpentineCount + result.stats.riverStoneCount).toBe(2)
  })

  it('counts high measure flags correctly', async () => {
    const result = await buildJadeTempleResult(['rich.ts'], [richContent])
    expect(result.stats.hasHighSerenityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighDepthCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighPrecisionCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighQualityCount).toBeGreaterThanOrEqual(1)
    expect(result.stats.hasHighWisdomCount).toBeGreaterThanOrEqual(1)
  })

  it('groups files by directory into temples', async () => {
    const result = await buildJadeTempleResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.temples.length).toBe(2)
  })

  it('sets artisanGrade based on overallHarmony', async () => {
    const result = await buildJadeTempleResult(['rich.ts'], [richContent])
    expect(result.stats.artisanGrade).toBe(classifyArtisanGrade(result.dynasty.overallHarmony))
  })

  it('returns minimal content qualityScore of 6', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    expect(result.carvings[0]!.qualityScore).toBe(6)
  })

  it('returns recommendations array', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message when all metrics are good', async () => {
    const result = await buildJadeTempleResult(['rich.ts'], [richContent])
    expect(result.recommendations).toContain(
      'Your jade collection is jade-emperor quality! Every carving radiates imperial harmony',
    )
  })

  it('recommends serenity improvement when low', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    const hasSerenityRec = result.recommendations.some(r => r.includes('serenity'))
    expect(hasSerenityRec).toBe(true)
  })

  it('recommends precision improvement when low', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    const hasPrecisionRec = result.recommendations.some(r => r.includes('carving precision'))
    expect(hasPrecisionRec).toBe(true)
  })

  it('recommends translucency improvement when low', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    const hasTranslucencyRec = result.recommendations.some(r => r.includes('translucency'))
    expect(hasTranslucencyRec).toBe(true)
  })

  it('recommends wisdom improvement when low', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    const hasWisdomRec = result.recommendations.some(r => r.includes('symbolic wisdom'))
    expect(hasWisdomRec).toBe(true)
  })

  it('mentions river-stone files when present', async () => {
    const result = await buildJadeTempleResult(['min.ts'], [minimalContent])
    const hasRiverStoneRec = result.recommendations.some(r => r.includes('river-stone'))
    expect(hasRiverStoneRec).toBe(true)
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
    expect(typeof colorGrade('imperial-jade')).toBe('string')
    expect(typeof colorGrade('river-stone')).toBe('string')
    expect(typeof colorGrade('jade-emperor')).toBe('string')
  })

  it('returns a string for unknown grades', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatCarvingTable', () => {
  it('formats a carving with labels', () => {
    const carving = analyzeJadeCarving(richContent, 'test.ts')
    const output = formatCarvingTable(carving)
    expect(output).toContain('File:')
    expect(output).toContain('test.ts')
    expect(output).toContain('Serenity:')
    expect(output).toContain('Score:')
  })
})

describe('formatCarvingsTable', () => {
  it('returns no carvings message for empty array', () => {
    expect(formatCarvingsTable([])).toContain('No jade carvings found')
  })

  it('formats multiple carvings', () => {
    const c1 = analyzeJadeCarving(richContent, 'a.ts')
    const c2 = analyzeJadeCarving(minimalContent, 'b.ts')
    const output = formatCarvingsTable([c1, c2])
    expect(output).toContain('Jade Temple Analysis')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatTempleTable', () => {
  it('formats a temple with labels', async () => {
    const result = await buildJadeTempleResult(['src/a.ts'], [richContent])
    const output = formatTempleTable(result.temples[0]!)
    expect(output).toContain('Temple:')
    expect(output).toContain('Type:')
    expect(output).toContain('Condition:')
  })
})

describe('formatTemplesTable', () => {
  it('returns no temples message for empty array', () => {
    expect(formatTemplesTable([])).toContain('No jade temples found')
  })

  it('formats multiple temples', async () => {
    const result = await buildJadeTempleResult(
      ['src/a.ts', 'lib/b.ts'],
      [richContent, richContent],
    )
    const output = formatTemplesTable(result.temples)
    expect(output).toContain('Jade Temple Analysis')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all labels', async () => {
    const result = await buildJadeTempleResult(['test.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Jade Temple Statistics')
    expect(output).toContain('Total Files:')
    expect(output).toContain('Overall Harmony:')
    expect(output).toContain('Artisan Grade:')
    expect(output).toContain('Best Carving:')
    expect(output).toContain('Most Serene:')
    expect(output).toContain('Deepest:')
    expect(output).toContain('Most Precise:')
    expect(output).toContain('Most Luminous:')
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
    const result = await buildJadeTempleResult(['test.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Jade Temple Analysis')
    expect(output).toContain('Jade Temple Statistics')
    expect(output).toContain('Dynasty')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildJadeTempleResult(['test.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.carvings).toBeDefined()
    expect(parsed.temples).toBeDefined()
    expect(parsed.dynasty).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})

// ─── Grade Boundary Tests ───────────────────────────────────────────

describe('grade boundaries', () => {
  it('SerenityGrade boundaries are correct', () => {
    expect(measureStrengthening('').grade).toBe('cracked-jade')
  })

  it('CultureGrade boundaries are correct', () => {
    expect(measureDeepening('').culture).toBe('no-heritage')
  })

  it('CraftsmanshipGrade boundaries are correct', () => {
    expect(measureCarving('').craftsmanship).toBe('uncut-stone')
  })

  it('GlowGrade boundaries are correct', () => {
    expect(measureTranslucency('').glow).toBe('dead-rock')
  })

  it('SymbolGrade boundaries are correct', () => {
    expect(measureSymbolizing('').symbol).toBe('no-symbol')
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles eval detection correctly', () => {
    const m = measureStrengthening('eval("code")')
    expect(m.hasNoFrantic).toBe(false)
  })

  it('handles debugger detection correctly', () => {
    const m = measureStrengthening('debugger')
    expect(m.hasNoRestless).toBe(false)
  })

  it('handles mixed good and bad patterns', () => {
    const mixed = `${richContent}\nvar y: any = eval("test")\ndebugger`
    const m = measureStrengthening(mixed)
    expect(m.turbulentCount).toBe(1)
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoFrantic).toBe(false)
    expect(m.hasNoRestless).toBe(false)
  })

  it('handles deeply nested content', async () => {
    const result = await buildJadeTempleResult(
      ['a/b/c/d.ts', 'a/b/c/e.ts'],
      [richContent, richContent],
    )
    expect(result.temples.length).toBe(1)
    expect(result.carvings.length).toBe(2)
  })

  it('handles empty content', async () => {
    const result = await buildJadeTempleResult(['empty.ts'], [''])
    expect(result.carvings[0]!.qualityScore).toBe(0)
    expect(result.carvings[0]!.condition).toBe('river-stone')
  })

  it('handles multiple files with mixed quality', async () => {
    const result = await buildJadeTempleResult(
      ['good.ts', 'bad.ts', 'ugly.ts'],
      [richContent, minimalContent, 'var x: any = eval("")'],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.riverStoneCount).toBeGreaterThanOrEqual(1)
  })

  it('produces unique best/worst file names', async () => {
    const result = await buildJadeTempleResult(
      ['alpha.ts', 'beta.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.bestCarving).toBeTruthy()
    expect(result.stats.mostSerene).toBeTruthy()
  })
})
