
/* IMPORT */

import {describe} from 'fava';
import fs from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
import cloneDeep from 'plain-object-clone';
import isEqual from 'plain-object-is-equal';
import {temporaryFile} from 'tempy';
import Configuration from '../dist/index.js';
import ProviderJSON from '../dist/providers/json.js';
import ProviderMemory from '../dist/providers/memory.js';
import {Fixtures, FixturesArray} from './fixtures.js';

/* MAIN */

//TODO: Add some tests for the other providers
//TODO: Add more array-based tests, and improve existing ones

describe ( 'Configuration', () => {

  describe ( 'constructor', it => {

    it ( 'initializes the instance', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.scopes.local, conf.providers[0] );
      t.is ( conf.scopes.global, conf.providers[1] );
      t.is ( conf.handlers.length, 0 );
      t.true ( !!conf.data );

    });

    it ( 'adds a defaults provider', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.true ( !!conf.scopes.defaults );

    });

    it ( 'supports a custom parser', t => {

      const conf = new Configuration ( Fixtures.options ({ parser: JSON }) );

      t.is ( conf.scopes.global.dataRaw, JSON.stringify ( conf.scopes.global.data ) );

    });

    it ( 'supports custom defaults', t => {

      const conf = new Configuration ( Fixtures.options ({ defaults: { core: { bar: 'custom' } }, defaultsRaw: '{ // Custom\n }' }) );

      t.is ( conf.get ( 'global', 'core.bar' ), 'global' );

      conf.scopes.global.writeSync ( '{' ); // Unparseable data raw, forcing the use of defaults

      t.is ( conf.get ( 'global', 'core.bar' ), 'custom' );
      t.is ( conf.scopes.global.dataRaw, '{' );

      conf.scopes.global.writeSync ({ toJSON: () => { throw new Error ( 'Unstringifiable') } }); // Unstringifiable data, forcing the use of defaults

      t.is ( conf.get ( 'global', 'core.bar' ), undefined );
      t.is ( conf.scopes.global.dataRaw, '{ // Custom\n }' );

    });

    it ( 'supports custom flattened defaults (scope)', t => {

      const conf = new Configuration ({ providers: [new ProviderMemory ({ scope: 'local' })], defaults: { 'core.bar': 'custom' }, filter: Fixtures.filter });

      t.true ( isEqual ( conf.scopes.defaults.data, { core: { bar: 'custom' } } ) );

    });

    it ( 'supports custom flattened defaults (provider+object)', t => {

      const conf = new Configuration ({ providers: [new ProviderMemory ({ scope: 'local', defaults: { 'core.foo': 'custom' } })], defaults: {}, filter: Fixtures.filter });

      t.true ( isEqual ( conf.scopes.local.data, { core: { foo: 'custom' } } ) );

    });

    it ( 'supports custom flattened defaults (provider+string)', t => {

      const conf = new Configuration ({ providers: [new ProviderMemory ({ scope: 'local', defaultsRaw: `{ "core.foo": "custom" }` })], defaults: {}, filter: Fixtures.filter });

      t.true ( isEqual ( conf.scopes.local.data, { core: { foo: 'custom' } } ) );

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

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      conf.dispose ();

      conf.providers.forEach ( provider => {
        t.is ( provider.watcher, undefined );
      });

    });

  });

  describe ( 'refresh', it => {

    it ( 'updates the current data', t => {

      const conf = new Configuration ( Fixtures.options () );
      const dataPrev = cloneDeep ( conf.get () );

      conf.scopes.global.dataFiltered = {};

      t.is ( conf.get ( 'core.bar' ), 'global' );

      conf.refresh ();

      t.is ( conf.get ( 'core.bar' ), 'defaults' );
      t.false ( isEqual ( conf.get (), dataPrev ) );

    });

    it ( 'supports arrays', t => {

      const conf = new Configuration ( FixturesArray.options () );

      const dataExpected = [
        { foo: 'defaults' },
        { foo: 'defaults2' },
        { foo: 'global', arr: [1, 2, 3] },
        { foo: 'local' },
        { foo: 'local', arr: [] }
      ];

      t.true ( isEqual ( conf.get (), dataExpected ) );

    });

    it ( 'does not mutate each provider data', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.scopes.global.dataFiltered.core.test = true;

      const datasPrev = conf.providers.map ( provider => cloneDeep ( provider.dataFiltered ) );

      t.is ( conf.get ( 'core.test' ), undefined );

      conf.refresh ();

      t.is ( conf.get ( 'core.test' ), true );

      const datas = conf.providers.map ( provider => cloneDeep ( provider.dataFiltered ) );

      datasPrev.forEach ( ( prev, index ) => {
        t.true ( isEqual ( prev, datas[index] ) );
      });

    });

  });

  describe ( 'get', it => {

    it ( 'can return the entire data', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.get (), conf.data );

    });

    it ( 'can return all scopes data', t => {

      const conf = new Configuration ( Fixtures.options () );
      const datas = conf.get ( '*' );

      conf.providers.forEach ( ( provider, index ) => {
        t.is ( datas[provider.scope], provider.dataFiltered );
      });

    });

    it ( 'can query all scopes', t => {

      const conf = new Configuration ( Fixtures.options () );
      const datas = conf.get ( '*', 'core.baz' );

      t.is ( datas.defaults, 'defaults' );
      t.is ( datas.local, 'local' );
      t.is ( datas.global, undefined );

    });

    it ( 'can query a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.get ( 'defaults', 'core.baz' ), 'defaults' );
      t.is ( conf.get ( 'local', 'core.baz' ), 'local' );
      t.is ( conf.get ( 'global', 'core.baz' ), undefined );

    });

    it ( 'can query the entire data', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.get ( 'core.foo' ), 'local' );
      t.is ( conf.get ( 'core.bar' ), 'global' );
      t.is ( conf.get ( 'core.baz' ), 'local' );
      t.is ( conf.get ( 'core.qux' ), 'defaults' );
      t.is ( conf.get ( 'core.missing' ), undefined );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.get ( 'core.flattened' ), true );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.get ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'has', it => {

    it ( 'can check all scopes data', t => {

      const conf = new Configuration ( Fixtures.options () );
      const datas = conf.has ( '*', 'core.baz' );

      t.true ( datas.defaults );
      t.true ( datas.local );
      t.false ( datas.global );

    });

    it ( 'can check a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.true ( conf.has ( 'defaults', 'core.baz' ) );
      t.true ( conf.has ( 'local', 'core.baz' ) );
      t.false ( conf.has ( 'global', 'core.baz' ) );

    });

    it ( 'can check the entire data', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.true ( conf.has ( 'core.foo' ) );
      t.true ( conf.has ( 'core.bar' ) );
      t.true ( conf.has ( 'core.baz' ) );
      t.true ( conf.has ( 'core.qux' ) );
      t.false ( conf.has ( 'core.missing' ) );

    });

    it ( 'supports undefined', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.data.none = undefined;

      t.false ( conf.has ( 'none' ) );

    });

    it ( 'supports flattened objects', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.true ( conf.has ( 'core.flattened' ) );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.has ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'scope', it => {

    it ( 'can retrive an internal scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.is ( conf.scope ( 'local' ), conf.providers[0] );
      t.is ( conf.scope ( 'global' ), conf.providers[1] );
      t.is ( conf.scope ( 'defaults' ), conf.providers[2] );
      t.is ( conf.scope ( 'missing' ), undefined );

    });

  });

  describe ( 'set', it => {

    it ( 'can set in all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.set ( '*', 'core.test', 123 );

      const datas = conf.get ( '*', 'core.test' );

      t.is ( datas.defaults, undefined );
      t.is ( datas.local, 123 );
      t.is ( datas.global, 123 );

    });

    it ( 'can set in a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.set ( 'global', 'core.test', 0 );

      t.is ( conf.get ( 'global', 'core.test' ), 0 );
      t.is ( conf.get ( 'core.test' ), 0 );

      conf.set ( 'local', 'core.test', 1 );

      t.is ( conf.get ( 'local', 'core.test' ), 1 );
      t.is ( conf.get ( 'core.test' ), 1 );

    });

    it ( 'can set in the default scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.set ( 'core.test', 0 );

      t.is ( conf.get ( 'global', 'core.test' ), 0 );
      t.is ( conf.get ( 'local', 'core.test' ), undefined );
      t.is ( conf.get ( 'core.test' ), 0 );

    });

    it ( 'can set in the first appropriate scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.set ( 'core.foo', 'test' );

      t.is ( conf.get ( 'global', 'core.foo' ), 'global' );
      t.is ( conf.get ( 'local', 'core.foo' ), 'test' );
      t.is ( conf.get ( 'core.foo' ), 'test' );

      conf.set ( 'core.bar', 'test' );

      t.is ( conf.get ( 'global', 'core.bar' ), 'test' );
      t.is ( conf.get ( 'local', 'core.bar' ), undefined );
      t.is ( conf.get ( 'core.bar' ), 'test' );

      conf.set ( 'core.qux', 'test' );

      t.is ( conf.get ( 'global', 'core.qux' ), 'test' );
      t.is ( conf.get ( 'local', 'core.qux' ), undefined );
      t.is ( conf.get ( 'core.qux' ), 'test' );

    });

    it ( 'can set while preserving the current broken data string', t => {

      const conf = new Configuration ( Fixtures.options () );

      const valuePrev = {};
      const valuePrevRaw = '\n\n{ "core": {},,, \n "broken": {} }\n\n';
      const valueNext = { core: { foo: 'asd' } };
      const valueNextRaw = `${JSON.stringify ( valueNext, undefined, '\t' )}\n\n// BACKUP (${new Date ().toLocaleString ()})\n// { "core": {},,, \n//  "broken": {} }`;

      conf.scopes.local.writeSync ( valuePrevRaw );

      t.deepEqual ( conf.scopes.local.data, valuePrev );
      t.is ( conf.scopes.local.dataRaw, valuePrevRaw );

      conf.set ( 'local', 'core.foo', 'asd' );

      t.deepEqual ( conf.scopes.local.data, valueNext );
      t.is ( conf.scopes.local.dataRaw, valueNextRaw );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.set ( 'defaults', 'core.test', 0 );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.set ( 'missing', 'foo', 0 );
      }, /unknown scopes/ );

    });

  });

  describe ( 'remove', it => {

    it ( 'can remove in all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.remove ( '*', 'core.bar' );

      const datas = conf.get ( '*', 'core.bar' );

      t.is ( datas.defaults, 'defaults' );
      t.is ( datas.local, undefined );
      t.is ( datas.global, undefined );

    });

    it ( 'can remove in a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.remove ( 'global', 'core.foo' );

      t.is ( conf.get ( 'global', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'local' );

      conf.remove ( 'local', 'core.foo' );

      t.is ( conf.get ( 'local', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'defaults' );

    });

    it ( 'will remove in all scopes by default', async t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.remove ( 'core.foo' );

      t.is ( conf.get ( 'global', 'core.foo' ), undefined );
      t.is ( conf.get ( 'local', 'core.foo' ), undefined );
      t.is ( conf.get ( 'core.foo' ), 'defaults' );

      conf.remove ( 'core.bar' );

      t.is ( conf.get ( 'global', 'core.bar' ), undefined );
      t.is ( conf.get ( 'local', 'core.bar' ), undefined );
      t.is ( conf.get ( 'core.bar' ), 'defaults' );

      conf.remove ( 'core.qux' );

      t.is ( conf.get ( 'global', 'core.qux' ), undefined );
      t.is ( conf.get ( 'local', 'core.qux' ), undefined );
      t.is ( conf.get ( 'core.qux' ), 'defaults' );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.remove ( 'defaults', 'core.test' );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.remove ( 'missing', 'foo' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'update', it => {

    it ( 'can update all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( '*', {} );

      const datas = conf.get ( '*' );

      t.false ( isEqual ( datas.defaults, {} ) );
      t.true ( isEqual ( datas.local, {} ) );
      t.true ( isEqual ( datas.global, {} ) );

    });

    it ( 'can update a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( 'global', {} );

      t.true ( isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update the default scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( {} );

      t.true ( isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update via a string', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( '{}' );

      t.true ( isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'can update via an object', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ({});

      t.true ( isEqual ( conf.get ( '*' ).global, {} ) );

    });

    it ( 'supports flattened objects (object)', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( 'local', {
        'core.foo': 'foo',
        'core.bar': 'bar'
      });

      t.is ( conf.get ( 'core.foo' ), 'foo' );
      t.is ( conf.get ( 'core.bar' ), 'bar' );
      t.is ( conf.get ( 'core.baz' ), 'defaults' );

    });

    it ( 'supports flattened objects (string)', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.update ( 'local', `{
        "core.foo": "foo",
        "core.bar": "bar"
      }`);

      t.is ( conf.get ( 'core.foo' ), 'foo' );
      t.is ( conf.get ( 'core.bar' ), 'bar' );
      t.is ( conf.get ( 'core.baz' ), 'defaults' );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.update ( 'defaults', {} );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.update ( 'missing', {} );
      }, /unknown scopes/ );

    });

  });

  describe ( 'reset', it => {

    it ( 'will reset all scopes except defaults by default', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.reset ();

      const datas = conf.get ( '*' );

      t.false ( isEqual ( datas.defaults, {} ) );
      t.true ( isEqual ( datas.local, {} ) );
      t.true ( isEqual ( datas.global, {} ) );

    });

    it ( 'can reset all scopes except defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.reset ( '*' );

      const datas = conf.get ( '*' );

      t.false ( isEqual ( datas.defaults, {} ) );
      t.true ( isEqual ( datas.local, {} ) );
      t.true ( isEqual ( datas.global, {} ) );

    });

    it ( 'can reset a scope', t => {

      const conf = new Configuration ( Fixtures.options () );

      conf.reset ( 'global' );

      const datas = conf.get ( '*' );

      t.false ( isEqual ( datas.defaults, {} ) );
      t.false ( isEqual ( datas.local, {} ) );
      t.true ( isEqual ( datas.global, {} ) );

    });

    it ( 'supports arrays', t => {

      const conf = new Configuration ( FixturesArray.options () );

      conf.reset ( 'global' );

      const datas = conf.get ( '*' );

      t.true ( isEqual ( datas.defaults, [{ foo: 'defaults' }, { foo: 'defaults2' }] ) );
      t.true ( isEqual ( datas.local, [{ foo: 'local' }, { foo: 'local', arr: [] }] ) );
      t.true ( isEqual ( datas.global, [] ) );

      conf.reset ();

      const datas2 = conf.get ( '*' );

      t.true ( isEqual ( datas2.defaults, [{ foo: 'defaults' }, { foo: 'defaults2' }] ) );
      t.true ( isEqual ( datas2.local, [] ) );
      t.true ( isEqual ( datas2.global, [] ) );

    });

    it ( 'throws when trying to change defaults', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.reset ( 'defaults' );
      }, /"defaults" scope/ );

    });

    it ( 'throws for non-existent scopes', t => {

      const conf = new Configuration ( Fixtures.options () );

      t.throws ( () => {
        conf.reset ( 'missing' );
      }, /unknown scopes/ );

    });

  });

  describe ( 'onChange', it => {

    it ( 'calls a function when a property changes', t => {

      let tests = 0;

      const conf = new Configuration ( Fixtures.options () );

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
      conf.set ( 'global', 'conf', cloneDeep ( conf.get ( 'global', 'core' ) ) );

      t.is ( tests, 3 );

    });

    it ( 'calls a function when anything changes', t => {

      let tests = 0;

      const conf = new Configuration ( Fixtures.options () );

      conf.onChange ( () => {
        tests++;
      });

      t.is ( conf.handlers.length, 1 );

      conf.set ( 'local', 'core.foo', 'test' );
      conf.set ( 'local', 'core.foo', 'test' );
      conf.set ( 'global', 'core.foo', 'test' );
      conf.set ( 'global', 'conf', cloneDeep ( conf.get ( 'global', 'core' ) ) );

      t.is ( tests, 3 );

    });

    it ( 'returns a disposer', t => {

      const conf = new Configuration ( Fixtures.options () );

      const disposer = conf.onChange ( 'core.foo', t.fail );

      disposer ();

      conf.set ( 'local', 'core.foo', 'test' );

      t.is ( conf.handlers.length, 0 );
      t.pass ();

    });

  });

  describe ( 'path swapping', it => {

    it ( 'works', t => {

      const foo = new ProviderJSON ({
        scope: 'foo',
        path: undefined,
        watch: true
      });

      const options = {
        providers: [foo],
        defaults: Fixtures.defaults (),
        filter: Fixtures.filter
      };

      const conf = new Configuration ( options );

      t.is ( conf.scopes.foo.watching, true );
      t.is ( conf.scopes.foo.watcherDisposer, undefined );

      t.is ( conf.get ( 'core.foo' ), 'defaults' );

      foo.writeSync ( Fixtures.local ().data );

      t.is ( conf.get ( 'core.foo' ), 'local' );

      foo.swap ();

      t.is ( conf.get ( 'core.foo' ), 'local' );

      const tempPath = temporaryFile ({ extension: 'json' });

      fs.writeFileSync ( tempPath, '{ "core": { "foo": "temp" } }' );

      foo.swap ( tempPath );

      t.is ( conf.scopes.foo.watching, true );
      t.is ( !!conf.scopes.foo.watcherDisposer, true );

      t.is ( conf.get ( 'core.foo' ), 'temp' );

      const tempPath2 = temporaryFile ({ extension: 'json' });

      fs.writeFileSync ( tempPath2, '{ "core": { "foo": "temp2" } }' );

      foo.swap ( tempPath2 );

      t.is ( conf.get ( 'core.foo' ), 'temp2' );

      conf.dispose ();

    });

  });

  describe ( 'path watching', it => {

    it ( 'can be disabled', t => {

      const foo = new ProviderJSON ({
        scope: 'foo',
        path: temporaryFile ({ extension: 'json' }),
        watch: false
      });

      foo.writeSync ( Fixtures.local ().data );

      const options = {
        providers: [foo],
        defaults: Fixtures.defaults (),
        filter: Fixtures.filter
      };

      const conf = new Configuration ( options );

      t.is ( conf.scopes.foo.watching, false );
      t.is ( conf.scopes.foo.watcher, undefined );

    });

    it ( 'detects when a file gets updated', async t => {

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      await delay ( 500 );

      fs.writeFileSync ( conf.scopes.global.path, JSON.stringify ({
        core: {
          bar: 'custom',
          test: 'custom'
        }
      }));

      await delay ( 1500 );

      t.is ( conf.get ( 'core.bar' ), 'custom' );
      t.is ( conf.get ( 'core.test' ), undefined );

      conf.dispose ();

    });

    it ( 'handles invalid data', async t => {

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      await delay ( 500 );

      fs.writeFileSync ( conf.scopes.global.path, '{' );

      await delay ( 1500 );

      t.is ( conf.get ( 'core.bar' ), 'defaults' );
      t.true ( isEqual ( conf.scopes.global.dataFiltered, {} ) );

      conf.dispose ();

    });

    it ( 'preserves empty contents', async t => {

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      await delay ( 500 );

      fs.writeFileSync ( conf.scopes.global.path, '' );

      await delay ( 1500 );

      t.is ( conf.get ( 'core.bar' ), 'defaults' );
      t.is ( conf.get ( 'core.test' ), undefined );
      t.is ( conf.scopes.global.dataRaw, '' );

      conf.dispose ();

    });

    it ( 'preserves the formatting in the new string', async t => {

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      await delay ( 500 );

      const dataNext = JSON.stringify ({
        core: {
          bar: 'custom',
          test: 'custom'
        }
      });

      fs.writeFileSync ( conf.scopes.global.path, dataNext );

      await delay ( 1500 );

      t.is ( conf.get ( 'core.bar' ), 'custom' );
      t.is ( conf.get ( 'core.test' ), undefined );
      t.is ( conf.scopes.global.dataRaw, dataNext );

      conf.dispose ();

    });

    it ( 'supports flattened objects (string)', async t => {

      const conf = new Configuration ( Fixtures.options ({ watch: true }) );

      await delay ( 500 );

      fs.writeFileSync ( conf.scopes.local.path, `{
        "core.foo": "foo",
        "core.bar": "bar"
      }`);

      await delay ( 1500 );

      t.is ( conf.get ( 'core.foo' ), 'foo' );
      t.is ( conf.get ( 'core.bar' ), 'bar' );
      t.is ( conf.get ( 'core.baz' ), 'defaults' );

      conf.dispose ();

    });

  });

});
