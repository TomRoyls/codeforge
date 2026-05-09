export interface ImplicitTreapNode<T> {
  value: T
  priority: number
  left: ImplicitTreapNode<T> | null
  right: ImplicitTreapNode<T> | null
  size: number
  reversed: boolean
}

export interface ImplicitTreapOptions<T> {
  initialValues?: T[]
}
