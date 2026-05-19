import { describe, expect, it } from 'vitest'

import ConfigFiles from '../src/commands/configfiles.js'
import {
  analyzeConfigFile,
  buildCategories,
  classifyConfig,
  computeCoverage,
  detectFormat,
  findMissingConfigs,
  getConfigGlobPatterns,
  getKnownConfigPatterns,
  type ConfigCategory,
  type ConfigFile,
  type ConfigFilesResult,
  type ConfigIssue,
  validateEnv,
  validateJson,
} from '../src/commands/configfiles-helpers.js'
import {
  formatConfigFilesJson,
  formatConfigFilesTable,
  formatConfigStatus,
  formatCoverage,
} from '../src/commands/configfiles-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeConfigFile(overrides: Partial<ConfigFile> = {}): ConfigFile {
  return {
    description: 'TypeScript compiler configuration',
    format: 'json',
    issues: [],
    isValid: null,
    lastModified: '2025-01-01T00:00:00.000Z',
    name: 'tsconfig.json',
    path: 'tsconfig.json',
    relativePath: 'tsconfig.json',
    size: 100,
    type: 'typescript',
    ...overrides,
  }
}

function makeConfigFilesResult(overrides: Partial<ConfigFilesResult> = {}): ConfigFilesResult {
  return {
    categories: [],
    coverage: 50,
    files: [makeConfigFile()],
    issues: [],
    missingConfigs: [],
    totalFiles: 1,
    totalSize: 100,
    ...overrides,
  }
}

// ─── Command metadata ───────────────────────────────────

describe('ConfigFiles command - static metadata', () => {
  it('has a description', () => {
    expect(ConfigFiles.description).toBe('Discover and analyze project configuration files')
  })

  it('has examples array', () => {
    expect(Array.isArray(ConfigFiles.examples)).toBe(true)
    expect(ConfigFiles.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(ConfigFiles.args.path).toBeDefined()
    expect(ConfigFiles.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(ConfigFiles.args.path.default).toBe('.')
  })
})

describe('ConfigFiles command - flags', () => {
  it('has format flag with options', () => {
    expect(ConfigFiles.flags.format.options).toContain('json')
    expect(ConfigFiles.flags.format.options).toContain('table')
  })

  it('defaults format to table', () => {
    expect(ConfigFiles.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(ConfigFiles.flags.output).toBeDefined()
  })

  it('has validate flag defaulting to false', () => {
    expect(ConfigFiles.flags.validate.default).toBe(false)
  })

  it('has verbose flag defaulting to false', () => {
    expect(ConfigFiles.flags.verbose.default).toBe(false)
  })
})

describe('ConfigFiles command - class structure', () => {
  it('exports a default class', () => {
    expect(ConfigFiles).toBeDefined()
    expect(typeof ConfigFiles).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof ConfigFiles.prototype.run).toBe('function')
  })
})

// ─── getKnownConfigPatterns ──────────────────────────────

describe('getKnownConfigPatterns', () => {
  it('returns a Map', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns).toBeInstanceOf(Map)
  })

  it('has tsconfig.json entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('tsconfig.json')).toEqual({
      type: 'typescript',
      description: 'TypeScript compiler configuration',
    })
  })

  it('has .eslintrc entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('.eslintrc')).toEqual({
      type: 'eslint',
      description: 'ESLint code linting configuration',
    })
  })

  it('has package.json entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('package.json')).toEqual({
      type: 'npm',
      description: 'NPM package management configuration',
    })
  })

  it('has .gitignore entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('.gitignore')).toEqual({
      type: 'git',
      description: 'Git version control configuration',
    })
  })

  it('has Dockerfile entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('Dockerfile')).toEqual({
      type: 'docker',
      description: 'Docker containerization configuration',
    })
  })

  it('has .env entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('.env')).toEqual({
      type: 'env',
      description: 'Environment variables',
    })
  })

  it('has .editorconfig entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('.editorconfig')).toEqual({
      type: 'editor',
      description: 'Editor configuration',
    })
  })

  it('has jest.config.ts entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('jest.config.ts')).toBeDefined()
    expect(patterns.get('jest.config.ts')!.type).toBe('jest')
  })

  it('has vitest.config.ts entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('vitest.config.ts')).toBeDefined()
    expect(patterns.get('vitest.config.ts')!.type).toBe('vitest')
  })

  it('has babel.config.js entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('babel.config.js')).toBeDefined()
    expect(patterns.get('babel.config.js')!.type).toBe('babel')
  })

  it('has webpack.config.js entry', () => {
    const patterns = getKnownConfigPatterns()
    expect(patterns.get('webpack.config.js')).toBeDefined()
    expect(patterns.get('webpack.config.js')!.type).toBe('webpack')
  })
})

// ─── getConfigGlobPatterns ───────────────────────────────

describe('getConfigGlobPatterns', () => {
  it('returns an array', () => {
    const patterns = getConfigGlobPatterns()
    expect(Array.isArray(patterns)).toBe(true)
  })

  it('contains tsconfig.json', () => {
    const patterns = getConfigGlobPatterns()
    expect(patterns).toContain('tsconfig.json')
  })

  it('contains .github/workflows pattern', () => {
    const patterns = getConfigGlobPatterns()
    expect(patterns).toContain('.github/workflows/*.yml')
  })

  it('contains docker-compose.yml', () => {
    const patterns = getConfigGlobPatterns()
    expect(patterns).toContain('docker-compose.yml')
  })
})

// ─── detectFormat ────────────────────────────────────────

describe('detectFormat', () => {
  it('detects .json files', () => {
    expect(detectFormat('tsconfig.json', '{}')).toBe('json')
  })

  it('detects .yml files', () => {
    expect(detectFormat('.gitlab-ci.yml', 'a: b')).toBe('yaml')
  })

  it('detects .yaml files', () => {
    expect(detectFormat('docker-compose.yaml', 'a: b')).toBe('yaml')
  })

  it('detects .toml files', () => {
    expect(detectFormat('Cargo.toml', '[package]')).toBe('toml')
  })

  it('detects .js files', () => {
    expect(detectFormat('jest.config.js', 'module.exports={}')).toBe('javascript')
  })

  it('detects .mjs files', () => {
    expect(detectFormat('eslint.config.mjs', 'export default {}')).toBe('javascript')
  })

  it('detects .ts files', () => {
    expect(detectFormat('vitest.config.ts', 'export default {}')).toBe('typescript')
  })

  it('detects .env files by filename', () => {
    expect(detectFormat('.env', 'KEY=VAL')).toBe('env')
  })

  it('detects .env.local files by filename', () => {
    expect(detectFormat('.env.local', 'KEY=VAL')).toBe('env')
  })

  it('detects .gitignore as text', () => {
    expect(detectFormat('.gitignore', 'node_modules')).toBe('text')
  })

  it('detects Dockerfile as text', () => {
    expect(detectFormat('Dockerfile', 'FROM node:20')).toBe('text')
  })

  it('detects .dockerignore as text', () => {
    expect(detectFormat('.dockerignore', 'node_modules')).toBe('text')
  })

  it('detects .ini extension', () => {
    expect(detectFormat('php.ini', '[PHP]')).toBe('ini')
  })

  it('detects .cjs files as javascript', () => {
    expect(detectFormat('.eslintrc.cjs', 'module.exports={}')).toBe('javascript')
  })

  it('detects JSON by content starting with {', () => {
    expect(detectFormat('unknownfile', '{"key": "val"}')).toBe('json')
  })

  it('detects JSON by content starting with [', () => {
    expect(detectFormat('unknownfile', '[1,2,3]')).toBe('json')
  })

  it('detects shebang as text', () => {
    expect(detectFormat('unknownfile', '#!/bin/bash\necho hi')).toBe('text')
  })

  it('returns unknown for empty unrecognized files', () => {
    expect(detectFormat('unknownfile', '')).toBe('unknown')
  })

  it('detects .prettierrc (no ext) as json', () => {
    expect(detectFormat('.prettierrc', '{}')).toBe('json')
  })
})

// ─── classifyConfig ──────────────────────────────────────

describe('classifyConfig', () => {
  it('classifies tsconfig.json', () => {
    const result = classifyConfig('tsconfig.json')
    expect(result.type).toBe('typescript')
  })

  it('classifies .eslintrc', () => {
    const result = classifyConfig('.eslintrc')
    expect(result.type).toBe('eslint')
  })

  it('classifies package.json', () => {
    const result = classifyConfig('package.json')
    expect(result.type).toBe('npm')
  })

  it('classifies tsconfig.app.json via pattern', () => {
    const result = classifyConfig('tsconfig.app.json')
    expect(result.type).toBe('typescript')
  })

  it('classifies .vscode/settings.json', () => {
    const result = classifyConfig('.vscode/settings.json')
    expect(result.type).toBe('editor')
  })

  it('classifies .github/workflows/ci.yml', () => {
    const result = classifyConfig('.github/workflows/ci.yml')
    expect(result.type).toBe('ci')
  })

  it('classifies custom.config.js as other', () => {
    const result = classifyConfig('custom.config.js')
    expect(result.type).toBe('other')
  })

  it('classifies unknown files as other', () => {
    const result = classifyConfig('random-file.txt')
    expect(result.type).toBe('other')
  })

  it('classifies .prettierrc', () => {
    const result = classifyConfig('.prettierrc')
    expect(result.type).toBe('prettier')
  })

  it('classifies docker-compose.yml', () => {
    const result = classifyConfig('docker-compose.yml')
    expect(result.type).toBe('docker')
  })
})

// ─── validateJson ────────────────────────────────────────

describe('validateJson', () => {
  it('validates correct JSON', () => {
    const result = validateJson('{"key": "value"}')
    expect(result.valid).toBe(true)
    expect(result.error).toBeNull()
  })

  it('rejects invalid JSON', () => {
    const result = validateJson('{invalid}')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects empty content', () => {
    const result = validateJson('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Empty file')
  })

  it('validates array JSON', () => {
    const result = validateJson('[1, 2, 3]')
    expect(result.valid).toBe(true)
  })

  it('validates whitespace-only JSON as invalid', () => {
    const result = validateJson('   ')
    expect(result.valid).toBe(false)
  })

  it('validates nested JSON', () => {
    const result = validateJson('{"a": {"b": [1, 2]}}')
    expect(result.valid).toBe(true)
  })
})

// ─── validateEnv ─────────────────────────────────────────

describe('validateEnv', () => {
  it('validates correct env file', () => {
    const result = validateEnv('KEY=VALUE\nANOTHER=test')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('allows comments', () => {
    const result = validateEnv('# This is a comment\nKEY=VALUE')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('allows blank lines', () => {
    const result = validateEnv('KEY=VALUE\n\nANOTHER=test')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('detects duplicate keys', () => {
    const result = validateEnv('KEY=VALUE1\nKEY=VALUE2')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0]!.severity).toBe('warning')
    expect(result.issues[0]!.message).toContain('Duplicate')
  })

  it('detects missing equals sign', () => {
    const result = validateEnv('NOEQUALSHERE')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.severity === 'error')).toBe(true)
  })

  it('detects empty key', () => {
    const result = validateEnv('=VALUE')
    expect(result.valid).toBe(false)
    expect(result.issues.some((i) => i.message.includes('Empty key'))).toBe(true)
  })

  it('warns about unquoted values with spaces', () => {
    const result = validateEnv('KEY=hello world')
    expect(result.issues.some((i) => i.severity === 'info')).toBe(true)
  })

  it('does not warn about quoted values with spaces', () => {
    const result = validateEnv('KEY="hello world"')
    expect(result.issues).toHaveLength(0)
  })

  it('handles single-quoted values', () => {
    const result = validateEnv("KEY='hello world'")
    expect(result.issues).toHaveLength(0)
  })

  it('handles empty content', () => {
    const result = validateEnv('')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('handles only comments', () => {
    const result = validateEnv('# comment1\n# comment2')
    expect(result.valid).toBe(true)
  })
})

// ─── analyzeConfigFile ───────────────────────────────────

describe('analyzeConfigFile', () => {
  it('analyzes a JSON config file', () => {
    const result = analyzeConfigFile('tsconfig.json', '{"compilerOptions": {}}', false)
    expect(result.format).toBe('json')
    expect(result.type).toBe('typescript')
    expect(result.name).toBe('tsconfig.json')
    expect(result.isValid).toBeNull()
  })

  it('analyzes a JSON config file with validation', () => {
    const result = analyzeConfigFile('tsconfig.json', '{"compilerOptions": {}}', true)
    expect(result.isValid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('detects invalid JSON when validating', () => {
    const result = analyzeConfigFile('tsconfig.json', '{bad json', true)
    expect(result.isValid).toBe(false)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('analyzes an env file with validation', () => {
    const result = analyzeConfigFile('.env', 'KEY=VALUE\n# comment', true)
    expect(result.format).toBe('env')
    expect(result.type).toBe('env')
    expect(result.isValid).toBe(true)
  })

  it('analyzes unknown file without validation', () => {
    const result = analyzeConfigFile('some.config', 'content', false)
    expect(result.isValid).toBeNull()
  })

  it('uses provided size and lastModified', () => {
    const result = analyzeConfigFile('test.json', '{}', false, 42, '2025-06-01T00:00:00Z')
    expect(result.size).toBe(42)
    expect(result.lastModified).toBe('2025-06-01T00:00:00Z')
  })

  it('classifies eslint config', () => {
    const result = analyzeConfigFile('.eslintrc.json', '{}', false)
    expect(result.type).toBe('eslint')
  })

  it('classifies package.json', () => {
    const result = analyzeConfigFile('package.json', '{"name":"test"}', false)
    expect(result.type).toBe('npm')
  })
})

// ─── computeCoverage ─────────────────────────────────────

describe('computeCoverage', () => {
  it('returns 100 for all essential configs', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
      makeConfigFile({ name: '.gitignore', type: 'git' }),
      makeConfigFile({ name: '.editorconfig', type: 'editor' }),
      makeConfigFile({ name: '.eslintrc.json', type: 'eslint' }),
      makeConfigFile({ name: '.prettierrc', type: 'prettier' }),
    ]
    expect(computeCoverage(files)).toBe(100)
  })

  it('returns 0 for no configs', () => {
    expect(computeCoverage([])).toBe(0)
  })

  it('returns partial coverage', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
      makeConfigFile({ name: '.gitignore', type: 'git' }),
    ]
    expect(computeCoverage(files)).toBe(50)
  })

  it('counts any eslint variant', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
      makeConfigFile({ name: '.gitignore', type: 'git' }),
      makeConfigFile({ name: '.editorconfig', type: 'editor' }),
      makeConfigFile({ name: 'eslint.config.mjs', type: 'eslint' }),
      makeConfigFile({ name: '.prettierrc', type: 'prettier' }),
    ]
    expect(computeCoverage(files)).toBe(100)
  })
})

// ─── findMissingConfigs ──────────────────────────────────

describe('findMissingConfigs', () => {
  it('returns all essentials when no configs present', () => {
    const missing = findMissingConfigs([])
    expect(missing.length).toBe(6)
  })

  it('omits present configs', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
    ]
    const missing = findMissingConfigs(files)
    expect(missing.length).toBe(4)
    expect(missing.some((m) => m.includes('TypeScript'))).toBe(false)
    expect(missing.some((m) => m.includes('NPM'))).toBe(false)
  })

  it('returns empty when all essentials present', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json' }),
      makeConfigFile({ name: 'package.json' }),
      makeConfigFile({ name: '.gitignore' }),
      makeConfigFile({ name: '.editorconfig' }),
      makeConfigFile({ name: '.eslintrc.json' }),
      makeConfigFile({ name: '.prettierrc' }),
    ]
    expect(findMissingConfigs(files)).toHaveLength(0)
  })

  it('describes missing configs with name', () => {
    const missing = findMissingConfigs([])
    expect(missing[0]).toContain('(')
    expect(missing[0]).toContain(')')
  })
})

// ─── buildCategories ─────────────────────────────────────

describe('buildCategories', () => {
  it('groups files by type', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
      makeConfigFile({ name: '.gitignore', type: 'git' }),
    ]
    const categories = buildCategories(files)
    expect(categories).toHaveLength(3)
    expect(categories.map((c) => c.type).sort()).toEqual(['git', 'npm', 'typescript'])
  })

  it('groups multiple files of same type', () => {
    const files = [
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'tsconfig.app.json', type: 'typescript' }),
    ]
    const categories = buildCategories(files)
    expect(categories).toHaveLength(1)
    expect(categories[0]!.files).toHaveLength(2)
  })

  it('provides labels and descriptions', () => {
    const files = [makeConfigFile({ name: 'tsconfig.json', type: 'typescript' })]
    const categories = buildCategories(files)
    expect(categories[0]!.label).toBe('TypeScript')
    expect(categories[0]!.description).toBeTruthy()
  })

  it('handles empty files', () => {
    const categories = buildCategories([])
    expect(categories).toHaveLength(0)
  })

  it('orders categories predictably', () => {
    const files = [
      makeConfigFile({ name: '.gitignore', type: 'git' }),
      makeConfigFile({ name: 'tsconfig.json', type: 'typescript' }),
      makeConfigFile({ name: 'package.json', type: 'npm' }),
    ]
    const categories = buildCategories(files)
    expect(categories[0]!.type).toBe('typescript')
    expect(categories[1]!.type).toBe('npm')
    expect(categories[2]!.type).toBe('git')
  })
})

// ─── formatConfigStatus ──────────────────────────────────

describe('formatConfigStatus', () => {
  it('shows green checkmark for valid file', () => {
    const file = makeConfigFile({ isValid: true })
    const output = formatConfigStatus(file)
    expect(output).toContain('tsconfig.json')
    expect(output).toContain('✓')
  })

  it('shows red X for invalid file', () => {
    const file = makeConfigFile({ isValid: false })
    const output = formatConfigStatus(file)
    expect(output).toContain('✗')
  })

  it('shows dot for unchecked file', () => {
    const file = makeConfigFile({ isValid: null })
    const output = formatConfigStatus(file)
    expect(output).toContain('·')
  })
})

// ─── formatCoverage ──────────────────────────────────────

describe('formatCoverage', () => {
  it('shows percentage', () => {
    const output = formatCoverage(75)
    expect(output).toContain('75%')
  })

  it('shows bar characters', () => {
    const output = formatCoverage(50)
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('shows 0% correctly', () => {
    const output = formatCoverage(0)
    expect(output).toContain('0%')
  })

  it('shows 100% correctly', () => {
    const output = formatCoverage(100)
    expect(output).toContain('100%')
  })
})

// ─── formatConfigFilesTable ──────────────────────────────

describe('formatConfigFilesTable', () => {
  it('contains summary header', () => {
    const result = makeConfigFilesResult()
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('Config Files Report')
    expect(output).toContain('Total config files')
    expect(output).toContain('Coverage')
  })

  it('contains category sections', () => {
    const result = makeConfigFilesResult({
      categories: [
        {
          description: 'TypeScript config',
          files: [makeConfigFile()],
          label: 'TypeScript',
          type: 'typescript',
        },
      ],
    })
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('TypeScript')
    expect(output).toContain('tsconfig.json')
  })

  it('shows missing configs section', () => {
    const result = makeConfigFilesResult({
      missingConfigs: ['Editor configuration (.editorconfig)'],
    })
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('Missing Configs')
    expect(output).toContain('.editorconfig')
  })

  it('shows issues section when issues present', () => {
    const result = makeConfigFilesResult({
      issues: [{ severity: 'error', message: 'Invalid JSON' }],
    })
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('Issues')
    expect(output).toContain('Invalid JSON')
  })

  it('shows file details in verbose mode', () => {
    const result = makeConfigFilesResult()
    const output = formatConfigFilesTable(result, true)
    expect(output).toContain('File Details')
    expect(output).toContain('Path:')
    expect(output).toContain('Size:')
  })

  it('hides file details in non-verbose mode', () => {
    const result = makeConfigFilesResult()
    const output = formatConfigFilesTable(result, false)
    expect(output).not.toContain('File Details')
  })

  it('handles empty results', () => {
    const result = makeConfigFilesResult({
      categories: [],
      coverage: 0,
      files: [],
      issues: [],
      missingConfigs: ['TypeScript configuration (tsconfig.json)'],
      totalFiles: 0,
      totalSize: 0,
    })
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('Total config files: 0')
  })

  it('shows size in summary', () => {
    const result = makeConfigFilesResult({ totalSize: 2048 })
    const output = formatConfigFilesTable(result, false)
    expect(output).toContain('2.0KB')
  })
})

// ─── formatConfigFilesJson ───────────────────────────────

describe('formatConfigFilesJson', () => {
  it('produces valid JSON', () => {
    const result = makeConfigFilesResult()
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains files array', () => {
    const result = makeConfigFilesResult()
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files).toBeDefined()
    expect(Array.isArray(parsed.files)).toBe(true)
  })

  it('contains coverage number', () => {
    const result = makeConfigFilesResult({ coverage: 75 })
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.coverage).toBe(75)
  })

  it('contains missingConfigs array', () => {
    const result = makeConfigFilesResult({ missingConfigs: ['test'] })
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.missingConfigs).toEqual(['test'])
  })

  it('contains categories', () => {
    const result = makeConfigFilesResult({
      categories: [{ type: 'typescript', label: 'TypeScript', files: [], description: 'TypeScript config' }],
    })
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.categories).toHaveLength(1)
    expect(parsed.categories[0].label).toBe('TypeScript')
  })

  it('handles empty results', () => {
    const result = makeConfigFilesResult({
      categories: [],
      coverage: 0,
      files: [],
      issues: [],
      missingConfigs: [],
      totalFiles: 0,
      totalSize: 0,
    })
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalFiles).toBe(0)
    expect(parsed.files).toHaveLength(0)
  })

  it('preserves file data accurately', () => {
    const result = makeConfigFilesResult({
      files: [makeConfigFile({ name: 'custom.json', size: 42, format: 'json', isValid: true })],
    })
    const output = formatConfigFilesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.files[0].name).toBe('custom.json')
    expect(parsed.files[0].size).toBe(42)
    expect(parsed.files[0].isValid).toBe(true)
  })
})
