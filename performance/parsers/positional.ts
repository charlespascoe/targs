import { positional } from '../../lib/parsers/positional';
import { none } from '../../lib/option';
import { Token } from '../../lib/tokens';
import { describe, run } from '../common';


describe('parsers/positional', () => {

  describe('PositionalArgument.read', () => {

    run(
      'With a positional token',
      () => {
        const posArg = positional({
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
