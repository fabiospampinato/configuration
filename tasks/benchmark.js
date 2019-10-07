
/* IMPORT */

const {default: Configuration} = require ( '../dist' ),
      {default: ProviderMemory} = require ( '../dist/providers/memory' ),
      Fixtures = require ( '../test/fixtures' ),
      benchmark = require ( 'benchloop' );

/* HELPERS */

const {validator} = getConf ();

function getConf ( validator ) {
  return new Configuration ({
    providers: [
      new ProviderMemory ({ scope: 'local' }),
      new ProviderMemory ({ scope: 'global' })
    ],
    defaults: Fixtures.defaults,
    schema: Fixtures.schema,
    validator
  });
}

/* BENCHMARK */

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  iterations: 5000,
  log: 'compact',
  beforeEach: ctx => {
    ctx.conf = getConf ( validator );
  },
  afterEach: ctx => {
    ctx.conf.dispose ();
  }
});

benchmark ({
  name: 'constructor:basic',
  iterations: 1,
  fn: () => {
    new Configuration ({
      providers: [
        new ProviderMemory ({ scope: 'foo' })
      ]
    });
  }
});

benchmark ({
  name: 'constructor:advanced',
  iterations: 1,
  fn: () => {
    new Configuration ({
      providers: [
        new ProviderMemory ({ scope: 'foo' })
      ],
      defaults: Fixtures.defaults,
      schema: Fixtures.schema
    });
  }
});

benchmark ({
  name: 'constructor:json',
  iterations: 1,
  fn: ctx => {
    ctx.conf = new Configuration ( Fixtures.options );
  }
});

benchmark ({
  name: 'dispose',
  fn: ctx => {
    ctx.conf.dispose ();
  }
});

benchmark ({
  name: 'extend',
  iterations: 100,
  fn: ctx => {
    ctx.conf.extend ( 'ext.test', {
      defaults: {},
      schema: {
        type: 'object'
      }
    });
  }
});

benchmark ({
  name: 'refresh',
  fn: ctx => {
    ctx.conf.refresh ();
  }
});

benchmark ({
  name: 'validate',
  fn: ctx => {
    ctx.conf.validate ({
      core: {
        foo: 'foo',
        bar: 'bar',
        baz: 123
      }
    });
  }
});

benchmark ({
  name: 'get:all',
  fn: ctx => {
    ctx.conf.get ();
  }
});

benchmark ({
  name: 'get:*',
  fn: ctx => {
    ctx.conf.get ( '*' );
  }
});

benchmark ({
  name: 'get:*:path',
  fn: ctx => {
    ctx.conf.get ( '*', 'core.foo' );
  }
});

benchmark ({
  name: 'get:scope:path',
  fn: ctx => {
    ctx.conf.get ( 'global', 'core.foo' );
  }
});

benchmark ({
  name: 'get:path',
  fn: ctx => {
    ctx.conf.get ( 'core.foo' );
  }
});

benchmark ({
  name: 'has:*:path',
  fn: ctx => {
    ctx.conf.has ( '*', 'core.foo' );
  }
});

benchmark ({
  name: 'has:scope:path',
  fn: ctx => {
    ctx.conf.has ( 'global', 'core.foo' );
  }
});

benchmark ({
  name: 'has:path',
  fn: ctx => {
    ctx.conf.has ( 'core.foo' );
  }
});

benchmark ({
  name: 'set:*:path',
  fn: ctx => {
    ctx.conf.set ( '*', 'core.foo', 'test' );
    ctx.conf.set ( '*', 'core.foo', 'test' );
  }
});

benchmark ({
  name: 'set:scope:path',
  fn: ctx => {
    ctx.conf.set ( 'global', 'core.foo', 'test' );
    ctx.conf.set ( 'global', 'core.foo', 'test' );
  }
});

benchmark ({
  name: 'set:path',
  fn: ctx => {
    ctx.conf.set ( 'core.foo', 'test' );
    ctx.conf.set ( 'core.foo', 'test' );
  }
});

benchmark ({
  name: 'remove:*:path',
  fn: ctx => {
    ctx.conf.remove ( '*', 'core.foo' );
    ctx.conf.remove ( '*', 'core.foo' );
  }
});

benchmark ({
  name: 'remove:scope:path',
  fn: ctx => {
    ctx.conf.remove ( 'global', 'core.foo' );
    ctx.conf.remove ( 'global', 'core.foo' );
  }
});

benchmark ({
  name: 'remove:*:path',
  fn: ctx => {
    ctx.conf.remove ( 'core.foo' );
    ctx.conf.remove ( 'core.foo' );
  }
});

benchmark ({
  name: 'update:*',
  fn: ctx => {
    ctx.conf.update ( '*', {} );
  }
});

benchmark ({
  name: 'update:scope:obj',
  fn: ctx => {
    ctx.conf.update ( 'global', {} );
    ctx.conf.update ( 'global', {} );
  }
});

benchmark ({
  name: 'update:obj',
  fn: ctx => {
    ctx.conf.update ({});
    ctx.conf.update ({});
  }
});

benchmark ({
  name: 'update:str',
  fn: ctx => {
    ctx.conf.update ( '{}' );
    ctx.conf.update ( '{}' );
    ctx.conf.update ( '{ /* foo */ }' );
    ctx.conf.update ( '{ /* foo */ }' );
  }
});

benchmark ({
  name: 'reset:*',
  fn: ctx => {
    ctx.conf.reset ( '*' );
  }
});

benchmark ({
  name: 'reset:*',
  fn: ctx => {
    ctx.conf.reset ( '*' );
  }
});

benchmark ({
  name: 'reset:scope',
  fn: ctx => {
    ctx.conf.reset ( 'global' );
  }
});

benchmark ({
  name: 'onChange',
  fn: ctx => {
    ctx.conf.onChange ( 'core.foo', () => {} );
  }
});

benchmark ({
  name: 'triggerChange',
  beforeEach: ctx => {
    ctx.conf = getConf ();
    ctx.conf.onChange ( 'core.foo', () => {} );
    ctx.conf.onChange ( 'global', 'core.foo', () => {} );
    ctx.conf.onChange ( '*', 'core.foo', () => {} );
    ctx.conf.onChange ( '*', () => {} );
  },
  fn: ctx => {
    ctx.conf.triggerChange ();
    ctx.conf.triggerChange ( 'local', 'core.foo', 'test' );
  }
});
