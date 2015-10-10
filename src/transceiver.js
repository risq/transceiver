import debug from 'debug';
import Channel from './channel';

const dbg = debug('transceiver:main');

export default new class Transceiver {
  constructor() {
    dbg('Initializing transceiver');
    this.channels = {};
  }

  channel(name) {
    if (!name || typeof(name) !== 'string') {
      throw new Error('Invalid or missing channel name');
    }
    if (!this.channels[name]) {
      this.channels[name] = new Channel(name);
    }
    return this.channels[name];
  }

  request(channelName, ...args) {
    return this.channel(channelName).request(...args);
  }

  reply(channelName, ...args) {
    return this.channel(channelName).reply(...args);
  }
};
