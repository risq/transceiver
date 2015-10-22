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

class TestDecorator {
  constructor() {
    console.log('constructor');
  }

  @on event(data) {
    console.log(data);
  }
}

describe('decorator', () => {
  beforeEach(() => {
    cb.reset();
  });

  describe('.channel(String name)', () => {
    beforeEach(() => {
      spy(transceiver, 'channel');
    });

    it('should have been run once', () => {
      const testDecorator = new TestDecorator();
    });
  });
});
