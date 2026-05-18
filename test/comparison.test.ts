import { DiffEngine } from '../src/core/comparison/diff-engine.js'
import type { LineDiff, CodeStructure, FunctionInfo, ClassInfo, ImportInfo, ExportInfo } from '../src/core/comparison/types.js'
import { StructureComparator } from '../src/core/comparison/structure-comparator.js'

// ─── Helpers ──────────────────────────────────────────────────────────

function makeFunction(overrides: Partial<FunctionInfo> = {}): FunctionInfo {
  return {
    name: 'fn',
    params: 0,
    returnType: 'void',
    complexity: 1,
    loc: 1,
    isAsync: false,
    isExported: false,
    ...overrides,
  }
}

function makeClass(overrides: Partial<ClassInfo> = {}): ClassInfo {
  return {
    name: 'Cls',
    methods: 0,
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

// ─── DiffEngine – computeLineDiff ─────────────────────────────────────

describe('DiffEngine', () => {
  describe('computeLineDiff', () => {
    it('returns empty diff for identical strings', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('a\nb\nc', 'a\nb\nc')
      expect(diff.every((d) => d.type === 'equal')).toBe(true)
      expect(diff.length).toBe(3)
    })

    it('detects added lines', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('a\nb', 'a\nb\nc')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBe(1)
      expect(adds[0]!.content).toBe('c')
    })

    it('detects deleted lines', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('a\nb\nc', 'a\nb')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBe(1)
      expect(deletes[0]!.content).toBe('c')
    })

    it('returns single equal for two empty strings', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('', '')
      expect(diff).toHaveLength(1)
      expect(diff[0]!.type).toBe('equal')
      expect(diff[0]!.content).toBe('')
    })

    it('returns adds when left is empty', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('', 'x\ny')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBeGreaterThanOrEqual(2)
    })

    it('returns deletes when right is empty', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('x\ny', '')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBeGreaterThanOrEqual(2)
    })

    it('handles single-line strings', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('hello', 'world')
      expect(diff.some((d) => d.type === 'delete')).toBe(true)
      expect(diff.some((d) => d.type === 'add')).toBe(true)
    })

    it('produces correct line number fields', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('a\nb', 'a\nb')
      for (const d of diff) {
        expect(d.lineNumber).toBeGreaterThanOrEqual(1)
      }
    })
  })

  // ─── DiffEngine – computeWordDiff ──────────────────────────────────────

  describe('computeWordDiff', () => {
    it('returns all equal for identical strings', () => {
      const engine = new DiffEngine()
      const diff = engine.computeWordDiff('hello world', 'hello world')
      expect(diff.every((d) => d.type === 'equal')).toBe(true)
    })

    it('detects word additions', () => {
      const engine = new DiffEngine()
      const diff = engine.computeWordDiff('hello', 'hello world')
      const adds = diff.filter((d) => d.type === 'add')
      expect(adds.length).toBeGreaterThan(0)
      expect(adds.some((d) => d.text === 'world')).toBe(true)
    })

    it('detects word deletions', () => {
      const engine = new DiffEngine()
      const diff = engine.computeWordDiff('hello world', 'hello')
      const deletes = diff.filter((d) => d.type === 'delete')
      expect(deletes.length).toBeGreaterThan(0)
      expect(deletes.some((d) => d.text === 'world')).toBe(true)
    })

    it('returns single equal for two empty word strings', () => {
      const engine = new DiffEngine()
      const diff = engine.computeWordDiff('', '')
      expect(diff).toHaveLength(1)
      expect(diff[0]!.type).toBe('equal')
    })

    it('handles complete replacement of words', () => {
      const engine = new DiffEngine()
      const diff = engine.computeWordDiff('foo bar', 'baz qux')
      expect(diff.some((d) => d.type === 'delete')).toBe(true)
      expect(diff.some((d) => d.type === 'add')).toBe(true)
    })
  })

  // ─── DiffEngine – computeSemanticDiff ──────────────────────────────────

  describe('computeSemanticDiff', () => {
    it('returns modifications from StructureComparator', () => {
      const engine = new DiffEngine()
      const left = makeStructure({ functions: [makeFunction({ name: 'foo' })] })
      const right = makeStructure({ functions: [makeFunction({ name: 'foo', params: 2 })] })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.length).toBeGreaterThan(0)
      expect(mods.some((m) => m.type === 'function-changed')).toBe(true)
    })

    it('returns empty when structures are identical', () => {
      const engine = new DiffEngine()
      const struct = makeStructure({ functions: [makeFunction({ name: 'foo' })] })
      const mods = engine.computeSemanticDiff(struct, struct)
      // Same structure but imports/exports may be compared with JSON.stringify
      // so identical objects should produce no modifications
      expect(mods).toEqual([])
    })

    it('detects added functions via semantic diff', () => {
      const engine = new DiffEngine()
      const left = makeStructure()
      const right = makeStructure({ functions: [makeFunction({ name: 'bar' })] })
      const mods = engine.computeSemanticDiff(left, right)
      expect(mods.some((m) => m.type === 'function-added')).toBe(true)
    })
  })

  // ─── DiffEngine – applyPatch ───────────────────────────────────────────

  describe('applyPatch', () => {
    it('returns original for all-equal diff', () => {
      const engine = new DiffEngine()
      const diff = engine.computeLineDiff('a\nb', 'a\nb')
      const result = engine.applyPatch('a\nb', diff)
      expect(result).toBe('a\nb')
    })

    it('applies additions', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'add', content: 'b', lineNumber: 2 },
      ]
      const result = engine.applyPatch('a', diff)
      expect(result).toBe('a\nb')
    })

    it('applies deletions', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
      ]
      const result = engine.applyPatch('a\nb\nc', diff)
      expect(result).toBe('a\nc')
    })

    it('round-trips: diff then apply reproduces right', () => {
      const engine = new DiffEngine()
      const left = 'line1\nline2\nline3'
      const right = 'line1\nmodified\nline3\nline4'
      const diff = engine.computeLineDiff(left, right)
      const result = engine.applyPatch(left, diff)
      expect(result).toBe(right)
    })

    it('handles empty source with add-only diff', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'add', content: 'new', lineNumber: 1 },
      ]
      const result = engine.applyPatch('', diff)
      // empty source split => [''], so trailing '' remains in result
      expect(result.trimEnd()).toBe('new')
    })
  })

  // ─── DiffEngine – reverseDiff ──────────────────────────────────────────

  describe('reverseDiff', () => {
    it('swaps add and delete types', () => {
      const engine = new DiffEngine()
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

    it('does not mutate original diff', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'add', content: 'x', lineNumber: 1 },
      ]
      engine.reverseDiff(diff)
      expect(diff[0]!.type).toBe('add')
    })

    it('preserves content and lineNumber', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'delete', content: 'hello', lineNumber: 5 },
      ]
      const reversed = engine.reverseDiff(diff)
      expect(reversed[0]!.content).toBe('hello')
      expect(reversed[0]!.lineNumber).toBe(5)
    })

    it('returns empty array for empty input', () => {
      const engine = new DiffEngine()
      const reversed = engine.reverseDiff([])
      expect(reversed).toEqual([])
    })
  })

  // ─── DiffEngine – countChanges ─────────────────────────────────────────

  describe('countChanges', () => {
    it('counts additions and deletions', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'add', content: 'a', lineNumber: 1 },
        { type: 'add', content: 'b', lineNumber: 2 },
        { type: 'delete', content: 'c', lineNumber: 3 },
        { type: 'equal', content: 'd', lineNumber: 4 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.additions).toBe(2)
      expect(counts.deletions).toBe(1)
      expect(counts.changes).toBe(3)
    })

    it('returns zeros for all-equal diff', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'equal', content: 'b', lineNumber: 2 },
      ]
      const counts = engine.countChanges(diff)
      expect(counts.additions).toBe(0)
      expect(counts.deletions).toBe(0)
      expect(counts.changes).toBe(0)
    })

    it('returns zeros for empty diff', () => {
      const engine = new DiffEngine()
      const counts = engine.countChanges([])
      expect(counts).toEqual({ additions: 0, deletions: 0, changes: 0 })
    })
  })

  // ─── DiffEngine – mergeDiffs ───────────────────────────────────────────

  describe('mergeDiffs', () => {
    it('merges two diffs preserving order', () => {
      const engine = new DiffEngine()
      const a: LineDiff[] = [
        { type: 'equal', content: 'x', lineNumber: 1 },
        { type: 'delete', content: 'y', lineNumber: 2 },
      ]
      const b: LineDiff[] = [
        { type: 'equal', content: 'x', lineNumber: 1 },
        { type: 'add', content: 'z', lineNumber: 2 },
      ]
      const merged = engine.mergeDiffs(a, b)
      expect(merged.some((d) => d.type === 'delete')).toBe(true)
      expect(merged.some((d) => d.type === 'add')).toBe(true)
      expect(merged.some((d) => d.type === 'equal')).toBe(true)
    })

    it('handles one empty diff', () => {
      const engine = new DiffEngine()
      const a: LineDiff[] = [
        { type: 'equal', content: 'x', lineNumber: 1 },
      ]
      const merged = engine.mergeDiffs(a, [])
      expect(merged).toEqual(a)
    })

    it('handles both empty diffs', () => {
      const engine = new DiffEngine()
      const merged = engine.mergeDiffs([], [])
      expect(merged).toEqual([])
    })

    it('merges delete from a with add from b', () => {
      const engine = new DiffEngine()
      const a: LineDiff[] = [{ type: 'delete', content: 'old', lineNumber: 1 }]
      const b: LineDiff[] = [{ type: 'add', content: 'new', lineNumber: 1 }]
      const merged = engine.mergeDiffs(a, b)
      expect(merged.length).toBe(2)
      expect(merged[0]!.type).toBe('delete')
      expect(merged[1]!.type).toBe('add')
    })
  })

  // ─── DiffEngine – createPatch ──────────────────────────────────────────

  describe('createPatch', () => {
    it('formats additions with + prefix', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'add', content: 'hello', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe('+hello')
    })

    it('formats deletions with - prefix', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'delete', content: 'hello', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe('-hello')
    })

    it('formats equal lines with space prefix', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'equal', content: 'hello', lineNumber: 1 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe(' hello')
    })

    it('formats mixed diff correctly', () => {
      const engine = new DiffEngine()
      const diff: LineDiff[] = [
        { type: 'equal', content: 'a', lineNumber: 1 },
        { type: 'delete', content: 'b', lineNumber: 2 },
        { type: 'add', content: 'c', lineNumber: 3 },
      ]
      const patch = engine.createPatch(diff)
      expect(patch).toBe(' a\n-b\n+c')
    })

    it('returns empty string for empty diff', () => {
      const engine = new DiffEngine()
      const patch = engine.createPatch([])
      expect(patch).toBe('')
    })
  })
})

// ─── StructureComparator – Constructor ─────────────────────────────────

describe('StructureComparator', () => {
  describe('constructor', () => {
    it('creates with default config', () => {
      const comp = new StructureComparator()
      const a = makeStructure()
      const b = makeStructure()
      // Should not throw — default config applied
      const diff = comp.compare(a, b)
      expect(diff).toBeDefined()
    })

    it('merges partial config with defaults', () => {
      const comp = new StructureComparator({ ignoreExports: true })
      // If ignoreExports works, no export-changed should appear
      const a = makeStructure({ exports: [{ name: 'x', type: 'const', isDefault: false }] })
      const b = makeStructure({ exports: [] })
      const diff = comp.compare(a, b)
      expect(diff.modified.every((m) => m.type !== 'export-changed')).toBe(true)
    })

    it('respects ignoreImports config', () => {
      const comp = new StructureComparator({ ignoreImports: true })
      const a = makeStructure({ imports: [{ module: 'fs', names: ['readFile'], isTypeOnly: false }] })
      const b = makeStructure({ imports: [] })
      const diff = comp.compare(a, b)
      expect(diff.modified.every((m) => m.type !== 'import-changed')).toBe(true)
    })

    it('respects ignorePrivate config', () => {
      const comp = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({ functions: [makeFunction({ name: '_private' })] })
      const b = makeStructure({ functions: [] })
      const diff = comp.compare(a, b)
      expect(diff.modified.every((m) => m.name !== '_private')).toBe(true)
    })
  })

  // ─── StructureComparator – extractStructure ─────────────────────────────

  describe('extractStructure', () => {
    it('extracts basic file info', () => {
      const comp = new StructureComparator()
      const source = 'const x = 1;\nconst y = 2;\n'
      const struct = comp.extractStructure(source, 'test.ts')
      expect(struct.filePath).toBe('test.ts')
      expect(struct.loc).toBe(2)
    })

    it('extracts named functions', () => {
      const comp = new StructureComparator()
      const source = 'function greet(name: string): string { return "hi " + name; }'
      const struct = comp.extractStructure(source, 'fn.ts')
      expect(struct.functions.length).toBe(1)
      expect(struct.functions[0]!.name).toBe('greet')
      expect(struct.functions[0]!.isExported).toBe(false)
    })

    it('extracts exported functions', () => {
      const comp = new StructureComparator()
      const source = 'export function compute(x: number): number { return x * 2; }'
      const struct = comp.extractStructure(source, 'fn.ts')
      expect(struct.functions[0]!.isExported).toBe(true)
    })

    it('extracts async functions', () => {
      const comp = new StructureComparator()
      const source = 'async function load(): Promise<void> { await fetch("/api"); }'
      const struct = comp.extractStructure(source, 'fn.ts')
      expect(struct.functions[0]!.isAsync).toBe(true)
    })

    it('extracts classes', () => {
      const comp = new StructureComparator()
      const source = 'class Foo { constructor() {} bar() {} }'
      const struct = comp.extractStructure(source, 'cls.ts')
      expect(struct.classes.length).toBe(1)
      expect(struct.classes[0]!.name).toBe('Foo')
    })

    it('extracts abstract classes', () => {
      const comp = new StructureComparator()
      const source = 'abstract class Base { abstract method(): void; }'
      const struct = comp.extractStructure(source, 'cls.ts')
      expect(struct.classes[0]!.isAbstract).toBe(true)
    })

    it('extracts imports', () => {
      const comp = new StructureComparator()
      const source = "import { readFileSync } from 'fs';"
      const struct = comp.extractStructure(source, 'imp.ts')
      expect(struct.imports.length).toBe(1)
      expect(struct.imports[0]!.module).toBe('fs')
      expect(struct.imports[0]!.names).toContain('readFileSync')
    })

    it('detects import type keyword in source', () => {
      const comp = new StructureComparator()
      const source = "import type { Config } from './types';"
      const struct = comp.extractStructure(source, 'imp.ts')
      expect(struct.imports.length).toBe(1)
      expect(struct.imports[0]!.module).toBe('./types')
    })

    it('extracts exports', () => {
      const comp = new StructureComparator()
      const source = 'export function handler() {}'
      const struct = comp.extractStructure(source, 'exp.ts')
      expect(struct.exports.length).toBe(1)
      expect(struct.exports[0]!.name).toBe('handler')
      expect(struct.exports[0]!.type).toBe('function')
    })

    it('extracts default exports', () => {
      const comp = new StructureComparator()
      const source = 'export default class App {}'
      const struct = comp.extractStructure(source, 'exp.ts')
      expect(struct.exports[0]!.isDefault).toBe(true)
    })

    it('counts loc excluding blank lines', () => {
      const comp = new StructureComparator()
      const source = '\n\na\n\nb\n\n'
      const struct = comp.extractStructure(source, 'loc.ts')
      expect(struct.loc).toBe(2)
    })

    it('extracts arrow functions with block body', () => {
      const comp = new StructureComparator()
      const source = 'export const add = (a: number, b: number) => { return a + b; }'
      const struct = comp.extractStructure(source, 'arrow.ts')
      expect(struct.functions.length).toBe(1)
      expect(struct.functions[0]!.name).toBe('add')
      expect(struct.functions[0]!.isExported).toBe(true)
    })

    it('extracts namespace imports', () => {
      const comp = new StructureComparator()
      const source = "import * as path from 'path';"
      const struct = comp.extractStructure(source, 'ns.ts')
      expect(struct.imports[0]!.names).toEqual(['path'])
    })

    it('computes complexity from functions', () => {
      const comp = new StructureComparator()
      const source = 'function check(x: number): boolean { if (x > 0) { return true; } return false; }'
      const struct = comp.extractStructure(source, 'cplx.ts')
      expect(struct.complexity).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── StructureComparator – compare ──────────────────────────────────────

  describe('compare', () => {
    it('returns similarity 0 for different file paths', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ filePath: 'a.ts' })
      const b = makeStructure({ filePath: 'b.ts' })
      const diff = comp.compare(a, b)
      expect(diff.similarity).toBe(0)
      expect(diff.added).toHaveLength(1)
      expect(diff.removed).toHaveLength(1)
    })

    it('detects function additions', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [] })
      const b = makeStructure({ functions: [makeFunction({ name: 'newFn' })] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-added' && m.name === 'newFn')).toBe(true)
    })

    it('detects function removals', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'oldFn' })] })
      const b = makeStructure({ functions: [] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-removed' && m.name === 'oldFn')).toBe(true)
    })

    it('detects function changes', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'fn', params: 1 })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'fn', params: 3 })] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'function-changed' && m.name === 'fn')).toBe(true)
    })

    it('detects class additions', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [] })
      const b = makeStructure({ classes: [makeClass({ name: 'NewClass', methods: 2 })] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-added' && m.name === 'NewClass')).toBe(true)
    })

    it('detects class removals', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'OldClass' })] })
      const b = makeStructure({ classes: [] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-removed' && m.name === 'OldClass')).toBe(true)
    })

    it('detects class changes', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Svc', methods: 1 })] })
      const b = makeStructure({ classes: [makeClass({ name: 'Svc', methods: 5 })] })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'class-changed' && m.name === 'Svc')).toBe(true)
    })

    it('detects import changes', () => {
      const comp = new StructureComparator()
      const impA: ImportInfo[] = [{ module: 'fs', names: ['read'], isTypeOnly: false }]
      const impB: ImportInfo[] = [{ module: 'fs', names: ['read', 'write'], isTypeOnly: false }]
      const a = makeStructure({ imports: impA })
      const b = makeStructure({ imports: impB })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'import-changed')).toBe(true)
    })

    it('detects export changes', () => {
      const comp = new StructureComparator()
      const expA: ExportInfo[] = [{ name: 'foo', type: 'function', isDefault: false }]
      const expB: ExportInfo[] = []
      const a = makeStructure({ exports: expA })
      const b = makeStructure({ exports: expB })
      const diff = comp.compare(a, b)
      expect(diff.modified.some((m) => m.type === 'export-changed')).toBe(true)
    })

    it('skips import changes when ignoreImports is true', () => {
      const comp = new StructureComparator({ ignoreImports: true })
      const impA: ImportInfo[] = [{ module: 'fs', names: ['read'], isTypeOnly: false }]
      const impB: ImportInfo[] = []
      const a = makeStructure({ imports: impA })
      const b = makeStructure({ imports: impB })
      const diff = comp.compare(a, b)
      expect(diff.modified.every((m) => m.type !== 'import-changed')).toBe(true)
    })

    it('skips export changes when ignoreExports is true', () => {
      const comp = new StructureComparator({ ignoreExports: true })
      const expA: ExportInfo[] = [{ name: 'foo', type: 'function', isDefault: false }]
      const expB: ExportInfo[] = []
      const a = makeStructure({ exports: expA })
      const b = makeStructure({ exports: expB })
      const diff = comp.compare(a, b)
      expect(diff.modified.every((m) => m.type !== 'export-changed')).toBe(true)
    })

    it('returns empty modified for identical structures', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ functions: [makeFunction({ name: 'fn' })] })
      const diff = comp.compare(struct, struct)
      expect(diff.modified).toEqual([])
      expect(diff.similarity).toBe(1)
    })
  })

  // ─── StructureComparator – compareMany ──────────────────────────────────

  describe('compareMany', () => {
    it('returns correct statistics for matched files', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ filePath: 'a.ts' })
      const b = makeStructure({ filePath: 'a.ts', functions: [makeFunction({ name: 'fn' })] })
      const result = comp.compareMany([a], [b])
      expect(result.statistics.totalLeft).toBe(1)
      expect(result.statistics.totalRight).toBe(1)
      expect(result.statistics.commonCount).toBe(1)
    })

    it('detects added files', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const result = comp.compareMany(left, right)
      expect(result.statistics.addedCount).toBe(1)
      expect(result.diff.added.length).toBe(1)
    })

    it('detects removed files', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' })]
      const result = comp.compareMany(left, right)
      expect(result.statistics.removedCount).toBe(1)
      expect(result.diff.removed.length).toBe(1)
    })

    it('returns similarity index 1 for identical file sets', () => {
      const comp = new StructureComparator()
      const structs = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const result = comp.compareMany(structs, structs)
      expect(result.statistics.similarityIndex).toBe(1)
    })

    it('returns similarity index 0 for completely disjoint sets', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'b.ts' })]
      const result = comp.compareMany(left, right)
      expect(result.statistics.similarityIndex).toBe(0)
    })

    it('handles empty arrays', () => {
      const comp = new StructureComparator()
      const result = comp.compareMany([], [])
      expect(result.statistics.totalLeft).toBe(0)
      expect(result.statistics.totalRight).toBe(0)
      expect(result.statistics.similarityIndex).toBe(1)
      expect(result.diff.modified).toEqual([])
    })

    it('collects modifications from matched files', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts', functions: [makeFunction({ name: 'old' })] })]
      const right = [makeStructure({ filePath: 'a.ts', functions: [makeFunction({ name: 'new' })] })]
      const result = comp.compareMany(left, right)
      expect(result.diff.modified.length).toBeGreaterThan(0)
    })

    it('stores left and right references in result', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' })]
      const result = comp.compareMany(left, right)
      expect(result.left).toBe(left)
      expect(result.right).toBe(right)
    })
  })

  // ─── StructureComparator – findSimilar ──────────────────────────────────

  describe('findSimilar', () => {
    it('returns null when no candidate meets threshold', () => {
      const comp = new StructureComparator({ similarityThreshold: 0.9 })
      const a = makeStructure({ filePath: 'x.ts', functions: [makeFunction({ name: 'foo' })] })
      const candidates = [makeStructure({ filePath: 'y.ts', functions: [makeFunction({ name: 'bar' })] })]
      expect(comp.findSimilar(a, candidates)).toBeNull()
    })

    it('returns best matching candidate', () => {
      const comp = new StructureComparator({ similarityThreshold: 0.5 })
      const shared = makeFunction({ name: 'shared' })
      const a = makeStructure({ filePath: 'a.ts', functions: [shared, makeFunction({ name: 'extra' })] })
      const b = makeStructure({ filePath: 'b.ts', functions: [shared] })
      const result = comp.findSimilar(a, [b])
      expect(result).toBe(b)
    })

    it('returns null for empty candidates', () => {
      const comp = new StructureComparator()
      const a = makeStructure()
      expect(comp.findSimilar(a, [])).toBeNull()
    })

    it('picks the highest similarity candidate', () => {
      const comp = new StructureComparator({ similarityThreshold: 0.1 })
      const fn = makeFunction({ name: 'common' })
      const a = makeStructure({ functions: [fn] })
      const weak = makeStructure({ functions: [makeFunction({ name: 'other' })] })
      const strong = makeStructure({ functions: [fn] })
      const result = comp.findSimilar(a, [weak, strong])
      expect(result).toBe(strong)
    })
  })

  // ─── StructureComparator – calculateSimilarity ─────────────────────────

  describe('calculateSimilarity', () => {
    it('returns 1 for identical structures', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ functions: [makeFunction({ name: 'fn' })] })
      expect(comp.calculateSimilarity(struct, struct)).toBe(1)
    })

    it('returns 1 for two empty structures with no functions or classes', () => {
      const comp = new StructureComparator()
      const a = makeStructure()
      const b = makeStructure()
      expect(comp.calculateSimilarity(a, b)).toBe(1)
    })

    it('returns 0 for completely disjoint functions', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'a' })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'b' })] })
      expect(comp.calculateSimilarity(a, b)).toBe(0)
    })

    it('returns partial overlap for mixed functions', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'shared' }), makeFunction({ name: 'onlyA' })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'shared' }), makeFunction({ name: 'onlyB' })] })
      // union = {shared, onlyA, onlyB} = 3, intersection = {shared} = 1 => 1/3
      expect(comp.calculateSimilarity(a, b)).toBeCloseTo(1 / 3)
    })

    it('considers classes in similarity', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'A' })] })
      const b = makeStructure({ classes: [makeClass({ name: 'A' })] })
      expect(comp.calculateSimilarity(a, b)).toBe(1)
    })

    it('filters private functions when ignorePrivate is true', () => {
      const comp = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({ functions: [makeFunction({ name: '_priv' })] })
      const b = makeStructure({ functions: [] })
      expect(comp.calculateSimilarity(a, b)).toBe(1)
    })
  })

  // ─── StructureComparator – hasFunction ──────────────────────────────────

  describe('hasFunction', () => {
    it('returns true when function exists', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ functions: [makeFunction({ name: 'fn' })] })
      expect(comp.hasFunction(struct, 'fn')).toBe(true)
    })

    it('returns false when function does not exist', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ functions: [] })
      expect(comp.hasFunction(struct, 'fn')).toBe(false)
    })

    it('is case-sensitive', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ functions: [makeFunction({ name: 'Foo' })] })
      expect(comp.hasFunction(struct, 'foo')).toBe(false)
      expect(comp.hasFunction(struct, 'Foo')).toBe(true)
    })
  })

  // ─── StructureComparator – hasClass ─────────────────────────────────────

  describe('hasClass', () => {
    it('returns true when class exists', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ classes: [makeClass({ name: 'Svc' })] })
      expect(comp.hasClass(struct, 'Svc')).toBe(true)
    })

    it('returns false when class does not exist', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ classes: [] })
      expect(comp.hasClass(struct, 'Svc')).toBe(false)
    })

    it('is case-sensitive', () => {
      const comp = new StructureComparator()
      const struct = makeStructure({ classes: [makeClass({ name: 'MyClass' })] })
      expect(comp.hasClass(struct, 'myclass')).toBe(false)
      expect(comp.hasClass(struct, 'MyClass')).toBe(true)
    })
  })

  // ─── StructureComparator – getFunctionDiff ──────────────────────────────

  describe('getFunctionDiff', () => {
    it('detects added functions', () => {
      const comp = new StructureComparator()
      const a = makeStructure()
      const b = makeStructure({ functions: [makeFunction({ name: 'added' })] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.added).toHaveLength(1)
      expect(diff.added[0]!.name).toBe('added')
    })

    it('detects removed functions', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'removed' })] })
      const b = makeStructure()
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(1)
      expect(diff.removed[0]!.name).toBe('removed')
    })

    it('detects changed functions by params', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'fn', params: 1 })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'fn', params: 2 })] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed functions by returnType', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'fn', returnType: 'void' })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'fn', returnType: 'string' })] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed functions by isAsync', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'fn', isAsync: false })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'fn', isAsync: true })] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed functions by complexity', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'fn', complexity: 1 })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'fn', complexity: 5 })] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('returns no changes for identical functions', () => {
      const comp = new StructureComparator()
      const fn = makeFunction({ name: 'fn' })
      const a = makeStructure({ functions: [fn] })
      const b = makeStructure({ functions: [fn] })
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.added).toEqual([])
      expect(diff.removed).toEqual([])
      expect(diff.changed).toEqual([])
    })

    it('filters private functions when ignorePrivate is true', () => {
      const comp = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({ functions: [makeFunction({ name: '_private' })] })
      const b = makeStructure()
      const diff = comp.getFunctionDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })
  })

  // ─── StructureComparator – getClassDiff ─────────────────────────────────

  describe('getClassDiff', () => {
    it('detects added classes', () => {
      const comp = new StructureComparator()
      const a = makeStructure()
      const b = makeStructure({ classes: [makeClass({ name: 'Added' })] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.added).toHaveLength(1)
    })

    it('detects removed classes', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Removed' })] })
      const b = makeStructure()
      const diff = comp.getClassDiff(a, b)
      expect(diff.removed).toHaveLength(1)
    })

    it('detects changed classes by methods', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Svc', methods: 1 })] })
      const b = makeStructure({ classes: [makeClass({ name: 'Svc', methods: 3 })] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed classes by properties', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Svc', properties: 0 })] })
      const b = makeStructure({ classes: [makeClass({ name: 'Svc', properties: 5 })] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed classes by isAbstract', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Svc', isAbstract: false })] })
      const b = makeStructure({ classes: [makeClass({ name: 'Svc', isAbstract: true })] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('detects changed classes by interfaces', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ classes: [makeClass({ name: 'Svc', interfaces: ['IInit'] })] })
      const b = makeStructure({ classes: [makeClass({ name: 'Svc', interfaces: ['IInit', 'IDispose'] })] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.changed).toHaveLength(1)
    })

    it('returns no changes for identical classes', () => {
      const comp = new StructureComparator()
      const cls = makeClass({ name: 'Svc' })
      const a = makeStructure({ classes: [cls] })
      const b = makeStructure({ classes: [cls] })
      const diff = comp.getClassDiff(a, b)
      expect(diff.added).toEqual([])
      expect(diff.removed).toEqual([])
      expect(diff.changed).toEqual([])
    })

    it('filters private classes when ignorePrivate is true', () => {
      const comp = new StructureComparator({ ignorePrivate: true })
      const a = makeStructure({ classes: [makeClass({ name: 'PrivateHelper' })] })
      const b = makeStructure()
      const diff = comp.getClassDiff(a, b)
      expect(diff.removed).toHaveLength(0)
    })
  })

  // ─── StructureComparator – Edge Cases ───────────────────────────────────

  describe('edge cases', () => {
    it('compare handles structures with many modifications', () => {
      const comp = new StructureComparator()
      const a = makeStructure({
        functions: [makeFunction({ name: 'fn1' })],
        classes: [makeClass({ name: 'Cls1' })],
        imports: [{ module: 'fs', names: ['read'], isTypeOnly: false }],
        exports: [{ name: 'fn1', type: 'function', isDefault: false }],
      })
      const b = makeStructure({
        functions: [makeFunction({ name: 'fn2' })],
        classes: [makeClass({ name: 'Cls2' })],
        imports: [{ module: 'path', names: ['join'], isTypeOnly: false }],
        exports: [],
      })
      const diff = comp.compare(a, b)
      expect(diff.modified.length).toBeGreaterThanOrEqual(4)
    })

    it('compareMany computes correct similarityIndex for partial overlap', () => {
      const comp = new StructureComparator()
      const left = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'b.ts' })]
      const right = [makeStructure({ filePath: 'a.ts' }), makeStructure({ filePath: 'c.ts' })]
      const result = comp.compareMany(left, right)
      // commonCount = 1, total = 4, similarityIndex = 2/4 = 0.5
      expect(result.statistics.similarityIndex).toBe(0.5)
    })

    it('findSimilar returns null when all candidates below default threshold', () => {
      const comp = new StructureComparator()
      const a = makeStructure({ functions: [makeFunction({ name: 'unique' })] })
      const b = makeStructure({ functions: [makeFunction({ name: 'totally-different' })] })
      expect(comp.findSimilar(a, [b])).toBeNull()
    })

    it('extractStructure handles empty source', () => {
      const comp = new StructureComparator()
      const struct = comp.extractStructure('', 'empty.ts')
      expect(struct.filePath).toBe('empty.ts')
      expect(struct.functions).toEqual([])
      expect(struct.classes).toEqual([])
      expect(struct.imports).toEqual([])
      expect(struct.exports).toEqual([])
      expect(struct.loc).toBe(0)
      expect(struct.complexity).toBe(1)
    })

    it('reverseDiff round-trips a diff correctly', () => {
      const engine = new DiffEngine()
      const left = 'aaa\nbbb\nccc'
      const right = 'aaa\nxxx\nccc'
      const forward = engine.computeLineDiff(left, right)
      const reversed = engine.reverseDiff(forward)
      const restored = engine.applyPatch(right, reversed)
      expect(restored).toBe(left)
    })

    it('countChanges matches mergeDiffs result', () => {
      const engine = new DiffEngine()
      const a: LineDiff[] = [
        { type: 'delete', content: 'old', lineNumber: 1 },
        { type: 'equal', content: 'keep', lineNumber: 2 },
      ]
      const b: LineDiff[] = [
        { type: 'add', content: 'new', lineNumber: 1 },
        { type: 'equal', content: 'keep', lineNumber: 2 },
      ]
      const merged = engine.mergeDiffs(a, b)
      const counts = engine.countChanges(merged)
      expect(counts.deletions).toBe(1)
      expect(counts.additions).toBe(1)
    })
  })
})
