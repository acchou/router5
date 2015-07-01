# router5

An simple but powerful HTML5 router, based on [route-node](https://github.com/troch/route-node)
and [path-parser](https://github.com/troch/path-parser).

## What is it?

It is an __HTML5 router__, using history and organising __named routes__ in a __tree__. Browser support
is limited to modern browsers implementing session history: [http://caniuse.com/#search=history](http://caniuse.com/#search=history). Router 5 supports use of hash in URL, but session history is still required.

It is aimed at applications rendering a tree of components, but can easily be used elsewhere.
This router is library and framework agnostic, and favours covention over configuration. It makes no
asumption on your implementation.

## Features

- __Use of hash (#)__
- __Default start route__: a default route to navigate to on load if the current URL doesn't match any route. Similar to `$routeProvider.otherwise()` in _Angular ngRoute_ module.
- __Nested named routes__: routes are identified by names and parameters so you don't have to manipulate URLs
directly. Routes can be nested, introducing the notion of _route segments_.
- __Route change listeners__
- __Route node change listeners__: you can add listeners to be triggered on a specific named route node. They will be triggered if that named route node is the node a component tree needs to be re-rendered from.
- __Segments deactivation__: you can register components with the router with a `canDeactivate` method. On a route change, it will ask those components if they allow navigation. Similar to _Angular 2_ and _Aurelia_
routers.

## API

### Constructor

__new Router5(routes, opts)__

You can supply a list of routes or a `RootNode` object:
- If you supply a list of routes (either `RouteNode` objects or POJOs), a root node will be added (unamed route
and empty URL).
- If you supply a single `RootNode` object, it will be used as a root node.

```javascript
let router = new Router5([
    {name: 'users', path: '/users', [
        {name: 'view', path: '/view/:id'},
        {name: 'list', path: '/list'}
    ]},
    {name: 'orders', path: '/orders'}
])
```

With `RouteNode`:

```javascript
let userRoutes = new RouteNode('users', '/users', [
    new RouteNode('view', '/view/:id'),
    new RouteNode('list', '/list')
])

let ordersRoute = new RouteNode('orders', '/orders', [
    new RouteNode('view', '/view/:id'),
    new RouteNode('pending', '/pending'),
    new RouteNode('completed', '/completed')
])

let router = new Router5([
    userRoutes,
    ordersRoute,
    new RouteNode('home', '/home')
], {
    defaultRoute: 'home',
    useHash: true
})
```

__Options__:

- __useHash__: `true|false`, default to `false`
- __defaultRoute__: the route name to navigate to when instanciating the router. It will only navigate to the default route if the current URL doesn't match an existing route.
- __defaultParams__: the parameters to use with the default route name.


### Router instance API

__router.rootNode__

The top node `RouteNode` instance. For a detailled API, see [RouteNode's README](https://github.com/troch/route-node/blob/master/README.md)

_router.buildPath(name, params)__

Build path for a route name and params.

```javascript
router.buildPath('users.view', {id: 1}) // => "/users/view/1"
```

__router.getState()__

Return the current state.

```javascript
router.getState() // => {name: "home", "params": {}, "path": "/home"}
```

__router.registerComponent(name, component)__

Register a component for the named route segment `name`. `name` has to describe the full
route segment depth (i.e. _'users.view'_). If the route segment for the registered component
is about to be removed by a route change, its `canDeactivate()` method will be called if present.

Only one component per segment can be registered.

```javascript
router.registerComponent('users', usersComponent)
router.registerComponent('users.view', userViewComponent)
```

__router.deregisterComponent(name)__

It will remove the registered component for a specific route segment.

```javascript
router.deRegisterComponent('users.view');
```

__router.addListener(fn)__

The provided callback will be executed on a route change with new and old
state objects. State objects contain route name, route params and route path
properties.

```javascript
router.addListener(function (newState, oldState) {
    console.log(newState) // => {name: "users.view", "params": {id: 1}, "path": "/users/view/1"}
});
```

__router.removeListener(fn)__

Removes a listener.


__router.addNodeListener(name, fn)__

Similar to `addListener(fn)`, except that it will be triggered only if the route segment
`name` is the lowest surviving route segment on a route change.

- When navigating from `users.view` to `users.list`, listeners on `users` and global listeners
  will be called.
- When navigation from `orders.list` to `users.view`, only global listeners will be called.

`router.addNodeListener('', fn)` is equivalent to `router.addListener(fn)`.


__router.navigate(name, params, opts)__

Navigate to the specified route name and params. Available options:
- __reload__ `true|false`, default to `false`: if trying to navigate to the current route, nothing
will happen unless `reload` is set to true
- __replace__ `true|false`, default to `false`: whether or not the current history entry should be replaced