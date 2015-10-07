import radio from '../../src/radio';

describe('radio', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(radio, 'greet');
      radio.greet();
    });

    it('should have been run once', () => {
      expect(radio.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(radio.greet).to.have.always.returned('hello');
    });
  });
});
