export type StemmerLanguage2 = 'en' | 'de' | 'fr' | 'es' | 'none'

export interface TokenResult2 {
  token: string
  position: number
  startOffset: number
  endOffset: number
  type: 'word' | 'number' | 'punctuation' | 'whitespace'
}

export class TextAnalyzer2 {
  private language: StemmerLanguage2 = 'en'
  private stopwords: Set<string> = new Set()
  private synonyms: Map<string, string[]> = new Map()
  private lowercase: boolean = true
  private minTokenLength: number = 1
  private maxTokenLength: number = 100

  setLanguage(lang: StemmerLanguage2): this { this.language = lang; return this }
  getLanguage(): StemmerLanguage2 { return this.language }

  setLowercase(enabled: boolean): this { this.lowercase = enabled; return this }

  setMinTokenLength(len: number): this { this.minTokenLength = len; return this }
  setMaxTokenLength(len: number): this { this.maxTokenLength = len; return this }

  addStopwords(words: string[]): this {
    words.forEach(w => this.stopwords.add(w.toLowerCase()))
    return this
  }

  removeStopword(word: string): boolean { return this.stopwords.delete(word.toLowerCase()) }
  isStopword(word: string): boolean { return this.stopwords.has(word.toLowerCase()) }
  getStopwords(): string[] { return Array.from(this.stopwords) }

  addSynonym(word: string, synonyms: string[]): this {
    this.synonyms.set(word.toLowerCase(), synonyms.map(s => s.toLowerCase()))
    return this
  }

  getSynonyms(word: string): string[] { return this.synonyms.get(word.toLowerCase()) ?? [] }

  tokenize(text: string): TokenResult2[] {
    const results: TokenResult2[] = []
    let pos = 0
    const regex = /(\w+|\d+|[^\w\s]|\s+)/g
    let match
    while ((match = regex.exec(text)) !== null) {
      const token = match[0]
      let type: TokenResult2['type']
      if (/^\s+$/.test(token)) type = 'whitespace'
      else if (/^\d+$/.test(token)) type = 'number'
      else if (/^\w+$/.test(token)) type = 'word'
      else type = 'punctuation'

      results.push({
        token, position: pos++, startOffset: match.index, endOffset: match.index + token.length, type,
      })
    }
    return results
  }

  analyze(text: string): string[] {
    const tokens = this.tokenize(text)
      .filter(t => t.type === 'word' || t.type === 'number')
      .map(t => t.token)
      .filter(t => t.length >= this.minTokenLength && t.length <= this.maxTokenLength)

    let processed = this.lowercase ? tokens.map(t => t.toLowerCase()) : tokens

    processed = processed.filter(t => !this.stopwords.has(t.toLowerCase()))

    processed = this.expandSynonyms(processed)

    processed = processed.map(t => this.stem(t))

    return processed
  }

  private expandSynonyms(tokens: string[]): string[] {
    const result: string[] = []
    tokens.forEach(token => {
      result.push(token)
      const syns = this.synonyms.get(token)
      if (syns) result.push(...syns)
    })
    return result
  }

  stem(word: string): string {
    if (this.language === 'none') return word
    const w = word.toLowerCase()
    if (w.length <= 3) return w
    let result = w
    if (this.language === 'en') {
      result = result.replace(/(ies)$/, 'y')
      result = result.replace(/(sses)$/, 'ss')
      result = result.replace(/(sses|ied|ies|ing|ed|ly|ment|ness|ful|less|able|ible)$/, '')
      if (result.length === 0) result = w
    }
    return result
  }

  ngrams(tokens: string[], n: number): string[][] {
    const result: string[][] = []
    for (let i = 0; i <= tokens.length - n; i++) {
      result.push(tokens.slice(i, i + n))
    }
    return result
  }

  shingles(tokens: string[], size: number): string[] {
    return this.ngrams(tokens, size).map(n => n.join(' '))
  }

  highlight(text: string, terms: string[]): string {
    let result = text
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      result = result.replace(regex, '<em>$1</em>')
    })
    return result
  }

  getStats(text: string): { tokens: number; uniqueTokens: number; avgLength: number; stopwordRatio: number } {
    const tokens = this.tokenize(text).filter(t => t.type === 'word' || t.type === 'number')
    const words = tokens.map(t => t.token)
    const unique = new Set(words.map(w => w.toLowerCase()))
    const stopCount = words.filter(w => this.stopwords.has(w.toLowerCase())).length
    const totalLength = words.reduce((s, w) => s + w.length, 0)
    return {
      tokens: words.length,
      uniqueTokens: unique.size,
      avgLength: words.length > 0 ? totalLength / words.length : 0,
      stopwordRatio: words.length > 0 ? stopCount / words.length : 0,
    }
  }

  count(): number { return this.stopwords.size + this.synonyms.size }

  toArray(): string[] { return this.getStopwords() }
  toString(): string { return JSON.stringify({ stopwords: this.stopwords.size, synonyms: this.synonyms.size, language: this.language }) }
  toJSON(): Record<string, unknown> { return { stopwords: this.stopwords.size, synonyms: this.synonyms.size, language: this.language } }
  clone(): TextAnalyzer2 {
    const ta = new TextAnalyzer2()
    ta.language = this.language
    ta.lowercase = this.lowercase
    ta.minTokenLength = this.minTokenLength
    ta.maxTokenLength = this.maxTokenLength
    this.stopwords.forEach(w => ta.stopwords.add(w))
    this.synonyms.forEach((syns, word) => ta.synonyms.set(word, [...syns]))
    return ta
  }
  equals(other: unknown): boolean {
    if (!(other instanceof TextAnalyzer2)) return false
    return this.count() === other.count()
  }
  clear(): void {
    this.stopwords.clear()
    this.synonyms.clear()
  }
}
