export class DisjointSet3 {
  private parent: Map<string, string>;
  private rank: Map<string, number>;
  private size: Map<string, number>;
  private setCount: number;

  constructor() {
    this.parent = new Map();
    this.rank = new Map();
    this.size = new Map();
    this.setCount = 0;
  }

  makeSet(item: string): void {
    if (this.parent.has(item)) {
      return;
    }
    this.parent.set(item, item);
    this.rank.set(item, 0);
    this.size.set(item, 1);
    this.setCount++;
  }

  find(item: string): string {
    if (!this.parent.has(item)) {
      throw new Error(`Item ${item} not found`);
    }

    const root = this.findRoot(item);
    this.compressPath(item, root);
    return root;
  }

  private findRoot(item: string): string {
    const parent = this.parent.get(item)!;
    if (parent === item) {
      return item;
    }
    return this.findRoot(parent);
  }

  private compressPath(item: string, root: string): void {
    const parent = this.parent.get(item)!;
    if (parent !== item && parent !== root) {
      this.parent.set(item, root);
      this.compressPath(parent, root);
    }
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);

    if (rootA === rootB) {
      return;
    }

    const rankA = this.rank.get(rootA)!;
    const rankB = this.rank.get(rootB)!;

    if (rankA < rankB) {
      this.link(rootB, rootA);
    } else if (rankB < rankA) {
      this.link(rootA, rootB);
    } else {
      this.link(rootA, rootB);
      this.rank.set(rootA, rankA + 1);
    }
  }

  private link(root1: string, root2: string): void {
    this.parent.set(root2, root1);
    const size1 = this.size.get(root1)!;
    const size2 = this.size.get(root2)!;
    this.size.set(root1, size1 + size2);
    this.setCount--;
  }

  connected(a: string, b: string): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    return rootA === rootB;
  }

  setSize(item: string): number {
    const root = this.find(item);
    return this.size.get(root)!;
  }

  count(): number {
    return this.setCount;
  }

  isEmpty(): boolean {
    return this.size.size === 0
  }
}
