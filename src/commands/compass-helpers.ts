// ─── Types ────────────────────────────────────────────────────────────────────

export type CompassCardinal = 'north' | 'south' | 'east' | 'west' | 'center'
export type RouteDifficulty = 'easy' | 'moderate' | 'complex'

export interface CompassDirection {
  direction: CompassCardinal
  name: string
  description: string
  files: string[]
  fileCount: number
  totalLines: number
  keyExports: string[]
  navigationHints: string[]
}

export interface NavigationRoute {
  from: string
  to: string
  path: string[]
  description: string
  difficulty: RouteDifficulty
}

export interface CompassStats {
  totalDirections: number
  totalRoutes: number
  averageRouteLength: number
  mostConnectedDirection: string
  leastConnectedDirection: string
  navigationComplexity: number
}

export interface CompassResult {
  directions: CompassDirection[]
  routes: NavigationRoute[]
  center: string
  stats: CompassStats
  onboardingGuide: string[]
  recommendations: string[]
}

export interface CompassOptions {
  verbose?: boolean
}

// ─── identifyDirections ───────────────────────────────────────────────────────

const NORTH_PATTERNS = /^(?:index|main|app|server|cli|bin|start|entry)\.(ts|tsx|js|jsx)$/
const SOUTH_PATTERNS = /\.(?:test|spec)\.(ts|tsx|js|jsx)$/
const EAST_PATTERNS = /\.(?:json|yaml|yml|toml|env|config\.(ts|js))$/
const WEST_PATTERNS = /(?:^|[\/])(?:dist|build|out|generated|\.generated)\.(?:ts|tsx|js|jsx)$/

/**
 * Classify files into compass directions.
 *
 * @example
 * identifyDirections(['index.ts', 'foo.test.ts', 'tsconfig.json'])
 */
export function identifyDirections(files: string[], contents: string[]): CompassDirection[] {
  const buckets: Record<CompassCardinal, string[]> = { north: [], south: [], east: [], west: [], center: [] }
  const lineMap = new Map<string, number>()
  const exportMap = new Map<string, string[]>()

  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const basename = file.split('/').pop() ?? file
    lineMap.set(file, content.split('\n').length)

    const exports: string[] = []
    const exportRe = /export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface)\s+(\w+)/g
    let m: RegExpExecArray | null
    while ((m = exportRe.exec(content)) !== null) exports.push(m[1])
    exportMap.set(file, exports)

    if (SOUTH_PATTERNS.test(basename)) { buckets.south.push(file); continue }
    if (EAST_PATTERNS.test(basename) || basename === 'tsconfig.json' || basename === 'package.json') { buckets.east.push(file); continue }
    if (file.startsWith('dist/') || file.startsWith('build/') || file.startsWith('out/') || WEST_PATTERNS.test(file)) { buckets.west.push(file); continue }
    if (NORTH_PATTERNS.test(basename)) { buckets.north.push(file); continue }
    buckets.center.push(file)
  }

  if (buckets.north.length === 0 && buckets.center.length > 0) {
    const likely = buckets.center.find((f) => {
      const b = f.split('/').pop() ?? ''
      return /^(?:index|main)\.(ts|js)$/.test(b)
    })
    if (likely) {
      buckets.center.splice(buckets.center.indexOf(likely), 1)
      buckets.north.push(likely)
    }
  }

  if (buckets.west.length === 0) {
    const distFiles = files.filter((f) => f.startsWith('dist/') || f.startsWith('build/'))
    buckets.west.push(...distFiles)
  }

  const hints: Record<CompassCardinal, string[]> = {
    north: ['These are your entry points — start here to trace execution flow', 'Follow imports downward into center modules'],
    south: ['Tests verify behavior — read these to understand expected behavior', 'Each test file typically mirrors a source file'],
    east: ['Configuration controls behavior — understand settings before diving into code', 'Check tsconfig.json for compiler options'],
    west: ['Build output lives here — usually safe to ignore during development', 'Generated files should not be edited directly'],
    center: ['Core business logic lives here — the heart of the codebase', 'Most other modules import from these files'],
  }

  const descriptions: Record<CompassCardinal, string> = {
    north: 'Entry Points — where execution starts',
    south: 'Tests — where verification happens',
    east: 'Configuration — where settings live',
    west: 'Build Output — where artifacts go',
    center: 'Core Logic — the heart of the codebase',
  }

  const names: Record<CompassCardinal, string> = {
    north: 'Entry Points',
    south: 'Tests',
    east: 'Configuration',
    west: 'Build Output',
    center: 'Core Logic',
  }

  const directions: CompassDirection[] = []
  for (const dir of ['north', 'center', 'east', 'south', 'west'] as CompassCardinal[]) {
    const fs = buckets[dir]
    if (fs.length === 0) continue
    const allExports = fs.flatMap((f) => exportMap.get(f) ?? [])
    directions.push({
      direction: dir,
      name: names[dir],
      description: descriptions[dir],
      files: fs.sort(),
      fileCount: fs.length,
      totalLines: fs.reduce((s, f) => s + (lineMap.get(f) ?? 0), 0),
      keyExports: [...new Set(allExports)].slice(0, 10),
      navigationHints: hints[dir],
    })
  }

  return directions
}

// ─── findNavigationRoutes ─────────────────────────────────────────────────────

const IMPORT_RE = /import\s+(?:type\s+)?(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/

/**
 * Trace import paths between compass directions.
 *
 * @example
 * findNavigationRoutes(directions, files, contents)
 */
export function findNavigationRoutes(
  directions: CompassDirection[],
  files: string[],
  contents: string[],
): NavigationRoute[] {
  const routes: NavigationRoute[] = []
  const fileDirMap = new Map<string, CompassCardinal>()

  for (const dir of directions) {
    for (const f of dir.files) {
      fileDirMap.set(f, dir.direction)
    }
  }

  const fileImports = new Map<string, Set<string>>()
  for (let i = 0; i < files.length; i++) {
    const file = files[i] ?? ''
    const content = contents[i] ?? ''
    const imported = new Set<string>()
    for (const line of content.split('\n')) {
      const match = line.match(IMPORT_RE)
      if (match) {
        const resolved = resolveSimpleImport(match[1], file, new Set(files))
        if (resolved) imported.add(resolved)
      }
    }
    fileImports.set(file, imported)
  }

  const seen = new Set<string>()
  for (const srcFile of files) {
    const srcDir = fileDirMap.get(srcFile)
    if (!srcDir) continue
    const imports = fileImports.get(srcFile)
    if (!imports) continue

    for (const targetFile of imports) {
      const targetDir = fileDirMap.get(targetFile)
      if (!targetDir || targetDir === srcDir) continue

      const key = `${srcDir}->${targetDir}`
      if (seen.has(key)) continue
      seen.add(key)

      const srcName = directions.find((d) => d.direction === srcDir)?.name ?? srcDir
      const tgtName = directions.find((d) => d.direction === targetDir)?.name ?? targetDir
      const difficulty = computeRouteDifficulty(srcFile, targetFile, fileImports)

      routes.push({
        from: srcName,
        to: tgtName,
        path: [srcFile, targetFile],
        description: `${srcName} imports from ${tgtName}`,
        difficulty,
      })
    }
  }

  return routes
}

function resolveSimpleImport(raw: string, fromFile: string, knownFiles: Set<string>): string | null {
  if (!raw.startsWith('.')) return null
  const fromDir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '.'
  const parts = fromDir === '.' ? raw.split('/') : [...fromDir.split('/'), ...raw.split('/')]
  const normalized: string[] = []
  for (const part of parts) {
    if (part === '..') { normalized.pop(); continue }
    if (part === '.' || part === '') continue
    normalized.push(part)
  }
  const candidates = [
    normalized.join('/'),
    normalized.join('/') + '.ts',
    normalized.join('/') + '.tsx',
    normalized.join('/') + '.js',
    normalized.join('/') + '/index.ts',
  ]
  for (const c of candidates) {
    if (knownFiles.has(c)) return c
  }
  return null
}

// ─── computeRouteDifficulty ───────────────────────────────────────────────────

/**
 * Compute route difficulty based on path length.
 *
 * @example
 * computeRouteDifficulty('a.ts', 'b.ts', imports)
 */
export function computeRouteDifficulty(
  _srcFile: string,
  _targetFile: string,
  _imports?: Map<string, Set<string>>,
): RouteDifficulty {
  const segments = _targetFile.split('/').length - 1
  if (segments <= 1) return 'easy'
  if (segments <= 3) return 'moderate'
  return 'complex'
}

// ─── findCenter ───────────────────────────────────────────────────────────────

/**
 * Find the module imported by the most other modules.
 *
 * @example
 * findCenter(['a.ts', 'b.ts', 'core.ts'], ['', 'import { x } from "./core"', 'import { x } from "./core"'])
 */
export function findCenter(files: string[], contents: string[]): string {
  const importCounts = new Map<string, number>()
  for (const f of files) importCounts.set(f, 0)

  for (let i = 0; i < files.length; i++) {
    const content = contents[i] ?? ''
    const file = files[i] ?? ''
    for (const line of content.split('\n')) {
      const match = line.match(IMPORT_RE)
      if (match) {
        const resolved = resolveSimpleImport(match[1], file, new Set(files))
        if (resolved && importCounts.has(resolved)) {
          importCounts.set(resolved, (importCounts.get(resolved) ?? 0) + 1)
        }
      }
    }
  }

  let maxCount = 0
  let maxFile = files[0] ?? ''
  for (const [f, c] of importCounts) {
    if (c > maxCount) { maxCount = c; maxFile = f }
  }

  return maxFile
}

// ─── generateOnboardingGuide ──────────────────────────────────────────────────

/**
 * Generate step-by-step reading order for onboarding.
 *
 * @example
 * generateOnboardingGuide(directions, routes)
 */
export function generateOnboardingGuide(directions: CompassDirection[], _routes: NavigationRoute[]): string[] {
  const steps: string[] = []
  const dirMap = new Map(directions.map((d) => [d.direction, d]))

  const order: CompassCardinal[] = ['north', 'center', 'east', 'west', 'south']
  const descriptions: Record<CompassCardinal, string> = {
    north: 'Start with Entry Points — understand where execution begins',
    center: 'Read Core Logic — this is the heart of the codebase',
    east: 'Review Configuration — understand settings and build options',
    west: 'Check Build Output — see what the build produces',
    south: 'Study Tests — verify your understanding through test cases',
  }

  for (let i = 0; i < order.length; i++) {
    const dir = order[i]
    const d = dirMap.get(dir)
    if (!d || d.fileCount === 0) continue
    const prefix = `[${i + 1}]`
    steps.push(`${prefix} ${descriptions[dir]}`)
    for (const file of d.files.slice(0, 5)) {
      steps.push(`    → ${file}`)
    }
    if (d.files.length > 5) {
      steps.push(`    → ... and ${d.files.length - 5} more`)
    }
  }

  return steps
}

// ─── computeNavigationComplexity ───────────────────────────────────────────────

/**
 * Compute navigation complexity score 0-100.
 *
 * @example
 * computeNavigationComplexity(routes)
 */
export function computeNavigationComplexity(routes: NavigationRoute[]): number {
  if (routes.length === 0) return 0
  const complexCount = routes.filter((r) => r.difficulty === 'complex').length
  const moderateCount = routes.filter((r) => r.difficulty === 'moderate').length
  const avgLen = routes.reduce((s, r) => s + r.path.length, 0) / routes.length

  const complexity = (complexCount * 30 + moderateCount * 10 + avgLen * 5)
  return Math.min(Math.round(complexity), 100)
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on compass analysis.
 *
 * @example
 * generateRecommendations(directions, stats)
 */
export function generateRecommendations(directions: CompassDirection[], stats: CompassStats): string[] {
  const recs: string[] = []
  const dirSet = new Set(directions.map((d) => d.direction))

  if (!dirSet.has('north')) {
    recs.push('No clear entry point found — consider adding an index.ts or main.ts')
  }

  if (!dirSet.has('south')) {
    recs.push('No test files found — add tests to improve code confidence')
  }

  if (!dirSet.has('east')) {
    recs.push('No configuration files detected — consider adding a tsconfig.json or config file')
  }

  if (stats.navigationComplexity > 50) {
    recs.push('Navigation complexity is high — consider simplifying import paths')
  }

  const center = directions.find((d) => d.direction === 'center')
  if (center && center.fileCount > 20) {
    recs.push(`Core logic has ${center.fileCount} files — consider splitting into sub-modules`)
  }

  if (recs.length === 0) {
    recs.push('Codebase navigation looks well-organized — good structure for onboarding')
  }

  return recs
}

// ─── buildCompassResult ───────────────────────────────────────────────────────

/**
 * Build the complete compass analysis result.
 *
 * @example
 * buildCompassResult(['index.ts', 'core.ts'], ['', 'export function foo() {}'])
 */
export function buildCompassResult(
  files: string[],
  contents: string[],
  _options?: CompassOptions,
): CompassResult {
  const directions = identifyDirections(files, contents)
  const routes = findNavigationRoutes(directions, files, contents)
  const center = findCenter(files, contents)

  const avgRouteLen = routes.length > 0
    ? Math.round(routes.reduce((s, r) => s + r.path.length, 0) / routes.length * 10) / 10
    : 0
  const navComplexity = computeNavigationComplexity(routes)

  const dirConnectionCounts = new Map<string, number>()
  for (const dir of directions) dirConnectionCounts.set(dir.direction, 0)
  for (const route of routes) {
    const fromDir = directions.find((d) => d.name === route.from)?.direction
    if (fromDir) dirConnectionCounts.set(fromDir, (dirConnectionCounts.get(fromDir) ?? 0) + 1)
  }

  let mostConnected = ''
  let leastConnected = ''
  let maxConn = -1
  let minConn = Infinity
  for (const [dir, count] of dirConnectionCounts) {
    if (count > maxConn) { maxConn = count; mostConnected = dir }
    if (count < minConn) { minConn = count; leastConnected = dir }
  }

  const stats: CompassStats = {
    totalDirections: directions.length,
    totalRoutes: routes.length,
    averageRouteLength: avgRouteLen,
    mostConnectedDirection: mostConnected,
    leastConnectedDirection: leastConnected,
    navigationComplexity: navComplexity,
  }

  const onboardingGuide = generateOnboardingGuide(directions, routes)
  const recommendations = generateRecommendations(directions, stats)

  return { directions, routes, center, stats, onboardingGuide, recommendations }
}
