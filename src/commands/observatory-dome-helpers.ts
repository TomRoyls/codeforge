// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CelestialBody {
  file: string
  name: string
  luminosity: number
  magnitude: number
  spectralType: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
  bodyType: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'dwarf-planet' | 'black-hole' | 'neutron-star' | 'pulsar'
  orbitalPeriod: number
  distance: number
  mass: number
  gravity: number
  temperature: number
  age: 'protostar' | 'main-sequence' | 'red-giant' | 'white-dwarf' | 'neutron-star' | 'black-dwarf'
  stability: 'stable' | 'variable' | 'eruptive' | 'cataclysmic' | 'supernova'
  constellation: string
  companions: string[]
  satellites: string[]
  influences: string[]
  influencedBy: string[]
  isBinarySystem: boolean
  isBlackHole: boolean
  isSupernova: boolean
  isNebula: boolean
  isDarkMatter: boolean
  isPulsar: boolean
  habitableZone: boolean
  skyPosition: { ra: number; dec: number }
  classification: 'observable' | 'detectable' | 'theoretical' | 'hidden'
  observationNotes: string[]
}

export interface Constellation {
  directory: string
  name: string
  bodies: CelestialBody[]
  starCount: number
  planetCount: number
  blackHoleCount: number
  nebulaCount: number
  avgLuminosity: number
  avgMagnitude: number
  totalMass: number
  dominantSpectralType: string
  dominantBodyType: string
  hasBinarySystems: boolean
  binarySystemCount: number
  hasBlackHoles: boolean
  hasSupernovae: boolean
  hasDarkMatter: boolean
  gravitationalCenter: string
  isDense: boolean
  isSparse: boolean
  formation: 'spiral' | 'elliptical' | 'irregular' | 'lenticular'
  health: 'vibrant' | 'stable' | 'aging' | 'dying' | 'dead'
}

export interface CosmicMap {
  totalLuminosity: number
  totalMass: number
  avgDistance: number
  avgMagnitude: number
  blackHoles: number
  supernovae: number
  nebulae: number
  darkMatter: number
  pulsars: number
  binarySystems: number
  habitableBodies: number
  cosmicBackground: number
}

export interface ObservatoryDomeStats {
  totalFiles: number
  totalConstellations: number
  stars: number
  planets: number
  moons: number
  blackHoles: number
  supernovae: number
  nebulae: number
  darkMatter: number
  pulsars: number
  binarySystems: number
  avgLuminosity: number
  avgMagnitude: number
  avgDistance: number
  avgTemperature: number
  dominantSpectralType: string
  dominantBodyType: string
  brightestBody: string
  dimmestBody: string
  heaviestBody: string
  mostInfluential: string
  gravitationalCenter: string
  cosmicBackground: number
  galaxyType: 'spiral' | 'elliptical' | 'irregular' | 'lenticular' | 'dwarf' | 'void'
  observationGrade: 'hubble' | 'ground-telescope' | 'binoculars' | 'naked-eye' | 'blind'
}

export interface ObservatoryDomeResult {
  bodies: CelestialBody[]
  constellations: Constellation[]
  cosmicMap: CosmicMap
  stats: ObservatoryDomeStats
  recommendations: string[]
}

// ─── Regex Patterns ──────────────────────────────────────────────────────────

const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|interface|type)/g
const IMPORT_RE = /import\s+.*?from\s+['"]([^'"]+)['"]/g
const INTERFACE_RE = /(?:export\s+)?interface\s+\w+/g
const TYPE_RE = /(?:export\s+)?type\s+\w+/g
const TODO_RE = /\/\/\s*(TODO|FIXME|HACK|XXX)/gi
const ANY_RE = /:\s*any\b/g
const CONSOLE_RE = /console\.\w+\(/g
const NESTED_IF_RE = /if\s*\(.*if\s*\(/s
const JSDOC_RE = /\/\*\*[\s\S]*?\*\//g

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify spectral type based on temperature
 * @example
 * classifySpectralType(10) // 'M'
 */
export function classifySpectralType(temperature: number): CelestialBody['spectralType'] {
  if (temperature >= 80) return 'O'
  if (temperature >= 65) return 'B'
  if (temperature >= 50) return 'A'
  if (temperature >= 35) return 'F'
  if (temperature >= 20) return 'G'
  if (temperature >= 10) return 'K'
  return 'M'
}

/**
 * Classify body type based on metrics
 * @example
 * classifyBodyType(80, 5, 3, 100) // 'star'
 */
export function classifyBodyType(luminosity: number, dependents: number, imports: number, temperature: number): CelestialBody['bodyType'] {
  if (temperature >= 85 && imports >= 5) return 'black-hole'
  if (temperature >= 70 && luminosity >= 30) return 'neutron-star'
  if (temperature >= 60 && luminosity >= 40) return 'pulsar'
  if (luminosity >= 60 && dependents >= 4) return 'star'
  if (luminosity >= 40 && dependents >= 2) return 'planet'
  if (luminosity >= 20 && dependents >= 1) return 'moon'
  if (luminosity >= 50 && dependents === 0) return 'comet'
  if (luminosity < 20 && imports === 0) return 'asteroid'
  if (luminosity >= 10 && luminosity < 40 && dependents >= 1) return 'dwarf-planet'
  return 'asteroid'
}

/**
 * Classify age based on lines and complexity
 * @example
 * classifyAge(5, 10) // 'protostar'
 */
export function classifyAge(lines: number, temperature: number): CelestialBody['age'] {
  if (lines < 10) return 'protostar'
  if (temperature >= 70) return 'red-giant'
  if (temperature <= 15 && lines >= 50) return 'white-dwarf'
  if (lines >= 100 && temperature <= 30) return 'black-dwarf'
  if (temperature >= 50) return 'neutron-star'
  return 'main-sequence'
}

/**
 * Classify stability based on indicators
 * @example
 * classifyStability(5, 3, true) // 'cataclysmic'
 */
export function classifyStability(todos: number, anys: number, hasNestedIf: boolean): CelestialBody['stability'] {
  const score = todos * 3 + anys * 2 + (hasNestedIf ? 5 : 0)
  if (score >= 20) return 'cataclysmic'
  if (score >= 12) return 'supernova'
  if (score >= 6) return 'eruptive'
  if (score >= 2) return 'variable'
  return 'stable'
}

/**
 * Classify galaxy type from body and constellation distribution
 * @example
 * classifyGalaxyType(50, 5, 30, 10) // 'spiral'
 */
export function classifyGalaxyType(avgLuminosity: number, totalFiles: number, avgDistance: number, blackHoles: number): ObservatoryDomeStats['galaxyType'] {
  if (totalFiles === 0) return 'void'
  if (blackHoles >= 3) return 'irregular'
  if (avgLuminosity >= 60 && avgDistance < 30) return 'spiral'
  if (avgLuminosity >= 40) return 'elliptical'
  if (avgDistance >= 50) return 'lenticular'
  if (totalFiles < 10) return 'dwarf'
  return 'spiral'
}

/**
 * Classify observation grade from cosmic background
 * @example
 * classifyObservationGrade(90) // 'hubble'
 */
export function classifyObservationGrade(cosmicBackground: number): ObservatoryDomeStats['observationGrade'] {
  if (cosmicBackground >= 80) return 'hubble'
  if (cosmicBackground >= 60) return 'ground-telescope'
  if (cosmicBackground >= 40) return 'binoculars'
  if (cosmicBackground >= 20) return 'naked-eye'
  return 'blind'
}

/**
 * Classify constellation formation from body distribution
 * @example
 * classifyFormation(10, 50) // 'spiral'
 */
export function classifyFormation(bodyCount: number, avgMass: number): Constellation['formation'] {
  if (bodyCount >= 15 && avgMass > 40) return 'spiral'
  if (bodyCount >= 10) return 'elliptical'
  if (avgMass < 20) return 'irregular'
  return 'lenticular'
}

/**
 * Classify constellation health from average luminosity
 * @example
 * classifyConstellationHealth(85) // 'vibrant'
 */
export function classifyConstellationHealth(avgLuminosity: number): Constellation['health'] {
  if (avgLuminosity >= 70) return 'vibrant'
  if (avgLuminosity >= 50) return 'stable'
  if (avgLuminosity >= 30) return 'aging'
  if (avgLuminosity >= 10) return 'dying'
  return 'dead'
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a celestial body
 * @example
 * analyzeCelestialBody('export function a() {}', 'a.ts', [], []) // CelestialBody
 */
export function analyzeCelestialBody(content: string, filePath: string, imports: string[], dependents: string[]): CelestialBody {
  const lines = content.split('\n')
  const codeLines = lines.filter(l => l.trim().length > 0)

  const exports = (content.match(EXPORT_RE) ?? []).length
  const interfaces = (content.match(INTERFACE_RE) ?? []).length
  const types = (content.match(TYPE_RE) ?? []).length
  const todos = (content.match(TODO_RE) ?? []).length
  const anys = (content.match(ANY_RE) ?? []).length
  const consoles = (content.match(CONSOLE_RE) ?? []).length
  const jsdoc = (content.match(JSDOC_RE) ?? []).length
  const hasNestedIf = NESTED_IF_RE.test(content)

  const name = filePath.includes('/') ? filePath.substring(filePath.lastIndexOf('/') + 1) : filePath
  const constellation = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.'

  const luminosity = computeLuminosity(exports, interfaces + types, jsdoc, codeLines.length)
  const magnitude = computeMagnitude(exports, dependents.length, codeLines.length)
  const mass = computeMass(codeLines.length)
  const gravity = computeGravity(imports.length)
  const temperature = computeTemperature(todos, anys, consoles, hasNestedIf, codeLines.length)
  const distance = computeDistance(filePath)
  const orbitalPeriod = computeOrbitalPeriod(todos, codeLines.length)

  const spectralType = classifySpectralType(temperature)
  const bodyType = classifyBodyType(luminosity, dependents.length, imports.length, temperature)
  const age = classifyAge(codeLines.length, temperature)
  const stability = classifyStability(todos, anys, hasNestedIf)

  const isBlackHole = bodyType === 'black-hole'
  const isPulsar = bodyType === 'pulsar'
  const isSupernova = stability === 'supernova' || stability === 'cataclysmic'
  const isNebula = age === 'protostar'
  const isDarkMatter = exports === 0 && dependents.length === 0

  const companions = findCompanions(imports, dependents, filePath)
  const satellites = Array.from(new Set(dependents))
  const isBinarySystem = companions.length === 1

  const habitableZone = luminosity >= 30 && luminosity <= 70 && temperature >= 15 && temperature <= 50

  const skyPosition = computeSkyPosition(filePath, codeLines.length)
  const classification = classifyObservation(luminosity, exports, dependents.length)
  const observationNotes = generateObservationNotes(bodyType, stability, isBlackHole, isDarkMatter, isNebula)

  return {
    file: filePath,
    name,
    luminosity,
    magnitude,
    spectralType,
    bodyType,
    orbitalPeriod,
    distance,
    mass,
    gravity,
    temperature,
    age,
    stability,
    constellation,
    companions,
    satellites,
    influences: imports,
    influencedBy: dependents,
    isBinarySystem,
    isBlackHole,
    isSupernova,
    isNebula,
    isDarkMatter,
    isPulsar,
    habitableZone,
    skyPosition,
    classification,
    observationNotes,
  }
}

// ─── Metric Computations ─────────────────────────────────────────────────────

function computeLuminosity(exports: number, structural: number, jsdoc: number, lines: number): number {
  if (lines === 0) return 0
  let score = 20
  score += Math.min(30, exports * 5)
  score += Math.min(15, structural * 4)
  score += Math.min(15, jsdoc * 3)
  if (exports > 0 && structural > 0) score += 10
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeMagnitude(exports: number, dependents: number, lines: number): number {
  if (lines === 0) return 100
  const impact = exports * 3 + dependents * 5
  return Math.max(0, Math.round(100 - impact))
}

function computeMass(lines: number): number {
  return Math.min(100, Math.round(lines * 0.5))
}

function computeGravity(imports: number): number {
  return Math.min(100, imports * 10)
}

function computeTemperature(todos: number, anys: number, consoles: number, hasNestedIf: boolean, lines: number): number {
  if (lines === 0) return 0
  let score = 5
  score += todos * 12
  score += anys * 10
  score += consoles * 3
  if (hasNestedIf) score += 15
  return Math.min(100, Math.max(0, Math.round(score)))
}

function computeDistance(filePath: string): number {
  const normalized = filePath.replace(/\\/g, '/')
  const depth = normalized.split('/').length - 1
  return Math.min(100, depth * 20)
}

function computeOrbitalPeriod(todos: number, lines: number): number {
  if (lines === 0) return 0
  return Math.min(100, Math.round(todos * 15 + 5))
}

function findCompanions(imports: string[], dependents: string[], _filePath: string): string[] {
  const companionSet = new Set<string>()
  for (const dep of dependents) {
    if (imports.includes(dep)) {
      companionSet.add(dep)
    }
  }
  return Array.from(companionSet)
}

function computeSkyPosition(filePath: string, lines: number): { ra: number; dec: number } {
  let hash = 0
  for (let i = 0; i < filePath.length; i++) {
    hash = ((hash << 5) - hash + filePath.charCodeAt(i)) | 0
  }
  const ra = Math.abs(hash % 360)
  const dec = ((hash >> 8) % 180) - 90
  return { ra, dec: Math.abs(dec) + (lines % 10) }
}

function classifyObservation(luminosity: number, exports: number, dependents: number): CelestialBody['classification'] {
  if (luminosity >= 50 && exports > 0) return 'observable'
  if (luminosity >= 20 || dependents > 0) return 'detectable'
  if (exports > 0) return 'theoretical'
  return 'hidden'
}

function generateObservationNotes(bodyType: CelestialBody['bodyType'], stability: CelestialBody['stability'], isBlackHole: boolean, isDarkMatter: boolean, isNebula: boolean): string[] {
  const notes: string[] = []
  if (isBlackHole) notes.push('Gravitational singularity detected - absorbs all complexity')
  if (isDarkMatter) notes.push('Dark matter detected - invisible but present')
  if (isNebula) notes.push('Nebula forming - structure not yet clear')
  if (stability === 'cataclysmic') notes.push('Cataclysmic variable - extreme instability')
  if (stability === 'supernova') notes.push('Supernova candidate - approaching critical mass')
  if (stability === 'eruptive') notes.push('Eruptive variable - periodic outbursts expected')
  if (bodyType === 'pulsar') notes.push('Pulsar detected - regularly emitting changes')
  if (bodyType === 'comet') notes.push('Comet trajectory - rarely seen in codebase')
  if (bodyType === 'neutron-star') notes.push('Neutron star - extremely dense code')
  return notes
}

// ─── Constellation Analysis ──────────────────────────────────────────────────

/**
 * Analyze a directory as a constellation
 * @example
 * analyzeConstellation(bodies, 'src') // Constellation
 */
export function analyzeConstellation(bodies: CelestialBody[], dirPath: string): Constellation {
  if (bodies.length === 0) {
    return {
      directory: dirPath,
      name: dirPath,
      bodies: [],
      starCount: 0,
      planetCount: 0,
      blackHoleCount: 0,
      nebulaCount: 0,
      avgLuminosity: 0,
      avgMagnitude: 0,
      totalMass: 0,
      dominantSpectralType: 'M',
      dominantBodyType: 'asteroid',
      hasBinarySystems: false,
      binarySystemCount: 0,
      hasBlackHoles: false,
      hasSupernovae: false,
      hasDarkMatter: false,
      gravitationalCenter: 'none',
      isDense: false,
      isSparse: true,
      formation: 'irregular',
      health: 'dead',
    }
  }

  const starCount = bodies.filter(b => b.bodyType === 'star').length
  const planetCount = bodies.filter(b => b.bodyType === 'planet').length
  const blackHoleCount = bodies.filter(b => b.isBlackHole).length
  const nebulaCount = bodies.filter(b => b.isNebula).length

  const avgLuminosity = Math.round(bodies.reduce((s, b) => s + b.luminosity, 0) / bodies.length)
  const avgMagnitude = Math.round(bodies.reduce((s, b) => s + b.magnitude, 0) / bodies.length)
  const totalMass = Math.round(bodies.reduce((s, b) => s + b.mass, 0))

  const dominantSpectralType = findDominant(bodies.map(b => b.spectralType))
  const dominantBodyType = findDominant(bodies.map(b => b.bodyType))

  const binarySystemCount = bodies.filter(b => b.isBinarySystem).length
  const hasBinarySystems = binarySystemCount > 0
  const hasBlackHoles = blackHoleCount > 0
  const hasSupernovae = bodies.some(b => b.isSupernova)
  const hasDarkMatter = bodies.some(b => b.isDarkMatter)

  const gravitationalCenter = findGravitationalCenter(bodies)

  const isDense = bodies.length >= 10
  const isSparse = bodies.length <= 2

  const avgMass = totalMass / bodies.length
  const formation = classifyFormation(bodies.length, avgMass)
  const health = classifyConstellationHealth(avgLuminosity)

  return {
    directory: dirPath,
    name: dirPath,
    bodies,
    starCount,
    planetCount,
    blackHoleCount,
    nebulaCount,
    avgLuminosity,
    avgMagnitude,
    totalMass,
    dominantSpectralType,
    dominantBodyType,
    hasBinarySystems,
    binarySystemCount,
    hasBlackHoles,
    hasSupernovae,
    hasDarkMatter,
    gravitationalCenter,
    isDense,
    isSparse,
    formation,
    health,
  }
}

function findDominant<T extends string>(items: T[]): string {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }
  let dominant = items[0] ?? 'M'
  let max = 0
  for (const [item, count] of counts) {
    if (count > max) { max = count; dominant = item }
  }
  return dominant
}

function findGravitationalCenter(bodies: CelestialBody[]): string {
  let best = bodies[0]
  let maxGravity = -1
  for (const b of bodies) {
    const score = b.gravity + b.influencedBy.length * 3
    if (score > maxGravity) { maxGravity = score; best = b }
  }
  return best?.file ?? ''
}

// ─── Cosmic Map ──────────────────────────────────────────────────────────────

/**
 * Build the cosmic map from bodies and constellations
 * @example
 * buildCosmicMap(bodies, constellations) // CosmicMap
 */
export function buildCosmicMap(bodies: CelestialBody[], _constellations: Constellation[]): CosmicMap {
  if (bodies.length === 0) {
    return {
      totalLuminosity: 0,
      totalMass: 0,
      avgDistance: 0,
      avgMagnitude: 0,
      blackHoles: 0,
      supernovae: 0,
      nebulae: 0,
      darkMatter: 0,
      pulsars: 0,
      binarySystems: 0,
      habitableBodies: 0,
      cosmicBackground: 0,
    }
  }

  const totalLuminosity = Math.round(bodies.reduce((s, b) => s + b.luminosity, 0))
  const totalMass = Math.round(bodies.reduce((s, b) => s + b.mass, 0))
  const avgDistance = Math.round(bodies.reduce((s, b) => s + b.distance, 0) / bodies.length)
  const avgMagnitude = Math.round(bodies.reduce((s, b) => s + b.magnitude, 0) / bodies.length)

  const blackHoles = bodies.filter(b => b.isBlackHole).length
  const supernovae = bodies.filter(b => b.isSupernova).length
  const nebulae = bodies.filter(b => b.isNebula).length
  const darkMatter = bodies.filter(b => b.isDarkMatter).length
  const pulsars = bodies.filter(b => b.isPulsar).length
  const binarySystems = bodies.filter(b => b.isBinarySystem).length
  const habitableBodies = bodies.filter(b => b.habitableZone).length

  const avgLum = totalLuminosity / bodies.length
  const avgTemp = bodies.reduce((s, b) => s + b.temperature, 0) / bodies.length
  const cosmicBackground = Math.min(100, Math.max(0, Math.round((avgLum * 0.4 + (100 - avgTemp) * 0.3 + (100 - avgMagnitude) * 0.3))))

  return {
    totalLuminosity,
    totalMass,
    avgDistance,
    avgMagnitude,
    blackHoles,
    supernovae,
    nebulae,
    darkMatter,
    pulsars,
    binarySystems,
    habitableBodies,
    cosmicBackground,
  }
}

// ─── Identification Functions ────────────────────────────────────────────────

/**
 * Identify black holes - files that absorb everything
 * @example
 * identifyBlackHoles(bodies) // CelestialBody[]
 */
export function identifyBlackHoles(bodies: CelestialBody[]): CelestialBody[] {
  return bodies.filter(b => b.isBlackHole)
}

/**
 * Identify dark matter - hidden/unused code
 * @example
 * identifyDarkMatter(bodies) // CelestialBody[]
 */
export function identifyDarkMatter(bodies: CelestialBody[]): CelestialBody[] {
  return bodies.filter(b => b.isDarkMatter)
}

/**
 * Identify supernovae - recently refactored/explosive
 * @example
 * identifySupernovae(bodies) // CelestialBody[]
 */
export function identifySupernovae(bodies: CelestialBody[]): CelestialBody[] {
  return bodies.filter(b => b.isSupernova)
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate recommendations for improving the cosmos
 * @example
 * generateObservatoryDomeRecommendations(bodies, constellations, stats) // string[]
 */
export function generateObservatoryDomeRecommendations(
  _bodies: CelestialBody[],
  _constellations: Constellation[],
  stats: ObservatoryDomeStats,
): string[] {
  const recs: string[] = []

  if (stats.blackHoles > 0) recs.push(`${stats.blackHoles} black hole(s) detected - refactor to reduce gravitational pull`)
  if (stats.darkMatter > 0) recs.push(`${stats.darkMatter} dark matter file(s) found - illuminate or remove unused code`)
  if (stats.supernovae > 0) recs.push(`${stats.supernovae} supernova(e) detected - stabilize explosive code`)
  if (stats.binarySystems > 0) recs.push(`${stats.binarySystems} binary system(s) found - consider decoupling tightly paired files`)
  if (stats.avgLuminosity < 30) recs.push('Low average luminosity - improve code visibility and documentation')
  if (stats.avgTemperature > 60) recs.push('High cosmic temperature - reduce complexity across the codebase')
  if (stats.nebulae > 2) recs.push(`${stats.nebulae} nebula(e) forming - clarify incomplete code structures`)
  if (stats.cosmicBackground < 30) recs.push('Low cosmic background radiation - overall code quality needs improvement')

  const dyingConstellations = _constellations.filter(c => c.health === 'dying' || c.health === 'dead')
  if (dyingConstellations.length > 0) recs.push(`${dyingConstellations.length} dying constellation(s) need attention`)

  if (recs.length === 0) recs.push('Clear skies ahead - excellent cosmic observation across the codebase')
  return recs
}

// ─── Build Result ────────────────────────────────────────────────────────────

/**
 * Build the complete observatory dome analysis result
 * @example
 * buildObservatoryDomeResult(files, contents, {}) // ObservatoryDomeResult
 */
export function buildObservatoryDomeResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown>,
): ObservatoryDomeResult {
  const importMap = buildImportMap(files, contents)
  const dependentMap = buildDependentMap(files, importMap)

  const bodies: CelestialBody[] = []
  for (let i = 0; i < files.length; i++) {
    const fileImports = importMap.get(files[i] ?? '') ?? []
    const fileDependents = dependentMap.get(files[i] ?? '') ?? []
    bodies.push(analyzeCelestialBody(contents[i] ?? '',files[i] ?? '', fileImports, fileDependents))
  }

  const dirMap = new Map<string, CelestialBody[]>()
  for (const body of bodies) {
    const existing = dirMap.get(body.constellation)
    if (existing) existing.push(body)
    else dirMap.set(body.constellation, [body])
  }

  const constellations: Constellation[] = []
  for (const [dir, dirBodies] of dirMap) {
    constellations.push(analyzeConstellation(dirBodies, dir))
  }

  const cosmicMap = buildCosmicMap(bodies, constellations)
  const stats = computeStats(bodies, constellations, cosmicMap)
  const recommendations = generateObservatoryDomeRecommendations(bodies, constellations, stats)

  return { bodies, constellations, cosmicMap, stats, recommendations }
}

function buildImportMap(files: string[], contents: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (let i = 0; i < files.length; i++) {
    const matches = (contents[i] ?? '').matchAll(IMPORT_RE)
    const importedPaths: string[] = []
    for (const m of matches) {
if (m[1] !== undefined) importedPaths.push(m[1])
    }
    map.set(files[i] ?? '', importedPaths)
  }
  return map
}

function buildDependentMap(files: string[], importMap: Map<string, string[]>): Map<string, string[]> {
  const depMap = new Map<string, string[]>()
  for (const file of files) {
    depMap.set(file, [])
  }
  for (const [file, imports] of importMap) {
    for (const imp of imports) {
      for (const otherFile of files) {
        if (otherFile !== file && (otherFile.endsWith(imp) || otherFile.includes(imp.replace(/^\.\//, '')))) {
          const deps = depMap.get(otherFile)
          if (deps) deps.push(file)
        }
      }
    }
  }
  return depMap
}

function computeStats(bodies: CelestialBody[], constellations: Constellation[], cosmicMap: CosmicMap): ObservatoryDomeStats {
  const totalFiles = bodies.length
  const totalConstellations = constellations.length

  const stars = bodies.filter(b => b.bodyType === 'star').length
  const planets = bodies.filter(b => b.bodyType === 'planet').length
  const moons = bodies.filter(b => b.bodyType === 'moon').length
  const blackHoles = bodies.filter(b => b.isBlackHole).length
  const supernovae = bodies.filter(b => b.isSupernova).length
  const nebulae = bodies.filter(b => b.isNebula).length
  const darkMatter = bodies.filter(b => b.isDarkMatter).length
  const pulsars = bodies.filter(b => b.isPulsar).length
  const binarySystems = bodies.filter(b => b.isBinarySystem).length

  const avgLuminosity = totalFiles > 0 ? Math.round(bodies.reduce((s, b) => s + b.luminosity, 0) / totalFiles) : 0
  const avgMagnitude = totalFiles > 0 ? Math.round(bodies.reduce((s, b) => s + b.magnitude, 0) / totalFiles) : 0
  const avgDistance = totalFiles > 0 ? Math.round(bodies.reduce((s, b) => s + b.distance, 0) / totalFiles) : 0
  const avgTemperature = totalFiles > 0 ? Math.round(bodies.reduce((s, b) => s + b.temperature, 0) / totalFiles) : 0

  const dominantSpectralType = totalFiles > 0 ? findDominant(bodies.map(b => b.spectralType)) : 'M'
  const dominantBodyType = totalFiles > 0 ? findDominant(bodies.map(b => b.bodyType)) : 'asteroid'

  const sortedByLum = [...bodies].sort((a, b) => b.luminosity - a.luminosity)
  const brightestBody = sortedByLum.length > 0 ? (sortedByLum[0] ?? { file: '' }).file : 'none'
  const dimmestBody = sortedByLum.length > 0 ? sortedByLum[sortedByLum.length - 1]?.file : 'none'

  const sortedByMass = [...bodies].sort((a, b) => b.mass - a.mass)
  const heaviestBody = sortedByMass.length > 0 ? (sortedByMass[0] ?? { file: '' }).file : 'none'

  const sortedByInfluence = [...bodies].sort((a, b) => b.influencedBy.length - a.influencedBy.length)
  const mostInfluential = sortedByInfluence.length > 0 ? (sortedByInfluence[0] ?? { file: '' }).file : 'none'

  const gravitationalCenter = findGlobalGravitationalCenter(bodies)

  const cosmicBackground = cosmicMap.cosmicBackground
  const galaxyType = classifyGalaxyType(avgLuminosity, totalFiles, avgDistance, blackHoles)
  const observationGrade = classifyObservationGrade(cosmicBackground)

  return {
    totalFiles,
    totalConstellations,
    stars,
    planets,
    moons,
    blackHoles,
    supernovae,
    nebulae,
    darkMatter,
    pulsars,
    binarySystems,
    avgLuminosity,
    avgMagnitude,
    avgDistance,
    avgTemperature,
    dominantSpectralType,
    dominantBodyType,
    brightestBody,
    dimmestBody: dimmestBody ?? '',
    heaviestBody,
    mostInfluential,
    gravitationalCenter,
    cosmicBackground,
    galaxyType,
    observationGrade,
  }
}

function findGlobalGravitationalCenter(bodies: CelestialBody[]): string {
  if (bodies.length === 0) return 'none'
  let best = bodies[0]
  let maxScore = -1
  for (const b of bodies) {
    const score = b.gravity + b.influencedBy.length * 5 + b.luminosity
    if (score > maxScore) { maxScore = score; best = b }
  }
  return best?.file ?? ''
}
