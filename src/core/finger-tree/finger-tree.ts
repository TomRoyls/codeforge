import type { FingerTreeOptions, FingerTreeStats } from './types.js'
import { DEFAULT_FINGERTREE_OPTIONS } from './types.js'

type Digit = readonly unknown[]

type Deep = {
  readonly left: Digit
  readonly spine: FingerTreeInternal
  readonly right: Digit
  readonly cachedSize: number
}

type FingerTreeInternal =
  | { readonly tag: 'empty' }
  | { readonly tag: 'single'; readonly value: unknown }
  | { readonly tag: 'deep'; readonly data: Deep }

function isEmptyFT(ft: FingerTreeInternal): ft is { readonly tag: 'empty' } {
  return ft.tag === 'empty'
}

function isSingleFT(ft: FingerTreeInternal): ft is { readonly tag: 'single'; readonly value: unknown } {
  return ft.tag === 'single'
}

function emptyFT(): FingerTreeInternal {
  return { tag: 'empty' }
}

function singleFT(value: unknown): FingerTreeInternal {
  return { tag: 'single', value }
}

function leafCount(value: unknown): number {
  if (Array.isArray(value)) {
    let c = 0
    for (let i = 0; i < value.length; i++) c += leafCount(value[i])
    return c
  }
  return 1
}

function digitLeafCount(d: Digit): number {
  let c = 0
  for (let i = 0; i < d.length; i++) c += leafCount(d[i])
  return c
}

function spineLeafCount(ft: FingerTreeInternal): number {
  if (isEmptyFT(ft)) return 0
  if (isSingleFT(ft)) return leafCount(ft.value)
  return ft.data.cachedSize
}

function deepFT(left: Digit, spine: FingerTreeInternal, right: Digit): FingerTreeInternal {
  const ss = spineLeafCount(spine)
  const ls = digitLeafCount(left)
  const rs = digitLeafCount(right)
  return { tag: 'deep', data: { left, spine, right, cachedSize: ls + ss + rs } }
}

function prependFT(ft: FingerTreeInternal, value: unknown, maxDigit: number): FingerTreeInternal {
  if (isEmptyFT(ft)) return singleFT(value)
  if (isSingleFT(ft)) {
    return deepFT([value], emptyFT(), [ft.value])
  }
  const d = ft.data
  if (d.left.length < maxDigit) {
    return deepFT([value, ...d.left], d.spine, d.right)
  }
  const keepCount = Math.max(1, Math.floor(maxDigit / 2))
  const rest = d.left.slice(0, keepCount)
  const nodeArr = d.left.slice(keepCount)
  return deepFT(
    [value, ...rest],
    prependFT(d.spine, nodeArr, maxDigit),
    d.right,
  )
}

function appendFT(ft: FingerTreeInternal, value: unknown, maxDigit: number): FingerTreeInternal {
  if (isEmptyFT(ft)) return singleFT(value)
  if (isSingleFT(ft)) {
    return deepFT([ft.value], emptyFT(), [value])
  }
  const d = ft.data
  if (d.right.length < maxDigit) {
    return deepFT(d.left, d.spine, [...d.right, value])
  }
  const keepCount = Math.max(1, Math.floor(maxDigit / 2))
  const nodeArr = d.right.slice(0, d.right.length - keepCount)
  const rest = d.right.slice(d.right.length - keepCount)
  return deepFT(
    d.left,
    appendFT(d.spine, nodeArr, maxDigit),
    [...rest, value],
  )
}

function headFT(ft: FingerTreeInternal): unknown {
  if (isEmptyFT(ft)) return undefined
  if (isSingleFT(ft)) return ft.value
  return ft.data.left[0]
}

function lastFT(ft: FingerTreeInternal): unknown {
  if (isEmptyFT(ft)) return undefined
  if (isSingleFT(ft)) return ft.value
  const r = ft.data.right
  return r[r.length - 1]
}

function viewL(ft: FingerTreeInternal, maxDigit: number): [unknown, FingerTreeInternal] | undefined {
  if (isEmptyFT(ft)) return undefined
  if (isSingleFT(ft)) return [ft.value, emptyFT()]
  const d = ft.data
  const first = d.left[0]!
  const restLeft = d.left.slice(1)
  if (restLeft.length > 0) {
    return [first, deepFT(restLeft, d.spine, d.right)]
  }
  return [first, rotateLeft(d.spine, d.right, maxDigit)]
}

function flattenAll(value: unknown, out: unknown[]): void {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) flattenAll(value[i], out)
  } else {
    out.push(value)
  }
}

function flattenNode(node: unknown): unknown[] {
  if (Array.isArray(node)) {
    const result: unknown[] = []
    for (let i = 0; i < node.length; i++) flattenAll(node[i], result)
    return result
  }
  return [node]
}

function rotateLeft(spine: FingerTreeInternal, right: Digit, maxDigit: number): FingerTreeInternal {
  if (isEmptyFT(spine)) {
    if (right.length === 0) return emptyFT()
    if (right.length === 1) return singleFT(right[0])
    const mid = Math.floor(right.length / 2)
    return deepFT(right.slice(0, mid), emptyFT(), right.slice(mid))
  }
  if (isSingleFT(spine)) {
    const flat = flattenNode(spine.value)
    if (right.length === 0) {
      if (flat.length <= maxDigit) return deepFT(flat, emptyFT(), [])
      const half = Math.floor(flat.length / 2)
      return deepFT(flat.slice(0, half), emptyFT(), flat.slice(half))
    }
    if (flat.length === 0) return fromArray([...right], maxDigit)
    return deepFT(flat, emptyFT(), [...right])
  }
  const sd = spine.data
  const vl = viewL(sd.spine, maxDigit)
  const flatLeft = flattenDigit(sd.left)
  const flatRight = flattenDigit(sd.right)
  const allMid = [...flatLeft, ...flatRight]
  if (vl === undefined) {
    if (right.length === 0) {
      if (allMid.length === 0) return emptyFT()
      return fromArray(allMid, maxDigit)
    }
    if (allMid.length === 0) return fromArray([...right], maxDigit)
    return deepFT(allMid, emptyFT(), [...right])
  }
  if (right.length === 0) {
    return deepFT(allMid.length > 0 ? allMid : [], vl[1], [])
  }
  return deepFT(allMid, vl[1], [...right])
}

function viewR(ft: FingerTreeInternal, maxDigit: number): [FingerTreeInternal, unknown] | undefined {
  if (isEmptyFT(ft)) return undefined
  if (isSingleFT(ft)) return [emptyFT(), ft.value]
  const d = ft.data
  const last = d.right[d.right.length - 1]!
  const restRight = d.right.slice(0, -1)
  if (restRight.length > 0) {
    return [deepFT(d.left, d.spine, restRight), last]
  }
  return [rotateRight(d.left, d.spine, maxDigit), last]
}

function rotateRight(left: Digit, spine: FingerTreeInternal, maxDigit: number): FingerTreeInternal {
  if (isEmptyFT(spine)) {
    if (left.length === 0) return emptyFT()
    if (left.length === 1) return singleFT(left[0])
    const mid = Math.floor(left.length / 2)
    return deepFT(left.slice(0, mid), emptyFT(), left.slice(mid))
  }
  if (isSingleFT(spine)) {
    const flat = flattenNode(spine.value)
    if (left.length === 0) {
      if (flat.length <= maxDigit) return deepFT(flat, emptyFT(), [])
      const half = Math.floor(flat.length / 2)
      return deepFT(flat.slice(0, half), emptyFT(), flat.slice(half))
    }
    if (flat.length === 0) return fromArray([...left], maxDigit)
    return deepFT([...left], emptyFT(), flat)
  }
  const sd = spine.data
  const vr = viewR(sd.spine, maxDigit)
  const flatLeft = flattenDigit(sd.left)
  const flatRight = flattenDigit(sd.right)
  const allMid = [...flatLeft, ...flatRight]
  if (vr === undefined) {
    if (left.length === 0) {
      if (allMid.length === 0) return emptyFT()
      return fromArray(allMid, maxDigit)
    }
    if (allMid.length === 0) return fromArray([...left], maxDigit)
    return deepFT([...left], emptyFT(), allMid)
  }
  if (left.length === 0) {
    return deepFT([], vr[0], allMid.length > 0 ? allMid : [])
  }
  return deepFT([...left], vr[0], allMid)
}

function flattenDigit(d: Digit): unknown[] {
  const result: unknown[] = []
  for (let i = 0; i < d.length; i++) flattenAll(d[i], result)
  return result
}

function concatFT(left: FingerTreeInternal, right: FingerTreeInternal, maxDigit: number): FingerTreeInternal {
  if (isEmptyFT(left)) return right
  if (isEmptyFT(right)) return left
  if (isSingleFT(left)) return prependFT(right, left.value, maxDigit)
  if (isSingleFT(right)) return appendFT(left, right.value, maxDigit)
  return concatDeep(left.data, right.data, maxDigit)
}

function concatDeep(ld: Deep, rd: Deep, maxDigit: number): FingerTreeInternal {
  const midNodes = [...ld.right, ...rd.left]
  const newSpine = concatFT(ld.spine, rd.spine, maxDigit)
  const finalSpine = insertAll(newSpine, midNodes, maxDigit)
  return deepFT(ld.left, finalSpine, rd.right)
}

function insertAll(ft: FingerTreeInternal, items: readonly unknown[], maxDigit: number): FingerTreeInternal {
  let result = ft
  for (let i = 0; i < items.length; i += maxDigit) {
    const chunk = items.slice(i, i + maxDigit)
    if (chunk.length > 0) {
      result = appendFT(result, chunk, maxDigit)
    }
  }
  return result
}

function toLeafArray(ft: FingerTreeInternal): unknown[] {
  if (isEmptyFT(ft)) return []
  if (isSingleFT(ft)) {
    if (Array.isArray(ft.value)) {
      const result: unknown[] = []
      flattenAll(ft.value, result)
      return result
    }
    return [ft.value]
  }
  const d = ft.data
  const result: unknown[] = []
  for (let i = 0; i < d.left.length; i++) result.push(d.left[i])
  collectSpine(d.spine, result)
  for (let i = 0; i < d.right.length; i++) result.push(d.right[i])
  return result
}

function collectSpine(ft: FingerTreeInternal, out: unknown[]): void {
  if (isEmptyFT(ft)) return
  if (isSingleFT(ft)) {
    flattenAll(ft.value, out)
    return
  }
  const d = ft.data
  for (let i = 0; i < d.left.length; i++) flattenAll(d.left[i], out)
  collectSpine(d.spine, out)
  for (let i = 0; i < d.right.length; i++) flattenAll(d.right[i], out)
}

function depthFT(ft: FingerTreeInternal): number {
  if (isEmptyFT(ft) || isSingleFT(ft)) return 0
  return 1 + depthFT(ft.data.spine)
}

function computeSize(ft: FingerTreeInternal): number {
  if (isEmptyFT(ft)) return 0
  if (isSingleFT(ft)) return leafCount(ft.value)
  return ft.data.cachedSize
}

function splitFT(ft: FingerTreeInternal, index: number, maxDigit: number): [FingerTreeInternal, FingerTreeInternal] {
  if (isEmptyFT(ft)) return [emptyFT(), emptyFT()]
  if (isSingleFT(ft)) {
    if (index <= 0) return [emptyFT(), ft]
    return [ft, emptyFT()]
  }
  const totalSize = ft.data.cachedSize
  if (index <= 0) return [emptyFT(), ft]
  if (index >= totalSize) return [ft, emptyFT()]
  const allLeafs = toLeafArray(ft)
  const leftArr = allLeafs.slice(0, index)
  const rightArr = allLeafs.slice(index)
  return [fromArray(leftArr, maxDigit), fromArray(rightArr, maxDigit)]
}

function fromArray(items: readonly unknown[], maxDigit: number): FingerTreeInternal {
  if (items.length === 0) return emptyFT()
  if (items.length === 1) return singleFT(items[0])
  if (items.length <= maxDigit) {
    const mid = Math.ceil(items.length / 2)
    return deepFT(items.slice(0, mid), emptyFT(), items.slice(mid))
  }
  if (items.length <= maxDigit * 2) {
    const mid = Math.floor(items.length / 2)
    return deepFT(items.slice(0, mid), emptyFT(), items.slice(mid))
  }
  const leftSize = maxDigit
  const rightSize = maxDigit
  const left = items.slice(0, leftSize)
  const right = items.slice(items.length - rightSize)
  const midItems = items.slice(leftSize, items.length - rightSize)
  let spine = emptyFT()
  for (let i = 0; i < midItems.length; i += maxDigit) {
    const chunk = midItems.slice(i, i + maxDigit)
    if (chunk.length > 0) {
      spine = appendFT(spine, chunk, maxDigit)
    }
  }
  return deepFT(left, spine, right)
}

interface InternalState {
  tree: FingerTreeInternal
  maxDigit: number
}

export class FingerTree<T = unknown> {
  private readonly state: InternalState

  constructor(items?: readonly T[], options?: Partial<FingerTreeOptions>) {
    const opts = { ...DEFAULT_FINGERTREE_OPTIONS, ...options }
    this.state = { maxDigit: opts.maxDigitSize, tree: fromArray(items ?? [], opts.maxDigitSize) }
  }

  private fromInternal(tree: FingerTreeInternal): FingerTree<T> {
    const ft = Object.create(FingerTree.prototype) as FingerTree<T>
    ;(ft as unknown as { state: InternalState }).state = { maxDigit: this.state.maxDigit, tree }
    return ft
  }

  prepend(value: T): FingerTree<T> {
    return this.fromInternal(prependFT(this.state.tree, value, this.state.maxDigit))
  }

  append(value: T): FingerTree<T> {
    return this.fromInternal(appendFT(this.state.tree, value, this.state.maxDigit))
  }

  head(): T | undefined {
    const v = headFT(this.state.tree)
    return v as T | undefined
  }

  last(): T | undefined {
    const v = lastFT(this.state.tree)
    return v as T | undefined
  }

  tail(): FingerTree<T> {
    const v = viewL(this.state.tree, this.state.maxDigit)
    if (v === undefined) return this.fromInternal(emptyFT())
    return this.fromInternal(v[1])
  }

  init(): FingerTree<T> {
    const v = viewR(this.state.tree, this.state.maxDigit)
    if (v === undefined) return this.fromInternal(emptyFT())
    return this.fromInternal(v[0])
  }

  get isEmpty(): boolean {
    return isEmptyFT(this.state.tree)
  }

  get size(): number {
    return computeSize(this.state.tree)
  }

  toArray(): T[] {
    return toLeafArray(this.state.tree) as T[]
  }

  forEach(callback: (value: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      callback(arr[i]!, i)
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      yield arr[i]!
    }
  }

  concat(other: FingerTree<T>): FingerTree<T> {
    return this.fromInternal(concatFT(this.state.tree, other.state.tree, this.state.maxDigit))
  }

  split(index: number): [FingerTree<T>, FingerTree<T>] {
    const [l, r] = splitFT(this.state.tree, index, this.state.maxDigit)
    return [this.fromInternal(l), this.fromInternal(r)]
  }

  stats(): FingerTreeStats {
    return {
      size: this.size,
      depth: depthFT(this.state.tree),
    }
  }
}
