/** Quad Tree - a spatial partitioning tree for 2D point data */

export interface Point {
  x: number;
  y: number;
  data?: unknown;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

class QuadTreeNode {
  points: Point[] = [];
  northwest: QuadTreeNode | null = null;
  northeast: QuadTreeNode | null = null;
  southwest: QuadTreeNode | null = null;
  southeast: QuadTreeNode | null = null;

  constructor(
    public bounds: Bounds,
    public depth: number,
  ) {}
}

export class QuadTree {
  private root: QuadTreeNode;
  private _size = 0;
  private _depth = 0;
  private capacity: number;
  private maxDepth: number;

  constructor(bounds: Bounds, capacity = 4, maxDepth = 8) {
    this.root = new QuadTreeNode(bounds, 0);
    this.capacity = capacity;
    this.maxDepth = maxDepth;
  }

  get size(): number {
    return this._size;
  }

  get depth(): number {
    return this._depth;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  clear(): void {
    this.root = new QuadTreeNode(this.root.bounds, 0);
    this._size = 0;
    this._depth = 0;
  }

  insert(point: Point): boolean {
    if (!this.containsPoint(this.root.bounds, point)) {
      return false;
    }
    const inserted = this.insertNode(this.root, point);
    if (inserted) {
      this._size++;
    }
    return inserted;
  }

  private insertNode(node: QuadTreeNode, point: Point): boolean {
    if (node.northwest !== null) {
      const quadrant = this.getQuadrant(node, point);
      if (quadrant !== null) {
        return this.insertNode(quadrant, point);
      }
    }

    node.points.push(point);

    if (
      node.points.length > this.capacity &&
      node.depth < this.maxDepth
    ) {
      this.subdivide(node);
    }

    return true;
  }

  private subdivide(node: QuadTreeNode): void {
    const { x, y, width, height } = node.bounds;
    const halfW = width / 2;
    const halfH = height / 2;
    const nextDepth = node.depth + 1;

    node.northwest = new QuadTreeNode(
      { x, y: y + halfH, width: halfW, height: halfH },
      nextDepth,
    );
    node.northeast = new QuadTreeNode(
      { x: x + halfW, y: y + halfH, width: halfW, height: halfH },
      nextDepth,
    );
    node.southwest = new QuadTreeNode(
      { x, y, width: halfW, height: halfH },
      nextDepth,
    );
    node.southeast = new QuadTreeNode(
      { x: x + halfW, y, width: halfW, height: halfH },
      nextDepth,
    );

    if (nextDepth > this._depth) {
      this._depth = nextDepth;
    }

    const points = node.points;
    node.points = [];

    for (const p of points) {
      const quadrant = this.getQuadrant(node, p);
      if (quadrant !== null) {
        quadrant.points.push(p);
      } else {
        node.points.push(p);
      }
    }
  }

  private getQuadrant(
    node: QuadTreeNode,
    point: Point,
  ): QuadTreeNode | null {
    const { x, y, width, height } = node.bounds;
    const halfW = width / 2;
    const halfH = height / 2;
    const midX = x + halfW;
    const midY = y + halfH;

    const inNorth = point.y >= midY;
    const inSouth = point.y < midY;
    const inWest = point.x < midX;
    const inEast = point.x >= midX;

    if (inNorth && inWest) return node.northwest;
    if (inNorth && inEast) return node.northeast;
    if (inSouth && inWest) return node.southwest;
    if (inSouth && inEast) return node.southeast;

    return null;
  }

  remove(point: Point): boolean {
    const removed = this.removeNode(this.root, point);
    if (removed) {
      this._size--;
    }
    return removed;
  }

  private removeNode(node: QuadTreeNode, point: Point): boolean {
    if (node.northwest !== null) {
      const quadrant = this.getQuadrant(node, point);
      if (quadrant !== null) {
        return this.removeNode(quadrant, point);
      }
    }

    const idx = node.points.findIndex(
      (p) => p.x === point.x && p.y === point.y,
    );
    if (idx !== -1) {
      node.points.splice(idx, 1);
      return true;
    }
    return false;
  }

  contains(point: Point): boolean {
    return this.containsNode(this.root, point);
  }

  private containsNode(node: QuadTreeNode, point: Point): boolean {
    if (node.northwest !== null) {
      const quadrant = this.getQuadrant(node, point);
      if (quadrant !== null) {
        return this.containsNode(quadrant, point);
      }
    }

    return node.points.some((p) => p.x === point.x && p.y === point.y);
  }

  queryRange(range: Bounds): Point[] {
    const result: Point[] = [];
    this.queryRangeNode(this.root, range, result);
    return result;
  }

  private queryRangeNode(
    node: QuadTreeNode,
    range: Bounds,
    result: Point[],
  ): void {
    if (!this.intersects(node.bounds, range)) {
      return;
    }

    for (const p of node.points) {
      if (this.containsPoint(range, p)) {
        result.push(p);
      }
    }

    if (node.northwest !== null) {
      this.queryRangeNode(node.northwest, range, result);
    }
    if (node.northeast !== null) {
      this.queryRangeNode(node.northeast, range, result);
    }
    if (node.southwest !== null) {
      this.queryRangeNode(node.southwest, range, result);
    }
    if (node.southeast !== null) {
      this.queryRangeNode(node.southeast, range, result);
    }
  }

  queryRadius(center: Point, radius: number): Point[] {
    const result: Point[] = [];
    this.queryRadiusNode(this.root, center, radius, radius * radius, result);
    return result;
  }

  private queryRadiusNode(
    node: QuadTreeNode,
    center: Point,
    radius: number,
    radiusSq: number,
    result: Point[],
  ): void {
    const boundingBox: Bounds = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };

    if (!this.intersects(node.bounds, boundingBox)) {
      return;
    }

    for (const p of node.points) {
      const dx = p.x - center.x;
      const dy = p.y - center.y;
      if (dx * dx + dy * dy <= radiusSq) {
        result.push(p);
      }
    }

    if (node.northwest !== null) {
      this.queryRadiusNode(node.northwest, center, radius, radiusSq, result);
    }
    if (node.northeast !== null) {
      this.queryRadiusNode(node.northeast, center, radius, radiusSq, result);
    }
    if (node.southwest !== null) {
      this.queryRadiusNode(node.southwest, center, radius, radiusSq, result);
    }
    if (node.southeast !== null) {
      this.queryRadiusNode(node.southeast, center, radius, radiusSq, result);
    }
  }

  nearestNeighbor(target: Point): Point | undefined {
    if (this._size === 0) return undefined;

    let best: Point | undefined;
    let bestDistSq = Infinity;

    this.nnSearch(this.root, target, best, bestDistSq, (found, dist) => {
      best = found;
      bestDistSq = dist;
    });

    return best;
  }

  private nnSearch(
    node: QuadTreeNode,
    target: Point,
    currentBest: Point | undefined,
    currentBestDistSq: number,
    onUpdate: (point: Point, distSq: number) => void,
  ): void {
    for (const p of node.points) {
      const dx = p.x - target.x;
      const dy = p.y - target.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < currentBestDistSq) {
        onUpdate(p, distSq);
        currentBestDistSq = distSq;
      }
    }

    const quadrants = [
      node.northwest,
      node.northeast,
      node.southwest,
      node.southeast,
    ].filter((q): q is QuadTreeNode => q !== null);
    for (const q of quadrants) {
      if (this.intersects(q.bounds, this.boundingBox(target, Math.sqrt(currentBestDistSq)))) {
        this.nnSearch(q, target, currentBest, currentBestDistSq, onUpdate);
      }
    }
  }

  private boundingBox(center: Point, radius: number): Bounds {
    return {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

  toArray(): Point[] {
    return this.queryRange(this.root.bounds);
  }

  private containsPoint(bounds: Bounds, point: Point): boolean {
    return (
      point.x >= bounds.x &&
      point.x < bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y < bounds.y + bounds.height
    );
  }

  private intersects(a: Bounds, b: Bounds): boolean {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }
}
