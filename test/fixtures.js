
/* IMPORT */

import tempy from 'tempy';
import ProviderJSON from '../dist/providers/json.js';
import AJV from './ajv.js';

/* MAIN */

const Fixtures = {
  options ( providerOptions = {} ) {

    const local = new ProviderJSON ( Object.assign ({
      scope: 'local',
      path: tempy.file ({ extension: 'json' })
    }, providerOptions ));

    local.writeSync ( Fixtures.local ().data );

    const global = new ProviderJSON ( Object.assign ({
      scope: 'global',
      path: tempy.file ({ extension: 'json' })
    }, providerOptions ));

    global.writeSync ( Fixtures.global ().data );

    return {
      providers: [local, global],
      defaults: Fixtures.defaults (),
      schema: Fixtures.schema (),
      filterer: AJV.filterer
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
  schema () {
    return {
      type: 'object',
      properties: {
        core: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            },
            qux: {
              type: 'string'
            },
            flattened: {
              type: 'boolean'
            },
            test: {
              type: 'number'
            }
          }
        },
        true: {
          type: 'boolean'
        }
      }
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
  options ( providerOptions = {} ) {

    const local = new ProviderJSON ( Object.assign ({
      scope: 'local',
      path: tempy.file ({ extension: 'json' }),
      defaults: [],
      defaultsRaw: '[]',
    }, providerOptions ));

    local.writeSync ( FixturesArray.local ().data );

    const global = new ProviderJSON ( Object.assign ({
      scope: 'global',
      path: tempy.file ({ extension: 'json' }),
      defaults: [],
      defaultsRaw: '[]'
    }, providerOptions ));

    global.writeSync ( FixturesArray.global ().data );

    return {
      providers: [local, global],
      defaults: FixturesArray.defaults (),
      schema: FixturesArray.schema (),
      filterer: AJV.filterer
    };

  },
  defaults () {
    return [
      { foo: 'defaults' },
      { foo: 'defaults2' }
    ];
  },
  schema () {
    return {
      type: 'array',
      items: {
        type: 'object',
        required: ['foo'],
        properties: {
          foo: {
            type: 'string'
          },
          arr: {
            type: 'array',
            items: {
              type: 'number'
            }
          }
        }
      }
    };
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
