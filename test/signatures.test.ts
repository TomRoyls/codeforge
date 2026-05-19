import { describe, expect, it } from 'vitest'

import {
  buildSignaturesResult,
  computeSignatureComplexity,
  computeSignatureStats,
  extractSignatures,
  generateSignatureSuggestions,
  parseParameter,
  sourceBaseName,
  type ParamDetail,
  type SignatureInfo,
  type SignatureStats,
} from '../src/commands/signatures-helpers.js'

import {
  complexityBadge,
  formatParamDistribution,
  formatSignature,
  formatSignatures,
  formatSignaturesJson,
  formatSignaturesTable,
  formatSignatureStats,
} from '../src/commands/signatures-format-helpers.js'

// ─── Fixtures ───────────────────────────────────────────

function makeParam(overrides: Partial<ParamDetail> = {}): ParamDetail {
  return {
    destructuredKeys: [],
    hasDefault: false,
    isDestructured: false,
    isRest: false,
    name: 'arg',
    optional: false,
    type: 'string',
    ...overrides,
  }
}

function makeSig(overrides: Partial<SignatureInfo> = {}): SignatureInfo {
  return {
    complexity: 1,
    file: 'test.ts',
    genericParams: [],
    hasDefaultValues: false,
    hasDestructuring: false,
    hasOptionalParams: false,
    hasRestParams: false,
    isAsync: false,
    isExported: true,
    isGeneric: false,
    line: 1,
    name: 'test',
    parameters: [makeParam()],
    returnType: 'void',
    signature: 'function test(arg: string): void',
    suggestions: [],
    ...overrides,
  }
}

function makeStats(overrides: Partial<SignatureStats> = {}): SignatureStats {
  return {
    asyncFunctions: 0,
    avgParamCount: 1,
    complexSignatures: 0,
    exportedFunctions: 1,
    functionsWithDestructuring: 0,
    functionsWithOptionalParams: 0,
    functionsWithRestParams: 0,
    genericFunctions: 0,
    maxParamCount: 1,
    paramDistribution: { '1': 1 },
    totalFunctions: 1,
    ...overrides,
  }
}

// ─── parseParameter ─────────────────────────────────────

describe('parseParameter', () => {
  it('parses typed param', () => {
    const p = parseParameter('name: string')
    expect(p.name).toBe('name')
    expect(p.type).toBe('string')
  })

  it('parses optional param', () => {
    const p = parseParameter('name?: string')
    expect(p.optional).toBe(true)
  })

  it('parses param with default', () => {
    const p = parseParameter('count: number = 10')
    expect(p.hasDefault).toBe(true)
    expect(p.type).toContain('number')
  })

  it('parses rest param', () => {
    const p = parseParameter('...args: string[]')
    expect(p.isRest).toBe(true)
  })

  it('parses destructured param', () => {
    const p = parseParameter('{ name, age }: Person')
    expect(p.isDestructured).toBe(true)
    expect(p.destructuredKeys).toContain('name')
    expect(p.destructuredKeys).toContain('age')
  })

  it('parses simple name only', () => {
    const p = parseParameter('callback')
    expect(p.name).toBe('callback')
  })

  it('parses complex type', () => {
    const p = parseParameter('fn: (x: number) => string')
    expect(p.name).toBe('fn')
    expect(p.type).toContain('number')
  })

  it('parses rest with type', () => {
    const p = parseParameter('...items: T[]')
    expect(p.isRest).toBe(true)
  })

  it('parses destructured with defaults', () => {
    const p = parseParameter('{ x = 0, y = 0 }: Point')
    expect(p.isDestructured).toBe(true)
    expect(p.hasDefault).toBe(true)
  })

  it('handles empty string', () => {
    const p = parseParameter('')
    expect(p.name).toBeTruthy()
  })
})

// ─── extractSignatures ──────────────────────────────────

describe('extractSignatures', () => {
  it('extracts named function', () => {
    const sigs = extractSignatures('function hello(name: string): void {}', 'test.ts')
    expect(sigs.some((s) => s.name === 'hello')).toBe(true)
  })

  it('extracts async function', () => {
    const sigs = extractSignatures('async function fetch(url: string): Promise<void> {}', 'test.ts')
    expect(sigs.some((s) => s.isAsync)).toBe(true)
  })

  it('extracts exported function', () => {
    const sigs = extractSignatures('export function util(): void {}', 'test.ts')
    expect(sigs.some((s) => s.isExported)).toBe(true)
  })

  it('extracts arrow function', () => {
    const sigs = extractSignatures('const add = (a: number, b: number): number => a + b', 'test.ts')
    expect(sigs.some((s) => s.name === 'add')).toBe(true)
  })

  it('extracts async arrow function', () => {
    const sigs = extractSignatures('const load = async (url: string): Promise<string> => ""', 'test.ts')
    expect(sigs.some((s) => s.name === 'load' && s.isAsync)).toBe(true)
  })

  it('extracts generic function', () => {
    const sigs = extractSignatures('function identity<T>(val: T): T { return val }', 'test.ts')
    const sig = sigs.find((s) => s.name === 'identity')
    expect(sig).toBeTruthy()
    expect(sig!.isGeneric).toBe(true)
    expect(sig!.genericParams).toContain('T')
  })

  it('extracts method', () => {
    const content = 'class Foo {\n  bar(x: number): string { return "" }\n}'
    const sigs = extractSignatures(content, 'test.ts')
    expect(sigs.some((s) => s.name === 'bar')).toBe(true)
  })

  it('extracts parameters', () => {
    const sigs = extractSignatures('function foo(a: string, b: number, c?: boolean): void {}', 'test.ts')
    const sig = sigs.find((s) => s.name === 'foo')
    expect(sig!.parameters.length).toBe(3)
  })

  it('detects return type', () => {
    const sigs = extractSignatures('function compute(): number {}', 'test.ts')
    const sig = sigs.find((s) => s.name === 'compute')
    expect(sig!.returnType).toBe('number')
  })

  it('defaults return type to void', () => {
    const sigs = extractSignatures('function simple() {}', 'test.ts')
    const sig = sigs.find((s) => s.name === 'simple')
    expect(sig!.returnType).toBe('void')
  })

  it('sets line numbers', () => {
    const content = 'const a = 1\nfunction foo(): void {}'
    const sigs = extractSignatures(content, 'test.ts')
    expect(sigs[0].line).toBe(2)
  })

  it('returns empty for no functions', () => {
    expect(extractSignatures('const x = 1', 'test.ts')).toEqual([])
  })

  it('extracts exported arrow function', () => {
    const sigs = extractSignatures('export const fn = (x: number): string => ""', 'test.ts')
    expect(sigs.some((s) => s.name === 'fn' && s.isExported)).toBe(true)
  })

  it('extracts generic arrow function', () => {
    const sigs = extractSignatures('const id = <T>(val: T): T => val', 'test.ts')
    expect(sigs.some((s) => s.name === 'id' && s.isGeneric)).toBe(true)
  })

  it('extracts method with visibility', () => {
    const content = 'class Svc {\n  public async handle(req: Request): Promise<Response> { throw "" }\n}'
    const sigs = extractSignatures(content, 'test.ts')
    expect(sigs.some((s) => s.name === 'handle' && s.isAsync)).toBe(true)
  })
})

// ─── computeSignatureComplexity ──────────────────────────

describe('computeSignatureComplexity', () => {
  it('counts params', () => {
    const sig = makeSig({ parameters: [makeParam(), makeParam(), makeParam()] })
    expect(computeSignatureComplexity(sig)).toBe(3)
  })

  it('adds 2 for destructuring', () => {
    const sig = makeSig({ parameters: [makeParam({ isDestructured: true })] })
    expect(computeSignatureComplexity(sig)).toBe(3)
  })

  it('adds 1 for generic', () => {
    const sig = makeSig({ isGeneric: true })
    expect(computeSignatureComplexity(sig)).toBe(2)
  })

  it('adds 1 for rest', () => {
    const sig = makeSig({ hasRestParams: true, parameters: [makeParam({ isRest: true })] })
    expect(computeSignatureComplexity(sig)).toBe(2)
  })

  it('adds 1 for async', () => {
    const sig = makeSig({ isAsync: true })
    expect(computeSignatureComplexity(sig)).toBe(2)
  })

  it('combines all factors', () => {
    const sig = makeSig({
      isAsync: true,
      isGeneric: true,
      hasRestParams: true,
      parameters: [
        makeParam(),
        makeParam({ isDestructured: true }),
        makeParam({ isRest: true }),
      ],
    })
    expect(computeSignatureComplexity(sig)).toBe(3 + 2 + 1 + 1 + 1)
  })
})

// ─── generateSignatureSuggestions ────────────────────────

describe('generateSignatureSuggestions', () => {
  it('suggests options object for >5 params', () => {
    const sig = makeSig({ parameters: Array.from({ length: 6 }, () => makeParam()) })
    const suggestions = generateSignatureSuggestions(sig)
    expect(suggestions.some((s) => s.includes('options object'))).toBe(true)
  })

  it('suggests interface for destructured >3 keys', () => {
    const sig = makeSig({
      parameters: [makeParam({ isDestructured: true, destructuredKeys: ['a', 'b', 'c', 'd'] })],
    })
    const suggestions = generateSignatureSuggestions(sig)
    expect(suggestions.some((s) => s.includes('interface'))).toBe(true)
  })

  it('suggests simplifying >3 generics', () => {
    const sig = makeSig({ genericParams: ['A', 'B', 'C', 'D'] })
    const suggestions = generateSignatureSuggestions(sig)
    expect(suggestions.some((s) => s.includes('Simplify'))).toBe(true)
  })

  it('suggests options for multiple booleans', () => {
    const sig = makeSig({
      parameters: [makeParam({ type: 'boolean' }), makeParam({ type: 'boolean' })],
    })
    const suggestions = generateSignatureSuggestions(sig)
    expect(suggestions.some((s) => s.includes('booleans'))).toBe(true)
  })

  it('returns empty for simple signatures', () => {
    const sig = makeSig({ parameters: [makeParam()] })
    expect(generateSignatureSuggestions(sig)).toEqual([])
  })
})

// ─── computeSignatureStats ──────────────────────────────

describe('computeSignatureStats', () => {
  it('counts total functions', () => {
    const stats = computeSignatureStats([makeSig(), makeSig()])
    expect(stats.totalFunctions).toBe(2)
  })

  it('counts exported functions', () => {
    const stats = computeSignatureStats([makeSig({ isExported: true }), makeSig({ isExported: false })])
    expect(stats.exportedFunctions).toBe(1)
  })

  it('counts async functions', () => {
    const stats = computeSignatureStats([makeSig({ isAsync: true }), makeSig()])
    expect(stats.asyncFunctions).toBe(1)
  })

  it('counts generic functions', () => {
    const stats = computeSignatureStats([makeSig({ isGeneric: true })])
    expect(stats.genericFunctions).toBe(1)
  })

  it('computes avgParamCount', () => {
    const stats = computeSignatureStats([
      makeSig({ parameters: [makeParam(), makeParam()] }),
      makeSig({ parameters: [makeParam(), makeParam(), makeParam(), makeParam()] }),
    ])
    expect(stats.avgParamCount).toBe(3)
  })

  it('computes maxParamCount', () => {
    const stats = computeSignatureStats([
      makeSig({ parameters: [makeParam()] }),
      makeSig({ parameters: [makeParam(), makeParam(), makeParam()] }),
    ])
    expect(stats.maxParamCount).toBe(3)
  })

  it('counts complex signatures', () => {
    const stats = computeSignatureStats([makeSig({ complexity: 7 }), makeSig({ complexity: 2 })])
    expect(stats.complexSignatures).toBe(1)
  })

  it('computes param distribution', () => {
    const stats = computeSignatureStats([
      makeSig({ parameters: [makeParam()] }),
      makeSig({ parameters: [makeParam()] }),
      makeSig({ parameters: [makeParam(), makeParam()] }),
    ])
    expect(stats.paramDistribution['1']).toBe(2)
    expect(stats.paramDistribution['2']).toBe(1)
  })

  it('counts rest params', () => {
    const stats = computeSignatureStats([makeSig({ hasRestParams: true, parameters: [makeParam({ isRest: true })] })])
    expect(stats.functionsWithRestParams).toBe(1)
  })

  it('counts destructuring', () => {
    const stats = computeSignatureStats([makeSig({ hasDestructuring: true, parameters: [makeParam({ isDestructured: true })] })])
    expect(stats.functionsWithDestructuring).toBe(1)
  })

  it('handles empty list', () => {
    const stats = computeSignatureStats([])
    expect(stats.totalFunctions).toBe(0)
    expect(stats.avgParamCount).toBe(0)
    expect(stats.maxParamCount).toBe(0)
  })
})

// ─── buildSignaturesResult ──────────────────────────────

describe('buildSignaturesResult', () => {
  it('returns signatures and stats', async () => {
    const reader = async () => 'function hello(name: string): void {}'
    const result = await buildSignaturesResult(['test.ts'], reader)
    expect(result.signatures.length).toBeGreaterThanOrEqual(1)
    expect(result.stats.totalFunctions).toBeGreaterThanOrEqual(1)
  })

  it('sorts by name', async () => {
    const reader = async () => 'function beta(): void {}\nfunction alpha(): void {}'
    const result = await buildSignaturesResult(['test.ts'], reader, { sort: 'name' })
    expect(result.signatures[0].name).toBe('alpha')
  })

  it('sorts by complexity', async () => {
    const reader = async () => 'function simple(x: number): void {}\nfunction complex(a: string, b: number, c: boolean, d: object, e: any, f: any): void {}'
    const result = await buildSignaturesResult(['test.ts'], reader, { sort: 'complexity' })
    expect(result.signatures[0].name).toBe('complex')
  })

  it('sorts by params', async () => {
    const reader = async () => 'function one(x: number): void {}\nfunction three(a: string, b: number, c: boolean): void {}'
    const result = await buildSignaturesResult(['test.ts'], reader, { sort: 'params' })
    expect(result.signatures[0].name).toBe('three')
  })

  it('skips unreadable files', async () => {
    const reader = async () => { throw new Error('nope') }
    const result = await buildSignaturesResult(['test.ts'], reader)
    expect(result.signatures).toEqual([])
    expect(result.stats.totalFunctions).toBe(0)
  })

  it('defaults sort to name', async () => {
    const reader = async () => 'function hello(): void {}'
    const result = await buildSignaturesResult(['test.ts'], reader)
    expect(result.signatures[0].name).toBe('hello')
  })
})

// ─── sourceBaseName ─────────────────────────────────────

describe('sourceBaseName', () => {
  it('strips .ts', () => {
    expect(sourceBaseName('src/signatures-helpers.ts')).toBe('signatures-helpers')
  })
})

// ─── complexityBadge ────────────────────────────────────

describe('complexityBadge', () => {
  it('shows green for low', () => {
    expect(complexityBadge(1)).toContain('1')
  })

  it('shows orange for medium', () => {
    expect(complexityBadge(4)).toContain('4')
  })

  it('shows red for high', () => {
    expect(complexityBadge(7)).toContain('7')
  })
})

// ─── formatSignature ────────────────────────────────────

describe('formatSignature', () => {
  it('renders name', () => {
    const result = formatSignature(makeSig({ name: 'hello' }))
    expect(result).toContain('hello')
  })

  it('renders return type', () => {
    const result = formatSignature(makeSig({ returnType: 'number' }))
    expect(result).toContain('number')
  })

  it('renders export modifier', () => {
    const result = formatSignature(makeSig({ isExported: true }))
    expect(result).toContain('export')
  })

  it('renders async modifier', () => {
    const result = formatSignature(makeSig({ isAsync: true }))
    expect(result).toContain('async')
  })

  it('renders generic modifier', () => {
    const result = formatSignature(makeSig({ isGeneric: true }))
    expect(result).toContain('generic')
  })
})

// ─── formatSignatures ───────────────────────────────────

describe('formatSignatures', () => {
  it('shows no signatures message for empty', () => {
    const result = formatSignatures([])
    expect(result).toContain('No signatures')
  })

  it('renders signature list', () => {
    const result = formatSignatures([makeSig({ name: 'foo' }), makeSig({ name: 'bar' })])
    expect(result).toContain('foo')
    expect(result).toContain('bar')
  })

  it('renders suggestions', () => {
    const result = formatSignatures([makeSig({ suggestions: ['Use options'] })])
    expect(result).toContain('Use options')
  })
})

// ─── formatSignatureStats ───────────────────────────────

describe('formatSignatureStats', () => {
  it('renders total functions', () => {
    const result = formatSignatureStats(makeStats({ totalFunctions: 42 }))
    expect(result).toContain('42')
  })

  it('renders all fields', () => {
    const result = formatSignatureStats(makeStats())
    expect(result).toContain('Total Functions')
    expect(result).toContain('Exported')
    expect(result).toContain('Async')
    expect(result).toContain('Generic')
    expect(result).toContain('Avg Params')
    expect(result).toContain('Max Params')
    expect(result).toContain('Complex')
  })
})

// ─── formatParamDistribution ────────────────────────────

describe('formatParamDistribution', () => {
  it('returns empty for no data', () => {
    expect(formatParamDistribution({})).toBe('')
  })

  it('renders distribution bars', () => {
    const result = formatParamDistribution({ '1': 10, '2': 5 })
    expect(result).toContain('1 params')
    expect(result).toContain('2 params')
  })

  it('shows count', () => {
    const result = formatParamDistribution({ '0': 7 })
    expect(result).toContain('7')
  })
})

// ─── formatSignaturesTable ──────────────────────────────

describe('formatSignaturesTable', () => {
  it('renders header', () => {
    const result = formatSignaturesTable([makeSig()], makeStats())
    expect(result).toContain('Signature Analysis')
  })

  it('renders signature', () => {
    const result = formatSignaturesTable([makeSig({ name: 'compute' })], makeStats())
    expect(result).toContain('compute')
  })

  it('renders stats', () => {
    const result = formatSignaturesTable([makeSig()], makeStats())
    expect(result).toContain('Statistics')
  })
})

// ─── formatSignaturesJson ───────────────────────────────

describe('formatSignaturesJson', () => {
  it('produces valid JSON', () => {
    const json = formatSignaturesJson([makeSig()], makeStats())
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('includes signatures', () => {
    const parsed = JSON.parse(formatSignaturesJson([makeSig({ name: 'hello' })], makeStats()))
    expect(parsed.signatures[0].name).toBe('hello')
  })

  it('includes stats', () => {
    const parsed = JSON.parse(formatSignaturesJson([makeSig()], makeStats({ totalFunctions: 5 })))
    expect(parsed.stats.totalFunctions).toBe(5)
  })
})
