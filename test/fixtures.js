
/* IMPORT */

import * as $ from 'skex';
import {temporaryFile} from 'tempy';
import ProviderJSON from '../dist/providers/json.js';

/* MAIN */

const Fixtures = {
  schema () {

    return $.object ({
      core: $.object ({
        foo: $.string ().optional (),
        bar: $.string ().optional (),
        baz: $.string ().optional (),
        qux: $.string ().optional (),
        flattened: $.boolean ().optional (),
        test: $.number ().optional ()
      }).optional (),
      true: $.boolean ().optional ()
    });

  },
  filter ( data ) {

    const schema = Fixtures.schema ();

    return schema.filter ( data );

  },
  options ( providerOptions = {} ) {

    const local = new ProviderJSON ( Object.assign ({
      scope: 'local',
      path: temporaryFile ({ extension: 'json' })
    }, providerOptions ));

    local.writeSync ( Fixtures.local ().data );

    const global = new ProviderJSON ( Object.assign ({
      scope: 'global',
      path: temporaryFile ({ extension: 'json' })
    }, providerOptions ));

    global.writeSync ( Fixtures.global ().data );

    return {
      providers: [local, global],
      defaults: Fixtures.defaults (),
      filter: Fixtures.filter
    };

  },
  defaults () {

    return {
      core: {
        foo: 'defaults',
        bar: 'defaults',
        baz: 'defaults',
        qux: 'defaults',
        test: 'invalid'
      },
      'core.flattened': true,
      extra: 'extra',
      true: true,
      undefined: undefined
    };

  },
  local () {

    return {
      data: {
        core: {
          foo: 'local',
          baz: 'local'
        }
      }
    };

  },
  global () {

    return {
      data: {
        core: {
          foo: 'global',
          bar: 'global'
        }
      }
    };

  }
};

const FixturesArray = {
  schema () {

    return $.array ( $.object ({
      foo: $.string (),
      arr: $.array ( $.number () ).optional ()
    }));

  },
  filter ( data ) {

    const schema = FixturesArray.schema ();

    return schema.filter ( data );

  },
  options ( providerOptions = {} ) {

    const local = new ProviderJSON ( Object.assign ({
      scope: 'local',
      path: temporaryFile ({ extension: 'json' }),
      defaults: [],
      defaultsRaw: '[]',
    }, providerOptions ));

    local.writeSync ( FixturesArray.local ().data );

    const global = new ProviderJSON ( Object.assign ({
      scope: 'global',
      path: temporaryFile ({ extension: 'json' }),
      defaults: [],
      defaultsRaw: '[]'
    }, providerOptions ));

    global.writeSync ( FixturesArray.global ().data );

    return {
      providers: [local, global],
      defaults: FixturesArray.defaults (),
      filter: FixturesArray.filter
    };

  },
  defaults () {

    return [
      { foo: 'defaults' },
      { foo: 'defaults2' }
    ];

  },
  local () {

    return {
      data: [
        { foo: 'local' },
        { foo: 'local', arr: ['1', '2', '3'] }
      ]
    };

  },
  global () {

    return {
      data: [
        { foo: 'global', arr: [1, 2, 3] },
        { test: {} }
      ]
    };

  }
};

/* EXPORT */

export {Fixtures, FixturesArray};
