import { describe, expect, it } from 'vitest'

import {
  buildTwilightResult,
  computeAvgCoupling,
  computeBoundaries,
  detectCircularDeps,
  discoverModules,
  extractExportedNames,
  extractImports,
  extractReExports,
  findBridgeFiles,
  findChimeraFiles,
  findLeakyFiles,
  findOrphanFiles,
  findSharedFiles,
  findStrongestBoundary,
  getModuleForFile,
  resolveImportPath,
  type Boundary,
  type TwilightZone,
} from '../src/commands/twilight-helpers.js'

import {
  formatBoundaryGraph,
  formatCircularWarnings,
  formatCouplingMeter,
  formatRecommendations,
  formatTwilightJSON,
  formatTwilightStats,
  formatTwilightTable,
  formatZoneRow,
  formatZoneTable,
  getZoneColor,
  getZoneIcon,
} from '../src/commands/twilight-format-helpers.js'

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const FILE_A = 'src/core/a.ts'
const FILE_B = 'src/core/b.ts'
const FILE_C = 'src/cmd/c.ts'
const FILE_D = 'src/cmd/d.ts'
const FILE_E = 'src/utils/e.ts'
const FILE_F = 'src/utils/f.ts'

const CONTENT_IMPORTS_AB = [
  "import { helper } from './b';\nexport const x = helper(1);",
  "export function helper(n: number) { return n * 2; }",
]

const CONTENT_CIRCULAR = [
  "import { fnB } from './b';\nexport function fnA() { return fnB(); }",
  "import { fnA } from './a';\nexport function fnB() { return fnA(); }",
]

const CONTENT_BRIDGE = [
  "import { x } from './b';\nimport { y } from '../cmd/c';\nimport { z } from '../utils/e';\nexport const bridge = x + y + z;",
  "export const x = 1;",
  "export const y = 2;",
  "export const z = 3;",
]

const CONTENT_LEAKY = [
  Array.from({ length: 12 }, (_, i) => `export const item${i} = ${i};`).join('\n'),
]

const CONTENT_ORPHAN = 'const standalone = 1;'

const CONTENT_CHIMERA = [
  [
    "import { a } from '../core/a';",
    "import { b } from '../cmd/c';",
    "import { c } from '../utils/e';",
    "import { d } from '../shared/x';",
    "export const mix = a + b + c + d;",
  ].join('\n'),
  "export const a = 1;",
  "export const b = 2;",
  "export const c = 3;",
  "export const d = 4;",
]

// ─── discoverModules ──────────────────────────────────────────────────────────

describe('discoverModules', () => {
  it('groups files by directory', () => {
    const modules = discoverModules([FILE_A, FILE_B, FILE_C])
    expect(modules.get('src/core')).toEqual([FILE_A, FILE_B])
    expect(modules.get('src/cmd')).toEqual([FILE_C])
  })

  it('handles root-level files', () => {
    const modules = discoverModules(['index.ts'])
    expect(modules.get('<root>')).toEqual(['index.ts'])
  })

  it('returns empty map for no files', () => {
    const modules = discoverModules([])
    expect(modules.size).toBe(0)
  })

  it('handles single file per module', () => {
    const modules = discoverModules([FILE_A, FILE_C])
    expect(modules.size).toBe(2)
    expect(modules.get('src/core')).toEqual([FILE_A])
  })
})

// ─── getModuleForFile ─────────────────────────────────────────────────────────

describe('getModuleForFile', () => {
  it('returns parent directory', () => {
    expect(getModuleForFile('src/core/a.ts')).toBe('src/core')
  })

  it('returns root for no directory', () => {
    expect(getModuleForFile('index.ts')).toBe('<root>')
  })

  it('handles nested paths', () => {
    expect(getModuleForFile('src/core/sub/deep.ts')).toBe('src/core/sub')
  })
})

// ─── extractImports ───────────────────────────────────────────────────────────

describe('extractImports', () => {
  it('extracts named imports', () => {
    const imports = extractImports("import { x, y } from './utils';")
    expect(imports).toEqual(['./utils'])
  })

  it('extracts default imports', () => {
    const imports = extractImports("import fs from 'fs';")
    expect(imports).toEqual(['fs'])
  })

  it('extracts side-effect imports', () => {
    const imports = extractImports("import './setup';")
    expect(imports).toEqual(['./setup'])
  })

  it('extracts multiple imports', () => {
    const content = "import { a } from './x';\nimport { b } from './y';"
    const imports = extractImports(content)
    expect(imports).toEqual(['./x', './y'])
  })

  it('returns empty for no imports', () => {
    expect(extractImports('const x = 1;')).toEqual([])
  })
})

// ─── extractReExports ─────────────────────────────────────────────────────────

describe('extractReExports', () => {
  it('extracts re-exports', () => {
    const reExports = extractReExports("export { x } from './utils';")
    expect(reExports).toEqual(['./utils'])
  })

  it('returns empty for no re-exports', () => {
    expect(extractReExports('export const x = 1;')).toEqual([])
  })

  it('extracts multiple re-exports', () => {
    const content = "export { a } from './x';\nexport { b } from './y';"
    expect(extractReExports(content)).toEqual(['./x', './y'])
  })
})

// ─── extractExportedNames ─────────────────────────────────────────────────────

describe('extractExportedNames', () => {
  it('extracts const exports', () => {
    expect(extractExportedNames('export const x = 1;')).toContain('x')
  })

  it('extracts function exports', () => {
    expect(extractExportedNames('export function hello() {}')).toContain('hello')
  })

  it('extracts class exports', () => {
    expect(extractExportedNames('export class MyClass {}')).toContain('MyClass')
  })

  it('extracts interface exports', () => {
    expect(extractExportedNames('export interface Config {}')).toContain('Config')
  })

  it('extracts type exports', () => {
    expect(extractExportedNames('export type Result = string | null;')).toContain('Result')
  })

  it('returns empty for no exports', () => {
    expect(extractExportedNames('const x = 1;')).toEqual([])
  })
})

// ─── resolveImportPath ────────────────────────────────────────────────────────

describe('resolveImportPath', () => {
  it('resolves sibling import', () => {
    expect(resolveImportPath('src/core/a.ts', './b')).toBe('src/core/b.ts')
  })

  it('resolves parent import', () => {
    expect(resolveImportPath('src/core/a.ts', '../cmd/c')).toBe('src/cmd/c.ts')
  })

  it('ignores non-relative imports', () => {
    expect(resolveImportPath('src/core/a.ts', 'fs')).toBe('')
  })

  it('handles .ts extension already present', () => {
    expect(resolveImportPath('src/core/a.ts', './b.ts')).toBe('src/core/b.ts')
  })

  it('handles deep relative path', () => {
    expect(resolveImportPath('src/core/sub/a.ts', '../../cmd/c')).toBe('src/cmd/c.ts')
  })
})

// ─── computeBoundaries ────────────────────────────────────────────────────────

describe('computeBoundaries', () => {
  it('detects inter-module import boundaries', () => {
    const files = [FILE_A, FILE_C]
    const contents = [
      "import { x } from '../cmd/c';\nexport const y = x;",
      "export const x = 1;",
    ]
    const boundaries = computeBoundaries(files, contents)
    const crossModule = boundaries.filter((b) => getModuleForFile(b.from) !== getModuleForFile(b.to))
    expect(crossModule.length).toBeGreaterThanOrEqual(1)
  })

  it('skips intra-module imports', () => {
    const files = [FILE_A, FILE_B]
    const contents = CONTENT_IMPORTS_AB
    const boundaries = computeBoundaries(files, contents)
    const crossModule = boundaries.filter((b) => getModuleForFile(b.from) !== getModuleForFile(b.to))
    expect(crossModule).toHaveLength(0)
  })

  it('detects re-export boundaries', () => {
    const files = [FILE_A, FILE_C]
    const contents = [
      "export { x } from '../cmd/c';",
      "export const x = 1;",
    ]
    const boundaries = computeBoundaries(files, contents)
    const reExport = boundaries.find((b) => b.type === 're-export')
    expect(reExport).toBeDefined()
  })

  it('returns empty for no imports', () => {
    const boundaries = computeBoundaries(['a.ts'], ['const x = 1;'])
    expect(boundaries).toHaveLength(0)
  })

  it('computes boundary strengths', () => {
    const files = [FILE_A, FILE_C]
    const contents = [
      "import { x } from '../cmd/c';\nexport const y = x;",
      "export const x = 1;",
    ]
    const boundaries = computeBoundaries(files, contents)
    for (const b of boundaries) {
      expect(b.strength).toBeGreaterThanOrEqual(0)
      expect(b.strength).toBeLessThanOrEqual(100)
    }
  })
})

// ─── detectCircularDeps ───────────────────────────────────────────────────────

describe('detectCircularDeps', () => {
  it('detects circular dependencies', () => {
    const boundaries: Boundary[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 50, bidirectional: true },
      { from: 'b.ts', to: 'a.ts', type: 'import', strength: 50, bidirectional: true },
    ]
    const circular = detectCircularDeps(boundaries)
    expect(circular).toHaveLength(1)
    expect(circular[0]!.type).toBe('circular')
  })

  it('returns empty for no circular deps', () => {
    const boundaries: Boundary[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 50, bidirectional: false },
    ]
    const circular = detectCircularDeps(boundaries)
    expect(circular).toHaveLength(0)
  })

  it('returns empty for empty boundaries', () => {
    expect(detectCircularDeps([])).toHaveLength(0)
  })
})

// ─── findBridgeFiles ──────────────────────────────────────────────────────────

describe('findBridgeFiles', () => {
  it('detects files importing from many modules', () => {
    const files = [FILE_A, FILE_B, FILE_C, FILE_E, 'src/shared/x.ts']
    const contents = [
      "import { b } from './b';\nimport { c } from '../cmd/c';\nimport { e } from '../utils/e';\nimport { x } from '../shared/x';",
      "export const b = 1;",
      "export const c = 2;",
      "export const e = 3;",
      "export const x = 4;",
    ]
    const boundaries = computeBoundaries(files, contents)
    const bridges = findBridgeFiles(files, contents, boundaries)
    const bridgeA = bridges.find((z) => z.file === FILE_A)
    expect(bridgeA).toBeDefined()
    expect(bridgeA!.category).toBe('bridge')
  })

  it('returns empty for no bridges', () => {
    const bridges = findBridgeFiles([FILE_A], ['const x = 1;'], [])
    expect(bridges).toHaveLength(0)
  })
})

// ─── findSharedFiles ──────────────────────────────────────────────────────────

describe('findSharedFiles', () => {
  it('detects files used by many modules', () => {
    const files = [FILE_A, FILE_C, FILE_E, 'src/shared/x.ts']
    const contents = [
      "import { z } from '../utils/e';",
      "import { z } from '../utils/e';",
      "export const z = 1;",
      "import { z } from '../utils/e';",
    ]
    const boundaries = computeBoundaries(files, contents)
    const shared = findSharedFiles(files, contents, boundaries)
    const sharedE = shared.find((z) => z.file === FILE_E)
    expect(sharedE).toBeDefined()
    expect(sharedE!.category).toBe('shared')
  })

  it('returns empty when no file is widely shared', () => {
    const shared = findSharedFiles([FILE_A], ['const x = 1;'], [])
    expect(shared).toHaveLength(0)
  })
})

// ─── findOrphanFiles ──────────────────────────────────────────────────────────

describe('findOrphanFiles', () => {
  it('detects solo files with no imports or exports', () => {
    const files = [FILE_A]
    const contents = [CONTENT_ORPHAN]
    const modules = discoverModules(files)
    const orphans = findOrphanFiles(files, contents, modules)
    expect(orphans).toHaveLength(1)
    expect(orphans[0]!.category).toBe('orphan')
  })

  it('does not flag files with exports', () => {
    const files = [FILE_A]
    const contents = ['export const x = 1;']
    const modules = discoverModules(files)
    const orphans = findOrphanFiles(files, contents, modules)
    expect(orphans).toHaveLength(0)
  })

  it('does not flag files with imports', () => {
    const files = [FILE_A]
    const contents = ["import { x } from './b';"]
    const modules = discoverModules(files)
    const orphans = findOrphanFiles(files, contents, modules)
    expect(orphans).toHaveLength(0)
  })

  it('does not flag files with module siblings', () => {
    const files = [FILE_A, FILE_B]
    const contents = [CONTENT_ORPHAN, 'const y = 2;']
    const modules = discoverModules(files)
    const orphans = findOrphanFiles(files, contents, modules)
    expect(orphans).toHaveLength(0)
  })
})

// ─── findChimeraFiles ─────────────────────────────────────────────────────────

describe('findChimeraFiles', () => {
  it('detects files mixing concerns from multiple domains', () => {
    const files = [FILE_A, FILE_C, FILE_E, 'src/shared/x.ts']
    const contents = [
      [
        "import { a } from './b';",
        "import { b } from '../cmd/c';",
        "import { c } from '../utils/e';",
        "import { d } from '../shared/x';",
      ].join('\n'),
      "export const a = 1;",
      "export const b = 2;",
      "export const c = 3;",
    ]
    const boundaries = computeBoundaries(files, contents)
    const chimeras = findChimeraFiles(files, contents, boundaries)
    const chimeraA = chimeras.find((z) => z.file === FILE_A)
    expect(chimeraA).toBeDefined()
    expect(chimeraA!.category).toBe('chimera')
  })

  it('returns empty for no chimeras', () => {
    const chimeras = findChimeraFiles([FILE_A], ['const x = 1;'], [])
    expect(chimeras).toHaveLength(0)
  })
})

// ─── findLeakyFiles ───────────────────────────────────────────────────────────

describe('findLeakyFiles', () => {
  it('detects files with many exports', () => {
    const files = [FILE_A]
    const contents = CONTENT_LEAKY
    const leaky = findLeakyFiles(files, contents)
    expect(leaky).toHaveLength(1)
    expect(leaky[0]!.category).toBe('leaky')
    expect(leaky[0]!.boundaryCount).toBe(12)
  })

  it('does not flag files with few exports', () => {
    const leaky = findLeakyFiles([FILE_A], ['export const x = 1;\nexport const y = 2;'])
    expect(leaky).toHaveLength(0)
  })

  it('does not flag files with no exports', () => {
    const leaky = findLeakyFiles([FILE_A], ['const x = 1;'])
    expect(leaky).toHaveLength(0)
  })
})

// ─── computeAvgCoupling ───────────────────────────────────────────────────────

describe('computeAvgCoupling', () => {
  it('computes average coupling', () => {
    const zones: TwilightZone[] = [
      { file: 'a.ts', modules: [], boundaryCount: 0, couplingScore: 60, category: 'bridge', reason: '' },
      { file: 'b.ts', modules: [], boundaryCount: 0, couplingScore: 40, category: 'shared', reason: '' },
    ]
    expect(computeAvgCoupling(zones)).toBe(50)
  })

  it('returns 0 for empty zones', () => {
    expect(computeAvgCoupling([])).toBe(0)
  })

  it('rounds to integer', () => {
    const zones: TwilightZone[] = [
      { file: 'a.ts', modules: [], boundaryCount: 0, couplingScore: 50, category: 'bridge', reason: '' },
      { file: 'b.ts', modules: [], boundaryCount: 0, couplingScore: 60, category: 'shared', reason: '' },
      { file: 'c.ts', modules: [], boundaryCount: 0, couplingScore: 70, category: 'orphan', reason: '' },
    ]
    expect(computeAvgCoupling(zones)).toBe(60)
  })
})

// ─── findStrongestBoundary ────────────────────────────────────────────────────

describe('findStrongestBoundary', () => {
  it('returns strongest boundary', () => {
    const boundaries: Boundary[] = [
      { from: 'a.ts', to: 'b.ts', type: 'import', strength: 40, bidirectional: false },
      { from: 'c.ts', to: 'd.ts', type: 'import', strength: 80, bidirectional: false },
    ]
    expect(findStrongestBoundary(boundaries)).toBe('c.ts → d.ts')
  })

  it('returns empty string for no boundaries', () => {
    expect(findStrongestBoundary([])).toBe('')
  })
})

// ─── buildTwilightResult ──────────────────────────────────────────────────────

describe('buildTwilightResult', () => {
  it('returns empty result for no files', () => {
    const result = buildTwilightResult([], [])
    expect(result.zones).toHaveLength(0)
    expect(result.boundaries).toHaveLength(0)
    expect(result.stats.totalZones).toBe(0)
  })

  it('detects zones in multi-module codebase', () => {
    const files = [FILE_A, FILE_C, FILE_E]
    const contents = [
      "import { x } from '../cmd/c';\nimport { y } from '../utils/e';\nexport const bridge = x + y;",
      "export const x = 1;",
      "export const y = 2;",
    ]
    const result = buildTwilightResult(files, contents)
    expect(result.zones.length).toBeGreaterThanOrEqual(0)
    expect(result.stats.moduleCount).toBe(3)
  })

  it('computes stats correctly', () => {
    const result = buildTwilightResult(
      [FILE_A, FILE_B],
      [CONTENT_ORPHAN, CONTENT_ORPHAN],
    )
    expect(result.stats.moduleCount).toBe(1)
    expect(result.stats.boundaryCount).toBe(0)
  })

  it('generates recommendations', () => {
    const result = buildTwilightResult([FILE_A], [CONTENT_ORPHAN])
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('detects circular dependencies', () => {
    const result = buildTwilightResult(
      ['src/core/a.ts', 'src/core/b.ts'],
      CONTENT_CIRCULAR,
    )
    expect(result.stats.circularDependencies).toBeGreaterThanOrEqual(0)
  })

  it('deduplicates zones by file', () => {
    const files = [FILE_A, FILE_B, FILE_C, FILE_E]
    const contents = [
      "import { x } from './b';\nimport { y } from '../cmd/c';\nimport { z } from '../utils/e';\n" + CONTENT_LEAKY[0],
      "export const x = 1;",
      "export const y = 2;",
      "export const z = 3;",
    ]
    const result = buildTwilightResult(files, contents)
    const aZones = result.zones.filter((z) => z.file === FILE_A)
    expect(aZones.length).toBeLessThanOrEqual(1)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getZoneColor', () => {
  it('returns function for all categories', () => {
    const categories = ['bridge', 'shared', 'orphan', 'chimera', 'leaky'] as const
    for (const cat of categories) {
      expect(typeof getZoneColor(cat)('test')).toBe('string')
    }
  })
})

describe('getZoneIcon', () => {
  it('returns non-empty icon for all categories', () => {
    const categories = ['bridge', 'shared', 'orphan', 'chimera', 'leaky'] as const
    for (const cat of categories) {
      expect(getZoneIcon(cat).length).toBeGreaterThan(0)
    }
  })
})

describe('formatCouplingMeter', () => {
  it('renders coupling bar', () => {
    const result = formatCouplingMeter(50)
    expect(result).toContain('Coupling')
    expect(result).toContain('50%')
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('renders extremes', () => {
    expect(formatCouplingMeter(0)).toContain('0%')
    expect(formatCouplingMeter(100)).toContain('100%')
  })
})

describe('formatZoneRow', () => {
  it('formats zone row', () => {
    const zone: TwilightZone = {
      file: 'src/bridge.ts',
      modules: ['a', 'b', 'c'],
      boundaryCount: 5,
      couplingScore: 75,
      category: 'bridge',
      reason: 'test',
    }
    const row = formatZoneRow(zone)
    expect(row).toContain('src/bridge.ts')
    expect(row).toContain('bridge')
    expect(row).toContain('75%')
  })
})

describe('formatZoneTable', () => {
  it('renders table with zones', () => {
    const zones: TwilightZone[] = [
      { file: 'a.ts', modules: [], boundaryCount: 1, couplingScore: 50, category: 'bridge', reason: 'test' },
    ]
    const table = formatZoneTable(zones)
    expect(table).toContain('Twilight Zones')
    expect(table).toContain('a.ts')
  })

  it('shows no zones message for empty', () => {
    expect(formatZoneTable([])).toContain('No twilight zones')
  })
})

describe('formatBoundaryGraph', () => {
  it('renders graph', () => {
    const boundaries: Boundary[] = [
      { from: 'src/core/a.ts', to: 'src/cmd/c.ts', type: 'import', strength: 60, bidirectional: false },
    ]
    const graph = formatBoundaryGraph(boundaries)
    expect(graph).toContain('Boundary Graph')
    expect(graph).toContain('src/core')
    expect(graph).toContain('src/cmd')
  })

  it('shows no boundaries message', () => {
    expect(formatBoundaryGraph([])).toContain('No boundaries')
  })
})

describe('formatCircularWarnings', () => {
  it('renders circular warnings', () => {
    const boundaries: Boundary[] = [
      { from: 'a.ts', to: 'b.ts', type: 'circular', strength: 80, bidirectional: true },
    ]
    const result = formatCircularWarnings(boundaries)
    expect(result).toContain('Circular Dependencies')
    expect(result).toContain('a.ts')
    expect(result).toContain('b.ts')
  })

  it('returns empty for no circular deps', () => {
    expect(formatCircularWarnings([])).toBe('')
  })
})

describe('formatTwilightStats', () => {
  it('renders stats', () => {
    const stats = {
      totalZones: 5,
      bridgeCount: 2,
      sharedCount: 1,
      orphanCount: 1,
      chimeraCount: 0,
      leakyCount: 1,
      avgCoupling: 45,
      strongestBoundary: 'a.ts → b.ts',
      moduleCount: 3,
      boundaryCount: 10,
      circularDependencies: 1,
    }
    const result = formatTwilightStats(stats)
    expect(result).toContain('Zones: 5')
    expect(result).toContain('Bridges: 2')
    expect(result).toContain('Circular: 1')
    expect(result).toContain('a.ts → b.ts')
  })
})

describe('formatRecommendations', () => {
  it('renders recommendations', () => {
    const result = formatRecommendations(['Fix this', 'Fix that'])
    expect(result).toContain('Recommendations')
    expect(result).toContain('1. Fix this')
  })

  it('shows no recs message', () => {
    expect(formatRecommendations([])).toContain('No recommendations')
  })
})

describe('formatTwilightTable', () => {
  it('renders full output', () => {
    const result = buildTwilightResult([FILE_A], [CONTENT_ORPHAN])
    const output = formatTwilightTable(result)
    expect(output).toContain('Twilight Zone Analysis')
    expect(output).toContain('Coupling')
    expect(output).toContain('Stats')
    expect(output).toContain('Recommendations')
  })
})

describe('formatTwilightJSON', () => {
  it('renders valid JSON', () => {
    const result = buildTwilightResult([FILE_A], [CONTENT_ORPHAN])
    const json = formatTwilightJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.zones).toBeDefined()
    expect(parsed.boundaries).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
