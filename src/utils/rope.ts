const MAX_LEAF_LENGTH = 64

export interface RopeNode {
  text?: string
  left?: RopeNode
  right?: RopeNode
  weight: number
}

function nodeWeight(node: RopeNode): number {
  if (node.text !== undefined) return node.text.length
  let w = 0
  if (node.left) w += subtreeLength(node.left)
  return w
}

function subtreeLength(node: RopeNode): number {
  if (node.text !== undefined) return node.text.length
  let len = 0
  if (node.left) len += subtreeLength(node.left)
  if (node.right) len += subtreeLength(node.right)
  return len
}

function makeLeaf(text: string): RopeNode {
  return { text, weight: text.length }
}

function makeInternal(left: RopeNode, right?: RopeNode): RopeNode {
  return {
    weight: subtreeLength(left),
    left,
    right,
  }
}

function buildRope(text: string): RopeNode {
  if (text.length <= MAX_LEAF_LENGTH) {
    return makeLeaf(text)
  }
  const mid = Math.floor(text.length / 2)
  return makeInternal(buildRope(text.slice(0, mid)), buildRope(text.slice(mid)))
}

function splitNode(node: RopeNode, i: number): [RopeNode | undefined, RopeNode | undefined] {
  if (node.text !== undefined) {
    if (i <= 0) return [undefined, node]
    if (i >= node.text.length) return [node, undefined]
    return [makeLeaf(node.text.slice(0, i)), makeLeaf(node.text.slice(i))]
  }

  const leftLen = node.left ? subtreeLength(node.left) : 0

  if (i < leftLen) {
    const [ll, lr] = node.left ? splitNode(node.left, i) : [undefined, undefined]
    const rightPart = lr && node.right ? makeInternal(lr, node.right) : lr ?? node.right
    return [ll, rightPart]
  }
  if (i === leftLen) {
    return [node.left, node.right]
  }
  const [rl, rr] = node.right ? splitNode(node.right, i - leftLen) : [undefined, undefined]
  const leftPart = node.left && rl ? makeInternal(node.left, rl) : node.left ?? rl
  return [leftPart, rr]
}

function flattenLeaves(node: RopeNode | undefined, out: string[]): void {
  if (!node) return
  if (node.text !== undefined) {
    out.push(node.text)
    return
  }
  flattenLeaves(node.left, out)
  flattenLeaves(node.right, out)
}

function collectLeaves(node: RopeNode | undefined, out: RopeNode[]): void {
  if (!node) return
  if (node.text !== undefined) {
    out.push(node)
    return
  }
  collectLeaves(node.left, out)
  collectLeaves(node.right, out)
}

function rebuildFromLeaves(leaves: RopeNode[]): RopeNode | undefined {
  if (leaves.length === 0) return undefined
  if (leaves.length === 1) return leaves[0]

  const merged: RopeNode[] = []
  let i = 0
  while (i + 1 < leaves.length) {
    merged.push(makeInternal(leaves[i], leaves[i + 1]))
    i += 2
  }
  if (i < leaves.length) merged.push(leaves[i])
  return rebuildFromLeaves(merged)
}

export class Rope {
  private root: RopeNode | undefined

  constructor(text?: string) {
    if (text !== undefined && text.length > 0) {
      this.root = buildRope(text)
    }
  }

  private constructorDirect(root: RopeNode | undefined) {
    this.root = root
  }

  private static fromRoot(root: RopeNode | undefined): Rope {
    return new Rope(undefined)["_setRoot"](root)
  }

  private _setRoot(root: RopeNode | undefined): this {
    ;(this as { root: RopeNode | undefined }).root = root
    return this
  }

  index(i: number): string {
    if (i < 0 || i >= this.length) {
      throw new RangeError(`Index ${i} out of bounds [0, ${this.length})`)
    }
    return this._index(this.root, i)
  }

  private _index(node: RopeNode | undefined, i: number): string {
    if (!node) throw new RangeError(`Index out of bounds`)
    if (node.text !== undefined) {
      return node.text[i]
    }
    const leftLen = node.left ? subtreeLength(node.left) : 0
    if (i < leftLen) {
      return this._index(node.left, i)
    }
    return this._index(node.right, i - leftLen)
  }

  concat(other: Rope): Rope {
    if (!this.root && !other.root) return new Rope()
    if (!this.root) return other.clone()
    if (!other.root) return this.clone()
    return Rope.fromRoot(makeInternal(this.root, other.root))
  }

  split(i: number): [Rope, Rope] {
    if (i <= 0) return [new Rope(), this.clone()]
    if (i >= this.length) return [this.clone(), new Rope()]
    const [left, right] = splitNode(this.root!, i)
    return [Rope.fromRoot(left), Rope.fromRoot(right)]
  }

  insert(i: number, text: string): void {
    if (text.length === 0) return
    const inserted = new Rope(text)
    if (!this.root) {
      this.root = inserted.root
      return
    }
    if (i <= 0) {
      this.root = makeInternal(inserted.root!, this.root)
      return
    }
    if (i >= this.length) {
      this.root = makeInternal(this.root, inserted.root!)
      return
    }
    const [left, right] = splitNode(this.root, i)
    let newRoot: RopeNode = inserted.root!
    if (left) newRoot = makeInternal(left, newRoot)
    if (right) newRoot = makeInternal(newRoot, right)
    this.root = newRoot
    this.rebalance()
  }

  delete(start: number, length: number): void {
    if (length <= 0 || !this.root || start >= this.length) return
    const actualStart = Math.max(0, start)
    const actualEnd = Math.min(this.length, start + length)
    if (actualStart >= actualEnd) return

    const [, rightOfEnd] = splitNode(this.root, actualEnd)
    const [leftOfStart] = splitNode(this.root, actualStart)

    if (!leftOfStart && !rightOfEnd) {
      this.root = undefined
    } else if (!leftOfStart) {
      this.root = rightOfEnd
    } else if (!rightOfEnd) {
      this.root = leftOfStart
    } else {
      this.root = makeInternal(leftOfStart, rightOfEnd)
    }
    this.rebalance()
  }

  toString(): string {
    if (!this.root) return ""
    const parts: string[] = []
    flattenLeaves(this.root, parts)
    return parts.join("")
  }

  get length(): number {
    if (!this.root) return 0
    return subtreeLength(this.root)
  }

  clone(): Rope {
    return Rope.fromRoot(this.deepClone(this.root))
  }

  private deepClone(node: RopeNode | undefined): RopeNode | undefined {
    if (!node) return undefined
    if (node.text !== undefined) {
      return makeLeaf(node.text)
    }
    return {
      weight: nodeWeight(node),
      left: this.deepClone(node.left),
      right: this.deepClone(node.right),
    }
  }

  private rebalance(): void {
    if (!this.root) return
    const leaves: RopeNode[] = []
    collectLeaves(this.root, leaves)

    const merged: RopeNode[] = []
    for (const leaf of leaves) {
      if (leaf.text!.length <= MAX_LEAF_LENGTH) {
        merged.push(leaf)
      } else {
        let remaining = leaf.text!
        while (remaining.length > MAX_LEAF_LENGTH) {
          merged.push(makeLeaf(remaining.slice(0, MAX_LEAF_LENGTH)))
          remaining = remaining.slice(MAX_LEAF_LENGTH)
        }
        if (remaining.length > 0) {
          merged.push(makeLeaf(remaining))
        }
      }
    }

    this.root = rebuildFromLeaves(merged)
  }
}
