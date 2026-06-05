// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A project file with existence and importance info.
 *
 * @example
 * const f: ProjectFile = { path: 'README.md', exists: true, required: true, category: 'essential', description: 'Project readme' }
 */
export interface ProjectFile {
  path: string
  exists: boolean
  required: boolean
  category: 'essential' | 'recommended' | 'optional'
  description: string
}

/**
 * A directory in the project structure.
 *
 * @example
 * const d: DirectoryStructure = { path: 'src', files: 10, subdirs: ['core'], depth: 1, purpose: 'source', isConventional: true }
 */
export interface DirectoryStructure {
  path: string
  files: number
  subdirs: string[]
  depth: number
  purpose: string
  isConventional: boolean
}

/**
 * A single structure check result.
 *
 * @example
 * const c: StructureCheck = { name: 'README exists', status: 'pass', message: 'README.md found', category: 'essential-files', details: '' }
 */
export interface StructureCheck {
  name: string
  status: 'pass' | 'warning' | 'fail'
  message: string
  category: 'essential-files' | 'directory-structure' | 'configuration' | 'testing' | 'documentation' | 'ci-cd'
  details: string
}

/**
 * Aggregate scaffold statistics.
 *
 * @example
 * const s: ScaffoldStats = { directories: 5, files: 20, maxDepth: 3, averageDepth: 1.5, checksPassed: 8, checksFailed: 2, healthScore: 80, grade: 'B' }
 */
export interface ScaffoldStats {
  directories: number
  files: number
  maxDepth: number
  averageDepth: number
  checksPassed: number
  checksFailed: number
  healthScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

/**
 * Complete scaffold analysis result.
 *
 * @example
 * const r: ScaffoldResult = { projectName: 'my-app', projectType: 'node', structure: [], checks: [], files: [], stats: s, missing: [], recommendations: [] }
 */
export interface ScaffoldResult {
  projectName: string
  projectType: string
  structure: DirectoryStructure[]
  checks: StructureCheck[]
  files: ProjectFile[]
  stats: ScaffoldStats
  missing: ProjectFile[]
  recommendations: string[]
}

/**
 * Options for scaffold analysis.
 *
 * @example
 * const o: ScaffoldOptions = { verbose: false }
 */
export interface ScaffoldOptions {
  verbose?: boolean
}

// ─── Project Type Detection ───────────────────────────────────────────────────

/**
 * Detect project type from file list.
 *
 * @example
 * detectProjectType(['package.json', 'tsconfig.json']) // 'node'
 */
export function detectProjectType(filePaths: string[]): string {
  const names = new Set(filePaths.map((p) => (p.split('/').at(-1) ?? '').toLowerCase()))
  if (names.has('package.json')) return 'node'
  if (names.has('cargo.toml')) return 'rust'
  if (names.has('go.mod')) return 'go'
  if (names.has('requirements.txt') || names.has('setup.py') || names.has('pyproject.toml')) return 'python'
  return 'unknown'
}

// ─── Essential File Checks ────────────────────────────────────────────────────

const ESSENTIAL_FILES: { pattern: RegExp; required: boolean; category: ProjectFile['category']; description: string }[] = [
  { pattern: /^readme\.md$/i, required: true, category: 'essential', description: 'Project documentation' },
  { pattern: /^licen[cs]e(\.md)?$/i, required: true, category: 'essential', description: 'License file' },
  { pattern: /^\.gitignore$/, required: true, category: 'essential', description: 'Git ignore rules' },
  { pattern: /^package\.json$/, required: false, category: 'recommended', description: 'Node.js package manifest' },
  { pattern: /^tsconfig\.json$/, required: false, category: 'recommended', description: 'TypeScript configuration' },
  { pattern: /^changelog\.md$/i, required: false, category: 'recommended', description: 'Change history' },
  { pattern: /^contributing\.md$/i, required: false, category: 'optional', description: 'Contribution guidelines' },
  { pattern: /^\.editorconfig$/, required: false, category: 'optional', description: 'Editor configuration' },
  { pattern: /^\.eslintrc(\.\w+)?$|^eslint\.config\.\w+$/i, required: false, category: 'recommended', description: 'Linter configuration' },
]

/**
 * Check for essential files and return their status.
 *
 * @example
 * checkEssentialFiles(['README.md', '.gitignore']) // [{ path: 'README.md', exists: true, ... }]
 */
export function checkEssentialFiles(filePaths: string[]): ProjectFile[] {
  const rootFiles = new Set(filePaths.filter((p) => !p.includes('/')).map((p) => p.toLowerCase()))
  const results: ProjectFile[] = []

  for (const ef of ESSENTIAL_FILES) {
    let found = false
    for (const rf of rootFiles) {
      if (ef.pattern.test(rf)) {
        found = true
        break
      }
    }
    const name = ef.pattern.source.replace(/^\^/, '').replace(/\$$/, '').replace(/\\\./g, '.')
    results.push({
      path: name,
      exists: found,
      required: ef.required,
      category: ef.category,
      description: ef.description,
    })
  }

  return results
}

// ─── Directory Structure ──────────────────────────────────────────────────────

const PURPOSE_MAP: Record<string, string> = {
  src: 'source',
  lib: 'source',
  app: 'application',
  test: 'tests',
  tests: 'tests',
  __tests__: 'tests',
  spec: 'tests',
  docs: 'documentation',
  doc: 'documentation',
  config: 'configuration',
  scripts: 'scripts',
  build: 'build output',
  dist: 'distribution',
  out: 'output',
  public: 'public assets',
  static: 'static assets',
  assets: 'assets',
  styles: 'stylesheets',
  css: 'stylesheets',
  components: 'UI components',
  pages: 'pages',
  routes: 'routes',
  middleware: 'middleware',
  services: 'services',
  utils: 'utilities',
  helpers: 'helpers',
  core: 'core logic',
  types: 'type definitions',
  models: 'data models',
  views: 'views',
  controllers: 'controllers',
  migrations: 'database migrations',
  seeds: 'database seeds',
}

const CONVENTIONAL_DIRS = new Set(Object.keys(PURPOSE_MAP))

/**
 * Infer the purpose of a directory from its name.
 *
 * @example
 * inferDirectoryPurpose('src') // 'source'
 */
export function inferDirectoryPurpose(dirName: string): string {
  return PURPOSE_MAP[dirName.toLowerCase()] ?? 'unknown'
}

/**
 * Analyze directory structure from file paths.
 *
 * @example
 * analyzeDirectoryStructure(['src/a.ts', 'src/core/b.ts', 'test/c.test.ts']) // [{ path: 'src', ... }]
 */
export function analyzeDirectoryStructure(filePaths: string[]): DirectoryStructure[] {
  const dirMap = new Map<string, { files: number; subdirs: Set<string> }>()

  for (const fp of filePaths) {
    const parts = fp.split('/')
    if (parts.length < 2) continue

    for (let i = 0; i < parts.length - 1; i++) {
      const dirPath = parts.slice(0, i + 1)!.join('/')
      const entry = dirMap.get(dirPath)
      if (!entry) {
        const subdirs = new Set<string>()
        if (i + 1 < parts.length - 1) subdirs.add(parts.slice(0, i + 2)!.join('/'))
        dirMap.set(dirPath, { files: i === parts.length - 2 ? 1 : 0, subdirs })
      } else {
        if (i === parts.length - 2) entry.files++
        if (i + 1 < parts.length - 1) entry.subdirs.add(parts.slice(0, i + 2)!.join('/'))
      }
    }
  }

  const structure: DirectoryStructure[] = []
  for (const [path, data] of dirMap) {
    const depth = path.split('/').length - 1
    const dirName = path.split('/').at(-1) ?? ''
    structure.push({
      path,
      files: data.files,
      subdirs: [...data.subdirs],
      depth,
      purpose: inferDirectoryPurpose(dirName),
      isConventional: CONVENTIONAL_DIRS.has(dirName.toLowerCase()),
    })
  }

  return structure.sort((a, b) => a.path.localeCompare(b.path))
}

// ─── Depth Checks ─────────────────────────────────────────────────────────────

/**
 * Check for overly deep directory nesting (>5 levels).
 *
 * @example
 * checkDirectoryDepth([{ path: 'a/b/c/d/e/f/g.ts' }]) // [{ name: 'deep nesting', status: 'warning', ... }]
 */
export function checkDirectoryDepth(filePaths: string[]): StructureCheck[] {
  const MAX_DEPTH = 5
  const deep = filePaths.filter((p) => p.split('/').length - 1 > MAX_DEPTH)

  if (deep.length > 0) {
    return [{
      name: 'Directory depth',
      status: 'warning',
      message: `${deep.length} file(s) exceed ${MAX_DEPTH} levels of nesting`,
      category: 'directory-structure',
      details: deep.slice(0, 5).join(', '),
    }]
  }

  return [{
    name: 'Directory depth',
    status: 'pass',
    message: `All files within ${MAX_DEPTH} levels`,
    category: 'directory-structure',
    details: '',
  }]
}

// ─── Empty Directories ────────────────────────────────────────────────────────

/**
 * Find directories with no files.
 *
 * @example
 * findEmptyDirectories(structure) // ['empty-dir']
 */
export function findEmptyDirectories(structure: DirectoryStructure[]): string[] {
  return structure.filter((d) => d.files === 0 && d.subdirs.length === 0).map((d) => d.path)
}

// ─── Structure Checks ─────────────────────────────────────────────────────────

/**
 * Run all structure checks.
 *
 * @example
 * runStructureChecks(filePaths, files) // [{ name: 'src/ exists', ... }]
 */
export function runStructureChecks(filePaths: string[], projectFiles: ProjectFile[]): StructureCheck[] {
  const checks: StructureCheck[] = []
  const rootDirs = new Set(
    filePaths
      .filter((p) => p.includes('/'))
      .map((p) => p.split('/')[0]!),
  )

  // Essential files checks
  for (const pf of projectFiles) {
    if (pf.required) {
      checks.push({
        name: `${pf.path} exists`,
        status: pf.exists ? 'pass' : 'fail',
        message: pf.exists ? `${pf.path} found` : `${pf.path} is missing`,
        category: 'essential-files',
        details: pf.description,
      })
    }
  }

  // Directory structure checks
  const hasSrc = rootDirs.has('src') || rootDirs.has('lib')
  checks.push({
    name: 'Source directory',
    status: hasSrc ? 'pass' : 'warning',
    message: hasSrc ? 'src/ or lib/ directory found' : 'No src/ or lib/ directory',
    category: 'directory-structure',
    details: hasSrc ? 'Source code is properly organized' : 'Consider organizing code in src/ or lib/',
  })

  const hasTests = rootDirs.has('test') || rootDirs.has('tests') || rootDirs.has('__tests__') || rootDirs.has('spec')
  checks.push({
    name: 'Test directory',
    status: hasTests ? 'pass' : 'warning',
    message: hasTests ? 'Test directory found' : 'No test directory',
    category: 'testing',
    details: hasTests ? 'Tests are present' : 'Consider adding a test/ directory',
  })

  // CI/CD check
  const hasCI = filePaths.some((p) =>
    p.startsWith('.github/workflows/') || p.startsWith('.gitlab-ci') || p.startsWith('Jenkinsfile') || p.startsWith('.circleci/'),
  )
  checks.push({
    name: 'CI/CD configuration',
    status: hasCI ? 'pass' : 'warning',
    message: hasCI ? 'CI/CD configuration found' : 'No CI/CD configuration',
    category: 'ci-cd',
    details: hasCI ? 'Continuous integration is set up' : 'Consider adding CI/CD (e.g., GitHub Actions)',
  })

  // Configuration check
  const hasConfig = projectFiles.some((f) => f.path.includes('eslint') && f.exists) || filePaths.some((p) => p.includes('.prettierrc') || p.includes('prettier.config'))
  checks.push({
    name: 'Linter/formatter config',
    status: hasConfig ? 'pass' : 'warning',
    message: hasConfig ? 'Linter/formatter configuration found' : 'No linter/formatter config',
    category: 'configuration',
    details: hasConfig ? 'Code quality tools configured' : 'Consider adding ESLint or Prettier',
  })

  // Documentation check
  const hasDocs = rootDirs.has('docs')
  checks.push({
    name: 'Documentation directory',
    status: hasDocs ? 'pass' : 'warning',
    message: hasDocs ? 'docs/ directory found' : 'No docs/ directory',
    category: 'documentation',
    details: hasDocs ? 'Documentation is organized' : 'Consider adding a docs/ directory',
  })

  // Depth checks
  const depthChecks = checkDirectoryDepth(filePaths)
  checks.push(...depthChecks)

  return checks
}

// ─── Health Score ─────────────────────────────────────────────────────────────

const CATEGORY_WEIGHT: Record<string, number> = {
  'essential-files': 3,
  'directory-structure': 2,
  'configuration': 1,
  'testing': 2,
  'documentation': 1,
  'ci-cd': 1,
}

/**
 * Compute health score from checks (0-100).
 *
 * @example
 * computeHealthScore(checks) // 80
 */
export function computeHealthScore(checks: StructureCheck[]): number {
  if (checks.length === 0) return 100

  let totalWeight = 0
  let earnedWeight = 0

  for (const check of checks) {
    const weight = CATEGORY_WEIGHT[check.category] ?? 1
    totalWeight += weight
    if (check.status === 'pass') earnedWeight += weight
    else if (check.status === 'warning') earnedWeight += weight * 0.5
  }

  return Math.round((earnedWeight / totalWeight) * 100)
}

/**
 * Compute grade from score.
 *
 * @example
 * computeGrade(95) // 'A'
 */
export function computeGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Compute aggregate scaffold statistics.
 *
 * @example
 * computeStructureStats(structure, checks, filePaths) // { directories: 5, ... }
 */
export function computeStructureStats(
  structure: DirectoryStructure[],
  checks: StructureCheck[],
  filePaths: string[],
): ScaffoldStats {
  const directories = structure.length
  const files = filePaths.length
  const maxDepth = structure.length > 0 ? Math.max(...structure.map((d) => d.depth)) : 0
  const averageDepth = structure.length > 0
    ? Math.round((structure.reduce((s, d) => s + d.depth, 0) / structure.length) * 10) / 10
    : 0
  const checksPassed = checks.filter((c) => c.status === 'pass').length
  const checksFailed = checks.filter((c) => c.status === 'fail').length
  const healthScore = computeHealthScore(checks)
  const grade = computeGrade(healthScore)

  return { directories, files, maxDepth, averageDepth, checksPassed, checksFailed, healthScore, grade }
}

// ─── Recommendations ──────────────────────────────────────────────────────────

/**
 * Generate scaffold improvement recommendations.
 *
 * @example
 * generateRecommendations(checks, missing) // ['Add README.md for project documentation']
 */
export function generateRecommendations(checks: StructureCheck[], missing: ProjectFile[]): string[] {
  const recs: string[] = []

  for (const m of missing) {
    recs.push(`Add ${m.path} — ${m.description}.`)
  }

  const failedChecks = checks.filter((c) => c.status === 'fail' || c.status === 'warning')
  for (const c of failedChecks) {
    if (c.status === 'fail') {
      recs.push(`[FAIL] ${c.name}: ${c.message}. ${c.details}`)
    } else if (!missing.some((m) => c.name.includes(m.path))) {
      recs.push(`[WARN] ${c.name}: ${c.message}. ${c.details}`)
    }
  }

  if (recs.length === 0) {
    recs.push('Project structure looks healthy. No issues found.')
  }

  return recs
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Build complete scaffold analysis result.
 *
 * @example
 * const result = buildScaffoldResult('my-app', filePaths, {})
 */
export function buildScaffoldResult(
  projectName: string,
  filePaths: string[],
  _options: ScaffoldOptions = {},
): ScaffoldResult {
  const projectType = detectProjectType(filePaths)
  const files = checkEssentialFiles(filePaths)
  const structure = analyzeDirectoryStructure(filePaths)
  const checks = runStructureChecks(filePaths, files)
  const stats = computeStructureStats(structure, checks, filePaths)
  const missing = files.filter((f) => !f.exists && f.required)
  const recommendations = generateRecommendations(checks, missing)

  return {
    projectName,
    projectType,
    structure,
    checks,
    files,
    stats,
    missing,
    recommendations,
  }
}
