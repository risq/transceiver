# transceiver [![Travis build status](http://img.shields.io/travis/risq/transceiver.svg?style=flat)](https://travis-ci.org/risq/transceiver) [![Test Coverage](https://codeclimate.com/github/risq/transceiver/badges/coverage.svg)](https://codeclimate.com/github/risq/transceiver) [![Dependency Status](https://david-dm.org/risq/transceiver.svg)](https://david-dm.org/risq/transceiver)

Channel based event bus with request/reply pattern, using promises. For node & browser.

[![NPM](https://nodei.co/npm/transceiver.png?compact=true)](https://nodei.co/npm/transceiver/)


## Usage

```js
// app.js
const users = transceiver.channel('users');
const auth = transceiver.channel('auth');
const loader = transceiver.channel('loader');

auth.once('login')
  .then(userId => users.request('loadUserData', userId))
  .then(user => users.request('getUsername', user))
  .then(username => console.log(`${username} just logged in !`))
  .then(() => loader.all([
    'loadAssets',
    'loadSounds',
  ]))
  .then(() => console.log('Assets loaded !'))
  .then(() => transceiver.channel('app').emit('ready'));

// users.js
transceiver.channel('users')
  .reply({
    getUser,
    getUsername: (user) => `User ${user.name}`,
  });

function getUser(userId) {
  return new Promise((resolve, reject) => {
    // Retrieve user from db
    // ...
    resolve({name: 'bob'});
  });
}

// loader.js
transceiver.channel('loader')
  .replyPromise({
    loadAssets: (resolve, reject) => setTimeout(resolve, 2000),
    loadSounds: (resolve, reject) => setTimeout(resolve, 2500),
  });

// auth.js
transceiver.channel('auth')
  .emit('login', 89898);
```

Channels can be accessed from everywhere using `transceiver` module.
By default, making a request (using [`channel.request()`](#requeststring-name--args))
on a channel returns a Promise which is resolved by the specified handler (with [`channel.reply()`](#replystring-name-function-handler--object-context)),
on the same channel.

`transceiver` does not ship any Promise engine. It tries to use global Promise
object if available, but Promise constructor can be also set to a custom
library, like [bluebird](https://github.com/petkaantonov/bluebird), or any
[Promises/A+](https://promisesaplus.com/) implementation (see
[`transceiver.setPromise()`](#setpromisefunction-promiseconstructor)).

Promise usage can also be globally disabled. If so, methods will use
classic callbacks to call handlers.

Every channel also implements `EventEmitter` API which allows to use methods
[`on()`](#onstring-event-function-handler), [`emit()`](#emitstring-event--args),
[`once()`](#oncestring-event-function-handler) and [`off()`](#offstring-event-function-handler).


## Installation

Use `npm install --save transceiver` to get `transceiver`.

```js
// ES6/Babel
import transceiver from 'transceiver';
const authChannel = transceiver.channel('auth');

// Node.js / Browserify / requirejs...
var transceiver = require('transceiver');
var authChannel = transceiver.channel('auth');
```

`transceiver` is written in ES6 and bundled as UMD/ES5 thanks to [`generator-babel-boilerplate`](https://github.com/babel/generator-babel-boilerplate).

## Logging

`transceiver` uses [`debug`](https://www.npmjs.com/package/debug) module for
environment agnostic logging.

With node.js, use `DEBUG="transceiver:*"` environment variable to display logs.

In browser, open console and type `localStorage.debug='transceiver:*'`, then
reload the page.


## API Reference

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

  - [transceiver](#transceiver)
      - [`.channel(String name)`](#channelstring-name)
      - [`.setPromise(Function PromiseConstructor)`](#setpromisefunction-promiseconstructor)
      - [`.reply(String channel, args...)`](#replystring-channel-args)
      - [`.request(String channel, args...)`](#requeststring-channel-args)
  - [channel](#channel)
      - [`.request(String name [, args])`](#requeststring-name--args)
      - [`.request(Array requests)`](#requestarray-requests)
      - [`.request(Object requests)`](#requestobject-requests)
      - [`.reply(String name, Function handler [, Object context])`](#replystring-name-function-handler--object-context)
      - [`.reply(Object handlers [, Object context])`](#replyobject-handlers--object-context)
      - [`.replyPromise(String name, Function handler [, Object context])`](#replypromisestring-name-function-handler--object-context)
      - [`.replyPromise(Object handlers [, Object context])`](#replypromiseobject-handlers--object-context)
      - [`.all(Array requests|Object requests)`](#allarray-requestsobject-requests)
      - [`.race(Array requests|Object requests)`](#racearray-requestsobject-requests)
      - [`.requestArray(Array requests|Object requests)`](#requestarrayarray-requestsobject-requests)
      - [`.requestProps(Array requests|Object requests)`](#requestpropsarray-requestsobject-requests)
      - [`.emit(String event [, args])`](#emitstring-event--args)
      - [`.on(String event, Function handler)`](#onstring-event-function-handler)
      - [`.once(String event, Function handler)`](#oncestring-event-function-handler)
      - [`.once(String event)`](#oncestring-event)
      - [`.off(String event, Function handler)`](#offstring-event-function-handler)
      - [`.reset()`](#reset)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### transceiver

##### `.channel(String name)`

Returns a channel by its name. Channel is automatically created if it doesn't
exists.

---

##### `.setPromise(Function PromiseConstructor)`

Override the Promise constructor to another Promise engine. Use
`setPromise(null)` to disable automatic promisification of callbacks. In this
case, methods `channel.all()`, `channel.race()` and `channel.requestPromise()`
will be unusable.

```js
// Use a custom Promise library
transceiver.setPromise(Bluebird);

// Globally disable transceiver Promises usage
transceiver.setPromise(null);
```

---

##### `.reply(String channel, args...)`

Shorthand for `transceiver.channel(name).reply(args...)`.

---

##### `.request(String channel, args...)`

Shorthand for `transceiver.channel(name).request(args...)`.

---

### channel

##### `.request(String name [, args])`

Send a request to the channel. If defined, call the request handler with given
arguments. The request handler will be automatically wrapped into a Promise if a
global Promise constructor is defined.

```js
transceiver.channel('users')
  .reply('getUsername', (userId) => {
    return 'user1';
  });

transceiver.channel('users')
  .request('getUsername', userId)
  .then((username) => {
    console.log(username);
  });
```

To prevent it and call defined handler as a regular callback,
use `transceiver.setPromise(null)`.

```js
transceiver.setPromise(null);

transceiver.channel('users')
  .reply('getUsername', (userId) => {
    return 'user1';
  });

const username = transceiver.channel('users')
  .request('getUsername', userId);
```

##### `.request(Array requests)`

Shorthand for `.requestArray(Array requests)`.


##### `.request(Object requests)`

Shorthand for `.requestProps(Object requests)`.

---

##### `.reply(String name, Function handler [, Object context])`

Defines a new request handler for the channel. If a handler is already defined
for the given request name, it will be overwritten.

If request handler does not return a Promise, it will be automatically wrapped
into a Promise (only if a global Promise constructor is defined).

```js
transceiver.channel('users')
  .reply('getUsername', (userId) => {
    return `user #${userId}`;
  });
```

##### `.reply(Object handlers [, Object context])`

Defines several request handlers at the same time.

```js
transceiver.channel('users')
  .reply({
    getUser: this.getUser,
    deleteUser: this.deleteUser,
  });
```

---

##### `.replyPromise(String name, Function handler [, Object context])`

Shorthand for replying a new Promise. Uses defined Promise engine (the global
Promise constructor, if not overwritten by `transceiver.setPromise()`).

```js
transceiver.channel('loader')
  .replyPromise('loadAssets', (resolve, reject) => {
    setTimeout(resolve, 1000);
  });

// Same as
transceiver.channel('loader')
  .reply('loadAssets', () => {
    return new Promise(resolve, reject) => {
      setTimeout(resolve, 1000);
    });
  });
```

##### `.replyPromise(Object handlers [, Object context])`

Shorthand for replying several new Promises. Uses defined Promise engine (the
global Promise constructor, if not overwritten by `transceiver.setPromise()`).

```js
transceiver.channel('loader')
  .replyPromise({
    loadAssets: (resolve, reject) => {
      setTimeout(resolve, 1000);
    }),
    loadSounds: (resolve, reject) => {
      setTimeout(resolve, 2000);
    })
  });
```

---

##### `.all(Array requests|Object requests)`

Returns a promise that resolves when every given requests are resolved. Passes
the result as an array of every requests result.

Arguments can be passed for each request by using an object of requests instead
of a simple array of request names.

```js
// Using an array of requests
transceiver.channel('loader')
  .all([
    'loadImages',
    'loadSounds',
    'loadData',
  ])
  .then(() => console.log('All assets have been loaded !'));

// Using an object of requests to pass arguments
transceiver.channel('loader')
  .all({
    loadImages: ['any', 'argument', 42], // Pass a list of arguments using an array as value
    loadSounds: [],
    loadData: true, // A single argument can be passed directly, if it is not an array
  })
  .then(() => console.log('All assets have been loaded !'));
```

---

##### `.race(Array requests|Object requests)`

Returns a promise that resolves when one of the given requests is resolved.
Passes the result of the first resolved request.

Arguments can be passed for each request by using an object of requests instead
of a simple array of request names (same usage as [`channel.all()`](#allarray-requestsobject-requests)).

---

##### `.requestArray(Array requests|Object requests)`

Sends several requests at the same time, and returns handlers results as an
array.

Arguments can be passed for each request by using an object of requests instead
of a simple array of request names (same usage as [`channel.all()`](#allarray-requestsobject-requests)).

Note: If a Promise engine is used, the result will be an array of promises.

```js
const promisesArray = transceiver.channel('loader')
  .requestArray(['loadImages', 'loadSounds', 'loadData']);

Promise.all(promisesArray)
  .then(() => console.log('All assets have been loaded !'));

// Same as
transceiver.channel('loader')
  .all(['loadImages', 'loadSounds', 'loadData'])
  .then(() => console.log('All assets have been loaded !'));
```

---

##### `.requestProps(Array requests|Object requests)`

Sends several requests at the same time, and returns an object where keys
correspond to requests names and values to their respective handlers results.

Arguments can be passed for each request by using an object of requests instead
of a simple array of request names (same usage as [`channel.all()`](#allarray-requestsobject-requests)).

Note: If a Promise engine is used, the result will be an object of promises.

Can be useful with promise libraries which implements `props()` method (like
[bluebird](https://github.com/petkaantonov/bluebird/blob/master/API.md#props---promise)).

```js
import Bluebird from 'bluebird';

transceiver.channel('test')
  .replyPromise({
    req1: (resolve) => setTimeout(resolve, 2000, 'req1 result'),
    req2: (resolve) => setTimeout(resolve, 1000, 'req2 result'),
  });

const promisesAsProps = transceiver.channel('test')
  .requestProps(['req1', 'req2']);

  // Note: Arguments can be passed to the request handlers by using:
  // .requestProps({req1: [args], req2: [args]});

Bluebird.props(promisesAsProps)
  .then((res) => {
    console.log(res.req1);
    console.log(res.req2);
  });
```

---

##### `.emit(String event [, args])`

Emits an event with given arguments to the channel.

```js
transceiver.channel('auth')
  .emit('login', this.userId);
```

---

##### `.on(String event, Function handler)`

Adds a event listener to the channel.

```js
transceiver.channel('auth')
  .on('login', (userId) => {
    console.log(`User ${userId} just logged in.`);
  });
```

---

##### `.once(String event, Function handler)`

Adds a one-time event listener to the channel.

```js
transceiver.channel('auth')
  .once('login', (userId) => {
    console.log(`User ${userId} just logged in.`);
  });
```


##### `.once(String event)`

Adds a one-time event listener to the channel. Returns a promise which resolves
when the given event is emitted (only if a global Promise constructor is
defined).

```js
transceiver.channel('auth')
  .once('login')
  .then((userId) => {
    console.log(`User ${userId} just logged in.`);
  });
```

---

##### `.off(String event, Function handler)`

Removes an already defined event listener to the channel.

---

##### `.reset()`

Removes all event listeners and request handlers of the channel.
