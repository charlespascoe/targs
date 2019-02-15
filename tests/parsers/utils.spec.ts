import { validateNonposNames } from '../../lib/parsers/utils';
import { expect } from 'chai';
import 'mocha';


describe('parsers/utils', () => {

  describe('validateNonposNames', () => {

    it('should error if neither shortName nor longName are defined', () => {
      expect(() => validateNonposNames(null, null)).to.throw('At least one of shortName or longName must be defined');
    });

    it('should error if shortName is invalid', () => {
      expect(() => validateNonposNames('abc', null)).to.throw('shortName \'abc\' is invalid (must match /^[a-z0-9]$/i)');
    });

    it('should error if longName is invalid', () => {
      expect(() => validateNonposNames(null, 'invalid long name')).to.throw('longName \'invalid long name\' is invalid (must match /^[a-z0-9]+(-[a-z0-9]+)*$/i)');
    });

    it('should not error if shortName and longName are valid', () => {
      expect(() => validateNonposNames('a', 'a-valid-argument')).to.not.throw();
    });

  });

});
