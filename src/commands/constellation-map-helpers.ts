// ─── Types ─────────────────────────────────────────────────────────────────────

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'

export interface StarConnection {
  from: string
  to: string
  strength: number
  type: 'import' | 're-export' | 'type-only'
}

export interface Star {
  file: string
  name: string
  brightness: number
  magnitude: number
  spectralClass: SpectralClass
  position: [number, number]
  connections: StarConnection[]
}

export interface ConstellationGroup {
  name: string
  description: string
  stars: string[]
  connections: StarConnection[]
  brightest: string
  totalBrightness: number
  coherence: number
}

export interface NavigationPath {
  from: string
  to: string
  path: string[]
  distance: number
  difficulty: number
  waypoints: string[]
}

export interface ConstellationMapStats {
  totalStars: number
  totalConstellations: number
  totalConnections: number
  brightestStar: string
  dimmestStar: string
  largestConstellation: string
  smallestConstellation: string
  avgBrightness: number
  avgMagnitude: number
  orphanStars: number
  chartCoverage: number
  navigability: number
}

export interface ConstellationMapResult {
  stars: Star[]
  constellations: ConstellationGroup[]
  paths: NavigationPath[]
  stats: ConstellationMapStats
  recommendations: string[]
}

export interface ConstellationMapOptions {
  verbose?: boolean
}

// ─── Spectral Classification ───────────────────────────────────────────────────

/**
 * Classify spectral class from file path and content.
 *
 * @example
 * classifySpectralClass('src/commands/foo.ts', 'export default class Foo')
 */
export function classifySpectralClass(file: string, content: string): SpectralClass {
  if (file.includes('test/') || file.includes('.test.') || file.includes('.spec.')) return 'F'
  if (file.includes('format-helpers') || file.includes('-format-helpers')) return 'M'
  if (content.includes('interface ') || content.includes('type ') && content.includes('export type')) return 'K'
  if (file.includes('config') || file.includes('Config')) return 'G'
  if (file.includes('commands/') || file.includes('command')) return 'B'
  if (file.includes('core/') || file.includes('core')) return 'O'
  if (content.includes('export function') || content.includes('export default') || content.includes('export class')) return 'A'
  return 'A'
}

// ─── Brightness ────────────────────────────────────────────────────────────────

/**
 * Compute star brightness (importance). 0-100.
 *
 * @example
 * computeBrightness('core.ts', 5)
 */
export function computeBrightness(file: string, importedByCount: number): number {
  let score = Math.min(importedByCount * 12, 80)
  if (file.includes('core/')) score += 15
  if (file.includes('index.ts')) score += 10
  if (file.includes('commands/') && !file.includes('-helpers') && !file.includes('-format')) score += 8
  return Math.max(0, Math.min(100, score))
}

// ─── Magnitude ─────────────────────────────────────────────────────────────────

/**
 * Compute star magnitude (complexity). 0-100.
 * Higher = dimmer/harder to understand.
 *
 * @example
 * computeMagnitude('function foo() { if(x){for(let i=0;i<10;i++){}} }')
 */
export function computeMagnitude(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  const branches = (content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b/g) || []).length
  const functions = (content.match(/function\s+\w+|=>\s*[^;]+/g) || []).length
  const nesting = computeMaxNesting(content)
  const anyTypes = (content.match(/:\s*any\b/g) || []).length

  let score = branches * 3 + functions * 2 + nesting * 4 + anyTypes * 5
  score = Math.round((score / Math.max(total, 1)) * 100)
  return Math.max(0, Math.min(100, score))
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute max nesting depth.
 *
 * @example
 * computeMaxNesting('{{{x}}}') // 3
 */
export function computeMaxNesting(content: string): number {
  let max = 0
  let depth = 0
  for (const ch of content) {
    if (ch === '{') { depth++; if (depth > max) max = depth }
    else if (ch === '}') { depth = Math.max(0, depth - 1) }
  }
  return max
}

/**
 * Extract imports from content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const m of content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  for (const m of content.matchAll(/import\(['"](.+?)['"]\)/g) || []) {
    if (m[1]) imports.push(m[1])
  }
  return imports
}

/**
 * Extract re-exports from content.
 *
 * @example
 * extractReExports("export { foo } from './bar'") // ['./bar']
 */
export function extractReExports(content: string): string[] {
  const exports: string[] = []
  for (const m of content.matchAll(/export\s+\{[^}]*\}\s+from\s+['"](.+?)['"]/g) || []) {
    if (m[1]) exports.push(m[1])
  }
  for (const m of content.matchAll(/export\s+\*\s+from\s+['"](.+?)['"]/g) || []) {
    if (m[1]) exports.push(m[1])
  }
  return exports
}

/**
 * Resolve import path to known file.
 *
 * @example
 * resolveImportPath('./utils', new Set(['utils.ts'])) // 'utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  const stripped = importPath.replace(/^\.\//, '')
  for (const ext of ['', '.ts', '.js', '.tsx', '.jsx', '/index.ts', '/index.js']) {
    const candidate = stripped + ext
    if (knownFiles.has(candidate)) return candidate
  }
  return null
}

// ─── Connections ───────────────────────────────────────────────────────────────

/**
 * Build connections from files and contents.
 *
 * @example
 * buildConnections(['a.ts', 'b.ts'], ["import { x } from './b'", "export const x = 1"])
 */
export function buildConnections(files: string[], contents: string[]): StarConnection[] {
  const knownSet = new Set(files)
  const connections: StarConnection[] = []

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    const imports = extractImports(content)
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved) {
        const isTypeOnly = /^import\s+type\b/.test(content.substring(content.indexOf(imp) - 30, content.indexOf(imp)))
        connections.push({
          from: files[i],
          to: resolved,
          strength: computeConnectionStrength(files[i], resolved, content),
          type: isTypeOnly ? 'type-only' : 'import',
        })
      }
    }

    const reExports = extractReExports(content)
    for (const exp of reExports) {
      const resolved = resolveImportPath(exp, knownSet)
      if (resolved) {
        connections.push({
          from: files[i],
          to: resolved,
          strength: 60,
          type: 're-export',
        })
      }
    }
  }

  return connections
}

/**
 * Compute connection strength. 0-100.
 *
 * @example
 * computeConnectionStrength('a.ts', 'b.ts', content)
 */
export function computeConnectionStrength(_from: string, _to: string, content: string): number {
  const imports = (content.match(/import\s+/g) || []).length
  const namedImports = (content.match(/\{[^}]+\}/g) || []).length
  const base = 40
  return Math.min(100, base + imports * 5 + namedImports * 10)
}

// ─── Position Assignment ───────────────────────────────────────────────────────

/**
 * Assign positions to stars based on directory grouping.
 *
 * @example
 * assignPositions(['src/a.ts', 'src/b.ts', 'test/c.ts'], connections)
 */
export function assignPositions(files: string[], _connections: StarConnection[]): Map<string, [number, number]> {
  const positions = new Map<string, [number, number]>()
  const groups: Record<string, string[]> = {}

  for (const file of files) {
    const parts = file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!groups[dir]) groups[dir] = []
    groups[dir].push(file)
  }

  const dirs = Object.keys(groups)
  const cols = Math.ceil(Math.sqrt(dirs.length))
  let colIdx = 0
  let rowIdx = 0

  for (const dir of dirs) {
    const groupFiles = groups[dir]
    const baseX = colIdx * 20
    const baseY = rowIdx * 15

    for (let i = 0; i < groupFiles.length; i++) {
      const angle = (i / Math.max(groupFiles.length, 1)) * Math.PI * 2
      const radius = Math.min(5, groupFiles.length)
      positions.set(groupFiles[i], [
        Math.round((baseX + Math.cos(angle) * radius) * 10) / 10,
        Math.round((baseY + Math.sin(angle) * radius) * 10) / 10,
      ])
    }

    colIdx++
    if (colIdx >= cols) { colIdx = 0; rowIdx++ }
  }

  return positions
}

// ─── Constellation Grouping ────────────────────────────────────────────────────

const MYTH_PREFIXES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa']
const MYTH_NAMES = ['Centauri', 'Orionis', 'Lyrae', 'Cygni', 'Draconis', 'Aquilae', 'Pegasi', 'Tauri', 'Leonis', 'Scorpii']

/**
 * Generate constellation name from files.
 *
 * @example
 * generateConstellationName(['src/helpers/a.ts'], 'utility')
 */
export function generateConstellationName(files: string[], purpose: string): string {
  const dir = files.length > 0 ? files[0].split('/').slice(0, -1).join('/') : ''
  const dirName = dir.split('/').pop() || 'Root'
  const prefixIdx = Math.abs(hashString(dirName)) % MYTH_PREFIXES.length
  const nameIdx = Math.abs(hashString(purpose + dirName)) % MYTH_NAMES.length
  return `${MYTH_PREFIXES[prefixIdx]} ${MYTH_NAMES[nameIdx]}`
}

function hashString(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return hash
}

/**
 * Group stars into constellations.
 *
 * @example
 * groupIntoConstellations(stars, connections)
 */
export function groupIntoConstellations(stars: Star[], connections: StarConnection[]): ConstellationGroup[] {
  const starMap = new Map(stars.map((s) => [s.file, s]))
  const dirGroups: Record<string, string[]> = {}

  for (const star of stars) {
    const parts = star.file.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!dirGroups[dir]) dirGroups[dir] = []
    dirGroups[dir].push(star.file)
  }

  const constellations: ConstellationGroup[] = []

  for (const [dir, files] of Object.entries(dirGroups)) {
    const groupStars = files.map((f) => starMap.get(f)).filter((s): s is Star => s !== undefined)
    if (groupStars.length === 0) continue

    const dirConnections = connections.filter((c) => files.includes(c.from) && files.includes(c.to))
    const brightest = [...groupStars].sort((a, b) => b.brightness - a.brightness)[0]
    const totalBrightness = groupStars.reduce((s, st) => s + st.brightness, 0)

    const internalConns = dirConnections.length
    const maxConns = files.length * (files.length - 1) / 2
    const coherence = maxConns > 0 ? Math.round((internalConns / maxConns) * 100) : 0

    const purpose = inferPurpose(groupStars)
    const name = generateConstellationName(files, purpose)

    constellations.push({
      name,
      description: `${purpose} modules in ${dir}`,
      stars: files,
      connections: dirConnections,
      brightest: brightest.file,
      totalBrightness,
      coherence,
    })
  }

  return constellations
}

function inferPurpose(stars: Star[]): string {
  const classes = stars.map((s) => s.spectralClass)
  if (classes.includes('O')) return 'core infrastructure'
  if (classes.includes('B')) return 'CLI command'
  if (classes.includes('F')) return 'test'
  if (classes.includes('M')) return 'formatting'
  if (classes.includes('K')) return 'type definition'
  return 'utility'
}

// ─── Navigation ────────────────────────────────────────────────────────────────

/**
 * Find shortest navigation path using BFS.
 *
 * @example
 * findNavigationPath('a.ts', 'c.ts', stars, connections)
 */
export function findNavigationPath(from: string, to: string, stars: Star[], connections: StarConnection[]): NavigationPath | null {
  if (from === to) return { from, to, path: [from], distance: 0, difficulty: 0, waypoints: [] }

  const adj: Record<string, string[]> = {}
  for (const star of stars) adj[star.file] = []
  for (const conn of connections) {
    if (!adj[conn.from]) adj[conn.from] = []
    if (!adj[conn.to]) adj[conn.to] = []
    adj[conn.from].push(conn.to)
    adj[conn.to].push(conn.from)
  }

  const visited = new Set<string>()
  const queue: { node: string; path: string[] }[] = [{ node: from, path: [from] }]
  visited.add(from)

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.node === to) {
      const starMap = new Map(stars.map((s) => [s.file, s]))
      const difficulty = computePathDifficulty(current.path, starMap)
      const waypoints = current.path.filter((p) => {
        const star = starMap.get(p)
        return star && star.brightness > 60
      })
      return { from, to, path: current.path, distance: current.path.length - 1, difficulty, waypoints }
    }

    const neighbors = adj[current.node] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push({ node: neighbor, path: [...current.path, neighbor] })
      }
    }
  }

  return null
}

/**
 * Compute path difficulty.
 *
 * @example
 * computePathDifficulty(['a.ts', 'b.ts', 'c.ts'], starMap)
 */
export function computePathDifficulty(path: string[], starMap: Map<string, Star>): number {
  if (path.length <= 1) return 0
  let totalMagnitude = 0
  let count = 0
  for (const p of path) {
    const star = starMap.get(p)
    if (star) { totalMagnitude += star.magnitude; count++ }
  }
  const avgMag = count > 0 ? totalMagnitude / count : 0
  return Math.round((avgMag * 0.6 + (path.length - 1) * 10) * 10) / 10
}

// ─── Orphan Stars ──────────────────────────────────────────────────────────────

/**
 * Find orphan stars (no connections).
 *
 * @example
 * findOrphanStars(stars, connections)
 */
export function findOrphanStars(stars: Star[], connections: StarConnection[]): string[] {
  const connected = new Set<string>()
  for (const c of connections) {
    connected.add(c.from)
    connected.add(c.to)
  }
  return stars.filter((s) => !connected.has(s.file)).map((s) => s.file)
}

// ─── Chart Coverage & Navigability ─────────────────────────────────────────────

/**
 * Compute chart coverage. 0-100.
 *
 * @example
 * computeChartCoverage(stars, allFiles)
 */
export function computeChartCoverage(stars: Star[], allFiles: string[]): number {
  if (allFiles.length === 0) return 100
  const mapped = new Set(stars.map((s) => s.file))
  return Math.round((mapped.size / allFiles.length) * 100)
}

/**
 * Compute navigability. 0-100.
 *
 * @example
 * computeNavigability(paths, connections)
 */
export function computeNavigability(paths: NavigationPath[], connections: StarConnection[]): number {
  if (connections.length === 0) return 0
  const reachable = paths.filter((p) => p !== null).length
  const totalPossible = paths.length
  if (totalPossible === 0) return 100
  const reachFactor = (reachable / totalPossible) * 60
  const connDensity = Math.min(connections.length / 10, 1) * 40
  return Math.round(reachFactor + connDensity)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateConstellationMapRecommendations(stars, constellations, [], stats)
 */
export function generateConstellationMapRecommendations(stars: Star[], constellations: ConstellationGroup[], _paths: NavigationPath[], stats: ConstellationMapStats): string[] {
  const recs: string[] = []

  if (stats.orphanStars > 0) {
    recs.push(`${stats.orphanStars} orphan star(s) found — consider connecting or documenting their isolation`)
  }

  if (stats.chartCoverage < 80) {
    recs.push('Chart coverage below 80% — some files may be missing from the map')
  }

  if (stats.navigability < 50) {
    reformat: recs.push('Low navigability — add more module connections for easier codebase traversal')
  }

  const dimStars = stars.filter((s) => s.brightness < 10 && s.magnitude < 20)
  if (dimStars.length > 0) {
    recs.push(`${dimStars.length} dim star(s) with low importance — consider if they are needed`)
  }

  const incoherent = constellations.filter((c) => c.coherence < 20 && c.stars.length > 2)
  if (incoherent.length > 0) {
    recs.push(`${incoherent.length} constellation(s) with low coherence — files may not belong together`)
  }

  if (recs.length === 0) {
    recs.push('Star chart looks well-organized — constellations are coherent and navigable')
  }

  return recs
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete constellation map result.
 *
 * @example
 * buildConstellationMapResult(['a.ts'], ['export const x = 1'], {})
 */
export function buildConstellationMapResult(files: string[], contents: string[], options: ConstellationMapOptions): ConstellationMapResult {
  const knownSet = new Set(files)
  const connections = buildConnections(files, contents)

  const importedByCounts: Record<string, number> = {}
  for (const c of connections) {
    importedByCounts[c.to] = (importedByCounts[c.to] || 0) + 1
  }

  const positions = assignPositions(files, connections)

  const stars: Star[] = files.map((file, i) => {
    const content = contents[i] || ''
    const name = file.split('/').pop()?.replace(/\.\w+$/, '') || file
    const brightness = computeBrightness(file, importedByCounts[file] || 0)
    const magnitude = computeMagnitude(content)
    const spectralClass = classifySpectralClass(file, content)
    const pos = positions.get(file) || [0, 0]
    const starConns = connections.filter((c) => c.from === file || c.to === file)

    return { file, name, brightness, magnitude, spectralClass, position: pos, connections: starConns }
  })

  const constellations = groupIntoConstellations(stars, connections)

  const paths: NavigationPath[] = []
  if (files.length >= 2 && files.length <= 30) {
    const topFiles = [...stars].sort((a, b) => b.brightness - a.brightness).slice(0, 5).map((s) => s.file)
    for (let i = 0; i < topFiles.length; i++) {
      for (let j = i + 1; j < topFiles.length; j++) {
        const path = findNavigationPath(topFiles[i], topFiles[j], stars, connections)
        if (path) paths.push(path)
      }
    }
  }

  const orphans = findOrphanStars(stars, connections)
  const chartCoverage = computeChartCoverage(stars, files)
  const navigability = computeNavigability(paths, connections)

  const sortedByBrightness = [...stars].sort((a, b) => b.brightness - a.brightness)
  const largestConstellation = constellations.length > 0 ? [...constellations].sort((a, b) => b.stars.length - a.stars.length)[0].name : ''
  const smallestConstellation = constellations.length > 0 ? [...constellations].sort((a, b) => a.stars.length - b.stars.length)[0].name : ''

  const avgBrightness = stars.length > 0 ? Math.round(stars.reduce((s, st) => s + st.brightness, 0) / stars.length) : 0
  const avgMagnitude = stars.length > 0 ? Math.round(stars.reduce((s, st) => s + st.magnitude, 0) / stars.length) : 0

  const stats: ConstellationMapStats = {
    totalStars: files.length,
    totalConstellations: constellations.length,
    totalConnections: connections.length,
    brightestStar: sortedByBrightness[0]?.file || '',
    dimmestStar: sortedByBrightness[sortedByBrightness.length - 1]?.file || '',
    largestConstellation,
    smallestConstellation,
    avgBrightness,
    avgMagnitude,
    orphanStars: orphans.length,
    chartCoverage,
    navigability,
  }

  const recommendations = generateConstellationMapRecommendations(stars, constellations, paths, stats)

  if (options.verbose) {
    for (const star of stars) {
      if (star.connections.length === 0 && star.spectralClass === 'A') {
        star.connections.push({ from: star.file, to: '(none)', strength: 0, type: 'import' })
      }
    }
  }

  return { stars, constellations, paths, stats, recommendations }
}
