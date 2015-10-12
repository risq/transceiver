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

  describe('.channel(name)', () => {
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

  describe('.reply(channel [, args])', () => {
    beforeEach(() => {
      spy(transceiver, 'reply');
    });

    it('should have been run once', () => {
      transceiver.reply('test', name, cb);
      expect(transceiver.reply).to.have.been.calledOnce;
    });
  });

  describe('.request(channel [, args])', () => {
    beforeEach(() => {
      spy(transceiver, 'request');
      transceiver.request('test', name);
    });

    it('should have been run once', () => {
      expect(transceiver.request).to.have.been.calledOnce;
    });

    it('should have returned handler callback return value', () => {
      expect(transceiver.request).to.have.always.returned(data);
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
});
