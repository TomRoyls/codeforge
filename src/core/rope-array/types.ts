export interface RopeArrayOptions {
  leafSize?: number
}

export interface LeafNode {
  kind: 'leaf'
  text: string
}

export interface InternalNode {
  kind: 'internal'
  leftLength: number
  left: RopeNode
  right: RopeNode
}

export type RopeNode = LeafNode | InternalNode
