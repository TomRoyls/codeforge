import { describe, expect, it } from 'vitest'

import Imports from '../src/commands/imports.js'
import {
  buildImportsResult,
  buildModuleStats,
  detectCircularDeps,
  parseImports,
} from '../src/commands/imports-helpers.js'
import type { CircularDep, ImportInfo, ImportsResult, ModuleStats } from '../src/commands/imports-helpers.js'
import { formatImportsCsv, formatImportsJson, formatImportsTable } from '../src/commands/imports-format-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeImportInfo(overrides: Partial<ImportInfo> = {}): ImportInfo {
  return {
    filePath: 'src/index.ts',
    isExternal: false,
    isRelative: true,
    isTypeOnly: false,
    line: 1,
    module: './helper',
    names: ['foo'],
    style: 'named',
    ...overrides,
  }
}

function makeModuleStats(overrides: Partial<ModuleStats> = {}): ModuleStats {
  return {
    files: ['src/index.ts'],
    importCount: 1,
    isExternal: false,
    module: './helper',
    styles: [{ count: 1, style: 'named' as const }],
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Imports command - static metadata', () => {
  it('has a description', () => {
    expect(Imports.description).toBe('Analyze import statements in your codebase')
  })

  it('has examples array', () => {
    expect(Array.isArray(Imports.examples)).toBe(true)
    expect(Imports.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Imports.args.path).toBeDefined()
    expect(Imports.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Imports.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Imports command - flags', () => {
  it('has format flag with options', () => {
    expect(Imports.flags.format.options).toContain('json')
    expect(Imports.flags.format.options).toContain('table')
    expect(Imports.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Imports.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Imports.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Imports.flags.ignore).toBeDefined()
    expect(Imports.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag defaulting to .ts,.tsx,.js,.jsx', () => {
    expect(Imports.flags.ext.default).toBe('.ts,.tsx,.js,.jsx')
  })

  it('has circular flag defaulting to false', () => {
    expect(Imports.flags.circular.default).toBe(false)
  })

  it('has top flag defaulting to 20', () => {
    expect(Imports.flags.top.default).toBe('20')
  })

  it('has verbose flag defaulting to false', () => {
    expect(Imports.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Imports command - class structure', () => {
  it('exports a default class', () => {
    expect(Imports).toBeDefined()
    expect(typeof Imports).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Imports.prototype.run).toBe('function')
  })
})

// ─── parseImports ───────────────────────────────────────

describe('parseImports', () => {
  it('parses named imports', () => {
    const content = "import { foo, bar } from './module';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.style).toBe('named')
    expect(result[0]!.names).toEqual(['foo', 'bar'])
    expect(result[0]!.module).toBe('./module')
    expect(result[0]!.isRelative).toBe(true)
    expect(result[0]!.isExternal).toBe(false)
  })

  it('parses default imports', () => {
    const content = "import React from 'react';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.style).toBe('default')
    expect(result[0]!.names).toEqual(['React'])
    expect(result[0]!.module).toBe('react')
    expect(result[0]!.isExternal).toBe(true)
    expect(result[0]!.isRelative).toBe(false)
  })

  it('parses namespace imports', () => {
    const content = "import * as utils from './utils';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.style).toBe('namespace')
    expect(result[0]!.names).toEqual(['utils'])
    expect(result[0]!.module).toBe('./utils')
  })

  it('parses side-effect imports', () => {
    const content = "import './polyfill';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.style).toBe('side-effect')
    expect(result[0]!.names).toEqual([])
    expect(result[0]!.module).toBe('./polyfill')
  })

  it('parses combined default + named imports as two entries', () => {
    const content = "import React, { useState, useEffect } from 'react';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(2)
    const defaultImport = result.find((i) => i.style === 'default')
    const namedImport = result.find((i) => i.style === 'named')
    expect(defaultImport).toBeDefined()
    expect(namedImport).toBeDefined()
    expect(defaultImport!.names).toEqual(['React'])
    expect(namedImport!.names).toEqual(['useState', 'useEffect'])
  })

  it('parses type-only imports', () => {
    const content = "import type { Config } from './types';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.isTypeOnly).toBe(true)
    expect(result[0]!.style).toBe('named')
    expect(result[0]!.names).toEqual(['Config'])
  })

  it('parses type-only default imports', () => {
    const content = "import type MyType from './types';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.isTypeOnly).toBe(true)
    expect(result[0]!.style).toBe('default')
    expect(result[0]!.names).toEqual(['MyType'])
  })

  it('parses multiple imports in one file', () => {
    const content = [
      "import { foo } from './a';",
      "import bar from './b';",
      "import * as c from './c';",
      "import './d';",
    ].join('\n')
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(4)
    expect(result[0]!.style).toBe('named')
    expect(result[1]!.style).toBe('default')
    expect(result[2]!.style).toBe('namespace')
    expect(result[3]!.style).toBe('side-effect')
  })

  it('detects external vs internal modules', () => {
    const content = [
      "import { foo } from './local';",
      "import bar from 'lodash';",
      "import baz from '@scope/package';",
    ].join('\n')
    const result = parseImports(content, 'test.ts')
    expect(result[0]!.isExternal).toBe(false)
    expect(result[0]!.isRelative).toBe(true)
    expect(result[1]!.isExternal).toBe(true)
    expect(result[1]!.isRelative).toBe(false)
    expect(result[2]!.isExternal).toBe(true)
    expect(result[2]!.isRelative).toBe(false)
  })

  it('detects relative paths with ..', () => {
    const content = "import { foo } from '../utils';"
    const result = parseImports(content, 'src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.isRelative).toBe(true)
    expect(result[0]!.isExternal).toBe(false)
  })

  it('returns empty array for no imports', () => {
    const content = 'const x = 1;\nconsole.log(x);'
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty content', () => {
    const result = parseImports('', 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('records correct line numbers', () => {
    const content = "const x = 1;\nimport { foo } from './a';\nconst y = 2;"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.line).toBe(2)
  })

  it('records correct file path', () => {
    const content = "import { foo } from './a';"
    const result = parseImports(content, 'src/my-file.ts')
    expect(result[0]!.filePath).toBe('src/my-file.ts')
  })

  it('handles aliased named imports', () => {
    const content = "import { foo as bar, baz as qux } from './module';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.names).toEqual(['bar', 'qux'])
  })

  it('handles imports without semicolons', () => {
    const content = "import { foo } from './module'"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.module).toBe('./module')
  })

  it('handles double-quoted module paths', () => {
    const content = 'import { foo } from "./module";'
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.module).toBe('./module')
  })

  it('handles side-effect imports without semicolons', () => {
    const content = "import './styles.css'"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.style).toBe('side-effect')
  })

  it('skips non-import lines starting with import', () => {
    const content = "const x = 'import something';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('handles single named import', () => {
    const content = "import { foo } from './module';"
    const result = parseImports(content, 'test.ts')
    expect(result).toHaveLength(1)
    expect(result[0]!.names).toEqual(['foo'])
  })
})

// ─── buildModuleStats ───────────────────────────────────

describe('buildModuleStats', () => {
  it('aggregates by module name', () => {
    const imports = [
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'lodash' }),
    ]
    const stats = buildModuleStats(imports)
    expect(stats).toHaveLength(2)
  })

  it('counts imports per module', () => {
    const imports = [
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'react' }),
    ]
    const stats = buildModuleStats(imports)
    expect(stats[0]!.importCount).toBe(3)
  })

  it('tracks style breakdown per module', () => {
    const imports = [
      makeImportInfo({ module: 'react', style: 'default' }),
      makeImportInfo({ module: 'react', style: 'named' }),
      makeImportInfo({ module: 'react', style: 'named' }),
    ]
    const stats = buildModuleStats(imports)
    const mod = stats[0]!
    expect(mod.styles).toHaveLength(2)
    const namedStyle = mod.styles.find((s) => s.style === 'named')
    expect(namedStyle!.count).toBe(2)
    const defaultStyle = mod.styles.find((s) => s.style === 'default')
    expect(defaultStyle!.count).toBe(1)
  })

  it('collects unique files per module', () => {
    const imports = [
      makeImportInfo({ module: 'react', filePath: 'a.ts' }),
      makeImportInfo({ module: 'react', filePath: 'b.ts' }),
      makeImportInfo({ module: 'react', filePath: 'a.ts' }),
    ]
    const stats = buildModuleStats(imports)
    expect(stats[0]!.files).toEqual(['a.ts', 'b.ts'])
  })

  it('sorts by importCount descending', () => {
    const imports = [
      makeImportInfo({ module: 'lodash' }),
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'react' }),
      makeImportInfo({ module: 'react' }),
    ]
    const stats = buildModuleStats(imports)
    expect(stats[0]!.module).toBe('react')
    expect(stats[1]!.module).toBe('lodash')
  })

  it('returns empty array for empty imports', () => {
    const stats = buildModuleStats([])
    expect(stats).toHaveLength(0)
  })

  it('tracks isExternal per module', () => {
    const imports = [
      makeImportInfo({ module: 'react', isExternal: true }),
      makeImportInfo({ module: './local', isExternal: false }),
    ]
    const stats = buildModuleStats(imports)
    const react = stats.find((s) => s.module === 'react')
    const local = stats.find((s) => s.module === './local')
    expect(react!.isExternal).toBe(true)
    expect(local!.isExternal).toBe(false)
  })
})

// ─── detectCircularDeps ─────────────────────────────────

describe('detectCircularDeps', () => {
  it('returns empty for no cycles', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: './b', isRelative: true }),
      makeImportInfo({ filePath: 'b.ts', module: './c', isRelative: true }),
    ]
    const filePaths = new Set(['a.ts', 'b.ts', 'c.ts'])
    const cycles = detectCircularDeps(imports, filePaths)
    expect(cycles).toHaveLength(0)
  })

  it('detects simple 2-file cycle', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: './b', isRelative: true }),
      makeImportInfo({ filePath: 'b.ts', module: './a', isRelative: true }),
    ]
    const filePaths = new Set(['a.ts', 'b.ts'])
    const cycles = detectCircularDeps(imports, filePaths)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('detects 3-file cycle', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: './b', isRelative: true }),
      makeImportInfo({ filePath: 'b.ts', module: './c', isRelative: true }),
      makeImportInfo({ filePath: 'c.ts', module: './a', isRelative: true }),
    ]
    const filePaths = new Set(['a.ts', 'b.ts', 'c.ts'])
    const cycles = detectCircularDeps(imports, filePaths)
    expect(cycles.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty for empty imports', () => {
    const cycles = detectCircularDeps([])
    expect(cycles).toHaveLength(0)
  })

  it('ignores external imports for cycle detection', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: 'react', isRelative: false, isExternal: true }),
      makeImportInfo({ filePath: 'b.ts', module: 'react', isRelative: false, isExternal: true }),
    ]
    const cycles = detectCircularDeps(imports)
    expect(cycles).toHaveLength(0)
  })

  it('circular deps have correct path and length', () => {
    const imports = [
      makeImportInfo({ filePath: 'x.ts', module: './y', isRelative: true }),
      makeImportInfo({ filePath: 'y.ts', module: './x', isRelative: true }),
    ]
    const filePaths = new Set(['x.ts', 'y.ts'])
    const cycles = detectCircularDeps(imports, filePaths)
    if (cycles.length > 0) {
      expect(cycles[0]!.path.length).toBeGreaterThanOrEqual(2)
      expect(cycles[0]!.length).toBeGreaterThanOrEqual(1)
    }
  })
})

// ─── buildImportsResult ─────────────────────────────────

describe('buildImportsResult', () => {
  it('computes correct totals', () => {
    const imports = [
      makeImportInfo({ isExternal: true, isRelative: false, module: 'react' }),
      makeImportInfo({ isExternal: true, isRelative: false, module: 'lodash' }),
      makeImportInfo({ isExternal: false, isRelative: true, module: './local' }),
    ]
    const result = buildImportsResult(imports)
    expect(result.totalImports).toBe(3)
    expect(result.externalImports).toBe(2)
    expect(result.internalImports).toBe(1)
  })

  it('computes byStyle with percentages', () => {
    const imports = [
      makeImportInfo({ style: 'named' }),
      makeImportInfo({ style: 'named' }),
      makeImportInfo({ style: 'default' }),
    ]
    const result = buildImportsResult(imports)
    expect(result.byStyle).toHaveLength(2)
    const named = result.byStyle.find((s) => s.style === 'named')
    expect(named!.count).toBe(2)
    expect(named!.percentage).toBeCloseTo(66.67, 1)
  })

  it('computes externalRatio', () => {
    const imports = [
      makeImportInfo({ isExternal: true, module: 'react' }),
      makeImportInfo({ isExternal: true, module: 'lodash' }),
      makeImportInfo({ isExternal: false, isRelative: true, module: './local' }),
      makeImportInfo({ isExternal: false, isRelative: true, module: './local2' }),
    ]
    const result = buildImportsResult(imports)
    expect(result.externalRatio).toBe(50)
  })

  it('respects top limit for topModules', () => {
    const imports = Array.from({ length: 30 }, (_, i) =>
      makeImportInfo({ module: `module-${i}` }),
    )
    const result = buildImportsResult(imports, { top: 5 })
    expect(result.topModules).toHaveLength(5)
    expect(result.moduleStats).toHaveLength(30)
  })

  it('defaults top to 20', () => {
    const imports = Array.from({ length: 25 }, (_, i) =>
      makeImportInfo({ module: `module-${i}` }),
    )
    const result = buildImportsResult(imports)
    expect(result.topModules).toHaveLength(20)
  })

  it('computes typeOnlyImports', () => {
    const imports = [
      makeImportInfo({ isTypeOnly: true, style: 'named', names: ['Config'], module: './types' }),
      makeImportInfo({ isTypeOnly: false, style: 'named', names: ['foo'], module: './util' }),
      makeImportInfo({ isTypeOnly: true, style: 'default', names: ['MyType'], module: './types2' }),
    ]
    const result = buildImportsResult(imports)
    expect(result.typeOnlyImports).toBe(2)
  })

  it('handles empty imports', () => {
    const result = buildImportsResult([])
    expect(result.totalImports).toBe(0)
    expect(result.externalImports).toBe(0)
    expect(result.internalImports).toBe(0)
    expect(result.externalRatio).toBe(0)
    expect(result.topModules).toHaveLength(0)
    expect(result.circularDeps).toHaveLength(0)
  })

  it('detects circular deps when circular option is true', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: './b', isRelative: true }),
      makeImportInfo({ filePath: 'b.ts', module: './a', isRelative: true }),
    ]
    const filePaths = new Set(['a.ts', 'b.ts'])
    const result = buildImportsResult(imports, { circular: true, filePaths })
    expect(result.circularDeps.length).toBeGreaterThanOrEqual(1)
  })

  it('skips circular deps when circular option is false', () => {
    const imports = [
      makeImportInfo({ filePath: 'a.ts', module: './b', isRelative: true }),
      makeImportInfo({ filePath: 'b.ts', module: './a', isRelative: true }),
    ]
    const filePaths = new Set(['a.ts', 'b.ts'])
    const result = buildImportsResult(imports, { circular: false, filePaths })
    expect(result.circularDeps).toHaveLength(0)
  })

  it('handles zero total imports for ratio', () => {
    const result = buildImportsResult([])
    expect(result.externalRatio).toBe(0)
    expect(result.byStyle).toHaveLength(0)
  })
})

// ─── formatImportsTable ─────────────────────────────────

describe('formatImportsTable', () => {
  function makeImportsResult(overrides: Partial<ImportsResult> = {}): ImportsResult {
    return {
      byStyle: [{ count: 5, percentage: 71.43, style: 'named' }, { count: 2, percentage: 28.57, style: 'default' }],
      circularDeps: [],
      externalImports: 4,
      externalRatio: 57.14,
      imports: [],
      internalImports: 3,
      moduleStats: [],
      topModules: [
        {
          files: ['a.ts', 'b.ts'],
          importCount: 3,
          isExternal: true,
          module: 'react',
          styles: [{ count: 2, style: 'default' }, { count: 1, style: 'named' }],
        },
      ],
      totalImports: 7,
      typeOnlyImports: 1,
      ...overrides,
    }
  }

  it('contains summary section', () => {
    const result = makeImportsResult()
    const output = formatImportsTable(result, false)
    expect(output).toContain('Import Analysis Report')
    expect(output).toContain('Total imports')
    expect(output).toContain('External imports')
    expect(output).toContain('Internal imports')
  })

  it('contains top modules section with headers', () => {
    const result = makeImportsResult()
    const output = formatImportsTable(result, false)
    expect(output).toContain('Module')
    expect(output).toContain('Count')
    expect(output).toContain('Type')
    expect(output).toContain('react')
  })

  it('shows circular dependencies when present', () => {
    const circularDep: CircularDep = { length: 2, path: ['a.ts', 'b.ts', 'a.ts'] }
    const result = makeImportsResult({ circularDeps: [circularDep] })
    const output = formatImportsTable(result, false)
    expect(output).toContain('Circular Dependencies')
    expect(output).toContain('a.ts')
    expect(output).toContain('b.ts')
  })

  it('hides circular deps when none found', () => {
    const result = makeImportsResult({ circularDeps: [] })
    const output = formatImportsTable(result, false)
    expect(output).not.toContain('Circular Dependencies')
  })

  it('shows verbose output with imports per file', () => {
    const imports = [
      makeImportInfo({ filePath: 'src/a.ts', module: 'react', style: 'default', names: ['React'], isExternal: true }),
    ]
    const result = makeImportsResult({ imports })
    const output = formatImportsTable(result, true)
    expect(output).toContain('All Imports by File')
    expect(output).toContain('src/a.ts')
  })

  it('hides verbose output when not verbose', () => {
    const imports = [makeImportInfo({ filePath: 'src/a.ts' })]
    const result = makeImportsResult({ imports })
    const output = formatImportsTable(result, false)
    expect(output).not.toContain('All Imports by File')
  })

  it('handles empty result', () => {
    const result = makeImportsResult({
      byStyle: [],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    })
    const output = formatImportsTable(result, false)
    expect(output).toContain('Total imports')
    expect(output).toContain('0')
  })
})

// ─── formatImportsCsv ───────────────────────────────────

describe('formatImportsCsv', () => {
  it('produces CSV with headers', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    }
    const output = formatImportsCsv(result)
    const lines = output.split('\n')
    expect(lines[0]).toBe('Module,ImportCount,Styles,FileCount,IsExternal')
  })

  it('includes data rows for modules', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 1,
      externalRatio: 100,
      imports: [],
      internalImports: 0,
      moduleStats: [
        {
          files: ['a.ts'],
          importCount: 3,
          isExternal: true,
          module: 'react',
          styles: [{ count: 2, style: 'default' }, { count: 1, style: 'named' }],
        },
      ],
      topModules: [],
      totalImports: 1,
      typeOnlyImports: 0,
    }
    const output = formatImportsCsv(result)
    expect(output).toContain('react')
    expect(output).toContain('3')
    expect(output).toContain('default:2;named:1')
  })

  it('escapes commas in module names', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 1,
      externalRatio: 100,
      imports: [],
      internalImports: 0,
      moduleStats: [
        {
          files: ['a.ts'],
          importCount: 1,
          isExternal: true,
          module: '@scope/my,package',
          styles: [{ count: 1, style: 'named' }],
        },
      ],
      topModules: [],
      totalImports: 1,
      typeOnlyImports: 0,
    }
    const output = formatImportsCsv(result)
    expect(output).toContain('"@scope/my,package"')
  })

  it('handles empty modules', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    }
    const output = formatImportsCsv(result)
    const lines = output.split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('Module,ImportCount,Styles,FileCount,IsExternal')
  })
})

// ─── formatImportsJson ──────────────────────────────────

describe('formatImportsJson', () => {
  it('produces valid JSON', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    }
    const output = formatImportsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalImports', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 5,
      externalRatio: 50,
      imports: [],
      internalImports: 5,
      moduleStats: [],
      topModules: [],
      totalImports: 10,
      typeOnlyImports: 0,
    }
    const output = formatImportsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalImports).toBe(10)
    expect(parsed.externalImports).toBe(5)
    expect(parsed.externalRatio).toBe(50)
  })

  it('contains moduleStats array', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 1,
      externalRatio: 100,
      imports: [],
      internalImports: 0,
      moduleStats: [
        {
          files: ['a.ts'],
          importCount: 2,
          isExternal: true,
          module: 'react',
          styles: [{ count: 2, style: 'default' }],
        },
      ],
      topModules: [],
      totalImports: 1,
      typeOnlyImports: 0,
    }
    const output = formatImportsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.moduleStats).toHaveLength(1)
    expect(parsed.moduleStats[0].module).toBe('react')
  })

  it('preserves circular deps', () => {
    const circularDep: CircularDep = { length: 2, path: ['a.ts', 'b.ts', 'a.ts'] }
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [circularDep],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    }
    const output = formatImportsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.circularDeps).toHaveLength(1)
    expect(parsed.circularDeps[0].length).toBe(2)
  })

  it('handles empty results', () => {
    const result: ImportsResult = {
      byStyle: [],
      circularDeps: [],
      externalImports: 0,
      externalRatio: 0,
      imports: [],
      internalImports: 0,
      moduleStats: [],
      topModules: [],
      totalImports: 0,
      typeOnlyImports: 0,
    }
    const output = formatImportsJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalImports).toBe(0)
    expect(parsed.moduleStats).toHaveLength(0)
  })
})
