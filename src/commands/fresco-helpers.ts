// ─── Types ─────────────────────────────────────────────────────────────────────

export type LayerName = 'surface' | 'interface' | 'implementation' | 'foundation'
export type IssueType = 'crack' | 'peeling' | 'bleed-through' | 'missing-layer' | 'wrong-pigment' | 'overpainting' | 'underpainting'
export type IssueSeverity = 'cosmetic' | 'minor' | 'major' | 'structural'
export type FileGrade = 'masterwork' | 'gallery' | 'studio' | 'student' | 'graffiti'
export type OverallCondition = 'pristine' | 'well-preserved' | 'restored' | 'weathered' | 'damaged'
export type FrescoGrade = 'Sistine-Chapel' | 'gallery-piece' | 'studio-work' | 'student-art' | 'vandalism'

export interface LayerIssue {
  type: IssueType
  file: string
  layer: string
  severity: IssueSeverity
  description: string
  fix: string
}

export interface FrescoLayer {
  name: LayerName
  files: string[]
  symbols: number
  quality: number
  coverage: number
  isIntact: boolean
  issues: LayerIssue[]
}

export interface FrescoFile {
  file: string
  surfaceQuality: number
  interfaceQuality: number
  implementationQuality: number
  foundationQuality: number
  layerSeparation: number
  surfaceAccuracy: number
  storyCoherence: number
  issues: LayerIssue[]
  grade: FileGrade
}

export interface PaintingTechnique {
  name: string
  description: string
  files: string[]
  quality: number
}

export interface FrescoStats {
  totalFiles: number
  totalLayers: number
  totalIssues: number
  structuralIssues: number
  cosmeticIssues: number
  avgSurfaceQuality: number
  avgInterfaceQuality: number
  avgImplementationQuality: number
  avgFoundationQuality: number
  avgLayerSeparation: number
  avgSurfaceAccuracy: number
  avgStoryCoherence: number
  masterworkFiles: number
  graffitiFiles: number
  layerIntegrity: number
  surfaceFaithfulness: number
  overallCondition: OverallCondition
  frescoGrade: FrescoGrade
}

export interface FrescoResult {
  layers: FrescoLayer[]
  files: FrescoFile[]
  techniques: PaintingTechnique[]
  stats: FrescoStats
  recommendations: string[]
}

// ─── analyzeSurface ─────────────────────────────────────────────────────────────

/**
 * Analyze public API surface quality 0-100
 * @example
 * analyzeSurface('export function f(): number { return 1 }', 'a.ts') // 80
 */
export function analyzeSurface(content: string, _filePath: string): number {
  let score = 40
  const exports = (content.match(/export\s+(function|class|const|interface|type)/g) || []).length
  if (exports > 0) score += 15
  if (exports > 3) score += 5

  const documentedExports = (content.match(/\/\*\*[\s\S]*?\*\/\s*export/g) || []).length
  if (documentedExports > 0) score += 10

  const hasReturnTypes = /:\s*(string|number|boolean|void|Promise|Record|Map|Set|Array)/.test(content)
  if (hasReturnTypes) score += 10

  const hasParamTypes = /\(\s*\w+\s*:\s*\w+/.test(content)
  if (hasParamTypes) score += 10

  const hasDefaultExport = /export\s+default/.test(content)
  if (hasDefaultExport && exports > 2) score -= 5

  return Math.max(0, Math.min(100, score))
}

// ─── analyzeInterface ───────────────────────────────────────────────────────────

/**
 * Analyze interface/type definition quality 0-100
 * @example
 * analyzeInterface('interface Config { name: string }', 'a.ts') // 70
 */
export function analyzeInterface(content: string, _filePath: string): number {
  let score = 35
  const interfaces = (content.match(/interface\s+\w+/g) || []).length
  const typeAliases = (content.match(/type\s+\w+\s*=/g) || []).length
  const generics = (content.match(/<\w+>/g) || []).length

  if (interfaces > 0) score += 15
  if (typeAliases > 0) score += 10
  if (generics > 0) score += 10

  const documentedTypes = (content.match(/\/\*\*[\s\S]*?\*\/\s*(?:interface|type)\s/g) || []).length
  if (documentedTypes > 0) score += 10

  const hasReadonly = /readonly\s/.test(content)
  if (hasReadonly) score += 5

  const hasUnion = /\w+\s*\|\s*\w+/.test(content)
  if (hasUnion) score += 5

  if (interfaces === 0 && typeAliases === 0) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── analyzeImplementation ──────────────────────────────────────────────────────

/**
 * Analyze implementation code quality 0-100
 * @example
 * analyzeImplementation('function f() { try { x() } catch(e) { log(e) } }', 'a.ts') // 65
 */
export function analyzeImplementation(content: string, _filePath: string): number {
  let score = 40
  const hasErrorHandling = /try\s*\{|catch\s*\(|\.catch\(/g.test(content)
  if (hasErrorHandling) score += 15

  const hasAsync = /async\s|await\s|Promise/.test(content)
  if (hasAsync) score += 5

  const hasConst = /const\s/.test(content)
  if (hasConst) score += 5

  const lines = content.split('\n')
  const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLineLen < 80) score += 5
  if (avgLineLen > 120) score -= 10

  const hasAny = /:\s*any\b/.test(content)
  if (hasAny) score -= 10

  const hasComments = /\/\//.test(content)
  if (hasComments) score += 5

  const nesting = computeMaxNesting(content)
  if (nesting > 5) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ─── analyzeFoundation ──────────────────────────────────────────────────────────

/**
 * Analyze foundation/utility code quality 0-100
 * @example
 * analyzeFoundation('export function util(x: number): number { return x * 2 }', 'a.ts') // 75
 */
export function analyzeFoundation(content: string, _filePath: string): number {
  let score = 40
  const helpers = (content.match(/(?:function|const)\s+\w+\s*[=(]/g) || []).length
  if (helpers > 0) score += 10
  if (helpers > 3) score += 5

  const pure = !/\.push\(|\.splice\(|\.sort\(/.test(content)
  if (pure) score += 10

  const hasExports = /export\s/.test(content)
  if (hasExports) score += 10

  const hasTypes = /:\s*\w+/.test(content)
  if (hasTypes) score += 10

  const hasTests = /test\(|describe\(|it\(|expect\(/.test(content)
  if (hasTests) score += 10

  return Math.max(0, Math.min(100, score))
}

function computeMaxNesting(content: string): number {
  let max = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; max = Math.max(max, depth) }
    if (ch === '}') depth--
  }
  return max
}

// ─── computeLayerSeparation ─────────────────────────────────────────────────────

/**
 * Compute how well layers are separated 0-100
 * @example
 * computeLayerSeparation('interface A {} export function f(a: A) {}') // 80
 */
export function computeLayerSeparation(content: string): number {
  let score = 50
  const exports = (content.match(/export\s+(function|class|const)/g) || []).length
  const privates = (content.match(/(?:function|const)\s+\w+(?!\s*export)/g) || []).length
  const interfaces = (content.match(/interface\s+\w+/g) || []).length

  if (exports > 0 && privates > 0) score += 15
  if (interfaces > 0 && exports > 0) score += 15
  if (interfaces > 0) score += 10

  const internalLeak = /(?:let|var)\s+\w+[^;]*;[\s\S]*?export/.test(content)
  if (internalLeak) score -= 15

  const hasPublicPrivate = /public\s|private\s|protected\s/.test(content)
  if (hasPublicPrivate) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── computeSurfaceAccuracy ─────────────────────────────────────────────────────

/**
 * Compute whether API surface matches implementation 0-100
 * @example
 * computeSurfaceAccuracy(80, 70) // 75
 */
export function computeSurfaceAccuracy(surfaceQuality: number, implementationQuality: number): number {
  const diff = Math.abs(surfaceQuality - implementationQuality)
  return Math.max(0, Math.min(100, Math.round(100 - diff * 1.5)))
}

// ─── computeStoryCoherence ──────────────────────────────────────────────────────

/**
 * Compute story coherence 0-100
 * @example
 * computeStoryCoherence('export function processOrder(order: Order): Result { ... }') // 70
 */
export function computeStoryCoherence(content: string): number {
  let score = 40
  const lines = content.split('\n')

  const hasComments = lines.filter(l => /\/\//.test(l)).length
  const commentRatio = hasComments / Math.max(1, lines.length)
  if (commentRatio > 0.05 && commentRatio < 0.4) score += 10

  const hasJsdoc = /\/\*\*/.test(content)
  if (hasJsdoc) score += 10

  const namedExports = (content.match(/export\s+(?:function|class|const)\s+\w+/g) || []).length
  if (namedExports > 0) score += 10

  const hasLogicalFlow = /if\s*\(|else|switch|for\s|while\s/.test(content)
  if (hasLogicalFlow) score += 5

  const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / Math.max(1, lines.length)
  if (avgLineLen > 20 && avgLineLen < 100) score += 10

  const hasDescriptiveNames = /function\s+[a-z]{4,}|const\s+[a-z]{4,}/.test(content)
  if (hasDescriptiveNames) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── detectLayerIssues ──────────────────────────────────────────────────────────

/**
 * Detect layer integrity issues
 * @example
 * detectLayerIssues('const x: any = 1', 'a.ts') // LayerIssue[]
 */
export function detectLayerIssues(content: string, filePath: string): LayerIssue[] {
  const issues: LayerIssue[] = []
  const lines = content.split('\n')

  const exports = (content.match(/export\s+(function|class|const)/g) || []).length
  const interfaces = (content.match(/interface\s+\w+/g) || []).length
  const hasAny = /:\s*any\b/.test(content)
  const hasInternalInExport = /export\s+(?:const|let|var)\s+\w+\s*=\s*(?:new\s+\w+|fetch\(|require\()/.test(content)
  const tooManyExports = exports > 15
  const hasConsoleLog = /console\.(log|warn|error|debug)/.test(content)
  const exportedHasAny = /export\s+[\s\S]*?:\s*any/.test(content)

  if (exports > 0 && interfaces === 0 && content.split('\n').length > 30) {
    issues.push({
      type: 'missing-layer', file: filePath, layer: 'interface', severity: 'major',
      description: 'No interface/type definitions — implementation directly exposed',
      fix: 'Add interface or type definitions for exported symbols',
    })
  }

  if (hasAny) {
    issues.push({
      type: 'bleed-through', file: filePath, layer: 'implementation', severity: 'major',
      description: 'Implementation details bleeding through via `any` type',
      fix: 'Replace `any` with proper type definitions',
    })
  }

  if (hasInternalInExport) {
    issues.push({
      type: 'crack', file: filePath, layer: 'surface', severity: 'structural',
      description: 'Internal implementation leaked to surface layer',
      fix: 'Extract internal logic and export only the interface',
    })
  }

  if (exportedHasAny) {
    issues.push({
      type: 'peeling', file: filePath, layer: 'surface', severity: 'major',
      description: 'Deprecated/worn surface — any type in exported API',
      fix: 'Update exported types to match current implementation',
    })
  }

  if (tooManyExports) {
    issues.push({
      type: 'overpainting', file: filePath, layer: 'surface', severity: 'minor',
      description: `${exports} exports — too many layers of abstraction at surface`,
      fix: 'Split into focused modules with fewer exports each',
    })
  }

  if (exports === 0 && content.split('\n').length > 5 && !/import/.test(content)) {
    issues.push({
      type: 'underpainting', file: filePath, layer: 'surface', severity: 'minor',
      description: 'No exports — file may lack proper abstraction layer',
      fix: 'Consider if file should export utility functions or be removed',
    })
  }

  const misleadingNames = lines.filter(l =>
    /(?:function|const|class)\s+(get|set|is|has|check|validate)\w+\s*[=(]/.test(l) &&
    !/boolean|true|false/.test(l)
  )
  if (misleadingNames.length > 0) {
    issues.push({
      type: 'wrong-pigment', file: filePath, layer: 'surface', severity: 'cosmetic',
      description: `Misleading name(s) — ${misleadingNames.length} boolean-prefix name(s) without boolean context`,
      fix: 'Ensure boolean-prefixed names return boolean values',
    })
  }

  if (hasConsoleLog && exports > 0) {
    issues.push({
      type: 'bleed-through', file: filePath, layer: 'implementation', severity: 'cosmetic',
      description: 'Console logging in exported code — implementation visible',
      fix: 'Use a proper logger or remove console statements',
    })
  }

  return issues
}

// ─── classifyGrade ──────────────────────────────────────────────────────────────

/**
 * Classify file grade
 * @example
 * classifyGrade(85, 80, 0) // 'masterwork'
 */
export function classifyGrade(surfaceQuality: number, layerSeparation: number, issueCount: number): FileGrade {
  const avg = (surfaceQuality + layerSeparation) / 2
  if (avg >= 75 && issueCount === 0) return 'masterwork'
  if (avg >= 65 && issueCount <= 1) return 'gallery'
  if (avg >= 50 && issueCount <= 3) return 'studio'
  if (avg >= 30) return 'student'
  return 'graffiti'
}

// ─── computeLayerIntegrity ──────────────────────────────────────────────────────

/**
 * Compute layer integrity 0-100
 * @example
 * computeLayerIntegrity(layers, frescoFiles) // 75
 */
export function computeLayerIntegrity(layers: FrescoLayer[], files: FrescoFile[]): number {
  if (layers.length === 0) return 50
  const intactCount = layers.filter(l => l.isIntact).length
  const layerRatio = intactCount / layers.length
  const structuralIssues = files.reduce((s, f) => s + f.issues.filter(i => i.severity === 'structural').length, 0)
  const penalty = Math.min(30, structuralIssues * 10)
  return Math.max(0, Math.min(100, Math.round(layerRatio * 100 - penalty)))
}

// ─── computeSurfaceFaithfulness ─────────────────────────────────────────────────

/**
 * Compute surface faithfulness 0-100
 * @example
 * computeSurfaceFaithfulness(files) // 70
 */
export function computeSurfaceFaithfulness(files: FrescoFile[]): number {
  if (files.length === 0) return 50
  return Math.round(files.reduce((s, f) => s + f.surfaceAccuracy, 0) / files.length)
}

// ─── classifyCondition ──────────────────────────────────────────────────────────

/**
 * Classify overall condition
 * @example
 * classifyCondition(90, 85) // 'pristine'
 */
export function classifyCondition(integrity: number, faithfulness: number): OverallCondition {
  const avg = (integrity + faithfulness) / 2
  if (avg >= 80) return 'pristine'
  if (avg >= 65) return 'well-preserved'
  if (avg >= 50) return 'restored'
  if (avg >= 30) return 'weathered'
  return 'damaged'
}

// ─── classifyFrescoGrade ────────────────────────────────────────────────────────

/**
 * Classify overall fresco grade
 * @example
 * classifyFrescoGrade(90, 'pristine') // 'Sistine-Chapel'
 */
export function classifyFrescoGrade(integrity: number, condition: OverallCondition): FrescoGrade {
  if (integrity >= 80 && (condition === 'pristine' || condition === 'well-preserved')) return 'Sistine-Chapel'
  if (integrity >= 65 && condition !== 'damaged') return 'gallery-piece'
  if (integrity >= 45 && condition !== 'weathered' && condition !== 'damaged') return 'studio-work'
  if (integrity >= 25) return 'student-art'
  return 'vandalism'
}

// ─── detectTechniques ───────────────────────────────────────────────────────────

/**
 * Detect painting techniques (coding patterns)
 * @example
 * detectTechniques(['a.ts'], ['export function f() {}']) // PaintingTechnique[]
 */
export function detectTechniques(files: string[], contents: string[]): PaintingTechnique[] {
  const techniques: PaintingTechnique[] = []

  let interfaceFiles: string[] = []
  let functionalFiles: string[] = []
  let classFiles: string[] = []
  let utilityFiles: string[] = []

  for (let i = 0; i < files.length; i++) {
    const c = contents[i]
    const f = files[i]
    if (c === undefined || f === undefined) continue
    if (/interface\s+\w+/.test(c)) interfaceFiles.push(f)
    if (/export\s+function/.test(c) && !/class\s/.test(c)) functionalFiles.push(f)
    if (/class\s+\w+/.test(c)) classFiles.push(f)
    if (/export\s+const\s+\w+\s*=/.test(c) && !/class|function/.test(c)) utilityFiles.push(f)
  }

  if (interfaceFiles.length > 0) {
    techniques.push({
      name: 'buon-fresco',
      description: 'Interface-first design — types painted directly on the surface',
      files: interfaceFiles,
      quality: interfaceFiles.length > 2 ? 80 : 60,
    })
  }

  if (functionalFiles.length > 0) {
    techniques.push({
      name: 'secco',
      description: 'Functional composition — layers added on top of base',
      files: functionalFiles,
      quality: functionalFiles.length > 3 ? 75 : 55,
    })
  }

  if (classFiles.length > 0) {
    techniques.push({
      name: 'sgraffito',
      description: 'Class-based layering — scraping through layers to reveal structure',
      files: classFiles,
      quality: classFiles.length > 2 ? 70 : 50,
    })
  }

  if (utilityFiles.length > 0) {
    techniques.push({
      name: 'mezzo-fresco',
      description: 'Utility constants — partial depth carving for reuse',
      files: utilityFiles,
      quality: 60,
    })
  }

  return techniques
}

// ─── generateRecommendations ────────────────────────────────────────────────────

/**
 * Generate fresco recommendations
 * @example
 * generateRecommendations(layers, files, stats) // string[]
 */
export function generateRecommendations(
  _layers: FrescoLayer[],
  files: FrescoFile[],
  stats: FrescoStats,
): string[] {
  const recs: string[] = []
  const allIssues = files.flatMap(f => f.issues)

  const structural = allIssues.filter(i => i.severity === 'structural')
  if (structural.length > 0) {
    recs.push(`Fix ${structural.length} structural issue(s) — layer boundary violations`)
  }

  const peeling = allIssues.filter(i => i.type === 'peeling')
  if (peeling.length > 0) {
    recs.push(`Update ${peeling.length} peeling surface(s) — API doesn't match implementation`)
  }

  const missingLayer = allIssues.filter(i => i.type === 'missing-layer')
  if (missingLayer.length > 0) {
    recs.push(`Add interfaces/types for ${missingLayer.length} file(s) with missing layer`)
  }

  if (stats.graffitiFiles > 0) {
    recs.push(`${stats.graffitiFiles} graffiti file(s) need comprehensive refactoring`)
  }

  if (stats.avgLayerSeparation < 40) {
    recs.push('Low layer separation — separate public API from implementation')
  }

  if (stats.avgSurfaceAccuracy < 40) {
    recs.push('Low surface accuracy - public API does not reflect actual behavior')
  }

  if (stats.structuralIssues > 3) {
    recs.push(`${stats.structuralIssues} structural issue(s) — critical layer violations`)
  }

  if (stats.avgStoryCoherence < 40) {
    recs.push('Low story coherence — improve naming and documentation flow')
  }

  return Array.from(new Set(recs))
}

// ─── buildFrescoResult ──────────────────────────────────────────────────────────

/**
 * Build complete fresco analysis result
 * @example
 * buildFrescoResult(['a.ts'], ['export function f() {}'], {}) // FrescoResult
 */
export function buildFrescoResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): FrescoResult {
  const frescoFiles: FrescoFile[] = []
  const layerMap: Record<LayerName, { files: string[]; symbols: number; quality: number; coverage: number; issues: LayerIssue[] }> = {
    surface: { files: [], symbols: 0, quality: 0, coverage: 0, issues: [] },
    interface: { files: [], symbols: 0, quality: 0, coverage: 0, issues: [] },
    implementation: { files: [], symbols: 0, quality: 0, coverage: 0, issues: [] },
    foundation: { files: [], symbols: 0, quality: 0, coverage: 0, issues: [] },
  }

  for (let i = 0; i < files.length; i++) {
    const content = contents[i]
    const filePath = files[i]
    if (content === undefined || filePath === undefined) continue

    const surfaceQ = analyzeSurface(content, filePath)
    const interfaceQ = analyzeInterface(content, filePath)
    const implQ = analyzeImplementation(content, filePath)
    const foundationQ = analyzeFoundation(content, filePath)
    const separation = computeLayerSeparation(content)
    const accuracy = computeSurfaceAccuracy(surfaceQ, implQ)
    const coherence = computeStoryCoherence(content)
    const issues = detectLayerIssues(content, filePath)

    frescoFiles.push({
      file: filePath,
      surfaceQuality: surfaceQ,
      interfaceQuality: interfaceQ,
      implementationQuality: implQ,
      foundationQuality: foundationQ,
      layerSeparation: separation,
      surfaceAccuracy: accuracy,
      storyCoherence: coherence,
      issues,
      grade: classifyGrade(surfaceQ, separation, issues.length),
    })

    const exports = (content.match(/export\s+/g) || []).length
    const types = (content.match(/interface\s+|type\s+\w+\s*=/g) || []).length

    if (exports > 0) {
      layerMap.surface.files.push(filePath)
      layerMap.surface.symbols += exports
      layerMap.surface.quality += surfaceQ
      layerMap.surface.coverage += (content.match(/\/\*\*/g) || []).length > 0 ? 1 : 0
    }
    if (types > 0) {
      layerMap.interface.files.push(filePath)
      layerMap.interface.symbols += types
      layerMap.interface.quality += interfaceQ
      layerMap.interface.coverage += (content.match(/\/\*\*[\s\S]*?\*\/\s*(?:interface|type)/g) || []).length > 0 ? 1 : 0
    }
    layerMap.implementation.files.push(filePath)
    layerMap.implementation.symbols += (content.match(/function\s|=>/g) || []).length
    layerMap.implementation.quality += implQ
    layerMap.implementation.coverage += issues.filter(i => i.severity !== 'structural').length === 0 ? 1 : 0

    if (/import\s/.test(content) || /util|helper|helper/i.test(content)) {
      layerMap.foundation.files.push(filePath)
      layerMap.foundation.symbols += (content.match(/(?:function|const)\s+\w+/g) || []).length
      layerMap.foundation.quality += foundationQ
      layerMap.foundation.coverage += 1
    }

    for (const issue of issues) {
      if (issue.layer === 'surface') layerMap.surface.issues.push(issue)
      else if (issue.layer === 'interface') layerMap.interface.issues.push(issue)
      else if (issue.layer === 'implementation') layerMap.implementation.issues.push(issue)
      else layerMap.foundation.issues.push(issue)
    }
  }

  const layers: FrescoLayer[] = (Object.entries(layerMap) as [LayerName, typeof layerMap.surface][]).map(([name, data]) => ({
    name,
    files: data.files,
    symbols: data.symbols,
    quality: data.files.length > 0 ? Math.round(data.quality / data.files.length) : 50,
    coverage: data.files.length > 0 ? Math.round((data.coverage / data.files.length) * 100) : 50,
    isIntact: data.issues.filter(i => i.severity === 'structural').length === 0,
    issues: data.issues,
  }))

  const techniques = detectTechniques(files, contents)

  const avg = (arr: number[]) => arr.length > 0
    ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length)
    : 50

  const allIssues = frescoFiles.flatMap(f => f.issues)
  const structuralIssues = allIssues.filter(i => i.severity === 'structural').length
  const cosmeticIssues = allIssues.filter(i => i.severity === 'cosmetic').length
  const masterworkFiles = frescoFiles.filter(f => f.grade === 'masterwork').length
  const graffitiFiles = frescoFiles.filter(f => f.grade === 'graffiti').length

  const layerIntegrity = computeLayerIntegrity(layers, frescoFiles)
  const surfaceFaithfulness = computeSurfaceFaithfulness(frescoFiles)
  const overallCondition = classifyCondition(layerIntegrity, surfaceFaithfulness)
  const frescoGrade = classifyFrescoGrade(layerIntegrity, overallCondition)

  const stats: FrescoStats = {
    totalFiles: files.length,
    totalLayers: layers.length,
    totalIssues: allIssues.length,
    structuralIssues,
    cosmeticIssues,
    avgSurfaceQuality: avg(frescoFiles.map(f => f.surfaceQuality)),
    avgInterfaceQuality: avg(frescoFiles.map(f => f.interfaceQuality)),
    avgImplementationQuality: avg(frescoFiles.map(f => f.implementationQuality)),
    avgFoundationQuality: avg(frescoFiles.map(f => f.foundationQuality)),
    avgLayerSeparation: avg(frescoFiles.map(f => f.layerSeparation)),
    avgSurfaceAccuracy: avg(frescoFiles.map(f => f.surfaceAccuracy)),
    avgStoryCoherence: avg(frescoFiles.map(f => f.storyCoherence)),
    masterworkFiles,
    graffitiFiles,
    layerIntegrity,
    surfaceFaithfulness,
    overallCondition,
    frescoGrade,
  }

  const recommendations = generateRecommendations(layers, frescoFiles, stats)

  return { layers, files: frescoFiles, techniques, stats, recommendations }
}
