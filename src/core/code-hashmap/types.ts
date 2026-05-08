export interface HashMapEntry<V = unknown> {
  key: string
  value: V
  hash: number
  timestamp: number
}

export interface HashMapOptions {
  capacity: number
  loadFactor: number
  hashFunction: (key: string) => number
}

export interface HashMapStats {
  size: number
  capacity: number
  loadFactor: number
  collisions: number
  resizeCount: number
}

export const DEFAULT_HASHMAP_OPTIONS: HashMapOptions = {
  capacity: 16,
  loadFactor: 0.75,
  hashFunction: (key: string): number => {
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0
    }
    return hash
  },
}
