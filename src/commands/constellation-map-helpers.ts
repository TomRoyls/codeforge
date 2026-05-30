// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface StarPosition {
  x: number
  y: number
}

export interface StarConnection {
  from: string
  to: string
  type: 'import' | 'export' | 'reference' | 'inheritance' | 'composition'
  strength: number
  isInterConstellation: boolean
  isCircular: boolean
  distance: number
}

export interface StarNode {
  file: string
  brightness: number
  magnitude: number
  distance: number
  spectralClass: 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M'
  starType: 'supergiant' | 'giant' | 'dwarf' | 'neutron' | 'white-dwarf' | 'brown-dwarf'
  connections: StarConnection[]
  imports: string[]
  importedBy: string[]
  inConstellation: string
  position: StarPosition
  isNexus: boolean
  isOrphan: boolean
  isBridge: boolean
  isHub: boolean
  luminosity: number
}

export interface ConstellationGroup {
  name: string
  directory: string
  stars: StarNode[]
  connections: StarConnection[]
  internalConnections: number
  externalConnections: number
  bridgeCount: number
  starCount: number
  avgBrightness: number
  coherence: number
  density: number
  pattern: 'chain' | 'star' | 'mesh' | 'tree' | 'ring' | 'bus' | 'isolated'
  hasCycle: boolean
  cycleCount: number
  brightestStar: string
  hubStar: string
  health: 'vibrant' | 'healthy' | 'stable' | 'fading' | 'dim' | 'dark'
  mythologicalName: string
}

export interface GalacticStructure {
  totalStars: number
  totalConnections: number
  totalConstellations: number
  avgBrightness: number
  avgCoherence: number
  totalBridges: number
  totalCycles: number
  nexusCount: number
  orphanCount: number
  hubCount: number
  interConstellationRatio: number
  connectivity: number
  isWellStructured: boolean
  structureType: 'spiral' | 'elliptical' | 'irregular' | 'cluster' | 'void'
}

export interface ConstellationMapStats {
  totalFiles: number
  totalConstellations: number
  totalConnections: number
  totalBridges: number
  totalCycles: number
  avgBrightness: number
  avgMagnitude: number
  avgCoherence: number
  avgConnectionStrength: number
  nexusCount: number
  orphanCount: number
  hubCount: number
  bridgeCount: number
  supergiantCount: number
  dwarfCount: number
  interConstellationRatio: number
  connectivity: number
  isWellStructured: boolean
  structureType: string
  cartographerGrade: 'master-astronomer' | 'astronomer' | 'navigator' | 'stargazer' | 'lost' | 'blind'
  brightestStar: string
  dimmestStar: string
  biggestConstellation: string
  mostConnected: string
  mostIsolated: string
  mostBridged: string
  cycleWarning: string[]
}

export interface ConstellationMapResult {
  stars: StarNode[]
  connections: StarConnection[]
  constellations: ConstellationGroup[]
  galaxy: GalacticStructure
  stats: ConstellationMapStats
  recommendations: string[]
}

// ─── Import Extraction ───────────────────────────────────────────────────────

/**
 * Extract import paths from file content
 * @example
 * extractImports('import { x } from "./a"') // ['./a']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const patterns = [
    /import\s+.*?from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      const imp = m[1]
      if (imp && (imp.startsWith('.') || imp.startsWith('/'))) {
        imports.push(imp)
      }
    }
  }
  return imports
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify spectral class from complexity
 * @example
 * classifySpectralClass(95) // 'O'
 */
export function classifySpectralClass(complexity: number): StarNode['spectralClass'] {
  if (complexity >= 80) return 'O'
  if (complexity >= 65) return 'B'
  if (complexity >= 50) return 'A'
  if (complexity >= 35) return 'F'
  if (complexity >= 20) return 'G'
  if (complexity >= 10) return 'K'
  return 'M'
}

/**
 * Classify star type from exports and connections
 * @example
 * classifyStarType(10, 8) // 'supergiant'
 */
export function classifyStarType(exports: number, connectionCount: number): StarNode['starType'] {
  if (exports >= 8 && connectionCount >= 6) return 'supergiant'
  if (exports >= 5 || connectionCount >= 4) return 'giant'
  if (exports >= 3 && connectionCount >= 3) return 'giant'
  if (connectionCount >= 8) return 'neutron'
  if (exports >= 2) return 'dwarf'
  if (connectionCount >= 1) return 'white-dwarf'
  return 'brown-dwarf'
}

/**
 * Classify constellation pattern from connection structure
 * @example
 * classifyConstellationPattern(5, 1, 0, false) // 'star'
 */
export function classifyConstellationPattern(
  starCount: number,
  maxConnections: number,
  cycleCount: number,
  hasSingleHub: boolean,
): ConstellationGroup['pattern'] {
  if (starCount <= 1) return 'isolated'
  if (cycleCount > 0 && starCount >= 3) return 'ring'
  if (hasSingleHub && maxConnections >= 3) return 'star'
  if (starCount >= 4 && maxConnections >= 2) return 'mesh'
  if (maxConnections <= 2 && starCount >= 3) return 'chain'
  if (starCount >= 3 && maxConnections >= 2) return 'tree'
  return 'bus'
}

/**
 * Classify constellation health from metrics
 * @example
 * classifyConstellationHealth(80, 0.7) // 'vibrant'
 */
export function classifyConstellationHealth(
  avgBrightness: number,
  coherence: number,
): ConstellationGroup['health'] {
  const score = avgBrightness * 0.5 + coherence * 100 * 0.5
  if (score >= 75) return 'vibrant'
  if (score >= 60) return 'healthy'
  if (score >= 45) return 'stable'
  if (score >= 30) return 'fading'
  if (score >= 15) return 'dim'
  return 'dark'
}

/**
 * Classify structure type of the overall galaxy
 * @example
 * classifyStructureType(5, 0.3, 0.6) // 'spiral'
 */
export function classifyStructureType(
  constellationCount: number,
  interRatio: number,
  avgCoherence: number,
): GalacticStructure['structureType'] {
  if (constellationCount <= 1) return 'cluster'
  if (constellationCount <= 2 && interRatio < 0.2) return 'void'
  if (avgCoherence >= 0.6 && interRatio < 0.3) return 'spiral'
  if (avgCoherence >= 0.4) return 'elliptical'
  if (interRatio >= 0.5) return 'irregular'
  return 'elliptical'
}

/**
 * Classify cartographer grade from connectivity
 * @example
 * classifyCartographerGrade(85) // 'master-astronomer'
 */
export function classifyCartographerGrade(connectivity: number): ConstellationMapStats['cartographerGrade'] {
  if (connectivity >= 80) return 'master-astronomer'
  if (connectivity >= 60) return 'astronomer'
  if (connectivity >= 40) return 'navigator'
  if (connectivity >= 20) return 'stargazer'
  if (connectivity >= 5) return 'lost'
  return 'blind'
}

// ─── Cycle Detection ─────────────────────────────────────────────────────────

/**
 * Detect circular dependency cycles
 * @example
 * detectCycles([{from:'a',to:'b',...},{from:'b',to:'a',...}]) // [['a','b']]
 */
export function detectCycles(connections: StarConnection[]): string[][] {
  const adj = new Map<string, Set<string>>()
  for (const c of connections) {
    const existing = adj.get(c.from)
    if (existing) {
      existing.add(c.to)
    } else {
      adj.set(c.from, new Set([c.to]))
    }
  }

  const visited = new Set<string>()
  const inStack = new Set<string>()
  const cycles: string[][] = []

  function dfs(node: string, path: string[]): void {
    visited.add(node)
    inStack.add(node)
    const neighbors = adj.get(node)
    if (neighbors) {
      for (const n of neighbors) {
        if (inStack.has(n)) {
          const cycleStart = path.indexOf(n)
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart).concat(n))
          }
        } else if (!visited.has(n)) {
          dfs(n, [...path, n])
        }
      }
    }
    inStack.delete(node)
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      dfs(node, [node])
    }
  }

  return cycles
}

// ─── Connection Mapping ──────────────────────────────────────────────────────

/**
 * Map a connection between two files
 * @example
 * mapConnection('a.ts', 'b.ts', 'import') // StarConnection
 */
export function mapConnection(
  from: string,
  to: string,
  type: StarConnection['type'],
): StarConnection {
  const fromDir = from.includes('/') ? from.slice(0, from.lastIndexOf('/')) : '.'
  const toDir = to.includes('/') ? to.slice(0, to.lastIndexOf('/')) : '.'
  const isInterConstellation = fromDir !== toDir

  return {
    from,
    to,
    type,
    strength: 50,
    isInterConstellation,
    isCircular: false,
    distance: isInterConstellation ? 2 : 1,
  }
}

// ─── Star Node Mapping ───────────────────────────────────────────────────────

/**
 * Map a single file as a star node
 * @example
 * mapStarNode('export function f() {}', 'f.ts', [], []) // StarNode
 */
export function mapStarNode(
  content: string,
  filePath: string,
  imports: string[],
  importedBy: string[],
): StarNode {
  const lines = content.split('\n')
  const totalLines = lines.length
  const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//'))

  const exportCount = (content.match(/\bexport\s+/g) ?? []).length
  const functionCount = (content.match(/(?:function\s+\w+|=>\s*[{(])/g) ?? []).length
  const classCount = (content.match(/\bclass\s+\w+/g) ?? []).length
  const interfaceCount = (content.match(/\binterface\s+\w+/g) ?? []).length
  const complexity = Math.min(100,
    functionCount * 8 + classCount * 12 + interfaceCount * 6 + codeLines.length,
  )

  const connectionCount = imports.length + importedBy.length
  const brightness = Math.min(100, exportCount * 10 + importedBy.length * 15 + (totalLines > 50 ? 10 : 0))
  const magnitude = Math.max(0, 100 - brightness)
  const distance = filePath.split('/').length - 1
  const spectralClass = classifySpectralClass(complexity)
  const starType = classifyStarType(exportCount, connectionCount)
  const luminosity = Math.min(100, exportCount * 15 + (content.match(/\bexport\s+default\b/g) ?? []).length * 20)

  const inConstellation = filePath.includes('/')
    ? filePath.slice(0, filePath.lastIndexOf('/'))
    : '.'

  const isNexus = connectionCount >= 5
  const isOrphan = connectionCount === 0
  const isHub = connectionCount >= 3
  const isBridge = imports.some(imp => {
    const impDir = imp.includes('/') ? imp.slice(0, imp.lastIndexOf('/')) : '.'
    return impDir !== inConstellation
  }) || importedBy.some(imp => {
    const impDir = imp.includes('/') ? imp.slice(0, imp.lastIndexOf('/')) : '.'
    return impDir !== inConstellation
  })

  const position: StarPosition = {
    x: Math.round((hashCode(filePath) % 200) - 100),
    y: Math.round(((hashCode(filePath) * 7) % 200) - 100),
  }

  const connections: StarConnection[] = [
    ...imports.map(imp => mapConnection(filePath, imp, 'import')),
    ...importedBy.map(imp => mapConnection(imp, filePath, 'export')),
  ]

  return {
    file: filePath,
    brightness,
    magnitude,
    distance,
    spectralClass,
    starType,
    connections,
    imports,
    importedBy,
    inConstellation,
    position,
    isNexus,
    isOrphan,
    isBridge,
    isHub,
    luminosity,
  }
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// ─── Constellation Mapping ───────────────────────────────────────────────────

/**
 * Assign mythological name based on pattern and star count
 * @example
 * assignMythologicalName('star', 5, 'vibrant') // 'Orion'
 */
export function assignMythologicalName(
  pattern: ConstellationGroup['pattern'],
  starCount: number,
  health: ConstellationGroup['health'],
): string {
  if (health === 'dark' || health === 'dim') {
    if (pattern === 'isolated') return 'Dark Nebula'
    return 'Fading Ember'
  }
  if (pattern === 'ring') {
    if (starCount >= 5) return 'Ouroboros'
    return 'Serpens'
  }
  if (pattern === 'star') {
    if (starCount >= 5) return 'Sol Invictus'
    return 'Corona'
  }
  if (pattern === 'mesh') {
    if (starCount >= 6) return 'Andromeda'
    return 'Lyra'
  }
  if (pattern === 'chain') {
    if (starCount >= 5) return 'Orion\'s Belt'
    return 'Serpens Cauda'
  }
  if (pattern === 'tree') {
    if (starCount >= 5) return 'Yggdrasil'
    return 'Cassiopeia'
  }
  if (pattern === 'bus') return 'Centaurus'
  if (pattern === 'isolated') return 'Lonely Star'
  return 'Unnamed'
}

/**
 * Map a directory as a constellation group
 * @example
 * mapConstellation(stars, conns, 'src') // ConstellationGroup
 */
export function mapConstellation(
  stars: StarNode[],
  connections: StarConnection[],
  dirPath: string,
): ConstellationGroup {
  if (stars.length === 0) {
    return {
      name: dirPath.split('/').pop() ?? dirPath,
      directory: dirPath,
      stars: [],
      connections: [],
      internalConnections: 0,
      externalConnections: 0,
      bridgeCount: 0,
      starCount: 0,
      avgBrightness: 0,
      coherence: 0,
      density: 0,
      pattern: 'isolated',
      hasCycle: false,
      cycleCount: 0,
      brightestStar: 'none',
      hubStar: 'none',
      health: 'dark',
      mythologicalName: 'Void',
    }
  }

  const name = dirPath.split('/').pop() ?? dirPath
  const starCount = stars.length

  const internalConns = connections.filter(c => !c.isInterConstellation)
  const externalConns = connections.filter(c => c.isInterConstellation)
  const internalConnections = internalConns.length
  const externalConnections = externalConns.length
  const bridgeCount = stars.filter(s => s.isBridge).length

  const avgBrightness = Math.round(
    stars.reduce((s, n) => s + n.brightness, 0) / starCount,
  )

  const maxPossible = starCount * (starCount - 1)
  const coherence = maxPossible > 0
    ? Math.round((internalConnections / maxPossible) * 100)
    : 0

  const maxPossibleDensity = starCount * (starCount - 1) / 2
  const density = maxPossibleDensity > 0
    ? Math.round(((internalConnections + externalConnections) / maxPossibleDensity) * 100) / 100
    : 0

  const localConns: Map<string, number> = new Map()
  for (const s of stars) {
    localConns.set(s.file, 0)
  }
  for (const c of connections) {
    if (localConns.has(c.from)) localConns.set(c.from, (localConns.get(c.from) ?? 0) + 1)
    if (localConns.has(c.to)) localConns.set(c.to, (localConns.get(c.to) ?? 0) + 1)
  }
  const maxLocalConn = Math.max(...Array.from(localConns.values()), 0)
  const hasSingleHub = Array.from(localConns.values()).filter(v => v >= 3).length <= 1

  const localCycles = detectCycles(connections)
  const cycleCount = localCycles.length

  const pattern = classifyConstellationPattern(starCount, maxLocalConn, cycleCount, hasSingleHub)

  const first = stars[0]
  const brightestStar = first
    ? stars.reduce((b, s) =>
        s.brightness > b.brightness ? s : b, first).file
    : 'none'
  const hubStar = first
    ? stars.reduce((h, s) =>
        (s.connections.length > h.connections.length ? s : h), first).file
    : 'none'

  const health = classifyConstellationHealth(avgBrightness, coherence / 100)
  const mythologicalName = assignMythologicalName(pattern, starCount, health)

  return {
    name,
    directory: dirPath,
    stars,
    connections,
    internalConnections,
    externalConnections,
    bridgeCount,
    starCount,
    avgBrightness,
    coherence,
    density: Math.min(density, 100),
    pattern,
    hasCycle: cycleCount > 0,
    cycleCount,
    brightestStar,
    hubStar,
    health,
    mythologicalName,
  }
}

// ─── Galactic Structure ──────────────────────────────────────────────────────

/**
 * Build overall galactic structure
 * @example
 * buildGalacticStructure(constellations, stars, conns) // GalacticStructure
 */
export function buildGalacticStructure(
  constellations: ConstellationGroup[],
  stars: StarNode[],
  connections: StarConnection[],
): GalacticStructure {
  const n = stars.length || 1
  const totalStars = stars.length
  const totalConnections = connections.length
  const totalConstellations = constellations.length

  const avgBrightness = Math.round(stars.reduce((s, m) => s + m.brightness, 0) / n)
  const avgCoherence = constellations.length > 0
    ? constellations.reduce((s, c) => s + c.coherence, 0) / constellations.length / 100
    : 0

  const totalBridges = stars.filter(s => s.isBridge).length
  const allCycles = detectCycles(connections)
  const totalCycles = allCycles.length
  const nexusCount = stars.filter(s => s.isNexus).length
  const orphanCount = stars.filter(s => s.isOrphan).length
  const hubCount = stars.filter(s => s.isHub).length

  const interConns = connections.filter(c => c.isInterConstellation).length
  const interConstellationRatio = totalConnections > 0 ? interConns / totalConnections : 0

  const maxPossible = totalStars * (totalStars - 1) / 2
  const connectivity = maxPossible > 0
    ? Math.round((totalConnections / maxPossible) * 100)
    : 0

  const isWellStructured = avgCoherence >= 0.5 && interConstellationRatio < 0.4 && totalCycles === 0
  const structureType = classifyStructureType(totalConstellations, interConstellationRatio, avgCoherence)

  return {
    totalStars,
    totalConnections,
    totalConstellations,
    avgBrightness,
    avgCoherence: Math.round(avgCoherence * 100) / 100,
    totalBridges,
    totalCycles,
    nexusCount,
    orphanCount,
    hubCount,
    interConstellationRatio: Math.round(interConstellationRatio * 100) / 100,
    connectivity: Math.min(connectivity, 100),
    isWellStructured,
    structureType,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate constellation map recommendations
 * @example
 * generateRecommendations(stars, conns, consts, stats) // string[]
 */
export function generateRecommendations(
  _stars: StarNode[],
  _connections: StarConnection[],
  constellations: ConstellationGroup[],
  stats: ConstellationMapStats,
): string[] {
  const recs: string[] = []

  if (stats.totalCycles > 0) {
    recs.push(`Circular dependencies detected: ${stats.totalCycles} cycle(s) found — consider breaking these chains`)
  }

  if (stats.orphanCount > 0) {
    recs.push(`Orphan stars: ${stats.orphanCount} files have no connections — integrate or remove`)
  }

  if (stats.avgCoherence < 30) {
    recs.push('Low coherence: constellations lack internal structure — regroup related files')
  }

  if (stats.interConstellationRatio > 0.4) {
    recs.push('High cross-constellation traffic: reduce inter-module coupling')
  }

  if (stats.connectivity < 20 && stats.totalFiles > 3) {
    recs.push('Sparse sky: many files lack connections — consider consolidating modules')
  }

  if (stats.nexusCount > 0) {
    recs.push(`Nexus stars: ${stats.nexusCount} heavily-connected files may be bottlenecks`)
  }

  const dimConstellations = constellations.filter(c => c.health === 'dim' || c.health === 'dark')
  if (dimConstellations.length > 0) {
    recs.push(`Dim constellations: ${dimConstellations.length} directories need quality improvements`)
  }

  if (!stats.isWellStructured && stats.totalFiles > 5) {
    recs.push('Chaotic structure: consider reorganizing for clearer constellation boundaries')
  }

  if (stats.structureType === 'void') {
    recs.push('Void structure: too few inter-module connections — add proper dependency relationships')
  }

  if (stats.structureType === 'irregular') {
    recs.push('Irregular structure: dependency pattern is tangled — aim for clearer module boundaries')
  }

  const chainConstellations = constellations.filter(c => c.pattern === 'chain' && c.starCount >= 5)
  if (chainConstellations.length > 0) {
    recs.push(`Long chains: ${chainConstellations.length} constellations form linear dependency chains`)
  }

  if (stats.avgBrightness >= 70) {
    recs.push('Bright sky: high overall code quality across constellations')
  }

  if (stats.connectivity >= 60) {
    recs.push('Well-connected sky: good dependency coverage across modules')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete constellation map result from files and contents
 * @example
 * buildConstellationMapResult(['a.ts'], ['export function a() {}'], {}) // ConstellationMapResult
 */
export function buildConstellationMapResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): ConstellationMapResult {
  void options

  const importMap = new Map<string, string[]>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (!file) continue
    const content = contents[i] ?? ''
    const rawImports = extractImports(content)
    const resolvedImports: string[] = []
    for (const imp of rawImports) {
      const clean = imp.replace(/\.\w+$/, '')
      for (const otherFile of files) {
        if (otherFile.endsWith(imp) || otherFile.includes(imp.replace(/^\.\//, '')) ||
            otherFile.includes(clean.replace(/^\.\//, ''))) {
          resolvedImports.push(otherFile)
          break
        }
      }
    }
    importMap.set(file, resolvedImports)
  }

  const importedByMap = new Map<string, string[]>()
  for (const [file, imps] of importMap.entries()) {
    for (const imp of imps) {
      const existing = importedByMap.get(imp)
      if (existing) {
        existing.push(file)
      } else {
        importedByMap.set(imp, [file])
      }
    }
  }

  const stars: StarNode[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const imports = importMap.get(file) ?? []
    const importedBy = importedByMap.get(file) ?? []
    return mapStarNode(content, file, imports, importedBy)
  })

  const allConnections: StarConnection[] = []
  for (const star of stars) {
    allConnections.push(...star.connections)
  }

  const cyclePaths = detectCycles(allConnections)
  const cycleFileSet = new Set<string>()
  for (const cycle of cyclePaths) {
    for (const f of cycle) cycleFileSet.add(f)
  }

  for (const conn of allConnections) {
    if (cycleFileSet.has(conn.from) && cycleFileSet.has(conn.to)) {
      conn.isCircular = true
    }
  }

  const dirMap = new Map<string, StarNode[]>()
  for (const star of stars) {
    const existing = dirMap.get(star.inConstellation)
    if (existing) {
      existing.push(star)
    } else {
      dirMap.set(star.inConstellation, [star])
    }
  }

  const constellations: ConstellationGroup[] = Array.from(dirMap.entries()).map(([dir, dirStars]) => {
    const dirConns = allConnections.filter(c =>
      dirStars.some(s => s.file === c.from || s.file === c.to),
    )
    return mapConstellation(dirStars, dirConns, dir)
  })

  const galaxy = buildGalacticStructure(constellations, stars, allConnections)

  const n = stars.length || 1
  const supergiantCount = stars.filter(s => s.starType === 'supergiant').length
  const dwarfCount = stars.filter(s => s.starType === 'brown-dwarf' || s.starType === 'white-dwarf').length
  const avgConnectionStrength = allConnections.length > 0
    ? Math.round(allConnections.reduce((s, c) => s + c.strength, 0) / allConnections.length)
    : 0
  const bridgeCount = stars.filter(s => s.isBridge).length

  const firstConst = constellations[0]
  const biggestConstellation = firstConst
    ? constellations.reduce((b, c) => c.starCount > b.starCount ? c : b, firstConst).name
    : 'none'
  const mostBridged = firstConst
    ? constellations.reduce((b, c) => c.externalConnections > b.externalConnections ? c : b, firstConst).name
    : 'none'

  const stats: ConstellationMapStats = {
    totalFiles: files.length,
    totalConstellations: constellations.length,
    totalConnections: allConnections.length,
    totalBridges: galaxy.totalBridges,
    totalCycles: galaxy.totalCycles,
    avgBrightness: Math.round(stars.reduce((s, m) => s + m.brightness, 0) / n),
    avgMagnitude: Math.round(stars.reduce((s, m) => s + m.magnitude, 0) / n),
    avgCoherence: galaxy.avgCoherence,
    avgConnectionStrength,
    nexusCount: galaxy.nexusCount,
    orphanCount: galaxy.orphanCount,
    hubCount: galaxy.hubCount,
    bridgeCount,
    supergiantCount,
    dwarfCount,
    interConstellationRatio: galaxy.interConstellationRatio,
    connectivity: galaxy.connectivity,
    isWellStructured: galaxy.isWellStructured,
    structureType: galaxy.structureType,
    cartographerGrade: classifyCartographerGrade(galaxy.connectivity),
    brightestStar: stars[0]
      ? stars.reduce((b, s) => s.brightness > b.brightness ? s : b, stars[0] as typeof stars[number]).file
      : 'none',
    dimmestStar: stars[0]
      ? stars.reduce((b, s) => s.brightness < b.brightness ? s : b, stars[0] as typeof stars[number]).file
      : 'none',
    biggestConstellation,
    mostConnected: stars[0]
      ? stars.reduce((h, s) => s.connections.length > h.connections.length ? s : h, stars[0] as typeof stars[number]).file
      : 'none',
    mostIsolated: stars[0]
      ? stars.reduce((o, s) => s.connections.length < o.connections.length ? s : o, stars[0] as typeof stars[number]).file
      : 'none',
    mostBridged,
    cycleWarning: Array.from(cycleFileSet),
  }

  const recommendations = generateRecommendations(stars, allConnections, constellations, stats)

  return { stars, connections: allConnections, constellations, galaxy, stats, recommendations }
}
