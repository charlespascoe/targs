import { ArgumentParser, CountFlag } from '../../lib';
import { expect } from 'chai';
import 'mocha';

const className = 'ArgumentParser';


interface ITestArgs1 {
  a: number;
  b: number;
}


describe(className + '.validateParsers', () => {
  it('should throw an error on duplicate short flags', () => {
    try {
      new ArgumentParser<ITestArgs1>({
        a: new CountFlag({
          short: 'x'
        }),
        b: new CountFlag({
          short: 'x'
        })
      });
    } catch (err) {
      expect(err.message).to.equal('-x defined for both a and b');
      return;
    }

    throw new Error('No exception was thrown');
  });

  it('should throw an error on duplicate long flags', () => {
    try {
      new ArgumentParser<ITestArgs1>({
        a: new CountFlag({
          long: 'long'
        }),
        b: new CountFlag({
          long: 'long'
        })
      });
    } catch (err) {
      expect(err.message).to.equal('--long defined for both a and b');
      return;
    }

    throw new Error('No exception was thrown');
  });
});
