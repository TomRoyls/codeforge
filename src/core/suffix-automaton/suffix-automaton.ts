import type { SAMState } from './types.js'

export class SuffixAutomaton {
  private _states: SAMState[]
  private _size: number
  private _last: number
  private _text: string
  private _occurrencesComputed: boolean

  constructor(str?: string) {
    this._states = []
    this._size = 0
    this._last = 0
    this._text = ''
    this._occurrencesComputed = false
    this._newState(0, -1)

    if (str !== undefined && str.length > 0) {
      this.addString(str)
    }
  }

  private _newState(length: number, link: number): number {
    this._states.push({
      length,
      link,
      transitions: new Map(),
      occurrences: 0,
      firstPos: -1,
      isCloned: false,
    })
    return this._size++
  }

  addChar(c: string): void {
    const curr = this._newState(this._states[this._last]!.length + 1, -1)
    this._states[curr]!.occurrences = 1
    this._states[curr]!.firstPos = this._states[curr]!.length - 1

    let p = this._last
    while (p !== -1 && !this._states[p]!.transitions.has(c)) {
      this._states[p]!.transitions.set(c, curr)
      p = this._states[p]!.link
    }

    if (p === -1) {
      this._states[curr]!.link = 0
    } else {
      const q = this._states[p]!.transitions.get(c)!
      if (this._states[p]!.length + 1 === this._states[q]!.length) {
        this._states[curr]!.link = q
      } else {
        const clone = this._newState(this._states[p]!.length + 1, this._states[q]!.link)
        this._states[clone]!.transitions = new Map(this._states[q]!.transitions)
        this._states[clone]!.firstPos = this._states[q]!.firstPos
        this._states[clone]!.isCloned = true
        this._states[clone]!.occurrences = 0

        while (p !== -1 && this._states[p]!.transitions.get(c) === q) {
          this._states[p]!.transitions.set(c, clone)
          p = this._states[p]!.link
        }

        this._states[q]!.link = clone
        this._states[curr]!.link = clone
      }
    }

    this._last = curr
    this._text += c
    this._occurrencesComputed = false
  }

  addString(s: string): void {
    for (let i = 0; i < s.length; i++) {
      this.addChar(s[i]!)
    }
  }

  contains(substring: string): boolean {
    if (substring.length === 0) return true
    if (this._text.length === 0) return false
    if (substring.length > this._text.length) return false

    let state = 0
    for (let i = 0; i < substring.length; i++) {
      const ch = substring[i]!
      const next = this._states[state]!.transitions.get(ch)
      if (next === undefined) return false
      state = next
    }
    return true
  }

  private _computeOccurrences(): void {
    if (this._occurrencesComputed) return
    this._occurrencesComputed = true

    const order: number[] = []
    for (let i = 0; i < this._size; i++) {
      order.push(i)
    }
    order.sort((a, b) => this._states[b]!.length - this._states[a]!.length)

    for (const v of order) {
      if (this._states[v]!.link !== -1) {
        this._states[this._states[v]!.link]!.occurrences += this._states[v]!.occurrences
      }
    }
  }

  countOccurrences(substring: string): number {
    if (substring.length === 0) return 0
    if (this._text.length === 0) return 0
    if (substring.length > this._text.length) return 0

    let state = 0
    for (let i = 0; i < substring.length; i++) {
      const ch = substring[i]!
      const next = this._states[state]!.transitions.get(ch)
      if (next === undefined) return 0
      state = next
    }

    this._computeOccurrences()
    return this._states[state]!.occurrences
  }

  longestCommonSubstring(other: string): string {
    if (this._text.length === 0 || other.length === 0) return ''

    let state = 0
    let length = 0
    let bestLen = 0
    let bestEnd = -1

    for (let i = 0; i < other.length; i++) {
      const ch = other[i]!
      while (state !== 0 && !this._states[state]!.transitions.has(ch)) {
        state = this._states[state]!.link
        length = this._states[state]!.length
      }

      if (this._states[state]!.transitions.has(ch)) {
        state = this._states[state]!.transitions.get(ch)!
        length++
      } else {
        length = 0
      }

      if (length > bestLen) {
        bestLen = length
        bestEnd = i
      }
    }

    if (bestLen === 0) return ''
    return other.slice(bestEnd - bestLen + 1, bestEnd + 1)
  }

  distinctSubstrings(): number {
    if (this._text.length === 0) return 0

    let count = 0
    for (let i = 1; i < this._size; i++) {
      count += this._states[i]!.length - this._states[this._states[i]!.link]!.length
    }
    return count
  }

  totalSubstrings(): number {
    return (this._text.length * (this._text.length + 1)) / 2
  }

  longestSubstring(): string {
    if (this._text.length <= 1) return ''

    this._computeOccurrences()

    let bestLen = 0
    let bestFirstPos = -1

    for (let i = 1; i < this._size; i++) {
      if (this._states[i]!.occurrences >= 2 && this._states[i]!.length > bestLen) {
        bestLen = this._states[i]!.length
        bestFirstPos = this._states[i]!.firstPos - bestLen + 1
      }
    }

    if (bestLen === 0) return ''
    return this._text.slice(bestFirstPos, bestFirstPos + bestLen)
  }

  length(): number {
    return this._text.length
  }

  clone(): SuffixAutomaton {
    const copy = new SuffixAutomaton()
    copy._text = this._text
    copy._size = this._size
    copy._last = this._last
    copy._occurrencesComputed = this._occurrencesComputed
    copy._states = this._states.map(s => ({
      length: s.length,
      link: s.link,
      transitions: new Map(s.transitions),
      occurrences: s.occurrences,
      firstPos: s.firstPos,
      isCloned: s.isCloned,
    }))
    return copy
  }

  reset(): void {
    this._states = []
    this._size = 0
    this._last = 0
    this._text = ''
    this._occurrencesComputed = false
    this._newState(0, -1)
  }

  extend(c: string): void {
    this.addChar(c)
  }

  build(str: string): void {
    this.reset()
    if (str.length > 0) {
      this.addString(str)
    }
  }

  getAlphabetSize(): number {
    const chars = new Set<string>()
    for (const ch of this._text) {
      chars.add(ch)
    }
    return chars.size
  }
}

export type { SAMState } from './types.js'
