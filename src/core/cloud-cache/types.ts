export interface CloudCacheConfig {
  endpoint: string
  apiKey: string
  bucket: string
  region: string
  ttl: number
  maxEntrySize: number
  compress: boolean
}

export const DEFAULT_CLOUD_CACHE_CONFIG: CloudCacheConfig = {
  endpoint: 'https://cache.codeforge.dev',
  apiKey: '',
  bucket: 'codeforge-cache',
  region: 'us-east-1',
  ttl: 86400000,
  maxEntrySize: 10 * 1024 * 1024,
  compress: true,
}

export interface CacheEntry<T = unknown> {
  key: string
  value: T
  createdAt: number
  expiresAt: number
  size: number
  checksum: string
  tags: string[]
  metadata: Record<string, string>
}

export interface CacheLookupResult<T = unknown> {
  found: boolean
  entry?: CacheEntry<T>
  fromCloud: boolean
  latency: number
}
