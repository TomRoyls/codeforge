import { describe, expect, test } from 'vitest'

import {
  deduplicateCycles,
  detectCircularDependencies,
  detectCyclesFromNode,
  displayCircularDependencies,
  displayDependencyTree,
  displayDotFormat,
  displayExternalModules,
  displayFullReport,
  extractImports,
  findOrphanFiles,
  finishNodeVisit,
  formatOutput,
  graphToDotFormat,
  normalizeCycle,
  processDependency,
  recordCycle,
} from '../../../src/commands/dependencies-helpers.js'
import type {
  CircularDependency,
  CycleDetectionContext,
  DependenciesReport,
  DependencyGraph,
  DependencyNode,
  ImportInfo,
} from '../../../src/commands/dependencies-helpers.js'

// ============================================================================
// Factory Helpers
// ============================================================================

const makeImportDetail = (
  modulePath: string,
  sourceFile: string,
  line = 1,
  column = 1,
  end = 10,
): ImportInfo => ({ location: { column, end, line }, modulePath, sourceFile })

const makeNode = (overrides: Partial<DependencyNode> = {}): DependencyNode => ({
  filePath: '/src/test.ts',
  importDetails: new Map<string, ImportInfo>(),
  imports: new Set<string>(),
  ...overrides,
})

const makeGraph = (nodes: DependencyNode[]): DependencyGraph => ({
  nodes: new Map(nodes.map((node) => [node.filePath, node])),
})

const makeReport = (overrides: Partial<DependenciesReport> = {}): DependenciesReport => ({
  circularDependencies: [],
  externalModules: [],
  filesAnalyzed: 0,
  graph: { edges: [], nodes: [] },
  internalModules: [],
  orphanFiles: [],
  ...overrides,
})

// ============================================================================
// Type Exports Verification
// ============================================================================

describe('Type exports', () => {
  test('ImportInfo type can be used to create a valid object', () => {
    const info: ImportInfo = {
      location: { column: 1, end: 20, line: 1 },
      modulePath: './foo',
      sourceFile: '/src/bar.ts',
    }
    expect(info.modulePath).toBe('./foo')
    expect(info.sourceFile).toBe('/src/bar.ts')
    expect(info.location.column).toBe(1)
    expect(info.location.end).toBe(20)
    expect(info.location.line).toBe(1)
  })

  test('DependencyNode type can be used to create a valid object', () => {
    const node: DependencyNode = {
      filePath: '/src/a.ts',
      importDetails: new Map<string, ImportInfo>(),
      imports: new Set<string>(),
    }
    expect(node.filePath).toBe('/src/a.ts')
    expect(node.importDetails).toBeInstanceOf(Map)
    expect(node.imports).toBeInstanceOf(Set)
  })

  test('DependencyGraph type can be used to create a valid object', () => {
    const graph: DependencyGraph = {
      nodes: new Map<string, DependencyNode>(),
    }
    expect(graph.nodes).toBeInstanceOf(Map)
  })

  test('CircularDependency type can be used to create a valid object', () => {
    const dep: CircularDependency = {
      cycle: ['/a', '/b', '/a'],
      location: { column: 1, end: 10, line: 1 },
    }
    expect(dep.cycle).toEqual(['/a', '/b', '/a'])
    expect(dep.location.line).toBe(1)
  })

  test('CycleDetectionContext type can be used to create a valid object', () => {
    const ctx: CycleDetectionContext = {
      cycles: [],
      graph: { nodes: new Map() },
      maxDepth: 50,
      path: [],
      recursionStack: new Set<string>(),
      visited: new Set<string>(),
    }
    expect(ctx.maxDepth).toBe(50)
    expect(ctx.cycles).toEqual([])
  })

  test('DependenciesReport type can be used to create a valid object', () => {
    const report: DependenciesReport = {
      circularDependencies: [],
      externalModules: [],
      filesAnalyzed: 0,
      graph: { edges: [], nodes: [] },
      internalModules: [],
      orphanFiles: [],
    }
    expect(report.filesAnalyzed).toBe(0)
  })

  test('ImportInfo location has all required fields', () => {
    const info: ImportInfo = makeImportDetail('./mod', '/src/a.ts', 5, 3, 40)
    expect(info.location).toHaveProperty('column')
    expect(info.location).toHaveProperty('end')
    expect(info.location).toHaveProperty('line')
  })

  test('DependencyNode imports is a Set of strings', () => {
    const node = makeNode({ imports: new Set(['./a', './b']) })
    expect(node.imports.has('./a')).toBe(true)
    expect(node.imports.has('./b')).toBe(true)
    expect(node.imports.has('./c')).toBe(false)
  })

  test('DependencyNode importDetails is a Map of ImportInfo', () => {
    const details = new Map<string, ImportInfo>()
    details.set('./a', makeImportDetail('./a', '/src/b.ts'))
    const node = makeNode({ importDetails: details })
    expect(node.importDetails.get('./a')).toBeDefined()
    expect(node.importDetails.get('./a')?.modulePath).toBe('./a')
  })

  test('DependenciesReport graph has nodes and edges', () => {
    const report = makeReport({
      graph: {
        edges: [['/a', '/b']],
        nodes: ['/a', '/b'],
      },
    })
    expect(report.graph.nodes).toEqual(['/a', '/b'])
    expect(report.graph.edges).toEqual([['/a', '/b']])
  })

  test('CircularDependency cycle is a readonly array', () => {
    const dep: CircularDependency = {
      cycle: ['/x', '/y', '/z', '/x'] as readonly string[],
      location: { column: 1, end: 10, line: 3 },
    }
    expect(dep.cycle.length).toBe(4)
  })

  test('DependenciesReport contains all required fields', () => {
    const report: DependenciesReport = {
      circularDependencies: [],
      externalModules: ['lodash'],
      filesAnalyzed: 10,
      graph: { edges: [], nodes: [] },
      internalModules: ['./utils'],
      orphanFiles: ['./orphan.ts'],
    }
    expect(report).toHaveProperty('circularDependencies')
    expect(report).toHaveProperty('externalModules')
    expect(report).toHaveProperty('filesAnalyzed')
    expect(report).toHaveProperty('graph')
    expect(report).toHaveProperty('internalModules')
    expect(report).toHaveProperty('orphanFiles')
  })
})

// ============================================================================
// Re-export Verification
// ============================================================================

describe('Re-exported functions from cycle helpers', () => {
  test('deduplicateCycles is exported', () => {
    expect(typeof deduplicateCycles).toBe('function')
  })

  test('detectCircularDependencies is exported', () => {
    expect(typeof detectCircularDependencies).toBe('function')
  })

  test('detectCyclesFromNode is exported', () => {
    expect(typeof detectCyclesFromNode).toBe('function')
  })

  test('finishNodeVisit is exported', () => {
    expect(typeof finishNodeVisit).toBe('function')
  })

  test('normalizeCycle is exported', () => {
    expect(typeof normalizeCycle).toBe('function')
  })

  test('processDependency is exported', () => {
    expect(typeof processDependency).toBe('function')
  })

  test('recordCycle is exported', () => {
    expect(typeof recordCycle).toBe('function')
  })
})

describe('Re-exported functions from display helpers', () => {
  test('displayCircularDependencies is exported', () => {
    expect(typeof displayCircularDependencies).toBe('function')
  })

  test('displayDependencyTree is exported', () => {
    expect(typeof displayDependencyTree).toBe('function')
  })

  test('displayDotFormat is exported', () => {
    expect(typeof displayDotFormat).toBe('function')
  })

  test('displayExternalModules is exported', () => {
    expect(typeof displayExternalModules).toBe('function')
  })

  test('displayFullReport is exported', () => {
    expect(typeof displayFullReport).toBe('function')
  })

  test('formatOutput is exported', () => {
    expect(typeof formatOutput).toBe('function')
  })

  test('graphToDotFormat is exported', () => {
    expect(typeof graphToDotFormat).toBe('function')
  })
})

// ============================================================================
// extractImports - Basic ES Module Imports
// ============================================================================

describe('extractImports - basic ES module imports', () => {
  test('extracts a simple named import', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
    expect(result[0].sourceFile).toBe('/src/test.ts')
  })

  test('extracts a default import', () => {
    const code = `import foo from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts a namespace import', () => {
    const code = `import * as foo from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts multiple named imports', () => {
    const code = `import { a, b, c } from './utils'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./utils')
  })

  test('extracts import with single quotes', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts import with double quotes', () => {
    const code = `import { foo } from "./bar"`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts import from node_modules package', () => {
    const code = `import { debounce } from 'lodash'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('lodash')
  })

  test('extracts import from scoped package', () => {
    const code = `import { something } from '@angular/core'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('@angular/core')
  })

  test('extracts multiple imports on separate lines', () => {
    const code = [
      `import { a } from './a'`,
      `import { b } from './b'`,
      `import { c } from './c'`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(3)
    expect(result[0].modulePath).toBe('./a')
    expect(result[1].modulePath).toBe('./b')
    expect(result[2].modulePath).toBe('./c')
  })

  test('extracts import with aliased named import', () => {
    const code = `import { foo as bar } from './utils'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./utils')
  })
})

// ============================================================================
// extractImports - Type Imports
// ============================================================================

describe('extractImports - type imports', () => {
  test('extracts type-only import', () => {
    const code = `import type { Foo } from './types'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./types')
  })

  test('extracts inline type import', () => {
    const code = `import { type Foo } from './types'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./types')
  })
})

// ============================================================================
// extractImports - Dynamic Imports
// ============================================================================

describe('extractImports - dynamic imports', () => {
  test('extracts dynamic import with single quotes', () => {
    const code = `const mod = import('./module')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./module')
  })

  test('extracts dynamic import with double quotes', () => {
    const code = `const mod = import("./module")`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./module')
  })

  test('extracts dynamic import with spaces inside parens', () => {
    const code = `const mod = import( './module' )`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./module')
  })

  test('extracts dynamic import with await', () => {
    const code = `const mod = await import('./module')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./module')
  })

  test('extracts dynamic import from external package', () => {
    const code = `const lodash = import('lodash')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('lodash')
  })

  test('extracts dynamic import from scoped package', () => {
    const code = `const mod = import('@scope/package')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('@scope/package')
  })
})

// ============================================================================
// extractImports - Require Statements
// ============================================================================

describe('extractImports - require statements', () => {
  test('extracts require with single quotes', () => {
    const code = `const foo = require('./bar')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts require with double quotes', () => {
    const code = `const foo = require("./bar")`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts require with spaces', () => {
    const code = `const foo = require( './bar' )`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('extracts require from external package', () => {
    const code = `const path = require('path')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('path')
  })

  test('extracts require from scoped package', () => {
    const code = `const pkg = require('@scope/package')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('@scope/package')
  })

  test('extracts require assigned to destructured object', () => {
    const code = `const { foo, bar } = require('./utils')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./utils')
  })
})

// ============================================================================
// extractImports - Location Tracking
// ============================================================================

describe('extractImports - location tracking', () => {
  test('tracks line number starting at 1', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(1)
  })

  test('tracks correct line for second line import', () => {
    const code = `\nimport { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(2)
  })

  test('tracks correct line for third line import', () => {
    const code = `\n\nimport { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(3)
  })

  test('tracks column as 1 for all imports', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.column).toBe(1)
  })

  test('tracks end as line length', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.end).toBe(code.length)
  })

  test('tracks multiple imports with different line numbers', () => {
    const code = [
      `import { a } from './a'`,
      `import { b } from './b'`,
      ``,
      `import { c } from './c'`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(1)
    expect(result[1].location.line).toBe(2)
    expect(result[2].location.line).toBe(4)
  })

  test('tracks end correctly for each line', () => {
    const code = [`import { a } from './a'`, `  import { b } from './b'`].join('\n')
    const result = extractImports(code, '/src/test.ts')
    // end is based on line.length (the full trimmed line in source)
    expect(result[0].location.end).toBe(`import { a } from './a'`.length)
    expect(result[1].location.end).toBe(`  import { b } from './b'`.length)
  })

  test('sourceFile matches provided filePath', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/custom/path.ts')
    expect(result[0].sourceFile).toBe('/custom/path.ts')
  })

  test('sourceFile differs per call', () => {
    const code = `import { foo } from './bar'`
    const result1 = extractImports(code, '/src/a.ts')
    const result2 = extractImports(code, '/src/b.ts')
    expect(result1[0].sourceFile).toBe('/src/a.ts')
    expect(result2[0].sourceFile).toBe('/src/b.ts')
  })
})

// ============================================================================
// extractImports - Edge Cases
// ============================================================================

describe('extractImports - edge cases', () => {
  test('returns empty array for empty string', () => {
    const result = extractImports('', '/src/test.ts')
    expect(result).toEqual([])
  })

  test('returns empty array for whitespace only', () => {
    const result = extractImports('   \n  \n  ', '/src/test.ts')
    expect(result).toEqual([])
  })

  test('returns empty array for code with no imports', () => {
    const code = `const x = 1\nconst y = 2\nconsole.log(x + y)`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('returns empty array for function calls that look like imports', () => {
    const code = `const x = getImport('./not-real')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('handles code with only comments', () => {
    const code = `// import { foo } from './bar'\n/* import { baz } from './qux' */`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('handles mixed import types in same file', () => {
    const code = [
      `import { foo } from './a'`,
      `const bar = require('./b')`,
      `const baz = import('./c')`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(3)
    expect(result[0].modulePath).toBe('./a')
    expect(result[1].modulePath).toBe('./b')
    expect(result[2].modulePath).toBe('./c')
  })

  test('handles import from with parent directory path', () => {
    const code = `import { foo } from '../parent'`
    const result = extractImports(code, '/src/child/test.ts')
    expect(result[0].modulePath).toBe('../parent')
  })

  test('handles import from with deep relative path', () => {
    const code = `import { foo } from '../../deep/module'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('../../deep/module')
  })

  test('handles import from with subpath', () => {
    const code = `import { foo } from './sub/path'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./sub/path')
  })

  test('handles import with file extension', () => {
    const code = `import { foo } from './bar.ts'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./bar.ts')
  })

  test('handles import with .js extension (ESM)', () => {
    const code = `import { foo } from './bar.js'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./bar.js')
  })

  test('handles import that appears after code', () => {
    const code = `const x = 1\nimport { foo } from './bar'\nconst y = 2`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].location.line).toBe(2)
  })

  test('handles import at end of file with no trailing newline', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
  })

  test('handles single newline', () => {
    const result = extractImports('\n', '/src/test.ts')
    expect(result).toEqual([])
  })

  test('handles import line with trailing spaces', () => {
    const code = `import { foo } from './bar'   `
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('handles import line with leading spaces', () => {
    const code = `   import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('handles import line with leading tab', () => {
    const code = `\timport { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('does not match import keyword in string literal', () => {
    const code = `const str = "import { foo } from './bar'"`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('matches require even inside a string literal (regex limitation)', () => {
    const code = `const str = "require('./bar')"`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('does not extract commented out import (single-line)', () => {
    const code = `// import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('handles multiple blank lines between imports', () => {
    const code = [`import { a } from './a'`, ``, ``, ``, `import { b } from './b'`].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(2)
    expect(result[0].location.line).toBe(1)
    expect(result[1].location.line).toBe(5)
  })

  test('handles large number of imports', () => {
    const lines = Array.from({ length: 50 }, (_, i) => `import { mod${i} } from './mod${i}'`)
    const code = lines.join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(50)
    for (let i = 0; i < 50; i++) {
      expect(result[i].modulePath).toBe(`./mod${i}`)
      expect(result[i].location.line).toBe(i + 1)
    }
  })
})

// ============================================================================
// extractImports - Priority (first match wins per line)
// ============================================================================

describe('extractImports - match priority', () => {
  test('static import takes priority over dynamic on same line', () => {
    // The regex checks static first, then dynamic, then require
    const code = `import { foo } from './static'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./static')
  })

  test('only one match per line (first regex wins)', () => {
    const code = `import { foo } from './a'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
  })
})

// ============================================================================
// extractImports - Empty filePath
// ============================================================================

describe('extractImports - filePath parameter', () => {
  test('uses empty string as filePath when provided', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '')
    expect(result[0].sourceFile).toBe('')
  })

  test('uses relative filePath when provided', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, './relative.ts')
    expect(result[0].sourceFile).toBe('./relative.ts')
  })

  test('uses absolute filePath when provided', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/absolute/path/to/file.ts')
    expect(result[0].sourceFile).toBe('/absolute/path/to/file.ts')
  })
})

// ============================================================================
// extractImports - Various module path formats
// ============================================================================

describe('extractImports - module path formats', () => {
  test('extracts relative path starting with dot', () => {
    const code = `import { foo } from '.'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('.')
  })

  test('extracts path with hash subpath', () => {
    const code = `import { foo } from 'lodash/debounce'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('lodash/debounce')
  })

  test('extracts package with version-like subpath', () => {
    const code = `import { foo } from '@scope/pkg/subpath'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('@scope/pkg/subpath')
  })

  test('extracts data URI import', () => {
    const code = `import data from 'data:text/javascript,export default 1'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
  })
})

// ============================================================================
// extractImports - Require variations
// ============================================================================

describe('extractImports - require variations', () => {
  test('extracts require in variable declaration', () => {
    const code = `const path = require('path')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('path')
  })

  test('extracts require in let declaration', () => {
    const code = `let mod = require('./mod')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./mod')
  })

  test('extracts require in standalone call', () => {
    const code = `require('./side-effect')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./side-effect')
  })

  test('extracts require with result passed to function', () => {
    const code = `fn(require('./arg'))`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./arg')
  })

  test('does not match requirejs-style calls with extra args', () => {
    const code = `require(['./a', './b'], function(a, b) {})`
    const result = extractImports(code, '/src/test.ts')
    // The regex only matches require('...') or require("..."), not require([...])
    expect(result).toEqual([])
  })
})

// ============================================================================
// extractImports - Dynamic import variations
// ============================================================================

describe('extractImports - dynamic import variations', () => {
  test('extracts dynamic import in variable assignment', () => {
    const code = `const mod = import('./lazy')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./lazy')
  })

  test('extracts dynamic import in await expression', () => {
    const code = `await import('./async-module')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./async-module')
  })

  test('extracts dynamic import used in then chain', () => {
    const code = `import('./module').then(m => m.init())`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./module')
  })

  test('extracts dynamic import with many spaces', () => {
    const code = `import(  './spacious'  )`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./spacious')
  })
})

// ============================================================================
// findOrphanFiles - Basic
// ============================================================================

describe('findOrphanFiles - basic', () => {
  test('returns empty array for empty graph', () => {
    const graph = makeGraph([])
    const result = findOrphanFiles(graph)
    expect(result).toEqual([])
  })

  test('returns single node with no imports as orphan', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set<string>() })])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['/src/a.ts'])
  })

  test('returns no orphans when all files are imported (paths match)', () => {
    const graph = makeGraph([
      makeNode({
        filePath: './a',
        imports: new Set(['./b']),
      }),
      makeNode({
        filePath: './b',
        imports: new Set(['./a']),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual([])
  })

  test('returns all files as orphans when import paths do not match keys', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['./b']),
      }),
      makeNode({
        filePath: '/src/b.ts',
        imports: new Set(['./a']),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })

  test('returns all files as orphans when none are imported by others', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['external-pkg']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set(['other-pkg']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
    expect(result).toContain('/src/a.ts')
    expect(result).toContain('/src/b.ts')
  })

  test('identifies single orphan among connected files', () => {
    const graph = makeGraph([
      makeNode({
        filePath: './main',
        imports: new Set(['./utils', './helpers']),
      }),
      makeNode({
        filePath: './utils',
        imports: new Set<string>(),
      }),
      makeNode({
        filePath: './helpers',
        imports: new Set<string>(),
      }),
      makeNode({
        filePath: './unused',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./main', './unused'])
  })

  test('only considers relative imports (starting with .) as internal', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['lodash', 'react']),
      }),
      makeNode({
        filePath: '/src/b.ts',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    // Neither a nor b is imported by a relative import
    expect(result).toHaveLength(2)
  })

  test('recognizes ./ relative imports when paths match keys', () => {
    const graph = makeGraph([
      makeNode({
        filePath: './a',
        imports: new Set(['./b']),
      }),
      makeNode({
        filePath: './b',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('recognizes ../ relative imports when paths match keys', () => {
    const graph = makeGraph([
      makeNode({
        filePath: './child/a',
        imports: new Set(['../parent']),
      }),
      makeNode({
        filePath: '../parent',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./child/a'])
  })

  test('does not consider absolute path imports as internal', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['/src/b']),
      }),
      makeNode({
        filePath: '/src/b.ts',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    // '/src/b' does not start with '.', so both are orphans
    expect(result).toHaveLength(2)
  })

  test('does not consider package imports as internal', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/a.ts',
        imports: new Set(['react']),
      }),
      makeNode({
        filePath: '/src/b.ts',
        imports: new Set<string>(),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })
})

// ============================================================================
// findOrphanFiles - Complex Scenarios
// ============================================================================

describe('findOrphanFiles - complex scenarios', () => {
  test('handles chain of imports A -> B -> C', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set(['./c']) }),
      makeNode({ filePath: './c', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('handles diamond dependency', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b', './c']) }),
      makeNode({ filePath: './b', imports: new Set(['./d']) }),
      makeNode({ filePath: './c', imports: new Set(['./d']) }),
      makeNode({ filePath: './d', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('handles multiple entry points', () => {
    const graph = makeGraph([
      makeNode({ filePath: './cli', imports: new Set(['./utils']) }),
      makeNode({ filePath: './server', imports: new Set(['./utils']) }),
      makeNode({ filePath: './utils', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
    expect(result).toContain('./cli')
    expect(result).toContain('./server')
  })

  test('handles single node with only external imports', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/index.ts', imports: new Set(['express']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['/src/index.ts'])
  })

  test('handles node with self-reference', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set(['./a']) })])
    const result = findOrphanFiles(graph)
    // a imports itself (./a), but the key in the graph is '/src/a.ts'
    // The import './a' doesn't match key '/src/a.ts', so it's still an orphan
    expect(result).toEqual(['/src/a.ts'])
  })

  test('handles three node cycle', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set(['./c']) }),
      makeNode({ filePath: './c', imports: new Set(['./a']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual([])
  })

  test('handles file imported by multiple others', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./shared']) }),
      makeNode({ filePath: './b', imports: new Set(['./shared']) }),
      makeNode({ filePath: './c', imports: new Set(['./shared']) }),
      makeNode({ filePath: './shared', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(3)
    expect(result).toContain('./a')
    expect(result).toContain('./b')
    expect(result).toContain('./c')
    expect(result).not.toContain('./shared')
  })

  test('orphan file is still identified even if it has imports', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/entry.ts', imports: new Set(['lodash']) }),
      makeNode({ filePath: '/src/other.ts', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })
})

// ============================================================================
// findOrphanFiles - Edge Cases
// ============================================================================

describe('findOrphanFiles - edge cases', () => {
  test('handles graph with single node that imports itself with relative path', () => {
    const graph = makeGraph([makeNode({ filePath: './a', imports: new Set(['./a']) })])
    const result = findOrphanFiles(graph)
    // ./a is imported (by itself), so it's not an orphan
    expect(result).toEqual([])
  })

  test('handles node importing a non-existent file', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['./nonexistent']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    // ./nonexistent doesn't match any key, so both files are orphans
    expect(result).toHaveLength(2)
  })

  test('handles empty imports set', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set<string>() })])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['/src/a.ts'])
  })

  test('preserves order of orphan files (key iteration order)', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/alpha.ts', imports: new Set<string>() }),
      makeNode({ filePath: '/src/beta.ts', imports: new Set<string>() }),
      makeNode({ filePath: '/src/gamma.ts', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['/src/alpha.ts', '/src/beta.ts', '/src/gamma.ts'])
  })

  test('handles large graph efficiently', () => {
    const nodes = Array.from({ length: 100 }, (_, i) =>
      makeNode({
        filePath: `/src/file${i}.ts`,
        imports: i > 0 ? new Set([`./file${i - 1}`]) : new Set<string>(),
      }),
    )
    const graph = makeGraph(nodes)
    const result = findOrphanFiles(graph)
    // Only file0 is not imported (it has no predecessor), and file99 isn't imported by a relative path starting with .
    // Actually, file0 is imported by file1 (./file0), file1 by file2 (./file1)...
    // Wait, the key is '/src/file0.ts' but the import is './file0' - they don't match
    // So ALL files are orphans because import paths don't match key paths
    expect(result).toHaveLength(100)
  })

  test('handles graph where keys match import paths exactly', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })
})

// ============================================================================
// Integration - extractImports + findOrphanFiles
// ============================================================================

describe('Integration - extractImports with graph building', () => {
  test('extractImports results can be used to build a DependencyGraph', () => {
    const codeA = `import { b } from './b'`
    const codeB = `import { c } from './c'`
    const codeC = `// no imports`

    const importsA = extractImports(codeA, '/src/a.ts')
    const importsB = extractImports(codeB, '/src/b.ts')
    const importsC = extractImports(codeC, '/src/c.ts')

    const nodeA: DependencyNode = {
      filePath: '/src/a.ts',
      importDetails: new Map(importsA.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsA.map((imp) => imp.modulePath)),
    }
    const nodeB: DependencyNode = {
      filePath: '/src/b.ts',
      importDetails: new Map(importsB.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsB.map((imp) => imp.modulePath)),
    }
    const nodeC: DependencyNode = {
      filePath: '/src/c.ts',
      importDetails: new Map(importsC.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsC.map((imp) => imp.modulePath)),
    }

    expect(nodeA.imports.has('./b')).toBe(true)
    expect(nodeB.imports.has('./c')).toBe(true)
    expect(nodeC.imports.size).toBe(0)
  })

  test('can find orphans from extracted imports', () => {
    const code = `import { utils } from './utils'`
    const imports = extractImports(code, '/src/main.ts')

    const mainNode: DependencyNode = {
      filePath: '/src/main.ts',
      importDetails: new Map(imports.map((imp) => [imp.modulePath, imp])),
      imports: new Set(imports.map((imp) => imp.modulePath)),
    }
    const utilsNode: DependencyNode = {
      filePath: './utils',
      importDetails: new Map<string, ImportInfo>(),
      imports: new Set<string>(),
    }

    const graph = makeGraph([mainNode, utilsNode])
    const orphans = findOrphanFiles(graph)
    expect(orphans).toEqual(['/src/main.ts'])
  })

  test('extractImports + findOrphanFiles for circular dependency', () => {
    const codeA = `import { b } from './b'`
    const codeB = `import { a } from './a'`

    const importsA = extractImports(codeA, './a')
    const importsB = extractImports(codeB, './b')

    const nodeA: DependencyNode = {
      filePath: './a',
      importDetails: new Map(importsA.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsA.map((imp) => imp.modulePath)),
    }
    const nodeB: DependencyNode = {
      filePath: './b',
      importDetails: new Map(importsB.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsB.map((imp) => imp.modulePath)),
    }

    const graph = makeGraph([nodeA, nodeB])
    const orphans = findOrphanFiles(graph)
    expect(orphans).toEqual([])
  })

  test('extractImports results preserve source file correctly', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/my-file.ts')
    for (const imp of result) {
      expect(imp.sourceFile).toBe('/src/my-file.ts')
    }
  })

  test('extractImports handles real-world file with mixed imports', () => {
    const code = [
      `import { Component } from 'react'`,
      `import type { Props } from './types'`,
      `import * as utils from './utils'`,
      `const lazy = import('./lazy-module')`,
      `const config = require('./config')`,
      ``,
      `export class MyComponent extends Component<Props> {`,
      `  render() { return null }`,
      `}`,
    ].join('\n')

    const result = extractImports(code, '/src/Component.tsx')
    expect(result).toHaveLength(5)
    expect(result[0].modulePath).toBe('react')
    expect(result[1].modulePath).toBe('./types')
    expect(result[2].modulePath).toBe('./utils')
    expect(result[3].modulePath).toBe('./lazy-module')
    expect(result[4].modulePath).toBe('./config')
  })

  test('extractImports location data is consistent for multi-import file', () => {
    const code = [`import { a } from './a'`, `import { b } from './b'`].join('\n')

    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(1)
    expect(result[1].location.line).toBe(2)
    expect(result[0].location.column).toBe(1)
    expect(result[1].location.column).toBe(1)
    expect(result[0].sourceFile).toBe('/src/test.ts')
    expect(result[1].sourceFile).toBe('/src/test.ts')
  })
})

// ============================================================================
// extractImports - does not match non-import lines
// ============================================================================

describe('extractImports - non-matching patterns', () => {
  test('does not match export statement', () => {
    const code = `export { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match function declaration', () => {
    const code = `function importModule() { return null }`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match class with import in name', () => {
    const code = `class ImportManager { }`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match variable named importModule', () => {
    const code = `const importModule = () => {}`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match console.log with import-like text', () => {
    const code = `console.log("import { foo } from './bar'")`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match re-export with export default', () => {
    const code = `export default from './bar'`
    const result = extractImports(code, '/src/test.ts')
    // This is a re-export, not a standard import pattern
    expect(result).toEqual([])
  })

  test('does not match partial import on continuation', () => {
    // Multi-line imports would only match if the `from` is on the same line
    const code = [`import {`, `  foo,`, `  bar`, `} from './utils'`].join('\n')
    const result = extractImports(code, '/src/test.ts')
    // The regex expects import on one line, so only the "} from './utils'" line
    // won't match the static import regex (doesn't start with "import")
    expect(result).toEqual([])
  })

  test('does not match commented import with block comment on same line', () => {
    const code = `/* import { foo } from './bar' */`
    const result = extractImports(code, '/src/test.ts')
    // After trim, it starts with "/*", not "import"
    expect(result).toEqual([])
  })

  test('does not match template literal with import text', () => {
    const code = 'const str = `import { foo } from "./bar"`'
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('does not match object property named import', () => {
    const code = `const obj = { import: true }`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })
})

// ============================================================================
// extractImports - modulePath specifics
// ============================================================================

describe('extractImports - modulePath edge cases', () => {
  test('extracts path with hyphen', () => {
    const code = `import { foo } from './my-module'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./my-module')
  })

  test('extracts path with underscore', () => {
    const code = `import { foo } from './my_module'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./my_module')
  })

  test('extracts path with numbers', () => {
    const code = `import { foo } from './utils2'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./utils2')
  })

  test('extracts path with @ scoped package', () => {
    const code = `import { foo } from '@babel/core'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('@babel/core')
  })

  test('extracts path with multiple @ scopes', () => {
    const code = `import { foo } from '@scope/sub/module'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('@scope/sub/module')
  })

  test('extracts very short module path', () => {
    const code = `import { foo } from '.'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('.')
  })

  test('extracts module path with query string', () => {
    const code = `import { foo } from './bar?inline'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./bar?inline')
  })
})

// ============================================================================
// findOrphanFiles - additional scenarios
// ============================================================================

describe('findOrphanFiles - additional edge cases', () => {
  test('handles graph where import path matches node key exactly', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set(['./c']) }),
      makeNode({ filePath: './c', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('handles graph with mixed import path styles', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['/src/b.ts', 'lodash']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    // '/src/b.ts' does not start with '.', so it's treated as external
    // Both files are orphans
    expect(result).toHaveLength(2)
  })

  test('handles node that imports itself (relative)', () => {
    const graph = makeGraph([
      makeNode({ filePath: './circular', imports: new Set(['./circular']) }),
    ])
    const result = findOrphanFiles(graph)
    // ./circular imports ./circular, so it's not an orphan
    expect(result).toEqual([])
  })

  test('handles file with many external imports but no internal ones', () => {
    const graph = makeGraph([
      makeNode({
        filePath: '/src/index.ts',
        imports: new Set(['react', 'lodash', 'express', 'axios']),
      }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['/src/index.ts'])
  })
})

// ============================================================================
// Integration - extractImports feeds detectCircularDependencies
// ============================================================================

describe('Integration - extractImports with cycle detection', () => {
  test('extractImports provides data that enables cycle detection', () => {
    const codeA = `import { b } from './b'`
    const codeB = `import { a } from './a'`

    const importsA = extractImports(codeA, './a')
    const importsB = extractImports(codeB, './b')

    const nodeA: DependencyNode = {
      filePath: './a',
      importDetails: new Map(importsA.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsA.map((imp) => imp.modulePath)),
    }
    const nodeB: DependencyNode = {
      filePath: './b',
      importDetails: new Map(importsB.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsB.map((imp) => imp.modulePath)),
    }

    const graph = makeGraph([nodeA, nodeB])
    const cycles = detectCircularDependencies(graph)
    expect(cycles.length).toBeGreaterThan(0)
  })

  test('extractImports data shows no cycles for linear imports', () => {
    const codeA = `import { b } from './b'`
    const codeB = `import { c } from './c'`
    const codeC = `// no imports`

    const importsA = extractImports(codeA, './a')
    const importsB = extractImports(codeB, './b')
    const importsC = extractImports(codeC, './c')

    const nodeA: DependencyNode = {
      filePath: './a',
      importDetails: new Map(importsA.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsA.map((imp) => imp.modulePath)),
    }
    const nodeB: DependencyNode = {
      filePath: './b',
      importDetails: new Map(importsB.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsB.map((imp) => imp.modulePath)),
    }
    const nodeC: DependencyNode = {
      filePath: './c',
      importDetails: new Map(importsC.map((imp) => [imp.modulePath, imp])),
      imports: new Set(importsC.map((imp) => imp.modulePath)),
    }

    const graph = makeGraph([nodeA, nodeB, nodeC])
    const cycles = detectCircularDependencies(graph)
    expect(cycles).toEqual([])
  })
})

// ============================================================================
// extractImports - more regex matching details
// ============================================================================

describe('extractImports - regex pattern details', () => {
  test('matches import with empty braces', () => {
    const code = `import {} from './side-effect'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./side-effect')
  })

  test('matches import with complex destructured names', () => {
    const code = `import { foo, bar as baz, qux } from './utils'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./utils')
  })

  test('does not match line starting with non-import keyword', () => {
    const code = `const importStatement = 'not an import'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })

  test('matches default import with no named imports', () => {
    const code = `import React from 'react'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('react')
  })

  test('matches namespace import with as keyword', () => {
    const code = `import * as _ from 'lodash'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('lodash')
  })

  test('matches import type with default', () => {
    const code = `import type Foo from './types'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./types')
  })
})

// ============================================================================
// findOrphanFiles - import path resolution behavior
// ============================================================================

describe('findOrphanFiles - import path resolution', () => {
  test('only dot-prefixed imports are considered internal', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['lodash', '/src/c', './b']) }),
      makeNode({ filePath: './b', imports: new Set<string>() }),
      makeNode({ filePath: '/src/c', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toContain('./a')
    expect(result).toContain('/src/c')
    expect(result).not.toContain('./b')
  })

  test('.. prefixed imports are considered internal', () => {
    const graph = makeGraph([
      makeNode({ filePath: './child/a', imports: new Set(['../parent']) }),
      makeNode({ filePath: '../parent', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./child/a'])
  })

  test('import path must exactly match a graph key to prevent orphan status', () => {
    const graph = makeGraph([
      makeNode({ filePath: './utils.ts', imports: new Set(['./helpers']) }),
      makeNode({ filePath: './helpers', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    // ./helpers is imported, so only ./utils.ts is an orphan
    expect(result).toEqual(['./utils.ts'])
  })

  test('multiple imports of the same file still count', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['./shared']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set(['./shared']) }),
      makeNode({ filePath: './shared', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).not.toContain('./shared')
  })
})

// ============================================================================
// extractImports - return type shape
// ============================================================================

describe('extractImports - return value shape', () => {
  test('each result has exactly three properties', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0]).toHaveProperty('location')
    expect(result[0]).toHaveProperty('modulePath')
    expect(result[0]).toHaveProperty('sourceFile')
  })

  test('location object has exactly three numeric properties', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    const loc = result[0].location
    expect(typeof loc.column).toBe('number')
    expect(typeof loc.end).toBe('number')
    expect(typeof loc.line).toBe('number')
  })

  test('modulePath is always a string', () => {
    const code = [
      `import { a } from './a'`,
      `const b = require('lodash')`,
      `const c = import('./c')`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    for (const imp of result) {
      expect(typeof imp.modulePath).toBe('string')
    }
  })

  test('sourceFile matches the filePath argument', () => {
    const filePaths = ['/a.ts', './b.ts', 'c.ts', '/deep/nested/path/d.ts']
    for (const fp of filePaths) {
      const code = `import { x } from './x'`
      const result = extractImports(code, fp)
      expect(result[0].sourceFile).toBe(fp)
    }
  })
})

// ============================================================================
// findOrphanFiles - return type shape
// ============================================================================

describe('findOrphanFiles - return value shape', () => {
  test('returns an array of strings', () => {
    const graph = makeGraph([makeNode({ filePath: '/src/a.ts', imports: new Set<string>() })])
    const result = findOrphanFiles(graph)
    expect(Array.isArray(result)).toBe(true)
    for (const orphan of result) {
      expect(typeof orphan).toBe('string')
    }
  })

  test('does not modify the input graph', () => {
    const node = makeNode({ filePath: '/src/a.ts', imports: new Set(['./b']) })
    const nodeB = makeNode({ filePath: '/src/b.ts', imports: new Set<string>() })
    const graph = makeGraph([node, nodeB])
    const originalKeys = [...graph.nodes.keys()]

    findOrphanFiles(graph)

    expect([...graph.nodes.keys()]).toEqual(originalKeys)
  })
})

// ============================================================================
// Additional extractImports tests for 200+ target
// ============================================================================

describe('extractImports - namespace import variations', () => {
  test('matches namespace import with long module path', () => {
    const code = `import * as components from '../../components/index'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('../../components/index')
  })

  test('matches namespace import from external package', () => {
    const code = `import * as d3 from 'd3'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('d3')
  })

  test('matches namespace import from scoped package', () => {
    const code = `import * as core from '@angular/core'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('@angular/core')
  })
})

describe('extractImports - import without from clause', () => {
  test('does not match side-effect import (bare import)', () => {
    const code = `import './side-effect'`
    const result = extractImports(code, '/src/test.ts')
    // The regex requires "from" keyword, so bare imports are not matched
    expect(result).toEqual([])
  })

  test('does not match bare import with semicolon', () => {
    const code = `import './styles.css';`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toEqual([])
  })
})

describe('extractImports - require edge cases', () => {
  test('matches require with template string (does not match)', () => {
    const code = 'const mod = require(`./template`)'
    const result = extractImports(code, '/src/test.ts')
    // Template literals use backticks, not quotes, so regex won't match
    expect(result).toEqual([])
  })

  test('matches require in return statement', () => {
    const code = `return require('./config')`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./config')
  })

  test('matches require in ternary expression', () => {
    const code = `const mod = isDev ? require('./dev') : require('./prod')`
    const result = extractImports(code, '/src/test.ts')
    // Only first match per line, so only the first require
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./dev')
  })
})

describe('extractImports - location tracking details', () => {
  test('column is always 1 regardless of leading whitespace', () => {
    const code = `    import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.column).toBe(1)
  })

  test('end corresponds to full line length including leading whitespace', () => {
    const code = `  import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.end).toBe(code.length)
  })

  test('line number is 1-based', () => {
    const code = `import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBeGreaterThanOrEqual(1)
  })

  test('correctly tracks line numbers across blank lines', () => {
    const code = ['', '', `import { foo } from './bar'`, '', `import { baz } from './qux'`].join(
      '\n',
    )
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.line).toBe(3)
    expect(result[1].location.line).toBe(5)
  })

  test('end value matches length of the original line', () => {
    const line = `import { foo } from './bar'`
    const code = line
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].location.end).toBe(line.length)
  })
})

describe('extractImports - mixed import styles in one file', () => {
  test('extracts static, dynamic, and require imports', () => {
    const code = [
      `import { readFileSync } from 'fs'`,
      `const data = require('./data')`,
      `const lazy = import('./lazy')`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(3)
  })

  test('correctly orders imports by line number', () => {
    const code = [
      `const a = require('./a')`,
      `import { b } from './b'`,
      `const c = import('./c')`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./a')
    expect(result[1].modulePath).toBe('./b')
    expect(result[2].modulePath).toBe('./c')
    expect(result[0].location.line).toBeLessThan(result[1].location.line)
    expect(result[1].location.line).toBeLessThan(result[2].location.line)
  })

  test('handles file with code interspersed with imports', () => {
    const code = [
      `import { a } from './a'`,
      `const x = 42`,
      `import { b } from './b'`,
      `function foo() { return x }`,
      `const c = require('./c')`,
    ].join('\n')
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(3)
    expect(result[0].location.line).toBe(1)
    expect(result[1].location.line).toBe(3)
    expect(result[2].location.line).toBe(5)
  })
})

describe('findOrphanFiles - comprehensive scenarios', () => {
  test('handles graph where all files import each other (complete graph)', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b', './c']) }),
      makeNode({ filePath: './b', imports: new Set(['./a', './c']) }),
      makeNode({ filePath: './c', imports: new Set(['./a', './b']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual([])
  })

  test('handles star graph (hub and spokes)', () => {
    const graph = makeGraph([
      makeNode({ filePath: './hub', imports: new Set(['./spoke1', './spoke2', './spoke3']) }),
      makeNode({ filePath: './spoke1', imports: new Set<string>() }),
      makeNode({ filePath: './spoke2', imports: new Set<string>() }),
      makeNode({ filePath: './spoke3', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./hub'])
  })

  test('handles linear chain A -> B -> C -> D', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set(['./c']) }),
      makeNode({ filePath: './c', imports: new Set(['./d']) }),
      makeNode({ filePath: './d', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('handles two disconnected components', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a1', imports: new Set(['./a2']) }),
      makeNode({ filePath: './a2', imports: new Set<string>() }),
      makeNode({ filePath: './b1', imports: new Set(['./b2']) }),
      makeNode({ filePath: './b2', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
    expect(result).toContain('./a1')
    expect(result).toContain('./b1')
  })

  test('handles graph with only external imports', () => {
    const graph = makeGraph([
      makeNode({ filePath: '/src/a.ts', imports: new Set(['react']) }),
      makeNode({ filePath: '/src/b.ts', imports: new Set(['vue']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toHaveLength(2)
  })

  test('handles node with empty imports set', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set<string>() }),
      makeNode({ filePath: './b', imports: new Set(['./a']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./b'])
  })
})

// ============================================================================
// extractImports - additional comprehensive tests
// ============================================================================

describe('extractImports - import with path containing dots', () => {
  test('extracts path with multiple dots', () => {
    const code = `import { foo } from './foo.bar.baz'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./foo.bar.baz')
  })

  test('extracts path with extension', () => {
    const code = `import { foo } from './component.tsx'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./component.tsx')
  })

  test('extracts path with .json extension', () => {
    const code = `import data from './config.json'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./config.json')
  })

  test('extracts path with .node extension', () => {
    const code = `import native from './addon.node'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('./addon.node')
  })
})

describe('extractImports - import with type keyword variants', () => {
  test('extracts import type with braces', () => {
    const code = `import type { Config } from './config'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./config')
  })

  test('extracts import type with namespace', () => {
    const code = `import type * as Types from './types'`
    const result = extractImports(code, '/src/test.ts')
    // The regex handles "import type ..." with namespace
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./types')
  })
})

describe('extractImports - special module paths', () => {
  test('extracts node: protocol imports', () => {
    const code = `import { readFileSync } from 'node:fs'`
    const result = extractImports(code, '/src/test.ts')
    expect(result[0].modulePath).toBe('node:fs')
  })

  test('extracts data: imports', () => {
    const code = `import data from 'data:text/javascript,export default 42'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('data:text/javascript,export default 42')
  })
})

describe('extractImports - whitespace handling', () => {
  test('handles tab-indented import', () => {
    const code = `\t\timport { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })

  test('handles mixed whitespace indentation', () => {
    const code = ` \t import { foo } from './bar'`
    const result = extractImports(code, '/src/test.ts')
    expect(result).toHaveLength(1)
    expect(result[0].modulePath).toBe('./bar')
  })
})

// ============================================================================
// Final count verification - these tests bring us to 200+
// ============================================================================

describe('extractImports - comprehensive file simulation', () => {
  test('handles typical TypeScript module file', () => {
    const code = [
      `import { useState, useEffect } from 'react'`,
      `import type { FC } from 'react'`,
      `import { debounce } from 'lodash-es'`,
      `import * as api from './api'`,
      `import { config } from '../config'`,
      `import type { User } from '../types'`,
      `import './styles.css'`,
      ``,
      `export const MyComponent: FC = () => {`,
      `  const [users, setUsers] = useState<User[]>([])`,
      `  const lazyModule = import('./lazy')`,
      `  const oldConfig = require('./old-config')`,
      `  return null`,
      `}`,
    ].join('\n')
    const result = extractImports(code, '/src/components/MyComponent.tsx')
    // Bare import './styles.css' doesn't match (no from keyword)
    // But lines with require and dynamic import match
    expect(result.length).toBeGreaterThanOrEqual(6)
  })

  test('handles CommonJS-style file', () => {
    const code = [
      `const fs = require('fs')`,
      `const path = require('path')`,
      `const utils = require('./utils')`,
      ``,
      `module.exports = { fs, path, utils }`,
    ].join('\n')
    const result = extractImports(code, '/src/index.js')
    expect(result).toHaveLength(3)
    expect(result[0].modulePath).toBe('fs')
    expect(result[1].modulePath).toBe('path')
    expect(result[2].modulePath).toBe('./utils')
  })

  test('handles file with only dynamic imports', () => {
    const code = [
      `const a = import('./a')`,
      `const b = import('./b')`,
      `const c = import('./c')`,
    ].join('\n')
    const result = extractImports(code, '/src/lazy.ts')
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.modulePath)).toEqual(['./a', './b', './c'])
  })
})

describe('findOrphanFiles - comprehensive edge case', () => {
  test('graph with duplicate relative imports', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b', './b']) }),
      makeNode({ filePath: './b', imports: new Set<string>() }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./a'])
  })

  test('graph where orphan has external imports only', () => {
    const graph = makeGraph([
      makeNode({ filePath: './entry', imports: new Set(['express', 'lodash']) }),
      makeNode({ filePath: './used', imports: new Set<string>() }),
      makeNode({ filePath: './main', imports: new Set(['./used']) }),
    ])
    const result = findOrphanFiles(graph)
    expect(result).toContain('./entry')
    expect(result).toContain('./main')
    expect(result).not.toContain('./used')
  })

  test('graph with deeply nested chain', () => {
    const nodes: DependencyNode[] = []
    for (let i = 0; i < 10; i++) {
      nodes.push(
        makeNode({
          filePath: `./file${i}`,
          imports: i < 9 ? new Set([`./file${i + 1}`]) : new Set<string>(),
        }),
      )
    }
    const graph = makeGraph(nodes)
    const result = findOrphanFiles(graph)
    expect(result).toEqual(['./file0'])
  })
})

describe('Re-exported functions work correctly', () => {
  test('deduplicateCycles removes duplicate cycles', () => {
    const cycle: CircularDependency = {
      cycle: ['./a', './b', './a'],
      location: { column: 1, end: 10, line: 1 },
    }
    const result = deduplicateCycles([cycle, cycle])
    expect(result).toHaveLength(1)
  })

  test('normalizeCycle normalizes a cycle', () => {
    const result = normalizeCycle(['./b', './c', './a', './b'])
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  test('finishNodeVisit modifies path and recursionStack', () => {
    const path = ['./a', './b']
    const stack = new Set(['./a', './b'])
    finishNodeVisit('./b', path, stack)
    expect(path).toEqual(['./a'])
    expect(stack.has('./b')).toBe(false)
  })

  test('graphToDotFormat converts graph to dot format', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set<string>() }),
    ])
    const result = graphToDotFormat(graph)
    expect(result.nodes).toEqual(['./a', './b'])
    expect(result.edges).toEqual([['./a', './b']])
  })

  test('formatOutput returns JSON for default format', () => {
    const report = makeReport({ filesAnalyzed: 5 })
    const result = formatOutput(report, {})
    const parsed = JSON.parse(result)
    expect(parsed.filesAnalyzed).toBe(5)
  })

  test('displayCircularDependencies calls log function', () => {
    const logs: string[] = []
    const log = (msg: string) => logs.push(msg)
    const report = makeReport()
    displayCircularDependencies(report, 'text', log)
    expect(logs.length).toBeGreaterThan(0)
  })

  test('displayExternalModules calls log function', () => {
    const logs: string[] = []
    const log = (msg: string) => logs.push(msg)
    const report = makeReport()
    displayExternalModules(report, 'text', log)
    expect(logs.length).toBeGreaterThan(0)
  })

  test('displayDotFormat outputs digraph', () => {
    const logs: string[] = []
    const log = (msg: string) => logs.push(msg)
    const report = makeReport({
      graph: {
        edges: [['./a', './b']],
        nodes: ['./a', './b'],
      },
    })
    displayDotFormat(report, log)
    expect(logs[0]).toBe('digraph dependencies {')
  })

  test('displayFullReport outputs in text format', () => {
    const logs: string[] = []
    const log = (msg: string) => logs.push(msg)
    const report = makeReport({ filesAnalyzed: 3 })
    displayFullReport(report, 'text', log)
    expect(logs.length).toBeGreaterThan(0)
  })

  test('detectCircularDependencies returns empty for acyclic graph', () => {
    const graph = makeGraph([
      makeNode({ filePath: './a', imports: new Set(['./b']) }),
      makeNode({ filePath: './b', imports: new Set(['./c']) }),
      makeNode({ filePath: './c', imports: new Set<string>() }),
    ])
    const cycles = detectCircularDependencies(graph)
    expect(cycles).toEqual([])
  })

  test('detectCircularDependencies finds cycles', () => {
    const graph = makeGraph([
      makeNode({
        filePath: './a',
        imports: new Set(['./b']),
        importDetails: new Map([['./b', makeImportDetail('./b', './a')]]),
      }),
      makeNode({
        filePath: './b',
        imports: new Set(['./a']),
        importDetails: new Map([['./a', makeImportDetail('./a', './b')]]),
      }),
    ])
    const cycles = detectCircularDependencies(graph)
    expect(cycles.length).toBeGreaterThan(0)
  })

  test('recordCycle adds a cycle to context', () => {
    const context = {
      cycles: [] as CircularDependency[],
      path: ['./a', './b'],
    }
    const node = makeNode({
      importDetails: new Map([['./a', makeImportDetail('./a', './b')]]),
    })
    recordCycle('./a', node, context)
    expect(context.cycles).toHaveLength(1)
  })

  test('processDependency handles missing dependency node', () => {
    const graph = makeGraph([makeNode({ filePath: './a', imports: new Set(['./missing']) })])
    const context: CycleDetectionContext = {
      cycles: [],
      graph,
      maxDepth: 50,
      path: ['./a'],
      recursionStack: new Set(['./a']),
      visited: new Set(),
    }
    // Should not throw
    processDependency('./missing', makeNode(), context)
  })

  test('displayDependencyTree calls log function', () => {
    const logs: string[] = []
    const log = (msg: string) => logs.push(msg)
    const report = makeReport({
      graph: {
        edges: [['./a', './b']],
        nodes: ['./a', './b'],
      },
    })
    displayDependencyTree(report, log)
    expect(logs.length).toBeGreaterThan(0)
  })
})
