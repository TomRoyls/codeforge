export class StringMatcher {
  private nodes: Array<{ children: Map<string, number>; fail: number; output: Array<{ pattern: string; id: string }> }>
  private patterns: Array<{ pattern: string; id: string }>
  private built: boolean

  constructor() {
    this.nodes = [{ children: new Map<string, number>(), fail: 0, output: [] }]
    this.patterns = []
    this.built = false
  }

  get patternCount(): number {
    return this.patterns.length
  }

  addPattern(pattern: string, id?: string): void {
    if (this.built) {
      throw new Error('Cannot add patterns after build()')
    }
    this.patterns.push({ pattern, id: id ?? pattern })
  }

  build(): void {
    if (this.built) return

    for (let i = 0; i < this.patterns.length; i++) {
      const { pattern, id } = this.patterns[i]!
      let current = 0
      for (let j = 0; j < pattern.length; j++) {
        const char = pattern[j]!
        const children = this.nodes[current]!.children
        if (!children.has(char)) {
          children.set(char, this.nodes.length)
          this.nodes.push({ children: new Map<string, number>(), fail: 0, output: [] })
        }
        current = children.get(char)!
      }
      this.nodes[current]!.output.push({ pattern, id })
    }

    const queue: number[] = []
    const root = this.nodes[0]!

    const rootChildrenKeys = Array.from(root.children.keys())
    for (let i = 0; i < rootChildrenKeys.length; i++) {
      const char = rootChildrenKeys[i]!
      const next = root.children.get(char)!
      this.nodes[next]!.fail = 0
      queue.push(next)
    }

    let _qi = 0
    while (_qi < queue.length) {
      const current = queue[_qi++]!
      const currentNode = this.nodes[current]!
      const childrenKeys = Array.from(currentNode.children.keys())

      for (let i = 0; i < childrenKeys.length; i++) {
        const char = childrenKeys[i]!
        const next = currentNode.children.get(char)!
        queue.push(next)

        let fail = currentNode.fail
        while (fail !== 0 && !this.nodes[fail]!.children.has(char)) {
          fail = this.nodes[fail]!.fail
        }

        if (fail !== 0 || this.nodes[0]!.children.has(char)) {
          const nextFail = this.nodes[fail]!.children.get(char)
          if (nextFail !== undefined) {
            this.nodes[next]!.fail = nextFail
            this.nodes[next]!.output.push(...this.nodes[nextFail]!.output)
          }
        }
      }
    }

    this.built = true
  }

  search(text: string): Array<{ pattern: string; id: string; start: number; end: number }> {
    if (!this.built) {
      throw new Error('Must call build() before search()')
    }
    const result: Array<{ pattern: string; id: string; start: number; end: number }> = []
    let current = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
      while (current !== 0 && !this.nodes[current]!.children.has(char)) {
        current = this.nodes[current]!.fail
      }

      const next = this.nodes[current]!.children.get(char)
      if (next !== undefined) {
        current = next
      }

      const outputs = this.nodes[current]!.output
      for (let j = 0; j < outputs.length; j++) {
        const { pattern, id } = outputs[j]!
        const start = i - pattern.length + 1
        result.push({ pattern, id, start, end: i })
      }
    }

    return result
  }

  containsAny(text: string): boolean {
    if (!this.built) {
      throw new Error('Must call build() before containsAny()')
    }
    let current = 0

    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
      while (current !== 0 && !this.nodes[current]!.children.has(char)) {
        current = this.nodes[current]!.fail
      }

      const next = this.nodes[current]!.children.get(char)
      if (next !== undefined) {
        current = next
      }

      if (this.nodes[current]!.output.length > 0) {
        return true
      }
    }

    return false
  }

  clear(): void {
    this.nodes = [{ children: new Map<string, number>(), fail: 0, output: [] }]
    this.patterns = []
    this.built = false
  }
}