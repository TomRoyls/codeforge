import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import Stack from '../src/commands/stack.js'
import {
  detectFromFilesystem,
  detectFromPackageJson,
  detectLanguages,
  detectPackageManager,
  detectProjectType,
  type DetectedTech,
  type StackResult,
} from '../src/commands/stack-helpers.js'
import { formatStackJson, formatStackTable } from '../src/commands/stack-format-helpers.js'

// ─── Test data factories ────────────────────────────────

function makeDetectedTech(overrides: Partial<DetectedTech> = {}): DetectedTech {
  return {
    category: 'Framework',
    confidence: 1.0,
    evidence: ['package.json → react'],
    name: 'React',
    version: '18.2.0',
    ...overrides,
  }
}

function makeStackResult(overrides: Partial<StackResult> = {}): StackResult {
  return {
    languages: [{ name: 'TypeScript', percentage: 80 }, { name: 'JavaScript', percentage: 20 }],
    packageManager: 'npm',
    projectType: 'Frontend App',
    technologies: [makeDetectedTech()],
    ...overrides,
  }
}

const TMP_DIR = join(process.cwd(), 'tmp', 'stack-test-' + process.pid)

async function setupTempDir(files: Record<string, string> = {}): Promise<string> {
  await mkdir(TMP_DIR, { recursive: true })
  for (const [filePath, content] of Object.entries(files)) {
    const fullPath = join(TMP_DIR, filePath)
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
    await mkdir(dir, { recursive: true })
    await writeFile(fullPath, content, 'utf8')
  }
  return TMP_DIR
}

async function cleanupTempDir(): Promise<void> {
  await rm(TMP_DIR, { recursive: true, force: true })
}

// ─── Command metadata ───────────────────────────────────

describe('Stack command - metadata', () => {
  it('has a description', () => {
    expect(Stack.description).toBe('Detect the technology stack used in a project')
  })

  it('has examples array', () => {
    expect(Array.isArray(Stack.examples)).toBe(true)
    expect(Stack.examples.length).toBeGreaterThanOrEqual(3)
  })

  it('has path arg as optional', () => {
    expect(Stack.args.path).toBeDefined()
    expect(Stack.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Stack.args.path.default).toBe('.')
  })
})

// ─── Command flags ──────────────────────────────────────

describe('Stack command - flags', () => {
  it('has format flag with options', () => {
    expect(Stack.flags.format.options).toContain('json')
    expect(Stack.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(Stack.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Stack.flags.output).toBeDefined()
  })

  it('has verbose flag defaulting to false', () => {
    expect(Stack.flags.verbose.default).toBe(false)
  })
})

// ─── Command class structure ────────────────────────────

describe('Stack command - class structure', () => {
  it('exports a default class', () => {
    expect(Stack).toBeDefined()
    expect(typeof Stack).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Stack.prototype.run).toBe('function')
  })
})

// ─── detectFromPackageJson ──────────────────────────────

describe('detectFromPackageJson', () => {
  it('detects React from dependencies', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({ dependencies: { react: '^18.2.0' } }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const react = results.find((r) => r.name === 'React')
      expect(react).toBeDefined()
      expect(react!.version).toBe('18.2.0')
      expect(react!.category).toBe('Framework')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Vue from dependencies', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({ dependencies: { vue: '^3.3.0' } }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const vue = results.find((r) => r.name === 'Vue')
      expect(vue).toBeDefined()
      expect(vue!.version).toBe('3.3.0')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Express from dependencies', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({ dependencies: { express: '^4.18.0' } }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const express = results.find((r) => r.name === 'Express')
      expect(express).toBeDefined()
      expect(express!.category).toBe('Framework')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects devDependencies', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({ devDependencies: { vitest: '^1.0.0' } }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const vitest = results.find((r) => r.name === 'Vitest')
      expect(vitest).toBeDefined()
      expect(vitest!.category).toBe('Testing')
    } finally {
      await cleanupTempDir()
    }
  })

  it('strips version prefixes (^, ~, >=, <=)', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({ dependencies: { react: '>=18.0.0' } }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const react = results.find((r) => r.name === 'React')
      expect(react!.version).toBe('18.0.0')
    } finally {
      await cleanupTempDir()
    }
  })

  it('returns empty array when no package.json', async () => {
    const dir = await setupTempDir({})
    try {
      const results = await detectFromPackageJson(dir)
      expect(results).toHaveLength(0)
    } finally {
      await cleanupTempDir()
    }
  })

  it('handles malformed JSON gracefully', async () => {
    const dir = await setupTempDir({
      'package.json': 'not valid json{{{',
    })
    try {
      const results = await detectFromPackageJson(dir)
      expect(results).toHaveLength(0)
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects multiple frameworks', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({
        dependencies: { react: '^18.0.0', express: '^4.0.0' },
      }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const names = results.map((r) => r.name)
      expect(names).toContain('React')
      expect(names).toContain('Express')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects oclif CLI framework', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({
        dependencies: { '@oclif/core': '^4.0.0' },
      }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const oclif = results.find((r) => r.name === 'oclif')
      expect(oclif).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects tailwindcss as Style', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({
        devDependencies: { tailwindcss: '^3.4.0' },
      }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const tw = results.find((r) => r.name === 'Tailwind CSS')
      expect(tw).toBeDefined()
      expect(tw!.category).toBe('Style')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects state management libraries', async () => {
    const dir = await setupTempDir({
      'package.json': JSON.stringify({
        dependencies: { zustand: '^4.0.0' },
      }),
    })
    try {
      const results = await detectFromPackageJson(dir)
      const zustand = results.find((r) => r.name === 'Zustand')
      expect(zustand).toBeDefined()
      expect(zustand!.category).toBe('State')
    } finally {
      await cleanupTempDir()
    }
  })
})

// ─── detectFromFilesystem ───────────────────────────────

describe('detectFromFilesystem', () => {
  it('detects TypeScript from tsconfig.json', async () => {
    const dir = await setupTempDir({ 'tsconfig.json': '{}' })
    try {
      const results = detectFromFilesystem(dir)
      const ts = results.find((r) => r.name === 'TypeScript')
      expect(ts).toBeDefined()
      expect(ts!.category).toBe('Language')
      expect(ts!.evidence).toContain('tsconfig.json')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Docker from Dockerfile', async () => {
    const dir = await setupTempDir({ 'Dockerfile': 'FROM node:18' })
    try {
      const results = detectFromFilesystem(dir)
      const docker = results.find((r) => r.name === 'Docker')
      expect(docker).toBeDefined()
      expect(docker!.category).toBe('Infrastructure')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects ESLint from eslint.config.mjs', async () => {
    const dir = await setupTempDir({ 'eslint.config.mjs': 'export default {}' })
    try {
      const results = detectFromFilesystem(dir)
      const eslint = results.find((r) => r.name === 'ESLint')
      expect(eslint).toBeDefined()
      expect(eslint!.category).toBe('Linting')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects GitHub Actions from .github/workflows/', async () => {
    const dir = await setupTempDir({ '.github/workflows/ci.yml': 'name: CI' })
    try {
      const results = detectFromFilesystem(dir)
      const gha = results.find((r) => r.name === 'GitHub Actions')
      expect(gha).toBeDefined()
      expect(gha!.category).toBe('CI/CD')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Node.js from package.json', async () => {
    const dir = await setupTempDir({ 'package.json': '{}' })
    try {
      const results = detectFromFilesystem(dir)
      const nodejs = results.find((r) => r.name === 'Node.js')
      expect(nodejs).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Prettier from .prettierrc', async () => {
    const dir = await setupTempDir({ '.prettierrc': '{}' })
    try {
      const results = detectFromFilesystem(dir)
      const prettier = results.find((r) => r.name === 'Prettier')
      expect(prettier).toBeDefined()
      expect(prettier!.category).toBe('Formatting')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Rust from Cargo.toml', async () => {
    const dir = await setupTempDir({ 'Cargo.toml': '[package]\nname = "test"' })
    try {
      const results = detectFromFilesystem(dir)
      const rust = results.find((r) => r.name === 'Rust')
      expect(rust).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Go from go.mod', async () => {
    const dir = await setupTempDir({ 'go.mod': 'module example.com\n\ngo 1.21' })
    try {
      const results = detectFromFilesystem(dir)
      const go = results.find((r) => r.name === 'Go')
      expect(go).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Python from requirements.txt', async () => {
    const dir = await setupTempDir({ 'requirements.txt': 'flask==2.0' })
    try {
      const results = detectFromFilesystem(dir)
      const python = results.find((r) => r.name === 'Python')
      expect(python).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('returns empty for unknown directory', async () => {
    const dir = await setupTempDir({})
    try {
      const results = detectFromFilesystem(dir)
      expect(results).toHaveLength(0)
    } finally {
      await cleanupTempDir()
    }
  })
})

// ─── detectProjectType ──────────────────────────────────

describe('detectProjectType', () => {
  it('returns "Frontend App" for React only', () => {
    const techs = [makeDetectedTech({ name: 'React', category: 'Framework' })]
    expect(detectProjectType(techs)).toBe('Frontend App')
  })

  it('returns "Backend API" for Express only', () => {
    const techs = [makeDetectedTech({ name: 'Express', category: 'Framework' })]
    expect(detectProjectType(techs)).toBe('Backend API')
  })

  it('returns "Full-Stack App" for React + Express', () => {
    const techs = [
      makeDetectedTech({ name: 'React', category: 'Framework' }),
      makeDetectedTech({ name: 'Express', category: 'Framework' }),
    ]
    expect(detectProjectType(techs)).toBe('Full-Stack App')
  })

  it('returns "CLI Tool" for oclif', () => {
    const techs = [makeDetectedTech({ name: 'oclif', category: 'Framework' })]
    expect(detectProjectType(techs)).toBe('CLI Tool')
  })

  it('returns "Library" for only language tooling', () => {
    const techs = [
      makeDetectedTech({ name: 'TypeScript', category: 'Language' }),
      makeDetectedTech({ name: 'ESLint', category: 'Linting' }),
    ]
    expect(detectProjectType(techs)).toBe('Library')
  })

  it('returns "Monorepo" for Turbopack', () => {
    const techs = [makeDetectedTech({ name: 'Turbopack', category: 'Build' })]
    expect(detectProjectType(techs)).toBe('Monorepo')
  })

  it('returns "Library" for empty technologies', () => {
    expect(detectProjectType([])).toBe('Library')
  })

  it('returns "Frontend App" for Next.js', () => {
    const techs = [makeDetectedTech({ name: 'Next.js', category: 'Framework' })]
    expect(detectProjectType(techs)).toBe('Frontend App')
  })
})

// ─── detectPackageManager ───────────────────────────────

describe('detectPackageManager', () => {
  it('detects npm from package-lock.json', async () => {
    const dir = await setupTempDir({ 'package-lock.json': '{}' })
    try {
      expect(detectPackageManager(dir)).toBe('npm')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects yarn from yarn.lock', async () => {
    const dir = await setupTempDir({ 'yarn.lock': '' })
    try {
      expect(detectPackageManager(dir)).toBe('yarn')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects pnpm from pnpm-lock.yaml', async () => {
    const dir = await setupTempDir({ 'pnpm-lock.yaml': '' })
    try {
      expect(detectPackageManager(dir)).toBe('pnpm')
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects bun from bun.lockb', async () => {
    const dir = await setupTempDir({ 'bun.lockb': '' })
    try {
      expect(detectPackageManager(dir)).toBe('bun')
    } finally {
      await cleanupTempDir()
    }
  })

  it('returns undefined when no lock file', async () => {
    const dir = await setupTempDir({})
    try {
      expect(detectPackageManager(dir)).toBeUndefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('prefers pnpm over yarn and npm', async () => {
    const dir = await setupTempDir({
      'pnpm-lock.yaml': '',
      'yarn.lock': '',
      'package-lock.json': '',
    })
    try {
      expect(detectPackageManager(dir)).toBe('pnpm')
    } finally {
      await cleanupTempDir()
    }
  })
})

// ─── formatStackTable ───────────────────────────────────

describe('formatStackTable', () => {
  it('contains project type header', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).toContain('Project Type')
    expect(output).toContain('Frontend App')
  })

  it('contains package manager when present', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).toContain('Package Manager')
    expect(output).toContain('npm')
  })

  it('contains languages section', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).toContain('Languages')
    expect(output).toContain('TypeScript')
    expect(output).toContain('80%')
  })

  it('contains technologies grouped by category', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).toContain('Technologies')
    expect(output).toContain('Framework')
    expect(output).toContain('React')
  })

  it('shows version when available', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).toContain('18.2.0')
  })

  it('shows evidence in verbose mode', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, true)
    expect(output).toContain('package.json → react')
  })

  it('hides evidence in non-verbose mode', () => {
    const result = makeStackResult()
    const output = formatStackTable(result, false)
    expect(output).not.toContain('↳')
  })

  it('handles empty technologies', () => {
    const result = makeStackResult({ technologies: [] })
    const output = formatStackTable(result, false)
    expect(output).toContain('Project Type')
  })

  it('handles empty languages', () => {
    const result = makeStackResult({ languages: [] })
    const output = formatStackTable(result, false)
    expect(output).toContain('Technologies')
  })

  it('handles missing package manager', () => {
    const result = makeStackResult({ packageManager: undefined })
    const output = formatStackTable(result, false)
    expect(output).not.toContain('Package Manager')
  })
})

// ─── formatStackJson ────────────────────────────────────

describe('formatStackJson', () => {
  it('produces valid JSON', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains technologies array', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.technologies).toBeDefined()
    expect(Array.isArray(parsed.technologies)).toBe(true)
  })

  it('contains languages array', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.languages).toBeDefined()
    expect(Array.isArray(parsed.languages)).toBe(true)
  })

  it('contains projectType string', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.projectType).toBe('Frontend App')
  })

  it('contains packageManager when present', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.packageManager).toBe('npm')
  })

  it('preserves technology details', () => {
    const result = makeStackResult()
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.technologies[0].name).toBe('React')
    expect(parsed.technologies[0].version).toBe('18.2.0')
    expect(parsed.technologies[0].category).toBe('Framework')
    expect(parsed.technologies[0].confidence).toBe(1.0)
  })

  it('handles empty results', () => {
    const result = makeStackResult({ languages: [], technologies: [], projectType: 'Library' })
    const output = formatStackJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.technologies).toHaveLength(0)
    expect(parsed.languages).toHaveLength(0)
    expect(parsed.projectType).toBe('Library')
  })
})

// ─── detectLanguages ────────────────────────────────────

describe('detectLanguages', () => {
  it('detects TypeScript files', async () => {
    const dir = await setupTempDir({ 'src/index.ts': 'const x = 1' })
    try {
      const langs = await detectLanguages(dir)
      const ts = langs.find((l) => l.name === 'TypeScript')
      expect(ts).toBeDefined()
      expect(ts!.percentage).toBe(100)
    } finally {
      await cleanupTempDir()
    }
  })

  it('calculates percentages for multiple languages', async () => {
    const dir = await setupTempDir({
      'src/a.ts': 'const a = 1',
      'src/b.ts': 'const b = 2',
      'src/c.js': 'const c = 3',
    })
    try {
      const langs = await detectLanguages(dir)
      const ts = langs.find((l) => l.name === 'TypeScript')
      const js = langs.find((l) => l.name === 'JavaScript')
      expect(ts).toBeDefined()
      expect(js).toBeDefined()
      expect(ts!.percentage).toBeGreaterThan(js!.percentage)
    } finally {
      await cleanupTempDir()
    }
  })

  it('returns empty for empty directory', async () => {
    const dir = await setupTempDir({})
    try {
      const langs = await detectLanguages(dir)
      expect(langs).toHaveLength(0)
    } finally {
      await cleanupTempDir()
    }
  })

  it('skips node_modules and dot directories', async () => {
    const dir = await setupTempDir({
      'node_modules/pkg/index.js': 'const x = 1',
      'src/app.ts': 'const y = 2',
    })
    try {
      const langs = await detectLanguages(dir)
      const js = langs.find((l) => l.name === 'JavaScript')
      expect(js).toBeUndefined()
      const ts = langs.find((l) => l.name === 'TypeScript')
      expect(ts).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Python files', async () => {
    const dir = await setupTempDir({ 'main.py': 'print("hello")' })
    try {
      const langs = await detectLanguages(dir)
      const py = langs.find((l) => l.name === 'Python')
      expect(py).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })

  it('detects Rust files', async () => {
    const dir = await setupTempDir({ 'src/main.rs': 'fn main() {}' })
    try {
      const langs = await detectLanguages(dir)
      const rs = langs.find((l) => l.name === 'Rust')
      expect(rs).toBeDefined()
    } finally {
      await cleanupTempDir()
    }
  })
})
