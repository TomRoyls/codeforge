export class CharFrequency2 {
  private freq = new Map<string, number>()

  add(text: string): void {
    for (const char of text) {
      this.freq.set(char, (this.freq.get(char) ?? 0) + 1)
    }
  }

  get(char: string): number { return this.freq.get(char) ?? 0 }

  mostFrequent(): string | undefined {
    let maxChar: string | undefined
    let maxCount = 0
    for (const [char, count] of this.freq) {
      if (count > maxCount) { maxCount = count; maxChar = char }
    }
    return maxChar
  }

  leastFrequent(): string | undefined {
    let minChar: string | undefined
    let minCount = Infinity
    for (const [char, count] of this.freq) {
      if (count < minCount) { minCount = count; minChar = char }
    }
    return minChar
  }

  uniqueCount(): number { return this.freq.size }

  totalChars(): number {
    let total = 0
    for (const count of this.freq.values()) total += count
    return total
  }

  get size(): number { return this.freq.size }
  get isEmpty(): boolean { return this.freq.size === 0 }

  clear(): void { this.freq.clear() }

  toArray(): Array<[string, number]> { return Array.from(this.freq.entries()) }
  toString(): string { return JSON.stringify({ unique: this.freq.size, total: this.totalChars() }) }
  toJSON(): Record<string, number> { return { unique: this.freq.size, total: this.totalChars() } }

  clone(): CharFrequency2 {
    const c = new CharFrequency2()
    for (const [k, v] of this.freq) c.freq.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof CharFrequency2)) return false
    return this.size === other.size
  }
}
