export interface ScapegoatNode<T> {
  key: number
  value: T
  left: ScapegoatNode<T> | null
  right: ScapegoatNode<T> | null
}

export interface ScapegoatTreeOptions {
  alpha: number
}

export const DEFAULT_SCAPEGOAT_OPTIONS: ScapegoatTreeOptions = {
  alpha: 0.75,
}
