// ─── Types ─────────────────────────────────────────────────────────────────────

export type ChartedLevel = 'well-charted' | 'partially-charted' | 'uncharted' | 'misleading'
export type LandmarkType = 'function' | 'class' | 'interface' | 'type' | 'constant'
export type LandmarkVisibility = 'public' | 'exported' | 'internal' | 'private'
export type HazardType = 'phantom-island' | 'misleading-label' | 'treacherous-path' | 'dead-end' | 'whirlpool' | 'siren'
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ChartQuality = 'masterwork' | 'detailed' | 'rough' | 'sketchy' | 'blank'

export interface Landmark {
  name: string
  type: LandmarkType
  file: string
  visibility: LandmarkVisibility
  documented: boolean
  clarity: number
  isEntryPoint: boolean
  referencedBy: number
}

export interface Hazard {
  type: HazardType
  file: string
  description: string
  severity: HazardSeverity
  details: string
}

export interface ChartedRegion {
  path: string
  type: ChartedLevel
  documentation: number
  naming: number
  organization: number
  landmarks: Landmark[]
  hazards: Hazard[]
  completeness: number
}

export interface TradeRoute {
  from: string
  to: string
  imports: string[]
  volume: number
  isBiDirectional: boolean
  isHeavilyUsed: boolean
  clarity: number
}

export interface PortOfEntry {
  file: string
  name: string
  type: string
  isDocumented: boolean
  isTypeSafe: boolean
  incomingTraffic: number
  clarity: number
}

export interface CartographyStats {
  totalRegions: number
  wellCharted: number
  partiallyCharted: number
  uncharted: number
  misleading: number
  totalLandmarks: number
  documentedLandmarks: number
  totalHazards: number
  criticalHazards: number
  totalRoutes: number
  heavilyUsedRoutes: number
  totalPorts: number
  documentedPorts: number
  avgDocumentation: number
  avgNamingClarity: number
  avgOrganization: number
  mapCompleteness: number
  terraIncognita: number
  misleadingMapAreas: number
  chartQuality: ChartQuality
}

export interface CartographyResult {
  regions: ChartedRegion[]
  landmarks: Landmark[]
  hazards: Hazard[]
  routes: TradeRoute[]
  ports: PortOfEntry[]
  stats: CartographyStats
  recommendations: string[]
}

export interface CartographyOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Count JSDoc comment blocks in content.
 *
 * @example
 * countJSDocBlocks('/** doc *\/ const x = 1') // => 1
 */
export function countJSDocBlocks(content: string): number {
  const matches = content.match(/\/\*\*[\s\S]*?\*\//g)
  return matches ? matches.length : 0
}

/**
 * Count inline comments in content.
 *
 * @example
 * countInlineComments('const x = 1 // note') // => 1
 */
export function countInlineComments(content: string): number {
  const matches = content.match(/\/\/.*$/gm)
  return matches ? matches.length : 0
}

/**
 * Compute documentation score 0-100.
 *
 * @example
 * computeDocumentationScore(5, 10) // => 50
 */
export function computeDocumentationScore(jsdocCount: number, totalSymbols: number): number {
  if (totalSymbols === 0) return 100
  return Math.min(100, Math.round((jsdocCount / totalSymbols) * 100))
}

/**
 * Evaluate naming clarity 0-100.
 *
 * @example
 * evaluateNamingClarity('getUserById', 'function') // => 90
 */
export function evaluateNamingClarity(name: string, _type: LandmarkType): number {
  let score = 50

  // Good length
  if (name.length >= 3 && name.length <= 40) score += 10

  // camelCase or PascalCase
  if (/^[a-z][a-zA-Z0-9]*$/.test(name) || /^[A-Z][a-zA-Z0-9]*$/.test(name)) score += 10

  // Descriptive verbs for functions
  if (/^(get|set|is|has|add|remove|create|delete|update|find|fetch|handle|process|validate|compute|build|parse|format|check)/.test(name)) {
    score += 15
  }

  // Single letter names are bad
  if (name.length === 1) score -= 30

  // Very short names
  if (name.length === 2) score -= 15

  // Abbreviation suspicion
  if (/[A-Z]{3,}/.test(name)) score -= 10

  return Math.max(0, Math.min(100, score))
}

/**
 * Detect symbol type from content context.
 *
 * @example
 * detectLandmarkType('class Foo {}', 'Foo') // => 'class'
 */
export function detectLandmarkType(content: string, name: string): LandmarkType {
  if (new RegExp(`\\bclass\\s+${name}\\b`).test(content)) return 'class'
  if (new RegExp(`\\binterface\\s+${name}\\b`).test(content)) return 'interface'
  if (new RegExp(`\\btype\\s+${name}\\s*=`).test(content)) return 'type'
  if (new RegExp(`\\bconst\\s+${name}\\s*=`).test(content)) return 'constant'
  return 'function'
}

/**
 * Detect visibility of a symbol.
 *
 * @example
 * detectVisibility('export function foo() {}', 'foo') // => 'exported'
 */
export function detectVisibility(content: string, name: string): LandmarkVisibility {
  if (new RegExp(`export\\s+default\\s+.*\\b${name}\\b`).test(content)) return 'public'
  if (new RegExp(`export\\s+.*\\b${name}\\b`).test(content)) return 'exported'
  if (new RegExp(`(private|protected)\\s+.*\\b${name}\\b`).test(content)) return 'private'
  return 'internal'
}

/**
 * Check if a symbol has JSDoc documentation.
 *
 * @example
 * isDocumented('/** doc *\/\\nfunction foo() {}', 'foo') // => true
 */
export function isDocumented(content: string, name: string): boolean {
  const regex = new RegExp(`\\/\\*\\*[\\s\\S]*?\\*\\/\\s*(export\\s+)?(const|function|class|interface|type|enum)\\s+${name}`)
  return regex.test(content)
}

/**
 * Check if symbol is a module entry point.
 *
 * @example
 * isEntryPoint('export default function main() {}', 'main') // => true
 */
export function isEntryPoint(content: string, name: string): boolean {
  if (/export\s+default/.test(content) && new RegExp(`\\b${name}\\b`).test(content)) return true
  if (['main', 'index', 'start', 'run', 'init', 'setup', 'bootstrap', 'createApp', 'create'].includes(name)) return true
  return false
}

// ─── Region Charting ───────────────────────────────────────────────────────────

/**
 * Chart a region from file contents.
 *
 * @example
 * chartRegion(['a.ts'], ['const x = 1'], 'src') // => ChartedRegion
 */
export function chartRegion(files: string[], contents: string[], dirPath: string): ChartedRegion {
  const allContent = contents.join('\n')
  const landmarks = extractLandmarks(allContent, files[0] ?? dirPath)
  const hazards = identifyHazards(allContent, files[0] ?? dirPath, landmarks)

  const jsdocCount = countJSDocBlocks(allContent)
  const documentation = computeDocumentationScore(jsdocCount, landmarks.length)
  const naming = landmarks.length > 0
    ? Math.round(landmarks.reduce((s, l) => s + l.clarity, 0) / landmarks.length)
    : 50
  const organization = computeOrganizationScore(files)

  const completeness = Math.round((documentation * 0.4) + (naming * 0.3) + (organization * 0.3))
  const type = classifyRegion(completeness, documentation, hazards)

  return {
    path: dirPath,
    type,
    documentation,
    naming,
    organization,
    landmarks,
    hazards,
    completeness,
  }
}

/**
 * Classify region type from metrics.
 *
 * @example
 * classifyRegion(85, 90, []) // => 'well-charted'
 */
export function classifyRegion(completeness: number, documentation: number, hazards: Hazard[]): ChartedLevel {
  const criticalCount = hazards.filter(h => h.severity === 'critical').length
  if (criticalCount > 2 || completeness < 20) return 'uncharted'
  if (criticalCount > 0 || documentation < 30) return 'misleading'
  if (completeness >= 70 && documentation >= 50) return 'well-charted'
  return 'partially-charted'
}

/**
 * Compute organization score based on file structure.
 *
 * @example
 * computeOrganizationScore(['index.ts', 'utils.ts', 'main.ts']) // => 80
 */
export function computeOrganizationScore(files: string[]): number {
  if (files.length === 0) return 50

  let score = 60

  // Has index file
  if (files.some(f => f.endsWith('index.ts') || f.endsWith('index.js'))) score += 10

  // Good number of files (not too few, not too many)
  if (files.length >= 2 && files.length <= 20) score += 10

  // Consistent naming
  const extensions = new Set(files.map(f => {
    const dot = f.lastIndexOf('.')
    return dot >= 0 ? f.substring(dot) : ''
  }))
  if (extensions.size <= 2) score += 10

  // Has test files
  if (files.some(f => f.includes('.test.') || f.includes('.spec.'))) score += 10

  return Math.min(100, score)
}

// ─── Landmark Extraction ───────────────────────────────────────────────────────

/**
 * Extract landmarks (key symbols) from content.
 *
 * @example
 * extractLandmarks('export function add() {}', 'math.ts') // => [Landmark]
 */
export function extractLandmarks(content: string, filePath: string): Landmark[] {
  const landmarks: Landmark[] = []

  const symbolMatches = content.matchAll(/(?:export\s+)?(?:const|function|class|interface|type|enum)\s+(\w+)/g)
  for (const m of symbolMatches) {
    const name = m[1]
    if (!name) continue
    const type = detectLandmarkType(content, name)
    const visibility = detectVisibility(content, name)
    const documented = isDocumented(content, name)
    const clarity = evaluateNamingClarity(name, type)
    const entryPoint = isEntryPoint(content, name)

    landmarks.push({
      name,
      type,
      file: filePath,
      visibility,
      documented,
      clarity,
      isEntryPoint: entryPoint,
      referencedBy: 0,
    })
  }

  return landmarks
}

// ─── Hazard Identification ─────────────────────────────────────────────────────

/**
 * Identify hazards in the code.
 *
 * @example
 * identifyHazards(code, 'file.ts', landmarks) // => [Hazard]
 */
export function identifyHazards(content: string, filePath: string, landmarks: Landmark[]): Hazard[] {
  const hazards: Hazard[] = []

  // Phantom islands: exported but likely unused (export with no import elsewhere)
  const exported = landmarks.filter(l => l.visibility === 'exported' || l.visibility === 'public')
  for (const exp of exported) {
    const importPattern = new RegExp(`import.*\\b${exp.name}\\b`)
    if (!importPattern.test(content)) {
      hazards.push({
        type: 'phantom-island',
        file: filePath,
        description: `Exported symbol '${exp.name}' appears unused`,
        severity: 'low',
        details: `The symbol '${exp.name}' is exported but not imported within this file`,
      })
    }
  }

  // Treacherous paths: high complexity
  const complexity = computeCyclomaticComplexity(content)
  if (complexity > 10) {
    hazards.push({
      type: 'treacherous-path',
      file: filePath,
      description: `High cyclomatic complexity (${complexity})`,
      severity: complexity > 20 ? 'critical' : complexity > 15 ? 'high' : 'medium',
      details: `Cyclomatic complexity of ${complexity} suggests complex control flow`,
    })
  }

  // Dead ends: unreachable code patterns
  if (/return\s+.*\n\s*\S/.test(content) && !/\bif\b|\bswitch\b|\bfor\b|\bwhile\b/.test(content)) {
    // Simple heuristic: code after return without conditionals
  }

  // Whirlpools: circular imports
  const imports = extractImportSources(content)
  if (imports.length > 0 && hasSelfImport(imports, filePath)) {
    hazards.push({
      type: 'whirlpool',
      file: filePath,
      description: 'Potential circular import detected',
      severity: 'high',
      details: `File imports from a path that may create a circular dependency`,
    })
  }

  // Sirens: anti-patterns
  if (/\bvar\s/.test(content)) {
    hazards.push({
      type: 'siren',
      file: filePath,
      description: 'Use of var keyword (prefer const/let)',
      severity: 'medium',
      details: 'var has function scoping which can lead to subtle bugs',
    })
  }

  if (/\beval\s*\(/.test(content)) {
    hazards.push({
      type: 'siren',
      file: filePath,
      description: 'Use of eval() is dangerous',
      severity: 'critical',
      details: 'eval() can execute arbitrary code and is a security risk',
    })
  }

  // Misleading labels: function names that don't match behavior heuristics
  for (const landmark of landmarks) {
    if (landmark.type === 'function' && landmark.name.startsWith('get') && landmark.clarity < 50) {
      hazards.push({
        type: 'misleading-label',
        file: filePath,
        description: `Function '${landmark.name}' may have misleading name`,
        severity: 'low',
        details: `Name suggests a getter but clarity score is ${landmark.clarity}/100`,
      })
    }
  }

  return hazards
}

/**
 * Compute cyclomatic complexity of content.
 *
 * @example
 * computeCyclomaticComplexity('if (x) { }') // => 2
 */
export function computeCyclomaticComplexity(content: string): number {
  let complexity = 1
  const patterns = [/\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, /\bcatch\b/g, /\?\?/g, /&&/g, /\|\|/g, /\?\./g]
  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) complexity += matches.length
  }
  return complexity
}

/**
 * Extract import source paths from content.
 *
 * @example
 * extractImportSources("import { x } from './utils'") // => ['./utils']
 */
export function extractImportSources(content: string): string[] {
  const sources: string[] = []
  const matches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
  for (const m of matches) {
    const source = m[1]
    if (source !== undefined) sources.push(source)
  }
  return sources
}

/**
 * Check if file imports from itself.
 *
 * @example
 * hasSelfImport(['./utils'], 'utils.ts') // => false
 */
export function hasSelfImport(imports: string[], filePath: string): boolean {
  const baseName = filePath.includes('/') ? filePath.substring(filePath.lastIndexOf('/') + 1) : filePath
  const nameWithoutExt = baseName.includes('.') ? baseName.substring(0, baseName.lastIndexOf('.')) : baseName
  return imports.some(imp => imp.includes(nameWithoutExt))
}

// ─── Trade Routes ──────────────────────────────────────────────────────────────

/**
 * Map trade routes (dependency connections) between files.
 *
 * @example
 * mapTradeRoutes(['a.ts'], ["import { x } from './b'"]) // => [TradeRoute]
 */
export function mapTradeRoutes(files: string[], contents: string[]): TradeRoute[] {
  const routes: TradeRoute[] = []

  const resolveImport = (source: string, fromFile: string): string => {
    const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '.'
    const clean = source.replace(/^\.\//, '')
    return dir === '.' ? clean : `${dir}/${clean}`
  }

  const pathsMatch = (a: string, b: string): boolean => {
    if (a === b) return true
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']
    for (const ext of extensions) {
      if (a + ext === b || b + ext === a) return true
    }
    return false
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    if (!file) continue
    const sources = extractImportSources(content)
    for (const source of sources) {
      if (!source.startsWith('.')) continue

      const resolvedTarget = resolveImport(source, file)

      const existingReverse = routes.find(r => {
        const reverseTarget = resolveImport(r.to, r.from)
        return pathsMatch(reverseTarget, file) && pathsMatch(r.from, resolvedTarget)
      })

      if (existingReverse) {
        existingReverse.isBiDirectional = true
        continue
      }

      const existing = routes.find(r =>
        r.from === file && pathsMatch(resolveImport(r.to, r.from), resolvedTarget),
      )

      if (existing) {
        existing.volume += 1
      } else {
        routes.push({
          from: file,
          to: source,
          imports: [source],
          volume: 1,
          isBiDirectional: false,
          isHeavilyUsed: false,
          clarity: source.startsWith('./') ? 80 : 50,
        })
      }
    }
  }

  // Mark heavily used routes (top 20% by volume)
  if (routes.length > 0) {
    const volumes = routes.map(r => r.volume).sort((a, b) => b - a)
    const threshold = volumes[Math.max(0, Math.floor(volumes.length * 0.2))] ?? 0
    for (const route of routes) {
      route.isHeavilyUsed = route.volume >= threshold && threshold > 0
    }
  }

  return routes
}

// ─── Ports of Entry ────────────────────────────────────────────────────────────

/**
 * Identify ports of entry (public API surface).
 *
 * @example
 * identifyPortsOfEntry(['a.ts'], ['export function add() {}']) // => [PortOfEntry]
 */
export function identifyPortsOfEntry(files: string[], contents: string[]): PortOfEntry[] {
  const ports: PortOfEntry[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    if (!file) continue
    const exportMatches = content.matchAll(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/g)
    for (const m of exportMatches) {
      const name = m[1]
      if (!name) continue
      const type = detectLandmarkType(content, name)
      const documented = isDocumented(content, name)

      ports.push({
        file,
        name,
        type,
        isDocumented: documented,
        isTypeSafe: type === 'interface' || type === 'type' || /^function\s+\w+\s*\(/.test(content),
        incomingTraffic: 0,
        clarity: evaluateNamingClarity(name, type as LandmarkType),
      })
    }
  }

  return ports
}

// ─── Stats Computation ─────────────────────────────────────────────────────────

/**
 * Compute map completeness 0-100.
 *
 * @example
 * computeMapCompleteness(80, 70, 5) // => 71
 */
export function computeMapCompleteness(avgDocumentation: number, avgNaming: number, totalHazards: number): number {
  let score = (avgDocumentation * 0.4) + (avgNaming * 0.3) + 30
  score -= Math.min(totalHazards * 3, 30)
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Classify chart quality.
 *
 * @example
 * classifyChartQuality(90, 85, 1) // => 'masterwork'
 */
export function classifyChartQuality(completeness: number, documentation: number, criticalHazards: number): ChartQuality {
  if (criticalHazards > 3) return 'blank'
  if (completeness >= 80 && documentation >= 70) return 'masterwork'
  if (completeness >= 60 && documentation >= 50) return 'detailed'
  if (completeness >= 40) return 'rough'
  if (completeness >= 20) return 'sketchy'
  return 'blank'
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate cartography recommendations.
 *
 * @example
 * generateCartographyRecommendations(regions, hazards, routes, ports, stats) // => ['Document...']
 */
export function generateCartographyRecommendations(
  regions: ChartedRegion[],
  hazards: Hazard[],
  _routes: TradeRoute[],
  ports: PortOfEntry[],
  stats: CartographyStats,
): string[] {
  const recs: string[] = []

  // Uncharted regions
  const uncharted = regions.filter(r => r.type === 'uncharted')
  if (uncharted.length > 0) {
    recs.push(`Document ${uncharted.length} uncharted region${uncharted.length > 1 ? 's' : ''} to improve map coverage`)
  }

  // Critical hazards
  const critical = hazards.filter(h => h.severity === 'critical')
  if (critical.length > 0) {
    recs.push(`Fix ${critical.length} critical hazard${critical.length > 1 ? 's' : ''} immediately`)
  }

  // Undocumented ports
  const undocPorts = ports.filter(p => !p.isDocumented)
  if (undocPorts.length > 0) {
    recs.push(`Add API documentation for ${undocPorts.length} undocumented export${undocPorts.length > 1 ? 's' : ''}`)
  }

  // Misleading labels
  const misleading = hazards.filter(h => h.type === 'misleading-label')
  if (misleading.length > 0) {
    recs.push(`Rename ${misleading.length} misleading symbol${misleading.length > 1 ? 's' : ''} for clarity`)
  }

  // Whirlpools
  const whirlpools = hazards.filter(h => h.type === 'whirlpool')
  if (whirlpools.length > 0) {
    recs.push(`Break ${whirlpools.length} circular dependenc${whirlpools.length > 1 ? 'ies' : 'y'}`)
  }

  // Terra incognita
  if (stats.terraIncognita > 30) {
    recs.push(`Reduce terra incognita (${stats.terraIncognita}% uncharted) by adding documentation`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete cartography result.
 *
 * @example
 * buildCartographyResult(['a.ts'], ['code'], {}) // => CartographyResult
 */
export function buildCartographyResult(files: string[], contents: string[], options: CartographyOptions): CartographyResult {
  // Chart regions by directory
  const dirMap = new Map<string, { files: string[], contents: string[] }>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : '.'
    const entry = dirMap.get(dir) ?? { files: [], contents: [] }
    entry.files.push(file)
    entry.contents.push(contents[i] ?? '')
    dirMap.set(dir, entry)
  }

  const regions: ChartedRegion[] = []
  for (const [dir, entry] of dirMap) {
    regions.push(chartRegion(entry.files, entry.contents, dir))
  }

  // Extract all landmarks and hazards
  const allLandmarks: Landmark[] = []
  const allHazards: Hazard[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const landmarks = extractLandmarks(content, file)
    const hazards = identifyHazards(content, file, landmarks)
    allLandmarks.push(...landmarks)
    allHazards.push(...hazards)
  }

  // Map trade routes
  const routes = mapTradeRoutes(files, contents)

  // Identify ports of entry
  const ports = identifyPortsOfEntry(files, contents)

  // Compute stats
  const wellCharted = regions.filter(r => r.type === 'well-charted').length
  const partiallyCharted = regions.filter(r => r.type === 'partially-charted').length
  const uncharted = regions.filter(r => r.type === 'uncharted').length
  const misleading = regions.filter(r => r.type === 'misleading').length

  const avgDocumentation = regions.length > 0
    ? Math.round(regions.reduce((s, r) => s + r.documentation, 0) / regions.length) : 100
  const avgNamingClarity = regions.length > 0
    ? Math.round(regions.reduce((s, r) => s + r.naming, 0) / regions.length) : 100
  const avgOrganization = regions.length > 0
    ? Math.round(regions.reduce((s, r) => s + r.organization, 0) / regions.length) : 100

  const documentedLandmarks = allLandmarks.filter(l => l.documented).length
  const criticalHazards = allHazards.filter(h => h.severity === 'critical').length
  const heavilyUsedRoutes = routes.filter(r => r.isHeavilyUsed).length
  const documentedPorts = ports.filter(p => p.isDocumented).length

  const mapCompleteness = computeMapCompleteness(avgDocumentation, avgNamingClarity, allHazards.length)
  const terraIncognita = regions.length > 0
    ? Math.round((uncharted / regions.length) * 100) : 0
  const misleadingMapAreas = regions.length > 0
    ? Math.round((misleading / regions.length) * 100) : 0
  const chartQuality = classifyChartQuality(mapCompleteness, avgDocumentation, criticalHazards)

  const stats: CartographyStats = {
    totalRegions: regions.length,
    wellCharted,
    partiallyCharted,
    uncharted,
    misleading,
    totalLandmarks: allLandmarks.length,
    documentedLandmarks,
    totalHazards: allHazards.length,
    criticalHazards,
    totalRoutes: routes.length,
    heavilyUsedRoutes,
    totalPorts: ports.length,
    documentedPorts,
    avgDocumentation,
    avgNamingClarity,
    avgOrganization,
    mapCompleteness,
    terraIncognita,
    misleadingMapAreas,
    chartQuality,
  }

  const recommendations = generateCartographyRecommendations(regions, allHazards, routes, ports, stats)

  if (options.verbose) {
    // Include extra detail in verbose mode (no-op for now, results are the same)
  }

  return {
    regions,
    landmarks: allLandmarks,
    hazards: allHazards,
    routes,
    ports,
    stats,
    recommendations,
  }
}
