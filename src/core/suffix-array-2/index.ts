export class SuffixArray2 {
  private readonly text: string;
  private readonly suffixArray: number[];
  private readonly n: number;

  constructor(text: string) {
    this.text = text;
    this.n = text.length;
    this.suffixArray = this.buildSuffixArray();
  }

  private buildSuffixArray(): number[] {
    if (this.n === 0) return [];

    const sa: number[] = Array.from({ length: this.n }, (_, i) => i);
    const rank: number[] = Array.from({ length: this.n }, (_, i) => this.text.charCodeAt(i));
    const tmp: number[] = new Array(this.n);

    for (let k = 1; k < this.n; k *= 2) {
      sa.sort((a, b) => {
        const aIndex = a!;
        const bIndex = b!;
        if (rank[aIndex] !== rank[bIndex]) return rank[aIndex]! - rank[bIndex]!;
        const ra = aIndex + k < this.n ? rank[aIndex + k]! : -1;
        const rb = bIndex + k < this.n ? rank[bIndex + k]! : -1;
        return ra! - rb!;
      });

      tmp[sa[0]!] = 0;
      let r = 0;

      for (let i = 1; i < this.n; i++) {
        const prev = sa[i - 1]!;
        const curr = sa[i]!;

        if (rank[prev] !== rank[curr] || (prev + k < this.n ? rank[prev + k]! : -1) !== (curr + k < this.n ? rank[curr + k]! : -1)) {
          r++;
        }

        tmp[curr] = r;
      }

      for (let i = 0; i < this.n; i++) {
        rank[i] = tmp[i]!;
      }

      if (r === this.n - 1) break;
    }

    return sa;
  }

  search(pattern: string): number[] {
    const m = pattern.length;

    if (m === 0 || this.n === 0) return [];

    let left = 0;
    let right = this.n;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffix = this.text.substring(this.suffixArray[mid]!);
      const cmp = this.compareStrings(suffix, pattern, m);

      if (cmp < 0) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    if (left >= this.n || !this.text.startsWith(pattern, this.suffixArray[left]!)) return [];

    const start = left;
    right = this.n;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const suffix = this.text.substring(this.suffixArray[mid]!);

      if (suffix.startsWith(pattern)) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const end = left;

    return this.suffixArray.slice(start, end).sort((a, b) => a - b);
  }

  private compareStrings(suffix: string, pattern: string, m: number): number {
    const n = suffix.length;
    const minLen = Math.min(n, m);

    for (let i = 0; i < minLen; i++) {
      if (suffix[i] !== pattern[i]) {
        return suffix.charCodeAt(i) - pattern.charCodeAt(i);
      }
    }

    return n - m;
  }

  contains(pattern: string): boolean {
    if (pattern.length === 0) return true;
    return this.search(pattern).length > 0;
  }

  longestCommonPrefix(i: number): number {
    if (i < 0 || i >= this.n - 1) return 0;

    const s1 = this.text.substring(this.suffixArray[i]!);
    const s2 = this.text.substring(this.suffixArray[i + 1]!);

    let len = 0;
    const minLen = Math.min(s1.length, s2.length);

    while (len < minLen && s1[len] === s2[len]) len++;

    return len;
  }

  toArray(): number[] {
    return [...this.suffixArray];
  }

  get size(): number {
    return this.n;
  }

  isEmpty(): boolean {
    return this.n === 0;
  }

  substring(i: number): string {
    if (i < 0 || i >= this.n) return '';
    return this.text.substring(this.suffixArray[i]!);
  }
}
