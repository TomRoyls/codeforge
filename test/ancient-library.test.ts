import { describe, expect, it } from 'vitest'

import {
  analyzeManuscriptPage,
  analyzeLibraryWing,
  buildAncientLibraryResult,
  classifyCondition,
  classifyLibrarianGrade,
  classifyWingCondition,
  classifyWingType,
  generateRecommendations,
  measureCatalog,
  measureIllumination,
  measurePreservation,
  measureScholarly,
  measureScroll,
  measureWisdom,
} from '../src/commands/ancient-library-helpers.js'

import {
  catalogColor,
  conditionColor,
  formatAncientLibraryJson,
  formatAncientLibraryTable,
  gradeColor,
  illuminationColor,
  preservationColor,
  scholarlyColor,
  scoreColor,
  scrollColor,
  wisdomColor,
  wingTypeColor,
} from '../src/commands/ancient-library-format-helpers.js'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const RICH_CONTENT = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from './foo'
// TODO: fix later
`

const EMPTY_CONTENT = ''

const MEDIUM_CONTENT = 'const x = 1\n'

// ─── measureScroll ───────────────────────────────────────────────────────────

describe('measureScroll', () => {
  it('returns high quality for rich content', () => {
    const result = measureScroll(RICH_CONTENT)
    expect(result.quality).toBe(93)
    expect(result.condition).toBe('well-preserved')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasProperInk).toBe(true)
    expect(result.hasClearScript).toBe(true)
    expect(result.hasNoFading).toBe(true)
    expect(result.hasProperBinding).toBe(true)
    expect(result.hasMarginalia).toBe(true)
    expect(result.hasNoWaterDamage).toBe(true)
    expect(result.hasTableOfContents).toBe(true)
    expect(result.fadingCount).toBe(0)
    expect(result.smudgingCount).toBe(1)
  })

  it('returns low quality for empty content', () => {
    const result = measureScroll(EMPTY_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.condition).toBe('damaged')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns damaged for medium content', () => {
    const result = measureScroll(MEDIUM_CONTENT)
    expect(result.quality).toBe(40)
    expect(result.condition).toBe('damaged')
  })
})

// ─── measureScholarly ────────────────────────────────────────────────────────

describe('measureScholarly', () => {
  it('returns grand-scholar for rich content', () => {
    const result = measureScholarly(RICH_CONTENT)
    expect(result.depth).toBe(95)
    expect(result.rank).toBe('grand-scholar')
    expect(result.hasHighDepth).toBe(true)
    expect(result.hasThorough).toBe(true)
    expect(result.hasNoPlagiarism).toBe(true)
    expect(result.hasOriginalThought).toBe(true)
    expect(result.hasNoSuperficiality).toBe(true)
    expect(result.hasPeerReview).toBe(true)
    expect(result.hasProperMethodology).toBe(true)
    expect(result.hasNoErrors).toBe(true)
    expect(result.plagiarismCount).toBe(0)
    expect(result.errorCount).toBe(0)
  })

  it('returns low depth for empty content', () => {
    const result = measureScholarly(EMPTY_CONTENT)
    expect(result.depth).toBe(28)
    expect(result.rank).toBe('illiterate')
    expect(result.hasHighDepth).toBe(false)
  })

  it('returns illiterate for medium content', () => {
    const result = measureScholarly(MEDIUM_CONTENT)
    expect(result.depth).toBe(28)
    expect(result.rank).toBe('illiterate')
  })
})

// ─── measureCatalog ──────────────────────────────────────────────────────────

describe('measureCatalog', () => {
  it('returns well-cataloged for rich content', () => {
    const result = measureCatalog(RICH_CONTENT)
    expect(result.organization).toBe(89)
    expect(result.system).toBe('well-cataloged')
    expect(result.hasHighOrganization).toBe(true)
    expect(result.hasProperShelving).toBe(true)
    expect(result.hasNoMisplaced).toBe(true)
    expect(result.hasProperIndex).toBe(true)
    expect(result.hasSubjectHeadings).toBe(true)
    expect(result.hasNoDuplicates).toBe(true)
    expect(result.hasNoGaps).toBe(true)
    expect(result.misplacedCount).toBe(0)
    expect(result.orphanCount).toBe(1)
  })

  it('returns low organization for empty content', () => {
    const result = measureCatalog(EMPTY_CONTENT)
    expect(result.organization).toBe(38)
    expect(result.system).toBe('chaotic')
    expect(result.hasHighOrganization).toBe(false)
  })

  it('returns chaotic for medium content', () => {
    const result = measureCatalog(MEDIUM_CONTENT)
    expect(result.organization).toBe(38)
    expect(result.system).toBe('chaotic')
  })
})

// ─── measurePreservation ─────────────────────────────────────────────────────

describe('measurePreservation', () => {
  it('returns enduring for rich content', () => {
    const result = measurePreservation(RICH_CONTENT)
    expect(result.quality).toBe(93)
    expect(result.state).toBe('enduring')
    expect(result.hasHighQuality).toBe(true)
    expect(result.hasClimateControl).toBe(true)
    expect(result.hasProperStorage).toBe(true)
    expect(result.hasNoMold).toBe(true)
    expect(result.hasAcidFree).toBe(true)
    expect(result.hasProperRestoration).toBe(true)
    expect(result.hasNoDegradation).toBe(true)
    expect(result.moldCount).toBe(0)
    expect(result.pestCount).toBe(1)
  })

  it('returns decaying for empty content', () => {
    const result = measurePreservation(EMPTY_CONTENT)
    expect(result.quality).toBe(32)
    expect(result.state).toBe('decaying')
    expect(result.hasHighQuality).toBe(false)
  })

  it('returns decaying for medium content', () => {
    const result = measurePreservation(MEDIUM_CONTENT)
    expect(result.quality).toBe(32)
    expect(result.state).toBe('decaying')
  })
})

// ─── measureIllumination ─────────────────────────────────────────────────────

describe('measureIllumination', () => {
  it('returns ornate for rich content', () => {
    const result = measureIllumination(RICH_CONTENT)
    expect(result.beauty).toBe(88)
    expect(result.style).toBe('ornate')
    expect(result.hasHighBeauty).toBe(true)
    expect(result.hasProperCalligraphy).toBe(true)
    expect(result.hasDecorativeBorders).toBe(true)
    expect(result.hasNoSmears).toBe(true)
    expect(result.hasProperSpacing).toBe(true)
    expect(result.hasHarmonious).toBe(true)
    expect(result.hasNoStains).toBe(true)
    expect(result.smearCount).toBe(0)
    expect(result.clutterCount).toBe(1)
  })

  it('returns rough for empty content', () => {
    const result = measureIllumination(EMPTY_CONTENT)
    expect(result.beauty).toBe(42)
    expect(result.style).toBe('rough')
    expect(result.hasHighBeauty).toBe(false)
  })

  it('returns rough for medium content', () => {
    const result = measureIllumination(MEDIUM_CONTENT)
    expect(result.beauty).toBe(42)
    expect(result.style).toBe('rough')
  })
})

// ─── measureWisdom ───────────────────────────────────────────────────────────

describe('measureWisdom', () => {
  it('returns wise for rich content', () => {
    const result = measureWisdom(RICH_CONTENT)
    expect(result.level).toBe(93)
    expect(result.grade).toBe('wise')
    expect(result.hasHighWisdom).toBe(true)
    expect(result.hasTeachingValue).toBe(true)
    expect(result.hasNoFalsehoods).toBe(true)
    expect(result.hasPracticalApplication).toBe(true)
    expect(result.hasTransferable).toBe(true)
    expect(result.hasEnduring).toBe(true)
    expect(result.hasNoConfusion).toBe(true)
    expect(result.falsehoodCount).toBe(0)
    expect(result.dogmaCount).toBe(1)
  })

  it('returns ignorant for empty content', () => {
    const result = measureWisdom(EMPTY_CONTENT)
    expect(result.level).toBe(32)
    expect(result.grade).toBe('ignorant')
    expect(result.hasHighWisdom).toBe(false)
  })

  it('returns ignorant for medium content', () => {
    const result = measureWisdom(MEDIUM_CONTENT)
    expect(result.level).toBe(32)
    expect(result.grade).toBe('ignorant')
  })
})

// ─── analyzeManuscriptPage ───────────────────────────────────────────────────

describe('analyzeManuscriptPage', () => {
  it('returns sacred-text for rich content', () => {
    const result = analyzeManuscriptPage(RICH_CONTENT, 'rich.ts')
    expect(result.scrollQuality).toBe(93)
    expect(result.scholarlyDepth).toBe(95)
    expect(result.catalogOrganization).toBe(89)
    expect(result.preservationQuality).toBe(93)
    expect(result.illuminationBeauty).toBe(88)
    expect(result.wisdomLevel).toBe(93)
    expect(result.qualityScore).toBe(92)
    expect(result.condition).toBe('sacred-text')
    expect(result.file).toBe('rich.ts')
  })

  it('returns pamphlet for empty content', () => {
    const result = analyzeManuscriptPage(EMPTY_CONTENT, 'empty.ts')
    expect(result.scrollQuality).toBe(40)
    expect(result.scholarlyDepth).toBe(28)
    expect(result.catalogOrganization).toBe(38)
    expect(result.preservationQuality).toBe(32)
    expect(result.illuminationBeauty).toBe(42)
    expect(result.wisdomLevel).toBe(32)
    expect(result.qualityScore).toBe(35)
    expect(result.condition).toBe('pamphlet')
  })

  it('returns pamphlet for medium content', () => {
    const result = analyzeManuscriptPage(MEDIUM_CONTENT, 'medium.ts')
    expect(result.qualityScore).toBe(35)
    expect(result.condition).toBe('pamphlet')
  })
})

// ─── classifyCondition ───────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('classifies sacred-text for 80+', () => {
    expect(classifyCondition({ qualityScore: 80 } as any)).toBe('sacred-text')
  })
  it('classifies valued-manuscript for 65-79', () => {
    expect(classifyCondition({ qualityScore: 65 } as any)).toBe('valued-manuscript')
  })
  it('classifies reference-work for 50-64', () => {
    expect(classifyCondition({ qualityScore: 50 } as any)).toBe('reference-work')
  })
  it('classifies pamphlet for 35-49', () => {
    expect(classifyCondition({ qualityScore: 35 } as any)).toBe('pamphlet')
  })
  it('classifies fragment for 20-34', () => {
    expect(classifyCondition({ qualityScore: 20 } as any)).toBe('fragment')
  })
  it('classifies dust for <20', () => {
    expect(classifyCondition({ qualityScore: 10 } as any)).toBe('dust')
  })
})

// ─── classifyWingType ────────────────────────────────────────────────────────

describe('classifyWingType', () => {
  it('returns empty-shelf for empty pages', () => {
    expect(classifyWingType([])).toBe('empty-shelf')
  })
  it('returns grand-archive for high avg with sacred count', () => {
    const pages = Array.from({ length: 5 }, () => ({
      qualityScore: 90, condition: 'sacred-text',
    }) as any)
    expect(classifyWingType(pages)).toBe('grand-archive')
  })
  it('returns reading-room for avg >= 60', () => {
    expect(classifyWingType([{ qualityScore: 60, condition: 'pamphlet' } as any])).toBe('reading-room')
  })
  it('returns study-hall for avg >= 45', () => {
    expect(classifyWingType([{ qualityScore: 45, condition: 'dust' } as any])).toBe('study-hall')
  })
  it('returns scroll-rack for avg >= 30', () => {
    expect(classifyWingType([{ qualityScore: 30, condition: 'dust' } as any])).toBe('scroll-rack')
  })
  it('returns bookshelf for avg >= 15', () => {
    expect(classifyWingType([{ qualityScore: 15, condition: 'dust' } as any])).toBe('bookshelf')
  })
  it('returns empty-shelf for avg < 15', () => {
    expect(classifyWingType([{ qualityScore: 5, condition: 'dust' } as any])).toBe('empty-shelf')
  })
})

// ─── classifyWingCondition ───────────────────────────────────────────────────

describe('classifyWingCondition', () => {
  it('classifies great-library for 80+', () => { expect(classifyWingCondition(80)).toBe('great-library') })
  it('classifies scholars-haven for 65-79', () => { expect(classifyWingCondition(65)).toBe('scholars-haven') })
  it('classifies reading-room for 50-64', () => { expect(classifyWingCondition(50)).toBe('reading-room') })
  it('classifies storage for 35-49', () => { expect(classifyWingCondition(35)).toBe('storage') })
  it('classifies attic for 20-34', () => { expect(classifyWingCondition(20)).toBe('attic') })
  it('classifies ruins for <20', () => { expect(classifyWingCondition(10)).toBe('ruins') })
})

// ─── classifyLibrarianGrade ──────────────────────────────────────────────────

describe('classifyLibrarianGrade', () => {
  it('returns head-librarian for 80+', () => { expect(classifyLibrarianGrade(80)).toBe('head-librarian') })
  it('returns senior-scholar for 65-79', () => { expect(classifyLibrarianGrade(65)).toBe('senior-scholar') })
  it('returns librarian for 50-64', () => { expect(classifyLibrarianGrade(50)).toBe('librarian') })
  it('returns clerk for 35-49', () => { expect(classifyLibrarianGrade(35)).toBe('clerk') })
  it('returns apprentice for 20-34', () => { expect(classifyLibrarianGrade(20)).toBe('apprentice') })
  it('returns book-burner for <20', () => { expect(classifyLibrarianGrade(10)).toBe('book-burner') })
})

// ─── analyzeLibraryWing ──────────────────────────────────────────────────────

describe('analyzeLibraryWing', () => {
  it('returns empty-shelf for empty pages', () => {
    const result = analyzeLibraryWing([], 'empty-dir')
    expect(result.directory).toBe('empty-dir')
    expect(result.pages).toEqual([])
    expect(result.avgScroll).toBe(0)
    expect(result.avgScholarly).toBe(0)
    expect(result.avgWisdom).toBe(0)
    expect(result.sacredCount).toBe(0)
    expect(result.dustCount).toBe(0)
    expect(result.wingType).toBe('empty-shelf')
    expect(result.condition).toBe('ruins')
  })

  it('analyzes wing with pages', () => {
    const p1 = analyzeManuscriptPage(RICH_CONTENT, 'rich.ts')
    const result = analyzeLibraryWing([p1], 'src')
    expect(result.avgScroll).toBe(93)
    expect(result.avgScholarly).toBe(95)
    expect(result.avgWisdom).toBe(93)
    expect(result.sacredCount).toBe(1)
    expect(result.dustCount).toBe(0)
  })
})

// ─── buildAncientLibraryResult ───────────────────────────────────────────────

describe('buildAncientLibraryResult', () => {
  it('returns empty result for no files', () => {
    const result = buildAncientLibraryResult([], [])
    expect(result.pages).toEqual([])
    expect(result.wings).toEqual([])
    expect(result.institution.overallWisdom).toBe(0)
    expect(result.institution.isWise).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalWings).toBe(0)
    expect(result.stats.librarianGrade).toBe('book-burner')
  })

  it('returns correct stats for rich + medium files', () => {
    const result = buildAncientLibraryResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalWings).toBe(1)
    expect(result.stats.avgScrollQuality).toBe(67)
    expect(result.stats.avgScholarlyDepth).toBe(62)
    expect(result.stats.avgCatalogOrganization).toBe(64)
    expect(result.stats.avgPreservationQuality).toBe(63)
    expect(result.stats.avgIlluminationBeauty).toBe(65)
    expect(result.stats.avgWisdomLevel).toBe(63)
    expect(result.stats.overallWisdom).toBe(64)
    expect(result.stats.librarianGrade).toBe('librarian')
    expect(result.stats.sacredTextCount).toBe(1)
    expect(result.stats.pamphletCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
    expect(result.stats.bestPage).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.deepest).toBe('rich.ts')
    expect(result.stats.mostOrganized).toBe('rich.ts')
    expect(result.stats.bestPreserved).toBe('rich.ts')
    expect(result.stats.mostBeautiful).toBe('rich.ts')
    expect(result.institution.overallWisdom).toBe(64)
    expect(result.institution.isWise).toBe(false)
  })

  it('includes sacred recommendation for high scores', () => {
    const result = buildAncientLibraryResult(['rich.ts'], [RICH_CONTENT])
    expect(result.recommendations).toContain('Sacred text achieved — your ancient library holds the world\'s knowledge')
  })

  it('computes wings by directory', () => {
    const result = buildAncientLibraryResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.wings.length).toBe(2)
  })
})

// ─── generateRecommendations ─────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends improving scroll when low', () => {
    const pages = [analyzeManuscriptPage(EMPTY_CONTENT, 'empty.ts')]
    const wings: any[] = []
    const institution = { avgScroll: 30, avgScholarly: 50, avgWisdom: 50, isWise: false, overallWisdom: 40 }
    const stats = {
      totalFiles: 1, totalWings: 0, avgScrollQuality: 30, avgScholarlyDepth: 50,
      avgCatalogOrganization: 50, avgPreservationQuality: 50, avgIlluminationBeauty: 50,
      avgWisdomLevel: 50, sacredTextCount: 0, valuedManuscriptCount: 0, referenceWorkCount: 0,
      pamphletCount: 1, fragmentCount: 0, dustCount: 0,
      hasHighDocCount: 0, hasHighDepthCount: 0, hasHighOrgCount: 0,
      hasHighPreservationCount: 0, hasHighBeautyCount: 0, hasHighWisdomCount: 0,
      overallWisdom: 40, librarianGrade: 'clerk' as const,
      bestPage: 'empty.ts', bestDocumented: 'empty.ts', deepest: 'empty.ts',
      mostOrganized: 'empty.ts', bestPreserved: 'empty.ts', mostBeautiful: 'empty.ts',
    }
    const recs = generateRecommendations(pages, wings, institution, stats)
    expect(recs).toContain('Improve scroll quality — add more documentation')
  })

  it('recommends sacred text when all scores are high', () => {
    const result = buildAncientLibraryResult(['rich.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.pages, result.wings, result.institution, result.stats)
    expect(recs).toContain('Sacred text achieved — your ancient library holds the world\'s knowledge')
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns green for high score', () => { expect(scoreColor(90)).toContain('90') })
  it('returns yellow for medium score', () => { expect(scoreColor(70)).toContain('70') })
  it('returns orange for low score', () => { expect(scoreColor(45)).toContain('45') })
  it('returns red for very low score', () => { expect(scoreColor(20)).toContain('20') })
})

describe('conditionColor', () => {
  it('colors sacred-text', () => { expect(conditionColor('sacred-text')).toContain('sacred-text') })
  it('colors dust', () => { expect(conditionColor('dust')).toContain('dust') })
  it('passes through unknown', () => { expect(conditionColor('unknown')).toBe('unknown') })
})

describe('gradeColor', () => {
  it('colors head-librarian', () => { expect(gradeColor('head-librarian')).toContain('head-librarian') })
  it('colors book-burner', () => { expect(gradeColor('book-burner')).toContain('book-burner') })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('scrollColor', () => {
  it('colors pristine-scroll', () => { expect(scrollColor('pristine-scroll')).toContain('pristine-scroll') })
  it('colors lost', () => { expect(scrollColor('lost')).toContain('lost') })
})

describe('scholarlyColor', () => {
  it('colors grand-scholar', () => { expect(scholarlyColor('grand-scholar')).toContain('grand-scholar') })
  it('colors illiterate', () => { expect(scholarlyColor('illiterate')).toContain('illiterate') })
})

describe('catalogColor', () => {
  it('colors dewey-perfect', () => { expect(catalogColor('dewey-perfect')).toContain('dewey-perfect') })
  it('colors nonexistent', () => { expect(catalogColor('nonexistent')).toContain('nonexistent') })
})

describe('preservationColor', () => {
  it('colors timeless', () => { expect(preservationColor('timeless')).toContain('timeless') })
  it('colors crumbling', () => { expect(preservationColor('crumbling')).toContain('crumbling') })
})

describe('illuminationColor', () => {
  it('colors masterwork', () => { expect(illuminationColor('masterwork')).toContain('masterwork') })
  it('colors ugly', () => { expect(illuminationColor('ugly')).toContain('ugly') })
})

describe('wisdomColor', () => {
  it('colors enlightened', () => { expect(wisdomColor('enlightened')).toContain('enlightened') })
  it('colors foolish', () => { expect(wisdomColor('foolish')).toContain('foolish') })
})

describe('wingTypeColor', () => {
  it('colors grand-archive', () => { expect(wingTypeColor('grand-archive')).toContain('grand-archive') })
  it('colors empty-shelf', () => { expect(wingTypeColor('empty-shelf')).toContain('empty-shelf') })
})

// ─── JSON Formatter ──────────────────────────────────────────────────────────

describe('formatAncientLibraryJson', () => {
  it('returns valid JSON', () => {
    const result = buildAncientLibraryResult([], [])
    const json = formatAncientLibraryJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.pages).toEqual([])
    expect(parsed.institution.overallWisdom).toBe(0)
  })
})

// ─── Table Formatter ─────────────────────────────────────────────────────────

describe('formatAncientLibraryTable', () => {
  it('includes Ancient Library Analysis header', () => {
    const result = buildAncientLibraryResult([], [])
    const table = formatAncientLibraryTable(result, false)
    expect(table).toContain('Ancient Library Analysis')
  })

  it('includes statistics in table output', () => {
    const result = buildAncientLibraryResult(['rich.ts'], [RICH_CONTENT])
    const table = formatAncientLibraryTable(result, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Librarian Grade')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildAncientLibraryResult(['rich.ts'], [RICH_CONTENT])
    const table = formatAncientLibraryTable(result, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('includes recommendations', () => {
    const result = buildAncientLibraryResult(['rich.ts'], [RICH_CONTENT])
    const table = formatAncientLibraryTable(result, false)
    expect(table).toContain('Recommendations')
  })
})
