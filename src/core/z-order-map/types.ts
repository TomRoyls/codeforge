export interface ZOrderMapOptions {
  bits?: number
}

export interface ZOrderEntry<T> {
  x: number
  y: number
  value: T
}

export interface Point2D {
  x: number
  y: number
}
