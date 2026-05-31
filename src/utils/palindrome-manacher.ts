export class PalindromeManacher {
  private d1: number[]
  private d2: number[]
  private s: string

  constructor(s: string) {
    this.s = s
    this.d1 = new Array(s.length).fill(0)
    this.d2 = new Array(s.length).fill(0)
    this.computeOdd()
    this.computeEven()
  }

  private computeOdd(): void {
    const n = this.s.length
    let l = 0
    let r = -1
    for (let i = 0; i < n; i++) {
      let k = (i > r) ? 1 : Math.min(this.d1[l + r - i]!, r - i + 1)
      while (i - k >= 0 && i + k < n && this.s[i - k] === this.s[i + k]) k++
      this.d1[i] = k
      k--
      if (i + k > r) {
        l = i - k
        r = i + k
      }
    }
  }

  private computeEven(): void {
    const n = this.s.length
    let l = 0
    let r = -1
    for (let i = 0; i < n; i++) {
      let k = (i > r) ? 0 : Math.min(this.d2[l + r - i + 1]!, r - i + 1)
      while (i - k - 1 >= 0 && i + k < n && this.s[i - k - 1] === this.s[i + k]) k++
      this.d2[i] = k
      k--
      if (i + k > r) {
        l = i - k - 1
        r = i + k
      }
    }
  }

  longestPalindrome(): string {
    let maxLen = 0
    let start = 0
    for (let i = 0; i < this.s.length; i++) {
      const oddLen = 2 * this.d1[i]! - 1
      if (oddLen > maxLen) {
        maxLen = oddLen
        start = i - this.d1[i]! + 1
      }
      const evenLen = 2 * this.d2[i]!
      if (evenLen > maxLen) {
        maxLen = evenLen
        start = i - this.d2[i]!
      }
    }
    return this.s.substring(start, start + maxLen)
  }

  countAllPalindromes(): number {
    let count = 0
    for (let i = 0; i < this.s.length; i++) {
      count += this.d1[i]!
      count += this.d2[i]!
    }
    return count
  }

  isPalindrome(l: number, r: number): boolean {
    const len = r - l + 1
    const mid = (l + r) >> 1
    if (len % 2 === 1) {
      return this.d1[mid]! >= (len + 1) / 2
    }
    return this.d2[mid + 1]! >= len / 2
  }
}
