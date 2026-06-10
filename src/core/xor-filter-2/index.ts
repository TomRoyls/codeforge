export class XorFilter2 {
  private fingerprints: Uint8Array;
  private blockSize: number;

  private constructor(fingerprints: Uint8Array, blockSize: number) {
    this.fingerprints = fingerprints;
    this.blockSize = blockSize;
  }

  private static hash(str: string, seed: number): number {
    let h = seed;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    }
    h = Math.imul(h ^ (h >>> 16), 2654435761);
    return h >>> 0;
  }

  private static computeHashes(item: string): [number, number, number] {
    const h1 = XorFilter2.hash(item, 0x9e3779b9);
    const h2 = XorFilter2.hash(item, 0x85ebca6b);
    const h3 = XorFilter2.hash(item, 0xc2b2ae35);
    return [h1, h2, h3];
  }

  private static getBlockIndex(hash: number, blockSize: number, blockId: number): number {
    return ((hash + blockId * 0x9e3779b9) % blockSize + blockSize) % blockSize + blockId * blockSize;
  }

  static buildSync(items: string[]): XorFilter2 {
    if (items.length === 0) {
      return new XorFilter2(new Uint8Array(0), 0);
    }

    const itemHashes = items.map(item => XorFilter2.computeHashes(item));

    for (let factor = 1.23; factor < 3.0; factor += 0.1) {
      const blockSize = Math.max(32, Math.ceil(items.length * factor));
      const size = blockSize * 3;
      const fingerprints = new Uint8Array(size);

      const counts = new Int32Array(size);
      const positionItems: Array<Array<[number, number]>> = Array.from({ length: size }, () => []);

      for (let i = 0; i < items.length; i++) {
        const [h1, h2, h3] = itemHashes[i]!;
        const idx0 = XorFilter2.getBlockIndex(h1, blockSize, 0);
        const idx1 = XorFilter2.getBlockIndex(h2, blockSize, 1);
        const idx2 = XorFilter2.getBlockIndex(h3, blockSize, 2);
        counts[idx0]!++;
        counts[idx1]!++;
        counts[idx2]!++;
        positionItems[idx0]!.push([i, 0]);
        positionItems[idx1]!.push([i, 1]);
        positionItems[idx2]!.push([i, 2]);
      }

      const queue: number[] = [];
      for (let i = 0; i < size; i++) {
        if (counts[i] === 1) queue.push(i);
      }

      let qi = 0;
      const assigned = new Uint8Array(items.length);
      const peelOrder: Array<[number, number]> = [];

      while (qi < queue.length) {
        const pos = queue[qi++]!;
        if (counts[pos]! !== 1) continue;

        let foundItem = -1;
        let foundSlot = -1;
        for (const [itemIdx, slot] of positionItems[pos!]!) {
          if (!assigned[itemIdx]) {
            foundItem = itemIdx;
            foundSlot = slot;
            break;
          }
        }
        if (foundItem === -1) continue;

        assigned[foundItem] = 1;
        peelOrder.push([foundItem, foundSlot]);

        const [h1, h2, h3] = itemHashes[foundItem]!;
        const idx0 = XorFilter2.getBlockIndex(h1, blockSize, 0);
        const idx1 = XorFilter2.getBlockIndex(h2, blockSize, 1);
        const idx2 = XorFilter2.getBlockIndex(h3, blockSize, 2);
        for (const p of [idx0, idx1, idx2]) {
          counts[p]!--;
          if (counts[p] === 1) queue.push(p);
        }
      }

      if (!Array.from(assigned).every(a => a === 1)) continue;

      for (let i = peelOrder.length - 1; i >= 0; i--) {
        const [itemIdx, soloSlot] = peelOrder[i]!;
        const [h1, h2, h3] = itemHashes[itemIdx]!;
        const idx0 = XorFilter2.getBlockIndex(h1, blockSize, 0);
        const idx1 = XorFilter2.getBlockIndex(h2, blockSize, 1);
        const idx2 = XorFilter2.getBlockIndex(h3, blockSize, 2);

        const itemFp = ((h1 ^ h2 ^ h3) & 0xFF) | 1;
        const positions = [idx0, idx1, idx2];
        const soloPos = positions[soloSlot]!;
        const other1 = positions[(soloSlot + 1) % 3]!;
        const other2 = positions[(soloSlot + 2) % 3]!;
        fingerprints[soloPos] = (itemFp ^ fingerprints[other1]! ^ fingerprints[other2]!) & 0xFF;
        if (fingerprints[soloPos] === 0) fingerprints[soloPos] = 0xFF;
      }

      return new XorFilter2(fingerprints, blockSize);
    }

    const blockSize = Math.max(32, Math.ceil(items.length * 1.23));
    return new XorFilter2(new Uint8Array(blockSize * 3), blockSize);
  }

  static async build(items: string[]): Promise<XorFilter2> {
    return XorFilter2.buildSync(items);
  }

  has(item: string): boolean {
    if (this.fingerprints.length === 0) {
      return false;
    }

    const [h1, h2, h3] = XorFilter2.computeHashes(item);

    const idx1 = XorFilter2.getBlockIndex(h1, this.blockSize, 0);
    const idx2 = XorFilter2.getBlockIndex(h2, this.blockSize, 1);
    const idx3 = XorFilter2.getBlockIndex(h3, this.blockSize, 2);

    const f1 = this.fingerprints[idx1]!;
    const f2 = this.fingerprints[idx2]!;
    const f3 = this.fingerprints[idx3]!;

    const xf = f1 ^ f2 ^ f3;
    const expected = ((h1 ^ h2 ^ h3) & 0xFF) | 1;
    return xf === expected;
  }

  size(): number {
    return this.fingerprints.length;
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  toString(): string {
    return `XorFilter2({ size: ${this.fingerprints.length} })`
  }

  get [Symbol.toStringTag](): string {
    return 'XorFilter2'
  }
}
