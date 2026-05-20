import { describe, expect, it } from 'vitest'

import {
  buildPhilosopherResult,
  buildProfile,
  classifyEra,
  classifyProfile,
  computeWisdom,
  evaluatePrinciple,
  findViolations,
  generateRecommendations,
  type Principle,
  type PhilosophicalProfile,
  type PhilosopherResult,
} from '../src/commands/philosopher-helpers.js'
import { formatPhilosopherJson, formatPhilosopherTable } from '../src/commands/philosopher-format-helpers.js'

// ─── evaluatePrinciple ──────────────────────────────────────────────────────────

describe('evaluatePrinciple', () => {
  it("returns a score between 0-100 for Occam's Razor", () => {
    const score = evaluatePrinciple('const x = 1', 'a.ts', "Occam's Razor")
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('penalizes deep nesting for Occams Razor', () => {
    const deep = evaluatePrinciple('if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {} } } } } }', 'a.ts', "Occam's Razor")
    const flat = evaluatePrinciple('const x = 1', 'a.ts', "Occam's Razor")
    expect(flat).toBeGreaterThan(deep)
  })

  it('penalizes many functions for Single Responsibility', () => {
    const many = Array.from({ length: 20 }, (_, i) => `function fn${i}() {}`).join('\n')
    const few = 'function single() {}'
    const scoreMany = evaluatePrinciple(many, 'a.ts', 'Single Responsibility')
    const scoreFew = evaluatePrinciple(few, 'a.ts', 'Single Responsibility')
    expect(scoreFew).toBeGreaterThan(scoreMany)
  })

  it('rewards interfaces for Open/Closed', () => {
    const withInterface = evaluatePrinciple('interface Foo { bar(): void }\nexport class Impl implements Foo { bar() {} }', 'a.ts', 'Open/Closed')
    const without = evaluatePrinciple('const x = 1', 'a.ts', 'Open/Closed')
    expect(withInterface).toBeGreaterThan(without)
  })

  it('penalizes duplicate lines for DRY', () => {
    const dupes = '  return items.map(x => x.value)\n  return items.map(x => x.value)\n  return items.map(x => x.value)\n  return items.map(x => x.value)'
    const unique = 'const x = a()\nconst y = b()\nconst z = c()\nconst w = d()'
    const scoreDupes = evaluatePrinciple(dupes, 'a.ts', 'DRY')
    const scoreUnique = evaluatePrinciple(unique, 'a.ts', 'DRY')
    expect(scoreUnique).toBeGreaterThan(scoreDupes)
  })

  it('penalizes future/TODO for YAGNI', () => {
    const withFuture = evaluatePrinciple('// TODO: future feature\n// placeholder for later\nconst x = 1', 'a.ts', 'YAGNI')
    const clean = evaluatePrinciple('const x = 1', 'a.ts', 'YAGNI')
    expect(clean).toBeGreaterThan(withFuture)
  })

  it('penalizes magic numbers for Least Surprise', () => {
    const magic = evaluatePrinciple('const x = 42 + 3.14 + 100 + 999', 'a.ts', 'Least Surprise')
    const named = evaluatePrinciple('const x = MAX_AGE + PI + LIMIT + TIMEOUT', 'a.ts', 'Least Surprise')
    expect(named).toBeGreaterThan(magic)
  })

  it('rewards composition over inheritance', () => {
    const composition = evaluatePrinciple('const obj = { ...defaults, ...config }', 'a.ts', 'Composition over Inheritance')
    const inheritance = evaluatePrinciple('class Child extends Parent {}', 'a.ts', 'Composition over Inheritance')
    expect(composition).toBeGreaterThan(inheritance)
  })

  it('penalizes long chains for Law of Demeter', () => {
    const chained = evaluatePrinciple('obj.a.b.c.d.e()', 'a.ts', 'Law of Demeter')
    const simple = evaluatePrinciple('obj.a()', 'a.ts', 'Law of Demeter')
    expect(simple).toBeGreaterThan(chained)
  })

  it('rewards encapsulation patterns', () => {
    const encapsulated = evaluatePrinciple('private x: number\n#y: string\ninterface IService {}', 'a.ts', 'Encapsulation')
    const open = evaluatePrinciple('let x = 1\nlet y = 2', 'a.ts', 'Encapsulation')
    expect(encapsulated).toBeGreaterThan(open)
  })

  it('rewards error handling for Fail Fast', () => {
    const withTryCatch = evaluatePrinciple('try { work() } catch(e) { throw new Error("fail") }', 'a.ts', 'Fail Fast')
    const silent = evaluatePrinciple('work()', 'a.ts', 'Fail Fast')
    expect(withTryCatch).toBeGreaterThan(silent)
  })

  it('returns 50 for unknown principle', () => {
    const score = evaluatePrinciple('const x = 1', 'a.ts', 'Unknown Principle')
    expect(score).toBe(50)
  })
})

// ─── findViolations ─────────────────────────────────────────────────────────────

describe('findViolations', () => {
  it("detects deep nesting violations for Occam's Razor", () => {
    const deep = 'if (a) {\nif (b) {\nif (c) {\nif (d) {\nif (e) {\n}\n}\n}\n}\n}'
    const violations = findViolations(deep, 'a.ts', "Occam's Razor")
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0].principle).toBe("Occam's Razor")
  })

  it('detects many functions for Single Responsibility', () => {
    const many = Array.from({ length: 15 }, (_, i) => `function fn${i}() {}`).join('\n')
    const violations = findViolations(many, 'a.ts', 'Single Responsibility')
    expect(violations.length).toBeGreaterThan(0)
    expect(violations[0].severity).toBeTruthy()
  })

  it('detects no abstraction for Open/Closed', () => {
    const plain = 'function computeSomething(x) { const result = x * 2; return result + 1; }'
    const violations = findViolations(plain, 'a.ts', 'Open/Closed')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('detects duplicate lines for DRY', () => {
    const dupes = 'compute(x)\ncompute(x)\ncompute(x)'
    const violations = findViolations(dupes, 'a.ts', 'DRY')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('detects future code for YAGNI', () => {
    const future = '// future feature\nconst x = 1'
    const violations = findViolations(future, 'a.ts', 'YAGNI')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('detects eval for Least Surprise', () => {
    const withEval = "eval('dangerous')"
    const violations = findViolations(withEval, 'a.ts', 'Least Surprise')
    expect(violations.length).toBeGreaterThan(0)
    expect(violations.find(v => v.description.includes('eval'))).toBeTruthy()
  })

  it('detects excessive inheritance for Composition over Inheritance', () => {
    const deep = 'class A extends B {}\nclass C extends D {}\nclass E extends F {}'
    const violations = findViolations(deep, 'a.ts', 'Composition over Inheritance')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('detects deep chains for Law of Demeter', () => {
    const chained = 'obj.a.b.c.d.e'
    const violations = findViolations(chained, 'a.ts', 'Law of Demeter')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('detects async without catch for Fail Fast', () => {
    const asyncCode = 'async function run() { await fetch(url) }'
    const violations = findViolations(asyncCode, 'a.ts', 'Fail Fast')
    expect(violations.length).toBeGreaterThan(0)
  })

  it('returns empty for clean simple code', () => {
    const clean = 'const x = 1'
    const violations = findViolations(clean, 'a.ts', "Occam's Razor")
    expect(violations.length).toBe(0)
  })

  it('violations have correct structure', () => {
    const deep = 'if (a) { if (b) { if (c) { if (d) { if (e) {} } } } }'
    const violations = findViolations(deep, 'a.ts', "Occam's Razor")
    if (violations.length > 0) {
      const v = violations[0]
      expect(v).toHaveProperty('file')
      expect(v).toHaveProperty('line')
      expect(v).toHaveProperty('principle')
      expect(v).toHaveProperty('severity')
      expect(v).toHaveProperty('description')
      expect(v).toHaveProperty('lesson')
      expect(v).toHaveProperty('fix')
    }
  })
})

// ─── computeWisdom ──────────────────────────────────────────────────────────────

describe('computeWisdom', () => {
  it('computes average of scores', () => {
    expect(computeWisdom([80, 70, 90])).toBe(80)
  })

  it('returns 50 for empty array', () => {
    expect(computeWisdom([])).toBe(50)
  })

  it('returns the value for single score', () => {
    expect(computeWisdom([75])).toBe(75)
  })

  it('rounds to nearest integer', () => {
    expect(computeWisdom([80, 81])).toBe(81)
  })
})

// ─── classifyProfile ────────────────────────────────────────────────────────────

describe('classifyProfile', () => {
  it('classifies as sage for high wisdom and enlightenment', () => {
    expect(classifyProfile(85, true, [])).toBe('sage')
  })

  it('classifies as scholar for good wisdom', () => {
    expect(classifyProfile(72, false, [])).toBe('scholar')
  })

  it('classifies as seeker for moderate wisdom', () => {
    expect(classifyProfile(55, false, [])).toBe('seeker')
  })

  it('classifies as skeptic for low wisdom', () => {
    expect(classifyProfile(30, false, [])).toBe('skeptic')
  })

  it('classifies as heretic for multiple heresy violations', () => {
    const violations = [
      { file: 'a.ts', line: 1, principle: 'test', severity: 'heresy' as const, description: 'd', lesson: 'l', fix: 'f' },
      { file: 'a.ts', line: 2, principle: 'test', severity: 'heresy' as const, description: 'd', lesson: 'l', fix: 'f' },
    ]
    expect(classifyProfile(60, false, violations)).toBe('heretic')
  })

  it('classifies as heretic for single heresy even with moderate wisdom', () => {
    const violations = [
      { file: 'a.ts', line: 1, principle: 'test', severity: 'heresy' as const, description: 'd', lesson: 'l', fix: 'f' },
    ]
    expect(classifyProfile(30, false, violations)).toBe('heretic')
  })
})

// ─── classifyEra ────────────────────────────────────────────────────────────────

describe('classifyEra', () => {
  it('classifies enlightenment for high wisdom', () => {
    expect(classifyEra(90, 85)).toBe('enlightenment')
  })

  it('classifies renaissance for good wisdom', () => {
    expect(classifyEra(75, 65)).toBe('renaissance')
  })

  it('classifies classical for moderate wisdom', () => {
    expect(classifyEra(55, 55)).toBe('classical')
  })

  it('classifies medieval for low wisdom', () => {
    expect(classifyEra(35, 40)).toBe('medieval')
  })

  it('classifies barbaric for very low wisdom', () => {
    expect(classifyEra(15, 20)).toBe('barbaric')
  })
})

// ─── buildProfile ───────────────────────────────────────────────────────────────

describe('buildProfile', () => {
  it('returns a complete profile', () => {
    const profile = buildProfile('const x = 1', 'a.ts')
    expect(profile).toHaveProperty('file', 'a.ts')
    expect(profile).toHaveProperty('principleScores')
    expect(profile).toHaveProperty('wisdom')
    expect(profile).toHaveProperty('dominantVirtue')
    expect(profile).toHaveProperty('cardinalSin')
    expect(profile).toHaveProperty('isEnlightened')
    expect(profile).toHaveProperty('classification')
  })

  it('has 10 principle scores', () => {
    const profile = buildProfile('const x = 1', 'a.ts')
    expect(Object.keys(profile.principleScores).length).toBe(10)
  })

  it('wisdom is between 0-100', () => {
    const profile = buildProfile('const x = 1', 'a.ts')
    expect(profile.wisdom).toBeGreaterThanOrEqual(0)
    expect(profile.wisdom).toBeLessThanOrEqual(100)
  })

  it('dominantVirtue is a known principle', () => {
    const profile = buildProfile('const x = 1', 'a.ts')
    const knownPrinciples = [
      "Occam's Razor", 'Single Responsibility', 'Open/Closed', 'DRY', 'YAGNI',
      'Least Surprise', 'Composition over Inheritance', 'Law of Demeter', 'Encapsulation', 'Fail Fast',
    ]
    expect(knownPrinciples).toContain(profile.dominantVirtue)
  })

  it('cardinalSin is a known principle', () => {
    const profile = buildProfile('const x = 1', 'a.ts')
    const knownPrinciples = [
      "Occam's Razor", 'Single Responsibility', 'Open/Closed', 'DRY', 'YAGNI',
      'Least Surprise', 'Composition over Inheritance', 'Law of Demeter', 'Encapsulation', 'Fail Fast',
    ]
    expect(knownPrinciples).toContain(profile.cardinalSin)
  })

  it('classifies clean code favorably', () => {
    const clean = "import { x } from 'y'\ninterface Config { x: number }\nexport function process(cfg: Config) { return cfg.x }\n"
    const profile = buildProfile(clean, 'a.ts')
    expect(profile.classification).toMatch(/sage|scholar|seeker/)
  })

  it('classifies messy code unfavorably', () => {
    const messy = Array.from({ length: 30 }, (_, i) => `function fn${i}() { eval('x' + ${i}) }`).join('\n')
    const profile = buildProfile(messy, 'a.ts')
    expect(profile.wisdom).toBeLessThan(70)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends focusing on weakest principle', () => {
    const principles: Principle[] = [
      { name: 'Good', category: 'simplicity', description: 'd', philosopher: 'p', adherence: 90, violations: [], wisdoms: [] },
      { name: 'Bad', category: 'coupling', description: 'd', philosopher: 'p', adherence: 30, violations: [], wisdoms: [] },
    ]
    const profiles: PhilosophicalProfile[] = []
    const recs = generateRecommendations(principles, profiles, [])
    expect(recs.some(r => r.includes('Bad'))).toBe(true)
  })

  it('recommends education for heretic files', () => {
    const principles: Principle[] = [
      { name: 'Test', category: 'simplicity', description: 'd', philosopher: 'p', adherence: 80, violations: [], wisdoms: [] },
    ]
    const profiles: PhilosophicalProfile[] = [
      { file: 'a.ts', principleScores: {}, wisdom: 20, dominantVirtue: 'v', cardinalSin: 's', isEnlightened: false, classification: 'heretic' },
    ]
    const recs = generateRecommendations(principles, profiles, [])
    expect(recs.some(r => r.includes('heretic'))).toBe(true)
  })

  it('mentions maintaining strengths', () => {
    const principles: Principle[] = [
      { name: 'Strong', category: 'simplicity', description: 'd', philosopher: 'p', adherence: 95, violations: [], wisdoms: [] },
    ]
    const profiles: PhilosophicalProfile[] = []
    const recs = generateRecommendations(principles, profiles, [])
    expect(recs.some(r => r.includes('Strong'))).toBe(true)
  })

  it('mentions low-wisdom files', () => {
    const principles: Principle[] = [
      { name: 'Test', category: 'simplicity', description: 'd', philosopher: 'p', adherence: 80, violations: [], wisdoms: [] },
    ]
    const profiles: PhilosophicalProfile[] = [
      { file: 'a.ts', principleScores: {}, wisdom: 30, dominantVirtue: 'v', cardinalSin: 's', isEnlightened: false, classification: 'skeptic' },
    ]
    const recs = generateRecommendations(principles, profiles, [])
    expect(recs.some(r => r.includes('wisdom below 50'))).toBe(true)
  })

  it('returns deduplicated recommendations', () => {
    const principles: Principle[] = [
      { name: 'Test', category: 'simplicity', description: 'd', philosopher: 'p', adherence: 50, violations: [], wisdoms: [] },
    ]
    const profiles: PhilosophicalProfile[] = []
    const recs = generateRecommendations(principles, profiles, [])
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

// ─── buildPhilosopherResult ─────────────────────────────────────────────────────

describe('buildPhilosopherResult', () => {
  it('returns complete result structure', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    expect(result).toHaveProperty('principles')
    expect(result).toHaveProperty('profiles')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('has 10 principles', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    expect(result.principles.length).toBe(10)
  })

  it('has one profile per file', () => {
    const result = buildPhilosopherResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.profiles.length).toBe(2)
  })

  it('stats have all required fields', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const stats = result.stats
    expect(stats).toHaveProperty('totalPrinciples')
    expect(stats).toHaveProperty('avgAdherence')
    expect(stats).toHaveProperty('bestPrinciple')
    expect(stats).toHaveProperty('worstPrinciple')
    expect(stats).toHaveProperty('totalViolations')
    expect(stats).toHaveProperty('heresyViolations')
    expect(stats).toHaveProperty('sageFiles')
    expect(stats).toHaveProperty('hereticFiles')
    expect(stats).toHaveProperty('avgWisdom')
    expect(stats).toHaveProperty('enlightenmentRate')
    expect(stats).toHaveProperty('dominantVirtue')
    expect(stats).toHaveProperty('cardinalSin')
    expect(stats).toHaveProperty('overallWisdom')
    expect(stats).toHaveProperty('era')
  })

  it('handles empty file list', () => {
    const result = buildPhilosopherResult([], [], {})
    expect(result.principles.length).toBe(10)
    expect(result.profiles.length).toBe(0)
  })

  it('bestPrinciple has higher adherence than worstPrinciple', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const best = result.principles.find(p => p.name === result.stats.bestPrinciple)
    const worst = result.principles.find(p => p.name === result.stats.worstPrinciple)
    if (best && worst) {
      expect(best.adherence).toBeGreaterThanOrEqual(worst.adherence)
    }
  })

  it('principles have wisdoms array', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    for (const p of result.principles) {
      expect(Array.isArray(p.wisdoms)).toBe(true)
    }
  })

  it('era is a valid era', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const validEras = ['enlightenment', 'renaissance', 'classical', 'medieval', 'barbaric']
    expect(validEras).toContain(result.stats.era)
  })

  it('handles clean codebase', () => {
    const clean = "import { x } from 'y'\ninterface Config { x: number }\nexport function process(cfg: Config): number {\n  try {\n    return cfg.x\n  } catch(e) {\n    throw new Error('fail')\n  }\n}\n"
    const result = buildPhilosopherResult(['a.ts'], [clean], {})
    expect(result.stats.overallWisdom).toBeGreaterThan(50)
  })

  it('handles messy codebase', () => {
    const messy = Array.from({ length: 25 }, (_, i) => `function fn${i}() { eval('bad') }`).join('\n')
    const result = buildPhilosopherResult(['a.ts'], [messy], {})
    expect(result.stats.totalViolations).toBeGreaterThan(0)
  })

  it('computes enlightenmentRate correctly', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.enlightenmentRate).toBeGreaterThanOrEqual(0)
    expect(result.stats.enlightenmentRate).toBeLessThanOrEqual(100)
  })

  it('has valid classifications for all profiles', () => {
    const validClassifications = ['sage', 'scholar', 'seeker', 'skeptic', 'heretic']
    const result = buildPhilosopherResult(['a.ts', 'b.ts'], ['const x = 1', 'eval("bad")'], {})
    for (const p of result.profiles) {
      expect(validClassifications).toContain(p.classification)
    }
  })
})

// ─── Format Helpers ─────────────────────────────────────────────────────────────

describe('formatPhilosopherTable', () => {
  it('produces non-empty string', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatPhilosopherTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('contains principle names', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const formatted = formatPhilosopherTable(result, false)
    expect(formatted).toContain("Occam's Razor")
    expect(formatted).toContain('DRY')
    expect(formatted).toContain('YAGNI')
  })

  it('shows verbose profiles when verbose=true', () => {
    const files = Array.from({ length: 15 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => 'const x = 1')
    const result = buildPhilosopherResult(files, contents, {})
    const verbose = formatPhilosopherTable(result, true)
    const nonVerbose = formatPhilosopherTable(result, false)
    expect(verbose.length).toBeGreaterThanOrEqual(nonVerbose.length)
  })
})

describe('formatPhilosopherJson', () => {
  it('produces valid JSON', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const json = formatPhilosopherJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('principles')
    expect(parsed).toHaveProperty('profiles')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('contains all principles in JSON', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const json = formatPhilosopherJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.principles.length).toBe(10)
  })
})

// ─── Integration ────────────────────────────────────────────────────────────────

describe('philosopher integration', () => {
  it('handles realistic codebase', () => {
    const files = ['src/main.ts', 'src/utils.ts', 'src/types.ts']
    const contents = [
      "import { process } from './utils'\nimport { Config } from './types'\nexport function main(cfg: Config) {\n  try {\n    return process(cfg)\n  } catch(e) {\n    throw new Error('main failed')\n  }\n}\n",
      "import { Config } from './types'\nexport function process(cfg: Config): number {\n  return cfg.x\n}\n",
      "export interface Config {\n  x: number\n  y: string\n}\n",
    ]
    const result = buildPhilosopherResult(files, contents, {})
    expect(result.principles.length).toBe(10)
    expect(result.profiles.length).toBe(3)
    expect(result.stats.overallWisdom).toBeGreaterThan(40)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles heretic codebase', () => {
    const messy = [
      'eval("var x = " + userInput)',
      'obj.a.b.c.d.e.f.g.h.i.j.k',
      Array.from({ length: 30 }, (_, i) => `function fn${i}() { eval('bad') }`).join('\n'),
    ]
    const files = messy.map((_, i) => `bad${i}.ts`)
    const result = buildPhilosopherResult(files, messy, {})
    expect(result.stats.totalViolations).toBeGreaterThan(0)
    expect(result.stats.era).toMatch(/medieval|barbaric|classical/)
  })

  it('handles sage codebase', () => {
    const clean = [
      "import { Config } from './types'\nexport function process(cfg: Config): number {\n  try {\n    if (!cfg) throw new Error('missing')\n    return cfg.value\n  } catch(e) {\n    throw new Error('process failed')\n  }\n}\n",
    ]
    const result = buildPhilosopherResult(['clean.ts'], clean, {})
    expect(result.stats.overallWisdom).toBeGreaterThan(40)
  })

  it('all principle categories are present', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    const categories = Array.from(new Set(result.principles.map(p => p.category)))
    expect(categories).toContain('simplicity')
    expect(categories).toContain('coupling')
    expect(categories).toContain('cohesion')
    expect(categories).toContain('abstraction')
    expect(categories).toContain('surprise')
    expect(categories).toContain('composition')
  })

  it('violations reference correct file', () => {
    const result = buildPhilosopherResult(['a.ts'], ['const x = 1'], {})
    for (const p of result.principles) {
      for (const v of p.violations) {
        expect(v.file).toBe('a.ts')
      }
    }
  })

  it('multiple files produce aggregated stats', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      'interface Config { x: number }',
      'export function process(cfg: Config) { return cfg.x }',
      'try { work() } catch(e) { throw new Error("fail") }',
    ]
    const result = buildPhilosopherResult(files, contents, {})
    expect(result.stats.totalPrinciples).toBe(10)
    expect(result.profiles.length).toBe(3)
  })
})
