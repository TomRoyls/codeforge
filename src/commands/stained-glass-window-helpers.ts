// ─── Interfaces ──────────────────────────────────────────────────────────────

export type GlassType = 'cathedral' | 'opaque' | 'seedy' | 'rippled' | 'streaky' | 'transparent'
export type GlassCondition = 'pristine' | 'clean' | 'dusty' | 'cloudy' | 'cracked' | 'broken'
export type FrameMaterial = 'stone' | 'iron' | 'wood' | 'aluminum' | 'plastic' | 'none'
export type PaneOrientation = 'east' | 'west' | 'north' | 'south' | 'clerestory' | 'rose'
export type PanePosition = 'center' | 'side' | 'above' | 'below' | 'behind'
export type PaneIllumination = 'brilliant' | 'bright' | 'moderate' | 'dim' | 'dark' | 'opaque'
export type BayType = 'nave' | 'aisle' | 'transept' | 'chancel' | 'clerestory' | 'rose-window'
export type BayCondition = 'radiant' | 'bright' | 'lit' | 'dim' | 'dark' | 'black'
export type GlazierGrade = 'master-glazier' | 'glazier' | 'artisan' | 'apprentice' | 'hobbyist' | 'vandal'

export interface GlassInfo {
  type: GlassType
  condition: GlassCondition
  thickness: number
  hasBubbles: boolean
  hasStriations: boolean
  hasInclusions: boolean
  bubbleCount: number
  striationCount: number
  inclusionCount: number
}

export interface FrameInfo {
  material: FrameMaterial
  integrity: number
  hasTracery: boolean
  traceryQuality: number
  hasMullions: boolean
  mullionCount: number
  isStructurallySound: boolean
  hasSagging: boolean
  hasCracks: boolean
}

export interface LeadingInfo {
  quality: number
  hasGaps: boolean
  hasOverlaps: boolean
  hasLooseJoints: boolean
  gapCount: number
  overlapCount: number
  looseJointCount: number
  isWeatherTight: boolean
}

export interface LightInfo {
  incidentLight: number
  transmittedLight: number
  absorbedLight: number
  reflectedLight: number
  scatteredLight: number
  transmissionEfficiency: number
}

export interface WindowPane {
  file: string
  lightTransmission: number
  glassClarity: number
  colorIntensity: number
  thickness: number
  frameSupport: number
  leadingQuality: number
  opacity: number
  luminosity: number
  glass: GlassInfo
  frame: FrameInfo
  leading: LeadingInfo
  light: LightInfo
  orientation: PaneOrientation
  position: PanePosition
  illumination: PaneIllumination
  qualityScore: number
}

export interface WindowBay {
  directory: string
  panes: WindowPane[]
  avgLightTransmission: number
  avgGlassClarity: number
  avgLuminosity: number
  avgFrameIntegrity: number
  avgLeadingQuality: number
  brilliantPanes: number
  darkPanes: number
  totalGaps: number
  totalCracks: number
  bayType: BayType
  bayIllumination: number
  condition: BayCondition
}

export interface CathedralInfo {
  totalLightTransmission: number
  avgGlassClarity: number
  avgLuminosity: number
  avgFrameIntegrity: number
  avgLeadingQuality: number
  isWellIlluminated: boolean
  totalGaps: number
  totalCracks: number
}

export interface StainedGlassWindowStats {
  totalFiles: number
  totalBays: number
  avgLightTransmission: number
  avgGlassClarity: number
  avgColorIntensity: number
  avgLuminosity: number
  avgFrameIntegrity: number
  avgLeadingQuality: number
  avgOpacity: number
  brilliantPanes: number
  brightPanes: number
  dimPanes: number
  darkPanes: number
  opaquePanes: number
  cathedralGlass: number
  transparentGlass: number
  pristineCount: number
  crackedCount: number
  brokenCount: number
  totalBubbles: number
  totalStriations: number
  totalInclusions: number
  totalGaps: number
  totalOverlaps: number
  totalLooseJoints: number
  stoneFrames: number
  noFrames: number
  overallLuminosity: number
  glazierGrade: GlazierGrade
  brightestPane: string
  darkestPane: string
  bestFramed: string
  bestLed: string
}

export interface StainedGlassWindowResult {
  panes: WindowPane[]
  bays: WindowBay[]
  cathedral: CathedralInfo
  stats: StainedGlassWindowStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure light transmission (understanding flow)
 * @example
 * measureLightTransmission('export function calc() { return 1 }') // LightInfo
 */
export function measureLightTransmission(content: string): LightInfo {
  const loc = countLoc(content)
  if (loc === 0) {
    return { incidentLight: 0, transmittedLight: 0, absorbedLight: 0, reflectedLight: 0, scatteredLight: 0, transmissionEfficiency: 0 }
  }

  const incidentLight = Math.min(100, Math.round(
    Math.min(30, countImports(content) * 8) +
    Math.min(25, countLoc(content) * 0.5) +
    Math.min(20, countFunctions(content) * 5) +
    (countTypeAnnotations(content) > 0 ? 15 : 0) +
    (countComments(content) > 0 ? 10 : 0),
  ))

  const transmittedLight = Math.min(100, Math.round(
    (countExports(content) > 0 ? 25 : 0) +
    (/\breturn\b/.test(content) ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (maxNesting(content) <= 3 ? 10 : 0),
  ))

  const absorbedLight = Math.min(100, Math.round(
    (maxNesting(content) > 4 ? 25 : 0) +
    (countBranches(content) > 8 ? 20 : 0) +
    (countTodos(content) > 0 ? 15 : 0) +
    (countConsole(content) > 2 ? 15 : 0) +
    (loc > 200 ? 10 : 0),
  ))

  const reflectedLight = Math.min(100, Math.round(
    (countErrorHandling(content) === 0 && loc > 30 ? 20 : 0) +
    (countTypeAnnotations(content) === 0 && loc > 20 ? 20 : 0) +
    (countExports(content) === 0 && countFunctions(content) > 2 ? 15 : 0),
  ))

  const scatteredLight = Math.min(100, Math.round(
    (countConsole(content) * 5) +
    (countTodos(content) * 8) +
    (countBranches(content) > 5 ? 10 : 0),
  ))

  const transmissionEfficiency = incidentLight > 0
    ? Math.min(100, Math.round((transmittedLight / incidentLight) * 100))
    : 0

  return { incidentLight, transmittedLight, absorbedLight, reflectedLight, scatteredLight, transmissionEfficiency }
}

/**
 * Measure glass clarity (code transparency)
 * @example
 * measureGlassClarity('export function calc(): number { return 1 }') // number
 */
export function measureGlassClarity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (/\/\*\*/.test(content) ? 10 : 0) +
    (countExports(content) > 0 ? 15 : 0) +
    (maxNesting(content) <= 3 ? 15 : maxNesting(content) <= 5 ? 8 : 0) +
    (countConsole(content) <= 1 ? 10 : 0) +
    (countBranches(content) <= 5 ? 10 : 5) +
    (countErrorHandling(content) > 0 ? 5 : 0),
  ))
}

/**
 * Measure color intensity (richness of implementation)
 * @example
 * measureColorIntensity('export function calc() { return helper(input) }') // number
 */
export function measureColorIntensity(content: string): number {
  const loc = countLoc(content)
  if (loc === 0) return 0
  return Math.min(100, Math.round(
    Math.min(25, countFunctions(content) * 6) +
    Math.min(20, countImports(content) * 5) +
    Math.min(20, countExports(content) * 6) +
    Math.min(15, countErrorHandling(content) * 5) +
    Math.min(10, countTypeAnnotations(content) * 3) +
    (countBranches(content) > 0 ? 10 : 0),
  ))
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify glass type from content
 * @example
 * classifyGlassType('export function calc(): number { return 1 }') // string
 */
export function classifyGlassType(content: string): GlassType {
  const clarity = measureGlassClarity(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)

  if (clarity >= 70 && types > 2 && exports > 0) return 'transparent'
  if (clarity >= 55 && types > 0) return 'cathedral'
  if (clarity >= 40) return 'rippled'
  if (clarity >= 25) return 'seedy'
  if (clarity >= 15) return 'streaky'
  return 'opaque'
}

/**
 * Classify frame material from content
 * @example
 * classifyFrameMaterial('export class X {}') // string
 */
export function classifyFrameMaterial(content: string): FrameMaterial {
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /interface\s+\w/.test(content)

  if (hasInterface && hasClass && exports > 2) return 'stone'
  if (hasClass && types > 0 && imports > 0) return 'iron'
  if (exports > 1 && types > 0) return 'aluminum'
  if (exports > 0) return 'wood'
  if (countFunctions(content) > 0) return 'plastic'
  return 'none'
}

/**
 * Classify glass condition from clarity
 * @example
 * classifyGlassCondition(80) // 'clean'
 */
export function classifyGlassCondition(clarity: number): GlassCondition {
  if (clarity >= 80) return 'pristine'
  if (clarity >= 60) return 'clean'
  if (clarity >= 40) return 'dusty'
  if (clarity >= 25) return 'cloudy'
  if (clarity >= 10) return 'cracked'
  return 'broken'
}

/**
 * Classify illumination from luminosity
 * @example
 * classifyIllumination(80) // 'bright'
 */
export function classifyIllumination(luminosity: number): PaneIllumination {
  if (luminosity >= 80) return 'brilliant'
  if (luminosity >= 60) return 'bright'
  if (luminosity >= 40) return 'moderate'
  if (luminosity >= 20) return 'dim'
  if (luminosity >= 5) return 'dark'
  return 'opaque'
}

/**
 * Classify bay type from pane count
 * @example
 * classifyBayType(5) // string
 */
export function classifyBayType(paneCount: number): BayType {
  if (paneCount > 20) return 'rose-window'
  if (paneCount > 10) return 'clerestory'
  if (paneCount > 5) return 'nave'
  if (paneCount > 3) return 'transept'
  if (paneCount > 1) return 'aisle'
  return 'chancel'
}

/**
 * Classify bay condition from illumination
 * @example
 * classifyBayCondition(80) // 'bright'
 */
export function classifyBayCondition(illumination: number): BayCondition {
  if (illumination >= 80) return 'radiant'
  if (illumination >= 60) return 'bright'
  if (illumination >= 40) return 'lit'
  if (illumination >= 20) return 'dim'
  if (illumination >= 10) return 'dark'
  return 'black'
}

/**
 * Classify glazier grade from average luminosity
 * @example
 * classifyGlazierGrade(80) // 'glazier'
 */
export function classifyGlazierGrade(avgLuminosity: number): GlazierGrade {
  if (avgLuminosity >= 75) return 'master-glazier'
  if (avgLuminosity >= 60) return 'glazier'
  if (avgLuminosity >= 45) return 'artisan'
  if (avgLuminosity >= 30) return 'apprentice'
  if (avgLuminosity >= 15) return 'hobbyist'
  return 'vandal'
}

// ─── Sub-Analysis Functions ──────────────────────────────────────────────────

/**
 * Assess glass details
 * @example
 * assessGlass('export function a(): void {}') // GlassInfo
 */
export function assessGlass(content: string): GlassInfo {
  const type = classifyGlassType(content)
  const clarity = measureGlassClarity(content)
  const condition = classifyGlassCondition(clarity)
  const thickness = Math.min(100, countLoc(content))
  const bubbleCount = countConsole(content)
  const striationCount = countTodos(content)
  const inclusionCount = countBranches(content) > 8 ? countBranches(content) - 8 : 0
  return {
    type, condition, thickness,
    hasBubbles: bubbleCount > 0,
    hasStriations: striationCount > 0,
    hasInclusions: inclusionCount > 0,
    bubbleCount, striationCount, inclusionCount,
  }
}

/**
 * Assess frame details
 * @example
 * assessFrame('export class X {}') // FrameInfo
 */
export function assessFrame(content: string): FrameInfo {
  const loc = countLoc(content)
  const material = classifyFrameMaterial(content)
  const hasTracery = countTypeAnnotations(content) > 0
  const traceryQuality = Math.min(100, countTypeAnnotations(content) * 12)
  const mullionCount = countExports(content)
  const hasMullions = mullionCount > 0
  const integrity = Math.min(100, Math.round(
    (hasTracery ? 25 : 0) +
    (hasMullions ? 25 : 0) +
    (countErrorHandling(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (loc > 0 && loc <= 150 ? 15 : 0),
  ))
  const hasSagging = loc > 300 && countFunctions(content) > 10
  const hasCracks = integrity < 30

  return {
    material, integrity, hasTracery, traceryQuality,
    hasMullions, mullionCount,
    isStructurallySound: integrity >= 50,
    hasSagging, hasCracks,
  }
}

/**
 * Assess leading (interface quality)
 * @example
 * assessLeading('export interface I {}') // LeadingInfo
 */
export function assessLeading(content: string): LeadingInfo {
  const loc = countLoc(content)
  const quality = Math.min(100, Math.round(
    (countTypeAnnotations(content) > 0 ? 30 : 0) +
    (/interface\s+\w/.test(content) ? 25 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0),
  ))

  const gapCount = countExports(content) > 0 && countTypeAnnotations(content) === 0 ? 1 : 0
  const overlapCount = countExports(content) > 3 && countFunctions(content) < 2 ? 1 : 0
  const looseJointCount = countImports(content) > 3 && countErrorHandling(content) === 0 ? 1 : 0

  return {
    quality,
    hasGaps: gapCount > 0,
    hasOverlaps: overlapCount > 0,
    hasLooseJoints: looseJointCount > 0,
    gapCount, overlapCount, looseJointCount,
    isWeatherTight: quality >= 50 && gapCount === 0,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a window pane
 * @example
 * analyzeWindowPane('export function calc() { return 1 }', 'calc.ts') // WindowPane
 */
export function analyzeWindowPane(content: string, filePath: string): WindowPane {
  const glassClarity = measureGlassClarity(content)
  const light = measureLightTransmission(content)
  const colorIntensity = measureColorIntensity(content)
  const thickness = Math.min(100, countLoc(content))
  const glass = assessGlass(content)
  const frame = assessFrame(content)
  const leading = assessLeading(content)

  const opacity = Math.min(100, Math.max(0, 100 - glassClarity))
  const lightTransmission = light.transmittedLight
  const frameSupport = frame.integrity
  const leadingQuality = leading.quality

  const luminosity = Math.min(100, Math.round(
    lightTransmission * 0.3 +
    glassClarity * 0.25 +
    colorIntensity * 0.15 +
    frameSupport * 0.15 +
    leadingQuality * 0.15,
  ))

  const orientation: PaneOrientation = countExports(content) > countImports(content) ? 'east'
    : countImports(content) > countExports(content) ? 'west'
    : countFunctions(content) > 3 ? 'south'
    : countLoc(content) > 0 ? 'north'
    : 'clerestory'

  const position: PanePosition = luminosity >= 70 ? 'center'
    : luminosity >= 40 ? 'side'
    : luminosity >= 20 ? 'above'
    : luminosity > 0 ? 'below'
    : 'behind'

  const illumination = classifyIllumination(luminosity)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    luminosity * 0.3 +
    lightTransmission * 0.2 +
    glassClarity * 0.2 +
    frameSupport * 0.15 +
    leadingQuality * 0.15,
  )))

  return {
    file: filePath, lightTransmission, glassClarity, colorIntensity,
    thickness, frameSupport, leadingQuality, opacity, luminosity,
    glass, frame, leading, light,
    orientation, position, illumination, qualityScore,
  }
}

// ─── Bay Analysis ────────────────────────────────────────────────────────────

/**
 * Analyze a directory as a window bay
 * @example
 * analyzeWindowBay(panes, 'src') // WindowBay
 */
export function analyzeWindowBay(panes: WindowPane[], dirPath: string): WindowBay {
  if (panes.length === 0) {
    return {
      directory: dirPath, panes: [], avgLightTransmission: 0,
      avgGlassClarity: 0, avgLuminosity: 0, avgFrameIntegrity: 0,
      avgLeadingQuality: 0, brilliantPanes: 0, darkPanes: 0,
      totalGaps: 0, totalCracks: 0, bayType: 'chancel',
      bayIllumination: 0, condition: 'black',
    }
  }

  const n = panes.length
  const avgLightTransmission = Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / n)
  const avgGlassClarity = Math.round(panes.reduce((s, p) => s + p.glassClarity, 0) / n)
  const avgLuminosity = Math.round(panes.reduce((s, p) => s + p.luminosity, 0) / n)
  const avgFrameIntegrity = Math.round(panes.reduce((s, p) => s + p.frameSupport, 0) / n)
  const avgLeadingQuality = Math.round(panes.reduce((s, p) => s + p.leadingQuality, 0) / n)

  const brilliantPanes = panes.filter(p => p.illumination === 'brilliant' || p.illumination === 'bright').length
  const darkPanes = panes.filter(p => p.illumination === 'dark' || p.illumination === 'opaque').length
  const totalGaps = panes.reduce((s, p) => s + p.leading.gapCount, 0)
  const totalCracks = panes.filter(p => p.frame.hasCracks).length

  const bayType = classifyBayType(n)
  const bayIllumination = avgLuminosity
  const condition = classifyBayCondition(bayIllumination)

  return {
    directory: dirPath, panes, avgLightTransmission, avgGlassClarity,
    avgLuminosity, avgFrameIntegrity, avgLeadingQuality,
    brilliantPanes, darkPanes, totalGaps, totalCracks,
    bayType, bayIllumination, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate stained glass window recommendations
 * @example
 * generateRecommendations(panes, bays, cathedral, stats) // string[]
 */
export function generateRecommendations(
  panes: WindowPane[],
  _bays: WindowBay[],
  _cathedral: CathedralInfo,
  stats: StainedGlassWindowStats,
): string[] {
  void _bays
  void _cathedral
  const recs: string[] = []

  if (stats.opaquePanes > 0) {
    recs.push(`Opaque panes: ${stats.opaquePanes} files block all understanding`)
  }

  if (stats.totalGaps > 0) {
    recs.push(`Leading gaps: ${stats.totalGaps} files need interface definitions`)
  }

  if (stats.brokenCount > 0) {
    recs.push(`Broken glass: ${stats.brokenCount} files need complete restructuring`)
  }

  if (stats.noFrames > stats.totalFiles * 0.3) {
    recs.push(`Missing frames: ${stats.noFrames} files lack structural support`)
  }

  if (stats.totalLooseJoints > 0) {
    recs.push(`Loose joints: ${stats.totalLooseJoints} files have weak connections`)
  }

  if (stats.totalStriations > 3) {
    recs.push(`Striations: ${stats.totalStriations} TODO/FIXME markers obscure clarity`)
  }

  if (stats.overallLuminosity >= 60) {
    recs.push('Good luminosity: the cathedral is well-illuminated')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete stained glass window result from files and contents
 * @example
 * buildStainedGlassWindowResult(['a.ts'], ['export function a() {}'], {}) // StainedGlassWindowResult
 */
export function buildStainedGlassWindowResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): StainedGlassWindowResult {
  void options

  const panes: WindowPane[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeWindowPane(content, file)
    } catch {
      return analyzeWindowPane('', file)
    }
  })

  const dirMap = new Map<string, WindowPane[]>()
  for (const p of panes) {
    const dir = p.file.includes('/') ? p.file.slice(0, p.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(p) } else { dirMap.set(dir, [p]) }
  }

  const bays: WindowBay[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeWindowBay(ps, dir),
  )

  const n = panes.length || 1
  const totalLightTransmission = Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / n)
  const avgGlassClarity = Math.round(panes.reduce((s, p) => s + p.glassClarity, 0) / n)
  const avgLuminosity = Math.round(panes.reduce((s, p) => s + p.luminosity, 0) / n)
  const avgFrameIntegrity = Math.round(panes.reduce((s, p) => s + p.frameSupport, 0) / n)
  const avgLeadingQuality = Math.round(panes.reduce((s, p) => s + p.leadingQuality, 0) / n)

  const totalGaps = panes.reduce((s, p) => s + p.leading.gapCount, 0)
  const totalCracks = panes.filter(p => p.frame.hasCracks).length

  const cathedral: CathedralInfo = {
    totalLightTransmission, avgGlassClarity, avgLuminosity,
    avgFrameIntegrity, avgLeadingQuality,
    isWellIlluminated: avgLuminosity >= 50,
    totalGaps, totalCracks,
  }

  const overallLuminosity = Math.min(100, Math.round(
    totalLightTransmission * 0.25 + avgGlassClarity * 0.25 +
    avgFrameIntegrity * 0.2 + avgLeadingQuality * 0.15 +
    (avgLuminosity >= 50 ? 15 : 0),
  ))

  const stats: StainedGlassWindowStats = {
    totalFiles: files.length,
    totalBays: bays.length,
    avgLightTransmission: totalLightTransmission,
    avgGlassClarity,
    avgColorIntensity: Math.round(panes.reduce((s, p) => s + p.colorIntensity, 0) / n),
    avgLuminosity,
    avgFrameIntegrity,
    avgLeadingQuality,
    avgOpacity: Math.round(panes.reduce((s, p) => s + p.opacity, 0) / n),
    brilliantPanes: panes.filter(p => p.illumination === 'brilliant').length,
    brightPanes: panes.filter(p => p.illumination === 'bright').length,
    dimPanes: panes.filter(p => p.illumination === 'dim').length,
    darkPanes: panes.filter(p => p.illumination === 'dark').length,
    opaquePanes: panes.filter(p => p.illumination === 'opaque').length,
    cathedralGlass: panes.filter(p => p.glass.type === 'cathedral').length,
    transparentGlass: panes.filter(p => p.glass.type === 'transparent').length,
    pristineCount: panes.filter(p => p.glass.condition === 'pristine').length,
    crackedCount: panes.filter(p => p.glass.condition === 'cracked').length,
    brokenCount: panes.filter(p => p.glass.condition === 'broken').length,
    totalBubbles: panes.reduce((s, p) => s + p.glass.bubbleCount, 0),
    totalStriations: panes.reduce((s, p) => s + p.glass.striationCount, 0),
    totalInclusions: panes.reduce((s, p) => s + p.glass.inclusionCount, 0),
    totalGaps,
    totalOverlaps: panes.reduce((s, p) => s + p.leading.overlapCount, 0),
    totalLooseJoints: panes.reduce((s, p) => s + p.leading.looseJointCount, 0),
    stoneFrames: panes.filter(p => p.frame.material === 'stone').length,
    noFrames: panes.filter(p => p.frame.material === 'none').length,
    overallLuminosity,
    glazierGrade: classifyGlazierGrade(overallLuminosity),
    brightestPane: panes.length > 0
      ? panes.reduce((b, p) => p.luminosity > b.luminosity ? p : b, panes[0]).file : 'none',
    darkestPane: panes.length > 0
      ? panes.reduce((b, p) => p.luminosity < b.luminosity ? p : b, panes[0]).file : 'none',
    bestFramed: panes.length > 0
      ? panes.reduce((b, p) => p.frameSupport > b.frameSupport ? p : b, panes[0]).file : 'none',
    bestLed: panes.length > 0
      ? panes.reduce((b, p) => p.leadingQuality > b.leadingQuality ? p : b, panes[0]).file : 'none',
  }

  const recommendations = generateRecommendations(panes, bays, cathedral, stats)

  return { panes, bays, cathedral, stats, recommendations }
}
