export class CompressionUtils2 {
  static lz77Compress(data: string, windowSize = 256): [number, number, string][] {
    const result: [number, number, string][] = []
    let pos = 0
    while (pos < data.length) {
      let bestLen = 0, bestDist = 0
      const start = Math.max(0, pos - windowSize)
      for (let i = start; i < pos; i++) {
        let len = 0
        while (pos + len < data.length && data[i + len] === data[pos + len]) len++
        if (len > bestLen) { bestLen = len; bestDist = pos - i }
      }
      if (bestLen > 0) {
        result.push([bestDist, bestLen, data[pos + bestLen] ?? ''])
        pos += bestLen + 1
      } else {
        result.push([0, 0, data[pos]])
        pos++
      }
    }
    return result
  }

  static lz77Decompress(compressed: [number, number, string][]): string {
    const result: string[] = []
    for (const [dist, len, char] of compressed) {
      if (dist > 0 && len > 0) {
        const start = result.length - dist
        for (let i = 0; i < len; i++) result.push(result[start + i])
      }
      if (char) result.push(char)
    }
    return result.join('')
  }

  static frequencyTable(data: string): Map<string, number> {
    const freq = new Map<string, number>()
    for (const c of data) freq.set(c, (freq.get(c) ?? 0) + 1)
    return freq
  }

  static entropy(data: string): number {
    if (data.length === 0) return 0
    const freq = CompressionUtils2.frequencyTable(data)
    let h = 0
    for (const count of freq.values()) {
      const p = count / data.length
      h -= p * Math.log2(p)
    }
    return h
  }

  static compressionRatio(original: string, compressed: string): number {
    if (compressed.length === 0) return 0
    return original.length / compressed.length
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): CompressionUtils2 { return new CompressionUtils2() }
  equals(other: unknown): boolean { return other instanceof CompressionUtils2 }
}
