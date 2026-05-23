import { describe, it, expect } from 'vitest'
import {
  measurePreserved,
  measureEssence,
  measureAging,
  measureFossil,
  measureCrystalline,
  measureWisdom,
  analyzeAmberSpecimen,
  classifySpecimenCondition,
  classifyCollectionType,
  classifyCollectionCondition,
  classifyPaleontologistGrade,
  analyzeAmberCollection,
  buildAmberFossilResult,
} from '../src/commands/amber-fossil-helpers.js'
import {
  scoreColor,
  stateColor,
  purityColor,
  agingQualityColor,
  fossilStateColor,
  formColor,
  levelColor,
  conditionColor,
  gradeColor,
  collectionTypeColor,
  collectionConditionColor,
  formatAmberFossilJson,
  formatAmberFossilTable,
} from '../src/commands/amber-fossil-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User { id: number; name: string }
export type UserRole = 'admin' | 'user'
export class UserService {
  private users: Map<number, User> = new Map()
  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      return user ?? null
    } catch (error) {
      return null
    }
  }
}
import { injectable } from 'tsyringe'
/** Documentation */
export async function processUser(user: User): Promise<void> {
  await Promise.resolve(user)
}
`

const MEDIUM = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY = ''

// ─── measurePreserved ──────────────────────────────────────────────────────

describe('measurePreserved', () => {
  it('returns perfectly-preserved for rich code', () => {
    const r = measurePreserved(RICH)
    expect(r.state).toBe('perfectly-preserved')
    expect(r.stability).toBe(100)
  })

  it('returns lower state for medium code', () => {
    const r = measurePreserved(MEDIUM)
    expect(r.stability).toBeGreaterThan(0)
  })

  it('returns decomposed for empty content', () => {
    const r = measurePreserved(EMPTY)
    expect(r.state).toBe('decomposed')
    expect(r.stability).toBe(0)
  })

  it('detects exports giving hasIntact', () => {
    const r = measurePreserved('export function foo() {}')
    expect(r.hasIntact).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measurePreserved(RICH)
    expect(typeof r.hasHighStability).toBe('boolean')
    expect(typeof r.hasNoDecay).toBe('boolean')
    expect(typeof r.hasPristine).toBe('boolean')
  })

  it('counts decay patterns', () => {
    const r = measurePreserved('TODO: fix this\nFIXME: broken')
    expect(r.decayCount).toBeGreaterThan(0)
    expect(r.hasNoDecay).toBe(false)
  })
})

// ─── measureEssence ────────────────────────────────────────────────────────

describe('measureEssence', () => {
  it('returns clear-specimen for rich code', () => {
    const r = measureEssence(RICH)
    expect(r.purity).toBe('clear-specimen')
    expect(r.quality).toBeGreaterThan(0)
  })

  it('returns opaque-mass for empty content', () => {
    const r = measureEssence(EMPTY)
    expect(r.purity).toBe('opaque-mass')
    expect(r.quality).toBe(0)
  })

  it('detects interfaces giving hasPure', () => {
    const r = measureEssence('interface Foo { x: number }')
    expect(r.hasPure).toBe(true)
  })

  it('detects typed params giving hasCore', () => {
    const r = measureEssence('function foo(x: number) {}')
    expect(r.hasCore).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureEssence(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasNoContamination).toBe('boolean')
    expect(typeof r.hasEssential).toBe('boolean')
  })

  it('counts contamination patterns', () => {
    const r = measureEssence('console.log("debug")')
    expect(r.contaminationCount).toBeGreaterThan(0)
  })
})

// ─── measureAging ──────────────────────────────────────────────────────────

describe('measureAging', () => {
  it('returns properly-matured for rich code', () => {
    const r = measureAging(RICH)
    expect(r.quality).toBe('properly-matured')
    expect(r.grace).toBeGreaterThan(0)
  })

  it('returns ancient-ruin for empty content', () => {
    const r = measureAging(EMPTY)
    expect(r.quality).toBe('ancient-ruin')
    expect(r.grace).toBe(0)
  })

  it('detects try/catch giving hasAgedWell', () => {
    const r = measureAging('try { x() } catch(e) {}')
    expect(r.hasAgedWell).toBe(true)
  })

  it('detects private giving hasEnduring', () => {
    const r = measureAging('class X { private y = 1 }')
    expect(r.hasEnduring).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureAging(RICH)
    expect(typeof r.hasHighGrace).toBe('boolean')
    expect(typeof r.hasNoBitrot).toBe('boolean')
    expect(typeof r.hasTimeless).toBe('boolean')
  })

  it('counts bitrot patterns', () => {
    const r = measureAging('var x = 1;\narguments[0]')
    expect(r.bitrotCount).toBeGreaterThan(0)
  })
})

// ─── measureFossil ─────────────────────────────────────────────────────────

describe('measureFossil', () => {
  it('returns partially-fossilized for rich code', () => {
    const r = measureFossil(RICH)
    expect(r.state).toBe('partially-fossilized')
    expect(r.immutability).toBeGreaterThan(0)
  })

  it('returns still-decaying for empty content', () => {
    const r = measureFossil(EMPTY)
    expect(r.state).toBe('still-decaying')
    expect(r.immutability).toBe(0)
  })

  it('detects const giving hasConstant', () => {
    const r = measureFossil('const x = 1')
    expect(r.hasConstant).toBe(true)
  })

  it('detects readonly giving positive immutability', () => {
    const r = measureFossil('interface X { readonly y: number }')
    expect(r.immutability).toBeGreaterThan(0)
    expect(r.hasStable).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureFossil(RICH)
    expect(typeof r.hasHighImmutability).toBe('boolean')
    expect(typeof r.hasNoMutation).toBe('boolean')
    expect(typeof r.hasStable).toBe('boolean')
  })

  it('counts mutation patterns', () => {
    const r = measureFossil('let x = 1;\nvar y = 2;')
    expect(r.mutationCount).toBeGreaterThan(0)
  })
})

// ─── measureCrystalline ────────────────────────────────────────────────────

describe('measureCrystalline', () => {
  it('returns well-formed for rich code', () => {
    const r = measureCrystalline(RICH)
    expect(r.form).toBe('well-formed')
    expect(r.quality).toBeGreaterThan(0)
  })

  it('returns chaotic for empty content', () => {
    const r = measureCrystalline(EMPTY)
    expect(r.form).toBe('chaotic')
    expect(r.quality).toBe(0)
  })

  it('detects interface giving hasLattice', () => {
    const r = measureCrystalline('interface Foo { x: number }')
    expect(r.hasLattice).toBe(true)
  })

  it('detects strict checks giving hasRegular', () => {
    const r = measureCrystalline('if (x === y) {}')
    expect(r.hasRegular).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureCrystalline(RICH)
    expect(typeof r.hasHighQuality).toBe('boolean')
    expect(typeof r.hasOrdered).toBe('boolean')
    expect(typeof r.hasSymmetric).toBe('boolean')
  })
})

// ─── measureWisdom ─────────────────────────────────────────────────────────

describe('measureWisdom', () => {
  it('returns wise-elder for rich code', () => {
    const r = measureWisdom(RICH)
    expect(r.level).toBe('wise-elder')
    expect(r.maturity).toBeGreaterThan(0)
  })

  it('returns naive for empty content', () => {
    const r = measureWisdom(EMPTY)
    expect(r.level).toBe('naive')
    expect(r.maturity).toBe(0)
  })

  it('detects try/catch giving hasProven', () => {
    const r = measureWisdom('try { x() } catch(e) {}')
    expect(r.hasProven).toBe(true)
  })

  it('detects error handling + type guards giving hasRobust', () => {
    const r = measureWisdom('try { if (x instanceof Y) {} } catch(e) {}')
    expect(r.hasRobust).toBe(true)
  })

  it('has boolean flags', () => {
    const r = measureWisdom(RICH)
    expect(typeof r.hasHighMaturity).toBe('boolean')
    expect(typeof r.hasNoNaivety).toBe('boolean')
    expect(typeof r.hasRefined).toBe('boolean')
  })

  it('counts naivety patterns', () => {
    const r = measureWisdom('var x: any = 1')
    expect(r.naivetyCount).toBeGreaterThan(0)
  })
})

// ─── analyzeAmberSpecimen (RICH fixture) ────────────────────────────────────

describe('analyzeAmberSpecimen - RICH fixture', () => {
  const sp = analyzeAmberSpecimen(RICH, 'rich.ts')

  it('has correct preservation', () => expect(sp.preservation).toBe(100))
  it('has correct trapped essence', () => expect(sp.trappedEssence).toBe(58))
  it('has correct aging grace', () => expect(sp.agingGrace).toBe(63))
  it('has correct fossilization', () => expect(sp.fossilization).toBe(46))
  it('has correct crystalline quality', () => expect(sp.crystallineQuality).toBe(70))
  it('has correct ancient wisdom', () => expect(sp.ancientWisdom).toBe(69))
  it('has correct quality score', () => expect(sp.qualityScore).toBe(69))
  it('has correct condition', () => expect(sp.condition).toBe('good-fossil'))
  it('has correct file', () => expect(sp.file).toBe('rich.ts'))
  it('has perfectly-preserved state', () => expect(sp.preserved.state).toBe('perfectly-preserved'))
  it('has clear-specimen purity', () => expect(sp.essence.purity).toBe('clear-specimen'))
  it('has properly-matured aging', () => expect(sp.aging.quality).toBe('properly-matured'))
  it('has partially-fossilized fossil', () => expect(sp.fossil.state).toBe('partially-fossilized'))
  it('has well-formed crystalline', () => expect(sp.crystalline.form).toBe('well-formed'))
  it('has wise-elder wisdom', () => expect(sp.wisdom.level).toBe('wise-elder'))
})

// ─── analyzeAmberSpecimen (MEDIUM fixture) ──────────────────────────────────

describe('analyzeAmberSpecimen - MEDIUM fixture', () => {
  const sp = analyzeAmberSpecimen(MEDIUM, 'medium.ts')

  it('has correct preservation', () => expect(sp.preservation).toBe(13))
  it('has correct trapped essence', () => expect(sp.trappedEssence).toBe(0))
  it('has correct aging grace', () => expect(sp.agingGrace).toBe(0))
  it('has correct fossilization', () => expect(sp.fossilization).toBe(0))
  it('has correct crystalline quality', () => expect(sp.crystallineQuality).toBe(0))
  it('has correct ancient wisdom', () => expect(sp.ancientWisdom).toBe(0))
  it('has correct quality score', () => expect(sp.qualityScore).toBe(3))
  it('has dust condition', () => expect(sp.condition).toBe('dust'))
})

// ─── analyzeAmberSpecimen (EMPTY fixture) ───────────────────────────────────

describe('analyzeAmberSpecimen - EMPTY fixture', () => {
  const sp = analyzeAmberSpecimen(EMPTY, 'empty.ts')

  it('has zero preservation', () => expect(sp.preservation).toBe(0))
  it('has zero trapped essence', () => expect(sp.trappedEssence).toBe(0))
  it('has zero aging grace', () => expect(sp.agingGrace).toBe(0))
  it('has zero fossilization', () => expect(sp.fossilization).toBe(0))
  it('has zero crystalline quality', () => expect(sp.crystallineQuality).toBe(0))
  it('has zero ancient wisdom', () => expect(sp.ancientWisdom).toBe(0))
  it('has zero quality score', () => expect(sp.qualityScore).toBe(0))
  it('has dust condition', () => expect(sp.condition).toBe('dust'))
})

// ─── classifySpecimenCondition ──────────────────────────────────────────────

describe('classifySpecimenCondition', () => {
  it('classifies 90 as museum-piece', () => expect(classifySpecimenCondition(90)).toBe('museum-piece'))
  it('classifies 75 as fine-specimen', () => expect(classifySpecimenCondition(75)).toBe('fine-specimen'))
  it('classifies 60 as good-fossil', () => expect(classifySpecimenCondition(60)).toBe('good-fossil'))
  it('classifies 45 as weathered-amber', () => expect(classifySpecimenCondition(45)).toBe('weathered-amber'))
  it('classifies 30 as degrading', () => expect(classifySpecimenCondition(30)).toBe('degrading'))
  it('classifies 10 as dust', () => expect(classifySpecimenCondition(10)).toBe('dust'))
})

// ─── classifyPaleontologistGrade ────────────────────────────────────────────

describe('classifyPaleontologistGrade', () => {
  it('classifies 90 as master-paleontologist', () => expect(classifyPaleontologistGrade(90)).toBe('master-paleontologist'))
  it('classifies 75 as expert-collector', () => expect(classifyPaleontologistGrade(75)).toBe('expert-collector'))
  it('classifies 50 as skilled-finder', () => expect(classifyPaleontologistGrade(50)).toBe('skilled-finder'))
  it('classifies 35 as amateur-collector', () => expect(classifyPaleontologistGrade(35)).toBe('amateur-collector'))
  it('classifies 20 as beachcomber', () => expect(classifyPaleontologistGrade(20)).toBe('beachcomber'))
  it('classifies 5 as tourist', () => expect(classifyPaleontologistGrade(5)).toBe('tourist'))
})

// ─── classifyCollectionType ────────────────────────────────────────────────

describe('classifyCollectionType', () => {
  it('returns empty-display for empty specimens', () => {
    expect(classifyCollectionType([])).toBe('empty-display')
  })

  it('classifies rich specimens', () => {
    const specs = [analyzeAmberSpecimen(RICH, 'r.ts')]
    const result = classifyCollectionType(specs)
    expect(typeof result).toBe('string')
  })

  it('classifies empty specimens as empty-display', () => {
    const specs = [analyzeAmberSpecimen(EMPTY, 'e.ts')]
    expect(classifyCollectionType(specs)).toBe('empty-display')
  })

  it('returns a valid type', () => {
    const specs = [analyzeAmberSpecimen(RICH, 'a.ts'), analyzeAmberSpecimen(MEDIUM, 'b.ts')]
    const valid = ['natural-history-museum', 'private-collection', 'jewelry-box', 'curiosity-cabinet', 'beach-combing', 'empty-display']
    expect(valid).toContain(classifyCollectionType(specs))
  })
})

// ─── analyzeAmberCollection ────────────────────────────────────────────────

describe('analyzeAmberCollection', () => {
  it('analyzes single specimen', () => {
    const sp = analyzeAmberSpecimen(RICH, 'a.ts')
    const coll = analyzeAmberCollection([sp], '.')
    expect(coll.directory).toBe('.')
    expect(coll.specimens).toHaveLength(1)
    expect(typeof coll.collectionType).toBe('string')
  })

  it('computes avgPreservation from specimens', () => {
    const s1 = analyzeAmberSpecimen(RICH, 'a.ts')
    const s2 = analyzeAmberSpecimen(MEDIUM, 'b.ts')
    const coll = analyzeAmberCollection([s1, s2], 'src')
    expect(coll.avgPreservation).toBe(Math.round((100 + 13) / 2))
    expect(coll.directory).toBe('src')
  })

  it('returns empty-display for no specimens', () => {
    const coll = analyzeAmberCollection([], 'empty')
    expect(coll.collectionType).toBe('empty-display')
    expect(coll.condition).toBe('empty-case')
    expect(coll.avgPreservation).toBe(0)
  })
})

// ─── buildAmberFossilResult (RICH + MEDIUM) ────────────────────────────────

describe('buildAmberFossilResult - RICH + MEDIUM', () => {
  const result = buildAmberFossilResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])

  it('has 2 total files', () => expect(result.stats.totalFiles).toBe(2))
  it('has 1 total collection', () => expect(result.stats.totalCollections).toBe(1))
  it('has correct avg preservation', () => expect(result.stats.avgPreservation).toBe(57))
  it('has correct avg trapped essence', () => expect(result.stats.avgTrappedEssence).toBe(29))
  it('has correct avg aging grace', () => expect(result.stats.avgAgingGrace).toBe(32))
  it('has correct avg fossilization', () => expect(result.stats.avgFossilization).toBe(23))
  it('has correct avg crystalline quality', () => expect(result.stats.avgCrystallineQuality).toBe(35))
  it('has correct avg ancient wisdom', () => expect(result.stats.avgAncientWisdom).toBe(35))
  it('has overall preservation of 36', () => expect(result.stats.overallPreservation).toBe(36))
  it('has paleontologist grade amateur-collector', () => expect(result.stats.paleontologistGrade).toBe('amateur-collector'))
  it('has 0 museum pieces', () => expect(result.stats.museumPieceCount).toBe(0))
  it('has 1 good fossil', () => expect(result.stats.goodFossilCount).toBe(1))
  it('has 1 dust', () => expect(result.stats.dustCount).toBe(1))
  it('museum avgPreservation is 57', () => expect(result.museum.avgPreservation).toBe(57))
  it('museum overallPreservation is 36', () => expect(result.museum.overallPreservation).toBe(36))
  it('museum isPreserved is false', () => expect(result.museum.isPreserved).toBe(false))
  it('has bestSpecimen rich.ts', () => expect(result.stats.bestSpecimen).toBe('rich.ts'))
  it('has bestPreserved rich.ts', () => expect(result.stats.bestPreserved).toBe('rich.ts'))
  it('has bestStructured rich.ts', () => expect(result.stats.bestStructured).toBe('rich.ts'))
  it('has 1 collection', () => expect(result.collections).toHaveLength(1))
  it('collection has directory .', () => expect(result.collections[0].directory).toBe('.'))
  it('collection has type beach-combing', () => expect(result.collections[0].collectionType).toBe('beach-combing'))
  it('collection has condition mixed-bag', () => expect(result.collections[0].condition).toBe('mixed-bag'))
  it('has 2 specimens', () => expect(result.specimens).toHaveLength(2))
  it('has recommendations', () => expect(Array.isArray(result.recommendations)).toBe(true))
})

// ─── buildAmberFossilResult (4x EMPTY) ─────────────────────────────────────

describe('buildAmberFossilResult - 4x EMPTY', () => {
  const result = buildAmberFossilResult(
    ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
    [EMPTY, EMPTY, EMPTY, EMPTY],
  )

  it('has 4 total files', () => expect(result.stats.totalFiles).toBe(4))
  it('has 1 total collection', () => expect(result.stats.totalCollections).toBe(1))
  it('has zero avg preservation', () => expect(result.stats.avgPreservation).toBe(0))
  it('has zero overall preservation', () => expect(result.stats.overallPreservation).toBe(0))
  it('has paleontologist grade tourist', () => expect(result.stats.paleontologistGrade).toBe('tourist'))
  it('museum avgPreservation is 0', () => expect(result.museum.avgPreservation).toBe(0))
  it('museum isPreserved is false', () => expect(result.museum.isPreserved).toBe(false))
  it('has 4 dust specimens', () => expect(result.stats.dustCount).toBe(4))
  it('has 4 specimens', () => expect(result.specimens).toHaveLength(4))
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns a string', () => expect(typeof scoreColor(50)).toBe('string'))
})

describe('stateColor', () => {
  it('colors perfectly-preserved', () => expect(typeof stateColor('perfectly-preserved')).toBe('string'))
  it('handles unknown', () => expect(stateColor('unknown')).toBe('unknown'))
})

describe('purityColor', () => {
  it('colors pure-essence', () => expect(typeof purityColor('pure-essence')).toBe('string'))
  it('handles unknown', () => expect(purityColor('unknown')).toBe('unknown'))
})

describe('agingQualityColor', () => {
  it('colors vintage-masterpiece', () => expect(typeof agingQualityColor('vintage-masterpiece')).toBe('string'))
  it('handles unknown', () => expect(agingQualityColor('unknown')).toBe('unknown'))
})

describe('fossilStateColor', () => {
  it('colors petrified-perfection', () => expect(typeof fossilStateColor('petrified-perfection')).toBe('string'))
  it('handles unknown', () => expect(fossilStateColor('unknown')).toBe('unknown'))
})

describe('formColor', () => {
  it('colors perfect-crystal', () => expect(typeof formColor('perfect-crystal')).toBe('string'))
  it('handles unknown', () => expect(formColor('unknown')).toBe('unknown'))
})

describe('levelColor', () => {
  it('colors ancient-sage', () => expect(typeof levelColor('ancient-sage')).toBe('string'))
  it('handles unknown', () => expect(levelColor('unknown')).toBe('unknown'))
})

describe('conditionColor', () => {
  it('colors museum-piece', () => expect(typeof conditionColor('museum-piece')).toBe('string'))
  it('handles unknown', () => expect(conditionColor('unknown')).toBe('unknown'))
})

describe('gradeColor', () => {
  it('colors master-paleontologist', () => expect(typeof gradeColor('master-paleontologist')).toBe('string'))
  it('handles unknown', () => expect(gradeColor('unknown')).toBe('unknown'))
})

describe('collectionTypeColor', () => {
  it('colors natural-history-museum', () => expect(typeof collectionTypeColor('natural-history-museum')).toBe('string'))
  it('handles unknown', () => expect(collectionTypeColor('unknown')).toBe('unknown'))
})

describe('collectionConditionColor', () => {
  it('colors world-class-collection', () => expect(typeof collectionConditionColor('world-class-collection')).toBe('string'))
  it('handles unknown', () => expect(collectionConditionColor('unknown')).toBe('unknown'))
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatAmberFossilJson', () => {
  it('returns valid JSON', () => {
    const result = buildAmberFossilResult(['a.ts'], [RICH])
    const json = formatAmberFossilJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.specimens).toHaveLength(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatAmberFossilTable', () => {
  it('returns string with Amber Fossil header', () => {
    const result = buildAmberFossilResult(['a.ts'], [RICH])
    const table = formatAmberFossilTable(result, false)
    expect(table).toContain('Amber Fossil')
    expect(table).toContain('Museum Overview')
    expect(table).toContain('Statistics')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildAmberFossilResult(['a.ts'], [RICH])
    const table = formatAmberFossilTable(result, true)
    expect(table).toContain('Per-File Specimens')
    expect(table).toContain('a.ts')
  })

  it('hides per-file details in non-verbose mode', () => {
    const result = buildAmberFossilResult(['a.ts'], [RICH])
    const table = formatAmberFossilTable(result, false)
    expect(table).not.toContain('Per-File Specimens')
  })
})
