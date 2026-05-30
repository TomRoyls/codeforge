export interface RLERun<T> {
  value: T
  count: number
}

export class RunLengthEncoding {
  static encode<T>(data: T[]): RLERun<T>[] {
    if (data.length === 0) return []
    const result: RLERun<T>[] = []
    let current = data[0]!
    let count = 1
    for (let i = 1; i < data.length; i++) {
      if (data[i] === current) {
        count++
      } else {
        result.push({ value: current, count })
        current = data[i]!
        count = 1
      }
    }
    result.push({ value: current, count })
    return result
  }

  static decode<T>(runs: RLERun<T>[]): T[] {
    const result: T[] = []
    for (const run of runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value)
      }
    }
    return result
  }

  static encodeString(s: string): Array<{ value: string; count: number }> {
    return RunLengthEncoding.encode([...s])
  }

  static decodeString(runs: Array<{ value: string; count: number }>): string {
    return RunLengthEncoding.decode(runs).join('')
  }

  static compressionRatio<T>(data: T[]): number {
    if (data.length === 0) return 1
    const encoded = RunLengthEncoding.encode(data)
    return encoded.length / data.length
  }
}
