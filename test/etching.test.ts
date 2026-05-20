import { describe, it, expect } from 'vitest'
import {
  detectBurrs,
  detectScratches,
  detectAcidSpots,
  detectGhosting,
  classifyPlateType,
  classifyEtchingStyle,
  classifyCraftsmanship,
  classifyOverallGrade,
  analyzeEngravingLine,
  analyzeEtchingPlate,
  generateEtchingRecommendations,
  buildEtchingResult,
  type EtchingStats,
} from '../src/commands/etching-helpers.js'
import { formatEtchingTable, formatEtchingJson } from '../src/commands/etching-format-helpers.js'

// ─── detectBurrs ─────────────────────────────────────────────────────────────

describe('detectBurrs', () => {
  it('returns 0 for clean code', () => {
    expect(detectBurrs('export function add(a: number, b: number) { return a + b }')).toBe(0)
  })

  it('detects loose equality', () => {
    expect(detectBurrs('if (x == 1)')).toBe(1)
  })

  it('detects loose inequality', () => {
    expect(detectBurrs('if (x != null)')).toBe(1)
  })

  it('detects try without catch', () => {
    expect(detectBurrs('try { doSomething() }')).toBe(1)
  })

  it('returns 0 for try-catch pair', () => {
    expect(detectBurrs('try { x() } catch(e) { }')).toBe(0)
  })

  it('detects switch without default', () => {
    expect(detectBurrs('switch (x) { case 1: break }')).toBe(1)
  })

  it('returns 0 for empty content', () => {
    expect(detectBurrs('')).toBe(0)
  })
})

// ─── detectScratches ─────────────────────────────────────────────────────────

describe('detectScratches', () => {
  it('detects console.log', () => {
    expect(detectScratches('console.log("debug")')).toBe(1)
  })

  it('detects multiple console calls', () => {
    expect(detectScratches('console.log("a")\nconsole.error("b")')).toBe(2)
  })

  it('detects debugger statement', () => {
    expect(detectScratches('debugger')).toBe(1)
  })

  it('detects var usage', () => {
    expect(detectScratches('var x = 1')).toBe(1)
  })

  it('returns 0 for clean code', () => {
    expect(detectScratches('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectScratches('')).toBe(0)
  })
})

// ─── detectAcidSpots ─────────────────────────────────────────────────────────

describe('detectAcidSpots', () => {
  it('detects TODO comments', () => {
    expect(detectAcidSpots('// TODO fix this')).toBe(1)
  })

  it('detects FIXME comments', () => {
    expect(detectAcidSpots('// FIXME broken')).toBe(1)
  })

  it('detects HACK comments', () => {
    expect(detectAcidSpots('// HACK workaround')).toBe(1)
  })

  it('detects XXX comments', () => {
    expect(detectAcidSpots('// XXX danger')).toBe(1)
  })

  it('counts multiple markers', () => {
    expect(detectAcidSpots('// TODO fix\n// FIXME broken\n// HACK workaround')).toBe(3)
  })

  it('returns 0 for clean code', () => {
    expect(detectAcidSpots('const x = 1')).toBe(0)
  })
})

// ─── detectGhosting ──────────────────────────────────────────────────────────

describe('detectGhosting', () => {
  it('detects empty blocks', () => {
    expect(detectGhosting('const fn = () => { }')).toBe(1)
  })

  it('detects multiple empty blocks', () => {
    expect(detectGhosting('const a = { } const b = { }')).toBe(2)
  })

  it('detects excessive imports', () => {
    const imports = Array(10).fill("import { x } from 'lib'").join('\n')
    expect(detectGhosting(imports)).toBeGreaterThan(0)
  })

  it('returns 0 for clean code', () => {
    expect(detectGhosting('const x = 1')).toBe(0)
  })

  it('returns 0 for empty content', () => {
    expect(detectGhosting('')).toBe(0)
  })
})

// ─── classifyPlateType ───────────────────────────────────────────────────────

describe('classifyPlateType', () => {
  it('classifies interface-heavy code as copper', () => {
    const code = 'export interface A { x: number }\nexport interface B { y: string }\nexport interface C { z: boolean }\n'
    expect(classifyPlateType(code)).toBe('copper')
  })

  it('classifies class+interface code as steel', () => {
    const code = 'export interface Config { name: string }\nexport class Service implements Config { name = "test" }\nexport class Repository { save() {} }\n'
    expect(classifyPlateType(code)).toBe('steel')
  })

  it('classifies function-heavy code as zinc', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function c() {}\nexport function d() {}\n'
    expect(classifyPlateType(code)).toBe('zinc')
  })

  it('classifies minimal export code as stone', () => {
    const code = "import { x } from 'lib'\nexport { x }\n"
    expect(classifyPlateType(code)).toBe('stone')
  })

  it('classifies simple code as plastic', () => {
    expect(classifyPlateType('const x = 1')).toBe('plastic')
  })

  it('returns valid plate type', () => {
    const result = classifyPlateType('export function add() {}')
    expect(['copper', 'steel', 'zinc', 'wood', 'stone', 'plastic']).toContain(result)
  })
})

// ─── classifyEtchingStyle ────────────────────────────────────────────────────

describe('classifyEtchingStyle', () => {
  it('classifies well-documented multi-export as burin', () => {
    const code = '/** docs */\n/** more */\nexport function add() {}\nexport function mul() {}\nexport function div() {}\n'
    expect(classifyEtchingStyle(code)).toBe('burin')
  })

  it('classifies function-heavy code as drypoint', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\n'
    expect(classifyEtchingStyle(code)).toBe('drypoint')
  })

  it('classifies class+function code as etching', () => {
    const code = 'export class Service { run() {} }\nfunction helper() {}\nfunction process() {}\n'
    expect(classifyEtchingStyle(code)).toBe('etching')
  })

  it('returns valid style for simple code', () => {
    const result = classifyEtchingStyle('const x = 1')
    expect(['burin', 'drypoint', 'etching', 'aquatint', 'mezzotint', 'lithograph']).toContain(result)
  })
})

// ─── classifyCraftsmanship ───────────────────────────────────────────────────

describe('classifyCraftsmanship', () => {
  it('returns master for high precision', () => {
    expect(classifyCraftsmanship(85)).toBe('master')
    expect(classifyCraftsmanship(80)).toBe('master')
  })

  it('returns journeyman for good precision', () => {
    expect(classifyCraftsmanship(65)).toBe('journeyman')
    expect(classifyCraftsmanship(60)).toBe('journeyman')
  })

  it('returns apprentice for moderate precision', () => {
    expect(classifyCraftsmanship(45)).toBe('apprentice')
    expect(classifyCraftsmanship(40)).toBe('apprentice')
  })

  it('returns novice for low precision', () => {
    expect(classifyCraftsmanship(25)).toBe('novice')
    expect(classifyCraftsmanship(20)).toBe('novice')
  })

  it('returns amateur for very low precision', () => {
    expect(classifyCraftsmanship(10)).toBe('amateur')
    expect(classifyCraftsmanship(0)).toBe('amateur')
  })
})

// ─── classifyOverallGrade ────────────────────────────────────────────────────

describe('classifyOverallGrade', () => {
  it('returns grand-master for excellent', () => {
    expect(classifyOverallGrade(90)).toBe('grand-master')
    expect(classifyOverallGrade(85)).toBe('grand-master')
  })

  it('returns master for high scores', () => {
    expect(classifyOverallGrade(75)).toBe('master')
    expect(classifyOverallGrade(70)).toBe('master')
  })

  it('returns journeyman for moderate scores', () => {
    expect(classifyOverallGrade(55)).toBe('journeyman')
    expect(classifyOverallGrade(50)).toBe('journeyman')
  })

  it('returns apprentice for lower scores', () => {
    expect(classifyOverallGrade(35)).toBe('apprentice')
    expect(classifyOverallGrade(30)).toBe('apprentice')
  })

  it('returns novice for poor scores', () => {
    expect(classifyOverallGrade(20)).toBe('novice')
    expect(classifyOverallGrade(15)).toBe('novice')
  })

  it('returns amateur for very poor scores', () => {
    expect(classifyOverallGrade(10)).toBe('amateur')
    expect(classifyOverallGrade(0)).toBe('amateur')
  })
})

// ─── analyzeEngravingLine ────────────────────────────────────────────────────

describe('analyzeEngravingLine', () => {
  const cleanCode = '/** Adds two numbers */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
  const messyCode = "// TODO fix\nconst x: any = 1\nconsole.log('debug')\nvar y = 2\n"

  it('returns correct file path', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.file).toBe('clean.ts')
  })

  it('returns high precision for clean code', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.linePrecision).toBeGreaterThan(40)
  })

  it('returns zero precision for empty content', () => {
    const eng = analyzeEngravingLine('', 'empty.ts')
    expect(eng.linePrecision).toBe(0)
  })

  it('computes depth control', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.depthControl).toBeGreaterThanOrEqual(0)
    expect(eng.depthControl).toBeLessThanOrEqual(100)
  })

  it('returns zero depth control for empty content', () => {
    const eng = analyzeEngravingLine('', 'empty.ts')
    expect(eng.depthControl).toBe(0)
  })

  it('computes plate quality', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.plateQuality).toBeGreaterThanOrEqual(0)
  })

  it('computes cross hatching', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.crossHatching).toBeGreaterThanOrEqual(0)
  })

  it('computes burin work', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.burinWork).toBeGreaterThan(0)
  })

  it('counts lines correctly', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.lineCount).toBeGreaterThan(0)
  })

  it('returns zero lines for empty content', () => {
    const eng = analyzeEngravingLine('', 'empty.ts')
    expect(eng.lineCount).toBe(0)
  })

  it('computes avg line length', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.avgLineLength).toBeGreaterThan(0)
  })

  it('computes line variance', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.lineVariance).toBeGreaterThanOrEqual(0)
  })

  it('computes etching density', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.etchingDensity).toBeGreaterThanOrEqual(0)
    expect(eng.etchingDensity).toBeLessThanOrEqual(100)
  })

  it('computes groove metrics', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(eng.groove.depth).toBeGreaterThanOrEqual(0)
    expect(eng.groove.width).toBeGreaterThanOrEqual(0)
    expect(eng.groove.angle).toBeGreaterThanOrEqual(0)
  })

  it('classifies plate type', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(['copper', 'steel', 'zinc', 'wood', 'stone', 'plastic']).toContain(eng.plateType)
  })

  it('classifies etching style', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(['burin', 'drypoint', 'etching', 'aquatint', 'mezzotint', 'lithograph']).toContain(eng.etchingStyle)
  })

  it('classifies craftsmanship', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(['master', 'journeyman', 'apprentice', 'novice', 'amateur']).toContain(eng.craftsmanship)
  })

  it('counts line types', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(typeof eng.lines.bold).toBe('number')
    expect(typeof eng.lines.fine).toBe('number')
    expect(typeof eng.lines.rough).toBe('number')
    expect(typeof eng.lines.overworked).toBe('number')
    expect(typeof eng.lines.feathered).toBe('number')
  })

  it('counts blemishes', () => {
    const eng = analyzeEngravingLine(messyCode, 'messy.ts')
    expect(typeof eng.blemishes.burrs).toBe('number')
    expect(typeof eng.blemishes.scratches).toBe('number')
    expect(typeof eng.blemishes.plateWear).toBe('number')
    expect(typeof eng.blemishes.acidSpots).toBe('number')
    expect(typeof eng.blemishes.ghosting).toBe('number')
  })

  it('detects acid spots in messy code', () => {
    const eng = analyzeEngravingLine(messyCode, 'messy.ts')
    expect(eng.blemishes.acidSpots).toBeGreaterThan(0)
  })

  it('identifies strengths and weaknesses', () => {
    const eng = analyzeEngravingLine(cleanCode, 'clean.ts')
    expect(Array.isArray(eng.strengths)).toBe(true)
    expect(Array.isArray(eng.weaknesses)).toBe(true)
  })
})

// ─── analyzeEtchingPlate ─────────────────────────────────────────────────────

describe('analyzeEtchingPlate', () => {
  it('returns defaults for empty engravings', () => {
    const plate = analyzeEtchingPlate([], 'src')
    expect(plate.directory).toBe('src')
    expect(plate.engravings).toEqual([])
    expect(plate.avgPrecision).toBe(0)
    expect(plate.plateCondition).toBe('corroded')
    expect(plate.edition).toBe('forgery')
  })

  it('computes averages from engravings', () => {
    const cleanCode = '/** docs */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const engravings = [
      analyzeEngravingLine(cleanCode, 'a.ts'),
      analyzeEngravingLine(cleanCode, 'b.ts'),
    ]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(plate.avgPrecision).toBeGreaterThan(0)
    expect(plate.avgDepthControl).toBeGreaterThan(0)
  })

  it('finds dominant style', () => {
    const code = 'export function add() {}\n'
    const engravings = [analyzeEngravingLine(code, 'a.ts'), analyzeEngravingLine(code, 'b.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(['burin', 'drypoint', 'etching', 'aquatint', 'mezzotint', 'lithograph']).toContain(plate.dominantStyle)
  })

  it('counts master and amateur engravings', () => {
    const good = '/** docs */\nexport function add(a: number, b: number): number {\n  return a + b\n}\nexport function mul(a: number, b: number): number {\n  return a * b\n}\n'
    const bad = 'var x: any = 1\nconsole.log(x)\n// TODO fix\n'
    const engravings = [analyzeEngravingLine(good, 'good.ts'), analyzeEngravingLine(bad, 'bad.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(typeof plate.masterEngravings).toBe('number')
    expect(typeof plate.amateurEngravings).toBe('number')
  })

  it('sums total blemishes', () => {
    const messy = "// TODO\nconsole.log('x')\nif (x == 1) {}\n"
    const engravings = [analyzeEngravingLine(messy, 'messy.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(plate.totalBlemishes).toBeGreaterThanOrEqual(0)
  })

  it('classifies plate condition', () => {
    const code = 'export function add() {}\n'
    const engravings = [analyzeEngravingLine(code, 'a.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(['pristine', 'good', 'fair', 'worn', 'damaged', 'corroded']).toContain(plate.plateCondition)
  })

  it('classifies edition', () => {
    const code = 'export function add() {}\n'
    const engravings = [analyzeEngravingLine(code, 'a.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(['original', 'first-print', 'reprint', 'copy', 'forgery']).toContain(plate.edition)
  })

  it('computes overall quality', () => {
    const code = 'export function add() {}\n'
    const engravings = [analyzeEngravingLine(code, 'a.ts')]
    const plate = analyzeEtchingPlate(engravings, 'src')
    expect(plate.overallQuality).toBeGreaterThanOrEqual(0)
    expect(plate.overallQuality).toBeLessThanOrEqual(100)
  })
})

// ─── generateEtchingRecommendations ──────────────────────────────────────────

describe('generateEtchingRecommendations', () => {
  const makeStats = (overrides: Partial<EtchingStats> = {}): EtchingStats => ({
    totalFiles: 1, totalPlates: 1,
    avgLinePrecision: 50, avgDepthControl: 50, avgPlateQuality: 50,
    avgCrossHatching: 50, avgBurinWork: 50,
    masterCraftsman: 0, journeymanCraftsman: 1, apprenticeCraftsman: 0,
    noviceCraftsman: 0, amateurCraftsman: 0,
    totalBoldLines: 1, totalFineLines: 0, totalRoughLines: 0,
    totalOverworkedLines: 0, totalFeatheredLines: 0,
    totalBurrs: 0, totalScratches: 0, totalAcidSpots: 0, totalGhosting: 0,
    overallPrecision: 50, craftsmanshipGrade: 'journeyman',
    bestEngraving: 'a.ts', worstEngraving: 'a.ts',
    dominantStyle: 'drypoint', dominantPlate: 'zinc',
    ...overrides,
  })

  it('returns master message when no issues', () => {
    const stats = makeStats()
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs).toContain('Master craftsmanship achieved - engravings are clean and precise')
  })

  it('recommends rework for amateur files', () => {
    const stats = makeStats({ amateurCraftsman: 2 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('amateur'))).toBe(true)
  })

  it('recommends for novice files', () => {
    const stats = makeStats({ noviceCraftsman: 3 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('novice'))).toBe(true)
  })

  it('recommends cleaning acid spots', () => {
    const stats = makeStats({ totalAcidSpots: 5 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('acid'))).toBe(true)
  })

  it('recommends smoothing burrs', () => {
    const stats = makeStats({ totalBurrs: 5 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('burr'))).toBe(true)
  })

  it('recommends for low burin work', () => {
    const stats = makeStats({ avgBurinWork: 30 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Sharpen'))).toBe(true)
  })

  it('recommends for low precision', () => {
    const stats = makeStats({ avgLinePrecision: 30 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('precision'))).toBe(true)
  })

  it('recommends for scratches', () => {
    const stats = makeStats({ totalScratches: 3 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('scratch'))).toBe(true)
  })

  it('recommends for ghosting', () => {
    const stats = makeStats({ totalGhosting: 4 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('ghost'))).toBe(true)
  })

  it('recommends for overworked lines', () => {
    const stats = makeStats({ totalOverworkedLines: 15 })
    const recs = generateEtchingRecommendations([], [], stats)
    expect(recs.some(r => r.includes('overworked'))).toBe(true)
  })
})

// ─── buildEtchingResult ──────────────────────────────────────────────────────

describe('buildEtchingResult', () => {
  it('returns result with all required fields', () => {
    const result = buildEtchingResult(['a.ts'], ['export const x = 1\n'], {})
    expect(result).toHaveProperty('engravings')
    expect(result).toHaveProperty('plates')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('returns empty result for no files', () => {
    const result = buildEtchingResult([], [], {})
    expect(result.engravings).toEqual([])
    expect(result.plates).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.craftsmanshipGrade).toBe('amateur')
  })

  it('creates one engraving per file', () => {
    const result = buildEtchingResult(
      ['a.ts', 'b.ts', 'c.ts'],
      ['const a = 1\n', 'const b = 2\n', 'const c = 3\n'],
      {},
    )
    expect(result.engravings).toHaveLength(3)
  })

  it('groups engravings into plates by directory', () => {
    const result = buildEtchingResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['const a = 1\n', 'const b = 2\n', 'const c = 3\n'],
      {},
    )
    expect(result.plates).toHaveLength(2)
    const srcPlate = result.plates.find(p => p.directory === 'src')
    expect(srcPlate).toBeDefined()
    expect(srcPlate!.engravings).toHaveLength(2)
  })

  it('computes stats correctly', () => {
    const result = buildEtchingResult(['a.ts'], ['export function add() {}\n'], {})
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalPlates).toBe(1)
    expect(result.stats.overallPrecision).toBeGreaterThan(0)
    expect(result.stats.craftsmanshipGrade).toBeDefined()
    expect(result.stats.bestEngraving).toBe('a.ts')
    expect(result.stats.worstEngraving).toBe('a.ts')
  })

  it('tracks craftsmanship counts', () => {
    const result = buildEtchingResult(['a.ts'], ['export function add() {}\n'], {})
    expect(typeof result.stats.masterCraftsman).toBe('number')
    expect(typeof result.stats.journeymanCraftsman).toBe('number')
    expect(typeof result.stats.apprenticeCraftsman).toBe('number')
    expect(typeof result.stats.noviceCraftsman).toBe('number')
    expect(typeof result.stats.amateurCraftsman).toBe('number')
  })

  it('tracks line type totals', () => {
    const result = buildEtchingResult(['a.ts'], ['const x = 1\n'], {})
    expect(typeof result.stats.totalBoldLines).toBe('number')
    expect(typeof result.stats.totalFineLines).toBe('number')
    expect(typeof result.stats.totalRoughLines).toBe('number')
  })

  it('tracks blemish totals', () => {
    const result = buildEtchingResult(['a.ts'], ['const x = 1\n'], {})
    expect(typeof result.stats.totalBurrs).toBe('number')
    expect(typeof result.stats.totalScratches).toBe('number')
    expect(typeof result.stats.totalAcidSpots).toBe('number')
    expect(typeof result.stats.totalGhosting).toBe('number')
  })

  it('finds dominant style and plate', () => {
    const result = buildEtchingResult(['a.ts'], ['export function add() {}\n'], {})
    expect(['burin', 'drypoint', 'etching', 'aquatint', 'mezzotint', 'lithograph']).toContain(result.stats.dominantStyle)
    expect(['copper', 'steel', 'zinc', 'wood', 'stone', 'plastic']).toContain(result.stats.dominantPlate)
  })

  it('identifies best and worst engravings', () => {
    const good = '/** docs */\nexport function add(a: number, b: number): number {\n  return a + b\n}\n'
    const bad = 'var x: any = 1\nconsole.log(x)\n// TODO fix\n'
    const result = buildEtchingResult(['good.ts', 'bad.ts'], [good, bad], {})
    expect(result.stats.bestEngraving).toBe('good.ts')
    expect(result.stats.worstEngraving).toBe('bad.ts')
  })

  it('generates recommendations', () => {
    const result = buildEtchingResult(['a.ts'], ['const x = 1\n'], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles root-level files', () => {
    const result = buildEtchingResult(['a.ts', 'b.ts'], ['const a = 1\n', 'const b = 2\n'], {})
    expect(result.plates).toHaveLength(1)
    expect(result.plates[0].directory).toBe('.')
  })
})

// ─── format-helpers ───────────────────────────────────────────────────────────

describe('format-helpers', () => {
  const makeResult = () => buildEtchingResult(
    ['test.ts'],
    ['export function add(a: number, b: number): number {\n  return a + b\n}\n'],
    {},
  )

  it('formatEtchingTable returns a string', () => {
    const output = formatEtchingTable(makeResult(), false)
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  it('formatEtchingTable includes file names', () => {
    const output = formatEtchingTable(makeResult(), false)
    expect(output).toContain('test.ts')
  })

  it('formatEtchingTable includes header', () => {
    const output = formatEtchingTable(makeResult(), false)
    expect(output).toContain('Etching')
  })

  it('formatEtchingTable verbose is at least as long', () => {
    const terse = formatEtchingTable(makeResult(), false)
    const verbose = formatEtchingTable(makeResult(), true)
    expect(verbose.length).toBeGreaterThanOrEqual(terse.length)
  })

  it('formatEtchingTable truncates engravings beyond 15', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = Array(20).fill('export const x = 1\n')
    const result = buildEtchingResult(files, contents, {})
    const output = formatEtchingTable(result, false)
    expect(output).toContain('more')
  })

  it('formatEtchingTable shows recommendations', () => {
    const output = formatEtchingTable(makeResult(), false)
    expect(output).toContain('Recommendations')
  })

  it('formatEtchingTable shows no-engravings message for empty', () => {
    const result = buildEtchingResult([], [], {})
    const output = formatEtchingTable(result, false)
    expect(output).toContain('No engravings')
  })

  it('formatEtchingJson returns valid JSON', () => {
    const output = formatEtchingJson(makeResult())
    const parsed = JSON.parse(output)
    expect(parsed.engravings).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatEtchingJson includes all fields', () => {
    const output = formatEtchingJson(makeResult())
    const parsed = JSON.parse(output)
    expect(parsed.engravings[0].linePrecision).toBeDefined()
    expect(parsed.engravings[0].groove.depth).toBeDefined()
    expect(parsed.stats.craftsmanshipGrade).toBeDefined()
    expect(parsed.stats.dominantStyle).toBeDefined()
  })
})
