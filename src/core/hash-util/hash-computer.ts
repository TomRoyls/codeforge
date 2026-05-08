import type { HashAlgorithm } from './types.js'

export class HashComputer {
  compute(data: string, algorithm: HashAlgorithm = 'djb2'): string {
    switch (algorithm) {
      case 'simple':
        return this.computeSimple(data)
      case 'djb2':
        return this.computeDjb2(data)
      case 'fnv1a':
        return this.computeFnv1a(data)
      case 'murmur':
        return this.computeMurmur(data)
      case 'cyrb53':
        return this.computeCyrb53(data)
      default:
        return this.computeDjb2(data)
    }
  }

  computeSimple(data: string): string {
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      hash = (hash + data.charCodeAt(i)) & 0xffffffff
    }
    return hash.toString(16)
  }

  computeDjb2(data: string): string {
    let hash = 5381
    for (let i = 0; i < data.length; i++) {
      hash = ((hash * 33) + data.charCodeAt(i)) & 0xffffffff
    }
    return (hash >>> 0).toString(16)
  }

  computeFnv1a(data: string): string {
    let hash = 2166136261
    for (let i = 0; i < data.length; i++) {
      hash ^= data.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0).toString(16)
  }

  computeMurmur(data: string, seed: number = 0): string {
    const len = data.length
    let h = seed ^ len
    let i = 0

    while (i + 4 <= len) {
      let k =
        data.charCodeAt(i) |
        (data.charCodeAt(i + 1) << 8) |
        (data.charCodeAt(i + 2) << 16) |
        (data.charCodeAt(i + 3) << 24)

      k = Math.imul(k, 0xcc9e2d51)
      k = (k << 15) | (k >>> 17)
      k = Math.imul(k, 0x1b873593)

      h ^= k
      h = (h << 13) | (h >>> 19)
      h = Math.imul(h, 5) + 0xe6546b64
      i += 4
    }

    let remaining = 0
    const left = len - i
    if (left >= 3) remaining ^= data.charCodeAt(i + 2) << 16
    if (left >= 2) remaining ^= data.charCodeAt(i + 1) << 8
    if (left >= 1) {
      remaining ^= data.charCodeAt(i)
      remaining = Math.imul(remaining, 0xcc9e2d51)
      remaining = (remaining << 15) | (remaining >>> 17)
      remaining = Math.imul(remaining, 0x1b873593)
      h ^= remaining
    }

    h ^= len
    h ^= h >>> 16
    h = Math.imul(h, 0x85ebca6b)
    h ^= h >>> 13
    h = Math.imul(h, 0xc2b2ae35)
    h ^= h >>> 16

    return (h >>> 0).toString(16)
  }

  computeCyrb53(data: string, seed: number = 0): string {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed

    for (let i = 0; i < data.length; i++) {
      const ch = data.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 2654435761)
      h2 = Math.imul(h2 ^ ch, 1597334677)
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)

    const combined = 4294967296 * (2097151 & h2) + (h1 >>> 0)
    return combined.toString(16)
  }

  computeFileHash(content: string): string {
    return this.computeDjb2(content)
  }

  computeObjectHash(obj: Record<string, unknown>): string {
    const sorted = Object.keys(obj)
      .sort()
      .map((k) => `${k}:${JSON.stringify(obj[k])}`)
      .join('|')
    return this.computeDjb2(sorted)
  }
}
