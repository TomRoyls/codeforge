import { describe, it, expect } from 'vitest'
import {
  classifyReliefType,
  classifySculptorGrade,
  assessCondition,
  classifyPanelType,
  analyzeReliefElement,
  analyzeReliefPanel,
  computeDepthScore,
  computeCompositionScore,
  generateBasReliefRecommendations,
  buildBasReliefResult,
  type BasReliefStats,
} from '../src/commands/bas-relief-helpers.js'
import { formatBasReliefTable, formatBasReliefJson } from '../src/commands/bas-relief-format-helpers.js'

// ─── classifyReliefType ──────────────────────────────────────────────────────

describe('classifyReliefType', () => {
  it('returns alto-rilievo for high projection', () => {
    expect(classifyReliefType(90)).toBe('alto-rilievo')
  })

  it('returns mezzo-rilievo for moderate-high projection', () => {
    expect(classifyReliefType(65)).toBe('mezzo-rilievo')
  })

  it('returns basso-rilievo for moderate projection', () => {
    expect(classifyReliefType(45)).toBe('basso-rilievo')
  })

  it('returns stiacciato for low projection', () => {
    expect(classifyReliefType(30)).toBe('stiacciato')
  })

  it('returns sunken for very low projection', () => {
    expect(classifyReliefType(15)).toBe('sunken')
  })

  it('returns flat for zero projection', () => {
    expect(classifyReliefType(0)).toBe('flat')
  })

  it('returns flat for projection of 5', () => {
    expect(classifyReliefType(5)).toBe('flat')
  })

  it('handles boundary at 80', () => {
    expect(classifyReliefType(80)).toBe('alto-rilievo')
  })

  it('handles boundary at 60', () => {
    expect(classifyReliefType(60)).toBe('mezzo-rilievo')
  })

  it('handles boundary at 40', () => {
    expect(classifyReliefType(40)).toBe('basso-rilievo')
  })

  it('handles boundary at 25', () => {
    expect(classifyReliefType(25)).toBe('stiacciato')
  })

  it('handles boundary at 10', () => {
    expect(classifyReliefType(10)).toBe('sunken')
  })
})

// ─── classifySculptorGrade ───────────────────────────────────────────────────

describe('classifySculptorGrade', () => {
  it('returns master-sculptor for high quality', () => {
    expect(classifySculptorGrade(90)).toBe('master-sculptor')
  })

  it('returns skilled-artisan for good quality', () => {
    expect(classifySculptorGrade(65)).toBe('skilled-artisan')
  })

  it('returns apprentice for moderate quality', () => {
    expect(classifySculptorGrade(45)).toBe('apprentice')
  })

  it('returns novice for low quality', () => {
    expect(classifySculptorGrade(25)).toBe('novice')
  })

  it('returns amateur for very low quality', () => {
    expect(classifySculptorGrade(10)).toBe('amateur')
  })

  it('handles boundary at 80', () => {
    expect(classifySculptorGrade(80)).toBe('master-sculptor')
  })

  it('handles boundary at 60', () => {
    expect(classifySculptorGrade(60)).toBe('skilled-artisan')
  })

  it('handles boundary at 40', () => {
    expect(classifySculptorGrade(40)).toBe('apprentice')
  })

  it('handles boundary at 20', () => {
    expect(classifySculptorGrade(20)).toBe('novice')
  })

  it('handles zero', () => {
    expect(classifySculptorGrade(0)).toBe('amateur')
  })
})

// ─── assessCondition ─────────────────────────────────────────────────────────

describe('assessCondition', () => {
  it('returns intact for clean, high-projection element', () => {
    expect(assessCondition({ issues: [], projection: 80, storyCoherence: 90 })).toBe('intact')
  })

  it('returns intact when no issues and projection at 60', () => {
    expect(assessCondition({ issues: [], projection: 60, storyCoherence: 70 })).toBe('intact')
  })

  it('returns weathered for minor issues', () => {
    expect(assessCondition({ issues: ['one issue'], projection: 50, storyCoherence: 40 })).toBe('weathered')
  })

  it('returns damaged for many issues', () => {
    expect(assessCondition({ issues: ['a', 'b', 'c'], projection: 50, storyCoherence: 50 })).toBe('damaged')
  })

  it('returns fragment for low projection with issues', () => {
    expect(assessCondition({ issues: ['x'], projection: 20, storyCoherence: 20 })).toBe('fragment')
  })

  it('returns restored for moderate state', () => {
    expect(assessCondition({ issues: ['a', 'b'], projection: 30, storyCoherence: 30 })).toBe('restored')
  })

  it('returns restored for 0 issues with low projection and coherence', () => {
    expect(assessCondition({ issues: [], projection: 30, storyCoherence: 30 })).toBe('restored')
  })
})

// ─── classifyPanelType ───────────────────────────────────────────────────────

describe('classifyPanelType', () => {
  it('returns ornamental for empty elements', () => {
    expect(classifyPanelType([], 0)).toBe('ornamental')
  })

  it('returns narrative for coherent elements with layers', () => {
    const elements = Array.from({ length: 5 }, () => ({
      reliefType: 'alto-rilievo' as const,
      storyCoherence: 70,
    }))
    expect(classifyPanelType(elements as any, 3)).toBe('narrative')
  })

  it('returns commemorative when mostly alto-rilievo', () => {
    const elements = Array.from({ length: 4 }, () => ({
      reliefType: 'alto-rilievo' as const,
      storyCoherence: 30,
    }))
    expect(classifyPanelType(elements as any, 1)).toBe('commemorative')
  })

  it('returns ornamental when mostly flat', () => {
    const elements = Array.from({ length: 5 }, () => ({
      reliefType: 'flat' as const,
      storyCoherence: 30,
    }))
    expect(classifyPanelType(elements as any, 1)).toBe('ornamental')
  })

  it('returns architectural for many layers', () => {
    const elements = [{ reliefType: 'mezzo-rilievo' as const, storyCoherence: 40 }]
    expect(classifyPanelType(elements as any, 4)).toBe('architectural')
  })

  it('returns decorative as default', () => {
    const elements = [{ reliefType: 'mezzo-rilievo' as const, storyCoherence: 30 }]
    expect(classifyPanelType(elements as any, 1)).toBe('decorative')
  })
})

// ─── analyzeReliefElement ────────────────────────────────────────────────────

describe('analyzeReliefElement', () => {
  it('returns correct structure for well-crafted code', () => {
    const code = `/**
 * Add two numbers
 * @example add(1, 2) // 3
 */
export function add(a: number, b: number): number {
  return a + b
}

export function subtract(a: number, b: number): number {
  return a - b
}

export interface Calculator {
  add: (a: number, b: number) => number
  subtract: (a: number, b: number) => number
}`
    const result = analyzeReliefElement(code, 'calc.ts')

    expect(result.file).toBe('calc.ts')
    expect(result.projection).toBeGreaterThanOrEqual(0)
    expect(result.projection).toBeLessThanOrEqual(100)
    expect(result.depth).toBeGreaterThanOrEqual(0)
    expect(result.depth).toBeLessThanOrEqual(100)
    expect(result.definition).toBeGreaterThanOrEqual(0)
    expect(result.background).toBeGreaterThanOrEqual(0)
    expect(result.foreground).toBeGreaterThanOrEqual(0)
    expect(result.sculpturalQuality).toBeGreaterThanOrEqual(0)
    expect(result.storyCoherence).toBeGreaterThanOrEqual(0)
    expect(Array.isArray(result.issues)).toBe(true)
    expect(Array.isArray(result.highlights)).toBe(true)
  })

  it('returns low scores for empty content', () => {
    const result = analyzeReliefElement('', 'empty.ts')
    expect(result.projection).toBe(0)
    expect(result.depth).toBe(0)
    expect(result.definition).toBe(0)
    expect(result.reliefType).toBe('flat')
    expect(result.viewerAngle).toBe('hidden')
  })

  it('detects any types as issues', () => {
    const code = 'export function bad(x: any): any { return x }'
    const result = analyzeReliefElement(code, 'bad.ts')
    expect(result.issues.some(i => i.includes('any type'))).toBe(true)
  })

  it('detects TODO as issues', () => {
    const code = 'export function todo() { // TODO fix this\n return 1 }'
    const result = analyzeReliefElement(code, 'todo.ts')
    expect(result.issues.some(i => i.includes('TODO'))).toBe(true)
  })

  it('classifies reliefType based on projection', () => {
    const empty = analyzeReliefElement('', 'e.ts')
    expect(empty.reliefType).toBe('flat')
  })

  it('computes composition with layers', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport interface I {}'
    const result = analyzeReliefElement(code, 'multi.ts')
    expect(result.composition.layers).toBeGreaterThanOrEqual(1)
    expect(typeof result.composition.dominantElement).toBe('string')
    expect(typeof result.composition.isCompositional).toBe('boolean')
  })

  it('computes carving metrics', () => {
    const code = 'export function a() { /* long comment line here */ }'
    const result = analyzeReliefElement(code, 'carve.ts')
    expect(typeof result.carving.chiselMarks).toBe('number')
    expect(typeof result.carving.smoothAreas).toBe('number')
    expect(typeof result.carving.roughAreas).toBe('number')
    expect(typeof result.carving.polishedAreas).toBe('number')
  })

  it('computes projection map', () => {
    const code = 'export function a() {}'
    const result = analyzeReliefElement(code, 'pm.ts')
    expect(result.projectionMap.surface).toBeGreaterThanOrEqual(0)
    expect(result.projectionMap.midRelief).toBeGreaterThanOrEqual(0)
    expect(result.projectionMap.deepRelief).toBeGreaterThanOrEqual(0)
    expect(result.projectionMap.background).toBeGreaterThanOrEqual(0)
  })

  it('has valid viewerAngle', () => {
    const code = 'export function a() {}'
    const result = analyzeReliefElement(code, 'v.ts')
    expect(['frontal', 'three-quarter', 'profile', 'hidden']).toContain(result.viewerAngle)
  })

  it('has valid condition', () => {
    const code = 'const x = 1'
    const result = analyzeReliefElement(code, 'c.ts')
    expect(['intact', 'weathered', 'damaged', 'restored', 'fragment']).toContain(result.condition)
  })

  it('detects console calls as rough areas', () => {
    const code = 'export function a() { console.log("a"); console.log("b"); console.log("c") }'
    const result = analyzeReliefElement(code, 'console.ts')
    expect(result.issues.some(i => i.includes('console'))).toBe(true)
  })

  it('detects highlights for well-crafted code', () => {
    const code = `/** Docs */
export function add(a: number, b: number): number { return a + b }
export function sub(a: number, b: number): number { return a - b }
export function mul(a: number, b: number): number { return a * b }`
    const result = analyzeReliefElement(code, 'good.ts')
    expect(result.highlights.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── analyzeReliefPanel ──────────────────────────────────────────────────────

describe('analyzeReliefPanel', () => {
  it('returns default panel for empty elements', () => {
    const panel = analyzeReliefPanel([], 'empty-dir')
    expect(panel.directory).toBe('empty-dir')
    expect(panel.panelType).toBe('ornamental')
    expect(panel.condition).toBe('lost')
    expect(panel.focalElement).toBe('none')
    expect(panel.avgProjection).toBe(0)
  })

  it('aggregates metrics from elements', () => {
    const code = 'export function a() {}'
    const elements = [
      analyzeReliefElement(code, 'dir/a.ts'),
      analyzeReliefElement(code, 'dir/b.ts'),
    ]
    const panel = analyzeReliefPanel(elements, 'dir')
    expect(panel.directory).toBe('dir')
    expect(panel.elements.length).toBe(2)
    expect(panel.avgProjection).toBeGreaterThanOrEqual(0)
    expect(panel.avgDefinition).toBeGreaterThanOrEqual(0)
    expect(panel.avgSculpturalQuality).toBeGreaterThanOrEqual(0)
  })

  it('identifies focal element', () => {
    const highCode = 'export function main() {}\nexport function helper() {}'
    const lowCode = 'const x = 1'
    const elements = [
      analyzeReliefElement(highCode, 'dir/main.ts'),
      analyzeReliefElement(lowCode, 'dir/minor.ts'),
    ]
    const panel = analyzeReliefPanel(elements, 'dir')
    expect(panel.focalElement).toBe('dir/main.ts')
  })

  it('computes depth range', () => {
    const elements = [
      analyzeReliefElement('export function a() {}', 'dir/a.ts'),
      analyzeReliefElement('', 'dir/b.ts'),
    ]
    const panel = analyzeReliefPanel(elements, 'dir')
    expect(panel.depthRange.min).toBeLessThanOrEqual(panel.depthRange.max)
  })

  it('generates narrative', () => {
    const code = 'export function a() {}'
    const elements = [analyzeReliefElement(code, 'dir/a.ts')]
    const panel = analyzeReliefPanel(elements, 'dir')
    expect(typeof panel.narrative).toBe('string')
    expect(panel.narrative.length).toBeGreaterThan(0)
  })

  it('sets isCoherent based on story coherence', () => {
    const goodCode = '/** doc */\nexport function a() {}\nexport function b() {}'
    const elements = [
      analyzeReliefElement(goodCode, 'dir/a.ts'),
      analyzeReliefElement(goodCode, 'dir/b.ts'),
    ]
    const panel = analyzeReliefPanel(elements, 'dir')
    expect(typeof panel.isCoherent).toBe('boolean')
  })
})

// ─── computeDepthScore ───────────────────────────────────────────────────────

describe('computeDepthScore', () => {
  it('returns 0 for empty elements', () => {
    expect(computeDepthScore([])).toBe(0)
  })

  it('computes score from element depths', () => {
    const code = 'export function a() {}'
    const elements = [analyzeReliefElement(code, 'a.ts')]
    const score = computeDepthScore(elements)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('higher depths produce higher scores', () => {
    const shallow = analyzeReliefElement('const x = 1', 's.ts')
    const deep = analyzeReliefElement('import { a } from "b"\nexport function c() {}\nexport interface D {}', 'd.ts')
    const shallowScore = computeDepthScore([shallow])
    const deepScore = computeDepthScore([deep])
    expect(deepScore).toBeGreaterThanOrEqual(shallowScore)
  })
})

// ─── computeCompositionScore ─────────────────────────────────────────────────

describe('computeCompositionScore', () => {
  it('returns 0 for empty elements', () => {
    expect(computeCompositionScore([], [])).toBe(0)
  })

  it('computes score from composition data', () => {
    const code = 'export function a() {}'
    const elements = [analyzeReliefElement(code, 'a.ts')]
    const panel = analyzeReliefPanel(elements, '.')
    const score = computeCompositionScore(elements, [panel])
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores compositional elements higher', () => {
    const goodCode = '/** doc */\nexport function a() {}\nexport interface I { x: number }'
    const badCode = 'const x = 1'
    const goodEl = analyzeReliefElement(goodCode, 'g.ts')
    const badEl = analyzeReliefElement(badCode, 'b.ts')
    const goodScore = computeCompositionScore([goodEl], [])
    const badScore = computeCompositionScore([badEl], [])
    expect(goodScore).toBeGreaterThanOrEqual(badScore)
  })
})

// ─── generateBasReliefRecommendations ────────────────────────────────────────

describe('generateBasReliefRecommendations', () => {
  it('returns positive message when no issues', () => {
    const stats: BasReliefStats = createMockStats()
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('Masterful'))).toBe(true)
  })

  it('recommends for flat files', () => {
    const stats = createMockStats({ flatFiles: 3 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('flat file'))).toBe(true)
  })

  it('recommends for hidden files', () => {
    const stats = createMockStats({ hiddenFiles: 2 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('hidden file'))).toBe(true)
  })

  it('recommends for damaged files', () => {
    const stats = createMockStats({ damagedFiles: 1 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('damaged file'))).toBe(true)
  })

  it('recommends for low coherence', () => {
    const stats = createMockStats({ avgStoryCoherence: 30 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('coherence'))).toBe(true)
  })

  it('recommends for weak foreground', () => {
    const stats = createMockStats({ avgForeground: 30 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('foreground'))).toBe(true)
  })

  it('recommends for low projection', () => {
    const stats = createMockStats({ avgProjection: 30 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('projection'))).toBe(true)
  })

  it('recommends for shallow depth', () => {
    const stats = createMockStats({ depthScore: 30 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('depth'))).toBe(true)
  })

  it('recommends for poor composition', () => {
    const stats = createMockStats({ compositionScore: 30 })
    const recs = generateBasReliefRecommendations([], [], stats)
    expect(recs.some(r => r.includes('composition'))).toBe(true)
  })
})

// ─── buildBasReliefResult ────────────────────────────────────────────────────

describe('buildBasReliefResult', () => {
  it('handles empty input', () => {
    const result = buildBasReliefResult([], [], {})
    expect(result.elements.length).toBe(0)
    expect(result.panels.length).toBe(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.sculptorGrade).toBe('amateur')
  })

  it('analyzes single file', () => {
    const code = 'export function hello(): string { return "hello" }'
    const result = buildBasReliefResult(['hello.ts'], [code], {})
    expect(result.elements.length).toBe(1)
    expect(result.panels.length).toBe(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.deepestElement).toBe('hello.ts')
    expect(result.stats.shallowestElement).toBe('hello.ts')
  })

  it('groups files by directory', () => {
    const code = 'export function a() {}'
    const result = buildBasReliefResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [code, code, code],
      {},
    )
    expect(result.elements.length).toBe(3)
    expect(result.panels.length).toBe(2)
    expect(result.stats.totalPanels).toBe(2)
  })

  it('computes all stats fields', () => {
    const code = '/** doc */\nexport function a(): number { return 1 }'
    const result = buildBasReliefResult(['a.ts'], [code], {})
    const s = result.stats
    expect(typeof s.avgProjection).toBe('number')
    expect(typeof s.avgDepth).toBe('number')
    expect(typeof s.avgDefinition).toBe('number')
    expect(typeof s.avgBackground).toBe('number')
    expect(typeof s.avgForeground).toBe('number')
    expect(typeof s.avgSculpturalQuality).toBe('number')
    expect(typeof s.avgStoryCoherence).toBe('number')
    expect(typeof s.altoRilievoFiles).toBe('number')
    expect(typeof s.bassoRilievoFiles).toBe('number')
    expect(typeof s.flatFiles).toBe('number')
    expect(typeof s.totalLayers).toBe('number')
    expect(typeof s.intactFiles).toBe('number')
    expect(typeof s.damagedFiles).toBe('number')
    expect(typeof s.frontalFiles).toBe('number')
    expect(typeof s.hiddenFiles).toBe('number')
    expect(typeof s.narrativePanels).toBe('number')
    expect(typeof s.decorativePanels).toBe('number')
    expect(typeof s.overallReliefQuality).toBe('number')
    expect(typeof s.depthScore).toBe('number')
    expect(typeof s.compositionScore).toBe('number')
    expect(typeof s.bestPanel).toBe('string')
    expect(typeof s.worstPanel).toBe('string')
    expect(typeof s.deepestElement).toBe('string')
    expect(typeof s.shallowestElement).toBe('string')
  })

  it('identifies best and worst panel', () => {
    const goodCode = '/** doc */\nexport function a(): number { return 1 }\nexport function b(): number { return 2 }\nexport interface I { x: number }'
    const badCode = 'const x = 1'
    const result = buildBasReliefResult(
      ['src/good.ts', 'test/bad.ts'],
      [goodCode, badCode],
      {},
    )
    expect(result.stats.bestPanel).toBe('src')
    expect(result.stats.worstPanel).toBe('test')
  })
})

// ─── formatBasReliefTable ────────────────────────────────────────────────────

describe('formatBasReliefTable', () => {
  it('formats result as table string', () => {
    const result = buildBasReliefResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBasReliefTable(result, false)
    expect(output).toContain('Bas-Relief')
    expect(output).toContain('Relief Elements')
    expect(output).toContain('Statistics')
  })

  it('shows verbose details', () => {
    const result = buildBasReliefResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBasReliefTable(result, true)
    expect(output).toContain('chisel:')
    expect(output).toContain('surface:')
  })

  it('handles empty result', () => {
    const result = buildBasReliefResult([], [], {})
    const output = formatBasReliefTable(result, false)
    expect(output).toContain('No relief elements detected')
  })

  it('shows recommendations', () => {
    const result = buildBasReliefResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBasReliefTable(result, false)
    expect(output).toContain('Recommendations')
  })
})

// ─── formatBasReliefJson ─────────────────────────────────────────────────────

describe('formatBasReliefJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildBasReliefResult(['a.ts'], ['export function a() {}'], {})
    const output = formatBasReliefJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.elements).toBeDefined()
    expect(parsed.panels).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('handles empty result', () => {
    const result = buildBasReliefResult([], [], {})
    const output = formatBasReliefJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.elements.length).toBe(0)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockStats(overrides: Partial<BasReliefStats> = {}): BasReliefStats {
  return {
    totalFiles: 0,
    totalPanels: 0,
    avgProjection: 70,
    avgDepth: 70,
    avgDefinition: 70,
    avgBackground: 70,
    avgForeground: 70,
    avgSculpturalQuality: 70,
    avgStoryCoherence: 70,
    altoRilievoFiles: 0,
    bassoRilievoFiles: 0,
    flatFiles: 0,
    totalLayers: 0,
    intactFiles: 0,
    damagedFiles: 0,
    frontalFiles: 0,
    hiddenFiles: 0,
    narrativePanels: 0,
    decorativePanels: 0,
    overallReliefQuality: 70,
    depthScore: 70,
    compositionScore: 70,
    sculptorGrade: 'master-sculptor',
    bestPanel: 'none',
    worstPanel: 'none',
    deepestElement: 'none',
    shallowestElement: 'none',
    ...overrides,
  }
}
