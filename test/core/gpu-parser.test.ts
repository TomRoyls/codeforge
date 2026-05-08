import { describe, it, expect, beforeEach } from 'vitest'
import { GPUParser } from '../../src/core/gpu-parser/gpu-parser.js'
import { DEFAULT_GPU_CONFIG } from '../../src/core/gpu-parser/types.js'
import type { GPUParserConfig, GPUParseResult, GPUDeviceInfo } from '../../src/core/gpu-parser/types.js'

describe('GPUParser', () => {
  let parser: GPUParser

  beforeEach(() => {
    parser = new GPUParser()
  })

  describe('constructor', () => {
    it('should create parser with default config', () => {
      const p = new GPUParser()
      expect(p).toBeInstanceOf(GPUParser)
      expect(p.getConfig()).toEqual(DEFAULT_GPU_CONFIG)
    })

    it('should merge partial config with defaults', () => {
      const p = new GPUParser({ deviceIndex: 2 })
      const config = p.getConfig()
      expect(config.deviceIndex).toBe(2)
      expect(config.backend).toBe('none')
    })

    it('should accept empty config object', () => {
      const p = new GPUParser({})
      expect(p).toBeInstanceOf(GPUParser)
    })

    it('should override backend', () => {
      const p = new GPUParser({ backend: 'cuda' })
      expect(p.getConfig().backend).toBe('cuda')
    })

    it('should override maxBatchSize', () => {
      const p = new GPUParser({ maxBatchSize: 500 })
      expect(p.getConfig().maxBatchSize).toBe(500)
    })

    it('should override enableProfiling', () => {
      const p = new GPUParser({ enableProfiling: true })
      expect(p.getConfig().enableProfiling).toBe(true)
    })
  })

  describe('initialize', () => {
    it('should return false with none backend', async () => {
      const p = new GPUParser({ backend: 'none' })
      const result = await p.initialize()
      expect(result).toBe(false)
    })

    it('should return true with webgpu backend', async () => {
      const p = new GPUParser({ backend: 'webgpu' })
      const result = await p.initialize()
      expect(result).toBe(true)
    })

    it('should return true with cuda backend', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      const result = await p.initialize()
      expect(result).toBe(true)
    })

    it('should return true with opencl backend', async () => {
      const p = new GPUParser({ backend: 'opencl' })
      const result = await p.initialize()
      expect(result).toBe(true)
    })

    it('should return true on double initialization', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const result = await p.initialize()
      expect(result).toBe(true)
    })

    it('should set device info after initialization', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      expect(p.getDeviceInfo()).toBeNull()
      await p.initialize()
      expect(p.getDeviceInfo()).not.toBeNull()
    })
  })

  describe('getDeviceInfo', () => {
    it('should return null before initialization', () => {
      expect(parser.getDeviceInfo()).toBeNull()
    })

    it('should return device info with none backend', async () => {
      const p = new GPUParser({ backend: 'none' })
      await p.initialize()
      const info = p.getDeviceInfo()
      expect(info).not.toBeNull()
      expect(info!.available).toBe(false)
      expect(info!.backend).toBe('none')
    })

    it('should return available device with cuda backend', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const info = p.getDeviceInfo()
      expect(info!.available).toBe(true)
      expect(info!.backend).toBe('cuda')
      expect(info!.computeUnits).toBe(64)
    })

    it('should return correct compute units for opencl', async () => {
      const p = new GPUParser({ backend: 'opencl' })
      await p.initialize()
      const info = p.getDeviceInfo()
      expect(info!.computeUnits).toBe(32)
    })

    it('should include device memory size', async () => {
      const p = new GPUParser({ backend: 'webgpu' })
      await p.initialize()
      const info = p.getDeviceInfo()
      expect(info!.memorySize).toBe(8 * 1024 * 1024 * 1024)
    })
  })

  describe('parseBatch', () => {
    it('should fail when no GPU available', async () => {
      const p = new GPUParser({ backend: 'none' })
      await p.initialize()
      const result = await p.parseBatch(['const x = 1;'], ['test.ts'])
      expect(result.success).toBe(false)
    })

    it('should parse batch successfully with GPU backend', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const result = await p.parseBatch(['const x = 1;', 'const y = 2;'], ['a.ts', 'b.ts'])
      expect(result.success).toBe(true)
      expect(result.batchSize).toBe(2)
    })

    it('should include gpuTime in result', async () => {
      const p = new GPUParser({ backend: 'webgpu' })
      await p.initialize()
      const result = await p.parseBatch(['code'], ['test.ts'])
      expect(result.gpuTime).toBeGreaterThanOrEqual(0)
    })

    it('should include transferTime in result', async () => {
      const p = new GPUParser({ backend: 'webgpu' })
      await p.initialize()
      const result = await p.parseBatch(['code'], ['test.ts'])
      expect(result.transferTime).toBeGreaterThanOrEqual(0)
    })

    it('should include memoryUsed in result', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const result = await p.parseBatch(['const x = 1;'], ['test.ts'])
      expect(result.memoryUsed).toBeGreaterThan(0)
    })

    it('should fail with mismatched array lengths', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const result = await p.parseBatch(['code1', 'code2'], ['file1.ts'])
      expect(result.success).toBe(false)
    })

    it('should fail when batch exceeds maxBatchSize', async () => {
      const p = new GPUParser({ backend: 'cuda', maxBatchSize: 2 })
      await p.initialize()
      const sources = ['a', 'b', 'c']
      const paths = ['a.ts', 'b.ts', 'c.ts']
      const result = await p.parseBatch(sources, paths)
      expect(result.success).toBe(false)
    })

    it('should return results array matching input size', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      const result = await p.parseBatch(['a', 'b', 'c'], ['a.ts', 'b.ts', 'c.ts'])
      expect(result.results.length).toBe(3)
    })

    it('should include duration in result', async () => {
      const p = new GPUParser({ backend: 'webgpu' })
      await p.initialize()
      const result = await p.parseBatch(['code'], ['test.ts'])
      expect(result.duration).toBeGreaterThanOrEqual(0)
    })

    it('should auto-initialize if not initialized', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      expect(p.isAvailable()).toBe(false)
      const result = await p.parseBatch(['code'], ['test.ts'])
      expect(p.isAvailable()).toBe(true)
      expect(result.success).toBe(true)
    })

    it('should update profiling data when enabled', async () => {
      const p = new GPUParser({ backend: 'cuda', enableProfiling: true })
      await p.initialize()
      await p.parseBatch(['code'], ['test.ts'])
      const profiling = p.getProfilingData()
      expect(profiling.kernelTime).toBeGreaterThan(0)
      expect(profiling.transferTime).toBeGreaterThan(0)
    })

    it('should not update profiling data when disabled', async () => {
      const p = new GPUParser({ backend: 'cuda', enableProfiling: false })
      await p.initialize()
      await p.parseBatch(['code'], ['test.ts'])
      const profiling = p.getProfilingData()
      expect(profiling.kernelTime).toBe(0)
      expect(profiling.transferTime).toBe(0)
    })
  })

  describe('isAvailable', () => {
    it('should return false before initialization', () => {
      expect(parser.isAvailable()).toBe(false)
    })

    it('should return false with none backend', async () => {
      const p = new GPUParser({ backend: 'none' })
      await p.initialize()
      expect(p.isAvailable()).toBe(false)
    })

    it('should return true with cuda backend after init', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      expect(p.isAvailable()).toBe(true)
    })

    it('should return false after release', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      p.release()
      expect(p.isAvailable()).toBe(false)
    })
  })

  describe('getBackend', () => {
    it('should return configured backend', () => {
      const p = new GPUParser({ backend: 'cuda' })
      expect(p.getBackend()).toBe('cuda')
    })

    it('should return none by default', () => {
      expect(parser.getBackend()).toBe('none')
    })
  })

  describe('getProfilingData', () => {
    it('should return zeros before any profiling', () => {
      const data = parser.getProfilingData()
      expect(data).toEqual({ kernelTime: 0, transferTime: 0, totalTime: 0 })
    })

    it('should return a copy', () => {
      const data1 = parser.getProfilingData()
      const data2 = parser.getProfilingData()
      expect(data1).toEqual(data2)
      expect(data1).not.toBe(data2)
    })
  })

  describe('release', () => {
    it('should reset initialized state', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      p.release()
      expect(p.isAvailable()).toBe(false)
      expect(p.getDeviceInfo()).toBeNull()
    })

    it('should reset profiling data', async () => {
      const p = new GPUParser({ backend: 'cuda', enableProfiling: true })
      await p.initialize()
      await p.parseBatch(['code'], ['test.ts'])
      p.release()
      const data = p.getProfilingData()
      expect(data).toEqual({ kernelTime: 0, transferTime: 0, totalTime: 0 })
    })

    it('should be safe to call multiple times', async () => {
      const p = new GPUParser({ backend: 'cuda' })
      await p.initialize()
      p.release()
      p.release()
      expect(p.isAvailable()).toBe(false)
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
      const p = new GPUParser({ backend: 'webgpu', deviceIndex: 1 })
      const config = p.getConfig()
      expect(config.backend).toBe('webgpu')
      expect(config.deviceIndex).toBe(1)
      expect(config.maxBatchSize).toBe(1000)
    })
  })
})
