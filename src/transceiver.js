import debug from 'debug';
import Channel from './channel';

const dbg = debug('transceiver:main');

export default new class Transceiver {
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

  request(channelName, ...args) {
    return this.channel(channelName).request(...args);
  }

  reply(channelName, ...args) {
    return this.channel(channelName).reply(...args);
  }

  setPromise(Promise) {
    dbg('Setting external promise constructor');
    this.Promise = Promise;
    for (let channel of Object.keys(this.channels)) {
      this.channels[channel].Promise = this.Promise;
    }
  }
};
