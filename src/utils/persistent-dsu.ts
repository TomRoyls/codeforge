export class PersistentDSU {
  private parent: number[];
  private size: number[];
  private snapshots: Array<{ parent: number[]; size: number[]; components: number }> = [];
  private componentCount: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = Array(n).fill(1);
    this.componentCount = n;
  }

  find(x: number): number {
    if (x < 0 || x >= this.parent.length) {
      throw new Error(`Index out of bounds: ${x}`);
    }
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]];
      x = this.parent[x];
    }
    return x;
  }

  union(a: number, b: number): boolean {
    if (a < 0 || a >= this.parent.length || b < 0 || b >= this.parent.length) {
      throw new Error(`Index out of bounds`);
    }
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) {
      return false;
    }

    const sizeA = this.size[rootA];
    const sizeB = this.size[rootB];

    if (sizeA === undefined || sizeB === undefined) {
      throw new Error(`Invalid component state`);
    }

    if (sizeA < sizeB) {
      this.parent[rootA] = rootB;
      this.size[rootB] = sizeA + sizeB;
    } else {
      this.parent[rootB] = rootA;
      this.size[rootA] = sizeA + sizeB;
    }

    this.componentCount--;
    return true;
  }

  connected(a: number, b: number): boolean {
    return this.find(a) === this.find(b);
  }

  getSize(x: number): number {
    const root = this.find(x);
    const size = this.size[root];
    if (size === undefined) {
      throw new Error(`Invalid component state`);
    }
    return size;
  }

  snapshot(): number {
    const id = this.snapshots.length;
    this.snapshots.push({
      parent: [...this.parent],
      size: [...this.size],
      components: this.componentCount,
    });
    return id;
  }

  rollback(snapshotId: number): void {
    if (snapshotId < 0 || snapshotId >= this.snapshots.length) {
      throw new Error(`Invalid snapshot ID: ${snapshotId}`);
    }
    const snapshot = this.snapshots[snapshotId]!;
    this.parent = [...snapshot.parent];
    this.size = [...snapshot.size];
    this.componentCount = snapshot.components;
    this.snapshots = this.snapshots.slice(0, snapshotId);
  }

  unionBatch(pairs: Array<[number, number]>): number {
    let merged = 0;
    for (const [a, b] of pairs) {
      if (this.union(a, b)) {
        merged++;
      }
    }
    return merged;
  }

  get components(): number {
    return this.componentCount;
  }

  getComponent(id: number): number[] {
    const root = this.find(id);
    const members: number[] = [];
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === root) {
        members.push(i);
      }
    }
    return members;
  }
}