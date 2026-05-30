// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface StrataLayer {
  layerId: string
  layerName: string
  depth: number
  files: string[]
  avgQuality: number
  density: number
  porosity: number
  permeability: number
  bondedTo: string[]
  contaminated: boolean
  contaminants: string[]
  fossils: string[]
  minerals: string[]
  age: 'new' | 'recent' | 'mature' | 'ancient' | 'fossilized'
  stability: 'bedrock' | 'stable' | 'settling' | 'shifting' | 'unstable' | 'quicksand'
  thickness: number
  classification: 'limestone' | 'granite' | 'sandstone' | 'shale' | 'marble' | 'clay' | 'volcanic'
}

export interface LayerBoundary {
  upperLayer: string
  lowerLayer: string
  boundaryType: 'clean' | 'porous' | 'blurred' | 'mixed' | 'fault' | 'missing'
  crossContaminations: number
  dependencies: number
  couplingScore: number
  hasGuard: boolean
  description: string
}

export interface StrataColumn {
  directory: string
  layers: StrataLayer[]
  boundaries: LayerBoundary[]
  totalDepth: number
  avgQuality: number
  structuralIntegrity: number
  hasInversions: boolean
  inversionCount: number
  erosionRisk: number
  isHealthy: boolean
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F'
  dominantRock: string
  geologicalAge: string
  recommendations: string[]
}

export interface FrescoLayerStats {
  totalFiles: number
  totalLayers: number
  totalBoundaries: number
  totalColumns: number
  avgLayerQuality: number
  avgStructuralIntegrity: number
  avgErosionRisk: number
  bedrockLayers: number
  unstableLayers: number
  quicksandLayers: number
  cleanBoundaries: number
  faultBoundaries: number
  contaminatedLayers: number
  totalFossils: number
  totalMinerals: number
  hasInversions: boolean
  overallGeologicalScore: number
  stabilityGrade: 'rock-solid' | 'stable' | 'settling' | 'shifting' | 'unstable' | 'collapsing'
  mostStableColumn: string
  leastStableColumn: string
  deepestLayer: string
  shallowestLayer: string
}

export interface FrescoLayerResult {
  layers: StrataLayer[]
  boundaries: LayerBoundary[]
  columns: StrataColumn[]
  stats: FrescoLayerStats
  recommendations: string[]
}

// ─── Layer Identification ────────────────────────────────────────────────────

const SURFACE_PATTERNS = ['ui/', 'component', 'page', 'view', 'screen', 'route', 'controller', 'handler', 'endpoint', 'api/']
const MIDDLE_PATTERNS = ['service', 'logic', 'business', 'domain', 'use-case', 'usecase', 'application', 'manager', 'orchestrator']
const DEEP_PATTERNS = ['data/', 'repository', 'repositories', 'dao', 'model', 'entity', 'schema', 'database', 'db/', 'storage', 'persist']
const FOUNDATION_PATTERNS = ['util', 'helper', 'core/', 'lib/', 'common/', 'shared/', 'config', 'type/', 'types/', 'interface']

/**
 * Classify file into a strata layer
 * @example
 * identifyLayer('src/ui/Button.tsx', 'export default Button') // 'presentation'
 */
export function identifyLayer(filePath: string, content: string): string {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase()

  for (const p of SURFACE_PATTERNS) {
    if (normalized.includes(p)) return 'presentation'
  }
  for (const p of MIDDLE_PATTERNS) {
    if (normalized.includes(p)) return 'business-logic'
  }
  for (const p of DEEP_PATTERNS) {
    if (normalized.includes(p)) return 'data-access'
  }
  for (const p of FOUNDATION_PATTERNS) {
    if (normalized.includes(p)) return 'infrastructure'
  }

  // Content-based heuristics
  if (content.includes('document.') || content.includes('createElement') || content.includes('render(')) {
    return 'presentation'
  }
  if (content.includes('SELECT ') || content.includes('INSERT ') || content.includes('database') || content.includes('prisma')) {
    return 'data-access'
  }
  if (content.includes('export function') && content.includes('import')) {
    return 'business-logic'
  }

  return 'infrastructure'
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(function|class|const|interface|type|default)/g
const IMPORT_RE = /import\s+.*?from\s+['"][^'"]+['"]/g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|DEPRECATED|@deprecated)/gi
const FUNCTION_RE = /(?:export\s+)?(?:function|const)\s+\w+/g
const COMMENT_RE = /\/\*[\s\S]*?\*\//g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g

// ─── Layer Analysis ──────────────────────────────────────────────────────────

/**
 * Analyze content within a specific layer
 * @example
 * analyzeLayerContent(files, contents, 'presentation') // StrataLayer
 */
export function analyzeLayerContent(
  files: string[],
  contents: string[],
  layerName: string,
): StrataLayer {
  const lines = contents.reduce((sum, c) => sum + c.split('\n').length, 0)
  const exports = contents.reduce((sum, c) => sum + (c.match(EXPORT_RE) ?? []).length, 0)
  const imports = contents.reduce((sum, c) => sum + (c.match(IMPORT_RE) ?? []).length, 0)
  const functions = contents.reduce((sum, c) => sum + (c.match(FUNCTION_RE) ?? []).length, 0)
  const comments = contents.reduce((sum, c) => sum + (c.match(COMMENT_RE) ?? []).length, 0)
  const todos = contents.reduce((sum, c) => sum + (c.match(TODO_RE) ?? []).length, 0)
  const interfaces = contents.reduce((sum, c) => sum + (c.match(INTERFACE_RE) ?? []).length, 0)

  const avgQuality = Math.min(100, Math.max(0,
    Math.round(
      (exports > 0 ? 20 : 0) +
      (interfaces > 0 ? 15 : 0) +
      Math.min(30, functions * 5) +
      Math.min(20, comments * 3) +
      (todos === 0 ? 15 : Math.max(0, 15 - todos * 3)),
    ),
  ))

  const density = files.length > 0 ? Math.round(lines / files.length) : 0

  const porosity = Math.min(100, Math.max(0,
    Math.round(
      (todos * 10) +
      (exports === 0 ? 20 : 0) +
      (functions === 0 ? 30 : 0) +
      (lines < 10 ? 20 : 0),
    ),
  ))

  const permeability = Math.min(100, Math.max(0,
    Math.round(
      (imports / Math.max(1, files.length)) * 20 +
      (todos * 5) +
      (comments === 0 ? 15 : 0),
    ),
  ))

  const depth = layerName === 'presentation' ? 0
    : layerName === 'business-logic' ? 1
    : layerName === 'data-access' ? 2
    : 3

  const contaminants = detectContaminants(contents, layerName)
  const fossils = detectFossils(contents)
  const minerals = detectMinerals(contents)

  const age = classifyAge(lines, todos, comments)
  const stability = classifyStability(avgQuality, porosity, todos)
  const classification = classifyRock(density, avgQuality, porosity)

  return {
    layerId: `${layerName}-${depth}`,
    layerName,
    depth,
    files: Array.from(files),
    avgQuality,
    density,
    porosity,
    permeability,
    bondedTo: [],
    contaminated: contaminants.length > 0,
    contaminants,
    fossils,
    minerals,
    age,
    stability,
    thickness: files.length,
    classification,
  }
}

// ─── Contamination Detection ─────────────────────────────────────────────────

const DB_PATTERN_RE = /(?:SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|prisma|sequelize|typeorm|mongoose)/i
const DOM_PATTERN_RE = /(?:document\.|createElement|getElementById|querySelector|innerHTML|addEventListener)/
const HTTP_PATTERN_RE = /(?:fetch\(|axios|http\.get|http\.post|req\.|res\.)/

function detectContaminants(contents: string[], layerName: string): string[] {
  const contaminants: string[] = []
  const allContent = contents.join('\n')

  if (layerName === 'presentation') {
    if (DB_PATTERN_RE.test(allContent)) contaminants.push('database-access')
    if (HTTP_PATTERN_RE.test(allContent) && !DOM_PATTERN_RE.test(allContent)) contaminants.push('http-logic')
  }
  if (layerName === 'business-logic') {
    if (DOM_PATTERN_RE.test(allContent)) contaminants.push('dom-manipulation')
    if (DB_PATTERN_RE.test(allContent)) contaminants.push('database-access')
  }
  if (layerName === 'data-access') {
    if (DOM_PATTERN_RE.test(allContent)) contaminants.push('dom-manipulation')
  }
  if (layerName === 'infrastructure') {
    if (DOM_PATTERN_RE.test(allContent)) contaminants.push('dom-manipulation')
    if (DB_PATTERN_RE.test(allContent)) contaminants.push('database-access')
  }

  return Array.from(new Set(contaminants))
}

// ─── Fossil Detection ────────────────────────────────────────────────────────

const DEAD_CODE_RE = /\/\/\s*(deprecated|unused|no longer|legacy|old|remove)/gi
const CONSOLE_LOG_RE = /console\.(log|warn|debug|info)\(/g

function detectFossils(contents: string[]): string[] {
  const fossils: string[] = []
  for (const content of contents) {
    const deadMatches = content.match(DEAD_CODE_RE)
    if (deadMatches) {
      fossils.push(...deadMatches.map(m => m.trim()))
    }
    const consoleMatches = content.match(CONSOLE_LOG_RE)
    if (consoleMatches) {
      fossils.push(...Array.from({ length: consoleMatches.length }, () => 'console-statement'))
    }
  }
  return fossils
}

// ─── Mineral Detection ───────────────────────────────────────────────────────

function detectMinerals(contents: string[]): string[] {
  const minerals: string[] = []
  for (const content of contents) {
    const ifaceMatches = content.match(INTERFACE_RE)
    if (ifaceMatches) {
      minerals.push(...ifaceMatches.map(m => m.replace(/export\s+/, '').trim()))
    }
    const exportMatches = content.match(EXPORT_RE)
    if (exportMatches && exportMatches.length >= 3) {
      minerals.push('rich-api-surface')
    }
  }
  return minerals
}

// ─── Classification Helpers ──────────────────────────────────────────────────

function classifyAge(lines: number, todos: number, comments: number): StrataLayer['age'] {
  if (lines < 50) return 'new'
  if (todos > 5) return 'fossilized'
  if (todos > 2) return 'ancient'
  if (comments > lines * 0.15) return 'mature'
  if (lines > 200) return 'recent'
  return 'new'
}

function classifyStability(quality: number, porosity: number, todos: number): StrataLayer['stability'] {
  if (quality >= 80 && porosity < 15 && todos === 0) return 'bedrock'
  if (quality >= 60 && porosity < 30) return 'stable'
  if (quality >= 40 && porosity < 50) return 'settling'
  if (quality >= 20 || porosity < 70) return 'shifting'
  if (quality < 15 && porosity > 80) return 'quicksand'
  return 'unstable'
}

function classifyRock(density: number, quality: number, porosity: number): StrataLayer['classification'] {
  if (quality >= 80 && porosity < 10) return 'granite'
  if (quality >= 70 && density > 100) return 'marble'
  if (quality >= 50 && density < 50) return 'limestone'
  if (porosity > 70) return 'sandstone'
  if (density > 200 && quality < 40) return 'shale'
  if (porosity > 50 && quality < 30) return 'clay'
  if (quality >= 60 && porosity < 20) return 'granite'
  return 'sandstone'
}

// ─── Boundary Analysis ───────────────────────────────────────────────────────

/**
 * Analyze boundary between two layers
 * @example
 * analyzeBoundary(upper, lower, files, contents) // LayerBoundary
 */
export function analyzeBoundary(
  upper: StrataLayer,
  lower: StrataLayer,
  allFiles: string[],
  allContents: string[],
): LayerBoundary {
  const upperContent = allContents.join('\n')
  const lowerContent = lower.files.length > 0
    ? lower.files.map(f => {
        const idx = allFiles.indexOf(f)
        const entry = idx >= 0 ? allContents[idx] : undefined
        return entry ?? ''
      }).join('\n')
    : ''

  const importsFromLower = upper.files.reduce((count, f) => {
    const idx = allFiles.indexOf(f)
    const content = idx >= 0 ? (allContents[idx] ?? '') : ''
    for (const lowerFile of lower.files) {
      const importPath = lowerFile.replace(/\.\w+$/, '').replace(/\/index$/, '')
      if (content.includes(importPath)) count++
    }
    return count
  }, 0)

  const lowerImportsUpper = lowerContent.includes('import')

  const hasInversion = lower.depth > upper.depth && lowerImportsUpper && importsFromLower === 0

  const crossContaminations = upper.contaminated ? upper.contaminants.length : 0
  const couplingScore = Math.min(100, importsFromLower * 20 + crossContaminations * 15)

  const hasGuard = upperContent.includes('interface') || upperContent.includes('abstract')

  let boundaryType: LayerBoundary['boundaryType'] = 'clean'
  if (crossContaminations > 2 || hasInversion) boundaryType = 'fault'
  else if (couplingScore > 60) boundaryType = 'mixed'
  else if (couplingScore > 30) boundaryType = 'blurred'
  else if (couplingScore > 10) boundaryType = 'porous'
  if (importsFromLower === 0 && !hasGuard) boundaryType = 'missing'

  const descriptions: string[] = []
  if (boundaryType === 'fault') descriptions.push('Dependency inversion detected')
  if (boundaryType === 'missing') descriptions.push('No connection between layers')
  if (crossContaminations > 0) descriptions.push(`${crossContaminations} cross-contamination(s)`)
  if (couplingScore > 40) descriptions.push(`High coupling (${couplingScore})`)
  if (hasGuard) descriptions.push('Abstraction guard present')
  if (descriptions.length === 0) descriptions.push('Well-separated layers')

  return {
    upperLayer: upper.layerName,
    lowerLayer: lower.layerName,
    boundaryType,
    crossContaminations,
    dependencies: importsFromLower,
    couplingScore,
    hasGuard,
    description: descriptions.join('; '),
  }
}

// ─── Strata Column Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as a geological column
 * @example
 * analyzeStrataColumn('src', files, contents) // StrataColumn
 */
export function analyzeStrataColumn(
  dirPath: string,
  files: string[],
  contents: string[],
): StrataColumn {
  const layerMap = new Map<string, { files: string[]; contents: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const layer = identifyLayer(file, content)
    const existing = layerMap.get(layer)
    if (existing) {
      existing.files.push(file)
      existing.contents.push(content)
    } else {
      layerMap.set(layer, { files: [file], contents: [content] })
    }
  }

  const layers: StrataLayer[] = []
  for (const [layerName, data] of layerMap) {
    layers.push(analyzeLayerContent(data.files, data.contents, layerName))
  }

  layers.sort((a, b) => a.depth - b.depth)

  // Set bondedTo relationships
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    const prev = layers[i - 1]
    const next = layers[i + 1]
    if (layer === undefined) continue
    if (prev !== undefined) layer.bondedTo.push(prev.layerName)
    if (next !== undefined) layer.bondedTo.push(next.layerName)
  }

  const boundaries: LayerBoundary[] = []
  for (let i = 0; i < layers.length - 1; i++) {
    const upper = layers[i]
    const lower = layers[i + 1]
    if (upper === undefined || lower === undefined) continue
    boundaries.push(analyzeBoundary(upper, lower, files, contents))
  }

  const avgQuality = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.avgQuality, 0) / layers.length)
    : 0

  const totalDepth = layers.length > 0 ? Math.max(...layers.map(l => l.depth)) + 1 : 0

  const structuralIntegrity = computeStructuralIntegrity(layers, boundaries)

  const inversionCount = boundaries.filter(b => b.boundaryType === 'fault').length
  const hasInversions = inversionCount > 0

  const erosionRisk = computeErosionRisk(layers, boundaries)

  const isHealthy = structuralIntegrity >= 60 && !hasInversions && erosionRisk < 40
  const healthGrade = computeHealthGrade(structuralIntegrity, hasInversions, erosionRisk)

  const dominantRock = findDominantRock(layers)
  const geologicalAge = determineGeologicalAge(layers)

  const recommendations = generateColumnRecommendations(layers, boundaries, hasInversions, erosionRisk)

  return {
    directory: dirPath,
    layers,
    boundaries,
    totalDepth,
    avgQuality,
    structuralIntegrity,
    hasInversions,
    inversionCount,
    erosionRisk,
    isHealthy,
    healthGrade,
    dominantRock,
    geologicalAge,
    recommendations,
  }
}

function computeStructuralIntegrity(layers: StrataLayer[], boundaries: LayerBoundary[]): number {
  if (layers.length === 0) return 0

  const layerScore = layers.reduce((sum, l) => sum + l.avgQuality, 0) / layers.length
  const boundaryPenalty = boundaries.reduce((sum, b) => {
    if (b.boundaryType === 'fault') return sum + 20
    if (b.boundaryType === 'mixed') return sum + 12
    if (b.boundaryType === 'blurred') return sum + 8
    if (b.boundaryType === 'porous') return sum + 4
    return sum
  }, 0)
  const guardBonus = boundaries.filter(b => b.hasGuard).length * 5

  return Math.min(100, Math.max(0, Math.round(layerScore - boundaryPenalty + guardBonus)))
}

function computeErosionRisk(layers: StrataLayer[], boundaries: LayerBoundary[]): number {
  if (layers.length === 0) return 0

  const porosityScore = layers.reduce((sum, l) => sum + l.porosity, 0) / layers.length
  const fossilScore = Math.min(30, layers.reduce((sum, l) => sum + l.fossils.length, 0) * 3)
  const faultScore = boundaries.filter(b => b.boundaryType === 'fault').length * 10

  return Math.min(100, Math.max(0, Math.round(porosityScore * 0.5 + fossilScore + faultScore)))
}

function computeHealthGrade(integrity: number, hasInversions: boolean, erosion: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (hasInversions && erosion > 60) return 'F'
  if (integrity >= 80 && !hasInversions) return 'A'
  if (integrity >= 60 && erosion < 40) return 'B'
  if (integrity >= 40) return 'C'
  if (integrity >= 20) return 'D'
  return 'F'
}

function findDominantRock(layers: StrataLayer[]): string {
  if (layers.length === 0) return 'none'
  const counts = new Map<string, number>()
  for (const l of layers) {
    counts.set(l.classification, (counts.get(l.classification) ?? 0) + 1)
  }
  let maxCount = 0
  let dominant = 'none'
  for (const [rock, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      dominant = rock
    }
  }
  return dominant
}

function determineGeologicalAge(layers: StrataLayer[]): string {
  if (layers.length === 0) return 'unknown'
  const ages = layers.map(l => l.age)
  if (ages.includes('fossilized')) return 'ancient'
  if (ages.includes('ancient')) return 'prehistoric'
  if (ages.includes('mature')) return 'established'
  if (ages.includes('recent')) return 'developing'
  return 'nascent'
}

function generateColumnRecommendations(
  layers: StrataLayer[],
  boundaries: LayerBoundary[],
  hasInversions: boolean,
  erosionRisk: number,
): string[] {
  const recs: string[] = []

  for (const l of layers) {
    if (l.stability === 'quicksand') recs.push(`Stabilize ${l.layerName} layer - critical instability`)
    if (l.stability === 'unstable') recs.push(`Reinforce ${l.layerName} layer - unstable foundation`)
    if (l.contaminated) recs.push(`Separate concerns in ${l.layerName} - found ${l.contaminants.join(', ')}`)
    if (l.fossils.length > 3) recs.push(`Extract fossils from ${l.layerName} - ${l.fossils.length} dead artifacts`)
  }

  for (const b of boundaries) {
    if (b.boundaryType === 'fault') recs.push(`Fix fault between ${b.upperLayer} and ${b.lowerLayer}`)
    if (b.boundaryType === 'missing') recs.push(`Establish boundary between ${b.upperLayer} and ${b.lowerLayer}`)
  }

  if (hasInversions) recs.push('Resolve dependency inversions')
  if (erosionRisk > 60) recs.push('High erosion risk - refactor before adding features')

  return recs
}

// ─── Geological Score ────────────────────────────────────────────────────────

/**
 * Compute overall geological score 0-100
 * @example
 * computeGeologicalScore(layers, boundaries, columns) // 75
 */
export function computeGeologicalScore(
  layers: StrataLayer[],
  boundaries: LayerBoundary[],
  columns: StrataColumn[],
): number {
  if (layers.length === 0) return 0

  const layerQuality = layers.reduce((s, l) => s + l.avgQuality, 0) / layers.length
  const boundaryScore = boundaries.length > 0
    ? boundaries.reduce((s, b) => s + (b.boundaryType === 'clean' ? 100 : b.boundaryType === 'porous' ? 70 : b.boundaryType === 'blurred' ? 50 : b.boundaryType === 'mixed' ? 30 : b.boundaryType === 'fault' ? 10 : 0), 0) / boundaries.length
    : 100
  const columnIntegrity = columns.length > 0
    ? columns.reduce((s, c) => s + c.structuralIntegrity, 0) / columns.length
    : 100
  const contaminationPenalty = layers.filter(l => l.contaminated).length * 5
  const inversionPenalty = columns.filter(c => c.hasInversions).length * 10

  return Math.min(100, Math.max(0, Math.round(
    layerQuality * 0.4 + boundaryScore * 0.3 + columnIntegrity * 0.3 - contaminationPenalty - inversionPenalty,
  )))
}

/**
 * Classify stability grade from score
 * @example
 * classifyStabilityGrade(85) // 'rock-solid'
 */
export function classifyStabilityGrade(score: number): FrescoLayerStats['stabilityGrade'] {
  if (score >= 80) return 'rock-solid'
  if (score >= 60) return 'stable'
  if (score >= 40) return 'settling'
  if (score >= 25) return 'shifting'
  if (score >= 10) return 'unstable'
  return 'collapsing'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate global recommendations
 * @example
 * generateRecommendations(layers, boundaries, columns, stats) // string[]
 */
export function generateRecommendations(
  _layers: StrataLayer[],
  _boundaries: LayerBoundary[],
  columns: StrataColumn[],
  stats: FrescoLayerStats,
): string[] {
  const recs: string[] = []

  if (stats.quicksandLayers > 0) recs.push(`Critical: ${stats.quicksandLayers} quicksand layer(s) need immediate stabilization`)
  if (stats.faultBoundaries > 0) recs.push(`Add abstractions across ${stats.faultBoundaries} fault boundary/boundaries`)
  if (stats.contaminatedLayers > 0) recs.push(`Separate concerns in ${stats.contaminatedLayers} contaminated layer(s)`)
  if (stats.totalFossils > 5) recs.push(`Extract or remove ${stats.totalFossils} fossil artifact(s)`)
  if (stats.hasInversions) recs.push('Fix dependency inversion(s) to restore proper layering')
  if (stats.unstableLayers > stats.bedrockLayers) recs.push('More unstable than stable layers - refactor before growth')
  if (stats.avgErosionRisk > 50) recs.push('High erosion risk across codebase - prioritize debt reduction')
  if (stats.avgStructuralIntegrity < 40) recs.push('Structural integrity critically low - foundational refactoring needed')

  const unstableCols = columns.filter(c => !c.isHealthy)
  if (unstableCols.length > 0) {
    recs.push(`${unstableCols.length} unhealthy column(s): ${unstableCols.map(c => c.directory).join(', ')}`)
  }

  if (recs.length === 0) recs.push('Geological structure is healthy - maintain current practices')

  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete fresco layer analysis result
 * @example
 * buildFrescoLayerResult(files, contents, {}) // FrescoLayerResult
 */
export function buildFrescoLayerResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): FrescoLayerResult {
  // Group files by directory for column analysis
  const dirMap = new Map<string, { files: string[]; contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const normalized = file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.files.push(file)
      existing.contents.push(content)
    } else {
      dirMap.set(dir, { files: [file], contents: [content] })
    }
  }

  // Build layers from all files
  const layerMap = new Map<string, { files: string[]; contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i]
    if (file === undefined || content === undefined) continue
    const layer = identifyLayer(file, content)
    const existing = layerMap.get(layer)
    if (existing) {
      existing.files.push(file)
      existing.contents.push(content)
    } else {
      layerMap.set(layer, { files: [file], contents: [content] })
    }
  }

  const layers: StrataLayer[] = []
  for (const [layerName, data] of layerMap) {
    layers.push(analyzeLayerContent(data.files, data.contents, layerName))
  }
  layers.sort((a, b) => a.depth - b.depth)

  // Set bondedTo
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    const prev = layers[i - 1]
    const next = layers[i + 1]
    if (layer === undefined) continue
    if (prev !== undefined) layer.bondedTo.push(prev.layerName)
    if (next !== undefined) layer.bondedTo.push(next.layerName)
  }

  // Build boundaries
  const boundaries: LayerBoundary[] = []
  for (let i = 0; i < layers.length - 1; i++) {
    const upper = layers[i]
    const lower = layers[i + 1]
    if (upper === undefined || lower === undefined) continue
    boundaries.push(analyzeBoundary(upper, lower, files, contents))
  }

  // Build columns
  const columns: StrataColumn[] = []
  for (const [dir, data] of dirMap) {
    columns.push(analyzeStrataColumn(dir, data.files, data.contents))
  }

  // Stats
  const stats = computeStats(layers, boundaries, columns, files.length)

  const recommendations = generateRecommendations(layers, boundaries, columns, stats)

  return { layers, boundaries, columns, stats, recommendations }
}

function computeStats(
  layers: StrataLayer[],
  boundaries: LayerBoundary[],
  columns: StrataColumn[],
  totalFiles: number,
): FrescoLayerStats {
  const avgLayerQuality = layers.length > 0
    ? Math.round(layers.reduce((s, l) => s + l.avgQuality, 0) / layers.length)
    : 0
  const avgStructuralIntegrity = columns.length > 0
    ? Math.round(columns.reduce((s, c) => s + c.structuralIntegrity, 0) / columns.length)
    : 0
  const avgErosionRisk = columns.length > 0
    ? Math.round(columns.reduce((s, c) => s + c.erosionRisk, 0) / columns.length)
    : 0

  const bedrockLayers = layers.filter(l => l.stability === 'bedrock').length
  const unstableLayers = layers.filter(l => l.stability === 'unstable' || l.stability === 'shifting').length
  const quicksandLayers = layers.filter(l => l.stability === 'quicksand').length
  const cleanBoundaries = boundaries.filter(b => b.boundaryType === 'clean').length
  const faultBoundaries = boundaries.filter(b => b.boundaryType === 'fault').length
  const contaminatedLayers = layers.filter(l => l.contaminated).length
  const totalFossils = layers.reduce((s, l) => s + l.fossils.length, 0)
  const totalMinerals = layers.reduce((s, l) => s + l.minerals.length, 0)
  const hasInversions = columns.some(c => c.hasInversions)

  const score = computeGeologicalScore(layers, boundaries, columns)
  const stabilityGrade = classifyStabilityGrade(score)

  const sortedByIntegrity = [...columns].sort((a, b) => b.structuralIntegrity - a.structuralIntegrity)
  const mostStableColumn = sortedByIntegrity[0]?.directory ?? 'none'
  const leastStableColumn = sortedByIntegrity[sortedByIntegrity.length - 1]?.directory ?? 'none'

  const sortedByDepth = [...layers].sort((a, b) => b.depth - a.depth)
  const deepestLayer = sortedByDepth[0]?.layerName ?? 'none'
  const shallowestLayer = layers[0]?.layerName ?? 'none'

  return {
    totalFiles,
    totalLayers: layers.length,
    totalBoundaries: boundaries.length,
    totalColumns: columns.length,
    avgLayerQuality,
    avgStructuralIntegrity,
    avgErosionRisk,
    bedrockLayers,
    unstableLayers,
    quicksandLayers,
    cleanBoundaries,
    faultBoundaries,
    contaminatedLayers,
    totalFossils,
    totalMinerals,
    hasInversions,
    overallGeologicalScore: score,
    stabilityGrade,
    mostStableColumn,
    leastStableColumn,
    deepestLayer,
    shallowestLayer,
  }
}
