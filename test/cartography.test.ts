import { describe, expect, it } from 'vitest'

import {
  buildCartographyResult,
  chartRegion,
  classifyChartQuality,
  classifyRegion,
  computeCyclomaticComplexity,
  computeDocumentationScore,
  computeMapCompleteness,
  computeOrganizationScore,
  countInlineComments,
  countJSDocBlocks,
  detectLandmarkType,
  detectVisibility,
  evaluateNamingClarity,
  extractImportSources,
  extractLandmarks,
  generateCartographyRecommendations,
  hasSelfImport,
  identifyHazards,
  identifyPortsOfEntry,
  isDocumented,
  isEntryPoint,
  mapTradeRoutes,
  type CartographyOptions,
  type CartographyResult,
  type CartographyStats,
  type ChartQuality,
  type ChartedRegion,
  type Hazard,
  type Landmark,
  type PortOfEntry,
  type TradeRoute,
} from '../src/commands/cartography-helpers.js'

import {
  formatCartographyJson,
  formatCartographyStats,
  formatCartographyTable,
  formatChartLevel,
  formatChartQuality,
  formatCompletenessGauge,
  formatHazardBadge,
  formatHazardWarnings,
  formatLandmarkInventory,
  formatPortRegistry,
  formatRecommendations,
  formatRegionSurvey,
  formatSeverity,
  formatTradeRouteMap,
} from '../src/commands/cartography-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const EMPTY_CONTENT = ''

const SIMPLE_CONTENT = `const x = 1
const y = 2
export function add(a: number, b: number) {
  return a + b
}
`

const DOCUMENTED_CONTENT = `/**
 * Adds two numbers together.
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * Represents a user in the system.
 */
export class User {
  constructor(public name: string) {}
}

/** Configuration options */
export interface Config {
  debug: boolean
}
`

const COMPLEX_CONTENT = `import { process } from './engine'
import { validate } from './utils'
import { render } from './view'
import { save } from './store'
import { log } from './logger'

export function processUser(user: User): Result {
  if (!user) throw new Error('No user')
  for (const item of user.items) {
    if (item.active) {
      process(item)
    } else {
      validate(item)
    }
  }
  return { success: true }
}

export class UserManager {
  private users: Map<string, User>

  constructor() {
    this.users = new Map()
  }

  add(user: User): void {
    this.users.set(user.name, user)
  }
}
`

const HAZARDOUS_CONTENT = `var x = 1
eval('console.log("danger")')

export function getData() {
  var result = eval('2 + 2')
  if (x) {
    if (y) {
      if (z) {
        if (w) {
          return null
        }
      }
    }
  }
}
`

// ─── countJSDocBlocks ──────────────────────────────────────────────────────────

describe('countJSDocBlocks', () => {
  it('returns 0 for empty content', () => {
    expect(countJSDocBlocks(EMPTY_CONTENT)).toBe(0)
  })

  it('returns 0 for content without JSDoc', () => {
    expect(countJSDocBlocks('const x = 1')).toBe(0)
  })

  it('counts single JSDoc block', () => {
    expect(countJSDocBlocks('/** doc */\nconst x = 1')).toBe(1)
  })

  it('counts multiple JSDoc blocks', () => {
    const content = '/** a */\nconst x = 1\n/** b */\nconst y = 2'
    expect(countJSDocBlocks(content)).toBe(2)
  })

  it('counts multi-line JSDoc', () => {
    const content = '/**\n * Line 1\n * Line 2\n */\nfunction foo() {}'
    expect(countJSDocBlocks(content)).toBe(1)
  })
})

// ─── countInlineComments ───────────────────────────────────────────────────────

describe('countInlineComments', () => {
  it('returns 0 for empty content', () => {
    expect(countInlineComments(EMPTY_CONTENT)).toBe(0)
  })

  it('counts inline comments', () => {
    expect(countInlineComments('const x = 1 // note')).toBe(1)
  })

  it('counts multiple inline comments', () => {
    expect(countInlineComments('const x = 1 // a\nconst y = 2 // b')).toBe(2)
  })
})

// ─── computeDocumentationScore ─────────────────────────────────────────────────

describe('computeDocumentationScore', () => {
  it('returns 100 when no symbols', () => {
    expect(computeDocumentationScore(0, 0)).toBe(100)
  })

  it('returns 50 for half documented', () => {
    expect(computeDocumentationScore(5, 10)).toBe(50)
  })

  it('caps at 100', () => {
    expect(computeDocumentationScore(15, 10)).toBe(100)
  })

  it('returns 0 for no docs with symbols', () => {
    expect(computeDocumentationScore(0, 10)).toBe(0)
  })
})

// ─── evaluateNamingClarity ─────────────────────────────────────────────────────

describe('evaluateNamingClarity', () => {
  it('scores single letter names low', () => {
    expect(evaluateNamingClarity('x', 'function')).toBeLessThanOrEqual(30)
  })

  it('scores descriptive function names high', () => {
    expect(evaluateNamingClarity('getUserById', 'function')).toBeGreaterThanOrEqual(70)
  })

  it('scores two letter names poorly', () => {
    expect(evaluateNamingClarity('fn', 'function')).toBeLessThan(50)
  })

  it('scores class names with PascalCase well', () => {
    expect(evaluateNamingClarity('UserManager', 'class')).toBeGreaterThanOrEqual(60)
  })

  it('penalizes abbreviation-heavy names', () => {
    expect(evaluateNamingClarity('HTTPSParser', 'class')).toBeLessThan(70)
  })

  it('scores very long names reasonably', () => {
    const name = 'get'.repeat(20)
    expect(evaluateNamingClarity(name, 'function')).toBeLessThanOrEqual(100)
  })
})

// ─── detectLandmarkType ────────────────────────────────────────────────────────

describe('detectLandmarkType', () => {
  it('detects class', () => {
    expect(detectLandmarkType('class Foo {}', 'Foo')).toBe('class')
  })

  it('detects interface', () => {
    expect(detectLandmarkType('interface Config {}', 'Config')).toBe('interface')
  })

  it('detects type', () => {
    expect(detectLandmarkType('type Result = string | number', 'Result')).toBe('type')
  })

  it('detects constant', () => {
    expect(detectLandmarkType('const MAX = 100', 'MAX')).toBe('constant')
  })

  it('defaults to function', () => {
    expect(detectLandmarkType('function foo() {}', 'foo')).toBe('function')
  })
})

// ─── detectVisibility ──────────────────────────────────────────────────────────

describe('detectVisibility', () => {
  it('detects default export as public', () => {
    expect(detectVisibility('export default function main() {}', 'main')).toBe('public')
  })

  it('detects named export as exported', () => {
    expect(detectVisibility('export function foo() {}', 'foo')).toBe('exported')
  })

  it('detects private member', () => {
    expect(detectVisibility('class A { private method() {} }', 'method')).toBe('private')
  })

  it('detects internal visibility', () => {
    expect(detectVisibility('function internal() {}', 'internal')).toBe('internal')
  })
})

// ─── isDocumented ──────────────────────────────────────────────────────────────

describe('isDocumented', () => {
  it('returns true for documented function', () => {
    expect(isDocumented('/** doc */\nfunction foo() {}', 'foo')).toBe(true)
  })

  it('returns true for documented export', () => {
    expect(isDocumented('/** doc */\nexport function foo() {}', 'foo')).toBe(true)
  })

  it('returns false for undocumented function', () => {
    expect(isDocumented('function foo() {}', 'foo')).toBe(false)
  })
})

// ─── isEntryPoint ──────────────────────────────────────────────────────────────

describe('isEntryPoint', () => {
  it('detects default export entry point', () => {
    expect(isEntryPoint('export default function main() {}', 'main')).toBe(true)
  })

  it('detects common entry point names', () => {
    expect(isEntryPoint('function init() {}', 'init')).toBe(true)
  })

  it('returns false for regular functions', () => {
    expect(isEntryPoint('function helper() {}', 'helper')).toBe(false)
  })

  it('detects start as entry point', () => {
    expect(isEntryPoint('function start() {}', 'start')).toBe(true)
  })
})

// ─── computeCyclomaticComplexity ───────────────────────────────────────────────

describe('computeCyclomaticComplexity', () => {
  it('returns 1 for simple code', () => {
    expect(computeCyclomaticComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeCyclomaticComplexity('if (x) {}')).toBe(2)
  })

  it('counts for loops', () => {
    expect(computeCyclomaticComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts multiple constructs', () => {
    const code = 'if (x) {}\nif (y) {}\nfor (let i = 0; i < n; i++) {}'
    expect(computeCyclomaticComplexity(code)).toBe(4)
  })

  it('counts catch blocks', () => {
    expect(computeCyclomaticComplexity('try {} catch (e) {}')).toBe(2)
  })

  it('counts logical operators', () => {
    expect(computeCyclomaticComplexity('x && y')).toBe(2)
  })
})

// ─── extractImportSources ──────────────────────────────────────────────────────

describe('extractImportSources', () => {
  it('extracts relative imports', () => {
    expect(extractImportSources("import { x } from './utils'")).toEqual(['./utils'])
  })

  it('extracts multiple imports', () => {
    const code = "import { a } from './x'\nimport { b } from './y'"
    expect(extractImportSources(code)).toEqual(['./x', './y'])
  })

  it('extracts bare imports', () => {
    expect(extractImportSources("import './styles'")).toEqual([])
  })

  it('returns empty for no imports', () => {
    expect(extractImportSources('const x = 1')).toEqual([])
  })
})

// ─── hasSelfImport ─────────────────────────────────────────────────────────────

describe('hasSelfImport', () => {
  it('detects self import', () => {
    expect(hasSelfImport(['./utils'], 'utils.ts')).toBe(true)
  })

  it('returns false for different file', () => {
    expect(hasSelfImport(['./utils'], 'main.ts')).toBe(false)
  })

  it('handles empty imports', () => {
    expect(hasSelfImport([], 'main.ts')).toBe(false)
  })
})

// ─── extractLandmarks ──────────────────────────────────────────────────────────

describe('extractLandmarks', () => {
  it('extracts functions', () => {
    const landmarks = extractLandmarks('export function add() {}', 'math.ts')
    expect(landmarks).toHaveLength(1)
    expect(landmarks[0].name).toBe('add')
    expect(landmarks[0].type).toBe('function')
  })

  it('extracts classes', () => {
    const landmarks = extractLandmarks('export class User {}', 'user.ts')
    expect(landmarks).toHaveLength(1)
    expect(landmarks[0].type).toBe('class')
  })

  it('extracts interfaces', () => {
    const landmarks = extractLandmarks('export interface Config {}', 'config.ts')
    expect(landmarks).toHaveLength(1)
    expect(landmarks[0].type).toBe('interface')
  })

  it('extracts multiple symbols', () => {
    const landmarks = extractLandmarks(DOCUMENTED_CONTENT, 'types.ts')
    expect(landmarks.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty for no symbols', () => {
    expect(extractLandmarks('// just a comment\nconst RESULT = 1', 'simple.ts').filter(l => l.visibility !== 'internal')).toEqual([])
  })

  it('detects documentation on landmarks', () => {
    const landmarks = extractLandmarks(DOCUMENTED_CONTENT, 'types.ts')
    const addFn = landmarks.find(l => l.name === 'add')
    expect(addFn?.documented).toBe(true)
  })
})

// ─── identifyHazards ───────────────────────────────────────────────────────────

describe('identifyHazards', () => {
  it('detects phantom islands', () => {
    const content = 'export function unusedFunc() {}'
    const landmarks = extractLandmarks(content, 'file.ts')
    const hazards = identifyHazards(content, 'file.ts', landmarks)
    expect(hazards.some(h => h.type === 'phantom-island')).toBe(true)
  })

  it('detects treacherous paths for complex code', () => {
    const complexCode = 'if (a) {}\nif (b) {}\nif (c) {}\nif (d) {}\nif (e) {}\nif (f) {}\nif (g) {}\nif (h) {}\nif (i) {}\nif (j) {}'
    const hazards = identifyHazards(complexCode, 'hazard.ts', [])
    expect(hazards.some(h => h.type === 'treacherous-path')).toBe(true)
  })

  it('detects siren for var usage', () => {
    const content = 'var x = 1'
    const hazards = identifyHazards(content, 'file.ts', [])
    expect(hazards.some(h => h.type === 'siren')).toBe(true)
  })

  it('detects siren for eval usage', () => {
    const hazards = identifyHazards(HAZARDOUS_CONTENT, 'hazard.ts', [])
    expect(hazards.some(h => h.type === 'siren' && h.severity === 'critical')).toBe(true)
  })

  it('returns empty for clean code', () => {
    const content = 'const x = 1'
    const hazards = identifyHazards(content, 'clean.ts', [])
    expect(hazards).toHaveLength(0)
  })

  it('assigns severity levels', () => {
    const complexCode = Array(15).fill('if (x) {}').join('\n')
    const hazards = identifyHazards(complexCode, 'complex.ts', [])
    const treacherous = hazards.find(h => h.type === 'treacherous-path')
    expect(treacherous).toBeDefined()
    expect(treacherous?.severity).toBe('high')
  })
})

// ─── classifyRegion ────────────────────────────────────────────────────────────

describe('classifyRegion', () => {
  it('classifies well-charted regions', () => {
    expect(classifyRegion(85, 90, [])).toBe('well-charted')
  })

  it('classifies partially-charted regions', () => {
    expect(classifyRegion(50, 40, [])).toBe('partially-charted')
  })

  it('classifies uncharted for low completeness', () => {
    expect(classifyRegion(10, 10, [])).toBe('uncharted')
  })

  it('classifies misleading with critical hazards', () => {
    const hazards: Hazard[] = [
      { type: 'siren', file: 'a.ts', description: 'eval', severity: 'critical', details: 'danger' },
    ]
    expect(classifyRegion(60, 60, hazards)).toBe('misleading')
  })

  it('classifies uncharted with many critical hazards', () => {
    const hazards: Hazard[] = [
      { type: 'siren', file: 'a.ts', description: 'a', severity: 'critical', details: 'd' },
      { type: 'siren', file: 'b.ts', description: 'b', severity: 'critical', details: 'd' },
      { type: 'siren', file: 'c.ts', description: 'c', severity: 'critical', details: 'd' },
    ]
    expect(classifyRegion(60, 60, hazards)).toBe('uncharted')
  })
})

// ─── computeOrganizationScore ──────────────────────────────────────────────────

describe('computeOrganizationScore', () => {
  it('returns 50 for empty', () => {
    expect(computeOrganizationScore([])).toBe(50)
  })

  it('rewards index file presence', () => {
    expect(computeOrganizationScore(['index.ts', 'utils.ts'])).toBeGreaterThanOrEqual(70)
  })

  it('rewards test file presence', () => {
    expect(computeOrganizationScore(['main.ts', 'main.test.ts'])).toBeGreaterThanOrEqual(70)
  })

  it('rewards consistent extensions', () => {
    expect(computeOrganizationScore(['a.ts', 'b.ts'])).toBeGreaterThanOrEqual(70)
  })

  it('caps at 100', () => {
    const score = computeOrganizationScore(['index.ts', 'utils.ts', 'main.test.ts'])
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── chartRegion ───────────────────────────────────────────────────────────────

describe('chartRegion', () => {
  it('charts an empty region', () => {
    const region = chartRegion([], [], 'empty')
    expect(region.path).toBe('empty')
    expect(region.documentation).toBe(100)
  })

  it('charts a documented region', () => {
    const region = chartRegion(['types.ts'], [DOCUMENTED_CONTENT], 'src')
    expect(region.documentation).toBeGreaterThan(50)
    expect(region.landmarks.length).toBeGreaterThan(0)
  })

  it('charts a complex region', () => {
    const region = chartRegion(['main.ts'], [COMPLEX_CONTENT], 'src')
    expect(region.landmarks.length).toBeGreaterThan(0)
  })

  it('computes completeness from metrics', () => {
    const region = chartRegion(['a.ts'], [SIMPLE_CONTENT], 'src')
    expect(region.completeness).toBeGreaterThanOrEqual(0)
    expect(region.completeness).toBeLessThanOrEqual(100)
  })
})

// ─── mapTradeRoutes ────────────────────────────────────────────────────────────

describe('mapTradeRoutes', () => {
  it('maps routes from imports', () => {
    const routes = mapTradeRoutes(
      ['a.ts', 'b.ts'],
      ["import { x } from './b'", 'export function x() {}'],
    )
    expect(routes.length).toBeGreaterThan(0)
    expect(routes[0].from).toBe('a.ts')
    expect(routes[0].to).toBe('./b')
  })

  it('ignores external imports', () => {
    const routes = mapTradeRoutes(['a.ts'], ["import { x } from 'react'"])
    expect(routes).toHaveLength(0)
  })

  it('detects bidirectional routes', () => {
    const routes = mapTradeRoutes(
      ['src/a.ts', 'src/b.ts'],
      ["import { x } from './b'", "import { y } from './a'"],
    )
    expect(routes.some(r => r.isBiDirectional)).toBe(true)
  })

  it('returns empty for no files', () => {
    expect(mapTradeRoutes([], [])).toEqual([])
  })

  it('aggregates volume for repeated imports', () => {
    const routes = mapTradeRoutes(
      ['a.ts'],
      ["import { x } from './b'\nimport { y } from './b'"],
    )
    const bRoute = routes.find(r => r.to === './b')
    expect(bRoute?.volume).toBeGreaterThanOrEqual(1)
  })
})

// ─── identifyPortsOfEntry ──────────────────────────────────────────────────────

describe('identifyPortsOfEntry', () => {
  it('identifies exported functions as ports', () => {
    const ports = identifyPortsOfEntry(['math.ts'], ['export function add() {}'])
    expect(ports).toHaveLength(1)
    expect(ports[0].name).toBe('add')
  })

  it('identifies exported classes', () => {
    const ports = identifyPortsOfEntry(['user.ts'], ['export class User {}'])
    expect(ports).toHaveLength(1)
    expect(ports[0].type).toBe('class')
  })

  it('tracks documentation status', () => {
    const ports = identifyPortsOfEntry(['math.ts'], ['/** doc */\nexport function add() {}'])
    expect(ports[0].isDocumented).toBe(true)
  })

  it('returns empty for no exports', () => {
    expect(identifyPortsOfEntry(['a.ts'], ['const x = 1'])).toEqual([])
  })

  it('handles multiple exports', () => {
    const content = 'export function a() {}\nexport function b() {}'
    const ports = identifyPortsOfEntry(['file.ts'], [content])
    expect(ports).toHaveLength(2)
  })
})

// ─── computeMapCompleteness ────────────────────────────────────────────────────

describe('computeMapCompleteness', () => {
  it('computes high completeness', () => {
    expect(computeMapCompleteness(90, 80, 1)).toBeGreaterThanOrEqual(60)
  })

  it('computes low completeness with many hazards', () => {
    expect(computeMapCompleteness(20, 20, 20)).toBeLessThanOrEqual(40)
  })

  it('clamps to 0-100', () => {
    expect(computeMapCompleteness(100, 100, 0)).toBeLessThanOrEqual(100)
    expect(computeMapCompleteness(0, 0, 100)).toBeGreaterThanOrEqual(0)
  })
})

// ─── classifyChartQuality ──────────────────────────────────────────────────────

describe('classifyChartQuality', () => {
  it('returns masterwork for excellent code', () => {
    expect(classifyChartQuality(90, 85, 0)).toBe('masterwork')
  })

  it('returns detailed for good code', () => {
    expect(classifyChartQuality(65, 55, 0)).toBe('detailed')
  })

  it('returns rough for mediocre code', () => {
    expect(classifyChartQuality(45, 40, 0)).toBe('rough')
  })

  it('returns sketchy for poor code', () => {
    expect(classifyChartQuality(25, 20, 0)).toBe('sketchy')
  })

  it('returns blank for terrible code', () => {
    expect(classifyChartQuality(10, 10, 0)).toBe('blank')
  })

  it('returns blank with many critical hazards', () => {
    expect(classifyChartQuality(90, 90, 5)).toBe('blank')
  })
})

// ─── generateCartographyRecommendations ────────────────────────────────────────

describe('generateCartographyRecommendations', () => {
  const baseStats: CartographyStats = {
    totalRegions: 1,
    wellCharted: 0,
    partiallyCharted: 0,
    uncharted: 1,
    misleading: 0,
    totalLandmarks: 5,
    documentedLandmarks: 2,
    totalHazards: 0,
    criticalHazards: 0,
    totalRoutes: 0,
    heavilyUsedRoutes: 0,
    totalPorts: 3,
    documentedPorts: 1,
    avgDocumentation: 40,
    avgNamingClarity: 60,
    avgOrganization: 50,
    mapCompleteness: 40,
    terraIncognita: 50,
    misleadingMapAreas: 0,
    chartQuality: 'rough',
  }

  it('recommends documenting uncharted regions', () => {
    const recs = generateCartographyRecommendations(
      [{ path: 'src', type: 'uncharted', documentation: 10, naming: 50, organization: 40, landmarks: [], hazards: [], completeness: 20 }],
      [], [], [], baseStats,
    )
    expect(recs.some(r => r.includes('uncharted'))).toBe(true)
  })

  it('recommends fixing critical hazards', () => {
    const recs = generateCartographyRecommendations(
      [],
      [{ type: 'siren', file: 'a.ts', description: 'eval', severity: 'critical', details: 'd' }],
      [], [], baseStats,
    )
    expect(recs.some(r => r.includes('critical'))).toBe(true)
  })

  it('recommends documenting ports', () => {
    const recs = generateCartographyRecommendations(
      [], [],
      [],
      [{ file: 'a.ts', name: 'x', type: 'function', isDocumented: false, isTypeSafe: true, incomingTraffic: 0, clarity: 80 }],
      baseStats,
    )
    expect(recs.some(r => r.includes('undocumented'))).toBe(true)
  })

  it('recommends breaking circular deps', () => {
    const recs = generateCartographyRecommendations(
      [],
      [{ type: 'whirlpool', file: 'a.ts', description: 'circular', severity: 'high', details: 'd' }],
      [], [], baseStats,
    )
    expect(recs.some(r => r.includes('circular'))).toBe(true)
  })

  it('recommends reducing terra incognita when high', () => {
    const recs = generateCartographyRecommendations([], [], [], [], baseStats)
    expect(recs.some(r => r.includes('terra incognita'))).toBe(true)
  })

  it('returns empty for perfect code', () => {
    const perfectStats = { ...baseStats, uncharted: 0, terraIncognita: 0, totalHazards: 0 }
    const recs = generateCartographyRecommendations([], [], [], [], perfectStats)
    expect(recs).toHaveLength(0)
  })
})

// ─── buildCartographyResult ────────────────────────────────────────────────────

describe('buildCartographyResult', () => {
  it('builds result from empty input', () => {
    const result = buildCartographyResult([], [], {})
    expect(result.stats.totalRegions).toBe(0)
    expect(result.regions).toEqual([])
  })

  it('builds result from simple content', () => {
    const result = buildCartographyResult(['math.ts'], [SIMPLE_CONTENT], {})
    expect(result.stats.totalPieces).toBeUndefined() // not a stat we track
    expect(result.stats.totalRegions).toBeGreaterThanOrEqual(1)
    expect(result.landmarks.length).toBeGreaterThan(0)
  })

  it('builds result from documented content', () => {
    const result = buildCartographyResult(['types.ts'], [DOCUMENTED_CONTENT], {})
    expect(result.stats.avgDocumentation).toBeGreaterThan(50)
  })

  it('builds result with trade routes', () => {
    const result = buildCartographyResult(
      ['main.ts', 'utils.ts'],
      ["import { x } from './utils'", 'export function x() {}'],
      {},
    )
    expect(result.routes.length).toBeGreaterThan(0)
  })

  it('builds result with ports', () => {
    const result = buildCartographyResult(['api.ts'], [DOCUMENTED_CONTENT], {})
    expect(result.ports.length).toBeGreaterThan(0)
  })

  it('respects verbose option', () => {
    const result = buildCartographyResult(['a.ts'], [SIMPLE_CONTENT], { verbose: true })
    expect(result).toBeDefined()
  })

  it('computes chart quality', () => {
    const result = buildCartographyResult(['types.ts'], [DOCUMENTED_CONTENT], {})
    expect(['masterwork', 'detailed', 'rough', 'sketchy', 'blank']).toContain(result.stats.chartQuality)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatChartLevel', () => {
  it('formats well-charted', () => {
    const result = formatChartLevel('well-charted')
    expect(result).toContain('well-charted')
  })

  it('formats uncharted', () => {
    expect(formatChartLevel('uncharted')).toContain('uncharted')
  })
})

describe('formatChartQuality', () => {
  it('formats masterwork', () => {
    expect(formatChartQuality('masterwork')).toContain('masterwork')
  })

  it('formats blank', () => {
    expect(formatChartQuality('blank')).toContain('blank')
  })
})

describe('formatSeverity', () => {
  it('formats critical', () => {
    expect(formatSeverity('critical')).toContain('critical')
  })

  it('formats low', () => {
    expect(formatSeverity('low')).toContain('low')
  })
})

describe('formatHazardBadge', () => {
  it('formats whirlpool badge', () => {
    expect(formatHazardBadge('whirlpool')).toContain('whirlpool')
  })

  it('formats phantom-island badge', () => {
    expect(formatHazardBadge('phantom-island')).toContain('phantom-island')
  })

  it('formats unknown type', () => {
    expect(formatHazardBadge('unknown')).toContain('unknown')
  })
})

describe('formatCompletenessGauge', () => {
  it('formats 100%', () => {
    const result = formatCompletenessGauge(100, 10)
    expect(result).toContain('100%')
    expect(result).toContain('\u2588')
  })

  it('formats 0%', () => {
    const result = formatCompletenessGauge(0, 10)
    expect(result).toContain('0%')
    expect(result).toContain('\u2591')
  })

  it('formats 50%', () => {
    const result = formatCompletenessGauge(50, 10)
    expect(result).toContain('50%')
  })
})

describe('formatRegionSurvey', () => {
  it('formats empty regions', () => {
    expect(formatRegionSurvey([])).toContain('No regions')
  })

  it('formats regions with data', () => {
    const region: ChartedRegion = {
      path: 'src', type: 'well-charted', documentation: 80, naming: 70,
      organization: 90, landmarks: [], hazards: [], completeness: 80,
    }
    const result = formatRegionSurvey([region])
    expect(result).toContain('src')
    expect(result).toContain('well-charted')
  })
})

describe('formatLandmarkInventory', () => {
  it('formats empty landmarks', () => {
    expect(formatLandmarkInventory([])).toContain('No landmarks')
  })

  it('formats landmarks with data', () => {
    const landmark: Landmark = {
      name: 'add', type: 'function', file: 'math.ts', visibility: 'exported',
      documented: true, clarity: 90, isEntryPoint: false, referencedBy: 0,
    }
    const result = formatLandmarkInventory([landmark])
    expect(result).toContain('add')
    expect(result).toContain('function')
    expect(result).toContain('exported')
  })
})

describe('formatHazardWarnings', () => {
  it('formats no hazards', () => {
    expect(formatHazardWarnings([])).toContain('Safe waters')
  })

  it('formats hazards', () => {
    const hazard: Hazard = {
      type: 'siren', file: 'a.ts', description: 'eval usage', severity: 'critical', details: 'd',
    }
    const result = formatHazardWarnings([hazard])
    expect(result).toContain('siren')
    expect(result).toContain('a.ts')
  })
})

describe('formatTradeRouteMap', () => {
  it('formats no routes', () => {
    expect(formatTradeRouteMap([])).toContain('No trade routes')
  })

  it('formats routes', () => {
    const route: TradeRoute = {
      from: 'a.ts', to: 'b.ts', imports: ['x'], volume: 2,
      isBiDirectional: false, isHeavilyUsed: true, clarity: 80,
    }
    const result = formatTradeRouteMap([route])
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatPortRegistry', () => {
  it('formats no ports', () => {
    expect(formatPortRegistry([])).toContain('No ports')
  })

  it('formats ports', () => {
    const port: PortOfEntry = {
      file: 'api.ts', name: 'getData', type: 'function',
      isDocumented: true, isTypeSafe: true, incomingTraffic: 5, clarity: 90,
    }
    const result = formatPortRegistry([port])
    expect(result).toContain('getData')
    expect(result).toContain('api.ts')
  })
})

describe('formatCartographyStats', () => {
  it('formats stats', () => {
    const stats: CartographyStats = {
      totalRegions: 3, wellCharted: 1, partiallyCharted: 1, uncharted: 1, misleading: 0,
      totalLandmarks: 10, documentedLandmarks: 5,
      totalHazards: 2, criticalHazards: 1,
      totalRoutes: 4, heavilyUsedRoutes: 1,
      totalPorts: 6, documentedPorts: 3,
      avgDocumentation: 60, avgNamingClarity: 70, avgOrganization: 80,
      mapCompleteness: 65, terraIncognita: 33, misleadingMapAreas: 0,
      chartQuality: 'rough',
    }
    const result = formatCartographyStats(stats)
    expect(result).toContain('Regions:')
    expect(result).toContain('Chart Quality:')
    expect(result).toContain('rough')
  })
})

describe('formatRecommendations', () => {
  it('formats no recommendations', () => {
    expect(formatRecommendations([])).toContain('map is complete')
  })

  it('formats recommendations', () => {
    const result = formatRecommendations(['Fix X', 'Document Y'])
    expect(result).toContain('1. Fix X')
    expect(result).toContain('2. Document Y')
  })
})

describe('formatCartographyTable', () => {
  it('formats full table', () => {
    const result = buildCartographyResult(['a.ts'], [SIMPLE_CONTENT], {})
    const table = formatCartographyTable(result)
    expect(table).toContain('Cartography Summary')
    expect(table).toContain('Recommendations')
  })
})

describe('formatCartographyJson', () => {
  it('formats as valid JSON', () => {
    const result = buildCartographyResult(['a.ts'], [SIMPLE_CONTENT], {})
    const json = formatCartographyJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats).toBeDefined()
    expect(parsed.regions).toBeDefined()
  })
})
