export class GrayCode {
  static generate(n: number): string[] {
    if (n === 0) return ['']
    const result: string[] = []
    const total = 1 << n
    for (let i = 0; i < total; i++) {
      const gray = i ^ (i >> 1)
      result.push(gray.toString(2).padStart(n, '0'))
    }
    return result
  }

  static generateNumbers(n: number): number[] {
    const result: number[] = []
    const total = 1 << n
    for (let i = 0; i < total; i++) {
      result.push(i ^ (i >> 1))
    }
    return result
  }

  static binaryToGray(n: number): number {
    return n ^ (n >> 1)
  }

  static grayToBinary(gray: number): number {
    let n = gray
    let mask = gray >> 1
    while (mask !== 0) {
      n ^= mask
      mask >>= 1
    }
    return n
  }

  static isGrayCodePair(a: number, b: number): boolean {
    const xor = a ^ b
    return xor !== 0 && (xor & (xor - 1)) === 0
  }

  static count(n: number): number {
    return 1 << n
  }
}
