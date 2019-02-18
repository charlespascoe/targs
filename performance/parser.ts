import { parse } from '../lib/parser';
import { describe, run } from './common';
import {
  flag,
  countFlag,
  positionalArgument,
  nonpositionalArgument,
  multiPositionalArgument,
  multiNonpositionalArgument,
  ArgumentParserGroup
} from '../lib/parsers';
import { tokeniseArguments } from '../lib/tokens';


describe('parser', () => {

  describe('parse()', () => {

    run(
      'A simple argument group',
      () => {
        const argGroup: ArgumentParserGroup<any> = {
          f: flag({
            shortName: 'f',
            longName: 'foo'
          }),
          c: countFlag({
            shortName: 'c',
            longName: 'count'
          }),
          p: positionalArgument({
            metavar: 'P'
          }),
          mp: multiPositionalArgument({
            metavar: 'MP'
          }),
          np: nonpositionalArgument({
            shortName: 'n',
            longName: 'non-pos',
            metavar: 'ARG'
          }),
          mnp: multiNonpositionalArgument({
            shortName: 'm',
            longName: 'multi-non-pos',
            metavar: 'ARG'
          })
        };

        const tokens = tokeniseArguments('-f -ccc -m Foo --multi-non-pos Bar --non-pos Baz arg1 arg2 arg3 arg4'.split(/\s+/));

        if (!tokens.success) {
          throw new Error(tokens.message);
        }

        return () => parse(tokens.tokens, argGroup);
      }
    )

  });

});
