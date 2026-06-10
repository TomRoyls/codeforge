import type { FingerTreeMeasurer, Affix } from './types.js'

export type { FingerTreeMeasurer, Affix }

type Nd = { readonly t: 2 | 3; readonly c: readonly unknown[] }
type FT =
  | { readonly tag: 'e' }
  | { readonly tag: 's'; readonly v: unknown }
  | { readonly tag: 'd'; readonly l: readonly unknown[]; readonly m: FT; readonly r: readonly unknown[] }

function nd(vals: unknown[]): Nd {
  if (vals.length === 2) return { t: 2, c: vals }
  return { t: 3, c: vals }
}

function isNd(v: unknown): v is Nd {
  return typeof v === 'object' && v !== null && 't' in v && 'c' in v
}

function ndArr(n: Nd): readonly unknown[] { return n.c }

function countLeaf(arr: readonly unknown[]): number {
  let c = 0
  for (const v of arr) c += isNd(v) ? countLeaf(v.c) : 1
  return c
}

function flatLeaf(arr: readonly unknown[], out: unknown[]): void {
  for (const v of arr) {
    if (isNd(v)) flatLeaf(v.c, out)
    else out.push(v)
  }
}

const E: FT = { tag: 'e' }
function S(v: unknown): FT { return { tag: 's', v } }
function D(l: readonly unknown[], m: FT, r: readonly unknown[]): FT { return { tag: 'd', l, m, r } }

function sz(tree: FT): number {
  if (tree.tag === 'e') return 0
  if (tree.tag === 's') return isNd(tree.v) ? countLeaf(tree.v.c) : 1
  return countLeaf(tree.l) + sz(tree.m) + countLeaf(tree.r)
}

function collect(tree: FT, out: unknown[]): void {
  if (tree.tag === 'e') return
  if (tree.tag === 's') {
    if (isNd(tree.v)) flatLeaf(tree.v.c, out)
    else out.push(tree.v)
    return
  }
  flatLeaf(tree.l, out)
  collect(tree.m, out)
  flatLeaf(tree.r, out)
}

function fromFlat(arr: readonly unknown[]): FT {
  if (arr.length === 0) return E
  if (arr.length === 1) return S(arr[0])
  if (arr.length <= 4) {
    const m = Math.ceil(arr.length / 2)
    return D(arr.slice(0, m), E, arr.slice(m))
  }
  let r: FT = E
  for (const v of arr) r = pb(r, v)
  return r
}

function pf(val: unknown, tree: FT): FT {
  if (tree.tag === 'e') return S(val)
  if (tree.tag === 's') return D([val], E, [tree.v])
  if (tree.l.length < 4) return D([val, ...tree.l], tree.m, tree.r)
  const [a, b, c, d] = tree.l
  const node = nd([b, c, d])
  return D([val, a], pf(node, tree.m), tree.r)
}

function pb(tree: FT, val: unknown): FT {
  if (tree.tag === 'e') return S(val)
  if (tree.tag === 's') return D([tree.v], E, [val])
  if (tree.r.length < 4) return D(tree.l, tree.m, [...tree.r, val])
  const [a, b, c, d] = tree.r
  const node = nd([a, b, c])
  return D(tree.l, pb(tree.m, node), [d, val])
}

function vf(tree: FT): { v: unknown; rest: FT } | null {
  if (tree.tag === 'e') return null
  if (tree.tag === 's') return { v: tree.v, rest: E }
  const [first, ...rl] = tree.l
  if (rl.length > 0) return { v: first, rest: D(rl, tree.m, tree.r) }
  return { v: first, rest: pullF(tree.m, tree.r) }
}

function pullF(m: FT, r: readonly unknown[]): FT {
  if (m.tag === 'e') return fromFlat(r)
  if (m.tag === 's') {
    const ch = isNd(m.v) ? ndArr(m.v) : [m.v]
    return r.length === 0 ? fromFlat(ch) : D(ch, E, r)
  }
  const first = m.l[0]!
  const restL = m.l.slice(1)
  const ch = isNd(first) ? ndArr(first) : [first]
  const newM: FT = restL.length > 0
    ? D(restL, m.m, m.r)
    : (m.m.tag === 'e' ? fromFlat(m.r) : pullF(m.m, m.r))
  return D(ch, newM, r)
}

function vb(tree: FT): { v: unknown; rest: FT } | null {
  if (tree.tag === 'e') return null
  if (tree.tag === 's') return { v: tree.v, rest: E }
  const last = tree.r[tree.r.length - 1]!
  const rr = tree.r.slice(0, -1)
  if (rr.length > 0) return { v: last, rest: D(tree.l, tree.m, rr) }
  return { v: last, rest: pullB(tree.l, tree.m) }
}

function pullB(l: readonly unknown[], m: FT): FT {
  if (m.tag === 'e') return fromFlat(l)
  if (m.tag === 's') {
    const ch = isNd(m.v) ? ndArr(m.v) : [m.v]
    return l.length === 0 ? fromFlat(ch) : D(l, E, ch)
  }
  const last = m.r[m.r.length - 1]!
  const restR = m.r.slice(0, -1)
  const ch = isNd(last) ? ndArr(last) : [last]
  const newM: FT = restR.length > 0
    ? D(m.l, m.m, restR)
    : (m.m.tag === 'e' ? fromFlat(m.l) : pullB(m.l, m.m))
  return D(l, newM, ch)
}

function cat(a: FT, b: FT): FT {
  if (a.tag === 'e') return b
  if (b.tag === 'e') return a
  if (a.tag === 's') return pf(a.v, b)
  if (b.tag === 's') return pb(a, b.v)
  const mid = [...a.r, ...b.l]
  const nm = cat(a.m, catMid(mid, b.m))
  return D(a.l, nm, b.r)
}

function catMid(mid: unknown[], right: FT): FT {
  if (mid.length === 0) return right
  if (mid.length === 1) return pf(mid[0], right)
  if (mid.length === 2) return pf(nd([mid[0], mid[1]]), right)
  if (mid.length === 3) return pf(nd([mid[0], mid[1], mid[2]]), right)
  const node = nd([mid[0], mid[1], mid[2]])
  return pf(node, catMid(mid.slice(3), right))
}

function getAt(tree: FT, idx: number): unknown {
  if (tree.tag === 'e') return undefined
  if (tree.tag === 's') {
    if (isNd(tree.v)) return getAffix(tree.v.c, idx)
    return idx === 0 ? tree.v : undefined
  }
  const lLen = countLeaf(tree.l)
  if (idx < lLen) return getAffix(tree.l, idx)
  const mLen = sz(tree.m)
  if (idx < lLen + mLen) return getAt(tree.m, idx - lLen)
  return getAffix(tree.r, idx - lLen - mLen)
}

function getAffix(arr: readonly unknown[], idx: number): unknown {
  for (const v of arr) {
    if (isNd(v)) {
      const len = countLeaf(v.c)
      if (idx < len) return getAffix(v.c, idx)
      idx -= len
    } else {
      if (idx === 0) return v
      idx--
    }
  }
  return undefined
}

function setAt(tree: FT, idx: number, val: unknown): FT {
  if (tree.tag === 'e') return tree
  if (tree.tag === 's') {
    if (isNd(tree.v)) {
      const len = countLeaf(tree.v.c)
      if (idx < 0 || idx >= len) return tree
      return S({ t: tree.v.t, c: setAffix(tree.v.c, idx, val) })
    }
    return idx === 0 ? S(val) : tree
  }
  const lLen = countLeaf(tree.l)
  if (idx < lLen) return D(setAffix(tree.l, idx, val), tree.m, tree.r)
  const mLen = sz(tree.m)
  if (idx < lLen + mLen) return D(tree.l, setAt(tree.m, idx - lLen, val), tree.r)
  return D(tree.l, tree.m, setAffix(tree.r, idx - lLen - mLen, val))
}

function setAffix(arr: readonly unknown[], idx: number, val: unknown): readonly unknown[] {
  const result: unknown[] = []
  for (const v of arr) {
    if (isNd(v)) {
      const len = countLeaf(v.c)
      if (idx < len) {
        result.push({ t: v.t, c: setAffix(v.c, idx, val) })
        idx = -1
      } else {
        idx -= len
        result.push(v)
      }
    } else {
      if (idx === 0) { result.push(val); idx = -1 }
      else { result.push(v); idx-- }
    }
  }
  return result
}

function splitTree(tree: FT, idx: number): [FT, FT] {
  if (idx <= 0) return [E, tree]
  const total = sz(tree)
  if (idx >= total) return [tree, E]
  let right = tree
  for (let i = 0; i < idx; i++) {
    const v = vf(right)
    if (v) right = v.rest
  }
  const leftArr: unknown[] = []
  collectUpTo(tree, idx, leftArr)
  let left: FT = E
  for (const v of leftArr) left = pb(left, v)
  return [left, right]
}

function collectUpTo(tree: FT, count: number, out: unknown[]): number {
  if (count <= 0 || tree.tag === 'e') return count
  if (tree.tag === 's') {
    if (isNd(tree.v)) {
      count = collectAffixUpTo(tree.v.c, count, out)
    } else { out.push(tree.v); count-- }
    return count
  }
  count = collectAffixUpTo(tree.l, count, out)
  if (count <= 0) return count
  count = collectUpTo(tree.m, count, out)
  if (count <= 0) return count
  count = collectAffixUpTo(tree.r, count, out)
  return count
}

function collectAffixUpTo(arr: readonly unknown[], count: number, out: unknown[]): number {
  for (const v of arr) {
    if (count <= 0) break
    if (isNd(v)) {
      count = collectAffixUpTo(v.c, count, out)
    } else { out.push(v); count-- }
  }
  return count
}

function leafFirst(v: unknown): unknown {
  if (isNd(v)) return leafFirst(v.c[0]!)
  return v
}

function leafLast(v: unknown): unknown {
  if (isNd(v)) { const a = v.c; return leafLast(a[a.length - 1]!) }
  return v
}

function firstLeaf(tree: FT): unknown {
  if (tree.tag === 'e') return undefined
  if (tree.tag === 's') return leafFirst(tree.v)
  return leafFirst(tree.l[0]!)
}

function lastLeaf(tree: FT): unknown {
  if (tree.tag === 'e') return undefined
  if (tree.tag === 's') return leafLast(tree.v)
  return leafLast(tree.r[tree.r.length - 1]!)
}

export class FingerTree2<T> {
  private root: FT

  constructor(items?: Iterable<T>) {
    this.root = E
    if (items) {
      for (const item of items) {
        this.root = pb(this.root, item)
      }
    }
  }

  pushFront(value: T): FingerTree2<T> {
    const result = new FingerTree2<T>()
    result.root = pf(value, this.root)
    return result
  }

  pushBack(value: T): FingerTree2<T> {
    const result = new FingerTree2<T>()
    result.root = pb(this.root, value)
    return result
  }

  popFront(): FingerTree2<T> {
    const v = vf(this.root)
    if (!v) return this
    const result = new FingerTree2<T>()
    result.root = v.rest
    return result
  }

  popBack(): FingerTree2<T> {
    const v = vb(this.root)
    if (!v) return this
    const result = new FingerTree2<T>()
    result.root = v.rest
    return result
  }

  front(): T | undefined {
    return firstLeaf(this.root) as T | undefined
  }

  back(): T | undefined {
    return lastLeaf(this.root) as T | undefined
  }

  peekFront(): T | undefined {
    return this.front()
  }

  peekBack(): T | undefined {
    return this.back()
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this.size) return undefined
    return getAt(this.root, index) as T | undefined
  }

  set(index: number, value: T): FingerTree2<T> {
    if (index < 0 || index >= this.size) return this
    const result = new FingerTree2<T>()
    result.root = setAt(this.root, index, value)
    return result
  }

  concat(other: FingerTree2<T>): FingerTree2<T> {
    const result = new FingerTree2<T>()
    result.root = cat(this.root, other.root)
    return result
  }

  split(index: number): [FingerTree2<T>, FingerTree2<T>] {
    const [left, right] = splitTree(this.root, index)
    const leftTree = new FingerTree2<T>()
    leftTree.root = left
    const rightTree = new FingerTree2<T>()
    rightTree.root = right
    return [leftTree, rightTree]
  }

  get size(): number {
    return sz(this.root)
  }

  get isEmpty(): boolean {
    return this.root.tag === 'e'
  }

  toArray(): T[] {
    const out: unknown[] = []
    collect(this.root, out)
    return out as T[]
  }

  forEach(fn: (value: T, index: number) => void): void {
    const arr = this.toArray()
    for (let i = 0; i < arr.length; i++) {
      fn(arr[i]!, i)
    }
  }

  map<U>(fn: (value: T, index: number) => U): FingerTree2<U> {
    const arr = this.toArray()
    const mapped = arr.map((v, i) => fn(v, i))
    return new FingerTree2(mapped)
  }

  *[Symbol.iterator](): Iterator<T> {
    const arr = this.toArray()
    for (const v of arr) yield v
  }

  static fromArray<T>(items: T[]): FingerTree2<T> {
    return new FingerTree2(items)
  }


  toString(): string {
    return `${FingerTree2}({ size: ${this.size} })`
  }


  toJSON() {
    return { type: 'FingerTree2', size: this.size, items: this.toArray() }
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.toArray().every(predicate)
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.toArray().some(predicate)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.toArray().find(predicate)
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.toArray().findIndex(predicate)
  }

  includes(item: T): boolean {
    return this.toArray().includes(item)
  }

  at(index: number): T | undefined {
    const arr = this.toArray()
    return index >= 0 ? arr[index] : arr[arr.length + index]
  }

  join(separator: string = ', '): string {
    return this.toArray().join(separator)
  }

  count(predicate: (item: T) => boolean): number {
    let c = 0
    for (const item of this.toArray()) {
      if (predicate(item)) c++
    }
    return c
  }



  static empty<T>(): FingerTree2<T> {
    return new FingerTree2<T>()
  }

  first(): T | undefined {
    return this.at(0)
  }

  last(): T | undefined {
    return this.at(-1)
  }

  unique(): T[] {
    return [...new Set(this.toArray())]
  }

  partition(predicate: (item: T) => boolean): [T[], T[]] {
    const pass: T[] = []
    const fail: T[] = []
    for (const item of this.toArray()) {
      if (predicate(item)) pass.push(item)
      else fail.push(item)
    }
    return [pass, fail]
  }

  tap(callback: (collection: this) => void): this {
    callback(this)
    return this
  }

  min(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a < b ? a : b)
  }

  max(): T | undefined {
    const arr = this.toArray()
    if (arr.length === 0) return undefined
    return arr.reduce((a, b) => a > b ? a : b)
  }

  take(n: number): T[] {
    return this.toArray().slice(0, n)
  }

  skip(n: number): T[] {
    return this.toArray().slice(n)
  }
}
