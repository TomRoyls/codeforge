interface AhoCorasickMatch {
  pattern: string
  start: number
  end: number
}

class AhoCorasickNode {
  children: Map<string, AhoCorasickNode>
  fail: AhoCorasickNode
  output: string[]
  isEnd: boolean

  constructor() {
    this.children = new Map()
    this.fail = null!
    this.output = []
    this.isEnd = false
  }
}

export class AhoCorasick {
  private root: AhoCorasickNode
  private _patterns: string[]
  private built: boolean

  constructor(patterns: string[]) {
    this.root = new AhoCorasickNode()
    this._patterns = [...patterns]
    this.built = false
    this._build()
  }

  search(text: string): AhoCorasickMatch[] {
    const results: AhoCorasickMatch[] = []
    if (!this.built || this._patterns.length === 0) return results

    let node = this.root
    const chars = Array.from(text)

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]!
      while (node !== this.root && !node.children.has(ch)) {
        node = node.fail
      }
      const child = node.children.get(ch)
      if (child) {
        node = child
      }

      if (node.output.length > 0) {
        for (const pattern of node.output) {
          const patternChars = Array.from(pattern)
          results.push({
            pattern,
            start: i - patternChars.length + 1,
            end: i,
          })
        }
      }
    }

    return results
  }

  findAll(text: string): AhoCorasickMatch[] {
    return this.search(text)
  }

  containsAny(text: string): boolean {
    if (!this.built || this._patterns.length === 0) return false

    let node = this.root
    const chars = Array.from(text)

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i]!
      while (node !== this.root && !node.children.has(ch)) {
        node = node.fail
      }
      const child = node.children.get(ch)
      if (child) {
        node = child
      }

      if (node.output.length > 0) return true
    }

    return false
  }

  get patterns(): string[] {
    return [...this._patterns]
  }

  get patternCount(): number {
    return this._patterns.length
  }

  private _build(): void {
    for (const pattern of this._patterns) {
      this._insert(pattern)
    }
    this._buildFailureLinks()
    this.built = true
  }

  private _insert(pattern: string): void {
    let node = this.root
    const chars = Array.from(pattern)
    for (const ch of chars) {
      let child = node.children.get(ch)
      if (!child) {
        child = new AhoCorasickNode()
        node.children.set(ch, child)
      }
      node = child
    }
    node.isEnd = true
    node.output.push(pattern)
  }

  private _buildFailureLinks(): void {
    const queue: AhoCorasickNode[] = []
    this.root.fail = this.root

    this.root.children.forEach((child) => {
      child.fail = this.root
    queue.push(child)
  })

  let _qi = 0
  while (_qi < queue.length) {
    const current = queue[_qi]!
    _qi++
    current.children.forEach((child, ch) => {
        let fail = current.fail
        while (fail !== this.root && !fail.children.has(ch)) {
          fail = fail.fail
        }
        const failChild = fail.children.get(ch)
        child.fail = failChild && failChild !== child ? failChild : this.root

        child.output = [...child.output, ...child.fail.output]
        queue.push(child)
      })
    }
  }
}

export type { AhoCorasickMatch }
