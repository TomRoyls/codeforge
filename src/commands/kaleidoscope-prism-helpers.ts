// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface LightSpectrumData {
  red: number
  orange: number
  yellow: number
  green: number
  blue: number
  indigo: number
  violet: number
}

export interface LightRay {
  file: string
  clarity: number
  luminosity: number
  refractionIndex: number
  dispersion: number
  focalPower: number
  spectrum: LightSpectrumData
  dominantWavelength: string
  bandwidth: number
  isMonochromatic: boolean
  isPolychromatic: boolean
  isUltraviolet: boolean
  isInfrared: boolean
  lightType: 'laser' | 'focused' | 'diffuse' | 'scattered' | 'dim' | 'dark'
  refractions: number
  reflections: string[]
  absorptions: string[]
  emissions: string[]
  classification: 'crystal' | 'glass' | 'prism' | 'lens' | 'mirror' | 'fog' | 'opaque'
}

export interface LightSpectrum {
  directory: string
  rays: LightRay[]
  avgClarity: number
  avgLuminosity: number
  avgRefractionIndex: number
  avgDispersion: number
  avgFocalPower: number
  dominantWavelength: string
  spectralSpread: number
  lightBalance: number
  hasDeadZones: boolean
  deadZoneCount: number
  hasHotSpots: boolean
  hotSpotCount: number
  totalRefractions: number
  totalReflections: number
  totalAbsorptions: number
  totalEmissions: number
  opticalHealth: 'brilliant' | 'clear' | 'hazy' | 'cloudy' | 'foggy' | 'opaque'
}

export interface KaleidoscopePrismStats {
  totalFiles: number
  totalSpectra: number
  avgClarity: number
  avgLuminosity: number
  avgRefractionIndex: number
  avgDispersion: number
  avgFocalPower: number
  crystalFiles: number
  opaqueFiles: number
  laserFiles: number
  darkFiles: number
  monochromaticFiles: number
  polychromaticFiles: number
  ultravioletFiles: number
  infraredFiles: number
  totalRefractions: number
  totalReflections: number
  totalAbsorptions: number
  totalEmissions: number
  dominantWavelength: string
  spectralSpread: number
  lightBalance: number
  deadZones: number
  hotSpots: number
  overallClarity: number
  opticalGrade: 'diamond' | 'crystal' | 'glass' | 'plastic' | 'muddy' | 'opaque'
  brightestFile: string
  darkestFile: string
}

export interface KaleidoscopePrismResult {
  rays: LightRay[]
  spectra: LightSpectrum[]
  stats: KaleidoscopePrismStats
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
const COMMENT_RE = /\/\/.*$/gm
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const DB_RE = /(?:SELECT|INSERT|UPDATE|DELETE|prisma|sequelize|typeorm|mongoose)/i
const DOM_RE = /(?:document\.|createElement|getElementById|querySelector|innerHTML|addEventListener)/
const HTTP_RE = /(?:fetch\(|axios|http\.get|http\.post|req\.|res\.)/
const CONFIG_RE = /(?:config|Config|CONFIG|settings|Settings|env\.)/
const VALIDATE_RE = /(?:validate|schema|parse|check|assert|ensure|verify)/
const UTILITY_RE = /(?:util|helper|common|shared|lib)/i
const NESTED_CALL_RE = /\w+\.\w+\.\w+\(/g
const ARROW_CHAIN_RE = /\.then\(|\.catch\(|\.finally\(/g

// ─── Spectrum Classification ─────────────────────────────────────────────────

/**
 * Classify code concerns into spectrum colors
 * @example
 * classifySpectrum('export class UserService { findUser() {} }') // { red: 0, green: 80, ... }
 */
export function classifySpectrum(content: string): LightSpectrumData {
  return {
    red: scoreConcern(content, [FUNCTION_RE, CLASS_RE, 'export ', 'module']),
    orange: scoreConcern(content, [CONFIG_RE]),
    yellow: scoreConcern(content, [VALIDATE_RE, 'if (', 'switch (', '===', '!==']),
    green: scoreConcern(content, ['service', 'logic', 'business', 'domain', 'process', 'calculate']),
    blue: scoreConcern(content, [DB_RE, 'repository', 'data', 'storage', 'persist']),
    indigo: scoreConcern(content, [DOM_RE, HTTP_RE, 'render', 'component', 'route', 'handler']),
    violet: scoreConcern(content, [UTILITY_RE, 'helper', 'format', 'convert', 'parse']),
  }
}

function scoreConcern(content: string, patterns: (RegExp | string)[]): number {
  let score = 0
  for (const p of patterns) {
    if (typeof p === 'string') {
      if (content.includes(p)) score += 15
    } else {
      const matches = content.match(p)
      if (matches) score += Math.min(30, matches.length * 10)
    }
  }
  return Math.min(100, score)
}

// ─── Light Ray Analysis ──────────────────────────────────────────────────────

/**
 * Evaluate a single file as a light ray
 * @example
 * analyzeLightRay('export function add(a: number, b: number) { return a + b }', 'math.ts') // LightRay
 */
export function analyzeLightRay(content: string, filePath: string): LightRay {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const imports = (content.match(IMPORT_RE) ?? []).length
  const functions = (content.match(FUNCTION_RE) ?? []).length
  const classes = (content.match(CLASS_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const comments = (content.match(COMMENT_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const nestedCalls = (content.match(NESTED_CALL_RE) ?? []).length
  const arrowChains = (content.match(ARROW_CHAIN_RE) ?? []).length

  const clarity = computeClarity(codeLines.length, exports, functions, classes, anys, todos, consoles)
  const luminosity = computeLuminosity(jsdoc, comments, codeLines.length)
  const refractionIndex = computeRefractionIndex(imports, nestedCalls, arrowChains, codeLines.length)
  const dispersion = computeDispersion(content)
  const focalPower = computeFocalPower(exports, functions + classes, codeLines.length)
  const spectrum = classifySpectrum(content)

  const dominantWavelength = findDominantWavelength(spectrum)
  const bandwidth = computeBandwidth(spectrum)
  const isMonochromatic = bandwidth < 25
  const isPolychromatic = bandwidth >= 50
  const isUltraviolet = todos > 0 || anys > 0
  const isInfrared = comments.length === 0 && jsdoc.length === 0 && codeLines.length > 5

  const lightType = classifyLightType(clarity, focalPower, dispersion)
  const refractions = imports + nestedCalls
  const reflections = identifyReflections(content)
  const absorptions = identifyAbsorptions(content, filePath)
  const emissions = identifyEmissions(content)
  const classification = classifyRay(clarity, luminosity, refractionIndex)

  return {
    file: filePath,
    clarity,
    luminosity,
    refractionIndex,
    dispersion,
    focalPower,
    spectrum,
    dominantWavelength,
    bandwidth,
    isMonochromatic,
    isPolychromatic,
    isUltraviolet,
    isInfrared,
    lightType,
    refractions,
    reflections,
    absorptions,
    emissions,
    classification,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeClarity(
  lines: number, exports: number, functions: number, classes: number,
  anys: number, todos: number, consoles: number,
): number {
  if (lines === 0) return 0
  let score = 40
  score += Math.min(15, exports * 2)
  score += Math.min(10, (functions + classes) * 2)
  score -= anys * 8
  score -= todos * 5
  score -= consoles * 3
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeLuminosity(jsdoc: number, comments: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(40, jsdoc * 8)
  score += Math.min(30, Math.round((comments / lines) * 100))
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeRefractionIndex(
  imports: number, nestedCalls: number, arrowChains: number, lines: number,
): number {
  if (lines === 0) return 0
  let score = Math.min(50, imports * 5)
  score += Math.min(30, nestedCalls * 5)
  score += Math.min(20, arrowChains * 8)
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeDispersion(content: string): number {
  const spectrum = classifySpectrum(content)
  const values = Object.values(spectrum) as number[]
  const nonZero = values.filter(v => v > 0)
  return Math.min(100, nonZero.length * 15)
}

function computeFocalPower(exports: number, constructs: number, lines: number): number {
  if (lines === 0) return 0
  if (constructs === 0) return 20
  const exportRatio = exports / constructs
  let score = 40
  if (exportRatio > 0.5) score += 30
  else if (exportRatio > 0.2) score += 15
  if (constructs <= 5) score += 20
  else if (constructs <= 10) score += 10
  else score -= 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function findDominantWavelength(spectrum: LightSpectrumData): string {
  const entries = Object.entries(spectrum) as [string, number][]
  let max = 0
  let dominant = 'green'
  for (const [color, value] of entries) {
    if (value > max) {
      max = value
      dominant = color
    }
  }
  return dominant
}

function computeBandwidth(spectrum: LightSpectrumData): number {
  const values = Object.values(spectrum) as number[]
  const nonZero = values.filter(v => v > 0)
  return nonZero.length > 1 ? Math.min(100, Math.round((nonZero.length / 7) * 100)) : 0
}

function classifyLightType(
  clarity: number, focalPower: number, dispersion: number,
): LightRay['lightType'] {
  if (clarity >= 80 && focalPower >= 70 && dispersion < 30) return 'laser'
  if (clarity >= 60 && focalPower >= 50) return 'focused'
  if (clarity >= 40) return 'diffuse'
  if (dispersion >= 60) return 'scattered'
  if (clarity >= 15) return 'dim'
  return 'dark'
}

function classifyRay(
  clarity: number, luminosity: number, refractionIndex: number,
): LightRay['classification'] {
  if (clarity >= 80 && luminosity >= 60) return 'crystal'
  if (clarity >= 60 && luminosity >= 40) return 'glass'
  if (refractionIndex >= 60) return 'prism'
  if (clarity >= 50) return 'lens'
  if (clarity >= 30) return 'mirror'
  if (clarity >= 15) return 'fog'
  return 'opaque'
}

// ─── Pattern Identification ──────────────────────────────────────────────────

function identifyReflections(content: string): string[] {
  const reflections: string[] = []
  if (content.includes('interface') && content.includes('implements')) reflections.push('interface-implementation')
  if (content.includes('abstract') && content.includes('extends')) reflections.push('inheritance-mirror')
  if (content.match(/export\s+\{.*\}/)) reflections.push('re-export-pattern')
  return reflections
}

function identifyAbsorptions(content: string, filePath: string): string[] {
  const absorptions: string[] = []
  if (content.match(IMPORT_RE)) absorptions.push('dependency-intake')
  if (filePath.includes('index.')) absorptions.push('aggregation-point')
  if (content.match(/extends\s+\w+/)) absorptions.push('inheritance-absorption')
  return absorptions
}

function identifyEmissions(content: string): string[] {
  const emissions: string[] = []
  if (content.match(EXPORT_RE)) emissions.push('api-surface')
  if (content.match(/export\s+default/)) emissions.push('default-export')
  if (content.match(/export\s+\{/)) emissions.push('named-exports')
  return emissions
}

// ─── Light Spectrum Analysis ─────────────────────────────────────────────────

/**
 * Evaluate a directory as a light spectrum
 * @example
 * analyzeLightSpectrum(rays, 'src') // LightSpectrum
 */
export function analyzeLightSpectrum(rays: LightRay[], dirPath: string): LightSpectrum {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [],
      avgClarity: 0, avgLuminosity: 0, avgRefractionIndex: 0, avgDispersion: 0, avgFocalPower: 0,
      dominantWavelength: 'green', spectralSpread: 0, lightBalance: 0,
      hasDeadZones: false, deadZoneCount: 0, hasHotSpots: false, hotSpotCount: 0,
      totalRefractions: 0, totalReflections: 0, totalAbsorptions: 0, totalEmissions: 0,
      opticalHealth: 'opaque',
    }
  }

  const avgClarity = Math.round(rays.reduce((s, r) => s + r.clarity, 0) / rays.length)
  const avgLuminosity = Math.round(rays.reduce((s, r) => s + r.luminosity, 0) / rays.length)
  const avgRefractionIndex = Math.round(rays.reduce((s, r) => s + r.refractionIndex, 0) / rays.length)
  const avgDispersion = Math.round(rays.reduce((s, r) => s + r.dispersion, 0) / rays.length)
  const avgFocalPower = Math.round(rays.reduce((s, r) => s + r.focalPower, 0) / rays.length)

  const wavelengthCounts = new Map<string, number>()
  for (const r of rays) {
    wavelengthCounts.set(r.dominantWavelength, (wavelengthCounts.get(r.dominantWavelength) ?? 0) + 1)
  }
  let dominantWavelength = 'green'
  let maxCount = 0
  for (const [w, c] of wavelengthCounts) {
    if (c > maxCount) { maxCount = c; dominantWavelength = w }
  }

  const uniqueWavelengths = Array.from(new Set(rays.map(r => r.dominantWavelength))).length
  const spectralSpread = Math.min(100, Math.round((uniqueWavelengths / 7) * 100))

  const clarityValues = rays.map(r => r.clarity)
  const avgC = clarityValues.reduce((s, v) => s + v, 0) / clarityValues.length
  const variance = clarityValues.reduce((s, v) => s + Math.pow(v - avgC, 2), 0) / clarityValues.length
  const lightBalance = Math.min(100, Math.max(0, Math.round(100 - Math.sqrt(variance))))

  const deadZones = identifyDeadZones(rays)
  const hotSpots = identifyHotSpots(rays)

  const totalRefractions = rays.reduce((s, r) => s + r.refractions, 0)
  const totalReflections = rays.reduce((s, r) => s + r.reflections.length, 0)
  const totalAbsorptions = rays.reduce((s, r) => s + r.absorptions.length, 0)
  const totalEmissions = rays.reduce((s, r) => s + r.emissions.length, 0)

  const opticalHealth = classifyOpticalHealth(avgClarity, avgLuminosity, avgDispersion)

  return {
    directory: dirPath,
    rays,
    avgClarity,
    avgLuminosity,
    avgRefractionIndex,
    avgDispersion,
    avgFocalPower,
    dominantWavelength,
    spectralSpread,
    lightBalance,
    hasDeadZones: deadZones.length > 0,
    deadZoneCount: deadZones.length,
    hasHotSpots: hotSpots.length > 0,
    hotSpotCount: hotSpots.length,
    totalRefractions,
    totalReflections,
    totalAbsorptions,
    totalEmissions,
    opticalHealth,
  }
}

/**
 * Identify files/areas with low clarity
 * @example
 * identifyDeadZones(rays) // string[]
 */
export function identifyDeadZones(rays: LightRay[]): string[] {
  return rays.filter(r => r.clarity < 20).map(r => r.file)
}

/**
 * Identify files with too many concerns
 * @example
 * identifyHotSpots(rays) // string[]
 */
export function identifyHotSpots(rays: LightRay[]): string[] {
  return rays.filter(r => r.dispersion >= 75).map(r => r.file)
}

function classifyOpticalHealth(
  clarity: number, luminosity: number, dispersion: number,
): LightSpectrum['opticalHealth'] {
  if (clarity >= 75 && luminosity >= 60 && dispersion < 40) return 'brilliant'
  if (clarity >= 55 && luminosity >= 40) return 'clear'
  if (clarity >= 40) return 'hazy'
  if (clarity >= 25) return 'cloudy'
  if (clarity >= 10) return 'foggy'
  return 'opaque'
}

// ─── Grades ───────────────────────────────────────────────────────────────────

/**
 * Compute optical grade from average clarity
 * @example
 * computeOpticalGrade(85) // 'diamond'
 */
export function computeOpticalGrade(avgClarity: number): KaleidoscopePrismStats['opticalGrade'] {
  if (avgClarity >= 80) return 'diamond'
  if (avgClarity >= 60) return 'crystal'
  if (avgClarity >= 40) return 'glass'
  if (avgClarity >= 25) return 'plastic'
  if (avgClarity >= 10) return 'muddy'
  return 'opaque'
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving clarity
 * @example
 * generateRecommendations(rays, spectra, stats) // string[]
 */
export function generateRecommendations(
  rays: LightRay[],
  _spectra: LightSpectrum[],
  stats: KaleidoscopePrismStats,
): string[] {
  const recs: string[] = []

  if (stats.opaqueFiles > 0) recs.push(`Improve clarity in ${stats.opaqueFiles} opaque file(s)`)
  if (stats.darkFiles > 0) recs.push(`${stats.darkFiles} dark file(s) need documentation and structure`)
  if (stats.avgDispersion > 60) recs.push('High dispersion - separate concerns into focused modules')
  if (stats.infraredFiles > 3) recs.push(`Make ${stats.infraredFiles} implicit file(s) explicit with documentation`)
  if (stats.ultravioletFiles > 0) recs.push(`Address ${stats.ultravioletFiles} file(s) with hidden concerns (TODOs, any types)`)
  if (stats.deadZones > 0) recs.push(`${stats.deadZones} dead zone(s) found - files with critically low clarity`)
  if (stats.hotSpots > 0) recs.push(`${stats.hotSpots} hot spot(s) found - files with too many concerns`)
  if (stats.avgLuminosity < 30) recs.push('Low overall luminosity - add JSDoc and inline comments')
  if (stats.avgRefractionIndex > 70) recs.push('Excessive refraction - reduce indirection layers')

  if (recs.length === 0) recs.push('Optical quality is excellent - code is clear and well-illuminated')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete kaleidoscope-prism analysis result
 * @example
 * buildKaleidoscopePrismResult(files, contents, {}) // KaleidoscopePrismResult
 */
export function buildKaleidoscopePrismResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): KaleidoscopePrismResult {
  const rays: LightRay[] = []
  for (let i = 0; i < files.length; i++) {
    rays.push(analyzeLightRay(contents[i], files[i]))
  }

  const dirMap = new Map<string, LightRay[]>()
  for (const ray of rays) {
    const normalized = ray.file.replace(/\\/g, '/')
    const dir = normalized.includes('/') ? normalized.substring(0, normalized.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) existing.push(ray)
    else dirMap.set(dir, [ray])
  }

  const spectra: LightSpectrum[] = []
  for (const [dir, dirRays] of dirMap) {
    spectra.push(analyzeLightSpectrum(dirRays, dir))
  }

  const stats = computeStats(rays, spectra)
  const recommendations = generateRecommendations(rays, spectra, stats)

  return { rays, spectra, stats, recommendations }
}

function computeStats(rays: LightRay[], spectra: LightSpectrum[]): KaleidoscopePrismStats {
  const totalFiles = rays.length
  const totalSpectra = spectra.length

  const avgClarity = totalFiles > 0 ? Math.round(rays.reduce((s, r) => s + r.clarity, 0) / totalFiles) : 0
  const avgLuminosity = totalFiles > 0 ? Math.round(rays.reduce((s, r) => s + r.luminosity, 0) / totalFiles) : 0
  const avgRefractionIndex = totalFiles > 0 ? Math.round(rays.reduce((s, r) => s + r.refractionIndex, 0) / totalFiles) : 0
  const avgDispersion = totalFiles > 0 ? Math.round(rays.reduce((s, r) => s + r.dispersion, 0) / totalFiles) : 0
  const avgFocalPower = totalFiles > 0 ? Math.round(rays.reduce((s, r) => s + r.focalPower, 0) / totalFiles) : 0

  const crystalFiles = rays.filter(r => r.classification === 'crystal').length
  const opaqueFiles = rays.filter(r => r.classification === 'opaque').length
  const laserFiles = rays.filter(r => r.lightType === 'laser').length
  const darkFiles = rays.filter(r => r.lightType === 'dark').length
  const monochromaticFiles = rays.filter(r => r.isMonochromatic).length
  const polychromaticFiles = rays.filter(r => r.isPolychromatic).length
  const ultravioletFiles = rays.filter(r => r.isUltraviolet).length
  const infraredFiles = rays.filter(r => r.isInfrared).length

  const totalRefractions = rays.reduce((s, r) => s + r.refractions, 0)
  const totalReflections = rays.reduce((s, r) => s + r.reflections.length, 0)
  const totalAbsorptions = rays.reduce((s, r) => s + r.absorptions.length, 0)
  const totalEmissions = rays.reduce((s, r) => s + r.emissions.length, 0)

  const wavelengthCounts = new Map<string, number>()
  for (const r of rays) {
    wavelengthCounts.set(r.dominantWavelength, (wavelengthCounts.get(r.dominantWavelength) ?? 0) + 1)
  }
  let dominantWavelength = 'green'
  let maxW = 0
  for (const [w, c] of wavelengthCounts) {
    if (c > maxW) { maxW = c; dominantWavelength = w }
  }

  const spectralSpread = spectra.length > 0
    ? Math.round(spectra.reduce((s, sp) => s + sp.spectralSpread, 0) / spectra.length)
    : 0
  const lightBalance = spectra.length > 0
    ? Math.round(spectra.reduce((s, sp) => s + sp.lightBalance, 0) / spectra.length)
    : 0

  const deadZones = spectra.reduce((s, sp) => s + sp.deadZoneCount, 0)
  const hotSpots = spectra.reduce((s, sp) => s + sp.hotSpotCount, 0)

  const overallClarity = avgClarity
  const opticalGrade = computeOpticalGrade(avgClarity)

  const sortedByClarity = [...rays].sort((a, b) => b.clarity - a.clarity)
  const brightestFile = sortedByClarity.length > 0 ? sortedByClarity[0].file : 'none'
  const darkestFile = sortedByClarity.length > 0 ? sortedByClarity[sortedByClarity.length - 1].file : 'none'

  return {
    totalFiles,
    totalSpectra,
    avgClarity,
    avgLuminosity,
    avgRefractionIndex,
    avgDispersion,
    avgFocalPower,
    crystalFiles,
    opaqueFiles,
    laserFiles,
    darkFiles,
    monochromaticFiles,
    polychromaticFiles,
    ultravioletFiles,
    infraredFiles,
    totalRefractions,
    totalReflections,
    totalAbsorptions,
    totalEmissions,
    dominantWavelength,
    spectralSpread,
    lightBalance,
    deadZones,
    hotSpots,
    overallClarity,
    opticalGrade,
    brightestFile,
    darkestFile,
  }
}
