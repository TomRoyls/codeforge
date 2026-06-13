export interface ParsedQuery {
  key: string
  value: string
}

export class QueryParser2 {
  static parse(queryString: string): ParsedQuery[] {
    const params: ParsedQuery[] = []
    const stripped = queryString.replace(/^[?#]/, '')
    if (!stripped) return params
    for (const pair of stripped.split('&')) {
      const eqIdx = pair.indexOf('=')
      if (eqIdx === -1) {
        params.push({ key: QueryParser2.decode(pair), value: '' })
      } else {
        params.push({
          key: QueryParser2.decode(pair.substring(0, eqIdx)),
          value: QueryParser2.decode(pair.substring(eqIdx + 1)),
        })
      }
    }
    return params
  }

  static encode(value: string): string {
    return encodeURIComponent(value)
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
  }

  static decode(value: string): string {
    return decodeURIComponent(value.replace(/\+/g, '%20'))
  }

  static stringify(params: Record<string, string>): string {
    return Object.entries(params)
      .map(([k, v]) => `${QueryParser2.encode(k)}=${QueryParser2.encode(v)}`)
      .join('&')
  }

  static toMap(queryString: string): Map<string, string> {
    const map = new Map<string, string>()
    for (const param of QueryParser2.parse(queryString)) {
      map.set(param.key, param.value)
    }
    return map
  }

  static toObject(queryString: string): Record<string, string> {
    return Object.fromEntries(QueryParser2.toMap(queryString))
  }

  static getParam(queryString: string, key: string): string | undefined {
    return QueryParser2.toMap(queryString).get(key)
  }

  static hasParam(queryString: string, key: string): boolean {
    return QueryParser2.toMap(queryString).has(key)
  }

  static append(queryString: string, key: string, value: string): string {
    const encoded = `${QueryParser2.encode(key)}=${QueryParser2.encode(value)}`
    return queryString ? `${queryString}&${encoded}` : encoded
  }

  static removeParam(queryString: string, key: string): string {
    const params = QueryParser2.parse(queryString).filter(p => p.key !== key)
    return QueryParser2.stringify(Object.fromEntries(params.map(p => [p.key, p.value])))
  }

  static merge(q1: string, q2: string): string {
    const m1 = QueryParser2.toMap(q1)
    const m2 = QueryParser2.toMap(q2)
    m2.forEach((v, k) => m1.set(k, v))
    return QueryParser2.stringify(Object.fromEntries(m1))
  }

  toArray(): ParsedQuery[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): QueryParser2 { return new QueryParser2() }
  equals(other: unknown): boolean { return other instanceof QueryParser2 }
}
