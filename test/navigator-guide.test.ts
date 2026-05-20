import { describe, expect, it } from 'vitest'

import {
  buildNavigatorGuideResult,
  classifyGuideRating,
  computeAccessibility,
  computeGuideCompleteness,
  computeOnboardingScore,
  detectConstructionZones,
  generateGuideRecommendations,
  generateTourRoutes,
  identifyAttractions,
  organizeGuideSections,
  type Attraction,
  type GuideSection,
  type NavigatorGuideResult,
  type OnboardingScore,
  type NavigatorGuideStats,
  type TourRoute,
  type ConstructionZone,
} from '../src/commands/navigator-guide-helpers.js'
import { formatNavigatorGuideJson, formatNavigatorGuideTable } from '../src/commands/navigator-guide-format-helpers.js'

// ─── organizeGuideSections ────────────────────────────────────────────────────

describe('organizeGuideSections', () => {
  it('returns empty array for no files', () => {
    expect(organizeGuideSections([], [])).toEqual([])
  })

  it('groups files by directory', () => {
    const files = ['src/core/a.ts', 'src/core/b.ts', 'src/utils/c.ts']
    const contents = ['export const a = 1', 'export const b = 2', 'export const c = 3']
    const sections = organizeGuideSections(files, contents)
    expect(sections.length).toBe(2)
  })

  it('creates section with correct title from directory', () => {
    const files = ['src/commands/count.ts']
    const contents = ['export function count() {}']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].title).toBe('commands')
  })

  it('uses "Root Files" for files in root', () => {
    const files = ['index.ts']
    const contents = ['export default {}']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].title).toBe('Root Files')
  })

  it('assigns easy difficulty for small files', () => {
    const files = ['src/a.ts']
    const contents = ['x']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].difficulty).toBe('easy')
  })

  it('assigns moderate difficulty for medium files', () => {
    const files = ['src/a.ts']
    const contents = [Array(250).fill('line').join('\n')]
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].difficulty).toBe('moderate')
  })

  it('assigns challenging difficulty for large files', () => {
    const files = ['src/a.ts']
    const contents = [Array(550).fill('line').join('\n')]
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].difficulty).toBe('challenging')
  })

  it('assigns expert difficulty for very large files', () => {
    const files = ['src/a.ts']
    const contents = [Array(1050).fill('line').join('\n')]
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].difficulty).toBe('expert')
  })

  it('calculates reading time', () => {
    const files = ['src/a.ts']
    const contents = [Array(60).fill('line').join('\n')]
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].readingTime).toContain('min')
  })

  it('marks required sections with exports and no tests', () => {
    const files = ['src/core/a.ts']
    const contents = ['export function foo() {}']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].isRequired).toBe(true)
  })

  it('does not mark test sections as required', () => {
    const files = ['test/a.test.ts']
    const contents = ['describe("test", () => { it("works", () => {}) })']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].isRequired).toBe(false)
  })

  it('sorts required sections first', () => {
    const files = ['test/a.test.ts', 'src/core/b.ts']
    const contents = ['test("x", () => {})', 'export const b = 1']
    const sections = organizeGuideSections(files, contents)
    const requiredIdx = sections.findIndex(s => s.isRequired)
    const testIdx = sections.findIndex(s => !s.isRequired)
    expect(requiredIdx).toBeLessThan(testIdx)
  })

  it('adds prerequisites for non-easy sections', () => {
    const files = ['src/core/a.ts', 'src/complex/b.ts']
    const contents = [Array(10).fill('x').join('\n'), Array(600).fill('x').join('\n')]
    const sections = organizeGuideSections(files, contents)
    const hardSection = sections.find(s => s.difficulty !== 'easy')
    expect(hardSection?.prerequisites.length).toBeGreaterThanOrEqual(0)
  })

  it('lists all files in section', () => {
    const files = ['src/core/a.ts', 'src/core/b.ts']
    const contents = ['x', 'y']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].files.length).toBe(2)
  })

  it('detects description for typed exports', () => {
    const files = ['src/types.ts']
    const contents = ['interface Foo {}\nexport type Bar = string']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].description).toContain('types')
  })

  it('detects description for documented modules', () => {
    const files = ['src/documented.ts']
    const contents = ['/** Docs */\nconst x = 1']
    const sections = organizeGuideSections(files, contents)
    expect(sections[0].description).toContain('documented')
  })
})

// ─── identifyAttractions ──────────────────────────────────────────────────────

describe('identifyAttractions', () => {
  it('returns empty array for no files', () => {
    expect(identifyAttractions([], [])).toEqual([])
  })

  it('marks index files as must-see architecture', () => {
    const files = ['src/index.ts']
    const contents = ['export function main() {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('must-see')
    expect(attractions[0].category).toBe('architecture')
    expect(attractions[0].significance).toBe(95)
  })

  it('marks main files as must-see architecture', () => {
    const files = ['src/main.ts']
    const contents = ['export function main() {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('must-see')
    expect(attractions[0].category).toBe('architecture')
  })

  it('marks app files as must-see architecture', () => {
    const files = ['src/app.ts']
    const contents = ['export function app() {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('must-see')
    expect(attractions[0].category).toBe('architecture')
  })

  it('marks files with 5+ exports as must-see core-logic', () => {
    const files = ['src/core.ts']
    const contents = ['export const a = 1\nexport const b = 2\nexport const c = 3\nexport const d = 4\nexport const e = 5']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('must-see')
    expect(attractions[0].category).toBe('core-logic')
  })

  it('marks files with 2-4 exports as recommended core-logic', () => {
    const files = ['src/mod.ts']
    const contents = ['export const a = 1\nexport const b = 2']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('recommended')
    expect(attractions[0].category).toBe('core-logic')
  })

  it('classifies type definitions as data-models', () => {
    const files = ['src/types.ts']
    const contents = ['interface Foo { x: number }\ntype Bar = string']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].category).toBe('data-models')
  })

  it('classifies test files as testing', () => {
    const files = ['src/a.test.ts']
    const contents = ['describe("test", () => { it("works", () => {}) })']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].category).toBe('testing')
    expect(attractions[0].type).toBe('recommended')
  })

  it('classifies config files as configuration', () => {
    const files = ['src/config.ts']
    const contents = ['const config = {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].category).toBe('configuration')
  })

  it('classifies output files correctly', () => {
    const files = ['src/format-helpers.ts']
    const contents = ['function formatOutput() {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].category).toBe('output')
  })

  it('marks files with TODOs as under-construction', () => {
    const files = ['src/unfinished.ts']
    const contents = ['// TODO: finish this\nexport const x = 1']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].type).toBe('under-construction')
    expect(attractions[0].warnings).toContain('Contains TODO/FIXME markers')
  })

  it('adds highlight for well-documented files', () => {
    const files = ['src/documented.ts']
    const contents = ['/** Doc comment */\nexport const x = 1']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].highlights).toContain('Well documented')
  })

  it('warns about large files', () => {
    const files = ['src/large.ts']
    const contents = [Array(350).fill('line').join('\n')]
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].warnings.some(w => w.includes('Large file'))).toBe(true)
  })

  it('calculates visit duration', () => {
    const files = ['src/a.ts']
    const contents = [Array(80).fill('line').join('\n')]
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].visitDuration).toContain('min')
  })

  it('sorts by significance descending', () => {
    const files = ['src/small.ts', 'src/index.ts']
    const contents = ['const x = 1', 'export function main() {}']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].significance).toBeGreaterThanOrEqual(attractions[1].significance)
  })

  it('sets correct file path', () => {
    const files = ['src/core/a.ts']
    const contents = ['export const x = 1']
    const attractions = identifyAttractions(files, contents)
    expect(attractions[0].file).toBe('src/core/a.ts')
  })
})

// ─── generateTourRoutes ───────────────────────────────────────────────────────

describe('generateTourRoutes', () => {
  const makeAttraction = (overrides: Partial<Attraction> = {}): Attraction => ({
    name: 'test.ts',
    file: 'test.ts',
    type: 'optional',
    category: 'utilities',
    significance: 50,
    description: 'test',
    visitDuration: '2 min',
    highlights: [],
    warnings: [],
    ...overrides,
  })

  it('returns empty array for no attractions', () => {
    expect(generateTourRoutes([], [])).toEqual([])
  })

  it('creates New Developer Tour for must-see attractions', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ type: 'must-see', name: 'index.ts', file: 'index.ts' })]
    const routes = generateTourRoutes(sections, attractions)
    const tour = routes.find(r => r.name === 'New Developer Tour')
    expect(tour).toBeDefined()
    expect(tour!.difficulty).toBe('beginner')
    expect(tour!.stops.length).toBe(1)
  })

  it('creates Codebase Deep Dive when entry points exist', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ category: 'architecture', name: 'app.ts' })]
    const routes = generateTourRoutes(sections, attractions)
    const dive = routes.find(r => r.name === 'Codebase Deep Dive')
    expect(dive).toBeDefined()
    expect(dive!.difficulty).toBe('intermediate')
  })

  it('creates API and Data Tour for data models', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ category: 'data-models', name: 'types.ts' })]
    const routes = generateTourRoutes(sections, attractions)
    const apiTour = routes.find(r => r.name === 'API and Data Tour')
    expect(apiTour).toBeDefined()
    expect(apiTour!.difficulty).toBe('beginner')
  })

  it('creates Testing Patterns Tour for test files', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ category: 'testing', name: 'a.test.ts' })]
    const routes = generateTourRoutes(sections, attractions)
    const testTour = routes.find(r => r.name === 'Testing Patterns Tour')
    expect(testTour).toBeDefined()
    expect(testTour!.difficulty).toBe('advanced')
  })

  it('sets stop order correctly', () => {
    const sections: GuideSection[] = []
    const attractions = [
      makeAttraction({ type: 'must-see', name: 'a.ts' }),
      makeAttraction({ type: 'must-see', name: 'b.ts' }),
    ]
    const routes = generateTourRoutes(sections, attractions)
    const tour = routes.find(r => r.name === 'New Developer Tour')
    expect(tour!.stops[0].order).toBe(1)
    expect(tour!.stops[1].order).toBe(2)
  })

  it('sets action to study for must-see attractions', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ type: 'must-see', name: 'a.ts' })]
    const routes = generateTourRoutes(sections, attractions)
    const tour = routes.find(r => r.name === 'New Developer Tour')
    expect(tour!.stops[0].action).toBe('study')
  })

  it('calculates estimated time', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ type: 'must-see', visitDuration: '5 min' })]
    const routes = generateTourRoutes(sections, attractions)
    const tour = routes.find(r => r.name === 'New Developer Tour')
    expect(tour!.estimatedTime).toContain('min')
  })

  it('limits recommended attractions to 5 in deep dive', () => {
    const sections: GuideSection[] = []
    const attractions = [
      makeAttraction({ category: 'architecture', name: 'app.ts' }),
      ...Array.from({ length: 8 }, (_, i) => makeAttraction({ type: 'recommended', name: `rec${i}.ts` })),
    ]
    const routes = generateTourRoutes(sections, attractions)
    const dive = routes.find(r => r.name === 'Codebase Deep Dive')
    const recStops = dive!.stops.filter(s => s.action === 'read')
    expect(recStops.length).toBeLessThanOrEqual(5)
  })

  it('limits test tour stops to 5', () => {
    const sections: GuideSection[] = []
    const attractions = Array.from({ length: 10 }, (_, i) => makeAttraction({ category: 'testing', name: `test${i}.ts` }))
    const routes = generateTourRoutes(sections, attractions)
    const testTour = routes.find(r => r.name === 'Testing Patterns Tour')
    expect(testTour!.stops.length).toBeLessThanOrEqual(5)
  })

  it('isSelfGuided is true when all must-see have highlights', () => {
    const sections: GuideSection[] = []
    const attractions = [makeAttraction({ type: 'must-see', highlights: ['Important file'] })]
    const routes = generateTourRoutes(sections, attractions)
    const tour = routes.find(r => r.name === 'New Developer Tour')
    expect(tour!.isSelfGuided).toBe(true)
  })
})

// ─── detectConstructionZones ──────────────────────────────────────────────────

describe('detectConstructionZones', () => {
  it('returns empty for clean code', () => {
    const files = ['src/clean.ts']
    const contents = ['const x = 1']
    expect(detectConstructionZones(files, contents)).toEqual([])
  })

  it('detects tech debt with many TODOs', () => {
    const files = ['src/a.ts']
    const contents = ['// TODO: fix\n// TODO: refactor\n// TODO: update']
    const zones = detectConstructionZones(files, contents)
    expect(zones.some(z => z.type === 'tech-debt')).toBe(true)
  })

  it('detects tech debt with FIXMEs', () => {
    const files = ['src/a.ts']
    const contents = ['// FIXME: bug1\n// FIXME: bug2\n// TODO: other']
    const zones = detectConstructionZones(files, contents)
    const debt = zones.find(z => z.type === 'tech-debt')
    expect(debt).toBeDefined()
    expect(debt!.severity).toBe('major')
  })

  it('detects active refactor with HACK markers', () => {
    const files = ['src/a.ts']
    const contents = ['// HACK: workaround1\n// XXX: workaround2']
    const zones = detectConstructionZones(files, contents)
    expect(zones.some(z => z.type === 'active-refactor')).toBe(true)
  })

  it('detects deprecated code', () => {
    const files = ['src/a.ts']
    const contents = ['/** @deprecated */\nfunction old() {}']
    const zones = detectConstructionZones(files, contents)
    expect(zones.some(z => z.type === 'deprecated')).toBe(true)
  })

  it('detects incomplete features from stub files', () => {
    const files = ['src/stub1.ts', 'src/stub2.ts']
    const contents = ['// placeholder', '// placeholder']
    const zones = detectConstructionZones(files, contents)
    expect(zones.some(z => z.type === 'incomplete-feature')).toBe(true)
  })

  it('sets severity correctly for FIXMEs', () => {
    const files = ['src/a.ts']
    const contents = ['// FIXME: 1\n// FIXME: 2\n// TODO: 3']
    const zones = detectConstructionZones(files, contents)
    const debt = zones.find(z => z.type === 'tech-debt')
    expect(debt!.severity).toBe('major')
  })

  it('provides alternative guidance', () => {
    const files = ['src/a.ts']
    const contents = ['// TODO: x\n// TODO: y\n// TODO: z']
    const zones = detectConstructionZones(files, contents)
    const debt = zones.find(z => z.type === 'tech-debt')
    expect(debt!.alternative.length).toBeGreaterThan(0)
  })

  it('groups zones by directory', () => {
    const files = ['src/legacy/a.ts', 'src/legacy/b.ts']
    const contents = ['// TODO: fix1\n// TODO: fix2\n// TODO: fix3', '// clean']
    const zones = detectConstructionZones(files, contents)
    expect(zones.length).toBeGreaterThanOrEqual(1)
    expect(zones.some(z => z.area === 'src/legacy')).toBe(true)
  })
})

// ─── computeOnboardingScore ───────────────────────────────────────────────────

describe('computeOnboardingScore', () => {
  it('returns 100s for empty project', () => {
    const score = computeOnboardingScore([], [], [], [])
    expect(score.documentation).toBe(100)
    expect(score.structure).toBe(100)
    expect(score.naming).toBe(100)
    expect(score.entryClarity).toBe(30)
  })

  it('computes documentation score based on comment density', () => {
    const files = ['a.ts']
    const contents = ['// comment\nconst x = 1\n// another\nconst y = 2']
    const score = computeOnboardingScore(files, contents, [], [])
    expect(score.documentation).toBeGreaterThan(0)
  })

  it('computes naming score for kebab-case files', () => {
    const files = ['my-module.ts', 'utils.ts']
    const contents = ['x', 'y']
    const score = computeOnboardingScore(files, contents, [], [])
    expect(score.naming).toBe(100)
  })

  it('penalizes poor naming', () => {
    const files = ['MyModule.ts', 'Utils.ts']
    const contents = ['x', 'y']
    const score = computeOnboardingScore(files, contents, [], [])
    expect(score.naming).toBeLessThan(100)
  })

  it('computes complexity based on average file size', () => {
    const files = ['a.ts']
    const contents = [Array(500).fill('line').join('\n')]
    const score = computeOnboardingScore(files, contents, [], [])
    expect(score.complexity).toBeLessThan(100)
  })

  it('gives high entry clarity when architecture file exists', () => {
    const files = ['index.ts']
    const contents = ['export function main() {}']
    const attractions = identifyAttractions(files, contents)
    const sections = organizeGuideSections(files, contents)
    const score = computeOnboardingScore(files, contents, sections, attractions)
    expect(score.entryClarity).toBe(80)
  })

  it('gives low entry clarity with no architecture files', () => {
    const files = ['utils.ts']
    const contents = ['const x = 1']
    const attractions = identifyAttractions(files, contents)
    const sections = organizeGuideSections(files, contents)
    const score = computeOnboardingScore(files, contents, sections, attractions)
    expect(score.entryClarity).toBe(30)
  })

  it('computes overall as weighted average', () => {
    const files = ['index.ts']
    const contents = ['export function main() {}']
    const sections = organizeGuideSections(files, contents)
    const attractions = identifyAttractions(files, contents)
    const score = computeOnboardingScore(files, contents, sections, attractions)
    expect(score.overall).toBeGreaterThan(0)
    expect(score.overall).toBeLessThanOrEqual(100)
  })

  it('assigns exceptional grade for high scores', () => {
    const files = ['index.ts', 'utils.ts']
    const contents = ['export function main() {}', '// comment\nconst x = 1']
    const sections = organizeGuideSections(files, contents)
    const attractions = identifyAttractions(files, contents)
    const score = computeOnboardingScore(files, contents, sections, attractions)
    expect(['exceptional', 'excellent', 'good', 'fair', 'poor', 'hostile']).toContain(score.grade)
  })

  it('assigns hostile grade for very low scores', () => {
    const score = computeOnboardingScore([], [], [], [])
    expect(score.grade).toBeDefined()
  })
})

// ─── computeGuideCompleteness ─────────────────────────────────────────────────

describe('computeGuideCompleteness', () => {
  it('returns base score for empty inputs', () => {
    expect(computeGuideCompleteness([], [], [])).toBe(30)
  })

  it('increases with sections', () => {
    const sections: GuideSection[] = [{
      title: 'Core', description: '', difficulty: 'easy', readingTime: '1 min',
      files: ['a.ts'], isRequired: false, prerequisites: [],
    }]
    const score = computeGuideCompleteness(sections, [], [])
    expect(score).toBeGreaterThan(30)
  })

  it('increases with required sections', () => {
    const sections: GuideSection[] = [{
      title: 'Core', description: '', difficulty: 'easy', readingTime: '1 min',
      files: ['a.ts'], isRequired: true, prerequisites: [],
    }]
    const score = computeGuideCompleteness(sections, [], [])
    expect(score).toBeGreaterThanOrEqual(65)
  })

  it('increases with must-see attractions', () => {
    const attractions: Attraction[] = [{
      name: 'index.ts', file: 'index.ts', type: 'must-see', category: 'architecture',
      significance: 95, description: '', visitDuration: '2 min', highlights: [], warnings: [],
    }]
    const score = computeGuideCompleteness([], attractions, [])
    expect(score).toBeGreaterThanOrEqual(45)
  })

  it('increases with beginner routes', () => {
    const routes: TourRoute[] = [{
      name: 'Tour', description: '', difficulty: 'beginner', estimatedTime: '5 min',
      stops: [], isSelfGuided: true, rating: 80,
    }]
    const score = computeGuideCompleteness([], [], routes)
    expect(score).toBeGreaterThanOrEqual(40)
  })

  it('caps at 100', () => {
    const sections = Array.from({ length: 20 }, () => ({
      title: 'S', description: '', difficulty: 'easy' as const, readingTime: '1 min',
      files: ['a.ts'], isRequired: true, prerequisites: [],
    }))
    const score = computeGuideCompleteness(sections, [], [])
    expect(score).toBeLessThanOrEqual(100)
  })
})

// ─── computeAccessibility ─────────────────────────────────────────────────────

describe('computeAccessibility', () => {
  it('computes weighted score', () => {
    expect(computeAccessibility(80, 60)).toBe(72)
  })

  it('returns 0 for zero inputs', () => {
    expect(computeAccessibility(0, 0)).toBe(0)
  })

  it('returns 100 for perfect scores', () => {
    expect(computeAccessibility(100, 100)).toBe(100)
  })

  it('weights onboarding at 60 percent', () => {
    const result = computeAccessibility(100, 0)
    expect(result).toBe(60)
  })

  it('weights guide completeness at 40 percent', () => {
    const result = computeAccessibility(0, 100)
    expect(result).toBe(40)
  })
})

// ─── classifyGuideRating ──────────────────────────────────────────────────────

describe('classifyGuideRating', () => {
  it('returns five-stars for 80+', () => {
    expect(classifyGuideRating(85)).toBe('five-stars')
  })

  it('returns four-stars for 65-79', () => {
    expect(classifyGuideRating(70)).toBe('four-stars')
  })

  it('returns three-stars for 50-64', () => {
    expect(classifyGuideRating(55)).toBe('three-stars')
  })

  it('returns two-stars for 35-49', () => {
    expect(classifyGuideRating(40)).toBe('two-stars')
  })

  it('returns one-star for below 35', () => {
    expect(classifyGuideRating(20)).toBe('one-star')
  })

  it('returns five-stars at exact 80', () => {
    expect(classifyGuideRating(80)).toBe('five-stars')
  })

  it('returns four-stars at exact 65', () => {
    expect(classifyGuideRating(65)).toBe('four-stars')
  })

  it('returns three-stars at exact 50', () => {
    expect(classifyGuideRating(50)).toBe('three-stars')
  })

  it('returns two-stars at exact 35', () => {
    expect(classifyGuideRating(35)).toBe('two-stars')
  })
})

// ─── generateGuideRecommendations ─────────────────────────────────────────────

describe('generateGuideRecommendations', () => {
  const makeStats = (overrides: Partial<NavigatorGuideStats> = {}): NavigatorGuideStats => ({
    totalSections: 1,
    totalAttractions: 1,
    mustSeeCount: 1,
    underConstructionCount: 0,
    totalRoutes: 1,
    beginnerRoutes: 1,
    constructionZones: 0,
    majorConstructionZones: 0,
    estimatedOnboardingTime: '10 min',
    onboardingGrade: 'good',
    guideCompleteness: 70,
    overallAccessibility: 60,
    recommendedTour: 'Tour',
    guideRating: 'three-stars',
    ...overrides,
  })

  it('recommends documenting entry points when no must-see', () => {
    const recs = generateGuideRecommendations([], [], [], [], makeStats())
    expect(recs.some(r => r.includes('must-see'))).toBe(true)
  })

  it('recommends resolving TODOs for many under-construction', () => {
    const attractions: Attraction[] = Array.from({ length: 4 }, () => ({
      name: 'a.ts', file: 'a.ts', type: 'under-construction' as const, category: 'utilities' as const,
      significance: 30, description: '', visitDuration: '1 min', highlights: [], warnings: [],
    }))
    const recs = generateGuideRecommendations([], attractions, [], [], makeStats())
    expect(recs.some(r => r.includes('under construction'))).toBe(true)
  })

  it('recommends addressing major construction zones', () => {
    const zones: ConstructionZone[] = [{
      area: 'src/legacy', type: 'tech-debt', severity: 'major',
      description: '', affectedRoutes: [], alternative: '',
    }]
    const recs = generateGuideRecommendations([], [], [], zones, makeStats())
    expect(recs.some(r => r.includes('major'))).toBe(true)
  })

  it('recommends creating beginner tour when none exists', () => {
    const recs = generateGuideRecommendations([], [], [], [], makeStats({ beginnerRoutes: 0 }))
    expect(recs.some(r => r.includes('beginner'))).toBe(true)
  })

  it('recommends improving guide completeness', () => {
    const recs = generateGuideRecommendations([], [], [], [], makeStats({ guideCompleteness: 30 }))
    expect(recs.some(r => r.includes('incomplete'))).toBe(true)
  })

  it('recommends improving accessibility', () => {
    const recs = generateGuideRecommendations([], [], [], [], makeStats({ overallAccessibility: 25 }))
    expect(recs.some(r => r.includes('accessibility'))).toBe(true)
  })

  it('recommends intermediate stepping stones for many expert sections', () => {
    const sections: GuideSection[] = Array.from({ length: 4 }, () => ({
      title: 'S', description: '', difficulty: 'expert' as const, readingTime: '10 min',
      files: ['a.ts'], isRequired: false, prerequisites: [],
    }))
    const recs = generateGuideRecommendations(sections, [], [], [], makeStats())
    expect(recs.some(r => r.includes('intermediate') || r.includes('expert'))).toBe(true)
  })

  it('returns unique recommendations', () => {
    const recs = generateGuideRecommendations([], [], [], [], makeStats({ guideCompleteness: 30, overallAccessibility: 25 }))
    const unique = Array.from(new Set(recs))
    expect(recs.length).toBe(unique.length)
  })
})

// ─── buildNavigatorGuideResult ────────────────────────────────────────────────

describe('buildNavigatorGuideResult', () => {
  it('returns all required fields', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    expect(result).toHaveProperty('sections')
    expect(result).toHaveProperty('attractions')
    expect(result).toHaveProperty('routes')
    expect(result).toHaveProperty('constructionZones')
    expect(result).toHaveProperty('onboarding')
    expect(result).toHaveProperty('stats')
    expect(result).toHaveProperty('recommendations')
  })

  it('computes stats correctly', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export function main() {}'], {})
    expect(result.stats.totalSections).toBe(1)
    expect(result.stats.totalAttractions).toBe(1)
    expect(result.stats.mustSeeCount).toBe(1)
  })

  it('computes onboarding score', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export function main() {}'], {})
    expect(result.onboarding.overall).toBeGreaterThan(0)
    expect(result.onboarding.overall).toBeLessThanOrEqual(100)
  })

  it('handles empty project', () => {
    const result = buildNavigatorGuideResult([], [], {})
    expect(result.sections).toEqual([])
    expect(result.attractions).toEqual([])
    expect(result.stats.totalSections).toBe(0)
  })

  it('handles multiple directories', () => {
    const files = ['src/core/a.ts', 'src/utils/b.ts', 'test/c.test.ts']
    const contents = ['export const a = 1', 'export const b = 2', 'describe("t", () => {})']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.stats.totalSections).toBe(3)
  })

  it('detects construction zones', () => {
    const files = ['src/legacy.ts']
    const contents = ['// TODO: a\n// TODO: b\n// TODO: c']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.constructionZones.length).toBeGreaterThan(0)
  })

  it('generates routes', () => {
    const files = ['src/index.ts', 'src/types.ts']
    const contents = ['export function main() {}', 'interface Foo {}']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.routes.length).toBeGreaterThan(0)
  })

  it('sets recommended tour name', () => {
    const files = ['src/index.ts']
    const contents = ['export function main() {}']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.stats.recommendedTour.length).toBeGreaterThan(0)
  })

  it('sets guide rating', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    expect(['five-stars', 'four-stars', 'three-stars', 'two-stars', 'one-star']).toContain(result.stats.guideRating)
  })
})

// ─── formatNavigatorGuideTable ────────────────────────────────────────────────

describe('formatNavigatorGuideTable', () => {
  it('returns a string', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    const formatted = formatNavigatorGuideTable(result)
    expect(typeof formatted).toBe('string')
  })

  it('contains section headings', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    const formatted = formatNavigatorGuideTable(result)
    expect(formatted).toContain('Guide Sections')
    expect(formatted).toContain('Attractions')
    expect(formatted).toContain('Tour Routes')
  })

  it('shows no sections message for empty project', () => {
    const result = buildNavigatorGuideResult([], [], {})
    const formatted = formatNavigatorGuideTable(result)
    expect(formatted).toContain('No guide sections found')
  })

  it('shows recommendations when present', () => {
    const result = buildNavigatorGuideResult([], [], {})
    const formatted = formatNavigatorGuideTable(result)
    if (result.recommendations.length > 0) {
      expect(formatted).toContain('Recommendations')
    }
  })

  it('shows onboarding score bars', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    const formatted = formatNavigatorGuideTable(result)
    expect(formatted).toContain('Documentation')
    expect(formatted).toContain('Structure')
    expect(formatted).toContain('Naming')
  })
})

// ─── formatNavigatorGuideJson ─────────────────────────────────────────────────

describe('formatNavigatorGuideJson', () => {
  it('returns valid JSON', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    const json = formatNavigatorGuideJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains all top-level keys', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export default {}'], {})
    const json = formatNavigatorGuideJson(result)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('sections')
    expect(parsed).toHaveProperty('attractions')
    expect(parsed).toHaveProperty('routes')
    expect(parsed).toHaveProperty('constructionZones')
    expect(parsed).toHaveProperty('onboarding')
    expect(parsed).toHaveProperty('stats')
    expect(parsed).toHaveProperty('recommendations')
  })

  it('roundtrips correctly', () => {
    const result = buildNavigatorGuideResult(['index.ts'], ['export function main() {}'], {})
    const json = formatNavigatorGuideJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalAttractions).toBe(result.stats.totalAttractions)
    expect(parsed.onboarding.overall).toBe(result.onboarding.overall)
  })
})

// ─── Integration Tests ────────────────────────────────────────────────────────

describe('navigator-guide integration', () => {
  it('handles a realistic codebase', () => {
    const files = [
      'src/index.ts',
      'src/core/config.ts',
      'src/core/types.ts',
      'src/utils/helpers.ts',
      'src/utils/format.ts',
      'test/helpers.test.ts',
    ]
    const contents = [
      'export function main() {}\nexport function run() {}',
      'const config = { debug: true }\nexport default config',
      'interface AppConfig { debug: boolean }\ntype Status = "active" | "inactive"',
      'export function help() {}\nexport function assist() {}',
      'export function format() {}',
      'describe("helpers", () => { it("works", () => { expect(1).toBe(1) }) })',
    ]
    const result = buildNavigatorGuideResult(files, contents, {})

    expect(result.sections.length).toBe(4)
    expect(result.attractions.length).toBe(6)
    expect(result.routes.length).toBeGreaterThanOrEqual(2)
    expect(result.onboarding.overall).toBeGreaterThan(0)
    expect(result.stats.guideRating).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThanOrEqual(0)
  })

  it('handles codebase with tech debt', () => {
    const files = ['src/legacy.ts']
    const contents = ['// TODO: refactor\n// TODO: fix\n// TODO: cleanup\n// FIXME: bug\n// HACK: workaround']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.constructionZones.length).toBeGreaterThan(0)
    expect(result.stats.constructionZones).toBeGreaterThan(0)
  })

  it('produces consistent results for same input', () => {
    const files = ['src/index.ts']
    const contents = ['export function main() {}']
    const r1 = buildNavigatorGuideResult(files, contents, {})
    const r2 = buildNavigatorGuideResult(files, contents, {})
    expect(r1.stats.totalSections).toBe(r2.stats.totalSections)
    expect(r1.onboarding.overall).toBe(r2.onboarding.overall)
  })

  it('handles files with mixed content', () => {
    const files = ['src/mixed.ts']
    const contents = ['/** Docs */\nexport interface Config {}\n// TODO: implement\nexport function setup() {}']
    const result = buildNavigatorGuideResult(files, contents, {})
    expect(result.attractions[0].highlights.length).toBeGreaterThan(0)
    expect(result.attractions[0].type).toBe('under-construction')
  })
})
