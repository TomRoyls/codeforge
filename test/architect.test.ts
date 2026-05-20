import { describe, expect, it } from 'vitest'

import {
  analyzeFloorPlan,
  buildArchitectResult,
  classifyBuildingCode,
  classifyOverallGrade,
  classifyStructureType,
  computeStructuralIntegrity,
  evaluateBlueprint,
  generateArchitectRecommendations,
  type Blueprint,
  type StructuralIssue,
  type ArchitectStats,
} from '../src/commands/architect-helpers.js'
import { formatArchitectJson, formatArchitectTable } from '../src/commands/architect-format-helpers.js'

// ─── classifyStructureType ──────────────────────────────────────────────────────

describe('classifyStructureType', () => {
  it('classifies interface-only files as facade', () => {
    const result = classifyStructureType('export interface Config { x: number }', 'types.ts', [])
    expect(result).toBe('facade')
  })

  it('classifies core files with many exports as foundation', () => {
    const content = Array.from({ length: 5 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    const result = classifyStructureType(content, 'src/core/config.ts', [])
    expect(result).toBe('foundation')
  })

  it('classifies test files as partition', () => {
    const result = classifyStructureType('const x = 1', 'app.test.ts', [])
    expect(result).toBe('partition')
  })

  it('classifies style files as decoration', () => {
    const result = classifyStructureType('.btn { color: red; }', 'styles.css', [])
    expect(result).toBe('decoration')
  })

  it('classifies files with balanced imports/exports as wall', () => {
    const result = classifyStructureType("import { x } from 'y'\nexport const z = x", 'module.ts', [])
    expect(result).toBe('wall')
  })

  it('classifies export-only files as partition', () => {
    const result = classifyStructureType('export const x = 1', 'simple.ts', [])
    expect(result).toBe('partition')
  })

  it('classifies plain files with no exports as decoration', () => {
    const result = classifyStructureType('const x = 1', 'plain.ts', [])
    expect(result).toBe('decoration')
  })
})

// ─── evaluateBlueprint ──────────────────────────────────────────────────────────

describe('evaluateBlueprint', () => {
  it('returns a complete blueprint', () => {
    const bp = evaluateBlueprint('export function foo(): void {}', 'a.ts', [])
    expect(bp).toHaveProperty('file', 'a.ts')
    expect(bp).toHaveProperty('structure')
    expect(bp).toHaveProperty('floors')
    expect(bp).toHaveProperty('rooms')
    expect(bp).toHaveProperty('doors')
    expect(bp).toHaveProperty('windows')
    expect(bp).toHaveProperty('structuralScore')
    expect(bp).toHaveProperty('foundationQuality')
    expect(bp).toHaveProperty('wallIntegrity')
    expect(bp).toHaveProperty('plumbing')
    expect(bp).toHaveProperty('electrical')
    expect(bp).toHaveProperty('curbAppeal')
    expect(bp).toHaveProperty('issues')
    expect(bp).toHaveProperty('grade')
  })

  it('all scores are between 0-100', () => {
    const bp = evaluateBlueprint('export function foo(): void {}', 'a.ts', [])
    const scores = [bp.structuralScore, bp.foundationQuality, bp.wallIntegrity, bp.plumbing, bp.electrical, bp.curbAppeal]
    for (const s of scores) {
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(100)
    }
  })

  it('counts doors (exports) correctly', () => {
    const bp = evaluateBlueprint('export const a = 1\nexport const b = 2\nexport function c() {}', 'a.ts', [])
    expect(bp.doors).toBe(3)
  })

  it('counts windows (imports) correctly', () => {
    const bp = evaluateBlueprint("import { x } from 'y'\nimport { z } from 'w'", 'a.ts', [])
    expect(bp.windows).toBe(2)
  })

  it('counts floors (nesting) correctly', () => {
    const deep = 'if (a) { if (b) { if (c) { } } }'
    const bp = evaluateBlueprint(deep, 'a.ts', [])
    expect(bp.floors).toBe(3)
  })

  it('assigns a valid grade', () => {
    const bp = evaluateBlueprint('export function foo(): void {}', 'a.ts', [])
    const validGrades = ['masterwork', 'sound', 'adequate', 'substandard', 'condemned']
    expect(validGrades).toContain(bp.grade)
  })

  it('rewards clean code with higher structural score', () => {
    const clean = "import { x } from 'y'\ninterface Config { val: number }\nexport function process(cfg: Config): number {\n  try {\n    return cfg.val\n  } catch(e) {\n    throw new Error('fail')\n  }\n}\n"
    const messy = Array.from({ length: 20 }, (_, i) => `function fn${i}() { if (x) { if (y) { if (z) { } } } }`).join('\n')
    const cleanBp = evaluateBlueprint(clean, 'clean.ts', [])
    const messyBp = evaluateBlueprint(messy, 'messy.ts', [])
    expect(cleanBp.structuralScore).toBeGreaterThan(messyBp.structuralScore)
  })

  it('detects rooms (sections)', () => {
    const multiSection = "const a = 1\n\nconst b = 2\n\nconst c = 3"
    const bp = evaluateBlueprint(multiSection, 'a.ts', [])
    expect(bp.rooms).toBeGreaterThanOrEqual(2)
  })
})

// ─── detectStructuralIssues ─────────────────────────────────────────────────────

describe('detectStructuralIssues', () => {
  it('detects cracked foundation', () => {
    const metrics = { floors: 1, doors: 3, windows: 0, lines: 20, functions: 3, errorHandling: 0, abstractions: 0, comments: 0, branches: 0 }
    const issues = evaluateBlueprint('export const a = 1\nexport const b = 2\nexport const c = 3', 'src/core/config.ts', []).issues
    expect(issues.some(i => i.type === 'cracked-foundation')).toBe(true)
  })

  it('detects load-bearing overload', () => {
    const content = Array.from({ length: 20 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    const bp = evaluateBlueprint(content, 'overloaded.ts', [])
    expect(bp.issues.some(i => i.type === 'load-bearing-overload')).toBe(true)
  })

  it('detects leaky roof (no error handling)', () => {
    const content = Array.from({ length: 40 }, (_, i) => `function fn${i}() { return ${i} }`).join('\n')
    const bp = evaluateBlueprint(content, 'leaky.ts', [])
    expect(bp.issues.some(i => i.type === 'leaky-roof')).toBe(true)
  })

  it('detects weak walls (deep nesting)', () => {
    const content = 'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) { } } } } } }'
    const bp = evaluateBlueprint(content, 'nested.ts', [])
    expect(bp.issues.some(i => i.type === 'weak-walls')).toBe(true)
  })

  it('detects bad plumbing (type bypasses)', () => {
    const content = 'const x: any = 1\nconst y = x as any'
    const bp = evaluateBlueprint(content, 'plumbing.ts', [])
    expect(bp.issues.some(i => i.type === 'bad-plumbing')).toBe(true)
  })

  it('detects faulty wiring (many branches)', () => {
    const content = Array.from({ length: 20 }, (_, i) => `if (x === ${i}) { y = ${i} }`).join('\n')
    const bp = evaluateBlueprint(content, 'wired.ts', [])
    expect(bp.issues.some(i => i.type === 'faulty-wiring')).toBe(true)
  })

  it('detects poor ventilation (no comments)', () => {
    const content = Array.from({ length: 30 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const bp = evaluateBlueprint(content, 'vent.ts', [])
    expect(bp.issues.some(i => i.type === 'poor-ventilation')).toBe(true)
  })

  it('detects structural debt (many TODOs)', () => {
    const content = Array.from({ length: 8 }, (_, i) => `// TODO: fix ${i}\nconst x${i} = ${i}`).join('\n')
    const bp = evaluateBlueprint(content, 'debt.ts', [])
    expect(bp.issues.some(i => i.type === 'structural-debt')).toBe(true)
  })

  it('issues have correct structure', () => {
    const content = 'if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {} } } } } }'
    const bp = evaluateBlueprint(content, 'a.ts', [])
    if (bp.issues.length > 0) {
      const issue = bp.issues[0]
      expect(issue).toHaveProperty('type')
      expect(issue).toHaveProperty('severity')
      expect(issue).toHaveProperty('description')
      expect(issue).toHaveProperty('fix')
      expect(issue).toHaveProperty('estimatedCost')
    }
  })

  it('clean code has fewer issues', () => {
    const clean = "// well documented\nimport { x } from 'y'\ninterface Config { val: number }\nexport function process(cfg: Config): number {\n  try { return cfg.val }\n  catch(e) { throw new Error('fail') }\n}\n"
    const bp = evaluateBlueprint(clean, 'clean.ts', [])
    expect(bp.issues.length).toBeLessThan(3)
  })
})

// ─── analyzeFloorPlan ───────────────────────────────────────────────────────────

describe('analyzeFloorPlan', () => {
  it('returns a complete floor plan', () => {
    const fp = analyzeFloorPlan(['a.ts', 'b.ts', 'c.ts'], 'src')
    expect(fp).toHaveProperty('directory', 'src')
    expect(fp).toHaveProperty('files')
    expect(fp).toHaveProperty('layout')
    expect(fp).toHaveProperty('zoning')
    expect(fp).toHaveProperty('description')
    expect(fp).toHaveProperty('issues')
  })

  it('classifies organized directory with index file', () => {
    const fp = analyzeFloorPlan(['index.ts', 'module.ts', 'types.ts'], 'src/core')
    expect(fp.layout).toBe('organized')
  })

  it('classifies test directories as industrial', () => {
    const fp = analyzeFloorPlan(['a.test.ts', 'b.test.ts', 'c.test.ts'], 'test')
    expect(fp.zoning).toBe('industrial')
  })

  it('flags too many files', () => {
    const files = Array.from({ length: 25 }, (_, i) => `file${i}.ts`)
    const fp = analyzeFloorPlan(files, 'src/big')
    expect(fp.issues.length).toBeGreaterThan(0)
  })

  it('flags missing index for large directories', () => {
    const files = Array.from({ length: 8 }, (_, i) => `module${i}.ts`)
    const fp = analyzeFloorPlan(files, 'src/utils')
    expect(fp.issues.some(i => i.includes('index'))).toBe(true)
  })

  it('provides description based on layout', () => {
    const fp = analyzeFloorPlan(['index.ts', 'mod.ts'], 'src/small')
    expect(fp.description.length).toBeGreaterThan(0)
  })
})

// ─── computeStructuralIntegrity ─────────────────────────────────────────────────

describe('computeStructuralIntegrity', () => {
  it('returns 50 for empty blueprints', () => {
    expect(computeStructuralIntegrity([], [])).toBe(50)
  })

  it('penalizes critical issues', () => {
    const bp = evaluateBlueprint('export const x = 1', 'a.ts', [])
    const noIssues = computeStructuralIntegrity([bp], [])
    const withCritical = computeStructuralIntegrity([bp], [
      { type: 'cracked-foundation', severity: 'critical', description: 'd', fix: 'f', estimatedCost: 'cheap' },
    ])
    expect(noIssues).toBeGreaterThan(withCritical)
  })

  it('penalizes structural issues', () => {
    const bp = evaluateBlueprint('export const x = 1', 'a.ts', [])
    const noIssues = computeStructuralIntegrity([bp], [])
    const withStructural = computeStructuralIntegrity([bp], [
      { type: 'weak-walls', severity: 'structural', description: 'd', fix: 'f', estimatedCost: 'cheap' },
    ])
    expect(noIssues).toBeGreaterThan(withStructural)
  })

  it('returns value between 0-100', () => {
    const bp = evaluateBlueprint('export const x = 1', 'a.ts', [])
    const integrity = computeStructuralIntegrity([bp], [])
    expect(integrity).toBeGreaterThanOrEqual(0)
    expect(integrity).toBeLessThanOrEqual(100)
  })
})

// ─── classifyBuildingCode ───────────────────────────────────────────────────────

describe('classifyBuildingCode', () => {
  it('classifies passing for high integrity and no critical issues', () => {
    expect(classifyBuildingCode(80, 0)).toBe('passing')
  })

  it('classifies minor-violations for moderate integrity', () => {
    expect(classifyBuildingCode(55, 0)).toBe('minor-violations')
  })

  it('classifies major-violations for low integrity', () => {
    expect(classifyBuildingCode(35, 0)).toBe('major-violations')
  })

  it('classifies condemned for very low integrity', () => {
    expect(classifyBuildingCode(15, 0)).toBe('condemned')
  })

  it('downgrades with critical issues', () => {
    expect(classifyBuildingCode(75, 1)).toBe('minor-violations')
  })
})

// ─── classifyOverallGrade ───────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('classifies skyscraper for top scores', () => {
    expect(classifyOverallGrade(90, 85)).toBe('skyscraper')
  })

  it('classifies office-building for good scores', () => {
    expect(classifyOverallGrade(70, 65)).toBe('office-building')
  })

  it('classifies house for moderate scores', () => {
    expect(classifyOverallGrade(50, 50)).toBe('house')
  })

  it('classifies shed for low scores', () => {
    expect(classifyOverallGrade(30, 25)).toBe('shed')
  })

  it('classifies ruins for very low scores', () => {
    expect(classifyOverallGrade(10, 10)).toBe('ruins')
  })
})

// ─── generateArchitectRecommendations ───────────────────────────────────────────

describe('generateArchitectRecommendations', () => {
  it('recommends fixing critical issues', () => {
    const stats = { criticalIssues: 2, avgCurbAppeal: 80 } as ArchitectStats
    const recs = generateArchitectRecommendations([], [], [
      { type: 'cracked-foundation', severity: 'critical', description: 'd', fix: 'f', estimatedCost: 'cheap' },
    ], stats)
    expect(recs.some(r => r.includes('critical'))).toBe(true)
  })

  it('recommends rebuilding condemned blueprints', () => {
    const bp = evaluateBlueprint('const x: any = 1', 'bad.ts', [])
    const stats = { criticalIssues: 0, avgCurbAppeal: 80 } as ArchitectStats
    const recs = generateArchitectRecommendations([bp], [], [], stats)
    if (bp.grade === 'condemned') {
      expect(recs.some(r => r.includes('condemned') || r.includes('Rebuild'))).toBe(true)
    }
  })

  it('recommends fixing leaky roofs', () => {
    const content = Array.from({ length: 40 }, (_, i) => `function fn${i}() { return ${i} }`).join('\n')
    const bp = evaluateBlueprint(content, 'leaky.ts', [])
    const stats = { criticalIssues: 0, avgCurbAppeal: 80 } as ArchitectStats
    const recs = generateArchitectRecommendations([bp], [], bp.issues, stats)
    if (bp.issues.some(i => i.type === 'leaky-roof')) {
      expect(recs.some(r => r.includes('leaky') || r.includes('error handling'))).toBe(true)
    }
  })

  it('returns deduplicated recommendations', () => {
    const stats = { criticalIssues: 0, avgCurbAppeal: 80 } as ArchitectStats
    const recs = generateArchitectRecommendations([], [], [], stats)
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

// ─── buildArchitectResult ───────────────────────────────────────────────────────

describe('buildArchitectResult', () => {
  it('returns complete result structure', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    expect(result).toHaveProperty('blueprints')
    expect(result).toHaveProperty('floorPlans')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('has one blueprint per file', () => {
    const result = buildArchitectResult(['a.ts', 'b.ts'], ['export const x = 1', 'export const y = 2'], {})
    expect(result.blueprints.length).toBe(2)
  })

  it('stats have all required fields', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const stats = result.stats
    expect(stats).toHaveProperty('totalBlueprints')
    expect(stats).toHaveProperty('foundations')
    expect(stats).toHaveProperty('loadBearing')
    expect(stats).toHaveProperty('facades')
    expect(stats).toHaveProperty('decorations')
    expect(stats).toHaveProperty('avgStructuralScore')
    expect(stats).toHaveProperty('avgFoundationQuality')
    expect(stats).toHaveProperty('avgWallIntegrity')
    expect(stats).toHaveProperty('avgPlumbing')
    expect(stats).toHaveProperty('avgElectrical')
    expect(stats).toHaveProperty('avgCurbAppeal')
    expect(stats).toHaveProperty('masterworkBlueprints')
    expect(stats).toHaveProperty('condemnedBlueprints')
    expect(stats).toHaveProperty('totalIssues')
    expect(stats).toHaveProperty('criticalIssues')
    expect(stats).toHaveProperty('structuralIssues')
    expect(stats).toHaveProperty('avgFloors')
    expect(stats).toHaveProperty('totalFloorPlans')
    expect(stats).toHaveProperty('organizedPlans')
    expect(stats).toHaveProperty('chaoticPlans')
    expect(stats).toHaveProperty('buildingCode')
    expect(stats).toHaveProperty('overallGrade')
    expect(stats).toHaveProperty('structuralIntegrity')
  })

  it('handles empty file list', () => {
    const result = buildArchitectResult([], [], {})
    expect(result.blueprints.length).toBe(0)
    expect(result.floorPlans.length).toBe(0)
    expect(result.stats.structuralIntegrity).toBe(50)
  })

  it('buildingCode is valid', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const validCodes = ['passing', 'minor-violations', 'major-violations', 'condemned']
    expect(validCodes).toContain(result.stats.buildingCode)
  })

  it('overallGrade is valid', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const validGrades = ['skyscraper', 'office-building', 'house', 'shed', 'ruins']
    expect(validGrades).toContain(result.stats.overallGrade)
  })

  it('structural integrity is between 0-100', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    expect(result.stats.structuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(result.stats.structuralIntegrity).toBeLessThanOrEqual(100)
  })

  it('creates floor plans by directory', () => {
    const result = buildArchitectResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export const a = 1', 'export const b = 2', 'export const c = 3'],
      {},
    )
    expect(result.floorPlans.length).toBeGreaterThanOrEqual(2)
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatArchitectTable', () => {
  it('produces non-empty string', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const formatted = formatArchitectTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('contains blueprint information', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const formatted = formatArchitectTable(result, false)
    expect(formatted).toContain('Blueprint')
    expect(formatted).toContain('Statistic')
  })

  it('shows verbose output when verbose=true', () => {
    const files = Array.from({ length: 15 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'export const x = 1')
    const result = buildArchitectResult(files, contents, {})
    const verbose = formatArchitectTable(result, true)
    const nonVerbose = formatArchitectTable(result, false)
    expect(verbose.length).toBeGreaterThanOrEqual(nonVerbose.length)
  })
})

describe('formatArchitectJson', () => {
  it('produces valid JSON', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const json = formatArchitectJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('blueprints')
    expect(parsed).toHaveProperty('floorPlans')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('contains blueprint data', () => {
    const result = buildArchitectResult(['a.ts'], ['export const x = 1'], {})
    const json = formatArchitectJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.blueprints.length).toBe(1)
    expect(parsed.blueprints[0].file).toBe('a.ts')
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('architect integration', () => {
  it('handles realistic codebase', () => {
    const files = ['src/core/config.ts', 'src/utils/helpers.ts', 'src/types.ts']
    const contents = [
      "export interface AppConfig {\n  port: number\n  host: string\n}\nexport function loadConfig(): AppConfig {\n  return { port: 3000, host: 'localhost' }\n}\n",
      "import { AppConfig } from './config'\nexport function formatHost(cfg: AppConfig): string {\n  try {\n    return `${cfg.host}:${cfg.port}`\n  } catch(e) {\n    throw new Error('format failed')\n  }\n}\n",
      "export interface User {\n  id: number\n  name: string\n}\n",
    ]
    const result = buildArchitectResult(files, contents, {})
    expect(result.blueprints.length).toBe(3)
    expect(result.floorPlans.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalBlueprints).toBe(3)
  })

  it('handles messy codebase', () => {
    const messy = Array.from({ length: 30 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    const result = buildArchitectResult(['messy.ts'], [messy], {})
    expect(result.stats.totalIssues).toBeGreaterThan(0)
  })

  it('handles mixed quality codebase', () => {
    const files = ['clean.ts', 'messy.ts']
    const contents = [
      "// Well documented module\nimport { x } from 'y'\ninterface Config { val: number }\nexport function process(cfg: Config): number {\n  try { return cfg.val }\n  catch(e) { throw new Error('fail') }\n}\n",
      Array.from({ length: 25 }, (_, i) => `function fn${i}() { if (x) { if (y) { eval('bad') } } }`).join('\n'),
    ]
    const result = buildArchitectResult(files, contents, {})
    expect(result.blueprints.length).toBe(2)
    expect(result.stats.totalIssues).toBeGreaterThan(0)
  })

  it('all blueprints have valid grades', () => {
    const validGrades = ['masterwork', 'sound', 'adequate', 'substandard', 'condemned']
    const result = buildArchitectResult(['a.ts', 'b.ts'], ['export const x = 1', 'const y = 2'], {})
    for (const bp of result.blueprints) {
      expect(validGrades).toContain(bp.grade)
    }
  })

  it('all blueprints have valid structure types', () => {
    const validTypes = ['foundation', 'load-bearing', 'wall', 'partition', 'facade', 'decoration']
    const result = buildArchitectResult(['a.ts', 'b.ts'], ['export const x = 1', 'const y = 2'], {})
    for (const bp of result.blueprints) {
      expect(validTypes).toContain(bp.structure)
    }
  })

  it('recommendations reference actual issues', () => {
    const messy = Array.from({ length: 20 }, (_, i) => `export const item${i} = ${i}`).join('\n')
    const result = buildArchitectResult(['overloaded.ts'], [messy], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})
