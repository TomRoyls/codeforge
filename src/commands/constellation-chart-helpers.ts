// ─── Interfaces ──────────────────────────────────────────────────────────────

export type ConstellationType = 'zodiac' | 'major' | 'minor' | 'asterism' | 'cloud' | 'void'
export type ConstellationCondition = 'brilliant' | 'bright' | 'visible' | 'dim' | 'faint' | 'invisible'
export type AstronomerGrade = 'chief-astronomer' | 'astronomer' | 'stargazer' | 'navigator' | 'lost' | 'blind'

export interface StarModule {
  file: string
  magnitude: number
  brightness: number
  spectralType: string
  constellation: string
  connections: string[]
  connectionStrength: number
  isBinary: boolean
  binaryPartner: string
  isCluster: boolean
  isVariable: boolean
  isSupergiant: boolean
  isDwarf: boolean
  isNeutron: boolean
  isDark: boolean
  luminosity: number
  temperature: number
  age: number
  distance: number
  qualityScore: number
}

export interface Constellation {
  name: string
  stars: StarModule[]
  coherence: number
  mythologyClarity: number
  connectionCount: number
  avgBrightness: number
  avgMagnitude: number
  dominantSpectralType: string
  hasCore: boolean
  coreStar: string
  isBound: boolean
  isLoose: boolean
  constellationType: ConstellationType
  condition: ConstellationCondition
}

export interface SkyOverview {
  avgBrightness: number
  avgCoherence: number
  avgConnectionStrength: number
  totalConnections: number
  isClear: boolean
  overallClarity: number
}

export interface ConstellationChartStats {
  totalFiles: number
  totalConstellations: number
  avgMagnitude: number
  avgBrightness: number
  avgConnectionStrength: number
  avgLuminosity: number
  avgTemperature: number
  avgAge: number
  supergiantCount: number
  dwarfCount: number
  neutronCount: number
  darkCount: number
  binaryCount: number
  clusterCount: number
  variableCount: number
  zodiacConstellations: number
  majorConstellations: number
  minorConstellations: number
  cloudConstellations: number
  voidConstellations: number
  brilliantConstellations: number
  invisibleConstellations: number
  totalConnections: number
  strongestConnection: string
  overallClarity: number
  astronomerGrade: AstronomerGrade
  brightestStar: string
  mostConnected: string
  mostCoherent: string
  bestMythology: string
  darkestRegion: string
}

export interface ConstellationChartResult {
  stars: StarModule[]
  constellations: Constellation[]
  sky: SkyOverview
  stats: ConstellationChartStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
}

/**
 * Count error handling constructs
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names (camelCase longer than 3 chars)
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count short names (1-2 chars)
 * @example
 * countShortNames('const x = 1') // 1
 */
export function countShortNames(content: string): number {
  return (content.match(/\b(?:const|let|var)\s+[a-z]{1,2}\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify spectral type from code quality
 * @example
 * classifySpectralType('export function a(): number { return 1 }') // string
 */
export function classifySpectralType(content: string): string {
  const loc = countLoc(content)
  if (loc === 0) return 'M-red'

  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)
  const errors = countErrorHandling(content)
  const descriptive = countDescriptiveNames(content)
  const todos = countTodos(content)
  const functions = countFunctions(content)

  const score = Math.min(100,
    (exports > 0 ? 20 : 0) + (types > 0 ? 15 : 0) + (jsdoc > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0) + (errors > 0 ? 10 : 0) + (descriptive > 0 ? 10 : 0) +
    (todos === 0 ? 10 : 0) + (functions > 0 ? 10 : 0),
  )

  if (score >= 85) return 'O-blue'
  if (score >= 70) return 'B-blue-white'
  if (score >= 55) return 'A-white'
  if (score >= 40) return 'F-yellow-white'
  if (score >= 25) return 'G-yellow'
  if (score >= 12) return 'K-orange'
  return 'M-red'
}

/**
 * Classify constellation type from stars
 * @example
 * classifyConstellationType([]) // 'void'
 */
export function classifyConstellationType(stars: StarModule[]): ConstellationType {
  if (stars.length === 0) return 'void'
  const n = stars.length
  const bright = stars.filter(s => s.brightness >= 60).length
  const connected = stars.reduce((s, st) => s + st.connections.length, 0)

  if (bright > n * 0.7 && connected > n) return 'zodiac'
  if (bright > n * 0.4 && n >= 3) return 'major'
  if (bright > n * 0.2 && n >= 2) return 'minor'
  if (connected > 0 && n >= 2) return 'asterism'
  if (stars.filter(s => s.isDark).length > n * 0.5) return 'cloud'
  return 'cloud'
}

/**
 * Classify constellation condition from average brightness
 * @example
 * classifyConstellationCondition(85) // 'brilliant'
 */
export function classifyConstellationCondition(avgBrightness: number): ConstellationCondition {
  if (avgBrightness >= 80) return 'brilliant'
  if (avgBrightness >= 60) return 'bright'
  if (avgBrightness >= 40) return 'visible'
  if (avgBrightness >= 20) return 'dim'
  if (avgBrightness >= 8) return 'faint'
  return 'invisible'
}

/**
 * Classify astronomer grade from average clarity
 * @example
 * classifyAstronomerGrade(85) // 'chief-astronomer'
 */
export function classifyAstronomerGrade(avgClarity: number): AstronomerGrade {
  if (avgClarity >= 80) return 'chief-astronomer'
  if (avgClarity >= 65) return 'astronomer'
  if (avgClarity >= 45) return 'stargazer'
  if (avgClarity >= 30) return 'navigator'
  if (avgClarity >= 15) return 'lost'
  return 'blind'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure magnitude (module importance, lower = brighter)
 * @example
 * measureMagnitude('export function a(): number { return 1 }') // number
 */
export function measureMagnitude(content: string): number {
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)
  const comments = countComments(content)
  const descriptive = countDescriptiveNames(content)

  const importance = Math.min(100,
    (exports > 0 ? 25 : 0) + (types > 0 ? 20 : 0) + (jsdoc > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) + (comments > 0 ? 10 : 0) + (descriptive > 0 ? 10 : 0),
  )
  return Math.max(0, 100 - importance)
}

/**
 * Measure luminosity (exports/output)
 * @example
 * measureLuminosity('export function a(): number { return 1 }') // number
 */
export function measureLuminosity(content: string): number {
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const comments = countComments(content)

  return Math.min(100, Math.max(0, Math.round(
    (exports * 15) +
    (types > 0 ? 20 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (comments > 0 ? 10 : 0),
  )))
}

/**
 * Measure temperature (activity level)
 * @example
 * measureTemperature('if (a) { return 1 }') // number
 */
export function measureTemperature(content: string): number {
  const functions = countFunctions(content)
  const branches = countBranches(content)
  const nesting = maxNesting(content)
  const loc = countLoc(content)
  const todos = countTodos(content)

  return Math.min(100, Math.max(0, Math.round(
    (functions * 5) +
    (branches * 3) +
    (nesting * 5) +
    (loc * 0.5) +
    (todos * 5),
  )))
}

/**
 * Extract relative import connections
 * @example
 * extractConnections('import { x } from "./utils"') // ['./utils']
 */
export function extractConnections(content: string): string[] {
  const matches = content.match(/from\s+['"]([^'"]+)['"]/g) ?? []
  return matches
    .map(m => m.replace(/^from\s+['"]|['"]$/g, ''))
    .filter(p => p.startsWith('./') || p.startsWith('../'))
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a star module
 * @example
 * analyzeStarModule('export function a(): number { return 1 }', 'a.ts') // StarModule
 */
export function analyzeStarModule(content: string, filePath: string): StarModule {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      magnitude: 100, brightness: 0, spectralType: 'M-red',
      constellation: '', connections: [], connectionStrength: 0,
      isBinary: false, binaryPartner: '', isCluster: false,
      isVariable: false, isSupergiant: false, isDwarf: false,
      isNeutron: false, isDark: true, luminosity: 0,
      temperature: 0, age: 0, distance: 0, qualityScore: 0,
    }
  }

  const imports = countImports(content)
  const exports = countExports(content)
  const functions = countFunctions(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const todos = countTodos(content)
  const descriptive = countDescriptiveNames(content)
  const nesting = maxNesting(content)

  const magnitude = measureMagnitude(content)
  const brightness = Math.min(100, Math.max(0, Math.round(
    (comments > 0 ? 25 : 0) +
    (jsdoc > 0 ? 30 : 0) +
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0) +
    (descriptive > 0 ? 15 : 0),
  )))
  const spectralType = classifySpectralType(content)
  const connections = extractConnections(content)
  const connectionStrength = Math.min(100, imports * 15 + exports * 10)

  const isVariable = todos > 0
  const isSupergiant = loc > 50
  const isDwarf = loc <= 3
  const isNeutron = loc <= 10 && functions >= 3 && nesting >= 2
  const isDark = comments === 0 && jsdoc === 0

  const luminosity = measureLuminosity(content)
  const temperature = measureTemperature(content)
  const age = Math.min(100, Math.max(0, Math.round(
    (comments > 0 ? 25 : 0) +
    (jsdoc > 0 ? 25 : 0) +
    (todos === 0 ? 20 : 0) +
    (exports > 0 ? 15 : 0) +
    (types > 0 ? 15 : 0),
  )))
  const distance = Math.min(100, filePath.split('/').length * 15)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (100 - magnitude) * 0.2 +
    brightness * 0.2 +
    luminosity * 0.15 +
    (100 - connectionStrength) * 0.1 +
    temperature * 0.05 +
    age * 0.15 +
    (isDark ? 0 : 10) +
    (100 - distance) * 0.05,
  )))

  return {
    file: filePath,
    magnitude, brightness, spectralType,
    constellation: '', connections, connectionStrength,
    isBinary: false, binaryPartner: '', isCluster: false,
    isVariable, isSupergiant, isDwarf, isNeutron, isDark,
    luminosity, temperature, age, distance, qualityScore,
  }
}

// ─── Binary & Cluster Detection ──────────────────────────────────────────────

/**
 * Detect binary systems (mutually coupled pairs)
 * @example
 * detectBinarySystems(stars) // void
 */
export function detectBinarySystems(stars: StarModule[]): void {
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const a = stars[i]
      const b = stars[j]
      const aBase = a.file.replace(/.*\//, '').replace(/\.[^.]+$/, '')
      const bBase = b.file.replace(/.*\//, '').replace(/\.[^.]+$/, '')

      const aConnB = a.connections.some(c => c.includes(bBase))
      const bConnA = b.connections.some(c => c.includes(aBase))

      if (aConnB && bConnA) {
        a.isBinary = true
        a.binaryPartner = b.file
        b.isBinary = true
        b.binaryPartner = a.file
      }
    }
  }
}

/**
 * Detect clusters (tight module groups)
 * @example
 * detectClusters(stars) // void
 */
export function detectClusters(stars: StarModule[]): void {
  for (const star of stars) {
    const connCount = star.connections.length
    const sameDirStars = stars.filter(s => {
      const sDir = s.file.includes('/') ? s.file.slice(0, s.file.lastIndexOf('/')) : '.'
      const starDir = star.file.includes('/') ? star.file.slice(0, star.file.lastIndexOf('/')) : '.'
      return sDir === starDir && s.file !== star.file
    })
    if (connCount >= 2 && sameDirStars.length >= 2) {
      star.isCluster = true
    }
  }
}

/**
 * Measure mythology clarity (purpose narrative)
 * @example
 * measureMythology(stars) // number
 */
export function measureMythology(stars: StarModule[]): number {
  if (stars.length === 0) return 0
  const n = stars.length
  const documented = stars.filter(s => !s.isDark).length
  const consistentNaming = new Set(stars.map(s => {
    const base = s.file.replace(/.*\//, '').replace(/\.[^.]+$/, '')
    return base.split(/[-_]/)[0]
  })).size <= Math.max(Math.ceil(n * 0.5), 1)
  const hasExports = stars.filter(s => s.luminosity > 0).length

  return Math.min(100, Math.max(0, Math.round(
    (documented / n) * 40 +
    (consistentNaming ? 30 : 0) +
    (hasExports > 0 ? 20 : 0) +
    (n >= 2 ? 10 : 0),
  )))
}

// ─── Constellation Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as a constellation
 * @example
 * analyzeConstellation(stars, 'src') // Constellation
 */
export function analyzeConstellation(stars: StarModule[], dirPath: string): Constellation {
  if (stars.length === 0) {
    return {
      name: dirPath, stars: [],
      coherence: 0, mythologyClarity: 0, connectionCount: 0,
      avgBrightness: 0, avgMagnitude: 100,
      dominantSpectralType: 'M-red',
      hasCore: false, coreStar: '',
      isBound: false, isLoose: true,
      constellationType: 'void', condition: 'invisible',
    }
  }

  const n = stars.length
  const avgBrightness = Math.round(stars.reduce((s, st) => s + st.brightness, 0) / n)
  const avgMagnitude = Math.round(stars.reduce((s, st) => s + st.magnitude, 0) / n)
  const connectionCount = stars.reduce((s, st) => s + st.connections.length, 0)

  const spectralCounts = new Map<string, number>()
  for (const s of stars) {
    const prev = spectralCounts.get(s.spectralType) ?? 0
    spectralCounts.set(s.spectralType, prev + 1)
  }
  let dominantSpectralType = 'M-red'
  let maxCount = 0
  for (const [type, count] of spectralCounts) {
    if (count > maxCount) { maxCount = count; dominantSpectralType = type }
  }

  const coreStar = stars.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, stars[0])
  const hasCore = coreStar.qualityScore >= 50

  const avgConnections = connectionCount / n
  const isBound = avgConnections >= 2
  const isLoose = avgConnections < 1

  const coherence = Math.min(100, Math.max(0, Math.round(
    (hasCore ? 30 : 0) +
    (isBound ? 25 : 0) +
    (avgBrightness >= 40 ? 25 : avgBrightness >= 20 ? 15 : 0) +
    (dominantSpectralType !== 'M-red' ? 20 : 0),
  )))
  const mythologyClarity = measureMythology(stars)

  const constellationType = classifyConstellationType(stars)
  const condition = classifyConstellationCondition(avgBrightness)

  return {
    name: dirPath, stars,
    coherence, mythologyClarity, connectionCount,
    avgBrightness, avgMagnitude, dominantSpectralType,
    hasCore, coreStar: coreStar.file,
    isBound, isLoose,
    constellationType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate constellation chart recommendations
 * @example
 * generateRecommendations(stars, constellations, sky, stats) // string[]
 */
export function generateRecommendations(
  _stars: StarModule[],
  _constellations: Constellation[],
  _sky: SkyOverview,
  stats: ConstellationChartStats,
): string[] {
  void _stars
  void _constellations
  void _sky
  const recs: string[] = []

  if (stats.darkCount > 0) {
    recs.push(`Dark stars: ${stats.darkCount} files have no documentation visibility`)
  }
  if (stats.supergiantCount > 0) {
    recs.push(`Supergiants: ${stats.supergiantCount} very large modules may need splitting`)
  }
  if (stats.variableCount > 0) {
    recs.push(`Variable stars: ${stats.variableCount} files have unstable markers`)
  }
  if (stats.overallClarity >= 60) {
    recs.push('Clear skies: code relationships are well-mapped across the codebase')
  }
  if (stats.binaryCount > 0) {
    recs.push(`Binary systems: ${stats.binaryCount} tightly-coupled module pairs detected`)
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete constellation chart result from files and contents
 * @example
 * buildConstellationChartResult(['a.ts'], ['export function a() {}'], {}) // ConstellationChartResult
 */
export function buildConstellationChartResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): ConstellationChartResult {
  void options

  const stars: StarModule[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeStarModule(content, file)
    } catch {
      return analyzeStarModule('', file)
    }
  })

  detectBinarySystems(stars)
  detectClusters(stars)

  const dirMap = new Map<string, StarModule[]>()
  for (const s of stars) {
    const dir = s.file.includes('/') ? s.file.slice(0, s.file.lastIndexOf('/')) : '.'
    s.constellation = dir
    const existing = dirMap.get(dir)
    if (existing) { existing.push(s) } else { dirMap.set(dir, [s]) }
  }

  const constellations: Constellation[] = Array.from(dirMap.entries()).map(([dir, ss]) =>
    analyzeConstellation(ss, dir),
  )

  const n = stars.length || 1
  const avgBrightness = Math.round(stars.reduce((s, st) => s + st.brightness, 0) / n)
  const avgConnectionStrength = Math.round(stars.reduce((s, st) => s + st.connectionStrength, 0) / n)
  const totalConnections = stars.reduce((s, st) => s + st.connections.length, 0)
  const avgCoherence = constellations.length > 0
    ? Math.round(constellations.reduce((s, c) => s + c.coherence, 0) / constellations.length)
    : 0

  const overallClarity = Math.min(100, Math.max(0, Math.round(
    avgBrightness * 0.3 +
    avgCoherence * 0.25 +
    (100 - avgConnectionStrength) * 0.15 +
    (stars.filter(s => !s.isDark).length / n) * 100 * 0.15 +
    (constellations.filter(c => c.condition === 'brilliant' || c.condition === 'bright').length / Math.max(constellations.length, 1)) * 100 * 0.15,
  )))

  const sky: SkyOverview = {
    avgBrightness, avgCoherence, avgConnectionStrength,
    totalConnections, isClear: overallClarity >= 60, overallClarity,
  }

  const strongestPair = stars.reduce((best, s) => {
    if (s.connectionStrength > best.connectionStrength) return s
    return best
  }, stars[0])
  const strongestConnection = strongestPair
    ? `${strongestPair.file}(${strongestPair.connectionStrength})`
    : 'none'

  const stats: ConstellationChartStats = {
    totalFiles: files.length,
    totalConstellations: constellations.length,
    avgMagnitude: Math.round(stars.reduce((s, st) => s + st.magnitude, 0) / n),
    avgBrightness,
    avgConnectionStrength,
    avgLuminosity: Math.round(stars.reduce((s, st) => s + st.luminosity, 0) / n),
    avgTemperature: Math.round(stars.reduce((s, st) => s + st.temperature, 0) / n),
    avgAge: Math.round(stars.reduce((s, st) => s + st.age, 0) / n),
    supergiantCount: stars.filter(s => s.isSupergiant).length,
    dwarfCount: stars.filter(s => s.isDwarf).length,
    neutronCount: stars.filter(s => s.isNeutron).length,
    darkCount: stars.filter(s => s.isDark).length,
    binaryCount: stars.filter(s => s.isBinary).length,
    clusterCount: stars.filter(s => s.isCluster).length,
    variableCount: stars.filter(s => s.isVariable).length,
    zodiacConstellations: constellations.filter(c => c.constellationType === 'zodiac').length,
    majorConstellations: constellations.filter(c => c.constellationType === 'major').length,
    minorConstellations: constellations.filter(c => c.constellationType === 'minor').length,
    cloudConstellations: constellations.filter(c => c.constellationType === 'cloud').length,
    voidConstellations: constellations.filter(c => c.constellationType === 'void').length,
    brilliantConstellations: constellations.filter(c => c.condition === 'brilliant').length,
    invisibleConstellations: constellations.filter(c => c.condition === 'invisible').length,
    totalConnections,
    strongestConnection,
    overallClarity,
    astronomerGrade: classifyAstronomerGrade(overallClarity),
    brightestStar: stars.length > 0
      ? stars.reduce((a, b) => b.brightness > a.brightness ? b : a, stars[0]).file : 'none',
    mostConnected: stars.length > 0
      ? stars.reduce((a, b) => b.connections.length > a.connections.length ? b : a, stars[0]).file : 'none',
    mostCoherent: constellations.length > 0
      ? constellations.reduce((a, b) => b.coherence > a.coherence ? b : a, constellations[0]).name : 'none',
    bestMythology: constellations.length > 0
      ? constellations.reduce((a, b) => b.mythologyClarity > a.mythologyClarity ? b : a, constellations[0]).name : 'none',
    darkestRegion: constellations.length > 0
      ? constellations.reduce((a, b) => b.avgBrightness < a.avgBrightness ? b : a, constellations[0]).name : 'none',
  }

  const recommendations = generateRecommendations(stars, constellations, sky, stats)

  return { stars, constellations, sky, stats, recommendations }
}
