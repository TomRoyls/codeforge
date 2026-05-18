/** XOR Filter - a space-efficient approximate membership data structure */

function fnvHash(s: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class XorFilter {
  private t0: Uint8Array;
  private t1: Uint8Array;
  private t2: Uint8Array;
  private _seed: number;
  private _size: number;
  private _blockLen: number;

  private constructor(
    t0: Uint8Array, t1: Uint8Array, t2: Uint8Array,
    seed: number, size: number, blockLen: number,
  ) {
    this.t0 = t0;
    this.t1 = t1;
    this.t2 = t2;
    this._seed = seed;
    this._size = size;
    this._blockLen = blockLen;
  }

  private getSlots(s: string, seed: number): [number, number, number] {
    const bl = this._blockLen;
    const h0 = fnvHash(s, seed) % bl;
    const h1 = fnvHash(s, seed ^ 0x7946a123) % bl;
    const h2 = fnvHash(s, seed ^ 0x5d28ae63) % bl;
    return [h0, h1, h2];
  }

  private getFp(s: string): number {
    return (fnvHash(s, this._seed ^ 0xb192f3d7) & 0xff) | 1;
  }

  static create(items: string[], seed = 0x9e3779b9): XorFilter {
      const seen = new Set<string>();
      const unique = items.filter((x) => {
        if (seen.has(x)) return false;
        seen.add(x);
        return true;
      });
    const n = unique.length;

    if (n === 0) {
      const t = new Uint8Array(1);
      return new XorFilter(t, t, t, seed, 0, 1);
    }

    const blockLen = Math.ceil(n * 1.23) + 32;

    for (let attempt = 0; attempt < 100; attempt++) {
      const s = ((seed + attempt * 0x517cc1b7) & 0xffffffff) >>> 0;

      const slots = unique.map((item) => {
        const h0 = fnvHash(item, s) % blockLen;
        const h1 = fnvHash(item, s ^ 0x7946a123) % blockLen;
        const h2 = fnvHash(item, s ^ 0x5d28ae63) % blockLen;
        const fp = (fnvHash(item, s ^ 0xb192f3d7) & 0xff) | 1;
        return { h0, h1, h2, fp };
      });

      const b0: Set<number>[] = Array.from({ length: blockLen }, () => new Set());
      const b1: Set<number>[] = Array.from({ length: blockLen }, () => new Set());
      const b2: Set<number>[] = Array.from({ length: blockLen }, () => new Set());

      for (let i = 0; i < n; i++) {
        b0[slots[i].h0].add(i);
        b1[slots[i].h1].add(i);
        b2[slots[i].h2].add(i);
      }

      const buckets = [b0, b1, b2];
      const stack: { itemIdx: number; whichBucket: number }[] = [];
      const removed = new Uint8Array(n);

      let changed = true;
      while (changed) {
        changed = false;
        for (let b = 0; b < 3; b++) {
          for (let j = 0; j < blockLen; j++) {
            const alive = new Set(Array.from(buckets[b][j]).filter((i) => !removed[i]));
            buckets[b][j] = alive;
            if (alive.size === 1) {
              const itemIdx = alive.values().next().value as number;
              stack.push({ itemIdx, whichBucket: b });
              removed[itemIdx] = 1;
              buckets[0][slots[itemIdx].h0].delete(itemIdx);
              buckets[1][slots[itemIdx].h1].delete(itemIdx);
              buckets[2][slots[itemIdx].h2].delete(itemIdx);
              changed = true;
            }
          }
        }
      }

      if (stack.length !== n) continue;

      const table0 = new Uint8Array(blockLen);
      const table1 = new Uint8Array(blockLen);
      const table2 = new Uint8Array(blockLen);
      const tables = [table0, table1, table2];
      const slotKeys: (keyof typeof slots[0])[] = ['h0', 'h1', 'h2'];

      while (stack.length > 0) {
        const { itemIdx, whichBucket } = stack.pop()!;
        const sl = slots[itemIdx];
        const indices = [sl.h0, sl.h1, sl.h2];
        let val = sl.fp;
        for (let b = 0; b < 3; b++) {
          if (b !== whichBucket) {
            val ^= tables[b][indices[b]];
          }
        }
        tables[whichBucket][indices[whichBucket]] = val;
      }

      return new XorFilter(table0, table1, table2, s, n, blockLen);
    }

    const t = new Uint8Array(blockLen);
    return new XorFilter(t, t, t, seed, 0, blockLen);
  }

  has(item: string): boolean {
    if (this._size === 0) return false;
    const [i0, i1, i2] = this.getSlots(item, this._seed);
    const f = this.getFp(item);
    return (this.t0[i0] ^ this.t1[i1] ^ this.t2[i2]) === f;
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this._blockLen * 3;
  }

  get falsePositiveRate(): number {
    if (this._size === 0) return 0;
    return 1 / 256;
  }

  get serializedSize(): number {
    return this._blockLen * 3;
  }
}
