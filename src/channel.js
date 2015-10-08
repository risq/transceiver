import debug from 'debug';
import EventEmitter from 'event-emitter';
import allOff from 'event-emitter/all-off';

const dbg = debug('transceiver:channel');

export default class Channel {
  constructor(name) {
    dbg(`Initializing channel ${name}`);
    this.name = name;
    this.requestHandlers = {};
    this.emitter = new EventEmitter();
    this.dbg = debug(`transceiver:channel:${name}`);
  }

  request(message, ...args) {
    if (this.requestHandlers[message]) {
      this.dbg(`Calling '${message}' request handler`);
      return this.requestHandlers[message].callback.apply(this.requestHandlers[message].context, args);
    } else {
      this.dbg(`Request '${message}' has no handler`);
    }
  }

  reply(message, callback, context) {
    this.dbg(`Creating new handler for request '${message}'`);
    if (this.requestHandlers[message]) {
      this.dbg(`Request '${message}' handler will be overwritten`);
    }
    this.requestHandlers[message] = {
      callback,
      context: context || this
    };
  }

  on() {
    this.emitter.on.apply(this.emitter, arguments);
  }

  emit() {
    this.emitter.emit.apply(this.emitter, arguments);
  }

  off() {
    this.emitter.off.apply(this.emitter, arguments);
  }

  reset() {
    this.dbg(`Resetting channel`);
    this.requestHandlers = {};
    allOff(this.emitter);
  }
};
