import { tokeniseArguments } from '../lib/tokens';
import { expect } from 'chai';
import 'mocha';


describe('tokeniseArguments', () => {
  it('should convert an argument', () => {
    const tokens = tokeniseArguments(['argument'])
    expect(tokens).to.deep.equal([
      {
        type: 'arg',
        argument: 'argument'
      }
    ]);
  });

  it('should treat all text after \'--\' as arguments', () => {
    const tokens = tokeniseArguments(['--', '-f']);

    expect(tokens).to.deep.equal([
      {
        type: 'arg',
        argument: '-f'
      }
    ]);
  });

  it('should convert short flags/options', () => {
    const tokens = tokeniseArguments(['-f']);

    expect(tokens).to.deep.equal([
      {
        type: 'short',
        value: 'f',
        argument: null
      }
    ]);
  });

  it('should handle numeric short flags/options', () => {
    const tokens = tokeniseArguments(['-1']);

    expect(tokens).to.deep.equal([
      {
        type: 'short',
        value: '1',
        argument: null
      }
    ]);
  });

  it('should split multiple short flags', () => {
    const tokens = tokeniseArguments(['-abc']);

    expect(tokens).to.deep.equal([
      {
        type: 'short',
        value: 'a',
        argument: null
      },
      {
        type: 'short',
        value: 'b',
        argument: null
      },
      {
        type: 'short',
        value: 'c',
        argument: null
      }
    ]);
  });

  it('should set arguments to short options with \'=\'', () => {
    const tokens = tokeniseArguments(['-abc=test argument']);

    expect(tokens).to.deep.equal([
      {
        type: 'short',
        value: 'a',
        argument: null
      },
      {
        type: 'short',
        value: 'b',
        argument: null
      },
      {
        type: 'short',
        value: 'c',
        argument: 'test argument'
      }
    ]);
  });

  it('should convert long flags/options', () => {
    const tokens = tokeniseArguments(['--flag']);

    expect(tokens).to.deep.equal([
      {
        type: 'long',
        value: 'flag',
        argument: null
      }
    ]);
  });

  it('should handle numbers in long flags/options', () => {
    const tokens = tokeniseArguments(['--ipv6']);

    expect(tokens).to.deep.equal([
      {
        type: 'long',
        value: 'ipv6',
        argument: null
      }
    ]);
  });

  it('should set arguments to long options with \'=\'', () => {
    const tokens = tokeniseArguments(['--option=Another Test Argument']);

    expect(tokens).to.deep.equal([
      {
        type: 'long',
        value: 'option',
        argument: 'Another Test Argument'
      }
    ]);
  });

  it('should throw an exception on an unknown flag/option pattern', () => {
    try {
      tokeniseArguments(['---------------------']);
    } catch (err) {
      return;
    }

    throw new Error('No error was thrown');
  });
});
