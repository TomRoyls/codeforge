export class UnionFind4 {
  private parent: number[];
  private rank: number[];
  private size: number[];
  private components: number;

  constructor(n: number) {
    this.parent = new Array<number>(n);
    this.rank = new Array<number>(n);
    this.size = new Array<number>(n);
    this.components = n;

    for (let i = 0; i < n; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
      this.size[i] = 1;
    }
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]!);
    }
    return this.parent[x]!;
  }

  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return;
    }

    if (this.rank[rootX]! < this.rank[rootY]!) {
      this.parent[rootX] = rootY;
      this.size[rootY]! += this.size[rootX]!;
    } else if (this.rank[rootX]! > this.rank[rootY]!) {
      this.parent[rootY] = rootX;
      this.size[rootX]! += this.size[rootY]!;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]! += 1;
      this.size[rootX]! += this.size[rootY]!;
    }

    this.components -= 1;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  componentSize(x: number): number {
    return this.size[this.find(x)]!;
  }

  componentCount(): number {
    return this.components;
  }

  count(): number {
    return this.parent.length;
  }

  isEmpty(): boolean {
    return this.parent.length === 0
  }
}
