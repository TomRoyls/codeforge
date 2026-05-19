import { describe, expect, it } from 'vitest'

import {
  buildCompassResult,
  computeNavigationComplexity,
  computeRouteDifficulty,
  findCenter,
  findNavigationRoutes,
  generateOnboardingGuide,
  generateRecommendations,
  identifyDirections,
  type CompassDirection,
  type CompassStats,
  type NavigationRoute,
} from '../src/commands/compass-helpers.js'

import {
  formatCompassJSON,
  formatCompassRose,
  formatCompassTable,
  formatComplexityMeter,
  formatDirectionCard,
  formatOnboardingGuide,
  formatRecommendations,
  formatRoutesTable,
  formatStatsSummary,
  formatCenterModule,
} from '../src/commands/compass-format-helpers.js'

// ─── identifyDirections ───────────────────────────────────────────────────────

describe('identifyDirections', () => {
  it('classifies index.ts as north', () => {
    const dirs = identifyDirections(['index.ts'], ['export function main() {}'])
    expect(dirs).toHaveLength(1)
    expect(dirs[0]!.direction).toBe('north')
    expect(dirs[0]!.name).toBe('Entry Points')
  })

  it('classifies main.ts as north', () => {
    const dirs = identifyDirections(['main.ts'], ['console.log("hi")'])
    expect(dirs[0]!.direction).toBe('north')
  })

  it('classifies server.ts as north', () => {
    const dirs = identifyDirections(['server.ts'], ['app.listen(3000)'])
    expect(dirs[0]!.direction).toBe('north')
  })

  it('classifies cli.ts as north', () => {
    const dirs = identifyDirections(['cli.ts'], ['run()'])
    expect(dirs[0]!.direction).toBe('north')
  })

  it('classifies test files as south', () => {
    const dirs = identifyDirections(['foo.test.ts'], ["import { foo } from './foo'"])
    expect(dirs[0]!.direction).toBe('south')
    expect(dirs[0]!.name).toBe('Tests')
  })

  it('classifies spec files as south', () => {
    const dirs = identifyDirections(['bar.spec.ts'], ['describe("bar", () => {})'])
    expect(dirs[0]!.direction).toBe('south')
  })

  it('classifies tsconfig.json as east', () => {
    const dirs = identifyDirections(['tsconfig.json'], ['{"compilerOptions": {}}'])
    expect(dirs[0]!.direction).toBe('east')
    expect(dirs[0]!.name).toBe('Configuration')
  })

  it('classifies package.json as east', () => {
    const dirs = identifyDirections(['package.json'], ['{"name": "test"}'])
    expect(dirs[0]!.direction).toBe('east')
  })

  it('classifies config.ts as east', () => {
    const dirs = identifyDirections(['app.config.ts'], ['export const config = {}'])
    expect(dirs[0]!.direction).toBe('east')
  })

  it('classifies .yaml files as east', () => {
    const dirs = identifyDirections(['docker-compose.yaml'], ['version: "3"'])
    expect(dirs[0]!.direction).toBe('east')
  })

  it('classifies dist files as west', () => {
    const dirs = identifyDirections(['dist/index.js'], ['module.exports = {}'])
    expect(dirs[0]!.direction).toBe('west')
    expect(dirs[0]!.name).toBe('Build Output')
  })

  it('classifies build files as west', () => {
    const dirs = identifyDirectories(['build/main.js'], ['var x = 1'])
    expect(dirs).toHaveLength(1)
    expect(dirs[0]!.direction).toBe('west')
  })

  it('classifies regular source files as center', () => {
    const dirs = identifyDirections(['utils.ts'], ['export function helper() {}'])
    expect(dirs[0]!.direction).toBe('center')
    expect(dirs[0]!.name).toBe('Core Logic')
  })

  it('classifies multiple files into correct directions', () => {
    const dirs = identifyDirections(
      ['index.ts', 'utils.ts', 'foo.test.ts', 'tsconfig.json'],
      ['export {}', 'export function util() {}', 'test("x", () => {})', '{}'],
    )
    expect(dirs).toHaveLength(4)
    const dirMap = new Map(dirs.map((d) => [d.direction, d]))
    expect(dirMap.get('north')!.files).toContain('index.ts')
    expect(dirMap.get('center')!.files).toContain('utils.ts')
    expect(dirMap.get('south')!.files).toContain('foo.test.ts')
    expect(dirMap.get('east')!.files).toContain('tsconfig.json')
  })

  it('counts file correctly', () => {
    const dirs = identifyDirections(
      ['a.test.ts', 'b.test.ts'],
      ['test1()', 'test2()'],
    )
    expect(dirs[0]!.fileCount).toBe(2)
  })

  it('counts total lines', () => {
    const dirs = identifyDirections(
      ['a.test.ts'],
      ['line1\nline2\nline3'],
    )
    expect(dirs[0]!.totalLines).toBe(3)
  })

  it('extracts key exports', () => {
    const dirs = identifyDirections(
      ['core.ts'],
      ['export function doStuff() {}\nexport class MyClass {}\nexport const VALUE = 42'],
    )
    expect(dirs[0]!.keyExports).toContain('doStuff')
    expect(dirs[0]!.keyExports).toContain('MyClass')
    expect(dirs[0]!.keyExports).toContain('VALUE')
  })

  it('limits key exports to 10', () => {
    const content = Array.from({ length: 15 }, (_, i) => `export const val${i} = ${i}`).join('\n')
    const dirs = identifyDirections(['core.ts'], [content])
    expect(dirs[0]!.keyExports.length).toBeLessThanOrEqual(10)
  })

  it('includes navigation hints', () => {
    const dirs = identifyDirections(['index.ts'], ['export {}'])
    expect(dirs[0]!.navigationHints.length).toBeGreaterThan(0)
  })

  it('includes description', () => {
    const dirs = identifyDirections(['index.ts'], ['export {}'])
    expect(dirs[0]!.description).toContain('Entry Points')
  })

  it('skips empty directions', () => {
    const dirs = identifyDirections(['utils.ts'], ['export {}'])
    const directions = dirs.map((d) => d.direction)
    expect(directions).not.toContain('south')
    expect(directions).not.toContain('east')
    expect(directions).not.toContain('west')
  })

  it('promotes index.ts from center to north when no north exists', () => {
    const dirs = identifyDirections(['src/index.ts', 'src/utils.ts'], ['export {}', 'export function x() {}'])
    const north = dirs.find((d) => d.direction === 'north')
    const center = dirs.find((d) => d.direction === 'center')
    expect(north).toBeDefined()
    expect(north!.files).toContain('src/index.ts')
    expect(center!.files).not.toContain('src/index.ts')
  })

  it('sorts files within each direction', () => {
    const dirs = identifyDirections(
      ['b.test.ts', 'a.test.ts', 'c.test.ts'],
      ['', '', ''],
    )
    expect(dirs[0]!.files).toEqual(['a.test.ts', 'b.test.ts', 'c.test.ts'])
  })

  it('handles empty file list', () => {
    const dirs = identifyDirections([], [])
    expect(dirs).toHaveLength(0)
  })

  it('handles app.ts as north', () => {
    const dirs = identifyDirections(['app.ts'], ['export {}'])
    expect(dirs[0]!.direction).toBe('north')
  })

  it('handles bin.ts as north', () => {
    const dirs = identifyDirectories(['bin.ts'], ['#!/usr/bin/env node'])
    expect(dirs).toHaveLength(1)
    expect(dirs[0]!.direction).toBe('north')
  })
})

function identifyDirectories(files: string[], contents: string[]): CompassDirection[] {
  return identifyDirections(files, contents)
}

// ─── findNavigationRoutes ─────────────────────────────────────────────────────

describe('findNavigationRoutes', () => {
  it('finds routes between directions', () => {
    const files = ['index.ts', 'utils.ts', 'foo.test.ts']
    const contents = [
      "import { x } from './utils'",
      'export function x() {}',
      "import { x } from './utils'",
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    expect(routes.length).toBeGreaterThan(0)
  })

  it('detects north-to-center route', () => {
    const files = ['index.ts', 'core.ts']
    const contents = [
      "import { main } from './core'",
      'export function main() {}',
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    expect(routes.some((r) => r.from === 'Entry Points' && r.to === 'Core Logic')).toBe(true)
  })

  it('detects south-to-center route', () => {
    const files = ['core.ts', 'core.test.ts']
    const contents = [
      'export function core() {}',
      "import { core } from './core'",
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    expect(routes.some((r) => r.from === 'Tests' && r.to === 'Core Logic')).toBe(true)
  })

  it('deduplicates direction-to-direction routes', () => {
    const files = ['index.ts', 'a.ts', 'b.ts']
    const contents = [
      "import { a } from './a'\nimport { b } from './b'",
      'export function a() {}',
      'export function b() {}',
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    const northToCenter = routes.filter((r) => r.from === 'Entry Points' && r.to === 'Core Logic')
    expect(northToCenter.length).toBe(1)
  })

  it('returns empty for no cross-direction imports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['export function a() {}', 'export function b() {}']
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    expect(routes).toHaveLength(0)
  })

  it('handles empty files', () => {
    const dirs = identifyDirections(['index.ts'], [''])
    const routes = findNavigationRoutes(dirs, ['index.ts'], [''])
    expect(routes).toHaveLength(0)
  })

  it('sets difficulty on routes', () => {
    const files = ['index.ts', 'src/deep/core.ts']
    const contents = [
      "import { x } from './src/deep/core'",
      'export function x() {}',
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    if (routes.length > 0) {
      expect(['easy', 'moderate', 'complex']).toContain(routes[0]!.difficulty)
    }
  })

  it('ignores non-relative imports', () => {
    const files = ['index.ts', 'core.ts']
    const contents = [
      "import chalk from 'chalk'",
      'export function x() {}',
    ]
    const dirs = identifyDirections(files, contents)
    const routes = findNavigationRoutes(dirs, files, contents)
    expect(routes).toHaveLength(0)
  })
})

// ─── computeRouteDifficulty ───────────────────────────────────────────────────

describe('computeRouteDifficulty', () => {
  it('returns easy for shallow paths', () => {
    expect(computeRouteDifficulty('a.ts', 'b.ts')).toBe('easy')
  })

  it('returns moderate for medium paths', () => {
    expect(computeRouteDifficulty('a.ts', 'src/lib/utils/helper.ts')).toBe('moderate')
  })

  it('returns complex for deep paths', () => {
    expect(computeRouteDifficulty('a.ts', 'src/a/b/c/d/helper.ts')).toBe('complex')
  })

  it('returns easy for same-directory files', () => {
    expect(computeRouteDifficulty('src/a.ts', 'src/b.ts')).toBe('easy')
  })

  it('handles one-level deep as easy', () => {
    expect(computeRouteDifficulty('a.ts', 'src/b.ts')).toBe('easy')
  })
})

// ─── findCenter ───────────────────────────────────────────────────────────────

describe('findCenter', () => {
  it('finds most-imported file as center', () => {
    const files = ['index.ts', 'core.ts', 'other.ts']
    const contents = [
      "import { x } from './core'",
      'export function x() {}',
      "import { x } from './core'",
    ]
    expect(findCenter(files, contents)).toBe('core.ts')
  })

  it('returns first file when no imports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = ['export function a() {}', 'export function b() {}']
    expect(findCenter(files, contents)).toBe('a.ts')
  })

  it('handles empty file list', () => {
    expect(findCenter([], [])).toBe('')
  })

  it('handles single file', () => {
    expect(findCenter(['solo.ts'], ['export {}'])).toBe('solo.ts')
  })

  it('counts only resolved imports', () => {
    const files = ['a.ts', 'b.ts']
    const contents = [
      "import chalk from 'chalk'",
      'export {}',
    ]
    expect(findCenter(files, contents)).toBe('a.ts')
  })
})

// ─── generateOnboardingGuide ──────────────────────────────────────────────────

describe('generateOnboardingGuide', () => {
  const makeDir = (direction: string, files: string[]): CompassDirection => ({
    direction: direction as CompassDirection['direction'],
    name: direction,
    description: '',
    files,
    fileCount: files.length,
    totalLines: 10,
    keyExports: [],
    navigationHints: [],
  })

  it('generates steps in correct order', () => {
    const dirs = [makeDir('north', ['index.ts']), makeDir('center', ['core.ts']), makeDir('south', ['core.test.ts'])]
    const guide = generateOnboardingGuide(dirs, [])
    expect(guide[0]).toContain('Entry Points')
    expect(guide.some((s) => s.includes('Core Logic'))).toBe(true)
  })

  it('skips missing directions', () => {
    const dirs = [makeDir('north', ['index.ts'])]
    const guide = generateOnboardingGuide(dirs, [])
    expect(guide.every((s) => !s.includes('Tests'))).toBe(true)
  })

  it('includes file paths', () => {
    const dirs = [makeDir('north', ['index.ts'])]
    const guide = generateOnboardingGuide(dirs, [])
    expect(guide.some((s) => s.includes('index.ts'))).toBe(true)
  })

  it('shows "and N more" for many files', () => {
    const dirs = [makeDir('center', ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts', 'f.ts'])]
    const guide = generateOnboardingGuide(dirs, [])
    expect(guide.some((s) => s.includes('more'))).toBe(true)
  })

  it('returns empty for no directions', () => {
    const guide = generateOnboardingGuide([], [])
    expect(guide).toHaveLength(0)
  })

  it('numbers steps', () => {
    const dirs = [makeDir('north', ['index.ts']), makeDir('center', ['core.ts'])]
    const guide = generateOnboardingGuide(dirs, [])
    expect(guide[0]).toMatch(/\[1\]/)
    expect(guide.some((s) => /\[2\]/.test(s))).toBe(true)
  })
})

// ─── computeNavigationComplexity ───────────────────────────────────────────────

describe('computeNavigationComplexity', () => {
  it('returns 0 for empty routes', () => {
    expect(computeNavigationComplexity([])).toBe(0)
  })

  it('returns low for easy routes', () => {
    const routes: NavigationRoute[] = [
      { from: 'A', to: 'B', path: ['a', 'b'], description: '', difficulty: 'easy' },
    ]
    expect(computeNavigationComplexity(routes)).toBeLessThanOrEqual(100)
  })

  it('returns higher for complex routes', () => {
    const routes: NavigationRoute[] = [
      { from: 'A', to: 'B', path: ['a', 'b', 'c', 'd', 'e'], description: '', difficulty: 'complex' },
    ]
    const easy: NavigationRoute[] = [
      { from: 'A', to: 'B', path: ['a'], description: '', difficulty: 'easy' },
    ]
    expect(computeNavigationComplexity(routes)).toBeGreaterThan(computeNavigationComplexity(easy))
  })

  it('caps at 100', () => {
    const routes: NavigationRoute[] = Array.from({ length: 20 }, () => ({
      from: 'A', to: 'B', path: ['a', 'b', 'c', 'd', 'e', 'f'],
      description: '', difficulty: 'complex' as const,
    }))
    expect(computeNavigationComplexity(routes)).toBeLessThanOrEqual(100)
  })
})

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  const makeStats = (overrides: Partial<CompassStats> = {}): CompassStats => ({
    totalDirections: 5,
    totalRoutes: 3,
    averageRouteLength: 2,
    mostConnectedDirection: 'center',
    leastConnectedDirection: 'west',
    navigationComplexity: 20,
    ...overrides,
  })

  it('recommends adding entry point when no north', () => {
    const dirs: CompassDirection[] = [
      { direction: 'center', name: 'Core', description: '', files: ['a.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats())
    expect(recs.some((r) => r.includes('entry point'))).toBe(true)
  })

  it('recommends adding tests when no south', () => {
    const dirs: CompassDirection[] = [
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats())
    expect(recs.some((r) => r.includes('test'))).toBe(true)
  })

  it('recommends config when no east', () => {
    const dirs: CompassDirection[] = [
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'south', name: 'Tests', description: '', files: ['a.test.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats())
    expect(recs.some((r) => r.includes('configuration') || r.includes('config'))).toBe(true)
  })

  it('recommends simplifying when complexity is high', () => {
    const dirs: CompassDirection[] = [
      { direction: 'center', name: 'Core', description: '', files: ['a.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'south', name: 'Tests', description: '', files: ['a.test.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats({ navigationComplexity: 80 }))
    expect(recs.some((r) => r.includes('simplifying') || r.includes('complexity'))).toBe(true)
  })

  it('recommends splitting large core', () => {
    const dirs: CompassDirection[] = [
      { direction: 'center', name: 'Core', description: '', files: Array.from({ length: 25 }, (_, i) => `f${i}.ts`), fileCount: 25, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'south', name: 'Tests', description: '', files: ['a.test.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats())
    expect(recs.some((r) => r.includes('splitting') || r.includes('sub-modules'))).toBe(true)
  })

  it('praises well-organized codebase', () => {
    const dirs: CompassDirection[] = [
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'center', name: 'Core', description: '', files: ['core.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'south', name: 'Tests', description: '', files: ['core.test.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'east', name: 'Config', description: '', files: ['tsconfig.json'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const recs = generateRecommendations(dirs, makeStats())
    expect(recs.some((r) => r.includes('well-organized'))).toBe(true)
  })
})

// ─── buildCompassResult ───────────────────────────────────────────────────────

describe('buildCompassResult', () => {
  it('builds complete result', () => {
    const files = ['index.ts', 'core.ts', 'core.test.ts', 'tsconfig.json']
    const contents = [
      "import { core } from './core'",
      'export function core() {}',
      "import { core } from './core'",
      '{}',
    ]
    const result = buildCompassResult(files, contents)
    expect(result.directions.length).toBeGreaterThan(0)
    expect(result.routes).toBeDefined()
    expect(result.center).toBeDefined()
    expect(result.stats).toBeDefined()
    expect(result.onboardingGuide).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })

  it('computes correct stats', () => {
    const files = ['index.ts', 'core.ts', 'core.test.ts']
    const contents = [
      "import { core } from './core'",
      'export function core() {}',
      "import { core } from './core'",
    ]
    const result = buildCompassResult(files, contents)
    expect(result.stats.totalDirections).toBeGreaterThan(0)
    expect(result.stats.totalRoutes).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigationComplexity).toBeGreaterThanOrEqual(0)
    expect(result.stats.navigationComplexity).toBeLessThanOrEqual(100)
  })

  it('identifies center as most-imported module', () => {
    const files = ['index.ts', 'core.ts']
    const contents = [
      "import { x } from './core'",
      'export function x() {}',
    ]
    const result = buildCompassResult(files, contents)
    expect(result.center).toBe('core.ts')
  })

  it('generates onboarding guide', () => {
    const files = ['index.ts', 'core.ts']
    const contents = ['export {}', 'export function core() {}']
    const result = buildCompassResult(files, contents)
    expect(result.onboardingGuide.length).toBeGreaterThan(0)
  })

  it('generates recommendations', () => {
    const files = ['index.ts']
    const contents = ['export {}']
    const result = buildCompassResult(files, contents)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('handles empty input', () => {
    const result = buildCompassResult([], [])
    expect(result.directions).toHaveLength(0)
    expect(result.center).toBe('')
    expect(result.stats.totalDirections).toBe(0)
  })

  it('most connected direction is populated', () => {
    const files = ['index.ts', 'core.ts', 'core.test.ts']
    const contents = [
      "import { core } from './core'",
      'export function core() {}',
      "import { core } from './core'",
    ]
    const result = buildCompassResult(files, contents)
    expect(result.stats.mostConnectedDirection).toBeTruthy()
    expect(result.stats.leastConnectedDirection).toBeTruthy()
  })
})

// ─── formatDirectionCard ──────────────────────────────────────────────────────

describe('formatDirectionCard', () => {
  it('formats a direction card', () => {
    const dir: CompassDirection = {
      direction: 'north',
      name: 'Entry Points',
      description: 'Where execution starts',
      files: ['index.ts'],
      fileCount: 1,
      totalLines: 42,
      keyExports: ['main'],
      navigationHints: ['Start here'],
    }
    const card = formatDirectionCard(dir)
    expect(card).toContain('Entry Points')
    expect(card).toContain('42')
    expect(card).toContain('main')
  })

  it('shows key exports', () => {
    const dir: CompassDirection = {
      direction: 'center',
      name: 'Core Logic',
      description: 'Core',
      files: ['core.ts'],
      fileCount: 1,
      totalLines: 10,
      keyExports: ['foo', 'bar'],
      navigationHints: [],
    }
    const card = formatDirectionCard(dir)
    expect(card).toContain('foo')
    expect(card).toContain('bar')
  })

  it('handles no key exports', () => {
    const dir: CompassDirection = {
      direction: 'east',
      name: 'Config',
      description: 'Config files',
      files: ['tsconfig.json'],
      fileCount: 1,
      totalLines: 5,
      keyExports: [],
      navigationHints: [],
    }
    const card = formatDirectionCard(dir)
    expect(card).not.toContain('Key exports')
  })
})

// ─── formatCompassRose ────────────────────────────────────────────────────────

describe('formatCompassRose', () => {
  it('renders compass rose with directions', () => {
    const dirs: CompassDirection[] = [
      { direction: 'north', name: 'Entry', description: '', files: ['index.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
      { direction: 'center', name: 'Core', description: '', files: ['core.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const rose = formatCompassRose(dirs)
    expect(rose).toContain('North')
    expect(rose).toContain('1 files')
  })

  it('shows dashes for missing directions', () => {
    const rose = formatCompassRose([])
    expect(rose).toContain('—')
  })

  it('shows center file name', () => {
    const dirs: CompassDirection[] = [
      { direction: 'center', name: 'Core', description: '', files: ['core.ts'], fileCount: 1, totalLines: 10, keyExports: [], navigationHints: [] },
    ]
    const rose = formatCompassRose(dirs)
    expect(rose).toContain('core.ts')
  })
})

// ─── formatRoutesTable ────────────────────────────────────────────────────────

describe('formatRoutesTable', () => {
  it('formats routes table', () => {
    const routes: NavigationRoute[] = [
      { from: 'Entry Points', to: 'Core Logic', path: ['a', 'b'], description: '', difficulty: 'easy' },
    ]
    const table = formatRoutesTable(routes)
    expect(table).toContain('Entry Points')
    expect(table).toContain('Core Logic')
    expect(table).toContain('easy')
  })

  it('shows message for no routes', () => {
    const table = formatRoutesTable([])
    expect(table).toContain('No navigation routes')
  })

  it('color-codes difficulty', () => {
    const routes: NavigationRoute[] = [
      { from: 'A', to: 'B', path: [], description: '', difficulty: 'moderate' },
    ]
    const table = formatRoutesTable(routes)
    expect(table).toContain('moderate')
  })
})

// ─── formatOnboardingGuide ────────────────────────────────────────────────────

describe('formatOnboardingGuide', () => {
  it('formats guide steps', () => {
    const guide = formatOnboardingGuide(['[1] Start with Entry Points', '    → index.ts'])
    expect(guide).toContain('Entry Points')
    expect(guide).toContain('index.ts')
  })

  it('shows message for empty guide', () => {
    const guide = formatOnboardingGuide([])
    expect(guide).toContain('No onboarding steps')
  })
})

// ─── formatComplexityMeter ────────────────────────────────────────────────────

describe('formatComplexityMeter', () => {
  it('renders meter', () => {
    const meter = formatComplexityMeter(50)
    expect(meter).toContain('50/100')
    expect(meter).toContain('█')
    expect(meter).toContain('░')
  })

  it('renders 0 complexity', () => {
    const meter = formatComplexityMeter(0)
    expect(meter).toContain('0/100')
  })

  it('renders 100 complexity', () => {
    const meter = formatComplexityMeter(100)
    expect(meter).toContain('100/100')
  })
})

// ─── formatStatsSummary ───────────────────────────────────────────────────────

describe('formatStatsSummary', () => {
  it('formats stats', () => {
    const stats: CompassStats = {
      totalDirections: 4,
      totalRoutes: 5,
      averageRouteLength: 2.3,
      mostConnectedDirection: 'center',
      leastConnectedDirection: 'west',
      navigationComplexity: 30,
    }
    const summary = formatStatsSummary(stats)
    expect(summary).toContain('4')
    expect(summary).toContain('5')
    expect(summary).toContain('2.3')
    expect(summary).toContain('center')
    expect(summary).toContain('west')
  })
})

// ─── formatRecommendations ────────────────────────────────────────────────────

describe('formatRecommendations', () => {
  it('formats recommendations', () => {
    const recs = formatRecommendations(['Add tests', 'Add entry point'])
    expect(recs).toContain('Add tests')
    expect(recs).toContain('Add entry point')
  })

  it('numbers recommendations', () => {
    const recs = formatRecommendations(['First', 'Second'])
    expect(recs).toContain('1.')
    expect(recs).toContain('2.')
  })

  it('shows message for empty recommendations', () => {
    const recs = formatRecommendations([])
    expect(recs).toContain('No recommendations')
  })
})

// ─── formatCenterModule ───────────────────────────────────────────────────────

describe('formatCenterModule', () => {
  it('formats center module', () => {
    const formatted = formatCenterModule('src/core.ts')
    expect(formatted).toContain('src/core.ts')
    expect(formatted).toContain('Center Module')
  })
})

// ─── formatCompassTable ───────────────────────────────────────────────────────

describe('formatCompassTable', () => {
  it('formats full table', () => {
    const result = buildCompassResult(
      ['index.ts', 'core.ts', 'core.test.ts'],
      ["import { core } from './core'", 'export function core() {}', "import { core } from './core'"],
    )
    const table = formatCompassTable(result)
    expect(table).toContain('Codebase Compass')
    expect(table).toContain('Navigation Routes')
    expect(table).toContain('Compass Stats')
    expect(table).toContain('Onboarding Guide')
    expect(table).toContain('Recommendations')
  })
})

// ─── formatCompassJSON ────────────────────────────────────────────────────────

describe('formatCompassJSON', () => {
  it('formats as valid JSON', () => {
    const result = buildCompassResult(['index.ts'], ['export {}'])
    const json = formatCompassJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.directions).toBeDefined()
    expect(parsed.routes).toBeDefined()
    expect(parsed.center).toBeDefined()
    expect(parsed.stats).toBeDefined()
  })
})
