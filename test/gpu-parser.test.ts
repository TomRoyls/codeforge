import { describe, it, expect, beforeEach } from 'vitest'
import { GPUParser, DEFAULT_GPU_CONFIG } from '../src/core/gpu-parser/index.js'
import type { GPUParserConfig, GPUParseResult, GPUDeviceInfo, GPUBackend } from '../src/core/gpu-parser/index.js'

// ─── DEFAULT_GPU_CONFIG ───

describe('DEFAULT_GPU_CONFIG', () => {
  it('has expected defaults', () => {
    expect(DEFAULT_GPU_CONFIG.backend).toBe('none')
    expect(DEFAULT_GPU_CONFIG.deviceIndex).toBe(0)
    expect(DEFAULT_GPU_CONFIG.maxBatchSize).toBe(1000)
    expect(DEFAULT_GPU_CONFIG.enableProfiling).toBe(false)
  })
})

// ─── GPUParser - Construction ───

describe('GPUParser - Construction', () => {
  it('creates with default config', () => {
    const parser = new GPUParser()
    const config = parser.getConfig()
    expect(config.backend).toBe('none')
    expect(config.enableProfiling).toBe(false)
  })

  it('creates with custom backend', () => {
    const parser = new GPUParser({ backend: 'cuda' })
    expect(parser.getBackend()).toBe('cuda')
  })

  it('accepts partial config', () => {
    const parser = new GPUParser({ enableProfiling: true })
    expect(parser.getConfig().enableProfiling).toBe(true)
    expect(parser.getConfig().backend).toBe('none')
  })
})

// ─── GPUParser - Initialize ───

describe('GPUParser - Initialize', () => {
  it('returns false for none backend', async () => {
    const parser = new GPUParser({ backend: 'none' })
    const result = await parser.initialize()
    expect(result).toBe(false)
  })

  it('returns true for cuda backend', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    const result = await parser.initialize()
    expect(result).toBe(true)
  })

  it('returns true for webgpu backend', async () => {
    const parser = new GPUParser({ backend: 'webgpu' })
    const result = await parser.initialize()
    expect(result).toBe(true)
  })

  it('returns true on re-initialization', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    await parser.initialize()
    const result = await parser.initialize()
    expect(result).toBe(true)
  })
})

// ─── GPUParser - Device Info ───

describe('GPUParser - Device Info', () => {
  it('returns null before initialization', () => {
    const parser = new GPUParser()
    expect(parser.getDeviceInfo()).toBeNull()
  })

  it('returns device info for none backend', async () => {
    const parser = new GPUParser({ backend: 'none' })
    await parser.initialize()
    const info = parser.getDeviceInfo()
    expect(info).not.toBeNull()
    expect(info!.available).toBe(false)
    expect(info!.backend).toBe('none')
  })

  it('returns device info for cuda backend', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    await parser.initialize()
    const info = parser.getDeviceInfo()
    expect(info).not.toBeNull()
    expect(info!.available).toBe(true)
    expect(info!.backend).toBe('cuda')
    expect(info!.computeUnits).toBe(64)
    expect(info!.memorySize).toBe(8 * 1024 * 1024 * 1024)
  })

  it('returns different compute units for webgpu', async () => {
    const parser = new GPUParser({ backend: 'webgpu' })
    await parser.initialize()
    const info = parser.getDeviceInfo()
    expect(info!.computeUnits).toBe(32)
  })
})

// ─── GPUParser - isAvailable ───

describe('GPUParser - isAvailable', () => {
  it('returns false before initialization', () => {
    const parser = new GPUParser({ backend: 'cuda' })
    expect(parser.isAvailable()).toBe(false)
  })

  it('returns false for none backend', async () => {
    const parser = new GPUParser({ backend: 'none' })
    await parser.initialize()
    expect(parser.isAvailable()).toBe(false)
  })

  it('returns true for available backend', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    await parser.initialize()
    expect(parser.isAvailable()).toBe(true)
  })
})

// ─── GPUParser - parseBatch ───

describe('GPUParser - parseBatch', () => {
  it('returns failure for unavailable device', async () => {
    const parser = new GPUParser({ backend: 'none' })
    const result = await parser.parseBatch(['code'], ['file.ts'])
    expect(result.success).toBe(false)
    expect(result.results).toEqual([])
  })

  it('returns failure for mismatched array lengths', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    const result = await parser.parseBatch(['code'], ['a.ts', 'b.ts'])
    expect(result.success).toBe(false)
  })

  it('returns failure for oversized batch', async () => {
    const parser = new GPUParser({ backend: 'cuda', maxBatchSize: 2 })
    const sources = ['a', 'b', 'c']
    const paths = ['a.ts', 'b.ts', 'c.ts']
    const result = await parser.parseBatch(sources, paths)
    expect(result.success).toBe(false)
  })

  it('returns success for valid batch', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    const result = await parser.parseBatch(['let x = 1;'], ['test.ts'])
    expect(result.success).toBe(true)
    expect(result.batchSize).toBe(1)
    expect(result.results.length).toBe(1)
    expect(result.duration).toBeGreaterThanOrEqual(0)
    expect(result.gpuTime).toBeGreaterThan(0)
  })

  it('parses multiple sources', async () => {
    const parser = new GPUParser({ backend: 'webgpu' })
    const result = await parser.parseBatch(
      ['const a = 1;', 'const b = 2;'],
      ['a.ts', 'b.ts'],
    )
    expect(result.success).toBe(true)
    expect(result.batchSize).toBe(2)
    expect(result.results.length).toBe(2)
  })

  it('reports memory usage', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    const result = await parser.parseBatch(['hello world'], ['f.ts'])
    expect(result.memoryUsed).toBeGreaterThan(0)
  })
})

// ─── GPUParser - Profiling ───

describe('GPUParser - Profiling', () => {
  it('records profiling data when enabled', async () => {
    const parser = new GPUParser({ backend: 'cuda', enableProfiling: true })
    await parser.parseBatch(['code'], ['f.ts'])
    const profiling = parser.getProfilingData()
    expect(profiling.kernelTime).toBeGreaterThan(0)
    expect(profiling.transferTime).toBeGreaterThan(0)
    expect(profiling.totalTime).toBeGreaterThanOrEqual(0)
  })

  it('does not record profiling data when disabled', async () => {
    const parser = new GPUParser({ backend: 'cuda', enableProfiling: false })
    await parser.initialize()
    const profiling = parser.getProfilingData()
    expect(profiling.kernelTime).toBe(0)
    expect(profiling.transferTime).toBe(0)
  })
})

// ─── GPUParser - Release ───

describe('GPUParser - Release', () => {
  it('resets state after release', async () => {
    const parser = new GPUParser({ backend: 'cuda' })
    await parser.initialize()
    expect(parser.isAvailable()).toBe(true)
    parser.release()
    expect(parser.isAvailable()).toBe(false)
    expect(parser.getDeviceInfo()).toBeNull()
  })

  it('resets profiling data after release', async () => {
    const parser = new GPUParser({ backend: 'cuda', enableProfiling: true })
    await parser.parseBatch(['x'], ['f.ts'])
    parser.release()
    const profiling = parser.getProfilingData()
    expect(profiling.kernelTime).toBe(0)
  })
})

// ─── GPUParser - getBackend ───

describe('GPUParser - getBackend', () => {
  it('returns configured backend', () => {
    const backends: GPUBackend[] = ['none', 'cuda', 'webgpu', 'opencl']
    for (const backend of backends) {
      const parser = new GPUParser({ backend })
      expect(parser.getBackend()).toBe(backend)
    }
  })
})

// ─── GPUParser - getConfig ───

describe('GPUParser - getConfig', () => {
  it('returns copy of config', () => {
    const parser = new GPUParser({ backend: 'cuda' })
    const config = parser.getConfig()
    config.backend = 'none'
    expect(parser.getConfig().backend).toBe('cuda')
  })
})
