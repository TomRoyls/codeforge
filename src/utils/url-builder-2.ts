export class UrlBuilder2 {
  private protocol = 'http'
  private host = 'localhost'
  private port: number | null = null
  private segments: string[] = []
  private queryParams: Record<string, string> = {}
  private hash = ''
  private username = ''
  private password = ''

  setProtocol(protocol: string): this {
    this.protocol = protocol.replace(/:\/$/, '')
    return this
  }

  setHost(host: string): this {
    this.host = host
    return this
  }

  setPort(port: number | null): this {
    this.port = port
    return this
  }

  addSegment(segment: string): this {
    this.segments.push(segment.replace(/^\/+|\/+$/g, ''))
    return this
  }

  addPath(path: string): this {
    for (const seg of path.split('/')) {
      if (seg.trim()) this.segments.push(seg.trim())
    }
    return this
  }

  addQuery(key: string, value: string): this {
    this.queryParams[key] = value
    return this
  }

  addQueries(params: Record<string, string>): this {
    Object.assign(this.queryParams, params)
    return this
  }

  setHash(hash: string): this {
    this.hash = hash.replace(/^#/, '')
    return this
  }

  setAuth(username: string, password = ''): this {
    this.username = username
    this.password = password
    return this
  }

  build(): string {
    let url = `${this.protocol}://`
    if (this.username) {
      url += this.username
      if (this.password) url += `:${this.password}`
      url += '@'
    }
    url += this.host
    if (this.port !== null) url += `:${this.port}`
    if (this.segments.length > 0) url += '/' + this.segments.join('/')
    const queryStr = Object.entries(this.queryParams)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (queryStr) url += `?${queryStr}`
    if (this.hash) url += `#${this.hash}`
    return url
  }

  reset(): this {
    this.protocol = 'http'
    this.host = 'localhost'
    this.port = null
    this.segments = []
    this.queryParams = {}
    this.hash = ''
    this.username = ''
    this.password = ''
    return this
  }

  static parse(url: string): UrlBuilder2 {
    const builder = new UrlBuilder2()
    try {
      const parsed = new URL(url)
      builder.setProtocol(parsed.protocol.replace(':', ''))
      builder.setHost(parsed.hostname)
      if (parsed.port) builder.setPort(parseInt(parsed.port))
      if (parsed.pathname && parsed.pathname !== '/') builder.addPath(parsed.pathname)
      parsed.searchParams.forEach((v, k) => builder.addQuery(k, v))
      if (parsed.hash) builder.setHash(parsed.hash)
      if (parsed.username) builder.setAuth(parsed.username, parsed.password)
    } catch {}
    return builder
  }

  toArray(): string[] { return this.segments }
  toString(): string { return this.build() }
  toJSON(): Record<string, unknown> {
    return { protocol: this.protocol, host: this.host, port: this.port, segments: this.segments, queryParams: this.queryParams, hash: this.hash }
  }
  clone(): UrlBuilder2 {
    const b = new UrlBuilder2()
    b.protocol = this.protocol
    b.host = this.host
    b.port = this.port
    b.segments = [...this.segments]
    b.queryParams = { ...this.queryParams }
    b.hash = this.hash
    b.username = this.username
    b.password = this.password
    return b
  }
  equals(other: unknown): boolean {
    if (!(other instanceof UrlBuilder2)) return false
    return this.build() === other.build()
  }
}
