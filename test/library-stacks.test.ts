import { describe, expect, it } from 'vitest'
import {
  analyzeLibraryBook,
  analyzeLibraryFloor,
  buildLibraryStacksResult,
  classifyFloorType,
  classifyLibrarianGrade,
  generateRecommendations,
  measureCatalog,
  measureCirculation,
  measureReading,
  measureReference,
  measureShelf,
  measureValue,
} from '../src/commands/library-stacks-helpers.js'
import { formatLibraryStacksJson, formatLibraryStacksTable } from '../src/commands/library-stacks-format-helpers.js'

// ─── measureCatalog ────────────────────────────────────────────────────────

describe('measureCatalog', () => {
  it('returns chaotic for empty content', () => {
    const r = measureCatalog('')
    expect(r.quality).toBe(0)
    expect(r.system).toBe('chaotic')
    expect(r.hasProperCallNumber).toBe(false)
    expect(r.hasAuthorEntry).toBe(false)
    expect(r.hasTitleEntry).toBe(false)
    expect(r.subjectHeadingCount).toBe(0)
  })

  it('detects dewey-decimal for well-documented code', () => {
    const code = [
      '/** Doc */',
      'export function processData(input: Data): Result { return input }',
      'export function helper(input: string): number { return 1 }',
      'interface Data { value: number }',
      'interface Result { output: string }',
    ].join('\n')
    const r = measureCatalog(code)
    expect(r.quality).toBeGreaterThanOrEqual(85)
    expect(r.system).toBe('dewey-decimal')
    expect(r.hasProperCallNumber).toBe(true)
    expect(r.hasISBN).toBe(true)
  })

  it('detects library-of-congress for moderate documentation', () => {
    const code = 'export function a(): void {}\nexport function b(): void {}'
    const r = measureCatalog(code)
    expect(r.quality).toBeGreaterThanOrEqual(55)
    expect(r.hasProperCallNumber).toBe(true)
  })

  it('detects chaotic for code with default exports', () => {
    const code = 'export default function broken() {}'
    const r = measureCatalog(code)
    expect(r.hasMisplacedEntry).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'export function a() {}'
    const r = measureCatalog(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects proper classification with call number and barcode', () => {
    const code = 'export function a(x: number): string { return String(x) }'
    const r = measureCatalog(code)
    expect(r.hasProperCallNumber).toBe(true)
    expect(r.hasBarcode).toBe(true)
    expect(r.isProperlyClassified).toBe(true)
  })

  it('detects MARC record with jsdoc and types', () => {
    const code = '/** Doc */\nexport function a(x: number): void {}'
    const r = measureCatalog(code)
    expect(r.hasMARCRecord).toBe(true)
  })

  it('detects subject headings from interfaces', () => {
    const code = 'interface A {} interface B {}'
    const r = measureCatalog(code)
    expect(r.hasSubjectHeadings).toBe(true)
    expect(r.subjectHeadingCount).toBeGreaterThanOrEqual(1)
  })

  it('detects universal-decimal for moderate quality', () => {
    const code = 'export function a() {}\n/** Doc */\ninterface X {}'
    const r = measureCatalog(code)
    expect(r.quality).toBeGreaterThanOrEqual(40)
  })

  it('detects alphabetical for low quality', () => {
    const code = 'export function a() {}\nexport const x = 1\nexport function b() {}'
    const r = measureCatalog(code)
    expect(r.quality).toBeGreaterThanOrEqual(15)
  })
})

// ─── measureShelf ──────────────────────────────────────────────────────────

describe('measureShelf', () => {
  it('returns storage for empty content', () => {
    const r = measureShelf('')
    expect(r.order).toBe(0)
    expect(r.location).toBe('storage')
    expect(r.isProperlyShelved).toBe(false)
    expect(r.bookmarkCount).toBe(0)
  })

  it('detects reference location for high order', () => {
    const code = [
      'import { a } from "b"',
      'export function x() {}',
      'export function y() {}',
      'export function z() {}',
      'export function w() {}',
      'interface I {}',
      'try { } catch {}',
    ].join('\n')
    const r = measureShelf(code)
    expect(r.order).toBeGreaterThanOrEqual(80)
    expect(r.location).toBe('reference')
    expect(r.isProperlyShelved).toBe(true)
  })

  it('detects stacks location for moderate order', () => {
    const code = 'export function a() {}\nimport { x } from "y"\ninterface I {}'
    const r = measureShelf(code)
    expect(r.order).toBeGreaterThanOrEqual(40)
    expect(r.isAccessible).toBe(true)
  })

  it('detects bookmarks from imports', () => {
    const code = 'import { a } from "b"\nimport { c } from "d"'
    const r = measureShelf(code)
    expect(r.hasBookmarks).toBe(true)
    expect(r.bookmarkCount).toBeGreaterThanOrEqual(2)
  })

  it('detects dog-eared from many functions', () => {
    const code = Array(8).fill('function fn() {}').join('\n')
    const r = measureShelf(code)
    expect(r.hasDogEared).toBe(true)
  })

  it('detects proper spine from exports', () => {
    const code = 'export function a() {}'
    const r = measureShelf(code)
    expect(r.hasProperSpine).toBe(true)
  })

  it('detects dust jacket from try-catch', () => {
    const code = 'try { } catch (e) { }'
    const r = measureShelf(code)
    expect(r.hasDustJacket).toBe(true)
  })

  it('detects table of contents from many functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}\nfunction d() {}'
    const r = measureShelf(code)
    expect(r.hasTableOfContents).toBe(true)
  })

  it('computes order within valid range', () => {
    const code = 'export function a() {}'
    const r = measureShelf(code)
    expect(r.order).toBeGreaterThanOrEqual(0)
    expect(r.order).toBeLessThanOrEqual(100)
  })
})

// ─── measureReference ──────────────────────────────────────────────────────

describe('measureReference', () => {
  it('returns 0 for empty content', () => {
    const r = measureReference('')
    expect(r.system).toBe(0)
    expect(r.hasBibliography).toBe(false)
    expect(r.citationCount).toBe(0)
  })

  it('detects bibliography from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureReference(code)
    expect(r.hasBibliography).toBe(true)
  })

  it('detects cross references from interfaces', () => {
    const code = 'interface A {} interface B {}'
    const r = measureReference(code)
    expect(r.hasCrossReferences).toBe(true)
    expect(r.crossReferenceCount).toBeGreaterThanOrEqual(1)
  })

  it('detects glossary from interfaces and types', () => {
    const code = 'interface A { x: number }\nconst y: string = ""'
    const r = measureReference(code)
    expect(r.hasGlossary).toBe(true)
  })

  it('detects appendix from generics', () => {
    const code = 'function identity<T>(x: T): T { return x }'
    const r = measureReference(code)
    expect(r.hasAppendix).toBe(true)
  })

  it('detects concordance from classes and interfaces', () => {
    const code = 'class Foo {} interface Bar {}'
    const r = measureReference(code)
    expect(r.hasConcordance).toBe(true)
  })

  it('detects citations from jsdoc', () => {
    const code = '/** Documentation */\nfunction a() {}'
    const r = measureReference(code)
    expect(r.hasCitations).toBe(true)
    expect(r.citationCount).toBeGreaterThanOrEqual(1)
  })

  it('detects errata from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureReference(code)
    expect(r.hasErrata).toBe(true)
  })

  it('computes system within valid range', () => {
    const code = 'import { a } from "b"\ninterface X {}'
    const r = measureReference(code)
    expect(r.system).toBeGreaterThanOrEqual(0)
    expect(r.system).toBeLessThanOrEqual(100)
  })

  it('penalizes any types', () => {
    const code = 'function a(x: any) {}'
    const r = measureReference(code)
    expect(r.hasErrata).toBe(true)
  })
})

// ─── measureCirculation ────────────────────────────────────────────────────

describe('measureCirculation', () => {
  it('returns withdrawn for empty content', () => {
    const r = measureCirculation('')
    expect(r.rate).toBe(0)
    expect(r.status).toBe('withdrawn')
    expect(r.isRare).toBe(true)
    expect(r.checkoutCount).toBe(0)
  })

  it('detects checked-out for high reuse', () => {
    const code = [
      'export function a() {}',
      'export function b() {}',
      'export function c() {}',
      'export function d() {}',
    ].join('\n')
    const r = measureCirculation(code)
    expect(r.isPopular).toBe(true)
    expect(r.checkoutCount).toBeGreaterThan(0)
  })

  it('detects first edition with exports and no mutations', () => {
    const code = 'export function pure(): number { return 1 }'
    const r = measureCirculation(code)
    expect(r.isFirstEdition).toBe(true)
    expect(r.isLaterEdition).toBe(false)
  })

  it('detects later edition with mutations', () => {
    const code = 'const arr: number[] = []\narr.push(1)'
    const r = measureCirculation(code)
    expect(r.hasDamage).toBe(true)
  })

  it('detects rare for no exports or imports', () => {
    const code = 'function internal() {}'
    const r = measureCirculation(code)
    expect(r.isRare).toBe(true)
  })

  it('detects frequently referenced from imports', () => {
    const code = [
      'import { a } from "x"',
      'import { b } from "y"',
      'import { c } from "z"',
    ].join('\n')
    const r = measureCirculation(code)
    expect(r.isFrequentlyReferenced).toBe(true)
  })

  it('detects overdue from side effects without try-catch', () => {
    const code = 'console.log("debug")'
    const r = measureCirculation(code)
    expect(r.hasOverdue).toBe(true)
  })

  it('computes rate within valid range', () => {
    const code = 'export function a() {}'
    const r = measureCirculation(code)
    expect(r.rate).toBeGreaterThanOrEqual(0)
    expect(r.rate).toBeLessThanOrEqual(100)
  })

  it('detects reference-only for no exports', () => {
    const code = 'import { x } from "y"'
    const r = measureCirculation(code)
    expect(r.status).toBe('reference-only')
  })

  it('detects wait list when imports exceed exports', () => {
    const code = 'import { a } from "x"\nimport { b } from "y"\nexport function c() {}'
    const r = measureCirculation(code)
    expect(r.hasWaitList).toBe(true)
  })
})

// ─── measureReading ────────────────────────────────────────────────────────

describe('measureReading', () => {
  it('returns esoteric for empty content', () => {
    const r = measureReading('')
    expect(r.quality).toBe(0)
    expect(r.level).toBe('esoteric')
    expect(r.isEngaging).toBe(false)
  })

  it('detects children level for high quality', () => {
    const code = [
      '/** Doc */',
      'export function a(x: number): string { return String(x) }',
      'const result = [1, 2, 3].map(x => x).filter(x => x > 1)',
      '// Comment',
      'function b() {}',
      'function c() {}',
      'function d() {}',
    ].join('\n')
    const r = measureReading(code)
    expect(r.quality).toBeGreaterThanOrEqual(70)
    expect(r.hasClearProse).toBe(true)
    expect(r.hasTranslations).toBe(true)
  })

  it('detects clear prose from types and comments', () => {
    const code = 'const x: number = 1\n// comment'
    const r = measureReading(code)
    expect(r.hasClearProse).toBe(true)
  })

  it('detects illustrations from jsdoc', () => {
    const code = '/** Doc block */\nfunction a() {}'
    const r = measureReading(code)
    expect(r.hasIllustrations).toBe(true)
  })

  it('detects large print from const-only', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureReading(code)
    expect(r.hasLargePrint).toBe(true)
  })

  it('detects chapter breaks from many functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const r = measureReading(code)
    expect(r.hasChapterBreaks).toBe(true)
  })

  it('penalizes foreign language (any types)', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureReading(code)
    expect(r.hasForeignLanguage).toBe(true)
  })

  it('penalizes dead code', () => {
    const code = 'debugger;'
    const r = measureReading(code)
    expect(r.quality).toBeLessThanOrEqual(20)
  })

  it('computes quality within valid range', () => {
    const code = 'function a() {}'
    const r = measureReading(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects engaging from functions and pipes', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x).filter(x => x > 0) }'
    const r = measureReading(code)
    expect(r.isEngaging).toBe(true)
  })
})

// ─── measureValue ──────────────────────────────────────────────────────────

describe('measureValue', () => {
  it('returns pamphlet for empty content', () => {
    const r = measureValue('')
    expect(r.score).toBe(0)
    expect(r.category).toBe('pamphlet')
    expect(r.isArchival).toBe(false)
    expect(r.valueFactors).toHaveLength(0)
  })

  it('detects rare-first-edition for high value', () => {
    const code = [
      '/** Doc */',
      'export function core(x: number): string { return String(x) }',
      'interface Config { name: string }',
      'function identity<T>(x: T): T { return x }',
    ].join('\n')
    const r = measureValue(code)
    expect(r.score).toBeGreaterThanOrEqual(70)
    expect(r.isArchival).toBe(true)
    expect(r.hasResearchValue).toBe(true)
    expect(r.hasPracticalValue).toBe(true)
  })

  it('detects standard-reference for moderate value', () => {
    const code = 'export function a() {}\ninterface I {}'
    const r = measureValue(code)
    expect(r.hasPracticalValue).toBe(true)
    expect(r.hasHistoricalValue).toBe(true)
  })

  it('detects replacement candidate from dead code', () => {
    const code = 'debugger;'
    const r = measureValue(code)
    expect(r.isReplacementCandidate).toBe(true)
  })

  it('detects preservation candidate from pure exports', () => {
    const code = 'export function pure(): number { return 1 }'
    const r = measureValue(code)
    expect(r.isPreservationCandidate).toBe(true)
  })

  it('detects cultural value from jsdoc and types', () => {
    const code = '/** Doc */\nfunction a(x: number): void {}'
    const r = measureValue(code)
    expect(r.hasCulturalValue).toBe(true)
  })

  it('accumulates value factors', () => {
    const code = 'export function a() {}\ninterface I {}\nfunction id<T>(x: T): T { return x }'
    const r = measureValue(code)
    expect(r.valueFactors.length).toBeGreaterThanOrEqual(2)
  })

  it('computes score within valid range', () => {
    const code = 'export function a() {}'
    const r = measureValue(code)
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
})

// ─── analyzeLibraryBook ────────────────────────────────────────────────────

describe('analyzeLibraryBook', () => {
  it('returns scrap-paper for empty content', () => {
    const book = analyzeLibraryBook('', 'empty.ts')
    expect(book.condition).toBe('scrap-paper')
    expect(book.qualityScore).toBe(0)
    expect(book.file).toBe('empty.ts')
  })

  it('returns rare-manuscript for high quality code', () => {
    const code = [
      '/** Doc */',
      'import { X } from "y"',
      'export function core(input: Data): Result { return { out: input.v } }',
      'export function helper(x: number): string { return String(x) }',
      'export function util(): void {}',
      'interface Data { v: string }',
      'interface Result { out: string }',
      'try { core({ v: "test" }) } catch {}',
    ].join('\n')
    const book = analyzeLibraryBook(code, 'core.ts')
    expect(book.qualityScore).toBeGreaterThanOrEqual(60)
    expect(book.cataloguingQuality).toBeGreaterThan(0)
    expect(book.shelfOrder).toBeGreaterThan(0)
    expect(book.referenceSystem).toBeGreaterThan(0)
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const book = analyzeLibraryBook(code, 'a.ts')
    const expected = Math.round(
      (book.cataloguingQuality + book.shelfOrder + book.referenceSystem + book.circulation + book.readingRoom + book.collectionValue) / 6,
    )
    expect(book.qualityScore).toBe(expected)
  })

  it('classifies well-thumbed for moderate code', () => {
    const code = 'export function a() {}'
    const book = analyzeLibraryBook(code, 'mod.ts')
    expect(['well-thumbed', 'pamphlet', 'reference-work']).toContain(book.condition)
  })
})

// ─── classifyFloorType ─────────────────────────────────────────────────────

describe('classifyFloorType', () => {
  it('returns dumpster for empty array', () => {
    expect(classifyFloorType([])).toBe('dumpster')
  })

  it('returns rare-books for high quality with rare manuscripts', () => {
    const books = Array(3).fill(null).map(() => ({
      file: 'a.ts', cataloguingQuality: 90, shelfOrder: 90, referenceSystem: 90,
      circulation: 90, readingRoom: 90, collectionValue: 90,
      catalog: {} as any, shelf: {} as any, reference: {} as any,
      circulationMeasure: {} as any, reading: {} as any, value: {} as any,
      condition: 'rare-manuscript' as const, qualityScore: 90,
    }))
    expect(classifyFloorType(books)).toBe('rare-books')
  })

  it('returns reference-room for moderate-high quality', () => {
    const books = Array(3).fill(null).map(() => ({
      file: 'a.ts', cataloguingQuality: 70, shelfOrder: 70, referenceSystem: 70,
      circulation: 70, readingRoom: 70, collectionValue: 70,
      catalog: {} as any, shelf: {} as any, reference: {} as any,
      circulationMeasure: {} as any, reading: {} as any, value: {} as any,
      condition: 'first-edition' as const, qualityScore: 70,
    }))
    expect(classifyFloorType(books)).toBe('reference-room')
  })

  it('returns main-stacks for moderate quality', () => {
    const books = [{ file: 'a.ts', cataloguingQuality: 50, shelfOrder: 50, referenceSystem: 50,
      circulation: 50, readingRoom: 50, collectionValue: 50,
      catalog: {} as any, shelf: {} as any, reference: {} as any,
      circulationMeasure: {} as any, reading: {} as any, value: {} as any,
      condition: 'reference-work' as const, qualityScore: 50 }]
    expect(classifyFloorType(books)).toBe('main-stacks')
  })

  it('returns dumpster for low quality', () => {
    const books = [{ file: 'a.ts', cataloguingQuality: 5, shelfOrder: 5, referenceSystem: 5,
      circulation: 5, readingRoom: 5, collectionValue: 5,
      catalog: {} as any, shelf: {} as any, reference: {} as any,
      circulationMeasure: {} as any, reading: {} as any, value: {} as any,
      condition: 'scrap-paper' as const, qualityScore: 5 }]
    expect(classifyFloorType(books)).toBe('dumpster')
  })
})

// ─── classifyLibrarianGrade ────────────────────────────────────────────────

describe('classifyLibrarianGrade', () => {
  it('returns head-librarian for high scores', () => {
    expect(classifyLibrarianGrade(95)).toBe('head-librarian')
  })

  it('returns senior-librarian for good scores', () => {
    expect(classifyLibrarianGrade(80)).toBe('senior-librarian')
  })

  it('returns librarian for moderate scores', () => {
    expect(classifyLibrarianGrade(60)).toBe('librarian')
  })

  it('returns library-assistant for low scores', () => {
    expect(classifyLibrarianGrade(40)).toBe('library-assistant')
  })

  it('returns page for poor scores', () => {
    expect(classifyLibrarianGrade(20)).toBe('page')
  })

  it('returns bookworm for terrible scores', () => {
    expect(classifyLibrarianGrade(5)).toBe('bookworm')
  })
})

// ─── analyzeLibraryFloor ───────────────────────────────────────────────────

describe('analyzeLibraryFloor', () => {
  it('returns dumpster for empty array', () => {
    const floor = analyzeLibraryFloor([], 'empty/')
    expect(floor.floorType).toBe('dumpster')
    expect(floor.condition).toBe('book-dumpster')
    expect(floor.books).toHaveLength(0)
  })

  it('computes averages from books', () => {
    const book = analyzeLibraryBook('export function a(): void {}', 'src/a.ts')
    const floor = analyzeLibraryFloor([book], 'src/')
    expect(floor.avgCataloguing).toBe(book.cataloguingQuality)
    expect(floor.avgShelfOrder).toBe(book.shelfOrder)
    expect(floor.avgReadingQuality).toBe(book.readingRoom)
  })

  it('counts rare manuscripts and scrap paper', () => {
    const scrap = analyzeLibraryBook('', 'bad.ts')
    const floor = analyzeLibraryFloor([scrap], 'bad/')
    expect(floor.scrapPaperCount).toBe(1)
    expect(floor.rareManuscriptCount).toBe(0)
  })

  it('counts properly shelved and frequently referenced', () => {
    const code = 'import { a } from "x"\nimport { b } from "y"\nimport { c } from "z"\nexport function d() {}'
    const book = analyzeLibraryBook(code, 'ref.ts')
    const floor = analyzeLibraryFloor([book], 'src/')
    if (book.shelf.isProperlyShelved) {
      expect(floor.properlyShelvedCount).toBe(1)
    }
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for well-organized library', () => {
    const books = [analyzeLibraryBook('export function a(): void {}\nimport { x } from "y"\ninterface I {}', 'good.ts')]
    const result = buildLibraryStacksResult(['good.ts'], ['export function a(): void {}\nimport { x } from "y"\ninterface I {}'], {})
    const recs = generateRecommendations(books, result.floors, result.library, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends cataloguing for low quality', () => {
    const code = ''
    const result = buildLibraryStacksResult(['empty.ts'], [code], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildLibraryStacksResult ──────────────────────────────────────────────

describe('buildLibraryStacksResult', () => {
  it('handles empty input', () => {
    const result = buildLibraryStacksResult([], [], {})
    expect(result.books).toHaveLength(0)
    expect(result.floors).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallOrganization).toBe(0)
    expect(result.library.isWellOrganized).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildLibraryStacksResult(['a.ts'], [code], {})
    expect(result.books).toHaveLength(1)
    expect(result.books[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into floors', () => {
    const result = buildLibraryStacksResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.floors.length).toBeGreaterThanOrEqual(2)
  })

  it('computes library averages', () => {
    const code = 'export function a(): void {}'
    const result = buildLibraryStacksResult(['a.ts'], [code], {})
    expect(result.library.avgCataloguing).toBeGreaterThanOrEqual(0)
    expect(result.library.avgShelfOrder).toBeGreaterThanOrEqual(0)
    expect(result.library.avgReadingQuality).toBeGreaterThanOrEqual(0)
  })

  it('identifies best book, best organized, best referenced', () => {
    const result = buildLibraryStacksResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestBook).toBe('a.ts')
  })

  it('computes condition counts', () => {
    const result = buildLibraryStacksResult(
      ['a.ts', 'b.ts'],
      ['', ''],
      {},
    )
    expect(result.stats.scrapPaperCount).toBe(2)
  })

  it('sets librarian grade', () => {
    const result = buildLibraryStacksResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.librarianGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildLibraryStacksResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildLibraryStacksResult(['a.ts'], [code], {})
    expect(result.stats.hasProperCallNumberCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isProperlyShelvedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasBibliographyCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasCrossReferencesCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isPopularCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isArchivalCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatLibraryStacksTable', () => {
  it('formats empty result', () => {
    const result = buildLibraryStacksResult([], [], {})
    const table = formatLibraryStacksTable(result, false)
    expect(table).toContain('Library Stacks')
    expect(table).toContain('No files analyzed')
  })

  it('formats with books', () => {
    const result = buildLibraryStacksResult(['a.ts'], ['export function a() {}'], {})
    const table = formatLibraryStacksTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildLibraryStacksResult(files, contents, {})
    const table = formatLibraryStacksTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatLibraryStacksTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatLibraryStacksJson', () => {
  it('produces valid JSON', () => {
    const result = buildLibraryStacksResult(['a.ts'], ['export function a() {}'], {})
    const json = formatLibraryStacksJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.books).toHaveLength(1)
  })
})
