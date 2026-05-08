export interface RouteParams {
  args: string[]
  named: Record<string, string>
  command: string
}

export type RouteHandler = (params: RouteParams) => unknown

export type Middleware = (params: RouteParams, next: () => unknown) => unknown

export interface CommandRoute {
  path: string
  handler: RouteHandler
  description: string
  children: CommandRoute[]
  middlewares: Middleware[]
}

export interface RouteMatch {
  route: CommandRoute
  params: RouteParams
  pathSegments: string[]
}
