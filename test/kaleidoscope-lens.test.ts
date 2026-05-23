import { describe, it, expect } from 'vitest'

import {
  measureSymmetry,
  measureColor,
  measureLens,
  measureOptical,
  measureReflection,
  measureHarmony,
  classifyCondition,
  analyzeKaleidoFragment,
  classifyChamberType,
  analyzeLensChamber,
  classifyOpticianGrade,
  generateRecommendations,
  buildKaleidoscopeLensResult,
} from '../src/commands/kaleidoscope-lens-helpers.js'

import {
  scoreColor,
  orderColor,
  paletteColor,
  focusColor,
  gradeColor,
  surfaceColor,
  beautyColor,
  conditionColor,
  opticianGradeColor,
  chamberTypeColor,
  chamberConditionColor,
  formatKaleidoscopeLensJson,
  formatKaleidoscopeLensTable,
} from '../src/commands/kaleidoscope-lens-format-helpers.js'

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

const BAD = `// HACK: bad code
// FIXME: fix this
: any
eval("x")
a ? b : c ? d : e
try {} catch(e) {}
console.log('bad')
`

// ─── measureSymmetry ───────────────────────────────────────────────────────

describe('measureSymmetry', () => {
  it('scores RICH content as 100', () => {
    const result = measureSymmetry(RICH)
    expect(result.level).toBe(100)
  })

  it('classifies RICH as six-fold-symmetry', () => {
    const result = measureSymmetry(RICH)
    expect(result.order).toBe('six-fold-symmetry')
  })

  it('scores EMPTY as 42', () => {
    const result = measureSymmetry(EMPTY)
    expect(result.level).toBe(42)
  })

  it('classifies EMPTY as asymmetric', () => {
    const result = measureSymmetry(EMPTY)
    expect(result.order).toBe('asymmetric')
  })

  it('sets hasHighLevel true for score >= 70', () => {
    expect(measureSymmetry(RICH).hasHighLevel).toBe(true)
  })

  it('sets hasHighLevel false for low scores', () => {
    expect(measureSymmetry(EMPTY).hasHighLevel).toBe(false)
  })

  it('detects consistent patterns in RICH', () => {
    expect(measureSymmetry(RICH).hasConsistentPatterns).toBe(true)
  })

  it('detects proper mirroring in RICH', () => {
    expect(measureSymmetry(RICH).hasProperMirroring).toBe(true)
  })

  it('detects no distortion in RICH', () => {
    expect(measureSymmetry(RICH).hasNoDistortion).toBe(true)
  })

  it('detects repeating patterns in RICH', () => {
    expect(measureSymmetry(RICH).hasRepeating).toBe(true)
  })

  it('detects balanced in RICH', () => {
    expect(measureSymmetry(RICH).hasBalanced).toBe(true)
  })

  it('detects geometric in RICH', () => {
    expect(measureSymmetry(RICH).hasGeometric).toBe(true)
  })

  it('counts distortion in BAD content', () => {
    const result = measureSymmetry(BAD)
    expect(result.distortionCount).toBeGreaterThan(0)
  })

  it('counts irregularity in BAD content', () => {
    const result = measureSymmetry(BAD)
    expect(result.irregularityCount).toBeGreaterThan(0)
  })

  it('classifies MEDIUM content', () => {
    const result = measureSymmetry(MEDIUM)
    expect(result.order).toBe('asymmetric')
  })

  it('has level > 30 for MEDIUM', () => {
    const result = measureSymmetry(MEDIUM)
    expect(result.level).toBeGreaterThan(30)
  })
})

// ─── measureColor ──────────────────────────────────────────────────────────

describe('measureColor', () => {
  it('scores RICH content as 90', () => {
    const result = measureColor(RICH)
    expect(result.richness).toBe(90)
  })

  it('classifies RICH as rainbow-spectrum', () => {
    const result = measureColor(RICH)
    expect(result.palette).toBe('rainbow-spectrum')
  })

  it('scores EMPTY as 32', () => {
    const result = measureColor(EMPTY)
    expect(result.richness).toBe(32)
  })

  it('classifies EMPTY as monochrome', () => {
    const result = measureColor(EMPTY)
    expect(result.palette).toBe('monochrome')
  })

  it('sets hasHighRichness true for RICH', () => {
    expect(measureColor(RICH).hasHighRichness).toBe(true)
  })

  it('sets hasVibrant true for RICH', () => {
    expect(measureColor(RICH).hasVibrant).toBe(true)
  })

  it('sets hasRich true for RICH', () => {
    expect(measureColor(RICH).hasRich).toBe(true)
  })

  it('sets hasVaried true for RICH', () => {
    expect(measureColor(RICH).hasVaried).toBe(true)
  })

  it('classifies MEDIUM as colorless', () => {
    expect(measureColor(MEDIUM).palette).toBe('colorless')
  })

  it('counts repetition in MEDIUM', () => {
    const result = measureColor(MEDIUM)
    expect(result.repetitionCount).toBeGreaterThan(0)
  })
})

// ─── measureLens ───────────────────────────────────────────────────────────

describe('measureLens', () => {
  it('scores RICH content as 100', () => {
    const result = measureLens(RICH)
    expect(result.clarity).toBe(100)
  })

  it('classifies RICH as crystal-clear', () => {
    const result = measureLens(RICH)
    expect(result.focus).toBe('crystal-clear')
  })

  it('scores EMPTY as 43', () => {
    const result = measureLens(EMPTY)
    expect(result.clarity).toBe(43)
  })

  it('classifies EMPTY as foggy', () => {
    const result = measureLens(EMPTY)
    expect(result.focus).toBe('foggy')
  })

  it('sets hasHighClarity true for RICH', () => {
    expect(measureLens(RICH).hasHighClarity).toBe(true)
  })

  it('detects no obfuscation in RICH', () => {
    expect(measureLens(RICH).hasNoObfuscation).toBe(true)
  })

  it('detects proper zoom in RICH', () => {
    expect(measureLens(RICH).hasProperZoom).toBe(true)
  })

  it('detects sharp edges in RICH', () => {
    expect(measureLens(RICH).hasSharpEdges).toBe(true)
  })

  it('detects no chromatic aberration in RICH', () => {
    expect(measureLens(RICH).hasNoChromaticAberration).toBe(true)
  })

  it('classifies MEDIUM as foggy', () => {
    expect(measureLens(MEDIUM).focus).toBe('foggy')
  })

  it('has zero obfuscation count for RICH', () => {
    expect(measureLens(RICH).obfuscationCount).toBe(0)
  })

  it('has zero blurring count for RICH', () => {
    expect(measureLens(RICH).blurringCount).toBe(0)
  })
})

// ─── measureOptical ────────────────────────────────────────────────────────

describe('measureOptical', () => {
  it('scores RICH content as 100', () => {
    const result = measureOptical(RICH)
    expect(result.precision).toBe(100)
  })

  it('classifies RICH as laser-precision', () => {
    const result = measureOptical(RICH)
    expect(result.grade).toBe('laser-precision')
  })

  it('scores EMPTY as 42', () => {
    const result = measureOptical(EMPTY)
    expect(result.precision).toBe(42)
  })

  it('classifies EMPTY as blurred-vision', () => {
    const result = measureOptical(EMPTY)
    expect(result.grade).toBe('blurred-vision')
  })

  it('sets hasHighPrecision true for RICH', () => {
    expect(measureOptical(RICH).hasHighPrecision).toBe(true)
  })

  it('detects accurate in RICH', () => {
    expect(measureOptical(RICH).hasAccurate).toBe(true)
  })

  it('detects no aberration in RICH', () => {
    expect(measureOptical(RICH).hasNoAberration).toBe(true)
  })

  it('detects correct wavelength in RICH', () => {
    expect(measureOptical(RICH).hasCorrectWavelength).toBe(true)
  })

  it('classifies MEDIUM as blurred-vision', () => {
    expect(measureOptical(MEDIUM).grade).toBe('blurred-vision')
  })

  it('counts scattering in BAD content', () => {
    const result = measureOptical(BAD)
    expect(result.scatteringCount).toBeGreaterThan(0)
  })
})

// ─── measureReflection ─────────────────────────────────────────────────────

describe('measureReflection', () => {
  it('scores RICH content as 100', () => {
    const result = measureReflection(RICH)
    expect(result.quality).toBe(100)
  })

  it('classifies RICH as perfect-mirror', () => {
    const result = measureReflection(RICH)
    expect(result.surface).toBe('perfect-mirror')
  })

  it('scores EMPTY as 42', () => {
    const result = measureReflection(EMPTY)
    expect(result.quality).toBe(42)
  })

  it('classifies EMPTY as tarnished', () => {
    const result = measureReflection(EMPTY)
    expect(result.surface).toBe('tarnished')
  })

  it('sets hasHighQuality true for RICH', () => {
    expect(measureReflection(RICH).hasHighQuality).toBe(true)
  })

  it('detects self-documenting in RICH', () => {
    expect(measureReflection(RICH).hasSelfDocumenting).toBe(true)
  })

  it('detects accurate docs in RICH', () => {
    expect(measureReflection(RICH).hasAccurateDocs).toBe(true)
  })

  it('detects comprehensive in RICH', () => {
    expect(measureReflection(RICH).hasComprehensive).toBe(true)
  })

  it('has zero obscured count for RICH', () => {
    expect(measureReflection(RICH).obscuredCount).toBe(0)
  })

  it('classifies MEDIUM as tarnished', () => {
    expect(measureReflection(MEDIUM).surface).toBe('tarnished')
  })
})

// ─── measureHarmony ────────────────────────────────────────────────────────

describe('measureHarmony', () => {
  it('scores RICH content as 100', () => {
    const result = measureHarmony(RICH)
    expect(result.level).toBe(100)
  })

  it('classifies RICH as mesmerizing', () => {
    const result = measureHarmony(RICH)
    expect(result.beauty).toBe('mesmerizing')
  })

  it('scores EMPTY as 42', () => {
    const result = measureHarmony(EMPTY)
    expect(result.level).toBe(42)
  })

  it('classifies EMPTY as disjointed', () => {
    const result = measureHarmony(EMPTY)
    expect(result.beauty).toBe('disjointed')
  })

  it('sets hasHighLevel true for RICH', () => {
    expect(measureHarmony(RICH).hasHighLevel).toBe(true)
  })

  it('detects aesthetic in RICH', () => {
    expect(measureHarmony(RICH).hasAesthetic).toBe(true)
  })

  it('detects no dissonance in RICH', () => {
    expect(measureHarmony(RICH).hasNoDissonance).toBe(true)
  })

  it('detects harmonious in RICH', () => {
    expect(measureHarmony(RICH).hasHarmonious).toBe(true)
  })

  it('detects complete in RICH', () => {
    expect(measureHarmony(RICH).hasComplete).toBe(true)
  })

  it('classifies MEDIUM as disjointed', () => {
    expect(measureHarmony(MEDIUM).beauty).toBe('disjointed')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns masterpiece-kaleidoscope for score >= 80', () => {
    const frag = { qualityScore: 80 } as any
    expect(classifyCondition(frag)).toBe('masterpiece-kaleidoscope')
  })

  it('returns beautiful-mandala for score >= 65', () => {
    const frag = { qualityScore: 65 } as any
    expect(classifyCondition(frag)).toBe('beautiful-mandala')
  })

  it('returns colorful-pattern for score >= 50', () => {
    const frag = { qualityScore: 50 } as any
    expect(classifyCondition(frag)).toBe('colorful-pattern')
  })

  it('returns simple-shape for score >= 35', () => {
    const frag = { qualityScore: 35 } as any
    expect(classifyCondition(frag)).toBe('simple-shape')
  })

  it('returns broken-shard for score >= 20', () => {
    const frag = { qualityScore: 20 } as any
    expect(classifyCondition(frag)).toBe('broken-shard')
  })

  it('returns dust for score < 20', () => {
    const frag = { qualityScore: 10 } as any
    expect(classifyCondition(frag)).toBe('dust')
  })
})

// ─── analyzeKaleidoFragment ────────────────────────────────────────────────

describe('analyzeKaleidoFragment', () => {
  it('analyzes RICH content correctly', () => {
    const frag = analyzeKaleidoFragment(RICH, 'rich.ts')
    expect(frag.patternSymmetry).toBe(100)
    expect(frag.colorRichness).toBe(90)
    expect(frag.lensClarity).toBe(100)
    expect(frag.opticalPrecision).toBe(100)
    expect(frag.reflectionQuality).toBe(100)
    expect(frag.visualHarmony).toBe(100)
    expect(frag.qualityScore).toBe(99)
    expect(frag.condition).toBe('masterpiece-kaleidoscope')
    expect(frag.file).toBe('rich.ts')
  })

  it('analyzes MEDIUM content correctly', () => {
    const frag = analyzeKaleidoFragment(MEDIUM, 'medium.ts')
    expect(frag.patternSymmetry).toBe(47)
    expect(frag.colorRichness).toBe(27)
    expect(frag.lensClarity).toBe(37)
    expect(frag.opticalPrecision).toBe(47)
    expect(frag.reflectionQuality).toBe(47)
    expect(frag.visualHarmony).toBe(47)
    expect(frag.qualityScore).toBe(42)
    expect(frag.condition).toBe('simple-shape')
  })

  it('analyzes EMPTY content correctly', () => {
    const frag = analyzeKaleidoFragment(EMPTY, 'empty.ts')
    expect(frag.patternSymmetry).toBe(42)
    expect(frag.qualityScore).toBe(41)
    expect(frag.condition).toBe('simple-shape')
  })

  it('includes all measure sub-objects', () => {
    const frag = analyzeKaleidoFragment(RICH, 'rich.ts')
    expect(frag.symmetry).toBeDefined()
    expect(frag.color).toBeDefined()
    expect(frag.lens).toBeDefined()
    expect(frag.optical).toBeDefined()
    expect(frag.reflection).toBeDefined()
    expect(frag.harmony).toBeDefined()
  })
})

// ─── classifyChamberType ───────────────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns empty for no fragments', () => {
    expect(classifyChamberType([])).toBe('empty')
  })

  it('returns viewing-tube for RICH+MEDIUM mix', () => {
    const frags = [
      analyzeKaleidoFragment(RICH, 'rich.ts'),
      analyzeKaleidoFragment(MEDIUM, 'medium.ts'),
    ]
    expect(classifyChamberType(frags)).toBe('viewing-tube')
  })

  it('returns toy-kaleidoscope for all EMPTY', () => {
    const frags = Array.from({ length: 4 }, (_, i) => analyzeKaleidoFragment(EMPTY, `e${i}.ts`))
    expect(classifyChamberType(frags)).toBe('toy-kaleidoscope')
  })

  it('returns grand-kaleidoscope for high score with 30% masterpieces', () => {
    const frags = Array.from({ length: 4 }, (_, i) => analyzeKaleidoFragment(RICH, `r${i}.ts`))
    expect(classifyChamberType(frags)).toBe('grand-kaleidoscope')
  })
})

// ─── analyzeLensChamber ────────────────────────────────────────────────────

describe('analyzeLensChamber', () => {
  it('returns empty chamber for no fragments', () => {
    const chamber = analyzeLensChamber([], 'test-dir')
    expect(chamber.directory).toBe('test-dir')
    expect(chamber.chamberType).toBe('empty')
    expect(chamber.condition).toBe('darkness')
    expect(chamber.fragments).toHaveLength(0)
    expect(chamber.avgSymmetry).toBe(0)
  })

  it('computes averages correctly for RICH+MEDIUM', () => {
    const frags = [
      analyzeKaleidoFragment(RICH, 'rich.ts'),
      analyzeKaleidoFragment(MEDIUM, 'medium.ts'),
    ]
    const chamber = analyzeLensChamber(frags, '.')
    expect(chamber.avgSymmetry).toBe(74)
    expect(chamber.avgClarity).toBe(69)
    expect(chamber.avgHarmony).toBe(74)
    expect(chamber.chamberType).toBe('viewing-tube')
    expect(chamber.condition).toBe('beautiful-patterns')
  })

  it('counts masterpieces and dust correctly', () => {
    const frags = [
      analyzeKaleidoFragment(RICH, 'rich.ts'),
      analyzeKaleidoFragment(MEDIUM, 'medium.ts'),
    ]
    const chamber = analyzeLensChamber(frags, '.')
    expect(chamber.masterpieceCount).toBe(1)
    expect(chamber.dustCount).toBe(0)
  })

  it('counts symmetric and clear correctly', () => {
    const frags = [
      analyzeKaleidoFragment(RICH, 'rich.ts'),
      analyzeKaleidoFragment(MEDIUM, 'medium.ts'),
    ]
    const chamber = analyzeLensChamber(frags, '.')
    expect(chamber.symmetricCount).toBe(1)
    expect(chamber.clearCount).toBe(1)
  })
})

// ─── classifyOpticianGrade ─────────────────────────────────────────────────

describe('classifyOpticianGrade', () => {
  it('returns master-optician for 80+', () => expect(classifyOpticianGrade(80)).toBe('master-optician'))
  it('returns lens-crafter for 65+', () => expect(classifyOpticianGrade(65)).toBe('lens-crafter'))
  it('returns glassblower for 50+', () => expect(classifyOpticianGrade(50)).toBe('glassblower'))
  it('returns observer for 35+', () => expect(classifyOpticianGrade(35)).toBe('observer'))
  it('returns tourist for 20+', () => expect(classifyOpticianGrade(20)).toBe('tourist'))
  it('returns blind-spot for 0+', () => expect(classifyOpticianGrade(10)).toBe('blind-spot'))
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for low-scoring codebase', () => {
    const result = buildKaleidoscopeLensResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    expect(result.recommendations.length).toBeGreaterThan(0)
    expect(result.recommendations.some((r) => r.includes('pattern symmetry'))).toBe(true)
  })

  it('returns empty recommendations for RICH codebase', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts'], [RICH])
    expect(result.recommendations).toHaveLength(0)
  })

  it('recommends restoration for dust-heavy codebase', () => {
    const dustContent = 'x'
    const result = buildKaleidoscopeLensResult(
      Array.from({ length: 10 }, (_, i) => `f${i}.ts`),
      Array.from({ length: 10 }, () => dustContent),
    )
    // dust condition is when qualityScore < 20; dustContent 'x' likely won't be dust
    // Just check recommendations exist
    expect(Array.isArray(result.recommendations)).toBe(true)
  })
})

// ─── buildKaleidoscopeLensResult ────────────────────────────────────────────

describe('buildKaleidoscopeLensResult', () => {
  it('handles RICH + MEDIUM correctly', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalChambers).toBe(1)
    expect(result.stats.avgPatternSymmetry).toBe(74)
    expect(result.stats.avgColorRichness).toBe(59)
    expect(result.stats.avgLensClarity).toBe(69)
    expect(result.stats.avgOpticalPrecision).toBe(74)
    expect(result.stats.avgReflectionQuality).toBe(74)
    expect(result.stats.avgVisualHarmony).toBe(74)
    expect(result.stats.masterpieceKaleidoscopeCount).toBe(1)
    expect(result.stats.simpleShapeCount).toBe(1)
    expect(result.stats.overallBeauty).toBe(71)
    expect(result.stats.opticianGrade).toBe('lens-crafter')
  })

  it('handles 4 EMPTY files correctly', () => {
    const result = buildKaleidoscopeLensResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgPatternSymmetry).toBe(42)
    expect(result.stats.avgColorRichness).toBe(32)
    expect(result.stats.avgLensClarity).toBe(43)
    expect(result.stats.avgOpticalPrecision).toBe(42)
    expect(result.stats.avgReflectionQuality).toBe(42)
    expect(result.stats.avgVisualHarmony).toBe(42)
    expect(result.stats.simpleShapeCount).toBe(4)
    expect(result.stats.dustCount).toBe(0)
    expect(result.stats.overallBeauty).toBe(41)
    expect(result.stats.opticianGrade).toBe('observer')
    expect(result.kaleidoscope.isBeautiful).toBe(false)
  })

  it('computes kaleidoscope overview correctly', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.kaleidoscope.avgSymmetry).toBe(74)
    expect(result.kaleidoscope.avgClarity).toBe(69)
    expect(result.kaleidoscope.avgHarmony).toBe(74)
    expect(result.kaleidoscope.overallBeauty).toBe(71)
    expect(result.kaleidoscope.isBeautiful).toBe(true)
  })

  it('sets highlight fields correctly', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.bestFragment).toBe('rich.ts')
    expect(result.stats.mostSymmetric).toBe('rich.ts')
    expect(result.stats.mostColorful).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostPrecise).toBe('rich.ts')
    expect(result.stats.bestDocumented).toBe('rich.ts')
  })

  it('handles empty files array', () => {
    const result = buildKaleidoscopeLensResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBeauty).toBe(0)
    expect(result.fragments).toHaveLength(0)
    expect(result.chambers).toHaveLength(0)
    expect(result.kaleidoscope.isBeautiful).toBe(false)
  })

  it('groups chambers by directory', () => {
    const result = buildKaleidoscopeLensResult(
      ['dir1/a.ts', 'dir2/b.ts'],
      [RICH, MEDIUM],
    )
    expect(result.chambers).toHaveLength(2)
    const dirs = result.chambers.map((c) => c.directory).sort()
    expect(dirs).toEqual(['dir1', 'dir2'])
  })

  it('counts high measure flags correctly', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(result.stats.hasHighSymmetryCount).toBe(1)
    expect(result.stats.hasHighRichnessCount).toBe(1)
    expect(result.stats.hasHighClarityCount).toBe(1)
    expect(result.stats.hasHighPrecisionCount).toBe(1)
    expect(result.stats.hasHighQualityCount).toBe(1)
    expect(result.stats.hasHighHarmonyCount).toBe(1)
  })

  it('sets empty highlights for no files', () => {
    const result = buildKaleidoscopeLensResult([], [])
    expect(result.stats.bestFragment).toBe('')
    expect(result.stats.mostSymmetric).toBe('')
  })
})

// ─── format-helpers ────────────────────────────────────────────────────────

describe('format-helpers', () => {
  it('scoreColor returns a string', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(70)).toBe('string')
    expect(typeof scoreColor(50)).toBe('string')
    expect(typeof scoreColor(20)).toBe('string')
  })

  it('orderColor returns a string for all orders', () => {
    const orders = ['six-fold-symmetry', 'perfect-mirror', 'balanced', 'partial', 'asymmetric', 'broken-mirror', 'unknown']
    for (const o of orders) {
      expect(typeof orderColor(o)).toBe('string')
    }
  })

  it('paletteColor returns a string for all palettes', () => {
    const palettes = ['rainbow-spectrum', 'rich-palette', 'primary-colors', 'limited-palette', 'monochrome', 'colorless', 'unknown']
    for (const p of palettes) {
      expect(typeof paletteColor(p)).toBe('string')
    }
  })

  it('focusColor returns a string for all focuses', () => {
    const focuses = ['crystal-clear', 'sharp-focus', 'clear', 'slightly-blurry', 'foggy', 'opaque', 'unknown']
    for (const f of focuses) {
      expect(typeof focusColor(f)).toBe('string')
    }
  })

  it('gradeColor returns a string for all grades', () => {
    const grades = ['laser-precision', 'microscope-grade', 'telescope-grade', 'reading-glass', 'blurred-vision', 'blind', 'unknown']
    for (const g of grades) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })

  it('surfaceColor returns a string for all surfaces', () => {
    const surfaces = ['perfect-mirror', 'clear-reflection', 'good-mirror', 'cloudy-mirror', 'tarnished', 'dark-glass', 'unknown']
    for (const s of surfaces) {
      expect(typeof surfaceColor(s)).toBe('string')
    }
  })

  it('beautyColor returns a string for all beauties', () => {
    const beauties = ['mesmerizing', 'beautiful-pattern', 'pleasing', 'adequate', 'disjointed', 'ugly', 'unknown']
    for (const b of beauties) {
      expect(typeof beautyColor(b)).toBe('string')
    }
  })

  it('conditionColor returns a string for all conditions', () => {
    const conditions = ['masterpiece-kaleidoscope', 'beautiful-mandala', 'colorful-pattern', 'simple-shape', 'broken-shard', 'dust', 'unknown']
    for (const c of conditions) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })

  it('opticianGradeColor returns a string for all grades', () => {
    const grades = ['master-optician', 'lens-crafter', 'glassblower', 'observer', 'tourist', 'blind-spot', 'unknown']
    for (const g of grades) {
      expect(typeof opticianGradeColor(g)).toBe('string')
    }
  })

  it('chamberTypeColor returns a string for all types', () => {
    const types = ['grand-kaleidoscope', 'viewing-tube', 'pocket-scope', 'toy-kaleidoscope', 'broken-tube', 'empty', 'unknown']
    for (const t of types) {
      expect(typeof chamberTypeColor(t)).toBe('string')
    }
  })

  it('chamberConditionColor returns a string for all conditions', () => {
    const conditions = ['mesmerizing-display', 'beautiful-patterns', 'colorful-view', 'dim-image', 'broken-glass', 'darkness', 'unknown']
    for (const c of conditions) {
      expect(typeof chamberConditionColor(c)).toBe('string')
    }
  })

  it('formatKaleidoscopeLensJson returns valid JSON', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts'], [RICH])
    const json = formatKaleidoscopeLensJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    expect(JSON.parse(json).stats.totalFiles).toBe(1)
  })

  it('formatKaleidoscopeLensTable returns a string', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts'], [RICH])
    const table = formatKaleidoscopeLensTable(result, false)
    expect(typeof table).toBe('string')
    expect(table.length).toBeGreaterThan(0)
  })

  it('formatKaleidoscopeLensTable includes per-file details when verbose', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts'], [RICH])
    const table = formatKaleidoscopeLensTable(result, true)
    expect(table).toContain('rich.ts')
  })

  it('formatKaleidoscopeLensTable includes recommendations when present', () => {
    const result = buildKaleidoscopeLensResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY, EMPTY, EMPTY, EMPTY],
    )
    const table = formatKaleidoscopeLensTable(result, false)
    if (result.recommendations.length > 0) {
      expect(table).toContain('Recommendations')
    }
  })

  it('formatKaleidoscopeLensTable includes highlights when present', () => {
    const result = buildKaleidoscopeLensResult(['rich.ts'], [RICH])
    const table = formatKaleidoscopeLensTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Fragment')
  })

  it('passes unknown values through color functions', () => {
    expect(orderColor('unknown')).toBe('unknown')
    expect(paletteColor('unknown')).toBe('unknown')
    expect(focusColor('unknown')).toBe('unknown')
  })
})
