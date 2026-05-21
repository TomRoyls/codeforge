// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface PaneConnections {
  north: string | null
  south: string | null
  east: string | null
  west: string | null
  totalCames: number
}

export interface PaneDefects {
  cracks: number
  chips: number
  cloudiness: number
  paintLoss: number
  leadingIssues: number
}

export interface GlassPane {
  file: string
  glassQuality: number
  colorRichness: number
  transparency: number
  thickness: number
  colorPalette: string[]
  dominantColor: string
  paneType: 'figural' | 'geometric' | 'floral' | 'abstract' | 'medallion' | 'border' | 'background'
  paneShape: 'circular' | 'rectangular' | 'triangular' | 'diamond' | 'arched' | 'irregular'
  condition: 'intact' | 'cracked' | 'broken' | 'weathered' | 'restored' | 'missing'
  lightTransmission: number
  hasLeadCame: boolean
  leadQuality: number
  connections: PaneConnections
  defects: PaneDefects
  artistry: number
  storytelling: number
  craftsmanship: 'master' | 'artisan' | 'journeyman' | 'apprentice' | 'novice'
  lightEffect: 'brilliant' | 'luminous' | 'translucent' | 'opaque' | 'dark'
}

export interface GlassPanel {
  directory: string
  panes: GlassPane[]
  panelType: 'rose-window' | 'lancet' | 'clerestory' | 'tracery' | 'grisaille' | 'mosaic-glass'
  totalPanes: number
  avgGlassQuality: number
  avgColorRichness: number
  avgTransparency: number
  avgArtistry: number
  dominantPaneType: string
  dominantColor: string
  totalCames: number
  crackedPanes: number
  brokenPanes: number
  missingPanes: number
  avgLeadQuality: number
  lightTransmission: number
  composition: number
  coherence: number
  storytelling: number
  condition: 'pristine' | 'excellent' | 'good' | 'fair' | 'damaged' | 'ruined'
  style: 'gothic' | 'romanesque' | 'byzantine' | 'art-deco' | 'modern' | 'folk'
  narrative: string
}

export interface StainedGlassStats {
  totalFiles: number
  totalPanels: number
  totalPanes: number
  avgGlassQuality: number
  avgColorRichness: number
  avgTransparency: number
  avgArtistry: number
  avgLeadQuality: number
  masterCraftsman: number
  noviceCraftsman: number
  intactPanes: number
  crackedPanes: number
  brokenPanes: number
  missingPanes: number
  totalCracks: number
  totalChips: number
  totalCloudiness: number
  totalPaintLoss: number
  totalLeadingIssues: number
  brilliantPanes: number
  darkPanes: number
  overallArtistry: number
  overallLightTransmission: number
  dominantStyle: string
  dominantPaneType: string
  windowGrade: 'cathedral' | 'church' | 'chapel' | 'home' | 'shack' | 'ruin'
  bestPane: string
  worstPane: string
  mostColorful: string
  bestStorytelling: string
}

export interface StainedGlassResult {
  panes: GlassPane[]
  panels: GlassPanel[]
  stats: StainedGlassStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const FUNCTION_RE = /(?:export\s+)?(?:async\s+)?function\s+\w+/g
const CLASS_RE = /(?:export\s+)?(?:abstract\s+)?class\s+\w+/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const ENUM_RE = /(?:export\s+)?enum\s+\w+/g
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const NESTED_IF_RE = /if\s*\(.*if\s*\(/s

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify pane type from code constructs
 * @example
 * classifyPaneType(3, 0, 5) // 'figural'
 */
export function classifyPaneType(classes: number, interfaces: number, functions: number): GlassPane['paneType'] {
  if (classes >= 3) return 'figural'
  if (interfaces >= 2) return 'medallion'
  if (functions >= 5) return 'floral'
  if (functions >= 3 && classes >= 1) return 'geometric'
  if (functions >= 2) return 'abstract'
  if (classes >= 1) return 'border'
  return 'background'
}

/**
 * Classify pane shape from code structure
 * @example
 * classifyPaneShape(10, 5, 3) // 'rectangular'
 */
export function classifyPaneShape(lines: number, functions: number, classes: number): GlassPane['paneShape'] {
  if (classes >= 2 && functions >= 3) return 'diamond'
  if (classes >= 2) return 'circular'
  if (functions >= 5) return 'arched'
  if (lines > 50 && functions <= 2) return 'triangular'
  if (lines > 20) return 'rectangular'
  return 'irregular'
}

/**
 * Classify craftsmanship from quality score
 * @example
 * classifyCraftsmanship(90) // 'master'
 */
export function classifyCraftsmanship(quality: number): GlassPane['craftsmanship'] {
  if (quality >= 85) return 'master'
  if (quality >= 70) return 'artisan'
  if (quality >= 50) return 'journeyman'
  if (quality >= 30) return 'apprentice'
  return 'novice'
}

/**
 * Classify light effect from transparency
 * @example
 * classifyLightEffect(85) // 'brilliant'
 */
export function classifyLightEffect(transparency: number): GlassPane['lightEffect'] {
  if (transparency >= 80) return 'brilliant'
  if (transparency >= 60) return 'luminous'
  if (transparency >= 40) return 'translucent'
  if (transparency >= 20) return 'opaque'
  return 'dark'
}

/**
 * Classify pane condition from defects
 * @example
 * classifyPaneCondition(0, 0) // 'intact'
 */
export function classifyPaneCondition(totalDefects: number, quality: number): GlassPane['condition'] {
  if (totalDefects === 0 && quality >= 70) return 'intact'
  if (totalDefects === 0) return 'restored'
  if (totalDefects >= 5) return 'broken'
  if (totalDefects >= 3) return 'cracked'
  if (quality < 30) return 'weathered'
  return 'cracked'
}

/**
 * Classify panel condition from average quality
 * @example
 * classifyPanelCondition(85) // 'pristine'
 */
export function classifyPanelCondition(avgQuality: number): GlassPanel['condition'] {
  if (avgQuality >= 85) return 'pristine'
  if (avgQuality >= 70) return 'excellent'
  if (avgQuality >= 55) return 'good'
  if (avgQuality >= 40) return 'fair'
  if (avgQuality >= 20) return 'damaged'
  return 'ruined'
}

/**
 * Classify window grade from overall artistry
 * @example
 * classifyWindowGrade(90) // 'cathedral'
 */
export function classifyWindowGrade(avgArtistry: number): StainedGlassStats['windowGrade'] {
  if (avgArtistry >= 80) return 'cathedral'
  if (avgArtistry >= 60) return 'church'
  if (avgArtistry >= 40) return 'chapel'
  if (avgArtistry >= 25) return 'home'
  if (avgArtistry >= 10) return 'shack'
  return 'ruin'
}

/**
 * Classify style from pane characteristics
 * @example
 * classifyStyle(50, 80, 5) // 'gothic'
 */
export function classifyStyle(avgRichness: number, avgQuality: number, classes: number): GlassPanel['style'] {
  if (avgRichness >= 60 && classes >= 3) return 'gothic'
  if (avgQuality >= 70) return 'byzantine'
  if (avgRichness >= 50) return 'art-deco'
  if (avgQuality >= 50 && avgRichness >= 30) return 'romanesque'
  if (avgRichness >= 30) return 'modern'
  return 'folk'
}

/**
 * Classify panel type from pane distribution
 * @example
 * classifyPanelType(10, 80, 5) // 'rose-window'
 */
export function classifyPanelType(paneCount: number, avgArtistry: number, avgConnections: number): GlassPanel['panelType'] {
  if (paneCount >= 10 && avgArtistry >= 60) return 'rose-window'
  if (avgConnections >= 5) return 'tracery'
  if (paneCount >= 8) return 'mosaic-glass'
  if (avgArtistry >= 50) return 'lancet'
  if (paneCount <= 3) return 'grisaille'
  return 'clerestory'
}

// ─── Detection Functions ─────────────────────────────────────────────────────

/**
 * Detect cracks (inconsistencies) in code
 * @example
 * detectCracks('const x: any = 1') // 1
 */
export function detectCracks(content: string): number {
  let count = 0
  const anys = (content.match(ANY_RE) ?? []).length
  count += anys
  if (NESTED_IF_RE.test(content)) count += 1
  return count
}

/**
 * Detect cloudiness (unclear code)
 * @example
 * detectCloudiness('function f(x) { return x }') // 1
 */
export function detectCloudiness(content: string): number {
  let count = 0
  const lines = content.split('\n')
  const longLines = lines.filter(l => l.length > 120).length
  count += Math.min(3, longLines)
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  count += Math.min(2, consoles)
  return count
}

/**
 * Detect paint loss (missing documentation)
 * @example
 * detectPaintLoss('export function a() {}') // 1
 */
export function detectPaintLoss(exports: number, jsdoc: number): number {
  if (exports === 0) return 0
  if (jsdoc >= exports) return 0
  if (jsdoc === 0) return 2
  return 1
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a glass pane
 * @example
 * analyzeGlassPane('export function a() {}', 'a.ts', [], []) // GlassPane
 */
export function analyzeGlassPane(content: string, filePath: string, imports: string[], dependents: string[]): GlassPane {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const enums = (content.match(ENUM_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length

  const colorPalette = buildColorPalette(functions, classes, interfaces, types, enums, exports)
  const dominantColor = findDominantColor(colorPalette)

  const glassQuality = computeGlassQuality(jsdoc, anys, todos, codeLines.length, exports)
  const colorRichness = computeColorRichness(colorPalette.length)
  const transparency = computeTransparency(exports, interfaces + types, jsdoc, anys, codeLines.length)
  const thickness = Math.min(100, codeLines.length)

  const paneType = classifyPaneType(classes, interfaces, functions)
  const paneShape = classifyPaneShape(codeLines.length, functions, classes)

  const cracks = detectCracks(content)
  const cloudiness = detectCloudiness(content)
  const paintLoss = detectPaintLoss(exports, jsdoc)
  const chips = todos
  const leadingIssues = anys + (imports.length > 8 ? 2 : 0)
  const defects: PaneDefects = { cracks, chips, cloudiness, paintLoss, leadingIssues }

  const totalDefects = cracks + chips + cloudiness + paintLoss + leadingIssues
  const condition = classifyPaneCondition(totalDefects, glassQuality)

  const lightTransmission = computeLightTransmission(exports, dependents.length, transparency, codeLines.length)
  const hasLeadCame = interfaces >= 1 || types >= 1
  const leadQuality = computeLeadQuality(interfaces, types, jsdoc, anys)

  const connections = computeConnections(imports, dependents, filePath)

  const artistry = computeArtistry(glassQuality, colorRichness, transparency, leadQuality, totalDefects)
  const storytelling = computeStorytelling(jsdoc, exports, functions, codeLines.length)

  const craftsmanship = classifyCraftsmanship(artistry)
  const lightEffect = classifyLightEffect(transparency)

  return {
    file: filePath,
    glassQuality,
    colorRichness,
    transparency,
    thickness,
    colorPalette,
    dominantColor,
    paneType,
    paneShape,
    condition,
    lightTransmission,
    hasLeadCame,
    leadQuality,
    connections,
    defects,
    artistry,
    storytelling,
    craftsmanship,
    lightEffect,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function buildColorPalette(functions: number, classes: number, interfaces: number, types: number, enums: number, exports: number): string[] {
  const palette: string[] = []
  if (functions > 0) palette.push('function')
  if (classes > 0) palette.push('class')
  if (interfaces > 0) palette.push('interface')
  if (types > 0) palette.push('type')
  if (enums > 0) palette.push('enum')
  if (exports > 0) palette.push('export')
  return palette
}

function findDominantColor(palette: string[]): string {
  if (palette.length === 0) return 'none'
  return palette[0]
}

function computeGlassQuality(jsdoc: number, anys: number, todos: number, lines: number, exports: number): number {
  if (lines === 0) return 0
  let score = 30
  score += Math.min(20, jsdoc * 3)
  score += Math.min(15, exports * 3)
  score -= anys * 8
  score -= todos * 4
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeColorRichness(paletteSize: number): number {
  return Math.min(100, paletteSize * 18)
}

function computeTransparency(exports: number, structural: number, jsdoc: number, anys: number, lines: number): number {
  if (lines === 0) return 0
  let score = 25
  score += Math.min(25, exports * 4)
  score += Math.min(20, structural * 4)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeLightTransmission(exports: number, dependents: number, transparency: number, lines: number): number {
  if (lines === 0) return 0
  const impact = exports * 2 + dependents * 3
  return Math.min(100, Math.max(0, Math.round(transparency * 0.6 + Math.min(40, impact))))
}

function computeLeadQuality(interfaces: number, types: number, jsdoc: number, anys: number): number {
  let score = 30
  score += Math.min(25, (interfaces + types) * 5)
  score += Math.min(15, jsdoc * 3)
  score -= anys * 8
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeConnections(imports: string[], dependents: string[], filePath: string): PaneConnections {
  const dir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.'
  let east: string | null = null
  let west: string | null = null

  if (imports.length > 0) {
    const first = imports[0]
    west = first.startsWith('.') ? first : null
  }
  if (dependents.length > 0) {
    east = dependents[0]
  }

  const north = dir !== '.' ? dir : null
  const south: string | null = null
  const totalCames = (north ? 1 : 0) + (south ? 1 : 0) + (east ? 1 : 0) + (west ? 1 : 0)

  return { north, south, east, west, totalCames }
}

function computeArtistry(glassQuality: number, colorRichness: number, transparency: number, leadQuality: number, defects: number): number {
  const defectPenalty = defects * 3
  const raw = (glassQuality * 0.3 + colorRichness * 0.2 + transparency * 0.25 + leadQuality * 0.25) - defectPenalty
  return Math.min(100, Math.max(0, Math.round(raw)))
}

function computeStorytelling(jsdoc: number, exports: number, functions: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(20, jsdoc * 4)
  score += Math.min(20, exports * 3)
  score += Math.min(15, functions * 2)
  if (jsdoc > 0 && exports > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

// ─── Panel Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze a directory as a glass panel
 * @example
 * analyzeGlassPanel(panes, 'src') // GlassPanel
 */
export function analyzeGlassPanel(panes: GlassPane[], dirPath: string): GlassPanel {
  if (panes.length === 0) {
    return {
      directory: dirPath,
      panes: [],
      panelType: 'grisaille',
      totalPanes: 0,
      avgGlassQuality: 0,
      avgColorRichness: 0,
      avgTransparency: 0,
      avgArtistry: 0,
      dominantPaneType: 'background',
      dominantColor: 'none',
      totalCames: 0,
      crackedPanes: 0,
      brokenPanes: 0,
      missingPanes: 0,
      avgLeadQuality: 0,
      lightTransmission: 0,
      composition: 0,
      coherence: 0,
      storytelling: 0,
      condition: 'ruined',
      style: 'folk',
      narrative: 'No story to tell',
    }
  }

  const n = panes.length
  const avgGlassQuality = Math.round(panes.reduce((s, p) => s + p.glassQuality, 0) / n)
  const avgColorRichness = Math.round(panes.reduce((s, p) => s + p.colorRichness, 0) / n)
  const avgTransparency = Math.round(panes.reduce((s, p) => s + p.transparency, 0) / n)
  const avgArtistry = Math.round(panes.reduce((s, p) => s + p.artistry, 0) / n)
  const avgLeadQuality = Math.round(panes.reduce((s, p) => s + p.leadQuality, 0) / n)
  const avgStorytelling = Math.round(panes.reduce((s, p) => s + p.storytelling, 0) / n)

  const dominantPaneType = findDominant(panes.map(p => p.paneType))
  const dominantColor = findDominant(panes.map(p => p.dominantColor))

  const totalCames = panes.reduce((s, p) => s + p.connections.totalCames, 0)
  const crackedPanes = panes.filter(p => p.condition === 'cracked').length
  const brokenPanes = panes.filter(p => p.condition === 'broken').length
  const missingPanes = panes.filter(p => p.condition === 'missing').length

  const lightTransmission = Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / n)

  const totalClasses = panes.reduce((s, p) => { const m = p.colorPalette.includes('class'); return s + (m ? 1 : 0) }, 0)
  const avgConn = totalCames / n
  const panelType = classifyPanelType(n, avgArtistry, avgConn)
  const style = classifyStyle(avgColorRichness, avgGlassQuality, totalClasses)

  const composition = computeComposition(avgArtistry, avgLeadQuality, crackedPanes + brokenPanes, n)
  const coherence = computeCoherence(avgColorRichness, avgTransparency, panes)
  const condition = classifyPanelCondition(avgArtistry)
  const narrative = buildNarrative(condition, avgArtistry, brokenPanes, style)

  return {
    directory: dirPath,
    panes,
    panelType,
    totalPanes: n,
    avgGlassQuality,
    avgColorRichness,
    avgTransparency,
    avgArtistry,
    dominantPaneType,
    dominantColor,
    totalCames,
    crackedPanes,
    brokenPanes,
    missingPanes,
    avgLeadQuality,
    lightTransmission,
    composition,
    coherence,
    storytelling: avgStorytelling,
    condition,
    style,
    narrative,
  }
}

function findDominant(items: string[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let dominant = items[0] ?? 'none'
  let max = 0
  for (const [item, count] of counts) {
    if (count > max) { max = count; dominant = item }
  }
  return dominant
}

function computeComposition(avgArtistry: number, avgLead: number, damaged: number, total: number): number {
  const damageRatio = total > 0 ? damaged / total : 0
  return Math.min(100, Math.max(0, Math.round((avgArtistry * 0.5 + avgLead * 0.3 + 20) - damageRatio * 30)))
}

function computeCoherence(avgRichness: number, avgTransparency: number, panes: GlassPane[]): number {
  const uniqueColors = Array.from(new Set(panes.flatMap(p => p.colorPalette))).length
  const colorBonus = Math.min(15, uniqueColors * 3)
  return Math.min(100, Math.max(0, Math.round((avgRichness * 0.3 + avgTransparency * 0.4 + colorBonus + 15))))
}

function buildNarrative(condition: GlassPanel['condition'], avgArtistry: number, broken: number, style: string): string {
  if (condition === 'pristine' || condition === 'excellent') return `A ${style} masterpiece telling a clear story of well-crafted code`
  if (broken > 0) return `A ${style} panel with ${broken} broken pane(s) obscuring its story`
  if (avgArtistry < 30) return `A ${style} panel barely holding together, its story lost to time`
  return `A ${style} panel of moderate craft, its story partially visible`
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving the stained glass
 * @example
 * generateStainedGlassRecommendations(panes, panels, stats) // string[]
 */
export function generateStainedGlassRecommendations(
  panes: GlassPane[],
  _panels: GlassPanel[],
  stats: StainedGlassStats,
): string[] {
  const recs: string[] = []

  if (stats.crackedPanes > 0) recs.push(`${stats.crackedPanes} cracked pane(s) - fix code inconsistencies`)
  if (stats.brokenPanes > 0) recs.push(`${stats.brokenPanes} broken pane(s) - repair severely damaged files`)
  if (stats.totalCloudiness > 5) recs.push(`${stats.totalCloudiness} cloudiness points - improve code clarity`)
  if (stats.totalPaintLoss > 3) recs.push(`${stats.totalPaintLoss} paint loss - add missing documentation`)
  if (stats.totalLeadingIssues > 5) recs.push(`${stats.totalLeadingIssues} leading issues - improve interface quality`)
  if (stats.darkPanes > 2) recs.push(`${stats.darkPanes} dark pane(s) - illuminate with documentation`)
  if (stats.noviceCraftsman > 0) recs.push(`${stats.noviceCraftsman} novice-crafted pane(s) need major improvement`)
  if (stats.avgLeadQuality < 40) recs.push('Low lead quality - strengthen interfaces and type definitions')

  const damagedPanels = _panels.filter(p => p.condition === 'damaged' || p.condition === 'ruined')
  if (damagedPanels.length > 0) recs.push(`${damagedPanels.length} damaged panel(s) need restoration`)

  if (recs.length === 0) recs.push('Magnificent window - masterful craftsmanship across the codebase')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete stained glass analysis result
 * @example
 * buildStainedGlassResult(files, contents, {}) // StainedGlassResult
 */
export function buildStainedGlassResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): StainedGlassResult {
  const importMap = new Map<string, string[]>()
  const dependentMap = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const matches = contents[i].matchAll(IMPORT_RE)
    const importedPaths: string[] = []
    for (const m of matches) {
      importedPaths.push(m[1])
    }
    importMap.set(files[i], importedPaths)
    dependentMap.set(files[i], [])
  }

  for (const [file, impList] of importMap) {
    for (const imp of impList) {
      for (const otherFile of files) {
        if (otherFile !== file && (otherFile.endsWith(imp) || otherFile.includes(imp.replace(/^\.\//, '')))) {
          const deps = dependentMap.get(otherFile)
          if (deps) deps.push(file)
        }
      }
    }
  }

  const panes: GlassPane[] = []
  for (let i = 0; i < files.length; i++) {
    const fileImports = importMap.get(files[i]) ?? []
    const fileDependents = dependentMap.get(files[i]) ?? []
    panes.push(analyzeGlassPane(contents[i], files[i], fileImports, fileDependents))
  }

  const dirMap = new Map<string, GlassPane[]>()
  for (const pane of panes) {
    const normalized = pane.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(pane)
    else dirMap.set(dir, [pane])
  }

  const panels: GlassPanel[] = []
  for (const [dir, dirPanes] of dirMap) {
    panels.push(analyzeGlassPanel(dirPanes, dir))
  }

  const stats = computeStats(panes, panels)
  const recommendations = generateStainedGlassRecommendations(panes, panels, stats)

  return { panes, panels, stats, recommendations }
}

function computeStats(panes: GlassPane[], panels: GlassPanel[]): StainedGlassStats {
  const totalFiles = panes.length
  const totalPanels = panels.length
  const totalPanes = panes.length

  const avgGlassQuality = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.glassQuality, 0) / totalFiles) : 0
  const avgColorRichness = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.colorRichness, 0) / totalFiles) : 0
  const avgTransparency = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.transparency, 0) / totalFiles) : 0
  const avgArtistry = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.artistry, 0) / totalFiles) : 0
  const avgLeadQuality = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.leadQuality, 0) / totalFiles) : 0

  const masterCraftsman = panes.filter(p => p.craftsmanship === 'master').length
  const noviceCraftsman = panes.filter(p => p.craftsmanship === 'novice').length

  const intactPanes = panes.filter(p => p.condition === 'intact').length
  const crackedPanes = panes.filter(p => p.condition === 'cracked').length
  const brokenPanes = panes.filter(p => p.condition === 'broken').length
  const missingPanes = panes.filter(p => p.condition === 'missing').length

  const totalCracks = panes.reduce((s, p) => s + p.defects.cracks, 0)
  const totalChips = panes.reduce((s, p) => s + p.defects.chips, 0)
  const totalCloudiness = panes.reduce((s, p) => s + p.defects.cloudiness, 0)
  const totalPaintLoss = panes.reduce((s, p) => s + p.defects.paintLoss, 0)
  const totalLeadingIssues = panes.reduce((s, p) => s + p.defects.leadingIssues, 0)

  const brilliantPanes = panes.filter(p => p.lightEffect === 'brilliant').length
  const darkPanes = panes.filter(p => p.lightEffect === 'dark').length

  const overallArtistry = avgArtistry
  const overallLightTransmission = totalFiles > 0 ? Math.round(panes.reduce((s, p) => s + p.lightTransmission, 0) / totalFiles) : 0

  const styleCounts = new Map<string, number>()
  for (const pl of panels) {
    styleCounts.set(pl.style, (styleCounts.get(pl.style) ?? 0) + 1)
  }
  let dominantStyle = 'folk'
  let maxS = 0
  for (const [s, c] of styleCounts) { if (c > maxS) { maxS = c; dominantStyle = s } }

  const paneTypeCounts = new Map<string, number>()
  for (const p of panes) {
    paneTypeCounts.set(p.paneType, (paneTypeCounts.get(p.paneType) ?? 0) + 1)
  }
  let dominantPaneType = 'background'
  let maxPT = 0
  for (const [pt, c] of paneTypeCounts) { if (c > maxPT) { maxPT = c; dominantPaneType = pt } }

  const windowGrade = classifyWindowGrade(overallArtistry)

  const sortedByArt = [...panes].sort((a, b) => b.artistry - a.artistry)
  const bestPane = sortedByArt.length > 0 ? sortedByArt[0].file : 'none'
  const worstPane = sortedByArt.length > 0 ? sortedByArt[sortedByArt.length - 1].file : 'none'

  const sortedByColor = [...panes].sort((a, b) => b.colorRichness - a.colorRichness)
  const mostColorful = sortedByColor.length > 0 ? sortedByColor[0].file : 'none'

  const sortedByStory = [...panes].sort((a, b) => b.storytelling - a.storytelling)
  const bestStorytelling = sortedByStory.length > 0 ? sortedByStory[0].file : 'none'

  return {
    totalFiles,
    totalPanels,
    totalPanes,
    avgGlassQuality,
    avgColorRichness,
    avgTransparency,
    avgArtistry,
    avgLeadQuality,
    masterCraftsman,
    noviceCraftsman,
    intactPanes,
    crackedPanes,
    brokenPanes,
    missingPanes,
    totalCracks,
    totalChips,
    totalCloudiness,
    totalPaintLoss,
    totalLeadingIssues,
    brilliantPanes,
    darkPanes,
    overallArtistry,
    overallLightTransmission,
    dominantStyle,
    dominantPaneType,
    windowGrade,
    bestPane,
    worstPane,
    mostColorful,
    bestStorytelling,
  }
}
