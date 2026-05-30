// ─── Interfaces ──────────────────────────────────────────

export interface BodyMeasure {
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'black-hole'
  mass: number
  density: number
  luminosity: number
  temperature: number
  age: number
  isStable: boolean
  isCollapsing: boolean
}

export interface OrbitMeasure {
  semiMajorAxis: number
  eccentricity: number
  inclination: number
  isStable: boolean
  isDecaying: boolean
  isEscaping: boolean
  isCircular: boolean
  isElliptical: boolean
  period: number
}

export interface GravityMeasure {
  pull: number
  push: number
  netForce: number
  hasStrongPull: boolean
  hasStrongPush: boolean
  isBalanced: boolean
  hasAccretionDisk: boolean
  accretionCount: number
  satelliteCount: number
}

export interface EscapeMeasure {
  velocity: number
  isEasyToEscape: boolean
  isHardToEscape: boolean
  isLocked: boolean
  hasTrojanPoints: boolean
  trojanCount: number
}

export interface TidalMeasure {
  force: number
  hasTidalLocking: boolean
  hasTidalHeating: boolean
  hasRocheLimit: boolean
  hasTidalBulge: boolean
  isTidallyLocked: boolean
}

export interface HorizonMeasure {
  radius: number
  hasSingularity: boolean
  hasErgosphere: boolean
  isApproaching: boolean
  isReceding: boolean
  hasHawkingRadiation: boolean
  singularityRisk: number
}

export interface LensingMeasure {
  distortion: number
  hasGravitationalLensing: boolean
  hasEinsteinRing: boolean
  hasMicrolensing: boolean
  hasStrongLensing: boolean
  isLensingOthers: boolean
  lensingTargets: number
}

export interface CelestialBody {
  file: string
  gravitationalMass: number
  orbitalStability: number
  escapeVelocity: number
  tidalForce: number
  eventHorizon: number
  gravitationalLensing: number
  body: BodyMeasure
  orbit: OrbitMeasure
  gravity: GravityMeasure
  escape: EscapeMeasure
  tidal: TidalMeasure
  horizon: HorizonMeasure
  lensing: LensingMeasure
  condition: 'stable-star' | 'healthy-planet' | 'tidal-moon' | 'wandering-asteroid' | 'black-hole' | 'dark-matter'
  qualityScore: number
}

export interface StarSystem {
  directory: string
  bodies: CelestialBody[]
  avgOrbitalStability: number
  avgEscapeVelocity: number
  starCount: number
  blackHoleCount: number
  stableCount: number
  lockedCount: number
  systemType: 'binary-system' | 'solar-system' | 'cluster' | 'galaxy-arm' | 'debris-field' | 'void'
  condition: 'well-ordered-system' | 'stable-system' | 'functional-system' | 'chaotic-system' | 'collapsing-system' | 'void'
}

export interface UniverseMeasure {
  avgOrbitalStability: number
  avgEscapeVelocity: number
  avgTidalForce: number
  isStable: boolean
  overallStability: number
}

export interface GravityWellStats {
  totalFiles: number
  totalSystems: number
  avgGravitationalMass: number
  avgOrbitalStability: number
  avgEscapeVelocity: number
  avgTidalForce: number
  avgEventHorizon: number
  avgGravitationalLensing: number
  stableStarCount: number
  healthyPlanetCount: number
  tidalMoonCount: number
  wanderingAsteroidCount: number
  blackHoleCount: number
  darkMatterCount: number
  starTypeCount: number
  planetTypeCount: number
  blackHoleTypeCount: number
  hasStrongPullCount: number
  isLockedCount: number
  hasAccretionDiskCount: number
  hasSingularityCount: number
  isApproachingCount: number
  hasStrongLensingCount: number
  isBalancedCount: number
  isStableOrbitCount: number
  isTidallyLockedCount: number
  overallStability: number
  astrophysicistGrade: 'nobel-laureate' | 'astrophysicist' | 'astronomer' | 'stargazer' | 'amateur' | 'flat-earther'
  mostMassive: string
  mostStable: string
  hardestToEscape: string
  strongestGravity: string
  mostDistorting: string
}

export interface GravityWellResult {
  bodies: CelestialBody[]
  systems: StarSystem[]
  universe: UniverseMeasure
  stats: GravityWellStats
  recommendations: string[]
}

// ─── Utility helpers ────────────────────────────────────

export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

export function countFunctions(content: string): number {
  const m = content.match(/\bfunction\s+\w+|\b\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|(?:async\s+)?\([^)]*\)\s*:\s*\w+)/g)
  return m ? m.length : 0
}

export function countClasses(content: string): number {
  const m = content.match(/\bclass\s+\w+/g)
  return m ? m.length : 0
}

export function countInterfaces(content: string): number {
  const m = content.match(/\binterface\s+\w+/g)
  return m ? m.length : 0
}

export function countExports(content: string): number {
  const m = content.match(/^export\s/gm)
  return m ? m.length : 0
}

export function countImports(content: string): number {
  const m = content.match(/^import\s/gm)
  return m ? m.length : 0
}

export function countJSDoc(content: string): number {
  const m = content.match(/\/\*\*[\s\S]*?\*\//g)
  return m ? m.length : 0
}

export function countComments(content: string): number {
  const line = (content.match(/\/\/.*/g) || []).length
  const block = (content.match(/\/\*[\s\S]*?\*\//g) || []).length
  return line + block
}

export function countErrorHandling(content: string): number {
  const m = content.match(/\b(catch|finally|throw)\b/g)
  return m ? m.length : 0
}

export function countTypeAnnotations(content: string): number {
  const m = content.match(/:\s*(?:number|string|boolean|void|any|unknown|never|object)\b/g)
  return m ? m.length : 0
}

export function countTodos(content: string): number {
  const m = content.match(/\bTODO\b/gi)
  return m ? m.length : 0
}

export function countConsole(content: string): number {
  const m = content.match(/\bconsole\.\w+/g)
  return m ? m.length : 0
}

export function countBranches(content: string): number {
  const ifs = (content.match(/\bif\b/g) || []).length
  const switches = (content.match(/\bswitch\b/g) || []).length
  const ternaries = (content.match(/\?[^:]*:/g) || []).length
  return ifs + switches + ternaries
}

export function countDescriptiveNames(content: string): number {
  const m = content.match(/\b(?:get|set|is|has|can|should|will|compute|calculate|validate|parse|format|transform|process|handle|build|create|generate|extract|resolve|initialize|configure|update|remove|delete|find|search|check|verify|ensure|assert)\w+/gi)
  return m ? m.length : 0
}

export function countAsync(content: string): number {
  const m = content.match(/\basync\b/g)
  return m ? m.length : 0
}

export function countAny(content: string): number {
  const m = content.match(/:\s*any\b/g)
  return m ? m.length : 0
}

export function countReturnTypes(content: string): number {
  const m = content.match(/\)\s*:\s*\w+/g)
  return m ? m.length : 0
}

export function countNestingDepth(content: string): number {
  let maxDepth = 0
  let currentDepth = 0
  for (const ch of content) {
    if (ch === '{' || ch === '(' || ch === '[') {
      currentDepth++
      if (currentDepth > maxDepth) maxDepth = currentDepth
    } else if (ch === '}' || ch === ')' || ch === ']') {
      currentDepth = Math.max(0, currentDepth - 1)
    }
  }
  return maxDepth
}

export function countDeprecated(content: string): number {
  const m = content.match(/\bdeprecated\b|\@deprecated/gi)
  return m ? m.length : 0
}

// ─── Body Measurement ───────────────────────────────────

/**
 * Measure code as a celestial body
 * @example
 * measureBody(codeString) // { type, mass, density, luminosity, ... }
 */
export function measureBody(content: string): BodyMeasure {
  const loc = countLoc(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)
  const interfaces = countInterfaces(content)
  const exports = countExports(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)

  const mass = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 5) +
    (classes * 10) +
    (interfaces * 8) +
    (loc > 20 ? 10 : 0) +
    (exports * 3),
  )))

  const density = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 20 : 0) +
    (interfaces > 0 ? 15 : 0) +
    (jsdoc > 0 ? 15 : 0) +
    (errors > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 15 : 0) +
    (countReturnTypes(content) > 0 ? 10 : 0) +
    (exports > 0 ? 10 : 0),
  )))

  const luminosity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports * 15) +
    (jsdoc > 0 ? 15 : 0) +
    (countDescriptiveNames(content) > 0 ? 10 : 0) +
    (types > 0 ? 10 : 0),
  )))

  const temperature = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (functions * 8) +
    (countAsync(content) * 10) +
    (countBranches(content) * 3) +
    (errors * 5),
  )))

  const age = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countTodos(content) * 15) +
    (countDeprecated(content) * 20) +
    (countAny(content) * 10) +
    (loc > 50 ? 10 : 0) +
    (countComments(content) === 0 && loc > 10 ? 10 : 0),
  )))

  const isStable = density >= 50 && countTodos(content) === 0
  const isCollapsing = countDeprecated(content) > 0 || countTodos(content) > 3
  const imports = countImports(content)

  let type: BodyMeasure['type'] = 'asteroid'
  if (mass >= 60 && exports > 2 && isStable) type = 'star'
  else if (mass >= 40 && (classes > 0 || interfaces > 0)) type = 'planet'
  else if (mass >= 20 && functions > 0) type = 'moon'
  else if (countAny(content) > 0 || countNestingDepth(content) > 5) type = 'black-hole'
  else if (loc > 0 && exports === 0 && imports === 0) type = 'comet'
  else type = 'asteroid'

  return {
    type,
    mass,
    density,
    luminosity,
    temperature,
    age,
    isStable,
    isCollapsing,
  }
}

// ─── Orbit Measurement ──────────────────────────────────

/**
 * Measure dependency orbit characteristics
 * @example
 * measureOrbit(codeString) // { semiMajorAxis, eccentricity, isStable, ... }
 */
export function measureOrbit(content: string): OrbitMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const types = countTypeAnnotations(content)
  const jsdoc = countJSDoc(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)

  const semiMajorAxis = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports * 10) +
    (exports * 5) +
    (branches * 3),
  )))

  const eccentricity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.abs(
    Math.round((imports - exports) * 15),
  )))

  const inclination = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 25 : 0) +
    (jsdoc > 0 ? 25 : 0) +
    (errors > 0 ? 25 : 0) +
    (countInterfaces(content) > 0 ? 25 : 0),
  )))

  const isStable = inclination >= 50 && countTodos(content) === 0
  const isDecaying = countTodos(content) > 0 || countDeprecated(content) > 0
  const isEscaping = imports === 0 && exports === 0 && loc > 0
  const isCircular = Math.abs(imports - exports) <= 1
  const isElliptical = !isCircular && (imports > 0 || exports > 0)

  const period = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (countAsync(content) * 10) +
    (branches * 3) +
    (countConsole(content) * 5),
  )))

  return {
    semiMajorAxis,
    eccentricity,
    inclination,
    isStable,
    isDecaying,
    isEscaping,
    isCircular,
    isElliptical,
    period,
  }
}

// ─── Gravity Measurement ────────────────────────────────

/**
 * Measure coupling gravity forces
 * @example
 * measureGravity(codeString) // { pull, push, netForce, ... }
 */
export function measureGravity(content: string): GravityMeasure {
  const loc = countLoc(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const classes = countClasses(content)

  const pull = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (exports * 12) +
    (functions > 0 ? 10 : 0) +
    (classes > 0 ? 10 : 0) +
    (countJSDoc(content) > 0 ? 10 : 0),
  )))

  const push = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (imports * 12) +
    (countAsync(content) > 0 ? 10 : 0) +
    (countAny(content) * 15),
  )))

  const netForce = Math.abs(pull - push)

  const hasStrongPull = pull >= 50
  const hasStrongPush = push >= 50
  const isBalanced = netForce <= 15

  const accretionCount = exports + countInterfaces(content)
  const satelliteCount = exports

  const hasAccretionDisk = accretionCount > 3

  return {
    pull,
    push,
    netForce,
    hasStrongPull,
    hasStrongPush,
    isBalanced,
    hasAccretionDisk,
    accretionCount,
    satelliteCount,
  }
}

// ─── Escape Measurement ─────────────────────────────────

/**
 * Measure decoupling difficulty like escape velocity
 * @example
 * measureEscape(codeString) // { velocity, isEasyToEscape, ... }
 */
export function measureEscape(content: string): EscapeMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const nesting = countNestingDepth(content)
  const branches = countBranches(content)
  const anys = countAny(content)

  const velocity = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting * 8) +
    (branches * 3) +
    (imports > 3 ? 15 : 0) +
    (anys * 15) +
    (exports === 0 && loc > 10 ? 10 : 0),
  )))

  const isEasyToEscape = velocity < 25 && loc > 0
  const isHardToEscape = velocity >= 60
  const isLocked = velocity >= 80

  const trojanCount = countErrorHandling(content) + countInterfaces(content)
  const hasTrojanPoints = trojanCount > 0

  return {
    velocity,
    isEasyToEscape,
    isHardToEscape,
    isLocked,
    hasTrojanPoints,
    trojanCount,
  }
}

// ─── Tidal Measurement ──────────────────────────────────

/**
 * Measure coupling stress like tidal forces
 * @example
 * measureTidal(codeString) // { force, hasTidalLocking, ... }
 */
export function measureTidal(content: string): TidalMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const anys = countAny(content)
  const todos = countTodos(content)
  const nesting = countNestingDepth(content)

  const force = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (anys * 20) +
    (todos * 10) +
    (nesting > 4 ? 15 : 0) +
    (Math.abs(imports - exports) * 8) +
    (countConsole(content) * 5),
  )))

  const hasTidalLocking = imports > 0 && exports > 0 && Math.abs(imports - exports) <= 1
  const hasTidalHeating = nesting > 3 && countBranches(content) > 5
  const hasRocheLimit = force >= 60
  const hasTidalBulge = imports > exports * 2 || exports > imports * 2
  const isTidallyLocked = imports > 0 && exports === 0

  return {
    force,
    hasTidalLocking,
    hasTidalHeating,
    hasRocheLimit,
    hasTidalBulge,
    isTidallyLocked,
  }
}

// ─── Horizon Measurement ────────────────────────────────

/**
 * Measure coupling depth like an event horizon
 * @example
 * measureHorizon(codeString) // { radius, hasSingularity, ... }
 */
export function measureHorizon(content: string): HorizonMeasure {
  const loc = countLoc(content)
  const nesting = countNestingDepth(content)
  const anys = countAny(content)
  const imports = countImports(content)

  const radius = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (nesting * 10) +
    (anys * 15) +
    (imports > 5 ? 15 : 0) +
    (countTodos(content) > 0 ? 10 : 0) +
    (countBranches(content) > 8 ? 10 : 0),
  )))

  const singularityRisk = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (anys * 25) +
    (nesting > 5 ? 20 : 0) +
    (countDeprecated(content) * 15) +
    (countNestingDepth(content) > 7 ? 15 : 0),
  )))

  const hasSingularity = singularityRisk >= 60
  const hasErgosphere = radius >= 40 && nesting > 3
  const isApproaching = countTodos(content) > 0 || countDeprecated(content) > 0
  const isReceding = countJSDoc(content) > 0 && anys === 0 && countTodos(content) === 0
  const hasHawkingRadiation = isApproaching && countJSDoc(content) > 0

  return {
    radius,
    hasSingularity,
    hasErgosphere,
    isApproaching,
    isReceding,
    hasHawkingRadiation,
    singularityRisk,
  }
}

// ─── Lensing Measurement ────────────────────────────────

/**
 * Measure coupling distortion like gravitational lensing
 * @example
 * measureLensing(codeString) // { distortion, hasGravitationalLensing, ... }
 */
export function measureLensing(content: string): LensingMeasure {
  const loc = countLoc(content)
  const imports = countImports(content)
  const exports = countExports(content)
  const anys = countAny(content)
  const nesting = countNestingDepth(content)

  const distortion = loc === 0 ? 0 : Math.min(100, Math.max(0, Math.round(
    (anys * 15) +
    (Math.abs(imports - exports) * 8) +
    (nesting > 4 ? 10 : 0) +
    (countTodos(content) * 5) +
    (countConsole(content) * 5),
  )))

  const hasGravitationalLensing = distortion > 0
  const hasEinsteinRing = imports === exports && imports > 0 && distortion === 0
  const hasMicrolensing = distortion > 0 && distortion < 20
  const hasStrongLensing = distortion >= 40

  const lensingTargets = imports + exports
  const isLensingOthers = exports > 3 && distortion > 0

  return {
    distortion,
    hasGravitationalLensing,
    hasEinsteinRing,
    hasMicrolensing,
    hasStrongLensing,
    isLensingOthers,
    lensingTargets,
  }
}

// ─── Celestial Body Analysis ────────────────────────────

/**
 * Analyze a single file as a celestial body
 * @example
 * analyzeCelestialBody(content, filePath) // CelestialBody
 */
export function analyzeCelestialBody(content: string, filePath: string): CelestialBody {
  const body = measureBody(content)
  const orbit = measureOrbit(content)
  const gravity = measureGravity(content)
  const escape = measureEscape(content)
  const tidal = measureTidal(content)
  const horizon = measureHorizon(content)
  const lensing = measureLensing(content)

  const gravitationalMass = body.mass
  const orbitalStability = orbit.inclination
  const escapeVelocity = escape.velocity
  const tidalForce = tidal.force
  const eventHorizon = horizon.radius
  const gravitationalLensing = lensing.distortion

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    (gravitationalMass * 0.15) +
    (orbitalStability * 0.2) +
    ((100 - escapeVelocity) * 0.15) +
    (body.density * 0.15) +
    (body.luminosity * 0.1) +
    ((100 - tidalForce) * 0.1) +
    ((100 - gravitationalLensing) * 0.05) +
    (body.isStable ? 10 : 0),
  )))

  const condition = classifyBodyCondition(qualityScore, body, escape)

  return {
    file: filePath,
    gravitationalMass,
    orbitalStability,
    escapeVelocity,
    tidalForce,
    eventHorizon,
    gravitationalLensing,
    body,
    orbit,
    gravity,
    escape,
    tidal,
    horizon,
    lensing,
    condition,
    qualityScore,
  }
}

/**
 * Classify body condition
 * @example
 * classifyBodyCondition(90, body, escape) // 'stable-star'
 */
export function classifyBodyCondition(
  score: number,
  body: BodyMeasure,
  escape: EscapeMeasure,
): CelestialBody['condition'] {
  if (score >= 80 && body.isStable && body.type === 'star') return 'stable-star'
  if (score >= 65 && !escape.isLocked) return 'healthy-planet'
  if (score >= 45) return 'tidal-moon'
  if (score >= 25 && !escape.isLocked) return 'wandering-asteroid'
  if (escape.isLocked || body.type === 'black-hole') return 'black-hole'
  return 'dark-matter'
}

// ─── Star System Analysis ───────────────────────────────

/**
 * Analyze a directory as a star system
 * @example
 * analyzeStarSystem(bodies, dirPath) // StarSystem
 */
export function analyzeStarSystem(bodies: CelestialBody[], dirPath: string): StarSystem {
  const count = bodies.length
  if (count === 0) {
    return {
      directory: dirPath,
      bodies: [],
      avgOrbitalStability: 0,
      avgEscapeVelocity: 0,
      starCount: 0,
      blackHoleCount: 0,
      stableCount: 0,
      lockedCount: 0,
      systemType: 'void',
      condition: 'void',
    }
  }

  const avg = (fn: (b: CelestialBody) => number) =>
    Math.round(bodies.reduce((s, b) => s + fn(b), 0) / count)

  const avgOrbitalStability = avg(b => b.orbitalStability)
  const avgEscapeVelocity = avg(b => b.escapeVelocity)

  const starCount = bodies.filter(b => b.body.type === 'star').length
  const blackHoleCount = bodies.filter(b => b.body.type === 'black-hole').length
  const stableCount = bodies.filter(b => b.condition === 'stable-star').length
  const lockedCount = bodies.filter(b => b.escape.isLocked).length

  const systemType = classifySystemType(bodies)
  const condition = classifySystemCondition(avgOrbitalStability)

  return {
    directory: dirPath,
    bodies,
    avgOrbitalStability,
    avgEscapeVelocity,
    starCount,
    blackHoleCount,
    stableCount,
    lockedCount,
    systemType,
    condition,
  }
}

/**
 * Classify star system type
 * @example
 * classifySystemType(bodies) // 'solar-system'
 */
export function classifySystemType(bodies: CelestialBody[]): StarSystem['systemType'] {
  if (bodies.length === 0) return 'void'
  const starRatio = bodies.filter(b => b.body.type === 'star').length / bodies.length
  const avgMass = bodies.reduce((s, b) => s + b.gravitationalMass, 0) / bodies.length

  if (starRatio >= 0.5 && avgMass >= 50) return 'binary-system'
  if (avgMass >= 40) return 'solar-system'
  if (avgMass >= 25) return 'cluster'
  if (avgMass >= 15) return 'galaxy-arm'
  if (avgMass >= 5) return 'debris-field'
  return 'void'
}

/**
 * Classify system condition based on orbital stability
 * @example
 * classifySystemCondition(80) // 'well-ordered-system'
 */
export function classifySystemCondition(avgStability: number): StarSystem['condition'] {
  if (avgStability >= 75) return 'well-ordered-system'
  if (avgStability >= 60) return 'stable-system'
  if (avgStability >= 45) return 'functional-system'
  if (avgStability >= 30) return 'chaotic-system'
  if (avgStability >= 15) return 'collapsing-system'
  return 'void'
}

// ─── Astrophysicist Grade ───────────────────────────────

/**
 * Classify astrophysicist grade based on stability
 * @example
 * classifyAstrophysicistGrade(85) // 'nobel-laureate'
 */
export function classifyAstrophysicistGrade(avgStability: number): GravityWellStats['astrophysicistGrade'] {
  if (avgStability >= 80) return 'nobel-laureate'
  if (avgStability >= 65) return 'astrophysicist'
  if (avgStability >= 50) return 'astronomer'
  if (avgStability >= 35) return 'stargazer'
  if (avgStability >= 20) return 'amateur'
  return 'flat-earther'
}

// ─── Recommendations ────────────────────────────────────

/**
 * Generate recommendations for the gravity well
 * @example
 * generateRecommendations(bodies, systems, universe, stats) // ['Reduce escape velocity...']
 */
export function generateRecommendations(
  _bodies: CelestialBody[],
  _systems: StarSystem[],
  _universe: UniverseMeasure,
  stats: GravityWellStats,
): string[] {
  const recs: string[] = []

  if (stats.blackHoleCount > 0) {
    recs.push('Break free from black holes: reduce any types and deep nesting to decouple modules')
  }
  if (stats.avgEscapeVelocity > 60) {
    recs.push('Reduce escape velocity: simplify dependencies to make modules easier to decouple')
  }
  if (stats.hasSingularityCount > 0) {
    recs.push('Eliminate singularities: refactor infinitely coupled code into well-defined interfaces')
  }
  if (stats.isTidallyLockedCount > stats.totalFiles * 0.3) {
    recs.push('Break tidal locks: add exports to modules that only import')
  }
  if (stats.hasStrongLensingCount > stats.totalFiles * 0.3) {
    recs.push('Reduce gravitational lensing: balance imports and exports to minimize distortion')
  }
  if (stats.wanderingAsteroidCount > 0) {
    recs.push('Capture wandering asteroids: add documentation and types to disconnected modules')
  }

  if (recs.length === 0) {
    recs.push('Maintain current orbital mechanics for a stable codebase')
  }

  return recs
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Build the full gravity well result
 * @example
 * buildGravityWellResult(files, contents, {}) // GravityWellResult
 */
export function buildGravityWellResult(
  files: string[],
  contents: string[],
  _options: Record<string, unknown> = {},
): GravityWellResult {
  const bodies: CelestialBody[] = files.map((file, i) =>
    analyzeCelestialBody(contents[i] ?? '', file),
  )

  const systemMap = new Map<string, CelestialBody[]>()
  for (const body of bodies) {
    const dir = body.file.includes('/') ? body.file.substring(0, body.file.lastIndexOf('/')) : '.'
    const existing = systemMap.get(dir)
    if (existing) {
      existing.push(body)
    } else {
      systemMap.set(dir, [body])
    }
  }

  const systems: StarSystem[] = Array.from(systemMap.entries()).map(([dir, dirBodies]) =>
    analyzeStarSystem(dirBodies, dir),
  )

  const totalFiles = bodies.length
  const avg = (fn: (b: CelestialBody) => number) =>
    totalFiles === 0 ? 0 : Math.round(bodies.reduce((s, b) => s + fn(b), 0) / totalFiles)

  const overallStability = avg(b => b.qualityScore)

  const universe: UniverseMeasure = {
    avgOrbitalStability: avg(b => b.orbitalStability),
    avgEscapeVelocity: avg(b => b.escapeVelocity),
    avgTidalForce: avg(b => b.tidalForce),
    isStable: avg(b => b.orbitalStability) >= 60,
    overallStability,
  }

  const mostMassive = totalFiles > 0
    ? bodies.reduce((best, b) => b.gravitationalMass > best.gravitationalMass ? b : best, bodies[0] as typeof bodies[number]).file
    : ''
  const mostStable = totalFiles > 0
    ? bodies.reduce((best, b) => b.orbitalStability > best.orbitalStability ? b : best, bodies[0] as typeof bodies[number]).file
    : ''
  const hardestToEscape = totalFiles > 0
    ? bodies.reduce((best, b) => b.escapeVelocity > best.escapeVelocity ? b : best, bodies[0] as typeof bodies[number]).file
    : ''
  const strongestGravity = totalFiles > 0
    ? bodies.reduce((best, b) => b.gravity.pull > best.gravity.pull ? b : best, bodies[0] as typeof bodies[number]).file
    : ''
  const mostDistorting = totalFiles > 0
    ? bodies.reduce((best, b) => b.gravitationalLensing > best.gravitationalLensing ? b : best, bodies[0] as typeof bodies[number]).file
    : ''

  const stats: GravityWellStats = {
    totalFiles,
    totalSystems: systems.length,
    avgGravitationalMass: avg(b => b.gravitationalMass),
    avgOrbitalStability: universe.avgOrbitalStability,
    avgEscapeVelocity: universe.avgEscapeVelocity,
    avgTidalForce: universe.avgTidalForce,
    avgEventHorizon: avg(b => b.eventHorizon),
    avgGravitationalLensing: avg(b => b.gravitationalLensing),
    stableStarCount: bodies.filter(b => b.condition === 'stable-star').length,
    healthyPlanetCount: bodies.filter(b => b.condition === 'healthy-planet').length,
    tidalMoonCount: bodies.filter(b => b.condition === 'tidal-moon').length,
    wanderingAsteroidCount: bodies.filter(b => b.condition === 'wandering-asteroid').length,
    blackHoleCount: bodies.filter(b => b.condition === 'black-hole').length,
    darkMatterCount: bodies.filter(b => b.condition === 'dark-matter').length,
    starTypeCount: bodies.filter(b => b.body.type === 'star').length,
    planetTypeCount: bodies.filter(b => b.body.type === 'planet').length,
    blackHoleTypeCount: bodies.filter(b => b.body.type === 'black-hole').length,
    hasStrongPullCount: bodies.filter(b => b.gravity.hasStrongPull).length,
    isLockedCount: bodies.filter(b => b.escape.isLocked).length,
    hasAccretionDiskCount: bodies.filter(b => b.gravity.hasAccretionDisk).length,
    hasSingularityCount: bodies.filter(b => b.horizon.hasSingularity).length,
    isApproachingCount: bodies.filter(b => b.horizon.isApproaching).length,
    hasStrongLensingCount: bodies.filter(b => b.lensing.hasStrongLensing).length,
    isBalancedCount: bodies.filter(b => b.gravity.isBalanced).length,
    isStableOrbitCount: bodies.filter(b => b.orbit.isStable).length,
    isTidallyLockedCount: bodies.filter(b => b.tidal.isTidallyLocked).length,
    overallStability,
    astrophysicistGrade: classifyAstrophysicistGrade(overallStability),
    mostMassive,
    mostStable,
    hardestToEscape,
    strongestGravity,
    mostDistorting,
  }

  const recommendations = generateRecommendations(bodies, systems, universe, stats)

  return { bodies, systems, universe, stats, recommendations }
}
