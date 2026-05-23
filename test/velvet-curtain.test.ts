import { describe, it, expect } from 'vitest'
import {
  measurePrivate,
  measureEnvelope,
  measureElegant,
  measureBackstage,
  measurePublic,
  measureTheatrical,
  analyzeCurtainFold,
  classifyCondition,
  classifyRowType,
  classifyRowCondition,
  classifyDirectorGrade,
  analyzeCurtainRow,
  generateRecommendations,
  buildVelvetCurtainResult,
} from '../src/commands/velvet-curtain-helpers.js'
import {
  scoreColor,
  privacyGradeColor,
  envelopeQualityColor,
  drapeColor,
  accessColor,
  callColor,
  theatricalQualityColor,
  conditionColor,
  directorGradeColor,
  formatVelvetCurtainJson,
  formatVelvetCurtainTable,
} from '../src/commands/velvet-curtain-format-helpers.js'

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

// ─── measurePrivate ────────────────────────────────────────────────────────

describe('measurePrivate', () => {
  it('returns encapsulation=98 for RICH fixture', () => {
    expect(measurePrivate(RICH).encapsulation).toBe(98)
  })

  it('returns vault-sealed grade for RICH fixture', () => {
    expect(measurePrivate(RICH).grade).toBe('vault-sealed')
  })

  it('returns hasHighEncapsulation=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasHighEncapsulation).toBe(true)
  })

  it('returns hasEncapsulated=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasEncapsulated).toBe(true)
  })

  it('returns hasHiddenImpl=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasHiddenImpl).toBe(true)
  })

  it('returns hasProperVisibility=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasProperVisibility).toBe(true)
  })

  it('returns hasSealed=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasSealed).toBe(true)
  })

  it('returns hasNoLeaking=true for RICH fixture', () => {
    expect(measurePrivate(RICH).hasNoLeaking).toBe(true)
  })

  it('returns encapsulation=0 for empty content', () => {
    expect(measurePrivate(EMPTY).encapsulation).toBe(0)
  })

  it('returns naked grade for empty content', () => {
    expect(measurePrivate(EMPTY).grade).toBe('naked')
  })

  it('detects var as leaking', () => {
    expect(measurePrivate(POOR).leakingCount).toBe(2)
  })

  it('detects any as exposure', () => {
    expect(measurePrivate(POOR).exposureCount).toBe(1)
  })

  it('returns hasNoLeaking=false when var is present', () => {
    expect(measurePrivate(POOR).hasNoLeaking).toBe(false)
  })
})

// ─── measureEnvelope ───────────────────────────────────────────────────────

describe('measureEnvelope', () => {
  it('returns boundary=85 for RICH fixture', () => {
    expect(measureEnvelope(RICH).boundary).toBe(85)
  })

  it('returns perfect-envelope quality for RICH fixture', () => {
    expect(measureEnvelope(RICH).quality).toBe('perfect-envelope')
  })

  it('returns hasHighBoundary=true for RICH fixture', () => {
    expect(measureEnvelope(RICH).hasHighBoundary).toBe(true)
  })

  it('returns hasClearBorders=true for RICH fixture', () => {
    expect(measureEnvelope(RICH).hasClearBorders).toBe(true)
  })

  it('returns hasSharp=true for RICH fixture', () => {
    expect(measureEnvelope(RICH).hasSharp).toBe(true)
  })

  it('returns boundary=0 for empty content', () => {
    expect(measureEnvelope(EMPTY).boundary).toBe(0)
  })

  it('detects var as leaking', () => {
    expect(measureEnvelope(POOR).leakingCount).toBe(2)
  })

  it('detects any as blurring', () => {
    expect(measureEnvelope(POOR).blurringCount).toBe(1)
  })
})

// ─── measureElegant ────────────────────────────────────────────────────────

describe('measureElegant', () => {
  it('returns beauty=100 for RICH fixture', () => {
    expect(measureElegant(RICH).beauty).toBe(100)
  })

  it('returns regal-drape drape for RICH fixture', () => {
    expect(measureElegant(RICH).drape).toBe('regal-drape')
  })

  it('returns hasHighBeauty=true for RICH fixture', () => {
    expect(measureElegant(RICH).hasHighBeauty).toBe(true)
  })

  it('returns hasBeautiful=true for RICH fixture', () => {
    expect(measureElegant(RICH).hasBeautiful).toBe(true)
  })

  it('returns hasGraceful=true for RICH fixture', () => {
    expect(measureElegant(RICH).hasGraceful).toBe(true)
  })

  it('returns hasPolished=true for RICH fixture', () => {
    expect(measureElegant(RICH).hasPolished).toBe(true)
  })

  it('returns beauty=0 for empty content', () => {
    expect(measureElegant(EMPTY).beauty).toBe(0)
  })

  it('returns tattered drape for empty content', () => {
    expect(measureElegant(EMPTY).drape).toBe('tattered')
  })

  it('detects var as ugliness', () => {
    expect(measureElegant(POOR).uglinessCount).toBe(2)
  })
})

// ─── measureBackstage ──────────────────────────────────────────────────────

describe('measureBackstage', () => {
  it('returns documentation=85 for RICH fixture', () => {
    expect(measureBackstage(RICH).documentation).toBe(85)
  })

  it('returns full-program access for RICH fixture', () => {
    expect(measureBackstage(RICH).access).toBe('full-program')
  })

  it('returns hasHighDocumentation=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasHighDocumentation).toBe(true)
  })

  it('returns hasDocumented=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasDocumented).toBe(true)
  })

  it('returns hasExplained=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasExplained).toBe(true)
  })

  it('returns hasGuided=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasGuided).toBe(true)
  })

  it('returns hasNoMystery=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasNoMystery).toBe(true)
  })

  it('returns hasNoUndocumented=true for RICH fixture', () => {
    expect(measureBackstage(RICH).hasNoUndocumented).toBe(true)
  })

  it('returns documentation=0 for empty content', () => {
    expect(measureBackstage(EMPTY).documentation).toBe(0)
  })

  it('detects var as mystery', () => {
    expect(measureBackstage(POOR).mysteryCount).toBe(2)
  })

  it('detects any as undocumented', () => {
    expect(measureBackstage(POOR).undocumentedCount).toBe(1)
  })
})

// ─── measurePublic ─────────────────────────────────────────────────────────

describe('measurePublic', () => {
  it('returns api=100 for RICH fixture', () => {
    expect(measurePublic(RICH).api).toBe(100)
  })

  it('returns standing-ovation call for RICH fixture', () => {
    expect(measurePublic(RICH).call).toBe('standing-ovation')
  })

  it('returns hasHighApi=true for RICH fixture', () => {
    expect(measurePublic(RICH).hasHighApi).toBe(true)
  })

  it('returns hasCleanAPI=true for RICH fixture', () => {
    expect(measurePublic(RICH).hasCleanAPI).toBe(true)
  })

  it('returns hasSimple=true for RICH fixture', () => {
    expect(measurePublic(RICH).hasSimple).toBe(true)
  })

  it('returns hasIntuitive=true for RICH fixture', () => {
    expect(measurePublic(RICH).hasIntuitive).toBe(true)
  })

  it('returns hasConsistent=true for RICH fixture', () => {
    expect(measurePublic(RICH).hasConsistent).toBe(true)
  })

  it('returns api=0 for empty content', () => {
    expect(measurePublic(EMPTY).api).toBe(0)
  })

  it('detects var as complexity', () => {
    expect(measurePublic(POOR).complexityCount).toBe(2)
  })
})

// ─── measureTheatrical ─────────────────────────────────────────────────────

describe('measureTheatrical', () => {
  it('returns presentation=100 for RICH fixture', () => {
    expect(measureTheatrical(RICH).presentation).toBe(100)
  })

  it('returns masterpiece-theater quality for RICH fixture', () => {
    expect(measureTheatrical(RICH).quality).toBe('masterpiece-theater')
  })

  it('returns hasHighPresentation=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasHighPresentation).toBe(true)
  })

  it('returns hasOrganized=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasOrganized).toBe(true)
  })

  it('returns hasClearFlow=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasClearFlow).toBe(true)
  })

  it('returns hasPolished=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasPolished).toBe(true)
  })

  it('returns hasNoChaos=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasNoChaos).toBe(true)
  })

  it('returns hasNoDisorder=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasNoDisorder).toBe(true)
  })

  it('returns hasNoMessiness=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasNoMessiness).toBe(true)
  })

  it('returns hasNoSloppiness=true for RICH fixture', () => {
    expect(measureTheatrical(RICH).hasNoSloppiness).toBe(true)
  })

  it('returns presentation=0 for empty content', () => {
    expect(measureTheatrical(EMPTY).presentation).toBe(0)
  })

  it('detects var as chaos', () => {
    expect(measureTheatrical(POOR).chaosCount).toBe(2)
  })

  it('detects any as disorder', () => {
    expect(measureTheatrical(POOR).disorderCount).toBe(1)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns velvet-masterpiece for score >= 85', () => {
    expect(classifyCondition(90)).toBe('velvet-masterpiece')
  })

  it('returns fine-curtain for score >= 70', () => {
    expect(classifyCondition(75)).toBe('fine-curtain')
  })

  it('returns proper-drape for score >= 55', () => {
    expect(classifyCondition(60)).toBe('proper-drape')
  })

  it('returns worn-fabric for score >= 40', () => {
    expect(classifyCondition(45)).toBe('worn-fabric')
  })

  it('returns tattered-curtain for score >= 25', () => {
    expect(classifyCondition(30)).toBe('tattered-curtain')
  })

  it('returns no-curtain for score < 25', () => {
    expect(classifyCondition(10)).toBe('no-curtain')
  })
})

// ─── classifyRowType ───────────────────────────────────────────────────────

describe('classifyRowType', () => {
  it('returns empty-stage for empty folds', () => {
    expect(classifyRowType([])).toBe('empty-stage')
  })

  it('returns grand-theater for high-quality all-masterpiece folds', () => {
    const folds = Array.from({ length: 2 }, (_, i) => analyzeCurtainFold(RICH, `f${i}.ts`))
    expect(classifyRowType(folds)).toBe('grand-theater')
  })

  it('returns empty-stage for very low quality folds', () => {
    const folds = [analyzeCurtainFold(MINIMAL, 'a.ts')]
    expect(classifyRowType(folds)).toBe('empty-stage')
  })
})

// ─── classifyRowCondition ──────────────────────────────────────────────────

describe('classifyRowCondition', () => {
  it('returns broadway-quality for avgQs >= 75', () => {
    expect(classifyRowCondition(80)).toBe('broadway-quality')
  })

  it('returns dark-stage for avgQs < 15', () => {
    expect(classifyRowCondition(5)).toBe('dark-stage')
  })
})

// ─── classifyDirectorGrade ─────────────────────────────────────────────────

describe('classifyDirectorGrade', () => {
  it('returns master-director for elegance >= 80', () => {
    expect(classifyDirectorGrade(85)).toBe('master-director')
  })

  it('returns audience-member for elegance < 20', () => {
    expect(classifyDirectorGrade(10)).toBe('audience-member')
  })
})

// ─── analyzeCurtainFold ────────────────────────────────────────────────────

describe('analyzeCurtainFold', () => {
  it('returns qualityScore=95 for RICH fixture', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').qualityScore).toBe(95)
  })

  it('returns velvet-masterpiece condition for RICH fixture', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').condition).toBe('velvet-masterpiece')
  })

  it('returns qualityScore=0 for empty content', () => {
    expect(analyzeCurtainFold(EMPTY, 'empty.ts').qualityScore).toBe(0)
  })

  it('returns no-curtain condition for empty content', () => {
    expect(analyzeCurtainFold(EMPTY, 'empty.ts').condition).toBe('no-curtain')
  })

  it('returns qualityScore=10 for MINIMAL fixture', () => {
    expect(analyzeCurtainFold(MINIMAL, 'minimal.ts').qualityScore).toBe(10)
  })

  it('returns qualityScore=4 for POOR fixture', () => {
    expect(analyzeCurtainFold(POOR, 'poor.ts').qualityScore).toBe(4)
  })

  it('stores file path correctly', () => {
    expect(analyzeCurtainFold(RICH, 'my/file.ts').file).toBe('my/file.ts')
  })

  it('maps privacy from measurePrivate', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').privacy).toBe(98)
  })

  it('maps envelopeQuality from measureEnvelope', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').envelopeQuality).toBe(85)
  })

  it('maps drapeElegance from measureElegant', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').drapeElegance).toBe(100)
  })

  it('maps backstageAccess from measureBackstage', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').backstageAccess).toBe(85)
  })

  it('maps curtainCall from measurePublic', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').curtainCall).toBe(100)
  })

  it('maps theatricalQuality from measureTheatrical', () => {
    expect(analyzeCurtainFold(RICH, 'rich.ts').theatricalQuality).toBe(100)
  })
})

// ─── analyzeCurtainRow ─────────────────────────────────────────────────────

describe('analyzeCurtainRow', () => {
  it('returns empty row for no folds', () => {
    const row = analyzeCurtainRow([], 'empty-dir')
    expect(row.folds).toEqual([])
    expect(row.avgPrivacy).toBe(0)
    expect(row.rowType).toBe('empty-stage')
    expect(row.condition).toBe('dark-stage')
  })

  it('computes averages from folds', () => {
    const folds = [analyzeCurtainFold(RICH, 'a.ts'), analyzeCurtainFold(MINIMAL, 'b.ts')]
    const row = analyzeCurtainRow(folds, 'src')
    expect(row.avgPrivacy).toBe(Math.round((98 + 8) / 2))
    expect(row.directory).toBe('src')
  })

  it('counts condition types', () => {
    const folds = [analyzeCurtainFold(RICH, 'a.ts'), analyzeCurtainFold(EMPTY, 'b.ts')]
    const row = analyzeCurtainRow(folds, 'src')
    expect(row.velvetMasterpieceCount).toBe(1)
    expect(row.noCurtainCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece message for high-quality code', () => {
    const result = buildVelvetCurtainResult(['a.ts'], [RICH])
    expect(result.recommendations).toEqual([
      'Your code is a velvet masterpiece! The curtain rises to reveal elegant perfection',
    ])
  })

  it('generates recommendations for low-scoring code', () => {
    const result = buildVelvetCurtainResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('recommends privacy improvement when avgPrivacy < 50', () => {
    const result = buildVelvetCurtainResult(['a.ts', 'b.ts', 'c.ts'], [RICH, MINIMAL, POOR])
    expect(result.recommendations.some((r) => r.includes('privacy'))).toBe(true)
  })
})

// ─── buildVelvetCurtainResult ──────────────────────────────────────────────

describe('buildVelvetCurtainResult', () => {
  it('returns correct structure for single RICH file', () => {
    const result = buildVelvetCurtainResult(['rich.ts'], [RICH])
    expect(result.folds.length).toBe(1)
    expect(result.rows.length).toBe(1)
    expect(result.theater.avgPrivacy).toBe(98)
    expect(result.theater.avgElegance).toBe(100)
    expect(result.theater.avgTheatrical).toBe(100)
    expect(result.theater.isElegant).toBe(true)
    expect(result.theater.overallElegance).toBe(99)
  })

  it('returns correct stats for RICH fixture', () => {
    const result = buildVelvetCurtainResult(['rich.ts'], [RICH])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalRows).toBe(1)
    expect(result.stats.avgPrivacy).toBe(98)
    expect(result.stats.avgEnvelopeQuality).toBe(85)
    expect(result.stats.avgDrapeElegance).toBe(100)
    expect(result.stats.avgBackstageAccess).toBe(85)
    expect(result.stats.avgCurtainCall).toBe(100)
    expect(result.stats.avgTheatricalQuality).toBe(100)
    expect(result.stats.velvetMasterpieceCount).toBe(1)
    expect(result.stats.noCurtainCount).toBe(0)
    expect(result.stats.overallElegance).toBe(99)
    expect(result.stats.directorGrade).toBe('master-director')
    expect(result.stats.bestFold).toBe('rich.ts')
    expect(result.stats.mostPrivate).toBe('rich.ts')
    expect(result.stats.bestBoundary).toBe('rich.ts')
    expect(result.stats.mostElegant).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
    expect(result.stats.bestAPI).toBe('rich.ts')
  })

  it('returns empty structure for empty input', () => {
    const result = buildVelvetCurtainResult([], [])
    expect(result.folds).toEqual([])
    expect(result.rows).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallElegance).toBe(0)
    expect(result.theater.isElegant).toBe(false)
  })

  it('groups files by directory into rows', () => {
    const result = buildVelvetCurtainResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.rows.length).toBe(2)
    expect(result.stats.totalRows).toBe(2)
  })

  it('computes correct multi-file stats', () => {
    const result = buildVelvetCurtainResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.avgPrivacy).toBe(35)
    expect(result.stats.avgEnvelopeQuality).toBe(34)
    expect(result.stats.avgDrapeElegance).toBe(41)
    expect(result.stats.avgBackstageAccess).toBe(31)
    expect(result.stats.avgCurtainCall).toBe(41)
    expect(result.stats.avgTheatricalQuality).toBe(36)
    expect(result.stats.velvetMasterpieceCount).toBe(1)
    expect(result.stats.noCurtainCount).toBe(2)
    expect(result.stats.overallElegance).toBe(37)
    expect(result.stats.directorGrade).toBe('stage-manager')
  })

  it('picks correct best folds for multi-file', () => {
    const result = buildVelvetCurtainResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MINIMAL, POOR],
    )
    expect(result.stats.bestFold).toBe('src/a.ts')
    expect(result.stats.mostPrivate).toBe('src/a.ts')
    expect(result.stats.bestBoundary).toBe('src/a.ts')
    expect(result.stats.mostElegant).toBe('src/a.ts')
    expect(result.stats.bestDocumented).toBe('src/a.ts')
    expect(result.stats.bestAPI).toBe('src/a.ts')
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatVelvetCurtainJson', () => {
  it('returns valid JSON string', () => {
    const result = buildVelvetCurtainResult(['a.ts'], [RICH])
    const json = formatVelvetCurtainJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

describe('formatVelvetCurtainTable', () => {
  it('returns non-empty string for RICH result', () => {
    const result = buildVelvetCurtainResult(['a.ts'], [RICH])
    const table = formatVelvetCurtainTable(result, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('includes per-file details when verbose', () => {
    const result = buildVelvetCurtainResult(['a.ts'], [RICH])
    const table = formatVelvetCurtainTable(result, true)
    expect(table).toContain('Per-File Folds')
  })

  it('does not include per-file details when not verbose', () => {
    const result = buildVelvetCurtainResult(['a.ts'], [RICH])
    const table = formatVelvetCurtainTable(result, false)
    expect(table).not.toContain('Per-File Folds')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('color helpers', () => {
  it('scoreColor returns string for any score', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })

  it('privacyGradeColor returns input for unknown', () => {
    expect(privacyGradeColor('unknown')).toBe('unknown')
  })

  it('envelopeQualityColor returns input for unknown', () => {
    expect(envelopeQualityColor('unknown')).toBe('unknown')
  })

  it('drapeColor returns input for unknown', () => {
    expect(drapeColor('unknown')).toBe('unknown')
  })

  it('accessColor returns input for unknown', () => {
    expect(accessColor('unknown')).toBe('unknown')
  })

  it('callColor returns input for unknown', () => {
    expect(callColor('unknown')).toBe('unknown')
  })

  it('theatricalQualityColor returns input for unknown', () => {
    expect(theatricalQualityColor('unknown')).toBe('unknown')
  })

  it('conditionColor returns input for unknown', () => {
    expect(conditionColor('unknown')).toBe('unknown')
  })

  it('directorGradeColor returns input for unknown', () => {
    expect(directorGradeColor('unknown')).toBe('unknown')
  })
})
