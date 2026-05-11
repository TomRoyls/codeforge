export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface QuadTreeOptions {
  capacity?: number
  maxDepth?: number
}

export interface QuadTreeNode {
  x: number
  y: number
  width: number
  height: number
  depth: number
  points: Point[]
  divided: boolean
  northwest: QuadTreeNode | null
  northeast: QuadTreeNode | null
  southwest: QuadTreeNode | null
  southeast: QuadTreeNode | null
}
