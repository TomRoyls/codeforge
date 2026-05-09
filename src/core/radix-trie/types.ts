export interface RadixNode<T = unknown> {
  children: Map<string, RadixNode<T>>
  value: T | undefined
  isEnd: boolean
  label: string
}
