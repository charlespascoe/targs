import { flag, nonPosArgSuggestions } from '../../lib/parsers/flag';
import { success, error } from '../../lib/result';
import { expect } from 'chai';
import 'mocha';


describe('parsers/flag', () => {

  it('should require either long or short flag', () => {
    expect(() => flag({})).to.throw('At least one of shortName or longName must be defined')
  });

  describe('nonPosArgSuggestions', () => {

    it('should return the short name when given \'-\' and only the short name is defined', () => {
      expect(nonPosArgSuggestions('-', 'f', null, false)).to.deep.equal(['-f']);
    });

    it('should return the long name when given \'-\' and only the long name is defined', () => {
      expect(nonPosArgSuggestions('-', null, 'flag', false)).to.deep.equal(['--flag']);
    });

    it('should return both names name when given \'-\'', () => {
      expect(nonPosArgSuggestions('-', 'f', 'flag', false)).to.deep.equal(['-f', '--flag']);
    });

    it('should return the only long name when given \'--\'', () => {
      expect(nonPosArgSuggestions('--', 'f', 'flag', false)).to.deep.equal(['--flag']);
    });

    it('should return the only long name when given a prefix of the long name', () => {
      expect(nonPosArgSuggestions('--fl', 'f', 'flag', false)).to.deep.equal(['--flag']);
      expect(nonPosArgSuggestions('--blah', 'f', 'flag', false)).to.deep.equal([]);
    });

    it('should append short flags to composite short flags', () => {
      expect(nonPosArgSuggestions('-abc', 'f', 'flag', false)).to.deep.equal(['-abcf']);
    });

    it('should not append short flags to composite short flags if the flag is already present and `permitMultipleShortOccurences` is set to false', () => {
      expect(nonPosArgSuggestions('-afbc', 'f', 'flag', false)).to.deep.equal([]);
    });

    it('should append short flags to composite short flags if the flag is already present and `permitMultipleShortOccurences` is set to true', () => {
      expect(nonPosArgSuggestions('-afbc', 'f', 'flag', true)).to.deep.equal(['-afbcf']);
    });

  });

  describe('Flag.read', () => {

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
            {type: 'short', value: 'g'}
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
            {type: 'short', value: 'f'}
          ]
        )
      ).to.deep.equal({newState: 4, newTokens: []});
    });

  });

  describe('Flag.coerce', () => {

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

      expect(flg.coerce(2)).to.deep.equal(error('You can\'t set -f flag more than once'));
      expect(flg.coerce(3)).to.deep.equal(error('You can\'t set -f flag more than once'));
      expect(flg.coerce(4)).to.deep.equal(error('You can\'t set -f flag more than once'));
    });

  });

  describe('Flag.suggestCompletion', () => {

    // Most functionality is already tested by `nonPosArgSuggestions`

    it('should provide no suggestions if the flag has already been set', () => {
      const flg = flag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-', 1)).to.deep.equal([]);
      expect(flg.suggestCompletion([], '-', 2)).to.deep.equal([]);
    });

    it('should suggest short and long flags when given \'-\' as the partial token', () => {
      const flg = flag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-', 0)).to.deep.equal([
        '-f',
        '--flag'
      ]);
    });

    it('should suggest the long flag when given \'--\' or a long flag prefix as the partial token', () => {
      const flg = flag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '--', 0)).to.deep.equal([
        '--flag'
      ]);

      expect(flg.suggestCompletion([], '--fl', 0)).to.deep.equal([
        '--flag'
      ]);

      expect(flg.suggestCompletion([], '--as', 0)).to.deep.equal([]);
    });

    it('should provide no suggestions if the short flag is already present in a composite short flag', () => {
      const flg = flag({
        shortName: 'f',
        longName: 'flag'
      });

      expect(flg.suggestCompletion([], '-abfc', 0)).to.deep.equal([]);
    });

  });

});
