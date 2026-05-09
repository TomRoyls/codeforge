import { DEFAULT_RABIN_KARP_OPTIONS } from './types.js'

export class RabinKarp {
  private _pattern: string
  private _base: number
  private _modulus: number
  private _patternHash: number
  private _leadingPower: number

  constructor(pattern: string, base?: number, modulus?: number) {
    this._pattern = pattern
    this._base = base ?? DEFAULT_RABIN_KARP_OPTIONS.base
    this._modulus = modulus ?? DEFAULT_RABIN_KARP_OPTIONS.modulus
    this._patternHash = 0
    this._leadingPower = 1
    this._computeHashData()
  }

  private _computeHashData(): void {
    const m = this._pattern.length
    this._patternHash = 0
    this._leadingPower = 1

    for (let i = 0; i < m; i++) {
      this._patternHash =
        (this._patternHash * this._base + this._pattern.charCodeAt(i)) %
        this._modulus
    }

    for (let i = 0; i < m - 1; i++) {
      this._leadingPower = (this._leadingPower * this._base) % this._modulus
    }
  }

  private _computeWindowHash(text: string, start: number, length: number): number {
    let hash = 0
    for (let i = 0; i < length; i++) {
      hash = (hash * this._base + text.charCodeAt(start + i)) % this._modulus
    }
    return hash
  }

  private _rollHash(prevHash: number, oldChar: string, newChar: string): number {
    const removed =
      (this._leadingPower * oldChar.charCodeAt(0)) % this._modulus
    let hash = (prevHash - removed + this._modulus) % this._modulus
    hash = (hash * this._base + newChar.charCodeAt(0)) % this._modulus
    return hash
  }

  search(text: string): number {
    const m = this._pattern.length
    if (m === 0) return 0
    if (text.length === 0 || text.length < m) return -1

    const n = text.length
    let textHash = this._computeWindowHash(text, 0, m)

    for (let i = 0; i <= n - m; i++) {
      if (textHash === this._patternHash) {
        if (this._verifyMatch(text, i)) {
          return i
        }
      }
      if (i < n - m) {
        textHash = this._rollHash(textHash, text[i]!, text[i + m]!)
      }
    }

    return -1
  }

  searchAll(text: string): number[] {
    const m = this._pattern.length
    if (m === 0) {
      const indices: number[] = []
      for (let i = 0; i <= text.length; i++) {
        indices.push(i)
      }
      return indices
    }
    if (text.length === 0 || text.length < m) return []

    const n = text.length
    const results: number[] = []
    let textHash = this._computeWindowHash(text, 0, m)

    for (let i = 0; i <= n - m; i++) {
      if (textHash === this._patternHash) {
        if (this._verifyMatch(text, i)) {
          results.push(i)
        }
      }
      if (i < n - m) {
        textHash = this._rollHash(textHash, text[i]!, text[i + m]!)
      }
    }

    return results
  }

  private _verifyMatch(text: string, start: number): boolean {
    const m = this._pattern.length
    for (let i = 0; i < m; i++) {
      if (text[start + i] !== this._pattern[i]) {
        return false
      }
    }
    return true
  }

  count(text: string): number {
    return this.searchAll(text).length
  }

  contains(text: string): boolean {
    return this.search(text) !== -1
  }

  getPattern(): string {
    return this._pattern
  }

  getHash(): number {
    return this._patternHash
  }

  setPattern(pattern: string): void {
    this._pattern = pattern
    this._computeHashData()
  }

  static search(text: string, pattern: string): number {
    const rk = new RabinKarp(pattern)
    return rk.search(text)
  }

  static searchAll(text: string, pattern: string): number[] {
    const rk = new RabinKarp(pattern)
    return rk.searchAll(text)
  }

  static count(text: string, pattern: string): number {
    const rk = new RabinKarp(pattern)
    return rk.count(text)
  }

  static contains(text: string, pattern: string): boolean {
    const rk = new RabinKarp(pattern)
    return rk.contains(text)
  }

  static multiSearch(
    text: string,
    patterns: string[],
    base?: number,
    modulus?: number
  ): Map<string, number[]> {
    const result = new Map<string, number[]>()
    const n = text.length

    for (const pattern of patterns) {
      result.set(pattern, [])
    }

    const byLength = new Map<number, string[]>()
    for (const pattern of patterns) {
      const len = pattern.length
      if (!byLength.has(len)) {
        byLength.set(len, [])
      }
      byLength.get(len)!.push(pattern)
    }

    for (const [length, pats] of byLength) {
      const m = length
      if (m === 0) {
        for (const pat of pats) {
          const indices: number[] = []
          for (let i = 0; i <= n; i++) {
            indices.push(i)
          }
          result.set(pat, indices)
        }
        continue
      }

      if (n < m) continue

      const patHashes = new Map<number, string[]>()
      const b = base ?? DEFAULT_RABIN_KARP_OPTIONS.base
      const mod = modulus ?? DEFAULT_RABIN_KARP_OPTIONS.modulus

      for (const pat of pats) {
        let hash = 0
        for (let i = 0; i < m; i++) {
          hash = (hash * b + pat.charCodeAt(i)) % mod
        }
        if (!patHashes.has(hash)) {
          patHashes.set(hash, [])
        }
        patHashes.get(hash)!.push(pat)
      }

      let leadingPower = 1
      for (let i = 0; i < m - 1; i++) {
        leadingPower = (leadingPower * b) % mod
      }

      let textHash = 0
      for (let i = 0; i < m; i++) {
        textHash = (textHash * b + text.charCodeAt(i)) % mod
      }

      for (let i = 0; i <= n - m; i++) {
        const candidates = patHashes.get(textHash)
        if (candidates) {
          for (const candidate of candidates) {
            let match = true
            for (let j = 0; j < m; j++) {
              if (text[i + j] !== candidate[j]) {
                match = false
                break
              }
            }
            if (match) {
              result.get(candidate)!.push(i)
            }
          }
        }

        if (i < n - m) {
          const removed = (leadingPower * text.charCodeAt(i)) % mod
          textHash = (textHash - removed + mod) % mod
          textHash = (textHash * b + text.charCodeAt(i + m)) % mod
        }
      }
    }

    return result
  }

  static rollingHash(
    text: string,
    base?: number,
    modulus?: number
  ): number {
    const b = base ?? DEFAULT_RABIN_KARP_OPTIONS.base
    const mod = modulus ?? DEFAULT_RABIN_KARP_OPTIONS.modulus
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = (hash * b + text.charCodeAt(i)) % mod
    }
    return hash
  }
}

export { DEFAULT_RABIN_KARP_OPTIONS } from './types.js'
export type { RabinKarpOptions } from './types.js'
