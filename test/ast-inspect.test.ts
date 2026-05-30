import { describe, it, expect } from 'vitest'
import {
  inspectSource,
  filterByType,
  inspectFiles,
  getFileExtension,
} from '../src/commands/ast-inspect-helpers.js'
import {
  formatInspectTable,
  formatInspectJson,
} from '../src/commands/ast-inspect-format-helpers.js'

describe('ast-inspect-helpers', () => {
  const sampleSource = `import { foo } from 'bar'
export function hello() {
  return 42
}
const x = 1
class MyClass {}
if (x) { console.log(x) }
`

  describe('inspectSource', () => {
    it('detects AST node types', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      expect(result.nodeTypes.length).toBeGreaterThan(0)
    })

    it('detects function declarations', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const funcType = result.nodeTypes.find((nt) => nt.type === 'FunctionDeclaration')
      expect(funcType).toBeDefined()
      expect(funcType!.count).toBe(1)
    })

    it('detects class declarations', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const classType = result.nodeTypes.find((nt) => nt.type === 'ClassDeclaration')
      expect(classType).toBeDefined()
    })

    it('detects import declarations', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const importType = result.nodeTypes.find((nt) => nt.type === 'ImportDeclaration')
      expect(importType).toBeDefined()
    })

    it('counts total nodes', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      expect(result.totalNodes).toBeGreaterThan(0)
    })

    it('counts total lines', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      expect(result.totalLines).toBe(sampleSource.split('\n').length)
    })

    it('sorts node types by count descending', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      for (let i = 1; i < result.nodeTypes.length; i++) {
        expect(result.nodeTypes[i - 1]!.count).toBeGreaterThanOrEqual(
          result.nodeTypes[i]!.count,
        )
      }
    })

    it('includes source preview', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      expect(result.sourcePreview.length).toBeGreaterThan(0)
    })

    it('handles empty source', () => {
      const result = inspectSource('', 'empty.ts')
      expect(result.totalNodes).toBe(1)
      expect(result.totalLines).toBe(1)
    })

    it('preserves file path', () => {
      const result = inspectSource('const x = 1', '/path/to/file.ts')
      expect(result.filePath).toBe('/path/to/file.ts')
    })

    it('detects call expressions', () => {
      const result = inspectSource('console.log("hello")\nfoo()', 'test.ts')
      const calls = result.nodeTypes.find((nt) => nt.type === 'CallExpression')
      expect(calls).toBeDefined()
      expect(calls!.count).toBeGreaterThanOrEqual(2)
    })

    it('detects if/for/while statements', () => {
      const source = 'if (true) {}\nfor (let i = 0; i < 10; i++) {}\nwhile (false) {}'
      const result = inspectSource(source, 'test.ts')
      expect(result.nodeTypes.find((nt) => nt.type === 'IfStatement')).toBeDefined()
      expect(result.nodeTypes.find((nt) => nt.type === 'ForStatement')).toBeDefined()
      expect(result.nodeTypes.find((nt) => nt.type === 'WhileStatement')).toBeDefined()
    })
  })

  describe('filterByType', () => {
    it('filters node types by substring', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const filtered = filterByType(result, 'Declaration')
      expect(filtered.nodeTypes.every((nt) => nt.type.includes('Declaration'))).toBe(true)
    })

    it('is case-insensitive', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const filtered = filterByType(result, 'function')
      expect(filtered.nodeTypes.some((nt) => nt.type === 'FunctionDeclaration')).toBe(true)
    })

    it('returns all types when filter is empty', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const filtered = filterByType(result, '')
      expect(filtered.nodeTypes.length).toBe(result.nodeTypes.length)
    })

    it('returns empty when nothing matches', () => {
      const result = inspectSource(sampleSource, 'test.ts')
      const filtered = filterByType(result, 'ZZZZNONEXISTENT')
      expect(filtered.nodeTypes).toHaveLength(0)
    })
  })

  describe('inspectFiles', () => {
    it('inspects multiple files', () => {
      const results = inspectFiles([
        { content: 'const x = 1', filePath: 'a.ts' },
        { content: 'function f() {}', filePath: 'b.ts' },
      ])
      expect(results).toHaveLength(2)
      expect(results[0]!.filePath).toBe('a.ts')
      expect(results[1]!.filePath).toBe('b.ts')
    })

    it('returns empty for empty input', () => {
      expect(inspectFiles([])).toEqual([])
    })
  })

  describe('getFileExtension', () => {
    it('extracts .ts extension', () => {
      expect(getFileExtension('file.ts')).toBe('.ts')
    })

    it('extracts .tsx extension', () => {
      expect(getFileExtension('component.tsx')).toBe('.tsx')
    })

    it('handles no extension', () => {
      expect(getFileExtension('Makefile')).toBe('')
    })

    it('is case-insensitive', () => {
      expect(getFileExtension('file.TS')).toBe('.ts')
    })
  })
})

describe('ast-inspect-format-helpers', () => {
  const sampleResult = inspectSource(
    `function hello() { return 1 }
const x = 2
console.log(x)`,
    'test.ts',
  )

  describe('formatInspectTable', () => {
    it('includes file path', () => {
      const table = formatInspectTable(sampleResult)
      expect(table).toContain('test.ts')
    })

    it('includes node and line counts', () => {
      const table = formatInspectTable(sampleResult)
      expect(table).toContain('Nodes:')
      expect(table).toContain('Lines:')
    })

    it('shows node type names', () => {
      const table = formatInspectTable(sampleResult)
      expect(table).toContain('FunctionDeclaration')
    })

    it('shows "No AST nodes" for empty results', () => {
      const emptyResult = { ...sampleResult, nodeTypes: [] }
      const table = formatInspectTable(emptyResult)
      expect(table).toContain('No AST nodes detected')
    })

    it('shows line numbers in verbose mode', () => {
      const verbose = formatInspectTable(sampleResult, true)
      expect(verbose).toContain('Lines')
    })

    it('shows first line in non-verbose mode', () => {
      const nonVerbose = formatInspectTable(sampleResult, false)
      expect(nonVerbose).toContain('First Line')
    })
  })

  describe('formatInspectJson', () => {
    it('produces valid JSON', () => {
      const json = formatInspectJson(sampleResult)
      expect(() => JSON.parse(json)).not.toThrow()
    })

    it('includes file metadata', () => {
      const parsed = JSON.parse(formatInspectJson(sampleResult))
      expect(parsed.filePath).toBe('test.ts')
      expect(parsed.totalNodes).toBeGreaterThan(0)
      expect(parsed.totalLines).toBeGreaterThan(0)
    })

    it('includes node types', () => {
      const parsed = JSON.parse(formatInspectJson(sampleResult))
      expect(Array.isArray(parsed.nodeTypes)).toBe(true)
      expect(parsed.nodeTypes.length).toBeGreaterThan(0)
      expect(parsed.nodeTypes[0].type).toBeDefined()
      expect(parsed.nodeTypes[0].count).toBeDefined()
    })
  })
})
