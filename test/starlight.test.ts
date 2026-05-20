import { describe, expect, it } from 'vitest'

import {
  measureBrightness,
  measureSurfaceDetail,
  measureTemperature,
  measureDistance,
  measureMagnitude,
  measureLuminosity,
  analyzeLuminosityFactors,
  classifySpectralType,
  classifyStellarFile,
  detectVariableStars,
  detectBinarySystems,
  identifyNebulae,
  computeSkyBrightness,
  classifyOverallClarity,
  generateHertzsprungRussell,
  generateRecommendations,
  buildStarlightResult,
  type StellarFile,
  type StarlightStats,
} from '../src/commands/starlight-helpers.js'

import { formatStarlightTable, formatStarlightJson } from '../src/commands/starlight-format-helpers.js'

// ─── measureBrightness ──────────────────────────────────────────────────────

describe('measureBrightness', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureBrightness('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher score for descriptive names', () => {
    const descriptive = measureBrightness('export function processItems(): void { const totalCount = 0 }')
    const generic = measureBrightness('function f(x: any): any { return x }')
    expect(descriptive).toBeGreaterThan(generic)
  })

  it('penalizes any types', () => {
    const withAny = measureBrightness('const x: any = 1')
    const withoutAny = measureBrightness('const x: number = 1')
    expect(withoutAny).toBeGreaterThan(withAny)
  })

  it('rewards short lines', () => {
    const short = measureBrightness('const x = 1\nconst y = 2\n')
    const long = measureBrightness('const x = '.padEnd(200, ' ') + '1\n')
    expect(short).toBeGreaterThan(long)
  })

  it('penalizes many single-letter variables', () => {
    const many = measureBrightness('let a = 1\nlet b = 2\nlet c = 3\nlet d = 4')
    const none = measureBrightness('const alpha = 1\nconst beta = 2')
    expect(none).toBeGreaterThan(many)
  })

  it('rewards good blank line ratio', () => {
    const good = measureBrightness('const x = 1\n\nconst y = 2\n\nconst z = 3\n')
    const dense = measureBrightness('const x = 1\nconst y = 2\nconst z = 3')
    expect(good).toBeGreaterThanOrEqual(dense)
  })
})

// ─── measureSurfaceDetail ───────────────────────────────────────────────────

describe('measureSurfaceDetail', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureSurfaceDetail('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher score for JSDoc', () => {
    const documented = measureSurfaceDetail('/** docs */\nexport function f() {}')
    const bare = measureSurfaceDetail('export function f() {}')
    expect(documented).toBeGreaterThan(bare)
  })

  it('gives higher score for type annotations', () => {
    const typed = measureSurfaceDetail('const x: string = "hello"')
    const untyped = measureSurfaceDetail('const x = "hello"')
    expect(typed).toBeGreaterThan(untyped)
  })

  it('gives higher score for inline comments', () => {
    const commented = measureSurfaceDetail('const x = 1\n// important note\nconst y = 2')
    const bare = measureSurfaceDetail('const x = 1\nconst y = 2')
    expect(commented).toBeGreaterThan(bare)
  })
})

// ─── measureTemperature ─────────────────────────────────────────────────────

describe('measureTemperature', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureTemperature('const x = 1')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher temperature for nested code', () => {
    const nested = measureTemperature('function f() {\n  if (x) {\n    for (let i = 0; i < n; i++) {\n      while (y) {}\n    }\n  }\n}')
    const flat = measureTemperature('const x = 1\nconst y = 2')
    expect(nested).toBeGreaterThan(flat)
  })

  it('gives higher temperature for many branches', () => {
    const branchy = measureTemperature('if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}')
    const simple = measureTemperature('const x = 1')
    expect(branchy).toBeGreaterThan(simple)
  })

  it('gives higher temperature for long files', () => {
    const long = 'const x = 1\n'.repeat(250)
    const short = 'const x = 1'
    expect(measureTemperature(long)).toBeGreaterThan(measureTemperature(short))
  })
})

// ─── measureDistance ────────────────────────────────────────────────────────

describe('measureDistance', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureDistance('', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher distance for deeply nested paths', () => {
    const deep = measureDistance('', 'src/commands/helpers/utils/deep/file.ts')
    const shallow = measureDistance('', 'file.ts')
    expect(deep).toBeGreaterThan(shallow)
  })

  it('reduces distance for index files', () => {
    const index = measureDistance('', 'src/index.ts')
    const regular = measureDistance('', 'src/regular.ts')
    expect(index).toBeLessThan(regular)
  })
})

// ─── measureMagnitude ───────────────────────────────────────────────────────

describe('measureMagnitude', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureMagnitude('const x = 1', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher magnitude for many exports', () => {
    const many = measureMagnitude('export const a = 1\nexport const b = 2\nexport const c = 3', 'a.ts')
    const few = measureMagnitude('const a = 1', 'a.ts')
    expect(many).toBeGreaterThan(few)
  })

  it('gives higher magnitude for index files', () => {
    const index = measureMagnitude('export { x }', 'index.ts')
    const regular = measureMagnitude('export { x }', 'utils.ts')
    expect(index).toBeGreaterThan(regular)
  })
})

// ─── measureLuminosity ──────────────────────────────────────────────────────

describe('measureLuminosity', () => {
  it('returns a number between 0 and 100', () => {
    const result = measureLuminosity('const x = 1', 'a.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher luminosity for documented clean code', () => {
    const bright = measureLuminosity('/** Process items */\nexport function processItems(): string { return "ok" }', 'a.ts')
    const dim = measureLuminosity('var x: any = 1', 'a.ts')
    expect(bright).toBeGreaterThan(dim)
  })
})

// ─── analyzeLuminosityFactors ───────────────────────────────────────────────

describe('analyzeLuminosityFactors', () => {
  it('returns an array', () => {
    const result = analyzeLuminosityFactors('const x = 1', 'a.ts')
    expect(Array.isArray(result)).toBe(true)
  })

  it('detects documentation as brightening factor', () => {
    const result = analyzeLuminosityFactors('/** docs */\nexport function f() {}', 'a.ts')
    const docFactor = result.find(f => f.factor === 'documentation')
    expect(docFactor).toBeDefined()
    expect(docFactor!.contribution).toBeGreaterThan(0)
  })

  it('detects missing documentation as dimming factor', () => {
    const result = analyzeLuminosityFactors('const x = 1', 'a.ts')
    const docFactor = result.find(f => f.factor === 'documentation')
    expect(docFactor).toBeDefined()
    expect(docFactor!.contribution).toBeLessThan(0)
  })

  it('detects descriptive names as brightening', () => {
    const result = analyzeLuminosityFactors('export function processItems() {}', 'a.ts')
    const nameFactor = result.find(f => f.factor === 'naming')
    expect(nameFactor).toBeDefined()
    expect(nameFactor!.contribution).toBeGreaterThan(0)
  })

  it('detects any type as dimming', () => {
    const result = analyzeLuminosityFactors('const x: any = 1', 'a.ts')
    const anyFactor = result.find(f => f.factor === 'complexity' && f.contribution < 0)
    expect(anyFactor).toBeDefined()
  })

  it('detects type annotations as brightening', () => {
    const result = analyzeLuminosityFactors('const x: string = "hi"', 'a.ts')
    const typeFactor = result.find(f => f.factor === 'types')
    expect(typeFactor).toBeDefined()
    expect(typeFactor!.contribution).toBeGreaterThan(0)
  })

  it('each factor has required fields', () => {
    const result = analyzeLuminosityFactors('export function f(): void {}', 'a.ts')
    for (const f of result) {
      expect(f).toHaveProperty('factor')
      expect(f).toHaveProperty('contribution')
      expect(f).toHaveProperty('description')
    }
  })
})

// ─── classifySpectralType ───────────────────────────────────────────────────

describe('classifySpectralType', () => {
  it('returns O for very high luminosity and high temperature', () => {
    expect(classifySpectralType(90, 85)).toBe('O')
  })

  it('returns B for high luminosity and moderate temperature', () => {
    expect(classifySpectralType(75, 50)).toBe('B')
  })

  it('returns A for good luminosity', () => {
    expect(classifySpectralType(65, 30)).toBe('A')
  })

  it('returns F for moderate luminosity', () => {
    expect(classifySpectralType(55, 20)).toBe('F')
  })

  it('returns G for average luminosity', () => {
    expect(classifySpectralType(45, 20)).toBe('G')
  })

  it('returns K for below average luminosity', () => {
    expect(classifySpectralType(30, 10)).toBe('K')
  })

  it('returns M for dim code', () => {
    expect(classifySpectralType(15, 10)).toBe('M')
  })

  it('covers all spectral types', () => {
    const types = new Set(['O', 'B', 'A', 'F', 'G', 'K', 'M'])
    const results = [
      classifySpectralType(90, 85),
      classifySpectralType(75, 50),
      classifySpectralType(65, 30),
      classifySpectralType(55, 20),
      classifySpectralType(45, 10),
      classifySpectralType(30, 10),
      classifySpectralType(10, 5),
    ]
    for (const r of results) {
      expect(types.has(r as 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M')).toBe(true)
    }
  })
})

// ─── classifyStellarFile ────────────────────────────────────────────────────

describe('classifyStellarFile', () => {
  it('returns supergiant for bright complex important code', () => {
    expect(classifyStellarFile(90, 80, 85)).toBe('supergiant')
  })

  it('returns giant for bright complex code', () => {
    expect(classifyStellarFile(75, 65, 50)).toBe('giant')
  })

  it('returns black-dwarf for very dim simple code', () => {
    expect(classifyStellarFile(10, 15, 20)).toBe('black-dwarf')
  })

  it('returns white-dwarf for dim simple code', () => {
    expect(classifyStellarFile(25, 20, 30)).toBe('white-dwarf')
  })

  it('returns neutron-star for complex bright code', () => {
    expect(classifyStellarFile(65, 85, 40)).toBe('neutron-star')
  })

  it('returns dwarf for below average code', () => {
    expect(classifyStellarFile(35, 30, 20)).toBe('dwarf')
  })

  it('returns main-sequence for average code', () => {
    expect(classifyStellarFile(55, 40, 40)).toBe('main-sequence')
  })
})

// ─── detectVariableStars ────────────────────────────────────────────────────

describe('detectVariableStars', () => {
  it('returns false for consistent code', () => {
    expect(detectVariableStars('export function processItems(): string {\n  return "ok"\n}\n', 'a.ts')).toBe(false)
  })

  it('returns true for mixed declaration styles', () => {
    expect(detectVariableStars('var x = 1\nlet y = 2\nconst z = 3\nconst w = 4\n', 'a.ts')).toBe(true)
  })

  it('returns true for mixed any and strict types', () => {
    expect(detectVariableStars('const x: any = 1\nconst y: string = "hi"\nconst z = 3\nconst w = 4\n', 'a.ts')).toBe(true)
  })

  it('returns false for short files', () => {
    expect(detectVariableStars('const x = 1', 'a.ts')).toBe(false)
  })

  it('returns true for partial documentation', () => {
    const code = '/** Documented */\nfunction a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}\n'
    expect(detectVariableStars(code, 'a.ts')).toBe(true)
  })
})

// ─── detectBinarySystems ────────────────────────────────────────────────────

describe('detectBinarySystems', () => {
  it('returns empty for no mutual imports', () => {
    const result = detectBinarySystems(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'])
    expect(result).toEqual([])
  })

  it('detects mutual imports', () => {
    const result = detectBinarySystems(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"', 'import { y } from "./a"'],
    )
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty for single file', () => {
    const result = detectBinarySystems(['a.ts'], ['const x = 1'])
    expect(result).toEqual([])
  })
})

// ─── identifyNebulae ────────────────────────────────────────────────────────

describe('identifyNebulae', () => {
  it('returns empty for single file', () => {
    expect(identifyNebulae(['a.ts'], ['const x = 1'])).toEqual([])
  })

  it('returns nebula for directory with multiple files', () => {
    const result = identifyNebulae(
      ['utils/a.ts', 'utils/b.ts'],
      ['var x: any = 1\nlet y = 2\nconst z = 3\n', 'var a: any = 4\nlet b = 5\nconst c = 6\n'],
    )
    expect(result.length).toBeGreaterThan(0)
  })

  it('identifies dark nebulae for any+var code', () => {
    const result = identifyNebulae(
      ['src/a.ts', 'src/b.ts'],
      ['var x: any = 1\nlet y = 2\nconst z = 3\n', 'var a: any = 4\nlet b = 5\nconst c = 6\n'],
    )
    const dark = result.find(n => n.type === 'dark')
    expect(dark).toBeDefined()
  })

  it('identifies planetary nebulae for legacy code', () => {
    const result = identifyNebulae(
      ['legacy/a.ts', 'legacy/b.ts'],
      ['function Old() {} Old.prototype.method = function() {}\nlet x = 1\n', 'var y = arguments[0]\nlet z = 2\n'],
    )
    const planetary = result.find(n => n.type === 'planetary')
    expect(planetary).toBeDefined()
  })

  it('each nebula has required fields', () => {
    const result = identifyNebulae(
      ['src/a.ts', 'src/b.ts'],
      ['var x: any = 1\nlet y = 2\nconst z = 3\n', 'var a: any = 4\nlet b = 5\nconst c = 6\n'],
    )
    for (const n of result) {
      expect(n).toHaveProperty('name')
      expect(n).toHaveProperty('files')
      expect(n).toHaveProperty('density')
      expect(n).toHaveProperty('type')
      expect(n).toHaveProperty('description')
      expect(n).toHaveProperty('obscures')
    }
  })
})

// ─── computeSkyBrightness ───────────────────────────────────────────────────

describe('computeSkyBrightness', () => {
  it('returns 50 for empty array', () => {
    expect(computeSkyBrightness([])).toBe(50)
  })

  it('returns higher for bright files', () => {
    const bright: StellarFile[] = [makeStellarFile('a.ts', 80, 85, 75, 'main-sequence')]
    const dim: StellarFile[] = [makeStellarFile('a.ts', 20, 25, 30, 'dwarf')]
    expect(computeSkyBrightness(bright)).toBeGreaterThan(computeSkyBrightness(dim))
  })

  it('penalizes black dwarfs', () => {
    const withBlackDwarf: StellarFile[] = [
      makeStellarFile('a.ts', 60, 60, 60, 'main-sequence'),
      makeStellarFile('b.ts', 10, 10, 10, 'black-dwarf'),
    ]
    const without: StellarFile[] = [
      makeStellarFile('a.ts', 60, 60, 60, 'main-sequence'),
      makeStellarFile('b.ts', 60, 60, 60, 'main-sequence'),
    ]
    expect(computeSkyBrightness(without)).toBeGreaterThan(computeSkyBrightness(withBlackDwarf))
  })

  it('penalizes variable stars', () => {
    const variable: StellarFile[] = [makeStellarFile('a.ts', 60, 60, 60, 'main-sequence', true)]
    const stable: StellarFile[] = [makeStellarFile('a.ts', 60, 60, 60, 'main-sequence', false)]
    expect(computeSkyBrightness(stable)).toBeGreaterThan(computeSkyBrightness(variable))
  })
})

// ─── classifyOverallClarity ─────────────────────────────────────────────────

describe('classifyOverallClarity', () => {
  it('returns blinding for very high scores', () => {
    expect(classifyOverallClarity(90, 85)).toBe('blinding')
  })

  it('returns bright for high scores', () => {
    expect(classifyOverallClarity(70, 70)).toBe('bright')
  })

  it('returns clear for moderate scores', () => {
    expect(classifyOverallClarity(50, 50)).toBe('clear')
  })

  it('returns dim for low scores', () => {
    expect(classifyOverallClarity(30, 30)).toBe('dim')
  })

  it('returns dark for very low scores', () => {
    expect(classifyOverallClarity(10, 10)).toBe('dark')
  })
})

// ─── generateHertzsprungRussell ─────────────────────────────────────────────

describe('generateHertzsprungRussell', () => {
  it('returns empty for no files', () => {
    expect(generateHertzsprungRussell([])).toEqual([])
  })

  it('returns x as temperature and y as luminosity', () => {
    const files = [makeStellarFile('a.ts', 50, 60, 40, 'main-sequence')]
    const hr = generateHertzsprungRussell(files)
    expect(hr).toHaveLength(1)
    expect(hr[0].x).toBe(60)
    expect(hr[0].y).toBe(50)
    expect(hr[0].file).toBe('a.ts')
  })

  it('returns one point per file', () => {
    const files = [
      makeStellarFile('a.ts', 50, 60, 40, 'main-sequence'),
      makeStellarFile('b.ts', 70, 40, 80, 'giant'),
    ]
    expect(generateHertzsprungRussell(files)).toHaveLength(2)
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends fixing black dwarfs', () => {
    const files = [makeStellarFile('dead.ts', 10, 10, 10, 'black-dwarf')]
    const stats = makeStats({})
    const recs = generateRecommendations(files, [], [], stats)
    expect(recs.some(r => r.includes('black-dwarf'))).toBe(true)
  })

  it('recommends adding docs for dark nebulae', () => {
    const nebulae = [{ name: 'n', files: ['a.ts'], density: 60, type: 'dark' as const, description: '', obscures: [] }]
    const stats = makeStats({})
    const recs = generateRecommendations([], [], nebulae, stats)
    expect(recs.some(r => r.includes('dark'))).toBe(true)
  })

  it('recommends improving dim files', () => {
    const files = [makeStellarFile('dim.ts', 20, 30, 25, 'dwarf')]
    const stats = makeStats({})
    const recs = generateRecommendations(files, [], [], stats)
    expect(recs.some(r => r.includes('dim'))).toBe(true)
  })

  it('recommends stabilizing variable stars', () => {
    const stats = makeStats({ variableStars: 3 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('variable'))).toBe(true)
  })

  it('recommends decoupling binary systems', () => {
    const stats = makeStats({ binarySystems: 2 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('binary') || r.includes('Decouple'))).toBe(true)
  })

  it('recommends improving sky brightness', () => {
    const stats = makeStats({ skyBrightness: 25 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('sky brightness') || r.includes('documentation'))).toBe(true)
  })

  it('recommends for high dwarf ratio', () => {
    const stats = makeStats({ dwarfs: 8, totalFiles: 10 })
    const recs = generateRecommendations([], [], [], stats)
    expect(recs.some(r => r.includes('dwarf'))).toBe(true)
  })

  it('returns empty for healthy codebase', () => {
    const files = [makeStellarFile('bright.ts', 85, 30, 80, 'supergiant')]
    const stats = makeStats({ skyBrightness: 90, avgLuminosity: 85 })
    const recs = generateRecommendations(files, [], [], stats)
    expect(recs).toEqual([])
  })
})

// ─── buildStarlightResult ───────────────────────────────────────────────────

describe('buildStarlightResult', () => {
  it('returns result with correct structure', () => {
    const result = buildStarlightResult([], [], {})
    expect(result).toHaveProperty('files')
    expect(result).toHaveProperty('factors')
    expect(result).toHaveProperty('nebulae')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('handles empty input', () => {
    const result = buildStarlightResult([], [], {})
    expect(result.files).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
  })

  it('creates stellar files for each input', () => {
    const result = buildStarlightResult(
      ['a.ts', 'b.ts'],
      ['export function f(): void {}', 'const x = 1'],
      {},
    )
    expect(result.files).toHaveLength(2)
  })

  it('populates all stellar file fields', () => {
    const result = buildStarlightResult(['a.ts'], ['export function process(): string { return "ok" }'], {})
    const sf = result.files[0]
    expect(sf.file).toBe('a.ts')
    expect(typeof sf.luminosity).toBe('number')
    expect(typeof sf.temperature).toBe('number')
    expect(typeof sf.distance).toBe('number')
    expect(typeof sf.magnitude).toBe('number')
    expect(typeof sf.brightness).toBe('number')
    expect(typeof sf.surfaceDetail).toBe('number')
    expect(typeof sf.isVariable).toBe('boolean')
    expect(typeof sf.isBinary).toBe('boolean')
    expect(['O', 'B', 'A', 'F', 'G', 'K', 'M']).toContain(sf.spectralType)
    expect(['supergiant', 'giant', 'main-sequence', 'dwarf', 'white-dwarf', 'black-dwarf', 'neutron-star']).toContain(sf.classification)
  })

  it('computes correct stats', () => {
    const result = buildStarlightResult(['a.ts'], ['export function f() {}'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgLuminosity).toBeGreaterThanOrEqual(0)
    expect(result.stats.skyBrightness).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallClarity).toBeDefined()
  })

  it('populates luminosity distribution', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.luminosityDistribution).toHaveProperty('0-20')
    expect(result.stats.luminosityDistribution).toHaveProperty('81-100')
  })

  it('populates spectral distribution', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.spectralDistribution).toHaveProperty('O')
    expect(result.stats.spectralDistribution).toHaveProperty('M')
  })

  it('sets brightest and dimmest files', () => {
    const result = buildStarlightResult(
      ['a.ts', 'b.ts'],
      ['/** docs */\nexport function processItems(): string {\n  return "ok"\n}\n', 'var x: any = 1'],
      {},
    )
    expect(result.stats.brightestFile).toBeTruthy()
    expect(result.stats.dimmestFile).toBeTruthy()
  })

  it('generates H-R diagram data', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.hertzsprungRussell).toHaveLength(1)
  })

  it('detects binary systems', () => {
    const result = buildStarlightResult(
      ['a.ts', 'b.ts'],
      ['import { x } from "./b"\nexport const y = 1', 'import { y } from "./a"\nexport const x = 2'],
      {},
    )
    expect(result.stats.binarySystems).toBeGreaterThan(0)
  })
})

// ─── formatStarlightTable ──────────────────────────────────────────────────

describe('formatStarlightTable', () => {
  it('returns a string', () => {
    const result = buildStarlightResult([], [], {})
    expect(typeof formatStarlightTable(result, false)).toBe('string')
  })

  it('contains section headers', () => {
    const result = buildStarlightResult(['a.ts'], ['export function f() {}'], {})
    const formatted = formatStarlightTable(result, false)
    expect(formatted).toContain('Stellar Files')
    expect(formatted).toContain('Statistics')
    expect(formatted).toContain('Spectral Distribution')
  })

  it('shows no files message when empty', () => {
    const result = buildStarlightResult([], [], {})
    expect(formatStarlightTable(result, false)).toContain('No files analyzed')
  })

  it('shows recommendations when present', () => {
    const result = buildStarlightResult([], [], {})
    result.recommendations = ['Test recommendation']
    expect(formatStarlightTable(result, false)).toContain('Recommendations')
  })

  it('respects verbose flag with H-R diagram', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    const verbose = formatStarlightTable(result, true)
    expect(verbose).toContain('H-R Diagram')
  })

  it('shows nebulae when present', () => {
    const result = buildStarlightResult([], [], {})
    result.nebulae = [{ name: 'utils', files: ['a.ts', 'b.ts'], density: 60, type: 'dark', description: 'test', obscures: [] }]
    expect(formatStarlightTable(result, false)).toContain('Nebulae')
  })
})

// ─── formatStarlightJson ───────────────────────────────────────────────────

describe('formatStarlightJson', () => {
  it('returns valid JSON', () => {
    const result = buildStarlightResult([], [], {})
    expect(() => JSON.parse(formatStarlightJson(result))).not.toThrow()
  })

  it('contains files in JSON', () => {
    const result = buildStarlightResult([], [], {})
    const parsed = JSON.parse(formatStarlightJson(result))
    expect(parsed).toHaveProperty('files')
  })

  it('contains stats in JSON', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatStarlightJson(result))
    expect(parsed).toHaveProperty('stats')
    expect(parsed.stats.totalFiles).toBe(1)
  })

  it('contains H-R diagram in JSON', () => {
    const result = buildStarlightResult(['a.ts'], ['const x = 1'], {})
    const parsed = JSON.parse(formatStarlightJson(result))
    expect(parsed.stats.hertzsprungRussell).toHaveLength(1)
  })
})

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeStellarFile(
  file: string,
  luminosity: number,
  temperature: number,
  magnitude: number,
  classification: 'supergiant' | 'giant' | 'main-sequence' | 'dwarf' | 'white-dwarf' | 'black-dwarf' | 'neutron-star',
  isVariable = false,
): StellarFile {
  return {
    file,
    luminosity,
    temperature,
    distance: 30,
    spectralType: 'G',
    magnitude,
    brightness: luminosity,
    surfaceDetail: 40,
    classification,
    isVariable,
    isBinary: false,
  }
}

function makeStats(overrides: Partial<StarlightStats> = {}): StarlightStats {
  return {
    totalFiles: 1,
    avgLuminosity: 60,
    avgBrightness: 60,
    avgTemperature: 40,
    supergiants: 0,
    mainSequence: 1,
    dwarfs: 0,
    blackDwarfs: 0,
    variableStars: 0,
    binarySystems: 0,
    totalNebulae: 0,
    darkNebulae: 0,
    skyBrightness: 60,
    luminosityDistribution: { '0-20': 0, '21-40': 0, '41-60': 1, '61-80': 0, '81-100': 0 },
    brightestFile: 'a.ts',
    dimmestFile: 'a.ts',
    spectralDistribution: { O: 0, B: 0, A: 0, F: 0, G: 1, K: 0, M: 0 },
    overallClarity: 'clear',
    hertzsprungRussell: [],
    ...overrides,
  }
}
