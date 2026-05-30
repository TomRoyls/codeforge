// ─── Regex Constants ────────────────────────────────────────────────────────

const EXPORT_REGEX = /\bexport\s+/g
const IMPORT_REGEX = /\bimport\s+/g
const FUNCTION_REGEX = /\bfunction\s+\w+/g
const ARROW_REGEX = /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g
const CLASS_REGEX = /\bclass\s+\w+/g
const INTERFACE_REGEX = /\binterface\s+\w+/g
const TYPE_REGEX = /\btype\s+\w+/g
const ENUM_REGEX = /\benum\s+\w+/g
const COMMENT_REGEX = /\/\/.*$/gm
const BLOCK_COMMENT_REGEX = /\/\*[\s\S]*?\*\//g
const STRING_REGEX = /(["'`])(?:(?!\1|\\).|\\.)*\1/g
const TEMPLATE_REGEX = /`[^`]*`/g
const DECORATOR_REGEX = /@\w+/g
const ASYNC_REGEX = /\basync\s+/g
const GENERICS_REGEX = /<[^>]+>/g
const NESTED_BLOCK_REGEX = /\{[^{}]*\{[^{}]*\}/g
const TERNARY_REGEX = /\?[^:]+:/g
const NULLISH_REGEX = /\?\?/g
const OPTIONAL_CHAIN_REGEX = /\?\./g
const DEFAULT_PARAM_REGEX = /\w+\s*=\s*[^,)]+/g
const UNION_TYPE_REGEX = /\w+\s*\|\s*\w+/g
const INTERSECTION_REGEX = /\w+\s*&\s*\w+/g
const MAPPED_TYPE_REGEX = /\{\s*\[.*\]\s*:/g
const CONDITIONAL_TYPE_REGEX = /\w+\s+extends\s+\w+\s*\?/g
const UTILITY_TYPE_REGEX = /\b(?:Partial|Required|Readonly|Record|Pick|Omit|Exclude|Extract|NonNullable|ReturnType|InstanceType|Parameters)\b/g
const REEXPORT_REGEX = /\bexport\s*\{[^}]*\}\s*from/g
const DYNAMIC_IMPORT_REGEX = /\bimport\s*\(/g
const NAMESPACE_REGEX = /\bnamespace\s+\w+/g
const ABSTRACT_REGEX = /\babstract\s+/g
const OVERRIDE_REGEX = /\boverride\b/g
const CONST_ASSERTION_REGEX = /\bas\s+const\b/g
const TYPE_GUARD_REGEX = /\b(?:typeof|instanceof)\b/g
const STATIC_REGEX = /\bstatic\s+/g
const PRIVATE_REGEX = /private\s+/g
const PROTECTED_REGEX = /protected\s+/g
const PUBLIC_REGEX = /public\s+/g
const READONLY_REGEX = /\breadonly\b/g
const SPREAD_REGEX = /\.\.\./g
const DESTRUCTURE_REGEX = /\{[^{}]*\}\s*=/g
const AWAIT_REGEX = /\bawait\b/g
const YIELD_REGEX = /\byield\b/g
const THROW_REGEX = /\bthrow\b/g
const TRY_CATCH_REGEX = /\btry\s*\{/g
const PROMISE_REGEX = /\bPromise\b/g
const SET_REGEX = /\bSet\b/g
const MAP_REGEX = /\bMap\b/g

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface AromaMeasure {
  potency: number
  type: 'intoxicating' | 'fragrant' | 'mild' | 'faint' | 'stale' | 'odorless'
  isPotent: boolean
  hasRichScent: boolean
  hasNoBitterNotes: boolean
  hasExoticNotes: boolean
  hasEarthyUndertones: boolean
  hasFloralOvertones: boolean
  hasSpiceBouquet: boolean
  hasCleanFinish: boolean
  hasComplexProfile: boolean
  noteCount: number
}

export interface FlavorMeasure {
  depth: number
  profile: 'gourmet' | 'savory' | 'seasoned' | 'plain' | 'bland' | 'tasteless'
  isRich: boolean
  hasUmami: boolean
  hasNoAftertaste: boolean
  hasComplexPalate: boolean
  hasBalancedSeasoning: boolean
  hasDistinctiveNotes: boolean
  hasDepth: boolean
  hasSubtleLayering: boolean
  hasHarmoniousBlend: boolean
  layerCount: number
}

export interface HeatMeasure {
  intensity: number
  level: 'volcanic' | 'fiery' | 'spicy' | 'warm' | 'mild' | 'cool'
  isIntense: boolean
  hasHighScoville: boolean
  hasNoBurnout: boolean
  hasControlledFlame: boolean
  hasSlowBurn: boolean
  hasFlashFire: boolean
  hasSmokyCharacter: boolean
  hasPepperyKick: boolean
  hasGentleWarmth: boolean
  scovilleCount: number
}

export interface RarityMeasure {
  value: number
  grade: 'saffron' | 'vanilla' | 'cardamom' | 'cinnamon' | 'pepper' | 'salt'
  isRare: boolean
  hasExoticSpice: boolean
  hasNoCommonFiller: boolean
  hasPremiumGrade: boolean
  hasArtisanalQuality: boolean
  hasHeirloomVariety: boolean
  hasSingleOrigin: boolean
  hasHandPickedCode: boolean
  hasSmallBatch: boolean
  exoticCount: number
}

export interface BlendMeasure {
  harmony: number
  style: 'masterpiece' | 'artisan' | 'balanced' | 'mixed' | 'rough' | 'raw'
  isHarmonious: boolean
  hasSmoothTexture: boolean
  hasNoClumping: boolean
  hasEvenDistribution: boolean
  hasProperRatios: boolean
  hasBalancedFlavors: boolean
  hasComplementaryPairings: boolean
  hasNoOverpowering: boolean
  hasConsistentGrind: boolean
  pairingCount: number
}

export interface TradeMeasure {
  volume: number
  route: 'silk-road' | 'maritime' | 'caravan' | 'local-market' | 'barter' | 'closed'
  isHighVolume: boolean
  hasFairTrade: boolean
  hasNoContraband: boolean
  hasOpenMarkets: boolean
  hasDiverseImports: boolean
  hasQualityExports: boolean
  hasBalancedTrade: boolean
  hasTradeAgreements: boolean
  hasMonopolyFree: boolean
  importCount: number
}

export interface SpiceStall {
  file: string
  aroma: AromaMeasure
  flavor: FlavorMeasure
  heat: HeatMeasure
  rarity: RarityMeasure
  blend: BlendMeasure
  trade: TradeMeasure
}

export interface SpiceBazaar {
  stalls: SpiceStall[]
  overallFlavorScore: number
  merchantGrade: string
  totalSpices: number
  marketType: string
}

export interface SpiceMarketResult {
  stalls: SpiceStall[]
  bazaar: SpiceBazaar
  stats: {
    overallFlavorScore: number
    merchantGrade: string
    totalStalls: number
    totalSpices: number
    marketType: string
    avgAromaPotency: number
    avgFlavorDepth: number
    avgHeatIntensity: number
    avgRarityValue: number
    avgBlendHarmony: number
    avgTradeVolume: number
  }
}

// ─── Counter Helpers ────────────────────────────────────────────────────────

function countMatches(content: string, regex: RegExp): number {
  const matches = content.match(regex)
  return matches ? matches.length : 0
}

/** @example countExports('export function foo() {}') returns 1 */
export function countExports(content: string): number {
  return countMatches(content, EXPORT_REGEX)
}

/** @example countImports("import { foo } from 'bar'") returns 1 */
export function countImports(content: string): number {
  return countMatches(content, IMPORT_REGEX)
}

/** @example countFunctions('function foo() {}') returns 1 */
export function countFunctions(content: string): number {
  return countMatches(content, FUNCTION_REGEX)
}

/** @example countArrows('const f = () => 1') returns 1 */
export function countArrows(content: string): number {
  return countMatches(content, ARROW_REGEX)
}

/** @example countClasses('class Foo {}') returns 1 */
export function countClasses(content: string): number {
  return countMatches(content, CLASS_REGEX)
}

/** @example countInterfaces('interface Foo {}') returns 1 */
export function countInterfaces(content: string): number {
  return countMatches(content, INTERFACE_REGEX)
}

/** @example countTypeAliases('type Foo = string') returns 1 */
export function countTypeAliases(content: string): number {
  return countMatches(content, TYPE_REGEX)
}

/** @example countEnums('enum Foo { A }') returns 1 */
export function countEnums(content: string): number {
  return countMatches(content, ENUM_REGEX)
}

/** @example countComments('// hello') returns 1 */
export function countComments(content: string): number {
  return countMatches(content, COMMENT_REGEX) + countMatches(content, BLOCK_COMMENT_REGEX)
}

/** @example countStrings("'hello'") returns 1 */
export function countStrings(content: string): number {
  return countMatches(content, STRING_REGEX) + countMatches(content, TEMPLATE_REGEX)
}

/** @example countDecorators('@Injectable()') returns 1 */
export function countDecorators(content: string): number {
  return countMatches(content, DECORATOR_REGEX)
}

/** @example countAsync('async function foo() {}') returns 1 */
export function countAsync(content: string): number {
  return countMatches(content, ASYNC_REGEX)
}

/** @example countGenerics('function foo<T>() {}') returns 1 */
export function countGenerics(content: string): number {
  return countMatches(content, GENERICS_REGEX)
}

/** @example countNestedBlocks('if (x) { if (y) {} }') returns 1 */
export function countNestedBlocks(content: string): number {
  return countMatches(content, NESTED_BLOCK_REGEX)
}

/** @example countTernaries('x ? 1 : 0') returns 1 */
export function countTernaries(content: string): number {
  return countMatches(content, TERNARY_REGEX)
}

/** @example countNullish('x ?? y') returns 1 */
export function countNullish(content: string): number {
  return countMatches(content, NULLISH_REGEX)
}

/** @example countOptionalChain('x?.y') returns 1 */
export function countOptionalChain(content: string): number {
  return countMatches(content, OPTIONAL_CHAIN_REGEX)
}

/** @example countDefaultParams('function f(x = 1) {}') returns 1 */
export function countDefaultParams(content: string): number {
  return countMatches(content, DEFAULT_PARAM_REGEX)
}

/** @example countUnionTypes('string | number') returns 1 */
export function countUnionTypes(content: string): number {
  return countMatches(content, UNION_TYPE_REGEX)
}

/** @example countIntersections('A & B') returns 1 */
export function countIntersections(content: string): number {
  return countMatches(content, INTERSECTION_REGEX)
}

/** @example countMappedTypes('{ [K in T]: V }') returns 1 */
export function countMappedTypes(content: string): number {
  return countMatches(content, MAPPED_TYPE_REGEX)
}

/** @example countConditionalTypes('T extends U ? X : Y') returns 1 */
export function countConditionalTypes(content: string): number {
  return countMatches(content, CONDITIONAL_TYPE_REGEX)
}

/** @example countUtilityTypes('Partial<T>') returns 1 */
export function countUtilityTypes(content: string): number {
  return countMatches(content, UTILITY_TYPE_REGEX)
}

/** @example countReexports("export { foo } from 'bar'") returns 1 */
export function countReexports(content: string): number {
  return countMatches(content, REEXPORT_REGEX)
}

/** @example countDynamicImports("import('foo')") returns 1 */
export function countDynamicImports(content: string): number {
  return countMatches(content, DYNAMIC_IMPORT_REGEX)
}

/** @example countNamespaces('namespace Foo {}') returns 1 */
export function countNamespaces(content: string): number {
  return countMatches(content, NAMESPACE_REGEX)
}

/** @example countAbstracts('abstract class Foo {}') returns 1 */
export function countAbstracts(content: string): number {
  return countMatches(content, ABSTRACT_REGEX)
}

/** @example countOverrides('override foo()') returns 1 */
export function countOverrides(content: string): number {
  return countMatches(content, OVERRIDE_REGEX)
}

/** @example countConstAssertions('x as const') returns 1 */
export function countConstAssertions(content: string): number {
  return countMatches(content, CONST_ASSERTION_REGEX)
}

/** @example countTypeGuards('typeof x') returns 1 */
export function countTypeGuards(content: string): number {
  return countMatches(content, TYPE_GUARD_REGEX)
}

/** @example countAccessModifiers('private x') returns 1 */
export function countAccessModifiers(content: string): number {
  return countMatches(content, PRIVATE_REGEX) + countMatches(content, PROTECTED_REGEX) + countMatches(content, PUBLIC_REGEX)
}

/** @example countReadonly('readonly x') returns 1 */
export function countReadonly(content: string): number {
  return countMatches(content, READONLY_REGEX)
}

/** @example countStatic('static x') returns 1 */
export function countStatic(content: string): number {
  return countMatches(content, STATIC_REGEX)
}

/** @example countSpreads('...args') returns 1 */
export function countSpreads(content: string): number {
  return countMatches(content, SPREAD_REGEX)
}

/** @example countDestructures('{ a, b } = obj') returns 1 */
export function countDestructures(content: string): number {
  return countMatches(content, DESTRUCTURE_REGEX)
}

/** @example countAwaits('await x') returns 1 */
export function countAwaits(content: string): number {
  return countMatches(content, AWAIT_REGEX)
}

/** @example countYields('yield x') returns 1 */
export function countYields(content: string): number {
  return countMatches(content, YIELD_REGEX)
}

/** @example countThrows('throw new Error()') returns 1 */
export function countThrows(content: string): number {
  return countMatches(content, THROW_REGEX)
}

/** @example countTryCatch('try {') returns 1 */
export function countTryCatch(content: string): number {
  return countMatches(content, TRY_CATCH_REGEX)
}

/** @example countPromises('Promise<string>') returns 1 */
export function countPromises(content: string): number {
  return countMatches(content, PROMISE_REGEX)
}

/** @example countSets('new Set()') returns 1 */
export function countSets(content: string): number {
  return countMatches(content, SET_REGEX)
}

/** @example countMaps('new Map()') returns 1 */
export function countMaps(content: string): number {
  return countMatches(content, MAP_REGEX)
}

// ─── Aroma Measure ─────────────────────────────────────────────────────────

/** @example measureAroma('export function foo() {}') returns AromaMeasure with potency based on exports/imports/strings */
export function measureAroma(content: string): AromaMeasure {
  const exportCount = countExports(content)
  const importCount = countImports(content)
  const stringCount = countStrings(content)
  const commentCount = countComments(content)
  const decoratorCount = countDecorators(content)
  const templateCount = countMatches(content, TEMPLATE_REGEX)
  const enumCount = countEnums(content)
  const namespaceCount = countNamespaces(content)

  const noteCount = exportCount + importCount + stringCount + commentCount + decoratorCount + templateCount + enumCount + namespaceCount

  let potency = 5
  potency += Math.min(exportCount * 3, 15)
  potency += Math.min(importCount * 2, 10)
  potency += Math.min(stringCount, 10)
  potency += Math.min(commentCount, 5)
  potency += Math.min(decoratorCount * 2, 5)
  potency += Math.min(templateCount, 5)
  potency += Math.min(enumCount * 2, 5)
  potency = Math.min(potency, 100)

  const type = potency >= 80 ? 'intoxicating' : potency >= 60 ? 'fragrant' : potency >= 40 ? 'mild' : potency >= 20 ? 'faint' : potency >= 10 ? 'stale' : 'odorless'

  return {
    potency,
    type,
    isPotent: potency >= 60,
    hasRichScent: exportCount > 3,
    hasNoBitterNotes: commentCount < 50,
    hasExoticNotes: decoratorCount > 0 || namespaceCount > 0,
    hasEarthyUndertones: enumCount > 0,
    hasFloralOvertones: templateCount > 2,
    hasSpiceBouquet: exportCount > 5 && importCount > 5,
    hasCleanFinish: stringCount < 30,
    hasComplexProfile: noteCount > 15,
    noteCount,
  }
}

// ─── Flavor Measure ─────────────────────────────────────────────────────────

/** @example measureFlavor('function foo() {}') returns FlavorMeasure with depth based on functions/types */
export function measureFlavor(content: string): FlavorMeasure {
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const classCount = countClasses(content)
  const genericsCount = countGenerics(content)
  const unionCount = countUnionTypes(content)
  const intersectionCount = countIntersections(content)
  const mappedCount = countMappedTypes(content)
  const conditionalCount = countConditionalTypes(content)
  const utilityCount = countUtilityTypes(content)

  const layerCount = functionCount + arrowCount + interfaceCount + typeCount + classCount + genericsCount + unionCount + intersectionCount + mappedCount + conditionalCount + utilityCount

  let depth = 5
  depth += Math.min(functionCount * 3, 12)
  depth += Math.min(arrowCount * 2, 8)
  depth += Math.min(interfaceCount * 2, 10)
  depth += Math.min(typeCount * 2, 10)
  depth += Math.min(classCount * 2, 5)
  depth += Math.min(genericsCount * 2, 10)
  depth += Math.min(unionCount, 5)
  depth += Math.min(intersectionCount, 5)
  depth += Math.min(mappedCount * 3, 5)
  depth += Math.min(conditionalCount * 3, 5)
  depth += Math.min(utilityCount * 2, 5)
  depth = Math.min(depth, 100)

  const profile = depth >= 80 ? 'gourmet' : depth >= 60 ? 'savory' : depth >= 40 ? 'seasoned' : depth >= 20 ? 'plain' : depth >= 10 ? 'bland' : 'tasteless'

  return {
    depth,
    profile,
    isRich: depth >= 60,
    hasUmami: genericsCount > 2,
    hasNoAftertaste: classCount < 10,
    hasComplexPalate: layerCount > 15,
    hasBalancedSeasoning: functionCount > 0 && interfaceCount > 0,
    hasDistinctiveNotes: typeCount > 3,
    hasDepth: depth >= 40,
    hasSubtleLayering: mappedCount > 0 || conditionalCount > 0,
    hasHarmoniousBlend: functionCount > 2 && arrowCount > 2,
    layerCount,
  }
}

// ─── Heat Measure ───────────────────────────────────────────────────────────

/** @example measureHeat('async function foo() { await bar() }') returns HeatMeasure with intensity */
export function measureHeat(content: string): HeatMeasure {
  const asyncCount = countAsync(content)
  const awaitCount = countAwaits(content)
  const ternaryCount = countTernaries(content)
  const nullishCount = countNullish(content)
  const optionalChainCount = countOptionalChain(content)
  const throwCount = countThrows(content)
  const tryCatchCount = countTryCatch(content)
  const promiseCount = countPromises(content)
  const yieldCount = countYields(content)

  const scovilleCount = asyncCount + awaitCount + ternaryCount + nullishCount + optionalChainCount + throwCount + tryCatchCount + promiseCount + yieldCount

  let intensity = 5
  intensity += Math.min(asyncCount * 3, 15)
  intensity += Math.min(awaitCount * 2, 10)
  intensity += Math.min(ternaryCount * 2, 10)
  intensity += Math.min(nullishCount * 2, 5)
  intensity += Math.min(optionalChainCount * 2, 5)
  intensity += Math.min(throwCount * 2, 10)
  intensity += Math.min(tryCatchCount * 3, 10)
  intensity += Math.min(promiseCount, 10)
  intensity += Math.min(yieldCount * 2, 5)
  intensity = Math.min(intensity, 100)

  const level = intensity >= 80 ? 'volcanic' : intensity >= 60 ? 'fiery' : intensity >= 40 ? 'spicy' : intensity >= 20 ? 'warm' : intensity >= 10 ? 'mild' : 'cool'

  return {
    intensity,
    level,
    isIntense: intensity >= 60,
    hasHighScoville: scovilleCount > 10,
    hasNoBurnout: tryCatchCount > 0 || throwCount === 0,
    hasControlledFlame: asyncCount > 0 && tryCatchCount > 0,
    hasSlowBurn: awaitCount > 3,
    hasFlashFire: asyncCount > 5,
    hasSmokyCharacter: throwCount > 2,
    hasPepperyKick: ternaryCount > 3,
    hasGentleWarmth: intensity >= 10 && intensity < 40,
    scovilleCount,
  }
}

// ─── Rarity Measure ─────────────────────────────────────────────────────────

/** @example measureRarity('abstract class Foo { readonly x: T }') returns RarityMeasure */
export function measureRarity(content: string): RarityMeasure {
  const abstractCount = countAbstracts(content)
  const overrideCount = countOverrides(content)
  const constAssertionCount = countConstAssertions(content)
  const typeGuardCount = countTypeGuards(content)
  const accessModCount = countAccessModifiers(content)
  const readonlyCount = countReadonly(content)
  const staticCount = countStatic(content)
  const reexportCount = countReexports(content)
  const dynamicImportCount = countDynamicImports(content)
  const namespaceCount = countNamespaces(content)

  const exoticCount = abstractCount + overrideCount + constAssertionCount + typeGuardCount + reexportCount + dynamicImportCount + namespaceCount

  let value = 5
  value += Math.min(abstractCount * 5, 15)
  value += Math.min(overrideCount * 3, 10)
  value += Math.min(constAssertionCount * 3, 10)
  value += Math.min(typeGuardCount * 2, 8)
  value += Math.min(accessModCount, 10)
  value += Math.min(readonlyCount * 2, 10)
  value += Math.min(staticCount * 2, 5)
  value += Math.min(reexportCount * 3, 10)
  value += Math.min(dynamicImportCount * 3, 7)
  value += Math.min(namespaceCount * 2, 5)
  value = Math.min(value, 100)

  const grade = value >= 80 ? 'saffron' : value >= 60 ? 'vanilla' : value >= 40 ? 'cardamom' : value >= 20 ? 'cinnamon' : value >= 10 ? 'pepper' : 'salt'

  return {
    value,
    grade,
    isRare: value >= 60,
    hasExoticSpice: exoticCount > 3,
    hasNoCommonFiller: accessModCount > 0,
    hasPremiumGrade: abstractCount > 0 || overrideCount > 0,
    hasArtisanalQuality: constAssertionCount > 0 && readonlyCount > 0,
    hasHeirloomVariety: namespaceCount > 0,
    hasSingleOrigin: reexportCount > 0,
    hasHandPickedCode: typeGuardCount > 2,
    hasSmallBatch: exoticCount > 0 && exoticCount < 5,
    exoticCount,
  }
}

// ─── Blend Measure ──────────────────────────────────────────────────────────

/** @example measureBlend('const { a, b } = obj; ...args') returns BlendMeasure */
export function measureBlend(content: string): BlendMeasure {
  const spreadCount = countSpreads(content)
  const destructureCount = countDestructures(content)
  const defaultParamCount = countDefaultParams(content)
  const functionCount = countFunctions(content)
  const arrowCount = countArrows(content)
  const classCount = countClasses(content)
  const interfaceCount = countInterfaces(content)
  const typeCount = countTypeAliases(content)
  const nestedCount = countNestedBlocks(content)
  const promiseCount = countPromises(content)

  const pairingCount = spreadCount + destructureCount + defaultParamCount

  let harmony = 5
  harmony += Math.min(spreadCount * 3, 10)
  harmony += Math.min(destructureCount * 3, 10)
  harmony += Math.min(defaultParamCount * 2, 10)
  harmony += Math.min(functionCount, 10)
  harmony += Math.min(arrowCount, 8)
  harmony += Math.min(classCount * 2, 5)
  harmony += Math.min(interfaceCount * 2, 8)
  harmony += Math.min(typeCount * 2, 8)
  harmony += Math.min(nestedCount, 5)
  harmony += Math.min(promiseCount, 5)
  harmony = Math.min(harmony, 100)

  const style = harmony >= 80 ? 'masterpiece' : harmony >= 60 ? 'artisan' : harmony >= 40 ? 'balanced' : harmony >= 20 ? 'mixed' : harmony >= 10 ? 'rough' : 'raw'

  return {
    harmony,
    style,
    isHarmonious: harmony >= 60,
    hasSmoothTexture: spreadCount > 0 && destructureCount > 0,
    hasNoClumping: nestedCount < 10,
    hasEvenDistribution: functionCount > 0 && arrowCount > 0 && classCount > 0,
    hasProperRatios: interfaceCount > 0 && typeCount > 0,
    hasBalancedFlavors: functionCount > 0 && classCount > 0,
    hasComplementaryPairings: pairingCount > 5,
    hasNoOverpowering: functionCount < 50,
    hasConsistentGrind: defaultParamCount > 0,
    pairingCount,
  }
}

// ─── Trade Measure ──────────────────────────────────────────────────────────

/** @example measureTrade("import { foo } from 'bar'; export { baz }") returns TradeMeasure */
export function measureTrade(content: string): TradeMeasure {
  const importCount = countImports(content)
  const exportCount = countExports(content)
  const reexportCount = countReexports(content)
  const dynamicImportCount = countDynamicImports(content)
  const setCount = countSets(content)
  const mapCount = countMaps(content)
  const spreadCount = countSpreads(content)
  const promiseCount = countPromises(content)
  const stringCount = countStrings(content)
  const functionCount = countFunctions(content)

  const importCount2 = importCount + dynamicImportCount + reexportCount

  let volume = 5
  volume += Math.min(importCount * 2, 12)
  volume += Math.min(exportCount * 2, 12)
  volume += Math.min(reexportCount * 3, 10)
  volume += Math.min(dynamicImportCount * 3, 8)
  volume += Math.min(setCount * 2, 5)
  volume += Math.min(mapCount * 2, 5)
  volume += Math.min(spreadCount, 5)
  volume += Math.min(promiseCount, 5)
  volume += Math.min(stringCount, 3)
  volume += Math.min(functionCount, 5)
  volume = Math.min(volume, 100)

  const route = volume >= 80 ? 'silk-road' : volume >= 60 ? 'maritime' : volume >= 40 ? 'caravan' : volume >= 20 ? 'local-market' : volume >= 10 ? 'barter' : 'closed'

  return {
    volume,
    route,
    isHighVolume: volume >= 60,
    hasFairTrade: importCount > 0 && exportCount > 0,
    hasNoContraband: dynamicImportCount < 5,
    hasOpenMarkets: reexportCount > 0,
    hasDiverseImports: importCount2 > 5,
    hasQualityExports: exportCount > 3,
    hasBalancedTrade: Math.abs(importCount - exportCount) <= 3,
    hasTradeAgreements: reexportCount > 0 && dynamicImportCount > 0,
    hasMonopolyFree: importCount2 > 0 && exportCount > 0,
    importCount: importCount2,
  }
}

// ─── Classification Helpers ─────────────────────────────────────────────────

/** @example classifyMarketType(50, 'fragrant') returns 'spice-souk' */
export function classifyMarketType(score: number, topAroma: string): string {
  if (score >= 80 && topAroma === 'intoxicating') return 'grand-bazaar'
  if (score >= 70) return 'spice-souk'
  if (score >= 50) return 'trading-post'
  if (score >= 30) return 'roadside-stand'
  if (score >= 15) return 'market-stall'
  return 'closed-shop'
}

/** @example classifyMerchantGrade(75) returns 'master-spice-merchant' */
export function classifyMerchantGrade(score: number): string {
  if (score >= 85) return 'grand-vizier'
  if (score >= 70) return 'master-spice-merchant'
  if (score >= 55) return 'caravan-leader'
  if (score >= 40) return 'spice-trader'
  if (score >= 25) return 'street-vendor'
  return 'wandering-merchant'
}

// ─── Build Result ───────────────────────────────────────────────────────────

/** @example buildSpiceMarketResult(['a.ts'], ['export const x = 1']) returns SpiceMarketResult */
export function buildSpiceMarketResult(
  files: string[],
  contents: string[],
  options?: { verbose?: boolean },
): SpiceMarketResult {
  const stalls: SpiceStall[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    return {
      file,
      aroma: measureAroma(content),
      flavor: measureFlavor(content),
      heat: measureHeat(content),
      rarity: measureRarity(content),
      blend: measureBlend(content),
      trade: measureTrade(content),
    }
  })

  const totalSpices = stalls.reduce((sum, s) => {
    return sum + s.aroma.noteCount + s.flavor.layerCount + s.heat.scovilleCount + s.rarity.exoticCount + s.blend.pairingCount + s.trade.importCount
  }, 0)

  const avgAromaPotency = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.aroma.potency, 0) / stalls.length) : 0
  const avgFlavorDepth = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.flavor.depth, 0) / stalls.length) : 0
  const avgHeatIntensity = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.heat.intensity, 0) / stalls.length) : 0
  const avgRarityValue = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.rarity.value, 0) / stalls.length) : 0
  const avgBlendHarmony = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.blend.harmony, 0) / stalls.length) : 0
  const avgTradeVolume = stalls.length > 0 ? Math.round(stalls.reduce((s, st) => s + st.trade.volume, 0) / stalls.length) : 0

  const overallFlavorScore = stalls.length > 0
    ? Math.round((avgAromaPotency + avgFlavorDepth + avgHeatIntensity + avgRarityValue + avgBlendHarmony + avgTradeVolume) / 6)
    : 0

  const topAroma = stalls.length > 0
    ? (() => {
        const counts = new Map<string, number>()
        for (const s of stalls) {
          counts.set(s.aroma.type, (counts.get(s.aroma.type) ?? 0) + 1)
        }
        let top = 'odorless'
        let max = 0
        for (const [k, v] of counts) {
          if (v > max) { max = v; top = k }
        }
        return top
      })()
    : 'odorless'

  const marketType = classifyMarketType(overallFlavorScore, topAroma)
  const merchantGrade = classifyMerchantGrade(overallFlavorScore)

  void options

  const bazaar: SpiceBazaar = {
    stalls,
    overallFlavorScore,
    merchantGrade,
    totalSpices,
    marketType,
  }

  return {
    stalls,
    bazaar,
    stats: {
      overallFlavorScore,
      merchantGrade,
      totalStalls: stalls.length,
      totalSpices,
      marketType,
      avgAromaPotency,
      avgFlavorDepth,
      avgHeatIntensity,
      avgRarityValue,
      avgBlendHarmony,
      avgTradeVolume,
    },
  }
}
