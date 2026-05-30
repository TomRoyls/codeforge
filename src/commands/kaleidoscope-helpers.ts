// ─── Types ─────────────────────────────────────────────────────────────────────

export type FindingType = 'pattern' | 'anomaly' | 'trend' | 'insight'

export interface Lens {
  name: string
  description: string
  color: string
  focus: string
}

export interface Finding {
  description: string
  files: string[]
  significance: number
  type: FindingType
}

export interface LensView {
  lens: Lens
  findings: Finding[]
  pattern: string
  symmetry: number
  beauty: number
}

export interface KaleidoscopeStats {
  totalLenses: number
  totalFindings: number
  avgSymmetry: number
  avgBeauty: number
  mostBeautifulLens: string
  mostChaoticLens: string
  patternCount: number
  anomalyCount: number
  overallHarmony: number
  dominantPattern: string
}

export interface KaleidoscopeResult {
  views: LensView[]
  rotation: number
  stats: KaleidoscopeStats
  recommendations: string[]
}

// ─── Lens Definitions ──────────────────────────────────────────────────────────

/**
 * Get all kaleidoscope lenses.
 *
 * @example
 * getLenses()
 */
export function getLenses(): Lens[] {
  return [
    { name: 'Structural', description: 'File organization, module boundaries, directory structure', color: '#4A90D9', focus: 'Architecture & Layout' },
    { name: 'Behavioral', description: 'Function patterns, control flow, data transformation', color: '#E67E22', focus: 'Logic & Flow' },
    { name: 'Temporal', description: 'Change patterns, growth trends, stability', color: '#27AE60', focus: 'Evolution & Change' },
    { name: 'Relational', description: 'Dependencies, coupling, import graph', color: '#8E44AD', focus: 'Connections & Coupling' },
    { name: 'Qualitative', description: 'Naming, documentation, readability', color: '#E74C3C', focus: 'Quality & Clarity' },
    { name: 'Quantitative', description: 'Metrics, sizes, counts', color: '#F39C12', focus: 'Measurements & Scale' },
  ]
}

// ─── Structural Lens ───────────────────────────────────────────────────────────

/**
 * Apply structural lens analysis.
 *
 * @example
 * applyStructuralLens(['a.ts'], ['code'])
 */
export function applyStructuralLens(files: string[], _contents: string[]): LensView {
  const lens: Lens = { name: 'Structural', description: 'File organization analysis', color: '#4A90D9', focus: 'Architecture' }
  const findings: Finding[] = []

  if (files.length === 0) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  const depths = files.map((f) => (f.match(/\//g) || []).length)
  const avgDepth = depths.length > 0 ? depths.reduce((s, d) => s + d, 0) / depths.length : 0

  const extensions = new Set(files.map((f) => { const parts = f.split('.'); return parts.length > 1 ? '.' + parts[parts.length - 1] : '' }))
  const extCount = extensions.size

  const dirs = new Set(files.map((f) => { const idx = f.lastIndexOf('/'); return idx >= 0 ? f.substring(0, idx) : '.' }))

  const avgFilesPerDir = dirs.size > 0 ? files.length / dirs.size : files.length

  findings.push({
    description: `${files.length} files across ${dirs.size} directories with ${extCount} file type${extCount !== 1 ? 's' : ''}`,
    files: files.slice(0, 10),
    significance: Math.min(100, Math.round(avgFilesPerDir * 20)),
    type: 'pattern',
  })

  if (avgDepth > 4) {
    findings.push({
      description: `Deep nesting detected (avg depth ${avgDepth.toFixed(1)})`,
      files: files.filter((f) => (f.match(/\//g) || []).length > 4).slice(0, 5),
      significance: 60,
      type: 'anomaly',
    })
  }

  const kebabFiles = files.filter((f) => /[-_]/.test(f.split('/').pop() || ''))
  if (kebabFiles.length > 0 && kebabFiles.length < files.length) {
    findings.push({
      description: `Mixed naming conventions: ${kebabFiles.length} kebab/snake vs ${files.length - kebabFiles.length} other`,
      files: kebabFiles.slice(0, 5),
      significance: 40,
      type: 'anomaly',
    })
  }

  const flatFiles = files.filter((f) => !f.includes('/'))
  if (flatFiles.length > files.length * 0.5 && files.length > 5) {
    findings.push({
      description: `${flatFiles.length} files in root — consider organizing into directories`,
      files: flatFiles.slice(0, 5),
      significance: 50,
      type: 'insight',
    })
  }

  const pattern = avgDepth < 1.5 ? 'flat' : avgDepth < 3 ? 'shallow-hierarchy' : 'deep-hierarchy'
  const symmetry = computeSymmetry(depths.length > 0 ? depths : [0])

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Behavioral Lens ───────────────────────────────────────────────────────────

/**
 * Apply behavioral lens analysis.
 *
 * @example
 * applyBehavioralLens(['code'])
 */
export function applyBehavioralLens(contents: string[]): LensView {
  const lens: Lens = { name: 'Behavioral', description: 'Function patterns analysis', color: '#E67E22', focus: 'Logic' }
  const findings: Finding[] = []

  if (contents.length === 0 || contents.every((c) => c.length === 0)) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  let totalFunctions = 0
  let totalAsync = 0
  let totalTryCatch = 0
  let totalCallbacks = 0
  let arrowFunctions = 0
  const allParams: number[] = []

  for (const content of contents) {
    const funcs = (content.match(/\bfunction\b\s+\w+/g) || []).length
    const arrows = (content.match(/=>\s*[{(]/g) || []).length
    totalFunctions += funcs + arrows
    arrowFunctions += arrows

    totalAsync += (content.match(/\basync\b/g) || []).length
    totalTryCatch += (content.match(/\btry\s*{/g) || []).length
    totalCallbacks += (content.match(/\bcallback\b|\bcb\b/g) || []).length

    const paramMatches = content.match(/\(([^)]*)\)/g) || []
    for (const pm of paramMatches) {
      const params = pm.split(',').filter((p) => p.trim().length > 0 && p.trim() !== '(' && p.trim() !== ')')
      if (params.length > 0 && params.length < 10) allParams.push(params.length)
    }
  }

  findings.push({
    description: `${totalFunctions} functions (${arrowFunctions} arrow, ${totalAsync} async)`,
    files: [],
    significance: Math.min(100, totalFunctions * 5),
    type: 'pattern',
  })

  if (totalTryCatch > 0) {
    const ratio = totalFunctions > 0 ? totalTryCatch / totalFunctions : 0
    findings.push({
      description: `Error handling: ${totalTryCatch} try/catch blocks (${(ratio * 100).toFixed(0)}% coverage)`,
      files: [],
      significance: Math.round(ratio * 100),
      type: ratio > 0.5 ? 'pattern' : 'anomaly',
    })
  }

  if (totalCallbacks > 0) {
    findings.push({
      description: `${totalCallbacks} callback references detected`,
      files: [],
      significance: 30,
      type: 'trend',
    })
  }

  const avgParams = allParams.length > 0 ? allParams.reduce((s, p) => s + p, 0) / allParams.length : 0
  if (avgParams > 4) {
    findings.push({
      description: `High average parameter count: ${avgParams.toFixed(1)}`,
      files: [],
      significance: 70,
      type: 'anomaly',
    })
  }

  const pattern = totalAsync > totalFunctions * 0.5 ? 'async-heavy' : arrowFunctions > totalFunctions * 0.5 ? 'arrow-heavy' : 'mixed'
  const symmetry = computeSymmetry(allParams.length > 0 ? allParams : [1])

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Temporal Lens ─────────────────────────────────────────────────────────────

/**
 * Apply temporal lens analysis.
 *
 * @example
 * applyTemporalLens(['a.ts'])
 */
export function applyTemporalLens(files: string[]): LensView {
  const lens: Lens = { name: 'Temporal', description: 'Change pattern analysis', color: '#27AE60', focus: 'Evolution' }
  const findings: Finding[] = []

  if (files.length === 0) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  const testFiles = files.filter((f) => /\.(test|spec)\./.test(f) || /^test/.test(f))
  const srcFiles = files.filter((f) => !testFiles.includes(f))

  findings.push({
    description: `${files.length} files: ${srcFiles.length} source, ${testFiles.length} test`,
    files: files.slice(0, 5),
    significance: 50,
    type: 'pattern',
  })

  const testRatio = files.length > 0 ? testFiles.length / files.length : 0
  if (testRatio < 0.2 && files.length > 5) {
    findings.push({
      description: `Low test-to-source ratio (${(testRatio * 100).toFixed(0)}%)`,
      files: srcFiles.slice(0, 5),
      significance: 70,
      type: 'anomaly',
    })
  }

  const configFiles = files.filter((f) => /\.(json|yaml|yml|toml|config)/.test(f))
  if (configFiles.length > 0) {
    findings.push({
      description: `${configFiles.length} configuration file${configFiles.length !== 1 ? 's' : ''} detected`,
      files: configFiles.slice(0, 5),
      significance: 30,
      type: 'insight',
    })
  }

  const exts = files.map((f) => { const p = f.split('.'); return p.length > 1 ? p[p.length - 1] : '' })
  const extCounts = new Map<string, number>()
  for (const e of exts) extCounts.set(e ?? '', (extCounts.get(e ?? '') || 0) + 1)
  const dominant = [...extCounts.entries()].sort((a, b) => b[1] - a[1])[0]

  findings.push({
    description: `Dominant file type: .${dominant?.[0] ?? 'unknown'} (${dominant?.[1] ?? 0} files)`,
    files: [],
    significance: 40,
    type: 'trend',
  })

  const pattern = testRatio > 0.4 ? 'test-heavy' : testRatio > 0.15 ? 'balanced' : 'source-heavy'
  const fileSizes = files.map((f) => f.length)
  const symmetry = computeSymmetry(fileSizes)

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Relational Lens ───────────────────────────────────────────────────────────

/**
 * Apply relational lens analysis.
 *
 * @example
 * applyRelationalLens(['a.ts'], ['import x from "y"'])
 */
export function applyRelationalLens(files: string[], contents: string[]): LensView {
  const lens: Lens = { name: 'Relational', description: 'Dependency analysis', color: '#8E44AD', focus: 'Connections' }
  const findings: Finding[] = []

  if (files.length === 0 || contents.length === 0) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  let totalImports = 0
  const importCounts: number[] = []
  const referencedFiles = new Set<string>()

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i] ?? ''
    const imports = (content.match(/^import\s+.*from\s+['"]\.\.?\/[^'"]+['"]/gm) || []).length
    totalImports += imports
    importCounts.push(imports)

    const refs = content.match(/from\s+['"](\.\.?\/[^'"]+)['"]/g) || []
    for (const ref of refs) {
      const match = ref.match(/from\s+['"](\.[^'"]+)['"]/)
      if (match) referencedFiles.add(match[1] ?? '')
    }
  }

  findings.push({
    description: `${totalImports} relative imports across ${files.length} files`,
    files: files.slice(0, 5),
    significance: Math.min(100, totalImports * 3),
    type: 'pattern',
  })

  const hubThreshold = importCounts.length > 0 ? Math.max(...importCounts) : 0
  const hubs: string[] = []
  for (let i = 0; i < importCounts.length; i++) {
    if ((importCounts[i] ?? 0) >= hubThreshold * 0.8 && (importCounts[i] ?? 0) > 3) hubs.push(((files[i] ?? '') ?? '') ?? '')
  }
  if (hubs.length > 0) {
    findings.push({
      description: `${hubs.length} hub file${hubs.length !== 1 ? 's' : ''} with high import counts`,
      files: hubs.slice(0, 5),
      significance: 60,
      type: 'pattern',
    })
  }

  const zeroImport = importCounts.filter((c) => c === 0).length
  if (zeroImport > 0) {
    findings.push({
      description: `${zeroImport} isolated file${zeroImport !== 1 ? 's' : ''} with no relative imports`,
      files: files.filter((_, i) => importCounts[i] === 0).slice(0, 5),
      significance: 30,
      type: 'insight',
    })
  }

  const pattern = hubThreshold > 10 ? 'hub-spoke' : hubThreshold > 5 ? 'modular' : 'flat'
  const symmetry = computeSymmetry(importCounts.length > 0 ? importCounts : [0])

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Qualitative Lens ──────────────────────────────────────────────────────────

/**
 * Apply qualitative lens analysis.
 *
 * @example
 * applyQualitativeLens(['code'])
 */
export function applyQualitativeLens(contents: string[]): LensView {
  const lens: Lens = { name: 'Qualitative', description: 'Quality analysis', color: '#E74C3C', focus: 'Clarity' }
  const findings: Finding[] = []

  if (contents.length === 0 || contents.every((c) => c.length === 0)) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  let totalLines = 0
  let totalJSDoc = 0
  let totalComments = 0
  let totalGoodNames = 0
  let totalBadNames = 0
  const lineCounts: number[] = []

  for (const content of contents) {
    const lines = content.split('\n')
    totalLines += lines.length
    lineCounts.push(lines.length)

    totalJSDoc += (content.match(/\/\*\*[\s\S]*?\*\//g) || []).length
    totalComments += (content.match(/\/\/.*$/gm) || []).length

    const good = content.match(/(?:const|let|function|class)\s+[a-z][a-zA-Z0-9]{2,}/g)
    totalGoodNames += good ? good.length : 0

    const bad = content.match(/(?:const|let|function|class)\s+[a-z](?:\s|[;=,])/g)
    totalBadNames += bad ? bad.length : 0
  }

  const docRatio = totalLines > 0 ? (totalJSDoc + totalComments) / totalLines : 0
  findings.push({
    description: `Documentation: ${totalJSDoc} JSDoc blocks, ${totalComments} comments (${(docRatio * 100).toFixed(0)}% doc ratio)`,
    files: [],
    significance: Math.round(Math.min(100, docRatio * 500)),
    type: docRatio > 0.05 ? 'pattern' : 'anomaly',
  })

  const nameQuality = totalGoodNames + totalBadNames > 0 ? totalGoodNames / (totalGoodNames + totalBadNames) : 0
  findings.push({
    description: `Naming quality: ${totalGoodNames} good names, ${totalBadNames} short names (${(nameQuality * 100).toFixed(0)}% quality)`,
    files: [],
    significance: Math.round(nameQuality * 100),
    type: nameQuality > 0.8 ? 'pattern' : 'anomaly',
  })

  const avgLines = lineCounts.length > 0 ? lineCounts.reduce((s, l) => s + l, 0) / lineCounts.length : 0
  findings.push({
    description: `Average file size: ${Math.round(avgLines)} lines`,
    files: [],
    significance: avgLines > 300 ? 70 : 40,
    type: avgLines > 300 ? 'anomaly' : 'insight',
  })

  const pattern = docRatio > 0.1 ? 'well-documented' : docRatio > 0.03 ? 'moderately-documented' : 'undocumented'
  const symmetry = computeSymmetry(lineCounts)

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Quantitative Lens ─────────────────────────────────────────────────────────

/**
 * Apply quantitative lens analysis.
 *
 * @example
 * applyQuantitativeLens(['code'])
 */
export function applyQuantitativeLens(contents: string[]): LensView {
  const lens: Lens = { name: 'Quantitative', description: 'Metric analysis', color: '#F39C12', focus: 'Scale' }
  const findings: Finding[] = []

  if (contents.length === 0 || contents.every((c) => c.length === 0)) {
    return { lens, findings: [], pattern: 'empty', symmetry: 50, beauty: 50 }
  }

  const fileLineCounts: number[] = []
  const fileCharCounts: number[] = []
  let totalFunctions = 0
  let totalClasses = 0
  let totalExports = 0

  for (const content of contents) {
    const lines = content.split('\n').filter((l) => l.trim().length > 0)
    fileLineCounts.push(lines.length)
    fileCharCounts.push(content.length)

    totalFunctions += (content.match(/\bfunction\b|=>\s*[{(]/g) || []).length
    totalClasses += (content.match(/\bclass\b\s+\w+/g) || []).length
    totalExports += (content.match(/^export\s/gm) || []).length
  }

  const avgLines = fileLineCounts.length > 0 ? fileLineCounts.reduce((s, l) => s + l, 0) / fileLineCounts.length : 0
  const maxLines = Math.max(...fileLineCounts)
  const minLines = Math.min(...fileLineCounts)

  findings.push({
    description: `Files: ${contents.length} | Lines: ${fileLineCounts.reduce((s, l) => s + l, 0)} (avg ${Math.round(avgLines)}, range ${minLines}-${maxLines})`,
    files: [],
    significance: 50,
    type: 'pattern',
  })

  findings.push({
    description: `Functions: ${totalFunctions} | Classes: ${totalClasses} | Exports: ${totalExports}`,
    files: [],
    significance: 40,
    type: 'trend',
  })

  if (maxLines > 500) {
    findings.push({
      description: `Largest file has ${maxLines} lines — consider splitting`,
      files: [],
      significance: 70,
      type: 'anomaly',
    })
  }

  const variance = fileLineCounts.length > 1
    ? fileLineCounts.reduce((s, l) => s + Math.pow(l - avgLines, 2), 0) / fileLineCounts.length
    : 0
  if (variance > 10000) {
    findings.push({
      description: `High size variance across files (σ²=${Math.round(variance)})`,
      files: [],
      significance: 60,
      type: 'anomaly',
    })
  }

  const pattern = avgLines > 200 ? 'large-files' : avgLines > 80 ? 'medium-files' : 'small-files'
  const symmetry = computeSymmetry(fileLineCounts)

  return { lens, findings, pattern, symmetry, beauty: 0 }
}

// ─── Symmetry & Beauty ─────────────────────────────────────────────────────────

/**
 * Compute symmetry score from value distribution (low variance = high symmetry).
 *
 * @example
 * computeSymmetry([10, 12, 11, 10])
 */
export function computeSymmetry(values: number[]): number {
  if (values.length <= 1) return 70

  const avg = values.reduce((s, v) => s + v, 0) / values.length
  if (avg === 0) return 80

  const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
  const cv = Math.sqrt(variance) / avg

  const symmetry = Math.max(0, Math.min(100, Math.round(100 - cv * 100)))
  return symmetry
}

/**
 * Compute beauty score from symmetry and pattern quality.
 *
 * @example
 * computeBeauty(80, 'well-documented')
 */
export function computeBeauty(symmetry: number, pattern: string): number {
  const patternBonus: Record<string, number> = {
    'well-documented': 20,
    'balanced': 15,
    'modular': 15,
    'shallow-hierarchy': 10,
    'medium-files': 10,
    'mixed': 5,
    'async-heavy': 5,
    'arrow-heavy': 5,
    'flat': 5,
    'pattern': 10,
  }
  const bonus = patternBonus[pattern] ?? 0
  return Math.max(0, Math.min(100, Math.round(symmetry * 0.7 + bonus)))
}

// ─── Harmony & Patterns ────────────────────────────────────────────────────────

/**
 * Compute overall harmony across all lens views.
 *
 * @example
 * computeHarmony(views)
 */
export function computeHarmony(views: LensView[]): number {
  if (views.length === 0) return 50

  const symmetries = views.map((v) => v.symmetry)
  const beauties = views.map((v) => v.beauty)

  const avgSym = symmetries.reduce((s, v) => s + v, 0) / symmetries.length
  const avgBea = beauties.reduce((s, v) => s + v, 0) / beauties.length

  const symVariance = symmetries.length > 1
    ? symmetries.reduce((s, v) => s + Math.pow(v - avgSym, 2), 0) / symmetries.length
    : 0
  const consistency = Math.max(0, 100 - Math.sqrt(symVariance))

  return Math.round(0.3 * avgSym + 0.3 * avgBea + 0.4 * consistency)
}

/**
 * Find dominant pattern across all views.
 *
 * @example
 * findDominantPattern(views)
 */
export function findDominantPattern(views: LensView[]): string {
  if (views.length === 0) return 'none'

  const patterns = views.map((v) => v.pattern)
  const counts = new Map<string, number>()
  for (const p of patterns) counts.set(p, (counts.get(p) || 0) + 1)

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? 'mixed'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate kaleidoscope recommendations.
 *
 * @example
 * generateRecommendations(views, stats)
 */
export function generateRecommendations(views: LensView[], stats: KaleidoscopeStats): string[] {
  const recs: string[] = []

  for (const view of views) {
    if (view.symmetry < 40) {
      recs.push(`${view.lens.name} lens shows low symmetry (${view.symmetry}%) — consider standardizing ${view.lens.focus.toLowerCase()}`)
    }
  }

  if (stats.overallHarmony < 40) {
    recs.push('Low overall harmony — lenses disagree, suggesting inconsistent codebase practices')
  }

  const anomalies = views.reduce((s, v) => s + v.findings.filter((f) => f.type === 'anomaly').length, 0)
  if (anomalies > 5) {
    recs.push(`${anomalies} anomalies detected across lenses — investigate the most significant ones`)
  }

  if (stats.mostChaoticLens) {
    const chaotic = views.find((v) => v.lens.name === stats.mostChaoticLens)
    if (chaotic && chaotic.beauty < 40) {
      recs.push(`${stats.mostChaoticLens} is the most chaotic area — focus cleanup efforts here`)
    }
  }

  if (stats.patternCount > stats.anomalyCount * 3) {
    recs.push('Strong pattern-to-anomaly ratio — the codebase follows consistent conventions')
  }

  if (recs.length === 0) {
    recs.push('The kaleidoscope reveals a harmonious codebase with good consistency across all dimensions')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete kaleidoscope result.
 *
 * @example
 * buildKaleidoscopeResult(['a.ts'], ['code'], {})
 */
export function buildKaleidoscopeResult(files: string[], contents: string[], _options: Record<string, unknown>): KaleidoscopeResult {
  if (files.length === 0) {
    const emptyStats: KaleidoscopeStats = {
      totalLenses: 0, totalFindings: 0, avgSymmetry: 0, avgBeauty: 0,
      mostBeautifulLens: 'none', mostChaoticLens: 'none',
      patternCount: 0, anomalyCount: 0, overallHarmony: 0, dominantPattern: 'none',
    }
    return { views: [], rotation: 0, stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const lenses = getLenses()
  const rawViews: LensView[] = [
    applyStructuralLens(files, contents),
    applyBehavioralLens(contents),
    applyTemporalLens(files),
    applyRelationalLens(files, contents),
    applyQualitativeLens(contents),
    applyQuantitativeLens(contents),
  ]

  const views: LensView[] = rawViews.map((v, i) => {
    const beauty = computeBeauty(v.symmetry, v.pattern)
    return { ...v, lens: lenses[i] ?? v.lens, beauty }
  })

  const totalFindings = views.reduce((s, v) => s + v.findings.length, 0)
  const avgSymmetry = views.length > 0 ? Math.round(views.reduce((s, v) => s + v.symmetry, 0) / views.length) : 0
  const avgBeauty = views.length > 0 ? Math.round(views.reduce((s, v) => s + v.beauty, 0) / views.length) : 0

  const sorted = [...views].sort((a, b) => b.beauty - a.beauty)
  const mostBeautifulLens = sorted[0]?.lens.name ?? 'none'
  const mostChaoticLens = sorted[sorted.length - 1]?.lens.name ?? 'none'

  const patternCount = views.reduce((s, v) => s + v.findings.filter((f) => f.type === 'pattern').length, 0)
  const anomalyCount = views.reduce((s, v) => s + v.findings.filter((f) => f.type === 'anomaly').length, 0)

  const overallHarmony = computeHarmony(views)
  const dominantPattern = findDominantPattern(views)

  const uniquePatterns = new Set(views.map((v) => v.pattern))

  const stats: KaleidoscopeStats = {
    totalLenses: lenses.length,
    totalFindings,
    avgSymmetry,
    avgBeauty,
    mostBeautifulLens,
    mostChaoticLens,
    patternCount,
    anomalyCount,
    overallHarmony,
    dominantPattern,
  }

  const recommendations = generateRecommendations(views, stats)

  return { views, rotation: uniquePatterns.size, stats, recommendations }
}
