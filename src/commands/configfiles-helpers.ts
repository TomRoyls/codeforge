// ─── Interfaces ──────────────────────────────────────────

export interface ConfigIssue {
  severity: 'error' | 'info' | 'warning'
  message: string
}

export interface ConfigFile {
  path: string
  relativePath: string
  name: string
  type: string
  format: string
  size: number
  lastModified: string
  isValid: boolean | null
  issues: ConfigIssue[]
  description: string
}

export interface ConfigCategory {
  type: string
  label: string
  files: ConfigFile[]
  description: string
}

export interface ConfigFilesResult {
  files: ConfigFile[]
  categories: ConfigCategory[]
  totalFiles: number
  totalSize: number
  issues: ConfigIssue[]
  coverage: number
  missingConfigs: string[]
}

export interface FileReaderResult {
  content: string
  size: number
  lastModified: string
}

export type FileReader = (filePath: string) => Promise<FileReaderResult | null>

export interface BuildOptions {
  validate?: boolean
}

// ─── Known config file patterns ─────────────────────────

interface PatternEntry {
  description: string
  type: string
}

const CATEGORY_LABELS: Record<string, string> = {
  babel: 'Babel',
  ci: 'CI/CD',
  docker: 'Docker',
  editor: 'Editor',
  env: 'Environment',
  eslint: 'ESLint',
  git: 'Git',
  jest: 'Jest',
  npm: 'NPM',
  other: 'Other',
  prettier: 'Prettier',
  typescript: 'TypeScript',
  vitest: 'Vitest',
  webpack: 'Webpack',
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  babel: 'Babel transpilation configuration',
  ci: 'Continuous integration and deployment',
  docker: 'Docker containerization',
  editor: 'Editor and IDE configuration',
  env: 'Environment variable files',
  eslint: 'ESLint code linting',
  git: 'Git version control',
  jest: 'Jest testing framework',
  npm: 'NPM package management',
  other: 'Other configuration files',
  prettier: 'Prettier code formatting',
  typescript: 'TypeScript compiler configuration',
  vitest: 'Vitest testing framework',
  webpack: 'Webpack module bundler',
}

/**
 * Returns a map of known config filenames to their type and description.
 *
 * @example
 * ```ts
 * const patterns = getKnownConfigPatterns()
 * patterns.get('tsconfig.json') // { type: 'typescript', description: 'TypeScript compiler configuration' }
 * ```
 */
export function getKnownConfigPatterns(): Map<string, PatternEntry> {
  const patterns = new Map<string, PatternEntry>()

  // TypeScript
  const typescriptFiles = ['tsconfig.json']
  for (const f of typescriptFiles) {
    patterns.set(f, { description: 'TypeScript compiler configuration', type: 'typescript' })
  }

  // ESLint
  const eslintFiles = [
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.ts',
  ]
  for (const f of eslintFiles) {
    patterns.set(f, { description: 'ESLint code linting configuration', type: 'eslint' })
  }

  // Prettier
  const prettierFiles = [
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    '.prettierrc.yml',
    'prettier.config.js',
    'prettier.config.ts',
  ]
  for (const f of prettierFiles) {
    patterns.set(f, { description: 'Prettier code formatting configuration', type: 'prettier' })
  }

  // Jest
  const jestFiles = ['jest.config.js', 'jest.config.ts', 'jest.config.json', 'jest.config.mjs']
  for (const f of jestFiles) {
    patterns.set(f, { description: 'Jest testing framework configuration', type: 'jest' })
  }

  // Vitest
  const vitestFiles = ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mjs']
  for (const f of vitestFiles) {
    patterns.set(f, { description: 'Vitest testing framework configuration', type: 'vitest' })
  }

  // Babel
  const babelFiles = ['babel.config.js', 'babel.config.json', 'babel.config.ts', '.babelrc', '.babelrc.js', '.babelrc.json']
  for (const f of babelFiles) {
    patterns.set(f, { description: 'Babel transpilation configuration', type: 'babel' })
  }

  // Webpack
  const webpackFiles = ['webpack.config.js', 'webpack.config.ts', 'webpack.config.mjs']
  for (const f of webpackFiles) {
    patterns.set(f, { description: 'Webpack module bundler configuration', type: 'webpack' })
  }

  // NPM
  const npmFiles = ['package.json', 'package-lock.json', '.npmrc', '.nvmrc', '.node-version']
  for (const f of npmFiles) {
    patterns.set(f, { description: 'NPM package management configuration', type: 'npm' })
  }

  // Git
  const gitFiles = ['.gitignore', '.gitattributes', '.gitmodules']
  for (const f of gitFiles) {
    patterns.set(f, { description: 'Git version control configuration', type: 'git' })
  }

  // CI
  const ciFiles = ['.gitlab-ci.yml', '.travis.yml', 'Jenkinsfile', 'azure-pipelines.yml']
  for (const f of ciFiles) {
    patterns.set(f, { description: 'CI/CD pipeline configuration', type: 'ci' })
  }

  // Editor
  const editorFiles = ['.editorconfig']
  for (const f of editorFiles) {
    patterns.set(f, { description: 'Editor configuration', type: 'editor' })
  }

  // Env
  const envFiles = ['.env', '.env.local', '.env.production', '.env.development', '.env.test']
  for (const f of envFiles) {
    patterns.set(f, { description: 'Environment variables', type: 'env' })
  }

  // Docker
  const dockerFiles = ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore']
  for (const f of dockerFiles) {
    patterns.set(f, { description: 'Docker containerization configuration', type: 'docker' })
  }

  return patterns
}

// ─── Glob patterns for scanning ─────────────────────────

/**
 * Returns glob patterns for discovering all known config files.
 *
 * @example
 * ```ts
 * const patterns = getConfigGlobPatterns()
 * // ['tsconfig.json', 'tsconfig.*.json', '.eslintrc', ...]
 * ```
 */
export function getConfigGlobPatterns(): string[] {
  return [
    'tsconfig.json',
    'tsconfig.*.json',
    '.eslintrc',
    '.eslintrc.js',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.ts',
    '.prettierrc',
    '.prettierrc.js',
    '.prettierrc.json',
    '.prettierrc.yml',
    'prettier.config.js',
    'prettier.config.ts',
    'jest.config.js',
    'jest.config.ts',
    'jest.config.json',
    'jest.config.mjs',
    'vitest.config.ts',
    'vitest.config.js',
    'vitest.config.mjs',
    'babel.config.js',
    'babel.config.json',
    'babel.config.ts',
    '.babelrc',
    '.babelrc.js',
    '.babelrc.json',
    'webpack.config.js',
    'webpack.config.ts',
    'webpack.config.mjs',
    'package.json',
    'package-lock.json',
    '.npmrc',
    '.nvmrc',
    '.node-version',
    '.gitignore',
    '.gitattributes',
    '.gitmodules',
    '.gitlab-ci.yml',
    '.travis.yml',
    'Jenkinsfile',
    'azure-pipelines.yml',
    '.editorconfig',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    '.env.test',
    'Dockerfile',
    'docker-compose.yml',
    'docker-compose.yaml',
    '.dockerignore',
    '.vscode/settings.json',
    '.vscode/extensions.json',
    '.github/workflows/*.yml',
  ]
}

// ─── Format detection ───────────────────────────────────

/**
 * Detects the format of a config file based on its extension and content.
 *
 * @example
 * ```ts
 * detectFormat('tsconfig.json', '{}') // 'json'
 * detectFormat('.env', 'KEY=VAL')     // 'env'
 * detectFormat('config.yaml', 'a: b') // 'yaml'
 * ```
 */
export function detectFormat(filePath: string, content: string): string {
  const fileName = filePath.split('/').pop() ?? filePath
  const dotIndex = fileName.lastIndexOf('.')
  const ext = dotIndex !== -1 ? fileName.slice(dotIndex).toLowerCase() : ''

  // Extension-based detection
  if (ext === '.json') return 'json'
  if (ext === '.yml' || ext === '.yaml') return 'yaml'
  if (ext === '.toml') return 'toml'
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'javascript'
  if (ext === '.ts') return 'typescript'
  if (ext === '.ini') return 'ini'

  // Filename-based detection
  if (fileName === 'Dockerfile' || fileName === 'Jenkinsfile') return 'text'
  if (fileName.startsWith('.env')) return 'env'
  if (fileName.startsWith('.git')) return 'text'
  if (fileName.startsWith('.docker')) return 'text'
  if (fileName.startsWith('.editorconfig')) return 'ini'
  if (fileName.startsWith('.npmrc') || fileName.startsWith('.nvmrc') || fileName.startsWith('.node-version'))
    return 'text'
  if (fileName === '.prettierrc' || fileName === '.eslintrc' || fileName === '.babelrc') return 'json'

  // Content-based heuristics
  const trimmed = content.trim()
  if (trimmed.length === 0) return 'unknown'
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  if (trimmed.startsWith('#!')) return 'text'
  if (trimmed.startsWith('---') || trimmed.startsWith('- ') || trimmed.includes(': ')) return 'yaml'

  return 'unknown'
}

// ─── Config classification ──────────────────────────────

/**
 * Classifies a config file by its filename to determine type and description.
 *
 * @example
 * ```ts
 * classifyConfig('tsconfig.json')  // { type: 'typescript', description: '...' }
 * classifyConfig('.eslintrc')      // { type: 'eslint', description: '...' }
 * classifyConfig('custom.config.js') // { type: 'other', description: '...' }
 * ```
 */
export function classifyConfig(filename: string): { description: string; type: string } {
  const patterns = getKnownConfigPatterns()
  const baseName = filename.split('/').pop() ?? filename

  // Direct lookup
  const entry = patterns.get(baseName)
  if (entry) return entry

  // tsconfig.*.json pattern
  if (baseName.startsWith('tsconfig.') && baseName.endsWith('.json')) {
    return { description: 'TypeScript compiler configuration', type: 'typescript' }
  }

  // .vscode files
  if (filename.includes('.vscode/')) {
    return { description: 'VS Code editor configuration', type: 'editor' }
  }

  // .github/workflows
  if (filename.includes('.github/workflows/')) {
    return { description: 'GitHub Actions CI/CD workflow', type: 'ci' }
  }

  // .idea files
  if (filename.includes('.idea/')) {
    return { description: 'IntelliJ IDEA configuration', type: 'editor' }
  }

  // *.config.* pattern
  if (baseName.includes('.config.')) {
    return { description: 'Configuration file', type: 'other' }
  }

  return { description: 'Configuration file', type: 'other' }
}

// ─── JSON validation ────────────────────────────────────

/**
 * Validates JSON content.
 *
 * @example
 * ```ts
 * validateJson('{"key": "value"}') // { valid: true, error: null }
 * validateJson('{invalid')         // { valid: false, error: '...' }
 * ```
 */
export function validateJson(content: string): { error: string | null; valid: boolean } {
  if (content.trim().length === 0) {
    return { error: 'Empty file', valid: false }
  }
  try {
    JSON.parse(content)
    return { error: null, valid: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: message, valid: false }
  }
}

// ─── ENV validation ─────────────────────────────────────

/**
 * Validates .env file content.
 *
 * @example
 * ```ts
 * validateEnv('KEY=VALUE\n# comment')
 * // { valid: true, issues: [] }
 *
 * validateEnv('KEY=VALUE\nKEY=OTHER')
 * // { valid: true, issues: [{ severity: 'warning', message: 'Duplicate key: KEY' }] }
 * ```
 */
export function validateEnv(content: string): { issues: ConfigIssue[]; valid: boolean } {
  const issues: ConfigIssue[] = []
  const lines = content.split('\n')
  const seenKeys = new Map<string, number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const trimmed = line.trim()

    // Empty line
    if (trimmed.length === 0) continue

    // Comment
    if (trimmed.startsWith('#')) continue

    // KEY=VALUE check
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) {
      issues.push({
        message: `Line ${i + 1}: Missing '=' separator`,
        severity: 'error',
      })
      continue
    }

    const key = trimmed.slice(0, eqIndex).trim()

    if (key.length === 0) {
      issues.push({
        message: `Line ${i + 1}: Empty key before '='`,
        severity: 'error',
      })
      continue
    }

    // Track duplicate keys
    const count = seenKeys.get(key) ?? 0
    if (count > 0) {
      issues.push({
        message: `Line ${i + 1}: Duplicate key "${key}"`,
        severity: 'warning',
      })
    }
    seenKeys.set(key, count + 1)

    // Check for unquoted values with spaces
    const value = trimmed.slice(eqIndex + 1)
    if (value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) {
      issues.push({
        message: `Line ${i + 1}: Unquoted value with spaces for key "${key}"`,
        severity: 'info',
      })
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error')
  return { issues, valid: !hasErrors }
}

// ─── Single file analysis ───────────────────────────────

/**
 * Analyzes a single config file.
 *
 * @example
 * ```ts
 * const result = analyzeConfigFile('/path/to/tsconfig.json', '{}', true)
 * // { path: '...', type: 'typescript', format: 'json', isValid: true, ... }
 * ```
 */
export function analyzeConfigFile(
  filePath: string,
  content: string,
  shouldValidate: boolean,
  size: number = content.length,
  lastModified: string = new Date().toISOString(),
): ConfigFile {
  const parts = filePath.split('/')
  const relativePath = filePath
  const name = parts[parts.length - 1] ?? filePath

  const classification = classifyConfig(name)
  const format = detectFormat(filePath, content)

  const issues: ConfigIssue[] = []
  let isValid: boolean | null = null

  if (shouldValidate) {
    switch (format) {
      case 'json': {
        const result = validateJson(content)
        isValid = result.valid
        if (!result.valid && result.error) {
          issues.push({ message: result.error, severity: 'error' })
        }
        break
      }
      case 'env': {
        const result = validateEnv(content)
        isValid = result.valid
        issues.push(...result.issues)
        break
      }
      default:
        isValid = null
        break
    }
  }

  return {
    description: classification.description,
    format,
    issues,
    isValid,
    lastModified,
    name,
    path: filePath,
    relativePath,
    size,
    type: classification.type,
  }
}

// ─── Coverage computation ───────────────────────────────

const ESSENTIAL_CONFIGS: Array<{ description: string; names: string[]; type: string }> = [
  { description: 'TypeScript configuration', names: ['tsconfig.json'], type: 'typescript' },
  { description: 'NPM package manifest', names: ['package.json'], type: 'npm' },
  { description: 'Git ignore rules', names: ['.gitignore'], type: 'git' },
  { description: 'Editor configuration', names: ['.editorconfig'], type: 'editor' },
  {
    description: 'ESLint configuration',
    names: ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml', 'eslint.config.js', 'eslint.config.mjs', 'eslint.config.ts'],
    type: 'eslint',
  },
  {
    description: 'Prettier configuration',
    names: ['.prettierrc', '.prettierrc.js', '.prettierrc.json', '.prettierrc.yml', 'prettier.config.js', 'prettier.config.ts'],
    type: 'prettier',
  },
]

/**
 * Computes config coverage as a percentage of essential configs present.
 *
 * @example
 * ```ts
 * computeCoverage(files) // 83.3
 * ```
 */
export function computeCoverage(files: ConfigFile[]): number {
  const fileNames = new Set(files.map((f) => f.name))
  let present = 0

  for (const essential of ESSENTIAL_CONFIGS) {
    if (essential.names.some((n) => fileNames.has(n))) {
      present++
    }
  }

  return Math.round((present / ESSENTIAL_CONFIGS.length) * 100)
}

/**
 * Identifies recommended configs not present in the project.
 *
 * @example
 * ```ts
 * findMissingConfigs(files) // ['Editor configuration (.editorconfig)']
 * ```
 */
export function findMissingConfigs(files: ConfigFile[]): string[] {
  const fileNames = new Set(files.map((f) => f.name))
  const missing: string[] = []

  for (const essential of ESSENTIAL_CONFIGS) {
    if (!essential.names.some((n) => fileNames.has(n))) {
      missing.push(`${essential.description} (${essential.names[0]})`)
    }
  }

  return missing
}

// ─── Category grouping ──────────────────────────────────

/**
 * Groups config files into categories by type.
 *
 * @example
 * ```ts
 * const categories = buildCategories(files)
 * // [{ type: 'typescript', label: 'TypeScript', files: [...], description: '...' }]
 * ```
 */
export function buildCategories(files: ConfigFile[]): ConfigCategory[] {
  const typeMap = new Map<string, ConfigFile[]>()

  for (const file of files) {
    const existing = typeMap.get(file.type)
    if (existing) {
      existing.push(file)
    } else {
      typeMap.set(file.type, [file])
    }
  }

  const categories: ConfigCategory[] = []
  const typeOrder = ['typescript', 'eslint', 'prettier', 'jest', 'vitest', 'babel', 'webpack', 'npm', 'git', 'ci', 'editor', 'env', 'docker', 'other']

  for (const type of typeOrder) {
    const filesForType = typeMap.get(type)
    if (filesForType) {
      categories.push({
        description: CATEGORY_DESCRIPTIONS[type] ?? 'Other configuration files',
        files: filesForType,
        label: CATEGORY_LABELS[type] ?? type,
        type,
      })
      typeMap.delete(type)
    }
  }

  // Remaining types
  for (const [type, filesForType] of typeMap) {
    categories.push({
      description: CATEGORY_DESCRIPTIONS[type] ?? 'Configuration files',
      files: filesForType,
      label: CATEGORY_LABELS[type] ?? type,
      type,
    })
  }

  return categories
}

// ─── Orchestrator ───────────────────────────────────────

/**
 * Orchestrates config file analysis for a project directory.
 *
 * @example
 * ```ts
 * const result = await buildConfigFilesResult(process.cwd(), fileReader, { validate: true })
 * // { files: [...], categories: [...], coverage: 83, missingConfigs: [...] }
 * ```
 */
export async function buildConfigFilesResult(
  cwd: string,
  fileReader: FileReader,
  options: BuildOptions = {},
): Promise<ConfigFilesResult> {
  const fg = await import('fast-glob')
  const { relative, resolve } = await import('node:path')
  const { stat } = await import('node:fs/promises')

  const resolvedCwd = resolve(cwd)
  const patterns = getConfigGlobPatterns()

  const discoveredPaths: string[] = await fg.glob(patterns, {
    absolute: true,
    cwd: resolvedCwd,
    dot: true,
    followSymbolicLinks: false,
    ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    onlyFiles: true,
    suppressErrors: true,
  })

  const files: ConfigFile[] = []
  const allIssues: ConfigIssue[] = []
  let totalSize = 0

  for (const absPath of discoveredPaths.sort()) {
    const relPath = relative(resolvedCwd, absPath)
    const fileResult = await fileReader(absPath)

    let content = ''
    let fileSize = 0
    let lastModified = new Date().toISOString()

    if (fileResult) {
      content = fileResult.content
      fileSize = fileResult.size
      lastModified = fileResult.lastModified
    } else {
      try {
        const fileContent = await import('node:fs/promises').then((fs) => fs.readFile(absPath, 'utf8'))
        const stats = await stat(absPath)
        content = fileContent
        fileSize = stats.size
        lastModified = stats.mtime.toISOString()
      } catch {
        continue
      }
    }

    const configFile = analyzeConfigFile(relPath, content, options.validate ?? false, fileSize, lastModified)
    files.push(configFile)
    allIssues.push(...configFile.issues)
    totalSize += fileSize
  }

  const categories = buildCategories(files)
  const coverage = computeCoverage(files)
  const missingConfigs = findMissingConfigs(files)

  return {
    categories,
    coverage,
    files,
    issues: allIssues,
    missingConfigs,
    totalFiles: files.length,
    totalSize,
  }
}
