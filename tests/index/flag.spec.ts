import { Flag } from '../../lib';
import { expect } from 'chai';
import 'mocha';


const className = 'Flag';


describe(className + '.constructor', () => {
  it('should throw an error for a long short flag', () => {
    expect(() => new Flag({short: 'long'})).to.throw(Error, 'Short flags and options must be a single character: \'long\' is not valid.');
  });

  it('should throw an error for an invalid character', () => {
    expect(() => new Flag({short: ','})).to.throw(Error, 'Short flags and options must be a single character: \',\' is not valid.');
  });

  it('should throw an error for an invalid long flag', () => {
    expect(() => new Flag({long: 'invalid long flag'})).to.throw(Error, /^Long flags and options must match/);
    expect(() => new Flag({long: ''})).to.throw(Error, /^Long flags and options must match/);
  });

  it('should throw an error if short and long flags are omitted', () => {
    expect(() => new Flag({})).to.throw(Error, 'Either a short or long flag/option must be provided');
  });

  it('should set \'default\' to false when not specified', () => {
    expect(new Flag({short: 'a'}).default).to.equal(false);
  });

  it('should correctly set \'default\'', () => {
    expect(new Flag({short: 'a', default: true}).default).to.equal(true);
  });
});


describe(className + '.evaluate()', () => {
  it('should return the default value when flag is missing', () => {
    const result = new Flag({short: 'a', default: true}).evaluate([
      {
        type: 'short',
        value: 'b',
        argument: null
      }
    ]);

    expect(result).to.deep.equal({
      value: true,
      newTokens: [
        {
          type: 'short',
          value: 'b',
          argument: null
        }
      ]
    });
  });

  it('should throw an error when setting the flag multiple times', () => {
    expect(() => {
      new Flag({short: 'a'}).evaluate([
        {
          type: 'short',
          value: 'a',
          argument: null
        },
        {
          type: 'short',
          value: 'a',
          argument: null
        }
      ]);
    }).to.throw(Error, 'Cannot set -a flag multiple times');
  });

  it('should throw an error when an argument is explicitly given to a flag', () => {
    expect(() => {
      new Flag({short: 'a'}).evaluate([
        {
          type: 'short',
          value: 'a',
          argument: 'abc'
        }
      ]);
    }).to.throw(Error, 'Do not provide an argument for the -a flag');
  });

  it('should return the opposite of default when the flag is present', () => {
    const result = new Flag({short: 'a', default: true}).evaluate([
      {
        type: 'short',
        value: 'a',
        argument: null
      },
      {
        type: 'short',
        value: 'b',
        argument: null
      }
    ]);

    expect(result).to.deep.equal({
      value: false,
      newTokens: [
        {
          type: 'short',
          value: 'b',
          argument: null
        }
      ]
    });
  });
});
