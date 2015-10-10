import transceiver from '../../src/transceiver';

const channel = transceiver.channel('test');
const data = {
  hello: 'world'
};
const cb = sinon.spy(() => {
  return data;
});
const name = 'name';
const event = 'event';

describe('channel', () => {
  beforeEach(() => {
    cb.reset();
  });

  describe('.on(event, callback)', () => {
    beforeEach(() => {
      spy(channel, 'on');
    });

    it('should have been run once', () => {
      channel.on(event, cb);
      expect(channel.on).to.have.been.calledOnce;
    });
  });

  describe('.emit(event [, args])', () => {
    beforeEach(() => {
      spy(channel, 'emit');
    });

    it('should have been run once', () => {
      channel.on(event, cb);
      channel.emit(event, data, 'value');
      expect(channel.emit).to.have.been.calledOnce;
    });

    it('should have called callback with given arguments', () => {
      channel.on(event, cb);
      channel.emit(event, data, 'value');
      expect(cb).to.have.been.calledWithExactly(data, 'value');
    });
  });

  describe('.off(event)', () => {
    beforeEach(() => {
      spy(channel, 'off');
    });

    it('should have been run once', () => {
      channel.on(event, cb);
      channel.off(event, cb);
      expect(channel.off).to.have.been.calledOnce;
    });

    it('should prevent handler to be called', () => {
      const callback = spy();
      channel.on(event, callback);
      channel.off(event, callback);
      channel.emit(event, data, 'value');
      expect(callback).to.not.have.been.called;
    });
  });

  describe('.request(name)', () => {
    beforeEach(() => {
      spy(channel, 'request');
    });

    it('should have been run once', () => {
      channel.reply(name, cb);
      channel.request(name);
      expect(channel.request).to.have.been.calledOnce;
    });

    it('should have returned handler callback return value', () => {
      channel.reply(name, cb);
      channel.request(name);
      expect(channel.request).to.have.always.returned(data);
    });

    it('should have returned an undefined value if request is not handled', () => {
      channel.reply(name, cb);
      channel.request('anotherMessage');
      expect(channel.request).to.have.always.returned(undefined);
    });
  });

  describe('.reply(name, callback [, context])', () => {
    beforeEach(() => {
      spy(channel, 'reply');
    });

    it('should have been run once', () => {
      channel.reply(name, cb);
      channel.request(name);
      expect(channel.reply).to.have.been.calledOnce;
    });

    it('should call handler callback once', () => {
      channel.reply(name, cb);
      channel.request(name);
      expect(cb).to.have.always.been.calledOnce;
    });

    it('should call handler callback with specified context', () => {
      channel.reply(name, cb, data);
      channel.request(name);
      expect(cb).to.have.always.been.calledOn(data);
    });

    it('should call handler callback with channel context if no context is specified', () => {
      channel.reply(name, cb);
      channel.request(name);
      expect(cb).to.have.always.been.calledOn(channel);
    });

    it('should call handler with given request arguments', () => {
      channel.reply(name, cb);
      channel.request(name, data, 'value');
      expect(cb).to.have.always.been.calledWithExactly(data, 'value');
    });
  });

  describe('.reset()', () => {
    beforeEach(() => {
      spy(channel, 'reset');
    });

    it('should have been run once', () => {
      channel.reset();
      expect(channel.reset).to.have.been.calledOnce;
    });

    it('should have prevent on() callback to be called on emit()', () => {
      channel.on(event, cb);
      channel.reset();
      channel.emit(event);
      expect(cb).to.have.not.been.called;
    });

    it('should have prevent reply() callback to be called on request()', () => {
      channel.reply(name, cb);
      channel.reset();
      channel.request(name);
      expect(cb).to.have.not.been.called;
    });
  });
});
