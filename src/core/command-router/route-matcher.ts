import type { CommandRoute, RouteMatch, RouteParams } from './types.js'

function splitPath(path: string): string[] {
  if (path.startsWith('/')) {
    return path.slice(1).split('/').filter(Boolean)
  }
  return path.split('/').filter(Boolean)
}

export class RouteMatcher {
  match(routes: CommandRoute[], pathSegments: string[]): RouteMatch | undefined {
    for (const route of routes) {
      if (this.isMatch(route.path, pathSegments)) {
        const params = this.extractParams(route.path, pathSegments)
        const rp: RouteParams = {
          args: [],
          named: params,
          command: pathSegments.join(' '),
        }
        return {
          route,
          params: rp,
          pathSegments,
        }
      }
    }
    for (const route of routes) {
      if (route.children.length > 0) {
        const result = this.match(route.children, pathSegments)
        if (result) {
          return result
        }
      }
    }
    return undefined
  }

  extractParams(routePath: string, inputSegments: string[]): Record<string, string> {
    const params: Record<string, string> = {}
    const routeSegments = splitPath(routePath)
    for (let i = 0; i < routeSegments.length; i++) {
      const seg = routeSegments[i]
      if (seg !== undefined && seg.startsWith(':')) {
        const paramName = seg.slice(1)
        const value = inputSegments[i]
        if (value !== undefined) {
          params[paramName] = value
        }
      }
    }
    return params
  }

  isMatch(routePath: string, inputSegments: string[]): boolean {
    const routeSegments = splitPath(routePath)
    if (routeSegments.length !== inputSegments.length) {
      return false
    }
    for (let i = 0; i < routeSegments.length; i++) {
      const routeSeg = routeSegments[i]
      const inputSeg = inputSegments[i]
      if (routeSeg === undefined || inputSeg === undefined) {
        return false
      }
      if (routeSeg.startsWith(':')) {
        continue
      }
      if (routeSeg !== inputSeg) {
        return false
      }
    }
    return true
  }

  findAllMatches(routes: CommandRoute[], pathSegments: string[]): RouteMatch[] {
    const results: RouteMatch[] = []
    for (const route of routes) {
      if (this.isMatch(route.path, pathSegments)) {
        const params = this.extractParams(route.path, pathSegments)
        const rp: RouteParams = {
          args: [],
          named: params,
          command: pathSegments.join(' '),
        }
        results.push({
          route,
          params: rp,
          pathSegments,
        })
      }
      if (route.children.length > 0) {
        const childResults = this.findAllMatches(route.children, pathSegments)
        results.push(...childResults)
      }
    }
    return results
  }
}
