export class VByte {
  static encode(value: number): Uint8Array {
    if (value < 0) throw new RangeError('VByte only encodes non-negative integers')
    const bytes: number[] = []
    let v = value
    while (v >= 0x80) {
      bytes.push((v & 0x7F) | 0x80)
      v >>>= 7
    }
    bytes.push(v & 0x7F)
    return new Uint8Array(bytes)
  }

  static decode(buffer: Uint8Array, offset: number = 0): { value: number; bytesRead: number } {
    let value = 0
    let shift = 0
    let pos = offset
    while (pos < buffer.length) {
      const byte = buffer[pos]!
      value |= (byte & 0x7F) << shift
      pos++
      if ((byte & 0x80) === 0) break
      shift += 7
    }
    return { value, bytesRead: pos - offset }
  }

  static encodeMany(values: number[]): Uint8Array {
    const chunks: Uint8Array[] = []
    let totalLen = 0
    for (const v of values) {
      const encoded = VByte.encode(v)
      chunks.push(encoded)
      totalLen += encoded.length
    }
    const result = new Uint8Array(totalLen)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }
    return result
  }

  static decodeMany(buffer: Uint8Array, count?: number): { values: number[]; bytesRead: number } {
    const values: number[] = []
    let pos = 0
    const max = count !== undefined ? count : Infinity
    while (pos < buffer.length && values.length < max) {
      const result = VByte.decode(buffer, pos)
      values.push(result.value)
      pos += result.bytesRead
    }
    return { values, bytesRead: pos }
  }

  static encodedSize(value: number): number {
    if (value < 0) throw new RangeError('VByte only encodes non-negative integers')
    if (value < 0x80) return 1
    if (value < 0x4000) return 2
    if (value < 0x200000) return 3
    if (value < 0x10000000) return 4
    return 5
  }

  static encodeDelta(values: number[]): Uint8Array {
    if (values.length === 0) return new Uint8Array(0)
    const deltas: number[] = [values[0]!]
    for (let i = 1; i < values.length; i++) {
      const diff = values[i]! - values[i - 1]!
      if (diff < 0) throw new RangeError('Delta encoding requires non-decreasing values')
      deltas.push(diff)
    }
    return VByte.encodeMany(deltas)
  }

  static decodeDelta(buffer: Uint8Array): { values: number[]; bytesRead: number } {
    if (buffer.length === 0) return { values: [], bytesRead: 0 }
    const { values: deltas, bytesRead } = VByte.decodeMany(buffer)
    const values: number[] = []
    let acc = 0
    for (const d of deltas) {
      acc += d
      values.push(acc)
    }
    return { values, bytesRead }
  }
}
