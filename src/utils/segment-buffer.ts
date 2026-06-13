export class SegmentBuffer {
  private segments: Array<{ offset: number; data: number[] }> = []

  add(offset: number, data: number[]): void {
    this.segments.push({ offset, data: [...data] })
    this.compact()
  }

  private compact(): void {
    this.segments.sort((a, b) => a.offset - b.offset)
    const merged: Array<{ offset: number; data: number[] }> = []
    for (const seg of this.segments) {
      if (merged.length > 0) {
        const last = merged[merged.length - 1]!
        const lastEnd = last.offset + last.data.length
      if (seg.offset <= lastEnd) {
        const overlap = seg.offset - last.offset
        const combined = [...last.data.slice(0, overlap), ...seg.data]
        const newEnd = seg.offset + seg.data.length
        if (newEnd < lastEnd) {
          combined.push(...last.data.slice(newEnd - last.offset))
        }
        merged[merged.length - 1] = { offset: last.offset, data: combined }
        continue
      }
      }
      merged.push({ ...seg, data: [...seg.data] })
    }
    this.segments = merged
  }

  get(offset: number, length: number): number[] {
    const result = new Array(length).fill(0)
    for (const seg of this.segments) {
      const segEnd = seg.offset + seg.data.length
      const readStart = Math.max(offset, seg.offset)
      const readEnd = Math.min(offset + length, segEnd)
      if (readStart < readEnd) {
        const srcOffset = readStart - seg.offset
        const dstOffset = readStart - offset
        const copyLen = readEnd - readStart
        for (let i = 0; i < copyLen; i++) {
          result[dstOffset + i] = seg.data[srcOffset + i]!
        }
      }
    }
    return result
  }

  get count(): number {
    return this.segments.length
  }

  get isEmpty(): boolean {
    return this.segments.length === 0
  }

  get totalSize(): number {
    return this.segments.reduce((sum, s) => sum + s.data.length, 0)
  }

  clear(): void {
    this.segments = []
  }

  toArray(): Array<{ offset: number; data: number[] }> {
    return this.segments.map((s) => ({ offset: s.offset, data: [...s.data] }))
  }

  toString(): string {
    return JSON.stringify({ segments: this.count, totalSize: this.totalSize })
  }

  toJSON(): Record<string, number> {
    return { segments: this.count, totalSize: this.totalSize }
  }

  clone(): SegmentBuffer {
    const copy = new SegmentBuffer()
    copy.segments = this.segments.map((s) => ({ offset: s.offset, data: [...s.data] }))
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof SegmentBuffer)) return false
    return this.totalSize === other.totalSize
  }
}
