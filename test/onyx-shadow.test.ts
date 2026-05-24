import { describe, it, expect } from 'vitest'
import {
  measureDeepening,
  measurePolishing,
  measureGrounding,
  measureIntegrating,
  measureAbsorbing,
  classifyOnyxCondition,
  classifyChamberType,
  classifyChamberCondition,
  classifyKeeperGrade,
  analyzeOnyxShadow,
  analyzeOnyxChamber,
  generateRecommendations,
  buildOnyxShadowResult,
  type OnyxShadow,
  type OnyxChamber,
  type AbyssSummary,
  type OnyxShadowStats,
} from '../src/commands/onyx-shadow-helpers.js'
import {
  colorScore,
  colorGrade,
  formatShadowTable,
  formatShadowsTable,
  formatChamberTable,
  formatChambersTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/onyx-shadow-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const minimalContent = 'export const x = 8'

const richContent = `import { x } from 'y'
export interface Foo<T> { bar: string }
export type Result = string | number
export class Handler {
  private data: readonly string[]
  /** Doc */
  async process(input: string): Promise<void> {
    if (input === 'test') return
    const result = await this.handle(input)
  }
}
export const handler = new Handler()`

const emptyContent = ''

const badContent = `var x = eval("bad")
debugger
var y = 1
var z = 2
let a: any = {}
let b: any = {}`

const singleDirShadow: OnyxShadow = {
  file: 'src/index.ts',
  depthMystery: 80,
  polishPerfection: 75,
  groundingStrength: 70,
  shadowIntegration: 65,
  lightAbsorption: 60,
  deepening: {
    mystery: 80, grade: 'deep-shadow', hasHighMystery: true,
    hasDeep: true, hasProfound: true, hasNoShallow: true,
    hasComplex: true, hasNoTrivial: true, hasLayered: true,
    hasNoFlat: true, hasSubstantive: true, hasNoHollow: true,
    hasRich: true, shallowCount: 0, trivialCount: 0,
  },
  polishing: {
    perfection: 75, polish: 'silk-polish', hasHighPerfection: true,
    hasRefined: true, hasSmooth: true, hasNoRough: true,
    hasPolished: true, hasNoUnfinished: true, hasGlossy: true,
    hasNoMatte: true, hasElegant: true, hasNoCrude: true,
    hasFlawless: true, roughCount: 0, unfinishedCount: 0,
  },
  grounding: {
    strength: 70, ground: 'deep-rooted', hasHighStrength: true,
    hasStable: true, hasFirm: true, hasNoWobbly: true,
    hasAnchored: true, hasNoDrifting: true, hasSecure: true,
    hasNoUnstable: true, hasRooted: true, hasNoShaky: true,
    hasSolid: true, wobblyCount: 0, driftingCount: 0,
  },
  integrating: {
    shadow: 65, integration: 'dark-integration', hasHighShadow: false,
    hasComprehensive: true, hasThorough: true, hasNoGaps: true,
    hasComplete: true, hasNoMissing: true, hasCovered: true,
    hasNoExposed: true, hasHandled: true, hasNoUnhandled: true,
    hasProtected: true, gapsCount: 0, missingCount: 0,
  },
  absorbing: {
    absorption: 60, focus: 'deep-concentration', hasHighAbsorption: false,
    hasFocused: true, hasConcentrated: true, hasNoDistracted: true,
    hasSingle: true, hasNoMulti: true, hasDedicated: true,
    hasNoScattered: true, hasSharp: true, hasNoBlurry: true,
    hasAttentive: true, distractedCount: 0, scatteredCount: 0,
  },
  condition: 'fine-black-onyx',
  qualityScore: 70,
}

function makeShadow(overrides: Partial<OnyxShadow> = {}): OnyxShadow {
  return { ...singleDirShadow, ...overrides }
}

// ─── measureDeepening ──────────────────────────────────────────────

describe('measureDeepening', () => {
  it('returns 0 mystery for empty content', () => {
    const m = measureDeepening(emptyContent)
    expect(m.mystery).toBe(0)
    expect(m.grade).toBe('transparent')
    expect(m.hasHighMystery).toBe(false)
  })

  it('detects export in minimal content', () => {
    const m = measureDeepening(minimalContent)
    expect(m.mystery).toBeGreaterThan(0)
    expect(m.hasDeep).toBe(false)
    expect(m.hasProfound).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureDeepening(richContent)
    expect(m.mystery).toBe(100)
    expect(m.grade).toBe('abyssal-depth')
    expect(m.hasHighMystery).toBe(true)
  })

  it('detects deep (export + class)', () => {
    expect(measureDeepening(richContent).hasDeep).toBe(true)
    expect(measureDeepening(minimalContent).hasDeep).toBe(false)
  })

  it('detects profound (interface + generics)', () => {
    expect(measureDeepening(richContent).hasProfound).toBe(true)
  })

  it('detects complex (returnType + namedExport)', () => {
    expect(measureDeepening(richContent).hasComplex).toBe(true)
  })

  it('detects layered (import + docComments)', () => {
    expect(measureDeepening(richContent).hasLayered).toBe(true)
  })

  it('detects substantive (typeAlias + async)', () => {
    expect(measureDeepening(richContent).hasSubstantive).toBe(true)
  })

  it('detects rich (class + interface)', () => {
    expect(measureDeepening(richContent).hasRich).toBe(true)
  })

  it('counts shallow (var)', () => {
    expect(measureDeepening(badContent).shallowCount).toBe(3)
    expect(measureDeepening(richContent).shallowCount).toBe(0)
  })

  it('counts trivial (any)', () => {
    expect(measureDeepening(badContent).trivialCount).toBe(2)
    expect(measureDeepening(richContent).trivialCount).toBe(0)
  })

  it('hasNoShallow is false when var present', () => {
    expect(measureDeepening(badContent).hasNoShallow).toBe(false)
    expect(measureDeepening(richContent).hasNoShallow).toBe(true)
  })

  it('hasNoTrivial is false when any present', () => {
    expect(measureDeepening(badContent).hasNoTrivial).toBe(false)
  })

  it('hasNoFlat is false when eval present', () => {
    expect(measureDeepening(badContent).hasNoFlat).toBe(false)
    expect(measureDeepening(richContent).hasNoFlat).toBe(true)
  })

  it('hasNoHollow is false when debugger present', () => {
    expect(measureDeepening(badContent).hasNoHollow).toBe(false)
    expect(measureDeepening(richContent).hasNoHollow).toBe(true)
  })

  it('grade is deep-shadow at 70-84', () => {
    const content = 'export class Foo { } import { x } from "y" interface Bar { } type T = string function f(): void { }'
    const m = measureDeepening(content)
    expect(m.mystery).toBeGreaterThanOrEqual(70)
    expect(m.mystery).toBeLessThan(85)
    expect(m.grade).toBe('deep-shadow')
  })

  it('grade is proper-darkness at 55-69', () => {
    const content = 'export class Foo { } import { x } from "y" interface Bar { } async function f() { }'
    const m = measureDeepening(content)
    expect(m.mystery).toBeGreaterThanOrEqual(55)
    expect(m.mystery).toBeLessThan(70)
    expect(m.grade).toBe('proper-darkness')
  })

  it('grade is surface-shadow at 40-54', () => {
    const content = 'export class Foo { } import { x } from "y"'
    const m = measureDeepening(content)
    expect(m.mystery).toBeGreaterThanOrEqual(40)
    expect(m.mystery).toBeLessThan(55)
    expect(m.grade).toBe('surface-shadow')
  })

  it('grade is thin-veil at 25-39', () => {
    const content = 'export function foo(): string { return "x" }'
    const m = measureDeepening(content)
    expect(m.mystery).toBeGreaterThanOrEqual(25)
    expect(m.mystery).toBeLessThan(40)
    expect(m.grade).toBe('thin-veil')
  })
})

// ─── measurePolishing ──────────────────────────────────────────────

describe('measurePolishing', () => {
  it('returns 0 perfection for empty content', () => {
    const m = measurePolishing(emptyContent)
    expect(m.perfection).toBe(0)
    expect(m.polish).toBe('raw-stone')
    expect(m.hasHighPerfection).toBe(false)
  })

  it('detects const in minimal content', () => {
    const m = measurePolishing(minimalContent)
    expect(m.perfection).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measurePolishing(richContent)
    expect(m.perfection).toBe(100)
    expect(m.polish).toBe('mirror-black')
  })

  it('detects refined (docComments + readonly)', () => {
    expect(measurePolishing(richContent).hasRefined).toBe(true)
    expect(measurePolishing(minimalContent).hasRefined).toBe(false)
  })

  it('detects smooth (returnType + strictEq)', () => {
    expect(measurePolishing(richContent).hasSmooth).toBe(true)
  })

  it('detects polished (const + private)', () => {
    expect(measurePolishing(richContent).hasPolished).toBe(true)
  })

  it('detects glossy (interface + namedExport)', () => {
    expect(measurePolishing(richContent).hasGlossy).toBe(true)
  })

  it('detects elegant (export + typeAlias)', () => {
    expect(measurePolishing(richContent).hasElegant).toBe(true)
  })

  it('detects flawless (docComments + strictEq)', () => {
    expect(measurePolishing(richContent).hasFlawless).toBe(true)
  })

  it('counts rough (var)', () => {
    expect(measurePolishing(badContent).roughCount).toBe(3)
    expect(measurePolishing(richContent).roughCount).toBe(0)
  })

  it('counts unfinished (any)', () => {
    expect(measurePolishing(badContent).unfinishedCount).toBe(2)
  })

  it('hasNoRough is false when var present', () => {
    expect(measurePolishing(badContent).hasNoRough).toBe(false)
  })

  it('hasNoUnfinished is false when any present', () => {
    expect(measurePolishing(badContent).hasNoUnfinished).toBe(false)
  })

  it('hasNoMatte is false when eval present', () => {
    expect(measurePolishing(badContent).hasNoMatte).toBe(false)
  })

  it('hasNoCrude is false when debugger present', () => {
    expect(measurePolishing(badContent).hasNoCrude).toBe(false)
  })
})

// ─── measureGrounding ──────────────────────────────────────────────

describe('measureGrounding', () => {
  it('returns 0 strength for empty content', () => {
    const m = measureGrounding(emptyContent)
    expect(m.strength).toBe(0)
    expect(m.ground).toBe('unanchored')
  })

  it('detects const in minimal content', () => {
    const m = measureGrounding(minimalContent)
    expect(m.strength).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureGrounding(richContent)
    expect(m.strength).toBe(100)
    expect(m.ground).toBe('bedrock-solid')
  })

  it('detects stable (const + strictEq)', () => {
    expect(measureGrounding(richContent).hasStable).toBe(true)
  })

  it('detects firm (interface + typeAlias)', () => {
    expect(measureGrounding(richContent).hasFirm).toBe(true)
  })

  it('detects anchored (export + import)', () => {
    expect(measureGrounding(richContent).hasAnchored).toBe(true)
  })

  it('detects secure (returnType + readonly)', () => {
    expect(measureGrounding(richContent).hasSecure).toBe(true)
  })

  it('detects rooted (private + strictEq)', () => {
    expect(measureGrounding(richContent).hasRooted).toBe(true)
  })

  it('detects solid (class + const)', () => {
    expect(measureGrounding(richContent).hasSolid).toBe(true)
  })

  it('counts wobbly (var)', () => {
    expect(measureGrounding(badContent).wobblyCount).toBe(3)
  })

  it('counts drifting (any)', () => {
    expect(measureGrounding(badContent).driftingCount).toBe(2)
  })

  it('hasNoWobbly is false when var present', () => {
    expect(measureGrounding(badContent).hasNoWobbly).toBe(false)
  })

  it('hasNoDrifting is false when any present', () => {
    expect(measureGrounding(badContent).hasNoDrifting).toBe(false)
  })

  it('hasNoUnstable is false when eval present', () => {
    expect(measureGrounding(badContent).hasNoUnstable).toBe(false)
  })

  it('hasNoShaky is false when debugger present', () => {
    expect(measureGrounding(badContent).hasNoShaky).toBe(false)
  })
})

// ─── measureIntegrating ────────────────────────────────────────────

describe('measureIntegrating', () => {
  it('returns 0 shadow for empty content', () => {
    const m = measureIntegrating(emptyContent)
    expect(m.shadow).toBe(0)
    expect(m.integration).toBe('no-handling')
  })

  it('detects export in minimal content', () => {
    const m = measureIntegrating(minimalContent)
    expect(m.shadow).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureIntegrating(richContent)
    expect(m.shadow).toBe(100)
    expect(m.integration).toBe('shadow-master')
  })

  it('detects comprehensive (namedExport + export)', () => {
    expect(measureIntegrating(richContent).hasComprehensive).toBe(true)
    expect(measureIntegrating(minimalContent).hasComprehensive).toBe(true)
  })

  it('detects thorough (returnType + strictEq)', () => {
    expect(measureIntegrating(richContent).hasThorough).toBe(true)
  })

  it('detects complete (readonly + private)', () => {
    expect(measureIntegrating(richContent).hasComplete).toBe(true)
  })

  it('detects covered (interface + generics)', () => {
    expect(measureIntegrating(richContent).hasCovered).toBe(true)
  })

  it('detects handled (docComments + namedExport)', () => {
    expect(measureIntegrating(richContent).hasHandled).toBe(true)
  })

  it('detects protected (class + returnType)', () => {
    expect(measureIntegrating(richContent).hasProtected).toBe(true)
  })

  it('counts gaps (var)', () => {
    expect(measureIntegrating(badContent).gapsCount).toBe(3)
  })

  it('counts missing (any)', () => {
    expect(measureIntegrating(badContent).missingCount).toBe(2)
  })

  it('hasNoGaps is false when var present', () => {
    expect(measureIntegrating(badContent).hasNoGaps).toBe(false)
  })

  it('hasNoMissing is false when any present', () => {
    expect(measureIntegrating(badContent).hasNoMissing).toBe(false)
  })

  it('hasNoExposed is false when eval present', () => {
    expect(measureIntegrating(badContent).hasNoExposed).toBe(false)
  })

  it('hasNoUnhandled is false when debugger present', () => {
    expect(measureIntegrating(badContent).hasNoUnhandled).toBe(false)
  })
})

// ─── measureAbsorbing ──────────────────────────────────────────────

describe('measureAbsorbing', () => {
  it('returns 0 absorption for empty content', () => {
    const m = measureAbsorbing(emptyContent)
    expect(m.absorption).toBe(0)
    expect(m.focus).toBe('dispersed')
  })

  it('detects const and export in minimal content', () => {
    const m = measureAbsorbing(minimalContent)
    expect(m.absorption).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureAbsorbing(richContent)
    expect(m.absorption).toBe(100)
    expect(m.focus).toBe('total-focus')
  })

  it('detects focused (const + async)', () => {
    expect(measureAbsorbing(richContent).hasFocused).toBe(true)
  })

  it('detects concentrated (export + returnType)', () => {
    expect(measureAbsorbing(richContent).hasConcentrated).toBe(true)
  })

  it('detects single (import + interface)', () => {
    expect(measureAbsorbing(richContent).hasSingle).toBe(true)
  })

  it('detects dedicated (generics + docComments)', () => {
    expect(measureAbsorbing(richContent).hasDedicated).toBe(true)
  })

  it('detects sharp (private + readonly)', () => {
    expect(measureAbsorbing(richContent).hasSharp).toBe(true)
  })

  it('detects attentive (async + const)', () => {
    expect(measureAbsorbing(richContent).hasAttentive).toBe(true)
  })

  it('counts distracted (var)', () => {
    expect(measureAbsorbing(badContent).distractedCount).toBe(3)
  })

  it('counts scattered (any)', () => {
    expect(measureAbsorbing(badContent).scatteredCount).toBe(2)
  })

  it('hasNoDistracted is false when var present', () => {
    expect(measureAbsorbing(badContent).hasNoDistracted).toBe(false)
  })

  it('hasNoMulti is false when any present', () => {
    expect(measureAbsorbing(badContent).hasNoMulti).toBe(false)
  })

  it('hasNoScattered is false when eval present', () => {
    expect(measureAbsorbing(badContent).hasNoScattered).toBe(false)
  })

  it('hasNoBlurry is false when debugger present', () => {
    expect(measureAbsorbing(badContent).hasNoBlurry).toBe(false)
  })
})

// ─── classifyOnyxCondition ─────────────────────────────────────────

describe('classifyOnyxCondition', () => {
  it('returns masterpiece-onyx for 85+', () => {
    expect(classifyOnyxCondition(90)).toBe('masterpiece-onyx')
    expect(classifyOnyxCondition(85)).toBe('masterpiece-onyx')
  })

  it('returns fine-black-onyx for 70-84', () => {
    expect(classifyOnyxCondition(70)).toBe('fine-black-onyx')
    expect(classifyOnyxCondition(84)).toBe('fine-black-onyx')
  })

  it('returns proper-stone for 55-69', () => {
    expect(classifyOnyxCondition(55)).toBe('proper-stone')
    expect(classifyOnyxCondition(69)).toBe('proper-stone')
  })

  it('returns banded-agate for 40-54', () => {
    expect(classifyOnyxCondition(40)).toBe('banded-agate')
    expect(classifyOnyxCondition(54)).toBe('banded-agate')
  })

  it('returns common-chalcedony for 25-39', () => {
    expect(classifyOnyxCondition(25)).toBe('common-chalcedony')
    expect(classifyOnyxCondition(39)).toBe('common-chalcedony')
  })

  it('returns gravel for < 25', () => {
    expect(classifyOnyxCondition(0)).toBe('gravel')
    expect(classifyOnyxCondition(24)).toBe('gravel')
  })
})

// ─── classifyChamberType ───────────────────────────────────────────

describe('classifyChamberType', () => {
  it('returns no-chamber for empty array', () => {
    expect(classifyChamberType([])).toBe('no-chamber')
  })

  it('returns shadow-vault for high avg with masterpiece ratio', () => {
    const shadows = [
      makeShadow({ qualityScore: 90, condition: 'masterpiece-onyx' }),
      makeShadow({ qualityScore: 88, condition: 'masterpiece-onyx' }),
    ]
    expect(classifyChamberType(shadows)).toBe('shadow-vault')
  })

  it('returns deep-crypt for avg 60+', () => {
    const shadows = [makeShadow({ qualityScore: 60, condition: 'fine-black-onyx' })]
    expect(classifyChamberType(shadows)).toBe('deep-crypt')
  })

  it('returns proper-chamber for avg 45-59', () => {
    const shadows = [makeShadow({ qualityScore: 45, condition: 'proper-stone' })]
    expect(classifyChamberType(shadows)).toBe('proper-chamber')
  })

  it('returns stone-room for avg 30-44', () => {
    const shadows = [makeShadow({ qualityScore: 30, condition: 'banded-agate' })]
    expect(classifyChamberType(shadows)).toBe('stone-room')
  })

  it('returns pebble-box for avg 15-29', () => {
    const shadows = [makeShadow({ qualityScore: 15, condition: 'common-chalcedony' })]
    expect(classifyChamberType(shadows)).toBe('pebble-box')
  })

  it('returns no-chamber for low quality', () => {
    const shadows = [makeShadow({ qualityScore: 10, condition: 'gravel' })]
    expect(classifyChamberType(shadows)).toBe('no-chamber')
  })
})

// ─── classifyChamberCondition ──────────────────────────────────────

describe('classifyChamberCondition', () => {
  it('returns obsidian-hall for 75+', () => {
    expect(classifyChamberCondition(80)).toBe('obsidian-hall')
  })

  it('returns dark-gallery for 60-74', () => {
    expect(classifyChamberCondition(60)).toBe('dark-gallery')
  })

  it('returns decent-display for 45-59', () => {
    expect(classifyChamberCondition(45)).toBe('decent-display')
  })

  it('returns dim-room for 30-44', () => {
    expect(classifyChamberCondition(30)).toBe('dim-room')
  })

  it('returns empty-shelf for 15-29', () => {
    expect(classifyChamberCondition(15)).toBe('empty-shelf')
  })

  it('returns void for < 15', () => {
    expect(classifyChamberCondition(10)).toBe('void')
  })
})

// ─── classifyKeeperGrade ───────────────────────────────────────────

describe('classifyKeeperGrade', () => {
  it('returns shadow-lord for 80+', () => {
    expect(classifyKeeperGrade(85)).toBe('shadow-lord')
  })

  it('returns dark-keeper for 65-79', () => {
    expect(classifyKeeperGrade(65)).toBe('dark-keeper')
  })

  it('returns stone-guardian for 50-64', () => {
    expect(classifyKeeperGrade(50)).toBe('stone-guardian')
  })

  it('returns apprentice for 35-49', () => {
    expect(classifyKeeperGrade(35)).toBe('apprentice')
  })

  it('returns novice for 20-34', () => {
    expect(classifyKeeperGrade(20)).toBe('novice')
  })

  it('returns surface-dweller for < 20', () => {
    expect(classifyKeeperGrade(10)).toBe('surface-dweller')
  })
})

// ─── analyzeOnyxShadow ─────────────────────────────────────────────

describe('analyzeOnyxShadow', () => {
  it('analyzes minimal content', () => {
    const shadow = analyzeOnyxShadow(minimalContent, 'test.ts')
    expect(shadow.file).toBe('test.ts')
    expect(shadow.depthMystery).toBeGreaterThan(0)
    expect(shadow.qualityScore).toBeGreaterThan(0)
    expect(shadow.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const shadow = analyzeOnyxShadow(richContent, 'rich.ts')
    expect(shadow.depthMystery).toBe(100)
    expect(shadow.polishPerfection).toBe(100)
    expect(shadow.groundingStrength).toBe(100)
    expect(shadow.shadowIntegration).toBe(100)
    expect(shadow.lightAbsorption).toBe(100)
    expect(shadow.qualityScore).toBe(100)
    expect(shadow.condition).toBe('masterpiece-onyx')
  })

  it('computes qualityScore as weighted average', () => {
    const shadow = analyzeOnyxShadow(minimalContent, 'minimal.ts')
    const expected = Math.round(
      shadow.deepening.mystery * 0.2 +
      shadow.polishing.perfection * 0.2 +
      shadow.grounding.strength * 0.2 +
      shadow.integrating.shadow * 0.2 +
      shadow.absorbing.absorption * 0.2,
    )
    expect(shadow.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const shadow = analyzeOnyxShadow(richContent, 'rich.ts')
    expect(shadow.condition).toBe(classifyOnyxCondition(shadow.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const shadow = analyzeOnyxShadow(richContent, 'rich.ts')
    expect(shadow.depthMystery).toBe(shadow.deepening.mystery)
    expect(shadow.polishPerfection).toBe(shadow.polishing.perfection)
    expect(shadow.groundingStrength).toBe(shadow.grounding.strength)
    expect(shadow.shadowIntegration).toBe(shadow.integrating.shadow)
    expect(shadow.lightAbsorption).toBe(shadow.absorbing.absorption)
  })
})

// ─── analyzeOnyxChamber ────────────────────────────────────────────

describe('analyzeOnyxChamber', () => {
  it('returns empty chamber for no shadows', () => {
    const chamber = analyzeOnyxChamber([], 'empty')
    expect(chamber.shadows).toEqual([])
    expect(chamber.avgMystery).toBe(0)
    expect(chamber.avgPerfection).toBe(0)
    expect(chamber.avgStrength).toBe(0)
    expect(chamber.masterpieceOnyxCount).toBe(0)
    expect(chamber.gravelCount).toBe(0)
    expect(chamber.chamberType).toBe('no-chamber')
    expect(chamber.condition).toBe('void')
  })

  it('computes averages correctly', () => {
    const shadows = [
      makeShadow({ depthMystery: 80, polishPerfection: 60, groundingStrength: 70, qualityScore: 70, condition: 'fine-black-onyx' }),
      makeShadow({ depthMystery: 60, polishPerfection: 80, groundingStrength: 50, qualityScore: 60, condition: 'fine-black-onyx' }),
    ]
    const chamber = analyzeOnyxChamber(shadows, 'src')
    expect(chamber.avgMystery).toBe(70)
    expect(chamber.avgPerfection).toBe(70)
    expect(chamber.avgStrength).toBe(60)
  })

  it('counts conditions correctly', () => {
    const shadows = [
      makeShadow({ condition: 'masterpiece-onyx', qualityScore: 90 }),
      makeShadow({ condition: 'gravel', qualityScore: 10 }),
    ]
    const chamber = analyzeOnyxChamber(shadows, 'src')
    expect(chamber.masterpieceOnyxCount).toBe(1)
    expect(chamber.gravelCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyAbyss: AbyssSummary = { avgMystery: 80, avgPerfection: 80, avgStrength: 80, isDeep: true, overallDepth: 80 }
  const emptyStats: OnyxShadowStats = {
    totalFiles: 1, totalChambers: 1,
    avgDepthMystery: 80, avgPolishPerfection: 80, avgGroundingStrength: 80,
    avgShadowIntegration: 80, avgLightAbsorption: 80,
    masterpieceOnyxCount: 1, fineBlackOnyxCount: 0, properStoneCount: 0,
    bandedAgateCount: 0, commonChalcedonyCount: 0, gravelCount: 0,
    hasHighMysteryCount: 1, hasHighPerfectionCount: 1, hasHighStrengthCount: 1,
    hasHighShadowCount: 1, hasHighAbsorptionCount: 1,
    overallDepth: 80, keeperGrade: 'shadow-lord',
    bestShadow: 'a.ts', deepest: 'a.ts', mostPolished: 'a.ts',
    mostGrounded: 'a.ts', mostIntegrated: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeShadow({ condition: 'masterpiece-onyx', qualityScore: 90 })],
      [{ directory: 'src', shadows: [makeShadow()], avgMystery: 80, avgPerfection: 80, avgStrength: 80, masterpieceOnyxCount: 1, gravelCount: 0, chamberType: 'shadow-vault', condition: 'obsidian-hall' }],
      emptyAbyss, emptyStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('470 commands')
  })

  it('recommends deepening mystery when low', () => {
    const stats = { ...emptyStats, avgDepthMystery: 40 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('Deepen'))).toBe(true)
  })

  it('recommends polishing when low', () => {
    const stats = { ...emptyStats, avgPolishPerfection: 40 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('Polish'))).toBe(true)
  })

  it('recommends strengthening grounding when low', () => {
    const stats = { ...emptyStats, avgGroundingStrength: 40 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('Strengthen'))).toBe(true)
  })

  it('recommends integrating shadow when low', () => {
    const stats = { ...emptyStats, avgShadowIntegration: 40 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('Integrate'))).toBe(true)
  })

  it('recommends sharpening absorption when low', () => {
    const stats = { ...emptyStats, avgLightAbsorption: 40 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('Sharpen'))).toBe(true)
  })

  it('flags gravel files', () => {
    const stats = { ...emptyStats, gravelCount: 3 }
    const recs = generateRecommendations([], [], emptyAbyss, stats)
    expect(recs.some(r => r.includes('gravel'))).toBe(true)
  })

  it('warns about shallow overall depth', () => {
    const abyss: AbyssSummary = { avgMystery: 30, avgPerfection: 30, avgStrength: 30, isDeep: false, overallDepth: 30 }
    const recs = generateRecommendations([], [], abyss, emptyStats)
    expect(recs.some(r => r.includes('shallow'))).toBe(true)
  })

  it('warns when all chambers are dim', () => {
    const chambers: OnyxChamber[] = [
      { directory: 'a', shadows: [], avgMystery: 0, avgPerfection: 0, avgStrength: 0, masterpieceOnyxCount: 0, gravelCount: 0, chamberType: 'no-chamber', condition: 'void' },
      { directory: 'b', shadows: [], avgMystery: 0, avgPerfection: 0, avgStrength: 0, masterpieceOnyxCount: 0, gravelCount: 0, chamberType: 'pebble-box', condition: 'empty-shelf' },
    ]
    const recs = generateRecommendations([], chambers, emptyAbyss, emptyStats)
    expect(recs.some(r => r.includes('dim'))).toBe(true)
  })

  it('names specific gravel files when 1-3', () => {
    const shadows = [
      makeShadow({ file: 'a.ts', condition: 'gravel', qualityScore: 10 }),
      makeShadow({ file: 'b.ts', condition: 'gravel', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(shadows, [], emptyAbyss, emptyStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildOnyxShadowResult ─────────────────────────────────────────

describe('buildOnyxShadowResult', () => {
  it('handles empty input', async () => {
    const result = await buildOnyxShadowResult([], [])
    expect(result.shadows).toEqual([])
    expect(result.chambers).toEqual([])
    expect(result.abyss.avgMystery).toBe(0)
    expect(result.abyss.overallDepth).toBe(0)
    expect(result.abyss.isDeep).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.keeperGrade).toBe('surface-dweller')
  })

  it('processes minimal content', async () => {
    const result = await buildOnyxShadowResult(['test.ts'], [minimalContent])
    expect(result.shadows).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgDepthMystery).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildOnyxShadowResult(['rich.ts'], [richContent])
    expect(result.shadows[0].qualityScore).toBe(100)
    expect(result.abyss.avgMystery).toBe(100)
    expect(result.abyss.isDeep).toBe(true)
    expect(result.abyss.overallDepth).toBe(100)
    expect(result.stats.keeperGrade).toBe('shadow-lord')
  })

  it('groups files by directory into chambers', async () => {
    const result = await buildOnyxShadowResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.chambers).toHaveLength(2)
    expect(result.stats.totalChambers).toBe(2)
  })

  it('computes abyss correctly', async () => {
    const result = await buildOnyxShadowResult(['f.ts'], [richContent])
    expect(result.abyss.avgMystery).toBe(result.stats.avgDepthMystery)
    expect(result.abyss.avgPerfection).toBe(result.stats.avgPolishPerfection)
    expect(result.abyss.avgStrength).toBe(result.stats.avgGroundingStrength)
    expect(result.abyss.overallDepth).toBe(result.stats.overallDepth)
  })

  it('computes bestShadow and other extremes', async () => {
    const result = await buildOnyxShadowResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestShadow).toBe('b.ts')
    expect(result.stats.deepest).toBe('b.ts')
    expect(result.stats.mostPolished).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildOnyxShadowResult(['r.ts'], [richContent])
    expect(result.stats.masterpieceOnyxCount).toBe(1)
    expect(result.stats.gravelCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildOnyxShadowResult(['r.ts'], [richContent])
    expect(result.stats.hasHighMysteryCount).toBe(1)
    expect(result.stats.hasHighPerfectionCount).toBe(1)
    expect(result.stats.hasHighStrengthCount).toBe(1)
    expect(result.stats.hasHighShadowCount).toBe(1)
    expect(result.stats.hasHighAbsorptionCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildOnyxShadowResult(['r.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns string for all tiers', () => {
    expect(typeof colorScore(90)).toBe('string')
    expect(typeof colorScore(70)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(30)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns string for known grades', () => {
    expect(typeof colorGrade('masterpiece-onyx')).toBe('string')
    expect(typeof colorGrade('gravel')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatShadowTable', () => {
  it('formats a shadow with file name', () => {
    const shadow = analyzeOnyxShadow(richContent, 'test.ts')
    const formatted = formatShadowTable(shadow)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Mystery')
    expect(formatted).toContain('Score')
  })
})

describe('formatShadowsTable', () => {
  it('returns message for empty array', () => {
    expect(formatShadowsTable([])).toContain('No onyx shadows')
  })

  it('formats multiple shadows', () => {
    const shadows = [
      analyzeOnyxShadow(richContent, 'a.ts'),
      analyzeOnyxShadow(minimalContent, 'b.ts'),
    ]
    const formatted = formatShadowsTable(shadows)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatChamberTable', () => {
  it('formats a chamber', () => {
    const chamber = analyzeOnyxChamber([makeShadow()], 'src')
    const formatted = formatChamberTable(chamber)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatChambersTable', () => {
  it('returns message for empty array', () => {
    expect(formatChambersTable([])).toContain('No onyx chambers')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildOnyxShadowResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Keeper Grade')
    expect(formatted).toContain('Best Shadow')
  })
})

describe('formatRecommendations', () => {
  it('returns message for empty array', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const formatted = formatRecommendations(['Do X', 'Do Y'])
    expect(formatted).toContain('Do X')
    expect(formatted).toContain('Do Y')
  })
})

describe('formatResultTable', () => {
  it('formats complete result', async () => {
    const result = await buildOnyxShadowResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Onyx Shadow Analysis')
    expect(formatted).toContain('Abyss')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildOnyxShadowResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.shadows).toHaveLength(1)
    expect(parsed.abyss.overallDepth).toBe(100)
  })
})
