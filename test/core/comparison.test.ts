import { describe, it, expect } from 'vitest'
import { DiffEngine } from '../../src/core/comparison/diff-engine.js'
import { StructureComparator } from '../../src/core/comparison/structure-comparator.js'
import type {
  CodeStructure,
  FunctionInfo,
  ClassInfo,
  ImportInfo,
  ExportInfo,
  LineDiff,
  ComparisonConfig,
} from '../../src/core/comparison/types.js'

function makeFunction(overrides: Partial<FunctionInfo> = {}): FunctionInfo {
  return {
    name: 'testFn',
    params: 0,
    returnType: 'void',
    complexity: 1,
    loc: 5,
    isAsync: false,
    isExported: false,
    ...overrides,
  }
}

function makeClass(overrides: Partial<ClassInfo> = {}): ClassInfo {
  return {
    name: 'TestClass',
    methods: 1,
    properties: 0,
    interfaces: [],
    isAbstract: false,
    isExported: false,
    ...overrides,
  }
}

function makeStructure(overrides: Partial<CodeStructure> = {}): CodeStructure {
  return {
    filePath: 'test.ts',
    functions: [],
    classes: [],
    imports: [],
    exports: [],
    complexity: 1,
    loc: 10,
    ...overrides,
  }
}

describe('DiffEngine', () => {
  const engine = new DiffEngine()

  describe('computeLineDiff', () => {
    it('should return all equal for identical text', () => {
      const diff = engine.computeLineDiff('line1\nline2\nline3', 'line1\nline2\nline3')
      expect(diff.every((d) => d.type === 'equal')).toBe(true)
      expect(diff).toHaveLength(3)
    })

    it('should detect added lines', () => {
      const diff = engine.computeLineDiff('line1', 'line1\nline2\nline3')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBeGreaterThan(0)
    })

    it('should detect removed lines', () => {
      const diff = engine.computeLineDiff('line1\nline2\nline3', 'line1')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBeGreaterThan(0)
    })

    it('should detect mixed changes', () => {
      const diff = engine.computeLineDiff('a\nb\nc', 'a\nx\nc')
      const changes = diff.filter((d) => d.type !== 'equal')
      expect(changes.length).toBeGreaterThan(0)
    })

    it('should handle empty left string', () => {
      const diff = engine.computeLineDiff('', 'line1\nline2')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBeGreaterThan(0)
    })

    it('should handle empty right string', () => {
      const diff = engine.computeLineDiff('line1\nline2', '')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBeGreaterThan(0)
    })

    it('should handle both empty strings', () => {
      const diff = engine.computeLineDiff('', '')
      const types = diff.map((d) => d.type)
      expect(types.every((t) => t === 'equal')).toBe(true)
    })

    it('should produce line numbers on diff entries', () => {
      const diff = engine.computeLineDiff('a\nb', 'a\nc')
      for (const d of diff) {
        expect(d.lineNumber).toBeGreaterThanOrEqual(1)
      }
    })
  })

  describe('computeWordDiff', () => {
    it('should return all equal for identical words', () => {
      const diff = engine.computeWordDiff('hello world', 'hello world')
      expect(diff.every((d) => d.type === 'equal')).toBe(true)
    })

    it('should detect changed words', () => {
      const diff = engine.computeWordDiff('hello world', 'hello earth')
      const deletes = diff.filter((d) => d.type === 'delete')
      const adds = diff.filter((d) => d.type === 'add')
      expect(deletes.length + adds.length).toBeGreaterThan(0)
    })

    it('should detect added words', () => {
      const diff = engine.computeWordDiff('hello', 'hello world')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBeGreaterThan(0)
    })

    it('should detect removed words', () => {
      const diff = engine.computeWordDiff('hello world', 'hello')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBeGreaterThan(0)
    })

    it('should handle empty strings', () => {
      const diff = engine.computeWordDiff('', '')
      expect(diff.every((d) => d.type === 'equal')).toBe(true)
    })

    it('should include position on each entry', () => {
      const diff = engine.computeWordDiff('a b c', 'a x c')
      for (const d of diff) {
        expect(typeof d.position).toBe('number')
      }
    })
  })

  describe('computeSemanticDiff', () => {
    it('should detect function additions', () => {
      const left = makeStructure({ filePath: 'f.ts' })
      const right = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'newFn' })],
      })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'function-added' && m.name === 'newFn')).toBe(true)
    })

    it('should detect function removals', () => {
      const left = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'oldFn' })],
      })
      const right = makeStructure({ filePath: 'f.ts' })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'function-removed' && m.name === 'oldFn')).toBe(true)
    })

    it('should detect function changes', () => {
      const left = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 1 })],
      })
      const right = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 2 })],
      })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'function-changed' && m.name === 'fn')).toBe(true)
    })

    it('should detect class additions', () => {
      const left = makeStructure({ filePath: 'f.ts' })
      const right = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'NewClass' })],
      })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'class-added' && m.name === 'NewClass')).toBe(true)
    })

    it('should detect class changes', () => {
      const left = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 1 })],
      })
      const right = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 3 })],
      })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'class-changed' && m.name === 'Cls')).toBe(true)
    })

    it('should return modifications with filePath', () => {
      const left = makeStructure({
        filePath: 'src/a.ts',
        functions: [makeFunction({ name: 'fn' })],
      })
      const right = makeStructure({ filePath: 'src/a.ts' })
      const mods = engine.computeSemanticDiff(left, right)
      for (const m of mods) {
        expect(m.filePath).toBe('src/a.ts')
      }
    })
  })

  describe('applyPatch', () => {
    it('should apply add diffs', () => {
      const source = 'line1\nline2'
      const diff: LineDiff[] = [
        { type: 'equal', content: 'line1', lineNumber: 1 },
        { type: 'add', content: 'inserted', lineNumber: 2 },
        { type: 'equal', content: 'line2', lineNumber: 2 },
      ]
      const result = engine.applyPatch(source, diff)
      expect(result).toBe('line1\ninserted\nline2')
    })

    it('should apply delete diffs', () => {
      const source = 'line1\nline2\nline3'
      const diff: LineDiff[] = [
        { type: 'equal', content: 'line1', lineNumber: 1 },
        { type: 'delete', content: 'line2', lineNumber: 2 },
        { type: 'equal', content: 'line3', lineNumber: 2 },
      ]
      const result = engine.applyPatch(source, diff)
      expect(result).toBe('line1\nline3')
    })

    it('should apply mixed diffs', () => {
      const source = 'a\nb\nc'
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
        { type: 'add', content: 'x', lineNumber: 2 },
        { type: 'equal', content: 'c', lineNumber: 2 },
      ]
      const result = engine.applyPatch(source, diff)
      expect(result).toBe('a\nx\nc')
    })

    it('should return source unchanged for empty diff', () => {
      const source = 'a\nb\nc'
      const result = engine.applyPatch(source, [])
      expect(result).toBe('a\nb\nc')
    })

    it('should handle all-add diff', () => {
      const source = ''
      const diff: LineDiff[] = [
        { type: 'add', content: 'new1', lineNumber: 1 },
        { type: 'add', content: 'new2', lineNumber: 2 },
      ]
      const result = engine.applyPatch(source, diff)
      expect(result).toContain('new1')
      expect(result).toContain('new2')
    })

    it('should handle all-delete diff', () => {
      const source = 'a\nb'
      const diff: LineDiff[] = [
        { type: 'delete', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
      ]
      const result = engine.applyPatch(source, diff)
      expect(result).toBe('')
    })
  })

  describe('reverseDiff', () => {
    it('should reverse add to delete', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'x', lineNumber: 1 },
      ]
      const reversed = engine.reverseDiff(diff)
      expect(reversed[0]!.type).toBe('delete')
    })

    it('should reverse delete to add', () => {
      const diff: LineDiff[] = [
        { type: 'delete', content: 'x', lineNumber: 1 },
      ]
      const reversed = engine.reverseDiff(diff)
      expect(reversed[0]!.type).toBe('add')
    })

    it('should keep equal as equal', () => {
      const diff: LineDiff[] = [
        { type: 'equal', content: 'x', lineNumber: 1 },
      ]
      const reversed = engine.reverseDiff(diff)
      expect(reversed[0]!.type).toBe('equal')
    })

    it('should not mutate the original diff', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'x', lineNumber: 1 },
      ]
      engine.reverseDiff(diff)
      expect(diff[0]!.type).toBe('add')
    })

    it('should reverse mixed diffs correctly', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
        { type: 'equal', content: 'c', lineNumber: 3 },
      ]
      const reversed = engine.reverseDiff(diff)
      expect(reversed[0]!.type).toBe('delete')
      expect(reversed[1]!.type).toBe('add')
      expect(reversed[2]!.type).toBe('equal')
    })
  })

  describe('countChanges', () => {
    it('should count additions', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'a', lineNumber: 1 },
        { type: 'add', content: 'b', lineNumber: 2 },
        { type: 'equal', content: 'c', lineNumber: 3 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.additions).toBe(2)
    })

    it('should count deletions', () => {
      const diff: LineDiff[] = [
        { type: 'delete', content: 'a', lineNumber: 1 },
        { type: 'equal', content: 'b', lineNumber: 2 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.deletions).toBe(1)
    })

    it('should compute total changes', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
        { type: 'equal', content: 'c', lineNumber: 3 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.changes).toBe(2)
    })

    it('should return zero for all-equal diff', () => {
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'equal', content: 'b', lineNumber: 2 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.additions).toBe(0)
      expect(counts.deletions).toBe(0)
      expect(counts.changes).toBe(0)
    })

    it('should return zero for empty diff', () => {
      const counts = engine.countChanges([])
      expect(counts.changes).toBe(0)
    })
  })

  describe('mergeDiffs', () => {
    it('should merge two diff sets', () => {
      const a: LineDiff[] = [
        { type: 'equal', content: 'line1', lineNumber: 1 },
        { type: 'delete', content: 'line2', lineNumber: 2 },
      ]
      const b: LineDiff[] = [
        { type: 'equal', content: 'line1', lineNumber: 1 },
        { type: 'add', content: 'line3', lineNumber: 2 },
      ]
      const merged = engine.mergeDiffs(a, b)
      expect(merged.length).toBeGreaterThan(0)
    })

    it('should handle empty first diff', () => {
      const b: LineDiff[] = [
        { type: 'add', content: 'x', lineNumber: 1 },
      ]
      const merged = engine.mergeDiffs([], b)
      expect(merged).toEqual(b)
    })

    it('should handle empty second diff', () => {
      const a: LineDiff[] = [
        { type: 'delete', content: 'x', lineNumber: 1 },
      ]
      const merged = engine.mergeDiffs(a, [])
      expect(merged).toEqual(a)
    })

    it('should handle both empty', () => {
      const merged = engine.mergeDiffs([], [])
      expect(merged).toEqual([])
    })

    it('should preserve equal lines when both are equal', () => {
      const a: LineDiff[] = [
        { type: 'equal', content: 'shared', lineNumber: 1 },
      ]
      const b: LineDiff[] = [
        { type: 'equal', content: 'shared', lineNumber: 1 },
      ]
      const merged = engine.mergeDiffs(a, b)
      expect(merged).toHaveLength(1)
      expect(merged[0]!.type).toBe('equal')
    })
  })

  describe('createPatch', () => {
    it('should format added lines with + prefix', () => {
      const diff: LineDiff[] = [
        { type: 'add', content: 'new line', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe('+new line')
    })

    it('should format deleted lines with - prefix', () => {
      const diff: LineDiff[] = [
        { type: 'delete', content: 'old line', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe('-old line')
    })

    it('should format equal lines with space prefix', () => {
      const diff: LineDiff[] = [
        { type: 'equal', content: 'same line', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe(' same line')
    })

    it('should format mixed diffs', () => {
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
        { type: 'add', content: 'c', lineNumber: 2 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe(' a\n-b\n+c')
    })

    it('should handle empty diffs', () => {
      const patch = engine.createPatch([])
      expect(patch).toBe('')
    })
  })
})

describe('StructureComparator', () => {
  describe('constructor', () => {
    it('should create with default config', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({
        functions: [makeFunction({ name: '_private' })],
      })
      const has = comparator.hasFunction(struct, '_private')
      expect(has).toBe(true)
    })

    it('should accept custom config', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const left = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: '_private' })],
      })
      const right = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.compare(left, right)
      const fnRemoved = diff.modified.some((m) => m.name === '_private')
      expect(fnRemoved).toBe(false)
    })
  })

  describe('extractStructure', () => {
    it('should extract named functions', () => {
      const comparator = new StructureComparator()
      const source = `function greet(name: string): string { return name; }`
      const struct = comparator.extractStructure(source, 'greet.ts')
      expect(struct.functions.some((f) => f.name === 'greet')).toBe(true)
    })

    it('should extract functions that include async in name', () => {
      const comparator = new StructureComparator()
      const source = `function fetchData(): Promise<void> { return; }`
      const struct = comparator.extractStructure(source, 'fetch.ts')
      const fn = struct.functions.find((f) => f.name === 'fetchData')
      expect(fn).toBeDefined()
    })

    it('should extract exported functions by name', () => {
      const comparator = new StructureComparator()
      const source = `export function helper(): void { }`
      const struct = comparator.extractStructure(source, 'helper.ts')
      const fn = struct.functions.find((f) => f.name === 'helper')
      expect(fn).toBeDefined()
    })

    it('should extract classes', () => {
      const comparator = new StructureComparator()
      const source = `class UserService { constructor() {} getName() { return ''; } }`
      const struct = comparator.extractStructure(source, 'svc.ts')
      expect(struct.classes.some((c) => c.name === 'UserService')).toBe(true)
    })

    it('should extract imports', () => {
      const comparator = new StructureComparator()
      const source = `import { readFileSync } from 'fs';`
      const struct = comparator.extractStructure(source, 'imp.ts')
      expect(struct.imports.some((i) => i.module === 'fs')).toBe(true)
    })

    it('should extract exports', () => {
      const comparator = new StructureComparator()
      const source = `export function main(): void { }`
      const struct = comparator.extractStructure(source, 'exp.ts')
      expect(struct.exports.some((e) => e.name === 'main')).toBe(true)
    })

    it('should compute loc excluding blank lines', () => {
      const comparator = new StructureComparator()
      const source = `line1\n\nline3\n\n\nline6`
      const struct = comparator.extractStructure(source, 'loc.ts')
      expect(struct.loc).toBe(3)
    })

    it('should compute complexity from function bodies', () => {
      const comparator = new StructureComparator()
      const source = `function complex(x: number): number { if (x > 0) { return x; } else { return -x; } }`
      const struct = comparator.extractStructure(source, 'complex.ts')
      expect(struct.complexity).toBeGreaterThan(1)
    })

    it('should handle source with no structures', () => {
      const comparator = new StructureComparator()
      const source = `const x = 1;`
      const struct = comparator.extractStructure(source, 'empty.ts')
      expect(struct.functions).toEqual([])
      expect(struct.classes).toEqual([])
      expect(struct.imports).toEqual([])
      expect(struct.exports).toEqual([])
    })

    it('should set filePath correctly', () => {
      const comparator = new StructureComparator()
      const struct = comparator.extractStructure('const x = 1;', 'path/to/file.ts')
      expect(struct.filePath).toBe('path/to/file.ts')
    })
  })

  describe('compare', () => {
    it('should return empty modifications for identical structures', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({ filePath: 'same.ts' })
      const diff = comparator.compare(struct, struct)
      expect(diff.modified).toHaveLength(0)
      expect(diff.added).toHaveLength(0)
      expect(diff.removed).toHaveLength(0)
    })

    it('should mark as added/removed when file paths differ', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({ filePath: 'a.ts' })
      const b = makeStructure({ filePath: 'b.ts' })
      const diff = comparator.compare(a, b)
      expect(diff.added).toHaveLength(1)
      expect(diff.removed).toHaveLength(1)
      expect(diff.similarity).toBe(0)
    })

    it('should detect added functions', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({ filePath: 'f.ts' })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'newFn' })],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-added' && m.name === 'newFn')).toBe(true)
    })

    it('should detect removed functions', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'oldFn' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-removed' && m.name === 'oldFn')).toBe(true)
    })

    it('should detect changed functions', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 1 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 3 })],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-changed' && m.name === 'fn')).toBe(true)
    })

    it('should detect added classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({ filePath: 'f.ts' })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'NewCls' })],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-added' && m.name === 'NewCls')).toBe(true)
    })

    it('should detect removed classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'OldCls' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-removed' && m.name === 'OldCls')).toBe(true)
    })

    it('should detect changed classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 1 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 5 })],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-changed' && m.name === 'Cls')).toBe(true)
    })

    it('should detect import changes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        imports: [{ module: 'fs', names: ['readFile'], isTypeOnly: false }],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        imports: [{ module: 'fs', names: ['readFile', 'writeFile'], isTypeOnly: false }],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'import-changed')).toBe(true)
    })

    it('should detect export changes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        exports: [{ name: 'fn1', type: 'function', isDefault: false }],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        exports: [{ name: 'fn2', type: 'function', isDefault: false }],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'export-changed')).toBe(true)
    })

    it('should skip import changes when ignoreImports is true', () => {
      const comparator = new StructureComparator({ ignoreImports: true })
      const a = makeStructure({
        filePath: 'f.ts',
        imports: [{ module: 'a', names: ['x'], isTypeOnly: false }],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        imports: [{ module: 'b', names: ['y'], isTypeOnly: false }],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'import-changed')).toBe(false)
    })

    it('should skip export changes when ignoreExports is true', () => {
      const comparator = new StructureComparator({ ignoreExports: true })
      const a = makeStructure({
        filePath: 'f.ts',
        exports: [{ name: 'old', type: 'function', isDefault: false }],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        exports: [{ name: 'new', type: 'function', isDefault: false }],
      })
      const diff = comparator.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'export-changed')).toBe(false)
    })

    it('should compute similarity', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn1' })],
      })
      const diff = comparator.compare(a, b)
      expect(diff.similarity).toBeGreaterThan(0)
      expect(diff.similarity).toBeLessThanOrEqual(1)
    })
  })

  describe('compareMany', () => {
    it('should match files by same path', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.commonCount).toBe(1)
    })

    it('should detect new files', () => {
      const comparator = new StructureComparator()
      const left: CodeStructure[] = []
      const right = [makeStructure({ filePath: 'new.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.addedCount).toBe(1)
      expect(result.diff.added).toHaveLength(1)
    })

    it('should detect removed files', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'old.ts' })]
      const right: CodeStructure[] = []
      const result = comparator.compareMany(left, right)
      expect(result.statistics.removedCount).toBe(1)
      expect(result.diff.removed).toHaveLength(1)
    })

    it('should handle mixed adds and removes', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'kept.ts' }), makeStructure({ filePath: 'removed.ts' })]
      const right = [makeStructure({ filePath: 'kept.ts' }), makeStructure({ filePath: 'added.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.addedCount).toBe(1)
      expect(result.statistics.removedCount).toBe(1)
    })

    it('should compute statistics', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.totalLeft).toBe(2)
      expect(result.statistics.totalRight).toBe(2)
      expect(result.statistics.commonCount).toBe(2)
    })

    it('should return similarityIndex 1 for identical file sets', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.similarityIndex).toBe(1)
    })

    it('should return similarityIndex 0 for completely different file sets', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'b.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.statistics.similarityIndex).toBe(0)
    })

    it('should include left and right in result', () => {
      const comparator = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' })]
      const result = comparator.compareMany(left, right)
      expect(result.left).toBe(left)
      expect(result.right).toBe(right)
    })

    it('should handle empty both sides', () => {
      const comparator = new StructureComparator()
      const result = comparator.compareMany([], [])
      expect(result.statistics.totalLeft).toBe(0)
      expect(result.statistics.totalRight).toBe(0)
      expect(result.statistics.similarityIndex).toBe(1)
    })
  })

  describe('findSimilar', () => {
    it('should find similar structure above threshold', () => {
      const comparator = new StructureComparator({ similarityThreshold: 0.5 })
      const target = makeStructure({
        filePath: 'x.ts',
        functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' })],
      })
      const candidates = [
        makeStructure({
          filePath: 'y.ts',
          functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' })],
        }),
      ]
      const result = comparator.findSimilar(target, candidates)
      expect(result).not.toBeNull()
      expect(result!.filePath).toBe('y.ts')
    })

    it('should return null when below threshold', () => {
      const comparator = new StructureComparator({ similarityThreshold: 0.9 })
      const target = makeStructure({
        filePath: 'x.ts',
        functions: [makeFunction({ name: 'fnA' })],
      })
      const candidates = [
        makeStructure({
          filePath: 'y.ts',
          functions: [makeFunction({ name: 'fnB' })],
        }),
      ]
      const result = comparator.findSimilar(target, candidates)
      expect(result).toBeNull()
    })

    it('should return null for empty candidates', () => {
      const comparator = new StructureComparator()
      const target = makeStructure({ filePath: 'x.ts' })
      const result = comparator.findSimilar(target, [])
      expect(result).toBeNull()
    })

    it('should pick the best match from multiple candidates', () => {
      const comparator = new StructureComparator({ similarityThreshold: 0.3 })
      const target = makeStructure({
        filePath: 'x.ts',
        functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' }), makeFunction({ name: 'fn3' })],
      })
      const candidates = [
        makeStructure({ filePath: 'low.ts', functions: [makeFunction({ name: 'fn1' })] }),
        makeStructure({
          filePath: 'high.ts',
          functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' })],
        }),
      ]
      const result = comparator.findSimilar(target, candidates)
      expect(result).not.toBeNull()
      expect(result!.filePath).toBe('high.ts')
    })
  })

  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical structures', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        functions: [makeFunction({ name: 'fn1' })],
        classes: [makeClass({ name: 'Cls1' })],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: 'fn1' })],
        classes: [makeClass({ name: 'Cls1' })],
      })
      expect(comparator.calculateSimilarity(a, b)).toBe(1.0)
    })

    it('should return 0.0 for completely different structures', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        functions: [makeFunction({ name: 'fnA' })],
        classes: [makeClass({ name: 'ClsA' })],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: 'fnB' })],
        classes: [makeClass({ name: 'ClsB' })],
      })
      expect(comparator.calculateSimilarity(a, b)).toBe(0.0)
    })

    it('should return 1.0 for structures with no functions or classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure()
      const b = makeStructure()
      expect(comparator.calculateSimilarity(a, b)).toBe(1.0)
    })

    it('should return partial overlap as fractional value', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn2' })],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: 'fn1' }), makeFunction({ name: 'fn3' })],
      })
      const sim = comparator.calculateSimilarity(a, b)
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThan(1)
    })

    it('should consider classes in similarity', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        functions: [makeFunction({ name: 'fn1' })],
        classes: [makeClass({ name: 'Cls1' })],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: 'fn1' })],
        classes: [makeClass({ name: 'Cls2' })],
      })
      const sim = comparator.calculateSimilarity(a, b)
      expect(sim).toBeGreaterThan(0)
      expect(sim).toBeLessThan(1)
    })
  })

  describe('hasFunction', () => {
    it('should return true when function exists', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({
        functions: [makeFunction({ name: 'myFunc' })],
      })
      expect(comparator.hasFunction(struct, 'myFunc')).toBe(true)
    })

    it('should return false when function does not exist', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({
        functions: [makeFunction({ name: 'otherFunc' })],
      })
      expect(comparator.hasFunction(struct, 'myFunc')).toBe(false)
    })

    it('should return false for empty functions', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure()
      expect(comparator.hasFunction(struct, 'anything')).toBe(false)
    })
  })

  describe('hasClass', () => {
    it('should return true when class exists', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({
        classes: [makeClass({ name: 'MyClass' })],
      })
      expect(comparator.hasClass(struct, 'MyClass')).toBe(true)
    })

    it('should return false when class does not exist', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure({
        classes: [makeClass({ name: 'OtherClass' })],
      })
      expect(comparator.hasClass(struct, 'MyClass')).toBe(false)
    })

    it('should return false for empty classes', () => {
      const comparator = new StructureComparator()
      const struct = makeStructure()
      expect(comparator.hasClass(struct, 'anything')).toBe(false)
    })
  })

  describe('getFunctionDiff', () => {
    it('should detect added functions', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({ filePath: 'f.ts' })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'newFn' })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.added).toHaveLength(1)
      expect(diff.added[0]!.name).toBe('newFn')
    })

    it('should detect removed functions', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'oldFn' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(1)
      expect(diff.removed[0]!.name).toBe('oldFn')
    })

    it('should detect changed params', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 1 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', params: 3 })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed returnType', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', returnType: 'void' })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', returnType: 'string' })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed isAsync', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', isAsync: false })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', isAsync: true })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed complexity', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', complexity: 1 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'fn', complexity: 5 })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should return empty arrays for identical functions', () => {
      const comparator = new StructureComparator()
      const fn = makeFunction({ name: 'fn' })
      const a = makeStructure({ filePath: 'f.ts', functions: [fn] })
      const b = makeStructure({ filePath: 'f.ts', functions: [fn] })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.added).toHaveLength(0)
      expect(diff.removed).toHaveLength(0)
      expect(diff.changed).toHaveLength(0)
    })
  })

  describe('getClassDiff', () => {
    it('should detect added classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({ filePath: 'f.ts' })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'NewCls' })],
      })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.added).toHaveLength(1)
      expect(diff.added[0]!.name).toBe('NewCls')
    })

    it('should detect removed classes', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'OldCls' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.removed).toHaveLength(1)
      expect(diff.removed[0]!.name).toBe('OldCls')
    })

    it('should detect changed methods count', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 1 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', methods: 4 })],
      })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed properties count', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', properties: 0 })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', properties: 3 })],
      })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed isAbstract', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', isAbstract: false })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', isAbstract: true })],
      })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should detect changed interfaces', () => {
      const comparator = new StructureComparator()
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', interfaces: ['IFoo'] })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'Cls', interfaces: ['IFoo', 'IBar'] })],
      })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('should return empty arrays for identical classes', () => {
      const comparator = new StructureComparator()
      const cls = makeClass({ name: 'Cls' })
      const a = makeStructure({ filePath: 'f.ts', classes: [cls] })
      const b = makeStructure({ filePath: 'f.ts', classes: [cls] })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.added).toHaveLength(0)
      expect(diff.removed).toHaveLength(0)
      expect(diff.changed).toHaveLength(0)
    })
  })

  describe('ignorePrivate config', () => {
    it('should filter functions starting with _', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'publicFn' }), makeFunction({ name: '_privateFn' })],
      })
      const b = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'publicFn' })],
      })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })

    it('should filter functions starting with private', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'privateMethod' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })

    it('should filter classes starting with _', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: '_PrivateClass' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })

    it('should filter classes starting with Private', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        filePath: 'f.ts',
        classes: [makeClass({ name: 'PrivateHelper' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getClassDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })

    it('should not filter public functions when ignorePrivate is true', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: 'publicFn' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(1)
      expect(diff.removed[0]!.name).toBe('publicFn')
    })

    it('should include private functions when ignorePrivate is false', () => {
      const comparator = new StructureComparator({ ignorePrivate: false })
      const a = makeStructure({
        filePath: 'f.ts',
        functions: [makeFunction({ name: '_privateFn' })],
      })
      const b = makeStructure({ filePath: 'f.ts' })
      const diff = comparator.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(1)
    })

    it('should affect calculateSimilarity when ignorePrivate is true', () => {
      const comparator = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({
        functions: [makeFunction({ name: '_privateFn' })],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: '_privateFn' })],
      })
      expect(comparator.calculateSimilarity(a, b)).toBe(1.0)
    })
  })
})
