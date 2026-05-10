import type { Piece } from './types.js'

export class PieceTable {
  private _originalBuffer: string
  private _addBuffer: string
  private _pieces: Piece[]
  private _length: number

  constructor(initialText?: string) {
    this._originalBuffer = initialText ?? ''
    this._addBuffer = ''
    this._length = this._originalBuffer.length
    if (this._originalBuffer.length > 0) {
      this._pieces = [{ buffer: 'original', offset: 0, length: this._originalBuffer.length }]
    } else {
      this._pieces = []
    }
  }

  insert(position: number, text: string): void {
    if (text.length === 0) return
    if (position < 0 || position > this._length) {
      throw new RangeError(`Position ${position} out of range [0, ${this._length}]`)
    }

    const addOffset = this._addBuffer.length
    this._addBuffer += text
    const newPiece: Piece = { buffer: 'add', offset: addOffset, length: text.length }

    if (this._pieces.length === 0) {
      this._pieces.push(newPiece)
      this._length += text.length
      return
    }

    if (position === 0) {
      this._pieces.unshift(newPiece)
      this._length += text.length
      return
    }

    if (position === this._length) {
      this._pieces.push(newPiece)
      this._length += text.length
      return
    }

    let accumulated = 0
    for (let i = 0; i < this._pieces.length; i++) {
      const piece = this._pieces[i]!
      const pieceEnd = accumulated + piece.length

      if (position === accumulated) {
        this._pieces.splice(i, 0, newPiece)
        this._length += text.length
        return
      }

      if (position < pieceEnd) {
        const splitPoint = position - accumulated
        const leftPiece: Piece = {
          buffer: piece.buffer,
          offset: piece.offset,
          length: splitPoint,
        }
        const rightPiece: Piece = {
          buffer: piece.buffer,
          offset: piece.offset + splitPoint,
          length: piece.length - splitPoint,
        }
        this._pieces.splice(i, 1, leftPiece, newPiece, rightPiece)
        this._length += text.length
        return
      }

      accumulated = pieceEnd
    }
  }

  delete(start: number, end: number): void {
    if (start === end) return
    if (start < 0 || end < 0) {
      throw new RangeError(`Delete range [${start}, ${end}) contains negative indices`)
    }
    if (start > end) {
      throw new RangeError(`Delete start ${start} is greater than end ${end}`)
    }
    if (start > this._length) {
      throw new RangeError(`Delete start ${start} exceeds text length ${this._length}`)
    }
    if (end > this._length) {
      throw new RangeError(`Delete end ${end} exceeds text length ${this._length}`)
    }

    const deleteLength = end - start
    const newPieces: Piece[] = []
    let accumulated = 0

    for (const piece of this._pieces) {
      const pieceStart = accumulated
      const pieceEnd = accumulated + piece.length

      if (pieceEnd <= start) {
        newPieces.push({ ...piece })
      } else if (pieceStart >= end) {
        newPieces.push({ ...piece })
      } else {
        const overlapStart = Math.max(start, pieceStart)
        const overlapEnd = Math.min(end, pieceEnd)

        if (overlapStart > pieceStart) {
          const leftLength = overlapStart - pieceStart
          newPieces.push({
            buffer: piece.buffer,
            offset: piece.offset,
            length: leftLength,
          })
        }

        if (overlapEnd < pieceEnd) {
          const rightOffset = piece.offset + (overlapEnd - pieceStart)
          const rightLength = pieceEnd - overlapEnd
          newPieces.push({
            buffer: piece.buffer,
            offset: rightOffset,
            length: rightLength,
          })
        }
      }

      accumulated = pieceEnd
    }

    this._pieces = newPieces
    this._length -= deleteLength
  }

  getText(): string {
    const parts: string[] = []
    for (const piece of this._pieces) {
      const buffer = piece.buffer === 'original' ? this._originalBuffer : this._addBuffer
      parts.push(buffer.substring(piece.offset, piece.offset + piece.length))
    }
    return parts.join('')
  }

  get length(): number {
    return this._length
  }

  charAt(index: number): string {
    if (index < 0 || index >= this._length) {
      throw new RangeError(`Index ${index} out of range [0, ${this._length})`)
    }
    let accumulated = 0
    for (const piece of this._pieces) {
      if (index < accumulated + piece.length) {
        const localIndex = index - accumulated
        const buffer = piece.buffer === 'original' ? this._originalBuffer : this._addBuffer
        return buffer[piece.offset + localIndex]!
      }
      accumulated += piece.length
    }
    throw new RangeError(`Index ${index} out of range`)
  }

  substring(start: number, end?: number): string {
    const resolvedEnd = end ?? this._length
    if (start < 0 || start > this._length) {
      throw new RangeError(`Start ${start} out of range [0, ${this._length}]`)
    }
    if (resolvedEnd < start || resolvedEnd > this._length) {
      throw new RangeError(`End ${resolvedEnd} out of range [${start}, ${this._length}]`)
    }
    if (start === resolvedEnd) return ''

    const parts: string[] = []
    let accumulated = 0

    for (const piece of this._pieces) {
      const pieceStart = accumulated
      const pieceEnd = accumulated + piece.length

      if (pieceEnd <= start) {
        accumulated = pieceEnd
        continue
      }

      if (pieceStart >= resolvedEnd) {
        break
      }

      const overlapStart = Math.max(start, pieceStart)
      const overlapEnd = Math.min(resolvedEnd, pieceEnd)
      const localStart = piece.offset + (overlapStart - pieceStart)
      const localEnd = piece.offset + (overlapEnd - pieceStart)
      const buffer = piece.buffer === 'original' ? this._originalBuffer : this._addBuffer
      parts.push(buffer.substring(localStart, localEnd))

      accumulated = pieceEnd
    }

    return parts.join('')
  }

  pieceCount(): number {
    return this._pieces.length
  }

  compact(): void {
    if (this._pieces.length <= 1) return

    const merged: Piece[] = []
    let current: Piece | null = null

    for (const piece of this._pieces) {
      if (piece.length === 0) continue

      if (
        current !== null &&
        current.buffer === piece.buffer &&
        current.offset + current.length === piece.offset
      ) {
        current = { buffer: current.buffer, offset: current.offset, length: current.length + piece.length }
      } else {
        if (current !== null) {
          merged.push(current)
        }
        current = { buffer: piece.buffer, offset: piece.offset, length: piece.length }
      }
    }

    if (current !== null) {
      merged.push(current)
    }

    this._pieces = merged
  }
}

export type { Piece, PieceTableOptions } from './types.js'
