import { describe, it, expect } from 'vitest'

import {
  detectProjectType,
  checkEssentialFiles,
  analyzeDirectoryStructure,
  checkDirectoryDepth,
  findEmptyDirectories,
  inferDirectoryPurpose,
  runStructureChecks,
  computeHealthScore,
  computeGrade,
  computeStructureStats,
  generateRecommendations,
  buildScaffoldResult,
  type DirectoryStructure,
  type StructureCheck,
  type ProjectFile,
  type ScaffoldStats,
} from '../src/commands/scaffold-helpers.js'

import {
  formatFileChecklist,
  formatDirectoryTree,
  formatChecksSummary,
  formatHealthGauge,
  formatMissingFiles,
  formatStatsLine,
  formatScaffoldResultTable,
  formatScaffoldJson,
  formatScaffoldCsv,
} from '../src/commands/scaffold-format-helpers.js'

// ─── detectProjectType ────────────────────────────────────────────────────────

describe('detectProjectType', () => {
  it('detects node from package.json', () => {
    expect(detectProjectType(['package.json', 'src/index.ts'])).toBe('node')
  })

  it('detects rust from Cargo.toml', () => {
    expect(detectProjectType(['Cargo.toml', 'src/main.rs'])).toBe('rust')
  })

  it('detects go from go.mod', () => {
    expect(detectProjectType(['go.mod', 'main.go'])).toBe('go')
  })

  it('detects python from requirements.txt', () => {
    expect(detectProjectType(['requirements.txt', 'app.py'])).toBe('python')
  })

  it('detects python from setup.py', () => {
    expect(detectProjectType(['setup.py'])).toBe('python')
  })

  it('detects python from pyproject.toml', () => {
    expect(detectProjectType(['pyproject.toml'])).toBe('python')
  })

  it('returns unknown for empty list', () => {
    expect(detectProjectType([])).toBe('unknown')
  })

  it('returns unknown for unrecognized files', () => {
    expect(detectProjectType(['main.c', 'Makefile'])).toBe('unknown')
  })

  it('prioritizes node over others', () => {
    expect(detectProjectType(['package.json', 'requirements.txt'])).toBe('node')
  })
})

// ─── checkEssentialFiles ──────────────────────────────────────────────────────

describe('checkEssentialFiles', () => {
  it('returns file list for empty input', () => {
    const files = checkEssentialFiles([])
    expect(files.length).toBeGreaterThan(0)
    expect(files.every((f) => !f.exists)).toBe(true)
  })

  it('detects README.md', () => {
    const files = checkEssentialFiles(['README.md'])
    const readme = files.find((f) => f.path.toLowerCase().includes('readme'))
    expect(readme).toBeDefined()
    expect(readme!.exists).toBe(true)
  })

  it('detects LICENSE', () => {
    const files = checkEssentialFiles(['LICENSE'])
    const lic = files.find((f) => f.path.toLowerCase().includes('licen'))
    expect(lic).toBeDefined()
    expect(lic!.exists).toBe(true)
  })

  it('detects .gitignore', () => {
    const files = checkEssentialFiles(['.gitignore'])
    const gi = files.find((f) => f.path === '.gitignore')
    expect(gi).toBeDefined()
    expect(gi!.exists).toBe(true)
  })

  it('detects package.json', () => {
    const files = checkEssentialFiles(['package.json'])
    const pkg = files.find((f) => f.path === 'package.json')
    expect(pkg).toBeDefined()
    expect(pkg!.exists).toBe(true)
  })

  it('detects tsconfig.json', () => {
    const files = checkEssentialFiles(['tsconfig.json'])
    const ts = files.find((f) => f.path === 'tsconfig.json')
    expect(ts).toBeDefined()
    expect(ts!.exists).toBe(true)
  })

  it('marks required files correctly', () => {
    const files = checkEssentialFiles([])
    const required = files.filter((f) => f.required)
    expect(required.length).toBeGreaterThan(0)
  })

  it('marks non-root files as not found', () => {
    const files = checkEssentialFiles(['src/README.md'])
    const readme = files.find((f) => f.path.toLowerCase().includes('readme'))
    expect(readme!.exists).toBe(false)
  })

  it('case-insensitive README detection', () => {
    const files = checkEssentialFiles(['readme.md'])
    const readme = files.find((f) => f.path.toLowerCase().includes('readme'))
    expect(readme!.exists).toBe(true)
  })
})

// ─── inferDirectoryPurpose ────────────────────────────────────────────────────

describe('inferDirectoryPurpose', () => {
  it('infers src as source', () => {
    expect(inferDirectoryPurpose('src')).toBe('source')
  })

  it('infers lib as source', () => {
    expect(inferDirectoryPurpose('lib')).toBe('source')
  })

  it('infers test as tests', () => {
    expect(inferDirectoryPurpose('test')).toBe('tests')
  })

  it('infers tests as tests', () => {
    expect(inferDirectoryPurpose('tests')).toBe('tests')
  })

  it('infers __tests__ as tests', () => {
    expect(inferDirectoryPurpose('__tests__')).toBe('tests')
  })

  it('infers docs as documentation', () => {
    expect(inferDirectoryPurpose('docs')).toBe('documentation')
  })

  it('infers config as configuration', () => {
    expect(inferDirectoryPurpose('config')).toBe('configuration')
  })

  it('infers dist as distribution', () => {
    expect(inferDirectoryPurpose('dist')).toBe('distribution')
  })

  it('infers build as build output', () => {
    expect(inferDirectoryPurpose('build')).toBe('build output')
  })

  it('returns unknown for unrecognized', () => {
    expect(inferDirectoryPurpose('random')).toBe('unknown')
  })

  it('handles case-insensitive', () => {
    expect(inferDirectoryPurpose('SRC')).toBe('source')
  })
})

// ─── analyzeDirectoryStructure ────────────────────────────────────────────────

describe('analyzeDirectoryStructure', () => {
  it('returns empty for no files', () => {
    expect(analyzeDirectoryStructure([])).toEqual([])
  })

  it('returns empty for root-only files', () => {
    expect(analyzeDirectoryStructure(['README.md', 'package.json'])).toEqual([])
  })

  it('detects top-level directories', () => {
    const structure = analyzeDirectoryStructure(['src/index.ts', 'test/app.test.ts'])
    expect(structure.length).toBe(2)
    const srcDir = structure.find((d) => d.path === 'src')
    expect(srcDir).toBeDefined()
    expect(srcDir!.files).toBe(1)
    expect(srcDir!.depth).toBe(0)
  })

  it('detects nested directories', () => {
    const structure = analyzeDirectoryStructure(['src/core/utils.ts'])
    expect(structure.length).toBe(2)
    const coreDir = structure.find((d) => d.path === 'src/core')
    expect(coreDir).toBeDefined()
    expect(coreDir!.depth).toBe(1)
  })

  it('computes depth correctly', () => {
    const structure = analyzeDirectoryStructure(['a/b/c/d/file.ts'])
    const deepest = structure.find((d) => d.path === 'a/b/c/d')
    expect(deepest!.depth).toBe(3)
  })

  it('infers purpose from name', () => {
    const structure = analyzeDirectoryStructure(['src/index.ts'])
    expect(structure[0]!.purpose).toBe('source')
  })

  it('marks conventional directories', () => {
    const structure = analyzeDirectoryStructure(['src/index.ts', 'random/file.txt'])
    const srcDir = structure.find((d) => d.path === 'src')
    const randDir = structure.find((d) => d.path === 'random')
    expect(srcDir!.isConventional).toBe(true)
    expect(randDir!.isConventional).toBe(false)
  })

  it('counts files per directory', () => {
    const structure = analyzeDirectoryStructure(['src/a.ts', 'src/b.ts', 'src/c.ts'])
    const srcDir = structure.find((d) => d.path === 'src')
    expect(srcDir!.files).toBe(3)
  })

  it('tracks subdirs', () => {
    const structure = analyzeDirectoryStructure(['src/core/a.ts', 'src/utils/b.ts'])
    const srcDir = structure.find((d) => d.path === 'src')
    expect(srcDir!.subdirs.length).toBe(2)
  })
})

// ─── checkDirectoryDepth ──────────────────────────────────────────────────────

describe('checkDirectoryDepth', () => {
  it('passes for shallow files', () => {
    const checks = checkDirectoryDepth(['src/index.ts', 'test/app.ts'])
    expect(checks[0]!.status).toBe('pass')
  })

  it('warns for deep files', () => {
    const checks = checkDirectoryDepth(['a/b/c/d/e/f/file.ts'])
    expect(checks[0]!.status).toBe('warning')
  })

  it('passes for files at exactly 5 levels', () => {
    const checks = checkDirectoryDepth(['a/b/c/d/e/file.ts'])
    expect(checks[0]!.status).toBe('pass')
  })

  it('warns for files at 6+ levels', () => {
    const checks = checkDirectoryDepth(['a/b/c/d/e/f/file.ts'])
    expect(checks[0]!.status).toBe('warning')
  })

  it('counts deep files correctly', () => {
    const checks = checkDirectoryDepth(['a/b/c/d/e/f/one.ts', 'a/b/c/d/e/f/two.ts', 'shallow.ts'])
    expect(checks[0]!.message).toContain('2')
  })
})

// ─── findEmptyDirectories ─────────────────────────────────────────────────────

describe('findEmptyDirectories', () => {
  const makeDir = (path: string, files: number, subdirs: string[] = []): DirectoryStructure => ({
    path, files, subdirs, depth: 0, purpose: 'unknown', isConventional: false,
  })

  it('returns empty for populated directories', () => {
    expect(findEmptyDirectories([makeDir('src', 5)])).toEqual([])
  })

  it('finds directories with no files and no subdirs', () => {
    const empty = findEmptyDirectories([makeDir('empty', 0)])
    expect(empty).toEqual(['empty'])
  })

  it('excludes directories with subdirs', () => {
    const empty = findEmptyDirectories([makeDir('parent', 0, ['child'])])
    expect(empty).toEqual([])
  })

  it('excludes directories with files', () => {
    const empty = findEmptyDirectories([makeDir('src', 3, [])])
    expect(empty).toEqual([])
  })

  it('finds multiple empty dirs', () => {
    const dirs = [makeDir('a', 0), makeDir('b', 5), makeDir('c', 0)]
    expect(findEmptyDirectories(dirs)).toEqual(['a', 'c'])
  })
})

// ─── runStructureChecks ───────────────────────────────────────────────────────

describe('runStructureChecks', () => {
  it('returns checks for complete project', () => {
    const filePaths = ['README.md', '.gitignore', 'src/index.ts', 'test/app.test.ts', '.github/workflows/ci.yml']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    expect(checks.length).toBeGreaterThan(0)
  })

  it('fails when required files missing', () => {
    const filePaths = ['src/index.ts']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    const fails = checks.filter((c) => c.status === 'fail')
    expect(fails.length).toBeGreaterThan(0)
  })

  it('passes when src/ exists', () => {
    const filePaths = ['src/index.ts']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    const srcCheck = checks.find((c) => c.name === 'Source directory')
    expect(srcCheck!.status).toBe('pass')
  })

  it('warns when no src/ or lib/', () => {
    const filePaths = ['index.ts']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    const srcCheck = checks.find((c) => c.name === 'Source directory')
    expect(srcCheck!.status).toBe('warning')
  })

  it('detects test directory', () => {
    const filePaths = ['test/app.test.ts']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    const testCheck = checks.find((c) => c.name === 'Test directory')
    expect(testCheck!.status).toBe('pass')
  })

  it('detects CI/CD config', () => {
    const filePaths = ['.github/workflows/ci.yml']
    const files = checkEssentialFiles(filePaths)
    const checks = runStructureChecks(filePaths, files)
    const ciCheck = checks.find((c) => c.name === 'CI/CD configuration')
    expect(ciCheck!.status).toBe('pass')
  })
})

// ─── computeHealthScore ───────────────────────────────────────────────────────

describe('computeHealthScore', () => {
  it('returns 100 for all passing', () => {
    const checks: StructureCheck[] = [
      { name: 'a', status: 'pass', message: '', category: 'essential-files', details: '' },
      { name: 'b', status: 'pass', message: '', category: 'directory-structure', details: '' },
    ]
    expect(computeHealthScore(checks)).toBe(100)
  })

  it('returns 0 for all failing', () => {
    const checks: StructureCheck[] = [
      { name: 'a', status: 'fail', message: '', category: 'essential-files', details: '' },
      { name: 'b', status: 'fail', message: '', category: 'directory-structure', details: '' },
    ]
    expect(computeHealthScore(checks)).toBe(0)
  })

  it('returns 100 for empty checks', () => {
    expect(computeHealthScore([])).toBe(100)
  })

  it('gives half weight to warnings', () => {
    const checks: StructureCheck[] = [
      { name: 'a', status: 'warning', message: '', category: 'essential-files', details: '' },
    ]
    expect(computeHealthScore(checks)).toBe(50)
  })

  it('weights essential-files category higher', () => {
    const checksEssential: StructureCheck[] = [
      { name: 'a', status: 'fail', message: '', category: 'essential-files', details: '' },
      { name: 'b', status: 'pass', message: '', category: 'documentation', details: '' },
    ]
    const checksOther: StructureCheck[] = [
      { name: 'a', status: 'pass', message: '', category: 'essential-files', details: '' },
      { name: 'b', status: 'fail', message: '', category: 'documentation', details: '' },
    ]
    const essentialScore = computeHealthScore(checksEssential)
    const otherScore = computeHealthScore(checksOther)
    expect(otherScore).toBeGreaterThan(essentialScore)
  })
})

// ─── computeGrade ─────────────────────────────────────────────────────────────

describe('computeGrade', () => {
  it('returns A for 90+', () => {
    expect(computeGrade(90)).toBe('A')
    expect(computeGrade(100)).toBe('A')
  })

  it('returns B for 80-89', () => {
    expect(computeGrade(80)).toBe('B')
    expect(computeGrade(89)).toBe('B')
  })

  it('returns C for 70-79', () => {
    expect(computeGrade(70)).toBe('C')
    expect(computeGrade(79)).toBe('C')
  })

  it('returns D for 60-69', () => {
    expect(computeGrade(60)).toBe('D')
    expect(computeGrade(69)).toBe('D')
  })

  it('returns F for below 60', () => {
    expect(computeGrade(59)).toBe('F')
    expect(computeGrade(0)).toBe('F')
  })
})

// ─── computeStructureStats ────────────────────────────────────────────────────

describe('computeStructureStats', () => {
  it('computes stats for empty project', () => {
    const stats = computeStructureStats([], [], [])
    expect(stats.directories).toBe(0)
    expect(stats.files).toBe(0)
    expect(stats.maxDepth).toBe(0)
    expect(stats.averageDepth).toBe(0)
  })

  it('counts directories and files', () => {
    const structure: DirectoryStructure[] = [
      { path: 'src', files: 5, subdirs: [], depth: 0, purpose: 'source', isConventional: true },
      { path: 'test', files: 3, subdirs: [], depth: 0, purpose: 'tests', isConventional: true },
    ]
    const checks: StructureCheck[] = [
      { name: 'a', status: 'pass', message: '', category: 'essential-files', details: '' },
    ]
    const stats = computeStructureStats(structure, checks, ['a.ts', 'b.ts'])
    expect(stats.directories).toBe(2)
    expect(stats.files).toBe(2)
  })

  it('computes maxDepth', () => {
    const structure: DirectoryStructure[] = [
      { path: 'src', files: 1, subdirs: [], depth: 0, purpose: 'source', isConventional: true },
      { path: 'src/core', files: 1, subdirs: [], depth: 1, purpose: 'core logic', isConventional: true },
      { path: 'src/core/deep', files: 1, subdirs: [], depth: 2, purpose: 'unknown', isConventional: false },
    ]
    const stats = computeStructureStats(structure, [], [])
    expect(stats.maxDepth).toBe(2)
  })

  it('computes averageDepth', () => {
    const structure: DirectoryStructure[] = [
      { path: 'src', files: 1, subdirs: [], depth: 0, purpose: 'source', isConventional: true },
      { path: 'src/core', files: 1, subdirs: [], depth: 2, purpose: 'core logic', isConventional: true },
    ]
    const stats = computeStructureStats(structure, [], [])
    expect(stats.averageDepth).toBe(1.0)
  })

  it('counts passed and failed checks', () => {
    const checks: StructureCheck[] = [
      { name: 'a', status: 'pass', message: '', category: 'essential-files', details: '' },
      { name: 'b', status: 'fail', message: '', category: 'essential-files', details: '' },
      { name: 'c', status: 'pass', message: '', category: 'directory-structure', details: '' },
    ]
    const stats = computeStructureStats([], checks, [])
    expect(stats.checksPassed).toBe(2)
    expect(stats.checksFailed).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns clean message for passing project', () => {
    const checks: StructureCheck[] = [
      { name: 'a', status: 'pass', message: '', category: 'essential-files', details: '' },
    ]
    const recs = generateRecommendations(checks, [])
    expect(recs).toEqual(['Project structure looks healthy. No issues found.'])
  })

  it('recommends adding missing files', () => {
    const missing: ProjectFile[] = [{ path: 'README.md', exists: false, required: true, category: 'essential', description: 'Project documentation' }]
    const recs = generateRecommendations([], missing)
    expect(recs.some((r) => r.includes('README.md'))).toBe(true)
  })

  it('recommends fixing failed checks', () => {
    const checks: StructureCheck[] = [
      { name: 'Test dir', status: 'warning', message: 'No tests', category: 'testing', details: 'Add tests/' },
    ]
    const recs = generateRecommendations(checks, [])
    expect(recs.some((r) => r.includes('WARN'))).toBe(true)
  })

  it('recommends fixing failed status', () => {
    const checks: StructureCheck[] = [
      { name: 'LICENSE', status: 'fail', message: 'Missing', category: 'essential-files', details: 'Add license' },
    ]
    const recs = generateRecommendations(checks, [])
    expect(recs.some((r) => r.includes('FAIL'))).toBe(true)
  })
})

// ─── buildScaffoldResult ──────────────────────────────────────────────────────

describe('buildScaffoldResult', () => {
  it('returns result for empty project', () => {
    const result = buildScaffoldResult('empty-app', [])
    expect(result.projectName).toBe('empty-app')
    expect(result.projectType).toBe('unknown')
    expect(result.tags).toBeUndefined()
  })

  it('detects project type', () => {
    const result = buildScaffoldResult('my-app', ['package.json', 'src/index.ts'])
    expect(result.projectType).toBe('node')
  })

  it('analyzes structure', () => {
    const result = buildScaffoldResult('my-app', ['src/core/a.ts', 'src/utils/b.ts', 'test/c.test.ts'])
    expect(result.structure.length).toBeGreaterThan(0)
  })

  it('runs checks', () => {
    const result = buildScaffoldResult('my-app', ['README.md', 'src/index.ts'])
    expect(result.checks.length).toBeGreaterThan(0)
  })

  it('computes stats', () => {
    const result = buildScaffoldResult('my-app', ['README.md', 'src/index.ts'])
    expect(result.stats.healthScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.healthScore).toBeLessThanOrEqual(100)
    expect(result.stats.grade).toBeDefined()
  })

  it('finds missing files', () => {
    const result = buildScaffoldResult('my-app', ['src/index.ts'])
    expect(result.missing.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildScaffoldResult('my-app', ['src/index.ts'])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('scores high for complete project', () => {
    const result = buildScaffoldResult('good', [
      'README.md', 'LICENSE', '.gitignore', 'package.json', 'tsconfig.json',
      'src/index.ts', 'test/app.test.ts', '.github/workflows/ci.yml', 'docs/guide.md',
    ])
    expect(result.stats.healthScore).toBeGreaterThan(70)
  })
})

// ─── formatFileChecklist ──────────────────────────────────────────────────────

describe('formatFileChecklist', () => {
  it('returns message for no files', () => {
    expect(formatFileChecklist([])).toContain('No files checked')
  })

  it('renders checklist with icons', () => {
    const files: ProjectFile[] = [
      { path: 'README.md', exists: true, required: true, category: 'essential', description: 'Readme' },
      { path: 'LICENSE', exists: false, required: true, category: 'essential', description: 'License' },
    ]
    const output = formatFileChecklist(files)
    expect(output).toContain('Essential Files')
    expect(output).toContain('README.md')
    expect(output).toContain('LICENSE')
  })
})

// ─── formatDirectoryTree ──────────────────────────────────────────────────────

describe('formatDirectoryTree', () => {
  it('returns message for no directories', () => {
    expect(formatDirectoryTree([])).toContain('No directories')
  })

  it('renders tree with directories', () => {
    const structure: DirectoryStructure[] = [
      { path: 'src', files: 5, subdirs: [], depth: 0, purpose: 'source', isConventional: true },
    ]
    const output = formatDirectoryTree(structure)
    expect(output).toContain('Directory Structure')
    expect(output).toContain('src')
    expect(output).toContain('source')
    expect(output).toContain('5 files')
  })
})

// ─── formatChecksSummary ──────────────────────────────────────────────────────

describe('formatChecksSummary', () => {
  it('returns empty for no checks', () => {
    expect(formatChecksSummary([])).toBe('')
  })

  it('renders checks with status', () => {
    const checks: StructureCheck[] = [
      { name: 'README', status: 'pass', message: 'Found', category: 'essential-files', details: '' },
      { name: 'Tests', status: 'warning', message: 'Missing', category: 'testing', details: '' },
    ]
    const output = formatChecksSummary(checks)
    expect(output).toContain('Structure Checks')
    expect(output).toContain('README')
    expect(output).toContain('Tests')
  })
})

// ─── formatHealthGauge ────────────────────────────────────────────────────────

describe('formatHealthGauge', () => {
  it('renders gauge with score and grade', () => {
    const stats: ScaffoldStats = { directories: 5, files: 20, maxDepth: 2, averageDepth: 1, checksPassed: 8, checksFailed: 2, healthScore: 85, grade: 'B' }
    const output = formatHealthGauge(stats)
    expect(output).toContain('85')
    expect(output).toContain('B')
    expect(output).toContain('█')
    expect(output).toContain('░')
  })
})

// ─── formatMissingFiles ───────────────────────────────────────────────────────

describe('formatMissingFiles', () => {
  it('returns empty for no missing files', () => {
    expect(formatMissingFiles([])).toBe('')
  })

  it('renders missing files', () => {
    const missing: ProjectFile[] = [{ path: 'LICENSE', exists: false, required: true, category: 'essential', description: 'License' }]
    const output = formatMissingFiles(missing)
    expect(output).toContain('Missing Required Files')
    expect(output).toContain('LICENSE')
  })
})

// ─── formatStatsLine ──────────────────────────────────────────────────────────

describe('formatStatsLine', () => {
  it('renders stats', () => {
    const stats: ScaffoldStats = { directories: 5, files: 20, maxDepth: 3, averageDepth: 1.5, checksPassed: 8, checksFailed: 2, healthScore: 80, grade: 'B' }
    const output = formatStatsLine(stats)
    expect(output).toContain('Dirs: 5')
    expect(output).toContain('Files: 20')
  })
})

// ─── formatScaffoldResultTable ────────────────────────────────────────────────

describe('formatScaffoldResultTable', () => {
  it('renders full result', () => {
    const result = buildScaffoldResult('my-app', ['README.md', 'src/index.ts'])
    const output = formatScaffoldResultTable(result, false)
    expect(output).toContain('my-app')
    expect(output).toContain('Essential Files')
    expect(output).toContain('Health Score')
  })

  it('includes recommendations', () => {
    const result = buildScaffoldResult('my-app', ['src/index.ts'])
    const output = formatScaffoldResultTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatScaffoldJson ───────────────────────────────────────────────────────

describe('formatScaffoldJson', () => {
  it('returns valid JSON', () => {
    const result = buildScaffoldResult('app', [])
    const output = formatScaffoldJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toHaveProperty('projectName')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('checks')
  })
})

// ─── formatScaffoldCsv ────────────────────────────────────────────────────────

describe('formatScaffoldCsv', () => {
  it('includes header', () => {
    const result = buildScaffoldResult('app', [])
    const output = formatScaffoldCsv(result)
    expect(output).toContain('name,status,category,message')
  })

  it('includes check data', () => {
    const result = buildScaffoldResult('app', ['README.md'])
    const output = formatScaffoldCsv(result)
    const lines = output.split('\n')
    expect(lines.length).toBeGreaterThan(1)
  })
})
