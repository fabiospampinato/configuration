
/* IMPORT */

import type {ValueArray, ValueObject} from '../types';

/* MAIN */

const Type = {

  /* API */

  isArray ( value: unknown ): value is unknown[] {

    return Array.isArray ( value );

  },

  isNull ( value: unknown ): value is null {

    return value === null;

  },

  isNullary ( value: unknown ): value is (() => unknown) {

    return typeof value === 'function' && value.length === 0;

  },

  isObject ( value: unknown ): value is ValueArray | ValueObject {

    return !Type.isPrimitive ( value );

  },

  isPrimitive: ( value: unknown ): value is bigint | symbol | string | number | boolean | null | undefined => {

    if ( value === null ) return true;

    const type = typeof value;

    return type !== 'object' && type !== 'function';

  },

  isString ( value: unknown ): value is string {

    return typeof value === 'string';

  },

  isUndefined ( value: unknown ): value is undefined {

    return typeof value === 'undefined';

  }

};

/* EXPORT */

export default Type;
