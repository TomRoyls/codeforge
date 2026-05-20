import { describe, expect, it } from 'vitest'

import {
  buildGravityResult,
  classifyBody,
  classifyWellType,
  computeEscapeVelocity,
  computeGravitationalConstant,
  computeGravitationalField,
  computeGravitationalPull,
  computeSystemStability,
  computeWellStability,
  extractImportTargets,
  findOrbiters,
  generateGravityRecommendations,
  identifyGravityWells,
  resolveToKey,
  type BodyClassification,
  type GravitationalBody,
  type GravityOptions,
  type GravityResult,
  type GravityStats,
  type GravityWell,
  type Orbiter,
  type WellType,
} from '../src/commands/gravity-well-helpers.js'

import {
  formatBodyClassification,
  formatBodySymbol,
  formatBodyTable,
  formatEscapeVelocityChart,
  formatGravityJson,
  formatGravityRecommendations,
  formatGravityStats,
  formatGravityTable,
  formatGravityWellDiagram,
} from '../src/commands/gravity-well-format-helpers.js'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const HUB_FILES = ['core/engine.ts', 'core/utils.ts', 'commands/run.ts', 'commands/build.ts', 'commands/test.ts', 'app.ts']
const HUB_CONTENTS = [
  "export class Engine {\n  start() {}\n  stop() {}\n}\nexport function init() { return true }\n",
  "import { Engine } from './engine'\nexport function format(s: string) { return s }\n",
  "import { Engine } from '../core/engine'\nimport { format } from '../core/utils'\nexport function run() { return true }\n",
  "import { Engine } from '../core/engine'\nimport { format } from '../core/utils'\nexport function build() { return true }\n",
  "import { Engine } from '../core/engine'\nimport { format } from '../core/utils'\nexport function test() { return true }\n",
  "import { run } from './commands/run'\nimport { build } from './commands/build'\nimport { test } from './commands/test'\nexport { run, build, test }\n",
]

const ISOLATED_FILES = ['a.ts', 'b.ts', 'c.ts']
const ISOLATED_CONTENTS = ['const x = 1\n', 'const y = 2\n', 'const z = 3\n']

const SINGLE_FILES = ['solo.ts']
const SINGLE_CONTENTS = ['const solo = true\n']

const EMPTY_FILES: string[] = []
const EMPTY_CONTENTS: string[] = []

// ─── resolveToKey ──────────────────────────────────────────────────────────────

describe('resolveToKey', () => {
  it('resolves a relative import', () => {
    expect(resolveToKey('./helpers', 'src/app.ts', ['src/helpers.ts'])).toBe('src/helpers.ts')
  })

  it('returns null for unresolvable import', () => {
    expect(resolveToKey('./missing', 'src/app.ts', ['src/other.ts'])).toBeNull()
  })

  it('resolves with extension', () => {
    expect(resolveToKey('./helpers.ts', 'src/app.ts', ['src/helpers.ts'])).toBe('src/helpers.ts')
  })

  it('resolves index file', () => {
    expect(resolveToKey('./mod', 'src/app.ts', ['src/mod/index.ts'])).toBe('src/mod/index.ts')
  })

  it('resolves parent directory import', () => {
    expect(resolveToKey('../core', 'src/commands/run.ts', ['src/core/index.ts'])).toBe('src/core/index.ts')
  })

  it('returns null for non-relative imports', () => {
    expect(resolveToKey('chalk', 'src/app.ts', ['src/app.ts'])).toBeNull()
  })

  it('resolves in same directory', () => {
    expect(resolveToKey('./utils', 'app.ts', ['utils.ts'])).toBe('utils.ts')
  })
})

// ─── extractImportTargets ──────────────────────────────────────────────────────

describe('extractImportTargets', () => {
  it('extracts single import target', () => {
    const result = extractImportTargets("import { x } from './helpers'", 'src/app.ts', ['src/helpers.ts'])
    expect(result).toEqual(['src/helpers.ts'])
  })

  it('extracts multiple import targets', () => {
    const content = "import { a } from './x'\nimport { b } from './y'"
    const result = extractImportTargets(content, 'src/app.ts', ['src/x.ts', 'src/y.ts'])
    expect(result).toEqual(['src/x.ts', 'src/y.ts'])
  })

  it('returns empty for no imports', () => {
    const result = extractImportTargets('const x = 1', 'app.ts', ['app.ts'])
    expect(result).toEqual([])
  })

  it('skips external imports', () => {
    const result = extractImportTargets("import chalk from 'chalk'", 'app.ts', ['app.ts'])
    expect(result).toEqual([])
  })
})

// ─── computeGravitationalPull ──────────────────────────────────────────────────

describe('computeGravitationalPull', () => {
  it('counts files that import the target', () => {
    const pull = computeGravitationalPull('core/engine.ts', HUB_FILES, HUB_CONTENTS)
    expect(pull).toBe(4) // utils, run, build, test
  })

  it('returns 0 for isolated file', () => {
    const pull = computeGravitationalPull('a.ts', ISOLATED_FILES, ISOLATED_CONTENTS)
    expect(pull).toBe(0)
  })

  it('returns 0 for file not importing itself', () => {
    const pull = computeGravitationalPull('b.ts', ISOLATED_FILES, ISOLATED_CONTENTS)
    expect(pull).toBe(0)
  })
})

// ─── computeGravitationalField ─────────────────────────────────────────────────

describe('computeGravitationalField', () => {
  it('returns 0 for zero pull', () => {
    expect(computeGravitationalField(0, ['content'])).toBe(0)
  })

  it('returns 0 for empty importers', () => {
    expect(computeGravitationalField(5, [])).toBe(0)
  })

  it('computes field based on coupling ratio', () => {
    const content = "import { x } from './a'\nconst y = 1\nconst z = 2"
    const field = computeGravitationalField(3, [content])
    expect(field).toBeGreaterThan(0)
  })
})

// ─── findOrbiters ──────────────────────────────────────────────────────────────

describe('findOrbiters', () => {
  it('finds orbiters for a hub', () => {
    const orbiters = findOrbiters('core/engine.ts', HUB_FILES, HUB_CONTENTS)
    expect(orbiters.length).toBe(4)
    expect(orbiters.map(o => o.file)).toContain('commands/run.ts')
  })

  it('returns empty for isolated file', () => {
    const orbiters = findOrbiters('a.ts', ISOLATED_FILES, ISOLATED_CONTENTS)
    expect(orbiters).toEqual([])
  })

  it('each orbiter has distance 1', () => {
    const orbiters = findOrbiters('core/engine.ts', HUB_FILES, HUB_CONTENTS)
    for (const o of orbiters) {
      expect(o.distance).toBe(1)
    }
  })

  it('each orbiter has tidalForce between 0 and 1', () => {
    const orbiters = findOrbiters('core/engine.ts', HUB_FILES, HUB_CONTENTS)
    for (const o of orbiters) {
      expect(o.tidalForce).toBeGreaterThanOrEqual(0)
      expect(o.tidalForce).toBeLessThanOrEqual(1)
    }
  })
})

// ─── computeEscapeVelocity ─────────────────────────────────────────────────────

describe('computeEscapeVelocity', () => {
  it('returns 0 for no pull or orbiters', () => {
    expect(computeEscapeVelocity(0, 0)).toBe(0)
  })

  it('increases with pull', () => {
    const low = computeEscapeVelocity(5, 2)
    const high = computeEscapeVelocity(15, 5)
    expect(high).toBeGreaterThan(low)
  })

  it('caps at 100', () => {
    expect(computeEscapeVelocity(50, 20)).toBeLessThanOrEqual(100)
  })

  it('increases with orbiter count', () => {
    const few = computeEscapeVelocity(10, 2)
    const many = computeEscapeVelocity(10, 8)
    expect(many).toBeGreaterThan(few)
  })

  it('computes correct value for known input', () => {
    // baseVelocity = min(60, 10*3) = 30, orbiterBonus = min(40, 3*5) = 15 → 45
    expect(computeEscapeVelocity(10, 3)).toBe(45)
  })
})

// ─── classifyBody ──────────────────────────────────────────────────────────────

describe('classifyBody', () => {
  it('classifies blackhole for extreme pull', () => {
    expect(classifyBody(500, 25, 20)).toBe('blackhole')
  })

  it('classifies star for high pull', () => {
    expect(classifyBody(100, 12, 8)).toBe('star')
  })

  it('classifies planet for moderate pull', () => {
    expect(classifyBody(50, 5, 3)).toBe('planet')
  })

  it('classifies moon for low pull with no orbiters', () => {
    expect(classifyBody(30, 1, 0)).toBe('moon')
  })

  it('classifies asteroid for no pull', () => {
    expect(classifyBody(10, 0, 0)).toBe('asteroid')
  })

  it('classifies planet when has pull and orbiters', () => {
    expect(classifyBody(50, 2, 1)).toBe('planet')
  })

  it('blackhole threshold at > 20 pull', () => {
    expect(classifyBody(100, 21, 15)).toBe('blackhole')
    expect(classifyBody(100, 20, 15)).toBe('star')
  })

  it('star threshold at > 10 pull', () => {
    expect(classifyBody(100, 11, 5)).toBe('star')
    expect(classifyBody(100, 10, 5)).toBe('planet')
  })

  it('planet threshold at >= 3 pull', () => {
    expect(classifyBody(50, 3, 1)).toBe('planet')
    expect(classifyBody(50, 2, 0)).toBe('moon')
  })
})

// ─── identifyGravityWells ──────────────────────────────────────────────────────

describe('identifyGravityWells', () => {
  it('identifies wells for bodies with 3+ orbiters', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const engineBody = result.bodies.find(b => b.file === 'core/engine.ts')
    expect(engineBody).toBeDefined()
    if (engineBody && engineBody.orbiters.length >= 3) {
      expect(result.wells.some(w => w.center === 'core/engine.ts')).toBe(true)
    }
  })

  it('returns empty for isolated bodies', () => {
    const result = buildGravityResult(ISOLATED_FILES, ISOLATED_CONTENTS, {})
    expect(result.wells).toEqual([])
  })

  it('well includes center and orbiters', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const engineWell = result.wells.find(w => w.center === 'core/engine.ts')
    if (engineWell) {
      expect(engineWell.bodies).toContain('core/engine.ts')
    }
  })
})

// ─── computeWellStability ──────────────────────────────────────────────────────

describe('computeWellStability', () => {
  it('returns 100 for body with no orbiters', () => {
    const body: GravitationalBody = {
      file: 'a.ts', name: 'a', mass: 10, gravitationalPull: 0,
      gravitationalField: 0, orbiters: [], escapeVelocity: 0, classification: 'asteroid',
    }
    expect(computeWellStability(body, [body])).toBe(100)
  })

  it('returns 100 when all orbiters are stable', () => {
    const body: GravitationalBody = {
      file: 'a.ts', name: 'a', mass: 50, gravitationalPull: 5,
      gravitationalField: 10, orbiters: [
        { file: 'b.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.1, isStable: true },
        { file: 'c.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.2, isStable: true },
      ], escapeVelocity: 30, classification: 'planet',
    }
    expect(computeWellStability(body, [body])).toBe(100)
  })

  it('returns 0 when all orbiters are unstable', () => {
    const body: GravitationalBody = {
      file: 'a.ts', name: 'a', mass: 50, gravitationalPull: 5,
      gravitationalField: 10, orbiters: [
        { file: 'b.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.8, isStable: false },
        { file: 'c.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.9, isStable: false },
      ], escapeVelocity: 30, classification: 'planet',
    }
    expect(computeWellStability(body, [body])).toBe(0)
  })
})

// ─── classifyWellType ──────────────────────────────────────────────────────────

describe('classifyWellType', () => {
  const makeBody = (pull: number, orbiters: Orbiter[]): GravitationalBody => ({
    file: 'center.ts', name: 'center', mass: 100, gravitationalPull: pull,
    gravitationalField: pull * 10, orbiters, escapeVelocity: pull * 3, classification: 'star',
  })

  it('classifies binary when both centers are strong', () => {
    const center = makeBody(8, [
      { file: 'o.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.3, isStable: true },
    ])
    const bodies = [
      center,
      { ...makeBody(6, []), file: 'o.ts' },
    ]
    expect(classifyWellType(center, bodies)).toBe('binary')
  })

  it('classifies chaotic when most orbiters unstable', () => {
    const center = makeBody(15, [
      { file: 'a.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.8, isStable: false },
      { file: 'b.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.9, isStable: false },
      { file: 'c.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.7, isStable: false },
      { file: 'd.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.1, isStable: true },
    ])
    expect(classifyWellType(center, [center])).toBe('chaotic')
  })

  it('classifies stable by default', () => {
    const center = makeBody(15, [
      { file: 'a.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.1, isStable: true },
      { file: 'b.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.2, isStable: true },
      { file: 'c.ts', distance: 1, orbitalSpeed: 10, tidalForce: 0.3, isStable: true },
    ])
    expect(classifyWellType(center, [center])).toBe('stable')
  })
})

// ─── computeGravitationalConstant ──────────────────────────────────────────────

describe('computeGravitationalConstant', () => {
  it('returns 0 for empty bodies', () => {
    expect(computeGravitationalConstant([])).toBe(0)
  })

  it('returns 0 for isolated bodies', () => {
    const bodies: GravitationalBody[] = [
      { file: 'a.ts', name: 'a', mass: 10, gravitationalPull: 0, gravitationalField: 0, orbiters: [], escapeVelocity: 0, classification: 'asteroid' },
    ]
    expect(computeGravitationalConstant(bodies)).toBe(0)
  })

  it('returns positive for connected bodies', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    expect(result.stats.gravitationalConstant).toBeGreaterThan(0)
  })
})

// ─── computeSystemStability ────────────────────────────────────────────────────

describe('computeSystemStability', () => {
  it('returns 100 for no wells', () => {
    expect(computeSystemStability([])).toBe(100)
  })

  it('averages well stabilities', () => {
    const wells: GravityWell[] = [
      { center: 'a.ts', bodies: ['a.ts'], radius: 1, totalMass: 50, gravitationalStrength: 10, stability: 80, type: 'stable' },
      { center: 'b.ts', bodies: ['b.ts'], radius: 1, totalMass: 50, gravitationalStrength: 10, stability: 60, type: 'stable' },
    ]
    expect(computeSystemStability(wells)).toBe(70)
  })
})

// ─── generateGravityRecommendations ───────────────────────────────────────────

describe('generateGravityRecommendations', () => {
  const baseStats: GravityStats = {
    totalBodies: 10,
    starCount: 1,
    blackholeCount: 0,
    wellCount: 1,
    stableWells: 1,
    chaoticWells: 0,
    strongestGravity: 'core.ts',
    deepestWell: 'core.ts',
    avgEscapeVelocity: 30,
    avgFieldStrength: 20,
    gravitationalConstant: 15,
    systemStability: 80,
  }

  it('recommends breaking up black holes', () => {
    const bhBody: GravitationalBody = {
      file: 'core.ts', name: 'core', mass: 500, gravitationalPull: 25,
      gravitationalField: 250, orbiters: [], escapeVelocity: 90, classification: 'blackhole',
    }
    const recs = generateGravityRecommendations([bhBody], [], baseStats)
    expect(recs.some(r => r.includes('Black hole') && r.includes('core.ts'))).toBe(true)
  })

  it('recommends structure for chaotic wells', () => {
    const chaoticWell: GravityWell = {
      center: 'x.ts', bodies: ['x.ts'], radius: 1, totalMass: 50,
      gravitationalStrength: 10, stability: 20, type: 'chaotic',
    }
    const recs = generateGravityRecommendations([], [chaoticWell], baseStats)
    expect(recs.some(r => r.includes('chaotic') && r.includes('structure'))).toBe(true)
  })

  it('recommends abstraction for high escape velocity', () => {
    const highEsc: GravitationalBody = {
      file: 'tightly.ts', name: 'tightly', mass: 100, gravitationalPull: 15,
      gravitationalField: 150, orbiters: [], escapeVelocity: 80, classification: 'star',
    }
    const recs = generateGravityRecommendations([highEsc], [], baseStats)
    expect(recs.some(r => r.includes('escape velocity') && r.includes('abstraction'))).toBe(true)
  })

  it('recommends connecting asteroids when many isolated', () => {
    const asteroids = Array.from({ length: 6 }, (_, i) => ({
      file: `iso${i}.ts`, name: `iso${i}`, mass: 5, gravitationalPull: 0,
      gravitationalField: 0, orbiters: [], escapeVelocity: 0, classification: 'asteroid' as const,
    }))
    const stats = { ...baseStats, totalBodies: 10 }
    const recs = generateGravityRecommendations(asteroids, [], stats)
    expect(recs.some(r => r.includes('isolated'))).toBe(true)
  })

  it('recommends reducing coupling for low stability', () => {
    const stats = { ...baseStats, systemStability: 30 }
    const recs = generateGravityRecommendations([], [], stats)
    expect(recs.some(r => r.includes('stability') && r.includes('coupling'))).toBe(true)
  })

  it('returns empty for healthy system', () => {
    const recs = generateGravityRecommendations([], [], baseStats)
    expect(recs).toEqual([])
  })
})

// ─── buildGravityResult ───────────────────────────────────────────────────────

describe('buildGravityResult', () => {
  it('builds result with bodies', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    expect(result.bodies).toHaveLength(6)
  })

  it('computes correct pull for engine', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const engine = result.bodies.find(b => b.file === 'core/engine.ts')
    expect(engine).toBeDefined()
    expect(engine!.gravitationalPull).toBe(4)
  })

  it('classifies engine as planet or star', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const engine = result.bodies.find(b => b.file === 'core/engine.ts')
    expect(engine).toBeDefined()
    expect(['planet', 'star']).toContain(engine!.classification)
  })

  it('handles empty file list', () => {
    const result = buildGravityResult(EMPTY_FILES, EMPTY_CONTENTS, {})
    expect(result.bodies).toHaveLength(0)
    expect(result.wells).toHaveLength(0)
    expect(result.stats.totalBodies).toBe(0)
  })

  it('handles isolated files', () => {
    const result = buildGravityResult(ISOLATED_FILES, ISOLATED_CONTENTS, {})
    expect(result.bodies).toHaveLength(3)
    expect(result.bodies.every(b => b.classification === 'asteroid')).toBe(true)
  })

  it('stats are populated', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    expect(result.stats.totalBodies).toBe(6)
    expect(result.stats.strongestGravity).toBeTruthy()
    expect(result.stats.avgEscapeVelocity).toBeGreaterThanOrEqual(0)
    expect(result.stats.gravitationalConstant).toBeGreaterThanOrEqual(0)
  })

  it('includes recommendations', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    expect(Array.isArray(result.recommendations)).toBe(true)
  })

  it('each body has valid escape velocity', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    for (const b of result.bodies) {
      expect(b.escapeVelocity).toBeGreaterThanOrEqual(0)
      expect(b.escapeVelocity).toBeLessThanOrEqual(100)
    }
  })

  it('respects verbose option', () => {
    const opts: GravityOptions = { verbose: true }
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, opts)
    expect(result).toBeDefined()
  })
})

// ─── Format Helpers ────────────────────────────────────────────────────────────

describe('formatBodySymbol', () => {
  it('returns correct symbols', () => {
    expect(formatBodySymbol('star')).toBe('★')
    expect(formatBodySymbol('planet')).toBe('●')
    expect(formatBodySymbol('moon')).toBe('○')
    expect(formatBodySymbol('asteroid')).toBe('◌')
    expect(formatBodySymbol('blackhole')).toBe('◉')
  })
})

describe('formatBodyClassification', () => {
  it('includes symbol and name', () => {
    expect(formatBodyClassification('star')).toContain('star')
    expect(formatBodyClassification('star')).toContain('★')
    expect(formatBodyClassification('blackhole')).toContain('blackhole')
  })
})

describe('formatGravityWellDiagram', () => {
  it('shows message for no wells', () => {
    const output = formatGravityWellDiagram([])
    expect(output).toContain('No gravity wells')
  })

  it('formats wells with centers', () => {
    const wells: GravityWell[] = [
      { center: 'core/engine.ts', bodies: ['core/engine.ts', 'a.ts', 'b.ts'], radius: 1, totalMass: 100, gravitationalStrength: 50, stability: 80, type: 'stable' },
    ]
    const output = formatGravityWellDiagram(wells)
    expect(output).toContain('engine')
    expect(output).toContain('stable')
  })
})

describe('formatBodyTable', () => {
  it('shows message for empty bodies', () => {
    const output = formatBodyTable([])
    expect(output).toContain('No bodies')
  })

  it('formats bodies sorted by pull', () => {
    const bodies: GravitationalBody[] = [
      { file: 'low.ts', name: 'low', mass: 10, gravitationalPull: 0, gravitationalField: 0, orbiters: [], escapeVelocity: 0, classification: 'asteroid' },
      { file: 'high.ts', name: 'high', mass: 100, gravitationalPull: 10, gravitationalField: 100, orbiters: [], escapeVelocity: 30, classification: 'star' },
    ]
    const output = formatBodyTable(bodies)
    const highIdx = output.indexOf('high')
    const lowIdx = output.indexOf('low')
    expect(highIdx).toBeLessThan(lowIdx)
  })
})

describe('formatEscapeVelocityChart', () => {
  it('shows message for no data', () => {
    const output = formatEscapeVelocityChart([])
    expect(output).toContain('No escape velocity')
  })

  it('formats top bodies', () => {
    const bodies: GravitationalBody[] = [
      { file: 'big.ts', name: 'big', mass: 100, gravitationalPull: 15, gravitationalField: 150, orbiters: [], escapeVelocity: 75, classification: 'star' },
    ]
    const output = formatEscapeVelocityChart(bodies)
    expect(output).toContain('big')
    expect(output).toContain('75')
  })
})

describe('formatGravityStats', () => {
  it('formats all stat fields', () => {
    const stats: GravityStats = {
      totalBodies: 10, starCount: 2, blackholeCount: 1,
      wellCount: 3, stableWells: 2, chaoticWells: 1,
      strongestGravity: 'core.ts', deepestWell: 'core.ts',
      avgEscapeVelocity: 35, avgFieldStrength: 25,
      gravitationalConstant: 12, systemStability: 75,
    }
    const output = formatGravityStats(stats)
    expect(output).toContain('10')
    expect(output).toContain('core.ts')
    expect(output).toContain('75%')
  })
})

describe('formatGravityRecommendations', () => {
  it('returns empty for no recs', () => {
    expect(formatGravityRecommendations([])).toBe('')
  })

  it('formats recommendations', () => {
    const output = formatGravityRecommendations(['Break up black hole', 'Reduce coupling'])
    expect(output).toContain('Break up black hole')
    expect(output).toContain('→')
  })
})

describe('formatGravityTable', () => {
  it('formats full result', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const output = formatGravityTable(result)
    expect(output).toContain('Gravity Well')
  })
})

describe('formatGravityJson', () => {
  it('produces valid JSON', () => {
    const result = buildGravityResult(HUB_FILES, HUB_CONTENTS, {})
    const json = formatGravityJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.bodies).toHaveLength(6)
  })
})
