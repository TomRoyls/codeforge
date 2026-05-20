// ─── Types ─────────────────────────────────────────────────────────────────────

export type BodyClassification = 'star' | 'planet' | 'moon' | 'asteroid' | 'blackhole'
export type WellType = 'stable' | 'binary' | 'cluster' | 'chaotic'

export interface Orbiter {
  file: string
  distance: number
  orbitalSpeed: number
  tidalForce: number
  isStable: boolean
}

export interface GravitationalBody {
  file: string
  name: string
  mass: number
  gravitationalPull: number
  gravitationalField: number
  orbiters: Orbiter[]
  escapeVelocity: number
  classification: BodyClassification
}

export interface GravityWell {
  center: string
  bodies: string[]
  radius: number
  totalMass: number
  gravitationalStrength: number
  stability: number
  type: WellType
}

export interface GravityStats {
  totalBodies: number
  starCount: number
  blackholeCount: number
  wellCount: number
  stableWells: number
  chaoticWells: number
  strongestGravity: string
  deepestWell: string
  avgEscapeVelocity: number
  avgFieldStrength: number
  gravitationalConstant: number
  systemStability: number
}

export interface GravityResult {
  bodies: GravitationalBody[]
  wells: GravityWell[]
  stats: GravityStats
  recommendations: string[]
}

export interface GravityOptions {
  verbose?: boolean
}

// ─── Import Resolution ─────────────────────────────────────────────────────────

/**
 * Resolve an import path to a candidate file key.
 *
 * @example
 * resolveToKey('./helpers', 'src/commands/run.ts', ['src/commands/helpers.ts'])
 * // => 'src/commands/helpers.ts'
 */
export function resolveToKey(importPath: string, fromFile: string, allFiles: string[]): string | null {
  if (!importPath.startsWith('.')) return null
  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  const raw = dir ? `${dir}/${importPath}` : importPath
  const segments = raw.split('/')
  const normalized: string[] = []
  for (const seg of segments) {
    if (seg === '..') normalized.pop()
    else if (seg !== '.') normalized.push(seg)
  }
  const base = normalized.join('/')
  const candidates: string[] = []
  for (const ext of ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
    candidates.push(base + ext)
  }
  for (const c of candidates) {
    if (allFiles.includes(c)) return c
  }
  return null
}

/**
 * Extract import targets from file content.
 *
 * @example
 * extractImportTargets("import { x } from './utils'", 'app.ts', allFiles)
 * // => ['utils.ts']
 */
export function extractImportTargets(content: string, file: string, allFiles: string[]): string[] {
  const re = /from\s+['"]([^'"]+)['"]/g
  const targets: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    const resolved = resolveToKey(match[1], file, allFiles)
    if (resolved) targets.push(resolved)
  }
  return targets
}

// ─── Core Computations ─────────────────────────────────────────────────────────

/**
 * Compute gravitational pull (how many files import this one).
 *
 * @example
 * computeGravitationalPull('core.ts', allContents) // => 5
 */
export function computeGravitationalPull(file: string, files: string[], contents: string[]): number {
  let pull = 0
  for (let i = 0; i < files.length; i++) {
    if (files[i] === file) continue
    const targets = extractImportTargets(contents[i], files[i], files)
    if (targets.includes(file)) pull++
  }
  return pull
}

/**
 * Compute gravitational field strength (pull × average import coupling).
 *
 * @example
 * computeGravitationalField(5, imports) // => 15
 */
export function computeGravitationalField(pull: number, importerContents: string[]): number {
  if (pull === 0 || importerContents.length === 0) return 0
  let totalCoupling = 0
  for (const c of importerContents) {
    const importLines = (c.match(/import\s+/g) ?? []).length
    const lines = c.split('\n').length
    totalCoupling += lines > 0 ? importLines / lines : 0
  }
  return Math.round(pull * (totalCoupling / importerContents.length) * 100)
}

/**
 * Find orbiters (files that import from this file).
 *
 * @example
 * findOrbiters('core.ts', files, contents) // => [{ file: 'app.ts', ... }]
 */
export function findOrbiters(file: string, files: string[], contents: string[]): Orbiter[] {
  const orbiters: Orbiter[] = []
  for (let i = 0; i < files.length; i++) {
    if (files[i] === file) continue
    const targets = extractImportTargets(contents[i], files[i], files)
    if (targets.includes(file)) {
      const distance = 1
      const tidalForce = computeTidalForce(file, files[i], contents[i])
      const isStable = tidalForce < 0.5
      orbiters.push({
        file: files[i],
        distance,
        orbitalSpeed: contents[i].split('\n').length,
        tidalForce,
        isStable,
      })
    }
  }
  return orbiters
}

/**
 * Compute escape velocity (how hard to decouple from this file).
 *
 * @example
 * computeEscapeVelocity(15, 8) // => 75
 */
export function computeEscapeVelocity(pull: number, orbiterCount: number): number {
  const baseVelocity = Math.min(60, pull * 3)
  const orbiterBonus = Math.min(40, orbiterCount * 5)
  return Math.min(100, Math.round(baseVelocity + orbiterBonus))
}

/**
 * Compute tidal force (coupling intensity between two files).
 *
 * @example
 * computeTidalForce('core.ts', 'app.ts', content) // => 0.35
 */
export function computeTidalForce(targetFile: string, _orbiterFile: string, orbiterContent: string): number {
  const totalImports = (orbiterContent.match(/from\s+['"]([^'"]+)['"]/g) ?? []).length
  if (totalImports === 0) return 0
  const targetImports = (orbiterContent.match(new RegExp(`from\\s+['"][^'"]*${escapeRegex(targetFile.replace(/\.\w+$/, ''))}`, 'g')) ?? []).length
  return Math.min(1, targetImports / totalImports)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Classification ────────────────────────────────────────────────────────────

/**
 * Classify a body based on mass, pull, and orbiter count.
 *
 * @example
 * classifyBody(500, 25, 20) // => 'blackhole'
 * classifyBody(100, 5, 8)   // => 'star'
 * classifyBody(50, 1, 0)    // => 'asteroid'
 */
export function classifyBody(mass: number, pull: number, orbiterCount: number): BodyClassification {
  if (pull > 20) return 'blackhole'
  if (pull > 10) return 'star'
  if (pull >= 3) return 'planet'
  if (pull >= 1 && orbiterCount === 0) return 'moon'
  if (pull >= 1) return 'planet'
  return 'asteroid'
}

// ─── Gravity Wells ─────────────────────────────────────────────────────────────

/**
 * Identify gravity wells from bodies.
 *
 * @example
 * identifyGravityWells(bodies) // => [{ center: 'core.ts', bodies: [...], ... }]
 */
export function identifyGravityWells(bodies: GravitationalBody[]): GravityWell[] {
  const wells: GravityWell[] = []

  const centers = bodies.filter(b => b.orbiters.length >= 3)
  for (const center of centers) {
    const wellBodies = [center.file, ...center.orbiters.map(o => o.file)]
    const totalMass = wellBodies.reduce((sum, f) => {
      const b = bodies.find(x => x.file === f)
      return sum + (b?.mass ?? 0)
    }, 0)

    const radius = Math.max(...center.orbiters.map(o => o.distance), 0)
    const stability = computeWellStability(center, bodies)
    const type = classifyWellType(center, bodies)

    wells.push({
      center: center.file,
      bodies: wellBodies,
      radius,
      totalMass,
      gravitationalStrength: center.gravitationalField,
      stability,
      type,
    })
  }

  return wells
}

/**
 * Compute well stability score (0-100).
 *
 * @example
 * computeWellStability(center, bodies) // => 85
 */
export function computeWellStability(center: GravitationalBody, _bodies: GravitationalBody[]): number {
  if (center.orbiters.length === 0) return 100
  const stableCount = center.orbiters.filter(o => o.isStable).length
  return Math.round((stableCount / center.orbiters.length) * 100)
}

/**
 * Classify a well type.
 *
 * @example
 * classifyWellType(center, bodies) // => 'stable'
 */
export function classifyWellType(center: GravitationalBody, bodies: GravitationalBody[]): WellType {
  const orbiterPulls = center.orbiters.map(o => {
    const b = bodies.find(x => x.file === o.file)
    return b?.gravitationalPull ?? 0
  })

  const avgPull = orbiterPulls.length > 0 ? orbiterPulls.reduce((a, b) => a + b, 0) / orbiterPulls.length : 0
  const maxPull = Math.max(...orbiterPulls, 0)

  // Binary: two strong centers orbiting each other
  if (maxPull >= 5 && center.gravitationalPull >= 5 && center.orbiters.length <= 4) {
    return 'binary'
  }

  // Chaotic: many cross-connections, unstable
  const unstableCount = center.orbiters.filter(o => !o.isStable).length
  if (unstableCount > center.orbiters.length * 0.5) {
    return 'chaotic'
  }

  // Cluster: multiple strong sub-centers
  if (avgPull > 3 && orbiterPulls.filter(p => p > 3).length > 1) {
    return 'cluster'
  }

  return 'stable'
}

// ─── System Metrics ────────────────────────────────────────────────────────────

/**
 * Compute the gravitational constant (overall coupling intensity).
 *
 * @example
 * computeGravitationalConstant(bodies) // => 42
 */
export function computeGravitationalConstant(bodies: GravitationalBody[]): number {
  if (bodies.length === 0) return 0
  const totalPull = bodies.reduce((s, b) => s + b.gravitationalPull, 0)
  const maxPossible = bodies.length * (bodies.length - 1)
  if (maxPossible === 0) return 0
  return Math.round((totalPull / maxPossible) * 100)
}

/**
 * Compute overall system stability (0-100).
 *
 * @example
 * computeSystemStability(wells) // => 78
 */
export function computeSystemStability(wells: GravityWell[]): number {
  if (wells.length === 0) return 100
  const totalStability = wells.reduce((s, w) => s + w.stability, 0)
  return Math.round(totalStability / wells.length)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateGravityRecommendations(bodies, wells, stats)
 * // => ['Black hole detected in core.ts — consider breaking up']
 */
export function generateGravityRecommendations(bodies: GravitationalBody[], wells: GravityWell[], stats: GravityStats): string[] {
  const recs: string[] = []

  const blackholes = bodies.filter(b => b.classification === 'blackhole')
  for (const bh of blackholes) {
    recs.push(`Black hole detected in ${bh.file} (${bh.gravitationalPull} dependents) — consider breaking into smaller modules`)
  }

  const chaotic = wells.filter(w => w.type === 'chaotic')
  if (chaotic.length > 0) {
    recs.push(`${chaotic.length} chaotic well(s) detected — add structure and reduce cross-connections`)
  }

  const highEscape = bodies.filter(b => b.escapeVelocity > 70)
  if (highEscape.length > 0) {
    recs.push(`${highEscape.length} file(s) with high escape velocity — create abstraction layers to decouple`)
  }

  const asteroids = bodies.filter(b => b.classification === 'asteroid')
  if (asteroids.length > stats.totalBodies * 0.5) {
    recs.push('Many isolated files detected — consider connecting them to the codebase or documenting their purpose')
  }

  if (stats.systemStability < 50) {
    recs.push('System stability is low — focus on reducing coupling in unstable gravity wells')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build the full gravity well analysis result.
 *
 * @example
 * buildGravityResult(files, contents, {})
 * // => { bodies: [...], wells: [...], stats: {...}, recommendations: [...] }
 */
export function buildGravityResult(files: string[], contents: string[], options: GravityOptions): GravityResult {
  const bodies: GravitationalBody[] = files.map((file, idx) => {
    const content = contents[idx]
    const mass = content.split('\n').length
    const pull = computeGravitationalPull(file, files, contents)
    const orbiters = findOrbiters(file, files, contents)

    const importerContents: string[] = []
    for (let i = 0; i < files.length; i++) {
      if (files[i] === file) continue
      const targets = extractImportTargets(contents[i], files[i], files)
      if (targets.includes(file)) importerContents.push(contents[i])
    }

    const field = computeGravitationalField(pull, importerContents)
    const escapeVel = computeEscapeVelocity(pull, orbiters.length)
    const classification = classifyBody(mass, pull, orbiters.length)
    const name = file.split('/').pop()?.replace(/\.\w+$/, '') ?? file

    return {
      file,
      name,
      mass,
      gravitationalPull: pull,
      gravitationalField: field,
      orbiters,
      escapeVelocity: escapeVel,
      classification,
    }
  })

  const wells = identifyGravityWells(bodies)

  const starCount = bodies.filter(b => b.classification === 'star').length
  const blackholeCount = bodies.filter(b => b.classification === 'blackhole').length
  const stableWells = wells.filter(w => w.type === 'stable').length
  const chaoticWells = wells.filter(w => w.type === 'chaotic').length

  const strongest = bodies.reduce((best, b) => b.gravitationalPull > best.gravitationalPull ? b : best, bodies[0])
  const deepest = wells.length > 0 ? wells.reduce((best, w) => w.bodies.length > best.bodies.length ? w : best, wells[0]) : null

  const avgEscape = bodies.length > 0 ? Math.round(bodies.reduce((s, b) => s + b.escapeVelocity, 0) / bodies.length) : 0
  const avgField = bodies.length > 0 ? Math.round(bodies.reduce((s, b) => s + b.gravitationalField, 0) / bodies.length) : 0

  const stats: GravityStats = {
    totalBodies: files.length,
    starCount,
    blackholeCount,
    wellCount: wells.length,
    stableWells,
    chaoticWells,
    strongestGravity: strongest?.file ?? '',
    deepestWell: deepest?.center ?? '',
    avgEscapeVelocity: avgEscape,
    avgFieldStrength: avgField,
    gravitationalConstant: computeGravitationalConstant(bodies),
    systemStability: computeSystemStability(wells),
  }

  const recommendations = generateGravityRecommendations(bodies, wells, stats)

  return { bodies, wells, stats, recommendations }
}
