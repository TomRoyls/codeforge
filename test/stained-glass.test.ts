import { describe, it, expect } from 'vitest'
import {
  measureHarmonizing,
  measureBinding,
  measureTransmitting,
  measurePatterning,
  measureStructuring,
  classifyPaneCondition,
  classifyWorkshopType,
  classifyArtisanGrade,
  classifyWorkshopCondition,
  analyzeGlassPane,
  analyzeGlassWorkshop,
  buildStainedGlassResult,
  generateRecommendations,
} from '../src/commands/stained-glass-helpers.js'
import {
  colorScore,
  colorGrade,
  formatPaneTable,
  formatPanesTable,
  formatWorkshopTable,
  formatWorkshopsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/stained-glass-format-helpers.js'

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

// ─── measureHarmonizing ─────────────────────────────────────────────

describe('measureHarmonizing', () => {
  it('returns 0 for empty content', () => {
    const m = measureHarmonizing('')
    expect(m.harmony).toBe(0)
    expect(m.grade).toBe('monochrome-drab')
    expect(m.hasHighHarmony).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureHarmonizing(minimalContent)
    expect(m.harmony).toBe(8)
    expect(m.grade).toBe('monochrome-drab')
    expect(m.hasConsistent).toBe(false)
    expect(m.hasNoClashing).toBe(true)
    expect(m.hasNoDiscordant).toBe(true)
    expect(m.clashingCount).toBe(0)
    expect(m.discordantCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureHarmonizing(richContent)
    expect(m.harmony).toBe(100)
    expect(m.grade).toBe('symphony-colors')
    expect(m.hasHighHarmony).toBe(true)
    expect(m.hasConsistent).toBe(true)
    expect(m.hasMatching).toBe(true)
    expect(m.hasUnified).toBe(true)
    expect(m.hasHarmonious).toBe(true)
    expect(m.hasCoherent).toBe(true)
    expect(m.hasBlended).toBe(true)
  })

  it('detects clashing var usage', () => {
    const m = measureHarmonizing('var x = 1')
    expect(m.clashingCount).toBe(1)
    expect(m.hasNoClashing).toBe(false)
  })

  it('detects discordant any usage', () => {
    const m = measureHarmonizing('const x: any = 1')
    expect(m.discordantCount).toBe(1)
    expect(m.hasNoDiscordant).toBe(false)
  })

  it('detects eval as mismatched', () => {
    const m = measureHarmonizing('eval("1")')
    expect(m.hasNoMismatched).toBe(false)
  })

  it('detects debugger as conflicting', () => {
    const m = measureHarmonizing('debugger')
    expect(m.hasNoConflicting).toBe(false)
  })
})

// ─── measureBinding ────────────────────────────────────────────────

describe('measureBinding', () => {
  it('returns 0 for empty content', () => {
    const m = measureBinding('')
    expect(m.quality).toBe(0)
    expect(m.lead).toBe('no-binding')
    expect(m.hasHighQuality).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureBinding(minimalContent)
    expect(m.quality).toBe(8)
    expect(m.lead).toBe('no-binding')
    expect(m.hasConnected).toBe(false)
    expect(m.hasNoSeparated).toBe(true)
    expect(m.hasNoLoose).toBe(true)
    expect(m.separatedCount).toBe(0)
    expect(m.looseCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureBinding(richContent)
    expect(m.quality).toBe(100)
    expect(m.lead).toBe('pure-lead')
    expect(m.hasHighQuality).toBe(true)
    expect(m.hasConnected).toBe(true)
    expect(m.hasJoined).toBe(true)
    expect(m.hasBound).toBe(true)
    expect(m.hasIntegrated).toBe(true)
    expect(m.hasCoupled).toBe(true)
    expect(m.hasLinked).toBe(true)
  })

  it('detects separated var usage', () => {
    const m = measureBinding('var x = 1')
    expect(m.separatedCount).toBe(1)
    expect(m.hasNoSeparated).toBe(false)
  })

  it('detects loose any usage', () => {
    const m = measureBinding('const x: any = 1')
    expect(m.looseCount).toBe(1)
    expect(m.hasNoLoose).toBe(false)
  })
})

// ─── measureTransmitting ────────────────────────────────────────────

describe('measureTransmitting', () => {
  it('returns 0 for empty content', () => {
    const m = measureTransmitting('')
    expect(m.clarity).toBe(0)
    expect(m.light).toBe('opaque')
    expect(m.hasHighClarity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureTransmitting(minimalContent)
    expect(m.clarity).toBe(0)
    expect(m.light).toBe('opaque')
    expect(m.hasTransparent).toBe(false)
    expect(m.hasNoHidden).toBe(true)
    expect(m.hasNoOpaque).toBe(true)
    expect(m.hiddenCount).toBe(0)
    expect(m.opaqueCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureTransmitting(richContent)
    expect(m.clarity).toBe(100)
    expect(m.light).toBe('crystal-clear')
    expect(m.hasHighClarity).toBe(true)
    expect(m.hasTransparent).toBe(true)
    expect(m.hasRevealing).toBe(true)
    expect(m.hasClear).toBe(true)
    expect(m.hasVisible).toBe(true)
    expect(m.hasOpen).toBe(true)
    expect(m.hasLuminous).toBe(true)
  })

  it('detects hidden var usage', () => {
    const m = measureTransmitting('var x = 1')
    expect(m.hiddenCount).toBe(1)
    expect(m.hasNoHidden).toBe(false)
  })

  it('detects opaque any usage', () => {
    const m = measureTransmitting('const x: any = 1')
    expect(m.opaqueCount).toBe(1)
    expect(m.hasNoOpaque).toBe(false)
  })
})

// ─── measurePatterning ──────────────────────────────────────────────

describe('measurePatterning', () => {
  it('returns 0 for empty content', () => {
    const m = measurePatterning('')
    expect(m.coherence).toBe(0)
    expect(m.pattern).toBe('no-pattern')
    expect(m.hasHighCoherence).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measurePatterning(minimalContent)
    expect(m.coherence).toBe(8)
    expect(m.pattern).toBe('no-pattern')
    expect(m.hasLogical).toBe(false)
    expect(m.hasNoChaotic).toBe(true)
    expect(m.hasNoRandom).toBe(true)
    expect(m.chaoticCount).toBe(0)
    expect(m.scatteredCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measurePatterning(richContent)
    expect(m.coherence).toBe(100)
    expect(m.pattern).toBe('masterwork-design')
    expect(m.hasHighCoherence).toBe(true)
    expect(m.hasLogical).toBe(true)
    expect(m.hasFlowing).toBe(true)
    expect(m.hasStructured).toBe(true)
    expect(m.hasOrganized).toBe(true)
    expect(m.hasCoherent).toBe(true)
    expect(m.hasOrdered).toBe(true)
  })

  it('detects chaotic var usage', () => {
    const m = measurePatterning('var x = 1')
    expect(m.chaoticCount).toBe(1)
    expect(m.hasNoChaotic).toBe(false)
  })

  it('detects scattered any usage', () => {
    const m = measurePatterning('const x: any = 1')
    expect(m.scatteredCount).toBe(1)
    expect(m.hasNoRandom).toBe(false)
  })
})

// ─── measureStructuring ─────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns 0 for empty content', () => {
    const m = measureStructuring('')
    expect(m.integrity).toBe(0)
    expect(m.frame).toBe('no-frame')
    expect(m.hasHighIntegrity).toBe(false)
  })

  it('scores minimal content correctly', () => {
    const m = measureStructuring(minimalContent)
    expect(m.integrity).toBe(0)
    expect(m.frame).toBe('no-frame')
    expect(m.hasSolid).toBe(false)
    expect(m.hasNoFragile).toBe(true)
    expect(m.hasNoUnstable).toBe(true)
    expect(m.fragileCount).toBe(0)
    expect(m.unstableCount).toBe(0)
  })

  it('scores rich content at max', () => {
    const m = measureStructuring(richContent)
    expect(m.integrity).toBe(100)
    expect(m.frame).toBe('iron-frame')
    expect(m.hasHighIntegrity).toBe(true)
    expect(m.hasSolid).toBe(true)
    expect(m.hasRobust).toBe(true)
    expect(m.hasStable).toBe(true)
    expect(m.hasStrong).toBe(true)
    expect(m.hasSound).toBe(true)
    expect(m.hasSecure).toBe(true)
  })

  it('detects fragile var usage', () => {
    const m = measureStructuring('var x = 1')
    expect(m.fragileCount).toBe(1)
    expect(m.hasNoFragile).toBe(false)
  })

  it('detects unstable any usage', () => {
    const m = measureStructuring('const x: any = 1')
    expect(m.unstableCount).toBe(1)
    expect(m.hasNoUnstable).toBe(false)
  })
})

// ─── classifyPaneCondition ──────────────────────────────────────────

describe('classifyPaneCondition', () => {
  it('classifies cathedral-window for 85+', () => {
    expect(classifyPaneCondition(85)).toBe('cathedral-window')
    expect(classifyPaneCondition(100)).toBe('cathedral-window')
  })

  it('classifies beautiful-panel for 70-84', () => {
    expect(classifyPaneCondition(70)).toBe('beautiful-panel')
    expect(classifyPaneCondition(84)).toBe('beautiful-panel')
  })

  it('classifies proper-window for 55-69', () => {
    expect(classifyPaneCondition(55)).toBe('proper-window')
    expect(classifyPaneCondition(69)).toBe('proper-window')
  })

  it('classifies cracked-glass for 40-54', () => {
    expect(classifyPaneCondition(40)).toBe('cracked-glass')
    expect(classifyPaneCondition(54)).toBe('cracked-glass')
  })

  it('classifies shattered-pane for 25-39', () => {
    expect(classifyPaneCondition(25)).toBe('shattered-pane')
    expect(classifyPaneCondition(39)).toBe('shattered-pane')
  })

  it('classifies no-glass for 0-24', () => {
    expect(classifyPaneCondition(0)).toBe('no-glass')
    expect(classifyPaneCondition(24)).toBe('no-glass')
  })
})

// ─── classifyWorkshopType ───────────────────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns no-studio for empty panes', () => {
    expect(classifyWorkshopType([])).toBe('no-studio')
  })

  it('classifies cathedral-studio for high avg + high cathedral ratio', () => {
    const panes = Array.from({ length: 4 }, (_, i) => ({
      ...analyzeGlassPane(richContent, `f${i}.ts`),
    }))
    expect(classifyWorkshopType(panes)).toBe('cathedral-studio')
  })

  it('classifies no-studio for low scores', () => {
    const panes = [analyzeGlassPane('', 'a.ts')]
    expect(classifyWorkshopType(panes)).toBe('no-studio')
  })

  it('classifies glass-atelier for mid-high scores', () => {
    const panes = Array.from({ length: 3 }, () => ({
      ...analyzeGlassPane(richContent, 'f.ts'),
      qualityScore: 65,
      condition: 'beautiful-panel' as const,
    }))
    expect(classifyWorkshopType(panes)).toBe('glass-atelier')
  })

  it('classifies proper-workshop for mid scores', () => {
    const panes = Array.from({ length: 3 }, () => ({
      ...analyzeGlassPane(richContent, 'f.ts'),
      qualityScore: 50,
      condition: 'proper-window' as const,
    }))
    expect(classifyWorkshopType(panes)).toBe('proper-workshop')
  })

  it('classifies craft-table for very low scores', () => {
    const panes = Array.from({ length: 3 }, () => ({
      ...analyzeGlassPane(richContent, 'f.ts'),
      qualityScore: 18,
      condition: 'shattered-pane' as const,
    }))
    expect(classifyWorkshopType(panes)).toBe('craft-table')
  })
})

// ─── classifyArtisanGrade ───────────────────────────────────────────

describe('classifyArtisanGrade', () => {
  it('classifies master-glazier for 80+', () => {
    expect(classifyArtisanGrade(80)).toBe('master-glazier')
    expect(classifyArtisanGrade(100)).toBe('master-glazier')
  })

  it('classifies stained-glass-artist for 65-79', () => {
    expect(classifyArtisanGrade(65)).toBe('stained-glass-artist')
    expect(classifyArtisanGrade(79)).toBe('stained-glass-artist')
  })

  it('classifies skilled-craftsman for 50-64', () => {
    expect(classifyArtisanGrade(50)).toBe('skilled-craftsman')
    expect(classifyArtisanGrade(64)).toBe('skilled-craftsman')
  })

  it('classifies apprentice for 35-49', () => {
    expect(classifyArtisanGrade(35)).toBe('apprentice')
    expect(classifyArtisanGrade(49)).toBe('apprentice')
  })

  it('classifies novice for 20-34', () => {
    expect(classifyArtisanGrade(20)).toBe('novice')
    expect(classifyArtisanGrade(34)).toBe('novice')
  })

  it('classifies window-shopper for 0-19', () => {
    expect(classifyArtisanGrade(0)).toBe('window-shopper')
    expect(classifyArtisanGrade(19)).toBe('window-shopper')
  })
})

// ─── classifyWorkshopCondition ──────────────────────────────────────

describe('classifyWorkshopCondition', () => {
  it('classifies masterwork-collection for 75+', () => {
    expect(classifyWorkshopCondition(75)).toBe('masterwork-collection')
  })

  it('classifies beautiful-display for 60-74', () => {
    expect(classifyWorkshopCondition(60)).toBe('beautiful-display')
  })

  it('classifies decent-gallery for 45-59', () => {
    expect(classifyWorkshopCondition(45)).toBe('decent-gallery')
  })

  it('classifies cracked-display for 30-44', () => {
    expect(classifyWorkshopCondition(30)).toBe('cracked-display')
  })

  it('classifies broken-pieces for 15-29', () => {
    expect(classifyWorkshopCondition(15)).toBe('broken-pieces')
  })

  it('classifies empty for 0-14', () => {
    expect(classifyWorkshopCondition(0)).toBe('empty')
  })
})

// ─── analyzeGlassPane ───────────────────────────────────────────────

describe('analyzeGlassPane', () => {
  it('analyzes minimal content', () => {
    const pane = analyzeGlassPane(minimalContent, 'minimal.ts')
    expect(pane.file).toBe('minimal.ts')
    expect(pane.colorHarmony).toBe(8)
    expect(pane.leadQuality).toBe(8)
    expect(pane.lightTransmission).toBe(0)
    expect(pane.patternCoherence).toBe(8)
    expect(pane.structuralIntegrity).toBe(0)
    expect(pane.qualityScore).toBe(5)
    expect(pane.condition).toBe('no-glass')
    expect(pane.harmonizing.grade).toBe('monochrome-drab')
    expect(pane.binding.lead).toBe('no-binding')
    expect(pane.transmitting.light).toBe('opaque')
    expect(pane.patterning.pattern).toBe('no-pattern')
    expect(pane.structuring.frame).toBe('no-frame')
  })

  it('analyzes rich content', () => {
    const pane = analyzeGlassPane(richContent, 'rich.ts')
    expect(pane.file).toBe('rich.ts')
    expect(pane.colorHarmony).toBe(100)
    expect(pane.leadQuality).toBe(100)
    expect(pane.lightTransmission).toBe(100)
    expect(pane.patternCoherence).toBe(100)
    expect(pane.structuralIntegrity).toBe(100)
    expect(pane.qualityScore).toBe(100)
    expect(pane.condition).toBe('cathedral-window')
    expect(pane.harmonizing.grade).toBe('symphony-colors')
    expect(pane.binding.lead).toBe('pure-lead')
    expect(pane.transmitting.light).toBe('crystal-clear')
    expect(pane.patterning.pattern).toBe('masterwork-design')
    expect(pane.structuring.frame).toBe('iron-frame')
  })

  it('computes qualityScore as weighted average', () => {
    const pane = analyzeGlassPane('export const x = 1', 'mid.ts')
    const expected = Math.round(
      pane.colorHarmony * 0.2 +
      pane.leadQuality * 0.2 +
      pane.lightTransmission * 0.2 +
      pane.patternCoherence * 0.2 +
      pane.structuralIntegrity * 0.2,
    )
    expect(pane.qualityScore).toBe(expected)
  })
})

// ─── analyzeGlassWorkshop ───────────────────────────────────────────

describe('analyzeGlassWorkshop', () => {
  it('returns empty workshop for empty panes', () => {
    const workshop = analyzeGlassWorkshop([], 'empty-dir')
    expect(workshop.directory).toBe('empty-dir')
    expect(workshop.panes).toHaveLength(0)
    expect(workshop.avgHarmony).toBe(0)
    expect(workshop.workshopType).toBe('no-studio')
    expect(workshop.condition).toBe('empty')
  })

  it('analyzes workshop with rich panes', () => {
    const panes = [
      analyzeGlassPane(richContent, 'dir/a.ts'),
      analyzeGlassPane(richContent, 'dir/b.ts'),
    ]
    const workshop = analyzeGlassWorkshop(panes, 'dir')
    expect(workshop.avgHarmony).toBe(100)
    expect(workshop.cathedralWindowCount).toBe(2)
    expect(workshop.noGlassCount).toBe(0)
    expect(workshop.workshopType).toBe('cathedral-studio')
  })

  it('analyzes workshop with mixed panes', () => {
    const panes = [
      analyzeGlassPane(richContent, 'dir/a.ts'),
      analyzeGlassPane(minimalContent, 'dir/b.ts'),
    ]
    const workshop = analyzeGlassWorkshop(panes, 'dir')
    expect(workshop.cathedralWindowCount).toBe(1)
    expect(workshop.noGlassCount).toBe(1)
  })
})

// ─── buildStainedGlassResult ────────────────────────────────────────

describe('buildStainedGlassResult', () => {
  it('returns empty result for no files', async () => {
    const result = await buildStainedGlassResult([], [])
    expect(result.panes).toHaveLength(0)
    expect(result.workshops).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallBrilliance).toBe(0)
    expect(result.stats.artisanGrade).toBe('window-shopper')
    expect(result.cathedral.isLuminous).toBe(false)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('returns full result for rich content', async () => {
    const result = await buildStainedGlassResult(['a.ts', 'b.ts'], [richContent, richContent])
    expect(result.panes).toHaveLength(2)
    expect(result.workshops).toHaveLength(1)
    expect(result.stats.avgColorHarmony).toBe(100)
    expect(result.stats.avgLeadQuality).toBe(100)
    expect(result.stats.avgLightTransmission).toBe(100)
    expect(result.stats.avgPatternCoherence).toBe(100)
    expect(result.stats.avgStructuralIntegrity).toBe(100)
    expect(result.stats.cathedralWindowCount).toBe(2)
    expect(result.stats.noGlassCount).toBe(0)
    expect(result.stats.hasHighHarmonyCount).toBe(2)
    expect(result.stats.hasHighQualityCount).toBe(2)
    expect(result.stats.hasHighClarityCount).toBe(2)
    expect(result.stats.hasHighCoherenceCount).toBe(2)
    expect(result.stats.hasHighIntegrityCount).toBe(2)
    expect(result.stats.overallBrilliance).toBe(100)
    expect(result.stats.artisanGrade).toBe('master-glazier')
    expect(result.cathedral.isLuminous).toBe(true)
    expect(result.stats.bestPane).toBeTruthy()
    expect(result.stats.mostHarmonious).toBeTruthy()
    expect(result.stats.bestBound).toBeTruthy()
    expect(result.stats.mostTransparent).toBeTruthy()
    expect(result.stats.mostCoherent).toBeTruthy()
  })

  it('groups files by directory', async () => {
    const result = await buildStainedGlassResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [richContent, richContent, minimalContent],
    )
    expect(result.workshops).toHaveLength(2)
    const dirs = result.workshops.map(w => w.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('test')
  })

  it('computes overall brilliance correctly', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    expect(result.cathedral.overallBrilliance).toBe(Math.round((8 + 8 + 0) / 3))
  })

  it('sets isLuminous when avgHarmony >= 60', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [richContent])
    expect(result.cathedral.isLuminous).toBe(true)
  })

  it('sets isLuminous false when avgHarmony < 60', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    expect(result.cathedral.isLuminous).toBe(false)
  })

  it('picks best pane by qualityScore', async () => {
    const result = await buildStainedGlassResult(
      ['low.ts', 'high.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestPane).toBe('high.ts')
    expect(result.stats.mostHarmonious).toBe('high.ts')
    expect(result.stats.bestBound).toBe('high.ts')
    expect(result.stats.mostTransparent).toBe('high.ts')
    expect(result.stats.mostCoherent).toBe('high.ts')
  })

  it('handles mixed content stats', async () => {
    const result = await buildStainedGlassResult(
      ['a.ts', 'b.ts'],
      [richContent, minimalContent],
    )
    expect(result.stats.cathedralWindowCount).toBe(1)
    expect(result.stats.noGlassCount).toBe(1)
  })
})

// ─── generateRecommendations ────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns celebration for perfect result', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [richContent])
    expect(result.recommendations).toEqual([
      'Your stained glass masterpiece is complete! Every pane shimmers with color, light, and structural perfection',
    ])
  })

  it('recommends improving color harmony when low', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Harmonize'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving lead quality when low', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('lead'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving light transmission when low', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('transmission'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving pattern coherence when low', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Coherence'))
    expect(rec).toBeTruthy()
  })

  it('recommends improving structural integrity when low', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('structure'))
    expect(rec).toBeTruthy()
  })

  it('warns about no-glass files', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('no glass'))
    expect(rec).toBeTruthy()
  })

  it('warns about poor overall brilliance', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [minimalContent])
    const rec = result.recommendations.find(r => r.includes('Overall stained glass brilliance'))
    expect(rec).toBeTruthy()
  })

  it('lists specific no-glass files to restore', async () => {
    const result = await buildStainedGlassResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    const rec = result.recommendations.find(r => r.includes('Restore these'))
    expect(rec).toBeTruthy()
  })

  it('warns when all workshops are empty/craft-tables', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [''])
    const rec = result.recommendations.find(r => r.includes('empty or craft-tables'))
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
  it('returns a string for cathedral-window', () => {
    expect(typeof colorGrade('cathedral-window')).toBe('string')
  })

  it('returns a string for no-glass', () => {
    expect(typeof colorGrade('no-glass')).toBe('string')
  })

  it('returns a string for unknown grade', () => {
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatPaneTable', () => {
  it('formats a pane', () => {
    const pane = analyzeGlassPane(richContent, 'test.ts')
    const output = formatPaneTable(pane)
    expect(output).toContain('test.ts')
    expect(output).toContain('Color Harmony')
    expect(output).toContain('Lead Quality')
    expect(output).toContain('Light Transmission')
    expect(output).toContain('Pattern Coherence')
    expect(output).toContain('Structural Integrity')
  })
})

describe('formatPanesTable', () => {
  it('handles empty panes', () => {
    const output = formatPanesTable([])
    expect(output).toContain('No glass panes')
  })

  it('formats multiple panes', () => {
    const panes = [
      analyzeGlassPane(richContent, 'a.ts'),
      analyzeGlassPane(minimalContent, 'b.ts'),
    ]
    const output = formatPanesTable(panes)
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })
})

describe('formatWorkshopTable', () => {
  it('formats a workshop', () => {
    const panes = [analyzeGlassPane(richContent, 'dir/a.ts')]
    const workshop = analyzeGlassWorkshop(panes, 'dir')
    const output = formatWorkshopTable(workshop)
    expect(output).toContain('dir')
    expect(output).toContain('Workshop')
  })
})

describe('formatWorkshopsTable', () => {
  it('handles empty workshops', () => {
    const output = formatWorkshopsTable([])
    expect(output).toContain('No glass workshops')
  })

  it('formats multiple workshops', () => {
    const panes = [analyzeGlassPane(richContent, 'src/a.ts')]
    const workshops = [analyzeGlassWorkshop(panes, 'src')]
    const output = formatWorkshopsTable(workshops)
    expect(output).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [richContent])
    const output = formatStatsTable(result.stats)
    expect(output).toContain('Stained Glass Statistics')
    expect(output).toContain('Total Files')
    expect(output).toContain('Artisan Grade')
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
    const result = await buildStainedGlassResult(['a.ts'], [richContent])
    const output = formatResultTable(result)
    expect(output).toContain('Stained Glass Pane Analysis')
    expect(output).toContain('Glass Workshop Analysis')
    expect(output).toContain('Stained Glass Statistics')
    expect(output).toContain('Cathedral')
    expect(output).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('formats result as valid JSON', async () => {
    const result = await buildStainedGlassResult(['a.ts'], [richContent])
    const output = formatResultJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.panes).toHaveLength(1)
    expect(parsed.stats.totalFiles).toBe(1)
    expect(parsed.cathedral.isLuminous).toBe(true)
  })
})

// ─── Edge Cases ─────────────────────────────────────────────────────

describe('edge cases', () => {
  it('handles content with only whitespace', () => {
    const pane = analyzeGlassPane('   \n\t  ', 'blank.ts')
    expect(pane.colorHarmony).toBe(0)
    expect(pane.qualityScore).toBe(0)
    expect(pane.condition).toBe('no-glass')
  })

  it('handles content with only comments', () => {
    const pane = analyzeGlassPane('// just a comment\n/* block */', 'comment.ts')
    expect(pane.colorHarmony).toBe(0)
    expect(pane.qualityScore).toBe(0)
  })

  it('handles very long content', async () => {
    const longContent = richContent.repeat(100)
    const result = await buildStainedGlassResult(['big.ts'], [longContent])
    expect(result.panes).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('handles many files', async () => {
    const files = Array.from({ length: 50 }, (_, i) => `f${i}.ts`)
    const contents = Array.from({ length: 50 }, () => richContent)
    const result = await buildStainedGlassResult(files, contents)
    expect(result.stats.totalFiles).toBe(50)
    expect(result.stats.cathedralWindowCount).toBe(50)
  })

  it('handles single file workshop', async () => {
    const result = await buildStainedGlassResult(['single.ts'], [richContent])
    expect(result.workshops).toHaveLength(1)
    expect(result.workshops[0]!.panes).toHaveLength(1)
  })

  it('quality score is capped at 100', () => {
    const pane = analyzeGlassPane(richContent, 'cap.ts')
    expect(pane.qualityScore).toBeLessThanOrEqual(100)
    expect(pane.colorHarmony).toBeLessThanOrEqual(100)
    expect(pane.leadQuality).toBeLessThanOrEqual(100)
    expect(pane.lightTransmission).toBeLessThanOrEqual(100)
    expect(pane.patternCoherence).toBeLessThanOrEqual(100)
    expect(pane.structuralIntegrity).toBeLessThanOrEqual(100)
  })

  it('recommendations never empty', async () => {
    const r1 = await buildStainedGlassResult([], [])
    const r2 = await buildStainedGlassResult(['a.ts'], [richContent])
    const r3 = await buildStainedGlassResult(['a.ts'], [minimalContent])
    expect(r1.recommendations.length).toBeGreaterThan(0)
    expect(r2.recommendations.length).toBeGreaterThan(0)
    expect(r3.recommendations.length).toBeGreaterThan(0)
  })
})
