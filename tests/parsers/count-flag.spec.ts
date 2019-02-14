import { countFlag } from '../../lib/parsers/count-flag';
import { success, error } from '../../lib/result';
import { completionResult } from '../../lib/parsers/argument-parser';
import { expect } from 'chai';
import 'mocha';


describe('parsers/count-flag', () => {

  it('should require either long or short flag', () => {
    expect(() => countFlag({})).to.throw('At least one of shortName or longName must be defined')
  });

  it('should not allow maxCount to be less than 0', () => {
    expect(() => countFlag({shortName: 'f', maxCount: -1})).to.throw('countFlag: maxCount must be greater than or equal to 1');
    expect(() => countFlag({shortName: 'f', maxCount: 0})).to.throw('countFlag: maxCount must be greater than or equal to 1');
    expect(() => countFlag({shortName: 'f', maxCount: 1})).to.not.throw();
  });

  describe('CountFlag.read', () => {

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

  describe('CountFlag.coerce', () => {

    it('should return the count given', () => {
      const flg1 = countFlag({shortName: 'f'});

      expect(flg1.coerce(0)).to.deep.equal(success(0));
      expect(flg1.coerce(1)).to.deep.equal(success(1));
      expect(flg1.coerce(2)).to.deep.equal(success(2));
      expect(flg1.coerce(3)).to.deep.equal(success(3));
      expect(flg1.coerce(4)).to.deep.equal(success(4));
    });

    it('should prevent passing too many flags if maxCount is set', () => {
      const flg1 = countFlag({shortName: 'f', maxCount: 2});

      expect(flg1.coerce(0)).to.deep.equal(success(0));
      expect(flg1.coerce(1)).to.deep.equal(success(1));
      expect(flg1.coerce(2)).to.deep.equal(success(2));
      expect(flg1.coerce(3)).to.deep.equal(error('You can\'t set -f flag more than 2 times'));
      expect(flg1.coerce(4)).to.deep.equal(error('You can\'t set -f flag more than 2 times'));
    });

  });

  describe('CountFlag.suggestCompletion', () => {

    // Most functionality is already tested by `nonPosArgSuggestions`

    it('should provide suggestions if the flag has already been set', () => {
      const flg = countFlag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-', 1)).to.deep.equal(completionResult([
        '-f',
        '--flag'
      ]));

      expect(flg.suggestCompletion([], '-', 2)).to.deep.equal(completionResult([
        '-f',
        '--flag'
      ]));
    });

    it('should suggest short and long flags when given \'-\' as the partial token', () => {
      const flg = countFlag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-', 0)).to.deep.equal(completionResult([
        '-f',
        '--flag'
      ]));
    });

    it('should suggest the long flag when given \'--\' or a long flag prefix as the partial token', () => {
      const flg = countFlag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '--', 0)).to.deep.equal(completionResult([
        '--flag'
      ]));

      expect(flg.suggestCompletion([], '--fl', 0)).to.deep.equal(completionResult([
        '--flag'
      ]));

      expect(flg.suggestCompletion([], '--as', 0)).to.deep.equal(completionResult([]));
    });

    it('should provide suggestions if the short flag is already present in a composite short flag', () => {
      const flg = countFlag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-abfc', 0)).to.deep.equal(completionResult(['-abfcf']));
    });

  });

});
