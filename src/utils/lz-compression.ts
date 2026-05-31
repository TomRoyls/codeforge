export class LZCompression {
  static compress(data: string): { offset: number; length: number; next: string }[] {
    if (data.length === 0) return []
    const result: { offset: number; length: number; next: string }[] = []
    let pos = 0
    while (pos < data.length) {
      let bestLen = 0
      let bestOff = 0
      const searchStart = Math.max(0, pos - 4096)
      for (let i = searchStart; i < pos; i++) {
        let len = 0
        while (pos + len < data.length && data[i + len] === data[pos + len]) {
          len++
        }
        if (len > bestLen) {
          bestLen = len
          bestOff = pos - i
        }
      }
      const next = pos + bestLen < data.length ? data[pos + bestLen]! : ''
      result.push({ offset: bestOff, length: bestLen, next })
      pos += bestLen + 1
    }
    return result
  }

  static decompress(tokens: { offset: number; length: number; next: string }[]): string {
    if (tokens.length === 0) return ''
    let result = ''
    for (const { offset, length, next } of tokens) {
      if (offset > 0 && length > 0) {
        const start = result.length - offset
        for (let i = 0; i < length; i++) {
          result += result[start + i]!
        }
      }
      if (next !== '') result += next
    }
    return result
  }

  static compressRatio(data: string): number {
    if (data.length === 0) return 1
    const tokens = LZCompression.compress(data)
    const compressedSize = tokens.length * 4
    return compressedSize / data.length
  }
}
