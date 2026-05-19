// ─── Types ────────────────────────────────────────────────────────────────────

export type StarType = 'giant' | 'main-sequence' | 'dwarf' | 'dark' | 'binary'
export type LinkType = 'import' | 're-export' | 'dynamic-import'

export interface StarPosition {
  x: number
  y: number
}

export interface Star {
  name: string
  file: string
  brightness: number
  size: number
  connections: number
  type: StarType
  position: StarPosition
}

export interface ConstellationLink {
  from: string
  to: string
  strength: number
  type: LinkType
}

export interface Constellation {
  name: string
  stars: string[]
  description: string
  totalBrightness: number
}

export interface ConstellationStats {
  totalStars: number
  totalLinks: number
  giantStars: number
  darkStars: number
  constellationsFound: number
  averageBrightness: number
  brightestStar: string
  densestRegion: string
}

export interface ConstellationResult {
  stars: Star[]
  links: ConstellationLink[]
  constellations: Constellation[]
  darkMatter: Star[]
  stats: ConstellationStats
  recommendations: string[]
}

export interface ConstellationOptions {
  verbose?: boolean
}

// ─── Import Extraction ────────────────────────────────────────────────────────

/**
 * Extract import targets from file content.
 *
 * @example
 * extractImports("import { x } from './mod'")
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  for (const line of content.split('\n')) {
    const staticImport = line.match(/import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/)
    if (staticImport) imports.push(staticImport[1]!)
    const reExport = line.match(/export\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/)
    if (reExport) imports.push(reExport[1]!)
    const dynamicImport = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/)
    if (dynamicImport) imports.push(dynamicImport[1]!)
  }
  return imports
}

/**
 * Classify link type from import statement.
 *
 * @example
 * classifyLinkType("export { x } from './mod'")
 */
export function classifyLinkType(line: string): LinkType {
  if (/^\s*export\s/.test(line) && /from\s+['"]/.test(line)) return 're-export'
  if (/import\s*\(/.test(line)) return 'dynamic-import'
  return 'import'
}

/**
 * Resolve a relative import path to a file key.
 *
 * @example
 * resolveImportPath('./helpers', 'src/commands/index.ts')
 */
export function resolveImportPath(importPath: string, fromFile: string): string {
  if (!importPath.startsWith('.')) return importPath
  const dir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : ''
  const parts = dir ? dir.split('/') : []
  for (const segment of importPath.split('/')) {
    if (segment === '..') parts.pop()
    else if (segment !== '.') parts.push(segment)
  }
  let resolved = parts.join('/')
  if (!resolved.endsWith('.ts') && !resolved.endsWith('.js') && !resolved.endsWith('.tsx')) {
    resolved += '.ts'
  }
  return resolved
}

// ─── Brightness & Classification ──────────────────────────────────────────────

/**
 * Compute star brightness (0-100) from dependent count.
 *
 * @example
 * computeBrightness(15, 20)
 */
export function computeBrightness(dependentCount: number, maxDependents: number): number {
  if (maxDependents === 0) return 0
  return Math.min(Math.round((dependentCount / maxDependents) * 100), 100)
}

/**
 * Classify star type by brightness and connections.
 *
 * @example
 * classifyStar(80, 5)
 */
export function classifyStar(brightness: number, connections: number, isBinary: boolean): StarType {
  if (isBinary) return 'binary'
  if (brightness === 0) return 'dark'
  if (brightness > 70) return 'giant'
  if (brightness >= 20) return 'main-sequence'
  return 'dwarf'
}

// ─── Star Map Building ────────────────────────────────────────────────────────

/**
 * Build the star map from files and contents.
 *
 * @example
 * buildStarMap(['a.ts', 'b.ts'], ['import { x } from "./b"', 'export const x = 1'])
 */
export function buildStarMap(files: string[], contents: string[]): { stars: Star[]; links: ConstellationLink[] } {
  const linkMap = new Map<string, ConstellationLink>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const imports = extractImports(content)

    for (const imp of imports) {
      if (!imp.startsWith('.')) continue
      const resolved = resolveImportPath(imp, file)
      const targetFile = files.find((f) => f === resolved || f === resolved.replace(/\.ts$/, '') || f.replace(/\.ts$/, '') === resolved.replace(/\.ts$/, ''))
      if (!targetFile) continue

      const key = `${file}->${targetFile}`
      const existing = linkMap.get(key)
      if (existing) {
        existing.strength++
      } else {
        linkMap.set(key, {
          from: file,
          to: targetFile,
          strength: 1,
          type: 'import',
        })
      }
    }
  }

  const links = Array.from(linkMap.values())

  const dependentCounts = new Map<string, number>()
  for (const file of files) {
    dependentCounts.set(file, 0)
  }
  for (const link of links) {
    dependentCounts.set(link.to, (dependentCounts.get(link.to) ?? 0) + 1)
  }

  const maxDependents = Math.max(...Array.from(dependentCounts.values()), 1)

  const binaryPairs = findBinaryPairs(files, links)

  const stars: Star[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    const deps = dependentCounts.get(file) ?? 0
    const brightness = computeBrightness(deps, maxDependents)
    const outgoingLinks = links.filter((l) => l.from === file)
    const connections = outgoingLinks.length
    const isBinary = binaryPairs.has(file)
    const type = classifyStar(brightness, connections, isBinary)

    return {
      name: fileToStarName(file),
      file,
      brightness,
      size: content.split('\n').length,
      connections,
      type,
      position: { x: 0, y: 0 },
    }
  })

  return { stars, links }
}

function findBinaryPairs(files: string[], links: ConstellationLink[]): Set<string> {
  const pairSet = new Set<string>()
  const linkSet = new Set(links.map((l) => `${l.from}->${l.to}`))

  for (const file of files) {
    const outgoing = links.filter((l) => l.from === file)
    if (outgoing.length !== 1) continue
    const target = outgoing[0]!.to
    const reverseExists = linkSet.has(`${target}->${file}`)
    const targetOutgoing = links.filter((l) => l.from === target)
    if (reverseExists && targetOutgoing.length === 1) {
      pairSet.add(file)
      pairSet.add(target)
    }
  }

  return pairSet
}

function fileToStarName(file: string): string {
  const parts = file.split('/')
  const base = parts[parts.length - 1] ?? file
  return base.replace(/\.(ts|tsx|js|jsx)$/, '')
}

// ─── Position Computation ─────────────────────────────────────────────────────

/**
 * Compute positions for stars using a grid layout.
 *
 * @example
 * computePositions(stars)
 */
export function computePositions(stars: Star[]): Star[] {
  if (stars.length === 0) return stars

  const cols = Math.ceil(Math.sqrt(stars.length))
  const result = stars.map((star, i) => ({
    ...star,
    position: {
      x: i % cols,
      y: Math.floor(i / cols),
    },
  }))

  return result
}

// ─── Constellation Detection ──────────────────────────────────────────────────

/**
 * Find constellations — connected groups of stars.
 *
 * @example
 * findConstellations(stars, links)
 */
export function findConstellations(stars: Star[], links: ConstellationLink[]): Constellation[] {
  if (stars.length === 0) return []

  const adjacency = new Map<string, Set<string>>()
  for (const star of stars) {
    adjacency.set(star.file, new Set())
  }
  for (const link of links) {
    adjacency.get(link.from)?.add(link.to)
    adjacency.get(link.to)?.add(link.from)
  }

  const visited = new Set<string>()
  const groups: string[][] = []

  for (const star of stars) {
    if (visited.has(star.file)) continue
    const group: string[] = []
    const queue = [star.file]
    while (queue.length > 0) {
      const current = queue.pop()!
      if (visited.has(current)) continue
      visited.add(current)
      group.push(current)
      const neighbors = adjacency.get(current)
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) queue.push(neighbor)
        }
      }
    }
    if (group.length >= 2) {
      groups.push(group)
    }
  }

  const constellations: Constellation[] = groups.map((group) => {
    const groupStars = stars.filter((s) => group.includes(s.file))
    const brightest = groupStars.reduce((a, b) => a.brightness >= b.brightness ? a : b)
    const dirName = brightest.file.includes('/') ? brightest.file.split('/').slice(0, -1).join('/') : 'root'
    const name = toConstellationName(dirName, brightest.name)
    const totalBrightness = groupStars.reduce((s, st) => s + st.brightness, 0)

    return {
      name,
      stars: group,
      description: `${group.length} stars connected through ${groupStars.reduce((s, st) => s + st.connections, 0)} connections`,
      totalBrightness,
    }
  })

  return constellations
}

function toConstellationName(dirName: string, brightest: string): string {
  if (dirName === 'root' || dirName === '') return `${brightest} Cluster`
  const parts = dirName.split('/')
  const last = parts[parts.length - 1] ?? 'unknown'
  return `${last.charAt(0).toUpperCase()}${last.slice(1)} Constellation`
}

// ─── Dark Matter ──────────────────────────────────────────────────────────────

/**
 * Find dark matter — stars with no incoming links.
 *
 * @example
 * findDarkMatter(stars, links)
 */
export function findDarkMatter(stars: Star[], links: ConstellationLink[]): Star[] {
  const hasIncoming = new Set(links.map((l) => l.to))
  const entryPatterns = ['index.ts', 'index.tsx', 'main.ts', 'main.js', 'cli.ts', 'app.ts']

  return stars.filter((star) => {
    if (hasIncoming.has(star.file)) return false
    if (entryPatterns.some((p) => star.file.endsWith(p))) return false
    return star.type === 'dark' || star.brightness === 0
  })
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute constellation stats.
 *
 * @example
 * computeConstellationStats(stars, links, constellations)
 */
export function computeConstellationStats(
  stars: Star[],
  links: ConstellationLink[],
  constellations: Constellation[],
): ConstellationStats {
  if (stars.length === 0) {
    return {
      totalStars: 0, totalLinks: 0, giantStars: 0, darkStars: 0,
      constellationsFound: 0, averageBrightness: 0, brightestStar: '', densestRegion: '',
    }
  }

  const brightest = stars.reduce((a, b) => a.brightness >= b.brightness ? a : b)
  const avgBrightness = Math.round(stars.reduce((s, st) => s + st.brightness, 0) / stars.length)

  const densest = constellations.length > 0
    ? constellations.reduce((a, b) => a.stars.length >= b.stars.length ? a : b)
    : null

  return {
    totalStars: stars.length,
    totalLinks: links.length,
    giantStars: stars.filter((s) => s.type === 'giant').length,
    darkStars: stars.filter((s) => s.type === 'dark').length,
    constellationsFound: constellations.length,
    averageBrightness: avgBrightness,
    brightestStar: brightest.name,
    densestRegion: densest?.name ?? '',
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate constellation recommendations.
 *
 * @example
 * generateConstellationRecommendations(darkMatter, stats, constellations)
 */
export function generateConstellationRecommendations(
  darkMatter: Star[],
  stats: ConstellationStats,
  constellations: Constellation[],
): string[] {
  const recs: string[] = []

  if (darkMatter.length > 0) {
    recs.push(`${darkMatter.length} dark matter file(s) detected — may be dead code or entry points needing documentation`)
  }

  if (stats.giantStars > 0) {
    recs.push(`${stats.giantStars} giant star(s) need protection — ensure comprehensive test coverage`)
  }

  const dense = constellations.filter((c) => c.stars.length > 5)
  if (dense.length > 0) {
    recs.push(`${dense.length} dense constellation(s) detected — consider reducing coupling`)
  }

  if (stats.totalLinks > stats.totalStars * 2) {
    recs.push('High link-to-star ratio — modules may be too interconnected')
  }

  if (stats.darkStars > stats.totalStars * 0.3) {
    recs.push(`${stats.darkStars} dark stars (${Math.round(stats.darkStars / stats.totalStars * 100)}%) — investigate potential dead code`)
  }

  if (recs.length === 0) {
    recs.push('Constellation looks healthy — well-connected modules with balanced dependencies')
  }

  return recs
}

// ─── buildConstellationResult ─────────────────────────────────────────────────

/**
 * Build the complete constellation analysis result.
 *
 * @example
 * buildConstellationResult(['a.ts'], ['export const x = 1'])
 */
export function buildConstellationResult(
  files: string[],
  contents: string[],
  _options?: ConstellationOptions,
): ConstellationResult {
  const { stars: rawStars, links } = buildStarMap(files, contents)
  const stars = computePositions(rawStars)
  const constellations = findConstellations(stars, links)
  const darkMatter = findDarkMatter(stars, links)
  const stats = computeConstellationStats(stars, links, constellations)
  const recommendations = generateConstellationRecommendations(darkMatter, stats, constellations)

  return { stars, links, constellations, darkMatter, stats, recommendations }
}
