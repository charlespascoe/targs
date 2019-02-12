import { tokeniseArguments } from '../lib/tokens';
import { expect } from 'chai';
import 'mocha';


describe('tokeniseArguments', () => {
  it('should convert an argument', () => {
    const result = tokeniseArguments(['argument'])
    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'positional',
          value: 'argument'
        }
      ]
    });
  });

  it('should treat all text after \'--\' as arguments', () => {
    const result = tokeniseArguments(['--', '-f']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'positional',
          value: '-f'
        }
      ]
    });
  });

  it('should convert short flags/options', () => {
    const result = tokeniseArguments(['-f']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'short',
          value: 'f'
        }
      ]
    });
  });

  it('should handle numeric short flags/options', () => {
    const result = tokeniseArguments(['-1']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'short',
          value: '1'
        }
      ]
    });
  });

  it('should split multiple short flags', () => {
    const result = tokeniseArguments(['-abc']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'short',
          value: 'a'
        },
        {
          type: 'short',
          value: 'b'
        },
        {
          type: 'short',
          value: 'c'
        }
      ]
    });
  });

  it('should convert long flags/options', () => {
    const result = tokeniseArguments(['--flag']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'long',
          value: 'flag'
        }
      ]
    });
  });

  it('should handle numbers in long flags/options', () => {
    const result = tokeniseArguments(['--ipv6']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'long',
          value: 'ipv6'
        }
      ]
    });
  });

  it('should return an error when given an unknown flag/option pattern', () => {
    const result = tokeniseArguments(['---------------------']);

    expect(result).to.deep.equal({
      success: false,
      message: 'Unknown token',
      args: ['---------------------'],
      index: 0
    });
  });
});
