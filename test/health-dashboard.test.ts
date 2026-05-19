import { describe, it, expect } from 'vitest'

import {
  assessCodeQuality,
  assessDependencyHealth,
  assessDocumentationHealth,
  assessPerformanceHealth,
  assessSecurityHealth,
  assessTestHealth,
  buildHealthReport,
  computeOverallHealth,
  generatePriorityActions,
  scoreToGrade,
  type HealthDimension,
} from '../src/commands/health-dashboard-helpers.js'

import {
  buildScoreBar,
  colorGrade,
  formatActions,
  formatDimension,
  formatHealthJson,
  formatHealthReport,
} from '../src/commands/health-dashboard-format-helpers.js'

import HealthDashboard from '../src/commands/health-dashboard.js'

// ─── scoreToGrade ───────────────────────────────────────

describe('scoreToGrade', () => {
  it('should return A for 90+', () => { expect(scoreToGrade(90)).toBe('A') })
  it('should return A for 100', () => { expect(scoreToGrade(100)).toBe('A') })
  it('should return B for 80-89', () => { expect(scoreToGrade(85)).toBe('B') })
  it('should return C for 70-79', () => { expect(scoreToGrade(75)).toBe('C') })
  it('should return D for 60-69', () => { expect(scoreToGrade(65)).toBe('D') })
  it('should return F for <60', () => { expect(scoreToGrade(50)).toBe('F') })
  it('should return F for 0', () => { expect(scoreToGrade(0)).toBe('F') })
})

// ─── assessTestHealth ───────────────────────────────────

describe('assessTestHealth', () => {
  it('should give low score with no test files', () => {
    const dim = assessTestHealth(['app.ts', 'utils.ts'], {})
    expect(dim.score).toBeLessThanOrEqual(20)
    expect(dim.name).toBe('Tests')
  })

  it('should give good score with matching test files', () => {
    const dim = assessTestHealth(
      ['app.ts', 'app.test.ts'],
      { 'app.test.ts': 'describe("app", () => { test("works", () => {}) })' },
    )
    expect(dim.score).toBeGreaterThan(50)
  })

  it('should detect low test coverage', () => {
    const dim = assessTestHealth(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'a.test.ts'],
      { 'a.test.ts': 'test("x", () => {})' },
    )
    expect(dim.findings.some((f) => f.includes('test files'))).toBe(true)
  })

  it('should handle empty file list', () => {
    const dim = assessTestHealth([], {})
    expect(dim.score).toBe(0)
  })

  it('should penalize test files without proper structure', () => {
    const dim = assessTestHealth(
      ['app.ts', 'app.test.ts'],
      { 'app.test.ts': 'console.log("not a real test")' },
    )
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── assessDependencyHealth ─────────────────────────────

describe('assessDependencyHealth', () => {
  it('should fail without package.json', () => {
    const dim = assessDependencyHealth({})
    expect(dim.score).toBe(0)
    expect(dim.grade).toBe('F')
  })

  it('should give full score for clean deps', () => {
    const dim = assessDependencyHealth({
      'package.json': JSON.stringify({ dependencies: { chalk: '5.0.0' } }),
      'package-lock.json': 'locked',
    })
    expect(dim.score).toBe(100)
  })

  it('should detect deprecated packages', () => {
    const dim = assessDependencyHealth({
      'package.json': JSON.stringify({ dependencies: { lodash: '3.0.0', moment: '2.0.0' } }),
    })
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('Deprecated'))).toBe(true)
  })

  it('should penalize missing lockfile', () => {
    const dim = assessDependencyHealth({
      'package.json': JSON.stringify({ dependencies: {} }),
    })
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('lockfile'))).toBe(true)
  })

  it('should penalize too many deps', () => {
    const deps: Record<string, string> = {}
    for (let i = 0; i < 55; i++) deps[`dep-${i}`] = '1.0.0'
    const dim = assessDependencyHealth({
      'package.json': JSON.stringify({ dependencies: deps }),
      'package-lock.json': 'lock',
    })
    expect(dim.score).toBeLessThan(100)
  })

  it('should handle invalid JSON', () => {
    const dim = assessDependencyHealth({ 'package.json': 'not json' })
    expect(dim.score).toBe(0)
  })
})

// ─── assessSecurityHealth ───────────────────────────────

describe('assessSecurityHealth', () => {
  it('should pass clean code', () => {
    const dim = assessSecurityHealth(['app.ts'], { 'app.ts': 'const x = 1' })
    expect(dim.score).toBe(100)
    expect(dim.findings.some((f) => f.includes('No obvious'))).toBe(true)
  })

  it('should detect eval usage', () => {
    const dim = assessSecurityHealth(['app.ts'], { 'app.ts': 'eval("code")' })
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('eval'))).toBe(true)
  })

  it('should detect innerHTML usage', () => {
    const dim = assessSecurityHealth(['app.ts'], { 'app.ts': 'el.innerHTML = data' })
    expect(dim.score).toBeLessThan(100)
  })

  it('should detect hardcoded API keys', () => {
    const dim = assessSecurityHealth(['app.ts'], { 'app.ts': 'const api_key = "sk-1234567890abcdefghijklmn"' })
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('API key'))).toBe(true)
  })

  it('should detect hardcoded passwords', () => {
    const dim = assessSecurityHealth(['app.ts'], { 'app.ts': "const password = 'supersecret'" })
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── assessCodeQuality ──────────────────────────────────

describe('assessCodeQuality', () => {
  it('should pass clean code', () => {
    const dim = assessCodeQuality(['app.ts'], { 'app.ts': 'export function add(a: number, b: number) { return a + b }' })
    expect(dim.score).toBe(100)
  })

  it('should penalize many console statements', () => {
    const code = Array.from({ length: 25 }, (_, i) => `console.log(${i})`).join('\n')
    const dim = assessCodeQuality(['app.ts'], { 'app.ts': code })
    expect(dim.score).toBeLessThan(100)
  })

  it('should penalize many TODO comments', () => {
    const code = Array.from({ length: 12 }, (_, i) => `// TODO: fix ${i}`).join('\n')
    const dim = assessCodeQuality(['app.ts'], { 'app.ts': code })
    expect(dim.score).toBeLessThan(100)
  })

  it('should report total lines', () => {
    const dim = assessCodeQuality(['app.ts'], { 'app.ts': 'line1\nline2\nline3' })
    expect(dim.findings.some((f) => f.includes('3 total lines'))).toBe(true)
  })

  it('should penalize long files', () => {
    const code = 'x\n'.repeat(350)
    const longFiles = Array.from({ length: 6 }, (_, i) => `file${i}.ts`)
    const contents: Record<string, string> = {}
    for (const f of longFiles) contents[f] = code
    const dim = assessCodeQuality(longFiles, contents)
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── assessDocumentationHealth ──────────────────────────

describe('assessDocumentationHealth', () => {
  it('should penalize missing README', () => {
    const dim = assessDocumentationHealth(['app.ts'], { 'app.ts': 'function foo() {}' })
    expect(dim.score).toBeLessThan(100)
  })

  it('should detect README', () => {
    const dim = assessDocumentationHealth(['app.ts'], { 'README.md': '# My Project', 'app.ts': '' })
    expect(dim.findings.some((f) => f.includes('README'))).toBe(true)
  })

  it('should detect JSDoc comments', () => {
    const dim = assessDocumentationHealth(
      ['app.ts'],
      { 'README.md': '# Readme', 'app.ts': '/** Adds two numbers */\nfunction add() {}\n/** Subs */\nfunction sub() {}' },
    )
    expect(dim.findings.some((f) => f.includes('JSDoc'))).toBe(true)
  })

  it('should penalize low JSDoc coverage', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\nfunction e() {}\nfunction f() {}'
    const dim = assessDocumentationHealth(['app.ts'], { 'README.md': '# Readme', 'app.ts': code })
    expect(dim.score).toBeLessThan(100)
  })
})

// ─── assessPerformanceHealth ────────────────────────────

describe('assessPerformanceHealth', () => {
  it('should pass clean code', () => {
    const dim = assessPerformanceHealth(['app.ts'], { 'app.ts': 'const x = 1' })
    expect(dim.score).toBe(100)
  })

  it('should detect sync file operations', () => {
    const dim = assessPerformanceHealth(['app.ts'], { 'app.ts': "const d = fs.readFileSync('f')" })
    expect(dim.score).toBeLessThan(100)
    expect(dim.findings.some((f) => f.includes('synchronous'))).toBe(true)
  })

  it('should penalize sync operations per count', () => {
    const code = "fs.readFileSync('a')\nfs.readFileSync('b')\nfs.writeFileSync('c', 'd')"
    const dim = assessPerformanceHealth(['app.ts'], { 'app.ts': code })
    expect(dim.score).toBeLessThan(90)
  })

  it('should report no issues for clean code', () => {
    const dim = assessPerformanceHealth(['app.ts'], { 'app.ts': 'await fs.readFile("f")' })
    expect(dim.findings.some((f) => f.includes('No obvious'))).toBe(true)
  })
})

// ─── computeOverallHealth ───────────────────────────────

describe('computeOverallHealth', () => {
  function makeDim(name: string, score: number, weight: number): HealthDimension {
    return { findings: [], grade: scoreToGrade(score), name, score, suggestions: [], weight }
  }

  it('should compute weighted overall', () => {
    const dims = [
      makeDim('Tests', 80, 0.20),
      makeDim('Security', 100, 0.20),
      makeDim('Quality', 60, 0.20),
    ]
    const report = computeOverallHealth(dims)
    expect(report.overall).toBeGreaterThan(0)
    expect(report.overall).toBeLessThanOrEqual(100)
  })

  it('should compute grade', () => {
    const dims = [makeDim('A', 95, 0.5), makeDim('B', 90, 0.5)]
    const report = computeOverallHealth(dims)
    expect(report.grade).toBe('A')
  })

  it('should identify highlights', () => {
    const dims = [makeDim('Tests', 95, 0.5), makeDim('Quality', 50, 0.5)]
    const report = computeOverallHealth(dims)
    expect(report.highlights.some((h) => h.includes('Tests'))).toBe(true)
  })

  it('should identify concerns', () => {
    const dims = [makeDim('Tests', 95, 0.5), makeDim('Quality', 30, 0.5)]
    const report = computeOverallHealth(dims)
    expect(report.concerns.some((c) => c.includes('Quality'))).toBe(true)
  })

  it('should generate actions', () => {
    const dims = [makeDim('Tests', 50, 0.5)]
    dims[0].suggestions.push('Add more tests')
    const report = computeOverallHealth(dims)
    expect(report.actions.length).toBeGreaterThan(0)
  })
})

// ─── generatePriorityActions ────────────────────────────

describe('generatePriorityActions', () => {
  it('should sort by lowest score first', () => {
    const dims: HealthDimension[] = [
      { findings: [], grade: 'A', name: 'Good', score: 95, suggestions: [], weight: 0.5 },
      { findings: [], grade: 'F', name: 'Bad', score: 20, suggestions: ['Fix this'], weight: 0.5 },
    ]
    const actions = generatePriorityActions(dims)
    expect(actions[0].dimension).toBe('Bad')
  })

  it('should limit to 5 actions', () => {
    const dims: HealthDimension[] = Array.from({ length: 6 }, (_, i) => ({
      findings: [],
      grade: 'F' as const,
      name: `Dim${i}`,
      score: 10,
      suggestions: [`Fix ${i}`],
      weight: 0.1,
    }))
    const actions = generatePriorityActions(dims)
    expect(actions.length).toBeLessThanOrEqual(5)
  })

  it('should assign effort based on score', () => {
    const dims: HealthDimension[] = [
      { findings: [], grade: 'F', name: 'Low', score: 20, suggestions: ['Fix'], weight: 0.5 },
    ]
    const actions = generatePriorityActions(dims)
    expect(actions[0].effort).toBe('high')
  })
})

// ─── buildHealthReport ──────────────────────────────────

describe('buildHealthReport', () => {
  it('should return full report with 6 dimensions', async () => {
    const report = await buildHealthReport(['app.ts'], {
      'app.ts': 'const x = 1',
      'package.json': JSON.stringify({ dependencies: {} }),
      'package-lock.json': 'lock',
      'README.md': '# Readme',
    })
    expect(report.dimensions).toHaveLength(6)
    expect(report.overall).toBeGreaterThanOrEqual(0)
    expect(report.grade).toBeTruthy()
  })

  it('should pass verbose option', async () => {
    const report = await buildHealthReport(['app.ts'], { 'app.ts': 'console.log("x")' }, { verbose: true })
    expect(report.dimensions).toHaveLength(6)
  })
})

// ─── buildScoreBar ──────────────────────────────────────

describe('buildScoreBar', () => {
  it('should produce green bar at 100', () => {
    expect(buildScoreBar(100, 10)).toContain('█')
  })
  it('should produce red bar at 0', () => {
    expect(buildScoreBar(0, 10)).toContain('░')
  })
  it('should produce mixed bar at 75', () => {
    const bar = buildScoreBar(75, 10)
    expect(bar).toContain('█')
    expect(bar).toContain('░')
  })
})

// ─── colorGrade ─────────────────────────────────────────

describe('colorGrade', () => {
  it('should return colored string for A', () => {
    expect(colorGrade('A')).toBeTruthy()
  })
  it('should return colored string for F', () => {
    expect(colorGrade('F')).toBeTruthy()
  })
})

// ─── formatDimension ────────────────────────────────────

describe('formatDimension', () => {
  it('should include name and score', () => {
    const dim: HealthDimension = { findings: ['ok'], grade: 'A', name: 'Tests', score: 95, suggestions: [], weight: 0.2 }
    const lines = formatDimension(dim)
    expect(lines[0]).toContain('Tests')
  })

  it('should include findings', () => {
    const dim: HealthDimension = { findings: ['finding one'], grade: 'A', name: 'Tests', score: 95, suggestions: [], weight: 0.2 }
    const lines = formatDimension(dim)
    expect(lines.some((l) => l.includes('finding one'))).toBe(true)
  })
})

// ─── formatActions ──────────────────────────────────────

describe('formatActions', () => {
  it('should format actions with priority', () => {
    const actions = [{ action: 'Fix tests', dimension: 'Tests', effort: 'high' as const, impact: 'Better quality', priority: 1 }]
    const lines = formatActions(actions)
    expect(lines.some((l) => l.includes('#1'))).toBe(true)
    expect(lines.some((l) => l.includes('Fix tests'))).toBe(true)
  })
})

// ─── formatHealthReport ─────────────────────────────────

describe('formatHealthReport', () => {
  it('should include dashboard header', () => {
    const report: import('../src/commands/health-dashboard-helpers.js').HealthReport = {
      actions: [],
      concerns: [],
      dimensions: [],
      grade: 'A',
      highlights: [],
      overall: 95,
    }
    const text = formatHealthReport(report)
    expect(text).toContain('Project Health Dashboard')
    expect(text).toContain('95%')
  })
})

// ─── formatHealthJson ───────────────────────────────────

describe('formatHealthJson', () => {
  it('should produce valid JSON', () => {
    const report: import('../src/commands/health-dashboard-helpers.js').HealthReport = {
      actions: [],
      concerns: [],
      dimensions: [],
      grade: 'A',
      highlights: [],
      overall: 95,
    }
    const json = formatHealthJson(report)
    const parsed = JSON.parse(json)
    expect(parsed.overall).toBe(95)
    expect(parsed.grade).toBe('A')
  })
})

// ─── Command metadata ───────────────────────────────────

describe('HealthDashboard command', () => {
  it('should have correct description', () => {
    expect(HealthDashboard.description).toContain('ealth')
  })

  it('should have path arg', () => {
    expect(HealthDashboard.args.path).toBeDefined()
  })

  it('should have format flag', () => {
    expect(HealthDashboard.flags.format).toBeDefined()
  })

  it('should have output flag', () => {
    expect(HealthDashboard.flags.output).toBeDefined()
  })

  it('should have ignore flag', () => {
    expect(HealthDashboard.flags.ignore).toBeDefined()
  })

  it('should have ext flag', () => {
    expect(HealthDashboard.flags.ext).toBeDefined()
  })

  it('should have verbose flag', () => {
    expect(HealthDashboard.flags.verbose).toBeDefined()
  })

  it('should have examples', () => {
    expect(HealthDashboard.examples.length).toBeGreaterThan(0)
  })
})
