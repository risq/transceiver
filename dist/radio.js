var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('event-emitter')) : typeof define === 'function' && define.amd ? define(['event-emitter'], factory) : global.radio = factory(global.EventEmitter);
})(this, function (EventEmitter) {
  'use strict';

  var Channel = (function () {
    function Channel(name) {
      _classCallCheck(this, Channel);

      this._name = name;
      this._requests = {};
      this._emitter = new EventEmitter();
    }

    _createClass(Channel, [{
      key: 'request',
      value: function request(message) {
        if (this._requests[message]) {
          console.log('context', this._requests[message].context);

          for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return this._requests[message].callback.apply(this._requests[message].context, args);
        } else {
          console.log('Request \'' + message + '\' has no handler');
        }
      }
    }, {
      key: 'reply',
      value: function reply(message, callback, context) {
        if (this._requests[message]) {
          console.log('Request \'' + message + '\' handler will be overwritten');
        }
        this._requests[message] = {
          callback: callback,
          context: context || this
        };
      }
    }, {
      key: 'on',
      value: function on() {
        this._emitter.on.apply(this._emitter, arguments);
      }
    }, {
      key: 'emit',
      value: function emit() {
        this._emitter.emit.apply(this._emitter, arguments);
      }
    }, {
      key: 'off',
      value: function off() {
        this._emitter.off.apply(this._emitter, arguments);
      }
    }]);

    return Channel;
  })();

  ;

  var radio = new ((function () {
    function Radio() {
      _classCallCheck(this, Radio);

      this.channels = {};
    }

    _createClass(Radio, [{
      key: 'channel',
      value: function channel(name) {
        if (!name || typeof name !== 'string') {
          throw new Error('Invalid or missing channel name');
        }
        return this.channels[name] || new Channel(name);
      }
    }]);

    return Radio;
  })())();

  return radio;
});
//# sourceMappingURL=radio.js.map
