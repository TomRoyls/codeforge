export class TrieRadix {
  private children: Map<string, TrieRadix> = new Map()
  private isEnd: boolean = false
  
  insert(word: string, value?: string): void {
    let node: TrieRadix = this
    let remaining = word
    while (remaining.length > 0) {
      let found = false
      for (const [edge, child] of node.children) {
        let commonLen = 0
        while (commonLen < edge.length && commonLen < remaining.length && edge[commonLen] === remaining[commonLen]) {
          commonLen++
        }
        if (commonLen > 0) {
          if (commonLen < edge.length) {
            const splitNode = new TrieRadix()
            node.children.set(edge.slice(0, commonLen), splitNode)
            splitNode.children.set(edge.slice(commonLen), child)
            node.children.delete(edge)
            node = splitNode
            remaining = remaining.slice(commonLen)
          } else {
            node = child
            remaining = remaining.slice(commonLen)
          }
          found = true
          break
        }
      }
      if (!found) {
        const newNode = new TrieRadix()
        node.children.set(remaining, newNode)
        node = newNode
        remaining = ''
      }
    }
    node.isEnd = true
    void value
  }

  search(word: string): boolean {
    let node: TrieRadix = this
    let remaining = word
    while (remaining.length > 0) {
      let found = false
      for (const [edge, child] of node.children) {
        if (remaining.startsWith(edge)) {
          node = child
          remaining = remaining.slice(edge.length)
          found = true
          break
        }
      }
      if (!found) return false
    }
    return node.isEnd
  }

  startsWith(prefix: string): boolean {
    let node: TrieRadix = this
    let remaining = prefix
    while (remaining.length > 0) {
      let found = false
      for (const [edge, child] of node.children) {
        if (remaining.startsWith(edge)) {
          node = child
          remaining = remaining.slice(edge.length)
          found = true
          break
        }
        if (edge.startsWith(remaining)) return true
      }
      if (!found) return false
    }
    return true
  }

  collectWords(prefix?: string): string[] {
    const results: string[] = []
    let node: TrieRadix = this
    let path = ''
    if (prefix) {
      let remaining = prefix
      while (remaining.length > 0) {
        let found = false
        for (const [edge, child] of node.children) {
          if (remaining.startsWith(edge)) {
            node = child
            path += edge
            remaining = remaining.slice(edge.length)
            found = true
            break
          }
        }
        if (!found) return results
      }
    }
    function dfs(n: TrieRadix, p: string) {
      if (n.isEnd) results.push(p)
      for (const [edge, child] of n.children) {
        dfs(child, p + edge)
      }
    }
    dfs(node, path)
    return results
  }
}
