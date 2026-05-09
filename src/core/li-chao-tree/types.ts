export interface Line {
  m: number
  b: number
}

export interface LiChaoTreeOptions {
  xMin: number
  xMax: number
  type: 'min' | 'max'
}

export interface LiChaoTreeNode {
  line: Line | null
  left: LiChaoTreeNode | null
  right: LiChaoTreeNode | null
}
