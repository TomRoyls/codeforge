import type { RoaringBitmapOptions, RoaringBitmapJSON, RoaringBitmapStatistics } from './types.js'
import { DEFAULT_ROARING_BITMAP_OPTIONS } from './types.js'

const BITMAP_CONTAINER_SIZE = 1024
const ARRAY_CONTAINER_MAX_CARDINALITY = 4096
const UINT16_MAX = 65535
const HIGH_BITS_SHIFT = 16
const LOW_BITS_MASK = 0xFFFF

interface ArrayContainer {
  type: 'array'
  cardinality: number
  values: Uint16Array
}

interface BitmapContainer {
  type: 'bitmap'
  cardinality: number
  bitmap: Uint8Array
}

interface RunContainer {
  type: 'run'
  cardinality: number
  runs: Array<{ start: number; length: number }>
}

type Container = ArrayContainer | BitmapContainer | RunContainer

function highBits(value: number): number {
  return (value >>> HIGH_BITS_SHIFT) & LOW_BITS_MASK
}

function lowBits(value: number): number {
  return value & LOW_BITS_MASK
}

function combineKeyLow(key: number, low: number): number {
  return ((key << HIGH_BITS_SHIFT) | low) >>> 0
}

function binarySearch(arr: Uint16Array, len: number, value: number): number {
  let lo = 0
  let hi = len - 1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    const v = arr[mid]!
    if (v < value) {
      lo = mid + 1
    } else if (v > value) {
      hi = mid - 1
    } else {
      return mid
    }
  }
  return -(lo + 1)
}

function createArrayContainer(): ArrayContainer {
  return { type: 'array', cardinality: 0, values: new Uint16Array(ARRAY_CONTAINER_MAX_CARDINALITY) }
}

function createBitmapContainer(): BitmapContainer {
  return { type: 'bitmap', cardinality: 0, bitmap: new Uint8Array(BITMAP_CONTAINER_SIZE) }
}

function createRunContainer(): RunContainer {
  return { type: 'run', cardinality: 0, runs: [] }
}

function arrayContainerAdd(c: ArrayContainer, low: number): boolean {
  const idx = binarySearch(c.values, c.cardinality, low)
  if (idx >= 0) return false
  const insertAt = -idx - 1
  if (c.cardinality >= ARRAY_CONTAINER_MAX_CARDINALITY) {
    return false
  }
  for (let i = c.cardinality; i > insertAt; i--) {
    c.values[i] = c.values[i - 1]!
  }
  c.values[insertAt] = low
  c.cardinality++
  return true
}

function arrayContainerRemove(c: ArrayContainer, low: number): boolean {
  const idx = binarySearch(c.values, c.cardinality, low)
  if (idx < 0) return false
  for (let i = idx; i < c.cardinality - 1; i++) {
    c.values[i] = c.values[i + 1]!
  }
  c.cardinality--
  return true
}

function arrayContainerHas(c: ArrayContainer, low: number): boolean {
  return binarySearch(c.values, c.cardinality, low) >= 0
}

function bitmapSetBit(bitmap: Uint8Array, bit: number): void {
  const byteIndex = bit >>> 3
  const bitMask = 1 << (bit & 7)
  bitmap[byteIndex]! |= bitMask
}

function bitmapClearBit(bitmap: Uint8Array, bit: number): void {
  const byteIndex = bit >>> 3
  const bitMask = 1 << (bit & 7)
  bitmap[byteIndex]! &= ~bitMask
}

function bitmapGetBit(bitmap: Uint8Array, bit: number): boolean {
  const byteIndex = bit >>> 3
  const bitMask = 1 << (bit & 7)
  return (bitmap[byteIndex]! & bitMask) !== 0
}

function bitmapContainerAdd(c: BitmapContainer, low: number): boolean {
  if (bitmapGetBit(c.bitmap, low)) return false
  bitmapSetBit(c.bitmap, low)
  c.cardinality++
  return true
}

function bitmapContainerRemove(c: BitmapContainer, low: number): boolean {
  if (!bitmapGetBit(c.bitmap, low)) return false
  bitmapClearBit(c.bitmap, low)
  c.cardinality--
  return true
}

function bitmapContainerHas(c: BitmapContainer, low: number): boolean {
  return bitmapGetBit(c.bitmap, low)
}

function bitmapToArray(c: BitmapContainer): ArrayContainer {
  const ac = createArrayContainer()
  for (let i = 0; i <= UINT16_MAX; i++) {
    if (bitmapGetBit(c.bitmap, i)) {
      ac.values[ac.cardinality++] = i
    }
  }
  return ac
}

function arrayToBitmap(c: ArrayContainer): BitmapContainer {
  const bc = createBitmapContainer()
  for (let i = 0; i < c.cardinality; i++) {
    const v = c.values[i]!
    bitmapSetBit(bc.bitmap, v)
    bc.cardinality++
  }
  return bc
}

function runContainerAdd(c: RunContainer, low: number): boolean {
  for (let i = 0; i < c.runs.length; i++) {
    const run = c.runs[i]!
    const end = run.start + run.length
    if (low >= run.start && low <= end) return false
    if (low < run.start) {
      if (low === run.start - 1) {
        run.start--
        run.length++
        if (i > 0 && c.runs[i - 1]!.start + c.runs[i - 1]!.length + 1 === run.start) {
          c.runs[i - 1]!.length += run.length + 1
          c.runs.splice(i, 1)
        }
        c.cardinality++
        return true
      }
      c.runs.splice(i, 0, { start: low, length: 0 })
      c.cardinality++
      return true
    }
    if (low === end + 1) {
      run.length++
      if (i + 1 < c.runs.length && c.runs[i + 1]!.start === low + 1) {
        run.length += c.runs[i + 1]!.length + 1
        c.runs.splice(i + 1, 1)
      }
      c.cardinality++
      return true
    }
  }
  c.runs.push({ start: low, length: 0 })
  c.cardinality++
  return true
}

function runContainerRemove(c: RunContainer, low: number): boolean {
  for (let i = 0; i < c.runs.length; i++) {
    const run = c.runs[i]!
    const end = run.start + run.length
    if (low < run.start) return false
    if (low > end) continue
    if (run.length === 0) {
      c.runs.splice(i, 1)
    } else if (low === run.start) {
      run.start++
      run.length--
    } else if (low === end) {
      run.length--
    } else {
      const newLength = end - low - 1
      const oldLength = low - run.start - 1
      c.runs.splice(i, 1, { start: run.start, length: oldLength }, { start: low + 1, length: newLength })
    }
    c.cardinality--
    return true
  }
  return false
}

function runContainerHas(c: RunContainer, low: number): boolean {
  for (const run of c.runs) {
    if (low >= run.start && low <= run.start + run.length) return true
    if (low < run.start) return false
  }
  return false
}

function runToArray(c: RunContainer): ArrayContainer {
  const ac = createArrayContainer()
  for (const run of c.runs) {
    for (let v = run.start; v <= run.start + run.length; v++) {
      ac.values[ac.cardinality++] = v
    }
  }
  return ac
}

function arrayToRun(c: ArrayContainer): RunContainer {
  const rc = createRunContainer()
  if (c.cardinality === 0) return rc
  let runStart = c.values[0]!
  let runLen = 0
  for (let i = 1; i < c.cardinality; i++) {
    if (c.values[i] === c.values[i - 1]! + 1) {
      runLen++
    } else {
      rc.runs.push({ start: runStart, length: runLen })
      runStart = c.values[i]!
      runLen = 0
    }
  }
  rc.runs.push({ start: runStart, length: runLen })
  rc.cardinality = c.cardinality
  return rc
}

function containerAdd(container: Container, low: number): boolean {
  switch (container.type) {
    case 'array': return arrayContainerAdd(container, low)
    case 'bitmap': return bitmapContainerAdd(container, low)
    case 'run': return runContainerAdd(container, low)
  }
}

function containerRemove(container: Container, low: number): boolean {
  switch (container.type) {
    case 'array': return arrayContainerRemove(container, low)
    case 'bitmap': return bitmapContainerRemove(container, low)
    case 'run': return runContainerRemove(container, low)
  }
}

function containerHas(container: Container, low: number): boolean {
  switch (container.type) {
    case 'array': return arrayContainerHas(container, low)
    case 'bitmap': return bitmapContainerHas(container, low)
    case 'run': return runContainerHas(container, low)
  }
}

function containerCardinality(container: Container): number {
  return container.cardinality
}

function containerForEach(container: Container, callback: (value: number) => void): void {
  switch (container.type) {
    case 'array':
      for (let i = 0; i < container.cardinality; i++) {
        callback(container.values[i]!)
      }
      break
    case 'bitmap':
      for (let i = 0; i <= UINT16_MAX; i++) {
        if (bitmapGetBit(container.bitmap, i)) callback(i)
      }
      break
    case 'run':
      for (const run of container.runs) {
        for (let v = run.start; v <= run.start + run.length; v++) {
          callback(v)
        }
      }
      break
  }
}

function containerToArray(container: Container): number[] {
  const result: number[] = []
  containerForEach(container, (v) => result.push(v))
  return result
}

function containerClone(container: Container): Container {
  switch (container.type) {
    case 'array': {
      const c = createArrayContainer()
      c.cardinality = container.cardinality
      c.values.set(container.values.subarray(0, container.cardinality))
      return c
    }
    case 'bitmap': {
      const c = createBitmapContainer()
      c.cardinality = container.cardinality
      c.bitmap.set(container.bitmap)
      return c
    }
    case 'run': {
      const c = createRunContainer()
      c.cardinality = container.cardinality
      c.runs = container.runs.map(r => ({ ...r }))
      return c
    }
  }
}

function arrayAnd(a: ArrayContainer, b: ArrayContainer): ArrayContainer {
  const result = createArrayContainer()
  let i = 0, j = 0
  while (i < a.cardinality && j < b.cardinality) {
    const va = a.values[i]!
    const vb = b.values[j]!
    if (va < vb) { i++ }
    else if (va > vb) { j++ }
    else {
      result.values[result.cardinality++] = va
      i++; j++
    }
  }
  return result
}

function arrayOr(a: ArrayContainer, b: ArrayContainer): Container {
  const result = createArrayContainer()
  let i = 0, j = 0
  while (i < a.cardinality && j < b.cardinality) {
    const va = a.values[i]!
    const vb = b.values[j]!
    if (va <= vb) {
      result.values[result.cardinality++] = va
      if (va === vb) j++
      i++
    } else {
      result.values[result.cardinality++] = vb
      j++
    }
  }
  while (i < a.cardinality) result.values[result.cardinality++] = a.values[i++]!
  while (j < b.cardinality) result.values[result.cardinality++] = b.values[j++]!
  return maybeConvert(result)
}

function arrayAndNot(a: ArrayContainer, b: ArrayContainer): Container {
  const result = createArrayContainer()
  let i = 0, j = 0
  while (i < a.cardinality && j < b.cardinality) {
    const va = a.values[i]!
    const vb = b.values[j]!
    if (va < vb) {
      result.values[result.cardinality++] = va
      i++
    } else if (va > vb) {
      j++
    } else {
      i++; j++
    }
  }
  while (i < a.cardinality) result.values[result.cardinality++] = a.values[i++]!
  return maybeConvert(result)
}

function arrayXor(a: ArrayContainer, b: ArrayContainer): Container {
  const result = createArrayContainer()
  let i = 0, j = 0
  while (i < a.cardinality && j < b.cardinality) {
    const va = a.values[i]!
    const vb = b.values[j]!
    if (va < vb) {
      result.values[result.cardinality++] = va
      i++
    } else if (va > vb) {
      result.values[result.cardinality++] = vb
      j++
    } else {
      i++; j++
    }
  }
  while (i < a.cardinality) result.values[result.cardinality++] = a.values[i++]!
  while (j < b.cardinality) result.values[result.cardinality++] = b.values[j++]!
  return maybeConvert(result)
}

function bitmapAnd(a: BitmapContainer, b: BitmapContainer): Container {
  const result = createBitmapContainer()
  for (let i = 0; i < BITMAP_CONTAINER_SIZE; i++) {
    result.bitmap[i] = a.bitmap[i]! & b.bitmap[i]!
  }
  result.cardinality = countBitmapBits(result.bitmap)
  return maybeDownsizeBitmap(result)
}

function bitmapOr(a: BitmapContainer, b: BitmapContainer): BitmapContainer {
  const result = createBitmapContainer()
  for (let i = 0; i < BITMAP_CONTAINER_SIZE; i++) {
    result.bitmap[i] = a.bitmap[i]! | b.bitmap[i]!
  }
  result.cardinality = countBitmapBits(result.bitmap)
  return result
}

function bitmapAndNot(a: BitmapContainer, b: BitmapContainer): Container {
  const result = createBitmapContainer()
  for (let i = 0; i < BITMAP_CONTAINER_SIZE; i++) {
    result.bitmap[i] = a.bitmap[i]! & ~b.bitmap[i]!
  }
  result.cardinality = countBitmapBits(result.bitmap)
  return maybeDownsizeBitmap(result)
}

function bitmapXor(a: BitmapContainer, b: BitmapContainer): Container {
  const result = createBitmapContainer()
  for (let i = 0; i < BITMAP_CONTAINER_SIZE; i++) {
    result.bitmap[i] = a.bitmap[i]! ^ b.bitmap[i]!
  }
  result.cardinality = countBitmapBits(result.bitmap)
  return maybeDownsizeBitmap(result)
}

function countBitmapBits(bitmap: Uint8Array): number {
  let count = 0
  for (let i = 0; i < bitmap.length; i++) {
    let v = bitmap[i]!
    while (v) {
      count += v & 1
      v >>>= 1
    }
  }
  return count
}

function maybeConvert(c: ArrayContainer): Container {
  if (c.cardinality > ARRAY_CONTAINER_MAX_CARDINALITY) {
    return arrayToBitmap(c)
  }
  return c
}

function maybeDownsizeBitmap(c: BitmapContainer): Container {
  if (c.cardinality <= ARRAY_CONTAINER_MAX_CARDINALITY) {
    return bitmapToArray(c)
  }
  return c
}

function toComparable(a: Container, b: Container): [Container, Container] {
  if (a.type === 'run') a = runToArray(a)
  if (b.type === 'run') b = runToArray(b)
  if (a.type === 'bitmap') a = bitmapToArray(a)
  if (b.type === 'bitmap') b = bitmapToArray(b)
  return [a, b]
}

function containersAnd(a: Container, b: Container): Container {
  if (a.cardinality === 0 || b.cardinality === 0) return createArrayContainer()
  const [ca, cb] = toComparable(a, b)
  if (ca.type === 'array' && cb.type === 'array') {
    const result = arrayAnd(ca, cb)
    return result
  }
  if (ca.type === 'bitmap' && cb.type === 'bitmap') {
    return bitmapAnd(ca, cb)
  }
  return createArrayContainer()
}

function containersOr(a: Container, b: Container): Container {
  if (a.cardinality === 0) return containerClone(b)
  if (b.cardinality === 0) return containerClone(a)
  const [ca, cb] = toComparable(a, b)
  if (ca.type === 'array' && cb.type === 'array') {
    return arrayOr(ca, cb)
  }
  if (ca.type === 'bitmap' && cb.type === 'bitmap') {
    return bitmapOr(ca, cb)
  }
  return containerClone(b)
}

function containersAndNot(a: Container, b: Container): Container {
  if (a.cardinality === 0) return createArrayContainer()
  if (b.cardinality === 0) return containerClone(a)
  const [ca, cb] = toComparable(a, b)
  if (ca.type === 'array' && cb.type === 'array') {
    return arrayAndNot(ca, cb)
  }
  if (ca.type === 'bitmap' && cb.type === 'bitmap') {
    return bitmapAndNot(ca, cb)
  }
  return containerClone(a)
}

function containersXor(a: Container, b: Container): Container {
  if (a.cardinality === 0) return containerClone(b)
  if (b.cardinality === 0) return containerClone(a)
  const [ca, cb] = toComparable(a, b)
  if (ca.type === 'array' && cb.type === 'array') {
    return arrayXor(ca, cb)
  }
  if (ca.type === 'bitmap' && cb.type === 'bitmap') {
    return bitmapXor(ca, cb)
  }
  return createArrayContainer()
}

function containerEstimatedBytes(c: Container): number {
  switch (c.type) {
    case 'array': return 2 + c.values.byteLength
    case 'bitmap': return 2 + c.bitmap.byteLength
    case 'run': return 2 + c.runs.length * 8
  }
}

function containerMin(container: Container): number | undefined {
  switch (container.type) {
    case 'array':
      return container.cardinality > 0 ? container.values[0] : undefined
    case 'bitmap':
      for (let i = 0; i <= UINT16_MAX; i++) {
        if (bitmapGetBit(container.bitmap, i)) return i
      }
      return undefined
    case 'run':
      return container.runs.length > 0 ? container.runs[0]!.start : undefined
  }
}

function containerMax(container: Container): number | undefined {
  switch (container.type) {
    case 'array':
      return container.cardinality > 0 ? container.values[container.cardinality - 1] : undefined
    case 'bitmap':
      for (let i = UINT16_MAX; i >= 0; i--) {
        if (bitmapGetBit(container.bitmap, i)) return i
      }
      return undefined
    case 'run': {
      if (container.runs.length === 0) return undefined
      const last = container.runs[container.runs.length - 1]!
      return last.start + last.length
    }
  }
}

function containerRank(container: Container, low: number): number {
  switch (container.type) {
    case 'array': {
      let count = 0
      for (let i = 0; i < container.cardinality; i++) {
        if (container.values[i]! > low) break
        count++
      }
      return count
    }
    case 'bitmap': {
      const fullBytes = low >>> 3
      let count = 0
      for (let i = 0; i < fullBytes && i < BITMAP_CONTAINER_SIZE; i++) {
        let v = container.bitmap[i]!
        while (v) { count += v & 1; v >>>= 1 }
      }
      const bitEnd = low & 7
      if (fullBytes < BITMAP_CONTAINER_SIZE) {
        let v = container.bitmap[fullBytes]!
        for (let b = 0; b <= bitEnd; b++) {
          count += v & 1
          v >>>= 1
        }
      }
      return count
    }
    case 'run': {
      let count = 0
      for (const run of container.runs) {
        const end = run.start + run.length
        if (low >= end) {
          count += run.length + 1
        } else if (low >= run.start) {
          count += low - run.start + 1
        }
      }
      return count
    }
  }
}

function containerAddRange(container: Container, start: number, end: number): number {
  let added = 0
  for (let v = start; v < end; v++) {
    if (containerAdd(container, v)) added++
  }
  return added
}

function containerRemoveRange(container: Container, start: number, end: number): number {
  let removed = 0
  for (let v = start; v < end; v++) {
    if (containerRemove(container, v)) removed++
  }
  return removed
}

function shouldConvertToRun(container: Container, threshold: number): boolean {
  if (container.type === 'run') return false
  if (container.cardinality === 0) return false
  const ac = container.type === 'array'
    ? container
    : bitmapToArray(container as BitmapContainer)
  if (ac.cardinality < 2) return false
  let runCount = 0
  for (let i = 1; i < ac.cardinality; i++) {
    if (ac.values[i] !== ac.values[i - 1]! + 1) runCount++
  }
  runCount++
  return runCount * 2 < ac.cardinality / threshold
}

export class RoaringBitmap {
  private containers: Map<number, Container> = new Map()
  private _options: Required<RoaringBitmapOptions>
  private _stats: RoaringBitmapStatistics = {
    adds: 0,
    removes: 0,
    setOperations: 0,
    containerConversions: 0,
    estimatedBytes: 0,
  }

  constructor(options?: Partial<RoaringBitmapOptions>) {
    this._options = { ...DEFAULT_ROARING_BITMAP_OPTIONS, ...options }
  }

  add(value: number): void {
    const key = highBits(value)
    const low = lowBits(value)
    let container = this.containers.get(key)
    if (!container) {
      container = createArrayContainer()
      this.containers.set(key, container)
    }
    if (container.type === 'array' && container.cardinality >= ARRAY_CONTAINER_MAX_CARDINALITY) {
      const bc = arrayToBitmap(container as ArrayContainer)
      this.containers.set(key, bc)
      this._stats.containerConversions++
      container = bc
    }
    if (containerAdd(container, low)) {
      this._stats.adds++
      if (this._options.runOptimizeOnAdd) {
        this.maybeConvertToRun(key)
      }
    }
    this.updateEstimatedBytes()
  }

  has(value: number): boolean {
    const key = highBits(value)
    const container = this.containers.get(key)
    if (!container) return false
    return containerHas(container, lowBits(value))
  }

  remove(value: number): void {
    const key = highBits(value)
    const container = this.containers.get(key)
    if (!container) return
    if (containerRemove(container, lowBits(value))) {
      this._stats.removes++
      if (container.cardinality === 0) {
        this.containers.delete(key)
      } else if (container.type === 'bitmap' && container.cardinality <= ARRAY_CONTAINER_MAX_CARDINALITY) {
        const ac = bitmapToArray(container as BitmapContainer)
        this.containers.set(key, ac)
        this._stats.containerConversions++
      }
    }
    this.updateEstimatedBytes()
  }

  runOptimize(): void {
    for (const [key, container] of this.containers) {
      if (shouldConvertToRun(container, this._options.runOptimizeThreshold)) {
        const ac = container.type === 'array'
          ? container as ArrayContainer
          : container.type === 'bitmap'
            ? bitmapToArray(container as BitmapContainer)
            : null
        if (ac) {
          const rc = arrayToRun(ac)
          this.containers.set(key, rc)
          this._stats.containerConversions++
        }
      }
    }
    this.updateEstimatedBytes()
  }

  shrinkToFit(): void {
    for (const [key, container] of this.containers) {
      if (container.type === 'bitmap' && container.cardinality <= ARRAY_CONTAINER_MAX_CARDINALITY) {
        const ac = bitmapToArray(container as BitmapContainer)
        if (shouldConvertToRun(ac, this._options.runOptimizeThreshold)) {
          this.containers.set(key, arrayToRun(ac))
        } else {
          this.containers.set(key, ac)
        }
        this._stats.containerConversions++
      } else if (container.type === 'array') {
        const rc = arrayToRun(container as ArrayContainer)
        if (containerEstimatedBytes(rc) < containerEstimatedBytes(container)) {
          this.containers.set(key, rc)
          this._stats.containerConversions++
        }
      }
    }
    this.updateEstimatedBytes()
  }

  and(other: RoaringBitmap): RoaringBitmap {
    const result = new RoaringBitmap()
    this._stats.setOperations++
    for (const [key, c1] of this.containers) {
      const c2 = other.containers.get(key)
      if (!c2) continue
      const merged = containersAnd(c1, c2)
      if (containerCardinality(merged) > 0) {
        result.containers.set(key, merged)
      }
    }
    result._stats.setOperations = 1
    result.updateEstimatedBytes()
    return result
  }

  or(other: RoaringBitmap): RoaringBitmap {
    const result = new RoaringBitmap()
    this._stats.setOperations++
    const allKeys = new Set([...this.containers.keys(), ...other.containers.keys()])
    for (const key of allKeys) {
      const c1 = this.containers.get(key)
      const c2 = other.containers.get(key)
      if (c1 && c2) {
        const merged = containersOr(c1, c2)
        result.containers.set(key, merged)
      } else if (c1) {
        result.containers.set(key, containerClone(c1))
      } else if (c2) {
        result.containers.set(key, containerClone(c2))
      }
    }
    result._stats.setOperations = 1
    result.updateEstimatedBytes()
    return result
  }

  andNot(other: RoaringBitmap): RoaringBitmap {
    const result = new RoaringBitmap()
    this._stats.setOperations++
    for (const [key, c1] of this.containers) {
      const c2 = other.containers.get(key)
      if (!c2) {
        result.containers.set(key, containerClone(c1))
      } else {
        const merged = containersAndNot(c1, c2)
        if (containerCardinality(merged) > 0) {
          result.containers.set(key, merged)
        }
      }
    }
    result._stats.setOperations = 1
    result.updateEstimatedBytes()
    return result
  }

  xor(other: RoaringBitmap): RoaringBitmap {
    const result = new RoaringBitmap()
    this._stats.setOperations++
    const allKeys = new Set([...this.containers.keys(), ...other.containers.keys()])
    for (const key of allKeys) {
      const c1 = this.containers.get(key)
      const c2 = other.containers.get(key)
      if (c1 && c2) {
        const merged = containersXor(c1, c2)
        if (containerCardinality(merged) > 0) {
          result.containers.set(key, merged)
        }
      } else if (c1) {
        result.containers.set(key, containerClone(c1))
      } else if (c2) {
        result.containers.set(key, containerClone(c2))
      }
    }
    result._stats.setOperations = 1
    result.updateEstimatedBytes()
    return result
  }

  get cardinality(): number {
    let total = 0
    for (const container of this.containers.values()) {
      total += containerCardinality(container)
    }
    return total
  }

  get isEmpty(): boolean {
    return this.containers.size === 0
  }

  min(): number | undefined {
    if (this.containers.size === 0) return undefined
    const keys = [...this.containers.keys()].sort((a, b) => a - b)
    const minKey = keys[0]!
    const container = this.containers.get(minKey)!
    const low = containerMin(container)
    return low !== undefined ? combineKeyLow(minKey, low) : undefined
  }

  max(): number | undefined {
    if (this.containers.size === 0) return undefined
    const keys = [...this.containers.keys()].sort((a, b) => a - b)
    const maxKey = keys[keys.length - 1]!
    const container = this.containers.get(maxKey)!
    const low = containerMax(container)
    return low !== undefined ? combineKeyLow(maxKey, low) : undefined
  }

  rank(value: number): number {
    let count = 0
    const targetKey = highBits(value)
    const targetLow = lowBits(value)
    for (const [key, container] of this.containers) {
      if (key < targetKey) {
        count += containerCardinality(container)
      } else if (key === targetKey) {
        count += containerRank(container, targetLow)
      }
    }
    return count
  }

  containsRange(rangeStart: number, rangeEnd: number): boolean {
    if (rangeStart >= rangeEnd) return true
    for (let v = rangeStart; v < rangeEnd; v++) {
      if (!this.has(v)) return false
    }
    return true
  }

  addRange(rangeStart: number, rangeEnd: number): void {
    const startKey = highBits(rangeStart)
    const endKey = highBits(rangeEnd - 1)
    for (let key = startKey; key <= endKey; key++) {
      let container = this.containers.get(key)
      if (!container) {
        const loStart = key === startKey ? lowBits(rangeStart) : 0
        const loEnd = key === endKey ? lowBits(rangeEnd - 1) + 1 : UINT16_MAX + 1
        if (loEnd - loStart > ARRAY_CONTAINER_MAX_CARDINALITY) {
          container = createBitmapContainer()
        } else {
          container = createArrayContainer()
        }
        this.containers.set(key, container)
      }
      if (container.type === 'array' && container.cardinality >= ARRAY_CONTAINER_MAX_CARDINALITY) {
        const bc = arrayToBitmap(container as ArrayContainer)
        this.containers.set(key, bc)
        this._stats.containerConversions++
        container = bc
      }
      const loStart = key === startKey ? lowBits(rangeStart) : 0
      const loEnd = key === endKey ? lowBits(rangeEnd - 1) + 1 : UINT16_MAX + 1
      const added = containerAddRange(container, loStart, loEnd)
      this._stats.adds += added
    }
    this.updateEstimatedBytes()
  }

  removeRange(rangeStart: number, rangeEnd: number): void {
    const startKey = highBits(rangeStart)
    const endKey = highBits(rangeEnd - 1)
    for (let key = startKey; key <= endKey; key++) {
      const container = this.containers.get(key)
      if (!container) continue
      const loStart = key === startKey ? lowBits(rangeStart) : 0
      const loEnd = key === endKey ? lowBits(rangeEnd - 1) + 1 : UINT16_MAX + 1
      const removed = containerRemoveRange(container, loStart, loEnd)
      this._stats.removes += removed
      if (container.cardinality === 0) {
        this.containers.delete(key)
      }
    }
    this.updateEstimatedBytes()
  }

  flip(rangeStart: number, rangeEnd: number): void {
    for (let v = rangeStart; v < rangeEnd; v++) {
      if (this.has(v)) {
        this.remove(v)
      } else {
        this.add(v)
      }
    }
  }

  clear(): void {
    this.containers.clear()
    this._stats = {
      adds: 0,
      removes: 0,
      setOperations: 0,
      containerConversions: 0,
      estimatedBytes: 0,
    }
  }

  toArray(): number[] {
    const result: number[] = []
    const keys = [...this.containers.keys()].sort((a, b) => a - b)
    for (const key of keys) {
      const container = this.containers.get(key)!
      const values = containerToArray(container)
      for (const low of values) {
        result.push(combineKeyLow(key, low))
      }
    }
    return result
  }

  forEach(callback: (value: number) => void): void {
    const keys = [...this.containers.keys()].sort((a, b) => a - b)
    for (const key of keys) {
      const container = this.containers.get(key)!
      containerForEach(container, (low) => callback(combineKeyLow(key, low)))
    }
  }

  *[Symbol.iterator](): Iterator<number> {
    const keys = [...this.containers.keys()].sort((a, b) => a - b)
    for (const key of keys) {
      const container = this.containers.get(key)!
      switch (container.type) {
        case 'array':
          for (let i = 0; i < container.cardinality; i++) {
            yield combineKeyLow(key, container.values[i]!)
          }
          break
        case 'bitmap':
          for (let i = 0; i <= UINT16_MAX; i++) {
            if (bitmapGetBit(container.bitmap, i)) yield combineKeyLow(key, i)
          }
          break
        case 'run':
          for (const run of container.runs) {
            for (let v = run.start; v <= run.start + run.length; v++) {
              yield combineKeyLow(key, v)
            }
          }
          break
      }
    }
  }

  getStatistics(): RoaringBitmapStatistics {
    return { ...this._stats, estimatedBytes: this._stats.estimatedBytes }
  }

  toJSON(): RoaringBitmapJSON {
    const containerData: RoaringBitmapJSON['containers'] = []
    for (const [key, container] of this.containers) {
      switch (container.type) {
        case 'array':
          containerData.push({
            key,
            type: 'array',
            data: Array.from(container.values.subarray(0, container.cardinality)),
          })
          break
        case 'bitmap':
          containerData.push({
            key,
            type: 'bitmap',
            data: Array.from(container.bitmap),
          })
          break
        case 'run':
          containerData.push({
            key,
            type: 'run',
            data: container.runs.map(r => ({ start: r.start, length: r.length })),
          })
          break
      }
    }
    return { containers: containerData, statistics: { ...this._stats } }
  }

  static fromJSON(data: RoaringBitmapJSON): RoaringBitmap {
    const bm = new RoaringBitmap()
    for (const c of data.containers) {
      switch (c.type) {
        case 'array': {
          const ac = createArrayContainer()
          for (let i = 0; i < c.data.length; i++) {
            ac.values[i] = c.data[i] as number
          }
          ac.cardinality = c.data.length
          bm.containers.set(c.key, ac)
          break
        }
        case 'bitmap': {
          const bc = createBitmapContainer()
          for (let i = 0; i < c.data.length; i++) {
            bc.bitmap[i] = c.data[i] as number
          }
          bc.cardinality = countBitmapBits(bc.bitmap)
          bm.containers.set(c.key, bc)
          break
        }
        case 'run': {
          const rc = createRunContainer()
          rc.runs = (c.data as Array<{ start: number; length: number }>).map(r => ({ start: r.start, length: r.length }))
          rc.cardinality = rc.runs.reduce((sum, r) => sum + r.length + 1, 0)
          bm.containers.set(c.key, rc)
          break
        }
      }
    }
    bm._stats = { ...data.statistics }
    bm.updateEstimatedBytes()
    return bm
  }

  private maybeConvertToRun(key: number): void {
    const container = this.containers.get(key)
    if (!container || container.type === 'run') return
    if (container.cardinality < 2) return
    const ac = container.type === 'array'
      ? container as ArrayContainer
      : bitmapToArray(container as BitmapContainer)
    const rc = arrayToRun(ac)
    if (containerEstimatedBytes(rc) < containerEstimatedBytes(container)) {
      this.containers.set(key, rc)
      this._stats.containerConversions++
    }
  }

  private updateEstimatedBytes(): void {
    let total = 0
    for (const container of this.containers.values()) {
      total += containerEstimatedBytes(container)
    }
    this._stats.estimatedBytes = total
  }
}

export { DEFAULT_ROARING_BITMAP_OPTIONS } from './types.js'
export type { RoaringBitmapOptions, RoaringBitmapJSON, RoaringBitmapStatistics } from './types.js'
