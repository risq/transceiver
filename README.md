# transceiver

Channel based event engine with request/reply pattern for node & browser

[![Travis build status](http://img.shields.io/travis/risq/transceiver.svg?style=flat)](https://travis-ci.org/risq/transceiver)
[![Code Climate](https://codeclimate.com/github/risq/transceiver/badges/gpa.svg)](https://codeclimate.com/github/risq/transceiver)
[![Test Coverage](https://codeclimate.com/github/risq/transceiver/badges/coverage.svg)](https://codeclimate.com/github/risq/transceiver)
[![Dependency Status](https://david-dm.org/risq/transceiver.svg)](https://david-dm.org/risq/transceiver)
[![devDependency Status](https://david-dm.org/risq/transceiver/dev-status.svg)](https://david-dm.org/risq/transceiver#info=devDependencies)

## API Reference

### transceiver

##### `.channel(name)`

Returns a channel by its name. Channel is automatically created if it doesn't exists.


##### `.reply(channel, args...)`

Shorthand for `transceiver.channel(name).reply(args...)`.


##### `.request(channel, args...)`

Shorthand for `transceiver.channel(name).request(args...)`.


### channel

##### `.reply(name, callback [, context])`

Defines a new request handler for the channel. If a handler is already defined for the given request name, it will be overwritten.


##### `.reply(Object handlers [, context])`

Defines several request handlers in the same time.


##### `.request(name [, args])`

Send a request to the channel. If defined, call the request handler with given arguments and return its result.


##### `.request(Object requests [, returnObject])`

Send several requests in the same time. If `returnObject` is set to true, returns an object with requests names as keys and handlers results as values. If not, returns an array of handlers results.


##### `.on(event, callback)`

Add a event listener to the channel.


##### `.emit(event [, args])`

Emit an event with given arguments to the channel.


##### `.off(event, callback)`

Remove an already defined event listener to the channel.


##### `.reset()`

Remove all event listeners and request handlers of the channel.
