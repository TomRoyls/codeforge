export class PieceTable {
  private readonly original: string
  private addBuffer: string
  private pieces: { start: number; length: number; source: 'original' | 'add' }[]

  constructor(original: string = '') {
    this.original = original
    this.addBuffer = ''
    this.pieces = original.length > 0
      ? [{ start: 0, length: original.length, source: 'original' as const }]
      : []
  }

  insert(position: number, text: string): void {
    if (text.length === 0) return
    const addStart = this.addBuffer.length
    this.addBuffer += text
    const newPiece = { start: addStart, length: text.length, source: 'add' as const }

    if (this.pieces.length === 0) {
      this.pieces.push(newPiece)
      return
    }

    let offset = 0
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i]!
      if (offset + piece.length >= position) {
        const splitPoint = position - offset
        if (splitPoint === 0) {
          this.pieces.splice(i, 0, newPiece)
        } else {
          const left = { start: piece.start, length: splitPoint, source: piece.source }
          const right = { start: piece.start + splitPoint, length: piece.length - splitPoint, source: piece.source }
          this.pieces.splice(i, 1, left, newPiece, right)
        }
        return
      }
      offset += piece.length
    }
    this.pieces.push(newPiece)
  }

  delete(start: number, length: number): void {
    if (length <= 0 || this.pieces.length === 0) return
    const end = start + length
    const newPieces: typeof this.pieces = []
    let offset = 0
    for (const piece of this.pieces) {
      const pieceStart = offset
      const pieceEnd = offset + piece.length
      if (pieceEnd <= start || pieceStart >= end) {
        newPieces.push(piece)
      } else {
        if (pieceStart < start) {
          newPieces.push({
            start: piece.start,
            length: start - pieceStart,
            source: piece.source,
          })
        }
        if (pieceEnd > end) {
          newPieces.push({
            start: piece.start + (end - pieceStart),
            length: pieceEnd - end,
            source: piece.source,
          })
        }
      }
      offset += piece.length
    }
    this.pieces = newPieces
  }

  getText(): string {
    let result = ''
    for (const piece of this.pieces) {
      const source = piece.source === 'original' ? this.original : this.addBuffer
      result += source.slice(piece.start, piece.start + piece.length)
    }
    return result
  }

  get length(): number {
    let len = 0
    for (const piece of this.pieces) {
      len += piece.length
    }
    return len
  }

  get pieceCount(): number {
    return this.pieces.length
  }

  charAt(index: number): string {
    let offset = 0
    for (const piece of this.pieces) {
      if (offset + piece.length > index) {
        const source = piece.source === 'original' ? this.original : this.addBuffer
        return source[piece.start + (index - offset)] ?? ''
      }
      offset += piece.length
    }
    return ''
  }

  substring(start: number, end?: number): string {
    const text = this.getText()
    return text.slice(start, end)
  }
}
