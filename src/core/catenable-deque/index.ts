import type { CatenableDequeNode, CatenableDequeStats } from './types.js'

const EMPTY_NODE: CatenableDequeNode<never> = { tag: 'empty' }

function emptyNode<T>(): CatenableDequeNode<T> {
  return EMPTY_NODE as CatenableDequeNode<T>
}

function nodeSize<T>(node: CatenableDequeNode<T>): number {
  switch (node.tag) {
    case 'empty': return 0
    case 'single': return 1
    case 'leaf': return node.front + node.back
    case 'deep': return node.size
  }
}

function makeLeaf<T>(items: readonly T[]): CatenableDequeNode<T> {
  if (items.length === 0) return emptyNode()
  if (items.length === 1) return { tag: 'single', value: items[0]! }
  const buf: (T | undefined)[] = new Array(items.length)
  for (let i = 0; i < items.length; i++) buf[i] = items[i]
  return { tag: 'leaf', front: items.length, back: 0, buffer: buf }
}

function makeSingle<T>(value: T): CatenableDequeNode<T> {
  return { tag: 'single', value }
}

function makeDeep<T>(
  frontBuffer: readonly (T | undefined)[],
  frontLen: number,
  spine: CatenableDequeNode<T>,
  backBuffer: readonly (T | undefined)[],
  backLen: number,
): CatenableDequeNode<T> {
  const total = frontLen + nodeSize(spine) + backLen
  if (total === 0) return emptyNode()
  if (total === 1) {
    if (frontLen === 1) return makeSingle(frontBuffer[0] as T)
    if (backLen === 1) return makeSingle(backBuffer[0] as T)
    return makeSingle(getLeafFirst(spine))
  }
  return { tag: 'deep', frontBuffer, frontLen, spine, backBuffer, backLen, size: total }
}

function getLeafFirst<T>(node: CatenableDequeNode<T>): T {
  switch (node.tag) {
    case 'single': return node.value
    case 'leaf': {
      for (let i = 0; i < node.front; i++) {
        const v = node.buffer[i]
        if (v !== undefined) return v
      }
      for (let i = node.buffer.length - 1; i >= node.buffer.length - node.back; i--) {
        const v = node.buffer[i]
        if (v !== undefined) return v
      }
      throw new Error('Empty leaf')
    }
    case 'deep': {
      for (let i = 0; i < node.frontLen; i++) {
        const v = node.frontBuffer[i]
        if (v !== undefined) return v
      }
      if (nodeSize(node.spine) > 0) return getLeafFirst(node.spine)
      for (let i = 0; i < node.backLen; i++) {
        const v = node.backBuffer[i]
        if (v !== undefined) return v
      }
      throw new Error('Empty deep')
    }
    default: throw new Error('Empty node')
  }
}

function getLeafLast<T>(node: CatenableDequeNode<T>): T {
  switch (node.tag) {
    case 'single': return node.value
    case 'leaf': {
      for (let i = node.buffer.length - 1; i >= node.buffer.length - node.back; i--) {
        const v = node.buffer[i]
        if (v !== undefined) return v
      }
      for (let i = node.front - 1; i >= 0; i--) {
        const v = node.buffer[i]
        if (v !== undefined) return v
      }
      throw new Error('Empty leaf')
    }
    case 'deep': {
      for (let i = node.backLen - 1; i >= 0; i--) {
        const v = node.backBuffer[i]
        if (v !== undefined) return v
      }
      if (nodeSize(node.spine) > 0) return getLeafLast(node.spine)
      for (let i = node.frontLen - 1; i >= 0; i--) {
        const v = node.frontBuffer[i]
        if (v !== undefined) return v
      }
      throw new Error('Empty deep')
    }
    default: throw new Error('Empty node')
  }
}

function concatNodes<T>(left: CatenableDequeNode<T>, right: CatenableDequeNode<T>): CatenableDequeNode<T> {
  if (left.tag === 'empty') return right
  if (right.tag === 'empty') return left
  const ls = nodeSize(left)
  const rs = nodeSize(right)
  if (ls === 0) return right
  if (rs === 0) return left

  const frontBuf: (T | undefined)[] = flattenToBuffer(left)
  const frontLen = frontBuf.length
  const backBuf: (T | undefined)[] = flattenToBuffer(right)
  const backLen = backBuf.length
  const total = frontLen + backLen

  if (total <= 4) {
    const all: T[] = []
    for (let i = 0; i < frontLen; i++) {
      const v = frontBuf[i]
      if (v !== undefined) all.push(v)
    }
    for (let i = 0; i < backLen; i++) {
      const v = backBuf[i]
      if (v !== undefined) all.push(v)
    }
    return makeLeaf(all)
  }

  return {
    tag: 'deep',
    frontBuffer: frontBuf,
    frontLen,
    spine: emptyNode<T>(),
    backBuffer: backBuf,
    backLen,
    size: total,
  }
}

function flattenToBuffer<T>(node: CatenableDequeNode<T>): (T | undefined)[] {
  const result: (T | undefined)[] = []
  switch (node.tag) {
    case 'empty': break
    case 'single':
      result.push(node.value)
      break
    case 'leaf':
      for (let i = 0; i < node.front; i++) result.push(node.buffer[i])
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) result.push(node.buffer[i])
      break
    case 'deep':
      for (let i = 0; i < node.frontLen; i++) result.push(node.frontBuffer[i])
      result.push(...flattenToBuffer(node.spine))
      for (let i = 0; i < node.backLen; i++) result.push(node.backBuffer[i])
      break
  }
  return result
}

function pushFrontNode<T>(node: CatenableDequeNode<T>, value: T): CatenableDequeNode<T> {
  switch (node.tag) {
    case 'empty':
      return makeSingle(value)
    case 'single':
      return { tag: 'leaf', front: 2, back: 0, buffer: [value, node.value] }
    case 'leaf': {
      const total = node.front + node.back
      if (total < 8) {
        const newBuf: (T | undefined)[] = [value]
        for (let i = 0; i < node.front; i++) newBuf.push(node.buffer[i])
        for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) newBuf.push(node.buffer[i])
        return { tag: 'leaf', front: total + 1, back: 0, buffer: newBuf }
      }
      const newBuf: (T | undefined)[] = new Array(4)
      newBuf[0] = value
      newBuf[1] = node.buffer[0]
      newBuf[2] = node.buffer[1]
      newBuf[3] = node.buffer[2]
      const rest: (T | undefined)[] = []
      for (let i = 3; i < node.front; i++) rest.push(node.buffer[i])
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) rest.push(node.buffer[i])
      return {
        tag: 'deep',
        frontBuffer: newBuf,
        frontLen: 4,
        spine: makeLeaf(rest.map(v => v as T)),
        backBuffer: [],
        backLen: 0,
        size: total + 1,
      }
    }
    case 'deep': {
      if (node.frontLen < 6) {
        const newBuf: (T | undefined)[] = new Array(node.frontLen + 1)
        newBuf[0] = value
        for (let i = 0; i < node.frontLen; i++) newBuf[i + 1] = node.frontBuffer[i]
        return {
          ...node,
          frontBuffer: newBuf,
          frontLen: node.frontLen + 1,
          size: node.size + 1,
        }
      }
      const half = Math.floor(node.frontLen / 2)
      const spineBuf: (T | undefined)[] = []
      for (let i = 0; i < half; i++) spineBuf.push(node.frontBuffer[i])
      const newFrontBuf: (T | undefined)[] = new Array(node.frontLen - half + 1)
      newFrontBuf[0] = value
      for (let i = half; i < node.frontLen; i++) newFrontBuf[i - half + 1] = node.frontBuffer[i]
      const newFrontLen = node.frontLen - half + 1
      return {
        tag: 'deep',
        frontBuffer: newFrontBuf,
        frontLen: newFrontLen,
        spine: concatNodes(makeLeaf(spineBuf.map(v => v as T)), node.spine),
        backBuffer: node.backBuffer,
        backLen: node.backLen,
        size: node.size + 1,
      }
    }
  }
}

function pushBackNode<T>(node: CatenableDequeNode<T>, value: T): CatenableDequeNode<T> {
  switch (node.tag) {
    case 'empty':
      return makeSingle(value)
    case 'single':
      return { tag: 'leaf', front: 2, back: 0, buffer: [node.value, value] }
    case 'leaf': {
      const total = node.front + node.back
      if (total < 8) {
        const newBuf: (T | undefined)[] = []
        for (let i = 0; i < node.front; i++) newBuf.push(node.buffer[i])
        for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) newBuf.push(node.buffer[i])
        newBuf.push(value)
        return { tag: 'leaf', front: total + 1, back: 0, buffer: newBuf }
      }
      const newBuf: (T | undefined)[] = new Array(4)
      newBuf[0] = node.buffer[node.buffer.length - 3]
      newBuf[1] = node.buffer[node.buffer.length - 2]
      newBuf[2] = node.buffer[node.buffer.length - 1]
      newBuf[3] = value
      const rest: (T | undefined)[] = []
      for (let i = 0; i < node.front - 3; i++) rest.push(node.buffer[i])
      for (let i = node.buffer.length - node.back; i < node.buffer.length - 3; i++) rest.push(node.buffer[i])
      return {
        tag: 'deep',
        frontBuffer: [],
        frontLen: 0,
        spine: makeLeaf(rest.map(v => v as T)),
        backBuffer: newBuf,
        backLen: 4,
        size: total + 1,
      }
    }
    case 'deep': {
      if (node.backLen < 6) {
        const newBuf: (T | undefined)[] = new Array(node.backLen + 1)
        for (let i = 0; i < node.backLen; i++) newBuf[i] = node.backBuffer[i]
        newBuf[node.backLen] = value
        return {
          ...node,
          backBuffer: newBuf,
          backLen: node.backLen + 1,
          size: node.size + 1,
        }
      }
      const half = Math.floor(node.backLen / 2)
      const spineBuf: (T | undefined)[] = []
      for (let i = half; i < node.backLen; i++) spineBuf.push(node.backBuffer[i])
      const newBackBuf: (T | undefined)[] = new Array(half + 1)
      for (let i = 0; i < half; i++) newBackBuf[i] = node.backBuffer[i]
      newBackBuf[half] = value
      const newBackLen = half + 1
      return {
        tag: 'deep',
        frontBuffer: node.frontBuffer,
        frontLen: node.frontLen,
        spine: concatNodes(node.spine, makeLeaf(spineBuf.map(v => v as T))),
        backBuffer: newBackBuf,
        backLen: newBackLen,
        size: node.size + 1,
      }
    }
  }
}

function popFrontNode<T>(node: CatenableDequeNode<T>): CatenableDequeNode<T> {
  if (nodeSize(node) <= 1) return emptyNode()

  switch (node.tag) {
    case 'single':
    case 'empty':
      return emptyNode()
    case 'leaf': {
      const total = node.front + node.back
      if (total <= 1) return emptyNode()
      if (node.front > 0) {
        if (node.front <= 1 && node.back === 0) return emptyNode()
        if (node.front === 1) {
          if (node.back === 0) return emptyNode()
          return { tag: 'leaf', front: node.back, back: 0, buffer: node.buffer.slice(node.buffer.length - node.back) }
        }
        const newBuf: (T | undefined)[] = node.buffer.slice(1, node.front)
        for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) newBuf.push(node.buffer[i])
        return { tag: 'leaf', front: node.front - 1, back: 0, buffer: newBuf }
      }
      return { tag: 'leaf', front: node.back - 1, back: 0, buffer: node.buffer.slice(node.buffer.length - node.back + 1) }
    }
    case 'deep': {
      if (node.frontLen > 1) {
        const newBuf: (T | undefined)[] = node.frontBuffer.slice(1)
        return makeDeep(newBuf, node.frontLen - 1, node.spine, node.backBuffer, node.backLen)
      }
      if (node.frontLen === 1) {
        const spineItems = flattenToBuffer(node.spine)
        const all: (T | undefined)[] = [...spineItems, ...node.backBuffer.slice(0, node.backLen)]
        return makeLeaf(all.filter((v): v is T => v !== undefined))
      }
      const spineItems = flattenToBuffer(node.spine)
      if (spineItems.length > 0) {
        const rest: (T | undefined)[] = spineItems.slice(1)
        const all: (T | undefined)[] = [...rest, ...node.backBuffer.slice(0, node.backLen)]
        return makeLeaf(all.filter((v): v is T => v !== undefined))
      }
      if (node.backLen <= 1) return emptyNode()
      const newBuf: (T | undefined)[] = node.backBuffer.slice(1, node.backLen)
      return makeLeaf(newBuf.filter((v): v is T => v !== undefined))
    }
  }
}

function popBackNode<T>(node: CatenableDequeNode<T>): CatenableDequeNode<T> {
  if (nodeSize(node) <= 1) return emptyNode()

  switch (node.tag) {
    case 'single':
    case 'empty':
      return emptyNode()
    case 'leaf': {
      const total = node.front + node.back
      if (total <= 1) return emptyNode()
      if (node.back > 0) {
        if (node.back === 1) {
          if (node.front === 0) return emptyNode()
          return { tag: 'leaf', front: node.front, back: 0, buffer: node.buffer.slice(0, node.front) }
        }
        const newBuf: (T | undefined)[] = node.buffer.slice(0, node.front)
        for (let i = node.buffer.length - node.back; i < node.buffer.length - 1; i++) newBuf.push(node.buffer[i])
        return { tag: 'leaf', front: node.front + node.back - 1, back: 0, buffer: newBuf }
      }
      if (node.front <= 1) return emptyNode()
      return { tag: 'leaf', front: node.front - 1, back: 0, buffer: node.buffer.slice(0, node.front - 1) }
    }
    case 'deep': {
      if (node.backLen > 1) {
        const newBuf: (T | undefined)[] = node.backBuffer.slice(0, node.backLen - 1)
        return makeDeep(node.frontBuffer, node.frontLen, node.spine, newBuf, node.backLen - 1)
      }
      if (node.backLen === 1) {
        const spineItems = flattenToBuffer(node.spine)
        const all: (T | undefined)[] = [...node.frontBuffer.slice(0, node.frontLen), ...spineItems]
        return makeLeaf(all.filter((v): v is T => v !== undefined))
      }
      const spineItems = flattenToBuffer(node.spine)
      if (spineItems.length > 0) {
        const rest: (T | undefined)[] = spineItems.slice(0, spineItems.length - 1)
        const all: (T | undefined)[] = [...node.frontBuffer.slice(0, node.frontLen), ...rest]
        return makeLeaf(all.filter((v): v is T => v !== undefined))
      }
      if (node.frontLen <= 1) return emptyNode()
      const newBuf: (T | undefined)[] = node.frontBuffer.slice(0, node.frontLen - 1)
      return makeLeaf(newBuf.filter((v): v is T => v !== undefined))
    }
  }
}

function frontNode<T>(node: CatenableDequeNode<T>): T | undefined {
  if (nodeSize(node) === 0) return undefined
  return getLeafFirst(node)
}

function backNode<T>(node: CatenableDequeNode<T>): T | undefined {
  if (nodeSize(node) === 0) return undefined
  return getLeafLast(node)
}

function flattenNode<T>(node: CatenableDequeNode<T>): T[] {
  const result: T[] = []
  switch (node.tag) {
    case 'empty': break
    case 'single':
      result.push(node.value)
      break
    case 'leaf':
      for (let i = 0; i < node.front; i++) {
        const v = node.buffer[i]
        if (v !== undefined) result.push(v)
      }
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) {
        const v = node.buffer[i]
        if (v !== undefined) result.push(v)
      }
      break
    case 'deep':
      for (let i = 0; i < node.frontLen; i++) {
        const v = node.frontBuffer[i]
        if (v !== undefined) result.push(v)
      }
      result.push(...flattenNode(node.spine))
      for (let i = 0; i < node.backLen; i++) {
        const v = node.backBuffer[i]
        if (v !== undefined) result.push(v)
      }
      break
  }
  return result
}

function forEachNode<T>(node: CatenableDequeNode<T>, fn: (value: T, index: number) => void, offset: number): number {
  switch (node.tag) {
    case 'empty': return offset
    case 'single':
      fn(node.value, offset)
      return offset + 1
    case 'leaf':
      for (let i = 0; i < node.front; i++) {
        const v = node.buffer[i]
        if (v !== undefined) { fn(v, offset); offset++ }
      }
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) {
        const v = node.buffer[i]
        if (v !== undefined) { fn(v, offset); offset++ }
      }
      return offset
    case 'deep':
      for (let i = 0; i < node.frontLen; i++) {
        const v = node.frontBuffer[i]
        if (v !== undefined) { fn(v, offset); offset++ }
      }
      offset = forEachNode(node.spine, fn, offset)
      for (let i = 0; i < node.backLen; i++) {
        const v = node.backBuffer[i]
        if (v !== undefined) { fn(v, offset); offset++ }
      }
      return offset
  }
}

function mapNode<T, U>(node: CatenableDequeNode<T>, fn: (value: T, index: number) => U, offset: number): { node: CatenableDequeNode<U>; offset: number } {
  switch (node.tag) {
    case 'empty':
      return { node: emptyNode<U>(), offset }
    case 'single':
      return { node: makeSingle(fn(node.value, offset)), offset: offset + 1 }
    case 'leaf': {
      const items: U[] = []
      for (let i = 0; i < node.front; i++) {
        const v = node.buffer[i]
        if (v !== undefined) { items.push(fn(v, offset + items.length)) }
      }
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) {
        const v = node.buffer[i]
        if (v !== undefined) { items.push(fn(v, offset + items.length)) }
      }
      return { node: makeLeaf(items), offset: offset + items.length }
    }
    case 'deep': {
      const frontItems: U[] = []
      for (let i = 0; i < node.frontLen; i++) {
        const v = node.frontBuffer[i]
        if (v !== undefined) { frontItems.push(fn(v, offset + frontItems.length)) }
      }
      const newOffset = offset + frontItems.length
      const spineResult = mapNode(node.spine, fn, newOffset)
      const backItems: U[] = []
      for (let i = 0; i < node.backLen; i++) {
        const v = node.backBuffer[i]
        if (v !== undefined) { backItems.push(fn(v, spineResult.offset + backItems.length)) }
      }
      const fb: (U | undefined)[] = frontItems.length > 0 ? frontItems : []
      const bb: (U | undefined)[] = backItems.length > 0 ? backItems : []
      return {
        node: makeDeep(fb, frontItems.length, spineResult.node, bb, backItems.length),
        offset: spineResult.offset + backItems.length,
      }
    }
  }
}

function filterNode<T>(node: CatenableDequeNode<T>, predicate: (value: T, index: number) => boolean, offset: number): T[] {
  const result: T[] = []
  switch (node.tag) {
    case 'empty': break
    case 'single':
      if (predicate(node.value, offset)) result.push(node.value)
      break
    case 'leaf': {
      let idx = offset
      for (let i = 0; i < node.front; i++) {
        const v = node.buffer[i]
        if (v !== undefined) {
          if (predicate(v, idx)) result.push(v)
          idx++
        }
      }
      for (let i = node.buffer.length - node.back; i < node.buffer.length; i++) {
        const v = node.buffer[i]
        if (v !== undefined) {
          if (predicate(v, idx)) result.push(v)
          idx++
        }
      }
      break
    }
    case 'deep': {
      let idx = offset
      for (let i = 0; i < node.frontLen; i++) {
        const v = node.frontBuffer[i]
        if (v !== undefined) {
          if (predicate(v, idx)) result.push(v)
          idx++
        }
      }
      const spineResult = filterNode(node.spine, predicate, idx)
      result.push(...spineResult)
      idx = offset + node.frontLen + nodeSize(node.spine)
      for (let i = 0; i < node.backLen; i++) {
        const v = node.backBuffer[i]
        if (v !== undefined) {
          if (predicate(v, idx)) result.push(v)
          idx++
        }
      }
      break
    }
  }
  return result
}

function reverseNode<T>(node: CatenableDequeNode<T>): CatenableDequeNode<T> {
  const items = flattenNode(node)
  items.reverse()
  return makeLeaf(items)
}

function nodeDepth<T>(node: CatenableDequeNode<T>): number {
  switch (node.tag) {
    case 'empty': return 0
    case 'single': return 1
    case 'leaf': return 1
    case 'deep': return 1 + nodeDepth(node.spine)
  }
}

function countNodes<T>(node: CatenableDequeNode<T>): { leaves: number; nodes: number } {
  switch (node.tag) {
    case 'empty': return { leaves: 0, nodes: 0 }
    case 'single': return { leaves: 1, nodes: 0 }
    case 'leaf': return { leaves: 1, nodes: 0 }
    case 'deep': {
      const spine = countNodes(node.spine)
      return { leaves: spine.leaves, nodes: spine.nodes + 1 }
    }
  }
}

export class CatenableDeque<T> {
  private readonly _root: CatenableDequeNode<T>

  private constructor(root: CatenableDequeNode<T>) {
    this._root = root
  }

  static empty<T>(): CatenableDeque<T> {
    return new CatenableDeque<T>(emptyNode())
  }

  static fromArray<T>(items: readonly T[]): CatenableDeque<T> {
    if (items.length === 0) return CatenableDeque.empty()
    return new CatenableDeque(makeLeaf([...items]))
  }

  static of<T>(...items: T[]): CatenableDeque<T> {
    return CatenableDeque.fromArray(items)
  }

  pushFront(value: T): CatenableDeque<T> {
    return new CatenableDeque(pushFrontNode(this._root, value))
  }

  pushBack(value: T): CatenableDeque<T> {
    return new CatenableDeque(pushBackNode(this._root, value))
  }

  popFront(): CatenableDeque<T> {
    return new CatenableDeque(popFrontNode(this._root))
  }

  popBack(): CatenableDeque<T> {
    return new CatenableDeque(popBackNode(this._root))
  }

  front(): T | undefined {
    return frontNode(this._root)
  }

  back(): T | undefined {
    return backNode(this._root)
  }

  get size(): number {
    return nodeSize(this._root)
  }

  get isEmpty(): boolean {
    return nodeSize(this._root) === 0
  }

  clear(): CatenableDeque<T> {
    return CatenableDeque.empty()
  }

  concat(other: CatenableDeque<T>): CatenableDeque<T> {
    if (this.isEmpty) return other
    if (other.isEmpty) return this
    return new CatenableDeque(concatNodes(this._root, other._root))
  }

  toArray(): T[] {
    return flattenNode(this._root)
  }

  forEach(fn: (value: T, index: number) => void): void {
    forEachNode(this._root, fn, 0)
  }

  map<U>(fn: (value: T, index: number) => U): CatenableDeque<U> {
    return new CatenableDeque(mapNode(this._root, fn, 0).node)
  }

  filter(predicate: (value: T, index: number) => boolean): CatenableDeque<T> {
    return CatenableDeque.fromArray(filterNode(this._root, predicate, 0))
  }

  reverse(): CatenableDeque<T> {
    return new CatenableDeque(reverseNode(this._root))
  }

  clone(): CatenableDeque<T> {
    return new CatenableDeque(this._root)
  }

  reduce<U>(fn: (acc: U, value: T, index: number) => U, initial: U): U {
    let acc = initial
    let idx = 0
    this.forEach((v) => {
      acc = fn(acc, v, idx)
      idx++
    })
    return acc
  }

  find(predicate: (value: T, index: number) => boolean): T | undefined {
    let idx = 0
    for (const v of this) {
      if (predicate(v, idx)) return v
      idx++
    }
    return undefined
  }

  findIndex(predicate: (value: T, index: number) => boolean): number {
    let idx = 0
    for (const v of this) {
      if (predicate(v, idx)) return idx
      idx++
    }
    return -1
  }

  some(predicate: (value: T, index: number) => boolean): boolean {
    let idx = 0
    for (const v of this) {
      if (predicate(v, idx)) return true
      idx++
    }
    return false
  }

  every(predicate: (value: T, index: number) => boolean): boolean {
    let idx = 0
    for (const v of this) {
      if (!predicate(v, idx)) return false
      idx++
    }
    return true
  }

  contains(value: T): boolean {
    for (const v of this) {
      if (v === value) return true
    }
    return false
  }

  indexOf(value: T): number {
    let idx = 0
    for (const v of this) {
      if (v === value) return idx
      idx++
    }
    return -1
  }

  lastIndexOf(value: T): number {
    const arr = this.toArray()
    return arr.lastIndexOf(value)
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined
    const arr = this.toArray()
    return arr[index]
  }

  slice(start?: number, end?: number): CatenableDeque<T> {
    const arr = this.toArray()
    return CatenableDeque.fromArray(arr.slice(start, end))
  }

  take(n: number): CatenableDeque<T> {
    if (n <= 0) return CatenableDeque.empty()
    if (n >= this.size) return this.clone()
    return this.slice(0, n)
  }

  drop(n: number): CatenableDeque<T> {
    if (n <= 0) return this.clone()
    if (n >= this.size) return CatenableDeque.empty()
    return this.slice(n)
  }

  join(separator?: string): string {
    const arr = this.toArray()
    return arr.join(separator)
  }

  equals(other: CatenableDeque<T>, comparator?: (a: T, b: T) => boolean): boolean {
    if (this.size !== other.size) return false
    const cmp = comparator ?? ((a: T, b: T) => a === b)
    const thisArr = this.toArray()
    const otherArr = other.toArray()
    for (let i = 0; i < thisArr.length; i++) {
      if (!cmp(thisArr[i]!, otherArr[i]!)) return false
    }
    return true
  }

  flatMap<U>(fn: (value: T, index: number) => CatenableDeque<U>): CatenableDeque<U> {
    let result = CatenableDeque.empty<U>()
    let idx = 0
    for (const v of this) {
      result = result.concat(fn(v, idx))
      idx++
    }
    return result
  }

  stats(): CatenableDequeStats {
    const counts = countNodes(this._root)
    return {
      size: this.size,
      depth: nodeDepth(this._root),
      leafCount: counts.leaves,
      nodeCount: counts.nodes,
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* flattenNode(this._root)
  }

  toString(): string {
    return `${CatenableDeque}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
}

export type { CatenableDequeNode, CatenableDequeStats } from './types.js'
