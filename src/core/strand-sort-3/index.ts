type CompareFn<T> = (a: T, b: T) => number

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}

function extractStrand<T>(
  input: T[],
  compare: CompareFn<T>,
): { strand: T[]; remaining: T[] } {
  if (input.length === 0) return { strand: [], remaining: [] }
  
  const strand: T[] = [input[0]!]
  const remaining: T[] = []
  
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

function mergeTwoStrands<T>(
  strand1: T[],
  strand2: T[],
  compare: CompareFn<T>,
): T[] {
  const result: T[] = []
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

function mergeAllStrands<T>(
  strands: T[][],
  compare: CompareFn<T>,
): T[] {
  if (strands.length === 0) return []
  if (strands.length === 1) return strands[0]!
  
  let result = strands[0]!
  for (let i = 1; i < strands.length; i++) {
    result = mergeTwoStrands(result, strands[i]!, compare)
  }
  
  return result
}

export class StrandSort3<T> {
  private compare: CompareFn<T>
  private strandCount: number
  private mergeCount: number

  constructor(compare?: CompareFn<T>) {
    this.compare = compare ?? defaultCompare<T>
    this.strandCount = 0
    this.mergeCount = 0
  }

  sort(arr: T[]): T[] {
    if (arr.length <= 1) {
      this.strandCount = arr.length === 0 ? 0 : 1
      this.mergeCount = 0
      return [...arr]
    }
    
    this.strandCount = 0
    this.mergeCount = 0
    
    const strands: T[][] = []
    let remaining = [...arr]
    
    while (remaining.length > 0) {
      const { strand, remaining: newRemaining } = extractStrand(remaining, this.compare)
      strands.push(strand)
      this.strandCount++
      remaining = newRemaining
    }
    
    this.mergeCount = strands.length - 1
    
    return mergeAllStrands(strands, this.compare)
  }

  sortDescending(arr: T[]): T[] {
    if (arr.length <= 1) {
      this.strandCount = arr.length === 0 ? 0 : 1
      this.mergeCount = 0
      return [...arr]
    }
    
    this.strandCount = 0
    this.mergeCount = 0
    
    const descendingCompare: CompareFn<T> = (a, b) => this.compare(b, a)
    const strands: T[][] = []
    let remaining = [...arr]
    
    while (remaining.length > 0) {
      const { strand, remaining: newRemaining } = extractStrand(
        remaining,
        descendingCompare,
      )
      strands.push(strand)
      this.strandCount++
      remaining = newRemaining
    }
    
    this.mergeCount = strands.length - 1
    
    return mergeAllStrands(strands, descendingCompare)
  }

  isSorted(arr: T[]): boolean {
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1]!, arr[i]!) > 0) {
        return false
      }
    }
    return true
  }

  getStrandCount(): number {
    return this.strandCount
  }

  getMergeCount(): number {
    return this.mergeCount
  }

  getTimeComplexity(): string {
    return 'O(n²) worst, O(n) best'
  }

  getSpaceComplexity(): string {
    return 'O(n)'
  }

  toString(): string {
    return `StrandSort3()`
  }

  get [Symbol.toStringTag](): string {
    return 'StrandSort3'
  }
}
