export class LibrarySort3<T> {
  private array: T[]
  private compareFn: (a: T, b: T) => number

  constructor(array: T[], comparator?: (a: T, b: T) => number) {
    this.array = [...array]
    this.compareFn = comparator || ((a: T, b: T) => {
      if (a < b) return -1
      if (a > b) return 1
      return 0
    })
  }

  sort(): T[] {
    if (this.array.length <= 1) {
      return [...this.array]
    }
    const input = [...this.array]
    const n = input.length
    const epsilon = 1
    const m = Math.floor((1 + epsilon) * n)
    const gapped = new Array<T>(m)
    const validIndices = new Array<number>(n)

    let goal = 0
    let position = 0
    gapped[position] = input[0]!
    validIndices[0] = 0
    position += 1 + epsilon

    for (let i = 1; i < n; i++) {
      const value = input[i]!
      const insertIndex = this.binarySearchInsertIndex(input, validIndices, goal, value)

      for (let j = goal; j > insertIndex; j--) {
        const oldPos = validIndices[j]!
        const newPos = oldPos + 1 + epsilon
        gapped[newPos] = gapped[oldPos]!
        validIndices[j] = newPos
      }

      gapped[position] = value
      validIndices[insertIndex] = position
      position += 1 + epsilon
      goal++
    }

    const result = new Array<T>(n)
    let resultIndex = 0
    for (let i = 0; i < gapped.length && resultIndex < n; i++) {
      if (gapped[i] !== undefined) {
        result[resultIndex] = gapped[i]!
        resultIndex++
      }
    }

    return result
  }

  sortInPlace(arr: T[]): T[] {
    if (arr.length <= 1) {
      return arr
    }
    const n = arr.length
    const epsilon = 1
    const m = Math.floor((1 + epsilon) * n)
    const gapped = new Array<T>(m)
    const validIndices = new Array<number>(n)

    let goal = 0
    let position = 0
    gapped[position] = arr[0]!
    validIndices[0] = 0
    position += 1 + epsilon

    for (let i = 1; i < n; i++) {
      const value = arr[i]!
      const insertIndex = this.binarySearchInsertIndex(arr, validIndices, goal, value)

      for (let j = goal; j > insertIndex; j--) {
        const oldPos = validIndices[j]!
        const newPos = oldPos + 1 + epsilon
        gapped[newPos] = gapped[oldPos]!
        validIndices[j] = newPos
      }

      gapped[position] = value
      validIndices[insertIndex] = position
      position += 1 + epsilon
      goal++
    }

    let resultIndex = 0
    for (let i = 0; i < gapped.length && resultIndex < n; i++) {
      if (gapped[i] !== undefined) {
        arr[resultIndex] = gapped[i]!
        resultIndex++
      }
    }

    return arr
  }

  private binarySearchInsertIndex(input: T[], indices: number[], right: number, target: T): number {
    let left = 0
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midPos = indices[mid]!
      const midValue = input[midPos]!
      const cmp = this.compareFn(midValue, target)
      if (cmp < 0) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return left
  }
}
