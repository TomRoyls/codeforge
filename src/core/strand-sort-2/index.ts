type CompareFn = (a: number, b: number) => number

function defaultCompare(a: number, b: number): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function extractStrand(input: number[], compare: CompareFn): { strand: number[]; remaining: number[] } {
  if (input.length === 0) return { strand: [], remaining: [] }

  const strand: number[] = [input[0]!]
  const remaining: number[] = []

  for (let i = 1; i < input.length; i++) {
    const current = input[i]!
    if (compare(current, strand[strand.length - 1]!) >= 0) {
      strand.push(current)
    } else {
      remaining.push(current)
    }
  }

  return { strand, remaining }
}

function mergeTwoStrands(strand1: number[], strand2: number[], compare: CompareFn): number[] {
  const result: number[] = []
  let i = 0
  let j = 0

  while (i < strand1.length && j < strand2.length) {
    if (compare(strand1[i]!, strand2[j]!) <= 0) {
      result.push(strand1[i]!)
      i++
    } else {
      result.push(strand2[j]!)
      j++
    }
  }

  while (i < strand1.length) {
    result.push(strand1[i]!)
    i++
  }

  while (j < strand2.length) {
    result.push(strand2[j]!)
    j++
  }

  return result
}

function mergeAllStrands(strands: number[][], compare: CompareFn): number[] {
  if (strands.length === 0) return []
  if (strands.length === 1) return strands[0]!

  let result = strands[0]!
  for (let i = 1; i < strands.length; i++) {
    result = mergeTwoStrands(result, strands[i]!, compare)
  }

  return result
}

export class StrandSort2 {
  static sort(arr: number[]): number[] {
    if (arr.length <= 1) {
      return [...arr]
    }

    const strands: number[][] = []
    let remaining = [...arr]

    while (remaining.length > 0) {
      const { strand, remaining: newRemaining } = extractStrand(remaining, defaultCompare)
      strands.push(strand)
      remaining = newRemaining
    }

    return mergeAllStrands(strands, defaultCompare)
  }

  static sortDescending(arr: number[]): number[] {
    if (arr.length <= 1) {
      return [...arr]
    }

    const descendingCompare: CompareFn = (a, b) => defaultCompare(b, a)
    const strands: number[][] = []
    let remaining = [...arr]

    while (remaining.length > 0) {
      const { strand, remaining: newRemaining } = extractStrand(remaining, descendingCompare)
      strands.push(strand)
      remaining = newRemaining
    }

    return mergeAllStrands(strands, descendingCompare)
  }

  static isSorted(arr: number[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (defaultCompare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  sortInstance(arr: number[]): number[] {
    return StrandSort2.sort(arr)
  }

  toString(): string {
    return `StrandSort2()`
  }
}
