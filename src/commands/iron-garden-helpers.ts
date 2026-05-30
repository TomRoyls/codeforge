// ─── Imports ───────────────────────────────────────────────────────
import path from 'node:path'
import fg from 'fast-glob'

// ─── Types ─────────────────────────────────────────────────────────

export type Iron = 'tempered-steel' | 'wrought-iron' | 'proper-metal' | 'cast-iron' | 'pig-iron' | 'no-strength'
export type Coat = 'galvanized' | 'stainless' | 'proper-coating' | 'rusted-surface' | 'corroded-metal' | 'no-resistance'
export type Bloom = 'perfect-bloom' | 'beautiful-flower' | 'proper-petal' | 'wilted-flower' | 'dead-bloom' | 'no-bloom'
export type Root = 'deep-taproot' | 'strong-roots' | 'proper-foundation' | 'shallow-roots' | 'surface-root' | 'no-root'
export type Forge = 'blazing-forge' | 'hot-fire' | 'proper-heat' | 'dying-embers' | 'cold-hearth' | 'no-forge'
export type BloomCondition = 'iron-masterpiece' | 'steel-garden' | 'proper-landscape' | 'rusty-bed' | 'withered-plot' | 'barren-earth'
export type PlotType = 'grand-estate' | 'formal-garden' | 'proper-plot' | 'small-bed' | 'window-box' | 'no-plot'
export type PlotCondition = 'iron-eden' | 'steel-oasis' | 'proper-garden' | 'rusty-patch' | 'withered-ground' | 'void'
export type GardenerGrade = 'master-ironworker' | 'skilled-forge-gardener' | 'proper-cultivator' | 'apprentice' | 'novice' | 'weed-puller'

export interface FortifyingMeasure {
  strength: number
  iron: Iron
  hasHighStrength: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasOrganized: boolean
  hasNoChaotic: boolean
  hasGrowing: boolean
  hasNoStagnant: boolean
  untestedCount: number
  bareCrashCount: number
}

export interface ProtectingMeasure {
  resistance: number
  coat: Coat
  hasHighResistance: boolean
  hasClean: boolean
  hasNoDeadCode: boolean
  hasNoHacky: boolean
  hasNoDuplicates: boolean
  hasModern: boolean
  hasNoDeprecated: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasPolished: boolean
  hasNoTarnished: boolean
  deadCodeCount: number
  hackyCount: number
}

export interface FloweringMeasure {
  precision: number
  bloom: Bloom
  hasHighPrecision: boolean
  hasExact: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoAlmostRight: boolean
  hasPrecise: boolean
  hasNoVague: boolean
  hasSharp: boolean
  hasNoSloppy: boolean
  hasDefined: boolean
  hasNoFuzzy: boolean
  hasWellFormed: boolean
  approximateCount: number
  sloppyCount: number
}

export interface RootingMeasure {
  depth: number
  root: Root
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoAdHoc: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasLayered: boolean
  hasNoFlat: boolean
  hasStable: boolean
  hasNoShaky: boolean
  hasDeep: boolean
  adHocCount: number
  undocumentedCount: number
}

export interface EnergizingMeasure {
  vitality: number
  forge: Forge
  hasHighVitality: boolean
  hasActive: boolean
  hasNoDormant: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasFresh: boolean
  hasNoStale: boolean
  hasInnovative: boolean
  hasNoFormulaic: boolean
  hasDynamic: boolean
  hasNoStatic: boolean
  hasAlive: boolean
  hasNoDead: boolean
  hasVibrant: boolean
  stagnantCount: number
  formulaicCount: number
}

export interface IronBloom {
  file: string
  strengthThroughNature: number
  rustResistance: number
  bloomPrecision: number
  rootDepth: number
  forgeVitality: number
  fortifying: FortifyingMeasure
  protecting: ProtectingMeasure
  flowering: FloweringMeasure
  rooting: RootingMeasure
  energizing: EnergizingMeasure
  condition: BloomCondition
  qualityScore: number
}

export interface IronPlot {
  directory: string
  blooms: IronBloom[]
  avgStrength: number
  avgPrecision: number
  avgVitality: number
  ironMasterpieceCount: number
  barrenEarthCount: number
  plotType: PlotType
  condition: PlotCondition
}

export interface IronGardenResult {
  blooms: IronBloom[]
  plots: IronPlot[]
  estate: {
    avgStrength: number
    avgPrecision: number
    avgVitality: number
    isIron: boolean
    overallFertility: number
  }
  stats: {
    totalFiles: number
    totalPlots: number
    avgStrengthThroughNature: number
    avgRustResistance: number
    avgBloomPrecision: number
    avgRootDepth: number
    avgForgeVitality: number
    ironMasterpieceCount: number
    steelGardenCount: number
    properLandscapeCount: number
    rustyBedCount: number
    witheredPlotCount: number
    barrenEarthCount: number
    hasHighStrengthCount: number
    hasHighResistanceCount: number
    hasHighPrecisionCount: number
    hasHighDepthCount: number
    hasHighVitalityCount: number
    overallFertility: number
    gardenerGrade: GardenerGrade
    bestBloom: string
    strongest: string
    mostResistant: string
    mostPrecise: string
    mostVital: string
  }
  recommendations: string[]
}

// ─── Detectors ─────────────────────────────────────────────────────

function hasPattern(content: string, pattern: RegExp): boolean {
  return pattern.test(content)
}

function countPattern(content: string, pattern: RegExp): number {
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ─── measureFortifying ─────────────────────────────────────────────

/**
 * @example measureFortifying('export function greet(name: string): string { return name }')
 */
export function measureFortifying(content: string): FortifyingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)
  const hasThrow = hasPattern(content, /\bthrow\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasPrivate = hasPattern(content, /\bprivate\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasTryCatch) score += 8
  if (hasThrow) score += 6
  if (hasAsync) score += 4
  if (hasAwait) score += 4
  if (hasReturnType) score += 6
  if (hasReadonly) score += 4
  if (hasPrivate) score += 4
  if (hasGenerics) score += 6
  if (hasOptional) score += 4
  if (hasDoc) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasAny) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)

  const strength = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const untestedCount = hasVar > 0 ? 1 : 0
  const bareCrashCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    strength,
    iron: classifyIron(strength),
    hasHighStrength: strength >= 80,
    hasRobust: hasExport && hasNamed,
    hasTested: hasTryCatch || hasThrow,
    hasNoUntested: !hasVar,
    hasTypeSafe: hasReturnType && !hasAny,
    hasNoUnsafe: !hasVar && !hasAny,
    hasErrorHandled: hasTryCatch || hasThrow,
    hasNoBareCrash: !hasEval && !hasDebugger,
    hasDefensive: hasOptional && !hasVar,
    hasNoNaive: !hasEval,
    hasOrganized: hasConst && hasExport,
    hasNoChaotic: !hasVar,
    hasGrowing: hasDoc && hasExport,
    hasNoStagnant: !hasVar && !hasDebugger,
    untestedCount,
    bareCrashCount,
  }
}

// ─── measureProtecting ─────────────────────────────────────────────

/**
 * @example measureProtecting('export interface Widget { readonly id: string }')
 */
export function measureProtecting(content: string): ProtectingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasArrow = hasPattern(content, /=>/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)
  const hasGodFile = content.split('\n').length > 300

  if (hasExport) score += 6
  if (hasNamed) score += 6
  if (hasInterface) score += 6
  if (hasType) score += 4
  if (hasEnum) score += 4
  if (hasConst) score += 4
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasDoc) score += 6
  if (hasReturnType) score += 6
  if (hasOptional) score += 4
  if (hasPipeline) score += 4
  if (hasArrow) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasTodo) score -= 5
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)
  if (hasAny) score -= 4
  if (hasGodFile) score -= 6

  const resistance = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const deadCodeCount = (hasVar > 0 ? 1 : 0) + (hasGodFile ? 1 : 0)
  const hackyCount = (hasHackyCast > 0 ? 1 : 0) + (hasEval ? 1 : 0)

  return {
    resistance,
    coat: classifyCoat(resistance),
    hasHighResistance: resistance >= 80,
    hasClean: !hasEval && !hasDebugger,
    hasNoDeadCode: hasVar === 0 && !hasGodFile,
    hasNoHacky: hasHackyCast === 0 && !hasEval,
    hasNoDuplicates: !hasVar,
    hasModern: hasConst && !hasVar,
    hasNoDeprecated: !hasEval && !hasDebugger,
    hasMaintained: hasDoc && !hasTodo,
    hasNoAbandoned: !hasTodo,
    hasFresh: hasExport && hasConst,
    hasNoStale: !hasVar && !hasDebugger,
    hasPolished: hasInterface && hasNamed,
    hasNoTarnished: !hasTodo && !hasDebugger,
    deadCodeCount,
    hackyCount,
  }
}

// ─── measureFlowering ──────────────────────────────────────────────

/**
 * @example measureFlowering('export function compute(val: string): number { return val.length }')
 */
export function measureFlowering(content: string): FloweringMeasure {
  let score = 0

  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)
  const hasTypeAnnotation = hasPattern(content, /:\s*[A-Z]\w+/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasType = hasPattern(content, /\btype\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasAny = hasPattern(content, /:\s*any\b/)

  if (hasReturnType) score += 8
  if (hasTypeAnnotation) score += 6
  if (hasConst) score += 4
  if (hasInterface) score += 6
  if (hasGenerics) score += 6
  if (hasReadonly) score += 6
  if (hasOptional) score += 6
  if (hasExport) score += 4
  if (hasNamed) score += 4
  if (hasEnum) score += 4
  if (hasDoc) score += 6
  if (hasType) score += 4
  if (hasArrow) score += 4
  if (hasPipeline) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)
  if (hasAny) score -= 6

  const precision = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const approximateCount = hasVar > 0 ? 1 : 0
  const sloppyCount = (hasEval ? 1 : 0) + (hasDebugger ? 1 : 0)

  return {
    precision,
    bloom: classifyBloom(precision),
    hasHighPrecision: precision >= 80,
    hasExact: hasReturnType && hasTypeAnnotation,
    hasAccurate: hasInterface && hasGenerics,
    hasNoApproximate: !hasVar,
    hasCorrect: !hasEval && hasHackyCast === 0,
    hasNoAlmostRight: hasHackyCast === 0,
    hasPrecise: hasReadonly && hasOptional,
    hasNoVague: !hasVar && !hasEval,
    hasSharp: hasReturnType && !hasAny,
    hasNoSloppy: !hasDebugger && !hasEval,
    hasDefined: hasInterface || hasType,
    hasNoFuzzy: !hasAny,
    hasWellFormed: hasNamed && hasDoc,
    approximateCount,
    sloppyCount,
  }
}

// ─── measureRooting ────────────────────────────────────────────────

/**
 * @example measureRooting('export abstract class Base { abstract doWork(): void }')
 */
export function measureRooting(content: string): RootingMeasure {
  let score = 0

  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasInterface = hasPattern(content, /\binterface\b/)
  const hasType = hasPattern(content, /\btype\b/)
  const hasEnum = hasPattern(content, /\benum\b/)
  const hasClass = hasPattern(content, /\bclass\b/)
  const hasExtends = hasPattern(content, /\bextends\b/)
  const hasImplements = hasPattern(content, /\bimplements\b/)
  const hasAbstract = hasPattern(content, /\babstract\b/)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasExport = hasPattern(content, /\bexport\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasImport = hasPattern(content, /\bimport\b/)
  const hasReturnType = hasPattern(content, /\):\s*[A-Z]\w+/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)
  const hasGodFile = content.split('\n').length > 300

  if (hasDoc) score += 8
  if (hasInterface) score += 8
  if (hasType) score += 6
  if (hasEnum) score += 4
  if (hasClass) score += 6
  if (hasExtends) score += 6
  if (hasImplements) score += 6
  if (hasAbstract) score += 8
  if (hasGenerics) score += 6
  if (hasExport) score += 4
  if (hasConst) score += 4
  if (hasReadonly) score += 4
  if (hasImport) score += 4
  if (hasReturnType) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 3, 9)
  if (hasTodo) score -= 5
  if (hasDebugger) score -= 6
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 3, 9)
  if (hasGodFile) score -= 6

  const depth = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const adHocCount = (hasVar > 0 ? 1 : 0) + (hasTodo ? 1 : 0)
  const undocumentedCount = hasTodo ? 1 : 0

  return {
    depth,
    root: classifyRoot(depth),
    hasHighDepth: depth >= 80,
    hasWellArchitected: hasInterface && (hasClass || hasType),
    hasNoAdHoc: !hasVar,
    hasDocumented: hasDoc,
    hasNoUndocumented: !hasTodo,
    hasStructured: hasExport && hasConst,
    hasNoChaotic: !hasVar && !hasDebugger,
    hasModular: hasImport,
    hasNoMonolithic: !hasGodFile,
    hasLayered: hasInterface && hasGenerics,
    hasNoFlat: !hasGodFile && hasExport,
    hasStable: (hasExtends || hasImplements) && !hasDebugger,
    hasNoShaky: !hasVar && hasHackyCast === 0,
    hasDeep: hasExtends || hasImplements || hasAbstract,
    adHocCount,
    undocumentedCount,
  }
}

// ─── measureEnergizing ─────────────────────────────────────────────

/**
 * @example measureEnergizing('export async function run(): Promise<void> { await work() }')
 */
export function measureEnergizing(content: string): EnergizingMeasure {
  let score = 0

  const hasExport = hasPattern(content, /\bexport\b/)
  const hasAsync = hasPattern(content, /\basync\b/)
  const hasAwait = hasPattern(content, /\bawait\b/)
  const hasConst = hasPattern(content, /\bconst\b/)
  const hasArrow = hasPattern(content, /=>/)
  const hasPipeline = hasPattern(content, /\.\s*(map|filter|reduce|forEach|find|some|every)\s*\(/)
  const hasOptional = hasPattern(content, /\?\s*:/)
  const hasNullish = hasPattern(content, /\?\?/)
  const hasOptionalChain = hasPattern(content, /\?\./)
  const hasGenerics = hasPattern(content, /<\w+/)
  const hasDoc = hasPattern(content, /\/\*\*|\*\//)
  const hasNamed = hasPattern(content, /\bexport\s+(function|class|const|interface|type|enum)\b/)
  const hasReadonly = hasPattern(content, /\breadonly\b/)
  const hasTryCatch = hasPattern(content, /\btry\b/)

  const hasVar = countPattern(content, /\bvar\b/)
  const hasEval = hasPattern(content, /\beval\s*\(/)
  const hasDebugger = hasPattern(content, /\bdebugger\b/)
  const hasTodo = hasPattern(content, /\/\/\s*(TODO|FIXME|HACK|XXX)/)
  const hasHackyCast = countPattern(content, /\bas\s+any\b/)

  if (hasExport) score += 6
  if (hasAsync) score += 8
  if (hasAwait) score += 6
  if (hasConst) score += 4
  if (hasArrow) score += 4
  if (hasPipeline) score += 6
  if (hasOptional) score += 4
  if (hasNullish) score += 4
  if (hasOptionalChain) score += 4
  if (hasGenerics) score += 6
  if (hasDoc) score += 6
  if (hasNamed) score += 4
  if (hasReadonly) score += 4
  if (hasTryCatch) score += 4

  if (hasVar > 0) score -= Math.min(hasVar * 4, 12)
  if (hasEval) score -= 8
  if (hasDebugger) score -= 6
  if (hasTodo) score -= 5
  if (hasHackyCast > 0) score -= Math.min(hasHackyCast * 4, 8)

  const vitality = Math.min(100, Math.max(0, Math.round(score * 1.0)))
  const stagnantCount = (hasVar > 0 ? 1 : 0) + (hasTodo ? 1 : 0)
  const formulaicCount = (hasEval ? 1 : 0) + (hasHackyCast > 0 ? 1 : 0)

  return {
    vitality,
    forge: classifyForge(vitality),
    hasHighVitality: vitality >= 80,
    hasActive: hasAsync || hasExport,
    hasNoDormant: !hasVar,
    hasEvolving: hasDoc && hasExport,
    hasNoStagnant: !hasVar && !hasTodo,
    hasFresh: hasConst && hasArrow,
    hasNoStale: !hasDebugger,
    hasInnovative: hasGenerics && hasReadonly,
    hasNoFormulaic: !hasEval && hasHackyCast === 0,
    hasDynamic: hasPipeline,
    hasNoStatic: !hasVar,
    hasAlive: hasExport && (hasAsync || hasArrow),
    hasNoDead: !hasEval && !hasDebugger,
    hasVibrant: hasNamed && hasDoc,
    stagnantCount,
    formulaicCount,
  }
}

// ─── Classification Helpers ────────────────────────────────────────

function classifyIron(strength: number): Iron {
  if (strength >= 90) return 'tempered-steel'
  if (strength >= 75) return 'wrought-iron'
  if (strength >= 60) return 'proper-metal'
  if (strength >= 40) return 'cast-iron'
  if (strength >= 20) return 'pig-iron'
  return 'no-strength'
}

function classifyCoat(resistance: number): Coat {
  if (resistance >= 90) return 'galvanized'
  if (resistance >= 75) return 'stainless'
  if (resistance >= 60) return 'proper-coating'
  if (resistance >= 40) return 'rusted-surface'
  if (resistance >= 20) return 'corroded-metal'
  return 'no-resistance'
}

function classifyBloom(precision: number): Bloom {
  if (precision >= 90) return 'perfect-bloom'
  if (precision >= 75) return 'beautiful-flower'
  if (precision >= 60) return 'proper-petal'
  if (precision >= 40) return 'wilted-flower'
  if (precision >= 20) return 'dead-bloom'
  return 'no-bloom'
}

function classifyRoot(depth: number): Root {
  if (depth >= 90) return 'deep-taproot'
  if (depth >= 75) return 'strong-roots'
  if (depth >= 60) return 'proper-foundation'
  if (depth >= 40) return 'shallow-roots'
  if (depth >= 20) return 'surface-root'
  return 'no-root'
}

function classifyForge(vitality: number): Forge {
  if (vitality >= 90) return 'blazing-forge'
  if (vitality >= 75) return 'hot-fire'
  if (vitality >= 60) return 'proper-heat'
  if (vitality >= 40) return 'dying-embers'
  if (vitality >= 20) return 'cold-hearth'
  return 'no-forge'
}

export function classifyBloomCondition(qualityScore: number): BloomCondition {
  if (qualityScore >= 90) return 'iron-masterpiece'
  if (qualityScore >= 75) return 'steel-garden'
  if (qualityScore >= 60) return 'proper-landscape'
  if (qualityScore >= 40) return 'rusty-bed'
  if (qualityScore >= 20) return 'withered-plot'
  return 'barren-earth'
}

export function classifyPlotType(blooms: IronBloom[]): PlotType {
  if (blooms.length === 0) return 'no-plot'
  const avgQs = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  const masterpieceRatio = blooms.filter(b => b.condition === 'iron-masterpiece').length / blooms.length
  if (avgQs >= 85 && masterpieceRatio >= 0.5) return 'grand-estate'
  if (avgQs >= 70 && masterpieceRatio >= 0.3) return 'formal-garden'
  if (avgQs >= 55) return 'proper-plot'
  if (avgQs >= 35) return 'small-bed'
  if (avgQs >= 15) return 'window-box'
  return 'no-plot'
}

export function classifyPlotCondition(avgStrength: number): PlotCondition {
  if (avgStrength >= 85) return 'iron-eden'
  if (avgStrength >= 70) return 'steel-oasis'
  if (avgStrength >= 55) return 'proper-garden'
  if (avgStrength >= 35) return 'rusty-patch'
  if (avgStrength >= 15) return 'withered-ground'
  return 'void'
}

export function classifyGardenerGrade(avgFertility: number): GardenerGrade {
  if (avgFertility >= 85) return 'master-ironworker'
  if (avgFertility >= 70) return 'skilled-forge-gardener'
  if (avgFertility >= 55) return 'proper-cultivator'
  if (avgFertility >= 40) return 'apprentice'
  if (avgFertility >= 20) return 'novice'
  return 'weed-puller'
}

// ─── analyzeIronBloom ──────────────────────────────────────────────

/**
 * @example analyzeIronBloom(content, 'src/foo.ts')
 */
export function analyzeIronBloom(content: string, filePath: string): IronBloom {
  const fortifying = measureFortifying(content)
  const protecting = measureProtecting(content)
  const flowering = measureFlowering(content)
  const rooting = measureRooting(content)
  const energizing = measureEnergizing(content)

  const strengthThroughNature = fortifying.strength
  const rustResistance = protecting.resistance
  const bloomPrecision = flowering.precision
  const rootDepth = rooting.depth
  const forgeVitality = energizing.vitality

  const qualityScore = Math.round(
    strengthThroughNature * 0.2 +
    rustResistance * 0.2 +
    bloomPrecision * 0.2 +
    rootDepth * 0.2 +
    forgeVitality * 0.2,
  )

  return {
    file: filePath,
    strengthThroughNature,
    rustResistance,
    bloomPrecision,
    rootDepth,
    forgeVitality,
    fortifying,
    protecting,
    flowering,
    rooting,
    energizing,
    condition: classifyBloomCondition(qualityScore),
    qualityScore,
  }
}

// ─── analyzeIronPlot ───────────────────────────────────────────────

/**
 * @example analyzeIronPlot(blooms, 'src')
 */
export function analyzeIronPlot(blooms: IronBloom[], dirPath: string): IronPlot {
  if (blooms.length === 0) {
    return {
      directory: dirPath,
      blooms: [],
      avgStrength: 0,
      avgPrecision: 0,
      avgVitality: 0,
      ironMasterpieceCount: 0,
      barrenEarthCount: 0,
      plotType: 'no-plot',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(blooms.reduce((s, b) => s + b.strengthThroughNature, 0) / blooms.length)
  const avgPrecision = Math.round(blooms.reduce((s, b) => s + b.bloomPrecision, 0) / blooms.length)
  const avgVitality = Math.round(blooms.reduce((s, b) => s + b.forgeVitality, 0) / blooms.length)
  const ironMasterpieceCount = blooms.filter(b => b.condition === 'iron-masterpiece').length
  const barrenEarthCount = blooms.filter(b => b.condition === 'barren-earth').length

  return {
    directory: dirPath,
    blooms,
    avgStrength,
    avgPrecision,
    avgVitality,
    ironMasterpieceCount,
    barrenEarthCount,
    plotType: classifyPlotType(blooms),
    condition: classifyPlotCondition(avgStrength),
  }
}

// ─── generateRecommendations ───────────────────────────────────────

/**
 * @example generateRecommendations(blooms, plots, estate, stats)
 */
export function generateRecommendations(
  blooms: IronBloom[],
  plots: IronPlot[],
  _estate: IronGardenResult['estate'],
  stats: IronGardenResult['stats'],
): string[] {
  const recs: string[] = []

  if (stats.overallFertility >= 85 && stats.barrenEarthCount === 0) {
    recs.push('Iron garden perfection — the forge blooms with tempered steel and vibrant nature')
    return recs
  }

  if (stats.avgStrengthThroughNature < 60) {
    recs.push('Strengthen the garden — add error handling, type safety, named exports, remove var and eval')
  }
  if (stats.avgRustResistance < 60) {
    recs.push('Improve rust resistance — add interfaces, readonly, generics, remove TODO and as any')
  }
  if (stats.avgBloomPrecision < 60) {
    recs.push('Sharpen bloom precision — add return types, type annotations, remove var and eval')
  }
  if (stats.avgRootDepth < 60) {
    recs.push('Deepen root foundations — add abstractions, documentation, imports, remove var and TODO')
  }
  if (stats.avgForgeVitality < 60) {
    recs.push('Fuel forge vitality — add async/await, pipelines, generics, remove var and debugger')
  }

  if (stats.barrenEarthCount > 0) {
    const barrenFiles = blooms.filter(b => b.condition === 'barren-earth').map(b => b.file)
    if (barrenFiles.length <= 3) {
      recs.push(`Barren earth detected: ${barrenFiles.join(', ')} — these need iron and care`)
    } else {
      recs.push(`${barrenFiles.length} barren files detected — they need iron and cultivation`)
    }
  }

  if (plots.length > 1) {
    const weakPlots = plots.filter(p => p.condition === 'rusty-patch' || p.condition === 'withered-ground')
    if (weakPlots.length > 0) {
      recs.push(`${weakPlots.length} plot(s) have rusty or withered conditions`)
    }
  }

  if (recs.length === 0) {
    recs.push('The iron garden holds steady — maintain current fertility')
  }

  return recs
}

// ─── gatherFiles ───────────────────────────────────────────────────

/**
 * @example gatherFiles('./src', ['.ts'], [])
 */
export async function gatherFiles(
  targetPath: string,
  extensions: string[],
  ignorePatterns: string[],
): Promise<string[]> {
  try {
    const patterns = extensions.length > 0
      ? extensions.map(ext => `**/*${ext}`)
      : ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']

    const defaultIgnore = ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.git/**']
    const ignore = Array.from(new Set([...defaultIgnore, ...ignorePatterns]))

    const files = await fg(patterns, {
      absolute: false,
      cwd: targetPath,
      ignore,
      onlyFiles: true,
    })

    return files.sort()
  } catch {
    return []
  }
}

// ─── buildIronGardenResult ─────────────────────────────────────────

/**
 * @example buildIronGardenResult(['a.ts'], [content])
 */
export async function buildIronGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronGardenResult> {
  const blooms: IronBloom[] = files.map((file, i) =>
    analyzeIronBloom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IronBloom[]>()
  for (const bloom of blooms) {
    const dir = path.dirname(bloom.file)
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bloom)
    } else {
      dirMap.set(dir, [bloom])
    }
  }

  const plots: IronPlot[] = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeIronPlot(dirBlooms, dir),
  )

  const avgStrengthThroughNature = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.strengthThroughNature, 0) / blooms.length)
    : 0
  const avgRustResistance = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rustResistance, 0) / blooms.length)
    : 0
  const avgBloomPrecision = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.bloomPrecision, 0) / blooms.length)
    : 0
  const avgRootDepth = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.rootDepth, 0) / blooms.length)
    : 0
  const avgForgeVitality = blooms.length > 0
    ? Math.round(blooms.reduce((s, b) => s + b.forgeVitality, 0) / blooms.length)
    : 0

  const overallFertility = Math.round(
    (avgStrengthThroughNature + avgBloomPrecision + avgForgeVitality) / 3,
  )

  const estate = {
    avgStrength: avgStrengthThroughNature,
    avgPrecision: avgBloomPrecision,
    avgVitality: avgForgeVitality,
    isIron: overallFertility >= 80,
    overallFertility,
  }

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => b.qualityScore > best.qualityScore ? b : best).file
    : ''
  const strongest = blooms.length > 0
    ? blooms.reduce((best, b) => b.strengthThroughNature > best.strengthThroughNature ? b : best).file
    : ''
  const mostResistant = blooms.length > 0
    ? blooms.reduce((best, b) => b.rustResistance > best.rustResistance ? b : best).file
    : ''
  const mostPrecise = blooms.length > 0
    ? blooms.reduce((best, b) => b.bloomPrecision > best.bloomPrecision ? b : best).file
    : ''
  const mostVital = blooms.length > 0
    ? blooms.reduce((best, b) => b.forgeVitality > best.forgeVitality ? b : best).file
    : ''

  const stats = {
    totalFiles: blooms.length,
    totalPlots: plots.length,
    avgStrengthThroughNature,
    avgRustResistance,
    avgBloomPrecision,
    avgRootDepth,
    avgForgeVitality,
    ironMasterpieceCount: blooms.filter(b => b.condition === 'iron-masterpiece').length,
    steelGardenCount: blooms.filter(b => b.condition === 'steel-garden').length,
    properLandscapeCount: blooms.filter(b => b.condition === 'proper-landscape').length,
    rustyBedCount: blooms.filter(b => b.condition === 'rusty-bed').length,
    witheredPlotCount: blooms.filter(b => b.condition === 'withered-plot').length,
    barrenEarthCount: blooms.filter(b => b.condition === 'barren-earth').length,
    hasHighStrengthCount: blooms.filter(b => b.fortifying.hasHighStrength).length,
    hasHighResistanceCount: blooms.filter(b => b.protecting.hasHighResistance).length,
    hasHighPrecisionCount: blooms.filter(b => b.flowering.hasHighPrecision).length,
    hasHighDepthCount: blooms.filter(b => b.rooting.hasHighDepth).length,
    hasHighVitalityCount: blooms.filter(b => b.energizing.hasHighVitality).length,
    overallFertility,
    gardenerGrade: classifyGardenerGrade(overallFertility),
    bestBloom,
    strongest,
    mostResistant,
    mostPrecise,
    mostVital,
  }

  const recommendations = generateRecommendations(blooms, plots, estate, { ...stats, recommendations: [] } as IronGardenResult['stats'])

  return {
    blooms,
    plots,
    estate,
    stats,
    recommendations,
  }
}
