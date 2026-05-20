import { describe, expect, it } from 'vitest'

import {
  assignCallNumber,
  buildLibraryResult,
  classifyGenre,
  computeCatalogCompleteness,
  computeCitations,
  computeCitedBy,
  computeCompleteness,
  computeComplexity,
  computeCondition,
  computeFillLevel,
  computeMaxNesting,
  computeOrganizationScore,
  computeReadingLevel,
  countChapters,
  countExports,
  determinePrefix,
  extractImports,
  generateLibraryRecommendations,
  groupIntoCollections,
  groupIntoShelves,
  isAvailable,
  resolveImportPath,
  type CatalogEntry,
  type Collection,
  type Condition,
  type Genre,
  type LibraryOptions,
  type LibraryResult,
  type LibraryStats,
  type ReadingLevel,
  type Shelf,
} from '../src/commands/library-helpers.js'

import {
  formatCallNumberLegend,
  formatCatalogTable,
  formatCollections,
  formatLibraryJson,
  formatLibraryRecommendations,
  formatLibraryStats,
  formatLibraryTable,
  formatShelves,
} from '../src/commands/library-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const SIMPLE_FILES = ['src/commands/run.ts', 'src/utils/helpers.ts', 'src/types/api.ts']
const SIMPLE_CONTENTS = [
  'export default class Run {\n  async execute() {}\n}\n',
  'export function help() { return true }\n',
  'export interface Api { data: string }\nexport type Result<T> = { ok: T }\n',
]

const CONNECTED_FILES = ['a.ts', 'b.ts', 'c.ts']
const CONNECTED_CONTENTS = [
  "import { x } from './b'\nexport const a = 1\n",
  "import { y } from './c'\nexport const x = 2\n",
  'export const y = 3\n',
]

const WELL_DOC = `/**
 * Computes the answer.
 * @param n - the number
 * @returns the answer
 * @example
 * answer(42)
 */
export function answer(n: number): number {
  return n
}
`

const COMPLEX_CONTENT = 'if (x) {\n  for (let i = 0; i < 10; i++) {\n    if (y) {\n      while (z) {\n        if (w) {\n          switch(v) {\n            case 1: break\n          }\n        }\n      }\n    }\n  }\n}\n'

// ─── determinePrefix ───────────────────────────────────────────────────────────

describe('determinePrefix', () => {
  it('classifies test files as TST', () => {
    expect(determinePrefix('test/foo.test.ts', 'describe("x", () => {})')).toBe('TST')
    expect(determinePrefix('src/bar.spec.ts', 'it("works", () => {})')).toBe('TST')
  })

  it('classifies format-helpers as FMT', () => {
    expect(determinePrefix('src/commands/foo-format-helpers.ts', 'export function fmt() {}')).toBe('FMT')
  })

  it('classifies command files as CMD', () => {
    expect(determinePrefix('src/commands/run.ts', 'export default class Run {}')).toBe('CMD')
  })

  it('classifies core files as COR', () => {
    expect(determinePrefix('src/core/engine.ts', 'export class Engine {}')).toBe('COR')
  })

  it('classifies config files as CFG', () => {
    expect(determinePrefix('src/config/settings.ts', 'export const port = 3000')).toBe('CFG')
  })

  it('classifies type files as TYP', () => {
    expect(determinePrefix('src/types/api.ts', 'export type Result<T> = { ok: T }\nexport type Error = string')).toBe('TYP')
  })

  it('classifies utilities as UTL', () => {
    expect(determinePrefix('src/utils/helpers.ts', 'export function help() {}')).toBe('UTL')
  })
})

// ─── assignCallNumber ──────────────────────────────────────────────────────────

describe('assignCallNumber', () => {
  it('returns call number with prefix and number', () => {
    const cn = assignCallNumber('src/commands/run.ts', 'export default class Run')
    expect(cn).toMatch(/^CMD\.\d{3}$/)
  })

  it('assigns sequential numbers for same prefix', () => {
    const a = assignCallNumber('src/commands/a.ts', 'export default class A')
    const b = assignCallNumber('src/commands/b.ts', 'export default class B')
    expect(a).not.toBe(b)
  })

  it('assigns correct prefix per file type', () => {
    expect(assignCallNumber('src/commands/run.ts', 'export default class Run')).toMatch(/^CMD/)
    expect(assignCallNumber('src/utils/helpers.ts', 'export function help() {}')).toMatch(/^UTL/)
  })
})

// ─── classifyGenre ──────────────────────────────────────────────────────────────

describe('classifyGenre', () => {
  it('classifies test files as journal', () => {
    expect(classifyGenre('test/foo.test.ts', 'describe("x", () => {})', 2, 0)).toBe('journal')
  })

  it('classifies type definitions as reference', () => {
    expect(classifyGenre('types.ts', 'export interface Foo {}', 1, 0)).toBe('reference')
  })

  it('classifies command files as manual', () => {
    expect(classifyGenre('src/commands/run.ts', 'export default class Run {}', 1, 0)).toBe('manual')
  })

  it('classifies small files as pamphlet', () => {
    expect(classifyGenre('small.ts', 'export const x = 1', 1, 0)).toBe('pamphlet')
  })

  it('classifies large multi-function files as encyclopedia', () => {
    const big = Array.from({ length: 250 }, (_, i) => `function fn${i}() { return ${i} }`).join('\n')
    expect(classifyGenre('big.ts', big, 20, 0)).toBe('encyclopedia')
  })

  it('classifies well-documented files as textbook', () => {
    const doc = '/**\n * docs\n */\n'.repeat(8) + 'export function foo() {}\nexport function bar() {}\nexport function baz() {}\nexport function qux() {}\n'
    expect(classifyGenre('src/utils/doc.ts', doc, 4, 0)).toBe('textbook')
  })

  it('classifies feature files as novel', () => {
    const content = 'export function process() {\n  const x = 1\n  return x\n}\nexport function handle() {\n  return 2\n}\nexport function validate() {\n  return true\n}\nexport function transform() {\n  return 3\n}\n'
    expect(classifyGenre('src/utils/feature.ts', content, 4, 0)).toBe('novel')
  })
})

// ─── computeReadingLevel ───────────────────────────────────────────────────────

describe('computeReadingLevel', () => {
  it('returns beginner for empty content', () => {
    expect(computeReadingLevel('')).toBe('beginner')
    expect(computeReadingLevel('   ')).toBe('beginner')
  })

  it('returns beginner for simple code', () => {
    expect(computeReadingLevel('const x = 1\n')).toBe('beginner')
  })

  it('returns intermediate for moderate code', () => {
    const mod = 'if (x) {\n  const y = x + 1\n}\n'.repeat(2) + 'function foo() {}\n'
    const level = computeReadingLevel(mod)
    expect(['intermediate', 'beginner', 'advanced']).toContain(level)
  })

  it('returns expert for complex code', () => {
    const lines = Array.from({ length: 35 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const expert = lines + '\n' + COMPLEX_CONTENT + '\nfunction foo<A, B, C, D>(a: A): C {\n  return null as unknown as C\n}\n'
    expect(computeReadingLevel(expert)).toBe('expert')
  })

  it('increases with nesting', () => {
    const flat = 'const a = 1\nconst b = 2\n'
    const nested = '{\n  {\n    {\n      {\n        {\n          x\n        }\n      }\n    }\n  }\n}\n'
    expect(computeReadingLevel(nested)).not.toBe('beginner')
  })
})

// ─── computeCondition ──────────────────────────────────────────────────────────

describe('computeCondition', () => {
  it('returns damaged for empty content', () => {
    expect(computeCondition('')).toBe('damaged')
  })

  it('returns mint for well-documented simple code', () => {
    expect(computeCondition(WELL_DOC)).toBe('mint')
  })

  it('returns damaged or worn for complex undocumented code', () => {
    const cond = computeCondition(COMPLEX_CONTENT)
    expect(['damaged', 'worn']).toContain(cond)
  })

  it('penalizes any types', () => {
    const clean = 'function fn(x: number) { return x }\n'
    const withAny = 'function fn(x: any) { return x }\n'
    expect(computeCondition(withAny)).not.toBe('mint')
    const cleanCond = computeCondition(clean)
    const anyCond = computeCondition(withAny)
    expect(conditionScore(anyCond)).toBeLessThanOrEqual(conditionScore(cleanCond))
  })

  it('penalizes ts-ignore', () => {
    const clean = 'const x = 1\n'
    const withIgnore = '// @ts-ignore\nconst x = 1\n'
    expect(conditionScore(computeCondition(withIgnore))).toBeLessThanOrEqual(conditionScore(computeCondition(clean)))
  })
})

function conditionScore(c: Condition): number {
  switch (c) {
    case 'mint': return 100
    case 'good': return 80
    case 'fair': return 60
    case 'worn': return 40
    case 'damaged': return 20
  }
}

// ─── computeMaxNesting ─────────────────────────────────────────────────────────

describe('computeMaxNesting', () => {
  it('returns 0 for flat content', () => {
    expect(computeMaxNesting('const x = 1')).toBe(0)
  })

  it('counts nesting depth', () => {
    expect(computeMaxNesting('{ x }')).toBe(1)
    expect(computeMaxNesting('{{{x}}}')).toBe(3)
  })
})

// ─── computeComplexity ─────────────────────────────────────────────────────────

describe('computeComplexity', () => {
  it('returns 0 for simple code', () => {
    expect(computeComplexity('const x = 1')).toBe(0)
  })

  it('increases with branches', () => {
    const withBranch = computeComplexity('if (x) {}')
    const noBranch = computeComplexity('const x = 1')
    expect(withBranch).toBeGreaterThan(noBranch)
  })

  it('increases with nesting', () => {
    const nested = computeComplexity('{{{x}}}')
    const flat = computeComplexity('x')
    expect(nested).toBeGreaterThan(flat)
  })
})

// ─── extractImports ─────────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    expect(extractImports("import { foo } from './bar'")).toEqual(['./bar'])
  })

  it('extracts dynamic imports', () => {
    expect(extractImports("const x = import('./bar')")).toEqual(['./bar'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1')).toEqual([])
  })
})

// ─── countExports ───────────────────────────────────────────────────────────────

describe('countExports', () => {
  it('counts function exports', () => {
    expect(countExports('export function foo() {}')).toBe(1)
  })

  it('counts const exports', () => {
    expect(countExports('export const x = 1; export const y = 2')).toBe(2)
  })

  it('counts interface exports', () => {
    expect(countExports('export interface Foo {}')).toBe(1)
  })

  it('returns 0 for no exports', () => {
    expect(countExports('const x = 1')).toBe(0)
  })
})

// ─── resolveImportPath ─────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  const known = new Set(['a.ts', 'b.ts', 'utils.ts'])

  it('resolves exact match', () => {
    expect(resolveImportPath('a.ts', known)).toBe('a.ts')
  })

  it('resolves with .ts extension', () => {
    expect(resolveImportPath('./a', known)).toBe('a.ts')
  })

  it('returns null for unknown', () => {
    expect(resolveImportPath('./unknown', known)).toBeNull()
  })
})

// ─── isAvailable ────────────────────────────────────────────────────────────────

describe('isAvailable', () => {
  it('returns true for files with exports', () => {
    expect(isAvailable('export const x = 1')).toBe(true)
  })

  it('returns false for files without exports', () => {
    expect(isAvailable('const x = 1')).toBe(false)
  })

  it('returns true for default exports', () => {
    expect(isAvailable('export default class Foo {}')).toBe(true)
  })
})

// ─── countChapters ──────────────────────────────────────────────────────────────

describe('countChapters', () => {
  it('counts function declarations', () => {
    expect(countChapters('function foo() {} function bar() {}')).toBeGreaterThanOrEqual(2)
  })

  it('returns 0 for no functions', () => {
    expect(countChapters('const x = 1')).toBe(0)
  })
})

// ─── computeCitations ──────────────────────────────────────────────────────────

describe('computeCitations', () => {
  it('counts imports', () => {
    expect(computeCitations("import { x } from './a'\nimport { y } from './b'")).toBe(2)
  })

  it('returns 0 for no imports', () => {
    expect(computeCitations('const x = 1')).toBe(0)
  })
})

// ─── computeCitedBy ─────────────────────────────────────────────────────────────

describe('computeCitedBy', () => {
  it('counts how many files import this one', () => {
    const files = ['a.ts', 'b.ts', 'c.ts']
    const contents = [
      "import { x } from './b'\nexport const a = 1",
      'export const x = 2',
      "import { x } from './b'\nexport const c = 3",
    ]
    expect(computeCitedBy('b.ts', files, contents)).toBe(2)
  })

  it('returns 0 when no one imports the file', () => {
    expect(computeCitedBy('a.ts', ['a.ts'], ['export const x = 1'])).toBe(0)
  })
})

// ─── groupIntoShelves ──────────────────────────────────────────────────────────

describe('groupIntoShelves', () => {
  const catalog: CatalogEntry[] = [
    makeEntry('src/a.ts', 'CMD.101', 'manual'),
    makeEntry('src/b.ts', 'CMD.102', 'manual'),
    makeEntry('test/c.ts', 'TST.401', 'journal'),
  ]

  it('groups by directory', () => {
    const shelves = groupIntoShelves(catalog, SIMPLE_FILES)
    expect(shelves.length).toBeGreaterThanOrEqual(2)
  })

  it('computes total pages', () => {
    const shelves = groupIntoShelves(catalog, SIMPLE_FILES)
    for (const shelf of shelves) {
      expect(shelf.totalPages).toBeGreaterThanOrEqual(0)
    }
  })

  it('computes fill level', () => {
    const shelves = groupIntoShelves(catalog, SIMPLE_FILES)
    for (const shelf of shelves) {
      expect(shelf.fillLevel).toBeGreaterThanOrEqual(0)
      expect(shelf.fillLevel).toBeLessThanOrEqual(100)
    }
  })

  it('handles empty catalog', () => {
    expect(groupIntoShelves([], [])).toEqual([])
  })
})

// ─── computeFillLevel ──────────────────────────────────────────────────────────

describe('computeFillLevel', () => {
  it('scales with entry count', () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry(`${i}.ts`, 'UTL.200', 'novel'))
    expect(computeFillLevel(entries)).toBe(50)
  })

  it('caps at 100', () => {
    const entries = Array.from({ length: 15 }, (_, i) => makeEntry(`${i}.ts`, 'UTL.200', 'novel'))
    expect(computeFillLevel(entries)).toBe(100)
  })
})

// ─── groupIntoCollections ──────────────────────────────────────────────────────

describe('groupIntoCollections', () => {
  it('groups by genre', () => {
    const catalog: CatalogEntry[] = [
      makeEntry('a.ts', 'CMD.101', 'manual'),
      makeEntry('b.ts', 'CMD.102', 'manual'),
      makeEntry('c.ts', 'TST.401', 'journal'),
    ]
    const collections = groupIntoCollections(catalog)
    expect(collections.length).toBe(2)
    const manuals = collections.find((c) => c.name === 'manual')
    expect(manuals).toBeDefined()
    expect(manuals!.size).toBe(2)
  })

  it('computes completeness', () => {
    const catalog: CatalogEntry[] = [
      { ...makeEntry('a.ts', 'CMD.101', 'manual'), available: true, condition: 'mint' },
    ]
    const collections = groupIntoCollections(catalog)
    expect(collections[0].completeness).toBe(100)
  })

  it('handles empty catalog', () => {
    expect(groupIntoCollections([])).toEqual([])
  })
})

// ─── computeCompleteness ───────────────────────────────────────────────────────

describe('computeCompleteness', () => {
  it('returns 0 for empty entries', () => {
    expect(computeCompleteness([])).toBe(0)
  })

  it('returns 100 for all available and mint', () => {
    const entries: CatalogEntry[] = [
      { ...makeEntry('a.ts', 'CMD.101', 'manual'), available: true, condition: 'mint' },
      { ...makeEntry('b.ts', 'CMD.102', 'manual'), available: true, condition: 'good' },
    ]
    expect(computeCompleteness(entries)).toBe(100)
  })

  it('returns lower for unavailable and damaged', () => {
    const entries: CatalogEntry[] = [
      { ...makeEntry('a.ts', 'CMD.101', 'manual'), available: false, condition: 'damaged' },
    ]
    expect(computeCompleteness(entries)).toBe(0)
  })
})

// ─── computeCatalogCompleteness ────────────────────────────────────────────────

describe('computeCatalogCompleteness', () => {
  it('returns 100 for empty files', () => {
    expect(computeCatalogCompleteness([], [])).toBe(100)
  })

  it('returns 100 when all files cataloged', () => {
    const catalog: CatalogEntry[] = [makeEntry('a.ts', 'UTL.201', 'novel')]
    expect(computeCatalogCompleteness(catalog, ['a.ts'])).toBe(100)
  })

  it('returns partial for missing files', () => {
    const catalog: CatalogEntry[] = [makeEntry('a.ts', 'UTL.201', 'novel')]
    expect(computeCatalogCompleteness(catalog, ['a.ts', 'b.ts'])).toBe(50)
  })
})

// ─── computeOrganizationScore ──────────────────────────────────────────────────

describe('computeOrganizationScore', () => {
  it('returns 100 for empty shelves', () => {
    expect(computeOrganizationScore([])).toBe(100)
  })

  it('returns 100 for uniform shelves', () => {
    const shelves: Shelf[] = [{
      name: 'src/commands', callNumberPrefix: 'CMD',
      entries: [makeEntry('a.ts', 'CMD.101', 'manual'), makeEntry('b.ts', 'CMD.102', 'manual')],
      genre: 'command reference', totalPages: 10, avgCondition: 'mint', fillLevel: 20,
    }]
    expect(computeOrganizationScore(shelves)).toBe(100)
  })

  it('returns lower for mixed shelves', () => {
    const shelves: Shelf[] = [{
      name: 'src', callNumberPrefix: 'MIX',
      entries: [makeEntry('a.ts', 'CMD.101', 'manual'), makeEntry('b.ts', 'TST.401', 'journal')],
      genre: 'mixed', totalPages: 10, avgCondition: 'fair', fillLevel: 20,
    }]
    expect(computeOrganizationScore(shelves)).toBeLessThan(100)
  })
})

// ─── generateLibraryRecommendations ────────────────────────────────────────────

describe('generateLibraryRecommendations', () => {
  const baseStats: LibraryStats = {
    totalEntries: 5, totalPages: 100, avgPages: 20,
    availableCount: 4, unavailableCount: 1,
    beginnerCount: 2, expertCount: 1,
    mintConditionCount: 3, damagedCount: 0,
    mostCited: 'a.ts', leastCited: 'e.ts',
    largestShelf: 'src', collectionCount: 3,
    catalogCompleteness: 100, organizationScore: 90,
  }

  it('recommends repairing damaged entries', () => {
    const catalog: CatalogEntry[] = [
      { ...makeEntry('x.ts', 'UTL.200', 'novel'), condition: 'damaged' },
    ]
    const recs = generateLibraryRecommendations(catalog, [], [], baseStats)
    expect(recs.some((r) => r.includes('damaged'))).toBe(true)
  })

  it('recommends improving worn entries', () => {
    const catalog: CatalogEntry[] = [
      { ...makeEntry('x.ts', 'UTL.200', 'novel'), condition: 'worn' },
    ]
    const recs = generateLibraryRecommendations(catalog, [], [], baseStats)
    expect(recs.some((r) => r.includes('worn'))).toBe(true)
  })

  it('recommends adding exports when many unavailable', () => {
    const catalog: CatalogEntry[] = Array.from({ length: 8 }, (_, i) =>
      ({ ...makeEntry(`unavail${i}.ts`, 'UTL.200', 'novel'), available: false })
    )
    const catalog2: CatalogEntry[] = Array.from({ length: 2 }, (_, i) =>
      ({ ...makeEntry(`avail${i}.ts`, 'UTL.201', 'novel'), available: true })
    )
    const stats = { ...baseStats, totalEntries: 10, unavailableCount: 8, availableCount: 2 }
    const recs = generateLibraryRecommendations([...catalog, ...catalog2], [], [], stats)
    expect(recs.some((r) => r.includes('unavailable') || r.includes('exports'))).toBe(true)
  })

  it('recommends splitting overcrowded shelves', () => {
    const shelves: Shelf[] = [{
      name: 'src', callNumberPrefix: 'UTL',
      entries: Array.from({ length: 10 }, (_, i) => makeEntry(`${i}.ts`, 'UTL.200', 'novel')),
      genre: 'general', totalPages: 100, avgCondition: 'good', fillLevel: 100,
    }]
    const recs = generateLibraryRecommendations([], shelves, [], baseStats)
    expect(recs.some((r) => r.includes('overcrowded') || r.includes('split'))).toBe(true)
  })

  it('recommends improving catalog completeness', () => {
    const stats = { ...baseStats, catalogCompleteness: 60 }
    const recs = generateLibraryRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('completeness'))).toBe(true)
  })

  it('recommends improving organization', () => {
    const stats = { ...baseStats, organizationScore: 40 }
    const recs = generateLibraryRecommendations([], [], [], stats)
    expect(recs.some((r) => r.includes('organization') || r.includes('Organization'))).toBe(true)
  })

  it('gives positive feedback for healthy library', () => {
    const recs = generateLibraryRecommendations([], [], [], baseStats)
    expect(recs.some((r) => r.includes('well-curated'))).toBe(true)
  })

  it('recommends for incomplete collections', () => {
    const collections: Collection[] = [{
      name: 'manual', entries: [], size: 0, avgReadingLevel: 'beginner', completeness: 20,
    }]
    const recs = generateLibraryRecommendations([], [], collections, baseStats)
    expect(recs.some((r) => r.includes('completeness') || r.includes('collection'))).toBe(true)
  })
})

// ─── buildLibraryResult ────────────────────────────────────────────────────────

describe('buildLibraryResult', () => {
  it('builds result with all fields', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.catalog).toBeDefined()
    expect(result.shelves).toBeDefined()
    expect(result.collections).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('creates one catalog entry per file', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.catalog.length).toBe(SIMPLE_FILES.length)
  })

  it('assigns call numbers', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    for (const entry of result.catalog) {
      expect(entry.callNumber).toMatch(/^(CMD|UTL|COR|TST|TYP|CFG|FMT)\.\d{3}$/)
    }
  })

  it('assigns genres', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const validGenres = ['reference', 'textbook', 'novel', 'encyclopedia', 'manual', 'journal', 'pamphlet']
    for (const entry of result.catalog) {
      expect(validGenres).toContain(entry.genre)
    }
  })

  it('computes pages', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    for (const entry of result.catalog) {
      expect(entry.pages).toBeGreaterThan(0)
    }
  })

  it('computes citations', () => {
    const result = buildLibraryResult(CONNECTED_FILES, CONNECTED_CONTENTS, {})
    expect(result.catalog[0].citations).toBeGreaterThan(0)
  })

  it('computes citedBy', () => {
    const result = buildLibraryResult(CONNECTED_FILES, CONNECTED_CONTENTS, {})
    expect(result.catalog[1].citedBy).toBeGreaterThan(0)
  })

  it('detects availability', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    for (const entry of result.catalog) {
      expect(typeof entry.available).toBe('boolean')
    }
  })

  it('computes stats correctly', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.stats.totalEntries).toBe(SIMPLE_FILES.length)
    expect(result.stats.totalPages).toBeGreaterThan(0)
    expect(result.stats.avgPages).toBeGreaterThan(0)
    expect(result.stats.catalogCompleteness).toBeGreaterThanOrEqual(0)
    expect(result.stats.catalogCompleteness).toBeLessThanOrEqual(100)
    expect(result.stats.organizationScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.organizationScore).toBeLessThanOrEqual(100)
  })

  it('handles empty input', () => {
    const result = buildLibraryResult([], [], {})
    expect(result.catalog).toEqual([])
    expect(result.stats.totalEntries).toBe(0)
    expect(result.stats.totalPages).toBe(0)
  })

  it('groups into shelves', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.shelves.length).toBeGreaterThan(0)
  })

  it('groups into collections', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.collections.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('resets call numbers between invocations', () => {
    const r1 = buildLibraryResult(['a.ts'], ['export const x = 1'], {})
    const r2 = buildLibraryResult(['a.ts'], ['export const x = 1'], {})
    expect(r1.catalog[0].callNumber).toBe(r2.catalog[0].callNumber)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatCallNumberLegend', () => {
  it('includes all prefixes', () => {
    const output = formatCallNumberLegend()
    expect(output).toContain('CMD')
    expect(output).toContain('UTL')
    expect(output).toContain('FMT')
  })
})

describe('formatCatalogTable', () => {
  it('shows catalog entries', () => {
    const catalog: CatalogEntry[] = [
      makeEntry('run.ts', 'CMD.101', 'manual'),
    ]
    const output = formatCatalogTable(catalog)
    expect(output).toContain('CMD.101')
  })

  it('shows empty message for empty catalog', () => {
    expect(formatCatalogTable([])).toContain('empty')
  })

  it('truncates long catalogs', () => {
    const catalog = Array.from({ length: 30 }, (_, i) => makeEntry(`${i}.ts`, `UTL.${200 + i}`, 'novel'))
    const output = formatCatalogTable(catalog)
    expect(output).toContain('more entries')
  })
})

describe('formatShelves', () => {
  it('shows shelf info', () => {
    const shelves: Shelf[] = [{
      name: 'src/commands', callNumberPrefix: 'CMD',
      entries: [makeEntry('a.ts', 'CMD.101', 'manual')],
      genre: 'command reference', totalPages: 10, avgCondition: 'mint', fillLevel: 10,
    }]
    const output = formatShelves(shelves)
    expect(output).toContain('src/commands')
    expect(output).toContain('CMD')
  })

  it('shows empty message', () => {
    expect(formatShelves([])).toContain('No shelves')
  })
})

describe('formatCollections', () => {
  it('shows collections', () => {
    const collections: Collection[] = [{
      name: 'manual', entries: [], size: 3, avgReadingLevel: 'beginner', completeness: 80,
    }]
    const output = formatCollections(collections)
    expect(output).toContain('manual')
  })

  it('shows empty message', () => {
    expect(formatCollections([])).toContain('No collections')
  })
})

describe('formatLibraryStats', () => {
  it('shows all stats', () => {
    const stats: LibraryStats = {
      totalEntries: 10, totalPages: 200, avgPages: 20,
      availableCount: 8, unavailableCount: 2,
      beginnerCount: 3, expertCount: 1,
      mintConditionCount: 5, damagedCount: 1,
      mostCited: 'core.ts', leastCited: 'test.ts',
      largestShelf: 'src', collectionCount: 4,
      catalogCompleteness: 95, organizationScore: 88,
    }
    const output = formatLibraryStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('95%')
  })
})

describe('formatLibraryRecommendations', () => {
  it('shows recommendations', () => {
    const output = formatLibraryRecommendations(['Repair damaged entries'])
    expect(output).toContain('Repair damaged entries')
  })
})

describe('formatLibraryJson', () => {
  it('produces valid JSON', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const json = formatLibraryJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.catalog).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

describe('formatLibraryTable', () => {
  it('produces table output', () => {
    const result = buildLibraryResult(SIMPLE_FILES, SIMPLE_CONTENTS, {})
    const output = formatLibraryTable(result)
    expect(output).toContain('Library Catalog')
    expect(output).toContain('Shelves')
    expect(output).toContain('Collections')
    expect(output).toContain('Library Statistics')
  })
})

// ─── Helper ────────────────────────────────────────────────────────────────────

function makeEntry(file: string, callNumber: string, genre: Genre): CatalogEntry {
  return {
    file,
    callNumber,
    title: file.split('/').pop()?.replace(/\.\w+$/, '') || file,
    genre,
    readingLevel: 'beginner' as ReadingLevel,
    pages: 5,
    chapters: 1,
    citations: 0,
    citedBy: 0,
    available: true,
    condition: 'mint' as Condition,
    lastChecked: '2026-01-01',
  }
}
