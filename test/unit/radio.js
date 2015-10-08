import radio from '../../src/radio';
import Channel from '../../src/channel';

describe('radio', () => {
  describe('channel getter', () => {
    beforeEach(() => {
      spy(radio, 'channel');
      radio.channel('test');
    });

    it('should have been run once', () => {
      expect(radio.channel).to.have.been.calledOnce;
    });

    it('should have returned a channel instance', () => {
      expect(radio.channel).to.have.returned(sinon.match.instanceOf(Channel));
    });
  });
});

describe('channel', () => {
  const channel = radio.channel('test');
  const data = {
    hello: 'world'
  };
  const cb = sinon.spy(() => {
    return data;
  });
  const message = 'message';

  describe('Event emitter', () => {
    beforeEach(() => {
      spy(channel, 'on');
      spy(channel, 'off');
      spy(channel, 'emit');
      channel.on(message, cb);
      channel.emit(message, data, 'value');
      channel.off(message, cb);
    });

    describe('on', () => {
      it('should have been run once', () => {
        expect(channel.on).to.have.been.calledOnce;
      });
    });

    describe('emit', () => {
      it('should have been run once', () => {
        expect(channel.emit).to.have.been.calledOnce;
      });
    });

    describe('off', () => {
      it('should have been run once', () => {
        expect(channel.off).to.have.been.calledOnce;
      });
    });

    describe('callback', () => {
      it('should have been called with given arguments', () => {
        expect(cb).to.have.been.calledWithExactly(data, 'value');
      });
    });
  });

  describe('Request/Reply', () => {
    beforeEach(() => {
      spy(channel, 'request');
      spy(channel, 'reply');
    });

    describe('request', () => {
      beforeEach(() => {
        cb.reset();
        channel.reply('message', cb);
        channel.request('message');
      });

      it('should have been run once', () => {
        expect(channel.request).to.have.been.calledOnce;
      });

      it('should have returned handler callback return value', () => {
        expect(channel.request).to.have.always.returned(data);
      });
    });

    describe('reply', () => {
      beforeEach(() => {
        cb.reset();
        channel.reply('message', cb);
        channel.request('message');
      });

      it('should have been run once', () => {
        expect(channel.reply).to.have.been.calledOnce;
      });

      it('should call handler callback once', () => {
        expect(cb).to.have.always.been.calledOnce;
      });

      it('should call handler callback with channel context', () => {
        expect(cb).to.have.always.been.calledOn(channel);
      });
    });

    describe('reply with custom context', () => {
      beforeEach(() => {
        cb.reset();
        channel.reply('message', cb, data);
        channel.request('message');
      });

      it('should have been run once', () => {
        expect(channel.reply).to.have.always.been.calledOnce;
      });

      it('should call handler callback', () => {
        expect(cb).to.have.always.been.calledOn(data);
      });
    });

    describe('reply to a request with arguments', () => {
      beforeEach(() => {
        cb.reset();
        channel.reply('message', cb);
        channel.request('message', data, 'value');
      });

      it('should have been run once', () => {
        expect(channel.reply).to.have.been.calledOnce;
      });

      it('should always call handler with given arguments', () => {
        expect(cb).to.have.always.been.calledWithExactly(data, 'value');
      });
    });
  });
});
