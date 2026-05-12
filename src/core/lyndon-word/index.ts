export type { LyndonWordOptions } from './types.js';

export function lyndonFactorize(s: string): string[] {
    const n = s.length;
    const factors: string[] = [];
    let i = 0;

    while (i < n) {
        let j = i + 1;
        let k = i;

        while (j < n && s[k]! <= s[j]!) {
            if (s[k]! < s[j]!) {
                k = i;
            } else {
                k = k + 1;
            }
            j = j + 1;
        }

        const period = j - k;
        
        while (i <= k) {
            factors.push(s.slice(i, i + period));
            i = i + period;
        }
    }

    return factors;
}

export function isLyndonWord(s: string): boolean {
    const n = s.length;
    if (n <= 1) {
        return true;
    }

    for (let i = 1; i < n; i++) {
        const rotation = s.slice(i) + s.slice(0, i);
        if (rotation <= s) {
            return false;
        }
    }

    return true;
}

export class LyndonFactorization {
    private factors: string[] = [];

    factorize(s: string): string[] {
        this.factors = lyndonFactorize(s);
        return this.factors;
    }

    isLyndon(s: string): boolean {
        return isLyndonWord(s);
    }

    countLyndonFactors(s: string): number {
        const factorization = lyndonFactorize(s);
        return factorization.length;
    }

    getFactors(): string[] {
        return [...this.factors];
    }

    minRotation(s: string): string {
        if (s.length === 0) {
            return s;
        }

        const n = s.length;
        let minStr = s;

        for (let i = 1; i < n; i++) {
            const rotation = s.slice(i) + s.slice(0, i);
            if (rotation < minStr) {
                minStr = rotation;
            }
        }

        return minStr;
    }
}
