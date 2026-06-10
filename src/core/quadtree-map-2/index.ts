interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point<V> {
  x: number;
  y: number;
  value: V;
}

class QuadTreeNode<V> {
  bounds: Bounds;
  points: Point<V>[];
  children: {
    nw: QuadTreeNode<V> | null;
    ne: QuadTreeNode<V> | null;
    sw: QuadTreeNode<V> | null;
    se: QuadTreeNode<V> | null;
  };
  depth: number;

  constructor(bounds: Bounds, depth: number) {
    this.bounds = bounds;
    this.points = [];
    this.children = { nw: null, ne: null, sw: null, se: null };
    this.depth = depth;
  }
}

export class QuadTreeMap2<V> {
  private root: QuadTreeNode<V>;
  private maxPointsPerNode: number;
  private maxDepth: number;

  constructor(bounds: Bounds, maxPointsPerNode: number = 4, maxDepth: number = 8) {
    this.root = new QuadTreeNode(bounds, 0);
    this.maxPointsPerNode = maxPointsPerNode;
    this.maxDepth = maxDepth;
  }

  insert(x: number, y: number, value: V): boolean {
    return this.insertNode(this.root, x, y, value);
  }

  private insertNode(node: QuadTreeNode<V>, x: number, y: number, value: V): boolean {
    if (!this.containsPoint(node.bounds, x, y)) {
      return false;
    }

    if (node.points.length < this.maxPointsPerNode || node.depth >= this.maxDepth) {
      node.points.push({ x, y, value });
      return true;
    }

    if (node.children.nw === null) {
      this.subdivide(node);
    }

    const child = this.getChild(node, x, y);
    if (child) {
      return this.insertNode(child!, x, y, value);
    }

    node.points.push({ x, y, value });
    return true;
  }

  private subdivide(node: QuadTreeNode<V>): void {
    const hw = node.bounds.width / 2;
    const hh = node.bounds.height / 2;
    const x = node.bounds.x;
    const y = node.bounds.y;

    node.children.nw = new QuadTreeNode({ x, y, width: hw, height: hh }, node.depth + 1);
    node.children.ne = new QuadTreeNode({ x: x + hw, y, width: hw, height: hh }, node.depth + 1);
    node.children.sw = new QuadTreeNode({ x, y: y + hh, width: hw, height: hh }, node.depth + 1);
    node.children.se = new QuadTreeNode({ x: x + hw, y: y + hh, width: hw, height: hh }, node.depth + 1);

    for (const point of node.points) {
      const child = this.getChild(node, point.x, point.y);
      if (child) {
        child!.points.push(point);
      }
    }

    node.points = [];
  }

  private getChild(node: QuadTreeNode<V>, x: number, y: number): QuadTreeNode<V> | null {
    const midX = node.bounds.x + node.bounds.width / 2;
    const midY = node.bounds.y + node.bounds.height / 2;

    if (x < midX) {
      if (y < midY) {
        return node.children.nw;
      } else {
        return node.children.sw;
      }
    } else {
      if (y < midY) {
        return node.children.ne;
      } else {
        return node.children.se;
      }
    }
  }

  query(region: Bounds): Array<{ x: number; y: number; value: V }> {
    const result: Array<{ x: number; y: number; value: V }> = [];
    this.queryNode(this.root, region, result);
    return result;
  }

  private queryNode(node: QuadTreeNode<V>, region: Bounds, result: Array<{ x: number; y: number; value: V }>): void {
    if (!this.intersects(node.bounds, region)) {
      return;
    }

    for (const point of node.points) {
      if (this.containsPoint(region, point.x, point.y)) {
        result.push({ x: point.x, y: point.y, value: point.value });
      }
    }

    if (node.children.nw) {
      this.queryNode(node.children.nw!, region, result);
      this.queryNode(node.children.ne!, region, result);
      this.queryNode(node.children.sw!, region, result);
      this.queryNode(node.children.se!, region, result);
    }
  }

  remove(x: number, y: number): boolean {
    return this.removeNode(this.root, x, y);
  }

  private removeNode(node: QuadTreeNode<V>, x: number, y: number): boolean {
    if (!this.containsPoint(node.bounds, x, y)) {
      return false;
    }

    for (let i = 0; i < node.points.length; i++) {
      if (node.points[i]!.x === x && node.points[i]!.y === y) {
        node.points.splice(i, 1);
        return true;
      }
    }

    if (node.children.nw) {
      if (this.removeNode(node.children.nw!, x, y)) return true;
      if (this.removeNode(node.children.ne!, x, y)) return true;
      if (this.removeNode(node.children.sw!, x, y)) return true;
      if (this.removeNode(node.children.se!, x, y)) return true;
    }

    return false;
  }

  contains(x: number, y: number): boolean {
    return this.containsNode(this.root, x, y);
  }

  private containsNode(node: QuadTreeNode<V>, x: number, y: number): boolean {
    if (!this.containsPoint(node.bounds, x, y)) {
      return false;
    }

    for (const point of node.points) {
      if (point.x === x && point.y === y) {
        return true;
      }
    }

    if (node.children.nw) {
      return this.containsNode(node.children.nw!, x, y) ||
             this.containsNode(node.children.ne!, x, y) ||
             this.containsNode(node.children.sw!, x, y) ||
             this.containsNode(node.children.se!, x, y);
    }

    return false;
  }

  size(): number {
    return this.sizeNode(this.root);
  }

  private sizeNode(node: QuadTreeNode<V>): number {
    let count = node.points.length;
    if (node.children.nw) {
      count += this.sizeNode(node.children.nw!);
      count += this.sizeNode(node.children.ne!);
      count += this.sizeNode(node.children.sw!);
      count += this.sizeNode(node.children.se!);
    }
    return count;
  }

  clear(): void {
    this.root = new QuadTreeNode(this.root.bounds, 0);
  }

  private containsPoint(bounds: Bounds, x: number, y: number): boolean {
    return x >= bounds.x && x < bounds.x + bounds.width &&
           y >= bounds.y && y < bounds.y + bounds.height;
  }

  private intersects(b1: Bounds, b2: Bounds): boolean {
    return !(b2.x >= b1.x + b1.width ||
             b2.x + b2.width <= b1.x ||
             b2.y >= b1.y + b1.height ||
             b2.y + b2.height <= b1.y);
  }

  isEmpty(): boolean {
    return this.size() === 0
  }

  has(x: number, y: number): boolean {
    return this.contains(x, y)
  }

  toString(): string {
    return `QuadTreeMap2()`
  }

  get [Symbol.toStringTag](): string {
    return 'QuadTreeMap2'
  }

  includes(x: number, y: number): boolean {
    return this.contains(x, y)
  }
}
