import type { Run } from './types.js'

export class RLE<T = unknown> {
  private runs: Run<T>[] = []
  private originalLength: number = 0

  encode(data: T[]): Run<T>[] {
    this.originalLength = data.length
    this.runs = []
    if (data.length === 0) return this.runs

    let current = data[0]!
    let count = 1
    for (let i = 1; i < data.length; i++) {
      if (data[i] === current) {
        count++
      } else {
        this.runs.push({ value: current, count })
        current = data[i]!
        count = 1
      }
    }
    this.runs.push({ value: current, count })
    return this.runs.map(r => ({ ...r }))
  }

  decode(runs: Run<T>[]): T[] {
    this.runs = [...runs]
    this.originalLength = runs.reduce((sum, r) => sum + r.count, 0)
    const result: T[] = []
    for (const run of runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value)
      }
    }
    return result
  }

  static encodeString(str: string): string {
    if (str.length === 0) return ''
    const runs: Run<string>[] = []
    let current = str[0]!
    let count = 1
    for (let i = 1; i < str.length; i++) {
      if (str[i] === current) {
        count++
      } else {
        runs.push({ value: current, count })
        current = str[i]!
        count = 1
      }
    }
    runs.push({ value: current, count })
    let result = ''
    for (const run of runs) {
      result += `[${run.count}]${run.value}`
    }
    return result
  }

  static decodeString(str: string): string {
    if (str === '') return ''
    const result: string[] = []
    let i = 0
    while (i < str.length) {
      if (str[i] === '[') {
        i++
        let countStr = ''
        while (i < str.length && str[i] !== ']') {
          countStr += str[i]
          i++
        }
        i++
        const count = parseInt(countStr, 10)
        const char = str[i]!
        for (let j = 0; j < count; j++) {
          result.push(char)
        }
        i++
      } else {
        i++
      }
    }
    return result.join('')
  }

  static encodeBytes(data: number[]): Run<number>[] {
    if (data.length === 0) return []
    const runs: Run<number>[] = []
    let current = data[0]!
    let count = 1
    for (let i = 1; i < data.length; i++) {
      if (data[i] === current) {
        count++
      } else {
        runs.push({ value: current, count })
        current = data[i]!
        count = 1
      }
    }
    runs.push({ value: current, count })
    return runs
  }

  static decodeBytes(runs: Run<number>[]): number[] {
    const result: number[] = []
    for (const run of runs) {
      for (let i = 0; i < run.count; i++) {
        result.push(run.value)
      }
    }
    return result
  }

  getRuns(): Run<T>[] {
    return this.runs.map(r => ({ ...r }))
  }

  getLength(): number {
    return this.runs.reduce((sum, r) => sum + r.count, 0)
  }

  getElementAt(index: number): T | undefined {
    if (index < 0) return undefined
    let offset = 0
    for (const run of this.runs) {
      if (index < offset + run.count) {
        return run.value
      }
      offset += run.count
    }
    return undefined
  }

  getRunAt(index: number): Run<T> | undefined {
    if (index < 0) return undefined
    let offset = 0
    for (const run of this.runs) {
      if (index < offset + run.count) {
        return { ...run }
      }
      offset += run.count
    }
    return undefined
  }

  slice(start: number, end: number): T[] {
    const result: T[] = []
    const length = this.getLength()
    const s = Math.max(0, start)
    const e = Math.min(end, length)
    if (s >= e) return result

    let offset = 0
    for (const run of this.runs) {
      const runEnd = offset + run.count
      if (runEnd <= s) {
        offset = runEnd
        continue
      }
      if (offset >= e) break

      const sliceStart = Math.max(s - offset, 0)
      const sliceEnd = Math.min(e - offset, run.count)
      for (let i = sliceStart; i < sliceEnd; i++) {
        result.push(run.value)
      }
      offset = runEnd
    }
    return result
  }

  compressRatio(): number {
    if (this.originalLength === 0) return 1
    const encodedSize = this.runs.length * 2
    return this.originalLength / encodedSize
  }

  isCompressed(): boolean {
    return this.compressRatio() > 1
  }

  concat(other: RLE<T>): RLE<T> {
    const result = new RLE<T>()
    const allRuns: Run<T>[] = this.runs.map(r => ({ ...r }))
    const otherRuns = other.getRuns()

    if (allRuns.length > 0 && otherRuns.length > 0) {
      const lastRun = allRuns[allRuns.length - 1]!
      const firstOtherRun = otherRuns[0]!
      if (lastRun.value === firstOtherRun.value) {
        lastRun.count += firstOtherRun.count
        allRuns.push(...otherRuns.slice(1).map(r => ({ ...r })))
      } else {
        allRuns.push(...otherRuns.map(r => ({ ...r })))
      }
    } else if (otherRuns.length > 0) {
      allRuns.push(...otherRuns.map(r => ({ ...r })))
    }

    result.runs = allRuns
    result.originalLength = this.originalLength + other.getLength()
    return result
  }

  *[Symbol.iterator](): Iterator<Run<T>> {
    for (const run of this.runs) {
      yield { ...run }
    }
  }
}

export type { Run } from './types.js'
