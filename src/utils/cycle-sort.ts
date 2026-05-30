export class CycleSort {
  static sort(arr: number[]): { sorted: number[]; writes: number } {
    const result = [...arr]
    let writes = 0
    const n = result.length

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
      let item = result[cycleStart]!
      let pos = cycleStart
      for (let i = cycleStart + 1; i < n; i++) {
        if (result[i]! < item) pos++
      }
      if (pos === cycleStart) continue
      while (item === result[pos]) pos++
      if (pos !== cycleStart) {
        const temp = result[pos]!
        result[pos] = item
        item = temp
        writes++
      }
      while (pos !== cycleStart) {
        pos = cycleStart
        for (let i = cycleStart + 1; i < n; i++) {
          if (result[i]! < item) pos++
        }
        while (item === result[pos]) pos++
        const temp = result[pos]!
        result[pos] = item
        item = temp
        writes++
      }
    }

    return { sorted: result, writes }
  }

  static sortInPlace(arr: number[]): number {
    let writes = 0
    const n = arr.length

    for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
      let item = arr[cycleStart]!
      let pos = cycleStart
      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i]! < item) pos++
      }
      if (pos === cycleStart) continue
      while (item === arr[pos]) pos++
      if (pos !== cycleStart) {
        const temp = arr[pos]!
        arr[pos] = item
        item = temp
        writes++
      }
      while (pos !== cycleStart) {
        pos = cycleStart
        for (let i = cycleStart + 1; i < n; i++) {
          if (arr[i]! < item) pos++
        }
        while (item === arr[pos]) pos++
        const temp = arr[pos]!
        arr[pos] = item
        item = temp
        writes++
      }
    }

    return writes
  }

  static minWrites(n: number): number {
    return n - 1
  }
}
