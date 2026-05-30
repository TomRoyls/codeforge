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

    const blockSize = Math.max(32, Math.ceil(items.length * 1.23));
    const size = blockSize * 3;
    const fingerprints = new Uint8Array(size);
    const itemHashes: Array<[number, number, number]> = [];

    for (const item of items) {
      itemHashes.push(XorFilter2.computeHashes(item));
    }

    const counts = new Uint16Array(size);
    for (const hashes of itemHashes) {
      const idx1 = XorFilter2.getBlockIndex(hashes[0]!, blockSize, 0);
      const idx2 = XorFilter2.getBlockIndex(hashes[1]!, blockSize, 1);
      const idx3 = XorFilter2.getBlockIndex(hashes[2]!, blockSize, 2);
      counts[idx1] = (counts[idx1] ?? 0) + 1;
      counts[idx2] = (counts[idx2] ?? 0) + 1;
      counts[idx3] = (counts[idx3] ?? 0) + 1;
    }

    const queue: number[] = [];
    for (let i = 0; i < size; i++) {
      if (counts[i] === 1) {
        queue.push(i);
      }
    }

    const assigned = new Uint8Array(items.length);

    let iterations = 0;
    const maxIterations = items.length * 10;

    let _qi = 0
    while (_qi < queue.length && iterations < maxIterations) {
      iterations++;
      const pos = queue[_qi++]!;
      if (counts[pos] === 0) continue;

      let foundIdx = -1;
      for (let i = 0; i < items.length; i++) {
        if (assigned[i]) continue;

        const hashes = itemHashes[i]!;
        const idx1 = XorFilter2.getBlockIndex(hashes[0]!, blockSize, 0);
        const idx2 = XorFilter2.getBlockIndex(hashes[1]!, blockSize, 1);
        const idx3 = XorFilter2.getBlockIndex(hashes[2]!, blockSize, 2);

        if (idx1 === pos || idx2 === pos || idx3 === pos) {
          foundIdx = i;
          break;
        }
      }

      if (foundIdx === -1) continue;

      const hashes = itemHashes[foundIdx]!;
      const [h1, h2, h3] = hashes;

      const idx1 = XorFilter2.getBlockIndex(h1, blockSize, 0);
      const idx2 = XorFilter2.getBlockIndex(h2, blockSize, 1);
      const idx3 = XorFilter2.getBlockIndex(h3, blockSize, 2);

      if (pos === idx1) {
        fingerprints[idx2] = ((h1 ^ h2) & 0xFF) | 1;
        fingerprints[idx3] = ((h1 ^ h3) & 0xFF) | 1;
      } else if (pos === idx2) {
        fingerprints[idx1] = ((h1 ^ h2) & 0xFF) | 1;
        fingerprints[idx3] = ((h2 ^ h3) & 0xFF) | 1;
      } else {
        fingerprints[idx1] = ((h1 ^ h3) & 0xFF) | 1;
        fingerprints[idx2] = ((h2 ^ h3) & 0xFF) | 1;
      }

      assigned[foundIdx] = 1;

      for (const p of [idx1, idx2, idx3]) {
        counts[p] = (counts[p] ?? 0) - 1;
        if (counts[p] === 1) {
          queue.push(p);
        }
      }
    }

    return new XorFilter2(fingerprints, blockSize);
  }

  static async build(items: string[]): Promise<XorFilter2> {
    return XorFilter2.buildSync(items);
  }

  has(item: string): boolean {
    if (this.fingerprints.length === 0) {
      return false;
    }

    const [h1, h2, h3] = XorFilter2.computeHashes(item);
    const f = ((h1 + h2 + h3) & 0xFF) | 1;

    const idx1 = XorFilter2.getBlockIndex(h1, this.blockSize, 0);
    const idx2 = XorFilter2.getBlockIndex(h2, this.blockSize, 1);
    const idx3 = XorFilter2.getBlockIndex(h3, this.blockSize, 2);

    const f1 = this.fingerprints[idx1]!;
    const f2 = this.fingerprints[idx2]!;
    const f3 = this.fingerprints[idx3]!;

    const xf = f1 ^ f2 ^ f3;
    return (xf & 0xFF) === (f & 0xFF);
  }

  size(): number {
    return this.fingerprints.length;
  }
}
