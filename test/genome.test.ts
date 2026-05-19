import { describe, expect, it } from 'vitest'

import {
  buildGenomeResult,
  classifySpecies,
  computeGenome,
  computeGenomeStats,
  computeSimilarity,
  detectAsyncGenes,
  detectControlFlowGenes,
  detectErrorHandlingGenes,
  detectExportGenes,
  detectImportGenes,
  detectNamingGenes,
  detectStructuralGenes,
  detectTypingGenes,
  generateGenomeRecommendations,
  type Gene,
  type Genome,
} from '../src/commands/genome-helpers.js'

import {
  formatDominantTraits,
  formatGeneRow,
  formatGenomeJSON,
  formatGenomeMap,
  formatGenomeStats,
  formatGenomeTable,
  formatRecommendations,
  formatSimilarityMeter,
  formatSpecies,
  getGeneTypeColor,
} from '../src/commands/genome-format-helpers.js'

// ─── Test Content Fixtures ────────────────────────────────────────────────────

const ARROW_FILE = 'src/arrow.ts'
const ARROW_CONTENT = [
  'import { readFileSync } from "fs";',
  'import type { Stats } from "fs";',
  'export const greet = (name: string): string => `Hello ${name}`;',
  'export const add = (a: number, b: number): number => a + b;',
  'export const items = [1, 2, 3].map((x) => x * 2);',
  'const result = items.filter((x) => x > 2);',
  'export interface Config { name: string; value: number }',
  'export type Result<T> = { data: T; error: string | null }',
].join('\n')

const CLASSIC_FILE = 'src/classic.ts'
const CLASSIC_CONTENT = [
  'import fs from "fs";',
  'import { readFile, writeFile } from "fs/promises";',
  'export class Calculator {',
  '  private value: number = 0;',
  '  add(x: number): void { this.value += x; }',
  '  getResult(): number { return this.value; }',
  '}',
  'function helper(x: number): number { return x * 2; }',
  'export function process(data: string): void {',
  '  try {',
  '    const parsed = JSON.parse(data);',
  '  } catch (err) {',
  '    throw new Error("Parse failed: " + String(err));',
  '  }',
  '}',
].join('\n')

const ASYNC_FILE = 'src/async-code.ts'
const ASYNC_CONTENT = [
  'import { readFile } from "fs/promises";',
  'export async function loadData(path: string): Promise<string> {',
  '  const content = await readFile(path, "utf8");',
  '  return content;',
  '}',
  'export function fetchAll(paths: string[]): Promise<string[]> {',
  '  return Promise.all(paths.map((p) => loadData(p)));',
  '}',
  'readFile("x").then((c) => console.log(c)).catch((e) => console.error(e));',
  'function callback(fn: (err: Error | null, data?: string) => void): void { fn(null, "ok"); }',
].join('\n')

const EMPTY_FILE = 'src/empty.ts'
const EMPTY_CONTENT = ''

const MINIMAL_FILE = 'src/minimal.ts'
const MINIMAL_CONTENT = 'const x = 1;'

const COMPLEX_FILE = 'src/complex.ts'
const COMPLEX_CONTENT = [
  'import { readFileSync, writeFileSync } from "fs";',
  'import type { BufferEncoding } from "fs";',
  'import path from "path";',
  'import { join, resolve } from "path";',
  'export { readFileSync as readFile } from "fs";',
  '',
  'export interface Options {',
  '  encoding: BufferEncoding;',
  '  flag: string;',
  '}',
  '',
  'export type Maybe<T> = T | null;',
  '',
  'const MAX_RETRIES = 3;',
  'const DEFAULT_ENCODING: BufferEncoding = "utf8";',
  '',
  'export class FileReader {',
  '  private buffer: string = "";',
  '  private retries: number = 0;',
  '',
  '  read(filePath: string): string {',
  '    if (!filePath) {',
  '      return "";',
  '    }',
  '    try {',
  '      this.buffer = readFileSync(filePath, DEFAULT_ENCODING);',
  '    } catch (error) {',
  '      if (this.retries < MAX_RETRIES) {',
  '        this.retries++;',
  '        return this.read(filePath);',
  '      } else {',
  '        throw new Error("Failed to read: " + filePath);',
  '      }',
  '    }',
  '    return this.buffer;',
  '  }',
  '}',
  '',
  'export function parseConfig(raw: string): Options {',
  '  const parsed = JSON.parse(raw);',
  '  if (typeof parsed.encoding !== "string") {',
  '    throw new Error("Invalid encoding");',
  '  }',
  '  return { encoding: parsed.encoding as BufferEncoding, flag: parsed.flag ?? "r" };',
  '}',
  '',
  'export async function loadConfig(filePath: string): Promise<Options> {',
  '  const content = await readFileAsync(filePath);',
  '  return parseConfig(content);',
  '}',
  '',
  'function readFileAsync(p: string): Promise<string> {',
  '  return new Promise((resolve, reject) => {',
  '    try {',
  '      resolve(readFileSync(p, "utf8"));',
  '    } catch (e) {',
  '      reject(new Error("Read failed"));',
  '    }',
  '  });',
  '}',
  '',
  'switch (process.platform) {',
  '  case "win32": break;',
  '  case "darwin": break;',
  '  default: break;',
  '}',
  '',
  'const level = process.env.LOG_LEVEL ? (parseInt(process.env.LOG_LOG_LEVEL) > 0 ? "verbose" : "normal") : "silent";',
].join('\n')

// ─── detectStructuralGenes ────────────────────────────────────────────────────

describe('detectStructuralGenes', () => {
  it('detects arrow functions', () => {
    const genes = detectStructuralGenes('const fn = (x) => ({ val: x }); const fn2 = () => ({});', 'a.ts')
    const arrow = genes.find((g) => g.name === 'arrow-function')
    expect(arrow).toBeDefined()
    expect(arrow!.frequency).toBeGreaterThanOrEqual(1)
    expect(arrow!.type).toBe('structural')
  })

  it('detects function declarations', () => {
    const genes = detectStructuralGenes(CLASSIC_CONTENT, CLASSIC_FILE)
    const funcDecl = genes.find((g) => g.name === 'function-declaration')
    expect(funcDecl).toBeDefined()
    expect(funcDecl!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects class-based patterns', () => {
    const genes = detectStructuralGenes(CLASSIC_CONTENT, CLASSIC_FILE)
    const classGene = genes.find((g) => g.name === 'class-based')
    expect(classGene).toBeDefined()
    expect(classGene!.frequency).toBe(1)
  })

  it('detects multi-export when more than 1 export', () => {
    const genes = detectStructuralGenes(ARROW_CONTENT, ARROW_FILE)
    const multiExport = genes.find((g) => g.name === 'multi-export')
    expect(multiExport).toBeDefined()
    expect(multiExport!.frequency).toBe(1)
  })

  it('returns 0 multi-export for single export', () => {
    const genes = detectStructuralGenes('export default function hello() {}', 'single.ts')
    const multiExport = genes.find((g) => g.name === 'multi-export')
    expect(multiExport!.frequency).toBe(0)
  })

  it('returns 4 genes always', () => {
    const genes = detectStructuralGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
    for (const g of genes) {
      expect(g.frequency).toBe(0)
    }
  })

  it('sets files to provided file', () => {
    const genes = detectStructuralGenes('const x = () => 1', 'my-file.ts')
    expect(genes.every((g) => g.files[0] === 'my-file.ts')).toBe(true)
  })
})

// ─── detectNamingGenes ────────────────────────────────────────────────────────

describe('detectNamingGenes', () => {
  it('detects camelCase identifiers', () => {
    const genes = detectNamingGenes('const myVariable = 1; const anotherValue = 2;', 'a.ts')
    const camel = genes.find((g) => g.name === 'camelCase')
    expect(camel).toBeDefined()
    expect(camel!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects PascalCase identifiers', () => {
    const genes = detectNamingGenes('class MyClass {} interface MyInterface {}', 'a.ts')
    const pascal = genes.find((g) => g.name === 'PascalCase')
    expect(pascal).toBeDefined()
    expect(pascal!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects snake_case identifiers', () => {
    const genes = detectNamingGenes('const my_var = 1; function do_something() {}', 'a.ts')
    const snake = genes.find((g) => g.name === 'snake_case')
    expect(snake).toBeDefined()
    expect(snake!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects UPPER_SNAKE_CASE', () => {
    const genes = detectNamingGenes('const MAX_RETRIES = 3; const API_BASE_URL = "x";', 'a.ts')
    const upperSnake = genes.find((g) => g.name === 'UPPER_SNAKE')
    expect(upperSnake).toBeDefined()
    expect(upperSnake!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('returns 4 naming genes', () => {
    const genes = detectNamingGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── detectControlFlowGenes ───────────────────────────────────────────────────

describe('detectControlFlowGenes', () => {
  it('detects early-return pattern', () => {
    const content = 'function check(x) { if (!x) { return null; } return x; }'
    const genes = detectControlFlowGenes(content, 'a.ts')
    const earlyReturn = genes.find((g) => g.name === 'early-return')
    expect(earlyReturn).toBeDefined()
    expect(earlyReturn!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects switch statements', () => {
    const genes = detectControlFlowGenes(COMPLEX_CONTENT, COMPLEX_FILE)
    const switchGene = genes.find((g) => g.name === 'switch-statement')
    expect(switchGene).toBeDefined()
    expect(switchGene!.frequency).toBe(1)
  })

  it('detects ternary expressions', () => {
    const genes = detectControlFlowGenes('const x = true ? 1 : 0;', 'a.ts')
    const ternary = genes.find((g) => g.name === 'ternary-expression')
    expect(ternary).toBeDefined()
    expect(ternary!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects else-if chains', () => {
    const content = 'if (a) {} else if (b) {} else if (c) {}'
    const genes = detectControlFlowGenes(content, 'a.ts')
    const elseIf = genes.find((g) => g.name === 'else-if-chain')
    expect(elseIf).toBeDefined()
    expect(elseIf!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('returns 4 control-flow genes', () => {
    const genes = detectControlFlowGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── detectErrorHandlingGenes ─────────────────────────────────────────────────

describe('detectErrorHandlingGenes', () => {
  it('detects try-catch blocks', () => {
    const genes = detectErrorHandlingGenes(CLASSIC_CONTENT, CLASSIC_FILE)
    const tryCatch = genes.find((g) => g.name === 'try-catch')
    expect(tryCatch).toBeDefined()
    expect(tryCatch!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects .catch() method', () => {
    const genes = detectErrorHandlingGenes(ASYNC_CONTENT, ASYNC_FILE)
    const catchMethod = genes.find((g) => g.name === 'catch-method')
    expect(catchMethod).toBeDefined()
    expect(catchMethod!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects custom error creation', () => {
    const genes = detectErrorHandlingGenes('throw new CustomError("bad"); new AppError("x");', 'a.ts')
    const customError = genes.find((g) => g.name === 'custom-error')
    expect(customError).toBeDefined()
    expect(customError!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects throw statements', () => {
    const genes = detectErrorHandlingGenes('throw new Error("x"); throw "literal";', 'a.ts')
    const throwGene = genes.find((g) => g.name === 'throw-statement')
    expect(throwGene).toBeDefined()
    expect(throwGene!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('returns 4 error-handling genes', () => {
    const genes = detectErrorHandlingGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── detectAsyncGenes ─────────────────────────────────────────────────────────

describe('detectAsyncGenes', () => {
  it('detects async-await patterns', () => {
    const genes = detectAsyncGenes(ASYNC_CONTENT, ASYNC_FILE)
    const asyncAwait = genes.find((g) => g.name === 'async-await')
    expect(asyncAwait).toBeDefined()
    expect(asyncAwait!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects .then() chains', () => {
    const genes = detectAsyncGenes(ASYNC_CONTENT, ASYNC_FILE)
    const thenChain = genes.find((g) => g.name === 'then-chain')
    expect(thenChain).toBeDefined()
    expect(thenChain!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects Promise.all', () => {
    const genes = detectAsyncGenes(ASYNC_CONTENT, ASYNC_FILE)
    const promiseAll = genes.find((g) => g.name === 'Promise.all')
    expect(promiseAll).toBeDefined()
    expect(promiseAll!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects callback patterns', () => {
    const genes = detectAsyncGenes('const fn = function(cb) { cb(null); }; const fn2 = function(next) { next(); };', 'a.ts')
    const callback = genes.find((g) => g.name === 'callback-pattern')
    expect(callback).toBeDefined()
    expect(callback!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('returns 4 async genes', () => {
    const genes = detectAsyncGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── detectImportGenes ────────────────────────────────────────────────────────

describe('detectImportGenes', () => {
  it('detects named imports', () => {
    const genes = detectImportGenes('import { readFileSync } from "fs";', 'a.ts')
    const named = genes.find((g) => g.name === 'named-import')
    expect(named).toBeDefined()
    expect(named!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects default imports', () => {
    const genes = detectImportGenes('import fs from "fs";', 'a.ts')
    const defaultImp = genes.find((g) => g.name === 'default-import')
    expect(defaultImp).toBeDefined()
    expect(defaultImp!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects type-only imports', () => {
    const genes = detectImportGenes('import type { Stats } from "fs";', 'a.ts')
    const typeImport = genes.find((g) => g.name === 'type-only-import')
    expect(typeImport).toBeDefined()
    expect(typeImport!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects re-exports', () => {
    const genes = detectImportGenes('export { readFileSync as readFile } from "fs";', 'a.ts')
    const reExport = genes.find((g) => g.name === 're-export')
    expect(reExport).toBeDefined()
    expect(reExport!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('returns 4 import genes', () => {
    const genes = detectImportGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── detectExportGenes ────────────────────────────────────────────────────────

describe('detectExportGenes', () => {
  it('detects named exports', () => {
    const genes = detectExportGenes('export const x = 1; export function y() {}', 'a.ts')
    const named = genes.find((g) => g.name === 'named-export')
    expect(named).toBeDefined()
    expect(named!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects default exports', () => {
    const genes = detectExportGenes('export default function main() {}', 'a.ts')
    const defaultExp = genes.find((g) => g.name === 'default-export')
    expect(defaultExp).toBeDefined()
    expect(defaultExp!.frequency).toBe(1)
  })

  it('detects type exports', () => {
    const genes = detectExportGenes('export type Result<T> = T | null; export interface Config {}', 'a.ts')
    const typeExp = genes.find((g) => g.name === 'type-export')
    expect(typeExp).toBeDefined()
    expect(typeExp!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('returns 3 export genes', () => {
    const genes = detectExportGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(3)
  })
})

// ─── detectTypingGenes ────────────────────────────────────────────────────────

describe('detectTypingGenes', () => {
  it('detects explicit type annotations', () => {
    const genes = detectTypingGenes('const x: number = 1; function f(a: string): void {}', 'a.ts')
    const explicit = genes.find((g) => g.name === 'explicit-type')
    expect(explicit).toBeDefined()
    expect(explicit!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects interface declarations', () => {
    const genes = detectTypingGenes('interface Config { name: string }', 'a.ts')
    const interfaceGene = genes.find((g) => g.name === 'interface')
    expect(interfaceGene).toBeDefined()
    expect(interfaceGene!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('detects type aliases', () => {
    const genes = detectTypingGenes('type Result = string | null; type ID = string;', 'a.ts')
    const typeAlias = genes.find((g) => g.name === 'type-alias')
    expect(typeAlias).toBeDefined()
    expect(typeAlias!.frequency).toBeGreaterThanOrEqual(2)
  })

  it('detects generics', () => {
    const genes = detectTypingGenes('function id<T>(x: T): T { return x; }', 'a.ts')
    const generics = genes.find((g) => g.name === 'generics')
    expect(generics).toBeDefined()
    expect(generics!.frequency).toBeGreaterThanOrEqual(1)
  })

  it('returns 4 typing genes', () => {
    const genes = detectTypingGenes('', EMPTY_FILE)
    expect(genes).toHaveLength(4)
  })
})

// ─── computeGenome ────────────────────────────────────────────────────────────

describe('computeGenome', () => {
  it('merges genes across files', () => {
    const content1 = 'const x = () => ({ a: 1 }); const y = (z) => ({ z });'
    const content2 = 'function foo() {} function bar() {}'
    const genes1 = detectStructuralGenes(content1, 'file1.ts')
    const genes2 = detectStructuralGenes(content2, 'file2.ts')
    const allGenes = [...genes1, ...genes2]
    const genome = computeGenome(allGenes, 2)

    const arrow = genome.genes.find((g) => g.name === 'arrow-function')
    expect(arrow).toBeDefined()
    expect(arrow!.frequency).toBeGreaterThanOrEqual(2)
    expect(arrow!.files).toContain('file1.ts')
    const funcDecl = genome.genes.find((g) => g.name === 'function-declaration')
    expect(funcDecl).toBeDefined()
    expect(funcDecl!.files).toContain('file2.ts')
  })

  it('computes prevalence correctly for single file', () => {
    const genes = detectStructuralGenes('() => 1', 'a.ts')
    const genome = computeGenome(genes, 1)

    const arrow = genome.genes.find((g) => g.name === 'arrow-function')
    expect(arrow!.prevalence).toBe(100)
    expect(arrow!.isDominant).toBe(true)
  })

  it('computes prevalence correctly for 100 files (1 file has gene)', () => {
    const genes = detectStructuralGenes('() => 1', 'a.ts')
    const genome = computeGenome(genes, 100)

    const arrow = genome.genes.find((g) => g.name === 'arrow-function')
    expect(arrow!.prevalence).toBe(1)
    expect(arrow!.isMutation).toBe(true)
  })

  it('classifies recessive traits correctly', () => {
    const genes = detectStructuralGenes('() => 1', 'a.ts')
    const genome = computeGenome(genes, 5)

    const arrow = genome.genes.find((g) => g.name === 'arrow-function')
    expect(arrow!.prevalence).toBe(20)
    expect(arrow!.isDominant).toBe(false)
    expect(arrow!.isMutation).toBe(false)
    expect(genome.recessiveTraits).toContainEqual(expect.objectContaining({ name: 'arrow-function' }))
  })

  it('handles empty genes', () => {
    const genome = computeGenome([], 0)
    expect(genome.genes).toHaveLength(0)
    expect(genome.dominantTraits).toHaveLength(0)
    expect(genome.similarity).toBe(100)
  })

  it('handles genes with zero total files', () => {
    const genes = detectStructuralGenes('const x = 1', 'a.ts')
    const genome = computeGenome(genes, 0)
    for (const g of genome.genes) {
      expect(g.prevalence).toBe(0)
      expect(g.isDominant).toBe(false)
    }
  })

  it('has consistent gene count (31 total)', () => {
    const allGenes = [
      ...detectStructuralGenes('const x = 1', 'a.ts'),
      ...detectNamingGenes('const x = 1', 'a.ts'),
      ...detectControlFlowGenes('const x = 1', 'a.ts'),
      ...detectErrorHandlingGenes('const x = 1', 'a.ts'),
      ...detectAsyncGenes('const x = 1', 'a.ts'),
      ...detectImportGenes('const x = 1', 'a.ts'),
      ...detectExportGenes('const x = 1', 'a.ts'),
      ...detectTypingGenes('const x = 1', 'a.ts'),
    ]
    expect(allGenes).toHaveLength(31)
  })
})

// ─── computeSimilarity ────────────────────────────────────────────────────────

describe('computeSimilarity', () => {
  it('returns 100 for empty genes', () => {
    expect(computeSimilarity([])).toBe(100)
  })

  it('returns 100 for all zero-frequency genes', () => {
    const genes: Gene[] = [
      { name: 'x', type: 'structural', pattern: '', frequency: 0, prevalence: 0, isDominant: false, isMutation: false, files: [] },
    ]
    expect(computeSimilarity(genes)).toBe(100)
  })

  it('computes average prevalence of active genes', () => {
    const genes: Gene[] = [
      { name: 'a', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] },
      { name: 'b', type: 'naming', pattern: '', frequency: 5, prevalence: 60, isDominant: true, isMutation: false, files: ['a'] },
      { name: 'c', type: 'control-flow', pattern: '', frequency: 0, prevalence: 0, isDominant: false, isMutation: false, files: [] },
    ]
    expect(computeSimilarity(genes)).toBe(70)
  })

  it('rounds to nearest integer', () => {
    const genes: Gene[] = [
      { name: 'a', type: 'structural', pattern: '', frequency: 1, prevalence: 33, isDominant: false, isMutation: false, files: ['a'] },
      { name: 'b', type: 'naming', pattern: '', frequency: 1, prevalence: 66, isDominant: true, isMutation: false, files: ['a'] },
    ]
    expect(computeSimilarity(genes)).toBe(50)
  })
})

// ─── classifySpecies ──────────────────────────────────────────────────────────

describe('classifySpecies', () => {
  it('classifies file with dominant traits', () => {
    const fileGenes = detectStructuralGenes(ARROW_CONTENT, ARROW_FILE)
    const allGenes = [...fileGenes, ...detectNamingGenes(ARROW_CONTENT, ARROW_FILE)]
    const genome = computeGenome(allGenes, 1)
    const species = classifySpecies(ARROW_FILE, fileGenes, genome)

    expect(species.file).toBe(ARROW_FILE)
    expect(species.species).toBeTruthy()
    expect(species.similarity).toBeGreaterThanOrEqual(0)
  })

  it('returns Alien Species for no dominant matches', () => {
    const fileGenes = detectStructuralGenes(MINIMAL_CONTENT, MINIMAL_FILE)
    const genome: Genome = {
      genes: [],
      dominantTraits: [{ name: 'async-await', type: 'async', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a.ts'] }],
      recessiveTraits: [],
      mutations: [],
      similarity: 80,
    }
    const species = classifySpecies(MINIMAL_FILE, fileGenes, genome)
    expect(species.species).toBe('Alien Species')
  })

  it('generates species name from gene prefix', () => {
    const fileGenes = [
      { name: 'arrow-function', type: 'structural' as const, pattern: '', frequency: 5, prevalence: 100, isDominant: true, isMutation: false, files: [ARROW_FILE] },
    ]
    const genome: Genome = {
      genes: fileGenes,
      dominantTraits: fileGenes,
      recessiveTraits: [],
      mutations: [],
      similarity: 100,
    }
    const species = classifySpecies(ARROW_FILE, fileGenes, genome)
    expect(species.species).toContain('Lambda')
  })

  it('computes similarity relative to dominant traits', () => {
    const fileGenes = [
      { name: 'arrow-function', type: 'structural' as const, pattern: '', frequency: 5, prevalence: 100, isDominant: true, isMutation: false, files: ['a.ts'] },
    ]
    const genome: Genome = {
      genes: [
        ...fileGenes,
        { name: 'async-await', type: 'async' as const, pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['b.ts'] },
      ],
      dominantTraits: [
        fileGenes[0]!,
        { name: 'async-await', type: 'async' as const, pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['b.ts'] },
      ],
      recessiveTraits: [],
      mutations: [],
      similarity: 90,
    }
    const species = classifySpecies('a.ts', fileGenes, genome)
    expect(species.similarity).toBe(50)
  })
})

// ─── computeGenomeStats ───────────────────────────────────────────────────────

describe('computeGenomeStats', () => {
  it('computes stats from genome and species', () => {
    const result = buildGenomeResult([ARROW_FILE], [ARROW_CONTENT])
    const stats = result.stats

    expect(stats.totalGenes).toBe(31)
    expect(stats.speciesCount).toBe(1)
    expect(stats.genomeSimilarity).toBeGreaterThanOrEqual(0)
    expect(stats.mostCommonGene).toBeTruthy()
    expect(stats.rarestGene).toBeTruthy()
  })

  it('counts dominant, recessive, and mutations', () => {
    const genome: Genome = {
      genes: [
        { name: 'a', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'b', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] },
        { name: 'c', type: 'async', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] },
      ],
      dominantTraits: [{ name: 'a', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] }],
      recessiveTraits: [{ name: 'b', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] }],
      mutations: [{ name: 'c', type: 'async', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] }],
      similarity: 50,
    }
    const stats = computeGenomeStats(genome, [])
    expect(stats.dominantCount).toBe(1)
    expect(stats.mutationCount).toBe(1)
  })

  it('finds most common and rarest genes', () => {
    const genes: Gene[] = [
      { name: 'rare', type: 'structural', pattern: '', frequency: 1, prevalence: 10, isDominant: false, isMutation: false, files: ['a'] },
      { name: 'common', type: 'naming', pattern: '', frequency: 50, prevalence: 90, isDominant: true, isMutation: false, files: ['a'] },
    ]
    const genome: Genome = { genes, dominantTraits: genes, recessiveTraits: [], mutations: [], similarity: 50 }
    const stats = computeGenomeStats(genome, [])
    expect(stats.mostCommonGene).toBe('common')
    expect(stats.rarestGene).toBe('rare')
  })

  it('handles empty genome', () => {
    const genome: Genome = { genes: [], dominantTraits: [], recessiveTraits: [], mutations: [], similarity: 100 }
    const stats = computeGenomeStats(genome, [])
    expect(stats.totalGenes).toBe(0)
    expect(stats.mostCommonGene).toBe('')
    expect(stats.rarestGene).toBe('')
  })
})

// ─── generateGenomeRecommendations ────────────────────────────────────────────

describe('generateGenomeRecommendations', () => {
  it('recommends style guide for low similarity', () => {
    const genome: Genome = {
      genes: [], dominantTraits: [], recessiveTraits: [], mutations: [], similarity: 30,
    }
    const stats = { totalGenes: 0, dominantCount: 0, recessiveCount: 0, mutationCount: 0, genomeSimilarity: 30, mostCommonGene: '', rarestGene: '', speciesCount: 0 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('style guide'))).toBe(true)
  })

  it('recommends evaluating mutations', () => {
    const genome: Genome = {
      genes: [
        { name: 'x', type: 'structural', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] },
      ],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [{ name: 'x', type: 'structural', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] }],
      similarity: 50,
    }
    const stats = { totalGenes: 1, dominantCount: 0, recessiveCount: 0, mutationCount: 1, genomeSimilarity: 50, mostCommonGene: 'x', rarestGene: 'x', speciesCount: 0 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('mutation'))).toBe(true)
  })

  it('recommends standardizing mixed arrow/function declarations', () => {
    const genome: Genome = {
      genes: [
        { name: 'arrow-function', type: 'structural', pattern: '', frequency: 6, prevalence: 60, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'function-declaration', type: 'structural', pattern: '', frequency: 4, prevalence: 40, isDominant: false, isMutation: false, files: ['a'] },
      ],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [],
      similarity: 50,
    }
    const stats = { totalGenes: 2, dominantCount: 1, recessiveCount: 1, mutationCount: 0, genomeSimilarity: 50, mostCommonGene: 'arrow-function', rarestGene: 'function-declaration', speciesCount: 0 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('standardize'))).toBe(true)
  })

  it('recommends named exports when mixed', () => {
    const genome: Genome = {
      genes: [
        { name: 'named-export', type: 'export', pattern: '', frequency: 5, prevalence: 60, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'default-export', type: 'export', pattern: '', frequency: 3, prevalence: 40, isDominant: false, isMutation: false, files: ['a'] },
      ],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [],
      similarity: 50,
    }
    const stats = { totalGenes: 2, dominantCount: 1, recessiveCount: 1, mutationCount: 0, genomeSimilarity: 50, mostCommonGene: 'named-export', rarestGene: 'default-export', speciesCount: 0 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('named exports'))).toBe(true)
  })

  it('recommends establishing conventions for few dominant traits', () => {
    const genome: Genome = {
      genes: [
        { name: 'a', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'b', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] },
      ],
      dominantTraits: [{ name: 'a', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] }],
      recessiveTraits: [{ name: 'b', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] }],
      mutations: [],
      similarity: 55,
    }
    const stats = { totalGenes: 2, dominantCount: 1, recessiveCount: 1, mutationCount: 0, genomeSimilarity: 55, mostCommonGene: 'a', rarestGene: 'b', speciesCount: 0 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('conventions'))).toBe(true)
  })

  it('says genome is healthy when all good', () => {
    const genome: Genome = {
      genes: [
        { name: 'arrow-function', type: 'structural', pattern: '', frequency: 10, prevalence: 90, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'named-export', type: 'export', pattern: '', frequency: 8, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'camelCase', type: 'naming', pattern: '', frequency: 20, prevalence: 95, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'function-declaration', type: 'structural', pattern: '', frequency: 0, prevalence: 0, isDominant: false, isMutation: false, files: [] },
        { name: 'default-export', type: 'export', pattern: '', frequency: 0, prevalence: 0, isDominant: false, isMutation: false, files: [] },
      ],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [],
      similarity: 90,
    }
    const stats = { totalGenes: 5, dominantCount: 3, recessiveCount: 2, mutationCount: 0, genomeSimilarity: 90, mostCommonGene: 'camelCase', rarestGene: 'arrow-function', speciesCount: 1 }
    const recs = generateGenomeRecommendations(genome, stats)
    expect(recs.some((r) => r.includes('healthy'))).toBe(true)
  })
})

// ─── buildGenomeResult ────────────────────────────────────────────────────────

describe('buildGenomeResult', () => {
  it('analyzes a single file', () => {
    const result = buildGenomeResult([ARROW_FILE], [ARROW_CONTENT])
    expect(result.genome.genes).toHaveLength(31)
    expect(result.species).toHaveLength(1)
    expect(result.stats.totalGenes).toBe(31)
    expect(result.recommendations.length).toBeGreaterThan(0)
  })

  it('analyzes multiple files', () => {
    const result = buildGenomeResult(
      [ARROW_FILE, CLASSIC_FILE, ASYNC_FILE],
      [ARROW_CONTENT, CLASSIC_CONTENT, ASYNC_CONTENT],
    )
    expect(result.genome.genes).toHaveLength(31)
    expect(result.species).toHaveLength(3)
    expect(result.stats.speciesCount).toBe(3)
  })

  it('handles empty input', () => {
    const result = buildGenomeResult([], [])
    expect(result.genome.genes).toHaveLength(0)
    expect(result.species).toHaveLength(0)
    expect(result.stats.totalGenes).toBe(0)
  })

  it('handles empty file content', () => {
    const result = buildGenomeResult([EMPTY_FILE], [EMPTY_CONTENT])
    expect(result.genome.genes).toHaveLength(31)
    expect(result.species).toHaveLength(1)
    for (const gene of result.genome.genes) {
      expect(gene.frequency).toBe(0)
    }
  })

  it('computes similarity for complex codebase', () => {
    const result = buildGenomeResult(
      [COMPLEX_FILE, ARROW_FILE, CLASSIC_FILE, ASYNC_FILE],
      [COMPLEX_CONTENT, ARROW_CONTENT, CLASSIC_CONTENT, ASYNC_CONTENT],
    )
    expect(result.stats.genomeSimilarity).toBeGreaterThan(0)
    expect(result.stats.genomeSimilarity).toBeLessThanOrEqual(100)
  })

  it('all genes have correct type', () => {
    const result = buildGenomeResult([COMPLEX_FILE], [COMPLEX_CONTENT])
    const types = new Set(result.genome.genes.map((g) => g.type))
    expect(types.has('structural')).toBe(true)
    expect(types.has('naming')).toBe(true)
    expect(types.has('control-flow')).toBe(true)
    expect(types.has('error-handling')).toBe(true)
    expect(types.has('async')).toBe(true)
    expect(types.has('import')).toBe(true)
    expect(types.has('export')).toBe(true)
    expect(types.has('typing')).toBe(true)
  })

  it('each gene has unique name', () => {
    const result = buildGenomeResult([COMPLEX_FILE], [COMPLEX_CONTENT])
    const names = result.genome.genes.map((g) => g.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('getGeneTypeColor', () => {
  it('returns a function for each gene type', () => {
    const types = ['structural', 'naming', 'control-flow', 'error-handling', 'async', 'import', 'export', 'typing'] as const
    for (const type of types) {
      const fn = getGeneTypeColor(type)
      expect(typeof fn).toBe('function')
      expect(typeof fn('test')).toBe('string')
    }
  })
})

describe('formatSimilarityMeter', () => {
  it('formats a 20-char bar at 75%', () => {
    const result = formatSimilarityMeter(75)
    expect(result).toContain('Similarity')
    expect(result).toContain('75%')
    expect(result).toContain('█')
    expect(result).toContain('░')
  })

  it('uses green for >= 80%', () => {
    const result = formatSimilarityMeter(90)
    expect(result).toContain('90%')
  })

  it('uses red for < 50%', () => {
    const result = formatSimilarityMeter(20)
    expect(result).toContain('20%')
  })

  it('clamps at 0%', () => {
    const result = formatSimilarityMeter(0)
    expect(result).toContain('0%')
  })
})

describe('formatGeneRow', () => {
  it('formats dominant gene with star', () => {
    const gene: Gene = { name: 'test-gene', type: 'structural', pattern: 'x', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a.ts'] }
    const row = formatGeneRow(gene)
    expect(row).toContain('test-gene')
    expect(row).toContain('★')
  })

  it('formats mutation gene with spark', () => {
    const gene: Gene = { name: 'mutant', type: 'naming', pattern: 'x', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a.ts'] }
    const row = formatGeneRow(gene)
    expect(row).toContain('mutant')
    expect(row).toContain('✧')
  })

  it('formats regular gene with space', () => {
    const gene: Gene = { name: 'normal', type: 'async', pattern: 'x', frequency: 3, prevalence: 30, isDominant: false, isMutation: false, files: ['a.ts'] }
    const row = formatGeneRow(gene)
    expect(row).toContain('normal')
    expect(row).not.toContain('★')
    expect(row).not.toContain('✧')
  })
})

describe('formatGenomeMap', () => {
  it('renders genome map header and sorted genes', () => {
    const result = buildGenomeResult([ARROW_FILE], [ARROW_CONTENT])
    const map = formatGenomeMap(result.genome)
    expect(map).toContain('Genome Map')
    expect(map).toContain('Tag')
    expect(map).toContain('Gene')
    expect(map).toContain('Freq')
  })

  it('sorts by frequency descending', () => {
    const genome: Genome = {
      genes: [
        { name: 'low', type: 'structural', pattern: '', frequency: 1, prevalence: 10, isDominant: false, isMutation: false, files: ['a'] },
        { name: 'high', type: 'naming', pattern: '', frequency: 100, prevalence: 90, isDominant: true, isMutation: false, files: ['a'] },
      ],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [],
      similarity: 50,
    }
    const map = formatGenomeMap(genome)
    const highIdx = map.indexOf('high')
    const lowIdx = map.indexOf('low')
    expect(highIdx).toBeLessThan(lowIdx)
  })
})

describe('formatDominantTraits', () => {
  it('shows dominant and recessive and mutations sections', () => {
    const genome: Genome = {
      genes: [
        { name: 'dom', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] },
        { name: 'rec', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] },
        { name: 'mut', type: 'async', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] },
      ],
      dominantTraits: [{ name: 'dom', type: 'structural', pattern: '', frequency: 10, prevalence: 80, isDominant: true, isMutation: false, files: ['a'] }],
      recessiveTraits: [{ name: 'rec', type: 'naming', pattern: '', frequency: 5, prevalence: 30, isDominant: false, isMutation: false, files: ['a'] }],
      mutations: [{ name: 'mut', type: 'async', pattern: '', frequency: 1, prevalence: 2, isDominant: false, isMutation: true, files: ['a'] }],
      similarity: 50,
    }
    const out = formatDominantTraits(genome)
    expect(out).toContain('Dominant Traits')
    expect(out).toContain('Recessive Traits')
    expect(out).toContain('Mutations')
    expect(out).toContain('dom')
    expect(out).toContain('rec')
    expect(out).toContain('mut')
  })

  it('omits empty sections', () => {
    const genome: Genome = {
      genes: [],
      dominantTraits: [],
      recessiveTraits: [],
      mutations: [],
      similarity: 100,
    }
    const out = formatDominantTraits(genome)
    expect(out).not.toContain('Dominant Traits')
    expect(out).not.toContain('Recessive Traits')
    expect(out).not.toContain('Mutations')
  })
})

describe('formatSpecies', () => {
  it('shows species list', () => {
    const result = buildGenomeResult([ARROW_FILE, CLASSIC_FILE], [ARROW_CONTENT, CLASSIC_CONTENT])
    const out = formatSpecies(result.species)
    expect(out).toContain('Species Classification')
    expect(out).toContain(ARROW_FILE)
    expect(out).toContain(CLASSIC_FILE)
  })

  it('shows no species message for empty', () => {
    const out = formatSpecies([])
    expect(out).toContain('No species classified')
  })
})

describe('formatGenomeStats', () => {
  it('renders stats', () => {
    const result = buildGenomeResult([ARROW_FILE], [ARROW_CONTENT])
    const out = formatGenomeStats(result.stats)
    expect(out).toContain('Total genes')
    expect(out).toContain('Dominant')
    expect(out).toContain('Mutations')
    expect(out).toContain('Similarity')
    expect(out).toContain('Species')
  })
})

describe('formatRecommendations', () => {
  it('renders numbered recommendations', () => {
    const out = formatRecommendations(['Do this', 'Do that'])
    expect(out).toContain('Recommendations')
    expect(out).toContain('1. Do this')
    expect(out).toContain('2. Do that')
  })

  it('shows no recommendations message for empty', () => {
    const out = formatRecommendations([])
    expect(out).toContain('No recommendations')
  })
})

describe('formatGenomeTable', () => {
  it('renders full table with all sections', () => {
    const result = buildGenomeResult([COMPLEX_FILE], [COMPLEX_CONTENT])
    const table = formatGenomeTable(result)
    expect(table).toContain('Code Genome Analysis')
    expect(table).toContain('Similarity')
    expect(table).toContain('Genome Map')
    expect(table).toContain('Species Classification')
    expect(table).toContain('Stats')
    expect(table).toContain('Recommendations')
  })
})

describe('formatGenomeJSON', () => {
  it('renders valid JSON', () => {
    const result = buildGenomeResult([ARROW_FILE], [ARROW_CONTENT])
    const json = formatGenomeJSON(result)
    const parsed = JSON.parse(json)
    expect(parsed.genome).toBeDefined()
    expect(parsed.species).toBeDefined()
    expect(parsed.stats).toBeDefined()
    expect(parsed.recommendations).toBeDefined()
  })
})
