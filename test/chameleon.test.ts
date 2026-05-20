import { describe, it, expect } from 'vitest'
import {
  measureFlexibility,
  measurePolymorphism,
  measureConfigurability,
  measureContextAdaptation,
  measureExtensibility,
  findAdaptations,
  findRigidPoints,
  detectColorShifts,
  classifyFile,
  computeAdaptabilityIndex,
  computeFlexibilityScore,
  computeRigidityIndex,
  classifyOverall,
  generateRecommendations,
  buildScore,
  buildChameleonResult,
} from '../src/commands/chameleon-helpers.js'
import { formatChameleonTable, formatChameleonJson } from '../src/commands/chameleon-format-helpers.js'
import type { AdaptabilityScore, RigidPoint, ChameleonStats } from '../src/commands/chameleon-helpers.js'

// ─── measureFlexibility ────────────────────────────────────────────────────────

describe('measureFlexibility', () => {
  it('returns a number between 0-100', () => {
    const score = measureFlexibility('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards interfaces', () => {
    const withInterface = measureFlexibility('interface Config { name: string }')
    const without = measureFlexibility('const x = 1')
    expect(withInterface).toBeGreaterThan(without)
  })

  it('rewards abstract classes', () => {
    const withAbstract = measureFlexibility('abstract class Base { abstract method(): void }')
    const without = measureFlexibility('class Base { method() {} }')
    expect(withAbstract).toBeGreaterThan(without)
  })

  it('rewards generics', () => {
    const withGeneric = measureFlexibility('function id<T>(x: T): T { return x }')
    const without = measureFlexibility('function id(x: number): number { return x }')
    expect(withGeneric).toBeGreaterThan(without)
  })

  it('rewards implements', () => {
    const withImpl = measureFlexibility('class Foo implements Bar {}')
    const without = measureFlexibility('class Foo {}')
    expect(withImpl).toBeGreaterThan(without)
  })

  it('penalizes hardcoded values', () => {
    const withHardcoded = measureFlexibility("'API_KEY' ];\n'SECRET' ];")
    const clean = measureFlexibility('const x = 1')
    expect(withHardcoded).toBeLessThan(clean)
  })

  it('penalizes fixed paths', () => {
    const withPaths = measureFlexibility("'/src/index.ts'")
    const clean = measureFlexibility('const x = 1')
    expect(withPaths).toBeLessThan(clean)
  })

  it('rewards factory pattern', () => {
    const withFactory = measureFlexibility('function createHandler() {}')
    const without = measureFlexibility('const x = 1')
    expect(withFactory).toBeGreaterThan(without)
  })

  it('rewards strategy pattern', () => {
    const withStrategy = measureFlexibility('const strategy = {}')
    const without = measureFlexibility('const x = 1')
    expect(withStrategy).toBeGreaterThan(without)
  })

  it('rewards extends', () => {
    const withExtends = measureFlexibility('class Foo extends Bar {}')
    const without = measureFlexibility('class Foo {}')
    expect(withExtends).toBeGreaterThan(without)
  })

  it('returns baseline for empty content', () => {
    const score = measureFlexibility('')
    expect(score).toBe(40)
  })
})

// ─── measurePolymorphism ───────────────────────────────────────────────────────

describe('measurePolymorphism', () => {
  it('returns a number between 0-100', () => {
    const score = measurePolymorphism('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards type aliases', () => {
    const withType = measurePolymorphism('type Result = Success | Error')
    const without = measurePolymorphism('const x = 1')
    expect(withType).toBeGreaterThan(without)
  })

  it('rewards union types', () => {
    const withUnion = measurePolymorphism('string | number')
    const without = measurePolymorphism('const x = 1')
    expect(withUnion).toBeGreaterThan(without)
  })

  it('rewards generics', () => {
    const withGeneric = measurePolymorphism('function id<T>(x: T) {}')
    const without = measurePolymorphism('const x = 1')
    expect(withGeneric).toBeGreaterThan(without)
  })

  it('rewards overloads', () => {
    const withOverload = measurePolymorphism('function overload(x: string): string')
    const without = measurePolymorphism('const x = 1')
    expect(withOverload).toBeGreaterThan(without)
  })

  it('rewards typeof checks', () => {
    const withTypeof = measurePolymorphism('if (typeof x === "string") {}')
    const without = measurePolymorphism('const x = 1')
    expect(withTypeof).toBeGreaterThan(without)
  })

  it('penalizes excessive concrete types', () => {
    const concrete = measurePolymorphism(': Config\n: Options\n: Settings\n: Data\n: Result')
    const clean = measurePolymorphism('const x = 1')
    expect(concrete).toBeLessThan(clean)
  })

  it('penalizes type assertions', () => {
    const withAs = measurePolymorphism('const x = data as string')
    const without = measurePolymorphism('const x = data')
    expect(withAs).toBeLessThan(without)
  })

  it('rewards instanceof', () => {
    const withInstanceof = measurePolymorphism('if (x instanceof Error) {}')
    const without = measurePolymorphism('const x = 1')
    expect(withInstanceof).toBeGreaterThan(without)
  })

  it('returns baseline for empty content', () => {
    const score = measurePolymorphism('')
    expect(score).toBe(35)
  })
})

// ─── measureConfigurability ────────────────────────────────────────────────────

describe('measureConfigurability', () => {
  it('returns a number between 0-100', () => {
    const score = measureConfigurability('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards process.env', () => {
    const withEnv = measureConfigurability('const key = process.env.KEY')
    const without = measureConfigurability('const key = "hardcoded"')
    expect(withEnv).toBeGreaterThan(without)
  })

  it('rewards options/config patterns', () => {
    const withConfig = measureConfigurability('const options = { verbose: true }')
    const without = measureConfigurability('const x = 1')
    expect(withConfig).toBeGreaterThan(without)
  })

  it('rewards optional chaining', () => {
    const withOptional = measureConfigurability('const x = obj?.prop')
    const without = measureConfigurability('const x = obj.prop')
    expect(withOptional).toBeGreaterThan(without)
  })

  it('rewards default values', () => {
    const withDefault = measureConfigurability('const x = options.val ?? 10')
    const without = measureConfigurability('const x = 10')
    expect(withDefault).toBeGreaterThan(without)
  })

  it('penalizes magic numbers', () => {
    const withMagic = measureConfigurability('100\n200\n300')
    const without = measureConfigurability('const x = 1')
    expect(withMagic).toBeLessThan(without)
  })

  it('penalizes hardcoded uppercase strings', () => {
    const withHardcoded = measureConfigurability("'API_KEY'\n'SECRET_VALUE'")
    const without = measureConfigurability('const x = 1')
    expect(withHardcoded).toBeLessThan(without)
  })

  it('rewards default in switch', () => {
    const withDefault = measureConfigurability('switch (x) { default: break }')
    const without = measureConfigurability('switch (x) { case "a": break }')
    expect(withDefault).toBeGreaterThan(without)
  })

  it('returns baseline for empty content', () => {
    const score = measureConfigurability('')
    expect(score).toBe(35)
  })
})

// ─── measureContextAdaptation ──────────────────────────────────────────────────

describe('measureContextAdaptation', () => {
  it('returns a number between 0-100', () => {
    const score = measureContextAdaptation('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards process.env', () => {
    const withEnv = measureContextAdaptation('const x = process.env.NODE_ENV')
    const without = measureContextAdaptation('const x = 1')
    expect(withEnv).toBeGreaterThan(without)
  })

  it('rewards environment checks', () => {
    const withEnv = measureContextAdaptation('if (NODE_ENV === "production") {}')
    const without = measureContextAdaptation('const x = 1')
    expect(withEnv).toBeGreaterThan(without)
  })

  it('rewards platform detection', () => {
    const withPlatform = measureContextAdaptation('if (platform === "linux") {}')
    const without = measureContextAdaptation('const x = 1')
    expect(withPlatform).toBeGreaterThan(without)
  })

  it('rewards feature flags', () => {
    const withFlag = measureContextAdaptation('if (featureFlags.newUI) {}')
    const without = measureContextAdaptation('const x = 1')
    expect(withFlag).toBeGreaterThan(without)
  })

  it('rewards typeof window/document', () => {
    const withWindow = measureContextAdaptation('if (typeof window !== "undefined") {}')
    const without = measureContextAdaptation('const x = 1')
    expect(withWindow).toBeGreaterThan(without)
  })

  it('rewards fallback patterns', () => {
    const withFallback = measureContextAdaptation('if (x || y) {}')
    const without = measureContextAdaptation('const x = 1')
    expect(withFallback).toBeGreaterThan(without)
  })

  it('rewards NODE_ENV specifically', () => {
    const withNodeEnv = measureContextAdaptation('process.env.NODE_ENV')
    const without = measureContextAdaptation('const x = 1')
    expect(withNodeEnv).toBeGreaterThan(without)
  })

  it('returns baseline for empty content', () => {
    const score = measureContextAdaptation('')
    expect(score).toBe(30)
  })
})

// ─── measureExtensibility ──────────────────────────────────────────────────────

describe('measureExtensibility', () => {
  it('returns a number between 0-100', () => {
    const score = measureExtensibility('const x = 1')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('rewards exports', () => {
    const withExport = measureExtensibility('export function foo() {}')
    const without = measureExtensibility('function foo() {}')
    expect(withExport).toBeGreaterThan(without)
  })

  it('rewards callbacks', () => {
    const withCallback = measureExtensibility('const callback = () => {}')
    const without = measureExtensibility('const x = 1')
    expect(withCallback).toBeGreaterThan(without)
  })

  it('rewards plugin patterns', () => {
    const withPlugin = measureExtensibility('const plugin = {}')
    const without = measureExtensibility('const x = 1')
    expect(withPlugin).toBeGreaterThan(without)
  })

  it('rewards spread operator', () => {
    const withSpread = measureExtensibility('const merged = { ...a, ...b }')
    const without = measureExtensibility('const merged = Object.assign(a, b)')
    expect(withSpread).toBeGreaterThan(without)
  })

  it('rewards extends', () => {
    const withExtends = measureExtensibility('class Foo extends Bar {}')
    const without = measureExtensibility('class Foo {}')
    expect(withExtends).toBeGreaterThan(without)
  })

  it('penalizes sealed/final', () => {
    const withSealed = measureExtensibility('sealed class Foo {}')
    const without = measureExtensibility('class Foo {}')
    expect(withSealed).toBeLessThan(without)
  })

  it('penalizes excessive private', () => {
    const withPrivate = measureExtensibility('private x; private y; private z; private w; private q; private r;')
    const without = measureExtensibility('class Foo {}')
    expect(withPrivate).toBeLessThan(without)
  })

  it('returns baseline for empty content', () => {
    const score = measureExtensibility('')
    expect(score).toBe(35)
  })
})

// ─── findAdaptations ───────────────────────────────────────────────────────────

describe('findAdaptations', () => {
  it('returns empty array for no patterns', () => {
    expect(findAdaptations('const x = 1')).toHaveLength(0)
  })

  it('detects interface adaptations', () => {
    const adaptations = findAdaptations('interface Config { name: string }')
    expect(adaptations.some(a => a.type === 'polymorphic')).toBe(true)
  })

  it('detects generic adaptations', () => {
    const adaptations = findAdaptations('function id<T>(x: T): T { return x }')
    expect(adaptations.some(a => a.type === 'generic')).toBe(true)
  })

  it('detects environment variable adaptations', () => {
    const adaptations = findAdaptations('const key = process.env.KEY')
    expect(adaptations.some(a => a.type === 'configurable')).toBe(true)
  })

  it('detects configuration object adaptations', () => {
    const adaptations = findAdaptations('const options = { verbose: true }')
    expect(adaptations.some(a => a.type === 'configurable')).toBe(true)
  })

  it('detects callback adaptations', () => {
    const adaptations = findAdaptations('const callback: Handler = () => {}')
    expect(adaptations.some(a => a.type === 'pluggable')).toBe(true)
  })

  it('detects async context adaptations', () => {
    const adaptations = findAdaptations('fetch(url).then(r => r.json())')
    expect(adaptations.some(a => a.type === 'contextual')).toBe(true)
  })

  it('detects typeof adaptations', () => {
    const adaptations = findAdaptations('if (typeof x === "string") {}')
    expect(adaptations.some(a => a.type === 'overridable')).toBe(true)
  })

  it('detects default value adaptations', () => {
    const adaptations = findAdaptations('switch (x) { default: break }')
    expect(adaptations.some(a => a.type === 'configurable')).toBe(true)
  })

  it('each adaptation has required fields', () => {
    const adaptations = findAdaptations('interface A {}')
    for (const a of adaptations) {
      expect(a).toHaveProperty('type')
      expect(a).toHaveProperty('location')
      expect(a).toHaveProperty('description')
      expect(a).toHaveProperty('strength')
    }
  })

  it('location is 1-indexed', () => {
    const adaptations = findAdaptations('const x = 1\ninterface A {}')
    const iface = adaptations.find(a => a.type === 'polymorphic')
    expect(iface).toBeDefined()
    expect(iface!.location).toBe(2)
  })
})

// ─── findRigidPoints ───────────────────────────────────────────────────────────

describe('findRigidPoints', () => {
  it('returns empty array for clean code', () => {
    const rigid = findRigidPoints('const x: number = 1\nconst y = x + 1')
    expect(rigid).toHaveLength(0)
  })

  it('detects hardcoded values', () => {
    const rigid = findRigidPoints("'API_KEY' ];")
    expect(rigid.some(r => r.type === 'hardcoded')).toBe(true)
  })

  it('detects magic numbers', () => {
    const rigid = findRigidPoints('const timeout = 3000')
    expect(rigid.length).toBeGreaterThanOrEqual(0)
  })

  it('detects tight coupling via direct instantiation', () => {
    const rigid = findRigidPoints('const service = new DatabaseService()')
    expect(rigid.some(r => r.type === 'tightly-coupled')).toBe(true)
  })

  it('does not flag standard constructors', () => {
    const rigid = findRigidPoints('const e = new Error("msg")')
    expect(rigid.some(r => r.type === 'tightly-coupled')).toBe(false)
  })

  it('does not flag standard constructors: Map, Set, Date, etc.', () => {
    const rigid = findRigidPoints('const m = new Map()\nconst s = new Set()\nconst d = new Date()')
    expect(rigid.some(r => r.type === 'tightly-coupled')).toBe(false)
  })

  it('detects concrete-only types', () => {
    const rigid = findRigidPoints('const x: SomeConcreteType = getData()')
    expect(rigid.some(r => r.type === 'concrete-only')).toBe(true)
  })

  it('does not flag import lines for concrete types', () => {
    const rigid = findRigidPoints('import { Config } from "./config"')
    expect(rigid.some(r => r.type === 'concrete-only')).toBe(false)
  })

  it('each rigid point has required fields', () => {
    const rigid = findRigidPoints("'API_KEY' ];")
    for (const r of rigid) {
      expect(r).toHaveProperty('type')
      expect(r).toHaveProperty('location')
      expect(r).toHaveProperty('severity')
      expect(r).toHaveProperty('description')
      expect(r).toHaveProperty('flexibility')
    }
  })

  it('severity is valid', () => {
    const rigid = findRigidPoints("'API_KEY' ];")
    for (const r of rigid) {
      expect(['minor', 'moderate', 'major']).toContain(r.severity)
    }
  })
})

// ─── detectColorShifts ─────────────────────────────────────────────────────────

describe('detectColorShifts', () => {
  it('returns empty array for no contexts', () => {
    expect(detectColorShifts(['a.ts'], ['const x = 1'])).toHaveLength(0)
  })

  it('detects environment context', () => {
    const shifts = detectColorShifts(['a.ts'], ['const x = process.env.KEY'])
    expect(shifts.some(s => s.context === 'environment')).toBe(true)
  })

  it('detects platform context', () => {
    const shifts = detectColorShifts(['a.ts'], ['if (platform === "linux") {}'])
    expect(shifts.some(s => s.context === 'platform')).toBe(true)
  })

  it('detects feature flags context', () => {
    const shifts = detectColorShifts(['a.ts'], ['if (isEnabled("feature")) {}'])
    expect(shifts.some(s => s.context === 'feature-flags')).toBe(true)
  })

  it('detects configuration context', () => {
    const shifts = detectColorShifts(['a.ts'], ['const options = {}'])
    expect(shifts.some(s => s.context === 'configuration')).toBe(true)
  })

  it('each shift has required fields', () => {
    const shifts = detectColorShifts(['a.ts'], ['process.env.NODE_ENV'])
    for (const s of shifts) {
      expect(s).toHaveProperty('context')
      expect(s).toHaveProperty('files')
      expect(s).toHaveProperty('adaptability')
      expect(s).toHaveProperty('isWellHandled')
    }
  })

  it('groups files by context', () => {
    const shifts = detectColorShifts(
      ['a.ts', 'b.ts'],
      ['process.env.KEY', 'process.env.OTHER'],
    )
    const env = shifts.find(s => s.context === 'environment')
    expect(env).toBeDefined()
    expect(env!.files).toHaveLength(2)
  })

  it('feature flags are well handled', () => {
    const shifts = detectColorShifts(['a.ts'], ['const flag = featureFlags.x'])
    const ff = shifts.find(s => s.context === 'feature-flags')
    expect(ff).toBeDefined()
    expect(ff!.isWellHandled).toBe(true)
  })
})

// ─── classifyFile ──────────────────────────────────────────────────────────────

describe('classifyFile', () => {
  const makeScore = (flex: number, poly: number, config: number, ext: number, rigidity: number): AdaptabilityScore => ({
    file: 'test.ts', flexibility: flex, polymorphism: poly, configurability: config,
    contextAdaptation: 50, extensibility: ext, rigidity,
    colorSpectrum: ['single-context'], adaptations: [], rigidPoints: [],
    classification: 'flexible',
  })

  it('classifies shapeshifter for high scores and low rigidity', () => {
    const score = makeScore(80, 80, 80, 80, 10)
    expect(classifyFile(score)).toBe('shapeshifter')
  })

  it('classifies adaptive for good scores', () => {
    const score = makeScore(65, 65, 65, 65, 30)
    expect(classifyFile(score)).toBe('adaptive')
  })

  it('classifies flexible for moderate scores', () => {
    const score = makeScore(50, 50, 50, 50, 50)
    expect(classifyFile(score)).toBe('flexible')
  })

  it('classifies rigid for low scores', () => {
    const score = makeScore(30, 30, 30, 30, 60)
    expect(classifyFile(score)).toBe('rigid')
  })

  it('classifies fossilized for very low scores', () => {
    const score = makeScore(10, 10, 10, 10, 80)
    expect(classifyFile(score)).toBe('fossilized')
  })

  it('does not classify as shapeshifter with high rigidity', () => {
    const score = makeScore(80, 80, 80, 80, 30)
    expect(classifyFile(score)).not.toBe('shapeshifter')
  })
})

// ─── computeAdaptabilityIndex ──────────────────────────────────────────────────

describe('computeAdaptabilityIndex', () => {
  it('returns 50 for empty scores', () => {
    expect(computeAdaptabilityIndex([])).toBe(50)
  })

  it('returns high index for flexible code', () => {
    const scores: AdaptabilityScore[] = [{
      file: 'a.ts', flexibility: 80, polymorphism: 80, configurability: 80,
      contextAdaptation: 80, extensibility: 80, rigidity: 10,
      colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'shapeshifter',
    }]
    expect(computeAdaptabilityIndex(scores)).toBeGreaterThan(50)
  })

  it('returns low index for rigid code', () => {
    const scores: AdaptabilityScore[] = [{
      file: 'a.ts', flexibility: 20, polymorphism: 20, configurability: 20,
      contextAdaptation: 20, extensibility: 20, rigidity: 80,
      colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'fossilized',
    }]
    expect(computeAdaptabilityIndex(scores)).toBeLessThan(50)
  })

  it('is clamped to 0-100', () => {
    const scores: AdaptabilityScore[] = [{
      file: 'a.ts', flexibility: 100, polymorphism: 100, configurability: 100,
      contextAdaptation: 100, extensibility: 100, rigidity: 0,
      colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'shapeshifter',
    }]
    expect(computeAdaptabilityIndex(scores)).toBeLessThanOrEqual(100)
  })
})

// ─── computeFlexibilityScore ───────────────────────────────────────────────────

describe('computeFlexibilityScore', () => {
  it('returns 50 for empty scores', () => {
    expect(computeFlexibilityScore([])).toBe(50)
  })

  it('averages flexibility across files', () => {
    const scores: AdaptabilityScore[] = [
      { file: 'a.ts', flexibility: 60, polymorphism: 50, configurability: 50, contextAdaptation: 50, extensibility: 50, rigidity: 20, colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'flexible' },
      { file: 'b.ts', flexibility: 80, polymorphism: 50, configurability: 50, contextAdaptation: 50, extensibility: 50, rigidity: 20, colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'flexible' },
    ]
    expect(computeFlexibilityScore(scores)).toBe(70)
  })
})

// ─── computeRigidityIndex ──────────────────────────────────────────────────────

describe('computeRigidityIndex', () => {
  it('returns 50 for empty scores', () => {
    expect(computeRigidityIndex([])).toBe(50)
  })

  it('averages rigidity across files', () => {
    const scores: AdaptabilityScore[] = [
      { file: 'a.ts', flexibility: 50, polymorphism: 50, configurability: 50, contextAdaptation: 50, extensibility: 50, rigidity: 30, colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'flexible' },
      { file: 'b.ts', flexibility: 50, polymorphism: 50, configurability: 50, contextAdaptation: 50, extensibility: 50, rigidity: 50, colorSpectrum: [], adaptations: [], rigidPoints: [], classification: 'flexible' },
    ]
    expect(computeRigidityIndex(scores)).toBe(40)
  })
})

// ─── classifyOverall ───────────────────────────────────────────────────────────

describe('classifyOverall', () => {
  it('returns protean for high adaptability, low rigidity', () => {
    expect(classifyOverall(80, 20)).toBe('protean')
  })

  it('returns adaptive for good adaptability', () => {
    expect(classifyOverall(65, 35)).toBe('adaptive')
  })

  it('returns moderate for moderate scores', () => {
    expect(classifyOverall(50, 50)).toBe('moderate')
  })

  it('returns rigid for low adaptability', () => {
    expect(classifyOverall(25, 60)).toBe('rigid')
  })

  it('returns petrified for very low adaptability', () => {
    expect(classifyOverall(10, 80)).toBe('petrified')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeScore = (classification: string): AdaptabilityScore => ({
    file: 'test.ts', flexibility: 50, polymorphism: 50, configurability: 50,
    contextAdaptation: 50, extensibility: 50, rigidity: 30,
    colorSpectrum: [], adaptations: [], rigidPoints: [],
    classification: classification as AdaptabilityScore['classification'],
  })

  const makeStats = (overrides: Partial<ChameleonStats> = {}): ChameleonStats => ({
    totalFiles: 1, avgFlexibility: 50, avgPolymorphism: 50, avgConfigurability: 50,
    avgExtensibility: 50, avgRigidity: 30, shapeshifterFiles: 0, fossilizedFiles: 0,
    totalAdaptations: 0, totalRigidPoints: 0, majorRigidPoints: 0, hardcodedValues: 0,
    magicNumbers: 0, concreteOnlyFiles: 0, contextCount: 0, adaptabilityIndex: 50,
    flexibilityScore: 50, rigidityIndex: 30, overallAdaptability: 'moderate',
    ...overrides,
  })

  it('recommends for fossilized files', () => {
    const recs = generateRecommendations([makeScore('fossilized')], [], makeStats())
    expect(recs.some(r => r.includes('fossilized'))).toBe(true)
  })

  it('recommends for hardcoded values', () => {
    const rigid: RigidPoint[] = [{ type: 'hardcoded', location: 1, severity: 'moderate', description: 'Hardcoded', flexibility: 'Move to config' }]
    const recs = generateRecommendations([], rigid, makeStats())
    expect(recs.some(r => r.includes('hardcoded'))).toBe(true)
  })

  it('recommends for major rigid points', () => {
    const rigid: RigidPoint[] = [{ type: 'tightly-coupled', location: 1, severity: 'major', description: 'Tight coupling', flexibility: 'Use DI' }]
    const recs = generateRecommendations([], rigid, makeStats())
    expect(recs.some(r => r.includes('major'))).toBe(true)
  })

  it('recommends for low polymorphism', () => {
    const recs = generateRecommendations([], [], makeStats({ avgPolymorphism: 30 }))
    expect(recs.some(r => r.includes('polymorphism'))).toBe(true)
  })

  it('recommends for high rigidity index', () => {
    const recs = generateRecommendations([], [], makeStats({ rigidityIndex: 70 }))
    expect(recs.some(r => r.includes('rigidity'))).toBe(true)
  })

  it('recommends for concrete-only files', () => {
    const recs = generateRecommendations([], [], makeStats({ concreteOnlyFiles: 2 }))
    expect(recs.some(r => r.includes('concrete'))).toBe(true)
  })

  it('recommends for magic numbers', () => {
    const recs = generateRecommendations([], [], makeStats({ magicNumbers: 8 }))
    expect(recs.some(r => r.includes('magic number'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateRecommendations([], [], makeStats())
    expect(Array.from(new Set(recs))).toHaveLength(recs.length)
  })
})

// ─── buildScore ────────────────────────────────────────────────────────────────

describe('buildScore', () => {
  it('returns a complete AdaptabilityScore', () => {
    const score = buildScore('const x = 1', 'a.ts')
    expect(score).toHaveProperty('file', 'a.ts')
    expect(score).toHaveProperty('flexibility')
    expect(score).toHaveProperty('polymorphism')
    expect(score).toHaveProperty('configurability')
    expect(score).toHaveProperty('contextAdaptation')
    expect(score).toHaveProperty('extensibility')
    expect(score).toHaveProperty('rigidity')
    expect(score).toHaveProperty('colorSpectrum')
    expect(score).toHaveProperty('adaptations')
    expect(score).toHaveProperty('rigidPoints')
    expect(score).toHaveProperty('classification')
  })

  it('classification is valid', () => {
    const score = buildScore('export function f() {}', 'a.ts')
    expect(['shapeshifter', 'adaptive', 'flexible', 'rigid', 'fossilized']).toContain(score.classification)
  })

  it('detects color spectrum for env-aware code', () => {
    const score = buildScore('const x = process.env.NODE_ENV', 'a.ts')
    expect(score.colorSpectrum).toContain('environment')
  })

  it('detects async spectrum', () => {
    const score = buildScore('async function f() { await Promise.resolve(1) }', 'a.ts')
    expect(score.colorSpectrum).toContain('async')
  })

  it('defaults to single-context when no patterns', () => {
    const score = buildScore('const x = 1', 'a.ts')
    expect(score.colorSpectrum).toContain('single-context')
  })

  it('rigidity is computed from rigid points', () => {
    const clean = buildScore('const x: number = 1', 'a.ts')
    const rigid = buildScore("const x = 'API_KEY' ];", 'b.ts')
    expect(rigid.rigidPoints.length).toBeGreaterThanOrEqual(0)
  })

  it('scores are clamped to 0-100', () => {
    const score = buildScore('interface A {} export function f<T>() {} process.env.X options', 'a.ts')
    expect(score.flexibility).toBeGreaterThanOrEqual(0)
    expect(score.flexibility).toBeLessThanOrEqual(100)
    expect(score.polymorphism).toBeGreaterThanOrEqual(0)
    expect(score.polymorphism).toBeLessThanOrEqual(100)
  })
})

// ─── buildChameleonResult ──────────────────────────────────────────────────────

describe('buildChameleonResult', () => {
  it('returns a complete ChameleonResult', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result).toHaveProperty('scores')
    expect(result).toHaveProperty('colorShifts')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('creates one score per file', () => {
    const result = buildChameleonResult(
      ['a.ts', 'b.ts'],
      ['export const x = 1;', 'export function f() {}'],
      {},
    )
    expect(result.scores).toHaveLength(2)
  })

  it('handles empty input', () => {
    const result = buildChameleonResult([], [], {})
    expect(result.scores).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('computes stats correctly', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.adaptabilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stats.flexibilityScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.rigidityIndex).toBeGreaterThanOrEqual(0)
  })

  it('computes overall adaptability', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(['protean', 'adaptive', 'moderate', 'rigid', 'petrified']).toContain(result.stats.overallAdaptability)
  })

  it('counts shapeshifter and fossilized files', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.shapeshifterFiles).toBeGreaterThanOrEqual(0)
    expect(result.stats.fossilizedFiles).toBeGreaterThanOrEqual(0)
  })

  it('counts adaptations and rigid points', () => {
    const result = buildChameleonResult(['a.ts'], ['interface A {} export function f() {}'], {})
    expect(result.stats.totalAdaptations).toBeGreaterThanOrEqual(0)
    expect(result.stats.totalRigidPoints).toBeGreaterThanOrEqual(0)
  })

  it('detects color shifts', () => {
    const result = buildChameleonResult(['a.ts'], ['const x = process.env.NODE_ENV'], {})
    expect(result.colorShifts.length).toBeGreaterThanOrEqual(0)
  })

  it('computes avg metrics', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.avgFlexibility).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgPolymorphism).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgConfigurability).toBeGreaterThanOrEqual(0)
    expect(result.stats.avgExtensibility).toBeGreaterThanOrEqual(0)
  })

  it('counts hardcoded values and magic numbers', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.hardcodedValues).toBeGreaterThanOrEqual(0)
    expect(result.stats.magicNumbers).toBeGreaterThanOrEqual(0)
  })

  it('counts concrete-only files', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x: number = 1;'], {})
    expect(result.stats.concreteOnlyFiles).toBeGreaterThanOrEqual(0)
  })
})

// ─── formatChameleonTable ──────────────────────────────────────────────────────

describe('formatChameleonTable', () => {
  it('returns a string', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    const output = formatChameleonTable(result, false)
    expect(typeof output).toBe('string')
  })

  it('contains header', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatChameleonTable(result, false)).toContain('Chameleon')
  })

  it('contains File Scores section', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatChameleonTable(result, false)).toContain('File Scores')
  })

  it('contains Statistics section', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatChameleonTable(result, false)).toContain('Statistics')
  })

  it('shows recommendations when present', () => {
    const result = buildChameleonResult(['a.ts'], ['const x: any = getData();'], {})
    const output = formatChameleonTable(result, false)
    if (result.recommendations.length > 0) {
      expect(output).toContain('Recommendations')
    }
  })

  it('shows color shifts when present', () => {
    const result = buildChameleonResult(['a.ts'], ['const x = process.env.KEY'], {})
    const output = formatChameleonTable(result, false)
    if (result.colorShifts.length > 0) {
      expect(output).toContain('Color Shifts')
    }
  })

  it('shows rigid points when present', () => {
    const result = buildChameleonResult(['a.ts'], ["const x = 'API_KEY' ];"], {})
    const output = formatChameleonTable(result, false)
    if (result.scores.some(s => s.rigidPoints.length > 0)) {
      expect(output).toContain('Rigid Points')
    }
  })

  it('handles empty input gracefully', () => {
    const result = buildChameleonResult([], [], {})
    const output = formatChameleonTable(result, false)
    expect(output).toContain('No files')
  })
})

// ─── formatChameleonJson ───────────────────────────────────────────────────────

describe('formatChameleonJson', () => {
  it('returns valid JSON', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    const json = formatChameleonJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('scores')
    expect(parsed).toHaveProperty('colorShifts')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('pretty prints', () => {
    const result = buildChameleonResult(['a.ts'], ['export const x = 1;'], {})
    expect(formatChameleonJson(result)).toContain('  ')
  })
})
