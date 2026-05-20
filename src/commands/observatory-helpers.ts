import type { ora } from 'ora'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CelestialBody {
  file: string
  name: string
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'black-hole' | 'supernova' | 'pulsar' | 'dark-matter'
  magnitude: number
  mass: number
  gravity: number
  temperature: number
  distance: number
  constellation: string | null
  isObservable: boolean
}

export interface Constellation {
  name: string
  stars: string[]
  connections: [string, string][]
  brightness: number
  size: number
  shape: string
  isVisible: boolean
}

export interface CelestialEvent {
  type: 'eclipse' | 'alignment' | 'collision' | 'formation' | 'convergence'
  description: string
  bodies: string[]
  impact: 'informational' | 'low' | 'medium' | 'high' | 'critical'
  recommendation: string
}

export interface CosmicWeb {
  cluster: string
  filaments: string[]
  density: number
  voidFiles: string[]
}

export interface ObservatoryStats {
  totalBodies: number
  stars: number
  blackHoles: number
  darkMatter: number
  pulsars: number
  supernovae: number
  totalConstellations: number
  visibleConstellations: number
  avgMagnitude: number
  avgGravity: number
  maxGravity: string
  observableRatio: number
  darkMatterRatio: number
  blackHoleCount: number
  cosmicExpansion: number
  universeSize: number
  overallClarity: 'crystal-clear' | 'clear' | 'partly-cloudy' | 'overcast' | 'opaque'
}

export interface ObservatoryResult {
  bodies: CelestialBody[]
  constellations: Constellation[]
  events: CelestialEvent[]
  web: CosmicWeb[]
  stats: ObservatoryStats
  recommendations: string[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Count lines of code in content
 * @example
 * countLines('a\nb\nc') // 3
 */
export function countLines(content: string): number {
  return content.split('\n').length
}

/**
 * Extract export names from file content
 * @example
 * extractExports('export function foo() {}') // ['foo']
 */
export function extractExports(content: string): string[] {
  const names: string[] = []
  const namedExport = content.matchAll(/export\s+(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/g)
  for (const m of namedExport) {
    names.push(m[1])
  }
  const defaultExport = content.matchAll(/export\s+default\s+(?:function|class)\s+(\w+)/g)
  for (const m of defaultExport) {
    names.push(m[1])
  }
  return Array.from(new Set(names))
}

/**
 * Extract import paths from file content
 * @example
 * extractImports("import { x } from './foo'") // ['./foo']
 */
export function extractImports(content: string): string[] {
  const paths: string[] = []
  const staticImports = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
  for (const m of staticImports) {
    paths.push(m[1])
  }
  const dynamicImports = content.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)
  for (const m of dynamicImports) {
    paths.push(m[1])
  }
  return Array.from(new Set(paths))
}

/**
 * Count import references to a file across all files
 * @example
 * countGravity('src/foo.ts', ['src/foo.ts', 'src/bar.ts'], ["import { x } from './foo'", "import { y } from './foo'"]) // 2
 */
export function countGravity(filePath: string, allFiles: string[], contents: string[]): number {
  const baseName = filePath.replace(/\.[^.]+$/, '').split('/').pop() || ''
  let count = 0
  for (let i = 0; i < allFiles.length; i++) {
    if (allFiles[i] === filePath) continue
    if (contents[i].includes(baseName)) count++
  }
  return count
}

/**
 * Calculate cyclomatic complexity of content
 * @example
 * computeComplexity('if (a) { b }') // 2
 */
export function computeComplexity(content: string): number {
  let complexity = 1
  const wordPatterns = content.match(/\b(if|else|for|while|case|catch)\b/g)
  if (wordPatterns) complexity += wordPatterns.length
  const symbolPatterns = content.match(/&&|\|\||\?\.|\?\?/g)
  if (symbolPatterns) complexity += symbolPatterns.length
  return complexity
}

/**
 * Calculate depth from entry point based on directory nesting
 * @example
 * computeDistance('src/commands/foo.ts') // 2
 */
export function computeDistance(filePath: string): number {
  const parts = filePath.split('/')
  return parts.length > 1 ? parts.length - 1 : 0
}

/**
 * Check if file has documentation
 * @example
 * isDocumented('export function foo() {}') // false
 * @example
 * isDocumented('// documented\nexport function foo() {}') // true
 */
export function isDocumented(content: string): boolean {
  return /\/\*\*[\s\S]*?\*\//g.test(content) || /\/\/.*$/m.test(content)
}

/**
 * Check if file has clear purpose based on exports and naming
 * @example
 * hasClearPurpose('export function authenticate() {}') // true
 */
export function hasClearPurpose(content: string): boolean {
  const exports = extractExports(content)
  return exports.length > 0
}

/**
 * Classify a file as a celestial body type
 * @example
 * classifyBodyType(80, 50, 10, 5, true, false, false, false) // 'star'
 */
export function classifyBodyType(
  magnitude: number,
  mass: number,
  gravity: number,
  temperature: number,
  isDocumentedFlag: boolean,
  hasPurpose: boolean,
  isComplexForSize: boolean,
  hasDeadCode: boolean,
): CelestialBody['type'] {
  if (!hasPurpose && !isDocumentedFlag && gravity === 0) return 'dark-matter'
  if (gravity >= 5 && mass >= 50 && !isDocumentedFlag) return 'black-hole'
  if (isComplexForSize) return 'supernova'
  if (hasDeadCode) return 'pulsar'
  if (magnitude >= 60 && gravity >= 3) return 'star'
  if (magnitude >= 30 && gravity >= 1) return 'planet'
  if (gravity >= 2 && magnitude < 20) return 'comet'
  if (magnitude >= 10) return 'moon'
  return 'asteroid'
}

/**
 * Detect if a file is complex relative to its size
 * @example
 * isComplexForSize(100, 20) // true (complexity density > 0.15)
 */
export function isComplexForSize(complexity: number, mass: number): boolean {
  if (mass < 5) return false
  return complexity / mass > 0.2
}

/**
 * Detect dead code indicators
 * @example
 * hasDeadCodeIndicators('// TODO: remove') // true
 */
export function hasDeadCodeIndicators(content: string): boolean {
  const patterns = /(?:\/\/\s*(?:TODO|FIXME|HACK|DEPRECATED|UNUSED)|process\.exit|debugger)/gi
  return patterns.test(content)
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Classify a single file as a celestial body
 * @example
 * const body = classifyBody('export function main() {}', 'src/main.ts', ['src/main.ts'], ['export function main() {}'])
 */
export function classifyBody(content: string, filePath: string, allFiles: string[], contents: string[]): CelestialBody {
  const name = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') || filePath
  const mass = countLines(content)
  const gravity = countGravity(filePath, allFiles, contents)
  const exports = extractExports(content)
  const imports = extractImports(content)
  const temperature = computeComplexity(content)
  const distance = computeDistance(filePath)
  const documented = isDocumented(content)
  const purpose = hasClearPurpose(content)
  const complexForSize = isComplexForSize(temperature, mass)
  const deadCode = hasDeadCodeIndicators(content)

  const magnitude = Math.min(100, Math.round(
    (gravity * 10) +
    (exports.length * 5) +
    (documented ? 15 : 0) +
    (purpose ? 10 : 0) +
    Math.min(20, mass / 5),
  ))

  const type = classifyBodyType(magnitude, mass, gravity, temperature, documented, purpose, complexForSize, deadCode)

  return {
    file: filePath,
    name,
    type,
    magnitude,
    mass,
    gravity,
    temperature,
    distance,
    constellation: null,
    isObservable: documented && purpose,
  }
}

/**
 * Group bodies into constellations based on import relationships
 * @example
 * const constellations = mapConstellations(bodies, files, contents)
 */
export function mapConstellations(bodies: CelestialBody[], files: string[], contents: string[]): Constellation[] {
  const constellationMap = new Map<string, { files: string[]; connections: [string, string][] }>()

  for (let i = 0; i < files.length; i++) {
    const dir = files[i].split('/').slice(0, -1).join('/') || 'root'
    if (!constellationMap.has(dir)) {
      constellationMap.set(dir, { files: [], connections: [] })
    }
    const group = constellationMap.get(dir)!
    group.files.push(files[i])

    const imports = extractImports(contents[i])
    for (const imp of imports) {
      const resolved = resolveImport(imp, dir, files)
      if (resolved && resolved !== files[i]) {
        group.connections.push([files[i], resolved])
      }
    }
  }

  const constellations: Constellation[] = []
  for (const [name, group] of constellationMap) {
    const starBodies = bodies.filter(b => group.files.includes(b.file))
    const avgMagnitude = starBodies.length > 0
      ? Math.round(starBodies.reduce((s, b) => s + b.magnitude, 0) / starBodies.length)
      : 0
    const observable = starBodies.filter(b => b.isObservable).length
    const total = starBodies.length
    const isVisible = total > 0 && observable / total >= 0.5

    const shape = describeShape(group.connections, starBodies.length)

    constellations.push({
      name: name.split('/').pop() || name,
      stars: Array.from(new Set(group.files.filter(f => {
        const body = bodies.find(b => b.file === f)
        return body && (body.type === 'star' || body.magnitude >= 40)
      }))),
      connections: group.connections,
      brightness: avgMagnitude,
      size: group.files.length,
      shape,
      isVisible,
    })
  }

  for (const body of bodies) {
    const constName = body.file.split('/').slice(0, -1).join('/') || 'root'
    const con = constellations.find(c => c.name === constName.split('/').pop() || constName)
    if (con) {
      body.constellation = con.name
    }
  }

  return constellations
}

/**
 * Resolve an import path to a file path
 * @example
 * resolveImport('./foo', 'src/commands', ['src/commands/foo.ts']) // 'src/commands/foo.ts'
 */
export function resolveImport(importPath: string, fromDir: string, allFiles: string[]): string | null {
  if (importPath.startsWith('.')) {
    const clean = importPath.replace(/^\.\//, '').replace(/^\.\.\//, '')
    const resolved = fromDir + '/' + clean
    for (const f of allFiles) {
      if (f === resolved || f === resolved + '.ts' || f === resolved + '.js' || f === resolved + '/index.ts') {
        return f
      }
    }
  }
  return null
}

/**
 * Describe the shape formed by connections
 * @example
 * describeShape([['a', 'b'], ['b', 'c']], 3) // 'chain'
 */
export function describeShape(connections: [string, string][], bodyCount: number): string {
  if (connections.length === 0) return 'scattered'
  if (connections.length === 1) return 'binary'
  const targets = Array.from(new Set(connections.map(c => c[1])))
  if (targets.length === 1) return 'hub-and-spoke'
  if (connections.length >= bodyCount - 1) return 'mesh'
  return 'chain'
}

/**
 * Detect notable celestial events
 * @example
 * const events = detectCelestialEvents(bodies, constellations)
 */
export function detectCelestialEvents(bodies: CelestialBody[], constellations: Constellation[]): CelestialEvent[] {
  const events: CelestialEvent[] = []

  const blackHoles = bodies.filter(b => b.type === 'black-hole')
  for (const bh of blackHoles) {
    events.push({
      type: 'eclipse',
      description: `${bh.name} is a black hole consuming attention without giving back`,
      bodies: [bh.file],
      impact: 'high',
      recommendation: `Document and simplify ${bh.name} to make it more transparent`,
    })
  }

  const darkMatter = bodies.filter(b => b.type === 'dark-matter')
  if (darkMatter.length >= 3) {
    events.push({
      type: 'alignment',
      description: `${darkMatter.length} files with unclear purpose aligned in the codebase`,
      bodies: darkMatter.map(d => d.file),
      impact: 'medium',
      recommendation: 'Clarify purpose or remove unused code',
    })
  }

  const supernovae = bodies.filter(b => b.type === 'supernova')
  for (const sn of supernovae) {
    events.push({
      type: 'collision',
      description: `${sn.name} has exploded in complexity (temp: ${sn.temperature})`,
      bodies: [sn.file],
      impact: 'medium',
      recommendation: `Reduce complexity in ${sn.name}`,
    })
  }

  const invisible = constellations.filter(c => !c.isVisible && c.size >= 3)
  for (const con of invisible) {
    events.push({
      type: 'formation',
      description: `Constellation ${con.name} is forming but lacks documentation`,
      bodies: con.stars,
      impact: 'low',
      recommendation: `Improve documentation for ${con.name} subsystem`,
    })
  }

  const highGravity = bodies.filter(b => b.gravity >= 5)
  if (highGravity.length >= 2) {
    events.push({
      type: 'convergence',
      description: `${highGravity.length} high-gravity bodies draw imports from many files`,
      bodies: highGravity.map(h => h.file),
      impact: 'informational',
      recommendation: 'Ensure these central files are well-maintained',
    })
  }

  return events
}

/**
 * Map the cosmic web — large-scale structure of the codebase
 * @example
 * const web = mapCosmicWeb(bodies, constellations)
 */
export function mapCosmicWeb(bodies: CelestialBody[], constellations: Constellation[]): CosmicWeb[] {
  const web: CosmicWeb[] = []

  const clusterFiles = new Map<string, Set<string>>()
  for (const body of bodies) {
    const cluster = body.constellation || 'unclustered'
    if (!clusterFiles.has(cluster)) clusterFiles.set(cluster, new Set())
    clusterFiles.get(cluster)!.add(body.file)
  }

  const allClustered = new Set<string>()
  for (const files of clusterFiles.values()) {
    for (const f of files) allClustered.add(f)
  }

  for (const [cluster, fileSet] of clusterFiles) {
    const con = constellations.find(c => c.name === cluster)
    const filaments: string[] = []
    if (con) {
      for (const [from, to] of con.connections) {
        filaments.push(`${from} → ${to}`)
      }
    }

    const voidFiles = bodies
      .filter(b => b.gravity === 0 && b.constellation === cluster)
      .map(b => b.file)

    const density = fileSet.size > 0
      ? Math.min(100, Math.round((con?.connections.length || 0) / fileSet.size * 50))
      : 0

    web.push({
      cluster,
      filaments: Array.from(new Set(filaments)),
      density,
      voidFiles: Array.from(new Set(voidFiles)),
    })
  }

  return web
}

/**
 * Compute the ratio of observable (well-documented) code
 * @example
 * computeObservableRatio(bodies) // 75.0
 */
export function computeObservableRatio(bodies: CelestialBody[]): number {
  if (bodies.length === 0) return 100
  const observable = bodies.filter(b => b.isObservable).length
  return Math.round((observable / bodies.length) * 1000) / 10
}

/**
 * Compute the ratio of dark matter (unclear purpose) code
 * @example
 * computeDarkMatterRatio(bodies) // 10.0
 */
export function computeDarkMatterRatio(bodies: CelestialBody[]): number {
  if (bodies.length === 0) return 0
  const dm = bodies.filter(b => b.type === 'dark-matter').length
  return Math.round((dm / bodies.length) * 1000) / 10
}

/**
 * Classify overall clarity of the codebase
 * @example
 * classifyOverallClarity(90, 5) // 'crystal-clear'
 */
export function classifyOverallClarity(observableRatio: number, darkMatterRatio: number): ObservatoryStats['overallClarity'] {
  if (observableRatio >= 80 && darkMatterRatio <= 10) return 'crystal-clear'
  if (observableRatio >= 60 && darkMatterRatio <= 20) return 'clear'
  if (observableRatio >= 40 && darkMatterRatio <= 30) return 'partly-cloudy'
  if (observableRatio >= 20) return 'overcast'
  return 'opaque'
}

/**
 * Compute cosmic expansion score
 * @example
 * computeCosmicExpansion(bodies) // 50
 */
export function computeCosmicExpansion(bodies: CelestialBody[]): number {
  if (bodies.length === 0) return 0
  const totalMass = bodies.reduce((s, b) => s + b.mass, 0)
  const avgMass = totalMass / bodies.length
  const largeFiles = bodies.filter(b => b.mass > avgMass * 2).length
  return Math.min(100, Math.round((largeFiles / bodies.length) * 200))
}

/**
 * Generate recommendations for improving the codebase
 * @example
 * generateRecommendations(bodies, constellations, events, stats)
 */
export function generateRecommendations(
  bodies: CelestialBody[],
  constellations: Constellation[],
  events: CelestialEvent[],
  stats: ObservatoryStats,
): string[] {
  const recs: string[] = []

  if (stats.blackHoleCount > 0) {
    recs.push(`Investigate ${stats.blackHoleCount} black hole(s) — files that consume attention but give little back`)
  }

  if (stats.darkMatterRatio > 15) {
    recs.push(`Reduce dark matter (${stats.darkMatterRatio}% unclear) — clarify purpose or remove`)
  }

  if (stats.supernovae > 0) {
    recs.push(`Simplify ${stats.supernovae} supernova file(s) with high complexity relative to size`)
  }

  const invisible = constellations.filter(c => !c.isVisible)
  if (invisible.length > 0) {
    recs.push(`Improve documentation for ${invisible.length} invisible constellation(s)`)
  }

  const voidCount = bodies.filter(b => b.gravity === 0 && b.type !== 'dark-matter').length
  if (voidCount > 0) {
    recs.push(`Connect or evaluate ${voidCount} isolated file(s) with no importers`)
  }

  if (stats.observableRatio < 50) {
    recs.push('Increase observability by adding documentation and clear exports')
  }

  const critical = events.filter(e => e.impact === 'critical' || e.impact === 'high')
  if (critical.length > 0) {
    recs.push(`Address ${critical.length} high-impact celestial event(s)`)
  }

  return recs
}

/**
 * Build the complete observatory result
 * @example
 * const result = buildObservatoryResult(['src/main.ts'], ['code'], {})
 */
export function buildObservatoryResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): ObservatoryResult {
  const bodies = files.map((f, i) => classifyBody(contents[i], f, files, contents))
  const constellations = mapConstellations(bodies, files, contents)
  const events = detectCelestialEvents(bodies, constellations)
  const web = mapCosmicWeb(bodies, constellations)

  const observableRatio = computeObservableRatio(bodies)
  const darkMatterRatio = computeDarkMatterRatio(bodies)
  const cosmicExpansion = computeCosmicExpansion(bodies)
  const overallClarity = classifyOverallClarity(observableRatio, darkMatterRatio)

  const totalMass = bodies.reduce((s, b) => s + b.mass, 0)
  const maxGravityBody = bodies.reduce<CelestialBody | null>((max, b) => {
    if (!max || b.gravity > max.gravity) return b
    return max
  }, null)

  const stars = bodies.filter(b => b.type === 'star').length
  const blackHoles = bodies.filter(b => b.type === 'black-hole').length
  const darkMatter = bodies.filter(b => b.type === 'dark-matter').length
  const pulsars = bodies.filter(b => b.type === 'pulsar').length
  const supernovae = bodies.filter(b => b.type === 'supernova').length

  const stats: ObservatoryStats = {
    totalBodies: bodies.length,
    stars,
    blackHoles,
    darkMatter,
    pulsars,
    supernovae,
    totalConstellations: constellations.length,
    visibleConstellations: constellations.filter(c => c.isVisible).length,
    avgMagnitude: bodies.length > 0
      ? Math.round(bodies.reduce((s, b) => s + b.magnitude, 0) / bodies.length * 10) / 10
      : 0,
    avgGravity: bodies.length > 0
      ? Math.round(bodies.reduce((s, b) => s + b.gravity, 0) / bodies.length * 10) / 10
      : 0,
    maxGravity: maxGravityBody?.file || '',
    observableRatio,
    darkMatterRatio,
    blackHoleCount: blackHoles,
    cosmicExpansion,
    universeSize: totalMass,
    overallClarity,
  }

  const recommendations = generateRecommendations(bodies, constellations, events, stats)

  return { bodies, constellations, events, web, stats, recommendations }
}
