// ─── Types ────────────────────────────────────────────────────────────────────

export interface AtlasRegion {
  path: string
  name: string
  files: number
  totalLines: number
  codeLines: number
  commentLines: number
  exports: number
  imports: number
  complexity: number
  testFiles: number
  functions: number
  classes: number
  languages: string[]
  lastModified: string
  healthScore: number
  subregions: AtlasRegion[]
  description: string
}

export interface AtlasStats {
  totalRegions: number
  totalFiles: number
  totalLines: number
  largestRegion: string
  smallestRegion: string
  mostComplexRegion: string
  healthiestRegion: string
  unhealthiestRegion: string
  averageHealth: number
}

export interface AtlasResult {
  root: AtlasRegion
  regions: AtlasRegion[]
  stats: AtlasStats
  legend: string[]
  recommendations: string[]
}

export interface AtlasOptions {
  verbose?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FUNC_RE = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\(/g
const CLASS_RE = /(?:export\s+)?class\s+(\w+)/g
const EXPORT_RE = /export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+/g
const IMPORT_RE = /import\s+/g
const TEST_FILE_RE = /\.(test|spec)\.(ts|tsx|js|jsx)$/

const DESCRIPTION_MAP: Record<string, string> = {
  commands: 'CLI command implementations',
  command: 'CLI command module',
  core: 'Core library functions',
  lib: 'Library modules',
  utils: 'Utility functions',
  helpers: 'Helper functions',
  services: 'Service layer',
  components: 'UI components',
  pages: 'Page components',
  routes: 'Route definitions',
  models: 'Data models',
  types: 'Type definitions',
  interfaces: 'Interface definitions',
  config: 'Configuration files',
  middleware: 'Middleware layer',
  hooks: 'Custom hooks',
  store: 'State management',
  api: 'API layer',
  test: 'Test suites',
  tests: 'Test suites',
  '__tests__': 'Test suites',
  spec: 'Test specifications',
  docs: 'Documentation',
  styles: 'Style sheets',
  assets: 'Static assets',
  public: 'Public assets',
  static: 'Static files',
  scripts: 'Build scripts',
  src: 'Source code',
  dist: 'Build output',
  build: 'Build configuration',
  adapters: 'Adapter layer',
  plugins: 'Plugin modules',
}

// ─── computeRegionStats ───────────────────────────────────────────────────────

/**
 * Aggregate metrics for a set of files.
 *
 * @example
 * computeRegionStats(['a.ts'], ['function foo() {}'])
 */
export function computeRegionStats(filePaths: string[], contents: string[]): Omit<AtlasRegion, 'path' | 'name' | 'subregions' | 'description' | 'lastModified'> {
  let files = 0
  let totalLines = 0
  let codeLines = 0
  let commentLines = 0
  let exports = 0
  let imports = 0
  let complexity = 0
  let testFiles = 0
  let functions = 0
  let classes = 0
  const langSet = new Set<string>()

  for (let i = 0; i < filePaths.length; i++) {
    const fp = filePaths[i] ?? ''
    const content = contents[i] ?? ''
    files++

    const lines = content.split('\n')
    totalLines += lines.length

    let inBlockComment = false
    for (const line of lines) {
      const trimmed = line.trim()
      if (inBlockComment) {
        commentLines++
        if (trimmed.includes('*/')) inBlockComment = false
        continue
      }
      if (trimmed.startsWith('//')) { commentLines++; continue }
      if (trimmed.startsWith('/*')) { commentLines++; if (!trimmed.includes('*/')) inBlockComment = true; continue }
      if (trimmed.startsWith('*')) { commentLines++; continue }
      if (trimmed.length > 0) codeLines++
    }

    let m: RegExpExecArray | null
    const funcRe = new RegExp(FUNC_RE.source, 'g')
    while ((m = funcRe.exec(content)) !== null) functions++
    const classRe = new RegExp(CLASS_RE.source, 'g')
    while ((m = classRe.exec(content)) !== null) classes++
    const exportRe = new RegExp(EXPORT_RE.source, 'g')
    while ((m = exportRe.exec(content)) !== null) exports++
    const importRe = new RegExp(IMPORT_RE.source, 'g')
    while ((m = importRe.exec(content)) !== null) imports++

    complexity += countComplexity(content)

    if (TEST_FILE_RE.test(fp)) testFiles++

    const ext = fp.split('.').pop() ?? ''
    const langMap: Record<string, string> = { ts: 'TypeScript', tsx: 'TSX', js: 'JavaScript', jsx: 'JSX', json: 'JSON', md: 'Markdown', css: 'CSS', html: 'HTML', py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby', sh: 'Shell', yaml: 'YAML', yml: 'YAML', sql: 'SQL' }
    if (langMap[ext]) langSet.add(langMap[ext])
  }

  const health = computeHealthScoreRaw(codeLines, commentLines, complexity, functions + classes, testFiles, files)

  return {
    files,
    totalLines,
    codeLines,
    commentLines,
    exports,
    imports,
    complexity,
    testFiles,
    functions,
    classes,
    languages: [...langSet].sort(),
    healthScore: health,
  }
}

function countComplexity(content: string): number {
  let score = 0
  const patterns = [/\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\&\&/g, /\|\|/g, /\?\./g, /\?\?/g]
  for (const p of patterns) {
    const re = new RegExp(p.source, 'g')
    const matches = content.match(re)
    score += matches ? matches.length : 0
  }
  return score
}

function computeHealthScoreRaw(codeLines: number, commentLines: number, complexity: number, symbols: number, testFiles: number, totalFiles: number): number {
  if (totalFiles === 0) return 100
  let score = 50

  const docRatio = codeLines > 0 ? commentLines / codeLines : 0
  score += Math.min(docRatio * 20, 15)

  const avgComplexity = symbols > 0 ? complexity / symbols : 0
  if (avgComplexity < 5) score += 15
  else if (avgComplexity < 10) score += 10
  else if (avgComplexity < 20) score += 5
  else score -= 5

  const testRatio = totalFiles > 0 ? testFiles / totalFiles : 0
  score += Math.min(testRatio * 20, 20)

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ─── inferRegionDescription ───────────────────────────────────────────────────

/**
 * Auto-generate a region description based on path and files.
 *
 * @example
 * inferRegionDescription('src/commands', ['count.ts', 'analyze.ts'])
 * // => 'CLI command implementations'
 */
export function inferRegionDescription(dirPath: string, filePaths: string[]): string {
  const parts = dirPath.split('/')
  const lastDir = parts[parts.length - 1] || dirPath

  if (DESCRIPTION_MAP[lastDir]) return DESCRIPTION_MAP[lastDir]

  const hasTests = filePaths.some((f) => TEST_FILE_RE.test(f))
  if (hasTests && filePaths.length > 0 && filePaths.every((f) => TEST_FILE_RE.test(f))) return 'Test suites'

  const allTs = filePaths.every((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
  if (allTs && filePaths.length > 0) return `TypeScript module (${filePaths.length} file(s))`

  if (filePaths.length === 0) return 'Empty directory'
  return `${filePaths.length} file(s)`
}

// ─── computeHealthScore ───────────────────────────────────────────────────────

/**
 * Compute health score for a region (0-100).
 *
 * @example
 * computeHealthScore(region)
 */
export function computeHealthScore(region: AtlasRegion): number {
  return region.healthScore
}

// ─── buildAtlas ───────────────────────────────────────────────────────────────

/**
 * Recursively build region tree from file paths and contents.
 *
 * @example
 * buildAtlas(['src/a.ts', 'src/b.ts'], ['code1', 'code2'])
 */
export function buildAtlas(files: string[], contents: string[]): AtlasRegion {
  const tree = new Map<string, { files: string[]; contents: string[] }>()

  for (let i = 0; i < files.length; i++) {
    const fp = files[i] ?? ''
    const dir = fp.includes('/') ? fp.substring(0, fp.lastIndexOf('/')) : '.'
    if (!tree.has(dir)) tree.set(dir, { files: [], contents: [] })
    tree.get(dir)!.files.push(fp)
    tree.get(dir)!.contents.push(contents[i] ?? '')
  }

  function buildRegion(dirPath: string): AtlasRegion {
    const entry = tree.get(dirPath)
    const childDirs = new Set<string>()

    for (const key of tree.keys()) {
      if (key === dirPath) continue
      if (dirPath === '.') {
        const child = key.includes('/') ? key.substring(0, key.indexOf('/')) : key
        childDirs.add(child)
      } else if (key.startsWith(dirPath + '/')) {
        const rest = key.substring(dirPath.length + 1)
        const child = rest.includes('/') ? rest.substring(0, rest.indexOf('/')) : rest
        childDirs.add(child)
      }
    }

    const ownFiles = entry?.files ?? []
    const ownContents = entry?.contents ?? []
    const stats = computeRegionStats(ownFiles, ownContents)

    const name = dirPath.includes('/') ? dirPath.substring(dirPath.lastIndexOf('/') + 1) : dirPath
    const subregions: AtlasRegion[] = []
    for (const child of [...childDirs].sort()) {
      const childPath = dirPath === '.' ? child : `${dirPath}/${child}`
      subregions.push(buildRegion(childPath))
    }

    const allFiles = [...ownFiles, ...subregions.flatMap((s) => allFilesInRegion(s))]

    return {
      path: dirPath,
      name,
      ...stats,
      files: ownFiles.length + subregions.reduce((s, r) => s + r.files, 0),
      totalLines: stats.totalLines + subregions.reduce((s, r) => s + r.totalLines, 0),
      codeLines: stats.codeLines + subregions.reduce((s, r) => s + r.codeLines, 0),
      commentLines: stats.commentLines + subregions.reduce((s, r) => s + r.commentLines, 0),
      exports: stats.exports + subregions.reduce((s, r) => s + r.exports, 0),
      imports: stats.imports + subregions.reduce((s, r) => s + r.imports, 0),
      complexity: stats.complexity + subregions.reduce((s, r) => s + r.complexity, 0),
      testFiles: stats.testFiles + subregions.reduce((s, r) => s + r.testFiles, 0),
      functions: stats.functions + subregions.reduce((s, r) => s + r.functions, 0),
      classes: stats.classes + subregions.reduce((s, r) => s + r.classes, 0),
      languages: [...new Set([...stats.languages, ...subregions.flatMap((r) => r.languages)])].sort(),
      lastModified: '',
      healthScore: stats.healthScore,
      subregions,
      description: inferRegionDescription(dirPath, allFiles),
    }
  }

  const allDirs = [...tree.keys()]
  const rootDir = allDirs.length === 1 ? allDirs[0] : '.'

  if (tree.has(rootDir) || allDirs.some((d) => d.startsWith(rootDir + '/') || rootDir === '.')) {
    if (!tree.has(rootDir)) tree.set(rootDir, { files: [], contents: [] })
    return buildRegion(rootDir)
  }

  return buildRegion(rootDir)
}

function allFilesInRegion(region: AtlasRegion): string[] {
  return region.subregions.length > 0 ? region.subregions.flatMap(allFilesInRegion) : []
}

// ─── findLargestRegion ────────────────────────────────────────────────────────

/**
 * Find the region with most files/lines.
 *
 * @example
 * findLargestRegion(regions)
 */
export function findLargestRegion(regions: AtlasRegion[]): string {
  if (regions.length === 0) return ''
  return regions.reduce((a, b) => (a.totalLines > b.totalLines ? a : b)).path
}

// ─── findMostComplexRegion ────────────────────────────────────────────────────

/**
 * Find the region with highest complexity.
 *
 * @example
 * findMostComplexRegion(regions)
 */
export function findMostComplexRegion(regions: AtlasRegion[]): string {
  if (regions.length === 0) return ''
  return regions.reduce((a, b) => (a.complexity > b.complexity ? a : b)).path
}

// ─── findHealthiestRegion ─────────────────────────────────────────────────────

/**
 * Find the region with the highest health score.
 *
 * @example
 * findHealthiestRegion(regions)
 */
export function findHealthiestRegion(regions: AtlasRegion[]): string {
  if (regions.length === 0) return ''
  return regions.reduce((a, b) => (a.healthScore > b.healthScore ? a : b)).path
}

// ─── findUnhealthiestRegion ───────────────────────────────────────────────────

/**
 * Find the region with the lowest health score.
 *
 * @example
 * findUnhealthiestRegion(regions)
 */
export function findUnhealthiestRegion(regions: AtlasRegion[]): string {
  if (regions.length === 0) return ''
  return regions.reduce((a, b) => (a.healthScore < b.healthScore ? a : b)).path
}

// ─── generateLegend ───────────────────────────────────────────────────────────

/**
 * Generate metric legend for the atlas.
 *
 * @example
 * generateLegend()
 */
export function generateLegend(): string[] {
  return [
    'Health: ● 80-100 (good) ◐ 50-79 (fair) ○ 0-49 (needs attention)',
    'Files: count of source files in region',
    'Lines: total lines (code + comments + blanks)',
    'Complexity: cyclomatic complexity score',
    'Tests: test file count and ratio',
    'Exports/Imports: module interface metrics',
  ]
}

// ─── generateRecommendations ──────────────────────────────────────────────────

/**
 * Generate recommendations based on atlas analysis.
 *
 * @example
 * generateRecommendations(root, stats)
 */
export function generateRecommendations(root: AtlasRegion, stats: AtlasStats): string[] {
  const recs: string[] = []

  if (stats.averageHealth < 50) {
    recs.push(`Average health score is ${stats.averageHealth} — consider improving documentation and test coverage`)
  }

  if (stats.unhealthiestRegion) {
    recs.push(`${stats.unhealthiestRegion} has the lowest health score — prioritize improvements here`)
  }

  if (root.testFiles === 0 && root.files > 5) {
    recs.push('No test files found — consider adding tests for better coverage')
  }

  const allRegions = flattenRegions(root)
  const untested = allRegions.filter((r) => r.files > 3 && r.testFiles === 0 && r.subregions.length === 0)
  if (untested.length > 0) {
    recs.push(`${untested.length} region(s) with files but no tests: ${untested.map((r) => r.path).join(', ')}`)
  }

  const complex = allRegions.filter((r) => r.complexity > 100 && r.subregions.length === 0)
  if (complex.length > 0) {
    recs.push(`${complex.length} region(s) with high complexity — consider refactoring`)
  }

  if (recs.length === 0) {
    recs.push('Codebase atlas looks healthy — well-structured and documented')
  }

  return recs
}

function flattenRegions(region: AtlasRegion): AtlasRegion[] {
  return [region, ...region.subregions.flatMap(flattenRegions)]
}

// ─── buildAtlasResult ─────────────────────────────────────────────────────────

/**
 * Build the complete atlas result.
 *
 * @example
 * buildAtlasResult(['src/a.ts'], ['function foo() {}'])
 */
export function buildAtlasResult(
  files: string[],
  contents: string[],
  _options?: AtlasOptions,
): AtlasResult {
  const root = buildAtlas(files, contents)
  const allRegions = flattenRegions(root)

  const stats: AtlasStats = {
    totalRegions: allRegions.length,
    totalFiles: root.files,
    totalLines: root.totalLines,
    largestRegion: findLargestRegion(allRegions),
    smallestRegion: allRegions.length > 0 ? allRegions.reduce((a, b) => a.totalLines < b.totalLines ? a : b).path : '',
    mostComplexRegion: findMostComplexRegion(allRegions),
    healthiestRegion: findHealthiestRegion(allRegions),
    unhealthiestRegion: findUnhealthiestRegion(allRegions),
    averageHealth: allRegions.length > 0 ? Math.round(allRegions.reduce((s, r) => s + r.healthScore, 0) / allRegions.length * 10) / 10 : 0,
  }

  const legend = generateLegend()
  const recommendations = generateRecommendations(root, stats)

  return { root, regions: allRegions, stats, legend, recommendations }
}
