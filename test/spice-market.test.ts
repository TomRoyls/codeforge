import { describe, expect, it } from 'vitest'

import {
  measureAroma,
  measureFlavor,
  measureHeat,
  measureRarity,
  measureBlend,
  measureTrade,
  buildSpiceMarketResult,
  classifyMarketType,
  classifyMerchantGrade,
  countExports,
  countImports,
  countFunctions,
  countArrows,
  countClasses,
  countInterfaces,
  countTypeAliases,
  countEnums,
  countComments,
  countStrings,
  countDecorators,
  countAsync,
  countGenerics,
  countNestedBlocks,
  countTernaries,
  countNullish,
  countOptionalChain,
  countDefaultParams,
  countUnionTypes,
  countIntersections,
  countMappedTypes,
  countConditionalTypes,
  countUtilityTypes,
  countReexports,
  countDynamicImports,
  countNamespaces,
  countAbstracts,
  countOverrides,
  countConstAssertions,
  countTypeGuards,
  countAccessModifiers,
  countReadonly,
  countStatic,
  countSpreads,
  countDestructures,
  countAwaits,
  countYields,
  countThrows,
  countTryCatch,
  countPromises,
  countSets,
  countMaps,
} from '../src/commands/spice-market-helpers.js'

import {
  formatSpiceMarketJson,
  formatSpiceMarketTable,
  scoreColor,
  marketTypeColor,
  gradeColor,
  aromaTypeColor,
  rarityGradeColor,
} from '../src/commands/spice-market-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const EMPTY = ''

const SIMPLE = 'const x = 1'

const RICH = `export function foo(a: string): number { return a.length }
export function bar(b: number): string { return String(b) }
export function baz(): void { return }
export interface IFoo { a: string; b: number }
export interface IBar { c: boolean }
export type TResult = IFoo | IBar
type THelper = { x: number } & { y: string }
class MyClass {
  private x: number = 1
  protected y: string = 'hello'
  public z: boolean = true
  static w: number = 42
  readonly r: number = 10
}
abstract class Base {
  abstract method(): void
}
enum Color { Red, Green, Blue }
namespace NS { export const x = 1 }
import { something } from 'somewhere'
export { reexported } from 'other'
import('dynamic')
async function af() { await Promise.resolve(1) }
const f = () => 1
const g = (x: number) => x + 1
try { af() } catch (e) { throw new Error('fail') }
const obj = { a: 1, b: 2 }
const { a, b } = obj
const arr = [1, 2, 3]
const [first, ...rest] = arr
function def(x = 10, y = 20) { return x + y }
const val = x ?? y
const chain = obj?.a?.b
const cond = cond ? 1 : 0
type Mapped = { [K in keyof TResult]: TResult[K] }
type Cond = TResult extends IFoo ? 'yes' : 'no'
type Util = Partial<TResult>
const asConst = { a: 1 } as const
if (typeof x === 'string') {}
`

// ─── Counter Tests ─────────────────────────────────────────────────────────

describe('spice-market counters', () => {
  it('countExports counts export keywords', () => {
    expect(countExports(RICH)).toBeGreaterThan(0)
    expect(countExports(EMPTY)).toBe(0)
  })

  it('countImports counts import keywords', () => {
    expect(countImports(RICH)).toBeGreaterThan(0)
    expect(countImports(EMPTY)).toBe(0)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(RICH)).toBeGreaterThanOrEqual(4)
    expect(countFunctions(EMPTY)).toBe(0)
  })

  it('countArrows counts arrow functions', () => {
    expect(countArrows(RICH)).toBeGreaterThanOrEqual(2)
    expect(countArrows(EMPTY)).toBe(0)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(RICH)).toBeGreaterThanOrEqual(2)
    expect(countClasses(EMPTY)).toBe(0)
  })

  it('countInterfaces counts interface declarations', () => {
    expect(countInterfaces(RICH)).toBeGreaterThanOrEqual(2)
    expect(countInterfaces(EMPTY)).toBe(0)
  })

  it('countTypeAliases counts type aliases', () => {
    expect(countTypeAliases(RICH)).toBeGreaterThanOrEqual(5)
    expect(countTypeAliases(EMPTY)).toBe(0)
  })

  it('countEnums counts enum declarations', () => {
    expect(countEnums(RICH)).toBe(1)
    expect(countEnums(EMPTY)).toBe(0)
  })

  it('countComments counts line and block comments', () => {
    expect(countComments('// hello\n/* world */')).toBe(2)
    expect(countComments(EMPTY)).toBe(0)
  })

  it('countStrings counts quoted and template strings', () => {
    expect(countStrings("'hello'")).toBeGreaterThanOrEqual(1)
    expect(countStrings(EMPTY)).toBe(0)
  })

  it('countDecorators counts decorators', () => {
    expect(countDecorators('@Injectable()')).toBe(1)
    expect(countDecorators(EMPTY)).toBe(0)
  })

  it('countAsync counts async keywords', () => {
    expect(countAsync(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAsync(EMPTY)).toBe(0)
  })

  it('countGenerics counts generic parameters', () => {
    expect(countGenerics(RICH)).toBeGreaterThan(0)
    expect(countGenerics(EMPTY)).toBe(0)
  })

  it('countAwaits counts await keywords', () => {
    expect(countAwaits(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAwaits(EMPTY)).toBe(0)
  })

  it('countThrows counts throw keywords', () => {
    expect(countThrows(RICH)).toBeGreaterThanOrEqual(1)
    expect(countThrows(EMPTY)).toBe(0)
  })

  it('countTryCatch counts try blocks', () => {
    expect(countTryCatch(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTryCatch(EMPTY)).toBe(0)
  })

  it('countPromises counts Promise references', () => {
    expect(countPromises(RICH)).toBeGreaterThanOrEqual(1)
    expect(countPromises(EMPTY)).toBe(0)
  })

  it('countSpreads counts spread operators', () => {
    expect(countSpreads(RICH)).toBeGreaterThanOrEqual(1)
    expect(countSpreads(EMPTY)).toBe(0)
  })

  it('countDestructures counts destructuring patterns', () => {
    expect(countDestructures(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDestructures(EMPTY)).toBe(0)
  })

  it('countReexports counts re-export statements', () => {
    expect(countReexports(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReexports(EMPTY)).toBe(0)
  })

  it('countDynamicImports counts dynamic import calls', () => {
    expect(countDynamicImports(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDynamicImports(EMPTY)).toBe(0)
  })

  it('countNamespaces counts namespace declarations', () => {
    expect(countNamespaces(RICH)).toBeGreaterThanOrEqual(1)
    expect(countNamespaces(EMPTY)).toBe(0)
  })

  it('countAbstracts counts abstract keywords', () => {
    expect(countAbstracts(RICH)).toBeGreaterThanOrEqual(1)
    expect(countAbstracts(EMPTY)).toBe(0)
  })

  it('countAccessModifiers counts private/protected/public', () => {
    expect(countAccessModifiers(RICH)).toBeGreaterThanOrEqual(3)
    expect(countAccessModifiers(EMPTY)).toBe(0)
  })

  it('countReadonly counts readonly keywords', () => {
    expect(countReadonly(RICH)).toBeGreaterThanOrEqual(1)
    expect(countReadonly(EMPTY)).toBe(0)
  })

  it('countStatic counts static keywords', () => {
    expect(countStatic(RICH)).toBeGreaterThanOrEqual(1)
    expect(countStatic(EMPTY)).toBe(0)
  })

  it('countConstAssertions counts as const', () => {
    expect(countConstAssertions(RICH)).toBeGreaterThanOrEqual(1)
    expect(countConstAssertions(EMPTY)).toBe(0)
  })

  it('countTypeGuards counts typeof/instanceof', () => {
    expect(countTypeGuards(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTypeGuards(EMPTY)).toBe(0)
  })

  it('countUnionTypes counts union types', () => {
    expect(countUnionTypes(RICH)).toBeGreaterThanOrEqual(1)
    expect(countUnionTypes(EMPTY)).toBe(0)
  })

  it('countIntersections counts intersection types', () => {
    expect(countIntersections('type X = A & B')).toBeGreaterThanOrEqual(1)
    expect(countIntersections(EMPTY)).toBe(0)
  })

  it('countMappedTypes counts mapped types', () => {
    expect(countMappedTypes(RICH)).toBeGreaterThanOrEqual(1)
    expect(countMappedTypes(EMPTY)).toBe(0)
  })

  it('countConditionalTypes counts conditional types', () => {
    expect(countConditionalTypes(RICH)).toBeGreaterThanOrEqual(1)
    expect(countConditionalTypes(EMPTY)).toBe(0)
  })

  it('countUtilityTypes counts utility types', () => {
    expect(countUtilityTypes(RICH)).toBeGreaterThanOrEqual(1)
    expect(countUtilityTypes(EMPTY)).toBe(0)
  })

  it('countNullish counts nullish coalescing', () => {
    expect(countNullish(RICH)).toBeGreaterThanOrEqual(1)
    expect(countNullish(EMPTY)).toBe(0)
  })

  it('countOptionalChain counts optional chaining', () => {
    expect(countOptionalChain(RICH)).toBeGreaterThanOrEqual(1)
    expect(countOptionalChain(EMPTY)).toBe(0)
  })

  it('countTernaries counts ternary expressions', () => {
    expect(countTernaries(RICH)).toBeGreaterThanOrEqual(1)
    expect(countTernaries(EMPTY)).toBe(0)
  })

  it('countDefaultParams counts default parameters', () => {
    expect(countDefaultParams(RICH)).toBeGreaterThanOrEqual(1)
    expect(countDefaultParams(EMPTY)).toBe(0)
  })

  it('countNestedBlocks counts nested blocks', () => {
    expect(countNestedBlocks(EMPTY)).toBe(0)
  })

  it('countYields counts yield keywords', () => {
    expect(countYields(EMPTY)).toBe(0)
  })

  it('countOverrides counts override keywords', () => {
    expect(countOverrides(EMPTY)).toBe(0)
  })

  it('countSets counts Set references', () => {
    expect(countSets(EMPTY)).toBe(0)
  })

  it('countMaps counts Map references', () => {
    expect(countMaps(EMPTY)).toBe(0)
  })
})

// ─── MeasureAroma Tests ────────────────────────────────────────────────────

describe('measureAroma', () => {
  it('returns odorless for empty content', () => {
    const m = measureAroma(EMPTY)
    expect(m.potency).toBe(5)
    expect(m.type).toBe('odorless')
    expect(m.isPotent).toBe(false)
    expect(m.hasRichScent).toBe(false)
    expect(m.hasNoBitterNotes).toBe(true)
    expect(m.hasExoticNotes).toBe(false)
    expect(m.hasEarthyUndertones).toBe(false)
    expect(m.hasFloralOvertones).toBe(false)
    expect(m.hasSpiceBouquet).toBe(false)
    expect(m.hasCleanFinish).toBe(true)
    expect(m.hasComplexProfile).toBe(false)
    expect(m.noteCount).toBe(0)
  })

  it('returns faint for RICH content', () => {
    const m = measureAroma(RICH)
    expect(m.potency).toBe(32)
    expect(m.type).toBe('faint')
    expect(m.isPotent).toBe(false)
    expect(m.hasRichScent).toBe(true)
    expect(m.hasExoticNotes).toBe(true)
    expect(m.hasEarthyUndertones).toBe(true)
    expect(m.hasComplexProfile).toBe(true)
    expect(m.noteCount).toBe(19)
  })
})

// ─── MeasureFlavor Tests ───────────────────────────────────────────────────

describe('measureFlavor', () => {
  it('returns tasteless for empty content', () => {
    const m = measureFlavor(EMPTY)
    expect(m.depth).toBe(5)
    expect(m.profile).toBe('tasteless')
    expect(m.isRich).toBe(false)
    expect(m.hasUmami).toBe(false)
    expect(m.hasNoAftertaste).toBe(true)
    expect(m.hasComplexPalate).toBe(false)
    expect(m.hasBalancedSeasoning).toBe(false)
    expect(m.hasDistinctiveNotes).toBe(false)
    expect(m.hasDepth).toBe(false)
    expect(m.hasSubtleLayering).toBe(false)
    expect(m.hasHarmoniousBlend).toBe(false)
    expect(m.layerCount).toBe(0)
  })

  it('returns seasoned for RICH content', () => {
    const m = measureFlavor(RICH)
    expect(m.depth).toBe(50)
    expect(m.profile).toBe('seasoned')
    expect(m.hasComplexPalate).toBe(true)
    expect(m.hasBalancedSeasoning).toBe(true)
    expect(m.hasDistinctiveNotes).toBe(true)
    expect(m.hasDepth).toBe(true)
    expect(m.hasSubtleLayering).toBe(true)
    expect(m.layerCount).toBe(21)
  })
})

// ─── MeasureHeat Tests ─────────────────────────────────────────────────────

describe('measureHeat', () => {
  it('returns cool for empty content', () => {
    const m = measureHeat(EMPTY)
    expect(m.intensity).toBe(5)
    expect(m.level).toBe('cool')
    expect(m.isIntense).toBe(false)
    expect(m.hasHighScoville).toBe(false)
    expect(m.hasNoBurnout).toBe(true)
    expect(m.hasControlledFlame).toBe(false)
    expect(m.hasSlowBurn).toBe(false)
    expect(m.hasFlashFire).toBe(false)
    expect(m.hasSmokyCharacter).toBe(false)
    expect(m.hasPepperyKick).toBe(false)
    expect(m.hasGentleWarmth).toBe(false)
    expect(m.scovilleCount).toBe(0)
  })

  it('returns warm for RICH content', () => {
    const m = measureHeat(RICH)
    expect(m.intensity).toBe(26)
    expect(m.level).toBe('warm')
    expect(m.hasNoBurnout).toBe(true)
    expect(m.hasControlledFlame).toBe(true)
    expect(m.hasGentleWarmth).toBe(true)
    expect(m.scovilleCount).toBe(10)
  })
})

// ─── MeasureRarity Tests ───────────────────────────────────────────────────

describe('measureRarity', () => {
  it('returns salt for empty content', () => {
    const m = measureRarity(EMPTY)
    expect(m.value).toBe(5)
    expect(m.grade).toBe('salt')
    expect(m.isRare).toBe(false)
    expect(m.hasExoticSpice).toBe(false)
    expect(m.hasNoCommonFiller).toBe(false)
    expect(m.hasPremiumGrade).toBe(false)
    expect(m.hasArtisanalQuality).toBe(false)
    expect(m.hasHeirloomVariety).toBe(false)
    expect(m.hasSingleOrigin).toBe(false)
    expect(m.hasHandPickedCode).toBe(false)
    expect(m.hasSmallBatch).toBe(false)
    expect(m.exoticCount).toBe(0)
  })

  it('returns cinnamon for RICH content', () => {
    const m = measureRarity(RICH)
    expect(m.value).toBe(35)
    expect(m.grade).toBe('cinnamon')
    expect(m.hasExoticSpice).toBe(true)
    expect(m.hasNoCommonFiller).toBe(true)
    expect(m.hasPremiumGrade).toBe(true)
    expect(m.hasArtisanalQuality).toBe(true)
    expect(m.hasHeirloomVariety).toBe(true)
    expect(m.hasSingleOrigin).toBe(true)
    expect(m.exoticCount).toBe(7)
  })
})

// ─── MeasureBlend Tests ────────────────────────────────────────────────────

describe('measureBlend', () => {
  it('returns raw for empty content', () => {
    const m = measureBlend(EMPTY)
    expect(m.harmony).toBe(5)
    expect(m.style).toBe('raw')
    expect(m.isHarmonious).toBe(false)
    expect(m.hasSmoothTexture).toBe(false)
    expect(m.hasNoClumping).toBe(true)
    expect(m.hasEvenDistribution).toBe(false)
    expect(m.hasProperRatios).toBe(false)
    expect(m.hasBalancedFlavors).toBe(false)
    expect(m.hasComplementaryPairings).toBe(false)
    expect(m.hasNoOverpowering).toBe(true)
    expect(m.hasConsistentGrind).toBe(false)
    expect(m.pairingCount).toBe(0)
  })

  it('returns balanced for RICH content', () => {
    const m = measureBlend(RICH)
    expect(m.harmony).toBe(45)
    expect(m.style).toBe('balanced')
    expect(m.hasSmoothTexture).toBe(true)
    expect(m.hasEvenDistribution).toBe(true)
    expect(m.hasProperRatios).toBe(true)
    expect(m.hasBalancedFlavors).toBe(true)
    expect(m.hasComplementaryPairings).toBe(true)
    expect(m.hasNoOverpowering).toBe(true)
    expect(m.hasConsistentGrind).toBe(true)
    expect(m.pairingCount).toBe(11)
  })
})

// ─── MeasureTrade Tests ────────────────────────────────────────────────────

describe('measureTrade', () => {
  it('returns closed for empty content', () => {
    const m = measureTrade(EMPTY)
    expect(m.volume).toBe(5)
    expect(m.route).toBe('closed')
    expect(m.isHighVolume).toBe(false)
    expect(m.hasFairTrade).toBe(false)
    expect(m.hasNoContraband).toBe(true)
    expect(m.hasOpenMarkets).toBe(false)
    expect(m.hasDiverseImports).toBe(false)
    expect(m.hasQualityExports).toBe(false)
    expect(m.hasBalancedTrade).toBe(true)
    expect(m.hasTradeAgreements).toBe(false)
    expect(m.hasMonopolyFree).toBe(false)
    expect(m.importCount).toBe(0)
  })

  it('returns local-market for RICH content', () => {
    const m = measureTrade(RICH)
    expect(m.volume).toBe(35)
    expect(m.route).toBe('local-market')
    expect(m.hasFairTrade).toBe(true)
    expect(m.hasOpenMarkets).toBe(true)
    expect(m.hasQualityExports).toBe(true)
    expect(m.hasTradeAgreements).toBe(true)
    expect(m.hasMonopolyFree).toBe(true)
    expect(m.importCount).toBe(3)
  })
})

// ─── Classification Tests ──────────────────────────────────────────────────

describe('classifyMarketType', () => {
  it('classifies grand-bazaar for high score with intoxicating aroma', () => {
    expect(classifyMarketType(85, 'intoxicating')).toBe('grand-bazaar')
  })

  it('classifies spice-souk for score >= 70', () => {
    expect(classifyMarketType(75, 'fragrant')).toBe('spice-souk')
  })

  it('classifies trading-post for score >= 50', () => {
    expect(classifyMarketType(50, 'mild')).toBe('trading-post')
  })

  it('classifies roadside-stand for score >= 30', () => {
    expect(classifyMarketType(30, 'faint')).toBe('roadside-stand')
  })

  it('classifies market-stall for score >= 15', () => {
    expect(classifyMarketType(15, 'stale')).toBe('market-stall')
  })

  it('classifies closed-shop for low score', () => {
    expect(classifyMarketType(5, 'odorless')).toBe('closed-shop')
  })
})

describe('classifyMerchantGrade', () => {
  it('classifies grand-vizier for score >= 85', () => {
    expect(classifyMerchantGrade(90)).toBe('grand-vizier')
  })

  it('classifies master-spice-merchant for score >= 70', () => {
    expect(classifyMerchantGrade(75)).toBe('master-spice-merchant')
  })

  it('classifies caravan-leader for score >= 55', () => {
    expect(classifyMerchantGrade(60)).toBe('caravan-leader')
  })

  it('classifies spice-trader for score >= 40', () => {
    expect(classifyMerchantGrade(45)).toBe('spice-trader')
  })

  it('classifies street-vendor for score >= 25', () => {
    expect(classifyMerchantGrade(30)).toBe('street-vendor')
  })

  it('classifies wandering-merchant for low score', () => {
    expect(classifyMerchantGrade(10)).toBe('wandering-merchant')
  })
})

// ─── BuildSpiceMarketResult Tests ──────────────────────────────────────────

describe('buildSpiceMarketResult', () => {
  it('handles empty file list', () => {
    const result = buildSpiceMarketResult([], [])
    expect(result.stalls).toHaveLength(0)
    expect(result.stats.totalStalls).toBe(0)
    expect(result.stats.totalSpices).toBe(0)
    expect(result.stats.overallFlavorScore).toBe(0)
    expect(result.stats.merchantGrade).toBe('wandering-merchant')
    expect(result.stats.marketType).toBe('closed-shop')
  })

  it('computes correct stats for 3-file mix', () => {
    const result = buildSpiceMarketResult(['a.ts', 'b.ts', 'c.ts'], [RICH, SIMPLE, EMPTY])
    expect(result.stalls).toHaveLength(3)
    expect(result.stats.totalStalls).toBe(3)
    expect(result.stats.totalSpices).toBe(72)
    expect(result.stats.overallFlavorScore).toBe(16)
    expect(result.stats.merchantGrade).toBe('wandering-merchant')
    expect(result.stats.marketType).toBe('market-stall')
    expect(result.stats.avgAromaPotency).toBe(14)
    expect(result.stats.avgFlavorDepth).toBe(20)
    expect(result.stats.avgHeatIntensity).toBe(12)
    expect(result.stats.avgRarityValue).toBe(15)
    expect(result.stats.avgBlendHarmony).toBe(19)
    expect(result.stats.avgTradeVolume).toBe(15)
  })

  it('maps stalls to correct files', () => {
    const result = buildSpiceMarketResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stalls[0].file).toBe('a.ts')
    expect(result.stalls[1].file).toBe('b.ts')
    expect(result.stalls[0].aroma.potency).toBeGreaterThan(result.stalls[1].aroma.potency)
  })

  it('populates bazaar object', () => {
    const result = buildSpiceMarketResult(['a.ts'], [RICH])
    expect(result.bazaar.overallFlavorScore).toBe(result.stats.overallFlavorScore)
    expect(result.bazaar.merchantGrade).toBe(result.stats.merchantGrade)
    expect(result.bazaar.totalSpices).toBe(result.stats.totalSpices)
    expect(result.bazaar.stalls).toHaveLength(1)
  })

  it('handles missing content gracefully', () => {
    const result = buildSpiceMarketResult(['a.ts'], [])
    expect(result.stalls).toHaveLength(1)
    expect(result.stalls[0].aroma.potency).toBe(5)
  })
})

// ─── Format Helper Tests ───────────────────────────────────────────────────

describe('format helpers', () => {
  const result = buildSpiceMarketResult(['a.ts'], [RICH])

  it('formatSpiceMarketJson returns valid JSON', () => {
    const json = formatSpiceMarketJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.overallFlavorScore).toBe(result.stats.overallFlavorScore)
  })

  it('formatSpiceMarketTable returns non-empty string', () => {
    const table = formatSpiceMarketTable(result, false)
    expect(table).toContain('Spice Market Analysis')
    expect(table).toContain('Overall Flavor Score')
  })

  it('formatSpiceMarketTable with verbose shows per-stall', () => {
    const table = formatSpiceMarketTable(result, true)
    expect(table).toContain('a.ts')
    expect(table).toContain('Per-Stall Breakdown')
  })

  it('scoreColor returns string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('marketTypeColor returns string for all types', () => {
    for (const t of ['grand-bazaar', 'spice-souk', 'trading-post', 'roadside-stand', 'market-stall', 'closed-shop', 'unknown']) {
      expect(typeof marketTypeColor(t)).toBe('string')
    }
  })

  it('gradeColor returns string for all grades', () => {
    for (const g of ['grand-vizier', 'master-spice-merchant', 'caravan-leader', 'spice-trader', 'street-vendor', 'wandering-merchant', 'unknown']) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })

  it('aromaTypeColor returns string for all types', () => {
    for (const t of ['intoxicating', 'fragrant', 'mild', 'faint', 'stale', 'odorless', 'unknown']) {
      expect(typeof aromaTypeColor(t)).toBe('string')
    }
  })

  it('rarityGradeColor returns string for all grades', () => {
    for (const g of ['saffron', 'vanilla', 'cardamom', 'cinnamon', 'pepper', 'salt', 'unknown']) {
      expect(typeof rarityGradeColor(g)).toBe('string')
    }
  })
})
