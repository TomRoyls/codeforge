// ─── Interfaces ──────────────────────────────────────────

export interface GlassMeasure {
  quality: number
  type: 'crystal' | 'opal' | 'frosted' | 'amber' | 'onyx' | 'cobalt'
  isTransparent: boolean
  hasClarity: boolean
  hasNoBubbles: boolean
}

export interface LeadMeasure {
  strength: number
  type: 'h-came' | 'u-came' | 'round' | 'flat' | 'zinc' | 'copper'
  isStructural: boolean
  isSecure: boolean
  hasCorrosion: boolean
}

export interface ColorMeasure {
  richness: number
  palette: string[]
  hasVibrantColors: boolean
  hasFading: boolean
}

export interface PatternMeasure {
  complexity: number
  style: 'geometric' | 'organic' | 'floral' | 'abstract' | 'pictorial' | 'minimalist'
  hasSymmetry: boolean
  hasRadialBalance: boolean
}

export interface LightMeasure {
  transmission: number
  quality: number
  letsLightThrough: boolean
  hasDarkPatches: boolean
}

export interface StructureMeasure {
  integrity: number
  frame: 'stone' | 'iron' | 'wood' | 'bronze' | 'modern' | 'none'
  isStructurallySound: boolean
  hasIronReinforcement: boolean
}

export interface GlassPiece {
  file: string
  glass: GlassMeasure
  lead: LeadMeasure
  color: ColorMeasure
  pattern: PatternMeasure
  light: LightMeasure
  structure: StructureMeasure
  condition: 'cathedral-masterpiece' | 'rose-window' | 'mosaic-beauty' | 'opal-dream' | 'tarnished-glass' | 'cracked-panel' | 'shattered'
  qualityScore: number
}

export interface Workshop {
  directory: string
  pieces: GlassPiece[]
  avgQuality: number
  avgTransmission: number
  avgComplexity: number
  masterworkCount: number
  shatteredCount: number
  workshopType: 'cathedral-studio' | 'artisan-workshop' | 'guild-hall' | 'village-craft' | 'roadside-stall' | 'salvage-yard'
  condition: 'radiant-glow' | 'well-lit' | 'soft-light' | 'dim' | 'shadowed' | 'darkness'
}

export interface PatternStats {
  totalFiles: number
  totalWorkshops: number
  avgQuality: number
  avgTransmission: number
  avgComplexity: number
  avgRichness: number
  avgStrength: number
  avgIntegrity: number
  crystalCount: number
  opalCount: number
  frostedCount: number
  amberCount: number
  onyxCount: number
  cobaltCount: number
  transparentCount: number
  clearCount: number
  vibrantCount: number
  fadingCount: number
  symmetricCount: number
  radialBalanceCount: number
  soundCount: number
  reinforcedCount: number
  secureCount: number
  cathedralMasterpieceCount: number
  roseWindowCount: number
  mosaicBeautyCount: number
  opalDreamCount: number
  tarnishedGlassCount: number
  crackedPanelCount: number
  shatteredCount: number
  overallBrilliance: number
  artisanGrade: 'master-glazier' | 'artisan' | 'journeyman' | 'apprentice' | 'novice' | 'finger-painter'
  bestPiece: string
  mostColorful: string
  strongestLead: string
  mostComplex: string
}

export interface StainedGlassPatternResult {
  pieces: GlassPiece[]
  workshops: Workshop[]
  stats: PatternStats
  recommendations: string[]
}

// ─── Counting Utilities ─────────────────────────────────

/**
 * Count non-empty lines
 * @example
 * countLoc('const a = 1\n\nconst b = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count function declarations
 * @example
 * countFunctions('function foo() {}') // 1
 */
export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

/**
 * Count class declarations
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count interface declarations
 * @example
 * countInterfaces('interface Foo {}') // 1
 */
export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count type aliases
 * @example
 * countTypes('type Foo = string') // 1
 */
export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

/**
 * Count enum declarations
 * @example
 * countEnums('enum Foo { A, B }') // 1
 */
export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

/**
 * Count export statements
 * @example
 * countExports('export const a = 1') // 1
 */
export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

/**
 * Count import statements
 * @example
 * countImports("import { foo } from 'bar'") // 1
 */
export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** docs *\/') // 1
 */
export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

/**
 * Count all comments (line + block)
 * @example
 * countComments('const a = 1 // inline') // 1
 */
export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

/**
 * Count error handling keywords
 * @example
 * countErrorHandling('try { } catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

/**
 * Count TODO markers
 * @example
 * countTodos('// TODO: fix this') // 1
 */
export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

/**
 * Count console calls
 * @example
 * countConsole('console.log("hi")') // 1
 */
export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

/**
 * Count branches (if, switch, ternary)
 * @example
 * countBranches('if (x) {} else {}') // 1
 */
export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?\s*[^;:]*\s*:/g) || []).length
  return ifs + switches + ternaries
}

/**
 * Count descriptive function/method names
 * @example
 * countDescriptiveNames('function getData() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

/**
 * Count default keywords
 * @example
 * countDefaults('export default class {}') // 1
 */
export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

/**
 * Count deprecated markers
 * @example
 * countDeprecated('@deprecated use x instead') // 1
 */
export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

/**
 * Count return type annotations
 * @example
 * countReturnTypes('function foo(): string {}') // 1
 */
export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

/**
 * Count generic type parameters
 * @example
 * countGenerics('function foo<T>() {}') // 1
 */
export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

/**
 * Count arrow functions
 * @example
 * countArrowFunctions('const f = () => 1') // 1
 */
export function countArrowFunctions(content: string): number {
  const m = content.match(/=>/g)
  return m ? m.length : 0
}

/**
 * Count async keywords
 * @example
 * countAsync('async function foo() {}') // 1
 */
export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

/**
 * Count await keywords
 * @example
 * countAwait('await foo()') // 1
 */
export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

// ─── Glass Measurement ──────────────────────────────────

/**
 * Measure code transparency and clarity
 * @example
 * measureGlass('const x: number = 1') // { quality, type, isTransparent, hasClarity, hasNoBubbles }
 */
export function measureGlass(content: string): GlassMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const todos = countTodos(content)
  const consoleCalls = countConsole(content)

  const quality = loc === 0 ? 15 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 25 : 0) +
    (todos === 0 ? 15 : 0) +
    (consoleCalls === 0 ? 10 : 0) +
    (loc < 50 ? 10 : 0),
  )))

  const isTransparent = quality >= 70
  const hasClarity = jsdoc > 0 && types > 0
  const hasNoBubbles = todos === 0 && consoleCalls === 0

  let type: GlassMeasure['type'] = 'frosted'
  if (quality >= 80) type = 'crystal'
  else if (quality >= 60 && hasClarity) type = 'opal'
  else if (quality >= 40) type = 'frosted'
  else if (quality >= 25) type = 'amber'
  else if (types === 0 && loc > 0) type = 'onyx'
  else if (quality >= 15) type = 'cobalt'

  return { quality, type, isTransparent, hasClarity, hasNoBubbles }
}

// ─── Lead Measurement ───────────────────────────────────

/**
 * Measure interface boundary quality
 * @example
 * measureLead('interface Foo { x: number }') // { strength, type, isStructural, isSecure, hasCorrosion }
 */
export function measureLead(content: string): LeadMeasure {
  const loc = countLoc(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const deprecated = countDeprecated(content)
  const todos = countTodos(content)

  const strength = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (interfaces > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (countClasses(content) > 0 ? 10 : 0) +
    (countFunctions(content) > 0 ? 5 : 0),
  )))

  const isStructural = interfaces > 0 || countTypes(content) > 0
  const isSecure = errors > 0 && strength >= 40
  const hasCorrosion = deprecated > 0 || todos > 2

  let type: LeadMeasure['type'] = 'flat'
  if (interfaces > 0 && exports > 0) type = 'h-came'
  else if (interfaces > 0) type = 'u-came'
  else if (exports > 0 && imports > 0) type = 'round'
  else if (types > 0) type = 'zinc'
  else if (errors > 0) type = 'copper'
  else if (strength >= 30) type = 'flat'

  return { strength, type, isStructural, isSecure, hasCorrosion }
}

// ─── Color Measurement ──────────────────────────────────

/**
 * Measure construct variety and richness
 * @example
 * measureColor('interface Foo {} class Bar {}') // { richness, palette, hasVibrantColors, hasFading }
 */
export function measureColor(content: string): ColorMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const enums = countEnums(content)
  const types = countTypes(content)
  const exports = countExports(content)
  const imports = countImports(content)

  const palette: string[] = []
  if (functions > 0) palette.push('function')
  if (classes > 0) palette.push('class')
  if (interfaces > 0) palette.push('interface')
  if (enums > 0) palette.push('enum')
  if (types > 0) palette.push('type')
  if (exports > 0) palette.push('export')
  if (imports > 0) palette.push('import')
  if (countAsync(content) > 0) palette.push('async')
  if (countArrowFunctions(content) > 0) palette.push('arrow')
  if (countGenerics(content) > 0) palette.push('generic')

  const richness = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (palette.length * 9) +
    (functions > 0 ? 4 : 0) +
    (classes > 0 ? 4 : 0) +
    (interfaces > 0 ? 4 : 0),
  )))

  const hasVibrantColors = palette.length >= 5
  const hasFading = countDeprecated(content) > 0 || countTodos(content) > 3

  return {
    richness,
    palette: Array.from(new Set(palette)),
    hasVibrantColors,
    hasFading,
  }
}

// ─── Pattern Measurement ────────────────────────────────

/**
 * Measure code organization and complexity
 * @example
 * measurePattern('if (x) { foo() } else { bar() }') // { complexity, style, hasSymmetry, hasRadialBalance }
 */
export function measurePattern(content: string): PatternMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const branches = countBranches(content)

  const complexity = loc === 0 ? 5 : Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (classes * 10) +
    (branches * 5) +
    (interfaces * 3) +
    (countGenerics(content) * 4),
  )))

  const hasSymmetry = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 2
  const hasRadialBalance = imports > 0 && exports > 0 && functions > 0

  let style: PatternMeasure['style'] = 'minimalist'
  if (exports > 0 && interfaces > 0 && classes > 0) style = 'geometric'
  else if (functions > 3 && exports === 0) style = 'organic'
  else if (imports > 0 && functions > 0 && exports > 0) style = 'floral'
  else if (classes > 0 && functions > 0 && !hasSymmetry) style = 'abstract'
  else if (countDescriptiveNames(content) > 3 && jsdocPresent(content)) style = 'pictorial'
  else if (functions > 0 || exports > 0) style = 'minimalist'

  return { complexity, style, hasSymmetry, hasRadialBalance }
}

/**
 * Check if JSDoc is present
 * @example
 * jsdocPresent('/** docs *\/ const x = 1') // true
 */
export function jsdocPresent(content: string): boolean {
  return countJSDoc(content) > 0
}

// ─── Light Measurement ──────────────────────────────────

/**
 * Measure documentation illumination
 * @example
 * measureLight('/** docs *\/ const x: number = 1') // { transmission, quality, letsLightThrough, hasDarkPatches }
 */
export function measureLight(content: string): LightMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const descriptive = countDescriptiveNames(content)
  const returnTypes = countReturnTypes(content)

  const transmission = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 10 : 0) +
    (descriptive > 0 ? 15 : 0) +
    (returnTypes > 0 ? 10 : 0),
  )))

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 35 : 0) +
    (comments > 0 ? 10 : 0) +
    (types > 0 ? 20 : 0) +
    (descriptive > 0 ? 20 : 0) +
    (returnTypes > 0 ? 15 : 0),
  )))

  const letsLightThrough = transmission >= 40
  const hasDarkPatches = jsdoc === 0 && loc > 10

  return { transmission, quality, letsLightThrough, hasDarkPatches }
}

// ─── Structure Measurement ──────────────────────────────

/**
 * Measure structural integrity
 * @example
 * measureStructure('try { foo() } catch(e) {}') // { integrity, frame, isStructurallySound, hasIronReinforcement }
 */
export function measureStructure(content: string): StructureMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const generics = countGenerics(content)
  const errors = countErrorHandling(content)

  const integrity = loc === 0 ? 10 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0) +
    (errors > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (generics > 0 ? 10 : 0),
  )))

  const isStructurallySound = integrity >= 50
  const hasIronReinforcement = errors > 0 && types > 0

  let frame: StructureMeasure['frame'] = 'none'
  if (generics > 0 || types > 5) frame = 'stone'
  else if (countClasses(content) > 0 && errors > 0) frame = 'iron'
  else if (errors > 0 && countDefaults(content) > 0) frame = 'wood'
  else if (interfaces > 0 && generics > 0) frame = 'bronze'
  else if (types > 0 && exports > 0) frame = 'modern'

  return { integrity, frame, isStructurallySound, hasIronReinforcement }
}

// ─── Piece Analysis ─────────────────────────────────────

/**
 * Analyze a single file as a glass piece
 * @example
 * analyzeGlassPiece(content, filePath) // GlassPiece
 */
export function analyzeGlassPiece(content: string, filePath: string): GlassPiece {
  const glass = measureGlass(content)
  const lead = measureLead(content)
  const color = measureColor(content)
  const pattern = measurePattern(content)
  const light = measureLight(content)
  const structure = measureStructure(content)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (glass.quality * 0.20) +
    (lead.strength * 0.15) +
    (color.richness * 0.15) +
    (pattern.complexity * 0.10) +
    (light.transmission * 0.20) +
    (structure.integrity * 0.20),
  )))

  const condition = classifyCondition(qualityScore, glass, light)

  return {
    file: filePath,
    glass,
    lead,
    color,
    pattern,
    light,
    structure,
    condition,
    qualityScore,
  }
}

/**
 * Classify piece condition
 * @example
 * classifyCondition(90, glass, light) // 'cathedral-masterpiece'
 */
export function classifyCondition(
  score: number,
  glass: GlassMeasure,
  light: LightMeasure,
): GlassPiece['condition'] {
  if (score >= 80 && glass.isTransparent && light.letsLightThrough) return 'cathedral-masterpiece'
  if (score >= 65 && glass.hasClarity) return 'rose-window'
  if (score >= 50) return 'mosaic-beauty'
  if (score >= 40 && light.transmission > 30) return 'opal-dream'
  if (score >= 25) return 'tarnished-glass'
  if (score >= 15) return 'cracked-panel'
  return 'shattered'
}

// ─── Workshop Analysis ──────────────────────────────────

/**
 * Analyze a directory as a workshop
 * @example
 * analyzeWorkshop(pieces, dirPath) // Workshop
 */
export function analyzeWorkshop(pieces: GlassPiece[], dirPath: string): Workshop {
  const count = pieces.length
  if (count === 0) {
    return {
      directory: dirPath,
      pieces: [],
      avgQuality: 0,
      avgTransmission: 0,
      avgComplexity: 0,
      masterworkCount: 0,
      shatteredCount: 0,
      workshopType: 'salvage-yard',
      condition: 'darkness',
    }
  }

  const avgQuality = Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / count)
  const avgTransmission = Math.round(pieces.reduce((s, p) => s + p.light.transmission, 0) / count)
  const avgComplexity = Math.round(pieces.reduce((s, p) => s + p.pattern.complexity, 0) / count)

  const masterworkCount = pieces.filter(p => p.condition === 'cathedral-masterpiece').length
  const shatteredCount = pieces.filter(p => p.condition === 'shattered').length

  const workshopType = classifyWorkshopType(pieces, avgQuality)
  const condition = classifyWorkshopCondition(avgTransmission)

  return {
    directory: dirPath,
    pieces,
    avgQuality,
    avgTransmission,
    avgComplexity,
    masterworkCount,
    shatteredCount,
    workshopType,
    condition,
  }
}

/**
 * Classify workshop type
 * @example
 * classifyWorkshopType(pieces, 80) // 'cathedral-studio'
 */
export function classifyWorkshopType(pieces: GlassPiece[], avgQuality: number): Workshop['workshopType'] {
  if (pieces.length === 0) return 'salvage-yard'
  const masterRatio = pieces.filter(p => p.condition === 'cathedral-masterpiece').length / pieces.length
  const allGood = pieces.every(p => p.qualityScore >= 50)

  if (masterRatio >= 0.5 && avgQuality >= 70) return 'cathedral-studio'
  if (allGood && avgQuality >= 55) return 'guild-hall'
  if (avgQuality >= 45) return 'artisan-workshop'
  if (avgQuality >= 30) return 'village-craft'
  if (avgQuality >= 15) return 'roadside-stall'
  return 'salvage-yard'
}

/**
 * Classify workshop condition
 * @example
 * classifyWorkshopCondition(80) // 'radiant-glow'
 */
export function classifyWorkshopCondition(avgTransmission: number): Workshop['condition'] {
  if (avgTransmission >= 75) return 'radiant-glow'
  if (avgTransmission >= 60) return 'well-lit'
  if (avgTransmission >= 45) return 'soft-light'
  if (avgTransmission >= 30) return 'dim'
  if (avgTransmission >= 15) return 'shadowed'
  return 'darkness'
}

// ─── Artisan Grade ──────────────────────────────────────

/**
 * Classify artisan grade from brilliance
 * @example
 * classifyArtisanGrade(90) // 'master-glazier'
 */
export function classifyArtisanGrade(avgBrilliance: number): PatternStats['artisanGrade'] {
  if (avgBrilliance >= 75) return 'master-glazier'
  if (avgBrilliance >= 60) return 'artisan'
  if (avgBrilliance >= 45) return 'journeyman'
  if (avgBrilliance >= 30) return 'apprentice'
  if (avgBrilliance >= 15) return 'novice'
  return 'finger-painter'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations based on analysis
 * @example
 * generatePatternRecommendations(pieces, workshops, stats) // ['Add JSDoc...']
 */
export function generatePatternRecommendations(
  _pieces: GlassPiece[],
  _workshops: Workshop[],
  stats: PatternStats,
): string[] {
  const recs: string[] = []

  if (stats.shatteredCount > 0) {
    recs.push('Add documentation and type annotations to shattered files')
  }
  if (stats.fadingCount > stats.totalFiles * 0.3) {
    recs.push('Remove deprecated markers and resolve TODOs to restore color vibrancy')
  }
  if (stats.transparentCount < stats.totalFiles * 0.3) {
    recs.push('Improve code transparency with JSDoc comments and type annotations')
  }
  if (stats.avgStrength < 35) {
    recs.push('Define interfaces to strengthen structural lead boundaries')
  }
  if (stats.symmetricCount < stats.totalFiles * 0.2) {
    recs.push('Balance imports and exports for better pattern symmetry')
  }
  if (stats.avgIntegrity < 35) {
    recs.push('Add error handling and type safety for better structural integrity')
  }
  if (stats.tarnishedGlassCount > stats.totalFiles * 0.3) {
    recs.push('Refactor tarnished files to improve overall pattern quality')
  }
  if (stats.radialBalanceCount < stats.totalFiles * 0.3) {
    recs.push('Structure files with imports, logic, and exports for radial balance')
  }

  if (recs.length === 0) {
    recs.push('Continue maintaining high pattern quality and glass transparency')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full stained glass pattern result
 * @example
 * buildStainedGlassPatternResult(files, contents, {}) // StainedGlassPatternResult
 */
export function buildStainedGlassPatternResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): StainedGlassPatternResult {
  const pieces: GlassPiece[] = files.map((file, i) =>
    analyzeGlassPiece(contents[i] ?? '', file),
  )

  const workshopMap = new Map<string, GlassPiece[]>()
  for (const piece of pieces) {
    const dir = piece.file.includes('/') ? piece.file.substring(0, piece.file.lastIndexOf('/')) : '.'
    const existing = workshopMap.get(dir)
    if (existing) {
      existing.push(piece)
    } else {
      workshopMap.set(dir, [piece])
    }
  }

  const workshops: Workshop[] = Array.from(workshopMap.entries()).map(([dir, wPieces]) =>
    analyzeWorkshop(wPieces, dir),
  )

  const totalFiles = pieces.length
  const avg = (fn: (p: GlassPiece) => number) =>
    totalFiles === 0 ? 0 : Math.round(pieces.reduce((s, p) => s + fn(p), 0) / totalFiles)

  const overallBrilliance = avg(p => p.qualityScore)

  const bestPiece = pieces.length > 0
    ? pieces.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best, pieces[0] as typeof pieces[number]).file
    : ''
  const mostColorful = pieces.length > 0
    ? pieces.reduce((best, p) => p.color.richness > best.color.richness ? p : best, pieces[0] as typeof pieces[number]).file
    : ''
  const strongestLead = pieces.length > 0
    ? pieces.reduce((best, p) => p.lead.strength > best.lead.strength ? p : best, pieces[0] as typeof pieces[number]).file
    : ''
  const mostComplex = pieces.length > 0
    ? pieces.reduce((best, p) => p.pattern.complexity > best.pattern.complexity ? p : best, pieces[0] as typeof pieces[number]).file
    : ''

  const stats: PatternStats = {
    totalFiles,
    totalWorkshops: workshops.length,
    avgQuality: avg(p => p.qualityScore),
    avgTransmission: avg(p => p.light.transmission),
    avgComplexity: avg(p => p.pattern.complexity),
    avgRichness: avg(p => p.color.richness),
    avgStrength: avg(p => p.lead.strength),
    avgIntegrity: avg(p => p.structure.integrity),
    crystalCount: pieces.filter(p => p.glass.type === 'crystal').length,
    opalCount: pieces.filter(p => p.glass.type === 'opal').length,
    frostedCount: pieces.filter(p => p.glass.type === 'frosted').length,
    amberCount: pieces.filter(p => p.glass.type === 'amber').length,
    onyxCount: pieces.filter(p => p.glass.type === 'onyx').length,
    cobaltCount: pieces.filter(p => p.glass.type === 'cobalt').length,
    transparentCount: pieces.filter(p => p.glass.isTransparent).length,
    clearCount: pieces.filter(p => p.glass.hasClarity).length,
    vibrantCount: pieces.filter(p => p.color.hasVibrantColors).length,
    fadingCount: pieces.filter(p => p.color.hasFading).length,
    symmetricCount: pieces.filter(p => p.pattern.hasSymmetry).length,
    radialBalanceCount: pieces.filter(p => p.pattern.hasRadialBalance).length,
    soundCount: pieces.filter(p => p.structure.isStructurallySound).length,
    reinforcedCount: pieces.filter(p => p.structure.hasIronReinforcement).length,
    secureCount: pieces.filter(p => p.lead.isSecure).length,
    cathedralMasterpieceCount: pieces.filter(p => p.condition === 'cathedral-masterpiece').length,
    roseWindowCount: pieces.filter(p => p.condition === 'rose-window').length,
    mosaicBeautyCount: pieces.filter(p => p.condition === 'mosaic-beauty').length,
    opalDreamCount: pieces.filter(p => p.condition === 'opal-dream').length,
    tarnishedGlassCount: pieces.filter(p => p.condition === 'tarnished-glass').length,
    crackedPanelCount: pieces.filter(p => p.condition === 'cracked-panel').length,
    shatteredCount: pieces.filter(p => p.condition === 'shattered').length,
    overallBrilliance,
    artisanGrade: classifyArtisanGrade(overallBrilliance),
    bestPiece,
    mostColorful,
    strongestLead,
    mostComplex,
  }

  const recommendations = generatePatternRecommendations(pieces, workshops, stats)

  return { pieces, workshops, stats, recommendations }
}
