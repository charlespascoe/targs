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
          value: 'f',
          argument: null
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
          value: '1',
          argument: null
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
      ]
    });
  });

  it('should set arguments to short options with \'=\'', () => {
    const result = tokeniseArguments(['-abc=test argument']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
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
          value: 'flag',
          argument: null
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
          value: 'ipv6',
          argument: null
        }
      ]
    });
  });

  it('should set arguments to long options with \'=\'', () => {
    const result = tokeniseArguments(['--option=Another Test Argument']);

    expect(result).to.deep.equal({
      success: true,
      tokens: [
        {
          type: 'long',
          value: 'option',
          argument: 'Another Test Argument'
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
