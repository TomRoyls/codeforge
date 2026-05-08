import { describe, it, expect } from 'vitest'
import { RouteMatcher } from '../../src/core/command-router/route-matcher.js'
import { CommandRouter } from '../../src/core/command-router/command-router.js'
import type {
  CommandRoute,
  Middleware,
  RouteParams,
} from '../../src/core/command-router/types.js'

function makeRoute(overrides: Partial<CommandRoute> = {}): CommandRoute {
  return {
    path: 'test',
    handler: () => 'test-result',
    description: 'A test route',
    children: [],
    middlewares: [],
    ...overrides,
  }
}

const matcher = new RouteMatcher()

describe('RouteMatcher', () => {
  describe('isMatch', () => {
    it('should match exact segments', () => {
      expect(matcher.isMatch('analyze', ['analyze'])).toBe(true)
    })

    it('should not match different segments', () => {
      expect(matcher.isMatch('analyze', ['build'])).toBe(false)
    })

    it('should not match different lengths', () => {
      expect(matcher.isMatch('analyze', ['analyze', 'src'])).toBe(false)
    })

    it('should match parameter segments', () => {
      expect(matcher.isMatch(':name', ['readme.md'])).toBe(true)
    })

    it('should match mixed exact and param segments', () => {
      expect(matcher.isMatch('files/:name', ['files', 'readme.md'])).toBe(true)
    })

    it('should not match if exact segment differs', () => {
      expect(matcher.isMatch('files/:name', ['docs', 'readme.md'])).toBe(false)
    })

    it('should match multi-segment paths', () => {
      expect(matcher.isMatch('a/b/c', ['a', 'b', 'c'])).toBe(true)
    })

    it('should not match empty input against non-empty route', () => {
      expect(matcher.isMatch('analyze', [])).toBe(false)
    })

    it('should match empty route against empty input', () => {
      expect(matcher.isMatch('', [])).toBe(true)
    })

    it('should handle leading slash in route path', () => {
      expect(matcher.isMatch('/analyze', ['analyze'])).toBe(true)
    })
  })

  describe('extractParams', () => {
    it('should extract single param', () => {
      const result = matcher.extractParams(':name', ['readme.md'])
      expect(result).toEqual({ name: 'readme.md' })
    })

    it('should extract multiple params', () => {
      const result = matcher.extractParams(':category/:id', ['files', '123'])
      expect(result).toEqual({ category: 'files', id: '123' })
    })

    it('should return empty for no params', () => {
      const result = matcher.extractParams('analyze', ['analyze'])
      expect(result).toEqual({})
    })

    it('should extract mixed params', () => {
      const result = matcher.extractParams('files/:name/lines/:line', ['files', 'readme.md', 'lines', '42'])
      expect(result).toEqual({ name: 'readme.md', line: '42' })
    })

    it('should handle leading slash path', () => {
      const result = matcher.extractParams('/files/:name', ['files', 'readme.md'])
      expect(result).toEqual({ name: 'readme.md' })
    })

    it('should return empty for empty route', () => {
      const result = matcher.extractParams('', [])
      expect(result).toEqual({})
    })
  })

  describe('match', () => {
    it('should match exact route', () => {
      const routes = [makeRoute({ path: 'analyze' })]
      const result = matcher.match(routes, ['analyze'])
      expect(result).toBeDefined()
      expect(result?.route.path).toBe('analyze')
    })

    it('should match route with param', () => {
      const routes = [makeRoute({ path: 'files/:name' })]
      const result = matcher.match(routes, ['files', 'readme.md'])
      expect(result).toBeDefined()
      expect(result?.params.named.name).toBe('readme.md')
    })

    it('should return undefined for no match', () => {
      const routes = [makeRoute({ path: 'analyze' })]
      const result = matcher.match(routes, ['build'])
      expect(result).toBeUndefined()
    })

    it('should match first matching route', () => {
      const routes = [
        makeRoute({ path: 'analyze' }),
        makeRoute({ path: 'build' }),
      ]
      const result = matcher.match(routes, ['build'])
      expect(result).toBeDefined()
      expect(result?.route.path).toBe('build')
    })

    it('should match nested child route', () => {
      const routes = [
        makeRoute({
          path: 'parent',
          children: [makeRoute({ path: 'child' })],
        }),
      ]
      const result = matcher.match(routes, ['child'])
      expect(result).toBeDefined()
      expect(result?.route.path).toBe('child')
    })

    it('should return undefined for empty routes', () => {
      const result = matcher.match([], ['analyze'])
      expect(result).toBeUndefined()
    })

    it('should include pathSegments in result', () => {
      const routes = [makeRoute({ path: 'analyze' })]
      const result = matcher.match(routes, ['analyze'])
      expect(result?.pathSegments).toEqual(['analyze'])
    })

    it('should set command from pathSegments', () => {
      const routes = [makeRoute({ path: 'files/:name' })]
      const result = matcher.match(routes, ['files', 'readme.md'])
      expect(result?.params.command).toBe('files readme.md')
    })

    it('should prefer exact match over children', () => {
      const routes = [
        makeRoute({
          path: 'analyze',
          children: [makeRoute({ path: 'analyze' })],
        }),
      ]
      const result = matcher.match(routes, ['analyze'])
      expect(result).toBeDefined()
      expect(result?.route).toBe(routes[0])
    })
  })

  describe('findAllMatches', () => {
    it('should find all matching routes', () => {
      const routes = [
        makeRoute({ path: 'cmd' }),
        makeRoute({ path: 'cmd' }),
      ]
      const results = matcher.findAllMatches(routes, ['cmd'])
      expect(results).toHaveLength(2)
    })

    it('should find matches in children', () => {
      const routes = [
        makeRoute({
          path: 'parent',
          children: [makeRoute({ path: 'cmd' })],
        }),
        makeRoute({ path: 'cmd' }),
      ]
      const results = matcher.findAllMatches(routes, ['cmd'])
      expect(results).toHaveLength(2)
    })

    it('should return empty for no matches', () => {
      const routes = [makeRoute({ path: 'analyze' })]
      const results = matcher.findAllMatches(routes, ['build'])
      expect(results).toHaveLength(0)
    })

    it('should find nested matches at multiple levels', () => {
      const routes = [
        makeRoute({
          path: 'a',
          children: [
            makeRoute({
              path: 'b',
              children: [makeRoute({ path: 'target' })],
            }),
          ],
        }),
        makeRoute({ path: 'target' }),
      ]
      const results = matcher.findAllMatches(routes, ['target'])
      expect(results).toHaveLength(2)
    })
  })
})

describe('CommandRouter', () => {
  describe('register', () => {
    it('should register a route', () => {
      const router = new CommandRouter()
      const route = makeRoute({ path: 'analyze' })
      router.register(route)
      expect(router.getRoutes()).toHaveLength(1)
    })

    it('should register multiple routes', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      router.register(makeRoute({ path: 'build' }))
      expect(router.getRoutes()).toHaveLength(2)
    })

    it('should register route with children', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        children: [makeRoute({ path: 'child' })],
      }))
      expect(router.getRoutes()).toHaveLength(1)
      expect(router.getRoutes()[0]!.children).toHaveLength(1)
    })
  })

  describe('unregister', () => {
    it('should remove a route by path', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      router.register(makeRoute({ path: 'build' }))
      router.unregister('analyze')
      expect(router.getRoutes()).toHaveLength(1)
      expect(router.getRoutes()[0]!.path).toBe('build')
    })

    it('should do nothing for non-existent path', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      router.unregister('unknown')
      expect(router.getRoutes()).toHaveLength(1)
    })

    it('should remove child route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        children: [
          makeRoute({ path: 'child1' }),
          makeRoute({ path: 'child2' }),
        ],
      }))
      router.unregister('child1')
      const parent = router.getRoutes()[0]!
      expect(parent.children).toHaveLength(1)
      expect(parent.children[0]!.path).toBe('child2')
    })

    it('should handle unregister from empty router', () => {
      const router = new CommandRouter()
      expect(() => router.unregister('anything')).not.toThrow()
    })
  })

  describe('getRoutes', () => {
    it('should return empty array for new router', () => {
      const router = new CommandRouter()
      expect(router.getRoutes()).toEqual([])
    })

    it('should return copy of routes', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'test' }))
      const routes = router.getRoutes()
      routes.push(makeRoute({ path: 'extra' }))
      expect(router.getRoutes()).toHaveLength(1)
    })
  })

  describe('use', () => {
    it('should add global middleware', () => {
      const router = new CommandRouter()
      const mw: Middleware = (_p, next) => next()
      router.use(mw)
      router.register(makeRoute({ path: 'test' }))
      const result = router.execute(['test'])
      expect(result).toBe('test-result')
    })

    it('should run global middleware before handler', () => {
      const router = new CommandRouter()
      const order: string[] = []
      router.use((_p, next) => {
        order.push('mw1')
        return next()
      })
      router.register(makeRoute({
        path: 'test',
        handler: () => {
          order.push('handler')
          return 'done'
        },
      }))
      router.execute(['test'])
      expect(order).toEqual(['mw1', 'handler'])
    })
  })

  describe('resolve', () => {
    it('should resolve matching route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      const result = router.resolve(['analyze'])
      expect(result).toBeDefined()
      expect(result?.route.path).toBe('analyze')
    })

    it('should resolve route with params', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'files/:name' }))
      const result = router.resolve(['files', 'readme.md'])
      expect(result).toBeDefined()
      expect(result?.params.named.name).toBe('readme.md')
    })

    it('should return undefined for no match', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      const result = router.resolve(['unknown'])
      expect(result).toBeUndefined()
    })

    it('should resolve child routes', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        children: [makeRoute({ path: 'child' })],
      }))
      const result = router.resolve(['child'])
      expect(result).toBeDefined()
      expect(result?.route.path).toBe('child')
    })

    it('should return undefined for empty segments', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      const result = router.resolve([])
      expect(result).toBeUndefined()
    })
  })

  describe('execute', () => {
    it('should execute handler for matching route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'greet',
        handler: (p) => `hello ${p.args.join(' ')}`,
      }))
      const result = router.execute(['greet'], ['world'])
      expect(result).toBe('hello world')
    })

    it('should return undefined for unknown command', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'test' }))
      const result = router.execute(['unknown'])
      expect(result).toBeUndefined()
    })

    it('should pass named params to handler', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'files/:name',
        handler: (p) => `file: ${p.named.name}`,
      }))
      const result = router.execute(['files', 'readme.md'])
      expect(result).toBe('file: readme.md')
    })

    it('should execute global middleware chain', () => {
      const router = new CommandRouter()
      const order: string[] = []
      router.use((_p, next) => {
        order.push('mw1')
        return next()
      })
      router.use((_p, next) => {
        order.push('mw2')
        return next()
      })
      router.register(makeRoute({
        path: 'test',
        handler: () => {
          order.push('handler')
          return 'done'
        },
      }))
      router.execute(['test'])
      expect(order).toEqual(['mw1', 'mw2', 'handler'])
    })

    it('should execute route middleware after global', () => {
      const router = new CommandRouter()
      const order: string[] = []
      router.use((_p, next) => {
        order.push('global')
        return next()
      })
      router.register(makeRoute({
        path: 'test',
        middlewares: [(_p: RouteParams, next: () => unknown) => {
          order.push('route-mw')
          return next()
        }],
        handler: () => {
          order.push('handler')
          return 'done'
        },
      }))
      router.execute(['test'])
      expect(order).toEqual(['global', 'route-mw', 'handler'])
    })

    it('should allow middleware to modify result', () => {
      const router = new CommandRouter()
      router.use((_p, next) => {
        const result = next()
        return `wrapped: ${String(result)}`
      })
      router.register(makeRoute({
        path: 'test',
        handler: () => 'result',
      }))
      const result = router.execute(['test'])
      expect(result).toBe('wrapped: result')
    })

    it('should allow middleware to short-circuit', () => {
      const router = new CommandRouter()
      router.use((_p, _next) => 'blocked')
      router.register(makeRoute({
        path: 'test',
        handler: () => 'should not reach',
      }))
      const result = router.execute(['test'])
      expect(result).toBe('blocked')
    })

    it('should default args to empty array', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'test',
        handler: (p) => p.args,
      }))
      const result = router.execute(['test'])
      expect(result).toEqual([])
    })

    it('should pass command string to handler', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'files/:name',
        handler: (p) => p.command,
      }))
      const result = router.execute(['files', 'doc.txt'])
      expect(result).toBe('files doc.txt')
    })
  })

  describe('findRoute', () => {
    it('should find exact route by path', () => {
      const router = new CommandRouter()
      const route = makeRoute({ path: 'analyze' })
      router.register(route)
      expect(router.findRoute('analyze')).toBe(route)
    })

    it('should return undefined for unknown path', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      expect(router.findRoute('unknown')).toBeUndefined()
    })

    it('should find child route', () => {
      const router = new CommandRouter()
      const child = makeRoute({ path: 'child' })
      router.register(makeRoute({
        path: 'parent',
        children: [child],
      }))
      expect(router.findRoute('child')).toBe(child)
    })

    it('should find deeply nested route', () => {
      const router = new CommandRouter()
      const deep = makeRoute({ path: 'deep' })
      router.register(makeRoute({
        path: 'a',
        children: [
          makeRoute({
            path: 'b',
            children: [deep],
          }),
        ],
      }))
      expect(router.findRoute('deep')).toBe(deep)
    })
  })

  describe('listCommands', () => {
    it('should list all command paths', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      router.register(makeRoute({ path: 'build' }))
      expect(router.listCommands()).toEqual(['analyze', 'build'])
    })

    it('should include child paths', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        children: [makeRoute({ path: 'child' })],
      }))
      expect(router.listCommands()).toEqual(['parent', 'child'])
    })

    it('should return empty for no routes', () => {
      const router = new CommandRouter()
      expect(router.listCommands()).toEqual([])
    })

    it('should include deeply nested paths', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'a',
        children: [
          makeRoute({
            path: 'b',
            children: [makeRoute({ path: 'c' })],
          }),
        ],
      }))
      expect(router.listCommands()).toEqual(['a', 'b', 'c'])
    })
  })

  describe('getHelp', () => {
    it('should return help for specific route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'analyze',
        description: 'Analyze code',
      }))
      expect(router.getHelp('analyze')).toBe('analyze - Analyze code')
    })

    it('should return empty string for unknown route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'test' }))
      expect(router.getHelp('unknown')).toBe('')
    })

    it('should return all help when no path given', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze', description: 'Analyze code' }))
      router.register(makeRoute({ path: 'build', description: 'Build project' }))
      const help = router.getHelp()
      expect(help).toContain('analyze - Analyze code')
      expect(help).toContain('build - Build project')
    })

    it('should include children in help', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        description: 'Parent command',
        children: [makeRoute({ path: 'child', description: 'Child command' })],
      }))
      const help = router.getHelp()
      expect(help).toContain('parent - Parent command')
      expect(help).toContain('child - Child command')
    })

    it('should return empty string for no routes and no path', () => {
      const router = new CommandRouter()
      expect(router.getHelp()).toBe('')
    })

    it('should find help for child route', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'parent',
        description: 'Parent',
        children: [makeRoute({ path: 'child', description: 'Child' })],
      }))
      expect(router.getHelp('child')).toBe('child - Child')
    })
  })

  describe('edge cases', () => {
    it('should handle route with no handler result', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'noop',
        handler: () => undefined,
      }))
      expect(router.execute(['noop'])).toBeUndefined()
    })

    it('should handle multiple params in path', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: ':org/:repo/:branch',
        handler: (p) => `${p.named.org}/${p.named.repo}/${p.named.branch}`,
      }))
      const result = router.execute(['myorg', 'myrepo', 'main'])
      expect(result).toBe('myorg/myrepo/main')
    })

    it('should handle deeply nested commands', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'level1',
        children: [
          makeRoute({
            path: 'level2',
            children: [
              makeRoute({
                path: 'level3',
                children: [makeRoute({ path: 'level4' })],
              }),
            ],
          }),
        ],
      }))
      expect(router.findRoute('level4')).toBeDefined()
      expect(router.listCommands()).toEqual(['level1', 'level2', 'level3', 'level4'])
    })

    it('should handle empty router resolve', () => {
      const router = new CommandRouter()
      expect(router.resolve(['anything'])).toBeUndefined()
    })

    it('should handle empty router execute', () => {
      const router = new CommandRouter()
      expect(router.execute(['anything'])).toBeUndefined()
    })

    it('should preserve route middlewares on execution', () => {
      const router = new CommandRouter()
      const order: string[] = []
      router.register(makeRoute({
        path: 'test',
        middlewares: [
          (_p: RouteParams, next: () => unknown) => {
            order.push('mw1')
            return next()
          },
          (_p: RouteParams, next: () => unknown) => {
            order.push('mw2')
            return next()
          },
        ],
        handler: () => {
          order.push('handler')
          return 'ok'
        },
      }))
      router.execute(['test'])
      expect(order).toEqual(['mw1', 'mw2', 'handler'])
    })

    it('should handle global + route middleware combined', () => {
      const router = new CommandRouter()
      const order: string[] = []
      router.use((_p, next) => {
        order.push('global1')
        return next()
      })
      router.use((_p, next) => {
        order.push('global2')
        return next()
      })
      router.register(makeRoute({
        path: 'test',
        middlewares: [
          (_p: RouteParams, next: () => unknown) => {
            order.push('route1')
            return next()
          },
        ],
        handler: () => {
          order.push('handler')
          return 'ok'
        },
      }))
      router.execute(['test'])
      expect(order).toEqual(['global1', 'global2', 'route1', 'handler'])
    })

    it('should match first route when multiple routes could match', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'cmd', handler: () => 'first' }))
      router.register(makeRoute({ path: 'cmd', handler: () => 'second' }))
      const result = router.execute(['cmd'])
      expect(result).toBe('first')
    })

    it('should pass args to handler via execute', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'echo',
        handler: (p) => p.args,
      }))
      const result = router.execute(['echo'], ['hello', 'world'])
      expect(result).toEqual(['hello', 'world'])
    })

    it('should handle unregister and re-register', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'cmd', handler: () => 'v1' }))
      expect(router.execute(['cmd'])).toBe('v1')
      router.unregister('cmd')
      expect(router.execute(['cmd'])).toBeUndefined()
      router.register(makeRoute({ path: 'cmd', handler: () => 'v2' }))
      expect(router.execute(['cmd'])).toBe('v2')
    })

    it('should handle route middleware accessing params', () => {
      const router = new CommandRouter()
      router.register(makeRoute({
        path: 'files/:name',
        middlewares: [
          (p: RouteParams, next: () => unknown) => {
            p.named.name = `processed-${p.named.name}`
            return next()
          },
        ],
        handler: (p) => p.named.name,
      }))
      const result = router.execute(['files', 'doc.txt'])
      expect(result).toBe('processed-doc.txt')
    })

    it('should handle multiple routes with different patterns', () => {
      const router = new CommandRouter()
      router.register(makeRoute({ path: 'analyze' }))
      router.register(makeRoute({ path: 'analyze/:file' }))
      router.register(makeRoute({ path: 'build' }))
      expect(router.resolve(['analyze'])?.route.path).toBe('analyze')
      expect(router.resolve(['analyze', 'src.ts'])?.route.path).toBe('analyze/:file')
      expect(router.resolve(['build'])?.route.path).toBe('build')
    })

    it('should handle isMatch with all param segments', () => {
      expect(matcher.isMatch(':a/:b', ['x', 'y'])).toBe(true)
    })

    it('should handle extractParams with all params', () => {
      const result = matcher.extractParams(':a/:b/:c', ['1', '2', '3'])
      expect(result).toEqual({ a: '1', b: '2', c: '3' })
    })
  })
})
