// Radix Tree (compact prefix tree / Patricia trie)
// Stores key-value pairs with O(k) operations where k = key length

class RadixNode<V> {
  fragment: string
  value: V | undefined
  isTerminal: boolean
  children: Map<string, RadixNode<V>>

  constructor(fragment: string) {
    this.fragment = fragment
    this.value = undefined
    this.isTerminal = false
    this.children = new Map()
  }
}

export class RadixTree<V> {
  private root: RadixNode<V>
  private _size = 0

  constructor() {
    this.root = new RadixNode<V>('')
  }

  insert(key: string, value: V): void {
    this._insert(this.root, key, value)
  }

  private _insert(node: RadixNode<V>, key: string, value: V): void {
    if (key.length === 0) {
      if (!node.isTerminal) this._size++
      node.isTerminal = true
      node.value = value
      return
    }

    for (const [childFragment, child] of node.children) {
      const commonLen = commonPrefixLength(key, childFragment)

      if (commonLen === 0) continue

      if (commonLen === childFragment.length) {
        this._insert(child, key.slice(commonLen), value)
        return
      }

      const splitNode = new RadixNode<V>(childFragment.slice(0, commonLen))
      child.fragment = childFragment.slice(commonLen)
      splitNode.children.set(child.fragment, child)

      node.children.delete(childFragment)
      node.children.set(splitNode.fragment, splitNode)

      const remaining = key.slice(commonLen)
      if (remaining.length === 0) {
        if (!splitNode.isTerminal) this._size++
        splitNode.isTerminal = true
        splitNode.value = value
      } else {
        const newChild = new RadixNode<V>(remaining)
        newChild.isTerminal = true
        newChild.value = value
        splitNode.children.set(remaining, newChild)
        this._size++
      }
      return
    }

    const newChild = new RadixNode<V>(key)
    newChild.isTerminal = true
    newChild.value = value
    node.children.set(key, newChild)
    this._size++
  }

  get(key: string): V | undefined {
    return this._get(this.root, key)
  }

  private _get(node: RadixNode<V>, key: string): V | undefined {
    if (key.length === 0) {
      return node.isTerminal ? node.value : undefined
    }

    for (const [childFragment, child] of node.children) {
      if (key.startsWith(childFragment)) {
        return this._get(child, key.slice(childFragment.length))
      }
    }
    return undefined
  }

  has(key: string): boolean {
    return this._get(this.root, key) !== undefined
  }

  delete(key: string): boolean {
    return this._delete(this.root, key)
  }

  private _delete(parent: RadixNode<V>, key: string): boolean {
    if (key.length === 0) {
      if (!parent.isTerminal) return false
      parent.isTerminal = false
      parent.value = undefined
      this._size--
      return true
    }

    for (const [childFragment, child] of parent.children) {
      if (key.startsWith(childFragment)) {
        const remaining = key.slice(childFragment.length)
        const deleted = this._delete(child, remaining)
        if (!deleted) return false

        if (!child.isTerminal && child.children.size === 0) {
          parent.children.delete(childFragment)
        } else if (!child.isTerminal && child.children.size === 1) {
          const [grandFragment, grandChild] = child.children
            .entries()
            .next().value! as [string, RadixNode<V>]
          parent.children.delete(childFragment)
          grandChild.fragment = childFragment + grandFragment
          parent.children.set(grandChild.fragment, grandChild)
        }
        return true
      }
    }
    return false
  }

  startsWith(prefix: string): [string, V][] {
    const results: [string, V][] = []
    this._startsWith(this.root, prefix, '', results)
    return results
  }

  private _startsWith(
    node: RadixNode<V>,
    prefix: string,
    accumulated: string,
    results: [string, V][],
  ): void {
    if (prefix.length === 0) {
      this._collectAll(node, accumulated, results)
      return
    }

    for (const [childFragment, child] of node.children) {
      if (prefix.startsWith(childFragment)) {
        this._startsWith(
          child,
          prefix.slice(childFragment.length),
          accumulated + childFragment,
          results,
        )
        return
      }

      if (childFragment.startsWith(prefix)) {
        const fullKey = accumulated + childFragment
        if (child.isTerminal && child.value !== undefined) {
          results.push([fullKey, child.value])
        }
        this._collectChildren(child, fullKey, results)
        return
      }

      const common = commonPrefixLength(prefix, childFragment)
      if (common > 0 && common === prefix.length) {
        const fullKey = accumulated + childFragment
        if (child.isTerminal && child.value !== undefined) {
          results.push([fullKey, child.value])
        }
        this._collectChildren(child, fullKey, results)
        return
      }
    }
  }

  private _collectAll(
    node: RadixNode<V>,
    prefix: string,
    results: [string, V][],
  ): void {
    if (node.isTerminal && node.value !== undefined) {
      results.push([prefix, node.value])
    }
    for (const [childFragment, child] of node.children) {
      this._collectAll(child, prefix + childFragment, results)
    }
  }

  private _collectChildren(
    node: RadixNode<V>,
    prefix: string,
    results: [string, V][],
  ): void {
    for (const [childFragment, child] of node.children) {
      this._collectAll(child, prefix + childFragment, results)
    }
  }

  longestPrefixOf(key: string): string | undefined {
    let result: string | undefined
    let node = this.root
    let accumulated = ''

    let remaining = key
    while (remaining.length > 0) {
      let found = false
      for (const [childFragment, child] of node.children) {
        if (remaining.startsWith(childFragment)) {
          accumulated += childFragment
          remaining = remaining.slice(childFragment.length)
          if (child.isTerminal) {
            result = accumulated
          }
          node = child
          found = true
          break
        }
      }
      if (!found) break
    }

    return result
  }

  keys(): string[] {
    const results: string[] = []
    this._collectKeys(this.root, '', results)
    return results
  }

  private _collectKeys(
    node: RadixNode<V>,
    prefix: string,
    results: string[],
  ): void {
    if (node.isTerminal) results.push(prefix)
    for (const [childFragment, child] of node.children) {
      this._collectKeys(child, prefix + childFragment, results)
    }
  }

  values(): V[] {
    const results: V[] = []
    this._collectValues(this.root, results)
    return results
  }

  private _collectValues(node: RadixNode<V>, results: V[]): void {
    if (node.isTerminal && node.value !== undefined) results.push(node.value)
    for (const [, child] of node.children) {
      this._collectValues(child, results)
    }
  }

  entries(): [string, V][] {
    return this.startsWith('')
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.root = new RadixNode<V>('')
    this._size = 0
  }
}

function commonPrefixLength(a: string, b: string): number {
  const minLen = Math.min(a.length, b.length)
  let i = 0
  while (i < minLen && a[i] === b[i]) i++
  return i
}
