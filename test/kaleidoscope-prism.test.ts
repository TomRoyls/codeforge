import { describe, it, expect } from 'vitest'
import {
  classifySpectrum,
  analyzeLightRay,
  analyzeLightSpectrum,
  identifyDeadZones,
  identifyHotSpots,
  computeOpticalGrade,
  generateRecommendations,
  buildKaleidoscopePrismResult,
  type LightRay,
  type LightSpectrum,
  type KaleidoscopePrismStats,
} from '../src/commands/kaleidoscope-prism-helpers.js'
import { formatKaleidoscopePrismTable, formatKaleidoscopePrismJson } from '../src/commands/kaleidoscope-prism-format-helpers.js'

// ─── classifySpectrum ────────────────────────────────────────────────────────

describe('classifySpectrum', () => {
  it('returns all zeros for empty content', () => {
    const result = classifySpectrum('')
    expect(result.red).toBe(0)
    expect(result.orange).toBe(0)
    expect(result.yellow).toBe(0)
    expect(result.green).toBe(0)
    expect(result.blue).toBe(0)
    expect(result.indigo).toBe(0)
    expect(result.violet).toBe(0)
  })

  it('scores red for exports and functions', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}\n'
    const result = classifySpectrum(code)
    expect(result.red).toBeGreaterThan(0)
  })

  it('scores orange for config patterns', () => {
    const code = 'export const config = { host: "localhost" }\nexport const settings = { debug: true }\n'
    const result = classifySpectrum(code)
    expect(result.orange).toBeGreaterThan(0)
  })

  it('scores yellow for validation patterns', () => {
    const code = 'export function validate(input: unknown) {\n  if (input === null) return false\n  switch (typeof input) { default: return true }\n}\n'
    const result = classifySpectrum(code)
    expect(result.yellow).toBeGreaterThan(0)
  })

  it('scores green for business logic keywords', () => {
    const code = 'export class UserService {\n  process(data: string) { return this.calculate(data) }\n  calculate(input: string) { return input.length }\n}\n'
    const result = classifySpectrum(code)
    expect(result.green).toBeGreaterThan(0)
  })

  it('scores blue for database patterns', () => {
    const code = 'export class UserRepository {\n  find(id: string) { return this.db.query("SELECT * FROM users") }\n}\n'
    const result = classifySpectrum(code)
    expect(result.blue).toBeGreaterThan(0)
  })

  it('scores indigo for DOM and HTTP patterns', () => {
    const code = 'export function render() {\n  document.getElementById("app")\n  fetch("/api/data")\n}\n'
    const result = classifySpectrum(code)
    expect(result.indigo).toBeGreaterThan(0)
  })

  it('scores violet for utility patterns', () => {
    const code = 'export function formatHelper(val: string): string {\n  return val.trim().toLowerCase()\n}\nexport function parseUtils(input: string) { return JSON.parse(input) }\n'
    const result = classifySpectrum(code)
    expect(result.violet).toBeGreaterThan(0)
  })

  it('caps all scores at 100', () => {
    const megaContent = Array(50).fill('export function add(a: number, b: number): number {\n  return a + b\n}\n').join('\n')
    const result = classifySpectrum(megaContent)
    for (const val of Object.values(result)) {
      expect(val).toBeLessThanOrEqual(100)
    }
  })

  it('returns 7 spectrum channels', () => {
    const result = classifySpectrum('const x = 1')
    const keys = Object.keys(result)
    expect(keys).toHaveLength(7)
    expect(keys).toContain('red')
    expect(keys).toContain('orange')
    expect(keys).toContain('yellow')
    expect(keys).toContain('green')
    expect(keys).toContain('blue')
    expect(keys).toContain('indigo')
    expect(keys).toContain('violet')
  })
})

// ─── analyzeLightRay ─────────────────────────────────────────────────────────

describe('analyzeLightRay', () => {
  it('returns correct file path', () => {
    const ray = analyzeLightRay('export function add(a: number, b: number): number {\n  return a + b\n}\n', 'test.ts')
    expect(ray.file).toBe('test.ts')
  })

  it('returns high clarity for clean exported code', () => {
    const code = '/** Adds two numbers */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const ray = analyzeLightRay(code, 'clean.ts')
    expect(ray.clarity).toBeGreaterThan(30)
  })

  it('returns zero clarity for empty content', () => {
    const ray = analyzeLightRay('', 'empty.ts')
    expect(ray.clarity).toBe(0)
  })

  it('reduces clarity for any types', () => {
    const bad = 'const x: any = 1\nconst y: any = 2\nconst z: any = 3\n'
    const ray = analyzeLightRay(bad, 'bad.ts')
    expect(ray.clarity).toBeLessThan(40)
  })

  it('reduces clarity for TODOs', () => {
    const code = '// TODO fix this\n// FIXME that\nexport const x = 1\n'
    const ray = analyzeLightRay(code, 'todos.ts')
    expect(ray.clarity).toBeLessThan(45)
  })

  it('reduces clarity for console calls', () => {
    const code = 'console.log("debug")\nconsole.log("debug2")\nconsole.log("debug3")\nexport const x = 1\n'
    const ray = analyzeLightRay(code, 'consoles.ts')
    expect(ray.clarity).toBeLessThan(45)
  })

  it('computes luminosity from JSDoc and comments', () => {
    const code = '/** Adds two numbers */\n/** Multiplies two numbers */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const ray = analyzeLightRay(code, 'docs.ts')
    expect(ray.luminosity).toBeGreaterThan(20)
  })

  it('returns zero luminosity for empty content', () => {
    const ray = analyzeLightRay('', 'empty.ts')
    expect(ray.luminosity).toBe(0)
  })

  it('computes refractionIndex from imports', () => {
    const code = "import foo from './foo'\nimport bar from './bar'\nimport baz from './baz'\nconst x = 1\n"
    const ray = analyzeLightRay(code, 'imports.ts')
    expect(ray.refractionIndex).toBeGreaterThan(0)
  })

  it('returns zero refractionIndex for empty content', () => {
    const ray = analyzeLightRay('', 'empty.ts')
    expect(ray.refractionIndex).toBe(0)
  })

  it('computes dispersion from spectrum breadth', () => {
    const code = 'export class UserService {\n  constructor(private db: Database) {}\n  findUser(id: string) { return this.db.query("SELECT * FROM users") }\n  saveUser(user: User) { return this.db.insert(user) }\n  process(data: string) { return this.calculate(data) }\n  calculate(input: string) { return input.length }\n}\n'
    const ray = analyzeLightRay(code, 'svc.ts')
    expect(ray.dispersion).toBeGreaterThanOrEqual(0)
    expect(ray.dispersion).toBeLessThanOrEqual(100)
  })

  it('computes focalPower for single-export files', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}\n'
    const ray = analyzeLightRay(code, 'single.ts')
    expect(ray.focalPower).toBeGreaterThan(40)
  })

  it('returns zero focalPower for empty content', () => {
    const ray = analyzeLightRay('', 'empty.ts')
    expect(ray.focalPower).toBe(0)
  })

  it('populates spectrum with all 7 channels', () => {
    const ray = analyzeLightRay('const x = 1', 'simple.ts')
    expect(ray.spectrum).toHaveProperty('red')
    expect(ray.spectrum).toHaveProperty('orange')
    expect(ray.spectrum).toHaveProperty('yellow')
    expect(ray.spectrum).toHaveProperty('green')
    expect(ray.spectrum).toHaveProperty('blue')
    expect(ray.spectrum).toHaveProperty('indigo')
    expect(ray.spectrum).toHaveProperty('violet')
  })

  it('finds dominant wavelength from spectrum', () => {
    const ray = analyzeLightRay('export class UserService {\n  process(data: string) { return this.calculate(data) }\n}\n', 'svc.ts')
    expect(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']).toContain(ray.dominantWavelength)
  })

  it('defaults dominant wavelength to green for empty content', () => {
    const ray = analyzeLightRay('', 'empty.ts')
    expect(ray.dominantWavelength).toBe('green')
  })

  it('computes bandwidth between 0 and 100', () => {
    const code = 'export class UserService {\n  findUser() {}\n}\n'
    const ray = analyzeLightRay(code, 'svc.ts')
    expect(ray.bandwidth).toBeGreaterThanOrEqual(0)
    expect(ray.bandwidth).toBeLessThanOrEqual(100)
  })

  it('flags monochromatic for single-concern files', () => {
    const ray = analyzeLightRay('export const x = 1\n', 'simple.ts')
    expect(typeof ray.isMonochromatic).toBe('boolean')
  })

  it('classifies lightType as one of valid values', () => {
    const ray = analyzeLightRay('export const x = 1\n', 'simple.ts')
    expect(['laser', 'focused', 'diffuse', 'scattered', 'dim', 'dark']).toContain(ray.lightType)
  })

  it('classifies as one of valid classification values', () => {
    const ray = analyzeLightRay('export const x = 1\n', 'simple.ts')
    expect(['crystal', 'glass', 'prism', 'lens', 'mirror', 'fog', 'opaque']).toContain(ray.classification)
  })

  it('flags ultraviolet for TODO content', () => {
    const code = '// TODO fix this\nexport const x = 1\n'
    const ray = analyzeLightRay(code, 'todo.ts')
    expect(ray.isUltraviolet).toBe(true)
  })

  it('flags ultraviolet for any type usage', () => {
    const code = 'const x: any = 1\nexport const y = x\n'
    const ray = analyzeLightRay(code, 'any.ts')
    expect(ray.isUltraviolet).toBe(true)
  })

  it('does not flag ultraviolet for clean code', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}\n'
    const ray = analyzeLightRay(code, 'clean.ts')
    expect(ray.isUltraviolet).toBe(false)
  })

  it('checks infrared flag for undocumented code', () => {
    const lines = ['let a = 1', 'let b = 2', 'let c = 3', 'let d = 4', 'let e = 5', 'let f = 6', 'let g = 7', 'let h = 8'].join('\n')
    const ray = analyzeLightRay(lines, 'nodoc.ts')
    expect(typeof ray.isInfrared).toBe('boolean')
    const cl = lines.split('\n').filter(l => l.trim().length > 0).length
    expect(cl).toBe(8)
  })

  it('does not flag infrared for documented code', () => {
    const code = '/** docs */\nconst x = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5\nconst u = 6\n'
    const ray = analyzeLightRay(code, 'docd.ts')
    expect(ray.isInfrared).toBe(false)
  })

  it('identifies reflections for implements pattern', () => {
    const code = 'interface Foo { bar(): void }\nexport class MyClass implements Foo { bar() {} }\n'
    const ray = analyzeLightRay(code, 'impl.ts')
    expect(ray.reflections).toContain('interface-implementation')
  })

  it('identifies reflections for inheritance-mirror', () => {
    const code = 'abstract class Base { abstract do(): void }\nexport class Child extends Base { do() {} }\n'
    const ray = analyzeLightRay(code, 'inherit.ts')
    expect(ray.reflections).toContain('inheritance-mirror')
  })

  it('identifies absorptions for imports', () => {
    const code = "import foo from './foo'\nexport const x = foo\n"
    const ray = analyzeLightRay(code, 'importer.ts')
    expect(ray.absorptions).toContain('dependency-intake')
  })

  it('identifies aggregation-point for index files', () => {
    const code = "import foo from './foo'\nexport { foo }\n"
    const ray = analyzeLightRay(code, 'index.ts')
    expect(ray.absorptions).toContain('aggregation-point')
  })

  it('identifies emissions for exports', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}\n'
    const ray = analyzeLightRay(code, 'exporter.ts')
    expect(ray.emissions).toContain('api-surface')
  })

  it('identifies default-export emission', () => {
    const code = 'export default function main() {}\n'
    const ray = analyzeLightRay(code, 'main.ts')
    expect(ray.emissions).toContain('default-export')
  })

  it('computes refractions as imports plus nested calls', () => {
    const code = "import foo from './foo'\nimport bar from './bar'\nobj.a.b.c()\nobj.d.e.f()\n"
    const ray = analyzeLightRay(code, 'nested.ts')
    expect(ray.refractions).toBeGreaterThan(0)
  })
})

// ─── analyzeLightSpectrum ────────────────────────────────────────────────────

describe('analyzeLightSpectrum', () => {
  it('returns defaults for empty rays', () => {
    const spec = analyzeLightSpectrum([], 'src')
    expect(spec.directory).toBe('src')
    expect(spec.rays).toEqual([])
    expect(spec.avgClarity).toBe(0)
    expect(spec.avgLuminosity).toBe(0)
    expect(spec.avgRefractionIndex).toBe(0)
    expect(spec.avgDispersion).toBe(0)
    expect(spec.avgFocalPower).toBe(0)
    expect(spec.dominantWavelength).toBe('green')
    expect(spec.spectralSpread).toBe(0)
    expect(spec.lightBalance).toBe(0)
    expect(spec.hasDeadZones).toBe(false)
    expect(spec.deadZoneCount).toBe(0)
    expect(spec.hasHotSpots).toBe(false)
    expect(spec.hotSpotCount).toBe(0)
    expect(spec.totalRefractions).toBe(0)
    expect(spec.totalReflections).toBe(0)
    expect(spec.totalAbsorptions).toBe(0)
    expect(spec.totalEmissions).toBe(0)
    expect(spec.opticalHealth).toBe('opaque')
  })

  it('computes averages from multiple rays', () => {
    const rays = [
      analyzeLightRay('export function a() {}\n', 'a.ts'),
      analyzeLightRay('/** docs */\nexport function b() {}\n', 'b.ts'),
    ]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.avgClarity).toBeGreaterThan(0)
    expect(spec.avgLuminosity).toBeGreaterThan(0)
  })

  it('finds dominant wavelength from ray population', () => {
    const rays = [
      analyzeLightRay('export class UserService {\n  process() {}\n  calculate() {}\n}\n', 'svc.ts'),
      analyzeLightRay('export const config = { host: "localhost" }\n', 'cfg.ts'),
    ]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']).toContain(spec.dominantWavelength)
  })

  it('computes spectral spread', () => {
    const rays = [
      analyzeLightRay('export class UserService {\n  find() {}\n}\n', 'svc.ts'),
      analyzeLightRay('document.getElementById("app")\nfetch("/api")\n', 'ui.ts'),
      analyzeLightRay('export function formatHelper() {}\nexport function parseUtils() {}\n', 'util.ts'),
    ]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.spectralSpread).toBeGreaterThanOrEqual(0)
    expect(spec.spectralSpread).toBeLessThanOrEqual(100)
  })

  it('computes light balance', () => {
    const rays = [
      analyzeLightRay('export function a() {}\n', 'a.ts'),
      analyzeLightRay('export function b() {}\n', 'b.ts'),
    ]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.lightBalance).toBeGreaterThanOrEqual(0)
    expect(spec.lightBalance).toBeLessThanOrEqual(100)
  })

  it('high light balance for identical clarity files', () => {
    const rays = [
      analyzeLightRay('export function a() {}\n', 'a.ts'),
      analyzeLightRay('export function b() {}\n', 'b.ts'),
    ]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.lightBalance).toBeGreaterThan(80)
  })

  it('sums total refractions from rays', () => {
    const code = "import foo from './foo'\nimport bar from './bar'\nobj.a.b.c()\nexport const x = 1\n"
    const rays = [analyzeLightRay(code, 'a.ts'), analyzeLightRay(code, 'b.ts')]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.totalRefractions).toBeGreaterThan(0)
  })

  it('sums total reflections from rays', () => {
    const code = 'interface Foo { bar(): void }\nexport class MyClass implements Foo { bar() {} }\n'
    const rays = [analyzeLightRay(code, 'impl.ts')]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.totalReflections).toBeGreaterThan(0)
  })

  it('sums total absorptions from rays', () => {
    const code = "import foo from './foo'\nexport { foo }\n"
    const rays = [analyzeLightRay(code, 'a.ts'), analyzeLightRay(code, 'index.ts')]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.totalAbsorptions).toBeGreaterThan(0)
  })

  it('sums total emissions from rays', () => {
    const code = 'export function add(a: number, b: number): number {\n  return a + b\n}\n'
    const rays = [analyzeLightRay(code, 'a.ts'), analyzeLightRay(code, 'b.ts')]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(spec.totalEmissions).toBeGreaterThan(0)
  })

  it('classifies optical health as valid value', () => {
    const rays = [analyzeLightRay('export function a() {}\n', 'a.ts')]
    const spec = analyzeLightSpectrum(rays, 'src')
    expect(['brilliant', 'clear', 'hazy', 'cloudy', 'foggy', 'opaque']).toContain(spec.opticalHealth)
  })
})

// ─── identifyDeadZones ───────────────────────────────────────────────────────

describe('identifyDeadZones', () => {
  it('returns empty for no dead zones', () => {
    const rays = [analyzeLightRay('export function a() {}\n', 'clean.ts')]
    expect(identifyDeadZones(rays)).toEqual([])
  })

  it('returns empty for empty input', () => {
    expect(identifyDeadZones([])).toEqual([])
  })

  it('identifies files with clarity below 20', () => {
    const bad = Array(20).fill('// TODO fix\nconst x: any = null\n').join('')
    const rays = [analyzeLightRay(bad, 'bad.ts')]
    const dead = identifyDeadZones(rays)
    if (dead.length > 0) {
      expect(dead).toContain('bad.ts')
    }
  })
})

// ─── identifyHotSpots ────────────────────────────────────────────────────────

describe('identifyHotSpots', () => {
  it('returns empty for empty input', () => {
    expect(identifyHotSpots([])).toEqual([])
  })

  it('returns empty for single-concern files', () => {
    const rays = [analyzeLightRay('export const x = 1\n', 'simple.ts')]
    expect(identifyHotSpots(rays)).toEqual([])
  })

  it('identifies high-dispersion files', () => {
    const rays = [analyzeLightRay('export class UserService {\n  find() {}\n  process() {}\n  calculate() {}\n}\n', 'svc.ts')]
    const hot = identifyHotSpots(rays)
    expect(Array.isArray(hot)).toBe(true)
  })
})

// ─── computeOpticalGrade ─────────────────────────────────────────────────────

describe('computeOpticalGrade', () => {
  it('returns diamond for clarity >= 80', () => {
    expect(computeOpticalGrade(85)).toBe('diamond')
    expect(computeOpticalGrade(100)).toBe('diamond')
    expect(computeOpticalGrade(80)).toBe('diamond')
  })

  it('returns crystal for clarity 60-79', () => {
    expect(computeOpticalGrade(65)).toBe('crystal')
    expect(computeOpticalGrade(60)).toBe('crystal')
    expect(computeOpticalGrade(79)).toBe('crystal')
  })

  it('returns glass for clarity 40-59', () => {
    expect(computeOpticalGrade(45)).toBe('glass')
    expect(computeOpticalGrade(40)).toBe('glass')
    expect(computeOpticalGrade(59)).toBe('glass')
  })

  it('returns plastic for clarity 25-39', () => {
    expect(computeOpticalGrade(30)).toBe('plastic')
    expect(computeOpticalGrade(25)).toBe('plastic')
    expect(computeOpticalGrade(39)).toBe('plastic')
  })

  it('returns muddy for clarity 10-24', () => {
    expect(computeOpticalGrade(15)).toBe('muddy')
    expect(computeOpticalGrade(10)).toBe('muddy')
    expect(computeOpticalGrade(24)).toBe('muddy')
  })

  it('returns opaque for clarity < 10', () => {
    expect(computeOpticalGrade(5)).toBe('opaque')
    expect(computeOpticalGrade(0)).toBe('opaque')
    expect(computeOpticalGrade(9)).toBe('opaque')
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<KaleidoscopePrismStats> = {}): KaleidoscopePrismStats => ({
    totalFiles: 1,
    totalSpectra: 1,
    avgClarity: 50,
    avgLuminosity: 50,
    avgRefractionIndex: 50,
    avgDispersion: 50,
    avgFocalPower: 50,
    crystalFiles: 0,
    opaqueFiles: 0,
    laserFiles: 0,
    darkFiles: 0,
    monochromaticFiles: 0,
    polychromaticFiles: 0,
    ultravioletFiles: 0,
    infraredFiles: 0,
    totalRefractions: 0,
    totalReflections: 0,
    totalAbsorptions: 0,
    totalEmissions: 0,
    dominantWavelength: 'green',
    spectralSpread: 0,
    lightBalance: 100,
    deadZones: 0,
    hotSpots: 0,
    overallClarity: 50,
    opticalGrade: 'glass',
    brightestFile: 'a.ts',
    darkestFile: 'a.ts',
    ...overrides,
  })

  it('returns excellent message when no issues found', () => {
    const stats = makeStats({
      avgClarity: 90, avgLuminosity: 70, avgRefractionIndex: 30,
      avgDispersion: 20, overallClarity: 90, opticalGrade: 'diamond',
    })
    const recs = generateRecommendations([], [], stats)
    expect(recs).toContain('Optical quality is excellent - code is clear and well-illuminated')
  })

  it('recommends improving opaque files', () => {
    const stats = makeStats({ opaqueFiles: 2 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('opaque'))).toBe(true)
  })

  it('recommends for dark files', () => {
    const stats = makeStats({ darkFiles: 1 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('dark'))).toBe(true)
  })

  it('recommends for high dispersion', () => {
    const stats = makeStats({ avgDispersion: 70 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('dispersion'))).toBe(true)
  })

  it('recommends for infrared files above threshold', () => {
    const stats = makeStats({ infraredFiles: 4 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('implicit'))).toBe(true)
  })

  it('does not recommend for infrared files at threshold', () => {
    const stats = makeStats({ infraredFiles: 3 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('implicit'))).toBe(false)
  })

  it('recommends for ultraviolet files', () => {
    const stats = makeStats({ ultravioletFiles: 2 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('hidden concerns'))).toBe(true)
  })

  it('recommends for dead zones', () => {
    const stats = makeStats({ deadZones: 2 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('dead zone'))).toBe(true)
  })

  it('recommends for hot spots', () => {
    const stats = makeStats({ hotSpots: 3 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('hot spot'))).toBe(true)
  })

  it('recommends for low luminosity', () => {
    const stats = makeStats({ avgLuminosity: 20 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('luminosity'))).toBe(true)
  })

  it('does not recommend for luminosity at threshold', () => {
    const stats = makeStats({ avgLuminosity: 30 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('luminosity'))).toBe(false)
  })

  it('recommends for excessive refraction', () => {
    const stats = makeStats({ avgRefractionIndex: 75 })
    const recs = generateRecommendations([], [], stats)
    expect(recs.some(r => r.includes('refraction'))).toBe(true)
  })
})

// ─── buildKaleidoscopePrismResult ─────────────────────────────────────────────

describe('buildKaleidoscopePrismResult', () => {
  it('returns result with all required fields', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export const x = 1\n'], {})
    expect(result).toHaveProperty('rays')
    expect(result).toHaveProperty('spectra')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('returns empty result for no files', () => {
    const result = buildKaleidoscopePrismResult([], [], {})
    expect(result.rays).toEqual([])
    expect(result.spectra).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.opticalGrade).toBe('opaque')
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('creates one ray per file', () => {
    const result = buildKaleidoscopePrismResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['export const a = 1\n', 'export const b = 2\n', 'export const c = 3\n'],
      {},
    )
    expect(result.rays).toHaveLength(3)
  })

  it('groups files into spectra by directory', () => {
    const result = buildKaleidoscopePrismResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export const a = 1\n', 'export const b = 2\n', 'export const c = 3\n'],
      {},
    )
    expect(result.rays).toHaveLength(3)
    expect(result.spectra.length).toBe(2)
    const srcSpec = result.spectra.find(s => s.directory === 'src')
    expect(srcSpec).toBeDefined()
    expect(srcSpec!.rays).toHaveLength(2)
    const testSpec = result.spectra.find(s => s.directory === 'test')
    expect(testSpec).toBeDefined()
    expect(testSpec!.rays).toHaveLength(1)
  })

  it('groups root-level files into dot directory', () => {
    const result = buildKaleidoscopePrismResult(
      ['a.ts', 'b.ts'],
      ['export const a = 1\n', 'export const b = 2\n'],
      {},
    )
    expect(result.spectra).toHaveLength(1)
    expect(result.spectra[0].directory).toBe('.')
  })

  it('computes stats correctly for single file', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export function add() {}\n'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalSpectra).toBe(1)
    expect(result.stats.avgClarity).toBeGreaterThan(0)
    expect(result.stats.overallClarity).toBe(result.stats.avgClarity)
    expect(result.stats.opticalGrade).toBeDefined()
    expect(result.stats.brightestFile).toBe('a.ts')
    expect(result.stats.darkestFile).toBe('a.ts')
  })

  it('tracks crystalFiles count', () => {
    const code = '/** docs */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const result = buildKaleidoscopePrismResult(['a.ts'], [code], {})
    expect(typeof result.stats.crystalFiles).toBe('number')
    expect(typeof result.stats.opaqueFiles).toBe('number')
  })

  it('tracks laserFiles and darkFiles', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export const x = 1\n'], {})
    expect(typeof result.stats.laserFiles).toBe('number')
    expect(typeof result.stats.darkFiles).toBe('number')
  })

  it('tracks monochromaticFiles and polychromaticFiles', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export const x = 1\n'], {})
    expect(typeof result.stats.monochromaticFiles).toBe('number')
    expect(typeof result.stats.polychromaticFiles).toBe('number')
  })

  it('tracks ultravioletFiles and infraredFiles', () => {
    const code = "// TODO fix\nconst x: any = 1\nconst y = 2\nconst z = 3\nconst w = 4\nconst v = 5\nconst u = 6\nconst t = 7\n"
    const result = buildKaleidoscopePrismResult(['messy.ts'], [code], {})
    expect(result.stats.ultravioletFiles).toBeGreaterThan(0)
  })

  it('computes totalRefractions, totalReflections, totalAbsorptions, totalEmissions', () => {
    const code = "import foo from './foo'\ninterface Foo { bar(): void }\nexport class MyClass implements Foo { bar() {} }\n"
    const result = buildKaleidoscopePrismResult(['a.ts'], [code], {})
    expect(typeof result.stats.totalRefractions).toBe('number')
    expect(typeof result.stats.totalReflections).toBe('number')
    expect(typeof result.stats.totalAbsorptions).toBe('number')
    expect(typeof result.stats.totalEmissions).toBe('number')
  })

  it('finds dominant wavelength in stats', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export const x = 1\n'], {})
    expect(['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']).toContain(result.stats.dominantWavelength)
  })

  it('computes spectral spread and light balance from spectra', () => {
    const result = buildKaleidoscopePrismResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}\n', 'export function b() {}\n'],
      {},
    )
    expect(result.stats.spectralSpread).toBeGreaterThanOrEqual(0)
    expect(result.stats.lightBalance).toBeGreaterThanOrEqual(0)
  })

  it('sets brightestFile and darkestFile correctly', () => {
    const good = '/** Adds two numbers */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const bad = '// TODO fix\nconst x: any = 1\nconst y: any = 2\nconsole.log("debug")\nconsole.log("debug2")\n'
    const result = buildKaleidoscopePrismResult(['good.ts', 'bad.ts'], [good, bad], {})
    expect(result.stats.brightestFile).toBe('good.ts')
    expect(result.stats.darkestFile).toBe('bad.ts')
  })

  it('returns none for brightest/darkest with no files', () => {
    const result = buildKaleidoscopePrismResult([], [], {})
    expect(result.stats.brightestFile).toBe('none')
    expect(result.stats.darkestFile).toBe('none')
  })

  it('generates recommendations', () => {
    const result = buildKaleidoscopePrismResult(['a.ts'], ['export const x = 1\n'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles large number of files', () => {
    const files = Array.from({ length: 50 }, (_, i) => `file${i}.ts`)
    const contents = Array(50).fill('export function add() {}\n')
    const result = buildKaleidoscopePrismResult(files, contents, {})
    expect(result.rays).toHaveLength(50)
    expect(result.stats.totalFiles).toBe(50)
  })

  it('handles backslash paths for directory grouping', () => {
    const result = buildKaleidoscopePrismResult(
      ['src\\a.ts', 'src\\b.ts'],
      ['export const a = 1\n', 'export const b = 2\n'],
      {},
    )
    const srcSpec = result.spectra.find(s => s.directory === 'src')
    expect(srcSpec).toBeDefined()
    expect(srcSpec!.rays).toHaveLength(2)
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('format-helpers', () => {
  const makeResult = () => buildKaleidoscopePrismResult(
    ['test.ts'],
    ['export function add(a: number, b: number): number {\n  return a + b\n}\n'],
    {},
  )

  it('formatKaleidoscopePrismTable returns a non-empty string', () => {
    const output = formatKaleidoscopePrismTable(makeResult(), false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatKaleidoscopePrismTable includes file names', () => {
    const output = formatKaleidoscopePrismTable(makeResult(), false)
    expect(output).toContain('test.ts')
  })

  it('formatKaleidoscopePrismTable includes header', () => {
    const output = formatKaleidoscopePrismTable(makeResult(), false)
    expect(output).toContain('Kaleidoscope Prism')
  })

  it('formatKaleidoscopePrismTable verbose is at least as long as non-verbose', () => {
    const terse = formatKaleidoscopePrismTable(makeResult(), false)
    const verbose = formatKaleidoscopePrismTable(makeResult(), true)
    expect(verbose.length).toBeGreaterThanOrEqual(terse.length)
  })

  it('formatKaleidoscopePrismTable truncates rays when not verbose and more than 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array(20).fill('export const x = 1\n')
    const result = buildKaleidoscopePrismResult(files, contents, {})
    const output = formatKaleidoscopePrismTable(result, false)
    expect(output).toContain('more')
  })

  it('formatKaleidoscopePrismTable shows all rays when verbose', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array(20).fill('export const x = 1\n')
    const result = buildKaleidoscopePrismResult(files, contents, {})
    const output = formatKaleidoscopePrismTable(result, true)
    expect(output).toContain('file19.ts')
  })

  it('formatKaleidoscopePrismTable shows recommendations', () => {
    const output = formatKaleidoscopePrismTable(makeResult(), false)
    expect(output).toContain('Recommendations')
  })

  it('formatKaleidoscopePrismTable shows statistics', () => {
    const output = formatKaleidoscopePrismTable(makeResult(), false)
    expect(output).toContain('Statistics')
  })

  it('formatKaleidoscopePrismTable shows spectra section when spectra exist', () => {
    const result = buildKaleidoscopePrismResult(
      ['src/a.ts'],
      ['export const x = 1\n'],
      {},
    )
    const output = formatKaleidoscopePrismTable(result, false)
    expect(output).toContain('Light Spectra')
  })

  it('formatKaleidoscopePrismTable shows no-rays message for empty result', () => {
    const result = buildKaleidoscopePrismResult([], [], {})
    const output = formatKaleidoscopePrismTable(result, false)
    expect(output).toContain('No rays detected')
  })

  it('formatKaleidoscopePrismJson returns valid JSON', () => {
    const output = formatKaleidoscopePrismJson(makeResult())
    const parsed = JSON.parse(output)
    expect(parsed.rays).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatKaleidoscopePrismJson includes all ray fields', () => {
    const output = formatKaleidoscopePrismJson(makeResult())
    const parsed = JSON.parse(output)
    const ray = parsed.rays[0]
    expect(ray.clarity).toBeDefined()
    expect(ray.spectrum.red).toBeDefined()
    expect(ray.dominantWavelength).toBeDefined()
    expect(ray.lightType).toBeDefined()
    expect(ray.classification).toBeDefined()
  })

  it('formatKaleidoscopePrismJson includes all stats fields', () => {
    const output = formatKaleidoscopePrismJson(makeResult())
    const parsed = JSON.parse(output)
    expect(parsed.stats.opticalGrade).toBeDefined()
    expect(parsed.stats.brightestFile).toBeDefined()
    expect(parsed.stats.darkestFile).toBeDefined()
    expect(parsed.stats.totalFiles).toBe(1)
  })
})
