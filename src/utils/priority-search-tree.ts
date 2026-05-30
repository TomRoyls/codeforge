export class PrioritySearchTree {
  private root: PSTNode | null = null

  insert(x: number, y: number, data: string): void {
    this.root = this.insertNode(this.root, x, y, data)
  }

  query(xMin: number, xMax: number, yMax: number): Array<{ x: number; y: number; data: string }> {
    const result: Array<{ x: number; y: number; data: string }> = []
    this.queryNode(this.root, xMin, xMax, yMax, result)
    return result
  }

  private insertNode(node: PSTNode | null, x: number, y: number, data: string): PSTNode {
    if (!node) {
      return { x, y, data, maxY: y, left: null, right: null }
    }
    if (y > node.maxY) node.maxY = y
    if (x < node.x) {
      node.left = this.insertNode(node.left, x, y, data)
    } else {
      node.right = this.insertNode(node.right, x, y, data)
    }
    return node
  }

  private queryNode(
    node: PSTNode | null,
    xMin: number,
    xMax: number,
    yMax: number,
    result: Array<{ x: number; y: number; data: string }>,
  ): void {
    if (!node) return
    if (node.y <= yMax && node.x >= xMin && node.x <= xMax) {
      result.push({ x: node.x, y: node.y, data: node.data })
    }
    this.queryNode(node.left, xMin, xMax, yMax, result)
    this.queryNode(node.right, xMin, xMax, yMax, result)
  }
}

interface PSTNode {
  x: number
  y: number
  data: string
  maxY: number
  left: PSTNode | null
  right: PSTNode | null
}
