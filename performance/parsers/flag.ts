import { flag } from '../../lib/parsers/flag';
import { Token } from '../../lib/tokens';
import { describe, run } from '../common';


describe('parsers/flag', () => {

  describe('Flag.read', () => {

    run(
      'With matching flag',
      100000,
      () => {
        const flg = flag({shortName: 'f'})
        const state = 0;
        const tokens: Token[] = [
          {type: 'short', value: 'f'}
        ];

        return () => flg.read(state, tokens);
      }
    );

    run(
      'With non-matching token',
      100000,
      () => {
        const flg = flag({shortName: 'f'})
        const state = 0;
        const tokens: Token[] = [
          {type: 'positional', value: 'foobar'}
        ];

        return () => flg.read(state, tokens);
      }
    );

  });

  describe('Flag.coerce', () => {

    run(
      'With count of 1',
      100000,
      () => {
        const flg = flag({shortName: 'f'})
        const state = 1;

        return () => flg.coerce(state);
      }
    );

    run(
      'With count of 2',
      100000,
      () => {
        const flg = flag({shortName: 'f'})
        const state = 2;

        return () => flg.coerce(state)
      }
    );

  });

});
