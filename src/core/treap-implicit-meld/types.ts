export interface TreapImplicitMeldNode<T> {
  value: T
  priority: number
  left: TreapImplicitMeldNode<T> | null
  right: TreapImplicitMeldNode<T> | null
  size: number
  reversed: boolean
}
