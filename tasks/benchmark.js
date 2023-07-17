
/* IMPORT */

import Configuration from '../dist/index.js';
import ProviderMemory from '../dist/providers/memory.js';
import {Fixtures} from '../test/fixtures.js';
import benchmark from 'benchloop';

/* HELPERS */

function getConf () {
  return new Configuration ({
    providers: [
      new ProviderMemory ({ scope: 'local' }),
      new ProviderMemory ({ scope: 'global' })
    ],
    defaults: Fixtures.defaults (),
    filter: Fixtures.filter
  });
}

/* BENCHMARK */

benchmark.config ({
  iterations: 5_000,
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
        defaults: {},
        filter: Fixtures.filter
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
        filter: Fixtures.filter
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
  name: 'trigger',
  beforeEach: ctx => {
    ctx.conf = getConf ();
    ctx.conf.onChange ( 'core.foo', () => {} );
    ctx.conf.onChange ( 'global', 'core.foo', () => {} );
    ctx.conf.onChange ( '*', 'core.foo', () => {} );
    ctx.conf.onChange ( '*', () => {} );
  },
  fn: ctx => {
    ctx.conf.trigger ();
    ctx.conf.trigger ( 'local', 'core.foo', 'test' );
  }
});

benchmark.summary ();
