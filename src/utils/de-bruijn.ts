export class DeBruijnSequence {
  static generate(k: number, n: number): string {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
    if (k > alphabet.length) throw new Error(`Alphabet size ${k} exceeds available characters`)
    const a: number[] = new Array(k * n).fill(0)
    const sequence: number[] = []
    const db = (t: number, p: number): void => {
      if (t > n) {
        if (n % p === 0) {
          for (let j = 1; j <= p; j++) {
            sequence.push(a[j]!)
          }
        }
      } else {
        a[t] = a[t - p]!
        db(t + 1, p)
        for (let j = a[t - p]! + 1; j < k; j++) {
          a[t] = j
          db(t + 1, t)
        }
      }
    }
    db(1, 1)
    return sequence.map(d => alphabet[d]!).join('')
  }

  static generateBinary(n: number): string {
    return DeBruijnSequence.generate(2, n)
  }

  static containsAllSubstrings(sequence: string, k: number, n: number): boolean {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, k)
    for (let i = 0; i < Math.pow(k, n); i++) {
      let sub = ''
      let temp = i
      for (let j = 0; j < n; j++) {
        sub = alphabet[temp % k] + sub
        temp = Math.floor(temp / k)
      }
      const doubled = sequence + sequence
      if (!doubled.includes(sub)) return false
    }
    return true
  }
}
