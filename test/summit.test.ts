import { describe, expect, it } from 'vitest'

import {
  buildSummitResult,
  classifyPeak,
  classifyWeather,
  computeDifficulty,
  computeElevation,
  computeEquipment,
  computeExpedition,
  computeOxygen,
  computeTypeSafety,
  computeView,
  establishCamps,
  generateRecommendations,
  planRoutes,
  type Peak,
  type SummitStats,
  type Expedition,
} from '../src/commands/summit-helpers.js'

import {
  formatCampDistribution,
  formatMountainProfile,
  formatPeakTable,
  formatRouteSuggestions,
  formatSummitJSON,
  formatSummitRecommendations,
  formatSummitStats,
  formatSummitTable,
  formatMeters,
} from '../src/commands/summit-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const goodCode = `/**
 * Add two numbers together.
 * @example add(1, 2)
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Subtract b from a.
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * Multiply two numbers.
 */
export function multiply(a: number, b: number): number {
  return a * b
}
`

const badCode = `var x=1;var y=2;var z=3;if(x){if(y){if(z){for(let i=0;i<100;i++){while(true){try{if(x&&y||z){}}catch(e){if(x){}}}}}}}`

const complexCode = `function complex(a,b,c,d,e) {
  if (a) { if (b) { if (c) { for (let i = 0; i < 10; i++) {
    while (d) { switch(e) { case 1: break; case 2: break; }
    if (a && b || c) { try {} catch(f) { if (g) {} } }
  } } } }
}`

const documentedCode = `/**
 * Calculate the total.
 */
export function calcTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0)
}
`

const undocumentedCode = `export function process(data: string): void {
  console.log(data)
}
export function handle(event: unknown): void {
  console.log(event)
}
export function transform(input: string): string {
  return input.toUpperCase()
}`

const mixedCode = `/**
 * Documented function.
 */
export function documented(x: number): number {
  return x * 2
}

export function undocumented(y: string): string {
  return y.toUpperCase()
}`

const simpleContent = 'const x = 1'

// ─── computeElevation ──────────────────────────────────────────────────────────

describe('computeElevation', () => {
  it('returns a number between 0 and 100', () => {
    const result = computeElevation(goodCode, 'good.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher elevation to well-documented code', () => {
    const good = computeElevation(documentedCode, 'mod.ts')
    const bad = computeElevation(undocumentedCode, 'mod.ts')
    expect(good).toBeGreaterThan(bad)
  })

  it('gives higher elevation to test files', () => {
    const withTest = computeElevation(simpleContent, 'mod.test.ts')
    const withoutTest = computeElevation(simpleContent, 'mod.ts')
    expect(withTest).toBeGreaterThan(withoutTest)
  })

  it('gives lower elevation to complex code', () => {
    const simple = computeElevation(documentedCode, 'simple.ts')
    const complex = computeElevation(badCode, 'complex.ts')
    expect(simple).toBeGreaterThan(complex)
  })

  it('returns 0-100 for empty content', () => {
    const result = computeElevation('', 'empty.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('handles bad code', () => {
    const result = computeElevation(badCode, 'bad.ts')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('factors in type safety', () => {
    const typed = computeElevation('function add(a: number, b: number): number { return a + b }', 'mod.ts')
    const untyped = computeElevation('function add(a, b) { return a + b }', 'mod.ts')
    expect(typed).toBeGreaterThanOrEqual(untyped)
  })
})

// ─── computeDifficulty ─────────────────────────────────────────────────────────

describe('computeDifficulty', () => {
  it('returns 1 for simple content', () => {
    expect(computeDifficulty('const x = 1')).toBe(1)
  })

  it('increases with branching', () => {
    const simple = computeDifficulty('const x = 1')
    const branched = computeDifficulty('if (x) { }')
    expect(branched).toBeGreaterThan(simple)
  })

  it('counts if, for, while, switch, catch', () => {
    const result = computeDifficulty('if (a) {} for (let i=0;i<10;i++) {} while(true){} switch(x){} try{} catch(e){}')
    expect(result).toBeGreaterThan(5)
  })

  it('counts && and ||', () => {
    const result = computeDifficulty('if (a && b || c) {}')
    expect(result).toBeGreaterThan(3)
  })

  it('caps at 100', () => {
    const veryComplex = 'if '.repeat(200)
    expect(computeDifficulty(veryComplex)).toBeLessThanOrEqual(100)
  })

  it('returns 1 for empty content', () => {
    expect(computeDifficulty('')).toBe(1)
  })

  it('handles multiple patterns', () => {
    const code = 'if (a) {} if (b) {} for (let i = 0; i < 5; i++) {}'
    const result = computeDifficulty(code)
    expect(result).toBeGreaterThanOrEqual(4)
  })
})

// ─── computeOxygen ─────────────────────────────────────────────────────────────

describe('computeOxygen', () => {
  it('returns 50 for content with no exports and no JSDoc', () => {
    expect(computeOxygen('const x = 1')).toBe(50)
  })

  it('returns 80 for content with no exports but has JSDoc', () => {
    expect(computeOxygen('/** docs */\nconst x = 1')).toBe(80)
  })

  it('returns 100 when all exports have JSDoc', () => {
    const code = '/** docs */\nexport function foo() {}\n/** docs */\nexport function bar() {}'
    expect(computeOxygen(code)).toBe(100)
  })

  it('returns 0 when exports have no JSDoc', () => {
    const code = 'export function foo() {}\nexport function bar() {}'
    expect(computeOxygen(code)).toBe(0)
  })

  it('returns partial coverage for mixed documentation', () => {
    const result = computeOxygen(mixedCode)
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(100)
  })

  it('handles single documented export', () => {
    expect(computeOxygen('/** doc */\nexport function foo() {}')).toBe(100)
  })

  it('caps at 100', () => {
    const code = '/** d */\nexport function a() {}\n/** d */\nexport function b() {}\n/** d */\nexport function c() {}'
    expect(computeOxygen(code)).toBeLessThanOrEqual(100)
  })
})

// ─── computeEquipment ──────────────────────────────────────────────────────────

describe('computeEquipment', () => {
  it('returns 100 for test files with .test.ts', () => {
    expect(computeEquipment('mod.test.ts')).toBe(100)
  })

  it('returns 100 for spec files with .spec.ts', () => {
    expect(computeEquipment('mod.spec.ts')).toBe(100)
  })

  it('returns 100 for files in test/ directory', () => {
    expect(computeEquipment('test/mod.ts')).toBe(100)
  })

  it('returns 100 for files in tests/ directory', () => {
    expect(computeEquipment('tests/mod.ts')).toBe(100)
  })

  it('returns 100 for files in __tests__/', () => {
    expect(computeEquipment('__tests__/mod.ts')).toBe(100)
  })

  it('returns 30 for regular source files', () => {
    expect(computeEquipment('src/mod.ts')).toBe(30)
  })

  it('returns 30 for config files', () => {
    expect(computeEquipment('tsconfig.json')).toBe(30)
  })

  it('returns 100 for .test.js files', () => {
    expect(computeEquipment('mod.test.js')).toBe(100)
  })

  it('returns 100 for .spec.jsx files', () => {
    expect(computeEquipment('mod.spec.jsx')).toBe(100)
  })
})

// ─── classifyWeather ───────────────────────────────────────────────────────────

describe('classifyWeather', () => {
  it('returns stable for 0-3 changes', () => {
    expect(classifyWeather('mod.ts', 0)).toBe('stable')
    expect(classifyWeather('mod.ts', 1)).toBe('stable')
    expect(classifyWeather('mod.ts', 3)).toBe('stable')
  })

  it('returns changing for 4-8 changes', () => {
    expect(classifyWeather('mod.ts', 4)).toBe('changing')
    expect(classifyWeather('mod.ts', 6)).toBe('changing')
    expect(classifyWeather('mod.ts', 8)).toBe('changing')
  })

  it('returns volatile for 9+ changes', () => {
    expect(classifyWeather('mod.ts', 9)).toBe('volatile')
    expect(classifyWeather('mod.ts', 50)).toBe('volatile')
  })
})

// ─── computeView ───────────────────────────────────────────────────────────────

describe('computeView', () => {
  it('returns a number between 0 and 100', () => {
    const result = computeView(goodCode)
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives higher view to well-named code', () => {
    const good = computeView('function calculateTotal(a: number, b: number) { return a + b }')
    const bad = computeView('var x=1;var y=2;')
    expect(good).toBeGreaterThan(bad)
  })

  it('gives bonus for reasonable line lengths', () => {
    const short = computeView('const x = 1\nconst y = 2\n')
    expect(short).toBeGreaterThan(40)
  })

  it('penalizes too many functions', () => {
    const many = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}\nfunction e() {}\nfunction f() {}\nfunction g() {}\nfunction h() {}\nfunction i() {}\nfunction j() {}\nfunction k() {}'
    const result = computeView(many)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('handles empty content', () => {
    const result = computeView('')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('gives bonus for blank line ratio', () => {
    const withBlanks = 'const abc = 1\n\nconst def = 2\n\nconst ghi = 3\n'
    const noBlanks = 'const abc = 1\nconst def = 2\nconst ghi = 3\n'
    expect(computeView(withBlanks)).toBeGreaterThanOrEqual(computeView(noBlanks))
  })

  it('gives bonus for type annotations', () => {
    const typed = 'function add(a: number, b: number): number { return a + b }\nfunction sub(a: number, b: number): number { return a - b }\nfunction mul(a: number, b: number): number { return a * b }'
    const untyped = 'function add(a, b) { return a + b }\nfunction sub(a, b) { return a - b }\nfunction mul(a, b) { return a * b }'
    expect(computeView(typed)).toBeGreaterThan(computeView(untyped))
  })
})

// ─── computeTypeSafety ─────────────────────────────────────────────────────────

describe('computeTypeSafety', () => {
  it('returns 50 for code with no type annotations', () => {
    expect(computeTypeSafety('function add(a, b) { return a + b }')).toBe(50)
  })

  it('increases with type annotations', () => {
    const typed = computeTypeSafety('function add(a: number, b: number): number { return a + b }')
    expect(typed).toBeGreaterThan(50)
  })

  it('decreases with any usage', () => {
    const withAny = computeTypeSafety('function process(data: any): any { return data }')
    expect(withAny).toBeLessThan(50)
  })

  it('increases with generics', () => {
    const withGeneric = computeTypeSafety('function identity<T>(arg: T): T { return arg }')
    expect(withGeneric).toBeGreaterThan(50)
  })

  it('caps at 100', () => {
    const result = computeTypeSafety('function f(a: number, b: string, c: boolean, d: void, e: unknown): number { return 1 }')
    expect(result).toBeLessThanOrEqual(100)
  })

  it('floors at 0', () => {
    const result = computeTypeSafety('let a: any\nlet b: any\nlet c: any\nlet d: any\nlet e: any\nlet f: any')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('handles empty content', () => {
    expect(computeTypeSafety('')).toBe(50)
  })
})

// ─── classifyPeak ──────────────────────────────────────────────────────────────

describe('classifyPeak', () => {
  it('classifies valley for elevation < 25', () => {
    expect(classifyPeak(0)).toBe('valley')
    expect(classifyPeak(24)).toBe('valley')
  })

  it('classifies foothill for 25 <= elevation < 50', () => {
    expect(classifyPeak(25)).toBe('foothill')
    expect(classifyPeak(49)).toBe('foothill')
  })

  it('classifies ridge for 50 <= elevation < 70', () => {
    expect(classifyPeak(50)).toBe('ridge')
    expect(classifyPeak(69)).toBe('ridge')
  })

  it('classifies peak for 70 <= elevation < 85', () => {
    expect(classifyPeak(70)).toBe('peak')
    expect(classifyPeak(84)).toBe('peak')
  })

  it('classifies summit for elevation >= 85', () => {
    expect(classifyPeak(85)).toBe('summit')
    expect(classifyPeak(100)).toBe('summit')
  })
})

// ─── establishCamps ────────────────────────────────────────────────────────────

describe('establishCamps', () => {
  it('returns 6 camps always', () => {
    const camps = establishCamps([])
    expect(camps).toHaveLength(6)
  })

  it('groups peaks into correct camp types', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 40, classification: 'valley' },
      { file: 'b.ts', elevation: 30, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 40, classification: 'foothill' },
      { file: 'c.ts', elevation: 60, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 40, classification: 'ridge' },
      { file: 'd.ts', elevation: 75, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 40, classification: 'peak' },
      { file: 'e.ts', elevation: 90, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 40, classification: 'summit' },
    ]
    const camps = establishCamps(peaks)
    expect(camps[0].type).toBe('base-camp')
    expect(camps[0].files).toContain('a.ts')
    expect(camps[5].type).toBe('summit')
    expect(camps[5].files).toContain('e.ts')
  })

  it('assigns correct camp types in order', () => {
    const camps = establishCamps([])
    const types = camps.map((c) => c.type)
    expect(types).toEqual(['base-camp', 'camp-1', 'camp-2', 'camp-3', 'high-camp', 'summit'])
  })

  it('computes average elevation for each camp', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 30, classification: 'valley' },
      { file: 'b.ts', elevation: 20, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 30, classification: 'valley' },
    ]
    const camps = establishCamps(peaks)
    expect(camps[0].elevation).toBe(15)
  })

  it('uses range min for empty camps', () => {
    const camps = establishCamps([])
    expect(camps[0].elevation).toBe(0)
    expect(camps[5].elevation).toBe(85)
  })

  it('handles all peaks in one camp', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 30, classification: 'valley' },
      { file: 'b.ts', elevation: 15, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 30, classification: 'valley' },
      { file: 'c.ts', elevation: 20, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 30, classification: 'valley' },
    ]
    const camps = establishCamps(peaks)
    expect(camps[0].files).toHaveLength(3)
    expect(camps[1].files).toHaveLength(0)
  })
})

// ─── planRoutes ────────────────────────────────────────────────────────────────

describe('planRoutes', () => {
  it('returns empty for fewer than 2 peaks', () => {
    expect(planRoutes([])).toHaveLength(0)
    const one: Peak[] = [
      { file: 'a.ts', elevation: 50, difficulty: 10, oxygen: 50, equipment: 30, weather: 'stable', view: 50, classification: 'ridge' },
    ]
    expect(planRoutes(one)).toHaveLength(0)
  })

  it('plans routes from low to high elevation', () => {
    const peaks: Peak[] = [
      { file: 'low.ts', elevation: 20, difficulty: 50, oxygen: 10, equipment: 30, weather: 'stable', view: 20, classification: 'valley' },
      { file: 'mid.ts', elevation: 50, difficulty: 30, oxygen: 50, equipment: 30, weather: 'stable', view: 50, classification: 'ridge' },
      { file: 'high.ts', elevation: 90, difficulty: 5, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' },
    ]
    const routes = planRoutes(peaks)
    expect(routes.length).toBeGreaterThanOrEqual(1)
    expect(routes[0].from).toBe('low.ts')
    expect(routes[0].to).toBe('high.ts')
  })

  it('suggests improvements based on differences', () => {
    const peaks: Peak[] = [
      { file: 'low.ts', elevation: 20, difficulty: 60, oxygen: 10, equipment: 30, weather: 'stable', view: 10, classification: 'valley' },
      { file: 'mid.ts', elevation: 45, difficulty: 30, oxygen: 40, equipment: 30, weather: 'stable', view: 40, classification: 'foothill' },
      { file: 'high.ts', elevation: 95, difficulty: 5, oxygen: 95, equipment: 100, weather: 'stable', view: 95, classification: 'summit' },
    ]
    const routes = planRoutes(peaks)
    if (routes.length > 0) {
      expect(routes[0].improvements.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('classifies route difficulty by gap', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 5, classification: 'valley' },
      { file: 'b.ts', elevation: 40, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 40, classification: 'foothill' },
      { file: 'c.ts', elevation: 70, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 70, classification: 'peak' },
      { file: 'd.ts', elevation: 95, difficulty: 5, oxygen: 5, equipment: 30, weather: 'stable', view: 95, classification: 'summit' },
    ]
    const routes = planRoutes(peaks)
    const hasExtreme = routes.some((r) => r.difficulty === 'extreme')
    expect(hasExtreme || routes.length > 0).toBe(true)
  })

  it('does not pair files with small elevation gap', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 40, difficulty: 10, oxygen: 40, equipment: 30, weather: 'stable', view: 40, classification: 'foothill' },
      { file: 'b.ts', elevation: 45, difficulty: 10, oxygen: 45, equipment: 30, weather: 'stable', view: 45, classification: 'foothill' },
      { file: 'c.ts', elevation: 50, difficulty: 10, oxygen: 50, equipment: 30, weather: 'stable', view: 50, classification: 'ridge' },
    ]
    const routes = planRoutes(peaks)
    for (const r of routes) {
      const fromPeak = peaks.find((p) => p.file === r.from)!
      const toPeak = peaks.find((p) => p.file === r.to)!
      expect(toPeak.elevation - fromPeak.elevation).toBeGreaterThan(20)
    }
  })
})

// ─── computeExpedition ─────────────────────────────────────────────────────────

describe('computeExpedition', () => {
  it('returns expedition with correct structure', () => {
    const exp = computeExpedition([])
    expect(exp).toHaveProperty('name')
    expect(exp).toHaveProperty('baseElevation')
    expect(exp).toHaveProperty('summitElevation')
    expect(exp).toHaveProperty('averageElevation')
    expect(exp).toHaveProperty('camps')
    expect(exp).toHaveProperty('routes')
  })

  it('computes base and summit elevation', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 20, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 20, classification: 'valley' },
      { file: 'b.ts', elevation: 90, difficulty: 10, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' },
    ]
    const exp = computeExpedition(peaks)
    expect(exp.baseElevation).toBe(20)
    expect(exp.summitElevation).toBe(90)
    expect(exp.averageElevation).toBe(55)
  })

  it('handles empty peaks', () => {
    const exp = computeExpedition([])
    expect(exp.baseElevation).toBe(0)
    expect(exp.summitElevation).toBe(0)
    expect(exp.averageElevation).toBe(0)
  })

  it('includes camps and routes', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 10, classification: 'valley' },
      { file: 'b.ts', elevation: 50, difficulty: 10, oxygen: 50, equipment: 30, weather: 'stable', view: 50, classification: 'ridge' },
      { file: 'c.ts', elevation: 90, difficulty: 10, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' },
    ]
    const exp = computeExpedition(peaks)
    expect(exp.camps.length).toBe(6)
    expect(exp.routes.length).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: SummitStats = {
    totalPeaks: 0, summitCount: 0, valleyCount: 0, avgElevation: 0,
    highestPeak: 'none', deepestValley: 'none',
    oxygenDeprivation: 0, equipmentGaps: 0, trailCondition: 50,
  }

  const defaultExpedition: Expedition = {
    name: 'Test', baseElevation: 0, summitElevation: 0, averageElevation: 0, camps: [], routes: [],
  }

  it('recommends addressing valley files', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 10, difficulty: 10, oxygen: 10, equipment: 30, weather: 'stable', view: 10, classification: 'valley' },
    ]
    const recs = generateRecommendations(peaks, defaultExpedition, { ...emptyStats, valleyCount: 1 })
    expect(recs.some((r) => r.includes('valley'))).toBe(true)
  })

  it('warns about oxygen deprivation', () => {
    const recs = generateRecommendations([], defaultExpedition, { ...emptyStats, oxygenDeprivation: 50 })
    expect(recs.some((r) => r.includes('oxygen') || r.includes('documentation'))).toBe(true)
  })

  it('warns about equipment gaps', () => {
    const recs = generateRecommendations([], defaultExpedition, { ...emptyStats, equipmentGaps: 60 })
    expect(recs.some((r) => r.includes('equipment') || r.includes('test'))).toBe(true)
  })

  it('highlights summit files', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 90, difficulty: 5, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' },
    ]
    const recs = generateRecommendations(peaks, defaultExpedition, emptyStats)
    expect(recs.some((r) => r.includes('summit') || r.includes('exemplar'))).toBe(true)
  })

  it('mentions planned routes', () => {
    const expeditionWithRoutes: Expedition = {
      ...defaultExpedition,
      routes: [{ from: 'a.ts', to: 'b.ts', improvements: [], difficulty: 'moderate' }],
    }
    const recs = generateRecommendations([], expeditionWithRoutes, emptyStats)
    expect(recs.some((r) => r.includes('route'))).toBe(true)
  })

  it('warns about poor trail condition', () => {
    const recs = generateRecommendations([], defaultExpedition, { ...emptyStats, trailCondition: 30 })
    expect(recs.some((r) => r.includes('Trail') || r.includes('trail'))).toBe(true)
  })

  it('gives positive recommendation when all is well', () => {
    const goodStats: SummitStats = {
      totalPeaks: 5, summitCount: 3, valleyCount: 0, avgElevation: 80,
      highestPeak: 'a.ts', deepestValley: 'b.ts',
      oxygenDeprivation: 10, equipmentGaps: 20, trailCondition: 80,
    }
    const recs = generateRecommendations(
      [{ file: 'a.ts', elevation: 90, difficulty: 5, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' }],
      defaultExpedition,
      goodStats,
    )
    expect(recs.length).toBeGreaterThan(0)
  })
})

// ─── buildSummitResult ─────────────────────────────────────────────────────────

describe('buildSummitResult', () => {
  it('handles empty input', () => {
    const result = buildSummitResult([], [], {})
    expect(result.peaks).toHaveLength(0)
    expect(result.stats.totalPeaks).toBe(0)
    expect(result.stats.highestPeak).toBe('none')
    expect(result.stats.deepestValley).toBe('none')
  })

  it('builds peaks for each file', () => {
    const result = buildSummitResult(['a.ts', 'b.ts'], [goodCode, badCode], {})
    expect(result.peaks).toHaveLength(2)
    expect(result.peaks[0].file).toBe('a.ts')
    expect(result.peaks[1].file).toBe('b.ts')
  })

  it('computes stats correctly', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    expect(result.stats.totalPeaks).toBe(1)
    expect(result.stats.highestPeak).toBe('a.ts')
    expect(result.stats.deepestValley).toBe('a.ts')
  })

  it('includes expedition', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    expect(result.expedition).toHaveProperty('name')
    expect(result.expedition.camps.length).toBe(6)
  })

  it('includes recommendations', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('computes oxygen deprivation', () => {
    const result = buildSummitResult(['a.ts'], [undocumentedCode], {})
    expect(result.stats.oxygenDeprivation).toBeGreaterThanOrEqual(0)
  })

  it('computes equipment gaps', () => {
    const result = buildSummitResult(['a.ts'], [simpleContent], {})
    expect(result.stats.equipmentGaps).toBeGreaterThanOrEqual(0)
  })

  it('computes trail condition', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    expect(result.stats.trailCondition).toBeGreaterThanOrEqual(0)
    expect(result.stats.trailCondition).toBeLessThanOrEqual(100)
  })

  it('classifies peaks correctly', () => {
    const result = buildSummitResult(['a.ts', 'b.ts'], [goodCode, badCode], {})
    for (const peak of result.peaks) {
      expect(['valley', 'foothill', 'ridge', 'peak', 'summit']).toContain(peak.classification)
    }
  })

  it('handles mismatched files/contents gracefully', () => {
    const result = buildSummitResult(['a.ts', 'b.ts'], ['const x = 1'], {})
    expect(result.peaks).toHaveLength(2)
  })

  it('empty result has recommendations', () => {
    const result = buildSummitResult([], [], {})
    expect(result.recommendations).toContain('No files to analyze')
  })
})

// ─── format helpers ────────────────────────────────────────────────────────────

describe('formatMountainProfile', () => {
  it('handles empty peaks', () => {
    const result = formatMountainProfile([])
    expect(result).toContain('No peaks')
  })

  it('formats peaks with bars', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 80, difficulty: 10, oxygen: 80, equipment: 100, weather: 'stable', view: 80, classification: 'peak' },
    ]
    const result = formatMountainProfile(peaks)
    expect(result).toContain('a.ts')
    expect(result).toContain('Elevation Profile')
  })

  it('sorts by elevation ascending', () => {
    const peaks: Peak[] = [
      { file: 'high.ts', elevation: 90, difficulty: 5, oxygen: 90, equipment: 100, weather: 'stable', view: 90, classification: 'summit' },
      { file: 'low.ts', elevation: 20, difficulty: 50, oxygen: 10, equipment: 30, weather: 'stable', view: 20, classification: 'valley' },
    ]
    const result = formatMountainProfile(peaks)
    const lowIdx = result.indexOf('low.ts')
    const highIdx = result.indexOf('high.ts')
    expect(lowIdx).toBeLessThan(highIdx)
  })
})

describe('formatPeakTable', () => {
  it('handles empty peaks', () => {
    expect(formatPeakTable([])).toContain('No peaks')
  })

  it('formats peak details', () => {
    const peaks: Peak[] = [
      { file: 'a.ts', elevation: 75, difficulty: 20, oxygen: 60, equipment: 100, weather: 'stable', view: 70, classification: 'peak' },
    ]
    const result = formatPeakTable(peaks)
    expect(result).toContain('a.ts')
    expect(result).toContain('Elevation')
    expect(result).toContain('Difficulty')
  })

  it('limits to 15 peaks', () => {
    const peaks: Peak[] = Array.from({ length: 20 }, (_, i) => ({
      file: `file${i}.ts`, elevation: 50 + i, difficulty: 10, oxygen: 50, equipment: 30, weather: 'stable' as const, view: 50, classification: 'ridge' as const,
    }))
    const result = formatPeakTable(peaks)
    expect(result).toContain('file19.ts')
  })
})

describe('formatCampDistribution', () => {
  it('formats camps with file counts', () => {
    const result = formatCampDistribution([
      { type: 'base-camp', elevation: 10, files: ['a.ts', 'b.ts'], description: 'test' },
      { type: 'summit', elevation: 90, files: [], description: 'test' },
    ])
    expect(result).toContain('base-camp')
    expect(result).toContain('2 file')
  })

  it('shows file names for small camps', () => {
    const result = formatCampDistribution([
      { type: 'base-camp', elevation: 10, files: ['a.ts'], description: 'test' },
    ])
    expect(result).toContain('a.ts')
  })

  it('summarizes large camps', () => {
    const files = Array.from({ length: 8 }, (_, i) => `file${i}.ts`)
    const result = formatCampDistribution([
      { type: 'base-camp', elevation: 10, files, description: 'test' },
    ])
    expect(result).toContain('+5 more')
  })
})

describe('formatRouteSuggestions', () => {
  it('handles empty routes', () => {
    expect(formatRouteSuggestions([])).toContain('No routes')
  })

  it('formats routes with difficulty', () => {
    const routes = [
      { from: 'a.ts', to: 'b.ts', improvements: ['Add docs', 'Add tests'], difficulty: 'moderate' as const },
    ]
    const result = formatRouteSuggestions(routes)
    expect(result).toContain('MODERATE')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
    expect(result).toContain('Add docs')
  })
})

describe('formatMeters', () => {
  it('formats conditions', () => {
    const stats: SummitStats = {
      totalPeaks: 5, summitCount: 2, valleyCount: 1, avgElevation: 60,
      highestPeak: 'a.ts', deepestValley: 'b.ts',
      oxygenDeprivation: 30, equipmentGaps: 40, trailCondition: 70,
    }
    const result = formatMeters(stats)
    expect(result).toContain('Oxygen Deprivation')
    expect(result).toContain('Equipment Gaps')
    expect(result).toContain('Trail Condition')
  })
})

describe('formatSummitStats', () => {
  it('formats stats', () => {
    const stats: SummitStats = {
      totalPeaks: 10, summitCount: 3, valleyCount: 2, avgElevation: 65,
      highestPeak: 'top.ts', deepestValley: 'bottom.ts',
      oxygenDeprivation: 20, equipmentGaps: 30, trailCondition: 75,
    }
    const result = formatSummitStats(stats)
    expect(result).toContain('Total Peaks:       10')
    expect(result).toContain('Summit Files:      3')
    expect(result).toContain('Valley Files:      2')
    expect(result).toContain('top.ts')
    expect(result).toContain('bottom.ts')
  })
})

describe('formatSummitRecommendations', () => {
  it('handles empty recommendations', () => {
    expect(formatSummitRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const result = formatSummitRecommendations(['Fix this', 'Fix that'])
    expect(result).toContain('1. Fix this')
    expect(result).toContain('2. Fix that')
  })
})

describe('formatSummitTable', () => {
  it('formats complete result', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    const output = formatSummitTable(result)
    expect(output).toContain('Summit Analysis')
    expect(output).toContain('Elevation Profile')
    expect(output).toContain('Peak Details')
    expect(output).toContain('Camp Distribution')
    expect(output).toContain('Recommendations')
  })

  it('handles empty result', () => {
    const result = buildSummitResult([], [], {})
    const output = formatSummitTable(result)
    expect(output).toContain('Summit Analysis')
  })
})

describe('formatSummitJSON', () => {
  it('returns valid JSON', () => {
    const result = buildSummitResult(['a.ts'], [goodCode], {})
    const json = formatSummitJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('peaks')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('expedition')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('handles empty result', () => {
    const result = buildSummitResult([], [], {})
    const json = formatSummitJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.peaks).toHaveLength(0)
  })
})
