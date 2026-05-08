export type GPUBackend = 'webgpu' | 'cuda' | 'opencl' | 'none'

export interface GPUParserConfig {
  backend: GPUBackend
  deviceIndex: number
  maxBatchSize: number
  enableProfiling: boolean
}

export const DEFAULT_GPU_CONFIG: GPUParserConfig = {
  backend: 'none',
  deviceIndex: 0,
  maxBatchSize: 1000,
  enableProfiling: false,
}

export interface GPUParseResult {
  success: boolean
  results: unknown[]
  duration: number
  gpuTime: number
  transferTime: number
  memoryUsed: number
  batchSize: number
}

export interface GPUDeviceInfo {
  name: string
  backend: GPUBackend
  memorySize: number
  computeUnits: number
  available: boolean
}
