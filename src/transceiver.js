import debug from 'debug';
import Channel from './channel';

const dbg = debug('transceiver:main');

class Transceiver {
  constructor() {
    dbg('Initializing transceiver');
    this.channels = {};
    this.Promise = Promise;
  }

  channel(name) {
    if (typeof(name) !== 'string') {
      throw new Error('Invalid or missing channel name');
    }
    if (!this.channels[name]) {
      dbg(`Initializing channel ${name}`);
      this.channels[name] = new Channel(name);
      this.channels[name].Promise = this.Promise;
    }
    return this.channels[name];
  }

  setPromise(Promise) {
    dbg('Setting external promise constructor');
    this.Promise = Promise;
    for (let channel of Object.keys(this.channels)) {
      this.channels[channel].Promise = this.Promise;
    }
  }

  request(channelName, ...args) {
    return this.channel(channelName).request(...args);
  }

  reply(channelName, ...args) {
    return this.channel(channelName).reply(...args);
  }

  replyPromise(channelName, ...args) {
    return this.channel(channelName).replyPromise(...args);
  }

  all(channelName, ...args) {
    return this.channel(channelName).all(...args);
  }

  race(channelName, ...args) {
    return this.channel(channelName).race(...args);
  }

  requestArray(channelName, ...args) {
    return this.channel(channelName).requestArray(...args);
  }

  requestProps(channelName, ...args) {
    return this.channel(channelName).requestProps(...args);
  }

  emit(channelName, ...args) {
    return this.channel(channelName).emit(...args);
  }

  on(channelName, ...args) {
    return this.channel(channelName).on(...args);
  }

  once(channelName, ...args) {
    return this.channel(channelName).once(...args);
  }

  off(channelName, ...args) {
    return this.channel(channelName).off(...args);
  }

  reset(channelName) {
    return this.channel(channelName).reset();
  }
};

const transceiver = new Transceiver();

export function reply(requestName, channelName) {
  return function(target, handlerName, descriptor) {
    if (!requestName && !handlerName) {
      throw new Error('A request name has to be specified');
    }

    if (typeof target.handlers !== 'object') {
      target.handlers = {
        requests: [],
        events: [],
      };
    }

    target.handlers.requests.push({
      channelName,
      requestName: requestName || handlerName,
      handler: descriptor.value,
    });
    return descriptor;
  };
};

export function channel(channelName) {
  return function decorator(target) {
    dbg(`Applying channel decorator to channel ${channelName}`);
    target.prototype.handlers.requests.forEach((request) => {
      const requestChannelName = request.channelName || channelName;
      if (!requestChannelName) {
        throw new Error('A channel name has to be provided');
      }

      transceiver.reply(requestChannelName, request.requestName, request.handler);
    });
  };
};

export default transceiver;
