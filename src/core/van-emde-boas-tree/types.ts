export interface VEBNode {
  min: number | undefined
  max: number | undefined
  universeSize: number
  summary: VEBNode | null
  clusters: Map<number, VEBNode>
}
