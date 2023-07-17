
/* IMPORT */

import pp from 'path-prop';

/* MAIN */

// Wrapper around path-prop, with looser returned types

const PathProp = {

  /* API */

  get: ( object: object, path: string ): any => {

    return pp.get ( object, path );

  },

  has: ( object: object, path: string ): boolean => {

    return pp.has ( object, path );

  },

  remove: ( object: object, path: string ): void => {

    pp.delete ( object, path );

  },

  set: ( object: object, path: string, value: unknown ): void => {

    pp.set ( object, path, value );

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
