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
    return this.channels[name] || new Channel(name);
  }
};
