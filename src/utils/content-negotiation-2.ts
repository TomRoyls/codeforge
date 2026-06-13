export class ContentNegotiation2 {
  static parseAccept(header: string): { type: string; subtype: string; q: number; params: Record<string, string> }[] {
    const parts = header.split(',').map(p => p.trim()).filter(p => p)
    return parts.map(part => {
      const segments = part.split(';').map(s => s.trim())
      const [type, subtype] = segments[0].split('/')
      const q = segments.find(s => s.startsWith('q=')) ? parseFloat(segments.find(s => s.startsWith('q='))!.split('=')[1]) : 1.0
      const params: Record<string, string> = {}
      for (let i = 1; i < segments.length; i++) {
        const eqIdx = segments[i].indexOf('=')
        if (eqIdx !== -1 && !segments[i].startsWith('q=')) {
          params[segments[i].substring(0, eqIdx)] = segments[i].substring(eqIdx + 1)
        }
      }
      return { type: type || '*', subtype: subtype || '*', q: isNaN(q) ? 1.0 : q, params }
    })
  }

  static bestMatch(header: string, available: string[]): string | undefined {
    const accepted = ContentNegotiation2.parseAccept(header)
    accepted.sort((a, b) => b.q - a.q)
    for (const accept of accepted) {
      for (const avail of available) {
        const [at, asub] = avail.split('/')
        const typeMatch = accept.type === '*' || accept.type === at
        const subtypeMatch = accept.subtype === '*' || accept.subtype === asub
        if (typeMatch && subtypeMatch) return avail
      }
    }
    return undefined
  }

  static parseLanguage(header: string): { lang: string; q: number }[] {
    const parts = header.split(',').map(p => p.trim()).filter(p => p)
    return parts.map(part => {
      const segments = part.split(';')
      const lang = segments[0].trim()
      const qSeg = segments.find(s => s.trim().startsWith('q='))
      const q = qSeg ? parseFloat(qSeg.split('=')[1]) : 1.0
      return { lang, q: isNaN(q) ? 1.0 : q }
    })
  }

  static bestLanguage(header: string, available: string[]): string | undefined {
    const accepted = ContentNegotiation2.parseLanguage(header)
    accepted.sort((a, b) => b.q - a.q)
    for (const accept of accepted) {
      for (const avail of available) {
        if (accept.lang === '*' || avail.startsWith(accept.lang)) return avail
      }
    }
    return undefined
  }

  static parseEncoding(header: string): { encoding: string; q: number }[] {
    const parts = header.split(',').map(p => p.trim()).filter(p => p)
    return parts.map(part => {
      const segments = part.split(';')
      const encoding = segments[0].trim()
      const qSeg = segments.find(s => s.trim().startsWith('q='))
      const q = qSeg ? parseFloat(qSeg.split('=')[1]) : 1.0
      return { encoding, q: isNaN(q) ? 1.0 : q }
    })
  }

  static matches(accept: string, mimeType: string): boolean {
    const [at, asub] = accept.split('/')
    const [mt, msub] = mimeType.split('/')
    return (at === '*' || at === mt) && (asub === '*' || asub === msub)
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): ContentNegotiation2 { return new ContentNegotiation2() }
  equals(other: unknown): boolean { return other instanceof ContentNegotiation2 }
}
