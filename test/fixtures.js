
/* IMPORT */

const tempy = require ( 'tempy' ),
      {default: ProviderJSON} = require ( '../dist/providers/json' );

/* FIXTURES */

const Fixtures = {
  get options () {

    const local = new ProviderJSON ({
      scope: 'local',
      path: tempy.file ({ extension: 'json' })
    });

    local.writeSync ( Fixtures.local.data );

    const global = new ProviderJSON ({
      scope: 'global',
      path: tempy.file ({ extension: 'json' })
    });

    global.writeSync ( Fixtures.global.data );

    return {
      providers: [local, global],
      defaults: Fixtures.defaults,
      schema: Fixtures.schema
    };

  },
  get defaults () {
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
  get schema () {
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
  get local () {
    return {
      data: {
        core: {
          foo: 'local',
          baz: 'local'
        }
      }
    };
  },
  get global () {
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

/* EXPORT */

module.exports = Fixtures;
