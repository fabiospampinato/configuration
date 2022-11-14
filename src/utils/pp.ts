
/* IMPORT */

import pp from 'path-prop';

/* MAIN */

// Wrapper around path-prop, with looser typings

const PathProp = {

  /* API */

  get: ( object: object, path: string ): any => {

    return pp.get ( object, path );

  },

  set: <T extends object> ( object: T, path: string, value: unknown ): T => {

    return pp.set ( object, path, value );

  },

  delete: ( object: object, path: string ): void => {

    return pp.delete ( object, path );

  },

  has: ( object: object, path: string ): boolean => {

    return pp.has ( object, path );

  },

  flat: ( object: object, prefix?: string ): any => {

    return pp.flat ( object, prefix );

  },

  unflat: ( object: object ): any => {

    return pp.unflat ( object );

  }

};

/* EXPORT */

export default PathProp;
