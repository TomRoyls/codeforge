// ─── Types ────────────────────────────────────────────────────────────────────

export interface Thread {
  id: string
  source: string
  type: 'import' | 'export' | 'function-call' | 'type-reference' | 'data-flow'
  target: string
  material: string
  tension: number
  isLoose: boolean
  isBroken: boolean
  isTangled: boolean
}

export interface WeavePattern {
  name: string
  description: string
  files: string[]
  consistency: number
  quality: 'masterwork' | 'fine' | 'standard' | 'rough' | 'unraveling'
}

export interface WeftInspection {
  file: string
  threads: Thread[]
  weaveDensity: number
  threadCount: number
  brokenThreads: number
  looseThreads: number
  tangledThreads: number
  tensionScore: number
  pattern: string
  overallQuality: 'pristine' | 'tight' | 'balanced' | 'loose' | 'frayed'
}

export interface TapestryWeaverStats {
  totalThreads: number
  importThreads: number
  exportThreads: number
  callThreads: number
  typeThreads: number
  dataFlowThreads: number
  looseThreads: number
  brokenThreads: number
  tangledThreads: number
  totalPatterns: number
  masterworkPatterns: number
  unravelingPatterns: number
  avgTension: number
  avgDensity: number
  avgThreadQuality: number
  idealTensionFiles: number
  overTensionFiles: number
  underTensionFiles: number
  overallWeave: 'masterwork' | 'fine-craft' | 'handwoven' | 'machine-made' | 'unraveled'
  weaveQuality: number
}

export interface TapestryWeaverResult {
  threads: Thread[]
  patterns: WeavePattern[]
  inspections: WeftInspection[]
  stats: TapestryWeaverStats
  recommendations: string[]
}

// ─── Thread Extraction ────────────────────────────────────────────────────────

let threadCounter = 0

/**
 * Create a unique thread ID
 * @example
 * makeThreadId() // 'thread-1'
 */
export function makeThreadId(): string {
  threadCounter++
  return `thread-${threadCounter}`
}

/**
 * Reset thread counter for testing
 * @example
 * resetThreadCounter() // counter back to 0
 */
export function resetThreadCounter(): void {
  threadCounter = 0
}

/**
 * Extract import threads from content
 * @example
 * extractImportThreads("import { x } from './foo'", 'a.ts') // [Thread]
 */
export function extractImportThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const matches = content.matchAll(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g)
  for (const m of matches) {
    const symbols = (m[1] || m[2] || m[3] || '').split(',').map(s => s.trim()).filter(Boolean)
    const target = m[4]
    threads.push({
      id: makeThreadId(),
      source: filePath,
      type: 'import',
      target,
      material: symbols.length > 0 ? symbols.join(', ') : '*',
      tension: 50,
      isLoose: false,
      isBroken: false,
      isTangled: false,
    })
  }
  return threads
}

/**
 * Extract export threads from content
 * @example
 * extractExportThreads("export function foo() {}", 'a.ts') // [Thread]
 */
export function extractExportThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const namedExports = content.matchAll(/export\s+(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g)
  for (const m of namedExports) {
    threads.push({
      id: makeThreadId(),
      source: filePath,
      type: 'export',
      target: 'external',
      material: m[1],
      tension: 30,
      isLoose: false,
      isBroken: false,
      isTangled: false,
    })
  }
  return threads
}

/**
 * Extract function call threads from content
 * @example
 * extractCallThreads("foo(); bar(x)", 'a.ts') // [Thread]
 */
export function extractCallThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const calls = content.matchAll(/(\w+)\s*\(/g)
  const keywords = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'class', 'return', 'throw', 'new', 'import', 'export', 'typeof', 'void', 'delete'])
  const seen = new Set<string>()
  for (const m of calls) {
    const name = m[1]
    if (keywords.has(name) || seen.has(name)) continue
    seen.add(name)
    threads.push({
      id: makeThreadId(),
      source: filePath,
      type: 'function-call',
      target: name,
      material: name,
      tension: 40,
      isLoose: false,
      isBroken: false,
      isTangled: false,
    })
  }
  return threads
}

/**
 * Extract type reference threads from content
 * @example
 * extractTypeThreads("const x: number = 1", 'a.ts') // [Thread]
 */
export function extractTypeThreads(content: string, filePath: string): Thread[] {
  const threads: Thread[] = []
  const typeRefs = content.matchAll(/:\s*([A-Z]\w+)/g)
  const seen = new Set<string>()
  for (const m of typeRefs) {
    const typeName = m[1]
    if (seen.has(typeName)) continue
    seen.add(typeName)
    threads.push({
      id: makeThreadId(),
      source: filePath,
      type: 'type-reference',
      target: typeName,
      material: typeName,
      tension: 35,
      isLoose: false,
      isBroken: false,
      isTangled: false,
    })
  }
  return threads
}

/**
 * Extract all threads from a file
 * @example
 * extractThreads(code, 'a.ts', ['a.ts']) // [Thread, ...]
 */
export function extractThreads(content: string, filePath: string, _allFiles: string[]): Thread[] {
  return [
    ...extractImportThreads(content, filePath),
    ...extractExportThreads(content, filePath),
    ...extractCallThreads(content, filePath),
    ...extractTypeThreads(content, filePath),
  ]
}

// ─── Thread Analysis ──────────────────────────────────────────────────────────

/**
 * Compute tension for a thread based on symbol count
 * @example
 * computeTensionForThread(thread) // 50
 */
export function computeTensionForThread(thread: Thread): number {
  const symbolCount = thread.material.split(',').length
  if (symbolCount >= 5) return Math.min(100, 60 + symbolCount * 5)
  if (symbolCount >= 3) return 65
  return 50
}

/**
 * Detect loose threads (unused exports)
 * @example
 * detectLooseThreads(threads) // marks unused exports
 */
export function detectLooseThreads(threads: Thread[]): Thread[] {
  const importedSymbols = new Set<string>()
  for (const t of threads) {
    if (t.type === 'import') {
      t.material.split(',').map(s => s.trim()).filter(Boolean).forEach(s => importedSymbols.add(s))
    }
  }
  for (const t of threads) {
    if (t.type === 'export' && !importedSymbols.has(t.material)) {
      t.isLoose = true
    }
  }
  return threads
}

/**
 * Detect broken threads (references to non-existent files)
 * @example
 * detectBrokenThreads(threads, ['src/a.ts']) // marks missing refs
 */
export function detectBrokenThreads(threads: Thread[], allFiles: string[]): Thread[] {
  const fileBasenames = new Set(allFiles.map(f => {
    const base = f.split('/').pop() || ''
    return base.replace(/\.[^.]+$/, '')
  }))
  for (const t of threads) {
    if (t.type === 'import' && t.target.startsWith('.')) {
      const importBase = t.target.split('/').pop() || t.target
      if (!fileBasenames.has(importBase)) {
        t.isBroken = true
      }
    }
  }
  return threads
}

/**
 * Detect tangled threads (files importing each other)
 * @example
 * detectTangledThreads(threads) // marks circular deps
 */
export function detectTangledThreads(threads: Thread[]): Thread[] {
  const importMap = new Map<string, Set<string>>()
  for (const t of threads) {
    if (t.type === 'import' && t.target.startsWith('.')) {
      if (!importMap.has(t.source)) importMap.set(t.source, new Set())
      importMap.get(t.source)!.add(t.target)
    }
  }
  for (const t of threads) {
    if (t.type === 'import' && t.target.startsWith('.')) {
      const reverseDeps = importMap.get(t.target)
      if (reverseDeps && reverseDeps.has(t.source)) {
        t.isTangled = true
      }
    }
  }
  return threads
}

// ─── Weave Patterns ───────────────────────────────────────────────────────────

/**
 * Identify the weave pattern for a file
 * @example
 * identifyWeavePattern(threads, 'a.ts') // 'plain-weave'
 */
export function identifyWeavePattern(threads: Thread[], _file: string): string {
  const imports = threads.filter(t => t.type === 'import')
  const exports = threads.filter(t => t.type === 'export')

  if (exports.length >= 5) return 'basket'
  if (imports.length === 0) return 'satin'
  if (imports.length >= 4) return 'twill'
  return 'plain-weave'
}

/**
 * Compute pattern consistency score
 * @example
 * computePatternConsistency(threads, 'plain-weave') // 80
 */
export function computePatternConsistency(threads: Thread[], pattern: string): number {
  const imports = threads.filter(t => t.type === 'import').length
  const exports = threads.filter(t => t.type === 'export').length
  const total = threads.length

  if (total === 0) return 100
  const ratio = imports / Math.max(1, total)
  const exportRatio = exports / Math.max(1, total)

  if (pattern === 'satin' && imports === 0) return 90
  if (pattern === 'basket' && exportRatio > 0.4) return 85
  if (pattern === 'twill' && ratio > 0.3) return 80
  if (pattern === 'plain-weave') return 70
  return 60
}

/**
 * Classify pattern quality
 * @example
 * classifyPatternQuality(90) // 'masterwork'
 */
export function classifyPatternQuality(consistency: number): WeavePattern['quality'] {
  if (consistency >= 85) return 'masterwork'
  if (consistency >= 70) return 'fine'
  if (consistency >= 50) return 'standard'
  if (consistency >= 30) return 'rough'
  return 'unraveling'
}

// ─── Weft Inspection ──────────────────────────────────────────────────────────

/**
 * Compute weave density for a file's threads
 * @example
 * computeWeaveDensity(10) // 50
 */
export function computeWeaveDensity(threadCount: number): number {
  return Math.min(100, threadCount * 10)
}

/**
 * Compute tension score — how close to ideal (50)
 * @example
 * computeTensionScore(threads) // 80
 */
export function computeTensionScore(threads: Thread[]): number {
  if (threads.length === 0) return 100
  const avg = threads.reduce((s, t) => s + t.tension, 0) / threads.length
  const deviation = Math.abs(avg - 50)
  return Math.max(0, Math.round(100 - deviation * 2))
}

/**
 * Classify weft overall quality
 * @example
 * classifyWeftQuality(5, 2, 1) // 'balanced'
 */
export function classifyWeftQuality(
  looseCount: number,
  brokenCount: number,
  tangledCount: number,
): WeftInspection['overallQuality'] {
  const issues = looseCount + brokenCount + tangledCount
  if (issues === 0) return 'pristine'
  if (brokenCount > 0) return 'frayed'
  if (tangledCount > 0) return 'tight'
  if (looseCount > 2) return 'loose'
  return 'balanced'
}

/**
 * Inspect a single file's weaving quality
 * @example
 * inspectWeft(code, 'a.ts', threads) // WeftInspection
 */
export function inspectWeft(
  _content: string,
  filePath: string,
  threads: Thread[],
): WeftInspection {
  const fileThreads = threads.filter(t => t.source === filePath)
  const loose = fileThreads.filter(t => t.isLoose).length
  const broken = fileThreads.filter(t => t.isBroken).length
  const tangled = fileThreads.filter(t => t.isTangled).length
  const pattern = identifyWeavePattern(fileThreads, filePath)
  const density = computeWeaveDensity(fileThreads.length)
  const tension = computeTensionScore(fileThreads)

  return {
    file: filePath,
    threads: fileThreads,
    weaveDensity: density,
    threadCount: fileThreads.length,
    brokenThreads: broken,
    looseThreads: loose,
    tangledThreads: tangled,
    tensionScore: tension,
    pattern,
    overallQuality: classifyWeftQuality(loose, broken, tangled),
  }
}

// ─── Computed Stats ───────────────────────────────────────────────────────────

/**
 * Classify overall weave quality
 * @example
 * classifyOverallWeave(80, 60, 70) // 'fine-craft'
 */
export function classifyOverallWeave(
  quality: number,
  tension: number,
  density: number,
): TapestryWeaverStats['overallWeave'] {
  const composite = (quality + tension + density) / 3
  if (composite >= 80) return 'masterwork'
  if (composite >= 65) return 'fine-craft'
  if (composite >= 45) return 'handwoven'
  if (composite >= 25) return 'machine-made'
  return 'unraveled'
}

/**
 * Compute weave quality composite score
 * @example
 * computeWeaveQuality(10, 2, 1, 50) // 75
 */
export function computeWeaveQuality(
  totalThreads: number,
  loose: number,
  broken: number,
  avgTension: number,
): number {
  if (totalThreads === 0) return 100
  const issueRatio = (loose + broken) / totalThreads
  const base = 100 - issueRatio * 100
  const tensionBonus = avgTension >= 40 && avgTension <= 60 ? 10 : 0
  return Math.max(0, Math.min(100, Math.round(base + tensionBonus)))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate weaving improvement recommendations
 * @example
 * generateRecommendations(threads, patterns, inspections, stats)
 */
export function generateRecommendations(
  threads: Thread[],
  _patterns: WeavePattern[],
  inspections: WeftInspection[],
  stats: TapestryWeaverStats,
): string[] {
  const recs: string[] = []

  if (stats.looseThreads > 0) {
    recs.push(`Remove or connect ${stats.looseThreads} loose thread(s) — unused exports detected`)
  }

  if (stats.brokenThreads > 0) {
    recs.push(`Repair ${stats.brokenThreads} broken thread(s) — references to non-existent targets`)
  }

  if (stats.tangledThreads > 0) {
    recs.push(`Untangle ${stats.tangledThreads} thread(s) — circular dependencies detected`)
  }

  const overTension = inspections.filter(i => i.tensionScore < 30)
  if (overTension.length > 0) {
    recs.push(`Reduce coupling in ${overTension.length} over-tensioned file(s)`)
  }

  const underTension = inspections.filter(i => i.weaveDensity < 10 && i.threadCount > 0)
  if (underTension.length > 0) {
    recs.push(`Verify necessity of ${underTension.length} under-connected file(s)`)
  }

  if (stats.unravelingPatterns > 0) {
    recs.push(`Establish consistent structure for ${stats.unravelingPatterns} unraveling pattern(s)`)
  }

  if (stats.overallWeave === 'unraveled' || stats.overallWeave === 'machine-made') {
    recs.push('Consider refactoring to improve overall code weaving quality')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete tapestry weaver analysis result
 * @example
 * const result = buildTapestryWeaverResult(['src/a.ts'], ['code'], {})
 */
export function buildTapestryWeaverResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): TapestryWeaverResult {
  resetThreadCounter()

  let allThreads: Thread[] = []
  for (let i = 0; i < files.length; i++) {
    allThreads = allThreads.concat(extractThreads(contents[i], files[i], files))
  }

  allThreads = detectLooseThreads(allThreads)
  allThreads = detectBrokenThreads(allThreads, files)
  allThreads = detectTangledThreads(allThreads)

  for (const t of allThreads) {
    t.tension = computeTensionForThread(t)
  }

  const inspections = files.map((f, i) => inspectWeft(contents[i], f, allThreads))

  const filePatterns = new Map<string, { threads: Thread[] }>()
  for (const t of allThreads) {
    if (!filePatterns.has(t.source)) filePatterns.set(t.source, { threads: [] })
    filePatterns.get(t.source)!.threads.push(t)
  }

  const patterns: WeavePattern[] = []
  for (const [file, data] of filePatterns) {
    const pat = identifyWeavePattern(data.threads, file)
    const consistency = computePatternConsistency(data.threads, pat)
    const quality = classifyPatternQuality(consistency)
    const existing = patterns.find(p => p.name === pat)
    if (existing) {
      existing.files.push(file)
      existing.consistency = Math.round((existing.consistency + consistency) / 2)
      if (quality === 'unraveling' || quality === 'rough') {
        existing.quality = quality
      }
    } else {
      patterns.push({
        name: pat,
        description: describePattern(pat),
        files: [file],
        consistency,
        quality,
      })
    }
  }

  const loose = allThreads.filter(t => t.isLoose).length
  const broken = allThreads.filter(t => t.isBroken).length
  const tangled = allThreads.filter(t => t.isTangled).length
  const avgTension = allThreads.length > 0
    ? Math.round(allThreads.reduce((s, t) => s + t.tension, 0) / allThreads.length * 10) / 10
    : 50
  const avgDensity = inspections.length > 0
    ? Math.round(inspections.reduce((s, i) => s + i.weaveDensity, 0) / inspections.length * 10) / 10
    : 0

  const idealTensionFiles = inspections.filter(i => i.tensionScore >= 70).length
  const overTensionFiles = inspections.filter(i => i.tensionScore < 30 && i.threadCount > 3).length
  const underTensionFiles = inspections.filter(i => i.tensionScore > 90 && i.threadCount > 0 && i.threadCount < 3).length

  const healthyThreads = allThreads.filter(t => !t.isLoose && !t.isBroken && !t.isTangled).length
  const avgThreadQuality = allThreads.length > 0
    ? Math.round(healthyThreads / allThreads.length * 100)
    : 100

  const weaveQuality = computeWeaveQuality(allThreads.length, loose, broken, avgTension)
  const overallWeave = classifyOverallWeave(weaveQuality, avgTension, avgDensity)

  const stats: TapestryWeaverStats = {
    totalThreads: allThreads.length,
    importThreads: allThreads.filter(t => t.type === 'import').length,
    exportThreads: allThreads.filter(t => t.type === 'export').length,
    callThreads: allThreads.filter(t => t.type === 'function-call').length,
    typeThreads: allThreads.filter(t => t.type === 'type-reference').length,
    dataFlowThreads: 0,
    looseThreads: loose,
    brokenThreads: broken,
    tangledThreads: tangled,
    totalPatterns: patterns.length,
    masterworkPatterns: patterns.filter(p => p.quality === 'masterwork').length,
    unravelingPatterns: patterns.filter(p => p.quality === 'unraveling').length,
    avgTension,
    avgDensity,
    avgThreadQuality,
    idealTensionFiles,
    overTensionFiles,
    underTensionFiles,
    overallWeave,
    weaveQuality,
  }

  const recommendations = generateRecommendations(allThreads, patterns, inspections, stats)

  return { threads: allThreads, patterns, inspections, stats, recommendations }
}

/**
 * Describe a weave pattern
 * @example
 * describePattern('plain-weave') // 'Simple alternating import structure'
 */
export function describePattern(pattern: string): string {
  const descriptions: Record<string, string> = {
    'plain-weave': 'Simple alternating import structure',
    'twill': 'Diagonal layered dependency pattern',
    'satin': 'Smooth surface with minimal dependencies',
    'basket': 'Barrel export grouping pattern',
    'herringbone': 'Bidirectional module interaction pattern',
  }
  return descriptions[pattern] || 'Unknown pattern'
}
