
/* IMPORT */

const {default: Configuration} = require ( '../dist' ),
      {default: ProviderMemory} = require ( '../dist/providers/memory' ),
      {Fixtures} = require ( '../test/fixtures' ),
      AJV = require ( '../test/ajv' ),
      benchmark = require ( 'benchloop' );

/* HELPERS */

function getConf () {
  return new Configuration ({
    providers: [
      new ProviderMemory ({ scope: 'local' }),
      new ProviderMemory ({ scope: 'global' })
    ],
    defaults: Fixtures.defaults (),
    schema: Fixtures.schema (),
    filterer: AJV.filterer
  });
}

/* BENCHMARK */

benchmark.defaultOptions = Object.assign ( benchmark.defaultOptions, {
  iterations: 5000,
  log: 'compact',
  beforeEach: ctx => {
    ctx.conf = getConf ();
  },
  afterEach: ctx => {
    ctx.conf.dispose ();
  }
});

benchmark.group ( 'constructor', () => {

  benchmark ({
    name: 'basic',
    iterations: 1,
    fn: () => {
      new Configuration ({
        providers: [
          new ProviderMemory ({ scope: 'foo' })
        ],
        filterer: AJV.filterer
      });
    }
  });

  benchmark ({
    name: 'advanced',
    iterations: 1,
    fn: () => {
      new Configuration ({
        providers: [
          new ProviderMemory ({ scope: 'foo' })
        ],
        defaults: Fixtures.defaults (),
        schema: Fixtures.schema (),
        filterer: AJV.filterer
      });
    }
  });

  benchmark ({
    name: 'json',
    iterations: 1,
    fn: ctx => {
      ctx.conf = new Configuration ( Fixtures.options () );
    }
  });

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

benchmark.group ( 'get', () => {

  benchmark ({
    name: 'all',
    fn: ctx => {
      ctx.conf.get ();
    }
  });

  benchmark ({
    name: '*',
    fn: ctx => {
      ctx.conf.get ( '*' );
    }
  });

  benchmark ({
    name: '*:path',
    fn: ctx => {
      ctx.conf.get ( '*', 'core.foo' );
    }
  });

  benchmark ({
    name: 'scope:path',
    fn: ctx => {
      ctx.conf.get ( 'global', 'core.foo' );
    }
  });

  benchmark ({
    name: 'path',
    fn: ctx => {
      ctx.conf.get ( 'core.foo' );
    }
  });

});

benchmark.group ( 'has', () => {

  benchmark ({
    name: '*:path',
    fn: ctx => {
      ctx.conf.has ( '*', 'core.foo' );
    }
  });

  benchmark ({
    name: 'scope:path',
    fn: ctx => {
      ctx.conf.has ( 'global', 'core.foo' );
    }
  });

  benchmark ({
    name: 'path',
    fn: ctx => {
      ctx.conf.has ( 'core.foo' );
    }
  });

});

benchmark.group ( 'set', () => {

  benchmark ({
    name: '*:path',
    fn: ctx => {
      ctx.conf.set ( '*', 'core.foo', 'test' );
      ctx.conf.set ( '*', 'core.foo', 'test' );
    }
  });

  benchmark ({
    name: 'scope:path',
    fn: ctx => {
      ctx.conf.set ( 'global', 'core.foo', 'test' );
      ctx.conf.set ( 'global', 'core.foo', 'test' );
    }
  });

  benchmark ({
    name: 'path',
    fn: ctx => {
      ctx.conf.set ( 'core.foo', 'test' );
      ctx.conf.set ( 'core.foo', 'test' );
    }
  });

});

benchmark.group ( 'remove', () => {

  benchmark ({
    name: '*:path',
    fn: ctx => {
      ctx.conf.remove ( '*', 'core.foo' );
      ctx.conf.remove ( '*', 'core.foo' );
    }
  });

  benchmark ({
    name: 'scope:path',
    fn: ctx => {
      ctx.conf.remove ( 'global', 'core.foo' );
      ctx.conf.remove ( 'global', 'core.foo' );
    }
  });

  benchmark ({
    name: '*:path',
    fn: ctx => {
      ctx.conf.remove ( 'core.foo' );
      ctx.conf.remove ( 'core.foo' );
    }
  });

});

benchmark.group ( 'update', () => {

  benchmark ({
    name: '*',
    fn: ctx => {
      ctx.conf.update ( '*', {} );
    }
  });

  benchmark ({
    name: 'scope:obj',
    fn: ctx => {
      ctx.conf.update ( 'global', {} );
      ctx.conf.update ( 'global', {} );
    }
  });

  benchmark ({
    name: 'obj',
    fn: ctx => {
      ctx.conf.update ({});
      ctx.conf.update ({});
    }
  });

  benchmark ({
    name: 'str',
    fn: ctx => {
      ctx.conf.update ( '{}' );
      ctx.conf.update ( '{}' );
      ctx.conf.update ( '{ /* foo */ }' );
      ctx.conf.update ( '{ /* foo */ }' );
    }
  });

});

benchmark.group ( 'reset', () => {

  benchmark ({
    name: '*',
    fn: ctx => {
      ctx.conf.reset ( '*' );
    }
  });

  benchmark ({
    name: 'scope',
    fn: ctx => {
      ctx.conf.reset ( 'global' );
    }
  });

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

benchmark.summary ();
