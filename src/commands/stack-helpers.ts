import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

// ─── Interfaces ──────────────────────────────────────────

export interface DetectedTech {
  name: string
  category: string
  version?: string
  evidence: string[]
  confidence: number
}

export interface LanguageEntry {
  name: string
  percentage: number
}

export interface StackResult {
  technologies: DetectedTech[]
  languages: LanguageEntry[]
  projectType: string
  packageManager?: string
}

// ─── Extension → Language map ────────────────────────────

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  '.cjs': 'JavaScript',
  '.css': 'CSS',
  '.cts': 'TypeScript',
  '.go': 'Go',
  '.gql': 'GraphQL',
  '.graphql': 'GraphQL',
  '.hbs': 'Handlebars',
  '.html': 'HTML',
  '.java': 'Java',
  '.js': 'JavaScript',
  '.json': 'JSON',
  '.jsx': 'JavaScript',
  '.kt': 'Kotlin',
  '.less': 'Less',
  '.lua': 'Lua',
  '.mjs': 'JavaScript',
  '.mts': 'TypeScript',
  '.md': 'Markdown',
  '.php': 'PHP',
  '.py': 'Python',
  '.rb': 'Ruby',
  '.rs': 'Rust',
  '.sass': 'Sass',
  '.scss': 'SCSS',
  '.sh': 'Shell',
  '.sql': 'SQL',
  '.svelte': 'Svelte',
  '.svg': 'SVG',
  '.swift': 'Swift',
  '.toml': 'TOML',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.vue': 'Vue',
  '.xml': 'XML',
  '.yaml': 'YAML',
  '.yml': 'YAML',
  '.zig': 'Zig',
}

// ─── Config file → Technology map ────────────────────────

interface ConfigFileRule {
  patterns: string[]
  name: string
  category: string
}

const CONFIG_FILE_RULES: ConfigFileRule[] = [
  { patterns: ['tsconfig.json'], name: 'TypeScript', category: 'Language' },
  { patterns: ['.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.mjs', 'eslint.config.js', 'eslint.config.ts'], name: 'ESLint', category: 'Linting' },
  { patterns: ['.prettierrc', '.prettierrc.js', '.prettierrc.json', '.prettierrc.yml'], name: 'Prettier', category: 'Formatting' },
  { patterns: ['vitest.config.ts', 'vitest.config.js', 'vitest.config.mts'], name: 'Vitest', category: 'Testing' },
  { patterns: ['jest.config.ts', 'jest.config.js', 'jest.config.mjs', 'jest.config.cjs'], name: 'Jest', category: 'Testing' },
  { patterns: ['webpack.config.js', 'webpack.config.ts', 'webpack.config.mjs'], name: 'Webpack', category: 'Build' },
  { patterns: ['vite.config.ts', 'vite.config.js', 'vite.config.mts'], name: 'Vite', category: 'Build' },
  { patterns: ['rollup.config.js', 'rollup.config.ts', 'rollup.config.mjs'], name: 'Rollup', category: 'Build' },
  { patterns: ['Dockerfile'], name: 'Docker', category: 'Infrastructure' },
  { patterns: ['docker-compose.yml', 'docker-compose.yaml', 'docker-compose.yml', 'compose.yml', 'compose.yaml'], name: 'Docker Compose', category: 'Infrastructure' },
  { patterns: ['Cargo.toml'], name: 'Rust', category: 'Language' },
  { patterns: ['go.mod'], name: 'Go', category: 'Language' },
  { patterns: ['pom.xml'], name: 'Maven', category: 'Build' },
  { patterns: ['build.gradle', 'build.gradle.kts'], name: 'Gradle', category: 'Build' },
  { patterns: ['requirements.txt', 'Pipfile', 'pyproject.toml'], name: 'Python', category: 'Language' },
  { patterns: ['Gemfile'], name: 'Ruby', category: 'Language' },
]

// ─── Package.json dependency → Technology map ───────────

interface DependencyRule {
  names: string[]
  name: string
  category: string
}

const DEPENDENCY_RULES: DependencyRule[] = [
  { names: ['react', 'react-dom'], name: 'React', category: 'Framework' },
  { names: ['vue'], name: 'Vue', category: 'Framework' },
  { names: ['@angular/core'], name: 'Angular', category: 'Framework' },
  { names: ['svelte'], name: 'Svelte', category: 'Framework' },
  { names: ['next'], name: 'Next.js', category: 'Framework' },
  { names: ['nuxt'], name: 'Nuxt', category: 'Framework' },
  { names: ['express'], name: 'Express', category: 'Framework' },
  { names: ['fastify'], name: 'Fastify', category: 'Framework' },
  { names: ['@nestjs/core'], name: 'NestJS', category: 'Framework' },
  { names: ['vitest'], name: 'Vitest', category: 'Testing' },
  { names: ['jest'], name: 'Jest', category: 'Testing' },
  { names: ['mocha'], name: 'Mocha', category: 'Testing' },
  { names: ['chai'], name: 'Chai', category: 'Testing' },
  { names: ['@playwright/test'], name: 'Playwright', category: 'Testing' },
  { names: ['cypress'], name: 'Cypress', category: 'Testing' },
  { names: ['webpack'], name: 'Webpack', category: 'Build' },
  { names: ['vite'], name: 'Vite', category: 'Build' },
  { names: ['rollup'], name: 'Rollup', category: 'Build' },
  { names: ['esbuild'], name: 'esbuild', category: 'Build' },
  { names: ['turbo'], name: 'Turbopack', category: 'Build' },
  { names: ['tailwindcss'], name: 'Tailwind CSS', category: 'Style' },
  { names: ['sass'], name: 'Sass', category: 'Style' },
  { names: ['styled-components'], name: 'styled-components', category: 'Style' },
  { names: ['@emotion/react', '@emotion/styled'], name: 'Emotion', category: 'Style' },
  { names: ['redux', '@reduxjs/toolkit'], name: 'Redux', category: 'State' },
  { names: ['zustand'], name: 'Zustand', category: 'State' },
  { names: ['mobx'], name: 'MobX', category: 'State' },
  { names: ['pinia'], name: 'Pinia', category: 'State' },
  { names: ['@oclif/core'], name: 'oclif', category: 'Framework' },
  { names: ['commander'], name: 'Commander', category: 'Framework' },
]

// ─── detectFromFilesystem ────────────────────────────────

export function detectFromFilesystem(dirPath: string): DetectedTech[] {
  const results: DetectedTech[] = []

  for (const rule of CONFIG_FILE_RULES) {
    for (const pattern of rule.patterns) {
      const fullPath = join(dirPath, pattern)
      if (existsSync(fullPath)) {
        results.push({
          category: rule.category,
          confidence: 1.0,
          evidence: [pattern],
          name: rule.name,
        })
        break
      }
    }
  }

  // GitHub Actions — check directory
  const workflowsDir = join(dirPath, '.github', 'workflows')
  if (existsSync(workflowsDir)) {
    results.push({
      category: 'CI/CD',
      confidence: 1.0,
      evidence: ['.github/workflows/'],
      name: 'GitHub Actions',
    })
  }

  // Node.js — implied by package.json
  if (existsSync(join(dirPath, 'package.json'))) {
    results.push({
      category: 'Language',
      confidence: 1.0,
      evidence: ['package.json'],
      name: 'Node.js',
    })
  }

  return results
}

// ─── detectFromPackageJson ───────────────────────────────

export async function detectFromPackageJson(dirPath: string): Promise<DetectedTech[]> {
  const results: DetectedTech[] = []

  let raw: string
  try {
    raw = await readFile(join(dirPath, 'package.json'), 'utf8')
  } catch {
    return results
  }

  let pkg: Record<string, unknown>
  try {
    pkg = JSON.parse(raw) as Record<string, unknown>
  } catch {
    return results
  }

  const deps = (pkg.dependencies ?? {}) as Record<string, string>
  const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>
  const allDeps: Record<string, string> = { ...deps, ...devDeps }

  for (const rule of DEPENDENCY_RULES) {
    for (const depName of rule.names) {
      if (depName in allDeps) {
        const versionRaw = allDeps[depName] ?? ''
        const version = versionRaw.replace(/^[\^~>=<]+/, '')
        results.push({
          category: rule.category,
          confidence: 1.0,
          evidence: [`package.json → ${depName}`],
          name: rule.name,
          version: version || undefined,
        })
        break
      }
    }
  }

  return results
}

// ─── detectLanguages ─────────────────────────────────────

const SKIP_DIRS = new Set([
  '.', '..', '.git', '.next', '.nuxt', 'node_modules', 'dist', 'coverage',
  'build', 'out', 'target', '__pycache__', 'vendor',
])

export async function detectLanguages(dirPath: string): Promise<LanguageEntry[]> {
  const extensionCounts = new Map<string, number>()

  async function walk(dir: string): Promise<void> {
    let entries: import('node:fs').Dirent[]
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const name = entry.name
      if (name.startsWith('.') || SKIP_DIRS.has(name)) {
        continue
      }

      const fullPath = join(dir, name)

      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(name).toLowerCase()
        if (ext && ext in LANGUAGE_EXTENSIONS) {
          extensionCounts.set(ext, (extensionCounts.get(ext) ?? 0) + 1)
        }
      }
    }
  }

  await walk(dirPath)

  // Map extensions to languages
  const languageCounts = new Map<string, number>()
  for (const [ext, count] of extensionCounts) {
    const lang = LANGUAGE_EXTENSIONS[ext]
    if (lang) {
      languageCounts.set(lang, (languageCounts.get(lang) ?? 0) + count)
    }
  }

  // Calculate total
  let total = 0
  for (const count of languageCounts.values()) {
    total += count
  }

  if (total === 0) {
    return []
  }

  const entries = Array.from(languageCounts.entries()).map(([name, count]) => ({
    name,
    percentage: Math.round((count / total) * 1000) / 10,
  }))

  entries.sort((a, b) => b.percentage - a.percentage)

  return entries
}

// ─── detectProjectType ───────────────────────────────────

export function detectProjectType(technologies: DetectedTech[]): string {
  const names = new Set(technologies.map((t) => t.name))
  const categories = new Set(technologies.map((t) => t.category))

  const hasFrontend = names.has('React') || names.has('Vue') || names.has('Angular') || names.has('Svelte') || names.has('Next.js') || names.has('Nuxt')
  const hasBackend = names.has('Express') || names.has('Fastify') || names.has('NestJS') || names.has('Maven') || names.has('Gradle')
  const hasCli = names.has('oclif') || names.has('Commander')
  const isMonorepo = names.has('Turbopack')

  if (isMonorepo) return 'Monorepo'
  if (hasFrontend && hasBackend) return 'Full-Stack App'
  if (hasFrontend) return 'Frontend App'
  if (hasBackend) return 'Backend API'
  if (hasCli) return 'CLI Tool'

  // If only language/build/linting detected, it's likely a library
  const nonToolCategories = Array.from(categories).filter(
    (c) => c !== 'Language' && c !== 'Linting' && c !== 'Formatting' && c !== 'Infrastructure' && c !== 'CI/CD',
  )
  if (nonToolCategories.length === 0) {
    return 'Library'
  }

  return 'Library'
}

// ─── detectPackageManager ────────────────────────────────

export function detectPackageManager(dirPath: string): string | undefined {
  if (existsSync(join(dirPath, 'pnpm-lock.yaml'))) return 'pnpm'
  if (existsSync(join(dirPath, 'bun.lockb'))) return 'bun'
  if (existsSync(join(dirPath, 'yarn.lock'))) return 'yarn'
  if (existsSync(join(dirPath, 'package-lock.json'))) return 'npm'

  return undefined
}

// ─── analyzeStack (orchestrator) ─────────────────────────

export async function analyzeStack(dirPath: string): Promise<StackResult> {
  const [fsTech, pkgTech, languages] = await Promise.all([
    Promise.resolve(detectFromFilesystem(dirPath)),
    detectFromPackageJson(dirPath),
    detectLanguages(dirPath),
  ])

  // Merge technologies, deduplicating by name
  const techMap = new Map<string, DetectedTech>()

  for (const tech of [...fsTech, ...pkgTech]) {
    const existing = techMap.get(tech.name)
    if (existing) {
      // Merge evidence
      const mergedEvidence = [...new Set([...existing.evidence, ...tech.evidence])]
      existing.evidence = mergedEvidence
      // Prefer version from package.json
      if (tech.version && !existing.version) {
        existing.version = tech.version
      }
      // Keep higher confidence
      existing.confidence = Math.max(existing.confidence, tech.confidence)
    } else {
      techMap.set(tech.name, { ...tech, evidence: [...tech.evidence] })
    }
  }

  const technologies = Array.from(techMap.values())
  const projectType = detectProjectType(technologies)
  const packageManager = detectPackageManager(dirPath)

  return {
    languages,
    packageManager,
    projectType,
    technologies,
  }
}
