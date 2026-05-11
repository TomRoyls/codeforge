export type TraversalOrder = 'pre' | 'post' | 'level'

export interface GraphTreeNode<T> {
  readonly value: T
  readonly children: ReadonlyArray<GraphTreeNode<T>>
  readonly parent: GraphTreeNode<T> | null
  readonly isLeaf: boolean
  readonly isRoot: boolean
  readonly depth: number
  readonly height: number
  readonly size: number
}
