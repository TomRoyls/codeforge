import { basename, extname } from 'node:path'

// ─── Types ──────────────────────────────────────────────

export type FileCategory = 'source' | 'test' | 'config' | 'documentation' | 'build' | 'asset' | 'generated' | 'vendor' | 'script' | 'ci' | 'style' | 'data' | 'unknown'

export interface FileClassification {
  filePath: string
  fileName: string
  extension: string
  category: FileCategory
  subcategory: string
  language: string
  size: number
  lines: number
  role: string
  isEssential: boolean
}

export interface ClassCategory {
  name: FileCategory
  files: FileClassification[]
  count: number
  totalSize: number
  totalLines: number
  percentage: number
  description: string
  icon: string
}

export interface ClassificationResult {
  files: FileClassification[]
  categories: ClassCategory[]
  stats: ClassificationStats
  recommendations: string[]
}

export interface ClassificationStats {
  totalFiles: number
  totalSize: number
  totalLines: number
  essentialFiles: number
  categoryCounts: Record<string, number>
  largestCategory: string
  smallestCategory: string
}

export interface ClassifyOptions {
  verbose: boolean
}

// ─── CATEGORY_META ──────────────────────────────────────

const CATEGORY_META: Record<FileCategory, { description: string; icon: string }> = {
  asset: { description: 'Static assets (images, fonts)', icon: '🖼' },
  build: { description: 'Build and container configs', icon: '🔨' },
  ci: { description: 'CI/CD pipeline definitions', icon: '🔄' },
  config: { description: 'Project configuration files', icon: '⚙' },
  data: { description: 'Data files', icon: '📊' },
  documentation: { description: 'Documentation and licenses', icon: '📄' },
  generated: { description: 'Auto-generated or build output', icon: '🤖' },
  script: { description: 'Shell scripts', icon: '📜' },
  source: { description: 'Source code files', icon: '💻' },
  style: { description: 'Stylesheet files', icon: '🎨' },
  test: { description: 'Test files', icon: '🧪' },
  unknown: { description: 'Unclassified files', icon: '❓' },
  vendor: { description: 'Third-party dependencies', icon: '📦' },
}

// ─── detectLanguage ─────────────────────────────────────

/**
 * @example
 * const lang = detectLanguage('src/main.ts')
 * console.log(lang)
 */
export function detectLanguage(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.css': 'CSS',
    '.go': 'Go',
    '.html': 'HTML',
    '.java': 'Java',
    '.js': 'JavaScript',
    '.jsx': 'JSX',
    '.json': 'JSON',
    '.less': 'Less',
    '.md': 'Markdown',
    '.py': 'Python',
    '.rb': 'Ruby',
    '.rs': 'Rust',
    '.sass': 'Sass',
    '.scss': 'SCSS',
    '.sh': 'Shell',
    '.svg': 'SVG',
    '.ts': 'TypeScript',
    '.tsx': 'TSX',
    '.xml': 'XML',
    '.yaml': 'YAML',
    '.yml': 'YAML',
  }
  return map[ext] ?? 'Unknown'
}

// ─── isEssentialFile ────────────────────────────────────

/**
 * @example
 * const e = isEssentialFile('package.json')
 * console.log(e)
 */
export function isEssentialFile(filePath: string): boolean {
  const name = basename(filePath)
  const essential = [
    'package.json',
    'tsconfig.json',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'Makefile',
    'Dockerfile',
    'README.md',
    'LICENSE',
    '.gitignore',
  ]
  return essential.includes(name) || filePath.includes('.github/workflows/')
}

// ─── classifyFile ───────────────────────────────────────

/**
 * @example
 * const cls = classifyFile('src/main.ts', 'const x = 1')
 * console.log(cls.category)
 */
export function classifyFile(filePath: string, content: string): FileClassification {
  const fileName = basename(filePath)
  const ext = extname(filePath).toLowerCase()
  const lower = filePath.toLowerCase()
  const size = Buffer.byteLength(content, 'utf8')
  const lines = content ? content.split('\n').length : 0

  const { category, subcategory, role } = resolveCategory(filePath, fileName, ext, lower)

  return {
    category,
    extension: ext,
    fileName,
    filePath,
    isEssential: isEssentialFile(filePath),
    language: detectLanguage(filePath),
    lines,
    role,
    size,
    subcategory,
  }
}

function resolveCategory(
  filePath: string,
  fileName: string,
  ext: string,
  lower: string,
): { category: FileCategory; subcategory: string; role: string } {
  if (fileName.endsWith('.d.ts')) {
    return { category: 'generated', subcategory: 'type-declaration', role: 'Type Declaration' }
  }

  if (lower.includes('node_modules/') || lower.startsWith('dist/') || lower.includes('/dist/') || lower.startsWith('coverage/') || lower.includes('/coverage/')) {
    return { category: 'generated', subcategory: 'build-output', role: 'Generated Output' }
  }

  if (ext === '.min.js' || ext === '.min.css' || lower.endsWith('.min.js') || lower.endsWith('.min.css')) {
    return { category: 'generated', subcategory: 'minified', role: 'Minified Output' }
  }

  if (isTestFile(lower, fileName)) {
    if (lower.includes('integration') || lower.includes('e2e')) {
      return { category: 'test', subcategory: 'integration-test', role: 'Integration Test' }
    }
    return { category: 'test', subcategory: 'unit-test', role: 'Unit Test' }
  }

  if (isConfigFile(fileName, ext, lower)) {
    if (fileName.startsWith('.eslint') || lower.includes('eslint')) {
      return { category: 'config', subcategory: 'eslint-config', role: 'ESLint Configuration' }
    }
    if (fileName.includes('tsconfig')) {
      return { category: 'config', subcategory: 'typescript-config', role: 'TypeScript Configuration' }
    }
    if (fileName === 'package.json') {
      return { category: 'config', subcategory: 'package-config', role: 'Package Configuration' }
    }
    if (fileName.startsWith('.env')) {
      return { category: 'config', subcategory: 'environment', role: 'Environment Variables' }
    }
    if (lower.includes('vitest') || lower.includes('jest')) {
      return { category: 'config', subcategory: 'test-config', role: 'Test Configuration' }
    }
    return { category: 'config', subcategory: 'project-config', role: 'Project Configuration' }
  }

  if (isBuildFile(fileName, lower)) {
    if (lower.includes('docker') || lower.includes('container')) {
      return { category: 'build', subcategory: 'container', role: 'Container Configuration' }
    }
    if (lower.includes('.github/workflows')) {
      return { category: 'ci', subcategory: 'github-actions', role: 'GitHub Actions Workflow' }
    }
    return { category: 'build', subcategory: 'build-config', role: 'Build Configuration' }
  }

  if (isCiFile(fileName, lower)) {
    return { category: 'ci', subcategory: 'ci-pipeline', role: 'CI Pipeline' }
  }

  if (isAssetFile(ext)) {
    if (ext === '.svg') {
      return { category: 'asset', subcategory: 'vector-image', role: 'SVG Image' }
    }
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) {
      return { category: 'asset', subcategory: 'font', role: 'Font File' }
    }
    return { category: 'asset', subcategory: 'image', role: 'Image Asset' }
  }

  if (isStyleFile(ext)) {
    return { category: 'style', subcategory: ext.slice(1), role: `Stylesheet (${ext.slice(1).toUpperCase()})` }
  }

  if (isDocFile(fileName, ext)) {
    if (fileName === 'LICENSE' || fileName.startsWith('LICENSE')) {
      return { category: 'documentation', subcategory: 'license', role: 'License File' }
    }
    if (fileName.startsWith('CHANGELOG') || fileName.startsWith('HISTORY')) {
      return { category: 'documentation', subcategory: 'changelog', role: 'Changelog' }
    }
    return { category: 'documentation', subcategory: 'documentation', role: 'Documentation' }
  }

  if (ext === '.sh' || ext === '.bash') {
    return { category: 'script', subcategory: 'shell-script', role: 'Shell Script' }
  }

  if (isDataFile(fileName, ext, lower)) {
    if (ext === '.csv') {
      return { category: 'data', subcategory: 'csv-data', role: 'CSV Data' }
    }
    if (ext === '.xml') {
      return { category: 'data', subcategory: 'xml-data', role: 'XML Data' }
    }
    return { category: 'data', subcategory: 'data-file', role: 'Data File' }
  }

  if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
    return { category: 'source', subcategory: 'source-code', role: 'Source Code' }
  }

  if (['.py', '.rs', '.go', '.java', '.rb'].includes(ext)) {
    return { category: 'source', subcategory: 'source-code', role: 'Source Code' }
  }

  return { category: 'unknown', subcategory: 'unclassified', role: 'Unclassified File' }
}

function isTestFile(lower: string, fileName: string): boolean {
  return /\.(?:test|spec)\.[jt]sx?$/.test(lower) ||
    lower.includes('/test/') ||
    lower.includes('/tests/') ||
    lower.includes('/__tests__/') ||
    lower.includes('/spec/')
}

function isConfigFile(fileName: string, ext: string, lower: string): boolean {
  if (fileName.startsWith('.env')) return true
  if (fileName.startsWith('.') && fileName.includes('rc')) return true
  if (fileName === '.prettierrc' || fileName === '.babelrc' || fileName === '.npmrc') return true
  if (['.json', '.yaml', '.yml', '.js', '.ts', '.cjs', '.mjs'].includes(ext)) {
    if (fileName.startsWith('.') && fileName.includes('rc')) return true
    if (fileName.includes('.config.')) return true
    if (fileName === 'package.json') return true
    if (fileName.includes('tsconfig')) return true
    if (lower.includes('.prettierrc') || lower.includes('.babelrc') || lower.includes('.npmrc')) return true
  }
  return false
}

function isBuildFile(fileName: string, lower: string): boolean {
  return fileName === 'Makefile' ||
    fileName === 'Dockerfile' ||
    lower.includes('docker-compose') ||
    lower.includes('.github/workflows')
}

function isCiFile(fileName: string, lower: string): boolean {
  return fileName === 'Jenkinsfile' ||
    fileName === '.travis.yml' ||
    lower.includes('azure-pipelines') ||
    lower.includes('gitlab-ci')
}

function isAssetFile(ext: string): boolean {
  return ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)
}

function isStyleFile(ext: string): boolean {
  return ['.css', '.scss', '.less', '.sass'].includes(ext)
}

function isDocFile(fileName: string, ext: string): boolean {
  return ['.md', '.txt', '.rst', '.adoc'].includes(ext) ||
    fileName === 'LICENSE' ||
    fileName.startsWith('CHANGELOG') ||
    fileName.startsWith('HISTORY')
}

function isDataFile(fileName: string, ext: string, lower: string): boolean {
  if (fileName === 'package.json') return false
  if (lower.includes('.config.') || lower.includes('tsconfig')) return false
  return ['.json', '.csv', '.xml'].includes(ext) ||
    (['.yaml', '.yml'].includes(ext) && !lower.includes('docker') && !lower.includes('.github'))
}

// ─── buildCategories ────────────────────────────────────

/**
 * @example
 * const cats = buildCategories(files)
 * console.log(cats[0].name)
 */
export function buildCategories(files: FileClassification[]): ClassCategory[] {
  const groupMap = new Map<FileCategory, FileClassification[]>()

  for (const f of files) {
    const existing = groupMap.get(f.category) ?? []
    existing.push(f)
    groupMap.set(f.category, existing)
  }

  const totalCount = files.length
  const categories: ClassCategory[] = []

  const order: FileCategory[] = ['source', 'test', 'config', 'documentation', 'build', 'ci', 'style', 'asset', 'script', 'data', 'vendor', 'generated', 'unknown']

  for (const name of order) {
    const group = groupMap.get(name)
    if (!group || group.length === 0) continue

    const totalSize = group.reduce((s, f) => s + f.size, 0)
    const totalLines = group.reduce((s, f) => s + f.lines, 0)
    const meta = CATEGORY_META[name]

    categories.push({
      count: group.length,
      description: meta.description,
      files: group,
      icon: meta.icon,
      name,
      percentage: totalCount > 0 ? Math.round((group.length / totalCount) * 10000) / 100 : 0,
      totalLines,
      totalSize,
    })
  }

  return categories
}

// ─── computeClassificationStats ─────────────────────────

/**
 * @example
 * const stats = computeClassificationStats(categories)
 * console.log(stats.totalFiles)
 */
export function computeClassificationStats(categories: ClassCategory[]): ClassificationStats {
  const totalFiles = categories.reduce((s, c) => s + c.count, 0)
  const totalSize = categories.reduce((s, c) => s + c.totalSize, 0)
  const totalLines = categories.reduce((s, c) => s + c.totalLines, 0)
  const essentialFiles = categories.reduce((s, c) => s + c.files.filter((f) => f.isEssential).length, 0)

  const categoryCounts: Record<string, number> = {}
  for (const c of categories) {
    categoryCounts[c.name] = c.count
  }

  const sorted = [...categories].sort((a, b) => b.count - a.count)
  const largestCategory = sorted[0]?.name ?? ''
  const smallestCategory = sorted.length > 0 ? sorted[sorted.length - 1].name : ''

  return {
    categoryCounts,
    essentialFiles,
    largestCategory,
    smallestCategory,
    totalFiles,
    totalLines,
    totalSize,
  }
}

// ─── generateRecommendations ────────────────────────────

/**
 * @example
 * const recs = generateRecommendations(categories)
 * console.log(recs[0])
 */
export function generateRecommendations(categories: ClassCategory[]): string[] {
  const recs: string[] = []

  const generated = categories.find((c) => c.name === 'generated')
  if (generated && generated.count > 0) {
    recs.push(`${generated.count} generated file(s) found — consider adding to .gitignore`)
  }

  const test = categories.find((c) => c.name === 'test')
  const source = categories.find((c) => c.name === 'source')
  if (source && source.count > 0 && (!test || test.count === 0)) {
    recs.push('No test files found — consider adding tests')
  }

  const docs = categories.find((c) => c.name === 'documentation')
  if (!docs || docs.count === 0) {
    recs.push('No documentation files found — consider adding a README')
  }

  const vendor = categories.find((c) => c.name === 'vendor')
  if (vendor && vendor.count > 0) {
    recs.push(`${vendor.count} vendor file(s) detected — use a package manager instead`)
  }

  const unknown = categories.find((c) => c.name === 'unknown')
  if (unknown && unknown.count > 5) {
    recs.push(`${unknown.count} unclassified file(s) — review and categorize`)
  }

  if (recs.length === 0) {
    recs.push('Project structure looks well-organized')
  }

  return recs
}

// ─── buildClassificationResult ──────────────────────────

/**
 * @example
 * const result = buildClassificationResult(['src/a.ts'], contents, { verbose: false })
 * console.log(result.stats.totalFiles)
 */
export function buildClassificationResult(
  files: string[],
  contents: Map<string, string>,
  _options: ClassifyOptions,
): ClassificationResult {
  const classified: FileClassification[] = files.map((f) => {
    const content = contents.get(f) ?? ''
    return classifyFile(f, content)
  })

  const categories = buildCategories(classified)
  const stats = computeClassificationStats(categories)
  const recommendations = generateRecommendations(categories)

  return { categories, files: classified, recommendations, stats }
}

// ─── formatBytes ────────────────────────────────────────

/**
 * @example
 * const text = formatBytes(1024)
 * console.log(text)
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ─── sourceBaseName ─────────────────────────────────────

/**
 * @example
 * const base = sourceBaseName('src/classify-helpers.ts')
 * console.log(base)
 */
export function sourceBaseName(filePath: string): string {
  return basename(filePath).replace(/\.ts$/, '')
}
