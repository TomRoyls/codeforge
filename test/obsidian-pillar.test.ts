import { describe, expect, it } from 'vitest'

import {
  measureCompressive,
  measureVolcanic,
  measureDark,
  measureAlignment,
  measureFoundation,
  measureSupport,
  classifySegmentCondition,
  analyzePillarSegment,
  classifyGalleryType,
  analyzePillarGallery,
  classifyArchitectGrade,
  generateRecommendations,
  buildObsidianPillarResult,
} from '../src/commands/obsidian-pillar-helpers.js'
import {
  scoreColor,
  gradeColor,
  recoveryColor,
  clarityQualityColor,
  precisionColor,
  depthColor,
  ratingColor,
  conditionColor,
  architectGradeColor,
  galleryTypeColor,
  galleryConditionColor,
  formatObsidianPillarJson,
  formatObsidianPillarTable,
} from '../src/commands/obsidian-pillar-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH_CONTENT = `export interface User { id: number; name: string }
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

const MEDIUM_CONTENT = `function hello(name) {
  console.log('hello', name)
  return name
}
`

const EMPTY_CONTENT = ''

// ─── measureCompressive ────────────────────────────────────────────────────

describe('measureCompressive', () => {
  it('returns high strength for rich content', () => {
    const result = measureCompressive(RICH_CONTENT)
    expect(result.strength).toBe(75)
    expect(result.grade).toBe('obsidian-strong')
  })

  it('returns medium strength for simple content', () => {
    const result = measureCompressive(MEDIUM_CONTENT)
    expect(result.strength).toBe(33)
    expect(result.grade).toBe('chalk-weak')
  })

  it('returns zero for empty content', () => {
    const result = measureCompressive(EMPTY_CONTENT)
    expect(result.strength).toBe(0)
    expect(result.grade).toBe('crumbling')
  })

  it('detects types', () => {
    const result = measureCompressive('export type Config = { debug: boolean }')
    expect(result.strength).toBeGreaterThanOrEqual(35)
  })

  it('detects interfaces', () => {
    const result = measureCompressive('export interface Options { verbose: boolean }')
    expect(result.strength).toBeGreaterThanOrEqual(35)
  })

  it('counts stress concentration from any/eval', () => {
    const result = measureCompressive('const x: any = eval("1")')
    expect(result.stressConcentrationCount).toBeGreaterThanOrEqual(1)
  })

  it('counts crushing from console.log/debugger', () => {
    const result = measureCompressive('console.log("x"); debugger;')
    expect(result.crushingCount).toBeGreaterThanOrEqual(1)
  })

  it('sets hasReinforced for private/readonly', () => {
    const result = measureCompressive(RICH_CONTENT)
    expect(result.hasReinforced).toBe(true)
  })
})

// ─── measureVolcanic ────────────────────────────────────────────────────────

describe('measureVolcanic', () => {
  it('returns resilience for rich content', () => {
    const result = measureVolcanic(RICH_CONTENT)
    expect(result.resilience).toBe(49)
    expect(result.recovery).toBe('slow-cooling')
  })

  it('returns low resilience for simple content', () => {
    const result = measureVolcanic(MEDIUM_CONTENT)
    expect(result.resilience).toBe(19)
    expect(result.recovery).toBe('shattered')
  })

  it('returns zero for empty content', () => {
    const result = measureVolcanic(EMPTY_CONTENT)
    expect(result.resilience).toBe(0)
    expect(result.recovery).toBe('shattered')
  })

  it('detects try/catch', () => {
    const result = measureVolcanic('try { x() } catch(e) {}')
    expect(result.hasErrorRecovery).toBe(true)
  })

  it('detects finally for proper cooling', () => {
    const result = measureVolcanic('try { x() } catch(e) {} finally { cleanup() }')
    expect(result.hasProperCooling).toBe(true)
  })

  it('detects nullish coalescing for graceful degradation', () => {
    const result = measureVolcanic('const x = a ?? b')
    expect(result.hasGracefulDegradation).toBe(true)
  })
})

// ─── measureDark ────────────────────────────────────────────────────────────

describe('measureDark', () => {
  it('returns high clarity for rich content', () => {
    const result = measureDark(RICH_CONTENT)
    expect(result.clarity).toBe(89)
    expect(result.quality).toBe('starlit-clarity')
  })

  it('returns low clarity for simple content', () => {
    const result = measureDark(MEDIUM_CONTENT)
    expect(result.clarity).toBe(29)
    expect(result.quality).toBe('pitch-black')
  })

  it('returns near zero for empty content', () => {
    const result = measureDark(EMPTY_CONTENT)
    expect(result.clarity).toBe(3)
    expect(result.quality).toBe('pitch-black')
  })

  it('detects JSDoc comments', () => {
    const result = measureDark('/** docs */\nexport function x() {}')
    expect(result.clarity).toBeGreaterThanOrEqual(40)
  })

  it('detects type annotations', () => {
    const result = measureDark('function go(x: number): string { return "a" }')
    expect(result.clarity).toBeGreaterThanOrEqual(35)
  })

  it('counts obfuscation from any/eval', () => {
    const result = measureDark('const x: any = eval("1")')
    expect(result.obfuscationCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── measureAlignment ───────────────────────────────────────────────────────

describe('measureAlignment', () => {
  it('returns high level for rich content', () => {
    const result = measureAlignment(RICH_CONTENT)
    expect(result.level).toBe(76)
    expect(result.precision).toBe('plumb-perfect')
  })

  it('returns medium level for simple content', () => {
    const result = measureAlignment(MEDIUM_CONTENT)
    expect(result.level).toBe(45)
    expect(result.precision).toBe('mostly-straight')
  })

  it('returns low level for empty content', () => {
    const result = measureAlignment(EMPTY_CONTENT)
    expect(result.level).toBe(24)
    expect(result.precision).toBe('crooked')
  })

  it('detects exports and imports', () => {
    const result = measureAlignment("import { x } from 'y'\nexport const z = x")
    expect(result.level).toBeGreaterThanOrEqual(55)
  })

  it('sets hasProperOrientation for named exports + imports', () => {
    const result = measureAlignment("import { x } from 'y'\nexport const z = x")
    expect(result.hasProperOrientation).toBe(true)
  })
})

// ─── measureFoundation ──────────────────────────────────────────────────────

describe('measureFoundation', () => {
  it('returns high anchoring for rich content', () => {
    const result = measureFoundation(RICH_CONTENT)
    expect(result.anchoring).toBe(70)
    expect(result.depth).toBe('proper-footing')
  })

  it('returns low anchoring for simple content', () => {
    const result = measureFoundation(MEDIUM_CONTENT)
    expect(result.anchoring).toBe(13)
    expect(result.depth).toBe('floating')
  })

  it('returns zero for empty content', () => {
    const result = measureFoundation(EMPTY_CONTENT)
    expect(result.anchoring).toBe(0)
    expect(result.depth).toBe('floating')
  })

  it('detects imports for stable deps', () => {
    const result = measureFoundation("import { x } from 'y'")
    expect(result.hasStableDeps).toBe(true)
  })

  it('detects error handling for no shifting', () => {
    const result = measureFoundation('try { x() } catch(e) {}')
    expect(result.hasNoShifting).toBe(true)
  })
})

// ─── measureSupport ─────────────────────────────────────────────────────────

describe('measureSupport', () => {
  it('returns high quality for rich content', () => {
    const result = measureSupport(RICH_CONTENT)
    expect(result.quality).toBe(83)
    expect(result.rating).toBe('load-bearing-pillar')
  })

  it('returns low quality for simple content', () => {
    const result = measureSupport(MEDIUM_CONTENT)
    expect(result.quality).toBe(20)
    expect(result.rating).toBe('collapsing')
  })

  it('returns near zero for empty content', () => {
    const result = measureSupport(EMPTY_CONTENT)
    expect(result.quality).toBe(5)
    expect(result.rating).toBe('collapsing')
  })

  it('detects exports for enduring code', () => {
    const result = measureSupport('export interface X {} export function x() {}')
    expect(result.hasEnduring).toBe(true)
  })

  it('flags any as failure point', () => {
    const result = measureSupport('const x: any = 1')
    expect(result.failurePointCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── classifySegmentCondition ───────────────────────────────────────────────

describe('classifySegmentCondition', () => {
  it('classifies monolithic-pillar for 90+', () => {
    const seg = analyzePillarSegment(RICH_CONTENT, 'a.ts')
    seg.qualityScore = 95
    expect(classifySegmentCondition(seg)).toBe('monolithic-pillar')
  })

  it('classifies rubble for low scores', () => {
    const seg = analyzePillarSegment(EMPTY_CONTENT, 'a.ts')
    expect(classifySegmentCondition(seg)).toBe('rubble')
  })
})

// ─── analyzePillarSegment ──────────────────────────────────────────────────

describe('analyzePillarSegment', () => {
  it('returns correct values for rich content', () => {
    const result = analyzePillarSegment(RICH_CONTENT, 'rich.ts')
    expect(result.file).toBe('rich.ts')
    expect(result.qualityScore).toBe(74)
    expect(result.condition).toBe('reliable-post')
    expect(result.compressiveStrength).toBe(75)
    expect(result.volcanicResilience).toBe(49)
    expect(result.darkClarity).toBe(89)
    expect(result.pillarAlignment).toBe(76)
    expect(result.foundationAnchoring).toBe(70)
    expect(result.supportQuality).toBe(83)
  })

  it('returns correct values for medium content', () => {
    const result = analyzePillarSegment(MEDIUM_CONTENT, 'medium.ts')
    expect(result.file).toBe('medium.ts')
    expect(result.qualityScore).toBe(27)
    expect(result.compressiveStrength).toBe(33)
    expect(result.volcanicResilience).toBe(19)
    expect(result.darkClarity).toBe(29)
    expect(result.pillarAlignment).toBe(45)
    expect(result.foundationAnchoring).toBe(13)
    expect(result.supportQuality).toBe(20)
  })

  it('returns correct values for empty content', () => {
    const result = analyzePillarSegment(EMPTY_CONTENT, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.qualityScore).toBe(5)
    expect(result.compressiveStrength).toBe(0)
    expect(result.volcanicResilience).toBe(0)
    expect(result.darkClarity).toBe(3)
    expect(result.pillarAlignment).toBe(24)
    expect(result.foundationAnchoring).toBe(0)
    expect(result.supportQuality).toBe(5)
  })

  it('qualityScore is weighted sum', () => {
    const result = analyzePillarSegment(RICH_CONTENT, 'r.ts')
    const expected = Math.round(
      result.compressiveStrength * 0.2 +
      result.volcanicResilience * 0.15 +
      result.darkClarity * 0.15 +
      result.pillarAlignment * 0.15 +
      result.foundationAnchoring * 0.15 +
      result.supportQuality * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })
})

// ─── classifyGalleryType ────────────────────────────────────────────────────

describe('classifyGalleryType', () => {
  it('returns void for empty array', () => {
    expect(classifyGalleryType([])).toBe('void')
  })

  it('returns great-hall for high avg + 50% monoliths', () => {
    const seg = analyzePillarSegment(RICH_CONTENT, 'a.ts')
    seg.qualityScore = 95
    seg.condition = 'monolithic-pillar'
    expect(classifyGalleryType([seg])).toBe('great-hall')
  })

  it('returns portico for mixed content', () => {
    const r = analyzePillarSegment(RICH_CONTENT, 'a.ts')
    const m = analyzePillarSegment(MEDIUM_CONTENT, 'b.ts')
    expect(classifyGalleryType([r, m])).toBe('portico')
  })
})

// ─── analyzePillarGallery ──────────────────────────────────────────────────

describe('analyzePillarGallery', () => {
  it('returns empty gallery for no segments', () => {
    const gallery = analyzePillarGallery([], 'src')
    expect(gallery.directory).toBe('src')
    expect(gallery.galleryType).toBe('void')
    expect(gallery.condition).toBe('collapsed')
  })

  it('returns gallery with correct averages', () => {
    const segs = [analyzePillarSegment(RICH_CONTENT, 'a.ts')]
    const gallery = analyzePillarGallery(segs, '.')
    expect(gallery.avgStrength).toBe(segs[0].compressiveStrength)
    expect(gallery.segments).toHaveLength(1)
  })
})

// ─── classifyArchitectGrade ────────────────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('returns master-architect for 80+', () => {
    expect(classifyArchitectGrade(85)).toBe('master-architect')
  })
  it('returns master-architect for exactly 80', () => {
    expect(classifyArchitectGrade(80)).toBe('master-architect')
  })
  it('returns structural-engineer for 65-79', () => {
    expect(classifyArchitectGrade(72)).toBe('structural-engineer')
  })
  it('returns structural-engineer for exactly 65', () => {
    expect(classifyArchitectGrade(65)).toBe('structural-engineer')
  })
  it('returns builder for 50-64', () => {
    expect(classifyArchitectGrade(55)).toBe('builder')
  })
  it('returns builder for exactly 50', () => {
    expect(classifyArchitectGrade(50)).toBe('builder')
  })
  it('returns mason for 35-49', () => {
    expect(classifyArchitectGrade(43)).toBe('mason')
  })
  it('returns mason for exactly 35', () => {
    expect(classifyArchitectGrade(35)).toBe('mason')
  })
  it('returns apprentice for 20-34', () => {
    expect(classifyArchitectGrade(25)).toBe('apprentice')
  })
  it('returns apprentice for exactly 20', () => {
    expect(classifyArchitectGrade(20)).toBe('apprentice')
  })
  it('returns demolition for below 20', () => {
    expect(classifyArchitectGrade(10)).toBe('demolition')
  })
  it('returns demolition for 0', () => {
    expect(classifyArchitectGrade(0)).toBe('demolition')
  })
})

// ─── generateRecommendations ────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns recommendations for rich content', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const recs = generateRecommendations(result.segments, result.galleries, result.structure, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('returns recommendations for empty content', () => {
    const result = buildObsidianPillarResult(['a.ts'], [EMPTY_CONTENT])
    const recs = generateRecommendations(result.segments, result.galleries, result.structure, result.stats)
    expect(Array.isArray(recs)).toBe(true)
  })
})

// ─── buildObsidianPillarResult (integration) ───────────────────────────────

describe('buildObsidianPillarResult', () => {
  it('handles RICH+MEDIUM correctly', () => {
    const result = buildObsidianPillarResult(
      ['rich.ts', 'medium.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(2)
    expect(result.stats.totalGalleries).toBe(1)
    expect(result.stats.avgCompressiveStrength).toBe(54)
    expect(result.stats.avgVolcanicResilience).toBe(34)
    expect(result.stats.avgDarkClarity).toBe(59)
    expect(result.stats.avgPillarAlignment).toBe(61)
    expect(result.stats.avgFoundationAnchoring).toBe(42)
    expect(result.stats.avgSupportQuality).toBe(52)
    expect(result.stats.rubbleCount).toBe(1)
    expect(result.stats.overallStructuralIntegrity).toBe(51)
    expect(result.stats.architectGrade).toBe('builder')
    expect(result.stats.bestSegment).toBe('rich.ts')
    expect(result.stats.strongest).toBe('rich.ts')
    expect(result.stats.mostResilient).toBe('rich.ts')
    expect(result.stats.clearest).toBe('rich.ts')
    expect(result.stats.mostAligned).toBe('rich.ts')
    expect(result.stats.deepestAnchored).toBe('rich.ts')
    expect(result.structure.overallStructuralIntegrity).toBe(51)
    expect(result.structure.isStructural).toBe(false)
    expect(result.structure.avgStrength).toBe(54)
    expect(result.structure.avgAlignment).toBe(61)
    expect(result.structure.avgSupport).toBe(52)
    expect(result.segments).toHaveLength(2)
    expect(result.galleries).toHaveLength(1)
    expect(result.galleries[0].galleryType).toBe('portico')
  })

  it('handles all EMPTY correctly', () => {
    const result = buildObsidianPillarResult(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts'],
      [EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT, EMPTY_CONTENT],
    )
    expect(result.stats.totalFiles).toBe(4)
    expect(result.stats.avgCompressiveStrength).toBe(0)
    expect(result.stats.avgVolcanicResilience).toBe(0)
    expect(result.stats.avgDarkClarity).toBe(3)
    expect(result.stats.avgPillarAlignment).toBe(24)
    expect(result.stats.avgFoundationAnchoring).toBe(0)
    expect(result.stats.avgSupportQuality).toBe(5)
    expect(result.stats.rubbleCount).toBe(4)
    expect(result.stats.overallStructuralIntegrity).toBe(5)
    expect(result.stats.architectGrade).toBe('demolition')
    expect(result.structure.isStructural).toBe(false)
  })

  it('handles single rich file', () => {
    const result = buildObsidianPillarResult(['rich.ts'], [RICH_CONTENT])
    expect(result.stats.totalFiles).toBe(1)
    expect(result.segments).toHaveLength(1)
    expect(result.segments[0].qualityScore).toBe(74)
    expect(result.galleries).toHaveLength(1)
  })

  it('handles empty files array', () => {
    const result = buildObsidianPillarResult([], [])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.segments).toHaveLength(0)
    expect(result.galleries).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for high score', () => { expect(typeof scoreColor(90)).toBe('string') })
  it('returns string for medium score', () => { expect(typeof scoreColor(65)).toBe('string') })
  it('returns string for low score', () => { expect(typeof scoreColor(30)).toBe('string') })
  it('returns string for very low score', () => { expect(typeof scoreColor(10)).toBe('string') })
})

describe('gradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['diamond-pillar', 'obsidian-strong', 'basalt-firm', 'sandstone-moderate', 'chalk-weak', 'crumbling']) {
      expect(typeof gradeColor(g)).toBe('string')
    }
  })
  it('passes through unknown', () => { expect(gradeColor('unknown')).toBe('unknown') })
})

describe('recoveryColor', () => {
  it('colors all recoveries', () => {
    for (const r of ['instant-cooling', 'rapid-solidification', 'proper-tempering', 'slow-cooling', 'thermal-shock', 'shattered']) {
      expect(typeof recoveryColor(r)).toBe('string')
    }
  })
})

describe('clarityQualityColor', () => {
  it('colors all qualities', () => {
    for (const q of ['midnight-sun', 'starlit-clarity', 'moonlit-readable', 'dusk-readable', 'murky-dark', 'pitch-black']) {
      expect(typeof clarityQualityColor(q)).toBe('string')
    }
  })
})

describe('precisionColor', () => {
  it('colors all precisions', () => {
    for (const p of ['laser-aligned', 'plumb-perfect', 'well-aligned', 'mostly-straight', 'leaning', 'crooked']) {
      expect(typeof precisionColor(p)).toBe('string')
    }
  })
})

describe('depthColor', () => {
  it('colors all depths', () => {
    for (const d of ['bedrock-anchored', 'deep-foundation', 'proper-footing', 'shallow-base', 'surface-rest', 'floating']) {
      expect(typeof depthColor(d)).toBe('string')
    }
  })
})

describe('ratingColor', () => {
  it('colors all ratings', () => {
    for (const r of ['structural-masterpiece', 'load-bearing-pillar', 'reliable-support', 'adequate-prop', 'wobbly-stick', 'collapsing']) {
      expect(typeof ratingColor(r)).toBe('string')
    }
  })
})

describe('conditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['monolithic-pillar', 'strong-column', 'reliable-post', 'weathered-pillar', 'cracked-column', 'rubble']) {
      expect(typeof conditionColor(c)).toBe('string')
    }
  })
})

describe('architectGradeColor', () => {
  it('colors all grades', () => {
    for (const g of ['master-architect', 'structural-engineer', 'builder', 'mason', 'apprentice', 'demolition']) {
      expect(typeof architectGradeColor(g)).toBe('string')
    }
  })
})

describe('galleryTypeColor', () => {
  it('colors all types', () => {
    for (const t of ['great-hall', 'cathedral-nave', 'temple-colonnade', 'portico', 'ruins', 'void']) {
      expect(typeof galleryTypeColor(t)).toBe('string')
    }
  })
})

describe('galleryConditionColor', () => {
  it('colors all conditions', () => {
    for (const c of ['structural-marvel', 'solid-colonnade', 'adequate-support', 'weathered-gallery', 'crumbling-hall', 'collapsed']) {
      expect(typeof galleryConditionColor(c)).toBe('string')
    }
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatObsidianPillarJson', () => {
  it('returns valid JSON string', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const json = formatObsidianPillarJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatObsidianPillarTable', () => {
  it('includes header', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, false)
    expect(table).toContain('Obsidian Pillar Analysis')
  })

  it('includes structure overview section', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, false)
    expect(table).toContain('Structure Overview')
    expect(table).toContain('Is Structural')
  })

  it('includes statistics section', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, false)
    expect(table).toContain('Statistics')
    expect(table).toContain('Architect Grade')
  })

  it('includes condition counts section', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, false)
    expect(table).toContain('Condition Counts')
    expect(table).toContain('Rubble')
  })

  it('shows highlights for best segment', () => {
    const result = buildObsidianPillarResult(
      ['a.ts', 'b.ts'],
      [RICH_CONTENT, MEDIUM_CONTENT],
    )
    const table = formatObsidianPillarTable(result, false)
    expect(table).toContain('Highlights')
    expect(table).toContain('Best Overall')
    expect(table).toContain('Strongest')
    expect(table).toContain('Most Resilient')
    expect(table).toContain('Clearest')
    expect(table).toContain('Most Aligned')
    expect(table).toContain('Deepest Anchored')
  })

  it('shows per-file details in verbose mode', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, true)
    expect(table).toContain('Per-File Segments')
  })

  it('hides per-file details without verbose', () => {
    const result = buildObsidianPillarResult(['a.ts'], [RICH_CONTENT])
    const table = formatObsidianPillarTable(result, false)
    expect(table).not.toContain('Per-File Segments')
  })

  it('shows recommendations when present', () => {
    const result = buildObsidianPillarResult(['a.ts'], [MEDIUM_CONTENT])
    if (result.recommendations.length > 0) {
      const table = formatObsidianPillarTable(result, false)
      expect(table).toContain('Recommendations')
    }
  })
})
