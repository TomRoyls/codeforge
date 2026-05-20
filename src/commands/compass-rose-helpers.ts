// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Direction {
  name: string
  description: string
  files: string[]
  strength: number
  characteristics: string[]
}

export interface FlowVector {
  from: string
  to: string
  direction: string
  magnitude: number
  type: 'data' | 'control' | 'dependency'
}

export interface Heading {
  file: string
  bearing: number
  cardinalDirection: string
  abstraction: number
  implementation: number
  expansion: number
  consolidation: number
}

export interface CompassReading {
  file: string
  heading: Heading
  winds: string[]
  anchors: string[]
  drift: number
}

export interface CompassRoseStats {
  totalFiles: number
  northwardCount: number
  southwardCount: number
  eastwardCount: number
  westwardCount: number
  avgBearing: number
  dominantDirection: string
  avgDrift: number
  magneticNorth: string
  consistency: number
  navigability: number
}

export interface CompassRoseResult {
  directions: Direction[]
  flows: FlowVector[]
  readings: CompassReading[]
  stats: CompassRoseStats
  recommendations: string[]
}

export interface CompassRoseOptions {
  verbose?: boolean
}

// ─── Abstraction ───────────────────────────────────────────────────────────────

/**
 * Compute abstraction level (0-100).
 * High for interfaces, types, abstract classes, enums.
 *
 * @example
 * computeAbstraction('export interface Foo { name: string }')
 */
export function computeAbstraction(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  let abstractScore = 0
  const interfaceMatches = content.match(/(?:export\s+)?interface\s+\w+/g) || []
  const typeMatches = content.match(/(?:export\s+)?type\s+\w+\s*=/g) || []
  const abstractMatches = content.match(/(?:export\s+)?abstract\s+class\s+\w+/g) || []
  const enumMatches = content.match(/(?:export\s+)?enum\s+\w+/g) || []
  const signatureMatches = content.match(/\w+\([^)]*\)\s*:\s*\w+(\[\])?/g) || []

  abstractScore += interfaceMatches.length * 15
  abstractScore += typeMatches.length * 12
  abstractScore += abstractMatches.length * 15
  abstractScore += enumMatches.length * 10
  abstractScore += signatureMatches.length * 3

  const concreteMatches = content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) || []
  const classMatches = content.match(/class\s+\w+/g) || []

  abstractScore -= concreteMatches.length * 5
  abstractScore -= classMatches.length * 3

  return Math.max(0, Math.min(100, Math.round((abstractScore / Math.max(total, 1)) * 100)))
}

// ─── Implementation ────────────────────────────────────────────────────────────

/**
 * Compute implementation level (0-100).
 * High for concrete functions, algorithms, business logic.
 *
 * @example
 * computeImplementation('function add(a: number, b: number) { return a + b }')
 */
export function computeImplementation(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  let implScore = 0
  const functionMatches = content.match(/(?:export\s+)?(?:async\s+)?function\s+\w+/g) || []
  const arrowMatches = content.match(/const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g) || []
  const classMatches = content.match(/class\s+\w+/g) || []
  const branchMatches = content.match(/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b/g) || []
  const returnMatches = content.match(/\breturn\b/g) || []
  const tryCatchMatches = content.match(/\btry\b|\bcatch\b/g) || []
  const newMatches = content.match(/\bnew\s+\w+/g) || []

  implScore += functionMatches.length * 10
  implScore += arrowMatches.length * 8
  implScore += classMatches.length * 8
  implScore += branchMatches.length * 3
  implScore += returnMatches.length * 2
  implScore += tryCatchMatches.length * 4
  implScore += newMatches.length * 3

  const interfaceMatches = content.match(/interface\s+\w+/g) || []
  const typeMatches = content.match(/type\s+\w+\s*=/g) || []

  implScore -= interfaceMatches.length * 5
  implScore -= typeMatches.length * 3

  return Math.max(0, Math.min(100, Math.round((implScore / Math.max(total, 1)) * 100)))
}

// ─── Expansion ─────────────────────────────────────────────────────────────────

/**
 * Compute expansion level (0-100).
 * High for recent changes, new code, TODOs, growing patterns.
 *
 * @example
 * computeExpansion('function foo() { // TODO: implement }')
 */
export function computeExpansion(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  let expansionScore = 0
  const todoMatches = content.match(/TODO|FIXME|HACK|XXX/gi) || []
  const anyMatches = content.match(/:\s*any\b/g) || []
  const consoleMatches = content.match(/console\.\w+/g) || []
  const exportMatches = content.match(/export\s+/g) || []
  const importMatches = content.match(/import\s+/g) || []
  const commentLines = lines.filter((l) => l.trim().startsWith('//') || l.trim().startsWith('/*')).length
  const blankLines = lines.filter((l) => l.trim() === '').length

  expansionScore += todoMatches.length * 8
  expansionScore += anyMatches.length * 5
  expansionScore += consoleMatches.length * 3
  expansionScore += exportMatches.length * 2
  expansionScore += importMatches.length * 2
  expansionScore += commentLines * 1
  expansionScore += blankLines * 0.5

  return Math.max(0, Math.min(100, Math.round((expansionScore / Math.max(total, 1)) * 100)))
}

// ─── Consolidation ─────────────────────────────────────────────────────────────

/**
 * Compute consolidation level (0-100).
 * High for stable, optimized, well-documented code.
 *
 * @example
 * computeConsolidation('/** Docs *\\/ function foo() { return 1 }')
 */
export function computeConsolidation(content: string): number {
  if (!content || content.trim().length === 0) return 0
  const lines = content.split('\n')
  const total = lines.length
  if (total === 0) return 0

  let consolidationScore = 0
  const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || []
  const paramMatches = content.match(/@param/g) || []
  const returnsMatches = content.match(/@returns/g) || []
  const exampleMatches = content.match(/@example/g) || []
  const constMatches = content.match(/\bconst\b/g) || []
  const readonlyMatches = content.match(/\breadonly\b/g) || []
  const testMatches = content.match(/\bdescribe\b|\bit\b|\bexpect\b/g) || []

  consolidationScore += jsdocMatches.length * 5
  consolidationScore += paramMatches.length * 3
  consolidationScore += returnsMatches.length * 3
  consolidationScore += exampleMatches.length * 4
  consolidationScore += constMatches.length * 1
  consolidationScore += readonlyMatches.length * 3
  consolidationScore += testMatches.length * 1

  const anyMatches = content.match(/:\s*any\b/g) || []
  const todoMatches = content.match(/TODO|FIXME|HACK|XXX/gi) || []

  consolidationScore -= anyMatches.length * 5
  consolidationScore -= todoMatches.length * 3

  return Math.max(0, Math.min(100, Math.round((consolidationScore / Math.max(total, 1)) * 100)))
}

// ─── Bearing ───────────────────────────────────────────────────────────────────

/**
 * Compute bearing (0-360 degrees) from four axis scores.
 * North: high abstraction, low implementation
 * South: low abstraction, high implementation
 * East: high expansion, low consolidation
 * West: low expansion, high consolidation
 *
 * @example
 * computeBearing(80, 20, 30, 70) // ~315 (NW)
 */
export function computeBearing(abstraction: number, implementation: number, expansion: number, consolidation: number): number {
  const nsComponent = (abstraction - implementation) / 100
  const ewComponent = (expansion - consolidation) / 100

  let angle = (Math.atan2(ewComponent, nsComponent) * 180) / Math.PI
  if (angle < 0) angle += 360

  return Math.round(angle * 100) / 100
}

// ─── Cardinal Direction ────────────────────────────────────────────────────────

/**
 * Classify bearing into cardinal direction (N/NE/E/SE/S/SW/W/NW).
 *
 * @example
 * classifyCardinalDirection(0)   // 'N'
 * classifyCardinalDirection(90)  // 'E'
 * classifyCardinalDirection(180) // 'S'
 * classifyCardinalDirection(270) // 'W'
 */
export function classifyCardinalDirection(bearing: number): string {
  const normalized = ((bearing % 360) + 360) % 360
  if (normalized >= 337.5 || normalized < 22.5) return 'N'
  if (normalized >= 22.5 && normalized < 67.5) return 'NE'
  if (normalized >= 67.5 && normalized < 112.5) return 'E'
  if (normalized >= 112.5 && normalized < 157.5) return 'SE'
  if (normalized >= 157.5 && normalized < 202.5) return 'S'
  if (normalized >= 202.5 && normalized < 247.5) return 'SW'
  if (normalized >= 247.5 && normalized < 292.5) return 'W'
  return 'NW'
}

// ─── Import Extraction ─────────────────────────────────────────────────────────

/**
 * Extract import paths from file content.
 *
 * @example
 * extractImports("import { foo } from './bar'") // ['./bar']
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const importMatches = content.matchAll(/import\s+.*?from\s+['"](.+?)['"]/g) || []
  for (const m of importMatches) {
    if (m[1]) imports.push(m[1])
  }
  const dynamicMatches = content.matchAll(/import\(['"](.+?)['"]\)/g) || []
  for (const m of dynamicMatches) {
    if (m[1]) imports.push(m[1])
  }
  return imports
}

/**
 * Resolve import path to a file in the known set.
 *
 * @example
 * resolveImportPath('./utils', new Set(['src/utils.ts', 'src/main.ts'])) // 'src/utils.ts'
 */
export function resolveImportPath(importPath: string, knownFiles: Set<string>): string | null {
  let stripped = importPath.replace(/^\.\//, '')
  const candidates = [
    stripped,
    stripped + '.ts',
    stripped + '.js',
    stripped + '.tsx',
    stripped + '.jsx',
    stripped + '/index.ts',
    stripped + '/index.js',
  ]
  for (const candidate of candidates) {
    if (knownFiles.has(candidate)) return candidate
  }
  return null
}

// ─── Flow Vector ───────────────────────────────────────────────────────────────

/**
 * Compute a flow vector between two files.
 *
 * @example
 * computeFlowVector('a.ts', 'b.ts', 'dependency')
 */
export function computeFlowVector(from: string, to: string, type: 'data' | 'control' | 'dependency'): FlowVector {
  const magnitude = Math.round(Math.random() * 50 + 50)
  return { from, to, direction: from + '->' + to, magnitude, type }
}

// ─── Winds & Anchors ───────────────────────────────────────────────────────────

/**
 * Identify winds (forces pushing the file).
 *
 * @example
 * identifyWinds('file.ts', ['a.ts'], ['b.ts', 'c.ts'])
 */
export function identifyWinds(file: string, imports: string[], importedBy: string[]): string[] {
  const winds: string[] = []
  if (imports.length > 3) winds.push('high-outgoing-dependency')
  if (importedBy.length > 3) winds.push('high-incoming-dependency')
  if (imports.length === 0 && importedBy.length === 0) winds.push('isolated')
  if (imports.length > 0 && importedBy.length > 0) winds.push('bidirectional-flow')
  winds.push(`${file}-flow`)
  return winds
}

/**
 * Identify anchors (files keeping it stable).
 *
 * @example
 * identifyAnchors('file.ts', ['stable.ts'])
 */
export function identifyAnchors(file: string, stableImports: string[]): string[] {
  if (stableImports.length === 0) return []
  return stableImports.slice(0, 5).map((s) => `${file}-anchored-by-${s}`)
}

// ─── Drift ─────────────────────────────────────────────────────────────────────

/**
 * Compute drift from average heading.
 *
 * @example
 * computeDrift(90, 45) // 45
 */
export function computeDrift(heading: number, avgHeading: number): number {
  const diff = Math.abs(heading - avgHeading)
  return Math.min(diff, 360 - diff)
}

// ─── Magnetic North ────────────────────────────────────────────────────────────

/**
 * Find the magnetic north (most abstract, most depended-upon file).
 *
 * @example
 * findMagneticNorth(['a.ts', 'b.ts'], ['interface I {}', 'function f() {}'])
 */
export function findMagneticNorth(files: string[], contents: string[]): string {
  if (files.length === 0) return ''

  let bestFile = files[0]
  let bestScore = -1

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    const abstraction = computeAbstraction(content)

    const imports = extractImports(content)
    const importedCount = countImportedBy(files, contents, files[i])

    const score = abstraction * 0.6 + importedCount * 10 + (imports.length === 0 ? 20 : 0)
    if (score > bestScore) {
      bestScore = score
      bestFile = files[i]
    }
  }

  return bestFile
}

/**
 * Count how many other files import a given file.
 *
 * @example
 * countImportedBy(['a.ts', 'b.ts'], ["import { x } from './b'", "//"], 'b.ts') // 1
 */
export function countImportedBy(files: string[], contents: string[], targetFile: string): number {
  let count = 0
  for (let i = 0; i < files.length; i++) {
    if (files[i] === targetFile) continue
    const content = contents[i] || ''
    const imports = extractImports(content)
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, new Set(files))
      if (resolved === targetFile) {
        count++
        break
      }
    }
  }
  return count
}

// ─── Consistency ───────────────────────────────────────────────────────────────

/**
 * Compute consistency (how aligned headings are). 0-100.
 *
 * @example
 * computeConsistency([{ bearing: 0 }, { bearing: 10 }, { bearing: 350 }])
 */
export function computeConsistency(readings: CompassReading[]): number {
  if (readings.length <= 1) return 100

  const bearings = readings.map((r) => r.heading.bearing)
  const sinSum = bearings.reduce((s, b) => s + Math.sin((b * Math.PI) / 180), 0)
  const cosSum = bearings.reduce((s, b) => s + Math.cos((b * Math.PI) / 180), 0)
  const n = bearings.length

  const r = Math.sqrt((sinSum / n) ** 2 + (cosSum / n) ** 2)
  return Math.round(r * 100)
}

// ─── Navigability ──────────────────────────────────────────────────────────────

/**
 * Compute navigability (how clear the directions are). 0-100.
 *
 * @example
 * computeNavigability([{ magnitude: 80 }, { magnitude: 90 }], 75)
 */
export function computeNavigability(flows: FlowVector[], consistency: number): number {
  if (flows.length === 0) return consistency
  const avgMagnitude = flows.reduce((s, f) => s + f.magnitude, 0) / flows.length
  const magnitudeFactor = Math.min(avgMagnitude / 100, 1) * 50
  const consistencyFactor = (consistency / 100) * 50
  return Math.round(magnitudeFactor + consistencyFactor)
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Generate recommendations.
 *
 * @example
 * generateRecommendations(directions, flows, readings, stats)
 */
export function generateRecommendations(
  directions: Direction[],
  _flows: FlowVector[],
  readings: CompassReading[],
  stats: CompassRoseStats,
): string[] {
  const recs: string[] = []

  if (stats.consistency < 50) {
    recs.push('Low architectural consistency — consider standardizing module patterns')
  }

  if (stats.navigability < 40) {
    recs.push('Poor navigability — add clearer module boundaries and documentation')
  }

  const highDrift = readings.filter((r) => r.drift > 90)
  if (highDrift.length > 0) {
    recs.push(`${highDrift.length} file(s) drifting from codebase average — review alignment`)
  }

  if (stats.magneticNorth) {
    recs.push(`Document and protect "${stats.magneticNorth}" as the architectural north star`)
  }

  for (const dir of directions) {
    if (dir.files.length === 0 && (dir.name === 'N' || dir.name === 'S')) {
      recs.push(`No files heading ${dir.name === 'N' ? 'north' : 'south'} — ${dir.name === 'N' ? 'consider adding abstractions' : 'ensure implementation files exist'}`)
    }
  }

  if (stats.westwardCount > stats.eastwardCount * 2) {
    recs.push('Heavy consolidation bias — ensure the codebase is still evolving')
  }

  if (stats.northwardCount === 0 && stats.southwardCount > 0) {
    recs.push('No abstraction layer detected — add interfaces or type definitions')
  }

  if (recs.length === 0) {
    recs.push('Codebase heading looks well-aligned')
  }

  return recs
}

// ─── Direction Descriptions ────────────────────────────────────────────────────

const DIRECTION_META: Record<string, { description: string; characteristics: string[] }> = {
  N:  { description: 'Abstraction — interfaces, types, abstract classes', characteristics: ['declarative', 'type-heavy', 'contractual'] },
  NE: { description: 'Expanding abstraction — growing type system', characteristics: ['emerging-types', 'new-interfaces', 'expanding-contracts'] },
  E:  { description: 'Expansion — new features, growing files', characteristics: ['growing', 'feature-rich', 'active'] },
  SE: { description: 'Expanding implementation — new concrete code', characteristics: ['new-functions', 'feature-growth', 'active-impl'] },
  S:  { description: 'Implementation — concrete functions, business logic', characteristics: ['concrete', 'algorithmic', 'procedural'] },
  SW: { description: 'Consolidating implementation — refactoring existing code', characteristics: ['refactoring', 'optimizing', 'cleaning'] },
  W:  { description: 'Consolidation — cleanup, dead code removal', characteristics: ['cleanup', 'stable', 'optimized'] },
  NW: { description: 'Refining abstraction — type cleanup, interface consolidation', characteristics: ['refining-types', 'consolidating-interfaces', 'polishing'] },
}

// ─── Build Result ──────────────────────────────────────────────────────────────

/**
 * Build complete compass rose result.
 *
 * @example
 * buildCompassRoseResult(['a.ts'], ['interface Foo {}'], {})
 */
export function buildCompassRoseResult(files: string[], contents: string[], options: CompassRoseOptions): CompassRoseResult {
  const knownSet = new Set(files)
  const headings: Heading[] = []
  const readings: CompassReading[] = []
  const directionFiles: Record<string, string[]> = { N: [], NE: [], E: [], SE: [], S: [], SW: [], W: [], NW: [] }

  // ─── per-file analysis ───────────────────────────────────────
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const content = contents[i] || ''

    const abstraction = computeAbstraction(content)
    const implementation = computeImplementation(content)
    const expansion = computeExpansion(content)
    const consolidation = computeConsolidation(content)
    const bearing = computeBearing(abstraction, implementation, expansion, consolidation)
    const cardinal = classifyCardinalDirection(bearing)

    const heading: Heading = {
      file,
      bearing,
      cardinalDirection: cardinal,
      abstraction,
      implementation,
      expansion,
      consolidation,
    }
    headings.push(heading)

    const imports = extractImports(content)
    const importedBy: string[] = []
    for (let j = 0; j < files.length; j++) {
      if (j === i) continue
      const otherContent = contents[j] || ''
      const otherImports = extractImports(otherContent)
      for (const imp of otherImports) {
        const resolved = resolveImportPath(imp, knownSet)
        if (resolved === file) {
          importedBy.push(files[j])
          break
        }
      }
    }

    const winds = identifyWinds(file, imports, importedBy)
    const stableImports = imports.filter(() => Math.random() > 0.5)
    const anchors = identifyAnchors(file, stableImports)
    const drift = 0 // computed later

    readings.push({ file, heading, winds, anchors, drift })
    directionFiles[cardinal].push(file)
  }

  // ─── average bearing & drift ─────────────────────────────────
  const avgBearing = headings.length > 0
    ? Math.round(headings.reduce((s, h) => s + h.bearing, 0) / headings.length * 100) / 100
    : 0

  for (const reading of readings) {
    reading.drift = Math.round(computeDrift(reading.heading.bearing, avgBearing) * 100) / 100
  }

  const avgDrift = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.drift, 0) / readings.length * 100) / 100
    : 0

  // ─── directions ──────────────────────────────────────────────
  const directions: Direction[] = Object.entries(DIRECTION_META).map(([name, meta]) => {
    const dirFiles = directionFiles[name] || []
    const strength = files.length > 0 ? Math.round((dirFiles.length / files.length) * 100) : 0
    return {
      name,
      description: meta.description,
      files: dirFiles,
      strength,
      characteristics: meta.characteristics,
    }
  })

  // ─── flows ───────────────────────────────────────────────────
  const flows: FlowVector[] = []
  for (let i = 0; i < files.length; i++) {
    const content = contents[i] || ''
    const imports = extractImports(content)
    for (const imp of imports) {
      const resolved = resolveImportPath(imp, knownSet)
      if (resolved) {
        flows.push(computeFlowVector(files[i], resolved, 'dependency'))
      }
    }
  }

  // ─── stats ───────────────────────────────────────────────────
  const northDirs = ['N', 'NE', 'NW']
  const southDirs = ['S', 'SE', 'SW']
  const eastDirs = ['NE', 'E', 'SE']
  const westDirs = ['NW', 'W', 'SW']

  const northwardCount = headings.filter((h) => northDirs.includes(h.cardinalDirection)).length
  const southwardCount = headings.filter((h) => southDirs.includes(h.cardinalDirection)).length
  const eastwardCount = headings.filter((h) => eastDirs.includes(h.cardinalDirection)).length
  const westwardCount = headings.filter((h) => westDirs.includes(h.cardinalDirection)).length

  const directionCounts: Record<string, number> = {}
  for (const h of headings) {
    directionCounts[h.cardinalDirection] = (directionCounts[h.cardinalDirection] || 0) + 1
  }
  const dominantDirection = Object.entries(directionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N'

  const magneticNorth = findMagneticNorth(files, contents)
  const consistency = computeConsistency(readings)
  const navigability = computeNavigability(flows, consistency)

  const stats: CompassRoseStats = {
    totalFiles: files.length,
    northwardCount,
    southwardCount,
    eastwardCount,
    westwardCount,
    avgBearing,
    dominantDirection,
    avgDrift,
    magneticNorth,
    consistency,
    navigability,
  }

  // ─── recommendations ────────────────────────────────────────
  const recommendations = generateRecommendations(directions, flows, readings, stats)

  // ─── verbose anchors ─────────────────────────────────────────
  if (options.verbose) {
    for (const reading of readings) {
      if (reading.anchors.length === 0 && reading.heading.consolidation > 50) {
        reading.anchors.push('self-anchored')
      }
    }
  }

  return { directions, flows, readings, stats, recommendations }
}
