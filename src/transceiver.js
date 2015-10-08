import debug from 'debug';
import Channel from './channel';

const dbg = debug('transceiver:main');

export default new class Transceiver {
  constructor() {
    dbg('Initializing transceiver');
    this._channels = {};
  }

  channel(name) {
    if (!name || typeof(name) !== 'string') {
      throw new Error('Invalid or missing channel name');
    }
    if (!this._channels[name]) {
      this._channels[name] = new Channel(name);
    }
    return this._channels[name];
  }
};
