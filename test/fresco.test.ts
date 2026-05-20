import { describe, expect, it } from 'vitest'

import {
  analyzeSurface,
  analyzeInterface,
  analyzeImplementation,
  analyzeFoundation,
  computeLayerSeparation,
  computeSurfaceAccuracy,
  computeStoryCoherence,
  detectLayerIssues,
  classifyGrade,
  computeLayerIntegrity,
  computeSurfaceFaithfulness,
  classifyCondition,
  classifyFrescoGrade,
  detectTechniques,
  generateRecommendations,
  buildFrescoResult,
  type FrescoLayer,
  type FrescoFile,
  type LayerIssue,
} from '../src/commands/fresco-helpers.js'

import { formatFrescoTable, formatFrescoJson } from '../src/commands/fresco-format-helpers.js'

// ─── analyzeSurface ─────────────────────────────────────────────────────────

describe('analyzeSurface', () => {
  it('returns a number between 0 and 100', () => {
    const result = analyzeSurface('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher score for documented exports', () => {
    const documented = analyzeSurface('/** docs */\nexport function foo(): number { return 1 }', 'a.ts')
    const bare = analyzeSurface('const x = 1', 'a.ts')
    expect(documented).toBeGreaterThan(bare)
  })

  it('gives bonus for return types', () => {
    const withReturn = analyzeSurface('export function f(): number { return 1 }', 'a.ts')
    const without = analyzeSurface('export function f() { return 1 }', 'a.ts')
    expect(withReturn).toBeGreaterThan(without)
  })

  it('gives bonus for param types', () => {
    const withParam = analyzeSurface('export function f(x: number) {}', 'a.ts')
    const without = analyzeSurface('export function f(x) {}', 'a.ts')
    expect(withParam).toBeGreaterThan(without)
  })

  it('penalizes default export with many exports', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function c() {}\nexport default {}'
    const result = analyzeSurface(code, 'a.ts')
    expect(result).toBeLessThan(100)
  })

  it('gives bonus for many exports', () => {
    const many = analyzeSurface('export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}\n', 'a.ts')
    const few = analyzeSurface('export function a() {}', 'a.ts')
    expect(many).toBeGreaterThan(few)
  })

  it('clamps to 100', () => {
    const code = [
      '/** docs */\nexport function f(): number { return 1 }',
      '/** docs */\nexport function g(): string { return "a" }',
      'export function h(): boolean { return true }',
      'export function i(x: number, y: string): void {}',
    ].join('\n')
    const result = analyzeSurface(code, 'a.ts')
    expect(result).toBeLessThanOrEqual(100)
  })

  it('clamps to 0 for very bad code', () => {
    const result = analyzeSurface('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
  })
})

// ─── analyzeInterface ───────────────────────────────────────────────────────

describe('analyzeInterface', () => {
  it('returns a number between 0 and 100', () => {
    const result = analyzeInterface('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher score for interfaces', () => {
    const withIface = analyzeInterface('interface Config { name: string }', 'a.ts')
    const without = analyzeInterface('const x = 1', 'a.ts')
    expect(withIface).toBeGreaterThan(without)
  })

  it('gives bonus for type aliases', () => {
    const withType = analyzeInterface('type Result = string | number', 'a.ts')
    const without = analyzeInterface('const x = 1', 'a.ts')
    expect(withType).toBeGreaterThan(without)
  })

  it('gives bonus for generics', () => {
    const withGeneric = analyzeInterface('type Box<T> = { value: T }\ntype Result<T> = { data: T }', 'a.ts')
    const without = analyzeInterface('const x = 1', 'a.ts')
    expect(withGeneric).toBeGreaterThan(without)
  })

  it('gives bonus for documented types', () => {
    const doc = analyzeInterface('/** config */\ninterface Config { name: string }', 'a.ts')
    const noDoc = analyzeInterface('interface Config { name: string }', 'a.ts')
    expect(doc).toBeGreaterThan(noDoc)
  })

  it('gives bonus for readonly', () => {
    const withReadonly = analyzeInterface('interface Config { readonly name: string }', 'a.ts')
    const without = analyzeInterface('interface Config { name: string }', 'a.ts')
    expect(withReadonly).toBeGreaterThan(without)
  })

  it('gives bonus for union types', () => {
    const withUnion = analyzeInterface('type Status = active | inactive', 'a.ts')
    const without = analyzeInterface('type Status = string', 'a.ts')
    expect(withUnion).toBeGreaterThan(without)
  })

  it('penalizes no interfaces or types', () => {
    const result = analyzeInterface('const x = 1', 'a.ts')
    expect(result).toBeLessThanOrEqual(55)
  })
})

// ─── analyzeImplementation ──────────────────────────────────────────────────

describe('analyzeImplementation', () => {
  it('returns a number between 0 and 100', () => {
    const result = analyzeImplementation('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives bonus for error handling', () => {
    const withErr = analyzeImplementation('try { x() } catch(e) { log(e) }', 'a.ts')
    const without = analyzeImplementation('x()', 'a.ts')
    expect(withErr).toBeGreaterThan(without)
  })

  it('gives bonus for async', () => {
    const withAsync = analyzeImplementation('async function f() { await g() }', 'a.ts')
    const without = analyzeImplementation('function f() { g() }', 'a.ts')
    expect(withAsync).toBeGreaterThan(without)
  })

  it('gives bonus for const', () => {
    const withConst = analyzeImplementation('const x = 1', 'a.ts')
    const without = analyzeImplementation('var x = 1', 'a.ts')
    expect(withConst).toBeGreaterThan(without)
  })

  it('penalizes long lines', () => {
    const longLine = 'const x = "' + 'a'.repeat(200) + '"'
    const result = analyzeImplementation(longLine, 'a.ts')
    expect(result).toBeLessThanOrEqual(70)
  })

  it('penalizes any type', () => {
    const withAny = analyzeImplementation('function f(x: any) {}', 'a.ts')
    const without = analyzeImplementation('function f(x: number) {}', 'a.ts')
    expect(withAny).toBeLessThan(without)
  })

  it('gives bonus for comments', () => {
    const withComment = analyzeImplementation('// comment\nconst x = 1', 'a.ts')
    const without = analyzeImplementation('const x = 1', 'a.ts')
    expect(withComment).toBeGreaterThan(without)
  })

  it('penalizes deep nesting', () => {
    const deep = 'function f() { { { { { { { } } } } } } }'
    const result = analyzeImplementation(deep, 'a.ts')
    expect(result).toBeLessThanOrEqual(60)
  })
})

// ─── analyzeFoundation ──────────────────────────────────────────────────────

describe('analyzeFoundation', () => {
  it('returns a number between 0 and 100', () => {
    const result = analyzeFoundation('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives bonus for helpers', () => {
    const withHelper = analyzeFoundation('function util(x: number): number { return x * 2 }', 'a.ts')
    const without = analyzeFoundation('const x = 1', 'a.ts')
    expect(withHelper).toBeGreaterThan(without)
  })

  it('gives bonus for pure functions', () => {
    const pure = analyzeFoundation('function clean(s: string): string { return s.trim() }', 'a.ts')
    const impure = analyzeFoundation('const arr = [1,2]; arr.push(3)', 'a.ts')
    expect(pure).toBeGreaterThan(impure)
  })

  it('gives bonus for exports', () => {
    const withExport = analyzeFoundation('export function f() {}', 'a.ts')
    const without = analyzeFoundation('function f() {}', 'a.ts')
    expect(withExport).toBeGreaterThan(without)
  })

  it('gives bonus for types', () => {
    const withType = analyzeFoundation('function f(x: number): string { return String(x) }', 'a.ts')
    const without = analyzeFoundation('function f(x) { return String(x) }', 'a.ts')
    expect(withType).toBeGreaterThan(without)
  })

  it('gives bonus for tests', () => {
    const withTest = analyzeFoundation('export function f() {}\ntest("works", () => { expect(1).toBe(1) })', 'a.ts')
    const without = analyzeFoundation('export function f() {}', 'a.ts')
    expect(withTest).toBeGreaterThan(without)
  })

  it('gives bonus for many helpers', () => {
    const many = analyzeFoundation('function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\n', 'a.ts')
    const few = analyzeFoundation('function a() {}', 'a.ts')
    expect(many).toBeGreaterThan(few)
  })
})

// ─── computeLayerSeparation ─────────────────────────────────────────────────

describe('computeLayerSeparation', () => {
  it('returns a number between 0 and 100', () => {
    const result = computeLayerSeparation('')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher score with exports and privates and interfaces', () => {
    const mixed = computeLayerSeparation('interface A {}\nfunction internal() {}\nexport function public(a: A) {}')
    const onlyExport = computeLayerSeparation('export function f() {}')
    expect(mixed).toBeGreaterThan(onlyExport)
  })

  it('gives bonus for interfaces with exports', () => {
    const withIface = computeLayerSeparation('interface A {}\nexport function f(a: A) {}')
    const without = computeLayerSeparation('export function f(a: any) {}')
    expect(withIface).toBeGreaterThan(without)
  })

  it('penalizes internal leak', () => {
    const leaking = computeLayerSeparation('let state = {}; export function getState() { return state }')
    const clean = computeLayerSeparation('export function getState() { return {} }')
    expect(leaking).toBeLessThanOrEqual(clean)
  })

  it('gives bonus for access modifiers', () => {
    const withMods = computeLayerSeparation('class A { public method() {} private helper() {} }')
    const without = computeLayerSeparation('class A { method() {} helper() {} }')
    expect(withMods).toBeGreaterThan(without)
  })
})

// ─── computeSurfaceAccuracy ─────────────────────────────────────────────────

describe('computeSurfaceAccuracy', () => {
  it('returns 100 when scores are equal', () => {
    expect(computeSurfaceAccuracy(80, 80)).toBe(100)
  })

  it('decreases with larger gaps', () => {
    const small = computeSurfaceAccuracy(80, 70)
    const large = computeSurfaceAccuracy(80, 40)
    expect(small).toBeGreaterThan(large)
  })

  it('clamps to 0', () => {
    const result = computeSurfaceAccuracy(0, 100)
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('clamps to 100', () => {
    const result = computeSurfaceAccuracy(50, 50)
    expect(result).toBeLessThanOrEqual(100)
  })
})

// ─── computeStoryCoherence ──────────────────────────────────────────────────

describe('computeStoryCoherence', () => {
  it('returns a number between 0 and 100', () => {
    const result = computeStoryCoherence('')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives bonus for moderate comments', () => {
    const lines = ['// comment', '// another', '// third', 'export function process() {}', 'const x = 1', 'const y = 2', 'const z = 3', 'const a = 4', 'const b = 5', 'const c = 6']
    const moderate = computeStoryCoherence(lines.join('\n'))
    const noComment = computeStoryCoherence('export function process() {}\nconst x = 1\nconst y = 2\nconst z = 3\nconst a = 4\nconst b = 5\nconst c = 6\nconst d = 7\nconst e = 8\nconst f = 9')
    expect(moderate).toBeGreaterThan(noComment)
  })

  it('gives bonus for JSDoc', () => {
    const withJsdoc = computeStoryCoherence('/** docs */\nexport function processData() {}\nconst x = 1\nconst y = 2\nconst z = 3')
    const without = computeStoryCoherence('export function processData() {}\nconst x = 1\nconst y = 2\nconst z = 3')
    expect(withJsdoc).toBeGreaterThan(without)
  })

  it('gives bonus for named exports', () => {
    const withExports = computeStoryCoherence('export function process() {}')
    const without = computeStoryCoherence('function process() {}')
    expect(withExports).toBeGreaterThan(without)
  })

  it('gives bonus for logical flow', () => {
    const withFlow = computeStoryCoherence('if (x) { y() } else { z() }')
    const without = computeStoryCoherence('const x = 1')
    expect(withFlow).toBeGreaterThan(without)
  })

  it('gives bonus for descriptive names', () => {
    const descriptive = computeStoryCoherence('function processData() {}')
    const short = computeStoryCoherence('function f() {}')
    expect(descriptive).toBeGreaterThan(short)
  })
})

// ─── detectLayerIssues ──────────────────────────────────────────────────────

describe('detectLayerIssues', () => {
  it('returns an array', () => {
    const result = detectLayerIssues('', 'a.ts')
    expect(Array.isArray(result)).toBe(true)
  })

  it('detects missing interface layer for large files with exports', () => {
    const lines = Array(35).fill('export function f() {}')
    const code = lines.join('\n')
    const issues = detectLayerIssues(code, 'a.ts')
    const missing = issues.find(i => i.type === 'missing-layer')
    expect(missing).toBeDefined()
    expect(missing?.severity).toBe('major')
  })

  it('detects bleed-through from any type', () => {
    const code = 'function f(x: any) { return x }'
    const issues = detectLayerIssues(code, 'a.ts')
    const bleed = issues.find(i => i.type === 'bleed-through' && i.severity === 'major')
    expect(bleed).toBeDefined()
  })

  it('detects crack from internal in export', () => {
    const code = 'export const client = new Database()'
    const issues = detectLayerIssues(code, 'a.ts')
    const crack = issues.find(i => i.type === 'crack')
    expect(crack).toBeDefined()
    expect(crack?.severity).toBe('structural')
  })

  it('detects peeling from exported any', () => {
    const code = 'export function f(x: any): any { return x }'
    const issues = detectLayerIssues(code, 'a.ts')
    const peeling = issues.find(i => i.type === 'peeling')
    expect(peeling).toBeDefined()
  })

  it('detects overpainting from too many exports', () => {
    const exports = Array(20).fill(0).map((_, i) => `export function f${i}() {}`).join('\n')
    const issues = detectLayerIssues(exports, 'a.ts')
    const overpainting = issues.find(i => i.type === 'overpainting')
    expect(overpainting).toBeDefined()
    expect(overpainting?.severity).toBe('minor')
  })

  it('detects underpainting for files with no exports and no imports', () => {
    const code = 'const x = 1\nconst y = 2\nconst z = 3\nconst a = 4\nconst b = 5\nconst c = 6'
    const issues = detectLayerIssues(code, 'a.ts')
    const under = issues.find(i => i.type === 'underpainting')
    expect(under).toBeDefined()
  })

  it('detects wrong-pigment for misleading names', () => {
    const code = 'function isActive(x: number) { return x }'
    const issues = detectLayerIssues(code, 'a.ts')
    const wrong = issues.find(i => i.type === 'wrong-pigment')
    expect(wrong).toBeDefined()
    expect(wrong?.severity).toBe('cosmetic')
  })

  it('detects cosmetic bleed-through from console.log with exports', () => {
    const code = 'export function f() { console.log("hi") }'
    const issues = detectLayerIssues(code, 'a.ts')
    const bleed = issues.find(i => i.type === 'bleed-through' && i.severity === 'cosmetic')
    expect(bleed).toBeDefined()
  })

  it('returns no issues for clean code', () => {
    const code = 'export function f(x: number): number { return x * 2 }'
    const issues = detectLayerIssues(code, 'a.ts')
    expect(issues.length).toBe(0)
  })

  it('each issue has required fields', () => {
    const code = 'function isValid(x: number) { return x }'
    const issues = detectLayerIssues(code, 'a.ts')
    for (const issue of issues) {
      expect(issue).toHaveProperty('type')
      expect(issue).toHaveProperty('file')
      expect(issue).toHaveProperty('layer')
      expect(issue).toHaveProperty('severity')
      expect(issue).toHaveProperty('description')
      expect(issue).toHaveProperty('fix')
    }
  })
})

// ─── classifyGrade ──────────────────────────────────────────────────────────

describe('classifyGrade', () => {
  it('returns masterwork for high quality and no issues', () => {
    expect(classifyGrade(80, 80, 0)).toBe('masterwork')
  })

  it('returns gallery for good quality and 1 issue', () => {
    expect(classifyGrade(70, 70, 1)).toBe('gallery')
  })

  it('returns studio for medium quality', () => {
    expect(classifyGrade(60, 50, 2)).toBe('studio')
  })

  it('returns student for low quality', () => {
    expect(classifyGrade(35, 35, 5)).toBe('student')
  })

  it('returns graffiti for very low quality', () => {
    expect(classifyGrade(10, 10, 10)).toBe('graffiti')
  })

  it('masterwork requires no issues', () => {
    expect(classifyGrade(90, 90, 1)).not.toBe('masterwork')
  })

  it('gallery requires at most 1 issue', () => {
    expect(classifyGrade(70, 70, 2)).not.toBe('gallery')
  })
})

// ─── computeLayerIntegrity ──────────────────────────────────────────────────

describe('computeLayerIntegrity', () => {
  it('returns 50 for empty layers', () => {
    expect(computeLayerIntegrity([], [])).toBe(50)
  })

  it('returns 100 when all layers intact with no structural issues', () => {
    const layers: FrescoLayer[] = [
      { name: 'surface', files: [], symbols: 0, quality: 80, coverage: 100, isIntact: true, issues: [] },
    ]
    const result = computeLayerIntegrity(layers, [])
    expect(result).toBe(100)
  })

  it('penalizes broken layers', () => {
    const intact: FrescoLayer[] = [
      { name: 'surface', files: [], symbols: 0, quality: 80, coverage: 100, isIntact: true, issues: [] },
    ]
    const broken: FrescoLayer[] = [
      { name: 'surface', files: [], symbols: 0, quality: 80, coverage: 100, isIntact: false, issues: [] },
    ]
    expect(computeLayerIntegrity(intact, [])).toBeGreaterThan(computeLayerIntegrity(broken, []))
  })

  it('penalizes structural issues', () => {
    const structuralIssue: LayerIssue = { type: 'crack', file: 'a.ts', layer: 'surface', severity: 'structural', description: 'test', fix: 'test' }
    const filesWithIssues: FrescoFile[] = [{
      file: 'a.ts', surfaceQuality: 80, interfaceQuality: 70, implementationQuality: 60,
      foundationQuality: 50, layerSeparation: 70, surfaceAccuracy: 80, storyCoherence: 60,
      issues: [structuralIssue], grade: 'studio',
    }]
    const layers: FrescoLayer[] = [
      { name: 'surface', files: [], symbols: 0, quality: 80, coverage: 100, isIntact: true, issues: [] },
    ]
    const result = computeLayerIntegrity(layers, filesWithIssues)
    expect(result).toBeLessThan(100)
  })
})

// ─── computeSurfaceFaithfulness ─────────────────────────────────────────────

describe('computeSurfaceFaithfulness', () => {
  it('returns 50 for empty files', () => {
    expect(computeSurfaceFaithfulness([])).toBe(50)
  })

  it('averages surface accuracy', () => {
    const files: FrescoFile[] = [
      { file: 'a.ts', surfaceQuality: 80, interfaceQuality: 70, implementationQuality: 60, foundationQuality: 50, layerSeparation: 70, surfaceAccuracy: 80, storyCoherence: 60, issues: [], grade: 'gallery' },
      { file: 'b.ts', surfaceQuality: 60, interfaceQuality: 50, implementationQuality: 40, foundationQuality: 30, layerSeparation: 50, surfaceAccuracy: 60, storyCoherence: 40, issues: [], grade: 'studio' },
    ]
    expect(computeSurfaceFaithfulness(files)).toBe(70)
  })
})

// ─── classifyCondition ──────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns pristine for high scores', () => {
    expect(classifyCondition(90, 90)).toBe('pristine')
  })

  it('returns well-preserved for good scores', () => {
    expect(classifyCondition(70, 70)).toBe('well-preserved')
  })

  it('returns restored for medium scores', () => {
    expect(classifyCondition(55, 55)).toBe('restored')
  })

  it('returns weathered for low scores', () => {
    expect(classifyCondition(35, 35)).toBe('weathered')
  })

  it('returns damaged for very low scores', () => {
    expect(classifyCondition(10, 10)).toBe('damaged')
  })
})

// ─── classifyFrescoGrade ────────────────────────────────────────────────────

describe('classifyFrescoGrade', () => {
  it('returns Sistine-Chapel for high integrity and pristine condition', () => {
    expect(classifyFrescoGrade(85, 'pristine')).toBe('Sistine-Chapel')
  })

  it('returns Sistine-Chapel for well-preserved too', () => {
    expect(classifyFrescoGrade(85, 'well-preserved')).toBe('Sistine-Chapel')
  })

  it('returns gallery-piece for good integrity', () => {
    expect(classifyFrescoGrade(70, 'restored')).toBe('gallery-piece')
  })

  it('gallery-piece excludes damaged', () => {
    expect(classifyFrescoGrade(70, 'damaged')).not.toBe('gallery-piece')
  })

  it('returns studio-work for medium integrity', () => {
    expect(classifyFrescoGrade(50, 'restored')).toBe('studio-work')
  })

  it('studio-work excludes weathered and damaged', () => {
    expect(classifyFrescoGrade(50, 'weathered')).not.toBe('studio-work')
  })

  it('returns student-art for low integrity', () => {
    expect(classifyFrescoGrade(30, 'weathered')).toBe('student-art')
  })

  it('returns vandalism for very low integrity', () => {
    expect(classifyFrescoGrade(10, 'damaged')).toBe('vandalism')
  })
})

// ─── detectTechniques ───────────────────────────────────────────────────────

describe('detectTechniques', () => {
  it('returns empty array for no files', () => {
    expect(detectTechniques([], [])).toEqual([])
  })

  it('detects buon-fresco for interfaces', () => {
    const techniques = detectTechniques(['a.ts'], ['interface Config { name: string }'])
    expect(techniques.find(t => t.name === 'buon-fresco')).toBeDefined()
  })

  it('detects secco for functional files', () => {
    const techniques = detectTechniques(['a.ts'], ['export function f() {}'])
    const secco = techniques.find(t => t.name === 'secco')
    expect(secco).toBeDefined()
  })

  it('detects sgraffito for class files', () => {
    const techniques = detectTechniques(['a.ts'], ['class Widget { render() {} }'])
    const sgraffito = techniques.find(t => t.name === 'sgraffito')
    expect(sgraffito).toBeDefined()
  })

  it('detects mezzo-fresco for utility constants', () => {
    const techniques = detectTechniques(['a.ts'], ['export const VERSION = "1.0"'])
    const mezzo = techniques.find(t => t.name === 'mezzo-fresco')
    expect(mezzo).toBeDefined()
  })

  it('detects mezzo-fresco for const arrow functions', () => {
    const techniques = detectTechniques(['a.ts'], ['export const fn = () => {}'])
    const mezzo = techniques.find(t => t.name === 'mezzo-fresco')
    expect(mezzo).toBeDefined()
  })

  it('gives higher quality for many interface files', () => {
    const few = detectTechniques(['a.ts'], ['interface A {}'])
    const many = detectTechniques(['a.ts', 'b.ts', 'c.ts'], ['interface A {}', 'interface B {}', 'interface C {}'])
    const fewQ = few.find(t => t.name === 'buon-fresco')?.quality ?? 0
    const manyQ = many.find(t => t.name === 'buon-fresco')?.quality ?? 0
    expect(manyQ).toBeGreaterThan(fewQ)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns empty array for healthy codebase', () => {
    const layers: FrescoLayer[] = [
      { name: 'surface', files: [], symbols: 0, quality: 80, coverage: 100, isIntact: true, issues: [] },
    ]
    const files: FrescoFile[] = [{
      file: 'a.ts', surfaceQuality: 80, interfaceQuality: 70, implementationQuality: 60,
      foundationQuality: 50, layerSeparation: 70, surfaceAccuracy: 80, storyCoherence: 60,
      issues: [], grade: 'masterwork',
    }]
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 80, avgInterfaceQuality: 70, avgImplementationQuality: 60,
      avgFoundationQuality: 50, avgLayerSeparation: 70, avgSurfaceAccuracy: 80,
      avgStoryCoherence: 60, masterworkFiles: 1, graffitiFiles: 0,
      layerIntegrity: 80, surfaceFaithfulness: 80, overallCondition: 'pristine' as const,
      frescoGrade: 'Sistine-Chapel' as const,
    }
    const recs = generateRecommendations(layers, files, stats)
    expect(recs.length).toBe(0)
  })

  it('recommends fixing structural issues', () => {
    const structuralIssue: LayerIssue = { type: 'crack', file: 'a.ts', layer: 'surface', severity: 'structural', description: 'test', fix: 'test' }
    const files: FrescoFile[] = [{
      file: 'a.ts', surfaceQuality: 40, interfaceQuality: 30, implementationQuality: 30,
      foundationQuality: 30, layerSeparation: 40, surfaceAccuracy: 40, storyCoherence: 30,
      issues: [structuralIssue], grade: 'student',
    }]
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 1, structuralIssues: 1, cosmeticIssues: 0,
      avgSurfaceQuality: 40, avgInterfaceQuality: 30, avgImplementationQuality: 30,
      avgFoundationQuality: 30, avgLayerSeparation: 40, avgSurfaceAccuracy: 40,
      avgStoryCoherence: 30, masterworkFiles: 0, graffitiFiles: 0,
      layerIntegrity: 40, surfaceFaithfulness: 40, overallCondition: 'weathered' as const,
      frescoGrade: 'student-art' as const,
    }
    const recs = generateRecommendations([], files, stats)
    expect(recs.some(r => r.includes('structural'))).toBe(true)
  })

  it('recommends fixing graffiti files', () => {
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 20, avgInterfaceQuality: 20, avgImplementationQuality: 20,
      avgFoundationQuality: 20, avgLayerSeparation: 20, avgSurfaceAccuracy: 20,
      avgStoryCoherence: 20, masterworkFiles: 0, graffitiFiles: 2,
      layerIntegrity: 20, surfaceFaithfulness: 20, overallCondition: 'damaged' as const,
      frescoGrade: 'vandalism' as const,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('graffiti'))).toBe(true)
  })

  it('recommends better separation when low', () => {
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 50, avgInterfaceQuality: 50, avgImplementationQuality: 50,
      avgFoundationQuality: 50, avgLayerSeparation: 30, avgSurfaceAccuracy: 50,
      avgStoryCoherence: 50, masterworkFiles: 0, graffitiFiles: 0,
      layerIntegrity: 50, surfaceFaithfulness: 50, overallCondition: 'restored' as const,
      frescoGrade: 'studio-work' as const,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('layer separation'))).toBe(true)
  })

  it('recommends better accuracy when low', () => {
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 50, avgInterfaceQuality: 50, avgImplementationQuality: 50,
      avgFoundationQuality: 50, avgLayerSeparation: 50, avgSurfaceAccuracy: 30,
      avgStoryCoherence: 50, masterworkFiles: 0, graffitiFiles: 0,
      layerIntegrity: 50, surfaceFaithfulness: 50, overallCondition: 'restored' as const,
      frescoGrade: 'studio-work' as const,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('surface accuracy'))).toBe(true)
  })

  it('recommends better coherence when low', () => {
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 50, avgInterfaceQuality: 50, avgImplementationQuality: 50,
      avgFoundationQuality: 50, avgLayerSeparation: 50, avgSurfaceAccuracy: 50,
      avgStoryCoherence: 30, masterworkFiles: 0, graffitiFiles: 0,
      layerIntegrity: 50, surfaceFaithfulness: 50, overallCondition: 'restored' as const,
      frescoGrade: 'studio-work' as const,
    }
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('coherence'))).toBe(true)
  })
})

// ─── buildFrescoResult ──────────────────────────────────────────────────────

describe('buildFrescoResult', () => {
  it('returns result with correct structure', () => {
    const result = buildFrescoResult([], [], {})
    expect(result).toHaveProperty('layers')
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('techniques')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('returns 4 layers', () => {
    const result = buildFrescoResult([], [], {})
    expect(result.layers).toHaveLength(4)
    const names = result.layers.map(l => l.name)
    expect(names).toContain('surface')
    expect(names).toContain('interface')
    expect(names).toContain('implementation')
    expect(names).toContain('foundation')
  })

  it('populates files correctly', () => {
    const result = buildFrescoResult(['a.ts'], ['export function f(): number { return 1 }'], {})
    expect(result.files).toHaveLength(1)
    expect(result.files[0].file).toBe('a.ts')
    expect(result.files[0].surfaceQuality).toBeGreaterThan(0)
    expect(result.files[0].layerSeparation).toBeGreaterThan(0)
  })

  it('computes stats correctly', () => {
    const result = buildFrescoResult(['a.ts'], ['export function f(): number { return 1 }'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalLayers).toBe(4)
    expect(result.stats.avgSurfaceQuality).toBeGreaterThan(0)
  })

  it('detects techniques from content', () => {
    const result = buildFrescoResult(
      ['a.ts', 'b.ts'],
      ['interface Config { name: string }', 'export function f() {}'],
      {},
    )
    expect(result.techniques.length).toBeGreaterThan(0)
  })

  it('handles multiple files', () => {
    const result = buildFrescoResult(
      ['a.ts', 'b.ts'],
      ['export function f() {}', 'interface A {}'],
      {},
    )
    expect(result.files).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(2)
  })

  it('assigns grades to files', () => {
    const result = buildFrescoResult(['a.ts'], ['export function f(): number { return 1 }'], {})
    expect(result.files[0].grade).toBeDefined()
  })
})

// ─── formatFrescoTable ──────────────────────────────────────────────────────

describe('formatFrescoTable', () => {
  it('returns a string', () => {
    const result = buildFrescoResult([], [], {})
    const formatted = formatFrescoTable(result, false)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildFrescoResult(['a.ts'], ['export function f() {}'], {})
    const formatted = formatFrescoTable(result, false)
    expect(formatted).toContain('Layers')
    expect(formatted).toContain('Files')
  })

  it('shows techniques when present', () => {
    const result = buildFrescoResult(['a.ts'], ['interface A {}'], {})
    const formatted = formatFrescoTable(result, false)
    expect(formatted).toContain('Techniques')
  })

  it('shows no files message when empty', () => {
    const result = buildFrescoResult([], [], {})
    const formatted = formatFrescoTable(result, false)
    expect(formatted).toContain('No files analyzed')
  })

  it('respects verbose flag', () => {
    const files = Array(15).fill('a.ts')
    const contents = Array(15).fill('export function f() {}')
    const result = buildFrescoResult(files, contents, {})
    const nonVerbose = formatFrescoTable(result, false)
    const verbose = formatFrescoTable(result, true)
    expect(verbose.length).toBeGreaterThan(nonVerbose.length)
  })

  it('shows recommendations when present', () => {
    const result = buildFrescoResult([], [], {})
    const stats = {
      totalFiles: 1, totalLayers: 4, totalIssues: 0, structuralIssues: 0, cosmeticIssues: 0,
      avgSurfaceQuality: 20, avgInterfaceQuality: 20, avgImplementationQuality: 20,
      avgFoundationQuality: 20, avgLayerSeparation: 20, avgSurfaceAccuracy: 20,
      avgStoryCoherence: 20, masterworkFiles: 0, graffitiFiles: 2,
      layerIntegrity: 20, surfaceFaithfulness: 20, overallCondition: 'damaged' as const,
      frescoGrade: 'vandalism' as const,
    }
    result.stats = stats
    result.recommendations = generateRecommendations(result.layers, result.files, stats)
    const formatted = formatFrescoTable(result, false)
    expect(formatted).toContain('Recommendations')
  })
})

// ─── formatFrescoJson ───────────────────────────────────────────────────────

describe('formatFrescoJson', () => {
  it('returns valid JSON', () => {
    const result = buildFrescoResult([], [], {})
    const json = formatFrescoJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains layers in JSON', () => {
    const result = buildFrescoResult([], [], {})
    const parsed = JSON.parse(formatFrescoJson(result))
    expect(parsed).toHaveProperty('layers')
    expect(parsed.layers).toHaveLength(4)
  })

  it('contains stats in JSON', () => {
    const result = buildFrescoResult(['a.ts'], ['export function f() {}'], {})
    const parsed = JSON.parse(formatFrescoJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
