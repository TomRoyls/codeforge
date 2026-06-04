export class Manacher {
  readonly radii: number[]
  readonly originalLength: number

  constructor(s: string) {
    this.originalLength = s.length
    const t = '|' + s.split('').join('|') + '|'
    const n = t.length
    this.radii = new Array(n).fill(0)

    let center = 0
    let right = 0

    for (let i = 0; i < n; i++) {
      if (i < right) {
        this.radii[i] = Math.min(right - i, this.radii[2 * center - i]!)
      }

      while (
        i + this.radii[i]! + 1 < n
        && i - this.radii[i]! - 1 >= 0
        && t[i + this.radii[i]! + 1] === t[i - this.radii[i]! - 1]
      ) {
        this.radii[i]!++
      }

      if (i + this.radii[i]! > right) {
        center = i
        right = i + this.radii[i]!
      }
    }
  }

  longestPalindrome(): { start: number; end: number; length: number; palindrome: string } {
    let maxRadius = 0
    let maxCenter = 0

    for (let i = 0; i < this.radii.length; i++) {
      if (this.radii[i]! > maxRadius) {
        maxRadius = this.radii[i]!
        maxCenter = i
      }
    }

    const start = (maxCenter - maxRadius) / 2
    const end = start + maxRadius
    return {
      start: Math.floor(start),
      end: Math.floor(end),
      length: maxRadius,
      palindrome: '',
    }
  }

  countAllPalindromes(): number {
    let count = 0
    for (let i = 0; i < this.radii.length; i++) {
      count += Math.ceil(this.radii[i]! / 2)
    }
    return count
  }

  isPalindrome(start: number, end: number): boolean {
    const left = 2 * start + 1
    const right = 2 * end + 1
    const center = (left + right) / 2
    const radius = (right - left) / 2
    return this.radii[center]! >= radius
  }

  getAllPalindromes(): Array<{ start: number; end: number; length: number }> {
    const result: Array<{ start: number; end: number; length: number }> = []
    for (let i = 0; i < this.radii.length; i++) {
      const r = this.radii[i]!
      for (let len = 2 - (i % 2); len <= r; len += 2) {
        const start = Math.floor((i - len) / 2)
        const end = Math.floor((i + len) / 2)
        result.push({ start, end, length: len })
      }
    }
    return result
  }
}
