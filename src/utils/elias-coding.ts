export class EliasCoding {
  static gammaEncode(n: number): string {
    if (n < 1) throw new Error('Elias gamma requires n >= 1')
    const bin = n.toString(2)
    const zeros = bin.length - 1
    return '0'.repeat(zeros) + bin
  }

  static gammaDecode(bits: string): { value: number; consumed: number } {
    let zeros = 0
    let i = 0
    while (i < bits.length && bits[i] === '0') {
      zeros++
      i++
    }
    if (i + zeros + 1 > bits.length) throw new Error('Invalid gamma encoding')
    const bin = bits.substring(i, i + zeros + 1)
    return { value: parseInt(bin, 2), consumed: zeros * 2 + 1 }
  }

  static gammaEncodeArray(arr: number[]): string {
    return arr.map(n => EliasCoding.gammaEncode(n)).join('')
  }

  static gammaDecodeArray(bits: string, count: number): number[] {
    const result: number[] = []
    let pos = 0
    for (let i = 0; i < count; i++) {
      const { value, consumed } = EliasCoding.gammaDecode(bits.substring(pos))
      result.push(value)
      pos += consumed
    }
    return result
  }

  static deltaEncode(n: number): string {
    if (n < 1) throw new Error('Elias delta requires n >= 1')
    const bin = n.toString(2)
    const len = bin.length
    const lenBin = len.toString(2)
    const lenZeros = lenBin.length - 1
    return '0'.repeat(lenZeros) + lenBin + bin.substring(1)
  }

  static deltaDecode(bits: string): { value: number; consumed: number } {
    let zeros = 0
    let i = 0
    while (i < bits.length && bits[i] === '0') {
      zeros++
      i++
    }
    const lenBits = zeros + 1
    const lenBin = bits.substring(i, i + lenBits)
    const len = parseInt(lenBin, 2)
    const restBits = bits.substring(i + lenBits, i + lenBits + len - 1)
    const value = parseInt('1' + restBits, 2)
    return { value, consumed: zeros + lenBits + len - 1 }
  }
}
