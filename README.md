# transceiver

Channel based event engine with request/reply pattern for node & browser

[![Travis build status](http://img.shields.io/travis/risq/transceiver.svg?style=flat)](https://travis-ci.org/risq/transceiver)
[![Code Climate](https://codeclimate.com/github/risq/transceiver/badges/gpa.svg)](https://codeclimate.com/github/risq/transceiver)
[![Test Coverage](https://codeclimate.com/github/risq/transceiver/badges/coverage.svg)](https://codeclimate.com/github/risq/transceiver)
[![Dependency Status](https://david-dm.org/risq/transceiver.svg)](https://david-dm.org/risq/transceiver)
[![devDependency Status](https://david-dm.org/risq/transceiver/dev-status.svg)](https://david-dm.org/risq/transceiver#info=devDependencies)

```js
// app.js

const usersChannel = transceiver.channel('users');
const authChannel = transceiver.channel('auth');

authChannel.on('login', onUserLogin);

function onUserLogin(userId) {
  usersChannel.request('getUsername', userId)
    .then((username) => {
      console.log(`${username} just logged in !`);
    })
    .catch((err) {
      console.log('Error retrieving username', err);
    });
}


// users.js

transceiver.reply('users', 'getUsername', (userId) => {
  // Fake promise
  return promise = new Promise((resolve, reject) => {
    resolve(`User ${userId}`);
  });
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

##### `.reply(String channel, args...)`

Shorthand for `transceiver.channel(name).reply(args...)`.

---

##### `.request(String channel, args...)`

Shorthand for `transceiver.channel(name).request(args...)`.

---

### channel

##### `.reply(String name, Function handler [, Object context])`

Defines a new request handler for the channel. If a handler is already defined for the given request name, it will be overwritten.

```js
// users.js

transceiver.channel('users')
  .reply('getUsername', (userId) => {
    // Fake promise
    return promise = new Promise((resolve, reject) => {
      resolve(`User ${userId}`);
    });
  });
```


##### `.reply(Object handlers [, Object context])`

Defines several request handlers in the same time.

```js
// users.js

transceiver.channel('users')
  .reply({
    getUser: this.getUser,
    deleteUser: this.deleteUser,
  });
```

---

##### `.request(String name [, args])`

Send a request to the channel. If defined, call the request handler with given arguments and return its result.

```js
// app.js

const userId = 4;

transceiver.channel('users')
  .request('getUsername', userId)
  .then((username) => {
    console.log(username);
  });
```


##### `.request(Array requests [, Boolean returnObject])`

Send several requests in the same time. If `returnObject` is set to true, returns an object with requests names as keys and handlers results as values. If not, returns an array of handlers results.

```js
// app.js

const assetsPromises = transceiver.channel('loader')
  .request([
    'loadImages',
    'loadSounds',
    'loadData',
  ]);

Promise.all(assetsPromises)
  .then(() => {
    console.log('All assets have been loaded !');
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
