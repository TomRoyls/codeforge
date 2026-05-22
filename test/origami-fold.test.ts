import { describe, expect, it } from 'vitest'

import {
  analyzeOrigamiGallery,
  analyzeOrigamiModel,
  buildOrigamiFoldResult,
  classifyArtistGrade,
  classifyCondition,
  classifyGalleryCondition,
  classifyGalleryType,
  generateRecommendations,
  measureCrease,
  measureMastery,
  measurePaper,
  measurePrecision,
  measureStructure,
  measureTransformation,
} from '../src/commands/origami-fold-helpers.js'

import {
  conditionColor,
  formatOrigamiFoldJson,
  formatOrigamiFoldTable,
  galleryTypeColor,
  gradeColor,
  scoreColor,
} from '../src/commands/origami-fold-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `export interface AuroraConfig {
  readonly id: string
  name: string
  intensity: number
  colors: string[]
  isActive: boolean
}

export class AuroraCalculator<T extends AuroraConfig> {
  private configs: T[] = []
  protected maxIntensity: number = 100

  constructor(initialConfigs?: T[]) {
    if (initialConfigs) {
      this.configs = initialConfigs
    }
  }

  async calculateIntensity(config: T): Promise<number> {
    try {
      const base = config.intensity
      const multiplier = config.isActive ? 2.0 : 0.5
      const result = Math.min(this.maxIntensity, base * multiplier)
      return Math.round(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      }
      return 0
    }
  }

  static createDefault(): AuroraCalculator<AuroraConfig> {
    return new AuroraCalculator<AuroraConfig>()
  }
}

/** Calculates aurora brightness */
export function calculateBrightness(colors: string[]): number {
  const green = colors.filter(c => c.includes('green'))
  return green.length * 10
}

export type AuroraPhase = 'dawn' | 'dusk' | 'night' | 'peak'
export enum AuroraType { BAND = 'band', CURTAIN = 'curtain', CORONA = 'corona' }
`

const EMPTY = ''

const MEDIUM = `export interface Config { name: string; value: number; }
export class Service {
  private config: Config;
  constructor(c: Config) { this.config = c; }
  async getValue(): Promise<string> {
    try { return String(this.config.value); } catch(e) { console.log(e); return ""; }
  }
}
export function helper(x: any): any { return x; }
`

// ─── measurePrecision ──────────────────────────────────────────────────────

describe('measurePrecision', () => {
  it('returns level 91 for RICH fixture', () => {
    expect(measurePrecision(RICH).level).toBe(91)
  })

  it('returns level 37 for EMPTY fixture', () => {
    expect(measurePrecision(EMPTY).level).toBe(37)
  })

  it('returns level 79 for MEDIUM fixture', () => {
    expect(measurePrecision(MEDIUM).level).toBe(79)
  })

  it('returns fold double-fold for RICH', () => {
    expect(measurePrecision(RICH).fold).toBe('double-fold')
  })

  it('returns fold crumple for EMPTY', () => {
    expect(measurePrecision(EMPTY).fold).toBe('crumple')
  })

  it('returns fold partial-fold for MEDIUM', () => {
    expect(measurePrecision(MEDIUM).fold).toBe('partial-fold')
  })

  it('hasPreciseFolds true for RICH', () => {
    expect(measurePrecision(RICH).hasPreciseFolds).toBe(true)
  })

  it('hasCleanCreases true for RICH', () => {
    expect(measurePrecision(RICH).hasCleanCreases).toBe(true)
  })

  it('hasNoTearing true for RICH', () => {
    expect(measurePrecision(RICH).hasNoTearing).toBe(true)
  })

  it('hasProperAlignment true for RICH', () => {
    expect(measurePrecision(RICH).hasProperAlignment).toBe(true)
  })

  it('hasNoWrinkling false for RICH (deepNested)', () => {
    expect(measurePrecision(RICH).hasNoWrinkling).toBe(false)
  })

  it('hasNoBuckling false for RICH (deepNested)', () => {
    expect(measurePrecision(RICH).hasNoBuckling).toBe(false)
  })

  it('tearCount 0 for RICH', () => {
    expect(measurePrecision(RICH).tearCount).toBe(0)
  })

  it('wrinkleCount 2 for RICH', () => {
    expect(measurePrecision(RICH).wrinkleCount).toBe(2)
  })

  it('hasCleanCreases true for MEDIUM', () => {
    expect(measurePrecision(MEDIUM).hasCleanCreases).toBe(true)
  })

  it('hasNoWrinkling false for MEDIUM (console)', () => {
    expect(measurePrecision(MEDIUM).hasNoWrinkling).toBe(false)
  })

  it('hasPreciseFolds false for EMPTY', () => {
    expect(measurePrecision(EMPTY).hasPreciseFolds).toBe(false)
  })

  it('hasSymmetry true for RICH', () => {
    expect(measurePrecision(RICH).hasSymmetry).toBe(true)
  })

  it('hasProperTension true for RICH', () => {
    expect(measurePrecision(RICH).hasProperTension).toBe(true)
  })

  it('hasSharpEdges true for RICH', () => {
    expect(measurePrecision(RICH).hasSharpEdges).toBe(true)
  })
})

// ─── measurePaper ──────────────────────────────────────────────────────────

describe('measurePaper', () => {
  it('returns quality 91 for RICH fixture', () => {
    expect(measurePaper(RICH).quality).toBe(91)
  })

  it('returns quality 27 for EMPTY fixture', () => {
    expect(measurePaper(EMPTY).quality).toBe(27)
  })

  it('returns quality 70 for MEDIUM fixture', () => {
    expect(measurePaper(MEDIUM).quality).toBe(70)
  })

  it('returns material tant for RICH', () => {
    expect(measurePaper(RICH).material).toBe('tant')
  })

  it('returns material toilet-paper for EMPTY', () => {
    expect(measurePaper(EMPTY).material).toBe('toilet-paper')
  })

  it('returns material kraft for MEDIUM', () => {
    expect(measurePaper(MEDIUM).material).toBe('kraft')
  })

  it('hasHighQuality true for RICH', () => {
    expect(measurePaper(RICH).hasHighQuality).toBe(true)
  })

  it('hasNoGrain false for RICH (console)', () => {
    expect(measurePaper(RICH).hasNoGrain).toBe(false)
  })

  it('hasNoDamage true for RICH', () => {
    expect(measurePaper(RICH).hasNoDamage).toBe(true)
  })

  it('hasProperTexture true for RICH', () => {
    expect(measurePaper(RICH).hasProperTexture).toBe(true)
  })

  it('grainCount 1 for RICH', () => {
    expect(measurePaper(RICH).grainCount).toBe(1)
  })

  it('grainCount 3 for MEDIUM', () => {
    expect(measurePaper(MEDIUM).grainCount).toBe(3)
  })

  it('grainCount 0 for EMPTY', () => {
    expect(measurePaper(EMPTY).grainCount).toBe(0)
  })
})

// ─── measureCrease ─────────────────────────────────────────────────────────

describe('measureCrease', () => {
  it('returns accuracy 91 for RICH fixture', () => {
    expect(measureCrease(RICH).accuracy).toBe(91)
  })

  it('returns accuracy 32 for EMPTY fixture', () => {
    expect(measureCrease(EMPTY).accuracy).toBe(32)
  })

  it('returns accuracy 77 for MEDIUM fixture', () => {
    expect(measureCrease(MEDIUM).accuracy).toBe(77)
  })

  it('returns type valley for RICH', () => {
    expect(measureCrease(RICH).type).toBe('valley')
  })

  it('returns type crimp for EMPTY', () => {
    expect(measureCrease(EMPTY).type).toBe('crimp')
  })

  it('returns type petal for MEDIUM', () => {
    expect(measureCrease(MEDIUM).type).toBe('petal')
  })

  it('hasAccurateCreases true for RICH', () => {
    expect(measureCrease(RICH).hasAccurateCreases).toBe(true)
  })

  it('hasAccurateCreases true for MEDIUM', () => {
    expect(measureCrease(MEDIUM).hasAccurateCreases).toBe(true)
  })

  it('hasProperPleat false for RICH', () => {
    expect(measureCrease(RICH).hasProperPleat).toBe(false)
  })

  it('hasReversible true for RICH (try-catch)', () => {
    expect(measureCrease(RICH).hasReversible).toBe(true)
  })

  it('hasReversible true for MEDIUM (try-catch)', () => {
    expect(measureCrease(MEDIUM).hasReversible).toBe(true)
  })

  it('hasNoOverfold false for RICH (deepNested)', () => {
    expect(measureCrease(RICH).hasNoOverfold).toBe(false)
  })

  it('misfoldCount 0 for RICH', () => {
    expect(measureCrease(RICH).misfoldCount).toBe(0)
  })

  it('overfoldCount 1 for RICH', () => {
    expect(measureCrease(RICH).overfoldCount).toBe(1)
  })

  it('hasLockFold true for MEDIUM (private)', () => {
    expect(measureCrease(MEDIUM).hasLockFold).toBe(true)
  })
})

// ─── measureTransformation ─────────────────────────────────────────────────

describe('measureTransformation', () => {
  it('returns beauty 77 for RICH fixture', () => {
    expect(measureTransformation(RICH).beauty).toBe(77)
  })

  it('returns beauty 27 for EMPTY fixture', () => {
    expect(measureTransformation(EMPTY).beauty).toBe(27)
  })

  it('returns beauty 69 for MEDIUM fixture', () => {
    expect(measureTransformation(MEDIUM).beauty).toBe(69)
  })

  it('returns stage pre-creasing for RICH', () => {
    expect(measureTransformation(RICH).stage).toBe('pre-creasing')
  })

  it('returns stage raw-sheet for EMPTY', () => {
    expect(measureTransformation(EMPTY).stage).toBe('raw-sheet')
  })

  it('returns stage base-fold for MEDIUM', () => {
    expect(measureTransformation(MEDIUM).stage).toBe('base-fold')
  })

  it('hasBeautifulTransformation true for RICH', () => {
    expect(measureTransformation(RICH).hasBeautifulTransformation).toBe(true)
  })

  it('hasDimensionalShift false for RICH', () => {
    expect(measureTransformation(RICH).hasDimensionalShift).toBe(false)
  })

  it('hasNoDistortion false for RICH (console)', () => {
    expect(measureTransformation(RICH).hasNoDistortion).toBe(false)
  })

  it('hasCurves false for RICH', () => {
    expect(measureTransformation(RICH).hasCurves).toBe(false)
  })

  it('hasNoSharpCorners false for RICH (deepNested)', () => {
    expect(measureTransformation(RICH).hasNoSharpCorners).toBe(false)
  })

  it('distortionCount 1 for RICH', () => {
    expect(measureTransformation(RICH).distortionCount).toBe(1)
  })

  it('sharpCornerCount 1 for RICH', () => {
    expect(measureTransformation(RICH).sharpCornerCount).toBe(1)
  })

  it('hasProperShaping true for MEDIUM', () => {
    expect(measureTransformation(MEDIUM).hasProperShaping).toBe(true)
  })
})

// ─── measureStructure ──────────────────────────────────────────────────────

describe('measureStructure', () => {
  it('returns integrity 91 for RICH fixture', () => {
    expect(measureStructure(RICH).integrity).toBe(91)
  })

  it('returns integrity 30 for EMPTY fixture', () => {
    expect(measureStructure(EMPTY).integrity).toBe(30)
  })

  it('returns integrity 77 for MEDIUM fixture', () => {
    expect(measureStructure(MEDIUM).integrity).toBe(77)
  })

  it('returns form composite for RICH', () => {
    expect(measureStructure(RICH).form).toBe('composite')
  })

  it('returns form collapsed for EMPTY', () => {
    expect(measureStructure(EMPTY).form).toBe('collapsed')
  })

  it('returns form pureland for MEDIUM', () => {
    expect(measureStructure(MEDIUM).form).toBe('pureland')
  })

  it('hasStrongStructure true for RICH', () => {
    expect(measureStructure(RICH).hasStrongStructure).toBe(true)
  })

  it('hasStrongStructure true for MEDIUM', () => {
    expect(measureStructure(MEDIUM).hasStrongStructure).toBe(true)
  })

  it('hasNoRipping true for RICH', () => {
    expect(measureStructure(RICH).hasNoRipping).toBe(true)
  })

  it('hasNoWeakPoints false for RICH (console)', () => {
    expect(measureStructure(RICH).hasNoWeakPoints).toBe(false)
  })

  it('gapCount 1 for RICH (deepNested)', () => {
    expect(measureStructure(RICH).gapCount).toBe(1)
  })

  it('weakPointCount 1 for RICH (console)', () => {
    expect(measureStructure(RICH).weakPointCount).toBe(1)
  })

  it('hasCollapsibility true for RICH', () => {
    expect(measureStructure(RICH).hasCollapsibility).toBe(true)
  })
})

// ─── measureMastery ────────────────────────────────────────────────────────

describe('measureMastery', () => {
  it('returns score 98 for RICH fixture', () => {
    expect(measureMastery(RICH).score).toBe(98)
  })

  it('returns score 25 for EMPTY fixture', () => {
    expect(measureMastery(EMPTY).score).toBe(25)
  })

  it('returns score 77 for MEDIUM fixture', () => {
    expect(measureMastery(MEDIUM).score).toBe(77)
  })

  it('returns level grand-master for RICH', () => {
    expect(measureMastery(RICH).level).toBe('grand-master')
  })

  it('returns level uninitiated for EMPTY', () => {
    expect(measureMastery(EMPTY).level).toBe('uninitiated')
  })

  it('returns level intermediate for MEDIUM', () => {
    expect(measureMastery(MEDIUM).level).toBe('intermediate')
  })

  it('hasArtisticMastery true for RICH', () => {
    expect(measureMastery(RICH).hasArtisticMastery).toBe(true)
  })

  it('hasYoshizawa true for RICH', () => {
    expect(measureMastery(RICH).hasYoshizawa).toBe(true)
  })

  it('hasCleanFinish false for RICH (console)', () => {
    expect(measureMastery(RICH).hasCleanFinish).toBe(false)
  })

  it('hasProperDisplay true for RICH', () => {
    expect(measureMastery(RICH).hasProperDisplay).toBe(true)
  })

  it('amateurCount 2 for RICH (console + deepNested)', () => {
    expect(measureMastery(RICH).amateurCount).toBe(2)
  })

  it('hasNoOvercomplication true for RICH', () => {
    expect(measureMastery(RICH).hasNoOvercomplication).toBe(true)
  })

  it('hasTimeless true for RICH', () => {
    expect(measureMastery(RICH).hasTimeless).toBe(true)
  })

  it('hasMinimal false for RICH (deepNested)', () => {
    expect(measureMastery(RICH).hasMinimal).toBe(false)
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns tanagra-masterpiece for RICH model', () => {
    const model = analyzeOrigamiModel(RICH, 'test.ts')
    expect(classifyCondition(model)).toBe('tanagra-masterpiece')
  })

  it('returns crumpled-ball for EMPTY model', () => {
    const model = analyzeOrigamiModel(EMPTY, 'empty.ts')
    expect(classifyCondition(model)).toBe('crumpled-ball')
  })

  it('returns yoshizawa-grade for MEDIUM model', () => {
    const model = analyzeOrigamiModel(MEDIUM, 'medium.ts')
    expect(classifyCondition(model)).toBe('yoshizawa-grade')
  })
})

// ─── analyzeOrigamiModel ───────────────────────────────────────────────────

describe('analyzeOrigamiModel', () => {
  it('returns qualityScore 90 for RICH', () => {
    expect(analyzeOrigamiModel(RICH, 'rich.ts').qualityScore).toBe(90)
  })

  it('returns qualityScore 30 for EMPTY', () => {
    expect(analyzeOrigamiModel(EMPTY, 'empty.ts').qualityScore).toBe(30)
  })

  it('returns qualityScore 75 for MEDIUM', () => {
    expect(analyzeOrigamiModel(MEDIUM, 'medium.ts').qualityScore).toBe(75)
  })

  it('returns condition tanagra-masterpiece for RICH', () => {
    expect(analyzeOrigamiModel(RICH, 'rich.ts').condition).toBe('tanagra-masterpiece')
  })

  it('returns condition crumpled-ball for EMPTY', () => {
    expect(analyzeOrigamiModel(EMPTY, 'empty.ts').condition).toBe('crumpled-ball')
  })

  it('returns condition yoshizawa-grade for MEDIUM', () => {
    expect(analyzeOrigamiModel(MEDIUM, 'medium.ts').condition).toBe('yoshizawa-grade')
  })

  it('includes all 6 measure properties', () => {
    const model = analyzeOrigamiModel(RICH, 'test.ts')
    expect(model).toHaveProperty('precision')
    expect(model).toHaveProperty('paper')
    expect(model).toHaveProperty('crease')
    expect(model).toHaveProperty('transformation')
    expect(model).toHaveProperty('structure')
    expect(model).toHaveProperty('mastery')
  })

  it('stores file path correctly', () => {
    expect(analyzeOrigamiModel(RICH, 'src/app.ts').file).toBe('src/app.ts')
  })

  it('foldingPrecision equals precision.level for RICH', () => {
    expect(analyzeOrigamiModel(RICH, 'rich.ts').foldingPrecision).toBe(91)
  })

  it('paperQuality equals paper.quality for RICH', () => {
    expect(analyzeOrigamiModel(RICH, 'rich.ts').paperQuality).toBe(91)
  })
})

// ─── classifyGalleryType ───────────────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('returns recycling-bin for empty models', () => {
    expect(classifyGalleryType([])).toBe('recycling-bin')
  })

  it('returns museum for RICH single file', () => {
    const models = [analyzeOrigamiModel(RICH, 'rich.ts')]
    expect(classifyGalleryType(models)).toBe('museum')
  })
})

// ─── classifyGalleryCondition ──────────────────────────────────────────────

describe('classifyGalleryCondition', () => {
  it('returns world-exhibition for avgQuality 90', () => {
    expect(classifyGalleryCondition(90)).toBe('world-exhibition')
  })

  it('returns trash-can for avgQuality 10', () => {
    expect(classifyGalleryCondition(10)).toBe('trash-can')
  })

  it('returns craft-fair for avgQuality 40', () => {
    expect(classifyGalleryCondition(40)).toBe('craft-fair')
  })

  it('returns national-gallery for avgQuality 65', () => {
    expect(classifyGalleryCondition(65)).toBe('national-gallery')
  })

  it('returns art-show for avgQuality 50', () => {
    expect(classifyGalleryCondition(50)).toBe('art-show')
  })

  it('returns desk-drawer for avgQuality 25', () => {
    expect(classifyGalleryCondition(25)).toBe('desk-drawer')
  })
})

// ─── classifyArtistGrade ───────────────────────────────────────────────────

describe('classifyArtistGrade', () => {
  it('returns living-treasure for 80+', () => {
    expect(classifyArtistGrade(90)).toBe('living-treasure')
  })

  it('returns paper-cutter for below 20', () => {
    expect(classifyArtistGrade(10)).toBe('paper-cutter')
  })

  it('returns master-artist for 65', () => {
    expect(classifyArtistGrade(65)).toBe('master-artist')
  })

  it('returns artist for 50', () => {
    expect(classifyArtistGrade(50)).toBe('artist')
  })

  it('returns craftsman for 35', () => {
    expect(classifyArtistGrade(35)).toBe('craftsman')
  })

  it('returns student for 20', () => {
    expect(classifyArtistGrade(20)).toBe('student')
  })
})

// ─── analyzeOrigamiGallery ─────────────────────────────────────────────────

describe('analyzeOrigamiGallery', () => {
  it('returns recycling-bin gallery for empty models', () => {
    const gallery = analyzeOrigamiGallery([], 'empty-dir')
    expect(gallery.galleryType).toBe('recycling-bin')
    expect(gallery.condition).toBe('trash-can')
    expect(gallery.models).toHaveLength(0)
  })

  it('computes avgPrecision correctly for RICH', () => {
    const models = [analyzeOrigamiModel(RICH, 'rich.ts')]
    const gallery = analyzeOrigamiGallery(models, 'src')
    expect(gallery.avgPrecision).toBe(91)
  })

  it('counts masterpieces correctly', () => {
    const models = [analyzeOrigamiModel(RICH, 'rich.ts')]
    const gallery = analyzeOrigamiGallery(models, 'src')
    expect(gallery.masterpieceCount).toBe(1)
  })
})

// ─── buildOrigamiFoldResult ────────────────────────────────────────────────

describe('buildOrigamiFoldResult', () => {
  it('returns empty result for no files', () => {
    const result = buildOrigamiFoldResult([], [])
    expect(result.models).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.exhibition.overallElegance).toBe(0)
    expect(result.exhibition.isMasterwork).toBe(false)
  })

  it('returns correct stats for single RICH file', () => {
    const result = buildOrigamiFoldResult(['rich.ts'], [RICH])
    expect(result.models).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.models[0].qualityScore).toBe(90)
    expect(result.exhibition.overallElegance).toBe(90)
    expect(result.exhibition.isMasterwork).toBe(true)
    expect(result.stats.artistGrade).toBe('living-treasure')
    expect(result.stats.bestModel).toBe('rich.ts')
  })

  it('returns correct condition counts for mixed files', () => {
    const result = buildOrigamiFoldResult(
      ['rich.ts', 'empty.ts', 'medium.ts'],
      [RICH, EMPTY, MEDIUM],
    )
    expect(result.stats.masterpieceCount).toBe(1)
    expect(result.stats.confettiCount).toBe(0)
    expect(result.stats.crumpledCount).toBe(1)
  })

  it('computes overallElegance as average qualityScore', () => {
    const result = buildOrigamiFoldResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.exhibition.overallElegance).toBe(Math.round((90 + 30) / 2))
  })

  it('generates recommendations', () => {
    const result = buildOrigamiFoldResult(['empty.ts'], [EMPTY])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('identifies mostPrecise file', () => {
    const result = buildOrigamiFoldResult(
      ['rich.ts', 'medium.ts'],
      [RICH, MEDIUM],
    )
    expect(result.stats.mostPrecise).toBe('rich.ts')
  })

  it('identifies bestModel', () => {
    const result = buildOrigamiFoldResult(
      ['rich.ts', 'empty.ts'],
      [RICH, EMPTY],
    )
    expect(result.stats.bestModel).toBe('rich.ts')
  })

  it('groups files into galleries by directory', () => {
    const result = buildOrigamiFoldResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [RICH, MEDIUM, EMPTY],
    )
    expect(result.galleries).toHaveLength(2)
    expect(result.stats.totalGalleries).toBe(2)
  })

  it('single file in root goes to . gallery', () => {
    const result = buildOrigamiFoldResult(['app.ts'], [RICH])
    expect(result.galleries).toHaveLength(1)
    expect(result.galleries[0].directory).toBe('.')
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns masterpiece recommendation when all is good', () => {
    const result = buildOrigamiFoldResult(['rich.ts'], [RICH])
    const recs = generateRecommendations(result.models, result.galleries, result.exhibition, result.stats)
    expect(recs).toContain('Origami masterpiece — your code folds into breathtaking elegance')
  })

  it('suggests improving precision when low', () => {
    const result = buildOrigamiFoldResult(['empty.ts'], [EMPTY])
    const recs = generateRecommendations(result.models, result.galleries, result.exhibition, result.stats)
    expect(recs.some(r => r.includes('folding precision'))).toBe(true)
  })

  it('warns about no mastery code', () => {
    const result = buildOrigamiFoldResult(['empty.ts'], [EMPTY])
    const recs = generateRecommendations(result.models, result.galleries, result.exhibition, result.stats)
    expect(recs.some(r => r.includes('masterfully elegant'))).toBe(true)
  })
})

// ─── formatOrigamiFoldJson ─────────────────────────────────────────────────

describe('formatOrigamiFoldJson', () => {
  it('returns valid JSON string', () => {
    const result = buildOrigamiFoldResult(['test.ts'], [RICH])
    const json = formatOrigamiFoldJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.models).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── formatOrigamiFoldTable ────────────────────────────────────────────────

describe('formatOrigamiFoldTable', () => {
  it('includes exhibition overview section', () => {
    const result = buildOrigamiFoldResult(['test.ts'], [RICH])
    const table = formatOrigamiFoldTable(result, false)
    expect(table).toContain('Origami Fold Analysis')
    expect(table).toContain('Overall Elegance')
  })

  it('includes per-model breakdown when verbose', () => {
    const result = buildOrigamiFoldResult(['test.ts'], [RICH])
    const table = formatOrigamiFoldTable(result, true)
    expect(table).toContain('Per-Model Breakdown')
    expect(table).toContain('test.ts')
  })

  it('includes recommendations', () => {
    const result = buildOrigamiFoldResult(['test.ts'], [RICH])
    const table = formatOrigamiFoldTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

// ─── Color Helpers ─────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for score 90', () => {
    expect(typeof scoreColor(90)).toBe('string')
  })

  it('returns string for score 50', () => {
    expect(typeof scoreColor(50)).toBe('string')
  })

  it('returns string for score 10', () => {
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns string for tanagra-masterpiece', () => {
    expect(typeof conditionColor('tanagra-masterpiece')).toBe('string')
  })

  it('returns string for confetti', () => {
    expect(typeof conditionColor('confetti')).toBe('string')
  })
})

describe('gradeColor', () => {
  it('returns string for living-treasure', () => {
    expect(typeof gradeColor('living-treasure')).toBe('string')
  })

  it('returns string for paper-cutter', () => {
    expect(typeof gradeColor('paper-cutter')).toBe('string')
  })
})

describe('galleryTypeColor', () => {
  it('returns string for museum', () => {
    expect(typeof galleryTypeColor('museum')).toBe('string')
  })

  it('returns string for recycling-bin', () => {
    expect(typeof galleryTypeColor('recycling-bin')).toBe('string')
  })
})
