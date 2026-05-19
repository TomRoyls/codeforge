import { describe, expect, it } from 'vitest'

import Types from '../src/commands/types.js'
import {
  buildTypesResult,
  computeTypeComplexity,
  computeTypeCoverage,
  extractTypeAnnotations,
  extractTypeDefs,
  type TypeAnnotation,
  type TypeInfo,
} from '../src/commands/types-helpers.js'
import { formatTypesCsv, formatTypesJson, formatTypesTable } from '../src/commands/types-format-helpers.js'
import type { TypesResult } from '../src/commands/types-helpers.js'

// ─── Test data ───────────────────────────────────────────

function makeAnnotation(overrides: Partial<TypeAnnotation> = {}): TypeAnnotation {
  return {
    complexity: 1,
    filePath: 'test.ts',
    hasGenerics: false,
    hasIntersection: false,
    hasOptional: false,
    hasUnion: false,
    kind: 'variable',
    line: 1,
    name: 'x',
    typeString: 'number',
    ...overrides,
  }
}

function makeTypeDef(overrides: Partial<TypeInfo> = {}): TypeInfo {
  return {
    complexity: 1,
    filePath: 'test.ts',
    generics: 0,
    kind: 'interface',
    line: 1,
    name: 'User',
    properties: 2,
    ...overrides,
  }
}

function makeTypesResult(overrides: Partial<TypesResult> = {}): TypesResult {
  const annotations = overrides.annotations ?? [makeAnnotation()]
  return {
    annotations,
    avgComplexity: 1,
    byKind: [{ count: 1, kind: 'variable' }],
    largestInterfaces: [],
    totalAnnotations: 1,
    totalTypeDefs: 0,
    typeCoverage: 100,
    typeDefinitions: [],
    topComplex: [],
    withGenerics: 0,
    withIntersections: 0,
    withOptional: 0,
    withUnions: 0,
    ...overrides,
  }
}

// ─── Static metadata ────────────────────────────────────

describe('Types command - static metadata', () => {
  it('has a description', () => {
    expect(Types.description).toBe('Analyze TypeScript type usage and complexity')
  })

  it('has examples array', () => {
    expect(Array.isArray(Types.examples)).toBe(true)
    expect(Types.examples.length).toBeGreaterThanOrEqual(4)
  })

  it('has path arg as optional', () => {
    expect(Types.args.path).toBeDefined()
    expect(Types.args.path.required).toBe(false)
  })

  it('defaults path to "."', () => {
    expect(Types.args.path.default).toBe('.')
  })
})

// ─── Flags ──────────────────────────────────────────────

describe('Types command - flags', () => {
  it('has format flag with options', () => {
    expect(Types.flags.format.options).toContain('json')
    expect(Types.flags.format.options).toContain('table')
    expect(Types.flags.format.options).toContain('csv')
  })

  it('defaults format to table', () => {
    expect(Types.flags.format.default).toBe('table')
  })

  it('has output flag', () => {
    expect(Types.flags.output).toBeDefined()
  })

  it('has ignore flag with multiple', () => {
    expect(Types.flags.ignore).toBeDefined()
    expect(Types.flags.ignore.multiple).toBe(true)
  })

  it('has ext flag defaulting to .ts,.tsx', () => {
    expect(Types.flags.ext).toBeDefined()
    expect(Types.flags.ext.default).toBe('.ts,.tsx')
  })

  it('has top flag defaulting to 20', () => {
    expect(Types.flags.top).toBeDefined()
    expect(Types.flags.top.default).toBe(20)
  })

  it('has verbose flag defaulting to false', () => {
    expect(Types.flags.verbose.default).toBe(false)
  })
})

// ─── Class structure ────────────────────────────────────

describe('Types command - class structure', () => {
  it('exports a default class', () => {
    expect(Types).toBeDefined()
    expect(typeof Types).toBe('function')
  })

  it('has a run method', () => {
    expect(typeof Types.prototype.run).toBe('function')
  })
})

// ─── extractTypeAnnotations ─────────────────────────────

describe('extractTypeAnnotations', () => {
  it('extracts variable type annotation', () => {
    const result = extractTypeAnnotations('const name: string = "hello";', 'test.ts')
    expect(result.length).toBeGreaterThanOrEqual(1)
    const varAnn = result.find((a) => a.kind === 'variable' && a.name === 'name')
    expect(varAnn).toBeDefined()
    expect(varAnn!.typeString).toBe('string')
  })

  it('extracts let variable type annotation', () => {
    const result = extractTypeAnnotations('let count: number = 0;', 'test.ts')
    const varAnn = result.find((a) => a.kind === 'variable' && a.name === 'count')
    expect(varAnn).toBeDefined()
    expect(varAnn!.typeString).toBe('number')
  })

  it('extracts parameter type annotation', () => {
    const result = extractTypeAnnotations('function greet(name: string) { }', 'test.ts')
    const paramAnn = result.find((a) => a.kind === 'parameter' && a.name === 'name')
    expect(paramAnn).toBeDefined()
    expect(paramAnn!.typeString).toBe('string')
  })

  it('extracts multiple parameter annotations', () => {
    const result = extractTypeAnnotations('function add(a: number, b: number) { }', 'test.ts')
    const params = result.filter((a) => a.kind === 'parameter')
    expect(params.length).toBe(2)
  })

  it('extracts return type annotation', () => {
    const result = extractTypeAnnotations('function getName(): string { return "hi"; }', 'test.ts')
    const returnAnn = result.find((a) => a.kind === 'return')
    expect(returnAnn).toBeDefined()
    expect(returnAnn!.typeString).toBe('string')
  })

  it('extracts arrow function return type', () => {
    const result = extractTypeAnnotations('const fn = (x: number): number => x + 1', 'test.ts')
    const returnAnn = result.find((a) => a.kind === 'return')
    expect(returnAnn).toBeDefined()
    expect(returnAnn!.typeString).toBe('number')
  })

  it('detects generics in type annotation', () => {
    const result = extractTypeAnnotations('const items: Array<string> = [];', 'test.ts')
    const varAnn = result.find((a) => a.name === 'items')
    expect(varAnn).toBeDefined()
    expect(varAnn!.hasGenerics).toBe(true)
  })

  it('detects union type', () => {
    const result = extractTypeAnnotations('const value: string | number = "hi";', 'test.ts')
    const varAnn = result.find((a) => a.name === 'value')
    expect(varAnn).toBeDefined()
    expect(varAnn!.hasUnion).toBe(true)
  })

  it('detects intersection type', () => {
    const result = extractTypeAnnotations('const obj: A & B = {};', 'test.ts')
    const varAnn = result.find((a) => a.name === 'obj')
    expect(varAnn).toBeDefined()
    expect(varAnn!.hasIntersection).toBe(true)
  })

  it('detects optional parameter', () => {
    const result = extractTypeAnnotations('function greet(name?: string) { }', 'test.ts')
    const paramAnn = result.find((a) => a.kind === 'parameter' && a.name === 'name')
    expect(paramAnn).toBeDefined()
    expect(paramAnn!.hasOptional).toBe(true)
  })

  it('returns empty array for no annotations', () => {
    const result = extractTypeAnnotations('const x = 1;\nlet y = 2;', 'test.ts')
    const typed = result.filter((a) => a.kind === 'variable')
    expect(typed).toHaveLength(0)
  })

  it('skips comment lines', () => {
    const result = extractTypeAnnotations('// const x: number = 1;', 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('skips import lines', () => {
    const result = extractTypeAnnotations('import { Foo } from "bar";', 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('extracts complex generic type', () => {
    const result = extractTypeAnnotations('const map: Map<string, Array<number>> = new Map();', 'test.ts')
    const varAnn = result.find((a) => a.name === 'map')
    expect(varAnn).toBeDefined()
    expect(varAnn!.hasGenerics).toBe(true)
    expect(varAnn!.complexity).toBeGreaterThan(1)
  })

  it('assigns correct file path and line number', () => {
    const content = 'const a = 1;\nconst b: number = 2;'
    const result = extractTypeAnnotations(content, 'myfile.ts')
    const varAnn = result.find((a) => a.name === 'b')
    expect(varAnn).toBeDefined()
    expect(varAnn!.filePath).toBe('myfile.ts')
    expect(varAnn!.line).toBe(2)
  })
})

// ─── extractTypeDefs ────────────────────────────────────

describe('extractTypeDefs', () => {
  it('extracts interface', () => {
    const content = 'interface User {\n  name: string;\n  age: number;\n}'
    const result = extractTypeDefs(content, 'test.ts')
    expect(result.length).toBeGreaterThanOrEqual(1)
    const iface = result.find((d) => d.name === 'User')
    expect(iface).toBeDefined()
    expect(iface!.kind).toBe('interface')
    expect(iface!.properties).toBe(2)
  })

  it('extracts type alias', () => {
    const content = 'type ID = string | number;'
    const result = extractTypeDefs(content, 'test.ts')
    const typeAlias = result.find((d) => d.name === 'ID')
    expect(typeAlias).toBeDefined()
    expect(typeAlias!.kind).toBe('type')
  })

  it('extracts enum', () => {
    const content = 'enum Color {\n  Red,\n  Green,\n  Blue\n}'
    const result = extractTypeDefs(content, 'test.ts')
    const enumDef = result.find((d) => d.name === 'Color')
    expect(enumDef).toBeDefined()
    expect(enumDef!.kind).toBe('enum')
    expect(enumDef!.properties).toBeGreaterThanOrEqual(3)
  })

  it('counts interface properties correctly', () => {
    const content = 'interface Config {\n  host: string;\n  port: number;\n  debug: boolean;\n}'
    const result = extractTypeDefs(content, 'test.ts')
    const iface = result.find((d) => d.name === 'Config')
    expect(iface).toBeDefined()
    expect(iface!.properties).toBe(3)
  })

  it('counts generics correctly', () => {
    const content = 'interface Result<T, E> {\n  value: T;\n  error: E;\n}'
    const result = extractTypeDefs(content, 'test.ts')
    const iface = result.find((d) => d.name === 'Result')
    expect(iface).toBeDefined()
    expect(iface!.generics).toBe(2)
  })

  it('returns empty array for no definitions', () => {
    const content = 'const x = 1;\nlet y = 2;'
    const result = extractTypeDefs(content, 'test.ts')
    expect(result).toHaveLength(0)
  })

  it('assigns correct file path and line number', () => {
    const content = 'const x = 1;\ninterface Foo {\n  a: string;\n}'
    const result = extractTypeDefs(content, 'myfile.ts')
    const iface = result.find((d) => d.name === 'Foo')
    expect(iface).toBeDefined()
    expect(iface!.filePath).toBe('myfile.ts')
    expect(iface!.line).toBe(2)
  })

  it('handles interface with no generics', () => {
    const content = 'interface Simple {\n  value: string;\n}'
    const result = extractTypeDefs(content, 'test.ts')
    const iface = result.find((d) => d.name === 'Simple')
    expect(iface).toBeDefined()
    expect(iface!.generics).toBe(0)
  })

  it('handles type alias with object literal', () => {
    const content = 'type Point = {\n  x: number;\n  y: number;\n}'
    const result = extractTypeDefs(content, 'test.ts')
    const typeDef = result.find((d) => d.name === 'Point')
    expect(typeDef).toBeDefined()
    expect(typeDef!.kind).toBe('type')
  })
})

// ─── computeTypeComplexity ──────────────────────────────

describe('computeTypeComplexity', () => {
  it('returns 1 for simple types', () => {
    expect(computeTypeComplexity('string')).toBe(1)
    expect(computeTypeComplexity('number')).toBe(1)
    expect(computeTypeComplexity('boolean')).toBe(1)
  })

  it('returns higher for generic types', () => {
    const result = computeTypeComplexity('Array<string>')
    expect(result).toBeGreaterThan(1)
  })

  it('returns higher for union types', () => {
    const result = computeTypeComplexity('string | number')
    expect(result).toBeGreaterThan(1)
  })

  it('returns highest for nested generics', () => {
    const simple = computeTypeComplexity('string')
    const nested = computeTypeComplexity('Record<string, Array<number>>')
    expect(nested).toBeGreaterThan(simple)
  })

  it('handles complex composed types', () => {
    const result = computeTypeComplexity('Record<string, Array<number | string>>')
    expect(result).toBeGreaterThanOrEqual(3)
  })

  it('caps at 10', () => {
    const result = computeTypeComplexity('A & B | C & D | E & F | G & H | I | J | K | L')
    expect(result).toBeLessThanOrEqual(10)
  })

  it('handles intersection types', () => {
    const result = computeTypeComplexity('A & B')
    expect(result).toBeGreaterThan(1)
  })

  it('handles array types', () => {
    const result = computeTypeComplexity('string[]')
    expect(result).toBeGreaterThan(1)
  })

  it('handles utility types', () => {
    const result = computeTypeComplexity('Record<string, number>')
    expect(result).toBeGreaterThan(2)
  })

  it('handles Map type', () => {
    const result = computeTypeComplexity('Map<string, number>')
    expect(result).toBeGreaterThan(2)
  })

  it('handles Set type', () => {
    const result = computeTypeComplexity('Set<string>')
    expect(result).toBeGreaterThan(2)
  })
})

// ─── computeTypeCoverage ────────────────────────────────

describe('computeTypeCoverage', () => {
  it('returns 100 for fully typed declarations', () => {
    const content = 'const x: number = 1;\nlet y: string = "hi";'
    expect(computeTypeCoverage(content)).toBe(100)
  })

  it('returns 0 for untyped declarations', () => {
    const content = 'const x = 1;\nlet y = "hi";'
    expect(computeTypeCoverage(content)).toBe(0)
  })

  it('returns partial coverage for mixed', () => {
    const content = 'const x: number = 1;\nlet y = "hi";'
    expect(computeTypeCoverage(content)).toBe(50)
  })

  it('returns 100 when no declarations exist', () => {
    const content = 'function foo() { }\nconsole.log("hi");'
    expect(computeTypeCoverage(content)).toBe(100)
  })

  it('handles empty content', () => {
    expect(computeTypeCoverage('')).toBe(100)
  })

  it('handles single typed variable', () => {
    const content = 'const name: string = "test";'
    expect(computeTypeCoverage(content)).toBe(100)
  })

  it('handles var declarations', () => {
    const content = 'var x: number = 1;'
    expect(computeTypeCoverage(content)).toBe(100)
  })
})

// ─── buildTypesResult ───────────────────────────────────

describe('buildTypesResult', () => {
  it('computes correct totals', () => {
    const annotations = [makeAnnotation(), makeAnnotation({ name: 'y' })]
    const typeDefs = [makeTypeDef()]
    const result = buildTypesResult(annotations, typeDefs)
    expect(result.totalAnnotations).toBe(2)
    expect(result.totalTypeDefs).toBe(1)
  })

  it('computes byKind breakdown', () => {
    const annotations = [
      makeAnnotation({ kind: 'variable' }),
      makeAnnotation({ kind: 'variable', name: 'y' }),
      makeAnnotation({ kind: 'parameter', name: 'z' }),
    ]
    const result = buildTypesResult(annotations, [])
    expect(result.byKind).toHaveLength(2)
    const varKind = result.byKind.find((k) => k.kind === 'variable')
    expect(varKind!.count).toBe(2)
    const paramKind = result.byKind.find((k) => k.kind === 'parameter')
    expect(paramKind!.count).toBe(1)
  })

  it('applies top limit for topComplex', () => {
    const annotations = Array.from({ length: 30 }, (_, i) =>
      makeAnnotation({ name: `a${i}`, complexity: 30 - i }),
    )
    const result = buildTypesResult(annotations, [], { top: 10 })
    expect(result.topComplex).toHaveLength(10)
  })

  it('sorts topComplex by complexity desc', () => {
    const annotations = [
      makeAnnotation({ name: 'low', complexity: 1 }),
      makeAnnotation({ name: 'high', complexity: 8 }),
      makeAnnotation({ name: 'mid', complexity: 4 }),
    ]
    const result = buildTypesResult(annotations, [])
    expect(result.topComplex[0]!.name).toBe('high')
    expect(result.topComplex[1]!.name).toBe('mid')
    expect(result.topComplex[2]!.name).toBe('low')
  })

  it('computes largestInterfaces', () => {
    const typeDefs = [
      makeTypeDef({ name: 'Small', properties: 2, kind: 'interface' }),
      makeTypeDef({ name: 'Large', properties: 10, kind: 'interface' }),
    ]
    const result = buildTypesResult([], typeDefs)
    expect(result.largestInterfaces).toHaveLength(2)
    expect(result.largestInterfaces[0]!.name).toBe('Large')
  })

  it('computes feature counts correctly', () => {
    const annotations = [
      makeAnnotation({ hasGenerics: true, name: 'a' }),
      makeAnnotation({ hasUnion: true, name: 'b' }),
      makeAnnotation({ hasIntersection: true, name: 'c' }),
      makeAnnotation({ hasOptional: true, name: 'd' }),
    ]
    const result = buildTypesResult(annotations, [])
    expect(result.withGenerics).toBe(1)
    expect(result.withUnions).toBe(1)
    expect(result.withIntersections).toBe(1)
    expect(result.withOptional).toBe(1)
  })

  it('computes average complexity', () => {
    const annotations = [
      makeAnnotation({ complexity: 2 }),
      makeAnnotation({ name: 'y', complexity: 4 }),
    ]
    const result = buildTypesResult(annotations, [])
    expect(result.avgComplexity).toBe(3)
  })

  it('handles empty annotations', () => {
    const result = buildTypesResult([], [])
    expect(result.totalAnnotations).toBe(0)
    expect(result.avgComplexity).toBe(0)
    expect(result.byKind).toHaveLength(0)
    expect(result.topComplex).toHaveLength(0)
  })

  it('uses default top of 20', () => {
    const annotations = Array.from({ length: 30 }, (_, i) =>
      makeAnnotation({ name: `a${i}`, complexity: 30 - i }),
    )
    const result = buildTypesResult(annotations, [])
    expect(result.topComplex).toHaveLength(20)
  })
})

// ─── formatTypesTable ───────────────────────────────────

describe('formatTypesTable', () => {
  it('contains summary section', () => {
    const result = makeTypesResult()
    const output = formatTypesTable(result, false)
    expect(output).toContain('Type Usage Analysis')
    expect(output).toContain('Total type annotations')
    expect(output).toContain('Type definitions')
    expect(output).toContain('Average complexity')
  })

  it('shows top complex types', () => {
    const result = makeTypesResult({
      topComplex: [makeAnnotation({ name: 'complex', typeString: 'Record<string, number>', complexity: 5 })],
    })
    const output = formatTypesTable(result, false)
    expect(output).toContain('complex')
    expect(output).toContain('Top Complex Types')
  })

  it('shows largest interfaces', () => {
    const result = makeTypesResult({
      largestInterfaces: [makeTypeDef({ name: 'BigInterface', properties: 15 })],
    })
    const output = formatTypesTable(result, false)
    expect(output).toContain('BigInterface')
    expect(output).toContain('Largest Interfaces')
  })

  it('shows type coverage bar', () => {
    const result = makeTypesResult({ typeCoverage: 75 })
    const output = formatTypesTable(result, false)
    expect(output).toContain('75%')
  })

  it('shows verbose annotations', () => {
    const result = makeTypesResult({
      annotations: [makeAnnotation({ name: 'myVar', typeString: 'string' })],
    })
    const output = formatTypesTable(result, true)
    expect(output).toContain('All Annotations')
    expect(output).toContain('myVar')
  })

  it('hides verbose annotations when false', () => {
    const result = makeTypesResult({
      annotations: [makeAnnotation({ name: 'myVar' })],
    })
    const output = formatTypesTable(result, false)
    expect(output).not.toContain('All Annotations')
  })

  it('handles empty result', () => {
    const result = makeTypesResult({
      annotations: [],
      byKind: [],
      largestInterfaces: [],
      totalAnnotations: 0,
      totalTypeDefs: 0,
      topComplex: [],
    })
    const output = formatTypesTable(result, false)
    expect(output).toContain('Type Usage Analysis')
  })

  it('shows byKind breakdown', () => {
    const result = makeTypesResult({
      byKind: [
        { count: 5, kind: 'variable' },
        { count: 3, kind: 'parameter' },
      ],
    })
    const output = formatTypesTable(result, false)
    expect(output).toContain('By Kind')
    expect(output).toContain('variable')
    expect(output).toContain('parameter')
  })
})

// ─── formatTypesCsv ─────────────────────────────────────

describe('formatTypesCsv', () => {
  it('produces CSV with summary headers', () => {
    const result = makeTypesResult()
    const output = formatTypesCsv(result)
    expect(output).toContain('Category,Metric,Value')
    expect(output).toContain('Summary,Total Annotations')
  })

  it('includes byKind data', () => {
    const result = makeTypesResult({
      byKind: [{ count: 5, kind: 'variable' }],
    })
    const output = formatTypesCsv(result)
    expect(output).toContain('ByKind,variable,5')
  })

  it('includes top complex types', () => {
    const result = makeTypesResult({
      topComplex: [makeAnnotation({ name: 'myType', typeString: 'string', complexity: 3, filePath: 'f.ts', line: 1 })],
    })
    const output = formatTypesCsv(result)
    expect(output).toContain('Name,Type,Complexity,File,Line')
    expect(output).toContain('myType')
  })

  it('includes largest interfaces', () => {
    const result = makeTypesResult({
      largestInterfaces: [makeTypeDef({ name: 'BigIface', properties: 10, generics: 2 })],
    })
    const output = formatTypesCsv(result)
    expect(output).toContain('Name,Properties,Generics,File')
    expect(output).toContain('BigIface')
  })

  it('escapes commas in values', () => {
    const result = makeTypesResult({
      topComplex: [makeAnnotation({ name: 'a,b', typeString: 'x', filePath: 'f.ts', line: 1 })],
    })
    const output = formatTypesCsv(result)
    expect(output).toContain('"a,b"')
  })

  it('handles empty result', () => {
    const result = makeTypesResult({
      annotations: [],
      byKind: [],
      largestInterfaces: [],
      totalAnnotations: 0,
      totalTypeDefs: 0,
      topComplex: [],
    })
    const output = formatTypesCsv(result)
    expect(output).toContain('Summary,Total Annotations,0')
  })
})

// ─── formatTypesJson ────────────────────────────────────

describe('formatTypesJson', () => {
  it('produces valid JSON', () => {
    const result = makeTypesResult()
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed).toBeDefined()
  })

  it('contains totalAnnotations', () => {
    const result = makeTypesResult()
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalAnnotations).toBe(1)
  })

  it('contains annotations array', () => {
    const result = makeTypesResult()
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.annotations).toBeDefined()
    expect(Array.isArray(parsed.annotations)).toBe(true)
  })

  it('contains typeDefinitions array', () => {
    const result = makeTypesResult({
      typeDefinitions: [makeTypeDef()],
    })
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.typeDefinitions).toBeDefined()
    expect(parsed.typeDefinitions).toHaveLength(1)
  })

  it('contains topComplex', () => {
    const result = makeTypesResult({
      topComplex: [makeAnnotation({ complexity: 5 })],
    })
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.topComplex).toHaveLength(1)
    expect(parsed.topComplex[0].complexity).toBe(5)
  })

  it('handles empty results', () => {
    const result = makeTypesResult({
      annotations: [],
      byKind: [],
      largestInterfaces: [],
      totalAnnotations: 0,
      totalTypeDefs: 0,
      topComplex: [],
    })
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.totalAnnotations).toBe(0)
    expect(parsed.annotations).toHaveLength(0)
  })

  it('preserves type coverage', () => {
    const result = makeTypesResult({ typeCoverage: 75 })
    const output = formatTypesJson(result)
    const parsed = JSON.parse(output)
    expect(parsed.typeCoverage).toBe(75)
  })
})
