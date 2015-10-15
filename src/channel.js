import debug from 'debug';
import EventEmitter from 'event-emitter';
import allOff from 'event-emitter/all-off';

export default class Channel {
  constructor(name) {
    this.name = name;
    this.requestHandlers = {};
    this.emitter = new EventEmitter();
    this.dbg = debug(`transceiver:channel:${name}`);
  }

  reply() {
    if (typeof arguments[0] === 'object') {
      this.createMultipleHandlers(...arguments);
    } else if (typeof arguments[0] === 'string') {
      this.createHandler(...arguments);
    } else {
      throw new Error('Invalid request name');
    }
    return this;
  }

  createHandler(name, callback, context) {
    this.dbg(`Defining new handler for request '${name}'`);
    if (typeof callback !== 'function') {
      throw new Error('Invalid or missing callback');
    }
    if (this.requestHandlers[name]) {
      this.dbg(`Warning: Request '${name}' handler will be overwritten`);
    }
    this.requestHandlers[name] = {
      callback,
      context: context || this
    };
  }

  createMultipleHandlers(handlers, context) {
    for (let key of Object.keys(handlers)) {
      this.createHandler(key, handlers[key], context);
    }
  }

  replyPromise() {
    if (typeof this.Promise !== 'function') {
      throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
    }
    if (typeof arguments[0] === 'object') {
      this.createMultiplePromiseHandlers(...arguments);
    } else if (typeof arguments[0] === 'string') {
      this.createPromiseHandler(...arguments);
    } else {
      throw new Error('Invalid request name');
    }
    return this;
  }

  createPromiseHandler(name, callback, context) {
    if (typeof callback !== 'function') {
      throw new Error('Invalid or missing callback');
    }
    this.createHandler(name, () => new this.Promise(callback.bind(context || this)));
  }

  createMultiplePromiseHandlers(handlers, context) {
    for (let key of Object.keys(handlers)) {
      this.createPromiseHandler(key, handlers[key], context);
    }
  }

  request() {
    if (Array.isArray(arguments[0])) {
      return this.requestArray(...arguments);
    }
    if (typeof arguments[0] === 'object') {
      return this.requestProps(...arguments);
    }
    if (typeof arguments[0] === 'string') {
      return this.callHandler(...arguments);
    }
    throw new Error('Invalid request name');
  }

  callHandler(name, ...args) {
    if (this.requestHandlers[name]) {
      this.dbg(`Calling '${name}' request handler`);
      if (this.Promise) {
        // Promisify callback
        return this.Promise.resolve(this.requestHandlers[name].callback.apply(this.requestHandlers[name].context, args));
      } else {
        return this.requestHandlers[name].callback.apply(this.requestHandlers[name].context, args);
      }
    }
    this.dbg(`Warning: Request '${name}' has no handler`);
  }

  requestArray(requests) {
    if (Array.isArray(requests)) {
      return requests.map(this.callHandler, this);
    } else if (typeof requests === 'object') {
      const res = [];
      for (let name of Object.keys(requests)) {
        res.push(this.callHandler(name, ...requests[name]));
      }
      return res;
    }
    throw new Error('Invalid parameter: requests must be an array or an object of requests');
  }

  requestProps(requests) {
    const res = {};
    if (Array.isArray(requests)) {
      requests.forEach((name) => {
        res[name] = this.callHandler(name);
      });
    } else if (typeof requests === 'object') {
      for (let name of Object.keys(requests)) {
        res[name] = this.callHandler(name, ...requests[name]);
      }
    } else {
      throw new Error('Invalid parameter: requests must be an array or an object of requests');
    }
    return res;
  }

  all(requests) {
    if (typeof this.Promise !== 'function') {
      throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
    }
    return this.Promise.all(this.requestArray(requests));
  }

  race(requests) {
    if (typeof this.Promise !== 'function') {
      throw new Error('No global Promise constructor has been found. Use transceiver.setPromise(Promise) to specify one.');
    }
    return this.Promise.race(this.requestArray(requests));
  }

  on() {
    this.emitter.on.apply(this.emitter, arguments);
    return this;
  }

  once(name, callback) {
    if (!callback && this.Promise) {
      return new this.Promise((resolve) => {
        return this.emitter.once(name, resolve);
      });
    }
    this.emitter.once.apply(this.emitter, arguments);
  }

  emit() {
    this.emitter.emit.apply(this.emitter, arguments);
    return this;
  }

  off() {
    this.emitter.off.apply(this.emitter, arguments);
    return this;
  }

  reset() {
    this.dbg(`Resetting channel`);
    this.requestHandlers = {};
    allOff(this.emitter);
    return this;
  }
};
