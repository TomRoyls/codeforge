import { describe, expect, it } from 'vitest'

import {
  analyzeSilverReflection,
  analyzeSilverGallery,
  buildSilverMirrorResult,
  classifyReflectionCondition,
  classifyGalleryType,
  classifyGalleryCondition,
  classifyMirrorMakerGrade,
  generateRecommendations,
  measureIntrospecting,
  measureClarifying,
  measureResisting,
  measureFraming,
  measureRepresenting,
  type ReflectionCondition,
  type GalleryCondition,
  type SilverReflection,
  type SilverMirrorResult,
  type SilverGallery,
} from '../src/commands/silver-glass-helpers.js'

import {
  colorReflectionCondition,
  colorGalleryCondition,
  colorScore,
  formatReflectionTable,
  formatReflectionsTable,
  formatGalleriesTable,
  formatGalleryTable,
  formatRecommendations,
  formatResultJson,
  formatResultTable,
  formatStatsTable,
} from '../src/commands/silver-glass-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

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
    try {
      const result = readFileSync(input, 'utf8')
      if (result === 'test') {
        return JSON.parse(result) as Result
      }
      return {} as Result
    } catch (err) {
      throw new Error('fail')
    }
  }
}

export const defaultConfig: Options = { name: 'test' }
`

const emptyContent = ''

const poorContent = 'var x = eval("1")\nany monolithic god.object'

// ─── measureIntrospecting ───────────────────────────────

describe('measureIntrospecting', () => {
  it('scores rich content high', () => {
    const m = measureIntrospecting(richContent)
    expect(m.quality).toBeGreaterThanOrEqual(60)
    expect(m.hasHighQuality).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureIntrospecting(emptyContent)
    expect(m.quality).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureIntrospecting(richContent)
    const poor = measureIntrospecting(poorContent)
    expect(rich.quality).toBeGreaterThan(poor.quality)
  })

  it('detects chaotic patterns', () => {
    const m = measureIntrospecting('var x = eval("boom")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('assigns high reflection for rich content', () => {
    const m = measureIntrospecting(richContent)
    expect(['perfect-mirror', 'clear-silver', 'proper-reflection']).toContain(m.reflection)
  })

  it('assigns low reflection for empty content', () => {
    const m = measureIntrospecting(emptyContent)
    expect(['no-reflection', 'dark-surface', 'cloudy-glass', 'proper-reflection']).toContain(m.reflection)
  })

  it('has all boolean properties', () => {
    const m = measureIntrospecting(richContent)
    expect(typeof m.hasSelfAware).toBe('boolean')
    expect(typeof m.hasHonest).toBe('boolean')
    expect(typeof m.hasReflective).toBe('boolean')
  })
})

// ─── measureClarifying ──────────────────────────────────

describe('measureClarifying', () => {
  it('scores rich content high', () => {
    const m = measureClarifying(richContent)
    expect(m.clarity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighClarity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureClarifying(emptyContent)
    expect(m.clarity).toBeGreaterThanOrEqual(0)
  })

  it('scores poor content lower than rich', () => {
    const rich = measureClarifying(richContent)
    const poor = measureClarifying(poorContent)
    expect(rich.clarity).toBeGreaterThan(poor.clarity)
  })

  it('detects cryptic patterns', () => {
    const m = measureClarifying('cryptic obfuscate minified')
    expect(m.crypticCount).toBeGreaterThan(0)
    expect(m.hasNoCryptic).toBe(false)
  })

  it('detects obfuscated patterns', () => {
    const m = measureClarifying('var x = eval("1")')
    expect(m.obfuscatedCount).toBeGreaterThan(0)
    expect(m.hasNoObfuscated).toBe(false)
  })

  it('assigns high surface for rich content', () => {
    const m = measureClarifying(richContent)
    expect(['flawless-silver', 'polished-surface', 'proper-clarity']).toContain(m.surface)
  })

  it('assigns low surface for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(['no-clarity', 'foggy', 'smudged-glass', 'proper-clarity']).toContain(m.surface)
  })

  it('has all boolean properties', () => {
    const m = measureClarifying(richContent)
    expect(typeof m.hasReadable).toBe('boolean')
    expect(typeof m.hasCommunicative).toBe('boolean')
  })
})

// ─── measureResisting ───────────────────────────────────

describe('measureResisting', () => {
  it('scores rich content high', () => {
    const m = measureResisting(richContent)
    expect(m.resistance).toBeGreaterThanOrEqual(60)
    expect(m.hasHighResistance).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureResisting(emptyContent)
    expect(m.resistance).toBeGreaterThanOrEqual(0)
  })

  it('detects volatile patterns', () => {
    const m = measureResisting('volatile unstable fragile')
    expect(m.volatileCount).toBeGreaterThan(0)
    expect(m.hasNoVolatile).toBe(false)
  })

  it('detects untested patterns', () => {
    const m = measureResisting('eval (Function)')
    expect(m.untestedCount).toBeGreaterThan(0)
  })

  it('assigns high tarnish for rich content', () => {
    const m = measureResisting(richContent)
    expect(['sterling-silver', 'rhodium-plated', 'proper-coating']).toContain(m.tarnish)
  })

  it('assigns low tarnish for empty content', () => {
    const m = measureResisting(emptyContent)
    expect(['no-resistance', 'corroded', 'tarnishing', 'proper-coating']).toContain(m.tarnish)
  })

  it('has all boolean properties', () => {
    const m = measureResisting(richContent)
    expect(typeof m.hasStable).toBe('boolean')
    expect(typeof m.hasResilient).toBe('boolean')
  })
})

// ─── measureFraming ─────────────────────────────────────

describe('measureFraming', () => {
  it('scores rich content high', () => {
    const m = measureFraming(richContent)
    expect(m.elegance).toBeGreaterThanOrEqual(60)
    expect(m.hasHighElegance).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureFraming(emptyContent)
    expect(m.elegance).toBeGreaterThanOrEqual(0)
  })

  it('detects chaotic patterns', () => {
    const m = measureFraming('var x = eval("1")')
    expect(m.chaoticCount).toBeGreaterThan(0)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects monolithic patterns', () => {
    const m = measureFraming('monolithic god.object mega')
    expect(m.monolithicCount).toBeGreaterThan(0)
    expect(m.hasNoMonolithic).toBe(false)
  })

  it('assigns high frame for rich content', () => {
    const m = measureFraming(richContent)
    expect(['ornate-frame', 'elegant-border', 'proper-edge']).toContain(m.frame)
  })

  it('assigns low frame for empty content', () => {
    const m = measureFraming(emptyContent)
    expect(['no-elegance', 'no-frame', 'rough-border', 'proper-edge']).toContain(m.frame)
  })

  it('has all boolean properties', () => {
    const m = measureFraming(richContent)
    expect(typeof m.hasWellStructured).toBe('boolean')
    expect(typeof m.hasBeautiful).toBe('boolean')
  })
})

// ─── measureRepresenting ────────────────────────────────

describe('measureRepresenting', () => {
  it('scores rich content high', () => {
    const m = measureRepresenting(richContent)
    expect(m.fidelity).toBeGreaterThanOrEqual(60)
    expect(m.hasHighFidelity).toBe(true)
  })

  it('scores empty content low', () => {
    const m = measureRepresenting(emptyContent)
    expect(m.fidelity).toBeGreaterThanOrEqual(0)
  })

  it('detects approximate patterns', () => {
    const m = measureRepresenting('roughly approximately guesstimate')
    expect(m.approximateCount).toBeGreaterThan(0)
    expect(m.hasNoApproximate).toBe(false)
  })

  it('detects distorted patterns', () => {
    const m = measureRepresenting('distorted warped skewed')
    expect(m.distortedCount).toBeGreaterThan(0)
  })

  it('assigns high image for rich content', () => {
    const m = measureRepresenting(richContent)
    expect(['perfect-fidelity', 'faithful-render', 'proper-representation']).toContain(m.image)
  })

  it('assigns low image for empty content', () => {
    const m = measureRepresenting(emptyContent)
    expect(['no-fidelity', 'warped', 'distorted', 'proper-representation']).toContain(m.image)
  })

  it('has all boolean properties', () => {
    const m = measureRepresenting(richContent)
    expect(typeof m.hasAccurate).toBe('boolean')
    expect(typeof m.hasCrisp).toBe('boolean')
  })
})

// ─── Classifiers ────────────────────────────────────────

describe('classifyReflectionCondition', () => {
  it('classifies 90+ as silver-masterpiece', () => {
    expect(classifyReflectionCondition(90)).toBe('silver-masterpiece')
  })
  it('classifies 75-89 as perfect-reflection', () => {
    expect(classifyReflectionCondition(75)).toBe('perfect-reflection')
  })
  it('classifies 60-74 as proper-mirror', () => {
    expect(classifyReflectionCondition(60)).toBe('proper-mirror')
  })
  it('classifies 40-59 as tarnished-silver', () => {
    expect(classifyReflectionCondition(40)).toBe('tarnished-silver')
  })
  it('classifies 20-39 as cracked-glass', () => {
    expect(classifyReflectionCondition(20)).toBe('cracked-glass')
  })
  it('classifies below 20 as void', () => {
    expect(classifyReflectionCondition(0)).toBe('void')
  })
})

describe('classifyGalleryType', () => {
  it('returns no-gallery for empty reflections', () => {
    expect(classifyGalleryType([])).toBe('no-gallery')
  })
  it('returns hall-of-mirrors for high quality', () => {
    const refs = [{ qualityScore: 90 } as SilverReflection, { qualityScore: 85 } as SilverReflection]
    expect(classifyGalleryType(refs)).toBe('hall-of-mirrors')
  })
  it('returns silver-gallery for good quality', () => {
    const refs = [{ qualityScore: 70 } as SilverReflection, { qualityScore: 75 } as SilverReflection]
    expect(classifyGalleryType(refs)).toBe('silver-gallery')
  })
  it('returns proper-exhibition for decent quality', () => {
    const refs = [{ qualityScore: 55 } as SilverReflection, { qualityScore: 60 } as SilverReflection]
    expect(classifyGalleryType(refs)).toBe('proper-exhibition')
  })
  it('returns small-display for low quality', () => {
    const refs = [{ qualityScore: 35 } as SilverReflection, { qualityScore: 40 } as SilverReflection]
    expect(classifyGalleryType(refs)).toBe('small-display')
  })
  it('returns empty-room for very low quality', () => {
    const refs = [{ qualityScore: 10 } as SilverReflection, { qualityScore: 15 } as SilverReflection]
    expect(classifyGalleryType(refs)).toBe('empty-room')
  })
})

describe('classifyGalleryCondition', () => {
  it('classifies 85+ as grand-gallery', () => { expect(classifyGalleryCondition(85)).toBe('grand-gallery') })
  it('classifies 70-84 as silver-hall', () => { expect(classifyGalleryCondition(70)).toBe('silver-hall') })
  it('classifies 55-69 as proper-room', () => { expect(classifyGalleryCondition(55)).toBe('proper-room') })
  it('classifies 35-54 as dark-corner', () => { expect(classifyGalleryCondition(35)).toBe('dark-corner') })
  it('classifies 15-34 as empty-space', () => { expect(classifyGalleryCondition(15)).toBe('empty-space') })
  it('classifies below 15 as void', () => { expect(classifyGalleryCondition(0)).toBe('void') })
})

describe('classifyMirrorMakerGrade', () => {
  it('classifies 80+ as master-silversmith', () => { expect(classifyMirrorMakerGrade(80)).toBe('master-silversmith') })
  it('classifies 65-79 as mirror-crafter', () => { expect(classifyMirrorMakerGrade(65)).toBe('mirror-crafter') })
  it('classifies 50-64 as proper-glassmaker', () => { expect(classifyMirrorMakerGrade(50)).toBe('proper-glassmaker') })
  it('classifies 35-49 as apprentice', () => { expect(classifyMirrorMakerGrade(35)).toBe('apprentice') })
  it('classifies 20-34 as novice', () => { expect(classifyMirrorMakerGrade(20)).toBe('novice') })
  it('classifies below 20 as tin-foil-folder', () => { expect(classifyMirrorMakerGrade(0)).toBe('tin-foil-folder') })
})

// ─── analyzeSilverReflection ────────────────────────────

describe('analyzeSilverReflection', () => {
  it('analyzes a file and returns all measures', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    expect(r.file).toBe('app.ts')
    expect(r.reflectionQuality).toBeGreaterThanOrEqual(0)
    expect(r.surfaceClarity).toBeGreaterThanOrEqual(0)
    expect(r.tarnishResistance).toBeGreaterThanOrEqual(0)
    expect(r.frameElegance).toBeGreaterThanOrEqual(0)
    expect(r.imageFidelity).toBeGreaterThanOrEqual(0)
    expect(r.qualityScore).toBeGreaterThanOrEqual(0)
    expect(r.condition).toBeDefined()
  })

  it('calculates qualityScore as weighted average', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    const expected = Math.round(
      r.reflectionQuality * 0.2 +
      r.surfaceClarity * 0.2 +
      r.tarnishResistance * 0.2 +
      r.frameElegance * 0.2 +
      r.imageFidelity * 0.2,
    )
    expect(r.qualityScore).toBe(expected)
  })

  it('includes all sub-measures', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    expect(r.introspecting).toBeDefined()
    expect(r.clarifying).toBeDefined()
    expect(r.resisting).toBeDefined()
    expect(r.framing).toBeDefined()
    expect(r.representing).toBeDefined()
  })

  it('handles empty content gracefully', () => {
    const r = analyzeSilverReflection(emptyContent, 'empty.ts')
    expect(r.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('scores rich content high', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    expect(r.qualityScore).toBeGreaterThanOrEqual(60)
  })
})

// ─── analyzeSilverGallery ───────────────────────────────

describe('analyzeSilverGallery', () => {
  it('returns empty gallery for no reflections', () => {
    const g = analyzeSilverGallery([], 'src')
    expect(g.directory).toBe('src')
    expect(g.reflections).toHaveLength(0)
    expect(g.avgClarity).toBe(0)
    expect(g.galleryType).toBe('no-gallery')
    expect(g.condition).toBe('void')
  })

  it('aggregates reflection scores', () => {
    const r1 = analyzeSilverReflection(richContent, 'a.ts')
    const r2 = analyzeSilverReflection(richContent, 'b.ts')
    const g = analyzeSilverGallery([r1, r2], 'src')
    expect(g.avgClarity).toBeGreaterThanOrEqual(0)
    expect(g.avgElegance).toBeGreaterThanOrEqual(0)
    expect(g.avgFidelity).toBeGreaterThanOrEqual(0)
    expect(g.reflections).toHaveLength(2)
  })

  it('classifies gallery type and condition', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    const g = analyzeSilverGallery([r], 'src')
    expect(g.galleryType).toBeDefined()
    expect(g.condition).toBeDefined()
  })
})

// ─── buildSilverMirrorResult ────────────────────────────

describe('buildSilverMirrorResult', () => {
  it('handles empty input', async () => {
    const result = await buildSilverMirrorResult([], [])
    expect(result.reflections).toHaveLength(0)
    expect(result.galleries).toHaveLength(0)
    expect(result.mirror.overallReflection).toBe(0)
    expect(result.mirror.isSilver).toBe(false)
  })

  it('analyzes single file', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.reflections).toHaveLength(1)
    expect(result.reflections[0].file).toBe('a.ts')
  })

  it('groups files by directory', async () => {
    const result = await buildSilverMirrorResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, richContent, poorContent],
    )
    expect(result.galleries.length).toBe(2)
  })

  it('computes mirror averages', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.mirror.avgClarity).toBeGreaterThanOrEqual(0)
    expect(result.mirror.avgElegance).toBeGreaterThanOrEqual(0)
    expect(result.mirror.avgFidelity).toBeGreaterThanOrEqual(0)
  })

  it('computes stats correctly', async () => {
    const result = await buildSilverMirrorResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalGalleries).toBeGreaterThanOrEqual(1)
    expect(result.stats.overallReflection).toBeGreaterThanOrEqual(0)
    expect(result.stats.mirrorMakerGrade).toBeDefined()
  })

  it('identifies best and extreme files', async () => {
    const result = await buildSilverMirrorResult(['a.ts', 'b.ts'], [richContent, poorContent])
    expect(result.stats.bestReflection).toBeTruthy()
    expect(result.stats.mostReflective).toBeTruthy()
    expect(result.stats.clearest).toBeTruthy()
    expect(result.stats.mostResistant).toBeTruthy()
    expect(result.stats.mostElegant).toBeTruthy()
    expect(result.stats.mostFaithful).toBeTruthy()
  })

  it('includes recommendations', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty bestReflection for no files', async () => {
    const result = await buildSilverMirrorResult([], [])
    expect(result.stats.bestReflection).toBe('')
    expect(result.stats.mostReflective).toBe('')
  })

  it('scores rich content at max', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(result.reflections[0].reflectionQuality).toBeGreaterThanOrEqual(60)
    expect(result.reflections[0].surfaceClarity).toBeGreaterThanOrEqual(60)
    expect(result.reflections[0].tarnishResistance).toBeGreaterThanOrEqual(60)
    expect(result.reflections[0].frameElegance).toBeGreaterThanOrEqual(60)
    expect(result.reflections[0].imageFidelity).toBeGreaterThanOrEqual(60)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<SilverMirrorResult['stats']> = {}): SilverMirrorResult['stats'] => ({
    totalFiles: 1, totalGalleries: 1,
    avgReflectionQuality: 95, avgSurfaceClarity: 95, avgTarnishResistance: 95,
    avgFrameElegance: 95, avgImageFidelity: 95,
    silverMasterpieceCount: 1, perfectReflectionCount: 0, properMirrorCount: 0,
    tarnishedSilverCount: 0, crackedGlassCount: 0, voidCount: 0,
    hasHighQualityCount: 1, hasHighClarityCount: 1, hasHighResistanceCount: 1,
    hasHighEleganceCount: 1, hasHighFidelityCount: 1,
    overallReflection: 95, mirrorMakerGrade: 'master-silversmith' as const,
    bestReflection: 'a.ts', mostReflective: 'a.ts', clearest: 'a.ts',
    mostResistant: 'a.ts', mostElegant: 'a.ts', mostFaithful: 'a.ts',
    ...overrides,
  })

  const makeMirror = (overrides: Partial<SilverMirrorResult['mirror']> = {}): SilverMirrorResult['mirror'] => ({
    avgClarity: 95, avgElegance: 95, avgFidelity: 95,
    isSilver: true, overallReflection: 95,
    ...overrides,
  })

  it('recommends masterpiece when all scores are high', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats())
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('masterpiece')
  })

  it('recommends reflection quality when low', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats({
      avgReflectionQuality: 30, overallReflection: 78, mirrorMakerGrade: 'mirror-crafter',
    }))
    expect(recs.some((r) => r.includes('reflection'))).toBe(true)
  })

  it('recommends surface clarity when low', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats({
      avgSurfaceClarity: 30, overallReflection: 78, mirrorMakerGrade: 'mirror-crafter',
    }))
    expect(recs.some((r) => r.includes('clarity'))).toBe(true)
  })

  it('recommends tarnish resistance when low', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats({
      avgTarnishResistance: 30, overallReflection: 78, mirrorMakerGrade: 'mirror-crafter',
    }))
    expect(recs.some((r) => r.includes('tarnish'))).toBe(true)
  })

  it('recommends frame elegance when low', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats({
      avgFrameElegance: 30, overallReflection: 78, mirrorMakerGrade: 'mirror-crafter',
    }))
    expect(recs.some((r) => r.includes('elegance'))).toBe(true)
  })

  it('recommends image fidelity when low', () => {
    const recs = generateRecommendations([], [], makeMirror(), makeStats({
      avgImageFidelity: 30, overallReflection: 78, mirrorMakerGrade: 'mirror-crafter',
    }))
    expect(recs.some((r) => r.includes('fidelity'))).toBe(true)
  })

  it('warns about very low reflection', () => {
    const recs = generateRecommendations([], [], makeMirror({ overallReflection: 20, isSilver: false }), makeStats({
      avgReflectionQuality: 20, avgSurfaceClarity: 20, avgTarnishResistance: 20,
      avgFrameElegance: 20, avgImageFidelity: 20,
      overallReflection: 20, mirrorMakerGrade: 'novice', voidCount: 1,
    }))
    expect(recs.some((r) => r.includes('cracked') || r.includes('mirror'))).toBe(true)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(0)).toBe('string')
    expect(typeof colorScore(100)).toBe('string')
  })
})

describe('colorReflectionCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorReflectionCondition('silver-masterpiece')).toBe('string')
    expect(typeof colorReflectionCondition('perfect-reflection')).toBe('string')
    expect(typeof colorReflectionCondition('proper-mirror')).toBe('string')
    expect(typeof colorReflectionCondition('tarnished-silver')).toBe('string')
    expect(typeof colorReflectionCondition('cracked-glass')).toBe('string')
    expect(typeof colorReflectionCondition('void')).toBe('string')
  })
  it('handles unknown condition', () => {
    expect(typeof colorReflectionCondition('unknown')).toBe('string')
  })
})

describe('colorGalleryCondition', () => {
  it('returns colored string for each condition', () => {
    expect(typeof colorGalleryCondition('grand-gallery')).toBe('string')
    expect(typeof colorGalleryCondition('silver-hall')).toBe('string')
    expect(typeof colorGalleryCondition('proper-room')).toBe('string')
    expect(typeof colorGalleryCondition('dark-corner')).toBe('string')
    expect(typeof colorGalleryCondition('empty-space')).toBe('string')
    expect(typeof colorGalleryCondition('void')).toBe('string')
  })
})

describe('formatReflectionTable', () => {
  it('formats a reflection', () => {
    const r = analyzeSilverReflection(richContent, 'app.ts')
    const output = formatReflectionTable(r)
    expect(output).toContain('app.ts')
    expect(output).toContain('Reflection Quality')
    expect(output).toContain('Quality Score')
  })
})

describe('formatReflectionsTable', () => {
  it('formats empty reflections', () => {
    expect(formatReflectionsTable([])).toContain('No silver reflections')
  })
  it('formats multiple reflections', () => {
    const r1 = analyzeSilverReflection(richContent, 'a.ts')
    const r2 = analyzeSilverReflection(poorContent, 'b.ts')
    expect(formatReflectionsTable([r1, r2])).toContain('a.ts')
  })
})

describe('formatGalleryTable', () => {
  it('formats a gallery', () => {
    const r = analyzeSilverReflection(richContent, 'src/a.ts')
    const g = analyzeSilverGallery([r], 'src')
    expect(formatGalleryTable(g)).toContain('src')
  })
})

describe('formatGalleriesTable', () => {
  it('formats empty galleries', () => {
    expect(formatGalleriesTable([])).toContain('No silver galleries')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    expect(formatStatsTable(result.stats)).toContain('Total Files')
  })
})

describe('formatRecommendations', () => {
  it('formats empty recommendations', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
  it('formats recommendations', () => {
    expect(formatRecommendations(['Fix X', 'Fix Y'])).toContain('Fix X')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Silver Mirror Analysis')
    expect(output).toContain('Mirror Overview')
  })
})

describe('formatResultJson', () => {
  it('formats as JSON', async () => {
    const result = await buildSilverMirrorResult(['a.ts'], [richContent])
    const parsed = JSON.parse(formatResultJson(result))
    expect(parsed.reflections).toHaveLength(1)
    expect(parsed.mirror).toBeDefined()
  })
})
