export class TextEditor2 {
  private pieces: Array<{ text: string; length: number }> = []

  insert(at: number, text: string): void {
    if (text.length === 0) return
    if (this.pieces.length === 0) {
      this.pieces.push({ text, length: text.length })
      return
    }
    let pos = 0
    let i = 0
    for (; i < this.pieces.length; i++) {
      if (pos + this.pieces[i].length >= at) break
      pos += this.pieces[i].length
    }
    const offset = at - pos
    const piece = this.pieces[i]
    if (!piece) {
      this.pieces.push({ text, length: text.length })
      return
    }
    const before = piece.text.slice(0, offset)
    const after = piece.text.slice(offset)
    this.pieces.splice(i, 1,
      { text: before, length: before.length },
      { text, length: text.length },
      { text: after, length: after.length }
    )
  }

  delete(at: number, length: number): void {
    if (length <= 0) return
    const full = this.getText()
    const newText = full.slice(0, at) + full.slice(at + length)
    this.pieces = []
    if (newText.length > 0) this.pieces.push({ text: newText, length: newText.length })
  }

  getText(): string {
    return this.pieces.map(p => p.text).join('')
  }

  get length(): number { return this.pieces.reduce((s, p) => s + p.length, 0) }
  get isEmpty(): boolean { return this.length === 0 }

  clear(): void { this.pieces = [] }

  toArray(): string[] { return this.pieces.map(p => p.text) }
  toString(): string { return JSON.stringify({ length: this.length, pieces: this.pieces.length }) }
  toJSON(): Record<string, number> { return { length: this.length, pieces: this.pieces.length } }

  clone(): TextEditor2 {
    const c = new TextEditor2()
    c.pieces = this.pieces.map(p => ({ ...p }))
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof TextEditor2)) return false
    return this.length === other.length
  }
}
