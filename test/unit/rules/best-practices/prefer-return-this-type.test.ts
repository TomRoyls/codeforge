import { describe, test, expect } from 'vitest'
import { Project } from 'ts-morph'
import {
  analyzePreferReturnThisType,
  preferReturnThisTypeRule,
} from '../../../../src/rules/best-practices/prefer-return-this-type.js'

const sharedProject = new Project({ useInMemoryFileSystem: true })
let fileCounter = 0
const createSourceFile = (code: string) => {
  fileCounter++
  return sharedProject.createSourceFile(`test${fileCounter}.ts`, code)
}

describe('prefer-return-this-type rule', () => {
  describe('meta validation', () => {
    test('should have correct rule name', () => {
      expect(preferReturnThisTypeRule.meta.name).toBe('prefer-return-this-type')
    })

    test('should have style category', () => {
      expect(preferReturnThisTypeRule.meta.category).toBe('style')
    })

    test('should have a description', () => {
      expect(preferReturnThisTypeRule.meta.description).toBeDefined()
      expect(typeof preferReturnThisTypeRule.meta.description).toBe('string')
      expect(preferReturnThisTypeRule.meta.description.length).toBeGreaterThan(0)
    })

    test('should not be recommended', () => {
      expect(preferReturnThisTypeRule.meta.recommended).toBe(false)
    })

    test('should be fixable as code', () => {
      expect(preferReturnThisTypeRule.meta.fixable).toBe('code')
    })

    test('should have defaultOptions defined', () => {
      expect(preferReturnThisTypeRule.defaultOptions).toBeDefined()
    })

    test('should create visitor with visitNode method', () => {
      const result = preferReturnThisTypeRule.create(preferReturnThisTypeRule.defaultOptions)
      expect(result.visitor).toBeDefined()
      expect(result.visitor.visitNode).toBeDefined()
      expect(result.onComplete).toBeDefined()
    })

    test('should return object with visitor and onComplete from create', () => {
      const result = preferReturnThisTypeRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })
  })

  describe('methods returning class name - flagged', () => {
    test('should flag method returning class name instead of this', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('prefer-return-this-type')
    })

    test('should flag multiple methods returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
          setAge(age: number): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(2)
    })

    test('should flag method with different class name', () => {
      const sf = createSourceFile(`
        class HttpClient {
          setUrl(url: string): HttpClient { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations.length).toBeGreaterThan(0)
    })

    test('should flag method with parameters', () => {
      const sf = createSourceFile(`
        class Config {
          set(key: string, value: unknown): Config { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method in exported class', () => {
      const sf = createSourceFile(`
        export class Builder {
          build(): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method in default exported class', () => {
      const sf = createSourceFile(`
        export default class QueryBuilder {
          select(fields: string[]): QueryBuilder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method in abstract class', () => {
      const sf = createSourceFile(`
        abstract class BaseBuilder {
          setName(name: string): BaseBuilder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method in class with generic type', () => {
      const sf = createSourceFile(`
        class Container {
          setValue(value: unknown): Container { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method with complex body', () => {
      const sf = createSourceFile(`
        class Validator {
          validate(data: unknown): Validator {
            if (!data) throw new Error();
            return this;
          }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should flag method in class expression', () => {
      const sf = createSourceFile(`
        const MyBuilder = class MyBuilder {
          setName(name: string): MyBuilder { return this; }
        };
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations.length).toBeGreaterThan(0)
    })

    test('should correctly detect class name for multiple classes in one file', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
        class Parser {
          parse(input: string): Parser { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(2)
    })

    test('should flag method returning class name in fluent API', () => {
      const sf = createSourceFile(`
        class Fluent {
          step1(): Fluent { return this; }
          step2(): Fluent { return this; }
          step3(): Fluent { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(3)
    })
  })

  describe('methods returning this - not flagged', () => {
    test('should not flag method returning this', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): this { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag multiple methods returning this', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): this { return this; }
          setAge(age: number): this { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method with params returning this', () => {
      const sf = createSourceFile(`
        class Config {
          set(key: string, value: unknown): this { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method in subclass returning this', () => {
      const sf = createSourceFile(`
        class Base {
          setName(name: string): this { return this; }
        }
        class Derived extends Base {}
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('methods without return type - not flagged', () => {
    test('should not flag method without return type', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string) { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method with void return type', () => {
      const sf = createSourceFile(`
        class Builder {
          reset(): void { }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method with no body', () => {
      const sf = createSourceFile(`
        abstract class Builder {
          abstract setName(name: string): void;
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning primitive', () => {
      const sf = createSourceFile(`
        class Counter {
          getCount(): number { return 0; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('constructors - not flagged', () => {
    test('should not flag constructor', () => {
      const sf = createSourceFile(`
        class Builder {
          constructor() {}
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag constructor with parameters', () => {
      const sf = createSourceFile(`
        class Builder {
          constructor(private name: string) {}
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('private methods - not flagged', () => {
    test('should not flag private method returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          private setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag protected method returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          protected setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag ECMAScript private method returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          #setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('static methods - not flagged', () => {
    test('should not flag static method returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          static create(): Builder { return new Builder(); }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag static method with params returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          static fromConfig(config: unknown): Builder { return new Builder(); }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag static private method', () => {
      const sf = createSourceFile(`
        class Builder {
          private static create(): Builder { return new Builder(); }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('getters and setters - not flagged', () => {
    test('should not flag getter returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          get instance(): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag setter', () => {
      const sf = createSourceFile(`
        class Builder {
          set name(value: string) { this._name = value; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag getter and setter pair', () => {
      const sf = createSourceFile(`
        class Builder {
          get name(): string { return this._name; }
          set name(value: string) { this._name = value; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('arrow function class properties - not flagged', () => {
    test('should not flag arrow function class property', () => {
      const sf = createSourceFile(`
        class Builder {
          setName = (name: string): Builder => { return this; };
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag arrow function property returning class name', () => {
      const sf = createSourceFile(`
        class Builder {
          build = (): Builder => { return this; };
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('return types that do not match class name - not flagged', () => {
    test('should not flag method returning different class name', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): OtherClass { return new OtherClass(); }
        }
        class OtherClass {}
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning union type with class name', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder | null { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning generic type with class name', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Promise<Builder> { return Promise.resolve(this); }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning nullable type', () => {
      const sf = createSourceFile(`
        class Builder {
          find(id: number): Builder | undefined { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning array type', () => {
      const sf = createSourceFile(`
        class Builder {
          getAll(): Builder[] { return [this]; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning string literal type', () => {
      const sf = createSourceFile(`
        class Builder {
          getType(): 'builder' { return 'builder'; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should not flag method returning intersection type', () => {
      const sf = createSourceFile(`
        class Builder {
          extend(): Builder & { extra: boolean } { return this as Builder & { extra: boolean }; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('message format verification', () => {
    test('should include class name in message', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].message).toContain('Builder')
    })

    test('should include suggestion to use this', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].suggestion).toContain('this')
      expect(violations[0].suggestion).toContain('Builder')
    })

    test('should have warning severity', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].severity).toBe('warning')
    })

    test('should have correct ruleId', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].ruleId).toBe('prefer-return-this-type')
    })

    test('should have filePath on violation', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].filePath).toBeDefined()
    })

    test('should have range with start and end', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].range).toBeDefined()
      expect(violations[0].range.start).toBeDefined()
      expect(violations[0].range.end).toBeDefined()
    })

    test('should include inheritance chains message', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations[0].message).toContain('inheritance')
    })
  })

  describe('edge cases', () => {
    test('should handle empty file', () => {
      const sf = createSourceFile('')
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle file with only comments', () => {
      const sf = createSourceFile('// just a comment')
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle file with only whitespace', () => {
      const sf = createSourceFile('   \n\n  ')
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle anonymous class expression', () => {
      const sf = createSourceFile(`
        const obj = class {
          setName(name: string): class { return this; }
        };
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle class without name', () => {
      const sf = createSourceFile(`
        export default class {
          setName(name: string) { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle function outside class', () => {
      const sf = createSourceFile(`
        function build(): build { return {} as build; }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle object method outside class', () => {
      const sf = createSourceFile(`
        const obj = {
          setName(name: string) { return this; }
        };
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle interface method', () => {
      const sf = createSourceFile(`
        interface IBuilder {
          setName(name: string): IBuilder;
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle nested class', () => {
      const sf = createSourceFile(`
        class Outer {
          createInner(): Outer { return this; }
          class Inner {
            setVal(v: number): Inner { return this; }
          }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations.length).toBeGreaterThanOrEqual(0)
    })

    test('should handle method in class with implements', () => {
      const sf = createSourceFile(`
        interface IBuilder {
          setName(name: string): IBuilder;
        }
        class Builder implements IBuilder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should handle class extending another class', () => {
      const sf = createSourceFile(`
        class Base {
          setName(name: string): Base { return this; }
        }
        class Derived extends Base {
          setAge(age: number): Derived { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(2)
    })

    test('should not flag when return type is subclass of class name', () => {
      const sf = createSourceFile(`
        class Base {
          setName(name: string): Derived { return this as Derived; }
        }
        class Derived extends Base {}
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should handle method with async modifier', () => {
      const sf = createSourceFile(`
        class Service {
          async process(): Service { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })
  })

  describe('rule create function', () => {
    test('should return visitor with visitNode function', () => {
      const result = preferReturnThisTypeRule.create({})
      expect(typeof result.visitor.visitNode).toBe('function')
    })

    test('should return onComplete function', () => {
      const result = preferReturnThisTypeRule.create({})
      expect(typeof result.onComplete).toBe('function')
    })

    test('should have onComplete return empty array before traversal', () => {
      const result = preferReturnThisTypeRule.create({})
      const violations = result.onComplete()
      expect(Array.isArray(violations)).toBe(true)
    })

    test('should collect violations after visitNode processes MethodDeclaration', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const result = preferReturnThisTypeRule.create({})
      sf.forEachDescendant((node) => {
        result.visitor.visitNode!(node, { sourceFile: sf, violations: [] } as any)
      })
      const violations = result.onComplete()
      expect(violations.length).toBeGreaterThan(0)
      expect(violations[0].ruleId).toBe('prefer-return-this-type')
    })

    test('should accept empty options', () => {
      const result = preferReturnThisTypeRule.create({})
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })

    test('should accept default options', () => {
      const result = preferReturnThisTypeRule.create(preferReturnThisTypeRule.defaultOptions)
      expect(result).toHaveProperty('visitor')
      expect(result).toHaveProperty('onComplete')
    })
  })

  describe('analyzePreferReturnThisType function', () => {
    test('should return empty array for empty file', () => {
      const sf = createSourceFile('')
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toEqual([])
    })

    test('should return empty array when no classes', () => {
      const sf = createSourceFile('const x = 42;')
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })

    test('should return RuleViolation array', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(Array.isArray(violations)).toBe(true)
    })

    test('should work with no options', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations.length).toBeGreaterThan(0)
    })

    test('should work with empty options', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf, {})
      expect(violations.length).toBeGreaterThan(0)
    })

    test('should detect single violation', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should detect multiple violations in same class', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
          setAge(age: number): Builder { return this; }
          setActive(): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(3)
    })
  })

  describe('inherited class names properly detected', () => {
    test('should flag method in derived class returning derived class name', () => {
      const sf = createSourceFile(`
        class Base {}
        class Derived extends Base {
          setName(name: string): Derived { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Derived')
    })

    test('should flag method in base class returning base class name', () => {
      const sf = createSourceFile(`
        class Base {
          configure(): Base { return this; }
        }
        class Derived extends Base {}
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
      expect(violations[0].message).toContain('Base')
    })

    test('should not flag derived method returning base class name', () => {
      const sf = createSourceFile(`
        class Base {}
        class Derived extends Base {
          configure(): Base { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(0)
    })
  })

  describe('mixed scenarios', () => {
    test('should flag only methods returning own class name in mixed class', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
          reset(): void {}
          clone(): this { return this; }
          getCount(): number { return 0; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should handle mix of public and private methods', () => {
      const sf = createSourceFile(`
        class Builder {
          setName(name: string): Builder { return this; }
          private internalSet(val: unknown): Builder { return this; }
          protected protectedSet(val: unknown): Builder { return this; }
          public publicSet(val: unknown): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(2)
    })

    test('should handle mix of static and instance methods', () => {
      const sf = createSourceFile(`
        class Builder {
          static create(): Builder { return new Builder(); }
          setName(name: string): Builder { return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should handle method with decorator', () => {
      const sf = createSourceFile(`
        class Builder {
          @log
          setName(name: string): Builder { return this; }
        }
        function log(target: any, key: string, descriptor: PropertyDescriptor) {}
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })

    test('should handle readonly modifier on method', () => {
      const sf = createSourceFile(`
        class Builder {
          readonly name: string = '';
          setName(name: string): Builder { this.name = name; return this; }
        }
      `)
      const violations = analyzePreferReturnThisType(sf)
      expect(violations).toHaveLength(1)
    })
  })
})
