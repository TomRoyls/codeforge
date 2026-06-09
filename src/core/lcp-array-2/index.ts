export class LCPArray2 {
    private text: string;
    private lcp: number[];
    private rank: number[];

    constructor(text?: string) {
        this.text = text ?? '';
        this.lcp = [];
        this.rank = [];
    }

    build(text: string): number[] {
        this.text = text;
        const n = text.length;
        this.lcp = new Array(n).fill(0);
        this.rank = new Array(n).fill(0);
        const sa = this.buildSuffixArray(text);
        return this.buildFromSuffixArray(text, sa);
    }

    private buildSuffixArray(text: string): number[] {
        const n = text.length;
        const sa = Array.from({ length: n }, (_, i) => i);
        let rank = text.split('').map(c => c.charCodeAt(0));
        let tmp = new Array(n).fill(0);
        let k = 1;

        while (k < n) {
            sa.sort((a, b) => {
                const ra = rank[a]!;
                const rb = rank[b]!;
                const ra2 = a + k < n ? rank[a + k]! : -1;
                const rb2 = b + k < n ? rank[b + k]! : -1;
                if (ra !== rb) return ra - rb;
                if (ra2 !== rb2) return ra2 - rb2;
                return a - b;
            });

            tmp[sa[0]!] = 0;
            for (let i = 1; i < n; i++) {
                const prev = sa[i - 1]!;
                const curr = sa[i]!;
                tmp[curr] = tmp[prev]! + (rank[prev]! !== rank[curr]! || 
                    (prev + k < n ? rank[prev + k]! : -1) !== (curr + k < n ? rank[curr + k]! : -1) ? 1 : 0);
            }

            const temp = rank;
            rank = tmp;
            tmp = temp;
            k <<= 1;
        }

        return sa;
    }

    buildFromSuffixArray(text: string, suffixArray: number[]): number[] {
        const n = text.length;
        this.text = text;
        this.lcp = new Array(n).fill(0);
        this.rank = new Array(n).fill(0);

        for (let i = 0; i < n; i++) {
            this.rank[suffixArray[i]!] = i;
        }

        let h = 0;
        for (let i = 0; i < n; i++) {
            const r = this.rank[i]!;
            if (r > 0) {
                const j = suffixArray[r - 1]!;
                while (i + h < n && j + h < n && text[i + h] === text[j + h]) {
                    h++;
                }
                this.lcp[r] = h;
                if (h > 0) {
                    h--;
                }
            }
        }

        return this.lcp;
    }

    getText(): string {
        return this.text;
    }

    getLCP(i: number): number {
        return this.lcp[i] ?? 0;
    }

    getLCPArray(): number[] {
        return [...this.lcp];
    }

    getMaxLCP(): number {
        if (this.lcp.length === 0) return 0;
        return Math.max(...this.lcp);
    }

    getAverageLCP(): number {
        if (this.lcp.length === 0) return 0;
        const sum = this.lcp.reduce((acc, val) => acc + val, 0);
        return sum / this.lcp.length;
    }

    getNumberOfDistinctSubstrings(): number {
        const n = this.text.length;
        const total = (n * (n + 1)) / 2;
        const lcpSum = this.lcp.reduce((acc, val) => acc + val, 0);
        return total - lcpSum;
    }

    get size(): number {
        return this.lcp.length;
    }

  isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    this.lcp = []
    this.rank = []
  }
}
