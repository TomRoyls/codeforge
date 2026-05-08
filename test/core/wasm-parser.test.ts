import { describe, it, expect, beforeEach } from 'vitest'
import { WasmParser } from '../../src/core/wasm-parser/wasm-parser.js'
import { DEFAULT_WASM_CONFIG } from '../../src/core/wasm-parser/types.js'
import type { WasmParserConfig, WasmParseResult } from '../../src/core/wasm-parser/types.js'

describe('WasmParser', () => {
  let parser: WasmParser

  beforeEach(() => {
    parser = new WasmParser()
  })

  describe('constructor', () => {
    it('should create parser with default config', () => {
      const p = new WasmParser()
      expect(p).toBeInstanceOf(WasmParser)
      expect(p.getConfig()).toEqual(DEFAULT_WASM_CONFIG)
    })

    it('should merge partial config with defaults', () => {
      const p = new WasmParser({ threads: 4 })
      const config = p.getConfig()
      expect(config.threads).toBe(4)
      expect(config.fallbackToNative).toBe(true)
    })

    it('should accept empty config object', () => {
      const p = new WasmParser({})
      expect(p).toBeInstanceOf(WasmParser)
    })

    it('should override wasmModulePath', () => {
      const p = new WasmParser({ wasmModulePath: '/custom/parser.wasm' })
      expect(p.getConfig().wasmModulePath).toBe('/custom/parser.wasm')
    })

    it('should override memoryLimit', () => {
      const p = new WasmParser({ memoryLimit: 512 * 1024 * 1024 })
      expect(p.getConfig().memoryLimit).toBe(512 * 1024 * 1024)
    })

    it('should override fallbackToNative', () => {
      const p = new WasmParser({ fallbackToNative: false })
      expect(p.getConfig().fallbackToNative).toBe(false)
    })
  })

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const result = await parser.initialize()
      expect(result).toBe(true)
    })

    it('should mark parser as available after init', async () => {
      expect(parser.isAvailable()).toBe(false)
      await parser.initialize()
      expect(parser.isAvailable()).toBe(true)
    })

    it('should return true on double initialization', async () => {
      await parser.initialize()
      const result = await parser.initialize()
      expect(result).toBe(true)
    })

    it('should set version after init', async () => {
      await parser.initialize()
      expect(parser.getVersion()).toBe('0.1.0')
    })
  })

  describe('parse', () => {
    it('should parse source code and return success', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'test.ts')
      expect(result.success).toBe(true)
    })

    it('should return AST with Program type', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'test.ts')
      const ast = result.ast as { type: string }
      expect(ast.type).toBe('Program')
    })

    it('should include duration in result', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'test.ts')
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should include memory usage in result', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'test.ts')
      expect(result.memoryUsed).toBeGreaterThan(0)
    })

    it('should return empty errors array on success', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'test.ts')
      expect(result.errors).toEqual([])
    })

    it('should auto-initialize if not yet initialized', async () => {
      expect(parser.isAvailable()).toBe(false)
      const result = await parser.parse('const x = 1;', 'test.ts')
      expect(result.success).toBe(true)
      expect(parser.isAvailable()).toBe(true)
    })

    it('should set fromWasm to false when fallbackToNative is true', async () => {
      const p = new WasmParser({ fallbackToNative: true })
      await p.initialize()
      const result = await p.parse('const x = 1;', 'test.ts')
      expect(result.fromWasm).toBe(false)
    })

    it('should set fromWasm to true when fallbackToNative is false', async () => {
      const p = new WasmParser({ fallbackToNative: false })
      await p.initialize()
      const result = await p.parse('const x = 1;', 'test.ts')
      expect(result.fromWasm).toBe(true)
    })

    it('should fail when source exceeds memory limit', async () => {
      const p = new WasmParser({ memoryLimit: 10 })
      await p.initialize()
      const result = await p.parse('a very long string that exceeds the memory limit of 10 bytes', 'test.ts')
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle multi-line source', async () => {
      await parser.initialize()
      const source = 'line1\nline2\nline3'
      const result = await parser.parse(source, 'test.ts')
      const ast = result.ast as { body: unknown[] }
      expect(ast.body.length).toBe(3)
    })

    it('should handle empty source', async () => {
      await parser.initialize()
      const result = await parser.parse('', 'test.ts')
      expect(result.success).toBe(true)
      const ast = result.ast as { body: unknown[] }
      expect(ast.body.length).toBe(1)
    })

    it('should include filePath in AST', async () => {
      await parser.initialize()
      const result = await parser.parse('const x = 1;', 'my-file.ts')
      const ast = result.ast as { source: string }
      expect(ast.source).toBe('my-file.ts')
    })
  })

  describe('isAvailable', () => {
    it('should return false before initialization', () => {
      expect(parser.isAvailable()).toBe(false)
    })

    it('should return true after initialization', async () => {
      await parser.initialize()
      expect(parser.isAvailable()).toBe(true)
    })

    it('should return false after termination', async () => {
      await parser.initialize()
      parser.terminate()
      expect(parser.isAvailable()).toBe(false)
    })
  })

  describe('getVersion', () => {
    it('should return 0.0.0 before initialization', () => {
      expect(parser.getVersion()).toBe('0.0.0')
    })

    it('should return version after initialization', async () => {
      await parser.initialize()
      expect(parser.getVersion()).toBe('0.1.0')
    })
  })

  describe('getMemoryUsage', () => {
    it('should return 0 before initialization', () => {
      expect(parser.getMemoryUsage()).toBe(0)
    })

    it('should return memory size after initialization', async () => {
      await parser.initialize()
      expect(parser.getMemoryUsage()).toBeGreaterThan(0)
    })
  })

  describe('terminate', () => {
    it('should reset loaded state', async () => {
      await parser.initialize()
      expect(parser.isAvailable()).toBe(true)
      parser.terminate()
      expect(parser.isAvailable()).toBe(false)
    })

    it('should be safe to call multiple times', async () => {
      await parser.initialize()
      parser.terminate()
      parser.terminate()
      expect(parser.isAvailable()).toBe(false)
    })
  })

  describe('getConfig', () => {
    it('should return a copy of config', () => {
      const config1 = parser.getConfig()
      const config2 = parser.getConfig()
      expect(config1).toEqual(config2)
      expect(config1).not.toBe(config2)
    })

    it('should reflect merged config', () => {
      const p = new WasmParser({ threads: 8 })
      const config = p.getConfig()
      expect(config.threads).toBe(8)
      expect(config.wasmModulePath).toBe('./parser.wasm')
    })
  })
})
