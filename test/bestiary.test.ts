import { describe, expect, it } from 'vitest'

import {
  buildBestiaryResult,
  buildCreature,
  computeBiodiversity,
  computeEcosystemHealth,
  detectChimeras,
  detectDragons,
  detectGargoyles,
  detectGhosts,
  detectGolems,
  detectHydras,
  detectKrakens,
  detectPhoenixes,
  detectSprites,
  detectUnicorns,
  generateRecommendations,
  type BestiaryStats,
  type Creature,
  type CreatureSighting,
} from '../src/commands/bestiary-helpers.js'

import {
  formatBestiaryJSON,
  formatBestiaryStats,
  formatBestiaryTable,
  formatCreatureCatalog,
  formatEcosystemHealthMeter,
  formatHabitatMap,
  formatRecommendations,
  formatSightingTable,
} from '../src/commands/bestiary-format-helpers.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const DRAGON_CODE = `const x = eval("dangerous")
const y = new Function("return 1")
function deep() { if (a) { if (b) { if (c) { if (d) { if (e) { if (f) {} } } } } } }
`

const UNICORN_CODE = `/**
 * Adds two numbers.
 */
export function add(a: number, b: number): number {
  try {
    return a + b
  } catch (e) {
    throw new Error('add failed')
  }
}
`

const HYDRA_CODE = `import { a } from './a'
import { b } from './b'
import { c } from './c'
import { d } from './d'
import { e } from './e'
import { f } from './f'
import { g } from './g'
import { h } from './h'
import { i } from './i'
const x = 1
`

const GOLEM_CODE = `function massive() {
${'  const x = 1\n'.repeat(110)}}
`

const GHOST_CODE = `export function unused1() {}
export function unused2() {}
export function unused3() {}
export function unused4() {}
export function unused5() {}
export function unused6() {}
function process() {
  return;
  const unreachable = true
}
`

const CHIMERA_CODE = `import { a } from './ui/button'
import { b } from './db/users'
import { c } from './api/auth'
import { d } from './utils/helpers'
import { e } from './core/config'
import { f } from './services/logger'
const x = 1
`

const KRAKEN_CODE = `fetch('/a').then(() => {
  return fetch('/b')
}).then(() => {
  return fetch('/c')
}).then(() => {
  return fetch('/d')
}).then(() => {
  return fetch('/e')
}).catch(() => {})
`

const SPRITE_CODE = `function add(a: number, b: number) {
  return a + b
}
const multiply = (a: number, b: number) => {
  return a * b
}
`

const GARGOYLE_CODE = `function process(input: string) {
  if (!input) return
  if (typeof input !== 'string') throw new Error('invalid')
  if (input.length === 0) return null
  return input.toUpperCase()
}
`

const CLEAN_CODE = 'const x = 1\n'

// ─── detectDragons ────────────────────────────────────────────────────────────

describe('detectDragons', () => {
  it('detects eval usage', () => {
    const sightings = detectDragons('a.ts', 'const x = eval("code")')
    expect(sightings.some((s) => s.creature === 'Dragon')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('eval'))).toBe(true)
    expect(sightings.some((s) => s.severity >= 80)).toBe(true)
  })

  it('detects new Function', () => {
    const sightings = detectDragons('a.ts', 'const fn = new Function("return 1")')
    expect(sightings.some((s) => s.evidence.includes('Function'))).toBe(true)
  })

  it('detects deep nesting', () => {
    const sightings = detectDragons('a.ts', DRAGON_CODE)
    expect(sightings.some((s) => s.evidence.includes('Nesting'))).toBe(true)
  })

  it('returns empty for clean code', () => {
    expect(detectDragons('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectUnicorns ───────────────────────────────────────────────────────────

describe('detectUnicorns', () => {
  it('detects perfect code', () => {
    const sightings = detectUnicorns('a.ts', UNICORN_CODE)
    expect(sightings.some((s) => s.creature === 'Unicorn')).toBe(true)
    expect(sightings.some((s) => s.severity <= 10)).toBe(true)
  })

  it('returns empty for imperfect code', () => {
    expect(detectUnicorns('a.ts', CLEAN_CODE)).toEqual([])
  })

  it('returns empty for partial docs', () => {
    expect(detectUnicorns('a.ts', 'export function foo() {}')).toEqual([])
  })
})

// ─── detectPhoenixes ──────────────────────────────────────────────────────────

describe('detectPhoenixes', () => {
  it('detects refactored code', () => {
    const sightings = detectPhoenixes('a.ts', 'code', true)
    expect(sightings.length).toBe(1)
    expect(sightings[0]!.creature).toBe('Phoenix')
  })

  it('returns empty when not refactored', () => {
    expect(detectPhoenixes('a.ts', 'code', false)).toEqual([])
  })
})

// ─── detectHydras ─────────────────────────────────────────────────────────────

describe('detectHydras', () => {
  it('detects high import count', () => {
    const sightings = detectHydras('a.ts', HYDRA_CODE, 0)
    expect(sightings.some((s) => s.creature === 'Hydra')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('coupling'))).toBe(true)
  })

  it('detects high dependency count', () => {
    const sightings = detectHydras('a.ts', 'const x = 1', 10)
    expect(sightings.some((s) => s.creature === 'Hydra')).toBe(true)
  })

  it('returns empty for low coupling', () => {
    expect(detectHydras('a.ts', CLEAN_CODE, 0)).toEqual([])
  })
})

// ─── detectGolems ─────────────────────────────────────────────────────────────

describe('detectGolems', () => {
  it('detects massive functions', () => {
    const sightings = detectGolems('a.ts', GOLEM_CODE)
    expect(sightings.some((s) => s.creature === 'Golem')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('massive'))).toBe(true)
  })

  it('returns empty for small functions', () => {
    expect(detectGolems('a.ts', SPRITE_CODE)).toEqual([])
  })

  it('returns empty for no functions', () => {
    expect(detectGolems('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectGhosts ─────────────────────────────────────────────────────────────

describe('detectGhosts', () => {
  it('detects unreachable code', () => {
    const sightings = detectGhosts('a.ts', 'function f() {\n  return;\n  const x = 1;\n}')
    expect(sightings.some((s) => s.creature === 'Ghost')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('Unreachable'))).toBe(true)
  })

  it('detects many exports', () => {
    const sightings = detectGhosts('utils.ts', GHOST_CODE)
    expect(sightings.some((s) => s.evidence.includes('exports'))).toBe(true)
  })

  it('returns empty for clean code', () => {
    expect(detectGhosts('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectChimeras ───────────────────────────────────────────────────────────

describe('detectChimeras', () => {
  it('detects mixed concerns', () => {
    const sightings = detectChimeras('a.ts', CHIMERA_CODE)
    expect(sightings.some((s) => s.creature === 'Chimera')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('domains'))).toBe(true)
  })

  it('returns empty for focused files', () => {
    expect(detectChimeras('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectKrakens ────────────────────────────────────────────────────────────

describe('detectKrakens', () => {
  it('detects deep promise chains', () => {
    const sightings = detectKrakens('a.ts', KRAKEN_CODE)
    expect(sightings.some((s) => s.creature === 'Kraken')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('chain'))).toBe(true)
  })

  it('returns empty for flat code', () => {
    expect(detectKrakens('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectSprites ────────────────────────────────────────────────────────────

describe('detectSprites', () => {
  it('detects small pure functions', () => {
    const sightings = detectSprites('a.ts', SPRITE_CODE)
    expect(sightings.some((s) => s.creature === 'Sprite')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('Elegant'))).toBe(true)
  })

  it('returns empty for no functions', () => {
    expect(detectSprites('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── detectGargoyles ──────────────────────────────────────────────────────────

describe('detectGargoyles', () => {
  it('detects defensive patterns', () => {
    const sightings = detectGargoyles('a.ts', GARGOYLE_CODE)
    expect(sightings.some((s) => s.creature === 'Gargoyle')).toBe(true)
    expect(sightings.some((s) => s.evidence.includes('defensive'))).toBe(true)
  })

  it('returns empty for non-defensive code', () => {
    expect(detectGargoyles('a.ts', CLEAN_CODE)).toEqual([])
  })
})

// ─── buildCreature ────────────────────────────────────────────────────────────

describe('buildCreature', () => {
  it('builds a dragon creature', () => {
    const sightings: CreatureSighting[] = [
      { file: 'a.ts', line: 1, creature: 'Dragon', evidence: 'eval', severity: 90 },
    ]
    const c = buildCreature('dragon', sightings)
    expect(c.name).toBe('Dragon')
    expect(c.type).toBe('dragon')
    expect(c.dangerLevel).toBe('dangerous')
    expect(c.frequency).toBe(1)
    expect(c.habitat).toEqual(['a.ts'])
  })

  it('builds a unicorn creature', () => {
    const c = buildCreature('unicorn', [])
    expect(c.dangerLevel).toBe('harmless')
  })

  it('builds all creature types', () => {
    const types = ['dragon', 'unicorn', 'phoenix', 'hydra', 'golem', 'ghost', 'chimera', 'kraken', 'sprite', 'gargoyle'] as const
    for (const t of types) {
      const c = buildCreature(t, [])
      expect(c.name).toBeTruthy()
      expect(c.description).toBeTruthy()
      expect(c.behaviors.length).toBeGreaterThan(0)
    }
  })
})

// ─── computeEcosystemHealth ───────────────────────────────────────────────────

describe('computeEcosystemHealth', () => {
  it('returns 100 for no sightings', () => {
    expect(computeEcosystemHealth([], [])).toBe(100)
  })

  it('penalizes dangerous creatures', () => {
    const creatures: Creature[] = [{ name: 'Dragon', type: 'dragon', description: '', habitat: [], dangerLevel: 'dangerous', frequency: 5, behaviors: [], weaknesses: [], loot: '' }]
    const sightings: CreatureSighting[] = Array(5).fill({ file: 'a.ts', line: 1, creature: 'Dragon', evidence: '', severity: 90 })
    expect(computeEcosystemHealth(creatures, sightings)).toBeLessThan(100)
  })

  it('returns high for harmless creatures', () => {
    const creatures: Creature[] = [{ name: 'Sprite', type: 'sprite', description: '', habitat: [], dangerLevel: 'harmless', frequency: 3, behaviors: [], weaknesses: [], loot: '' }]
    const sightings: CreatureSighting[] = Array(3).fill({ file: 'a.ts', line: 1, creature: 'Sprite', evidence: '', severity: 5 })
    expect(computeEcosystemHealth(creatures, sightings)).toBe(100)
  })
})

// ─── computeBiodiversity ──────────────────────────────────────────────────────

describe('computeBiodiversity', () => {
  it('returns 0 for empty', () => {
    expect(computeBiodiversity([])).toBe(0)
  })

  it('computes variety', () => {
    const creatures: Creature[] = [
      { name: 'Dragon', type: 'dragon', description: '', habitat: [], dangerLevel: 'dangerous', frequency: 1, behaviors: [], weaknesses: [], loot: '' },
      { name: 'Sprite', type: 'sprite', description: '', habitat: [], dangerLevel: 'harmless', frequency: 1, behaviors: [], weaknesses: [], loot: '' },
      { name: 'Golem', type: 'golem', description: '', habitat: [], dangerLevel: 'caution', frequency: 1, behaviors: [], weaknesses: [], loot: '' },
    ]
    expect(computeBiodiversity(creatures)).toBe(30)
  })

  it('returns 100 for all 10 types', () => {
    const types = ['dragon', 'unicorn', 'phoenix', 'hydra', 'golem', 'ghost', 'chimera', 'kraken', 'sprite', 'gargoyle'] as const
    const creatures: Creature[] = types.map((t) => ({ name: t, type: t, description: '', habitat: [], dangerLevel: 'harmless' as const, frequency: 1, behaviors: [], weaknesses: [], loot: '' }))
    expect(computeBiodiversity(creatures)).toBe(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('recommends slaying dragons', () => {
    const creatures: Creature[] = [{ name: 'Dragon', type: 'dragon', description: '', habitat: [], dangerLevel: 'dangerous', frequency: 2, behaviors: [], weaknesses: [], loot: '' }]
    const stats: BestiaryStats = { totalCreatures: 1, totalSightings: 2, dangerousCreatures: 1, harmlessCreatures: 0, mostCommonCreature: 'Dragon', mostDangerousArea: 'a.ts', ecosystemHealth: 50, biodiversity: 10 }
    const recs = generateRecommendations(creatures, [], stats)
    expect(recs.some((r) => r.includes('SLAY'))).toBe(true)
  })

  it('recommends celebrating unicorns', () => {
    const creatures: Creature[] = [{ name: 'Unicorn', type: 'unicorn', description: '', habitat: [], dangerLevel: 'harmless', frequency: 1, behaviors: [], weaknesses: [], loot: '' }]
    const stats: BestiaryStats = { totalCreatures: 1, totalSightings: 1, dangerousCreatures: 0, harmlessCreatures: 1, mostCommonCreature: 'Unicorn', mostDangerousArea: 'none', ecosystemHealth: 100, biodiversity: 10 }
    const recs = generateRecommendations(creatures, [], stats)
    expect(recs.some((r) => r.includes('CELEBRATE'))).toBe(true)
  })

  it('praises balanced ecosystem', () => {
    const recs = generateRecommendations([], [], { totalCreatures: 0, totalSightings: 0, dangerousCreatures: 0, harmlessCreatures: 0, mostCommonCreature: 'none', mostDangerousArea: 'none', ecosystemHealth: 100, biodiversity: 0 })
    expect(recs.some((r) => r.includes('balanced'))).toBe(true)
  })
})

// ─── buildBestiaryResult ──────────────────────────────────────────────────────

describe('buildBestiaryResult', () => {
  it('builds result with creatures', () => {
    const result = buildBestiaryResult(['dragon.ts'], [DRAGON_CODE], { maxDepth: 50 })
    expect(result.creatures.length).toBeGreaterThan(0)
    expect(result.sightings.length).toBeGreaterThan(0)
  })

  it('detects multiple creature types', () => {
    const combined = SPRITE_CODE + '\n' + GARGOYLE_CODE
    const result = buildBestiaryResult(
      ['combined.ts'],
      [combined],
      { maxDepth: 50 },
    )
    expect(result.creatures.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty input', () => {
    const result = buildBestiaryResult([], [], { maxDepth: 50 })
    expect(result.creatures).toEqual([])
    expect(result.sightings).toEqual([])
    expect(result.stats.ecosystemHealth).toBe(100)
  })

  it('computes stats', () => {
    const result = buildBestiaryResult(['dragon.ts'], [DRAGON_CODE], { maxDepth: 50 })
    expect(result.stats.totalSightings).toBeGreaterThan(0)
    expect(result.stats.ecosystemHealth).toBeLessThan(100)
  })

  it('generates recommendations', () => {
    const result = buildBestiaryResult(['dragon.ts'], [DRAGON_CODE], { maxDepth: 50 })
    expect(result.recommendations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatCreatureCatalog', () => {
  it('formats catalog', () => {
    const creatures: Creature[] = [{ name: 'Dragon', type: 'dragon', description: 'Dangerous', habitat: ['a.ts'], dangerLevel: 'dangerous', frequency: 2, behaviors: ['Fire'], weaknesses: ['Water'], loot: 'Gold' }]
    const output = formatCreatureCatalog(creatures)
    expect(output).toContain('Creature Catalog')
    expect(output).toContain('Dragon')
    expect(output).toContain('a.ts')
  })

  it('handles empty', () => {
    expect(formatCreatureCatalog([])).toContain('No creatures')
  })
})

describe('formatSightingTable', () => {
  it('formats sightings', () => {
    const sightings: CreatureSighting[] = [{ file: 'a.ts', line: 5, creature: 'Dragon', evidence: 'eval', severity: 90 }]
    const output = formatSightingTable(sightings)
    expect(output).toContain('Sightings')
    expect(output).toContain('Dragon')
    expect(output).toContain('eval')
  })

  it('handles empty', () => {
    expect(formatSightingTable([])).toContain('No sightings')
  })
})

describe('formatEcosystemHealthMeter', () => {
  it('formats meter', () => {
    const output = formatEcosystemHealthMeter(85)
    expect(output).toContain('Ecosystem Health')
    expect(output).toContain('85%')
  })
})

describe('formatHabitatMap', () => {
  it('formats map', () => {
    const creatures: Creature[] = [{ name: 'Dragon', type: 'dragon', description: '', habitat: ['a.ts', 'b.ts'], dangerLevel: 'dangerous', frequency: 2, behaviors: [], weaknesses: [], loot: '' }]
    const output = formatHabitatMap(creatures)
    expect(output).toContain('Habitat Map')
    expect(output).toContain('a.ts')
  })

  it('handles empty', () => {
    expect(formatHabitatMap([])).toContain('No habitats')
  })
})

describe('formatBestiaryStats', () => {
  it('formats stats', () => {
    const stats: BestiaryStats = { totalCreatures: 5, totalSightings: 10, dangerousCreatures: 2, harmlessCreatures: 2, mostCommonCreature: 'Sprite', mostDangerousArea: 'bad.ts', ecosystemHealth: 70, biodiversity: 50 }
    const output = formatBestiaryStats(stats)
    expect(output).toContain('Species Found')
    expect(output).toContain('5')
    expect(output).toContain('Sprite')
  })
})

describe('formatRecommendations', () => {
  it('formats recs', () => {
    expect(formatRecommendations(['Slay the dragons'])).toContain('1.')
  })

  it('handles empty', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatBestiaryTable', () => {
  it('formats full table', () => {
    const result = buildBestiaryResult(['sprite.ts'], [SPRITE_CODE], { maxDepth: 50 })
    const output = formatBestiaryTable(result)
    expect(output).toContain('Creature Catalog')
    expect(output).toContain('Ecosystem Health')
  })
})

describe('formatBestiaryJSON', () => {
  it('formats valid JSON', () => {
    const result = buildBestiaryResult(['a.ts'], [CLEAN_CODE], { maxDepth: 50 })
    const json = formatBestiaryJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.creatures).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})

// ─── Integration ──────────────────────────────────────────────────────────────

describe('integration: full pipeline', () => {
  it('analyzes diverse codebase', () => {
    const result = buildBestiaryResult(
      ['dragon.ts', 'unicorn.ts', 'sprite.ts', 'kraken.ts', 'test/gargoyle.test.ts'],
      [DRAGON_CODE, UNICORN_CODE, SPRITE_CODE, KRAKEN_CODE, GARGOYLE_CODE],
      { maxDepth: 100 },
    )
    expect(result.creatures.length).toBeGreaterThanOrEqual(3)
    expect(result.stats.ecosystemHealth).toBeGreaterThanOrEqual(0)
    expect(result.stats.biodiversity).toBeGreaterThan(0)
  })

  it('round-trips through JSON', () => {
    const result = buildBestiaryResult(['a.ts'], [SPRITE_CODE], { maxDepth: 50 })
    const json = formatBestiaryJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalSightings).toBe(result.stats.totalSightings)
    expect(parsed.creatures.length).toBe(result.creatures.length)
  })
})
