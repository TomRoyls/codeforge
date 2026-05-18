import { describe, it, expect } from 'vitest'
import { DecoratorExtractor, DecoratorAnalyzer, DecoratorParser } from '../src/core/decorator-parser/index.js'

// ─── DecoratorExtractor ───

describe('DecoratorExtractor', () => {
  const extractor = new DecoratorExtractor()

  describe('extract', () => {
    it('should extract a simple decorator', () => {
      const source = '@Component()\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(1)
      expect(decorators[0]!.name).toBe('Component')
    })

    it('should extract decorator without arguments', () => {
      const source = '@Log\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(1)
      expect(decorators[0]!.name).toBe('Log')
      expect(decorators[0]!.isFactory).toBe(false)
    })

    it('should extract factory decorators', () => {
      const source = "@Injectable({ providedIn: 'root' })\nclass Service {}"
      const decorators = extractor.extract(source)
      expect(decorators[0]!.isFactory).toBe(true)
    })

    it('should extract multiple decorators', () => {
      const source = '@Log\n@Deprecated\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(2)
    })

    it('should skip decorators inside strings', () => {
      const source = 'const str = "@Fake"\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(0)
    })

    it('should skip decorators inside comments', () => {
      const source = '// @Fake\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(0)
    })

    it('should skip decorators inside block comments', () => {
      const source = '/* @Fake */\nclass MyClass {}'
      const decorators = extractor.extract(source)
      expect(decorators.length).toBe(0)
    })
  })

  describe('parseArguments', () => {
    it('should parse string arguments', () => {
      const args = extractor.parseArguments('("hello")')
      expect(args.length).toBe(1)
      expect(args[0]!.kind).toBe('string')
      expect(args[0]!.value).toBe('hello')
    })

    it('should parse number arguments', () => {
      const args = extractor.parseArguments('(42)')
      expect(args[0]!.kind).toBe('number')
      expect(args[0]!.value).toBe(42)
    })

    it('should parse boolean arguments', () => {
      const args = extractor.parseArguments('(true, false)')
      expect(args[0]!.kind).toBe('boolean')
      expect(args[0]!.value).toBe(true)
      expect(args[1]!.kind).toBe('boolean')
      expect(args[1]!.value).toBe(false)
    })

    it('should parse identifier arguments', () => {
      const args = extractor.parseArguments('(SomeVar)')
      expect(args[0]!.kind).toBe('identifier')
      expect(args[0]!.value).toBe('SomeVar')
    })

    it('should parse object arguments', () => {
      const args = extractor.parseArguments('({ key: "value" })')
      expect(args[0]!.kind).toBe('object')
      expect((args[0]!.value as Record<string, unknown>).key).toBe('value')
    })

    it('should parse array arguments', () => {
      const args = extractor.parseArguments('([1, 2, 3])')
      expect(args[0]!.kind).toBe('array')
      expect(args[0]!.value).toEqual([1, 2, 3])
    })

    it('should return empty for empty parens', () => {
      expect(extractor.parseArguments('()')).toEqual([])
    })
  })

  describe('isFactoryDecorator', () => {
    it('should detect factory decorators', () => {
      expect(extractor.isFactoryDecorator('@Component()')).toBe(true)
      expect(extractor.isFactoryDecorator('@Log')).toBe(false)
    })
  })

  describe('findDecoratorBlock', () => {
    it('should find balanced parentheses block', () => {
      const result = extractor.findDecoratorBlock('({ a: 1 })', 0)
      expect(result.content).toBe('({ a: 1 })')
    })

    it('should handle nested parentheses', () => {
      const result = extractor.findDecoratorBlock('({ a: fn(1) })', 0)
      expect(result.content).toBe('({ a: fn(1) })')
    })
  })

  describe('extractFromClass', () => {
    it('should extract decorators for a specific class', () => {
      const source = '@Component()\nclass MyService {}\n\n@Directive()\nclass MyDir {}'
      const decorators = extractor.extractFromClass(source, 'MyService')
      expect(decorators.length).toBe(1)
      expect(decorators[0]!.name).toBe('Component')
    })
  })
})

// ─── DecoratorAnalyzer ───

describe('DecoratorAnalyzer', () => {
  const analyzer = new DecoratorAnalyzer()

  describe('analyze', () => {
    it('should produce a report from decorator info', () => {
      const decorators = [
        { name: 'Component', args: [], target: 'class' as const, isFactory: true, source: '@Component()', line: 1, column: 1 },
        { name: 'Log', args: [], target: 'method' as const, isFactory: false, source: '@Log', line: 3, column: 3 },
      ]
      const report = analyzer.analyze(decorators, '')
      expect(report.totalDecorators).toBe(2)
      expect(report.uniqueDecorators).toBe(2)
      expect(report.byTarget.class).toBe(1)
      expect(report.byTarget.method).toBe(1)
    })

    it('should count duplicate decorator names', () => {
      const decorators = [
        { name: 'Log', args: [], target: 'method' as const, isFactory: false, source: '@Log', line: 1, column: 1 },
        { name: 'Log', args: [], target: 'method' as const, isFactory: false, source: '@Log', line: 5, column: 1 },
      ]
      const report = analyzer.analyze(decorators, '')
      expect(report.uniqueDecorators).toBe(1)
      expect(report.byName['Log']).toBe(2)
    })
  })

  describe('getByTarget', () => {
    it('should filter decorators by target', () => {
      const decorators = [
        { name: 'A', args: [], target: 'class' as const, isFactory: false, source: '@A', line: 1, column: 1 },
        { name: 'B', args: [], target: 'method' as const, isFactory: false, source: '@B', line: 2, column: 1 },
      ]
      expect(analyzer.getByTarget(decorators, 'class').length).toBe(1)
      expect(analyzer.getByTarget(decorators, 'method').length).toBe(1)
    })
  })

  describe('getByName', () => {
    it('should filter decorators by name', () => {
      const decorators = [
        { name: 'A', args: [], target: 'class' as const, isFactory: false, source: '@A', line: 1, column: 1 },
        { name: 'B', args: [], target: 'class' as const, isFactory: false, source: '@B', line: 2, column: 1 },
      ]
      expect(analyzer.getByName(decorators, 'A').length).toBe(1)
    })
  })

  describe('getDeprecated', () => {
    it('should find deprecated decorators', () => {
      const decorators = [
        { name: 'Deprecated', args: [], target: 'method' as const, isFactory: false, source: '@Deprecated', line: 1, column: 1 },
        { name: 'Log', args: [], target: 'method' as const, isFactory: false, source: '@Log', line: 2, column: 1 },
      ]
      expect(analyzer.getDeprecated(decorators).length).toBe(1)
    })
  })

  describe('getExperimental', () => {
    it('should find experimental decorators', () => {
      const decorators = [
        { name: 'Experimental', args: [], target: 'method' as const, isFactory: false, source: '@Experimental', line: 1, column: 1 },
      ]
      expect(analyzer.getExperimental(decorators).length).toBe(1)
    })
  })

  describe('findUnused', () => {
    it('should find decorators not in used set', () => {
      const decorators = [
        { name: 'A', args: [], target: 'class' as const, isFactory: false, source: '@A', line: 1, column: 1 },
        { name: 'B', args: [], target: 'class' as const, isFactory: false, source: '@B', line: 2, column: 1 },
      ]
      const unused = analyzer.findUnused(decorators, new Set(['A']))
      expect(unused.length).toBe(1)
      expect(unused[0]!.name).toBe('B')
    })
  })
})

// ─── DecoratorParser ───

describe('DecoratorParser', () => {
  const parser = new DecoratorParser()

  describe('parse', () => {
    it('should parse source and return a report', () => {
      const report = parser.parse('@Component()\nclass MyClass {}')
      expect(report.totalDecorators).toBe(1)
      expect(report.source).toContain('Component')
    })
  })

  describe('getDecoratorNames', () => {
    it('should return unique decorator names', () => {
      const names = parser.getDecoratorNames('@Log\n@Log\nclass A {}')
      expect(names).toEqual(['Log'])
    })
  })

  describe('hasDecorator', () => {
    it('should check if a decorator exists', () => {
      expect(parser.hasDecorator('@Component()\nclass A {}', 'Component')).toBe(true)
      expect(parser.hasDecorator('class A {}', 'Component')).toBe(false)
    })
  })

  describe('getDecoratorCount', () => {
    it('should count decorators in source', () => {
      expect(parser.getDecoratorCount('@A\n@B\nclass A {}')).toBe(2)
      expect(parser.getDecoratorCount('class A {}')).toBe(0)
    })
  })

  describe('validate', () => {
    it('should return empty errors for valid decorators', () => {
      const errors = parser.validate('@Component()\nclass A {}')
      expect(errors).toEqual([])
    })

    it('should detect invalid decorator syntax', () => {
      const errors = parser.validate('@123\nclass A {}')
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
