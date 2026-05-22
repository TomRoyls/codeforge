import { describe, expect, it } from 'vitest'

import {
  measureStrength,
  measureWeave,
  measureIntegrity,
  measureLuster,
  measureFlow,
  measureTensile,
  classifyCondition,
  classifyPatternType,
  classifyWeaverGrade,
  analyzeThreadSample,
  analyzeWeavePattern,
  buildSilverThreadResult,
  generateRecommendations,
} from '../src/commands/silver-thread-helpers.js'

import {
  scoreColor,
  conditionColor,
  gradeColor,
  strengthGradeColor,
  weavePatternColor,
  integrityStateColor,
  lusterShineColor,
  flowStateColor,
  tensileGradeColor,
  patternTypeColor,
  patternConditionColor,
  formatSilverThreadJson,
  formatSilverThreadTable,
} from '../src/commands/silver-thread-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const RICH = `
export interface Foo { x: number }
export type Bar = Foo | null
export class Baz implements Foo {
  private x: number = 0
  constructor(x: number) { this.x = x }
  /** Docs */
  async getValue(): Promise<number> {
    try { return this.x } catch { return 0 }
  }
}
export function add<T>(a: T, b: T): T { return a }
export const mul = (a: number, b: number) => a * b
export enum Color { Red, Green, Blue }
export { Foo } from "./foo"
// TODO: fix later
`

const EMPTY = ''

const MEDIUM = 'const x = 1\n'

// ─── measureStrength ───────────────────────────────────────────────────────

describe('measureStrength', () => {
  it('returns 42 for empty content', () => {
    expect(measureStrength(EMPTY).level).toBe(42)
  })

  it('returns steel-thread for rich content', () => {
    const r = measureStrength(RICH)
    expect(r.level).toBe(79)
    expect(r.grade).toBe('steel-thread')
  })

  it('returns spider-silk for medium content', () => {
    const r = measureStrength(MEDIUM)
    expect(r.level).toBe(47)
    expect(r.grade).toBe('spider-silk')
  })

  it('returns tungsten-grade for high level with all conditions', () => {
    const content = 'export interface I { x: number }\nexport type T = I\nexport class C {}\nexport async function fn(): Promise<void> { await fetch() }\n<T>(a: T): T => a\nx?: number\ntry { fn() } catch(e) { handle(e) }\n/** doc */\n'
    const r = measureStrength(content)
    expect(r.grade).toBe('tungsten-grade')
  })

  it('returns broken-filament for content with enough negatives', () => {
    const content = ': any\n: any\nHACK: bad\n?1:2?3:4\ncatch(e) {}\n'
    const r = measureStrength(content)
    expect(r.grade).toBe('broken-filament')
  })

  it('clamps level to max 100', () => {
    const massive = Array(200).fill('export class Cls { private x: number = 1 }\n').join('')
    const r = measureStrength(massive)
    expect(r.level).toBeLessThanOrEqual(100)
  })

  it('populates boolean flags', () => {
    const r = measureStrength(RICH)
    expect(typeof r.hasStrongBond).toBe('boolean')
    expect(typeof r.hasNoWeakLinks).toBe('boolean')
    expect(typeof r.hasProperTension).toBe('boolean')
    expect(typeof r.hasNoFraying).toBe('boolean')
    expect(typeof r.hasResilient).toBe('boolean')
  })

  it('populates weakLinkCount and frayingCount', () => {
    const r = measureStrength(RICH)
    expect(typeof r.weakLinkCount).toBe('number')
    expect(typeof r.frayingCount).toBe('number')
  })
})

// ─── measureWeave ──────────────────────────────────────────────────────────

describe('measureWeave', () => {
  it('returns 50 for empty content', () => {
    expect(measureWeave(EMPTY).quality).toBe(50)
  })

  it('returns brocade for rich content', () => {
    const r = measureWeave(RICH)
    expect(r.quality).toBe(78)
    expect(r.pattern).toBe('brocade')
  })

  it('returns burlap for medium content', () => {
    const r = measureWeave(MEDIUM)
    expect(r.quality).toBe(55)
    expect(r.pattern).toBe('burlap')
  })

  it('returns tapestry for high quality with all conditions', () => {
    const content = 'import { x } from "y"\nexport interface I {}\nexport class C {}\nfunction fn() {}\n/** doc */\n'
    const r = measureWeave(content)
    expect(r.pattern).toBe('tapestry')
  })

  it('returns unraveling for very low quality', () => {
    const content = ': any\n: any\nHACK: bad\n?1:2?3:4\nTODO: fix\n'
    const r = measureWeave(content)
    expect(r.pattern).toBe('unraveling')
  })

  it('clamps quality to max 100', () => {
    const massive = Array(200).fill('import { x } from "y"\nexport interface I { a: number }\n/** doc */\n').join('')
    const r = measureWeave(massive)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('populates gapCount and snagCount', () => {
    const r = measureWeave(RICH)
    expect(typeof r.gapCount).toBe('number')
    expect(typeof r.snagCount).toBe('number')
  })
})

// ─── measureIntegrity ──────────────────────────────────────────────────────

describe('measureIntegrity', () => {
  it('returns 42 for empty content', () => {
    expect(measureIntegrity(EMPTY).level).toBe(42)
  })

  it('returns pristine for rich content', () => {
    const r = measureIntegrity(RICH)
    expect(r.level).toBe(79)
    expect(r.state).toBe('pristine')
  })

  it('returns tattered for medium content', () => {
    const r = measureIntegrity(MEDIUM)
    expect(r.level).toBe(47)
    expect(r.state).toBe('tattered')
  })

  it('returns dissolved for very low quality', () => {
    const content = ': any\n: any\nHACK: bad\n?1:2?3:4\nTODO: fix\n'
    const r = measureIntegrity(content)
    expect(r.state).toBe('dissolved')
  })

  it('clamps level to max 100', () => {
    const massive = Array(200).fill('export interface I { x: number }\nexport type T = I\nexport class C {}\n/** doc */\n').join('')
    const r = measureIntegrity(massive)
    expect(r.level).toBeLessThanOrEqual(100)
  })

  it('populates contradictionCount and inconsistencyCount', () => {
    const r = measureIntegrity(RICH)
    expect(typeof r.contradictionCount).toBe('number')
    expect(typeof r.inconsistencyCount).toBe('number')
  })
})

// ─── measureLuster ─────────────────────────────────────────────────────────

describe('measureLuster', () => {
  it('returns 63 for empty content', () => {
    expect(measureLuster(EMPTY).level).toBe(63)
  })

  it('returns mirror-finish for rich content', () => {
    const r = measureLuster(RICH)
    expect(r.level).toBe(90)
    expect(r.shine).toBe('mirror-finish')
  })

  it('returns tarnished for medium content', () => {
    const r = measureLuster(MEDIUM)
    expect(r.level).toBe(68)
    expect(r.shine).toBe('tarnished')
  })

  it('returns corroded for very low quality', () => {
    const content = 'console.log(x)\n: any\n: any\nHACK: bad\n@deprecated\nTODO: fix\n'
    const r = measureLuster(content)
    expect(r.shine).toBe('corroded')
  })

  it('clamps level to max 100', () => {
    const massive = Array(200).fill('/** doc */\nexport interface I { x: number }\nexport function fn(): void {}\n').join('')
    const r = measureLuster(massive)
    expect(r.level).toBeLessThanOrEqual(100)
  })

  it('populates tarnishCount and scratchCount', () => {
    const r = measureLuster(RICH)
    expect(typeof r.tarnishCount).toBe('number')
    expect(typeof r.scratchCount).toBe('number')
  })
})

// ─── measureFlow ───────────────────────────────────────────────────────────

describe('measureFlow', () => {
  it('returns 52 for empty content', () => {
    expect(measureFlow(EMPTY).level).toBe(52)
  })

  it('returns continuous for rich content', () => {
    const r = measureFlow(RICH)
    expect(r.level).toBe(80)
    expect(r.state).toBe('continuous')
  })

  it('returns fragmented for medium content', () => {
    const r = measureFlow(MEDIUM)
    expect(r.level).toBe(57)
    expect(r.state).toBe('fragmented')
  })

  it('returns unbroken-thread for highest quality', () => {
    const content = 'import { x } from "y"\nexport async function fn(): Promise<void> { await fetch(); return; }\nexport class C {}\ntry { fn() } catch(e) { handle(e) }\nreturn 1\n'
    const r = measureFlow(content)
    expect(r.state).toBe('unbroken-thread')
  })

  it('returns broken for very low quality', () => {
    const content = ': any\n: any\nHACK: bad\n?1:2?3:4\ncatch(e) {}\nTODO: fix\n'
    const r = measureFlow(content)
    expect(r.state).toBe('broken')
  })

  it('clamps level to max 100', () => {
    const massive = Array(200).fill('export async function fn(): Promise<void> { await fetch(); return; }\n').join('')
    const r = measureFlow(massive)
    expect(r.level).toBeLessThanOrEqual(100)
  })

  it('populates interruptionCount and knotCount', () => {
    const r = measureFlow(RICH)
    expect(typeof r.interruptionCount).toBe('number')
    expect(typeof r.knotCount).toBe('number')
  })
})

// ─── measureTensile ────────────────────────────────────────────────────────

describe('measureTensile', () => {
  it('returns 40 for empty content', () => {
    expect(measureTensile(EMPTY).quality).toBe(40)
  })

  it('returns kevlar for rich content', () => {
    const r = measureTensile(RICH)
    expect(r.quality).toBe(78)
    expect(r.grade).toBe('kevlar')
  })

  it('returns cotton for medium content', () => {
    const r = measureTensile(MEDIUM)
    expect(r.quality).toBe(45)
    expect(r.grade).toBe('cotton')
  })

  it('returns carbon-fiber for highest quality', () => {
    const content = 'export interface I { x: number }\nexport type T = I\nexport class C {}\n<T>(a: T): T => a\nx?: number\ntry { fn() } catch(e) { handle(e) }\n/** doc */\nimport { x } from "y"\n'
    const r = measureTensile(content)
    expect(r.grade).toBe('carbon-fiber')
  })

  it('returns spun-sugar for very low quality', () => {
    const content = ': any\n: any\nHACK: bad\n@deprecated\n?1:2?3:4\ncatch(e) {}\nFIXME: broken\n'
    const r = measureTensile(content)
    expect(r.grade).toBe('spun-sugar')
  })

  it('clamps quality to max 100', () => {
    const massive = Array(200).fill('export interface I { x: number }\nexport type T = I\nexport class C {}\n/** doc */\n').join('')
    const r = measureTensile(massive)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('populates fatigueCount and corrosionCount', () => {
    const r = measureTensile(RICH)
    expect(typeof r.fatigueCount).toBe('number')
    expect(typeof r.corrosionCount).toBe('number')
  })
})

// ─── classifyCondition ─────────────────────────────────────────────────────

describe('classifyCondition', () => {
  it('returns masterpiece-thread for qualityScore >= 80', () => {
    const sp = analyzeThreadSample(RICH, 'rich.ts')
    expect(classifyCondition(sp)).toBe('masterpiece-thread')
  })

  it('returns noble-cord for qualityScore in 65-79', () => {
    const sp = { ...analyzeThreadSample(MEDIUM, 'm.ts'), qualityScore: 70 } as any
    expect(classifyCondition(sp)).toBe('noble-cord')
  })

  it('returns reliable-yarn for qualityScore in 50-64', () => {
    const sp = { ...analyzeThreadSample(MEDIUM, 'm.ts'), qualityScore: 55 } as any
    expect(classifyCondition(sp)).toBe('reliable-yarn')
  })

  it('returns worn-thread for qualityScore in 35-49', () => {
    const sp = analyzeThreadSample(EMPTY, 'e.ts')
    expect(classifyCondition(sp)).toBe('worn-thread')
  })

  it('returns frayed-end for qualityScore in 20-34', () => {
    const sp = { ...analyzeThreadSample(EMPTY, 'e.ts'), qualityScore: 25 } as any
    expect(classifyCondition(sp)).toBe('frayed-end')
  })

  it('returns dust for qualityScore below 20', () => {
    const sp = { ...analyzeThreadSample(EMPTY, 'e.ts'), qualityScore: 10 } as any
    expect(classifyCondition(sp)).toBe('dust')
  })
})

// ─── classifyPatternType ───────────────────────────────────────────────────

describe('classifyPatternType', () => {
  it('returns threads for empty samples', () => {
    expect(classifyPatternType([])).toBe('threads')
  })

  it('returns masterwork-tapestry for high average with masterpieces', () => {
    const specimens = Array(3).fill(null).map(() => analyzeThreadSample(RICH, 'r.ts'))
    expect(classifyPatternType(specimens)).toBe('masterwork-tapestry')
  })

  it('returns fine-fabric for score in 60-74', () => {
    const specimens = [analyzeThreadSample(RICH, 'r.ts'), analyzeThreadSample(MEDIUM, 'm.ts')]
    expect(classifyPatternType(specimens)).toBe('fine-fabric')
  })

  it('returns sturdy-cloth for score in 45-59', () => {
    const specimens = [analyzeThreadSample(MEDIUM, 'm.ts')]
    expect(classifyPatternType(specimens)).toBe('sturdy-cloth')
  })

  it('returns patchwork for score in 30-44', () => {
    const sp = { ...analyzeThreadSample(EMPTY, 'e.ts'), qualityScore: 35 } as any
    expect(classifyPatternType([sp])).toBe('patchwork')
  })
})

// ─── classifyWeaverGrade ───────────────────────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for score >= 80', () => {
    expect(classifyWeaverGrade(80)).toBe('master-weaver')
    expect(classifyWeaverGrade(100)).toBe('master-weaver')
  })

  it('returns artisan for score in 65-79', () => {
    expect(classifyWeaverGrade(65)).toBe('artisan')
    expect(classifyWeaverGrade(79)).toBe('artisan')
  })

  it('returns journeyman for score in 50-64', () => {
    expect(classifyWeaverGrade(50)).toBe('journeyman')
    expect(classifyWeaverGrade(64)).toBe('journeyman')
  })

  it('returns apprentice for score in 35-49', () => {
    expect(classifyWeaverGrade(35)).toBe('apprentice')
    expect(classifyWeaverGrade(49)).toBe('apprentice')
  })

  it('returns novice for score in 20-34', () => {
    expect(classifyWeaverGrade(20)).toBe('novice')
    expect(classifyWeaverGrade(34)).toBe('novice')
  })

  it('returns clumsy for score below 20', () => {
    expect(classifyWeaverGrade(0)).toBe('clumsy')
    expect(classifyWeaverGrade(19)).toBe('clumsy')
  })
})

// ─── analyzeThreadSample ───────────────────────────────────────────────────

describe('analyzeThreadSample', () => {
  it('analyzes rich content correctly', () => {
    const sp = analyzeThreadSample(RICH, 'rich.ts')
    expect(sp.threadStrength).toBe(79)
    expect(sp.weaveQuality).toBe(78)
    expect(sp.patternIntegrity).toBe(79)
    expect(sp.metallicLuster).toBe(90)
    expect(sp.continuity).toBe(80)
    expect(sp.tensileQuality).toBe(78)
    expect(sp.qualityScore).toBe(81)
    expect(sp.condition).toBe('masterpiece-thread')
    expect(sp.file).toBe('rich.ts')
  })

  it('analyzes empty content correctly', () => {
    const sp = analyzeThreadSample(EMPTY, 'empty.ts')
    expect(sp.threadStrength).toBe(42)
    expect(sp.weaveQuality).toBe(50)
    expect(sp.patternIntegrity).toBe(42)
    expect(sp.metallicLuster).toBe(63)
    expect(sp.continuity).toBe(52)
    expect(sp.tensileQuality).toBe(40)
    expect(sp.qualityScore).toBe(48)
    expect(sp.condition).toBe('worn-thread')
    expect(sp.file).toBe('empty.ts')
  })

  it('analyzes medium content correctly', () => {
    const sp = analyzeThreadSample(MEDIUM, 'medium.ts')
    expect(sp.threadStrength).toBe(47)
    expect(sp.weaveQuality).toBe(55)
    expect(sp.patternIntegrity).toBe(47)
    expect(sp.metallicLuster).toBe(68)
    expect(sp.continuity).toBe(57)
    expect(sp.tensileQuality).toBe(45)
    expect(sp.qualityScore).toBe(53)
    expect(sp.condition).toBe('reliable-yarn')
    expect(sp.file).toBe('medium.ts')
  })

  it('populates all detail objects', () => {
    const sp = analyzeThreadSample(RICH, 'rich.ts')
    expect(sp.strength.level).toBe(79)
    expect(sp.weave.quality).toBe(78)
    expect(sp.integrity.level).toBe(79)
    expect(sp.luster.level).toBe(90)
    expect(sp.flow.level).toBe(80)
    expect(sp.tensile.quality).toBe(78)
  })
})

// ─── analyzeWeavePattern ───────────────────────────────────────────────────

describe('analyzeWeavePattern', () => {
  it('returns threads for empty samples', () => {
    const z = analyzeWeavePattern([], '.')
    expect(z.patternType).toBe('threads')
    expect(z.condition).toBe('dust')
    expect(z.samples).toHaveLength(0)
  })

  it('computes averages correctly', () => {
    const specimens = [analyzeThreadSample(RICH, 'rich.ts')]
    const z = analyzeWeavePattern(specimens, 'src')
    expect(z.avgStrength).toBe(79)
    expect(z.avgWeave).toBe(78)
    expect(z.avgTensile).toBe(78)
  })

  it('counts masterpieces and dust', () => {
    const specimens = [analyzeThreadSample(RICH, 'r.ts'), analyzeThreadSample(EMPTY, 'e.ts')]
    const z = analyzeWeavePattern(specimens, '.')
    expect(z.masterpieceCount).toBe(1)
    expect(z.dustCount).toBe(0)
  })

  it('sets directory', () => {
    const z = analyzeWeavePattern([analyzeThreadSample(RICH, 'r.ts')], 'src/cmd')
    expect(z.directory).toBe('src/cmd')
  })
})

// ─── buildSilverThreadResult ───────────────────────────────────────────────

describe('buildSilverThreadResult', () => {
  it('builds result for single rich file', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgThreadStrength).toBe(79)
    expect(r.stats.avgWeaveQuality).toBe(78)
    expect(r.stats.avgPatternIntegrity).toBe(79)
    expect(r.stats.avgMetallicLuster).toBe(90)
    expect(r.stats.avgContinuity).toBe(80)
    expect(r.stats.avgTensileQuality).toBe(78)
    expect(r.stats.overallStrength).toBe(81)
    expect(r.stats.weaverGrade).toBe('master-weaver')
    expect(r.stats.masterpieceThreadCount).toBe(1)
    expect(r.samples).toHaveLength(1)
  })

  it('builds result for single empty file', () => {
    const r = buildSilverThreadResult(['empty.ts'], [EMPTY])
    expect(r.stats.totalFiles).toBe(1)
    expect(r.stats.avgThreadStrength).toBe(42)
    expect(r.stats.overallStrength).toBe(48)
    expect(r.stats.weaverGrade).toBe('apprentice')
    expect(r.stats.wornThreadCount).toBe(1)
    expect(r.loom.isStrong).toBe(false)
  })

  it('builds result for mixed files', () => {
    const r = buildSilverThreadResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.totalFiles).toBe(2)
    expect(r.stats.overallStrength).toBe(67)
    expect(r.stats.weaverGrade).toBe('artisan')
    expect(r.samples).toHaveLength(2)
    expect(r.stats.bestSample).toBe('rich.ts')
  })

  it('handles empty file list', () => {
    const r = buildSilverThreadResult([], [])
    expect(r.stats.totalFiles).toBe(0)
    expect(r.samples).toHaveLength(0)
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('computes best fields correctly', () => {
    const r = buildSilverThreadResult(['rich.ts', 'medium.ts'], [RICH, MEDIUM])
    expect(r.stats.strongest).toBe('rich.ts')
    expect(r.stats.bestWoven).toBe('rich.ts')
    expect(r.stats.mostConsistent).toBe('rich.ts')
    expect(r.stats.mostPolished).toBe('rich.ts')
    expect(r.stats.mostDurable).toBe('rich.ts')
    expect(r.stats.bestSample).toBe('rich.ts')
  })

  it('computes loom correctly', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.loom.avgStrength).toBe(79)
    expect(r.loom.avgWeave).toBe(78)
    expect(r.loom.avgTensile).toBe(78)
    expect(r.loom.isStrong).toBe(true)
    expect(r.loom.overallStrength).toBe(81)
  })

  it('counts condition categories correctly', () => {
    const r = buildSilverThreadResult(['rich.ts', 'medium.ts', 'empty.ts'], [RICH, MEDIUM, EMPTY])
    expect(r.stats.masterpieceThreadCount).toBe(1)
    expect(r.stats.reliableYarnCount).toBe(1)
    expect(r.stats.wornThreadCount).toBe(1)
  })

  it('computes hasHighStrengthCount', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighStrengthCount).toBe(1)
  })

  it('computes hasHighWeaveCount', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighWeaveCount).toBe(1)
  })

  it('computes hasHighTensileCount', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.stats.hasHighTensileCount).toBe(1)
  })

  it('includes patterns in result', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.patterns.length).toBeGreaterThan(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('generates recommendations for low health', () => {
    const r = buildSilverThreadResult([], [])
    expect(r.recommendations.length).toBeGreaterThan(0)
  })

  it('generates no recommendations for healthy codebase', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    expect(r.recommendations).toHaveLength(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns string for all ranges', () => {
    expect(typeof scoreColor(90)).toBe('string')
    expect(typeof scoreColor(65)).toBe('string')
    expect(typeof scoreColor(30)).toBe('string')
    expect(typeof scoreColor(10)).toBe('string')
  })
})

describe('conditionColor', () => {
  it('returns string for all conditions', () => {
    expect(typeof conditionColor('masterpiece-thread')).toBe('string')
    expect(typeof conditionColor('noble-cord')).toBe('string')
    expect(typeof conditionColor('reliable-yarn')).toBe('string')
    expect(typeof conditionColor('worn-thread')).toBe('string')
    expect(typeof conditionColor('frayed-end')).toBe('string')
    expect(typeof conditionColor('dust')).toBe('string')
  })
})

describe('gradeColor', () => {
  it('returns string for all grades', () => {
    expect(typeof gradeColor('master-weaver')).toBe('string')
    expect(typeof gradeColor('artisan')).toBe('string')
    expect(typeof gradeColor('journeyman')).toBe('string')
    expect(typeof gradeColor('apprentice')).toBe('string')
    expect(typeof gradeColor('novice')).toBe('string')
    expect(typeof gradeColor('clumsy')).toBe('string')
  })
})

describe('strengthGradeColor', () => {
  it('returns string for all grades', () => {
    expect(typeof strengthGradeColor('tungsten-grade')).toBe('string')
    expect(typeof strengthGradeColor('steel-thread')).toBe('string')
    expect(typeof strengthGradeColor('silver-cord')).toBe('string')
    expect(typeof strengthGradeColor('cotton-thread')).toBe('string')
    expect(typeof strengthGradeColor('spider-silk')).toBe('string')
    expect(typeof strengthGradeColor('broken-filament')).toBe('string')
  })
})

describe('weavePatternColor', () => {
  it('returns string for all patterns', () => {
    expect(typeof weavePatternColor('tapestry')).toBe('string')
    expect(typeof weavePatternColor('brocade')).toBe('string')
    expect(typeof weavePatternColor('damask')).toBe('string')
    expect(typeof weavePatternColor('plain-weave')).toBe('string')
    expect(typeof weavePatternColor('burlap')).toBe('string')
    expect(typeof weavePatternColor('unraveling')).toBe('string')
  })
})

describe('integrityStateColor', () => {
  it('returns string for all states', () => {
    expect(typeof integrityStateColor('pristine')).toBe('string')
    expect(typeof integrityStateColor('intact')).toBe('string')
    expect(typeof integrityStateColor('mostly-intact')).toBe('string')
    expect(typeof integrityStateColor('worn')).toBe('string')
    expect(typeof integrityStateColor('tattered')).toBe('string')
    expect(typeof integrityStateColor('dissolved')).toBe('string')
  })
})

describe('lusterShineColor', () => {
  it('returns string for all shines', () => {
    expect(typeof lusterShineColor('mirror-finish')).toBe('string')
    expect(typeof lusterShineColor('high-polish')).toBe('string')
    expect(typeof lusterShineColor('silver-shine')).toBe('string')
    expect(typeof lusterShineColor('matte')).toBe('string')
    expect(typeof lusterShineColor('tarnished')).toBe('string')
    expect(typeof lusterShineColor('corroded')).toBe('string')
  })
})

describe('flowStateColor', () => {
  it('returns string for all states', () => {
    expect(typeof flowStateColor('unbroken-thread')).toBe('string')
    expect(typeof flowStateColor('continuous')).toBe('string')
    expect(typeof flowStateColor('mostly-continuous')).toBe('string')
    expect(typeof flowStateColor('intermittent')).toBe('string')
    expect(typeof flowStateColor('fragmented')).toBe('string')
    expect(typeof flowStateColor('broken')).toBe('string')
  })
})

describe('tensileGradeColor', () => {
  it('returns string for all grades', () => {
    expect(typeof tensileGradeColor('carbon-fiber')).toBe('string')
    expect(typeof tensileGradeColor('kevlar')).toBe('string')
    expect(typeof tensileGradeColor('steel-cable')).toBe('string')
    expect(typeof tensileGradeColor('nylon')).toBe('string')
    expect(typeof tensileGradeColor('cotton')).toBe('string')
    expect(typeof tensileGradeColor('spun-sugar')).toBe('string')
  })
})

describe('patternTypeColor', () => {
  it('returns string for all types', () => {
    expect(typeof patternTypeColor('masterwork-tapestry')).toBe('string')
    expect(typeof patternTypeColor('fine-fabric')).toBe('string')
    expect(typeof patternTypeColor('sturdy-cloth')).toBe('string')
    expect(typeof patternTypeColor('patchwork')).toBe('string')
    expect(typeof patternTypeColor('rags')).toBe('string')
    expect(typeof patternTypeColor('threads')).toBe('string')
  })
})

describe('patternConditionColor', () => {
  it('returns string for all conditions', () => {
    expect(typeof patternConditionColor('golden-weave')).toBe('string')
    expect(typeof patternConditionColor('silver-fabric')).toBe('string')
    expect(typeof patternConditionColor('cotton-cloth')).toBe('string')
    expect(typeof patternConditionColor('burlap-sack')).toBe('string')
    expect(typeof patternConditionColor('tattered-rag')).toBe('string')
    expect(typeof patternConditionColor('dust')).toBe('string')
  })
})

// ─── JSON Formatter ────────────────────────────────────────────────────────

describe('formatSilverThreadJson', () => {
  it('returns valid JSON string', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const json = formatSilverThreadJson(r)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('contains stats field', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const parsed = JSON.parse(formatSilverThreadJson(r))
    expect(parsed.stats.totalFiles).toBe(1)
  })
})

// ─── Table Formatter ───────────────────────────────────────────────────────

describe('formatSilverThreadTable', () => {
  it('returns non-empty string', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table.length).toBeGreaterThan(0)
  })

  it('contains loom overview', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table).toContain('Overall Strength')
    expect(table).toContain('Avg Thread')
  })

  it('contains statistics section', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table).toContain('Total Files')
    expect(table).toContain('Weaver Grade')
  })

  it('shows per-file details when verbose', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, true)
    expect(table).toContain('Per-File Details')
    expect(table).toContain('rich.ts')
  })

  it('hides per-file details when not verbose', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table).not.toContain('Per-File Details')
  })

  it('shows highlights when bestSample exists', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table).toContain('Best Sample')
  })

  it('shows recommendations when present', () => {
    const r = buildSilverThreadResult(['empty.ts'], [EMPTY])
    const table = formatSilverThreadTable(r, false)
    expect(table).toContain('Recommendations')
  })

  it('hides recommendations when empty', () => {
    const r = buildSilverThreadResult(['rich.ts'], [RICH])
    const table = formatSilverThreadTable(r, false)
    expect(table).not.toContain('Recommendations')
  })
})
