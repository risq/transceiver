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
      value: function request(message) {
        if (this.requestHandlers[message]) {
          this.dbg('Calling \'' + message + '\' request handler');

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return this.requestHandlers[message].callback.apply(this.requestHandlers[message].context, args);
        } else {
          this.dbg('Request \'' + message + '\' has no handler');
        }
      }
    }, {
      key: 'reply',
      value: function reply(message, callback, context) {
        this.dbg('Creating new handler for request \'' + message + '\'');
        if (this.requestHandlers[message]) {
          this.dbg('Request \'' + message + '\' handler will be overwritten');
        }
        this.requestHandlers[message] = {
          callback: callback,
          context: context || this
        };
      }
    }, {
      key: 'on',
      value: function on() {
        this.emitter.on.apply(this.emitter, arguments);
      }
    }, {
      key: 'emit',
      value: function emit() {
        this.emitter.emit.apply(this.emitter, arguments);
      }
    }, {
      key: 'off',
      value: function off() {
        this.emitter.off.apply(this.emitter, arguments);
      }
    }, {
      key: 'reset',
      value: function reset() {
        this.dbg('Resetting channel');
        this.requestHandlers = {};
        allOff(this.emitter);
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
    }]);

    return Transceiver;
  })())();

  return transceiver;
});
//# sourceMappingURL=transceiver.js.map
