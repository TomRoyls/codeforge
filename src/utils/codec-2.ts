export class Codec2 {
  static base64Encode(data: string): string {
    return Buffer.from(data, 'utf-8').toString('base64')
  }

  static base64Decode(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8')
  }

  static urlEncode(data: string): string {
    return encodeURIComponent(data)
  }

  static urlDecode(data: string): string {
    return decodeURIComponent(data)
  }

  static hexEncode(data: string): string {
    return Buffer.from(data, 'utf-8').toString('hex')
  }

  static hexDecode(data: string): string {
    return Buffer.from(data, 'hex').toString('utf-8')
  }

  static rot13(data: string): string {
    return data.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= 'Z' ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    })
  }

  static runLengthEncode(data: string): string {
    if (data.length === 0) return ''
    const result: string[] = []
    let count = 1
    for (let i = 1; i < data.length; i++) {
      if (data[i] === data[i - 1]) {
        count++
      } else {
        result.push(data[i - 1] + count)
        count = 1
      }
    }
    result.push(data[data.length - 1] + count)
    return result.join('')
  }

  static runLengthDecode(data: string): string {
    const result: string[] = []
    for (let i = 0; i < data.length; i += 2) {
      const char = data[i]
      const count = parseInt(data[i + 1], 10)
      result.push(char.repeat(count))
    }
    return result.join('')
  }

  toArray(): string[] { return [] }
  toString(): string { return JSON.stringify({}) }
  toJSON(): Record<string, number> { return {} }
  clone(): Codec2 { return new Codec2() }
  equals(other: unknown): boolean { return other instanceof Codec2 }
}
