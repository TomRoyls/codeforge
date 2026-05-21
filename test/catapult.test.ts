import { describe, expect, it } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countErrorHandling, countTypeAnnotations, countBranches,
  maxNesting, countConsole, countComments, countTodos,
  measurePayloadWeight, measureStructuralIntegrity, measureAerodynamics,
  measureImpactForce, measureStability,
  classifyPayloadType, classifyWeightClass, classifyCommanderGrade,
  classifyEngineType, classifySiegeCondition, assessLaunchReadiness,
  analyzeArmTension, analyzeLaunchAngle, checkReleaseMechanism,
  analyzeProjectileIntegrity, analyzeTrajectory,
  analyzeProjectile, analyzeSiegeEngine,
  generateCatapultRecommendations, buildCatapultResult,
} from '../src/commands/catapult-helpers.js'
import { formatCatapultJson, formatCatapultTable } from '../src/commands/catapult-format-helpers.js'
import type { Projectile, CatapultStats, LaunchPad, SiegeEngine } from '../src/commands/catapult-helpers.js'

const strongCode = `import { readFileSync } from 'node:fs'
import type { Result } from './types.js'

/**
 * Parse a file
 * @example
 * parseFile('test.ts')
 */
export function parseFile(path: string): Result {
  try {
    const content: string = readFileSync(path, 'utf8')
    if (content.length === 0) {
      return { ok: false, error: 'empty' }
    }
    return { ok: true, data: content }
  } catch (e: unknown) {
    return { ok: false, error: String(e) }
  }
}
`

const weakCode = `var x = 1
console.log(x)
console.log("hello")
console.log("world")
console.log("test")
// TODO: fix this
// FIXME: broken
// HACK: workaround
function a(b){if(b){if(c){if(d){if(e){if(f){}}}}}}
`

const emptyCode = ''

const simpleExport = 'export function calc(x: number): number { return x * 2 }'

const testCode = `import { describe, it, expect } from 'vitest'
describe('calc', () => {
  it('works', () => {
    expect(calc(2)).toBe(4)
  })
})
`

const asyncCode = `import { readFile } from 'node:fs/promises'
export async function readConfig(path: string): Promise<Config> {
  const data = await readFile(path, 'utf8')
  return JSON.parse(data) as Config
}
`

// ─── Primitives ──────────────────────────────────────────────────────────────

describe('catapult primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc('const a = 1\nconst b = 2')).toBe(2)
    expect(countLoc(emptyCode)).toBe(0)
  })

  it('countImports counts imports', () => {
    expect(countImports('import { x } from "y"')).toBe(1)
    expect(countImports('const x = 1')).toBe(0)
  })

  it('countExports counts exports', () => {
    expect(countExports('export function a() {}')).toBe(1)
    expect(countExports('export const x = 1')).toBe(1)
  })

  it('countFunctions counts functions', () => {
    expect(countFunctions('function a() {}')).toBe(1)
    expect(countFunctions('const fn = () => {}')).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling('try {} catch(e) {}')).toBe(2)
    expect(countErrorHandling('throw new Error("x")')).toBe(1)
  })

  it('countTypeAnnotations counts types', () => {
    expect(countTypeAnnotations('const x: number = 1')).toBe(1)
  })

  it('countBranches counts branches', () => {
    expect(countBranches('if (a) {}')).toBe(1)
  })

  it('maxNesting counts brace depth', () => {
    expect(maxNesting('{{{}}}')).toBe(3)
    expect(maxNesting('no braces')).toBe(0)
  })

  it('countConsole counts console calls', () => {
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comments', () => {
    expect(countComments('// hello')).toBe(1)
  })

  it('countTodos counts TODOs', () => {
    expect(countTodos('TODO: fix')).toBe(1)
    expect(countTodos('FIXME: broken')).toBe(1)
  })
})

// ─── Measurements ────────────────────────────────────────────────────────────

describe('catapult measurements', () => {
  it('measurePayloadWeight returns 0 for empty', () => {
    expect(measurePayloadWeight(emptyCode)).toBe(0)
  })

  it('measurePayloadWeight rewards simple code', () => {
    const result = measurePayloadWeight(simpleExport)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('measureStructuralIntegrity returns 0 for empty', () => {
    expect(measureStructuralIntegrity(emptyCode)).toBe(0)
  })

  it('measureStructuralIntegrity rewards robust code', () => {
    const result = measureStructuralIntegrity(strongCode)
    expect(result).toBeGreaterThan(30)
  })

  it('measureAerodynamics returns 0 for empty', () => {
    expect(measureAerodynamics(emptyCode)).toBe(0)
  })

  it('measureAerodynamics rewards efficient code', () => {
    const result = measureAerodynamics(simpleExport)
    expect(result).toBeGreaterThan(40)
  })

  it('measureImpactForce returns 0 for empty', () => {
    expect(measureImpactForce(emptyCode)).toBe(0)
  })

  it('measureImpactForce rewards focused code', () => {
    const result = measureImpactForce(simpleExport)
    expect(result).toBeGreaterThan(20)
  })

  it('measureStability returns 0 for empty', () => {
    expect(measureStability(emptyCode)).toBe(0)
  })

  it('measureStability rewards stable code', () => {
    const result = measureStability(strongCode)
    expect(result).toBeGreaterThan(30)
  })

  it('all measurements return 0-100 range', () => {
    const fns = [measurePayloadWeight, measureStructuralIntegrity, measureAerodynamics, measureImpactForce, measureStability]
    for (const fn of fns) {
      const result = fn(strongCode)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(100)
    }
  })
})

// ─── Classifications ─────────────────────────────────────────────────────────

describe('catapult classifications', () => {
  it('classifyPayloadType returns dust for plain code', () => {
    expect(classifyPayloadType('const x = 1')).toBe('dust')
  })

  it('classifyPayloadType returns bolt or dart for small exports', () => {
    const result = classifyPayloadType('export const x = 1')
    expect(['bolt', 'dart']).toContain(result)
  })

  it('classifyPayloadType returns bolt for single export', () => {
    expect(classifyPayloadType(simpleExport)).toBe('bolt')
  })

  it('classifyPayloadType returns fireball for async code', () => {
    expect(classifyPayloadType(asyncCode)).toBe('fireball')
  })

  it('classifyPayloadType returns valid type', () => {
    const result = classifyPayloadType(strongCode)
    expect(['boulder', 'fireball', 'grapeshot', 'bolt', 'dart', 'dust']).toContain(result)
  })

  it('classifyWeightClass classifies correctly', () => {
    expect(classifyWeightClass(10)).toBe('featherweight')
    expect(classifyWeightClass(25)).toBe('lightweight')
    expect(classifyWeightClass(45)).toBe('middleweight')
    expect(classifyWeightClass(65)).toBe('heavyweight')
    expect(classifyWeightClass(85)).toBe('super-heavy')
    expect(classifyWeightClass(95)).toBe('overloaded')
  })

  it('classifyCommanderGrade classifies correctly', () => {
    expect(classifyCommanderGrade(80)).toBe('field-marshal')
    expect(classifyCommanderGrade(65)).toBe('general')
    expect(classifyCommanderGrade(50)).toBe('colonel')
    expect(classifyCommanderGrade(35)).toBe('captain')
    expect(classifyCommanderGrade(20)).toBe('sergeant')
    expect(classifyCommanderGrade(8)).toBe('private')
  })

  it('classifyEngineType returns scorpion for empty', () => {
    expect(classifyEngineType([])).toBe('scorpion')
  })

  it('classifyEngineType returns valid type', () => {
    const p = analyzeProjectile(strongCode, 'a.ts')
    const result = classifyEngineType([p])
    expect(['trebuchet', 'mangonel', 'ballista', 'onager', 'scorpion', 'bombard']).toContain(result)
  })

  it('classifySiegeCondition classifies correctly', () => {
    expect(classifySiegeCondition(80)).toBe('battle-ready')
    expect(classifySiegeCondition(60)).toBe('ready')
    expect(classifySiegeCondition(40)).toBe('standing-by')
    expect(classifySiegeCondition(20)).toBe('needs-repair')
    expect(classifySiegeCondition(5)).toBe('broken')
  })

  it('assessLaunchReadiness returns go for high quality', () => {
    const result = assessLaunchReadiness({
      qualityScore: 80,
      stability: 70,
      structuralIntegrity: 75,
      projectile: { hasCracks: false, willHoldTogether: true },
    })
    expect(result).toBe('go')
  })

  it('assessLaunchReadiness returns go-with-caution for decent quality', () => {
    const result = assessLaunchReadiness({
      qualityScore: 55,
      stability: 50,
      structuralIntegrity: 45,
      projectile: { hasCracks: false, willHoldTogether: true },
    })
    expect(result).toBe('go-with-caution')
  })

  it('assessLaunchReadiness returns hold for moderate quality', () => {
    const result = assessLaunchReadiness({
      qualityScore: 35,
      stability: 30,
      structuralIntegrity: 30,
      projectile: { hasCracks: false, willHoldTogether: false },
    })
    expect(result).toBe('hold')
  })

  it('assessLaunchReadiness returns abort for low quality', () => {
    const result = assessLaunchReadiness({
      qualityScore: 20,
      stability: 15,
      structuralIntegrity: 10,
      projectile: { hasCracks: true, willHoldTogether: false },
    })
    expect(result).toBe('abort')
  })

  it('assessLaunchReadiness returns scrub for very low', () => {
    const result = assessLaunchReadiness({
      qualityScore: 5,
      stability: 5,
      structuralIntegrity: 5,
      projectile: { hasCracks: true, willHoldTogether: false },
    })
    expect(result).toBe('scrub')
  })
})

// ─── Sub-Analysis ────────────────────────────────────────────────────────────

describe('catapult sub-analysis', () => {
  it('analyzeArmTension returns complete results', () => {
    const result = analyzeArmTension(strongCode)
    expect(typeof result.buildHealth).toBe('number')
    expect(typeof result.ciReadiness).toBe('number')
    expect(typeof result.dependencyHealth).toBe('number')
    expect(typeof result.hasWeakPoints).toBe('boolean')
    expect(typeof result.weakPointCount).toBe('number')
  })

  it('analyzeArmTension detects weak points in messy code', () => {
    const result = analyzeArmTension(weakCode)
    expect(result.hasWeakPoints).toBe(true)
    expect(result.weakPointCount).toBeGreaterThan(0)
  })

  it('analyzeArmTension values are 0-100', () => {
    const result = analyzeArmTension(strongCode)
    expect(result.buildHealth).toBeGreaterThanOrEqual(0)
    expect(result.buildHealth).toBeLessThanOrEqual(100)
    expect(result.ciReadiness).toBeGreaterThanOrEqual(0)
    expect(result.ciReadiness).toBeLessThanOrEqual(100)
  })

  it('analyzeLaunchAngle returns complete results', () => {
    const result = analyzeLaunchAngle(strongCode)
    expect(typeof result.architectureAlignment).toBe('number')
    expect(typeof result.targetAccuracy).toBe('number')
    expect(typeof result.isOnTarget).toBe('boolean')
    expect(typeof result.deviationDegrees).toBe('number')
  })

  it('analyzeLaunchAngle detects on-target code', () => {
    const result = analyzeLaunchAngle(strongCode)
    expect(result.deviationDegrees).toBeGreaterThanOrEqual(0)
  })

  it('checkReleaseMechanism returns complete results', () => {
    const result = checkReleaseMechanism(strongCode)
    expect(typeof result.hasTests).toBe('boolean')
    expect(typeof result.hasDocs).toBe('boolean')
    expect(typeof result.hasTypes).toBe('boolean')
    expect(typeof result.hasLinting).toBe('boolean')
    expect(typeof result.hasCI).toBe('boolean')
    expect(typeof result.hasVersioning).toBe('boolean')
    expect(typeof result.readinessScore).toBe('number')
    expect(Array.isArray(result.missingChecks)).toBe(true)
  })

  it('checkReleaseMechanism detects docs in strong code', () => {
    const result = checkReleaseMechanism(strongCode)
    expect(result.hasDocs).toBe(true)
    expect(result.hasTypes).toBe(true)
  })

  it('checkReleaseMechanism detects missing checks', () => {
    const result = checkReleaseMechanism(weakCode)
    expect(result.missingChecks.length).toBeGreaterThan(0)
  })

  it('checkReleaseMechanism detects tests in test code', () => {
    const result = checkReleaseMechanism(testCode)
    expect(result.hasTests).toBe(true)
  })

  it('analyzeProjectileIntegrity returns complete results', () => {
    const result = analyzeProjectileIntegrity(strongCode)
    expect(typeof result.cohesion).toBe('number')
    expect(typeof result.hasCracks).toBe('boolean')
    expect(typeof result.hasWeakSpots).toBe('boolean')
    expect(typeof result.hasReinforcement).toBe('boolean')
    expect(typeof result.crackCount).toBe('number')
    expect(typeof result.weakSpotCount).toBe('number')
    expect(typeof result.willHoldTogether).toBe('boolean')
  })

  it('analyzeProjectileIntegrity detects cracks in weak code', () => {
    const result = analyzeProjectileIntegrity(weakCode)
    expect(result.hasCracks).toBe(true)
    expect(result.crackCount).toBeGreaterThan(0)
  })

  it('analyzeProjectileIntegrity detects reinforcement in strong code', () => {
    const result = analyzeProjectileIntegrity(strongCode)
    expect(result.hasReinforcement).toBe(true)
  })

  it('analyzeTrajectory returns complete results', () => {
    const result = analyzeTrajectory(strongCode)
    expect(typeof result.maxHeight).toBe('number')
    expect(typeof result.range).toBe('number')
    expect(typeof result.timeOfFlight).toBe('number')
    expect(typeof result.isStable).toBe('boolean')
    expect(typeof result.isTumbling).toBe('boolean')
    expect(typeof result.willReachTarget).toBe('boolean')
  })

  it('analyzeTrajectory detects tumbling in complex code', () => {
    const result = analyzeTrajectory(weakCode)
    expect(result.isTumbling).toBe(true)
    expect(result.isStable).toBe(false)
  })

  it('analyzeTrajectory detects stable simple code', () => {
    const result = analyzeTrajectory(simpleExport)
    expect(result.isStable).toBe(true)
  })
})

// ─── Projectile Analysis ─────────────────────────────────────────────────────

describe('catapult projectile', () => {
  it('analyzeProjectile returns complete Projectile', () => {
    const result = analyzeProjectile(strongCode, 'calc.ts')
    expect(result.file).toBe('calc.ts')
    expect(typeof result.payloadWeight).toBe('number')
    expect(typeof result.structuralIntegrity).toBe('number')
    expect(typeof result.aerodynamics).toBe('number')
    expect(typeof result.impactForce).toBe('number')
    expect(typeof result.stability).toBe('number')
    expect(typeof result.isReady).toBe('boolean')
    expect(typeof result.qualityScore).toBe('number')
  })

  it('analyzeProjectile includes all sub-analyses', () => {
    const result = analyzeProjectile(strongCode, 'calc.ts')
    expect(result.armTension).toBeDefined()
    expect(result.launchAngle).toBeDefined()
    expect(result.releaseMechanism).toBeDefined()
    expect(result.projectile).toBeDefined()
    expect(result.trajectory).toBeDefined()
  })

  it('analyzeProjectile classifies payload type and weight', () => {
    const result = analyzeProjectile(strongCode, 'calc.ts')
    expect(['boulder', 'fireball', 'grapeshot', 'bolt', 'dart', 'dust']).toContain(result.payloadType)
    expect(['featherweight', 'lightweight', 'middleweight', 'heavyweight', 'super-heavy', 'overloaded']).toContain(result.weightClass)
  })

  it('analyzeProjectile classifies launch readiness', () => {
    const result = analyzeProjectile(strongCode, 'calc.ts')
    expect(['go', 'go-with-caution', 'hold', 'abort', 'scrub']).toContain(result.launchReadiness)
  })

  it('analyzeProjectile qualityScore is 0-100', () => {
    const result = analyzeProjectile(strongCode, 'calc.ts')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
    expect(result.qualityScore).toBeLessThanOrEqual(100)
  })

  it('analyzeProjectile handles empty content', () => {
    const result = analyzeProjectile(emptyCode, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.payloadWeight).toBe(0)
    expect(result.structuralIntegrity).toBe(0)
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzeProjectile strong code is more ready than weak', () => {
    const strong = analyzeProjectile(strongCode, 'strong.ts')
    const weak = analyzeProjectile(weakCode, 'weak.ts')
    expect(strong.qualityScore).toBeGreaterThan(weak.qualityScore)
  })
})

// ─── Siege Engine Analysis ───────────────────────────────────────────────────

describe('catapult siege engine', () => {
  it('analyzeSiegeEngine returns empty engine for no projectiles', () => {
    const result = analyzeSiegeEngine([], 'src')
    expect(result.directory).toBe('src')
    expect(result.projectiles).toEqual([])
    expect(result.avgReadiness).toBe(0)
    expect(result.condition).toBe('broken')
    expect(result.engineType).toBe('scorpion')
  })

  it('analyzeSiegeEngine computes averages', () => {
    const projectiles = [
      analyzeProjectile(strongCode, 'src/a.ts'),
      analyzeProjectile(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeSiegeEngine(projectiles, 'src')
    expect(result.avgReadiness).toBeGreaterThan(0)
    expect(result.avgStructuralIntegrity).toBeGreaterThanOrEqual(0)
    expect(result.avgArmTension).toBeGreaterThanOrEqual(0)
  })

  it('analyzeSiegeEngine counts readiness categories', () => {
    const projectiles = [
      analyzeProjectile(strongCode, 'src/a.ts'),
      analyzeProjectile(simpleExport, 'src/b.ts'),
    ]
    const result = analyzeSiegeEngine(projectiles, 'src')
    expect(typeof result.readyCount).toBe('number')
    expect(typeof result.holdCount).toBe('number')
    expect(typeof result.abortCount).toBe('number')
    expect(typeof result.overloadedCount).toBe('number')
  })

  it('analyzeSiegeEngine classifies engine type and condition', () => {
    const projectiles = [
      analyzeProjectile(strongCode, 'src/a.ts'),
    ]
    const result = analyzeSiegeEngine(projectiles, 'src')
    expect(['trebuchet', 'mangonel', 'ballista', 'onager', 'scorpion', 'bombard']).toContain(result.engineType)
    expect(['battle-ready', 'ready', 'standing-by', 'needs-repair', 'broken']).toContain(result.condition)
  })

  it('analyzeSiegeEngine engineHealth is 0-100', () => {
    const projectiles = [
      analyzeProjectile(strongCode, 'src/a.ts'),
    ]
    const result = analyzeSiegeEngine(projectiles, 'src')
    expect(result.engineHealth).toBeGreaterThanOrEqual(0)
    expect(result.engineHealth).toBeLessThanOrEqual(100)
  })
})

// ─── Recommendations ─────────────────────────────────────────────────────────

describe('catapult recommendations', () => {
  it('generateCatapultRecommendations returns array', () => {
    const stats = { totalCracks: 0, totalWeakSpots: 0, abortCount: 0, scrubCount: 0, overloadedCount: 0, holdCount: 0, isClearForLaunch: true, overallReadiness: 70 } as CatapultStats
    const lp = { overallReadiness: 70 } as LaunchPad
    const recs = generateCatapultRecommendations([], [], lp, stats)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('generateCatapultRecommendations flags cracks', () => {
    const stats = { totalCracks: 5, totalWeakSpots: 0, abortCount: 0, scrubCount: 0, overloadedCount: 0, holdCount: 0, isClearForLaunch: false, overallReadiness: 30 } as CatapultStats
    const lp = {} as LaunchPad
    const recs = generateCatapultRecommendations([], [], lp, stats)
    expect(recs.some(r => r.includes('Cracks'))).toBe(true)
  })

  it('generateCatapultRecommendations flags weak spots', () => {
    const stats = { totalCracks: 0, totalWeakSpots: 8, abortCount: 0, scrubCount: 0, overloadedCount: 0, holdCount: 0, isClearForLaunch: false, overallReadiness: 30 } as CatapultStats
    const lp = {} as LaunchPad
    const recs = generateCatapultRecommendations([], [], lp, stats)
    expect(recs.some(r => r.includes('Weak spots'))).toBe(true)
  })

  it('generateCatapultRecommendations flags overloaded', () => {
    const stats = { totalCracks: 0, totalWeakSpots: 0, abortCount: 0, scrubCount: 0, overloadedCount: 3, holdCount: 0, isClearForLaunch: false, overallReadiness: 30 } as CatapultStats
    const lp = {} as LaunchPad
    const recs = generateCatapultRecommendations([], [], lp, stats)
    expect(recs.some(r => r.includes('Overloaded'))).toBe(true)
  })

  it('generateCatapultRecommendations praises clear launch', () => {
    const stats = { totalCracks: 0, totalWeakSpots: 0, abortCount: 0, scrubCount: 0, overloadedCount: 0, holdCount: 0, isClearForLaunch: true, overallReadiness: 70 } as CatapultStats
    const lp = {} as LaunchPad
    const recs = generateCatapultRecommendations([], [], lp, stats)
    expect(recs.some(r => r.includes('Clear for launch'))).toBe(true)
  })

  it('generateCatapultRecommendations flags no reinforcement', () => {
    const p = analyzeProjectile(weakCode, 'bad.ts')
    const stats = { totalCracks: 0, totalWeakSpots: 0, abortCount: 0, scrubCount: 0, overloadedCount: 0, holdCount: 0, isClearForLaunch: false, overallReadiness: 30 } as CatapultStats
    const lp = {} as LaunchPad
    const recs = generateCatapultRecommendations([p], [], lp, stats)
    if (!p.projectile.hasReinforcement) {
      expect(recs.some(r => r.includes('No reinforcement'))).toBe(true)
    }
  })
})

// ─── Orchestrator ────────────────────────────────────────────────────────────

describe('catapult orchestrator', () => {
  it('buildCatapultResult returns complete result', () => {
    const result = buildCatapultResult(
      ['a.ts', 'b.ts'],
      [strongCode, simpleExport],
      {},
    )
    expect(result.projectiles).toHaveLength(2)
    expect(result.engines).toBeDefined()
    expect(result.launchPad).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('buildCatapultResult handles empty input', () => {
    const result = buildCatapultResult([], [], {})
    expect(result.projectiles).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.overallReadiness).toBeGreaterThanOrEqual(0)
  })

  it('buildCatapultResult computes stats correctly', () => {
    const result = buildCatapultResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.avgPayloadWeight).toBeGreaterThanOrEqual(0)
    expect(result.stats.overallReadiness).toBeGreaterThanOrEqual(0)
  })

  it('buildCatapultResult groups files into engines by directory', () => {
    const result = buildCatapultResult(
      ['src/a.ts', 'src/b.ts', 'test/c.ts'],
      [strongCode, simpleExport, testCode],
      {},
    )
    expect(result.engines.length).toBeGreaterThan(0)
  })

  it('buildCatapultResult stats include all fields', () => {
    const result = buildCatapultResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const s = result.stats
    expect(typeof s.totalFiles).toBe('number')
    expect(typeof s.totalEngines).toBe('number')
    expect(typeof s.avgPayloadWeight).toBe('number')
    expect(typeof s.avgStructuralIntegrity).toBe('number')
    expect(typeof s.avgAerodynamics).toBe('number')
    expect(typeof s.avgStability).toBe('number')
    expect(typeof s.avgArmTension).toBe('number')
    expect(typeof s.avgLaunchAngle).toBe('number')
    expect(typeof s.avgReadinessScore).toBe('number')
    expect(typeof s.goCount).toBe('number')
    expect(typeof s.goWithCautionCount).toBe('number')
    expect(typeof s.holdCount).toBe('number')
    expect(typeof s.abortCount).toBe('number')
    expect(typeof s.scrubCount).toBe('number')
    expect(typeof s.hasTests).toBe('number')
    expect(typeof s.hasDocs).toBe('number')
    expect(typeof s.hasTypes).toBe('number')
    expect(typeof s.totalCracks).toBe('number')
    expect(typeof s.totalWeakSpots).toBe('number')
    expect(typeof s.overloadedCount).toBe('number')
    expect(typeof s.isClearForLaunch).toBe('boolean')
    expect(typeof s.overallReadiness).toBe('number')
    expect(['field-marshal', 'general', 'colonel', 'captain', 'sergeant', 'private']).toContain(s.commanderGrade)
    expect(typeof s.bestProjectile).toBe('string')
    expect(typeof s.worstProjectile).toBe('string')
    expect(typeof s.heaviestPayload).toBe('string')
    expect(typeof s.mostReady).toBe('string')
    expect(typeof s.leastReady).toBe('string')
  })

  it('buildCatapultResult launchPad is complete', () => {
    const result = buildCatapultResult(
      ['a.ts'],
      [strongCode],
      {},
    )
    const lp = result.launchPad
    expect(typeof lp.overallReadiness).toBe('number')
    expect(typeof lp.avgArmTension).toBe('number')
    expect(typeof lp.avgLaunchAngle).toBe('number')
    expect(typeof lp.avgStructuralIntegrity).toBe('number')
    expect(typeof lp.goCount).toBe('number')
    expect(typeof lp.holdCount).toBe('number')
    expect(typeof lp.abortCount).toBe('number')
    expect(typeof lp.isClearForLaunch).toBe('boolean')
    expect(['now', 'soon', 'delayed', 'indefinitely', 'never']).toContain(lp.launchWindow)
  })
})

// ─── Format Helpers ──────────────────────────────────────────────────────────

describe('catapult format helpers', () => {
  const sampleResult = buildCatapultResult(
    ['a.ts', 'b.ts'],
    [strongCode, simpleExport],
    {},
  )

  it('formatCatapultTable returns string with header', () => {
    const output = formatCatapultTable(sampleResult, false)
    expect(typeof output).toBe('string')
    expect(output).toContain('Catapult')
  })

  it('formatCatapultTable includes projectiles section', () => {
    const output = formatCatapultTable(sampleResult, false)
    expect(output).toContain('Projectiles')
  })

  it('formatCatapultTable includes launch pad section', () => {
    const output = formatCatapultTable(sampleResult, false)
    expect(output).toContain('Launch Pad')
  })

  it('formatCatapultTable includes statistics section', () => {
    const output = formatCatapultTable(sampleResult, false)
    expect(output).toContain('Statistics')
  })

  it('formatCatapultTable shows grade', () => {
    const output = formatCatapultTable(sampleResult, false)
    expect(output).toContain('Grade')
  })

  it('formatCatapultTable verbose shows more detail', () => {
    const verbose = formatCatapultTable(sampleResult, true)
    const normal = formatCatapultTable(sampleResult, false)
    expect(verbose.length).toBeGreaterThanOrEqual(normal.length)
  })

  it('formatCatapultTable handles empty results', () => {
    const emptyResult = buildCatapultResult([], [], {})
    const output = formatCatapultTable(emptyResult, false)
    expect(output).toContain('No files analyzed')
  })

  it('formatCatapultTable shows engines when present', () => {
    const result = buildCatapultResult(
      ['src/a.ts', 'src/b.ts'],
      [strongCode, simpleExport],
      {},
    )
    const output = formatCatapultTable(result, false)
    expect(output).toContain('Siege Engines')
  })

  it('formatCatapultJson returns valid JSON', () => {
    const output = formatCatapultJson(sampleResult)
    const parsed = JSON.parse(output)
    expect(parsed.projectiles).toHaveLength(2)
    expect(parsed.stats).toBeDefined()
    expect(parsed.launchPad).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })

  it('formatCatapultJson handles empty results', () => {
    const emptyResult = buildCatapultResult([], [], {})
    const output = formatCatapultJson(emptyResult)
    const parsed = JSON.parse(output)
    expect(parsed.projectiles).toHaveLength(0)
  })

  it('formatCatapultTable truncates long lists', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildCatapultResult(files, contents, {})
    const output = formatCatapultTable(result, false)
    expect(output).toContain('... and')
  })

  it('formatCatapultTable verbose shows all projectiles', () => {
    const files = Array.from({ length: 20 }, (_, i) => `file${i}.ts`)
    const contents = files.map(() => simpleExport)
    const result = buildCatapultResult(files, contents, {})
    const output = formatCatapultTable(result, true)
    expect(output).toContain('file19.ts')
  })
})
