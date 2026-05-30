export class BurrowsWheelerTransform {
  static transform(input: string): { data: string; index: number } {
    if (input.length === 0) return { data: '', index: 0 }
    const n = input.length
    const indices = Array.from({ length: n }, (_, i) => i)
    indices.sort((a, b) => {
      for (let k = 0; k < n; k++) {
        const ca = input.charCodeAt((a + k) % n)
        const cb = input.charCodeAt((b + k) % n)
        if (ca !== cb) return ca - cb
      }
      return 0
    })
    let index = 0
    let data = ''
    for (let i = 0; i < n; i++) {
      if (indices[i] === 0) index = i
      data += input[(indices[i]! + n - 1) % n]!
    }
    return { data, index }
  }

  static inverseTransform(data: string, index: number): string {
    if (data.length === 0) return ''
    const n = data.length
    const freq = new Map<number, number>()
    const T = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      const c = data.charCodeAt(i)!
      const count = freq.get(c) ?? 0
      T[i] = count
      freq.set(c, count + 1)
    }
    const sorted = Array.from({ length: n }, (_, i) => data.charCodeAt(i)!)
    sorted.sort((a, b) => a - b)
    const first = new Array<number>(n)
    const firstFreq = new Map<number, number>()
    for (let i = 0; i < n; i++) {
      const c = sorted[i]!
      const count = firstFreq.get(c) ?? 0
      first[i] = count
      firstFreq.set(c, count + 1)
    }
    const LF = new Array<number>(n)
    for (let i = 0; i < n; i++) {
      const c = data.charCodeAt(i)!
      let target = 0
      for (let j = 0; j < i; j++) {
        if (sorted[j]! < c) target++
      }
      let count = 0
      for (let j = 0; j < n; j++) {
        if (sorted[j]! === c && count < T[i]!) {
          target = j + count + 1 - count
          count++
        }
      }
      LF[i] = target
    }
    const sortedChars = Array.from(freq.entries()).sort((a, b) => a[0] - b[0])
    const C = new Map<number, number>()
    let total = 0
    for (const [c, cnt] of sortedChars) {
      C.set(c, total)
      total += cnt
    }
    for (let i = 0; i < n; i++) {
      const c = data.charCodeAt(i)!
      LF[i] = C.get(c)! + T[i]!
    }
    const result = new Array<string>(n)
    let idx = index
    for (let i = n - 1; i >= 0; i--) {
      result[i] = data[idx]!
      idx = LF[idx]!
    }
    return result.join('')
  }
}
