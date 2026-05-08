export type HashAlgorithm = 'simple' | 'djb2' | 'fnv1a' | 'murmur' | 'cyrb53'

export interface HashEntry {
  key: string
  hash: string
  algorithm: HashAlgorithm
  size: number
  createdAt: number
  metadata: Record<string, unknown>
}

export interface HashComparison {
  hash1: string
  hash2: string
  match: boolean
  algorithm: HashAlgorithm
}

export interface DeduplicationResult {
  unique: Map<string, string>
  duplicates: Map<string, string[]>
  totalItems: number
  uniqueCount: number
  duplicateCount: number
  savedBytes: number
}

export interface IntegrityCheck {
  key: string
  expectedHash: string
  actualHash: string
  valid: boolean
  algorithm: HashAlgorithm
}
