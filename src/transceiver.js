import Channel from './channel';

export default new class Transceiver {
  constructor() {
    this.channels = {};
  }

  channel(name) {
    if (!name || typeof(name) !== 'string') {
      throw new Error('Invalid or missing channel name');
    }
    return this.channels[name] || new Channel(name);
  }
};
