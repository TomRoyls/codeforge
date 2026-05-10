export interface ListNode<T> {
  value: T
  prev: ListNode<T> | null
  next: ListNode<T> | null
}

export interface FrequencyEntry {
  item: unknown
  count: number
}
