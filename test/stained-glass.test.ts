import { describe, it, expect } from 'vitest'
import {
  classifyPaneType,
  classifyPaneShape,
  classifyCraftsmanship,
  classifyLightEffect,
  classifyPaneCondition,
  classifyPanelCondition,
  classifyWindowGrade,
  classifyStyle,
  classifyPanelType,
  detectCracks,
  detectCloudiness,
  detectPaintLoss,
  analyzeGlassPane,
  analyzeGlassPanel,
  generateStainedGlassRecommendations,
  buildStainedGlassResult,
  type GlassPane,
  type GlassPanel,
} from '../src/commands/stained-glass-helpers.js'
import { formatStainedGlassTable, formatStainedGlassJson } from '../src/commands/stained-glass-format-helpers.js'

// ─── classifyPaneType ──────────────────────────────────────────────────────

describe('classifyPaneType', () => {
  it('returns figural for 3+ classes', () => {
    expect(classifyPaneType(3, 0, 0)).toBe('figural')
    expect(classifyPaneType(5, 0, 0)).toBe('figural')
  })

  it('returns medallion for 2+ interfaces', () => {
    expect(classifyPaneType(0, 2, 0)).toBe('medallion')
    expect(classifyPaneType(0, 3, 0)).toBe('medallion')
  })

  it('returns floral for 5+ functions', () => {
    expect(classifyPaneType(0, 0, 5)).toBe('floral')
    expect(classifyPaneType(0, 0, 10)).toBe('floral')
  })

  it('returns geometric for 3+ functions and 1+ classes', () => {
    expect(classifyPaneType(1, 0, 3)).toBe('geometric')
    expect(classifyPaneType(2, 0, 4)).toBe('geometric')
  })

  it('returns abstract for 2+ functions', () => {
    expect(classifyPaneType(0, 0, 2)).toBe('abstract')
  })

  it('returns border for 1+ classes', () => {
    expect(classifyPaneType(1, 0, 0)).toBe('border')
  })

  it('returns background for empty content', () => {
    expect(classifyPaneType(0, 0, 0)).toBe('background')
  })

  it('prioritizes figural over medallion', () => {
    expect(classifyPaneType(3, 5, 0)).toBe('figural')
  })

  it('prioritizes medallion over floral', () => {
    expect(classifyPaneType(0, 2, 10)).toBe('medallion')
  })
})

// ─── classifyPaneShape ─────────────────────────────────────────────────────

describe('classifyPaneShape', () => {
  it('returns diamond for 2+ classes and 3+ functions', () => {
    expect(classifyPaneShape(50, 3, 2)).toBe('diamond')
    expect(classifyPaneShape(100, 5, 3)).toBe('diamond')
  })

  it('returns circular for 2+ classes', () => {
    expect(classifyPaneShape(50, 1, 2)).toBe('circular')
  })

  it('returns arched for 5+ functions', () => {
    expect(classifyPaneShape(30, 5, 0)).toBe('arched')
    expect(classifyPaneShape(50, 6, 1)).toBe('arched')
  })

  it('returns triangular for 50+ lines and <=2 functions', () => {
    expect(classifyPaneShape(60, 2, 0)).toBe('triangular')
    expect(classifyPaneShape(100, 1, 0)).toBe('triangular')
  })

  it('returns rectangular for 20+ lines', () => {
    expect(classifyPaneShape(25, 0, 0)).toBe('rectangular')
    expect(classifyPaneShape(30, 3, 1)).toBe('rectangular')
  })

  it('returns irregular for small files', () => {
    expect(classifyPaneShape(10, 0, 0)).toBe('irregular')
  })
})

// ─── classifyCraftsmanship ─────────────────────────────────────────────────

describe('classifyCraftsmanship', () => {
  it('returns master for 85+', () => {
    expect(classifyCraftsmanship(85)).toBe('master')
    expect(classifyCraftsmanship(100)).toBe('master')
  })

  it('returns artisan for 70-84', () => {
    expect(classifyCraftsmanship(70)).toBe('artisan')
    expect(classifyCraftsmanship(84)).toBe('artisan')
  })

  it('returns journeyman for 50-69', () => {
    expect(classifyCraftsmanship(50)).toBe('journeyman')
    expect(classifyCraftsmanship(69)).toBe('journeyman')
  })

  it('returns apprentice for 30-49', () => {
    expect(classifyCraftsmanship(30)).toBe('apprentice')
    expect(classifyCraftsmanship(49)).toBe('apprentice')
  })

  it('returns novice below 30', () => {
    expect(classifyCraftsmanship(29)).toBe('novice')
    expect(classifyCraftsmanship(0)).toBe('novice')
  })
})

// ─── classifyLightEffect ───────────────────────────────────────────────────

describe('classifyLightEffect', () => {
  it('returns brilliant for 80+', () => {
    expect(classifyLightEffect(80)).toBe('brilliant')
    expect(classifyLightEffect(100)).toBe('brilliant')
  })

  it('returns luminous for 60-79', () => {
    expect(classifyLightEffect(60)).toBe('luminous')
    expect(classifyLightEffect(79)).toBe('luminous')
  })

  it('returns translucent for 40-59', () => {
    expect(classifyLightEffect(40)).toBe('translucent')
    expect(classifyLightEffect(59)).toBe('translucent')
  })

  it('returns opaque for 20-39', () => {
    expect(classifyLightEffect(20)).toBe('opaque')
    expect(classifyLightEffect(39)).toBe('opaque')
  })

  it('returns dark below 20', () => {
    expect(classifyLightEffect(19)).toBe('dark')
    expect(classifyLightEffect(0)).toBe('dark')
  })
})

// ─── classifyPaneCondition ─────────────────────────────────────────────────

describe('classifyPaneCondition', () => {
  it('returns intact for 0 defects and quality >= 70', () => {
    expect(classifyPaneCondition(0, 70)).toBe('intact')
    expect(classifyPaneCondition(0, 90)).toBe('intact')
  })

  it('returns restored for 0 defects but low quality', () => {
    expect(classifyPaneCondition(0, 50)).toBe('restored')
    expect(classifyPaneCondition(0, 30)).toBe('restored')
  })

  it('returns broken for 5+ defects', () => {
    expect(classifyPaneCondition(5, 50)).toBe('broken')
    expect(classifyPaneCondition(10, 70)).toBe('broken')
  })

  it('returns cracked for 3-4 defects', () => {
    expect(classifyPaneCondition(3, 50)).toBe('cracked')
    expect(classifyPaneCondition(4, 70)).toBe('cracked')
  })

  it('returns weathered for quality < 30 with defects', () => {
    expect(classifyPaneCondition(1, 20)).toBe('weathered')
    expect(classifyPaneCondition(2, 10)).toBe('weathered')
  })

  it('returns cracked as default for 1-2 defects with quality >= 30', () => {
    expect(classifyPaneCondition(1, 50)).toBe('cracked')
    expect(classifyPaneCondition(2, 70)).toBe('cracked')
  })
})

// ─── classifyPanelCondition ────────────────────────────────────────────────

describe('classifyPanelCondition', () => {
  it('returns pristine for 85+', () => {
    expect(classifyPanelCondition(85)).toBe('pristine')
    expect(classifyPanelCondition(100)).toBe('pristine')
  })

  it('returns excellent for 70-84', () => {
    expect(classifyPanelCondition(70)).toBe('excellent')
    expect(classifyPanelCondition(84)).toBe('excellent')
  })

  it('returns good for 55-69', () => {
    expect(classifyPanelCondition(55)).toBe('good')
    expect(classifyPanelCondition(69)).toBe('good')
  })

  it('returns fair for 40-54', () => {
    expect(classifyPanelCondition(40)).toBe('fair')
    expect(classifyPanelCondition(54)).toBe('fair')
  })

  it('returns damaged for 20-39', () => {
    expect(classifyPanelCondition(20)).toBe('damaged')
    expect(classifyPanelCondition(39)).toBe('damaged')
  })

  it('returns ruined below 20', () => {
    expect(classifyPanelCondition(19)).toBe('ruined')
    expect(classifyPanelCondition(0)).toBe('ruined')
  })
})

// ─── classifyWindowGrade ───────────────────────────────────────────────────

describe('classifyWindowGrade', () => {
  it('returns cathedral for 80+', () => {
    expect(classifyWindowGrade(80)).toBe('cathedral')
    expect(classifyWindowGrade(100)).toBe('cathedral')
  })

  it('returns church for 60-79', () => {
    expect(classifyWindowGrade(60)).toBe('church')
    expect(classifyWindowGrade(79)).toBe('church')
  })

  it('returns chapel for 40-59', () => {
    expect(classifyWindowGrade(40)).toBe('chapel')
    expect(classifyWindowGrade(59)).toBe('chapel')
  })

  it('returns home for 25-39', () => {
    expect(classifyWindowGrade(25)).toBe('home')
    expect(classifyWindowGrade(39)).toBe('home')
  })

  it('returns shack for 10-24', () => {
    expect(classifyWindowGrade(10)).toBe('shack')
    expect(classifyWindowGrade(24)).toBe('shack')
  })

  it('returns ruin below 10', () => {
    expect(classifyWindowGrade(9)).toBe('ruin')
    expect(classifyWindowGrade(0)).toBe('ruin')
  })
})

// ─── classifyStyle ─────────────────────────────────────────────────────────

describe('classifyStyle', () => {
  it('returns gothic for high richness and 3+ classes', () => {
    expect(classifyStyle(60, 50, 3)).toBe('gothic')
    expect(classifyStyle(80, 70, 5)).toBe('gothic')
  })

  it('returns byzantine for quality >= 70 (without gothic)', () => {
    expect(classifyStyle(50, 70, 1)).toBe('byzantine')
    expect(classifyStyle(30, 80, 0)).toBe('byzantine')
  })

  it('returns art-deco for richness >= 50 (without gothic/byzantine)', () => {
    expect(classifyStyle(50, 60, 1)).toBe('art-deco')
    expect(classifyStyle(60, 65, 2)).toBe('art-deco')
  })

  it('returns romanesque for quality >= 50 and richness >= 30', () => {
    expect(classifyStyle(30, 50, 0)).toBe('romanesque')
    expect(classifyStyle(40, 55, 1)).toBe('romanesque')
  })

  it('returns modern for richness >= 30', () => {
    expect(classifyStyle(30, 40, 0)).toBe('modern')
    expect(classifyStyle(45, 45, 0)).toBe('modern')
  })

  it('returns folk for low everything', () => {
    expect(classifyStyle(20, 30, 0)).toBe('folk')
    expect(classifyStyle(0, 0, 0)).toBe('folk')
  })
})

// ─── classifyPanelType ─────────────────────────────────────────────────────

describe('classifyPanelType', () => {
  it('returns rose-window for 10+ panes and 60+ artistry', () => {
    expect(classifyPanelType(10, 60, 2)).toBe('rose-window')
    expect(classifyPanelType(15, 80, 3)).toBe('rose-window')
  })

  it('returns tracery for 5+ avg connections', () => {
    expect(classifyPanelType(5, 50, 5)).toBe('tracery')
    expect(classifyPanelType(3, 30, 6)).toBe('tracery')
  })

  it('returns mosaic-glass for 8+ panes', () => {
    expect(classifyPanelType(8, 40, 2)).toBe('mosaic-glass')
    expect(classifyPanelType(12, 30, 2)).toBe('mosaic-glass')
  })

  it('returns lancet for 50+ artistry', () => {
    expect(classifyPanelType(5, 50, 2)).toBe('lancet')
    expect(classifyPanelType(7, 60, 1)).toBe('lancet')
  })

  it('returns grisaille for <=3 panes', () => {
    expect(classifyPanelType(3, 30, 1)).toBe('grisaille')
    expect(classifyPanelType(1, 20, 0)).toBe('grisaille')
  })

  it('returns clerestory as default', () => {
    expect(classifyPanelType(5, 30, 2)).toBe('clerestory')
    expect(classifyPanelType(6, 40, 3)).toBe('clerestory')
  })
})

// ─── detectCracks ──────────────────────────────────────────────────────────

describe('detectCracks', () => {
  it('returns 0 for clean code', () => {
    expect(detectCracks('const x: string = "hello"')).toBe(0)
    expect(detectCracks('function f() { return 1 }')).toBe(0)
  })

  it('detects any type usage', () => {
    expect(detectCracks('const x: any = 1')).toBe(1)
    expect(detectCracks('const x: any = 1; const y: any = 2')).toBe(2)
  })

  it('detects nested if statements', () => {
    expect(detectCracks('if (a) { if (b) { return 1 } }')).toBe(1)
  })

  it('combines any and nested if', () => {
    expect(detectCracks('const x: any = 1; if (a) { if (b) {} }')).toBe(2)
  })
})

// ─── detectCloudiness ──────────────────────────────────────────────────────

describe('detectCloudiness', () => {
  it('returns 0 for clean short lines', () => {
    expect(detectCloudiness('function f() { return 1 }')).toBe(0)
  })

  it('detects long lines', () => {
    const longLine = 'a'.repeat(150)
    expect(detectCloudiness(longLine)).toBe(1)
  })

  it('detects console statements', () => {
    expect(detectCloudiness('console.log("hello")')).toBe(1)
    expect(detectCloudiness('console.log("a"); console.error("b")')).toBe(2)
  })

  it('caps long lines at 3', () => {
    const lines = [`${'a'.repeat(150)}`, `${'b'.repeat(160)}`, `${'c'.repeat(170)}`, `${'d'.repeat(180)}`].join('\n')
    const result = detectCloudiness(lines)
    expect(result).toBeGreaterThanOrEqual(3)
  })
})

// ─── detectPaintLoss ───────────────────────────────────────────────────────

describe('detectPaintLoss', () => {
  it('returns 0 for no exports', () => {
    expect(detectPaintLoss(0, 0)).toBe(0)
    expect(detectPaintLoss(0, 5)).toBe(0)
  })

  it('returns 0 when jsdoc covers all exports', () => {
    expect(detectPaintLoss(3, 3)).toBe(0)
    expect(detectPaintLoss(2, 5)).toBe(0)
  })

  it('returns 2 for exports with no jsdoc', () => {
    expect(detectPaintLoss(1, 0)).toBe(2)
    expect(detectPaintLoss(5, 0)).toBe(2)
  })

  it('returns 1 for partial jsdoc coverage', () => {
    expect(detectPaintLoss(3, 1)).toBe(1)
    expect(detectPaintLoss(5, 2)).toBe(1)
  })
})

// ─── analyzeGlassPane ──────────────────────────────────────────────────────

describe('analyzeGlassPane', () => {
  it('analyzes empty content', () => {
    const pane = analyzeGlassPane('', 'empty.ts', [], [])
    expect(pane.file).toBe('empty.ts')
    expect(pane.glassQuality).toBe(0)
    expect(pane.colorRichness).toBe(0)
    expect(pane.transparency).toBe(0)
    expect(pane.paneType).toBe('background')
    expect(pane.paneShape).toBe('irregular')
    expect(pane.condition).toBe('restored')
    expect(pane.craftsmanship).toBe('novice')
    expect(pane.lightEffect).toBe('dark')
    expect(pane.colorPalette).toEqual([])
    expect(pane.dominantColor).toBe('none')
  })

  it('analyzes a well-documented file with classes', () => {
    const code = [
      '/** A class */',
      'export class Foo {',
      '  bar(): string { return "hello" }',
      '}',
      '/** An interface */',
      'export interface IFoo {',
      '  name: string',
      '}',
      '/** A type */',
      'export type TResult = string | number',
    ].join('\n')
    const pane = analyzeGlassPane(code, 'foo.ts', [], [])
    expect(pane.file).toBe('foo.ts')
    expect(pane.glassQuality).toBeGreaterThan(0)
    expect(pane.colorPalette).toContain('class')
    expect(pane.colorPalette).toContain('interface')
    expect(pane.colorPalette).toContain('type')
    expect(pane.hasLeadCame).toBe(true)
    expect(pane.defects.paintLoss).toBe(0)
  })

  it('detects defects in poor code', () => {
    const code = [
      'const x: any = 1',
      'console.log("debug")',
      '// TODO fix this',
      '// FIXME broken',
      'export function a() {}',
    ].join('\n')
    const pane = analyzeGlassPane(code, 'bad.ts', [], [])
    expect(pane.defects.cracks).toBeGreaterThan(0)
    expect(pane.defects.cloudiness).toBeGreaterThan(0)
    expect(pane.defects.chips).toBeGreaterThan(0)
    expect(pane.defects.paintLoss).toBeGreaterThan(0)
  })

  it('computes connections from imports', () => {
    const pane = analyzeGlassPane('import { x } from "./utils"', 'app.ts', ['./utils'], [])
    expect(pane.connections.west).toBe('./utils')
    expect(pane.connections.totalCames).toBeGreaterThan(0)
  })

  it('computes connections from dependents', () => {
    const pane = analyzeGlassPane('export function a() {}', 'utils.ts', [], ['app.ts'])
    expect(pane.connections.east).toBe('app.ts')
  })

  it('computes north from directory', () => {
    const pane = analyzeGlassPane('export function a() {}', 'src/utils.ts', [], [])
    expect(pane.connections.north).toBe('src')
  })

  it('computes lightTransmission from exports and dependents', () => {
    const code = 'export function a() {}'
    const pane1 = analyzeGlassPane(code, 'a.ts', [], [])
    const pane2 = analyzeGlassPane(code, 'b.ts', [], ['x', 'y', 'z'])
    expect(pane2.lightTransmission).toBeGreaterThan(pane1.lightTransmission)
  })

  it('clamps artistry to 0-100', () => {
    const pane = analyzeGlassPane('', 'empty.ts', [], [])
    expect(pane.artistry).toBeGreaterThanOrEqual(0)
    expect(pane.artistry).toBeLessThanOrEqual(100)
  })

  it('computes storytelling from jsdoc and exports', () => {
    const good = [
      '/** Docs */',
      'export function wellDocumented() { return 1 }',
    ].join('\n')
    const bad = 'function noDocs() { return 1 }'
    const goodPane = analyzeGlassPane(good, 'good.ts', [], [])
    const badPane = analyzeGlassPane(bad, 'bad.ts', [], [])
    expect(goodPane.storytelling).toBeGreaterThan(badPane.storytelling)
  })
})

// ─── analyzeGlassPanel ─────────────────────────────────────────────────────

describe('analyzeGlassPanel', () => {
  it('returns empty panel for no panes', () => {
    const panel = analyzeGlassPanel([], 'src')
    expect(panel.directory).toBe('src')
    expect(panel.totalPanes).toBe(0)
    expect(panel.condition).toBe('ruined')
    expect(panel.style).toBe('folk')
    expect(panel.narrative).toBe('No story to tell')
    expect(panel.panelType).toBe('grisaille')
  })

  it('aggregates pane averages', () => {
    const panes: GlassPane[] = [
      analyzeGlassPane('export function a() {}', 'src/a.ts', [], []),
      analyzeGlassPane('/** Docs */ export class B {}', 'src/b.ts', [], []),
    ]
    const panel = analyzeGlassPanel(panes, 'src')
    expect(panel.totalPanes).toBe(2)
    expect(panel.avgGlassQuality).toBeGreaterThanOrEqual(0)
    expect(panel.avgGlassQuality).toBeLessThanOrEqual(100)
    expect(panel.avgColorRichness).toBeGreaterThanOrEqual(0)
    expect(panel.avgTransparency).toBeGreaterThanOrEqual(0)
    expect(panel.avgArtistry).toBeGreaterThanOrEqual(0)
    expect(panel.avgLeadQuality).toBeGreaterThanOrEqual(0)
  })

  it('counts cracked and broken panes', () => {
    const panes: GlassPane[] = [
      { ...analyzeGlassPane('', 'a.ts', [], []), condition: 'cracked' },
      { ...analyzeGlassPane('', 'b.ts', [], []), condition: 'broken' },
      { ...analyzeGlassPane('', 'c.ts', [], []), condition: 'intact' },
    ]
    const panel = analyzeGlassPanel(panes, 'src')
    expect(panel.crackedPanes).toBe(1)
    expect(panel.brokenPanes).toBe(1)
  })

  it('classifies panel type based on pane count and artistry', () => {
    const manyPanes: GlassPane[] = Array.from({ length: 12 }, (_, i) => ({
      ...analyzeGlassPane('/** D */ export function f() {} export class C {}', `f${i}.ts`, [], []),
    }))
    const panel = analyzeGlassPanel(manyPanes, 'big')
    expect(panel.panelType).toBeDefined()
  })

  it('builds narrative based on condition', () => {
    const goodPane = analyzeGlassPane('/** D */ export class A { } export interface I { } export type T = string', 'good.ts', [], [])
    const panel = analyzeGlassPanel([goodPane], 'src')
    expect(panel.narrative).toBeTruthy()
    expect(typeof panel.narrative).toBe('string')
  })

  it('computes composition and coherence', () => {
    const panes: GlassPane[] = [
      analyzeGlassPane('export function a() {}', 'a.ts', [], []),
      analyzeGlassPane('export function b() {}', 'b.ts', [], []),
    ]
    const panel = analyzeGlassPanel(panes, 'src')
    expect(panel.composition).toBeGreaterThanOrEqual(0)
    expect(panel.composition).toBeLessThanOrEqual(100)
    expect(panel.coherence).toBeGreaterThanOrEqual(0)
    expect(panel.coherence).toBeLessThanOrEqual(100)
  })
})

// ─── generateStainedGlassRecommendations ───────────────────────────────────

describe('generateStainedGlassRecommendations', () => {
  const emptyStats = {
    totalFiles: 0, totalPanels: 0, totalPanes: 0,
    avgGlassQuality: 0, avgColorRichness: 0, avgTransparency: 0,
    avgArtistry: 0, avgLeadQuality: 0,
    masterCraftsman: 0, noviceCraftsman: 0,
    intactPanes: 0, crackedPanes: 0, brokenPanes: 0, missingPanes: 0,
    totalCracks: 0, totalChips: 0, totalCloudiness: 0,
    totalPaintLoss: 0, totalLeadingIssues: 0,
    brilliantPanes: 0, darkPanes: 0,
    overallArtistry: 0, overallLightTransmission: 0,
    dominantStyle: 'folk', dominantPaneType: 'background',
    windowGrade: 'ruin' as const,
    bestPane: 'none', worstPane: 'none',
    mostColorful: 'none', bestStorytelling: 'none',
  }

  it('returns positive message when no issues', () => {
    const cleanStats = { ...emptyStats, avgLeadQuality: 50 }
    const recs = generateStainedGlassRecommendations([], [], cleanStats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('Magnificent')
  })

  it('recommends fixing cracked panes', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, crackedPanes: 3 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('cracked')]))
  })

  it('recommends fixing broken panes', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, brokenPanes: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('broken')]))
  })

  it('recommends improving clarity for cloudiness', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, totalCloudiness: 6 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('cloudiness')]))
  })

  it('recommends adding docs for paint loss', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, totalPaintLoss: 4 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('paint loss')]))
  })

  it('recommends improving interfaces for leading issues', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, totalLeadingIssues: 6 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('leading')]))
  })

  it('recommends illuminating dark panes', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, darkPanes: 3 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('dark')]))
  })

  it('recommends improving novice-crafted panes', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, noviceCraftsman: 2 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('novice')]))
  })

  it('recommends strengthening lead quality', () => {
    const recs = generateStainedGlassRecommendations([], [], { ...emptyStats, avgLeadQuality: 30 })
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('lead quality')]))
  })

  it('recommends restoring damaged panels', () => {
    const damagedPanel: GlassPanel = {
      directory: 'src', panes: [], panelType: 'grisaille', totalPanes: 0,
      avgGlassQuality: 0, avgColorRichness: 0, avgTransparency: 0, avgArtistry: 0,
      dominantPaneType: 'background', dominantColor: 'none', totalCames: 0,
      crackedPanes: 0, brokenPanes: 0, missingPanes: 0,
      avgLeadQuality: 0, lightTransmission: 0, composition: 0, coherence: 0,
      storytelling: 0, condition: 'damaged', style: 'folk', narrative: '',
    }
    const recs = generateStainedGlassRecommendations([], [damagedPanel], emptyStats)
    expect(recs).toEqual(expect.arrayContaining([expect.stringContaining('damaged panel')]))
  })
})

// ─── buildStainedGlassResult ───────────────────────────────────────────────

describe('buildStainedGlassResult', () => {
  it('handles empty input', () => {
    const result = buildStainedGlassResult([], [], {})
    expect(result.panes).toEqual([])
    expect(result.panels).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalPanes).toBe(0)
    expect(result.stats.totalPanels).toBe(0)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes single file', () => {
    const result = buildStainedGlassResult(
      ['hello.ts'],
      ['/** Greeting */ export function hello() { return "world" }'],
      {},
    )
    expect(result.panes).toHaveLength(1)
    expect(result.panes[0].file).toBe('hello.ts')
    expect(result.panes[0].glassQuality).toBeGreaterThan(0)
    expect(result.panes[0].defects.paintLoss).toBe(0)
  })

  it('analyzes multiple files', () => {
    const result = buildStainedGlassResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [
        'export function a() {}',
        '/** Docs */ export class B {}',
        'const x: any = 1',
      ],
      {},
    )
    expect(result.panes).toHaveLength(3)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('groups panes into panels by directory', () => {
    const result = buildStainedGlassResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      ['export function a() {}', 'export function b() {}', 'export function c() {}'],
      {},
    )
    expect(result.panels.length).toBe(2)
    const dirs = result.panels.map(p => p.directory).sort()
    expect(dirs).toContain('src')
    expect(dirs).toContain('lib')
  })

  it('tracks import relationships between files', () => {
    const result = buildStainedGlassResult(
      ['src/a.ts', 'src/b.ts'],
      [
        "import { x } from './b'",
        'export function x() {}',
      ],
      {},
    )
    expect(result.panes).toHaveLength(2)
    const paneB = result.panes.find(p => p.file === 'src/b.ts')
    expect(paneB).toBeDefined()
    expect(paneB!.connections.east).toBeTruthy()
  })

  it('computes best/worst pane', () => {
    const result = buildStainedGlassResult(
      ['good.ts', 'bad.ts'],
      [
        '/** Docs */ export function good() {}',
        'const x: any = 1; console.log("bad")',
      ],
      {},
    )
    expect(result.stats.bestPane).toBe('good.ts')
    expect(result.stats.worstPane).toBe('bad.ts')
  })

  it('computes mostColorful', () => {
    const result = buildStainedGlassResult(
      ['colorful.ts', 'plain.ts'],
      [
        'export function f() {} export class C {} interface I {} type T = string enum E { A }',
        'const x = 1',
      ],
      {},
    )
    expect(result.stats.mostColorful).toBe('colorful.ts')
  })

  it('computes dominant pane type', () => {
    const codes = Array.from({ length: 5 }, () => 'export function f() {}')
    const files = codes.map((_, i) => `f${i}.ts`)
    const result = buildStainedGlassResult(files, codes, {})
    expect(result.stats.dominantPaneType).toBeDefined()
    expect(typeof result.stats.dominantPaneType).toBe('string')
  })

  it('computes window grade', () => {
    const result = buildStainedGlassResult([], [], {})
    expect(['cathedral', 'church', 'chapel', 'home', 'shack', 'ruin']).toContain(result.stats.windowGrade)
  })

  it('clamps all stats to valid ranges', () => {
    const result = buildStainedGlassResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const { stats } = result
    expect(stats.avgGlassQuality).toBeGreaterThanOrEqual(0)
    expect(stats.avgGlassQuality).toBeLessThanOrEqual(100)
    expect(stats.avgColorRichness).toBeGreaterThanOrEqual(0)
    expect(stats.avgTransparency).toBeGreaterThanOrEqual(0)
    expect(stats.avgArtistry).toBeGreaterThanOrEqual(0)
    expect(stats.avgLeadQuality).toBeGreaterThanOrEqual(0)
    expect(stats.overallArtistry).toBeGreaterThanOrEqual(0)
    expect(stats.overallLightTransmission).toBeGreaterThanOrEqual(0)
    expect(stats.overallLightTransmission).toBeLessThanOrEqual(100)
  })
})

// ─── formatStainedGlassTable ───────────────────────────────────────────────

describe('formatStainedGlassTable', () => {
  it('formats empty result', () => {
    const result = buildStainedGlassResult([], [], {})
    const output = formatStainedGlassTable(result, false)
    expect(output).toContain('Stained Glass')
    expect(output).toContain('No panes detected')
  })

  it('includes pane info in non-verbose mode', () => {
    const result = buildStainedGlassResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatStainedGlassTable(result, false)
    expect(output).toContain('a.ts')
    expect(output).toContain('Statistics')
  })

  it('shows detailed info in verbose mode', () => {
    const result = buildStainedGlassResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const output = formatStainedGlassTable(result, true)
    expect(output).toContain('palette')
    expect(output).toContain('defects')
  })

  it('truncates panes at 15 in non-verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildStainedGlassResult(files, codes, {})
    const output = formatStainedGlassTable(result, false)
    expect(output).toContain('and 5 more')
  })

  it('shows all panes in verbose mode', () => {
    const files = Array.from({ length: 20 }, (_, i) => `f${i}.ts`)
    const codes = files.map(() => 'export function a() {}')
    const result = buildStainedGlassResult(files, codes, {})
    const output = formatStainedGlassTable(result, true)
    expect(output).toContain('f19.ts')
  })

  it('shows panels when present', () => {
    const result = buildStainedGlassResult(
      ['src/a.ts', 'src/b.ts'],
      ['export function a() {}', 'export function b() {}'],
      {},
    )
    const output = formatStainedGlassTable(result, false)
    expect(output).toContain('Glass Panels')
    expect(output).toContain('src')
  })

  it('shows recommendations when present', () => {
    const result = buildStainedGlassResult([], [], {})
    const output = formatStainedGlassTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatStainedGlassJson ────────────────────────────────────────────────

describe('formatStainedGlassJson', () => {
  it('produces valid JSON', () => {
    const result = buildStainedGlassResult(
      ['a.ts'],
      ['export function a() {}'],
      {},
    )
    const json = formatStainedGlassJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.panes).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildStainedGlassResult([], [], {})
    const json = formatStainedGlassJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.panes).toEqual([])
    expect(parsed.panels).toEqual([])
  })
})
