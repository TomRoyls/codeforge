export class RabinKarp2 {
  private base: number;
  private modulus: number;

  constructor(base: number = 256, modulus: number = 1000000007) {
    this.base = base;
    this.modulus = modulus;
  }

  private computeHash(str: string, length: number): number {
    let hash = 0;
    for (let i = 0; i < length; i++) {
      hash = (hash * this.base + str.charCodeAt(i)) % this.modulus;
    }
    return hash;
  }

  private computeLeadingPower(length: number): number {
    let power = 1;
    for (let i = 0; i < length - 1; i++) {
      power = (power * this.base) % this.modulus;
    }
    return power;
  }

  search(text: string, pattern: string): number[] {
    const result: number[] = [];
    const n = text.length;
    const m = pattern.length;

    if (m === 0 || n < m) {
      return result;
    }

    const patternHash = this.computeHash(pattern, m);
    let textHash = this.computeHash(text, m);
    const leadingPower = this.computeLeadingPower(m);

    for (let i = 0; i <= n - m; i++) {
      if (textHash === patternHash) {
        let match = true;
        for (let j = 0; j < m; j++) {
          if (text.charCodeAt(i + j) !== pattern.charCodeAt(j)) {
            match = false;
            break;
          }
        }
        if (match) {
          result.push(i);
        }
      }

      if (i < n - m) {
        const oldChar = text.charCodeAt(i);
        const newChar = text.charCodeAt(i + m);
        textHash = ((textHash - oldChar * leadingPower % this.modulus + this.modulus) * this.base + newChar) % this.modulus;
      }
    }

    return result;
  }

  findFirst(text: string, pattern: string): number {
    const n = text.length;
    const m = pattern.length;

    if (m === 0 || n < m) {
      return -1;
    }

    const patternHash = this.computeHash(pattern, m);
    let textHash = this.computeHash(text, m);
    const leadingPower = this.computeLeadingPower(m);

    for (let i = 0; i <= n - m; i++) {
      if (textHash === patternHash) {
        let match = true;
        for (let j = 0; j < m; j++) {
          if (text.charCodeAt(i + j) !== pattern.charCodeAt(j)) {
            match = false;
            break;
          }
        }
        if (match) {
          return i;
        }
      }

      if (i < n - m) {
        const oldChar = text.charCodeAt(i);
        const newChar = text.charCodeAt(i + m);
        textHash = ((textHash - oldChar * leadingPower % this.modulus + this.modulus) * this.base + newChar) % this.modulus;
      }
    }

    return -1;
  }

  hasPattern(text: string, pattern: string): boolean {
    return this.findFirst(text, pattern) !== -1;
  }

  searchMultiple(text: string, patterns: string[]): Map<string, number[]> {
    const result = new Map<string, number[]>();

    for (const pattern of patterns) {
      result.set(pattern, this.search(text, pattern));
    }

    return result;
  }

  toString(): string {
    return `RabinKarp2()`
  }

  get [Symbol.toStringTag](): string {
    return 'RabinKarp2'
  }
}
