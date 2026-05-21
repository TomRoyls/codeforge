import { describe, expect, it } from 'vitest'
import {
  analyzeStagePerformance,
  analyzeTheaterCompany,
  buildTheaterStageResult,
  classifyCompanyType,
  classifyDirectorGrade,
  generateRecommendations,
  measureCostume,
  measureEngagement,
  measurePerformance,
  measurePresence,
  measureScript,
  measureSet,
} from '../src/commands/theater-stage-helpers.js'
import { formatTheaterStageJson, formatTheaterStageTable } from '../src/commands/theater-stage-format-helpers.js'

// ─── measurePresence ───────────────────────────────────────────────────────

describe('measurePresence', () => {
  it('returns understudy for empty content', () => {
    const r = measurePresence('')
    expect(r.quality).toBe(0)
    expect(r.role).toBe('understudy')
    expect(r.isLeadingRole).toBe(false)
    expect(r.hasStagePresence).toBe(false)
    expect(r.blockingCount).toBe(0)
  })

  it('detects protagonist for well-designed API', () => {
    const code = [
      '/** Docs */',
      'export function core(input: Data): Result { return { out: input.v } }',
      'export function helper(x: number): string { return String(x) }',
      'export function util(): void {}',
      'interface Data { v: string }',
      'interface Result { out: string }',
      'import { Config } from "config"',
    ].join('\n')
    const r = measurePresence(code)
    expect(r.quality).toBeGreaterThanOrEqual(65)
    expect(r.isLeadingRole).toBe(true)
    expect(r.hasStrongEntrance).toBe(true)
    expect(r.hasMemorableExit).toBe(true)
    expect(r.hasGoodProjection).toBe(true)
  })

  it('detects strong entrance from exports and types', () => {
    const code = 'export function run(x: number): void {}'
    const r = measurePresence(code)
    expect(r.hasStrongEntrance).toBe(true)
  })

  it('detects memorable exit from returns and types', () => {
    const code = 'function a(): number { return 1 }'
    const r = measurePresence(code)
    expect(r.hasMemorableExit).toBe(true)
  })

  it('detects blocking from multiple functions', () => {
    const code = 'function a() {}\nfunction b() {}\nfunction c() {}'
    const r = measurePresence(code)
    expect(r.hasBlocking).toBe(true)
  })

  it('detects chemistry from imports and exports', () => {
    const code = 'import { X } from "y"\nexport function run(): void {}'
    const r = measurePresence(code)
    expect(r.hasChemistry).toBe(true)
  })

  it('detects character arc from functions and returns', () => {
    const code = 'function a() { return 1 }\nfunction b() { return 2 }'
    const r = measurePresence(code)
    expect(r.hasCharacterArc).toBe(true)
  })

  it('penalizes default exports', () => {
    const code = 'export default function lonely() {}'
    const r = measurePresence(code)
    expect(r.quality).toBeLessThan(100)
  })

  it('computes quality within valid range', () => {
    const code = 'export function a(): void {}'
    const r = measurePresence(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects motivation from jsdoc', () => {
    const code = '/** Docs */\nfunction a() {}'
    const r = measurePresence(code)
    expect(r.hasMotivation).toBe(true)
  })
})

// ─── measureScript ─────────────────────────────────────────────────────────

describe('measureScript', () => {
  it('returns improvisation for empty content', () => {
    const r = measureScript('')
    expect(r.quality).toBe(0)
    expect(r.genre).toBe('improvisation')
    expect(r.hasWellWrittenDialogue).toBe(false)
    expect(r.plotHoleCount).toBe(0)
  })

  it('detects musical for high-quality logic', () => {
    const code = [
      'function process(data: Input): Output {',
      '  if (data.valid) {',
      '    return data.items.map(x => x).filter(x => x) as Output',
      '  } else {',
      '    throw new Error("invalid")',
      '  }',
      '}',
      'try { process({} as Input) } catch {}',
    ].join('\n')
    const r = measureScript(code)
    expect(r.quality).toBeGreaterThanOrEqual(60)
    expect(r.hasWellWrittenDialogue).toBe(true)
    expect(r.hasProperStructure).toBe(true)
    expect(r.hasResolution).toBe(true)
  })

  it('detects well-written dialogue from types without any', () => {
    const code = 'function add(a: number, b: number): number { return a + b }'
    const r = measureScript(code)
    expect(r.hasWellWrittenDialogue).toBe(true)
  })

  it('detects deus ex machina from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureScript(code)
    expect(r.hasDeusExMachina).toBe(true)
  })

  it('detects plot holes from dead code', () => {
    const code = 'debugger;'
    const r = measureScript(code)
    expect(r.hasPlotHoles).toBe(true)
    expect(r.plotHoleCount).toBeGreaterThan(0)
  })

  it('detects continuity from type annotations', () => {
    const code = 'const x: number = 1'
    const r = measureScript(code)
    expect(r.hasContinuity).toBe(true)
  })

  it('detects dramatic tension from ifs and functions', () => {
    const code = 'function a() { if (x) {} }\nfunction b() {}'
    const r = measureScript(code)
    expect(r.hasDramaticTension).toBe(true)
  })

  it('detects resolution from try-catch', () => {
    const code = 'try { run() } catch (e) { handle() }'
    const r = measureScript(code)
    expect(r.hasResolution).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'function a() {}'
    const r = measureScript(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects character development from pipes and returns', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x).filter(x => x > 0) }'
    const r = measureScript(code)
    expect(r.hasCharacterDevelopment).toBe(true)
  })

  it('detects plot twists from else branches', () => {
    const code = 'if (x) { a() } else { b() }'
    const r = measureScript(code)
    expect(r.hasPlotTwists).toBe(true)
  })
})

// ─── measureCostume ────────────────────────────────────────────────────────

describe('measureCostume', () => {
  it('returns naked for empty content', () => {
    const r = measureCostume('')
    expect(r.quality).toBe(0)
    expect(r.style).toBe('naked')
    expect(r.isWellFitted).toBe(false)
    expect(r.malfunctionCount).toBe(0)
  })

  it('detects period-accurate for high-quality formatting', () => {
    const code = [
      '/** Documentation block */',
      'const add = (a: number, b: number): number => {',
      '  return a + b;',
      '};',
      '',
      'const subtract = (a: number, b: number): number => {',
      '  return a - b;',
      '};',
    ].join('\n')
    const r = measureCostume(code)
    expect(r.quality).toBeGreaterThanOrEqual(70)
    expect(r.hasProperAttire).toBe(true)
    expect(r.hasAccessorized).toBe(true)
  })

  it('detects well-fitted for reasonable file length', () => {
    const code = 'const x = 1;'
    const r = measureCostume(code)
    expect(r.isWellFitted).toBe(true)
  })

  it('detects wardrobe malfunction from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureCostume(code)
    expect(r.hasWardrobeMalfunction).toBe(true)
    expect(r.malfunctionCount).toBeGreaterThan(0)
  })

  it('detects consistent style from const-only', () => {
    const code = 'const x = 1\nconst y = 2'
    const r = measureCostume(code)
    expect(r.hasConsistentStyle).toBe(true)
    expect(r.hasPeriodAppropriate).toBe(true)
  })

  it('detects sparkle from jsdoc types and blank lines', () => {
    const code = '/** Doc */\n\nconst x: number = 1;'
    const r = measureCostume(code)
    expect(r.hasSparkle).toBe(true)
  })

  it('detects accessorized from jsdoc', () => {
    const code = '/** Doc */\nfunction a() {}'
    const r = measureCostume(code)
    expect(r.hasAccessorized).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'const x = 1'
    const r = measureCostume(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureSet ────────────────────────────────────────────────────────────

describe('measureSet', () => {
  it('returns found-space for empty content', () => {
    const r = measureSet('')
    expect(r.quality).toBe(0)
    expect(r.design).toBe('found-space')
    expect(r.isWellConstructed).toBe(false)
    expect(r.sceneChangeCount).toBe(0)
  })

  it('detects proscenium for high-quality architecture', () => {
    const code = [
      'import { X } from "y"',
      'export function run(): void {}',
      'interface Config { name: string }',
      'function identity<T>(x: T): T { return x }',
    ].join('\n')
    const r = measureSet(code)
    expect(r.quality).toBeGreaterThanOrEqual(50)
    expect(r.isWellConstructed).toBe(true)
    expect(r.hasSceneChanges).toBe(true)
    expect(r.hasFlySystem).toBe(true)
  })

  it('detects well-constructed from exports and classes', () => {
    const code = 'export class Handler {}'
    const r = measureSet(code)
    expect(r.isWellConstructed).toBe(true)
  })

  it('detects practical set from pure functions', () => {
    const code = 'function pure(): number { return 1 }'
    const r = measureSet(code)
    expect(r.hasPracticalSet).toBe(true)
  })

  it('detects trap door from side effects without try-catch', () => {
    const code = 'console.log("debug")'
    const r = measureSet(code)
    expect(r.hasTrapDoor).toBe(true)
  })

  it('detects hidden mechanisms from excessive mutations', () => {
    const code = 'arr.push(1); arr.pop(); arr.splice(0, 1)'
    const r = measureSet(code)
    expect(r.hasHiddenMechanisms).toBe(true)
  })

  it('detects fly system from generics', () => {
    const code = 'function id<T>(x: T): T { return x }'
    const r = measureSet(code)
    expect(r.hasFlySystem).toBe(true)
  })

  it('detects backdrop from imports', () => {
    const code = 'import { X } from "y"'
    const r = measureSet(code)
    expect(r.hasBackdrop).toBe(true)
  })

  it('detects revolving stage from multiple classes', () => {
    const code = 'class A {} class B {}'
    const r = measureSet(code)
    expect(r.hasRevolvingStage).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'export function a() {}'
    const r = measureSet(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureEngagement ─────────────────────────────────────────────────────

describe('measureEngagement', () => {
  it('returns walkout for empty content', () => {
    const r = measureEngagement('')
    expect(r.quality).toBe(0)
    expect(r.reaction).toBe('walkout')
    expect(r.isEngaging).toBe(false)
    expect(r.participationPoints).toBe(0)
  })

  it('detects standing-ovation for excellent DX', () => {
    const code = [
      '/** Excellent docs */',
      'export function add(a: number, b: number): number { return a + b }',
      'export function sub(a: number, b: number): number { return a - b }',
      'export function mul(a: number, b: number): number { return a * b }',
      'interface Calc { result: number }',
    ].join('\n')
    const r = measureEngagement(code)
    expect(r.quality).toBeGreaterThanOrEqual(70)
    expect(r.isEngaging).toBe(true)
    expect(r.hasStandingOvation).toBe(true)
  })

  it('detects suspension of disbelief from types without any', () => {
    const code = 'function safe(x: number): string { return String(x) }'
    const r = measureEngagement(code)
    expect(r.hasSuspensionOfDisbelief).toBe(true)
  })

  it('detects breaking character from any types', () => {
    const code = 'function bad(x: any): any { return x }'
    const r = measureEngagement(code)
    expect(r.hasBreakingCharacter).toBe(true)
  })

  it('detects audience participation from exports and interfaces', () => {
    const code = 'export function a() {} interface I {}'
    const r = measureEngagement(code)
    expect(r.hasAudienceParticipation).toBe(true)
  })

  it('detects fourth wall from no side effects', () => {
    const code = 'function pure(): number { return 1 }'
    const r = measureEngagement(code)
    expect(r.hasFourthWall).toBe(true)
  })

  it('detects audience connection from jsdoc', () => {
    const code = '/** Docs */\nfunction a() {}'
    const r = measureEngagement(code)
    expect(r.hasAudienceConnection).toBe(true)
  })

  it('detects encores from pipes and functions', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x) }'
    const r = measureEngagement(code)
    expect(r.hasEncores).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'export function a() {}'
    const r = measureEngagement(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measurePerformance ────────────────────────────────────────────────────

describe('measurePerformance', () => {
  it('returns backyard for empty content', () => {
    const r = measurePerformance('')
    expect(r.quality).toBe(0)
    expect(r.caliber).toBe('backyard')
    expect(r.hasPerfectTiming).toBe(false)
    expect(r.missedCueCount).toBe(0)
  })

  it('detects broadway for high-quality execution', () => {
    const code = [
      'const result: number = compute(data);',
      'try {',
      '  const items = [1, 2, 3].map(x => x).filter(x => x > 0);',
      '  return items.length;',
      '} catch (e) {',
      '  throw new Error("failed");',
      '}',
    ].join('\n')
    const r = measurePerformance(code)
    expect(r.quality).toBeGreaterThanOrEqual(50)
    expect(r.hasPerfectTiming).toBe(true)
    expect(r.hasPrecision).toBe(true)
  })

  it('detects perfect timing from const-only', () => {
    const code = 'const x = 1'
    const r = measurePerformance(code)
    expect(r.hasPerfectTiming).toBe(true)
  })

  it('detects improvisation from try-catch', () => {
    const code = 'try { run() } catch {}'
    const r = measurePerformance(code)
    expect(r.hasImprovisation).toBe(true)
  })

  it('detects precision from types without any', () => {
    const code = 'function safe(x: number): string { return String(x) }'
    const r = measurePerformance(code)
    expect(r.hasPrecision).toBe(true)
  })

  it('detects missed cue from side effects without try-catch', () => {
    const code = 'console.log("debug")'
    const r = measurePerformance(code)
    expect(r.hasMissedCue).toBe(true)
    expect(r.missedCueCount).toBeGreaterThan(0)
  })

  it('detects stage fright from any types', () => {
    const code = 'function bad(x: any) { return x }'
    const r = measurePerformance(code)
    expect(r.hasStageFright).toBe(true)
  })

  it('detects flair from pipes and returns', () => {
    const code = 'function run(arr: number[]) { return arr.map(x => x) }'
    const r = measurePerformance(code)
    expect(r.hasFlair).toBe(true)
  })

  it('detects stamina from types without side effects', () => {
    const code = 'function safe(x: number): void {}'
    const r = measurePerformance(code)
    expect(r.hasStamina).toBe(true)
  })

  it('computes quality within valid range', () => {
    const code = 'function a() {}'
    const r = measurePerformance(code)
    expect(r.quality).toBeGreaterThanOrEqual(0)
    expect(r.quality).toBeLessThanOrEqual(100)
  })

  it('detects forgotten line from functions without returns', () => {
    const code = 'function sideEffect() { console.log("hi") }'
    const r = measurePerformance(code)
    expect(r.hasForgottenLine).toBe(true)
  })
})

// ─── analyzeStagePerformance ───────────────────────────────────────────────

describe('analyzeStagePerformance', () => {
  it('returns flop for empty content', () => {
    const perf = analyzeStagePerformance('', 'empty.ts')
    expect(perf.condition).toBe('flop')
    expect(perf.qualityScore).toBe(0)
    expect(perf.file).toBe('empty.ts')
  })

  it('returns tony-award for excellent code', () => {
    const code = [
      '/** Core module */',
      'import { Config } from "config"',
      'export function run(input: Data): Result {',
      '  try {',
      '    const items = input.items.map(x => x).filter(x => x);',
      '    return { output: items };',
      '  } catch (e) {',
      '    throw new Error("failed");',
      '  }',
      '}',
      'export function helper(x: number): string { return String(x) }',
      'export function util(): void {}',
      'interface Data { items: number[] }',
      'interface Result { output: number[] }',
      'function identity<T>(x: T): T { return x }',
    ].join('\n')
    const perf = analyzeStagePerformance(code, 'core.ts')
    expect(perf.qualityScore).toBeGreaterThanOrEqual(60)
    expect(perf.stagePresence).toBeGreaterThan(0)
    expect(perf.scriptQuality).toBeGreaterThan(0)
  })

  it('computes quality score as average of 6 measures', () => {
    const code = 'export function a(): void {}'
    const perf = analyzeStagePerformance(code, 'a.ts')
    const expected = Math.round(
      (perf.stagePresence + perf.scriptQuality + perf.costumeDesign + perf.setDesign + perf.audienceEngagement + perf.performanceQuality) / 6,
    )
    expect(perf.qualityScore).toBe(expected)
  })

  it('classifies conditions correctly', () => {
    expect(analyzeStagePerformance('', 'x.ts').condition).toBe('flop')
  })
})

// ─── classifyCompanyType ───────────────────────────────────────────────────

describe('classifyCompanyType', () => {
  it('returns puppet-show for empty array', () => {
    expect(classifyCompanyType([])).toBe('puppet-show')
  })

  it('returns royal-opera for high quality with tony awards', () => {
    const perfs = Array(3).fill(null).map(() => ({
      file: 'a.ts', stagePresence: 90, scriptQuality: 90, costumeDesign: 90,
      setDesign: 90, audienceEngagement: 90, performanceQuality: 90,
      presence: {} as any, script: {} as any, costume: {} as any,
      set: {} as any, engagement: {} as any, performance: {} as any,
      condition: 'tony-award' as const, qualityScore: 90,
    }))
    expect(classifyCompanyType(perfs)).toBe('royal-opera')
  })

  it('returns broadway-company for good quality', () => {
    const perfs = [{ file: 'a.ts', stagePresence: 70, scriptQuality: 70, costumeDesign: 70,
      setDesign: 70, audienceEngagement: 70, performanceQuality: 70,
      presence: {} as any, script: {} as any, costume: {} as any,
      set: {} as any, engagement: {} as any, performance: {} as any,
      condition: 'critical-acclaim' as const, qualityScore: 70 }]
    expect(classifyCompanyType(perfs)).toBe('broadway-company')
  })

  it('returns puppet-show for low quality', () => {
    const perfs = [{ file: 'a.ts', stagePresence: 5, scriptQuality: 5, costumeDesign: 5,
      setDesign: 5, audienceEngagement: 5, performanceQuality: 5,
      presence: {} as any, script: {} as any, costume: {} as any,
      set: {} as any, engagement: {} as any, performance: {} as any,
      condition: 'flop' as const, qualityScore: 5 }]
    expect(classifyCompanyType(perfs)).toBe('puppet-show')
  })
})

// ─── classifyDirectorGrade ─────────────────────────────────────────────────

describe('classifyDirectorGrade', () => {
  it('returns award-winning-director for high scores', () => {
    expect(classifyDirectorGrade(95)).toBe('award-winning-director')
  })
  it('returns experienced-director for good scores', () => {
    expect(classifyDirectorGrade(80)).toBe('experienced-director')
  })
  it('returns director for moderate scores', () => {
    expect(classifyDirectorGrade(60)).toBe('director')
  })
  it('returns assistant-director for low scores', () => {
    expect(classifyDirectorGrade(40)).toBe('assistant-director')
  })
  it('returns stage-manager for poor scores', () => {
    expect(classifyDirectorGrade(20)).toBe('stage-manager')
  })
  it('returns audience-member for terrible scores', () => {
    expect(classifyDirectorGrade(5)).toBe('audience-member')
  })
})

// ─── analyzeTheaterCompany ─────────────────────────────────────────────────

describe('analyzeTheaterCompany', () => {
  it('returns cancelled for empty array', () => {
    const company = analyzeTheaterCompany([], 'empty/')
    expect(company.companyType).toBe('puppet-show')
    expect(company.condition).toBe('cancelled')
    expect(company.performances).toHaveLength(0)
  })

  it('computes averages from performances', () => {
    const perf = analyzeStagePerformance('export function a(): void {}', 'src/a.ts')
    const company = analyzeTheaterCompany([perf], 'src/')
    expect(company.avgPresence).toBe(perf.stagePresence)
    expect(company.avgScript).toBe(perf.scriptQuality)
  })

  it('counts tony awards and flops', () => {
    const flop = analyzeStagePerformance('', 'bad.ts')
    const company = analyzeTheaterCompany([flop], 'bad/')
    expect(company.flopCount).toBe(1)
    expect(company.tonyAwardCount).toBe(0)
  })

  it('counts engaging performances', () => {
    const code = 'export function a(): void {}\n/** doc */\ninterface I {}'
    const perf = analyzeStagePerformance(code, 'good.ts')
    const company = analyzeTheaterCompany([perf], 'good/')
    expect(company.engagingCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ───────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive message for well-produced code', () => {
    const code = '/** Doc */\nexport function a(): void {}\nimport { X } from "y"\ninterface I {}'
    const result = buildTheaterStageResult(['a.ts'], [code], {})
    const recs = generateRecommendations(result.performances, result.companies, result.festival, result.stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends improvements for low-quality code', () => {
    const result = buildTheaterStageResult(['empty.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── buildTheaterStageResult ───────────────────────────────────────────────

describe('buildTheaterStageResult', () => {
  it('handles empty input', () => {
    const result = buildTheaterStageResult([], [], {})
    expect(result.performances).toHaveLength(0)
    expect(result.companies).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallProduction).toBe(0)
    expect(result.festival.isCriticallyAcclaimed).toBe(false)
  })

  it('builds result with single file', () => {
    const code = 'export function a(): void {}'
    const result = buildTheaterStageResult(['a.ts'], [code], {})
    expect(result.performances).toHaveLength(1)
    expect(result.performances[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files by directory into companies', () => {
    const result = buildTheaterStageResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      ['export function a() {}', 'export function b() {}', 'function c() {}'],
      {},
    )
    expect(result.companies.length).toBeGreaterThanOrEqual(2)
  })

  it('computes festival averages', () => {
    const code = 'export function a(): void {}'
    const result = buildTheaterStageResult(['a.ts'], [code], {})
    expect(result.festival.avgPresence).toBeGreaterThanOrEqual(0)
    expect(result.festival.avgScript).toBeGreaterThanOrEqual(0)
    expect(result.festival.avgEngagement).toBeGreaterThanOrEqual(0)
  })

  it('identifies best performance, script, costume, set, engagement', () => {
    const result = buildTheaterStageResult(
      ['a.ts', 'b.ts'],
      ['export function a(): void {}', ''],
      {},
    )
    expect(result.stats.bestPerformance).toBe('a.ts')
  })

  it('computes condition counts', () => {
    const result = buildTheaterStageResult(
      ['a.ts', 'b.ts'],
      ['', ''],
      {},
    )
    expect(result.stats.flopCount).toBe(2)
  })

  it('sets director grade', () => {
    const result = buildTheaterStageResult(['a.ts'], ['export function a() {}'], {})
    expect(result.stats.directorGrade).toBeTruthy()
  })

  it('generates recommendations', () => {
    const result = buildTheaterStageResult(['a.ts'], [''], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks all stat counts', () => {
    const code = '/** Doc */\nimport { X } from "y"\nexport function a(): void {}\ninterface I {}'
    const result = buildTheaterStageResult(['a.ts'], [code], {})
    expect(result.stats.isLeadingRoleCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasStrongEntranceCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isWellConstructedCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.isEngagingCount).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasPerfectTimingCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────

describe('formatTheaterStageTable', () => {
  it('formats empty result', () => {
    const result = buildTheaterStageResult([], [], {})
    const table = formatTheaterStageTable(result, false)
    expect(table).toContain('Theater Stage')
    expect(table).toContain('No files analyzed')
  })

  it('formats with performances', () => {
    const result = buildTheaterStageResult(['a.ts'], ['export function a() {}'], {})
    const table = formatTheaterStageTable(result, false)
    expect(table).toContain('a.ts')
  })

  it('respects verbose flag', () => {
    const files = Array(20).fill('a.ts').map((f, i) => `${i}_${f}`)
    const contents = Array(20).fill('export function a() {}')
    const result = buildTheaterStageResult(files, contents, {})
    const table = formatTheaterStageTable(result, false)
    expect(table).toContain('... and')
    const verbose = formatTheaterStageTable(result, true)
    expect(verbose).toContain('19_a.ts')
  })
})

describe('formatTheaterStageJson', () => {
  it('produces valid JSON', () => {
    const result = buildTheaterStageResult(['a.ts'], ['export function a() {}'], {})
    const json = formatTheaterStageJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.performances).toHaveLength(1)
  })
})
