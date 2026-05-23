import { describe, it, expect } from 'vitest'
import {
  measureCrystalline,
  measureFractal,
  measureDelicate,
  measurePreserved,
  measureResilient,
  measureUnique,
  analyzeFrostCrystal,
  classifyCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyCrystallographerGrade,
  analyzeFrostGarden,
  generateRecommendations,
  buildFrostFernResult,
} from '../src/commands/frost-fern-helpers.js'
import {
  scoreColor,
  patternColor,
  beautyColor,
  finenessColor,
  preservationColor,
  toughnessColor,
  characterColor,
  conditionColor,
  gradeColor,
  formatFrostFernJson,
  formatFrostFernTable,
} from '../src/commands/frost-fern-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface User {
  id: number
  name: string
  email: string
}

export class UserService {
  private readonly users: Map<number, User> = new Map()

  async getUser(id: number): Promise<User | null> {
    try {
      const user = this.users.get(id)
      if (user === undefined) {
        return null
      }
      return user
    } catch {
      return null
    }
  }
}

export type Result<T> = { data: T; error?: string }

export function processItems(items: string[]): number {
  const processed = items.filter((item) => item.length > 0)
  return processed.length
}

const config = {
  readonly maxRetries: 3,
  timeout: 5000,
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  const service = new UserService()
  const user = await service.getUser(1)
  const result: Result<User | null> = { data: user }
  console.log(result)
}`

const EMPTY = ''
const MINIMAL = 'const x = 1'
const POOR = 'var x = 1\nvar y: any = 2'

// ─── measureCrystalline ────────────────────────────────────────────────────

describe('measureCrystalline', () => {
  it('returns structure=98 for RICH fixture', () => {
    expect(measureCrystalline(RICH).structure).toBe(98)
  })

  it('returns hexagonal-perfection for RICH fixture', () => {
    expect(measureCrystalline(RICH).pattern).toBe('hexagonal-perfection')
  })

  it('returns hasHighStructure=true for RICH fixture', () => {
    expect(measureCrystalline(RICH).hasHighStructure).toBe(true)
  })

  it('returns hasSymmetric=false for RICH fixture', () => {
    expect(measureCrystalline(RICH).hasSymmetric).toBe(false)
  })

  it('returns structure=0 for EMPTY fixture', () => {
    expect(measureCrystalline(EMPTY).structure).toBe(0)
  })

  it('returns formless for EMPTY fixture', () => {
    expect(measureCrystalline(EMPTY).pattern).toBe('formless')
  })

  it('returns structure=10 for MINIMAL fixture', () => {
    expect(measureCrystalline(MINIMAL).structure).toBe(10)
  })

  it('returns chaosCount=2 for POOR fixture', () => {
    expect(measureCrystalline(POOR).chaosCount).toBe(2)
  })

  it('returns amorphousCount=1 for POOR fixture', () => {
    expect(measureCrystalline(POOR).amorphousCount).toBe(1)
  })

  it('returns hasNoChaos=false for POOR fixture', () => {
    expect(measureCrystalline(POOR).hasNoChaos).toBe(false)
  })
})

// ─── measureFractal ────────────────────────────────────────────────────────

describe('measureFractal', () => {
  it('returns elegance=98 for RICH fixture', () => {
    expect(measureFractal(RICH).elegance).toBe(98)
  })

  it('returns golden-ratio for RICH fixture', () => {
    expect(measureFractal(RICH).beauty).toBe('golden-ratio')
  })

  it('returns hasHighElegance=true for RICH fixture', () => {
    expect(measureFractal(RICH).hasHighElegance).toBe(true)
  })

  it('returns hasHarmonious=false for RICH fixture', () => {
    expect(measureFractal(RICH).hasHarmonious).toBe(false)
  })

  it('returns elegance=0 for EMPTY fixture', () => {
    expect(measureFractal(EMPTY).elegance).toBe(0)
  })

  it('returns spaghetti for EMPTY fixture', () => {
    expect(measureFractal(EMPTY).beauty).toBe('spaghetti')
  })

  it('returns elegance=8 for MINIMAL fixture', () => {
    expect(measureFractal(MINIMAL).elegance).toBe(8)
  })

  it('returns clumsinessCount=2 for POOR fixture', () => {
    expect(measureFractal(POOR).clumsinessCount).toBe(2)
  })

  it('returns brutalityCount=1 for POOR fixture', () => {
    expect(measureFractal(POOR).brutalityCount).toBe(1)
  })
})

// ─── measureDelicate ───────────────────────────────────────────────────────

describe('measureDelicate', () => {
  it('returns design=100 for RICH fixture', () => {
    expect(measureDelicate(RICH).design).toBe(100)
  })

  it('returns lacework for RICH fixture', () => {
    expect(measureDelicate(RICH).fineness).toBe('lacework')
  })

  it('returns hasHighDesign=true for RICH fixture', () => {
    expect(measureDelicate(RICH).hasHighDesign).toBe(true)
  })

  it('returns hasNuanced=false for RICH fixture', () => {
    expect(measureDelicate(RICH).hasNuanced).toBe(false)
  })

  it('returns design=0 for EMPTY fixture', () => {
    expect(measureDelicate(EMPTY).design).toBe(0)
  })

  it('returns sledgehammer for EMPTY fixture', () => {
    expect(measureDelicate(EMPTY).fineness).toBe('sledgehammer')
  })

  it('returns design=8 for MINIMAL fixture', () => {
    expect(measureDelicate(MINIMAL).design).toBe(8)
  })

  it('returns crudenessCount=2 for POOR fixture', () => {
    expect(measureDelicate(POOR).crudenessCount).toBe(2)
  })

  it('returns coarsenessCount=1 for POOR fixture', () => {
    expect(measureDelicate(POOR).coarsenessCount).toBe(1)
  })
})

// ─── measurePreserved ──────────────────────────────────────────────────────

describe('measurePreserved', () => {
  it('returns stability=100 for RICH fixture', () => {
    expect(measurePreserved(RICH).stability).toBe(100)
  })

  it('returns permafrost for RICH fixture', () => {
    expect(measurePreserved(RICH).preservation).toBe('permafrost')
  })

  it('returns hasHighStability=true for RICH fixture', () => {
    expect(measurePreserved(RICH).hasHighStability).toBe(true)
  })

  it('returns hasEnduring=true for RICH fixture', () => {
    expect(measurePreserved(RICH).hasEnduring).toBe(true)
  })

  it('returns stability=0 for EMPTY fixture', () => {
    expect(measurePreserved(EMPTY).stability).toBe(0)
  })

  it('returns evaporated for EMPTY fixture', () => {
    expect(measurePreserved(EMPTY).preservation).toBe('evaporated')
  })

  it('returns stability=10 for MINIMAL fixture', () => {
    expect(measurePreserved(MINIMAL).stability).toBe(10)
  })

  it('returns volatilityCount=2 for POOR fixture', () => {
    expect(measurePreserved(POOR).volatilityCount).toBe(2)
  })

  it('returns mutationCount=1 for POOR fixture', () => {
    expect(measurePreserved(POOR).mutationCount).toBe(1)
  })
})

// ─── measureResilient ──────────────────────────────────────────────────────

describe('measureResilient', () => {
  it('returns coldStart=83 for RICH fixture', () => {
    expect(measureResilient(RICH).coldStart).toBe(83)
  })

  it('returns winter-hardy for RICH fixture', () => {
    expect(measureResilient(RICH).toughness).toBe('winter-hardy')
  })

  it('returns hasHighColdStart=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasHighColdStart).toBe(true)
  })

  it('returns hasInitialization=false for RICH fixture', () => {
    expect(measureResilient(RICH).hasInitialization).toBe(false)
  })

  it('returns hasDefensive=false for RICH fixture', () => {
    expect(measureResilient(RICH).hasDefensive).toBe(false)
  })

  it('returns hasRobust=true for RICH fixture', () => {
    expect(measureResilient(RICH).hasRobust).toBe(true)
  })

  it('returns coldStart=0 for EMPTY fixture', () => {
    expect(measureResilient(EMPTY).coldStart).toBe(0)
  })

  it('returns shattered for EMPTY fixture', () => {
    expect(measureResilient(EMPTY).toughness).toBe('shattered')
  })

  it('returns coldStart=16 for MINIMAL fixture', () => {
    expect(measureResilient(MINIMAL).coldStart).toBe(16)
  })

  it('returns crashCount=2 for POOR fixture', () => {
    expect(measureResilient(POOR).crashCount).toBe(2)
  })

  it('returns failureCount=1 for POOR fixture', () => {
    expect(measureResilient(POOR).failureCount).toBe(1)
  })
})

// ─── measureUnique ─────────────────────────────────────────────────────────

describe('measureUnique', () => {
  it('returns originality=100 for RICH fixture', () => {
    expect(measureUnique(RICH).originality).toBe(100)
  })

  it('returns unique-snowflake for RICH fixture', () => {
    expect(measureUnique(RICH).character).toBe('unique-snowflake')
  })

  it('returns hasHighOriginality=true for RICH fixture', () => {
    expect(measureUnique(RICH).hasHighOriginality).toBe(true)
  })

  it('returns hasInventive=true for RICH fixture', () => {
    expect(measureUnique(RICH).hasInventive).toBe(true)
  })

  it('returns hasNoPlagiarism=true for RICH fixture', () => {
    expect(measureUnique(RICH).hasNoPlagiarism).toBe(true)
  })

  it('returns hasNoDerivative=true for RICH fixture', () => {
    expect(measureUnique(RICH).hasNoDerivative).toBe(true)
  })

  it('returns originality=0 for EMPTY fixture', () => {
    expect(measureUnique(EMPTY).originality).toBe(0)
  })

  it('returns cookie-cutter for EMPTY fixture', () => {
    expect(measureUnique(EMPTY).character).toBe('cookie-cutter')
  })

  it('returns plagiarismCount=2 for POOR fixture', () => {
    expect(measureUnique(POOR).plagiarismCount).toBe(2)
  })

  it('returns copyPasteCount=1 for POOR fixture', () => {
    expect(measureUnique(POOR).copyPasteCount).toBe(1)
  })

  it('returns hasNoPlagiarism=false for POOR fixture', () => {
    expect(measureUnique(POOR).hasNoPlagiarism).toBe(false)
  })

  it('returns hasNoDerivative=false for POOR fixture', () => {
    expect(measureUnique(POOR).hasNoDerivative).toBe(false)
  })
})

// ─── analyzeFrostCrystal ───────────────────────────────────────────────────

describe('analyzeFrostCrystal', () => {
  it('returns qualityScore=97 for RICH fixture', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').qualityScore).toBe(97)
  })

  it('returns frost-masterpiece for RICH fixture', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').condition).toBe('frost-masterpiece')
  })

  it('returns qualityScore=0 for EMPTY fixture', () => {
    expect(analyzeFrostCrystal(EMPTY, 'empty.ts').qualityScore).toBe(0)
  })

  it('returns puddle for EMPTY fixture', () => {
    expect(analyzeFrostCrystal(EMPTY, 'empty.ts').condition).toBe('puddle')
  })

  it('returns qualityScore=10 for MINIMAL fixture', () => {
    expect(analyzeFrostCrystal(MINIMAL, 'minimal.ts').qualityScore).toBe(10)
  })

  it('returns qualityScore=1 for POOR fixture', () => {
    expect(analyzeFrostCrystal(POOR, 'poor.ts').qualityScore).toBe(1)
  })

  it('sets file path correctly', () => {
    expect(analyzeFrostCrystal(RICH, 'my/file.ts').file).toBe('my/file.ts')
  })

  it('carries crystallinePattern from measureCrystalline', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').crystallinePattern).toBe(98)
  })

  it('carries fractalElegance from measureFractal', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').fractalElegance).toBe(98)
  })

  it('carries delicateStructure from measureDelicate', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').delicateStructure).toBe(100)
  })

  it('carries icePreservation from measurePreserved', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').icePreservation).toBe(100)
  })

  it('carries winterResilience from measureResilient', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').winterResilience).toBe(83)
  })

  it('carries snowflakeUniqueness from measureUnique', () => {
    expect(analyzeFrostCrystal(RICH, 'test.ts').snowflakeUniqueness).toBe(100)
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns frost-masterpiece for score >= 85', () => {
    expect(classifyCondition(90)).toBe('frost-masterpiece')
  })

  it('returns crystal-garden for score >= 70', () => {
    expect(classifyCondition(75)).toBe('crystal-garden')
  })

  it('returns delicate-fern for score >= 55', () => {
    expect(classifyCondition(60)).toBe('delicate-fern')
  })

  it('returns rough-crystal for score >= 40', () => {
    expect(classifyCondition(45)).toBe('rough-crystal')
  })

  it('returns melting-ice for score >= 25', () => {
    expect(classifyCondition(30)).toBe('melting-ice')
  })

  it('returns puddle for score < 25', () => {
    expect(classifyCondition(10)).toBe('puddle')
  })
})

describe('classifyCrystallographerGrade', () => {
  it('returns master-crystallographer for >= 80', () => {
    expect(classifyCrystallographerGrade(85)).toBe('master-crystallographer')
  })

  it('returns expert-ice-artist for >= 65', () => {
    expect(classifyCrystallographerGrade(70)).toBe('expert-ice-artist')
  })

  it('returns skilled-frost-worker for >= 50', () => {
    expect(classifyCrystallographerGrade(55)).toBe('skilled-frost-worker')
  })

  it('returns apprentice for >= 35', () => {
    expect(classifyCrystallographerGrade(40)).toBe('apprentice')
  })

  it('returns novice for >= 20', () => {
    expect(classifyCrystallographerGrade(25)).toBe('novice')
  })

  it('returns slush-maker for < 20', () => {
    expect(classifyCrystallographerGrade(10)).toBe('slush-maker')
  })
})

describe('classifyGardenType', () => {
  it('returns melted for empty crystals', () => {
    expect(classifyGardenType([])).toBe('melted')
  })

  it('returns crystal-palace for high quality crystals', () => {
    const crystals = [analyzeFrostCrystal(RICH, 'a.ts')]
    expect(classifyGardenType(crystals)).toBe('crystal-palace')
  })
})

describe('classifyGardenCondition', () => {
  it('returns winter-wonderland for avgQs >= 75', () => {
    expect(classifyGardenCondition(80)).toBe('winter-wonderland')
  })

  it('returns mud for avgQs < 15', () => {
    expect(classifyGardenCondition(5)).toBe('mud')
  })
})

// ─── analyzeFrostGarden ────────────────────────────────────────────────────

describe('analyzeFrostGarden', () => {
  it('returns melted garden for empty crystals', () => {
    const garden = analyzeFrostGarden([], 'empty-dir')
    expect(garden.gardenType).toBe('melted')
    expect(garden.condition).toBe('mud')
    expect(garden.avgCrystalline).toBe(0)
    expect(garden.crystals).toHaveLength(0)
  })

  it('returns crystal-palace for RICH crystals', () => {
    const crystals = [analyzeFrostCrystal(RICH, 'a.ts')]
    const garden = analyzeFrostGarden(crystals, 'src')
    expect(garden.gardenType).toBe('crystal-palace')
    expect(garden.condition).toBe('winter-wonderland')
    expect(garden.avgCrystalline).toBe(98)
    expect(garden.frostMasterpieceCount).toBe(1)
  })
})

// ─── buildFrostFernResult ──────────────────────────────────────────────────

describe('buildFrostFernResult', () => {
  it('returns empty result for no files', () => {
    const result = buildFrostFernResult([], [])
    expect(result.tundra.avgCrystalline).toBe(0)
    expect(result.tundra.isCrystalline).toBe(false)
    expect(result.tundra.overallCrystallinity).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.crystallographerGrade).toBe('slush-maker')
    expect(result.crystals).toHaveLength(0)
    expect(result.gardens).toHaveLength(0)
  })

  it('returns correct RICH single file result', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    expect(result.tundra.avgCrystalline).toBe(98)
    expect(result.tundra.avgPreservation).toBe(100)
    expect(result.tundra.avgResilience).toBe(83)
    expect(result.tundra.isCrystalline).toBe(true)
    expect(result.tundra.overallCrystallinity).toBe(94)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalGardens).toBe(1)
    expect(result.stats.avgCrystallinePattern).toBe(98)
    expect(result.stats.avgFractalElegance).toBe(98)
    expect(result.stats.avgDelicateStructure).toBe(100)
    expect(result.stats.avgIcePreservation).toBe(100)
    expect(result.stats.avgWinterResilience).toBe(83)
    expect(result.stats.avgSnowflakeUniqueness).toBe(100)
    expect(result.stats.frostMasterpieceCount).toBe(1)
    expect(result.stats.puddleCount).toBe(0)
    expect(result.stats.hasHighStructureCount).toBe(1)
    expect(result.stats.hasHighEleganceCount).toBe(1)
    expect(result.stats.hasHighDesignCount).toBe(1)
    expect(result.stats.hasHighStabilityCount).toBe(1)
    expect(result.stats.hasHighColdStartCount).toBe(1)
    expect(result.stats.hasHighOriginalityCount).toBe(1)
    expect(result.stats.crystallographerGrade).toBe('master-crystallographer')
    expect(result.stats.bestCrystal).toBe('test.ts')
    expect(result.stats.mostStructured).toBe('test.ts')
    expect(result.stats.mostElegant).toBe('test.ts')
    expect(result.stats.mostDelicate).toBe('test.ts')
    expect(result.stats.mostStable).toBe('test.ts')
    expect(result.stats.mostOriginal).toBe('test.ts')
  })

  it('returns perfect recommendation for RICH single file', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    expect(result.recommendations).toContain('Your code is a frost masterpiece! Crystalline beauty in every line')
  })

  it('handles multiple files correctly', () => {
    const result = buildFrostFernResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.tundra.avgCrystalline).toBe(49)
    expect(result.tundra.avgPreservation).toBe(50)
    expect(result.tundra.isCrystalline).toBe(false)
    expect(result.tundra.overallCrystallinity).toBe(47)
    expect(result.stats.crystallographerGrade).toBe('apprentice')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildFrostFernResult(['poor.ts'], [POOR])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('recommends structure improvement when avgCrystallinePattern < 50', () => {
    const result = buildFrostFernResult(['poor.ts'], [POOR])
    const hasRec = result.recommendations.some((r) => r.includes('crystalline'))
    expect(hasRec).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 20', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('patternColor', () => {
  it('returns string for hexagonal-perfection', () => {
    expect(typeof patternColor('hexagonal-perfection')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(patternColor('unknown')).toBe('unknown')
  })
})

describe('beautyColor', () => {
  it('returns string for golden-ratio', () => {
    expect(typeof beautyColor('golden-ratio')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(beautyColor('unknown')).toBe('unknown')
  })
})

describe('finenessColor', () => {
  it('returns string for lacework', () => {
    expect(typeof finenessColor('lacework')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(finenessColor('unknown')).toBe('unknown')
  })
})

describe('preservationColor', () => {
  it('returns string for permafrost', () => {
    expect(typeof preservationColor('permafrost')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(preservationColor('unknown')).toBe('unknown')
  })
})

describe('toughnessColor', () => {
  it('returns string for arctic-survivor', () => {
    expect(typeof toughnessColor('arctic-survivor')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(toughnessColor('unknown')).toBe('unknown')
  })
})

describe('characterColor', () => {
  it('returns string for unique-snowflake', () => {
    expect(typeof characterColor('unique-snowflake')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(characterColor('unknown')).toBe('unknown')
  })
})

describe('conditionColor', () => {
  it('returns string for frost-masterpiece', () => {
    expect(typeof conditionColor('frost-masterpiece')).toBe('string')
  })

  it('returns string for puddle', () => {
    expect(typeof conditionColor('puddle')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('gradeColor', () => {
  it('returns string for master-crystallographer', () => {
    expect(typeof gradeColor('master-crystallographer')).toBe('string')
  })

  it('returns string for slush-maker', () => {
    expect(typeof gradeColor('slush-maker')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(gradeColor('unknown')).toBe('unknown')
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatFrostFernJson', () => {
  it('returns valid JSON string', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const json = formatFrostFernJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.tundra.overallCrystallinity).toBe(94)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatFrostFernTable', () => {
  it('returns formatted string with Frost Fern header', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, false)
    expect(table).toContain('Frost Fern Analysis')
    expect(table).toContain('Tundra:')
    expect(table).toContain('Statistics:')
  })

  it('includes per-file details when verbose=true', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, true)
    expect(table).toContain('Per-File Crystals:')
    expect(table).toContain('test.ts')
  })

  it('excludes per-file details when verbose=false', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, false)
    expect(table).not.toContain('Per-File Crystals:')
  })

  it('includes recommendations', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, false)
    expect(table).toContain('Recommendations:')
  })

  it('includes condition counts', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, false)
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Frost Masterpiece:')
  })

  it('includes highlights for non-empty result', () => {
    const result = buildFrostFernResult(['test.ts'], [RICH])
    const table = formatFrostFernTable(result, false)
    expect(table).toContain('Highlights:')
    expect(table).toContain('Best Crystal:')
    expect(table).toContain('Most Structured:')
  })
})
