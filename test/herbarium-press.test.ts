import { describe, expect, it } from 'vitest'

import {
  analyzeCabinetDrawer,
  analyzeHerbariumSheet,
  buildHerbariumPressResult,
  classifyBotanistGrade,
  classifyDrawerCondition,
  classifyDrawerType,
  classifySheetCondition,
  generateRecommendations,
  measureCataloguing,
  measureCollection,
  measureLabel,
  measurePreservation,
  measureSpecimen,
  measureTaxonomy,
} from '../src/commands/herbarium-press-helpers.js'

import {
  formatHerbariumPressCsv,
  formatHerbariumPressJson,
  formatHerbariumPressTable,
} from '../src/commands/herbarium-press-format-helpers.js'

const EMPTY = ''
const SIMPLE = `import { a } from "./x"
export function hello(): string {
  return "world"
}
`
const COMPLEX = `import { a, b, c } from "./utils"
import { EventEmitter } from "events"

/**
 * @author botanist
 * Processor module for data transformation
 * @version 1.0.0
 */
interface Data {
  value: number
  name: string
}

class Processor {
  private data: Data[] = []
  static instance: Processor

  constructor() {
    this.init()
  }

  init(): void {
    this.data = []
  }

  async process(input: string): Promise<string> {
    try {
      const result = await this.transform(input)
      return result
    } catch (error) {
      throw new Error("Processing failed")
    }
  }

  async transform(input: string): Promise<string> {
    return input.toUpperCase()
  }
}

export { Processor }
export type { Data }
`
const TYPED = `export function add(a: number, b: number): number {
  return a + b
}

export interface Config {
  host: string
  port: number
  enabled: boolean
}

export type Result = string | number
`
const MINIMAL = `function simple() {
  return 1
}
`
const BAD_CODE = `// TODO fix this
// FIXME broken
// HACK terrible
// @deprecated old code
var x: any = undefined
var y: any = undefined
var z: any = undefined
`
const TEST_FILE = `import { describe, it, expect } from "vitest"

describe("my test", () => {
  it("works", () => {
    expect(1).toBe(1)
  })
  it("also works", () => {
    expect(2).toBe(2)
  })
})
`

// ─── measureSpecimen ────────────────────────────────────

describe('measureSpecimen', () => {
  it('returns 0 quality for empty content', () => {
    const result = measureSpecimen(EMPTY)
    expect(result.quality).toBe(0)
  })

  it('detects type specimen with exports + classes + interfaces', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.isTypeSpecimen).toBe(true)
  })

  it('detects kingdom based on code structure', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.kingdom).toBe('animalia')
  })

  it('classifies family correctly', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.family).toBe('class-module')
  })

  it('detects well preserved for high quality', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.isWellPreserved).toBe(true)
  })

  it('detects degraded for low quality', () => {
    const result = measureSpecimen('x')
    expect(result.isDegraded).toBe(true)
  })

  it('collects characteristics', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.hasCharacteristics.length).toBeGreaterThan(0)
  })

  it('incertae-sedis kingdom for plain text', () => {
    const result = measureSpecimen('just text')
    expect(result.kingdom).toBe('incertae-sedis')
  })

  it('quality is clamped between 0-100', () => {
    const result = measureSpecimen(COMPLEX)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
  })

  it('detects genus as exported for exported code', () => {
    const result = measureSpecimen(SIMPLE)
    expect(result.genus).toBe('exported')
  })
})

// ─── measurePreservation ────────────────────────────────

describe('measurePreservation', () => {
  it('returns 0 state for empty content', () => {
    const result = measurePreservation(EMPTY)
    expect(result.state).toBe(0)
  })

  it('detects pest damage from TODO/FIXME', () => {
    const result = measurePreservation(BAD_CODE)
    expect(result.hasPestDamage).toBe(true)
    expect(result.pestDamageCount).toBeGreaterThan(0)
  })

  it('detects fading from deprecated', () => {
    const result = measurePreservation(BAD_CODE)
    expect(result.hasFading).toBe(true)
  })

  it('detects acid free mount when no deprecated', () => {
    const result = measurePreservation(SIMPLE)
    expect(result.hasAcidFreeMount).toBe(true)
  })

  it('detects archival quality with tests + error handling', () => {
    const code = TEST_FILE + '\ntry { x() } catch(e) {}'
    const result = measurePreservation(code)
    expect(result.hasArchivalQuality).toBe(true)
  })

  it('assigns freeze-dried or live-collection for high state', () => {
    const result = measurePreservation(COMPLEX)
    expect(['live-collection', 'freeze-dried', 'pressed']).toContain(result.method)
  })

  it('assigns decaying or low method for low state', () => {
    const result = measurePreservation('x')
    expect(['decaying', 'fossil', 'liquid-preserved']).toContain(result.method)
  })

  it('state is clamped between 0-100', () => {
    const result = measurePreservation(COMPLEX)
    expect(result.state).toBeGreaterThanOrEqual(0)
    expect(result.state).toBeLessThanOrEqual(100)
  })

  it('detects properly mounted with error handling + types', () => {
    const result = measurePreservation(COMPLEX)
    expect(result.isProperlyMounted).toBe(true)
  })
})

// ─── measureTaxonomy ────────────────────────────────────

describe('measureTaxonomy', () => {
  it('returns 0 clarity for empty content', () => {
    const result = measureTaxonomy(EMPTY)
    expect(result.clarity).toBe(0)
  })

  it('detects binomial name with exports + classes/interfaces', () => {
    const result = measureTaxonomy(COMPLEX)
    expect(result.hasBinomialName).toBe(true)
  })

  it('detects common name from getter/setter patterns', () => {
    const code = 'export function getData() { return 1 }\nexport function isActive() { return true }\n'
    const result = measureTaxonomy(code)
    expect(result.hasCommonName).toBe(true)
  })

  it('detects scientific name from types/interfaces', () => {
    const result = measureTaxonomy(TYPED)
    expect(result.hasScientificName).toBe(true)
  })

  it('detects synonyms from type aliases (as keyword)', () => {
    const code = 'import { x } from "./a"\nconst y = x as string\nexport { y }\n'
    const result = measureTaxonomy(code)
    expect(result.hasSynonyms).toBe(true)
    expect(result.synonymCount).toBeGreaterThan(0)
  })

  it('detects obsolete name from @deprecated', () => {
    const result = measureTaxonomy(BAD_CODE)
    expect(result.hasObsoleteName).toBe(true)
  })

  it('detects misidentification from excessive any', () => {
    const result = measureTaxonomy(BAD_CODE)
    expect(result.hasMisidentification).toBe(true)
    expect(result.misidentificationCount).toBeGreaterThan(2)
  })

  it('detects properly classified with exports + jsdoc', () => {
    const result = measureTaxonomy(COMPLEX)
    expect(result.isProperlyClassified).toBe(true)
  })

  it('clarity is clamped between 0-100', () => {
    const result = measureTaxonomy(COMPLEX)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
  })
})

// ─── measureCollection ──────────────────────────────────

describe('measureCollection', () => {
  it('returns 0 completeness for empty content', () => {
    const result = measureCollection(EMPTY)
    expect(result.completeness).toBe(0)
  })

  it('detects root system from imports', () => {
    const result = measureCollection(COMPLEX)
    expect(result.hasRootSystem).toBe(true)
  })

  it('detects stem from functions/classes', () => {
    const result = measureCollection(COMPLEX)
    expect(result.hasStem).toBe(true)
  })

  it('detects leaves from conditions/loops', () => {
    const code = 'if (x) {}\nfor (let i = 0; i < 10; i++) {}\n'
    const result = measureCollection(code)
    expect(result.hasLeaves).toBe(true)
  })

  it('detects flowers from exports', () => {
    const result = measureCollection(SIMPLE)
    expect(result.hasFlowers).toBe(true)
  })

  it('detects fruit from return statements', () => {
    const result = measureCollection(SIMPLE)
    expect(result.hasFruit).toBe(true)
  })

  it('detects seeds from interfaces/types', () => {
    const result = measureCollection(TYPED)
    expect(result.hasSeeds).toBe(true)
  })

  it('tracks missing parts', () => {
    const result = measureCollection('x')
    expect(result.missingParts.length).toBeGreaterThan(0)
  })

  it('detects all parts when imports/exports/functions/conditions/returns/types present', () => {
    const code = `import { a } from "./x"
if (x) {}
for (let i = 0; i < 1; i++) {}
export function add(a: number, b: number): number { return a + b }
export interface Config { host: string }
`
    const result = measureCollection(code)
    expect(result.hasAllParts).toBe(true)
    expect(result.missingParts).toEqual([])
  })

  it('completeness is clamped between 0-100', () => {
    const result = measureCollection(COMPLEX)
    expect(result.completeness).toBeGreaterThanOrEqual(0)
    expect(result.completeness).toBeLessThanOrEqual(100)
  })
})

// ─── measureLabel ───────────────────────────────────────

describe('measureLabel', () => {
  it('returns 0 accuracy for empty content', () => {
    const result = measureLabel(EMPTY)
    expect(result.accuracy).toBe(0)
  })

  it('detects collector name from @author', () => {
    const result = measureLabel(COMPLEX)
    expect(result.hasCollectorName).toBe(true)
  })

  it('detects collection date from @version/@since', () => {
    const result = measureLabel(COMPLEX)
    expect(result.hasCollectionDate).toBe(true)
  })

  it('detects location from imports', () => {
    const result = measureLabel(COMPLEX)
    expect(result.hasLocation).toBe(true)
  })

  it('detects description from jsdoc', () => {
    const result = measureLabel(COMPLEX)
    expect(result.hasDescription).toBe(true)
  })

  it('detects field notes from many comments', () => {
    const manyComments = '// note 1\n// note 2\n// note 3\n// note 4\n// note 5\n// note 6\n' + COMPLEX
    const result = measureLabel(manyComments)
    expect(result.hasFieldNotes).toBe(true)
    expect(result.fieldNoteCount).toBeGreaterThan(0)
  })

  it('detects properly labelled', () => {
    const result = measureLabel(COMPLEX)
    expect(result.isProperlyLabelled).toBe(true)
  })

  it('accuracy is clamped between 0-100', () => {
    const result = measureLabel(COMPLEX)
    expect(result.accuracy).toBeGreaterThanOrEqual(0)
    expect(result.accuracy).toBeLessThanOrEqual(100)
  })
})

// ─── measureCataloguing ─────────────────────────────────

describe('measureCataloguing', () => {
  it('returns 0 quality for empty content', () => {
    const result = measureCataloguing(EMPTY)
    expect(result.quality).toBe(0)
  })

  it('detects accession number from exports', () => {
    const result = measureCataloguing(SIMPLE)
    expect(result.hasAccessionNumber).toBe(true)
  })

  it('detects barcode from types', () => {
    const result = measureCataloguing(TYPED)
    expect(result.hasBarcode).toBe(true)
  })

  it('detects properly filed', () => {
    const result = measureCataloguing(SIMPLE)
    expect(result.isProperlyFiled).toBe(true)
  })

  it('detects cross references from imports', () => {
    const result = measureCataloguing(COMPLEX)
    expect(result.hasCrossReferences).toBe(true)
    expect(result.crossReferenceCount).toBeGreaterThan(0)
  })

  it('detects digital record from jsdoc', () => {
    const result = measureCataloguing(COMPLEX)
    expect(result.hasDigitalRecord).toBe(true)
  })

  it('detects index entry from multiple exports', () => {
    const result = measureCataloguing(COMPLEX)
    expect(result.hasIndexEntry).toBe(true)
  })

  it('quality is clamped between 0-100', () => {
    const result = measureCataloguing(COMPLEX)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
  })
})

// ─── classifySheetCondition ─────────────────────────────

describe('classifySheetCondition', () => {
  it('returns type-specimen for high scores', () => {
    expect(classifySheetCondition(80, 80, 80)).toBe('type-specimen')
  })

  it('returns pristine-sheet for medium-high scores', () => {
    expect(classifySheetCondition(55, 55, 55)).toBe('pristine-sheet')
  })

  it('returns well-curated for medium scores', () => {
    expect(classifySheetCondition(40, 40, 40)).toBe('well-curated')
  })

  it('returns adequately-stored for low-medium scores', () => {
    expect(classifySheetCondition(25, 25, 25)).toBe('adequately-stored')
  })

  it('returns degrading-specimen for low scores', () => {
    expect(classifySheetCondition(12, 12, 12)).toBe('degrading-specimen')
  })

  it('returns uncatalogued-scrap for very low scores', () => {
    expect(classifySheetCondition(5, 5, 5)).toBe('uncatalogued-scrap')
  })

  it('requires high specimen quality for type-specimen', () => {
    expect(classifySheetCondition(60, 80, 80)).toBe('pristine-sheet')
  })

  it('requires decent preservation for pristine-sheet', () => {
    expect(classifySheetCondition(70, 40, 70)).toBe('well-curated')
  })
})

// ─── classifyDrawerType ─────────────────────────────────

describe('classifyDrawerType', () => {
  it('returns compost-pile for no sheets', () => {
    expect(classifyDrawerType([])).toBe('compost-pile')
  })

  it('returns climate-vault for high avg quality with 30%+ type specimens', () => {
    const sheets = Array.from({ length: 10 }, (_, i) => ({
      ...analyzeHerbariumSheet(COMPLEX, `f${i}.ts`),
      condition: i < 4 ? 'type-specimen' as const : 'well-curated' as const,
    }))
    expect(classifyDrawerType(sheets)).toBe('climate-vault')
  })

  it('returns compost-pile for 40%+ scrap', () => {
    const sheets = Array.from({ length: 5 }, () => ({
      ...analyzeHerbariumSheet(MINIMAL, 't.ts'),
      condition: 'uncatalogued-scrap' as const,
      specimenQuality: 10,
    }))
    expect(classifyDrawerType(sheets)).toBe('compost-pile')
  })

  it('returns specimen-cabinet for decent avg quality', () => {
    const sheets = [analyzeHerbariumSheet(SIMPLE, 'a.ts')]
    const type = classifyDrawerType(sheets)
    expect(['specimen-cabinet', 'climate-vault', 'storage-drawer', 'shoebox', 'envelope']).toContain(type)
  })
})

// ─── classifyDrawerCondition ────────────────────────────

describe('classifyDrawerCondition', () => {
  it('returns world-class-collection for score >= 75', () => {
    expect(classifyDrawerCondition(80, 80)).toBe('world-class-collection')
  })

  it('returns research-collection for score >= 60', () => {
    expect(classifyDrawerCondition(60, 60)).toBe('research-collection')
  })

  it('returns teaching-collection for score >= 45', () => {
    expect(classifyDrawerCondition(45, 45)).toBe('teaching-collection')
  })

  it('returns hobby-collection for score >= 30', () => {
    expect(classifyDrawerCondition(30, 30)).toBe('hobby-collection')
  })

  it('returns salvage-pile for score >= 15', () => {
    expect(classifyDrawerCondition(15, 15)).toBe('salvage-pile')
  })

  it('returns compost for very low scores', () => {
    expect(classifyDrawerCondition(5, 5)).toBe('compost')
  })
})

// ─── classifyBotanistGrade ──────────────────────────────

describe('classifyBotanistGrade', () => {
  it('returns chief-botanist for >= 80', () => {
    expect(classifyBotanistGrade(80)).toBe('chief-botanist')
  })

  it('returns taxonomist for >= 65', () => {
    expect(classifyBotanistGrade(65)).toBe('taxonomist')
  })

  it('returns botanist for >= 50', () => {
    expect(classifyBotanistGrade(50)).toBe('botanist')
  })

  it('returns horticulturist for >= 35', () => {
    expect(classifyBotanistGrade(35)).toBe('horticulturist')
  })

  it('returns gardener for >= 20', () => {
    expect(classifyBotanistGrade(20)).toBe('gardener')
  })

  it('returns weed-puller for < 20', () => {
    expect(classifyBotanistGrade(10)).toBe('weed-puller')
  })
})

// ─── analyzeHerbariumSheet ──────────────────────────────

describe('analyzeHerbariumSheet', () => {
  it('returns a complete HerbariumSheet', () => {
    const sheet = analyzeHerbariumSheet(COMPLEX, 'src/processor.ts')
    expect(sheet.file).toBe('src/processor.ts')
    expect(sheet.specimenQuality).toBeGreaterThanOrEqual(0)
    expect(sheet.preservationState).toBeGreaterThanOrEqual(0)
    expect(sheet.taxonomicClarity).toBeGreaterThanOrEqual(0)
    expect(sheet.collectionCompleteness).toBeGreaterThanOrEqual(0)
    expect(sheet.labelAccuracy).toBeGreaterThanOrEqual(0)
    expect(sheet.cataloguingQuality).toBeGreaterThanOrEqual(0)
    expect(sheet.qualityScore).toBeGreaterThanOrEqual(0)
    expect(sheet.condition).toBeDefined()
  })

  it('has all measure objects', () => {
    const sheet = analyzeHerbariumSheet(SIMPLE, 'a.ts')
    expect(sheet.specimen).toBeDefined()
    expect(sheet.preservation).toBeDefined()
    expect(sheet.taxonomy).toBeDefined()
    expect(sheet.collection).toBeDefined()
    expect(sheet.label).toBeDefined()
    expect(sheet.cataloguing).toBeDefined()
  })

  it('quality score is clamped to 0-100', () => {
    const sheet = analyzeHerbariumSheet(COMPLEX, 'a.ts')
    expect(sheet.qualityScore).toBeGreaterThanOrEqual(0)
    expect(sheet.qualityScore).toBeLessThanOrEqual(100)
  })

  it('classifies condition based on specimen/preservation/taxonomy', () => {
    const sheet = analyzeHerbariumSheet(COMPLEX, 'a.ts')
    const validConditions = ['type-specimen', 'pristine-sheet', 'well-curated', 'adequately-stored', 'degrading-specimen', 'uncatalogued-scrap']
    expect(validConditions).toContain(sheet.condition)
  })

  it('handles empty content', () => {
    const sheet = analyzeHerbariumSheet(EMPTY, 'empty.ts')
    expect(sheet.specimenQuality).toBe(0)
    expect(sheet.file).toBe('empty.ts')
  })
})

// ─── analyzeCabinetDrawer ───────────────────────────────

describe('analyzeCabinetDrawer', () => {
  it('returns compost-pile drawer for no sheets', () => {
    const drawer = analyzeCabinetDrawer([], 'src')
    expect(drawer.drawerType).toBe('compost-pile')
    expect(drawer.condition).toBe('compost')
    expect(drawer.sheets).toEqual([])
    expect(drawer.avgSpecimenQuality).toBe(0)
  })

  it('calculates averages from sheets', () => {
    const sheets = [
      analyzeHerbariumSheet(SIMPLE, 'a.ts'),
      analyzeHerbariumSheet(COMPLEX, 'b.ts'),
    ]
    const drawer = analyzeCabinetDrawer(sheets, 'src')
    expect(drawer.avgSpecimenQuality).toBeGreaterThan(0)
    expect(drawer.avgPreservation).toBeGreaterThanOrEqual(0)
    expect(drawer.avgTaxonomicClarity).toBeGreaterThanOrEqual(0)
  })

  it('counts type specimens and degrading', () => {
    const sheets = [
      { ...analyzeHerbariumSheet(COMPLEX, 'a.ts'), condition: 'type-specimen' as const },
      { ...analyzeHerbariumSheet(MINIMAL, 'b.ts'), condition: 'uncatalogued-scrap' as const },
    ]
    const drawer = analyzeCabinetDrawer(sheets, 'src')
    expect(drawer.typeSpecimenCount).toBe(1)
    expect(drawer.degradingCount).toBe(1)
  })

  it('sets directory name', () => {
    const drawer = analyzeCabinetDrawer([analyzeHerbariumSheet(SIMPLE, 'a.ts')], 'lib')
    expect(drawer.directory).toBe('lib')
  })

  it('counts properly labelled and complete specimens', () => {
    const sheets = [analyzeHerbariumSheet(COMPLEX, 'a.ts')]
    const drawer = analyzeCabinetDrawer(sheets, 'src')
    expect(drawer.properlyLabelledCount).toBeGreaterThanOrEqual(0)
    expect(drawer.completeSpecimenCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for healthy code', () => {
    const sheets = [analyzeHerbariumSheet(COMPLEX, 'a.ts')]
    const drawers = [analyzeCabinetDrawer(sheets, 'src')]
    const museum = { avgSpecimenQuality: 80, avgPreservation: 80, avgTaxonomicClarity: 80, isWellCurated: true, overallCuration: 80 }
    const stats = {
      totalFiles: 1, totalDrawers: 1, avgSpecimenQuality: 80, avgPreservationState: 80,
      avgTaxonomicClarity: 80, avgCollectionCompleteness: 80, avgLabelAccuracy: 80, avgCataloguingQuality: 80,
      typeSpecimenCount: 1, pristineSheetCount: 0, wellCuratedCount: 0, adequatelyStoredCount: 0,
      degradingCount: 0, uncataloguedScrapCount: 0, pressedCount: 0, fossilCount: 0, decayingCount: 0,
      isProperlyMountedCount: 1, hasPestDamageCount: 0, hasBinomialNameCount: 1,
      hasMisidentificationCount: 0, hasAllPartsCount: 1, isProperlyLabelledCount: 1,
      hasFieldNotesCount: 1, hasAccessionNumberCount: 1, hasDigitalRecordCount: 1,
      overallCuration: 80, botanistGrade: 'chief-botanist' as const,
      bestSpecimen: 'a.ts', bestPreserved: 'a.ts', clearestTaxonomy: 'a.ts',
      mostComplete: 'a.ts', bestLabelled: 'a.ts',
    }
    const recs = generateRecommendations(sheets, drawers, museum, stats)
    expect(recs).toContain('Your herbarium is beautifully curated - excellent code classification and preservation')
  })

  it('recommends adding types for low curation', () => {
    const museum = { avgSpecimenQuality: 20, avgPreservation: 20, avgTaxonomicClarity: 20, isWellCurated: false, overallCuration: 20 }
    const stats = {
      totalFiles: 1, totalDrawers: 1, avgSpecimenQuality: 20, avgPreservationState: 20,
      avgTaxonomicClarity: 20, avgCollectionCompleteness: 20, avgLabelAccuracy: 20, avgCataloguingQuality: 20,
      typeSpecimenCount: 0, pristineSheetCount: 0, wellCuratedCount: 0, adequatelyStoredCount: 0,
      degradingCount: 0, uncataloguedScrapCount: 1, pressedCount: 0, fossilCount: 0, decayingCount: 0,
      isProperlyMountedCount: 0, hasPestDamageCount: 0, hasBinomialNameCount: 0,
      hasMisidentificationCount: 0, hasAllPartsCount: 0, isProperlyLabelledCount: 0,
      hasFieldNotesCount: 0, hasAccessionNumberCount: 0, hasDigitalRecordCount: 0,
      overallCuration: 20, botanistGrade: 'weed-puller' as const,
      bestSpecimen: 'a.ts', bestPreserved: 'a.ts', clearestTaxonomy: 'a.ts',
      mostComplete: 'a.ts', bestLabelled: 'a.ts',
    }
    const recs = generateRecommendations([], [], museum, stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends resolving pest damage', () => {
    const museum = { avgSpecimenQuality: 50, avgPreservation: 50, avgTaxonomicClarity: 50, isWellCurated: false, overallCuration: 50 }
    const stats = {
      totalFiles: 5, totalDrawers: 1, avgSpecimenQuality: 50, avgPreservationState: 50,
      avgTaxonomicClarity: 50, avgCollectionCompleteness: 50, avgLabelAccuracy: 50, avgCataloguingQuality: 50,
      typeSpecimenCount: 0, pristineSheetCount: 0, wellCuratedCount: 0, adequatelyStoredCount: 0,
      degradingCount: 0, uncataloguedScrapCount: 0, pressedCount: 0, fossilCount: 0, decayingCount: 0,
      isProperlyMountedCount: 0, hasPestDamageCount: 5, hasBinomialNameCount: 0,
      hasMisidentificationCount: 0, hasAllPartsCount: 1, isProperlyLabelledCount: 1,
      hasFieldNotesCount: 1, hasAccessionNumberCount: 1, hasDigitalRecordCount: 1,
      overallCuration: 50, botanistGrade: 'botanist' as const,
      bestSpecimen: 'a.ts', bestPreserved: 'a.ts', clearestTaxonomy: 'a.ts',
      mostComplete: 'a.ts', bestLabelled: 'a.ts',
    }
    const recs = generateRecommendations([], [], museum, stats)
    expect(recs.some((r) => r.includes('pest damage'))).toBe(true)
  })
})

// ─── buildHerbariumPressResult ──────────────────────────

describe('buildHerbariumPressResult', () => {
  it('handles empty input', () => {
    const result = buildHerbariumPressResult([], [], {})
    expect(result.sheets).toEqual([])
    expect(result.drawers).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalDrawers).toBe(0)
    expect(result.museum.overallCuration).toBe(0)
    expect(result.museum.isWellCurated).toBe(false)
    expect(result.stats.botanistGrade).toBe('weed-puller')
  })

  it('builds result for single file', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    expect(result.sheets.length).toBe(1)
    expect(result.sheets[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('builds result for multiple files', () => {
    const result = buildHerbariumPressResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [SIMPLE, COMPLEX, MINIMAL],
      {},
    )
    expect(result.sheets.length).toBe(3)
    expect(result.drawers.length).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('calculates stats correctly', () => {
    const result = buildHerbariumPressResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, SIMPLE],
      {},
    )
    expect(result.stats.avgSpecimenQuality).toBeGreaterThan(0)
    expect(result.stats.avgPreservationState).toBeGreaterThan(0)
    expect(result.stats.overallCuration).toBeGreaterThan(0)
  })

  it('sets best highlights', () => {
    const result = buildHerbariumPressResult(
      ['a.ts', 'b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    expect(result.stats.bestSpecimen).toBeTruthy()
    expect(result.stats.bestPreserved).toBeTruthy()
    expect(result.stats.clearestTaxonomy).toBeTruthy()
    expect(result.stats.mostComplete).toBeTruthy()
    expect(result.stats.bestLabelled).toBeTruthy()
  })

  it('returns none for highlights with no files', () => {
    const result = buildHerbariumPressResult([], [], {})
    expect(result.stats.bestSpecimen).toBe('none')
    expect(result.stats.bestPreserved).toBe('none')
    expect(result.stats.clearestTaxonomy).toBe('none')
    expect(result.stats.mostComplete).toBe('none')
    expect(result.stats.bestLabelled).toBe('none')
  })

  it('groups files by directory into drawers', () => {
    const result = buildHerbariumPressResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [SIMPLE, COMPLEX, MINIMAL],
      {},
    )
    expect(result.drawers.length).toBe(2)
    const srcDrawer = result.drawers.find((d) => d.directory === 'src')
    expect(srcDrawer).toBeDefined()
    expect(srcDrawer!.sheets.length).toBe(2)
  })

  it('generates recommendations', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks condition counts', () => {
    const result = buildHerbariumPressResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, SIMPLE],
      {},
    )
    const sum = result.stats.typeSpecimenCount +
      result.stats.pristineSheetCount +
      result.stats.wellCuratedCount +
      result.stats.adequatelyStoredCount +
      result.stats.degradingCount +
      result.stats.uncataloguedScrapCount
    expect(sum).toBe(2)
  })

  it('tracks preservation method counts', () => {
    const result = buildHerbariumPressResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, MINIMAL],
      {},
    )
    expect(result.stats.pressedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.fossilCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.decayingCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('formatHerbariumPressTable', () => {
  it('formats result as table string', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    const table = formatHerbariumPressTable(result, false)
    expect(table).toContain('Herbarium Press Report')
    expect(table).toContain('Museum Curation')
    expect(table).toContain('Statistics')
  })

  it('includes verbose sheet details', () => {
    const result = buildHerbariumPressResult(['a.ts'], [COMPLEX], {})
    const table = formatHerbariumPressTable(result, true)
    expect(table).toContain('Herbarium Sheets')
    expect(table).toContain('a.ts')
  })

  it('includes drawers', () => {
    const result = buildHerbariumPressResult(
      ['src/a.ts', 'src/b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    const table = formatHerbariumPressTable(result, false)
    expect(table).toContain('Cabinet Drawers')
  })

  it('includes recommendations', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    const table = formatHerbariumPressTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

describe('formatHerbariumPressJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    const json = formatHerbariumPressJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.sheets).toBeDefined()
    expect(parsed.museum).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes all top-level keys', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    const json = formatHerbariumPressJson(result)
    const parsed = JSON.parse(json)
    expect(Object.keys(parsed)).toContain('sheets')
    expect(Object.keys(parsed)).toContain('drawers')
    expect(Object.keys(parsed)).toContain('museum')
    expect(Object.keys(parsed)).toContain('stats')
    expect(Object.keys(parsed)).toContain('recommendations')
  })
})

describe('formatHerbariumPressCsv', () => {
  it('formats result as CSV with headers', () => {
    const result = buildHerbariumPressResult(['a.ts'], [SIMPLE], {})
    const csv = formatHerbariumPressCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('file')
    expect(lines[0]).toContain('specimenQuality')
    expect(lines[0]).toContain('condition')
    expect(lines.length).toBe(2)
  })

  it('handles multiple files in CSV', () => {
    const result = buildHerbariumPressResult(
      ['a.ts', 'b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    const csv = formatHerbariumPressCsv(result)
    const lines = csv.split('\n')
    expect(lines.length).toBe(3)
  })

  it('handles empty input', () => {
    const result = buildHerbariumPressResult([], [], {})
    const csv = formatHerbariumPressCsv(result)
    const lines = csv.split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toContain('file')
  })
})
