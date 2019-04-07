import { multiNonpositional } from '../../lib/parsers/multi-nonpositional';
import { completionResult } from '../../lib/parsers/argument-parser';
import { success, error } from '../../lib/result';
import { expect } from 'chai';
import 'mocha';


describe('parsers/multi-nonpositional', () => {

  describe('multiNonpositional', () => {

    it('should not allow missing short/long names', () => {
      expect(() => multiNonpositional({metavar: 'X'})).to.throw('At least one of shortName or longName must be defined');
    });

    it('should not allow invalid short names', () => {
      expect(() => multiNonpositional({shortName: 'abc', metavar: 'X'})).to.throw('shortName \'abc\' is invalid (must match /^[a-z0-9]$/i)');
    });

    it('should not allow invalid long names', () => {
      expect(() => multiNonpositional({longName: 'invalid long name', metavar: 'X'})).to.throw('longName \'invalid long name\' is invalid (must match /^[a-z0-9]+(-[a-z0-9]+)*$/i)');
    });

    it('should not allow maxCount of less than 1', () => {
      expect(() => multiNonpositional({shortName: 'a', metavar: 'X', maxCount: 0})).to.throw('multiOptionalArgument: maxCount must be greater than or equal to 1');
    });

  });

  describe('MultiNonpositionalArgument.read', () => {

    it('should return null if given no tokens', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A'
      });

      expect(mnpa.read([], [])).to.equal(null);
    });

    it('should add null to the state if given a single matching token', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A'
      });

      expect(mnpa.read(['test'], [{type: 'short', value: 'a'}])).to.deep.equal({
        newState: ['test', null],
        newTokens: []
      });
    });

    it('should add null to the state if the token after a matching token is non-positional', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A'
      });

      expect(mnpa.read(['test'], [{type: 'short', value: 'a'}, {type: 'short', value: 'b'}])).to.deep.equal({
        newState: ['test', null],
        newTokens: [{type: 'short', value: 'b'}]
      });
    });

    it('should add the following positional argument after a matching token', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A'
      });

      expect(mnpa.read(['test'], [{type: 'short', value: 'a'}, {type: 'positional', value: 'value'}])).to.deep.equal({
        newState: ['test', 'value'],
        newTokens: []
      });
    });

  });

  describe('MultiNonpositionalArgument.coerce', () => {

    it('should return an error if at least one argument is null', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        longName: 'arg',
        metavar: 'A'
      });

      expect(mnpa.coerce(['test', null])).to.deep.equal(error('-a/--arg needs an argument'));
    });

    it('should return the correct string results', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A'
      });

      expect(mnpa.coerce(['1', '2'])).to.deep.equal(success(['1', '2']));
    })

    it('should correctly use readArgument to parse each argument', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A',
        readArgument: (arg: string) => success(parseInt(arg))
      });

      expect(mnpa.coerce(['1', '2', '3'])).to.deep.equal(success([1, 2, 3]));
    });

    it('should return the first error that readArgument returns', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        metavar: 'A',
        readArgument: (arg: string) => {
          if (!/^\d+$/.test(arg)) {
            return error(`Not a valid integer: '${arg}'`);
          }

          return success(parseInt(arg));
        }
      });

      expect(mnpa.coerce(['1', 'abc', 'def'])).to.deep.equal(error('Not a valid integer: \'abc\''));
    });

    it('should return an error if the user sets the argument too many times', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        longName: 'arg',
        metavar: 'A',
        maxCount: 2
      });

      expect(mnpa.coerce(['1'])).to.deep.equal(success(['1']));
      expect(mnpa.coerce(['1', '2'])).to.deep.equal(success(['1', '2']));
      expect(mnpa.coerce(['1', '2', '3'])).to.deep.equal(error('You can\'t set -a/--arg argument more than 2 times'));
      expect(mnpa.coerce(['1', '2', '3', '4'])).to.deep.equal(error('You can\'t set -a/--arg argument more than 2 times'));
    });

    it('should return length errors before argument validation errors', () => {
      const mnpa = multiNonpositional({
        shortName: 'a',
        longName: 'arg',
        metavar: 'A',
        maxCount: 2,
        readArgument: (arg: string) => {
          if (!/^\d+$/.test(arg)) {
            return error(`Not a valid integer: '${arg}'`);
          }

          return success(parseInt(arg));
        }
      });

      expect(mnpa.coerce(['Clearly not an integer', '2', '3', '4'])).to.deep.equal(error('You can\'t set -a/--arg argument more than 2 times'));
    });

  });

});
