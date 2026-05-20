import { describe, expect, it } from 'vitest'
import {
  countConstructTypes,
  analyzePanel,
  analyzeSection,
  classifyDominantStyle,
  computeStructuralIntegrity,
  computeArtisticMerit,
  identifyRestorationNeeds,
  computeCompositionScore,
  computeHealthGrade,
  generateRecommendations,
  buildMosaicMuralResult,
  type MuralPanel,
  type MuralSection,
  type OverallComposition,
} from '../src/commands/mosaic-mural-helpers.js'

// ─── countConstructTypes ─────────────────────────────────

describe('countConstructTypes', () => {
  it('detects functions', () => {
    expect(countConstructTypes('function foo() {}').has('function')).toBe(true)
  })

  it('detects classes', () => {
    expect(countConstructTypes('class Foo {}').has('class')).toBe(true)
  })

  it('detects interfaces', () => {
    expect(countConstructTypes('interface Config {}').has('interface')).toBe(true)
  })

  it('detects enums', () => {
    expect(countConstructTypes('enum Color { Red }').has('enum')).toBe(true)
  })

  it('detects async', () => {
    expect(countConstructTypes('async function foo() {}').has('async')).toBe(true)
  })

  it('detects generics', () => {
    expect(countConstructTypes('function foo<T>(x: T): T').has('generic')).toBe(true)
  })

  it('returns empty for plain code', () => {
    expect(countConstructTypes('const x = 1').size).toBe(0)
  })

  it('detects multiple types', () => {
    const types = countConstructTypes('class Foo {} function bar() {} interface Baz {}')
    expect(types.size).toBeGreaterThanOrEqual(3)
  })
})

// ─── analyzePanel ────────────────────────────────────────

describe('analyzePanel', () => {
  it('classifies empty content as blank', () => {
    const panel = analyzePanel('', 'empty.ts')
    expect(panel.panelType).toBe('blank')
  })

  it('classifies well-documented typed code highly', () => {
    const code = '/** docs */\nexport function foo(x: number): string { return String(x) }\nexport function bar(y: boolean): void {}'
    const panel = analyzePanel(code, 'good.ts')
    expect(panel.detailLevel).toBeGreaterThan(30)
    expect(panel.preservation).toBeGreaterThanOrEqual(60)
  })

  it('classifies code with issues as damaged', () => {
    const code = Array.from({ length: 6 }, () => '// TODO: fix').join('\n') + '\nfunction foo(x: any): any {}'
    const panel = analyzePanel(code, 'bad.ts')
    expect(panel.preservation).toBeLessThan(60)
  })

  it('computes color richness from construct variety', () => {
    const code = 'class Foo {} function bar() {} interface Baz {} enum Qux { A }'
    const panel = analyzePanel(code, 'rich.ts')
    expect(panel.colorRichness).toBeGreaterThan(40)
  })

  it('computes compositional weight from size and exports', () => {
    const code = 'export function a() {}\nexport function b() {}\nexport function c() {}'
    const panel = analyzePanel(code, 'heavy.ts')
    expect(panel.compositionalWeight).toBeGreaterThan(0)
  })

  it('assigns structural role to index files', () => {
    const panel = analyzePanel('export { foo }', 'index.ts')
    expect(panel.thematicRole).toBe('structural')
  })

  it('assigns focal-point to heavy exported files', () => {
    const code = Array.from({ length: 8 }, (_, i) => `export function fn${i}() {}`).join('\n') + '\n'.repeat(80)
    const panel = analyzePanel(code, 'core.ts')
    expect(panel.thematicRole).toBe('focal-point')
  })

  it('computes dimensions', () => {
    const code = 'function foo() {\n  if (x) {\n    while (y) {\n      const z = 1\n    }\n  }\n}'
    const panel = analyzePanel(code, 'deep.ts')
    expect(panel.dimensions.depth).toBeGreaterThan(0)
    expect(panel.dimensions.height).toBeGreaterThan(0)
    expect(panel.dimensions.width).toBeGreaterThan(0)
  })

  it('detects issues', () => {
    const code = 'function foo(x: any) {}\n' + '// TODO: fix\n'.repeat(5)
    const panel = analyzePanel(code, 'issues.ts')
    expect(panel.issues.length).toBeGreaterThan(0)
  })

  it('assigns ornamental role to tiny files', () => {
    const panel = analyzePanel('const x = 1', 'tiny.ts')
    expect(panel.thematicRole).toBe('ornamental')
  })

  it('assigns background role to test files', () => {
    const code = "import { foo } from './bar'\nfunction testHelper() { return foo() }"
    const panel = analyzePanel(code, 'foo.test.ts')
    expect(panel.thematicRole).toBe('background')
  })
})

// ─── analyzeSection ──────────────────────────────────────

describe('analyzeSection', () => {
  it('handles empty section', () => {
    const section = analyzeSection([], 'src')
    expect(section.sectionType).toBe('blank-wall')
    expect(section.health).toBe('pristine')
    expect(section.panels).toHaveLength(0)
  })

  it('computes avg detail level', () => {
    const panels = [
      { detailLevel: 80, compositionalWeight: 50, thematicRole: 'focal-point', panelType: 'detailed', connectionsToAdjacent: 3, preservation: 80 } as MuralPanel,
      { detailLevel: 40, compositionalWeight: 20, thematicRole: 'supporting', panelType: 'sketched', connectionsToAdjacent: 1, preservation: 60 } as MuralPanel,
    ]
    const section = analyzeSection(panels, 'src')
    expect(section.avgDetailLevel).toBe(60)
  })

  it('computes total weight', () => {
    const panels = [
      { detailLevel: 50, compositionalWeight: 30, thematicRole: 'supporting', panelType: 'sketched', connectionsToAdjacent: 1, preservation: 50 } as MuralPanel,
      { detailLevel: 50, compositionalWeight: 70, thematicRole: 'focal-point', panelType: 'detailed', connectionsToAdjacent: 2, preservation: 70 } as MuralPanel,
    ]
    const section = analyzeSection(panels, 'src')
    expect(section.totalWeight).toBe(100)
  })

  it('detects gaps from blank/rough panels', () => {
    const panels = [
      { detailLevel: 0, compositionalWeight: 0, thematicRole: 'ornamental', panelType: 'blank', connectionsToAdjacent: 0, preservation: 100 } as MuralPanel,
      { detailLevel: 20, compositionalWeight: 10, thematicRole: 'ornamental', panelType: 'rough', connectionsToAdjacent: 0, preservation: 30 } as MuralPanel,
    ]
    const section = analyzeSection(panels, 'src')
    expect(section.gaps).toBe(2)
  })

  it('classifies high detail coherent sections as gallery', () => {
    const panels = Array.from({ length: 3 }, () => ({
      detailLevel: 80, compositionalWeight: 50, thematicRole: 'supporting', panelType: 'detailed', connectionsToAdjacent: 2, preservation: 80,
    } as MuralPanel))
    const section = analyzeSection(panels, 'src')
    expect(section.sectionType).toBe('gallery')
  })

  it('classifies mixed sections correctly', () => {
    const panels = [
      { detailLevel: 10, compositionalWeight: 5, thematicRole: 'ornamental', panelType: 'rough', connectionsToAdjacent: 0, preservation: 20 } as MuralPanel,
      { detailLevel: 90, compositionalWeight: 90, thematicRole: 'focal-point', panelType: 'masterpiece', connectionsToAdjacent: 8, preservation: 90 } as MuralPanel,
    ]
    const section = analyzeSection(panels, 'src')
    expect(['collage', 'fresco', 'mosaic']).toContain(section.sectionType)
  })

  it('computes coherence from consistency', () => {
    const consistent = Array.from({ length: 3 }, () => ({
      detailLevel: 60, compositionalWeight: 50, thematicRole: 'supporting', panelType: 'detailed', connectionsToAdjacent: 2, preservation: 70,
    } as MuralPanel))
    const section = analyzeSection(consistent, 'src')
    expect(section.coherence).toBeGreaterThanOrEqual(80)
  })

  it('classifies health from preservation', () => {
    const pristine = Array.from({ length: 3 }, () => ({
      detailLevel: 80, compositionalWeight: 50, thematicRole: 'supporting', panelType: 'masterpiece', connectionsToAdjacent: 2, preservation: 90,
    } as MuralPanel))
    const section = analyzeSection(pristine, 'src')
    expect(section.health).toBe('pristine')
  })

  it('detects deteriorating health', () => {
    const panels = [
      { detailLevel: 30, compositionalWeight: 20, thematicRole: 'ornamental', panelType: 'rough', connectionsToAdjacent: 1, preservation: 35 } as MuralPanel,
    ]
    const section = analyzeSection(panels, 'src')
    expect(['deteriorating', 'crumbling', 'ruins']).toContain(section.health)
  })
})

// ─── classifyDominantStyle ───────────────────────────────

describe('classifyDominantStyle', () => {
  it('returns minimalist for no panels', () => {
    expect(classifyDominantStyle([], [])).toBe('minimalist')
  })

  it('returns classical for high detail and coherence', () => {
    const panels = [{ detailLevel: 80, colorRichness: 70, panelType: 'masterpiece' } as MuralPanel]
    const sections = [{ coherence: 80 } as MuralSection]
    expect(classifyDominantStyle(panels, sections)).toBe('classical')
  })

  it('returns chaotic for low coherence', () => {
    const panels = [{ detailLevel: 50, colorRichness: 40, panelType: 'detailed' } as MuralPanel]
    const sections = [{ coherence: 20 } as MuralSection]
    expect(classifyDominantStyle(panels, sections)).toBe('chaotic')
  })

  it('returns minimalist for low detail', () => {
    const panels = [{ detailLevel: 20, colorRichness: 20, panelType: 'sketched' } as MuralPanel]
    const sections = [{ coherence: 60 } as MuralSection]
    expect(classifyDominantStyle(panels, sections)).toBe('minimalist')
  })
})

// ─── computeStructuralIntegrity ──────────────────────────

describe('computeStructuralIntegrity', () => {
  it('returns 100 for no sections', () => {
    expect(computeStructuralIntegrity([])).toBe(100)
  })

  it('computes from coherence and balance', () => {
    const sections = [{ coherence: 80, balance: 80, gaps: 0, panels: [{}] } as MuralSection]
    expect(computeStructuralIntegrity(sections)).toBeGreaterThanOrEqual(60)
  })

  it('penalizes gaps', () => {
    const sections = [{ coherence: 80, balance: 80, gaps: 5, panels: Array.from({ length: 5 }, () => ({})) } as MuralSection]
    const integrity = computeStructuralIntegrity(sections)
    expect(integrity).toBeLessThan(100)
  })
})

// ─── computeArtisticMerit ───────────────────────────────

describe('computeArtisticMerit', () => {
  it('returns 0 for no panels', () => {
    expect(computeArtisticMerit([], [])).toBe(0)
  })

  it('computes from detail and richness', () => {
    const panels = [{ detailLevel: 80, colorRichness: 70, panelType: 'masterpiece' } as MuralPanel]
    const merit = computeArtisticMerit(panels, [{ panels } as MuralSection])
    expect(merit).toBeGreaterThan(50)
  })

  it('is low for poor panels', () => {
    const panels = [{ detailLevel: 20, colorRichness: 10, panelType: 'rough' } as MuralPanel]
    const merit = computeArtisticMerit(panels, [{ panels } as MuralSection])
    expect(merit).toBeLessThan(40)
  })
})

// ─── identifyRestorationNeeds ────────────────────────────

describe('identifyRestorationNeeds', () => {
  it('identifies damaged panels', () => {
    const panels = [{ panelType: 'damaged', file: 'bad.ts' } as MuralPanel]
    const needs = identifyRestorationNeeds(panels, [])
    expect(needs.some((n) => n.includes('damaged'))).toBe(true)
  })

  it('identifies crumbling sections', () => {
    const sections = [{ health: 'ruins', directory: 'src/legacy', panels: [], gaps: 0 } as MuralSection]
    const needs = identifyRestorationNeeds([], sections)
    expect(needs.some((n) => n.includes('Rebuild') || n.includes('crumbling'))).toBe(true)
  })

  it('identifies gaps', () => {
    const sections = [{ gaps: 3, directory: 'src', panels: [] } as MuralSection]
    const needs = identifyRestorationNeeds([], sections)
    expect(needs.some((n) => n.includes('gap') || n.includes('Fill'))).toBe(true)
  })

  it('identifies blank panels', () => {
    const panels = [{ panelType: 'blank', file: 'empty.ts' } as MuralPanel]
    const needs = identifyRestorationNeeds(panels, [])
    expect(needs.some((n) => n.includes('blank'))).toBe(true)
  })

  it('returns empty for healthy mural', () => {
    expect(identifyRestorationNeeds([], [])).toEqual([])
  })
})

// ─── computeCompositionScore ─────────────────────────────

describe('computeCompositionScore', () => {
  it('averages four components', () => {
    expect(computeCompositionScore(80, 80, 80, 80)).toBe(80)
  })

  it('handles mixed values', () => {
    const score = computeCompositionScore(60, 70, 80, 90)
    expect(score).toBe(75)
  })

  it('handles zeros', () => {
    expect(computeCompositionScore(0, 0, 0, 0)).toBe(0)
  })
})

// ─── computeHealthGrade ──────────────────────────────────

describe('computeHealthGrade', () => {
  it('returns A for 80+', () => { expect(computeHealthGrade(85)).toBe('A') })
  it('returns B for 65-79', () => { expect(computeHealthGrade(70)).toBe('B') })
  it('returns C for 50-64', () => { expect(computeHealthGrade(55)).toBe('C') })
  it('returns D for 35-49', () => { expect(computeHealthGrade(40)).toBe('D') })
  it('returns F below 35', () => { expect(computeHealthGrade(20)).toBe('F') })
})

// ─── generateRecommendations ─────────────────────────────

describe('generateRecommendations', () => {
  it('recommends for damaged panels', () => {
    const composition = { damagedPanels: 3 } as OverallComposition
    const recs = generateRecommendations(composition, [], [])
    expect(recs.some((r) => r.includes('damaged'))).toBe(true)
  })

  it('recommends for gaps', () => {
    const composition = { totalGaps: 5, damagedPanels: 0, dominantStyle: 'modern', structuralIntegrity: 70, artisticMerit: 60 } as OverallComposition
    const recs = generateRecommendations(composition, [], [])
    expect(recs.some((r) => r.includes('gap') || r.includes('Gap'))).toBe(true)
  })

  it('recommends for chaotic style', () => {
    const composition = { totalGaps: 0, damagedPanels: 0, dominantStyle: 'chaotic', structuralIntegrity: 70, artisticMerit: 60 } as OverallComposition
    const recs = generateRecommendations(composition, [], [])
    expect(recs.some((r) => r.includes('coherent') || r.includes('pattern'))).toBe(true)
  })

  it('recommends for low structural integrity', () => {
    const composition = { totalGaps: 0, damagedPanels: 0, dominantStyle: 'modern', structuralIntegrity: 30, artisticMerit: 60 } as OverallComposition
    const recs = generateRecommendations(composition, [], [])
    expect(recs.some((r) => r.includes('structural') || r.includes('integrity'))).toBe(true)
  })

  it('recommends for low artistic merit', () => {
    const composition = { totalGaps: 0, damagedPanels: 0, dominantStyle: 'modern', structuralIntegrity: 70, artisticMerit: 30 } as OverallComposition
    const recs = generateRecommendations(composition, [], [])
    expect(recs.some((r) => r.includes('artistic') || r.includes('merit'))).toBe(true)
  })

  it('returns empty for clean state', () => {
    const composition = { totalGaps: 0, damagedPanels: 0, dominantStyle: 'classical', structuralIntegrity: 80, artisticMerit: 70 } as OverallComposition
    expect(generateRecommendations(composition, [], [])).toEqual([])
  })
})

// ─── buildMosaicMuralResult ──────────────────────────────

describe('buildMosaicMuralResult', () => {
  it('returns full result structure', () => {
    const result = buildMosaicMuralResult(['a.ts'], ['export function foo(): void {}'], {})
    expect(result.panels).toBeDefined()
    expect(result.sections).toBeDefined()
    expect(result.composition).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('handles empty input', () => {
    const result = buildMosaicMuralResult([], [], {})
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalSections).toBe(0)
    expect(result.composition.dominantStyle).toBe('minimalist')
  })

  it('creates panels for each file', () => {
    const result = buildMosaicMuralResult(['a.ts', 'b.ts'], ['const x = 1', 'const y = 2'], {})
    expect(result.panels).toHaveLength(2)
  })

  it('groups panels into sections by directory', () => {
    const result = buildMosaicMuralResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], ['const x = 1', 'const y = 2', 'const z = 3'], {})
    expect(result.sections).toHaveLength(2)
  })

  it('computes composition score', () => {
    const result = buildMosaicMuralResult(['a.ts'], ['export function foo(): void {}'], {})
    expect(result.stats.compositionScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.compositionScore).toBeLessThanOrEqual(100)
  })

  it('computes health grade', () => {
    const result = buildMosaicMuralResult(['a.ts'], ['const x = 1'], {})
    expect(['A', 'B', 'C', 'D', 'F']).toContain(result.stats.healthGrade)
  })

  it('identifies restoration priority', () => {
    const result = buildMosaicMuralResult(['a.ts'], ['const x = 1'], {})
    expect(result.stats.restorationPriority).toBeDefined()
  })

  it('detects blank panels', () => {
    const result = buildMosaicMuralResult(['empty.ts'], [''], {})
    expect(result.stats.blankCount).toBe(1)
  })
})
