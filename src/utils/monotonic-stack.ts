export class MonotonicStack<T> {
  private stack: T[] = []
  private compare: (top: T, incoming: T) => boolean

  constructor(compare: (top: T, incoming: T) => boolean = (a, b) => a <= b) {
    this.compare = compare
  }

  push(value: T): T[] {
    const popped: T[] = []
    while (this.stack.length > 0 && this.compare(this.stack[this.stack.length - 1]!, value)) {
      popped.push(this.stack.pop()!)
    }
    this.stack.push(value)
    return popped
  }

  pop(): T | undefined {
    return this.stack.pop()
  }

  peek(): T | undefined {
    return this.stack[this.stack.length - 1]
  }

  get size(): number {
    return this.stack.length
  }

  get isEmpty(): boolean {
    return this.stack.length === 0
  }

  toArray(): T[] {
    return [...this.stack]
  }

  static nextGreaterElements(arr: number[]): number[] {
    const result = new Array(arr.length).fill(-1)
    const stack: number[] = []
    for (let i = 0; i < arr.length; i++) {
      while (stack.length > 0 && arr[stack[stack.length - 1]!]! < arr[i]!) {
        result[stack.pop()!] = arr[i]!
      }
      stack.push(i)
    }
    return result
  }

  static previousSmallerElements(arr: number[]): number[] {
    const result = new Array(arr.length).fill(-1)
    const stack = new MonotonicStack<number>((a, b) => a > b)
    for (let i = 0; i < arr.length; i++) {
      while (stack.size > 0 && arr[stack.peek()!]! >= arr[i]!) {
        stack.pop()
      }
      if (stack.size > 0) result[i] = arr[stack.peek()!]!
      stack.push(i)
    }
    return result
  }
}
