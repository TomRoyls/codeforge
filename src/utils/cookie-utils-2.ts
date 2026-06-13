export interface CookieOptions {
  path?: string
  domain?: string
  expires?: Date
  maxAge?: number
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

export class CookieUtils2 {
  private cookies: Map<string, string> = new Map()

  set(name: string, value: string, _options?: CookieOptions): void {
    this.cookies.set(name, value)
  }

  get(name: string): string | undefined {
    return this.cookies.get(name)
  }

  delete(name: string): boolean {
    return this.cookies.delete(name)
  }

  has(name: string): boolean {
    return this.cookies.has(name)
  }

  clear(): void {
    this.cookies.clear()
  }

  size(): number {
    return this.cookies.size
  }

  keys(): string[] {
    return Array.from(this.cookies.keys())
  }

  values(): string[] {
    return Array.from(this.cookies.values())
  }

  toHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }

  static parse(setCookieHeader: string): { name: string; value: string; options: CookieOptions } | null {
    const parts = setCookieHeader.split(';').map(p => p.trim())
    if (parts.length === 0) return null
    const eqIdx = parts[0].indexOf('=')
    if (eqIdx === -1) return null
    const name = parts[0].substring(0, eqIdx).trim()
    const value = parts[0].substring(eqIdx + 1).trim()
    const options: CookieOptions = {}
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i]
      const peq = part.indexOf('=')
      if (peq === -1) {
        const attr = part.toLowerCase()
        if (attr === 'secure') options.secure = true
        if (attr === 'httponly') options.httpOnly = true
      } else {
        const attr = part.substring(0, peq).trim().toLowerCase()
        const val = part.substring(peq + 1).trim()
        if (attr === 'path') options.path = val
        if (attr === 'domain') options.domain = val
        if (attr === 'max-age') options.maxAge = parseInt(val)
        if (attr === 'samesite') options.sameSite = val.toLowerCase() as 'strict' | 'lax' | 'none'
        if (attr === 'expires') options.expires = new Date(val)
      }
    }
    return { name, value, options }
  }

  static serialize(name: string, value: string, options?: CookieOptions): string {
    let result = `${name}=${value}`
    if (options?.path) result += `; Path=${options.path}`
    if (options?.domain) result += `; Domain=${options.domain}`
    if (options?.maxAge !== undefined) result += `; Max-Age=${options.maxAge}`
    if (options?.expires) result += `; Expires=${options.expires.toUTCString()}`
    if (options?.secure) result += '; Secure'
    if (options?.httpOnly) result += '; HttpOnly'
    if (options?.sameSite) result += `; SameSite=${options.sameSite}`
    return result
  }

  static parseCookieJar(header: string): Map<string, string> {
    const cookies = new Map<string, string>()
    const pairs = header.split(';')
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=')
      if (eqIdx === -1) continue
      const name = pair.substring(0, eqIdx).trim()
      const value = pair.substring(eqIdx + 1).trim()
      cookies.set(name, value)
    }
    return cookies
  }

  toArray(): [string, string][] { return Array.from(this.cookies.entries()) }
  toString(): string { return this.toHeader() }
  toJSON(): Record<string, string> { return Object.fromEntries(this.cookies) }
  clone(): CookieUtils2 {
    const c = new CookieUtils2()
    this.cookies.forEach((v, k) => c.set(k, v))
    return c
  }
  equals(other: unknown): boolean {
    if (!(other instanceof CookieUtils2)) return false
    if (this.size() !== other.size()) return false
    for (const [k, v] of this.cookies) {
      if (other.get(k) !== v) return false
    }
    return true
  }
}
