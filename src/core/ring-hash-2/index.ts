interface RingEntry {
  hash: number;
  node: string;
}

function polynomialHash(key: string): number {
  let hash = 0;
  const prime = 31;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash * prime) + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export class RingHash2 {
  private virtualNodeCount: number;
  private ring: RingEntry[] = [];
  private nodeSet: Set<string> = new Set();

  constructor(virtualNodes: number = 100) {
    this.virtualNodeCount = virtualNodes;
  }

  addNode(node: string): void {
    if (this.nodeSet.has(node)) {
      return;
    }
    this.nodeSet.add(node);
    for (let i = 0; i < this.virtualNodeCount; i++) {
      const virtualNodeKey = `${node}#${i}`;
      const hash = polynomialHash(virtualNodeKey);
      this.ring.push({ hash, node });
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  removeNode(node: string): void {
    if (!this.nodeSet.has(node)) {
      return;
    }
    this.nodeSet.delete(node);
    this.ring = this.ring.filter(entry => entry.node !== node);
  }

  getNode(key: string): string | undefined {
    if (this.ring.length === 0) {
      return undefined;
    }
    const hash = polynomialHash(key);
    let left = 0;
    let right = this.ring.length - 1;
    let result = -1;
    while (left <= right) {
      const mid = (left + right) >>> 1;
      if (this.ring[mid]!.hash >= hash) {
        result = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    if (result === -1) {
      return this.ring[0]!.node;
    }
    return this.ring[result]!.node;
  }

  nodes(): string[] {
    return Array.from(this.nodeSet);
  }

  size(): number {
    return this.ring.length;
  }

  clear(): void {
    this.ring = [];
    this.nodeSet.clear();
  }
}
