export class SpatialIndex2 {
  private points: Map<string, {x: number, y: number, gridX: number, gridY: number}>
  private grid: Map<string, Map<string, {x: number, y: number}>>
  private cellSize: number
  private _size: number

  constructor() {
    this.points = new Map()
    this.grid = new Map()
    this.cellSize = 100
    this._size = 0
  }

  insert(id: string, x: number, y: number): void {
    if (this.points.has(id)) {
      this.remove(id)
    }

    const gridX = Math.floor(x / this.cellSize)
    const gridY = Math.floor(y / this.cellSize)
    const cellKey = `${gridX},${gridY}`

    const point = {x, y, gridX, gridY}
    this.points.set(id, point)

    let cell = this.grid.get(cellKey)
    if (!cell) {
      cell = new Map()
      this.grid.set(cellKey, cell)
    }
    cell.set(id, {x, y})

    this._size++
  }

  remove(id: string): boolean {
    const point = this.points.get(id)
    if (!point) {
      return false
    }

    const cellKey = `${point.gridX},${point.gridY}`
    const cell = this.grid.get(cellKey)
    if (cell) {
      cell.delete(id)
      if (cell.size === 0) {
        this.grid.delete(cellKey)
      }
    }

    this.points.delete(id)
    this._size--
    return true
  }

  get(id: string): {x: number, y: number} | undefined {
    const point = this.points.get(id)
    if (!point) {
      return undefined
    }
    return {x: point.x, y: point.y}
  }

  has(id: string): boolean {
    return this.points.has(id)
  }

  queryRange(minX: number, minY: number, maxX: number, maxY: number): string[] {
    const result: string[] = []
    const minGridX = Math.floor(minX / this.cellSize)
    const maxGridX = Math.floor(maxX / this.cellSize)
    const minGridY = Math.floor(minY / this.cellSize)
    const maxGridY = Math.floor(maxY / this.cellSize)

    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gy = minGridY; gy <= maxGridY; gy++) {
        const cellKey = `${gx},${gy}`
        const cell = this.grid.get(cellKey)
        if (!cell) {
          continue
        }

        for (const [id, point] of cell) {
          if (point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY) {
            result.push(id)
          }
        }
      }
    }

    return result
  }

  queryNearest(x: number, y: number, k: number): string[] {
    if (k <= 0) {
      return []
    }

    const allPoints: {id: string, distSq: number}[] = []

    for (const [id, point] of this.points) {
      const dx = point.x - x
      const dy = point.y - y
      const distSq = dx * dx + dy * dy
      allPoints.push({id, distSq})
    }

    allPoints.sort((a, b) => a.distSq - b.distSq)

    return allPoints.slice(0, k).map(p => p.id)
  }

  queryRadius(x: number, y: number, radius: number): string[] {
    const result: string[] = []
    const radiusSq = radius * radius
    const minGridX = Math.floor((x - radius) / this.cellSize)
    const maxGridX = Math.floor((x + radius) / this.cellSize)
    const minGridY = Math.floor((y - radius) / this.cellSize)
    const maxGridY = Math.floor((y + radius) / this.cellSize)

    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gy = minGridY; gy <= maxGridY; gy++) {
        const cellKey = `${gx},${gy}`
        const cell = this.grid.get(cellKey)
        if (!cell) {
          continue
        }

        for (const [id, point] of cell) {
          const dx = point.x - x
          const dy = point.y - y
          const distSq = dx * dx + dy * dy
          if (distSq <= radiusSq) {
            result.push(id)
          }
        }
      }
    }

    return result
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.points.clear()
    this.grid.clear()
    this._size = 0
  }

  toArray(): {id: string, x: number, y: number}[] {
    const result: {id: string, x: number, y: number}[] = []
    for (const [id, point] of this.points) {
      result.push({id, x: point.x, y: point.y})
    }
    return result
  }

  [Symbol.iterator](): Iterator<ReturnType<this['toArray']>[number]> {
    const arr = this.toArray();
    let i = 0;
    return {
      next: () => i < arr.length
        ? { value: arr[i++] as ReturnType<this['toArray']>[number], done: false }
        : { value: undefined as unknown as ReturnType<this['toArray']>[number], done: true }
    };
  }



  toString(): string {
    return `SpatialIndex2({ size: ${this.size} })`
  }



  toJSON() {
    return { type: 'SpatialIndex2', size: this.size, items: this.toArray() }
  }

  get [Symbol.toStringTag](): string {
    return 'SpatialIndex2'
  }
}
