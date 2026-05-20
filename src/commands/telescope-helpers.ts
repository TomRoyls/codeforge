// ─── Types ─────────────────────────────────────────────────────────────────────

export type CelestialType = 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'blackhole' | 'nebula'
export type Significance = 'minor' | 'notable' | 'major' | 'groundbreaking'

export interface CelestialBody {
  file: string
  name: string
  type: CelestialType
  luminosity: number
  mass: number
  gravity: number
  age: number
  distance: number
  constellation: string
  magnitude: number
}

export interface Constellation {
  name: string
  bodies: CelestialBody[]
  stars: number
  totalMass: number
  density: number
  brightness: number
}

export interface DeepField {
  zoomLevel: number
  description: string
  observations: Observation[]
  discoveries: string[]
}

export interface Observation {
  description: string
  significance: Significance
  body: string
  detail: string
}

export interface TelescopeStats {
  totalBodies: number
  starCount: number
  blackholeCount: number
  nebulaCount: number
  constellationCount: number
  avgLuminosity: number
  avgMass: number
  maxGravity: number
  brightestBody: string
  heaviestBody: string
  mostDistant: string
  observableUniverse: number
  darkMatter: number
}

export interface TelescopeResult {
  bodies: CelestialBody[]
  constellations: Constellation[]
  deepFields: DeepField[]
  stats: TelescopeStats
  recommendations: string[]
}

// ─── Celestial Body Classification ─────────────────────────────────────────────

/**
 * Classify a file into a celestial body type.
 *
 * @example
 * classifyBody('mod.ts', 'code', 5, 10, 20)
 */
export function classifyBody(
  file: string,
  content: string,
  imports: number,
  exportedTo: number,
  mass: number,
): CelestialType {
  const totalGravity = imports + exportedTo

  if (totalGravity >= 15) return 'blackhole'
  if (mass > 300 && imports >= 8) return 'nebula'
  if (mass > 300 && totalGravity >= 5) return 'star'
  if (mass > 300) return 'nebula'

  if (totalGravity >= 8) return 'star'
  if (totalGravity >= 4 && mass > 50) return 'planet'
  if (mass > 50) return 'planet'

  if (mass <= 10) return 'asteroid'
  if (file.includes('.test.') || file.includes('.spec.')) return 'comet'
  return 'moon'
}

// ─── Luminosity (Complexity as Brightness) ──────────────────────────────────────

/**
 * Compute luminosity from code complexity (0-100).
 *
 * @example
 * computeLuminosity('if (x) { for (let i = 0; ...) }')
 */
export function computeLuminosity(content: string): number {
  if (content.length === 0) return 0

  const patterns = [
    /\bif\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g,
    /\bcatch\b/g, /\basync\b/g, /\bawait\b/g,
    /&&/g, /\|\|/g, /\?\?/g, /\?\./g,
    /\bclass\b/g, /\binterface\b/g, /\btype\b/g,
  ]

  let complexity = 0
  for (const pat of patterns) {
    const m = content.match(pat)
    if (m) complexity += m.length
  }

  return Math.min(100, Math.round(complexity * 2))
}

// ─── Mass (Lines of Code) ──────────────────────────────────────────────────────

/**
 * Compute mass as lines of code.
 *
 * @example
 * computeMass('line1\nline2\nline3')
 */
export function computeMass(content: string): number {
  if (content.length === 0) return 0
  return content.split('\n').filter((l) => l.trim().length > 0).length
}

// ─── Gravity (Coupling Force) ──────────────────────────────────────────────────

/**
 * Compute gravity from imports and reverse coupling.
 *
 * @example
 * computeGravity(5, 3)
 */
export function computeGravity(imports: number, exportedTo: number): number {
  return imports + exportedTo
}

// ─── Distance from Entry Points ────────────────────────────────────────────────

/**
 * Compute distance (BFS hops) from entry points via import graph.
 *
 * @example
 * computeDistance('src/utils.ts', ['src/index.ts'], graph)
 */
export function computeDistance(
  file: string,
  entryPoints: string[],
  importGraph: Map<string, string[]>,
): number {
  if (entryPoints.length === 0) return 999
  if (entryPoints.includes(file)) return 0

  const visited = new Set<string>()
  const queue: Array<{ f: string; d: number }> = entryPoints.map((ep) => ({ f: ep, d: 0 }))

  while (queue.length > 0) {
    const { f, d } = queue.shift()!
    if (visited.has(f)) continue
    visited.add(f)

    const neighbors = importGraph.get(f) ?? []
    for (const n of neighbors) {
      if (n === file) return d + 1
      if (!visited.has(n)) queue.push({ f: n, d: d + 1 })
    }
  }

  return 999
}

// ─── Magnitude (Importance Score) ──────────────────────────────────────────────

/**
 * Compute magnitude (importance 0-100).
 *
 * @example
 * computeMagnitude(body)
 */
export function computeMagnitude(body: CelestialBody): number {
  const gravityWeight = Math.min(30, body.gravity * 3)
  const luminosityWeight = body.luminosity * 0.2
  const massWeight = Math.min(20, body.mass * 0.1)
  const distancePenalty = Math.max(0, 20 - body.distance * 5)

  return Math.min(100, Math.round(gravityWeight + luminosityWeight + massWeight + distancePenalty))
}

// ─── Group Into Constellations ─────────────────────────────────────────────────

/**
 * Group celestial bodies into constellations by directory.
 *
 * @example
 * groupIntoConstellations(bodies)
 */
export function groupIntoConstellations(bodies: CelestialBody[]): Constellation[] {
  const dirMap = new Map<string, CelestialBody[]>()

  for (const body of bodies) {
    const dir = body.constellation
    if (!dirMap.has(dir)) dirMap.set(dir, [])
    dirMap.get(dir)!.push(body)
  }

  const constellations: Constellation[] = []
  for (const [name, bodiesList] of dirMap) {
    const stars = bodiesList.filter((b) => b.type === 'star' || b.type === 'blackhole').length
    const totalMass = bodiesList.reduce((s, b) => s + b.mass, 0)
    const density = bodiesList.length
    const brightness = bodiesList.length > 0
      ? Math.round(bodiesList.reduce((s, b) => s + b.luminosity, 0) / bodiesList.length)
      : 0

    constellations.push({ name, bodies: bodiesList, stars, totalMass, density, brightness })
  }

  return constellations
}

// ─── Build Import Graph ────────────────────────────────────────────────────────

/**
 * Build import graph from file contents.
 *
 * @example
 * buildImportGraph(files, contents)
 */
export function buildImportGraph(files: string[], contents: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const imports: string[] = []

    const importMatches = content.matchAll(/import\s+.*?from\s+['"](\.\/[^'"]+)['"]/g)
    for (const m of importMatches) {
      const imported = m[1]
      const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''
      const base = imported.replace(/^\.\//, '')
      const resolved = dir ? dir + '/' + base : base
      const candidates = [resolved, resolved + '.ts', resolved + '.js', resolved + '.tsx', resolved + '.jsx']
      const matched = candidates.find((c) => fileSet.has(c))
      if (matched) imports.push(matched)
    }

    graph.set(file, imports)
  }

  return graph
}

// ─── Find Entry Points ─────────────────────────────────────────────────────────

/**
 * Find entry point files (index files, main files).
 *
 * @example
 * findEntryPoints(files)
 */
export function findEntryPoints(files: string[]): string[] {
  const entries: string[] = []
  for (const f of files) {
    const base = f.includes('/') ? f.substring(f.lastIndexOf('/') + 1) : f
    if (base === 'index.ts' || base === 'index.js' || base === 'main.ts' || base === 'main.js') {
      entries.push(f)
    }
  }
  if (entries.length === 0 && files.length > 0) {
    entries.push(files[0])
  }
  return entries
}

// ─── Compute Reachable (Observable Universe) ───────────────────────────────────

/**
 * Compute reachable files from entry points via BFS.
 *
 * @example
 * computeObservableUniverse(entryPoints, graph)
 */
export function computeObservableUniverse(entryPoints: string[], importGraph: Map<string, string[]>): Set<string> {
  const reachable = new Set<string>()
  const queue = [...entryPoints]

  while (queue.length > 0) {
    const f = queue.shift()!
    if (reachable.has(f)) continue
    reachable.add(f)

    const neighbors = importGraph.get(f) ?? []
    for (const n of neighbors) {
      if (!reachable.has(n)) queue.push(n)
    }
  }

  return reachable
}

// ─── Find Dark Matter ──────────────────────────────────────────────────────────

/**
 * Find unreachable files (dark matter).
 *
 * @example
 * findDarkMatter(files, entryPoints, graph)
 */
export function findDarkMatter(files: string[], entryPoints: string[], importGraph: Map<string, string[]>): string[] {
  const reachable = computeObservableUniverse(entryPoints, importGraph)
  return files.filter((f) => !reachable.has(f))
}

// ─── Count Reverse Coupling ────────────────────────────────────────────────────

/**
 * Count how many files import each file.
 *
 * @example
 * countReverseCoupling(files, contents)
 */
export function countReverseCoupling(files: string[], contents: string[]): Map<string, number> {
  const reverseCount = new Map<string, number>()
  for (const f of files) reverseCount.set(f, 0)
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] ?? ''
    const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''

    const importMatches = content.matchAll(/import\s+.*?from\s+['"](\.\/[^'"]+)['"]/g)
    for (const m of importMatches) {
      const base = m[1].replace(/^\.\//, '')
      const resolved = dir ? dir + '/' + base : base
      const candidates = [resolved, resolved + '.ts', resolved + '.js', resolved + '.tsx', resolved + '.jsx']
      const matched = candidates.find((c) => fileSet.has(c))
      if (matched) {
        const current = reverseCount.get(matched) ?? 0
        reverseCount.set(matched, current + 1)
      }
    }
  }

  return reverseCount
}

// ─── Observe at Zoom Levels ────────────────────────────────────────────────────

const zoomDescriptions: Record<number, string> = {
  1: 'Macro — Project Overview',
  2: 'Wide — Directory Level',
  3: 'Medium — File Level',
  4: 'Close — Function Level',
  5: 'Micro — Expression Level',
}

/**
 * Generate deep field observations at a given zoom level.
 *
 * @example
 * observeAtZoom(1, files, contents, bodies, constellations)
 */
export function observeAtZoom(
  level: number,
  files: string[],
  contents: string[],
  bodies: CelestialBody[],
  constellations: Constellation[],
): DeepField {
  const observations: Observation[] = []
  const discoveries: string[] = []

  if (level === 1) {
    const csCount = constellations.length
    observations.push({
      description: `${csCount} constellation(s) observed across the codebase`,
      significance: csCount > 10 ? 'major' : 'notable',
      body: '*',
      detail: `Distribution: ${constellations.map((c) => `${c.name}(${c.density})`).join(', ')}`,
    })

    const bh = bodies.filter((b) => b.type === 'blackhole')
    if (bh.length > 0) {
      discoveries.push(`${bh.length} black hole(s) detected: ${bh.map((b) => b.file).join(', ')}`)
    }
  }

  if (level === 2) {
    for (const c of constellations) {
      if (c.brightness > 70) {
        observations.push({
          description: `${c.name} is highly luminous (avg brightness ${c.brightness})`,
          significance: 'notable',
          body: c.name,
          detail: `${c.stars} star(s), total mass ${c.totalMass}`,
        })
      }
    }

    const nebulae = bodies.filter((b) => b.type === 'nebula')
    if (nebulae.length > 0) {
      discoveries.push(`${nebulae.length} nebula(e) detected — large files still forming`)
    }
  }

  if (level === 3) {
    const sorted = [...bodies].sort((a, b) => b.magnitude - a.magnitude)
    for (const body of sorted.slice(0, 5)) {
      observations.push({
        description: `${body.name} (${body.type}): magnitude ${body.magnitude}, luminosity ${body.luminosity}`,
        significance: body.magnitude > 70 ? 'major' : 'minor',
        body: body.file,
        detail: `mass=${body.mass}, gravity=${body.gravity}, distance=${body.distance}`,
      })
    }

    const comets = bodies.filter((b) => b.type === 'comet')
    if (comets.length > 0) {
      discoveries.push(`${comets.length} comet(s) — volatile test files in orbit`)
    }
  }

  if (level === 4) {
    for (let i = 0; i < files.length; i++) {
      const content = contents[i] ?? ''
      const fns = content.match(/(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\()/g) || []
      if (fns.length > 10) {
        observations.push({
          description: `${files[i]} has ${fns.length} functions — dense functional area`,
          significance: fns.length > 20 ? 'major' : 'notable',
          body: files[i],
          detail: `Function count: ${fns.length}`,
        })
      }
    }

    const deepNesting = bodies.filter((b) => b.luminosity > 80)
    if (deepNesting.length > 0) {
      discoveries.push(`${deepNesting.length} body(ies) with extreme complexity (luminosity > 80)`)
    }
  }

  if (level === 5) {
    let totalExpressions = 0
    for (const content of contents) {
      const ternaries = (content.match(/\?[^?]*:/g) || []).length
      const optionals = (content.match(/\?\./g) || []).length
      const nullish = (content.match(/\?\?/g) || []).length
      totalExpressions += ternaries + optionals + nullish
    }

    observations.push({
      description: `${totalExpressions} complex expression(s) across codebase`,
      significance: totalExpressions > 50 ? 'major' : 'minor',
      body: '*',
      detail: `Ternaries, optional chains, nullish coalescing`,
    })

    const asteroids = bodies.filter((b) => b.type === 'asteroid')
    if (asteroids.length > 0) {
      discoveries.push(`${asteroids.length} asteroid(s) — tiny files, mostly constants/types`)
    }
  }

  return {
    zoomLevel: level,
    description: zoomDescriptions[level] ?? `Zoom Level ${level}`,
    observations,
    discoveries,
  }
}

// ─── Generate Recommendations ──────────────────────────────────────────────────

/**
 * Generate telescope recommendations.
 *
 * @example
 * generateRecommendations(bodies, constellations, deepFields, stats)
 */
export function generateRecommendations(
  bodies: CelestialBody[],
  _constellations: Constellation[],
  _deepFields: DeepField[],
  stats: TelescopeStats,
): string[] {
  const recs: string[] = []

  const blackholes = bodies.filter((b) => b.type === 'blackhole')
  if (blackholes.length > 0) {
    recs.push(`Break up ${blackholes.length} black hole(s): ${blackholes.map((b) => b.file).join(', ')}`)
  }

  const nebulae = bodies.filter((b) => b.type === 'nebula')
  if (nebulae.length > 0) {
    recs.push(`Stabilize ${nebulae.length} nebula(e) — large files that may be changing rapidly`)
  }

  if (stats.darkMatter > 0) {
    recs.push(`${stats.darkMatter} file(s) are dark matter — not reachable from entry points. Consider connecting or removing them`)
  }

  const highGravity = bodies.filter((b) => b.gravity >= 10 && b.type !== 'blackhole')
  if (highGravity.length > 0) {
    recs.push(`${highGravity.length} file(s) with high gravity — consider decoupling: ${highGravity.slice(0, 3).map((b) => b.file).join(', ')}`)
  }

  if (stats.avgLuminosity > 60) {
    recs.push('Average luminosity is high — consider simplifying complex code paths')
  }

  if (recs.length === 0) {
    recs.push('The observable universe is well-structured with clear gravitational relationships')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete telescope result.
 *
 * @example
 * buildTelescopeResult(['a.ts'], ['code'], {})
 */
export function buildTelescopeResult(files: string[], contents: string[], options: Record<string, unknown>): TelescopeResult {
  if (files.length === 0) {
    const emptyStats: TelescopeStats = {
      totalBodies: 0, starCount: 0, blackholeCount: 0, nebulaCount: 0,
      constellationCount: 0, avgLuminosity: 0, avgMass: 0, maxGravity: 0,
      brightestBody: 'none', heaviestBody: 'none', mostDistant: 'none',
      observableUniverse: 0, darkMatter: 0,
    }
    return { bodies: [], constellations: [], deepFields: [], stats: emptyStats, recommendations: ['No files to observe'] }
  }

  const importGraph = buildImportGraph(files, contents)
  const reverseCoupling = countReverseCoupling(files, contents)
  const entryPoints = findEntryPoints(files)

  const bodies: CelestialBody[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : '.'
    const baseName = file.includes('/') ? file.substring(file.lastIndexOf('/') + 1) : file
    const importCount = (content.match(/^import\s/gm) || []).length
    const exportedTo = reverseCoupling.get(file) ?? 0
    const mass = computeMass(content)
    const luminosity = computeLuminosity(content)
    const gravity = computeGravity(importCount, exportedTo)
    const distance = computeDistance(file, entryPoints, importGraph)
    const age = 0

    const body: CelestialBody = {
      file,
      name: baseName,
      type: classifyBody(file, content, importCount, exportedTo, mass),
      luminosity,
      mass,
      gravity,
      age,
      distance,
      constellation: dir,
      magnitude: 0,
    }
    body.magnitude = computeMagnitude(body)
    return body
  })

  const constellations = groupIntoConstellations(bodies)

  const deepFields: DeepField[] = []
  for (let level = 1; level <= 5; level++) {
    deepFields.push(observeAtZoom(level, files, contents, bodies, constellations))
  }

  const reachable = computeObservableUniverse(entryPoints, importGraph)
  const darkMatterFiles = files.filter((f) => !reachable.has(f))

  const starCount = bodies.filter((b) => b.type === 'star').length
  const blackholeCount = bodies.filter((b) => b.type === 'blackhole').length
  const nebulaCount = bodies.filter((b) => b.type === 'nebula').length

  const avgLuminosity = bodies.length > 0
    ? Math.round(bodies.reduce((s, b) => s + b.luminosity, 0) / bodies.length)
    : 0
  const avgMass = bodies.length > 0
    ? Math.round(bodies.reduce((s, b) => s + b.mass, 0) / bodies.length)
    : 0
  const maxGravity = bodies.length > 0
    ? Math.max(...bodies.map((b) => b.gravity))
    : 0

  const sortedByLum = [...bodies].sort((a, b) => b.luminosity - a.luminosity)
  const sortedByMass = [...bodies].sort((a, b) => b.mass - a.mass)
  const sortedByDist = [...bodies].sort((a, b) => b.distance - a.distance)

  const stats: TelescopeStats = {
    totalBodies: bodies.length,
    starCount,
    blackholeCount,
    nebulaCount,
    constellationCount: constellations.length,
    avgLuminosity,
    avgMass,
    maxGravity,
    brightestBody: sortedByLum[0]?.file ?? 'none',
    heaviestBody: sortedByMass[0]?.file ?? 'none',
    mostDistant: sortedByDist[0]?.file ?? 'none',
    observableUniverse: reachable.size,
    darkMatter: darkMatterFiles.length,
  }

  const recommendations = generateRecommendations(bodies, constellations, deepFields, stats)

  return { bodies, constellations, deepFields, stats, recommendations }
}
