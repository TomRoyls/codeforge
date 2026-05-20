// ─── Types ────────────────────────────────────────────────────────────────────

export interface Boundary {
  from: string
  to: string
  type: 'import' | 're-export' | 'shared-type' | 'shared-util' | 'circular'
  strength: number
  bidirectional: boolean
}

export interface TwilightZone {
  file: string
  modules: string[]
  boundaryCount: number
  couplingScore: number
  category: 'bridge' | 'shared' | 'orphan' | 'chimera' | 'leaky'
  reason: string
}

export interface TwilightStats {
  totalZones: number
  bridgeCount: number
  sharedCount: number
  orphanCount: number
  chimeraCount: number
  leakyCount: number
  avgCoupling: number
  strongestBoundary: string
  moduleCount: number
  boundaryCount: number
  circularDependencies: number
}

export interface TwilightResult {
  zones: TwilightZone[]
  boundaries: Boundary[]
  stats: TwilightStats
  recommendations: string[]
}

export interface TwilightOptions {
  verbose?: boolean
}

// ─── Module Discovery ─────────────────────────────────────────────────────────

/**
 * Group files into modules by directory.
 *
 * @example
 * discoverModules(['src/core/a.ts', 'src/cmd/b.ts'])
 */
export function discoverModules(files: string[]): Map<string, string[]> {
  const modules = new Map<string, string[]>()
  for (const file of files) {
    const parts = file.split('/')
    const mod = parts.length > 1 ? parts.slice(0, -1).join('/') : '<root>'
    const existing = modules.get(mod) ?? []
    existing.push(file)
    modules.set(mod, existing)
  }
  return modules
}

/**
 * Get module name for a file.
 *
 * @example
 * getModuleForFile('src/core/a.ts')
 */
export function getModuleForFile(file: string): string {
  const parts = file.split('/')
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '<root>'
}

// ─── Boundary Detection ───────────────────────────────────────────────────────

/**
 * Extract import paths from file content.
 *
 * @example
 * extractImports("import { x } from './y';")
 */
export function extractImports(content: string): string[] {
  const imports: string[] = []
  const namedMatch = content.matchAll(/import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g)
  for (const m of namedMatch) imports.push(m[1]!)
  const defaultMatch = content.matchAll(/import\s+\w+\s+from\s+['"]([^'"]+)['"]/g)
  for (const m of defaultMatch) imports.push(m[1]!)
  const sideEffectMatch = content.matchAll(/import\s+['"]([^'"]+)['"]/g)
  for (const m of sideEffectMatch) imports.push(m[1]!)
  return imports
}

/**
 * Extract re-export paths from file content.
 *
 * @example
 * extractReExports("export { x } from './y';")
 */
export function extractReExports(content: string): string[] {
  const reExports: string[] = []
  const match = content.matchAll(/export\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g)
  for (const m of match) reExports.push(m[1]!)
  return reExports
}

/**
 * Extract exported symbol names.
 *
 * @example
 * extractExportedNames("export const x = 1;")
 */
export function extractExportedNames(content: string): string[] {
  const names: string[] = []
  const constMatch = content.matchAll(/export\s+const\s+(\w+)/g)
  for (const m of constMatch) names.push(m[1]!)
  const funcMatch = content.matchAll(/export\s+function\s+(\w+)/g)
  for (const m of funcMatch) names.push(m[1]!)
  const classMatch = content.matchAll(/export\s+class\s+(\w+)/g)
  for (const m of classMatch) names.push(m[1]!)
  const interfaceMatch = content.matchAll(/export\s+interface\s+(\w+)/g)
  for (const m of interfaceMatch) names.push(m[1]!)
  const typeMatch = content.matchAll(/export\s+type\s+(\w+)/g)
  for (const m of typeMatch) names.push(m[1]!)
  return names
}

/**
 * Resolve a relative import path against a file.
 *
 * @example
 * resolveImportPath('src/core/a.ts', './b')
 */
export function resolveImportPath(fromFile: string, importPath: string): string {
  if (!importPath.startsWith('.')) return ''
  const dir = fromFile.includes('/') ? fromFile.split('/').slice(0, -1).join('/') : ''
  const parts = dir ? `${dir}/${importPath}` : importPath
  const normalized = parts.split('/').reduce<string[]>((acc, segment) => {
    if (segment === '..') acc.pop()
    else if (segment !== '.' && segment !== '') acc.push(segment)
    return acc
  }, []).join('/')
  return normalized.endsWith('.ts') || normalized.endsWith('.js') ? normalized : `${normalized}.ts`
}

/**
 * Compute boundaries between files.
 *
 * @example
 * computeBoundaries(files, contents)
 */
export function computeBoundaries(files: string[], contents: string[]): Boundary[] {
  const boundaries: Boundary[] = []
  const fileSet = new Set(files)

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const fromModule = getModuleForFile(file)

    const imports = extractImports(content)
    for (const imp of imports) {
      const resolved = resolveImportPath(file, imp)
      if (resolved && fileSet.has(resolved) && resolved !== file) {
        const toModule = getModuleForFile(resolved)
        if (toModule !== fromModule) {
          boundaries.push({
            from: file,
            to: resolved,
            type: 'import',
            strength: 50,
            bidirectional: false,
          })
        }
      }
    }

    const reExports = extractReExports(content)
    for (const reExp of reExports) {
      const resolved = resolveImportPath(file, reExp)
      if (resolved && fileSet.has(resolved) && resolved !== file) {
        const toModule = getModuleForFile(resolved)
        if (toModule !== fromModule) {
          boundaries.push({
            from: file,
            to: resolved,
            type: 're-export',
            strength: 40,
            bidirectional: false,
          })
        }
      }
    }
  }

  markBidirectional(boundaries)
  computeBoundaryStrengths(boundaries)

  return boundaries
}

function markBidirectional(boundaries: Boundary[]): void {
  for (const b of boundaries) {
    const reverse = boundaries.find(
      (other) => other.from === b.to && other.to === b.from,
    )
    if (reverse) {
      b.bidirectional = true
      reverse.bidirectional = true
    }
  }
}

function computeBoundaryStrengths(boundaries: Boundary[]): void {
  const countMap = new Map<string, number>()
  for (const b of boundaries) {
    const key = `${b.from}->${b.to}`
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }
  for (const b of boundaries) {
    const fromCount = boundaries.filter((x) => x.from === b.from).length
    const toCount = boundaries.filter((x) => x.to === b.to).length
    b.strength = Math.min(100, 30 + fromCount * 10 + toCount * 5 + (b.bidirectional ? 20 : 0))
  }
}

// ─── Circular Dependency Detection ────────────────────────────────────────────

/**
 * Detect circular dependencies from boundaries.
 *
 * @example
 * detectCircularDeps(boundaries)
 */
export function detectCircularDeps(boundaries: Boundary[]): Boundary[] {
  const circular: Boundary[] = []
  for (const b of boundaries) {
    if (b.bidirectional && !circular.some((c) => c.from === b.to && c.to === b.from)) {
      circular.push({ ...b, type: 'circular' })
    }
  }
  return circular
}

// ─── Zone Detection ───────────────────────────────────────────────────────────

/**
 * Find bridge files that connect many modules.
 *
 * @example
 * findBridgeFiles(files, contents, boundaries)
 */
export function findBridgeFiles(
  files: string[],
  contents: string[],
  boundaries: Boundary[],
): TwilightZone[] {
  const zones: TwilightZone[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const fileModule = getModuleForFile(file)

    const outgoing = boundaries.filter((b) => b.from === file)
    const targetModules = new Set(outgoing.map((b) => getModuleForFile(b.to)))

    if (targetModules.size >= 3) {
      const uniqueModules = [...targetModules]
      zones.push({
        file,
        modules: uniqueModules,
        boundaryCount: outgoing.length,
        couplingScore: Math.min(100, targetModules.size * 25),
        category: 'bridge',
        reason: `Imports from ${uniqueModules.length} different modules`,
      })
    }

    const imports = extractImports(content)
    if (imports.length >= 5 && targetModules.size >= 2) {
      const alreadyBridge = zones.find((z) => z.file === file && z.category === 'bridge')
      if (!alreadyBridge) {
        zones.push({
          file,
          modules: [...targetModules],
          boundaryCount: outgoing.length,
          couplingScore: Math.min(100, imports.length * 10),
          category: 'bridge',
          reason: `High import count (${imports.length}) spanning ${targetModules.size} modules`,
        })
      }
    }
  }

  return zones
}

/**
 * Find shared files used by many modules.
 *
 * @example
 * findSharedFiles(files, contents, boundaries)
 */
export function findSharedFiles(
  files: string[],
  contents: string[],
  boundaries: Boundary[],
): TwilightZone[] {
  const zones: TwilightZone[] = []

  for (const file of files) {
    const incoming = boundaries.filter((b) => b.to === file)
    const sourceModules = new Set(incoming.map((b) => getModuleForFile(b.from)))

    if (sourceModules.size >= 3) {
      zones.push({
        file,
        modules: [...sourceModules],
        boundaryCount: incoming.length,
        couplingScore: Math.min(100, sourceModules.size * 20),
        category: 'shared',
        reason: `Used by ${sourceModules.size} different modules`,
      })
    }
  }

  return zones
}

/**
 * Find orphan files with no clear module affiliation.
 *
 * @example
 * findOrphanFiles(files, contents, modules)
 */
export function findOrphanFiles(
  files: string[],
  contents: string[],
  modules: Map<string, string[]>,
): TwilightZone[] {
  const zones: TwilightZone[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const fileModule = getModuleForFile(file)
    const moduleFiles = modules.get(fileModule) ?? []

    const imports = extractImports(content)
    const exportedNames = extractExportedNames(content)
    const hasInternalImports = imports.filter((imp) => imp.startsWith('.')).length > 0
    const hasExports = exportedNames.length > 0

    if (moduleFiles.length === 1 && !hasInternalImports && !hasExports) {
      zones.push({
        file,
        modules: [fileModule],
        boundaryCount: 0,
        couplingScore: 0,
        category: 'orphan',
        reason: 'Solo file in module with no imports/exports',
      })
    }
  }

  return zones
}

/**
 * Find chimera files mixing concerns from multiple domains.
 *
 * @example
 * findChimeraFiles(files, contents, modules)
 */
export function findChimeraFiles(
  files: string[],
  contents: string[],
  boundaries: Boundary[],
): TwilightZone[] {
  const zones: TwilightZone[] = []

  for (const file of files) {
    const outgoing = boundaries.filter((b) => b.from === file)
    const incoming = boundaries.filter((b) => b.to === file)
    const allRelated = [...outgoing, ...incoming]

    const domainSet = new Set<string>()
    for (const b of allRelated) {
      const otherFile = b.from === file ? b.to : b.from
      domainSet.add(getModuleForFile(otherFile))
    }

    if (domainSet.size >= 3) {
      zones.push({
        file,
        modules: [...domainSet],
        boundaryCount: allRelated.length,
        couplingScore: Math.min(100, domainSet.size * 20),
        category: 'chimera',
        reason: `Mixes concerns from ${domainSet.size} top-level domains`,
      })
    }
  }

  return zones
}

/**
 * Find leaky files exposing too many internals.
 *
 * @example
 * findLeakyFiles(files, contents)
 */
export function findLeakyFiles(files: string[], contents: string[]): TwilightZone[] {
  const zones: TwilightZone[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const content = contents[i] ?? ''
    const exportedNames = extractExportedNames(content)

    if (exportedNames.length >= 10) {
      zones.push({
        file,
        modules: [getModuleForFile(file)],
        boundaryCount: exportedNames.length,
        couplingScore: Math.min(100, exportedNames.length * 8),
        category: 'leaky',
        reason: `Exports ${exportedNames.length} symbols — large surface area`,
      })
    }
  }

  return zones
}

// ─── Coupling Score ───────────────────────────────────────────────────────────

/**
 * Compute average coupling score for zones.
 *
 * @example
 * computeAvgCoupling(zones)
 */
export function computeAvgCoupling(zones: TwilightZone[]): number {
  if (zones.length === 0) return 0
  const total = zones.reduce((sum, z) => sum + z.couplingScore, 0)
  return Math.round(total / zones.length)
}

/**
 * Find strongest boundary.
 *
 * @example
 * findStrongestBoundary(boundaries)
 */
export function findStrongestBoundary(boundaries: Boundary[]): string {
  if (boundaries.length === 0) return ''
  const strongest = boundaries.reduce((a, b) => a.strength >= b.strength ? a : b)
  return `${strongest.from} → ${strongest.to}`
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/**
 * Compute twilight statistics.
 *
 * @example
 * computeTwilightStats(zones, boundaries, modules)
 */
export function computeTwilightStats(
  zones: TwilightZone[],
  boundaries: Boundary[],
  modules: Map<string, string[]>,
): TwilightStats {
  const circular = detectCircularDeps(boundaries)

  return {
    totalZones: zones.length,
    bridgeCount: zones.filter((z) => z.category === 'bridge').length,
    sharedCount: zones.filter((z) => z.category === 'shared').length,
    orphanCount: zones.filter((z) => z.category === 'orphan').length,
    chimeraCount: zones.filter((z) => z.category === 'chimera').length,
    leakyCount: zones.filter((z) => z.category === 'leaky').length,
    avgCoupling: computeAvgCoupling(zones),
    strongestBoundary: findStrongestBoundary(boundaries),
    moduleCount: modules.size,
    boundaryCount: boundaries.length,
    circularDependencies: circular.length,
  }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate twilight zone recommendations.
 *
 * @example
 * generateTwilightRecommendations(zones, stats)
 */
export function generateTwilightRecommendations(
  zones: TwilightZone[],
  stats: TwilightStats,
): string[] {
  const recs: string[] = []

  if (stats.circularDependencies > 0) {
    recs.push(`Found ${stats.circularDependencies} circular dependenc${stats.circularDependencies === 1 ? 'y' : 'ies'} — break the cycle with dependency injection or events`)
  }

  const bridges = zones.filter((z) => z.category === 'bridge')
  if (bridges.length > 0) {
    recs.push(`${bridges.length} bridge file(s) found — consider applying the Facade pattern to reduce coupling`)
  }

  const orphans = zones.filter((z) => z.category === 'orphan')
  if (orphans.length > 0) {
    recs.push(`${orphans.length} orphan file(s) — assign to a module or create a new module for them`)
  }

  const chimeras = zones.filter((z) => z.category === 'chimera')
  if (chimeras.length > 0) {
    recs.push(`${chimeras.length} chimera file(s) — split into focused single-concern files`)
  }

  const leaky = zones.filter((z) => z.category === 'leaky')
  if (leaky.length > 0) {
    recs.push(`${leaky.length} leaky file(s) — reduce exported surface area, use internal exports`)
  }

  if (stats.avgCoupling > 60) {
    recs.push(`High average coupling (${stats.avgCoupling}%) — consider decoupling modules`)
  }

  if (recs.length === 0) {
    recs.push('No twilight zones detected — module boundaries are clean')
  }

  return recs
}

// ─── Build Result ─────────────────────────────────────────────────────────────

/**
 * Build the complete twilight analysis result.
 *
 * @example
 * buildTwilightResult(files, contents)
 */
export function buildTwilightResult(
  files: string[],
  contents: string[],
  _options?: TwilightOptions,
): TwilightResult {
  const modules = discoverModules(files)
  const boundaries = computeBoundaries(files, contents)

  const bridgeZones = findBridgeFiles(files, contents, boundaries)
  const sharedZones = findSharedFiles(files, contents, boundaries)
  const orphanZones = findOrphanFiles(files, contents, modules)
  const chimeraZones = findChimeraFiles(files, contents, boundaries)
  const leakyZones = findLeakyFiles(files, contents)

  const allZones = deduplicateZones([
    ...bridgeZones,
    ...sharedZones,
    ...orphanZones,
    ...chimeraZones,
    ...leakyZones,
  ])

  const stats = computeTwilightStats(allZones, boundaries, modules)
  const recommendations = generateTwilightRecommendations(allZones, stats)

  return {
    zones: allZones,
    boundaries,
    stats,
    recommendations,
  }
}

function deduplicateZones(zones: TwilightZone[]): TwilightZone[] {
  const seen = new Map<string, TwilightZone>()
  for (const z of zones) {
    const existing = seen.get(z.file)
    if (!existing || z.couplingScore > existing.couplingScore) {
      seen.set(z.file, z)
    }
  }
  return [...seen.values()]
}
