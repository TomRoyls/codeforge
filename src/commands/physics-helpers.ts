// ─── Types ─────────────────────────────────────────────────────────────────────

export type Trajectory = 'stable' | 'growing' | 'shrinking' | 'volatile'
export type EquilibriumState = 'stable' | 'metastable' | 'unstable'

export interface Forces {
  attraction: number
  repulsion: number
  friction: number
  tension: number
  gravity: number
}

export interface CodeMass {
  file: string
  mass: number
  density: number
  volume: number
  centerOfMass: number
}

export interface Kinematics {
  file: string
  velocity: number
  acceleration: number
  momentum: number
  kineticEnergy: number
  trajectory: Trajectory
}

export interface Thermodynamics {
  entropy: number
  temperature: number
  pressure: number
  energy: number
  heatCapacity: number
}

export interface PhysicsStats {
  totalMass: number
  avgDensity: number
  totalEnergy: number
  avgEntropy: number
  centerOfGravity: string
  heaviestFile: string
  fastestFile: string
  mostEnergeticFile: string
  highestEntropy: string
  systemStability: number
  totalMomentum: number
  equilibriumState: EquilibriumState
}

export interface PhysicsResult {
  forces: Forces
  masses: CodeMass[]
  kinematics: Kinematics[]
  thermodynamics: Thermodynamics
  stats: PhysicsStats
  recommendations: string[]
}

// ─── Mass ──────────────────────────────────────────────────────────────────────

/**
 * Compute mass as non-blank lines of code.
 *
 * @example
 * computeMass('line1\n\nline2\n')
 */
export function computeMass(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

// ─── Density ───────────────────────────────────────────────────────────────────

/**
 * Compute density as non-blank non-comment lines / total lines.
 *
 * @example
 * computeDensity('const x = 1\n// comment\n\nconst y = 2')
 */
export function computeDensity(content: string): number {
  if (content.length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0
  const substantial = lines.filter((l) => {
    const trimmed = l.trim()
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')
  }).length
  return Math.round((substantial / total) * 100)
}

// ─── Volume ────────────────────────────────────────────────────────────────────

/**
 * Compute volume as character count.
 *
 * @example
 * computeVolume('hello world')
 */
export function computeVolume(content: string): number {
  return content.length
}

// ─── Center of Mass ────────────────────────────────────────────────────────────

/**
 * Compute center of mass as median non-blank line number.
 *
 * @example
 * computeCenterOfMass('a\n\nb\n\nc')
 */
export function computeCenterOfMass(content: string): number {
  if (content.length === 0) return 0
  const lines = content.split('\n')
  const nonBlank: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0) nonBlank.push(i + 1)
  }
  if (nonBlank.length === 0) return 0
  const mid = Math.floor(nonBlank.length / 2)
  return nonBlank.length % 2 !== 0 ? nonBlank[mid] : Math.round((nonBlank[mid - 1] + nonBlank[mid]) / 2)
}

// ─── Attraction (Import Pull) ──────────────────────────────────────────────────

/**
 * Compute attraction force from mutual imports.
 *
 * @example
 * computeAttraction(['a.ts', 'b.ts'], ['import from b', 'import from a'])
 */
export function computeAttraction(files: string[], contents: string[]): number {
  let totalImports = 0
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''
    const matches = content.matchAll(/import\s+.*?from\s+['"](\.\/[^'"]+)['"]/g)
    for (const m of matches) {
      const base = m[1].replace(/^\.\//, '')
      const resolved = dir ? dir + '/' + base : base
      const candidates = [resolved, resolved + '.ts', resolved + '.js']
      if (candidates.some((c) => fileSet.has(c))) totalImports++
    }
  }

  return Math.min(100, totalImports * 2)
}

// ─── Repulsion (Pattern Conflicts) ─────────────────────────────────────────────

/**
 * Compute repulsion from pattern inconsistencies.
 *
 * @example
 * computeRepulsion(['a.ts', 'b.ts'], ['const myVar', 'const my_var'])
 */
export function computeRepulsion(files: string[], contents: string[]): number {
  let conflicts = 0

  const styles = new Set<string>()
  for (const content of contents) {
    const camel = (content.match(/(?:const|let|function)\s+[a-z][a-zA-Z0-9]*/g) || []).length
    const snake = (content.match(/(?:const|let|function)\s+\w+_\w+/g) || []).length
    if (camel > 0) styles.add('camelCase')
    if (snake > 0) styles.add('snake_case')
  }
  if (styles.size > 1) conflicts += 10

  const asyncStyles = new Set<string>()
  for (const content of contents) {
    if (/\basync\b/.test(content)) asyncStyles.add('async')
    if (/\bcallback\b|\bcb\b/.test(content)) asyncStyles.add('callback')
    if (/.then\(/.test(content)) asyncStyles.add('promise')
  }
  if (asyncStyles.size > 1) conflicts += 10

  const errorStyles = new Set<string>()
  for (const content of contents) {
    if (/\btry\s*\{/.test(content)) errorStyles.add('try-catch')
    if (/\bResult\b|\bEither\b/.test(content)) errorStyles.add('result-type')
    if (/\.catch\s*\(/.test(content)) errorStyles.add('catch')
  }
  if (errorStyles.size > 1) conflicts += 5

  return Math.min(100, conflicts * 2)
}

// ─── Friction (Maintenance Difficulty) ─────────────────────────────────────────

/**
 * Compute friction from complexity × coupling.
 *
 * @example
 * computeFriction(['a.ts'], ['if (x) { for (...) { while (...) } }'])
 */
export function computeFriction(files: string[], contents: string[]): number {
  let totalComplexity = 0
  let totalCoupling = 0

  for (const content of contents) {
    const patterns = [/\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcatch\b/g]
    let complexity = 1
    for (const pat of patterns) {
      const m = content.match(pat)
      if (m) complexity += m.length
    }
    totalComplexity += complexity

    const imports = (content.match(/^import\s/gm) || []).length
    totalCoupling += imports
  }

  const avgComplexity = totalComplexity / Math.max(1, files.length)
  const avgCoupling = totalCoupling / Math.max(1, files.length)
  return Math.min(100, Math.round((avgComplexity * avgCoupling) / 2))
}

// ─── Tension (Dependency Strain) ───────────────────────────────────────────────

/**
 * Compute tension from circular deps and long import chains.
 *
 * @example
 * computeTension(['a.ts', 'b.ts'], ['import from b', 'import from a'])
 */
export function computeTension(files: string[], contents: string[]): number {
  let tension = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''
    const matches = [...content.matchAll(/import\s+.*?from\s+['"](\.\/[^'"]+)['"]/g)]
    const importCount = matches.length
    if (importCount > 8) tension += 15
    else if (importCount > 5) tension += 8
    else if (importCount > 3) tension += 3

    const depth = (file.match(/\//g) || []).length
    if (depth > 4) tension += 5
  }

  return Math.min(100, tension)
}

// ─── Gravity (Overall Coupling) ────────────────────────────────────────────────

/**
 * Compute gravity from forces and masses.
 *
 * @example
 * computeGravity(forces, masses)
 */
export function computeGravity(forces: Forces, masses: CodeMass[]): number {
  const totalMass = masses.reduce((s, m) => s + m.mass, 0)
  const avgDensity = masses.length > 0 ? masses.reduce((s, m) => s + m.density, 0) / masses.length : 50
  return Math.min(100, Math.round((forces.attraction * 0.5 + totalMass * 0.01 + avgDensity * 0.3)))
}

// ─── Kinematics (Velocity, Momentum, Energy) ──────────────────────────────────

/**
 * Compute velocity (changes per time unit) from content complexity.
 *
 * @example
 * computeVelocity('if (x) { for (let i = 0; ...) }')
 */
export function computeVelocity(content: string): number {
  const todos = (content.match(/TODO|FIXME|HACK|XXX/g) || []).length
  const changes = (content.match(/\/\/.*change|\/\/.*modified/gi) || []).length
  const volatile = (content.match(/any\b/g) || []).length
  return Math.min(100, (todos + changes + volatile) * 10)
}

/**
 * Compute acceleration as velocity change indicator.
 *
 * @example
 * computeAcceleration(velocity, 50)
 */
export function computeAcceleration(velocity: number, previousVelocity: number): number {
  return velocity - previousVelocity
}

/**
 * Compute momentum as mass × velocity.
 *
 * @example
 * computeMomentum(100, 5)
 */
export function computeMomentum(mass: number, velocity: number): number {
  return mass * velocity
}

/**
 * Compute kinetic energy as 0.5 × mass × velocity².
 *
 * @example
 * computeKineticEnergy(100, 5)
 */
export function computeKineticEnergy(mass: number, velocity: number): number {
  return Math.round(0.5 * mass * velocity * velocity)
}

/**
 * Classify trajectory from velocity and acceleration.
 *
 * @example
 * classifyTrajectory(10, 2)
 */
export function classifyTrajectory(velocity: number, acceleration: number): Trajectory {
  if (velocity > 60) return 'volatile'
  if (acceleration > 10) return 'growing'
  if (acceleration < -10) return 'shrinking'
  return 'stable'
}

// ─── Thermodynamics ────────────────────────────────────────────────────────────

/**
 * Compute entropy (code disorder) from naming and pattern inconsistency.
 *
 * @example
 * computeEntropy(['a.ts', 'b.ts'], ['const x', 'var y'])
 */
export function computeEntropy(files: string[], contents: string[]): number {
  if (contents.length === 0) return 50

  let entropy = 30

  const namingStyles = new Set<string>()
  for (const c of contents) {
    if (/[a-z][a-zA-Z0-9]*/.test(c)) namingStyles.add('camelCase')
    if (/\w+_\w+/.test(c)) namingStyles.add('snake_case')
    if (/[A-Z][a-zA-Z0-9]*/.test(c)) namingStyles.add('PascalCase')
  }
  if (namingStyles.size > 2) entropy += 20
  else if (namingStyles.size > 1) entropy += 10

  const quoteStyles = new Set<string>()
  for (const c of contents) {
    if (/'/.test(c)) quoteStyles.add('single')
    if (/"/.test(c)) quoteStyles.add('double')
  }
  if (quoteStyles.size > 1) entropy += 10

  const semicolons = contents.filter((c) => /;$/.test(c.trim()) || /;\s*\n/.test(c)).length
  const noSemicolons = contents.length - semicolons
  if (semicolons > 0 && noSemicolons > 0) entropy += 10

  let anyCount = 0
  for (const c of contents) {
    anyCount += (c.match(/:\s*any\b/g) || []).length
  }
  entropy += Math.min(20, anyCount * 5)

  return Math.min(100, entropy)
}

/**
 * Compute temperature (change activity).
 *
 * @example
 * computeTemperature(contents)
 */
export function computeTemperature(contents: string[]): number {
  let markers = 0
  for (const c of contents) {
    markers += (c.match(/TODO|FIXME|HACK|XXX|DEPRECATED/g) || []).length
    markers += (c.match(/\bany\b/g) || []).length
    markers += (c.match(/ts-ignore|ts-expect-error/g) || []).length
  }
  return Math.min(100, markers * 5)
}

/**
 * Compute pressure from file density.
 *
 * @example
 * computePressure(masses)
 */
export function computePressure(masses: CodeMass[]): number {
  if (masses.length === 0) return 0
  const totalVolume = masses.reduce((s, m) => s + m.volume, 0)
  const avgDensity = masses.reduce((s, m) => s + m.density, 0) / masses.length
  return Math.min(100, Math.round((totalVolume / 10000) + avgDensity * 0.3))
}

/**
 * Compute energy (maintenance effort).
 *
 * @example
 * computeEnergy(masses, kinematics)
 */
export function computeEnergy(masses: CodeMass[], kinematics: Kinematics[]): number {
  let total = 0
  for (let i = 0; i < masses.length; i++) {
    const mass = masses[i].mass
    const ke = kinematics[i]?.kineticEnergy ?? 0
    total += mass + ke
  }
  return Math.min(100, Math.round(total / Math.max(1, masses.length)))
}

/**
 * Compute heat capacity (resistance to change).
 *
 * @example
 * computeHeatCapacity(masses, entropy)
 */
export function computeHeatCapacity(masses: CodeMass[], entropy: number): number {
  if (masses.length === 0) return 50
  const avgMass = masses.reduce((s, m) => s + m.mass, 0) / masses.length
  const avgDensity = masses.reduce((s, m) => s + m.density, 0) / masses.length
  return Math.min(100, Math.round(avgMass * 0.3 + avgDensity * 0.3 + (100 - entropy) * 0.4))
}

// ─── Center of Gravity ─────────────────────────────────────────────────────────

/**
 * Find the file closest to the codebase center of gravity.
 *
 * @example
 * findCenterOfGravity(masses, forces)
 */
export function findCenterOfGravity(masses: CodeMass[], forces: Forces): string {
  if (masses.length === 0) return 'none'

  const scored = masses.map((m) => ({
    file: m.file,
    score: m.mass * 0.4 + m.density * 0.3 + forces.attraction * 0.3,
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0].file
}

// ─── System Stability ──────────────────────────────────────────────────────────

/**
 * Compute system stability (0-100).
 *
 * @example
 * computeSystemStability(thermo, forces)
 */
export function computeSystemStability(thermo: Thermodynamics, forces: Forces): number {
  const entropyPenalty = thermo.entropy * 0.3
  const frictionPenalty = forces.friction * 0.3
  const tensionPenalty = forces.tension * 0.2
  const heatCapacityBonus = thermo.heatCapacity * 0.2

  return Math.max(0, Math.min(100, Math.round(100 - entropyPenalty - frictionPenalty - tensionPenalty + heatCapacityBonus)))
}

/**
 * Determine equilibrium state from stability score.
 *
 * @example
 * determineEquilibrium(75)
 */
export function determineEquilibrium(stability: number): EquilibriumState {
  if (stability >= 70) return 'stable'
  if (stability >= 40) return 'metastable'
  return 'unstable'
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate physics recommendations.
 *
 * @example
 * generateRecommendations(forces, masses, kinematics, thermo, stats)
 */
export function generateRecommendations(
  forces: Forces,
  masses: CodeMass[],
  _kinematics: Kinematics[],
  thermo: Thermodynamics,
  stats: PhysicsStats,
): string[] {
  const recs: string[] = []

  if (thermo.entropy > 60) {
    recs.push(`Entropy is high (${thermo.entropy}) — standardize naming conventions and patterns to reduce disorder`)
  }

  if (stats.equilibriumState === 'unstable') {
    recs.push('System is in unstable equilibrium — add structural patterns to stabilize the codebase')
  }

  if (forces.friction > 60) {
    recs.push(`Friction is high (${forces.friction}) — decouple high-complexity modules to reduce maintenance cost`)
  }

  const heavy = masses.filter((m) => m.mass > 300)
  if (heavy.length > 0) {
    recs.push(`${heavy.length} file(s) with mass > 300 LOC — consider splitting: ${heavy.slice(0, 3).map((m) => m.file).join(', ')}`)
  }

  if (thermo.energy > 70) {
    recs.push(`Energy expenditure is high (${thermo.energy}) — simplify high-maintenance files`)
  }

  if (stats.systemStability > 70) {
    recs.push(`System stability is good (${stats.systemStability}%) — maintain current structural practices`)
  }

  if (recs.length === 0) {
    recs.push('The codebase exhibits healthy physics — low entropy, moderate forces, stable equilibrium')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete physics result.
 *
 * @example
 * buildPhysicsResult(['a.ts'], ['code'], {})
 */
export function buildPhysicsResult(files: string[], contents: string[], options: Record<string, unknown>): PhysicsResult {
  if (files.length === 0) {
    const emptyForces: Forces = { attraction: 0, repulsion: 0, friction: 0, tension: 0, gravity: 0 }
    const emptyThermo: Thermodynamics = { entropy: 0, temperature: 0, pressure: 0, energy: 0, heatCapacity: 0 }
    const emptyStats: PhysicsStats = {
      totalMass: 0, avgDensity: 0, totalEnergy: 0, avgEntropy: 0,
      centerOfGravity: 'none', heaviestFile: 'none', fastestFile: 'none',
      mostEnergeticFile: 'none', highestEntropy: 'none',
      systemStability: 0, totalMomentum: 0, equilibriumState: 'stable',
    }
    return { forces: emptyForces, masses: [], kinematics: [], thermodynamics: emptyThermo, stats: emptyStats, recommendations: ['No files to analyze'] }
  }

  const forces: Forces = {
    attraction: computeAttraction(files, contents),
    repulsion: computeRepulsion(files, contents),
    friction: computeFriction(files, contents),
    tension: computeTension(files, contents),
    gravity: 0,
  }

  const masses: CodeMass[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    return {
      file,
      mass: computeMass(content),
      density: computeDensity(content),
      volume: computeVolume(content),
      centerOfMass: computeCenterOfMass(content),
    }
  })

  forces.gravity = computeGravity(forces, masses)

  const kinematics: Kinematics[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const mass = masses[i].mass
    const velocity = computeVelocity(content)
    const acceleration = computeAcceleration(velocity, 0)
    const momentum = computeMomentum(mass, velocity)
    const kineticEnergy = computeKineticEnergy(mass, velocity)
    const trajectory = classifyTrajectory(velocity, acceleration)
    return { file, velocity, acceleration, momentum, kineticEnergy, trajectory }
  })

  const entropy = computeEntropy(files, contents)
  const temperature = computeTemperature(contents)
  const pressure = computePressure(masses)
  const energy = computeEnergy(masses, kinematics)
  const heatCapacity = computeHeatCapacity(masses, entropy)

  const thermodynamics: Thermodynamics = { entropy, temperature, pressure, energy, heatCapacity }

  const totalMass = masses.reduce((s, m) => s + m.mass, 0)
  const avgDensity = masses.length > 0 ? Math.round(masses.reduce((s, m) => s + m.density, 0) / masses.length) : 0
  const avgEntropy = entropy

  const centerOfGravity = findCenterOfGravity(masses, forces)
  const heaviestFile = [...masses].sort((a, b) => b.mass - a.mass)[0]?.file ?? 'none'
  const fastestFile = [...kinematics].sort((a, b) => b.velocity - a.velocity)[0]?.file ?? 'none'
  const mostEnergeticFile = [...kinematics].sort((a, b) => b.kineticEnergy - a.kineticEnergy)[0]?.file ?? 'none'
  const highestEntropy = centerOfGravity

  const systemStability = computeSystemStability(thermodynamics, forces)
  const totalMomentum = kinematics.reduce((s, k) => s + k.momentum, 0)
  const equilibriumState = determineEquilibrium(systemStability)

  const stats: PhysicsStats = {
    totalMass,
    avgDensity,
    totalEnergy: energy,
    avgEntropy,
    centerOfGravity,
    heaviestFile,
    fastestFile,
    mostEnergeticFile,
    highestEntropy,
    systemStability,
    totalMomentum,
    equilibriumState,
  }

  const recommendations = generateRecommendations(forces, masses, kinematics, thermodynamics, stats)

  return { forces, masses, kinematics, thermodynamics, stats, recommendations }
}
