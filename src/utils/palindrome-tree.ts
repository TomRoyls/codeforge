interface PalNode {
  length: number
  link: number
  next: Map<string, number>
  count: number
}

export class PalindromeTree {
  private readonly nodes: PalNode[] = []
  private readonly s: string[] = []
  private last = 1

  constructor(s: string) {
    this.nodes.push({ length: -1, link: 0, next: new Map(), count: 0 })
    this.nodes.push({ length: 0, link: 0, next: new Map(), count: 0 })
    for (let i = 0; i < s.length; i++) {
      this.extend(s, i)
    }
    for (let i = this.nodes.length - 1; i >= 2; i--) {
      this.nodes[this.nodes[i]!.link]!.count += this.nodes[i]!.count
    }
  }

  private getLink(s: string, pos: number, node: number): number {
    let cur = node
    while (true) {
      const j = pos - 1 - this.nodes[cur]!.length
      if (j >= 0 && s[j] === s[pos]) break
      cur = this.nodes[cur]!.link
    }
    return cur
  }

  private extend(s: string, pos: number): void {
    const cur = this.getLink(s, pos, this.last)
    const ch = s[pos]!
    this.s.push(ch)
    if (!this.nodes[cur]!.next.has(ch)) {
      const linkFrom = this.getLink(s, pos, this.nodes[cur]!.link)
      const link = this.nodes[linkFrom]!.next.get(ch) ?? 1
      this.nodes.push({
        length: this.nodes[cur]!.length + 2,
        link,
        next: new Map(),
        count: 1,
      })
      this.nodes[cur]!.next.set(ch, this.nodes.length - 1)
    } else {
      this.nodes[this.nodes[cur]!.next.get(ch)!]!.count++
    }
    this.last = this.nodes[cur]!.next.get(ch)!
  }

  getDistinctPalindromeCount(): number {
    return this.nodes.length - 2
  }

  getTotalPalindromeCount(): number {
    let total = 0
    for (let i = 2; i < this.nodes.length; i++) {
      total += this.nodes[i]!.count
    }
    return total
  }

  getMaxPalindromeLength(): number {
    let maxLen = 0
    for (let i = 2; i < this.nodes.length; i++) {
      if (this.nodes[i]!.length > maxLen) maxLen = this.nodes[i]!.length
    }
    return maxLen
  }

  getNodeCount(): number {
    return this.nodes.length
  }

  getPalindromeLengths(): number[] {
    const lengths: number[] = []
    for (let i = 2; i < this.nodes.length; i++) {
      lengths.push(this.nodes[i]!.length)
    }
    return lengths.sort((a, b) => a - b)
  }

  containsPalindromeOfLength(len: number): boolean {
    for (let i = 2; i < this.nodes.length; i++) {
      if (this.nodes[i]!.length === len) return true
    }
    return false
  }
}
