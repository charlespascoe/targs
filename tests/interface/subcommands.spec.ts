import { RootParser } from '../../lib/interface/subcommands';
import { flag } from '../../lib/parsers';
import { expect } from 'chai';
import 'mocha';


describe('lib/interface/subcommands', () => {

  describe('RootParser', () => {

    it('should write an error if invalid tokens are passed', () => {
      let output: string[] = [];
      let exitCode = 0;

      const rp = new RootParser(
        {},
        {
          screenWidth: 80,
          programName: 'test',
          helpFlag: flag({
            shortName: 'h',
            longName: 'help',
            description: 'Prints help and quits'
          }),
        },
        (lines) => { lines.split('\n').forEach(line => output.push(line)) },
        (code) => { exitCode = code }
      );

      expect(output).to.deep.equal([]);

      rp.execute('a -b --c -wr-ong d e f'.split(' '));

      expect(output).to.deep.equal([
        'Unparsable token:',
        'test a -b --c -wr-ong d e f',
        '              ^^^^^^^      '
      ]);

      expect(exitCode).to.equal(1);

    });

  });

});
