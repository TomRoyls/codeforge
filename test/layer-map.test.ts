import { describe, expect, it } from 'vitest'

import {
  type ArchLayer,
  type LayerDependency,
  type LayerMapResult,
  buildLayerMapResult,
  buildLayers,
  computeHealthScore,
  computeLayerBalance,
  detectCircularDependencies,
  detectLayer,
  detectLayerViolations,
  analyzeLayerDependencies,
  extractImportPaths,
  getLayerColor,
  getLayerDepth,
  isDependencyViolation,
  resolveImportToLayerFile,
} from '../src/commands/layer-map-helpers.js'
import {
  formatBalanceMeter,
  formatHealthMeter,
  formatLayerDiagram,
  formatLayerMapCsv,
  formatLayerMapJson,
  formatLayerMapTable,
  formatDependencyArrows,
  formatViolationsTable,
} from '../src/commands/layer-map-format-helpers.js'

// ─── detectLayer ──────────────────────────────────────────────────────────────

describe('detectLayer', () => {
  it('classifies components/ as presentation', () => {
    expect(detectLayer('src/components/Button.tsx')).toBe('presentation')
  })

  it('classifies views/ as presentation', () => {
    expect(detectLayer('src/views/Home.tsx')).toBe('presentation')
  })

  it('classifies pages/ as presentation', () => {
    expect(detectLayer('src/pages/Index.tsx')).toBe('presentation')
  })

  it('classifies routes/ as presentation', () => {
    expect(detectLayer('src/routes/api.ts')).toBe('presentation')
  })

  it('classifies controllers/ as presentation', () => {
    expect(detectLayer('src/controllers/user.ctrl.ts')).toBe('presentation')
  })

  it('classifies handlers/ as presentation', () => {
    expect(detectLayer('src/handler/request.ts')).toBe('presentation')
  })

  it('classifies commands/ as presentation', () => {
    expect(detectLayer('src/commands/build.ts')).toBe('presentation')
  })

  it('classifies services/ as business', () => {
    expect(detectLayer('src/services/user.service.ts')).toBe('business')
  })

  it('classifies domain/ as business', () => {
    expect(detectLayer('src/domain/user.ts')).toBe('business')
  })

  it('classifies core/ as business', () => {
    expect(detectLayer('src/core/engine.ts')).toBe('business')
  })

  it('classifies features/ as business', () => {
    expect(detectLayer('src/features/auth.ts')).toBe('business')
  })

  it('classifies repositories/ as data', () => {
    expect(detectLayer('src/repositories/user.repo.ts')).toBe('data')
  })

  it('classifies models/ as data', () => {
    expect(detectLayer('src/models/user.model.ts')).toBe('data')
  })

  it('classifies database/ as data', () => {
    expect(detectLayer('src/database/connection.ts')).toBe('data')
  })

  it('classifies stores/ as data', () => {
    expect(detectLayer('src/stores/cart.ts')).toBe('data')
  })

  it('classifies config/ as infrastructure', () => {
    expect(detectLayer('src/config/settings.ts')).toBe('infrastructure')
  })

  it('classifies utils/ as infrastructure', () => {
    expect(detectLayer('src/utils/format.ts')).toBe('infrastructure')
  })

  it('classifies lib/ as infrastructure', () => {
    expect(detectLayer('src/lib/logger.ts')).toBe('infrastructure')
  })

  it('classifies shared/ as infrastructure', () => {
    expect(detectLayer('src/shared/types.ts')).toBe('infrastructure')
  })

  it('classifies test/ as tests', () => {
    expect(detectLayer('test/app.test.ts')).toBe('tests')
  })

  it('classifies __tests__/ as tests', () => {
    expect(detectLayer('src/__tests__/app.test.ts')).toBe('tests')
  })

  it('classifies .test. files as tests', () => {
    expect(detectLayer('src/utils/format.test.ts')).toBe('tests')
  })

  it('classifies .spec. files as tests', () => {
    expect(detectLayer('src/app.spec.ts')).toBe('tests')
  })

  it('classifies root index.ts as entry', () => {
    expect(detectLayer('index.ts')).toBe('entry')
  })

  it('classifies root main.ts as entry', () => {
    expect(detectLayer('src/main.ts')).toBe('entry')
  })

  it('classifies root app.ts as entry', () => {
    expect(detectLayer('src/app.ts')).toBe('entry')
  })

  it('classifies root server.ts as entry', () => {
    expect(detectLayer('server.ts')).toBe('entry')
  })

  it('returns unknown for unmatched paths', () => {
    expect(detectLayer('src/foobar/baz.ts')).toBe('unknown')
  })

  it('handles Windows-style paths', () => {
    expect(detectLayer('src\\components\\Button.tsx')).toBe('presentation')
  })

  it('prioritizes test detection over other layers', () => {
    expect(detectLayer('src/__tests__/components/Button.test.tsx')).toBe('tests')
  })

  it('detects spec/ directory as tests', () => {
    expect(detectLayer('spec/app.spec.ts')).toBe('tests')
  })
})

// ─── getLayerDepth / getLayerColor ────────────────────────────────────────────

describe('getLayerDepth', () => {
  it('returns 0 for entry', () => {
    expect(getLayerDepth('entry')).toBe(0)
  })

  it('returns 1 for presentation', () => {
    expect(getLayerDepth('presentation')).toBe(1)
  })

  it('returns 2 for business', () => {
    expect(getLayerDepth('business')).toBe(2)
  })

  it('returns 3 for data', () => {
    expect(getLayerDepth('data')).toBe(3)
  })

  it('returns 4 for infrastructure', () => {
    expect(getLayerDepth('infrastructure')).toBe(4)
  })

  it('returns 5 for tests', () => {
    expect(getLayerDepth('tests')).toBe(5)
  })

  it('returns 6 for unknown layers', () => {
    expect(getLayerDepth('custom')).toBe(6)
  })
})

describe('getLayerColor', () => {
  it('returns green for entry', () => {
    expect(getLayerColor('entry')).toBe('green')
  })

  it('returns cyan for presentation', () => {
    expect(getLayerColor('presentation')).toBe('cyan')
  })

  it('returns yellow for business', () => {
    expect(getLayerColor('business')).toBe('yellow')
  })

  it('returns white for unknown', () => {
    expect(getLayerColor('custom')).toBe('white')
  })
})

// ─── buildLayers ──────────────────────────────────────────────────────────────

describe('buildLayers', () => {
  it('groups files into layers', () => {
    const files = ['src/components/A.tsx', 'src/services/B.ts']
    const contents = ['line1\nline2', 'line1']
    const layers = buildLayers(files, contents)

    expect(layers).toHaveLength(2)
    expect(layers.find((l) => l.name === 'presentation')).toBeDefined()
    expect(layers.find((l) => l.name === 'business')).toBeDefined()
  })

  it('computes fileCount and totalLines', () => {
    const files = ['src/components/A.tsx', 'src/components/B.tsx']
    const contents = ['a\nb\nc', 'd\ne']
    const layers = buildLayers(files, contents)

    const pres = layers.find((l) => l.name === 'presentation')!
    expect(pres.fileCount).toBe(2)
    expect(pres.totalLines).toBe(5)
  })

  it('computes totalSize', () => {
    const files = ['src/config/a.ts']
    const contents = ['hello']
    const layers = buildLayers(files, contents)

    const infra = layers.find((l) => l.name === 'infrastructure')!
    expect(infra.totalSize).toBe(5)
  })

  it('sorts layers by depth', () => {
    const files = ['src/config/a.ts', 'src/components/b.tsx', 'src/services/c.ts']
    const contents = ['x', 'y', 'z']
    const layers = buildLayers(files, contents)

    const depths = layers.map((l) => l.depth)
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]!).toBeGreaterThanOrEqual(depths[i - 1]!)
    }
  })

  it('returns empty array for no files', () => {
    expect(buildLayers([], [])).toEqual([])
  })

  it('assigns correct depth values', () => {
    const files = ['src/components/a.tsx', 'src/data/b.ts']
    const contents = ['x', 'y']
    const layers = buildLayers(files, contents)

    const pres = layers.find((l) => l.name === 'presentation')!
    const data = layers.find((l) => l.name === 'data')!
    expect(pres.depth).toBeLessThan(data.depth)
  })
})

// ─── extractImportPaths ──────────────────────────────────────────────────────

describe('extractImportPaths', () => {
  it('extracts relative imports', () => {
    const code = "import { foo } from './bar'"
    expect(extractImportPaths(code)).toEqual(['./bar'])
  })

  it('extracts multiple imports', () => {
    const code = "import { a } from './x'\nimport { b } from './y'"
    expect(extractImportPaths(code)).toEqual(['./x', './y'])
  })

  it('ignores bare imports', () => {
    const code = "import 'reflect-metadata'"
    expect(extractImportPaths(code)).toEqual([])
  })

  it('extracts type imports', () => {
    const code = "import type { Config } from './types'"
    expect(extractImportPaths(code)).toEqual(['./types'])
  })

  it('returns empty for no imports', () => {
    expect(extractImportPaths('const x = 1')).toEqual([])
  })
})

// ─── isDependencyViolation ────────────────────────────────────────────────────

describe('isDependencyViolation', () => {
  it('flags data → presentation as violation (upward)', () => {
    expect(isDependencyViolation('data', 'presentation')).toBe(true)
  })

  it('flags infrastructure → presentation as violation (upward)', () => {
    expect(isDependencyViolation('infrastructure', 'presentation')).toBe(true)
  })

  it('flags data → entry as violation (upward)', () => {
    expect(isDependencyViolation('data', 'entry')).toBe(true)
  })

  it('allows presentation → business (downward)', () => {
    expect(isDependencyViolation('presentation', 'business')).toBe(false)
  })

  it('allows business → data (downward)', () => {
    expect(isDependencyViolation('business', 'data')).toBe(false)
  })

  it('flags entry → data as skip-layer', () => {
    expect(isDependencyViolation('entry', 'data')).toBe(true)
  })

  it('flags presentation → infrastructure as skip-layer', () => {
    expect(isDependencyViolation('presentation', 'infrastructure')).toBe(true)
  })

  it('exempts tests layer', () => {
    expect(isDependencyViolation('tests', 'presentation')).toBe(false)
    expect(isDependencyViolation('data', 'tests')).toBe(false)
  })

  it('exempts unknown layer', () => {
    expect(isDependencyViolation('unknown', 'presentation')).toBe(false)
    expect(isDependencyViolation('data', 'unknown')).toBe(false)
  })

  it('allows same layer (not a cross-layer dep)', () => {
    expect(isDependencyViolation('business', 'business')).toBe(false)
  })

  it('allows entry → presentation (adjacent)', () => {
    expect(isDependencyViolation('entry', 'presentation')).toBe(false)
  })

  it('allows data → infrastructure (adjacent)', () => {
    expect(isDependencyViolation('data', 'infrastructure')).toBe(false)
  })
})

// ─── resolveImportToLayerFile ─────────────────────────────────────────────────

describe('resolveImportToLayerFile', () => {
  it('resolves direct file imports', () => {
    const map = new Map([['src/services/foo.ts', 'business']])
    expect(resolveImportToLayerFile('./foo', 'src/services/bar.ts', map)).toBe('src/services/foo.ts')
  })

  it('resolves with extension', () => {
    const map = new Map([['src/services/foo.ts', 'business']])
    expect(resolveImportToLayerFile('./foo.ts', 'src/services/bar.ts', map)).toBe('src/services/foo.ts')
  })

  it('resolves parent directory imports', () => {
    const map = new Map([['src/utils/helper.ts', 'infrastructure']])
    expect(resolveImportToLayerFile('../../utils/helper', 'src/services/deep/impl.ts', map)).toBe('src/utils/helper.ts')
  })

  it('returns null for unmatched imports', () => {
    const map = new Map([['src/services/foo.ts', 'business']])
    expect(resolveImportToLayerFile('./nonexistent', 'src/services/bar.ts', map)).toBeNull()
  })

  it('resolves index imports', () => {
    const map = new Map([['src/utils/index.ts', 'infrastructure']])
    expect(resolveImportToLayerFile('../utils', 'src/services/foo.ts', map)).toBe('src/utils/index.ts')
  })

  it('returns null for non-relative imports', () => {
    const map = new Map([['src/services/foo.ts', 'business']])
    expect(resolveImportToLayerFile('react', 'src/components/a.tsx', map)).toBeNull()
  })
})

// ─── analyzeLayerDependencies ─────────────────────────────────────────────────

describe('analyzeLayerDependencies', () => {
  it('detects cross-layer dependencies', () => {
    const files = ['src/components/a.tsx', 'src/services/b.ts']
    const contents = ["import { foo } from '../services/b'", 'export const foo = 1']
    const layers = buildLayers(files, contents)
    const deps = analyzeLayerDependencies(layers, files, contents)

    const crossDep = deps.find((d) => d.from === 'presentation' && d.to === 'business')
    expect(crossDep).toBeDefined()
    expect(crossDep!.count).toBe(1)
  })

  it('marks violations correctly', () => {
    const files = ['src/data/repo.ts', 'src/components/ui.tsx']
    const contents = [
      "import { x } from '../components/ui'",
      'export const x = 1',
    ]
    const layers = buildLayers(files, contents)
    const deps = analyzeLayerDependencies(layers, files, contents)

    const upward = deps.find((d) => d.from === 'data' && d.to === 'presentation')
    expect(upward).toBeDefined()
    expect(upward!.isViolation).toBe(true)
  })

  it('returns empty for no cross-layer deps', () => {
    const files = ['src/components/a.tsx', 'src/components/b.tsx']
    const contents = ["import { x } from './b'", 'export const x = 1']
    const layers = buildLayers(files, contents)
    const deps = analyzeLayerDependencies(layers, files, contents)

    expect(deps).toHaveLength(0)
  })

  it('handles empty input', () => {
    const layers = buildLayers([], [])
    expect(analyzeLayerDependencies(layers, [], [])).toEqual([])
  })
})

// ─── detectLayerViolations ────────────────────────────────────────────────────

describe('detectLayerViolations', () => {
  it('detects upward dependencies', () => {
    const deps: LayerDependency[] = [
      { from: 'data', to: 'presentation', count: 2, files: ['a.ts'], isViolation: true },
    ]
    const violations = detectLayerViolations(deps)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.type).toBe('upward-dependency')
    expect(violations[0]!.severity).toBe('critical')
  })

  it('detects skip-layer dependencies', () => {
    const deps: LayerDependency[] = [
      { from: 'entry', to: 'data', count: 1, files: ['main.ts'], isViolation: true },
    ]
    const violations = detectLayerViolations(deps)

    expect(violations).toHaveLength(1)
    expect(violations[0]!.type).toBe('skip-layer')
    expect(violations[0]!.severity).toBe('warning')
  })

  it('detects circular dependencies', () => {
    const deps: LayerDependency[] = [
      { from: 'presentation', to: 'business', count: 2, files: ['a.tsx'], isViolation: false },
      { from: 'business', to: 'presentation', count: 1, files: ['b.ts'], isViolation: true },
    ]
    const violations = detectLayerViolations(deps)

    const circular = violations.find((v) => v.type === 'circular')
    expect(circular).toBeDefined()
  })

  it('skips non-violations', () => {
    const deps: LayerDependency[] = [
      { from: 'presentation', to: 'business', count: 5, files: ['a.tsx'], isViolation: false },
    ]
    const violations = detectLayerViolations(deps)

    expect(violations).toHaveLength(0)
  })

  it('returns empty for no deps', () => {
    expect(detectLayerViolations([])).toEqual([])
  })
})

// ─── detectCircularDependencies ───────────────────────────────────────────────

describe('detectCircularDependencies', () => {
  it('finds circular deps', () => {
    const deps: LayerDependency[] = [
      { from: 'a', to: 'b', count: 1, files: [], isViolation: false },
      { from: 'b', to: 'a', count: 1, files: [], isViolation: false },
    ]
    expect(detectCircularDependencies(deps)).toHaveLength(1)
  })

  it('returns empty when no circles', () => {
    const deps: LayerDependency[] = [
      { from: 'a', to: 'b', count: 1, files: [], isViolation: false },
    ]
    expect(detectCircularDependencies(deps)).toHaveLength(0)
  })

  it('does not double-count', () => {
    const deps: LayerDependency[] = [
      { from: 'a', to: 'b', count: 1, files: [], isViolation: false },
      { from: 'b', to: 'a', count: 1, files: [], isViolation: false },
      { from: 'b', to: 'c', count: 1, files: [], isViolation: false },
      { from: 'c', to: 'b', count: 1, files: [], isViolation: false },
    ]
    expect(detectCircularDependencies(deps)).toHaveLength(2)
  })
})

// ─── computeLayerBalance ──────────────────────────────────────────────────────

describe('computeLayerBalance', () => {
  it('returns 1 for single layer', () => {
    const layers: ArchLayer[] = [{ name: 'a', files: ['f.ts'], fileCount: 1, totalLines: 10, totalSize: 100, imports: [], exports: [], depth: 0, color: 'green' }]
    expect(computeLayerBalance(layers)).toBe(1)
  })

  it('returns 1 for perfectly balanced layers', () => {
    const layers: ArchLayer[] = [
      { name: 'a', files: [], fileCount: 5, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 0, color: 'green' },
      { name: 'b', files: [], fileCount: 5, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 1, color: 'cyan' },
    ]
    expect(computeLayerBalance(layers)).toBe(1)
  })

  it('returns lower balance for unbalanced layers', () => {
    const layers: ArchLayer[] = [
      { name: 'a', files: [], fileCount: 9, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 0, color: 'green' },
      { name: 'b', files: [], fileCount: 1, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 1, color: 'cyan' },
    ]
    expect(computeLayerBalance(layers)).toBeLessThan(1)
  })

  it('returns 1 for empty layers', () => {
    expect(computeLayerBalance([])).toBe(1)
  })

  it('returns 0 when all files in one layer', () => {
    const layers: ArchLayer[] = [
      { name: 'a', files: [], fileCount: 10, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 0, color: 'green' },
      { name: 'b', files: [], fileCount: 0, totalLines: 0, totalSize: 0, imports: [], exports: [], depth: 1, color: 'cyan' },
    ]
    expect(computeLayerBalance(layers)).toBe(0)
  })
})

// ─── computeHealthScore ───────────────────────────────────────────────────────

describe('computeHealthScore', () => {
  it('returns 100 for no violations and perfect balance', () => {
    expect(computeHealthScore(0, 1)).toBe(100)
  })

  it('penalizes for violations', () => {
    const score = computeHealthScore(3, 1)
    expect(score).toBeLessThan(100)
  })

  it('penalizes for low balance', () => {
    const highBalance = computeHealthScore(0, 1)
    const lowBalance = computeHealthScore(0, 0.2)
    expect(lowBalance).toBeLessThan(highBalance)
  })

  it('never goes below 0', () => {
    expect(computeHealthScore(100, 0)).toBeGreaterThanOrEqual(0)
  })

  it('never goes above 100', () => {
    expect(computeHealthScore(0, 1)).toBeLessThanOrEqual(100)
  })

  it('returns 50 with no violations and 0 balance', () => {
    expect(computeHealthScore(0, 0)).toBe(50)
  })
})

// ─── buildLayerMapResult ──────────────────────────────────────────────────────

describe('buildLayerMapResult', () => {
  it('returns a complete result', () => {
    const files = ['src/components/a.tsx', 'src/services/b.ts']
    const contents = ["import { x } from '../services/b'", 'export const x = 1']
    const result = buildLayerMapResult(files, contents)

    expect(result.layers.length).toBeGreaterThan(0)
    expect(result.dependencies).toBeDefined()
    expect(result.violations).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('populates stats correctly', () => {
    const files = ['src/components/a.tsx']
    const contents = ['line1\nline2\nline3']
    const result = buildLayerMapResult(files, contents)

    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.totalLines).toBe(3)
    expect(result.stats.totalLayers).toBeGreaterThan(0)
  })

  it('computes healthScore', () => {
    const files = ['src/components/a.tsx']
    const contents = ['x']
    const result = buildLayerMapResult(files, contents)

    expect(result.stats.healthScore).toBeGreaterThanOrEqual(0)
    expect(result.stats.healthScore).toBeLessThanOrEqual(100)
  })

  it('populates layer imports and exports', () => {
    const files = ['src/components/a.tsx', 'src/services/b.ts']
    const contents = ["import { x } from '../services/b'", 'export const x = 1']
    const result = buildLayerMapResult(files, contents)

    const pres = result.layers.find((l) => l.name === 'presentation')
    expect(pres).toBeDefined()
    expect(pres!.exports.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildLayerMapResult([], [])

    expect(result.layers).toEqual([])
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.totalLines).toBe(0)
    expect(result.stats.healthScore).toBe(100)
  })

  it('detects violations in real scenario', () => {
    const files = ['src/data/repo.ts', 'src/components/ui.tsx']
    const contents = [
      "import { x } from '../components/ui'",
      'export const x = 1',
    ]
    const result = buildLayerMapResult(files, contents)

    expect(result.violations.length).toBeGreaterThan(0)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('formatLayerDiagram', () => {
  it('handles empty layers', () => {
    const output = formatLayerDiagram([])
    expect(output).toContain('No layers detected')
  })

  it('renders layers with file counts', () => {
    const layers: ArchLayer[] = [
      { name: 'presentation', files: ['a.tsx'], fileCount: 5, totalLines: 100, totalSize: 500, imports: [], exports: [], depth: 1, color: 'cyan' },
      { name: 'business', files: ['b.ts'], fileCount: 3, totalLines: 60, totalSize: 300, imports: [], exports: [], depth: 2, color: 'yellow' },
    ]
    const output = formatLayerDiagram(layers)
    expect(output).toContain('presentation')
    expect(output).toContain('business')
    expect(output).toContain('5')
    expect(output).toContain('3')
  })
})

describe('formatHealthMeter', () => {
  it('renders a meter', () => {
    const output = formatHealthMeter(80)
    expect(output).toContain('80')
    expect(output).toContain('/100')
  })

  it('renders 0 score', () => {
    const output = formatHealthMeter(0)
    expect(output).toContain('0')
  })

  it('renders 100 score', () => {
    const output = formatHealthMeter(100)
    expect(output).toContain('100')
  })
})

describe('formatBalanceMeter', () => {
  it('renders balance', () => {
    const output = formatBalanceMeter(0.75)
    expect(output).toContain('0.75')
  })

  it('renders zero balance', () => {
    const output = formatBalanceMeter(0)
    expect(output).toContain('0')
  })
})

describe('formatDependencyArrows', () => {
  it('handles empty deps', () => {
    const output = formatDependencyArrows([])
    expect(output).toContain('No cross-layer dependencies')
  })

  it('renders dependencies', () => {
    const deps: LayerDependency[] = [
      { from: 'presentation', to: 'business', count: 3, files: ['a.tsx'], isViolation: false },
    ]
    const output = formatDependencyArrows(deps)
    expect(output).toContain('presentation')
    expect(output).toContain('business')
    expect(output).toContain('3')
  })

  it('marks violations', () => {
    const deps: LayerDependency[] = [
      { from: 'data', to: 'presentation', count: 1, files: ['a.ts'], isViolation: true },
    ]
    const output = formatDependencyArrows(deps)
    expect(output).toContain('VIOLATION')
  })
})

describe('formatViolationsTable', () => {
  it('handles no violations', () => {
    const output = formatViolationsTable([])
    expect(output).toContain('No violations detected')
  })

  it('renders violations', () => {
    const violations = [
      { from: 'data', to: 'presentation', type: 'upward-dependency' as const, description: 'test', severity: 'critical' as const, files: ['a.ts'] },
    ]
    const output = formatViolationsTable(violations)
    expect(output).toContain('data')
    expect(output).toContain('presentation')
  })
})

describe('formatLayerMapTable', () => {
  it('renders complete table output', () => {
    const result: LayerMapResult = {
      layers: [
        { name: 'presentation', files: ['a.tsx'], fileCount: 1, totalLines: 10, totalSize: 50, imports: [], exports: ['a.tsx'], depth: 1, color: 'cyan' },
      ],
      dependencies: [],
      violations: [],
      stats: { totalLayers: 1, totalFiles: 1, totalLines: 10, violationsCount: 0, layerBalance: 1, healthScore: 100 },
      recommendations: ['Looks good!'],
    }
    const output = formatLayerMapTable(result, false)
    expect(output).toContain('presentation')
    expect(output).toContain('Health Score')
    expect(output).toContain('100')
  })

  it('includes verbose layer details', () => {
    const result: LayerMapResult = {
      layers: [
        { name: 'presentation', files: ['a.tsx', 'b.tsx', 'c.tsx', 'd.tsx', 'e.tsx', 'f.tsx'], fileCount: 6, totalLines: 60, totalSize: 300, imports: [], exports: [], depth: 1, color: 'cyan' },
      ],
      dependencies: [],
      violations: [],
      stats: { totalLayers: 1, totalFiles: 6, totalLines: 60, violationsCount: 0, layerBalance: 1, healthScore: 100 },
      recommendations: [],
    }
    const output = formatLayerMapTable(result, true)
    expect(output).toContain('Layer Details')
    expect(output).toContain('... and 1 more')
  })
})

describe('formatLayerMapJson', () => {
  it('produces valid JSON', () => {
    const result: LayerMapResult = {
      layers: [],
      dependencies: [],
      violations: [],
      stats: { totalLayers: 0, totalFiles: 0, totalLines: 0, violationsCount: 0, layerBalance: 1, healthScore: 100 },
      recommendations: [],
    }
    const json = formatLayerMapJson(result)
    const parsed = JSON.parse(json)
    expect(parsed.stats.totalFiles).toBe(0)
  })
})

describe('formatLayerMapCsv', () => {
  it('produces CSV with headers', () => {
    const result: LayerMapResult = {
      layers: [
        { name: 'presentation', files: [], fileCount: 5, totalLines: 50, totalSize: 250, imports: [], exports: [], depth: 1, color: 'cyan' },
      ],
      dependencies: [{ from: 'presentation', to: 'business', count: 2, files: ['a.tsx'], isViolation: false }],
      violations: [],
      stats: { totalLayers: 1, totalFiles: 5, totalLines: 50, violationsCount: 0, layerBalance: 1, healthScore: 100 },
      recommendations: [],
    }
    const csv = formatLayerMapCsv(result)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('type,name,value')
    expect(lines.find((l) => l.startsWith('layer,'))).toBeDefined()
    expect(lines.find((l) => l.startsWith('dependency,'))).toBeDefined()
    expect(lines.find((l) => l.startsWith('stat,healthScore,'))).toBeDefined()
  })
})
