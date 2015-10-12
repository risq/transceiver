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

  describe('.request()', () => {
    describe('.request(name [, args])', () => {
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

      it('should have called handler with given arguments', () => {
        channel.reply(name, cb);
        channel.request(name, data, 'value');
        expect(cb).to.have.always.been.calledWithExactly(data, 'value');
      });

      it('should have thrown an error if name is missing', () => {
        expect(() => {
          channel.request();
        }).to.always.throw(Error);
      });

      it('should have thrown an error if name is invalid', () => {
        expect(() => {
          channel.request(42);
        }).to.always.throw(Error);
      });
    });

    describe('.request(Array requests)', () => {
      beforeEach(() => {
        spy(channel, 'requestArray');
      });

      it('should have called requestArray() with given arguments', () => {
        channel.request(['req1', 'req2', 'req3']);
        expect(channel.requestArray).to.have.been.calledWith(['req1', 'req2', 'req3']);
      });
    });

    describe('.request(Object requests)', () => {
      beforeEach(() => {
        spy(channel, 'requestProps');
      });

      it('should have called requestProps() with given arguments', () => {
        channel.request({
          req1: [],
          req2: [data],
          req3: [data, 'value'],
        });
        expect(channel.requestProps).to.have.been.calledWith({
          req1: [],
          req2: [data],
          req3: [data, 'value'],
        });
      });
    });
  });

  describe('.requestArray()', () => {
    beforeEach(() => {
      spy(channel, 'requestArray');
    });

    it('should have handled multiple requests given as an array', () => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      channel.requestArray(['req1', 'req2', 'req3']);
      expect(channel.requestArray).to.have.returned(['req1 result', 'req2 result', 'req3 result']);
    });

    it('should have handled multiple requests given as an object', () => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      channel.requestArray({
        req1: [],
        req2: [data],
        req3: [data, 'value'],
      });
      expect(channel.requestArray).to.have.returned(['req1 result', 'req2 result', 'req3 result']);
    });

    it('should have called request handlers with given arguments', () => {
      channel.reply('req1', cb);
      channel.requestArray({
        req1: [data, 'value'],
      });
      expect(cb).to.have.always.been.calledWithExactly(data, 'value');
    });

    it('should have thrown an error if requests list is not an array or an object', () => {
      expect(() => {
        channel.requestArray('req1');
      }).to.always.throw(Error);
    });
  });

  describe('.requestProps()', () => {
    beforeEach(() => {
      spy(channel, 'requestProps');
    });

    it('should have handled multiple requests given as an array', () => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      channel.requestProps(['req1', 'req2', 'req3']);
      expect(channel.requestProps).to.have.returned({
        req1: 'req1 result',
        req2: 'req2 result',
        req3: 'req3 result'
      });
    });

    it('should have handled multiple requests given as an object', () => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      channel.requestProps({
        req1: [],
        req2: [data],
        req3: [data, 'value'],
      });
      expect(channel.requestProps).to.have.returned({
        req1: 'req1 result',
        req2: 'req2 result',
        req3: 'req3 result'
      });
    });

    it('should have called request handlers with given arguments', () => {
      channel.reply('req1', cb);
      channel.requestProps({
        req1: [data, 'value'],
      });
      expect(cb).to.have.always.been.calledWithExactly(data, 'value');
    });

    it('should have thrown an error if requests list is not an array or an object', () => {
      expect(() => {
        channel.requestProps('req1');
      }).to.always.throw(Error);
    });
  });

  describe('.reply()', () => {
    beforeEach(() => {
      spy(channel, 'reply');
    });

    describe('.reply(name, callback [, context])', () => {

      it('should have been run once', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(channel.reply).to.have.been.calledOnce;
      });

      it('should have called handler callback once', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOnce;
      });

      it('should have called handler callback with specified context', () => {
        channel.reply(name, cb, data);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(data);
      });

      it('should have called handler callback with channel context if no context is specified', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(channel);
      });

      it('should have thrown an error if name is missing', () => {
        expect(() => {
          channel.reply();
        }).to.always.throw(Error);
      });

      it('should have thrown an error if name is invalid', () => {
        expect(() => {
          channel.reply(42);
        }).to.always.throw(Error);
      });

      it('should have thrown an error if callback is missing', () => {
        expect(() => {
          channel.reply(name);
        }).to.always.throw(Error);
      });

      it('should have thrown an error if callback is invalid', () => {
        expect(() => {
          channel.reply(name, 'iAmNotAFunction');
        }).to.always.throw(Error);
      });
    });

    describe('.reply(Object handlers [, context])', () => {
      it('should have handled multiple handlers definition given as one object', () => {
        channel.reply({
          req1: cb,
          req2: cb,
          req3: cb
        });
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(cb).to.have.always.been.calledThrice;
      });

      it('should have handled multiple handlers definition given as one object with specified context', () => {
        channel.reply({
          req1: cb,
          req2: cb,
          req3: cb
        }, data);
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(cb).to.have.always.been.calledOn(data);
      });

      it('should have handled multiple handlers definition given as one object with channel context if no context is specified', () => {
        channel.reply({
          req1: cb,
          req2: cb,
          req3: cb
        });
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(cb).to.have.always.been.calledOn(channel);
      });
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
