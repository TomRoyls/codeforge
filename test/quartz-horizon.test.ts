import { describe, it, expect } from 'vitest'
import {
  measureClarifying,
  measureResonating,
  measureSignaling,
  measureStructuring,
  measureKnowing,
  classifyCrystalCondition,
  classifyVeinType,
  classifyVeinCondition,
  classifyGeologistGrade,
  analyzeQuartzCrystal,
  analyzeQuartzVein,
  generateRecommendations,
  buildQuartzHorizonResult,
} from '../src/commands/quartz-horizon-helpers.js'
import {
  colorScore,
  colorGrade,
  formatCrystalTable,
  formatCrystalsTable,
  formatVeinTable,
  formatVeinsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/quartz-horizon-format-helpers.js'
import type { QuartzCrystal, QuartzVein, QuartzHorizonResult } from '../src/commands/quartz-horizon-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────

const RichContent = `/**
 * Rich module
 */
export interface Store<T> {
  get(key: string): T
  set(key: string, val: T): Void
}

export class DataStore<T> extends BaseStore implements IStore {
  private items: T[] = []
  abstract process(): Void

  async fetch(): Promise<T> {
    const result = await api.get<T>('/data')
    const mapped = result.items.map(i => i.value).filter(Boolean)
    const reduced = mapped.reduce((a, b) => a + b, 0)
    return result
  }

  try {
    const data = this.parse(raw)
    if (data) {
      return data
    }
  } catch {
    return null
  }
}
`

const MinimalContent = `const x = 1`

const ToxicContent = `var x = eval("1 + 2")
var y = debugger
console.log("debug")
const z: any = null`

const EmptyContent = ``

function makeCrystal(overrides: Partial<QuartzCrystal> = {}): QuartzCrystal {
  const base: QuartzCrystal = {
    file: 'test.ts',
    crystallineClarity: 80,
    vibrationQuality: 80,
    resonancePurity: 80,
    structureStrength: 80,
    veinWisdom: 80,
    clarifying: {
      clarity: 80,
      crystal: 'clear-crystal',
      hasHighClarity: true,
      hasReadable: true,
      hasSelfDocumenting: true,
      hasNoCryptic: true,
      hasTransparent: true,
      hasNoObfuscated: true,
      hasClear: true,
      hasNoHidden: true,
      hasVisible: true,
      hasNoInvisible: true,
      hasUnderstandable: true,
      hasNoArcane: true,
      hasLuminous: true,
      hasNoDark: true,
      crypticCount: 0,
      obfuscatedCount: 0,
    },
    resonating: {
      vibration: 80,
      frequency: 'precise-frequency',
      hasHighVibration: true,
      hasResponsive: true,
      hasEfficient: true,
      hasNoSluggish: true,
      hasPerformant: true,
      hasNoBottlenecked: true,
      hasTimely: true,
      hasNoDelayed: true,
      hasOptimized: true,
      hasNoWasteful: true,
      hasSharp: true,
      hasNoDull: true,
      hasPrecise: true,
      hasNoApproximate: true,
      sluggishCount: 0,
      wastefulCount: 0,
    },
    signaling: {
      purity: 80,
      signal: 'strong-signal',
      hasHighPurity: true,
      hasWellNamed: true,
      hasNoMisnamed: true,
      hasExpressive: true,
      hasNoTerse: true,
      hasClearIntent: true,
      hasNoAmbiguous: true,
      hasCommunicative: true,
      hasNoSilent: true,
      hasSelfDocumenting: true,
      hasNoCryptic: true,
      hasObvious: true,
      hasNoSubtle: true,
      hasResonant: true,
      misnamedCount: 0,
      ambiguousCount: 0,
    },
    structuring: {
      strength: 80,
      lattice: 'well-formed',
      hasHighStrength: true,
      hasOrganized: true,
      hasWellStructured: true,
      hasNoChaotic: true,
      hasModular: true,
      hasNoMonolithic: true,
      hasLayered: true,
      hasNoFlat: true,
      hasSystematic: true,
      hasNoHaphazard: true,
      hasTested: true,
      hasNoUntested: true,
      hasTypeSafe: true,
      hasNoUnsafe: true,
      chaoticCount: 0,
      untestedCount: 0,
    },
    knowing: {
      wisdom: 80,
      vein: 'rich-seam',
      hasHighWisdom: true,
      hasDocumented: true,
      hasWellCommented: true,
      hasNoUndocumented: true,
      hasPrincipled: true,
      hasNoAdHoc: true,
      hasPatterned: true,
      hasNoReinvented: true,
      hasProven: true,
      hasNoExperimental: true,
      hasMature: true,
      hasNoNaive: true,
      hasEstablished: true,
      hasBattleTested: true,
      undocumentedCount: 0,
      adHocCount: 0,
    },
    condition: 'clear-gem',
    qualityScore: 80,
  }
  return { ...base, ...overrides }
}

function makeStats(overrides: Partial<QuartzHorizonResult['stats']> = {}): QuartzHorizonResult['stats'] {
  return {
    totalFiles: 1,
    totalVeins: 1,
    avgCrystallineClarity: 80,
    avgVibrationQuality: 80,
    avgResonancePurity: 80,
    avgStructureStrength: 80,
    avgVeinWisdom: 80,
    masterCrystalCount: 0,
    clearGemCount: 1,
    properQuartzCount: 0,
    milkyStoneCount: 0,
    roughRockCount: 0,
    sandCount: 0,
    hasHighClarityCount: 1,
    hasHighVibrationCount: 1,
    hasHighPurityCount: 1,
    hasHighStrengthCount: 1,
    hasHighWisdomCount: 1,
    overallPurity: 80,
    geologistGrade: 'crystal-expert',
    bestCrystal: 'test.ts',
    clearest: 'test.ts',
    mostVibrant: 'test.ts',
    purestSignal: 'test.ts',
    wisest: 'test.ts',
    ...overrides,
  }
}

// ─── measureClarifying ────────────────────────────────────────────

describe('measureClarifying', () => {
  it('returns a valid ClarifyingMeasure', () => {
    const m = measureClarifying(RichContent)
    expect(m).toHaveProperty('clarity')
    expect(m).toHaveProperty('crystal')
    expect(m).toHaveProperty('hasHighClarity')
    expect(m).toHaveProperty('crypticCount')
    expect(m).toHaveProperty('obfuscatedCount')
  })

  it('scores rich content higher than minimal', () => {
    const rich = measureClarifying(RichContent)
    const minimal = measureClarifying(MinimalContent)
    expect(rich.clarity).toBeGreaterThan(minimal.clarity)
  })

  it('penalizes toxic content', () => {
    const m = measureClarifying(ToxicContent)
    expect(m.clarity).toBeLessThan(20)
  })

  it('scores empty content as 0', () => {
    const m = measureClarifying(EmptyContent)
    expect(m.clarity).toBe(0)
  })

  it('detects eval as cryptic', () => {
    const m = measureClarifying('eval("x")')
    expect(m.hasNoCryptic).toBe(false)
    expect(m.crypticCount).toBeGreaterThanOrEqual(1)
  })

  it('detects var as obfuscated', () => {
    const m = measureClarifying('var x = 1')
    expect(m.hasNoObfuscated).toBe(false)
    expect(m.obfuscatedCount).toBeGreaterThanOrEqual(1)
  })

  it('classifies high clarity as true when >= 80', () => {
    const m = measureClarifying(RichContent)
    expect(typeof m.hasHighClarity).toBe('boolean')
  })

  it('detects exports as visible', () => {
    const m = measureClarifying('export function Foo(): Void {}')
    expect(m.hasVisible).toBe(true)
  })

  it('has clear return from capital-letter type', () => {
    const m = measureClarifying('function add(a: Number, b: Number): Number { return a }')
    expect(m.hasClear).toBe(true)
  })

  it('counts cryptic from eval and any', () => {
    const m = measureClarifying('var x: any = eval("1")')
    expect(m.crypticCount).toBeGreaterThanOrEqual(2)
  })
})

// ─── measureResonating ────────────────────────────────────────────

describe('measureResonating', () => {
  it('returns a valid ResonatingMeasure', () => {
    const m = measureResonating(RichContent)
    expect(m).toHaveProperty('vibration')
    expect(m).toHaveProperty('frequency')
    expect(m).toHaveProperty('sluggishCount')
    expect(m).toHaveProperty('wastefulCount')
  })

  it('penalizes eval as sluggish', () => {
    const m = measureResonating('eval("x")')
    expect(m.sluggishCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoSluggish).toBe(false)
  })

  it('penalizes console as wasteful', () => {
    const m = measureResonating('console.log("x")')
    expect(m.wastefulCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoWasteful).toBe(false)
  })

  it('detects async+await as responsive', () => {
    const m = measureResonating('async function go() { await fetch("/") }')
    expect(m.hasResponsive).toBe(true)
  })

  it('detects pipeline as efficient', () => {
    const m = measureResonating('const x = [1].map(n => n).filter(Boolean)')
    expect(m.hasEfficient).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureResonating(EmptyContent)
    expect(m.vibration).toBe(0)
  })

  it('detects generics + pipeline as optimized', () => {
    const m = measureResonating('const x: Array<number> = [1].map(n => n)')
    expect(m.hasOptimized).toBe(true)
  })

  it('detects debugger as sluggish', () => {
    const m = measureResonating('debugger')
    expect(m.sluggishCount).toBeGreaterThanOrEqual(1)
  })
})

// ─── measureSignaling ─────────────────────────────────────────────

describe('measureSignaling', () => {
  it('returns a valid SignalingMeasure', () => {
    const m = measureSignaling(RichContent)
    expect(m).toHaveProperty('purity')
    expect(m).toHaveProperty('signal')
    expect(m).toHaveProperty('misnamedCount')
    expect(m).toHaveProperty('ambiguousCount')
  })

  it('penalizes var as misnamed', () => {
    const m = measureSignaling('var x = 1')
    expect(m.misnamedCount).toBeGreaterThanOrEqual(1)
    expect(m.hasNoMisnamed).toBe(false)
  })

  it('penalizes eval and any as ambiguous', () => {
    const m = measureSignaling('const x: any = eval("1")')
    expect(m.ambiguousCount).toBeGreaterThanOrEqual(2)
  })

  it('detects named export + const as well named', () => {
    const m = measureSignaling('export const X = 1')
    expect(m.hasWellNamed).toBe(true)
  })

  it('detects return type + doc as expressive', () => {
    const m = measureSignaling('/** docs */\nfunction foo(): Void {}')
    expect(m.hasExpressive).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureSignaling(EmptyContent)
    expect(m.purity).toBe(0)
  })

  it('detects export as no silent', () => {
    const m = measureSignaling('export function Foo(): Void {}')
    expect(m.hasNoSilent).toBe(true)
  })
})

// ─── measureStructuring ───────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns a valid StructuringMeasure', () => {
    const m = measureStructuring(RichContent)
    expect(m).toHaveProperty('strength')
    expect(m).toHaveProperty('lattice')
    expect(m).toHaveProperty('chaoticCount')
    expect(m).toHaveProperty('untestedCount')
  })

  it('penalizes var and eval as chaotic', () => {
    const m = measureStructuring('var x = eval("1")')
    expect(m.chaoticCount).toBeGreaterThanOrEqual(2)
  })

  it('penalizes var as untested', () => {
    const m = measureStructuring('var x = 1')
    expect(m.untestedCount).toBeGreaterThanOrEqual(1)
  })

  it('detects extends or implements as layered', () => {
    const m = measureStructuring('class Foo extends Bar implements Baz {}')
    expect(m.hasLayered).toBe(true)
  })

  it('detects try as tested', () => {
    const m = measureStructuring('try { const x = 1 } catch { }')
    expect(m.hasTested).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureStructuring(EmptyContent)
    expect(m.strength).toBe(0)
  })

  it('detects interface + export as well structured', () => {
    const m = measureStructuring('export interface Foo { x: Number }')
    expect(m.hasWellStructured).toBe(true)
  })
})

// ─── measureKnowing ───────────────────────────────────────────────

describe('measureKnowing', () => {
  it('returns a valid KnowingMeasure', () => {
    const m = measureKnowing(RichContent)
    expect(m).toHaveProperty('wisdom')
    expect(m).toHaveProperty('vein')
    expect(m).toHaveProperty('undocumentedCount')
    expect(m).toHaveProperty('adHocCount')
  })

  it('detects doc comments as documented', () => {
    const m = measureKnowing('/** docs */')
    expect(m.hasDocumented).toBe(true)
  })

  it('penalizes var as undocumented', () => {
    const m = measureKnowing('var x = 1')
    expect(m.undocumentedCount).toBeGreaterThanOrEqual(1)
  })

  it('penalizes eval and any as ad-hoc', () => {
    const m = measureKnowing('const x: any = eval("1")')
    expect(m.adHocCount).toBeGreaterThanOrEqual(2)
  })

  it('detects abstract or extends as principled', () => {
    const m = measureKnowing('abstract class Foo extends Bar {}')
    expect(m.hasPrincipled).toBe(true)
  })

  it('scores empty as 0', () => {
    const m = measureKnowing(EmptyContent)
    expect(m.wisdom).toBe(0)
  })

  it('detects extends + implements as established', () => {
    const m = measureKnowing('class Foo extends Bar implements Baz {}')
    expect(m.hasEstablished).toBe(true)
  })

  it('detects try + export as battle tested', () => {
    const m = measureKnowing('export function foo() { try {} catch {} }')
    expect(m.hasBattleTested).toBe(true)
  })
})

// ─── Classification Functions ─────────────────────────────────────

describe('classifyCrystalCondition', () => {
  it('classifies 90+ as master-crystal', () => {
    expect(classifyCrystalCondition(90)).toBe('master-crystal')
    expect(classifyCrystalCondition(100)).toBe('master-crystal')
  })

  it('classifies 75-89 as clear-gem', () => {
    expect(classifyCrystalCondition(75)).toBe('clear-gem')
    expect(classifyCrystalCondition(89)).toBe('clear-gem')
  })

  it('classifies 60-74 as proper-quartz', () => {
    expect(classifyCrystalCondition(60)).toBe('proper-quartz')
  })

  it('classifies 40-59 as milky-stone', () => {
    expect(classifyCrystalCondition(40)).toBe('milky-stone')
  })

  it('classifies 20-39 as rough-rock', () => {
    expect(classifyCrystalCondition(20)).toBe('rough-rock')
  })

  it('classifies 0-19 as sand', () => {
    expect(classifyCrystalCondition(0)).toBe('sand')
    expect(classifyCrystalCondition(19)).toBe('sand')
  })
})

describe('classifyVeinType', () => {
  it('returns no-vein for empty array', () => {
    expect(classifyVeinType([])).toBe('no-vein')
  })

  it('returns mother-lode for high avg and ratio', () => {
    const crystals = [makeCrystal({ condition: 'master-crystal', qualityScore: 90 }), makeCrystal({ condition: 'master-crystal', qualityScore: 90 })]
    expect(classifyVeinType(crystals)).toBe('mother-lode')
  })

  it('returns rich-vein for medium-high avg and ratio', () => {
    const crystals = [makeCrystal({ condition: 'master-crystal', qualityScore: 75 }), makeCrystal({ condition: 'clear-gem', qualityScore: 75 }), makeCrystal({ condition: 'clear-gem', qualityScore: 75 })]
    const result = classifyVeinType(crystals)
    expect(['rich-vein', 'proper-seam']).toContain(result)
  })

  it('returns no-vein for very low scores', () => {
    const crystals = [makeCrystal({ condition: 'sand', qualityScore: 5 }), makeCrystal({ condition: 'sand', qualityScore: 5 })]
    expect(classifyVeinType(crystals)).toBe('no-vein')
  })
})

describe('classifyVeinCondition', () => {
  it('classifies 85+ as crystal-cathedral', () => {
    expect(classifyVeinCondition(85)).toBe('crystal-cathedral')
    expect(classifyVeinCondition(100)).toBe('crystal-cathedral')
  })

  it('classifies 70-84 as gem-gallery', () => {
    expect(classifyVeinCondition(70)).toBe('gem-gallery')
  })

  it('classifies 55-69 as proper-mine', () => {
    expect(classifyVeinCondition(55)).toBe('proper-mine')
  })

  it('classifies 35-54 as rough-tunnel', () => {
    expect(classifyVeinCondition(35)).toBe('rough-tunnel')
  })

  it('classifies 15-34 as collapsed-shaft', () => {
    expect(classifyVeinCondition(15)).toBe('collapsed-shaft')
  })

  it('classifies 0-14 as void', () => {
    expect(classifyVeinCondition(0)).toBe('void')
  })
})

describe('classifyGeologistGrade', () => {
  it('classifies 85+ as master-geologist', () => {
    expect(classifyGeologistGrade(85)).toBe('master-geologist')
    expect(classifyGeologistGrade(100)).toBe('master-geologist')
  })

  it('classifies 70-84 as crystal-expert', () => {
    expect(classifyGeologistGrade(70)).toBe('crystal-expert')
  })

  it('classifies 55-69 as skilled-miner', () => {
    expect(classifyGeologistGrade(55)).toBe('skilled-miner')
  })

  it('classifies 40-54 as apprentice', () => {
    expect(classifyGeologistGrade(40)).toBe('apprentice')
  })

  it('classifies 20-39 as novice', () => {
    expect(classifyGeologistGrade(20)).toBe('novice')
  })

  it('classifies 0-19 as rock-collector', () => {
    expect(classifyGeologistGrade(0)).toBe('rock-collector')
  })
})

// ─── analyzeQuartzCrystal ─────────────────────────────────────────

describe('analyzeQuartzCrystal', () => {
  it('returns a full QuartzCrystal', () => {
    const c = analyzeQuartzCrystal(RichContent, 'rich.ts')
    expect(c.file).toBe('rich.ts')
    expect(c.crystallineClarity).toBeGreaterThan(0)
    expect(c.vibrationQuality).toBeGreaterThanOrEqual(0)
    expect(c.resonancePurity).toBeGreaterThan(0)
    expect(c.structureStrength).toBeGreaterThan(0)
    expect(c.veinWisdom).toBeGreaterThan(0)
    expect(c.qualityScore).toBeGreaterThan(0)
    expect(c.condition).toBeTruthy()
  })

  it('computes qualityScore as weighted average of 5 measures', () => {
    const c = analyzeQuartzCrystal(RichContent, 'test.ts')
    const expected = Math.round(
      c.crystallineClarity * 0.2 +
      c.vibrationQuality * 0.2 +
      c.resonancePurity * 0.2 +
      c.structureStrength * 0.2 +
      c.veinWisdom * 0.2,
    )
    expect(c.qualityScore).toBe(expected)
  })

  it('assigns condition based on qualityScore', () => {
    const c = analyzeQuartzCrystal(EmptyContent, 'empty.ts')
    expect(c.condition).toBe('sand')
  })

  it('handles toxic content gracefully', () => {
    const c = analyzeQuartzCrystal(ToxicContent, 'bad.ts')
    expect(c.qualityScore).toBeLessThan(30)
  })
})

// ─── analyzeQuartzVein ────────────────────────────────────────────

describe('analyzeQuartzVein', () => {
  it('returns empty vein for no crystals', () => {
    const v = analyzeQuartzVein([], 'empty-dir')
    expect(v.directory).toBe('empty-dir')
    expect(v.crystals).toHaveLength(0)
    expect(v.avgClarity).toBe(0)
    expect(v.veinType).toBe('no-vein')
    expect(v.condition).toBe('void')
  })

  it('aggregates crystal data correctly', () => {
    const crystals = [
      makeCrystal({ crystallineClarity: 80, structureStrength: 70, veinWisdom: 60, condition: 'clear-gem' }),
      makeCrystal({ crystallineClarity: 60, structureStrength: 50, veinWisdom: 40, condition: 'proper-quartz' }),
    ]
    const v = analyzeQuartzVein(crystals, 'src')
    expect(v.avgClarity).toBe(70)
    expect(v.avgStrength).toBe(60)
    expect(v.avgWisdom).toBe(50)
  })

  it('counts master crystals and sand', () => {
    const crystals = [
      makeCrystal({ condition: 'master-crystal' }),
      makeCrystal({ condition: 'sand' }),
      makeCrystal({ condition: 'clear-gem' }),
    ]
    const v = analyzeQuartzVein(crystals, 'src')
    expect(v.masterCrystalCount).toBe(1)
    expect(v.sandCount).toBe(1)
  })
})

// ─── generateRecommendations ──────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns perfection message for high purity with no sand', () => {
    const crystals = [makeCrystal()]
    const veins: QuartzVein[] = []
    const geology = { avgClarity: 90, avgStrength: 90, avgWisdom: 90, isCrystalline: true, overallPurity: 90 }
    const stats = makeStats({ overallPurity: 90, sandCount: 0 })
    const recs = generateRecommendations(crystals, veins, geology, stats)
    expect(recs).toHaveLength(1)
    expect(recs[0]).toContain('perfection')
  })

  it('recommends improving clarity when low', () => {
    const stats = makeStats({ avgCrystallineClarity: 40, overallPurity: 40 })
    const geology = { avgClarity: 40, avgStrength: 80, avgWisdom: 80, isCrystalline: false, overallPurity: 40 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('clarity'))).toBe(true)
  })

  it('recommends improving vibration when low', () => {
    const stats = makeStats({ avgVibrationQuality: 30, overallPurity: 30 })
    const geology = { avgClarity: 80, avgStrength: 80, avgWisdom: 80, isCrystalline: false, overallPurity: 30 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('vibration'))).toBe(true)
  })

  it('recommends improving resonance when low', () => {
    const stats = makeStats({ avgResonancePurity: 30, overallPurity: 30 })
    const geology = { avgClarity: 80, avgStrength: 80, avgWisdom: 80, isCrystalline: false, overallPurity: 30 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('resonance'))).toBe(true)
  })

  it('recommends improving structure when low', () => {
    const stats = makeStats({ avgStructureStrength: 30, overallPurity: 30 })
    const geology = { avgClarity: 80, avgStrength: 30, avgWisdom: 80, isCrystalline: false, overallPurity: 30 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('structure') || r.includes('crystal'))).toBe(true)
  })

  it('recommends improving wisdom when low', () => {
    const stats = makeStats({ avgVeinWisdom: 30, overallPurity: 30 })
    const geology = { avgClarity: 80, avgStrength: 80, avgWisdom: 30, isCrystalline: false, overallPurity: 30 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('wisdom') || r.includes('vein'))).toBe(true)
  })

  it('mentions sand files when present', () => {
    const crystals = [makeCrystal({ condition: 'sand', file: 'bad.ts' })]
    const stats = makeStats({ sandCount: 1, overallPurity: 30 })
    const geology = { avgClarity: 40, avgStrength: 40, avgWisdom: 40, isCrystalline: false, overallPurity: 30 }
    const recs = generateRecommendations(crystals, [], geology, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })

  it('reports many sand files as count', () => {
    const crystals = Array.from({ length: 5 }, (_, i) => makeCrystal({ condition: 'sand', file: `bad${i}.ts` }))
    const stats = makeStats({ sandCount: 5, overallPurity: 10 })
    const geology = { avgClarity: 10, avgStrength: 10, avgWisdom: 10, isCrystalline: false, overallPurity: 10 }
    const recs = generateRecommendations(crystals, [], geology, stats)
    expect(recs.some(r => r.includes('5 sand'))).toBe(true)
  })

  it('mentions rough/collapsed veins', () => {
    const vein: QuartzVein = {
      directory: 'src',
      crystals: [],
      avgClarity: 30,
      avgStrength: 30,
      avgWisdom: 30,
      masterCrystalCount: 0,
      sandCount: 0,
      veinType: 'small-pocket',
      condition: 'rough-tunnel',
    }
    const stats = makeStats({ overallPurity: 50 })
    const geology = { avgClarity: 50, avgStrength: 50, avgWisdom: 50, isCrystalline: false, overallPurity: 50 }
    const recs = generateRecommendations([], [vein, vein], geology, stats)
    expect(recs.some(r => r.includes('vein'))).toBe(true)
  })

  it('returns steady message when all is good', () => {
    const stats = makeStats({ overallPurity: 80, sandCount: 0, avgCrystallineClarity: 80, avgVibrationQuality: 80, avgResonancePurity: 80, avgStructureStrength: 80, avgVeinWisdom: 80 })
    const geology = { avgClarity: 80, avgStrength: 80, avgWisdom: 80, isCrystalline: true, overallPurity: 80 }
    const recs = generateRecommendations([], [], geology, stats)
    expect(recs.some(r => r.includes('steady') || r.includes('maintain'))).toBe(true)
  })
})

// ─── buildQuartzHorizonResult ─────────────────────────────────────

describe('buildQuartzHorizonResult', () => {
  it('returns a complete result', async () => {
    const result = await buildQuartzHorizonResult(['a.ts', 'b.ts'], [RichContent, MinimalContent])
    expect(result.crystals).toHaveLength(2)
    expect(result.veins.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFiles).toBe(2)
    expect(result.geology.overallPurity).toBeGreaterThanOrEqual(0)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty input', async () => {
    const result = await buildQuartzHorizonResult([], [])
    expect(result.crystals).toHaveLength(0)
    expect(result.veins).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallPurity).toBe(0)
  })

  it('computes overallPurity as avg of clarity, strength, wisdom', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [RichContent])
    const expected = Math.round(
      (result.stats.avgCrystallineClarity + result.stats.avgStructureStrength + result.stats.avgVeinWisdom) / 3,
    )
    expect(result.stats.overallPurity).toBe(expected)
  })

  it('sets isCrystalline when overallPurity >= 80', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [RichContent])
    expect(typeof result.geology.isCrystalline).toBe('boolean')
    if (result.geology.overallPurity >= 80) {
      expect(result.geology.isCrystalline).toBe(true)
    }
  })

  it('finds best crystal correctly', async () => {
    const result = await buildQuartzHorizonResult(['good.ts', 'bad.ts'], [RichContent, EmptyContent])
    expect(result.stats.bestCrystal).toBe('good.ts')
  })

  it('groups files into veins by directory', async () => {
    const result = await buildQuartzHorizonResult(['src/a.ts', 'src/b.ts', 'lib/c.ts'], [RichContent, RichContent, MinimalContent])
    expect(result.veins.length).toBe(2)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string for any score', () => {
    expect(typeof colorScore(85)).toBe('string')
    expect(typeof colorScore(50)).toBe('string')
    expect(typeof colorScore(10)).toBe('string')
    expect(typeof colorScore(0)).toBe('string')
  })
})

describe('colorGrade', () => {
  it('returns a string for master grades', () => {
    expect(typeof colorGrade('master-crystal')).toBe('string')
    expect(typeof colorGrade('flawless-quartz')).toBe('string')
    expect(typeof colorGrade('perfect-oscillator')).toBe('string')
  })

  it('returns a string for lower grades', () => {
    expect(typeof colorGrade('sand')).toBe('string')
    expect(typeof colorGrade('no-clarity')).toBe('string')
  })
})

describe('formatCrystalTable', () => {
  it('formats a crystal with all fields', () => {
    const c = makeCrystal()
    const out = formatCrystalTable(c)
    expect(out).toContain('test.ts')
    expect(out).toContain('80')
    expect(out).toContain('clear-crystal')
  })
})

describe('formatCrystalsTable', () => {
  it('returns message for empty array', () => {
    expect(formatCrystalsTable([])).toContain('No quartz crystals')
  })

  it('formats multiple crystals', () => {
    const crystals = [makeCrystal(), makeCrystal({ file: 'other.ts' })]
    const out = formatCrystalsTable(crystals)
    expect(out).toContain('test.ts')
    expect(out).toContain('other.ts')
  })
})

describe('formatVeinTable', () => {
  it('formats a vein', () => {
    const v: QuartzVein = {
      directory: 'src',
      crystals: [makeCrystal()],
      avgClarity: 80,
      avgStrength: 70,
      avgWisdom: 60,
      masterCrystalCount: 1,
      sandCount: 0,
      veinType: 'rich-vein',
      condition: 'gem-gallery',
    }
    const out = formatVeinTable(v)
    expect(out).toContain('src')
    expect(out).toContain('80')
  })
})

describe('formatVeinsTable', () => {
  it('returns message for empty array', () => {
    expect(formatVeinsTable([])).toContain('No quartz veins')
  })
})

describe('formatStatsTable', () => {
  it('formats stats with all fields', () => {
    const stats = makeStats()
    const out = formatStatsTable(stats)
    expect(out).toContain('Quartz Horizon Statistics')
    expect(out).toContain('Total Files')
    expect(out).toContain('test.ts')
  })
})

describe('formatRecommendations', () => {
  it('returns no recommendations message for empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })

  it('formats recommendations as bullet list', () => {
    const out = formatRecommendations(['Fix clarity', 'Add docs'])
    expect(out).toContain('Fix clarity')
    expect(out).toContain('Add docs')
  })
})

describe('formatResultTable', () => {
  it('formats full result with all sections', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [RichContent])
    const out = formatResultTable(result)
    expect(out).toContain('Quartz Crystal Analysis')
    expect(out).toContain('Quartz Veins')
    expect(out).toContain('Quartz Horizon Statistics')
    expect(out).toContain('Geology')
    expect(out).toContain('Recommendations')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON string', async () => {
    const result = await buildQuartzHorizonResult(['a.ts'], [RichContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.crystals).toHaveLength(1)
    expect(parsed.stats).toBeTruthy()
    expect(parsed.geology).toBeTruthy()
    expect(parsed.recommendations).toBeTruthy()
  })
})
