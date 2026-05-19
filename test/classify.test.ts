import { describe, it, expect } from 'vitest'

import {
  detectLanguage,
  isEssentialFile,
  classifyFile,
  buildCategories,
  computeClassificationStats,
  generateRecommendations,
  buildClassificationResult,
  formatBytes,
  sourceBaseName,
  type FileClassification,
  type ClassCategory,
} from '../src/commands/classify-helpers.js'

import {
  categoryColor,
  formatCategoryTable,
  sizeBar,
  formatFileList,
  formatStats,
  formatRecommendations,
  formatClassifyTable,
  formatClassifyJson,
} from '../src/commands/classify-format-helpers.js'

// ─── detectLanguage ─────────────────────────────────────

describe('detectLanguage', () => {
  it('detects TypeScript', () => {
    expect(detectLanguage('src/main.ts')).toBe('TypeScript')
  })

  it('detects JavaScript', () => {
    expect(detectLanguage('app.js')).toBe('JavaScript')
  })

  it('detects Python', () => {
    expect(detectLanguage('script.py')).toBe('Python')
  })

  it('detects Rust', () => {
    expect(detectLanguage('main.rs')).toBe('Rust')
  })

  it('detects Go', () => {
    expect(detectLanguage('main.go')).toBe('Go')
  })

  it('detects CSS', () => {
    expect(detectLanguage('style.css')).toBe('CSS')
  })

  it('detects YAML', () => {
    expect(detectLanguage('config.yaml')).toBe('YAML')
  })

  it('returns Unknown for unrecognized ext', () => {
    expect(detectLanguage('file.xyz')).toBe('Unknown')
  })
})

// ─── isEssentialFile ────────────────────────────────────

describe('isEssentialFile', () => {
  it('marks package.json as essential', () => {
    expect(isEssentialFile('package.json')).toBe(true)
  })

  it('marks tsconfig.json as essential', () => {
    expect(isEssentialFile('tsconfig.json')).toBe(true)
  })

  it('marks README.md as essential', () => {
    expect(isEssentialFile('README.md')).toBe(true)
  })

  it('marks LICENSE as essential', () => {
    expect(isEssentialFile('LICENSE')).toBe(true)
  })

  it('marks .gitignore as essential', () => {
    expect(isEssentialFile('.gitignore')).toBe(true)
  })

  it('marks Dockerfile as essential', () => {
    expect(isEssentialFile('Dockerfile')).toBe(true)
  })

  it('marks GitHub workflow as essential', () => {
    expect(isEssentialFile('.github/workflows/ci.yml')).toBe(true)
  })

  it('does not mark random file', () => {
    expect(isEssentialFile('src/utils.ts')).toBe(false)
  })
})

// ─── classifyFile ───────────────────────────────────────

describe('classifyFile', () => {
  it('classifies source .ts files', () => {
    const cls = classifyFile('src/main.ts', 'const x = 1')
    expect(cls.category).toBe('source')
    expect(cls.role).toBe('Source Code')
    expect(cls.language).toBe('TypeScript')
  })

  it('classifies source .tsx files', () => {
    const cls = classifyFile('src/App.tsx', '<div/>')
    expect(cls.category).toBe('source')
  })

  it('classifies unit test files', () => {
    const cls = classifyFile('src/main.test.ts', 'test("x", () => {})')
    expect(cls.category).toBe('test')
    expect(cls.subcategory).toBe('unit-test')
  })

  it('classifies spec files', () => {
    const cls = classifyFile('src/utils.spec.ts', 'it("works")')
    expect(cls.category).toBe('test')
  })

  it('classifies test directory files', () => {
    const cls = classifyFile('test/helpers.test.ts', 'export function setup() {}')
    expect(cls.category).toBe('test')
  })

  it('classifies __tests__ files', () => {
    const cls = classifyFile('src/__tests__/foo.ts', 'test("a")')
    expect(cls.category).toBe('test')
  })

  it('classifies integration tests', () => {
    const cls = classifyFile('test/integration/api.test.ts', 'test("api")')
    expect(cls.category).toBe('test')
    expect(cls.subcategory).toBe('integration-test')
  })

  it('classifies package.json as config', () => {
    const cls = classifyFile('package.json', '{}')
    expect(cls.category).toBe('config')
    expect(cls.subcategory).toBe('package-config')
    expect(cls.isEssential).toBe(true)
  })

  it('classifies tsconfig.json', () => {
    const cls = classifyFile('tsconfig.json', '{}')
    expect(cls.category).toBe('config')
    expect(cls.subcategory).toBe('typescript-config')
  })

  it('classifies .eslintrc', () => {
    const cls = classifyFile('.eslintrc.json', '{}')
    expect(cls.category).toBe('config')
    expect(cls.subcategory).toBe('eslint-config')
  })

  it('classifies .env files', () => {
    const cls = classifyFile('.env', 'KEY=val')
    expect(cls.category).toBe('config')
    expect(cls.subcategory).toBe('environment')
  })

  it('classifies vitest config', () => {
    const cls = classifyFile('vitest.config.ts', 'export default {}')
    expect(cls.category).toBe('config')
    expect(cls.subcategory).toBe('test-config')
  })

  it('classifies .prettierrc', () => {
    const cls = classifyFile('.prettierrc', '{}')
    expect(cls.category).toBe('config')
  })

  it('classifies documentation files', () => {
    const cls = classifyFile('README.md', '# Hello')
    expect(cls.category).toBe('documentation')
  })

  it('classifies LICENSE', () => {
    const cls = classifyFile('LICENSE', 'MIT')
    expect(cls.category).toBe('documentation')
    expect(cls.subcategory).toBe('license')
    expect(cls.isEssential).toBe(true)
  })

  it('classifies CHANGELOG', () => {
    const cls = classifyFile('CHANGELOG.md', '# v1')
    expect(cls.category).toBe('documentation')
    expect(cls.subcategory).toBe('changelog')
  })

  it('classifies CSS files', () => {
    const cls = classifyFile('src/style.css', 'body {}')
    expect(cls.category).toBe('style')
  })

  it('classifies SCSS files', () => {
    const cls = classifyFile('src/app.scss', '$color: red;')
    expect(cls.category).toBe('style')
  })

  it('classifies shell scripts', () => {
    const cls = classifyFile('scripts/setup.sh', '#!/bin/bash')
    expect(cls.category).toBe('script')
  })

  it('classifies SVG assets', () => {
    const cls = classifyFile('assets/logo.svg', '<svg/>')
    expect(cls.category).toBe('asset')
    expect(cls.subcategory).toBe('vector-image')
  })

  it('classifies image assets', () => {
    const cls = classifyFile('img/photo.png', '')
    expect(cls.category).toBe('asset')
    expect(cls.subcategory).toBe('image')
  })

  it('classifies font files', () => {
    const cls = classifyFile('fonts/roboto.woff', '')
    expect(cls.category).toBe('asset')
    expect(cls.subcategory).toBe('font')
  })

  it('classifies .d.ts as generated', () => {
    const cls = classifyFile('dist/types.d.ts', 'declare module "x"')
    expect(cls.category).toBe('generated')
    expect(cls.subcategory).toBe('type-declaration')
  })

  it('classifies node_modules as generated', () => {
    const cls = classifyFile('node_modules/lodash/index.js', 'module.exports = {}')
    expect(cls.category).toBe('generated')
  })

  it('classifies dist as generated', () => {
    const cls = classifyFile('project/dist/index.js', 'export {}')
    expect(cls.category).toBe('generated')
  })

  it('classifies Makefile as build', () => {
    const cls = classifyFile('Makefile', 'all:\n\techo hi')
    expect(cls.category).toBe('build')
    expect(cls.isEssential).toBe(true)
  })

  it('classifies Dockerfile as build', () => {
    const cls = classifyFile('Dockerfile', 'FROM node:20')
    expect(cls.category).toBe('build')
  })

  it('classifies docker-compose', () => {
    const cls = classifyFile('docker-compose.yml', 'services:')
    expect(cls.category).toBe('build')
  })

  it('classifies GitHub Actions as ci', () => {
    const cls = classifyFile('.github/workflows/ci.yml', 'name: CI')
    expect(cls.category).toBe('ci')
    expect(cls.isEssential).toBe(true)
  })

  it('classifies JSON data', () => {
    const cls = classifyFile('data/users.json', '[]')
    expect(cls.category).toBe('data')
  })

  it('classifies CSV data', () => {
    const cls = classifyFile('data/report.csv', 'a,b\n1,2')
    expect(cls.category).toBe('data')
    expect(cls.subcategory).toBe('csv-data')
  })

  it('computes file size from content', () => {
    const cls = classifyFile('src/a.ts', 'hello')
    expect(cls.size).toBe(5)
  })

  it('computes line count from content', () => {
    const cls = classifyFile('src/a.ts', 'line1\nline2\nline3')
    expect(cls.lines).toBe(3)
  })

  it('classifies unknown extensions', () => {
    const cls = classifyFile('weird.xyz', 'data')
    expect(cls.category).toBe('unknown')
  })
})

// ─── buildCategories ────────────────────────────────────

describe('buildCategories', () => {
  it('groups files by category', () => {
    const files = [
      classifyFile('src/a.ts', 'x'),
      classifyFile('src/b.ts', 'y'),
      classifyFile('test/a.test.ts', 't'),
    ]
    const cats = buildCategories(files)
    expect(cats.length).toBe(2)
    expect(cats.find((c) => c.name === 'source')!.count).toBe(2)
    expect(cats.find((c) => c.name === 'test')!.count).toBe(1)
  })

  it('calculates percentages', () => {
    const files = [
      classifyFile('src/a.ts', 'x'),
      classifyFile('test/a.test.ts', 't'),
    ]
    const cats = buildCategories(files)
    for (const c of cats) {
      expect(c.percentage).toBe(50)
    }
  })

  it('calculates totalSize and totalLines', () => {
    const files = [
      classifyFile('src/a.ts', 'line1\nline2'),
    ]
    const cats = buildCategories(files)
    expect(cats[0].totalLines).toBe(2)
    expect(cats[0].totalSize).toBeGreaterThan(0)
  })

  it('returns empty for no files', () => {
    expect(buildCategories([])).toEqual([])
  })
})

// ─── computeClassificationStats ─────────────────────────

describe('computeClassificationStats', () => {
  it('computes stats from categories', () => {
    const files = [
      classifyFile('src/a.ts', 'x'),
      classifyFile('test/a.test.ts', 't'),
      classifyFile('package.json', '{}'),
    ]
    const cats = buildCategories(files)
    const stats = computeClassificationStats(cats)
    expect(stats.totalFiles).toBe(3)
    expect(stats.essentialFiles).toBe(1)
    expect(stats.categoryCounts.source).toBe(1)
    expect(stats.largestCategory).toBeDefined()
  })

  it('handles empty categories', () => {
    const stats = computeClassificationStats([])
    expect(stats.totalFiles).toBe(0)
    expect(stats.largestCategory).toBe('')
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('warns about generated files', () => {
    const files = [classifyFile('project/dist/index.js', 'x')]
    const cats = buildCategories(files)
    const recs = generateRecommendations(cats)
    expect(recs.some((r) => r.includes('generated'))).toBe(true)
  })

  it('warns about no tests', () => {
    const files = [classifyFile('src/a.ts', 'x')]
    const cats = buildCategories(files)
    const recs = generateRecommendations(cats)
    expect(recs.some((r) => r.includes('test'))).toBe(true)
  })

  it('warns about no docs', () => {
    const files = [classifyFile('src/a.ts', 'x')]
    const cats = buildCategories(files)
    const recs = generateRecommendations(cats)
    expect(recs.some((r) => r.includes('README'))).toBe(true)
  })

  it('praises well-organized projects', () => {
    const files = [
      classifyFile('src/a.ts', 'x'),
      classifyFile('test/a.test.ts', 't'),
      classifyFile('README.md', '# hi'),
    ]
    const cats = buildCategories(files)
    const recs = generateRecommendations(cats)
    expect(recs).toContain('Project structure looks well-organized')
  })
})

// ─── buildClassificationResult ──────────────────────────

describe('buildClassificationResult', () => {
  it('builds complete result', () => {
    const contents = new Map([
      ['src/a.ts', 'const x = 1'],
      ['test/a.test.ts', 'test("x")'],
      ['package.json', '{}'],
    ])
    const result = buildClassificationResult(
      ['src/a.ts', 'test/a.test.ts', 'package.json'],
      contents,
      { verbose: false },
    )
    expect(result.files.length).toBe(3)
    expect(result.categories.length).toBeGreaterThanOrEqual(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildClassificationResult([], new Map(), { verbose: false })
    expect(result.files).toEqual([])
    expect(result.categories).toEqual([])
  })
})

// ─── formatBytes ────────────────────────────────────────

describe('formatBytes', () => {
  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500B')
  })

  it('formats KB', () => {
    expect(formatBytes(2048)).toBe('2.0KB')
  })

  it('formats MB', () => {
    expect(formatBytes(1048576)).toBe('1.0MB')
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts', () => {
    expect(sourceBaseName('src/classify-helpers.ts')).toBe('classify-helpers')
  })
})

// ─── categoryColor ──────────────────────────────────────

describe('categoryColor', () => {
  it('returns a function for each category', () => {
    const cats = ['source', 'test', 'config', 'documentation', 'build', 'asset', 'generated', 'vendor', 'script', 'ci', 'style', 'data', 'unknown']
    for (const c of cats) {
      expect(typeof categoryColor(c)).toBe('function')
    }
  })
})

// ─── formatCategoryTable ────────────────────────────────

describe('formatCategoryTable', () => {
  it('formats category table', () => {
    const files = [classifyFile('src/a.ts', 'x')]
    const cats = buildCategories(files)
    const text = formatCategoryTable(cats)
    expect(text).toContain('source')
    expect(text).toContain('1')
  })

  it('handles empty', () => {
    expect(formatCategoryTable([])).toContain('No files')
  })
})

// ─── sizeBar ────────────────────────────────────────────

describe('sizeBar', () => {
  it('renders full bar', () => {
    expect(sizeBar(100, 5)).toBe('█████')
  })

  it('renders empty bar', () => {
    expect(sizeBar(0, 5)).toBe('░░░░░')
  })
})

// ─── formatFileList ─────────────────────────────────────

describe('formatFileList', () => {
  it('formats file list', () => {
    const files = [classifyFile('src/a.ts', 'x')]
    const cats = buildCategories(files)
    const text = formatFileList(cats)
    expect(text).toContain('src/a.ts')
  })
})

// ─── formatStats ────────────────────────────────────────

describe('formatStats', () => {
  it('formats stats', () => {
    const files = [classifyFile('src/a.ts', 'x')]
    const cats = buildCategories(files)
    const stats = computeClassificationStats(cats)
    const text = formatStats(stats)
    expect(text).toContain('Total files: 1')
  })
})

// ─── formatRecommendations ──────────────────────────────

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const text = formatRecommendations(['Add tests'])
    expect(text).toContain('Add tests')
  })
})

// ─── formatClassifyTable ────────────────────────────────

describe('formatClassifyTable', () => {
  it('formats complete table', () => {
    const contents = new Map([['src/a.ts', 'x']])
    const result = buildClassificationResult(['src/a.ts'], contents, { verbose: false })
    const text = formatClassifyTable(result)
    expect(text.length).toBeGreaterThan(0)
  })
})

// ─── formatClassifyJson ─────────────────────────────────

describe('formatClassifyJson', () => {
  it('produces valid JSON', () => {
    const contents = new Map([['src/a.ts', 'x']])
    const result = buildClassificationResult(['src/a.ts'], contents, { verbose: false })
    const json = formatClassifyJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.categories).toBeDefined()
  })
})
