
/* IMPORT */

import * as _ from 'lodash';
import delay from 'delay';
import * as fs from 'fs';
import * as tempy from 'tempy';
import {describe} from 'ava-spec';
import Configuration from '../dist';
import ProviderJSON from '../dist/providers/json';
import ProviderMemory from '../dist/providers/memory';
import Fixtures from './fixtures';

/* CONFIGURATION */

//TODO: Add some tests for the other providers

describe ( 'Configuration', () => {

  describe ( 'constructor', it => {

    it ( 'initializes the instance', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.scope, 'global' );
      t.is ( conf.scopes.local, conf.providers[0] );
      t.is ( conf.scopes.global, conf.providers[1] );
      t.is ( conf.handlers.length, 0 );
      t.true ( !!conf.dataSchema );

    });

    it ( 'adds a defaults provider', t => {

      const conf = new Configuration ( Fixtures.options );

      t.true ( !!conf.scopes.defaults );

    });

    it ( 'throws if no providers are passed', t => {

      t.throws ( () => {
        new Configuration ({});
      }, /at least one configuration provider/ );

      t.throws ( () => {
        new Configuration ({ providers: [] });
      }, /at least one configuration provider/ );

    });

    it ( 'throws if providers have an invalid scope', t => {

      t.throws ( () => {
        new Configuration ({
          providers: [
            new ProviderMemory ({
              scope: '*'
            })
          ]
        });
      }, /not a valid scope/ );

    });

  });

  describe ( 'dispose', it => {

    it ( 'disposes all providers', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.dispose ();

      conf.providers.forEach ( provider => {
        t.is ( provider.listener, undefined );
      });

    });

  });

  describe ( 'extend', it => {

    it ( 'adds a namespace', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.extend ( 'ext.test', {
        defaults: {
          foo: 'foo',
          bar: 123
        },
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'number'
            },
            baz: {
              type: 'string'
            }
          }
        }
      });

      t.is ( conf.get ( 'ext.test.foo' ), 'foo' );
      t.is ( conf.get ( 'ext.test.bar' ), 123 );
      t.is ( conf.get ( 'ext.test.baz' ), undefined );

      conf.set ( 'ext.test.baz', 'test' );

      t.is ( conf.get ( 'ext.test.baz' ), 'test' );

    });

    it ( 'returns a disposer which removes the namespace', t => {

      const conf = new Configuration ( Fixtures.options );

      const disposer = conf.extend ( 'ext.test', {
        defaults: {
          foo: 'foo',
          bar: 123
        },
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'number'
            },
            baz: {
              type: 'string'
            }
          }
        }
      });

      disposer ();

      t.is ( conf.get ( 'ext.test.foo' ), undefined );
      t.is ( conf.get ( 'ext.test.bar' ), undefined );
      t.is ( conf.get ( 'ext.test.baz' ), undefined );
      t.is ( conf.get ( 'ext.test' ), undefined );

      t.is ( _.get ( conf.schema, 'properties.ext.properties.test' ), undefined );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.extend ( 'flattened', {
        defaults: {
          'foo.bar': 'string'
        },
        schema: {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                bar: {
                  type: 'string'
                }
              }
            }
          }
        }
      });

      t.is ( conf.get ( 'flattened.foo.bar' ), 'string' );

    });

    it ( 'throws an error if the namespace is already in use', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.extend ( 'core', {} );
      }, /already in use/ );

    });

    it ( 'throws an error if the schema is missing when validation is enabled', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.extend ( 'ext.test', {} );
      }, /You need to provide a schema/ );

    });

    it ( 'throws an error if the schema is invalid', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.extend ( 'ext.test', { defaults: {}, schema: { type: 'invalid' } } );
      }, /namespace is invalid/ );

    });

    it ( 'throws an error if the schema would be incompatible with existing types', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.extend ( 'ext.test', { defaults: {}, schema: { type: 'boolean' } } );
        conf.extend ( 'ext.test.foo', { defaults: {}, schema: { type: 'boolean' } } );
      }, /incompatible with the existing schema/ );

    });

  });

  describe ( 'refresh', it => {

    it ( 'updates the current data', t => {

      const conf = new Configuration ( Fixtures.options ),
            dataPrev = _.cloneDeep ( conf.get () );

      conf.scopes.global.dataSchema = {};

      t.is ( conf.get ( 'core.bar' ), 'global' );

      conf.refresh ();

      t.is ( conf.get ( 'core.bar' ), 'defaults' );
      t.false ( _.isEqual ( conf.get (), dataPrev ) );

    });

    it ( 'doesn\'t mutate each provider data', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.scopes.global.dataSchema.core.test = true;

      const datasPrev = conf.providers.map ( provider => _.cloneDeep ( provider.dataSchema ) );

      t.is ( conf.get ( 'core.test' ), undefined );

      conf.refresh ();

      t.is ( conf.get ( 'core.test' ), true );

      const datas = conf.providers.map ( provider => _.cloneDeep ( provider.dataSchema ) );

      datasPrev.forEach ( ( prev, index ) => {
        t.true ( _.isEqual ( prev, datas[index] ) );
      });

    });

  });

  describe ( 'validate', it => {

    it ( 'can be disabled', t => {

      const conf = new Configuration ({ ...Fixtures.options, schema: false });

      t.is ( conf.validator, undefined );

    });

    it ( 'removes extra properties', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get ( 'extra' ), undefined );

    });

    it ( 'removes invalid properties', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get ( 'core.test' ), undefined );

    });

    it ( 'doesn\'t mutate the original object', t => {

      const conf = new Configuration ( Fixtures.options ),
            data = { extra: 'extra' };

      const validated = conf.validate ( data );

      t.true ( data !== validated );
      t.true ( _.isEqual ( validated, {} ) );
      t.true ( _.isEqual ( data, { extra: 'extra' } ) );

    });

  });

  describe ( 'get', it => {

    it ( 'can return the entire data', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get (), conf.dataSchema );

    });

    it ( 'can return all scopes data', t => {

      const conf = new Configuration ( Fixtures.options ),
            datas = conf.get ( '*' );

      conf.providers.forEach ( ( provider, index ) => {
        t.is ( datas[provider.scope], provider.dataSchema );
      });

    });

    it ( 'can query all scopes', t => {

      const conf = new Configuration ( Fixtures.options ),
            datas = conf.get ( '*', 'core.baz' );

      t.is ( datas.defaults, 'defaults' );
      t.is ( datas.local, 'local' );
      t.is ( datas.global, undefined );

    });

    it ( 'can query a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get ( 'defaults', 'core.baz' ), 'defaults' );
      t.is ( conf.get ( 'local', 'core.baz' ), 'local' );
      t.is ( conf.get ( 'global', 'core.baz' ), undefined );

    });

    it ( 'can query the entire data', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get ( 'core.foo' ), 'local' );
      t.is ( conf.get ( 'core.bar' ), 'global' );
      t.is ( conf.get ( 'core.baz' ), 'local' );
      t.is ( conf.get ( 'core.qux' ), 'defaults' );
      t.is ( conf.get ( 'core.missing' ), undefined );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options );

      t.is ( conf.get ( 'core.flattened' ), true );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.get ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'has', it => {

    it ( 'can check all scopes data', t => {

      const conf = new Configuration ( Fixtures.options ),
            datas = conf.has ( '*', 'core.baz' );

      t.true ( datas.defaults );
      t.true ( datas.local );
      t.false ( datas.global );

    });

    it ( 'can check a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      t.true ( conf.has ( 'defaults', 'core.baz' ) );
      t.true ( conf.has ( 'local', 'core.baz' ) );
      t.false ( conf.has ( 'global', 'core.baz' ) );

    });

    it ( 'can check the entire data', t => {

      const conf = new Configuration ( Fixtures.options );

      t.true ( conf.has ( 'core.foo' ) );
      t.true ( conf.has ( 'core.bar' ) );
      t.true ( conf.has ( 'core.baz' ) );
      t.true ( conf.has ( 'core.qux' ) );
      t.false ( conf.has ( 'core.missing' ) );

    });

    it ( 'supports undefined', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.dataSchema.none = undefined;

      t.false ( conf.has ( 'none' ) );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options );

      t.true ( conf.has ( 'core.flattened' ) );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.has ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'set', it => {

    it ( 'can set in all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.set ( '*', 'core.test', 123 );

      const datas = conf.get ( '*', 'core.test' );

      t.is ( datas.defaults, undefined );
      t.is ( datas.local, 123 );
      t.is ( datas.global, 123 );

    });

    it ( 'can set in a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.set ( 'global', 'core.test', 0 );

      t.is ( conf.get ( 'global', 'core.test' ), 0 );
      t.is ( conf.get ( 'core.test' ), 0 );

      conf.set ( 'local', 'core.test', 1 );

      t.is ( conf.get ( 'local', 'core.test' ), 1 );
      t.is ( conf.get ( 'core.test' ), 1 );

    });

    it ( 'can set in the default scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.set ( 'core.test', 0 );

      t.is ( conf.get ( 'global', 'core.test' ), 0 );
      t.is ( conf.get ( 'core.test' ), 0 );

      conf.set ( 'core.foo', 'test' );

      t.is ( conf.get ( 'global', 'core.foo' ), 'test' );
      t.is ( conf.get ( 'core.foo' ), 'local' );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.set ( 'defaults', 'core.test', 0 );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.set ( 'missing', 'foo', 0 );
      }, /unknown scopes/ );

    });

  });

  describe ( 'remove', it => {

    it ( 'can remove in all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.remove ( '*', 'core.bar' );

      const datas = conf.get ( '*', 'core.bar' );

      t.is ( datas.defaults, 'defaults' );
      t.is ( datas.local, undefined );
      t.is ( datas.global, undefined );

    });

    it ( 'can remove in a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.remove ( 'global', 'core.foo' );

      t.is ( conf.get ( 'global', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'local' );

      conf.remove ( 'local', 'core.foo' );

      t.is ( conf.get ( 'local', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'defaults' );

    });

    it ( 'can remove in the default scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.remove ( 'core.foo' );

      t.is ( conf.get ( 'global', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'local' );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.remove ( 'defaults', 'core.test' );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.remove ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'update', it => {

    it ( 'can update all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ( '*', {} );

      const datas = conf.get ( '*' );

      t.false ( _.isEqual ( datas.defaults, {} ) );
      t.true ( _.isEqual ( datas.local, {} ) );
      t.true ( _.isEqual ( datas.global, {} ) );

    });

    it ( 'can update a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ( 'global', {} );

      t.true ( _.isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update the default scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ( {} );

      t.true ( _.isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update via a string', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ( '{}' );

      t.true ( _.isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update via an object', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ({});

      t.true ( _.isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.update ( 'local', {
        'core.foo': 'foo',
        'core.bar': 'bar'
      });

      t.is ( conf.get ( 'core.foo' ), 'foo' );
      t.is ( conf.get ( 'core.bar' ), 'bar' );
      t.is ( conf.get ( 'core.baz' ), 'defaults' );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.update ( 'defaults', {} );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.update ( 'missing', {} );
      }, /unknown scopes/ );

    });

  });

  describe ( 'reset', it => {

    it ( 'will reset all scopes except defaults by default', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.reset ();

      const datas = conf.get ( '*' );

      t.false ( _.isEqual ( datas.defaults, {} ) );
      t.true ( _.isEqual ( datas.local, {} ) );
      t.true ( _.isEqual ( datas.global, {} ) );

    });

    it ( 'can reset all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.reset ( '*' );

      const datas = conf.get ( '*' );

      t.false ( _.isEqual ( datas.defaults, {} ) );
      t.true ( _.isEqual ( datas.local, {} ) );
      t.true ( _.isEqual ( datas.global, {} ) );

    });

    it ( 'can reset a scope', t => {

      const conf = new Configuration ( Fixtures.options );

      conf.reset ( 'global' );

      const datas = conf.get ( '*' );

      t.false ( _.isEqual ( datas.defaults, {} ) );
      t.false ( _.isEqual ( datas.local, {} ) );
      t.true ( _.isEqual ( datas.global, {} ) );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.reset ( 'defaults' );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options );

      t.throws ( () => {
        conf.reset ( 'missing' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'onChange', it => {

    it ( 'calls a function when a property changes', t => {

      let tests = 0;

      const conf = new Configuration ( Fixtures.options );

      conf.onChange ( 'global', 'core.foo', ( curr, prev ) => {
        tests++;
        t.is ( prev, 'global' );
        t.is ( curr, 'test' );
      });

      conf.onChange ( 'core.foo', ( curr, prev ) => {
        tests++;
        t.is ( prev, 'local' );
        t.is ( curr, 'test' );
      });

      conf.onChange ( 'core', ( c, p ) => {
        tests++;
      });

      t.is ( conf.handlers.length, 3 );

      conf.set ( 'local', 'core.foo', 'test' );
      conf.set ( 'local', 'core.foo', 'test' );
      conf.set ( 'global', 'core.foo', 'test' );
      conf.set ( 'global', 'conf', _.cloneDeep ( conf.get ( 'global', 'core' ) ) );

      t.is ( tests, 3 );

    });

    it ( 'returns a disposer', t => {

      const conf = new Configuration ( Fixtures.options );

      const disposer = conf.onChange ( 'core.foo', t.fail );

      disposer ();

      conf.set ( 'local', 'core.foo', 'test' );

      t.is ( conf.handlers.length, 0 );
      t.pass ();

    });

  });

  describe ( 'watching', it => {

    it ( 'can be disabled', t => {

      const foo = new ProviderJSON ({
        scope: 'foo',
        path: tempy.file ({ extension: 'json' }),
        watch: false
      });

      foo.writeSync ( Fixtures.local.data );

      const options = {
        providers: [foo],
        defaults: Fixtures.defaults,
        schema: Fixtures.schema
      };

      const conf = new Configuration ( options );

      t.is ( conf.scopes.foo.watcher, undefined );

    });

    it.skip ( 'detects when a file gets updated', async t => { //FIXME: Not watching properly //FIXME: It blows up the heap for some reason

      const conf = new Configuration ( Fixtures.options );

      await new Promise ( resolve => conf.scopes.global.listener.on ( 'ready', resolve ) );

      fs.writeFileSync ( conf.scopes.global.path, JSON.stringify ({
        core: {
          bar: 'custom',
          test: 'custom'
        }
      }));

      await delay ( 500 );

      t.is ( conf.get ( 'core.bar' ), 'custom' );
      t.is ( conf.get ( 'core.test' ), 'custom' );

    });

    it.skip ( 'handles invalid data', async t => { //FIXME: Not watching properly //FIXME: It blows up the heap for some reason

      const conf = new Configuration ( Fixtures.options );

      await new Promise ( resolve => conf.scopes.global.listener.on ( 'ready', resolve ) );

      fs.writeFileSync ( conf.scopes.global.path, '{' );

      await delay ( 500 );

      t.is ( conf.get ( 'core.bar' ), 'defaults' );
      t.true ( _.isEqual ( conf.scopes.global.dataSchema, {} ) );

    });

  });

});
