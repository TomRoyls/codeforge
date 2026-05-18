import { describe, expect, it } from 'vitest'

import { WasmParser } from '../src/core/wasm-parser/wasm-parser.js'
import { DEFAULT_WASM_CONFIG } from '../src/core/wasm-parser/types.js'

// ─── Construction ────────────────────────────────────────
describe('WasmParser construction', () => {
  it('creates parser with default config', () => {
    const parser = new WasmParser()
    expect(parser.isAvailable()).toBe(false)
    expect(parser.getConfig()).toEqual(DEFAULT_WASM_CONFIG)
  })

  it('creates parser with custom config', () => {
    const parser = new WasmParser({ memoryLimit: 1024 })
    expect(parser.getConfig().memoryLimit).toBe(1024)
  })

  it('does not mutate default config', () => {
    new WasmParser({ memoryLimit: 512 })
    expect(DEFAULT_WASM_CONFIG.memoryLimit).toBe(256 * 1024 * 1024)
  })
})

// ─── Initialize ──────────────────────────────────────────
describe('WasmParser initialize', () => {
  it('initializes successfully', async () => {
    const parser = new WasmParser()
    const result = await parser.initialize()
    expect(result).toBe(true)
    expect(parser.isAvailable()).toBe(true)
  })

  it('returns true on re-initialization', async () => {
    const parser = new WasmParser()
    await parser.initialize()
    const result = await parser.initialize()
    expect(result).toBe(true)
  })
})

// ─── Parse ───────────────────────────────────────────────
describe('WasmParser parse', () => {
  it('parses source code', async () => {
    const parser = new WasmParser()
    const result = await parser.parse('const x = 1', 'test.ts')
    expect(result.success).toBe(true)
    expect(result.ast).toBeDefined()
    expect(result.errors).toHaveLength(0)
    expect(result.memoryUsed).toBeGreaterThan(0)
    expect(typeof result.duration).toBe('number')
  })

  it('auto-initializes if not loaded', async () => {
    const parser = new WasmParser()
    expect(parser.isAvailable()).toBe(false)
    const result = await parser.parse('hello', 'test.ts')
    expect(result.success).toBe(true)
    expect(parser.isAvailable()).toBe(true)
  })

  it('fails for source exceeding memory limit', async () => {
    const parser = new WasmParser({ memoryLimit: 10 })
    const result = await parser.parse('a'.repeat(100), 'test.ts')
    expect(result.success).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('splits source into lines in AST', async () => {
    const parser = new WasmParser()
    const result = await parser.parse('line1\nline2\nline3', 'test.ts')
    expect(result.success).toBe(true)
    const ast = result.ast as { body: Array<{ type: string; line: number; content: string }> }
    expect(ast.body).toHaveLength(3)
    expect(ast.body[0]!.line).toBe(1)
    expect(ast.body[2]!.line).toBe(3)
  })

  it('parses empty source', async () => {
    const parser = new WasmParser()
    const result = await parser.parse('', 'test.ts')
    expect(result.success).toBe(true)
  })
})

// ─── Version ─────────────────────────────────────────────
describe('WasmParser version', () => {
  it('returns 0.0.0 before initialization', () => {
    const parser = new WasmParser()
    expect(parser.getVersion()).toBe('0.0.0')
  })

  it('returns version after initialization', async () => {
    const parser = new WasmParser()
    await parser.initialize()
    expect(parser.getVersion()).toBe('0.1.0')
  })
})

// ─── Memory Usage ────────────────────────────────────────
describe('WasmParser memory usage', () => {
  it('returns 0 before initialization', () => {
    const parser = new WasmParser()
    expect(parser.getMemoryUsage()).toBe(0)
  })

  it('returns memory after initialization', async () => {
    const parser = new WasmParser()
    await parser.initialize()
    expect(parser.getMemoryUsage()).toBeGreaterThan(0)
  })
})

// ─── Terminate ───────────────────────────────────────────
describe('WasmParser terminate', () => {
  it('terminates and resets state', async () => {
    const parser = new WasmParser()
    await parser.initialize()
    expect(parser.isAvailable()).toBe(true)
    parser.terminate()
    expect(parser.isAvailable()).toBe(false)
    expect(parser.getVersion()).toBe('0.0.0')
  })
})

// ─── getConfig ───────────────────────────────────────────
describe('WasmParser getConfig', () => {
  it('returns a copy of config', () => {
    const parser = new WasmParser()
    const config1 = parser.getConfig()
    const config2 = parser.getConfig()
    expect(config1).toEqual(config2)
    expect(config1).not.toBe(config2)
  })
})
