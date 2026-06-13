export class MutableString {
  private chars: string[]

  constructor(initial = '') {
    this.chars = initial.split('')
  }

  get length(): number { return this.chars.length }

  charAt(index: number): string {
    return this.chars[index] ?? ''
  }

  setCharAt(index: number, ch: string): void {
    if (index >= 0 && index < this.chars.length) {
      this.chars[index] = ch
    }
  }

  append(str: string): void {
    for (const ch of str) this.chars.push(ch)
  }

  insert(index: number, str: string): void {
    const before = this.chars.splice(0, index)
    for (const ch of str) before.push(ch)
    this.chars = before.concat(this.chars)
  }

  delete(start: number, end: number): void {
    this.chars.splice(start, end - start)
  }

  substring(start: number, end?: number): string {
    return this.chars.slice(start, end).join('')
  }

  reverse(): void {
    this.chars.reverse()
  }

  indexOf(str: string): number {
    const s = this.toString()
    return s.indexOf(str)
  }

  get isEmpty(): boolean { return this.chars.length === 0 }

  clear(): void { this.chars = [] }

  toArray(): string[] { return [...this.chars] }
  toString(): string { return this.chars.join('') }
  toJSON(): string { return this.toString() }

  clone(): MutableString {
    return new MutableString(this.toString())
  }

  equals(other: unknown): boolean {
    if (!(other instanceof MutableString)) return false
    return this.toString() === other.toString()
  }
}
