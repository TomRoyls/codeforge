export interface TourNode {
  vertex: number
  left: TourNode | null
  right: TourNode | null
  parent: TourNode | null
  subtreeSize: number
}

export interface EulerTourTreeOptions {
}

export const DEFAULT_EULER_TOUR_TREE_OPTIONS: EulerTourTreeOptions = {
}
