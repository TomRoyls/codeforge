// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface Composition {
  layers: number
  dominantElement: string
  supportingElements: number
  backgroundElements: number
  negativeSpace: number
  isCompositional: boolean
}

export interface Carving {
  chiselMarks: number
  smoothAreas: number
  roughAreas: number
  polishedAreas: number
}

export interface ProjectionMap {
  surface: number
  midRelief: number
  deepRelief: number
  background: number
}

export interface ReliefElement {
  file: string
  projection: number
  depth: number
  definition: number
  background: number
  foreground: number
  reliefType: 'alto-rilievo' | 'mezzo-rilievo' | 'basso-rilievo' | 'stiacciato' | 'sunken' | 'flat'
  sculpturalQuality: number
  composition: Composition
  carving: Carving
  projectionMap: ProjectionMap
  storyCoherence: number
  viewerAngle: 'frontal' | 'three-quarter' | 'profile' | 'hidden'
  condition: 'intact' | 'weathered' | 'damaged' | 'restored' | 'fragment'
  issues: string[]
  highlights: string[]
}

export interface DepthRange {
  min: number
  max: number
}

export interface ReliefPanel {
  directory: string
  elements: ReliefElement[]
  panelType: 'narrative' | 'decorative' | 'architectural' | 'commemorative' | 'ornamental'
  avgProjection: number
  avgDefinition: number
  avgSculpturalQuality: number
  avgStoryCoherence: number
  dominantReliefType: string
  totalLayers: number
  isCoherent: boolean
  narrative: string
  focalElement: string
  condition: 'museum-quality' | 'well-preserved' | 'fair' | 'weathered' | 'damaged' | 'lost'
  depthRange: DepthRange
}

export interface BasReliefStats {
  totalFiles: number
  totalPanels: number
  avgProjection: number
  avgDepth: number
  avgDefinition: number
  avgBackground: number
  avgForeground: number
  avgSculpturalQuality: number
  avgStoryCoherence: number
  altoRilievoFiles: number
  bassoRilievoFiles: number
  flatFiles: number
  totalLayers: number
  intactFiles: number
  damagedFiles: number
  frontalFiles: number
  hiddenFiles: number
  narrativePanels: number
  decorativePanels: number
  overallReliefQuality: number
  depthScore: number
  compositionScore: number
  sculptorGrade: 'master-sculptor' | 'skilled-artisan' | 'apprentice' | 'novice' | 'amateur'
  bestPanel: string
  worstPanel: string
  deepestElement: string
  shallowestElement: string
}

export interface BasReliefResult {
  elements: ReliefElement[]
  panels: ReliefPanel[]
  stats: BasReliefStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const COMMENT_RE = /\/\/.*$/gm
const BLANK_LINE_RE = /\n\s*\n/g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify relief type based on projection score
 * @example
 * classifyReliefType(90) // 'alto-rilievo'
 */
export function classifyReliefType(projection: number): ReliefElement['reliefType'] {
  if (projection >= 80) return 'alto-rilievo'
  if (projection >= 60) return 'mezzo-rilievo'
  if (projection >= 40) return 'basso-rilievo'
  if (projection >= 25) return 'stiacciato'
  if (projection >= 10) return 'sunken'
  return 'flat'
}

/**
 * Classify sculptor grade from average quality
 * @example
 * classifySculptorGrade(90) // 'master-sculptor'
 */
export function classifySculptorGrade(avgQuality: number): BasReliefStats['sculptorGrade'] {
  if (avgQuality >= 80) return 'master-sculptor'
  if (avgQuality >= 60) return 'skilled-artisan'
  if (avgQuality >= 40) return 'apprentice'
  if (avgQuality >= 20) return 'novice'
  return 'amateur'
}

/**
 * Assess condition of a relief element
 * @example
 * assessCondition({ issues: [], projection: 80, storyCoherence: 90 }) // 'intact'
 */
export function assessCondition(element: { issues: string[]; projection: number; storyCoherence: number }): ReliefElement['condition'] {
  if (element.issues.length === 0 && element.projection >= 60 && element.storyCoherence >= 60) return 'intact'
  if (element.issues.length <= 1 && element.projection >= 40) return 'weathered'
  if (element.issues.length >= 3) return 'damaged'
  if (element.issues.length >= 1 && element.projection < 30) return 'fragment'
  return 'restored'
}

/**
 * Classify panel type based on element composition
 * @example
 * classifyPanelType([{ reliefType: 'alto-rilievo' }], 3) // 'narrative'
 */
export function classifyPanelType(
  elements: ReliefElement[],
  totalLayers: number,
): ReliefPanel['panelType'] {
  if (elements.length === 0) return 'ornamental'
  const altoCount = elements.filter(e => e.reliefType === 'alto-rilievo').length
  const flatCount = elements.filter(e => e.reliefType === 'flat').length
  const coherent = elements.filter(e => e.storyCoherence >= 60).length

  if (coherent >= elements.length * 0.7 && totalLayers >= 3) return 'narrative'
  if (altoCount >= elements.length * 0.5) return 'commemorative'
  if (flatCount >= elements.length * 0.6) return 'ornamental'
  if (totalLayers >= 4) return 'architectural'
  return 'decorative'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a relief element
 * @example
 * analyzeReliefElement('export function add(a: number, b: number) { return a + b }', 'math.ts') // ReliefElement
 */
export function analyzeReliefElement(content: string, filePath: string): ReliefElement {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length

  const projection = computeProjection(exports, functions + classes, codeLines.length, anys, todos)
  const depth = computeDepth(imports, functions, classes, interfaces + types, codeLines.length)
  const definition = computeDefinition(exports, interfaces, types, jsdoc, codeLines.length)
  const background = computeBackground(interfaces, types, imports, comments, codeLines.length)
  const foreground = computeForeground(functions, classes, exports, codeLines.length)

  const sculpturalQuality = Math.round((projection + depth + definition + foreground) / 4)
  const reliefType = classifyReliefType(projection)

  const composition = buildComposition(content, exports, functions, classes, interfaces + types, codeLines)
  const carving = buildCarving(codeLines, jsdoc, anys, todos, consoles)
  const projectionMap = buildProjectionMap(exports, functions, classes, interfaces + types, codeLines.length)

  const storyCoherence = computeStoryCoherence(exports, functions + classes, jsdoc, anys, todos, codeLines.length)
  const viewerAngle = classifyViewerAngle(exports, functions + classes, imports)
  const issues = detectIssues(projection, depth, definition, anys, todos, consoles)
  const highlights = detectHighlights(projection, depth, definition, jsdoc, anys, storyCoherence)

  const condition = assessCondition({ issues, projection, storyCoherence })

  return {
    file: filePath,
    projection,
    depth,
    definition,
    background,
    foreground,
    reliefType,
    sculpturalQuality,
    composition,
    carving,
    projectionMap,
    storyCoherence,
    viewerAngle,
    condition,
    issues,
    highlights,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeProjection(exports: number, constructs: number, lines: number, anys: number, todos: number): number {
  if (lines === 0) return 0
  let score = 35
  score += Math.min(25, exports * 4)
  score += Math.min(15, constructs * 3)
  score -= anys * 10
  score -= todos * 8
  if (constructs > 0 && exports > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeDepth(imports: number, functions: number, classes: number, structural: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  if (imports >= 1 && imports <= 6) score += 15
  else if (imports > 6 && imports <= 12) score += 8
  else if (imports > 12) score -= 5
  if (functions >= 1 && functions <= 5) score += 15
  else if (functions > 5 && functions <= 10) score += 8
  else if (functions > 10) score -= 5
  if (classes >= 1) score += 10
  if (structural >= 1) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeDefinition(exports: number, interfaces: number, types: number, jsdoc: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(20, exports * 3)
  score += Math.min(15, (interfaces + types) * 4)
  score += Math.min(15, jsdoc * 3)
  if (interfaces > 0 && exports > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeBackground(interfaces: number, types: number, imports: number, comments: number, lines: number): number {
  if (lines === 0) return 0
  let score = 25
  score += Math.min(20, (interfaces + types) * 5)
  if (imports >= 1 && imports <= 8) score += 15
  else if (imports > 8) score += 5
  if (comments > 0) score += Math.min(15, comments)
  else score += 5
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeForeground(functions: number, classes: number, exports: number, lines: number): number {
  if (lines === 0) return 0
  let score = 30
  const constructs = functions + classes
  if (constructs >= 1 && constructs <= 4) score += 25
  else if (constructs >= 5 && constructs <= 8) score += 15
  else if (constructs > 8) score += 5
  if (exports > 0 && constructs > 0) score += 15
  return Math.min(100, Math.max(0, Math.round(score)))
}

function buildComposition(
  content: string, exports: number, functions: number, classes: number,
  structural: number, codeLines: string[],
): Composition {
  const blankMatches = content.match(BLANK_LINE_RE)
  const negativeSpace = blankMatches ? Math.round((blankMatches.length / (codeLines.length || 1)) * 100) : 0
  const layers = computeLayers(exports, functions, classes, structural)
  const dominantElement = identifyDominantElement(exports, functions, classes, structural)
  const supportingElements = Math.max(0, functions + classes - 1)
  const backgroundElements = structural
  const isCompositional = layers >= 3 && exports >= 1 && (functions + classes) >= 1

  return {
    layers,
    dominantElement,
    supportingElements,
    backgroundElements,
    negativeSpace: Math.min(100, negativeSpace),
    isCompositional,
  }
}

function computeLayers(exports: number, functions: number, classes: number, structural: number): number {
  let layers = 0
  if (exports > 0) layers++
  if (functions > 0 || classes > 0) layers++
  if (structural > 0) layers++
  if (exports > 2) layers++
  if (functions + classes > 3) layers++
  return layers
}

function identifyDominantElement(exports: number, functions: number, classes: number, structural: number): string {
  if (classes > functions && classes > structural) return 'class'
  if (functions >= classes && functions > 0) return 'function'
  if (structural > 0) return 'interface'
  if (exports > 0) return 'export'
  return 'none'
}

function buildCarving(
  codeLines: string[], jsdoc: number, anys: number, todos: number, consoles: number,
): Carving {
  let chiselMarks = 0
  let smoothAreas = 0
  let roughAreas = 0
  let polishedAreas = 0

  for (const line of codeLines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    if (trimmed.length > 120) roughAreas++
    else if (trimmed.length < 20 && trimmed.length > 0) smoothAreas++
    if (trimmed.includes('//')) chiselMarks++
  }

  polishedAreas = Math.min(100, jsdoc * 5)
  roughAreas += anys * 2 + todos + consoles

  return { chiselMarks, smoothAreas, roughAreas, polishedAreas }
}

function buildProjectionMap(
  exports: number, functions: number, classes: number, structural: number, lines: number,
): ProjectionMap {
  if (lines === 0) return { surface: 0, midRelief: 0, deepRelief: 0, background: 0 }

  const surface = Math.min(100, exports * 12)
  const midRelief = Math.min(100, (functions + classes) * 8)
  const deepRelief = Math.min(100, Math.abs(functions + classes - exports) * 5 + 20)
  const bg = Math.min(100, structural * 10)

  return {
    surface: Math.round(surface),
    midRelief: Math.round(midRelief),
    deepRelief: Math.round(deepRelief),
    background: Math.round(bg),
  }
}

function computeStoryCoherence(
  exports: number, constructs: number, jsdoc: number, anys: number, todos: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = 40
  if (exports >= 1 && constructs >= 1) score += 20
  else if (constructs >= 1) score += 10
  if (jsdoc >= 1) score += 10
  if (jsdoc >= 3) score += 5
  score -= anys * 8
  score -= todos * 6
  if (exports > 0 && constructs > 0 && constructs <= exports * 3) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function classifyViewerAngle(exports: number, constructs: number, imports: number): ReliefElement['viewerAngle'] {
  if (exports >= 2 && constructs >= 1) return 'frontal'
  if (exports >= 1 && constructs >= 1 && imports >= 1) return 'three-quarter'
  if (constructs >= 1) return 'profile'
  return 'hidden'
}

function detectIssues(projection: number, depth: number, definition: number, anys: number, todos: number, consoles: number): string[] {
  const issues: string[] = []
  if (projection < 20) issues.push('Extremely low projection - logic barely visible')
  if (depth < 20) issues.push('Shallow depth - lacks implementation layers')
  if (definition < 25) issues.push('Blurry definition - unclear boundaries')
  if (anys > 0) issues.push(`Found ${anys} any type(s) - weak sculptural edges`)
  if (todos > 0) issues.push(`Found ${todos} TODO/FIXME marker(s) - unfinished relief`)
  if (consoles > 2) issues.push(`Found ${consoles} console call(s) - distracting marks`)
  return issues
}

function detectHighlights(projection: number, depth: number, definition: number, jsdoc: number, anys: number, coherence: number): string[] {
  const highlights: string[] = []
  if (projection >= 70) highlights.push('Strong projection - logic stands out clearly')
  if (depth >= 70) highlights.push('Deep carving - rich implementation layers')
  if (definition >= 70) highlights.push('Sharp definition - clean boundaries')
  if (jsdoc >= 2 && anys === 0) highlights.push('Polished finish - well-documented and type-safe')
  if (coherence >= 70) highlights.push('Coherent narrative - code tells a clear story')
  if (projection >= 50 && depth >= 50 && definition >= 50) highlights.push('Balanced relief - good depth distribution')
  return highlights
}

// ─── Panel Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a relief panel
 * @example
 * analyzeReliefPanel(elements, 'src') // ReliefPanel
 */
export function analyzeReliefPanel(elements: ReliefElement[], dirPath: string): ReliefPanel {
  if (elements.length === 0) {
    return {
      directory: dirPath,
      elements: [],
      panelType: 'ornamental',
      avgProjection: 0,
      avgDefinition: 0,
      avgSculpturalQuality: 0,
      avgStoryCoherence: 0,
      dominantReliefType: 'flat',
      totalLayers: 0,
      isCoherent: false,
      narrative: 'Empty panel',
      focalElement: 'none',
      condition: 'lost',
      depthRange: { min: 0, max: 0 },
    }
  }

  const avgProjection = Math.round(elements.reduce((s, e) => s + e.projection, 0) / elements.length)
  const avgDefinition = Math.round(elements.reduce((s, e) => s + e.definition, 0) / elements.length)
  const avgSculpturalQuality = Math.round(elements.reduce((s, e) => s + e.sculpturalQuality, 0) / elements.length)
  const avgStoryCoherence = Math.round(elements.reduce((s, e) => s + e.storyCoherence, 0) / elements.length)
  const totalLayers = elements.reduce((s, e) => s + e.composition.layers, 0)

  const typeCounts = new Map<string, number>()
  for (const e of elements) {
    typeCounts.set(e.reliefType, (typeCounts.get(e.reliefType) ?? 0) + 1)
  }
  let dominantReliefType = 'flat'
  let maxType = 0
  for (const [reliefType, count] of typeCounts) {
    if (count > maxType) { maxType = count; dominantReliefType = reliefType }
  }

  const coherentCount = elements.filter(e => e.storyCoherence >= 60).length
  const isCoherent = coherentCount >= elements.length * 0.6

  const narrative = buildNarrative(elements, avgProjection, isCoherent)
  const sortedByProjection = [...elements].sort((a, b) => b.projection - a.projection)
  const focalElement = sortedByProjection[0].file

  const depths = elements.map(e => e.depth)
  const depthRange: DepthRange = {
    min: Math.min(...depths),
    max: Math.max(...depths),
  }

  const panelType = classifyPanelType(elements, totalLayers)
  const condition = classifyPanelCondition(avgSculpturalQuality, avgProjection, isCoherent)

  return {
    directory: dirPath,
    elements,
    panelType,
    avgProjection,
    avgDefinition,
    avgSculpturalQuality,
    avgStoryCoherence,
    dominantReliefType,
    totalLayers,
    isCoherent,
    narrative,
    focalElement,
    condition,
    depthRange,
  }
}

function buildNarrative(elements: ReliefElement[], avgProjection: number, isCoherent: boolean): string {
  const altoCount = elements.filter(e => e.reliefType === 'alto-rilievo').length
  const flatCount = elements.filter(e => e.reliefType === 'flat').length

  if (isCoherent && avgProjection >= 60) return 'A well-composed relief with clear narrative flow'
  if (altoCount > flatCount) return 'Dominant high-relief elements tell a bold story'
  if (flatCount > altoCount) return 'Mostly flat surface with subtle, understated elements'
  if (isCoherent) return 'Coherent composition despite varying depth levels'
  return 'Fragmented relief with mixed depth and unclear narrative'
}

function classifyPanelCondition(avgQuality: number, avgProjection: number, isCoherent: boolean): ReliefPanel['condition'] {
  if (avgQuality >= 75 && avgProjection >= 65 && isCoherent) return 'museum-quality'
  if (avgQuality >= 55 && isCoherent) return 'well-preserved'
  if (avgQuality >= 40) return 'fair'
  if (avgQuality >= 25) return 'weathered'
  if (avgQuality >= 10) return 'damaged'
  return 'lost'
}

// ─── Score Computations ──────────────────────────────────────────────────────

/**
 * Compute depth score from elements
 * @example
 * computeDepthScore([{ depth: 80 }, { depth: 60 }]) // 70
 */
export function computeDepthScore(elements: ReliefElement[]): number {
  if (elements.length === 0) return 0
  const avg = elements.reduce((s, e) => s + e.depth, 0) / elements.length
  const layerBonus = Math.min(20, elements.reduce((s, e) => s + e.composition.layers, 0) * 2)
  return Math.min(100, Math.round(avg * 0.8 + layerBonus))
}

/**
 * Compute composition score from elements and panels
 * @example
 * computeCompositionScore([{ composition: { isCompositional: true } }], [{ isCoherent: true }]) // 80
 */
export function computeCompositionScore(elements: ReliefElement[], panels: ReliefPanel[]): number {
  if (elements.length === 0) return 0
  const compositionalRatio = elements.filter(e => e.composition.isCompositional).length / elements.length
  const coherentRatio = panels.length > 0 ? panels.filter(p => p.isCoherent).length / panels.length : 0
  const avgLayers = elements.reduce((s, e) => s + e.composition.layers, 0) / elements.length
  const layerBonus = Math.min(20, avgLayers * 5)
  return Math.min(100, Math.round(compositionalRatio * 40 + coherentRatio * 40 + layerBonus))
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving code relief
 * @example
 * generateBasReliefRecommendations(elements, panels, stats) // string[]
 */
export function generateBasReliefRecommendations(
  elements: ReliefElement[],
  panels: ReliefPanel[],
  stats: BasReliefStats,
): string[] {
  const recs: string[] = []

  if (stats.flatFiles > 0) recs.push(`${stats.flatFiles} flat file(s) need more depth and abstraction`)
  if (stats.hiddenFiles > 0) recs.push(`${stats.hiddenFiles} hidden file(s) should expose clearer APIs`)
  if (stats.damagedFiles > 0) recs.push(`${stats.damagedFiles} damaged file(s) need repair and refactoring`)
  if (stats.avgStoryCoherence < 40) recs.push('Low narrative coherence - improve code flow and organization')
  if (stats.avgForeground < 40) recs.push('Weak foreground - clarify the main purpose of files')
  if (stats.avgProjection < 40) recs.push('Low overall projection - make core logic more prominent')
  if (stats.depthScore < 40) recs.push('Shallow depth score - add more implementation layers')
  if (stats.compositionScore < 40) recs.push('Poor composition - reorganize for better structural balance')

  const damagedPanels = panels.filter(p => p.condition === 'damaged' || p.condition === 'lost')
  if (damagedPanels.length > 0) recs.push(`${damagedPanels.length} panel(s) in poor condition need attention`)

  const hiddenEls = elements.filter(e => e.viewerAngle === 'hidden')
  if (hiddenEls.length > elements.length * 0.3) recs.push('Too many hidden files - consider exposing more functionality')

  if (recs.length === 0) recs.push('Masterful relief sculpture - code projects with clarity and depth')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete bas-relief analysis result
 * @example
 * buildBasReliefResult(files, contents, {}) // BasReliefResult
 */
export function buildBasReliefResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): BasReliefResult {
  const elements: ReliefElement[] = []
  for (let i = 0; i < files.length; i++) {
    elements.push(analyzeReliefElement(contents[i], files[i]))
  }

  const dirMap = new Map<string, ReliefElement[]>()
  for (const el of elements) {
    const normalized = el.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(el)
    else dirMap.set(dir, [el])
  }

  const panels: ReliefPanel[] = []
  for (const [dir, dirElements] of dirMap) {
    panels.push(analyzeReliefPanel(dirElements, dir))
  }

  const stats = computeBasReliefStats(elements, panels)
  const recommendations = generateBasReliefRecommendations(elements, panels, stats)

  return { elements, panels, stats, recommendations }
}

function computeBasReliefStats(elements: ReliefElement[], panels: ReliefPanel[]): BasReliefStats {
  const totalFiles = elements.length
  const totalPanels = panels.length

  const avgProjection = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.projection, 0) / totalFiles) : 0
  const avgDepth = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.depth, 0) / totalFiles) : 0
  const avgDefinition = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.definition, 0) / totalFiles) : 0
  const avgBackground = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.background, 0) / totalFiles) : 0
  const avgForeground = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.foreground, 0) / totalFiles) : 0
  const avgSculpturalQuality = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.sculpturalQuality, 0) / totalFiles) : 0
  const avgStoryCoherence = totalFiles > 0 ? Math.round(elements.reduce((s, e) => s + e.storyCoherence, 0) / totalFiles) : 0

  const altoRilievoFiles = elements.filter(e => e.reliefType === 'alto-rilievo').length
  const bassoRilievoFiles = elements.filter(e => e.reliefType === 'basso-rilievo').length
  const flatFiles = elements.filter(e => e.reliefType === 'flat').length

  const totalLayers = elements.reduce((s, e) => s + e.composition.layers, 0)

  const intactFiles = elements.filter(e => e.condition === 'intact').length
  const damagedFiles = elements.filter(e => e.condition === 'damaged' || e.condition === 'fragment').length
  const frontalFiles = elements.filter(e => e.viewerAngle === 'frontal').length
  const hiddenFiles = elements.filter(e => e.viewerAngle === 'hidden').length

  const narrativePanels = panels.filter(p => p.panelType === 'narrative').length
  const decorativePanels = panels.filter(p => p.panelType === 'decorative').length

  const overallReliefQuality = avgSculpturalQuality
  const depthScore = computeDepthScore(elements)
  const compositionScore = computeCompositionScore(elements, panels)
  const sculptorGrade = classifySculptorGrade(avgSculpturalQuality)

  const sortedPanels = [...panels].sort((a, b) => b.avgSculpturalQuality - a.avgSculpturalQuality)
  const bestPanel = sortedPanels.length > 0 ? sortedPanels[0].directory : 'none'
  const worstPanel = sortedPanels.length > 0 ? sortedPanels[sortedPanels.length - 1].directory : 'none'

  const sortedByDepth = [...elements].sort((a, b) => b.depth - a.depth)
  const deepestElement = sortedByDepth.length > 0 ? sortedByDepth[0].file : 'none'
  const shallowestElement = sortedByDepth.length > 0 ? sortedByDepth[sortedByDepth.length - 1].file : 'none'

  return {
    totalFiles,
    totalPanels,
    avgProjection,
    avgDepth,
    avgDefinition,
    avgBackground,
    avgForeground,
    avgSculpturalQuality,
    avgStoryCoherence,
    altoRilievoFiles,
    bassoRilievoFiles,
    flatFiles,
    totalLayers,
    intactFiles,
    damagedFiles,
    frontalFiles,
    hiddenFiles,
    narrativePanels,
    decorativePanels,
    overallReliefQuality,
    depthScore,
    compositionScore,
    sculptorGrade,
    bestPanel,
    worstPanel,
    deepestElement,
    shallowestElement,
  }
}
