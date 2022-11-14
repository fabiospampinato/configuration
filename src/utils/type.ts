
/* IMPORT */

import type {ValueArray, ValueObject} from '../types';

/* MAIN */

const Type = {

  /* API */

  isNull ( value: unknown ): value is null {

    return value === null;

  },

  isArray ( value: unknown ): value is unknown[] {

    return Array.isArray ( value );

  },

  isObject ( x: unknown ): x is ValueArray | ValueObject {

    return !Type.isPrimitive ( x );

  },

  isPrimitive: ( value: unknown ): value is bigint | symbol | string | number | boolean | null | undefined => {

    if ( value === null ) return true;

    const type = typeof value;

    return type !== 'object' && type !== 'function';

  },

  isString ( x: unknown ): x is string {

    return typeof x === 'string';

  },

  isUndefined ( x: unknown ): x is undefined {

    return typeof x === 'undefined';

  }

};

/* EXPORT */

export default Type;
