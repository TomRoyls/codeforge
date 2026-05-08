import type {
  CommandRoute,
  Middleware,
  RouteMatch,
  RouteParams,
} from './types.js'
import { RouteMatcher } from './route-matcher.js'

export class CommandRouter {
  private routes: CommandRoute[] = []
  private globalMiddleware: Middleware[] = []
  private matcher = new RouteMatcher()

  register(route: CommandRoute): void {
    this.routes.push(route)
  }

  unregister(path: string): void {
    this.routes = this.routes.filter((r) => r.path !== path)
    for (const route of this.routes) {
      this.removeFromChildren(route, path)
    }
  }

  private removeFromChildren(route: CommandRoute, path: string): void {
    route.children = route.children.filter((c) => c.path !== path)
    for (const child of route.children) {
      this.removeFromChildren(child, path)
    }
  }

  getRoutes(): CommandRoute[] {
    return [...this.routes]
  }

  use(middleware: Middleware): void {
    this.globalMiddleware.push(middleware)
  }

  resolve(pathSegments: string[]): RouteMatch | undefined {
    return this.matcher.match(this.routes, pathSegments)
  }

  execute(pathSegments: string[], args: string[] = []): unknown {
    const match = this.resolve(pathSegments)
    if (!match) {
      return undefined
    }
    const params: RouteParams = {
      args,
      named: match.params.named,
      command: match.params.command,
    }
    const routeMiddlewares = match.route.middlewares
    const allMiddlewares = [...this.globalMiddleware, ...routeMiddlewares]
    const handler = match.route.handler
    let index = 0
    const next = (): unknown => {
      if (index < allMiddlewares.length) {
        const mw = allMiddlewares[index]
        index++
        return mw!(params, next)
      }
      return handler(params)
    }
    return next()
  }

  findRoute(path: string): CommandRoute | undefined {
    return this.findRouteInList(this.routes, path)
  }

  private findRouteInList(routes: CommandRoute[], path: string): CommandRoute | undefined {
    for (const route of routes) {
      if (route.path === path) {
        return route
      }
      const found = this.findRouteInList(route.children, path)
      if (found) {
        return found
      }
    }
    return undefined
  }

  listCommands(): string[] {
    const commands: string[] = []
    this.collectCommands(this.routes, commands)
    return commands
  }

  private collectCommands(routes: CommandRoute[], commands: string[]): void {
    for (const route of routes) {
      commands.push(route.path)
      this.collectCommands(route.children, commands)
    }
  }

  getHelp(path?: string): string {
    if (path !== undefined) {
      const route = this.findRoute(path)
      if (route) {
        return `${route.path} - ${route.description}`
      }
      return ''
    }
    const lines: string[] = []
    this.collectHelp(this.routes, lines)
    return lines.join('\n')
  }

  private collectHelp(routes: CommandRoute[], lines: string[]): void {
    for (const route of routes) {
      lines.push(`${route.path} - ${route.description}`)
      this.collectHelp(route.children, lines)
    }
  }
}
