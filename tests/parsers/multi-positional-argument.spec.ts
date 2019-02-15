import { multiPositionalArgument } from '../../lib/parsers/multi-positional-argument';
import { completionResult } from '../../lib/parsers/argument-parser';
import { success, error } from '../../lib/result';
import { Token } from '../../lib/tokens';
import { expect } from 'chai';
import 'mocha';


describe('parsers/multi-positional-argument', () => {

  describe('multiPositionalArgument', () => {

    it('should not allow an invalid metavar', () => {
      expect(() => multiPositionalArgument({metavar: 'this *IS* invalid'})).to.throw('metavar \'this *IS* invalid\' is invalid (must match /^[A-Z][A-Z_0-9\\-]*$/)');
    });

    it('should not allow maxCount to be less than 1', () => {
      expect(() => multiPositionalArgument({metavar: 'X', maxCount: 0})).to.throw('multiPositionalArgument: maxCount must be greater than or equal to 1');
    });

  });

  describe('MultiPositionalArgument.read', () => {

    it('should return null if the state has already been set', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X'
      });

      expect(mpa.read(['this is the state'], [{type: 'positional', value: 'this is an unread token'}])).to.equal(null);
    });

    it('should read all leading positional tokens', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X'
      });

      const tokens: Token[] = [
        {type: 'positional', value: 'pos token 1'},
        {type: 'positional', value: 'pos token 2'},
        {type: 'positional', value: 'pos token 3'},
        {type: 'short', value: 'a'},
        {type: 'positional', value: 'pos token 4'},
        {type: 'positional', value: 'pos token 5'}
      ]

      expect(mpa.read([], tokens)).to.deep.equal({
        newState: [
          'pos token 1',
          'pos token 2',
          'pos token 3'
        ],
        newTokens: [
          {type: 'short', value: 'a'},
          {type: 'positional', value: 'pos token 4'},
          {type: 'positional', value: 'pos token 5'}
        ]
      });
    });

    it('should read all leading positional tokens up to and including maxCount', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X',
        maxCount: 2
      });

      const tokens: Token[] = [
        {type: 'positional', value: 'pos token 1'},
        {type: 'positional', value: 'pos token 2'},
        {type: 'positional', value: 'pos token 3'},
        {type: 'short', value: 'a'},
        {type: 'positional', value: 'pos token 4'},
        {type: 'positional', value: 'pos token 5'}
      ]

      expect(mpa.read([], tokens)).to.deep.equal({
        newState: [
          'pos token 1',
          'pos token 2'
        ],
        newTokens: [
          {type: 'positional', value: 'pos token 3'},
          {type: 'short', value: 'a'},
          {type: 'positional', value: 'pos token 4'},
          {type: 'positional', value: 'pos token 5'}
        ]
      });
    });

    it('should return null if the next token is not a positional token', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X'
      });

      expect(mpa.read([], [{type: 'short', value: 'a'}])).to.equal(null);
    });

  });

  describe('MultiPositionalArgument.coerce', () => {

    it('should return the correct string results', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X'
      });

      expect(mpa.coerce(['1', '2', '3'])).to.deep.equal(success(['1', '2', '3']));
    });

    it('should correctly use readArgument to parse each argument', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X',
        readArgument: (arg: string) => success(parseInt(arg))
      });

      expect(mpa.coerce(['1', '2', '3'])).to.deep.equal(success([1, 2, 3]));
    });

    it('should return the first error that readArgument returns', () => {
      const mpa = multiPositionalArgument({
        metavar: 'X',
        readArgument: (arg: string) => {
          if (!/^\d+$/.test(arg)) {
            return error(`Not a valid integer: '${arg}'`);
          }

          return success(parseInt(arg));
        }
      });

      expect(mpa.coerce(['1', 'abc', 'def'])).to.deep.equal(error('Not a valid integer: \'abc\''));
    });

  });

});
