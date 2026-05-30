export class FibonacciSearch {
  private static findFibIndex(n: number): number {
    if (n === 0) return 0
    if (n === 1) return 1

    let fibM2 = 0
    let fibM1 = 1
    let fibM = fibM2 + fibM1
    let index = 2

    while (fibM < n) {
      fibM2 = fibM1
      fibM1 = fibM
      fibM = fibM2 + fibM1
      index++
    }

    return index
  }

  private static getFibonacci(k: number): number {
    if (k <= 1) return k

    let a = 0
    let b = 1
    for (let i = 2; i <= k; i++) {
      const temp = a + b
      a = b
      b = temp
    }
    return b
  }

  private static defaultCompare<T>(a: T, b: T): number {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  static search<T>(arr: T[], target: T, compare?: (a: T, b: T) => number): number {
    if (arr.length === 0) return -1

    const cmp = compare ?? this.defaultCompare

    if (arr.length === 1) {
      return cmp(arr[0]!, target) === 0 ? 0 : -1
    }

    const fibIndex = this.findFibIndex(arr.length)
    let fibM = this.getFibonacci(fibIndex)
    let fibM2 = this.getFibonacci(fibIndex - 2)
    let fibM1 = this.getFibonacci(fibIndex - 1)

    let offset = -1

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, arr.length - 1)

      if (arr[i] === undefined) {
        fibM = fibM1
        fibM1 = fibM2
        fibM2 = fibM - fibM1
        continue
      }

      const comparison = cmp(arr[i]!, target)

      if (comparison < 0) {
        fibM = fibM1
        fibM1 = fibM2
        fibM2 = fibM - fibM1
        offset = i
      } else if (comparison > 0) {
        fibM = fibM2
        fibM1 = fibM1 - fibM2
        fibM2 = fibM - fibM1
      } else {
        return i
      }
    }

    if (fibM1 && offset + 1 < arr.length && cmp(arr[offset + 1]!, target) === 0) {
      return offset + 1
    }

    return -1
  }

  static firstIndexOf<T>(arr: T[], target: T, compare?: (a: T, b: T) => number): number {
    if (arr.length === 0) return -1

    const cmp = compare ?? this.defaultCompare
    const index = this.search(arr, target, cmp)

    if (index === -1) return -1

    let firstIndex = index
    while (firstIndex > 0 && cmp(arr[firstIndex - 1]!, target) === 0) {
      firstIndex--
    }

    return firstIndex
  }

  static lastIndexOf<T>(arr: T[], target: T, compare?: (a: T, b: T) => number): number {
    if (arr.length === 0) return -1

    const cmp = compare ?? this.defaultCompare
    const index = this.search(arr, target, cmp)

    if (index === -1) return -1

    let lastIndex = index
    while (lastIndex < arr.length - 1 && cmp(arr[lastIndex + 1]!, target) === 0) {
      lastIndex++
    }

    return lastIndex
  }

  static insertIndex<T>(arr: T[], target: T, compare?: (a: T, b: T) => number): number {
    if (arr.length === 0) return 0

    const cmp = compare ?? this.defaultCompare

    const fibIndex = this.findFibIndex(arr.length)
    let fibM = this.getFibonacci(fibIndex)
    let fibM2 = this.getFibonacci(fibIndex - 2)
    let fibM1 = this.getFibonacci(fibIndex - 1)

    let offset = -1

    while (fibM > 1) {
      const i = Math.min(offset + fibM2, arr.length - 1)

      if (arr[i] === undefined) {
        fibM = fibM1
        fibM1 = fibM2
        fibM2 = fibM - fibM1
        continue
      }

      const comparison = cmp(arr[i]!, target)

      if (comparison < 0) {
        fibM = fibM1
        fibM1 = fibM2
        fibM2 = fibM - fibM1
        offset = i
      } else if (comparison > 0) {
        fibM = fibM2
        fibM1 = fibM1 - fibM2
        fibM2 = fibM - fibM1
      } else {
        let insertPos = i
        while (insertPos > 0 && cmp(arr[insertPos - 1]!, target) === 0) {
          insertPos--
        }
        return insertPos
      }
    }

    return offset + 1
  }
}