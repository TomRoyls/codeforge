import { describe, it, expect } from 'vitest'
import {
  measureEmptying,
  measureStructuring,
  measureSilencing,
  measureFloating,
  measureTranscending,
  classifySpireCondition,
  classifyVoidType,
  classifyVoidCondition,
  classifyArchitectGrade,
  analyzeVoidSpire,
  analyzeCathedralVoid,
  buildVoidCathedralResult,
  generateRecommendations,
} from '../src/commands/void-cathedral-helpers.js'
import {
  colorScore,
  colorGrade,
  formatSpireTable,
  formatSpiresTable,
  formatVoidTable,
  formatVoidsTable,
  formatStatsTable,
  formatRecommendations,
  formatResultTable,
  formatResultJson,
} from '../src/commands/void-cathedral-format-helpers.js'
import type {
  VoidSpire,
  VoidCathedralStats,
  VoidCathedralResult,
  CosmosSummary,
} from '../src/commands/void-cathedral-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────

const emptyContent = ''

const minimalContent = `const x = 1`

const moderateContent = `
import { foo } from 'bar'
export interface User {
  name: string
  age: number
}
export type UserRole = 'admin' | 'user'
export function getUser(id: string): User | null {
  if (id === '1') return { name: 'test', age: 20 }
  return null
}
const users: User[] = []
`

const richContent = `
import { z } from 'zod'
import type { Config } from './config.js'

/**
 * User configuration interface
 */
export interface UserConfig {
  readonly name: string
  readonly age: number
  readonly role: UserRole
  nickname?: string
}

export type UserRole = 'admin' | 'user' | 'moderator'
export type Maybe<T> = T | null

/**
 * Create a new user with validation
 */
export async function createUser(input: string): Promise<UserConfig> {
  const config: Config = JSON.parse(input)
  if (config.name === undefined || config.name === null) {
    throw new Error('Name required')
  }
  try {
    const validated = validateUser(config)
    return validated
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message)
    }
    throw error
  }
}

function validateUser(user: Config): UserConfig {
  return {
    name: user.name ?? 'unknown',
    age: user.age ?? 0,
    role: user.role ?? 'user',
  }
}

export class UserService {
  private users: Map<string, UserConfig> = new Map()

  getUser(id: string): UserConfig | undefined {
    return this.users.get(id)
  }
}

const defaultConfig: UserConfig = {
  name: 'default',
  age: 25,
  role: 'user',
}
`

const poorContent = `var x = eval("1 + 2")
debugger
any thing = x
var y = eval("3 + 4")
`

// ─── measureEmptying ────────────────────────────────────────────────

describe('measureEmptying', () => {
  it('returns valid EmptyingMeasure for empty content', () => {
    const result = measureEmptying(emptyContent)
    expect(result.elegance).toBeGreaterThanOrEqual(0)
    expect(result.elegance).toBeLessThanOrEqual(100)
    expect(typeof result.grade).toBe('string')
    expect(result.hasHighElegance).toBe(false)
    expect(result.verboseCount).toBe(0)
    expect(result.redundantCount).toBe(0)
    expect(result.hasNoVerbose).toBe(true)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureEmptying(emptyContent)
    const rich = measureEmptying(richContent)
    expect(rich.elegance).toBeGreaterThan(empty.elegance)
  })

  it('detects concise in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasConcise).toBe(true)
  })

  it('detects minimal in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasMinimal).toBe(true)
  })

  it('detects essential in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasEssential).toBe(true)
  })

  it('detects clean in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasClean).toBe(true)
  })

  it('detects sparse in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasSparse).toBe(true)
  })

  it('detects refined in rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasRefined).toBe(true)
  })

  it('detects high elegance for rich content', () => {
    const result = measureEmptying(richContent)
    expect(result.hasHighElegance).toBe(true)
  })

  it('grades empty content as no-void', () => {
    expect(measureEmptying(emptyContent).grade).toBe('no-void')
  })

  it('counts verbose (var) in poor content', () => {
    const result = measureEmptying(poorContent)
    expect(result.verboseCount).toBeGreaterThan(0)
    expect(result.hasNoVerbose).toBe(false)
  })

  it('counts redundant (any) in poor content', () => {
    const result = measureEmptying(poorContent)
    expect(result.redundantCount).toBeGreaterThan(0)
    expect(result.hasNoRedundant).toBe(false)
  })
})

// ─── measureStructuring ────────────────────────────────────────────

describe('measureStructuring', () => {
  it('returns valid StructuringMeasure for empty content', () => {
    const result = measureStructuring(emptyContent)
    expect(result.sacred).toBeGreaterThanOrEqual(0)
    expect(result.sacred).toBeLessThanOrEqual(100)
    expect(typeof result.structure).toBe('string')
    expect(result.scatteredCount).toBe(0)
    expect(result.flatCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureStructuring(emptyContent)
    const rich = measureStructuring(richContent)
    expect(rich.sacred).toBeGreaterThan(empty.sacred)
  })

  it('detects well organized in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasWellOrganized).toBe(true)
  })

  it('detects logical flow in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasLogicalFlow).toBe(true)
  })

  it('detects hierarchical in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasHierarchical).toBe(true)
  })

  it('detects symmetrical in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasSymmetrical).toBe(true)
  })

  it('detects proportioned in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasProportioned).toBe(true)
  })

  it('detects harmonious in rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasHarmonious).toBe(true)
  })

  it('detects high sacred for rich content', () => {
    const result = measureStructuring(richContent)
    expect(result.hasHighSacred).toBe(true)
  })

  it('grades empty content as no-structure', () => {
    expect(measureStructuring(emptyContent).structure).toBe('no-structure')
  })

  it('counts scattered (var) in poor content', () => {
    const result = measureStructuring(poorContent)
    expect(result.scatteredCount).toBeGreaterThan(0)
    expect(result.hasNoScattered).toBe(false)
  })
})

// ─── measureSilencing ──────────────────────────────────────────────

describe('measureSilencing', () => {
  it('returns valid SilencingMeasure for empty content', () => {
    const result = measureSilencing(emptyContent)
    expect(result.wisdom).toBeGreaterThanOrEqual(0)
    expect(result.wisdom).toBeLessThanOrEqual(100)
    expect(typeof result.silence).toBe('string')
    expect(result.commentsNeededCount).toBe(0)
    expect(result.unreadableCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureSilencing(emptyContent)
    const rich = measureSilencing(richContent)
    expect(rich.wisdom).toBeGreaterThan(empty.wisdom)
  })

  it('detects self documenting in rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasSelfDocumenting).toBe(true)
  })

  it('detects descriptive in rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasDescriptive).toBe(true)
  })

  it('detects expressive in rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasExpressive).toBe(true)
  })

  it('detects clear intent in rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasClearIntent).toBe(true)
  })

  it('detects obvious in rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasObvious).toBe(true)
  })

  it('detects high wisdom for rich content', () => {
    const result = measureSilencing(richContent)
    expect(result.hasHighWisdom).toBe(true)
  })

  it('grades empty content as babble', () => {
    expect(measureSilencing(emptyContent).silence).toBe('babble')
  })

  it('counts comments needed (var) in poor content', () => {
    const result = measureSilencing(poorContent)
    expect(result.commentsNeededCount).toBeGreaterThan(0)
    expect(result.hasNoCommentsNeeded).toBe(false)
  })
})

// ─── measureFloating ───────────────────────────────────────────────

describe('measureFloating', () => {
  it('returns valid FloatingMeasure for empty content', () => {
    const result = measureFloating(emptyContent)
    expect(result.ethereal).toBeGreaterThanOrEqual(0)
    expect(result.ethereal).toBeLessThanOrEqual(100)
    expect(typeof result.foundation).toBe('string')
    expect(result.heavyDependencyCount).toBe(0)
    expect(result.wastefulCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureFloating(emptyContent)
    const rich = measureFloating(richContent)
    expect(rich.ethereal).toBeGreaterThan(empty.ethereal)
  })

  it('detects lightweight in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasLightweight).toBe(true)
  })

  it('detects efficient in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasEfficient).toBe(true)
  })

  it('detects composable in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasComposable).toBe(true)
  })

  it('detects portable in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasPortable).toBe(true)
  })

  it('detects modular in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasModular).toBe(true)
  })

  it('detects no heavy dependencies in rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasNoHeavyDependencies).toBe(true)
  })

  it('detects high ethereal for rich content', () => {
    const result = measureFloating(richContent)
    expect(result.hasHighEthereal).toBe(true)
  })

  it('grades empty content as no-foundation', () => {
    expect(measureFloating(emptyContent).foundation).toBe('no-foundation')
  })

  it('counts heavy dependencies (var) in poor content', () => {
    const result = measureFloating(poorContent)
    expect(result.heavyDependencyCount).toBeGreaterThan(0)
  })
})

// ─── measureTranscending ───────────────────────────────────────────

describe('measureTranscending', () => {
  it('returns valid TranscendingMeasure for empty content', () => {
    const result = measureTranscending(emptyContent)
    expect(result.clarity).toBeGreaterThanOrEqual(0)
    expect(result.clarity).toBeLessThanOrEqual(100)
    expect(typeof result.transcendence).toBe('string')
    expect(result.rereadingNeededCount).toBe(0)
    expect(result.counterintuitiveCount).toBe(0)
  })

  it('scores rich content higher than empty', () => {
    const empty = measureTranscending(emptyContent)
    const rich = measureTranscending(richContent)
    expect(rich.clarity).toBeGreaterThan(empty.clarity)
  })

  it('detects immediately clear in rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasImmediatelyClear).toBe(true)
  })

  it('detects intuitive in rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasIntuitive).toBe(true)
  })

  it('detects predictable in rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasPredictable).toBe(true)
  })

  it('detects consistent in rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasConsistent).toBe(true)
  })

  it('detects flowing in rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasFlowing).toBe(true)
  })

  it('detects high clarity for rich content', () => {
    const result = measureTranscending(richContent)
    expect(result.hasHighClarity).toBe(true)
  })

  it('grades empty content as oblivion', () => {
    expect(measureTranscending(emptyContent).transcendence).toBe('oblivion')
  })

  it('counts rereading needed (var) in poor content', () => {
    const result = measureTranscending(poorContent)
    expect(result.rereadingNeededCount).toBeGreaterThan(0)
  })

  it('counts counterintuitive (any) in poor content', () => {
    const result = measureTranscending(poorContent)
    expect(result.counterintuitiveCount).toBeGreaterThan(0)
  })
})

// ─── classifySpireCondition ─────────────────────────────────────────

describe('classifySpireCondition', () => {
  it('classifies 90 as void-masterpiece', () => expect(classifySpireCondition(90)).toBe('void-masterpiece'))
  it('classifies 75 as ethereal-spire', () => expect(classifySpireCondition(75)).toBe('ethereal-spire'))
  it('classifies 60 as proper-chapel', () => expect(classifySpireCondition(60)).toBe('proper-chapel'))
  it('classifies 45 as stone-church', () => expect(classifySpireCondition(45)).toBe('stone-church'))
  it('classifies 30 as ruined-shrine', () => expect(classifySpireCondition(30)).toBe('ruined-shrine'))
  it('classifies 10 as dust', () => expect(classifySpireCondition(10)).toBe('dust'))
  it('classifies 0 as dust', () => expect(classifySpireCondition(0)).toBe('dust'))
  it('classifies 85 as void-masterpiece', () => expect(classifySpireCondition(85)).toBe('void-masterpiece'))
})

// ─── classifyVoidType ──────────────────────────────────────────────

describe('classifyVoidType', () => {
  it('returns no-void for empty spires', () => {
    expect(classifyVoidType([])).toBe('no-void')
  })

  it('returns cosmic-void for high quality masterpiece majority', () => {
    const spires: VoidSpire[] = Array.from({ length: 4 }, (_, i) => ({
      file: `file${i}.ts`,
      emptinessElegance: 90, sacredStructure: 90, silentWisdom: 90,
      etherealFoundation: 90, transcendentClarity: 90,
      emptying: measureEmptying(richContent),
      structuring: measureStructuring(richContent),
      silencing: measureSilencing(richContent),
      floating: measureFloating(richContent),
      transcending: measureTranscending(richContent),
      condition: 'void-masterpiece' as const,
      qualityScore: 85,
    }))
    const result = classifyVoidType(spires)
    expect(['cosmic-void', 'sacred-space']).toContain(result)
  })

  it('returns no-void for very low quality', () => {
    const spires: VoidSpire[] = Array.from({ length: 2 }, (_, i) => ({
      file: `file${i}.ts`,
      emptinessElegance: 5, sacredStructure: 5, silentWisdom: 5,
      etherealFoundation: 5, transcendentClarity: 5,
      emptying: measureEmptying(emptyContent),
      structuring: measureStructuring(emptyContent),
      silencing: measureSilencing(emptyContent),
      floating: measureFloating(emptyContent),
      transcending: measureTranscending(emptyContent),
      condition: 'dust' as const,
      qualityScore: 5,
    }))
    expect(classifyVoidType(spires)).toBe('no-void')
  })
})

// ─── classifyVoidCondition ─────────────────────────────────────────

describe('classifyVoidCondition', () => {
  it('classifies 80 as divine-emptiness', () => expect(classifyVoidCondition(80)).toBe('divine-emptiness'))
  it('classifies 65 as beautiful-space', () => expect(classifyVoidCondition(65)).toBe('beautiful-space'))
  it('classifies 50 as decent-void', () => expect(classifyVoidCondition(50)).toBe('decent-void'))
  it('classifies 35 as cluttered-space', () => expect(classifyVoidCondition(35)).toBe('cluttered-space'))
  it('classifies 20 as filled-void', () => expect(classifyVoidCondition(20)).toBe('filled-void'))
  it('classifies 5 as void', () => expect(classifyVoidCondition(5)).toBe('void'))
})

// ─── classifyArchitectGrade ────────────────────────────────────────

describe('classifyArchitectGrade', () => {
  it('classifies 85 as void-architect', () => expect(classifyArchitectGrade(85)).toBe('void-architect'))
  it('classifies 70 as sacred-builder', () => expect(classifyArchitectGrade(70)).toBe('sacred-builder'))
  it('classifies 55 as proper-mason', () => expect(classifyArchitectGrade(55)).toBe('proper-mason'))
  it('classifies 40 as apprentice', () => expect(classifyArchitectGrade(40)).toBe('apprentice'))
  it('classifies 25 as novice', () => expect(classifyArchitectGrade(25)).toBe('novice'))
  it('classifies 10 as destroyer', () => expect(classifyArchitectGrade(10)).toBe('destroyer'))
})

// ─── analyzeVoidSpire ──────────────────────────────────────────────

describe('analyzeVoidSpire', () => {
  it('analyzes empty content as dust', () => {
    const result = analyzeVoidSpire(emptyContent, 'empty.ts')
    expect(result.file).toBe('empty.ts')
    expect(result.condition).toBe('dust')
    expect(result.qualityScore).toBeGreaterThanOrEqual(0)
  })

  it('analyzes rich content with higher scores than empty', () => {
    const empty = analyzeVoidSpire(emptyContent, 'empty.ts')
    const rich = analyzeVoidSpire(richContent, 'rich.ts')
    expect(rich.qualityScore).toBeGreaterThan(empty.qualityScore)
  })

  it('qualityScore equals weighted average of 5 measures', () => {
    const result = analyzeVoidSpire(moderateContent, 'mod.ts')
    const expected = Math.round(
      result.emptying.elegance * 0.2 +
      result.structuring.sacred * 0.2 +
      result.silencing.wisdom * 0.2 +
      result.floating.ethereal * 0.2 +
      result.transcending.clarity * 0.2,
    )
    expect(result.qualityScore).toBe(expected)
  })

  it('populates all 5 measure objects', () => {
    const result = analyzeVoidSpire(richContent, 'rich.ts')
    expect(result.emptying).toBeDefined()
    expect(result.structuring).toBeDefined()
    expect(result.silencing).toBeDefined()
    expect(result.floating).toBeDefined()
    expect(result.transcending).toBeDefined()
  })

  it('sets emptinessElegance from emptying.elegance', () => {
    const result = analyzeVoidSpire(richContent, 'rich.ts')
    expect(result.emptinessElegance).toBe(result.emptying.elegance)
  })

  it('sets sacredStructure from structuring.sacred', () => {
    const result = analyzeVoidSpire(richContent, 'rich.ts')
    expect(result.sacredStructure).toBe(result.structuring.sacred)
  })

  it('sets silentWisdom from silencing.wisdom', () => {
    const result = analyzeVoidSpire(richContent, 'rich.ts')
    expect(result.silentWisdom).toBe(result.silencing.wisdom)
  })

  it('sets transcendentClarity from transcending.clarity', () => {
    const result = analyzeVoidSpire(richContent, 'rich.ts')
    expect(result.transcendentClarity).toBe(result.transcending.clarity)
  })
})

// ─── analyzeCathedralVoid ──────────────────────────────────────────

describe('analyzeCathedralVoid', () => {
  it('returns empty void for no spires', () => {
    const result = analyzeCathedralVoid([], 'src')
    expect(result.directory).toBe('src')
    expect(result.spires).toHaveLength(0)
    expect(result.avgEmptiness).toBe(0)
    expect(result.avgSacred).toBe(0)
    expect(result.avgClarity).toBe(0)
    expect(result.voidMasterpieceCount).toBe(0)
    expect(result.dustCount).toBe(0)
    expect(result.voidType).toBe('no-void')
    expect(result.condition).toBe('void')
  })

  it('computes averages for single spire', () => {
    const spire = analyzeVoidSpire(richContent, 'rich.ts')
    const result = analyzeCathedralVoid([spire], 'src')
    expect(result.avgEmptiness).toBe(spire.emptinessElegance)
    expect(result.avgSacred).toBe(spire.sacredStructure)
    expect(result.avgClarity).toBe(spire.transcendentClarity)
  })

  it('counts masterpieces and dust', () => {
    const masterpiece = analyzeVoidSpire(richContent, 'rich.ts')
    const dust = analyzeVoidSpire(emptyContent, 'empty.ts')
    if (masterpiece.condition === 'void-masterpiece' && dust.condition === 'dust') {
      const result = analyzeCathedralVoid([masterpiece, dust], 'src')
      expect(result.voidMasterpieceCount).toBe(1)
      expect(result.dustCount).toBe(1)
    }
  })
})

// ─── buildVoidCathedralResult ──────────────────────────────────────

describe('buildVoidCathedralResult', () => {
  it('handles empty input', async () => {
    const result = await buildVoidCathedralResult([], [])
    expect(result.spires).toHaveLength(0)
    expect(result.voids).toHaveLength(0)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalVoids).toBe(0)
    expect(result.stats.overallSublimity).toBe(0)
    expect(result.cosmos.isTranscendent).toBe(false)
    expect(result.cosmos.overallSublimity).toBe(0)
  })

  it('processes single file', async () => {
    const result = await buildVoidCathedralResult(['file.ts'], [richContent])
    expect(result.spires).toHaveLength(1)
    expect(result.spires[0].file).toBe('file.ts')
    expect(result.voids).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
  })

  it('groups files into voids by directory', async () => {
    const result = await buildVoidCathedralResult(
      ['src/a.ts', 'src/b.ts', 'lib/c.ts'],
      [richContent, moderateContent, emptyContent],
    )
    expect(result.spires).toHaveLength(3)
    expect(result.voids).toHaveLength(2)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalVoids).toBe(2)
  })

  it('computes cosmos summary correctly', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [richContent])
    expect(result.cosmos.avgEmptiness).toBe(result.spires[0].emptinessElegance)
    expect(result.cosmos.overallSublimity).toBeGreaterThanOrEqual(0)
  })

  it('sets isTranscendent when avgEmptiness >= 60', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [richContent])
    if (result.cosmos.avgEmptiness >= 60) {
      expect(result.cosmos.isTranscendent).toBe(true)
    } else {
      expect(result.cosmos.isTranscendent).toBe(false)
    }
  })

  it('tracks best spire and top performers', async () => {
    const result = await buildVoidCathedralResult(
      ['a.ts', 'b.ts'],
      [richContent, emptyContent],
    )
    expect(result.stats.bestSpire).toBe('a.ts')
    expect(result.stats.mostEmpty).toBeDefined()
    expect(result.stats.mostSacred).toBeDefined()
    expect(result.stats.wisest).toBeDefined()
    expect(result.stats.clearest).toBeDefined()
  })

  it('computes overallSublimity as avg of emptiness+sacred+clarity', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [moderateContent])
    const expected = Math.round(
      (result.cosmos.avgEmptiness + result.cosmos.avgSacred + result.cosmos.avgClarity) / 3,
    )
    expect(result.cosmos.overallSublimity).toBe(expected)
  })

  it('counts condition distribution correctly', async () => {
    const result = await buildVoidCathedralResult(
      ['a.ts', 'b.ts', 'c.ts'],
      [richContent, emptyContent, poorContent],
    )
    const total = result.stats.voidMasterpieceCount +
      result.stats.etherealSpireCount +
      result.stats.properChapelCount +
      result.stats.stoneChurchCount +
      result.stats.ruinedShrineCount +
      result.stats.dustCount
    expect(total).toBe(3)
  })

  it('generates recommendations', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [emptyContent])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('sets architect grade', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [richContent])
    expect(['void-architect', 'sacred-builder', 'proper-mason', 'apprentice', 'novice', 'destroyer']).toContain(
      result.stats.architectGrade,
    )
  })
})

// ─── generateRecommendations ───────────────────────────────────────

describe('generateRecommendations', () => {
  const emptyStats: VoidCathedralStats = {
    totalFiles: 0, totalVoids: 0,
    avgEmptinessElegance: 0, avgSacredStructure: 0, avgSilentWisdom: 0,
    avgEtherealFoundation: 0, avgTranscendentClarity: 0,
    voidMasterpieceCount: 0, etherealSpireCount: 0, properChapelCount: 0,
    stoneChurchCount: 0, ruinedShrineCount: 0, dustCount: 0,
    hasHighEleganceCount: 0, hasHighSacredCount: 0, hasHighWisdomCount: 0,
    hasHighEtherealCount: 0, hasHighClarityCount: 0,
    overallSublimity: 0, architectGrade: 'destroyer',
    bestSpire: '', mostEmpty: '', mostSacred: '', wisest: '', clearest: '',
  }

  const emptyCosmos: CosmosSummary = {
    avgEmptiness: 0, avgSacred: 0, avgClarity: 0,
    isTranscendent: false, overallSublimity: 0,
  }

  it('recommends improvement when all averages are low', () => {
    const recs = generateRecommendations([], [], emptyCosmos, emptyStats)
    expect(recs.length).toBeGreaterThan(0)
  })

  it('includes emptiness recommendation when avgEmptinessElegance < 50', () => {
    const stats = { ...emptyStats, avgEmptinessElegance: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('emptiness') || r.includes('concise'))).toBe(true)
  })

  it('includes sacred recommendation when avgSacredStructure < 50', () => {
    const stats = { ...emptyStats, avgSacredStructure: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('sacred') || r.includes('structure'))).toBe(true)
  })

  it('includes wisdom recommendation when avgSilentWisdom < 50', () => {
    const stats = { ...emptyStats, avgSilentWisdom: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('wisdom') || r.includes('silent'))).toBe(true)
  })

  it('includes ethereal recommendation when avgEtherealFoundation < 50', () => {
    const stats = { ...emptyStats, avgEtherealFoundation: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('ethereal') || r.includes('lightweight'))).toBe(true)
  })

  it('includes clarity recommendation when avgTranscendentClarity < 50', () => {
    const stats = { ...emptyStats, avgTranscendentClarity: 30 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('clarity') || r.includes('transcendent'))).toBe(true)
  })

  it('includes dust guidance when dustCount > 0', () => {
    const stats = { ...emptyStats, dustCount: 3 }
    const recs = generateRecommendations([], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('dust'))).toBe(true)
  })

  it('includes sublimity recommendation when overallSublimity < 40', () => {
    const stats = { ...emptyStats, overallSublimity: 20 }
    const cosmos = { ...emptyCosmos, overallSublimity: 20 }
    const recs = generateRecommendations([], [], cosmos, stats)
    expect(recs.some(r => r.includes('sublimity'))).toBe(true)
  })

  it('praises void architect when all metrics are high', () => {
    const highStats: VoidCathedralStats = {
      ...emptyStats,
      avgEmptinessElegance: 80, avgSacredStructure: 80, avgSilentWisdom: 80,
      avgEtherealFoundation: 80, avgTranscendentClarity: 80,
      overallSublimity: 80, architectGrade: 'void-architect',
    }
    const highCosmos: CosmosSummary = {
      avgEmptiness: 80, avgSacred: 80, avgClarity: 80,
      isTranscendent: true, overallSublimity: 80,
    }
    const recs = generateRecommendations([], [], highCosmos, highStats)
    expect(recs.some(r => r.includes('void architect'))).toBe(true)
  })

  it('mentions specific dust files when <= 3', () => {
    const spire: VoidSpire = analyzeVoidSpire(emptyContent, 'bad.ts')
    const stats = { ...emptyStats, dustCount: 1 }
    const recs = generateRecommendations([spire], [], emptyCosmos, stats)
    expect(recs.some(r => r.includes('bad.ts'))).toBe(true)
  })
})

// ─── format helpers ────────────────────────────────────────────────

describe('colorScore', () => {
  it('returns a string', () => expect(typeof colorScore(50)).toBe('string'))
  it('handles 0', () => expect(typeof colorScore(0)).toBe('string'))
  it('handles 100', () => expect(typeof colorScore(100)).toBe('string'))
})

describe('colorGrade', () => {
  it('returns a string for void-masterpiece', () => expect(typeof colorGrade('void-masterpiece')).toBe('string'))
  it('returns a string for dust', () => expect(typeof colorGrade('dust')).toBe('string'))
  it('returns a string for unknown', () => expect(typeof colorGrade('unknown-grade')).toBe('string'))
})

describe('formatSpireTable', () => {
  it('formats a single spire', () => {
    const spire = analyzeVoidSpire(richContent, 'rich.ts')
    const result = formatSpireTable(spire)
    expect(result).toContain('rich.ts')
    expect(result).toContain('Emptiness Elegance')
    expect(result).toContain('Sacred Structure')
    expect(result).toContain('Silent Wisdom')
    expect(result).toContain('Ethereal Foundation')
    expect(result).toContain('Transcendent Clarity')
  })
})

describe('formatSpiresTable', () => {
  it('handles empty array', () => expect(formatSpiresTable([])).toContain('No void spires'))
  it('formats multiple spires', () => {
    const spires = [
      analyzeVoidSpire(richContent, 'a.ts'),
      analyzeVoidSpire(moderateContent, 'b.ts'),
    ]
    const result = formatSpiresTable(spires)
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })
})

describe('formatVoidTable', () => {
  it('formats a void', () => {
    const spire = analyzeVoidSpire(richContent, 'rich.ts')
    const v = analyzeCathedralVoid([spire], 'src')
    const result = formatVoidTable(v)
    expect(result).toContain('src')
    expect(result).toContain('Void')
  })
})

describe('formatVoidsTable', () => {
  it('handles empty array', () => expect(formatVoidsTable([])).toContain('No cathedral voids'))
  it('formats voids', () => {
    const spire = analyzeVoidSpire(richContent, 'src/a.ts')
    const v = analyzeCathedralVoid([spire], 'src')
    const result = formatVoidsTable([v])
    expect(result).toContain('src')
  })
})

describe('formatStatsTable', () => {
  it('formats stats', async () => {
    const res = await buildVoidCathedralResult(['f.ts'], [richContent])
    const result = formatStatsTable(res.stats)
    expect(result).toContain('Void Cathedral Statistics')
    expect(result).toContain('Total Files')
    expect(result).toContain('Overall Sublimity')
  })
})

describe('formatRecommendations', () => {
  it('handles empty recommendations', () => expect(formatRecommendations([])).toContain('No recommendations'))
  it('formats recommendations as bullet list', () => {
    const result = formatRecommendations(['Achieve emptiness', 'Build sacred'])
    expect(result).toContain('Achieve emptiness')
    expect(result).toContain('Build sacred')
  })
})

describe('formatResultTable', () => {
  it('formats full result', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [richContent])
    const formatted = formatResultTable(result)
    expect(formatted).toContain('Void Cathedral Analysis')
    expect(formatted).toContain('Recommendations')
    expect(formatted).toContain('Transcendent')
  })
})

describe('formatResultJson', () => {
  it('returns valid JSON', async () => {
    const result = await buildVoidCathedralResult(['f.ts'], [richContent])
    const json = formatResultJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.spires).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.cosmos).toBeDefined()
  })
})
