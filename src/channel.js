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

  request() {
    if (arguments[0] && Array.isArray(arguments[0])) {
      return this.callMultipleHandlers(...arguments);
    } else if (arguments[0] && typeof(arguments[0]) === 'string') {
      return this.callHandler(...arguments);
    } else {
      throw new Error('Invalid message name');
    }
  }

  reply() {
    if (arguments[0] && typeof(arguments[0]) === 'object') {
      this.createMultipleHandlers(...arguments);
    } else if (arguments[0] && typeof(arguments[0]) === 'string') {
      this.createHandler(...arguments);
    } else {
      throw new Error('Invalid message name');
    }
  }

  createHandler(message, callback, context) {
    this.dbg(`Defining new handler for request '${message}'`);
    if (!callback || typeof(callback) !== 'function') {
      throw new Error('Invalid or missing callback');
    }
    if (this.requestHandlers[message]) {
      this.dbg(`Request '${message}' handler will be overwritten`);
    }
    this.requestHandlers[message] = {
      callback,
      context: context || this
    };
  }

  createMultipleHandlers(handlers, context) {
    for (let key of Object.keys(handlers)) {
      this.createHandler(key, handlers[key], context);
    }
  }

  callHandler(message, ...args) {
    if (this.requestHandlers[message]) {
      this.dbg(`Calling '${message}' request handler`);
      return this.requestHandlers[message].callback.apply(this.requestHandlers[message].context, args);
    }
    this.dbg(`Request '${message}' has no handler`);
  }

  callMultipleHandlers(requests, returnObject) {
    if (returnObject) {
      const res = {};
      requests.forEach((message) => {
        res[message] = this.callHandler(message);
      });
      return res;
    } else {
      return requests.map(this.callHandler, this);
    }
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
