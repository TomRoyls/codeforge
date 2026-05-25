import { describe, it, expect } from 'vitest'
import {
  measureReflecting,
  measurePolishing,
  measureResisting,
  measureImaging,
  measureFraming,
  classifyMirrorCondition,
  classifyGalleryType,
  classifyCuratorGrade,
  classifyGalleryCondition,
  analyzeMirrorReflection,
  analyzeMirrorGallery,
  buildSilverMirrorResult,
  generateRecommendations,
} from '../src/commands/silver-mirror-helpers.js'
import {
  colorScore,
  colorGrade,
  formatReflectionTable,
  formatReflectionsTable,
  formatGalleryTable,
  formatGalleriesTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/silver-mirror-format-helpers.js'

// ─── Test Fixtures ──────────────────────────────────────────────────

const minimalContent = 'const x = 1'

const richContent = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/** Documentation */
export interface Config {
  readonly name: string
  private?: boolean
}

export type Options = Record<string, unknown>

export class Analyzer<T> {
  async analyze(input: string): Promise<Result> {
    const result = readFileSync(input, 'utf8')
    if (result === 'test') {
      return JSON.parse(result) as Result
    }
    return {} as Result
  }
}

export const defaultConfig: Options = { name: 'test' }
`

// ─── measureReflecting ─────────────────────────────────────────────

describe('measureReflecting', () => {
  it('returns 0 for empty content', () => {
    const m = measureReflecting('')
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('broken-glass')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureReflecting(minimalContent)
    expect(m.quality).toBe(0)
    expect(m.grade).toBe('broken-glass')
    expect(m.hasSelfAware).toBe(false)
    expect(m.hasNoBlind).toBe(true)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.blindCount).toBe(0)
    expect(m.opaqueCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureReflecting(richContent)
    expect(m.quality).toBe(100)
    expect(m.grade).toBe('perfect-reflection')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasSelfAware).toBe(true)
    expect(m.hasIntrospective).toBe(true)
    expect(m.hasReflective).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasLucid).toBe(true)
  })

  it('detects blind var usage', () => {
    const m = measureReflecting('var x = 1')
    expect(m.blindCount).toBe(1)
    expect(m.hasNoBlind).toBe(false)
  })

  it('detects opaque any usage', () => {
    const m = measureReflecting('const x: any = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })

  it('detects eval as hidden', () => {
    const m = measureReflecting('eval("1")')
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects debugger as concealing', () => {
    const m = measureReflecting('debugger')
    expect(m.hasNoConcealing).toBe(false)
  })
})

// ─── measurePolishing ──────────────────────────────────────────────

describe('measurePolishing', () => {
  it('returns 0 for empty content', () => {
    const m = measurePolishing('')
    expect(m.quality).toBe(0)
    expect(m.surface).toBe('raw-metal')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePolishing(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.surface).toBe('raw-metal')
    expect(m.hasRefined).toBe(false)
    expect(m.hasNoRough).toBe(true)
    expect(m.hasNoCoarse).toBe(true)
    expect(m.roughCount).toBe(0)
    expect(m.coarseCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePolishing(richContent)
    expect(m.quality).toBe(100)
    expect(m.surface).toBe('perfect-silver')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasRefined).toBe(true)
    expect(m.hasPolished).toBe(true)
    expect(m.hasSmooth).toBe(true)
    expect(m.hasGlossy).toBe(true)
    expect(m.hasFinished).toBe(true)
    expect(m.hasElegant).toBe(true)
  })

  it('detects rough var usage', () => {
    const m = measurePolishing('var x = 1')
    expect(m.roughCount).toBe(1)
    expect(m.hasNoRough).toBe(false)
  })

  it('detects coarse any usage', () => {
    const m = measurePolishing('const x: any = 1')
    expect(m.coarseCount).toBe(1)
    expect(m.hasNoCoarse).toBe(false)
  })
})

// ─── measureResisting ──────────────────────────────────────────────

describe('measureResisting', () => {
  it('returns 0 for empty content', () => {
    const m = measureResisting('')
    expect(m.resistance).toBe(0)
    expect(m.tarnish).toBe('blackened')
    expect(m.hasHighResistance).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureResisting(minimalContent)
    expect(m.resistance).toBe(8)
    expect(m.tarnish).toBe('blackened')
    expect(m.hasAgingWell).toBe(false)
    expect(m.hasNoDegrading).toBe(true)
    expect(m.hasNoDeteriorating).toBe(true)
    expect(m.degradingCount).toBe(0)
    expect(m.deterioratingCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBe(100)
    expect(m.tarnish).toBe('anti-tarnish')
    expect(m.hasHighResistance).toBe(true)
    expect(m.hasDurable).toBe(true)
    expect(m.hasResilient).toBe(true)
    expect(m.hasMaintained).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasEnduring).toBe(true)
  })

  it('detects degrading var usage', () => {
    const m = measureResisting('var x = 1')
    expect(m.degradingCount).toBe(1)
    expect(m.hasNoDegrading).toBe(false)
  })

  it('detects deteriorating any usage', () => {
    const m = measureResisting('const x: any = 1')
    expect(m.deterioratingCount).toBe(1)
    expect(m.hasNoDeteriorating).toBe(false)
  })
})

// ─── measureImaging ────────────────────────────────────────────────

describe('measureImaging', () => {
  it('returns 0 for empty content', () => {
    const m = measureImaging('')
    expect(m.accuracy).toBe(0)
    expect(m.image).toBe('no-image')
    expect(m.hasHighAccuracy).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureImaging(minimalContent)
    expect(m.accuracy).toBe(0)
    expect(m.image).toBe('no-image')
    expect(m.hasCorrect).toBe(false)
    expect(m.hasNoDistorted).toBe(true)
    expect(m.hasNoFalse).toBe(true)
    expect(m.distortedCount).toBe(0)
    expect(m.falseCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureImaging(richContent)
    expect(m.accuracy).toBe(100)
    expect(m.image).toBe('true-reflection')
    expect(m.hasHighAccuracy).toBe(true)
    expect(m.hasCorrect).toBe(true)
    expect(m.hasPrecise).toBe(true)
    expect(m.hasTrue).toBe(true)
    expect(m.hasFaithful).toBe(true)
    expect(m.hasExact).toBe(true)
    expect(m.hasReliable).toBe(true)
  })

  it('detects distorted var usage', () => {
    const m = measureImaging('var x = 1')
    expect(m.distortedCount).toBe(1)
    expect(m.hasNoDistorted).toBe(false)
  })

  it('detects false any usage', () => {
    const m = measureImaging('const x: any = 1')
    expect(m.falseCount).toBe(1)
    expect(m.hasNoFalse).toBe(false)
  })
})

// ─── measureFraming ────────────────────────────────────────────────

describe('measureFraming', () => {
  it('returns 0 for empty content', () => {
    const m = measureFraming('')
    expect(m.strength).toBe(0)
    expect(m.frame).toBe('no-frame')
    expect(m.hasHighStrength).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureFraming(minimalContent)
    expect(m.strength).toBe(0)
    expect(m.frame).toBe('no-frame')
    expect(m.hasSupported).toBe(false)
    expect(m.hasNoUnsupported).toBe(true)
    expect(m.hasNoUnframed).toBe(true)
    expect(m.unsupportedCount).toBe(0)
    expect(m.unframedCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureFraming(richContent)
    expect(m.strength).toBe(100)
    expect(m.frame).toBe('ornate-gold')
    expect(m.hasHighStrength).toBe(true)
    expect(m.hasSupported).toBe(true)
    expect(m.hasReinforced).toBe(true)
    expect(m.hasFramed).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasContained).toBe(true)
    expect(m.hasAnchored).toBe(true)
  })

  it('detects unsupported var usage', () => {
    const m = measureFraming('var x = 1')
    expect(m.unsupportedCount).toBe(1)
    expect(m.hasNoUnsupported).toBe(false)
  })

  it('detects unframed any usage', () => {
    const m = measureFraming('const x: any = 1')
    expect(m.unframedCount).toBe(1)
    expect(m.hasNoUnframed).toBe(false)
  })
})

// ─── classifyMirrorCondition ───────────────────────────────────────

describe('classifyMirrorCondition', () => {
  it('classifies perfect-mirror for 85+', () => {
    expect(classifyMirrorCondition(85)).toBe('perfect-mirror')
    expect(classifyMirrorCondition(100)).toBe('perfect-mirror')
  })

  it('classifies clear-glass for 70-84', () => {
    expect(classifyMirrorCondition(70)).toBe('clear-glass')
    expect(classifyMirrorCondition(84)).toBe('clear-glass')
  })

  it('classifies proper-reflector for 55-69', () => {
    expect(classifyMirrorCondition(55)).toBe('proper-reflector')
    expect(classifyMirrorCondition(69)).toBe('proper-reflector')
  })

  it('classifies foggy-mirror for 40-54', () => {
    expect(classifyMirrorCondition(40)).toBe('foggy-mirror')
    expect(classifyMirrorCondition(54)).toBe('foggy-mirror')
  })

  it('classifies cracked-mirror for 25-39', () => {
    expect(classifyMirrorCondition(25)).toBe('cracked-mirror')
    expect(classifyMirrorCondition(39)).toBe('cracked-mirror')
  })

  it('classifies shattered for 0-24', () => {
    expect(classifyMirrorCondition(0)).toBe('shattered')
    expect(classifyMirrorCondition(24)).toBe('shattered')
  })
})

// ─── classifyGalleryType ───────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('returns no-mirror for empty reflections', () => {
    expect(classifyGalleryType([])).toBe('no-mirror')
  })

  it('classifies hall-of-mirrors for high avg + high perfect ratio', () => {
    const reflections = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeMirrorReflection(richContent, `f${i}.ts`),
    }))
    expect(classifyGalleryType(reflections)).toBe('hall-of-mirrors')
  })

  it('classifies no-mirror for low scores', () => {
    const reflections = [analyzeMirrorReflection('', 'a.ts')]
    expect(classifyGalleryType(reflections)).toBe('no-mirror')
  })

  it('classifies proper-gallery for mid-high scores', () => {
    const reflections = Array.from({ length: 3 }, () => ({
      ...analyzeMirrorReflection(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'clear-glass' as const,
    }))
    expect(classifyGalleryType(reflections)).toBe('proper-gallery')
  })

  it('classifies vanity-room for mid scores', () => {
    const reflections = Array.from({ length: 3 }, () => ({
      ...analyzeMirrorReflection(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-reflector' as const,
    }))
    expect(classifyGalleryType(reflections)).toBe('vanity-room')
  })

  it('classifies shard for very low scores', () => {
    const reflections = Array.from({ length: 3 }, () => ({
      ...analyzeMirrorReflection(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'shattered' as const,
    }))
    expect(classifyGalleryType(reflections)).toBe('shard')
  })
})

// ─── classifyCuratorGrade ──────────────────────────────────────────

describe('classifyCuratorGrade', () => {
  it('classifies master-curator for 80+', () => {
    expect(classifyCuratorGrade(80)).toBe('master-curator')
    expect(classifyCuratorGrade(100)).toBe('master-curator')
  })

  it('classifies mirror-expert for 65-79', () => {
    expect(classifyCuratorGrade(65)).toBe('mirror-expert')
    expect(classifyCuratorGrade(79)).toBe('mirror-expert')
  })

  it('classifies gallery-owner for 50-64', () => {
    expect(classifyCuratorGrade(50)).toBe('gallery-owner')
    expect(classifyCuratorGrade(64)).toBe('gallery-owner')
  })

  it('classifies antique-dealer for 35-49', () => {
    expect(classifyCuratorGrade(35)).toBe('antique-dealer')
    expect(classifyCuratorGrade(49)).toBe('antique-dealer')
  })

  it('classifies flea-market for 20-34', () => {
    expect(classifyCuratorGrade(20)).toBe('flea-market')
    expect(classifyCuratorGrade(34)).toBe('flea-market')
  })

  it('classifies scrap-collector for 0-19', () => {
    expect(classifyCuratorGrade(0)).toBe('scrap-collector')
    expect(classifyCuratorGrade(19)).toBe('scrap-collector')
  })
})

// ─── classifyGalleryCondition ──────────────────────────────────────

describe('classifyGalleryCondition', () => {
  it('classifies crystal-gallery for 75+', () => {
    expect(classifyGalleryCondition(75)).toBe('crystal-gallery')
  })

  it('classifies bright-hall for 60-74', () => {
    expect(classifyGalleryCondition(60)).toBe('bright-hall')
  })

  it('classifies decent-room for 45-59', () => {
    expect(classifyGalleryCondition(45)).toBe('decent-room')
  })

  it('classifies dim-corridor for 30-44', () => {
    expect(classifyGalleryCondition(30)).toBe('dim-corridor')
  })

  it('classifies dark-room for 15-29', () => {
    expect(classifyGalleryCondition(15)).toBe('dark-room')
  })

  it('classifies boarded-up for 0-14', () => {
    expect(classifyGalleryCondition(0)).toBe('boarded-up')
  })
})

// ─── analyzeMirrorReflection ───────────────────────────────────────

describe('analyzeMirrorReflection', () => {
  it('analyzes minimal content', () => {
    const reflection = analyzeMirrorReflection(minimalContent, 'minimal.ts')
    expect(reflection.file).toBe('minimal.ts')
    expect(reflection.reflectivity).toBe(0)
    expect(reflection.surfaceQuality).toBe(8)
    expect(reflection.tarnishResistance).toBe(8)
    expect(reflection.imageAccuracy).toBe(0)
    expect(reflection.frameStrength).toBe(0)
    expect(reflection.qualityScore).toBe(3)
    expect(reflection.condition).toBe('shattered')
    expect(reflection.reflecting.grade).toBe('broken-glass')
    expect(reflection.polishing.surface).toBe('raw-metal')
    expect(reflection.resisting.tarnish).toBe('blackened')
    expect(reflection.imaging.image).toBe('no-image')
    expect(reflection.framing.frame).toBe('no-frame')
    expect(reflection.imaging.image).toBe('no-image')
    expect(reflection.framing.frame).toBe('no-frame')
  })

  it('analyzes rich content', () => {
    const reflection = analyzeMirrorReflection(richContent, 'rich.ts')
    expect(reflection.file).toBe('rich.ts')
    expect(reflection.reflectivity).toBe(100)
    expect(reflection.surfaceQuality).toBe(100)
    expect(reflection.tarnishResistance).toBe(100)
    expect(reflection.imageAccuracy).toBe(100)
    expect(reflection.frameStrength).toBe(100)
    expect(reflection.qualityScore).toBe(100)
    expect(reflection.condition).toBe('perfect-mirror')
    expect(reflection.reflecting.grade).toBe('perfect-reflection')
    expect(reflection.polishing.surface).toBe('perfect-silver')
    expect(reflection.resisting.tarnish).toBe('anti-tarnish')
    expect(reflection.imaging.image).toBe('true-reflection')
    expect(reflection.framing.frame).toBe('ornate-gold')
  })

  it('computes qualityScore as weighted average', () => {
    const reflection = analyzeMirrorReflection('export const x = 1', 'mid.ts')
    const expected = Math.round(
      reflection.reflectivity * 0.2 +
      reflection.surfaceQuality * 0.2 +
      reflection.tarnishResistance * 0.2 +
      reflection.imageAccuracy * 0.2 +
      reflection.frameStrength * 0.2,
    )
    expect(reflection.qualityScore).toBe(expected)
  })
})

// ─── analyzeMirrorGallery ──────────────────────────────────────────

describe('analyzeMirrorGallery', () => {
  it('returns empty gallery for empty reflections', () => {
    const gallery = analyzeMirrorGallery([], 'empty-dir')
    expect(gallery.directory).toBe('empty-dir')
    expect(gallery.reflections).toHaveLength(0)
    expect(gallery.avgReflectivity).toBe(0)
    expect(gallery.galleryType).toBe('no-mirror')
    expect(gallery.condition).toBe('boarded-up')
  })

  it('analyzes gallery with rich reflections', () => {
    const reflections = [
      analyzeMirrorReflection(richContent, 'dir/a.ts'),
      analyzeMirrorReflection(richContent, 'dir/b.ts'),
    ]
    const gallery = analyzeMirrorGallery(reflections, 'dir')
    expect(gallery.avgReflectivity).toBe(100)
    expect(gallery.perfectMirrorCount).toBe(2)
    expect(gallery.shatteredCount).toBe(0)
    expect(gallery.galleryType).toBe('hall-of-mirrors')
  })

  it('analyzes gallery with mixed reflections', () => {
    const reflections = [
      analyzeMirrorReflection(richContent, 'dir/a.ts'),
      analyzeMirrorReflection(minimalContent, 'dir/b.ts'),
    ]
    const gallery = analyzeMirrorGallery(reflections, 'dir')
    expect(gallery.perfectMirrorCount).toBe(1)
    expect(gallery.shatteredCount).toBe(1)
  })
})

// ─── buildSilverMirrorResult ───────────────────────────────────────

describe('buildSilverMirrorResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildSilverMirrorResult([], [])
    expect(result.reflections).toHaveLength(0)
    expect(result.galleries).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallClarity).toBe(0)
    expect(result.stats.curatorGrade).toBe('scrap-collector')
    expect(result.mansion.isClear).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildSilverMirrorResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.reflections).toHaveLength(2)
    expect(result.galleries).toHaveLength(1)
    expect(result.stats.avgReflectivity).toBe(100)
    expect(result.stats.avgSurfaceQuality).toBe(100)
    expect(result.stats.avgTarnishResistance).toBe(100)
    expect(result.stats.avgImageAccuracy).toBe(100)
    expect(result.stats.avgFrameStrength).toBe(100)
    expect(result.stats.perfectMirrorCount).toBe(2)
    expect(result.stats.shatteredCount).toBe(0)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighPolishCount).toBe(2)
    expect(result.stats.hasHighResistanceCount).toBe(2)
    expect(result.stats.hasHighAccuracyCount).toBe(2)
    expect(result.stats.hasHighStrengthCount).toBe(2)
    expect(result.stats.overallClarity).toBe(100)
    expect(result.stats.curatorGrade).toBe('master-curator')
    expect(result.mansion.isClear).toBe(true)
    expect(result.stats.bestReflection).toBeTruthy()
    expect(result.stats.mostReflective).toBeTruthy()
    expect(result.stats.bestPolished).toBeTruthy()
    expect(result.stats.mostTarnishResistant).toBeTruthy()
    expect(result.stats.mostAccurate).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildSilverMirrorResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.galleries).toHaveLength(2)
    const dirs = result.galleries.map(g => g.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall clarity correctly', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    expect(result.mansion.overallClarity).toBe(Math.round((0 + 8 + 0) / 3))
  })

  it('sets isClear when avgReflectivity >= 60', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.mansion.isClear).toBe(true)
  })

  it('sets isClear false when avgReflectivity < 60', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    expect(result.mansion.isClear).toBe(false)
  })

  it('picks best reflection by qualityScore', async () => {
    const result = await buildSilverMirrorResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestReflection).toBe('high.ts')
    expect(result.stats.mostReflective).toBe('high.ts')
    expect(result.stats.bestPolished).toBe('high.ts')
    expect(result.stats.mostTarnishResistant).toBe('high.ts')
    expect(result.stats.mostAccurate).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildSilverMirrorResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.perfectMirrorCount).toBe(1)
    expect(result.stats.shatteredCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your silver mirror collection is flawless! Every reflection is perfect, every surface gleams with clarity',
    ])
  })

  it('recommends improving reflectivity when low', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('reflectivity'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving surface quality when low', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('surface quality'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving tarnish resistance when low', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('tarnish resistance'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving image accuracy when low', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('image accuracy'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving frame strength when low', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('frame'))
    expect(rec).toBeTruthy()
  })

  it('warns about shattered files', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('shattered'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall clarity', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall mirror clarity'))
    expect(rec).toBeTruthy()
  })

  it('lists specific shattered files to repair', async () => {
    const result = await buildSilverMirrorResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Repair these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all galleries are shards/no-mirror', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('shards or empty'))
    expect(rec).toBeTruthy()
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for score 90', () => {
    expect(typeof colorScore(90)).toBe('string')
  })

  it('returns a string for score 50', () => {
    expect(typeof colorScore(50)).toBe('string')
  })

  it('returns a string for score 10', () => {
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for perfect-mirror', () => {
    expect(typeof colorGrade('perfect-mirror')).toBe('string')
  })

  it('returns a string for shattered', () => {
    expect(typeof colorGrade('shattered')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatReflectionTable', () => {
  it('formats a reflection', () => {
    const reflection = analyzeMirrorReflection(richContent, 'test.ts')
    const output = formatReflectionTable(reflection)
    expect(output).toContain('test.ts')
    expect(output).toContain('Reflectivity')
    expect(output).toContain('Surface Quality')
    expect(output).toContain('Tarnish Resistance')
    expect(output).toContain('Image Accuracy')
    expect(output).toContain('Frame Strength')
  })
})

describe('formatReflectionsTable', () => {
  it('handles empty reflections', () => {
    const output = formatReflectionsTable([])
    expect(output).toContain('No mirror reflections')
  })

  it('formats multiple reflections', () => {
    const reflections = [
      analyzeMirrorReflection(richContent, 'a.ts'),
      analyzeMirrorReflection(minimalContent, 'b.ts'),
    ]
    const output = formatReflectionsTable(reflections)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatGalleryTable', () => {
  it('formats a gallery', () => {
    const reflections = [analyzeMirrorReflection(richContent, 'dir/a.ts')]
    const gallery = analyzeMirrorGallery(reflections, 'dir')
    const output = formatGalleryTable(gallery)
    expect(output).toContain('dir')
    expect(output).toContain('Gallery')
  })
})

describe('formatGalleriesTable', () => {
  it('handles empty galleries', () => {
    const output = formatGalleriesTable([])
    expect(output).toContain('No mirror galleries')
  })

  it('formats multiple galleries', () => {
    const reflections = [analyzeMirrorReflection(richContent, 'src/a.ts')]
    const galleries = [analyzeMirrorGallery(reflections, 'src')]
    const output = formatGalleriesTable(galleries)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Silver Mirror Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Curator Grade')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => {
    const output = formatRecommendations([])
    expect(output).toContain('No recommendations')
  })

  it('formats recommendations', () => {
    const output = formatRecommendations(['Fix X', 'Improve Y'])
    expect(output).toContain('Fix X')
    expect(output).toContain('Improve Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Silver Mirror Reflection Analysis')
    expect(output).toContain('Mirror Gallery Analysis')
    expect(output).toContain('Silver Mirror Statistics')
    expect(output).toContain('Mansion')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.reflections).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.mansion.isClear).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const reflection = analyzeMirrorReflection('   \n\t  ', 'blank.ts')
    expect(reflection.reflectivity).toBe(0)
    expect(reflection.qualityScore).toBe(0)
    expect(reflection.condition).toBe('shattered')
  })

  it('handles content with only comments', () => {
    const reflection = analyzeMirrorReflection('// just a comment\n/* block */', 'comment.ts')
    expect(reflection.reflectivity).toBeGreaterThanOrEqual(0)
    expect(reflection.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildSilverMirrorResult(['big.ts'], [longContent])
    expect(result.reflections).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildSilverMirrorResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.perfectMirrorCount).toBe(50)
  })

  it('handles single file gallery', async () => {
    const result = await buildSilverMirrorResult(['single.ts'], [richContent])
    expect(result.galleries).toHaveLength(1)
    expect(result.galleries[0]!.reflections).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const reflection = analyzeMirrorReflection(richContent, 'cap.ts')
    expect(reflection.qualityScore).toBeLessThanOrEqual(100)
    expect(reflection.reflectivity).toBeLessThanOrEqual(100)
    expect(reflection.surfaceQuality).toBeLessThanOrEqual(100)
    expect(reflection.tarnishResistance).toBeLessThanOrEqual(100)
    expect(reflection.imageAccuracy).toBeLessThanOrEqual(100)
    expect(reflection.frameStrength).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildSilverMirrorResult([], [])
    const r2 = await buildSilverMirrorResult(['a.ts'], [richContent])
    const r3 = await buildSilverMirrorResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
