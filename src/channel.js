import EventEmitter from 'event-emitter';

export default class Channel {
  constructor(name) {
    this._name = name;
    this._requests = {};
    this._emitter = new EventEmitter();
  }

  request(message, ...args) {
    if (this._requests[message]) {
      console.log('context', this._requests[message].context);
      return this._requests[message].callback.apply(this._requests[message].context, args);
    } else {
      console.log(`Request '${message}' has no handler`);
    }
  }

  reply(message, callback, context) {
    if (this._requests[message]) {
      console.log(`Request '${message}' handler will be overwritten`);
    }
    this._requests[message] = {
      callback,
      context: context || this
    };
  }

  on() {
    this._emitter.on.apply(this._emitter, arguments);
  }

  emit() {
    this._emitter.emit.apply(this._emitter, arguments);
  }

  off() {
    this._emitter.off.apply(this._emitter, arguments);
  }
};
