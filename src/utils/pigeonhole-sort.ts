export class PigeonholeSort {
  static sort(arr: number[]): number[] {
    if (arr.length === 0) return []
    let min = arr[0]!
    let max = arr[0]!
    for (let i = 1; i < arr.length; i++) {
      if (arr[i]! < min) min = arr[i]!
      if (arr[i]! > max) max = arr[i]!
    }
    const range = max - min + 1
    const holes: number[][] = Array.from({ length: range }, () => [])
    for (const val of arr) {
      holes[val - min]!.push(val)
    }
    const result: number[] = []
    for (const hole of holes) {
      for (const val of hole) {
        result.push(val)
      }
    }
    return result
  }

  static sortInPlace(arr: number[]): void {
    const sorted = PigeonholeSort.sort(arr)
    for (let i = 0; i < arr.length; i++) {
      arr[i] = sorted[i]!
    }
  }

  static isStable(): boolean {
    return true
  }
}
