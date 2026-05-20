// ─── Types ─────────────────────────────────────────────────────────────────────

export type ConcernName = 'io' | 'config' | 'error' | 'validation' | 'logic' | 'data' | 'auth' | 'logging' | 'ui' | 'testing'
export type RefractionSeverity = 'clean' | 'minor-mix' | 'moderate-mix' | 'severe-mix'
export type OverallClarity = 'ultraviolet' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'infrared'

export interface SpectralBand {
  concern: ConcernName
  wavelength: number
  intensity: number
  files: string[]
  purity: number
  overlapWith: string[]
  color: string
}

export interface RefractionPoint {
  file: string
  line: number
  concerns: string[]
  severity: RefractionSeverity
  description: string
  suggestion: string
}

export interface SpectralFile {
  file: string
  spectrum: SpectralBand[]
  dominantConcern: string
  secondaryConcerns: string[]
  separationScore: number
  refractionErrors: number
  isMonochromatic: boolean
  isPolychromatic: boolean
  spectralPurity: number
}

export interface PrismaticStats {
  totalBands: number
  totalRefractionPoints: number
  cleanPoints: number
  minorMixPoints: number
  moderateMixPoints: number
  severeMixPoints: number
  monochromaticFiles: number
  polychromaticFiles: number
  avgSeparationScore: number
  avgSpectralPurity: number
  dominantConcern: string
  mostMixedFile: string
  purestFile: string
  concernOverlap: number
  separationIndex: number
  spectrumCompleteness: number
  overallClarity: OverallClarity
}

export interface PrismaticResult {
  bands: SpectralBand[]
  files: SpectralFile[]
  refractionPoints: RefractionPoint[]
  stats: PrismaticStats
  recommendations: string[]
}

export interface PrismaticOptions {
  verbose?: boolean
  format?: string
  output?: string
  ignore?: string[]
  ext?: string
}

// ─── Concern Configuration ─────────────────────────────────────────────────────

const CONCERN_CONFIG: Record<ConcernName, { wavelength: number; color: string; keywords: RegExp[] }> = {
  io: {
    wavelength: 380,
    color: 'violet',
    keywords: [/\bfs\b/, /\breadFile\b/, /\bwriteFile\b/, /\bfetch\b/, /\bhttp\b/, /\brequest\b/, /\bstream\b/, /\bopen\b/, /\bclose\b/, /\bpath\b/, /\bBuffer\b/],
  },
  config: {
    wavelength: 420,
    color: 'indigo',
    keywords: [/\bprocess\.env\b/, /\bconfig\b/, /\bsettings\b/, /\boptions\b/, /\bgetEnv\b/, /\benv\b/, /\bENV\b/],
  },
  error: {
    wavelength: 460,
    color: 'blue',
    keywords: [/\btry\b/, /\bcatch\b/, /\bthrow\b/, /\bError\b/, /\bfinally\b/, /\berr\b/, /\berror\b/, /\breject\b/],
  },
  validation: {
    wavelength: 500,
    color: 'cyan',
    keywords: [/\bvalidate\b/, /\bassert\b/, /\bcheck\b/, /\bguard\b/, /\bisValid\b/, /\btype\s+guard\b/, /\btypeof\b/, /\binstanceof\b/],
  },
  logic: {
    wavelength: 540,
    color: 'green',
    keywords: [/\bcompute\b/, /\bcalculate\b/, /\bprocess\b/, /\bsort\b/, /\bfilter\b/, /\btransform\b/, /\bparse\b/, /\bevaluate\b/, /\balgorithm\b/],
  },
  data: {
    wavelength: 580,
    color: 'yellow',
    keywords: [/\binterface\b/, /\btype\b/, /\bclass\b/, /\benum\b/, /\bmodel\b/, /\bschema\b/, /\bserialize\b/, /\bJSON\b/, /\bparse\b/],
  },
  auth: {
    wavelength: 620,
    color: 'orange',
    keywords: [/\bauth\b/, /\blogin\b/, /\btoken\b/, /\bpermission\b/, /\brole\b/, /\bauthenticate\b/, /\bauthorize\b/, /\bsession\b/],
  },
  logging: {
    wavelength: 660,
    color: 'red-orange',
    keywords: [/\bconsole\.log\b/, /\bconsole\.error\b/, /\bconsole\.warn\b/, /\blogger\b/, /\blog\b/, /\bdebug\b/, /\btrace\b/],
  },
  ui: {
    wavelength: 700,
    color: 'red',
    keywords: [/\bchalk\b/, /\bformat\b/, /\bprint\b/, /\brender\b/, /\bdisplay\b/, /\btable\b/, /\bora\b/, /\bspinner\b/],
  },
  testing: {
    wavelength: 740,
    color: 'deep-red',
    keywords: [/\bdescribe\b/, /\bit\b/, /\btest\b/, /\bexpect\b/, /\bmock\b/, /\bstub\b/, /\bspy\b/, /\bbeforeEach\b/, /\bafterEach\b/],
  },
}

const RELATED_CONCERNS: Record<string, string[]> = {
  io: ['config', 'error'],
  config: ['io', 'validation'],
  error: ['io', 'logic', 'validation'],
  validation: ['logic', 'error'],
  logic: ['data', 'validation'],
  data: ['logic', 'validation'],
  auth: ['error', 'validation'],
  logging: [],
  ui: ['data', 'format'],
  testing: [],
}

// ─── Concern Detection ─────────────────────────────────────────────────────────

/**
 * Detect concerns present in content.
 *
 * @example
 * detectConcerns('fs.readFile("x")', 'io.ts') // => ['io']
 */
export function detectConcerns(content: string, _filePath: string): ConcernName[] {
  const found: ConcernName[] = []

  for (const [concern, config] of Object.entries(CONCERN_CONFIG)) {
    const hasConcern = config.keywords.some(kw => kw.test(content))
    if (hasConcern) {
      found.push(concern as ConcernName)
    }
  }

  return found
}

/**
 * Assign wavelength to a concern.
 *
 * @example
 * assignWavelength('io') // => 380
 */
export function assignWavelength(concern: ConcernName): number {
  return CONCERN_CONFIG[concern]?.wavelength ?? 550
}

/**
 * Get color name for concern.
 *
 * @example
 * getConcernColor('io') // => 'violet'
 */
export function getConcernColor(concern: ConcernName): string {
  return CONCERN_CONFIG[concern]?.color ?? 'unknown'
}

/**
 * Compute intensity of a concern in content.
 *
 * @example
 * computeIntensity('fs.readFile("x")', 'io') // => 80
 */
export function computeIntensity(content: string, concern: ConcernName): number {
  const config = CONCERN_CONFIG[concern]
  if (!config) return 0

  let matches = 0
  for (const kw of config.keywords) {
    const m = content.match(new RegExp(kw.source, kw.flags))
    if (m) matches++
  }

  return Math.min(100, matches * 20)
}

// ─── Spectral Purity ───────────────────────────────────────────────────────────

/**
 * Compute spectral purity from concerns list.
 *
 * @example
 * computeSpectralPurity(['io']) // => 100
 */
export function computeSpectralPurity(concerns: ConcernName[]): number {
  if (concerns.length <= 1) return 100
  if (concerns.length === 0) return 100

  let penalty = 0
  for (let i = 0; i < concerns.length; i++) {
    for (let j = i + 1; j < concerns.length; j++) {
      const related = RELATED_CONCERNS[concerns[i]] ?? []
      if (related.includes(concerns[j])) {
        penalty += 5
      } else {
        penalty += 15
      }
    }
  }

  return Math.max(0, 100 - penalty)
}

// ─── Refraction Points ─────────────────────────────────────────────────────────

/**
 * Find refraction points where concerns mix.
 *
 * @example
 * findRefractionPoints(code, 'file.ts', ['io', 'ui']) // => [RefractionPoint]
 */
export function findRefractionPoints(content: string, filePath: string, concerns: ConcernName[]): RefractionPoint[] {
  if (concerns.length <= 1) return []

  const points: RefractionPoint[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineConcerns: ConcernName[] = []

    for (const concern of concerns) {
      const config = CONCERN_CONFIG[concern]
      if (config.keywords.some(kw => kw.test(line))) {
        lineConcerns.push(concern)
      }
    }

    if (lineConcerns.length >= 2) {
      const severity = classifyRefractionSeverity(lineConcerns)
      points.push({
        file: filePath,
        line: i + 1,
        concerns: lineConcerns,
        severity,
        description: `Mix of ${lineConcerns.join(' + ')} on line ${i + 1}`,
        suggestion: `Separate ${lineConcerns[0]} from ${lineConcerns.slice(1).join(', ')}`,
      })
    }
  }

  return points
}

/**
 * Classify refraction severity.
 *
 * @example
 * classifyRefractionSeverity(['io', 'ui']) // => 'severe-mix'
 */
export function classifyRefractionSeverity(concerns: string[]): RefractionSeverity {
  if (concerns.length <= 1) return 'clean'

  const related = RELATED_CONCERNS[concerns[0]] ?? []
  const allRelated = concerns.slice(1).every(c => related.includes(c))

  if (concerns.length >= 4) return 'severe-mix'
  if (concerns.length >= 3) return 'moderate-mix'
  if (allRelated) return 'minor-mix'
  if (concerns.length === 2) return 'moderate-mix'
  return 'minor-mix'
}

// ─── Separation Score ──────────────────────────────────────────────────────────

/**
 * Compute separation score for a file.
 *
 * @example
 * computeSeparationScore(['io', 'config'], content) // => 90
 */
export function computeSeparationScore(concerns: ConcernName[], _content: string): number {
  if (concerns.length <= 1) return 100

  const purity = computeSpectralPurity(concerns)
  const concernPenalty = (concerns.length - 1) * 5

  return Math.max(0, Math.min(100, purity - concernPenalty + 10))
}

// ─── Concern Overlap ───────────────────────────────────────────────────────────

/**
 * Compute concern overlap 0-100.
 *
 * @example
 * computeConcernOverlap(bands) // => 30
 */
export function computeConcernOverlap(bands: SpectralBand[]): number {
  if (bands.length <= 1) return 0

  let totalOverlap = 0
  let comparisons = 0

  for (const band of bands) {
    totalOverlap += band.overlapWith.length
    comparisons++
  }

  return comparisons > 0
    ? Math.min(100, Math.round((totalOverlap / (comparisons * (bands.length - 1))) * 100))
    : 0
}

// ─── Separation Index ──────────────────────────────────────────────────────────

/**
 * Compute overall separation index 0-100.
 *
 * @example
 * computeSeparationIndex(files) // => 75
 */
export function computeSeparationIndex(files: SpectralFile[]): number {
  if (files.length === 0) return 100

  const avgScore = files.reduce((s, f) => s + f.separationScore, 0) / files.length
  const monoRatio = files.filter(f => f.isMonochromatic).length / files.length

  return Math.round(avgScore * 0.6 + monoRatio * 100 * 0.4)
}

// ─── Spectrum Completeness ─────────────────────────────────────────────────────

/**
 * Compute spectrum completeness 0-100.
 *
 * @example
 * computeSpectrumCompleteness(bands) // => 60
 */
export function computeSpectrumCompleteness(bands: SpectralBand[]): number {
  const expectedConcerns: ConcernName[] = ['io', 'config', 'error', 'validation', 'logic', 'data', 'logging']
  const foundConcerns = new Set(bands.map(b => b.concern))
  const covered = expectedConcerns.filter(c => foundConcerns.has(c)).length

  return Math.round((covered / expectedConcerns.length) * 100)
}

// ─── Overall Clarity ───────────────────────────────────────────────────────────

/**
 * Classify overall clarity.
 *
 * @example
 * classifyOverallClarity(90, 85) // => 'ultraviolet'
 */
export function classifyOverallClarity(separationIndex: number, purity: number): OverallClarity {
  const composite = (separationIndex + purity) / 2

  if (composite >= 90) return 'ultraviolet'
  if (composite >= 78) return 'blue'
  if (composite >= 65) return 'green'
  if (composite >= 50) return 'yellow'
  if (composite >= 35) return 'orange'
  if (composite >= 20) return 'red'
  return 'infrared'
}

// ─── Build Spectral File ───────────────────────────────────────────────────────

/**
 * Build spectral file analysis.
 *
 * @example
 * buildSpectralFile('a.ts', content) // => SpectralFile
 */
export function buildSpectralFile(filePath: string, content: string): SpectralFile {
  const concerns = detectConcerns(content, filePath)
  const refractionPoints = findRefractionPoints(content, filePath, concerns)
  const separationScore = computeSeparationScore(concerns, content)
  const spectralPurity = computeSpectralPurity(concerns)

  const spectrum: SpectralBand[] = concerns.map(concern => ({
    concern,
    wavelength: assignWavelength(concern),
    intensity: computeIntensity(content, concern),
    files: [filePath],
    purity: concerns.length <= 1 ? 100 : spectralPurity,
    overlapWith: concerns.filter(c => c !== concern),
    color: getConcernColor(concern),
  }))

  const dominantConcern = concerns.length > 0
    ? concerns.reduce((a, b) => computeIntensity(content, a) >= computeIntensity(content, b) ? a : b)
    : 'logic'
  const secondaryConcerns = concerns.filter(c => c !== dominantConcern)

  return {
    file: filePath,
    spectrum,
    dominantConcern,
    secondaryConcerns,
    separationScore,
    refractionErrors: refractionPoints.filter(r => r.severity === 'moderate-mix' || r.severity === 'severe-mix').length,
    isMonochromatic: concerns.length <= 1,
    isPolychromatic: concerns.length > 1,
    spectralPurity,
  }
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate prismatic recommendations.
 *
 * @example
 * generateRecommendations(bands, files, points, stats) // => ['Separate...']
 */
export function generateRecommendations(
  bands: SpectralBand[],
  files: SpectralFile[],
  refractionPoints: RefractionPoint[],
  stats: PrismaticStats,
): string[] {
  const recs: string[] = []

  const severePoints = refractionPoints.filter(p => p.severity === 'severe-mix')
  if (severePoints.length > 0) {
    recs.push(`Extract separate modules for ${severePoints.length} severe concern mix${severePoints.length > 1 ? 'es' : ''}`)
  }

  const lowSep = files.filter(f => f.separationScore < 50)
  if (lowSep.length > 0) {
    recs.push(`Refactor ${lowSep.length} file${lowSep.length > 1 ? 's' : ''} for better single-responsibility adherence`)
  }

  const highOverlap = bands.filter(b => b.overlapWith.length >= 3)
  if (highOverlap.length > 0) {
    recs.push(`Establish clearer boundaries for ${highOverlap.length} overlapping concern${highOverlap.length > 1 ? 's' : ''}`)
  }

  if (stats.spectrumCompleteness < 50) {
    recs.push('Add missing concerns: consider adding validation, error handling, or logging layers')
  }

  const mixedFiles = files.filter(f => f.refractionErrors > 2)
  if (mixedFiles.length > 0) {
    recs.push(`Reduce concern mixing in ${mixedFiles.length} file${mixedFiles.length > 1 ? 's' : ''} with high refraction errors`)
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete prismatic result.
 *
 * @example
 * buildPrismaticResult(['a.ts'], ['code'], {}) // => PrismaticResult
 */
export function buildPrismaticResult(files: string[], contents: string[], options: PrismaticOptions): PrismaticResult {
  const spectralFiles: SpectralFile[] = []
  const allRefractionPoints: RefractionPoint[] = []
  const concernFileMap = new Map<ConcernName, string[]>()

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const sf = buildSpectralFile(files[i], content)
    spectralFiles.push(sf)

    const concerns = detectConcerns(content, files[i])
    for (const concern of concerns) {
      const existing = concernFileMap.get(concern) ?? []
      existing.push(files[i])
      concernFileMap.set(concern, existing)
    }

    const points = findRefractionPoints(content, files[i], concerns)
    allRefractionPoints.push(...points)
  }

  const bands: SpectralBand[] = []
  for (const [concern, fList] of concernFileMap) {
    const allConcerns = spectralFiles
      .filter(sf => sf.spectrum.some(s => s.concern === concern))
      .flatMap(sf => sf.spectrum.map(s => s.concern))
    const uniqueConcerns = [...new Set(allConcerns)]

    bands.push({
      concern,
      wavelength: assignWavelength(concern),
      intensity: Math.min(100, fList.length * 20),
      files: fList,
      purity: uniqueConcerns.length <= 1 ? 100 : computeSpectralPurity(uniqueConcerns),
      overlapWith: uniqueConcerns.filter(c => c !== concern),
      color: getConcernColor(concern),
    })
  }

  const totalRefractionPoints = allRefractionPoints.length
  const cleanPoints = allRefractionPoints.filter(p => p.severity === 'clean').length
  const minorMixPoints = allRefractionPoints.filter(p => p.severity === 'minor-mix').length
  const moderateMixPoints = allRefractionPoints.filter(p => p.severity === 'moderate-mix').length
  const severeMixPoints = allRefractionPoints.filter(p => p.severity === 'severe-mix').length

  const monochromaticFiles = spectralFiles.filter(f => f.isMonochromatic).length
  const polychromaticFiles = spectralFiles.filter(f => f.isPolychromatic).length

  const avgSeparationScore = spectralFiles.length > 0
    ? Math.round(spectralFiles.reduce((s, f) => s + f.separationScore, 0) / spectralFiles.length) : 100
  const avgSpectralPurity = spectralFiles.length > 0
    ? Math.round(spectralFiles.reduce((s, f) => s + f.spectralPurity, 0) / spectralFiles.length) : 100

  const dominantConcern = bands.length > 0
    ? bands.reduce((a, b) => a.files.length >= b.files.length ? a : b).concern : 'logic'
  const mostMixedFile = spectralFiles.length > 0
    ? spectralFiles.reduce((a, b) => a.refractionErrors >= b.refractionErrors ? a : b).file : ''
  const purestFile = spectralFiles.length > 0
    ? spectralFiles.reduce((a, b) => a.spectralPurity >= b.spectralPurity ? a : b).file : ''

  const concernOverlap = computeConcernOverlap(bands)
  const separationIndex = computeSeparationIndex(spectralFiles)
  const spectrumCompleteness = computeSpectrumCompleteness(bands)
  const overallClarity = classifyOverallClarity(separationIndex, avgSpectralPurity)

  const stats: PrismaticStats = {
    totalBands: bands.length,
    totalRefractionPoints,
    cleanPoints,
    minorMixPoints,
    moderateMixPoints,
    severeMixPoints,
    monochromaticFiles,
    polychromaticFiles,
    avgSeparationScore,
    avgSpectralPurity,
    dominantConcern,
    mostMixedFile,
    purestFile,
    concernOverlap,
    separationIndex,
    spectrumCompleteness,
    overallClarity,
  }

  const recommendations = generateRecommendations(bands, spectralFiles, allRefractionPoints, stats)

  if (options.verbose) {
    // Verbose includes additional detail
  }

  return {
    bands,
    files: spectralFiles,
    refractionPoints: allRefractionPoints,
    stats,
    recommendations,
  }
}
