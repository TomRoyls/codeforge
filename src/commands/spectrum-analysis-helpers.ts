// ─── Types ─────────────────────────────────────────────────────────────────────

export type DecompositionType = 'pure' | 'blend' | 'white' | 'muddy'

export interface SpectralLayer {
  name: string
  color: string
  intensity: number
  files: string[]
}

export interface ConcernDecomposition {
  file: string
  layers: Record<string, number>
  dominantConcern: string
  purity: number
  type: DecompositionType
  balance: number
}

export interface SpectrumProfile {
  file: string
  logic: number
  dataFlow: number
  errorHandling: number
  typing: number
  configuration: number
  presentation: number
  testing: number
  orchestration: number
}

export interface SpectrumStats {
  totalFiles: number
  pureFiles: number
  blendFiles: number
  whiteFiles: number
  muddyFiles: number
  avgPurity: number
  avgBalance: number
  dominantConcern: string
  rarestConcern: string
  colorDistribution: Record<string, number>
  overallPurity: number
  spectrumCompleteness: number
}

export interface SpectrumResult {
  decompositions: ConcernDecomposition[]
  layers: SpectralLayer[]
  profiles: SpectrumProfile[]
  stats: SpectrumStats
  recommendations: string[]
}

const CONCERN_NAMES = ['logic', 'dataFlow', 'errorHandling', 'typing', 'configuration', 'presentation', 'testing', 'orchestration'] as const

const CONCERN_COLORS: Record<string, string> = {
  logic: 'red',
  dataFlow: 'orange',
  errorHandling: 'yellow',
  typing: 'green',
  configuration: 'blue',
  presentation: 'indigo',
  testing: 'violet',
  orchestration: 'white',
}

// ─── Intensity Measurement ─────────────────────────────────────────────────────

/**
 * Measure logic intensity from content.
 *
 * @example
 * measureLogicIntensity('if (x) { switch(y) {} }')
 */
export function measureLogicIntensity(content: string): number {
  const patterns = content.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b|\breturn\b|\bbreak\b|\bfor\b|\bwhile\b/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure data flow intensity from content.
 *
 * @example
 * measureDataFlowIntensity('const x = arr.map(f).filter(g)')
 */
export function measureDataFlowIntensity(content: string): number {
  const patterns = content.match(/\bmap\b|\bfilter\b|\breduce\b|\bforEach\b|\.push\(|\.pop\(|\.shift\(|\.slice\(|\.splice\(|\.\.\.|\bObject\.assign\b|\bObject\.entries\b|\bObject\.keys\b|\bJSON\.parse\b|\bJSON\.stringify\b|\bparseInt\b|\bparseFloat\b/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure error handling intensity from content.
 *
 * @example
 * measureErrorHandlingIntensity('try {} catch(e) { throw new Error() }')
 */
export function measureErrorHandlingIntensity(content: string): number {
  const patterns = content.match(/\btry\b|\bcatch\b|\bthrow\b|\bError\b|\bfinally\b|\bPromise\b|\bawait\b|\basync\b|\breject\b|\bresolve\b/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure typing intensity from content.
 *
 * @example
 * measureTypingIntensity('interface Foo { x: string }')
 */
export function measureTypingIntensity(content: string): number {
  const patterns = content.match(/\binterface\b|\btype\b|\benum\b|\bas\b|\bextends\b|\bimplements\b|\bRecord\b|\bPartial\b|\bRequired\b|\bOmit\b|\bPick\b|\bReadonly\b|\bgenerics\b|<[A-Z]\w*>/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure configuration intensity from content.
 *
 * @example
 * measureConfigurationIntensity('const MAX = 100\nprocess.env.KEY')
 */
export function measureConfigurationIntensity(content: string): number {
  const patterns = content.match(/\bconst\s+[A-Z_]+\b|process\.env|\.env\b|\bconfig\b|\boptions\b|\bsettings\b|\bdefaults\b|\benvironment\b/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure presentation intensity from content.
 *
 * @example
 * measurePresentationIntensity('console.log(`Result: ${x}`)')
 */
export function measurePresentationIntensity(content: string): number {
  const patterns = content.match(/console\.\w+|`[^`]*\$\{|\\n|\\t|chalk\.|\.padStart|\.padEnd|\.repeat\(|\.join\(|\.toString\(/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure testing intensity from content.
 *
 * @example
 * measureTestingIntensity('describe("x", () => { it("does", () => { expect(x).toBe(1) }) })')
 */
export function measureTestingIntensity(content: string): number {
  const patterns = content.match(/\bdescribe\b|\bit\b|\bexpect\b|\btest\b|\bassert\b|\bmock\b|\bstub\b|\bspy\b|\bbeforeEach\b|\bafterEach\b|\bbeforeAll\b|\bafterAll\b|\bvi\.\w+|\bjest\.\w+/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

/**
 * Measure orchestration intensity from content.
 *
 * @example
 * measureOrchestrationIntensity('import { x } from "y"\nexport function z() {}')
 */
export function measureOrchestrationIntensity(content: string): number {
  const patterns = content.match(/\bimport\b|\bexport\b|\bfrom\s+['"]|require\s*\(|module\.exports|export\s+default|export\s+\{|re-export/g) || []
  const lines = content.split('\n').filter((l) => l.trim().length > 0).length
  if (lines === 0) return 0
  return Math.min(100, Math.round((patterns.length / lines) * 100))
}

// ─── Profile Building ──────────────────────────────────────────────────────────

/**
 * Build spectrum profile for a file.
 *
 * @example
 * buildProfile('app.ts', content)
 */
export function buildProfile(file: string, content: string): SpectrumProfile {
  return {
    file,
    logic: measureLogicIntensity(content),
    dataFlow: measureDataFlowIntensity(content),
    errorHandling: measureErrorHandlingIntensity(content),
    typing: measureTypingIntensity(content),
    configuration: measureConfigurationIntensity(content),
    presentation: measurePresentationIntensity(content),
    testing: measureTestingIntensity(content),
    orchestration: measureOrchestrationIntensity(content),
  }
}

// ─── Concern Decomposition ─────────────────────────────────────────────────────

/**
 * Decompose profile into concern layers.
 *
 * @example
 * decomposeConcerns(profile)
 */
export function decomposeConcerns(profile: SpectrumProfile): Record<string, number> {
  const raw: Record<string, number> = {
    logic: profile.logic,
    dataFlow: profile.dataFlow,
    errorHandling: profile.errorHandling,
    typing: profile.typing,
    configuration: profile.configuration,
    presentation: profile.presentation,
    testing: profile.testing,
    orchestration: profile.orchestration,
  }

  const total = Object.values(raw).reduce((s, v) => s + v, 0)
  if (total === 0) return raw

  const normalized: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw)) {
    normalized[key] = Math.round((value / total) * 100)
  }

  return normalized
}

/**
 * Identify dominant concern from layers.
 *
 * @example
 * identifyDominantConcern({ logic: 60, dataFlow: 20 })
 */
export function identifyDominantConcern(layers: Record<string, number>): string {
  let maxConcern = 'logic'
  let maxValue = 0
  for (const [concern, value] of Object.entries(layers)) {
    if (value > maxValue) {
      maxValue = value
      maxConcern = concern
    }
  }
  return maxConcern
}

/**
 * Compute purity of a profile.
 *
 * @example
 * computePurity(profile)
 */
export function computePurity(profile: SpectrumProfile): number {
  const values = [profile.logic, profile.dataFlow, profile.errorHandling, profile.typing, profile.configuration, profile.presentation, profile.testing, profile.orchestration]
  const total = values.reduce((s, v) => s + v, 0)
  if (total === 0) return 100

  const maxVal = Math.max(...values)
  return Math.round((maxVal / total) * 100)
}

/**
 * Compute balance of a profile.
 *
 * @example
 * computeBalance(profile)
 */
export function computeBalance(profile: SpectrumProfile): number {
  const values = [profile.logic, profile.dataFlow, profile.errorHandling, profile.typing, profile.configuration, profile.presentation, profile.testing, profile.orchestration]
  const activeValues = values.filter((v) => v > 0)
  if (activeValues.length <= 1) return 100

  const avg = activeValues.reduce((s, v) => s + v, 0) / activeValues.length
  const variance = activeValues.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / activeValues.length
  const maxVariance = Math.pow(100, 2)

  return Math.round(Math.max(0, 100 - (variance / maxVariance) * 1000))
}

/**
 * Classify decomposition type from purity.
 *
 * @example
 * classifyDecompositionType(85)
 */
export function classifyDecompositionType(purity: number): DecompositionType {
  if (purity >= 80) return 'pure'
  if (purity >= 60) return 'blend'
  if (purity >= 40) return 'white'
  return 'muddy'
}

// ─── Spectral Layers ───────────────────────────────────────────────────────────

/**
 * Build spectral layers from decompositions.
 *
 * @example
 * buildSpectralLayers(decompositions)
 */
export function buildSpectralLayers(decompositions: ConcernDecomposition[]): SpectralLayer[] {
  const layerMap = new Map<string, { totalIntensity: number; files: Set<string> }>()

  for (const name of CONCERN_NAMES) {
    layerMap.set(name, { totalIntensity: 0, files: new Set() })
  }

  for (const decomp of decompositions) {
    for (const [concern, intensity] of Object.entries(decomp.layers)) {
      const layer = layerMap.get(concern)
      if (layer) {
        layer.totalIntensity += intensity
        if (intensity > 10) layer.files.add(decomp.file)
      }
    }
  }

  return CONCERN_NAMES.map((name) => {
    const data = layerMap.get(name)!
    return {
      name,
      color: CONCERN_COLORS[name] ?? '',
      intensity: decompositions.length > 0 ? Math.round(data.totalIntensity / decompositions.length) : 0,
      files: [...data.files],
    }
  })
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Compute overall purity.
 *
 * @example
 * computeOverallPurity(decompositions)
 */
export function computeOverallPurity(decompositions: ConcernDecomposition[]): number {
  if (decompositions.length === 0) return 0
  const total = decompositions.reduce((s, d) => s + d.purity, 0)
  return Math.round(total / decompositions.length)
}

/**
 * Compute spectrum completeness.
 *
 * @example
 * computeSpectrumCompleteness(layers)
 */
export function computeSpectrumCompleteness(layers: SpectralLayer[]): number {
  const represented = layers.filter((l) => l.intensity > 5).length
  return Math.round((represented / layers.length) * 100)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate spectrum recommendations.
 *
 * @example
 * generateRecommendations(decompositions, layers, stats)
 */
export function generateRecommendations(
  decompositions: ConcernDecomposition[],
  layers: SpectralLayer[],
  stats: SpectrumStats,
): string[] {
  const recs: string[] = []

  const whiteFiles = decompositions.filter((d) => d.type === 'white')
  if (whiteFiles.length > 0) {
    recs.push(`${whiteFiles.length} white file(s) — separate concerns into dedicated modules: ${whiteFiles.slice(0, 3).map((f) => f.file).join(', ')}`)
  }

  const muddyFiles = decompositions.filter((d) => d.type === 'muddy')
  if (muddyFiles.length > 0) {
    recs.push(`${muddyFiles.length} muddy file(s) — refactor for clearer concern separation: ${muddyFiles.slice(0, 3).map((f) => f.file).join(', ')}`)
  }

  const missingConcerns = layers.filter((l) => l.intensity <= 5)
  if (missingConcerns.length > 0) {
    const names = missingConcerns.map((l) => l.name).join(', ')
    recs.push(`Underrepresented concerns: ${names} — consider adding dedicated modules`)
  }

  const pureFiles = decompositions.filter((d) => d.type === 'pure')
  if (pureFiles.length > 0) {
    recs.push(`${pureFiles.length} pure file(s) with clean concern separation — good architecture examples`)
  }

  if (stats.overallPurity >= 70) {
    recs.push(`Overall purity ${stats.overallPurity}% — well-decomposed codebase`)
  }

  if (recs.length === 0) {
    recs.push('Spectrum analysis shows a well-balanced concern distribution across the codebase')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete spectrum result.
 *
 * @example
 * buildSpectrumResult(['a.ts'], ['code'], {})
 */
export function buildSpectrumResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): SpectrumResult {
  if (files.length === 0) {
    const emptyLayers = CONCERN_NAMES.map((name) => ({
      name, color: CONCERN_COLORS[name] ?? '', intensity: 0, files: [] as string[],
    }))
    const emptyStats: SpectrumStats = {
      totalFiles: 0, pureFiles: 0, blendFiles: 0, whiteFiles: 0, muddyFiles: 0,
      avgPurity: 0, avgBalance: 0, dominantConcern: 'none', rarestConcern: 'none',
      colorDistribution: {}, overallPurity: 0, spectrumCompleteness: 0,
    }
    return { decompositions: [], layers: emptyLayers, profiles: [], stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const profiles: SpectrumProfile[] = []
  const decompositions: ConcernDecomposition[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''

    const profile = buildProfile(file ?? '', content)
    profiles.push(profile)

    const layers = decomposeConcerns(profile)
    const dominantConcern = identifyDominantConcern(layers)
    const purity = computePurity(profile)
    const balance = computeBalance(profile)
    const type = classifyDecompositionType(purity)

    decompositions.push({ file: file ?? '', layers, dominantConcern, purity, type, balance })
  }

  const spectralLayers = buildSpectralLayers(decompositions)

  const pureFiles = decompositions.filter((d) => d.type === 'pure').length
  const blendFiles = decompositions.filter((d) => d.type === 'blend').length
  const whiteFiles = decompositions.filter((d) => d.type === 'white').length
  const muddyFiles = decompositions.filter((d) => d.type === 'muddy').length
  const avgPurity = Math.round(decompositions.reduce((s, d) => s + d.purity, 0) / decompositions.length)
  const avgBalance = Math.round(decompositions.reduce((s, d) => s + d.balance, 0) / decompositions.length)

  const concernTotals: Record<string, number> = {}
  for (const name of CONCERN_NAMES) {
    concernTotals[name] = decompositions.reduce((s, d) => s + (d.layers[name] ?? 0), 0)
  }

  const dominantConcern = Object.entries(concernTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'
  const rarestConcern = Object.entries(concernTotals).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'none'

  const colorDistribution: Record<string, number> = {}
  for (const [name, total] of Object.entries(concernTotals)) {
    colorDistribution[name] = Math.round(total / files.length)
  }

  const overallPurity = computeOverallPurity(decompositions)
  const spectrumCompleteness = computeSpectrumCompleteness(spectralLayers)

  const stats: SpectrumStats = {
    totalFiles: files.length,
    pureFiles,
    blendFiles,
    whiteFiles,
    muddyFiles,
    avgPurity,
    avgBalance,
    dominantConcern,
    rarestConcern,
    colorDistribution,
    overallPurity,
    spectrumCompleteness,
  }

  const recommendations = generateRecommendations(decompositions, spectralLayers, stats)

  return { decompositions, layers: spectralLayers, profiles, stats, recommendations }
}
