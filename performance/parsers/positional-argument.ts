import { positionalArgument } from '../../lib/parsers/positional-argument';
import { none } from '../../lib/option';
import { Token } from '../../lib/tokens';
import { describe, run } from '../common';


describe('parsers/positional-argument', () => {

  describe('PositionalArgument.read', () => {

    run(
      'With a positional token',
      100000,
      () => {
        const posArg = positionalArgument({
          metavar: 'X'
        });

        const state = none();

        const tokens: Token[] = [
          {type: 'positional', value: 'abc'}
        ];

        return () => posArg.read(state, tokens);
      }
    )

  });

});
