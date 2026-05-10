export type HopscotchSetOptions = {
  capacity?: number
  neighborhoodSize?: number
  loadFactorThreshold?: number
}

export type HopscotchSetStats = {
  size: number
  capacity: number
  loadFactor: number
  neighborhoodSize: number
}
