// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface SpectrumMeasure {
  business: number
  dataAccess: number
  presentation: number
  validation: number
  errorHandling: number
  logging: number
  configuration: number
  infrastructure: number
  testing: number
  documentation: number
}

export interface CrossContamination {
  businessInData: number
  dataInPresentation: number
  presentationInBusiness: number
  infrastructureInBusiness: number
  totalCrossContamination: number
}

export interface SpectralBand {
  file: string
  spectralPurity: number
  dominantWavelength: string
  bandwidth: number
  spectrum: SpectrumMeasure
  overlap: number
  dispersion: number
  isMonochromatic: boolean
  isPolychromatic: boolean
  isWhiteLight: boolean
  peakIntensity: number
  concernCount: number
  dominantConcerns: string[]
  crossContamination: CrossContamination
  spectralClass: 'ultraviolet' | 'violet' | 'blue' | 'cyan' | 'green' | 'yellow' | 'orange' | 'red' | 'infrared' | 'white-light'
  purityGrade: 'monochromatic' | 'narrow-band' | 'broad-band' | 'wide-band' | 'full-spectrum' | 'white-noise'
  qualityScore: number
}

export interface SpectrumReading {
  directory: string
  bands: SpectralBand[]
  avgPurity: number
  avgOverlap: number
  avgDispersion: number
  monochromaticCount: number
  whiteLightCount: number
  dominantConcern: string
  concernDistribution: Record<string, number>
  separationQuality: number
  hasClearSeparation: boolean
  totalCrossContamination: number
  spectrumHealth: 'clean-rainbow' | 'clear' | 'hazy' | 'muddy' | 'chaotic' | 'white-noise'
  reading: string
}

export interface FullSpectrum {
  totalConcerns: number
  avgPurity: number
  avgOverlap: number
  avgDispersion: number
  monochromaticFiles: number
  whiteLightFiles: number
  concernDistribution: Record<string, number>
  totalCrossContamination: number
  overallSeparation: number
  isWellSeparated: boolean
}

export interface PrismSpectrumStats {
  totalFiles: number
  totalReadings: number
  avgSpectralPurity: number
  avgBandwidth: number
  avgOverlap: number
  avgDispersion: number
  monochromaticFiles: number
  narrowBandFiles: number
  broadBandFiles: number
  whiteLightFiles: number
  whiteNoiseFiles: number
  businessFiles: number
  dataAccessFiles: number
  presentationFiles: number
  validationFiles: number
  errorHandlingFiles: number
  totalCrossContamination: number
  overallSeparation: number
  dominantConcern: string
  spectroscopistGrade: 'master-optician' | 'optician' | 'physicist' | 'student' | 'colorblind' | 'blind'
  purestFile: string
  mostContaminated: string
  mostMonochromatic: string
  mostWhiteLight: string
  cleanestReading: string
  dirtiestReading: string
}

export interface PrismSpectrumResult {
  bands: SpectralBand[]
  readings: SpectrumReading[]
  fullSpectrum: FullSpectrum
  stats: PrismSpectrumStats
  recommendations: string[]
}

// ─── Concern Measurement ─────────────────────────────────────────────────────

const CONCERN_KEYS: (keyof SpectrumMeasure)[] = [
  'business', 'dataAccess', 'presentation', 'validation',
  'errorHandling', 'logging', 'configuration', 'infrastructure',
  'testing', 'documentation',
]

/**
 * Measure a specific concern intensity in content
 * @example
 * measureConcern('if (user.age < 18) throw new Error()', 'validation') // number
 */
export function measureConcern(content: string, concern: keyof SpectrumMeasure): number {
  let score = 0
  const lines = content.split('\n')

  switch (concern) {
    case 'business': {
      const patterns = [/\.map\s*\(|\.reduce\s*\(|\.filter\s*\(/g, /\bcalculate\b|\bcompute\b|\bprocess\b|\btransform\b/gi, /\bprice\b|\btotal\b|\bdiscount\b|\btax\b|\bamount\b/gi]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'dataAccess': {
      const patterns = [/fetch\s*\(|\.query\s*\(|\.find\s*\(|\.save\s*\(/g, /database|mongodb|postgres|mysql|redis|sqlite/gi, /\.create\s*\(|\.update\s*\(|\.delete\s*\(/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'presentation': {
      const patterns = [/console\.\w+\s*\(/g, /innerHTML|textContent|className|style\s*=/gi, /render|display|show|hide|visible/gi, /format|template|html|css/gi]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 8 }
      break
    }
    case 'validation': {
      const patterns = [/\bif\s*\([^)]*(?:===|!==|>|<|>=|<=)/g, /\.test\s*\(|\.match\s*\(/g, /\bvalidate\b|\bcheck\b|\bverify\b|\bguard\b|\bassert\b/gi, /typeof\s+\w+\s*(?:===|!==)/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 8 }
      break
    }
    case 'errorHandling': {
      const patterns = [/try\s*\{/g, /catch\s*\(/g, /throw\s+new\s+/g, /finally\s*\{/g, /Error\s*\(/g, /\.catch\s*\(/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'logging': {
      const patterns = [/console\.(log|debug|info|warn|error)\s*\(/g, /logger\.\w+\s*\(/g, /winston|pino|bunyan/gi]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'configuration': {
      const patterns = [/process\.env\./g, /const\s+\w+\s*=\s*process\.env/g, /config\s*[=:]/gi, /\.env|ENV_/gi, /import\.meta\.env/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'infrastructure': {
      const patterns = [/import\s+.*from\s+['"](?:http|https|fs|path|os|net|crypto)/g, /\bsetTimeout\b|\bsetInterval\b|\bBuffer\b/g, /\.pipe\s*\(|\.on\s*\(['"](?:data|error|close)/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 8 }
      break
    }
    case 'testing': {
      const patterns = [/describe\s*\(|it\s*\(|test\s*\(/g, /expect\s*\(/g, /beforeEach\s*\(|afterEach\s*\(/g, /\.toBe\b|\.toEqual\b|\.toThrow/g]
      for (const p of patterns) { score += (content.match(p) ?? []).length * 10 }
      break
    }
    case 'documentation': {
      const jsdocCount = (content.match(/\/\*\*[\s\S]*?\*\//g) ?? []).length
      const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('*')).length
      score = Math.min(100, jsdocCount * 15 + commentLines * 3)
      break
    }
  }

  return Math.min(100, score)
}

/**
 * Measure all concerns in content
 * @example
 * measureAllConcerns('fetch(url).then(r => r.json())') // SpectrumMeasure
 */
export function measureAllConcerns(content: string): SpectrumMeasure {
  return {
    business: measureConcern(content, 'business'),
    dataAccess: measureConcern(content, 'dataAccess'),
    presentation: measureConcern(content, 'presentation'),
    validation: measureConcern(content, 'validation'),
    errorHandling: measureConcern(content, 'errorHandling'),
    logging: measureConcern(content, 'logging'),
    configuration: measureConcern(content, 'configuration'),
    infrastructure: measureConcern(content, 'infrastructure'),
    testing: measureConcern(content, 'testing'),
    documentation: measureConcern(content, 'documentation'),
  }
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify spectral class from dominant concern score
 * @example
 * classifySpectralClass(90) // 'ultraviolet'
 */
export function classifySpectralClass(peakIntensity: number): SpectralBand['spectralClass'] {
  if (peakIntensity >= 90) return 'ultraviolet'
  if (peakIntensity >= 80) return 'violet'
  if (peakIntensity >= 70) return 'blue'
  if (peakIntensity >= 60) return 'cyan'
  if (peakIntensity >= 50) return 'green'
  if (peakIntensity >= 40) return 'yellow'
  if (peakIntensity >= 30) return 'orange'
  if (peakIntensity >= 20) return 'red'
  if (peakIntensity >= 10) return 'infrared'
  return 'white-light'
}

/**
 * Classify purity grade from purity and concern count
 * @example
 * classifyPurityGrade(90, 1) // 'monochromatic'
 */
export function classifyPurityGrade(purity: number, concernCount: number): SpectralBand['purityGrade'] {
  if (concernCount <= 1) return 'monochromatic'
  if (purity >= 80 && concernCount <= 2) return 'narrow-band'
  if (purity >= 60 && concernCount <= 3) return 'broad-band'
  if (purity >= 30 && concernCount <= 5) return 'wide-band'
  if (concernCount >= 7) return 'white-noise'
  return 'full-spectrum'
}

/**
 * Classify spectroscopist grade from avg purity
 * @example
 * classifySpectroscopistGrade(85) // 'master-optician'
 */
export function classifySpectroscopistGrade(avgPurity: number): PrismSpectrumStats['spectroscopistGrade'] {
  if (avgPurity >= 80) return 'master-optician'
  if (avgPurity >= 65) return 'optician'
  if (avgPurity >= 45) return 'physicist'
  if (avgPurity >= 25) return 'student'
  if (avgPurity >= 10) return 'colorblind'
  return 'blind'
}

// ─── Cross-Contamination Detection ───────────────────────────────────────────

/**
 * Detect cross-contamination between concerns
 * @example
 * detectCrossContamination({ business: 50, dataAccess: 60, ... }) // CrossContamination
 */
export function detectCrossContamination(spectrum: SpectrumMeasure): CrossContamination {
  const businessInData = spectrum.business > 20 && spectrum.dataAccess > 20
    ? Math.min(100, Math.round((spectrum.business + spectrum.dataAccess) / 3))
    : 0
  const dataInPresentation = spectrum.dataAccess > 20 && spectrum.presentation > 20
    ? Math.min(100, Math.round((spectrum.dataAccess + spectrum.presentation) / 3))
    : 0
  const presentationInBusiness = spectrum.presentation > 20 && spectrum.business > 20
    ? Math.min(100, Math.round((spectrum.presentation + spectrum.business) / 3))
    : 0
  const infrastructureInBusiness = spectrum.infrastructure > 20 && spectrum.business > 20
    ? Math.min(100, Math.round((spectrum.infrastructure + spectrum.business) / 3))
    : 0

  return {
    businessInData,
    dataInPresentation,
    presentationInBusiness,
    infrastructureInBusiness,
    totalCrossContamination: businessInData + dataInPresentation + presentationInBusiness + infrastructureInBusiness,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a spectral band
 * @example
 * analyzeSpectralBand('export function calc() { return 1 + 2 }', 'calc.ts') // SpectralBand
 */
export function analyzeSpectralBand(content: string, filePath: string): SpectralBand {
  const spectrum = measureAllConcerns(content)

  const entries = CONCERN_KEYS.map(k => [k, spectrum[k]] as [string, number])
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  const dominantWavelength = sorted[0]?.[0] ?? 'infrastructure'
  const peakIntensity = sorted[0]?.[1] ?? 0

  const significantConcerns = entries.filter(([, v]) => v > 10)
  const concernCount = significantConcerns.length
  const dominantConcerns = sorted.slice(0, 3).map(([k]) => k)

  const totalIntensity = entries.reduce((s, [, v]) => s + v, 0)
  const bandwidth = Math.min(100, totalIntensity > 0
    ? Math.round((concernCount / CONCERN_KEYS.length) * 100)
    : 0,
  )

  const maxConcern = peakIntensity
  const overlap = concernCount > 1
    ? Math.min(100, Math.round(
        entries.reduce((s, [, v]) => s + (v > 10 ? Math.abs(v - maxConcern) : 0), 0) /
        Math.max(1, (concernCount - 1) * maxConcern) * 100,
      ))
    : 0

  const dispersion = totalIntensity > 0
    ? Math.min(100, Math.round(
        entries.reduce((s, [, v]) => s + (v > 0 ? 1 : 0), 0) / CONCERN_KEYS.length * 100,
      ))
    : 0

  const spectralPurity = concernCount > 0
    ? Math.min(100, Math.round(maxConcern / Math.max(1, totalIntensity / concernCount) * (concernCount <= 2 ? 1 : 0.7)))
    : 0

  const isMonochromatic = concernCount <= 1
  const isPolychromatic = concernCount >= 2 && concernCount <= 5
  const isWhiteLight = concernCount >= 7

  const crossContamination = detectCrossContamination(spectrum)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    spectralPurity * 0.3 +
    (100 - overlap) * 0.2 +
    (100 - crossContamination.totalCrossContamination / 4) * 0.2 +
    (isMonochromatic ? 20 : isPolychromatic ? 10 : 0) +
    peakIntensity * 0.1,
  )))

  const spectralClass = isWhiteLight ? 'white-light' : classifySpectralClass(peakIntensity)
  const purityGrade = classifyPurityGrade(spectralPurity, concernCount)

  return {
    file: filePath,
    spectralPurity,
    dominantWavelength,
    bandwidth,
    spectrum,
    overlap,
    dispersion,
    isMonochromatic,
    isPolychromatic,
    isWhiteLight,
    peakIntensity,
    concernCount,
    dominantConcerns,
    crossContamination,
    spectralClass,
    purityGrade,
    qualityScore,
  }
}

// ─── Reading Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a directory as a spectrum reading
 * @example
 * analyzeSpectrumReading(bands, 'src') // SpectrumReading
 */
export function analyzeSpectrumReading(bands: SpectralBand[], dirPath: string): SpectrumReading {
  if (bands.length === 0) {
    return {
      directory: dirPath,
      bands: [],
      avgPurity: 0,
      avgOverlap: 0,
      avgDispersion: 0,
      monochromaticCount: 0,
      whiteLightCount: 0,
      dominantConcern: 'none',
      concernDistribution: {},
      separationQuality: 0,
      hasClearSeparation: false,
      totalCrossContamination: 0,
      spectrumHealth: 'white-noise',
      reading: 'Empty spectrum',
    }
  }

  const n = bands.length
  const avgPurity = Math.round(bands.reduce((s, b) => s + b.spectralPurity, 0) / n)
  const avgOverlap = Math.round(bands.reduce((s, b) => s + b.overlap, 0) / n)
  const avgDispersion = Math.round(bands.reduce((s, b) => s + b.dispersion, 0) / n)
  const monochromaticCount = bands.filter(b => b.isMonochromatic).length
  const whiteLightCount = bands.filter(b => b.isWhiteLight).length
  const totalCrossContamination = bands.reduce((s, b) => s + b.crossContamination.totalCrossContamination, 0)

  const concernCounts: Record<string, number> = {}
  for (const band of bands) {
    concernCounts[band.dominantWavelength] = (concernCounts[band.dominantWavelength] ?? 0) + 1
  }
  const dominantConcern = Array.from(Object.entries(concernCounts))
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'

  const separationQuality = Math.min(100, Math.max(0,
    avgPurity * 0.4 + (100 - avgOverlap) * 0.3 + (100 - Math.min(100, totalCrossContamination / n)) * 0.3,
  ))

  const hasClearSeparation = separationQuality >= 60 && avgPurity >= 50

  let spectrumHealth: SpectrumReading['spectrumHealth']
  if (separationQuality >= 80 && avgPurity >= 70) spectrumHealth = 'clean-rainbow'
  else if (separationQuality >= 60) spectrumHealth = 'clear'
  else if (separationQuality >= 40) spectrumHealth = 'hazy'
  else if (separationQuality >= 25) spectrumHealth = 'muddy'
  else if (separationQuality >= 10) spectrumHealth = 'chaotic'
  else spectrumHealth = 'white-noise'

  const concernDistribution: Record<string, number> = {}
  for (const band of bands) {
    for (const c of band.dominantConcerns) {
      concernDistribution[c] = (concernDistribution[c] ?? 0) + 1
    }
  }

  const reading = `Spectrum: ${spectrumHealth}, purity: ${avgPurity}, separation: ${separationQuality}`

  return {
    directory: dirPath,
    bands,
    avgPurity,
    avgOverlap,
    avgDispersion,
    monochromaticCount,
    whiteLightCount,
    dominantConcern,
    concernDistribution,
    separationQuality,
    hasClearSeparation,
    totalCrossContamination,
    spectrumHealth,
    reading,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate prism spectrum recommendations
 * @example
 * generateRecommendations(bands, readings, stats) // string[]
 */
export function generateRecommendations(
  _bands: SpectralBand[],
  readings: SpectrumReading[],
  stats: PrismSpectrumStats,
): string[] {
  const recs: string[] = []

  if (stats.whiteLightFiles > 0) {
    recs.push(`White-light files: ${stats.whiteLightFiles} files doing everything — separate concerns`)
  }

  if (stats.totalCrossContamination > 30) {
    recs.push(`High cross-contamination: ${stats.totalCrossContamination} — refactor layer boundaries`)
  }

  if (stats.avgOverlap > 50) {
    recs.push('High concern overlap: files mix multiple responsibilities — clarify roles')
  }

  if (stats.errorHandlingFiles === 0 && stats.totalFiles > 3) {
    recs.push('No error handling detected: add try/catch and error management')
  }

  if (stats.validationFiles === 0 && stats.totalFiles > 3) {
    recs.push('No validation detected: add input checking and guards')
  }

  if (stats.presentationFiles > stats.businessFiles && stats.totalFiles > 5) {
    recs.push('Presentation-heavy: more UI code than business logic — consider restructuring')
  }

  if (stats.overallSeparation < 30) {
    recs.push('Poor separation: codebase lacks architectural concern boundaries')
  }

  if (stats.mostContaminated !== 'none') {
    recs.push(`Most contaminated: ${stats.mostContaminated} — primary refactoring target`)
  }

  if (stats.overallSeparation >= 70) {
    recs.push('Good separation: concerns are well-delineated across the codebase')
  }

  const muddyReadings = readings.filter(r => r.spectrumHealth === 'muddy' || r.spectrumHealth === 'chaotic')
  if (muddyReadings.length > 0) {
    recs.push(`Muddy spectrums: ${muddyReadings.length} directories need concern clarification`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete prism spectrum result from files and contents
 * @example
 * buildPrismSpectrumResult(['a.ts'], ['export function a() {}'], {}) // PrismSpectrumResult
 */
export function buildPrismSpectrumResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): PrismSpectrumResult {
  void options

  const bands: SpectralBand[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeSpectralBand(content, file)
    } catch {
      return analyzeSpectralBand('', file)
    }
  })

  const dirMap = new Map<string, SpectralBand[]>()
  for (const band of bands) {
    const dir = band.file.includes('/') ? band.file.slice(0, band.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(band)
    } else {
      dirMap.set(dir, [band])
    }
  }

  const readings: SpectrumReading[] = Array.from(dirMap.entries()).map(([dir, bs]) =>
    analyzeSpectrumReading(bs, dir),
  )

  const n = bands.length || 1
  const totalConcerns = bands.reduce((s, b) => s + b.concernCount, 0)
  const avgPurity = Math.round(bands.reduce((s, b) => s + b.spectralPurity, 0) / n)
  const avgOverlap = Math.round(bands.reduce((s, b) => s + b.overlap, 0) / n)
  const avgDispersion = Math.round(bands.reduce((s, b) => s + b.dispersion, 0) / n)
  const monochromaticFiles = bands.filter(b => b.isMonochromatic).length
  const whiteLightFiles = bands.filter(b => b.isWhiteLight).length

  const concernDistribution: Record<string, number> = {}
  for (const band of bands) {
    concernDistribution[band.dominantWavelength] = (concernDistribution[band.dominantWavelength] ?? 0) + 1
  }
  const totalCrossContamination = bands.reduce((s, b) => s + b.crossContamination.totalCrossContamination, 0)
  const overallSeparation = Math.min(100, Math.max(0,
    avgPurity * 0.4 + (100 - avgOverlap) * 0.3 + (100 - Math.min(100, totalCrossContamination / n)) * 0.3,
  ))

  const fullSpectrum: FullSpectrum = {
    totalConcerns,
    avgPurity,
    avgOverlap,
    avgDispersion,
    monochromaticFiles,
    whiteLightFiles,
    concernDistribution,
    totalCrossContamination,
    overallSeparation,
    isWellSeparated: overallSeparation >= 60,
  }

  const narrowBandFiles = bands.filter(b => b.purityGrade === 'narrow-band').length
  const broadBandFiles = bands.filter(b => b.purityGrade === 'broad-band').length
  const whiteNoiseFiles = bands.filter(b => b.purityGrade === 'white-noise').length
  const businessFiles = bands.filter(b => b.dominantWavelength === 'business').length
  const dataAccessFiles = bands.filter(b => b.dominantWavelength === 'dataAccess').length
  const presentationFiles = bands.filter(b => b.dominantWavelength === 'presentation').length
  const validationFiles = bands.filter(b => b.dominantWavelength === 'validation').length
  const errorHandlingFiles = bands.filter(b => b.dominantWavelength === 'errorHandling').length

  const dominantConcern = Array.from(Object.entries(concernDistribution))
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none'

  const stats: PrismSpectrumStats = {
    totalFiles: files.length,
    totalReadings: readings.length,
    avgSpectralPurity: avgPurity,
    avgBandwidth: Math.round(bands.reduce((s, b) => s + b.bandwidth, 0) / n),
    avgOverlap,
    avgDispersion,
    monochromaticFiles,
    narrowBandFiles,
    broadBandFiles,
    whiteLightFiles,
    whiteNoiseFiles,
    businessFiles,
    dataAccessFiles,
    presentationFiles,
    validationFiles,
    errorHandlingFiles,
    totalCrossContamination,
    overallSeparation,
    dominantConcern,
    spectroscopistGrade: classifySpectroscopistGrade(avgPurity),
    purestFile: bands.length > 0
      ? bands.reduce((p, b) => b.spectralPurity > p.spectralPurity ? b : p, bands[0] as typeof bands[number]).file : 'none',
    mostContaminated: bands.length > 0
      ? bands.reduce((c, b) => b.crossContamination.totalCrossContamination > c.crossContamination.totalCrossContamination ? b : c, bands[0] as typeof bands[number]).file : 'none',
    mostMonochromatic: bands.length > 0
      ? bands.reduce((m, b) => b.concernCount < m.concernCount ? b : m, bands[0] as typeof bands[number]).file : 'none',
    mostWhiteLight: bands.length > 0
      ? bands.reduce((w, b) => b.concernCount > w.concernCount ? b : w, bands[0] as typeof bands[number]).file : 'none',
    cleanestReading: readings.length > 0
      ? readings.reduce((c, r) => r.separationQuality > c.separationQuality ? r : c, readings[0] as typeof readings[number]).directory : 'none',
    dirtiestReading: readings.length > 0
      ? readings.reduce((d, r) => r.separationQuality < d.separationQuality ? r : d, readings[0] as typeof readings[number]).directory : 'none',
  }

  const recommendations = generateRecommendations(bands, readings, stats)

  return { bands, readings, fullSpectrum, stats, recommendations }
}
