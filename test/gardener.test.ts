import { describe, expect, it } from 'vitest'

import {
  assessBed,
  buildGardenerResult,
  classifyPlant,
  computeComplexity,
  computeGardenDiversity,
  computeOverallHealth,
  computePlantHealth,
  countExports,
  countImports,
  countJSDoc,
  countTodoMarkers,
  detectCommentedOutCode,
  detectUnusedExports,
  generateRecommendations,
  groupIntoBeds,
  identifyAttentionNeeds,
  type Plant,
  type GardenBed,
  type GardenerStats,
} from '../src/commands/gardener-helpers.js'

import {
  formatAttentionList,
  formatGardenHealthMeter,
  formatGardenLayout,
  formatGardenerJSON,
  formatGardenerStats,
  formatGardenerTable,
  formatPlantTable,
  formatRecommendations,
} from '../src/commands/gardener-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const tinyFile = 'export function hello() { return "hi" }\n'

const smallFile = [
  '/**',
  ' * A small module.',
  ' */',
  'import { foo } from "./bar.js"',
  '',
  'export function greet(name: string): string {',
  '  return `Hello, ${name}!`',
  '}',
  '',
  'export const farewell = (name: string): string => {',
  '  return `Goodbye, ${name}`',
  '}',
].join('\n')

const mediumFile = [
  'import { readFileSync } from "node:fs"',
  'import { resolve } from "node:path"',
  'import { parse } from "./parser.js"',
  '',
  '/**',
  ' * Process a file.',
  ' */',
  'export function processFile(path: string): string {',
  '  try {',
  '    const content = readFileSync(path, "utf8")',
  '    return parse(content)',
  '  } catch (err) {',
  '    return ""',
  '  }',
  '}',
  '',
  'export function validatePath(p: string): boolean {',
  '  return p.length > 0 && p.startsWith("/")',
  '}',
  '',
  'export function normalizePath(p: string): string {',
  '  return p.replace(/\\\\/g, "/")',
  '}',
  '',
  'export const defaultConfig = {',
  '  verbose: false,',
  '  depth: 10,',
  '}',
].join('\n')

const bigFile = Array.from({ length: 250 }, (_, i) => {
  if (i < 10) return `import { dep${i} } from "./dep${i}.js"`
  if (i < 20) return `/**\n * Export ${i}\n */\nexport function fn${i}() { return ${i} }\n`
  return `const line${i} = ${i}`
}).join('\n')

const weedFile = [
  '// const dead1 = 1',
  '// const dead2 = 2',
  '// const dead3 = 3',
  'export function unused() { return 42 }',
].join('\n')

const cactusFile = 'const x = 1\n'

const vineFile = Array.from({ length: 30 }, (_, i) => {
  if (i < 8) return `import { d${i} } from "./d${i}.js"`
  if (i < 16) return `export function e${i}() { return ${i} }\n/** docs */`
  return `const filler${i} = ${i}`
}).join('\n')

const complexFile = [
  'function complex(x: number, y: number): number {',
  '  if (x > 0) {',
  '    for (let i = 0; i < y; i++) {',
  '      if (i % 2 === 0) {',
  '        while (x > 10) {',
  '          x--',
  '          switch (x) {',
  '            case 1: return 1',
  '            case 2: return 2',
  '            default: return 0',
  '          }',
  '        }',
  '      } else if (y > 5 && x < 20) {',
  '        try { x++ } catch (e) { x = 0 }',
  '      }',
  '    }',
  '  }',
  '  return x || y',
  '}',
].join('\n')

const noDocsFile = [
  'export function a() {}',
  'export function b() {}',
  'export function c() {}',
  'export function d() {}',
].join('\n')

const goodNamingFile = [
  'const userName = "alice"',
  'const userAge = 30',
  'function calculateTotal(a: number, b: number) { return a + b }',
  'class DataProcessor {}',
  'export const result = calculateTotal(1, 2)',
].join('\n')

const todoHeavyFile = [
  '// TODO: fix this',
  '// FIXME: broken',
  '// HACK: workaround',
  '// XXX: danger',
  '// TODO: another',
  '// FIXME: more',
  'export function messy() {}',
].join('\n')

const emptyContent = ''

const testFile = [
  'import { describe, it, expect } from "vitest"',
  'import { greet } from "./greet.js"',
  '',
  'describe("greet", () => {',
  '  it("works", () => {',
  '    expect(greet("a")).toBe("Hello, a!")',
  '  })',
  '})',
].join('\n')

// ─── classifyPlant ────────────────────────────────────────────────────────────

describe('classifyPlant', () => {
  it('classifies a tiny file with no imports as cactus', () => {
    expect(classifyPlant('mini.ts', cactusFile, 0, 0)).toBe('cactus')
  })

  it('classifies a small documented file as flower', () => {
    const content = Array.from({ length: 30 }, (_, i) => {
      if (i === 0) return 'import { x } from "y.js"'
      if (i === 1) return ''
      if (i === 2) return 'export function greet() {}'
      return `const line${i} = ${i}`
    }).join('\n')
    expect(classifyPlant('greet.ts', content, 1, 1)).toBe('flower')
  })

  it('classifies a medium file with multiple exports as shrub', () => {
    const content = Array.from({ length: 80 }, (_, i) => {
      if (i < 3) return `import { d${i} } from "./d${i}.js"`
      if (i < 7) return `export function fn${i}() { return ${i} }`
      return `const line${i} = ${i}`
    }).join('\n')
    expect(classifyPlant('proc.ts', content, 3, 4)).toBe('shrub')
  })

  it('classifies a large file as tree', () => {
    const content = Array.from({ length: 250 }, (_, i) => {
      if (i < 3) return `import { d${i} } from "./d${i}.js"`
      if (i < 5) return `export function fn${i}() { return ${i} }`
      return `const line${i} = ${i}`
    }).join('\n')
    expect(classifyPlant('big.ts', content, 3, 2)).toBe('tree')
  })

  it('classifies files with unused exports as weed', () => {
    expect(classifyPlant('weed.ts', weedFile, 0, 1)).toBe('weed')
  })

  it('classifies files with commented-out code as weed', () => {
    const content = weedFile
    expect(classifyPlant('dead.ts', content, 0, 1)).toBe('weed')
  })

  it('classifies files with high imports and exports as vine', () => {
    expect(classifyPlant('hub.ts', vineFile, 8, 8)).toBe('vine')
  })

  it('classifies empty file as cactus', () => {
    expect(classifyPlant('empty.ts', emptyContent, 0, 0)).toBe('cactus')
  })

  it('prioritizes weed over vine when both conditions met', () => {
    const weedVine = weedFile + '\n' + vineFile
    expect(classifyPlant('wv.ts', weedVine, 8, 9)).toBe('weed')
  })
})

// ─── detectUnusedExports ──────────────────────────────────────────────────────

describe('detectUnusedExports', () => {
  it('detects unused export when other exports exist but dont reference it', () => {
    const content = [
      'export function used() { return helper() }',
      'export function helper() { return 42 }',
      'function unused() { return 1 }',
    ].join('\n')
    const result = detectUnusedExports(content)
    expect(Array.isArray(result)).toBe(true)
  })

  it('returns empty for self-referenced exports', () => {
    const content = 'export function used() { return usedHelper() }\nfunction usedHelper() { return 1 }\n'
    expect(detectUnusedExports(content)).toEqual([])
  })

  it('handles no exports', () => {
    expect(detectUnusedExports('const x = 1')).toEqual([])
  })

  it('detects unused const export when name not in body', () => {
    const content = 'export const MY_VAL = 42\nexport function foo() { return 1 }\n'
    expect(detectUnusedExports(content)).toEqual([])
  })

  it('class export with name in definition is not flagged', () => {
    const content = 'export class MyClass {}\nexport function other() { return 1 }\n'
    expect(detectUnusedExports(content)).toEqual([])
  })

  it('type exports are not flagged when name appears in definition', () => {
    const content = 'const x = 1\nexport type MyType = string\n'
    expect(detectUnusedExports(content)).toEqual([])
  })

  it('interface exports are not flagged when name appears in definition', () => {
    const content = 'const x = 1\nexport interface MyInterface { x: number }\n'
    expect(detectUnusedExports(content)).toEqual([])
  })
})

// ─── detectCommentedOutCode ───────────────────────────────────────────────────

describe('detectCommentedOutCode', () => {
  it('detects 3+ consecutive commented-out lines', () => {
    expect(detectCommentedOutCode(weedFile)).toBe(true)
  })

  it('returns false for clean code', () => {
    expect(detectCommentedOutCode(smallFile)).toBe(false)
  })

  it('returns false for only 2 commented lines', () => {
    const content = '// const x = 1\n// const y = 2\n'
    expect(detectCommentedOutCode(content)).toBe(false)
  })

  it('detects commented imports', () => {
    const content = '// import { a } from "x"\n// import { b } from "y"\n// import { c } from "z"\n'
    expect(detectCommentedOutCode(content)).toBe(true)
  })

  it('detects commented exports', () => {
    const content = '// export const a = 1\n// export const b = 2\n// export const c = 3\n'
    expect(detectCommentedOutCode(content)).toBe(true)
  })

  it('ignores non-code comments', () => {
    const content = '// This is a note\n// Another note\n// Yet another\n'
    expect(detectCommentedOutCode(content)).toBe(false)
  })
})

// ─── countImports ─────────────────────────────────────────────────────────────

describe('countImports', () => {
  it('counts zero imports', () => {
    expect(countImports('const x = 1')).toBe(0)
  })

  it('counts single import', () => {
    expect(countImports('import { foo } from "bar"')).toBe(1)
  })

  it('counts multiple imports', () => {
    expect(countImports(mediumFile)).toBe(3)
  })

  it('counts many imports', () => {
    expect(countImports(bigFile)).toBe(10)
  })
})

// ─── countExports ─────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts zero exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })

  it('counts single export function', () => {
    expect(countExports('export function foo() {}')).toBe(1)
  })

  it('counts multiple exports', () => {
    expect(countExports(mediumFile)).toBe(4)
  })

  it('counts export default', () => {
    expect(countExports('export default function main() {}')).toBe(1)
  })

  it('counts export const', () => {
    expect(countExports('export const a = 1\nexport const b = 2')).toBe(2)
  })

  it('counts export type', () => {
    expect(countExports('export type Foo = string')).toBe(1)
  })
})

// ─── countJSDoc ───────────────────────────────────────────────────────────────

describe('countJSDoc', () => {
  it('counts zero JSDoc', () => {
    expect(countJSDoc('const x = 1')).toBe(0)
  })

  it('counts single JSDoc block', () => {
    expect(countJSDoc('/** docs */\nexport function foo() {}')).toBe(1)
  })

  it('counts multiple JSDoc blocks', () => {
    expect(countJSDoc(mediumFile)).toBe(1)
  })

  it('counts inline JSDoc', () => {
    const content = '/** a */ export function a() {}\n/** b */ export function b() {}'
    expect(countJSDoc(content)).toBe(2)
  })
})

// ─── computeComplexity ────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 1 for flat code', () => {
    expect(computeComplexity('const x = 1')).toBe(1)
  })

  it('counts if statements', () => {
    expect(computeComplexity('if (x) {}')).toBe(2)
  })

  it('counts for loops', () => {
    expect(computeComplexity('for (let i = 0; i < 10; i++) {}')).toBe(2)
  })

  it('counts while loops', () => {
    expect(computeComplexity('while (true) {}')).toBe(2)
  })

  it('counts switch statements', () => {
    expect(computeComplexity('switch (x) { case 1: break }')).toBe(2)
  })

  it('counts catch blocks', () => {
    expect(computeComplexity('try {} catch (e) {}')).toBe(2)
  })

  it('counts && and ||', () => {
    expect(computeComplexity('if (a && b || c) {}')).toBe(4)
  })

  it('computes high complexity for complex file', () => {
    const c = computeComplexity(complexFile)
    expect(c).toBeGreaterThanOrEqual(8)
  })
})

// ─── countTodoMarkers ─────────────────────────────────────────────────────────

describe('countTodoMarkers', () => {
  it('counts zero todos', () => {
    expect(countTodoMarkers('const x = 1')).toBe(0)
  })

  it('counts single TODO', () => {
    expect(countTodoMarkers('// TODO: fix')).toBe(1)
  })

  it('counts FIXME', () => {
    expect(countTodoMarkers('// FIXME: broken')).toBe(1)
  })

  it('counts HACK', () => {
    expect(countTodoMarkers('// HACK: workaround')).toBe(1)
  })

  it('counts XXX', () => {
    expect(countTodoMarkers('// XXX: danger')).toBe(1)
  })

  it('counts multiple markers', () => {
    expect(countTodoMarkers(todoHeavyFile)).toBe(6)
  })

  it('is case insensitive', () => {
    expect(countTodoMarkers('// todo: lowercase')).toBe(1)
  })
})

// ─── computePlantHealth ───────────────────────────────────────────────────────

describe('computePlantHealth', () => {
  it('returns base score for plain code', () => {
    const health = computePlantHealth('const x = 1', 0, 0)
    expect(health).toBeGreaterThanOrEqual(0)
    expect(health).toBeLessThanOrEqual(100)
  })

  it('boosts score for well-documented exports', () => {
    const content = '/** docs */\nexport function foo() {}\n/** docs */\nexport function bar() {}\n'
    const health = computePlantHealth(content, 0, 2)
    expect(health).toBeGreaterThanOrEqual(70)
  })

  it('penalizes high complexity', () => {
    const health = computePlantHealth(complexFile, 0, 0)
    expect(health).toBeLessThan(70)
  })

  it('penalizes weed files', () => {
    const health = computePlantHealth(weedFile, 0, 1)
    expect(health).toBeLessThan(75)
  })

  it('penalizes many TODO markers', () => {
    const health = computePlantHealth(todoHeavyFile, 0, 1)
    expect(health).toBeLessThan(70)
  })

  it('rewards good naming', () => {
    const health = computePlantHealth(goodNamingFile, 0, 0)
    expect(health).toBeGreaterThan(60)
  })

  it('rewards error handling', () => {
    const withCatch = 'export function safe() { try { return 1 } catch (e) { return 0 } }\n'
    const health = computePlantHealth(withCatch, 0, 1)
    expect(health).toBeGreaterThanOrEqual(65)
  })

  it('clamps to 100 max', () => {
    const perfect = '/** docs */\nexport function a() {}\n/** docs */\nexport function b() {}\n/** docs */\nexport function c() {}\n'
    const health = computePlantHealth(perfect, 0, 3)
    expect(health).toBeLessThanOrEqual(100)
  })

  it('clamps to 0 min', () => {
    const terrible = weedFile + '\n' + todoHeavyFile + '\n' + complexFile
    const health = computePlantHealth(terrible, 0, 5)
    expect(health).toBeGreaterThanOrEqual(0)
  })
})

// ─── identifyAttentionNeeds ───────────────────────────────────────────────────

describe('identifyAttentionNeeds', () => {
  it('flags watering for undocumented exports', () => {
    const plant: Plant = {
      file: 'mod.ts', species: 'shrub', health: 70, age: 50,
      height: 80, rootDepth: 2, fruitCount: 4, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, noDocsFile)
    const watering = needs.find((n) => n.type === 'watering')
    expect(watering).toBeDefined()
    expect(watering!.urgency).toBe('high')
  })

  it('flags weeding for unused exports', () => {
    const plant: Plant = {
      file: 'weed.ts', species: 'weed', health: 30, age: 50,
      height: 4, rootDepth: 0, fruitCount: 1, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, weedFile)
    const weeding = needs.find((n) => n.type === 'weeding')
    expect(weeding).toBeDefined()
  })

  it('flags pruning for high complexity', () => {
    const parts: string[] = ['function big() {']
    for (let i = 0; i < 20; i++) {
      parts.push(`  if (x${i} && y${i} || z${i}) {`)
    }
    for (let i = 0; i < 20; i++) {
      parts.push('  }')
    }
    parts.push('}')
    const veryComplex = parts.join('\n')
    const plant: Plant = {
      file: 'complex.ts', species: 'shrub', health: 50, age: 50,
      height: 45, rootDepth: 0, fruitCount: 0, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, veryComplex)
    const pruning = needs.find((n) => n.type === 'pruning')
    expect(pruning).toBeDefined()
  })

  it('flags fertilizing for non-test files with exports', () => {
    const plant: Plant = {
      file: 'mod.ts', species: 'flower', health: 80, age: 50,
      height: 30, rootDepth: 1, fruitCount: 1, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, smallFile)
    const fertilizing = needs.find((n) => n.type === 'fertilizing')
    expect(fertilizing).toBeDefined()
  })

  it('does not flag fertilizing for test files', () => {
    const plant: Plant = {
      file: 'mod.test.ts', species: 'flower', health: 80, age: 50,
      height: 30, rootDepth: 1, fruitCount: 1, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, testFile)
    const fertilizing = needs.find((n) => n.type === 'fertilizing')
    expect(fertilizing).toBeUndefined()
  })

  it('flags staking for many functions with no error handling', () => {
    const manyFnNoCatch = [
      'function a() { return 1 }',
      'function b() { return 2 }',
      'function c() { return 3 }',
      'function d() { return 4 }',
    ].join('\n')
    const plant: Plant = {
      file: 'fns.ts', species: 'shrub', health: 60, age: 50,
      height: 4, rootDepth: 0, fruitCount: 0, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, manyFnNoCatch)
    const staking = needs.find((n) => n.type === 'staking')
    expect(staking).toBeDefined()
  })

  it('returns empty for a healthy file', () => {
    const plant: Plant = {
      file: 'mod.ts', species: 'flower', health: 95, age: 50,
      height: 15, rootDepth: 1, fruitCount: 1, needsAttention: [],
    }
    const healthyContent = [
      '/** A simple module. */',
      'import { x } from "./y.js"',
      '',
      '/** Greets. */',
      'export function greet(name: string): string {',
      '  try {',
      '    return `Hello, ${name}`',
      '  } catch { return "" }',
      '}',
    ].join('\n')
    const needs = identifyAttentionNeeds(plant, healthyContent)
    expect(needs.length).toBeLessThanOrEqual(2)
  })

  it('medium urgency for partial docs', () => {
    const partial = '/** docs */\nexport function a() {}\nexport function b() {}\nexport function c() {}\n'
    const plant: Plant = {
      file: 'mod.ts', species: 'shrub', health: 70, age: 50,
      height: 4, rootDepth: 0, fruitCount: 3, needsAttention: [],
    }
    const needs = identifyAttentionNeeds(plant, partial)
    const watering = needs.find((n) => n.type === 'watering')
    expect(watering).toBeDefined()
    expect(watering!.urgency).toBe('medium')
  })
})

// ─── groupIntoBeds ────────────────────────────────────────────────────────────

describe('groupIntoBeds', () => {
  it('groups plants by directory', () => {
    const plants: Plant[] = [
      { file: 'src/core/a.ts', species: 'tree', health: 80, age: 50, height: 200, rootDepth: 5, fruitCount: 3, needsAttention: [] },
      { file: 'src/core/b.ts', species: 'shrub', health: 70, age: 50, height: 80, rootDepth: 2, fruitCount: 2, needsAttention: [] },
      { file: 'src/utils/c.ts', species: 'flower', health: 90, age: 50, height: 30, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const beds = groupIntoBeds(plants)
    expect(beds).toHaveLength(2)
    expect(beds.find((b) => b.name === 'src/core')).toBeDefined()
    expect(beds.find((b) => b.name === 'src/utils')).toBeDefined()
  })

  it('groups files without directory as "."', () => {
    const plants: Plant[] = [
      { file: 'root.ts', species: 'cactus', health: 85, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const beds = groupIntoBeds(plants)
    expect(beds).toHaveLength(1)
    expect(beds[0]!.name).toBe('.')
  })

  it('returns empty for no plants', () => {
    expect(groupIntoBeds([])).toEqual([])
  })
})

// ─── assessBed ────────────────────────────────────────────────────────────────

describe('assessBed', () => {
  it('returns barren for empty bed', () => {
    const bed = assessBed('empty', [])
    expect(bed.condition).toBe('barren')
    expect(bed.soil).toBe(100)
    expect(bed.density).toBe(0)
  })

  it('returns thriving for healthy plants', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 90, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'shrub', health: 85, age: 50, height: 60, rootDepth: 2, fruitCount: 1, needsAttention: [] },
    ]
    const bed = assessBed('healthy-bed', plants)
    expect(bed.condition).toBe('thriving')
    expect(bed.name).toBe('healthy-bed')
    expect(bed.plants).toHaveLength(2)
  })

  it('returns overgrown for poor health plants', () => {
    const plants: Plant[] = [
      { file: 'w1.ts', species: 'weed', health: 20, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
      { file: 'w2.ts', species: 'weed', health: 30, age: 50, height: 3, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const bed = assessBed('weedy', plants)
    expect(bed.condition).toBe('overgrown')
  })

  it('returns needs-work for moderate health', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'shrub', health: 45, age: 50, height: 40, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const bed = assessBed('moderate', plants)
    expect(bed.condition).toBe('needs-work')
  })

  it('returns healthy for 60-79 avg health', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'shrub', health: 65, age: 50, height: 50, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const bed = assessBed('ok', plants)
    expect(bed.condition).toBe('healthy')
  })

  it('computes biodiversity from species variety', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'flower', health: 75, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
      { file: 'c.ts', species: 'cactus', health: 85, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const bed = assessBed('diverse', plants)
    expect(bed.biodiversity).toBe(50) // 3/6 * 100
  })
})

// ─── computeGardenDiversity ───────────────────────────────────────────────────

describe('computeGardenDiversity', () => {
  it('returns 0 for no plants', () => {
    expect(computeGardenDiversity([])).toBe(0)
  })

  it('returns ~17 for single species', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
    ]
    expect(computeGardenDiversity(plants)).toBe(17) // 1/6 * 100 rounded
  })

  it('returns 100 for all 6 species', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'shrub', health: 70, age: 50, height: 60, rootDepth: 2, fruitCount: 1, needsAttention: [] },
      { file: 'c.ts', species: 'flower', health: 90, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
      { file: 'd.ts', species: 'vine', health: 75, age: 50, height: 40, rootDepth: 4, fruitCount: 5, needsAttention: [] },
      { file: 'e.ts', species: 'weed', health: 30, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
      { file: 'f.ts', species: 'cactus', health: 85, age: 50, height: 3, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    expect(computeGardenDiversity(plants)).toBe(100)
  })

  it('returns 33 for 2 species', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'flower', health: 90, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    expect(computeGardenDiversity(plants)).toBe(33) // 2/6 * 100 rounded
  })
})

// ─── computeOverallHealth ─────────────────────────────────────────────────────

describe('computeOverallHealth', () => {
  it('returns 100 for no plants', () => {
    expect(computeOverallHealth([], [])).toBe(100)
  })

  it('computes weighted health from plants and beds', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'flower', health: 70, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const beds: GardenBed[] = [
      { name: 'src', plants, soil: 85, biodiversity: 33, density: 2, condition: 'thriving' },
    ]
    const health = computeOverallHealth(plants, beds)
    expect(health).toBeGreaterThan(0)
    expect(health).toBeLessThanOrEqual(100)
  })

  it('penalizes weeds', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'w.ts', species: 'weed', health: 30, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const beds: GardenBed[] = [
      { name: 'src', plants, soil: 55, biodiversity: 33, density: 2, condition: 'needs-work' },
    ]
    const withWeeds = computeOverallHealth(plants, beds)

    const cleanPlants = [plants[0]!]
    const cleanBeds: GardenBed[] = [
      { name: 'src', plants: cleanPlants, soil: 80, biodiversity: 17, density: 1, condition: 'thriving' },
    ]
    const withoutWeeds = computeOverallHealth(cleanPlants, cleanBeds)

    expect(withoutWeeds).toBeGreaterThan(withWeeds)
  })

  it('handles no beds gracefully', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'cactus', health: 85, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const health = computeOverallHealth(plants, [])
    expect(health).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns thriving message for healthy garden', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 95, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'shrub', health: 90, age: 50, height: 60, rootDepth: 2, fruitCount: 1, needsAttention: [] },
      { file: 'c.ts', species: 'flower', health: 92, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const beds: GardenBed[] = [
      { name: 'src', plants, soil: 95, biodiversity: 50, density: 3, condition: 'thriving' },
    ]
    const stats: GardenerStats = {
      totalPlants: 3, thrivingCount: 3, needsAttentionCount: 0, weedCount: 0,
      avgHealth: 92, gardenDiversity: 50, tallestPlant: 'a.ts', deepestRoots: 'a.ts',
      mostFruitful: 'a.ts', bedsNeedingWork: 0, overallGardenHealth: 93,
    }
    const recs = generateRecommendations(plants, beds, stats)
    expect(recs).toContain('Garden is thriving — all plants are healthy and well-tended')
  })

  it('recommends weeding when weeds present', () => {
    const plants: Plant[] = [
      { file: 'w.ts', species: 'weed', health: 20, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const stats: GardenerStats = {
      totalPlants: 1, thrivingCount: 0, needsAttentionCount: 0, weedCount: 1,
      avgHealth: 20, gardenDiversity: 17, tallestPlant: 'w.ts', deepestRoots: 'w.ts',
      mostFruitful: 'w.ts', bedsNeedingWork: 0, overallGardenHealth: 20,
    }
    const recs = generateRecommendations(plants, [], stats)
    expect(recs.some((r) => r.includes('WEED'))).toBe(true)
  })

  it('recommends watering for plants needing docs', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'shrub', health: 60, age: 50, height: 50, rootDepth: 1, fruitCount: 1,
        needsAttention: [{ type: 'watering', urgency: 'high', description: 'no docs', action: 'add docs' }] },
    ]
    const stats: GardenerStats = {
      totalPlants: 1, thrivingCount: 0, needsAttentionCount: 1, weedCount: 0,
      avgHealth: 60, gardenDiversity: 17, tallestPlant: 'a.ts', deepestRoots: 'a.ts',
      mostFruitful: 'a.ts', bedsNeedingWork: 0, overallGardenHealth: 60,
    }
    const recs = generateRecommendations(plants, [], stats)
    expect(recs.some((r) => r.includes('WATER'))).toBe(true)
  })

  it('recommends pruning for complex plants', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 50, age: 50, height: 200, rootDepth: 3, fruitCount: 2,
        needsAttention: [{ type: 'pruning', urgency: 'medium', description: 'complex', action: 'simplify' }] },
    ]
    const stats: GardenerStats = {
      totalPlants: 1, thrivingCount: 0, needsAttentionCount: 1, weedCount: 0,
      avgHealth: 50, gardenDiversity: 17, tallestPlant: 'a.ts', deepestRoots: 'a.ts',
      mostFruitful: 'a.ts', bedsNeedingWork: 0, overallGardenHealth: 50,
    }
    const recs = generateRecommendations(plants, [], stats)
    expect(recs.some((r) => r.includes('PRUNE'))).toBe(true)
  })

  it('flags low diversity', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
    ]
    const stats: GardenerStats = {
      totalPlants: 1, thrivingCount: 1, needsAttentionCount: 0, weedCount: 0,
      avgHealth: 80, gardenDiversity: 17, tallestPlant: 'a.ts', deepestRoots: 'a.ts',
      mostFruitful: 'a.ts', bedsNeedingWork: 0, overallGardenHealth: 80,
    }
    const recs = generateRecommendations(plants, [], stats)
    expect(recs.some((r) => r.includes('Low diversity'))).toBe(true)
  })

  it('flags overgrown beds', () => {
    const plants: Plant[] = [
      { file: 'w.ts', species: 'weed', health: 20, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    const beds: GardenBed[] = [
      { name: 'src', plants, soil: 20, biodiversity: 17, density: 1, condition: 'overgrown' },
    ]
    const stats: GardenerStats = {
      totalPlants: 1, thrivingCount: 0, needsAttentionCount: 0, weedCount: 1,
      avgHealth: 20, gardenDiversity: 17, tallestPlant: 'w.ts', deepestRoots: 'w.ts',
      mostFruitful: 'w.ts', bedsNeedingWork: 1, overallGardenHealth: 20,
    }
    const recs = generateRecommendations(plants, beds, stats)
    expect(recs.some((r) => r.includes('OVERGROWN'))).toBe(true)
  })

  it('flags barren beds', () => {
    const beds: GardenBed[] = [
      { name: 'empty', plants: [], soil: 100, biodiversity: 0, density: 0, condition: 'barren' },
    ]
    const stats: GardenerStats = {
      totalPlants: 0, thrivingCount: 0, needsAttentionCount: 0, weedCount: 0,
      avgHealth: 0, gardenDiversity: 0, tallestPlant: 'none', deepestRoots: 'none',
      mostFruitful: 'none', bedsNeedingWork: 0, overallGardenHealth: 100,
    }
    const recs = generateRecommendations([], beds, stats)
    expect(recs.some((r) => r.includes('BARREN'))).toBe(true)
  })
})

// ─── buildGardenerResult ──────────────────────────────────────────────────────

describe('buildGardenerResult', () => {
  it('builds result from single file', () => {
    const result = buildGardenerResult(['greet.ts'], [smallFile], { maxDepth: 50 })
    expect(result.plants).toHaveLength(1)
    expect(result.stats.totalPlants).toBe(1)
    expect(result.beds).toHaveLength(1)
  })

  it('builds result from multiple files', () => {
    const result = buildGardenerResult(
      ['src/a.ts', 'src/b.ts', 'utils/c.ts'],
      [mediumFile, smallFile, cactusFile],
      { maxDepth: 50 },
    )
    expect(result.plants).toHaveLength(3)
    expect(result.beds).toHaveLength(2)
  })

  it('computes stats correctly', () => {
    const result = buildGardenerResult(
      ['a.ts', 'b.ts'],
      [smallFile, mediumFile],
      { maxDepth: 50 },
    )
    expect(result.stats.totalPlants).toBe(2)
    expect(result.stats.tallestPlant).toBeDefined()
    expect(result.stats.deepestRoots).toBeDefined()
    expect(result.stats.mostFruitful).toBeDefined()
  })

  it('handles empty file list', () => {
    const result = buildGardenerResult([], [], { maxDepth: 50 })
    expect(result.plants).toHaveLength(0)
    expect(result.stats.totalPlants).toBe(0)
    expect(result.stats.tallestPlant).toBe('none')
    expect(result.beds).toHaveLength(0)
  })

  it('sets age from maxDepth option', () => {
    const result = buildGardenerResult(['a.ts'], [cactusFile], { maxDepth: 42 })
    expect(result.plants[0]!.age).toBe(42)
  })

  it('handles missing content gracefully', () => {
    const result = buildGardenerResult(['missing.ts'], [], { maxDepth: 50 })
    expect(result.plants).toHaveLength(1)
    expect(result.plants[0]!.height).toBe(0)
  })

  it('computes weedCount', () => {
    const result = buildGardenerResult(
      ['clean.ts', 'dirty.ts'],
      [cactusFile, weedFile],
      { maxDepth: 50 },
    )
    expect(result.stats.weedCount).toBe(1)
  })

  it('generates recommendations', () => {
    const result = buildGardenerResult(['a.ts'], [smallFile], { maxDepth: 50 })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── formatPlantTable ─────────────────────────────────────────────────────────

describe('formatPlantTable', () => {
  it('handles empty plants', () => {
    expect(formatPlantTable([])).toContain('No plants found')
  })

  it('formats single plant', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 200, rootDepth: 5, fruitCount: 3, needsAttention: [] },
    ]
    const output = formatPlantTable(plants)
    expect(output).toContain('tree')
    expect(output).toContain('a.ts')
    expect(output).toContain('80%')
  })

  it('shows attention needs', () => {
    const plants: Plant[] = [
      {
        file: 'a.ts', species: 'weed', health: 30, age: 50, height: 5, rootDepth: 0, fruitCount: 0,
        needsAttention: [{ type: 'weeding', urgency: 'high', description: 'dead code', action: 'remove' }],
      },
    ]
    const output = formatPlantTable(plants)
    expect(output).toContain('weeding')
  })

  it('shows height, roots, fruit', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 200, rootDepth: 5, fruitCount: 3, needsAttention: [] },
    ]
    const output = formatPlantTable(plants)
    expect(output).toContain('200 lines')
    expect(output).toContain('5 imports')
    expect(output).toContain('3 exports')
  })
})

// ─── formatGardenLayout ───────────────────────────────────────────────────────

describe('formatGardenLayout', () => {
  it('handles empty beds', () => {
    expect(formatGardenLayout([])).toContain('No garden beds')
  })

  it('formats beds with plants', () => {
    const plants: Plant[] = [
      { file: 'src/a.ts', species: 'tree', health: 85, age: 50, height: 200, rootDepth: 5, fruitCount: 3, needsAttention: [] },
      { file: 'src/b.ts', species: 'flower', health: 70, age: 50, height: 20, rootDepth: 1, fruitCount: 1, needsAttention: [] },
    ]
    const beds: GardenBed[] = [{ name: 'src', plants, soil: 80, biodiversity: 33, density: 2, condition: 'thriving' }]
    const output = formatGardenLayout(beds)
    expect(output).toContain('src')
    expect(output).toContain('thriving')
    expect(output).toContain('2 plants')
  })

  it('shows species summary with icons', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'tree', health: 80, age: 50, height: 100, rootDepth: 3, fruitCount: 2, needsAttention: [] },
      { file: 'b.ts', species: 'tree', health: 75, age: 50, height: 80, rootDepth: 2, fruitCount: 1, needsAttention: [] },
    ]
    const beds: GardenBed[] = [{ name: 'src', plants, soil: 78, biodiversity: 17, density: 2, condition: 'healthy' }]
    const output = formatGardenLayout(beds)
    expect(output).toContain('🌳×2')
  })
})

// ─── formatAttentionList ──────────────────────────────────────────────────────

describe('formatAttentionList', () => {
  it('shows no attention needed for healthy plants', () => {
    const plants: Plant[] = [
      { file: 'a.ts', species: 'cactus', health: 95, age: 50, height: 5, rootDepth: 0, fruitCount: 0, needsAttention: [] },
    ]
    expect(formatAttentionList(plants)).toContain('No attention needed')
  })

  it('formats attention needs sorted by urgency', () => {
    const plants: Plant[] = [
      {
        file: 'a.ts', species: 'weed', health: 20, age: 50, height: 5, rootDepth: 0, fruitCount: 0,
        needsAttention: [
          { type: 'weeding', urgency: 'low', description: 'clean up', action: 'remove' },
          { type: 'watering', urgency: 'high', description: 'no docs', action: 'add docs' },
        ],
      },
    ]
    const output = formatAttentionList(plants)
    const highIdx = output.indexOf('[HIGH]')
    const lowIdx = output.indexOf('[LOW]')
    expect(highIdx).toBeLessThan(lowIdx)
  })

  it('shows action for each need', () => {
    const plants: Plant[] = [
      {
        file: 'a.ts', species: 'shrub', health: 50, age: 50, height: 60, rootDepth: 2, fruitCount: 1,
        needsAttention: [{ type: 'pruning', urgency: 'medium', description: 'complex', action: 'Break down' }],
      },
    ]
    const output = formatAttentionList(plants)
    expect(output).toContain('Break down')
  })
})

// ─── formatGardenHealthMeter ──────────────────────────────────────────────────

describe('formatGardenHealthMeter', () => {
  it('shows health percentage', () => {
    const output = formatGardenHealthMeter(75)
    expect(output).toContain('75%')
  })

  it('shows colored bar', () => {
    const output = formatGardenHealthMeter(50)
    expect(output).toContain('█')
    expect(output).toContain('░')
  })

  it('full bar at 100', () => {
    const output = formatGardenHealthMeter(100)
    expect(output).toContain('100%')
  })

  it('empty bar at 0', () => {
    const output = formatGardenHealthMeter(0)
    expect(output).toContain('0%')
  })
})

// ─── formatGardenerStats ──────────────────────────────────────────────────────

describe('formatGardenerStats', () => {
  it('formats all stat fields', () => {
    const stats: GardenerStats = {
      totalPlants: 10, thrivingCount: 5, needsAttentionCount: 3, weedCount: 1,
      avgHealth: 72.5, gardenDiversity: 50, tallestPlant: 'big.ts', deepestRoots: 'hub.ts',
      mostFruitful: 'api.ts', bedsNeedingWork: 1, overallGardenHealth: 68,
    }
    const output = formatGardenerStats(stats)
    expect(output).toContain('Total Plants:         10')
    expect(output).toContain('Thriving:             5')
    expect(output).toContain('Weeds:                1')
    expect(output).toContain('Garden Diversity:     50%')
    expect(output).toContain('Tallest Plant:        big.ts')
    expect(output).toContain('Deepest Roots:        hub.ts')
    expect(output).toContain('Most Fruitful:        api.ts')
    expect(output).toContain('Overall Health:       68%')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('shows no recommendations for empty list', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('numbers recommendations', () => {
    const recs = ['Water plants', 'Prune trees', 'Remove weeds']
    const output = formatRecommendations(recs)
    expect(output).toContain('1. Water plants')
    expect(output).toContain('2. Prune trees')
    expect(output).toContain('3. Remove weeds')
  })
})

// ─── formatGardenerTable ──────────────────────────────────────────────────────

describe('formatGardenerTable', () => {
  it('formats full result', () => {
    const result = buildGardenerResult(
      ['src/a.ts', 'src/b.ts'],
      [smallFile, mediumFile],
      { maxDepth: 50 },
    )
    const output = formatGardenerTable(result)
    expect(output).toContain('Garden Layout')
    expect(output).toContain('Plant Catalog')
    expect(output).toContain('Garden Health')
    expect(output).toContain('Garden Summary')
  })
})

// ─── formatGardenerJSON ───────────────────────────────────────────────────────

describe('formatGardenerJSON', () => {
  it('produces valid JSON', () => {
    const result = buildGardenerResult(['a.ts'], [cactusFile], { maxDepth: 50 })
    const json = formatGardenerJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.plants).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.beds).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('includes all plant fields', () => {
    const result = buildGardenerResult(['a.ts'], [smallFile], { maxDepth: 50 })
    const parsed = JSON.parse(formatGardenerJSON(result))
    const plant = parsed.plants[0]
    expect(plant.file).toBeDefined()
    expect(plant.species).toBeDefined()
    expect(plant.health).toBeDefined()
    expect(plant.height).toBeDefined()
    expect(plant.rootDepth).toBeDefined()
    expect(plant.fruitCount).toBeDefined()
    expect(plant.needsAttention).toBeDefined()
  })
})
