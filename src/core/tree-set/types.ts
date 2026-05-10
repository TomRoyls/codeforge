export type TreeSetColor = 'red' | 'black'

export interface TreeSetNode<T> {
  value: T
  color: TreeSetColor
  left: TreeSetNode<T> | null
  right: TreeSetNode<T> | null
  parent: TreeSetNode<T> | null
}

export type TreeSetCompareFunction<T> = (a: T, b: T) => number

export interface TreeSetOptions<T> {
  compare?: TreeSetCompareFunction<T>
}

export interface TreeSetStats {
  nodeCount: number
  height: number
  isBalanced: boolean
  minValue: unknown
  maxValue: unknown
}
