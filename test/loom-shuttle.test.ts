import { describe, expect, it } from 'vitest'

import {
  analyzeLoomThread,
  analyzeWeavingWorkshop,
  buildLoomShuttleResult,
  classifyThreadCondition,
  classifyWeaverGrade,
  classifyWorkshopCondition,
  classifyWorkshopType,
  generateRecommendations,
  measureFabric,
  measureHeddle,
  measurePattern,
  measureShuttle,
  measureWarp,
  measureWeave,
  measureYarn,
} from '../src/commands/loom-shuttle-helpers.js'

import {
  formatLoomShuttleCsv,
  formatLoomShuttleJson,
  formatLoomShuttleTable,
} from '../src/commands/loom-shuttle-format-helpers.js'

const EMPTY = ''
const SIMPLE = `import { a } from "./x"
export function hello() {
  return "world"
}
`
const COMPLEX = `import { a, b, c } from "./utils"
import { EventEmitter } from "events"
import Mutex from "mutex"

interface Data {
  value: number
  name: string
}

class Processor {
  private data: Data[] = []
  static instance: Processor

  constructor() {
    this.init()
  }

  init() {
    this.data = []
  }

  async process(input: string): Promise<string> {
    try {
      const result = await this.transform(input)
      return result
    } catch (error) {
      throw new Error("Processing failed")
    }
  }

  async transform(input: string): Promise<string> {
    return input.toUpperCase()
  }

  on(event: string, callback: (err: Error | null, data?: string) => void) {
    callback(null, "ok")
  }
}

export { Processor }
export type { Data }
`
const ASYNC_HEAVY = `import { delay } from "./utils"

async function main() {
  await delay(100)
  await delay(200)
  await delay(300)
}

async function secondary() {
  await delay(50)
  return Promise.resolve("done")
}

setTimeout(() => main(), 1000)
setInterval(() => secondary(), 5000)
`
const BAD_CODE = `var x = undefined
var y = undefined
var z = undefined
var w = undefined
var u = undefined
var v = undefined
// TODO fix this
// FIXME broken
// HACK terrible
`
const TYPED = `export function add(a: number, b: number): number {
  return a + b
}

export interface Config {
  host: string
  port: number
  enabled: boolean
}

export type Result = string | number
`
const MINIMAL = `function simple() {
  return 1
}
`

// ─── measureWarp ────────────────────────────────────────

describe('measureWarp', () => {
  it('returns 100 tension for empty content', () => {
    const result = measureWarp(EMPTY)
    expect(result.tension).toBe(100)
  })

  it('is taut for high tension', () => {
    const result = measureWarp(SIMPLE)
    expect(result.isTaut).toBe(true)
  })

  it('counts threads as imports + exports', () => {
    const result = measureWarp(SIMPLE)
    expect(result.threadCount).toBeGreaterThan(0)
  })

  it('detects no snags when no TODO/FIXME', () => {
    const result = measureWarp(SIMPLE)
    expect(result.hasSnags).toBe(false)
  })

  it('detects snags from TODO markers', () => {
    const result = measureWarp(BAD_CODE)
    expect(result.hasSnags).toBe(true)
    expect(result.snagCount).toBeGreaterThan(0)
  })

  it('detects broken threads from excessive undefined', () => {
    const result = measureWarp(BAD_CODE)
    expect(result.isBroken).toBe(true)
    expect(result.brokenCount).toBe(1)
  })

  it('has variation when imports !== exports', () => {
    const result = measureWarp(COMPLEX)
    expect(result.hasVariation).toBe(true)
  })

  it('is evenly spaced when imports ≈ exports', () => {
    const result = measureWarp(SIMPLE)
    expect(result.isEvenlySpaced).toBe(true)
  })

  it('is slack for low quality content', () => {
    const result = measureWarp('just some text with no structure')
    expect(result.tension).toBeLessThanOrEqual(60)
  })

  it('tension is clamped between 0-100', () => {
    const result = measureWarp(COMPLEX)
    expect(result.tension).toBeGreaterThanOrEqual(0)
    expect(result.tension).toBeLessThanOrEqual(100)
  })
})

// ─── measureShuttle ─────────────────────────────────────

describe('measureShuttle', () => {
  it('returns 100 speed for empty content', () => {
    const result = measureShuttle(EMPTY)
    expect(result.speed).toBe(100)
    expect(result.passageQuality).toBe(100)
  })

  it('is swift for functions with returns', () => {
    const result = measureShuttle(SIMPLE)
    expect(result.isSwift).toBe(true)
  })

  it('has smooth passage for clean code', () => {
    const result = measureShuttle(SIMPLE)
    expect(result.hasSmoothPassage).toBe(true)
  })

  it('detects jamming from excessive loops/timers', () => {
    const result = measureShuttle(ASYNC_HEAVY)
    expect(result.jamCount).toBeGreaterThan(0)
  })

  it('detects misfires from excessive throws', () => {
    const code = `function a() { throw new Error("x") }
function b() { throw new Error("y") }
function c() { throw new Error("z") }
`
    const result = measureShuttle(code)
    expect(result.hasMisfires).toBe(true)
    expect(result.misfireCount).toBe(3)
  })

  it('counts jam count from loops + timers', () => {
    const result = measureShuttle(ASYNC_HEAVY)
    expect(result.jamCount).toBeGreaterThanOrEqual(2)
  })

  it('speed is clamped between 0-100', () => {
    const result = measureShuttle(ASYNC_HEAVY)
    expect(result.speed).toBeGreaterThanOrEqual(0)
    expect(result.speed).toBeLessThanOrEqual(100)
  })

  it('sluggish is false for text without function structure', () => {
    const result = measureShuttle('callback callback callback')
    expect(typeof result.isSluggish).toBe('boolean')
    expect(result.speed).toBeGreaterThanOrEqual(0)
  })

  it('passage quality for minimal function', () => {
    const result = measureShuttle(MINIMAL)
    expect(result.passageQuality).toBeGreaterThan(0)
  })
})

// ─── measureWeave ───────────────────────────────────────

describe('measureWeave', () => {
  it('returns 100 quality for empty content', () => {
    const result = measureWeave(EMPTY)
    expect(result.quality).toBe(100)
  })

  it('detects tight weave for high quality', () => {
    const result = measureWeave(COMPLEX)
    expect(result.hasTightWeave).toBe(true)
  })

  it('has crossed threads from shared state', () => {
    const result = measureWeave(COMPLEX)
    expect(result.hasCrossedThreads).toBe(true)
    expect(result.crossedThreadCount).toBeGreaterThan(0)
  })

  it('has fringes when exports exist but no error handling', () => {
    const result = measureWeave('export function a() { return 1 }')
    expect(result.hasFringes).toBe(true)
  })

  it('detects broken threads from TODO markers', () => {
    const result = measureWeave(BAD_CODE)
    expect(result.hasBrokenThreads).toBe(true)
  })

  it('assigns jacquard pattern for quality >= 80 with classes + interfaces', () => {
    const result = measureWeave(COMPLEX)
    expect(result.pattern).toBe('jacquard')
  })

  it('assigns plain or low pattern for low quality code', () => {
    const result = measureWeave('just text')
    expect(['plain', 'basket', 'leno']).toContain(result.pattern)
  })

  it('assigns satin pattern for quality >= 45 with exports', () => {
    const code = 'export function a() { return 1 }\nexport function b() { return 2 }\nexport function c() { return 3 }\n'
    const result = measureWeave(code)
    expect(['satin', 'basket', 'twill', 'jacquard']).toContain(result.pattern)
  })

  it('assigns twill for quality >= 60 with classes', () => {
    const code = 'class Foo {}\ntry { x() } catch(e) {}\ntry { y() } catch(e) {}\nexport { Foo }\n'
    const result = measureWeave(code)
    expect(['twill', 'jacquard', 'satin', 'basket']).toContain(result.pattern)
  })

  it('quality is clamped between 0-100', () => {
    const result = measureWeave(COMPLEX)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measureFabric ──────────────────────────────────────

describe('measureFabric', () => {
  it('returns 100 quality for empty content', () => {
    const result = measureFabric(EMPTY)
    expect(result.quality).toBe(100)
  })

  it('detects reinforcement from error handling + locks', () => {
    const result = measureFabric(COMPLEX)
    expect(result.hasReinforcement).toBe(true)
    expect(result.reinforcementCount).toBeGreaterThan(0)
  })

  it('detects moth holes from TODO/FIXME', () => {
    const result = measureFabric(BAD_CODE)
    expect(result.hasMothHoles).toBe(true)
    expect(result.mothHoleCount).toBeGreaterThan(0)
  })

  it('detects strong fabric for high quality', () => {
    const result = measureFabric(COMPLEX)
    expect(result.hasStrongFabric).toBe(true)
  })

  it('detects double weave from multiple error handling', () => {
    const result = measureFabric(COMPLEX)
    expect(result.hasDoubleWeave).toBe(true)
  })

  it('weight is based on line count', () => {
    const result = measureFabric(COMPLEX)
    expect(result.weight).toBeGreaterThan(0)
  })

  it('weak fabric for poor code', () => {
    const result = measureFabric('just some plain text\n')
    expect(result.hasWeakFabric).toBe(true)
  })

  it('quality is clamped between 0-100', () => {
    const result = measureFabric(COMPLEX)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
  })
})

// ─── measurePattern ─────────────────────────────────────

describe('measurePattern', () => {
  it('returns 0 complexity for empty content', () => {
    const result = measurePattern(EMPTY)
    expect(result.complexity).toBe(0)
  })

  it('detects complex motif from high async or nesting', () => {
    const result = measurePattern(COMPLEX)
    expect(result.hasComplexMotif).toBe(true)
  })

  it('detects repeating pattern from locks + error handling', () => {
    const result = measurePattern(COMPLEX)
    expect(result.hasRepeatingPattern).toBe(true)
  })

  it('detects color changes from locks + callbacks', () => {
    const result = measurePattern(COMPLEX)
    expect(result.hasColorChanges).toBe(true)
    expect(result.colorChangeCount).toBeGreaterThan(1)
  })

  it('detects border pattern from conditions', () => {
    const code = 'if (x) {}\nif (y) {}\n'
    const result = measurePattern(code)
    expect(result.hasBorderPattern).toBe(true)
  })

  it('detects central medallion from classes', () => {
    const result = measurePattern(COMPLEX)
    expect(result.hasCentralMedallion).toBe(true)
  })

  it('is symmetric when async ≈ callbacks', () => {
    const result = measurePattern(MINIMAL)
    expect(result.isSymmetric).toBe(true)
  })

  it('complexity is clamped between 0-100', () => {
    const result = measurePattern(COMPLEX)
    expect(result.complexity).toBeGreaterThanOrEqual(0)
    expect(result.complexity).toBeLessThanOrEqual(100)
  })

  it('complexity increases with async operations', () => {
    const simple = measurePattern(MINIMAL)
    const heavy = measurePattern(ASYNC_HEAVY)
    expect(heavy.complexity).toBeGreaterThan(simple.complexity)
  })
})

// ─── measureYarn ────────────────────────────────────────

describe('measureYarn', () => {
  it('returns 100 quality for empty content', () => {
    const result = measureYarn(EMPTY)
    expect(result.quality).toBe(100)
  })

  it('detects strong yarn for high quality', () => {
    const result = measureYarn(COMPLEX)
    expect(result.isStrong).toBe(true)
  })

  it('detects colorfast when no TODO/FIXME', () => {
    const result = measureYarn(COMPLEX)
    expect(result.isColorfast).toBe(true)
  })

  it('detects slubs from deep nesting', () => {
    const nested = `function a() {
  if (true) {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            return 1
          }
        }
      }
    }
  }
}
`
    const result = measureYarn(nested)
    expect(result.hasSlubs).toBe(true)
    expect(result.slubCount).toBeGreaterThan(0)
  })

  it('consistent diameter for shallow nesting', () => {
    const result = measureYarn(SIMPLE)
    expect(result.hasConsistentDiameter).toBe(true)
  })

  it('assigns silk or linen type for quality >= 80', () => {
    const result = measureYarn(COMPLEX)
    expect(['silk', 'linen']).toContain(result.type)
  })

  it('assigns raw type for low quality', () => {
    const result = measureYarn('x')
    expect(result.type).toBe('raw')
  })

  it('quality is clamped between 0-100', () => {
    const result = measureYarn(COMPLEX)
    expect(result.quality).toBeGreaterThanOrEqual(0)
    expect(result.quality).toBeLessThanOrEqual(100)
  })

  it('assigns cotton for quality in 45-59 range', () => {
    const code = 'export function a() { return 1 }\n'
    const result = measureYarn(code)
    expect(['cotton', 'linen', 'silk', 'wool']).toContain(result.type)
  })
})

// ─── measureHeddle ──────────────────────────────────────

describe('measureHeddle', () => {
  it('is properly set for empty content', () => {
    const result = measureHeddle(EMPTY)
    expect(result.isProperlySet).toBe(true)
  })

  it('is properly set for code with constructor', () => {
    const result = measureHeddle(COMPLEX)
    expect(result.isProperlySet).toBe(true)
  })

  it('has correct shaft when classes or interfaces exist', () => {
    const result = measureHeddle(COMPLEX)
    expect(result.hasCorrectShaft).toBe(true)
  })

  it('has tie up when imports exist', () => {
    const result = measureHeddle(COMPLEX)
    expect(result.hasTieUp).toBe(true)
  })

  it('has draft when JSDoc exists', () => {
    const code = `/**
 * @example
 * const x = 1
 */
function documented() {}
`
    const result = measureHeddle(code)
    expect(result.hasDraft).toBe(true)
  })

  it('is well timed when async present', () => {
    const result = measureHeddle(COMPLEX)
    expect(result.isWellTimed).toBe(true)
  })

  it('is well timed for empty content', () => {
    const result = measureHeddle(EMPTY)
    expect(result.isWellTimed).toBe(true)
  })

  it('not properly set for code with no init/constructor/class/interface', () => {
    const result = measureHeddle('const x = 1\nconst y = 2\n')
    expect(result.isProperlySet).toBe(false)
  })
})

// ─── classifyThreadCondition ────────────────────────────

describe('classifyThreadCondition', () => {
  it('returns master-tapestry for high scores', () => {
    expect(classifyThreadCondition(80, 80, 80)).toBe('master-tapestry')
  })

  it('returns fine-cloth for medium-high scores', () => {
    expect(classifyThreadCondition(55, 55, 55)).toBe('fine-cloth')
  })

  it('returns quality-weave for medium scores', () => {
    expect(classifyThreadCondition(40, 40, 40)).toBe('quality-weave')
  })

  it('returns homespun for low-medium scores', () => {
    expect(classifyThreadCondition(25, 25, 25)).toBe('homespun')
  })

  it('returns frayed-fabric for low scores', () => {
    expect(classifyThreadCondition(12, 12, 12)).toBe('frayed-fabric')
  })

  it('returns tangled-mess for very low scores', () => {
    expect(classifyThreadCondition(5, 5, 5)).toBe('tangled-mess')
  })

  it('requires high warp tension for master-tapestry', () => {
    expect(classifyThreadCondition(60, 80, 80)).toBe('fine-cloth')
  })

  it('requires decent fabric quality for fine-cloth', () => {
    expect(classifyThreadCondition(70, 70, 40)).toBe('quality-weave')
  })
})

// ─── classifyWorkshopType ───────────────────────────────

describe('classifyWorkshopType', () => {
  it('returns empty-room for no threads', () => {
    expect(classifyWorkshopType([])).toBe('empty-room')
  })

  it('returns master-weaver for high avg weave with 30%+ masters', () => {
    const threads = Array.from({ length: 10 }, (_, i) => ({
      ...analyzeLoomThread(COMPLEX, `f${i}.ts`),
      condition: i < 4 ? 'master-tapestry' as const : 'quality-weave' as const,
    }))
    expect(classifyWorkshopType(threads)).toBe('master-weaver')
  })

  it('returns textile-mill for decent avg weave', () => {
    const threads = [analyzeLoomThread(SIMPLE, 'a.ts')]
    expect(['textile-mill', 'handloom', 'spinning-wheel', 'master-weaver']).toContain(classifyWorkshopType(threads))
  })

  it('returns tangled-yarn for 40%+ tangled', () => {
    const threads = Array.from({ length: 5 }, () => ({
      ...analyzeLoomThread(MINIMAL, 't.ts'),
      condition: 'tangled-mess' as const,
      weave: { ...analyzeLoomThread(MINIMAL, 't.ts').weave, quality: 10 },
    }))
    expect(classifyWorkshopType(threads)).toBe('tangled-yarn')
  })

  it('returns spinning-wheel for low avg weave', () => {
    const threads = [{ ...analyzeLoomThread('x', 'a.ts'), condition: 'tangled-mess' as const }]
    expect(['spinning-wheel', 'tangled-yarn', 'empty-room', 'handloom']).toContain(classifyWorkshopType(threads))
  })
})

// ─── classifyWorkshopCondition ──────────────────────────

describe('classifyWorkshopCondition', () => {
  it('returns haute-couture for score >= 75', () => {
    expect(classifyWorkshopCondition(80, 80)).toBe('haute-couture')
  })

  it('returns quality-textile for score >= 60', () => {
    expect(classifyWorkshopCondition(60, 60)).toBe('quality-textile')
  })

  it('returns standard-fabric for score >= 45', () => {
    expect(classifyWorkshopCondition(45, 45)).toBe('standard-fabric')
  })

  it('returns rough-cloth for score >= 30', () => {
    expect(classifyWorkshopCondition(30, 30)).toBe('rough-cloth')
  })

  it('returns rags for score >= 15', () => {
    expect(classifyWorkshopCondition(15, 15)).toBe('rags')
  })

  it('returns tatters for very low scores', () => {
    expect(classifyWorkshopCondition(5, 5)).toBe('tatters')
  })
})

// ─── classifyWeaverGrade ────────────────────────────────

describe('classifyWeaverGrade', () => {
  it('returns master-weaver for >= 80', () => {
    expect(classifyWeaverGrade(80)).toBe('master-weaver')
  })

  it('returns journeyman-weaver for >= 65', () => {
    expect(classifyWeaverGrade(65)).toBe('journeyman-weaver')
  })

  it('returns apprentice-weaver for >= 50', () => {
    expect(classifyWeaverGrade(50)).toBe('apprentice-weaver')
  })

  it('returns novice for >= 35', () => {
    expect(classifyWeaverGrade(35)).toBe('novice')
  })

  it('returns child for >= 20', () => {
    expect(classifyWeaverGrade(20)).toBe('child')
  })

  it('returns cat for < 20', () => {
    expect(classifyWeaverGrade(10)).toBe('cat')
  })
})

// ─── analyzeLoomThread ──────────────────────────────────

describe('analyzeLoomThread', () => {
  it('returns a complete LoomThread', () => {
    const thread = analyzeLoomThread(COMPLEX, 'src/processor.ts')
    expect(thread.file).toBe('src/processor.ts')
    expect(thread.warpTension).toBeGreaterThanOrEqual(0)
    expect(thread.shuttleSpeed).toBeGreaterThanOrEqual(0)
    expect(thread.threadCount).toBeGreaterThanOrEqual(0)
    expect(thread.weavePattern).toBeGreaterThanOrEqual(0)
    expect(thread.fabricQuality).toBeGreaterThanOrEqual(0)
    expect(thread.patternComplexity).toBeGreaterThanOrEqual(0)
    expect(thread.qualityScore).toBeGreaterThanOrEqual(0)
    expect(thread.condition).toBeDefined()
  })

  it('has all measure objects', () => {
    const thread = analyzeLoomThread(SIMPLE, 'a.ts')
    expect(thread.warp).toBeDefined()
    expect(thread.shuttle).toBeDefined()
    expect(thread.weave).toBeDefined()
    expect(thread.fabric).toBeDefined()
    expect(thread.pattern).toBeDefined()
    expect(thread.yarn).toBeDefined()
    expect(thread.heddle).toBeDefined()
  })

  it('quality score is clamped to 0-100', () => {
    const thread = analyzeLoomThread(COMPLEX, 'a.ts')
    expect(thread.qualityScore).toBeGreaterThanOrEqual(0)
    expect(thread.qualityScore).toBeLessThanOrEqual(100)
  })

  it('classifies condition based on warp/weave/fabric', () => {
    const thread = analyzeLoomThread(COMPLEX, 'a.ts')
    expect(['master-tapestry', 'fine-cloth', 'quality-weave', 'homespun', 'frayed-fabric', 'tangled-mess']).toContain(thread.condition)
  })

  it('handles empty content', () => {
    const thread = analyzeLoomThread(EMPTY, 'empty.ts')
    expect(thread.warpTension).toBe(100)
    expect(thread.file).toBe('empty.ts')
  })
})

// ─── analyzeWeavingWorkshop ─────────────────────────────

describe('analyzeWeavingWorkshop', () => {
  it('returns empty-room workshop for no threads', () => {
    const ws = analyzeWeavingWorkshop([], 'src')
    expect(ws.workshopType).toBe('empty-room')
    expect(ws.condition).toBe('tatters')
    expect(ws.threads).toEqual([])
    expect(ws.avgWarpTension).toBe(0)
  })

  it('calculates averages from threads', () => {
    const threads = [
      analyzeLoomThread(SIMPLE, 'a.ts'),
      analyzeLoomThread(COMPLEX, 'b.ts'),
    ]
    const ws = analyzeWeavingWorkshop(threads, 'src')
    expect(ws.avgWarpTension).toBeGreaterThan(0)
    expect(ws.avgWeaveQuality).toBeGreaterThanOrEqual(0)
    expect(ws.avgFabricQuality).toBeGreaterThanOrEqual(0)
  })

  it('counts master and tangled threads', () => {
    const threads = [
      { ...analyzeLoomThread(COMPLEX, 'a.ts'), condition: 'master-tapestry' as const },
      { ...analyzeLoomThread(MINIMAL, 'b.ts'), condition: 'tangled-mess' as const },
    ]
    const ws = analyzeWeavingWorkshop(threads, 'src')
    expect(ws.masterCount).toBe(1)
    expect(ws.tangledCount).toBe(1)
  })

  it('sets directory name', () => {
    const ws = analyzeWeavingWorkshop([analyzeLoomThread(SIMPLE, 'a.ts')], 'lib')
    expect(ws.directory).toBe('lib')
  })

  it('counts strong fabric and thread safe', () => {
    const threads = [analyzeLoomThread(COMPLEX, 'a.ts')]
    const ws = analyzeWeavingWorkshop(threads, 'src')
    expect(ws.strongFabricCount).toBeGreaterThanOrEqual(0)
    expect(ws.threadSafeCount).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateRecommendations ────────────────────────────

describe('generateRecommendations', () => {
  it('returns positive recommendation for healthy code', () => {
    const threads = [analyzeLoomThread(COMPLEX, 'a.ts')]
    const ws = [analyzeWeavingWorkshop(threads, 'src')]
    const guild = { avgWarpTension: 80, avgWeaveQuality: 80, avgFabricQuality: 80, isWellWoven: true, overallWeave: 80 }
    const stats = {
      totalFiles: 1, totalWorkshops: 1, avgWarpTension: 80, avgShuttleSpeed: 70, avgThreadCount: 5,
      avgWeavePattern: 80, avgFabricQuality: 80, avgPatternComplexity: 10,
      masterTapestryCount: 1, fineClothCount: 0, qualityWeaveCount: 0, homespunCount: 0,
      frayedFabricCount: 0, tangledMessCount: 0, plainWeaveCount: 0, twillWeaveCount: 0,
      jacquardWeaveCount: 1, hasSnagsCount: 0, hasJammingCount: 0, hasCrossedThreadsCount: 0,
      hasPulledThreadsCount: 0, hasMothHolesCount: 0, hasReinforcementCount: 1,
      isStrongFabricCount: 1, isWellTimedCount: 1, isSymmetricCount: 1,
      overallWeave: 80, weaverGrade: 'master-weaver' as const,
      bestWoven: 'a.ts', strongestFabric: 'a.ts', fastestShuttle: 'a.ts',
      mostComplex: 'a.ts', mostReinforced: 'a.ts',
    }
    const recs = generateRecommendations(threads, ws, guild, stats)
    expect(recs).toContain('Your loom is producing beautiful, strong fabric - excellent code weaving')
  })

  it('recommends error handling for low weave', () => {
    const guild = { avgWarpTension: 20, avgWeaveQuality: 20, avgFabricQuality: 20, isWellWoven: false, overallWeave: 20 }
    const stats = {
      totalFiles: 1, totalWorkshops: 1, avgWarpTension: 20, avgShuttleSpeed: 20, avgThreadCount: 0,
      avgWeavePattern: 20, avgFabricQuality: 20, avgPatternComplexity: 0,
      masterTapestryCount: 0, fineClothCount: 0, qualityWeaveCount: 0, homespunCount: 0,
      frayedFabricCount: 0, tangledMessCount: 1, plainWeaveCount: 1, twillWeaveCount: 0,
      jacquardWeaveCount: 0, hasSnagsCount: 0, hasJammingCount: 0, hasCrossedThreadsCount: 0,
      hasPulledThreadsCount: 0, hasMothHolesCount: 0, hasReinforcementCount: 0,
      isStrongFabricCount: 0, isWellTimedCount: 1, isSymmetricCount: 1,
      overallWeave: 20, weaverGrade: 'cat' as const,
      bestWoven: 'a.ts', strongestFabric: 'a.ts', fastestShuttle: 'a.ts',
      mostComplex: 'a.ts', mostReinforced: 'a.ts',
    }
    const recs = generateRecommendations([], [], guild, stats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('recommends resolving TODO/FIXME for many moth holes', () => {
    const guild = { avgWarpTension: 50, avgWeaveQuality: 50, avgFabricQuality: 50, isWellWoven: false, overallWeave: 50 }
    const stats = {
      totalFiles: 5, totalWorkshops: 1, avgWarpTension: 50, avgShuttleSpeed: 50, avgThreadCount: 2,
      avgWeavePattern: 50, avgFabricQuality: 50, avgPatternComplexity: 5,
      masterTapestryCount: 0, fineClothCount: 0, qualityWeaveCount: 0, homespunCount: 0,
      frayedFabricCount: 0, tangledMessCount: 0, plainWeaveCount: 0, twillWeaveCount: 0,
      jacquardWeaveCount: 0, hasSnagsCount: 0, hasJammingCount: 0, hasCrossedThreadsCount: 0,
      hasPulledThreadsCount: 0, hasMothHolesCount: 5, hasReinforcementCount: 0,
      isStrongFabricCount: 0, isWellTimedCount: 5, isSymmetricCount: 5,
      overallWeave: 50, weaverGrade: 'apprentice-weaver' as const,
      bestWoven: 'a.ts', strongestFabric: 'a.ts', fastestShuttle: 'a.ts',
      mostComplex: 'a.ts', mostReinforced: 'a.ts',
    }
    const recs = generateRecommendations([], [], guild, stats)
    expect(recs.some((r) => r.includes('moth holes'))).toBe(true)
  })
})

// ─── buildLoomShuttleResult ─────────────────────────────

describe('buildLoomShuttleResult', () => {
  it('handles empty input', () => {
    const result = buildLoomShuttleResult([], [], {})
    expect(result.threads).toEqual([])
    expect(result.workshops).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalWorkshops).toBe(0)
    expect(result.guild.overallWeave).toBe(0)
    expect(result.guild.isWellWoven).toBe(false)
    expect(result.stats.weaverGrade).toBe('cat')
  })

  it('builds result for single file', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    expect(result.threads.length).toBe(1)
    expect(result.threads[0].file).toBe('a.ts')
    expect(result.stats.totalFiles).toBe(1)
  })

  it('builds result for multiple files', () => {
    const result = buildLoomShuttleResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [SIMPLE, COMPLEX, MINIMAL],
      {},
    )
    expect(result.threads.length).toBe(3)
    expect(result.workshops.length).toBe(2)
    expect(result.stats.totalFiles).toBe(3)
  })

  it('calculates stats correctly', () => {
    const result = buildLoomShuttleResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, SIMPLE],
      {},
    )
    expect(result.stats.avgWarpTension).toBeGreaterThan(0)
    expect(result.stats.avgShuttleSpeed).toBeGreaterThan(0)
    expect(result.stats.avgFabricQuality).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallWeave).toBeGreaterThan(0)
  })

  it('sets bestWoven, strongestFabric etc', () => {
    const result = buildLoomShuttleResult(
      ['a.ts', 'b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    expect(result.stats.bestWoven).toBeTruthy()
    expect(result.stats.strongestFabric).toBeTruthy()
    expect(result.stats.fastestShuttle).toBeTruthy()
    expect(result.stats.mostComplex).toBeTruthy()
    expect(result.stats.mostReinforced).toBeTruthy()
  })

  it('returns none for highlights with no files', () => {
    const result = buildLoomShuttleResult([], [], {})
    expect(result.stats.bestWoven).toBe('none')
    expect(result.stats.strongestFabric).toBe('none')
    expect(result.stats.fastestShuttle).toBe('none')
    expect(result.stats.mostComplex).toBe('none')
    expect(result.stats.mostReinforced).toBe('none')
  })

  it('groups files by directory into workshops', () => {
    const result = buildLoomShuttleResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [SIMPLE, COMPLEX, MINIMAL],
      {},
    )
    expect(result.workshops.length).toBe(2)
    const srcWs = result.workshops.find((w) => w.directory === 'src')
    expect(srcWs).toBeDefined()
    expect(srcWs!.threads.length).toBe(2)
  })

  it('generates recommendations', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('tracks condition counts', () => {
    const result = buildLoomShuttleResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, SIMPLE],
      {},
    )
    const sum = result.stats.masterTapestryCount +
      result.stats.fineClothCount +
      result.stats.qualityWeaveCount +
      result.stats.homespunCount +
      result.stats.frayedFabricCount +
      result.stats.tangledMessCount
    expect(sum).toBe(2)
  })

  it('tracks weave pattern counts', () => {
    const result = buildLoomShuttleResult(
      ['a.ts', 'b.ts'],
      [COMPLEX, SIMPLE],
      {},
    )
    const sum = result.stats.plainWeaveCount +
      result.stats.twillWeaveCount +
      result.stats.jacquardWeaveCount
    expect(sum).toBeLessThanOrEqual(2)
  })
})

// ─── Format helpers ─────────────────────────────────────

describe('formatLoomShuttleTable', () => {
  it('formats result as table string', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    const table = formatLoomShuttleTable(result, false)
    expect(table).toContain('Loom Shuttle Report')
    expect(table).toContain('Weaving Guild')
    expect(table).toContain('Statistics')
  })

  it('includes verbose thread details', () => {
    const result = buildLoomShuttleResult(['a.ts'], [COMPLEX], {})
    const table = formatLoomShuttleTable(result, true)
    expect(table).toContain('Loom Threads')
    expect(table).toContain('a.ts')
  })

  it('includes workshops', () => {
    const result = buildLoomShuttleResult(
      ['src/a.ts', 'src/b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    const table = formatLoomShuttleTable(result, false)
    expect(table).toContain('Weaving Workshops')
  })

  it('includes recommendations', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    const table = formatLoomShuttleTable(result, false)
    expect(table).toContain('Recommendations')
  })
})

describe('formatLoomShuttleJson', () => {
  it('formats result as valid JSON', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    const json = formatLoomShuttleJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.threads).toBeDefined()
    expect(parsed.guild).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })

  it('includes all top-level keys', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    const json = formatLoomShuttleJson(result)
    const parsed = JSON.parse(json)
    expect(Object.keys(parsed)).toContain('threads')
    expect(Object.keys(parsed)).toContain('workshops')
    expect(Object.keys(parsed)).toContain('guild')
    expect(Object.keys(parsed)).toContain('stats')
    expect(Object.keys(parsed)).toContain('recommendations')
  })
})

describe('formatLoomShuttleCsv', () => {
  it('formats result as CSV with headers', () => {
    const result = buildLoomShuttleResult(['a.ts'], [SIMPLE], {})
    const csv = formatLoomShuttleCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toContain('file')
    expect(lines[0]).toContain('warpTension')
    expect(lines[0]).toContain('condition')
    expect(lines.length).toBe(2)
  })

  it('handles multiple files in CSV', () => {
    const result = buildLoomShuttleResult(
      ['a.ts', 'b.ts'],
      [SIMPLE, COMPLEX],
      {},
    )
    const csv = formatLoomShuttleCsv(result)
    const lines = csv.split('\n')
    expect(lines.length).toBe(3)
  })

  it('handles empty input', () => {
    const result = buildLoomShuttleResult([], [], {})
    const csv = formatLoomShuttleCsv(result)
    const lines = csv.split('\n')
    expect(lines.length).toBe(1)
    expect(lines[0]).toContain('file')
  })
})
