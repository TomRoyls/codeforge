export type Point = { x: number; y: number };

export type Boundary = { x: number; y: number; width: number; height: number };

export class QuadTree {
  boundary: Boundary;
  capacity: number;
  points: Point[];
  divided: boolean;
  northeast: QuadTree | null;
  northwest: QuadTree | null;
  southeast: QuadTree | null;
  southwest: QuadTree | null;

  constructor(boundary: Boundary, capacity: number = 4) {
    if (capacity < 1) throw new RangeError('capacity must be >= 1')

    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  insert(point: Point): boolean {
    if (!this.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    if (this.northeast!.insert(point)) return true;
    if (this.northwest!.insert(point)) return true;
    if (this.southeast!.insert(point)) return true;
    if (this.southwest!.insert(point)) return true;

    return false;
  }

  subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const ne: Boundary = { x: x + halfWidth, y: y, width: halfWidth, height: halfHeight };
    const nw: Boundary = { x: x, y: y, width: halfWidth, height: halfHeight };
    const se: Boundary = { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight };
    const sw: Boundary = { x: x, y: y + halfHeight, width: halfWidth, height: halfHeight };

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;
  }

  queryRange(range: Boundary): Point[] {
    const found: Point[] = [];

    if (!this.intersects(range)) {
      return found;
    }

    for (const point of this.points) {
      if (this.containsPoint(point, range)) {
        found.push(point);
      }
    }

    if (this.divided) {
      found.push(...this.northeast!.queryRange(range));
      found.push(...this.northwest!.queryRange(range));
      found.push(...this.southeast!.queryRange(range));
      found.push(...this.southwest!.queryRange(range));
    }

    return found;
  }

  intersects(range: Boundary): boolean {
    const { x: rx, y: ry, width: rw, height: rh } = range;
    const bx = this.boundary.x;
    const by = this.boundary.y;
    const bw = this.boundary.width;
    const bh = this.boundary.height;

    if (bx > rx + rw || rx > bx + bw) return false;
    if (by > ry + rh || ry > by + bh) return false;

    return true;
  }

  contains(point: Point): boolean {
    const { x, y } = point;
    const bx = this.boundary.x;
    const by = this.boundary.y;
    const bw = this.boundary.width;
    const bh = this.boundary.height;

    return x >= bx && x <= bx + bw && y >= by && y <= by + bh;
  }

  containsPoint(point: Point, range: Boundary): boolean {
    const { x, y } = point;
    const rx = range.x;
    const ry = range.y;
    const rw = range.width;
    const rh = range.height;

    return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
  }

  getSize(): number {
    let size = this.points.length;

    if (this.divided) {
      size += this.northeast!.getSize();
      size += this.northwest!.getSize();
      size += this.southeast!.getSize();
      size += this.southwest!.getSize();
    }

    return size;
  }

  clear(): void {
    this.points = [];
    this.divided = false;
    this.northeast = null;
    this.northwest = null;
    this.southeast = null;
    this.southwest = null;
  }

  getAllPoints(): Point[] {
    const all: Point[] = [];

    all.push(...this.points);

    if (this.divided) {
      all.push(...this.northeast!.getAllPoints());
      all.push(...this.northwest!.getAllPoints());
      all.push(...this.southeast!.getAllPoints());
      all.push(...this.southwest!.getAllPoints());
    }

    return all;
  }

  getTimeComplexity(): string {
    return "Average: O(log n), Worst: O(n)";
  }

  has(point: Point): boolean {
    return this.contains(point)
  }
}
