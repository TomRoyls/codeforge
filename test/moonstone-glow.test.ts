import { describe, it, expect } from 'vitest'
import {
  measureGlowing,
  measureIlluminating,
  measurePolishing,
  measureClarifying,
  measurePhasing,
  classifyMoonstoneCondition,
  classifyGardenType,
  classifyGardenCondition,
  classifyMoonGazerGrade,
  analyzeMoonstoneRay,
  analyzeMoonlightGarden,
  generateRecommendations,
  buildMoonstoneGlowResult,
  type MoonstoneRay,
  type MoonlightGarden,
  type NightSummary,
  type MoonstoneGlowStats,
} from '../src/commands/moonstone-glow-helpers.js'
import {
  colorScore,
  colorGrade,
  formatRayTable,
  formatRaysTable,
  formatGardenTable,
  formatGardensTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/moonstone-glow-format-helpers.js'

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

const sampleRay: MoonstoneRay = {
  file: 'src/index.ts',
  adularescence: 80,
  innerLight: 75,
  surfaceSheen: 70,
  translucencyDepth: 65,
  lunarPhase: 60,
  glowing: {
    adularescence: 80, grade: 'bright-glow', hasHighAdularescence: true,
    hasMultifaceted: true, hasDynamic: true, hasNoStatic: true,
    hasShifting: true, hasNoFixed: true, hasVaried: true,
    hasNoMonotone: true, hasAlive: true, hasNoDead: true,
    hasFloating: true, staticCount: 0, fixedCount: 0,
  },
  illuminating: {
    light: 75, quality: 'bright-essence', hasHighLight: true,
    hasIntrinsic: true, hasEssential: true, hasNoSuperficial: true,
    hasDeep: true, hasNoShallow: true, hasSubstantive: true,
    hasNoHollow: true, hasValuable: true, hasNoEmpty: true,
    hasMeaningful: true, superficialCount: 0, shallowCount: 0,
  },
  polishing: {
    sheen: 70, polish: 'polished-surface', hasHighSheen: true,
    hasRefined: true, hasSmooth: true, hasNoRough: true,
    hasPolished: true, hasNoUnfinished: true, hasGlossy: true,
    hasNoMatte: true, hasFinished: true, hasNoRaw: true,
    hasElegant: true, roughCount: 0, unfinishedCount: 0,
  },
  clarifying: {
    depth: 65, translucency: 'proper-clarity', hasHighDepth: false,
    hasTransparent: true, hasClear: true, hasNoOpaque: true,
    hasVisible: true, hasNoHidden: true, hasRevealing: true,
    hasNoConcealing: true, hasOpen: true, hasNoSecret: true,
    hasLucid: true, opaqueCount: 0, hiddenCount: 0,
  },
  phasing: {
    phase: 60, lunar: 'waxing-gibbous', hasHighPhase: false,
    hasMature: true, hasEvolved: true, hasNoImmature: true,
    hasDeveloped: true, hasNoStagnant: true, hasProgressing: true,
    hasNoStuck: true, hasAdvancing: true, hasNoRegressing: true,
    hasRipening: true, immatureCount: 0, stagnantCount: 0,
  },
  condition: 'blue-sheen-moonstone',
  qualityScore: 70,
}

function makeRay(overrides: Partial<MoonstoneRay> = {}): MoonstoneRay {
  return { ...sampleRay, ...overrides }
}

// ─── measureGlowing ────────────────────────────────────────────────

describe('measureGlowing', () => {
  it('returns 0 adularescence for empty content', () => {
    const m = measureGlowing(emptyContent)
    expect(m.adularescence).toBe(0)
    expect(m.grade).toBe('no-glow')
    expect(m.hasHighAdularescence).toBe(false)
  })

  it('detects export and const in minimal content', () => {
    const m = measureGlowing(minimalContent)
    expect(m.adularescence).toBeGreaterThan(0)
    expect(m.hasMultifaceted).toBe(false)
  })

  it('scores rich content high', () => {
    const m = measureGlowing(richContent)
    expect(m.adularescence).toBe(100)
    expect(m.grade).toBe('blue-sheen')
    expect(m.hasHighAdularescence).toBe(true)
  })

  it('detects multifaceted (export + async)', () => {
    expect(measureGlowing(richContent).hasMultifaceted).toBe(true)
    expect(measureGlowing(minimalContent).hasMultifaceted).toBe(false)
  })

  it('detects dynamic (namedExport + returnType)', () => {
    expect(measureGlowing(richContent).hasDynamic).toBe(true)
  })

  it('detects shifting (const + import)', () => {
    expect(measureGlowing(richContent).hasShifting).toBe(true)
  })

  it('detects varied (generics + interface)', () => {
    expect(measureGlowing(richContent).hasVaried).toBe(true)
  })

  it('detects alive (docComments + export)', () => {
    expect(measureGlowing(richContent).hasAlive).toBe(true)
  })

  it('detects floating (typeAlias + const)', () => {
    expect(measureGlowing(richContent).hasFloating).toBe(true)
  })

  it('counts static (var)', () => {
    expect(measureGlowing(badContent).staticCount).toBe(3)
    expect(measureGlowing(richContent).staticCount).toBe(0)
  })

  it('counts fixed (any)', () => {
    expect(measureGlowing(badContent).fixedCount).toBe(2)
  })

  it('hasNoStatic is false when var present', () => {
    expect(measureGlowing(badContent).hasNoStatic).toBe(false)
    expect(measureGlowing(richContent).hasNoStatic).toBe(true)
  })

  it('hasNoFixed is false when any present', () => {
    expect(measureGlowing(badContent).hasNoFixed).toBe(false)
  })

  it('hasNoMonotone is false when eval present', () => {
    expect(measureGlowing(badContent).hasNoMonotone).toBe(false)
  })

  it('hasNoDead is false when debugger present', () => {
    expect(measureGlowing(badContent).hasNoDead).toBe(false)
  })
})

// ─── measureIlluminating ───────────────────────────────────────────

describe('measureIlluminating', () => {
  it('returns 0 light for empty content', () => {
    const m = measureIlluminating(emptyContent)
    expect(m.light).toBe(0)
    expect(m.quality).toBe('no-light')
    expect(m.hasHighLight).toBe(false)
  })

  it('detects returnType and import in minimal content', () => {
    const m = measureIlluminating(minimalContent)
    expect(m.light).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureIlluminating(richContent)
    expect(m.light).toBe(100)
    expect(m.quality).toBe('radiant-core')
  })

  it('detects intrinsic (returnType + import)', () => {
    expect(measureIlluminating(richContent).hasIntrinsic).toBe(true)
    expect(measureIlluminating(minimalContent).hasIntrinsic).toBe(false)
  })

  it('detects essential (export + async)', () => {
    expect(measureIlluminating(richContent).hasEssential).toBe(true)
  })

  it('detects deep (interface + generics)', () => {
    expect(measureIlluminating(richContent).hasDeep).toBe(true)
  })

  it('detects substantive (namedExport + const)', () => {
    expect(measureIlluminating(richContent).hasSubstantive).toBe(true)
  })

  it('detects valuable (docComments + export)', () => {
    expect(measureIlluminating(richContent).hasValuable).toBe(true)
  })

  it('detects meaningful (class + returnType)', () => {
    expect(measureIlluminating(richContent).hasMeaningful).toBe(true)
  })

  it('counts superficial (var)', () => {
    expect(measureIlluminating(badContent).superficialCount).toBe(3)
  })

  it('counts shallow (any)', () => {
    expect(measureIlluminating(badContent).shallowCount).toBe(2)
  })

  it('hasNoSuperficial is false when var present', () => {
    expect(measureIlluminating(badContent).hasNoSuperficial).toBe(false)
  })

  it('hasNoShallow is false when any present', () => {
    expect(measureIlluminating(badContent).hasNoShallow).toBe(false)
  })

  it('hasNoHollow is false when eval present', () => {
    expect(measureIlluminating(badContent).hasNoHollow).toBe(false)
  })

  it('hasNoEmpty is false when debugger present', () => {
    expect(measureIlluminating(badContent).hasNoEmpty).toBe(false)
  })
})

// ─── measurePolishing ──────────────────────────────────────────────

describe('measurePolishing', () => {
  it('returns 0 sheen for empty content', () => {
    const m = measurePolishing(emptyContent)
    expect(m.sheen).toBe(0)
    expect(m.polish).toBe('raw-stone')
  })

  it('detects const and strictEq in minimal content', () => {
    const m = measurePolishing(minimalContent)
    expect(m.sheen).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measurePolishing(richContent)
    expect(m.sheen).toBe(100)
    expect(m.polish).toBe('cat-eye-sheen')
  })

  it('detects refined (const + strictEq)', () => {
    expect(measurePolishing(richContent).hasRefined).toBe(true)
  })

  it('detects smooth (returnType + readonly)', () => {
    expect(measurePolishing(richContent).hasSmooth).toBe(true)
  })

  it('detects polished (interface + class)', () => {
    expect(measurePolishing(richContent).hasPolished).toBe(true)
  })

  it('detects glossy (export + import)', () => {
    expect(measurePolishing(richContent).hasGlossy).toBe(true)
  })

  it('detects finished (private + strictEq)', () => {
    expect(measurePolishing(richContent).hasFinished).toBe(true)
  })

  it('detects elegant (typeAlias + const)', () => {
    expect(measurePolishing(richContent).hasElegant).toBe(true)
  })

  it('counts rough (var)', () => {
    expect(measurePolishing(badContent).roughCount).toBe(3)
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

  it('hasNoRaw is false when debugger present', () => {
    expect(measurePolishing(badContent).hasNoRaw).toBe(false)
  })
})

// ─── measureClarifying ─────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns 0 depth for empty content', () => {
    const m = measureClarifying(emptyContent)
    expect(m.depth).toBe(0)
    expect(m.translucency).toBe('dark')
  })

  it('detects docComments and typeAlias in rich content', () => {
    const m = measureClarifying(richContent)
    expect(m.depth).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measureClarifying(richContent)
    expect(m.depth).toBe(100)
    expect(m.translucency).toBe('crystal-translucent')
  })

  it('detects transparent (docComments + typeAlias)', () => {
    expect(measureClarifying(richContent).hasTransparent).toBe(true)
  })

  it('detects clear (readonly + private)', () => {
    expect(measureClarifying(richContent).hasClear).toBe(true)
  })

  it('detects visible (interface + generics)', () => {
    expect(measureClarifying(richContent).hasVisible).toBe(true)
  })

  it('detects revealing (returnType + export)', () => {
    expect(measureClarifying(richContent).hasRevealing).toBe(true)
  })

  it('detects open (import + class)', () => {
    expect(measureClarifying(richContent).hasOpen).toBe(true)
  })

  it('detects lucid (readonly + docComments)', () => {
    expect(measureClarifying(richContent).hasLucid).toBe(true)
  })

  it('counts opaque (var)', () => {
    expect(measureClarifying(badContent).opaqueCount).toBe(3)
  })

  it('counts hidden (any)', () => {
    expect(measureClarifying(badContent).hiddenCount).toBe(2)
  })

  it('hasNoOpaque is false when var present', () => {
    expect(measureClarifying(badContent).hasNoOpaque).toBe(false)
  })

  it('hasNoHidden is false when any present', () => {
    expect(measureClarifying(badContent).hasNoHidden).toBe(false)
  })

  it('hasNoConcealing is false when eval present', () => {
    expect(measureClarifying(badContent).hasNoConcealing).toBe(false)
  })

  it('hasNoSecret is false when debugger present', () => {
    expect(measureClarifying(badContent).hasNoSecret).toBe(false)
  })
})

// ─── measurePhasing ────────────────────────────────────────────────

describe('measurePhasing', () => {
  it('returns 0 phase for empty content', () => {
    const m = measurePhasing(emptyContent)
    expect(m.phase).toBe(0)
    expect(m.lunar).toBe('eclipse')
  })

  it('detects export and import in minimal content', () => {
    const m = measurePhasing(minimalContent)
    expect(m.phase).toBeGreaterThan(0)
  })

  it('scores rich content high', () => {
    const m = measurePhasing(richContent)
    expect(m.phase).toBe(100)
    expect(m.lunar).toBe('full-moon')
  })

  it('detects mature (export + import)', () => {
    expect(measurePhasing(richContent).hasMature).toBe(true)
  })

  it('detects evolved (const + strictEq)', () => {
    expect(measurePhasing(richContent).hasEvolved).toBe(true)
  })

  it('detects developed (interface + class)', () => {
    expect(measurePhasing(richContent).hasDeveloped).toBe(true)
  })

  it('detects progressing (returnType + readonly)', () => {
    expect(measurePhasing(richContent).hasProgressing).toBe(true)
  })

  it('detects advancing (async + export)', () => {
    expect(measurePhasing(richContent).hasAdvancing).toBe(true)
  })

  it('detects ripening (generics + import)', () => {
    expect(measurePhasing(richContent).hasRipening).toBe(true)
  })

  it('counts immature (var)', () => {
    expect(measurePhasing(badContent).immatureCount).toBe(3)
  })

  it('counts stagnant (any)', () => {
    expect(measurePhasing(badContent).stagnantCount).toBe(2)
  })

  it('hasNoImmature is false when var present', () => {
    expect(measurePhasing(badContent).hasNoImmature).toBe(false)
  })

  it('hasNoStagnant is false when any present', () => {
    expect(measurePhasing(badContent).hasNoStagnant).toBe(false)
  })

  it('hasNoStuck is false when eval present', () => {
    expect(measurePhasing(badContent).hasNoStuck).toBe(false)
  })

  it('hasNoRegressing is false when debugger present', () => {
    expect(measurePhasing(badContent).hasNoRegressing).toBe(false)
  })
})

// ─── classifyMoonstoneCondition ────────────────────────────────────

describe('classifyMoonstoneCondition', () => {
  it('returns rainbow-moonstone for 85+', () => {
    expect(classifyMoonstoneCondition(90)).toBe('rainbow-moonstone')
    expect(classifyMoonstoneCondition(85)).toBe('rainbow-moonstone')
  })

  it('returns blue-sheen-moonstone for 70-84', () => {
    expect(classifyMoonstoneCondition(70)).toBe('blue-sheen-moonstone')
    expect(classifyMoonstoneCondition(84)).toBe('blue-sheen-moonstone')
  })

  it('returns proper-moonstone for 55-69', () => {
    expect(classifyMoonstoneCondition(55)).toBe('proper-moonstone')
    expect(classifyMoonstoneCondition(69)).toBe('proper-moonstone')
  })

  it('returns orthoclase for 40-54', () => {
    expect(classifyMoonstoneCondition(40)).toBe('orthoclase')
    expect(classifyMoonstoneCondition(54)).toBe('orthoclase')
  })

  it('returns feldspar for 25-39', () => {
    expect(classifyMoonstoneCondition(25)).toBe('feldspar')
    expect(classifyMoonstoneCondition(39)).toBe('feldspar')
  })

  it('returns pebble for < 25', () => {
    expect(classifyMoonstoneCondition(0)).toBe('pebble')
    expect(classifyMoonstoneCondition(24)).toBe('pebble')
  })
})

// ─── classifyGardenType ────────────────────────────────────────────

describe('classifyGardenType', () => {
  it('returns no-garden for empty array', () => {
    expect(classifyGardenType([])).toBe('no-garden')
  })

  it('returns moonlit-garden for high avg with rainbow ratio', () => {
    const rays = [
      makeRay({ qualityScore: 90, condition: 'rainbow-moonstone' }),
      makeRay({ qualityScore: 88, condition: 'rainbow-moonstone' }),
    ]
    expect(classifyGardenType(rays)).toBe('moonlit-garden')
  })

  it('returns proper-collection for avg 60+', () => {
    const rays = [makeRay({ qualityScore: 60, condition: 'blue-sheen-moonstone' })]
    expect(classifyGardenType(rays)).toBe('proper-collection')
  })

  it('returns gem-display for avg 45-59', () => {
    const rays = [makeRay({ qualityScore: 45, condition: 'proper-moonstone' })]
    expect(classifyGardenType(rays)).toBe('gem-display')
  })

  it('returns stone-pile for avg 30-44', () => {
    const rays = [makeRay({ qualityScore: 30, condition: 'orthoclase' })]
    expect(classifyGardenType(rays)).toBe('stone-pile')
  })

  it('returns gravel-bed for avg 15-29', () => {
    const rays = [makeRay({ qualityScore: 15, condition: 'feldspar' })]
    expect(classifyGardenType(rays)).toBe('gravel-bed')
  })

  it('returns no-garden for low quality', () => {
    const rays = [makeRay({ qualityScore: 10, condition: 'pebble' })]
    expect(classifyGardenType(rays)).toBe('no-garden')
  })
})

// ─── classifyGardenCondition ───────────────────────────────────────

describe('classifyGardenCondition', () => {
  it('returns ethereal-glow for 75+', () => {
    expect(classifyGardenCondition(80)).toBe('ethereal-glow')
  })

  it('returns moonlight-display for 60-74', () => {
    expect(classifyGardenCondition(60)).toBe('moonlight-display')
  })

  it('returns decent-collection for 45-59', () => {
    expect(classifyGardenCondition(45)).toBe('decent-collection')
  })

  it('returns dim-corner for 30-44', () => {
    expect(classifyGardenCondition(30)).toBe('dim-corner')
  })

  it('returns dark-room for 15-29', () => {
    expect(classifyGardenCondition(15)).toBe('dark-room')
  })

  it('returns empty for < 15', () => {
    expect(classifyGardenCondition(10)).toBe('empty')
  })
})

// ─── classifyMoonGazerGrade ────────────────────────────────────────

describe('classifyMoonGazerGrade', () => {
  it('returns luna-master for 80+', () => {
    expect(classifyMoonGazerGrade(85)).toBe('luna-master')
  })

  it('returns moon-reader for 65-79', () => {
    expect(classifyMoonGazerGrade(65)).toBe('moon-reader')
  })

  it('returns stargazer for 50-64', () => {
    expect(classifyMoonGazerGrade(50)).toBe('stargazer')
  })

  it('returns night-watcher for 35-49', () => {
    expect(classifyMoonGazerGrade(35)).toBe('night-watcher')
  })

  it('returns twilight-observer for 20-34', () => {
    expect(classifyMoonGazerGrade(20)).toBe('twilight-observer')
  })

  it('returns blind for < 20', () => {
    expect(classifyMoonGazerGrade(10)).toBe('blind')
  })
})

// ─── analyzeMoonstoneRay ───────────────────────────────────────────

describe('analyzeMoonstoneRay', () => {
  it('analyzes minimal content', () => {
    const ray = analyzeMoonstoneRay(minimalContent, 'test.ts')
    expect(ray.file).toBe('test.ts')
    expect(ray.adularescence).toBeGreaterThan(0)
    expect(ray.qualityScore).toBeGreaterThan(0)
    expect(ray.condition).toBeDefined()
  })

  it('analyzes rich content with high scores', () => {
    const ray = analyzeMoonstoneRay(richContent, 'rich.ts')
    expect(ray.adularescence).toBe(100)
    expect(ray.innerLight).toBe(100)
    expect(ray.surfaceSheen).toBe(100)
    expect(ray.translucencyDepth).toBe(100)
    expect(ray.lunarPhase).toBe(100)
    expect(ray.qualityScore).toBe(100)
    expect(ray.condition).toBe('rainbow-moonstone')
  })

  it('computes qualityScore as weighted average', () => {
    const ray = analyzeMoonstoneRay(minimalContent, 'minimal.ts')
    const expected = Math.round(
      ray.glowing.adularescence * 0.2 +
      ray.illuminating.light * 0.2 +
      ray.polishing.sheen * 0.2 +
      ray.clarifying.depth * 0.2 +
      ray.phasing.phase * 0.2,
    )
    expect(ray.qualityScore).toBe(expected)
  })

  it('classifies condition based on qualityScore', () => {
    const ray = analyzeMoonstoneRay(richContent, 'rich.ts')
    expect(ray.condition).toBe(classifyMoonstoneCondition(ray.qualityScore))
  })

  it('maps top-level scores from measures', () => {
    const ray = analyzeMoonstoneRay(richContent, 'rich.ts')
    expect(ray.adularescence).toBe(ray.glowing.adularescence)
    expect(ray.innerLight).toBe(ray.illuminating.light)
    expect(ray.surfaceSheen).toBe(ray.polishing.sheen)
    expect(ray.translucencyDepth).toBe(ray.clarifying.depth)
    expect(ray.lunarPhase).toBe(ray.phasing.phase)
  })
})

// ─── analyzeMoonlightGarden ────────────────────────────────────────

describe('analyzeMoonlightGarden', () => {
  it('returns empty garden for no rays', () => {
    const garden = analyzeMoonlightGarden([], 'empty')
    expect(garden.rays).toEqual([])
    expect(garden.avgAdularescence).toBe(0)
    expect(garden.avgLight).toBe(0)
    expect(garden.avgDepth).toBe(0)
    expect(garden.rainbowMoonstoneCount).toBe(0)
    expect(garden.pebbleCount).toBe(0)
    expect(garden.gardenType).toBe('no-garden')
    expect(garden.condition).toBe('empty')
  })

  it('computes averages correctly', () => {
    const rays = [
      makeRay({ adularescence: 80, innerLight: 60, translucencyDepth: 70, qualityScore: 70, condition: 'blue-sheen-moonstone' }),
      makeRay({ adularescence: 60, innerLight: 80, translucencyDepth: 50, qualityScore: 60, condition: 'blue-sheen-moonstone' }),
    ]
    const garden = analyzeMoonlightGarden(rays, 'src')
    expect(garden.avgAdularescence).toBe(70)
    expect(garden.avgLight).toBe(70)
    expect(garden.avgDepth).toBe(60)
  })

  it('counts conditions correctly', () => {
    const rays = [
      makeRay({ condition: 'rainbow-moonstone', qualityScore: 90 }),
      makeRay({ condition: 'pebble', qualityScore: 10 }),
    ]
    const garden = analyzeMoonlightGarden(rays, 'src')
    expect(garden.rainbowMoonstoneCount).toBe(1)
    expect(garden.pebbleCount).toBe(1)
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const goodNight: NightSummary = { avgAdularescence: 80, avgLight: 80, avgDepth: 80, isLuminous: true, overallLuminance: 80 }
  const goodStats: MoonstoneGlowStats = {
    totalFiles: 1, totalGardens: 1,
    avgAdularescence: 80, avgInnerLight: 80, avgSurfaceSheen: 80,
    avgTranslucencyDepth: 80, avgLunarPhase: 80,
    rainbowMoonstoneCount: 1, blueSheenMoonstoneCount: 0, properMoonstoneCount: 0,
    orthoclaseCount: 0, feldsparCount: 0, pebbleCount: 0,
    hasHighAdularescenceCount: 1, hasHighLightCount: 1, hasHighSheenCount: 1,
    hasHighDepthCount: 1, hasHighPhaseCount: 1,
    overallLuminance: 80, moonGazerGrade: 'luna-master',
    bestRay: 'a.ts', mostLuminous: 'a.ts', brightest: 'a.ts',
    mostPolished: 'a.ts', mostTranslucent: 'a.ts',
  }

  it('returns celebration when all is good', () => {
    const recs = generateRecommendations(
      [makeRay({ condition: 'rainbow-moonstone', qualityScore: 90 })],
      [{ directory: 'src', rays: [makeRay()], avgAdularescence: 80, avgLight: 80, avgDepth: 80, rainbowMoonstoneCount: 1, pebbleCount: 0, gardenType: 'moonlit-garden', condition: 'ethereal-glow' }],
      goodNight, goodStats,
    )
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('luna-master')
  })

  it('recommends increasing adularescence when low', () => {
    const stats = { ...goodStats, avgAdularescence: 40 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('adularescence'))).toBe(true)
  })

  it('recommends boosting inner light when low', () => {
    const stats = { ...goodStats, avgInnerLight: 40 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('inner light'))).toBe(true)
  })

  it('recommends polishing surface sheen when low', () => {
    const stats = { ...goodStats, avgSurfaceSheen: 40 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('sheen'))).toBe(true)
  })

  it('recommends deepening translucency when low', () => {
    const stats = { ...goodStats, avgTranslucencyDepth: 40 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('translucency'))).toBe(true)
  })

  it('recommends advancing lunar phase when low', () => {
    const stats = { ...goodStats, avgLunarPhase: 40 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('lunar phase'))).toBe(true)
  })

  it('flags pebble files', () => {
    const stats = { ...goodStats, pebbleCount: 3 }
    const recs = generateRecommendations([], [], goodNight, stats)
    expect(recs.some(r => r.includes('pebble'))).toBe(true)
  })

  it('warns about low luminance', () => {
    const night: NightSummary = { avgAdularescence: 30, avgLight: 30, avgDepth: 30, isLuminous: false, overallLuminance: 30 }
    const recs = generateRecommendations([], [], night, goodStats)
    expect(recs.some(r => r.includes('luminance'))).toBe(true)
  })

  it('warns when all gardens are dark', () => {
    const gardens: MoonlightGarden[] = [
      { directory: 'a', rays: [], avgAdularescence: 0, avgLight: 0, avgDepth: 0, rainbowMoonstoneCount: 0, pebbleCount: 0, gardenType: 'no-garden', condition: 'empty' },
      { directory: 'b', rays: [], avgAdularescence: 0, avgLight: 0, avgDepth: 0, rainbowMoonstoneCount: 0, pebbleCount: 0, gardenType: 'gravel-bed', condition: 'dark-room' },
    ]
    const recs = generateRecommendations([], gardens, goodNight, goodStats)
    expect(recs.some(r => r.includes('dark'))).toBe(true)
  })

  it('names specific pebble files when 1-3', () => {
    const rays = [
      makeRay({ file: 'a.ts', condition: 'pebble', qualityScore: 10 }),
      makeRay({ file: 'b.ts', condition: 'pebble', qualityScore: 10 }),
    ]
    const recs = generateRecommendations(rays, [], goodNight, goodStats)
    expect(recs.some(r => r.includes('a.ts'))).toBe(true)
    expect(recs.some(r => r.includes('b.ts'))).toBe(true)
  })
})

// ─── buildMoonstoneGlowResult ──────────────────────────────────────

describe('buildMoonstoneGlowResult', () => {
  it('handles empty input', async () => {
    const result = await buildMoonstoneGlowResult([], [])
    expect(result.rays).toEqual([])
    expect(result.gardens).toEqual([])
    expect(result.night.avgAdularescence).toBe(0)
    expect(result.night.overallLuminance).toBe(0)
    expect(result.night.isLuminous).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.moonGazerGrade).toBe('blind')
  })

  it('processes minimal content', async () => {
    const result = await buildMoonstoneGlowResult(['test.ts'], [minimalContent])
    expect(result.rays).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgAdularescence).toBeGreaterThan(0)
  })

  it('processes rich content', async () => {
    const result = await buildMoonstoneGlowResult(['rich.ts'], [richContent])
    expect(result.rays[0].qualityScore).toBe(100)
    expect(result.night.avgAdularescence).toBe(100)
    expect(result.night.isLuminous).toBe(true)
    expect(result.night.overallLuminance).toBe(100)
    expect(result.stats.moonGazerGrade).toBe('luna-master')
  })

  it('groups files by directory into gardens', async () => {
    const result = await buildMoonstoneGlowResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [minimalContent, minimalContent, minimalContent],
    )
    expect(result.gardens).toHaveLength(2)
    expect(result.stats.totalGardens).toBe(2)
  })

  it('computes night correctly', async () => {
    const result = await buildMoonstoneGlowResult(['f.ts'], [richContent])
    expect(result.night.avgAdularescence).toBe(result.stats.avgAdularescence)
    expect(result.night.avgLight).toBe(result.stats.avgInnerLight)
    expect(result.night.avgDepth).toBe(result.stats.avgTranslucencyDepth)
    expect(result.night.overallLuminance).toBe(result.stats.overallLuminance)
  })

  it('computes bestRay and other extremes', async () => {
    const result = await buildMoonstoneGlowResult(
      ['a.ts', 'b.ts'],
      [minimalContent, richContent],
    )
    expect(result.stats.bestRay).toBe('b.ts')
    expect(result.stats.mostLuminous).toBe('b.ts')
    expect(result.stats.brightest).toBe('b.ts')
  })

  it('tracks condition counts in stats', async () => {
    const result = await buildMoonstoneGlowResult(['r.ts'], [richContent])
    expect(result.stats.rainbowMoonstoneCount).toBe(1)
    expect(result.stats.pebbleCount).toBe(0)
  })

  it('tracks high measure counts', async () => {
    const result = await buildMoonstoneGlowResult(['r.ts'], [richContent])
    expect(result.stats.hasHighAdularescenceCount).toBe(1)
    expect(result.stats.hasHighLightCount).toBe(1)
    expect(result.stats.hasHighSheenCount).toBe(1)
    expect(result.stats.hasHighDepthCount).toBe(1)
    expect(result.stats.hasHighPhaseCount).toBe(1)
  })

  it('includes recommendations', async () => {
    const result = await buildMoonstoneGlowResult(['r.ts'], [richContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('isLuminous is true when avgAdularescence >= 60', async () => {
    const result = await buildMoonstoneGlowResult(['r.ts'], [richContent])
    expect(result.night.isLuminous).toBe(true)
  })

  it('isLuminous is false when avgAdularescence < 60', async () => {
    const result = await buildMoonstoneGlowResult(['e.ts'], [emptyContent])
    expect(result.night.isLuminous).toBe(false)
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
    expect(typeof colorGrade('rainbow-moonstone')).toBe('string')
    expect(typeof colorGrade('pebble')).toBe('string')
    expect(typeof colorGrade('unknown-grade')).toBe('string')
  })
})

describe('formatRayTable', () => {
  it('formats a ray with file name', () => {
    const ray = analyzeMoonstoneRay(richContent, 'test.ts')
    const formatted = formatRayTable(ray)
    expect(formatted).toContain('test.ts')
    expect(formatted).toContain('Adularescence')
    expect(formatted).toContain('Score')
  })
})

describe('formatRaysTable', () => {
  it('returns message for empty array', () => {
    expect(formatRaysTable([])).toContain('No moonstone rays')
  })

  it('formats multiple rays', () => {
    const rays = [
      analyzeMoonstoneRay(richContent, 'a.ts'),
      analyzeMoonstoneRay(minimalContent, 'b.ts'),
    ]
    const formatted = formatRaysTable(rays)
    expect(formatted).toContain('a.ts')
    expect(formatted).toContain('b.ts')
  })
})

describe('formatGardenTable', () => {
  it('formats a garden', () => {
    const garden = analyzeMoonlightGarden([makeRay()], 'src')
    const formatted = formatGardenTable(garden)
    expect(formatted).toContain('src')
    expect(formatted).toContain('Type')
  })
})

describe('formatGardensTable', () => {
  it('returns message for empty array', () => {
    expect(formatGardensTable([])).toContain('No moonlight gardens')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', async () => {
    const result = await buildMoonstoneGlowResult(['f.ts'], [richContent])
    const formatted = formatStatsTable(result.stats)
    expect(formatted).toContain('Total Files')
    expect(formatted).toContain('Moon Gazer Grade')
    expect(formatted).toContain('Best Ray')
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
    const result = await buildMoonstoneGlowResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Moonstone Glow Analysis')
    expect(formatted).toContain('Night')
    expect(formatted).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildMoonstoneGlowResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.rays).toHaveLength(1)
    expect(parsed.night.overallLuminance).toBe(100)
  })
})
