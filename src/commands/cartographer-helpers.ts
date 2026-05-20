// ─── Types ────────────────────────────────────────────────────────────────────

export interface River {
  name: string
  source: string
  destination: string
  flow: number
  direction: 'inflow' | 'outflow'
}

export interface Territory {
  file: string
  name: string
  area: number
  elevation: number
  population: number
  resources: string[]
  rivers: River[]
  neighbors: string[]
  biome: string
}

export interface MapRegion {
  name: string
  territories: Territory[]
  totalArea: number
  avgElevation: number
  biome: string
  connections: number
}

export interface CartographerStats {
  totalTerritories: number
  totalRegions: number
  totalArea: number
  avgElevation: number
  highestPeak: string
  largestTerritory: string
  mostConnected: string
  desertCount: number
  forestCount: number
  mountainCount: number
  oasisCount: number
  plainsCount: number
  totalRivers: number
  mapCompleteness: number
}

export interface CartographerResult {
  territories: Territory[]
  regions: MapRegion[]
  legend: Record<string, string>
  stats: CartographerStats
  recommendations: string[]
}

export interface CartographerOptions {
  verbose?: boolean
}

// ─── Import Extraction ────────────────────────────────────────────────────────

/**
 * Extract import paths from file content.
 *
 * @example
 * extractImports("import { x } from './foo'", 'a.ts')
 */
export function extractImports(content: string, _file: string): string[] {
  const imports: string[] = []
  const patterns = [
    /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
    /import\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      imports.push(m[1]!)
    }
  }
  return imports
}

// ─── Export Extraction ────────────────────────────────────────────────────────

/**
 * Extract exports from file content.
 *
 * @example
 * extractExports("export function foo() {}")
 */
export function extractExports(content: string): string[] {
  const exports: string[] = []
  const patterns = [
    /export\s+function\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+const\s+(\w+)/g,
    /export\s+let\s+(\w+)/g,
    /export\s+var\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
    /export\s+enum\s+(\w+)/g,
    /export\s+async\s+function\s+(\w+)/g,
    /export\s+\*\s+from\s+['"]([^'"]+)['"]/g,
    /export\s+\{([^}]+)\}/g,
  ]
  for (const pat of patterns) {
    let m: RegExpExecArray | null
    while ((m = pat.exec(content)) !== null) {
      const match = m[1]!
      if (match.includes(',')) {
        for (const item of match.split(',')) {
          const trimmed = item.trim().split(/\s+as\s+/)[0]!.trim()
          if (trimmed) exports.push(trimmed)
        }
      } else {
        exports.push(match)
      }
    }
  }
  return [...new Set(exports)]
}

// ─── Complexity ───────────────────────────────────────────────────────────────

/**
 * Compute cyclomatic complexity approximation.
 *
 * @example
 * computeComplexity('if (x) { while (y) {} }')
 */
export function computeComplexity(content: string): number {
  const branches =
    (content.match(/\bif\b/g) ?? []).length +
    (content.match(/\belse\s+if\b/g) ?? []).length +
    (content.match(/\bfor\b/g) ?? []).length +
    (content.match(/\bwhile\b/g) ?? []).length +
    (content.match(/\bcase\b/g) ?? []).length +
    (content.match(/\bcatch\b/g) ?? []).length +
    (content.match(/&&/g) ?? []).length +
    (content.match(/\|\|/g) ?? []).length +
    (content.match(/\?\?/g) ?? []).length +
    (content.match(/\?\./g) ?? []).length
  return Math.max(1, branches)
}

// ─── Population ───────────────────────────────────────────────────────────────

/**
 * Count functions and classes in content.
 *
 * @example
 * countPopulation('function foo() {} class Bar {}')
 */
export function countPopulation(content: string): number {
  const funcs = (content.match(/\bfunction\s+\w+/g) ?? []).length
  const arrows = (content.match(/=>/g) ?? []).length
  const classes = (content.match(/\bclass\s+\w+/g) ?? []).length
  return funcs + arrows + classes
}

// ─── Biome Classification ────────────────────────────────────────────────────

/**
 * Classify a territory's biome based on its characteristics.
 *
 * @example
 * classifyBiome({ area: 200, elevation: 85, resources: [], rivers: [], population: 2 })
 */
export function classifyBiome(partial: { area: number; elevation: number; resources: string[]; rivers: River[]; population: number; commentRatio: number }): string {
  if (partial.elevation > 70) return 'mountain'
  if (partial.commentRatio > 0.2 && partial.elevation <= 50) return 'oasis'
  const density = partial.area > 0 ? (partial.population / partial.area) * 100 : 0
  if (density < 5 && partial.resources.length < 3) return 'desert'
  if (density > 20 && partial.resources.length > 5) return 'forest'
  return 'plains'
}

// ─── Comment Ratio ────────────────────────────────────────────────────────────

/**
 * Compute comment ratio (comment lines / total lines).
 *
 * @example
 * computeCommentRatio('// comment\nconst x = 1')
 */
export function computeCommentRatio(content: string): number {
  if (content.length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0
  const commentLines = lines.filter((l) => l.trim().startsWith('//') || l.trim().startsWith('*') || l.trim().startsWith('/*')).length
  return commentLines / total
}

// ─── Map Territory ────────────────────────────────────────────────────────────

/**
 * Create a territory from a file.
 *
 * @example
 * mapTerritory('src/foo.ts', content, allFiles, allContents)
 */
export function mapTerritory(
  file: string,
  content: string,
  allFiles: string[],
  allContents: string[],
): Territory {
  const lines = content.split('\n')
  const area = lines.length
  const rawComplexity = computeComplexity(content)
  const elevation = Math.min(100, Math.round((rawComplexity / Math.max(1, area)) * 500))
  const population = countPopulation(content)
  const resources = extractExports(content)
  const importPaths = extractImports(content, file)

  const rivers: River[] = []

  for (const imp of importPaths) {
    rivers.push({
      name: imp,
      source: imp,
      destination: file,
      flow: 1,
      direction: 'inflow',
    })
  }

  for (const otherFile of allFiles) {
    if (otherFile === file) continue
    const otherIdx = allFiles.indexOf(otherFile)
    const otherContent = otherIdx >= 0 ? allContents[otherIdx]! : ''
    const otherImports = extractImports(otherContent, otherFile)
    const fileBase = file.replace(/\.\w+$/, '')
    if (otherImports.some((imp) => imp.includes(fileBase) || fileBase.endsWith(imp.replace(/^\.\//, '')))) {
      rivers.push({
        name: file,
        source: file,
        destination: otherFile,
        flow: 1,
        direction: 'outflow',
      })
    }
  }

  const dir = file.includes('/') ? file.substring(0, file.lastIndexOf('/')) : ''
  const neighbors = allFiles.filter((f) => {
    if (f === file) return false
    const otherDir = f.includes('/') ? f.substring(0, f.lastIndexOf('/')) : ''
    return otherDir === dir
  })

  const commentRatio = computeCommentRatio(content)
  const biome = classifyBiome({ area, elevation, resources, rivers, population, commentRatio })

  const name = file.includes('/') ? file.substring(file.lastIndexOf('/') + 1) : file

  return { file, name, area, elevation, population, resources, rivers, neighbors, biome }
}

// ─── Map Region ───────────────────────────────────────────────────────────────

/**
 * Group territories into a region by directory.
 *
 * @example
 * mapRegion(territories, 'src/commands')
 */
export function mapRegion(territories: Territory[], directory: string): MapRegion {
  const regionTerritories = territories.filter((t) => {
    const dir = t.file.includes('/') ? t.file.substring(0, t.file.lastIndexOf('/')) : ''
    return dir === directory
  })

  const totalArea = regionTerritories.reduce((s, t) => s + t.area, 0)
  const avgElevation = regionTerritories.length > 0
    ? Math.round(regionTerritories.reduce((s, t) => s + t.elevation, 0) / regionTerritories.length)
    : 0

  const connections = regionTerritories.reduce((s, t) => {
    const externalRivers = t.rivers.filter((r) => {
      const otherDir = r.direction === 'inflow'
        ? (r.source.includes('/') ? r.source.substring(0, r.source.lastIndexOf('/')) : '')
        : (r.destination.includes('/') ? r.destination.substring(0, r.destination.lastIndexOf('/')) : '')
      return otherDir !== directory
    })
    return s + externalRivers.length
  }, 0)

  const density = regionTerritories.length > 0
    ? regionTerritories.reduce((s, t) => s + t.population, 0) / regionTerritories.length
    : 0
  const avgResources = regionTerritories.length > 0
    ? regionTerritories.reduce((s, t) => s + t.resources.length, 0) / regionTerritories.length
    : 0

  let biome = 'plains'
  if (avgElevation > 70) biome = 'mountain'
  else if (density > 15 && avgResources > 5) biome = 'forest'
  else if (density < 3 && avgResources < 2) biome = 'desert'

  return {
    name: directory || '(root)',
    territories: regionTerritories,
    totalArea,
    avgElevation,
    biome,
    connections,
  }
}

// ─── Trace Rivers ─────────────────────────────────────────────────────────────

/**
 * Trace all import/export rivers across territories.
 *
 * @example
 * traceRivers(territories)
 */
export function traceRivers(territories: Territory[]): River[] {
  const allRivers: River[] = []
  for (const t of territories) {
    allRivers.push(...t.rivers)
  }
  return allRivers
}

// ─── Map Completeness ─────────────────────────────────────────────────────────

/**
 * Compute map completeness score (0-100).
 *
 * @example
 * computeMapCompleteness(territories)
 */
export function computeMapCompleteness(territories: Territory[]): number {
  if (territories.length === 0) return 0

  let score = 0
  const withExports = territories.filter((t) => t.resources.length > 0).length
  score += (withExports / territories.length) * 30

  const withRivers = territories.filter((t) => t.rivers.length > 0).length
  score += (withRivers / territories.length) * 30

  const withNeighbors = territories.filter((t) => t.neighbors.length > 0).length
  score += (withNeighbors / territories.length) * 20

  const nonDesert = territories.filter((t) => t.biome !== 'desert').length
  score += (nonDesert / territories.length) * 20

  return Math.round(Math.min(100, score))
}

// ─── Build Regions ────────────────────────────────────────────────────────────

/**
 * Build all regions from territories.
 *
 * @example
 * buildRegions(territories)
 */
export function buildRegions(territories: Territory[]): MapRegion[] {
  const dirs = new Set<string>()
  for (const t of territories) {
    const dir = t.file.includes('/') ? t.file.substring(0, t.file.lastIndexOf('/')) : ''
    dirs.add(dir)
  }
  return [...dirs].map((d) => mapRegion(territories, d))
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate cartographer recommendations.
 *
 * @example
 * generateCartographerRecommendations(territories, regions, stats)
 */
export function generateCartographerRecommendations(
  territories: Territory[],
  _regions: MapRegion[],
  stats: CartographerStats,
): string[] {
  const recs: string[] = []

  if (stats.desertCount > 0) {
    recs.push(`${stats.desertCount} desert territory(ies) found — consider adding documentation or consolidating sparse files`)
  }

  if (stats.mountainCount > 0) {
    recs.push(`${stats.mountainCount} mountain territory(ies) detected — simplify complex files to reduce elevation`)
  }

  const isolated = territories.filter((t) => t.rivers.length === 0 && t.neighbors.length === 0)
  if (isolated.length > 0) {
    recs.push(`${isolated.length} isolated territory(ies) — connect them to the codebase via imports or exports`)
  }

  const dense = territories.filter((t) => t.biome === 'forest' && t.area > 300)
  if (dense.length > 0) {
    recs.push(`${dense.length} dense forest territory(ies) over 300 lines — consider splitting into smaller modules`)
  }

  if (stats.mapCompleteness < 50) {
    recs.push(`Map completeness is ${stats.mapCompleteness}% — improve by adding exports and documentation`)
  }

  if (recs.length === 0) {
    recs.push('Map is well-charted — codebase has good connectivity and documentation')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete cartographer result.
 *
 * @example
 * buildCartographerResult(files, contents)
 */
export function buildCartographerResult(
  files: string[],
  contents: string[],
  _options?: CartographerOptions,
): CartographerResult {
  const territories: Territory[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    territories.push(mapTerritory(file, content, files, contents))
  }

  const regions = buildRegions(territories)
  const totalRivers = traceRivers(territories).length

  const totalArea = territories.reduce((s, t) => s + t.area, 0)
  const avgElevation = territories.length > 0
    ? Math.round(territories.reduce((s, t) => s + t.elevation, 0) / territories.length)
    : 0

  const sortedByElevation = [...territories].sort((a, b) => b.elevation - a.elevation)
  const sortedByArea = [...territories].sort((a, b) => b.area - a.area)
  const sortedByConnections = [...territories].sort((a, b) => b.rivers.length - a.rivers.length)

  const desertCount = territories.filter((t) => t.biome === 'desert').length
  const forestCount = territories.filter((t) => t.biome === 'forest').length
  const mountainCount = territories.filter((t) => t.biome === 'mountain').length
  const oasisCount = territories.filter((t) => t.biome === 'oasis').length
  const plainsCount = territories.filter((t) => t.biome === 'plains').length

  const stats: CartographerStats = {
    totalTerritories: territories.length,
    totalRegions: regions.length,
    totalArea,
    avgElevation,
    highestPeak: sortedByElevation[0]?.file ?? 'N/A',
    largestTerritory: sortedByArea[0]?.file ?? 'N/A',
    mostConnected: sortedByConnections[0]?.file ?? 'N/A',
    desertCount,
    forestCount,
    mountainCount,
    oasisCount,
    plainsCount,
    totalRivers,
    mapCompleteness: computeMapCompleteness(territories),
  }

  const legend: Record<string, string> = {
    desert: 'Sparse code with few exports and low density',
    forest: 'Dense code with many exports and high population',
    mountain: 'High complexity code with steep elevation',
    oasis: 'Well-documented code with moderate complexity',
    plains: 'Normal density code with moderate exports',
  }

  const recommendations = generateCartographerRecommendations(territories, regions, stats)

  return { territories, regions, legend, stats, recommendations }
}
