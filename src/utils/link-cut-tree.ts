export class LinkCutTree {
  private readonly parent: number[];
  private readonly children: Set<number>[];
  private readonly value: number[];
  private readonly n: number;
  private static readonly NULL = -1;

  constructor(n: number) {
    this.n = n;
    this.parent = new Array(n).fill(LinkCutTree.NULL);
    this.children = new Array(n).fill(null).map(() => new Set<number>());
    this.value = new Array(n).fill(0);
  }

  private isNull(x: number): boolean {
    return x === LinkCutTree.NULL;
  }

  link(child: number, parent: number): void {
    if (child < 0 || child >= this.n || parent < 0 || parent >= this.n) {
      throw new Error('Node index out of bounds');
    }

    if (child === parent) {
      throw new Error('Cannot link node to itself');
    }

    if (this.connected(child, parent)) {
      throw new Error('Nodes are already connected');
    }

    this.makeRoot(child);

    this.parent[child] = parent;
    this.children[parent].add(child);
  }

  private makeRoot(node: number): void {
    while (!this.isNull(this.parent[node])) {
      const p = this.parent[node] as number;
      const gp = this.parent[p] as number;

      (this.children[p] as Set<number>).delete(node);
      this.parent[node] = gp;

      this.parent[p] = node;
      (this.children[node] as Set<number>).add(p);

      if (!this.isNull(gp)) {
        (this.children[gp] as Set<number>).delete(p);
        (this.children[gp] as Set<number>).add(node);
      }
    }
  }

  cut(node: number): void {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    const parent = this.parent[node] as number;

    if (this.isNull(parent)) {
      return;
    }

    this.parent[node] = LinkCutTree.NULL;
    (this.children[parent] as Set<number>).delete(node);

    (this.children[node] as Set<number>).forEach((child: number) => {
      this.parent[child] = parent;
      (this.children[parent] as Set<number>).add(child);
    });

    (this.children[node] as Set<number>).clear();
  }

  findRoot(node: number): number {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    while (!this.isNull(this.parent[node])) {
      node = this.parent[node] as number;
    }

    return node;
  }

  lca(u: number, v: number): number {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) {
      throw new Error('Node index out of bounds');
    }

    if (u === v) {
      return u;
    }

    if (!this.connected(u, v)) {
      return LinkCutTree.NULL;
    }

    const ancestorsU = new Set<number>();
    let current = u;
    while (!this.isNull(current)) {
      ancestorsU.add(current);
      current = this.parent[current] as number;
    }

    current = v;
    while (!this.isNull(current)) {
      if (ancestorsU.has(current)) {
        return current;
      }
      current = this.parent[current] as number;
    }

    return LinkCutTree.NULL;
  }

  connected(u: number, v: number): boolean {
    if (u < 0 || u >= this.n || v < 0 || v >= this.n) {
      throw new Error('Node index out of bounds');
    }

    if (u === v) {
      return true;
    }

    return this.findRoot(u) === this.findRoot(v);
  }

  private getPathToRoot(node: number): number[] {
    const path: number[] = [];
    while (!this.isNull(node)) {
      path.push(node);
      node = this.parent[node] as number;
    }
    return path;
  }

  pathSum(node: number): number {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    const path = this.getPathToRoot(node);
    return path.reduce((sum, n) => sum + (this.value[n] as number), 0);
  }

  pathMin(node: number): number {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    const path = this.getPathToRoot(node);
    return Math.min(...path.map(n => this.value[n] as number));
  }

  pathMax(node: number): number {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    const path = this.getPathToRoot(node);
    return Math.max(...path.map(n => this.value[n] as number));
  }

  pathUpdate(node: number, delta: number): void {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    const path = this.getPathToRoot(node);
    for (const n of path) {
      (this.value[n] as number) += delta;
    }
  }

  setValue(node: number, value: number): void {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    this.value[node] = value;
  }

  getValue(node: number): number {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    return this.value[node];
  }

  evert(node: number): void {
    if (node < 0 || node >= this.n) {
      throw new Error('Node index out of bounds');
    }

    this.makeRoot(node);
  }
}