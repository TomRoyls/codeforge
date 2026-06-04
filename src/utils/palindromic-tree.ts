export class PalindromicTree {
  private nodes: { length: number; link: number; next: Map<string, number>; occ: number }[] = []
  private s: string[] = []
  private last: number = 1

  constructor() {
    this.nodes.push({ length: -1, link: 0, next: new Map(), occ: 0 })
    this.nodes.push({ length: 0, link: 0, next: new Map(), occ: 0 })
  }

  add(ch: string): number {
    this.s.push(ch)
    let cur = this.last
    const pos = this.s.length - 1
    while (true) {
      const cl = this.nodes[cur]!.length
      if (pos - 1 - cl >= 0 && this.s[pos - 1 - cl] === ch) break
      cur = this.nodes[cur]!.link
    }
    if (this.nodes[cur]!.next.has(ch)) {
      this.last = this.nodes[cur]!.next.get(ch)!
      this.nodes[this.last]!.occ++
      return this.last
    }
    const node = this.nodes.length
    this.nodes.push({ length: this.nodes[cur]!.length + 2, link: 1, next: new Map(), occ: 1 })
    this.nodes[cur]!.next.set(ch, node)
    if (this.nodes[node]!.length > 1) {
      let link = this.nodes[cur]!.link
      while (true) {
        const ll = this.nodes[link]!.length
        if (pos - 1 - ll >= 0 && this.s[pos - 1 - ll] === ch) break
        link = this.nodes[link]!.link
      }
      this.nodes[node]!.link = this.nodes[link]!.next.get(ch)!
    }
    this.last = node
    return node
  }

  static from(text: string): PalindromicTree {
    const pt = new PalindromicTree()
    for (const ch of text) pt.add(ch)
    return pt
  }

  get distinctPalindromes(): number {
    return this.nodes.length - 2
  }

  get totalPalindromes(): number {
    return this.nodes.slice(2).reduce((sum, n) => sum + n.occ, 0)
  }

  getLongestPalindrome(): string {
    let maxLen = 0
    for (let i = 2; i < this.nodes.length; i++) {
      if (this.nodes[i]!.length > maxLen) {
        maxLen = this.nodes[i]!.length
      }
    }
    return this.s.slice(this.s.length - maxLen).join('')
  }

  hasPalindrome(pal: string): boolean {
    const len = pal.length
    for (let i = 2; i < this.nodes.length; i++) {
      if (this.nodes[i]!.length === len) {
        const start = this.s.length - len
        let match = true
        for (let j = 0; j < len; j++) {
          if (this.s[start + j] !== pal[j]) { match = false; break }
        }
        if (match) return true
      }
    }
    return false
  }
}
