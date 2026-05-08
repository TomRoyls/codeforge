export interface BundleModule {
  id: string
  code: string
  dependencies: string[]
  size: number
}

export interface BundleChunk {
  id: string
  modules: string[]
  size: number
  dependencies: string[]
}

export interface BundleOutput {
  chunks: BundleChunk[]
  entrypoints: string[]
  totalSize: number
  modules: Map<string, BundleModule>
}

export interface BundleConfig {
  entrypoints: string[]
  chunkSizeLimit: number
  minChunkSize: number
  splitting: 'single' | 'auto' | 'eager'
}

export interface BundleWarning {
  type: 'circular' | 'missing' | 'oversized' | 'unused'
  message: string
  module: string
}

export interface BundleStatistics {
  totalModules: number
  totalSize: number
  avgSize: number
  maxSize: number
  minSize: number
  dependencyCount: number
}
