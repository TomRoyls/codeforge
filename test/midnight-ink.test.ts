import { describe, it, expect } from 'vitest'
import {
  measureDeep,
  measureClear,
  measureScriptorium,
  measurePreserved,
  measureIlluminated,
  measureScholarly,
  analyzeInkStroke,
  classifyCondition,
  classifyCollectionType,
  classifyCollectionCondition,
  classifyScribeGrade,
  analyzeManuscriptCollection,
  generateRecommendations,
  buildMidnightInkResult,
} from '../src/commands/midnight-ink-helpers.js'
import {
  scoreColor,
  penetrationColor,
  visionColor,
  environmentColor,
  archiveColor,
  artistryColor,
  skillColor,
  conditionColor,
  scribeGradeColor,
  formatMidnightInkJson,
  formatMidnightInkTable,
} from '../src/commands/midnight-ink-format-helpers.js'

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

// ─── measureDeep ───────────────────────────────────────────────────────────

describe('measureDeep', () => {
  it('returns complexityHandling=98 for RICH fixture', () => {
    expect(measureDeep(RICH).complexityHandling).toBe(98)
  })

  it('returns abyssal-depth penetration for RICH fixture', () => {
    expect(measureDeep(RICH).penetration).toBe('abyssal-depth')
  })

  it('returns hasHighComplexityHandling=true for RICH fixture', () => {
    expect(measureDeep(RICH).hasHighComplexityHandling).toBe(true)
  })

  it('returns hasDeep=true for RICH fixture', () => {
    expect(measureDeep(RICH).hasDeep).toBe(true)
  })

  it('returns hasThorough=true for RICH fixture', () => {
    expect(measureDeep(RICH).hasThorough).toBe(true)
  })

  it('returns hasNoShallowness=true for RICH fixture', () => {
    expect(measureDeep(RICH).hasNoShallowness).toBe(true)
  })

  it('returns hasProfound=true for RICH fixture', () => {
    expect(measureDeep(RICH).hasProfound).toBe(true)
  })

  it('returns hasLayered=false for RICH fixture', () => {
    expect(measureDeep(RICH).hasLayered).toBe(false)
  })

  it('returns complexityHandling=0 for EMPTY fixture', () => {
    expect(measureDeep(EMPTY).complexityHandling).toBe(0)
  })

  it('returns puddle for EMPTY fixture', () => {
    expect(measureDeep(EMPTY).penetration).toBe('puddle')
  })

  it('returns complexityHandling=10 for MINIMAL fixture', () => {
    expect(measureDeep(MINIMAL).complexityHandling).toBe(10)
  })

  it('returns shallownessCount=2 for POOR fixture', () => {
    expect(measureDeep(POOR).shallownessCount).toBe(2)
  })

  it('returns flatnessCount=1 for POOR fixture', () => {
    expect(measureDeep(POOR).flatnessCount).toBe(1)
  })

  it('returns hasNoShallowness=false for POOR fixture', () => {
    expect(measureDeep(POOR).hasNoShallowness).toBe(false)
  })
})

// ─── measureClear ──────────────────────────────────────────────────────────

describe('measureClear', () => {
  it('returns darkReadability=98 for RICH fixture', () => {
    expect(measureClear(RICH).darkReadability).toBe(98)
  })

  it('returns night-vision for RICH fixture', () => {
    expect(measureClear(RICH).vision).toBe('night-vision')
  })

  it('returns hasHighDarkReadability=true for RICH fixture', () => {
    expect(measureClear(RICH).hasHighDarkReadability).toBe(true)
  })

  it('returns hasNavigable=true for RICH fixture', () => {
    expect(measureClear(RICH).hasNavigable).toBe(true)
  })

  it('returns hasInsightful=false for RICH fixture', () => {
    expect(measureClear(RICH).hasInsightful).toBe(false)
  })

  it('returns darkReadability=0 for EMPTY fixture', () => {
    expect(measureClear(EMPTY).darkReadability).toBe(0)
  })

  it('returns blind for EMPTY fixture', () => {
    expect(measureClear(EMPTY).vision).toBe('blind')
  })

  it('returns darkReadability=8 for MINIMAL fixture', () => {
    expect(measureClear(MINIMAL).darkReadability).toBe(8)
  })

  it('returns obfuscationCount=2 for POOR fixture', () => {
    expect(measureClear(POOR).obfuscationCount).toBe(2)
  })

  it('returns impenetrableCount=1 for POOR fixture', () => {
    expect(measureClear(POOR).impenetrableCount).toBe(1)
  })
})

// ─── measureScriptorium ────────────────────────────────────────────────────

describe('measureScriptorium', () => {
  it('returns workspaceQuality=100 for RICH fixture', () => {
    expect(measureScriptorium(RICH).workspaceQuality).toBe(100)
  })

  it('returns grand-scriptorium for RICH fixture', () => {
    expect(measureScriptorium(RICH).environment).toBe('grand-scriptorium')
  })

  it('returns hasHighWorkspaceQuality=true for RICH fixture', () => {
    expect(measureScriptorium(RICH).hasHighWorkspaceQuality).toBe(true)
  })

  it('returns hasSystematic=false for RICH fixture', () => {
    expect(measureScriptorium(RICH).hasSystematic).toBe(false)
  })

  it('returns workspaceQuality=0 for EMPTY fixture', () => {
    expect(measureScriptorium(EMPTY).workspaceQuality).toBe(0)
  })

  it('returns dungeon for EMPTY fixture', () => {
    expect(measureScriptorium(EMPTY).environment).toBe('dungeon')
  })

  it('returns workspaceQuality=8 for MINIMAL fixture', () => {
    expect(measureScriptorium(MINIMAL).workspaceQuality).toBe(8)
  })

  it('returns messinessCount=2 for POOR fixture', () => {
    expect(measureScriptorium(POOR).messinessCount).toBe(2)
  })

  it('returns chaosCount=1 for POOR fixture', () => {
    expect(measureScriptorium(POOR).chaosCount).toBe(1)
  })
})

// ─── measurePreserved ──────────────────────────────────────────────────────

describe('measurePreserved', () => {
  it('returns documentation=100 for RICH fixture', () => {
    expect(measurePreserved(RICH).documentation).toBe(100)
  })

  it('returns vellum-manuscript for RICH fixture', () => {
    expect(measurePreserved(RICH).archive).toBe('vellum-manuscript')
  })

  it('returns hasHighDocumentation=true for RICH fixture', () => {
    expect(measurePreserved(RICH).hasHighDocumentation).toBe(true)
  })

  it('returns hasExplained=true for RICH fixture', () => {
    expect(measurePreserved(RICH).hasExplained).toBe(true)
  })

  it('returns documentation=0 for EMPTY fixture', () => {
    expect(measurePreserved(EMPTY).documentation).toBe(0)
  })

  it('returns dust for EMPTY fixture', () => {
    expect(measurePreserved(EMPTY).archive).toBe('dust')
  })

  it('returns undocumentedCount=2 for POOR fixture', () => {
    expect(measurePreserved(POOR).undocumentedCount).toBe(2)
  })

  it('returns silentCount=1 for POOR fixture', () => {
    expect(measurePreserved(POOR).silentCount).toBe(1)
  })
})

// ─── measureIlluminated ────────────────────────────────────────────────────

describe('measureIlluminated', () => {
  it('returns highlighting=100 for RICH fixture', () => {
    expect(measureIlluminated(RICH).highlighting).toBe(100)
  })

  it('returns gold-illuminated for RICH fixture', () => {
    expect(measureIlluminated(RICH).artistry).toBe('gold-illuminated')
  })

  it('returns hasHighHighlighting=true for RICH fixture', () => {
    expect(measureIlluminated(RICH).hasHighHighlighting).toBe(true)
  })

  it('returns hasSectioned=true for RICH fixture', () => {
    expect(measureIlluminated(RICH).hasSectioned).toBe(true)
  })

  it('returns highlighting=0 for EMPTY fixture', () => {
    expect(measureIlluminated(EMPTY).highlighting).toBe(0)
  })

  it('returns invisible for EMPTY fixture', () => {
    expect(measureIlluminated(EMPTY).artistry).toBe('invisible')
  })

  it('returns flatTextCount=2 for POOR fixture', () => {
    expect(measureIlluminated(POOR).flatTextCount).toBe(2)
  })

  it('returns wallCount=1 for POOR fixture', () => {
    expect(measureIlluminated(POOR).wallCount).toBe(1)
  })
})

// ─── measureScholarly ──────────────────────────────────────────────────────

describe('measureScholarly', () => {
  it('returns craftsmanship=100 for RICH fixture', () => {
    expect(measureScholarly(RICH).craftsmanship).toBe(100)
  })

  it('returns master-scribe for RICH fixture', () => {
    expect(measureScholarly(RICH).skill).toBe('master-scribe')
  })

  it('returns hasHighCraftsmanship=true for RICH fixture', () => {
    expect(measureScholarly(RICH).hasHighCraftsmanship).toBe(true)
  })

  it('returns hasMasterful=true for RICH fixture', () => {
    expect(measureScholarly(RICH).hasMasterful).toBe(true)
  })

  it('returns hasNoSloppiness=true for RICH fixture', () => {
    expect(measureScholarly(RICH).hasNoSloppiness).toBe(true)
  })

  it('returns hasNoRoughness=true for RICH fixture', () => {
    expect(measureScholarly(RICH).hasNoRoughness).toBe(true)
  })

  it('returns craftsmanship=0 for EMPTY fixture', () => {
    expect(measureScholarly(EMPTY).craftsmanship).toBe(0)
  })

  it('returns finger-painting for EMPTY fixture', () => {
    expect(measureScholarly(EMPTY).skill).toBe('finger-painting')
  })

  it('returns sloppinessCount=2 for POOR fixture', () => {
    expect(measureScholarly(POOR).sloppinessCount).toBe(2)
  })

  it('returns roughnessCount=1 for POOR fixture', () => {
    expect(measureScholarly(POOR).roughnessCount).toBe(1)
  })

  it('returns hasNoSloppiness=false for POOR fixture', () => {
    expect(measureScholarly(POOR).hasNoSloppiness).toBe(false)
  })

  it('returns hasNoCrudeness=false for POOR fixture', () => {
    expect(measureScholarly(POOR).hasNoCrudeness).toBe(false)
  })
})

// ─── analyzeInkStroke ──────────────────────────────────────────────────────

describe('analyzeInkStroke', () => {
  it('returns qualityScore=99 for RICH fixture', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').qualityScore).toBe(99)
  })

  it('returns masterpiece-manuscript condition for RICH fixture', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').condition).toBe('masterpiece-manuscript')
  })

  it('returns qualityScore=0 for EMPTY fixture', () => {
    expect(analyzeInkStroke(EMPTY, 'empty.ts').qualityScore).toBe(0)
  })

  it('returns dust for EMPTY fixture', () => {
    expect(analyzeInkStroke(EMPTY, 'empty.ts').condition).toBe('dust')
  })

  it('returns qualityScore=9 for MINIMAL fixture', () => {
    expect(analyzeInkStroke(MINIMAL, 'minimal.ts').qualityScore).toBe(9)
  })

  it('returns qualityScore=0 for POOR fixture', () => {
    expect(analyzeInkStroke(POOR, 'poor.ts').qualityScore).toBe(0)
  })

  it('sets file path correctly', () => {
    expect(analyzeInkStroke(RICH, 'my/file.ts').file).toBe('my/file.ts')
  })

  it('carries depth from measureDeep', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').depth).toBe(98)
  })

  it('carries darkClarity from measureClear', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').darkClarity).toBe(98)
  })

  it('carries scriptoriumQuality from measureScriptorium', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').scriptoriumQuality).toBe(100)
  })

  it('carries manuscriptPreservation from measurePreserved', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').manuscriptPreservation).toBe(100)
  })

  it('carries illuminatedText from measureIlluminated', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').illuminatedText).toBe(100)
  })

  it('carries scholarlyCraft from measureScholarly', () => {
    expect(analyzeInkStroke(RICH, 'test.ts').scholarlyCraft).toBe(100)
  })
})

// ─── Classification Functions ──────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns masterpiece-manuscript for score >= 85', () => {
    expect(classifyCondition(90)).toBe('masterpiece-manuscript')
  })

  it('returns fine-codex for score >= 70', () => {
    expect(classifyCondition(75)).toBe('fine-codex')
  })

  it('returns proper-scroll for score >= 55', () => {
    expect(classifyCondition(60)).toBe('proper-scroll')
  })

  it('returns faded-text for score >= 40', () => {
    expect(classifyCondition(45)).toBe('faded-text')
  })

  it('returns crumbling-parchment for score >= 25', () => {
    expect(classifyCondition(30)).toBe('crumbling-parchment')
  })

  it('returns dust for score < 25', () => {
    expect(classifyCondition(10)).toBe('dust')
  })
})

describe('classifyScribeGrade', () => {
  it('returns arch-scribe for >= 80', () => {
    expect(classifyScribeGrade(85)).toBe('arch-scribe')
  })

  it('returns master-illuminator for >= 65', () => {
    expect(classifyScribeGrade(70)).toBe('master-illuminator')
  })

  it('returns skilled-scribe for >= 50', () => {
    expect(classifyScribeGrade(55)).toBe('skilled-scribe')
  })

  it('returns apprentice-copier for >= 35', () => {
    expect(classifyScribeGrade(40)).toBe('apprentice-copier')
  })

  it('returns novice for >= 20', () => {
    expect(classifyScribeGrade(25)).toBe('novice')
  })

  it('returns illiterate for < 20', () => {
    expect(classifyScribeGrade(10)).toBe('illiterate')
  })
})

describe('classifyCollectionType', () => {
  it('returns empty-room for empty strokes', () => {
    expect(classifyCollectionType([])).toBe('empty-room')
  })

  it('returns great-library for high quality strokes', () => {
    const strokes = [analyzeInkStroke(RICH, 'a.ts')]
    expect(classifyCollectionType(strokes)).toBe('great-library')
  })
})

describe('classifyCollectionCondition', () => {
  it('returns treasured-archive for avgQs >= 75', () => {
    expect(classifyCollectionCondition(80)).toBe('treasured-archive')
  })

  it('returns valuable-collection for avgQs >= 60', () => {
    expect(classifyCollectionCondition(65)).toBe('valuable-collection')
  })

  it('returns decent-library for avgQs >= 45', () => {
    expect(classifyCollectionCondition(50)).toBe('decent-library')
  })

  it('returns fading-shelves for avgQs >= 30', () => {
    expect(classifyCollectionCondition(35)).toBe('fading-shelves')
  })

  it('returns dusty-corner for avgQs >= 15', () => {
    expect(classifyCollectionCondition(20)).toBe('dusty-corner')
  })

  it('returns lost-knowledge for avgQs < 15', () => {
    expect(classifyCollectionCondition(5)).toBe('lost-knowledge')
  })
})

// ─── analyzeManuscriptCollection ───────────────────────────────────────────

describe('analyzeManuscriptCollection', () => {
  it('returns empty-room for empty strokes', () => {
    const collection = analyzeManuscriptCollection([], 'empty-dir')
    expect(collection.collectionType).toBe('empty-room')
    expect(collection.condition).toBe('lost-knowledge')
    expect(collection.avgDepth).toBe(0)
    expect(collection.strokes).toHaveLength(0)
  })

  it('returns great-library for RICH strokes', () => {
    const strokes = [analyzeInkStroke(RICH, 'a.ts')]
    const collection = analyzeManuscriptCollection(strokes, 'src')
    expect(collection.collectionType).toBe('great-library')
    expect(collection.condition).toBe('treasured-archive')
    expect(collection.avgDepth).toBe(98)
    expect(collection.masterpieceCount).toBe(1)
  })
})

// ─── buildMidnightInkResult ────────────────────────────────────────────────

describe('buildMidnightInkResult', () => {
  it('returns empty result for no files', () => {
    const result = buildMidnightInkResult([], [])
    expect(result.library.avgDepth).toBe(0)
    expect(result.library.isMasterful).toBe(false)
    expect(result.library.overallScholarship).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.scribeGrade).toBe('illiterate')
    expect(result.strokes).toHaveLength(0)
    expect(result.collections).toHaveLength(0)
  })

  it('returns correct RICH single file result', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    expect(result.library.avgDepth).toBe(98)
    expect(result.library.avgPreservation).toBe(100)
    expect(result.library.avgCraftsmanship).toBe(100)
    expect(result.library.isMasterful).toBe(true)
    expect(result.library.overallScholarship).toBe(99)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalCollections).toBe(1)
    expect(result.stats.avgDepth).toBe(98)
    expect(result.stats.avgDarkClarity).toBe(98)
    expect(result.stats.avgScriptoriumQuality).toBe(100)
    expect(result.stats.avgManuscriptPreservation).toBe(100)
    expect(result.stats.avgIlluminatedText).toBe(100)
    expect(result.stats.avgScholarlyCraft).toBe(100)
    expect(result.stats.masterpieceManuscriptCount).toBe(1)
    expect(result.stats.dustCount).toBe(0)
    expect(result.stats.hasHighComplexityHandlingCount).toBe(1)
    expect(result.stats.hasHighDarkReadabilityCount).toBe(1)
    expect(result.stats.hasHighWorkspaceQualityCount).toBe(1)
    expect(result.stats.hasHighDocumentationCount).toBe(1)
    expect(result.stats.hasHighHighlightingCount).toBe(1)
    expect(result.stats.hasHighCraftsmanshipCount).toBe(1)
    expect(result.stats.scribeGrade).toBe('arch-scribe')
    expect(result.stats.bestStroke).toBe('test.ts')
    expect(result.stats.deepest).toBe('test.ts')
    expect(result.stats.clearest).toBe('test.ts')
    expect(result.stats.bestWorkspace).toBe('test.ts')
    expect(result.stats.bestDocumented).toBe('test.ts')
    expect(result.stats.bestStructured).toBe('test.ts')
  })

  it('returns perfect recommendation for RICH single file', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    expect(result.recommendations).toContain('Your code is a masterfully illuminated manuscript! Scholarly craft at its finest')
  })

  it('handles multiple files correctly', () => {
    const result = buildMidnightInkResult(['a.ts', 'b.ts'], [RICH, EMPTY])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.library.avgDepth).toBe(49)
    expect(result.library.avgPreservation).toBe(50)
    expect(result.library.avgCraftsmanship).toBe(50)
    expect(result.library.isMasterful).toBe(false)
    expect(result.library.overallScholarship).toBe(50)
    expect(result.stats.scribeGrade).toBe('skilled-scribe')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low scores', () => {
    const result = buildMidnightInkResult(['poor.ts'], [POOR])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('recommends depth improvement when avgDepth < 50', () => {
    const result = buildMidnightInkResult(['poor.ts'], [POOR])
    const hasDepthRec = result.recommendations.some((r) => r.includes('Deepen'))
    expect(hasDepthRec).toBe(true)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 50', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns string for score 20', () => {
    expect(typeof scoreColor(20)).toBe('string')
  })
})

describe('penetrationColor', () => {
  it('returns string for abyssal-depth', () => {
    expect(typeof penetrationColor('abyssal-depth')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(penetrationColor('unknown')).toBe('unknown')
  })
})

describe('visionColor', () => {
  it('returns string for night-vision', () => {
    expect(typeof visionColor('night-vision')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(visionColor('unknown')).toBe('unknown')
  })
})

describe('environmentColor', () => {
  it('returns string for grand-scriptorium', () => {
    expect(typeof environmentColor('grand-scriptorium')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(environmentColor('unknown')).toBe('unknown')
  })
})

describe('archiveColor', () => {
  it('returns string for vellum-manuscript', () => {
    expect(typeof archiveColor('vellum-manuscript')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(archiveColor('unknown')).toBe('unknown')
  })
})

describe('artistryColor', () => {
  it('returns string for gold-illuminated', () => {
    expect(typeof artistryColor('gold-illuminated')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(artistryColor('unknown')).toBe('unknown')
  })
})

describe('skillColor', () => {
  it('returns string for master-scribe', () => {
    expect(typeof skillColor('master-scribe')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(skillColor('unknown')).toBe('unknown')
  })
})

describe('conditionColor', () => {
  it('returns string for masterpiece-manuscript', () => {
    expect(typeof conditionColor('masterpiece-manuscript')).toBe('string')
  })

  it('returns string for dust', () => {
    expect(typeof conditionColor('dust')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })
})

describe('scribeGradeColor', () => {
  it('returns string for arch-scribe', () => {
    expect(typeof scribeGradeColor('arch-scribe')).toBe('string')
  })

  it('returns string for illiterate', () => {
    expect(typeof scribeGradeColor('illiterate')).toBe('string')
  })

  it('returns input for unknown', () => {
    expect(scribeGradeColor('unknown')).toBe('unknown')
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatMidnightInkJson', () => {
  it('returns valid JSON string', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const json = formatMidnightInkJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.strokes).toHaveLength(1)
    expect(parsed.library.overallScholarship).toBe(99)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatMidnightInkTable', () => {
  it('returns formatted string with Midnight Ink header', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, false)
    expect(table).toContain('Midnight Ink Analysis')
    expect(table).toContain('Library:')
    expect(table).toContain('Statistics:')
  })

  it('includes per-file details when verbose=true', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, true)
    expect(table).toContain('Per-File Strokes:')
    expect(table).toContain('test.ts')
  })

  it('excludes per-file details when verbose=false', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, false)
    expect(table).not.toContain('Per-File Strokes:')
  })

  it('includes recommendations', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, false)
    expect(table).toContain('Recommendations:')
  })

  it('includes condition counts', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, false)
    expect(table).toContain('Condition Counts:')
    expect(table).toContain('Masterpiece Manuscript:')
  })

  it('includes highlights for non-empty result', () => {
    const result = buildMidnightInkResult(['test.ts'], [RICH])
    const table = formatMidnightInkTable(result, false)
    expect(table).toContain('Highlights:')
    expect(table).toContain('Best Stroke:')
    expect(table).toContain('Deepest:')
  })
})
