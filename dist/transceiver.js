var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('debug'), require('event-emitter'), require('event-emitter/all-off')) : typeof define === 'function' && define.amd ? define(['debug', 'event-emitter', 'event-emitter/all-off'], factory) : global.transceiver = factory(global.debug, global.EventEmitter, global.allOff);
})(this, function (debug, EventEmitter, allOff) {
  'use strict';

  var Channel = (function () {
    function Channel(name) {
      _classCallCheck(this, Channel);

      this.name = name;
      this.requestHandlers = {};
      this.emitter = new EventEmitter();
      this.dbg = debug('transceiver:channel:' + name);
    }

    _createClass(Channel, [{
      key: 'reply',
      value: function reply() {
        if (typeof arguments[0] === 'object') {
          this.createMultipleHandlers.apply(this, arguments);
        } else if (typeof arguments[0] === 'string') {
          this.createHandler.apply(this, arguments);
        } else {
          throw new Error('Invalid request name');
        }
        return this;
      }
    }, {
      key: 'createHandler',
      value: function createHandler(name, callback, context) {
        this.dbg('Defining new handler for request \'' + name + '\'');
        if (typeof callback !== 'function') {
          throw new Error('Invalid or missing callback');
        }
        if (this.requestHandlers[name]) {
          this.dbg('Warning: Request \'' + name + '\' handler will be overwritten');
        }
        this.requestHandlers[name] = {
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
      key: 'replyPromise',
      value: function replyPromise() {
        if (typeof this.Promise !== 'function') {
          throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
        }
        if (typeof arguments[0] === 'object') {
          this.createMultiplePromiseHandlers.apply(this, arguments);
        } else if (typeof arguments[0] === 'string') {
          this.createPromiseHandler.apply(this, arguments);
        } else {
          throw new Error('Invalid request name');
        }
        return this;
      }
    }, {
      key: 'createPromiseHandler',
      value: function createPromiseHandler(name, callback, context) {
        var _this = this;

        if (typeof callback !== 'function') {
          throw new Error('Invalid or missing callback');
        }
        this.createHandler(name, function () {
          return new _this.Promise(callback.bind(context || _this));
        });
      }
    }, {
      key: 'createMultiplePromiseHandlers',
      value: function createMultiplePromiseHandlers(handlers, context) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Object.keys(handlers)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var key = _step2.value;

            this.createPromiseHandler(key, handlers[key], context);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: 'request',
      value: function request() {
        if (Array.isArray(arguments[0])) {
          return this.requestArray.apply(this, arguments);
        }
        if (typeof arguments[0] === 'object') {
          return this.requestProps.apply(this, arguments);
        }
        if (typeof arguments[0] === 'string') {
          return this.callHandler.apply(this, arguments);
        }
        throw new Error('Invalid request name');
      }
    }, {
      key: 'callHandler',
      value: function callHandler(name) {
        if (this.requestHandlers[name]) {
          this.dbg('Calling \'' + name + '\' request handler');

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          if (this.Promise) {
            // Promisify callback
            return this.Promise.resolve(this.requestHandlers[name].callback.apply(this.requestHandlers[name].context, args));
          } else {
            return this.requestHandlers[name].callback.apply(this.requestHandlers[name].context, args);
          }
        }
        this.dbg('Warning: Request \'' + name + '\' has no handler');
      }
    }, {
      key: 'requestArray',
      value: function requestArray(requests) {
        if (Array.isArray(requests)) {
          return requests.map(this.callHandler, this);
        } else if (typeof requests === 'object') {
          var res = [];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = Object.keys(requests)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _name = _step3.value;

              res.push(this.callHandler.apply(this, [_name].concat(_toConsumableArray(requests[_name]))));
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                _iterator3['return']();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return res;
        }
        throw new Error('Invalid parameter: requests must be an array or an object of requests');
      }
    }, {
      key: 'requestProps',
      value: function requestProps(requests) {
        var _this2 = this;

        var res = {};
        if (Array.isArray(requests)) {
          requests.forEach(function (name) {
            res[name] = _this2.callHandler(name);
          });
        } else if (typeof requests === 'object') {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = Object.keys(requests)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var _name2 = _step4.value;

              res[_name2] = this.callHandler.apply(this, [_name2].concat(_toConsumableArray(requests[_name2])));
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                _iterator4['return']();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        } else {
          throw new Error('Invalid parameter: requests must be an array or an object of requests');
        }
        return res;
      }
    }, {
      key: 'all',
      value: function all(requests) {
        if (typeof this.Promise !== 'function') {
          throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
        }
        return this.Promise.all(this.requestArray(requests));
      }
    }, {
      key: 'race',
      value: function race(requests) {
        if (typeof this.Promise !== 'function') {
          throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
        }
        return this.Promise.race(this.requestArray(requests));
      }
    }, {
      key: 'on',
      value: function on(name) {
        this.dbg('Defining new handler for event \'' + name + '\'');
        this.emitter.on.apply(this.emitter, arguments);
        return this;
      }
    }, {
      key: 'once',
      value: function once(name, callback) {
        var _this3 = this;

        this.dbg('Defining new one-time handler for event \'' + name + '\'');
        if (!callback && this.Promise) {
          return new this.Promise(function (resolve) {
            return _this3.emitter.once(name, resolve);
          });
        }
        this.emitter.once.apply(this.emitter, arguments);
      }
    }, {
      key: 'emit',
      value: function emit(name) {
        this.dbg('Emitting new \'' + name + '\' event');
        this.emitter.emit.apply(this.emitter, arguments);
        return this;
      }
    }, {
      key: 'off',
      value: function off(name) {
        this.dbg('Removing new handler for event \'' + name + '\'');
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

  var dbg = debug('transceiver:main');

  var transceiver = new ((function () {
    function Transceiver() {
      _classCallCheck(this, Transceiver);

      dbg('Initializing transceiver');
      this.channels = {};
      this.Promise = Promise;
    }

    _createClass(Transceiver, [{
      key: 'channel',
      value: function channel(name) {
        if (typeof name !== 'string') {
          throw new Error('Invalid or missing channel name');
        }
        if (!this.channels[name]) {
          dbg('Initializing channel ' + name);
          this.channels[name] = new Channel(name);
          this.channels[name].Promise = this.Promise;
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
    }, {
      key: 'setPromise',
      value: function setPromise(Promise) {
        dbg('Setting external promise constructor');
        this.Promise = Promise;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = Object.keys(this.channels)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var channel = _step5.value;

            this.channels[channel].Promise = this.Promise;
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5['return']) {
              _iterator5['return']();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
    }]);

    return Transceiver;
  })())();

  return transceiver;
});
//# sourceMappingURL=transceiver.js.map
