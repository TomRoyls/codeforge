export class Eertree {
  private nodes: { length: number; link: number; next: Map<string, number>; pal: string }[] = []
  private s: string[] = []
  private last: number = 1

  constructor() {
    this.nodes.push({ length: -1, link: 0, next: new Map(), pal: '' })
    this.nodes.push({ length: 0, link: 0, next: new Map(), pal: '' })
  }

  addChar(ch: string): number {
    this.s.push(ch)
    let cur = this.last
    const pos = this.s.length - 1
    while (true) {
      const curlen = this.nodes[cur]!.length
      if (pos - 1 - curlen >= 0 && this.s[pos - 1 - curlen] === ch) break
      cur = this.nodes[cur]!.link
    }
    if (this.nodes[cur]!.next.has(ch)) {
      this.last = this.nodes[cur]!.next.get(ch)!
      return this.last
    }
    const newLen = this.nodes[cur]!.length + 2
    const newNode = this.nodes.length
    const pal = ch + (newLen <= 1 ? '' : this.nodes[cur]!.pal) + (newLen <= 1 ? '' : ch)
    this.nodes.push({ length: newLen, link: 1, next: new Map(), pal })
    this.nodes[cur]!.next.set(ch, newNode)
    if (newLen === 1) {
      this.nodes[newNode]!.link = 1
    } else {
      let linkCur = this.nodes[cur]!.link
      while (true) {
        const linkLen = this.nodes[linkCur]!.length
        if (pos - 1 - linkLen >= 0 && this.s[pos - 1 - linkLen] === ch) break
        linkCur = this.nodes[linkCur]!.link
      }
      this.nodes[newNode]!.link = this.nodes[linkCur]!.next.get(ch)!
    }
    this.last = newNode
    return newNode
  }

  static build(text: string): Eertree {
    const tree = new Eertree()
    for (const ch of text) tree.addChar(ch)
    return tree
  }

  get nodeCount(): number {
    return this.nodes.length - 2
  }

  getPalindromes(): string[] {
    return this.nodes.slice(2).map(n => n.pal)
  }

  hasPalindrome(pal: string): boolean {
    return this.nodes.some(n => n.pal === pal)
  }
}
