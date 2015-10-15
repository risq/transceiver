import transceiver from '../../src/transceiver';

const OriginalPromiseConstructor = transceiver.Promise;
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
    channel.reset();
  });

  afterEach(() => {
    transceiver.setPromise(OriginalPromiseConstructor);
  });

  describe('.on(String event, Function callback)', () => {
    beforeEach(() => {
      spy(channel, 'on');
    });

    it('should have been run once', () => {
      channel.on(event, cb);
      expect(channel.on).to.have.been.calledOnce;
    });
  });

  describe('.emit(String event [, args])', () => {
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

  describe('.off(String event)', () => {
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

  describe('.once()', () => {
    beforeEach(() => {
      spy(channel, 'once');
    });

    describe('.once(String event, Function callback)', () => {
      it('should have been run once', () => {
        channel.once(event, cb);
        expect(channel.once).to.have.been.calledOnce;
      });

      it('should have called callback with given arguments', () => {
        channel.once(event, cb);
        channel.emit(event, data, 'value');
        expect(cb).to.have.been.calledWithExactly(data, 'value');
      });

      it('should not have called callback more than once', () => {
        channel.once(event, cb);
        channel.emit(event, data, 'value');
        channel.emit(event, data, 'value');
        expect(cb).to.have.been.calledWithExactly(data, 'value');
      });
    });

    describe('.once(String event)', () => {
      it('should have been run once', () => {
        channel.once(event);
        expect(channel.once).to.have.been.calledOnce;
      });

      it('should have returned a Promise', () => {
        channel.once(event);
        expect(channel.once).to.have.returned(sinon.match.instanceOf(Promise));
      });

      it('should have called callback with given argument', (done) => {
        channel.once(event).then((argument) => {
          expect(argument).to.deep.equals(data);
          done();
        });
        channel.emit(event, data);
      });
    });
  });

  describe('.request()', () => {
    describe('.request(String name [, args])', () => {
      beforeEach(() => {
        spy(channel, 'request');
      });

      it('should have been run once', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(channel.request).to.have.been.calledOnce;
      });

      it('should have returned a Promise', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(channel.request).to.have.returned(sinon.match.instanceOf(Promise));
      });

      it('should have returned a handler callback result if no Promise constructor has been defined', () => {
        transceiver.setPromise(null);
        channel.reply(name, cb);
        channel.request(name);
        expect(channel.request).to.have.returned(data);
      });

      it('should have pass handler callback return value to the Promise', (done) => {
        channel.reply(name, cb);
        channel.request(name).then((result) => {
          expect(result).to.equal(data);
          done();
        });
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

  describe('.all(Array requests|Object requests)', () => {
    beforeEach(() => {
      spy(channel, 'all');
    });

    it('should have returned an array of each request result (given as an array)', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      return channel.all(['req1', 'req2', 'req3']).then((result) => {
        expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
        done();
      });
    });

    it('should have returned an array of each request result (given as an object)', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      return channel.all({
          req1: [],
          req2: [data],
          req3: [data, 'value'],
        }).then((result) => {
          expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
          done();
        });
    });

    it('should have called request handlers with given arguments', () => {
      channel.reply('req1', cb);
      channel.all({
        req1: [data, 'value'],
      });
      expect(cb).to.have.always.been.calledWithExactly(data, 'value');
    });

    it('should have thrown an error if requests list is not an array or an object', () => {
      expect(() => {
        channel.requestArray('req1');
      }).to.always.throw(Error);
    });

    it('should have thrown an error if no Promise constructor has been defined', () => {
      transceiver.setPromise(null);
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      return expect(() => {
        channel.all(['req1', 'req2', 'req3']);
      }).to.always.throw(Error);
    });
  });

  describe('.race(Array requests|Object requests)', () => {
    beforeEach(() => {
      spy(channel, 'all');
    });

    it('should have returned the first request to resolve (given as an array)', (done) => {
      channel.reply('req1', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req1 result'), 40));
      });
      channel.reply('req2', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req2 result'), 50));
      });
      channel.reply('req3', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req3 result'), 20));
      });
      return channel.race(['req1', 'req2', 'req3']).then((result) => {
        expect(result).to.equal('req3 result');
        done();
      });
    });

    it('should have returned the first request to resolve (given as an object)', (done) => {
      channel.reply('req1', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req1 result'), 10));
      });
      channel.reply('req2', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req2 result'), 20));
      });
      channel.reply('req3', () => {
        return new Promise((resolve) => setTimeout(() => resolve('req3 result'), 20));
      });
      return channel.race({
          req1: [],
          req2: [data],
          req3: [data, 'value'],
        }).then((result) => {
          expect(result).to.equal('req1 result');
          done();
        });
    });

    it('should have called request handlers with given arguments', () => {
      channel.reply('req1', cb);
      channel.all({
        req1: [data, 'value'],
      });
      expect(cb).to.have.always.been.calledWithExactly(data, 'value');
    });

    it('should have thrown an error if requests list is not an array or an object', () => {
      expect(() => {
        channel.requestArray('req1');
      }).to.always.throw(Error);
    });

    it('should have thrown an error if no Promise constructor has been defined', () => {
      transceiver.setPromise(null);
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      expect(() => {
        channel.all(['req1', 'req2', 'req3']);
      }).to.always.throw(Error);
    });
  });

  describe('.requestArray(Array requests|Object requests)', () => {
    beforeEach(() => {
      spy(channel, 'requestArray');
    });

    it('should have handled multiple requests given as an array', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      const promisesArray = channel.requestArray(['req1', 'req2', 'req3']);
      return Promise.all(promisesArray).then((result) => {
        expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
        done();
      });
    });

    it('should have handled multiple requests given as an object', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      const promisesArray = channel.requestArray({
        req1: [],
        req2: [data],
        req3: [data, 'value'],
      });
      return Promise.all(promisesArray).then((result) => {
        expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
        done();
      });
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

  describe('.requestProps(Array requests|Object requests)', () => {
    beforeEach(() => {
      spy(channel, 'requestProps');
    });

    it('should have handled multiple requests given as an array', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      const result = channel.requestProps(['req1', 'req2', 'req3']);
      const promisesArray = [result.req1, result.req2, result.req3];
      return Promise.all(promisesArray).then((result) => {
        expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
        done();
      });
    });

    it('should have handled multiple requests given as an object', (done) => {
      channel.reply('req1', () => {
        return 'req1 result';
      });
      channel.reply('req2', () => {
        return 'req2 result';
      });
      channel.reply('req3', () => {
        return 'req3 result';
      });
      const result = channel.requestProps({
        req1: [],
        req2: [data],
        req3: [data, 'value'],
      });
      const promisesArray = [result.req1, result.req2, result.req3];
      return Promise.all(promisesArray).then((result) => {
        expect(result).to.deep.equal(['req1 result', 'req2 result', 'req3 result']);
        done();
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

    describe('.reply(String name, Function callback [, Object context])', () => {

      it('should have been run once', () => {
        channel.reply(name, cb);
        expect(channel.reply).to.have.been.calledOnce;
      });

      it('should have called handler callback once (on request)', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOnce;
      });

      it('should have called handler callback with specified context (on request)', () => {
        channel.reply(name, cb, data);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(data);
      });

      it('should have called handler callback with channel context if no context is specified (on request)', () => {
        channel.reply(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(channel);
      });

      it('should have overwritten an already existing handler for the same request name', () => {
        channel.reply(name, cb);
        channel.reply(name, () => {});
        channel.request(name);
        expect(cb).to.have.not.been.called;
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

    describe('.reply(Object handlers [, Object context])', () => {
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

  describe('.replyPromise()', () => {
    beforeEach(() => {
      spy(channel, 'replyPromise');
    });

    describe('.replyPromise(String name, Function callback [, Object context])', () => {
      it('should have been run once', () => {
        channel.replyPromise(name, cb);
        expect(channel.replyPromise).to.have.been.calledOnce;
      });

      it('should have returned a Promise (on request)', () => {
        spy(channel, 'request');
        channel.replyPromise(name, cb);
        channel.request(name);
        expect(channel.request).to.have.returned(sinon.match.instanceOf(Promise));
      });

      it('should have called handler callback once (on request)', () => {
        channel.replyPromise(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOnce;
      });

      it('should have called handler callback with specified context (on request)', () => {
        channel.replyPromise(name, cb, data);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(data);
      });

      it('should have called handler callback with channel context if no context is specified (on request)', () => {
        channel.replyPromise(name, cb);
        channel.request(name);
        expect(cb).to.have.always.been.calledOn(channel);
      });

      it('should have thrown an error if no Promise object is defined', () => {
        expect(() => {
          transceiver.setPromise(null);
          channel.replyPromise(name, cb);
        }).to.always.throw(Error);
      });

      it('should have thrown an error if name is missing', () => {
        expect(() => {
          channel.replyPromise();
        }).to.always.throw(Error);
      });

      it('should have thrown an error if name is invalid', () => {
        expect(() => {
          channel.replyPromise(42);
        }).to.always.throw(Error);
      });

      it('should have thrown an error if callback is missing', () => {
        expect(() => {
          channel.replyPromise(name);
        }).to.always.throw(Error);
      });

      it('should have thrown an error if callback is invalid', () => {
        expect(() => {
          channel.replyPromise(name, 'iAmNotAFunction');
        }).to.always.throw(Error);
      });
    });

    describe('.replyPromise(Object handlers [, context])', () => {
      it('should have returned a Promise on each request', () => {
        spy(channel, 'request');
        channel.replyPromise({
          req1: cb,
          req2: cb,
          req3: cb
        }, data);
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(channel.request).to.have.always.returned(sinon.match.instanceOf(Promise));
      });

      it('should have handled multiple handlers definition given as one object (on request)', () => {
        channel.replyPromise({
          req1: cb,
          req2: cb,
          req3: cb
        });
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(cb).to.have.always.been.calledThrice;
      });

      it('should have handled multiple handlers definition given as one object with specified context (on request)', () => {
        channel.replyPromise({
          req1: cb,
          req2: cb,
          req3: cb
        }, data);
        channel.request('req1');
        channel.request('req2');
        channel.request('req3');
        expect(cb).to.have.always.been.calledOn(data);
      });

      it('should have handled multiple handlers definition given as one object with channel context if no context is specified (on request)', () => {
        channel.replyPromise({
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
