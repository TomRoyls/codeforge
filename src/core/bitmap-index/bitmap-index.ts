import type { BitmapIndexField, BitmapIndexStats } from './types.js'

const BITS_PER_WORD = 32

function countTrailingZeros(x: number): number {
  if (x === 0) return 32
  let n = 0
  if ((x & 0x0000ffff) === 0) { n += 16; x >>>= 16 }
  if ((x & 0x000000ff) === 0) { n += 8; x >>>= 8 }
  if ((x & 0x0000000f) === 0) { n += 4; x >>>= 4 }
  if ((x & 0x00000003) === 0) { n += 2; x >>>= 2 }
  if ((x & 0x00000001) === 0) { n += 1 }
  return n
}

function numWordsForBits(n: number): number {
  return Math.ceil(n / BITS_PER_WORD) || 0
}

export class BitmapIndex {
  private numRecords: number
  private fields: Map<string, BitmapIndexField>

  constructor(numRecords: number) {
    if (!Number.isInteger(numRecords) || numRecords < 0) {
      throw new RangeError(`numRecords must be a non-negative integer, got ${numRecords}`)
    }
    this.numRecords = numRecords
    this.fields = new Map()
  }

  addField(name: string, cardinality: number): void {
    if (this.fields.has(name)) {
      throw new Error(`Field "${name}" already exists`)
    }
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('Field name must be a non-empty string')
    }
    if (!Number.isInteger(cardinality) || cardinality < 1) {
      throw new RangeError(`Cardinality must be a positive integer, got ${cardinality}`)
    }
    const numWords = numWordsForBits(this.numRecords)
    const bitmaps: Uint32Array[] = []
    for (let i = 0; i < cardinality; i++) {
      bitmaps.push(new Uint32Array(numWords))
    }
    this.fields.set(name, { name, cardinality, bitmaps })
  }

  set(fieldName: string, recordIndex: number, value: number): void {
    const field = this.getField(fieldName)
    this.validateRecordIndex(recordIndex)
    if (!Number.isInteger(value) || value < 0 || value >= field.cardinality) {
      throw new RangeError(`Value must be in range [0, ${field.cardinality - 1}], got ${value}`)
    }
    const wordIdx = recordIndex >>> 5
    const bitMask = 1 << (recordIndex & 31)
    for (let i = 0; i < field.cardinality; i++) {
      field.bitmaps[i]![wordIdx] = field.bitmaps[i]![wordIdx]! & ~bitMask
    }
    field.bitmaps[value]![wordIdx] = field.bitmaps[value]![wordIdx]! | bitMask
  }

  get(fieldName: string, recordIndex: number): number {
    const field = this.getField(fieldName)
    this.validateRecordIndex(recordIndex)
    const wordIdx = recordIndex >>> 5
    const bitMask = 1 << (recordIndex & 31)
    for (let v = 0; v < field.cardinality; v++) {
      if ((field.bitmaps[v]![wordIdx]! & bitMask) !== 0) {
        return v
      }
    }
    return -1
  }

  queryEquals(fieldName: string, value: number): number[] {
    const field = this.getField(fieldName)
    if (!Number.isInteger(value) || value < 0 || value >= field.cardinality) {
      throw new RangeError(`Value must be in range [0, ${field.cardinality - 1}], got ${value}`)
    }
    return this.extractSetBits(field.bitmaps[value]!)
  }

  queryRange(fieldName: string, min: number, max: number): number[] {
    const field = this.getField(fieldName)
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new TypeError('min and max must be integers')
    }
    if (min < 0 || max >= field.cardinality) {
      throw new RangeError(`Range [${min}, ${max}] out of bounds for cardinality ${field.cardinality}`)
    }
    if (min > max) {
      throw new RangeError(`min (${min}) must be <= max (${max})`)
    }
    const numWords = numWordsForBits(this.numRecords)
    const result = new Uint32Array(numWords)
    for (let v = min; v <= max; v++) {
      for (let w = 0; w < numWords; w++) {
        result[w] = result[w]! | field.bitmaps[v]![w]!
      }
    }
    return this.extractSetBits(result)
  }

  queryAnd(sets: number[][]): number[] {
    if (sets.length === 0) return []
    if (sets.length === 1) return [...sets[0]!]

    const numWords = numWordsForBits(this.numRecords)
    let accumulator: Uint32Array | null = null

    for (const set of sets) {
      const bitmap = this.buildBitmapFromSet(set, numWords)
      if (accumulator === null) {
        accumulator = bitmap
      } else {
        for (let w = 0; w < numWords; w++) {
          accumulator[w] = accumulator[w]! & bitmap[w]!
        }
      }
    }

    return this.extractSetBits(accumulator!)
  }

  queryOr(sets: number[][]): number[] {
    if (sets.length === 0) return []
    if (sets.length === 1) return [...sets[0]!]

    const numWords = numWordsForBits(this.numRecords)
    const result = new Uint32Array(numWords)

    for (const set of sets) {
      for (const idx of set) {
        if (idx >= 0 && idx < this.numRecords) {
          const wordIdx = idx >>> 5
          const bitMask = 1 << (idx & 31)
          result[wordIdx] = result[wordIdx]! | bitMask
        }
      }
    }

    return this.extractSetBits(result)
  }

  countResults(results: number[]): number {
    return results.length
  }

  getNumRecords(): number {
    return this.numRecords
  }

  getFields(): string[] {
    return Array.from(this.fields.keys())
  }

  getCardinality(fieldName: string): number {
    const field = this.getField(fieldName)
    return field.cardinality
  }

  clear(): void {
    for (const field of this.fields.values()) {
      for (let i = 0; i < field.bitmaps.length; i++) {
        field.bitmaps[i]!.fill(0)
      }
    }
  }

  getStats(): BitmapIndexStats {
    const cardinalities: Record<string, number> = {}
    let memoryUsage = 0
    for (const [name, field] of this.fields) {
      cardinalities[name] = field.cardinality
      for (const bitmap of field.bitmaps) {
        memoryUsage += bitmap.byteLength
      }
    }
    return {
      numRecords: this.numRecords,
      fields: this.getFields(),
      cardinalities,
      memoryUsage,
    }
  }

  toJSON(): Record<string, unknown> {
    const fieldsData: Record<string, { cardinality: number; bitmaps: number[][] }> = {}
    for (const [name, field] of this.fields) {
      fieldsData[name] = {
        cardinality: field.cardinality,
        bitmaps: field.bitmaps.map(bm => Array.from(bm)),
      }
    }
    return {
      numRecords: this.numRecords,
      fields: fieldsData,
    }
  }

  static fromJSON(data: Record<string, unknown>): BitmapIndex {
    const index = new BitmapIndex(data.numRecords as number)
    const fieldsData = data.fields as Record<string, { cardinality: number; bitmaps: number[][] }>
    if (fieldsData) {
      for (const [name, fData] of Object.entries(fieldsData)) {
        index.addField(name, fData.cardinality)
        const field = index.fields.get(name)!
        for (let i = 0; i < fData.bitmaps.length; i++) {
          field.bitmaps[i] = new Uint32Array(fData.bitmaps[i]!)
        }
      }
    }
    return index
  }

  private getField(name: string): BitmapIndexField {
    const field = this.fields.get(name)
    if (!field) {
      throw new Error(`Field "${name}" not found`)
    }
    return field
  }

  private validateRecordIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.numRecords) {
      throw new RangeError(`Record index ${index} out of range [0, ${this.numRecords})`)
    }
  }

  private extractSetBits(bitmap: Uint32Array): number[] {
    const result: number[] = []
    for (let w = 0; w < bitmap.length; w++) {
      let word = bitmap[w]!
      while (word !== 0) {
        const bit = countTrailingZeros(word)
        const idx = (w << 5) + bit
        if (idx < this.numRecords) {
          result.push(idx)
        }
        word &= word - 1
      }
    }
    return result
  }

  private buildBitmapFromSet(set: number[], numWords: number): Uint32Array {
    const bitmap = new Uint32Array(numWords)
    for (const idx of set) {
      if (idx >= 0 && idx < this.numRecords) {
        const wordIdx = idx >>> 5
        const bitMask = 1 << (idx & 31)
        bitmap[wordIdx] = bitmap[wordIdx]! | bitMask
      }
    }
    return bitmap
  }
}

export type { BitmapIndexField, BitmapIndexStats, BitmapIndexData } from './types.js'
