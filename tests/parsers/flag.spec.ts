import { flag } from '../../lib/parsers/flag';
import { success, error } from '../../lib/result';
import { expect } from 'chai';
import 'mocha';


describe('parsers/flag', () => {

  it('should require either long or short flag', () => {
    expect(() => flag({})).to.throw('At least one of shortName or longName must be defined')
  });

  describe('read', () => {

    it('should return null if no tokens are given', () => {
      const flg = flag({shortName: 'f'});

      expect(
        flg.read(
          flg.initial,
          []
        )
      ).to.equal(null);
    });

    it('should return null if flag isn\'t present', () => {
      const flg = flag({shortName: 'f'});

      expect(
        flg.read(
          flg.initial,
          [
            {type: 'short', value: 'g', argument: null}
          ]
        )
      ).to.equal(null);
    });

    it('should increment the counter when the flag is found', () => {
      const flg = flag({shortName: 'f'});

      expect(
        flg.read(
          3,
          [
            {type: 'short', value: 'f', argument: null}
          ]
        )
      ).to.deep.equal({newValue: 4, newTokens: []});
    });

  });

  describe('coerce', () => {

    it('should return the default value for 0 occurences', () => {
      const flg1 = flag({shortName: 'f'});
      const flg2 = flag({shortName: 'f', defaultValue: true});

      expect(flg1.coerce(0)).to.deep.equal(success(false), 'Flag 1 should return default value of false');
      expect(flg2.coerce(0)).to.deep.equal(success(true), 'Flag 2 should return default value of true');
    });

    it('should return the inverse of default for 1 occurence', () => {
      const flg1 = flag({shortName: 'f'});
      const flg2 = flag({shortName: 'f', defaultValue: true});

      expect(flg1.coerce(1)).to.deep.equal(success(true), 'Flag 1 should return default value of true');
      expect(flg2.coerce(1)).to.deep.equal(success(false), 'Flag 2 should return default value of false');
    });

    it('should return an error if greater than 1', () => {
      const flg = flag({shortName: 'f'});

      expect(flg.coerce(2)).to.deep.equal(error('Can\'t set -f flag more than once'));
      expect(flg.coerce(3)).to.deep.equal(error('Can\'t set -f flag more than once'));
      expect(flg.coerce(4)).to.deep.equal(error('Can\'t set -f flag more than once'));
    });

  });

});
