import type { SAMState } from './types.js'

export class SuffixAutomaton {
  private _states: SAMState[]
  private _size: number
  private _last: number
  private _text: string
  private _alphabet: Set<string>
  private _occurrencesComputed: boolean = false

  constructor(text?: string) {
    this._states = []
    this._size = 0
    this._last = 0
    this._text = ''
    this._alphabet = new Set()
    this._initState()

    if (text !== undefined && text.length > 0) {
      this.build(text)
    }
  }

  private _initState(): void {
    this._states = []
    this._size = 0
    this._last = 0
    this._text = ''
    this._alphabet = new Set()
    this._occurrencesComputed = false
    this._newState(0, -1)
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

  extend(char: string): void {
    const curr = this._newState(this._states[this._last]!.length + 1, -1)
    this._states[curr]!.occurrences = 1
    this._states[curr]!.firstPos = this._states[curr]!.length - 1

    let p = this._last
    while (p !== -1 && !this._states[p]!.transitions.has(char)) {
      this._states[p]!.transitions.set(char, curr)
      p = this._states[p]!.link
    }

    if (p === -1) {
      this._states[curr]!.link = 0
    } else {
      const q = this._states[p]!.transitions.get(char)!
      if (this._states[p]!.length + 1 === this._states[q]!.length) {
        this._states[curr]!.link = q
      } else {
        const clone = this._newState(this._states[p]!.length + 1, this._states[q]!.link)
        this._states[clone]!.transitions = new Map(this._states[q]!.transitions)
        this._states[clone]!.firstPos = this._states[q]!.firstPos
        this._states[clone]!.isCloned = true
        this._states[clone]!.occurrences = 0

        while (p !== -1 && this._states[p]!.transitions.get(char) === q) {
          this._states[p]!.transitions.set(char, clone)
          p = this._states[p]!.link
        }

        this._states[q]!.link = clone
        this._states[curr]!.link = clone
      }
    }

    this._last = curr
    this._text += char
    this._alphabet.add(char)
  }

  build(text: string): void {
    this._initState()
    for (let i = 0; i < text.length; i++) {
      this.extend(text[i]!)
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

  countDistinctSubstrings(): number {
    if (this._text.length === 0) return 0

    let count = 0
    for (let i = 1; i < this._size; i++) {
      count += this._states[i]!.length - this._states[this._states[i]!.link]!.length
    }
    return count
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

  longestSubstringEndingAt(position: number): string {
    if (position < 0 || position >= this._text.length) return ''
    if (this._text.length === 0) return ''

    let state = 0
    for (let i = 0; i <= position; i++) {
      state = this._states[state]!.transitions.get(this._text[i]!)!
    }

    this._computeOccurrences()

    let current = state
    while (current !== 0 && this._states[current]!.occurrences <= 1) {
      current = this._states[current]!.link
    }

    if (current === 0) return ''

    const len = Math.min(this._states[current]!.length, position + 1)
    return this._text.slice(position - len + 1, position + 1)
  }

  getLength(): number {
    return this._text.length
  }

  getAlphabetSize(): number {
    return this._alphabet.size
  }

  clone(): SuffixAutomaton {
    const copy = new SuffixAutomaton()
    copy._text = this._text
    copy._alphabet = new Set(this._alphabet)
    copy._size = this._size
    copy._last = this._last
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
}

export type { SAMState, SAMMatchResult } from './types.js'
