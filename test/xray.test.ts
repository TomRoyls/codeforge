import { describe, expect, it } from 'vitest'

import {
  buildXrayResult,
  classifyBone,
  computeJointFlexibility,
  computeSkeletonStrength,
  computeStructuralHealth,
  detectHiddenDependencies,
  detectHiddenDuplication,
  detectImplicitContracts,
  generateXrayRecommendations,
  identifyBones,
  type ImplicitContract,
  type XrayBone,
  type XrayStats,
} from '../src/commands/xray-helpers.js'

import {
  formatBoneDiagram,
  formatContractTable,
  formatDuplicationHeatmap,
  formatHealthMeter,
  formatHiddenDepGraph,
  formatXrayJSON,
  formatXrayRecommendations,
  formatXrayStats,
  formatXrayTable,
  getBoneColor,
  getBoneSymbol,
} from '../src/commands/xray-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const SKELETON_CONTENT = `import { Command } from '@oclif/core'
import chalk from 'chalk'

export async function main(config: Config): Promise<void> {
  console.log('starting')
  if (config.debug) console.log('debug mode')
}

export default class App {
  run() {}
}
`

const MUSCLE_CONTENT = `import { processFile } from './processor'
import { validate } from './validator'

export function executeTask(task: Task): string {
  try {
    const validated = validate(task)
    return processFile(validated)
  } catch (error) {
    if (error instanceof Error) throw error
    return 'failed'
  }
}

export function transformData(input: string): string {
  return input.trim().toLowerCase()
}
`

const JOINT_CONTENT = `export interface Config {
  debug?: boolean
  verbose?: boolean
}

export type Task = {
  name: string
  priority: number
}

export type Result = {
  success: boolean
  data?: string
}
`

const NERVE_CONTENT = `export function emitEvent(name: string, data: unknown): void {
  console.log('event:', name, data)
}

export function subscribe(event: string, callback: Function): void {
  console.log('subscribed to', event)
}

export function onNotification(handler: Function): void {
  handler({})
}
`

const VEIN_CONTENT = `export function pipe<T>(...transforms: Function[]): (input: T) => T {
  return (input: T) => transforms.reduce((acc, fn) => fn(acc), input)
}

export function streamData(source: string): string {
  return source.split('\\n').map(transform).filter(Boolean).join('\\n')
}

function transform(line: string): string {
  return line.trim()
}
`

const ENV_CONTENT = `const dbUrl = process.env.DATABASE_URL
const apiKey = process.env.API_KEY
const port = process.env.PORT
`

const GLOBAL_CONTENT = `globalThis.cache = {}
global.__state = { initialized: false }
`

const EMPTY_CONTENT = ''

// ─── classifyBone ─────────────────────────────────────────────────────────────

describe('classifyBone', () => {
  it('classifies index files as skeleton', () => {
    expect(classifyBone('index.ts', 'export {}')).toBe('skeleton')
  })

  it('classifies main files as skeleton', () => {
    expect(classifyBone('main.ts', 'export {}')).toBe('skeleton')
  })

  it('classifies app files as skeleton', () => {
    expect(classifyBone('app.ts', 'export {}')).toBe('skeleton')
  })

  it('classifies event files as nerve', () => {
    expect(classifyBone('events.ts', 'export {}')).toBe('nerve')
  })

  it('classifies hook files as nerve', () => {
    expect(classifyBone('hooks.ts', 'export {}')).toBe('nerve')
  })

  it('classifies pipe files as vein', () => {
    expect(classifyBone('pipeline.ts', 'export {}')).toBe('vein')
  })

  it('classifies stream files as vein', () => {
    expect(classifyBone('stream.ts', 'export {}')).toBe('vein')
  })

  it('classifies interface files as joint', () => {
    expect(classifyBone('interfaces.ts', 'export {}')).toBe('joint')
  })

  it('classifies type-only exports as joint', () => {
    expect(classifyBone('types.ts', 'export interface Foo {}')).toBe('joint')
  })

  it('classifies regular files as muscle', () => {
    expect(classifyBone('processor.ts', 'export function process() {}')).toBe('muscle')
  })

  it('classifies generic file as muscle by default', () => {
    expect(classifyBone('utils.ts', 'const x = 1')).toBe('muscle')
  })
})

// ─── identifyBones ────────────────────────────────────────────────────────────

describe('identifyBones', () => {
  it('groups files by bone type', () => {
    const bones = identifyBones(
      ['index.ts', 'processor.ts', 'types.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT, JOINT_CONTENT],
    )
    const types = bones.map((b) => b.type)
    expect(types).toContain('skeleton')
    expect(types).toContain('muscle')
    expect(types).toContain('joint')
  })

  it('assigns files to correct bone', () => {
    const bones = identifyBones(['index.ts'], [SKELETON_CONTENT])
    const skel = bones.find((b) => b.type === 'skeleton')!
    expect(skel.files).toContain('index.ts')
  })

  it('computes strength', () => {
    const bones = identifyBones(['index.ts'], [SKELETON_CONTENT])
    expect(bones[0]!.strength).toBeGreaterThan(0)
    expect(bones[0]!.strength).toBeLessThanOrEqual(100)
  })

  it('returns empty for no files', () => {
    expect(identifyBones([], [])).toEqual([])
  })

  it('includes descriptions', () => {
    const bones = identifyBones(['index.ts'], [SKELETON_CONTENT])
    expect(bones[0]!.description).toBeTruthy()
  })
})

// ─── computeSkeletonStrength ──────────────────────────────────────────────────

describe('computeSkeletonStrength', () => {
  it('returns 0 for no skeleton', () => {
    const bones: XrayBone[] = [{ name: 'muscle', type: 'muscle', files: ['a.ts'], strength: 50, description: '' }]
    expect(computeSkeletonStrength(bones)).toBe(0)
  })

  it('returns strength for skeleton', () => {
    const bones: XrayBone[] = [{ name: 'skeleton', type: 'skeleton', files: ['index.ts'], strength: 40, description: '' }]
    const strength = computeSkeletonStrength(bones)
    expect(strength).toBeGreaterThan(0)
  })

  it('caps at 100', () => {
    const bones: XrayBone[] = [{ name: 'skeleton', type: 'skeleton', files: ['a.ts', 'b.ts', 'c.ts'], strength: 90, description: '' }]
    expect(computeSkeletonStrength(bones)).toBeLessThanOrEqual(100)
  })
})

// ─── computeJointFlexibility ──────────────────────────────────────────────────

describe('computeJointFlexibility', () => {
  it('returns 0 for no joints', () => {
    const bones: XrayBone[] = [{ name: 'muscle', type: 'muscle', files: ['a.ts'], strength: 50, description: '' }]
    expect(computeJointFlexibility(bones)).toBe(0)
  })

  it('returns flexibility for joints', () => {
    const bones: XrayBone[] = [{ name: 'joint', type: 'joint', files: ['types.ts', 'iface.ts'], strength: 30, description: '' }]
    const flex = computeJointFlexibility(bones)
    expect(flex).toBeGreaterThan(0)
  })
})

// ─── detectImplicitContracts ──────────────────────────────────────────────────

describe('detectImplicitContracts', () => {
  it('detects error-type contracts', () => {
    const contracts = detectImplicitContracts(
      ['thrower.ts', 'catcher.ts'],
      ['throw new Error("fail")', 'try {} catch (e) {}'],
    )
    const errorContract = contracts.find((c) => c.type === 'error-type')
    expect(errorContract).toBeDefined()
  })

  it('detects side-effect contracts', () => {
    const contracts = detectImplicitContracts(
      ['a.ts', 'b.ts'],
      ['console.log("a")', 'console.log("b")'],
    )
    const sideEffect = contracts.find((c) => c.type === 'side-effect')
    expect(sideEffect).toBeDefined()
  })

  it('detects return-format contracts', () => {
    const contracts = detectImplicitContracts(
      ['async.ts', 'awaiter.ts'],
      ['async function fetch() {}', 'const x = await fetch()'],
    )
    const returnFmt = contracts.find((c) => c.type === 'return-format')
    expect(returnFmt).toBeDefined()
  })

  it('detects data-shape contracts from env', () => {
    const contracts = detectImplicitContracts(
      ['a.ts', 'b.ts'],
      ['const x = process.env.X', 'const y = process.env.X'],
    )
    const dataShape = contracts.find((c) => c.type === 'data-shape')
    expect(dataShape).toBeDefined()
    expect(dataShape!.risk).toBe('high')
  })

  it('returns empty for no contracts', () => {
    expect(detectImplicitContracts(['a.ts'], ['const x = 1'])).toEqual([])
  })
})

// ─── detectHiddenDuplication ──────────────────────────────────────────────────

describe('detectHiddenDuplication', () => {
  it('detects console logging duplication', () => {
    const dups = detectHiddenDuplication(
      ['a.ts', 'b.ts'],
      ['console.log("a")', 'console.log("b")'],
    )
    const consoleDup = dups.find((d) => d.pattern === 'console logging')
    expect(consoleDup).toBeDefined()
    expect(consoleDup!.files.length).toBe(2)
  })

  it('requires 2+ files for duplication', () => {
    const dups = detectHiddenDuplication(
      ['a.ts'],
      ['console.log("a")'],
    )
    expect(dups.length).toBe(0)
  })

  it('computes similarity', () => {
    const dups = detectHiddenDuplication(
      ['a.ts', 'b.ts'],
      ['console.log("a")', 'console.log("b")'],
    )
    for (const d of dups) {
      expect(d.similarity).toBeGreaterThan(0)
      expect(d.similarity).toBeLessThanOrEqual(100)
    }
  })

  it('classifies duplication type', () => {
    const dups = detectHiddenDuplication(
      ['a.ts', 'b.ts'],
      ['console.log("a")', 'console.log("b")'],
    )
    expect(dups.some((d) => d.type === 'data')).toBe(true)
  })

  it('returns empty for no duplication', () => {
    const dups = detectHiddenDuplication(['a.ts'], ['const x = 1'])
    expect(dups.length).toBe(0)
  })
})

// ─── detectHiddenDependencies ─────────────────────────────────────────────────

describe('detectHiddenDependencies', () => {
  it('detects env-var dependencies', () => {
    const deps = detectHiddenDependencies(
      ['a.ts', 'b.ts'],
      ['const x = process.env.API_KEY', 'const y = process.env.API_KEY'],
    )
    const envDep = deps.find((d) => d.type === 'env-var')
    expect(envDep).toBeDefined()
    expect(envDep!.dependency).toBe('process.env.API_KEY')
  })

  it('detects file-path dependencies', () => {
    const deps = detectHiddenDependencies(
      ['a.ts'],
      ["import { x } from './helper.ts'"],
    )
    const fileDep = deps.find((d) => d.type === 'file-path')
    expect(fileDep).toBeDefined()
  })

  it('detects global mutations', () => {
    const deps = detectHiddenDependencies(['a.ts'], [GLOBAL_CONTENT])
    const globalDep = deps.find((d) => d.type === 'global')
    expect(globalDep).toBeDefined()
    expect(globalDep!.risk).toBe('high')
  })

  it('returns empty for clean code', () => {
    expect(detectHiddenDependencies(['a.ts'], ['const x = 1'])).toEqual([])
  })

  it('marks high-risk for many files sharing env', () => {
    const deps = detectHiddenDependencies(
      ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'],
      ['process.env.X', 'process.env.X', 'process.env.X', 'process.env.X', 'process.env.X'],
    )
    const envDep = deps.find((d) => d.type === 'env-var')
    expect(envDep!.risk).toBe('high')
  })
})

// ─── computeStructuralHealth ──────────────────────────────────────────────────

describe('computeStructuralHealth', () => {
  it('returns 100 for clean codebase', () => {
    const bones: XrayBone[] = [{ name: 'skeleton', type: 'skeleton', files: ['index.ts'], strength: 80, description: '' }]
    expect(computeStructuralHealth(bones, [], [], [])).toBe(100)
  })

  it('penalizes missing skeleton', () => {
    const bones: XrayBone[] = [{ name: 'muscle', type: 'muscle', files: ['a.ts'], strength: 50, description: '' }]
    expect(computeStructuralHealth(bones, [], [], [])).toBeLessThan(100)
  })

  it('penalizes high-risk contracts', () => {
    const bones: XrayBone[] = [{ name: 'skeleton', type: 'skeleton', files: ['index.ts'], strength: 80, description: '' }]
    const contracts: ImplicitContract[] = [{ between: ['a.ts', 'b.ts'], type: 'data-shape', description: '', risk: 'high', evidence: '' }]
    expect(computeStructuralHealth(bones, contracts, [], [])).toBeLessThan(100)
  })

  it('penalizes high-risk deps', () => {
    const bones: XrayBone[] = [{ name: 'skeleton', type: 'skeleton', files: ['index.ts'], strength: 80, description: '' }]
    const health = computeStructuralHealth(bones, [], [], [{ from: 'a.ts', to: 'b.ts', type: 'global', dependency: 'x', risk: 'high' }])
    expect(health).toBeLessThan(100)
  })

  it('never goes below 0', () => {
    const bones: XrayBone[] = []
    const contracts = Array.from({ length: 30 }, (): ImplicitContract => ({ between: ['a.ts', 'b.ts'], type: 'data-shape', description: '', risk: 'high', evidence: '' }))
    expect(computeStructuralHealth(bones, contracts, [], [])).toBeGreaterThanOrEqual(0)
  })
})

// ─── generateXrayRecommendations ──────────────────────────────────────────────

describe('generateXrayRecommendations', () => {
  it('warns about weak skeleton', () => {
    const stats = { skeletonStrength: 20 } as XrayStats
    const recs = generateXrayRecommendations(stats, [], [], [])
    expect(recs.some((r) => r.includes('skeleton'))).toBe(true)
  })

  it('warns about high-risk contracts', () => {
    const stats = { highRiskContracts: 3, skeletonStrength: 80 } as XrayStats
    const recs = generateXrayRecommendations(stats, [], [], [])
    expect(recs.some((r) => r.includes('contract'))).toBe(true)
  })

  it('warns about duplications', () => {
    const stats = { highRiskContracts: 0, skeletonStrength: 80 } as XrayStats
    const dups = [{ pattern: 'test', files: ['a.ts'], similarity: 80, lines: 5, type: 'structural' as const }]
    const recs = generateXrayRecommendations(stats, [], dups, [])
    expect(recs.some((r) => r.includes('duplication'))).toBe(true)
  })

  it('warns about high-risk deps', () => {
    const stats = { highRiskContracts: 0, skeletonStrength: 80, highRiskDeps: 2 } as XrayStats
    const recs = generateXrayRecommendations(stats, [], [], [])
    expect(recs.some((r) => r.includes('dependency'))).toBe(true)
  })

  it('praises clean codebase', () => {
    const stats = { highRiskContracts: 0, skeletonStrength: 80, highRiskDeps: 0, structuralHealth: 85 } as XrayStats
    const recs = generateXrayRecommendations(stats, [], [], [])
    expect(recs.some((r) => r.includes('good'))).toBe(true)
  })
})

// ─── buildXrayResult ──────────────────────────────────────────────────────────

describe('buildXrayResult', () => {
  it('builds result from files', () => {
    const result = buildXrayResult(
      ['index.ts', 'processor.ts', 'types.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT, JOINT_CONTENT],
    )
    expect(result.bones.length).toBeGreaterThan(0)
    expect(result.stats.boneCount).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildXrayResult([], [])
    expect(result.bones).toEqual([])
    expect(result.contracts).toEqual([])
    expect(result.duplications).toEqual([])
    expect(result.hiddenDeps).toEqual([])
    expect(result.stats.structuralHealth).toBe(80)
  })

  it('computes correct stats', () => {
    const result = buildXrayResult(
      ['index.ts', 'processor.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT],
    )
    expect(result.stats.skeletonStrength).toBeGreaterThan(0)
    expect(result.stats.structuralHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.structuralHealth).toBeLessThanOrEqual(100)
  })

  it('detects contracts across files', () => {
    const result = buildXrayResult(
      ['thrower.ts', 'catcher.ts'],
      ['throw new Error("fail")', 'try {} catch (e) {}'],
    )
    expect(result.contracts.length).toBeGreaterThan(0)
  })

  it('detects env dependencies', () => {
    const result = buildXrayResult(
      ['a.ts', 'b.ts'],
      ['const x = process.env.KEY', 'const y = process.env.KEY'],
    )
    const envDeps = result.hiddenDeps.filter((d) => d.type === 'env-var')
    expect(envDeps.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const result = buildXrayResult(['index.ts'], [SKELETON_CONTENT])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles all bone types', () => {
    const result = buildXrayResult(
      ['index.ts', 'processor.ts', 'types.ts', 'events.ts', 'pipeline.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT, JOINT_CONTENT, NERVE_CONTENT, VEIN_CONTENT],
    )
    const types = result.bones.map((b) => b.type)
    expect(types).toContain('skeleton')
    expect(types).toContain('muscle')
    expect(types).toContain('joint')
    expect(types).toContain('nerve')
    expect(types).toContain('vein')
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getBoneSymbol', () => {
  it('returns unique symbol per type', () => {
    const symbols = new Set(['skeleton', 'joint', 'muscle', 'nerve', 'vein'].map(getBoneSymbol))
    expect(symbols.size).toBe(5)
  })
})

describe('getBoneColor', () => {
  it('returns function for all types', () => {
    expect(typeof getBoneColor('skeleton')).toBe('function')
    expect(typeof getBoneColor('muscle')).toBe('function')
  })
})

describe('formatBoneDiagram', () => {
  it('formats diagram', () => {
    const result = buildXrayResult(['index.ts'], [SKELETON_CONTENT])
    const output = formatBoneDiagram(result.bones)
    expect(output).toContain('Skeletal Structure')
  })

  it('handles empty', () => {
    expect(formatBoneDiagram([])).toContain('No bones')
  })
})

describe('formatContractTable', () => {
  it('formats contracts', () => {
    const contracts: ImplicitContract[] = [{ between: ['a.ts', 'b.ts'], type: 'error-type', description: 'test', risk: 'medium', evidence: 'ev' }]
    const output = formatContractTable(contracts)
    expect(output).toContain('Implicit Contracts')
  })

  it('handles empty', () => {
    expect(formatContractTable([])).toContain('No implicit contracts')
  })
})

describe('formatDuplicationHeatmap', () => {
  it('formats heatmap', () => {
    const dups = [{ pattern: 'console', files: ['a.ts', 'b.ts'], similarity: 80, lines: 3, type: 'data' as const }]
    const output = formatDuplicationHeatmap(dups)
    expect(output).toContain('Duplication Heatmap')
  })

  it('handles empty', () => {
    expect(formatDuplicationHeatmap([])).toContain('No hidden duplications')
  })
})

describe('formatHiddenDepGraph', () => {
  it('formats deps', () => {
    const deps = [{ from: 'a.ts', to: 'b.ts', type: 'env-var' as const, dependency: 'process.env.X', risk: 'medium' as const }]
    const output = formatHiddenDepGraph(deps)
    expect(output).toContain('Hidden Dependencies')
  })

  it('handles empty', () => {
    expect(formatHiddenDepGraph([])).toContain('No hidden dependencies')
  })
})

describe('formatHealthMeter', () => {
  it('formats meter', () => {
    const output = formatHealthMeter(75)
    expect(output).toContain('Structural Health')
    expect(output).toContain('75%')
  })
})

describe('formatXrayStats', () => {
  it('formats stats', () => {
    const stats: XrayStats = {
      boneCount: 5, skeletonStrength: 80, jointFlexibility: 60,
      implicitContracts: 3, highRiskContracts: 1, hiddenDuplications: 2,
      totalDuplicationLines: 10, hiddenDependencyCount: 4, highRiskDeps: 1,
      structuralHealth: 75,
    }
    const output = formatXrayStats(stats)
    expect(output).toContain('5')
    expect(output).toContain('75%')
  })
})

describe('formatXrayRecommendations', () => {
  it('formats recommendations', () => {
    const output = formatXrayRecommendations(['Fix this'])
    expect(output).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatXrayRecommendations([])).toContain('No recommendations')
  })
})

describe('formatXrayTable', () => {
  it('formats full table', () => {
    const result = buildXrayResult(['index.ts'], [SKELETON_CONTENT])
    const output = formatXrayTable(result)
    expect(output).toContain('Code X-Ray')
    expect(output).toContain('Skeletal Structure')
    expect(output).toContain('Structural Health')
  })
})

describe('formatXrayJSON', () => {
  it('formats valid JSON', () => {
    const result = buildXrayResult(['index.ts'], [SKELETON_CONTENT])
    const json = formatXrayJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.bones).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes a realistic codebase', () => {
    const result = buildXrayResult(
      ['src/index.ts', 'src/processor.ts', 'src/types.ts', 'src/events.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT, JOINT_CONTENT, NERVE_CONTENT],
    )
    expect(result.bones.length).toBeGreaterThanOrEqual(3)
    expect(result.stats.boneCount).toBeGreaterThanOrEqual(3)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('round-trips through JSON', () => {
    const result = buildXrayResult(
      ['index.ts', 'processor.ts'],
      [SKELETON_CONTENT, MUSCLE_CONTENT],
    )
    const json = formatXrayJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.bones.length).toBe(result.bones.length)
    expect(parsed.stats.structuralHealth).toBe(result.stats.structuralHealth)
  })
})
