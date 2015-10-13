# transceiver

Channel based event engine with request/reply pattern for node & browser

[![Travis build status](http://img.shields.io/travis/risq/transceiver.svg?style=flat)](https://travis-ci.org/risq/transceiver)
[![Code Climate](https://codeclimate.com/github/risq/transceiver/badges/gpa.svg)](https://codeclimate.com/github/risq/transceiver)
[![Test Coverage](https://codeclimate.com/github/risq/transceiver/badges/coverage.svg)](https://codeclimate.com/github/risq/transceiver)
[![Dependency Status](https://david-dm.org/risq/transceiver.svg)](https://david-dm.org/risq/transceiver)
[![devDependency Status](https://david-dm.org/risq/transceiver/dev-status.svg)](https://david-dm.org/risq/transceiver#info=devDependencies)


## Example usage

```js
// app.js
const usersChannel = transceiver.channel('users');
const authChannel = transceiver.channel('auth');
const loaderChannel = transceiver.channel('loader');

authChannel.on('login', onUserLogin);

function onUserLogin(userId) {
  loaderChannel.request('loadAssets')
    .then(() => usersChannel.request('getUsername', userId))
    .then((username) => {
      console.log(`${username} just logged in !`);
    })
    .catch((err) => {
      console.log(err);
    });
}

// users.js
transceiver.reply('users', 'getUsername', (userId) => {
  return `User #${userId}`;
});

// loader.js
transceiver.channel('loader')
  .replyPromise('loadAssets', (resolve, reject) => {
    setTimeout(resolve, 1000);
  });

// auth.js
transceiver.channel('auth')
  .emit('login', this.userId);
```


## API Reference

### transceiver

##### `.channel(String name)`

Returns a channel by its name. Channel is automatically created if it doesn't exists.

---

##### `.setPromise(Function PromiseConstructor)`

Override the Promise constructor to another Promise engine. Use `setPromise(null)`
to disable automatic promisification of callbacks.

```js
transceiver.setPromise(Bluebird);
```

---

##### `.reply(String channel, args...)`

Shorthand for `transceiver.channel(name).reply(args...)`.

---

##### `.request(String channel, args...)`

Shorthand for `transceiver.channel(name).request(args...)`.

---

### channel

##### `.reply(String name, Function handler [, Object context])`

Defines a new request handler for the channel. If a handler is already defined for the
given request name, it will be overwritten.

If request handler does not return a Promise, it will be automatically wrapped
into a Promise (only if a global Promise constructor is defined).

```js
transceiver.channel('users')
  .reply('getUsername', (userId) => {
    return `user #${userId}`;
  });
```

##### `.reply(Object handlers [, Object context])`

Defines several request handlers in the same time.

```js
transceiver.channel('users')
  .reply({
    getUser: this.getUser,
    deleteUser: this.deleteUser,
  });
```

---

### `.replyPromise(String name, Function handler [, Object context])`

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

Shorthand for replying several new Promises. Uses defined Promise engine (the global
Promise constructor, if not overwritten by `transceiver.setPromise()`).

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
use `transceiver.setPromise(null)`

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

##### `.requestArray(Array requests|Object requests)`

Sends several requests in the same time, and returns handlers results as an array.
Arguments can be passed for each request by using an object of request.

```js
// Using an array of requests
const assetsPromises = transceiver.channel('loader')
  .requestArray([
    'loadImages',
    'loadSounds',
    'loadData',
  ]);

// Using an object of requests to pass arguments
const assetsPromises = transceiver.channel('loader')
  .requestArray({
    loadImages: ['any', 'argument'],
    loadSounds: [],
    loadData: [true],
  });

// In both case, requestArray will return an array
Promise.all(assetsPromises)
  .then(() => {
    console.log('All assets have been loaded !');
  });
```

---

##### `.requestProps(Array requests|Object requests)`

Sends several requests in the same time, and returns an object where keys correspond to
requests names and values to handlers results. Arguments can be passed for each request
by using an object of request.

```js
// Using an array of requests
const result = transceiver.channel('storage')
  .requestProps([
    'getArticles',
    'getCategories',
  ]);

// Using an object of requests to pass arguments
const result = transceiver.channel('loader')
  .requestProps({
    getArticles: ['any', 'argument'],
    getCategories: [],
  });

// In both case, requestProps will return an object where keys correspond to
// requests names and values to handlers results
result.getArticles.forEach((article) => {
  console.log(article);
});
```

---

##### `.emit(String event [, args])`

Emit an event with given arguments to the channel.

```js
// auth.js

transceiver.channel('auth')
  .emit('login', this.userId);
```

---

##### `.on(String event, Function handler)`

Add a event listener to the channel.

```js
// app.js

transceiver.channel('auth')
  .on('login', (userId) => {
    console.log(`User ${userId} just logged in.`);
  });
```

---

##### `.off(String event, Function handler)`

Remove an already defined event listener to the channel.

---

##### `.reset()`

Remove all event listeners and request handlers of the channel.
