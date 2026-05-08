import { describe, it, expect } from 'vitest'
import { DecoratorExtractor } from '../../src/core/decorator-parser/decorator-extractor.js'
import { DecoratorAnalyzer } from '../../src/core/decorator-parser/decorator-analyzer.js'
import { DecoratorParser } from '../../src/core/decorator-parser/decorator-parser.js'
import type { DecoratorInfo } from '../../src/core/decorator-parser/types.js'

describe('DecoratorExtractor', () => {
  const extractor = new DecoratorExtractor()

  describe('extract', () => {
    it('should extract a simple class decorator', () => {
      const source = '@Component\nclass MyComponent {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Component')
      expect(result[0]!.target).toBe('class')
      expect(result[0]!.isFactory).toBe(false)
    })

    it('should extract a factory class decorator with string arg', () => {
      const source = '@Component("my-component")\nclass MyComponent {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Component')
      expect(result[0]!.isFactory).toBe(true)
      expect(result[0]!.args).toHaveLength(1)
      expect(result[0]!.args[0]).toEqual({ kind: 'string', value: 'my-component' })
    })

    it('should extract a factory decorator with number arg', () => {
      const source = '@Version(42)\nclass App {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.args[0]).toEqual({ kind: 'number', value: 42 })
    })

    it('should extract a factory decorator with boolean arg', () => {
      const source = '@Flag(true)\nclass App {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.args[0]).toEqual({ kind: 'boolean', value: true })
    })

    it('should extract a factory decorator with identifier arg', () => {
      const source = '@Inject(Logger)\nclass Service {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.args[0]).toEqual({ kind: 'identifier', value: 'Logger' })
    })

    it('should extract a method decorator', () => {
      const source = 'class MyService {\n  @Log\n  handleClick() {}\n}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Log')
      expect(result[0]!.target).toBe('method')
    })

    it('should extract a property decorator', () => {
      const source = 'class MyComp {\n  @Input\n  value = ""\n}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Input')
      expect(result[0]!.target).toBe('property')
    })

    it('should extract an accessor decorator', () => {
      const source = 'class MyComp {\n  @Computed\n  get fullName() { return "" }\n}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Computed')
      expect(result[0]!.target).toBe('accessor')
    })

    it('should extract multiple decorators on a class', () => {
      const source = '@Component\n@Route("/home")\nclass HomePage {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(2)
      expect(result[0]!.name).toBe('Component')
      expect(result[1]!.name).toBe('Route')
      expect(result[1]!.args[0]).toEqual({ kind: 'string', value: '/home' })
    })

    it('should extract decorators across multiple targets', () => {
      const source = `@Component
class MyComp {
  @Input
  name = ""

  @Log
  doWork() {}
}`
      const result = extractor.extract(source)
      expect(result).toHaveLength(3)
      expect(result.filter((d) => d.target === 'class')).toHaveLength(1)
      expect(result.filter((d) => d.target === 'property')).toHaveLength(1)
      expect(result.filter((d) => d.target === 'method')).toHaveLength(1)
    })

    it('should return empty array for source with no decorators', () => {
      const source = 'class Plain {}'
      expect(extractor.extract(source)).toEqual([])
    })

    it('should return empty array for empty source', () => {
      expect(extractor.extract('')).toEqual([])
    })

    it('should correctly report line numbers', () => {
      const source = 'class A {}\n\n@Component\nclass B {}'
      const result = extractor.extract(source)
      expect(result[0]!.line).toBe(3)
    })

    it('should correctly report column numbers', () => {
      const source = '@Component\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.column).toBe(1)
    })

    it('should preserve decorator source text', () => {
      const source = '@Component("test")\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.source).toBe('@Component("test")')
    })

    it('should handle decorator with multiple args', () => {
      const source = '@Route("/path", true)\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.args).toHaveLength(2)
      expect(result[0]!.args[0]).toEqual({ kind: 'string', value: '/path' })
      expect(result[0]!.args[1]).toEqual({ kind: 'boolean', value: true })
    })

    it('should handle decorator with negative number', () => {
      const source = '@Offset(-5)\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.args[0]).toEqual({ kind: 'number', value: -5 })
    })

    it('should handle decorator with float number', () => {
      const source = '@Ratio(3.14)\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.args[0]).toEqual({ kind: 'number', value: 3.14 })
    })

    it('should handle decorator with empty parentheses', () => {
      const source = '@Component()\nclass A {}'
      const result = extractor.extract(source)
      expect(result[0]!.isFactory).toBe(true)
      expect(result[0]!.args).toHaveLength(0)
    })

    it('should not confuse @ in email-like strings as decorators', () => {
      const source = 'const email = "user@domain"\nclass A {}'
      const result = extractor.extract(source)
      expect(result).toHaveLength(0)
    })
  })

  describe('extractFromClass', () => {
    it('should extract decorators for a specific class', () => {
      const source = `@Component
class Target {}

@Service
class Other {}`
      const result = extractor.extractFromClass(source, 'Target')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Component')
    })

    it('should return empty for non-existent class', () => {
      const source = '@Component\nclass A {}'
      expect(extractor.extractFromClass(source, 'NotFound')).toEqual([])
    })

    it('should return empty for empty source', () => {
      expect(extractor.extractFromClass('', 'Foo')).toEqual([])
    })

    it('should handle class with multiple decorators', () => {
      const source = `@Component
@Injectable()
class MyService {}`
      const result = extractor.extractFromClass(source, 'MyService')
      expect(result).toHaveLength(2)
    })
  })

  describe('extractFromMethod', () => {
    it('should extract decorators for a specific method', () => {
      const source = `class S {
  @Log
  target() {}

  @Cache
  other() {}
}`
      const result = extractor.extractFromMethod(source, 'target')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Log')
    })

    it('should return empty for non-existent method', () => {
      const source = 'class S { work() {} }'
      expect(extractor.extractFromMethod(source, 'nope')).toEqual([])
    })

    it('should return empty for empty source', () => {
      expect(extractor.extractFromMethod('', 'foo')).toEqual([])
    })
  })

  describe('extractFromProperty', () => {
    it('should extract decorators for a specific property', () => {
      const source = `class C {
  @Input
  target = ""

  @Output
  other = null
}`
      const result = extractor.extractFromProperty(source, 'target')
      expect(result).toHaveLength(1)
      expect(result[0]!.name).toBe('Input')
    })

    it('should return empty for non-existent property', () => {
      const source = 'class C { x = 1 }'
      expect(extractor.extractFromProperty(source, 'nope')).toEqual([])
    })

    it('should return empty for empty source', () => {
      expect(extractor.extractFromProperty('', 'foo')).toEqual([])
    })
  })

  describe('parseArguments', () => {
    it('should parse string argument', () => {
      const result = extractor.parseArguments('("hello")')
      expect(result).toEqual([{ kind: 'string', value: 'hello' }])
    })

    it('should parse number argument', () => {
      const result = extractor.parseArguments('(42)')
      expect(result).toEqual([{ kind: 'number', value: 42 }])
    })

    it('should parse boolean argument', () => {
      const result = extractor.parseArguments('(true)')
      expect(result).toEqual([{ kind: 'boolean', value: true }])
    })

    it('should parse identifier argument', () => {
      const result = extractor.parseArguments('(MyClass)')
      expect(result).toEqual([{ kind: 'identifier', value: 'MyClass' }])
    })

    it('should parse object argument', () => {
      const result = extractor.parseArguments('({ name: "test" })')
      expect(result).toHaveLength(1)
      expect(result[0]!.kind).toBe('object')
      expect((result[0]!.value as Record<string, unknown>)['name']).toBe('test')
    })

    it('should parse array argument', () => {
      const result = extractor.parseArguments('([1, 2, 3])')
      expect(result).toHaveLength(1)
      expect(result[0]!.kind).toBe('array')
      expect(result[0]!.value).toEqual([1, 2, 3])
    })

    it('should parse empty parentheses', () => {
      expect(extractor.parseArguments('()')).toEqual([])
    })

    it('should parse multiple mixed arguments', () => {
      const result = extractor.parseArguments('("path", true, 42)')
      expect(result).toEqual([
        { kind: 'string', value: 'path' },
        { kind: 'boolean', value: true },
        { kind: 'number', value: 42 },
      ])
    })

    it('should parse single-quoted string', () => {
      const result = extractor.parseArguments("('hello')")
      expect(result).toEqual([{ kind: 'string', value: 'hello' }])
    })

    it('should parse template literal string', () => {
      const result = extractor.parseArguments('(`hello`)')
      expect(result).toEqual([{ kind: 'string', value: 'hello' }])
    })
  })

  describe('isFactoryDecorator', () => {
    it('should return true for factory decorator', () => {
      expect(extractor.isFactoryDecorator('@Component("x")')).toBe(true)
    })

    it('should return true for factory with empty parens', () => {
      expect(extractor.isFactoryDecorator('@Component()')).toBe(true)
    })

    it('should return false for non-factory decorator', () => {
      expect(extractor.isFactoryDecorator('@Component')).toBe(false)
    })

    it('should return false for plain text', () => {
      expect(extractor.isFactoryDecorator('class A {}')).toBe(false)
    })
  })

  describe('findDecoratorBlock', () => {
    it('should find block with balanced parens', () => {
      const source = '@Route("/api/users")'
      const result = extractor.findDecoratorBlock(source, source.indexOf('('))
      expect(result.content).toBe('("/api/users")')
      expect(result.endIndex).toBe(source.length)
    })

    it('should handle nested parentheses', () => {
      const source = '@Route(fn("a"))'
      const result = extractor.findDecoratorBlock(source, source.indexOf('('))
      expect(result.content).toBe('(fn("a"))')
    })

    it('should handle unclosed parens gracefully', () => {
      const source = '@Route("unclosed'
      const result = extractor.findDecoratorBlock(source, source.indexOf('('))
      expect(result.content.length).toBeGreaterThan(0)
    })

    it('should handle startIndex at end of string', () => {
      const source = '@Component'
      const result = extractor.findDecoratorBlock(source, source.length)
      expect(result.content).toBe('')
    })
  })
})

describe('DecoratorAnalyzer', () => {
  const analyzer = new DecoratorAnalyzer()

  describe('analyze', () => {
    it('should produce report with correct totals', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
        { name: 'Input', args: [], target: 'property', isFactory: false, source: '@Input', line: 3, column: 3 },
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 5, column: 1 },
      ]
      const report = analyzer.analyze(decorators)
      expect(report.totalDecorators).toBe(3)
      expect(report.uniqueDecorators).toBe(2)
    })

    it('should count by target correctly', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'A', args: [], target: 'class', isFactory: false, source: '@A', line: 1, column: 1 },
        { name: 'B', args: [], target: 'method', isFactory: false, source: '@B', line: 2, column: 1 },
        { name: 'C', args: [], target: 'class', isFactory: false, source: '@C', line: 3, column: 1 },
      ]
      const report = analyzer.analyze(decorators)
      expect(report.byTarget['class']).toBe(2)
      expect(report.byTarget['method']).toBe(1)
      expect(report.byTarget['property']).toBe(0)
    })

    it('should count by name correctly', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 5, column: 1 },
        { name: 'Injectable', args: [], target: 'class', isFactory: false, source: '@Injectable', line: 8, column: 1 },
      ]
      const report = analyzer.analyze(decorators)
      expect(report.byName['Component']).toBe(2)
      expect(report.byName['Injectable']).toBe(1)
    })

    it('should handle empty decorator array', () => {
      const report = analyzer.analyze([])
      expect(report.totalDecorators).toBe(0)
      expect(report.uniqueDecorators).toBe(0)
      expect(report.usages).toEqual([])
    })

    it('should preserve source in report', () => {
      const report = analyzer.analyze([], 'my-source')
      expect(report.source).toBe('my-source')
    })
  })

  describe('getUsages', () => {
    it('should aggregate usages by name', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 5, column: 1 },
      ]
      const usages = analyzer.getUsages(decorators)
      expect(usages).toHaveLength(1)
      expect(usages[0]!.name).toBe('Component')
      expect(usages[0]!.frequency).toBe(2)
    })

    it('should track multiple targets per name', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Log', args: [], target: 'class', isFactory: false, source: '@Log', line: 1, column: 1 },
        { name: 'Log', args: [], target: 'method', isFactory: false, source: '@Log', line: 3, column: 1 },
      ]
      const usages = analyzer.getUsages(decorators)
      expect(usages[0]!.targets).toContain('class')
      expect(usages[0]!.targets).toContain('method')
    })

    it('should track hasArguments', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'A', args: [{ kind: 'string', value: 'x' }], target: 'class', isFactory: true, source: '@A("x")', line: 1, column: 1 },
        { name: 'B', args: [], target: 'class', isFactory: false, source: '@B', line: 2, column: 1 },
      ]
      const usages = analyzer.getUsages(decorators)
      const a = usages.find((u) => u.name === 'A')!
      const b = usages.find((u) => u.name === 'B')!
      expect(a.hasArguments).toBe(true)
      expect(b.hasArguments).toBe(false)
    })

    it('should track arg patterns', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Route', args: [{ kind: 'string', value: '/path' }, { kind: 'boolean', value: true }], target: 'class', isFactory: true, source: '@Route("/path", true)', line: 1, column: 1 },
      ]
      const usages = analyzer.getUsages(decorators)
      expect(usages[0]!.argPatterns).toEqual([['string', 'boolean']])
    })

    it('should return empty for empty input', () => {
      expect(analyzer.getUsages([])).toEqual([])
    })
  })

  describe('getByTarget', () => {
    const decorators: DecoratorInfo[] = [
      { name: 'A', args: [], target: 'class', isFactory: false, source: '@A', line: 1, column: 1 },
      { name: 'B', args: [], target: 'method', isFactory: false, source: '@B', line: 2, column: 1 },
      { name: 'C', args: [], target: 'class', isFactory: false, source: '@C', line: 3, column: 1 },
    ]

    it('should filter by class target', () => {
      expect(analyzer.getByTarget(decorators, 'class')).toHaveLength(2)
    })

    it('should filter by method target', () => {
      expect(analyzer.getByTarget(decorators, 'method')).toHaveLength(1)
    })

    it('should return empty for target with no matches', () => {
      expect(analyzer.getByTarget(decorators, 'parameter')).toHaveLength(0)
    })

    it('should return empty for empty input', () => {
      expect(analyzer.getByTarget([], 'class')).toHaveLength(0)
    })
  })

  describe('getByName', () => {
    const decorators: DecoratorInfo[] = [
      { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
      { name: 'Input', args: [], target: 'property', isFactory: false, source: '@Input', line: 3, column: 3 },
      { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 5, column: 1 },
    ]

    it('should filter by name', () => {
      expect(analyzer.getByName(decorators, 'Component')).toHaveLength(2)
    })

    it('should return empty for non-matching name', () => {
      expect(analyzer.getByName(decorators, 'NotFound')).toHaveLength(0)
    })

    it('should return empty for empty input', () => {
      expect(analyzer.getByName([], 'Component')).toHaveLength(0)
    })
  })

  describe('getDeprecated', () => {
    it('should find deprecated decorators', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'deprecated', args: [], target: 'method', isFactory: false, source: '@deprecated', line: 1, column: 1 },
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 2, column: 1 },
      ]
      expect(analyzer.getDeprecated(decorators)).toHaveLength(1)
      expect(analyzer.getDeprecated(decorators)[0]!.name).toBe('deprecated')
    })

    it('should find Deprecated (case insensitive)', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Deprecated', args: [], target: 'method', isFactory: false, source: '@Deprecated', line: 1, column: 1 },
      ]
      expect(analyzer.getDeprecated(decorators)).toHaveLength(1)
    })

    it('should return empty when no deprecated decorators', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
      ]
      expect(analyzer.getDeprecated(decorators)).toHaveLength(0)
    })
  })

  describe('getExperimental', () => {
    it('should find experimental decorators', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'experimental', args: [], target: 'method', isFactory: false, source: '@experimental', line: 1, column: 1 },
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 2, column: 1 },
      ]
      expect(analyzer.getExperimental(decorators)).toHaveLength(1)
    })

    it('should find Experimental (case insensitive)', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Experimental', args: [], target: 'method', isFactory: false, source: '@Experimental', line: 1, column: 1 },
      ]
      expect(analyzer.getExperimental(decorators)).toHaveLength(1)
    })

    it('should return empty when no experimental decorators', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
      ]
      expect(analyzer.getExperimental(decorators)).toHaveLength(0)
    })
  })

  describe('findUnused', () => {
    it('should find decorators not in used set', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'Component', args: [], target: 'class', isFactory: false, source: '@Component', line: 1, column: 1 },
        { name: 'Injectable', args: [], target: 'class', isFactory: false, source: '@Injectable', line: 2, column: 1 },
        { name: 'Deprecated', args: [], target: 'method', isFactory: false, source: '@Deprecated', line: 3, column: 1 },
      ]
      const used = new Set(['Component', 'Injectable'])
      const unused = analyzer.findUnused(decorators, used)
      expect(unused).toHaveLength(1)
      expect(unused[0]!.name).toBe('Deprecated')
    })

    it('should return all if nothing is used', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'A', args: [], target: 'class', isFactory: false, source: '@A', line: 1, column: 1 },
      ]
      expect(analyzer.findUnused(decorators, new Set())).toHaveLength(1)
    })

    it('should return empty if all are used', () => {
      const decorators: DecoratorInfo[] = [
        { name: 'A', args: [], target: 'class', isFactory: false, source: '@A', line: 1, column: 1 },
      ]
      expect(analyzer.findUnused(decorators, new Set(['A']))).toHaveLength(0)
    })

    it('should return empty for empty input', () => {
      expect(analyzer.findUnused([], new Set())).toHaveLength(0)
    })
  })
})

describe('DecoratorParser', () => {
  const parser = new DecoratorParser()

  describe('parse', () => {
    it('should produce a complete report', () => {
      const source = `@Component
class App {
  @Input
  name = ""
}`
      const report = parser.parse(source)
      expect(report.totalDecorators).toBe(2)
      expect(report.uniqueDecorators).toBe(2)
      expect(report.byTarget['class']).toBe(1)
      expect(report.byTarget['property']).toBe(1)
      expect(report.usages).toHaveLength(2)
    })

    it('should handle empty source', () => {
      const report = parser.parse('')
      expect(report.totalDecorators).toBe(0)
      expect(report.uniqueDecorators).toBe(0)
    })

    it('should handle source with no decorators', () => {
      const report = parser.parse('class Plain {}')
      expect(report.totalDecorators).toBe(0)
    })

    it('should include source in report', () => {
      const source = '@Component\nclass A {}'
      const report = parser.parse(source)
      expect(report.source).toBe(source)
    })

    it('should correctly count by name', () => {
      const source = `@Component
class A {}

@Component
class B {}`
      const report = parser.parse(source)
      expect(report.byName['Component']).toBe(2)
    })
  })

  describe('getDecoratorNames', () => {
    it('should return unique decorator names', () => {
      const source = `@Component
@Component
class A {}`
      const names = parser.getDecoratorNames(source)
      expect(names).toEqual(['Component'])
    })

    it('should return multiple unique names', () => {
      const source = `@Component
@Service
class A {}`
      const names = parser.getDecoratorNames(source)
      expect(names).toContain('Component')
      expect(names).toContain('Service')
    })

    it('should return empty for no decorators', () => {
      expect(parser.getDecoratorNames('class A {}')).toEqual([])
    })
  })

  describe('hasDecorator', () => {
    it('should return true if decorator exists', () => {
      expect(parser.hasDecorator('@Component\nclass A {}', 'Component')).toBe(true)
    })

    it('should return false if decorator does not exist', () => {
      expect(parser.hasDecorator('@Component\nclass A {}', 'Service')).toBe(false)
    })

    it('should return false for empty source', () => {
      expect(parser.hasDecorator('', 'Component')).toBe(false)
    })
  })

  describe('getDecoratorCount', () => {
    it('should count decorators correctly', () => {
      const source = `@Component
@Route("/home")
class A {}`
      expect(parser.getDecoratorCount(source)).toBe(2)
    })

    it('should return 0 for no decorators', () => {
      expect(parser.getDecoratorCount('class A {}')).toBe(0)
    })

    it('should return 0 for empty source', () => {
      expect(parser.getDecoratorCount('')).toBe(0)
    })
  })

  describe('validate', () => {
    it('should return empty errors for valid source', () => {
      const source = '@Component\nclass A {}'
      const errors = parser.validate(source)
      expect(errors).toEqual([])
    })

    it('should return empty errors for empty source', () => {
      expect(parser.validate('')).toEqual([])
    })

    it('should detect invalid decorator syntax', () => {
      const source = '@123\nclass A {}'
      const errors = parser.validate(source)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should pass valid factory decorators', () => {
      const source = '@Component("test")\nclass A {}'
      expect(parser.validate(source)).toEqual([])
    })
  })
})

describe('Integration: extractor + analyzer', () => {
  const extractor = new DecoratorExtractor()
  const analyzer = new DecoratorAnalyzer()

  it('should extract and analyze a complex class', () => {
    const source = `@Component({
  selector: 'app-root',
  template: '<div></div>'
})
class AppComponent {
  @Input
  title = ""

  @Output
  change = null

  @Log
  handleClick() {}

  @Cached(300)
  getData() {}
}`
    const decorators = extractor.extract(source)
    expect(decorators.length).toBeGreaterThanOrEqual(4)

    const report = analyzer.analyze(decorators, source)
    expect(report.totalDecorators).toBeGreaterThanOrEqual(4)
    expect(report.byTarget['class']).toBe(1)
    expect(report.usages.length).toBeGreaterThanOrEqual(4)

    const deprecated = analyzer.getDeprecated(decorators)
    expect(deprecated).toHaveLength(0)
  })

  it('should find deprecated and experimental in mixed source', () => {
    const source = `@Component
class A {
  @deprecated
  oldMethod() {}

  @experimental
  newMethod() {}
}`
    const decorators = extractor.extract(source)
    expect(analyzer.getDeprecated(decorators)).toHaveLength(1)
    expect(analyzer.getExperimental(decorators)).toHaveLength(1)
  })

  it('should find unused decorators', () => {
    const source = `@Component
@Deprecated
class A {}`
    const decorators = extractor.extract(source)
    const unused = analyzer.findUnused(decorators, new Set(['Component']))
    expect(unused).toHaveLength(1)
    expect(unused[0]!.name).toBe('Deprecated')
  })

  it('should handle property with typed decorator args', () => {
    const source = `class C {
  @Input("alias")
  name = ""

  @Input
  value = ""
}`
    const decorators = extractor.extract(source)
    const inputs = analyzer.getByName(decorators, 'Input')
    expect(inputs.length).toBe(2)
    const withArgs = inputs.filter((d) => d.args.length > 0)
    expect(withArgs).toHaveLength(1)
    expect(withArgs[0]!.args[0]).toEqual({ kind: 'string', value: 'alias' })
  })
})

describe('Edge cases', () => {
  const extractor = new DecoratorExtractor()
  const analyzer = new DecoratorAnalyzer()
  const parser = new DecoratorParser()

  it('should handle decorators with no following declaration gracefully', () => {
    const source = '@Component'
    const result = extractor.extract(source)
    expect(result).toHaveLength(1)
  })

  it('should handle decorator inside string literal', () => {
    const source = 'const s = "@Component"\nclass A {}'
    const result = extractor.extract(source)
    expect(result).toHaveLength(0)
  })

  it('should handle consecutive decorators on same line', () => {
    const source = '@A @B\nclass X {}'
    const result = extractor.extract(source)
    expect(result).toHaveLength(2)
  })

  it('should handle all five target types', () => {
    const source = `@Component
class A {
  @Prop
  x = 1

  @Method
  do() {}

  @Access
  get y() { return 1 }
}`
    const decorators = extractor.extract(source)
    const targets = new Set(decorators.map((d) => d.target))
    expect(targets.has('class')).toBe(true)
    expect(targets.has('property')).toBe(true)
    expect(targets.has('method')).toBe(true)
    expect(targets.has('accessor')).toBe(true)
  })

  it('should handle analyzer with all target counts at zero initially', () => {
    const report = analyzer.analyze([])
    expect(report.byTarget).toEqual({
      class: 0,
      method: 0,
      property: 0,
      parameter: 0,
      accessor: 0,
    })
  })

  it('should handle parseFile with a temporary file', async () => {
    const { writeFile, unlink } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const tmpPath = join('/tmp', 'test-decorator.ts')
    await writeFile(tmpPath, '@Component\nclass A {}', 'utf-8')
    try {
      const report = await parser.parseFile(tmpPath)
      expect(report.totalDecorators).toBe(1)
      expect(report.byName['Component']).toBe(1)
    } finally {
      await unlink(tmpPath)
    }
  })

  it('should handle decorator with complex object arg', () => {
    const source = '@Config({ name: "app", version: 1, active: true })\nclass A {}'
    const result = extractor.extract(source)
    expect(result[0]!.args).toHaveLength(1)
    expect(result[0]!.args[0]!.kind).toBe('object')
    const obj = result[0]!.args[0]!.value as Record<string, unknown>
    expect(obj['name']).toBe('app')
    expect(obj['version']).toBe(1)
    expect(obj['active']).toBe(true)
  })

  it('should handle decorator with array arg', () => {
    const source = '@Items([1, 2, 3])\nclass A {}'
    const result = extractor.extract(source)
    expect(result[0]!.args).toHaveLength(1)
    expect(result[0]!.args[0]).toEqual({ kind: 'array', value: [1, 2, 3] })
  })

  it('should handle decorator with empty object', () => {
    const source = '@Config({})\nclass A {}'
    const result = extractor.extract(source)
    expect(result[0]!.args[0]).toEqual({ kind: 'object', value: {} })
  })

  it('should handle decorator with empty array', () => {
    const source = '@List([])\nclass A {}'
    const result = extractor.extract(source)
    expect(result[0]!.args[0]).toEqual({ kind: 'array', value: [] })
  })
})
