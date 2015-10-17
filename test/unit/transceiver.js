import transceiver from '../../src/transceiver';
import Channel from '../../src/channel';

const OriginalPromiseConstructor = transceiver.Promise;
const FakePromiseConstructor = () => {};
const channel = transceiver.channel('test');
const data = {
  hello: 'world'
};
const cb = sinon.spy(() => {
  return data;
});
const name = 'name';
const event = 'event';

describe('transceiver', () => {
  beforeEach(() => {
    cb.reset();
  });

  describe('.channel(String name)', () => {
    beforeEach(() => {
      spy(transceiver, 'channel');
    });

    it('should have been run once', () => {
      transceiver.channel('test');
      expect(transceiver.channel).to.have.been.calledOnce;
    });

    it('should have returned a channel instance', () => {
      transceiver.channel('test');
      expect(transceiver.channel).to.have.returned(sinon.match.instanceOf(Channel));
    });

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

  describe('.setPromise(Promise promise)', () => {
    beforeEach(() => {
      spy(transceiver, 'setPromise');
    });

    afterEach(() => {
      transceiver.setPromise(OriginalPromiseConstructor);
    });

    it('should have been run once', () => {
      transceiver.setPromise(null);
      expect(transceiver.setPromise).to.have.been.calledOnce;
    });

    it('should have changed promise constructor of each channel', () => {
      transceiver.channel(name);
      transceiver.setPromise(FakePromiseConstructor);
      expect(transceiver.channel(name).Promise).to.equals(FakePromiseConstructor);
    });
  });

  describe('Shorthands', () => {
    describe('.request(String channelName, ...args)', () => {
      it('should have called channel.request(...args) with given arguments', () => {
        spy(channel, 'request');
        transceiver.reply('test', name, cb);
        transceiver.request('test', name);
        expect(channel.request).to.have.been.calledWithExactly(name);
      });
    });

    describe('.reply(String channelName, ...args)', () => {
      it('should have called channel.reply(...args) with given arguments', () => {
        spy(channel, 'reply');
        transceiver.reply('test', name, cb);
        expect(channel.reply).to.have.been.calledWithExactly(name, cb);
      });
    });

    describe('.replyPromise(String channelName, ...args)', () => {
      it('should have called channel.replyPromise(...args) with given arguments', () => {
        spy(channel, 'replyPromise');
        transceiver.replyPromise('test', name, cb);
        expect(channel.replyPromise).to.have.been.calledWithExactly(name, cb);
      });
    });

    describe('.all(String channelName, ...args)', () => {
      it('should have called channel.all(...args) with given arguments', () => {
        spy(channel, 'all');
        transceiver.all('test', []);
        expect(channel.all).to.have.been.calledWithExactly([]);
      });
    });

    describe('.race(String channelName, ...args)', () => {
      it('should have called channel.race(...args) with given arguments', () => {
        spy(channel, 'race');
        transceiver.race('test', []);
        expect(channel.race).to.have.been.calledWithExactly([]);
      });
    });

    describe('.requestArray(String channelName, ...args)', () => {
      it('should have called channel.requestArray(...args) with given arguments', () => {
        spy(channel, 'requestArray');
        transceiver.requestArray('test', []);
        expect(channel.requestArray).to.have.been.calledWithExactly([]);
      });
    });

    describe('.requestProps(String channelName, ...args)', () => {
      it('should have called channel.requestProps(...args) with given arguments', () => {
        spy(channel, 'requestProps');
        transceiver.requestProps('test', []);
        expect(channel.requestProps).to.have.been.calledWithExactly([]);
      });
    });

    describe('.emit(String channelName, ...args)', () => {
      it('should have called channel.emit(...args) with given arguments', () => {
        spy(channel, 'emit');
        transceiver.emit('test', event);
        expect(channel.emit).to.have.been.calledWithExactly(event);
      });
    });

    describe('.on(String channelName, ...args)', () => {
      it('should have called channel.on(...args) with given arguments', () => {
        spy(channel, 'on');
        transceiver.on('test', event, cb);
        expect(channel.on).to.have.been.calledWithExactly(event, cb);
      });
    });

    describe('.once(String channelName, ...args)', () => {
      it('should have called channel.once(...args) with given arguments', () => {
        spy(channel, 'once');
        transceiver.once('test', event, cb);
        expect(channel.once).to.have.been.calledWithExactly(event, cb);
      });
    });

    describe('.off(String channelName, ...args)', () => {
      it('should have called channel.off(...args) with given arguments', () => {
        spy(channel, 'off');
        transceiver.off('test', event, cb);
        expect(channel.off).to.have.been.calledWithExactly(event, cb);
      });
    });

    describe('.reset(String channelName)', () => {
      it('should have called channel.reset()', () => {
        spy(channel, 'reset');
        transceiver.reset('test');
        expect(channel.reset).to.have.been.called;
      });
    });

  });
});
