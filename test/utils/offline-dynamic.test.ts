import { describe, expect, it } from 'vitest'
import { OfflineDynamicConnectivity } from '../../src/utils/offline-dynamic.js'

describe('OfflineDynamicConnectivity', () => {
  it('finds connected nodes', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 10)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('finds disconnected nodes', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([false])
  })

  it('handles single node', () => {
    const odc = new OfflineDynamicConnectivity(1)
    odc.addQuery(0, 0, 0)
    expect(odc.solve()).toEqual([true])
  })

  it('handles chain of edges', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 3, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles multiple queries', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 2, 5)
    odc.addQuery(2, 3, 5)
    expect(odc.solve()).toEqual([true, false, true])
  })

  it('handles empty queries', () => {
    const odc = new OfflineDynamicConnectivity(3)
    expect(odc.solve()).toEqual([])
  })

  it('handles self-connection query', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addQuery(1, 1, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles many edges forming path', () => {
    const odc = new OfflineDynamicConnectivity(5)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(3, 4, 0, 10)
    odc.addQuery(0, 2, 5)
    odc.addQuery(3, 4, 5)
    odc.addQuery(0, 4, 5)
    expect(odc.solve()).toEqual([true, true, false])
  })

  it('handles edges before and after query', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 3)
    odc.addQuery(0, 1, 1)
    odc.addQuery(0, 1, 5)
    expect(odc.solve()).toEqual([true, true])
  })

  it('handles triangle graph', () => {
    const odc = new OfflineDynamicConnectivity(3)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(1, 2, 0, 10)
    odc.addEdge(0, 2, 0, 10)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([true])
  })

  it('handles disconnected components', () => {
    const odc = new OfflineDynamicConnectivity(4)
    odc.addEdge(0, 1, 0, 10)
    odc.addEdge(2, 3, 0, 10)
    odc.addQuery(0, 1, 5)
    odc.addQuery(0, 2, 5)
    expect(odc.solve()).toEqual([true, false])
  })

  it('handles edge appearing after query', () => {
    const odc = new OfflineDynamicConnectivity(2)
    odc.addEdge(0, 1, 5, 10)
    odc.addQuery(0, 1, 3)
    expect(odc.solve()).toEqual([false])
  })

  it('handles single node queries', () => {
    const odc = new OfflineDynamicConnectivity(1)
    odc.addQuery(0, 0, 5)
    expect(odc.solve()).toEqual([true])
  })
})
