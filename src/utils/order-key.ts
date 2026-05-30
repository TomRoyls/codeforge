const BASE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function indexOf(c: string): number {
  return BASE.indexOf(c)
}

export function generateKeyBetween(a: string | null, b: string | null): string {
  if (a !== null && b !== null && a >= b) {
    throw new RangeError(`a must be less than b, got a="${a}" b="${b}"`)
  }

  if (a === null) a = ''
  if (b === null) b = ''

  if (a === '' && b === '') return 'a'

  if (a === '') {
    if (b === '') return 'a'
    const bi = indexOf(b[0]!)
    if (bi > 1) {
      return BASE[Math.floor(bi / 2)]!
    }
    if (b.length === 1) {
      return b + BASE[Math.floor(BASE.length / 2)]!
    }
    const inner = generateKeyBetween(null, b.slice(1))
    return b[0]! + inner.slice(1)
  }

  if (b === '') {
    const last = a[a.length - 1]!
    const li = indexOf(last)
    if (li < BASE.length - 2) {
      return a.slice(0, -1) + BASE[li + 1]!
    }
    return a + BASE[Math.floor(BASE.length / 2)]!
  }

  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++
  }

  const ai = indexOf(a[i] ?? '')
  const bi = indexOf(b[i]!)

  if (bi - ai > 1) {
    return (i > 0 ? a.slice(0, i) : '') + BASE[Math.floor((ai + bi) / 2)]!
  }

  if (b.length > i + 1) {
    const bji = indexOf(b[i + 1]!)
    if (bji > 1) {
      return b.slice(0, i + 1) + BASE[Math.floor(bji / 2)]!
    }
  }

  return a + BASE[Math.floor(BASE.length / 2)]!
}

export function generateNKeysBetween(
  a: string | null,
  b: string | null,
  n: number,
): string[] {
  if (n <= 0) return []
  const keys: string[] = []
  let lo = a
  for (let i = 0; i < n; i++) {
    const key = generateKeyBetween(lo, b)
    keys.push(key)
    lo = key
  }
  return keys
}

export function firstKey(): string {
  return 'a'
}

export function compareKeys(a: string, b: string): number {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
