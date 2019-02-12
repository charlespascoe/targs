import { countFlag } from '../../lib/parsers/count-flag';
import { success, error } from '../../lib/result';
import { expect } from 'chai';
import 'mocha';


describe('parsers/count-flag', () => {

  it('should require either long or short flag', () => {
    expect(() => countFlag({})).to.throw('At least one of shortName or longName must be defined')
  });

  describe('read', () => {

    it('should return null if no tokens are given', () => {
      const flg = countFlag({shortName: 'f'});

      expect(
        flg.read(
          flg.initial,
          []
        )
      ).to.equal(null);
    });

    it('should return null if flag isn\'t present', () => {
      const flg = countFlag({shortName: 'f'});

      expect(
        flg.read(
          flg.initial,
          [
            {type: 'short', value: 'g'}
          ]
        )
      ).to.equal(null);
    });

    it('should increment the counter when the flag is found', () => {
      const flg = countFlag({shortName: 'f'});

      expect(
        flg.read(
          3,
          [
            {type: 'short', value: 'f'}
          ]
        )
      ).to.deep.equal({newState: 4, newTokens: []});
    });

  });

  describe('coerce', () => {

    it('should return the count given', () => {
      const flg1 = countFlag({shortName: 'f'});

      expect(flg1.coerce(0)).to.deep.equal(success(0));
      expect(flg1.coerce(1)).to.deep.equal(success(1));
      expect(flg1.coerce(2)).to.deep.equal(success(2));
      expect(flg1.coerce(3)).to.deep.equal(success(3));
      expect(flg1.coerce(4)).to.deep.equal(success(4));
    });

  });

});
