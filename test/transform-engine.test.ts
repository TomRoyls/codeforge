import { describe, it, expect } from 'vitest'
import { TransformEngine } from '../src/core/transform/transform-engine.js'
import type { Transform, TransformResult, TextChange } from '../src/core/transform/types.js'

function identityTransform(id: string = 'identity'): Transform {
  return {
    id,
    name: 'Identity',
    description: 'Does nothing',
    category: 'refactor',
    apply(source: string, _filePath: string): TransformResult {
      return { source, changes: [], applied: false, errors: [] }
    },
  }
}

function replaceTransform(from: string, to: string, id: string = 'replace'): Transform {
  return {
    id,
    name: `Replace ${from} with ${to}`,
    description: 'Simple string replacement',
    category: 'refactor',
    apply(source: string, _filePath: string): TransformResult {
      if (!source.includes(from)) {
        return { source, changes: [], applied: false, errors: [] }
      }
      const newSource = source.replaceAll(from, to)
      const change: TextChange = {
        startLine: 1,
        endLine: source.split('\n').length,
        original: from,
        replacement: to,
        description: `Replace ${from} with ${to}`,
      }
      return { source: newSource, changes: [change], applied: true, errors: [] }
    },
  }
}

function errorTransform(): Transform {
  return {
    id: 'error',
    name: 'Error Transform',
    description: 'Always throws',
    category: 'safety',
    apply() {
      throw new Error('Transform failed')
    },
  }
}

describe('TransformEngine', () => {
  describe('applyTransform', () => {
    it('applies a transform that modifies source', () => {
      const engine = new TransformEngine()
      const result = engine.applyTransform('const x = 1', 'test.ts', replaceTransform('1', '2'))
      expect(result.applied).toBe(true)
      expect(result.source).toBe('const x = 2')
    })

    it('returns applied=false for no-change transform', () => {
      const engine = new TransformEngine()
      const result = engine.applyTransform('const x = 1', 'test.ts', identityTransform())
      expect(result.applied).toBe(false)
      expect(result.source).toBe('const x = 1')
    })

    it('returns error when transform throws', () => {
      const engine = new TransformEngine()
      const result = engine.applyTransform('source', 'test.ts', errorTransform())
      expect(result.applied).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Transform failed')
      expect(result.source).toBe('source')
    })

    it('rejects files exceeding maxFileSize', () => {
      const engine = new TransformEngine({ maxFileSize: 10 })
      const result = engine.applyTransform('a'.repeat(20), 'test.ts', identityTransform())
      expect(result.applied).toBe(false)
      expect(result.errors[0]).toContain('max size')
    })

    it('preserves source in dryRun mode even if transform applies', () => {
      const engine = new TransformEngine({ dryRun: true })
      const result = engine.applyTransform('const x = 1', 'test.ts', replaceTransform('1', '2'))
      expect(result.applied).toBe(true)
      expect(result.source).toBe('const x = 1')
    })
  })

  describe('applyTransforms', () => {
    it('applies multiple transforms sequentially', () => {
      const engine = new TransformEngine()
      const transforms = [
        replaceTransform('1', '2'),
        replaceTransform('2', '3'),
      ]
      const results = engine.applyTransforms('const x = 1', 'test.ts', transforms)
      expect(results).toHaveLength(2)
      expect(results[0]!.applied).toBe(true)
      expect(results[1]!.applied).toBe(true)
      expect(results[1]!.source).toBe('const x = 3')
    })

    it('continues even if one transform does not apply', () => {
      const engine = new TransformEngine()
      const transforms = [
        replaceTransform('missing', 'x'),
        replaceTransform('1', '2'),
      ]
      const results = engine.applyTransforms('const x = 1', 'test.ts', transforms)
      expect(results[0]!.applied).toBe(false)
      expect(results[1]!.applied).toBe(true)
    })
  })

  describe('applyRecipe', () => {
    it('applies transforms from a recipe using registry', () => {
      const engine = new TransformEngine()
      const registry = new Map<string, Transform>()
      const t1 = replaceTransform('old', 'new', 't1')
      registry.set('t1', t1)

      const result = engine.applyRecipe('use old api', 'test.ts', {
        id: 'recipe1',
        name: 'Test Recipe',
        description: 'Test',
        transforms: ['t1'],
        filePatterns: ['**/*.ts'],
      }, registry)

      expect(result).toHaveLength(1)
      expect(result[0]!.source).toBe('use new api')
    })

    it('skips missing transforms in registry', () => {
      const engine = new TransformEngine()
      const registry = new Map<string, Transform>()

      const result = engine.applyRecipe('source', 'test.ts', {
        id: 'r1',
        name: 'R',
        description: '',
        transforms: ['nonexistent'],
        filePatterns: [],
      }, registry)

      expect(result).toHaveLength(0)
    })
  })

  describe('createDiff', () => {
    it('returns empty string for identical strings', () => {
      const engine = new TransformEngine()
      expect(engine.createDiff('hello\nworld', 'hello\nworld')).toBe('')
    })

    it('generates diff for modified lines', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('hello\nworld', 'hello\nearth')
      expect(diff).toContain('--- original')
      expect(diff).toContain('+++ modified')
      expect(diff).toContain('-world')
      expect(diff).toContain('+earth')
    })

    it('generates diff for added lines', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('line1', 'line1\nline2')
      expect(diff).toContain('+line2')
    })

    it('generates diff for removed lines', () => {
      const engine = new TransformEngine()
      const diff = engine.createDiff('line1\nline2', 'line1')
      expect(diff).toContain('-line2')
    })
  })

  describe('applyTextChanges', () => {
    it('applies a single text change', () => {
      const engine = new TransformEngine()
      const source = 'line1\nline2\nline3'
      const changes: TextChange[] = [{
        startLine: 2,
        endLine: 2,
        original: 'line2',
        replacement: 'replaced',
        description: 'test',
      }]
      expect(engine.applyTextChanges(source, changes)).toBe('line1\nreplaced\nline3')
    })

    it('applies multiple non-overlapping changes in reverse order', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 1, original: 'a', replacement: 'A', description: '' },
        { startLine: 3, endLine: 3, original: 'c', replacement: 'C', description: '' },
      ]
      expect(engine.applyTextChanges(source, changes)).toBe('A\nb\nC\nd')
    })

    it('handles multi-line replacement', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc\nd'
      const changes: TextChange[] = [{
        startLine: 2,
        endLine: 3,
        original: 'b\nc',
        replacement: 'X',
        description: '',
      }]
      expect(engine.applyTextChanges(source, changes)).toBe('a\nX\nd')
    })
  })

  describe('validateChanges', () => {
    it('validates correct changes', () => {
      const engine = new TransformEngine()
      const source = 'a\nb\nc'
      const changes: TextChange[] = [
        { startLine: 1, endLine: 1, original: 'a', replacement: 'A', description: '' },
        { startLine: 3, endLine: 3, original: 'c', replacement: 'C', description: '' },
      ]
      expect(engine.validateChanges(source, changes)).toBe(true)
    })

    it('rejects startLine < 1', () => {
      const engine = new TransformEngine()
      const changes: TextChange[] = [{
        startLine: 0, endLine: 1, original: '', replacement: '', description: '',
      }]
      expect(engine.validateChanges('source', changes)).toBe(false)
    })

    it('rejects endLine < startLine', () => {
      const engine = new TransformEngine()
      const changes: TextChange[] = [{
        startLine: 3, endLine: 1, original: '', replacement: '', description: '',
      }]
      expect(engine.validateChanges('source', changes)).toBe(false)
    })

    it('rejects overlapping changes', () => {
      const engine = new TransformEngine()
      const changes: TextChange[] = [
        { startLine: 1, endLine: 3, original: '', replacement: '', description: '' },
        { startLine: 2, endLine: 4, original: '', replacement: '', description: '' },
      ]
      expect(engine.validateChanges('a\nb\nc\nd', changes)).toBe(false)
    })

    it('rejects startLine beyond file length', () => {
      const engine = new TransformEngine()
      const changes: TextChange[] = [{
        startLine: 100, endLine: 100, original: '', replacement: '', description: '',
      }]
      expect(engine.validateChanges('one line', changes)).toBe(false)
    })
  })

  describe('generateReport', () => {
    it('generates correct summary', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>()
      results.set('file1.ts', [
        { source: 'a', changes: [{ startLine: 1, endLine: 1, original: 'x', replacement: 'y', description: '' }], applied: true, errors: [] },
      ])
      results.set('file2.ts', [
        { source: 'b', changes: [], applied: false, errors: [] },
        { source: 'b', changes: [{ startLine: 1, endLine: 1, original: 'a', replacement: 'b', description: '' }], applied: true, errors: [] },
      ])

      const report = engine.generateReport(results)
      expect(report.transformsApplied).toBe(2)
      expect(report.filesModified).toBe(2)
      expect(report.totalChanges).toBe(2)
    })

    it('handles empty results', () => {
      const engine = new TransformEngine()
      const results = new Map<string, TransformResult[]>()
      const report = engine.generateReport(results)
      expect(report.transformsApplied).toBe(0)
      expect(report.filesModified).toBe(0)
      expect(report.totalChanges).toBe(0)
    })
  })
})
