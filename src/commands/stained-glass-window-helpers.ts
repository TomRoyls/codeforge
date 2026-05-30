// ─── Interfaces ──────────────────────────────────────────

export interface GlassMeasure {
  type: 'cathedral' | 'opaque' | 'seeded' | 'rippled' | 'streaky' | 'bullseye'
  thickness: number
  isTransparent: boolean
  isTranslucent: boolean
  isOpaque: boolean
  hasBubbles: boolean
  hasSeeds: boolean
  hasStriations: boolean
  clarity: number
}

export interface LightMeasure {
  transmission: number
  isIlluminated: boolean
  hasSunlight: boolean
  hasDappled: boolean
  isShadowed: boolean
  isDark: boolean
  hasPrismaticEffect: boolean
  illuminationScore: number
}

export interface ColorMeasure {
  richness: number
  palette: string[]
  isJewelToned: boolean
  isPastel: boolean
  isMonochrome: boolean
  hasComplementary: boolean
  hasClashing: boolean
  hasSacredRed: boolean
  hasRoyalBlue: boolean
  hasCelestialGold: boolean
}

export interface LeadMeasure {
  quality: number
  hasCleanJoints: boolean
  hasSolderMarks: boolean
  hasWeakPoints: boolean
  hasLeadFree: boolean
  isStructurallySound: boolean
  jointCount: number
  weakPointCount: number
}

export interface PanelMeasure {
  arrangement: number
  hasGeometricPattern: boolean
  hasOrganicPattern: boolean
  hasNarrativeFlow: boolean
  hasChaoticPattern: boolean
  hasSymmetry: boolean
  panelCount: number
  patternType: 'geometric' | 'floral' | 'narrative' | 'abstract' | 'medallion' | 'chaotic'
}

export interface FrameMeasure {
  quality: number
  hasStoneTracery: boolean
  hasIronArmature: boolean
  isWeatherTight: boolean
  hasOrnamentation: boolean
  hasDamage: boolean
  isIntact: boolean
}

export interface StoryMeasure {
  isTold: boolean
  isClear: boolean
  hasBeginning: boolean
  hasMiddle: boolean
  hasEnd: boolean
  hasPlotTwist: boolean
  narrativeScore: number
}

export interface GlassPanel {
  file: string
  lightTransmission: number
  colorRichness: number
  leadQuality: number
  glassThickness: number
  panelArrangement: number
  windowFraming: number
  glass: GlassMeasure
  light: LightMeasure
  color: ColorMeasure
  lead: LeadMeasure
  panel: PanelMeasure
  frame: FrameMeasure
  story: StoryMeasure
  condition: 'cathedral-masterpiece' | 'rose-window' | 'beautiful-window' | 'clear-glass' | 'cracked-glass' | 'bricked-up'
  qualityScore: number
}

export interface WindowBay {
  directory: string
  panels: GlassPanel[]
  avgLightTransmission: number
  avgColorRichness: number
  avgLeadQuality: number
  masterpieceCount: number
  brickedUpCount: number
  illuminatedCount: number
  darkCount: number
  bayType: 'cathedral-bay' | 'chapel-window' | 'rose-window-bay' | 'cloister' | 'crypt' | 'walled-up'
  condition: 'divine-light' | 'radiant' | 'well-lit' | 'dim' | 'gloomy' | 'darkness'
}

export interface CathedralMeasure {
  avgLightTransmission: number
  avgColorRichness: number
  avgLeadQuality: number
  isIlluminated: boolean
  overallBrilliance: number
}

export interface StainedGlassWindowStats {
  totalFiles: number
  totalBays: number
  avgLightTransmission: number
  avgColorRichness: number
  avgLeadQuality: number
  avgGlassThickness: number
  avgPanelArrangement: number
  avgWindowFraming: number
  cathedralMasterpieceCount: number
  roseWindowCount: number
  beautifulWindowCount: number
  clearGlassCount: number
  crackedGlassCount: number
  brickedUpCount: number
  transparentCount: number
  opaqueCount: number
  illuminatedCount: number
  shadowedCount: number
  darkCount: number
  jewelTonedCount: number
  monochromeCount: number
  hasCleanJointsCount: number
  isWeatherTightCount: number
  hasNarrativeFlowCount: number
  hasSymmetryCount: number
  isToldCount: number
  isIntactCount: number
  overallBrilliance: number
  glazierGrade: 'master-glazier' | 'glazier' | 'glass-artisan' | 'apprentice' | 'hobbyist' | 'vandal'
  mostBrilliant: string
  mostColorful: string
  cleanestLead: string
  bestFramed: string
  bestStory: string
}

export interface StainedGlassWindowResult {
  panels: GlassPanel[]
  bays: WindowBay[]
  cathedral: CathedralMeasure
  stats: StainedGlassWindowStats
  recommendations: string[]
}

// ─── Utility helpers ────────────────────────────────────

export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countEnums(content: string): number {
  const m = content.match(/\benum\s+\w+/g)
  return m ? m.length : 0
}

export function countTypes(content: string): number {
  const m = content.match(/\btype\s+\w+\s*=/g)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  return ifs + switches + ternaries
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countDefaults(content: string): number {
  const m = content.match(/\bdefault\b/g)
  return m ? m.length : 0
}

export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

export function countGenerics(content: string): number {
  const m = content.match(/<\w+>/g)
  return m ? m.length : 0
}

export function countArrowFunctions(content: string): number {
  const m = content.match(/=>/g)
  return m ? m.length : 0
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAwait(content: string): number {
  const m = content.match(/\bawait\b/g)
  return m ? m.length : 0
}

// ─── Glass Measurement ──────────────────────────────────

/**
 * Measure code transparency/clarity
 * @example
 * measureGlass(codeString) // { type, thickness, clarity, ... }
 */
export function measureGlass(content: string): GlassMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const todos = countTodos(content)

  const clarity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 25 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (functions > 0 && branches < functions * 3 ? 15 : 0) +
    (todos === 0 ? 15 : 0) +
    (loc < 50 ? 10 : 0),
  )))

  const thickness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (countClasses(content) * 10) +
    (countInterfaces(content) * 5) +
    (branches * 3),
  )))

  const isTransparent = clarity >= 70
  const isOpaque = clarity < 30
  const isTranslucent = !isTransparent && !isOpaque
  const hasBubbles = todos > 0 || countConsole(content) > 0
  const hasSeeds = branches > functions * 3 && functions > 0
  const hasStriations = types > 0 && comments > 0

  let type: GlassMeasure['type'] = 'cathedral'
  if (isOpaque) type = 'opaque'
  else if (isTransparent) type = 'cathedral'
  else if (hasSeeds) type = 'seeded'
  else if (thickness > 70) type = 'bullseye'
  else if (hasBubbles) type = 'rippled'
  else if (hasStriations) type = 'streaky'

  return {
    type,
    thickness,
    isTransparent,
    isTranslucent,
    isOpaque,
    hasBubbles,
    hasSeeds,
    hasStriations,
    clarity,
  }
}

// ─── Light Measurement ──────────────────────────────────

/**
 * Measure documentation illumination
 * @example
 * measureLight(codeString) // { transmission, isIlluminated, ... }
 */
export function measureLight(content: string): LightMeasure {
  const loc = countLoc(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const functions = countFunctions(content)

  const transmission = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 30 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 5 : 0),
  )))

  const illuminationScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (jsdoc > 0 ? 35 : 0) +
    (comments > 0 ? 15 : 0) +
    (types > 0 ? 20 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0) +
    (countReturnTypes(content) > 0 ? 5 : 0),
  )))

  const isIlluminated = illuminationScore >= 60
  const hasSunlight = jsdoc >= 3 && types > 0 && exports > 0
  const hasDappled = (jsdoc > 0 || comments > 0) && !hasSunlight
  const isShadowed = jsdoc === 0 && comments > 0
  const isDark = jsdoc === 0 && comments === 0 && loc > 0
  const hasPrismaticEffect = jsdoc > 0 && types > 0 && countGenerics(content) > 0

  return {
    transmission,
    isIlluminated,
    hasSunlight,
    hasDappled,
    isShadowed,
    isDark,
    hasPrismaticEffect,
    illuminationScore,
  }
}

// ─── Color Measurement ──────────────────────────────────

/**
 * Measure construct variety
 * @example
 * measureColor(codeString) // { richness, palette, isJewelToned, ... }
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

  const richness = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (palette.length * 10) +
    (functions > 0 ? 5 : 0) +
    (classes > 0 ? 5 : 0) +
    (interfaces > 0 ? 5 : 0),
  )))

  const isJewelToned = palette.length >= 5
  const isPastel = palette.length >= 2 && palette.length < 5
  const isMonochrome = palette.length <= 1
  const hasComplementary = functions > 0 && classes > 0 && interfaces > 0
  const hasClashing = countTodos(content) > 2 || countDeprecated(content) > 0

  const hasSacredRed = countErrorHandling(content) > 0
  const hasRoyalBlue = classes > 0 && interfaces > 0
  const hasCelestialGold = countJSDoc(content) > 0 && countReturnTypes(content) > 0

  return {
    richness,
    palette: Array.from(new Set(palette)),
    isJewelToned,
    isPastel,
    isMonochrome,
    hasComplementary,
    hasClashing,
    hasSacredRed,
    hasRoyalBlue,
    hasCelestialGold,
  }
}

// ─── Lead Measurement ───────────────────────────────────

/**
 * Measure interface boundary quality
 * @example
 * measureLead(codeString) // { quality, hasCleanJoints, ... }
 */
export function measureLead(content: string): LeadMeasure {
  const loc = countLoc(content)
  const interfaces = countInterfaces(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (interfaces > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (imports > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0),
  )))

  const jointCount = interfaces + exports + imports
  const weakPointCount = countTodos(content) + countDeprecated(content) + countConsole(content)

  const hasCleanJoints = interfaces > 0 && exports > 0 && weakPointCount === 0
  const hasSolderMarks = imports > 3 || exports > 5
  const hasWeakPoints = weakPointCount > 0
  const hasLeadFree = interfaces === 0 && types === 0 && loc > 0
  const isStructurallySound = quality >= 60

  return {
    quality,
    hasCleanJoints,
    hasSolderMarks,
    hasWeakPoints,
    hasLeadFree,
    isStructurallySound,
    jointCount,
    weakPointCount,
  }
}

// ─── Panel Measurement ──────────────────────────────────

/**
 * Measure code organization
 * @example
 * measurePanel(codeString) // { arrangement, hasGeometricPattern, ... }
 */
export function measurePanel(content: string): PanelMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)

  const arrangement = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports > 0 ? 15 : 0) +
    (exports > 0 ? 15 : 0) +
    (interfaces > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (functions > 0 ? 10 : 0) +
    (comments > 0 ? 10 : 0) +
    (jsdoc > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (loc < 100 ? 10 : 0),
  )))

  const panelCount = functions + classes + interfaces + countEnums(content) + countTypes(content)

  const hasGeometricPattern = exports > 0 && interfaces > 0 && classes > 0
  const hasOrganicPattern = functions > 3 && exports === 0
  const hasNarrativeFlow = imports > 0 && functions > 0 && exports > 0
  const hasChaoticPattern = loc > 20 && exports === 0 && interfaces === 0 && comments === 0
  const hasSymmetry = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 2

  let patternType: PanelMeasure['patternType'] = 'chaotic'
  if (hasGeometricPattern) patternType = 'geometric'
  else if (hasNarrativeFlow) patternType = 'narrative'
  else if (hasOrganicPattern) patternType = 'floral'
  else if (classes > 0 && functions > 0) patternType = 'medallion'
  else if (functions > 0 || exports > 0) patternType = 'abstract'

  return {
    arrangement,
    hasGeometricPattern,
    hasOrganicPattern,
    hasNarrativeFlow,
    hasChaoticPattern,
    hasSymmetry,
    panelCount,
    patternType,
  }
}

// ─── Frame Measurement ──────────────────────────────────

/**
 * Measure API design quality
 * @example
 * measureFrame(codeString) // { quality, hasStoneTracery, ... }
 */
export function measureFrame(content: string): FrameMeasure {
  const loc = countLoc(content)
  const types = countTypeAnnotations(content)
  const exports = countExports(content)
  const interfaces = countInterfaces(content)
  const generics = countGenerics(content)

  const quality = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (exports > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (countJSDoc(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (generics > 0 ? 5 : 0),
  )))

  const hasStoneTracery = types > 3 || generics > 0
  const hasIronArmature = countClasses(content) > 0 && countErrorHandling(content) > 0
  const isWeatherTight = countErrorHandling(content) > 0 && countDefaults(content) > 0
  const hasOrnamentation = countJSDoc(content) > 0 && countDescriptiveNames(content) > 0
  const hasDamage = countDeprecated(content) > 0 || countTodos(content) > 2
  const isIntact = quality >= 60 && !hasDamage

  return {
    quality,
    hasStoneTracery,
    hasIronArmature,
    isWeatherTight,
    hasOrnamentation,
    hasDamage,
    isIntact,
  }
}

// ─── Story Measurement ──────────────────────────────────

/**
 * Measure code narrative quality
 * @example
 * measureStory(codeString) // { isTold, isClear, narrativeScore, ... }
 */
export function measureStory(content: string): StoryMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const hasBeginning = exports > 0 || countImports(content) > 0
  const hasMiddle = functions > 0 || countClasses(content) > 0
  const hasEnd = countReturnTypes(content) > 0 || errors > 0
  const hasPlotTwist = countAsync(content) > 0 || countAwait(content) > 0

  const narrativeScore = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (hasBeginning ? 20 : 0) +
    (hasMiddle ? 20 : 0) +
    (hasEnd ? 20 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (types > 0 ? 10 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (errors > 0 ? 5 : 0),
  )))

  const isTold = hasBeginning && hasMiddle && hasEnd
  const isClear = narrativeScore >= 60

  return {
    isTold,
    isClear,
    hasBeginning,
    hasMiddle,
    hasEnd,
    hasPlotTwist,
    narrativeScore,
  }
}

// ─── Panel Analysis ─────────────────────────────────────

/**
 * Analyze a single file as a glass panel
 * @example
 * analyzeGlassPanel(content, filePath) // GlassPanel
 */
export function analyzeGlassPanel(content: string, filePath: string): GlassPanel {
  const glass = measureGlass(content)
  const light = measureLight(content)
  const color = measureColor(content)
  const lead = measureLead(content)
  const panel = measurePanel(content)
  const frame = measureFrame(content)
  const story = measureStory(content)

  const lightTransmission = light.transmission
  const colorRichness = color.richness
  const leadQuality = lead.quality
  const glassThickness = glass.thickness
  const panelArrangement = panel.arrangement
  const windowFraming = frame.quality

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (lightTransmission * 0.25) +
    (colorRichness * 0.15) +
    (leadQuality * 0.15) +
    (glass.clarity * 0.15) +
    (panelArrangement * 0.15) +
    (windowFraming * 0.15),
  )))

  const condition = classifyPanelCondition(qualityScore, glass, light)

  return {
    file: filePath,
    lightTransmission,
    colorRichness,
    leadQuality,
    glassThickness,
    panelArrangement,
    windowFraming,
    glass,
    light,
    color,
    lead,
    panel,
    frame,
    story,
    condition,
    qualityScore,
  }
}

/**
 * Classify panel condition
 * @example
 * classifyPanelCondition(90, glass, light) // 'cathedral-masterpiece'
 */
export function classifyPanelCondition(
  score: number,
  glass: GlassMeasure,
  light: LightMeasure,
): GlassPanel['condition'] {
  if (score >= 80 && glass.isTransparent && light.isIlluminated) return 'cathedral-masterpiece'
  if (score >= 70 && (glass.isTransparent || glass.isTranslucent)) return 'rose-window'
  if (score >= 55) return 'beautiful-window'
  if (score >= 40 && light.transmission > 30) return 'clear-glass'
  if (score >= 20) return 'cracked-glass'
  return 'bricked-up'
}

// ─── Bay Analysis ───────────────────────────────────────

/**
 * Analyze a directory as a window bay
 * @example
 * analyzeWindowBay(panels, dirPath) // WindowBay
 */
export function analyzeWindowBay(panels: GlassPanel[], dirPath: string): WindowBay {
  const count = panels.length
  if (count === 0) {
    return {
      directory: dirPath,
      panels: [],
      avgLightTransmission: 0,
      avgColorRichness: 0,
      avgLeadQuality: 0,
      masterpieceCount: 0,
      brickedUpCount: 0,
      illuminatedCount: 0,
      darkCount: 0,
      bayType: 'walled-up',
      condition: 'darkness',
    }
  }

  const avgLightTransmission = Math.round(panels.reduce((s, p) => s + p.lightTransmission, 0) / count)
  const avgColorRichness = Math.round(panels.reduce((s, p) => s + p.colorRichness, 0) / count)
  const avgLeadQuality = Math.round(panels.reduce((s, p) => s + p.leadQuality, 0) / count)

  const masterpieceCount = panels.filter(p => p.condition === 'cathedral-masterpiece').length
  const brickedUpCount = panels.filter(p => p.condition === 'bricked-up').length
  const illuminatedCount = panels.filter(p => p.light.isIlluminated).length
  const darkCount = panels.filter(p => p.light.isDark).length

  const bayType = classifyBayType(panels, avgLightTransmission)
  const condition = classifyBayCondition(avgLightTransmission)

  return {
    directory: dirPath,
    panels,
    avgLightTransmission,
    avgColorRichness,
    avgLeadQuality,
    masterpieceCount,
    brickedUpCount,
    illuminatedCount,
    darkCount,
    bayType,
    condition,
  }
}

/**
 * Classify bay type
 * @example
 * classifyBayType(panels, 80) // 'cathedral-bay'
 */
export function classifyBayType(panels: GlassPanel[], avgLight: number): WindowBay['bayType'] {
  if (panels.length === 0) return 'walled-up'
  const masterpieceRatio = panels.filter(p => p.condition === 'cathedral-masterpiece').length / panels.length
  const allGood = panels.every(p => p.qualityScore >= 50)

  if (masterpieceRatio >= 0.5 && avgLight >= 70) return 'cathedral-bay'
  if (allGood && avgLight >= 60) return 'rose-window-bay'
  if (avgLight >= 50) return 'chapel-window'
  if (avgLight >= 30) return 'cloister'
  if (avgLight >= 15) return 'crypt'
  return 'walled-up'
}

/**
 * Classify bay condition
 * @example
 * classifyBayCondition(85) // 'divine-light'
 */
export function classifyBayCondition(avgLight: number): WindowBay['condition'] {
  if (avgLight >= 80) return 'divine-light'
  if (avgLight >= 65) return 'radiant'
  if (avgLight >= 50) return 'well-lit'
  if (avgLight >= 30) return 'dim'
  if (avgLight >= 15) return 'gloomy'
  return 'darkness'
}

// ─── Glazier Grade ──────────────────────────────────────

/**
 * Classify glazier grade from brilliance
 * @example
 * classifyGlazierGrade(90) // 'master-glazier'
 */
export function classifyGlazierGrade(avgBrilliance: number): StainedGlassWindowStats['glazierGrade'] {
  if (avgBrilliance >= 80) return 'master-glazier'
  if (avgBrilliance >= 65) return 'glazier'
  if (avgBrilliance >= 50) return 'glass-artisan'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'hobbyist'
  return 'vandal'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations
 * @example
 * generateRecommendations(panels, bays, cathedral, stats) // ['Add JSDoc...']
 */
export function generateRecommendations(
  _panels: GlassPanel[],
  _bays: WindowBay[],
  _cathedral: CathedralMeasure,
  stats: StainedGlassWindowStats,
): string[] {
  const recs: string[] = []

  if (stats.darkCount > stats.totalFiles * 0.3) {
    recs.push('Add JSDoc documentation to illuminate dark files')
  }
  if (stats.brickedUpCount > 0) {
    recs.push('Refactor bricked-up files to improve transparency')
  }
  if (stats.monochromeCount > stats.totalFiles * 0.5) {
    recs.push('Diversify construct types for richer code color palette')
  }
  if (stats.avgLeadQuality < 40) {
    recs.push('Define interfaces to strengthen lead boundaries')
  }
  if (stats.avgPanelArrangement < 40) {
    recs.push('Improve code organization with clear export/import patterns')
  }
  if (stats.avgWindowFraming < 40) {
    recs.push('Add return type annotations and error handling for better framing')
  }
  if (stats.crackedGlassCount > stats.totalFiles * 0.3) {
    recs.push('Fix TODO items and remove deprecated code to repair cracks')
  }
  if (stats.hasNarrativeFlowCount < stats.totalFiles * 0.3) {
    recs.push('Structure files with imports, logic, and exports for narrative flow')
  }

  if (recs.length === 0) {
    recs.push('Continue maintaining high code transparency standards')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full stained glass window result
 * @example
 * buildStainedGlassWindowResult(files, contents, {}) // StainedGlassWindowResult
 */
export function buildStainedGlassWindowResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): StainedGlassWindowResult {
  const panels: GlassPanel[] = files.map((file, i) =>
    analyzeGlassPanel(contents[i] ?? '', file),
  )

  const bayMap = new Map<string, GlassPanel[]>()
  for (const panel of panels) {
    const dir = panel.file.includes('/') ? panel.file.substring(0, panel.file.lastIndexOf('/')) : '.'
    const existing = bayMap.get(dir)
    if (existing) {
      existing.push(panel)
    } else {
      bayMap.set(dir, [panel])
    }
  }

  const bays: WindowBay[] = Array.from(bayMap.entries()).map(([dir, bPanels]) =>
    analyzeWindowBay(bPanels, dir),
  )

  const totalFiles = panels.length
  const avg = (fn: (p: GlassPanel) => number) =>
    totalFiles === 0 ? 0 : Math.round(panels.reduce((s, p) => s + fn(p), 0) / totalFiles)

  const cathedral: CathedralMeasure = {
    avgLightTransmission: avg(p => p.lightTransmission),
    avgColorRichness: avg(p => p.colorRichness),
    avgLeadQuality: avg(p => p.leadQuality),
    isIlluminated: avg(p => p.lightTransmission) >= 60,
    overallBrilliance: avg(p => p.qualityScore),
  }

  const overallBrilliance = cathedral.overallBrilliance

  const mostBrilliant = panels.length > 0
    ? panels.reduce((best, p) => p.qualityScore > best.qualityScore ? p : best, panels[0] as typeof panels[number]).file
    : ''
  const mostColorful = panels.length > 0
    ? panels.reduce((best, p) => p.colorRichness > best.colorRichness ? p : best, panels[0] as typeof panels[number]).file
    : ''
  const cleanestLead = panels.length > 0
    ? panels.reduce((best, p) => p.leadQuality > best.leadQuality ? p : best, panels[0] as typeof panels[number]).file
    : ''
  const bestFramed = panels.length > 0
    ? panels.reduce((best, p) => p.windowFraming > best.windowFraming ? p : best, panels[0] as typeof panels[number]).file
    : ''
  const bestStory = panels.length > 0
    ? panels.reduce((best, p) => p.story.narrativeScore > best.story.narrativeScore ? p : best, panels[0] as typeof panels[number]).file
    : ''

  const stats: StainedGlassWindowStats = {
    totalFiles,
    totalBays: bays.length,
    avgLightTransmission: cathedral.avgLightTransmission,
    avgColorRichness: cathedral.avgColorRichness,
    avgLeadQuality: cathedral.avgLeadQuality,
    avgGlassThickness: avg(p => p.glassThickness),
    avgPanelArrangement: avg(p => p.panelArrangement),
    avgWindowFraming: avg(p => p.windowFraming),
    cathedralMasterpieceCount: panels.filter(p => p.condition === 'cathedral-masterpiece').length,
    roseWindowCount: panels.filter(p => p.condition === 'rose-window').length,
    beautifulWindowCount: panels.filter(p => p.condition === 'beautiful-window').length,
    clearGlassCount: panels.filter(p => p.condition === 'clear-glass').length,
    crackedGlassCount: panels.filter(p => p.condition === 'cracked-glass').length,
    brickedUpCount: panels.filter(p => p.condition === 'bricked-up').length,
    transparentCount: panels.filter(p => p.glass.isTransparent).length,
    opaqueCount: panels.filter(p => p.glass.isOpaque).length,
    illuminatedCount: panels.filter(p => p.light.isIlluminated).length,
    shadowedCount: panels.filter(p => p.light.isShadowed).length,
    darkCount: panels.filter(p => p.light.isDark).length,
    jewelTonedCount: panels.filter(p => p.color.isJewelToned).length,
    monochromeCount: panels.filter(p => p.color.isMonochrome).length,
    hasCleanJointsCount: panels.filter(p => p.lead.hasCleanJoints).length,
    isWeatherTightCount: panels.filter(p => p.frame.isWeatherTight).length,
    hasNarrativeFlowCount: panels.filter(p => p.panel.hasNarrativeFlow).length,
    hasSymmetryCount: panels.filter(p => p.panel.hasSymmetry).length,
    isToldCount: panels.filter(p => p.story.isTold).length,
    isIntactCount: panels.filter(p => p.frame.isIntact).length,
    overallBrilliance,
    glazierGrade: classifyGlazierGrade(overallBrilliance),
    mostBrilliant,
    mostColorful,
    cleanestLead,
    bestFramed,
    bestStory,
  }

  const recommendations = generateRecommendations(panels, bays, cathedral, stats)

  return { panels, bays, cathedral, stats, recommendations }
}
