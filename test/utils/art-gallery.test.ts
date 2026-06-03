import { describe, expect, it } from 'vitest'
import { ArtGallery } from '../../src/utils/art-gallery.js'

describe('ArtGallery', () => {
  it('computes area of triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(0, 3)
    expect(ag.polygonArea()).toBe(6)
  })

  it('computes area of square', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.polygonArea()).toBe(4)
  })

  it('detects convex polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(true)
  })

  it('detects non-convex polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(1, 1)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.isConvex()).toBe(false)
  })

  it('point inside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('point outside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    expect(ag.pointInPolygon(5, 5)).toBe(false)
  })

  it('triangulates triangle', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 0)
    ag.addPoint(0, 1)
    const tri = ag.triangulation()
    expect(tri.length).toBe(1)
  })

  it('triangulates quad', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(2, 0)
    ag.addPoint(2, 2)
    ag.addPoint(0, 2)
    const tri = ag.triangulation()
    expect(tri.length).toBe(2)
  })

  it('handles single point', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    expect(ag.polygonArea()).toBe(0)
    expect(ag.isConvex()).toBe(false)
  })

  it('handles two points', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(1, 1)
    expect(ag.polygonArea()).toBe(0)
  })

  it('handles square', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.polygonArea()).toBeCloseTo(16, 5)
  })

  it('point inside convex polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('point outside polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(10, 10)).toBe(false)
  })

  it('handles triangle area', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(0, 4)
    expect(ag.polygonArea()).toBeCloseTo(8, 5)
  })

  it('convex quadrilateral', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.isConvex()).toBe(true)
  })

  it('handles concave polygon', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(2, 1)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.polygonArea()).toBeGreaterThan(0)
  })

  it('point on edge considered inside', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 0)).toBe(true)
  })

  it('point outside polygon is false', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(5, 5)).toBe(false)
  })

  it('point inside square is detected', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('point outside polygon is false', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(10, 10)).toBe(false)
  })

  it('point inside square polygon returns true', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(2, 2)).toBe(true)
  })

  it('point outside polygon is false', () => {
    const ag = new ArtGallery()
    ag.addPoint(0, 0)
    ag.addPoint(4, 0)
    ag.addPoint(4, 4)
    ag.addPoint(0, 4)
    expect(ag.pointInPolygon(10, 10)).toBe(false)
  })
})
