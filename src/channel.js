import debug from 'debug';
import EventEmitter from 'event-emitter';

const dbg = debug('transceiver:channel');

export default class Channel {
  constructor(name) {
    dbg(`Initializing channel ${name}`);
    this._name = name;
    this._requests = {};
    this._emitter = new EventEmitter();
    this._dbg = debug(`transceiver:channel:${name}`);
  }

  request(message, ...args) {
    if (this._requests[message]) {
      this._dbg(`Calling '${message}' request handler`);
      return this._requests[message].callback.apply(this._requests[message].context, args);
    } else {
      this._dbg(`Request '${message}' has no handler`);
    }
  }

  reply(message, callback, context) {
    this._dbg(`Creating new handler for request '${message}'`);
    if (this._requests[message]) {
      this._dbg(`Request '${message}' handler will be overwritten`);
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
