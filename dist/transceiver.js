var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('debug'), require('event-emitter'), require('event-emitter/all-off')) : typeof define === 'function' && define.amd ? define(['debug', 'event-emitter', 'event-emitter/all-off'], factory) : global.transceiver = factory(global.debug, global.EventEmitter, global.allOff);
})(this, function (debug, EventEmitter, allOff) {
  'use strict';

  var channel__dbg = debug('transceiver:channel');

  var Channel = (function () {
    function Channel(name) {
      _classCallCheck(this, Channel);

      channel__dbg('Initializing channel ' + name);
      this.name = name;
      this.requestHandlers = {};
      this.emitter = new EventEmitter();
      this.dbg = debug('transceiver:channel:' + name);
    }

    _createClass(Channel, [{
      key: 'request',
      value: function request() {
        if (arguments[0] && Array.isArray(arguments[0])) {
          return this.callMultipleHandlers.apply(this, arguments);
        } else if (arguments[0] && typeof arguments[0] === 'string') {
          return this.callHandler.apply(this, arguments);
        } else {
          throw new Error('Invalid message name');
        }
      }
    }, {
      key: 'reply',
      value: function reply() {
        if (arguments[0] && typeof arguments[0] === 'object') {
          this.createMultipleHandlers.apply(this, arguments);
        } else if (arguments[0] && typeof arguments[0] === 'string') {
          this.createHandler.apply(this, arguments);
        } else {
          throw new Error('Invalid message name');
        }
        return this;
      }
    }, {
      key: 'createHandler',
      value: function createHandler(message, callback, context) {
        this.dbg('Defining new handler for request \'' + message + '\'');
        if (!callback || typeof callback !== 'function') {
          throw new Error('Invalid or missing callback');
        }
        if (this.requestHandlers[message]) {
          this.dbg('Request \'' + message + '\' handler will be overwritten');
        }
        this.requestHandlers[message] = {
          callback: callback,
          context: context || this
        };
      }
    }, {
      key: 'createMultipleHandlers',
      value: function createMultipleHandlers(handlers, context) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(handlers)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            this.createHandler(key, handlers[key], context);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'callHandler',
      value: function callHandler(message) {
        if (this.requestHandlers[message]) {
          this.dbg('Calling \'' + message + '\' request handler');

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return this.requestHandlers[message].callback.apply(this.requestHandlers[message].context, args);
        }
        this.dbg('Request \'' + message + '\' has no handler');
      }
    }, {
      key: 'callMultipleHandlers',
      value: function callMultipleHandlers(requests, returnObject) {
        var _this = this;

        if (returnObject) {
          var _ret = (function () {
            var res = {};
            requests.forEach(function (message) {
              res[message] = _this.callHandler(message);
            });
            return {
              v: res
            };
          })();

          if (typeof _ret === 'object') return _ret.v;
        } else {
          return requests.map(this.callHandler, this);
        }
      }
    }, {
      key: 'on',
      value: function on() {
        this.emitter.on.apply(this.emitter, arguments);
        return this;
      }
    }, {
      key: 'emit',
      value: function emit() {
        this.emitter.emit.apply(this.emitter, arguments);
        return this;
      }
    }, {
      key: 'off',
      value: function off() {
        this.emitter.off.apply(this.emitter, arguments);
        return this;
      }
    }, {
      key: 'reset',
      value: function reset() {
        this.dbg('Resetting channel');
        this.requestHandlers = {};
        allOff(this.emitter);
        return this;
      }
    }]);

    return Channel;
  })();

  ;

  var transceiver__dbg = debug('transceiver:main');

  var transceiver = new ((function () {
    function Transceiver() {
      _classCallCheck(this, Transceiver);

      transceiver__dbg('Initializing transceiver');
      this.channels = {};
    }

    _createClass(Transceiver, [{
      key: 'channel',
      value: function channel(name) {
        if (!name || typeof name !== 'string') {
          throw new Error('Invalid or missing channel name');
        }
        if (!this.channels[name]) {
          this.channels[name] = new Channel(name);
        }
        return this.channels[name];
      }
    }, {
      key: 'request',
      value: function request(channelName) {
        var _channel;

        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return (_channel = this.channel(channelName)).request.apply(_channel, args);
      }
    }, {
      key: 'reply',
      value: function reply(channelName) {
        var _channel2;

        for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        return (_channel2 = this.channel(channelName)).reply.apply(_channel2, args);
      }
    }]);

    return Transceiver;
  })())();

  return transceiver;
});
//# sourceMappingURL=transceiver.js.map
