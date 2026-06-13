export type PieceType2 = 'original' | 'added'

export interface Piece2 {
  type: PieceType2
  buffer: string
  start: number
  length: number
}

export class PieceTable2 {
  private original: string = ''
  private added: string = ''
  private pieces: Piece2[] = []

  constructor(initial: string = '') {
    this.original = initial
    if (initial.length > 0) {
      this.pieces.push({ type: 'original', buffer: 'original', start: 0, length: initial.length })
    }
  }

  insert(position: number, text: string): this {
    if (text.length === 0) return this
    const addStart = this.added.length
    this.added += text
    const newPiece: Piece2 = { type: 'added', buffer: 'added', start: addStart, length: text.length }

    if (position === 0) {
      this.pieces.unshift(newPiece)
      return this
    }

    let currentPos = 0
    let pieceIdx = 0

    while (pieceIdx < this.pieces.length && currentPos + this.pieces[pieceIdx].length <= position) {
      currentPos += this.pieces[pieceIdx].length
      pieceIdx++
    }

    if (pieceIdx >= this.pieces.length) {
      this.pieces.push(newPiece)
      return this
    }

    const offset = position - currentPos
    if (offset === 0) {
      this.pieces.splice(pieceIdx, 0, newPiece)
    } else {
      const piece = this.pieces[pieceIdx]
      const left: Piece2 = { ...piece, length: offset }
      const right: Piece2 = { ...piece, start: piece.start + offset, length: piece.length - offset }
      this.pieces.splice(pieceIdx, 1, left, newPiece, right)
    }

    return this
  }

  delete(position: number, length: number): this {
    if (length <= 0) return this
    let endPos = position + length
    let currentPos = 0
    const newPieces: Piece2[] = []

    for (const piece of this.pieces) {
      const pieceStart = currentPos
      const pieceEnd = currentPos + piece.length

      if (pieceEnd <= position || pieceStart >= endPos) {
        newPieces.push(piece)
      } else {
        const deleteStart = Math.max(position, pieceStart)
        const deleteEnd = Math.min(endPos, pieceEnd)

        if (deleteStart > pieceStart) {
          newPieces.push({ ...piece, length: deleteStart - pieceStart })
        }
        if (deleteEnd < pieceEnd) {
          const offset = deleteEnd - pieceStart
          newPieces.push({ ...piece, start: piece.start + offset, length: pieceEnd - deleteEnd })
        }
      }

      currentPos = pieceEnd
    }

    this.pieces = newPieces
    return this
  }

  getText(): string {
    let result = ''
    for (const piece of this.pieces) {
      const buffer = piece.buffer === 'original' ? this.original : this.added
      result += buffer.slice(piece.start, piece.start + piece.length)
    }
    return result
  }

  length(): number {
    return this.pieces.reduce((sum, p) => sum + p.length, 0)
  }

  charAt(index: number): string {
    let currentPos = 0
    for (const piece of this.pieces) {
      if (index < currentPos + piece.length) {
        const offset = index - currentPos
        const buffer = piece.buffer === 'original' ? this.original : this.added
        return buffer[piece.start + offset] ?? ''
      }
      currentPos += piece.length
    }
    return ''
  }

  substring(start: number, end?: number): string {
    const text = this.getText()
    return text.slice(start, end)
  }

  indexOf(str: string, fromIndex = 0): number {
    return this.getText().indexOf(str, fromIndex)
  }

  getPieceCount(): number { return this.pieces.length }

  getPieces(): Piece2[] { return [...this.pieces] }

  count(): number { return this.length() }

  toArray(): string[] { return this.getText().split('') }
  toString(): string { return this.getText() }
  toJSON(): Record<string, unknown> { return { length: this.length(), pieces: this.getPieceCount() } }
  clone(): PieceTable2 {
    const pt = new PieceTable2(this.original)
    pt.added = this.added
    pt.pieces = this.pieces.map(p => ({ ...p }))
    return pt
  }
  equals(other: unknown): boolean {
    if (!(other instanceof PieceTable2)) return false
    return this.getText() === other.getText()
  }
  clear(): void {
    this.original = ''
    this.added = ''
    this.pieces = []
  }
}
