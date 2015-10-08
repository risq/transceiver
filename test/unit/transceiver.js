import transceiver from '../../src/transceiver';
import Channel from '../../src/channel';

describe('transceiver', () => {
  describe('channel getter', () => {
    beforeEach(() => {
      spy(transceiver, 'channel');
      transceiver.channel('test');
    });

    it('should have been run once', () => {
      expect(transceiver.channel).to.have.been.calledOnce;
    });

    it('should have returned a channel instance', () => {
      expect(transceiver.channel).to.have.returned(sinon.match.instanceOf(Channel));
    });
  });

  describe('invalid channel getter', () => {
    it('should have thrown an error if channel name is missing', () => {
      expect(() => {
        transceiver.channel();
      }).to.always.throw(Error);
    });

    it('should have thrown an error if channel name is not a string', () => {
      expect(() => {
        transceiver.channel(4);
      }).to.always.throw(Error);
    });
  });
});

describe('channel', () => {
  const channel = transceiver.channel('test');
  const data = {
    hello: 'world'
  };
  const cb = sinon.spy(() => {
    return data;
  });
  const message = 'message';

  describe('event emitter', () => {
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

  describe('request/reply', () => {
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

    describe('unhandled request', () => {
      beforeEach(() => {
        cb.reset();
        channel.reply('message', cb);
        channel.request('unhandled');
      });

      it('should have been run once', () => {
        expect(channel.request).to.have.been.calledOnce;
      });

      it('should have returned an undefined value', () => {
        expect(channel.request).to.have.always.returned(undefined);
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

      it('should call handler with given arguments', () => {
        expect(cb).to.have.always.been.calledWithExactly(data, 'value');
      });
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      spy(channel, 'reset');
      cb.reset();

      channel.on(message, cb);
      channel.reply('message', cb);
      channel.reset();
    });

    it('should have been run once', () => {
      expect(channel.reset).to.have.been.calledOnce;
    });

    it('should have prevent on() callback to be called on emit()', () => {
      channel.emit(message);
      expect(cb).to.have.not.been.called;
    });

    it('should have prevent reply() callback to be called on request()', () => {
      channel.emit(message);
      expect(cb).to.have.not.been.called;
    });
  });
});
